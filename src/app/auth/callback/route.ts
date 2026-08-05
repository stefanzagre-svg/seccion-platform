import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse, type NextRequest } from 'next/server';
import { type EmailOtpType } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const token_hash = searchParams.get('token_hash');
  const type = searchParams.get('type') as EmailOtpType | null;
  const next = searchParams.get('next') ?? '/onboarding';

  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Ignored from Server Components
          }
        },
      },
    }
  );

  // 1. Handle PKCE Code exchange
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
    console.warn('[Auth Callback] PKCE code exchange error:', error);
  }

  // 2. Handle Token Hash (Magic Link / OTP / Email confirmation)
  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({ token_hash, type });
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
    console.warn('[Auth Callback] Token hash verification error:', error);
  }

  // 3. Check if user is already authenticated in session/cookies
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.user) {
    return NextResponse.redirect(`${origin}${next}`);
  }

  // Auth failed (magic link opened in different browser tab or expired)
  return NextResponse.redirect(`${origin}/onboarding?error=auth_callback_failed`);
}
