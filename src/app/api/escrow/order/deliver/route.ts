import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

const deliverSchema = z.object({
  orderId: z.string().uuid(),
  mediaUrl: z.string().url(),
  notes: z.string().optional()
});

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authErr } = await supabase.auth.getUser();

    if (authErr || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const parsed = deliverSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid parameters', details: parsed.error.format() }, { status: 400 });
    }

    const { orderId, mediaUrl, notes } = parsed.data;

    // Verify creator owns this escrow order
    const { data: order } = await supabase
      .from('matrix_escrow_orders')
      .select('*')
      .eq('id', orderId)
      .eq('creator_id', user.id)
      .single();

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (order.status !== 'held_in_escrow' && order.status !== 'in_progress') {
      return NextResponse.json({ error: `Cannot deliver order in status: ${order.status}` }, { status: 400 });
    }

    // Set status to delivered and trigger 48-hour auto-release countdown
    const autoReleaseAt = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();

    const { data: updatedOrder, error: updateErr } = await supabase
      .from('matrix_escrow_orders')
      .update({
        status: 'delivered',
        delivery_media_url: mediaUrl,
        delivery_notes: notes || null,
        delivered_at: new Date().toISOString(),
        auto_release_at: autoReleaseAt,
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId)
      .select()
      .single();

    if (updateErr) throw updateErr;

    return NextResponse.json({
      success: true,
      message: 'Milestone delivered. Fan has 48 hours to accept before auto-release.',
      order: updatedOrder
    });
  } catch (err: any) {
    console.error('Deliver escrow error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
