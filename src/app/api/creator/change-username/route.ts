import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin-client';
import { 
  normalizeUsername, 
  isValidUsernameFormat, 
  isReservedUsername,
  getUsernameCooldownStatus,
  USERNAME_CHANGE_COOLDOWN_DAYS,
  USERNAME_REDIRECT_GRACE_DAYS
} from '@/lib/reserved-usernames';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized. Please sign in to update your creator handle.' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const rawNewUsername = body?.newUsername;

    if (!rawNewUsername || typeof rawNewUsername !== 'string') {
      return NextResponse.json({ error: 'A new username must be provided.' }, { status: 400 });
    }

    const cleanNewUsername = normalizeUsername(rawNewUsername);

    if (!isValidUsernameFormat(cleanNewUsername)) {
      return NextResponse.json({ 
        error: 'Invalid username format. Must be 3 to 30 characters using letters, numbers, dots, and underscores.' 
      }, { status: 400 });
    }

    if (isReservedUsername(cleanNewUsername)) {
      return NextResponse.json({ 
        error: 'This username is reserved for platform operations and cannot be claimed.' 
      }, { status: 400 });
    }

    const admin = createAdminClient();

    // 1. Fetch current creator profile
    const { data: profile, error: profileFetchError } = await admin
      .from('profiles')
      .select('id, username, role, privacy_settings, display_name')
      .eq('id', user.id)
      .single();

    if (profileFetchError || !profile) {
      return NextResponse.json({ error: 'Creator profile not found.' }, { status: 404 });
    }

    if (profile.role !== 'creator' && (profile as any).platform_role !== 'super_admin') {
      return NextResponse.json({ error: 'Only approved Creators can manage vanity handles.' }, { status: 403 });
    }

    // No-op if same username
    if (profile.username && profile.username.toLowerCase() === cleanNewUsername) {
      return NextResponse.json({ 
        success: true, 
        username: profile.username, 
        message: 'Username is unchanged.' 
      });
    }

    // 2. Cooldown Verification (14-Day Safety Rule)
    const currentPrivacy = profile.privacy_settings || {};
    const cooldown = getUsernameCooldownStatus(
      currentPrivacy.username_last_changed_at,
      USERNAME_CHANGE_COOLDOWN_DAYS
    );

    if (!cooldown.canChange) {
      return NextResponse.json({ 
        error: `Username changes are limited to once every ${USERNAME_CHANGE_COOLDOWN_DAYS} days. You can change your username again in ${cooldown.daysRemaining} days.`,
        daysRemaining: cooldown.daysRemaining,
        hoursRemaining: cooldown.hoursRemaining,
        nextAvailableDate: cooldown.nextAvailableDate?.toISOString(),
      }, { status: 429 });
    }

    // 3. Collision Check: Current Profiles
    const { data: takenProfile } = await admin
      .from('profiles')
      .select('id')
      .ilike('username', cleanNewUsername)
      .neq('id', user.id)
      .maybeSingle();

    if (takenProfile) {
      return NextResponse.json({ 
        error: 'This username is already taken by another user. Please choose a different handle.' 
      }, { status: 409 });
    }

    // 4. Collision Check: Active 30-Day Aliases from other creators
    const { data: reservedAliasProfile } = await admin
      .from('profiles')
      .select('id, username, privacy_settings')
      .filter('privacy_settings->previous_usernames', 'cs', JSON.stringify([{ username: cleanNewUsername }]))
      .neq('id', user.id)
      .maybeSingle();

    if (reservedAliasProfile) {
      const aliasList = reservedAliasProfile.privacy_settings?.previous_usernames;
      if (Array.isArray(aliasList)) {
        const entry = aliasList.find((item: any) => item?.username?.toLowerCase() === cleanNewUsername);
        const isStillActive = entry?.expires_at ? new Date(entry.expires_at).getTime() > Date.now() : true;
        if (isStillActive) {
          return NextResponse.json({ 
            error: 'This handle is temporarily reserved under another creator’s 30-day forwarding window.' 
          }, { status: 409 });
        }
      }
    }

    // 5. Build Previous Usernames Array with 30-Day Forwarding Grace Period
    const previousList = Array.isArray(currentPrivacy.previous_usernames) 
      ? [...currentPrivacy.previous_usernames] 
      : [];

    const now = new Date();
    const expiresAt = new Date(now.getTime() + USERNAME_REDIRECT_GRACE_DAYS * 24 * 60 * 60 * 1000);

    if (profile.username && profile.username.toLowerCase() !== cleanNewUsername) {
      // Remove any existing duplicate of old username to avoid array bloating
      const filtered = previousList.filter((item: any) => item?.username?.toLowerCase() !== profile.username.toLowerCase());
      filtered.unshift({
        username: profile.username,
        changed_at: now.toISOString(),
        expires_at: expiresAt.toISOString(),
      });
      // Cap at 10 items
      currentPrivacy.previous_usernames = filtered.slice(0, 10);
    }

    const updatedPrivacy = {
      ...currentPrivacy,
      username_last_changed_at: now.toISOString(),
    };

    // 6. Atomically update database row
    const { error: updateError } = await admin
      .from('profiles')
      .update({
        username: cleanNewUsername,
        privacy_settings: updatedPrivacy,
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('[Change Username API] DB update failed:', updateError);
      return NextResponse.json({ error: 'Failed to update username in database.' }, { status: 500 });
    }

    // 7. Update Supabase Auth metadata
    try {
      await admin.auth.admin.updateUserById(user.id, {
        user_metadata: {
          ...user.user_metadata,
          username: cleanNewUsername,
        },
      });
    } catch (metaErr) {
      console.warn('[Change Username API] Non-fatal auth metadata update notice:', metaErr);
    }

    return NextResponse.json({
      success: true,
      username: cleanNewUsername,
      previousUsername: profile.username,
      redirectGraceDays: USERNAME_REDIRECT_GRACE_DAYS,
      cooldownDays: USERNAME_CHANGE_COOLDOWN_DAYS,
      message: `Username successfully updated to @${cleanNewUsername}. Visitors to your old link will be automatically forwarded for ${USERNAME_REDIRECT_GRACE_DAYS} days.`,
    });
  } catch (err: any) {
    console.error('[Change Username API] Critical error:', err);
    return NextResponse.json({ error: err.message || 'Internal server error changing username.' }, { status: 500 });
  }
}
