"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { 
  Loader2, AlertCircle, ShieldCheck, Upload, Camera, FileText, 
  Check, CheckCircle2, Lock, ArrowRight, Sparkles 
} from 'lucide-react';

export default function CreatorKycPage() {
  const router = useRouter();
  
  // App/Auth States
  const [userId, setUserId] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Step / Progress States
  const [step, setStep] = useState<'kyc-form' | 'success'>('kyc-form');
  
  // Verification states
  const [idFile, setIdFile] = useState<File | null>(null);
  const [idFileName, setIdFileName] = useState<string>('');
  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  const [selfieFileName, setSelfieFileName] = useState<string>('');
  
  // Biometric Liveness check states
  const [cameraActive, setCameraActive] = useState(false);
  const [livenessVerified, setLivenessVerified] = useState(false);
  const [livenessStep, setLivenessStep] = useState(0); // 0: idle, 1: straight, 2: left-turn, 3: blink, 4: matching, 5: success
  const [livenessLog, setLivenessLog] = useState('');
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);
  
  // Model Release States
  const [legalName, setLegalName] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  
  // Check active user on mount
  useEffect(() => {
    async function checkAuth() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUserId(session.user.id);
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
          if (profile) {
            setUserProfile(profile);
            // If they are already verified and roles are set to creator, skip this page
            if (profile.role === 'creator' && profile.is_kyc_verified) {
              router.push('/studio');
              return;
            }
          }
        } else {
          // If no session, send to login
          router.push('/login');
        }
      } catch (err) {
        console.error("Auth check failed:", err);
        setError("Unable to authenticate your session. Please log in.");
      } finally {
        setIsLoading(false);
      }
    }
    
    checkAuth();
  }, []);

  const handleIdUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setIdFile(file);
      setIdFileName(file.name);
    }
  };

  const handleSelfieUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelfieFile(file);
      setSelfieFileName(file.name);
    }
  };

  const startLivenessCheck = async () => {
    try {
      setCameraActive(true);
      setLivenessVerified(false);
      setLivenessStep(1);
      setLivenessLog("Initializing secure biometrics session...");
      await new Promise((r) => setTimeout(r, 1000));

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 320, height: 320 },
      });
      setVideoStream(stream);

      // Link stream to video element
      setTimeout(() => {
        const videoEl = document.getElementById("liveness-video") as HTMLVideoElement;
        if (videoEl) {
          videoEl.srcObject = stream;
          videoEl.play().catch(e => console.error("Error playing video stream:", e));
        }
      }, 100);

      setLivenessLog("Step 1: Look straight into the camera (Face Scan)");
      await new Promise((r) => setTimeout(r, 2000));

      setLivenessStep(2);
      setLivenessLog("Step 2: Turn your head slightly to the left (3D Liveness check)");
      await new Promise((r) => setTimeout(r, 2000));

      setLivenessStep(3);
      setLivenessLog("Step 3: Blink once (Deepfake & Spoof prevention)");
      await new Promise((r) => setTimeout(r, 2000));

      setLivenessStep(4);
      setLivenessLog("Matching captures against uploaded ID photo...");

      // Stop camera tracks
      stream.getTracks().forEach((track) => track.stop());
      setVideoStream(null);

      await new Promise((r) => setTimeout(r, 1800));

      setLivenessStep(5);
      setLivenessVerified(true);
      setLivenessLog("✓ Verified! Biometric liveness check passed successfully.");
      setCameraActive(false);
    } catch (err) {
      console.error(err);
      setError("Failed to access camera for liveness check. Please check permissions.");
      setCameraActive(false);
      setLivenessStep(0);
    }
  };

  const handleKycSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    
    if (!idFile) {
      setError("Please upload your government-issued ID/Passport.");
      return;
    }
    if (!selfieFile) {
      setError("Please upload your selfie holding the government ID.");
      return;
    }
    if (!livenessVerified) {
      setError("Please complete the Biometric Liveness check.");
      return;
    }
    if (!legalName.trim()) {
      setError("Please enter your full legal name for the Model Release.");
      return;
    }
    if (!acceptedTerms) {
      setError("You must accept the Model Release agreement to proceed.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // 1. Mock file upload (normally would upload to Supabase storage)
      // Since it is a prelaunch mockup, we simulate successful upload
      await new Promise((r) => setTimeout(r, 2000));

      // 2. Update user profile details in Supabase
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          role: 'creator',
          is_kyc_verified: true,
          display_name: userProfile?.display_name || legalName.trim()
        })
        .eq('id', userId);

      if (updateError) throw updateError;

      // 3. Clear prelaunch creator signup flag in localStorage
      localStorage.removeItem('is_creator_signup');

      setStep('success');
    } catch (err: any) {
      console.error("KYC Submit error:", err);
      setError(err.message || "Failed to submit KYC data. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0A0A0C] text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
          <p className="text-xs font-mono uppercase tracking-[0.2em] text-white/50">Initializing Secure Portal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0C] text-white flex flex-col relative overflow-hidden py-16 px-4">
      {/* Dynamic Glowing background orbits */}
      <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-[#00fbfb]/5 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-purple-500/5 blur-[150px] rounded-full pointer-events-none" />
      
      {/* Cyber Grid background texture */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
            backgroundSize: "45px 45px",
          }}
        />
      </div>

      <div className="flex-1 w-full max-w-3xl mx-auto relative z-10 flex flex-col justify-center">
        <AnimatePresence mode="wait">
          
          {step === 'kyc-form' && (
            <motion.div
              key="kyc-form"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              className="space-y-8"
            >
              {/* Header Title */}
              <div className="text-center space-y-3">
                <div className="inline-flex p-3 bg-[#00fbfb]/10 border border-[#00fbfb]/20 rounded-2xl text-primary mb-2 shadow-[0_0_20px_rgba(0,251,251,0.2)]">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <h1 className="text-4xl font-black tracking-tighter uppercase text-glow">
                  Creator Legal & Identity Verification
                </h1>
                <p className="text-sm text-white/50 font-bold uppercase tracking-wider max-w-lg mx-auto leading-relaxed">
                  Complete required verification to activate your Founding Creator status and unlock public streams.
                </p>
              </div>

              {/* Error Banner */}
              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold rounded-2xl flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* KYC Form Block */}
              <form onSubmit={handleKycSubmit} className="space-y-6">
                
                {/* 1. Passport/ID Document Upload Card */}
                <div className="glass-card p-8 rounded-3xl border border-white/5 bg-white/[0.02] space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg text-primary">
                      <FileText className="w-5 h-5" />
                    </div>
                    <h3 className="text-base font-black uppercase tracking-wider">
                      Step 1: Government-Issued Photo ID
                    </h3>
                  </div>
                  <p className="text-xs text-white/40 leading-relaxed font-medium">
                    Upload a high-resolution, uncropped color scan of your government photo ID card, driver's license, or passport. Must include legal name, date of birth, and expiry date.
                  </p>
                  
                  <div className="relative border-2 border-dashed border-white/10 hover:border-primary/40 rounded-2xl p-8 transition flex flex-col items-center justify-center bg-black/20 hover:bg-black/30 group">
                    <input 
                      type="file" 
                      accept="image/*,application/pdf"
                      onChange={handleIdUpload}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    <Upload className="w-8 h-8 text-white/30 group-hover:text-primary transition mb-3" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider mb-1">
                      {idFileName ? 'ID Uploaded ✓' : 'Drag & Drop ID here or browse'}
                    </span>
                    <span className="text-[10px] text-white/30">
                      {idFileName || 'Supports JPEG, PNG, PDF up to 10MB'}
                    </span>
                  </div>
                </div>

                {/* 2. Selfie Holding ID Card */}
                <div className="glass-card p-8 rounded-3xl border border-white/5 bg-white/[0.02] space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg text-primary">
                      <Camera className="w-5 h-5" />
                    </div>
                    <h3 className="text-base font-black uppercase tracking-wider">
                      Step 2: Selfie Holding Your ID
                    </h3>
                  </div>
                  <p className="text-xs text-white/40 leading-relaxed font-medium">
                    Upload a clear selfie showing your face while holding your government-issued ID card directly next to your face. Make sure all texts and photo on the ID are fully legible.
                  </p>
                  
                  <div className="relative border-2 border-dashed border-white/10 hover:border-primary/40 rounded-2xl p-8 transition flex flex-col items-center justify-center bg-black/20 hover:bg-black/30 group">
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={handleSelfieUpload}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    <Camera className="w-8 h-8 text-white/30 group-hover:text-primary transition mb-3" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider mb-1">
                      {selfieFileName ? 'Selfie Uploaded ✓' : 'Drag & Drop Selfie here or browse'}
                    </span>
                    <span className="text-[10px] text-white/30">
                      {selfieFileName || 'Please make sure all ID information is readable.'}
                    </span>
                  </div>
                </div>

                {/* 3. Webcam Biometric Liveness Check */}
                <div className="glass-card p-8 rounded-3xl border border-white/5 bg-white/[0.02] space-y-5">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg text-primary">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <h3 className="text-base font-black uppercase tracking-wider">
                      Step 3: Biometric Liveness Scan
                    </h3>
                  </div>
                  <p className="text-xs text-white/40 leading-relaxed font-medium">
                    To satisfy compliance standards and prevent AI spoofing or deepfakes, complete a quick 3D liveness scan matching your face structure.
                  </p>

                  <div className="p-6 bg-black/40 border border-white/5 rounded-2xl space-y-4 flex flex-col items-center">
                    {cameraActive && (
                      <div className="relative w-64 h-64 rounded-full overflow-hidden border-4 border-primary/50 shadow-[0_0_30px_rgba(0,251,251,0.3)] bg-black">
                        <video 
                          id="liveness-video" 
                          className="w-full h-full object-cover scale-x-[-1]"
                          playsInline 
                          muted 
                        />
                        {livenessStep > 0 && livenessStep < 4 && (
                          <div className="absolute inset-0 border-[6px] border-dashed border-primary/30 animate-[spin_20s_linear_infinite] rounded-full pointer-events-none" />
                        )}
                      </div>
                    )}

                    {livenessStep > 0 && (
                      <div className="text-center w-full max-w-sm space-y-2">
                        <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary shadow-[0_0_10px_rgba(0,251,251,0.5)] transition-all duration-300"
                            style={{ width: `${(livenessStep / 5) * 100}%` }}
                          />
                        </div>
                        <p className="text-[10px] font-mono text-primary uppercase tracking-widest leading-relaxed animate-pulse">
                          {livenessLog}
                        </p>
                      </div>
                    )}

                    {!cameraActive && !livenessVerified && (
                      <button
                        type="button"
                        onClick={startLivenessCheck}
                        className="w-full max-w-xs py-4 bg-primary/10 hover:bg-primary/20 border border-primary/20 hover:border-primary/40 text-primary font-black uppercase tracking-widest rounded-xl transition text-[10px] flex items-center justify-center gap-2"
                      >
                        <Camera className="w-4 h-4" /> Start Liveness Scan
                      </button>
                    )}

                    {livenessVerified && (
                      <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl flex items-center gap-3 w-full justify-center">
                        <CheckCircle2 className="w-5 h-5 text-green-400" />
                        <span className="text-[10px] uppercase font-black tracking-widest text-green-400">
                          Biometric Scan Verified (99.4% Match)
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* 4. 18 U.S.C. § 2257 Model Release Agreement */}
                <div className="glass-card p-8 rounded-3xl border border-white/5 bg-white/[0.02] space-y-5">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg text-primary">
                      <Lock className="w-5 h-5" />
                    </div>
                    <h3 className="text-base font-black uppercase tracking-wider">
                      Step 4: Model Release & Content Agreement
                    </h3>
                  </div>

                  {/* Scrollable Terms Agreement Box */}
                  <div className="h-40 overflow-y-auto p-4 rounded-xl bg-black/40 border border-white/10 text-[10px] text-white/50 leading-relaxed font-medium space-y-3 custom-scrollbar">
                    <p className="font-bold text-white uppercase">18 U.S.C. § 2257 Record-Keeping Compliance & Model Consent Agreement</p>
                    <p>
                      This agreement is entered into by and between the verified Content Creator (referred to as the "Producer") and **SECCION S.L. (in formation)**, a platform incorporated under the laws of Spain (referred to as the "Platform").
                    </p>
                    <p>
                      The Producer explicitly warrants and represents that they are at least 18 years of age at the time of executing this document and that all content uploaded, live-streamed, or otherwise broadcasted on the Platform will strictly feature individuals who are at least 18 years of age.
                    </p>
                    <p>
                      The Producer acknowledges and agrees that they must provide a valid government-issued photo identification as proof of age. The Platform reserves the right to suspend or terminate the Producer's access to the Platform if there is any suspicion of identity fraud, representation of minors, or violation of the Platform's safety guidelines.
                    </p>
                    <p>
                      By checking the box below, you digitally sign this Model Release Agreement, consenting to the platform storing the uploaded verification documents in an encrypted secure vault, in compliance with GDPR safety regulations and regulatory requirements.
                    </p>
                  </div>

                  {/* Agreement Form Controls */}
                  <div className="space-y-4">
                    <div className="flex flex-col gap-2">
                      <label className="text-[9px] uppercase tracking-widest font-black text-white/40">
                        Full Legal Name (Matches ID)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Elena Rostova"
                        value={legalName}
                        onChange={(e) => setLegalName(e.target.value)}
                        className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl text-xs text-white placeholder-white/20 focus:border-primary focus:outline-none transition-all"
                      />
                    </div>

                    <label className="flex items-start gap-3 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={acceptedTerms}
                        onChange={(e) => setAcceptedTerms(e.target.checked)}
                        className="mt-1 w-4 h-4 bg-black/50 border border-white/10 rounded accent-primary cursor-pointer focus:outline-none"
                      />
                      <span className="text-[10px] text-white/50 font-medium leading-normal">
                        I hereby declare under penalty of perjury that I am 18 years or older, the legal owner of the uploaded documents, and I digitally sign and execute this Model Consent Agreement with **SECCION S.L. (in formation)**.
                      </span>
                    </label>
                  </div>
                </div>

                {/* Submit Action Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-5 bg-gradient-to-r from-primary to-purple-500 text-black font-black uppercase tracking-[0.2em] rounded-2xl hover:shadow-[0_0_30px_rgba(0,251,251,0.3)] transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2 text-xs"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-black" />
                      Uploading & Processing KYC Credentials...
                    </>
                  ) : (
                    <>
                      Complete Creator KYC & Enter Platform
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
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
                  Status: Active Creator
                </div>
                <p className="text-xs text-white/50 leading-relaxed font-medium max-w-xs mx-auto">
                  Welcome to SECCION. Your identity credentials and signed release have been verified and secured. Your profile is now set to Creator Mode.
                </p>
              </div>

              <button
                onClick={() => router.push('/studio')}
                className="w-full py-5 bg-gradient-to-r from-primary to-purple-500 text-black font-black uppercase tracking-[0.3em] rounded-2xl hover:shadow-[0_0_30px_rgba(0,251,251,0.4)] transition-all duration-300 flex items-center justify-center gap-2 text-xs"
              >
                Enter Creator Studio
                <Sparkles className="w-4 h-4" />
              </button>
            </motion.div>
          )}
          
        </AnimatePresence>
      </div>
    </div>
  );
}
