import { notFound, redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { createAdminClient } from '@/lib/supabase/admin-client';
import { createClient } from '@/lib/supabase/server';
import {
  isCountryBlocked,
  isProfileReadyForDiscovery,
  normalizeCountryCode,
} from '@/lib/profile-visibility';
import { normalizeUsername, isValidUsernameFormat, isReservedUsername } from '@/lib/reserved-usernames';
import CreatorPublicProfileClient from './page-client';

interface PageProps {
  params: Promise<{ username: string }>;
}

const PUBLIC_CREATOR_COLUMNS =
  'id, username, display_name, avatar_url, cover_url, bio, bio_prompt_answer, specialization, origins, residence, base_subscription_price, favorite_languages, hobbies, moods, relationship_goals, lifestyle_habits, is_kyc_verified, core_passion, archetype, face_blur_active, avatar_face_coordinates, role, privacy_settings';

async function getRequestCountry(): Promise<string | null> {
  try {
    const reqHeaders = await headers();
    return normalizeCountryCode(reqHeaders.get('cf-ipcountry'));
  } catch {
    return null;
  }
}

async function getAuthenticatedViewerId(): Promise<string | null> {
  try {
    const userClient = await createClient();
    const { data } = await userClient.auth.getUser();
    return data?.user?.id || null;
  } catch {
    return null;
  }
}

async function resolvePublicCreator(cleanUsername: string, allowOwnerPreview: boolean) {
  const supabase = createAdminClient();
  const visitorCountry = await getRequestCountry();
  const viewerUserId = allowOwnerPreview ? await getAuthenticatedViewerId() : null;

  let { data: creator } = await supabase
    .from('profiles')
    .select(PUBLIC_CREATOR_COLUMNS)
    .ilike('username', cleanUsername)
    .eq('role', 'creator')
    .maybeSingle();

  let redirectTo: string | null = null;

  // If not found under current username, check active 30-day forwarding aliases
  if (!creator) {
    const { data: previousCreator } = await supabase
      .from('profiles')
      .select(PUBLIC_CREATOR_COLUMNS)
      .eq('role', 'creator')
      .filter('privacy_settings->previous_usernames', 'cs', JSON.stringify([{ username: cleanUsername }]))
      .maybeSingle();

    if (previousCreator?.username) {
      const list = previousCreator.privacy_settings?.previous_usernames;
      const entry = Array.isArray(list)
        ? list.find((item: any) => item?.username?.toLowerCase() === cleanUsername)
        : null;
      const isStillActive = entry?.expires_at ? new Date(entry.expires_at).getTime() > Date.now() : true;
      if (isStillActive) {
        creator = previousCreator;
        redirectTo = previousCreator.username;
      }
    }
  }

  if (!creator) return null;

  // Fetch creator's non-hidden media items for rendering + canonical readiness check
  const { data: mediaItems } = await supabase
    .from('profile_media')
    .select('id, user_id, media_url, media_type, is_hidden, required_level, face_blur_enabled, face_coordinates, created_at')
    .eq('user_id', creator.id)
    .eq('is_hidden', false)
    .order('created_at', { ascending: false })
    .limit(12);

  const isOwner = Boolean(allowOwnerPreview && viewerUserId && viewerUserId === creator.id);

  // Enforce server-side country geoblock (including Moroccan Domestic Shield) BEFORE alias redirects
  if (!isOwner && isCountryBlocked(creator.privacy_settings, visitorCountry)) {
    return null;
  }

  // Enforce canonical public profile readiness (avatar + bio + >= 2 real profile_media + creator KYC)
  if (
    !isOwner &&
    !isProfileReadyForDiscovery(creator, {
      publicMediaCount: mediaItems?.length || 0,
      requireCreatorKyc: true,
    })
  ) {
    return null;
  }

  // Never serialize privacy_settings onto client payloads
  const { privacy_settings: _strippedPrivacy, ...publicCreator } = creator;
  void _strippedPrivacy;

  return {
    creator: publicCreator,
    media: mediaItems || [],
    redirectTo,
  };
}

// ── SSR OpenGraph & Social Metadata Generator ──────────────────────────
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const cleanUsername = normalizeUsername(resolvedParams.username);

  if (!isValidUsernameFormat(cleanUsername) || isReservedUsername(cleanUsername)) {
    return {
      title: 'Creator Not Found',
      description: 'The requested creator profile does not exist on SECCION.',
    };
  }

  const resolved = await resolvePublicCreator(cleanUsername, false);
  if (!resolved) {
    return {
      title: 'Creator Not Found',
      description: 'The requested creator profile does not exist on SECCION.',
    };
  }

  const creator = resolved.creator;
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

  const resolved = await resolvePublicCreator(cleanUsername, true);
  if (!resolved) {
    notFound();
  }

  if (resolved.redirectTo) {
    redirect(`/${resolved.redirectTo}`);
  }

  return (
    <CreatorPublicProfileClient
      creator={resolved.creator}
      media={resolved.media}
    />
  );
}
