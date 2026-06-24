import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin-client';
import { verifyAdminAuth, unauthorizedResponse, getClientIP, logAdminAction } from '@/lib/admin-auth';

/**
 * GET /api/admin/users/[id]
 * Fetches detailed user information for the admin registry.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await verifyAdminAuth(request);
    if (!admin) return unauthorizedResponse();

    const { id: userId } = await params;
    const adminClient = createAdminClient();

    // Fetch user profile
    const { data: profile, error: profileError } = await adminClient
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Fetch relationships stats
    const { data: relationships } = await adminClient
      .from('relationships')
      .select('current_level, is_matched, target_id')
      .eq('user_id', userId);

    // Fetch subscriptions
    // 1. As subscriber (if member)
    const { data: activeSubs } = await adminClient
      .from('subscriptions')
      .select('id, creator_id, tier, price_paid, is_active, created_at')
      .eq('subscriber_id', userId);

    // 2. As creator (if creator)
    const { data: clientSubs } = await adminClient
      .from('subscriptions')
      .select('id, subscriber_id, tier, price_paid, is_active, created_at')
      .eq('creator_id', userId);

    // Fetch moderation reports against this user
    const { data: moderationReports } = await adminClient
      .from('content_moderation_queue')
      .select('id, reason, description, status, priority, created_at')
      .eq('content_id', userId)
      .eq('content_type', 'profile');

    // Fetch audit logs targetting this user
    const { data: targetAuditLogs } = await adminClient
      .from('admin_audit_logs')
      .select('id, action, old_value, new_value, created_at, admin:profiles!admin_audit_logs_admin_id_fkey(username)')
      .eq('target_id', userId)
      .order('created_at', { ascending: false });

    return NextResponse.json({
      profile,
      stats: {
        matchesCount: relationships?.filter(r => r.is_matched).length || 0,
        relationshipsCount: relationships?.length || 0,
        subscribingCount: activeSubs?.filter(s => s.is_active).length || 0,
        subscribersCount: clientSubs?.filter(s => s.is_active).length || 0,
      },
      subscriptions: {
        active: activeSubs || [],
        subscribers: clientSubs || [],
      },
      moderation: moderationReports || [],
      auditLogs: targetAuditLogs || [],
    });
  } catch (error: any) {
    console.error('[Admin User Detail API] GET Error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

/**
 * PATCH /api/admin/users/[id]
 * Specialized admin edits for a single user (Ultimate Pack, Promo Status, etc.)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await verifyAdminAuth(request);
    if (!admin) return unauthorizedResponse();

    const { id: userId } = await params;
    const body = await request.json();
    const { action, value } = body;

    if (!action) {
      return NextResponse.json({ error: 'Action is required' }, { status: 400 });
    }

    const adminClient = createAdminClient();

    // Fetch current state
    const { data: currentProfile } = await adminClient
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (!currentProfile) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    let updateData: Record<string, any> = {};

    switch (action) {
      case 'toggle_ultimate_pack':
        updateData = { creator_ultimate_pack: !!value };
        break;

      case 'update_promo_status':
        if (value && !['none', 'active', 'best_50'].includes(value)) {
          return NextResponse.json({ error: 'Invalid promo status value' }, { status: 400 });
        }
        updateData = { promo_status: value || 'none' };
        break;

      case 'toggle_translation_feature':
        if (value?.type === 'text') {
          updateData = { text_translation_enabled: !!value.enabled };
        } else if (value?.type === 'speech') {
          updateData = { speech_translation_enabled: !!value.enabled };
        } else {
          return NextResponse.json({ error: 'Invalid translation feature type' }, { status: 400 });
        }
        break;

      default:
        return NextResponse.json({ error: 'Unsupported action' }, { status: 400 });
    }

    const { error: updateError } = await adminClient
      .from('profiles')
      .update(updateData)
      .eq('id', userId);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    // Log the audit event
    await logAdminAction({
      adminId: admin.userId,
      action: `user.detail_${action}`,
      targetTable: 'profiles',
      targetId: userId,
      oldValue: currentProfile ? { 
        creator_ultimate_pack: currentProfile.creator_ultimate_pack,
        promo_status: currentProfile.promo_status,
        text_translation_enabled: currentProfile.text_translation_enabled,
        speech_translation_enabled: currentProfile.speech_translation_enabled 
      } : {},
      newValue: updateData,
      ipAddress: getClientIP(request),
      userAgent: request.headers.get('user-agent') || undefined,
    });

    return NextResponse.json({ message: 'User updated successfully', updated: updateData });
  } catch (error: any) {
    console.error('[Admin User Detail API] PATCH Error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
