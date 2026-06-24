'use client';

import { LucideIcon, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface KPICardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  change?: number; // percentage change, e.g. 12.4
  changeType?: 'positive' | 'negative' | 'neutral';
  timeframe?: string;
  loading?: boolean;
}

export default function KPICard({
  title,
  value,
  icon: Icon,
  change,
  changeType = 'neutral',
  timeframe = 'vs last month',
  loading = false,
}: KPICardProps) {
  return (
    <div className="glass-card p-6 relative overflow-hidden transition-all duration-300 hover:border-primary/20 group">
      {/* Glow Effect on Hover */}
      <div className="absolute -inset-px bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl pointer-events-none" />

      {loading ? (
        <div className="space-y-4 animate-pulse">
          <div className="flex items-center justify-between">
            <div className="h-4 w-24 bg-white/5 rounded" />
            <div className="h-8 w-8 bg-white/5 rounded-xl" />
          </div>
          <div className="h-8 w-32 bg-white/5 rounded" />
          <div className="h-4 w-40 bg-white/5 rounded" />
        </div>
      ) : (
        <div className="flex flex-col h-full justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-white/50 uppercase tracking-widest font-['Plus_Jakarta_Sans']">
              {title}
            </span>
            <div className="p-2.5 rounded-xl border border-white/5 bg-white/5 text-white/80 group-hover:text-primary group-hover:border-primary/20 transition-all duration-300">
              <Icon className="w-5 h-5" />
            </div>
          </div>

          <div>
            <div className="text-2xl font-black font-['Outfit'] text-white tracking-tight mb-1">
              {value}
            </div>

            {change !== undefined && (
              <div className="flex items-center gap-1.5 mt-2">
                <span
                  className={cn(
                    "flex items-center text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded border font-mono",
                    changeType === 'positive' && "bg-success/10 text-success border-success/20",
                    changeType === 'negative' && "bg-destructive/10 text-destructive border-destructive/20",
                    changeType === 'neutral' && "bg-white/5 text-white/50 border-white/10"
                  )}
                >
                  {changeType === 'positive' && <ArrowUpRight className="w-3 h-3 mr-0.5" />}
                  {changeType === 'negative' && <ArrowDownRight className="w-3 h-3 mr-0.5" />}
                  {changeType === 'positive' ? '+' : ''}{change}%
                </span>
                <span className="text-[10px] text-white/40 font-semibold">{timeframe}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
