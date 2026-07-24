"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { X, Sparkles, Tv, Heart, Crown, Gift, Flame } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "@/context/LanguageContext";

export default function PrelaunchBanner() {
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const { t } = useTranslation();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const dismissed = sessionStorage.getItem("seccion_prelaunch_banner_dismissed");
      if (!dismissed) {
        setIsVisible(true);
      }
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    if (typeof window !== "undefined") {
      sessionStorage.setItem("seccion_prelaunch_banner_dismissed", "true");
    }
  };

  const scrollToWaitlist = (e: React.MouseEvent) => {
    e.preventDefault();
    const waitlistElem = document.getElementById("waitlist");
    if (waitlistElem) {
      waitlistElem.scrollIntoView({ behavior: "smooth" });
    } else {
      window.location.href = "/vibe-radar#waitlist";
    }
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: "auto", opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full bg-[#0A0A18]/98 backdrop-blur-2xl border-b-2 border-[#00fbfb] shadow-[0_4px_35px_rgba(0,251,251,0.35)] relative z-50 text-white text-xs font-sans overflow-hidden"
      >
        {/* Animated Shimmer Line Effect across top border */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#ffabf3] via-[#00fbfb] to-[#39FF14] animate-pulse" />

        {/* Ambient neon backdrop glow */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#ffabf3]/10 via-[#00fbfb]/10 to-[#39FF14]/10 pointer-events-none" />

        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-12 py-3 sm:py-3.5 flex flex-col md:flex-row items-center justify-between gap-3 relative z-10">
          
          {/* Breaking News Ticker Header & Copy */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5 text-center md:text-left min-w-0">
            {/* Breaking Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#ffabf3] bg-[#ffabf3]/15 text-[#ffabf3] font-mono text-[10px] font-black uppercase tracking-widest shrink-0 shadow-[0_0_15px_rgba(255,171,243,0.4)] animate-bounce">
              <Flame className="w-3.5 h-3.5 text-[#ffabf3] fill-current" />
              <span>{t("prelaunch.breaking", "BREAKING PRE-LAUNCH")}</span>
            </div>

            {/* Live Streaming Badge */}
            <div className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border border-[#00fbfb]/50 bg-[#00fbfb]/10 text-[#00fbfb] font-mono text-[9px] font-bold uppercase tracking-wider shrink-0 shadow-[0_0_10px_rgba(0,251,251,0.2)]">
              <Tv className="w-3 h-3" />
              <span>{t("prelaunch.engineLive", "Content Engine: LIVE")}</span>
            </div>

            {/* Description Text with Highlights */}
            <span className="text-[12px] sm:text-xs text-white/90 font-semibold leading-snug">
              {t("prelaunch.desc", "Live Streaming & Content are OPEN NATIONWIDE! Local dating activates city-by-city (Medellín Soft Launch).")}
            </span>
          </div>

          {/* High-Converting Action CTAs & Dismiss */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 shrink-0">
            {/* Creator CTA: Claim 90% Revenue */}
            <Link
              href="/become-creator#apply"
              className="group px-3.5 py-2 rounded-full bg-[#00fbfb] text-black font-mono text-[11px] font-black uppercase tracking-wider inline-flex items-center gap-1.5 hover:shadow-[0_0_25px_rgba(0,251,251,0.8)] hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer shadow-[0_0_15px_rgba(0,251,251,0.4)]"
            >
              <Crown className="w-3.5 h-3.5 fill-black" />
              <span>{t("prelaunch.creatorCta", "Creators: Claim 90% Revenue")}</span>
            </Link>

            {/* Member CTA: Early Members Get Rewards */}
            <a
              href="#waitlist"
              onClick={scrollToWaitlist}
              className="group px-3.5 py-2 rounded-full border-2 border-[#ffabf3] bg-[#ffabf3]/10 text-[#ffabf3] font-mono text-[11px] font-black uppercase tracking-wider inline-flex items-center gap-1.5 hover:bg-[#ffabf3]/20 hover:shadow-[0_0_25px_rgba(255,171,243,0.6)] hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer shadow-[0_0_15px_rgba(255,171,243,0.3)]"
            >
              <Gift className="w-3.5 h-3.5" />
              <span>{t("prelaunch.memberCta", "Early Members: Get Rewards")}</span>
            </a>

            {/* Dismiss Button */}
            <button
              onClick={handleDismiss}
              className="p-1.5 text-white/50 hover:text-white transition-colors ml-1 cursor-pointer shrink-0"
              title="Dismiss announcement"
              aria-label="Dismiss announcement"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

        </div>
      </motion.div>
    </AnimatePresence>
  );
}
