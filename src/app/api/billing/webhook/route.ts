import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_mock', {
  apiVersion: '2023-10-16' as any,
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

// We use service role to bypass RLS policies during webhook handling
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature') || '';

  let event: Stripe.Event;

  try {
    if (webhookSecret) {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } else {
      // Dev mode fallback without signature check if secret is not set
      event = JSON.parse(body) as Stripe.Event;
    }
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json({ error: 'Webhook Error: ' + err.message }, { status: 400 });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // 1. Handle Checkout completed (Initial Purchase)
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const metadata = session.metadata;

    if (metadata && metadata.subscriberId && metadata.creatorId && metadata.tier) {
      const { subscriberId, creatorId, tier, price } = metadata;
      const stripeSubId = session.mode === 'subscription' ? (session.subscription as string) : null;

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30); // 30-day active period

      // Insert subscription into database
      const { error: subErr } = await supabase
        .from('subscriptions')
        .insert({
          subscriber_id: subscriberId,
          creator_id: creatorId,
          tier: tier as any,
          price_paid: parseFloat(price),
          is_active: true,
          started_at: new Date().toISOString(),
          expires_at: expiresAt.toISOString(),
          stripe_subscription_id: stripeSubId
        });

      if (subErr) {
        console.error('Database subscription logging failed:', subErr);
        return NextResponse.json({ error: 'Database update failed' }, { status: 500 });
      }

      // Add connection points reward (+200 pts) for subscribing
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
  }

  // 2. Handle Subscription Renewal Invoice (Invoice Paid)
  else if (event.type === 'invoice.payment_succeeded') {
    const invoice = event.data.object as Stripe.Invoice;
    const stripeSubId = (invoice as any).subscription as string;

    if (stripeSubId) {
      // Find active matching subscription record
      const { data: subscription, error: fetchErr } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('stripe_subscription_id', stripeSubId)
        .single();

      if (!fetchErr && subscription) {
        const nextExpiry = new Date();
        nextExpiry.setDate(nextExpiry.getDate() + 30); // Extend 30 days

        // Update database expiration
        const { error: updateErr } = await supabase
          .from('subscriptions')
          .update({
            expires_at: nextExpiry.toISOString(),
            is_active: true,
            updated_at: new Date().toISOString()
          })
          .eq('id', subscription.id);

        if (!updateErr) {
          console.log(`Successfully renewed subscription ${subscription.id} to ${nextExpiry.toISOString()}`);
          
          // Reward member with connection points (+200 pts) for renewal
          const { data: profile } = await supabase
            .from('profiles')
            .select('connection_points')
            .eq('id', subscription.subscriber_id)
            .single();

          if (profile) {
            const currentPoints = profile.connection_points || 0;
            await supabase
              .from('profiles')
              .update({ connection_points: currentPoints + 200 })
              .eq('id', subscription.subscriber_id);
          }
        } else {
          console.error('Failed to update subscription expiry on invoice success:', updateErr);
        }
      }
    }
  }

  // 3. Handle Subscription Cancelled or Payment Failed
  else if (event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object as Stripe.Subscription;
    
    const { error: cancelErr } = await supabase
      .from('subscriptions')
      .update({ 
        is_active: false, 
        updated_at: new Date().toISOString() 
      })
      .eq('stripe_subscription_id', subscription.id);

    if (cancelErr) {
      console.error(`Failed to cancel subscription ${subscription.id} in DB:`, cancelErr);
    } else {
      console.log(`Deactivated cancelled subscription ${subscription.id} in DB`);
    }
  }

  return NextResponse.json({ received: true });
}
