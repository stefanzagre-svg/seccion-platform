import Link from 'next/link';
import FeedContainer from '@/components/feed/FeedContainer';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'SECCION | For You',
  description: 'Your personalized feed of premium content.',
};

interface FeedVideoRow {
  id: string;
  media_url: string;
  title?: string | null;
  description?: string | null;
  likes_count?: number | null;
  favorites_count?: number | null;
  creator_profile?: {
    username?: string | null;
    display_name?: string | null;
    avatar_url?: string | null;
  } | null;
}

export default async function FeedPage() {
  let liveVideos: Array<{
    id: string;
    url: string;
    title: string;
    description: string;
    creator: { username: string; avatar: string };
    likes: number;
    favorites: number;
  }> = [];

  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from('platform_content')
      .select(`
        id,
        media_url,
        title,
        description,
        likes_count,
        creator_profile:profiles!platform_content_creator_id_fkey(username, display_name, avatar_url)
      `)
      .eq('type', 'video')
      .eq('is_locked', false)
      .eq('moderation_status', 'approved')
      .order('created_at', { ascending: false })
      .limit(25);

    if (data && data.length > 0) {
      liveVideos = (data as unknown as FeedVideoRow[])
        .filter((row) => Boolean(row.media_url))
        .map((row) => ({
          id: row.id,
          url: row.media_url,
          title: row.title || 'Creator Drop',
          description: row.description || '',
          creator: {
            username:
              row.creator_profile?.username ||
              row.creator_profile?.display_name ||
              'creator',
            avatar: row.creator_profile?.avatar_url || '/assets/logo/seccion-icon-light.png',
          },
          likes: Number(row.likes_count || 0),
          favorites: Number(row.favorites_count || 0),
        }));
    }
  } catch (err) {
    console.error('[FeedPage] Failed to load live video feed:', err);
  }

  return (
    <main className="bg-black text-white w-full h-screen h-[100dvh] overflow-hidden relative">
      {/* Absolute Header Overlay */}
      <div className="absolute top-0 left-0 right-0 z-50 p-6 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
        <Link href="/" className="text-xl font-black font-['JetBrains_Mono'] tracking-tighter text-white pointer-events-auto">
          SECCION
        </Link>
        <div className="flex gap-4 font-bold text-sm pointer-events-auto">
          <Link href="/" className="text-white/60 hover:text-white transition">Discovery</Link>
          <span className="text-white border-b-2 border-primary pb-1">For You</span>
        </div>
      </div>

      <FeedContainer initialVideos={liveVideos} />
    </main>
  );
}
