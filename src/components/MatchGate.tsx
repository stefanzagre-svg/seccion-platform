'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Lock, Unlock, ShieldAlert, Sparkles, Activity, MapPin, 
  Clock, Heart, Compass, CheckCircle2, AlertCircle, RefreshCw 
} from 'lucide-react';
import { calculateMatch, type UserProfile, type MatchResult } from '@/lib/match-engine';
import { ARCHETYPE_PROFILES, type ArchetypeId } from '@/lib/constants';

interface MatchGateProps {
  currentUser: UserProfile;
  candidateProfile: UserProfile & { id: string; name: string; avatar: string };
  onUnlocked: () => void;
  onSelectCandidate: (id: string) => void;
  candidatesList: Array<UserProfile & { id: string; name: string; avatar: string }>;
}

const SIGNALS_METADATA = [
  { key: 'archetypeChemistry', label: 'Archetype Chemistry', icon: Compass, color: 'text-purple-400', desc: 'Personality alignment & chemistry' },
  { key: 'lifestyleSync', label: 'Lifestyle Sync', icon: Heart, color: 'text-pink-400', desc: 'Habits & frequency alignment' },
  { key: 'hobbyOverlap', label: 'Hobby Overlap', icon: Sparkles, color: 'text-yellow-400', desc: 'Shared interests similarity' },
  { key: 'moodResonance', label: 'Mood & Passion Resonance', icon: Activity, color: 'text-orange-400', desc: 'Vibe check & core drive sync' },
  { key: 'temporalSignal', label: 'Temporal & Engagement', icon: Clock, color: 'text-cyan-400', desc: 'Activity recency & interaction flow' },
  { key: 'geoProximity', label: 'Geo-Proximity', icon: MapPin, color: 'text-emerald-400', desc: 'Physical proximity check' },
] as const;

