import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin-client';

export async function POST(req: NextRequest) {
  try {
    const devUserId = req.headers.get('x-dev-user-id');
    const isDevBypass = process.env.NODE_ENV === 'development' && !!devUserId;
    const supabase = isDevBypass ? createAdminClient() : await createClient();

    // 1. Authenticate user (with x-dev-user-id support in dev mode)
    let userId = null;

    if (isDevBypass) {
      userId = devUserId;
    } else {
      const { data: { session }, error: authError } = await supabase.auth.getSession();
      if (authError || !session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      userId = session.user.id;
    }

    // 2. Fetch User Profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role, privacy_settings')
      .eq('id', userId)
      .single();

    if (profileError || !profile) {
      console.error('Wingman Purchase Credits - Profile Error:', profileError, 'userId:', userId);
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // 3. Gate Role (strictly for member accounts)
    if (profile.role !== 'member') {
      return NextResponse.json({ error: 'Forbidden. Only members can purchase wingman credits.' }, { status: 403 });
    }

    // 4. Calculate New Credits (+50 credits)
    let currentCredits = profile.privacy_settings?.wingman_credits ?? 10;
    const newCredits = currentCredits + 50;

    // 5. Update user profile
    const updates = {
      privacy_settings: {
        ...(profile.privacy_settings || {}),
        wingman_credits: newCredits
      }
    };

    const { error: updateError } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId);

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json({
      success: true,
      newCredits,
      message: 'Successfully purchased 50 wingman credits for €4.99.'
    });

  } catch (err: any) {
    console.error('Purchase Credits Error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
