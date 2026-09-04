import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

const spendSchema = z.object({
  creatorId: z.string().uuid({ message: 'Invalid creatorId' }),
  redPillsAmount: z.number().int().positive({ message: 'Red Pills amount must be positive integer' }),
  itemType: z.enum(['tip', 'stream_access', 'ppv_teaser', 'vip_subscription', 'ai_wingman_boost']),
  metadata: z.record(z.string(), z.any()).optional().default({})
});

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const rawBody = await req.json().catch(() => null);
    const parsed = spendSchema.safeParse(rawBody);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid parameters', details: parsed.error.format() }, { status: 400 });
    }

    const { creatorId, redPillsAmount, itemType, metadata } = parsed.data;

    // 1. Check user wallet balance
    const { data: wallet, error: walletError } = await supabase
      .from('user_wallets')
      .select('red_pills_balance')
      .eq('user_id', user.id)
      .single();

    const currentBalance = wallet?.red_pills_balance ?? 0;

    if (currentBalance < redPillsAmount) {
      return NextResponse.json({
        error: 'INSUFFICIENT_RED_PILLS',
        message: 'You need more Red Pills (💊) to unlock this action.',
        required: redPillsAmount,
        currentBalance
      }, { status: 402 });
    }

    // 2. Deduct Red Pills from fan's wallet
    const { error: deductError } = await supabase
      .from('user_wallets')
      .update({
        red_pills_balance: currentBalance - redPillsAmount,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id);

    if (deductError) {
      return NextResponse.json({ error: 'Failed to deduct tokens' }, { status: 500 });
    }

    // 3. Calculate 90% Creator / 10% Platform settlement
    // Peg baseline: 1 Red Pill = ~€0.90 net payout value
    const grossFiatValue = redPillsAmount * 1.00;
    const gatewayToll = metadata.gateway_toll ? Number(metadata.gateway_toll) : 0.00;
    const netPool = Math.max(0, grossFiatValue - gatewayToll);
    const creatorShare = Number((netPool * 0.90).toFixed(2));
    const platformShare = Number((netPool * 0.10).toFixed(2));

    // 4. Record in creator earnings ledger
    await supabase.from('creator_earnings_ledger').insert({
      creator_id: creatorId,
      fan_id: user.id,
      item_type: itemType,
      red_pills_gross: redPillsAmount,
      gross_fiat_value: grossFiatValue,
      gateway_toll_deducted: gatewayToll,
      net_pool_value: netPool,
      creator_share_amount: creatorShare,
      platform_share_amount: platformShare,
      split_ratio_creator: 0.90,
      split_ratio_platform: 0.10,
      status: 'credited'
    });

    // 5. Log transaction
    await supabase.from('matrix_transactions').insert({
      user_id: user.id,
      transaction_type: `spend_${itemType}`,
      red_pills_amount: redPillsAmount,
      fiat_amount: grossFiatValue,
      payment_method: 'internal_balance',
      status: 'completed',
      metadata: { creatorId, itemType, ...metadata }
    });

    return NextResponse.json({
      success: true,
      deducted: redPillsAmount,
      remainingBalance: currentBalance - redPillsAmount,
      creatorCredited: creatorShare,
      itemType
    });
  } catch (err: any) {
    console.error('Matrix spend error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
