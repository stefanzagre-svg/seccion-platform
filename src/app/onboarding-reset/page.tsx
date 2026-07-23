'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function OnboardingReset() {
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const doReset = async () => {
      console.log('Resetting local session...');
      
      // 1. Sign out from Supabase auth
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.warn('Error signing out:', err);
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
            .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
        });
      } catch (err) {
        console.warn('Error clearing cookies:', err);
      }

      // 4. Redirect to onboarding landing page
      setTimeout(() => {
        router.push('/onboarding');
      }, 500);
    };

    doReset();
  }, [router, supabase]);

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
