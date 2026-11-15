import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin-client';
import { checkEndpointRateLimit } from '@/lib/auth-admin';

/**
 * POST /api/v2/compliance/consent
 * Persists a cryptographically signed SnapSign mutual consent record
 * for explicit/L4+ suggestion moves. Enforces authenticated session + verified KYC.
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const admin = createAdminClient();
    const isRateLimited = await checkEndpointRateLimit(admin, user.id, 'snapsign_consent', 20, 60);
    if (isRateLimited) {
      return NextResponse.json({ error: 'Too many consent submissions. Please wait.' }, { status: 429 });
    }

    const body = await req.json();
    const signatureName = typeof body?.signatureName === 'string' ? body.signatureName.trim() : '';
    const moveId = typeof body?.moveId === 'string' ? body.moveId.trim() : '';
    const moveLabel = typeof body?.moveLabel === 'string' ? body.moveLabel.trim() : '';
    const clientConsentHash = typeof body?.consentHash === 'string' ? body.consentHash.trim() : '';

    if (!signatureName || !moveId) {
      return NextResponse.json(
        { error: 'signatureName and moveId are required' },
        { status: 400 }
      );
    }

    const { data: profile, error: profErr } = await admin
      .from('profiles')
      .select('is_kyc_verified')
      .eq('id', user.id)
      .maybeSingle();

    if (profErr || !profile || profile.is_kyc_verified !== true) {
      return NextResponse.json(
        { error: 'Verified KYC status is required before signing explicit move consent.' },
        { status: 403 }
      );
    }

    // Recompute/seal canonical SHA-256 hash on server
    const signedAt = new Date().toISOString();
    const payload = `${user.id}:${signatureName}:${moveId}:${clientConsentHash}:${signedAt}`;
    const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(payload));
    const serverHash = Array.from(new Uint8Array(digest))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')
      .substring(0, 32)
      .toUpperCase();

    const userAgent = req.headers.get('user-agent') || 'unknown';
    const ipCountry = req.headers.get('cf-ipcountry') || 'XX';

    const { data: consentRow, error: insertErr } = await admin
      .from('compliance_consents')
      .insert({
        user_id: user.id,
        consent_type: 'snapsign_explicit_move',
        move_id: moveId,
        move_label: moveLabel || moveId,
        signature_name: signatureName,
        consent_hash: serverHash,
        signed_at: signedAt,
        metadata: {
          client_hash: clientConsentHash || null,
          ip_country: ipCountry,
          user_agent: userAgent.slice(0, 200),
        },
      })
      .select('id, consent_hash, signed_at')
      .single();

    if (insertErr) {
      console.error('[ComplianceConsent] Failed to persist consent record:', insertErr);
      return NextResponse.json(
        { error: 'Failed to seal consent record in compliance ledger.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      consentId: consentRow.id,
      consentHash: consentRow.consent_hash,
      signedAt: consentRow.signed_at,
    });
  } catch (err: any) {
    console.error('[ComplianceConsent] Unexpected error:', err);
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 });
  }
}
