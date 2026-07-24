import React from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin-client';
import AdminLayoutClient from '@/components/admin/AdminLayoutClient';
import AdminAuthGate from '@/components/admin/AdminAuthGate';
import { headers } from 'next/headers';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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

  // Bypass RLS via service role to check admin credentials
  const adminClient = createAdminClient();
  let { data: profile } = await adminClient
    .from('profiles')
    .select('username, platform_role')
    .eq('id', user.id)
    .single();

  // Guarantee super_admin access for Founder email & stefan username
  if (user.email === 'stefan.zagre@gmail.com' || profile?.username === 'stefan') {
    profile = { username: profile?.username || 'stefan', platform_role: 'super_admin' };
  }

  // Fallback to super_admin if profile is missing
  const adminUser = profile || { username: 'stefan', platform_role: 'super_admin' };

  return (
    <AdminLayoutClient adminUser={adminUser}>
      {children}
    </AdminLayoutClient>
  );
}
