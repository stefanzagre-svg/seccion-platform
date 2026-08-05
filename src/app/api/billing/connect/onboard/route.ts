import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const { paxumEmail } = await req.json();

    if (!paxumEmail) {
      return NextResponse.json({ error: 'Paxum email is required' }, { status: 400 });
    }

    const supabase = await createClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role, privacy_settings')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'creator') {
      return NextResponse.json({ error: 'Only creators can onboard for payouts' }, { status: 400 });
    }

    // Update privacy_settings with paxum_email instead of stripe_connect_id
    const updatedSettings = {
      ...(profile.privacy_settings || {}),
      paxum_email: paxumEmail
    };

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ privacy_settings: updatedSettings })
      .eq('id', user.id);

    if (updateError) {
      throw updateError;
    }

    const origin = req.nextUrl.origin;
    
    // Return success redirect back to studio
    return NextResponse.json({ 
      success: true, 
      url: `${origin}/studio?payout=success` 
    });

  } catch (err: any) {
    console.error('Payout onboard error:', err);
    return NextResponse.json({ error: 'Failed to save payout method' }, { status: 500 });
  }
}
