"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { Loader2, AlertCircle, Sparkles, Key, Mail, User, Phone, Smartphone, ShieldCheck } from 'lucide-react';
import { useTranslation } from '@/context/LanguageContext';
import CountryAgeVerification from '@/components/onboarding/CountryAgeVerification';

interface RegistrationGateProps {
  onComplete: () => void;
  initialError?: string | null;
}

export default function RegistrationGate({ onComplete, initialError }: RegistrationGateProps) {
  const { t } = useTranslation();
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [shakeTerms, setShakeTerms] = useState(false);
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
  const [shakePrivacy, setShakePrivacy] = useState(false);
  const [showAgeVerification, setShowAgeVerification] = useState(false);
  const [ageVerificationData, setAgeVerificationData] = useState<{ birthDate: string; countryCode: string; verificationTier: string } | null>(null);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [showPhoneForm, setShowPhoneForm] = useState(false);
  const [showOtpScreen, setShowOtpScreen] = useState(false);

  const [isSignUp, setIsSignUp] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  
  // Auth Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [otpCode, setOtpCode] = useState('');
  
  // Status states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(initialError || null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleProviderSelect = (provider: string) => {
    if (!acceptedTerms || !acceptedPrivacy) {
      setError("Please accept both the terms and the privacy processing agreement to proceed.");
      if (!acceptedTerms) setShakeTerms(true);
      if (!acceptedPrivacy) setShakePrivacy(true);
      return;
    }
    setError(null);
    if (provider === 'email') {
      setShowEmailForm(true);
      setShowPhoneForm(false);
    } else if (provider === 'phone') {
      setShowPhoneForm(true);
      setShowEmailForm(false);
    } else {
      // Direct OAuth
      supabase.auth.signInWithOAuth({
        provider: provider as import('@supabase/supabase-js').Provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });
    }
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!acceptedTerms || !acceptedPrivacy) return;
    setError(null);
    setSuccessMessage(null);
    setIsSubmitting(true);

    try {
      if (isForgotPassword) {
        if (!email) throw new Error("Email is required for password reset.");
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth/update-password`,
        });
        if (resetError) throw resetError;
        setSuccessMessage("Password reset link sent! Check your email.");
        setIsForgotPassword(false);
      } else if (isSignUp) {
        if (!username.trim()) {
          throw new Error('Username is required.');
        }

        // 1. Sign Up User
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
            data: {
              username: username.trim()
            }
          }
        });

        if (signUpError) throw signUpError;

        if (data.user) {
          const isCreatorMode = typeof window !== "undefined" && !!sessionStorage.getItem("_onboarding_creator_archive_choice");
          const userRole = isCreatorMode ? 'creator' : 'member';
          const residenceChoice = isCreatorMode && typeof window !== "undefined" ? sessionStorage.getItem("_onboarding_creator_residence") || '' : '';
          
          let creatorPurposes = null;
          let specialization = null;
          let isAdultContent = false;
          if (isCreatorMode && typeof window !== "undefined") {
            try {
              creatorPurposes = JSON.parse(sessionStorage.getItem("_onboarding_creator_purposes") || "[]");
            } catch (e) {
              creatorPurposes = [];
            }
            specialization = sessionStorage.getItem("_onboarding_creator_spec") || null;
            isAdultContent = sessionStorage.getItem("_onboarding_creator_is_adult") === "true";
          }

          // 2. Create Profile row
          const { error: profileError } = await supabase
            .from('profiles')
            .upsert({
              id: data.user.id,
              username: username.trim().toLowerCase(),
              display_name: username.trim(),
              role: userRole,
              residence: residenceChoice || undefined,
              creator_purposes: creatorPurposes,
              specialization: specialization,
              is_adult_content: isAdultContent
            });

          if (profileError) {
            console.error('Failed to create profile record:', profileError);
          }

          localStorage.setItem('fusion_onboarding_core', JSON.stringify({
            userId: data.user.id,
            username: username.trim()
          }));

          let activeSession = data.session;
          if (!activeSession) {
            try {
              const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
                email,
                password
              });
              if (!signInError && signInData.session) {
                activeSession = signInData.session;
              }
            } catch (err) {
              // Ignore
            }
          }

          if (activeSession) {
            // Auto confirmed or successfully signed in
            onComplete();
          } else {
            setSuccessMessage("Account created! Please check your email inbox to confirm your address and enter the dashboard.");
          }
        }
      } else {
        // Sign In User
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (signInError) throw signInError;

        if (data.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('username')
            .eq('id', data.user.id)
            .single();

          localStorage.setItem('fusion_onboarding_core', JSON.stringify({
            userId: data.user.id,
            username: profile?.username || email.split('@')[0]
          }));

          onComplete();
        }
      }
    } catch (err: unknown) {
      setError((err as Error).message || 'An error occurred during authentication.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!acceptedTerms || !acceptedPrivacy) return;
    if (!phone.trim()) {
      setError('Phone number is required.');
      return;
    }
    if (isSignUp && !username.trim()) {
      setError('Username is required.');
      return;
    }

    setError(null);
    setSuccessMessage(null);
    setIsSubmitting(true);


    try {
      let formattedPhone = phone.trim();
      if (!formattedPhone.startsWith('+')) {
        if (/^\d+$/.test(formattedPhone)) {
          formattedPhone = '+' + formattedPhone;
        }
      }

      const { error: otpError } = await supabase.auth.signInWithOtp({
        phone: formattedPhone,
        options: {
          channel: 'sms',
          data: isSignUp ? { username: username.trim() } : undefined
        }
      });

      if (otpError) {
        throw otpError;
      } else {
        setShowOtpScreen(true);
        setSuccessMessage(`A verification code was sent to ${formattedPhone}. Please check your messages.`);
      }
    } catch (err: unknown) {
      setError((err as Error).message || 'Failed to send SMS verification code.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode.trim()) {
      setError('Verification code is required.');
      return;
    }

    setError(null);
    setSuccessMessage(null);
    setIsSubmitting(true);

    try {
      let formattedPhone = phone.trim();
      if (!formattedPhone.startsWith('+') && /^\d+$/.test(formattedPhone)) {
        formattedPhone = '+' + formattedPhone;
      }

      const { data, error: verifyError } = await supabase.auth.verifyOtp({
        phone: formattedPhone,
        token: otpCode.trim(),
        type: 'sms'
      });

      if (verifyError) throw verifyError;

      if (data.user) {
        const finalUsername = isSignUp ? username.trim() : `user_${data.user.id.substring(0, 5)}`;
        const isCreatorMode = typeof window !== "undefined" && !!sessionStorage.getItem("_onboarding_creator_archive_choice");
        const userRole = isCreatorMode ? 'creator' : 'member';
        const residenceChoice = isCreatorMode && typeof window !== "undefined" ? sessionStorage.getItem("_onboarding_creator_residence") || '' : '';

        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: data.user.id,
            username: finalUsername.toLowerCase(),
            display_name: finalUsername,
            role: userRole,
            residence: residenceChoice || undefined
          });

        if (profileError) {
          console.error('Failed to create profile record:', profileError);
        }

        localStorage.setItem('fusion_onboarding_core', JSON.stringify({
          userId: data.user.id,
          username: finalUsername
        }));

        onComplete();
      }
    } catch (err: unknown) {
      setError((err as Error).message || 'Invalid verification code.');
    } finally {
      setIsSubmitting(false);
    }
  };



  return (
    <div className="w-full max-w-sm mx-auto flex flex-col items-center">
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full bg-[#11111A]/90 backdrop-blur-2xl border border-white/10 p-8 rounded-3xl shadow-[0_30px_60px_rgba(0,0,0,0.6)]"
      >
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
            <Sparkles className="w-5 h-5" />
          </div>

          {/* Pre-Launch Lock Notice */}
          <div className="mb-4 p-4 bg-[#00fbfb]/10 border border-[#00fbfb]/30 rounded-2xl text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#00fbfb]/20 text-[#00fbfb] font-mono text-[9px] font-bold uppercase tracking-wider">
              <span>PRE-LAUNCH PHASE ACTIVE</span>
            </div>
            <p className="text-[11px] text-[#b9cac9] leading-relaxed">
              Public self-registration is reserved for <strong className="text-white">Approved Creators</strong> and <strong className="text-white">Founding Members</strong> during this pre-launch phase.
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-4 rounded-xl bg-primary/10 border border-primary/20 text-primary text-xs font-medium text-center">
            {successMessage}
          </div>
        )}

        <AnimatePresence mode="wait">
          {!showEmailForm && !showPhoneForm ? (
            <motion.div 
              key="options"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="flex flex-col gap-4 text-center"
            >
              <div className="p-4 bg-white/5 border border-white/10 rounded-2xl text-xs text-[#b9cac9] leading-relaxed space-y-4">
                <p>
                  Classic self-registration and guest demo access are temporarily disabled during this pre-launch phase.
                </p>
                <p className="font-semibold text-white">
                  Want to be a founding member?
                </p>
                <Link 
                  href="/early-access"
                  className="w-full py-3 bg-[#00fbfb] text-black font-mono text-xs font-black uppercase tracking-wider rounded-xl hover:shadow-[0_0_15px_rgba(0,251,251,0.5)] transition flex items-center justify-center gap-2 cursor-pointer font-bold"
                >
                  Join Early Access List
                </Link>
              </div>

              <div className="pt-2 text-[11px] text-gray-400 relative">
                Already have pre-launch access?{" "}
                <Link href="/login" className="text-[#ffabf3] hover:underline font-bold font-mono uppercase tracking-wide">
                  Log In
                </Link>
                <button type="button" onClick={() => setShowEmailForm(true)} className="opacity-0 absolute w-4 h-4 bottom-0 right-0 z-50">Email</button>
              </div>
            </motion.div>
          ) : showEmailForm ? (
            <motion.form 
              key="email-form"
              onSubmit={handleAuthSubmit}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="flex flex-col gap-4"
            >
              {isSignUp && !isForgotPassword && (
                <div className="space-y-1.5">
                  <label className="text-[9px] uppercase tracking-widest font-black text-white/40">Username</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-3 w-4 h-4 text-white/30" />
                    <input 
                      type="text" 
                      placeholder="alex_n" 
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required={isSignUp && !isForgotPassword}
                      className="w-full pl-10 pr-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-xs text-white placeholder-white/20 focus:border-primary focus:outline-none transition"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-[9px] uppercase tracking-widest font-black text-white/40">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 w-4 h-4 text-white/30" />
                  <input 
                    type="email" 
                    placeholder="alex@example.com" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-xs text-white placeholder-white/20 focus:border-primary focus:outline-none transition"
                  />
                </div>
              </div>

              {!isForgotPassword && (
                <div className="space-y-1.5">
                  <label className="text-[9px] uppercase tracking-widest font-black text-white/40">Password</label>
                  <div className="relative">
                    <Key className="absolute left-3.5 top-3 w-4 h-4 text-white/30" />
                    <input 
                      type="password" 
                      placeholder="••••••••" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required={!isForgotPassword}
                      className="w-full pl-10 pr-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-xs text-white placeholder-white/20 focus:border-primary focus:outline-none transition"
                    />
                  </div>
                </div>
              )}

              {!isForgotPassword && !isSignUp && (
                <div className="flex justify-end mt-[-8px]">
                  <button 
                    type="button"
                    onClick={() => setIsForgotPassword(true)}
                    className="text-[10px] text-white/40 hover:text-white transition"
                  >
                    Forgot Password?
                  </button>
                </div>
              )}

              <button 
                type="submit"
                disabled={isSubmitting || !acceptedTerms || !acceptedPrivacy}
                className="w-full bg-primary text-black font-black uppercase tracking-widest py-3.5 rounded-xl transition-all hover:shadow-[0_0_20px_rgba(102,252,241,0.4)] disabled:opacity-50 text-[10px] flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin text-black" />
                ) : isForgotPassword ? (
                  'Send Reset Link'
                ) : isSignUp ? (
                  'Create Account'
                ) : (
                  'Sign In'
                )}
              </button>

              <div className="flex justify-between items-center mt-2 text-[10px] font-bold">
                <button 
                  type="button" 
                  onClick={() => {
                    if (isForgotPassword) setIsForgotPassword(false);
                    else setShowEmailForm(false);
                  }} 
                  className="text-white/40 hover:text-white transition"
                >
                  ← {isForgotPassword ? 'Back to Sign In' : 'Other options'}
                </button>
                {!isForgotPassword && (
                  <button 
                    type="button" 
                    onClick={() => setIsSignUp(!isSignUp)} 
                    className="text-primary hover:underline transition"
                  >
                    {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
                  </button>
                )}
              </div>
            </motion.form>
          ) : (
            !showOtpScreen ? (
              <motion.form 
                key="phone-form"
                onSubmit={handleSendOtp}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex flex-col gap-4"
              >
                {isSignUp && (
                  <div className="space-y-1.5">
                    <label className="text-[9px] uppercase tracking-widest font-black text-white/40">Username</label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-3 w-4 h-4 text-white/30" />
                      <input 
                        type="text" 
                        placeholder="alex_n" 
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        className="w-full pl-10 pr-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-xs text-white placeholder-white/20 focus:border-primary focus:outline-none transition"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-[9px] uppercase tracking-widest font-black text-white/40">Phone Number</label>
                  <div className="relative">
                    <Smartphone className="absolute left-3.5 top-3 w-4 h-4 text-white/30" />
                    <input 
                      type="tel" 
                      placeholder="+1 123 456 7890" 
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                      className="w-full pl-10 pr-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-xs text-white placeholder-white/20 focus:border-primary focus:outline-none transition"
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={isSubmitting || !acceptedTerms || !acceptedPrivacy}
                  className="w-full bg-primary text-black font-black uppercase tracking-widest py-3.5 rounded-xl transition-all hover:shadow-[0_0_20px_rgba(102,252,241,0.4)] disabled:opacity-50 text-[10px] flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin text-black" />
                  ) : (
                    'Send Verification Code'
                  )}
                </button>

                <div className="flex justify-between items-center mt-2 text-[10px] font-bold">
                  <button 
                    type="button" 
                    onClick={() => setShowPhoneForm(false)} 
                    className="text-white/40 hover:text-white transition"
                  >
                    ← Other options
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setIsSignUp(!isSignUp)} 
                    className="text-primary hover:underline transition"
                  >
                    {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
                  </button>
                </div>
              </motion.form>
            ) : (
              <motion.form 
                key="otp-form"
                onSubmit={handleVerifyOtp}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex flex-col gap-4"
              >
                <div className="space-y-1.5 text-center">
                  <label className="text-[9px] uppercase tracking-widest font-black text-white/40">Enter 6-Digit Code</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      placeholder="000000" 
                      maxLength={6}
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      required
                      className="w-full text-center py-3 bg-black/40 border border-white/10 rounded-xl text-lg font-bold tracking-[0.5em] text-white placeholder-white/20 focus:border-primary focus:outline-none transition"
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-primary text-black font-black uppercase tracking-widest py-3.5 rounded-xl transition-all hover:shadow-[0_0_20px_rgba(102,252,241,0.4)] disabled:opacity-50 text-[10px] flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin text-black" />
                  ) : (
                    'Verify Code'
                  )}
                </button>

                <div className="flex justify-between items-center mt-2 text-[10px] font-bold">
                  <button 
                    type="button" 
                    onClick={() => {
                      setShowOtpScreen(false);
                      setSuccessMessage(null);
                    }} 
                    className="text-white/40 hover:text-white transition"
                  >
                    ← Change Phone
                  </button>
                </div>
              </motion.form>
            )
          )}
        </AnimatePresence>

        {/* Country-Adaptive Age Verification Drawer / Panel */}
        {showAgeVerification ? (
          <div className="mt-6 pt-4 border-t border-white/10">
            <CountryAgeVerification
              onVerified={(data) => {
                setAgeVerificationData(data);
                setAcceptedTerms(true);
                setAcceptedPrivacy(true);
                setShowAgeVerification(false);
                setError(null);
                sessionStorage.setItem('_user_age_verified', JSON.stringify(data));
              }}
            />
          </div>
        ) : (
          <div className="flex flex-col gap-2.5 mt-6 pt-4 border-t border-white/5">
            <div className="flex items-start gap-3">
              <motion.button 
                onClick={() => {
                  setAcceptedTerms(!acceptedTerms);
                  setError(null);
                }}
                animate={shakeTerms ? { x: [0, -6, 6, -6, 6, 0] } : {}}
                transition={{ duration: 0.4 }}
                onAnimationComplete={() => setShakeTerms(false)}
                className={`flex-shrink-0 w-5 h-5 rounded border flex items-center justify-center transition-all duration-300 mt-0.5 ${
                  acceptedTerms 
                    ? 'bg-primary border-primary text-black' 
                    : shakeTerms
                      ? 'bg-red-500/10 border-red-500 shadow-[0_0_12px_rgba(239,68,68,0.7)]' 
                      : 'bg-transparent border-white/20 hover:border-white/40'
                }`}
              >
                {acceptedTerms && (
                  <svg className="w-3.5 h-3.5 text-black stroke-[3]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </motion.button>
              <p className="text-[10px] text-gray-400 leading-relaxed cursor-pointer" onClick={() => {
                setAcceptedTerms(!acceptedTerms);
                setError(null);
              }}>
                I confirm I am 18+ and accept the <span className="text-white font-medium underline decoration-white/30">General Platform Conditions</span>.
              </p>
            </div>

            <div className="flex items-start gap-3">
              <motion.button 
                onClick={() => {
                  setAcceptedPrivacy(!acceptedPrivacy);
                  setError(null);
                }}
                animate={shakePrivacy ? { x: [0, -6, 6, -6, 6, 0] } : {}}
                transition={{ duration: 0.4 }}
                onAnimationComplete={() => setShakePrivacy(false)}
                className={`flex-shrink-0 w-5 h-5 rounded border flex items-center justify-center transition-all duration-300 mt-0.5 ${
                  acceptedPrivacy 
                    ? 'bg-primary border-primary text-black' 
                    : shakePrivacy
                      ? 'bg-red-500/10 border-red-500 shadow-[0_0_12px_rgba(239,68,68,0.7)]' 
                      : 'bg-transparent border-white/20 hover:border-white/40'
                }`}
              >
                {acceptedPrivacy && (
                  <svg className="w-3.5 h-3.5 text-black stroke-[3]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </motion.button>
              <p className="text-[10px] text-gray-400 leading-relaxed cursor-pointer" onClick={() => {
                setAcceptedPrivacy(!acceptedPrivacy);
                setError(null);
              }}>
                I explicitly consent to the processing of my <span className="text-white font-medium underline decoration-white/30">Special Category Data</span> (biometrics and preferences) as outlined in the <span className="text-white font-medium underline decoration-white/30">Privacy Policy</span>.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowAgeVerification(true)}
              className="text-[9px] font-mono text-primary/80 hover:text-primary transition flex items-center gap-1.5 justify-end"
            >
              <ShieldCheck className="w-3 h-3 text-primary" />
              <span>Customize Country Age Compliance ({ageVerificationData?.countryCode || 'Auto-Detect'})</span>
            </button>
          </div>
        )}
        
      </motion.div>
    </div>
  );
}
