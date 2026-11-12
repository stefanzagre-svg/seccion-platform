'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Send, Loader2, MessageSquare, Mic, MicOff, Volume2, VolumeX, RefreshCw } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useTranslation, SupportedLocale } from '@/context/LanguageContext';
import { prepareSpeechText } from '@/lib/kate-specialist';

interface Message {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  timestamp: Date;
}

interface QuestionCategory {
  starter: string[];
  payouts: string[];
  privacy: string[];
  studio: string[];
  general: string[];
}

const QUESTIONS_BANK: Record<'fr' | 'es' | 'en' | 'ar', QuestionCategory> = {
  fr: {
    starter: [
      'Comment activer mon compte Créateur & Studio ?',
      'Comment fonctionne le modèle à 90 % net ?',
      'Comment fonctionne la vérification KYC privée en 60s ?',
    ],
    payouts: [
      'Quels sont les moyens de retrait (USDT, virement bancaire) ?',
      "Y a-t-il des frais cachés ou commissions d'agence ?",
      "Comment fonctionne l'autofacturation B2B légale ?",
      'Puis-je retirer mes gains vers un compte au Maroc (RIB) ?',
    ],
    privacy: [
      "Comment activer le blocage Maroc 'MA' en 1 clic ?",
      "C'est quoi le flou facial progressif et le DRM forensique ?",
      'Est-ce que mes proches ou collègues peuvent voir mon profil ?',
      'Comment fonctionne le protocole Zero-Knowledge de DIDIT ?',
    ],
    studio: [
      'Comment fixer les prix des abonnements VIP et des PPV ?',
      'Comment mon Copilot IA répond-il à ma place 24/7 ?',
      'Comment lancer un live stream interactif privé ?',
      "Quels sont les avantages d'un compte Fondateur Certifié ?",
    ],
    general: [
      'Quelle est la différence entre SECCION et OnlyFans ?',
      'Comment fonctionne le matchmaking IA par affinités ?',
      'Comment obtenir mes premiers abonnés et commandes privées ?',
    ],
  },
  es: {
    starter: [
      '¿Cómo activo mi cuenta de Creador y entro al Studio?',
      '¿Cómo configuro mis tarifas VIP, PPV y retiros (90%)?',
      '¿Cómo funciona la verificación KYC privada de 60 segundos?',
    ],
    payouts: [
      '¿Cuáles son los métodos de retiro (USDT Polygon, Binance, banco)?',
      '¿Hay comisiones ocultas o contratos perpetuos de agencia?',
      '¿Cómo funciona la autofacturación digital B2B para creadores?',
      '¿Puedo cobrar en dólares digitales sin retención de impuestos?',
    ],
    privacy: [
      '¿Cómo activo el bloqueo geográfico por país en 1 clic?',
      '¿Qué es el desenfoque facial progresivo y marcas de agua DRM?',
      '¿Mis contactos o familiares pueden ver mi cuenta?',
      '¿Cómo protege DIDIT mi identidad con Zero-Knowledge Proofs?',
    ],
    studio: [
      '¿Cómo fijar los precios de mis pases VIP y mensajes de pago?',
      '¿Cómo me ayuda el Copilot IA a responder mensajes 24/7?',
      '¿Cómo iniciar una transmisión en vivo privada con propinas?',
      '¿Qué ventajas tiene el estatus de Creador Fundador?',
    ],
    general: [
      '¿En qué se diferencia SECCION de OnlyFans o Fansly?',
      '¿Cómo funciona el matchmaking algorítmico por química?',
      '¿Cómo conseguir mis primeros patrocinadores y miembros VIP?',
    ],
  },
  en: {
    starter: [
      'How do I activate my Creator account and enter Studio?',
      'How should I price my VIP pass, PPV & set up 90% payouts?',
      'How does the 60-second private KYC verification work?',
    ],
    payouts: [
      'What payout rails are supported (USDT, USDC, bank wire)?',
      'Are there any hidden agency cuts or perpetual contracts?',
      'How does automated B2B self-billing work for creators?',
      'Can I cash out instantly to crypto wallets or local accounts?',
    ],
    privacy: [
      'How does 1-click domestic geo-blocking work?',
      'What is progressive face-blur and dynamic canvas DRM?',
      'Can people in my home city or country discover my profile?',
      'How does DIDIT Zero-Knowledge proof protect my real ID?',
    ],
    studio: [
      'How should I price my VIP memberships and PPV vault?',
      'How does my 24/7 AI Copilot handle messages without bot slop?',
      'How do I host private interactive live broadcasts?',
      'What are the exclusive perks of the Founding Creator tier?',
    ],
    general: [
      'How does SECCION compare to OnlyFans and Patreon?',
      'How does the synergy matchmaking engine find genuine fans?',
      'How do I get my first high-ticket custom content orders?',
    ],
  },
  ar: {
    starter: [
      'Kifash n-9ad l-compte dyali w n-dkhol l-Studio?',
      'Kifash n-stafed men 90% net w n-bloquer l-Maroc?',
      'Kifash kheddam l-KYC biometrique f 60 seconde?',
    ],
    payouts: [
      'Kifash n-jbed l-flous dyali (USDT, Binance P2P, Paxum)?',
      'Wach kaynin chi kti6a3at mkhabyin dyal l-agences?',
      'Kifash n-hawel l-flous direct l-compte CIH / Attijariwafa?',
      'Wach l-flous kay-woslo b dolardigital bla drayeb?',
    ],
    privacy: [
      "Kifash n-bloqui l-Maghrib 'MA' b clic wahed bach matban l-hta wahed?",
      'Chno houwa l-flou dyal l-wejh w l-DRM li kay-hmi les photos?',
      'Wach l-3a2ila wla shabi f l-Maghrib y9dro ychoufouni?',
      'Kifash Zero-Knowledge KYC kay-hmi la carte nationale dyali?',
    ],
    studio: [
      'Kifash n-7aded taman dyal VIP Pass w les vidéos privés?',
      'Kifash l-AI Copilot kay-jaweb f blasti 24/7 bla ma n3ya?',
      'Kifash n-dir live stream interactif m3a les membres?',
      'Chno homa les avantages dyal Creador Fondateur?',
    ],
    general: [
      'Chno l-fer9 bin SECCION w OnlyFans?',
      'Kifash l-matchmaking algorithmique kay-jib lia des vrais fans?',
      'Kifash n-jib awel abonnements VIP f la plateforme?',
    ],
  },
};

