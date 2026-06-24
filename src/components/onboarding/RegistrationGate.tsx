"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { Loader2, AlertCircle, Sparkles, Key, Mail, User, Phone, Smartphone } from 'lucide-react';

interface RegistrationGateProps {
  onComplete: () => void;
}

export default function RegistrationGate({ onComplete }: RegistrationGateProps) {
  const [acceptedTerms, setAcceptedTerms] = useState(false);
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
    if (!acceptedTerms) return;
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
          // 2. Create Profile row
          const { error: profileError } = await supabase
            .from('profiles')
            .upsert({
              id: data.user.id,
              username: username.trim().toLowerCase(),
              display_name: username.trim(),
              role: 'member'
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
        
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: mockUserId,
            username: finalUsername.toLowerCase(),
            display_name: finalUsername,
            role: 'member'
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
          const { error: profileError } = await supabase
            .from('profiles')
            .upsert({
              id: data.user.id,
              username: finalUsername.toLowerCase(),
              display_name: finalUsername,
              role: 'member'
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
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
             <Sparkles className="w-5 h-5" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            {showEmailForm ? (isSignUp ? 'Create Account' : 'Sign In') : 'Join Session'}
          </h2>
          <p className="text-gray-400 text-sm">Experience curated social matchmaking</p>
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
              className="flex flex-col gap-3"
            >
              {/* Google */}
              <button 
                onClick={() => handleProviderSelect('google')}
                disabled={!acceptedTerms || isSubmitting}
                className="relative flex items-center justify-center w-full bg-white text-black py-3 rounded-xl font-medium transition-transform active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 disabled:cursor-not-allowed text-xs"
              >
                <svg className="w-4 h-4 absolute left-4" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M21.35,11.1H12.18V13.83H18.69C18.36,17.64 15.19,19.27 12.19,19.27C8.36,19.27 5,16.25 5,12C5,7.9 8.2,4.73(12.2,4.73 15.29,4.73 17.1,6.7 17.1,6.7L19,4.72C19,4.72 16.56,2 12.1,2C6.42,2 2.03,6.8 2.03,12C2.03,17.05 6.16,22 12.25,22C17.6,22 21.5,18.33 21.5,12.91C21.5,11.76 21.35,11.1 21.35,11.1V11.1Z" />
                </svg>
                Continue with Google
              </button>

              {/* X */}
              <button 
                onClick={() => handleProviderSelect('x')}
                disabled={!acceptedTerms || isSubmitting}
                className="relative flex items-center justify-center w-full bg-black text-white py-3 rounded-xl border border-white/20 font-medium hover:bg-white/5 transition-colors active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 disabled:cursor-not-allowed text-xs"
              >
                <svg className="w-4 h-4 absolute left-4" viewBox="0 0 24 24">
                   <path fill="currentColor" d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
                Continue with X
              </button>

              {/* Phone */}
              <button 
                onClick={() => handleProviderSelect('phone')}
                disabled={!acceptedTerms || isSubmitting}
                className="relative flex items-center justify-center w-full bg-white/5 hover:bg-white/10 text-white py-3 rounded-xl border border-white/10 transition-colors active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 text-xs"
              >
                <Phone className="w-4 h-4 absolute left-4 text-white/50" />
                Continue with Phone
              </button>

              {/* Email */}
              <button 
                onClick={() => handleProviderSelect('email')}
                disabled={!acceptedTerms || isSubmitting}
                className="relative flex items-center justify-center w-full bg-white/5 hover:bg-white/10 text-white py-3 rounded-xl border border-white/10 transition-colors active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 text-xs"
              >
                <Mail className="w-4 h-4 absolute left-4 text-white/50" />
                Continue with Email
              </button>

              <div className="flex items-center gap-4 my-2">
                <div className="flex-1 h-px bg-white/10"></div>
                <span className="text-[10px] text-white/30 uppercase tracking-widest font-black">Or bypass auth</span>
                <div className="flex-1 h-px bg-white/10"></div>
              </div>

              {/* Guest / Demo login */}
              <button 
                onClick={handleDemoLogin}
                disabled={isSubmitting}
                className="relative flex items-center justify-center w-full bg-gradient-to-r from-primary/20 to-accent/20 hover:from-primary/30 hover:to-accent/30 text-white py-3.5 rounded-xl border border-primary/30 transition-all font-black uppercase tracking-widest text-[10px]"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2 text-primary" />
                    Enter Guest Demo Mode
                  </>
                )}
              </button>
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

        {/* Terms Checkbox */}
        <div className="flex items-start gap-3 mt-6 pt-4 border-t border-white/5">
          <button 
            onClick={() => setAcceptedTerms(!acceptedTerms)}
            className={`flex-shrink-0 w-5 h-5 rounded border flex items-center justify-center transition-colors mt-0.5 ${acceptedTerms ? 'bg-primary border-primary text-black' : 'bg-transparent border-white/20'}`}
          >
            {acceptedTerms && (
              <svg className="w-3.5 h-3.5 text-black stroke-[3]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            )}
          </button>
          <p className="text-[10px] text-gray-400 leading-relaxed cursor-pointer" onClick={() => setAcceptedTerms(!acceptedTerms)}>
            I am 18+ and accept the <span className="text-white font-medium underline decoration-white/30">General Platform Conditions</span> and <span className="text-white font-medium underline decoration-white/30">Privacy Policy</span>.
          </p>
        </div>
        
      </motion.div>
    </div>
  );
}
