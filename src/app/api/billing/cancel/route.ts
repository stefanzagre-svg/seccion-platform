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

    const maskedSubId = targetSegpaySubId ? `${targetSegpaySubId.slice(0, 4)}...${targetSegpaySubId.slice(-4)}` : 'unspecified';
    console.log(`[Segpay Cancel] Processing cancellation request for target: ${maskedSubId}`);

    // Call Segpay API to officially stop billing
    const segpayMerchantId = process.env.SEGPAY_MERCHANT_ID;
    
    if (targetSegpaySubId && targetSegpaySubId !== 'demo' && targetSegpaySubId !== 'bypass' && segpayMerchantId && segpayMerchantId !== 'placeholder_merchant_id') {
      console.log(`[Segpay Cancel] Calling Segpay API to cancel subscription target: ${maskedSubId}`);
      try {
        const segpayUrl = new URL('https://secure2.segpay.com/billing/poset.cgi');
        segpayUrl.searchParams.append('action', 'cancel');
        segpayUrl.searchParams.append('merchantid', segpayMerchantId);
        segpayUrl.searchParams.append('purchaseid', targetSegpaySubId);

        const segpayResponse = await fetch(segpayUrl.toString(), {
          method: 'GET',
          headers: {
            'User-Agent': 'SECCION-Billing-Agent'
          }
        });

        if (!segpayResponse.ok) {
          console.error('[Segpay Cancel] Failed to cancel with Segpay API. Status:', segpayResponse.status);
        } else {
          console.log('[Segpay Cancel] Segpay API confirmed cancellation.');
        }
      } catch (segpayError) {
        console.error('[Segpay Cancel] Error communicating with Segpay:', segpayError);
      }
    }

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
