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

    // V3.0 Two-Stage Security & Compliance Firewall:
    // Explicit/18+ stream content, PPV unlocks, or NSFW_18 tiers MUST be unlocked via Sovereign Red Pills (💊)
    // Mainstream MCC 5818 direct card checkout is strictly restricted to SFW Studio Credits (✨)
    if (tier === 'nsfw_18' || tier === 'explicit_stream' || type === 'unlock') {
      return NextResponse.json({
        error: 'USE_MATRIX_WALLET',
        message: 'Explicit 18+ content and creator stream unlocks require Sovereign Red Pills (💊) funded via Open Banking, Instant USDC, or Web3. Please top up your Matrix wallet.',
        requiresMatrixPills: true,
        requiredLedger: 'sovereign_red_pills'
      }, { status: 403 });
    }

    const origin = req.nextUrl.origin;
    const isPrivateCall = type === 'private_call';
    const maskedSub = subscriberId ? `${subscriberId.slice(0, 4)}...${subscriberId.slice(-4)}` : 'anon';
    const maskedCreator = creatorId ? `${creatorId.slice(0, 4)}...${creatorId.slice(-4)}` : 'anon';

    console.log(`[V3 SFW Checkout Router] Generating SFW Studio Credits checkout for ${isPrivateCall ? 'Private Call' : tier} (sub: ${maskedSub}, creator: ${maskedCreator})`);
    return NextResponse.json({ 
      url: `${origin}/profile/member?checkout=success&type=${type || 'subscription'}&ledger=sfw_credits`,
      requiredLedger: 'sfw_credits'
    });

  } catch (err: any) {
    console.error('V3 Checkout Generation error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
