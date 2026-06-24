import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_mock', {
  apiVersion: '2023-10-16' as any,
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const supabase = await createClient();

    // 1. Fetch user profile to see if they are a creator
    const { data: profile, error: profileErr } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileErr || !profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    if (profile.role !== 'creator') {
      return NextResponse.json({ error: 'Only creators can onboard Stripe Connect' }, { status: 400 });
    }

    // Check if they already have a connect account id stored
    let stripeAccountId = profile.privacy_settings?.stripe_connect_id;

    if (!stripeAccountId) {
      // Create a new Stripe Express Account
      const account = await stripe.accounts.create({
        type: 'express',
        country: 'US', // Default to US, can be dynamic based on origin
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        metadata: {
          userId,
        },
      });

      stripeAccountId = account.id;

      // Update creator profile settings with the Connect Account ID
      const updatedSettings = {
        ...(profile.privacy_settings || {}),
        stripe_connect_id: stripeAccountId,
      };

      await supabase
        .from('profiles')
        .update({ privacy_settings: updatedSettings })
        .eq('id', userId);
    }

    // Create Account Link for onboarding
    const origin = req.nextUrl.origin;
    const accountLink = await stripe.accountLinks.create({
      account: stripeAccountId,
      refresh_url: `${origin}/studio?stripe=refresh`,
      return_url: `${origin}/studio?stripe=success`,
      type: 'account_onboarding',
    });

    return NextResponse.json({ url: accountLink.url });
  } catch (err: any) {
    console.error('Stripe Connect onboarding error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
