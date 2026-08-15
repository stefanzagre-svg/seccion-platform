'use client';

import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function OnboardingReset() {
  useEffect(() => {
    const doReset = async () => {
      
      // 1. Reset profile fields in Supabase database & Sign out
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user?.id) {
          // Delete test profile row from database so fresh onboarding triggers cleanly
          await supabase.from('profiles').delete().eq('id', session.user.id);
        }
        await supabase.auth.signOut();
      } catch (err) {
        console.warn('Error during reset & signout:', err);
      }

      // 2. Clear all browser storage
      try {
        localStorage.clear();
        sessionStorage.clear();
      } catch (err) {
        console.warn('Error clearing storage:', err);
      }

      // 3. Clear cookies
      try {
        document.cookie.split(";").forEach((c) => {
          document.cookie = c
            .replace(/^ +/, "")
            .replace(/=.*/, "=;expires=" + new Date(0).toUTCString() + ";path=/");
        });
      } catch (err) {
        console.warn('Error clearing cookies:', err);
      }

      // 4. Hard redirect to onboarding landing page with fresh flag
      setTimeout(() => {
        window.location.href = '/onboarding?fresh=true';
      }, 400);
    };

    doReset();
  }, []);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center text-white p-6">
      <div className="text-center space-y-4">
        <div className="w-12 h-12 border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mx-auto mb-4" />
        <h1 className="text-2xl font-black tracking-widest text-glow uppercase">Fresh Start Loading ✨</h1>
        <p className="text-white/40 text-xs font-semibold max-w-xs mx-auto">
          Clearing your data and sending you back — fresh vibes in a sec.
        </p>
      </div>
    </div>
  );
}
