import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin-client';
import { verifyAdminAuth, unauthorizedResponse } from '@/lib/admin-auth';

/**
 * GET /api/admin/audit
 * Query audit logs with filters.
 */
export async function GET(request: NextRequest) {
  try {
    const admin = await verifyAdminAuth(request, ['admin', 'super_admin']);
    if (!admin) return unauthorizedResponse();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const adminId = searchParams.get('admin_id');
    const action = searchParams.get('action');
    const targetTable = searchParams.get('target_table');
    const dateFrom = searchParams.get('date_from');
    const dateTo = searchParams.get('date_to');

    const adminClient = createAdminClient();

    let query = adminClient
      .from('admin_audit_logs')
      .select(`
        id, action, target_table, target_id, old_value, new_value,
        ip_address, user_agent, metadata, created_at,
        admin:profiles!admin_audit_logs_admin_id_fkey(id, username, avatar_url)
      `, { count: 'exact' });

    if (adminId) query = query.eq('admin_id', adminId);
    if (action) query = query.ilike('action', `%${action}%`);
    if (targetTable) query = query.eq('target_table', targetTable);
    if (dateFrom) query = query.gte('created_at', dateFrom);
    if (dateTo) query = query.lte('created_at', dateTo);

    query = query.order('created_at', { ascending: false });

    const from = (page - 1) * limit;
    query = query.range(from, from + limit - 1);

    const { data: logs, count, error } = await query;

    if (error) {
      console.error('[Admin Audit API] Query error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      logs: logs || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error: any) {
    console.error('[Admin Audit API] Error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
