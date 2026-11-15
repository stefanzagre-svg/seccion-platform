import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin-client';
import { MICA_DEFAULT_PAY_CURRENCY, nowPayments } from '@/lib/nowpayments';
import { calculateCheckoutVat, normalizeCountryCode } from '@/lib/eu-tax-engine';
import { computeDualWalletDebit } from '@/lib/escrow-dual-ledger';

const ULTIMATE_PACK_NET_EUR = 69;

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const admin = createAdminClient();
    const { data: profile } = await admin
      .from('profiles')
      .select('role, country')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'creator') {
      return NextResponse.json(
        { error: 'Only creators can purchase the Ultimate Pack' },
        { status: 403 }
      );
    }

    const rawBody = await request.json().catch(() => ({}));
    const body = (rawBody && typeof rawBody === 'object' ? rawBody : {}) as {
      paymentMethod?: 'crypto' | 'wallet';
      payCurrency?: string;
      country?: string;
      postalCode?: string;
    };

    const paymentMethod = body.paymentMethod === 'wallet' ? 'wallet' : 'crypto';
    const origin = request.nextUrl.origin;

    if (paymentMethod === 'wallet') {
      const { data: wallet } = await admin
        .from('user_wallets')
        .select('sfw_credits_balance, red_pills_balance')
        .eq('user_id', user.id)
        .single();

      const debit = computeDualWalletDebit(wallet, 'sfw_credits', ULTIMATE_PACK_NET_EUR);
      if (!debit.ok) {
        return NextResponse.json(
          {
            error: 'INSUFFICIENT_SFW_CREDITS',
            required: ULTIMATE_PACK_NET_EUR,
            currentBalance: debit.available,
            message: 'You need 69 SFW Studio Credits (✨) in your wallet or can pay via Instant USDC.',
          },
          { status: 402 }
        );
      }

      const { data: debited, error: debitErr } = await admin
        .from('user_wallets')
        .update(debit.updatePayload)
        .eq('user_id', user.id)
        .gte('sfw_credits_balance', ULTIMATE_PACK_NET_EUR)
        .select('sfw_credits_balance')
        .single();

      if (debitErr || !debited) {
        return NextResponse.json({ error: 'INSUFFICIENT_SFW_CREDITS' }, { status: 402 });
      }

      const expiresAt = new Date();
      expiresAt.setMonth(expiresAt.getMonth() + 1);

      await admin
        .from('profiles')
        .update({
          creator_ultimate_pack: true,
          creator_ultimate_pack_expires_at: expiresAt.toISOString(),
        })
        .eq('id', user.id);

      await admin.from('matrix_transactions').insert({
        user_id: user.id,
        transaction_type: 'ultimate_pack_purchase',
        red_pills_amount: ULTIMATE_PACK_NET_EUR,
        fiat_amount: ULTIMATE_PACK_NET_EUR,
        payment_method: 'internal_sfw_credits',
        status: 'completed',
        metadata: { orderType: 'ultimate_pack', requiredLedger: 'sfw_credits' },
      });

      return NextResponse.json({
        success: true,
        unlockedImmediately: true,
        expiresAt: expiresAt.toISOString(),
        url: `${origin}/studio?checkout=success&pack=ultimate`,
      });
    }

    const geoCountry = normalizeCountryCode(
      request.headers.get('cf-ipcountry') || request.headers.get('x-vercel-ip-country')
    );
    const customerCountry = normalizeCountryCode(
      body.country || geoCountry || profile.country || 'ES'
    );

    const vatBreakdown = calculateCheckoutVat({
      netBaseEur: ULTIMATE_PACK_NET_EUR,
      customerCountry,
      postalCode: body.postalCode,
      instrumentType: 'direct_service',
      ossRegistered: process.env.SECCION_OSS_REGISTERED !== 'false',
    });

    const orderId = crypto.randomUUID();
    const payCurrency = String(body.payCurrency || MICA_DEFAULT_PAY_CURRENCY).toLowerCase();

    const invoice = await nowPayments.createInvoice({
      priceAmount: vatBreakdown.grossTotalEur,
      priceCurrency: 'eur',
      payCurrency,
      orderId,
      orderDescription: `SECCION Creator Ultimate Pack - Net €${vatBreakdown.netBaseEur.toFixed(2)} + VAT €${vatBreakdown.vatAmountEur.toFixed(2)}`,
      ipnCallbackUrl: `${origin}/api/billing/crypto/webhook`,
      successUrl: `${origin}/studio?checkout=success&pack=ultimate&order=${orderId}`,
      cancelUrl: `${origin}/studio/ai-tools?checkout=cancelled`,
    });

    const meta = {
      orderId,
      userId: user.id,
      orderType: 'ultimate_pack',
      requiredLedger: 'sfw_credits',
      creditsToAdd: 0,
      netBaseEur: vatBreakdown.netBaseEur,
      vatRate: vatBreakdown.vatRate,
      vatAmountEur: vatBreakdown.vatAmountEur,
      grossTotalEur: vatBreakdown.grossTotalEur,
      customerCountry: vatBreakdown.effectiveCountry,
      taxRegime: vatBreakdown.taxRegime,
      aeatReturnForm: vatBreakdown.aeatReturnForm,
      settlementAsset: 'USDC',
    };

    await admin.from('platform_transactions').insert({
      order_id: orderId,
      user_id: user.id,
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
      metadata: meta,
    });

    return NextResponse.json({
      success: true,
      unlockedImmediately: false,
      orderId,
      invoiceId: invoice.id,
      url: invoice.invoice_url,
      vatBreakdown,
      payCurrency: invoice.pay_currency || MICA_DEFAULT_PAY_CURRENCY,
    });
  } catch (error: unknown) {
    console.error('Ultimate Pack checkout error:', error);
    const details = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Internal Server Error', details },
      { status: 500 }
    );
  }
}
