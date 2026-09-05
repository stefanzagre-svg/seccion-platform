import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

const refundSchema = z.object({
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
    const parsed = refundSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid parameters', details: parsed.error.format() }, { status: 400 });
    }

    const { orderId } = parsed.data;

    const { data: order } = await supabase
      .from('matrix_escrow_orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Refund allowed if:
    // A) Creator explicitly cancels/declines the order
    // B) Fan requests refund AND deadline has passed without delivery
    const isCreator = order.creator_id === user.id;
    const isFan = order.fan_id === user.id;
    const deadlinePassed = new Date(order.deadline_at).getTime() < Date.now();

    if (!isCreator && (!isFan || !deadlinePassed)) {
      return NextResponse.json({ error: 'Cannot refund order before deadline expiration unless canceled by creator.' }, { status: 403 });
    }

    if (order.status !== 'held_in_escrow' && order.status !== 'in_progress') {
      return NextResponse.json({ error: `Cannot refund order in status: ${order.status}` }, { status: 400 });
    }

    // 1. Mark order as refunded
    await supabase
      .from('matrix_escrow_orders')
      .update({
        status: 'refunded',
        refunded_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId);

    // 2. Return 100% of Red Pills (💊) to Fan's wallet
    const { data: fanWallet } = await supabase
      .from('user_wallets')
      .select('red_pills_balance')
      .eq('user_id', order.fan_id)
      .single();

    await supabase
      .from('user_wallets')
      .update({
        red_pills_balance: (fanWallet?.red_pills_balance || 0) + order.red_pills_amount,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', order.fan_id);

    return NextResponse.json({
      success: true,
      message: 'Escrow order canceled. Red Pills (💊) returned to fan wallet.',
      refundedRedPills: order.red_pills_amount
    });
  } catch (err: any) {
    console.error('Refund escrow error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