// Deterministic initial language resolution prioritizing app locale
function resolveInitialLang(appLocale?: string): 'fr' | 'es' | 'en' | 'ar' {
  if (typeof window === 'undefined') {
    if (appLocale === 'es' || appLocale === 'en' || appLocale === 'fr') return appLocale;
    return 'fr';
  }
  try {
    const searchParams = new URLSearchParams(window.location.search);
    const langParam = searchParams.get('lang')?.toLowerCase();
    if (langParam === 'darija' || langParam === 'ar') return 'ar';
    if (langParam === 'fr') return 'fr';
    if (langParam === 'es') return 'es';
    if (langParam === 'en') return 'en';
    if (searchParams.get('ref') === 'morocco' || searchParams.get('country') === 'ma') return 'fr';

    // 1. App-wide locale stored in localStorage
    const savedAppLocale = localStorage.getItem('seccion_user_locale')?.toLowerCase();
    if (savedAppLocale === 'fr' || savedAppLocale === 'es' || savedAppLocale === 'en') {
      return savedAppLocale;
    }

    // 2. React Context locale
    if (appLocale === 'es' || appLocale === 'en' || appLocale === 'fr') {
      return appLocale;
    }

    // 3. Document HTML lang
    const docLang = document.documentElement.getAttribute('lang')?.toLowerCase();
    if (docLang?.startsWith('fr')) return 'fr';
    if (docLang?.startsWith('es')) return 'es';
    if (docLang?.startsWith('en')) return 'en';

    // 4. Device / navigator language
    const navLang = (navigator.language || (navigator as any).userLanguage || '').toLowerCase();
    if (navLang.startsWith('fr')) return 'fr';
    if (navLang.startsWith('es')) return 'es';
    if (navLang.startsWith('ar')) return 'ar';

    // 5. Explicitly saved agent preference
    const savedAgent = localStorage.getItem('seccion_agent_lang')?.toLowerCase();
    if (savedAgent === 'fr' || savedAgent === 'es' || savedAgent === 'en' || savedAgent === 'ar') {
      return savedAgent as any;
    }
  } catch (e) {}
  return 'fr';
}

