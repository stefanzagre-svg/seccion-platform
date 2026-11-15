import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin-client';
import { resolveCreatorSplitRatio } from '@/lib/escrow-dual-ledger';
import { z } from 'zod';

const releaseSchema = z.object({
  orderId: z.string().uuid(),
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
    const parsed = releaseSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid parameters', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { orderId } = parsed.data;
    const admin = createAdminClient();

    // Verify order exists and authenticated fan owns it
    const { data: order } = await admin
      .from('matrix_escrow_orders')
      .select('*')
      .eq('id', orderId)
      .eq('fan_id', user.id)
      .single();

    if (!order) {
      return NextResponse.json(
        { error: 'Escrow order not found or unauthorized' },
        { status: 404 }
      );
    }

    if (order.status === 'completed') {
      return NextResponse.json(
        { error: 'Escrow order already released' },
        { status: 400 }
      );
    }

    if (order.status !== 'delivered') {
      return NextResponse.json(
        { error: 'Order has not been delivered yet' },
        { status: 400 }
      );
    }

    // 1. Atomically transition status 'delivered' -> 'completed' first (prevents concurrent double release)
    const nowIso = new Date().toISOString();
    const { data: lockedRelease, error: transitionErr } = await admin
      .from('matrix_escrow_orders')
      .update({
        status: 'completed',
        completed_at: nowIso,
        updated_at: nowIso,
      })
      .eq('id', orderId)
      .eq('status', 'delivered')
      .select('id')
      .single();

    if (transitionErr || !lockedRelease) {
      return NextResponse.json(
        { error: 'Order already released or concurrently modified' },
        { status: 409 }
      );
    }

    // 2. Evaluate creator revenue split (90% Founding 1st Year vs 80% Standard)
    const { data: creatorProfile } = await admin
      .from('profiles')
      .select('is_approved_founder_creator, promo_90_approved_at, custom_creator_rate')
      .eq('id', order.creator_id)
      .single();

    const { creatorSplitRatio, platformSplitRatio } = resolveCreatorSplitRatio(creatorProfile);

    const grossPills = Number(order.red_pills_amount || 0);
    const grossEur = Number((grossPills * 1.0).toFixed(2));
    const creatorNetShare = Number((grossEur * creatorSplitRatio).toFixed(2));
    const platformShare = Number((grossEur * platformSplitRatio).toFixed(2));

    // 3. Credit Creator Earnings Ledger via admin client
    const { error: ledgerErr } = await admin.from('creator_earnings_ledger').insert({
      creator_id: order.creator_id,
      fan_id: user.id,
      item_type: 'escrow_custom_order',
      red_pills_gross: grossPills,
      gross_fiat_value: grossEur,
      gateway_toll_deducted: 0.0,
      net_pool_value: grossEur,
      creator_share_amount: creatorNetShare,
      platform_share_amount: platformShare,
      split_ratio_creator: creatorSplitRatio,
      split_ratio_platform: platformSplitRatio,
      status: 'credited',
    });

    if (ledgerErr) {
      return NextResponse.json(
        { error: 'Order released but earnings ledger entry failed' },
        { status: 500 }
      );
    }

    // 4. Award Blue Pill (Chemistry XP) Reward to both Fan and Creator
    const xpReward = Number(order.blue_pills_xp_reward || 50);

    const { data: fanW } = await admin
      .from('user_wallets')
      .select('blue_pills_xp')
      .eq('user_id', user.id)
      .single();
    await admin
      .from('user_wallets')
      .update({ blue_pills_xp: Number(fanW?.blue_pills_xp || 0) + xpReward, updated_at: nowIso })
      .eq('user_id', user.id);

    const { data: crW } = await admin
      .from('user_wallets')
      .select('blue_pills_xp')
      .eq('user_id', order.creator_id)
      .single();
    await admin
      .from('user_wallets')
      .update({
        blue_pills_xp: Number(crW?.blue_pills_xp || 0) + xpReward,
        updated_at: nowIso,
      })
      .eq('user_id', order.creator_id);

    return NextResponse.json({
      success: true,
      message: `Escrow released! Creator credited ${Math.round(creatorSplitRatio * 100)}% and both awarded ${xpReward} Blue Pills XP (💊).`,
      creatorCreditedEur: creatorNetShare,
      creatorSplitApplied: creatorSplitRatio,
      requiredLedger: order.required_ledger || 'sovereign_red_pills',
      bluePillsXpAwarded: xpReward,
    });
  } catch (err: unknown) {
    console.error('Release escrow error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
