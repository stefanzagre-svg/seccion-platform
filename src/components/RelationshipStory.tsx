'use client';

import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DualGaugeState, levelProgress, RELATIONSHIP_LEVELS, SuggestionMove, getAvailableMoves } from '@/lib/relationship-engine';
import { Sparkles, ArrowRight, ShieldCheck, ChevronRight, Globe, MapPin, ShieldAlert } from 'lucide-react';

interface RelationshipStoryProps {
  gaugeState: DualGaugeState;
  onMoveClick?: (move: SuggestionMove) => void;
  isKycVerified?: boolean;
}

export default function RelationshipStory({ gaugeState, onMoveClick, isKycVerified = false }: RelationshipStoryProps) {
  const { level, sharedScore, tension } = gaugeState;
  const progress = levelProgress(sharedScore);

  const DIGITAL_MOVE_IDS = [
    'follow', 'poke', 'punch', 'reaction', 'compliment',
    'introduce_yourself', 'playlist', 'movie', 'gaming',
    'gift', 'online', 'learn'
  ];

  const EXPLICIT_MOVE_IDS = [
    'appetizer', 'relax', 'performance', 'swing'
  ];

  // ✅ Fetch ALL potential moves regardless of KYC status for visual counts & engagement
  const allCumulativeMoves = useMemo(
    () => getAvailableMoves(level, true),
    [level]
  );

  const digitalMoves = useMemo(
    () => allCumulativeMoves.filter(m => DIGITAL_MOVE_IDS.includes(m.id)),
    [allCumulativeMoves]
  );
  const explicitMoves = useMemo(
    () => allCumulativeMoves.filter(m => EXPLICIT_MOVE_IDS.includes(m.id)),
    [allCumulativeMoves]
  );
  const realLifeMoves = useMemo(
    () => allCumulativeMoves.filter(m => !DIGITAL_MOVE_IDS.includes(m.id) && !EXPLICIT_MOVE_IDS.includes(m.id)),
    [allCumulativeMoves]
  );

  // Auto-open the first category that actually has moves for this level
  const firstAvailable = useMemo<'digital' | 'realLife' | 'explicit' | null>(() => {
    if (digitalMoves.length > 0) return 'digital';
    if (realLifeMoves.length > 0) return 'realLife';
    if (explicitMoves.length > 0) return 'explicit';
    return null;
  }, [digitalMoves, realLifeMoves, explicitMoves]);

  const [allowExplicit, setAllowExplicit] = useState(false);
  const [openCategory, setOpenCategory] = useState<'digital' | 'realLife' | 'explicit' | null>(firstAvailable);

  // When level changes, reset to the first available category
  useEffect(() => {
    setOpenCategory(firstAvailable);
  }, [level.key, firstAvailable]);

  // Find the next level if we're not at max
  const currentIdx = RELATIONSHIP_LEVELS.findIndex(l => l.key === level.key);
  const nextLevel = currentIdx < RELATIONSHIP_LEVELS.length - 1 ? RELATIONSHIP_LEVELS[currentIdx + 1] : null;


  return (
    <div className="glass-card p-6 rounded-3xl border border-white/5 relative overflow-hidden">
      {/* Background Glow based on current level color */}
      <div 
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 50% 50%, ${level.color} 0%, transparent 70%)`
        }}
      />
      
      <div className="relative space-y-6">
        <div>
          <h3 className="text-sm font-black uppercase tracking-[0.2em] mb-1 text-white/50">
            Current Stage
          </h3>
          <h2 className="text-3xl font-black uppercase tracking-tighter" style={{ color: level.color }}>
            {level.label}
          </h2>
        </div>

        <div className="text-xs font-semibold text-white/70 leading-relaxed min-h-[40px]">
          {level.key === 'strangers' && "You are new to each other. Break the ice and start building attraction."}
          {level.key === 'acquaintance' && "Ice broken! Keep talking online to see if there is potential synergy."}
          {level.key === 'friendly' && "A solid friendship is forming. You share mutual interests and active conversations."}
          {level.key === 'close' && "A strong bond is forming. Trust is deepening beyond the surface."}
          {level.key === 'intimate' && "Intense connection. Barriers are coming down, sharing deeper desires."}
          {level.key === 'passionate' && "High-energy alignment. Your shared goals and passions are fueling this."}
          {level.key === 'committed' && "A profound mutual investment. You're building something lasting."}
          {level.key === 'soulmate' && "Maximum relational gravity. A rare and absolute alignment."}
        </div>

        {/* Suggested Moves — cumulative from all unlocked levels */}
        {allCumulativeMoves.length > 0 && (
          <div className="pt-4 border-t border-white/5 space-y-4 text-left">
            <h4 className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40">
              Available Moves
            </h4>

            {/* Explicit Content Toggle */}
            {explicitMoves.length > 0 && (
              <label className={`flex items-center justify-between p-2.5 rounded-xl border transition select-none ${
                !isKycVerified 
                  ? 'bg-purple-950/5 border-purple-950/20 opacity-55 cursor-not-allowed'
                  : 'bg-white/[0.02] border-white/5 cursor-pointer hover:bg-white/5'
              }`}>
                <span className="text-[9px] font-black uppercase tracking-wider text-white/60 flex items-center gap-1.5">
                  Allow Sexual Explicit Moves
                  {!isKycVerified && (
                    <span className="text-[7px] bg-purple-500/20 text-purple-400 px-1 py-0.5 rounded border border-purple-500/30">
                      Verification Required
                    </span>
                  )}
                </span>
                <input 
                  type="checkbox" 
                  checked={allowExplicit && isKycVerified} 
                  disabled={!isKycVerified}
                  onChange={(e) => setAllowExplicit(e.target.checked)} 
                  className="w-4 h-4 rounded border-white/20 bg-black/40 text-purple-500 focus:ring-0 cursor-pointer disabled:cursor-not-allowed"
                />
              </label>
            )}

            <div className="space-y-2">
              {/* Category: Digital Moves */}
              {digitalMoves.length > 0 && (
                <div className="space-y-2">
                  <button 
                    type="button"
                    onClick={() => setOpenCategory(openCategory === 'digital' ? null : 'digital')}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl border transition-all text-[10px] font-black uppercase tracking-wider ${openCategory === 'digital' ? 'bg-primary/10 border-primary/30 text-primary' : 'bg-white/2 border-white/5 text-white/60 hover:text-white hover:bg-white/5'}`}
                  >
                    <span className="flex items-center gap-2">
                      <Globe className="w-3.5 h-3.5" />
                      Digital Moves ({digitalMoves.length})
                    </span>
                    <ChevronRight className={`w-4 h-4 transition-transform duration-300 ${openCategory === 'digital' ? 'rotate-90' : ''}`} />
                  </button>
                  {openCategory === 'digital' && (
                    <div className="grid grid-cols-1 gap-2 p-1">
                      {digitalMoves.map(move => (
                        <button
                          key={move.id}
                          onClick={() => onMoveClick?.(move)}
                          className="w-full px-3.5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold transition flex items-center justify-between group"
                        >
                          <span className="flex items-center gap-2 text-white/80 group-hover:text-white">
                            <span>{move.emoji}</span>
                            <span>{move.label}</span>
                          </span>
                          <ArrowRight className="w-3 h-3 text-white/30 group-hover:text-white/80 transition-transform group-hover:translate-x-0.5" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Category: In Person Moves */}
              {realLifeMoves.length > 0 && (
                <div className="space-y-2">
                  <button 
                    type="button"
                    onClick={() => setOpenCategory(openCategory === 'realLife' ? null : 'realLife')}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl border transition-all text-[10px] font-black uppercase tracking-wider ${
                      openCategory === 'realLife' 
                        ? 'bg-accent/10 border-accent/30 text-accent' 
                        : 'bg-white/2 border-white/5 text-white/60 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5" />
                      In Person Moves ({realLifeMoves.length})
                      {!isKycVerified && (
                        <span className="text-[7px] bg-red-500/20 text-[#ff007f] px-1 py-0.5 rounded border border-red-500/30">
                          Locked
                        </span>
                      )}
                    </span>
                    <ChevronRight className={`w-4 h-4 transition-transform duration-300 ${openCategory === 'realLife' ? 'rotate-90' : ''}`} />
                  </button>
                  {openCategory === 'realLife' && (
                    <div className="grid grid-cols-1 gap-2 p-1">
                      {!isKycVerified ? (
                        <div className="flex flex-col items-center justify-center p-4 rounded-xl border border-red-500/20 bg-red-950/10 text-center gap-2.5">
                          <ShieldAlert className="w-6 h-6 text-[#ff007f]" />
                          <div className="space-y-0.5">
                            <p className="text-[10px] font-black uppercase tracking-wider text-white/90">Identity Verification Required</p>
                            <p className="text-[9px] text-white/50 leading-normal max-w-[220px]">
                              Unlock {realLifeMoves.length} In Person moves (like coffee dates, dinner, excursions) by verifying your profile.
                            </p>
                          </div>
                          <button
                            onClick={() => {
                              const proposeBtn = document.querySelector('button[id*="propose"], button[class*="propose"]');
                              if (proposeBtn) (proposeBtn as HTMLButtonElement).click();
                              else alert("Click the 'Propose Action Move' button at the top of the connection status to verify.");
                            }}
                            className="px-3.5 py-2 bg-[#ff007f] hover:bg-[#ff007f]/90 text-white text-[9px] font-black uppercase tracking-widest rounded-lg transition"
                          >
                            Verify Profile
                          </button>
                        </div>
                      ) : (
                        realLifeMoves.map(move => (
                          <button
                            key={move.id}
                            onClick={() => onMoveClick?.(move)}
                            className="w-full px-3.5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold transition flex items-center justify-between group"
                          >
                            <span className="flex items-center gap-2 text-white/80 group-hover:text-white">
                              <span>{move.emoji}</span>
                              <span>{move.label}</span>
                            </span>
                            <ArrowRight className="w-3 h-3 text-white/30 group-hover:text-white/80 transition-transform group-hover:translate-x-0.5" />
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Category: Sexual Explicit Moves */}
              {explicitMoves.length > 0 && (
                <div className="space-y-2">
                  <button 
                    type="button"
                    onClick={() => setOpenCategory(openCategory === 'explicit' ? null : 'explicit')}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl border transition-all text-[10px] font-black uppercase tracking-wider ${
                      openCategory === 'explicit' 
                        ? 'bg-purple-500/10 border-purple-500/30 text-purple-400' 
                        : 'bg-white/2 border-white/5 text-white/60 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <ShieldAlert className="w-3.5 h-3.5" />
                      Sexual Explicit Moves ({explicitMoves.length})
                      {!isKycVerified && (
                        <span className="text-[7px] bg-purple-500/20 text-purple-400 px-1 py-0.5 rounded border border-purple-500/30">
                          Locked
                        </span>
                      )}
                    </span>
                    <ChevronRight className={`w-4 h-4 transition-transform duration-300 ${openCategory === 'explicit' ? 'rotate-90' : ''}`} />
                  </button>
                  {openCategory === 'explicit' && (
                    <div className="grid grid-cols-1 gap-2 p-1">
                      {!isKycVerified ? (
                        <div className="flex flex-col items-center justify-center p-4 rounded-xl border border-purple-500/20 bg-purple-950/10 text-center gap-2.5">
                          <ShieldAlert className="w-6 h-6 text-purple-400" />
                          <div className="space-y-0.5">
                            <p className="text-[10px] font-black uppercase tracking-wider text-white/90">Identity Verification Required</p>
                            <p className="text-[9px] text-white/50 leading-normal max-w-[220px]">
                              Unlock {explicitMoves.length} Sexual Explicit moves by completing your Identity Verification.
                            </p>
                          </div>
                          <button
                            onClick={() => {
                              const proposeBtn = document.querySelector('button[id*="propose"], button[class*="propose"]');
                              if (proposeBtn) (proposeBtn as HTMLButtonElement).click();
                              else alert("Click the 'Propose Action Move' button at the top of the connection status to verify.");
                            }}
                            className="px-3.5 py-2 bg-purple-500 hover:bg-purple-600 text-white text-[9px] font-black uppercase tracking-widest rounded-lg transition"
                          >
                            Verify Profile
                          </button>
                        </div>
                      ) : allowExplicit ? (
                        explicitMoves.map(move => (
                          <button
                            key={move.id}
                            onClick={() => onMoveClick?.(move)}
                            className="w-full px-3.5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold transition flex items-center justify-between group"
                          >
                            <span className="flex items-center gap-2 text-white/80 group-hover:text-white">
                              <span>{move.emoji}</span>
                              <span>{move.label}</span>
                            </span>
                            <ArrowRight className="w-3 h-3 text-white/30 group-hover:text-white/80 transition-transform group-hover:translate-x-0.5" />
                          </button>
                        ))
                      ) : (
                        <div className="text-center py-4 bg-purple-950/10 border border-purple-500/20 rounded-2xl text-[9px] uppercase tracking-wider font-black text-purple-400/80 p-4">
                          🔒 Explicit moves hidden.<br />Enable the checkbox toggle to show them.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
        
      </div>
    </div>
  );
}
