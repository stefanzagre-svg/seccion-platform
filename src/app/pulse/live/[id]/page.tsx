import { X, Users, MessageCircle, Heart, DollarSign, Share2 } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'SECCION | Live Stream',
};

// In production, fetch this based on params.id
const MOCK_STREAM = {
  id: 'ev_1',
  title: 'Late Night Studio Session & Q&A',
  creatorName: 'dj.flow',
  creatorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
  // Placeholder stock video simulating a live stream
  videoUrl: 'https://cdn.pixabay.com/video/2024/02/21/201309-915354964_large.mp4', 
  viewerCount: 1420,
};

export default async function LiveStreamPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <main className="bg-black w-full h-screen h-[100dvh] overflow-hidden relative">
      
      {/* 
        The actual video element 
        In production, this would use Cloudflare Stream's WebRTC Live Player or HLS
      */}
      <video
        src={MOCK_STREAM.videoUrl}
        className="w-full h-full object-cover"
        autoPlay
        loop
        playsInline
      />

      {/* Top Overlay: Header & Exit */}
      <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-start z-10 bg-gradient-to-b from-black/80 to-transparent">
        
        {/* Creator Info */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <img src={MOCK_STREAM.creatorAvatar} alt={MOCK_STREAM.creatorName} className="w-10 h-10 rounded-full border-2 border-primary" />
            <div className="absolute -bottom-1 -right-1 bg-red-500 text-white text-[8px] font-black uppercase px-1.5 py-0.5 rounded-sm">
              LIVE
            </div>
          </div>
          <div>
            <h1 className="text-white font-bold text-sm">{MOCK_STREAM.creatorName}</h1>
            <div className="flex items-center gap-1 text-white/80 text-xs font-bold">
              <Users className="w-3 h-3" />
              {MOCK_STREAM.viewerCount.toLocaleString()}
            </div>
          </div>
          <button className="ml-2 bg-primary/20 text-primary hover:bg-primary hover:text-black px-3 py-1 text-xs font-bold uppercase tracking-widest rounded-full transition-colors">
            Follow
          </button>
        </div>

        {/* Exit Button */}
        <Link href="/pulse" className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white/60 hover:text-white transition">
          <X className="w-6 h-6" />
        </Link>
      </div>

      {/* Bottom Overlay: Chat & Actions */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 via-black/40 to-transparent z-10 flex items-end justify-between">
        
        {/* Mock Chat Stream */}
        <div className="w-[70%] max-w-sm max-h-[30vh] overflow-y-auto flex flex-col justify-end space-y-2 pb-4 scrollbar-hide" style={{ maskImage: 'linear-gradient(to top, black 80%, transparent 100%)' }}>
          <div className="flex gap-2 text-sm">
            <span className="font-bold text-white/60">user_404:</span>
            <span className="text-white">This beat is insane 🔥</span>
          </div>
          <div className="flex gap-2 text-sm">
            <span className="font-bold text-primary">sarah_j:</span>
            <span className="text-white">When is the drop??</span>
          </div>
          <div className="flex gap-2 text-sm bg-primary/20 p-2 rounded-lg border border-primary/30">
            <span className="font-bold text-primary">hype_beast tipped $10:</span>
            <span className="text-white font-bold">Keep it up! 💸</span>
          </div>
        </div>

        {/* Action Buttons Stack */}
        <div className="flex flex-col gap-4">
          <button className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-md flex flex-col items-center justify-center text-white hover:bg-white/10 transition group">
            <DollarSign className="w-6 h-6 group-hover:text-green-400 transition-colors" />
          </button>
          <button className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-md flex flex-col items-center justify-center text-white hover:bg-white/10 transition group">
            <Heart className="w-6 h-6 group-hover:text-red-500 transition-colors" />
          </button>
          <button className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-md flex flex-col items-center justify-center text-white hover:bg-white/10 transition group">
            <Share2 className="w-6 h-6" />
          </button>
        </div>

      </div>
    </main>
  );
}
