import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin-client';
import { verifyAdminAuth, unauthorizedResponse, getClientIP, logAdminAction } from '@/lib/admin-auth';

/**
 * GET /api/admin/users
 * Paginated user list with filters and search.
 * Query params: page, limit, role, kyc, search, sort, order
 */
export async function GET(request: NextRequest) {
  try {
    const admin = await verifyAdminAuth(request);
    if (!admin) return unauthorizedResponse();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '25');
    const role = searchParams.get('role'); // 'member' | 'creator'
    const kyc = searchParams.get('kyc'); // 'true' | 'false'
    const platformRole = searchParams.get('platform_role'); // 'user' | 'moderator' | 'admin' | 'super_admin'
    const search = searchParams.get('search');
    const sort = searchParams.get('sort') || 'created_at';
    const order = searchParams.get('order') === 'asc' ? true : false;

    const adminClient = createAdminClient();

    let query = adminClient
      .from('profiles')
      .select('id, username, display_name, avatar_url, role, is_kyc_verified, platform_role, created_at, updated_at, bio, text_translation_enabled, speech_translation_enabled, creator_ultimate_pack, promo_status', { count: 'exact' });

    // Apply filters
    if (role) query = query.eq('role', role);
    if (kyc) query = query.eq('is_kyc_verified', kyc === 'true');
    if (platformRole) query = query.eq('platform_role', platformRole);
    if (search) {
      query = query.or(`username.ilike.%${search}%,display_name.ilike.%${search}%`);
    }

    // Apply sorting
    query = query.order(sort, { ascending: order });

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data: users, count, error } = await query;

    if (error) {
      console.error('[Admin Users API] Query error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      users: users || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error: any) {
    console.error('[Admin Users API] Error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

/**
 * PATCH /api/admin/users
 * Bulk or single user actions: suspend, role change, platform_role change.
 * Body: { action, userIds, data }
 */
export async function PATCH(request: NextRequest) {
  try {
    const admin = await verifyAdminAuth(request);
    if (!admin) return unauthorizedResponse();

    const body = await request.json();
    const { action, userIds, data } = body;

    if (!action || !userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json({ error: 'action and userIds[] are required' }, { status: 400 });
    }

    const adminClient = createAdminClient();
    const results: { success: string[]; failed: string[] } = { success: [], failed: [] };

    for (const userId of userIds) {
      try {
        // Fetch current state for audit log
        const { data: currentProfile } = await adminClient
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        let updateData: Record<string, unknown> = {};

        switch (action) {
          case 'change_role':
            if (!data?.role || !['member', 'creator'].includes(data.role)) {
              results.failed.push(userId);
              continue;
            }
            updateData = { role: data.role };
            break;

          case 'change_platform_role':
            // Only super_admin can promote other admins
            if (admin.role !== 'super_admin') {
              results.failed.push(userId);
              continue;
            }
            if (!data?.platform_role || !['user', 'moderator', 'admin', 'super_admin'].includes(data.platform_role)) {
              results.failed.push(userId);
              continue;
            }
            updateData = { platform_role: data.platform_role };
            break;

          case 'verify_kyc':
            updateData = { is_kyc_verified: true };
            break;

          case 'unverify_kyc':
            updateData = { is_kyc_verified: false };
            break;

          default:
            results.failed.push(userId);
            continue;
        }

        const { error: updateError } = await adminClient
          .from('profiles')
          .update(updateData)
          .eq('id', userId);

        if (updateError) {
          results.failed.push(userId);
        } else {
          results.success.push(userId);

          // Audit log
          await logAdminAction({
            adminId: admin.userId,
            action: `user.${action}`,
            targetTable: 'profiles',
            targetId: userId,
            oldValue: currentProfile ? { role: currentProfile.role, platform_role: currentProfile.platform_role, is_kyc_verified: currentProfile.is_kyc_verified } : {},
            newValue: updateData,
            ipAddress: getClientIP(request),
            userAgent: request.headers.get('user-agent') || undefined,
          });
        }
      } catch {
        results.failed.push(userId);
      }
    }

    return NextResponse.json({
      message: `${results.success.length} users updated, ${results.failed.length} failed`,
      results,
    });
  } catch (error: any) {
    console.error('[Admin Users API] PATCH Error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
