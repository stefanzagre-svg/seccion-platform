'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, MessageSquare, X, Send, Lock, Loader2, CreditCard, CheckCircle2, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { usePathname } from 'next/navigation';
import { useTranslation } from '@/context/LanguageContext';


interface Message {
  id: string;
  sender: 'user' | 'wingman';
  text: string;
  timestamp: Date;
}

export default function AIWingmanBubble() {
  const pathname = usePathname();
  const { locale } = useTranslation();

  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'wingman',
      text: "¡Hola! Soy tu AI Wingman y Coach de Química. Pregúntame cómo elevar tus medidores de afinidad, iniciar conversaciones o recibir consejos de compatibilidad personalizados.",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  // Status states
  const [isTrial, setIsTrial] = useState(true);
  const [trialDaysLeft, setTrialDaysLeft] = useState(30);
  const [credits, setCredits] = useState(10);
  const [showPaywall, setShowPaywall] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping, showPaywall]);

  // Load User & Profile
  useEffect(() => {
    async function loadUser() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        
        // Fetch profile
        const { data: profileData } = await supabase
          .from('profiles')
          .select('role, created_at, privacy_settings')
          .eq('id', session.user.id)
          .single();

        if (profileData) {
          setProfile(profileData);
          if (profileData.privacy_settings?.wingman_credits !== undefined) {
            setCredits(profileData.privacy_settings.wingman_credits);
          }
          if (profileData.created_at) {
            const ageInMs = Date.now() - new Date(profileData.created_at).getTime();
            const daysDiff = ageInMs / (1000 * 60 * 60 * 24);
            setIsTrial(daysDiff <= 30);
            setTrialDaysLeft(Math.max(0, Math.ceil(30 - daysDiff)));
          }
        }
      }
    }

    loadUser();
  }, []);

  if (pathname?.startsWith('/admin') || pathname?.startsWith('/auth')) {
    return null;
  }


  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMessageText = input;
    setInput('');
    setErrorText(null);

    // 1. Add user message locally
    const userMsg: Message = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: userMessageText,
      timestamp: new Date()
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    try {
      // 2. Call appropriate endpoint based on auth state
      const endpoint = (profile && profile.role === 'member')
        ? '/api/v2/assistant/chat'
        : '/api/v2/onboarding/specialist';

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessageText, locale }),
      });
      const data = await response.json();

      if (data.needsPurchase) {
        setShowPaywall(true);
        setIsTyping(false);
        return;
      }

      if (!response.ok) {
        throw new Error(data.error || 'Failed to communicate with SECCIØN Agent');
      }

      // Update local state metrics if member
      if (data.isTrial !== undefined) setIsTrial(data.isTrial);
      if (data.trialDaysLeft !== undefined) setTrialDaysLeft(data.trialDaysLeft);
      if (data.credits !== undefined) setCredits(data.credits);

      // Add agent response
      const wingmanMsg: Message = {
        id: `wingman-${Date.now()}`,
        sender: 'wingman',
        text: data.reply || data.response || "I'm here to help you explore SECCIØN!",
        timestamp: new Date()
      };
      setMessages((prev) => [...prev, wingmanMsg]);

    } catch (err: any) {
      console.error(err);
      setErrorText(err.message || 'Connecting error. Please try again.');
    } finally {
      setIsTyping(false);
    }
  };

  const handlePurchaseCredits = async () => {
    setIsPurchasing(true);
    setErrorText(null);
    try {
      // Simulate Stripe checkout API call delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const response = await fetch('/api/v2/assistant/purchase-credits', {
        method: 'POST'
      });
      const data = await response.json();

      if (!response.ok) throw new Error(data.error || 'Failed to complete transaction');

      setCredits(data.newCredits);
      setPurchaseSuccess(true);
      
      // Auto close paywall after brief celebration delay
      setTimeout(() => {
        setShowPaywall(false);
        setPurchaseSuccess(false);
      }, 2000);

    } catch (err: any) {
      setErrorText(err.message || 'Transaction failed. Try again.');
    } finally {
      setIsPurchasing(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[60] font-sans">
      <AnimatePresence>
        {/* Expanded Chat Pane */}
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-20 right-4 left-4 sm:left-auto sm:right-6 sm:bottom-20 z-50 w-auto sm:w-[360px] h-[480px] max-h-[75vh] bg-black/95 border border-white/10 rounded-[2rem] sm:rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,251,251,0.2)] flex flex-col overflow-hidden backdrop-blur-2xl"
          >
            {/* Header */}
            <header className="p-4 border-b border-white/5 bg-gradient-to-r from-cyan-950/20 to-purple-950/20 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-[0_0_10px_rgba(0,251,251,0.2)]">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-black uppercase tracking-widest text-white">Wingman Coach</h3>
                  {isTrial ? (
                    <span className="text-[8px] font-bold text-emerald-400 uppercase tracking-widest block">
                      ✨ Trial Active ({trialDaysLeft} days left)
                    </span>
                  ) : (
                    <span className="text-[8px] font-bold text-primary block tracking-widest uppercase">
                      💎 {credits} credits remaining
                    </span>
                  )}
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition border border-white/5"
              >
                <X className="w-4 h-4" />
              </button>
            </header>

            {/* Conversation Feed */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 relative">
              {messages.map((msg) => {
                const isWingman = msg.sender === 'wingman';
                return (
                  <div
                    key={msg.id}
                    className={`flex ${isWingman ? 'justify-start' : 'justify-end'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl p-3.5 text-xs leading-relaxed border ${
                        isWingman
                          ? 'bg-white/5 border-white/5 text-white/90 rounded-tl-sm'
                          : 'bg-primary/10 border-primary/20 text-white rounded-tr-sm'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                );
              })}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white/5 border border-white/5 rounded-2xl p-3.5 text-xs rounded-tl-sm text-white/50 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}

              {errorText && (
                <div className="p-3 bg-red-950/20 border border-red-500/20 rounded-xl text-red-400 text-xs font-semibold flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorText}</span>
                </div>
              )}

              <div ref={messagesEndRef} />

              {/* Gated Paywall Drawer */}
              <AnimatePresence>
                {showPaywall && (
                  <motion.div
                    initial={{ opacity: 0, y: '100%' }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: '100%' }}
                    className="absolute inset-0 bg-black/95 flex flex-col items-center justify-center p-6 text-center z-20 space-y-6"
                  >
                    {!purchaseSuccess ? (
                      <>
                        <div className="w-14 h-14 bg-primary/10 border border-primary/20 rounded-2xl flex items-center justify-center text-primary relative z-10 animate-pulse">
                          <Lock className="w-6 h-6" />
                        </div>

                        <div className="space-y-2">
                          <h4 className="text-sm font-black uppercase tracking-widest text-white">
                            Free Trial Expired
                          </h4>
                          <p className="text-[10px] text-white/50 leading-relaxed max-w-[220px] mx-auto">
                            Your 30-day free trial has completed. Unlock credits to keep consulting your AI Wingman.
                          </p>
                        </div>

                        {/* Buy Credits Card */}
                        <div className="w-full bg-white/[0.02] border border-white/5 rounded-2xl p-4 space-y-3">
                          <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                            <span className="text-white/60">Wingman Booster</span>
                            <span className="text-primary">50 Queries</span>
                          </div>
                          <div className="text-xl font-black text-white text-left tracking-tighter">
                            €4.99
                            <span className="text-[9px] text-white/40 font-bold uppercase tracking-widest ml-1.5">One-time purchase</span>
                          </div>

                          <button
                            onClick={handlePurchaseCredits}
                            disabled={isPurchasing}
                            className="w-full py-3 bg-primary text-black font-black uppercase tracking-widest text-[9px] rounded-xl hover:shadow-[0_0_15px_rgba(102,252,241,0.5)] transition disabled:opacity-50 flex items-center justify-center gap-1.5"
                          >
                            {isPurchasing ? (
                              <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Verifying...
                              </>
                            ) : (
                              <>
                                <CreditCard className="w-3.5 h-3.5" /> Buy 50 Credits
                              </>
                            )}
                          </button>
                        </div>

                        <button
                          onClick={() => setShowPaywall(false)}
                          className="text-[9px] font-bold text-white/40 hover:text-white uppercase tracking-widest transition"
                        >
                          Close
                        </button>
                      </>
                    ) : (
                      <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="space-y-4 flex flex-col items-center"
                      >
                        <CheckCircle2 className="w-12 h-12 text-emerald-400" />
                        <h4 className="text-sm font-black uppercase tracking-widest text-white">Payment Confirmed!</h4>
                        <p className="text-[10px] text-white/40 uppercase tracking-widest font-black">+50 Credits Loaded</p>
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Input Form */}
            <form onSubmit={handleSend} className="p-3 border-t border-white/5 bg-black/40 flex items-center gap-2">
              <input
                type="text"
                placeholder={showPaywall ? "Booster required..." : "Ask your Wingman..."}
                disabled={showPaywall || isTyping}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1 bg-white/5 border border-white/10 rounded-full py-1.5 px-4 outline-none focus:border-primary/40 focus:bg-white/10 transition text-xs text-white placeholder-white/30 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={showPaywall || isTyping || !input.trim()}
                className="w-8 h-8 rounded-full bg-primary text-black flex items-center justify-center transition hover:shadow-[0_0_10px_rgba(102,252,241,0.5)] disabled:opacity-50 shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Icon-Only Agent Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        aria-label="Ask SECCIØN Agent"
        title="Ask SECCIØN Agent"
        className={`w-13 h-13 sm:w-14 sm:h-14 rounded-full flex items-center justify-center text-black shadow-xl relative border transition-all duration-300 ${
          isOpen
            ? 'bg-white border-white text-black shadow-[0_0_20px_rgba(255,255,255,0.5)]'
            : 'bg-gradient-to-br from-[#00fbfb] via-purple-500 to-[#ec4899] border-white/20 shadow-[0_0_25px_rgba(0,251,251,0.5)]'
        }`}
      >
        {isOpen ? (
          <X className="w-6 h-6 text-black" />
        ) : (
          <div className="relative flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-black fill-black" />
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-pink-500"></span>
            </span>
          </div>
        )}
      </motion.button>
    </div>
  );
}
