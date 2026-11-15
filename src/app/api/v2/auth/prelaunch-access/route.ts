import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin-client';
import { findAuthUserByEmail } from '@/lib/auth-admin';
import { checkPublicIpRateLimit } from '@/lib/vip-invites';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const rawEmail = typeof body?.email === 'string' ? body.email : '';
    const cleanEmail = rawEmail.toLowerCase().trim();

    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address.' },
        { status: 400 }
      );
    }

    const clientIp =
      req.headers.get('cf-connecting-ip') ||
      req.headers.get('x-real-ip') ||
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      'anon_client';

    const isFounder = cleanEmail === 'stefan.zagre@gmail.com';
    const supabaseAdmin = createAdminClient();

    // Edge-safe IP rate limiting (avoids UUID-typed RPC error on anonymous callers)
    const isRateLimited = checkPublicIpRateLimit(
      clientIp,
      'auth/prelaunch-access',
      15,
      60
    );
    if (isRateLimited) {
      return NextResponse.json(
        { error: 'Too many requests. Please wait a moment and try again.' },
        { status: 429 }
      );
    }

    // 1. Check creator_applications table (link1 instead of primary_handle)
    const { data: creatorApp } = await supabaseAdmin
      .from('creator_applications')
      .select('id, full_name, link1, status')
      .eq('email', cleanEmail)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    // 2. Check existing auth.users & profiles
    const existingAuthUser = await findAuthUserByEmail(supabaseAdmin, cleanEmail);

    let existingProfile: {
      id: string;
      username?: string;
      display_name?: string;
      role?: string;
    } | null = null;

    if (existingAuthUser) {
      const { data: prof } = await supabaseAdmin
        .from('profiles')
        .select('id, username, display_name, role')
        .eq('id', existingAuthUser.id)
        .maybeSingle();
      existingProfile = prof;
    }

    const isApprovedCreator =
      isFounder ||
      creatorApp?.status === 'approved' ||
      existingProfile?.role === 'creator' ||
      existingProfile?.role === 'admin';

    if (isApprovedCreator) {
      const displayName =
        existingProfile?.display_name ||
        creatorApp?.full_name?.trim() ||
        existingAuthUser?.user_metadata?.full_name ||
        cleanEmail.split('@')[0];

      // Strictly read-only pre-launch check: never mint auth users or set random passwords
      // on an unauthenticated lookup endpoint (prevents OTP/password registration deadlock).
      return NextResponse.json({
        status: 'approved_creator',
        isFounder,
        email: cleanEmail,
        displayName,
        hasAccount: Boolean(existingAuthUser),
      });
    }

    // 3. Pending or Waitlisted Creator Application
    if (creatorApp && (creatorApp.status === 'pending' || creatorApp.status === 'waitlist')) {
      return NextResponse.json({
        status: 'pending_creator',
        applicationStatus: creatorApp.status,
        fullName: creatorApp.full_name || cleanEmail.split('@')[0],
        email: cleanEmail,
      });
    }

    // 4. Unregistered visitor or pre-launch Member — check if already on member_waitlist
    const { data: waitlistRow } = await supabaseAdmin
      .from('member_waitlist')
      .select('id')
      .eq('email', cleanEmail)
      .maybeSingle();

    return NextResponse.json({
      status: 'unregistered',
      alreadyOnWaitlist: Boolean(waitlistRow),
      email: cleanEmail,
    });
  } catch (err: any) {
    console.error('[Prelaunch Access Check Error]:', err);
    return NextResponse.json(
      { error: 'Unable to verify pre-launch status. Please try again.' },
      { status: 500 }
    );
  }
}
