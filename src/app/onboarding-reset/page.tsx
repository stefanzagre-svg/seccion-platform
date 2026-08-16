'use client';

import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function OnboardingReset() {
  useEffect(() => {
    // 1. Wipe all local and session storage synchronously
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch (err) {
      console.warn('Error clearing storage:', err);
    }

    // 2. Clear all browser cookies synchronously
    try {
      document.cookie.split(";").forEach((c) => {
        document.cookie = c
          .replace(/^ +/, "")
          .replace(/=.*/, "=;expires=" + new Date(0).toUTCString() + ";path=/");
      });
    } catch (err) {
      console.warn('Error clearing cookies:', err);
    }

    // 3. Fire-and-forget Supabase signOut (non-blocking)
    try {
      void supabase.auth.signOut();
    } catch {}

    // 4. Immediate redirect to fresh creator onboarding
    const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
    const role = params?.get('role');
    const targetUrl = role === 'creator' ? '/onboarding?role=creator&fresh=true' : '/onboarding?fresh=true';

    const timer = setTimeout(() => {
      window.location.href = targetUrl;
    }, 150);

    return () => clearTimeout(timer);
  }, []);

  const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const role = params?.get('role');
  const targetUrl = role === 'creator' ? '/onboarding?role=creator&fresh=true' : '/onboarding?fresh=true';

  return (
    <div className="min-h-screen bg-black flex items-center justify-center text-white p-6">
      <div className="text-center space-y-4 max-w-sm">
        <div className="w-12 h-12 border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mx-auto mb-4" />
        <h1 className="text-2xl font-black tracking-widest text-glow uppercase">Fresh Start Loading ✨</h1>
        <p className="text-white/40 text-xs font-semibold max-w-xs mx-auto">
          Clearing your data and redirecting...
        </p>
        <a
          href={targetUrl}
          className="inline-block mt-4 px-6 py-2.5 bg-primary text-black font-black uppercase text-xs rounded-xl tracking-wider hover:opacity-90 transition"
        >
          Click Here If Not Redirected →
        </a>
      </div>
    </div>
  );
}
