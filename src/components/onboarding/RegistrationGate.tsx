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
}

export default function RegistrationGate({ onComplete }: RegistrationGateProps) {
  const { t } = useTranslation();
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [shakeTerms, setShakeTerms] = useState(false);
  const [showAgeVerification, setShowAgeVerification] = useState(false);
  const [ageVerificationData, setAgeVerificationData] = useState<{ birthDate: string; countryCode: string; verificationTier: string } | null>(null);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [showPhoneForm, setShowPhoneForm] = useState(false);
  const [showOtpScreen, setShowOtpScreen] = useState(false);
  const [isMockPhoneMode, setIsMockPhoneMode] = useState(false);
  const [isSignUp, setIsSignUp] = useState(true);
  
  // Auth Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [otpCode, setOtpCode] = useState('');
  
  // Status states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleProviderSelect = (provider: string) => {
    if (!acceptedTerms) {
      setError("Please accept the terms and verify you are 18+ to proceed.");
      setShakeTerms(true);
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
    if (!acceptedTerms) return;
    setError(null);
    setSuccessMessage(null);
    setIsSubmitting(true);

    try {
      if (isSignUp) {
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

          // 2. Create Profile row
          const { error: profileError } = await supabase
            .from('profiles')
            .upsert({
              id: data.user.id,
              username: username.trim().toLowerCase(),
              display_name: username.trim(),
              role: userRole,
              residence: residenceChoice || undefined
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
    if (!acceptedTerms) return;
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
    setIsMockPhoneMode(false);

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
        const msg = otpError.message.toLowerCase();
        if (
          msg.includes('sms provider') ||
          msg.includes('twilio') ||
          msg.includes('not configured') ||
          msg.includes('credentials') ||
          msg.includes('disabled') ||
          msg.includes('invalid api key') ||
          msg.includes('unauthorized') ||
          msg.includes('sms_provider') ||
          msg.includes('configuration')
        ) {
          console.warn("Supabase SMS provider error, falling back to simulated SMS mode:", otpError);
          setIsMockPhoneMode(true);
          setShowOtpScreen(true);
          setSuccessMessage("SMS Gateway Simulation: SMS provider not configured. Enter code 123456 to verify.");
        } else {
          throw otpError;
        }
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

      if (isMockPhoneMode && otpCode.trim() === '123456') {
        const mockUserId = 'demo-phone-' + Math.random().toString(36).substring(2, 12);
        const finalUsername = isSignUp ? username.trim() : `user_${mockUserId.substring(11, 16)}`;
        const isCreatorMode = typeof window !== "undefined" && !!sessionStorage.getItem("_onboarding_creator_archive_choice");
        const userRole = isCreatorMode ? 'creator' : 'member';
        const residenceChoice = isCreatorMode && typeof window !== "undefined" ? sessionStorage.getItem("_onboarding_creator_residence") || '' : '';
        
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: mockUserId,
            username: finalUsername.toLowerCase(),
            display_name: finalUsername,
            role: userRole,
            residence: residenceChoice || undefined
          });

        if (profileError) {
          console.error('Failed to create profile record:', profileError);
        }

        localStorage.setItem('fusion_onboarding_core', JSON.stringify({
          userId: mockUserId,
          username: finalUsername
        }));

        onComplete();
      } else {
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
      }
    } catch (err: unknown) {
      setError((err as Error).message || 'Invalid verification code.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoLogin = async () => {
    setError(null);
    setIsSubmitting(true);
    const demoEmail = `guest_${Math.floor(Math.random() * 10000)}@session.com`;
    const demoPass = 'DemoPassword123!';
    const demoUsername = `Guest_${Math.floor(Math.random() * 10000)}`;

    // 1. Try anonymous sign-in first
    try {
      const { data: anonData, error: anonError } = await supabase.auth.signInAnonymously({
        options: {
          data: {
            username: demoUsername
          }
        }
      });

      if (!anonError && anonData.user) {
        await supabase
          .from('profiles')
          .upsert({
            id: anonData.user.id,
            username: demoUsername.toLowerCase(),
            display_name: demoUsername,
            role: 'member'
          });

        localStorage.setItem('fusion_onboarding_core', JSON.stringify({
          userId: anonData.user.id,
          username: demoUsername
        }));

        onComplete();
        return;
      }

      if (anonError) {
        console.warn("Anonymous sign-in failed, trying standard signUp:", anonError.message);
      }
    } catch (anonErr) {
      console.warn("Anonymous sign-in exception:", anonErr);
    }

    // 2. Fallback to standard signUp if anonymous sign-in failed/disabled
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: demoEmail,
        password: demoPass,
        options: {
          data: {
            username: demoUsername
          }
        }
      });

      if (signUpError) throw signUpError;

      if (data.user) {
        let activeSession = data.session;
        if (!activeSession) {
          try {
            const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
              email: demoEmail,
              password: demoPass
            });
            if (!signInError && signInData.session) {
              activeSession = signInData.session;
            }
          } catch (err) {
            // Ignore
          }
        }

        if (!activeSession) {
          throw new Error("Email confirmation is enabled on your Supabase project. For Guest Demo Mode to work, please disable 'Confirm Email' in your Supabase Dashboard under Authentication -> Providers -> Email, or enable 'Allow Anonymous Sign-ins'.");
        }

        await supabase
          .from('profiles')
          .upsert({
            id: data.user.id,
            username: demoUsername.toLowerCase(),
            display_name: demoUsername,
            role: 'member'
          });

        localStorage.setItem('fusion_onboarding_core', JSON.stringify({
          userId: data.user.id,
          username: demoUsername
        }));

        onComplete();
      }
    } catch (err: unknown) {
      const errMsg = (err as Error).message || '';
      if (errMsg.includes("Email confirmation is enabled") || errMsg.includes("Confirm Email")) {
        setError(errMsg);
        return;
      }

      console.warn("Supabase SignUp error, falling back to mock localStorage session:", err);
      // Fallback guest setup if Supabase has limits or SMTP issues
      const mockId = 'demo-guest-' + Math.random().toString(36).substring(2, 12);
      localStorage.setItem('fusion_onboarding_core', JSON.stringify({
        userId: mockId,
        username: demoUsername
      }));
      onComplete();
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
              Public self-registration & guest demo mode are temporarily locked. Access is reserved for <strong className="text-white">Approved Creators</strong> and <strong className="text-white">Founding Members</strong>.
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

              <div className="pt-2 text-[11px] text-gray-400">
                Already have pre-launch access?{" "}
                <Link href="/login" className="text-[#ffabf3] hover:underline font-bold font-mono uppercase tracking-wide">
                  Log In
                </Link>
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

              <div className="space-y-1.5">
                <label className="text-[9px] uppercase tracking-widest font-black text-white/40">Password</label>
                <div className="relative">
                  <Key className="absolute left-3.5 top-3 w-4 h-4 text-white/30" />
                  <input 
                    type="password" 
                    placeholder="••••••••" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-xs text-white placeholder-white/20 focus:border-primary focus:outline-none transition"
                  />
                </div>
              </div>

              <button 
                type="submit"
                disabled={isSubmitting || !acceptedTerms}
                className="w-full bg-primary text-black font-black uppercase tracking-widest py-3.5 rounded-xl transition-all hover:shadow-[0_0_20px_rgba(102,252,241,0.4)] disabled:opacity-50 text-[10px] flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin text-black" />
                ) : (
                  isSignUp ? 'Create Account' : 'Sign In'
                )}
              </button>

              <div className="flex justify-between items-center mt-2 text-[10px] font-bold">
                <button 
                  type="button" 
                  onClick={() => setShowEmailForm(false)} 
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
                  disabled={isSubmitting || !acceptedTerms}
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
                      setIsMockPhoneMode(false);
                      setSuccessMessage(null);
                    }} 
                    className="text-white/40 hover:text-white transition"
                  >
                    ← Change Phone
                  </button>
                  {isMockPhoneMode && (
                    <span className="text-accent">
                      Demo Code: 123456
                    </span>
                  )}
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
                I confirm I am 18+ and accept the <span className="text-white font-medium underline decoration-white/30">General Platform Conditions</span> and <span className="text-white font-medium underline decoration-white/30">Privacy Policy</span>.
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
