import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin-client';
import { verifyAdminAuth, unauthorizedResponse, getClientIP, logAdminAction } from '@/lib/admin-auth';

/**
 * GET /api/admin/features
 * Aggregates translation feature analytics and S2ST metrics.
 */
export async function GET(request: NextRequest) {
  try {
    const admin = await verifyAdminAuth(request, ['admin', 'super_admin']);
    if (!admin) return unauthorizedResponse();

    const adminClient = createAdminClient();

    // 1. Fetch translation audit logs
    const { data: logs, error } = await adminClient
      .from('translation_audit_logs')
      .select('cost_charged, session_type, duration_seconds, created_at, user_id');

    if (error) {
      console.error('[Admin Features API] Error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const totalSessions = (logs || []).length;
    const textSessions = (logs || []).filter(l => l.session_type === 'text').length;
    const speechSessions = (logs || []).filter(l => l.session_type === 'speech' || l.session_type === 's2st').length;
    
    const totalDurationSecs = (logs || []).reduce((sum, l) => sum + (l.duration_seconds || 0), 0);
    const totalDurationMins = totalDurationSecs / 60;
    
    const totalRevenue = (logs || []).reduce((sum, l) => sum + Number(l.cost_charged || 0), 0);
    
    // Unique translation users count
    const uniqueUsers = new Set((logs || []).map(l => l.user_id)).size;

    // Daily translation sessions & revenue timeseries (last 30 days)
    const dailyDataMap: Record<string, { date: string; sessions: number; revenue: number; duration: number }> = {};
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      dailyDataMap[dateStr] = { date: dateStr, sessions: 0, revenue: 0, duration: 0 };
    }

    (logs || []).forEach(log => {
      if (log.created_at) {
        const dateStr = log.created_at.split('T')[0];
        if (dateStr in dailyDataMap) {
          dailyDataMap[dateStr].sessions++;
          dailyDataMap[dateStr].revenue += Number(log.cost_charged || 0);
          dailyDataMap[dateStr].duration += (log.duration_seconds || 0) / 60;
        }
      }
    });

    const timeseries = Object.values(dailyDataMap);

    return NextResponse.json({
      summary: {
        totalSessions,
        textSessions,
        speechSessions,
        totalDurationMins,
        totalRevenue,
        uniqueUsers,
      },
      timeseries,
    });
  } catch (error: any) {
    console.error('[Admin Features API] Error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
