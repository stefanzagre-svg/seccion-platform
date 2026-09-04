import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { BillingCheckoutResponse } from '@/types/api-responses';

const checkoutSchema = z.object({
  subscriberId: z.string().uuid({ message: 'Invalid subscriberId UUID format' }),
  creatorId: z.string().uuid({ message: 'Invalid creatorId UUID format' }),
  tier: z.string().optional().default('member'),
  price: z.number().positive({ message: 'Price must be a positive number' }),
  type: z.enum(['subscription', 'private_call', 'tip', 'unlock']).optional(),
  callId: z.string().optional(),
  duration: z.number().positive().optional(),
});

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

    const { subscriberId, creatorId, tier, price, type, callId, duration } = parsed.data;

    // Phase 15: Enforce email verification before purchasing
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 });
    }

    if (!user.email_confirmed_at) {
      return NextResponse.json({ error: 'Email verification required before purchasing.' }, { status: 403 });
    }

    // Security & Compliance Firewall: Explicit/18+ stream content MUST be unlocked via Matrix Red Pills (💊)
    // Direct credit card checkout is disabled for explicit assets to protect standard merchant status
    if (tier === 'nsfw_18' || tier === 'explicit_stream' || type === 'unlock') {
      return NextResponse.json({
        error: 'USE_MATRIX_WALLET',
        message: 'Explicit 18+ content and creator stream unlocks require Matrix Red Pills (💊). Please top up your Matrix wallet.',
        requiresMatrixPills: true
      }, { status: 403 });
    }

    const origin = req.nextUrl.origin;
    const merchantId = process.env.SEGPAY_MERCHANT_ID;
    const packageId = process.env.SEGPAY_PACKAGE_ID;
    
    const isPrivateCall = type === 'private_call';
    const custom3 = isPrivateCall ? 'private_call' : tier;
    const custom4 = isPrivateCall && callId ? callId : '';
    const custom5 = isPrivateCall && duration ? duration.toString() : '';

    if (!merchantId || !packageId || merchantId === 'placeholder_merchant_id') {
      // Mock Sandbox Checkout Redirection for Local / Dev testing
      const maskedSub = subscriberId ? `${subscriberId.slice(0, 4)}...${subscriberId.slice(-4)}` : 'anon';
      const maskedCreator = creatorId ? `${creatorId.slice(0, 4)}...${creatorId.slice(-4)}` : 'anon';
      console.log(`[Segpay Demo Mode] Generating mock Join Link for ${isPrivateCall ? 'Private Call' : tier} (sub: ${maskedSub}, creator: ${maskedCreator})`);
      return NextResponse.json({ 
        url: `${origin}/profile/member?checkout=success&type=${type || 'subscription'}&mock=true` 
      });
    }

    // Segpay Dynamic Pricing POS Link Generator
    // Action: auth (or sale)
    const SEGPAY_BASE_URL = 'https://secure2.segpay.com/billing/pos';
    const approvedUrl = `${origin}/profile/member?checkout=success&tier=${tier || 'call'}&processor=segpay`;
    const declinedUrl = `${origin}/profile/member?checkout=cancelled&processor=segpay`;

    const params = new URLSearchParams({
      'action': 'auth',
      'merchantid': merchantId,
      'packageid': packageId,
      'price': price.toString(),
      'currency': 'USD', // Adjust if supporting multiple
      'custom1': subscriberId,
      'custom2': creatorId,
      'custom3': custom3,
      'custom4': custom4,
      'custom5': custom5,
      'approved_url': approvedUrl,
      'declined_url': declinedUrl,
    });

    const joinUrl = `${SEGPAY_BASE_URL}?${params.toString()}`;
    return NextResponse.json({ url: joinUrl });

  } catch (err: any) {
    console.error('Segpay Checkout Generation error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
