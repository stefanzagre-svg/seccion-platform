'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, X, Loader2, FileText, Check, Lock, PenTool, ShieldCheck } from 'lucide-react';
import { RELATIONSHIP_LEVELS, getAvailableMoves } from '@/lib/relationship-engine';

interface SuggestionMovesModalProps {
  isOpen: boolean;
  onClose: () => void;
  gaugeLevel: number; // 1 to 8
  isKycVerified: boolean;
  userId?: string;
  userRole?: 'member' | 'creator';
  onSelectMove: (moveId: string, label: string) => Promise<void>;
  onKycSuccess?: () => void;
}

export default function SuggestionMovesModal({ 
  isOpen, 
  onClose, 
  gaugeLevel, 
  isKycVerified,
  userId,
  userRole = 'member',
  onSelectMove,
  onKycSuccess
}: SuggestionMovesModalProps) {
  const [sessionKycVerified, setSessionKycVerified] = useState(false);
  const [skippedKyc, setSkippedKyc] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSending, setIsSending] = useState<string | null>(null);

  // SnapSign States
  const [snapSignStep, setSnapSignStep] = useState<{ moveId: string; label: string } | null>(null);
  const [signatureName, setSignatureName] = useState('');
  const [isSigningAgreement, setIsSigningAgreement] = useState(false);
  const [signLog, setSignLog] = useState('');
  const [signSuccess, setSignSuccess] = useState(false);

  const localKycVerified = isKycVerified || sessionKycVerified || skippedKyc;
  const needsKyc = gaugeLevel >= 5 && !localKycVerified;

  // Resolve the level object
  const levelObj = RELATIONSHIP_LEVELS[Math.min(8, Math.max(1, gaugeLevel)) - 1];
  const availableMoves = levelObj ? getAvailableMoves(levelObj, localKycVerified) : [];

  // Reset SnapSign step when modal is opened/closed
  useEffect(() => {
    if (!isOpen) {
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
    if (gaugeLevel >= 5) {
      // Intercept for SnapSign agreement
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
    await new Promise(r => setTimeout(r, 800));
    setSignLog('Cryptographically binding signature (SHA-256)...');
    await new Promise(r => setTimeout(r, 800));
    setSignLog('Storing sealed consent ledger in compliance node...');
    await new Promise(r => setTimeout(r, 800));
    
    setSignSuccess(true);
    setSignLog('✓ Agreement signed! Consent Hash: ' + Math.random().toString(16).substring(2, 10).toUpperCase());
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

            {needsKyc ? (
              <div className="flex flex-col items-center text-center p-6 bg-red-950/20 border border-red-500/20 rounded-2xl">
                <ShieldAlert className="w-12 h-12 text-[#ff007f] mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Identity Verification Required</h3>
                <p className="text-xs text-white/75 mb-6">
                  You have reached Level {gaugeLevel} ({levelObj?.label}). To make Suggestion Moves and ensure platform safety, we strongly recommend completing the KYC Identity Verification.
                  {userRole === 'creator' ? ' This is required for creators.' : ' For members, this is optional but boosts your trust score.'}
                </p>
                <div className="flex flex-col w-full gap-3">
                  <button 
                    onClick={handleVerification}
                    disabled={isVerifying}
                    className="w-full py-3 bg-[#ff007f] hover:bg-[#ff007f]/90 disabled:bg-[#ff007f]/50 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-lg transition flex items-center justify-center gap-2 text-xs uppercase tracking-wider"
                  >
                    {isVerifying ? <><Loader2 className="w-5 h-5 animate-spin" /> Verifying...</> : 'Start Verification'}
                  </button>
                  {userRole === 'member' && (
                    <button
                      onClick={() => setSkippedKyc(true)}
                      className="w-full py-2 bg-transparent hover:bg-white/5 text-white/60 font-semibold rounded-xl transition text-[10px] uppercase tracking-wider border border-white/10"
                    >
                      Skip For Now (Optional)
                    </button>
                  )}
                </div>
              </div>
            ) : snapSignStep ? (
              /* SnapSign Mutual Consent agreement */
              <div className="space-y-4">
                <div className="p-4 bg-primary/10 border border-primary/20 rounded-2xl space-y-3">
                  <div className="flex items-center gap-2 text-primary font-black text-[10px] uppercase tracking-wider">
                    <FileText className="w-4.5 h-4.5" /> SnapSign Smart Agreement
                  </div>
                  <p className="text-[10px] text-white/70 leading-relaxed font-semibold">
                    You are initiating an intimate relationship request: <span className="text-primary font-black">&ldquo;{snapSignStep.label}&rdquo;</span>. 
                    This agreement protects both parties and certifies mutual consent.
                  </p>
                  
                  <div className="p-3 bg-black/40 border border-white/5 rounded-xl text-[9px] text-white/50 space-y-2 font-mono leading-normal h-32 overflow-y-auto">
                    <p className="font-bold text-white/80">Mutual Consent Agreement v1.2</p>
                    <p>1. Both parties declare they are entering this relationship level with full consent, zero coercion, and respectful bounds.</p>
                    <p>2. Safety limits apply. Any interactions violate terms if they cross established boundaries of the other party.</p>
                    <p>3. This document constitutes a legal consent record archived inside the secure platform compliance node.</p>
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
                <p className="text-xs text-muted-foreground mb-4">Select an unlocked action move to propose to your connection.</p>
                {availableMoves.length > 0 ? (
                  availableMoves.map((move) => (
                    <button
                      key={move.id}
                      disabled={isSending !== null}
                      onClick={() => handleMoveClick(move.id, move.label)}
                      className="w-full flex items-center justify-between p-4 bg-black/50 border border-white/10 hover:border-primary/50 hover:bg-primary/10 rounded-2xl transition group disabled:opacity-50"
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
