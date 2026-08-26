"use client";

import React, { useState } from 'react';
import { Loader2, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';

interface DiditVerifyButtonProps {
  onSuccess?: () => void;
  className?: string;
}

export function DiditVerifyButton({ onSuccess, className = "" }: DiditVerifyButtonProps) {
  const [loading, setLoading] = useState(false);
  const [statusText, setStatusText] = useState<string | null>(null);

  const handleStartVerification = async () => {
    try {
      setLoading(true);
      setStatusText("Initializing DIDIT Gateway...");

      const res = await fetch('/api/kyc/didit-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await res.json();
      const sessionUrl = data?.url || 'https://verify.didit.me/u/bPzKX19JQiawBcuyL9kraw';

      // Dynamic import to prevent SSR issues
      try {
        const { DiditSdk } = await import('@didit-protocol/sdk-web');
        if (DiditSdk?.shared) {
          DiditSdk.shared.onComplete = (result: any) => {
            console.log('[DIDIT SDK Completed]:', result?.status);
            if (result?.status === 'completed' && onSuccess) {
              onSuccess();
            }
          };
          DiditSdk.shared.startVerification({ url: sessionUrl });
          setLoading(false);
          setStatusText(null);
          return;
        }
      } catch (sdkErr) {
        console.warn('Didit SDK modal fallback to new tab:', sdkErr);
      }

      // Fallback: Open in popup or new tab if SDK web modal fails
      window.open(sessionUrl, '_blank', 'noopener,noreferrer');
      setLoading(false);
      setStatusText(null);
    } catch (err: any) {
      console.error('Failed to start Didit verification:', err);
      // Fallback direct link
      window.open('https://verify.didit.me/u/bPzKX19JQiawBcuyL9kraw', '_blank', 'noopener,noreferrer');
      setLoading(false);
      setStatusText(null);
    }
  };

  return (
    <button
      onClick={handleStartVerification}
      disabled={loading}
      className={`px-6 py-3.5 bg-[#00fbfb] hover:bg-[#00fbfb]/90 text-black font-mono text-xs font-black uppercase tracking-wider rounded-xl shadow-[0_0_20px_rgba(0,251,251,0.4)] transition flex items-center justify-center gap-2 cursor-pointer shrink-0 disabled:opacity-50 ${className}`}
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin text-black" />
          <span>{statusText || "Launching..."}</span>
        </>
      ) : (
        <>
          <Sparkles className="w-4 h-4 text-black" />
          <span>Launch DIDIT Verification →</span>
        </>
      )}
    </button>
  );
}
