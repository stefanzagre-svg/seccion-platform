"use client";

import React, { useState } from 'react';
import { Loader2, Sparkles } from 'lucide-react';

interface DiditVerifyButtonProps {
  onSuccess?: () => void;
  onError?: (message: string) => void;
  returnTo?: string;
  className?: string;
}

export function DiditVerifyButton({
  onSuccess,
  onError,
  returnTo = '/onboarding/kyc?session_done=true',
  className = "",
}: DiditVerifyButtonProps) {
  const [loading, setLoading] = useState(false);
  const [statusText, setStatusText] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleStartVerification = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      setStatusText("Initializing DIDIT Gateway...");

      const res = await fetch('/api/kyc/didit-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ returnTo }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.url) {
        const msg = data?.error || 'Could not start DIDIT verification session. Please try again.';
        setErrorMsg(msg);
        onError?.(msg);
        setLoading(false);
        setStatusText(null);
        return;
      }

      const sessionUrl = data.url;

      // Dynamic import to prevent SSR issues
      try {
        const [{ DiditSdk }, { isDiditVerificationCompleted }] = await Promise.all([
          import('@didit-protocol/sdk-web'),
          import('@/lib/didit-client'),
        ]);
        if (DiditSdk?.shared) {
          DiditSdk.shared.onComplete = (result) => {
            console.log('[DIDIT SDK Completed]:', result?.type ?? result?.session?.status);
            if (isDiditVerificationCompleted(result) && onSuccess) {
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

      // Fallback: Open session URL returned by /api/kyc/didit-session in a new tab
      window.open(sessionUrl, '_blank', 'noopener,noreferrer');
      setLoading(false);
      setStatusText(null);
    } catch (err: unknown) {
      console.error('Failed to start Didit verification:', err);
      const msg = err instanceof Error && err.message ? err.message : 'Unable to connect to DIDIT Gateway.';
      setErrorMsg(msg);
      onError?.(msg);
      setLoading(false);
      setStatusText(null);
    }
  };

  return (
    <div className="flex flex-col items-stretch sm:items-end gap-1.5">
      <button
        type="button"
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
      {errorMsg && (
        <p className="text-[10px] font-mono text-red-400">{errorMsg}</p>
      )}
    </div>
  );
}
