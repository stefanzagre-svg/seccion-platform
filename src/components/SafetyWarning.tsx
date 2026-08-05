import { useState } from 'react';
import { ShieldAlert } from 'lucide-react';

interface SafetyWarningProps {
  className?: string;
}

export default function SafetyWarning({ className = '' }: SafetyWarningProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className={`relative inline-block ${className}`}>
      <div 
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-[10px] font-black uppercase tracking-widest cursor-pointer hover:bg-red-500/20 active:scale-95 transition select-none shadow-lg"
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
        </span>
        <ShieldAlert className="w-4 h-4 shrink-0" />
        <span>Safety Restriction Info</span>
      </div>

      {isOpen && (
        <div className="absolute bottom-full left-0 mb-3 w-80 max-w-[90vw] p-4 bg-black/95 backdrop-blur-2xl border border-red-500/40 rounded-2xl shadow-[0_-10px_30px_rgba(220,20,60,0.3)] z-[120] text-left">
          <h3 className="text-[11px] font-black text-red-500 uppercase tracking-[0.2em] mb-1.5 flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4" /> Safety Alert: Content Restriction
          </h3>
          <p className="text-[9px] text-white/80 uppercase font-bold leading-relaxed tracking-wider">
            Explicit adult content is strictly restricted in public spaces (Avatar, Profile Photos, Bio, Public Posts). 
            Such content must be exclusively uploaded to <span className="text-primary font-black">VIP</span> or <span className="text-[#dc143c] font-black">Master</span> vaults. 
            Violations result in automatic blurring or account suspension.
          </p>
        </div>
      )}
    </div>
  );
}
