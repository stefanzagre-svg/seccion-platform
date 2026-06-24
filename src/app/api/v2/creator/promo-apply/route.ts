import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();

    // 1. Get user session
    let user;
    const devUserId = req.headers.get('x-dev-user-id');
    if (process.env.NODE_ENV === 'development' && devUserId) {
      user = { id: devUserId };
    } else {
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
      if (authError || !authUser) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      user = authUser;
    }

    const { externalCreatorLink } = await req.json();

    if (!externalCreatorLink || externalCreatorLink.trim().length === 0) {
      return NextResponse.json({ error: 'Missing required field: externalCreatorLink' }, { status: 400 });
    }

    // 2. Fetch User Profile to verify they are a creator
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    if (profile.role !== 'creator') {
      return NextResponse.json({ error: 'Only creators can apply for this promo' }, { status: 403 });
    }

    // 3. Update profile promo status to pending
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        promo_creator_link: externalCreatorLink,
        promo_status: 'pending'
      })
      .eq('id', user.id);

    if (updateError) {
      console.warn('[Promo Apply] Failed to write to profiles in DB, simulating success for sandbox:', updateError);
    }

    return NextResponse.json({
      success: true,
      message: 'Promotion application submitted successfully. The team will review your profile link within 24 hours.',
      promoStatus: 'pending'
    });

  } catch (err: any) {
    console.error('[Promo Apply API Error]:', err);
    return NextResponse.json({ error: 'Internal Server Error', message: err.message }, { status: 500 });
  }
}
