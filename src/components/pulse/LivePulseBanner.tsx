'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Radio, X, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface LivePulseBannerProps {
  creatorName: string;
  creatorAvatar: string;
  eventId: string;
  title: string;
}

export default function LivePulseBanner({ creatorName, creatorAvatar, eventId, title }: LivePulseBannerProps) {
  const [isVisible, setIsVisible] = useState(true);

  // In a real app, this would listen to a Supabase real-time channel
  // and only show when a followed creator goes live.
  
  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -100, opacity: 0 }}
        transition={{ type: 'spring', damping: 20, stiffness: 100 }}
        className="fixed top-20 left-0 right-0 z-[100] px-4 pointer-events-none"
      >
        <div className="max-w-md mx-auto pointer-events-auto">
          <div className="bg-black/80 backdrop-blur-xl border border-primary/30 p-1 rounded-2xl shadow-[0_10px_40px_rgba(102,252,241,0.3)] flex items-center relative overflow-hidden group">
            
            {/* Animated Background Glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-transparent to-transparent opacity-50 pointer-events-none" />

            <div className="relative p-3 flex items-center gap-3 w-full">
              
              {/* Avatar & Pulse */}
              <div className="relative shrink-0">
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-primary z-10 relative">
                  <img src={creatorAvatar} alt={creatorName} className="w-full h-full object-cover" />
                </div>
                {/* Ping animation */}
                <div className="absolute inset-0 bg-primary rounded-full animate-ping opacity-50 z-0" />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-red-500 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-widest text-red-500">Live Now</span>
                </div>
                <h3 className="text-white font-bold text-sm truncate">{creatorName}</h3>
                <p className="text-white/60 text-xs truncate">{title}</p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0">
                <Link 
                  href={`/pulse/live/${eventId}`}
                  className="w-10 h-10 rounded-xl bg-primary/20 hover:bg-primary/30 flex items-center justify-center transition-colors group/btn"
                >
                  <ArrowRight className="w-5 h-5 text-primary group-hover/btn:translate-x-0.5 transition-transform" />
                </Link>
                <button 
                  onClick={() => setIsVisible(false)}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
