'use client';

import { useState } from 'react';
import { ShieldAlert } from 'lucide-react';

interface ContentPolicyWarningProps {
  className?: string;
}

export default function ContentPolicyWarning({ className = '' }: ContentPolicyWarningProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className={`relative inline-block ${className}`}>
      <div 
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-primary/10 border border-primary/30 text-primary text-[10px] font-black uppercase tracking-widest cursor-pointer hover:bg-primary/20 active:scale-95 transition select-none shadow-lg w-full justify-center"
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary/45 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
        </span>
        <ShieldAlert className="w-4 h-4 shrink-0" />
        <span>Content Public Policy</span>
      </div>

      {isOpen && (
        <div className="absolute bottom-full lg:top-full left-0 mb-2 lg:mt-2 w-72 p-4 bg-black/95 backdrop-blur-2xl border border-primary/30 rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.8)] z-50 text-left">
          <h3 className="text-[11px] font-black text-primary uppercase tracking-[0.2em] mb-1.5 flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4" /> Content Public Policy
          </h3>
          <p className="text-[9px] text-white/70 uppercase font-bold leading-relaxed tracking-wider">
            Explicit adult content is strictly restricted on public channels (Avatar, Profile Photos, Public Posts). Please ensure all public media complies with our safety guidelines.
          </p>
        </div>
      )}
    </div>
  );
}
