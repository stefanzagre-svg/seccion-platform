import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin-client';
import { 
  normalizeUsername, 
  isValidUsernameFormat, 
  isReservedUsername 
} from '@/lib/reserved-usernames';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const rawUsername = searchParams.get('username');

    if (!rawUsername) {
      return NextResponse.json({ available: false, reason: 'Username parameter is required.' }, { status: 400 });
    }

    const cleanUsername = normalizeUsername(rawUsername);

    if (!isValidUsernameFormat(cleanUsername)) {
      return NextResponse.json({ 
        available: false, 
        reason: 'Username must be 3 to 30 characters using letters, numbers, dots, and underscores.' 
      });
    }

    if (isReservedUsername(cleanUsername)) {
      return NextResponse.json({ 
        available: false, 
        reason: 'This username is reserved by SECCION.' 
      });
    }

    // Identify requesting user to permit checking their own handle
    let currentUserId: string | null = null;
    try {
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        currentUserId = user.id;
      }
    } catch {
      // Optional authentication for pre-signup checks
    }

    const admin = createAdminClient();

    // 1. Direct collision check in profiles table
    const { data: existingUser } = await admin
      .from('profiles')
      .select('id, username')
      .ilike('username', cleanUsername)
      .maybeSingle();

    if (existingUser) {
      if (currentUserId && existingUser.id === currentUserId) {
        return NextResponse.json({ 
          available: true, 
          isCurrent: true, 
          username: cleanUsername,
          message: 'This is already your current handle.' 
        });
      }
      return NextResponse.json({ 
        available: false, 
        reason: 'This username is already claimed.' 
      });
    }

    // 2. Active 30-day alias / previous redirect check
    const { data: previousCreator } = await admin
      .from('profiles')
      .select('id, username, privacy_settings')
      .filter('privacy_settings->previous_usernames', 'cs', JSON.stringify([{ username: cleanUsername }]))
      .maybeSingle();

    if (previousCreator && previousCreator.id !== currentUserId) {
      const list = previousCreator.privacy_settings?.previous_usernames;
      if (Array.isArray(list)) {
        const entry = list.find((item: any) => item?.username?.toLowerCase() === cleanUsername);
        const isStillActive = entry?.expires_at ? new Date(entry.expires_at).getTime() > Date.now() : true;
        if (isStillActive) {
          return NextResponse.json({ 
            available: false, 
            reason: 'This username is temporarily reserved under another creator’s redirect window.' 
          });
        }
      }
    }

    return NextResponse.json({ 
      available: true, 
      username: cleanUsername 
    });
  } catch (err: any) {
    console.error('[Check Username API] Unexpected error:', err);
    return NextResponse.json({ error: 'Failed to verify username availability.' }, { status: 500 });
  }
}
