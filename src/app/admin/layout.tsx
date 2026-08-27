import React from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin-client';
import AdminLayoutClient from '@/components/admin/AdminLayoutClient';
import AdminAuthGate from '@/components/admin/AdminAuthGate';
import { headers } from 'next/headers';

export const dynamic = 'force-dynamic';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  try {
    const headerList = await headers();
    const pathname = headerList.get('x-pathname') || '';

    // If visiting /admin/login, render the standalone login page directly (no layout chrome)
    if (pathname === '/admin/login') {
      return <>{children}</>;
    }

    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    // If user is not logged in, render in-page Founder Auth Gate (zero redirects!)
    if (error || !user) {
      return <AdminAuthGate />;
    }

    let adminUser = { username: 'stefan', platform_role: 'super_admin' };

    try {
      // Bypass RLS via service role to check admin credentials
      const adminClient = createAdminClient();
      const { data: profile } = await adminClient
        .from('profiles')
        .select('username, platform_role')
        .eq('id', user.id)
        .maybeSingle();

      // Guarantee super_admin access for Founder email & stefan username
      if (user.email === 'stefan.zagre@gmail.com' || profile?.username === 'stefan') {
        adminUser = { username: profile?.username || 'stefan', platform_role: 'super_admin' };
      } else if (profile) {
        adminUser = { username: profile.username || 'admin', platform_role: profile.platform_role || 'admin' };
      }
    } catch (profileErr) {
      console.warn('[AdminLayout] Service role profile fetch fallback:', profileErr);
      if (user.email === 'stefan.zagre@gmail.com') {
        adminUser = { username: 'stefan', platform_role: 'super_admin' };
      }
    }

    return (
      <AdminLayoutClient adminUser={adminUser}>
        {children}
      </AdminLayoutClient>
    );
  } catch (err: any) {
    console.error('[AdminLayout Server Render Error]:', err);
    // Graceful in-page Auth Gate fallback instead of 500 error boundary
    return <AdminAuthGate />;
  }
}
