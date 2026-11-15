import crypto from 'node:crypto';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { EmailLocale } from '@/lib/email';

export const VIP_INVITE_COOKIE = 'seccion_vip_code';

export interface VipInviteRecord {
  id: string;
  code: string;
  creator_name: string | null;
  social_handle: string | null;
  platform: string;
  email: string | null;
  locale: EmailLocale;
  niche: string | null;
  morocco_shield: boolean;
  ai_free_months: number;
  founding_split: number;
  max_uses: number;
  uses_count: number;
  is_revoked: boolean;
  expires_at: string;
  claimed_by_user_id: string | null;
  claimed_email: string | null;
  claimed_at: string | null;
  notes: string | null;
  created_by: string | null;
  created_at: string;
}

export type VipInvitePublicStatus =
  | 'active'
  | 'claimed'
  | 'expired'
  | 'revoked'
  | 'not_found';

export interface PublicVipInviteSummary {
  status: VipInvitePublicStatus;
  code: string;
  creatorName: string | null;
  socialHandle: string | null;
  platform: string;
  locale: EmailLocale;
  niche: string | null;
  moroccoShield: boolean;
  foundingSplit: number;
  aiFreeMonths: number;
  expiresAt: string | null;
  requiresEmailMatch: boolean;
  maskedEmail: string | null;
}

const TOKEN_ALPHABET = 'abcdefghjkmnpqrstuvwxyz23456789';

