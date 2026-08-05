import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin-client';

async function handleCheckExpirations(req: NextRequest) {
  // Optional security check: if CRON_SECRET is set, enforce authorization header
  const authHeader = req.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const supabase = createAdminClient();
    const now = new Date().toISOString();

    // Query active subscriptions that have expired
    const { data: expiredSubs, error: fetchErr } = await supabase
      .from('subscriptions')
      .select('id, subscriber_id, creator_id, tier')
      .eq('is_active', true)
      .lt('expires_at', now);

    if (fetchErr) {
      console.error('Error fetching expired subscriptions:', fetchErr);
      return NextResponse.json({ error: fetchErr.message }, { status: 500 });
    }

    if (!expiredSubs || expiredSubs.length === 0) {
      return NextResponse.json({ 
        success: true, 
        message: 'No expired subscriptions found', 
        deactivatedCount: 0,
        deactivatedIds: [] 
      });
    }

    const expiredIds = expiredSubs.map(sub => sub.id);

    // Batch update is_active to false
    const { error: updateErr } = await supabase
      .from('subscriptions')
      .update({ 
        is_active: false,
        updated_at: now
      })
      .in('id', expiredIds);

    if (updateErr) {
      console.error('Error updating expired subscriptions:', updateErr);
      return NextResponse.json({ error: updateErr.message }, { status: 500 });
    }

    console.log(`Deactivated ${expiredIds.length} expired subscriptions successfully.`);

    return NextResponse.json({
      success: true,
      message: `Deactivated ${expiredIds.length} expired subscriptions`,
      deactivatedCount: expiredIds.length,
      deactivatedIds: expiredIds
    });
  } catch (error: any) {
    console.error('Check expirations cron error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  return handleCheckExpirations(req);
}

export async function POST(req: NextRequest) {
  return handleCheckExpirations(req);
}
