import { NextResponse, NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'creator') {
      return NextResponse.json({ error: 'Only creators can purchase the Ultimate Pack' }, { status: 403 });
    }

    const origin = request.nextUrl.origin;
    const segpayEticketId = process.env.SEGPAY_ETICKET_ID || 'demo';
    const isDemoMode = !process.env.SEGPAY_ETICKET_ID || process.env.SEGPAY_ETICKET_ID === 'demo';
    const pricepointId = process.env.SEGPAY_PRICEPOINT_ULTIMATE || 'pricepoint_ultimate_003';

    if (isDemoMode) {
      // Simulate immediate grant in demo mode
      const expiresAt = new Date();
      expiresAt.setMonth(expiresAt.getMonth() + 1);

      await supabase
        .from('profiles')
        .update({
          creator_ultimate_pack: true,
          creator_ultimate_pack_expires_at: expiresAt.toISOString()
        })
        .eq('id', user.id);

      return NextResponse.json({ 
        success: true, 
        message: '[Segpay Demo Mode] Subscribed to Creator Ultimate Pack (€69/mo)',
        expiresAt: expiresAt.toISOString(),
        url: `${origin}/studio?checkout=success&pack=ultimate`
      });
    }

    // Production Segpay Join Link for Ultimate Pack
    const SEGPAY_BASE_URL = 'https://secure2.segpay.com/billing/poset.cgi';
    const params = new URLSearchParams({
      'x-eticketid': segpayEticketId,
      'pricepoint_id': pricepointId,
      'extra_member_id': user.id,
      'extra_tier': 'ultimate_pack',
      'approved_url': `${origin}/studio?checkout=success&pack=ultimate`,
      'declined_url': `${origin}/studio?checkout=cancelled`,
    });

    return NextResponse.json({ 
      success: true, 
      url: `${SEGPAY_BASE_URL}?${params.toString()}`
    });

  } catch (error: any) {
    console.error('Segpay Ultimate Pack error:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}