export default function MatchGate({ 
  currentUser, 
  candidateProfile, 
  onUnlocked, 
  onSelectCandidate,
  candidatesList 
}: MatchGateProps) {
  const [scanStep, setScanStep] = useState<number>(-1); // -1 = Idle, 0-5 = Scanning signals, 6 = Done, 7 = Blocked
  const [runningScore, setRunningScore] = useState<number>(0);
  const [matchResult, setMatchResult] = useState<MatchResult | null>(null);
  const [showSandbox, setShowSandbox] = useState<boolean>(true);

  // Recalculate match when user or candidate changes
  useEffect(() => {
    const res = calculateMatch(currentUser, candidateProfile);
    setMatchResult(res);
    setScanStep(-1);
    setRunningScore(0);
  }, [currentUser, candidateProfile]);

  // Handle the step-by-step scanning animation
  useEffect(() => {
    if (scanStep < 0 || scanStep >= 6) return;

    if (!matchResult) return;

    // Check if we hit a hard blocker before this signal or if the whole thing is blocked
    if (matchResult.hardBlockerHit && scanStep === 0) {
      // Instantly drop to blocked state if we fail blockers
      const timer = setTimeout(() => {
        setScanStep(7); // Blocked state
      }, 1200);
      return () => clearTimeout(timer);
    }

    const currentKey = SIGNALS_METADATA[scanStep].key;
    const increment = matchResult.breakdown[currentKey] || 0;

    const timer = setTimeout(() => {
      // Animate score increment
      let start = runningScore;
      const target = runningScore + Math.round(increment * 100) / 100;
      const duration = 600;
      const stepTime = Math.abs(Math.floor(duration / (target - start || 1)));
      
      const interval = setInterval(() => {
        start += 1;
        if (start >= target) {
          setRunningScore(matchResult.totalScore * ((scanStep + 1) / 6)); // Ensure final calibration matches weights
          clearInterval(interval);
        } else {
          setRunningScore(Math.round(start));
        }
      }, Math.max(stepTime, 15));

      setScanStep(prev => prev + 1);
    }, 1500);

    return () => clearTimeout(timer);
  }, [scanStep, matchResult]);

  const startSequence = () => {
    if (!matchResult) return;
    setScanStep(0);
    setRunningScore(0);
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'soul_aligned': return 'from-purple-500 to-pink-500 text-purple-300';
      case 'high_spark': return 'from-pink-500 to-amber-500 text-pink-300';
      case 'moderate': return 'from-blue-500 to-cyan-500 text-blue-300';
      case 'low': return 'from-slate-600 to-zinc-500 text-slate-400';
      default: return 'from-red-500 to-rose-700 text-red-400';
    }
  };

  return (
    <div className="relative w-full min-h-[600px] flex flex-col justify-between p-6 bg-black/40 border border-white/5 rounded-[2.5rem] overflow-hidden backdrop-blur-2xl">
      {/* Dynamic Background Grid Lines */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      {/* Glow Effects */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-accent/10 blur-[120px] rounded-full pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between border-b border-white/5 pb-4">
        <div>
          <span className="text-[9px] font-black tracking-[0.2em] text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20 uppercase">
            Match Decryption Protocol
          </span>
          <h2 className="text-xl font-black tracking-tighter mt-2 text-white flex items-center gap-2 uppercase">
            <Lock className="w-5 h-5 text-primary" /> Compatibility Lock
          </h2>
        </div>
        
        <button 
          onClick={() => setShowSandbox(!showSandbox)}
          className="text-[9px] font-black text-white/40 hover:text-white uppercase tracking-widest bg-white/5 px-3 py-1.5 rounded-xl border border-white/10 transition"
        >
          {showSandbox ? 'Hide Sandbox' : 'Show Sandbox'}
        </button>
      </div>

      {/* Main Connection Pods */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-8 items-center py-10 my-auto">
        {/* User Card */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex flex-col items-center p-5 rounded-3xl bg-white/2 border border-white/5 backdrop-blur-md relative"
        >
          <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-primary mb-3">
            <img src={currentUser.origins ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80' : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&q=80'} className="w-full h-full object-cover" />
          </div>
          <p className="text-xs font-black uppercase tracking-widest text-white/80">You</p>
          <span className="text-[9px] text-primary font-black uppercase tracking-widest bg-primary/10 px-2 py-0.5 rounded border border-primary/20 mt-1">
            {currentUser.archetype || 'Caregiver'}
          </span>
        </motion.div>

        {/* Center Scanner / Score */}
        <div className="flex flex-col items-center justify-center py-6 md:py-0 relative min-h-[200px]">
          {/* Laser Scanner Rays */}
          {scanStep >= 0 && scanStep < 6 && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <motion.div 
                animate={{ 
                  scale: [1, 1.2, 1], 
                  opacity: [0.3, 0.8, 0.3],
                  rotate: 360
                }}
                transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
                className="absolute w-48 h-48 border border-dashed border-primary/30 rounded-full"
              />
              <motion.div 
                animate={{ 
                  scale: [0.8, 1.3, 0.8], 
                  opacity: [0.2, 0.6, 0.2] 
                }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                className="absolute w-36 h-36 bg-gradient-to-r from-primary/10 to-accent/10 rounded-full blur-xl"
              />
            </div>
          )}

          {/* Central Circular Gauge */}
          <div className="relative w-40 h-40 rounded-full bg-black/40 border border-white/10 flex flex-col items-center justify-center shadow-2xl relative z-10">
            {/* Circle Progress SVG */}
            <svg className="absolute inset-0 w-full h-full -rotate-90">
              <circle 
                cx="80" 
                cy="80" 
                r="74" 
                className="stroke-white/5 fill-none" 
                strokeWidth="6" 
              />
              <motion.circle 
                cx="80" 
                cy="80" 
                r="74" 
                className="stroke-primary fill-none shadow-[0_0_20px_rgba(255,0,127,0.5)]" 
                strokeWidth="6" 
                strokeDasharray={465}
                strokeDashoffset={465 - (465 * (scanStep === 7 ? 0 : scanStep >= 0 ? runningScore : 0)) / 100}
                transition={{ ease: "easeOut", duration: 0.5 }}
              />
            </svg>

            {scanStep === -1 && (
              <button 
                onClick={startSequence}
                className="flex flex-col items-center justify-center group cursor-pointer hover:scale-105 active:scale-95 transition-all w-full h-full rounded-full"
              >
                <Lock className="w-8 h-8 text-primary mb-1 group-hover:animate-pulse" />
                <span className="text-[10px] font-black text-white/60 tracking-widest uppercase">Decrypt</span>
              </button>
            )}

            {scanStep >= 0 && scanStep < 6 && (
              <div className="text-center">
                <span className="text-[8px] font-black tracking-[0.2em] text-white/40 uppercase">Scrutinizing</span>
                <h3 className="text-4xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white to-primary mt-1">
                  {Math.round(runningScore)}%
                </h3>
              </div>
            )}

            {scanStep === 6 && matchResult && (
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-center"
              >
                <Unlock className="w-7 h-7 text-green-400 mx-auto mb-1 animate-bounce" />
                <h3 className="text-3xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-500">
                  {matchResult.totalScore}%
                </h3>
                <span className="text-[7px] font-black uppercase tracking-widest text-green-400 block mt-1 px-2 py-0.5 bg-green-500/10 rounded-full border border-green-500/20 max-w-[120px] mx-auto truncate">
                  {matchResult.compatibilityTier.replace('_', ' ')}
                </span>
              </motion.div>
            )}

            {scanStep === 7 && matchResult && (
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-center px-4"
              >
                <ShieldAlert className="w-8 h-8 text-red-500 mx-auto mb-1" />
                <span className="text-[8px] font-black tracking-widest text-red-500 uppercase">Blocked</span>
                <p className="text-[7px] text-white/50 font-bold uppercase tracking-tight leading-tight mt-1 truncate">
                  {matchResult.hardBlockerHit}
                </p>
              </motion.div>
            )}
          </div>
        </div>

        {/* Candidate Profile Card */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex flex-col items-center p-5 rounded-3xl bg-white/2 border border-white/5 backdrop-blur-md relative"
        >
          <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-accent mb-3">
            <img src={candidateProfile.avatar} className="w-full h-full object-cover" />
          </div>
          <p className="text-xs font-black uppercase tracking-widest text-white/80">{candidateProfile.name}</p>
          <span className="text-[9px] text-accent font-black uppercase tracking-widest bg-accent/10 px-2 py-0.5 rounded border border-accent/20 mt-1">
            {candidateProfile.archetype || 'Dreamer'}
          </span>
        </motion.div>
      </div>

      {/* Signal Status Details Grid */}
      <div className="relative z-10 w-full bg-black/40 border border-white/5 rounded-3xl p-4 min-h-[160px] flex flex-col justify-center">
        {scanStep === -1 && (
          <div className="text-center py-6">
            <p className="text-xs font-black uppercase tracking-[0.15em] text-white/50 mb-2">
              Ready to verify session compatibility
            </p>
            <p className="text-[10px] text-white/30 uppercase tracking-wider leading-relaxed">
              Press the Decrypt core button above to initiate the 6-signal handshake.
            </p>
          </div>
        )}

        {scanStep >= 0 && scanStep <= 6 && (
          <div className="space-y-3">
            <div className="flex justify-between items-center border-b border-white/5 pb-2 mb-2">
              <span className="text-[9px] font-black uppercase tracking-widest text-white/40">
                Verification Progress ({Math.min(scanStep, 5) + 1}/6)
              </span>
              <span className="text-[9px] font-black uppercase tracking-widest text-primary">
                {scanStep === 6 ? 'Calibrated' : 'Evaluating...'}
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {SIGNALS_METADATA.map((sig, idx) => {
                const isChecking = scanStep === idx;
                const isPassed = scanStep > idx;
                const val = matchResult ? matchResult.breakdown[sig.key] : 0;
                
                return (
                  <div 
                    key={sig.key} 
                    className={`p-2.5 rounded-xl border transition-all ${
                      isChecking 
                        ? 'bg-primary/5 border-primary shadow-[0_0_10px_rgba(255,0,127,0.15)] scale-102' 
                        : isPassed 
                          ? 'bg-white/2 border-white/10 opacity-100' 
                          : 'bg-transparent border-white/5 opacity-30'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <sig.icon className={`w-3.5 h-3.5 ${sig.color} ${isChecking ? 'animate-spin' : ''}`} />
                      <span className="text-[9px] font-black uppercase tracking-wider text-white/80 truncate">
                        {sig.label}
                      </span>
                    </div>
                    {isPassed && (
                      <p className="text-[9px] font-black text-white/40 uppercase tracking-tighter mt-1">
                        Score: <span className="text-white">{Math.round(val * 100)}%</span>
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {scanStep === 7 && matchResult && (
          <div className="flex items-center gap-4 bg-red-950/20 border border-red-500/20 p-4 rounded-2xl text-left">
            <AlertCircle className="w-8 h-8 text-red-500 shrink-0" />
            <div>
              <h4 className="text-xs font-black text-red-500 uppercase tracking-widest">
                Verification Terminated — Blocked Match
              </h4>
              <p className="text-[10px] text-white/60 uppercase font-black tracking-wide leading-relaxed mt-1">
                {matchResult.tierReason}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Primary Actions */}
      <div className="relative z-10 mt-6 flex justify-center">
        <AnimatePresence mode="wait">
          {scanStep === 6 && matchResult && (
            <motion.button 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              onClick={onUnlocked}
              className="px-8 py-4 bg-gradient-to-r from-primary to-accent text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] shadow-[0_15px_40px_rgba(255,0,127,0.3)] hover:scale-105 active:scale-95 transition-all"
            >
              Decrypt & Enter Stream
            </motion.button>
          )}

          {scanStep === 7 && (
            <motion.button 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              onClick={startSequence}
              className="px-8 py-4 bg-white/5 border border-white/10 text-white/60 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-white/10 transition-all flex items-center gap-2"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Re-Calibrate Match
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Sandbox Panel */}
      <AnimatePresence>
        {showSandbox && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="relative z-10 border-t border-white/5 pt-4 mt-6 text-left"
          >
            <h4 className="text-[9px] font-black text-primary uppercase tracking-[0.2em] mb-3">
              Sandbox Reviewer Panel (Toggle Candidate to inspect Match-Gate outcomes)
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {candidatesList.map(cand => {
                const isActive = candidateProfile.id === cand.id;
                const matchVal = calculateMatch(currentUser, cand);
                
                return (
                  <button 
                    key={cand.id}
                    onClick={() => onSelectCandidate(cand.id)}
                    className={`p-2.5 rounded-2xl border text-left flex flex-col justify-between transition-all duration-300 ${
                      isActive 
                        ? 'bg-primary/10 border-primary shadow-lg shadow-primary/5' 
                        : 'bg-white/2 border-white/5 hover:bg-white/5 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <img src={cand.avatar} className="w-6 h-6 rounded-full object-cover border border-white/10" />
                      <span className="text-[10px] font-black uppercase tracking-wider text-white truncate max-w-[80px]">
                        {cand.name}
                      </span>
                    </div>
                    <div className="mt-2 flex justify-between items-center">
                      <span className="text-[8px] font-black text-white/40 uppercase tracking-tighter">
                        Tier: {matchVal.compatibilityTier.replace('_', ' ')}
                      </span>
                      <span className={`text-[9px] font-black ${matchVal.totalScore > 0 ? 'text-primary' : 'text-red-500'}`}>
                        {matchVal.totalScore}%
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
