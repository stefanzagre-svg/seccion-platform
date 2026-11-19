import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin-client';
import { computeAgeProofHash, resolveGeoAgeContext } from '@/lib/age-assurance';

const UUID_REGEX = /^[A-Za-z0-9_-]{8,128}$/;

interface AgeCheckerStatusResponse {
  status?: string;
  reason?: string;
  country?: string;
}

/**
 * Server-side cryptographic verification for US Transactional Age Checks (AgeChecker.net).
 * Validates the widget-returned UUID directly against AgeChecker's REST API using
 * AGECHECKER_SECRET (never trusts client-side onSuccess callbacks alone), writes a
 * zero-PII receipt into public.age_assurance_records, and sets profiles.is_age_verified = true.
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized. Sign in before completing age verification.' },
        { status: 401 }
      );
    }

    const secret = process.env.AGECHECKER_SECRET?.trim();
    if (!secret) {
      console.error('[AgeChecker Verify] AGECHECKER_SECRET is not configured');
      return NextResponse.json(
        { error: 'US age registry verifier is not configured on the server.' },
        { status: 503 }
      );
    }

    const body = (await req.json().catch(() => ({}))) as { uuid?: unknown };
    const uuid = typeof body.uuid === 'string' ? body.uuid.trim() : '';

    if (!UUID_REGEX.test(uuid)) {
      return NextResponse.json(
        { error: 'Invalid AgeChecker verification token.' },
        { status: 400 }
      );
    }

    const verifyRes = await fetch(
      `https://api.agechecker.net/v1/status/${encodeURIComponent(uuid)}`,
      {
        method: 'GET',
        headers: {
          'X-AgeChecker-Secret': secret,
          Accept: 'application/json',
        },
        signal: AbortSignal.timeout(15_000),
      }
    );

    if (!verifyRes.ok) {
      console.warn('[AgeChecker Verify] Upstream status check failed:', verifyRes.status);
      return NextResponse.json(
        { error: 'Could not verify age token with US registry provider.' },
        { status: 502 }
      );
    }

    const upstream = (await verifyRes.json()) as AgeCheckerStatusResponse;
    if (upstream?.status !== 'accepted') {
      return NextResponse.json(
        {
          verified: false,
          status: upstream?.status || 'denied',
          error: upstream?.reason || 'Age verification was not accepted.',
        },
        { status: 422 }
      );
    }

    const geo = resolveGeoAgeContext({
      countryCode: req.headers.get('cf-ipcountry') || upstream.country || 'US',
      regionCode: req.headers.get('cf-region-code'),
    });
    const nowIso = new Date().toISOString();
    const proofHash = await computeAgeProofHash('agechecker', uuid);

    const adminDb = createAdminClient();

    // 1. Persist zero-PII audit receipt (replay-protected via UNIQUE(provider, proof_hash))
    const { error: receiptErr } = await adminDb.from('age_assurance_records').upsert(
      {
        user_id: user.id,
        method: 'us_registry',
        provider: 'agechecker',
        assurance_level: 'transactional',
        country_code: geo.countryCode,
        region_code: geo.regionCode,
        proof_hash: proofHash,
        verified_at: nowIso,
      },
      { onConflict: 'provider,proof_hash', ignoreDuplicates: true }
    );

    if (receiptErr && receiptErr.code !== '42P01' && receiptErr.code !== 'PGRST205') {
      console.warn('[AgeChecker Verify] age_assurance_records notice:', receiptErr.message);
    }

    // 2. Read existing privacy_settings so we preserve user preferences
    const { data: existingProfile } = await adminDb
      .from('profiles')
      .select('privacy_settings')
      .eq('id', user.id)
      .maybeSingle();

    const existingPrivacy =
      existingProfile?.privacy_settings &&
      typeof existingProfile.privacy_settings === 'object'
        ? (existingProfile.privacy_settings as Record<string, unknown>)
        : {};
    const existingAge =
      existingPrivacy.age_verification &&
      typeof existingPrivacy.age_verification === 'object'
        ? (existingPrivacy.age_verification as Record<string, unknown>)
        : {};

    const updatedPrivacy = {
      ...existingPrivacy,
      age_verification: {
        ...existingAge,
        verified: true,
        verificationTier: 'agechecker',
        method: 'us_registry',
        assuranceLevel: 'transactional',
        countryCode: geo.countryCode,
        regionCode: geo.regionCode,
        proofHash,
        verifiedAt: nowIso,
      },
    };

    const { error: profileErr } = await adminDb
      .from('profiles')
      .update({
        is_age_verified: true,
        privacy_settings: updatedPrivacy,
        updated_at: nowIso,
      })
      .eq('id', user.id);

    if (
      profileErr &&
      (profileErr.code === '42703' ||
        profileErr.code === 'PGRST204' ||
        (profileErr.message || '').includes('is_age_verified'))
    ) {
      await adminDb
        .from('profiles')
        .update({
          privacy_settings: updatedPrivacy,
          updated_at: nowIso,
        })
        .eq('id', user.id);
    }

    return NextResponse.json({
      verified: true,
      method: 'us_registry',
      assuranceLevel: 'transactional',
      countryCode: geo.countryCode,
      regionCode: geo.regionCode,
    });
  } catch (error: unknown) {
    console.error('[AgeChecker Verify API Error]:', error);
    return NextResponse.json(
      { error: 'Unable to complete US registry age verification right now.' },
      { status: 500 }
    );
  }
}
