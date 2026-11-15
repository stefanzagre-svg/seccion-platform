import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin-client';
import { getPublicVipInviteSummary } from '@/lib/vip-invites';
import VipFastTrackClaimClient from '@/components/onboarding/VipFastTrackClaimClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Founder VIP Fast-Track Pass',
  description: 'Exclusive invitation-only creator studio fast-track access.',
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default async function VipFastTrackPage({
  params,
  searchParams,
}: {
  params: Promise<{ code: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { code } = await params;
  const { error } = await searchParams;

  const decodedCode = decodeURIComponent(code || '').trim();
  const adminDb = createAdminClient();
  const summary = await getPublicVipInviteSummary(adminDb, decodedCode);

  let currentUserEmail: string | null = null;
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    currentUserEmail = user?.email?.toLowerCase().trim() || null;
  } catch {
    currentUserEmail = null;
  }

  return (
    <VipFastTrackClaimClient
      summary={summary}
      initialError={error || null}
      currentUserEmail={currentUserEmail}
    />
  );
}
