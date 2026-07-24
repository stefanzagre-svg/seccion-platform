"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, 
  Crown, 
  Gift, 
  Sparkles, 
  Flame, 
  Bot, 
  ShieldCheck, 
  ArrowRight, 
  Lock, 
  CheckCircle2, 
  Star,
  Zap,
  UserCheck
} from "lucide-react";
import { useTranslation } from "@/context/LanguageContext";

interface PrelaunchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PrelaunchModal({ isOpen, onClose }: PrelaunchModalProps) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<"creator" | "member">("creator");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Darkened Glass Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="relative w-full max-w-2xl bg-[#0d0d18]/98 border border-white/15 rounded-[2.5rem] p-6 sm:p-8 shadow-[0_0_60px_rgba(0,251,251,0.25)] text-white z-10 overflow-hidden"
        >
          {/* Neon Glow Accents */}
          <div className="absolute -top-24 -left-24 w-60 h-60 bg-[#00fbfb]/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-60 h-60 bg-[#ffabf3]/20 rounded-full blur-3xl pointer-events-none" />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white transition-all cursor-pointer z-20"
            aria-label="Close Prelaunch Modal"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="text-center space-y-3 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#00fbfb]/40 bg-[#00fbfb]/10 text-[#00fbfb] font-mono text-[10px] font-black uppercase tracking-widest">
              <Flame className="w-3.5 h-3.5 fill-current animate-pulse text-[#00fbfb]" />
              <span>SECCIØN PRE-LAUNCH PHASE</span>
            </div>

            <h2 className="font-['Outfit'] text-2xl sm:text-4xl font-black uppercase tracking-tight text-white leading-tight">
              Platform Early Access & Rewards
            </h2>

            <p className="text-xs sm:text-sm text-[#b9cac9] max-w-lg mx-auto leading-relaxed">
              SECCIØN is currently in an exclusive pre-launch stage. Public registration & general demo logins are temporarily locked to prioritize approved early creators and founding members.
            </p>
          </div>

          {/* Role Switcher Tabs */}
          <div className="flex bg-black/50 p-1.5 rounded-full border border-white/10 my-6 relative z-10">
            <button
              onClick={() => setActiveTab("creator")}
              className={`flex-1 py-2.5 rounded-full text-xs font-mono font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeTab === "creator"
                  ? "bg-gradient-to-r from-[#00fbfb] to-[#00d2d2] text-black shadow-[0_0_20px_rgba(0,251,251,0.5)]"
                  : "text-white/60 hover:text-white"
              }`}
            >
              <Crown className="w-4 h-4" />
              <span>For Content Creators</span>
            </button>

            <button
              onClick={() => setActiveTab("member")}
              className={`flex-1 py-2.5 rounded-full text-xs font-mono font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeTab === "member"
                  ? "bg-gradient-to-r from-[#ffabf3] to-[#e080d4] text-black shadow-[0_0_20px_rgba(255,171,243,0.5)]"
                  : "text-white/60 hover:text-white"
              }`}
            >
              <Gift className="w-4 h-4" />
              <span>For Early Members</span>
            </button>
          </div>

          {/* Dynamic Content Body */}
          <div className="space-y-4 min-h-[220px] relative z-10">
            {activeTab === "creator" ? (
              <motion.div
                key="creator-tab"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-3.5 bg-black/40 border border-[#00fbfb]/20 p-5 rounded-2xl"
              >
                <div className="flex items-center gap-3 text-[#00fbfb]">
                  <Zap className="w-5 h-5 shrink-0" />
                  <h4 className="font-mono text-xs font-black uppercase tracking-wide text-white">
                    Creator Pre-Launch Perks & 90% Split
                  </h4>
                </div>

                <ul className="space-y-2.5 text-xs text-[#b9cac9]">
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#00fbfb] shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-white">90% Direct Revenue Split:</strong> Keep 90% of all subscriptions, tips, and PPV sales during the pre-launch phase.
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#00fbfb] shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-white">1-Year FREE AI Assistant & Ops Pack:</strong> Approved creators receive a custom VIP Passcode to unlock 24/7 AI chat, tax forecasting, and multi-platform automation free for 12 months.
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#00fbfb] shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-white">DRM & Face Blur Encryption:</strong> Automatic copyright protection & progressive face obfuscation.
                    </span>
                  </li>
                </ul>

                <div className="pt-2">
                  <Link
                    href="/become-creator#apply"
                    onClick={onClose}
                    className="w-full py-3 bg-[#00fbfb] text-black font-mono text-xs font-black uppercase tracking-wider rounded-xl hover:shadow-[0_0_20px_rgba(0,251,251,0.6)] transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Apply for Creator Pre-Launch Access</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="member-tab"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-3.5 bg-black/40 border border-[#ffabf3]/20 p-5 rounded-2xl"
              >
                <div className="flex items-center gap-3 text-[#ffabf3]">
                  <Star className="w-5 h-5 shrink-0" />
                  <h4 className="font-mono text-xs font-black uppercase tracking-wide text-white">
                    Early Member Rewards & Priority Privileges
                  </h4>
                </div>

                <ul className="space-y-2.5 text-xs text-[#b9cac9]">
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#ffabf3] shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-white">100% Free Dating & Matching:</strong> General swiping, matching, and AI Dating Coach icebreakers remain permanently 100% free.
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#ffabf3] shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-white">Founding Member Priority Badge:</strong> Early sign-ups receive a rare permanent "Pioneer Vibe" badge on profile & chat.
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#ffabf3] shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-white">VIP Creator Subscription Discounts:</strong> Early members gain exclusive 50% discount vouchers for creator VIP Subscriptions.
                    </span>
                  </li>
                </ul>

                <div className="pt-2">
                  <Link
                    href="/vibe-radar#waitlist"
                    onClick={onClose}
                    className="w-full py-3 bg-[#ffabf3] text-black font-mono text-xs font-black uppercase tracking-wider rounded-xl hover:shadow-[0_0_20px_rgba(255,171,243,0.6)] transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Join Early Member Waitlist</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </motion.div>
            )}
          </div>

          {/* Footer Note */}
          <div className="mt-6 border-t border-white/10 pt-4 flex flex-col sm:flex-row items-center justify-between text-[10px] text-white/50 gap-2 relative z-10">
            <div className="flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-[#00fbfb]" />
              <span>Public demo logins are temporarily locked for security.</span>
            </div>
            <span>Approved Creators / Admins: Use Sign In page</span>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
