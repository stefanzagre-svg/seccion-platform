"use client";

import { motion } from 'framer-motion';
import { Heart, MessageSquare, Repeat2, Sparkles, Crown, MoreHorizontal } from 'lucide-react';

interface Creator {
  id: string;
  name: string;
  avatar: string;
  niche: string;
  accelerator: number;
  basePrice: number;
}

interface FeedItem {
  id: string;
  creatorName: string;
  avatarUrl: string;
  imageUrl?: string;
  text: string;
  timestamp: string;
  isSpotlight: boolean;
  engagement: {
    likes: number;
    comments: number;
  };
}

interface MasterMixFeedProps {
  creators: Creator[];
}

const FEED_POSTS_POOL = [
  "Just finished editing the new cinematic set. The lighting was absolutely unreal today. 📸✨",
  "Working on a new sound profile. Let me know if you want a sneak peek of the baseline in the DMs.",
  "Behind-the-scenes look at the upcoming release. VIPs get early access tomorrow! 🎬",
  "Calibrating my workflow for the week. Grateful for everyone who's part of the journey.",
  "Sunday coffee and planning. Big announcements coming soon. Stay tuned! ☕🚀",
  "Testing some new filters and visual overlays. Let me know what you think of this mood."
];

const FEED_IMAGES = [
  "https://images.unsplash.com/photo-1516280440502-869f8e40fba5?w=800&q=80",
  "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80",
  "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&q=80",
  "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&q=80"
];

export default function MasterMixFeed({ creators }: MasterMixFeedProps) {
  // If no creators, show default mock
  const activeCreators = creators.length > 0 ? creators : [];

  // Find highest accelerator creator for the Spotlight
  const highestAccelerator = activeCreators.reduce((max, c) => 
    c.accelerator > max.accelerator ? c : max
  , activeCreators[0] || null);

  // Generate dynamic posts from active creators
  const feedItems: FeedItem[] = activeCreators.map((creator, index) => {
    const isSpotlight = highestAccelerator && creator.id === highestAccelerator.id;
    // Determinstic selection based on index
    const text = FEED_POSTS_POOL[index % FEED_POSTS_POOL.length];
    const hasImage = index % 3 === 0;
    const imageUrl = hasImage ? FEED_IMAGES[index % FEED_IMAGES.length] : undefined;
    
    return {
      id: `post-${creator.id}-${index}`,
      creatorName: creator.name,
      avatarUrl: creator.avatar,
      imageUrl,
      text,
      timestamp: `${index + 1}h ago`,
      isSpotlight: !!isSpotlight,
      engagement: {
        likes: Math.floor(creator.accelerator * 800) + (isSpotlight ? 400 : 0),
        comments: Math.floor(creator.accelerator * 90) + (isSpotlight ? 40 : 0)
      }
    };
  });

  // Sort: Spotlight goes first, then newest
  const sortedFeed = [...feedItems].sort((a, b) => {
    if (a.isSpotlight && !b.isSpotlight) return -1;
    if (b.isSpotlight && !a.isSpotlight) return 1;
    return 0;
  });

  if (activeCreators.length === 0) {
    return (
      <div className="text-center py-16 opacity-40 glass-card rounded-3xl border border-white/5">
        <Sparkles className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
        <p className="text-sm font-medium">Add creators to your roster to populate the Master Mix feed.</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 pb-24">
      {/* Feed Header */}
      <div className="flex items-center justify-between px-2">
        <div>
          <h2 className="text-2xl font-black uppercase tracking-tighter text-white">
            Master Mix
          </h2>
          <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mt-1">Aggregated content feed of your sponsored roster</p>
        </div>
        <div className="flex items-center gap-2 bg-primary/10 border border-primary/20 px-3.5 py-1.5 rounded-full shadow-[0_0_15px_rgba(102,252,241,0.1)]">
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          <span className="text-[9px] font-black uppercase tracking-widest text-primary">Curated Index</span>
        </div>
      </div>

      {/* Feed Posts */}
      <div className="space-y-6">
        {sortedFeed.map((post, idx) => (
          <motion.article
            key={post.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className={`glass-card rounded-[2.5rem] overflow-hidden border transition-all duration-500 bg-black/40 ${
              post.isSpotlight 
              ? 'border-primary/40 shadow-[0_0_30px_rgba(102,252,241,0.15)] ring-1 ring-primary/20' 
              : 'border-white/5 hover:border-white/15'
            }`}
          >
            {/* Header */}
            <div className="p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img 
                    src={post.avatarUrl} 
                    alt={post.creatorName} 
                    className={`w-11 h-11 rounded-full object-cover ${post.isSpotlight ? 'border-2 border-primary' : 'border border-white/20'}`}
                  />
                  {post.isSpotlight && (
                    <div className="absolute -bottom-1 -right-1 bg-black rounded-full p-1 border border-primary shadow-lg">
                      <Crown className="w-3.5 h-3.5 text-primary fill-current" />
                    </div>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm text-white tracking-tight">
                      {post.creatorName}
                    </h3>
                    {post.isSpotlight && (
                      <span className="px-2 py-0.5 rounded bg-primary/25 border border-primary/30 text-[8px] font-black uppercase tracking-widest text-primary">
                        Top Rated Spotlight
                      </span>
                    )}
                  </div>
                  <span className="text-[9px] uppercase tracking-widest text-white/40 font-bold">{post.timestamp}</span>
                </div>
              </div>
              <button className="text-white/30 hover:text-white transition">
                <MoreHorizontal className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="px-5 pb-5">
              <p className="text-xs text-white/80 leading-relaxed mb-4 font-medium">{post.text}</p>
              {post.imageUrl && (
                <div className="rounded-2xl overflow-hidden aspect-video border border-white/5 relative group cursor-pointer">
                  <img src={post.imageUrl} alt="Post content" className="w-full h-full object-cover transition duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              )}
            </div>

            {/* Action Bar */}
            <div className="px-5 py-4 bg-white/[0.02] border-t border-white/5 flex items-center justify-between">
              <div className="flex gap-6">
                <button className="flex items-center gap-2 text-white/40 hover:text-primary transition group">
                  <Heart className={`w-4.5 h-4.5 group-hover:scale-110 transition ${post.isSpotlight ? 'text-primary' : ''}`} />
                  <span className="text-[10px] font-black tracking-tight">{post.engagement.likes}</span>
                </button>
                <button className="flex items-center gap-2 text-white/40 hover:text-white transition group">
                  <MessageSquare className="w-4.5 h-4.5 group-hover:scale-110 transition" />
                  <span className="text-[10px] font-black tracking-tight">{post.engagement.comments}</span>
                </button>
                <button className="flex items-center gap-2 text-white/40 hover:text-white transition group">
                  <Repeat2 className="w-4.5 h-4.5 group-hover:scale-110 transition" />
                </button>
              </div>
            </div>
          </motion.article>
        ))}
      </div>
    </div>
  );
}
