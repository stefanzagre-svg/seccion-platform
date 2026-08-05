'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { Loader2, SlidersHorizontal } from 'lucide-react';
import FilterSidebar, { FilterState, defaultFilters } from '@/components/matchmaking/FilterSidebar';

const MatchSwiper = dynamic(() => import('@/components/MatchSwiper'), {
  loading: () => (
    <div className="w-full max-w-sm aspect-[3/4] bg-white/[0.02] border border-white/10 rounded-[2.5rem] flex flex-col items-center justify-center gap-3 backdrop-blur-md">
      <Loader2 className="w-8 h-8 animate-spin text-[#00fbfb]" />
      <span className="text-[10px] font-['JetBrains_Mono'] uppercase tracking-widest text-white/40">Loading deck...</span>
    </div>
  )
});

export default function Dashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>(defaultFilters);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isCreatorSignup = localStorage.getItem('is_creator_signup') === 'true';
      if (isCreatorSignup) {
        window.location.href = '/onboarding/kyc';
      }
    }
  }, []);

  const handleFilterChange = (newFilters: Partial<FilterState>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  return (
    <div className="min-h-screen h-[100dvh] bg-transparent relative flex overflow-hidden pt-16 md:pt-20">
      
      {/* Background glow */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-[#00fbfb]/10 blur-[120px] rounded-full pointer-events-none" />
      
      {/* Matchmaking Filter Sidebar (Always visible on large screens) */}
      <FilterSidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        filters={filters}
        onFilterChange={handleFilterChange}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 relative h-full max-h-full pb-20 md:pb-4 overflow-y-auto">
        
        {/* Mobile Filter Toggle */}
        <div className="absolute top-4 right-4 z-30 lg:hidden">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-black/50 backdrop-blur-md border border-white/10 rounded-full text-white text-xs font-bold uppercase tracking-wider hover:bg-white/10 transition"
          >
            <SlidersHorizontal className="w-4 h-4 text-[#00fbfb]" /> Filters
          </button>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6 hidden md:block"
        >
          <h1 className="text-4xl font-black text-white drop-shadow-[0_0_15px_rgba(0,251,251,0.5)] tracking-tighter">MATCHMAKING</h1>
          <p className="text-[#b9cac9] mt-2 font-mono text-sm uppercase tracking-widest">Actively filter & find your match</p>
        </motion.div>

        {/* The Swipe Deck */}
        <div className="w-full max-w-sm flex-1 flex flex-col items-center justify-center min-h-0">
          <MatchSwiper filters={filters} />
        </div>
      </div>
    </div>
  );
}

