import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_mock', {
  apiVersion: '2023-10-16' as any,
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { subscriberId, creatorId, tier, price } = body;

    if (!subscriberId || !creatorId || !tier || !price) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const supabase = await createClient();

    // Fetch creator Connect ID to handle direct transfer or destination charge
    const { data: creatorProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', creatorId)
      .single();

    const stripeConnectId = creatorProfile?.privacy_settings?.stripe_connect_id;
    const origin = req.nextUrl.origin;
    const hasRealKey = process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY !== 'sk_test_mock';

    // 1. VIP Subscription: recurring Billing Mode
    if (tier === 'vip') {
      let priceId = '';

      if (hasRealKey) {
        // Create a dynamic price for recurring monthly subscription
        const stripePrice = await stripe.prices.create({
          unit_amount: Math.round(price * 100),
          currency: 'usd',
          recurring: { interval: 'month' },
          product_data: {
            name: `Session VIP Subscription to @${creatorProfile?.username || 'creator'}`,
          },
        });
        priceId = stripePrice.id;
      }

      const sessionOptions: Stripe.Checkout.SessionCreateParams = {
        payment_method_types: ['card'],
        line_items: [
          hasRealKey 
            ? { price: priceId, quantity: 1 }
            : {
                price_data: {
                  currency: 'usd',
                  product_data: {
                    name: `Session VIP Subscription to @${creatorProfile?.username || 'creator'} (Mock)`,
                  },
                  unit_amount: Math.round(price * 100),
                  recurring: { interval: 'month' },
                },
                quantity: 1,
              }
        ],
        mode: 'subscription',
        success_url: `${origin}/profile/member?checkout=success&tier=vip`,
        cancel_url: `${origin}/profile/member?checkout=cancelled`,
        metadata: {
          subscriberId,
          creatorId,
          tier,
          price: price.toString(),
        },
        subscription_data: {
          metadata: {
            subscriberId,
            creatorId,
            tier,
            price: price.toString(),
          }
        }
      };

      if (stripeConnectId) {
        sessionOptions.subscription_data = {
          ...sessionOptions.subscription_data,
          application_fee_percent: 20, // 20% platform fee automatically taken from invoices
          transfer_data: {
            destination: stripeConnectId,
          },
        };
      }

      if (hasRealKey) {
        const session = await stripe.checkout.sessions.create(sessionOptions);
        return NextResponse.json({ url: session.url });
      } else {
        // Mock fallback checkout redirection
        console.log('Mock VIP Subscription Session created:', sessionOptions);
        return NextResponse.json({ url: `${origin}/profile/member?checkout=success&tier=vip` });
      }
    } 
    
    // 2. MASTER Subscription: one-time billing (non-recurring)
    else {
      const sessionOptions: Stripe.Checkout.SessionCreateParams = {
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: `Session MASTER Pass - Sponsored Creators Roster`,
                description: `1-Month full access to all matched creator feeds`,
              },
              unit_amount: Math.round(price * 100),
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${origin}/profile/member?checkout=success&tier=master`,
        cancel_url: `${origin}/profile/member?checkout=cancelled`,
        metadata: {
          subscriberId,
          creatorId,
          tier,
          price: price.toString(),
        },
      };

      if (stripeConnectId) {
        sessionOptions.payment_intent_data = {
          application_fee_amount: Math.round(price * 0.20 * 100), // 20% Platform Fee
          transfer_data: {
            destination: stripeConnectId,
          },
        };
      }

      if (hasRealKey) {
        const session = await stripe.checkout.sessions.create(sessionOptions);
        return NextResponse.json({ url: session.url });
      } else {
        // Mock fallback checkout redirection
        console.log('Mock Master Pass Session created:', sessionOptions);
        return NextResponse.json({ url: `${origin}/profile/member?checkout=success&tier=master` });
      }
    }
  } catch (err: any) {
    console.error('Checkout Session creation error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
