import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

const createEscrowSchema = z.object({
  creatorId: z.string().uuid(),
  title: z.string().min(3).max(150),
  description: z.string().min(10).max(2000),
  redPillsAmount: z.number().int().min(10, 'Minimum order is 10 Red Pills (💊)'),
  daysToDeliver: z.number().int().min(1).max(30).default(7)
});

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authErr } = await supabase.auth.getUser();

    if (authErr || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const parsed = createEscrowSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid parameters', details: parsed.error.format() }, { status: 400 });
    }

    const { creatorId, title, description, redPillsAmount, daysToDeliver } = parsed.data;

    if (user.id === creatorId) {
      return NextResponse.json({ error: 'Cannot order from yourself' }, { status: 400 });
    }

    // 1. Check fan's Red Pill wallet balance
    const { data: wallet } = await supabase
      .from('user_wallets')
      .select('red_pills_balance, blue_pills_xp')
      .eq('user_id', user.id)
      .single();

    const currentRedPills = wallet?.red_pills_balance ?? 0;

    if (currentRedPills < redPillsAmount) {
      return NextResponse.json({
        error: 'INSUFFICIENT_RED_PILLS',
        message: 'You need more Red Pills (💊) to place this escrow order.',
        required: redPillsAmount,
        currentBalance: currentRedPills
      }, { status: 402 });
    }

    // 2. Lock Red Pills (Deduct from active wallet)
    await supabase
      .from('user_wallets')
      .update({
        red_pills_balance: currentRedPills - redPillsAmount,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id);

    // 3. Create Escrow Order
    const deadline = new Date(Date.now() + daysToDeliver * 24 * 60 * 60 * 1000).toISOString();
    const { data: order, error: orderErr } = await supabase
      .from('matrix_escrow_orders')
      .insert({
        fan_id: user.id,
        creator_id: creatorId,
        title,
        description,
        red_pills_amount: redPillsAmount,
        blue_pills_xp_reward: Math.max(25, Math.round(redPillsAmount * 0.5)), // Awards Blue Pill XP upon delivery
        status: 'held_in_escrow',
        deadline_at: deadline
      })
      .select()
      .single();

    if (orderErr) throw orderErr;

    // 4. Log transaction
    await supabase.from('matrix_transactions').insert({
      user_id: user.id,
      transaction_type: 'escrow_lock',
      red_pills_amount: redPillsAmount,
      fiat_amount: Number((redPillsAmount * 1.00).toFixed(2)),
      payment_method: 'internal_balance',
      status: 'pending',
      metadata: { orderId: order.id, creatorId, type: 'custom_order_escrow' }
    });

    return NextResponse.json({
      success: true,
      order,
      lockedRedPills: redPillsAmount,
      remainingBalance: currentRedPills - redPillsAmount
    });
  } catch (err: any) {
    console.error('Create escrow order error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
