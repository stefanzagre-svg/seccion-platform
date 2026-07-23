import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { createAdminClient } from '@/lib/supabase/admin-client';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
    }

    const cookieStore = await cookies();
    const response = NextResponse.json({ success: true, redirectUrl: '/admin' });

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
              response.cookies.set(name, value, options);
            });
          },
        },
      }
    );

    // Sign in with Supabase Auth on server side
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.user) {
      return NextResponse.json({ error: error?.message || 'Authentication failed' }, { status: 401 });
    }

    // Auto-elevate stefan.zagre@gmail.com profile to super_admin
    const adminClient = createAdminClient();
    if (data.user.email === 'stefan.zagre@gmail.com') {
      const { error: upsertErr } = await adminClient.from('profiles').upsert({
        id: data.user.id,
        username: 'stefan',
        display_name: 'Stefan (Founder)',
        role: 'creator',
        platform_role: 'super_admin',
        is_kyc_verified: true,
      });
      if (upsertErr) {
        console.warn('[Founder Auth API] Profile upsert notice:', upsertErr.message);
      }
    }

    return response;

  } catch (err: any) {
    console.error('[Founder Auth API] Error:', err);
    return NextResponse.json({ error: 'Server authentication error', details: err.message }, { status: 500 });
  }
}
