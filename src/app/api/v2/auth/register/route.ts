import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { createAdminClient } from '@/lib/supabase/admin-client';
import { isReservedUsername } from '@/lib/reserved-usernames';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const rawEmail = body.email || '';
    const password = body.password || '';
    const rawUsername = body.username || '';
    const rawFullName = body.fullName || '';
    const requestedRole = body.role === 'creator' ? 'creator' : 'member';
    const isInvitedCreator = Boolean(body.isInvitedCreator);

    const cleanEmail = rawEmail.toLowerCase().trim();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
    }
    if (!password || password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters.' }, { status: 400 });
    }

    const adminClient = createAdminClient();

    // 1. Check if this email has a Creator Application (approved or pending)
    let creatorApp: { id: string; full_name?: string; primary_handle?: string; status?: string; country?: string } | null = null;
    try {
      const { data: appData } = await adminClient
        .from('creator_applications')
        .select('id, full_name, primary_handle, status, country')
        .eq('email', cleanEmail)
        .maybeSingle();
      if (appData) {
        creatorApp = appData;
      }
    } catch (e) {
      console.warn('[Register API] creator_applications lookup warning:', e);
    }

    const isFounder = cleanEmail === 'stefan.zagre@gmail.com';
    const effectiveRole: 'creator' | 'member' =
      isFounder || requestedRole === 'creator' || isInvitedCreator || Boolean(creatorApp)
        ? 'creator'
        : 'member';

    const baseUsername = (
      rawUsername ||
      creatorApp?.primary_handle ||
      cleanEmail.split('@')[0] ||
      'user'
    )
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, '')
      .slice(0, 24) || `user_${Math.floor(1000 + Math.random() * 9000)}`;

    const displayName =
      rawFullName.trim() ||
      creatorApp?.full_name?.trim() ||
      rawUsername.trim() ||
      cleanEmail.split('@')[0];

    // 2. Create or resolve user via Admin Client (with email_confirm: true so mobile webviews never lock out)
    let userId: string | null = null;
    const { data: createdAuth, error: createError } = await adminClient.auth.admin.createUser({
      email: cleanEmail,
      password,
      email_confirm: true,
      user_metadata: {
        username: baseUsername,
        full_name: displayName,
        role: effectiveRole,
        email_verified: true,
      },
    });

    if (createdAuth?.user) {
      userId = createdAuth.user.id;
    } else if (createError) {
      const errMsg = createError.message.toLowerCase();
      const isExistingUser =
        errMsg.includes('already') ||
        errMsg.includes('registered') ||
        errMsg.includes('exists');

      if (!isExistingUser) {
        return NextResponse.json({ error: createError.message }, { status: 400 });
      }

      // User already exists in auth.users — locate their account
      const { data: usersList } = await adminClient.auth.admin.listUsers({ page: 1, perPage: 1000 });
      const existingUser = usersList?.users?.find(
        (u) => u.email?.toLowerCase().trim() === cleanEmail
      );

      if (existingUser) {
        userId = existingUser.id;
        // Ensure their email is confirmed so signInWithPassword succeeds without email-verification lockouts
        // Also if they are an invited/approved creator setting up their account, update password & metadata seamlessly
        const { data: existingProfile } = await adminClient
          .from('profiles')
          .select('id, bio, bio_prompt_answer')
          .eq('id', existingUser.id)
          .maybeSingle();

        const isIncompleteProfile = !existingProfile || (!existingProfile.bio && !existingProfile.bio_prompt_answer);

        if (creatorApp || isInvitedCreator || isIncompleteProfile || !existingUser.email_confirmed_at) {
          await adminClient.auth.admin.updateUserById(existingUser.id, {
            password,
            email_confirm: true,
            user_metadata: {
              ...existingUser.user_metadata,
              username: existingUser.user_metadata?.username || baseUsername,
              full_name: existingUser.user_metadata?.full_name || displayName,
              role: effectiveRole,
              email_verified: true,
            },
          });
        }
      }
    }

    // 3. Sign in via SSR client so cookies are written directly onto the HTTP response
    const cookieStore = await cookies();
    const responseData: Record<string, any> = {
      success: true,
      role: effectiveRole,
      isCreator: effectiveRole === 'creator',
      redirectUrl: isFounder ? '/admin' : effectiveRole === 'creator' ? '/studio?welcome=true' : '/onboarding',
    };

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

    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password,
    });

    if (signInError || !signInData.user) {
      return NextResponse.json(
        {
          error:
            signInError?.message ||
            'This email is already registered with a different password. Please sign in or reset your password.',
        },
        { status: 401 }
      );
    }

    userId = signInData.user.id;

    // 4. Upsert profiles row with collision-safe username
    const { data: existingProfile } = await adminClient
      .from('profiles')
      .select('id, username, display_name, role, residence')
      .eq('id', userId)
      .maybeSingle();

    let finalUsername = existingProfile?.username || baseUsername;

    if (!existingProfile?.username) {
      const isReserved = isReservedUsername(finalUsername);
      const { data: usernameTaken } = await adminClient
        .from('profiles')
        .select('id')
        .eq('username', finalUsername)
        .neq('id', userId)
        .maybeSingle();

      if (usernameTaken || isReserved) {
        finalUsername = `${baseUsername}_${Math.floor(100 + Math.random() * 900)}`;
      }
    }

    const finalRole =
      existingProfile?.role === 'creator' || effectiveRole === 'creator' ? 'creator' : 'member';

    const profilePayload: Record<string, any> = {
      id: userId,
      username: finalUsername,
      display_name: existingProfile?.display_name || displayName,
      role: finalRole,
    };

    if (isFounder) {
      profilePayload.platform_role = 'super_admin';
      profilePayload.is_kyc_verified = true;
    }

    const { error: upsertErr } = await adminClient.from('profiles').upsert(profilePayload, {
      onConflict: 'id',
    });

    if (upsertErr) {
      console.warn('[Register API] Profile upsert notice:', upsertErr.message);
    }

    responseData.user = signInData.user;
    responseData.session = signInData.session;
    responseData.username = finalUsername;
    responseData.displayName = profilePayload.display_name;
    responseData.role = finalRole;
    responseData.isCreator = finalRole === 'creator';

    const response = NextResponse.json(responseData);
    pendingCookies.forEach(({ name, value, options }) => {
      response.cookies.set(name, value, options);
    });

    if (finalRole === 'creator') {
      response.cookies.set('sb_role', 'creator', {
        path: '/',
        maxAge: 60 * 60 * 24 * 30,
        sameSite: 'lax',
        httpOnly: false,
      });
    }

    return response;
  } catch (err: any) {
    console.error('[Register API] Unexpected error:', err);
    return NextResponse.json(
      { error: 'Unable to complete registration. Please try again.', details: err.message },
      { status: 500 }
    );
  }
}
