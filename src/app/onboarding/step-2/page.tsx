'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Check, ChevronRight, Sparkles, RotateCcw, Loader2, AlertCircle } from 'lucide-react';
import { HABIT_CHOICES, ARCHETYPE_PROFILES } from '@/lib/constants';
import { createClient } from '@/lib/supabase/client';
import { updateProfileArchetype } from '@/lib/relationship-db';
import ArchetypeSelector from '@/components/ArchetypeSelector';

const HABIT_KEYS = Object.keys(HABIT_CHOICES);

export default function OnboardingStepTwo() {
  const router = useRouter();
  const supabase = createClient();

  const [stage, setStage] = useState<'archetype' | 'habits' | 'finished'>('archetype');
  const [selectedArchetype, setSelectedArchetype] = useState<string | null>(null);
  const [currentHabitIndex, setCurrentHabitIndex] = useState(0);
  const [lifestyle, setLifestyle] = useState<Record<string, string>>({});
  const [direction, setDirection] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  const currentHabit = HABIT_KEYS[currentHabitIndex];
  const habitOptions = HABIT_CHOICES[currentHabit as keyof typeof HABIT_CHOICES] || [];

  // Retrieve userId from localStorage or session
  useEffect(() => {
    const storedCore = localStorage.getItem('fusion_onboarding_core');
    if (storedCore) {
      const parsed = JSON.parse(storedCore);
      if (parsed.userId) setUserId(parsed.userId);
    } else {
      supabase.auth.getUser().then(({ data }) => {
        if (data.user) setUserId(data.user.id);
      });
    }
  }, []);

  const handleArchetypeSelect = async (archId: string, alignmentData: any) => {
    if (!userId) {
      setError('Session expired. Please return to step 1.');
      return;
    }
    
    try {
      setError(null);
      // 1. Update database with archetype details + 100 points
      await updateProfileArchetype(userId, alignmentData);

      // 2. Pre-fill local state habits
      setSelectedArchetype(archId);
      const arch = ARCHETYPE_PROFILES[archId as keyof typeof ARCHETYPE_PROFILES];
      if (arch?.defaultHabits) {
        setLifestyle(arch.defaultHabits);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update archetype.');
      throw err;
    }
  };

  const handleSelect = (option: string) => {
    setLifestyle(prev => ({ ...prev, [currentHabit]: option }));
    setDirection(1);

    setTimeout(() => {
      if (currentHabitIndex < HABIT_KEYS.length - 1) {
        setCurrentHabitIndex(prev => prev + 1);
        setDirection(null);
      } else {
        setStage('finished');
      }
    }, 400);
  };

  const handleFinish = async () => {
    if (!userId) {
      setError('Session expired. Please return to step 1.');
      return;
    }
    setIsLoading(true);
    setError(null);

    try {
      // Update the profile row with customized lifestyle habits
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          lifestyle_habits: lifestyle,
        })
        .eq('id', userId);

      if (updateError) throw updateError;

      // Clean up localStorage
      localStorage.removeItem('fusion_onboarding_core');

      router.push('/dashboard');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to save profile. Please try again.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const resetOnboarding = () => {
    setStage('archetype');
    setSelectedArchetype(null);
    setCurrentHabitIndex(0);
    setLifestyle({});
    setError(null);
  };

  return (
    <div className="min-h-screen bg-transparent text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-primary/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] bg-accent/10 blur-[120px] rounded-full" />
      </div>

      <div className="max-w-4xl w-full relative z-10">

        {/* Error Banner */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="max-w-md mx-auto mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center gap-3 text-red-400"
            >
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-xs font-bold">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">

          {/* STAGE 1: Premium Archetype Selector */}
          {stage === 'archetype' && (
            <motion.div
              key="archetype"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20, transition: { duration: 0.3 } }}
            >
              <ArchetypeSelector onSelect={handleArchetypeSelect} onProceed={() => setStage('habits')} />
            </motion.div>
          )}

          {/* STAGE 2: Customize Lifestyle Habit Cards */}
          {stage === 'habits' && (
            <div className="max-w-md mx-auto w-full">
              <motion.div
                key={currentHabit}
                initial={{ opacity: 0, x: 100, rotate: 10 }}
                animate={{ opacity: 1, x: 0, rotate: 0 }}
                exit={{
                  opacity: 0,
                  x: direction === 1 ? 500 : -500,
                  rotate: direction === 1 ? 25 : -25,
                  transition: { duration: 0.4 }
                }}
                className="relative aspect-[3/4] rounded-[3rem] overflow-hidden border-4 border-white/5 shadow-2xl glass-card flex flex-col"
              >
                {/* Gradient overlay */}
                <div className="absolute inset-0 z-0">
                  <div className="w-full h-full bg-gradient-to-br from-primary/20 via-accent/10 to-black" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                </div>

                {/* Content Overlay */}
                <div className="relative z-10 flex-1 p-10 flex flex-col justify-end">
                  <div className="space-y-6">
                    <div>
                      <span className="inline-block px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-[9px] font-black uppercase tracking-[0.3em] text-white/60 mb-4">
                        Lifestyle Sync · {currentHabitIndex + 1}/{HABIT_KEYS.length}
                      </span>
                      <h2 className="text-4xl font-black tracking-tighter uppercase mb-2 leading-none">
                        {currentHabit}
                      </h2>
                      <p className="text-xs text-white/40 font-bold uppercase tracking-widest leading-relaxed">
                        How frequent is this habit in your current routine?
                      </p>
                    </div>

                    <div className="grid grid-cols-1 gap-3 pt-6">
                      {habitOptions.map((opt) => (
                        <motion.button
                          key={opt}
                          whileHover={{ scale: 1.02, x: 5 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleSelect(opt)}
                          className={`group relative overflow-hidden py-4 rounded-2xl border transition-all duration-300 text-left px-6 ${
                            lifestyle[currentHabit] === opt
                            ? 'bg-primary border-primary text-black shadow-[0_0_20px_rgba(102,252,241,0.4)]'
                            : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:border-white/30'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em]">{opt}</span>
                            <ChevronRight className={`w-4 h-4 transition-transform duration-300 ${lifestyle[currentHabit] === opt ? 'translate-x-0' : '-translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100'}`} />
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Progress Bar */}
              <div className="mt-12 space-y-3">
                <div className="flex items-center justify-between text-[8px] font-black uppercase tracking-[0.3em] text-white/30">
                  <span>Syncing Lifecycle</span>
                  <span>{Math.round(((currentHabitIndex + 1) / HABIT_KEYS.length) * 100)}%</span>
                </div>
                <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-primary to-accent shadow-[0_0_10px_rgba(102,252,241,0.5)]"
                    initial={{ width: 0 }}
                    animate={{ width: `${((currentHabitIndex + 1) / HABIT_KEYS.length) * 100}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* STAGE 3: Completion Page */}
          {stage === 'finished' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-md mx-auto text-center space-y-10 py-12 px-8 glass-card rounded-[3rem] border border-primary/20 bg-primary/5"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                className="inline-flex p-6 rounded-full bg-primary/10 border border-primary/20 mb-2"
              >
                <Check className="w-12 h-12 text-primary" />
              </motion.div>
              <div>
                <h2 className="text-4xl font-black tracking-tighter mb-4">PULSE CALIBRATED</h2>
                <p className="text-sm text-white/60 font-medium leading-relaxed max-w-xs mx-auto">
                  "Your lifestyle matrix has been synchronized with the platform. You are ready to experience the high-fidelity feed."
                </p>
              </div>

              <div className="space-y-4">
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(102,252,241,0.4)' }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleFinish}
                  disabled={isLoading}
                  className="w-full py-5 bg-gradient-to-r from-primary to-accent rounded-2xl font-black text-xs uppercase tracking-[0.3em] text-black shadow-2xl transition-all duration-300 border border-white/10 disabled:opacity-50 flex items-center justify-center gap-3"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      SAVING MATRIX...
                    </>
                  ) : (
                    <>
                      ENTER PLATFORM <Sparkles className="w-4 h-4 ml-2 inline-block" />
                    </>
                  )}
                </motion.button>
                <button
                  onClick={resetOnboarding}
                  disabled={isLoading}
                  className="text-[9px] font-black text-white/30 hover:text-white uppercase tracking-widest flex items-center justify-center gap-2 mx-auto transition-colors disabled:opacity-30"
                >
                  <RotateCcw className="w-3 h-3" /> Re-calibrate Habits
                </button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* Security Breadcrumb */}
      <div className="absolute bottom-10 flex items-center gap-4 text-[8px] font-black text-white/20 uppercase tracking-[0.4em]">
        <div className="w-12 h-[1px] bg-white/10" />
        SECURE MATRIX ACCESS
        <div className="w-12 h-[1px] bg-white/10" />
      </div>
    </div>
  );
}
