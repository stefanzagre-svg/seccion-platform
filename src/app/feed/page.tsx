import FeedContainer from '@/components/feed/FeedContainer';
import Navbar from '@/components/Navbar';

export const metadata = {
  title: 'SECCION | For You',
  description: 'Your personalized feed of premium content.',
};

// Simulated mock data. In production, this would fetch from public.platform_content
const MOCK_VIDEOS = [
  {
    id: 'vid_1',
    // We use a high-quality vertical video from a free stock video source as a placeholder
    url: 'https://cdn.pixabay.com/video/2023/10/22/186115-876933560_large.mp4',
    title: 'Neon Nights in Tokyo 🌃',
    description: 'Exploring the cyberpunk aesthetics of the city.',
    creator: {
      username: 'akira.vision',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    },
    likes: 12400,
    favorites: 3400,
  },
  {
    id: 'vid_2',
    url: 'https://cdn.pixabay.com/video/2024/02/21/201309-915354964_large.mp4',
    title: 'Studio Vibes 🎧',
    description: 'Working on the new beat today. Tell me what you think.',
    creator: {
      username: 'dj.flow',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    },
    likes: 8520,
    favorites: 1205,
  },
  {
    id: 'vid_3',
    url: 'https://cdn.pixabay.com/video/2021/08/12/84820-588371360_large.mp4',
    title: 'Beach sunset meditation 🌅',
    description: 'Take a deep breath and relax.',
    creator: {
      username: 'zen.master',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=200',
    },
    likes: 45000,
    favorites: 12000,
  }
];

export default async function FeedPage() {
  // Simulate network delay
  // await new Promise(resolve => setTimeout(resolve, 1000));
  
  return (
    <main className="bg-black text-white w-full h-screen h-[100dvh] overflow-hidden relative">
      {/* We hide the standard navbar on the feed to maximize immersion, but we could render a minimal one */}
      {/* <Navbar /> */}
      
      {/* Absolute Header Overlay */}
      <div className="absolute top-0 left-0 right-0 z-50 p-6 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
        <h1 className="text-xl font-black font-['JetBrains_Mono'] tracking-tighter text-white">
          SECCION
        </h1>
        <div className="flex gap-4 font-bold text-sm pointer-events-auto">
          <button className="text-white/60 hover:text-white transition">Following</button>
          <button className="text-white border-b-2 border-primary pb-1">For You</button>
        </div>
      </div>

      <FeedContainer initialVideos={MOCK_VIDEOS} />
    </main>
  );
}
