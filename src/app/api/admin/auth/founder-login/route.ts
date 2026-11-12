import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { createAdminClient } from '@/lib/supabase/admin-client';

function extractHandleFromLink(link?: string | null, email?: string): string {
  if (link) {
    const cleaned = link.replace(/^https?:\/\/[^\/]+\/@?/, '').replace(/\./g, '_').replace(/[^a-zA-Z0-9_]/g, '');
    if (cleaned.length >= 3) return cleaned.slice(0, 24).toLowerCase();
  }
  if (email) {
    const fromEmail = email.split('@')[0].replace(/\./g, '_').replace(/[^a-zA-Z0-9_]/g, '');
    if (fromEmail.length >= 3) return fromEmail.slice(0, 24).toLowerCase();
  }
  return `creator_${Math.floor(1000 + Math.random() * 9000)}`;
}

async function findAuthUserByEmail(adminClient: any, email: string) {
  let page = 1;
  const perPage = 1000;
  while (page <= 5) {
    const { data } = await adminClient.auth.admin.listUsers({ page, perPage });
    if (!data?.users || data.users.length === 0) break;
    const match = data.users.find((u: any) => u.email?.toLowerCase().trim() === email);
    if (match) return match;
    if (data.users.length < perPage) break;
    page++;
  }
  return null;
}

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

    // Check if this email has a creator application (link1 instead of non-existent primary_handle)
    let creatorApp: { id: string; full_name?: string; link1?: string; status?: string } | null = null;
    try {
      const { data: appData } = await adminClient
        .from('creator_applications')
        .select('id, full_name, link1, status')
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

    const isApprovedCreator = isFounder || creatorApp?.status === 'approved';

    // 2. If signInWithPassword failed, check if this is an approved creator signing in for the first time
    // Only auto-provision NEW accounts for approved creators who do not yet have an auth.users record
    if ((error || !data.user) && isApprovedCreator) {
      const existingAuthUser = await findAuthUserByEmail(adminClient, cleanEmail);

      const fallbackUsername = (
        extractHandleFromLink(creatorApp?.link1, cleanEmail) ||
        cleanEmail.split('@')[0] ||
        'creator'
      )
        .toLowerCase()
        .replace(/[^a-z0-9_]/g, '')
        .slice(0, 24);

      const fallbackDisplayName =
        creatorApp?.full_name?.trim() || cleanEmail.split('@')[0];

      if (!existingAuthUser && password.length >= 6) {
        // First-time Approved Creator login: auto-provision their Auth user with the password they provided
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
      }
      // Note: Never overwrite password for existingAuthUser to prevent account takeover (C3 fix)
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
      creatorApp?.status === 'approved';

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
        extractHandleFromLink(creatorApp?.link1, cleanEmail) ||
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
