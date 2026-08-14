"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Play, Shield, ShieldAlert, Eye, MessageSquare, Flame } from "lucide-react";
import { useTranslation } from "@/context/LanguageContext";

interface StreamStationDemoProps {
  onComplete: () => void;
}

const STREAM_VIEWERS = [
  { id: 1, name: "VibeMaster_2", level: 5, chemistry: 85, color: "text-primary" },
  { id: 2, name: "NightsInParis", level: 2, chemistry: 30, color: "text-pink-400" },
  { id: 3, name: "PixelPoet", level: 6, chemistry: 92, color: "text-purple-400" },
];

export default function StreamStationDemo({ onComplete }: StreamStationDemoProps) {
  const { t: translate } = useTranslation();
  const [chemLevel, setChemLevel] = useState<1 | 2 | 3 | 4>(1);
  const [showTipAlert, setShowTipAlert] = useState(false);
  const [showEphemeralMedia, setShowEphemeralMedia] = useState(false);
  const [ephemeralCountdown, setEphemeralCountdown] = useState(5);

  // Trigger simulated Tip alerts
  useEffect(() => {
    const tipTimer = setTimeout(() => {
      setShowTipAlert(true);
    }, 2000);
    return () => clearTimeout(tipTimer);
  }, []);

  // Ephemeral media countdown timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (showEphemeralMedia && ephemeralCountdown > 0) {
      interval = setInterval(() => {
        setEphemeralCountdown((prev) => prev - 1);
      }, 1000);
    } else if (ephemeralCountdown === 0) {
      setShowEphemeralMedia(false);
      setEphemeralCountdown(5); // reset
    }
    return () => clearInterval(interval);
  }, [showEphemeralMedia, ephemeralCountdown]);

  // Compute blur intensity based on chemistry level
  const getBlurClass = () => {
    switch (chemLevel) {
      case 1:
        return "blur-[16px]";
      case 2:
        return "blur-[10px]";
      case 3:
        return "blur-[4px]";
      case 4:
        return "blur-0";
      default:
        return "blur-0";
    }
  };

  return (
    <div className="space-y-6 w-full max-w-lg mx-auto p-1">
      <div className="text-center">
        <span className="text-[10px] uppercase tracking-widest font-black text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
          {translate("demos.main.stream_badge", "Studio Streaming Cockpit")}
        </span>
        <h4 className="text-2xl font-black tracking-tight mt-2 uppercase Outfit">
          {translate("demos.main.stream_title", "Stream Station & Privacy")}
        </h4>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">
        {/* Left Column: Stream Screen */}
        <div className="col-span-1 md:col-span-2 flex flex-col gap-3">
          <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-white/10 bg-slate-950 flex items-center justify-center shadow-lg">
            {/* Simulated Live Stream background */}
            <div className="absolute inset-0 bg-gradient-to-tr from-purple-950/40 via-[#050505] to-cyan-950/40 animate-pulse" />
            
            {/* Simulated Creator Camera Feed with progressive blur */}
            <div className="absolute w-28 h-28 rounded-full bg-gradient-to-b from-primary/30 to-purple-600/30 border-2 border-white/20 flex items-center justify-center transition-all duration-500 overflow-hidden">
              <span className={`text-5xl transition-all duration-500 ${getBlurClass()}`}>
                👩‍🎤
              </span>
              {chemLevel < 4 && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-xs">
                  <ShieldAlert className="w-6 h-6 text-primary drop-shadow-[0_0_8px_rgba(0,255,255,0.4)]" />
                </div>
              )}
            </div>

            {/* Live Indicator overlay */}
            <div className="absolute top-3 left-3 flex gap-2">
              <span className="bg-red-500 px-2 py-0.5 rounded text-[9px] font-black uppercase text-white tracking-widest animate-pulse flex items-center">
                LIVE
              </span>
              <span className="bg-black/40 backdrop-blur px-2 py-0.5 rounded text-[9px] font-mono text-white flex items-center gap-1">
                👁️ 4.2K
              </span>
            </div>

            {/* Simulated Tip Alert */}
            <AnimatePresence>
              {showTipAlert && (
                <motion.div
                  initial={{ opacity: 0, y: 15, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="absolute bottom-3 left-3 bg-[#39FF14]/15 border border-[#39FF14]/30 rounded-xl px-3 py-2 flex items-center gap-2 backdrop-blur-md"
                >
                  <span className="text-xl">💸</span>
                  <div>
                    <span className="text-[8px] font-black uppercase text-[#39FF14] tracking-widest block">
                      Tip Alert
                    </span>
                    <span className="text-[10px] font-bold text-white leading-none">
                      VibeMaster_2 sent $20.00
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Simulated Ephemeral Media Overlay */}
            <AnimatePresence>
              {showEphemeralMedia && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="absolute inset-0 bg-black/85 flex flex-col items-center justify-center p-6 z-10"
                >
                  <div className="w-24 h-24 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-xl flex items-center justify-center text-4xl shadow-[0_0_20px_rgba(0,255,255,0.4)]">
                    🎁
                  </div>
                  <span className="text-[9px] font-black uppercase text-primary tracking-widest mt-3">
                    Ephemeral Preview Active
                  </span>
                  <p className="text-[10px] text-white/50 text-center mt-1 max-w-[200px] leading-tight">
                    Disappearing stream moment. Auto-deletes in {ephemeralCountdown}s.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Privacy Slider Controls */}
          <div className="glass-card p-4 rounded-xl border border-white/5 bg-white/2 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-[9px] font-black uppercase tracking-wider text-white/50 flex items-center gap-1">
                <Shield className="w-3.5 h-3.5" /> Face Shield Settings
              </span>
              <span className="text-[9px] font-bold text-primary uppercase font-mono">
                Level {chemLevel}
              </span>
            </div>
            
            <div className="flex gap-2">
              {([1, 2, 3, 4] as const).map((level) => (
                <button
                  key={level}
                  onClick={() => setChemLevel(level)}
                  className={`flex-1 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider border transition-all ${
                    chemLevel === level
                      ? "bg-primary border-primary text-black"
                      : "bg-white/5 border-white/10 text-white/40 hover:bg-white/10"
                  }`}
                >
                  L{level}
                </button>
              ))}
            </div>

            <p className="text-[9px] text-white/40 leading-normal">
              {chemLevel === 1 && "Level 1: Symmetrical Shield active. Face is blurred heavily."}
              {chemLevel === 2 && "Level 2: Progressive transparency active. Outline is visible."}
              {chemLevel === 3 && "Level 3: Custom permission gate. You can toggle blur manually."}
              {chemLevel === 4 && "Level 4: Full trust established. Blur completely disabled."}
            </p>
          </div>
        </div>

        {/* Right Column: Audience Match HUD */}
        <div className="glass-card p-4 rounded-2xl border border-white/10 bg-black/40 flex flex-col justify-between">
          <div className="space-y-4">
            <span className="text-[9px] font-black uppercase text-primary tracking-widest block">
              Who's Vibing With You
            </span>
            <div className="space-y-2">
              {STREAM_VIEWERS.map((v) => (
                <div
                  key={v.id}
                  className="p-2.5 bg-white/2 border border-white/5 rounded-xl flex items-center justify-between text-left"
                >
                  <div>
                    <h6 className="text-[10px] font-bold text-white leading-none">{v.name}</h6>
                    <span className="text-[8px] text-white/40">Synergy Level {v.level}</span>
                  </div>
                  <span className={`text-[10px] font-black font-mono ${v.color}`}>
                    Lv.{v.level}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-white/5">
            <button
              onClick={() => {
                setShowEphemeralMedia(true);
                setEphemeralCountdown(5);
              }}
              disabled={showEphemeralMedia}
              className="w-full py-2 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-400 font-black uppercase tracking-wider rounded-xl transition text-[9px] flex items-center justify-center gap-1.5"
            >
              <Eye className="w-3.5 h-3.5" /> Trigger Ephemeral Media
            </button>
          </div>
        </div>
      </div>

      {/* Done Button */}
      <button
        onClick={onComplete}
        className="w-full mt-4 bg-primary text-black font-black uppercase tracking-widest py-4 rounded-xl hover:shadow-[0_0_20px_rgba(102,252,241,0.4)] transition text-xs flex items-center justify-center gap-2"
      >
        <Sparkles className="w-4 h-4 text-black" />
        See How You Get Paid
      </button>
    </div>
  );
}
