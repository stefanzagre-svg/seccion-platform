'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, X, Camera, FileText, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

interface CreatorVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

export default function CreatorVerificationModal({ isOpen, onClose, userId }: CreatorVerificationModalProps) {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(null);

  // Form State for DAC7 / 2257
  const [legalName, setLegalName] = useState('');
  const [tinNumber, setTinNumber] = useState('');
  const [consent2257, setConsent2257] = useState(false);

  const handleStartVerification = async () => {
    if (!legalName || !tinNumber || !consent2257) {
      setVerificationError('Please fill out all legal requirements before proceeding.');
      return;
    }

    setIsVerifying(true);
    setVerificationError(null);
    try {
      // First, update creator_kyc record with legal_name and tin_number
      await supabase.from('creator_kyc').upsert({
        creator_id: userId,
        legal_name: legalName,
        tin_number: tinNumber,
        status: 'pending'
      });

      // Create KYC intent
      const res = await fetch('/api/kyc/shufti-webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create_intent', userId })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to initialize verification.');
      }

      // Normally here you would redirect the user to the Shufti Pro URL or open their SDK
      // For this implementation, we will simulate the Shufti Pro flow
      setStep(2);
      
      // Simulate verification processing
      setTimeout(() => {
        setStep(3);
      }, 3000);
      
    } catch (err: any) {
      console.error('KYC init error:', err);
      setVerificationError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleComplete = () => {
    onClose();
    router.refresh();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={step === 3 ? handleComplete : onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md bg-black border border-white/10 rounded-[2rem] shadow-2xl overflow-hidden z-10"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-sm font-black uppercase tracking-widest text-white">Creator Identity Verification</h2>
                  <p className="text-[10px] text-white/40 uppercase font-bold">Powered by Shufti Pro</p>
                </div>
              </div>
              {step !== 2 && (
                <button
                  onClick={step === 3 ? handleComplete : onClose}
                  className="p-2 rounded-xl hover:bg-white/5 transition-colors"
                >
                  <X className="w-5 h-5 text-white/50" />
                </button>
              )}
            </div>

            {/* Content */}
            <div className="p-6">
              {step === 1 && (
                <div className="space-y-6">
                  <p className="text-xs text-white/70 leading-relaxed font-medium">
                    To maintain a secure and compliant platform for adult creators, we require a quick identity verification. This ensures compliance with regulations like 2257 and protects our community.
                  </p>
                  
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                        <FileText className="w-4 h-4 text-white/60" />
                      </div>
                      <div>
                        <h4 className="text-[11px] font-black uppercase text-white tracking-wider">Government ID</h4>
                        <p className="text-[10px] text-white/50 leading-relaxed">Passport, National ID, or Driver's License.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                        <Camera className="w-4 h-4 text-white/60" />
                      </div>
                      <div>
                        <h4 className="text-[11px] font-black uppercase text-white tracking-wider">Liveness Check</h4>
                        <p className="text-[10px] text-white/50 leading-relaxed">A quick selfie to confirm you match your ID.</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-white/5">
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-wider text-white/70 block mb-1">Legal Name</label>
                      <input 
                        type="text" 
                        value={legalName}
                        onChange={(e) => setLegalName(e.target.value)}
                        placeholder="As it appears on ID"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-primary/50"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-wider text-white/70 block mb-1">Tax ID (TIN / SSN) - DAC7 Required</label>
                      <input 
                        type="text" 
                        value={tinNumber}
                        onChange={(e) => setTinNumber(e.target.value)}
                        placeholder="Tax Identification Number"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-primary/50"
                      />
                    </div>
                    <label className="flex items-start gap-3 cursor-pointer group">
                      <div className="relative flex items-center justify-center mt-0.5">
                        <input 
                          type="checkbox" 
                          checked={consent2257}
                          onChange={(e) => setConsent2257(e.target.checked)}
                          className="peer appearance-none w-5 h-5 rounded-md border-2 border-white/20 bg-black/50 checked:bg-primary checked:border-primary transition-all cursor-pointer"
                        />
                        <CheckCircle2 className="w-3 h-3 text-black absolute opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" />
                      </div>
                      <div className="flex-1">
                        <p className="text-[10px] text-white/60 font-medium leading-relaxed group-hover:text-white/80 transition-colors">
                          I certify that I am 18 years of age or older, and I consent to the collection of my records as required by 18 U.S.C. § 2257 and DAC7 tax regulations.
                        </p>
                      </div>
                    </label>
                  </div>

                  {verificationError && (
                    <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-2 text-red-400">
                      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                      <p className="text-[10px] font-bold">{verificationError}</p>
                    </div>
                  )}

                  <button
                    onClick={handleStartVerification}
                    disabled={isVerifying}
                    className="w-full py-3.5 bg-primary text-black font-black uppercase tracking-widest text-xs rounded-xl shadow-[0_0_20px_rgba(102,252,241,0.3)] hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    {isVerifying ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Initializing...
                      </>
                    ) : (
                      'Start Verification'
                    )}
                  </button>
                </div>
              )}

              {step === 2 && (
                <div className="py-12 flex flex-col items-center justify-center space-y-4 text-center">
                  <div className="w-16 h-16 relative">
                    <div className="absolute inset-0 border-4 border-primary/20 rounded-full" />
                    <div className="absolute inset-0 border-4 border-primary rounded-full border-t-transparent animate-spin" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black uppercase tracking-widest text-white mb-1">Verifying Identity</h3>
                    <p className="text-[10px] text-white/50 font-bold uppercase">Please complete the Shufti Pro flow.</p>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="py-8 flex flex-col items-center justify-center space-y-4 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                    <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black uppercase tracking-widest text-white mb-2">Verification Complete</h3>
                    <p className="text-[10px] text-white/50 font-bold uppercase max-w-[250px] mx-auto">
                      Your identity has been verified. You can now access all creator features.
                    </p>
                  </div>
                  <button
                    onClick={handleComplete}
                    className="mt-4 px-8 py-3 bg-white/10 hover:bg-white/15 text-white font-black uppercase tracking-widest text-xs rounded-xl transition-all"
                  >
                    Continue
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
