import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin-client';
import { verifyAdminAuth, unauthorizedResponse, getClientIP, logAdminAction } from '@/lib/admin-auth';

/**
 * GET /api/admin/finance
 * Returns recent subscription logs and platform cut calculation.
 */
export async function GET(request: NextRequest) {
  try {
    const admin = await verifyAdminAuth(request, ['admin', 'super_admin']);
    if (!admin) return unauthorizedResponse();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const adminClient = createAdminClient();

    // Fetch paginated subscriptions with subscriber and creator usernames
    const from = (page - 1) * limit;
    const { data: subs, count, error } = await adminClient
      .from('subscriptions')
      .select(`
        id, tier, price_paid, is_active, created_at,
        subscriber:profiles!subscriptions_subscriber_id_fkey(id, username),
        creator:profiles!subscriptions_creator_id_fkey(id, username)
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, from + limit - 1);

    if (error) {
      console.error('[Admin Finance API] Query error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Log access
    await logAdminAction({
      adminId: admin.userId,
      action: 'finance.view',
      ipAddress: getClientIP(request),
      userAgent: request.headers.get('user-agent') || undefined,
    });

    return NextResponse.json({
      subscriptions: subs || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error: any) {
    console.error('[Admin Finance API] Error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
