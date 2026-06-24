import React from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin-client';
import AdminLayoutClient from '@/components/admin/AdminLayoutClient';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  // If user is not logged in, redirect to auth (onboarding)
  if (error || !user) {
    redirect('/onboarding');
  }

  // Bypass RLS via service role to check admin credentials
  const adminClient = createAdminClient();
  const { data: profile, error: profileError } = await adminClient
    .from('profiles')
    .select('username, platform_role')
    .eq('id', user.id)
    .single();

  // If user has no profile or is not moderator/admin/super_admin, redirect to landing
  if (profileError || !profile || !['moderator', 'admin', 'super_admin'].includes(profile.platform_role)) {
    redirect('/');
  }

  return (
    <AdminLayoutClient adminUser={profile}>
      {children}
    </AdminLayoutClient>
  );
}
