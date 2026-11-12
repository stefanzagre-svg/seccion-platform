"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Volume2, VolumeX, Shield, Play, Loader2 } from "lucide-react";
import RevenueEngineDemo from "./RevenueEngineDemo";
import StreamStationDemo from "./StreamStationDemo";
import MonetizationSuiteDemo from "./MonetizationSuiteDemo";

import { useTranslation } from "@/context/LanguageContext";
import { RELATIONSHIP_GOALS, RELATIONSHIP_TYPES, SEXUAL_PREFERENCES } from "@/lib/constants";

interface CreatorQuestProps {
  onSignUp: (data: { archetype: string; role: string; creator_purposes: string[]; specialization: string; sexual_preferences: string[]; relationship_goals: string[]; relationship_types: string[]; is_adult_content: boolean }) => void | Promise<void>;
  onSwitchToMember: () => void;
  onClose: () => void;
}

export default function CreatorQuest({ onSignUp, onSwitchToMember, onClose }: CreatorQuestProps) {
  const { t: translate, locale: lang, setLocale: setLang } = useTranslation();
  
  const t = {
    lobby_title: translate("creatorQuest.main.lobby_title", "Welcome to SECCION Studio Tour"),
    lobby_sub: translate("creatorQuest.main.lobby_sub", "A monetization-focused welcome experience built for professional creators."),
    lobby_p1: translate("creatorQuest.main.lobby_p1", "Before you sign up or configure anything, we want to prove how SECCION maximizes your revenue. No management agencies taking 40%. No commission traps."),
    lobby_p2: translate("creatorQuest.main.lobby_p2", "Let's explore your vibe, test our streaming cockpit, and review your 7 built-in revenue streams. Right now. No account needed."),
    lobby_cta: translate("creatorQuest.main.lobby_cta", "Enter The Studio Tour"),
    vibe_title: translate("creatorQuest.main.vibe_title", "Choose Your Mode"),
    vibe_sub: translate("creatorQuest.main.vibe_sub", "Verify if you are here as a creator or member."),
    hub_cta_creator: translate("creatorQuest.main.hub_cta_creator", "Launch Creator Tour"),
    hub_cta_member: translate("creatorQuest.main.hub_cta_member", "Switch to Member Quest"),
    profile_title: translate("creatorQuest.main.profile_title", "Profile & Portfolio Setup"),
    profile_sub: translate("creatorQuest.main.profile_sub", "Configure custom monetization tiers and privacy locks."),
    profile_blur_label: translate("creatorQuest.main.profile_blur_label", "Face Blur Privacy Gate Enabled"),
    morocco_shield_title: translate("creatorQuest.main.morocco_shield_title", "Morocco Domestic Privacy Shield [Recommended]"),
    morocco_shield_desc: translate("creatorQuest.main.morocco_shield_desc", "Cryptographically shields your profile and live streams from all domestic Moroccan IP addresses (Maroc Telecom, Inwi, Orange). Only international fans outside Morocco can discover your studio."),
    profile_cta: translate("creatorQuest.main.profile_cta", "Save and Go Live"),
    secret_title: translate("creatorQuest.main.secret_title", "Studio Tour Complete"),
    secret_p1: translate("creatorQuest.main.secret_p1", "Everything you've seen is mapped dynamically to protect and monetize your audience. SECCION does the heavy lifting for you."),
    secret_p2: translate("creatorQuest.main.secret_p2", "This is the level of automation and protection creators get every day. We don't guess your value; we unlock it."),
    secret_cta: translate("creatorQuest.main.secret_cta", "Claim Your SECCION Studio"),
    secret_cta_home: translate("creatorQuest.main.secret_cta_home", "Go Back to Home Page"),
    subtitles_active: translate("creatorQuest.main.subtitles_active", "Subtitles Active")
  };

  const CREATOR_ARCHETYPES = [
    { id: "STREAMER", emoji: "🎙️", name: translate("creatorQuest.main.archetype_streamer", "Live Co-Op Legend"), desc: translate("creatorQuest.main.archetype_streamer_desc", "Owns the spotlight. Hypes up live crowds, crushes community Quests, and turns streams into a shared vibe.") },
    { id: "PORTFOLIO", emoji: "📸", name: translate("creatorQuest.main.archetype_portfolio", "The Vault Curator"), desc: translate("creatorQuest.main.archetype_portfolio_desc", "Drops exclusive masterpieces. Curates secret galleries and unlocks VIP access to your highest aesthetic.") },
    { id: "HYBRID", emoji: "⚡", name: translate("creatorQuest.main.archetype_hybrid", "Main Character"), desc: translate("creatorQuest.main.archetype_hybrid_desc", "Controls the narrative. Hooks them with casual lore, then unlocks private 1-on-1 synergy sessions.") }
  ];
  const [step, setStep] = useState<
    "lobby" | "mode-select" | "identity-setup" | "revenue-engine" | "profile-setup" | "stream-station" | "monetization-suite" | "secret"
  >("lobby");
  const [selectedVibe, setSelectedVibe] = useState("STREAMER");
  const [faceBlurActive, setFaceBlurActive] = useState(true);
  const [tierPrice, setTierPrice] = useState(9.99);
  const [residence, setResidence] = useState("");
  const [residenceError, setResidenceError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Moroccan Domestic Privacy Shield States (Task 2)
  const [moroccoShieldActive, setMoroccoShieldActive] = useState<boolean>(true);
  const [isMoroccoDetected, setIsMoroccoDetected] = useState<boolean>(false);

  const checkIsMorocco = (val: string): boolean => {
    if (!val) return false;
    const v = val.toLowerCase().trim();
    return (
      v === 'ma' ||
      v.includes('morocco') ||
      v.includes('maroc') ||
      v.includes('marruecos') ||
      v.includes('marrakech') ||
      v.includes('casablanca') ||
      v.includes('rabat') ||
      v.includes('tangier') ||
      v.includes('tanger') ||
      v.includes('agadir') ||
      v.includes('fes') ||
      v.includes('fès') ||
      v.includes('meknes') ||
      v.includes('+212')
    );
  };

  useEffect(() => {
    try {
      const userTz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
      if (userTz.includes('Casablanca')) {
        setIsMoroccoDetected(true);
        setMoroccoShieldActive(true);
        setResidence((prev) => prev || 'Morocco (MA)');
      }
    } catch {}
  }, []);

  // Identity Setup States (Multi-select arrays up to 5 options)
  const [creatorPurposes, setCreatorPurposes] = useState<string[]>([]);
  const [specialization, setSpecialization] = useState("");
  const [sexualPreferences, setSexualPreferences] = useState<string[]>([]);
  const [relationshipGoals, setRelationshipGoals] = useState<string[]>([]);
  const [relationshipTypes, setRelationshipTypes] = useState<string[]>([]);

  const PURPOSES = ["Lifestyle", "AI & Technology", "Gaming", "Explicit 18+", "Coaching", "Education", "Expertise"];
  const SPECIALIZATIONS = ["AI & Technology", "Beauty", "Gaming", "Explicit", "Social & Communication", "Economy & Finance", "Dating & Marriage", "Cooking", "Fitness & Wellness", "Health & Psychology", "Art & Music"];

  // Spanish display mappings for localized UI while preserving DB compatibility
  const PURPOSES_ES: Record<string, string> = {
    "Lifestyle": "Estilo de Vida",
    "AI & Technology": "IA & Tecnología",
    "Gaming": "Gaming",
    "Explicit 18+": "Explícito 18+",
    "Coaching": "Coaching & Mentoría",
    "Education": "Educación",
    "Expertise": "Experticia & Negocios"
  };

  const SPECIALIZATIONS_ES: Record<string, string> = {
    "AI & Technology": "IA & Tecnología",
    "Beauty": "Belleza & Estética",
    "Gaming": "Gaming & Esports",
    "Explicit": "Explícito & Adultos",
    "Social & Communication": "Social & Comunicación",
    "Economy & Finance": "Economía & Finanzas",
    "Dating & Marriage": "Citas & Pareja",
    "Cooking": "Cocina & Gastronomía",
    "Fitness & Wellness": "Fitness & Bienestar",
    "Health & Psychology": "Salud & Psicología",
    "Art & Music": "Arte & Música"
  };

  const SEXUAL_PREF_ES: Record<string, string> = {
    "Straight": "Heterosexual",
    "Gay": "Gay",
    "Lesbian": "Lesbiana",
    "Bisexual": "Bisexual",
    "Pansexual": "Pansexual",
    "Queer": "Queer",
    "Questioning": "En Exploración",
    "Asexual": "Asexual",
    "Demisexual": "Demisexual",
    "Aromantic": "Aromántico",
    "Omnisexual": "Omnisexual"
  };

  const REL_GOALS_ES: Record<string, string> = {
    "Long term partner": "Pareja a largo plazo",
    "Long term not against Short term Crush": "Largo plazo abierto a crush casual",
    "Good Vibe Instant Crush": "Buena vibra y crush instantáneo",
    "Short term Vibe leads to long term": "Vibra corta que lleve a largo plazo",
    "Not limit myself": "Sin límites ni etiquetas",
    "Let's figure after a date.": "Descubrirlo tras una cita",
    "Travel Companion": "Compañero/a de viajes",
    "Make New Frends": "Hacer nuevas amistades",
    "Flat Mate": "Compañero/a de piso",
    "Social & Economical Support": "Apoyo social y económico",
    "Sex Mate": "Compañero/a sexual"
  };

  const REL_TYPES_ES: Record<string, string> = {
    "Monogamous": "Monógamo/a",
    "Polyamorous": "Poliamoroso/a",
    "Open Relationship": "Relación Abierta",
    "Ethical Non-Monogamy": "No Monogamia Ética",
    "Open to Explore": "Abierto/a a explorar",
    "Libertinism Mindset": "Mentalidad Libertina",
    "Swinging Open": "Swinging Abierto",
    "Open to Distant Relation": "Abierto/a a relación a distancia",
    "Digital Relationship": "Relación Digital",
    "FWB": "Amigos con derechos (FWB)",
    "Not sure yet": "Aún no lo tengo claro"
  };

  // French display mappings for localized UI
  const PURPOSES_FR: Record<string, string> = {
    "Lifestyle": "Style de Vie",
    "AI & Technology": "IA & Technologie",
    "Gaming": "Gaming & Jeux Vidéo",
    "Explicit 18+": "Exclusif / 18+",
    "Coaching": "Coaching & Mentorat",
    "Education": "Éducation & Savoir",
    "Expertise": "Expertise & Business"
  };

  const SPECIALIZATIONS_FR: Record<string, string> = {
    "AI & Technology": "IA & Technologie",
    "Beauty": "Beauté & Soins",
    "Gaming": "Gaming & Esport",
    "Explicit": "Contenu Adulte & 18+",
    "Social & Communication": "Social & Éloquence",
    "Economy & Finance": "Économie & Finance",
    "Dating & Marriage": "Rencontres & Relations",
    "Cooking": "Cuisine & Gastronomie",
    "Fitness & Wellness": "Fitness & Bien-Être",
    "Health & Psychology": "Santé & Psychologie",
    "Art & Music": "Art & Musique"
  };

  const SEXUAL_PREF_FR: Record<string, string> = {
    "Straight": "Hétérosexuel(le)",
    "Gay": "Gay",
    "Lesbian": "Lesbienne",
    "Bisexual": "Bisexuel(le)",
    "Pansexual": "Pansexuel(le)",
    "Queer": "Queer",
    "Questioning": "En Questionnement",
    "Asexual": "Asexuel(le)",
    "Demisexual": "Demisexuel(le)",
    "Aromantic": "Aromantique",
    "Omnisexual": "Omnisexuel(le)"
  };

  const REL_GOALS_FR: Record<string, string> = {
    "Long term partner": "Partenaire à long terme",
    "Long term not against Short term Crush": "Long terme ouvert à un crush éphémère",
    "Good Vibe Instant Crush": "Bonne vibe et coup de cœur instantané",
    "Short term Vibe leads to long term": "Vibe spontanée pouvant évoluer",
    "Not limit myself": "Sans étiquettes ni limites",
    "Let's figure after a date.": "À voir après un premier rendez-vous",
    "Travel Companion": "Compagnon de voyage",
    "Make New Frends": "Nouvelles amitiés",
    "Flat Mate": "Colocataire",
    "Social & Economical Support": "Soutien social et économique",
    "Sex Mate": "Partenaire intime"
  };

  const REL_TYPES_FR: Record<string, string> = {
    "Monogamous": "Monogame",
    "Polyamorous": "Polygame / Polyamoureux",
    "Open Relationship": "Relation Libre",
    "Ethical Non-Monogamy": "Non-Monogamie Éthique",
    "Open to Explore": "Ouvert(e) à explorer",
    "Libertinism Mindset": "Esprit Libertin",
    "Swinging Open": "Échangisme ouvert",
    "Open to Distant Relation": "Ouvert(e) à distance",
    "Digital Relationship": "Relation Virtuelle",
    "FWB": "Amis avec bénéfices (FWB)",
    "Not sure yet": "Pas encore fixé(e)"
  };

  const isExplicit = creatorPurposes.includes("Explicit 18+") || specialization === "Explicit";
  const isDatingSpecialized = specialization === "Dating & Marriage";
  const needsRelFields = isExplicit || isDatingSpecialized;

  // Localized string resolution helpers
  const getPurposeLabel = (p: string) => {
    if (lang === 'fr' && PURPOSES_FR[p]) return PURPOSES_FR[p];
    if (lang === 'es' && PURPOSES_ES[p]) return PURPOSES_ES[p];
    return p;
  };

  const getSpecLabel = (s: string) => {
    if (lang === 'fr' && SPECIALIZATIONS_FR[s]) return SPECIALIZATIONS_FR[s];
    if (lang === 'es' && SPECIALIZATIONS_ES[s]) return SPECIALIZATIONS_ES[s];
    return s;
  };

  const getSexPrefLabel = (sp: string) => {
    if (lang === 'fr' && SEXUAL_PREF_FR[sp]) return SEXUAL_PREF_FR[sp];
    if (lang === 'es' && SEXUAL_PREF_ES[sp]) return SEXUAL_PREF_ES[sp];
    return sp;
  };

  const getRelGoalLabel = (rg: string) => {
    if (lang === 'fr' && REL_GOALS_FR[rg]) return REL_GOALS_FR[rg];
    if (lang === 'es' && REL_GOALS_ES[rg]) return REL_GOALS_ES[rg];
    return rg;
  };

  const getRelTypeLabel = (rt: string) => {
    if (lang === 'fr' && REL_TYPES_FR[rt]) return REL_TYPES_FR[rt];
    if (lang === 'es' && REL_TYPES_ES[rt]) return REL_TYPES_ES[rt];
    return rt;
  };

  // Audio Synthesis & Subtitle states
  const [speechSupported, setSpeechSupported] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [subtitles, setSubtitles] = useState("");
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      synthRef.current = window.speechSynthesis;
      setSpeechSupported(true);
    }
  }, []);

  // Sync vocal text synthesis on step changes
  useEffect(() => {
    speakStepText();
    return () => stopVoice();
  }, [step, lang]);

  const stopVoice = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
    }
  };

  const speak = (text: string) => {
    if (!speechSupported || isMuted || !synthRef.current) {
      setSubtitles(text);
      return;
    }
    stopVoice();
    
    const utterance = new SpeechSynthesisUtterance(text);
    if (lang === "es") utterance.lang = "es-ES";
    else if (lang === "fr") utterance.lang = "fr-FR";
    else utterance.lang = "en-US";

    utterance.rate = 1.05;
    
    utterance.onboundary = (event) => {
      // Approximate subtitle highlights word by word
      const words = text.split(" ");
      const charIndex = event.charIndex;
      let cumulativeLength = 0;
      let wordIndex = 0;
      
      for (let i = 0; i < words.length; i++) {
        cumulativeLength += words[i].length + 1;
        if (cumulativeLength > charIndex) {
          wordIndex = i;
          break;
        }
      }
      const contextWords = words.slice(Math.max(0, wordIndex - 3), Math.min(words.length, wordIndex + 8));
      setSubtitles(contextWords.join(" ") + (wordIndex + 8 < words.length ? "..." : ""));
    };

    utterance.onend = () => {
      setSubtitles("");
    };

    currentUtteranceRef.current = utterance;
    synthRef.current.speak(utterance);
  };


  const speakStepText = () => {
    if (step === "lobby") {
      speak(`${t.lobby_title}. ${t.lobby_sub}. ${t.lobby_p1}`);
    } else if (step === "mode-select") {
      speak(`${t.vibe_title}. ${t.vibe_sub}`);
    } else if (step === "revenue-engine") {
      speak(translate("creatorQuest.main.speech_revenue", "Look at our Revenue Payout Math. Most platforms or agencies take up to 40% or more. SECCION keeps it flat: you retain 80% of all earnings."));
    } else if (step === "profile-setup") {
      speak(`${t.profile_title}. ${t.profile_sub}`);
    } else if (step === "stream-station") {
      speak(translate("creatorQuest.main.speech_stream", "Observe the Stream Station cockpit. Monitor simulated viewers and check out our Face Blur privacy and ephemeral media gates."));
    } else if (step === "monetization-suite") {
      speak(translate("creatorQuest.main.speech_monetization", "Review the 7 built-in streams. Additionally, see how our built-in AI Replacement Agent automates fan interactions 24/7."));
    } else if (step === "secret") {
      speak(`${t.secret_title}. ${t.secret_p1} ${t.secret_p2}`);
    }
  };

  const toggleMute = () => {
    if (isMuted) {
      setIsMuted(false);
      // Wait for state sync
      setTimeout(() => {
        speakStepText();
      }, 50);
    } else {
      stopVoice();
      setIsMuted(true);
      setSubtitles("");
    }
  };

  const getSubmitsData = () => {
    const isShieldOn = isMoroccoDetected && moroccoShieldActive;
    // Cache values in sessionStorage
    const data = {
      archetype: selectedVibe,
      role: "creator",
      language: lang,
      monetization_tier_price: tierPrice,
      privacy_face_blur: faceBlurActive,
      residence: residence.trim(),
      creator_purposes: creatorPurposes,
      specialization: specialization,
      sexual_preferences: sexualPreferences,
      relationship_goals: relationshipGoals,
      relationship_types: relationshipTypes,
      is_adult_content: isExplicit,
      morocco_domestic_shield: isShieldOn,
      blocked_countries: isShieldOn ? ["MA"] : []
    };
    sessionStorage.setItem("_onboarding_creator_archive_choice", selectedVibe);
    sessionStorage.setItem("_onboarding_creator_tier_price", tierPrice.toString());
    sessionStorage.setItem("_onboarding_creator_face_blur", faceBlurActive ? "true" : "false");
    sessionStorage.setItem("_onboarding_creator_residence", residence.trim());
    sessionStorage.setItem("_onboarding_creator_purposes", JSON.stringify(creatorPurposes));
    sessionStorage.setItem("_onboarding_creator_spec", specialization);
    sessionStorage.setItem("_onboarding_creator_sexual_preferences", JSON.stringify(sexualPreferences));
    sessionStorage.setItem("_onboarding_creator_relationship_goals", JSON.stringify(relationshipGoals));
    sessionStorage.setItem("_onboarding_creator_relationship_types", JSON.stringify(relationshipTypes));
    sessionStorage.setItem("_onboarding_creator_is_adult", isExplicit ? "true" : "false");
    sessionStorage.setItem("_onboarding_creator_morocco_shield", isShieldOn ? "true" : "false");
    if (isShieldOn) {
      sessionStorage.setItem("_onboarding_creator_blocked_countries", JSON.stringify(["MA"]));
    } else {
      sessionStorage.removeItem("_onboarding_creator_blocked_countries");
    }
    return data;
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col justify-between min-h-[85vh] p-4 md:p-8 bg-black/80 border border-white/10 rounded-3xl backdrop-blur-xl relative overflow-hidden shadow-2xl">
      {/* Laser line effect */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent animate-pulse" />

      {/* Top Header Row */}
      <div className="flex justify-between items-center border-b border-white/5 pb-4 z-10">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary text-glow" />
          <span className="text-sm font-black uppercase tracking-widest Outfit text-glow text-white">
            SECCION Studio Quest
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Language Selector */}
          <select
            value={lang}
            onChange={(e) => setLang(e.target.value as any)}
            className="bg-white/5 border border-white/15 rounded-lg px-2 py-1 text-[10px] font-black uppercase text-white tracking-wider outline-none hover:bg-white/10 transition cursor-pointer"
          >
            <option value="en" className="bg-neutral-900 text-white">EN</option>
            <option value="es" className="bg-neutral-900 text-white">ES</option>
            <option value="fr" className="bg-neutral-900 text-white">FR</option>
          </select>

          {/* Mute Button */}
          <button
            onClick={toggleMute}
            className="p-1.5 bg-white/5 border border-white/15 rounded-lg hover:bg-white/10 transition text-white"
            title="Toggle Voice Synthesizer"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-primary" />}
          </button>
        </div>
      </div>

      {/* Step Contents */}
      <div className="flex-1 flex flex-col items-center justify-center py-6 md:py-8 z-10 w-full">
        <AnimatePresence mode="wait">
          {/* LOBBY ENTRY */}
          {step === "lobby" && (
            <motion.div
              key="lobby"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="text-center space-y-6 max-w-lg"
            >
              <h1 className="text-3xl md:text-4xl font-black uppercase Outfit text-glow leading-tight">
                {t.lobby_title}
              </h1>
              <p className="text-xs text-white/60 leading-relaxed font-medium">
                {t.lobby_p1}
              </p>
              <p className="text-[11px] text-primary/80 font-bold uppercase tracking-wider">
                {t.lobby_p2}
              </p>
              <button
                onClick={() => setStep("mode-select")}
                className="px-8 py-4 bg-primary text-black font-black uppercase tracking-widest rounded-xl hover:shadow-[0_0_20px_rgba(102,252,241,0.4)] transition text-xs inline-flex items-center gap-2"
              >
                <Play className="w-4 h-4 fill-black text-black" />
                {t.lobby_cta}
              </button>
            </motion.div>
          )}

          {/* CHOOSE MODE */}
          {step === "mode-select" && (
            <motion.div
              key="mode-select"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full space-y-6 text-center max-w-lg"
            >
              <h3 className="text-2xl font-black uppercase Outfit">{t.vibe_title}</h3>
              <p className="text-xs text-white/50">{t.vibe_sub}</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Switch to Member */}
                <div
                  onClick={onSwitchToMember}
                  className="glass-card p-5 rounded-2xl border border-white/10 hover:border-pink-500/35 bg-white/2 hover:bg-pink-500/5 cursor-pointer text-left transition flex flex-col justify-between min-h-[160px]"
                >
                  <div>
                    <span className="text-2xl block mb-2">💘</span>
                    <h5 className="text-sm font-black uppercase text-white">Member Mode</h5>
                    <p className="text-[10px] text-white/40 mt-1 leading-normal font-medium">
                      Simulate dual Chemistry Meters, chat dynamics, and find compatible matches.
                    </p>
                  </div>
                  <span className="text-[9px] font-black uppercase text-pink-400 tracking-wider mt-4">
                    {t.hub_cta_member} &rarr;
                  </span>
                </div>

                {/* Continue as Creator */}
                <div
                  onClick={() => setStep("identity-setup")}
                  className="glass-card p-5 rounded-2xl border border-primary/20 bg-primary/5 hover:bg-primary/10 cursor-pointer text-left transition flex flex-col justify-between min-h-[160px] shadow-[0_0_15px_rgba(0,255,255,0.05)]"
                >
                  <div>
                    <span className="text-2xl block mb-2">👑</span>
                    <h5 className="text-sm font-black uppercase text-white">Creator Mode</h5>
                    <p className="text-[10px] text-white/40 mt-1 leading-normal font-medium">
                      Configure custom monetization, test progressive Face Blur, and explore 80% payout streams.
                    </p>
                  </div>
                  <span className="text-[9px] font-black uppercase text-primary tracking-wider mt-4">
                    {t.hub_cta_creator} &rarr;
                  </span>
                </div>
              </div>
            </motion.div>
          )}

          {/* IDENTITY SETUP */}
          {step === "identity-setup" && (
            <motion.div
              key="identity-setup"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full space-y-6 max-w-xl text-left mx-auto"
            >
              <div className="text-center space-y-2 mb-6">
                <h3 className="text-2xl font-black uppercase Outfit">
                  {lang === 'fr' ? 'Clés d\'Identité Débloquées' : lang === 'es' ? 'Claves de Identidad Desbloqueadas' : 'Identity Keys Unlocked'}
                </h3>
                <p className="text-xs text-white/50">
                  {lang === 'fr'
                    ? 'Définissez votre aura de créateur et connectez-vous immédiatement à votre audience cible.'
                    : lang === 'es'
                    ? 'Define tu aura de creador y conéctate con la audiencia adecuada de inmediato.'
                    : 'Define your creator aura and get matched to the right audience immediately.'}
                </p>
              </div>

              {/* Archetype */}
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-white/50 tracking-wider">
                  {lang === 'fr' ? 'Archétype de Studio' : lang === 'es' ? 'Arquetipo de Estudio' : 'Studio Archetype'}
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {CREATOR_ARCHETYPES.map((arch) => (
                    <div 
                      key={arch.id}
                      onClick={() => setSelectedVibe(arch.id)}
                      className={`p-4 rounded-xl border cursor-pointer transition flex flex-col items-center text-center space-y-2 ${selectedVibe === arch.id ? 'bg-primary/10 border-primary shadow-[0_0_15px_rgba(102,252,241,0.2)]' : 'bg-black/40 border-white/10 hover:border-white/20'}`}
                    >
                      <span className="text-2xl">{arch.emoji}</span>
                      <span className="text-[10px] font-black uppercase tracking-wider text-white">{arch.name}</span>
                      <p className="text-[9px] text-white/40 leading-tight">{arch.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Creator Purposes */}
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-white/50 tracking-wider">
                  {lang === 'fr' ? 'Auras d\'Intention du Créateur (Sélection Multiple)' : lang === 'es' ? 'Auras de Intención del Creador (Selecciona Múltiples)' : 'Creator Intent Auras (Select Multiple)'}
                </label>
                <div className="flex flex-wrap gap-2">
                  {PURPOSES.map(p => (
                    <button
                      key={p}
                      onClick={() => {
                        if (creatorPurposes.includes(p)) {
                          setCreatorPurposes(creatorPurposes.filter(x => x !== p));
                        } else {
                          setCreatorPurposes([...creatorPurposes, p]);
                        }
                      }}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition cursor-pointer ${creatorPurposes.includes(p) ? 'bg-primary border-primary text-black' : 'bg-black/40 border-white/20 text-white hover:border-white/40'}`}
                    >
                      {getPurposeLabel(p)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Specialization */}
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-white/50 tracking-wider">
                  {lang === 'fr' ? 'Synergie de Contenu Principale' : lang === 'es' ? 'Sinergia de Contenido Principal' : 'Primary Content Synergy'}
                </label>
                <select 
                  value={specialization}
                  onChange={(e) => setSpecialization(e.target.value)}
                  className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-xs text-white focus:border-primary outline-none cursor-pointer"
                >
                  <option value="">{lang === 'fr' ? 'Sélectionnez votre domaine principal...' : lang === 'es' ? 'Selecciona tu dominio principal...' : 'Select your main domain...'}</option>
                  {SPECIALIZATIONS.map(s => (
                    <option key={s} value={s}>{getSpecLabel(s)}</option>
                  ))}
                </select>
              </div>

              {/* Conditional Required Fields based on Purpose */}
              {needsRelFields && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="space-y-4 pt-4 border-t border-white/10">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm">🔥</span>
                    <h4 className="text-[11px] font-black uppercase tracking-widest text-primary">
                      {lang === 'fr' ? 'Ciblage Avancé d\'Audience' : lang === 'es' ? 'Segmentación Avanzada de Audiencia' : 'Advanced Audience Targeting'}
                    </h4>
                  </div>
                  <p className="text-[10px] text-white/50 leading-relaxed mb-4">
                    {lang === 'fr'
                      ? 'Puisque votre intention inclut des thématiques spécialisées ou pour adultes, nous requérons vos préférences d\'audience. L\'âge et la localisation stricte seront vérifiés de manière sécurisée via DIDIT Zero-Knowledge à l\'étape suivante.'
                      : lang === 'es'
                      ? 'Dado que tu contenido incluye temáticas especializadas o para adultos, requerimos tus preferencias de mapeo de audiencia. La edad y ubicación estricta se verificarán de forma segura mediante DIDIT KYC en el siguiente paso.'
                      : 'Because your intent includes specialized or mature themes, we require your audience mapping preferences. Age and strict location will be securely locked via DIDIT KYC in the next step.'}
                  </p>
                  
                  {isExplicit && (
                    <div className="space-y-2">
                      <label className="text-[9px] font-black uppercase text-white/40 tracking-wider">
                        {lang === 'fr' ? 'Matrice de Préférence Sexuelle (Sélection Multiple)' : lang === 'es' ? 'Matriz de Preferencia Sexual (Selecciona Múltiples)' : 'Sexual Preference Matrix (Select Multiple)'}
                      </label>
                      <div className="flex flex-wrap gap-1.5">
                        {SEXUAL_PREFERENCES.map(sp => {
                          const isSelected = sexualPreferences.includes(sp);
                          return (
                            <button
                              key={sp}
                              type="button"
                              onClick={() => {
                                if (isSelected) {
                                  setSexualPreferences(sexualPreferences.filter(x => x !== sp));
                                } else {
                                  setSexualPreferences([...sexualPreferences, sp]);
                                }
                              }}
                              className={`px-2.5 py-1.5 rounded-lg border text-[10px] font-bold transition cursor-pointer ${
                                isSelected
                                  ? 'bg-[#00fbfb] border-[#00fbfb] text-black shadow-[0_0_10px_rgba(0,251,251,0.3)]'
                                  : 'bg-black/40 border-white/15 text-white/70 hover:border-white/40 hover:text-white'
                              }`}
                            >
                              {getSexPrefLabel(sp)}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Relationship Goals (Multi-select up to 5) */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-[9px] font-black uppercase text-white/40 tracking-wider">
                        {lang === 'fr' ? 'Objectifs Relationnels (Jusqu\'à 5)' : lang === 'es' ? 'Metas de Relación (Selecciona hasta 5)' : 'Relationship Goals (Select up to 5)'}
                      </label>
                      <span className="text-[8px] font-mono text-[#00fbfb]">
                        {relationshipGoals.length}/5 {lang === 'fr' ? 'sélectionnés' : lang === 'es' ? 'seleccionadas' : 'selected'}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {RELATIONSHIP_GOALS.map(rg => {
                        const isSelected = relationshipGoals.includes(rg);
                        return (
                          <button
                            key={rg}
                            type="button"
                            onClick={() => {
                              if (isSelected) {
                                setRelationshipGoals(relationshipGoals.filter(x => x !== rg));
                              } else {
                                if (relationshipGoals.length >= 5) return;
                                setRelationshipGoals([...relationshipGoals, rg]);
                              }
                            }}
                            className={`px-2.5 py-1.5 rounded-lg border text-[10px] font-bold transition cursor-pointer ${
                              isSelected
                                ? 'bg-[#00fbfb] border-[#00fbfb] text-black shadow-[0_0_10px_rgba(0,251,251,0.3)]'
                                : 'bg-black/40 border-white/15 text-white/70 hover:border-white/40 hover:text-white'
                            }`}
                          >
                            {getRelGoalLabel(rg)}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Relationship Types (Multi-select up to 5) */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-[9px] font-black uppercase text-white/40 tracking-wider">
                        {lang === 'fr' ? 'Types de Relation (Jusqu\'à 5)' : lang === 'es' ? 'Tipos de Relación (Selecciona hasta 5)' : 'Relationship Types (Select up to 5)'}
                      </label>
                      <span className="text-[8px] font-mono text-[#00fbfb]">
                        {relationshipTypes.length}/5 {lang === 'fr' ? 'sélectionnés' : lang === 'es' ? 'seleccionados' : 'selected'}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {RELATIONSHIP_TYPES.map(rt => {
                        const isSelected = relationshipTypes.includes(rt);
                        return (
                          <button
                            key={rt}
                            type="button"
                            onClick={() => {
                              if (isSelected) {
                                setRelationshipTypes(relationshipTypes.filter(x => x !== rt));
                              } else {
                                if (relationshipTypes.length >= 5) return;
                                setRelationshipTypes([...relationshipTypes, rt]);
                              }
                            }}
                            className={`px-2.5 py-1.5 rounded-lg border text-[10px] font-bold transition cursor-pointer ${
                              isSelected
                                ? 'bg-[#00fbfb] border-[#00fbfb] text-black shadow-[0_0_10px_rgba(0,251,251,0.3)]'
                                : 'bg-black/40 border-white/15 text-white/70 hover:border-white/40 hover:text-white'
                            }`}
                          >
                            {getRelTypeLabel(rt)}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              )}

              <button
                onClick={() => {
                  if (creatorPurposes.length === 0 || !specialization) {
                    alert(lang === 'fr' ? "Veuillez sélectionner au moins une Aura d'Intention et votre Synergie de Contenu pour continuer." : lang === 'es' ? "Por favor selecciona al menos un Aura de Intención y tu Sinergia de Contenido." : "Please select at least one Intent Aura and your Content Synergy to proceed.");
                    return;
                  }
                  if (needsRelFields && (relationshipGoals.length === 0 || relationshipTypes.length === 0 || (isExplicit && sexualPreferences.length === 0))) {
                    alert(lang === 'fr' ? "Veuillez compléter tous les champs de Ciblage Avancé d'Audience requis pour votre intention." : lang === 'es' ? "Por favor completa todos los campos de Segmentación Avanzada requeridos para tu intención." : "Please complete all Advanced Audience Targeting fields required for your intent.");
                    return;
                  }
                  setStep("revenue-engine");
                }}
                className="w-full bg-primary text-black font-black uppercase tracking-widest py-4 rounded-xl hover:shadow-[0_0_20px_rgba(102,252,241,0.4)] transition text-xs flex items-center justify-center gap-2 mt-6 cursor-pointer"
              >
                {lang === 'fr' ? 'Activer le Moteur de Revenus →' : lang === 'es' ? 'Activar Motor de Ingresos →' : 'Engage Revenue Engine →'}
              </button>
            </motion.div>
          )}

          {/* REVENUE MODEL */}
          {step === "revenue-engine" && (
            <motion.div
              key="revenue"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full"
            >
              <RevenueEngineDemo onComplete={() => setStep("profile-setup")} />
            </motion.div>
          )}

          {/* PROFILE SETUP */}
          {step === "profile-setup" && (
            <motion.div
              key="profile"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full space-y-6 max-w-lg"
            >
              <div className="text-center">
                <span className="text-[10px] uppercase tracking-widest font-black text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
                  Profile Customizer
                </span>
                <h4 className="text-2xl font-black tracking-tight mt-2 uppercase Outfit">
                  {t.profile_title}
                </h4>
                <p className="text-xs text-white/50 mt-1">{t.profile_sub}</p>
              </div>

              <div className="space-y-4 text-left">
                {/* Select Creator Archetype */}
                <div className="space-y-2">
                  <span className="text-[9px] font-black uppercase text-white/40 tracking-wider">
                    Select Creator Persona
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    {CREATOR_ARCHETYPES.map((a) => (
                      <button
                        key={a.id}
                        onClick={() => setSelectedVibe(a.id)}
                        className={`p-3 rounded-xl border text-center transition flex flex-col items-center gap-1 ${
                          selectedVibe === a.id
                            ? "bg-primary border-primary text-black"
                            : "bg-white/5 border-white/10 text-white hover:bg-white/10"
                        }`}
                      >
                        <span className="text-lg">{a.emoji}</span>
                        <span className="text-[8px] font-black uppercase tracking-wider block">{a.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sub price slider */}
                <div className="glass-card p-4 rounded-xl border border-white/10 bg-white/2 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-black uppercase text-white/50 tracking-wider">
                      Custom Subscription Price
                    </span>
                    <span className="text-xs font-mono font-bold text-primary">
                      ${tierPrice.toFixed(2)}/mo
                    </span>
                  </div>
                  <input
                    type="range"
                    min="4.99"
                    max="49.99"
                    step="1.00"
                    value={tierPrice}
                    onChange={(e) => setTierPrice(parseFloat(e.target.value))}
                    className="w-full accent-primary bg-white/10 rounded-lg cursor-pointer"
                  />
                </div>

                {/* Stealth Mode / Face Blur Privacy Gate */}
                <div className="glass-card p-4 rounded-xl border border-white/10 bg-white/2 space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs">🛡️</span>
                        <span className="text-[10px] font-black uppercase text-white tracking-wider">
                          {lang === 'es' ? 'Modo Sigilo: Difuminado Gradual de Privacidad' : 'Stealth Mode: Gradual Privacy Face Blur'}
                        </span>
                      </div>
                      <p className="text-[9px] text-white/50 leading-relaxed max-w-md">
                        {lang === 'es'
                          ? 'Tu rostro permanece con un desenfoque elegante y estético en los feeds públicos y para perfiles sin match. Se revela de forma gradual y nítida solo cuando un fan alcanza el Nivel 3 de Química (interacciones mutuas genuinas) o se suscribe como VIP.'
                          : 'Your face stays softly and aesthetically blurred in public feeds and for unmatched visitors. It smoothly and gradually unblurs only when a member reaches Level 3 Chemistry (genuine mutual connection) or becomes your VIP backer.'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFaceBlurActive(!faceBlurActive)}
                      className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider border transition cursor-pointer shrink-0 ${
                        faceBlurActive
                          ? "bg-primary border-primary text-black shadow-[0_0_10px_rgba(0,251,251,0.3)]"
                          : "bg-white/5 border-white/10 text-white/40 hover:text-white"
                      }`}
                    >
                      {faceBlurActive ? (lang === 'es' ? 'Activado' : 'Active') : (lang === 'es' ? 'Desactivado' : 'Inactive')}
                    </button>
                  </div>

                  {/* Level 3 Chemistry Milestone Breakdown Badge */}
                  <div className="p-2.5 rounded-lg bg-black/40 border border-white/5 flex items-center justify-between text-[8px] font-mono text-white/40">
                    <span className="flex items-center gap-1.5">
                      <span className="text-primary font-bold">🔒 Level 1–2:</span>
                      {lang === 'es' ? 'Visitantes / Sin match (Rostro difuminado)' : 'Unmatched / Exploring (Aesthetic Face Blur)'}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="text-[#00fbfb] font-bold">✨ Level 3+:</span>
                      {lang === 'es' ? 'Sinergia mutua / VIP (Rostro 100% visible)' : 'Mutual Chemistry / VIP Backer (100% Crystal Clear)'}
                    </span>
                  </div>
                </div>

                {/* Residence Input & Moroccan Privacy Shield */}
                <div className="glass-card p-4 rounded-xl border border-white/10 bg-white/2 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-black uppercase text-white/50 tracking-wider">
                      {lang === 'fr'
                        ? 'Pays / État de Résidence Fiscale (Obligatoire)'
                        : lang === 'es'
                        ? 'País / Estado de Residencia Fiscal (Obligatorio)'
                        : 'Tax Residence Country / State (Required)'}
                    </span>
                    {isMoroccoDetected && (
                      <span className="text-[9px] font-mono font-bold text-primary flex items-center gap-1">
                        <span>🇲🇦</span>
                        <span>{lang === 'fr' ? 'Bouclier Maroc Prêt' : lang === 'es' ? 'Escudo Marruecos Listo' : 'Morocco Shield Ready'}</span>
                      </span>
                    )}
                  </div>
                  <input
                    type="text"
                    placeholder="e.g. Morocco (MA), Alicante (ES), Paris (FR)"
                    value={residence}
                    onChange={(e) => {
                      const val = e.target.value;
                      setResidence(val);
                      if (val.trim()) setResidenceError(false);
                      const isMo = checkIsMorocco(val);
                      setIsMoroccoDetected(isMo);
                      if (isMo && !moroccoShieldActive) setMoroccoShieldActive(true);
                    }}
                    className={`w-full px-4 py-3 bg-black/40 border rounded-xl text-xs text-white placeholder-white/20 focus:border-primary focus:outline-none transition ${
                      residenceError ? "border-red-500/50" : "border-white/10"
                    }`}
                  />
                  {residenceError && (
                    <span className="text-[9px] font-bold text-red-400 uppercase tracking-wide block mt-1">
                      {lang === 'fr'
                        ? 'La résidence est requise pour la conformité fiscale et légale.'
                        : lang === 'es'
                        ? 'La residencia es obligatoria para cumplimiento fiscal y legal.'
                        : 'Residence is required for tax and legal compliance.'}
                    </span>
                  )}

                  {/* 1-Click Country & Privacy Presets */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setResidence("Morocco (MA)");
                        setIsMoroccoDetected(true);
                        setMoroccoShieldActive(true);
                        setResidenceError(false);
                      }}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-mono border transition flex items-center gap-1.5 cursor-pointer ${
                        isMoroccoDetected
                          ? "bg-primary/20 border-primary text-white"
                          : "bg-white/5 border-white/10 text-white/60 hover:text-white"
                      }`}
                    >
                      <span>🇲🇦</span>
                      <span>Morocco (MA) + Privacy Shield</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setResidence("Spain (ES)");
                        setIsMoroccoDetected(false);
                        setResidenceError(false);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] font-mono text-white/60 hover:text-white transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>🇪🇸</span>
                      <span>Spain (ES)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setResidence("France (FR)");
                        setIsMoroccoDetected(false);
                        setResidenceError(false);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] font-mono text-white/60 hover:text-white transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>🇫🇷</span>
                      <span>France (FR)</span>
                    </button>
                  </div>

                  {/* Moroccan Domestic Privacy Shield HUD */}
                  {isMoroccoDetected && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3.5 mt-2 rounded-xl border border-primary/40 bg-gradient-to-r from-primary/10 via-black/40 to-primary/5 space-y-2.5"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-base">🇲🇦</span>
                          <span className="text-xs font-black uppercase text-primary tracking-wider">
                            {t.morocco_shield_title}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setMoroccoShieldActive(!moroccoShieldActive)}
                          className={`px-3 py-1 rounded-lg text-[10px] font-mono font-bold uppercase transition cursor-pointer ${
                            moroccoShieldActive
                              ? "bg-primary text-black shadow-[0_0_12px_rgba(0,251,251,0.4)]"
                              : "bg-white/10 text-white/40 hover:text-white"
                          }`}
                        >
                          {moroccoShieldActive
                            ? (lang === 'fr' ? 'Activé' : lang === 'es' ? 'Activado' : 'Active')
                            : (lang === 'fr' ? 'Désactivé' : lang === 'es' ? 'Desactivado' : 'Disabled')}
                        </button>
                      </div>

                      <p className="text-[11px] text-[#b9cac9] leading-relaxed">
                        {t.morocco_shield_desc}
                      </p>

                      <div className="grid grid-cols-3 gap-2 pt-1 text-[8.5px] font-mono">
                        <div className="p-2 rounded-lg bg-black/50 border border-white/10 flex flex-col gap-0.5 text-center">
                          <span className="text-primary font-bold">1-Click 'MA' Geoblock</span>
                          <span className="text-white/60">{moroccoShieldActive ? "ENFORCED" : "OFF"}</span>
                        </div>
                        <div className="p-2 rounded-lg bg-black/50 border border-white/10 flex flex-col gap-0.5 text-center">
                          <span className="text-primary font-bold">ZKP Face Blur</span>
                          <span className="text-white/60">{faceBlurActive ? "ENFORCED" : "OFF"}</span>
                        </div>
                        <div className="p-2 rounded-lg bg-black/50 border border-white/10 flex flex-col gap-0.5 text-center">
                          <span className="text-primary font-bold">B2B Export Invoice</span>
                          <span className="text-white/60">0% IVA · 70% DEVISES</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>

              <button
                onClick={() => {
                  if (!residence.trim()) {
                    setResidenceError(true);
                    return;
                  }
                  setResidenceError(false);
                  setStep("stream-station");
                }}
                className="w-full bg-primary text-black font-black uppercase tracking-widest py-4 rounded-xl hover:shadow-[0_0_20px_rgba(102,252,241,0.4)] transition text-xs flex items-center justify-center gap-2"
              >
                {t.profile_cta}
              </button>
            </motion.div>
          )}

          {/* STREAM COCKPIT */}
          {step === "stream-station" && (
            <motion.div
              key="stream"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full"
            >
              <StreamStationDemo onComplete={() => setStep("monetization-suite")} />
            </motion.div>
          )}

          {/* MONETIZATION SUITE */}
          {step === "monetization-suite" && (
            <motion.div
              key="monetization"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full"
            >
              <MonetizationSuiteDemo onComplete={() => setStep("secret")} />
            </motion.div>
          )}

          {/* SECRET PIVOT / RECAP */}
          {step === "secret" && (
            <motion.div
              key="secret"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="text-center space-y-6 max-w-lg"
            >
              <div className="flex justify-center mb-2">
                <div className="p-3 bg-primary/10 border border-primary/20 rounded-full text-primary animate-pulse">
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
                  disabled={isSubmitting}
                  onClick={async () => {
                    if (isSubmitting) return;
                    setIsSubmitting(true);
                    stopVoice();
                    try {
                      const primarySexPref = sexualPreferences.length > 0 ? sexualPreferences[0] : "";
                      const primaryGoal = relationshipGoals.length > 0 ? relationshipGoals[0] : "";
                      const primaryType = relationshipTypes.length > 0 ? relationshipTypes[0] : "";
                      if (typeof window !== "undefined") {
                        sessionStorage.setItem("_onboarding_creator_vibe", selectedVibe);
                        sessionStorage.setItem("_onboarding_creator_tier_price", tierPrice.toString());
                        sessionStorage.setItem("_onboarding_creator_face_blur", faceBlurActive.toString());
                        sessionStorage.setItem("_onboarding_creator_residence", residence);
                        sessionStorage.setItem("_onboarding_creator_purposes", JSON.stringify(creatorPurposes));
                        sessionStorage.setItem("_onboarding_creator_spec", specialization);
                        sessionStorage.setItem("_onboarding_creator_specialization", specialization);
                        sessionStorage.setItem("_onboarding_creator_sexual_preferences", JSON.stringify(sexualPreferences));
                        sessionStorage.setItem("_onboarding_creator_sexual_preference", primarySexPref);
                        sessionStorage.setItem("_onboarding_creator_relationship_goals", JSON.stringify(relationshipGoals));
                        sessionStorage.setItem("_onboarding_creator_relationship_goal", primaryGoal);
                        sessionStorage.setItem("_onboarding_creator_relationship_types", JSON.stringify(relationshipTypes));
                        sessionStorage.setItem("_onboarding_creator_relationship_type", primaryType);
                        sessionStorage.setItem("_onboarding_creator_archive_choice", selectedVibe);
                      }
                      await onSignUp({
                        archetype: selectedVibe,
                        role: "creator",
                        creator_purposes: creatorPurposes,
                        specialization: specialization,
                        sexual_preferences: sexualPreferences,
                        relationship_goals: relationshipGoals,
                        relationship_types: relationshipTypes,
                        is_adult_content: isExplicit
                      });
                    } catch (err) {
                      console.error("[CreatorQuest] Error on claim studio:", err);
                      setIsSubmitting(false);
                    }
                  }}
                  className="w-full bg-primary text-black font-black uppercase tracking-widest py-4 rounded-xl hover:shadow-[0_0_20px_rgba(102,252,241,0.4)] transition text-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-black" />
                      <span>{lang === 'es' ? 'Reclamando Estudio...' : 'Claiming Studio...'}</span>
                    </>
                  ) : (
                    t.secret_cta
                  )}
                </button>
                <button
                  onClick={() => {
                    stopVoice();
                    window.location.href = "/";
                  }}
                  className="w-full py-4 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl text-xs font-black uppercase tracking-widest text-white transition cursor-pointer"
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
