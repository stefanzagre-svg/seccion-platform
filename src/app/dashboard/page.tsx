'use client';

import MatchSwiper from '@/components/MatchSwiper';
import { motion } from 'framer-motion';

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-transparent relative flex flex-col items-center pt-16 md:pt-24 px-4 overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary/10 blur-[120px] rounded-full pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-4 md:mb-12"
      >
        <h1 className="text-4xl font-black text-glow tracking-tighter">THE SECCION</h1>
        <p className="text-muted-foreground mt-2 font-medium">Swipe to build relationships.</p>
      </motion.div>

      <MatchSwiper />
    </div>
  );
}
