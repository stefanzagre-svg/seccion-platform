import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse, type NextRequest } from 'next/server';
import { type EmailOtpType } from '@supabase/supabase-js';
import { createAdminClient } from '@/lib/supabase/admin-client';
import { isOnboardingProfileComplete } from '@/lib/profile-visibility';
import { VIP_INVITE_COOKIE, redeemVipInviteForUser } from '@/lib/vip-invites';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const token_hash = searchParams.get('token_hash');
  const type = searchParams.get('type') as EmailOtpType | null;
  const rawNext = searchParams.get('next');
  const explicitNext = rawNext && rawNext.startsWith('/') && !rawNext.startsWith('//') ? rawNext : null;

  const cookieStore = await cookies();
  const stagedCookies: Array<{ name: string; value: string; options: any }> = [];

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
            stagedCookies.push({ name, value, options });
          });
        },
      },
    }
  );

  let authenticatedUser = null;

  // 1. Handle PKCE Code exchange
  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error && data.user) {
      authenticatedUser = data.user;
    } else if (error) {
      console.warn('[Auth Callback] PKCE code exchange error:', error);
    }
  }

  // 2. Handle Token Hash (Magic Link / OTP / Email confirmation)
  if (!authenticatedUser && token_hash && type) {
    const { data, error } = await supabase.auth.verifyOtp({ token_hash, type });
    if (!error && data.user) {
      authenticatedUser = data.user;
    } else if (error) {
      console.warn('[Auth Callback] Token hash verification error:', error);
    }
  }

  // 3. Check if user is already authenticated in session/cookies
  if (!authenticatedUser) {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      authenticatedUser = user;
    }
  }

  if (authenticatedUser) {
    let targetPath = explicitNext;
    let resolvedRole: 'creator' | 'member' = 'member';
    let isCompleted = false;

    // Schema fix: Select existing columns instead of non-existent onboarding_completed
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, is_approved_founder_creator, avatar_url, bio, bio_prompt_answer, archetype, sexual_preference, lifestyle_habits')
      .eq('id', authenticatedUser.id)
      .maybeSingle();

    const cleanEmail = authenticatedUser.email?.toLowerCase().trim() || '';
    const isFounder = cleanEmail === 'stefan.zagre@gmail.com';
    let hasApprovedCreatorApp = false;
    const vipCode = searchParams.get('vip') || cookieStore.get(VIP_INVITE_COOKIE)?.value || null;
    let vipRedeemed = false;
    let vipErrorReason: string | null = null;

    if (vipCode && cleanEmail) {
      const adminDb = createAdminClient();
      const fullName =
        typeof authenticatedUser.user_metadata?.full_name === 'string'
          ? authenticatedUser.user_metadata.full_name
          : null;
      const vipRes = await redeemVipInviteForUser(adminDb, {
        code: vipCode,
        userId: authenticatedUser.id,
        email: cleanEmail,
        fullName,
      });
      if (vipRes.ok) {
        hasApprovedCreatorApp = true;
        vipRedeemed = true;
        if (!targetPath) {
          targetPath = '/studio?vip=welcome';
        }
      } else {
        vipErrorReason = vipRes.reason;
      }
    }

    if (!hasApprovedCreatorApp && profile?.role !== 'creator' && profile?.role !== 'admin' && !isFounder && cleanEmail) {
      const adminDb = createAdminClient();
      const { data: creatorApp } = await adminDb
        .from('creator_applications')
        .select('status')
        .eq('email', cleanEmail)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      hasApprovedCreatorApp = creatorApp?.status === 'approved';
    }

    if (profile?.role === 'creator' || profile?.role === 'admin' || isFounder || hasApprovedCreatorApp) {
      resolvedRole = 'creator';
    } else {
      resolvedRole = 'member';
    }
    if (isFounder || isOnboardingProfileComplete(profile)) {
      isCompleted = true;
    }

    const isPasswordRecovery = type === 'recovery' || explicitNext?.startsWith('/auth/update-password');
    const isApprovedPrelaunchAccess =
      isPasswordRecovery || resolvedRole === 'creator' || isCompleted;

    if (!isApprovedPrelaunchAccess) {
      // Close OAuth/MagicLink self-signup bypass during Member waitlist stage
      await supabase.auth.signOut();
      const waitlistDest = vipCode && vipErrorReason
        ? `/vip/${encodeURIComponent(vipCode)}?error=${encodeURIComponent(vipErrorReason)}`
        : explicitNext?.includes('role=creator')
        ? '/become-creator#apply'
        : '/early-access';
      const deniedResponse = NextResponse.redirect(`${origin}${waitlistDest}`);
      stagedCookies.forEach(({ name, value, options }) => {
        deniedResponse.cookies.set(name, value, options);
      });
      if (vipErrorReason && ['not_found', 'revoked', 'expired', 'already_claimed'].includes(vipErrorReason)) {
        deniedResponse.cookies.set(VIP_INVITE_COOKIE, '', { path: '/', maxAge: 0, sameSite: 'lax' });
      }
      return deniedResponse;
    }

    if (!targetPath) {
      if (resolvedRole === 'creator') {
        targetPath = '/studio';
      } else if (isCompleted) {
        targetPath = '/feed';
      } else {
        targetPath = '/early-access';
      }
    }

    const response = NextResponse.redirect(`${origin}${targetPath}`);
    stagedCookies.forEach(({ name, value, options }) => {
      response.cookies.set(name, value, options);
    });
    if (vipRedeemed) {
      response.cookies.set(VIP_INVITE_COOKIE, '', { path: '/', maxAge: 0, sameSite: 'lax' });
      response.cookies.set('sb_ob', '1', { path: '/', maxAge: 86400 * 30, sameSite: 'lax' });
      response.cookies.set('sb_onboarding_completed', 'true', { path: '/', maxAge: 86400 * 30, sameSite: 'lax' });
    }
    response.cookies.set('sb_uid', authenticatedUser.id, { path: '/', maxAge: 86400 * 30, sameSite: 'lax', httpOnly: true });
    response.cookies.set('sb_role', resolvedRole, { path: '/', maxAge: 86400 * 30, sameSite: 'lax' });
    if (isCompleted) {
      response.cookies.set('sb_ob', '1', { path: '/', maxAge: 86400 * 30, sameSite: 'lax' });
      response.cookies.set('sb_onboarding_completed', 'true', { path: '/', maxAge: 86400 * 30, sameSite: 'lax' });
    } else if (!vipRedeemed) {
      response.cookies.set('sb_ob', '', { path: '/', maxAge: 0, sameSite: 'lax' });
      response.cookies.set('sb_onboarding_completed', '', { path: '/', maxAge: 0, sameSite: 'lax' });
    }
    return response;
  }

  // Auth failed (magic link opened in different browser tab or expired)
  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
