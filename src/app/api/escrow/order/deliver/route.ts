import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin-client';
import {
  classifyOrderIntent,
  qualifyDeliveredMedia,
  type ContentSafetyRating,
} from '@/lib/sightengine';
import { z } from 'zod';

const deliverSchema = z.object({
  orderId: z.string().uuid(),
  mediaUrl: z.string().url(),
  notes: z.string().optional(),
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
    const parsed = deliverSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid parameters', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { orderId, mediaUrl, notes } = parsed.data;
    const admin = createAdminClient();

    // Verify creator owns this escrow order via admin client after auth verification
    const { data: order } = await admin
      .from('matrix_escrow_orders')
      .select('*')
      .eq('id', orderId)
      .eq('creator_id', user.id)
      .single();

    if (!order) {
      return NextResponse.json(
        { error: 'Escrow order not found or unauthorized' },
        { status: 404 }
      );
    }

    if (order.status !== 'held_in_escrow' && order.status !== 'in_progress') {
      return NextResponse.json(
        { error: `Order is currently '${order.status}' and cannot be delivered.` },
        { status: 400 }
      );
    }

    // STAGE 2 GATE: Real Sightengine AI audit of delivered media against order classification + WAD/Gore
    const orderRating: ContentSafetyRating =
      (order.content_rating as ContentSafetyRating | null) ||
      classifyOrderIntent({
        category: order.category,
        title: order.title,
        description: order.description,
      }).rating;

    const mediaVerdict = await qualifyDeliveredMedia(mediaUrl, orderRating);

    if (mediaVerdict.isBlockedProhibited || mediaVerdict.isBlockedForSfwLedger) {
      return NextResponse.json(
        {
          error: mediaVerdict.isBlockedProhibited
            ? 'MEDIA_PROHIBITED_SAFETY_BLOCK'
            : 'MEDIA_RATING_MISMATCH_BLOCK',
          message: mediaVerdict.reason,
          orderRating,
          detectedMediaRating: mediaVerdict.rating,
          requiredLedgerForThisMedia: mediaVerdict.requiredLedger,
          safetyFlags: mediaVerdict.safetyFlags || [],
          sightengineVerdict: mediaVerdict,
        },
        { status: 422 }
      );
    }

    const now = new Date();
    const autoReleaseAt = new Date(now.getTime() + 72 * 60 * 60 * 1000).toISOString();
    const baseUpdate = {
      status: 'delivered',
      delivery_media_url: mediaUrl,
      delivery_notes: notes || null,
      delivered_at: now.toISOString(),
      auto_release_at: autoReleaseAt,
      updated_at: now.toISOString(),
    };

    let updated: Record<string, unknown> | null = null;
    const firstAttempt = await admin
      .from('matrix_escrow_orders')
      .update({
        ...baseUpdate,
        sightengine_delivery_verdict: mediaVerdict,
      })
      .eq('id', orderId)
      .select()
      .single();

    if (firstAttempt.error) {
      const msg = firstAttempt.error.message || '';
      if (msg.includes('sightengine_delivery_verdict') || firstAttempt.error.code === '42703') {
        const fallback = await admin
          .from('matrix_escrow_orders')
          .update(baseUpdate)
          .eq('id', orderId)
          .select()
          .single();

        if (fallback.error) {
          return NextResponse.json({ error: 'Failed to submit delivery' }, { status: 500 });
        }
        updated = fallback.data as Record<string, unknown>;
      } else {
        return NextResponse.json({ error: 'Failed to submit delivery' }, { status: 500 });
      }
    } else {
      updated = firstAttempt.data as Record<string, unknown>;
    }

    return NextResponse.json({
      success: true,
      order: updated,
      mediaVerdict,
      message: 'Content delivered and qualified! Fan has 72h to inspect before auto-release.',
    });
  } catch (err: unknown) {
    console.error('Deliver escrow error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
