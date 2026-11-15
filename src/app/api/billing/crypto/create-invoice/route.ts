import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin-client';
import { MICA_DEFAULT_PAY_CURRENCY, nowPayments } from '@/lib/nowpayments';
import { MATRIX_PACKS } from '@/lib/matrix-packs';
import {
  calculateCheckoutVat,
  normalizeCountryCode,
  validateArt24bLocationProofs,
  type LocationProofInput,
  type VoucherInstrumentType,
} from '@/lib/eu-tax-engine';
import type { WalletLedgerType } from '@/lib/sightengine';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const {
      creatorId,
      packId,
      applyXpDiscount,
      callId,
      postId,
      tier = 'vip',
      amount,
      currency = 'eur',
      payCurrency = MICA_DEFAULT_PAY_CURRENCY,
      orderType = 'subscription',
      description,
      ledger,
      customerCountry,
      billingCountry,
      postalCode,
      instrumentType,
    } = body as {
      creatorId?: string;
      packId?: string;
      applyXpDiscount?: boolean;
      callId?: string;
      postId?: string;
      tier?: string;
      amount?: number;
      currency?: string;
      payCurrency?: string;
      orderType?: string;
      description?: string;
      ledger?: WalletLedgerType;
      creditsCount?: number;
      customerCountry?: string;
      billingCountry?: string;
      postalCode?: string;
      instrumentType?: VoucherInstrumentType;
    };

    const admin = createAdminClient();
    const isTopUpOrder = orderType === 'topup' || orderType === 'nsfw_topup';

    let netBaseEur = 0;
    let creditsToAdd = 0;
    let resolvedDescription = description;

    if (isTopUpOrder) {
      const selectedPack = MATRIX_PACKS.find((p) => p.id === packId);
      if (!selectedPack) {
        return NextResponse.json(
          { error: 'Valid packId is required for token top-up invoices' },
          { status: 400 }
        );
      }

      creditsToAdd = selectedPack.totalRedPills;
      let discountEur = 0;
      if (applyXpDiscount) {
        const { data: wallet } = await admin
          .from('user_wallets')
          .select('blue_pills_xp')
          .eq('user_id', user.id)
          .maybeSingle();
        const availableXp = Number(wallet?.blue_pills_xp || 0);
        if (availableXp >= selectedPack.maxBluePillDiscountPills && selectedPack.maxBluePillDiscountPills > 0) {
          discountEur = selectedPack.maxEuroDiscount;
        } else if (availableXp > 0 && selectedPack.maxBluePillDiscountPills > 0) {
          discountEur = Number(
            ((availableXp / selectedPack.maxBluePillDiscountPills) * selectedPack.maxEuroDiscount).toFixed(2)
          );
        }
      }
      netBaseEur = Math.max(1.0, Number((selectedPack.priceEur - discountEur).toFixed(2)));
      if (!resolvedDescription) {
        resolvedDescription = `${selectedPack.name} (${selectedPack.totalRedPills} ${
          orderType === 'nsfw_topup' ? 'Red Pills' : 'SFW Credits'
        })`;
      }
    } else if (orderType === 'subscription') {
      if (!creatorId) {
        return NextResponse.json({ error: 'creatorId is required for subscription' }, { status: 400 });
      }
      const { data: creatorProf } = await admin
        .from('profiles')
        .select('base_subscription_price')
        .eq('id', creatorId)
        .maybeSingle();
      const basePrice = Number(creatorProf?.base_subscription_price || 14.99);
      const multiplier = String(tier).toLowerCase() === 'master' ? 2 : 1;
      netBaseEur = Math.max(1.0, Number((basePrice * multiplier).toFixed(2)));
      creditsToAdd = Math.max(1, Math.round(netBaseEur));
    } else if (orderType === 'private_call' && callId) {
      const { data: callRow } = await admin
        .from('call_requests')
        .select('price, member_id')
        .eq('id', callId)
        .maybeSingle();
      if (!callRow || callRow.member_id !== user.id) {
        return NextResponse.json({ error: 'Private call request not found or unauthorized' }, { status: 404 });
      }
      netBaseEur = Math.max(1.0, Number(callRow.price || 15.0));
      creditsToAdd = Math.max(1, Math.round(netBaseEur));
    } else if (orderType === 'unlock' && postId) {
      const { data: postRow } = await admin
        .from('platform_content')
        .select('price')
        .eq('id', postId)
        .maybeSingle();
      netBaseEur = Math.max(1.0, Number(postRow?.price || 4.99));
      creditsToAdd = Math.max(1, Math.round(netBaseEur));
    } else {
      const requested = Number(amount || 0);
      if (!Number.isFinite(requested) || requested < 1 || requested > 5000) {
        return NextResponse.json({ error: 'Valid amount between €1 and €5000 is required' }, { status: 400 });
      }
      netBaseEur = Number(requested.toFixed(2));
      creditsToAdd = Math.max(1, Math.round(netBaseEur));
    }

    const geoCountry = normalizeCountryCode(
      req.headers.get('cf-ipcountry') || req.headers.get('x-vercel-ip-country')
    );
    const declaredCountry = normalizeCountryCode(customerCountry || billingCountry || geoCountry || 'ES');

    const proofs: LocationProofInput[] = [];
    if (geoCountry) proofs.push({ type: 'geo_ip', countryCode: geoCountry });
    if (billingCountry) proofs.push({ type: 'billing_address', countryCode: normalizeCountryCode(billingCountry) });
    if (proofs.length < 2 && declaredCountry) {
      proofs.push({ type: 'other_commercial', countryCode: declaredCountry });
    }

    const art24b = validateArt24bLocationProofs(declaredCountry, proofs);
    const resolvedLedger: WalletLedgerType =
      ledger === 'sovereign_red_pills' || orderType === 'nsfw_topup'
        ? 'sovereign_red_pills'
        : 'sfw_credits';

    const vatBreakdown = calculateCheckoutVat({
      netBaseEur,
      customerCountry: art24b.resolvedCountry,
      postalCode,
      instrumentType: instrumentType || (orderType === 'topup' ? 'spv' : 'direct_service'),
      ossRegistered: process.env.SECCION_OSS_REGISTERED !== 'false',
    });

    const orderId = crypto.randomUUID();
    const origin = req.nextUrl.origin;

    const invoice = await nowPayments.createInvoice({
      priceAmount: vatBreakdown.grossTotalEur,
      priceCurrency: String(currency || 'eur').toLowerCase(),
      payCurrency: String(payCurrency || MICA_DEFAULT_PAY_CURRENCY).toLowerCase(),
      orderId,
      orderDescription:
        resolvedDescription ||
        `SECCION ${orderType.toUpperCase()} - Net €${vatBreakdown.netBaseEur.toFixed(2)} + VAT €${vatBreakdown.vatAmountEur.toFixed(2)}`,
      ipnCallbackUrl: `${origin}/api/billing/crypto/webhook`,
      successUrl: `${origin}/dashboard?payment=crypto_success&order=${orderId}`,
      cancelUrl: `${origin}/dashboard?payment=crypto_cancelled`,
    });

    const txMetadata = {
      orderId,
      invoiceId: invoice.id,
      creatorId: creatorId || null,
      orderType,
      callId: callId || null,
      postId: postId || null,
      tier,
      requiredLedger: resolvedLedger,
      creditsToAdd,
      netBaseEur: vatBreakdown.netBaseEur,
      vatRate: vatBreakdown.vatRate,
      vatAmountEur: vatBreakdown.vatAmountEur,
      grossTotalEur: vatBreakdown.grossTotalEur,
      customerCountry: vatBreakdown.effectiveCountry,
      taxRegime: vatBreakdown.taxRegime,
      aeatReturnForm: vatBreakdown.aeatReturnForm,
      payCurrency: String(payCurrency || MICA_DEFAULT_PAY_CURRENCY).toLowerCase(),
      settlementAsset: 'USDC',
    };

    const { error: matrixErr } = await admin.from('matrix_transactions').insert({
      user_id: user.id,
      transaction_type: `crypto_${orderType}`,
      red_pills_amount: creditsToAdd,
      fiat_amount: vatBreakdown.grossTotalEur,
      payment_method: `nowpayments_${String(payCurrency || MICA_DEFAULT_PAY_CURRENCY).toLowerCase()}`,
      status: 'pending',
      metadata: txMetadata,
    });

    if (matrixErr) {
      console.warn('[Crypto Invoice] Pending matrix_transactions note:', matrixErr.message);
    }

    const { error: ptErr } = await admin.from('platform_transactions').insert({
      order_id: orderId,
      user_id: user.id,
      creator_id: creatorId || null,
      provider: 'nowpayments',
      provider_payment_id: String(invoice.id),
      amount: vatBreakdown.grossTotalEur,
      net_base_eur: vatBreakdown.netBaseEur,
      vat_rate: vatBreakdown.vatRate,
      vat_amount_eur: vatBreakdown.vatAmountEur,
      gross_total_eur: vatBreakdown.grossTotalEur,
      customer_country: vatBreakdown.effectiveCountry,
      tax_regime: vatBreakdown.taxRegime,
      aeat_return_form: vatBreakdown.aeatReturnForm,
      settlement_asset: 'USDC',
      currency: 'EUR',
      status: 'pending',
      metadata: txMetadata,
    });

    if (ptErr) {
      console.warn('[Crypto Invoice] Pending platform_transactions note:', ptErr.message);
    }

    const proof1 = proofs[0] || { type: 'other_commercial', countryCode: art24b.resolvedCountry };
    const proof2 = proofs[1] || null;
    await admin
      .from('tax_location_proofs')
      .insert({
        user_id: user.id,
        order_id: orderId,
        declared_country: declaredCountry,
        resolved_country: art24b.resolvedCountry,
        proof_1_type: proof1.type,
        proof_1_country: proof1.countryCode,
        proof_2_type: proof2?.type || null,
        proof_2_country: proof2?.countryCode || null,
        extra_proofs: proofs,
        valid_art24b: art24b.valid,
        art70_dos_triggered: art24b.art70DosSpainPresumptionTriggered,
        retain_until: art24b.retainUntilIso,
      })
      .then(({ error }) => {
        if (error) console.warn('[Crypto Invoice] tax_location_proofs note:', error.message);
      });

    return NextResponse.json({
      success: true,
      invoiceId: invoice.id,
      invoiceUrl: invoice.invoice_url,
      orderId,
      payCurrency: invoice.pay_currency || MICA_DEFAULT_PAY_CURRENCY,
      vatBreakdown,
      art24b: {
        valid: art24b.valid,
        resolvedCountry: art24b.resolvedCountry,
        retainUntilIso: art24b.retainUntilIso,
      },
    });
  } catch (error: unknown) {
    console.error('Error creating NOWPayments invoice:', error);
    const msg = error instanceof Error ? error.message : 'Failed to initialize crypto payment';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
