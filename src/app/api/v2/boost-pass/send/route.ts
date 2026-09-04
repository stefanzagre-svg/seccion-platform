import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
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

    const supabase = await createClient();

    // 1. Fetch Sender XP Profile to verify availability
    const { data: xpProfile, error: xpError } = await supabase
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

    // 2. Insert transaction
    const { data: transaction, error: txError } = await supabase
      .from('boost_pass_transactions')
      .insert({
        sender_id: senderId,
        receiver_id: receiverId,
        status: 'pending'
      })
      .select('*')
      .single();

    if (txError) {
      if (txError.message.includes('uniq_sender_receiver')) {
        return NextResponse.json({ error: 'A Boost Pass transaction already exists between these users' }, { status: 409 });
      }
      throw txError;
    }

    // 3. Decrement sender's available passes
    const { error: decError } = await supabase
      .from('user_xp_profiles')
      .update({
        boost_passes_available: xpProfile.boost_passes_available - 1,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', senderId);

    if (decError) throw decError;

    return NextResponse.json({
      success: true,
      transaction,
      message: 'Boost Pass successfully sent'
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
