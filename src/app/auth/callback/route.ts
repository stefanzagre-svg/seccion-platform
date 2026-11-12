import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse, type NextRequest } from 'next/server';
import { type EmailOtpType } from '@supabase/supabase-js';

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

    // Schema fix: Select existing columns (lifestyle_habits, bio_prompt_answer) instead of non-existent onboarding_completed
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, lifestyle_habits, bio_prompt_answer')
      .eq('id', authenticatedUser.id)
      .maybeSingle();

    if (profile?.role === 'creator' || profile?.role === 'admin') {
      resolvedRole = 'creator';
    } else {
      resolvedRole = 'member';
    }
    if (profile?.lifestyle_habits || profile?.bio_prompt_answer) {
      isCompleted = true;
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
    response.cookies.set('sb_role', resolvedRole, { path: '/', maxAge: 86400 * 30, sameSite: 'lax' });
    if (isCompleted || resolvedRole === 'creator') {
      response.cookies.set('sb_ob', '1', { path: '/', maxAge: 86400 * 30, sameSite: 'lax' });
      response.cookies.set('sb_onboarding_completed', 'true', { path: '/', maxAge: 86400 * 30, sameSite: 'lax' });
    }
    return response;
  }

  // Auth failed (magic link opened in different browser tab or expired)
  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
