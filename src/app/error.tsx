'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw, Compass } from 'lucide-react';

export default function RootErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[RootErrorBoundary] Unhandled UI error caught:', error);
  }, [error]);

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center px-4 text-center bg-[#0a0a0f] text-white">
      <div className="max-w-md w-full p-8 rounded-3xl bg-zinc-950/80 border border-white/10 backdrop-blur-2xl shadow-[0_0_50px_rgba(0,0,0,0.8)] relative overflow-hidden">
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-[#66fcf1]/10 blur-[60px] rounded-full pointer-events-none" />

        <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.2)]">
          <AlertTriangle className="w-8 h-8" />
        </div>

        <h2 className="text-2xl font-black uppercase Outfit tracking-tight mb-2 text-white">
          Session Restored Safely
        </h2>
        <p className="text-zinc-400 text-xs font-medium leading-relaxed mb-6">
          An unexpected interface anomaly was caught. Your account, messages, and secure cryptographic state remain fully protected.
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => reset()}
            className="flex-1 py-3.5 px-4 rounded-xl bg-[#66fcf1] text-black font-black uppercase tracking-widest text-xs hover:bg-[#45a29e] transition flex items-center justify-center gap-2 cursor-pointer active:scale-95 shadow-[0_0_20px_rgba(102,252,241,0.3)]"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Try Again</span>
          </button>
          <Link
            href="/feed"
            className="flex-1 py-3.5 px-4 rounded-xl bg-white/10 text-white font-bold uppercase tracking-wider text-xs hover:bg-white/20 transition flex items-center justify-center gap-2 cursor-pointer active:scale-95 border border-white/10"
          >
            <Compass className="w-4 h-4" />
            <span>Go to Feed</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
