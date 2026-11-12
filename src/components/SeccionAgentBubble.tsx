'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Send, Loader2, MessageSquare, Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
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
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Play text-to-speech voice response
  const speakText = useCallback(
    (textToSpeak: string, forceVoice: boolean = false) => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
        return;
      }
      if (!voiceEnabled && !forceVoice) {
        return;
      }
      try {
        window.speechSynthesis.cancel();
        // If vocal was requested, ensure voiceEnabled stays on
        if (forceVoice && !voiceEnabled) {
          setVoiceEnabled(true);
        }

        // Crucial pronunciation filter: SECCION is spelled SECCION in text, but phonetically pronounced "Session"
        // Replace SECCION/Seccion with Session in spoken audio so speech synthesis never says "Section"
        const phoneticText = textToSpeak.replace(/\bSECCION\b/gi, 'Session');
        const cleanText = phoneticText.replace(/[#*_`]/g, '').slice(0, 300);
        const utterance = new SpeechSynthesisUtterance(cleanText);

        const searchParams = new URLSearchParams(window.location.search);
        const langParam = searchParams.get('lang')?.toLowerCase();
        const isMorocco = searchParams.get('ref') === 'morocco' || searchParams.get('country') === 'ma';

        if (isMorocco && (langParam === 'darija' || langParam === 'ar')) {
          utterance.lang = 'ar-MA';
        } else if (isMorocco || locale === 'fr' || langParam === 'fr') {
          utterance.lang = 'fr-FR';
        } else if (locale === 'es') {
          utterance.lang = 'es-ES';
        } else {
          utterance.lang = 'en-US';
        }

        // Configure Steve's voice strictly as a warm, authoritative MALE voice
        utterance.pitch = 0.9; // Lower pitch for clear masculine timbre
        utterance.rate = 1.0;

        // Select a male voice from the browser's available voice roster
        const voices = window.speechSynthesis.getVoices();
        if (voices.length > 0) {
          const maleVoice = voices.find((v) => {
            const name = v.name.toLowerCase();
            const langMatches = v.lang.startsWith(utterance.lang.slice(0, 2));
            const isMaleKeyword =
              name.includes('male') ||
              name.includes('david') ||
              name.includes('george') ||
              name.includes('thomas') ||
              name.includes('antoine') ||
              name.includes('paul') ||
              name.includes('nicolas') ||
              name.includes('tarik') ||
              name.includes('jamal') ||
              name.includes('guy') ||
              name.includes('henri');
            return langMatches && isMaleKeyword;
          }) || voices.find((v) => v.lang.startsWith(utterance.lang.slice(0, 2)));

          if (maleVoice) {
            utterance.voice = maleVoice;
          }
        }
        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);

        // Resume speech synthesis queue if paused by mobile browser
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }

        window.speechSynthesis.speak(utterance);
      } catch (e) {
        console.error('Speech synthesis error:', e);
      }
    },
    [voiceEnabled, locale]
  );

  const sendQuestion = useCallback(
    async (questionText: string, isVocalInput: boolean = false) => {
      const trimmed = questionText.trim();
      if (!trimmed) return;

      setErrorText(null);
      const userMsg: Message = {
        id: `user-${Date.now()}`,
        sender: 'user',
        text: trimmed,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMsg]);
      setIsTyping(true);

      try {
        let activeLocale: string = locale;
        if (typeof window !== 'undefined') {
          const searchParams = new URLSearchParams(window.location.search);
          const langParam = searchParams.get('lang')?.toLowerCase();
          const isMorocco = searchParams.get('ref') === 'morocco' || searchParams.get('country') === 'ma';
          if (isMorocco && (langParam === 'darija' || langParam === 'ar')) {
            activeLocale = 'ar';
          } else if (isMorocco && langParam === 'fr') {
            activeLocale = 'fr';
          } else if (isMorocco && langParam === 'en') {
            activeLocale = 'en';
          } else if (langParam) {
            activeLocale = langParam;
          }
        }

        const response = await fetch('/api/v2/onboarding/specialist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: trimmed, locale: activeLocale }),
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Connection error. Please try again.');
        }

        const replyText = data.reply || data.response || t('agent.fallback');
        const agentMsg: Message = {
          id: `agent-${Date.now()}`,
          sender: 'agent',
          text: replyText,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, agentMsg]);

        // CRITICAL INVARIANT: If the creator spoke aloud, Steve MUST reply with vocal audio!
        speakText(replyText, isVocalInput);
      } catch (err: any) {
        console.error(err);
        setErrorText(err.message || 'Connecting error. Please try again.');
      } finally {
        setIsTyping(false);
      }
    },
    [locale, t, speakText]
  );

  // Toggle Voice Dictation (Microphone input)
  const toggleSpeechRecognition = useCallback(() => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setErrorText('Voice input is not supported in this browser. Please type your question.');
      return;
    }

    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;

      const searchParams = new URLSearchParams(window.location.search);
      const langParam = searchParams.get('lang')?.toLowerCase();
      const isMorocco = searchParams.get('ref') === 'morocco' || searchParams.get('country') === 'ma';

      if (isMorocco && (langParam === 'darija' || langParam === 'ar')) {
        recognition.lang = 'ar-MA';
      } else if (isMorocco || locale === 'fr' || langParam === 'fr') {
        recognition.lang = 'fr-FR';
      } else if (locale === 'es') {
        recognition.lang = 'es-ES';
      } else {
        recognition.lang = 'en-US';
      }

      recognition.onstart = () => {
        setIsListening(true);
        setErrorText(null);
        setVoiceEnabled(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInput(transcript);
          setIsListening(false);
          sendQuestion(transcript, true);
        }
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event);
        setIsListening(false);
        if (event.error !== 'no-speech') {
          setErrorText('Microphone permission or network error. Please try again or type.');
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      console.error(err);
      setIsListening(false);
      setErrorText('Could not access microphone.');
    }
  }, [isListening, locale, sendQuestion]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      const isComplianceReviewer = searchParams.get('reviewer') === 'compliance' || searchParams.get('reviewer') === 'underwriting';
      const isMoroccoCreator =
        searchParams.get('ref') === 'morocco' ||
        searchParams.get('country') === 'ma' ||
        searchParams.get('source') === 'morocco';
      const isCreatorGuide =
        searchParams.get('guide') === 'creator' ||
        searchParams.get('ref') === 'creator' ||
        (searchParams.get('role') === 'creator' && searchParams.get('help') === 'steve');

      if (isMoroccoCreator) {
        setIsOpen(true);
        const langParam = searchParams.get('lang')?.toLowerCase();
        let moroccoGreeting = "Marhaba ! 👋 Je suis Steve, votre conseiller SECCION pour le Maroc. Bienvenue dans notre phase d'accès anticipé ! Vous pouvez dès maintenant créer votre profil, explorer le Creator Studio et préparer votre bio avec moi. Profitez de notre bouclier de confidentialité (blocage du Maroc 'MA' en 1 clic pour être totalement invisible au pays) et de notre modèle à 90 % net. Les comptes bancaires de paiement sont en cours de finalisation et vous serez notifié(e) dès leur ouverture officielle. Comment puis-je vous aider à configurer votre studio aujourd'hui ?";

        if (langParam === 'darija' || langParam === 'ar') {
          moroccoGreeting = "Marhba bik! 👋 Ana Steve, lmosa3id dyalek f SECCION. Merhba bik f l-marhala dyal l-accès anticipé! T9der men daba t-9ad l-profil dyalek, t-chouf les outils dyal Creator Studio w t-kteb l-bio dyalek m3aya. Ghadi t-stafed men l-privacy l-kamla (t-bloqui l-Maghrib 'MA' f d9i9a bach matban l-hta wahed hna) w l-90% net. Les comptes bancaires f طور الإعداد w ghadi n-3elmouk f l-wa9t li ykouno wajdin. Bghiti n-bdaou n-9ado l-profil dyalek daba?";
        } else if (langParam === 'en') {
          moroccoGreeting = "Marhaba & Welcome! 👋 I'm Steve, your dedicated SECCION Creator Coach for Morocco. Welcome to our early access phase! You can already register your creator profile, explore the Creator Studio tools, and craft your bio with me. Enjoy our 5-Layer Privacy Shield (1-click 'MA' domestic geo-blocking) and 90% net revenue split. Direct payout rails are currently being finalized and you will be notified immediately upon full launch. What would you like to set up first?";
        }

        setMessages([
          {
            id: 'morocco-creator-welcome',
            sender: 'agent',
            text: moroccoGreeting,
            timestamp: new Date(),
          },
        ]);
        return;
      }

      if (isComplianceReviewer) {
        setIsOpen(true);
        setMessages([
          {
            id: 'compliance-welcome',
            sender: 'agent',
            text: "Welcome Institutional Underwriting & Compliance Team! 👋 I'm Steve, SECCION's Onboarding & Compliance Specialist. Feel free to ask me anything regarding our Two-Stage SFW vs. NSFW Sightengine AI gate, DIDIT Zero-Knowledge KYC verification, 18 U.S.C. 2257 record-keeping, smart-contract escrow protection, terms of service, or refund protocols.",
            timestamp: new Date(),
          },
        ]);
        return;
      }

      if (isCreatorGuide) {
        setIsOpen(true);
        setMessages([
          {
            id: 'creator-guide-welcome',
            sender: 'agent',
            text:
              locale === 'es'
                ? '¡Hola Creadora / Creador! 🌟 Soy Steve, tu Asesor de Onboarding y Monetización en SECCION. Estoy aquí para guiarte paso a paso: desde tu verificación KYC segura y configuración del Creator Studio, hasta cómo activar tus suscripciones VIP, pases Master (80% revenue pool), transmisiones en vivo y herramientas de IA. ¿Tienes alguna pregunta para empezar?'
                : "Hey Creator! 🌟 I'm Steve, your dedicated Creator Onboarding & Monetization Coach on SECCION. I'm here to guide you through every step: from your private biometric KYC verification and Creator Studio setup, to activating VIP tiers, Master Platform Passes (80% pool redistribution), live broadcasts, and AI growth tools. What can I help you with first?",
            timestamp: new Date(),
          },
        ]);
        return;
      }
    }

    setMessages([
      {
        id: 'welcome',
        sender: 'agent',
        text: t('agent.welcome'),
        timestamp: new Date(),
      },
    ]);
  }, [locale, t]);

  // Listen for custom "seccion:ask-steve" events from Creator Studio / Onboarding Checklist
  useEffect(() => {
    const handleAskSteve = (event: Event) => {
      const customEvent = event as CustomEvent<{ question?: string }>;
      setIsOpen(true);
      if (customEvent.detail?.question) {
        sendQuestion(customEvent.detail.question);
      }
    };

    window.addEventListener('seccion:ask-steve', handleAskSteve);
    return () => {
      window.removeEventListener('seccion:ask-steve', handleAskSteve);
    };
  }, [sendQuestion]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Check if a member is logged in — if a logged-in member is present on member pages, AIWingmanBubble takes over!
  useEffect(() => {
    async function checkUser() {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();
        if (profile?.role === 'member') {
          setIsMemberLoggedIn(true);
        } else {
          setIsMemberLoggedIn(false);
        }
      }
    }
    checkUser();
  }, [pathname]);

  // Hide SECCION Agent if user is a logged-in member on non-studio/non-onboarding routes, or on admin/auth routes
  const isCreatorOrOnboardingRoute =
    pathname?.startsWith('/studio') ||
    pathname?.startsWith('/onboarding') ||
    pathname?.startsWith('/become-creator') ||
    pathname?.startsWith('/login');

  if (
    (isMemberLoggedIn && !isCreatorOrOnboardingRoute) ||
    pathname?.startsWith('/admin') ||
    pathname?.startsWith('/auth')
  ) {
    return null;
  }

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;
    const text = input.trim();
    setInput('');
    await sendQuestion(text);
  };

  const quickQuestions =
    locale === 'es'
      ? [
          '¿Cómo activo mi cuenta de Creador y entro al Studio?',
          '¿Cómo configuro mis tarifas VIP, PPV y retiros (90%)?',
          '¿Cómo funciona la verificación KYC de 60 segundos?',
        ]
      : [
          'How do I activate my Creator account and enter Studio?',
          'How should I price my VIP pass, PPV & set up 90% payouts?',
          'How does the 60-second private KYC verification work?',
        ];

  return (
    <div className="fixed bottom-[calc(4.75rem+env(safe-area-inset-bottom,0px))] right-4 md:bottom-6 md:right-6 z-[9990] font-sans">
      <AnimatePresence>
        {/* Expanded SECCION Agent Chat Box */}
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="fixed bottom-[calc(8.75rem+env(safe-area-inset-bottom,0px))] right-4 left-4 sm:left-auto sm:right-6 sm:bottom-24 z-[9995] w-auto sm:w-[370px] h-[480px] max-h-[70vh] bg-[#0A0A12]/95 border border-white/10 rounded-[2rem] shadow-[0_20px_60px_rgba(0,240,255,0.2)] flex flex-col overflow-hidden backdrop-blur-2xl"
          >
            {/* Header */}
            <header className="p-4 border-b border-white/10 bg-gradient-to-r from-[#00fbfb]/10 via-purple-950/20 to-[#ec4899]/10 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#00fbfb] to-[#ec4899] p-[1.5px] shadow-[0_0_15px_rgba(0,251,251,0.4)] overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&h=150&q=80"
                    alt="Steve"
                    className="w-full h-full object-cover rounded-full"
                  />
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

              {messages.length <= 1 && !isTyping && (
                <div className="pt-2 space-y-1.5">
                  <span className="text-[9px] font-mono uppercase tracking-wider text-white/40 block px-1">
                    {locale === 'es' ? 'Preguntas frecuentes:' : 'Quick questions:'}
                  </span>
                  {quickQuestions.map((q, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => sendQuestion(q)}
                      className="w-full text-left px-3 py-2 rounded-xl bg-white/[0.04] hover:bg-[#00fbfb]/15 border border-white/10 hover:border-[#00fbfb]/40 text-[11px] text-white/80 hover:text-white transition cursor-pointer"
                    >
                      💬 {q}
                    </button>
                  ))}
                </div>
              )}

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

            {/* Input Form with Voice Dictation & Audio Readout */}
            <form onSubmit={handleSend} className="p-3 border-t border-white/10 bg-black/40 shrink-0">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={toggleSpeechRecognition}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center transition border shrink-0 cursor-pointer ${
                    isListening
                      ? 'bg-rose-500/20 border-rose-500 text-rose-400 animate-pulse'
                      : 'bg-white/[0.04] border-white/10 text-white/70 hover:text-[#00fbfb] hover:border-[#00fbfb]/40'
                  }`}
                  aria-label="Speak to Steve (Voice Dictation)"
                  title={isListening ? "Listening... (click to stop)" : "Speak to Steve"}
                >
                  {isListening ? <MicOff className="w-4 h-4 text-rose-400" /> : <Mic className="w-4 h-4" />}
                </button>

                <input
                  type="text"
                  placeholder={isListening ? "Listening... speak now" : t('agent.placeholder')}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="flex-1 bg-white/[0.04] border border-white/10 rounded-xl py-2 px-3 outline-none focus:border-[#00fbfb]/50 focus:bg-white/[0.08] transition text-xs text-white placeholder-white/30"
                />

                <button
                  type="button"
                  onClick={() => {
                    if (isSpeaking) {
                      window.speechSynthesis?.cancel();
                      setIsSpeaking(false);
                    } else {
                      setVoiceEnabled(!voiceEnabled);
                    }
                  }}
                  className={`w-8 h-8 rounded-xl flex items-center justify-center transition shrink-0 cursor-pointer ${
                    voiceEnabled
                      ? 'text-[#00fbfb] hover:bg-[#00fbfb]/10'
                      : 'text-white/30 hover:text-white/60'
                  }`}
                  aria-label="Toggle voice output"
                  title={voiceEnabled ? "Voice response enabled (Click to mute)" : "Voice response muted"}
                >
                  {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </button>

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
