import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

const releaseSchema = z.object({
  orderId: z.string().uuid()
});

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authErr } = await supabase.auth.getUser();

    if (authErr || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const parsed = releaseSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid parameters', details: parsed.error.format() }, { status: 400 });
    }

    const { orderId } = parsed.data;

    // Verify order exists and fan owns it
    const { data: order } = await supabase
      .from('matrix_escrow_orders')
      .select('*')
      .eq('id', orderId)
      .eq('fan_id', user.id)
      .single();

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (order.status !== 'delivered') {
      return NextResponse.json({ error: 'Order has not been delivered yet' }, { status: 400 });
    }

    // 1. Fetch creator profile to evaluate exact rate condition
    // Standard default: 80% Creator / 20% Platform
    // Approved Founder (1st Year): 90% Creator / 10% Platform
    const { data: creatorProfile } = await supabase
      .from('profiles')
      .select('is_approved_founder_creator, promo_90_approved_at, custom_creator_rate')
      .eq('id', order.creator_id)
      .single();

    let creatorSplitRatio = 0.80; // Standard baseline: 80%

    if (creatorProfile?.custom_creator_rate !== undefined && creatorProfile.custom_creator_rate !== null) {
      creatorSplitRatio = Number(creatorProfile.custom_creator_rate);
    } else if (creatorProfile?.is_approved_founder_creator && creatorProfile?.promo_90_approved_at) {
      const approvedDate = new Date(creatorProfile.promo_90_approved_at).getTime();
      const oneYearMs = 365 * 24 * 60 * 60 * 1000;
      const isWithinFirstYear = Date.now() - approvedDate <= oneYearMs;

      if (isWithinFirstYear) {
        creatorSplitRatio = 0.90; // Special 90% 1st-Year Approved Rate
      }
    }

    const platformSplitRatio = Number((1.00 - creatorSplitRatio).toFixed(2));

    const grossPills = order.red_pills_amount;
    const grossEur = grossPills * 1.00;
    const creatorNetShare = Number((grossEur * creatorSplitRatio).toFixed(2));
    const platformShare = Number((grossEur * platformSplitRatio).toFixed(2));

    // 2. Mark order as completed
    await supabase
      .from('matrix_escrow_orders')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId);

    // 3. Credit Creator Earnings Ledger with evaluated split ratio
    await supabase.from('creator_earnings_ledger').insert({
      creator_id: order.creator_id,
      fan_id: user.id,
      item_type: 'escrow_custom_order',
      red_pills_gross: grossPills,
      gross_fiat_value: grossEur,
      gateway_toll_deducted: 0.00, // No gateway toll on internal token release!
      net_pool_value: grossEur,
      creator_share_amount: creatorNetShare,
      platform_share_amount: platformShare,
      split_ratio_creator: creatorSplitRatio,
      split_ratio_platform: platformSplitRatio,
      status: 'credited'
    });

    // 4. Award Blue Pill (Chemistry XP) Reward to both Fan and Creator!
    const xpReward = order.blue_pills_xp_reward || 50;

    // Increment Fan's Blue Pill XP
    const { data: fanW } = await supabase.from('user_wallets').select('blue_pills_xp').eq('user_id', user.id).single();
    await supabase.from('user_wallets').update({ blue_pills_xp: (fanW?.blue_pills_xp || 0) + xpReward }).eq('user_id', user.id);

    // Increment Creator's Blue Pill XP
    const { data: crW } = await supabase.from('user_wallets').select('blue_pills_xp').eq('user_id', order.creator_id).single();
    await supabase.from('user_wallets').update({ blue_pills_xp: (crW?.blue_pills_xp || 0) + xpReward }).eq('user_id', order.creator_id);

    return NextResponse.json({
      success: true,
      message: `Escrow released! Creator credited ${Math.round(creatorSplitRatio * 100)}% and both awarded ${xpReward} Blue Pills XP (💊).`,
      creatorCreditedEur: creatorNetShare,
      creatorSplitApplied: creatorSplitRatio,
      bluePillsXpAwarded: xpReward
    });
  } catch (err: any) {
    console.error('Release escrow error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
