'use client';

import { useEffect } from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

const MatchSwiper = dynamic(() => import('@/components/MatchSwiper'), {
  loading: () => (
    <div className="w-full max-w-sm aspect-[3/4] bg-white/[0.02] border border-white/10 rounded-[2.5rem] flex flex-col items-center justify-center gap-3 backdrop-blur-md">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
      <span className="text-[10px] font-['JetBrains_Mono'] uppercase tracking-widest text-white/40">Loading deck...</span>
    </div>
  )
});

export default function Dashboard() {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isCreatorSignup = localStorage.getItem('is_creator_signup') === 'true';
      if (isCreatorSignup) {
        window.location.href = '/onboarding/kyc';
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-transparent relative flex flex-col items-center pt-16 md:pt-24 pb-24 md:pb-8 px-4 overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary/10 blur-[120px] rounded-full pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-4 md:mb-12"
      >
        <h1 className="text-4xl font-black text-glow tracking-tighter">THE SECCIØN</h1>
        <p className="text-muted-foreground mt-2 font-medium">Swipe to build relationships.</p>
      </motion.div>

      <MatchSwiper />
    </div>
  );
}
