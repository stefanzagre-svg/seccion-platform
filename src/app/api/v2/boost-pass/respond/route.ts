import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const { transactionId, action } = await request.json();

    if (!transactionId || !action || !['accepted', 'declined'].includes(action)) {
      return NextResponse.json({ error: 'Missing or invalid parameters: transactionId, action' }, { status: 400 });
    }

    const supabase = await createClient();

    // 1. Fetch Transaction details
    const { data: transaction, error: txError } = await supabase
      .from('boost_pass_transactions')
      .select('*')
      .eq('id', transactionId)
      .single();

    if (txError || !transaction) {
      return NextResponse.json({ error: 'Boost Pass transaction not found' }, { status: 404 });
    }

    if (transaction.status !== 'pending') {
      return NextResponse.json({ error: 'Transaction is no longer pending' }, { status: 400 });
    }

    if (action === 'accepted') {
      // 2. Mutual relationship updates to Level 3 (Friendly) -> gauge_score = 16
      const { error: rel1Error } = await supabase
        .from('relationships')
        .upsert({
          user_id: transaction.sender_id,
          target_id: transaction.receiver_id,
          is_matched: true,
          gauge_score: 16,
          current_level: 'friendly'
        }, { onConflict: 'user_id,target_id' });

      if (rel1Error) throw rel1Error;

      const { error: rel2Error } = await supabase
        .from('relationships')
        .upsert({
          user_id: transaction.receiver_id,
          target_id: transaction.sender_id,
          is_matched: true,
          gauge_score: 16,
          current_level: 'friendly'
        }, { onConflict: 'user_id,target_id' });

      if (rel2Error) throw rel2Error;

      // 3. Mark transaction as accepted
      const { error: updateTxError } = await supabase
        .from('boost_pass_transactions')
        .update({ status: 'accepted' })
        .eq('id', transactionId);

      if (updateTxError) throw updateTxError;

      return NextResponse.json({
        success: true,
        action: 'accepted',
        message: 'Boost Pass accepted. Both users are now RLS Level 3 Friendly!'
      });

    } else {
      // action === 'declined'
      // 4. Mark transaction as declined
      const { error: updateTxError } = await supabase
        .from('boost_pass_transactions')
        .update({ status: 'declined' })
        .eq('id', transactionId);

      if (updateTxError) throw updateTxError;

      // 5. Refund the Boost Pass back to the sender
      const { data: xpProfile } = await supabase
        .from('user_xp_profiles')
        .select('boost_passes_available')
        .eq('user_id', transaction.sender_id)
        .single();

      if (xpProfile) {
        await supabase
          .from('user_xp_profiles')
          .update({
            boost_passes_available: xpProfile.boost_passes_available + 1,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', transaction.sender_id);
      }

      return NextResponse.json({
        success: true,
        action: 'declined',
        message: 'Boost Pass declined. Refunded pass to sender.'
      });
    }

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
