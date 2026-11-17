import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin-client';
import { createClient } from '@/lib/supabase/server';
import { getAdminErrorMessage } from '@/lib/admin-auth';

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const adminDb = createAdminClient();
    const { data: profile } = await adminDb
      .from('profiles')
      .select('platform_role, role')
      .eq('id', user.id)
      .single();

    const isFounderEmail =
      user.email?.toLowerCase() === 'stefan.zagre@gmail.com' &&
      Boolean(user.email_confirmed_at || (user as { confirmed_at?: string }).confirmed_at);

    const isSuperAdmin =
      isFounderEmail ||
      profile?.role === 'admin' ||
      profile?.platform_role === 'admin' ||
      profile?.platform_role === 'super_admin';

    if (!isSuperAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    let query = adminDb
      .from('bug_reports')
      .select(`
        *,
        reporter:reporter_id (
          id,
          username,
          display_name,
          avatar_url,
          role
        )
      `)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }
    if (category && category !== 'all') {
      query = query.eq('category', category);
    }

    const { data: reports, error } = await query;

    if (error) {
      console.error('[Admin Bug Reports] Fetch Error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, reports: reports || [] });
  } catch (error: unknown) {
    return NextResponse.json({ error: getAdminErrorMessage(error, 'Server error') }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const adminDb = createAdminClient();
    const { data: profile } = await adminDb
      .from('profiles')
      .select('platform_role, role')
      .eq('id', user.id)
      .single();

    const isFounderEmail =
      user.email?.toLowerCase() === 'stefan.zagre@gmail.com' &&
      Boolean(user.email_confirmed_at || (user as { confirmed_at?: string }).confirmed_at);

    const isSuperAdmin =
      isFounderEmail ||
      profile?.role === 'admin' ||
      profile?.platform_role === 'admin' ||
      profile?.platform_role === 'super_admin';

    if (!isSuperAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { reportId, status, adminNotes, distributeReward = false } = body;

    if (!reportId) {
      return NextResponse.json({ error: 'Missing reportId' }, { status: 400 });
    }

    // 1. Fetch current report
    const { data: report, error: fetchErr } = await adminDb
      .from('bug_reports')
      .select('*')
      .eq('id', reportId)
      .single();

    if (fetchErr || !report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    let rewardStatus = report.reward_status;
    let rewardDistributedAt = report.reward_distributed_at;

    // 2. Automated Reward Execution if Verified & Distribute requested
    if (distributeReward && report.reporter_id && rewardStatus !== 'distributed') {
      const reporterId = report.reporter_id;
      const isCreator = report.reporter_role === 'creator';

      if (isCreator) {
        // Grant Radar Discovery Boost Pass (48h) + AI Assistant credits
        try {
          await adminDb.from('boost_passes').insert({
            user_id: reporterId,
            status: 'active',
            tier: 'radar_spotlight',
            duration_hours: report.reward_amount || 48,
            created_at: new Date().toISOString(),
            expires_at: new Date(Date.now() + (report.reward_amount || 48) * 3600 * 1000).toISOString(),
            metadata: { source: 'bug_bounty_reward', bug_report_id: report.id }
          });
        } catch (boostErr) {
          console.warn('[Bug Bounty] Boost pass insertion fallback:', boostErr);
        }

        // Grant Wingman AI Credits (uses atomic add_wingman_credits RPC)
        try {
          await adminDb.rpc('add_wingman_credits', {
            p_user_id: reporterId,
            p_amount: 50,
          });
        } catch (creditErr) {
          console.warn('[Bug Bounty] Wingman AI Credits update fallback:', creditErr);
        }
      } else {
        // Member Reward: Grant Harmonic XP + 50 Wingman Credits
        try {
          const { data: memberProfile } = await adminDb
            .from('profiles')
            .select('connection_points')
            .eq('id', reporterId)
            .single();

          const currentXp = memberProfile?.connection_points || 0;
          const newXp = currentXp + (report.reward_amount || 250);

          await adminDb
            .from('profiles')
            .update({ connection_points: newXp })
            .eq('id', reporterId);

          await adminDb.rpc('add_wingman_credits', {
            p_user_id: reporterId,
            p_amount: 50,
          });
        } catch (xpErr) {
          console.warn('[Bug Bounty] XP update fallback:', xpErr);
        }
      }

      rewardStatus = 'distributed';
      rewardDistributedAt = new Date().toISOString();
    }

    // 3. Update Bug Report Record
    const updates: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };
    if (status) updates.status = status;
    if (adminNotes !== undefined) updates.admin_notes = adminNotes;
    if (rewardStatus) updates.reward_status = rewardStatus;
    if (rewardDistributedAt) updates.reward_distributed_at = rewardDistributedAt;
    if (status === 'resolved') updates.resolved_at = new Date().toISOString();

    const { data: updatedReport, error: updateErr } = await adminDb
      .from('bug_reports')
      .update(updates)
      .eq('id', reportId)
      .select()
      .single();

    if (updateErr) {
      return NextResponse.json({ error: updateErr.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      report: updatedReport,
      rewardDistributed: rewardStatus === 'distributed'
    });

  } catch (error: unknown) {
    console.error('[Admin Bug Patch Error]:', error);
    return NextResponse.json({ error: getAdminErrorMessage(error, 'Server error') }, { status: 500 });
  }
}
