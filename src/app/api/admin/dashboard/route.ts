import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin-client';
import { verifyAdminAuth, unauthorizedResponse, getClientIP, logAdminAction } from '@/lib/admin-auth';

/**
 * GET /api/admin/dashboard
 * Returns platform-wide KPIs, growth timeseries, and revenue timeseries.
 */
export async function GET(request: NextRequest) {
  try {
    const admin = await verifyAdminAuth(request);
    if (!admin) return unauthorizedResponse();

    const adminClient = createAdminClient();

    // Parallel fetch all dashboard data
    const [
      profilesResult,
      subsResult,
      moderationResult,
      translationResult,
      liveStreamsResult,
      growthResult,
      revenueResult,
      goalsResult,
      relationshipsResult,
    ] = await Promise.all([
      // Total profiles by role
      adminClient.from('profiles').select('id, role, is_kyc_verified, platform_role, created_at'),
      // Active subscriptions
      adminClient.from('subscriptions').select('id, tier, is_active, price_paid, created_at'),
      // Moderation queue
      adminClient.from('content_moderation_queue').select('id, status, created_at, resolved_at'),
      // Translation revenue
      adminClient.from('translation_audit_logs').select('id, cost_charged, session_type, duration_seconds, created_at'),
      // Live streams
      adminClient.from('live_streams').select('id, is_live, viewer_count'),
      // User growth (last 30 days) - manual aggregation
      adminClient.from('profiles').select('id, created_at').gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
      // Revenue (last 30 days) 
      adminClient.from('subscriptions').select('id, price_paid, created_at').gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
      // Goal contributions
      adminClient.from('goal_contributions').select('id, amount'),
      // Relationship level distribution
      adminClient.from('relationships').select('current_level, is_matched'),
    ]);

    const profiles = profilesResult.data || [];
    const subs = subsResult.data || [];
    const moderation = moderationResult.data || [];
    const translation = translationResult.data || [];
    const liveStreams = liveStreamsResult.data || [];
    const recentUsers = growthResult.data || [];
    const recentSubs = revenueResult.data || [];
    const goals = goalsResult.data || [];
    const relationships = relationshipsResult.data || [];

    // --- KPIs ---
    const totalUsers = profiles.length;
    const totalCreators = profiles.filter(p => p.role === 'creator').length;
    const totalMembers = profiles.filter(p => p.role === 'member').length;
    const kycVerified = profiles.filter(p => p.is_kyc_verified).length;
    const activeSubs = subs.filter(s => s.is_active).length;
    const activeVip = subs.filter(s => s.is_active && s.tier === 'vip').length;
    const activeMaster = subs.filter(s => s.is_active && s.tier === 'master').length;
    const totalSubRevenue = subs.reduce((sum, s) => sum + Number(s.price_paid || 0), 0);
    const mrr = subs.filter(s => s.is_active).reduce((sum, s) => sum + Number(s.price_paid || 0), 0);
    const platformCut = mrr * 0.20;
    const translationRevenue = translation.reduce((sum, t) => sum + Number(t.cost_charged || 0), 0);
    const goalRevenue = goals.reduce((sum, g) => sum + Number(g.amount || 0), 0);
    const totalRevenue = totalSubRevenue + translationRevenue + goalRevenue;
    const moderationPending = moderation.filter(m => m.status === 'pending').length;
    const activeLiveStreams = liveStreams.filter(ls => ls.is_live).length;
    const totalViewers = liveStreams.filter(ls => ls.is_live).reduce((sum, ls) => sum + (ls.viewer_count || 0), 0);

    // --- User Growth Timeseries (30 days) ---
    const growthMap: Record<string, number> = {};
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      growthMap[d.toISOString().split('T')[0]] = 0;
    }
    recentUsers.forEach(u => {
      if (u.created_at) {
        const dateStr = u.created_at.split('T')[0];
        if (dateStr in growthMap) growthMap[dateStr]++;
      }
    });
    const userGrowth = Object.entries(growthMap).map(([date, count]) => ({ date, count }));

    // --- Revenue Timeseries (30 days) ---
    const revenueMap: Record<string, number> = {};
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      revenueMap[d.toISOString().split('T')[0]] = 0;
    }
    recentSubs.forEach(s => {
      if (s.created_at) {
        const dateStr = s.created_at.split('T')[0];
        if (dateStr in revenueMap) revenueMap[dateStr] += Number(s.price_paid || 0);
      }
    });
    const revenueTrend = Object.entries(revenueMap).map(([date, amount]) => ({ date, amount }));

    // --- Relationship Level Distribution ---
    const levelCounts: Record<string, number> = {};
    relationships.forEach(r => {
      const level = r.current_level || 'undefined';
      levelCounts[level] = (levelCounts[level] || 0) + 1;
    });
    const relationshipDistribution = Object.entries(levelCounts).map(([level, count]) => ({ level, count }));

    // --- Moderation Stats ---
    const moderationStats = {
      total: moderation.length,
      pending: moderationPending,
      underReview: moderation.filter(m => m.status === 'under_review').length,
      approved: moderation.filter(m => m.status === 'approved').length,
      rejected: moderation.filter(m => m.status === 'rejected').length,
      escalated: moderation.filter(m => m.status === 'escalated').length,
    };

    // Log dashboard access
    await logAdminAction({
      adminId: admin.userId,
      action: 'dashboard.view',
      ipAddress: getClientIP(request),
      userAgent: request.headers.get('user-agent') || undefined,
    });

    return NextResponse.json({
      kpis: {
        totalUsers,
        totalCreators,
        totalMembers,
        kycVerified,
        activeSubs,
        activeVip,
        activeMaster,
        totalRevenue,
        mrr,
        platformCut,
        translationRevenue,
        goalRevenue,
        moderationPending,
        activeLiveStreams,
        totalViewers,
      },
      userGrowth,
      revenueTrend,
      relationshipDistribution,
      moderationStats,
    });
  } catch (error: any) {
    console.error('[Admin Dashboard API] Error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
