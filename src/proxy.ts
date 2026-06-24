import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

// Routes that don't require authentication
const PUBLIC_ROUTES = ['/onboarding', '/onboarding/step-2', '/auth/callback', '/api'];
// Routes that authenticated users should be redirected away from
const AUTH_ROUTES = ['/onboarding', '/onboarding/step-2'];

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

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

  // Refresh session — IMPORTANT: do not add logic between createServerClient and getUser
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Redirect unauthenticated users away from protected routes
  const isPublic = PUBLIC_ROUTES.some(route => pathname.startsWith(route));
  if (!user) {
    if (!isPublic && pathname !== '/') {
      const url = request.nextUrl.clone();
      url.pathname = '/onboarding';
      return NextResponse.redirect(url);
    }
  } else {
    // User is logged in. Query profiles table to check onboarding status.
    const { data: profile } = await supabase
      .from('profiles')
      .select('archetype, lifestyle_habits')
      .eq('id', user.id)
      .single();

    const onboardingCompleted = !!(profile?.archetype && profile?.lifestyle_habits);

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
     * - favicon.ico
     * - public assets
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
