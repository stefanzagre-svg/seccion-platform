import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin-client';

/**
 * Segpay Postback Endpoint
 * Receives server-to-server notifications from Segpay.
 * Fields usually sent by Segpay:
 * action: auth, void, chargeback, rebill, cancel
 * tranid: transaction ID
 * custom1: subscriberId
 * custom2: creatorId
 * custom3: tier
 * price: amount
 * trantype: SALE, etc.
 */
export async function POST(req: NextRequest) {
  try {
    // Segpay typically sends data as form urlencoded
    const text = await req.text();
    const data = new URLSearchParams(text);

    const action = data.get('action');
    const subscriberId = data.get('custom1');
    const creatorId = data.get('custom2');
    const tier = data.get('custom3');
    const tranid = data.get('tranid');
    const price = data.get('price');

    // Basic validation
    if (!action || !subscriberId || !creatorId || !tier) {
      return NextResponse.json({ error: 'Missing necessary custom tracking parameters' }, { status: 400 });
    }

    // TODO: Verify Segpay Postback Security Hash if enabled in Merchant Portal
    // const hash = data.get('hash');
    // const secret = process.env.SEGPAY_POSTBACK_SECRET;
    // ... verification logic ...

    const adminClient = createAdminClient();

    if (action === 'auth' || action === 'rebill') {
      const isPrivateCall = tier === 'private_call';

      if (isPrivateCall) {
        const callId = data.get('custom4');
        if (callId) {
          // It's a private call payment (initial or extension)
          const { data: callData, error: fetchErr } = await adminClient
            .from('call_requests')
            .select('status, duration_minutes')
            .eq('id', callId)
            .single();

          if (callData) {
            if (callData.status === 'awaiting_payment' || callData.status === 'pending') {
              // Initial payment
              await adminClient.from('call_requests').update({ status: 'paid' }).eq('id', callId);
              console.log(`[Segpay] Marked call ${callId} as PAID`);
            } else if (callData.status === 'paid' || callData.status === 'in_progress') {
              // Extension
              // Determine how much duration was bought.
              // Since Segpay postback doesn't easily pass the exact extension duration without another custom field,
              // we can infer it from the price, or we can just pass the extension duration in custom5.
              // For now, let's assume if it hits here while in progress, we default to adding 15 mins
              // Alternatively, we can pass duration in custom5. Let's assume custom5 has duration.
              const extDur = parseInt(data.get('custom5') || '15', 10);
              await adminClient.from('call_requests').update({ 
                duration_minutes: callData.duration_minutes + extDur 
              }).eq('id', callId);
              console.log(`[Segpay] Extended call ${callId} by ${extDur} minutes`);
            }
          }

          // Log interaction
          await adminClient.from('interactions').insert({
            actor_id: subscriberId,
            target_id: creatorId,
            interaction_type: 'private_call_payment',
            financial_amount: parseFloat(price || '0'),
            metadata: { tranid, processor: 'segpay', callId }
          });
        }
      } else {
        // Upsert Subscription
        const { error: subError } = await adminClient
          .from('subscriptions')
          .upsert({
            subscriber_id: subscriberId,
            creator_id: creatorId,
            tier: tier,
            status: 'active',
            current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // +30 days approx
          });

        if (subError) throw subError;

        // Log Interaction (financial)
        await adminClient
          .from('interactions')
          .insert({
            actor_id: subscriberId,
            target_id: creatorId,
            interaction_type: 'subscription',
            financial_amount: parseFloat(price || '0'),
            metadata: { tranid, processor: 'segpay', action }
          });
      }

      const maskedSub = subscriberId ? `${subscriberId.slice(0, 4)}...${subscriberId.slice(-4)}` : 'anon';
      const maskedCreator = creatorId ? `${creatorId.slice(0, 4)}...${creatorId.slice(-4)}` : 'anon';
      console.log(`[Segpay] Successfully activated ${tier} for subscriber ${maskedSub} -> creator ${maskedCreator}`);
    } 
    else if (action === 'cancel' || action === 'void' || action === 'chargeback') {
      // Deactivate Subscription
      const { error: subError } = await adminClient
        .from('subscriptions')
        .update({ status: 'canceled' })
        .match({ subscriber_id: subscriberId, creator_id: creatorId });

      if (subError) throw subError;

      // Log Interaction
      await adminClient
        .from('interactions')
        .insert({
          actor_id: subscriberId,
          target_id: creatorId,
          interaction_type: 'cancellation',
          metadata: { tranid, processor: 'segpay', action }
        });

      const maskedSub = subscriberId ? `${subscriberId.slice(0, 4)}...${subscriberId.slice(-4)}` : 'anon';
      const maskedCreator = creatorId ? `${creatorId.slice(0, 4)}...${creatorId.slice(-4)}` : 'anon';
      console.log(`[Segpay] Cancelled subscription for subscriber ${maskedSub} -> creator ${maskedCreator} due to ${action}`);
    }

    // Always respond 200 OK to Segpay so they don't retry
    return NextResponse.json({ success: true }, { status: 200 });

  } catch (err: any) {
    console.error('[Segpay Webhook] Error:', err);
    // Still return 200 so Segpay stops retrying on logic errors, or 500 if we want retries.
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
