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
  '/blog',
  '/faq',
  '/features',
  '/now-streaming',
  '/onboarding',
  '/onboarding/step-2',
  '/auth/callback'
];

// Explicit public API endpoints that do not require an active user session
const PUBLIC_API_ROUTES = [
  '/api/crypto/nowpayments-webhook',
  '/api/billing/crypto/webhook',
  '/api/billing/segpay-postback',
  '/api/kyc/didit-webhook',
  '/api/webhooks/telegram',
  '/api/auth/callback',
  '/api/v2/auth/register',
  '/api/v2/auth/prelaunch-access',
  '/api/v2/creator/apply',
  '/api/v2/waitlist/join',
  '/api/admin/auth/founder-login',
  '/api/media/blur',
  '/api/v2/onboarding/specialist',
  '/api/creator/check-username'
];

// Routes that require authentication (explicitly excluded from PUBLIC_ROUTES)
const PROTECTED_ROUTES = ['/stream-demo', '/dashboard', '/studio', '/feed', '/messages', '/profile', '/top-profile'];
// Routes that authenticated users should be redirected away from
const AUTH_ROUTES = ['/onboarding', '/onboarding/step-2'];

// Cookie name written by onboarding/step-2/page.tsx on completion
const ONBOARDING_DONE_COOKIE = 'sb_ob';

export async function middleware(request: NextRequest) {
  try {
    let supabaseResponse = NextResponse.next({ request });

    const { pathname } = request.nextUrl;
 
    if (pathname === '/nowstreaming' || pathname === '/nowstreaming/') {
      const url = request.nextUrl.clone();
      url.pathname = '/now-streaming';
      return NextResponse.redirect(url, 301);
    }

  // Dedicated Admin Route Exemption: Pass all /admin and /api/admin requests directly to their handlers (which enforce verifyAdminAuth)
  if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
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

  // Single-segment public creator vanity profile detection (e.g. /magali or /@magali)
  const isPotentialVanityPath = /^\/(@)?[a-zA-Z0-9_.]{3,30}$/.test(pathname) && !isExplicitlyProtected;

  if (!user) {
    // 1. If hitting an unauthenticated private API route, return 401 Unauthorized
    if (pathname.startsWith('/api/') && !isPublicApi) {
      return NextResponse.json({ error: 'Unauthorized: Valid user session required' }, { status: 401 });
    }

    // 2. If hitting protected page, redirect to login (allow dev mode studio inspection)
    if (isExplicitlyProtected) {
      if (process.env.NODE_ENV === 'development' && pathname.startsWith('/studio')) {
        return supabaseResponse;
      }
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      return NextResponse.redirect(url);
    }

    // 3. If accessing non-public site route (exempting API routes and public creator vanity URLs)
    if (!isPublicPage && !isPotentialVanityPath && !pathname.startsWith('/api/') && pathname !== '/') {
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
    const roleCookie = request.cookies.get('sb_role')?.value;
    const isFounder = user?.email === 'stefan.zagre@gmail.com';
    let isCreatorRole = isFounder;
    let onboardingCompleted = onboardingCookie === '1';

    // Purpose Eligibility Checker (60-Second Synergy Calibration Compatible)
    // Note: Progressive gates for Dating (2 Album Photos + City + Biometric/ZKP) and +18 Explicit
    // are enforced in-app via RequirementGateModal & CreateDatePlanModal, never via full-site redirect traps.
    const checkPurposeEligibility = (profile: any) => {
      if (profile?.role === 'creator' || isCreatorRole) return true;
      if (!profile) return false;

      const hasArchetype = Boolean(profile.archetype);
      const hasHabits = Boolean(profile.lifestyle_habits && Object.keys(profile.lifestyle_habits).length > 0);
      const hasBioPrompt = Boolean(profile.bio_prompt_answer || profile.bio);

      return hasArchetype || hasHabits || hasBioPrompt;
    };

    const isOnAuthRoute = AUTH_ROUTES.some(route => pathname === route);
    // Security check: Never trust client-writable sb_role cookie for /studio access or pre-launch gating without server DB verification
    const needsProfileCheck = !onboardingCompleted || (pathname.startsWith('/studio') && !isFounder) || (roleCookie === 'creator' && !isFounder);

    if (needsProfileCheck && supabaseClient) {
      // Fetch server profile to verify genuine role and onboarding status
      const { data: profile } = await supabaseClient
        .from('profiles')
        .select('role, archetype, lifestyle_habits, bio, bio_prompt_answer, member_purposes')
        .eq('id', user.id)
        .single();

      if (profile?.role === 'creator' || profile?.role === 'admin' || isFounder) {
        isCreatorRole = true;
      } else {
        isCreatorRole = false;
      }

      onboardingCompleted = checkPurposeEligibility(profile);

      // Backfill the cookie when accessing non-onboarding routes so subsequent requests skip this query
      if (onboardingCompleted && !isOnAuthRoute) {
        supabaseResponse.cookies.set(ONBOARDING_DONE_COOKIE, '1', {
          path: '/',
          maxAge: 60 * 60 * 24 * 30, // 30 days
          sameSite: 'lax',
          httpOnly: false, // Must be readable by client JS on step-2 completion
        });
      }
      if (isCreatorRole) {
        supabaseResponse.cookies.set('sb_role', 'creator', {
          path: '/',
          maxAge: 60 * 60 * 24 * 30,
          sameSite: 'lax',
          httpOnly: false,
        });
      } else {
        supabaseResponse.cookies.set('sb_role', 'member', {
          path: '/',
          maxAge: 60 * 60 * 24 * 30,
          sameSite: 'lax',
          httpOnly: false,
        });
      }
    }

    const hasExplicitOnboardingOverride =
      request.nextUrl.searchParams.has('fresh') ||
      request.nextUrl.searchParams.has('reset') ||
      request.nextUrl.searchParams.has('tutorial') ||
      request.nextUrl.searchParams.has('setup');

    // Studio Protection: Non-creator sessions attempting to reach /studio are redirected
    if (!isCreatorRole && pathname.startsWith('/studio')) {
      const url = request.nextUrl.clone();
      url.pathname = '/early-access';
      return NextResponse.redirect(url);
    }

    // Pre-Launch Member Gating (H3 Fix):
    // In Creator Pre-Launch mode, restrict non-creator accounts from /feed and /top-profile
    // and guide them gracefully to /early-access.
    if (!isCreatorRole && (pathname === '/feed' || pathname.startsWith('/feed/') || pathname === '/top-profile')) {
      const url = request.nextUrl.clone();
      url.pathname = '/early-access';
      return NextResponse.redirect(url);
    }

    if (onboardingCompleted) {
      // Redirect fully onboarded authenticated users away from onboarding pages only when cookie is explicitly set
      if (isOnAuthRoute && onboardingCookie === '1' && !hasExplicitOnboardingOverride) {
        const url = request.nextUrl.clone();
        url.pathname = isCreatorRole ? '/studio' : '/dashboard';
        url.search = '';
        return NextResponse.redirect(url);
      }
    } else {
      // Redirect users with incomplete profiles to onboarding if they try to access protected pages (exempting API routes and /studio)
      if (!isPublicPage && !pathname.startsWith('/api/') && !pathname.startsWith('/studio') && pathname !== '/') {
        const url = request.nextUrl.clone();
        url.pathname = '/onboarding';
        return NextResponse.redirect(url);
      }
    }
  }

  return supabaseResponse;
  } catch (err) {
    console.error('[Middleware] Unexpected error in middleware, failing safely:', err);
    return NextResponse.next({ request });
  }
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
