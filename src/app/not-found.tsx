import React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft, Sparkles, Compass } from "lucide-react";
import PublicNavbar from "@/components/PublicNavbar";
import PublicFooter from "@/components/PublicFooter";

export const metadata: Metadata = {
  title: "404 — Page Not Found",
  description: "The page you are looking for does not exist on SECCION.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col justify-between relative overflow-hidden font-sans">
      <PublicNavbar />

      {/* Background Cyber Grid */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      {/* Decorative neon ambient glows */}
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-[#00fbfb]/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-[#ffabf3]/5 rounded-full blur-[140px] pointer-events-none" />

      {/* Center 404 Hero */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-24 sm:py-32 text-center max-w-xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-md mb-6">
          <Compass className="w-3.5 h-3.5 text-[#00fbfb] animate-spin" style={{ animationDuration: "12s" }} />
          <span className="text-[11px] font-mono font-bold text-[#00fbfb] uppercase tracking-[0.2em]">
            Error 404 · Uncharted Coordinates
          </span>
        </div>

        <h1 className="font-display font-black text-6xl sm:text-8xl tracking-tight text-white mb-4">
          4<span className="text-[#00fbfb] drop-shadow-[0_0_35px_rgba(0,251,251,0.6)]">0</span>4
        </h1>

        <p className="text-sm sm:text-base text-[#b9cac9] max-w-md mx-auto mb-8 leading-relaxed font-medium">
          The signal you followed doesn’t exist or has moved. Return to the main hub or explore creator opportunities.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/"
            className="px-6 py-3 rounded-full bg-gradient-to-r from-[#00fbfb] to-[#00d2d2] text-black font-mono text-xs font-black uppercase tracking-wider inline-flex items-center gap-2 hover:shadow-[0_0_30px_rgba(0,251,251,0.6)] active:scale-95 transition-all duration-300 min-h-[44px]"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return Home</span>
          </Link>
          <Link
            href="/become-creator"
            className="px-6 py-3 rounded-full border border-[#ffabf3]/40 bg-[#ffabf3]/5 text-[#ffabf3] font-mono text-xs font-black uppercase tracking-wider inline-flex items-center gap-2 hover:bg-[#ffabf3]/15 hover:border-[#ffabf3] active:scale-95 transition-all duration-300 shadow-[0_0_15px_rgba(255,171,243,0.2)] min-h-[44px]"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Become a Creator</span>
          </Link>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
