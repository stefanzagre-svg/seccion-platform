import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin-client';
import { MICA_DEFAULT_PAY_CURRENCY, nowPayments } from '@/lib/nowpayments';
import { calculateCheckoutVat, normalizeCountryCode } from '@/lib/eu-tax-engine';
import { computeDualWalletDebit, resolveCreatorSplitRatio } from '@/lib/escrow-dual-ledger';
import type { WalletLedgerType } from '@/lib/sightengine';
import { z } from 'zod';

const checkoutSchema = z.object({
  subscriberId: z.string().uuid({ message: 'Invalid subscriberId UUID format' }).optional(),
  creatorId: z.string().uuid({ message: 'Invalid creatorId UUID format' }),
  tier: z.string().optional().default('member'),
  price: z.number().positive({ message: 'Price must be a positive number' }),
  type: z.enum(['subscription', 'private_call', 'tip', 'unlock']).optional().default('subscription'),
  paymentMethod: z
    .enum(['wallet', 'crypto', 'coinflow', 'open_banking', 'rewarble', 'card'])
    .optional()
    .default('wallet'),
  payCurrency: z.string().optional(),
  callId: z.string().optional(),
  duration: z.number().positive().optional(),
  country: z.string().min(2).max(4).optional(),
  postalCode: z.string().max(16).optional(),
  rating: z.enum(['SFW', 'NSFW_18']).optional(),
});

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const creatorId = url.searchParams.get('creatorId');
  const mode = url.searchParams.get('mode') || 'subscription';
  const origin = req.nextUrl.origin;

  if (!creatorId) {
    return NextResponse.redirect(`${origin}/discover`);
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(
      `${origin}/login?next=${encodeURIComponent(`/profile/${creatorId}?openCheckout=${mode}`)}`
    );
  }

  return NextResponse.redirect(`${origin}/profile/${creatorId}?openCheckout=${encodeURIComponent(mode)}`);
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.json().catch(() => null);
    const parsed = checkoutSchema.safeParse(rawBody);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid checkout parameters', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const {
      subscriberId,
      creatorId,
      tier,
      price,
      type,
      paymentMethod,
      payCurrency,
      callId,
      duration,
      country,
      postalCode,
      rating,
    } = parsed.data;

    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 });
    }

    if (subscriberId && subscriberId !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden: subscriberId must match authenticated user.' },
        { status: 403 }
      );
    }

    if (!user.email_confirmed_at) {
      return NextResponse.json(
        { error: 'Email verification required before purchasing.' },
        { status: 403 }
      );
    }

    const isNsfw =
      rating === 'NSFW_18' ||
      tier === 'nsfw_18' ||
      tier === 'explicit_stream' ||
      type === 'unlock';
    const requiredLedger: WalletLedgerType = isNsfw ? 'sovereign_red_pills' : 'sfw_credits';

    // V3.1 Ring-1 Isolation: Card / Coinflow / Open Banking cannot settle 18+ direct unlocks
    if (
      isNsfw &&
      (paymentMethod === 'card' || paymentMethod === 'coinflow' || paymentMethod === 'open_banking')
    ) {
      return NextResponse.json(
        {
          error: 'USE_MATRIX_WALLET',
          message:
            'Explicit 18+ unlocks require Sovereign Red Pills (💊) in your Wallet or MiCA Instant USDC checkout.',
          requiresMatrixPills: true,
          requiredLedger: 'sovereign_red_pills',
        },
        { status: 403 }
      );
    }

    const admin = createAdminClient();
    const origin = req.nextUrl.origin;

    if (creatorId === user.id) {
      return NextResponse.json(
        { error: 'Forbidden — cannot check out against your own creator account.' },
        { status: 400 }
      );
    }

    // Server-side authoritative price resolution (never trust client-submitted price on priced items)
    const { data: creatorProfile } = await admin
      .from('profiles')
      .select('base_subscription_price, is_approved_founder_creator, promo_90_approved_at, custom_creator_rate')
      .eq('id', creatorId)
      .maybeSingle();

    let authoritativePrice = price;
    if (type === 'subscription') {
      const basePrice = Number(creatorProfile?.base_subscription_price || 14.99);
      const tierNormalized = String(tier || 'vip').toLowerCase();
      authoritativePrice = tierNormalized === 'master' ? Number((basePrice * 2).toFixed(2)) : Number(basePrice.toFixed(2));
    } else if (type === 'private_call') {
      if (!callId) {
        return NextResponse.json({ error: 'callId is required for private_call checkout' }, { status: 400 });
      }
      const { data: callData } = await admin
        .from('call_requests')
        .select('id, member_id, creator_id, price, status, duration_minutes')
        .eq('id', callId)
        .maybeSingle();
      if (!callData || callData.member_id !== user.id || callData.creator_id !== creatorId) {
        return NextResponse.json({ error: 'Private call not found or unauthorized' }, { status: 404 });
      }
      if (Number(callData.price || 0) > 0) {
        authoritativePrice = Number(callData.price);
      }
    } else if (type === 'tip') {
      if (price < 1 || price > 5000) {
        return NextResponse.json({ error: 'Tip amount must be between €1 and €5000' }, { status: 400 });
      }
    }

    // Path A: Internal Dual-Ledger Wallet Settlement (real atomic deduction + creator earnings ledger)
    if (paymentMethod === 'wallet') {
      const creditsRequired = Math.max(1, Math.round(authoritativePrice));

      const { data: wallet } = await admin
        .from('user_wallets')
        .select('sfw_credits_balance, red_pills_balance')
        .eq('user_id', user.id)
        .single();

      const debit = computeDualWalletDebit(wallet, requiredLedger, creditsRequired);
      if (!debit.ok) {
        return NextResponse.json(
          {
            error: debit.errorCode,
            requiredLedger,
            required: creditsRequired,
            currentBalance: debit.available,
            message:
              requiredLedger === 'sfw_credits'
                ? `Insufficient SFW Studio Credits (✨). Needed: ${creditsRequired}, Available: ${debit.available}.`
                : `Insufficient 18+ Sovereign Red Pills (💊). Needed: ${creditsRequired}, Available: ${debit.available}.`,
          },
          { status: 402 }
        );
      }

      const { data: updatedWallet, error: debitErr } = await admin
        .from('user_wallets')
        .update(debit.updatePayload)
        .eq('user_id', user.id)
        .gte(debit.column, creditsRequired)
        .select(debit.column)
        .single();

      if (debitErr || !updatedWallet) {
        return NextResponse.json(
          { error: debit.column === 'sfw_credits_balance' ? 'INSUFFICIENT_SFW_CREDITS' : 'INSUFFICIENT_RED_PILLS' },
          { status: 402 }
        );
      }

      const { creatorSplitRatio, platformSplitRatio } = resolveCreatorSplitRatio(creatorProfile);
      const grossEur = Number(authoritativePrice.toFixed(2));
      const creatorShare = Number((grossEur * creatorSplitRatio).toFixed(2));
      const platformShare = Number((grossEur * platformSplitRatio).toFixed(2));

      const { error: ledgerErr } = await admin.from('creator_earnings_ledger').insert({
        creator_id: creatorId,
        fan_id: user.id,
        item_type: type,
        red_pills_gross: creditsRequired,
        gross_fiat_value: grossEur,
        gateway_toll_deducted: 0.0,
        net_pool_value: grossEur,
        creator_share_amount: creatorShare,
        platform_share_amount: platformShare,
        split_ratio_creator: creatorSplitRatio,
        split_ratio_platform: platformSplitRatio,
        status: 'credited',
      });

      if (ledgerErr) {
        await admin
          .from('user_wallets')
          .update({ [debit.column]: debit.previousBalance, updated_at: new Date().toISOString() })
          .eq('user_id', user.id);

        return NextResponse.json(
          { error: 'Failed to credit creator earnings ledger; wallet restored.' },
          { status: 500 }
        );
      }

      if (type === 'subscription') {
        const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
        await admin.from('subscriptions').upsert(
          {
            subscriber_id: user.id,
            creator_id: creatorId,
            tier,
            status: 'active',
            is_active: true,
            price_paid: grossEur,
            expires_at: expiresAt,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'subscriber_id,creator_id' }
        );
      } else if (type === 'private_call' && callId) {
        const { data: callData } = await admin
          .from('call_requests')
          .select('status, duration_minutes')
          .eq('id', callId)
          .maybeSingle();
        if (callData) {
          if (callData.status === 'awaiting_payment' || callData.status === 'pending') {
            await admin.from('call_requests').update({ status: 'paid' }).eq('id', callId);
          } else if (callData.status === 'paid' || callData.status === 'in_progress') {
            await admin
              .from('call_requests')
              .update({
                duration_minutes: Number(callData.duration_minutes || 0) + Number(duration || 15),
              })
              .eq('id', callId);
          }
        }
      }

      await admin.from('matrix_transactions').insert({
        user_id: user.id,
        transaction_type: `checkout_${type}`,
        red_pills_amount: creditsRequired,
        fiat_amount: grossEur,
        payment_method: 'internal_balance',
        status: 'completed',
        metadata: { creatorId, tier, type, requiredLedger, callId: callId || null },
      });

      return NextResponse.json({
        success: true,
        unlockedImmediately: true,
        requiredLedger,
        remainingBalance: debit.newBalance,
        creatorCreditedEur: creatorShare,
        url: `${origin}/profile/member?checkout=success&type=${type}&ledger=${requiredLedger}`,
      });
    }

    // Path B: Direct MiCA USDC Checkout via NOWPayments (Real Invoice + Geo-IP VAT Add-On)
    if (paymentMethod === 'crypto') {
      const geoCountry = normalizeCountryCode(
        req.headers.get('cf-ipcountry') || req.headers.get('x-vercel-ip-country')
      );
      const customerCountry = normalizeCountryCode(country || geoCountry || 'ES');
      const vatBreakdown = calculateCheckoutVat({
        netBaseEur: authoritativePrice,
        customerCountry,
        postalCode,
        instrumentType: 'direct_service',
        ossRegistered: process.env.SECCION_OSS_REGISTERED !== 'false',
      });

      const orderId = crypto.randomUUID();
      const selectedPayCurrency = (payCurrency || MICA_DEFAULT_PAY_CURRENCY).toLowerCase();

      const invoice = await nowPayments.createInvoice({
        priceAmount: vatBreakdown.grossTotalEur,
        priceCurrency: 'eur',
        payCurrency: selectedPayCurrency,
        orderId,
        orderDescription: `SECCION ${type.toUpperCase()} - Net €${vatBreakdown.netBaseEur.toFixed(2)} + VAT €${vatBreakdown.vatAmountEur.toFixed(2)}`,
        ipnCallbackUrl: `${origin}/api/billing/crypto/webhook`,
        successUrl: `${origin}/profile/member?checkout=success&type=${type}&order=${orderId}`,
        cancelUrl: `${origin}/profile/${creatorId}?checkout=cancelled`,
      });

      await admin.from('platform_transactions').insert({
        order_id: orderId,
        user_id: user.id,
        creator_id: creatorId,
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
        metadata: {
          orderId,
          userId: user.id,
          creatorId,
          orderType: type,
          requiredLedger,
          callId: callId || null,
        },
      });

      return NextResponse.json({
        success: true,
        unlockedImmediately: false,
        orderId,
        invoiceId: invoice.id,
        url: invoice.invoice_url,
        requiredLedger,
        vatBreakdown,
        payCurrency: invoice.pay_currency || MICA_DEFAULT_PAY_CURRENCY,
      });
    }

    // Path C: External Card / Open Banking / E-Pin rails pending live KYB activation
    return NextResponse.json(
      {
        error: 'GATEWAY_PENDING_KYB',
        requestedRail: paymentMethod,
        message:
          'Direct card & Open Banking merchant rails are undergoing Spanish S.L.U. KYB bank onboarding. Use Wallet Credits or Instant MiCA USDC checkout right now.',
      },
      { status: 503 }
    );
  } catch (err: unknown) {
    console.error('V3.1 Checkout Error:', err);
    const msg = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
