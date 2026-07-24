import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { subscriberId, creatorId, tier, price } = body;

    if (!subscriberId || !creatorId || !tier || !price) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const supabase = await createClient();

    // Fetch creator profile for reference
    const { data: creatorProfile } = await supabase
      .from('profiles')
      .select('username, display_name')
      .eq('id', creatorId)
      .single();

    const origin = req.nextUrl.origin;
    const segpayEticketId = process.env.SEGPAY_ETICKET_ID || 'demo';
    const isDemoMode = !process.env.SEGPAY_ETICKET_ID || process.env.SEGPAY_ETICKET_ID === 'demo';

    // Price point IDs configured in Segpay Merchant Portal
    const pricepointId = tier === 'master' 
      ? (process.env.SEGPAY_PRICEPOINT_MASTER || 'pricepoint_master_002')
      : (process.env.SEGPAY_PRICEPOINT_VIP || 'pricepoint_vip_001');

    if (isDemoMode) {
      // Mock Sandbox Checkout Redirection for Local / Dev testing
      console.log(`[Segpay Demo Mode] Generating mock Join Link for ${tier.toUpperCase()} subscription:`, {
        subscriberId,
        creatorId,
        tier,
        price,
        pricepointId
      });
      return NextResponse.json({ 
        url: `${origin}/profile/member?checkout=success&tier=${tier}&processor=segpay&mock=true` 
      });
    }

    // Segpay Production Join Link Generator
    const SEGPAY_BASE_URL = 'https://secure2.segpay.com/billing/poset.cgi';
    const approvedUrl = `${origin}/profile/member?checkout=success&tier=${tier}&processor=segpay`;
    const declinedUrl = `${origin}/profile/member?checkout=cancelled&processor=segpay`;

    const params = new URLSearchParams({
      'x-eticketid': segpayEticketId,
      'pricepoint_id': pricepointId,
      'extra_member_id': subscriberId,
      'extra_creator_id': creatorId,
      'extra_tier': tier,
      'extra_price': price.toString(),
      'approved_url': approvedUrl,
      'declined_url': declinedUrl,
    });

    const joinUrl = `${SEGPAY_BASE_URL}?${params.toString()}`;
    return NextResponse.json({ url: joinUrl });

  } catch (err: any) {
    console.error('Segpay Checkout Generation error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
