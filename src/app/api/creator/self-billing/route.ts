import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin-client';
import {
  buildVerifactuInvoiceRecord,
  classifyCreatorSelfBillingTax,
  evaluateDac7Readiness,
  normalizeCountryCode,
  SECCION_FISCAL_ENTITY,
} from '@/lib/eu-tax-engine';

const selfBillActionSchema = z.object({
  action: z.enum(['sign_mandate', 'preview', 'issue_self_bill']).default('preview'),
  grossCreatorShareEur: z.number().nonnegative().max(1_000_000).optional(),
  creatorCountry: z.string().min(2).max(4).optional(),
  legalFullName: z.string().min(2).max(160).optional(),
  taxIdNifVat: z.string().min(4).max(40).optional(),
  dateOfBirth: z.string().optional(),
  permanentAddress: z.string().optional(),
  financialAccountIdentifier: z.string().optional(),
  viesValidatedVatId: z.boolean().optional(),
  servicesRenderedOutsideSpain: z.boolean().optional(),
  taxResidencyCertOnFile: z.boolean().optional(),
  newAutonomo7PctEligible: z.boolean().optional(),
  mandateSigned: z.boolean().optional(),
});

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authErr,
    } = await supabase.auth.getUser();

    if (authErr || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const admin = createAdminClient();

    const [{ data: settings }, { data: profile }, { data: invoices }, { data: earnings }] =
      await Promise.all([
        admin
          .from('creator_payout_settings')
          .select('*')
          .eq('creator_id', user.id)
          .maybeSingle(),
        admin
          .from('profiles')
          .select('full_name, display_name, country')
          .eq('id', user.id)
          .maybeSingle(),
        admin
          .from('creator_self_bill_invoices')
          .select('*')
          .eq('creator_id', user.id)
          .order('issued_at', { ascending: false })
          .limit(20),
        admin
          .from('creator_earnings_ledger')
          .select('creator_share_amount, platform_share_amount, status')
          .eq('creator_id', user.id)
          .eq('status', 'credited'),
      ]);

    const availableNetEur = (earnings || []).reduce(
      (acc: number, row: { creator_share_amount?: number | string | null }) =>
        acc + Number(row.creator_share_amount || 0),
      0
    );
    const platformFeesEur = (earnings || []).reduce(
      (acc: number, row: { platform_share_amount?: number | string | null }) =>
        acc + Number(row.platform_share_amount || 0),
      0
    );

    const country = normalizeCountryCode(
      settings?.tax_residence_country || profile?.country || 'ES'
    );
    const legalName =
      profile?.full_name || profile?.display_name || user.email || 'Creator';
    const mandateSigned = Boolean(settings?.mandate_autofacturacion_signed);

    const previewTax = classifyCreatorSelfBillingTax({
      creatorId: user.id,
      creatorLegalName: legalName,
      creatorTaxId: settings?.tax_id_nif_vat || '',
      creatorCountry: country,
      grossCreatorShareEur: availableNetEur,
      mandateSigned,
      newAutonomo7PctEligible: Boolean(settings?.new_autonomo_7pct_eligible),
      viesValidatedVatId: Boolean(settings?.vies_validated),
      servicesRenderedOutsideSpain: country !== 'ES',
      taxResidencyCertOnFile: Boolean(settings?.tax_residency_cert_on_file),
    });

    const dac7 = evaluateDac7Readiness({
      creatorId: user.id,
      legalFullName: legalName,
      dateOfBirth: null,
      taxResidenceCountry: country,
      tinOrNif: settings?.tax_id_nif_vat || null,
      tinIssuingCountry: country,
      permanentAddress: null,
      financialAccountIdentifier:
        settings?.sepa_iban ||
        settings?.iban ||
        settings?.morocco_rib ||
        settings?.crypto_wallet_address ||
        settings?.crypto_address ||
        null,
      quarterlyConsiderationPaidEur: availableNetEur,
      platformFeesWithheldEur: platformFeesEur,
      taxesWithheldEur: previewTax.irpfOrIrnrWithholdingEur,
    });

    return NextResponse.json({
      success: true,
      entity: SECCION_FISCAL_ENTITY,
      mandateSigned,
      availableNetEur,
      previewTax,
      dac7,
      invoices: invoices || [],
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to inspect self-billing status';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authErr,
    } = await supabase.auth.getUser();

    if (authErr || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const parsed = selfBillActionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid self-billing request', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const admin = createAdminClient();

    const { data: settings } = await admin
      .from('creator_payout_settings')
      .select('*')
      .eq('creator_id', user.id)
      .maybeSingle();

    const resolvedCountry = normalizeCountryCode(
      data.creatorCountry || settings?.tax_residence_country || 'ES'
    );
    const resolvedTaxId = (data.taxIdNifVat || settings?.tax_id_nif_vat || '').trim();
    const nowIso = new Date().toISOString();

    if (data.action === 'sign_mandate') {
      const upsertPayload: Record<string, unknown> = {
        creator_id: user.id,
        mandate_autofacturacion_signed: true,
        mandate_signed_at: nowIso,
        tax_residence_country: resolvedCountry,
        updated_at: nowIso,
      };
      if (resolvedTaxId) upsertPayload.tax_id_nif_vat = resolvedTaxId;
      if (typeof data.newAutonomo7PctEligible === 'boolean') {
        upsertPayload.new_autonomo_7pct_eligible = data.newAutonomo7PctEligible;
      }

      const { error: upsertErr } = await admin
        .from('creator_payout_settings')
        .upsert(upsertPayload, { onConflict: 'creator_id' });

      if (upsertErr) {
        return NextResponse.json(
          { error: 'Could not store Autofacturacion mandate: ' + upsertErr.message },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        action: 'sign_mandate',
        mandateSigned: true,
        signedAt: nowIso,
        regulation: 'RD 1619/2012 Art. 5 (Acuerdo previo de facturacion por el destinatario)',
      });
    }

    const mandateSigned =
      data.mandateSigned ?? Boolean(settings?.mandate_autofacturacion_signed);

    // Derive authoritatively from un-invoiced credited rows in creator_earnings_ledger
    const { data: unbilledRows } = await admin
      .from('creator_earnings_ledger')
      .select('id, creator_share_amount, platform_share_amount')
      .eq('creator_id', user.id)
      .eq('status', 'credited');

    const unbilledIds = (unbilledRows || []).map((r: { id: string }) => r.id).filter(Boolean);
    const serverAvailableNetEur = Number(
      (unbilledRows || [])
        .reduce(
          (acc: number, row: { creator_share_amount?: number | string | null }) =>
            acc + Number(row.creator_share_amount || 0),
          0
        )
        .toFixed(2)
    );
    const serverPlatformFeesEur = Number(
      (unbilledRows || [])
        .reduce(
          (acc: number, row: { platform_share_amount?: number | string | null }) =>
            acc + Number(row.platform_share_amount || 0),
          0
        )
        .toFixed(2)
    );
    const grossShareEur =
      data.action === 'issue_self_bill'
        ? serverAvailableNetEur
        : serverAvailableNetEur > 0
          ? serverAvailableNetEur
          : Number(data.grossCreatorShareEur ?? 0);

    const legalName = data.legalFullName || user.email || 'Creator';

    const taxBreakdown = classifyCreatorSelfBillingTax({
      creatorId: user.id,
      creatorLegalName: legalName,
      creatorTaxId: resolvedTaxId,
      creatorCountry: resolvedCountry,
      grossCreatorShareEur: grossShareEur,
      mandateSigned,
      newAutonomo7PctEligible:
        data.newAutonomo7PctEligible ?? Boolean(settings?.new_autonomo_7pct_eligible),
      viesValidatedVatId:
        data.viesValidatedVatId ?? Boolean(settings?.vies_validated),
      servicesRenderedOutsideSpain:
        data.servicesRenderedOutsideSpain ?? resolvedCountry !== 'ES',
      taxResidencyCertOnFile:
        data.taxResidencyCertOnFile ?? Boolean(settings?.tax_residency_cert_on_file),
    });

    const dac7 = evaluateDac7Readiness({
      creatorId: user.id,
      legalFullName: data.legalFullName,
      dateOfBirth: data.dateOfBirth,
      taxResidenceCountry: resolvedCountry,
      tinOrNif: resolvedTaxId,
      tinIssuingCountry: resolvedCountry,
      permanentAddress: data.permanentAddress,
      financialAccountIdentifier:
        data.financialAccountIdentifier ||
        settings?.sepa_iban ||
        settings?.iban ||
        settings?.morocco_rib ||
        settings?.crypto_wallet_address ||
        settings?.crypto_address ||
        null,
      quarterlyConsiderationPaidEur: grossShareEur,
      platformFeesWithheldEur:
        serverPlatformFeesEur > 0
          ? serverPlatformFeesEur
          : Number(((grossShareEur / 0.9) * 0.1).toFixed(2)),
      taxesWithheldEur: taxBreakdown.irpfOrIrnrWithholdingEur,
    });

    if (data.action === 'preview') {
      return NextResponse.json({
        success: true,
        action: 'preview',
        taxBreakdown,
        dac7,
      });
    }

    // action === 'issue_self_bill'
    if (!taxBreakdown.eligibleToIssue) {
      return NextResponse.json(
        {
          error:
            taxBreakdown.blockReason ||
            'Signed Autofacturacion mandate (Art. 5 RD 1619/2012) required before issuance.',
          taxBreakdown,
        },
        { status: 400 }
      );
    }

    if (grossShareEur <= 0) {
      return NextResponse.json(
        { error: 'grossCreatorShareEur must be greater than 0 to issue a self-bill invoice.' },
        { status: 400 }
      );
    }

    const { data: prevInvoice } = await admin
      .from('creator_self_bill_invoices')
      .select('sha256_hash')
      .order('issued_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    const now = new Date();
    const seriesNum = `AF-${now.getUTCFullYear()}-${user.id.slice(0, 6).toUpperCase()}-${Date.now()
      .toString()
      .slice(-6)}`;

    const verifactu = buildVerifactuInvoiceRecord({
      invoiceSeriesNumber: seriesNum,
      issueDate: now,
      invoiceType: 'F1',
      totalTaxEur: taxBreakdown.vatAddedEur,
      totalAmountEur: taxBreakdown.netCashPayoutEur,
      previousHash: prevInvoice?.sha256_hash || '',
      generationTimestampIso: now.toISOString(),
    });

    const { data: inserted, error: insertErr } = await admin
      .from('creator_self_bill_invoices')
      .insert({
        creator_id: user.id,
        invoice_series_number: seriesNum,
        domicile: taxBreakdown.domicile,
        net_taxable_base_eur: taxBreakdown.netTaxableBaseEur,
        vat_added_rate: taxBreakdown.vatAddedRate,
        vat_added_eur: taxBreakdown.vatAddedEur,
        reverse_charge_vat_eur: taxBreakdown.reverseChargeSelfAssessedVatEur,
        irpf_or_irnr_rate: taxBreakdown.irpfOrIrnrWithholdingRate,
        irpf_or_irnr_withheld_eur: taxBreakdown.irpfOrIrnrWithholdingEur,
        net_cash_payout_eur: taxBreakdown.netCashPayoutEur,
        mandatory_legend: taxBreakdown.mandatoryInvoiceLegend,
        aeat_forms: taxBreakdown.aeatReportingForms,
        previous_hash: verifactu.previousHash,
        sha256_hash: verifactu.sha256Hash,
        aeat_qr_url: verifactu.aeatQrUrl,
        verifactu_payload: verifactu,
        dac7_ready: dac7.readyForModelo238,
        issued_at: now.toISOString(),
      })
      .select()
      .single();

    if (insertErr) {
      // Return computed statutory artifact even if DB table migration hasn't been executed on remote yet
      return NextResponse.json({
        success: true,
        persisted: false,
        warning: insertErr.message,
        invoiceSeriesNumber: seriesNum,
        taxBreakdown,
        dac7,
        verifactu,
      });
    }

    if (unbilledIds.length > 0) {
      await admin
        .from('creator_earnings_ledger')
        .update({ status: 'self_billed' })
        .in('id', unbilledIds);
    }

    return NextResponse.json({
      success: true,
      persisted: true,
      invoice: inserted,
      taxBreakdown,
      dac7,
      verifactu,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Self-billing operation failed';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
