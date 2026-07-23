"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, 
  ShieldCheck, 
  EyeOff, 
  Lock, 
  Unlock, 
  TrendingUp, 
  Gift, 
  Key, 
  ChevronRight, 
  Check, 
  AlertTriangle,
  HelpCircle
} from "lucide-react";

// Types for configuration options
export type VisibilityConfig = "strict" | "balanced" | "magnet";

interface VisibilityAdvisorProps {
  initialConfig?: VisibilityConfig;
  onChange?: (config: VisibilityConfig) => void;
}

export default function VisibilityAdvisor({ initialConfig = "balanced", onChange }: VisibilityAdvisorProps) {
  const [selectedConfig, setSelectedConfig] = useState<VisibilityConfig>(initialConfig);

  interface ConfigItem {
    id: VisibilityConfig;
    name: string;
    tagline: string;
    score: number;
    color: string;
    glowClass: string;
    description: string;
    stats: { label: string; val: string; trend: string; }[];
    warning?: string;
    tip?: string;
  }

  const configs: Record<VisibilityConfig, ConfigItem> = {
    strict: {
      id: "strict" as VisibilityConfig,
      name: "Private & Anonymous",
      tagline: "Option 1 (Request to Peek Only)",
      score: 15,
      color: "#ef4444", // Red
      glowClass: "shadow-[0_0_20px_rgba(239,68,68,0.15)] border-red-500/20",
      description: "100% of your photos and videos are blurred. Members must request permission (Option 1) to peek at your content for 5 minutes.",
      stats: [
        { label: "Matches Yield", val: "-85% lower", trend: "down" },
        { label: "Identity Privacy", val: "100% Sealed", trend: "up" },
        { label: "Match Quality", val: "Niche Vibe", trend: "neutral" }
      ],
      warning: "⚠️ Physical attraction is a major spark on dating platforms. 100% blurred feeds feel like 'hidden files' and discourage likes. Best suited if you are bringing an established audience from external social platforms.",
    },
    balanced: {
      id: "balanced" as VisibilityConfig,
      name: "Aesthetic Balance",
      tagline: "Option 2 (Mandatory Anchors) + Option 1 (Peek)",
      score: 55,
      color: "#00fbfb", // Cyan
      glowClass: "shadow-[0_0_20px_rgba(0,251,251,0.25)] border-[#00fbfb]/30",
      description: "Mandatory public unblurred media (Main Profile 1 & 2) show your style, body silhouette, or environment (Option 2). Your face remains blurred by default and requires a peek request (Option 1).",
      stats: [
        { label: "Matches Boost", val: "+150% higher", trend: "up" },
        { label: "Privacy Rating", val: "Face Blurred", trend: "up" },
        { label: "Attraction Spark", val: "Style Anchor", trend: "up" }
      ],
      tip: "✨ Balanced Option: Preserves facial privacy on public discovery layers while providing environment and style anchors to capture interest.",
    },
    magnet: {
      id: "magnet" as VisibilityConfig,
      name: "Maximum Attraction",
      tagline: "Highly Recommended (Face Unblurred)",
      score: 98,
      color: "#39FF14", // Lime Green
      glowClass: "shadow-[0_0_20px_rgba(57,255,20,0.25)] border-[#39FF14]/30",
      description: "Your face and profile anchors are fully unblurred by default. Showcase your natural aesthetic and build immediate connection with potential matches.",
      stats: [
        { label: "Matches Yield", val: "+450% Maxed", trend: "up" },
        { label: "Trust Conversion", val: "Instant Match", trend: "up" },
        { label: "Attraction Rating", val: "Maximum", trend: "up" }
      ],
      tip: "🔥 Highly Recommended: Showing your face by default maximizes physical attraction and builds immediate trust. Vetted profiles with unblurred faces convert likes to active matches 4.5x faster than blurred profiles.",
    }
  };

  const handleSelect = (id: VisibilityConfig) => {
    setSelectedConfig(id);
    if (onChange) {
      onChange(id);
    }
  };

  const current = configs[selectedConfig];

  return (
    <div className="w-full text-left space-y-6">
      
      {/* Visibility Toggle Options */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Object.values(configs).map((cfg) => {
          const isSelected = selectedConfig === cfg.id;
          return (
            <button
              key={cfg.id}
              type="button"
              onClick={() => handleSelect(cfg.id)}
              className={`p-5 rounded-2xl border bg-[#0F0F1A]/70 text-left transition-all duration-300 relative overflow-visible cursor-pointer ${
                isSelected 
                  ? `${cfg.glowClass} bg-[#0F0F1A]/95 scale-[1.01] z-10` 
                  : "border-white/5 hover:border-white/20 hover:bg-[#0F0F1A]/85 opacity-60 hover:opacity-90"
              }`}
            >
              {/* Pulse Indicator */}
              {isSelected && (
                <div 
                  className="absolute top-4 right-4 w-2 h-2 rounded-full" 
                  style={{ backgroundColor: cfg.color, boxShadow: `0 0 10px ${cfg.color}` }}
                />
              )}
              
              <span className="text-[8px] font-mono uppercase tracking-wider block mb-1" style={{ color: cfg.color }}>
                {cfg.tagline}
              </span>
              <h4 className="text-sm font-bold text-white uppercase tracking-wide">{cfg.name}</h4>
              
              {/* Tiny Score Indicator */}
              <div className="mt-3 flex items-center gap-1.5">
                <span className="text-[10px] font-mono text-white/40">Attractiveness Score:</span>
                <span className="text-xs font-mono font-bold" style={{ color: cfg.color }}>
                  {cfg.score}%
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Consequences & Explanation Panel */}
      <div className="p-1.5 bg-white/[0.02] border border-white/10 rounded-[2rem] relative overflow-visible shadow-[0_24px_48px_-12px_rgba(0,0,0,0.6)] backdrop-blur-xl">
        <div className="absolute inset-0 border border-white/5 rounded-[2rem] pointer-events-none" />
        <div className="bg-[#0F0F1A]/95 p-6 rounded-[calc(2rem-0.125rem)] space-y-6 overflow-visible relative">
          
          {/* Header with Attractiveness Gauge */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-4">
            <div>
              <span className="text-[9px] font-mono uppercase text-white/40 block">Profile Visibility Consequence</span>
              <h3 className="text-base font-bold text-white uppercase tracking-wide mt-0.5">
                {current.name} Flow Setup
              </h3>
            </div>
            
            {/* Dynamic Attractiveness Meter */}
            <div className="flex items-center gap-3 bg-black/40 px-4 py-2 rounded-xl border border-white/5 shrink-0">
              <span className="text-[10px] font-mono text-white/30 uppercase">Attraction Index</span>
              <div className="flex items-center gap-2">
                <div className="w-16 h-2.5 bg-white/10 rounded-full overflow-hidden relative">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${current.score}%` }}
                    transition={{ type: "spring", stiffness: 80, damping: 15 }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: current.color }}
                  />
                </div>
                <span className="font-mono text-xs font-black" style={{ color: current.color }}>
                  {current.score}%
                </span>
              </div>
            </div>
          </div>

          {/* Description */}
          <p className="text-xs text-[#b9cac9] leading-relaxed font-sans">
            {current.description}
          </p>

          {/* Impact Stats Grid */}
          <div className="grid grid-cols-3 gap-2.5 pt-1">
            {current.stats.map((stat, i) => (
              <div key={i} className="p-3 bg-white/5 border border-white/5 rounded-xl text-left">
                <span className="text-white/40 block text-[8px] uppercase tracking-wider font-mono">{stat.label}</span>
                <span 
                  className={`text-xs font-bold block mt-1 font-mono uppercase ${
                    stat.trend === "up" 
                      ? "text-[#39FF14]" 
                      : stat.trend === "down" 
                        ? "text-rose-400" 
                        : "text-[#00fbfb]"
                  }`}
                >
                  {stat.val}
                </span>
              </div>
            ))}
          </div>

          {/* Warning / Tip Alert Boxes */}
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedConfig}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.2 }}
            >
              {current.warning ? (
                <div className="p-3.5 bg-rose-500/5 border border-rose-500/10 rounded-xl flex gap-3 text-left">
                  <AlertTriangle className="w-4.5 h-4.5 text-rose-400 shrink-0 mt-0.5" />
                  <p className="text-[10.5px] text-rose-300/90 leading-relaxed font-sans">
                    {current.warning}
                  </p>
                </div>
              ) : (
                <div className="p-3.5 bg-[#39FF14]/5 border border-[#39FF14]/10 rounded-xl flex gap-3 text-left">
                  <Sparkles className="w-4.5 h-4.5 text-[#39FF14] shrink-0 mt-0.5 animate-pulse" />
                  <p className="text-[10.5px] text-[#39FF14] leading-relaxed font-sans font-medium">
                    {current.tip}
                  </p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

        </div>
      </div>

    </div>
  );
}
