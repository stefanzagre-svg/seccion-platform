import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

// Routes that don't require authentication (explicit public pages)
const PUBLIC_ROUTES = [
  '/login',
  '/become-creator',
  '/how-we-do',
  '/creator-hub',
  '/vibe-radar',
  '/privacy',
  '/rules',
  '/hit-us-up',
  '/early-access',
  '/onboarding',
  '/onboarding/step-2',
  '/auth/callback'
];

// Explicit public API endpoints that do not require an active user session
const PUBLIC_API_ROUTES = [
  '/api/crypto/nowpayments-webhook',
  '/api/billing/segpay-postback',
  '/api/kyc/didit-webhook',
  '/api/webhooks/telegram',
  '/api/auth/callback',
  '/api/early-access',
  '/api/contact'
];

// Routes that require authentication (explicitly excluded from PUBLIC_ROUTES)
const PROTECTED_ROUTES = ['/stream-demo', '/dashboard', '/studio', '/feed', '/messages', '/profile'];
// Routes that authenticated users should be redirected away from
const AUTH_ROUTES = ['/onboarding', '/onboarding/step-2'];

// Cookie name written by onboarding/step-2/page.tsx on completion
const ONBOARDING_DONE_COOKIE = 'sb_ob';

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const { pathname } = request.nextUrl;

  // Dedicated Admin Route Exemption: Pass all /admin requests directly to AdminLayout (zero redirects!)
  if (pathname.startsWith('/admin')) {
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-pathname', pathname);
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  let user = null;
  let supabaseClient: any = null;

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseAnonKey) {
      supabaseClient = createServerClient(
        supabaseUrl,
        supabaseAnonKey,
        {
          cookies: {
            getAll() {
              return request.cookies.getAll();
            },
            setAll(cookiesToSet) {
              try {
                cookiesToSet.forEach(({ name, value }) =>
                  request.cookies.set(name, value)
                );
                supabaseResponse = NextResponse.next({ request });
                cookiesToSet.forEach(({ name, value, options }) =>
                  supabaseResponse.cookies.set(name, value, options)
                );
              } catch {
                // Ignore cookie setting errors on edge/RSC
              }
            },
          },
        }
      );

      const { data } = await supabaseClient.auth.getUser();
      user = data?.user || null;
    }
  } catch (err) {
    console.warn('[Middleware] Supabase auth check failed safely:', err);
    user = null;
  }

  // Check route public status
  const isPublicPage = PUBLIC_ROUTES.some(route => pathname === route || pathname.startsWith(route + '/'));
  const isPublicApi = PUBLIC_API_ROUTES.some(route => pathname === route || pathname.startsWith(route + '/'));
  const isExplicitlyProtected = PROTECTED_ROUTES.some(route => pathname === route || pathname.startsWith(route + '/'));

  if (!user) {
    // 1. If hitting an unauthenticated private API route, return 401 Unauthorized
    if (pathname.startsWith('/api/') && !isPublicApi) {
      return NextResponse.json({ error: 'Unauthorized: Valid user session required' }, { status: 401 });
    }

    // 2. If hitting protected page, redirect to login
    if (isExplicitlyProtected) {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      return NextResponse.redirect(url);
    }

    // 3. If accessing non-public site route
    if (!isPublicPage && pathname !== '/') {
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

    // Purpose Eligibility Checker
    const checkPurposeEligibility = (profile: any) => {
      // Creators have their own Creator Extension studio onboarding and don't need member lifestyle habit quizzes
      if (profile?.role === 'creator') return true;

      // Basic check from old logic + new purpose array
      if (!profile?.archetype || !profile?.lifestyle_habits) return false;
      if (!profile?.active_purposes || profile.active_purposes.length === 0) return false;

      const hasVisible = (array: any[], hiddenKey: string) => {
        if (!array || array.length === 0) return false;
        const hiddenValues = profile.privacy_settings?.[hiddenKey] || [];
        return array.filter((v: any) => !hiddenValues.includes(v)).length > 0;
      };

      const isDating = profile.active_purposes.includes('dating');
      const isGrowth = profile.active_purposes.includes('growth');
      const isExplicit = profile.active_purposes.includes('explicit');

      if (isDating) {
        if (!hasVisible(profile.sexual_preferences, 'sexual_preferences_hidden')) return false;
        if (!hasVisible(profile.relationship_goals, 'relationship_goals_hidden')) return false;
        if (!hasVisible(profile.relationship_types, 'relationship_types_hidden')) return false;
        if (!profile.current_location) return false;
        if (profile.privacy_settings?.current_location_hidden) return false;
      }

      if (isGrowth) {
        if (!profile.career || !profile.education_level || !profile.income_bracket) return false;
        if (Object.keys(profile.lifestyle_habits || {}).length < 10) return false;
        if ((profile.hobbies || []).length < 10) return false;
      }

      if (isExplicit) {
        if (!hasVisible(profile.sexual_preferences, 'sexual_preferences_hidden')) return false;
        if (!hasVisible(profile.relationship_types, 'relationship_types_hidden')) return false;
        if (!profile.nsfw_boundaries || profile.nsfw_boundaries.length < 1) return false;
      }

      return true;
    };
    if (!onboardingCompleted && supabaseClient) {
      // Cookie missing — do the DB check once and set the cookie for next time
      const { data: profile } = await supabaseClient
        .from('profiles')
        .select('role, archetype, lifestyle_habits, active_purposes, privacy_settings, sexual_preferences, relationship_goals, relationship_types, current_location, career, education_level, hobbies, income_bracket, nsfw_boundaries')
        .eq('id', user.id)
        .single();

      onboardingCompleted = checkPurposeEligibility(profile);

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
