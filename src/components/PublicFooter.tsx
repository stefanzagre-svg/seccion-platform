"use client";

import React from "react";
import Link from "next/link";
import { useTranslation } from "@/context/LanguageContext";

export default function PublicFooter() {
  const { t } = useTranslation();

  return (
    <footer className="relative z-10 bg-[#0B0C10] border-t border-white/10 flex flex-col items-center justify-center w-full px-4 sm:px-6 md:px-12 lg:px-20 py-6 sm:py-8 gap-4 sm:gap-5 text-center mt-auto">
      {/* Navigation Links */}
      <div className="flex flex-wrap justify-center gap-4 sm:gap-8">
        <Link className="text-[#b9cac9] hover:text-[#ffabf3] transition-colors font-mono text-[11px] font-medium tracking-widest uppercase" href="/blog">
          {t("footer.blog", "Blog & Insights")}
        </Link>
        <Link className="text-[#b9cac9] hover:text-[#ffabf3] transition-colors font-mono text-[11px] font-medium tracking-widest uppercase" href="/privacy">
          {t("footer.privacy", "Your Privacy")}
        </Link>
        <Link className="text-[#b9cac9] hover:text-[#ffabf3] transition-colors font-mono text-[11px] font-medium tracking-widest uppercase" href="/rules">
          {t("footer.rules", "The Rules")}
        </Link>
        <Link className="text-[#b9cac9] hover:text-[#ffabf3] transition-colors font-mono text-[11px] font-medium tracking-widest uppercase" href="/creator-hub">
          {t("footer.creatorHub", "Creator Hub")}
        </Link>
        <Link className="text-[#b9cac9] hover:text-[#ffabf3] transition-colors font-mono text-[11px] font-medium tracking-widest uppercase" href="/hit-us-up">
          {t("footer.contact", "Hit Us Up")}
        </Link>
      </div>

      {/* Bottom: Clean Wordmark & Copyright */}
      <div className="flex flex-col items-center gap-2">
        <img 
          src="/assets/logo/logo-wordmark.png" 
          alt="SECCION Logo" 
          className="h-7 md:h-9 drop-shadow-[0_0_25px_rgba(0,251,251,0.4)] object-contain" 
        />
        <p className="font-mono text-[10px] sm:text-[11px] font-medium tracking-widest text-[#b9cac9] opacity-40 pt-1">
          © 2026 SECCION AI CONCEPT S.L. · {t("footer.rights", "ALL RIGHTS RESERVED.")}
        </p>
      </div>
    </footer>
  );
}
