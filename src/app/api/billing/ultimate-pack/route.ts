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

    // STUB: Here we would normally create a Stripe Checkout Session for a recurring €69/mo plan.
    // For now, we will simulate a successful subscription by granting 1 month access.

    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + 1);

    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        creator_ultimate_pack: true,
        creator_ultimate_pack_expires_at: expiresAt.toISOString()
      })
      .eq('id', user.id);

    if (updateError) throw updateError;

    return NextResponse.json({ 
      success: true, 
      message: 'Subscribed to Creator Ultimate Pack (€69/mo)',
      expiresAt: expiresAt.toISOString()
    });

  } catch (error: any) {
    console.error('Billing error:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}
