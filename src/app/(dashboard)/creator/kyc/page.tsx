'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Upload, FileText, Camera, ArrowRight, CheckCircle2, Loader2 } from 'lucide-react';
import TaxAIHelper from '@/components/kyc/TaxAIHelper';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

type KYCStep = 'identity' | 'liveness' | 'legal' | 'tax' | 'completed';

export default function CreatorKYCPage() {
  const [currentStep, setCurrentStep] = useState<KYCStep>('identity');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    legalName: '',
    stageName: '',
    tin: '',
    gdprConsent: false,
    modelReleaseSigned: false
  });

  const nextStep = (step: KYCStep) => setCurrentStep(step);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Authentication required");

      const { error: upsertError } = await supabase.from('creator_kyc').upsert({
        creator_id: session.user.id,
        legal_name: formData.legalName,
        stage_name: formData.stageName,
        tin: formData.tin,
        model_release_signed: formData.modelReleaseSigned,
        gdpr_consent: formData.gdprConsent,
        status: 'pending'
      }, { onConflict: 'creator_id' });

      if (upsertError) throw upsertError;
      setCurrentStep('completed');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to submit KYC data');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 pt-24 max-w-3xl mx-auto">
      <div className="text-center mb-10">
        <div className="w-16 h-16 bg-[#00fbfb]/10 rounded-2xl border border-[#00fbfb]/20 flex items-center justify-center mx-auto mb-4">
          <ShieldCheck className="w-8 h-8 text-[#00fbfb]" />
        </div>
        <h1 className="text-4xl font-black text-white font-['JetBrains_Mono'] tracking-tighter">
          CREATOR <span className="text-[#00fbfb]">VERIFICATION</span>
        </h1>
        <p className="text-white/60 mt-2 text-sm max-w-md mx-auto">
          To comply with 18 U.S.C. § 2257, DSA, and DAC7 laws, all creators must verify their identity before monetizing.
        </p>
      </div>

      <div className="w-full bg-black/50 border border-white/10 rounded-3xl p-8 backdrop-blur-xl relative overflow-hidden">
        {/* Step Indicator */}
        <div className="flex justify-between mb-8 relative">
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-white/10 -translate-y-1/2 z-0" />
          {['identity', 'liveness', 'legal', 'tax', 'completed'].map((step, idx) => {
            const steps = ['identity', 'liveness', 'legal', 'tax', 'completed'];
            const isActive = step === currentStep;
            const isPast = steps.indexOf(step) < steps.indexOf(currentStep);
            
            return (
              <div key={step} className="relative z-10 flex flex-col items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors ${
                  isActive ? 'border-[#00fbfb] bg-[#00fbfb]/20 text-[#00fbfb]' : 
                  isPast ? 'border-[#00fbfb] bg-[#00fbfb] text-black' : 'border-white/20 bg-black text-white/40'
                }`}>
                  {isPast ? <CheckCircle2 className="w-4 h-4" /> : <span className="text-xs font-bold">{idx + 1}</span>}
                </div>
                <span className={`text-[10px] uppercase font-bold tracking-widest ${
                  isActive || isPast ? 'text-[#00fbfb]' : 'text-white/40'
                }`}>{step}</span>
              </div>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          {currentStep === 'identity' && (
            <motion.div
              key="identity"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-xl font-bold text-white mb-1">Step 1: Primary Document</h2>
                <p className="text-xs text-white/50">Upload a valid, unexpired government-issued photo ID.</p>
              </div>
              
              <div className="border-2 border-dashed border-white/20 rounded-2xl p-10 flex flex-col items-center justify-center hover:border-[#00fbfb]/50 hover:bg-[#00fbfb]/5 transition-colors cursor-pointer group">
                <Upload className="w-10 h-10 text-white/40 group-hover:text-[#00fbfb] mb-4 transition-colors" />
                <p className="text-sm font-bold text-white mb-1">Click to upload or drag & drop</p>
                <p className="text-xs text-white/40">Passport, Driver's License, or National ID Card</p>
              </div>
              
              <button onClick={() => nextStep('liveness')} className="w-full py-4 bg-[#00fbfb] text-black font-black uppercase text-sm rounded-xl hover:shadow-[0_0_20px_rgba(0,251,251,0.4)] transition">
                Continue to Liveness Check
              </button>
            </motion.div>
          )}

          {currentStep === 'liveness' && (
            <motion.div
              key="liveness"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-xl font-bold text-white mb-1">Step 2: Biometric Liveness</h2>
                <p className="text-xs text-white/50">Take a selfie holding your ID next to your face (2257 Liveness Bridge).</p>
                <div className="mt-3 p-3 bg-white/5 border border-white/10 rounded-lg">
                  <p className="text-[10px] text-white/60">
                    <strong className="text-white">GDPR Consent:</strong> By proceeding, you consent to the processing of your biometric data specifically for age and identity verification. This data is deleted immediately after the decision is rendered.
                  </p>
                </div>
              </div>
              
              <div className="border-2 border-white/10 bg-black/40 rounded-2xl h-64 flex flex-col items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1542831371-29b0f74f9713?auto=format&fit=crop&q=80')] bg-cover opacity-10 grayscale mix-blend-overlay" />
                <Camera className="w-12 h-12 text-white/30 mb-4" />
                <p className="text-sm font-bold text-white/50">Camera Access Required</p>
                <button className="mt-4 px-6 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold uppercase tracking-wider rounded-lg border border-white/20 transition">
                  Enable Camera
                </button>
              </div>
              
              <button 
                onClick={() => {
                  setFormData(prev => ({ ...prev, gdprConsent: true }));
                  nextStep('legal');
                }} 
                className="w-full py-4 bg-[#00fbfb] text-black font-black uppercase text-sm rounded-xl hover:shadow-[0_0_20px_rgba(0,251,251,0.4)] transition"
              >
                Approve & Continue
              </button>
            </motion.div>
          )}

          {currentStep === 'legal' && (
            <motion.div
              key="legal"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-xl font-bold text-white mb-1">Step 3: Legal Agreements</h2>
                <p className="text-xs text-white/50">Sign the Model Release Agreement required for 2257 compliance.</p>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-xs uppercase font-bold text-white/60 tracking-wider mb-1 block">Full Legal Name</label>
                  <input 
                    type="text" 
                    value={formData.legalName}
                    onChange={(e) => setFormData(prev => ({ ...prev, legalName: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#00fbfb]/50 focus:bg-white/10 transition" 
                    placeholder="As it appears on your ID" 
                  />
                </div>
                <div>
                  <label className="text-xs uppercase font-bold text-white/60 tracking-wider mb-1 block">Stage Name / Alias</label>
                  <input 
                    type="text" 
                    value={formData.stageName}
                    onChange={(e) => setFormData(prev => ({ ...prev, stageName: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#00fbfb]/50 focus:bg-white/10 transition" 
                    placeholder="Optional" 
                  />
                </div>
              </div>

              <div className="p-4 bg-white/5 border border-white/10 rounded-xl h-32 overflow-y-auto text-xs text-white/60 leading-relaxed custom-scrollbar">
                <h4 className="text-white font-bold mb-2">MODEL RELEASE AGREEMENT</h4>
                <p>I, the undersigned, hereby grant SECCION and its affiliates the irrevocable right to use my name, likeness, and any content I upload for distribution on the platform...</p>
                <p className="mt-2">I acknowledge that I am 18 years of age or older and that all identification provided is authentic and belongs to me.</p>
              </div>
              
              <button 
                onClick={() => {
                  if (!formData.legalName) return setError('Legal name is required');
                  setError(null);
                  setFormData(prev => ({ ...prev, modelReleaseSigned: true }));
                  nextStep('tax');
                }} 
                className="w-full py-4 bg-[#00fbfb] text-black font-black uppercase text-sm rounded-xl hover:shadow-[0_0_20px_rgba(0,251,251,0.4)] transition"
              >
                I Agree & Sign
              </button>
            </motion.div>
          )}

          {currentStep === 'tax' && (
            <motion.div
              key="tax"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-xl font-bold text-white mb-1">Step 4: Tax Information (DAC7)</h2>
                <p className="text-xs text-white/50">Required for European Union tax reporting directives.</p>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-xs uppercase font-bold text-white/60 tracking-wider mb-1 block">Tax Identification Number (TIN)</label>
                  <input 
                    type="text" 
                    value={formData.tin}
                    onChange={(e) => setFormData(prev => ({ ...prev, tin: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#00fbfb]/50 focus:bg-white/10 transition font-mono" 
                    placeholder="e.g., NIF, NIE, SSN" 
                  />
                </div>
              </div>

              {/* AI Helper Component */}
              <TaxAIHelper />
              
              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-xs text-center">
                  {error}
                </div>
              )}

              <button 
                onClick={handleSubmit} 
                disabled={isSubmitting}
                className="w-full py-4 bg-primary text-black font-black uppercase text-sm rounded-xl hover:shadow-[0_0_20px_rgba(102,252,241,0.4)] transition flex justify-center items-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Submit KYC <ArrowRight className="w-4 h-4" /></>}
              </button>
            </motion.div>
          )}

          {currentStep === 'completed' && (
            <motion.div
              key="completed"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-8 space-y-6"
            >
              <div className="w-20 h-20 bg-green-500/10 rounded-full border border-green-500/20 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10 text-green-400" />
              </div>
              
              <div>
                <h2 className="text-2xl font-black text-white font-['JetBrains_Mono']">Verification Submitted</h2>
                <p className="text-sm text-white/60 mt-2 max-w-sm mx-auto">
                  Your documents are securely encrypted and currently under review by our compliance team.
                </p>
              </div>

              <Link 
                href="/profile/creator"
                className="inline-block px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-bold uppercase tracking-wider text-xs rounded-xl transition border border-white/10"
              >
                Return to Studio
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
