'use client';

import React, { useState, useEffect } from 'react';
import { Bug, Sparkles } from 'lucide-react';
import { usePathname } from 'next/navigation';
import BugReportModal from './BugReportModal';
import { useTranslation } from '@/context/LanguageContext';

export default function FloatingBugButton() {
  const pathname = usePathname();
  const { t, locale } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Global keyboard shortcut: Ctrl+Shift+B or Cmd+Shift+B
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'B' || e.key === 'b')) {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Hide on admin routes to prevent duplicate triage UI
  if (pathname?.startsWith('/admin')) {
    return null;
  }

  return (
    <>
      <div 
        className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-40 flex items-center gap-2 group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Expanded Tooltip pill on hover */}
        <div 
          className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-[#0F1117]/95 border border-[#00fbfb]/30 rounded-full text-[10px] font-mono text-white shadow-[0_0_15px_rgba(0,251,251,0.2)] backdrop-blur-md transition-all duration-300 pointer-events-none ${
            isHovered ? 'opacity-100 translate-x-0 scale-100' : 'opacity-0 translate-x-2 scale-95'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-[#00fbfb]" />
          <span>{locale === 'es' ? 'Reportar Fallo & Ganar XP/Boost 💎' : 'Report Glitch & Earn XP/Boost 💎'}</span>
          <span className="text-[8px] opacity-40 pl-1">(Ctrl+Shift+B)</span>
        </div>

        {/* Floating Quick Action Button */}
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          aria-label="Report a Glitch"
          className="relative p-3 sm:p-3.5 bg-[#0F1117]/90 hover:bg-[#161922] border border-[#00fbfb]/40 hover:border-[#00fbfb] rounded-full text-[#00fbfb] shadow-[0_0_20px_rgba(0,251,251,0.25)] hover:shadow-[0_0_30px_rgba(0,251,251,0.5)] transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer backdrop-blur-md flex items-center justify-center group"
        >
          <Bug className="w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover:rotate-12" />
          
          {/* Subtle pulse ring */}
          <span className="absolute inset-0 rounded-full border border-[#00fbfb]/40 animate-ping opacity-25 pointer-events-none" />
        </button>
      </div>

      <BugReportModal 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
      />
    </>
  );
}
