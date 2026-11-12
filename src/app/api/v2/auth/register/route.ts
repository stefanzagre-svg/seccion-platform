import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { createAdminClient } from '@/lib/supabase/admin-client';
import { isReservedUsername } from '@/lib/reserved-usernames';
import {
  buildArchetypeSynergyDefaults,
  isCountryStrictAgeMandate,
  type MemberPurposeId,
  type MoodId,
} from '@/lib/constants';

const SAFE_MEMBER_SIGNUP_PURPOSES = new Set<string>(['lifestyle', 'language']);

function extractHandleFromLink(link?: string | null, email?: string): string {
  if (link) {
    const cleaned = link.replace(/^https?:\/\/[^\/]+\/@?/, '').replace(/\./g, '_').replace(/[^a-zA-Z0-9_]/g, '');
    if (cleaned.length >= 3) return cleaned.slice(0, 24).toLowerCase();
  }
  if (email) {
    const fromEmail = email.split('@')[0].replace(/\./g, '_').replace(/[^a-zA-Z0-9_]/g, '');
    if (fromEmail.length >= 3) return fromEmail.slice(0, 24).toLowerCase();
  }
  return `user_${Math.floor(1000 + Math.random() * 9000)}`;
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

function sanitizeSignupAgeVerification(
  raw: any,
  cfCountry: string | null
): {
  valid: boolean;
  error?: string;
  record: {
    birthDate: string | null;
    countryCode: string;
    verificationTier: 'declared';
    declaredAt: string;
  };
  derivedAge: number | null;
} {
  const clientCountry =
    typeof raw?.countryCode === 'string' && /^[A-Za-z]{2,6}$/.test(raw.countryCode.trim())
      ? raw.countryCode.trim().toUpperCase()
      : 'ES';
  const effectiveCountry = cfCountry && /^[A-Z]{2}$/.test(cfCountry) ? cfCountry : clientCountry;

  let validBirthDate: string | null = null;
  let derivedAge: number | null = null;

  if (typeof raw?.birthDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(raw.birthDate.trim())) {
    const candidate = raw.birthDate.trim();
    const [yStr, mStr, dStr] = candidate.split('-');
    const y = Number(yStr);
    const m = Number(mStr);
    const d = Number(dStr);
    const now = new Date();
    let age = now.getUTCFullYear() - y;
    const monthDiff = now.getUTCMonth() + 1 - m;
    if (monthDiff < 0 || (monthDiff === 0 && now.getUTCDate() < d)) {
      age -= 1;
    }
    if (age < 18) {
      return {
        valid: false,
        error: 'You must be at least 18 years old to register on SECCION.',
        record: {
          birthDate: null,
          countryCode: effectiveCountry,
          verificationTier: 'declared',
          declaredAt: new Date().toISOString(),
        },
        derivedAge: null,
      };
    }
    if (age >= 18 && age <= 100) {
      validBirthDate = candidate;
      derivedAge = age;
    }
  }

  if (isCountryStrictAgeMandate(effectiveCountry) && !validBirthDate) {
    return {
      valid: false,
      error: `Your jurisdiction (${effectiveCountry}) requires explicit date-of-birth age assurance before account activation.`,
      record: {
        birthDate: null,
        countryCode: effectiveCountry,
        verificationTier: 'declared',
        declaredAt: new Date().toISOString(),
      },
      derivedAge: null,
    };
  }

  return {
    valid: true,
    record: {
      birthDate: validBirthDate,
      countryCode: effectiveCountry,
      verificationTier: 'declared',
      declaredAt: new Date().toISOString(),
    },
    derivedAge,
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const rawEmail = body.email || '';
    const password = body.password || '';
    const rawUsername = body.username || '';
    const rawFullName = body.fullName || '';
    const rawArchetype = typeof body.archetype === 'string' ? body.archetype.slice(0, 40) : null;
    const rawCorePassion = typeof body.corePassion === 'string' ? body.corePassion.slice(0, 40) : null;
    const rawMoods = Array.isArray(body.moods)
      ? (body.moods
          .filter((m: unknown): m is string => typeof m === 'string')
          .slice(0, 5)
          .map((m: string) => m.slice(0, 40)) as MoodId[])
      : undefined;
    const rawHobbies = Array.isArray(body.hobbies)
      ? body.hobbies
          .filter((h: unknown): h is string => typeof h === 'string')
          .slice(0, 10)
          .map((h: string) => h.slice(0, 50))
      : undefined;
    const rawLifestyleHabits =
      body.lifestyleHabits && typeof body.lifestyleHabits === 'object' && !Array.isArray(body.lifestyleHabits)
        ? body.lifestyleHabits
        : undefined;
    const rawBioPromptAnswer =
      typeof body.bioPromptAnswer === 'string' ? body.bioPromptAnswer.slice(0, 500) : undefined;
    const rawAvatarUrl =
      typeof body.avatarUrl === 'string' &&
      (body.avatarUrl.startsWith('data:image/svg+xml;utf8,') ||
        body.avatarUrl.startsWith('https://'))
        ? body.avatarUrl
        : undefined;
    const rawMemberPurposes = Array.isArray(body.memberPurposes)
      ? (body.memberPurposes.filter(
          (p: unknown): p is MemberPurposeId =>
            typeof p === 'string' && SAFE_MEMBER_SIGNUP_PURPOSES.has(p)
        ) as MemberPurposeId[])
      : undefined;
    const rawDisplayAge =
      typeof body.displayAge === 'number' && Number.isFinite(body.displayAge)
        ? Math.min(99, Math.max(18, Math.round(body.displayAge)))
        : null;
    const rawAgeVerification =
      body.ageVerification && typeof body.ageVerification === 'object' ? body.ageVerification : null;
    const rawLocale = body.locale === 'es' ? 'es' : 'en';

    const cfCountry = req.headers.get('cf-ipcountry')?.toUpperCase().trim() || null;
    const ageCheck = sanitizeSignupAgeVerification(rawAgeVerification, cfCountry);
    if (!ageCheck.valid) {
      return NextResponse.json({ error: ageCheck.error }, { status: 400 });
    }

    const cleanEmail = rawEmail.toLowerCase().trim();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
    }
    if (!password || password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters.' }, { status: 400 });
    }

    const adminClient = createAdminClient();

    // 1. Check if this email has an approved Creator Application (link1 instead of primary_handle)
    let creatorApp: { id: string; full_name?: string; link1?: string; status?: string; country?: string } | null = null;
    try {
      const { data: appData } = await adminClient
        .from('creator_applications')
        .select('id, full_name, link1, status, country')
        .eq('email', cleanEmail)
        .maybeSingle();
      if (appData) {
        creatorApp = appData;
      }
    } catch (e) {
      console.warn('[Register API] creator_applications lookup warning:', e);
    }

    const isFounder = cleanEmail === 'stefan.zagre@gmail.com';
    // Strictly gate role = 'creator' to founder or verified approved creator applications (C1 fix)
    const isApprovedCreator = isFounder || creatorApp?.status === 'approved';
    const effectiveRole: 'creator' | 'member' = isApprovedCreator ? 'creator' : 'member';

    if (!isApprovedCreator) {
      // Pre-launch gating (Decision 2): member accounts are placed on the VIP waitlist until creator milestone is met
      await adminClient.from('member_waitlist').upsert(
        {
          email: cleanEmail,
          city: userCountry || 'Global',
        },
        { onConflict: 'email' }
      );

      return NextResponse.json({
        success: true,
        waitlist: true,
        isCreator: false,
        message: 'SECCION is currently in Creator Pre-Launch. You have been placed on the VIP early access waitlist!',
        redirectUrl: '/early-access',
      });
    }

    const baseUsername = (
      rawUsername ||
      extractHandleFromLink(creatorApp?.link1, cleanEmail) ||
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

      // User already exists in auth.users — locate their account safely
      const existingUser = await findAuthUserByEmail(adminClient, cleanEmail);

      if (existingUser) {
        userId = existingUser.id;
        // If unconfirmed, ensure email is confirmed so legitimate owner can sign in
        // CRITICAL SECURITY FIX (C3): Never overwrite existing password to prevent account takeover
        if (!existingUser.email_confirmed_at) {
          await adminClient.auth.admin.updateUserById(existingUser.id, {
            email_confirm: true,
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

    const resolvedDisplayAge = rawDisplayAge ?? ageCheck.derivedAge ?? 25;

    const hasSynergyCalibration = Boolean(rawArchetype);
    if (hasSynergyCalibration) {
      const synergyBundle = buildArchetypeSynergyDefaults(rawArchetype, rawCorePassion, {
        moods: rawMoods,
        hobbies: rawHobbies,
        lifestyle_habits: rawLifestyleHabits,
        bio_prompt_answer: rawBioPromptAnswer,
        avatar_url: rawAvatarUrl,
        member_purposes: rawMemberPurposes,
        locale: rawLocale,
      });

      Object.assign(profilePayload, {
        archetype: synergyBundle.archetype,
        core_passion: synergyBundle.core_passion,
        hobbies: synergyBundle.hobbies,
        lifestyle_habits: synergyBundle.lifestyle_habits,
        bio_prompt_category: synergyBundle.bio_prompt_category,
        bio_prompt_question: synergyBundle.bio_prompt_question,
        bio_prompt_answer: synergyBundle.bio_prompt_answer,
        bio_prompt_category_2: synergyBundle.bio_prompt_category_2,
        bio_prompt_question_2: synergyBundle.bio_prompt_question_2,
        bio_prompt_answer_2: synergyBundle.bio_prompt_answer_2,
        bio_analysis: synergyBundle.bio_analysis,
        avatar_url: synergyBundle.avatar_url,
        member_purposes:
          finalRole === 'creator'
            ? ['creator', 'lifestyle']
            : synergyBundle.member_purposes,
        relationship_goals: synergyBundle.relationship_goals,
        relationship_types: synergyBundle.relationship_types,
        sexual_preferences: synergyBundle.sexual_preferences,
        sexual_preference: synergyBundle.sexual_preference,
        favorite_languages: synergyBundle.favorite_languages,
        connection_points: synergyBundle.connection_points,
        privacy_settings: {
          moods: synergyBundle.moods,
          display_age: resolvedDisplayAge,
          age_verification: ageCheck.record,
        },
      });
    } else {
      profilePayload.privacy_settings = {
        display_age: resolvedDisplayAge,
        age_verification: ageCheck.record,
      };
    }

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
    responseData.onboardingCompleted = finalRole === 'creator' || hasSynergyCalibration;

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

    if (finalRole === 'creator' || hasSynergyCalibration) {
      response.cookies.set('sb_ob', '1', {
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
