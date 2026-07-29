"use client";

import React from "react";
import Link from "next/link";
import { useTranslation } from "@/context/LanguageContext";

export default function PublicFooter() {
  const { t } = useTranslation();

  return (
    <footer className="relative z-10 bg-[#0B0C10] border-t border-white/10 flex flex-col items-center justify-center w-full px-4 sm:px-6 md:px-12 lg:px-20 py-12 gap-8 text-center mt-auto">
      {/* Top: Centered 3D Icon */}
      <div className="flex justify-center">
        <img 
          src="/assets/logo/seccion-icon-light.png" 
          alt="SECCION Icon" 
          className="w-12 h-12 md:w-14 md:h-14 drop-shadow-[0_0_20px_rgba(0,251,251,0.4)] object-contain" 
        />
      </div>

      {/* Middle: Navigation Links */}
      <div className="flex flex-wrap justify-center gap-4 sm:gap-8">
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

      {/* Bottom: Clean Wordmark Only */}
      <div className="flex flex-col items-center gap-3">
        <img 
          src="/assets/logo/seccion-wordmark-light.png" 
          alt="SECCION Logo" 
          className="h-8 md:h-10 drop-shadow-[0_0_25px_rgba(0,251,251,0.4)] object-contain" 
        />
        <p className="font-mono text-[11px] font-medium tracking-widest text-[#b9cac9] opacity-40 pt-2">
          © 2026 SECCION. {t("footer.rights", "ALL RIGHTS RESERVED.")}
        </p>
      </div>
    </footer>
  );
}
