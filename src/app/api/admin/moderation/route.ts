import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin-client';
import { verifyAdminAuth, unauthorizedResponse, getClientIP, logAdminAction } from '@/lib/admin-auth';

/**
 * GET /api/admin/moderation
 * Fetch moderation queue with filters.
 */
export async function GET(request: NextRequest) {
  try {
    const admin = await verifyAdminAuth(request, ['moderator', 'admin', 'super_admin']);
    if (!admin) return unauthorizedResponse();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status'); // 'pending' | 'under_review' | 'approved' | 'rejected' | 'escalated'
    const priority = searchParams.get('priority');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const adminClient = createAdminClient();

    let query = adminClient
      .from('content_moderation_queue')
      .select(`
        id, content_id, content_type, reason, description, status, priority,
        resolution_notes, resolved_at, created_at, updated_at,
        reporter:profiles!content_moderation_queue_reporter_id_fkey(id, username, avatar_url),
        moderator:profiles!content_moderation_queue_moderator_id_fkey(id, username, avatar_url)
      `, { count: 'exact' });

    if (status) query = query.eq('status', status);
    if (priority) query = query.eq('priority', priority);

    query = query.order('created_at', { ascending: false });

    const from = (page - 1) * limit;
    query = query.range(from, from + limit - 1);

    const { data: items, count, error } = await query;

    if (error) {
      console.error('[Admin Moderation API] Query error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Get moderation stats
    const { data: allItems } = await adminClient
      .from('content_moderation_queue')
      .select('status');

    const stats = {
      total: (allItems || []).length,
      pending: (allItems || []).filter(i => i.status === 'pending').length,
      underReview: (allItems || []).filter(i => i.status === 'under_review').length,
      approved: (allItems || []).filter(i => i.status === 'approved').length,
      rejected: (allItems || []).filter(i => i.status === 'rejected').length,
      escalated: (allItems || []).filter(i => i.status === 'escalated').length,
    };

    return NextResponse.json({
      items: items || [],
      stats,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error: any) {
    console.error('[Admin Moderation API] Error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

/**
 * PATCH /api/admin/moderation
 * Update moderation item status.
 * Body: { itemId, status, resolutionNotes }
 */
export async function PATCH(request: NextRequest) {
  try {
    const admin = await verifyAdminAuth(request, ['moderator', 'admin', 'super_admin']);
    if (!admin) return unauthorizedResponse();

    const body = await request.json();
    const { itemId, status, resolutionNotes } = body;

    if (!itemId || !status) {
      return NextResponse.json({ error: 'itemId and status are required' }, { status: 400 });
    }

    const validStatuses = ['pending', 'under_review', 'approved', 'rejected', 'escalated'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` }, { status: 400 });
    }

    const adminClient = createAdminClient();

    // Get current state for audit
    const { data: currentItem } = await adminClient
      .from('content_moderation_queue')
      .select('*')
      .eq('id', itemId)
      .single();

    const updateData: Record<string, unknown> = {
      status,
      moderator_id: admin.userId,
    };

    if (resolutionNotes) {
      updateData.resolution_notes = resolutionNotes;
    }

    if (['approved', 'rejected'].includes(status)) {
      updateData.resolved_at = new Date().toISOString();
    }

    const { error: updateError } = await adminClient
      .from('content_moderation_queue')
      .update(updateData)
      .eq('id', itemId);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    // Audit log
    await logAdminAction({
      adminId: admin.userId,
      action: `moderation.${status}`,
      targetTable: 'content_moderation_queue',
      targetId: itemId,
      oldValue: currentItem ? { status: currentItem.status } : {},
      newValue: updateData,
      ipAddress: getClientIP(request),
      userAgent: request.headers.get('user-agent') || undefined,
      metadata: { resolutionNotes },
    });

    return NextResponse.json({ success: true, status });
  } catch (error: any) {
    console.error('[Admin Moderation API] PATCH Error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
