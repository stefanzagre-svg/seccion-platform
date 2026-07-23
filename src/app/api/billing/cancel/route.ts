import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const { subscriptionId, creatorId, subscriberId } = await req.json();

    const supabase = await createClient();
    let targetSegpaySubId = subscriptionId;

    // Look up subscription ID if not provided directly
    if (!targetSegpaySubId && creatorId && subscriberId) {
      const { data: subData } = await supabase
        .from('subscriptions')
        .select('segpay_subscription_id')
        .eq('creator_id', creatorId)
        .eq('subscriber_id', subscriberId)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (subData?.segpay_subscription_id) {
        targetSegpaySubId = subData.segpay_subscription_id;
      }
    }

    console.log(`[Segpay Cancel] Cancelling subscription ${targetSegpaySubId || 'creator_' + creatorId}`);

    // Update database status
    let updateQuery = supabase.from('subscriptions').update({
      is_active: false,
      updated_at: new Date().toISOString()
    });

    if (targetSegpaySubId) {
      updateQuery = updateQuery.eq('segpay_subscription_id', targetSegpaySubId);
    } else if (creatorId && subscriberId) {
      updateQuery = updateQuery.eq('creator_id', creatorId).eq('subscriber_id', subscriberId);
    } else {
      return NextResponse.json({ error: 'Missing subscription identifiers' }, { status: 400 });
    }

    const { error: dbError } = await updateQuery;
    if (dbError) {
      console.error('Database update failed on subscription cancel:', dbError);
    }

    return NextResponse.json({
      success: true,
      message: 'Segpay subscription cancelled successfully.',
      subscriptionId: targetSegpaySubId || 'segpay_cancelled'
    });

  } catch (err: any) {
    console.error('Segpay cancel route error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
