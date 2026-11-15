import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin-client';
import { computeDualWalletDebit, resolveCreatorSplitRatio } from '@/lib/escrow-dual-ledger';
import { z } from 'zod';

const contributeSchema = z.object({
  goalId: z.string().uuid(),
  amount: z.number().int().min(1).max(10000),
  message: z.string().max(300).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authErr,
    } = await supabase.auth.getUser();
    if (authErr || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json().catch(() => null);
    const parsed = contributeSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid contribution parameters', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { goalId, amount, message } = parsed.data;
    const admin = createAdminClient();

    const { data: goal, error: goalErr } = await admin
      .from('creator_goals')
      .select('id, creator_id, current_amount, target_amount, is_completed')
      .eq('id', goalId)
      .single();

    if (goalErr || !goal) {
      return NextResponse.json({ error: 'Funding goal not found' }, { status: 404 });
    }

    if (goal.creator_id === user.id) {
      return NextResponse.json({ error: 'Creators cannot sponsor their own funding goal' }, { status: 400 });
    }

    const { data: wallet } = await admin
      .from('user_wallets')
      .select('sfw_credits_balance, red_pills_balance')
      .eq('user_id', user.id)
      .single();

    const debit = computeDualWalletDebit(wallet, 'sfw_credits', amount);
    if (!debit.ok) {
      return NextResponse.json(
        {
          error: debit.errorCode,
          required: amount,
          currentBalance: debit.available,
          message: `Insufficient SFW Studio Credits. Needed: ${amount}, Available: ${debit.available}.`,
        },
        { status: 402 }
      );
    }

    const { data: debitedWallet, error: debitErr } = await admin
      .from('user_wallets')
      .update(debit.updatePayload)
      .eq('user_id', user.id)
      .gte('sfw_credits_balance', amount)
      .select('sfw_credits_balance')
      .single();

    if (debitErr || !debitedWallet) {
      return NextResponse.json({ error: 'INSUFFICIENT_SFW_CREDITS' }, { status: 402 });
    }

    const { error: contribErr } = await admin.from('goal_contributions').insert({
      goal_id: goalId,
      contributor_id: user.id,
      amount,
      message: message?.trim() || null,
    });

    if (contribErr) {
      await admin
        .from('user_wallets')
        .update({ sfw_credits_balance: debit.previousBalance })
        .eq('user_id', user.id);
      return NextResponse.json({ error: contribErr.message }, { status: 500 });
    }

    const newAmount = Number(goal.current_amount || 0) + amount;
    await admin
      .from('creator_goals')
      .update({
        current_amount: newAmount,
        is_completed: newAmount >= Number(goal.target_amount || 0),
      })
      .eq('id', goalId);

    const { data: creatorProfile } = await admin
      .from('profiles')
      .select('is_approved_founder_creator, promo_90_approved_at, custom_creator_rate')
      .eq('id', goal.creator_id)
      .maybeSingle();

    const { creatorSplitRatio, platformSplitRatio } = resolveCreatorSplitRatio(creatorProfile);
    const grossEur = Number(amount.toFixed(2));
    await admin.from('creator_earnings_ledger').insert({
      creator_id: goal.creator_id,
      fan_id: user.id,
      item_type: 'goal_contribution',
      red_pills_gross: amount,
      gross_fiat_value: grossEur,
      gateway_toll_deducted: 0.0,
      net_pool_value: grossEur,
      creator_share_amount: Number((grossEur * creatorSplitRatio).toFixed(2)),
      platform_share_amount: Number((grossEur * platformSplitRatio).toFixed(2)),
      split_ratio_creator: creatorSplitRatio,
      split_ratio_platform: platformSplitRatio,
      status: 'credited',
    });

    await admin.from('matrix_transactions').insert({
      user_id: user.id,
      transaction_type: 'spend_goal_contribution',
      red_pills_amount: amount,
      fiat_amount: grossEur,
      payment_method: 'internal_balance',
      status: 'completed',
      metadata: { goalId, creatorId: goal.creator_id, requiredLedger: 'sfw_credits' },
    });

    return NextResponse.json({
      success: true,
      newGoalAmount: newAmount,
      remainingBalance: debit.newBalance,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to process contribution';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
