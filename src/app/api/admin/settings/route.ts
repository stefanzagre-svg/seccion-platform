import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin-client';
import { verifyAdminAuth, unauthorizedResponse, getClientIP, logAdminAction } from '@/lib/admin-auth';

/**
 * GET /api/admin/settings
 * Fetch all platform settings.
 */
export async function GET(request: NextRequest) {
  try {
    const admin = await verifyAdminAuth(request);
    if (!admin) return unauthorizedResponse();

    const adminClient = createAdminClient();
    const { data: settings, error } = await adminClient
      .from('platform_settings')
      .select('*')
      .order('key');

    if (error) {
      console.error('[Admin Settings API] Query error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Transform to key-value map for frontend
    const settingsMap: Record<string, unknown> = {};
    (settings || []).forEach(s => {
      settingsMap[s.key] = s.value;
    });

    return NextResponse.json({ settings: settingsMap, raw: settings });
  } catch (error: any) {
    console.error('[Admin Settings API] Error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

/**
 * PATCH /api/admin/settings
 * Update a platform setting. Super admin only.
 * Body: { key, value }
 */
export async function PATCH(request: NextRequest) {
  try {
    const admin = await verifyAdminAuth(request, ['super_admin']);
    if (!admin) return unauthorizedResponse();

    const body = await request.json();
    const { key, value } = body;

    if (!key || value === undefined) {
      return NextResponse.json({ error: 'key and value are required' }, { status: 400 });
    }

    const adminClient = createAdminClient();

    // Get current value for audit log
    const { data: currentSetting } = await adminClient
      .from('platform_settings')
      .select('*')
      .eq('key', key)
      .single();

    if (!currentSetting) {
      return NextResponse.json({ error: `Setting "${key}" not found` }, { status: 404 });
    }

    const { error: updateError } = await adminClient
      .from('platform_settings')
      .update({
        value,
        updated_by: admin.userId,
      })
      .eq('key', key);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    // Audit log
    await logAdminAction({
      adminId: admin.userId,
      action: 'settings.update',
      targetTable: 'platform_settings',
      targetId: currentSetting.id,
      oldValue: { key, value: currentSetting.value },
      newValue: { key, value },
      ipAddress: getClientIP(request),
      userAgent: request.headers.get('user-agent') || undefined,
    });

    return NextResponse.json({ success: true, key, value });
  } catch (error: any) {
    console.error('[Admin Settings API] PATCH Error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
