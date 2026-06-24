"use client";

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function FoundersWelcome() {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="absolute inset-0 flex flex-col items-center justify-center bg-[#0F101A]/95 backdrop-blur-2xl z-50 p-6"
    >
      <div className="w-full max-w-lg bg-gradient-to-b from-white/10 to-transparent border border-white/20 p-10 rounded-3xl shadow-2xl text-center relative overflow-hidden">
        
        {/* Glow effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-purple-500/20 blur-[60px] rounded-full pointer-events-none"></div>

        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="relative z-10"
        >
          <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-tr from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(168,85,247,0.5)] transform rotate-12">
            <span className="text-3xl text-white transform -rotate-12">✦</span>
          </div>

          <h1 className="text-3xl font-bold text-white mb-6">Welcome to Session.</h1>
          
          <div className="relative">
            <span className="absolute -top-4 -left-2 text-4xl text-purple-400/30 font-serif">&quot;</span>
            <p className="text-lg text-gray-300 leading-relaxed relative z-10 px-4">
              We built Session because the world doesn&apos;t need another generic feed. We value real connection, authentic creativity, and true intentionality. Dive in, find your spark, and create magic.
            </p>
            <span className="absolute -bottom-4 -right-2 text-4xl text-purple-400/30 font-serif">&quot;</span>
          </div>

          <div className="mt-8 mb-10 text-right pr-6">
            <p className="text-white text-3xl opacity-90" style={{ fontFamily: "'Caveat', 'Dancing Script', 'Brush Script MT', cursive" }}>— The Founders</p>
          </div>

          <Link href="/onboarding/step-2">
            <button className="w-full py-4 rounded-xl font-bold bg-white text-black hover:bg-gray-100 transition-all transform hover:scale-[1.02] shadow-[0_0_20px_rgba(255,255,255,0.3)]">
              Enter Session
            </button>
          </Link>
        </motion.div>
      </div>
    </motion.div>
  );
}
