'use client';

import { motion } from 'framer-motion';
import { DollarSign, Target, Gift, CheckCircle } from 'lucide-react';

export interface CreatorGoal {
  id: string;
  creator_id: string;
  title: string;
  description?: string;
  target_amount: number;
  current_amount: number;
  is_completed: boolean;
  created_at?: string;
}

interface CreatorGoalProgressProps {
  goal: CreatorGoal;
  isOwner?: boolean;
  onSponsor?: (goal: CreatorGoal) => void;
}

export default function CreatorGoalProgress({ goal, isOwner = false, onSponsor }: CreatorGoalProgressProps) {
  const percentage = Math.min(100, Math.round((Number(goal.current_amount || 0) / Number(goal.target_amount || 1)) * 100));
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.4 }}
      className="glass-card p-6 relative overflow-hidden border border-white/5 hover:border-primary/25 transition-all duration-300 shadow-[0_20px_40px_rgba(0,0,0,0.5)]"
    >
      {/* Background glow orb */}
      <div className="absolute -top-12 -right-12 w-36 h-36 bg-primary/10 blur-[50px] rounded-full pointer-events-none" />
      
      <div className="flex items-start justify-between gap-4 mb-4 relative z-10">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider bg-primary/20 text-primary border border-primary/20">
              Funding Goal
            </span>
            {goal.is_completed && (
              <span className="px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider bg-success/20 text-success border border-success/20 flex items-center gap-1">
                <CheckCircle className="w-2.5 h-2.5" /> Completed
              </span>
            )}
          </div>
          <h4 className="text-base font-black text-white tracking-tight leading-snug">
            {goal.title}
          </h4>
          {goal.description && (
            <p className="text-xs text-white/60 font-medium mt-1 leading-relaxed max-w-md">
              {goal.description}
            </p>
          )}
        </div>
        
        <div className="p-3 bg-white/5 rounded-2xl border border-white/10 shrink-0 text-primary">
          <Target className="w-5 h-5" />
        </div>
      </div>
      
      {/* Progress Bar Info */}
      <div className="space-y-2 relative z-10 mb-6">
        <div className="flex justify-between items-end text-xs">
          <div>
            <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold block mb-0.5">Raised</span>
            <span className="text-sm font-black text-white flex items-center">
              <DollarSign className="w-3.5 h-3.5 mr-0.5 text-success fill-none" />
              {Number(goal.current_amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold block mb-0.5">Target</span>
            <span className="text-sm font-black text-white/90">
              ${Number(goal.target_amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>
        
        {/* Visual Progress Bar */}
        <div className="h-2.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="h-full bg-gradient-to-r from-primary to-pink-500 rounded-full relative shadow-[0_0_12px_rgba(255,0,127,0.5)]"
          >
            {/* Shimmer effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" style={{ backgroundSize: '200% 100%' }} />
          </motion.div>
        </div>
        
        <div className="flex justify-between items-center text-[10px] text-white/50 font-medium">
          <span>{percentage}% of target goal reached</span>
          {!goal.is_completed && percentage >= 100 && (
            <span className="text-primary font-black animate-pulse">Ready for Completion!</span>
          )}
        </div>
      </div>
      
      {/* Sponsor / Action button */}
      {!isOwner && !goal.is_completed && onSponsor && (
        <button
          onClick={() => onSponsor(goal)}
          className="w-full py-2.5 bg-gradient-to-r from-primary to-pink-500 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all duration-300 flex items-center justify-center gap-2 border border-primary/20 shadow-[0_0_20px_rgba(255,0,127,0.3)] group"
        >
          <Gift className="w-4 h-4 group-hover:scale-110 transition duration-300" />
          Sponsor This Goal
        </button>
      )}
    </motion.div>
  );
}
