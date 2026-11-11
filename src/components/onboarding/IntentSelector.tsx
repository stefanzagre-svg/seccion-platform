"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Loader2,
  CheckCircle2,
  Palette,
  Dumbbell,
  Briefcase,
  Brain,
  Cpu,
  Utensils,
  Heart,
  Sparkles,
  Flame,
  Sliders,
  Info,
  Check,
} from 'lucide-react';
import { useTranslation } from '@/context/LanguageContext';
import {
  type MemberPurposeId,
  buildArchetypeSynergyDefaults,
  normalizeArchetypeId,
  normalizePassionId,
  ARCHETYPE_AVATARS,
  MEMBER_VIBE_CHIPS,
  MEMBER_VIBE_CHIPS_ES,
} from '@/lib/constants';
import SeccionWordmark from '@/components/ui/SeccionWordmark';

const ARCHETYPE_OPTIONS = [
  { id: 'visionary', label: 'The Visionary', labelEs: 'El Visionario', icon: '🚀', desc: 'Strategic thinker, ambitious & future-driven', descEs: 'Pensador estratégico, ambicioso e innovador' },
  { id: 'rebel', label: 'The Rebel', labelEs: 'El Rebelde', icon: '🔥', desc: 'Unfiltered, magnetic & high-agency', descEs: 'Sin filtros, magnético y de alta iniciativa' },
  { id: 'hedonist', label: 'The Hedonist', labelEs: 'El Hedonista', icon: '🥂', desc: 'Sensory luxury, fine dining & pleasure', descEs: 'Lujo sensorial, gastronomía y placer' },
  { id: 'explorer', label: 'The Explorer', labelEs: 'El Explorador', icon: '🌍', desc: 'Spontaneous, global & adventure-driven', descEs: 'Espontáneo, global y aventurero' },
  { id: 'alchemist', label: 'The Alchemist', labelEs: 'El Alquimista', icon: '🧪', desc: 'Intuitive, transformative & high-frequency', descEs: 'Intuitivo, transformador y de alta vibración' },
  { id: 'dreamer', label: 'The Dreamer', labelEs: 'El Soñador', icon: '✨', desc: 'Romantic, poetic & artistic soul', descEs: 'Alma romántica, poética y artística' },
  { id: 'creator', label: 'The Creator', labelEs: 'El Creador', icon: '🎬', desc: 'Expressive, artistic & magnetic spotlight', descEs: 'Expresivo, artístico y creativo' },
  { id: 'protector', label: 'The Protector', labelEs: 'El Protector', icon: '🛡️', desc: 'Grounded, disciplined & loyal strength', descEs: 'Firme, disciplinado y leal' },
  { id: 'caregiver', label: 'The Caregiver', labelEs: 'El Cuidador', icon: '💝', desc: 'Warm, nurturing & deeply empathetic', descEs: 'Cálido, cercano y profundamente empático' },
];

