'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Send, Bot, AlertCircle, Loader2, MessageSquare } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useTranslation } from '@/context/LanguageContext';

interface Message {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  timestamp: Date;
}

export default function SeccionAgentBubble() {
  const pathname = usePathname();
  const { locale, t } = useTranslation();

  const [isOpen, setIsOpen] = useState(false);
  const [isMemberLoggedIn, setIsMemberLoggedIn] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    setMessages([
      {
        id: 'welcome',
        sender: 'agent',
        text: t('agent.welcome'),
        timestamp: new Date()
      }
    ]);
  }, [locale, t]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Check if a member is logged in — if a logged-in member is present, AIWingmanBubble takes over!
  useEffect(() => {
    async function checkUser() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();
        if (profile?.role === 'member') {
          setIsMemberLoggedIn(true);
        }
      }
    }
    checkUser();
  }, []);

  // Hide SECCION Agent if user is a logged-in member or on admin/auth routes
  if (
    isMemberLoggedIn ||
    pathname?.startsWith('/admin') ||
    pathname?.startsWith('/auth')
  ) {
    return null;
  }

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMessageText = input.trim();
    setInput('');
    setErrorText(null);

    // Add user message
    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: userMessageText,
      timestamp: new Date()
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    try {
      const response = await fetch('/api/v2/onboarding/specialist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessageText, locale }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Connection error. Please try again.');
      }

      const agentMsg: Message = {
        id: `agent-${Date.now()}`,
        sender: 'agent',
        text: data.reply || data.response || t('agent.fallback'),
        timestamp: new Date()
      };
      setMessages((prev) => [...prev, agentMsg]);

    } catch (err: any) {
      console.error(err);
      setErrorText(err.message || 'Connecting error. Please try again.');
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 sm:right-6 sm:bottom-6 z-[9990] font-sans">
      <AnimatePresence>
        {/* Expanded SECCION Agent Chat Box */}
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="fixed bottom-20 right-4 left-4 sm:left-auto sm:right-6 sm:bottom-20 z-[9995] w-auto sm:w-[370px] h-[480px] max-h-[78vh] bg-[#0A0A12]/95 border border-white/10 rounded-[2rem] shadow-[0_20px_60px_rgba(0,240,255,0.2)] flex flex-col overflow-hidden backdrop-blur-2xl"
          >
            {/* Header */}
            <header className="p-4 border-b border-white/10 bg-gradient-to-r from-[#00fbfb]/10 via-purple-950/20 to-[#ec4899]/10 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#00fbfb] to-[#ec4899] p-[1.5px] shadow-[0_0_15px_rgba(0,251,251,0.4)]">
                  <div className="w-full h-full bg-black rounded-full flex items-center justify-center">
                    <Bot className="w-5 h-5 text-[#00fbfb]" />
                  </div>
                </div>
                <div className="text-left">
                  <h3 className="text-xs font-black uppercase tracking-widest text-white flex items-center gap-1.5">
                    Steve <Sparkles className="w-3 h-3 text-[#00fbfb]" />
                  </h3>
                  <span className="text-[9px] font-mono font-bold text-[#00fbfb] uppercase tracking-wider block">
                    SECCION Agent & Guide
                  </span>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/70 hover:text-white transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </header>

            {/* Message List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-white/10">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-[#00fbfb] text-black font-medium rounded-tr-none'
                        : 'bg-white/5 border border-white/10 text-white/90 rounded-tl-none'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white/5 border border-white/10 text-white/60 rounded-2xl p-3 text-xs rounded-tl-none flex items-center gap-2">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-[#00fbfb]" />
                    <span>{t('agent.thinking')}</span>
                  </div>
                </div>
              )}

              {errorText && (
                <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-[11px]">
                  {errorText}
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <form onSubmit={handleSend} className="p-3 border-t border-white/10 bg-black/40 shrink-0">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder={t('agent.placeholder')}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="flex-1 bg-white/[0.04] border border-white/10 rounded-xl py-2 px-4 outline-none focus:border-[#00fbfb]/50 focus:bg-white/[0.08] transition text-xs text-white placeholder-white/30"
                />
                <button
                  type="submit"
                  disabled={isTyping || !input.trim()}
                  className="w-9 h-9 rounded-xl bg-[#00fbfb] text-black flex items-center justify-center transition hover:shadow-[0_0_15px_rgba(0,251,251,0.5)] disabled:opacity-40 shrink-0 cursor-pointer"
                  aria-label="Send message"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Icon-Only Agent Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        aria-label="Ask SECCION Agent"
        title="Ask SECCION Agent"
        className={`w-13 h-13 sm:w-14 sm:h-14 rounded-full flex items-center justify-center text-black shadow-xl relative border transition-all duration-300 cursor-pointer ${
          isOpen
            ? 'bg-white border-white text-black shadow-[0_0_20px_rgba(255,255,255,0.5)]'
            : 'bg-gradient-to-br from-[#00fbfb] via-purple-500 to-[#ec4899] border-white/20 shadow-[0_0_25px_rgba(0,251,251,0.5)]'
        }`}
      >
        {isOpen ? (
          <X className="w-6 h-6 text-black" />
        ) : (
          <div className="relative flex items-center justify-center">
            <MessageSquare className="w-6 h-6 text-black fill-black" />
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
