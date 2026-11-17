'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, ChevronRight, ChevronLeft, Sparkles, DollarSign, 
  ShieldCheck, Video, Brain, ArrowRight, Compass
} from 'lucide-react';
import { useTranslation } from '@/context/LanguageContext';

interface CreatorTourModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab: (tabId: string) => void;
  onNavigateAiTools: () => void;
}

export default function CreatorTourModal({
  isOpen,
  onClose,
  onNavigateTab,
  onNavigateAiTools
}: CreatorTourModalProps) {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const steps = [
    {
      id: 'welcome',
      icon: Compass,
      accent: 'from-[#00fbfb]/20 to-[#7c3aed]/20',
      badge: t('creatorTour.steps.welcome.badge', 'Step 1 of 5 • Overview'),
      title: t('creatorTour.steps.welcome.title', 'Welcome to SECCION Creator Studio'),
      description: t(
        'creatorTour.steps.welcome.desc',
        'Your creator headquarters—built to replace 40% management agency fees with direct fan subscriptions and smart chat automation.'
      ),
      highlight: t(
        'creatorTour.steps.welcome.highlight',
        'You keep 90% of your net revenue from day one across all 7 income streams.'
      ),
      actionLabel: t('creatorTour.steps.welcome.action', 'Next: Pricing & Earnings'),
      onAction: () => setCurrentStep(1)
    },
    {
      id: 'pricing',
      icon: DollarSign,
      accent: 'from-emerald-500/20 to-teal-500/20',
      badge: t('creatorTour.steps.pricing.badge', 'Step 2 of 5 • Pricing'),
      title: t('creatorTour.steps.pricing.title', 'Set Your Prices'),
      description: t(
        'creatorTour.steps.pricing.desc',
        'Set your single-creator VIP monthly pass, pay-to-unlock (PPV) post prices, and 1-on-1 video call rate. Note: VIP is a fan subscribing to you alone; Master is a multi-creator bundle chosen by the member.'
      ),
      highlight: t(
        'creatorTour.steps.pricing.highlight',
        'Suggested start: $9.99/mo VIP Pass • $4.99 PPV Post • $3.00/min Private Call.'
      ),
      actionLabel: t('creatorTour.steps.pricing.action', 'Go to Pricing Settings'),
      onAction: () => {
        onClose();
        onNavigateTab('settings');
      }
    },
    {
      id: 'content',
      icon: ShieldCheck,
      accent: 'from-[#ff007f]/20 to-purple-500/20',
      badge: t('creatorTour.steps.content.badge', 'Step 3 of 5 • Posts & Privacy'),
      title: t('creatorTour.steps.content.title', 'Protected Posts & Smart Face Blur'),
      description: t(
        'creatorTour.steps.content.desc',
        'Every upload gets automatic anti-leak watermarking. Turn on Face Blur to keep your face hidden from public discovery until fans subscribe or build trust.'
      ),
      highlight: t(
        'creatorTour.steps.content.highlight',
        'Start with 2–3 exclusive posts so new VIP subscribers get value right away.'
      ),
      actionLabel: t('creatorTour.steps.content.action', 'Go to Posts & Media'),
      onAction: () => {
        onClose();
        onNavigateTab('content');
      }
    },
    {
      id: 'stream',
      icon: Video,
      accent: 'from-amber-500/20 to-orange-500/20',
      badge: t('creatorTour.steps.stream.badge', 'Step 4 of 5 • Go Live'),
      title: t('creatorTour.steps.stream.title', 'Real-Time Livestreaming'),
      description: t(
        'creatorTour.steps.stream.desc',
        'Go live with instant, zero-lag video and see live tips, top supporters, and chat reactions in real time.'
      ),
      highlight: t(
        'creatorTour.steps.stream.highlight',
        'Requires a quick, private 18+ ID check before your first public livestream.'
      ),
      actionLabel: t('creatorTour.steps.stream.action', 'Open Livestreams'),
      onAction: () => {
        onClose();
        onNavigateTab('live');
      }
    },
    {
      id: 'copilot',
      icon: Brain,
      accent: 'from-indigo-500/20 to-[#00fbfb]/20',
      badge: t('creatorTour.steps.copilot.badge', 'Step 5 of 5 • AI Chat Assistant'),
      title: t('creatorTour.steps.copilot.title', 'Train Your AI Copilot'),
      description: t(
        'creatorTour.steps.copilot.desc',
        'Your AI assistant replies to fan DMs when you\'re offline. Write simple notes for your tone, favorite topics, and hard boundaries—no coding needed.'
      ),
      highlight: t(
        'creatorTour.steps.copilot.highlight',
        'Includes a 1-click pause switch whenever you want to take over live.'
      ),
      actionLabel: t('creatorTour.steps.copilot.action', 'Open AI Copilot'),
      onAction: () => {
        onClose();
        onNavigateAiTools();
      }
    }
  ];

  const current = steps[currentStep];

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="relative w-full max-w-xl bg-gradient-to-b from-[#111118] via-[#09090d] to-black border border-white/10 rounded-3xl p-6 sm:p-8 shadow-[0_20px_70px_rgba(0,0,0,0.9)] overflow-hidden text-left"
      >
        {/* Ambient Top Glow */}
        <div className={`absolute top-0 right-0 w-72 h-72 bg-gradient-to-bl ${current.accent} rounded-full blur-3xl pointer-events-none transition-colors duration-500`} />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-white/40 hover:text-white bg-white/5 hover:bg-white/10 transition cursor-pointer z-30"
          aria-label="Close Tour"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Badge & Step Indicator */}
        <div className="flex items-center gap-2 mb-4 relative z-10">
          <span className="text-[10px] font-black uppercase tracking-widest text-[#00fbfb] bg-[#00fbfb]/10 border border-[#00fbfb]/20 px-3 py-1 rounded-full">
            {current.badge}
          </span>
        </div>

        {/* Step Header */}
        <div className="flex items-start gap-4 mb-5 relative z-10">
          <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 text-white">
            <current.icon className="w-6 h-6 text-[#00fbfb]" />
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight uppercase">
              {current.title}
            </h3>
            <p className="text-xs sm:text-sm text-white/60 mt-1 leading-relaxed">
              {current.description}
            </p>
          </div>
        </div>

        {/* Highlight Callout */}
        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 mb-6 relative z-10">
          <div className="flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <p className="text-xs text-white/80 font-medium leading-relaxed">
              {current.highlight}
            </p>
          </div>
        </div>

        {/* Step Progress Dots */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {steps.map((s, idx) => (
            <button
              key={s.id}
              onClick={() => setCurrentStep(idx)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === currentStep ? 'w-8 bg-[#00fbfb]' : 'w-2 bg-white/20 hover:bg-white/40'
              }`}
              aria-label={`Go to step ${idx + 1}`}
            />
          ))}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between gap-3 relative z-10 pt-2 border-t border-white/5">
          <button
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
            className="px-4 py-2.5 rounded-xl border border-white/10 text-white/50 hover:text-white disabled:opacity-30 disabled:pointer-events-none text-xs font-black uppercase tracking-wider transition flex items-center gap-1.5 cursor-pointer"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>{t('common.back', 'Back')}</span>
          </button>

          <div className="flex items-center gap-2">
            {currentStep < steps.length - 1 ? (
              <button
                onClick={() => setCurrentStep(currentStep + 1)}
                className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-black uppercase tracking-wider transition flex items-center gap-1.5 cursor-pointer"
              >
                <span>{t('common.next', 'Next')}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            ) : null}

            <button
              onClick={current.onAction}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary to-[#ff007f] hover:brightness-110 text-white text-xs font-black uppercase tracking-wider shadow-[0_0_20px_rgba(255,0,127,0.4)] transition flex items-center gap-2 cursor-pointer"
            >
              <span>{current.actionLabel}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
