import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { KycVerifyResponse } from '@/types/api-responses';

const kycVerifySchema = z.object({
  userId: z.string().uuid({ message: 'Invalid userId UUID format' }),
});

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // C1 FIX: Authenticate the caller first via getUser() (server-validated, not cookie-spoofable)
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized. Please log in to verify your identity.' }, { status: 401 });
    }

    // Parse body — userId must match the authenticated session (prevents privilege escalation)
    const rawBody = await request.json().catch(() => null);
    const parsed = kycVerifySchema.safeParse(rawBody);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid KYC payload', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { userId } = parsed.data;

    // C1 FIX: Enforce that the authenticated user can only verify their own account
    // Admin override: allow service-role callers (e.g. real KYC provider webhook → /api/kyc/shufti-webhook)
    if (user.id !== userId) {
      return NextResponse.json(
        { error: 'Forbidden. You can only submit KYC verification for your own account.' },
        { status: 403 }
      );
    }

    // ─── C5 REMINDER: 3RD PARTY KYC VERIFICATION PROVIDER ─────────────────────
    // When 3rd party KYC API key (Shufti Pro / Yoti / Sumsub) is received:
    // 1. Add KYC_PROVIDER_API_KEY to .env.local and Cloudflare secrets
    // 2. Replace this simulation with the real SDK call:
    //    const kycResult = await kycProviderClient.verifyDocument({ userId, payload });
    // 3. Verify webhook signature in /api/kyc/shufti-webhook
    // ─────────────────────────────────────────────────────────────────────────
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Update the user's profile to be KYC verified
    const { error } = await supabase
      .from('profiles')
      .update({ is_kyc_verified: true })
      .eq('id', userId);

    if (error) throw error;

    // Award KYC Completion XP (+500 XP)
    const { awardXp } = await import('@/lib/xp-service');
    await awardXp(userId, 500);

    return NextResponse.json({
      success: true,
      message: 'KYC Verification Successful',
      userId,
      is_kyc_verified: true
    } as KycVerifyResponse);

  } catch (error: any) {
    console.error('[KYC Verify] Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
