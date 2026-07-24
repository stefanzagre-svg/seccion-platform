"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, PieChart, Activity, Target } from "lucide-react";

interface SynergyEngineDemoProps {
  userArchetype: string; // From Scene 2 selection
  onComplete: (matchScore: number) => void;
}

const ARCHETYPE_COMPATIBILITY: Record<string, { partnerType: string; partnerEmoji: string; description: string; score: number }> = {
  CREATIVER: {
    partnerType: "The Romantic Idealist 💍",
    partnerEmoji: "🌹",
    description: "Your creative dreams match their romantic vision, sparking deep poetic conversations.",
    score: 94
  },
  CAREGIVER: {
    partnerType: "The Analytical Builder 🔧",
    partnerEmoji: "📐",
    description: "Your thoughtful care balances their logical planning, creating an incredibly stable bond.",
    score: 91
  },
  REBEL: {
    partnerType: "The Adrenaline Seeker 🎢",
    partnerEmoji: "💫",
    description: "Two forces of nature colliding. Double the spontaneity, double the adventure.",
    score: 88
  },
  LOGICIAN: {
    partnerType: "The Social Connector 🔗",
    partnerEmoji: "🤝",
    description: "They bridge your analytical world with social ease, helping you connect and build together.",
    score: 89
  },
  POET: {
    partnerType: "The Creative Dreamer 🎨",
    partnerEmoji: "✨",
    description: "A shared landscape of dreams and design. You turn ideas into deep emotional art.",
    score: 95
  }
};

