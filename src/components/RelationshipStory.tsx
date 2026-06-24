import { motion } from 'framer-motion';
import { DualGaugeState, levelProgress, RELATIONSHIP_LEVELS, SuggestionMove } from '@/lib/relationship-engine';
import { Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';

interface RelationshipStoryProps {
  gaugeState: DualGaugeState;
  onMoveClick?: (move: SuggestionMove) => void;
}

export default function RelationshipStory({ gaugeState, onMoveClick }: RelationshipStoryProps) {
  const { level, sharedScore, tension } = gaugeState;
  const progress = levelProgress(sharedScore);
  
  // Find the next level if we're not at max
  const currentIdx = RELATIONSHIP_LEVELS.findIndex(l => l.key === level.key);
  const nextLevel = currentIdx < RELATIONSHIP_LEVELS.length - 1 ? RELATIONSHIP_LEVELS[currentIdx + 1] : null;

  return (
    <div className="glass-card p-6 rounded-3xl border border-white/5 relative overflow-hidden">
      {/* Background Glow based on current level color */}
      <div 
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{ background: `radial-gradient(circle at top right, ${level.color}, transparent 60%)` }}
      />
      
      <div className="relative z-10 space-y-6">
        
        {/* Header: Current Status */}
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50 mb-1">
              Connection Narrative
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black tracking-tighter" style={{ color: level.color }}>
                {level.label}
              </span>
              {level.kycRequired && (
                <ShieldCheck className="w-4 h-4 text-success" />
              )}
            </div>
          </div>
          <div className="text-right">
            <span className="text-3xl font-black tracking-tighter text-white">
              {sharedScore}
              <span className="text-sm text-white/40">/100</span>
            </span>
            <div className="text-[9px] uppercase tracking-widest text-white/40">
              Harmonic Score
            </div>
          </div>
        </div>

        {/* Narrative Text */}
        <div className="bg-black/20 p-4 rounded-2xl border border-white/5 text-sm leading-relaxed text-white/80">
          <Sparkles className="w-4 h-4 inline-block mr-2 text-primary" />
          {level.key === 'strangers' && "A new connection has formed. The matrix is waiting for your first move."}
          {level.key === 'acquaintance' && "You've established a baseline. Casual interactions will build momentum here."}
          {level.key === 'friendly' && "The vibe is aligning. You're starting to understand each other's rhythm."}
          {level.key === 'close' && "A strong bond is forming. Trust is deepening beyond the surface."}
          {level.key === 'intimate' && "The connection is intense and private. Deep synchronization achieved."}
          {level.key === 'passionate' && "High-energy alignment. Your shared goals and passions are fueling this."}
          {level.key === 'committed' && "A profound mutual investment. You're building something lasting."}
          {level.key === 'soulmate' && "Maximum relational gravity. A rare and absolute alignment."}
        </div>

        {/* Progress to Next Level */}
        {nextLevel && (
          <div className="space-y-2">
            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
              <span style={{ color: level.color }}>{level.label}</span>
              <span className="text-white/30 flex items-center gap-1">
                Next: <span style={{ color: nextLevel.color }}>{nextLevel.label}</span>
              </span>
            </div>
            <div className="h-2 bg-black/40 rounded-full overflow-hidden relative border border-white/5">
              <motion.div 
                className="absolute top-0 left-0 h-full rounded-full"
                style={{ 
                  backgroundColor: level.color,
                  width: `${progress}%`,
                  boxShadow: `0 0 10px ${level.color}`
                }}
                layoutId="progress-bar"
              />
            </div>
          </div>
        )}

        {/* Suggested Moves */}
        {level.suggestionMoves.length > 0 && (
          <div className="pt-4 border-t border-white/5">
            <h4 className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40 mb-3">
              Available Moves
            </h4>
            <div className="flex flex-wrap gap-2">
              {level.suggestionMoves.map(move => (
                <button
                  key={move.id}
                  onClick={() => onMoveClick?.(move)}
                  className="px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold transition flex items-center gap-1.5 group"
                >
                  <span>{move.emoji}</span>
                  <span className="text-white/80 group-hover:text-white">{move.label}</span>
                  <ArrowRight className="w-3 h-3 text-white/30 group-hover:text-white/80 transition-transform group-hover:translate-x-0.5" />
                </button>
              ))}
            </div>
          </div>
        )}
        
      </div>
    </div>
  );
}
