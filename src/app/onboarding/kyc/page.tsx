"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import {
  Loader2, AlertCircle, ShieldCheck, CheckCircle2, Sparkles, RefreshCw, ArrowRight,
} from 'lucide-react';
import { DiditVerifyButton } from '@/components/kyc/DiditVerifyButton';

export default function CreatorKycPage() {
  const router = useRouter();

  const [userId, setUserId] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<{ role?: string | null; is_kyc_verified?: boolean | null } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [sessionDone, setSessionDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'kyc-form' | 'pending' | 'success'>('kyc-form');

  const fetchVerificationStatus = useCallback(async (uid: string, returningFromDidit = false) => {
    const { data: profile, error: profError } = await supabase
      .from('profiles')
      .select('role, is_kyc_verified')
      .eq('id', uid)
      .maybeSingle();

    if (profError) {
      throw profError;
    }

    if (profile) {
      setUserProfile(profile);
      if (profile.is_kyc_verified) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('is_creator_signup');
        }
        setStep('success');
        return true;
      }
    }

    if (returningFromDidit) {
      setStep('pending');
    }
    return false;
  }, []);

  useEffect(() => {
    async function checkAuth() {
      try {
        const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
        const done = params?.get('session_done') === 'true';
        setSessionDone(done);

        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
          router.push('/login');
          return;
        }

        setUserId(session.user.id);
        await fetchVerificationStatus(session.user.id, done);
      } catch (err) {
        console.error('Auth/KYC status check failed:', err);
        setError('Unable to check your verification status. Please refresh or log in again.');
      } finally {
        setIsLoading(false);
      }
    }

    checkAuth();
  }, [fetchVerificationStatus, router]);

  // Poll briefly when user returns from DIDIT while webhook finishes processing
  useEffect(() => {
    if (step !== 'pending' || !userId) return;
    let attempts = 0;
    const interval = setInterval(async () => {
      attempts += 1;
      try {
        const verified = await fetchVerificationStatus(userId, true);
        if (verified || attempts >= 8) {
          clearInterval(interval);
        }
      } catch {
        clearInterval(interval);
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [step, userId, fetchVerificationStatus]);

  const handleManualStatusRefresh = async () => {
    if (!userId) return;
    setIsCheckingStatus(true);
    setError(null);
    try {
      const verified = await fetchVerificationStatus(userId, true);
      if (!verified) {
        setError('Verification is still being finalized by DIDIT. Please check again in a few seconds.');
      }
    } catch {
      setError('Could not refresh verification status. Please try again.');
    } finally {
      setIsCheckingStatus(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0A0A0C] text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
          <p className="text-xs font-mono uppercase tracking-[0.2em] text-white/50">
            Initializing Secure Portal...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0C] text-white flex flex-col relative overflow-hidden py-16 px-4">
      <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-[#00fbfb]/5 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-purple-500/5 blur-[150px] rounded-full pointer-events-none" />

      <div className="flex-1 w-full max-w-2xl mx-auto relative z-10 flex flex-col justify-center">
        <AnimatePresence mode="wait">
          {step === 'kyc-form' && (
            <motion.div
              key="kyc-form"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -24 }}
              className="space-y-8"
            >
              <div className="text-center space-y-3">
                <div className="inline-flex p-3 bg-[#00fbfb]/10 border border-[#00fbfb]/20 rounded-2xl text-primary mb-2 shadow-[0_0_20px_rgba(0,251,251,0.2)]">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <h1 className="text-4xl font-black tracking-tighter uppercase text-glow">
                  Identity & 18+ Verification
                </h1>
                <p className="text-sm text-white/50 font-bold uppercase tracking-wider max-w-lg mx-auto leading-relaxed">
                  Complete zero-knowledge biometric ID & liveness verification via DIDIT to unlock Creator Studio & compliance features.
                </p>
              </div>

              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold rounded-2xl flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="relative p-8 rounded-3xl border border-[#00fbfb]/30 bg-gradient-to-br from-[#00fbfb]/10 via-purple-500/5 to-transparent shadow-[0_0_40px_rgba(0,251,251,0.15)] space-y-5 overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-[#00fbfb]/20 border border-[#00fbfb]/40 rounded-2xl text-[#00fbfb]">
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="inline-block px-2.5 py-0.5 bg-[#00fbfb]/20 border border-[#00fbfb]/40 text-[9px] font-mono font-black text-[#00fbfb] uppercase tracking-widest rounded-full mb-1">
                        Official Gateway
                      </div>
                      <h2 className="text-lg font-black uppercase tracking-wider text-white">
                        DIDIT™ Zero-Knowledge KYC
                      </h2>
                    </div>
                  </div>

                  <DiditVerifyButton
                    returnTo="/onboarding/kyc?session_done=true"
                    onError={(msg) => setError(msg)}
                    onSuccess={() => {
                      setStep('pending');
                      if (userId) {
                        void fetchVerificationStatus(userId, true);
                      }
                    }}
                  />
                </div>

                <p className="text-xs text-[#b9cac9] leading-relaxed font-sans">
                  Verify your government-issued ID and 3D facial liveness securely in under 60 seconds with our compliance partner <strong>DIDIT</strong>. Your verification status updates automatically once DIDIT confirms your check.
                </p>

                <div className="flex flex-wrap items-center gap-4 text-[10px] font-mono text-white/50 pt-1 border-t border-white/5">
                  <span className="flex items-center gap-1.5 text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Zero-Knowledge Biometrics
                  </span>
                  <span className="flex items-center gap-1.5 text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" /> 220+ Countries Supported
                  </span>
                  <span className="flex items-center gap-1.5 text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" /> 18 U.S.C. § 2257 & DSA Ready
                  </span>
                </div>
              </div>
            </motion.div>
          )}

          {step === 'pending' && (
            <motion.div
              key="pending"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-md mx-auto text-center space-y-6 py-12 px-8 glass-card border border-[#00fbfb]/25 bg-[#00fbfb]/5 rounded-[2.5rem]"
            >
              <div className="inline-flex p-5 bg-[#00fbfb]/10 border border-[#00fbfb]/20 rounded-full text-[#00fbfb]">
                <Loader2 className="w-12 h-12 animate-spin" />
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl font-black uppercase tracking-tight">
                  Confirming Verification
                </h2>
                <p className="text-xs text-white/60 leading-relaxed">
                  {sessionDone
                    ? 'DIDIT submitted your verification. Waiting for cryptographic webhook confirmation...'
                    : 'Your DIDIT session is in progress. Status will unlock automatically once approved.'}
                </p>
              </div>

              {error && (
                <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs rounded-xl">
                  {error}
                </div>
              )}

              <div className="flex flex-col gap-3">
                <button
                  type="button"
                  onClick={handleManualStatusRefresh}
                  disabled={isCheckingStatus}
                  className="w-full py-3.5 bg-[#00fbfb] text-black font-black uppercase tracking-wider rounded-xl text-xs flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${isCheckingStatus ? 'animate-spin' : ''}`} />
                  Check Verification Status
                </button>
                <button
                  type="button"
                  onClick={() => setStep('kyc-form')}
                  className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 font-bold uppercase tracking-wider rounded-xl text-[11px]"
                >
                  Re-launch DIDIT Session
                </button>
              </div>
            </motion.div>
          )}

          {step === 'success' && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-md mx-auto text-center space-y-8 py-12 px-8 glass-card border border-primary/20 bg-primary/5 rounded-[3rem]"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full scale-110 animate-pulse" />
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                  className="relative inline-flex p-6 bg-primary/10 border border-primary/20 rounded-full text-primary"
                >
                  <CheckCircle2 className="w-16 h-16" />
                </motion.div>
              </div>

              <div className="space-y-3">
                <h2 className="text-3xl font-black uppercase tracking-tighter text-glow">
                  KYC Verified
                </h2>
                <div className="inline-block px-3 py-1 bg-green-500/10 border border-green-500/20 text-[9px] font-black text-green-400 uppercase tracking-widest rounded-full">
                  {userProfile?.role === 'creator' ? 'Status: Verified Creator' : 'Status: 18+ Verified Member'}
                </div>
                <p className="text-xs text-white/50 leading-relaxed font-medium max-w-xs mx-auto">
                  {userProfile?.role === 'creator'
                    ? 'Your identity credentials have been verified by DIDIT. Your Creator Studio and payout controls are now unlocked.'
                    : 'Your 18+ biometric verification has been confirmed by DIDIT.'}
                </p>
              </div>

              <button
                type="button"
                onClick={() => router.push(userProfile?.role === 'creator' ? '/studio' : '/feed')}
                className="w-full py-5 bg-gradient-to-r from-primary to-purple-500 text-black font-black uppercase tracking-[0.3em] rounded-2xl hover:shadow-[0_0_30px_rgba(0,251,251,0.4)] transition-all duration-300 flex items-center justify-center gap-2 text-xs"
              >
                {userProfile?.role === 'creator' ? 'Enter Creator Studio' : 'Return to Platform Feed'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
