import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin-client';

export type AdminRole = 'moderator' | 'admin' | 'super_admin';

interface AdminAuthResult {
  userId: string;
  role: AdminRole;
  username: string;
}

/**
 * Verifies the current user has admin privileges.
 * Returns admin info or null if unauthorized.
 * In development, supports x-dev-admin-id header for testing.
 */
export async function verifyAdminAuth(
  request: NextRequest,
  requiredRoles: AdminRole[] = ['admin', 'super_admin']
): Promise<AdminAuthResult | null> {
  // Development bypass
  if (process.env.NODE_ENV === 'development') {
    const devAdminId = request.headers.get('x-dev-admin-id');
    if (devAdminId) {
      const adminClient = createAdminClient();
      const { data: profile } = await adminClient
        .from('profiles')
        .select('id, platform_role, username')
        .eq('id', devAdminId)
        .single();

      if (profile && requiredRoles.includes(profile.platform_role as AdminRole)) {
        return {
          userId: profile.id,
          role: profile.platform_role as AdminRole,
          username: profile.username,
        };
      }
    }
  }

  // Production auth flow
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return null;
  }

  // Fetch platform_role using service role to bypass RLS
  const adminClient = createAdminClient();
  const { data: profile, error: profileError } = await adminClient
    .from('profiles')
    .select('id, platform_role, username')
    .eq('id', user.id)
    .single();

  if (profileError || !profile) {
    return null;
  }

  const userRole = profile.platform_role as string;
  if (!requiredRoles.includes(userRole as AdminRole)) {
    return null;
  }

  return {
    userId: profile.id,
    role: userRole as AdminRole,
    username: profile.username,
  };
}

/**
 * Logs an admin action to the immutable audit log.
 */
export async function logAdminAction(params: {
  adminId: string;
  action: string;
  targetTable?: string;
  targetId?: string;
  oldValue?: Record<string, unknown>;
  newValue?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
}) {
  const adminClient = createAdminClient();

  await adminClient.from('admin_audit_logs').insert({
    admin_id: params.adminId,
    action: params.action,
    target_table: params.targetTable || null,
    target_id: params.targetId || null,
    old_value: params.oldValue || {},
    new_value: params.newValue || {},
    ip_address: params.ipAddress || null,
    user_agent: params.userAgent || null,
    metadata: params.metadata || {},
  });
}

/**
 * Creates a 403 response for unauthorized admin access.
 */
export function unauthorizedResponse() {
  return NextResponse.json(
    { error: 'Forbidden — insufficient admin privileges' },
    { status: 403 }
  );
}

/**
 * Extracts client IP from request headers.
 */
export function getClientIP(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  );
}
