"use client";

import React, { useState } from 'react';
import { motion, useAnimation, PanInfo } from 'framer-motion';

const features = [
  "Make New Friends", 
  "Match with Creators", 
  "Show yourself live", 
  "Develop Relationship", 
  "Suggest Moves", 
  "Get sponsored"
];

export default function ValuePropositionCard({ onAccept }: { onAccept: () => void }) {
  const [swiped, setSwiped] = useState(false);
  const controls = useAnimation();

  const handleSwipe = async (info: PanInfo) => {
    if (info.offset.x > 100) {
      setSwiped(true);
      await controls.start({ x: typeof window !== 'undefined' ? window.innerWidth : 500, rotate: 15, opacity: 0, transition: { duration: 0.5 } });
      onAccept();
    } else {
      controls.start({ x: 0, rotate: 0, transition: { type: 'spring', stiffness: 300 } });
    }
  };

  return (
    <div className="relative w-full max-w-md mx-auto h-[750px] flex flex-col items-center justify-center overflow-visible">
      {!swiped && (
        <motion.div
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          onDragEnd={(e, info) => handleSwipe(info)}
          onDrag={(e, info) => {
            controls.set({ rotate: info.offset.x * 0.05 });
          }}
          animate={controls}
          className="relative z-30 w-full h-full rounded-[40px] cursor-grab active:cursor-grabbing shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10 overflow-hidden flex flex-col bg-[#0A0A10]/60 backdrop-blur-xl"
          whileHover={{ scale: 1.02 }}
        >

          <div className="relative z-20 pt-12 px-8 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-white/10 backdrop-blur-md border border-white/20">
               <span className="text-2xl text-white">✦</span>
            </div>
          </div>

          {/* Floating Feature Tags */}
          <div className="relative z-20 flex-1 w-full px-6 flex flex-col justify-center gap-4 py-8">
            {features.map((feature, i) => {
               // Alternate alignment left/right for a masonry/scattered feel
               const isLeft = i % 2 === 0;
               return (
                 <motion.div
                   key={feature}
                   initial={{ opacity: 0, x: isLeft ? -20 : 20 }}
                   animate={{ opacity: 1, x: 0 }}
                   transition={{ delay: i * 0.15 + 0.3, type: 'spring' }}
                   className={`px-5 py-3 rounded-full backdrop-blur-xl border border-white/20 bg-white/5 text-white/90 text-sm font-medium shadow-[0_0_15px_rgba(255,255,255,0.1)] w-max ${isLeft ? 'self-start ml-2' : 'self-end mr-2'}`}
                 >
                   ✨ {feature}
                 </motion.div>
               );
            })}
          </div>

          {/* Bottom Swipe Panel (Text removed as requested) */}
          <div className="relative z-20 p-8 pt-0 flex flex-col items-center">
            <motion.button 
              onClick={async () => {
                setSwiped(true);
                await controls.start({ x: typeof window !== 'undefined' ? window.innerWidth : 500, rotate: 15, opacity: 0, transition: { duration: 0.5 } });
                onAccept();
              }}
              className="flex items-center justify-center gap-3 w-full py-5 bg-gradient-to-r from-purple-500/30 to-pink-500/30 hover:from-purple-500/50 hover:to-pink-500/50 border border-purple-500/50 rounded-2xl text-white shadow-[0_0_30px_rgba(167,139,250,0.5)] backdrop-blur-md transition-all cursor-pointer"
              whileTap={{ scale: 0.98 }}
            >
              <span className="font-bold uppercase tracking-widest text-sm">Swipe Right</span>
              <motion.svg 
                animate={{ x: [0, 8, 0] }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              </motion.svg>
            </motion.button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
