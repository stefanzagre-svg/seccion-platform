import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin-client';
import { z } from 'zod';
import { KycVerifyResponse } from '@/types/api-responses';

const kycVerifySchema = z.object({
  userId: z.string().uuid({ message: 'Invalid userId UUID format' }),
  legalName: z.string().trim().min(2, { message: 'Full legal name is required' }),
  livenessVerified: z.literal(true, {
    message: 'Biometric 3D liveness verification is required',
  }),
  acceptedTerms: z.literal(true, {
    message: 'Signed legal declaration is required',
  }),
  idFileName: z.string().min(1).optional(),
  selfieFileName: z.string().min(1).optional(),
  targetRole: z.enum(['member', 'creator']).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // C1 FIX: Authenticate the caller first via getUser() (server-validated, not cookie-spoofable)
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized. Please log in to verify your identity.' }, { status: 401 });
    }

    // Parse body — userId must match the authenticated session AND include completed liveness + legal release
    const rawBody = await request.json().catch(() => null);
    const parsed = kycVerifySchema.safeParse(rawBody);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid KYC payload', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { userId, legalName, targetRole } = parsed.data;

    // C1 FIX: Enforce that the authenticated user can only verify their own account
    if (user.id !== userId) {
      return NextResponse.json(
        { error: 'Forbidden. You can only submit KYC verification for your own account.' },
        { status: 403 }
      );
    }

    // Use service_role admin client so trg_protect_profile_trust_columns permits the trust-column update
    const adminDb = createAdminClient();
    const { data: existingProfile } = await adminDb
      .from('profiles')
      .select('id, role, display_name, privacy_settings')
      .eq('id', userId)
      .maybeSingle();

    const resolvedRole =
      targetRole === 'creator' || existingProfile?.role === 'creator'
        ? 'creator'
        : existingProfile?.role || 'member';

    const existingPrivacy =
      existingProfile?.privacy_settings && typeof existingProfile.privacy_settings === 'object'
        ? (existingProfile.privacy_settings as Record<string, unknown>)
        : {};
    const existingAgeVerification =
      existingPrivacy.age_verification && typeof existingPrivacy.age_verification === 'object'
        ? (existingPrivacy.age_verification as Record<string, unknown>)
        : {};

    const updatedPrivacySettings = {
      ...existingPrivacy,
      age_verification: {
        ...existingAgeVerification,
        verified: true,
        verificationTier: 'kyc',
        method: 'biometric_liveness_kyc',
        legalNameVerified: true,
        verifiedAt: new Date().toISOString(),
      },
    };

    const { error } = await adminDb
      .from('profiles')
      .update({
        is_kyc_verified: true,
        role: resolvedRole,
        display_name: existingProfile?.display_name || legalName,
        privacy_settings: updatedPrivacySettings,
        updated_at: new Date().toISOString(),
      })
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
