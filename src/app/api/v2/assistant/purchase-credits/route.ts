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

    // 4. Require wallet settlement (5 SFW Studio Credits = €5 / €4.99 pack) before minting Wingman credits
    const PACK_COST_CREDITS = 5;
    const admin = createAdminClient();
    const { data: wallet } = await admin
      .from('user_wallets')
      .select('sfw_credits_balance')
      .eq('user_id', userId)
      .maybeSingle();

    const currentSfwBalance = Number(wallet?.sfw_credits_balance ?? 0);
    if (currentSfwBalance < PACK_COST_CREDITS) {
      return NextResponse.json(
        {
          error: 'INSUFFICIENT_SFW_CREDITS',
          requiredCredits: PACK_COST_CREDITS,
          currentBalance: currentSfwBalance,
          message: `You need ${PACK_COST_CREDITS} SFW Studio Credits to purchase 50 Wingman AI credits.`,
        },
        { status: 402 }
      );
    }

    const { data: debitedWallet, error: debitErr } = await admin
      .from('user_wallets')
      .update({
        sfw_credits_balance: currentSfwBalance - PACK_COST_CREDITS,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .gte('sfw_credits_balance', PACK_COST_CREDITS)
      .select('sfw_credits_balance')
      .maybeSingle();

    if (debitErr || !debitedWallet) {
      return NextResponse.json(
        { error: 'INSUFFICIENT_SFW_CREDITS', message: 'Concurrent balance change or insufficient SFW credits.' },
        { status: 402 }
      );
    }

    await admin.from('matrix_transactions').insert({
      user_id: userId,
      transaction_type: 'spend_ai_wingman_boost',
      red_pills_amount: PACK_COST_CREDITS,
      fiat_amount: 4.99,
      payment_method: 'internal_balance',
      status: 'completed',
      metadata: { wingmanCreditsGranted: 50, requiredLedger: 'sfw_credits' },
    });

    // 5. Calculate & Add New Credits (Atomic RPC for race safety)
    let newCredits = 0;
    const { data: rpcRes, error: rpcErr } = await admin.rpc('add_wingman_credits', {
      p_user_id: userId,
      p_amount: 50
    });

    if (!rpcErr && rpcRes && rpcRes.success) {
      newCredits = rpcRes.new_credits ?? rpcRes.balance;
    } else {
      const currentCredits = profile.privacy_settings?.wingman_credits ?? 10;
      newCredits = currentCredits + 50;
      const updates = {
        privacy_settings: {
          ...(profile.privacy_settings || {}),
          wingman_credits: newCredits
        }
      };
      const { error: updateError } = await admin
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
