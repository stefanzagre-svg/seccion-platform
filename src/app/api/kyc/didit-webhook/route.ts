import { NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin-client';
import { sendTelegramNotification } from '@/lib/telegram';
import {
  verifyDiditSignature,
  verifyDiditRawSignature,
  resolveServerVerifiedRole,
} from '@/lib/didit';
import {
  classifyDiditWebhookWorkflow,
  computeAgeProofHash,
} from '@/lib/age-assurance';

interface DiditWebhookPayload {
  event_id?: string;
  session_id?: string;
  workflow_id?: string;
  status?: string;
  vendor_data?: string;
  metadata?: {
    test_webhook?: boolean;
    user_id?: string;
    verification_mode?: string;
    country_code?: string;
    region_code?: string | null;
  };
}

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

    let parsed: DiditWebhookPayload;
    try {
      parsed = JSON.parse(raw) as DiditWebhookPayload;
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

    if (
      req.headers.get('x-didit-test-webhook') === 'true' ||
      parsed?.metadata?.test_webhook === true
    ) {
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

    // Authoritatively classify workflow_id (never trust mutable metadata to elevate into Creator KYC)
    const workflowClass = classifyDiditWebhookWorkflow({
      payloadWorkflowId: payload.workflow_id,
      metadataMode: payload.metadata?.verification_mode,
    });

    console.log(
      `[DIDIT Webhook] Status: "${status}" Mode: "${workflowClass.mode}" for User: ${vendorData}`
    );

    if (vendorData) {
      const adminDb = createAdminClient();

      switch (status) {
        case 'Approved': {
          // 1. Fetch existing profile first for DB idempotency and server-authoritative role resolution
          const { data: existingProfile, error: existingProfileError } = await adminDb
            .from('profiles')
            .select('id, username, role, is_kyc_verified, connection_points, privacy_settings')
            .eq('id', vendorData)
            .maybeSingle();

          if (existingProfileError) {
            console.warn(
              '[DIDIT Webhook] Existing profile lookup warning:',
              existingProfileError.message
            );
          }

          const existingPrivacy =
            existingProfile?.privacy_settings &&
            typeof existingProfile.privacy_settings === 'object'
              ? (existingProfile.privacy_settings as Record<string, unknown>)
              : {};
          const existingAgeVerification =
            existingPrivacy.age_verification &&
            typeof existingPrivacy.age_verification === 'object'
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
                  (workflowClass.grantsCreatorKyc
                    ? existingProfile?.is_kyc_verified
                    : existingAgeVerification.verified === true)))
          );

          if (isDuplicateSession) {
            return new Response('ok', { status: 200 });
          }

          // Resolve email from Auth user to check creator_applications approval strictly on server
          let userEmail: string | null = null;
          const { data: authData } = await adminDb.auth.admin
            .getUserById(vendorData)
            .catch(() => ({ data: null }));
          userEmail = authData?.user?.email || null;

          let applicationStatus: string | null = null;
          if (
            workflowClass.grantsCreatorKyc &&
            existingProfile?.role !== 'creator' &&
            existingProfile?.role !== 'admin' &&
            userEmail
          ) {
            const { data: creatorApp } = await adminDb
              .from('creator_applications')
              .select('status')
              .eq('email', userEmail.toLowerCase().trim())
              .order('created_at', { ascending: false })
              .limit(1)
              .maybeSingle();
            applicationStatus = creatorApp?.status || null;
          }

          const resolvedRole = workflowClass.grantsCreatorKyc
            ? resolveServerVerifiedRole({
                existingRole: existingProfile?.role,
                email: userEmail,
                applicationStatus,
              })
            : existingProfile?.role || 'member';

          const nextProcessedSessions = eventId
            ? [...processedSessions.filter((s) => s !== eventId), eventId].slice(-20)
            : processedSessions;

          // Only award +500 verification bonus XP once per user across all sessions/retries
          const xpAlreadyAwarded = Boolean(
            existingAgeVerification.kyc_xp_awarded || existingProfile?.is_kyc_verified
          );
          const xpToAward = xpAlreadyAwarded ? 0 : 500;
          const currentXp = existingProfile?.connection_points || 0;
          const nowIso = new Date().toISOString();

          const updatedPrivacySettings = {
            ...existingPrivacy,
            age_verification: {
              ...existingAgeVerification,
              verified: true,
              verificationTier: workflowClass.grantsCreatorKyc ? 'kyc' : 'biometric_age',
              method: workflowClass.assuranceMethod,
              assuranceLevel: workflowClass.assuranceLevel,
              sessionId: payload.session_id || null,
              verifiedAt: nowIso,
              kyc_xp_awarded: true,
              processed_sessions: nextProcessedSessions,
            },
          };

          // 2. Write zero-PII audit receipt into public.age_assurance_records (graceful if pre-migration)
          const rawProofToken = payload.session_id || eventId || `${vendorData}:${nowIso}`;
          const proofHash = await computeAgeProofHash('didit', rawProofToken);
          const { error: receiptErr } = await adminDb
            .from('age_assurance_records')
            .upsert(
              {
                user_id: vendorData,
                method: workflowClass.assuranceMethod,
                provider: 'didit',
                assurance_level: workflowClass.assuranceLevel,
                country_code: payload.metadata?.country_code || null,
                region_code: payload.metadata?.region_code || null,
                proof_hash: proofHash,
                verified_at: nowIso,
              },
              { onConflict: 'provider,proof_hash', ignoreDuplicates: true }
            );

          if (receiptErr && receiptErr.code !== '42P01' && receiptErr.code !== 'PGRST205') {
            console.warn('[DIDIT Webhook] age_assurance_records notice:', receiptErr.message);
          }

          // 3. Update profile via service_role (strictly separate is_age_verified vs is_kyc_verified)
          const profileUpdate: Record<string, unknown> = {
            is_age_verified: true,
            privacy_settings: updatedPrivacySettings,
            connection_points: currentXp + xpToAward,
            updated_at: nowIso,
          };

          if (workflowClass.grantsCreatorKyc) {
            profileUpdate.is_kyc_verified = true;
            profileUpdate.role = resolvedRole;
          }

          let profile: { username?: string | null } | null = null;
          const updateAttempt = await adminDb
            .from('profiles')
            .update(profileUpdate)
            .eq('id', vendorData)
            .select('username')
            .single();

          if (
            updateAttempt.error &&
            (updateAttempt.error.code === '42703' ||
              updateAttempt.error.code === 'PGRST204' ||
              (updateAttempt.error.message || '').includes('is_age_verified'))
          ) {
            // Pre-migration graceful fallback so live production never breaks before SQL migration runs
            const legacyUpdate: Record<string, unknown> = {
              privacy_settings: updatedPrivacySettings,
              connection_points: currentXp + xpToAward,
              updated_at: nowIso,
            };
            if (workflowClass.grantsCreatorKyc) {
              legacyUpdate.is_kyc_verified = true;
              legacyUpdate.role = resolvedRole;
            }
            const fallback = await adminDb
              .from('profiles')
              .update(legacyUpdate)
              .eq('id', vendorData)
              .select('username')
              .single();
            profile = fallback.data;
          } else {
            profile = updateAttempt.data;
          }

          if (workflowClass.grantsCreatorKyc && resolvedRole === 'creator') {
            try {
              await adminDb
                .from('creator_profiles')
                .update({
                  kyc_status: 'verified',
                  updated_at: nowIso,
                })
                .eq('id', vendorData);
            } catch (syncErr) {
              console.warn('[DIDIT Webhook] creator_profiles sync warning:', syncErr);
            }
          }

          // 4. Role & Workflow-accurate Telegram Alert
          const label = workflowClass.grantsCreatorKyc
            ? resolvedRole === 'creator'
              ? 'CREATOR 2257 KYC VERIFIED (DIDIT)'
              : 'MEMBER FULL KYC VERIFIED (DIDIT)'
            : 'MEMBER 18+ AGE VERIFIED (DIDIT ADAPTIVE)';
          const msg =
            `🛡️ *${label}*\n\n` +
            `👤 *User:* @${profile?.username || existingProfile?.username || 'User'} (${userEmail || vendorData})\n` +
            `🎭 *Role:* ${resolvedRole.toUpperCase()}\n` +
            `✅ *Decision:* Approved (${workflowClass.assuranceMethod})\n` +
            `🆔 *Session:* ${payload.session_id || 'N/A'}\n` +
            `🎁 *XP Awarded:* +${xpToAward} XP`;

          sendTelegramNotification(msg).catch((err) => console.warn(err));
          break;
        }

        case 'Declined': {
          // Scope Declined strictly to the matching workflow so a failed member check never wipes Creator KYC
          if (workflowClass.grantsCreatorKyc) {
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
            } catch {
              // ignore absent creator_profiles row
            }
          } else {
            const { error: declineAgeErr } = await adminDb
              .from('profiles')
              .update({ is_age_verified: false })
              .eq('id', vendorData);
            if (
              declineAgeErr &&
              declineAgeErr.code !== '42703' &&
              declineAgeErr.code !== 'PGRST204'
            ) {
              console.warn('[DIDIT Webhook] member_age decline notice:', declineAgeErr.message);
            }
          }
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
  } catch (error: unknown) {
    console.error('[DIDIT Webhook Error]:', error);
    return new Response('error', { status: 500 });
  }
}
