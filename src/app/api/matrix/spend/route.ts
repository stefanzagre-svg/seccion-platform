import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin-client';
import {
  computeDualWalletDebit,
  getLedgerForRating,
  resolveCreatorSplitRatio,
} from '@/lib/escrow-dual-ledger';
import type { ContentSafetyRating, WalletLedgerType } from '@/lib/sightengine';
import { z } from 'zod';

const spendSchema = z.object({
  creatorId: z.string().uuid({ message: 'Invalid creatorId' }),
  redPillsAmount: z
    .number()
    .int()
    .positive({ message: 'Amount must be a positive integer' }),
  itemType: z.enum([
    'tip',
    'stream_access',
    'ppv_teaser',
    'vip_subscription',
    'ai_wingman_boost',
  ]),
  ledger: z.enum(['sfw_credits', 'sovereign_red_pills']).optional(),
  contentRating: z.enum(['SFW', 'NSFW_18']).optional(),
  metadata: z.record(z.string(), z.any()).optional().default({}),
});

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const rawBody = await req.json().catch(() => null);
    const parsed = spendSchema.safeParse(rawBody);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid parameters', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { creatorId, redPillsAmount, itemType, ledger, contentRating, metadata } =
      parsed.data;

    if (creatorId === user.id) {
      return NextResponse.json(
        { error: 'Forbidden — cannot spend tokens to your own creator account.' },
        { status: 400 }
      );
    }

    const admin = createAdminClient();

    // Determine enforced ledger: check server-locked platform_content first if postId supplied
    let requiredLedger: WalletLedgerType =
      ledger ||
      (contentRating ? getLedgerForRating(contentRating as ContentSafetyRating) : 'sovereign_red_pills');

    const postId = typeof metadata?.postId === 'string' ? metadata.postId : null;
    if (postId) {
      const { data: postRow } = await admin
        .from('platform_content')
        .select('content_rating, required_ledger')
        .eq('id', postId)
        .maybeSingle();

      if (postRow?.required_ledger === 'sovereign_red_pills' || postRow?.content_rating === 'NSFW_18') {
        requiredLedger = 'sovereign_red_pills';
      } else if (postRow?.required_ledger === 'sfw_credits') {
        requiredLedger = 'sfw_credits';
      }
    }

    // 1. Read user's dual wallet balances via admin client
    const { data: wallet } = await admin
      .from('user_wallets')
      .select('sfw_credits_balance, red_pills_balance')
      .eq('user_id', user.id)
      .single();

    const debit = computeDualWalletDebit(wallet, requiredLedger, redPillsAmount);
    if (!debit.ok) {
      return NextResponse.json(
        {
          error: debit.errorCode,
          requiredLedger,
          message:
            requiredLedger === 'sfw_credits'
              ? 'You need more SFW Studio Credits (✨) to unlock this action.'
              : 'You need more Red Pills (💊) to unlock this action.',
          required: redPillsAmount,
          currentBalance: debit.available,
        },
        { status: 402 }
      );
    }

    // 2. Atomic conditional deduction on the required ledger column
    const { data: updatedWallet, error: deductError } = await admin
      .from('user_wallets')
      .update(debit.updatePayload)
      .eq('user_id', user.id)
      .gte(debit.column, redPillsAmount)
      .select(debit.column)
      .single();

    if (deductError || !updatedWallet) {
      return NextResponse.json(
        {
          error:
            requiredLedger === 'sfw_credits'
              ? 'INSUFFICIENT_SFW_CREDITS'
              : 'INSUFFICIENT_RED_PILLS',
          message: 'Concurrent balance update or insufficient tokens',
        },
        { status: 402 }
      );
    }

    // 3. Evaluate Creator / Platform Revenue Split (90% Founding vs 80% Standard)
    const { data: creatorProfile } = await admin
      .from('profiles')
      .select('is_approved_founder_creator, promo_90_approved_at, custom_creator_rate')
      .eq('id', creatorId)
      .maybeSingle();

    const { creatorSplitRatio, platformSplitRatio } = resolveCreatorSplitRatio(
      creatorProfile || { is_approved_founder_creator: false }
    );

    const grossFiatValue = Number((redPillsAmount * 1.0).toFixed(2));
    // Server-controlled zero gateway toll on internal balance spend (never client metadata)
    const gatewayToll = 0.0;
    const netPool = grossFiatValue;
    const creatorShare = Number((netPool * creatorSplitRatio).toFixed(2));
    const platformShare = Number((netPool * platformSplitRatio).toFixed(2));

    // 4. Record in creator earnings ledger via admin client
    const { error: ledgerErr } = await admin.from('creator_earnings_ledger').insert({
      creator_id: creatorId,
      fan_id: user.id,
      item_type: itemType,
      red_pills_gross: redPillsAmount,
      gross_fiat_value: grossFiatValue,
      gateway_toll_deducted: gatewayToll,
      net_pool_value: netPool,
      creator_share_amount: creatorShare,
      platform_share_amount: platformShare,
      split_ratio_creator: creatorSplitRatio,
      split_ratio_platform: platformSplitRatio,
      status: 'credited',
    });

    if (ledgerErr) {
      await admin
        .from('user_wallets')
        .update({
          [debit.column]: debit.previousBalance,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      return NextResponse.json(
        { error: 'Failed to credit creator earnings ledger; fan wallet restored.' },
        { status: 500 }
      );
    }

    // 5. Log completed internal transaction
    await admin.from('matrix_transactions').insert({
      user_id: user.id,
      transaction_type: `spend_${itemType}`,
      red_pills_amount: redPillsAmount,
      fiat_amount: grossFiatValue,
      payment_method: 'internal_balance',
      status: 'completed',
      metadata: {
        creatorId,
        itemType,
        requiredLedger,
        debitedColumn: debit.column,
        ...metadata,
      },
    });

    return NextResponse.json({
      success: true,
      deducted: redPillsAmount,
      requiredLedger,
      debitedColumn: debit.column,
      remainingBalance: debit.newBalance,
      creatorCredited: creatorShare,
      creatorSplitApplied: creatorSplitRatio,
      message: `Credited ${Math.round(creatorSplitRatio * 100)}% (€${creatorShare.toFixed(2)}) net to creator!`,
    });
  } catch (err: unknown) {
    console.error('Matrix spend error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
