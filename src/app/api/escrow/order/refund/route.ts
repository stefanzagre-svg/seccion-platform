import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin-client';
import { computeDualWalletRefund } from '@/lib/escrow-dual-ledger';
import type { WalletLedgerType } from '@/lib/sightengine';
import { z } from 'zod';

const refundSchema = z.object({
  orderId: z.string().uuid(),
  reason: z.string().max(500).optional(),
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
    const parsed = refundSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid parameters', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { orderId, reason } = parsed.data;
    const admin = createAdminClient();

    const { data: order } = await admin
      .from('matrix_escrow_orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (order.fan_id !== user.id && order.creator_id !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden: Only order participants can request an escrow refund.' },
        { status: 403 }
      );
    }

    if (order.status === 'delivered') {
      return NextResponse.json(
        { error: 'Delivered orders cannot be unilaterally refunded. Open an Escrow Dispute for arbitration.' },
        { status: 409 }
      );
    }

    if (order.status !== 'held_in_escrow' && order.status !== 'in_progress') {
      return NextResponse.json(
        { error: `Order in status '${order.status}' cannot be refunded directly.` },
        { status: 400 }
      );
    }

    const refundReason = reason || 'Creator or fan cancelled escrow order.';

    // Attempt atomic Postgres FOR UPDATE refund RPC first
    const rpcCall = await admin.rpc('escrow_refund_dual_wallet', {
      p_order_id: orderId,
      p_reason: refundReason,
    });

    if (!rpcCall.error && rpcCall.data) {
      const rpcData = rpcCall.data as Record<string, unknown>;
      if (rpcData.success === true) {
        const refundedLedger = String(rpcData.refunded_ledger || order.required_ledger || 'sovereign_red_pills');
        return NextResponse.json({
          success: true,
          refundedAmount: Number(rpcData.refunded_amount ?? order.red_pills_amount),
          refundedLedger,
          atomicRpc: true,
          message:
            refundedLedger === 'sfw_credits'
              ? `${order.red_pills_amount} SFW Studio Credits (✨) refunded to fan wallet.`
              : `${order.red_pills_amount} Sovereign Red Pills (💊) refunded to fan wallet.`,
        });
      }
    }

    // Fallback: deterministic dual-ledger refund via admin client
    const requiredLedger = (order.required_ledger || 'sovereign_red_pills') as WalletLedgerType;
    const { data: fanWallet } = await admin
      .from('user_wallets')
      .select('sfw_credits_balance, red_pills_balance')
      .eq('user_id', order.fan_id)
      .single();

    const refundPlan = computeDualWalletRefund(
      fanWallet,
      requiredLedger,
      Number(order.red_pills_amount || 0)
    );

    const { error: updateOrderErr } = await admin
      .from('matrix_escrow_orders')
      .update({
        status: 'refunded',
        dispute_reason: refundReason,
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId)
      .in('status', ['held_in_escrow', 'in_progress', 'delivered']);

    if (updateOrderErr) {
      return NextResponse.json({ error: 'Failed to mark order as refunded' }, { status: 500 });
    }

    const { error: creditErr } = await admin
      .from('user_wallets')
      .update(refundPlan.updatePayload)
      .eq('user_id', order.fan_id);

    if (creditErr) {
      return NextResponse.json({ error: 'Failed to credit fan wallet refund' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      refundedAmount: order.red_pills_amount,
      refundedLedger: refundPlan.ledger,
      creditedColumn: refundPlan.column,
      newBalance: refundPlan.newBalance,
      message:
        refundPlan.ledger === 'sfw_credits'
          ? `${order.red_pills_amount} SFW Studio Credits (✨) refunded to fan wallet.`
          : `${order.red_pills_amount} Sovereign Red Pills (💊) refunded to fan wallet.`,
    });
  } catch (err: unknown) {
    console.error('Refund escrow error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
