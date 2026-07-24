import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin-client';

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    let params: URLSearchParams;

    // Parse incoming data (Form URL-encoded or JSON fallback)
    try {
      if (rawBody.trim().startsWith('{')) {
        const jsonBody = JSON.parse(rawBody);
        params = new URLSearchParams(jsonBody);
      } else {
        params = new URLSearchParams(rawBody);
      }
    } catch {
      params = new URLSearchParams(rawBody);
    }

    const action = (params.get('action') || params.get('trans_action') || 'approved').toLowerCase();
    const subscriberId = params.get('extra_member_id') || params.get('member_id');
    const creatorId = params.get('extra_creator_id') || params.get('creator_id');
    const tier = params.get('extra_tier') || 'vip';
    const priceStr = params.get('approved_amount') || params.get('extra_price') || '9.99';
    const transactionId = params.get('tranid') || params.get('transaction_id') || `mock_tran_${Date.now()}`;
    const subscriptionId = params.get('purchase_id') || params.get('subscription_id') || `segpay_sub_${Date.now()}`;

    const supabase = createAdminClient();

    console.log(`[Segpay Webhook TransPost Received] Action: ${action}, Subscriber: ${subscriberId}, Creator: ${creatorId}, Amount: $${priceStr}`);

    if (action === 'approved' || action === 'sale' || action === 'rebill') {
      if (subscriberId && creatorId) {
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30); // 30-day billing period

        const pricePaid = parseFloat(priceStr);

        // 1. Record / Update active subscription in database
        const { error: subErr } = await supabase
          .from('subscriptions')
          .upsert({
            subscriber_id: subscriberId,
            creator_id: creatorId,
            tier: tier as any,
            price_paid: pricePaid,
            is_active: true,
            started_at: new Date().toISOString(),
            expires_at: expiresAt.toISOString(),
            segpay_subscription_id: subscriptionId,
            segpay_transaction_id: transactionId,
          });

        if (subErr) {
          console.error('[Segpay Webhook] Database subscription logging failed:', subErr);
          return new NextResponse('Database update failed', { status: 500 });
        }

        // 2. Log 80/20 Revenue Split (80% net to creator, 20% to SECCION)
        const netCreatorPayout = pricePaid * 0.80;
        const platformTake = pricePaid * 0.20;

        const { error: earningsErr } = await supabase.from('creator_earnings').insert({
          creator_id: creatorId,
          subscriber_id: subscriberId,
          gross_amount: pricePaid,
          net_amount: netCreatorPayout,
          platform_fee: platformTake,
          segpay_transaction_id: transactionId,
          created_at: new Date().toISOString(),
        });
        if (earningsErr) {
          console.warn('[Segpay Webhook] Optional earnings log skipped:', earningsErr.message);
        }

        // 3. Reward member with +200 connection points
        const { data: profile } = await supabase
          .from('profiles')
          .select('connection_points')
          .eq('id', subscriberId)
          .single();

        if (profile) {
          const currentPoints = profile.connection_points || 0;
          await supabase
            .from('profiles')
            .update({ connection_points: currentPoints + 200 })
            .eq('id', subscriberId);
        }
      }
    } else if (action === 'cancel' || action === 'refund' || action === 'chargeback' || action === 'declined') {
      if (subscriptionId) {
        await supabase
          .from('subscriptions')
          .update({
            is_active: false,
            updated_at: new Date().toISOString(),
          })
          .eq('segpay_subscription_id', subscriptionId);
      }
    }

    // Segpay requires simple HTTP 200 OK response
    return new NextResponse('OK', { status: 200 });

  } catch (err: any) {
    console.error('[Segpay Webhook Error]:', err);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
