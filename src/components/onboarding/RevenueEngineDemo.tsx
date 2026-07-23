"use client";

import React from "react";
import { motion } from "framer-motion";
import { Sparkles, DollarSign, TrendingUp, AlertTriangle } from "lucide-react";

interface RevenueEngineDemoProps {
  onComplete: () => void;
}

export default function RevenueEngineDemo({ onComplete }: RevenueEngineDemoProps) {
  return (
    <div className="space-y-6 w-full max-w-lg mx-auto p-1">
      <div className="text-center">
        <span className="text-[10px] uppercase tracking-widest font-black text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
          Payout Math Comparison
        </span>
        <h4 className="text-2xl font-black tracking-tight mt-2 uppercase Outfit">
          Revenue Share Model
        </h4>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* OnlyFans + Agency Model */}
        <div className="glass-card p-5 rounded-2xl border border-red-500/10 bg-red-950/5 relative overflow-hidden flex flex-col justify-between min-h-[220px]">
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-[#FF204E]">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-wider">Traditional Agency</span>
            </div>
            <p className="text-[10px] text-white/50 leading-relaxed font-medium">
              OnlyFans takes 20%, and agencies charge 40–50% to manage DMs, promotions, and scheduling.
            </p>
          </div>

          {/* SVG Progress Ring for Creator share (typically 40%) */}
          <div className="flex justify-center py-2 relative">
            <svg className="w-24 h-24 transform -rotate-90">
              <circle cx="48" cy="48" r="38" className="stroke-white/5" strokeWidth="6" fill="transparent" />
              <motion.circle
                cx="48"
                cy="48"
                r="38"
                className="stroke-red-500"
                strokeWidth="6"
                fill="transparent"
                strokeDasharray={2 * Math.PI * 38}
                initial={{ strokeDashoffset: 2 * Math.PI * 38 }}
                animate={{ strokeDashoffset: 2 * Math.PI * 38 * (1 - 0.4) }}
                transition={{ duration: 1.5, ease: "easeOut" }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl font-black font-mono text-red-400">40%</span>
              <span className="text-[8px] uppercase tracking-widest text-white/40">Your Share</span>
            </div>
          </div>

          <div className="text-[9px] text-red-400/80 font-mono text-center">
            You lose up to 60% of your earnings
          </div>
        </div>

        {/* SECCIØN Model */}
        <div className="glass-card p-5 rounded-2xl border border-primary/20 bg-primary/5 relative overflow-hidden flex flex-col justify-between min-h-[220px] shadow-[0_0_15px_rgba(0,255,255,0.05)]">
          <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/5 to-purple-500/5 pointer-events-none" />
          
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-primary">
              <Sparkles className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-wider">SECCIØN Model</span>
            </div>
            <p className="text-[10px] text-white/50 leading-relaxed font-medium">
              We charge a flat 20% platform fee. AI replaces the management agency for DMs and scheduling at $0 cost.
            </p>
          </div>

          {/* SVG Progress Ring for Creator share (80%) */}
          <div className="flex justify-center py-2 relative">
            <svg className="w-24 h-24 transform -rotate-90">
              <circle cx="48" cy="48" r="38" className="stroke-white/5" strokeWidth="6" fill="transparent" />
              <motion.circle
                cx="48"
                cy="48"
                r="38"
                className="stroke-primary"
                strokeWidth="6"
                fill="transparent"
                strokeDasharray={2 * Math.PI * 38}
                initial={{ strokeDashoffset: 2 * Math.PI * 38 }}
                animate={{ strokeDashoffset: 2 * Math.PI * 38 * (1 - 0.8) }}
                transition={{ duration: 1.5, ease: "easeOut" }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl font-black font-mono text-glow text-white">80%</span>
              <span className="text-[8px] uppercase tracking-widest text-white/40">Your Share</span>
            </div>
          </div>

          <div className="text-[9px] text-primary font-mono text-center">
            You keep 80% of all earnings. Always.
          </div>
        </div>
      </div>

      {/* Done Button */}
      <button
        onClick={onComplete}
        className="w-full mt-4 bg-primary text-black font-black uppercase tracking-widest py-4 rounded-xl hover:shadow-[0_0_20px_rgba(102,252,241,0.4)] transition text-xs flex items-center justify-center gap-2"
      >
        <TrendingUp className="w-4 h-4 text-black" />
        Configure Your Portfolio
      </button>
    </div>
  );
}
