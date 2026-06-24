import { ShieldAlert } from 'lucide-react';

interface SafetyWarningProps {
  className?: string;
}

export default function SafetyWarning({ className = '' }: SafetyWarningProps) {
  return (
    <div className={`bg-red-500/10 border border-red-500/20 p-4 rounded-2xl flex items-start gap-4 ${className}`}>
      <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center shrink-0 border border-red-500/40">
        <ShieldAlert className="w-6 h-6 text-red-500" />
      </div>
      <div>
        <h3 className="text-[11px] font-black text-red-500 uppercase tracking-[0.2em] mb-1">Safety Alert: Content Restriction</h3>
        <p className="text-[9px] text-white/70 uppercase font-bold leading-relaxed tracking-wider">
          Explicit adult content is strictly restricted in public spaces (Avatar, Profile Photos, Bio, Public Posts). 
          Such content must be exclusively uploaded to <span className="text-primary">VIP</span> or <span className="text-[#dc143c]">Master</span> vaults. 
          Violations result in automatic blurring or account suspension.
        </p>
      </div>
    </div>
  );
}
