import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin-client';
import crypto from 'crypto';

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

async function findAuthUserByEmail(supabaseAdmin: any, email: string) {
  let page = 1;
  const perPage = 1000;
  while (page <= 5) {
    const { data } = await supabaseAdmin.auth.admin.listUsers({ page, perPage });
    if (!data?.users || data.users.length === 0) break;
    const match = data.users.find((u: any) => u.email?.toLowerCase().trim() === email);
    if (match) return match;
    if (data.users.length < perPage) break;
    page++;
  }
  return null;
}

async function checkRateLimit(supabaseAdmin: any, identifier: string): Promise<boolean> {
  try {
    const { data, error } = await supabaseAdmin.rpc('check_rate_limit', {
      p_user_id: identifier,
      p_endpoint: 'auth/prelaunch-access',
      p_max_hits: 15,
      p_window_s: 60,
    });
    if (error) {
      console.warn('[RateLimit] RPC notice, allowing request:', error.message);
      return false; // fail-open
    }
    return !(data?.allowed ?? true);
  } catch (err) {
    console.warn('[RateLimit] Unexpected error, allowing request:', err);
    return false;
  }
}

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

    // Security First: Distributed IP rate limiting against email enumeration & brute force
    const isRateLimited = await checkRateLimit(supabaseAdmin, `ip_${clientIp}`);
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
      const fallbackHandle = extractHandleFromLink(creatorApp?.link1, cleanEmail);
      const baseUsername = (
        existingProfile?.username ||
        fallbackHandle ||
        existingAuthUser?.user_metadata?.username ||
        cleanEmail.split('@')[0] ||
        'creator'
      )
        .toLowerCase()
        .replace(/[^a-z0-9_]/g, '')
        .slice(0, 24) || `creator_${Math.floor(1000 + Math.random() * 9000)}`;

      const displayName =
        existingProfile?.display_name ||
        creatorApp?.full_name?.trim() ||
        existingAuthUser?.user_metadata?.full_name ||
        cleanEmail.split('@')[0];

      let targetUserId = existingAuthUser?.id || null;

      // Auto-provision auth.users record if approved in creator_applications but never created an auth user yet
      if (!targetUserId) {
        const randomPassword = crypto.randomBytes(24).toString('base64url') + 'A1!';
        const { data: created } = await supabaseAdmin.auth.admin.createUser({
          email: cleanEmail,
          password: randomPassword,
          email_confirm: true,
          user_metadata: {
            username: baseUsername,
            full_name: displayName,
            role: 'creator',
            email_verified: true,
          },
        });
        targetUserId = created?.user?.id || null;
      } else if (!existingAuthUser?.email_confirmed_at) {
        await supabaseAdmin.auth.admin.updateUserById(targetUserId, {
          email_confirm: true,
          user_metadata: {
            ...existingAuthUser?.user_metadata,
            role: 'creator',
            email_verified: true,
          },
        });
      }

      if (targetUserId) {
        await supabaseAdmin.from('profiles').upsert(
          {
            id: targetUserId,
            username: baseUsername,
            display_name: displayName,
            role: 'creator',
          },
          { onConflict: 'id' }
        );
      }

      return NextResponse.json({
        status: 'approved_creator',
        isFounder,
        email: cleanEmail,
        displayName,
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
