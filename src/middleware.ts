import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

// Routes that don't require authentication
const PUBLIC_ROUTES = ['/admin', '/onboarding', '/onboarding/step-2', '/auth/callback', '/api', '/how-we-do', '/become-creator', '/vibe-radar', '/login', '/now-streaming', '/privacy', '/rules', '/creator-hub', '/hit-us-up', '/early-access'];
// Routes that authenticated users should be redirected away from
const AUTH_ROUTES = ['/onboarding', '/onboarding/step-2'];

// Cookie name written by onboarding/step-2/page.tsx on completion
const ONBOARDING_DONE_COOKIE = 'sb_ob';

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const { pathname } = request.nextUrl;

  // Dedicated Admin Route Exemption: Pass all /admin requests directly to AdminLayout (zero redirects!)
  if (pathname.startsWith('/admin')) {
    return supabaseResponse;
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Redirect unauthenticated users away from protected routes
  const isPublic = PUBLIC_ROUTES.some(route => pathname.startsWith(route));
  if (!user) {
    if (!isPublic && pathname !== '/') {
      const url = request.nextUrl.clone();
      url.pathname = '/onboarding';
      return NextResponse.redirect(url);
    }
  } else {
    // H1 FIX: Read the lightweight onboarding-complete cookie first.
    // This avoids a cold Supabase DB query (100-400ms) on EVERY authenticated request.
    // The cookie is set by onboarding/step-2/page.tsx once lifestyle_habits is saved.
    // Fallback: if cookie is absent, query DB once (first login after onboarding, or cookie cleared).
    const onboardingCookie = request.cookies.get(ONBOARDING_DONE_COOKIE)?.value;
    let onboardingCompleted = onboardingCookie === '1';

    if (!onboardingCompleted) {
      // Cookie missing — do the DB check once and set the cookie for next time
      const { data: profile } = await supabase
        .from('profiles')
        .select('archetype, lifestyle_habits')
        .eq('id', user.id)
        .single();

      onboardingCompleted = !!(profile?.archetype && profile?.lifestyle_habits);

      // Backfill the cookie so subsequent requests skip this query
      if (onboardingCompleted) {
        supabaseResponse.cookies.set(ONBOARDING_DONE_COOKIE, '1', {
          path: '/',
          maxAge: 60 * 60 * 24 * 30, // 30 days
          sameSite: 'lax',
          httpOnly: false, // Must be readable by client JS on step-2 completion
        });
      }
    }

    if (onboardingCompleted) {
      // Redirect fully onboarded authenticated users away from onboarding pages
      if (AUTH_ROUTES.some(route => pathname === route)) {
        const url = request.nextUrl.clone();
        url.pathname = '/dashboard';
        return NextResponse.redirect(url);
      }
    } else {
      // Redirect users with incomplete profiles to onboarding if they try to access protected pages
      if (!isPublic && pathname !== '/') {
        const url = request.nextUrl.clone();
        url.pathname = '/onboarding';
        return NextResponse.redirect(url);
      }
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico, favicon.png, apple-touch-icon.png
     * - public assets (.svg, .png, .jpg, .jpeg, .gif, .webp, .ico, .txt, .xml, .webmanifest, .html, .js)
     */
    '/((?!_next/static|_next/image|favicon\\.ico|sitemap\\.xml|robots\\.txt|llms\\.txt|manifest\\.webmanifest|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|xml|webmanifest|html|js)$).*)',
  ],
};
