import { notFound, redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { createAdminClient } from '@/lib/supabase/admin-client';
import { normalizeUsername, isValidUsernameFormat, isReservedUsername } from '@/lib/reserved-usernames';
import CreatorPublicProfileClient from './page-client';

interface PageProps {
  params: Promise<{ username: string }> | { username: string };
}

// ── SSR OpenGraph & Social Metadata Generator ──────────────────────────
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const cleanUsername = normalizeUsername(resolvedParams.username);

  if (!isValidUsernameFormat(cleanUsername) || isReservedUsername(cleanUsername)) {
    return {
      title: 'Creator Not Found | SECCION',
      description: 'The requested creator profile does not exist on SECCION.',
    };
  }

  const supabase = createAdminClient();
  let { data: creator } = await supabase
    .from('profiles')
    .select('id, username, display_name, avatar_url, cover_url, bio, specialization, origins')
    .ilike('username', cleanUsername)
    .eq('role', 'creator')
    .maybeSingle();

  // If not found under current username, check active 30-day forwarding aliases
  if (!creator) {
    const { data: previousCreator } = await supabase
      .from('profiles')
      .select('id, username, display_name, avatar_url, cover_url, bio, privacy_settings')
      .eq('role', 'creator')
      .filter('privacy_settings->previous_usernames', 'cs', JSON.stringify([{ username: cleanUsername }]))
      .maybeSingle();

    if (previousCreator) {
      const list = previousCreator.privacy_settings?.previous_usernames;
      const entry = Array.isArray(list) ? list.find((item: any) => item?.username?.toLowerCase() === cleanUsername) : null;
      const isStillActive = entry?.expires_at ? new Date(entry.expires_at).getTime() > Date.now() : true;
      if (isStillActive) {
        creator = previousCreator;
      }
    }
  }

  if (!creator) {
    return {
      title: 'Creator Not Found | SECCION',
      description: 'The requested creator profile does not exist on SECCION.',
    };
  }

  const displayName = creator.display_name || creator.username;
  const bio = creator.bio || `Official SECCION Creator Hub for ${displayName}. Exclusive DRM content vault, direct 1-on-1 messaging, and VIP membership.`;
  const shareImage = creator.cover_url || creator.avatar_url || 'https://seccion.ai/assets/seo/og-image.jpg';
  const pageUrl = `https://seccion.ai/${creator.username}`;

  return {
    title: `${displayName} (@${creator.username})`,
    description: bio,
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      title: `${displayName} on SECCION`,
      description: bio,
      url: pageUrl,
      siteName: 'SECCION',
      images: [
        {
          url: shareImage,
          width: 1200,
          height: 630,
          alt: `${displayName} SECCION Profile`,
        },
      ],
      type: 'profile',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${displayName} (@${creator.username}) on SECCION`,
      description: bio,
      images: [shareImage],
      creator: '@steveseccion',
    },
  };
}

// ── Server Page Component ──────────────────────────────────────────────
export default async function CreatorVanityPage({ params }: PageProps) {
  const resolvedParams = await params;
  const cleanUsername = normalizeUsername(resolvedParams.username);

  // Fast pre-query rejection for invalid formats or reserved platform routes
  if (!isValidUsernameFormat(cleanUsername) || isReservedUsername(cleanUsername)) {
    notFound();
  }

  const supabase = createAdminClient();

  // Strict Invariant: Strictly fetch creators only (members remain private)
  const { data: creator } = await supabase
    .from('profiles')
    .select('*')
    .ilike('username', cleanUsername)
    .eq('role', 'creator')
    .maybeSingle();

  // If creator is not found under current username, check for an active 30-day redirect alias
  if (!creator) {
    const { data: previousCreator } = await supabase
      .from('profiles')
      .select('id, username, privacy_settings')
      .eq('role', 'creator')
      .filter('privacy_settings->previous_usernames', 'cs', JSON.stringify([{ username: cleanUsername }]))
      .maybeSingle();

    if (previousCreator && previousCreator.username) {
      const list = previousCreator.privacy_settings?.previous_usernames;
      const entry = Array.isArray(list) ? list.find((item: any) => item?.username?.toLowerCase() === cleanUsername) : null;
      const isStillActive = entry?.expires_at ? new Date(entry.expires_at).getTime() > Date.now() : true;
      if (isStillActive) {
        redirect(`/${previousCreator.username}`);
      }
    }

    notFound();
  }

  // Fetch creator's public & teaser media
  const { data: mediaItems } = await supabase
    .from('profile_media')
    .select('*')
    .eq('user_id', creator.id)
    .order('created_at', { ascending: false })
    .limit(12);

  return (
    <CreatorPublicProfileClient 
      creator={creator} 
      media={mediaItems || []} 
    />
  );
}
