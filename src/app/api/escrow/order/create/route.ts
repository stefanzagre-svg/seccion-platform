import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin-client';
import { classifyOrderIntent } from '@/lib/sightengine';
import { computeDualWalletDebit } from '@/lib/escrow-dual-ledger';
import { z } from 'zod';

const createEscrowSchema = z.object({
  creatorId: z.string().uuid(),
  title: z.string().min(3).max(150),
  description: z.string().min(10).max(2000),
  category: z.string().optional(),
  primaryObjective: z.string().optional(),
  explicitFlag: z.boolean().optional(),
  redPillsAmount: z.number().int().min(10, 'Minimum order is 10 credits/pills'),
  daysToDeliver: z.number().int().min(1).max(30).default(7),
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

    const body = await req.json().catch(() => ({}));
    const parsed = createEscrowSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid parameters', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const {
      creatorId,
      title,
      description,
      category,
      primaryObjective,
      explicitFlag,
      redPillsAmount,
      daysToDeliver,
    } = parsed.data;

    // Stage 1: Classify intent (SFW Studio Credits vs 18+ Sovereign Red Pills)
    const qualification = classifyOrderIntent({
      category,
      title,
      description,
      primaryObjective,
      explicitFlag,
    });

    const admin = createAdminClient();
    const deadlineIso = new Date(
      Date.now() + daysToDeliver * 24 * 60 * 60 * 1000
    ).toISOString();
    const xpReward = Math.max(25, Math.round(redPillsAmount * 0.5));

    // Attempt atomic Postgres FOR UPDATE RPC first
    const rpcCall = await admin.rpc('escrow_lock_dual_wallet', {
      p_user_id: user.id,
      p_amount: redPillsAmount,
      p_ledger: qualification.requiredLedger,
      p_creator_id: creatorId,
      p_title: title,
      p_description: description,
      p_category: category || 'General',
      p_content_rating: qualification.rating,
      p_deadline_at: deadlineIso,
    });

    if (!rpcCall.error && rpcCall.data) {
      const rpcData = rpcCall.data as Record<string, unknown>;
      if (rpcData.success === true) {
        const orderId = String(rpcData.order_id);
        return NextResponse.json({
          success: true,
          order: {
            id: orderId,
            fan_id: user.id,
            creator_id: creatorId,
            title,
            description,
            category: category || 'General',
            content_rating: qualification.rating,
            required_ledger: qualification.requiredLedger,
            red_pills_amount: redPillsAmount,
            blue_pills_xp_reward: xpReward,
            status: 'held_in_escrow',
            deadline_at: deadlineIso,
          },
          qualification,
          atomicRpc: true,
          message:
            qualification.requiredLedger === 'sfw_credits'
              ? `${redPillsAmount} SFW Studio Credits locked in escrow under SFW Lifestyle & Coaching ledger.`
              : `${redPillsAmount} Sovereign Red Pills (💊) locked in 18+ escrow.`,
        });
      }

      if (rpcData.error === 'INSUFFICIENT_SFW_CREDITS' || rpcData.error === 'INSUFFICIENT_RED_PILLS') {
        return NextResponse.json(
          {
            error: String(rpcData.error),
            requiredLedger: qualification.requiredLedger,
            contentRating: qualification.rating,
            required: redPillsAmount,
            currentBalance: Number(rpcData.available ?? 0),
            message:
              qualification.requiredLedger === 'sfw_credits'
                ? 'You need more SFW Studio Credits (✨) for this coaching/lifestyle request.'
                : 'You need more 18+ Sovereign Red Pills (💊) for this explicit order.',
          },
          { status: 402 }
        );
      }
    }

    // Fallback (when RPC is not yet deployed or mocked in tests): admin-client dual-ledger write + rollback
    const { data: wallet } = await admin
      .from('user_wallets')
      .select('sfw_credits_balance, red_pills_balance, blue_pills_xp')
      .eq('user_id', user.id)
      .single();

    const debit = computeDualWalletDebit(wallet, qualification.requiredLedger, redPillsAmount);
    if (!debit.ok) {
      return NextResponse.json(
        {
          error: debit.errorCode,
          requiredLedger: qualification.requiredLedger,
          contentRating: qualification.rating,
          required: redPillsAmount,
          currentBalance: debit.available,
          message:
            qualification.requiredLedger === 'sfw_credits'
              ? 'You need more SFW Studio Credits (✨) for this request.'
              : 'You need more 18+ Sovereign Red Pills (💊) for this explicit order.',
        },
        { status: 402 }
      );
    }

    // Atomic conditional guard on the exact ledger column
    const { data: updatedWallet, error: lockErr } = await admin
      .from('user_wallets')
      .update(debit.updatePayload)
      .eq('user_id', user.id)
      .gte(debit.column, redPillsAmount)
      .select(debit.column)
      .single();

    if (lockErr || !updatedWallet) {
      return NextResponse.json(
        {
          error:
            qualification.requiredLedger === 'sfw_credits'
              ? 'INSUFFICIENT_SFW_CREDITS'
              : 'INSUFFICIENT_RED_PILLS',
          requiredLedger: qualification.requiredLedger,
          contentRating: qualification.rating,
          message: 'Concurrent balance change detected or insufficient balance in required ledger.',
        },
        { status: 402 }
      );
    }

    const { data: order, error: orderErr } = await admin
      .from('matrix_escrow_orders')
      .insert({
        fan_id: user.id,
        creator_id: creatorId,
        title,
        description,
        category: category || 'General',
        content_rating: qualification.rating,
        required_ledger: qualification.requiredLedger,
        red_pills_amount: redPillsAmount,
        blue_pills_xp_reward: xpReward,
        status: 'held_in_escrow',
        deadline_at: deadlineIso,
      })
      .select()
      .single();

    if (orderErr || !order) {
      // Compensating rollback so funds are never stranded on DB insert failure
      await admin
        .from('user_wallets')
        .update({
          [debit.column]: debit.previousBalance,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      return NextResponse.json(
        { error: 'Failed to create escrow order record; wallet balance restored.' },
        { status: 500 }
      );
    }

    await admin.from('matrix_transactions').insert({
      user_id: user.id,
      transaction_type: 'escrow_lock',
      red_pills_amount: redPillsAmount,
      fiat_amount: Number((redPillsAmount * 1.0).toFixed(2)),
      payment_method: 'internal_balance',
      status: 'pending',
      metadata: {
        orderId: order.id,
        creatorId,
        type: 'custom_order_escrow',
        category: category || 'General',
        contentRating: qualification.rating,
        requiredLedger: qualification.requiredLedger,
      },
    });

    return NextResponse.json({
      success: true,
      order,
      qualification,
      debitedColumn: debit.column,
      remainingBalance: debit.newBalance,
      message:
        qualification.requiredLedger === 'sfw_credits'
          ? `${redPillsAmount} SFW Studio Credits locked in escrow under SFW Lifestyle & Coaching ledger.`
          : `${redPillsAmount} Sovereign Red Pills (💊) locked in 18+ escrow.`,
    });
  } catch (err: unknown) {
    console.error('Create escrow order error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
