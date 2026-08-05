"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Volume2, VolumeX, Shield, Play } from "lucide-react";
import ChemistryMeterDemo from "./ChemistryMeterDemo";
import SynergyEngineDemo from "./SynergyEngineDemo";
import DayInLifeSimulation from "./DayInLifeSimulation";

import { useTranslation } from "@/context/LanguageContext";

interface SessionQuestProps {
  onSignUp: (tutorialData: { archetype: string; preferences: any }) => void;
  onClose: () => void;
}

export default function SessionQuest({ onSignUp, onClose }: SessionQuestProps) {
  const { t: translate, locale: lang, setLocale: setLang } = useTranslation();
  
  const t = {
    lobby_title: translate("sessionQuest.main.lobby_title", "Welcome to SECCION"),
    lobby_sub: translate("sessionQuest.main.lobby_sub", "A gamified welcome experience built on real psychology."),
    lobby_p1: translate("sessionQuest.main.lobby_p1", "Before we ask you for a username or password, we want to prove why SECCION is different. No endless swiping. No fake connections."),
    lobby_p2: translate("sessionQuest.main.lobby_p2", "Let's explore your vibe, build connection chemistry, and unlock moves. Right now. No account needed."),
    lobby_cta: translate("sessionQuest.main.lobby_cta", "Enter The Quest"),
    vibe_title: translate("sessionQuest.main.vibe_title", "What's Your Vibe?"),
    vibe_sub: translate("sessionQuest.main.vibe_sub", "Choose your core archetype to shape your matching potential."),
    chemistry_title: translate("sessionQuest.main.chemistry_title", "The Chemistry Meter"),
    chemistry_sub: translate("sessionQuest.main.chemistry_sub", "Two-player co-op connection dynamics."),
    synergy_title: translate("sessionQuest.main.synergy_title", "Predictive Matching"),
    synergy_sub: translate("sessionQuest.main.synergy_sub", "Merging your Synergy Auras in real-time."),
    hub_title: translate("sessionQuest.main.hub_title", "Part 1 Complete!"),
    hub_p1: translate("sessionQuest.main.hub_p1", "You've selected your archetype and explored the Chemistry Meter. You can join SECCION now to activate your profile, or continue to Part 2 for a full platform simulation."),
    hub_cta_signup: translate("sessionQuest.main.hub_cta_signup", "Join SECCION Now"),
    hub_cta_continue: translate("sessionQuest.main.hub_cta_continue", "Go Deeper (Part 2)"),
    quiz_title: translate("sessionQuest.main.quiz_title", "Insight Generator"),
    quiz_sub: translate("sessionQuest.main.quiz_sub", "Reveal your digital habits to tune your Synergy Aura."),
    secret_title: translate("sessionQuest.main.secret_title", "The Pivot"),
    secret_p1: translate("sessionQuest.main.secret_p1", "Everything you've seen? That wasn't pre-saved. SECCION mapped it dynamically from your interactions."),
    secret_p2: translate("sessionQuest.main.secret_p2", "This is the level of depth members get every day. We don't guess compatibility; we build it."),
    secret_cta: translate("sessionQuest.main.secret_cta", "Claim Your SECCION Profile"),
    secret_cta_home: translate("sessionQuest.main.secret_cta_home", "Go Back to Home Page"),
    subtitles_active: translate("sessionQuest.main.subtitles_active", "Subtitles Active")
  };

  const ARCHETYPES = [
    { id: "CREATIVER", emoji: "🎨", name: translate("sessionQuest.main.archetype_creative", "Creative Dreamer"), desc: translate("sessionQuest.main.archetype_creative_desc", "Expressive, thoughtful, designs playlist-worthy connections.") },
    { id: "CAREGIVER", emoji: "🔗", name: translate("sessionQuest.main.archetype_social", "Social Connector"), desc: translate("sessionQuest.main.archetype_social_desc", "Autonomic helper, remembers names, builds supportive bridges.") },
    { id: "REBEL", emoji: "🎢", name: translate("sessionQuest.main.archetype_adrenaline", "Adrenaline Seeker"), desc: translate("sessionQuest.main.archetype_adrenaline_desc", "Spontaneous, lives at full speed, plans adventures on the fly.") },
    { id: "LOGICIAN", emoji: "🔧", name: translate("sessionQuest.main.archetype_analytical", "Analytical Builder"), desc: translate("sessionQuest.main.archetype_analytical_desc", "Methodical thinker, values scheduling, builds solid structures.") },
    { id: "POET", emoji: "💍", name: translate("sessionQuest.main.archetype_romantic", "Romantic Idealist"), desc: translate("sessionQuest.main.archetype_romantic_desc", "Deep dreamer, writes by hand, values absolute relationships.") }
  ];

  const QUIZ_QUESTIONS = [
    {
      q: translate("sessionQuest.main.quiz_q1", "On weekends, what fuels your battery the most?"),
      opts: [
        { text: translate("sessionQuest.main.quiz_q1_opt1", "Designing or creating something quiet 🎨"), trait: "creative" },
        { text: translate("sessionQuest.main.quiz_q1_opt2", "Hosting a dinner or gathering friends 🔗"), trait: "social" },
        { text: translate("sessionQuest.main.quiz_q1_opt3", "Booking a last-minute flight or road trip 🎢"), trait: "spontaneous" }
      ]
    },
    {
      q: translate("sessionQuest.main.quiz_q2", "How do you handle disagreement in relationships?"),
      opts: [
        { text: translate("sessionQuest.main.quiz_q2_opt1", "Discuss it immediately with direct honesty 💬"), trait: "direct" },
        { text: translate("sessionQuest.main.quiz_q2_opt2", "Take space to process before communicating 📐"), trait: "introspective" },
        { text: translate("sessionQuest.main.quiz_q2_opt3", "Defuse tension with playfulness and humor 🎭"), trait: "witty" }
      ]
    },
    {
      q: translate("sessionQuest.main.quiz_q3", "What is your main investment driver in connection?"),
      opts: [
        { text: translate("sessionQuest.main.quiz_q3_opt1", "Shared travel, events, and unique experiences 🌟"), driver: "Experience" },
        { text: translate("sessionQuest.main.quiz_q3_opt2", "Deep emotional validation and daily vulnerability 💖"), driver: "Emotional Connection" },
        { text: translate("sessionQuest.main.quiz_q3_opt3", "Intellectual debate and collaborative projects 📐"), driver: "Intellectual Stimulation" }
      ]
    }
  ];
  const [step, setStep] = useState<
    | "lobby"
    | "archetype-select"
    | "chemistry-meter"
    | "synergy-engine"
    | "branching-hub"
    | "day-in-life"
    | "quiz"
    | "secret"
  >("lobby");

  const [archetype, setArchetype] = useState<string>("");
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [subtitles, setSubtitles] = useState("");
  const [quizAnswers, setQuizAnswers] = useState<any[]>([]);
  const [currentQuizIdx, setCurrentQuizIdx] = useState(0);

  const synthRef = useRef<SpeechSynthesis | null>(null);
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);



  useEffect(() => {
    if (typeof window !== "undefined") {
      synthRef.current = window.speechSynthesis;
    }
    return () => {
      stopVoice();
    };
  }, []);

  // Sync Voice Trigger on Step Change
  useEffect(() => {
    speakStepText();
  }, [step, lang]);

  const stopVoice = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
    }
  };

  const speak = (text: string) => {
    if (!audioEnabled || !synthRef.current) {
      setSubtitles(text);
      return;
    }

    stopVoice();
    setSubtitles("");

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang === "en" ? "en-US" : lang === "es" ? "es-ES" : "fr-FR";
    
    // Attempt to pick a pleasing voice matching the lang
    const voices = synthRef.current.getVoices();
    const matches = voices.filter(v => v.lang.startsWith(lang));
    if (matches.length > 0) {
      utterance.voice = matches[0];
    }

    utterance.onboundary = (event) => {
      // Basic word boundaries highlighter inside subtitles
      if (event.name === "word") {
        const remaining = text.substring(event.charIndex);
        const words = remaining.split(" ");
        setSubtitles(words.slice(0, 10).join(" ") + "...");
      }
    };

    utterance.onend = () => {
      setSubtitles(text);
    };

    currentUtteranceRef.current = utterance;
    synthRef.current.speak(utterance);
    setSubtitles(text); // Fallback visible subtitle instantly
  };

  const speakStepText = () => {
    switch (step) {
      case "lobby":
        speak(`${t.lobby_title}. ${t.lobby_sub}. ${t.lobby_p1}`);
        break;
      case "archetype-select":
        speak(`${t.vibe_title}. ${t.vibe_sub}`);
        break;
      case "chemistry-meter":
        speak(translate("sessionQuest.main.speech_chemistry", "Observe the Chemistry Gauge. In SECCION, compatibility is calculated symmetrically using a harmonic mean. Both sides must invest to level up."));
        break;
      case "synergy-engine":
        speak(translate("sessionQuest.main.speech_synergy", "Here is our Synergy Engine metrics engine. We analyze personality compatibility, recent momentum, and schedule opportunities."));
        break;
      case "branching-hub":
        speak(t.hub_p1);
        break;
      case "day-in-life":
        speak(translate("sessionQuest.main.speech_dayInLife", "Let's simulate a typical day on SECCION. Observe how notifications, matchmaking sweeps, and conversational metrics flow."));
        break;
      case "quiz":
        speak(translate("sessionQuest.main.speech_quiz", "Answer these simple questions. We'll build a live archetype vector without making you fill an actual profile form."));
        break;
      case "secret":
        speak(`${t.secret_p1} ${t.secret_p2}`);
        break;
    }
  };

  const handleArchetypeSelect = (id: string) => {
    setArchetype(id);
    sessionStorage.setItem("_onboarding_archetype_choice", id);
    setStep("chemistry-meter");
  };

  const handleQuizAnswer = (opt: any) => {
    setQuizAnswers((prev) => [...prev, opt]);
    if (currentQuizIdx < QUIZ_QUESTIONS.length - 1) {
      setCurrentQuizIdx((prev) => prev + 1);
    } else {
      setStep("secret");
    }
  };

  const getSubmitsData = () => {
    const traits = quizAnswers.map(a => a.trait).filter(Boolean);
    const drivers = quizAnswers.map(a => a.driver).filter(Boolean);
    return {
      archetype,
      preferences: {
        traits,
        drivers,
        favorite_languages: [lang === "en" ? "English" : lang === "es" ? "Spanish" : "French"],
        tutorial_completed: true
      }
    };
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#050505] flex flex-col justify-between overflow-y-auto font-sans text-white p-6">
      {/* Top Header Controls */}
      <div className="flex justify-between items-center w-full max-w-4xl mx-auto border-b border-white/5 pb-4">
        <h3 className="text-xl font-black tracking-widest text-glow text-white Outfit uppercase">
          SECCION Quest
        </h3>

        <div className="flex items-center gap-3">
          {/* Language Selector */}
          <select
            value={lang}
            onChange={(e) => setLang(e.target.value as any)}
            className="bg-white/5 border border-white/10 rounded-lg text-xs py-1.5 px-2 focus:outline-none focus:border-primary font-bold"
          >
            <option value="en" className="bg-[#050505]">EN</option>
            <option value="es" className="bg-[#050505]">ES</option>
            <option value="fr" className="bg-[#050505]">FR</option>
          </select>

          {/* Voice Toggle */}
          <button
            onClick={() => {
              setAudioEnabled(prev => {
                if (prev) stopVoice();
                return !prev;
              });
            }}
            className="p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-white/70 hover:text-white transition"
          >
            {audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Exit Button */}
          <button
            onClick={onClose}
            className="text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white transition bg-white/5 border border-white/10 py-1.5 px-3 rounded-lg"
          >
            Skip Tutorial
          </button>
        </div>
      </div>

      {/* Main Narrative Display Area */}
      <div className="flex-1 flex flex-col items-center justify-center py-8 w-full max-w-4xl mx-auto">
        <AnimatePresence mode="wait">
          {/* LOBBY */}
          {step === "lobby" && (
            <motion.div
              key="lobby"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="text-center space-y-6 max-w-lg"
            >
              <div className="inline-flex p-3 bg-primary/10 rounded-3xl border border-primary/20 text-primary animate-pulse mb-2">
                <Sparkles className="w-8 h-8" />
              </div>
              <h1 className="text-4xl md:text-5xl font-black uppercase Outfit tracking-tighter text-glow leading-none">
                {t.lobby_title}
              </h1>
              <p className="text-sm font-bold text-primary/80 uppercase tracking-widest font-mono">
                {t.lobby_sub}
              </p>
              <div className="space-y-4 text-white/60 text-xs md:text-sm leading-relaxed font-medium">
                <p>{t.lobby_p1}</p>
                <p>{t.lobby_p2}</p>
              </div>

              <button
                onClick={() => setStep("archetype-select")}
                className="px-8 py-4 bg-primary hover:bg-cyan-400 text-black font-black uppercase tracking-widest rounded-xl hover:shadow-[0_0_20px_rgba(102,252,241,0.4)] transition text-xs flex items-center justify-center gap-2 mx-auto mt-8"
              >
                <Play className="w-4 h-4 fill-black" />
                {t.lobby_cta}
              </button>
            </motion.div>
          )}

          {/* ARCHETYPE SELECT */}
          {step === "archetype-select" && (
            <motion.div
              key="archetype"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="w-full max-w-lg space-y-6"
            >
              <div className="text-center space-y-2">
                <h4 className="text-2xl font-black uppercase Outfit">{t.vibe_title}</h4>
                <p className="text-xs text-white/50">{t.vibe_sub}</p>
              </div>

              <div className="space-y-3">
                {ARCHETYPES.map((arch) => (
                  <button
                    key={arch.id}
                    onClick={() => handleArchetypeSelect(arch.id)}
                    className="w-full p-4 bg-white/5 border border-white/10 hover:border-primary/40 rounded-2xl text-left flex items-start gap-4 transition hover:bg-white/10 group"
                  >
                    <span className="text-3xl p-1 bg-white/5 rounded-xl group-hover:scale-110 transition-transform">{arch.emoji}</span>
                    <div className="space-y-1">
                      <h5 className="text-sm font-black text-white group-hover:text-primary transition-colors uppercase tracking-wide">
                        {arch.name}
                      </h5>
                      <p className="text-[11px] text-white/50 leading-normal font-medium">{arch.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* CHEMISTRY METER DEMO */}
          {step === "chemistry-meter" && (
            <motion.div
              key="chemistry"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full"
            >
              <ChemistryMeterDemo onComplete={() => setStep("synergy-engine")} />
            </motion.div>
          )}

          {/* SYNERGY ENGINE */}
          {step === "synergy-engine" && (
            <motion.div
              key="synergy"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full"
            >
              <SynergyEngineDemo
                userArchetype={archetype}
                onComplete={() => setStep("branching-hub")}
              />
            </motion.div>
          )}

          {/* BRANCHING HUB */}
          {step === "branching-hub" && (
            <motion.div
              key="hub"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="text-center space-y-6 max-w-lg"
            >
              <h1 className="text-3xl font-black uppercase Outfit text-glow">
                {t.hub_title}
              </h1>
              <p className="text-xs text-white/60 leading-relaxed font-medium">
                {t.hub_p1}
              </p>

              <div className="flex flex-col gap-3 pt-6 max-w-xs mx-auto">
                <button
                  onClick={() => onSignUp(getSubmitsData())}
                  className="w-full py-4 bg-primary text-black font-black uppercase tracking-widest rounded-xl hover:shadow-[0_0_20px_rgba(102,252,241,0.4)] transition text-xs"
                >
                  {t.hub_cta_signup}
                </button>
                <button
                  onClick={() => setStep("day-in-life")}
                  className="w-full py-4 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl text-xs font-black uppercase tracking-widest text-white transition"
                >
                  {t.hub_cta_continue}
                </button>
              </div>
            </motion.div>
          )}

          {/* DAY IN LIFE SIMULATION */}
          {step === "day-in-life" && (
            <motion.div
              key="day-in-life"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full"
            >
              <DayInLifeSimulation onComplete={() => setStep("quiz")} />
            </motion.div>
          )}

          {/* INSIGHT QUIZ */}
          {step === "quiz" && (
            <motion.div
              key="quiz"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="w-full max-w-lg space-y-6"
            >
              <div className="text-center space-y-2">
                <h4 className="text-2xl font-black uppercase Outfit">{t.quiz_title}</h4>
                <p className="text-xs text-white/50">{t.quiz_sub}</p>
                <div className="flex justify-center gap-1.5 pt-2">
                  {QUIZ_QUESTIONS.map((_, idx) => (
                    <div
                      key={idx}
                      className={`w-8 h-1 rounded-full ${idx <= currentQuizIdx ? "bg-primary" : "bg-white/10"}`}
                    />
                  ))}
                </div>
              </div>

              <div className="glass-card p-6 rounded-3xl border border-white/10 bg-black/40 space-y-4">
                <h5 className="text-sm font-bold text-white leading-relaxed">
                  {QUIZ_QUESTIONS[currentQuizIdx].q}
                </h5>
                <div className="space-y-2">
                  {QUIZ_QUESTIONS[currentQuizIdx].opts.map((opt, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleQuizAnswer(opt)}
                      className="w-full p-4 bg-white/5 hover:bg-primary/20 border border-white/10 hover:border-primary/30 rounded-xl text-left text-xs font-bold transition flex items-center justify-between group"
                    >
                      <span>{opt.text}</span>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* THE SECRET PIVOT */}
          {step === "secret" && (
            <motion.div
              key="secret"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-6 max-w-lg"
            >
              <div className="flex justify-center mb-2">
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-full text-red-500 animate-pulse">
                  <Shield className="w-8 h-8" />
                </div>
              </div>
              <h1 className="text-3xl font-black uppercase Outfit text-glow">
                {t.secret_title}
              </h1>
              <div className="space-y-4 text-white/60 text-xs md:text-sm leading-relaxed font-medium">
                <p>{t.secret_p1}</p>
                <p>{t.secret_p2}</p>
              </div>

              <div className="flex flex-col gap-3 max-w-xs mx-auto mt-8">
                <button
                  onClick={() => onSignUp(getSubmitsData())}
                  className="w-full bg-primary text-black font-black uppercase tracking-widest py-4 rounded-xl hover:shadow-[0_0_20px_rgba(102,252,241,0.4)] transition text-xs flex items-center justify-center gap-2"
                >
                  {t.secret_cta}
                </button>
                <button
                  onClick={() => {
                    stopVoice();
                    window.location.href = "/";
                  }}
                  className="w-full py-4 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl text-xs font-black uppercase tracking-widest text-white transition"
                >
                  {t.secret_cta_home}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Subtitles Overlay Footer */}
      <div className="w-full max-w-4xl mx-auto border-t border-white/5 pt-4 text-center">
        <div className="min-h-[40px] flex flex-col items-center justify-center">
          {subtitles ? (
            <p className="text-xs font-bold text-primary max-w-2xl px-4 text-center leading-normal animate-fadeIn">
              "{subtitles}"
            </p>
          ) : (
            <p className="text-[10px] font-mono text-white/20 uppercase tracking-widest">
              Audio Synthesis Subtitles
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
