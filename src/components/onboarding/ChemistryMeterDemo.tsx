"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Flame, Zap, Moon, ArrowRight } from "lucide-react";

interface ChemistryMeterDemoProps {
  onComplete: (userScore: number, partnerScore: number) => void;
}

export default function ChemistryMeterDemo({ onComplete }: ChemistryMeterDemoProps) {
  const [userScore, setUserScore] = useState(1);
  const [partnerScore, setPartnerScore] = useState(1);
  const [showSparkHint, setShowSparkHint] = useState(false);
  const [activeSpark, setActiveSpark] = useState<"flame" | "zap" | "moon" | null>(null);

  // Compute Harmonic Mean: 2 / (1/A + 1/B)
  const calculateHarmonicMean = (a: number, b: number) => {
    if (a === 0 || b === 0) return 0;
    return (2 / (1 / a + 1 / b)).toFixed(1);
  };

  const currentLevel = Math.floor(userScore);
  const harmonicMean = calculateHarmonicMean(userScore, partnerScore);

  const handleInteraction = (value: number) => {
    setUserScore((prev) => {
      const next = Math.min(8, prev + value);
      if (next >= 3) {
        setShowSparkHint(true);
      }
      return next;
    });

    // Simulate partner responding 30% of the time, or when user score gets high
    if (Math.random() > 0.7 || userScore > 5) {
      setPartnerScore((prev) => Math.min(8, prev + value * 0.4));
    }
  };

  // Determine current active spark signal based on user score
  React.useEffect(() => {
    if (userScore >= 6) {
      setActiveSpark("zap"); // high momentum
    } else if (userScore >= 3) {
      setActiveSpark("flame"); // sparks starting
    } else {
      setActiveSpark(null);
    }
  }, [userScore]);

  return (
    <div className="space-y-6 w-full max-w-lg mx-auto p-1">
      {/* Interactive Chemistry Gauge */}
      <div className="glass-card p-6 rounded-3xl border border-white/10 bg-black/40 relative overflow-hidden">
        {/* Soft radial background glow */}
        <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/5 to-pink-500/5 pointer-events-none" />

        <div className="text-center mb-6">
          <span className="text-[10px] uppercase tracking-widest font-black text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
            Chemistry Gauge Simulation
          </span>
          <h4 className="text-2xl font-black tracking-tight mt-2 uppercase Outfit">
            Your Connection Score
          </h4>
        </div>

        {/* Dual Gauge Display */}
        <div className="space-y-6 relative z-10">
          {/* User Score Gauge */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-white/60">
              <span>You (Level {currentLevel})</span>
              <span className="text-primary font-mono">{userScore.toFixed(1)} / 8.0</span>
            </div>
            <div className="h-4 bg-white/5 rounded-full overflow-hidden border border-white/10 p-[2px]">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-purple-600 shadow-[0_0_10px_rgba(6,182,212,0.5)]"
                initial={{ width: "12.5%" }}
                animate={{ width: `${(userScore / 8) * 100}%` }}
                transition={{ type: "spring", stiffness: 60 }}
              />
            </div>
          </div>

          {/* Connection Vector Arrow */}
          <div className="flex justify-center items-center py-1">
            <motion.div
              animate={{ x: [0, 5, 0] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
            >
              <ArrowRight className="w-5 h-5 text-purple-400" />
            </motion.div>
          </div>

          {/* Partner Score Gauge */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-white/60">
              <span>Partner (Level {Math.floor(partnerScore)})</span>
              <span className="text-pink-400 font-mono">{partnerScore.toFixed(1)} / 8.0</span>
            </div>
            <div className="h-4 bg-white/5 rounded-full overflow-hidden border border-white/10 p-[2px]">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-pink-500 to-rose-600 shadow-[0_0_10px_rgba(244,63,94,0.5)]"
                initial={{ width: "12.5%" }}
                animate={{ width: `${(partnerScore / 8) * 100}%` }}
                transition={{ type: "spring", stiffness: 60 }}
              />
            </div>
          </div>

          {/* Unified Chemistry Aura Synergy Display */}
          <div className="pt-4 border-t border-white/5 flex flex-col items-center justify-center">
            <div className="text-[10px] uppercase font-black text-white/40 tracking-widest">
              Co-Op Chemistry Synergy
            </div>
            <div className="text-4xl font-black text-white text-glow font-mono mt-1">
              {harmonicMean}
            </div>
            <p className="text-[10px] text-white/50 mt-1 text-center max-w-xs leading-normal">
              You can't level up if they are AFK! Both players must actively invest effort to synchronize and advance.
            </p>
          </div>
        </div>
      </div>

      {/* Spark Hint Banner */}
      {showSparkHint && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-primary/5 border border-primary/20 rounded-2xl flex items-center gap-3 text-left"
        >
          <div className="p-2 bg-primary/10 rounded-xl text-primary shrink-0 animate-pulse">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[9px] font-black uppercase text-primary tracking-widest block">
              ⚡ Live Spark Nudge
            </span>
            <p className="text-[10px] text-white/70 leading-relaxed font-medium">
              SECCION will nudge you when connection dynamics shift.
            </p>
            <div className="flex gap-4 mt-2">
              <span className={`flex items-center gap-1 text-[9px] font-bold ${activeSpark === "flame" ? "text-orange-400" : "text-white/30"}`}>
                <Flame className="w-3.5 h-3.5" /> Flame (Active)
              </span>
              <span className={`flex items-center gap-1 text-[9px] font-bold ${activeSpark === "zap" ? "text-primary" : "text-white/30"}`}>
                <Zap className="w-3.5 h-3.5" /> Zap (Momentum)
              </span>
              <span className={`flex items-center gap-1 text-[9px] font-bold ${activeSpark === "moon" ? "text-blue-400" : "text-white/30"}`}>
                <Moon className="w-3.5 h-3.5" /> Sleep (Cooldown)
              </span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Interaction Buttons (Mini-Game) */}
      <div className="space-y-2">
        <span className="text-[9px] uppercase tracking-widest font-black text-white/40 block text-left">
          Simulate a Move
        </span>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => handleInteraction(0.5)}
            className="py-3 px-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl text-left text-xs font-bold transition flex items-center justify-between group"
          >
            <span>🖐️ Send Hi-Five</span>
            <span className="text-primary font-mono text-[10px] group-hover:translate-x-1 transition-transform">
              +0.5
            </span>
          </button>
          <button
            onClick={() => handleInteraction(0.8)}
            className="py-3 px-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl text-left text-xs font-bold transition flex items-center justify-between group"
          >
            <span>📌 Send Poke</span>
            <span className="text-primary font-mono text-[10px] group-hover:translate-x-1 transition-transform">
              +0.8
            </span>
          </button>
          <button
            onClick={() => handleInteraction(1.2)}
            className="py-3 px-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl text-left text-xs font-bold transition flex items-center justify-between group"
          >
            <span>💬 Send Compliment</span>
            <span className="text-primary font-mono text-[10px] group-hover:translate-x-1 transition-transform">
              +1.2
            </span>
          </button>
          <button
            onClick={() => handleInteraction(1.8)}
            className="py-3 px-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl text-left text-xs font-bold transition flex items-center justify-between group"
          >
            <span>🎯 Invite to Online Date</span>
            <span className="text-primary font-mono text-[10px] group-hover:translate-x-1 transition-transform">
              +1.8
            </span>
          </button>
        </div>
      </div>

      {/* Done Button */}
      <button
        onClick={() => onComplete(userScore, partnerScore)}
        className="w-full mt-4 bg-primary text-black font-black uppercase tracking-widest py-4 rounded-xl hover:shadow-[0_0_20px_rgba(102,252,241,0.4)] transition text-xs flex items-center justify-center gap-2"
      >
        <Sparkles className="w-4 h-4 text-black" />
        Proceed to Synergy Engine
      </button>
    </div>
  );
}
