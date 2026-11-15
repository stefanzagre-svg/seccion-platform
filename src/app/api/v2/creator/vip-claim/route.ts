import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin-client';
import { getClientIP } from '@/lib/admin-auth';
import {
  VIP_INVITE_COOKIE,
  checkPublicIpRateLimit,
  getPublicVipInviteSummary,
  redeemVipInviteForUser,
  resolveVipInviteStatus,
  type VipInviteRecord,
} from '@/lib/vip-invites';

const vipClaimPostSchema = z.discriminatedUnion('action', [
  z.object({
    action: z.literal('prepare_oauth'),
    code: z.string().trim().min(3).max(64),
  }),
  z.object({
    action: z.literal('prepare_otp'),
    code: z.string().trim().min(3).max(64),
    email: z.string().trim().email(),
  }),
  z.object({
    action: z.literal('finalize'),
    code: z.string().trim().min(3).max(64).optional(),
  }),
]);

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code')?.trim() || '';
  if (!code) {
    return NextResponse.json(
      { ok: false, error: 'Missing VIP code' },
      { status: 400, headers: { 'Cache-Control': 'no-store' } }
    );
  }

  const adminDb = createAdminClient();
  const ip = request.headers.get('cf-connecting-ip') || getClientIP(request);
  const blocked = checkPublicIpRateLimit(ip, 'vip_invite_lookup', 60, 60);
  if (blocked) {
    return NextResponse.json(
      { ok: false, error: 'Too many requests' },
      { status: 429, headers: { 'Cache-Control': 'no-store' } }
    );
  }

  const summary = await getPublicVipInviteSummary(adminDb, code);
  return NextResponse.json(
    { ok: true, summary },
    { status: 200, headers: { 'Cache-Control': 'no-store' } }
  );
}

export async function POST(request: NextRequest) {
  const adminDb = createAdminClient();
  const ip = request.headers.get('cf-connecting-ip') || getClientIP(request);
  const blocked = checkPublicIpRateLimit(ip, 'vip_invite_claim', 30, 60);
  if (blocked) {
    return NextResponse.json(
      { ok: false, reason: 'rate_limited', error: 'Too many requests. Please wait a moment.' },
      { status: 429, headers: { 'Cache-Control': 'no-store' } }
    );
  }

  const rawBody = await request.json().catch(() => null);
  const parsed = vipClaimPostSchema.safeParse(rawBody);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, reason: 'invalid_payload', error: 'Invalid VIP claim request' },
      { status: 400, headers: { 'Cache-Control': 'no-store' } }
    );
  }

  const payload = parsed.data;
  const isProd = process.env.NODE_ENV === 'production';

  if (payload.action === 'prepare_oauth') {
    const summary = await getPublicVipInviteSummary(adminDb, payload.code);
    if (summary.status !== 'active') {
      return NextResponse.json(
        { ok: false, reason: summary.status, summary },
        { status: summary.status === 'not_found' ? 404 : 409, headers: { 'Cache-Control': 'no-store' } }
      );
    }

    const res = NextResponse.json(
      { ok: true, code: summary.code },
      { status: 200, headers: { 'Cache-Control': 'no-store' } }
    );
    res.cookies.set(VIP_INVITE_COOKIE, summary.code, {
      httpOnly: true,
      sameSite: 'lax',
      secure: isProd,
      path: '/',
      maxAge: 1800,
    });
    return res;
  }

  if (payload.action === 'prepare_otp') {
    const cleanEmail = payload.email.toLowerCase().trim();
    const { data: invite } = await adminDb
      .from('creator_vip_invites')
      .select('code, email, is_revoked, expires_at, uses_count, max_uses')
      .eq('code', payload.code)
      .maybeSingle();

    const status = resolveVipInviteStatus(invite as VipInviteRecord | null);
    if (status !== 'active' || !invite) {
      return NextResponse.json(
        { ok: false, reason: status },
        { status: status === 'not_found' ? 404 : 409, headers: { 'Cache-Control': 'no-store' } }
      );
    }

    if (invite.email && invite.email.toLowerCase().trim() !== cleanEmail) {
      return NextResponse.json(
        { ok: false, reason: 'email_mismatch' },
        { status: 403, headers: { 'Cache-Control': 'no-store' } }
      );
    }

    const res = NextResponse.json(
      { ok: true, code: invite.code },
      { status: 200, headers: { 'Cache-Control': 'no-store' } }
    );
    res.cookies.set(VIP_INVITE_COOKIE, invite.code, {
      httpOnly: true,
      sameSite: 'lax',
      secure: isProd,
      path: '/',
      maxAge: 1800,
    });
    return res;
  }

  // action === 'finalize'
  const supabase = await createClient();
  const {
    data: { user },
    error: authErr,
  } = await supabase.auth.getUser();

  if (authErr || !user || !user.email) {
    return NextResponse.json(
      { ok: false, reason: 'unauthorized', error: 'Authentication required to activate VIP Studio.' },
      { status: 401, headers: { 'Cache-Control': 'no-store' } }
    );
  }

  const code = payload.code || request.cookies.get(VIP_INVITE_COOKIE)?.value || '';
  if (!code) {
    return NextResponse.json(
      { ok: false, reason: 'missing_code', error: 'Missing VIP pass code.' },
      { status: 400, headers: { 'Cache-Control': 'no-store' } }
    );
  }

  const redeemed = await redeemVipInviteForUser(adminDb, {
    code,
    userId: user.id,
    email: user.email,
    fullName: typeof user.user_metadata?.full_name === 'string' ? user.user_metadata.full_name : null,
  });

  if (!redeemed.ok) {
    return NextResponse.json(
      { ok: false, reason: redeemed.reason },
      { status: redeemed.statusCode, headers: { 'Cache-Control': 'no-store' } }
    );
  }

  const res = NextResponse.json(
    {
      ok: true,
      redirectTo: '/studio?vip=welcome',
      username: redeemed.username,
      promo90ApprovedAt: redeemed.promo90ApprovedAt,
      aiFreeUntil: redeemed.aiFreeUntil,
    },
    { status: 200, headers: { 'Cache-Control': 'no-store' } }
  );

  res.cookies.set(VIP_INVITE_COOKIE, '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: isProd,
    path: '/',
    maxAge: 0,
  });
  res.cookies.set('sb_role', 'creator', {
    httpOnly: false,
    sameSite: 'lax',
    secure: isProd,
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });
  res.cookies.set('sb_ob', '1', {
    httpOnly: false,
    sameSite: 'lax',
    secure: isProd,
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });
  res.cookies.set('sb_onboarding_completed', 'true', {
    httpOnly: false,
    sameSite: 'lax',
    secure: isProd,
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });

  return res;
}
