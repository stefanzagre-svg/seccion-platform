"use client";

import React from 'react';
import { motion } from 'framer-motion';

interface ProfileProgressRingProps {
  progress: number; // 0 to 100
}

export default function ProfileProgressRing({ progress }: ProfileProgressRingProps) {
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center w-40 h-40 mx-auto">
      {/* Background Ring */}
      <svg className="w-full h-full transform -rotate-90">
        <circle
          cx="80"
          cy="80"
          r={radius}
          stroke="currentColor"
          strokeWidth="8"
          fill="transparent"
          className="text-white/10"
        />
        {/* Animated Progress Ring */}
        <motion.circle
          cx="80"
          cy="80"
          r={radius}
          stroke="url(#gradient)"
          strokeWidth="8"
          fill="transparent"
          strokeLinecap="round"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1, ease: "easeInOut" }}
          style={{ strokeDasharray: circumference }}
        />
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#c084fc" /> {/* Purple 400 */}
            <stop offset="100%" stopColor="#f472b6" /> {/* Pink 400 */}
          </linearGradient>
        </defs>
      </svg>

      {/* Percentage Text inside Ring */}
      <div className="absolute flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-white">{progress}%</span>
        <span className="text-[10px] text-gray-400 uppercase tracking-widest mt-1">Complete</span>
      </div>

      {/* Glowing pulse effect when 100% */}
      {progress === 100 && (
        <motion.div 
          className="absolute inset-0 rounded-full bg-purple-500/20 blur-xl z-[-1]"
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ repeat: Infinity, duration: 2 }}
        />
      )}
    </div>
  );
}
