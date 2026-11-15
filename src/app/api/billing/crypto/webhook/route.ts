import { NextRequest, NextResponse } from 'next/server';
import { nowPayments, NOWPaymentsIPNPayload } from '@/lib/nowpayments';
import { createAdminClient } from '@/lib/supabase/admin-client';
import { resolveCreatorSplitRatio } from '@/lib/escrow-dual-ledger';
import type { WalletLedgerType } from '@/lib/sightengine';

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-nowpayments-sig') || '';

    // 1. Verify HMAC-SHA512 Signature (preserve exact 401/403 status codes & errors)
    if (!signature) {
      console.warn('[NOWPayments IPN] Missing x-nowpayments-sig header');
      return NextResponse.json({ error: 'Missing signature' }, { status: 401 });
    }

    const isValid = nowPayments.verifyIPNSignature(rawBody, signature);
    if (!isValid) {
      console.warn('[NOWPayments IPN] Invalid HMAC signature rejected');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 403 });
    }

    let payload: NOWPaymentsIPNPayload;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: 'Malformed JSON payload' }, { status: 400 });
    }

    console.info(
      `[NOWPayments IPN] Received payment status ${payload.payment_status} for order ${payload.order_id}`
    );

    if (payload.payment_status !== 'confirmed' && payload.payment_status !== 'finished') {
      return NextResponse.json({ received: true, status: payload.payment_status });
    }

    const supabaseAdmin = createAdminClient();
    const orderId = String(payload.order_id || '');

    // 2. Load pending transaction metadata + VAT / Art. 24b snapshot
    const { data: existingTx } = await supabaseAdmin
      .from('platform_transactions')
      .select('*')
      .eq('order_id', orderId)
      .maybeSingle();

    if (existingTx?.status === 'completed') {
      return NextResponse.json({
        success: true,
        processed: false,
        idempotentDuplicate: true,
        orderId,
      });
    }

    const txMeta = (existingTx?.metadata || {}) as Record<string, unknown>;
    const userId =
      (typeof existingTx?.user_id === 'string' && existingTx.user_id) ||
      (typeof txMeta.userId === 'string' ? txMeta.userId : null);
    const creatorId =
      (typeof existingTx?.creator_id === 'string' && existingTx.creator_id) ||
      (typeof txMeta.creatorId === 'string' ? txMeta.creatorId : null);

    const grossPaidEur = Number(
      existingTx?.gross_total_eur ?? payload.price_amount ?? 0
    );
    const vatAmountEur = Number(existingTx?.vat_amount_eur ?? txMeta.vatAmountEur ?? 0);
    const netBaseEur = Number(
      existingTx?.net_base_eur ??
        txMeta.netBaseEur ??
        Math.max(0, grossPaidEur - vatAmountEur)
    );
    const vatRate = Number(existingTx?.vat_rate ?? txMeta.vatRate ?? 0);
    const customerCountry = String(
      existingTx?.customer_country || txMeta.customerCountry || 'ES'
    );
    const taxRegime = String(
      existingTx?.tax_regime || txMeta.taxRegime || 'ES_DOMESTIC_IVA'
    );
    const aeatReturnForm = String(
      existingTx?.aeat_return_form || txMeta.aeatReturnForm || 'Modelo 303'
    );
    const requiredLedger: WalletLedgerType =
      txMeta.requiredLedger === 'sovereign_red_pills'
        ? 'sovereign_red_pills'
        : 'sfw_credits';
    const orderType = String(txMeta.orderType || 'topup');
    const creditsToAdd = Number(
      txMeta.creditsToAdd ?? Math.max(0, Math.round(netBaseEur))
    );

    // Determine 90% (Year-1 Founding) vs 80% (Standard / Post-Year-1) split via canonical helper
    let creatorSplitRatio = 0.8;
    let platformSplitRatio = 0.2;
    if (creatorId) {
      const { data: creatorProf } = await supabaseAdmin
        .from('profiles')
        .select('is_approved_founder_creator, promo_90_approved_at, custom_creator_rate')
        .eq('id', creatorId)
        .maybeSingle();
      const resolved = resolveCreatorSplitRatio(creatorProf);
      creatorSplitRatio = resolved.creatorSplitRatio;
      platformSplitRatio = resolved.platformSplitRatio;
    }

    const split = nowPayments.calculateMicaNetBaseSplit({
      grossPaidEur,
      vatAmountEur,
      creatorSplitRatio,
    });

    const enrichedMeta = {
      ...txMeta,
      actually_paid: payload.actually_paid,
      pay_address: payload.pay_address,
      purchase_id: payload.purchase_id,
      pay_currency: payload.pay_currency,
      settlementAsset: 'USDC',
      split,
    };

    // 3. Atomic RPC Settlement when userId exists (credits user_wallets + completes ledger rows idempotently)
    let settledViaRpc = false;
    if (userId && (orderType === 'topup' || orderType === 'nsfw_topup' || creditsToAdd > 0)) {
      const rpcRes = await supabaseAdmin.rpc('credit_wallet_for_order', {
        p_order_id: orderId,
        p_user_id: userId,
        p_credits_to_add: orderType === 'topup' || orderType === 'nsfw_topup' ? creditsToAdd : 0,
        p_ledger: requiredLedger,
        p_provider: 'nowpayments',
        p_provider_payment_id: String(payload.payment_id),
        p_net_base_eur: netBaseEur,
        p_vat_rate: vatRate,
        p_vat_amount_eur: vatAmountEur,
        p_gross_total_eur: grossPaidEur,
        p_customer_country: customerCountry,
        p_tax_regime: taxRegime,
        p_aeat_return_form: aeatReturnForm,
        p_settlement_asset: 'USDC',
        p_metadata: enrichedMeta,
      });

      if (!rpcRes.error && rpcRes.data) {
        const d = rpcRes.data as Record<string, unknown>;
        if (d.idempotent_duplicate === true) {
          return NextResponse.json({
            success: true,
            processed: false,
            idempotentDuplicate: true,
            orderId,
          });
        }
        settledViaRpc = d.success === true;
      }
    }

    if (!settledViaRpc) {
      // Fallback: update platform_transactions + user_wallets directly via admin client
      const { error: upsertErr } = await supabaseAdmin
        .from('platform_transactions')
        .upsert(
          {
            order_id: orderId,
            user_id: userId,
            creator_id: creatorId,
            provider: 'nowpayments',
            provider_payment_id: String(payload.payment_id),
            amount: grossPaidEur,
            net_base_eur: netBaseEur,
            vat_rate: vatRate,
            vat_amount_eur: vatAmountEur,
            gross_total_eur: grossPaidEur,
            customer_country: customerCountry,
            tax_regime: taxRegime,
            aeat_return_form: aeatReturnForm,
            settlement_asset: 'USDC',
            currency: 'EUR',
            status: 'completed',
            metadata: enrichedMeta,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'order_id' }
        );

      if (upsertErr) {
        console.warn('[NOWPayments IPN] Transaction ledger upsert note:', upsertErr.message);
      }

      if (userId && (orderType === 'topup' || orderType === 'nsfw_topup')) {
        const col =
          requiredLedger === 'sovereign_red_pills'
            ? 'red_pills_balance'
            : 'sfw_credits_balance';
        const { data: wallet } = await supabaseAdmin
          .from('user_wallets')
          .select('sfw_credits_balance, red_pills_balance, blue_pills_xp')
          .eq('user_id', userId)
          .maybeSingle();

        const currBal = Number(wallet?.[col] ?? 0);
        const currXp = Number(wallet?.blue_pills_xp ?? 0);
        await supabaseAdmin.from('user_wallets').upsert(
          {
            user_id: userId,
            [col]: currBal + creditsToAdd,
            blue_pills_xp: currXp + creditsToAdd,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id' }
        );
      }

      if (userId) {
        await supabaseAdmin
          .from('matrix_transactions')
          .update({ status: 'completed', metadata: enrichedMeta })
          .eq('user_id', userId)
          .eq('status', 'pending')
          .contains('metadata', { orderId });
      }
    }

    // 4. Activate downstream subscriptions / entitlements / calls / creator earnings when applicable
    if (orderType === 'subscription' && userId && creatorId) {
      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
      const subTier = typeof txMeta.tier === 'string' && txMeta.tier.trim() ? txMeta.tier.trim() : 'vip';
      await supabaseAdmin.from('subscriptions').upsert(
        {
          subscriber_id: userId,
          creator_id: creatorId,
          tier: subTier,
          status: 'active',
          is_active: true,
          price_paid: grossPaidEur,
          expires_at: expiresAt,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'subscriber_id,creator_id' }
      );
    } else if (orderType === 'ultimate_pack' && userId) {
      const expiresAt = new Date();
      expiresAt.setMonth(expiresAt.getMonth() + 1);
      await supabaseAdmin
        .from('profiles')
        .update({
          creator_ultimate_pack: true,
          creator_ultimate_pack_expires_at: expiresAt.toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);
    } else if (orderType === 'private_call' && typeof txMeta.callId === 'string' && txMeta.callId) {
      await supabaseAdmin
        .from('call_requests')
        .update({ status: 'paid' })
        .eq('id', txMeta.callId);
    }

    if (creatorId && orderType !== 'topup' && orderType !== 'nsfw_topup') {
      await supabaseAdmin.from('creator_earnings_ledger').insert({
        creator_id: creatorId,
        fan_id: userId,
        item_type: orderType,
        red_pills_gross: Math.round(netBaseEur),
        gross_fiat_value: netBaseEur,
        gateway_toll_deducted: split.processorFee,
        net_pool_value: split.netDistributableEur,
        creator_share_amount: split.creatorShare,
        platform_share_amount: split.platformShare,
        split_ratio_creator: creatorSplitRatio,
        split_ratio_platform: platformSplitRatio,
        status: 'credited',
      });
    }

    return NextResponse.json({
      success: true,
      processed: true,
      orderId,
      settlementAsset: 'USDC',
      split,
    });
  } catch (error: unknown) {
    console.error('Error processing NOWPayments IPN webhook:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
