import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin-client';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authErr,
    } = await supabase.auth.getUser();

    if (authErr || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const { creatorId, subscriberId, subscriptionId } = (
      body && typeof body === 'object' ? body : {}
    ) as {
      creatorId?: string;
      subscriberId?: string;
      subscriptionId?: string;
    };

    if (
      subscriberId &&
      subscriberId !== '' &&
      subscriberId !== 'mock-subscriber-id' &&
      subscriberId !== user.id
    ) {
      return NextResponse.json(
        { error: 'Forbidden: Cannot cancel another user subscription.' },
        { status: 403 }
      );
    }

    if (!creatorId && !subscriptionId) {
      return NextResponse.json(
        { error: 'Missing subscription identifier (creatorId or subscriptionId)' },
        { status: 400 }
      );
    }

    const admin = createAdminClient();
    const nowIso = new Date().toISOString();

    let query = admin
      .from('subscriptions')
      .update({
        status: 'cancelled',
        is_active: false,
        updated_at: nowIso,
      })
      .eq('subscriber_id', user.id);

    if (subscriptionId) {
      query = query.eq('id', subscriptionId);
    } else if (creatorId) {
      query = query.eq('creator_id', creatorId);
    }

    const { error: dbError } = await query;

    if (dbError) {
      console.error('[Billing Cancel] DB update note:', dbError.message);
      return NextResponse.json(
        { error: 'Failed to cancel subscription record' },
        { status: 500 }
      );
    }

    await admin.from('interactions').insert({
      actor_id: user.id,
      target_id: creatorId || null,
      interaction_type: 'cancellation',
      metadata: {
        subscriptionId: subscriptionId || null,
        processor: 'internal_v3_1',
        cancelledAt: nowIso,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Subscription auto-renewal cancelled successfully.',
      subscriptionId: subscriptionId || `cancelled_${user.id.slice(0, 6)}`,
    });
  } catch (err: unknown) {
    console.error('[Billing Cancel] Route error:', err);
    const msg = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
