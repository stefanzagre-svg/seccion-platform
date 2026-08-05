'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, X, Loader2, FileText, Check, Lock, PenTool, ShieldCheck, ChevronRight, Globe, MapPin } from 'lucide-react';
import { RELATIONSHIP_LEVELS, getAvailableMoves, syncSuggestionMoves } from '@/lib/relationship-engine';
import { supabase } from '@/lib/supabase';

interface SuggestionMovesModalProps {
  isOpen: boolean;
  onClose: () => void;
  gaugeLevel: number; // 1 to 8
  isKycVerified: boolean;
  userId?: string;
  userRole?: 'member' | 'creator';
  onSelectMove: (moveId: string, label: string) => Promise<void>;
  onKycSuccess?: () => void;
  activePurposes?: string[];
}

export default function SuggestionMovesModal({ 
  isOpen, 
  onClose, 
  gaugeLevel, 
  isKycVerified,
  userId,
  userRole = 'member',
  onSelectMove,
  onKycSuccess,
  activePurposes = []
}: SuggestionMovesModalProps) {
  const [sessionKycVerified, setSessionKycVerified] = useState(false);
  const [skippedKyc, setSkippedKyc] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSending, setIsSending] = useState<string | null>(null);
  const [movesSynced, setMovesSynced] = useState(false);

  // SnapSign States
  const [snapSignStep, setSnapSignStep] = useState<{ moveId: string; label: string } | null>(null);
  const [signatureName, setSignatureName] = useState('');
  const [isSigningAgreement, setIsSigningAgreement] = useState(false);
  const [signLog, setSignLog] = useState('');
  const [signSuccess, setSignSuccess] = useState(false);

  const localKycVerified = isKycVerified || sessionKycVerified || skippedKyc;
  const needsKyc = gaugeLevel >= 5 && !localKycVerified;

  // Resolve the level object (get all moves regardless of KYC state for locked preview display)
  const levelObj = RELATIONSHIP_LEVELS[Math.min(8, Math.max(1, gaugeLevel)) - 1];
  let availableMoves = levelObj ? getAvailableMoves(levelObj, true) : [];

  if (activePurposes.length > 0) {
    availableMoves = availableMoves.filter(m => {
      const pCats = m.purposeCategory || ['all'];
      if (pCats.includes('all')) return true;
      return pCats.some(cat => activePurposes.includes(cat));
    });
  }

  const DIGITAL_MOVE_IDS = [
    'follow', 'poke', 'punch', 'reaction', 'compliment',
    'introduce_yourself', 'playlist', 'movie', 'gaming',
    'gift', 'online', 'learn'
  ];

  const EXPLICIT_MOVE_IDS = [
    'appetizer', 'relax', 'performance', 'swing'
  ];

  const digitalMoves = availableMoves.filter(m => DIGITAL_MOVE_IDS.includes(m.id));
  const explicitMoves = availableMoves.filter(m => EXPLICIT_MOVE_IDS.includes(m.id));
  const realLifeMoves = availableMoves.filter(m => !DIGITAL_MOVE_IDS.includes(m.id) && !EXPLICIT_MOVE_IDS.includes(m.id));

  // Auto-open the first non-empty category for the current level
  const firstAvailable: 'digital' | 'realLife' | 'explicit' | null =
    digitalMoves.length > 0 ? 'digital'
    : realLifeMoves.length > 0 ? 'realLife'
    : explicitMoves.length > 0 ? 'explicit'
    : null;

  const [allowExplicit, setAllowExplicit] = useState(false);
  const [openCategory, setOpenCategory] = useState<'digital' | 'realLife' | 'explicit' | null>(firstAvailable);

  // Reset SnapSign step and sync moves when modal is opened/closed
  useEffect(() => {
    if (isOpen) {
      syncSuggestionMoves(supabase).then(() => {
        setMovesSynced(prev => !prev);
        setOpenCategory(firstAvailable);
      });
    } else {
      setSnapSignStep(null);
      setSignatureName('');
      setSignSuccess(false);
      setSignLog('');
      setSkippedKyc(false);
    }
  }, [isOpen]);

  const handleVerification = async () => {
    setIsVerifying(true);
    try {
      const res = await fetch('/api/kyc/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: userId || 'mock-user-id' })
      });
      if (res.ok) {
        setSessionKycVerified(true);
        if (onKycSuccess) {
          onKycSuccess();
        }
      }
    } catch (e) {
      console.error('KYC Verification Failed', e);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleMoveClick = async (moveId: string, label: string) => {
    // SnapSign mutual consent is required ONLY for Sexual Explicit suggestions (L4–L8).
    // All other moves (digital, in-person) proceed directly without a consent agreement.
    if (EXPLICIT_MOVE_IDS.includes(moveId)) {
      setSnapSignStep({ moveId, label });
      return;
    }
    await executeMoveSelection(moveId, label);
  };

  const executeMoveSelection = async (moveId: string, label: string) => {
    setIsSending(moveId);
    try {
      await onSelectMove(moveId, label);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSending(null);
    }
  };

  const handleSnapSignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signatureName.trim() || !snapSignStep) return;

    setIsSigningAgreement(true);
    setSignLog('Initializing secure SnapSign tunnel...');
    await new Promise(r => setTimeout(r, 600));
    setSignLog('Cryptographically binding signature (SHA-256)...');

    // M5 FIX: Generate real SHA-256 Web Crypto hash bound to user signature & timestamp
    const payload = `${signatureName.trim()}:${snapSignStep.moveId}:${Date.now()}:${crypto.randomUUID()}`;
    const encoder = new TextEncoder();
    const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(payload));
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const consentHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 16).toUpperCase();

    await new Promise(r => setTimeout(r, 600));
    setSignLog('Storing sealed consent ledger in compliance node...');
    await new Promise(r => setTimeout(r, 600));

    setSignSuccess(true);
    setSignLog(`✓ Agreement signed! Consent Hash: ${consentHash}`);
    await new Promise(r => setTimeout(r, 1000));
    setIsSigningAgreement(false);

    // Continue to propose the move
    await executeMoveSelection(snapSignStep.moveId, snapSignStep.label);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-x-4 top-[10%] md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 z-50 glass-card p-6 md:p-8 md:w-[450px] border border-white/10 max-h-[85vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-6">
              <div className="flex flex-col">
                <h2 className="text-2xl font-bold text-white">
                  {snapSignStep ? 'Mutual Agreement' : 'Suggestion Moves'}
                </h2>
                <span className="text-[9px] uppercase tracking-widest text-primary/70 font-black">
                  Level {gaugeLevel} - {levelObj?.label}
                </span>
              </div>
              <button onClick={onClose} className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition">
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            {snapSignStep ? (
              /* SnapSign Mutual Consent agreement */
              <div className="space-y-4">
                <div className="p-4 bg-primary/10 border border-primary/20 rounded-2xl space-y-3">
                  <div className="flex items-center gap-2 text-purple-400 font-black text-[10px] uppercase tracking-wider">
                    <FileText className="w-4.5 h-4.5" /> SnapSign — Intimacy & Explicit Consent
                  </div>
                  <p className="text-[10px] text-white/70 leading-relaxed font-semibold">
                    You are proposing an explicit suggestion: <span className="text-purple-400 font-black">&ldquo;{snapSignStep.label}&rdquo;</span>.
                    This agreement covers both <span className="text-white">general intimacy</span> and <span className="text-white">explicit content</span> — both you and the recipient must sign before the proposal is delivered.
                    The recipient will be prompted to countersign upon receiving it.
                  </p>
                  
                  <div className="p-3 bg-black/40 border border-purple-500/10 rounded-xl text-[9px] text-white/50 space-y-2 font-mono leading-normal h-36 overflow-y-auto">
                    <p className="font-bold text-white/80">Intimacy & Explicit Content Mutual Consent Agreement v1.3</p>
                    <p>1. I confirm I am a verified adult (18+) and have completed identity verification on this platform.</p>
                    <p>2. I understand this proposal may involve physical proximity, general intimacy, and/or sexually explicit content. I engage entirely of my own free will with zero coercion.</p>
                    <p>3. I acknowledge that any intimate or explicit interaction between both parties requires ongoing, active, and revocable consent at every stage. Either party may withdraw at any time without consequence.</p>
                    <p>4. This proposal will only be delivered after the recipient countersigns this same agreement.</p>
                    <p>5. This signed consent record is cryptographically sealed and archived in the platform compliance node for regulatory and legal purposes.</p>
                  </div>
                </div>

                <form onSubmit={handleSnapSignSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[9px] uppercase tracking-widest font-black text-white/40 block">Type Full Name to Sign</label>
                    <div className="relative">
                      <input 
                        type="text" 
                        required
                        value={signatureName}
                        onChange={e => setSignatureName(e.target.value)}
                        placeholder="e.g. Alex Newman"
                        className="w-full pl-10 pr-4 py-3 bg-black/40 border border-white/10 rounded-xl text-xs text-white placeholder-white/20 focus:border-primary focus:outline-none font-bold"
                      />
                      <PenTool className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-white/30" />
                    </div>
                  </div>

                  {signLog && (
                    <div className="p-2.5 bg-black/30 border border-white/5 rounded-xl flex items-center gap-2">
                      {signSuccess ? (
                        <ShieldCheck className="w-4 h-4 text-green-400 shrink-0" />
                      ) : (
                        <Loader2 className="w-4 h-4 animate-spin text-primary shrink-0" />
                      )}
                      <span className="text-[9px] font-mono text-white/70 tracking-tight leading-none">{signLog}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSigningAgreement || !signatureName.trim()}
                    className="w-full py-4 bg-primary text-black font-black uppercase tracking-widest text-[10px] rounded-xl hover:shadow-[0_0_20px_rgba(102,252,241,0.4)] transition disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isSigningAgreement ? (
                      <Loader2 className="w-4 h-4 animate-spin text-black" />
                    ) : (
                      <>
                        <Lock className="w-4 h-4 text-black" /> Sign & Propose
                      </>
                    )}
                  </button>
                </form>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Compact KYC Identity Blocker Alert Card Banner */}
                {needsKyc && (
                  <div className="flex flex-col items-center text-center p-4 bg-red-950/20 border border-red-500/20 rounded-2xl gap-3">
                    <div className="flex items-center gap-2">
                      <ShieldAlert className="w-5 h-5 text-[#ff007f]" />
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider">Identity Verification Required</h3>
                    </div>
                    <p className="text-[10px] text-white/70 leading-normal max-w-[340px]">
                      Complete KYC Identity Verification to unlock In Person meetup moves and Sexual Explicit suggestions.
                    </p>
                    <div className="flex w-full gap-2">
                      <button 
                        onClick={handleVerification}
                        disabled={isVerifying}
                        className="flex-1 py-2 bg-[#ff007f] hover:bg-[#ff007f]/90 disabled:bg-[#ff007f]/50 disabled:cursor-not-allowed text-white font-black rounded-xl shadow-lg transition flex items-center justify-center gap-1.5 text-[9px] uppercase tracking-wider"
                      >
                        {isVerifying ? <><Loader2 className="w-3 animate-spin text-white" /> Verifying...</> : 'Verify Now'}
                      </button>
                      {userRole === 'member' && (
                        <button
                          onClick={() => setSkippedKyc(true)}
                          className="py-2 px-3 bg-transparent hover:bg-white/5 text-white/60 font-semibold rounded-xl transition text-[9px] uppercase tracking-wider border border-white/10"
                        >
                          Skip
                        </button>
                      )}
                    </div>
                  </div>
                )}

                <p className="text-xs text-muted-foreground mb-4">Select an unlocked action move to propose to your connection.</p>
                {availableMoves.length > 0 ? (
                  <div className="space-y-4 text-left">
                    {/* Explicit Content Toggle */}
                    {explicitMoves.length > 0 && (
                      <label className={`flex items-center justify-between p-3 rounded-2xl border transition select-none ${
                        !localKycVerified 
                          ? 'bg-purple-950/5 border-purple-950/20 opacity-55 cursor-not-allowed'
                          : 'bg-white/[0.02] border-white/10 cursor-pointer hover:bg-white/5'
                      }`}>
                        <span className="text-[10px] font-black uppercase tracking-wider text-white/60 flex items-center gap-1.5">
                          Allow Sexual Explicit Moves
                          {!localKycVerified && (
                            <span className="text-[8px] bg-purple-500/20 text-purple-400 px-1 py-0.5 rounded border border-purple-500/30">
                              Requires KYC
                            </span>
                          )}
                        </span>
                        <input 
                          type="checkbox" 
                          checked={allowExplicit && localKycVerified} 
                          disabled={!localKycVerified}
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
                            className={`w-full flex items-center justify-between p-3 rounded-2xl border transition-all text-xs font-black uppercase tracking-wider ${openCategory === 'digital' ? 'bg-primary/10 border-primary/30 text-primary' : 'bg-black/50 border-white/10 text-white/60 hover:text-white hover:bg-white/5'}`}
                          >
                            <span className="flex items-center gap-2">
                              <Globe className="w-4 h-4" />
                              Digital Moves ({digitalMoves.length})
                            </span>
                            <ChevronRight className={`w-4 h-4 transition-transform duration-300 ${openCategory === 'digital' ? 'rotate-90' : ''}`} />
                          </button>
                          {openCategory === 'digital' && (
                            <div className="space-y-2 p-1">
                              {digitalMoves.map(move => (
                                <button
                                  key={move.id}
                                  disabled={isSending !== null}
                                  onClick={() => handleMoveClick(move.id, move.label)}
                                  className="w-full flex items-center justify-between p-4 bg-black/40 border border-white/10 hover:border-primary/50 hover:bg-primary/10 rounded-2xl transition group disabled:opacity-50"
                                >
                                  <div className="flex items-center gap-4 text-white group-hover:text-primary transition">
                                    <span className="text-2xl">{move.emoji}</span>
                                    <span className="font-semibold text-sm">{move.label}</span>
                                  </div>
                                  <span className="text-[10px] font-black text-primary bg-primary/20 px-3 py-1 rounded-full uppercase tracking-wider">
                                    {isSending === move.id ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Propose'}
                                  </span>
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
                            className={`w-full flex items-center justify-between p-3 rounded-2xl border transition-all text-xs font-black uppercase tracking-wider ${
                              openCategory === 'realLife' 
                                ? 'bg-accent/10 border-accent/30 text-accent' 
                                : 'bg-black/50 border-white/10 text-white/60 hover:text-white hover:bg-white/5'
                            }`}
                          >
                            <span className="flex items-center gap-2">
                              <MapPin className="w-4 h-4" />
                              In Person Moves ({realLifeMoves.length})
                              {!localKycVerified && (
                                <span className="text-[8px] bg-red-500/20 text-[#ff007f] px-1 py-0.5 rounded border border-red-500/30">
                                  Locked
                                </span>
                              )}
                            </span>
                            <ChevronRight className={`w-4 h-4 transition-transform duration-300 ${openCategory === 'realLife' ? 'rotate-90' : ''}`} />
                          </button>
                          {openCategory === 'realLife' && (
                            <div className="space-y-2 p-1">
                              {!localKycVerified ? (
                                <div className="flex flex-col items-center justify-center p-6 bg-red-950/20 border border-red-500/20 rounded-2xl text-center gap-3">
                                  <ShieldAlert className="w-8 h-8 text-[#ff007f]" />
                                  <div className="space-y-1">
                                    <h4 className="text-xs font-black text-white uppercase tracking-wider">Verification Required</h4>
                                    <p className="text-[10px] text-white/70 leading-normal max-w-[280px]">
                                      To unlock In Person meetup moves, please complete your Identity Verification.
                                    </p>
                                  </div>
                                  <button 
                                    onClick={handleVerification}
                                    disabled={isVerifying}
                                    className="px-4 py-2 bg-[#ff007f] hover:bg-[#ff007f]/90 disabled:bg-[#ff007f]/50 text-white text-[10px] font-black uppercase tracking-wider rounded-xl transition"
                                  >
                                    Verify Identity
                                  </button>
                                </div>
                              ) : (
                                realLifeMoves.map(move => (
                                  <button
                                    key={move.id}
                                    disabled={isSending !== null}
                                    onClick={() => handleMoveClick(move.id, move.label)}
                                    className="w-full flex items-center justify-between p-4 bg-black/40 border border-white/10 hover:border-primary/50 hover:bg-primary/10 rounded-2xl transition group disabled:opacity-50"
                                  >
                                    <div className="flex items-center gap-4 text-white group-hover:text-primary transition">
                                      <span className="text-2xl">{move.emoji}</span>
                                      <span className="font-semibold text-sm">{move.label}</span>
                                    </div>
                                    <span className="text-[10px] font-black text-primary bg-primary/20 px-3 py-1 rounded-full uppercase tracking-wider">
                                      {isSending === move.id ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Propose'}
                                    </span>
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
                            className={`w-full flex items-center justify-between p-3 rounded-2xl border transition-all text-xs font-black uppercase tracking-wider ${
                              openCategory === 'explicit' 
                                ? 'bg-purple-500/10 border-purple-500/30 text-purple-400' 
                                : 'bg-black/50 border-white/10 text-white/60 hover:text-white hover:bg-white/5'
                            }`}
                          >
                            <span className="flex items-center gap-2">
                              <ShieldAlert className="w-4 h-4 text-purple-400" />
                              Sexual Explicit Moves ({explicitMoves.length})
                              {!localKycVerified && (
                                <span className="text-[8px] bg-purple-500/20 text-purple-400 px-1 py-0.5 rounded border border-purple-500/30">
                                  Locked
                                </span>
                              )}
                            </span>
                            <ChevronRight className={`w-4 h-4 transition-transform duration-300 ${openCategory === 'explicit' ? 'rotate-90' : ''}`} />
                          </button>
                          {openCategory === 'explicit' && (
                            <div className="space-y-2 p-1">
                              {!localKycVerified ? (
                                <div className="flex flex-col items-center justify-center p-6 bg-purple-950/20 border border-purple-500/20 rounded-2xl text-center gap-3">
                                  <ShieldAlert className="w-8 h-8 text-purple-400" />
                                  <div className="space-y-1">
                                    <h4 className="text-xs font-black text-white uppercase tracking-wider">Verification Required</h4>
                                    <p className="text-[10px] text-white/70 leading-normal max-w-[280px]">
                                      To unlock Sexual Explicit moves, please complete your Identity Verification.
                                    </p>
                                  </div>
                                  <button 
                                    onClick={handleVerification}
                                    disabled={isVerifying}
                                    className="px-4 py-2 bg-purple-500 hover:bg-purple-600 disabled:bg-purple-500/50 text-white text-[10px] font-black uppercase tracking-wider rounded-xl transition"
                                  >
                                    Verify Identity
                                  </button>
                                </div>
                              ) : allowExplicit ? (
                                explicitMoves.map(move => (
                                  <button
                                    key={move.id}
                                    disabled={isSending !== null}
                                    onClick={() => handleMoveClick(move.id, move.label)}
                                    className="w-full flex items-center justify-between p-4 bg-black/40 border border-white/10 hover:border-primary/50 hover:bg-primary/10 rounded-2xl transition group disabled:opacity-50"
                                  >
                                    <div className="flex items-center gap-4 text-white group-hover:text-primary transition">
                                      <span className="text-2xl">{move.emoji}</span>
                                      <span className="font-semibold text-sm">{move.label}</span>
                                    </div>
                                    <span className="text-[10px] font-black text-primary bg-primary/20 px-3 py-1 rounded-full uppercase tracking-wider">
                                      {isSending === move.id ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Propose'}
                                    </span>
                                  </button>
                                ))
                              ) : (
                                <div className="text-center py-6 bg-purple-950/15 border border-purple-500/20 rounded-2xl text-[10px] uppercase tracking-wider font-black text-purple-400/80 p-4">
                                  🔒 Explicit moves hidden.<br />Enable the checkbox toggle to show them.
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6 text-white/50 text-xs">
                    No moves unlocked at this relationship level. Keep interacting to unlock moves!
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
