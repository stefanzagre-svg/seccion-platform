import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertCircle, Camera, CheckCircle2, ShieldAlert, ShieldCheck, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export interface MissingRequirement {
  id: string;
  label: string;
  icon?: React.ReactNode;
  met: boolean;
}

interface RequirementGateModalProps {
  isOpen: boolean;
  onClose: () => void;
  purposeId: string;
  purposeLabel: string;
  missingRequirements: MissingRequirement[];
  onNavigateToEditProfile: () => void;
  // For explicit content consent
  requiresAdultConsent?: boolean;
  onConsentChange?: (consented: boolean) => void;
  onConfirmAdultConsent?: () => void;
}

export default function RequirementGateModal({
  isOpen,
  onClose,
  purposeId,
  purposeLabel,
  missingRequirements,
  onNavigateToEditProfile,
  requiresAdultConsent,
  onConsentChange,
  onConfirmAdultConsent
}: RequirementGateModalProps) {
  const [localConsent, setLocalConsent] = useState(false);
  const [isHighTrustVerified, setIsHighTrustVerified] = useState(true);
  const [launchingDidit, setLaunchingDidit] = useState(false);

  const needsHighTrust = purposeId === 'dating' || purposeId === 'explicit' || Boolean(requiresAdultConsent);
  const hasMissingDeps = missingRequirements.some(req => !req.met);

  useEffect(() => {
    if (!isOpen || !needsHighTrust) return;
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session?.user?.id) return;
      const { data: prof } = await supabase
        .from('profiles')
        .select('is_kyc_verified')
        .eq('id', session.user.id)
        .maybeSingle();
      setIsHighTrustVerified(Boolean(prof?.is_kyc_verified));
    });
  }, [isOpen, needsHighTrust]);

  const handleStartServerKyc = async () => {
    setLaunchingDidit(true);
    try {
      const res = await fetch('/api/kyc/didit-session', { method: 'POST' });
      const data = await res.json();
      if (data?.url) {
        window.location.href = data.url;
        return;
      }
    } catch {
      // fallback to internal KYC cockpit
    }
    window.location.href = '/onboarding/kyc';
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-md bg-[#0F0F1A] border border-white/10 rounded-3xl shadow-[0_0_50px_rgba(0,251,251,0.15)] overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between bg-white/5">
            <h2 className="text-sm font-black uppercase tracking-widest text-white flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-[#00fbfb]" />
              Unlock {purposeLabel}
            </h2>
            <button 
              onClick={onClose}
              className="text-white/40 hover:text-white transition bg-white/5 hover:bg-white/10 p-1.5 rounded-full"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {hasMissingDeps && (
              <>
                <div className="text-sm text-[#b9cac9] leading-relaxed">
                  To activate the <strong className="text-white">{purposeLabel}</strong> purpose, your profile needs a few more details. Please complete the following requirements to ensure platform safety and connection quality.
                </div>

                <div className="space-y-3">
                  {missingRequirements.map((req) => (
                    <div 
                      key={req.id} 
                      className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${
                        req.met ? 'bg-green-500/10 border-green-500/30' : 'bg-white/5 border-white/10'
                      }`}
                    >
                      <div className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center border ${
                        req.met ? 'bg-green-500 border-green-500 text-black' : 'border-white/20 text-white/40'
                      }`}>
                        {req.met ? <CheckCircle2 className="w-4 h-4" /> : (req.icon || <AlertCircle className="w-3.5 h-3.5" />)}
                      </div>
                      <span className={`text-xs font-medium ${req.met ? 'text-green-400' : 'text-white/80'}`}>
                        {req.label}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}

            {needsHighTrust && !isHighTrustVerified && (
              <div className="p-4 rounded-2xl bg-[#00fbfb]/10 border border-[#00fbfb]/30 space-y-3">
                <div className="flex items-start gap-2.5">
                  <ShieldCheck className="w-5 h-5 text-[#00fbfb] shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-xs font-black uppercase tracking-wider text-[#00fbfb]">
                      Zero-Knowledge 18+ Identity Shield Required
                    </p>
                    <p className="text-[11px] text-white/75 leading-relaxed">
                      Because you joined via fast country entry, unlocking <strong>{purposeLabel}</strong> requires a 1-time server-verified DIDIT Zero-Knowledge 18+ or Biometric Liveness check.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  disabled={launchingDidit}
                  onClick={handleStartServerKyc}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#00fbfb] text-black font-mono text-[10px] font-black uppercase tracking-wider cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {launchingDidit ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Opening DIDIT Identity Shield...</span>
                    </>
                  ) : (
                    <span>Verify via DIDIT 18+ Identity Shield →</span>
                  )}
                </button>
              </div>
            )}

            {requiresAdultConsent && !hasMissingDeps && (
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                  <ShieldAlert className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                  <div className="text-xs text-red-200/80 leading-relaxed">
                    <strong className="text-red-400 block mb-1">Age Restricted Content</strong>
                    By enabling this purpose, your feed and interactions will include 18+ explicit content. You must be over 18 and explicitly consent to viewing this content.
                  </div>
                </div>

                <label className="flex items-start gap-3 p-4 rounded-xl border border-white/10 bg-white/5 cursor-pointer hover:bg-white/10 transition group">
                  <input 
                    type="checkbox" 
                    checked={localConsent}
                    onChange={(e) => {
                      setLocalConsent(e.target.checked);
                      onConsentChange?.(e.target.checked);
                    }}
                    className="mt-0.5 rounded border-white/20 bg-black/50 text-red-500 focus:ring-red-500 focus:ring-offset-black cursor-pointer"
                  />
                  <span className="text-xs text-white/80 font-medium">
                    I confirm I am 18+ and I explicitly consent to viewing and interacting with 18+ explicit content on this platform.
                  </span>
                </label>
              </div>
            )}
          </div>

          <div className="p-6 pt-0">
            {hasMissingDeps ? (
              <button 
                onClick={() => {
                  onClose();
                  onNavigateToEditProfile();
                }}
                className="w-full py-3.5 bg-white/10 hover:bg-white/20 text-white border border-white/10 rounded-xl text-xs font-black uppercase tracking-widest transition flex items-center justify-center gap-2"
              >
                <Camera className="w-4 h-4" />
                Adjust Profile
              </button>
            ) : requiresAdultConsent ? (
              <button 
                onClick={() => {
                  if (localConsent && isHighTrustVerified && onConfirmAdultConsent) {
                    onConfirmAdultConsent();
                  }
                }}
                disabled={!localConsent || !isHighTrustVerified}
                className="w-full py-3.5 bg-red-500 hover:bg-red-400 disabled:bg-white/5 disabled:text-white/30 disabled:border-white/10 disabled:cursor-not-allowed text-black border border-red-500 rounded-xl text-xs font-black uppercase tracking-widest transition flex items-center justify-center"
              >
                Confirm & Enable
              </button>
            ) : null}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
