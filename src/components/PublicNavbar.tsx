"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ArrowUpRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import LanguageSelector from "@/components/LanguageSelector";
import { useTranslation } from "@/context/LanguageContext";
import PrelaunchBanner from "@/components/PrelaunchBanner";

interface PublicNavbarProps {
  activeTab?: string;
  onSignUp?: () => void;
}

export default function PublicNavbar({ activeTab, onSignUp }: PublicNavbarProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation();
  const isAlreadyOnboarding = pathname === "/onboarding";

  const navLinks = [
    { name: t("nav.radar", "Vibe Radar"), href: "/vibe-radar" },
    { name: t("nav.streaming", "Now Streaming"), href: "/now-streaming" },
    { name: t("nav.becomeCreator", "Become Creator"), href: "/become-creator" },
    { name: t("nav.howWeDo", "How We Do"), href: "/how-we-do" },
  ];

  const isLinkActive = (href: string) => {
    if (activeTab) {
      return activeTab === href.substring(1);
    }
    return pathname === href;
  };

  return (
    <>
      {/* Top Header Wrapper containing Pre-launch Banner and Nav */}
      <div className="fixed top-0 left-0 right-0 z-50 flex flex-col w-full">
        <PrelaunchBanner />
        
        {/* Floating Navbar */}
        <nav className="backdrop-blur-xl border-b border-white/10 bg-[#050505]/60 flex justify-between items-center w-full px-4 sm:px-6 md:px-12 lg:px-20 py-3 md:py-4 mx-auto">
        
        {/* Logo Wordmark Only (No Icon) */}
        <Link href="/" className="flex items-center cursor-pointer hover:opacity-90 transition-opacity group">
          <img 
            src="/assets/logo/logo-wordmark.png" 
            alt="SECCION" 
            className="h-7 sm:h-8 md:h-9 object-contain drop-shadow-[0_0_20px_rgba(0,240,255,0.4)] group-hover:drop-shadow-[0_0_30px_rgba(0,240,255,0.7)] transition-all duration-300"
          />
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link 
              key={link.href}
              href={link.href}
              className={`text-[14px] leading-none tracking-[0.05em] font-medium font-['JetBrains_Mono'] transition-all ${
                isLinkActive(link.href)
                  ? "text-[#ffabf3] border-b-2 border-[#ffabf3] pb-1"
                  : "text-[#b9cac9] hover:text-[#00fbfb] pb-1 border-b-2 border-transparent"
              }`}
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* Desktop CTA, Language Selector & Login */}
        <div className="hidden md:flex items-center gap-5">
          <LanguageSelector />
          <Link 
            href="/login"
            className="text-[#b9cac9] hover:text-[#00fbfb] transition-colors text-[14px] leading-none tracking-[0.05em] font-medium font-['JetBrains_Mono'] min-h-[44px] flex items-center"
          >
            {t("nav.login", "Login")}
          </Link>
          {isAlreadyOnboarding && onSignUp ? (
            <button 
              type="button"
              onClick={onSignUp}
              className="px-6 py-2.5 border-2 border-[#00fbfb] text-[#00fbfb] font-['JetBrains_Mono'] text-[14px] leading-none tracking-[0.05em] font-medium uppercase hover:bg-white/10 transition-all active:scale-95 shadow-[0_0_15px_rgba(0,251,251,0.4),0_0_30px_rgba(0,251,251,0.2)] min-h-[44px] flex items-center justify-center cursor-pointer"
            >
              {t("nav.signUp", "SIGN UP")}
            </button>
          ) : (
            <Link 
              href="/early-access"
              className="px-6 py-2.5 border-2 border-[#00fbfb] text-[#00fbfb] font-['JetBrains_Mono'] text-[14px] leading-none tracking-[0.05em] font-medium uppercase hover:bg-white/10 transition-all active:scale-95 shadow-[0_0_15px_rgba(0,251,251,0.4),0_0_30px_rgba(0,251,251,0.2)] min-h-[44px] flex items-center justify-center"
            >
              {t("nav.signUp", "SIGN UP")}
            </Link>
          )}
        </div>

        {/* Mobile Right Actions: Language Selector, LOGIN, SIGN UP, & Hamburger */}
        <div className="md:hidden flex items-center gap-1.5 sm:gap-2">
          <LanguageSelector />
          <Link 
            href="/login"
            className="text-[#b9cac9] hover:text-[#00fbfb] transition-colors text-[11px] font-extrabold font-['JetBrains_Mono'] px-1.5 py-2 min-h-[44px] flex items-center shrink-0"
          >
            {t("nav.login", "LOGIN")}
          </Link>
          {isAlreadyOnboarding && onSignUp ? (
            <button 
              type="button"
              onClick={onSignUp}
              className="px-2.5 sm:px-3.5 py-2 border border-[#00fbfb] text-[#00fbfb] font-['JetBrains_Mono'] text-[10px] sm:text-[11px] leading-none tracking-[0.05em] font-extrabold uppercase hover:bg-[#00fbfb]/10 transition-all active:scale-95 shadow-[0_0_12px_rgba(0,251,251,0.35)] min-h-[44px] flex items-center justify-center rounded-full shrink-0 cursor-pointer"
            >
              {t("nav.signUp", "SIGN UP")}
            </button>
          ) : (
            <Link 
              href="/early-access"
              className="px-2.5 sm:px-3.5 py-2 border border-[#00fbfb] text-[#00fbfb] font-['JetBrains_Mono'] text-[10px] sm:text-[11px] leading-none tracking-[0.05em] font-extrabold uppercase hover:bg-[#00fbfb]/10 transition-all active:scale-95 shadow-[0_0_12px_rgba(0,251,251,0.35)] min-h-[44px] flex items-center justify-center rounded-full shrink-0"
            >
              {t("nav.signUp", "SIGN UP")}
            </Link>
          )}
          <button
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle Menu"
            className="text-white hover:text-[#00fbfb] transition-colors p-2 -mr-1 min-w-[44px] min-h-[44px] flex items-center justify-center cursor-pointer shrink-0"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer (Framer Motion) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-[#0C0C14]/98 backdrop-blur-2xl md:hidden flex flex-col justify-between pt-28 pb-10 px-6"
          >
            {/* Nav Links */}
            <div className="flex flex-col gap-6 text-left">
              <span className="text-[10px] font-mono font-bold text-white/30 uppercase tracking-widest border-b border-white/5 pb-2">
                {t("nav.exploreEcosystem", "Explore Ecosystem")}
              </span>
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={`text-xl font-bold uppercase tracking-wide font-['Outfit'] py-3 border-b border-white/[0.03] flex justify-between items-center ${
                    isLinkActive(link.href)
                      ? "text-[#ffabf3]"
                      : "text-white hover:text-[#00fbfb]"
                  }`}
                >
                  <span>{link.name}</span>
                  <ArrowUpRight className="w-4 h-4 opacity-50" />
                </Link>
              ))}
            </div>

            {/* Bottom Actions */}
            <div className="flex flex-col gap-4 border-t border-white/5 pt-6">
              <Link
                href="/login"
                onClick={() => setIsOpen(false)}
                className="w-full py-4 rounded-2xl bg-white/[0.03] border border-white/10 text-white font-mono text-[14px] font-bold text-center uppercase hover:bg-white/[0.08] transition min-h-[48px] flex items-center justify-center"
              >
                {t("nav.loginAccount", "Login to Account")}
              </Link>
              {isAlreadyOnboarding && onSignUp ? (
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    onSignUp();
                  }}
                  className="w-full py-4 rounded-2xl bg-[#00fbfb] text-black font-mono text-[14px] font-black text-center uppercase hover:shadow-[0_0_20px_rgba(0,251,251,0.4)] transition min-h-[48px] flex items-center justify-center shadow-[0_0_15px_rgba(0,251,251,0.2)] cursor-pointer"
                >
                  {t("nav.startQuest", "Start Onboarding Quest")}
                </button>
              ) : (
                <Link
                  href="/early-access"
                  onClick={() => setIsOpen(false)}
                  className="w-full py-4 rounded-2xl bg-[#00fbfb] text-black font-mono text-[14px] font-black text-center uppercase hover:shadow-[0_0_20px_rgba(0,251,251,0.4)] transition min-h-[48px] flex items-center justify-center shadow-[0_0_15px_rgba(0,251,251,0.2)]"
                >
                  {t("nav.startQuest", "Start Onboarding Quest")}
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      </div>
    </>
  );
}