const CORE_PASSIONS = [
  { id: 'ai_tech', label: 'AI & Software Architecture', labelEs: 'IA y Arquitectura de Software', icon: <Cpu className="w-6 h-6 text-[#00fbfb]" />, desc: 'AI courses, coding mentorship & custom builds', descEs: 'Cursos de IA, mentoría de código y proyectos', color: 'border-[#00fbfb]/40 shadow-[#00fbfb]/25 bg-[#00fbfb]/10' },
  { id: 'culinary', label: 'Culinary & Gastronomy', labelEs: 'Gastronomía y Arte Culinario', icon: <Utensils className="w-6 h-6 text-[#10b981]" />, desc: 'Gourmet cooking, wine pairing & tastings', descEs: 'Alta cocina, maridaje y experiencias gourmet', color: 'border-[#10b981]/40 shadow-[#10b981]/25 bg-[#10b981]/10' },
  { id: 'dating', label: 'Romance & Real Connection', labelEs: 'Romance y Conexión Real', icon: <Heart className="w-6 h-6 text-[#ff204e]" />, desc: 'Chemistry sparks, VIP access & genuine vibes', descEs: 'Química real, acceso VIP y conexión auténtica', color: 'border-[#ff204e]/40 shadow-[#ff204e]/25 bg-[#ff204e]/10' },
  { id: 'fitness', label: 'Fitness & Vitality', labelEs: 'Fitness y Vitalidad', icon: <Dumbbell className="w-6 h-6 text-[#84cc16]" />, desc: 'Biohacking, workout habits, stamina & wellness', descEs: 'Biohacking, entrenamiento, energía y bienestar', color: 'border-[#84cc16]/40 shadow-[#84cc16]/25 bg-[#84cc16]/10' },
  { id: 'career', label: 'Career & Wealth Building', labelEs: 'Carrera y Crecimiento Financiero', icon: <Briefcase className="w-6 h-6 text-[#f59e0b]" />, desc: 'Startup strategy, mentorship & wealth growth', descEs: 'Estrategia de negocios, mentoría y finanzas', color: 'border-[#f59e0b]/40 shadow-[#f59e0b]/25 bg-[#f59e0b]/10' },
  { id: 'creative', label: 'Art, Music & Creative Flow', labelEs: 'Arte, Música y Flujo Creativo', icon: <Palette className="w-6 h-6 text-[#a855f7]" />, desc: 'Visual media, acoustics, performance & curation', descEs: 'Arte visual, música, performance y estética', color: 'border-[#a855f7]/40 shadow-[#a855f7]/25 bg-[#a855f7]/10' },
  { id: 'wellness', label: 'Mindset & Holistic Wellness', labelEs: 'Mentalidad y Bienestar Holístico', icon: <Brain className="w-6 h-6 text-[#14b8a6]" />, desc: 'Meditation, somatic healing & high-frequency calm', descEs: 'Meditación, equilibrio y calma de alta frecuencia', color: 'border-[#14b8a6]/40 shadow-[#14b8a6]/25 bg-[#14b8a6]/10' },
  { id: 'adult', label: '18+ Sensual & Unfiltered', labelEs: '18+ Sensual y Sin Filtros', icon: <Flame className="w-6 h-6 text-[#dc143c]" />, desc: 'Behind closed doors, adult VIP perks & sensual art', descEs: 'Acceso exclusivo 18+, beneficios VIP y arte sensual', color: 'border-[#dc143c]/40 shadow-[#dc143c]/25 bg-[#dc143c]/10' },
];

const ALL_VIBE_PILLS = [
  'Deep Talk',
  'Intellectual',
  'Late Night Vibes',
  'Ambitious',
  'Spontaneous',
  'High Energy',
  'Romantic',
  'Luxury & Wine',
  'Sensual',
  'Adventure',
  'Travel & Culture',
  'Active',
  'Spiritual',
  'Zen & Calm',
  'Creative Flow',
  'Artistic',
  'Nightlife',
  'Bold & Unfiltered',
  'Music & Beats',
  'Fitness & Health',
  'Grounded',
  'Warm & Loyal',
];

const ALL_HOBBY_PILLS = [
  'AI & Tech',
  'Philosophy',
  'Reading',
  'Chess',
  'Podcasts',
  'Coffee Culture',
  'Startups',
  'Investing',
  'Fitness',
  'Networking',
  'Travel',
  'Motorsports',
  'Fine Dining',
  'Wine Tasting',
  'Art Galleries',
  'Music Festivals',
  'Mixology',
  'Fashion',
  'Adventure Sports',
  'Photography',
  'Surfing',
  'Hiking',
  'Meditation',
  'Yoga',
  'Astrology',
  'Breathwork',
  'Sound Healing',
  'Cinema',
  'Poetry',
  'Live Music',
  'Nightlife',
  'DJing',
  'Streetwear',
  'Cooking',
];

export interface CalibratedSynergyPayload {
  archetype: string;
  corePassion: string;
  displayAge: number;
  moods: string[];
  hobbies: string[];
  lifestyleHabits: Record<string, string>;
  bioPromptCategory: string;
  bioPromptQuestion: string;
  bioPromptAnswer: string;
  avatarUrl: string;
}

