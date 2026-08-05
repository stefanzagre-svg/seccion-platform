'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, PlayCircle, Loader2, CheckCircle2, AlertTriangle, Play, Video } from 'lucide-react';
import ContentUploader from '@/components/creator/ContentUploader';
import LiveManager from '@/components/creator/LiveManager';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

interface VideoContent {
  id: string;
  title: string;
  tier: 'VIP' | 'MASTER';
  status: 'pending' | 'ready' | 'error';
  views: number;
  createdAt: string;
  thumbnailUrl?: string;
}

export default function CreatorStudioPage() {
  const [activeTab, setActiveTab] = useState<'content' | 'upload' | 'live'>('content');
  const [contentList, setContentList] = useState<VideoContent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchContent() {
      try {
        const supabase = createClient();
        const { data: userData } = await supabase.auth.getUser();
        
        if (!userData.user) return;

        const { data, error } = await supabase
          .from('platform_content')
          .select('*')
          .eq('creator_id', userData.user.id)
          .eq('content_type', 'video')
          .order('created_at', { ascending: false });

        if (error) throw error;

        if (data) {
          const mapped: VideoContent[] = data.map((item: any) => {
            let status: 'pending' | 'ready' | 'error' = 'ready';
            if (item.status === 'pending') status = 'pending';
            if (item.status === 'error') status = 'error';

            return {
              id: item.id,
              title: item.cloudflare_stream_uid ? `Video ${item.cloudflare_stream_uid.substring(0, 8)}...` : 'Video',
              tier: item.required_level === 'close' ? 'VIP' : 'MASTER',
              status,
              views: 0,
              createdAt: new Date(item.created_at).toLocaleDateString(),
              thumbnailUrl: item.cloudflare_stream_uid && status === 'ready'
                ? `https://customer-${process.env.NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_HASH || 'hash'}.cloudflarestream.com/${item.cloudflare_stream_uid}/thumbnails/thumbnail.jpg`
                : undefined
            };
          });
          setContentList(mapped);
        }
      } catch (err) {
        console.error('Error fetching content:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchContent();
  }, []);

  const handleUploadSuccess = (uid: string) => {
    // Add the pending video to the list immediately
    const newVideo: VideoContent = {
      id: uid,
      title: 'Processing Upload...',
      tier: 'VIP', 
      status: 'pending',
      views: 0,
      createdAt: 'Just now'
    };
    setContentList([newVideo, ...contentList]);
    setActiveTab('content');
  };

  return (
    <div className="min-h-screen p-6 pt-24 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <h1 className="text-4xl font-black text-white font-['JetBrains_Mono'] tracking-tighter">
            CREATOR <span className="text-primary">STUDIO</span>
          </h1>
          <p className="text-white/60 mt-2 text-sm">
            Manage your premium content, monitor Cloudflare encoding status, and track views.
          </p>
        </div>
        
        <div className="flex bg-black/40 border border-white/10 rounded-xl p-1 backdrop-blur-md">
          <button
            onClick={() => setActiveTab('content')}
            className={`px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition ${
              activeTab === 'content' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/80'
            }`}
          >
            Library
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={`px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition flex items-center gap-2 ${
              activeTab === 'upload' ? 'bg-primary text-black' : 'text-primary hover:bg-primary/10'
            }`}
          >
            <UploadCloud className="w-4 h-4" /> Upload
          </button>
          <button
            onClick={() => setActiveTab('live')}
            className={`px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition flex items-center gap-2 ml-1 ${
              activeTab === 'live' ? 'bg-red-500/20 text-red-400 border border-red-500/50' : 'text-red-400 hover:bg-red-500/10'
            }`}
          >
            <Video className="w-4 h-4" /> Live
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'upload' ? (
          <motion.div
            key="upload"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-2xl mx-auto"
          >
            <ContentUploader onSuccess={handleUploadSuccess} />
          </motion.div>
        ) : activeTab === 'live' ? (
          <motion.div
            key="live"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <LiveManager />
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
              </div>
            ) : contentList.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 bg-white/5 border border-white/10 rounded-3xl">
                <PlayCircle className="w-16 h-16 text-white/20 mb-4" />
                <p className="text-white font-bold mb-1">No content yet</p>
                <p className="text-white/50 text-sm mb-6">Upload your first video to start earning.</p>
                <button 
                  onClick={() => setActiveTab('upload')}
                  className="px-6 py-3 bg-primary text-black font-bold uppercase text-xs rounded-xl hover:shadow-[0_0_20px_rgba(102,252,241,0.4)] transition"
                >
                  Upload Content
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {contentList.map((item) => (
                  <div key={item.id} className="bg-black/40 border border-white/10 rounded-2xl overflow-hidden group">
                    <div className="aspect-[16/9] bg-white/5 relative flex items-center justify-center overflow-hidden">
                      {item.thumbnailUrl ? (
                        <>
                          <img src={item.thumbnailUrl} alt={item.title} className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition duration-500 group-hover:scale-105" />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-12 h-12 rounded-full bg-black/50 backdrop-blur flex items-center justify-center border border-white/20 group-hover:bg-primary/20 group-hover:border-primary/50 transition">
                              <Play className="w-5 h-5 text-white group-hover:text-primary fill-current" />
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="flex flex-col items-center">
                          {item.status === 'pending' ? (
                            <Loader2 className="w-8 h-8 text-primary animate-spin mb-2" />
                          ) : item.status === 'error' ? (
                            <AlertTriangle className="w-8 h-8 text-red-500 mb-2" />
                          ) : null}
                          <span className="text-xs text-white/40 uppercase tracking-widest font-bold">
                            {item.status === 'pending' ? 'Encoding...' : item.status}
                          </span>
                        </div>
                      )}
                      
                      <div className={`absolute top-3 left-3 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider backdrop-blur-md border ${
                        item.tier === 'MASTER' ? 'bg-[#00fbfb]/20 border-[#00fbfb]/50 text-[#00fbfb]' : 'bg-purple-500/20 border-purple-500/50 text-purple-300'
                      }`}>
                        {item.tier}
                      </div>
                    </div>
                    
                    <div className="p-4">
                      <h3 className="text-white font-bold truncate mb-1" title={item.title}>{item.title}</h3>
                      <div className="flex justify-between items-center text-xs text-white/50">
                        <span>{item.createdAt}</span>
                        <span>{item.views.toLocaleString()} views</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