export default function SynergyEngineDemo({ userArchetype, onComplete }: SynergyEngineDemoProps) {
  const [activePanel, setActivePanel] = useState<1 | 2 | 3>(1);
  const [matchScore, setMatchScore] = useState(0);
  const [showOrbitReveal, setShowOrbitReveal] = useState(false);

  // Get compatibility details based on user's archetype choice
  const compatibility = ARCHETYPE_COMPATIBILITY[userArchetype] || {
    partnerType: "The Social Connector 🔗",
    partnerEmoji: "🤝",
    description: "A balanced connection built on mutual understanding and shared values.",
    score: 90
  };

  useEffect(() => {
    // Automatically transition between panels for demo purposes
    const timer1 = setTimeout(() => setActivePanel(2), 2500);
    const timer2 = setTimeout(() => setActivePanel(3), 5000);
    const timer3 = setTimeout(() => {
      setShowOrbitReveal(true);
      // Animate match score rolling up
      let current = 0;
      const interval = setInterval(() => {
        current += 2;
        if (current >= compatibility.score) {
          setMatchScore(compatibility.score);
          clearInterval(interval);
        } else {
          setMatchScore(current);
        }
      }, 30);
    }, 7500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [compatibility.score]);

  return (
    <div className="space-y-6 w-full max-w-lg mx-auto p-1">
      <div className="text-center">
        <span className="text-[10px] uppercase tracking-widest font-black text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
          Synergy Engine Analysis
        </span>
        <h4 className="text-2xl font-black tracking-tight mt-2 uppercase Outfit">
          Predictive Matchmaking
        </h4>
      </div>

      <div className="relative min-h-[380px] flex flex-col justify-between">
        <AnimatePresence mode="wait">
          {/* PANEL 1: Personality Match */}
          {activePanel === 1 && !showOrbitReveal && (
            <motion.div
              key="panel-1"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-card p-6 rounded-3xl border border-white/10 bg-black/40 space-y-6 flex-1 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-primary">
                  <PieChart className="w-5 h-5" />
                  <span className="text-xs font-black uppercase tracking-wider">
                    Vector 1: Personality Alignment (30%)
                  </span>
                </div>
                <p className="text-[11px] text-white/50 leading-relaxed font-medium">
                  We segment 9 distinct archetypes rather than basic keyword matching to map compatibility vectors.
                </p>
              </div>

              {/* Animated SVG Donut Chart */}
              <div className="flex justify-center py-4 relative">
                <svg className="w-36 h-36 transform -rotate-90">
                  <circle
                    cx="72"
                    cy="72"
                    r="55"
                    className="stroke-white/5"
                    strokeWidth="10"
                    fill="transparent"
                  />
                  <motion.circle
                    cx="72"
                    cy="72"
                    r="55"
                    className="stroke-primary"
                    strokeWidth="10"
                    fill="transparent"
                    strokeDasharray={2 * Math.PI * 55}
                    initial={{ strokeDashoffset: 2 * Math.PI * 55 }}
                    animate={{ strokeDashoffset: 2 * Math.PI * 55 * (1 - 0.72) }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-black font-mono">72%</span>
                  <span className="text-[9px] uppercase tracking-widest text-white/40">Vibe Match</span>
                </div>
              </div>

              <div className="text-[10px] text-primary/70 font-mono text-center">
                Analyzed matching coefficients: Archetype × Compatible Range
              </div>
            </motion.div>
          )}

          {/* PANEL 2: Momentum & Activity */}
          {activePanel === 2 && !showOrbitReveal && (
            <motion.div
              key="panel-2"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-card p-6 rounded-3xl border border-white/10 bg-black/40 space-y-4 flex-1 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-primary">
                  <Activity className="w-5 h-5" />
                  <span className="text-xs font-black uppercase tracking-wider">
                    Vector 2: Momentum & Engagement (40%)
                  </span>
                </div>
                <p className="text-[11px] text-white/50 leading-relaxed font-medium">
                  We look at real-time response latency, message volume, and interaction peaks to predict spark longevity.
                </p>
              </div>

              {/* Activity Line Graph */}
              <div className="h-28 w-full border-b border-l border-white/15 relative p-2">
                <svg className="w-full h-full" viewBox="0 0 100 40" preserveAspectRatio="none">
                  <motion.path
                    d="M 0 35 Q 20 20 40 28 T 80 10 T 100 5"
                    fill="none"
                    stroke="#00FFFF"
                    strokeWidth="2"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 2, ease: "easeInOut" }}
                  />
                  {/* Fill Area */}
                  <motion.path
                    d="M 0 35 Q 20 20 40 28 T 80 10 T 100 5 L 100 40 L 0 40 Z"
                    fill="url(#gradient-fill)"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.15 }}
                    transition={{ delay: 1, duration: 1 }}
                  />
                  <defs>
                    <linearGradient id="gradient-fill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#00FFFF" />
                      <stop offset="100%" stopColor="#00FFFF" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                </svg>
                {/* Simulated Heatmap Row */}
                <div className="absolute bottom-1 right-2 flex gap-[2px]">
                  {[0.2, 0.4, 0.9, 0.7, 0.3, 0.8, 0.9, 1.0].map((opacity, idx) => (
                    <motion.div
                      key={idx}
                      className="w-2 h-2 rounded-sm bg-primary"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1, opacity: opacity }}
                      transition={{ delay: idx * 0.1 }}
                    />
                  ))}
                </div>
              </div>

              <div className="text-[10px] text-primary/70 font-mono text-center">
                Processing signal: Average response latency &lt; 8 mins
              </div>
            </motion.div>
          )}

          {/* PANEL 3: Opportunity Fit */}
          {activePanel === 3 && !showOrbitReveal && (
            <motion.div
              key="panel-3"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-card p-6 rounded-3xl border border-white/10 bg-black/40 space-y-6 flex-1 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-primary">
                  <Target className="w-5 h-5" />
                  <span className="text-xs font-black uppercase tracking-wider">
                    Vector 3: Opportunity Fit (30%)
                  </span>
                </div>
                <p className="text-[11px] text-white/50 leading-relaxed font-medium">
                  Matches are evaluated by schedule overlaps, active days, and relationship velocity preferences.
                </p>
              </div>

              {/* Scatter Plot Simulation */}
              <div className="h-28 bg-white/5 rounded-2xl border border-white/10 relative overflow-hidden flex items-center justify-center">
                {/* Concentric rings */}
                <div className="absolute w-24 h-24 border border-white/5 rounded-full animate-ping" style={{ animationDuration: "3s" }} />
                <div className="absolute w-16 h-16 border border-white/10 rounded-full" />
                {/* Scatter nodes */}
                <motion.div
                  className="absolute w-3 h-3 bg-primary rounded-full"
                  animate={{ scale: [1, 1.3, 1], x: -10, y: 15 }}
                  transition={{ repeat: Infinity, duration: 2 }}
                />
                <motion.div
                  className="absolute w-2.5 h-2.5 bg-pink-500 rounded-full"
                  animate={{ scale: [1, 1.2, 1], x: 25, y: -20 }}
                  transition={{ repeat: Infinity, duration: 2.5 }}
                />
                <div className="absolute w-2 h-2 bg-purple-500 rounded-full top-8 left-12 opacity-60" />
                <div className="absolute w-2 h-2 bg-cyan-400 rounded-full bottom-6 right-16 opacity-40" />
              </div>

              <div className="text-[10px] text-primary/70 font-mono text-center">
                Clustering density: Spontaneity matches schedule availability
              </div>
            </motion.div>
          )}

          {/* ORBIT REVEAL: Final Synergy Match */}
          {showOrbitReveal && (
            <motion.div
              key="orbit-reveal"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-card p-6 rounded-3xl border border-primary/30 bg-black/50 space-y-6 flex-1 flex flex-col justify-between"
            >
              <div className="text-center space-y-1">
                <span className="text-[9px] font-black uppercase text-primary tracking-widest block">
                  Synergy Calculated
                </span>
                <div className="text-5xl font-black font-mono text-glow text-white">
                  {matchScore}%
                </div>
              </div>

              {/* Orbit Animation */}
              <div className="h-32 flex items-center justify-center relative overflow-hidden">
                {/* Orbit tracks */}
                <div className="absolute w-24 h-24 border border-white/10 rounded-full" />
                
                {/* Left Card: You */}
                <motion.div
                  className="absolute w-12 h-12 bg-cyan-950/80 border border-cyan-400/50 rounded-xl flex items-center justify-center text-xl shadow-[0_0_15px_rgba(6,182,212,0.3)]"
                  animate={{
                    rotate: 360
                  }}
                  style={{ transformOrigin: "50% 50%" }}
                  transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
                >
                  <span className="text-sm font-black text-cyan-400">YOU</span>
                </motion.div>

                {/* Right Card: Partner */}
                <motion.div
                  className="absolute w-12 h-12 bg-pink-950/80 border border-pink-400/50 rounded-xl flex items-center justify-center text-xl shadow-[0_0_15px_rgba(244,63,94,0.3)]"
                  animate={{
                    rotate: -360
                  }}
                  style={{ transformOrigin: "50% 50%" }}
                  transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
                >
                  <span className="text-lg">{compatibility.partnerEmoji}</span>
                </motion.div>
              </div>

              {/* Insight Text */}
              <div className="text-center space-y-2">
                <h5 className="text-sm font-black uppercase text-white tracking-wide">
                  Synergy Match: {compatibility.partnerType}
                </h5>
                <p className="text-[11px] text-white/60 leading-relaxed max-w-sm mx-auto font-medium">
                  {compatibility.description}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {showOrbitReveal && (
        <button
          onClick={() => onComplete(compatibility.score)}
          className="w-full bg-primary text-black font-black uppercase tracking-widest py-4 rounded-xl hover:shadow-[0_0_20px_rgba(102,252,241,0.4)] transition text-xs flex items-center justify-center gap-2"
        >
          <Sparkles className="w-4 h-4 text-black" />
          Proceed to Part 2: Simulation Hub
        </button>
      )}
    </div>
  );
}
