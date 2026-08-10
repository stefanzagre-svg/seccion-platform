"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { X, Flame, Tv, Crown, Gift, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "@/context/LanguageContext";

export default function PrelaunchBanner() {
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const { t } = useTranslation();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const dismissed = sessionStorage.getItem("seccion_prelaunch_banner_dismissed");
      if (!dismissed) {
        // Small 600ms delay so page hero renders smoothly first
        const timer = setTimeout(() => setIsVisible(true), 600);
        return () => clearTimeout(timer);
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
    handleDismiss();
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
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="w-full max-w-md bg-[#0F0F1A]/95 border-2 border-[#00fbfb]/40 rounded-3xl p-6 sm:p-8 shadow-[0_0_50px_rgba(0,251,251,0.35)] relative overflow-hidden text-white"
        >
          {/* Ambient Glow accents */}
          <div className="absolute -top-20 -left-20 w-44 h-44 bg-[#ffabf3]/20 blur-[50px] rounded-full pointer-events-none" />
          <div className="absolute -bottom-20 -right-20 w-44 h-44 bg-[#00fbfb]/20 blur-[50px] rounded-full pointer-events-none" />

          {/* Top Close Icon */}
          <button
            onClick={handleDismiss}
            className="absolute top-4 right-4 p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition cursor-pointer z-20"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header Badges */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#ffabf3] bg-[#ffabf3]/15 text-[#ffabf3] font-mono text-[10px] font-black uppercase tracking-widest shadow-[0_0_15px_rgba(255,171,243,0.4)] animate-bounce">
              <Flame className="w-3.5 h-3.5 fill-current text-[#ffabf3]" />
              <span>{t("prelaunch.breaking", "BREAKING PRE-LAUNCH")}</span>
            </div>

            <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full border border-[#00fbfb]/50 bg-[#00fbfb]/10 text-[#00fbfb] font-mono text-[9px] font-bold uppercase tracking-wider shadow-[0_0_10px_rgba(0,251,251,0.2)]">
              <Tv className="w-3 h-3" />
              <span>{t("prelaunch.engineLive", "Content Engine: LIVE")}</span>
            </div>
          </div>

          {/* Title & Description */}
          <div className="space-y-2 mb-6 text-left">
            <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              {t("prelaunch.popupTitle", "SECCION Pre-Launch Is Live!")}
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {t("prelaunch.desc", "Live Streaming & Content are OPEN NATIONWIDE! Local dating activates city-by-city (Medellín Soft Launch).")}
            </p>
          </div>

          {/* Action Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
            <Link
              href="/onboarding"
              onClick={handleDismiss}
              className="p-3.5 rounded-2xl bg-[#00fbfb]/10 border border-[#00fbfb]/40 hover:bg-[#00fbfb]/20 hover:border-[#00fbfb] text-white flex items-center gap-3 transition group cursor-pointer"
            >
              <div className="w-8 h-8 rounded-xl bg-[#00fbfb] flex items-center justify-center shrink-0">
                <Crown className="w-4 h-4 text-black fill-black" />
              </div>
              <div className="text-left">
                <span className="text-[11px] font-black uppercase text-[#00fbfb] block tracking-wider">Creators</span>
                <span className="text-[10px] text-white/80 font-bold block">Claim 90% Revenue</span>
              </div>
            </Link>

            <a
              href="#waitlist"
              onClick={scrollToWaitlist}
              className="p-3.5 rounded-2xl bg-[#ffabf3]/10 border border-[#ffabf3]/40 hover:bg-[#ffabf3]/20 hover:border-[#ffabf3] text-white flex items-center gap-3 transition group cursor-pointer"
            >
              <div className="w-8 h-8 rounded-xl bg-[#ffabf3] flex items-center justify-center shrink-0">
                <Gift className="w-4 h-4 text-black" />
              </div>
              <div className="text-left">
                <span className="text-[11px] font-black uppercase text-[#ffabf3] block tracking-wider">Early Members</span>
                <span className="text-[10px] text-white/80 font-bold block">Get VIP Rewards</span>
              </div>
            </a>
          </div>

          {/* Primary "I GOT IT" Dismiss Button */}
          <button
            onClick={handleDismiss}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-primary to-emerald-400 text-black font-black uppercase text-xs tracking-wider shadow-[0_0_25px_rgba(102,252,241,0.5)] hover:shadow-[0_0_35px_rgba(102,252,241,0.8)] hover:scale-[1.02] active:scale-98 transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>{t("prelaunch.gotIt", "I GOT IT")}</span>
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
