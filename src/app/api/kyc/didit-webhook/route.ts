import { NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin-client';
import { sendTelegramNotification } from '@/lib/telegram';
import { verifyDiditSignature, verifyDiditRawSignature, resolveServerVerifiedRole } from '@/lib/didit';

export async function POST(req: NextRequest) {
  try {
    const raw = await req.text();
    const sigV2 = req.headers.get('x-signature-v2') ?? '';
    const sigRaw = req.headers.get('x-signature') ?? '';
    const tsHeader = req.headers.get('x-timestamp');
    const ts = tsHeader ? Number(tsHeader) : NaN;
    const secret = process.env.DIDIT_WEBHOOK_SECRET;

    // 1. Freshness check: reject requests older/newer than 300s (replay protection)
    if (tsHeader !== null && (Number.isNaN(ts) || Math.abs(Date.now() / 1000 - ts) > 300)) {
      console.warn('[DIDIT Webhook] Stale timestamp rejected');
      return new Response('stale', { status: 401 });
    }

    // 2. Strict Signature verification (fail-closed)
    if (!secret) {
      console.error('[DIDIT Webhook] Secret not configured');
      return new Response('secret not configured', { status: 500 });
    }

    if (!sigV2 && !sigRaw) {
      console.warn('[DIDIT Webhook] Missing x-signature-v2 header');
      return new Response('missing signature', { status: 401 });
    }

    let parsed: any;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return new Response('invalid json', { status: 400 });
    }

    const sigValid = sigV2
      ? verifyDiditSignature(raw, sigV2, secret)
      : verifyDiditRawSignature(raw, sigRaw, secret);

    if (!sigValid) {
      console.warn('[DIDIT Webhook] Bad signature rejected');
      return new Response('bad sig', { status: 401 });
    }

    // Require x-timestamp on all verified webhook payloads for strict replay protection
    if (tsHeader === null || Number.isNaN(ts)) {
      console.warn('[DIDIT Webhook] Missing or invalid x-timestamp header');
      return new Response('missing timestamp', { status: 401 });
    }

    if (req.headers.get('x-didit-test-webhook') === 'true' || parsed?.metadata?.test_webhook === true) {
      console.log('[DIDIT Webhook] Verified test webhook received');
      return new Response(JSON.stringify({ ok: true, test_webhook: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const payload = parsed;
    const eventId: string | null = payload.event_id || payload.session_id || null;
    const status = payload.status;
    const vendorData = payload.vendor_data || payload.metadata?.user_id;

    console.log(`[DIDIT Webhook] Status: "${status}" for User: ${vendorData}`);

    if (vendorData) {
      const adminDb = createAdminClient();

      switch (status) {
        case 'Approved': {
          // 1. Fetch existing profile first so we enforce DB idempotency and server-authoritative role resolution
          const { data: existingProfile } = await adminDb
            .from('profiles')
            .select('id, username, email, role, is_kyc_verified, connection_points, privacy_settings')
            .eq('id', vendorData)
            .maybeSingle();

          const existingPrivacy =
            existingProfile?.privacy_settings && typeof existingProfile.privacy_settings === 'object'
              ? (existingProfile.privacy_settings as Record<string, unknown>)
              : {};
          const existingAgeVerification =
            existingPrivacy.age_verification && typeof existingPrivacy.age_verification === 'object'
              ? (existingPrivacy.age_verification as Record<string, unknown>)
              : {};

          const processedSessions = Array.isArray(existingAgeVerification.processed_sessions)
            ? (existingAgeVerification.processed_sessions as string[])
            : [];

          const isDuplicateSession = Boolean(
            eventId &&
            (processedSessions.includes(eventId) ||
              (payload.session_id &&
                existingAgeVerification.sessionId === payload.session_id &&
                existingProfile?.is_kyc_verified))
          );

          if (isDuplicateSession) {
            return new Response('ok', { status: 200 });
          }

          // Resolve email from profile or auth user to check creator_applications approval strictly on server
          let userEmail = existingProfile?.email || null;
          if (!userEmail) {
            const { data: authData } = await adminDb.auth.admin.getUserById(vendorData).catch(() => ({ data: null }));
            userEmail = authData?.user?.email || null;
          }

          let applicationStatus: string | null = null;
          if (existingProfile?.role !== 'creator' && existingProfile?.role !== 'admin' && userEmail) {
            const { data: creatorApp } = await adminDb
              .from('creator_applications')
              .select('status')
              .eq('email', userEmail.toLowerCase().trim())
              .order('created_at', { ascending: false })
              .limit(1)
              .maybeSingle();
            applicationStatus = creatorApp?.status || null;
          }

          const resolvedRole = resolveServerVerifiedRole({
            existingRole: existingProfile?.role,
            email: userEmail,
            applicationStatus,
          });

          const nextProcessedSessions = eventId
            ? [...processedSessions.filter((s) => s !== eventId), eventId].slice(-20)
            : processedSessions;

          // Only award +500 KYC bonus XP once per user across all sessions/retries
          const xpAlreadyAwarded = Boolean(
            existingAgeVerification.kyc_xp_awarded || existingProfile?.is_kyc_verified
          );
          const xpToAward = xpAlreadyAwarded ? 0 : 500;
          const currentXp = existingProfile?.connection_points || 0;

          const updatedPrivacySettings = {
            ...existingPrivacy,
            age_verification: {
              ...existingAgeVerification,
              verified: true,
              verificationTier: 'kyc',
              method: 'didit_kyc',
              sessionId: payload.session_id || null,
              verifiedAt: new Date().toISOString(),
              kyc_xp_awarded: true,
              processed_sessions: nextProcessedSessions,
            },
          };

          // 2. Update profile via service_role (permitted by trg_protect_profile_trust_columns)
          const { data: profile } = await adminDb
            .from('profiles')
            .update({
              is_kyc_verified: true,
              role: resolvedRole,
              privacy_settings: updatedPrivacySettings,
              connection_points: currentXp + xpToAward,
              updated_at: new Date().toISOString(),
            })
            .eq('id', vendorData)
            .select()
            .single();

          if (resolvedRole === 'creator') {
            try {
              await adminDb
                .from('creator_profiles')
                .update({
                  kyc_status: 'verified',
                  updated_at: new Date().toISOString(),
                })
                .eq('id', vendorData);
            } catch (syncErr) {
              console.warn('[DIDIT Webhook] creator_profiles sync warning:', syncErr);
            }
          }

          // 3. Role-accurate Telegram Alert
          const isCreatorVerified = resolvedRole === 'creator';
          const msg =
            `🛡️ *${isCreatorVerified ? 'CREATOR' : 'MEMBER 18+'} KYC VERIFIED (DIDIT)*\n\n` +
            `👤 *User:* @${profile?.username || existingProfile?.username || 'User'} (${profile?.email || userEmail || vendorData})\n` +
            `🎭 *Role:* ${resolvedRole.toUpperCase()}\n` +
            `✅ *Decision:* Approved\n` +
            `🆔 *Session:* ${payload.session_id || 'N/A'}\n` +
            `🎁 *XP Awarded:* +${xpToAward} XP (${isCreatorVerified ? 'Creator Studio Unlocked' : '18+ Date Plans & Explicit Verified'})`;

          sendTelegramNotification(msg).catch((err) => console.warn(err));
          break;
        }

        case 'Declined': {
          await adminDb
            .from('profiles')
            .update({ is_kyc_verified: false })
            .eq('id', vendorData);
          try {
            await adminDb
              .from('creator_profiles')
              .update({
                kyc_status: 'declined',
                updated_at: new Date().toISOString(),
              })
              .eq('id', vendorData);
          } catch {}
          break;
        }

        case 'In Review':
        case 'Resubmitted':
        case 'Kyc Expired':
        default:
          break;
      }
    }

    // Return 200 within 5 seconds
    return new Response('ok', { status: 200 });
  } catch (error: any) {
    console.error('[DIDIT Webhook Error]:', error);
    return new Response('error', { status: 500 });
  }
}
