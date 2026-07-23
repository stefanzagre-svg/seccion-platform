import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const supabase = await createClient();

    // 1. Fetch User XP Profile
    const { data: xpProfile, error: xpError } = await supabase
      .from('user_xp_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    let finalXpProfile = xpProfile;

    if (xpError && xpError.code === 'PGRST116') {
      // Create profile row if it doesn't exist
      const { data: newProfile, error: insertError } = await supabase
        .from('user_xp_profiles')
        .insert({ user_id: userId, current_xp: 0, boost_passes_available: 0 })
        .select('*')
        .single();
      
      if (!insertError) {
        finalXpProfile = newProfile;
      }
    }

    // 2. Fetch Pending/Active Transactions (sent or received by this user)
    const { data: transactions, error: txError } = await supabase
      .from('boost_pass_transactions')
      .select(`
        *,
        sender_profile:profiles!boost_pass_transactions_sender_id_fkey(id, username, display_name, avatar_url),
        receiver_profile:profiles!boost_pass_transactions_receiver_id_fkey(id, username, display_name, avatar_url)
      `)
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
      .eq('status', 'pending');

    return NextResponse.json({
      xp: finalXpProfile?.current_xp ?? 0,
      passesAvailable: finalXpProfile?.boost_passes_available ?? 0,
      transactions: transactions || []
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