export function normalizeSocialHandle(raw?: string | null): string {
  if (!raw) return '';
  let cleaned = raw.trim();
  // Extract handle from full profile URLs like https://instagram.com/elena_fit/
  cleaned = cleaned.replace(/^https?:\/\/(www\.)?[^/]+\//i, '');
  cleaned = cleaned.replace(/^@+/, '').split(/[/?#]/)[0] || '';
  return cleaned.replace(/[^a-zA-Z0-9._-]/g, '').slice(0, 40);
}

export function generateVipInviteCode(prefixSeed?: string | null): string {
  const cleanPrefix = normalizeSocialHandle(prefixSeed)
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .slice(0, 12);

  const bytes = crypto.randomBytes(8);
  let suffix = '';
  for (let i = 0; i < 8; i++) {
    suffix += TOKEN_ALPHABET[bytes[i] % TOKEN_ALPHABET.length];
  }
  return cleanPrefix ? `${cleanPrefix}-${suffix}` : `vip-${suffix}`;
}

export function maskEmailAddress(email?: string | null): string | null {
  if (!email || !email.includes('@')) return null;
  const [local, domain] = email.trim().toLowerCase().split('@');
  if (!local || !domain) return null;
  const visible = local.slice(0, Math.min(2, local.length));
  return `${visible}${'*'.repeat(Math.max(2, local.length - visible.length))}@${domain}`;
}

export function resolveVipInviteStatus(
  invite: Pick<VipInviteRecord, 'is_revoked' | 'expires_at' | 'uses_count' | 'max_uses'> | null | undefined,
  nowMs: number = Date.now()
): VipInvitePublicStatus {
  if (!invite) return 'not_found';
  if (invite.is_revoked) return 'revoked';
  const expMs = new Date(invite.expires_at).getTime();
  if (!Number.isFinite(expMs) || expMs <= nowMs) return 'expired';
  if ((invite.uses_count ?? 0) >= (invite.max_uses ?? 1)) return 'claimed';
  return 'active';
}

export function buildFoundingYear1Timestamps(
  existing?: {
    promo_90_approved_at?: string | null;
    ai_free_until?: string | null;
  } | null,
  aiFreeMonths: number = 12,
  nowMs: number = Date.now()
): { promo90ApprovedAt: string; aiFreeUntil: string } {
  const nowIso = new Date(nowMs).toISOString();

  // Preserve original Year-1 start timestamp if already stamped so 90% remains strictly 12 months
  const existingPromoMs = existing?.promo_90_approved_at
    ? new Date(existing.promo_90_approved_at).getTime()
    : NaN;
  const promo90ApprovedAt = Number.isFinite(existingPromoMs)
    ? new Date(existingPromoMs).toISOString()
    : nowIso;

  const targetAiUntilMs = nowMs + Math.max(1, aiFreeMonths) * 30.4375 * 24 * 60 * 60 * 1000;
  const existingAiMs = existing?.ai_free_until ? new Date(existing.ai_free_until).getTime() : NaN;
  const finalAiMs = Number.isFinite(existingAiMs)
    ? Math.max(existingAiMs, targetAiUntilMs)
    : targetAiUntilMs;

  return {
    promo90ApprovedAt,
    aiFreeUntil: new Date(finalAiMs).toISOString(),
  };
}

export function buildVipDmTemplates(params: {
  inviteUrl: string;
  creatorName?: string | null;
  socialHandle?: string | null;
  moroccoShield?: boolean;
}): Record<'en' | 'es' | 'fr', string> {
  const label = params.creatorName?.trim() || (params.socialHandle ? `@${normalizeSocialHandle(params.socialHandle)}` : 'there');
  const maNote = {
    en: params.moroccoShield ? ' + Morocco Domestic IP Shield pre-enabled' : '',
    es: params.moroccoShield ? ' + Escudo IP Doméstico Marruecos preactivado' : '',
    fr: params.moroccoShield ? ' + Bouclier IP Maroc préactivé' : '',
  };

  return {
    en: `Hey ${label} — I unlocked a Founding Creator VIP Fast-Track pass for you on SECCION: 90% net payout for your 1st year (80% standard after), 1 year of AI Copilot & Content Ops free${maNote.en}, and zero application queue. Tap here to enter your Studio in 60s: ${params.inviteUrl}`,
    es: `Hola ${label} — Te activé un pase VIP Fast-Track de Creadora Fundadora en SECCION: 90% neto durante tu 1er año (80% después), 1 año gratis de Copiloto IA & Content Ops${maNote.es}, sin formulario ni esperas. Entra directo a tu Studio en 60s aquí: ${params.inviteUrl}`,
    fr: `Hello ${label} — Je t'ai débloqué un accès VIP Fast-Track Créatrice Fondatrice sur SECCION : 90% net la 1re année (80% ensuite), 1 an d'AI Copilot & Content Ops offert${maNote.fr}, sans formulaire ni attente. Ouvre ton Studio en 60s ici : ${params.inviteUrl}`,
  };
}

async function resolveUniqueCreatorUsername(
  adminDb: SupabaseClient,
  desiredSeed: string,
  userId: string
): Promise<string> {
  const base =
    desiredSeed
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, '')
      .slice(0, 22) || `creator_${userId.slice(0, 6)}`;

  const { data: conflict } = await adminDb
    .from('profiles')
    .select('id')
    .eq('username', base)
    .neq('id', userId)
    .maybeSingle();

  if (!conflict) return base;
  const suffix = Math.floor(100 + Math.random() * 899);
  return `${base.slice(0, 18)}_${suffix}`;
}

export async function grantFoundingCreatorBenefits(
  adminDb: SupabaseClient,
  params: {
    userId: string;
    email: string;
    displayName?: string | null;
    usernameSeed?: string | null;
    purpose?: string | null;
    socialHandle?: string | null;
    platform?: string | null;
    moroccoShield?: boolean;
    aiFreeMonths?: number;
    vipInviteCode?: string | null;
  }
): Promise<{
  username: string;
  promo90ApprovedAt: string;
  aiFreeUntil: string;
}> {
  const cleanEmail = params.email.toLowerCase().trim();

  const { data: existingProfile } = await adminDb
    .from('profiles')
    .select(
      'id, username, display_name, purpose, bio, bio_prompt_answer, promo_90_approved_at, ai_free_until, privacy_settings'
    )
    .eq('id', params.userId)
    .maybeSingle();

  const { promo90ApprovedAt, aiFreeUntil } = buildFoundingYear1Timestamps(
    existingProfile,
    params.aiFreeMonths ?? 12
  );

  const chosenUsername =
    existingProfile?.username ||
    (await resolveUniqueCreatorUsername(
      adminDb,
      params.usernameSeed || params.socialHandle || cleanEmail.split('@')[0],
      params.userId
    ));

  const chosenDisplayName =
    existingProfile?.display_name ||
    params.displayName?.trim() ||
    (params.socialHandle ? `@${normalizeSocialHandle(params.socialHandle)}` : cleanEmail.split('@')[0]);

  const prevPrivacy =
    existingProfile?.privacy_settings && typeof existingProfile.privacy_settings === 'object'
      ? (existingProfile.privacy_settings as Record<string, unknown>)
      : {};

  const prevBlocked = Array.isArray(prevPrivacy.blocked_countries)
    ? (prevPrivacy.blocked_countries as string[])
    : [];
  const nextBlocked = params.moroccoShield
    ? Array.from(new Set([...prevBlocked, 'MA']))
    : prevBlocked;

  const nextPrivacy: Record<string, unknown> = {
    ...prevPrivacy,
    ...(params.vipInviteCode
      ? {
          vip_fast_track: true,
          vip_invite_code: params.vipInviteCode,
          vip_claimed_at: prevPrivacy.vip_claimed_at || new Date().toISOString(),
        }
      : {}),
    ...(params.moroccoShield
      ? {
          morocco_domestic_shield: true,
          geo_restriction_enabled: true,
          blocked_countries: nextBlocked,
        }
      : {}),
  };

  const upsertPayload: Record<string, unknown> = {
    id: params.userId,
    email: cleanEmail,
    username: chosenUsername,
    display_name: chosenDisplayName,
    role: 'creator',
    is_approved_founder_creator: true,
    promo_90_approved_at: promo90ApprovedAt,
    ai_agent_active: true,
    content_ops_enabled: true,
    ai_free_until: aiFreeUntil,
    purpose: existingProfile?.purpose || params.purpose || 'Lifestyle',
    bio_prompt_answer:
      existingProfile?.bio_prompt_answer ||
      (params.socialHandle
        ? `VIP Founding Creator (${normalizeSocialHandle(params.socialHandle)}) — interactive live sessions & exclusive drops.`
        : 'VIP Founding Creator on SECCION — exclusive drops & direct interactive sessions.'),
    privacy_settings: nextPrivacy,
    updated_at: new Date().toISOString(),
  };

  const { error: upsertErr } = await adminDb
    .from('profiles')
    .upsert(upsertPayload, { onConflict: 'id' });

  if (upsertErr) {
    throw new Error(`Profile founding provisioning failed: ${upsertErr.message}`);
  }

  // Ensure an approved creator_applications record exists for server-side role lookups
  const { data: existingApp } = await adminDb
    .from('creator_applications')
    .select('id, status')
    .eq('email', cleanEmail)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!existingApp) {
    await adminDb.from('creator_applications').insert({
      full_name: chosenDisplayName,
      email: cleanEmail,
      city: params.moroccoShield ? 'Casablanca / VIP Fast-Track' : 'VIP Fast-Track',
      link1: params.socialHandle
        ? `${params.platform || 'social'}:@${normalizeSocialHandle(params.socialHandle)}`
        : 'vip-fast-track',
      status: 'approved',
      reviewed_at: new Date().toISOString(),
      reviewer_notes: params.vipInviteCode
        ? `Founder VIP Fast-Track (${params.vipInviteCode}) — 90% Year-1 + 1Y AI Free`
        : 'Founder Approved — 90% Year-1 + 1Y AI Free',
    });
  } else if (existingApp.status !== 'approved') {
    await adminDb
      .from('creator_applications')
      .update({
        status: 'approved',
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', existingApp.id);
  }

  return {
    username: chosenUsername,
    promo90ApprovedAt,
    aiFreeUntil,
  };
}

export async function getPublicVipInviteSummary(
  adminDb: SupabaseClient,
  rawCode: string
): Promise<PublicVipInviteSummary> {
  const code = rawCode.trim();
  if (!code || code.length > 64) {
    return {
      status: 'not_found',
      code,
      creatorName: null,
      socialHandle: null,
      platform: 'instagram',
      locale: 'en',
      niche: null,
      moroccoShield: false,
      foundingSplit: 90,
      aiFreeMonths: 12,
      expiresAt: null,
      requiresEmailMatch: false,
      maskedEmail: null,
    };
  }

  const { data } = await adminDb
    .from('creator_vip_invites')
    .select(
      'code, creator_name, social_handle, platform, email, locale, niche, morocco_shield, ai_free_months, founding_split, max_uses, uses_count, is_revoked, expires_at'
    )
    .eq('code', code)
    .maybeSingle();

  if (!data) {
    return {
      status: 'not_found',
      code,
      creatorName: null,
      socialHandle: null,
      platform: 'instagram',
      locale: 'en',
      niche: null,
      moroccoShield: false,
      foundingSplit: 90,
      aiFreeMonths: 12,
      expiresAt: null,
      requiresEmailMatch: false,
      maskedEmail: null,
    };
  }

  const locale: EmailLocale =
    data.locale === 'es' || data.locale === 'fr' ? data.locale : 'en';

  return {
    status: resolveVipInviteStatus(data),
    code: data.code,
    creatorName: data.creator_name,
    socialHandle: data.social_handle,
    platform: data.platform || 'instagram',
    locale,
    niche: data.niche,
    moroccoShield: Boolean(data.morocco_shield),
    foundingSplit: Number(data.founding_split || 90),
    aiFreeMonths: Number(data.ai_free_months || 12),
    expiresAt: data.expires_at,
    requiresEmailMatch: Boolean(data.email && data.email.trim()),
    maskedEmail: maskEmailAddress(data.email),
  };
}

export async function redeemVipInviteForUser(
  adminDb: SupabaseClient,
  params: {
    code: string;
    userId: string;
    email: string;
    fullName?: string | null;
  }
): Promise<
  | {
      ok: true;
      invite: VipInviteRecord;
      username: string;
      promo90ApprovedAt: string;
      aiFreeUntil: string;
    }
  | { ok: false; reason: string; statusCode: number }
> {
  const code = params.code.trim();
  const cleanEmail = params.email.toLowerCase().trim();

  if (!code || !cleanEmail) {
    return { ok: false, reason: 'missing_code_or_email', statusCode: 400 };
  }

  // Primary atomic path: FOR UPDATE Postgres RPC
  const rpcRes = await adminDb.rpc('claim_creator_vip_invite', {
    p_code: code,
    p_user_id: params.userId,
    p_email: cleanEmail,
  });

  let claimedInvite: VipInviteRecord | null = null;

  if (!rpcRes.error && rpcRes.data && typeof rpcRes.data === 'object') {
    const resObj = rpcRes.data as { ok?: boolean; reason?: string; invite?: VipInviteRecord };
    if (!resObj.ok) {
      const statusMap: Record<string, number> = {
        not_found: 404,
        revoked: 410,
        expired: 410,
        email_mismatch: 403,
        already_claimed: 409,
      };
      return {
        ok: false,
        reason: resObj.reason || 'invalid_invite',
        statusCode: statusMap[resObj.reason || ''] || 400,
      };
    }
    claimedInvite = resObj.invite || null;
  } else {
    // Compare-and-swap fallback if migration RPC isn't loaded yet in schema cache
    const { data: invite } = await adminDb
      .from('creator_vip_invites')
      .select('*')
      .eq('code', code)
      .maybeSingle();

    if (!invite) return { ok: false, reason: 'not_found', statusCode: 404 };
    if (invite.is_revoked) return { ok: false, reason: 'revoked', statusCode: 410 };
    if (new Date(invite.expires_at).getTime() <= Date.now()) {
      return { ok: false, reason: 'expired', statusCode: 410 };
    }

    if (invite.claimed_by_user_id === params.userId) {
      claimedInvite = invite as VipInviteRecord;
    } else {
      if (invite.email && invite.email.toLowerCase().trim() !== cleanEmail) {
        return { ok: false, reason: 'email_mismatch', statusCode: 403 };
      }
      if (invite.uses_count >= invite.max_uses) {
        return { ok: false, reason: 'already_claimed', statusCode: 409 };
      }

      const { data: updated } = await adminDb
        .from('creator_vip_invites')
        .update({
          uses_count: invite.uses_count + 1,
          claimed_by_user_id: invite.claimed_by_user_id || params.userId,
          claimed_email: invite.claimed_email || cleanEmail,
          claimed_at: invite.claimed_at || new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', invite.id)
        .eq('uses_count', invite.uses_count)
        .select('*')
        .maybeSingle();

      if (!updated) {
        return { ok: false, reason: 'already_claimed', statusCode: 409 };
      }
      claimedInvite = updated as VipInviteRecord;
    }
  }

  if (!claimedInvite) {
    return { ok: false, reason: 'claim_failed', statusCode: 500 };
  }

  // Ensure Supabase auth user metadata reflects creator fast-track
  await adminDb.auth.admin
    .updateUserById(params.userId, {
      email_confirm: true,
      user_metadata: {
        role: 'creator',
        email_verified: true,
        vip_fast_track: true,
      },
    })
    .catch(() => {});

  const provisioned = await grantFoundingCreatorBenefits(adminDb, {
    userId: params.userId,
    email: cleanEmail,
    displayName: claimedInvite.creator_name || params.fullName,
    usernameSeed: claimedInvite.social_handle || claimedInvite.creator_name,
    purpose: claimedInvite.niche,
    socialHandle: claimedInvite.social_handle,
    platform: claimedInvite.platform,
    moroccoShield: claimedInvite.morocco_shield,
    aiFreeMonths: claimedInvite.ai_free_months,
    vipInviteCode: claimedInvite.code,
  });

  return {
    ok: true,
    invite: claimedInvite,
    ...provisioned,
  };
}

const publicIpRateBuckets = new Map<string, { count: number; resetAt: number }>();

/**
 * Edge-safe per-isolate sliding-window rate limiter for unauthenticated IP endpoints
 * (avoids Supabase `check_rate_limit(p_user_id UUID)` FK failures on anonymous visitors).
 */
export function checkPublicIpRateLimit(
  ip: string,
  endpoint: string,
  maxHits = 30,
  windowSeconds = 60,
  nowMs: number = Date.now()
): boolean {
  const key = `${endpoint}:${ip || 'unknown'}`;
  const windowMs = windowSeconds * 1000;
  const current = publicIpRateBuckets.get(key);

  if (!current || nowMs >= current.resetAt) {
    if (publicIpRateBuckets.size > 10000) {
      publicIpRateBuckets.clear();
    }
    publicIpRateBuckets.set(key, { count: 1, resetAt: nowMs + windowMs });
    return false;
  }

  if (current.count >= maxHits) {
    return true;
  }

  current.count += 1;
  return false;
}
