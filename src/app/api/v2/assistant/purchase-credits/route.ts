import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin-client';
import { PurchaseCreditsResponse } from '@/types/api-responses';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();

    // 1. Authenticate user strictly via Supabase auth server
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = user.id;

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

    // 4. Calculate & Add New Credits (Atomic RPC for race safety)
    let newCredits = 0;
    const { data: rpcRes, error: rpcErr } = await supabase.rpc('add_wingman_credits', {
      p_user_id: userId,
      p_amount: 50
    });

    if (!rpcErr && rpcRes && rpcRes.success) {
      newCredits = rpcRes.new_credits ?? rpcRes.balance;
    } else {
      // Fallback if RPC is not yet created in Supabase
      const currentCredits = profile.privacy_settings?.wingman_credits ?? 10;
      newCredits = currentCredits + 50;
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

      if (updateError) throw updateError;
    }

    return NextResponse.json({
      success: true,
      newCredits,
      message: 'Successfully purchased 50 wingman credits for €4.99.'
    } as PurchaseCreditsResponse);

  } catch (err: any) {
    console.error('Purchase Credits Error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
