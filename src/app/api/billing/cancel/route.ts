import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_mock', {
  apiVersion: '2023-10-16' as any,
});

export async function POST(req: NextRequest) {
  try {
    const { subscriptionId, creatorId, subscriberId } = await req.json();

    const supabase = await createClient();
    const hasRealKey = process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY !== 'sk_test_mock';

    let targetStripeSubId = subscriptionId;

    // If subscriptionId wasn't passed directly, look it up in the database using creatorId & subscriberId
    if (!targetStripeSubId && creatorId && subscriberId) {
      const { data: subData } = await supabase
        .from('subscriptions')
        .select('stripe_subscription_id')
        .eq('creator_id', creatorId)
        .eq('subscriber_id', subscriberId)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (subData?.stripe_subscription_id) {
        targetStripeSubId = subData.stripe_subscription_id;
      }
    }

    if (hasRealKey && targetStripeSubId && !targetStripeSubId.startsWith('mock_')) {
      // 1. Call Stripe API to cancel auto-renewal at period end
      await stripe.subscriptions.update(targetStripeSubId, {
        cancel_at_period_end: true,
      });
      console.log(`Stripe subscription ${targetStripeSubId} set to cancel at period end.`);
    } else {
      console.log(`Mocking Stripe subscription cancellation for: ${targetStripeSubId || 'creator_' + creatorId}`);
    }

    // 2. Update database state. Since cancel_at_period_end maintains access until expires_at,
    // we can either set is_active = false immediately for testing, or update the database record.
    // We will set is_active to false to show the subscription cancelled status immediately in the UI.
    let updateQuery = supabase.from('subscriptions').update({
      is_active: false,
      updated_at: new Date().toISOString()
    });

    if (targetStripeSubId) {
      updateQuery = updateQuery.eq('stripe_subscription_id', targetStripeSubId);
    } else if (creatorId && subscriberId) {
      updateQuery = updateQuery.eq('creator_id', creatorId).eq('subscriber_id', subscriberId);
    } else {
      return NextResponse.json({ error: 'Missing subscription identifiers (subscriptionId or creatorId/subscriberId)' }, { status: 400 });
    }

    const { error: dbError } = await updateQuery;
    if (dbError) {
      console.error('Database update failed on subscription cancel:', dbError);
    }

    return NextResponse.json({
      success: true,
      message: 'Subscription renewal cancelled successfully.',
      subscriptionId: targetStripeSubId || 'mock_cancelled'
    });

  } catch (err: any) {
    console.error('Billing cancel route error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
