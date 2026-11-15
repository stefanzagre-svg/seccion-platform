import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin-client';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let body: any;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Malformed JSON payload' }, { status: 400 });
    }
    const { senderId, receiverId } = body || {};

    if (!senderId || !receiverId) {
      return NextResponse.json({ error: 'Missing required fields: senderId, receiverId' }, { status: 400 });
    }

    if (senderId !== user.id) {
      return NextResponse.json({ error: 'Forbidden — senderId must match authenticated user' }, { status: 403 });
    }

    if (senderId === receiverId) {
      return NextResponse.json({ error: 'Cannot send a Boost Pass to yourself' }, { status: 400 });
    }

    const adminClient = createAdminClient();

    // 1. Fetch Sender XP Profile to verify availability
    const { data: xpProfile, error: xpError } = await adminClient
      .from('user_xp_profiles')
      .select('*')
      .eq('user_id', senderId)
      .single();

    if (xpError || !xpProfile) {
      return NextResponse.json({ error: 'XP Profile not found for sender' }, { status: 404 });
    }

    if (xpProfile.boost_passes_available <= 0) {
      return NextResponse.json({ error: 'No Boost Passes available' }, { status: 400 });
    }

    // 2. Atomically decrement sender's available passes first (optimistic lock >= 1)
    const { data: updatedXp, error: decError } = await adminClient
      .from('user_xp_profiles')
      .update({
        boost_passes_available: xpProfile.boost_passes_available - 1,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', senderId)
      .gte('boost_passes_available', 1)
      .select('boost_passes_available')
      .maybeSingle();

    if (decError || !updatedXp) {
      return NextResponse.json({ error: 'No Boost Passes available' }, { status: 400 });
    }

    // 3. Insert transaction
    const { data: transaction, error: txError } = await adminClient
      .from('boost_pass_transactions')
      .insert({
        sender_id: senderId,
        receiver_id: receiverId,
        status: 'pending'
      })
      .select('*')
      .single();

    if (txError) {
      // Restore pass on conflict/failure
      await adminClient
        .from('user_xp_profiles')
        .update({ boost_passes_available: xpProfile.boost_passes_available })
        .eq('user_id', senderId);
      if (txError.message.includes('uniq_sender_receiver')) {
        return NextResponse.json({ error: 'A Boost Pass transaction already exists between these users' }, { status: 409 });
      }
      throw txError;
    }

    return NextResponse.json({
      success: true,
      transaction,
      message: 'Boost Pass successfully sent'
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