export default function SeccionAgentBubble() {
  const pathname = usePathname();
  const { locale, setLocale, t } = useTranslation();

  const [isOpen, setIsOpen] = useState(false);
  const [isMemberLoggedIn, setIsMemberLoggedIn] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [askedQuestions, setAskedQuestions] = useState<string[]>([]);
  const [suggestionOffset, setSuggestionOffset] = useState<number>(0);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [activeAgentLang, setActiveAgentLang] = useState<'fr' | 'es' | 'en' | 'ar'>('fr');
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const currentAudioUrlRef = useRef<string | null>(null);
  const ttsAbortRef = useRef<AbortController | null>(null);
  const specialistAbortRef = useRef<AbortController | null>(null);
  const speakSeqRef = useRef<number>(0);
  const isRequestInFlightRef = useRef<boolean>(false);
  const lastDispatchedRef = useRef<{ text: string; at: number } | null>(null);
  const userSelectedLangRef = useRef<boolean>(false);
  const hasSeededWelcomeRef = useRef<boolean>(false);
  const messagesRef = useRef<Message[]>([]);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  const getLocalizedGreeting = useCallback((lang: 'fr' | 'es' | 'en' | 'ar'): string => {
    if (lang === 'fr') {
      return "Bonjour ! Je suis Kate, votre conseillère et guide sur SECCION 🔮 Posez-moi vos questions sur la plateforme, les créateurs ou vos matches !";
    }
    if (lang === 'es') {
      return "¡Hola! Soy Kate, tu asesora y guía de SECCION 🔮 Pregúntame sobre nuestra plataforma híbrida (Dating + Live Streaming + Creadores), compatibilidad de química o cómo comenzar tu quest.";
    }
    if (lang === 'ar') {
      return "Marhba bik! 👋 Ana Kate, lmosa3ida dyalek f SECCION 🔮 Sewwelni 3la la plateforme, les créateurs, wla kifash t-bda l-quest dyalek!";
    }
    return "Hi! I'm Kate, your SECCION executive guide 🔮 Ask me about our hybrid platform (Dating + Live Streaming + Creators), chemistry matchmaking, or how to begin your quest.";
  }, []);

  // Stop all active audio streams (both neural ElevenLabs and fallback Web Speech) and invalidate pending fetches
  const stopAllAudio = useCallback(() => {
    speakSeqRef.current += 1;
    if (ttsAbortRef.current) {
      ttsAbortRef.current.abort();
      ttsAbortRef.current = null;
    }
    if (audioPlayerRef.current) {
      audioPlayerRef.current.onplay = null;
      audioPlayerRef.current.onended = null;
      audioPlayerRef.current.onerror = null;
      audioPlayerRef.current.pause();
      audioPlayerRef.current.currentTime = 0;
      audioPlayerRef.current = null;
    }
    if (currentAudioUrlRef.current) {
      URL.revokeObjectURL(currentAudioUrlRef.current);
      currentAudioUrlRef.current = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  }, []);

  // Synchronously prime audio playback inside user gestures (iOS Safari / in-app WebView resilience)
  const unlockAudioPlayback = useCallback(() => {
    if (typeof window === 'undefined') return;
    try {
      const AudioCtx = (window as any).AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        if (ctx.state === 'suspended') {
          ctx.resume().catch(() => {});
        }
        setTimeout(() => {
          ctx.close().catch(() => {});
        }, 300);
      }
    } catch {}
  }, []);

  useEffect(() => {
    return () => {
      stopAllAudio();
      if (specialistAbortRef.current) {
        specialistAbortRef.current.abort();
        specialistAbortRef.current = null;
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }
    };
  }, [stopAllAudio]);

  // Pre-load and cache voices eagerly to fix mobile Safari/Chrome empty voice roster bug
  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    const syncVoices = () => {
      const v = window.speechSynthesis.getVoices();
      if (v && v.length > 0) {
        setAvailableVoices(v);
      }
    };

    syncVoices();
    window.speechSynthesis.onvoiceschanged = syncVoices;

    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, []);

  // Synchronize language preference with app locale only when the user has not locked/picked a language
  useEffect(() => {
    if (userSelectedLangRef.current) return;
    const resolved = resolveInitialLang(locale);
    setActiveAgentLang(resolved);
  }, [locale]);

  // Language pill selector in header
  const handleSelectLang = (newLang: 'fr' | 'es' | 'en' | 'ar') => {
    userSelectedLangRef.current = true;
    stopAllAudio();
    setActiveAgentLang(newLang);
    setSuggestionOffset(0);
    setAskedQuestions([]); // Fresh suite of questions in new language

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('seccion_agent_lang', newLang);
        if (newLang === 'fr' || newLang === 'es' || newLang === 'en') {
          localStorage.setItem('seccion_user_locale', newLang);
          document.cookie = `seccion_user_locale=${newLang}; path=/; max-age=31536000; SameSite=Lax`;
          document.documentElement.setAttribute('lang', newLang);
          setLocale(newLang as SupportedLocale);
        }
      } catch (e) {}
    }

    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    // Immediately update greeting or add inline notification
    setMessages((prev) => {
      if (prev.length <= 1) {
        return [
          {
            id: `welcome-${newLang}`,
            sender: 'agent',
            text: getLocalizedGreeting(newLang),
            timestamp: new Date(),
          },
        ];
      }
      const notices: Record<'fr' | 'es' | 'en' | 'ar', string> = {
        fr: "Langue basculée en Français 🇫🇷 Comment puis-je vous aider ?",
        es: "Idioma cambiado a Español 🇪🇸 ¿En qué puedo ayudarte ahora?",
        en: "Switched to English 🇬🇧 How can I assist you now?",
        ar: "T-bdel l-lougha l Darija 🇲🇦 Kifash n-9der n-3awnek daba?",
      };
      return [
        ...prev,
        {
          id: `lang-switch-${Date.now()}`,
          sender: 'agent',
          text: notices[newLang],
          timestamp: new Date(),
        },
      ];
    });
  };

  // Fallback Web Speech API synthesis
  const fallbackWebSpeech = useCallback(
    (cleanText: string, overrideLang?: string) => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
        setIsSpeaking(false);
        return;
      }
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(cleanText);

        let targetVoiceLang = overrideLang;
        if (!targetVoiceLang) {
          if (/[\u0600-\u06FF]/.test(cleanText)) {
            targetVoiceLang = 'ar-MA';
          } else if (/\b(bonjour|salut|bienvenue|vous|nous|votre|avec|dans|pour|comment|merci|suis|est|plateforme|créateur|profil|argent|retirer)\b/i.test(cleanText)) {
            targetVoiceLang = 'fr-FR';
          } else if (/\b(hola|bienvenido|creador|perfil|estás|gracias|cuenta|plata)\b/i.test(cleanText)) {
            targetVoiceLang = 'es-ES';
          } else if (/\b(hello|welcome|creator|profile|what|how|thank)\b/i.test(cleanText)) {
            targetVoiceLang = 'en-US';
          } else if (activeAgentLang === 'fr') {
            targetVoiceLang = 'fr-FR';
          } else if (activeAgentLang === 'ar') {
            targetVoiceLang = 'ar-MA';
          } else if (activeAgentLang === 'es') {
            targetVoiceLang = 'es-ES';
          } else {
            targetVoiceLang = 'en-US';
          }
        }
        utterance.lang = targetVoiceLang;
        utterance.pitch = 1.0;
        utterance.rate = 1.0;

        const voices = availableVoices.length > 0 ? availableVoices : window.speechSynthesis.getVoices();
        if (voices.length > 0) {
          const langCode = utterance.lang.slice(0, 2).toLowerCase();
          const matchingLangVoices = voices.filter((v) => v.lang.toLowerCase().startsWith(langCode));

          const femaleKeywords = [
            'female', 'femme', 'mujer', 'woman', 'girl',
            'kate', 'amelie', 'amélie', 'aurelie', 'aurélie', 'marie', 'claire', 'hortense', 'julie', 'celine', 'céline', 'alice', 'charlotte', 'virginie',
            'monica', 'mónica', 'paulina', 'helena', 'laura', 'sofia', 'sofía', 'marta', 'rosa', 'conchita', 'lucia', 'lucía', 'carmen',
            'samantha', 'karen', 'victoria', 'moira', 'fiona', 'tessa', 'susan', 'zira', 'linda', 'jenny', 'heather', 'ava',
            'mariam', 'laila', 'salma', 'zeina', 'audrey', 'sarah', 'emma'
          ];
          const maleKeywords = [
            'male', 'homme', 'hombre', 'man', 'boy',
            'thomas', 'nicolas', 'paul', 'antoine', 'sebastien', 'sébastien', 'henri', 'claude', 'bernard', 'guy', 'mathieu', 'pierre', 'louis',
            'jorge', 'diego', 'carlos', 'enrique', 'pablo', 'alvaro', 'álvaro', 'mateo', 'miguel', 'javier', 'manuel',
            'david', 'george', 'daniel', 'arthur', 'mark', 'fred', 'aaron', 'oliver', 'alex', 'james', 'brian',
            'tarik', 'tarek', 'jamal', 'maged', 'majed', 'naayf', 'hamed', 'omar', 'karim'
          ];

          let femaleVoice = matchingLangVoices.find((v) => {
            const name = v.name.toLowerCase();
            return femaleKeywords.some((f) => name.includes(f)) && !maleKeywords.some((m) => name.includes(m));
          });
          if (!femaleVoice) {
            femaleVoice = matchingLangVoices.find((v) => {
              const name = v.name.toLowerCase();
              return !maleKeywords.some((m) => name.includes(m));
            });
          }
          if (!femaleVoice) {
            femaleVoice = voices.find((v) => {
              const name = v.name.toLowerCase();
              return femaleKeywords.some((f) => name.includes(f)) && !maleKeywords.some((m) => name.includes(m));
            });
          }
          if (femaleVoice) {
            utterance.voice = femaleVoice;
          }
        }

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);

        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }
        window.speechSynthesis.speak(utterance);
      } catch (e) {
        console.error('Fallback speech synthesis error:', e);
        setIsSpeaking(false);
      }
    },
    [activeAgentLang, availableVoices]
  );

  // Play text-to-speech voice response (ElevenLabs Neural Studio Audio with Web Speech fallback)
  const speakText = useCallback(
    async (textToSpeak: string, forceVoice: boolean = false, overrideLang?: string) => {
      if (typeof window === 'undefined') return;
      if (!voiceEnabled && !forceVoice) return;

      stopAllAudio();
      const requestSeq = speakSeqRef.current;
      if (forceVoice && !voiceEnabled) {
        setVoiceEnabled(true);
      }

      const cleanText = prepareSpeechText(textToSpeak, 380);
      if (!cleanText) return;

      const controller = new AbortController();
      ttsAbortRef.current = controller;

      // 1. PRIMARY ENGINE: Stream studio-grade ElevenLabs neural voice
      try {
        setIsSpeaking(true);
        const res = await fetch('/api/v2/voice/speak', {
          method: 'POST',
          signal: controller.signal,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: cleanText }),
        });

        // Abort cleanly if user muted, interrupted, or triggered a newer message while TTS was loading
        if (speakSeqRef.current !== requestSeq) {
          return;
        }

        if (res.ok) {
          const blob = await res.blob();
          if (speakSeqRef.current !== requestSeq) {
            return;
          }
          const audioUrl = URL.createObjectURL(blob);
          currentAudioUrlRef.current = audioUrl;
          const audio = new Audio(audioUrl);
          audioPlayerRef.current = audio;

          const cleanupAudioUrl = () => {
            if (currentAudioUrlRef.current === audioUrl) {
              URL.revokeObjectURL(audioUrl);
              currentAudioUrlRef.current = null;
            }
          };

          audio.onplay = () => {
            if (speakSeqRef.current === requestSeq) {
              setIsSpeaking(true);
            }
          };
          audio.onended = () => {
            if (speakSeqRef.current === requestSeq) {
              setIsSpeaking(false);
            }
            cleanupAudioUrl();
            if (audioPlayerRef.current === audio) {
              audioPlayerRef.current = null;
            }
          };
          audio.onerror = () => {
            cleanupAudioUrl();
            if (audioPlayerRef.current === audio) {
              audioPlayerRef.current = null;
            }
            if (speakSeqRef.current === requestSeq) {
              setIsSpeaking(false);
              fallbackWebSpeech(cleanText, overrideLang);
            }
          };

          await audio.play();
          return;
        }
      } catch (neuralErr: any) {
        if (neuralErr?.name === 'AbortError' || speakSeqRef.current !== requestSeq) {
          return;
        }
        console.warn('[Voice Engine] ElevenLabs stream error, falling back to Web Speech:', neuralErr);
      } finally {
        if (ttsAbortRef.current === controller) {
          ttsAbortRef.current = null;
        }
      }

      if (speakSeqRef.current !== requestSeq) {
        setIsSpeaking(false);
        return;
      }

      // 2. FALLBACK ENGINE: Browser Web Speech API
      fallbackWebSpeech(cleanText, overrideLang);
    },
    [voiceEnabled, stopAllAudio, fallbackWebSpeech]
  );

  const sendQuestion = useCallback(
    async (questionText: string, isVocalInput: boolean = false) => {
      const trimmed = questionText.trim();
      if (!trimmed) return;

      const now = Date.now();
      if (
        lastDispatchedRef.current &&
        lastDispatchedRef.current.text === trimmed &&
        now - lastDispatchedRef.current.at < 400
      ) {
        return;
      }
      if (isRequestInFlightRef.current) {
        return;
      }
      lastDispatchedRef.current = { text: trimmed, at: now };
      isRequestInFlightRef.current = true;

      setErrorText(null);
      setAskedQuestions((prev) => (prev.includes(trimmed) ? prev : [...prev, trimmed]));
      const recentHistory = messagesRef.current
        .filter((m) => !m.id.startsWith('welcome-') && !m.id.startsWith('lang-switch-'))
        .slice(-8)
        .map((m) => ({ sender: m.sender, text: m.text }));

      const userMsg: Message = {
        id: `user-${now}`,
        sender: 'user',
        text: trimmed,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMsg]);
      setIsTyping(true);

      const controller = new AbortController();
      specialistAbortRef.current = controller;

      try {
        const response = await fetch('/api/v2/onboarding/specialist', {
          method: 'POST',
          signal: controller.signal,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: trimmed,
            locale: activeAgentLang,
            history: recentHistory,
          }),
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Connection error. Please try again.');
        }

        const fallbackCopy =
          activeAgentLang === 'fr'
            ? "Je suis là pour vous aider sur SECCION ! Pouvez-vous préciser votre question ?"
            : activeAgentLang === 'es'
              ? "¡Estoy aquí para ayudarte en SECCION! ¿Podrías darme un poco más de detalle?"
              : activeAgentLang === 'ar'
                ? "Ana hna bach n-3awnek f SECCION! T9der t-wda7 lia ktar?"
                : "I'm here to help you with SECCION! Could you share a bit more detail?";
        const replyText = data.reply || data.response || fallbackCopy;
        const rawDetected = data.detectedLanguage === 'darija' ? 'ar' : data.detectedLanguage;
        const detected =
          rawDetected && ['fr', 'es', 'en', 'ar'].includes(rawDetected)
            ? (rawDetected as 'fr' | 'es' | 'en' | 'ar')
            : undefined;

        if (detected && detected !== activeAgentLang) {
          userSelectedLangRef.current = true;
          setActiveAgentLang(detected);
        }

        const agentMsg: Message = {
          id: `agent-${Date.now()}`,
          sender: 'agent',
          text: replyText,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, agentMsg]);

        // Vocal readout
        const effectiveLang = detected || activeAgentLang;
        const replyVoiceLang =
          effectiveLang === 'fr'
            ? 'fr-FR'
            : effectiveLang === 'ar'
              ? 'ar-MA'
              : effectiveLang === 'es'
                ? 'es-ES'
                : 'en-US';
        speakText(replyText, isVocalInput, replyVoiceLang);
      } catch (err: any) {
        if (err?.name !== 'AbortError') {
          console.error(err);
          setErrorText(err.message || 'Connecting error. Please try again.');
        }
      } finally {
        if (specialistAbortRef.current === controller) {
          specialistAbortRef.current = null;
        }
        isRequestInFlightRef.current = false;
        setIsTyping(false);
      }
    },
    [activeAgentLang, speakText]
  );

  // Toggle Voice Dictation (Microphone input)
  const toggleSpeechRecognition = useCallback(() => {
    if (typeof window === 'undefined') return;
    unlockAudioPlayback();

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setErrorText(
        activeAgentLang === 'fr'
          ? "La dictée vocale n'est pas supportée sur ce navigateur. Tapez votre question."
          : activeAgentLang === 'es'
            ? 'El dictado por voz no es compatible con este navegador. Escribe tu pregunta.'
            : activeAgentLang === 'ar'
              ? 'L-micro ma kheddamch f had l-navigateur. Kteb sou2al dyalek hna.'
              : 'Voice input is not supported in this browser. Please type your question.'
      );
      return;
    }

    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    if (isRequestInFlightRef.current) {
      return;
    }

    try {
      stopAllAudio();
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;

      if (activeAgentLang === 'ar') {
        recognition.lang = 'ar-MA';
      } else if (activeAgentLang === 'fr') {
        recognition.lang = 'fr-FR';
      } else if (activeAgentLang === 'es') {
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
        const transcript = event?.results?.[0]?.[0]?.transcript;
        if (transcript) {
          setInput('');
          setIsListening(false);
          sendQuestion(transcript, true);
        }
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event);
        setIsListening(false);
        if (event.error !== 'no-speech' && event.error !== 'aborted') {
          setErrorText(
            activeAgentLang === 'fr'
              ? 'Accès au micro refusé ou erreur réseau. Réessayez ou tapez votre question.'
              : activeAgentLang === 'es'
                ? 'Permiso de micrófono o error de red. Inténtalo de nuevo o escribe tu pregunta.'
                : activeAgentLang === 'ar'
                  ? 'Mochkil f l-micro aw connexion. 3awed jereb wla kteb sou2alek.'
                  : 'Microphone permission or network error. Please try again or type.'
          );
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
      setErrorText(
        activeAgentLang === 'fr'
          ? 'Impossible d’accéder au microphone.'
          : activeAgentLang === 'es'
            ? 'No se pudo acceder al micrófono.'
            : 'Could not access microphone.'
      );
    }
  }, [isListening, activeAgentLang, sendQuestion, stopAllAudio, unlockAudioPlayback]);

  // Initial welcome message configuration without ever wiping an active conversation
  useEffect(() => {
    const buildInitialGreeting = (): { shouldOpen: boolean; message: Message } => {
      if (typeof window !== 'undefined') {
        const searchParams = new URLSearchParams(window.location.search);
        const isComplianceReviewer =
          searchParams.get('reviewer') === 'compliance' ||
          searchParams.get('reviewer') === 'underwriting';
        const isMoroccoCreator =
          searchParams.get('ref') === 'morocco' ||
          searchParams.get('country') === 'ma' ||
          searchParams.get('source') === 'morocco';
        const isCreatorGuide =
          searchParams.get('guide') === 'creator' ||
          searchParams.get('ref') === 'creator' ||
          searchParams.get('help') === 'kate' ||
          searchParams.get('chat') === 'kate' ||
          (searchParams.get('role') === 'creator' &&
            (searchParams.get('help') === 'kate' || searchParams.get('help') === 'steve'));

        if (isMoroccoCreator) {
          let moroccoGreeting =
            "Marhaba ! 👋 Je suis Kate, votre conseillère SECCION pour le Maroc. Bienvenue dans notre phase d'accès anticipé ! Vous pouvez dès maintenant créer votre profil, explorer le Creator Studio et préparer votre bio avec moi. Profitez de notre bouclier de confidentialité (blocage du Maroc 'MA' en 1 clic pour être totalement invisible au pays) et de notre modèle à 90 % net. Les comptes bancaires de paiement sont en cours de finalisation et vous serez notifié(e) dès leur ouverture officielle. Comment puis-je vous aider à configurer votre studio aujourd'hui ?";

          if (activeAgentLang === 'ar') {
            moroccoGreeting =
              "Marhba bik! 👋 Ana Kate, lmosa3ida dyalek f SECCION. Merhba bik f l-marhala dyal l-accès anticipé! T9der men daba t-9ad l-profil dyalek, t-chouf les outils dyal Creator Studio w t-kteb l-bio dyalek m3aya. Ghadi t-stafed men l-privacy l-kamla (t-bloqui l-Maghrib 'MA' f d9i9a bach matban l-hta wahed hna) w l-90% net. Les comptes bancaires f طور الإعداد w ghadi n-3elmouk f l-wa9t li ykouno wajdin. Bghiti n-bdaou n-9ado l-profil dyalek daba?";
          } else if (activeAgentLang === 'en') {
            moroccoGreeting =
              "Marhaba & Welcome! 👋 I'm Kate, your dedicated SECCION Creator Coach for Morocco. Welcome to our early access phase! You can already register your creator profile, explore the Creator Studio tools, and craft your bio with me. Enjoy our 5-Layer Privacy Shield (1-click 'MA' domestic geo-blocking) and 90% net revenue split. Direct payout rails are currently being finalized and you will be notified immediately upon full launch. What would you like to set up first?";
          } else if (activeAgentLang === 'es') {
            moroccoGreeting =
              '¡Marhaba y Bienvenida/o! 👋 Soy Kate, tu asesora de SECCION para Marruecos. ¡Bienvenida a nuestra fase de acceso anticipado! Ya puedes crear tu perfil, explorar el Creator Studio y redactar tu bio conmigo. Disfruta de nuestro escudo de privacidad (bloqueo de Marruecos \'MA\' en 1 clic para ser invisible en tu país) y nuestro reparto del 90% neto. Las cuentas bancarias de pago están en fase final y te notificaremos cuando abran. ¿Cómo puedo ayudarte hoy?';
          }

          return {
            shouldOpen: true,
            message: {
              id: `welcome-morocco-${activeAgentLang}`,
              sender: 'agent',
              text: moroccoGreeting,
              timestamp: new Date(),
            },
          };
        }

        if (isComplianceReviewer) {
          return {
            shouldOpen: true,
            message: {
              id: 'welcome-compliance',
              sender: 'agent',
              text: "Welcome Institutional Underwriting & Compliance Team! 👋 I'm Kate, SECCION's Executive Onboarding & Compliance Specialist. Feel free to ask me anything regarding our Two-Stage SFW vs. NSFW Sightengine AI gate, DIDIT Zero-Knowledge KYC verification, 18 U.S.C. 2257 record-keeping, smart-contract escrow protection, terms of service, or refund protocols.",
              timestamp: new Date(),
            },
          };
        }

        if (isCreatorGuide) {
          return {
            shouldOpen: true,
            message: {
              id: `welcome-creator-guide-${activeAgentLang}`,
              sender: 'agent',
              text:
                activeAgentLang === 'es'
                  ? '¡Hola Creadora / Creador! 🌟 Soy Kate, tu Asesora de Onboarding y Monetización en SECCION. Estoy aquí para guiarte paso a paso: desde tu verificación KYC segura y configuración del Creator Studio, hasta cómo activar tus suscripciones VIP, pases Master (80% revenue pool), transmisiones en vivo y herramientas de IA. ¿Tienes alguna pregunta para empezar?'
                  : activeAgentLang === 'fr'
                    ? "Bonjour Créatrice / Créateur ! 🌟 Je suis Kate, votre conseillère d'intégration et de monétisation sur SECCION. Je suis là pour vous guider pas à pas : de votre vérification KYC privée à la configuration du Creator Studio, l'activation des abonnements VIP, pass Master (80% net), lives privés et outils IA. Par quoi souhaitez-vous commencer ?"
                    : activeAgentLang === 'ar'
                      ? "Marhba bik Créatrice / Créateur ! 🌟 Ana Kate, lmosa3ida dyalek f SECCION. Hna bach n-3awnek étape par étape : men l-KYC biometrique w Creator Studio, 7tal l-abonnements VIP, live streams w les outils d'IA. Bghiti n-bdaou daba?"
                      : "Hey Creator! 🌟 I'm Kate, your dedicated Creator Onboarding & Monetization Coach on SECCION. I'm here to guide you through every step: from your private biometric KYC verification and Creator Studio setup, to activating VIP tiers, Master Platform Passes (80% pool redistribution), live broadcasts, and AI growth tools. What can I help you with first?",
              timestamp: new Date(),
            },
          };
        }
      }

      return {
        shouldOpen: false,
        message: {
          id: `welcome-${activeAgentLang}`,
          sender: 'agent',
          text: getLocalizedGreeting(activeAgentLang),
          timestamp: new Date(),
        },
      };
    };

    const { shouldOpen, message } = buildInitialGreeting();
    if (!hasSeededWelcomeRef.current && shouldOpen) {
      setIsOpen(true);
    }
    hasSeededWelcomeRef.current = true;

    setMessages((prev) => {
      // Never erase existing conversation once user has asked a question or switched mid-chat
      if (prev.length > 1 || prev.some((m) => m.sender === 'user')) {
        return prev;
      }
      return [message];
    });
  }, [activeAgentLang, getLocalizedGreeting]);

  // Listen for custom "seccion:ask-kate" or "seccion:ask-steve" events from Creator Studio / Onboarding Checklist
  useEffect(() => {
    const handleAskKate = (event: Event) => {
      const customEvent = event as CustomEvent<{ question?: string }>;
      setIsOpen(true);
      if (customEvent.detail?.question) {
        sendQuestion(customEvent.detail.question);
      }
    };

    window.addEventListener('seccion:ask-kate', handleAskKate);
    window.addEventListener('seccion:ask-steve', handleAskKate);
    return () => {
      window.removeEventListener('seccion:ask-kate', handleAskKate);
      window.removeEventListener('seccion:ask-steve', handleAskKate);
    };
  }, [sendQuestion]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Check if a member is logged in — if a logged-in member is present on member pages, AIWingmanBubble takes over!
  useEffect(() => {
    let cancelled = false;
    async function checkUser() {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (cancelled) return;
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();
        if (!cancelled) {
          setIsMemberLoggedIn(profile?.role === 'member');
        }
      } else {
        setIsMemberLoggedIn(false);
      }
    }
    checkUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      checkUser();
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [pathname]);

  // Continuous engagement question recommendation engine (must run unconditionally before early return!)
  const activeQuestionsList = useMemo(() => {
    const langData = QUESTIONS_BANK[activeAgentLang] || QUESTIONS_BANK.fr;
    const lastUserOrAgentMsg = messages[messages.length - 1]?.text?.toLowerCase() || '';

    // Detect context from the latest message
    let contextualPool = langData.general;
    if (/\b(payout|retrait|argent|payer|paiement|flous|jbed|dinero|cobro|precio|price|90%|crypto|usdt|rib|banco|bank)\b/i.test(lastUserOrAgentMsg)) {
      contextualPool = langData.payouts;
    } else if (/\b(privacy|confidentialité|flou|blur|drm|maroc|bloqu|geo|discret|famille|carte|id|kyc|zkp)\b/i.test(lastUserOrAgentMsg)) {
      contextualPool = langData.privacy;
    } else if (/\b(studio|live|stream|copilot|ia|ai|vip|pass|custom|commande|order)\b/i.test(lastUserOrAgentMsg)) {
      contextualPool = langData.studio;
    }

    // 1. Unasked starter questions (preserves remaining questions all along!)
    const unaskedStarters = langData.starter.filter((q) => !askedQuestions.includes(q));

    // 2. Secondary engagement pool: context-specific, then general, studio, payouts, privacy
    const secondaryPool = [
      ...contextualPool,
      ...langData.general,
      ...langData.studio,
      ...langData.payouts,
      ...langData.privacy,
    ];
    const unaskedSecondary = Array.from(new Set(secondaryPool)).filter(
      (q) => !askedQuestions.includes(q) && !unaskedStarters.includes(q)
    );

    // Combine unasked starters first, followed by fresh secondary engagement questions
    const combinedUnasked = [...unaskedStarters, ...unaskedSecondary];
    const poolToUse = combinedUnasked.length > 0 ? combinedUnasked : Array.from(new Set([...langData.starter, ...secondaryPool]));

    const startIdx = suggestionOffset % poolToUse.length;
    const picked = poolToUse.slice(startIdx, startIdx + 3);
    if (picked.length < 3 && poolToUse.length >= 3) {
      return [...picked, ...poolToUse.slice(0, 3 - picked.length)];
    }
    return picked;
  }, [activeAgentLang, messages, askedQuestions, suggestionOffset]);

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
    unlockAudioPlayback();
    const text = input.trim();
    setInput('');
    await sendQuestion(text);
  };

  const cycleSuggestions = () => {
    setSuggestionOffset((prev) => prev + 2);
  };

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
            <header className="p-3.5 border-b border-white/10 bg-gradient-to-r from-[#00fbfb]/10 via-purple-950/20 to-[#ec4899]/10 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#00fbfb] to-[#ec4899] p-[1.5px] shadow-[0_0_15px_rgba(0,251,251,0.4)] overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&h=150&q=80"
                    alt="Kate"
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>
                <div className="text-left">
                  <h3 className="text-xs font-black uppercase tracking-widest text-white flex items-center gap-1.5">
                    Kate <Sparkles className="w-3 h-3 text-[#00fbfb]" />
                  </h3>
                  <span className="text-[9px] font-mono font-bold text-[#00fbfb] uppercase tracking-wider block">
                    SECCION Executive Guide
                  </span>
                </div>
              </div>

              {/* Language Selector Pills & Close Button */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-0.5 bg-black/40 p-1 rounded-xl border border-white/10">
                  {(['fr', 'es', 'en', 'ar'] as const).map((l) => (
                    <button
                      key={l}
                      type="button"
                      onClick={() => handleSelectLang(l)}
                      className={`px-1.5 py-0.5 text-[9px] font-mono font-bold rounded-lg transition cursor-pointer ${
                        activeAgentLang === l
                          ? 'bg-[#00fbfb] text-black shadow-[0_0_8px_rgba(0,251,251,0.4)]'
                          : 'text-white/40 hover:text-white'
                      }`}
                      title={l === 'fr' ? 'Français' : l === 'es' ? 'Español' : l === 'en' ? 'English' : 'الدارجة المغربية / العربية'}
                    >
                      {l.toUpperCase()}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => {
                    stopAllAudio();
                    setIsOpen(false);
                  }}
                  className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/70 hover:text-white transition cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
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
                    <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                    {msg.sender === 'agent' && (
                      <div className="mt-1.5 flex justify-end">
                        <button
                          type="button"
                          onClick={() => {
                            unlockAudioPlayback();
                            speakText(msg.text, true);
                          }}
                          className="inline-flex items-center gap-1 text-[10px] text-white/40 hover:text-[#00fbfb] transition cursor-pointer"
                          aria-label="Listen to Kate"
                          title="Listen"
                        >
                          <Volume2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Dynamic Persistent Quick Questions & Follow-Up Engagement Suggestions */}
              {!isTyping && activeQuestionsList.length > 0 && (
                <div className="pt-2 space-y-1.5">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-[9px] font-mono uppercase tracking-wider text-white/40 flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5 text-[#00fbfb]" />
                      {messages.length <= 1
                        ? activeAgentLang === 'fr'
                          ? 'Questions fréquentes :'
                          : activeAgentLang === 'es'
                          ? 'Preguntas frecuentes:'
                          : activeAgentLang === 'ar'
                          ? 'الأسئلة الشائعة:'
                          : 'Quick questions:'
                        : activeAgentLang === 'fr'
                        ? 'Questions suggérées :'
                        : activeAgentLang === 'es'
                        ? 'Preguntas sugeridas:'
                        : activeAgentLang === 'ar'
                        ? 'أسئلة مقترحة:'
                        : 'Suggested follow-ups:'}
                    </span>
                    <button
                      type="button"
                      onClick={cycleSuggestions}
                      className="text-[9px] font-mono text-[#00fbfb]/70 hover:text-[#00fbfb] flex items-center gap-1 transition cursor-pointer"
                      title={activeAgentLang === 'fr' ? 'Changer' : activeAgentLang === 'es' ? 'Cambiar' : activeAgentLang === 'ar' ? 'تبديل' : 'Shuffle'}
                    >
                      <RefreshCw className="w-2.5 h-2.5" />
                      <span>{activeAgentLang === 'fr' ? 'Changer' : activeAgentLang === 'es' ? 'Cambiar' : activeAgentLang === 'ar' ? 'تبديل' : 'Shuffle'}</span>
                    </button>
                  </div>
                  {activeQuestionsList.map((q, idx) => (
                    <button
                      key={`${q}-${idx}`}
                      type="button"
                      disabled={isTyping}
                      onClick={() => {
                        unlockAudioPlayback();
                        sendQuestion(q);
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl bg-white/[0.04] hover:bg-[#00fbfb]/15 border border-white/10 hover:border-[#00fbfb]/40 text-[11px] text-white/80 hover:text-white transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-between group shadow-sm"
                    >
                      <span className="flex items-center gap-1.5">
                        <span className="text-[#00fbfb]">💬</span>
                        <span>{q}</span>
                      </span>
                      <span className="text-white/20 group-hover:text-[#00fbfb] transition text-[10px]">↵</span>
                    </button>
                  ))}
                </div>
              )}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white/5 border border-white/10 text-white/60 rounded-2xl p-3 text-xs rounded-tl-none flex items-center gap-2">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-[#00fbfb]" />
                    <span>
                      {activeAgentLang === 'fr'
                        ? 'Kate réfléchit...'
                        : activeAgentLang === 'es'
                        ? 'Kate está pensando...'
                        : activeAgentLang === 'ar'
                        ? 'Kate kat-feker...'
                        : 'Kate is thinking...'}
                    </span>
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
                  disabled={isTyping && !isListening}
                  onClick={toggleSpeechRecognition}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center transition border shrink-0 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                    isListening
                      ? 'bg-rose-500/20 border-rose-500 text-rose-400 animate-pulse'
                      : 'bg-white/[0.04] border-white/10 text-white/70 hover:text-[#00fbfb] hover:border-[#00fbfb]/40'
                  }`}
                  aria-label="Speak to Kate (Voice Dictation)"
                  title={isListening ? "Listening... (click to stop)" : "Speak to Kate"}
                >
                  {isListening ? <MicOff className="w-4 h-4 text-rose-400" /> : <Mic className="w-4 h-4" />}
                </button>

                <input
                  type="text"
                  placeholder={
                    isListening
                      ? activeAgentLang === 'fr'
                        ? 'Écoute en cours... parlez maintenant'
                        : activeAgentLang === 'es'
                        ? 'Escuchando... habla ahora'
                        : activeAgentLang === 'ar'
                        ? 'Kan-sm3ek... hder daba'
                        : 'Listening... speak now'
                      : activeAgentLang === 'fr'
                      ? 'Posez votre question à Kate...'
                      : activeAgentLang === 'es'
                      ? 'Pregúntale a Kate...'
                      : activeAgentLang === 'ar'
                      ? 'Sewwel Kate...'
                      : 'Ask Kate anything...'
                  }
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="flex-1 bg-white/[0.04] border border-white/10 rounded-xl py-2 px-3 outline-none focus:border-[#00fbfb]/50 focus:bg-white/[0.08] transition text-xs text-white placeholder-white/30"
                />

                <button
                  type="button"
                  onClick={() => {
                    if (isSpeaking) {
                      stopAllAudio();
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