export default function IntentSelector({
  activePurposes,
  onContinue,
}: {
  activePurposes: MemberPurposeId[];
  onContinue: (
    intents: string[],
    displayAge: number,
    corePassion: string,
    calibratedSynergy?: CalibratedSynergyPayload
  ) => Promise<void> | void;
}) {
  const { locale } = useTranslation();
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedArchetype, setSelectedArchetype] = useState<string>('rebel');
  const [selectedPassion, setSelectedPassion] = useState<string>('ai_tech');
  const [displayAge, setDisplayAge] = useState<number>(26);

  // Auto-filled signals (editable inline in Step 2)
  const initialDefaults = buildArchetypeSynergyDefaults('rebel', 'ai_tech', locale === 'es' ? 'es' : 'en');
  const [moods, setMoods] = useState<string[]>(initialDefaults.moods);
  const [hobbies, setHobbies] = useState<string[]>(initialDefaults.hobbies);
  const [lifestyleHabits, setLifestyleHabits] = useState<Record<string, string>>(initialDefaults.lifestyle_habits);
  const [bioPromptCategory, setBioPromptCategory] = useState<string>(initialDefaults.bio_prompt_category);
  const [bioPromptQuestion, setBioPromptQuestion] = useState<string>(initialDefaults.bio_prompt_question);
  const [bioPromptAnswer, setBioPromptAnswer] = useState<string>(initialDefaults.bio_prompt_answer);
  const [avatarUrl, setAvatarUrl] = useState<string>(initialDefaults.avatar_url);
  const [showHabitEditor, setShowHabitEditor] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const applySmartCalibration = (archId: string, passionId: string) => {
    const defaults = buildArchetypeSynergyDefaults(archId, passionId, locale === 'es' ? 'es' : 'en');
    setMoods(defaults.moods);
    setHobbies(defaults.hobbies);
    setLifestyleHabits(defaults.lifestyle_habits);
    setBioPromptCategory(defaults.bio_prompt_category);
    setBioPromptQuestion(defaults.bio_prompt_question);
    setBioPromptAnswer(defaults.bio_prompt_answer);
    setAvatarUrl(defaults.avatar_url);
  };

  const handleSelectArchetype = (archId: string) => {
    setSelectedArchetype(archId);
    applySmartCalibration(archId, selectedPassion);
  };

  const handleSelectPassion = (passionId: string) => {
    setSelectedPassion(passionId);
    applySmartCalibration(selectedArchetype, passionId);
  };

  const toggleMood = (pill: string) => {
    setMoods((prev) =>
      prev.includes(pill) ? prev.filter((m) => m !== pill) : prev.length < 5 ? [...prev, pill] : prev
    );
  };

  const toggleHobby = (pill: string) => {
    setHobbies((prev) =>
      prev.includes(pill) ? prev.filter((h) => h !== pill) : prev.length < 10 ? [...prev, pill] : prev
    );
  };

  const handleFinish = async () => {
    setIsSubmitting(true);
    try {
      const canonicalArch = normalizeArchetypeId(selectedArchetype);
      const canonicalPassion = normalizePassionId(selectedPassion, canonicalArch);
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('_onboarding_archetype_choice', canonicalArch);
      }
      await onContinue(moods, displayAge, canonicalPassion, {
        archetype: canonicalArch,
        corePassion: canonicalPassion,
        displayAge,
        moods,
        hobbies,
        lifestyleHabits,
        bioPromptCategory,
        bioPromptQuestion,
        bioPromptAnswer,
        avatarUrl,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const vibeChips = locale === 'es' ? MEMBER_VIBE_CHIPS_ES : MEMBER_VIBE_CHIPS;

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-[#141422]/90 backdrop-blur-xl border border-white/10 rounded-[32px] p-6 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
        {/* Progress Dots */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            {[1, 2].map((i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  step === i
                    ? 'w-10 bg-primary shadow-[0_0_10px_rgba(102,252,241,0.8)]'
                    : step > i
                    ? 'w-5 bg-primary/50'
                    : 'w-5 bg-white/10'
                }`}
              />
            ))}
          </div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-primary font-bold">
            {locale === 'es' ? `Paso ${step} de 2 · Sinergia 60s` : `Step ${step} of 2 · 60s Synergy`}
          </span>
        </div>

        <AnimatePresence mode="wait">
          {/* STEP 1: ARCHETYPE + CORE PASSION + DISPLAY AGE */}
          {step === 1 && (
            <motion.div
              key="step-1"
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              className="space-y-6 text-left"
            >
              <div className="text-center space-y-1">
                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  {locale === 'es' ? 'Calibra tu Motor de Sinergia' : 'Calibrate Your Synergy Engine'}
                </h2>
                <p className="text-xs text-white/60">
                  {locale === 'es'
                    ? 'Elige tu Arquetipo y tu Pasión Principal. Pre-calibraremos tus vibras, hobbies y hábitos automáticamente.'
                    : 'Pick your Archetype and Core Passion. We auto-calibrate your vibes, hobbies, and habits in one tap.'}
                </p>
              </div>

              {/* 1. Archetype Grid */}
              <div className="space-y-2">
                <label className="text-[10px] font-mono uppercase tracking-widest text-primary font-bold block">
                  {locale === 'es' ? '1. Elige tu Arquetipo Principal' : '1. Choose Your Core Archetype'}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {ARCHETYPE_OPTIONS.map((arch) => {
                    const isSelected = selectedArchetype === arch.id;
                    return (
                      <button
                        key={arch.id}
                        type="button"
                        onClick={() => handleSelectArchetype(arch.id)}
                        className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? 'bg-primary/15 border-primary shadow-[0_0_15px_rgba(0,251,251,0.25)]'
                            : 'bg-white/5 border-white/10 hover:bg-white/10'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-lg">{arch.icon}</span>
                          {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-primary" />}
                        </div>
                        <div>
                          <div className="text-[11px] font-bold text-white leading-tight">
                            {locale === 'es' ? arch.labelEs : arch.label}
                          </div>
                          <div className="text-[9px] text-white/50 line-clamp-1 mt-0.5">
                            {locale === 'es' ? arch.descEs : arch.desc}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Core Passion Grid */}
              <div className="space-y-2">
                <label className="text-[10px] font-mono uppercase tracking-widest text-primary font-bold block">
                  {locale === 'es' ? '2. Tu Pasión Principal (El Combustible)' : '2. Your Core Passion (The Fuel)'}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[210px] overflow-y-auto pr-1 custom-scrollbar">
                  {CORE_PASSIONS.map((passion) => {
                    const isSelected = selectedPassion === passion.id;
                    return (
                      <button
                        key={passion.id}
                        type="button"
                        onClick={() => handleSelectPassion(passion.id)}
                        className={`flex items-center p-3 rounded-2xl border transition-all cursor-pointer text-left ${
                          isSelected
                            ? 'border-primary bg-primary/10 shadow-[0_0_15px_rgba(102,252,241,0.25)]'
                            : 'bg-white/5 border-white/10 hover:bg-white/10'
                        }`}
                      >
                        <div className={`p-2 rounded-xl border mr-3 shrink-0 ${isSelected ? passion.color : 'bg-black/30 border-white/10'}`}>
                          {passion.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-xs font-bold text-white truncate">
                            {locale === 'es' ? passion.labelEs : passion.label}
                          </h3>
                          <p className="text-[10px] text-white/50 truncate">
                            {locale === 'es' ? passion.descEs : passion.desc}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. Public Display Age */}
              <div className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] uppercase tracking-wider font-bold text-white/60">
                    {locale === 'es' ? 'Edad Pública en Perfil (Privacidad ZKP)' : 'Public Display Age (Privacy Protected)'}
                  </label>
                  <span className="text-sm font-black text-primary">
                    {displayAge} {locale === 'es' ? 'años' : 'years'}
                  </span>
                </div>
                <input
                  type="range"
                  min={18}
                  max={75}
                  value={displayAge}
                  onChange={(e) => setDisplayAge(Number(e.target.value))}
                  className="w-full h-1.5 bg-black/50 rounded-lg appearance-none cursor-pointer accent-primary"
                />
              </div>

              <button
                type="button"
                onClick={() => setStep(2)}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-primary to-emerald-400 text-black font-black uppercase tracking-wider shadow-[0_0_20px_rgba(102,252,241,0.4)] transition-transform active:scale-95 text-xs cursor-pointer"
              >
                {locale === 'es'
                  ? 'Revisar y Personalizar Señales de Sinergia →'
                  : 'Review & Customize Synergy Signals →'}
              </button>
            </motion.div>
          )}

          {/* STEP 2: SMART AUTO-FILLED SIGNALS (3, 4, 5 + HABITS) WITH INLINE EDITING & REASSURANCE NOTE */}
          {step === 2 && (
            <motion.div
              key="step-2"
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              className="space-y-5 text-left"
            >
              {/* Mandatory Reassurance Banner */}
              <div className="p-3.5 rounded-2xl bg-[#00fbfb]/10 border border-[#00fbfb]/35 flex items-start gap-3">
                <Info className="w-4 h-4 text-[#00fbfb] shrink-0 mt-0.5" />
                <p className="text-[11px] text-white/90 leading-relaxed">
                  {locale === 'es' ? (
                    <>
                      <strong className="text-[#00fbfb]">✨ Auto-calibrado según tu Arquetipo:</strong> Hemos pre-seleccionado tus Vibras (Señal 3), Hobbies (Señal 4), Hábitos y Respuesta (Señal 5). Puedes cambiarlos aquí mismo o <strong className="text-white underline">ajustarlos en cualquier momento desde tu Panel de Perfil de Miembro</strong>.
                    </>
                  ) : (
                    <>
                      <strong className="text-[#00fbfb]">✨ Smart-Calibrated from your Archetype:</strong> We pre-filled your Vibe Pills (Signal 3), Hobbies (Signal 4), Habits, and Prompt (Signal 5). You can customize any of them right now—or <strong className="text-white underline">change them anytime from your Member Profile Panel</strong>.
                    </>
                  )}
                </p>
              </div>

              {/* Signal 3: Vibe Pills (Moods) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-mono uppercase tracking-widest text-primary font-bold">
                    {locale === 'es' ? 'Señal 3 · Tus Vibras (Elige hasta 5)' : 'Signal 3 · Your Vibe Pills (Pick up to 5)'}
                  </label>
                  <span className="text-[10px] text-white/40 font-mono">{moods.length}/5</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {ALL_VIBE_PILLS.map((pill) => {
                    const active = moods.includes(pill);
                    return (
                      <button
                        key={pill}
                        type="button"
                        onClick={() => toggleMood(pill)}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition cursor-pointer border ${
                          active
                            ? 'bg-primary text-black border-primary shadow-[0_0_10px_rgba(0,251,251,0.3)]'
                            : 'bg-white/5 text-white/60 border-white/10 hover:border-white/30'
                        }`}
                      >
                        {active && <Check className="w-2.5 h-2.5 inline mr-1 stroke-[3]" />}
                        {pill}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Signal 4: Hobbies */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-mono uppercase tracking-widest text-primary font-bold">
                    {locale === 'es' ? 'Señal 4 · Tus Hobbies e Intereses' : 'Signal 4 · Your Hobbies & Interests'}
                  </label>
                  <span className="text-[10px] text-white/40 font-mono">{hobbies.length}/10</span>
                </div>
                <div className="flex flex-wrap gap-1.5 max-h-[88px] overflow-y-auto pr-1 custom-scrollbar">
                  {ALL_HOBBY_PILLS.map((hobby) => {
                    const active = hobbies.includes(hobby);
                    return (
                      <button
                        key={hobby}
                        type="button"
                        onClick={() => toggleHobby(hobby)}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition cursor-pointer border ${
                          active
                            ? 'bg-[#ffabf3] text-black border-[#ffabf3]'
                            : 'bg-white/5 text-white/60 border-white/10 hover:border-white/30'
                        }`}
                      >
                        {active && <Check className="w-2.5 h-2.5 inline mr-1 stroke-[3]" />}
                        {hobby}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Signal 5: 1-Tap Prompt Answer (Editable) */}
              <div className="space-y-2">
                <label className="text-[10px] font-mono uppercase tracking-widest text-primary font-bold block">
                  {locale === 'es'
                    ? 'Señal 5 · Tu Frase de Conexión (1-Tap o Escribe la tuya)'
                    : 'Signal 5 · Your Connection Prompt (1-Tap or Edit)'}
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {vibeChips.slice(0, 3).map((chip, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setBioPromptCategory(chip.category);
                        setBioPromptQuestion(chip.question);
                        setBioPromptAnswer(chip.answer);
                      }}
                      className={`text-left px-2.5 py-1.5 rounded-xl border text-[10px] transition cursor-pointer ${
                        bioPromptAnswer === chip.answer
                          ? 'bg-primary/15 border-primary text-white font-bold'
                          : 'bg-white/5 border-white/10 text-white/60 hover:text-white'
                      }`}
                    >
                      ⚡ {chip.answer.slice(0, 54)}...
                    </button>
                  ))}
                </div>
                <textarea
                  rows={2}
                  value={bioPromptAnswer}
                  onChange={(e) => setBioPromptAnswer(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-black/50 border border-white/15 rounded-xl text-xs text-white focus:border-primary focus:outline-none resize-none"
                />
              </div>

              {/* Optional Collapsible Lifestyle Habits Editor (Signal 2) */}
              <div className="border border-white/10 rounded-2xl bg-white/[0.02] p-3">
                <button
                  type="button"
                  onClick={() => setShowHabitEditor(!showHabitEditor)}
                  className="w-full flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-white/70 hover:text-white cursor-pointer"
                >
                  <span className="flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-primary" />
                    {locale === 'es'
                      ? 'Señal 2 · Hábitos de Estilo de Vida (Pre-calibrados · Clic para editar)'
                      : 'Signal 2 · Lifestyle Habits (Smart-Calibrated · Click to edit)'}
                  </span>
                  <span className="text-primary">{showHabitEditor ? '▲' : '▼'}</span>
                </button>
                {showHabitEditor && (
                  <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-white/10">
                    {[
                      { key: 'smoking', label: locale === 'es' ? 'Tabaco' : 'Smoking', opts: ['Non-Smoker', 'Socially', 'Regularly'] },
                      { key: 'drinking', label: locale === 'es' ? 'Bebida' : 'Drinking', opts: ['Never', 'Socially', 'Frequently'] },
                      { key: 'exercise', label: locale === 'es' ? 'Ejercicio' : 'Exercise', opts: ['Daily', '3x/week', 'Sometimes'] },
                      { key: 'sleep', label: locale === 'es' ? 'Horario' : 'Sleep', opts: ['Early Bird', 'Flexible', 'Night Owl'] },
                    ].map((h) => (
                      <div key={h.key} className="space-y-1">
                        <label className="text-[9px] text-white/50 uppercase font-bold block">{h.label}</label>
                        <select
                          value={lifestyleHabits[h.key] || h.opts[0]}
                          onChange={(e) =>
                            setLifestyleHabits((prev) => ({ ...prev, [h.key]: e.target.value }))
                          }
                          aria-label={h.label}
                          className="w-full bg-black/60 border border-white/15 rounded-lg px-2 py-1 text-[10px] text-white"
                        >
                          {h.opts.map((o) => (
                            <option key={o} value={o}>
                              {o}
                            </option>
                          ))}
                        </select>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-white/70 cursor-pointer"
                >
                  ← {locale === 'es' ? 'Atrás' : 'Back'}
                </button>
                <button
                  type="button"
                  onClick={handleFinish}
                  disabled={isSubmitting || bioPromptAnswer.trim().length < 5}
                  className="flex-1 py-4 rounded-2xl bg-gradient-to-r from-primary to-emerald-400 text-black font-black uppercase tracking-wider disabled:opacity-50 shadow-[0_0_20px_rgba(102,252,241,0.4)] transition-transform active:scale-95 flex items-center justify-center gap-2 text-xs cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-black" />
                      <span>{locale === 'es' ? 'Guardando Sinergia...' : 'Saving Synergy...'}</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-black" />
                      <span>
                        {locale === 'es' ? 'Activar Sinergia y Continuar →' : 'Activate Synergy & Continue →'}
                      </span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}


