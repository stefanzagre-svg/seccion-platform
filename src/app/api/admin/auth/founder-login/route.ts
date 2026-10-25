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

    const cleanEmail = email.toLowerCase().trim();
    const isFounder = cleanEmail === 'stefan.zagre@gmail.com';
    const cookieStore = await cookies();
    const pendingCookies: Array<{ name: string; value: string; options: any }> = [];

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
              pendingCookies.push({ name, value, options });
            });
          },
        },
      }
    );

    const adminClient = createAdminClient();

    // Check if this email has a creator application
    let creatorApp: { id: string; full_name?: string; primary_handle?: string; status?: string } | null = null;
    try {
      const { data: appData } = await adminClient
        .from('creator_applications')
        .select('id, full_name, primary_handle, status')
        .eq('email', cleanEmail)
        .maybeSingle();
      if (appData) {
        creatorApp = appData;
      }
    } catch (e) {
      console.warn('[Founder Auth API] creator_applications lookup warning:', e);
    }

    // 1. Attempt standard password sign-in
    let { data, error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password,
    });

    // 2. If signInWithPassword failed, check if this is an approved/applied creator signing in for the first time
    if ((error || !data.user) && (creatorApp || isFounder)) {
      const { data: usersList } = await adminClient.auth.admin.listUsers({ page: 1, perPage: 1000 });
      const existingAuthUser = usersList?.users?.find(
        (u) => u.email?.toLowerCase().trim() === cleanEmail
      );

      const fallbackUsername = (
        creatorApp?.primary_handle ||
        cleanEmail.split('@')[0] ||
        'creator'
      )
        .toLowerCase()
        .replace(/[^a-z0-9_]/g, '')
        .slice(0, 24);

      const fallbackDisplayName =
        creatorApp?.full_name?.trim() || cleanEmail.split('@')[0];

      if (!existingAuthUser && password.length >= 6) {
        // First-time Creator login after application approval: auto-provision their Auth user with the password they entered
        const { data: created } = await adminClient.auth.admin.createUser({
          email: cleanEmail,
          password,
          email_confirm: true,
          user_metadata: {
            username: fallbackUsername,
            full_name: fallbackDisplayName,
            role: 'creator',
            email_verified: true,
          },
        });

        if (created?.user) {
          const retry = await supabase.auth.signInWithPassword({
            email: cleanEmail,
            password,
          });
          data = retry.data;
          error = retry.error;
        }
      } else if (existingAuthUser) {
        // User exists in auth.users — check if their email wasn't confirmed yet or if they never finished profile setup
        const { data: existingProf } = await adminClient
          .from('profiles')
          .select('id, bio, bio_prompt_answer')
          .eq('id', existingAuthUser.id)
          .maybeSingle();

        const isFreshApplicant =
          !existingAuthUser.email_confirmed_at ||
          !existingProf ||
          (!existingProf.bio && !existingProf.bio_prompt_answer);

        if (isFreshApplicant && password.length >= 6) {
          await adminClient.auth.admin.updateUserById(existingAuthUser.id, {
            password,
            email_confirm: true,
            user_metadata: {
              ...existingAuthUser.user_metadata,
              role: 'creator',
              email_verified: true,
            },
          });

          const retry = await supabase.auth.signInWithPassword({
            email: cleanEmail,
            password,
          });
          data = retry.data;
          error = retry.error;
        }
      }
    }

    if (error || !data.user) {
      return NextResponse.json(
        { error: error?.message || 'Invalid login credentials' },
        { status: 401 }
      );
    }

    // 3. Resolve & ensure profile exists with proper role
    const { data: profileRow } = await adminClient
      .from('profiles')
      .select('id, username, display_name, role, platform_role, lifestyle_habits')
      .eq('id', data.user.id)
      .maybeSingle();

    const isCreator =
      isFounder ||
      profileRow?.role === 'creator' ||
      data.user.user_metadata?.role === 'creator' ||
      Boolean(creatorApp);

    const effectiveRole: 'creator' | 'member' = isCreator ? 'creator' : 'member';

    if (isFounder) {
      await adminClient.from('profiles').upsert({
        id: data.user.id,
        username: profileRow?.username || 'stefan',
        display_name: profileRow?.display_name || 'Stefan (Founder)',
        role: 'creator',
        platform_role: 'super_admin',
        is_kyc_verified: true,
      });
    } else if (!profileRow || (isCreator && profileRow.role !== 'creator')) {
      const baseUsername = (
        profileRow?.username ||
        creatorApp?.primary_handle ||
        data.user.user_metadata?.username ||
        cleanEmail.split('@')[0] ||
        'creator'
      )
        .toLowerCase()
        .replace(/[^a-z0-9_]/g, '')
        .slice(0, 24);

      await adminClient.from('profiles').upsert(
        {
          id: data.user.id,
          username: baseUsername,
          display_name:
            profileRow?.display_name ||
            creatorApp?.full_name ||
            data.user.user_metadata?.full_name ||
            cleanEmail.split('@')[0],
          role: effectiveRole,
        },
        { onConflict: 'id' }
      );
    }

    const redirectUrl = isFounder
      ? '/admin'
      : effectiveRole === 'creator'
        ? '/studio'
        : '/dashboard';

    const response = NextResponse.json({
      success: true,
      redirectUrl,
      role: effectiveRole,
      user: data.user,
      session: data.session,
    });

    pendingCookies.forEach(({ name, value, options }) => {
      response.cookies.set(name, value, options);
    });

    if (effectiveRole === 'creator' || profileRow?.lifestyle_habits) {
      response.cookies.set('sb_ob', '1', {
        path: '/',
        maxAge: 60 * 60 * 24 * 30,
        sameSite: 'lax',
        httpOnly: false,
      });
    }

    if (effectiveRole === 'creator') {
      response.cookies.set('sb_role', 'creator', {
        path: '/',
        maxAge: 60 * 60 * 24 * 30,
        sameSite: 'lax',
        httpOnly: false,
      });
    }

    return response;
  } catch (err: any) {
    console.error('[Founder Auth API] Error:', err);
    return NextResponse.json(
      { error: 'Server authentication error', details: err.message },
      { status: 500 }
    );
  }
}
