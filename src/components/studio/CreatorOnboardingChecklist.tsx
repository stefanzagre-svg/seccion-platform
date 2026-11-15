'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle2, Circle, ChevronDown, ChevronUp, Sparkles, 
  HelpCircle, ArrowRight, ShieldCheck, DollarSign, Image as ImageIcon, 
  Brain, Video, AlertCircle, Bot
} from 'lucide-react';
import { useTranslation } from '@/context/LanguageContext';

export interface CreatorChecklistMetrics {
  hasVisuals: boolean;
  hasMonetization: boolean;
  hasSeedContent: boolean;
  hasVaultNote: boolean;
  hasKyc: boolean;
  hasTaxId: boolean;
}

export interface CreatorVipFastTrackStatus {
  isVipFastTrack: boolean;
  isWelcomeBanner?: boolean;
  promo90ApprovedAt?: string | null;
  aiFreeUntil?: string | null;
  moroccoShieldActive?: boolean;
}

interface CreatorOnboardingChecklistProps {
  metrics: CreatorChecklistMetrics;
  vipFastTrack?: CreatorVipFastTrackStatus;
  onNavigateTab: (tabId: string) => void;
  onNavigateAiTools: () => void;
  onOpenTour: () => void;
  onOpenKyc: () => void;
  onAskCopilot: (question: string) => void;
}

export default function CreatorOnboardingChecklist({
  metrics,
  vipFastTrack,
  onNavigateTab,
  onNavigateAiTools,
  onOpenTour,
  onOpenKyc,
  onAskCopilot
}: CreatorOnboardingChecklistProps) {
  const { t } = useTranslation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const checklistItems = [
    {
      id: 'pricing',
      title: t('creatorChecklist.items.pricing.title', 'Set Base VIP & PPV Rates'),
      desc: t('creatorChecklist.items.pricing.desc', 'Configure monthly subscription and per-item PPV unlocks.'),
      done: metrics.hasMonetization,
      action: () => onNavigateTab('settings'),
      actionLabel: t('creatorChecklist.actions.configure', 'Configure'),
      helpQuestion: 'How should I price my base VIP pass and PPV media for best conversion?'
    },
    {
      id: 'content',
      title: t('creatorChecklist.items.content.title', 'Seed DRM Content Vault'),
      desc: t('creatorChecklist.items.content.desc', 'Upload at least 2 exclusive posts or teasers for early members.'),
      done: metrics.hasSeedContent,
      action: () => onNavigateTab('content'),
      actionLabel: t('creatorChecklist.actions.upload', 'Upload'),
      helpQuestion: 'How does progressive Face-Blur and DRM protection work for posts?'
    },
    {
      id: 'vault',
      title: t('creatorChecklist.items.vault.title', 'Define Copilot Second Brain'),
      desc: t('creatorChecklist.items.vault.desc', 'Write your [[Persona]] and [[Boundaries]] note in the Obsidian Vault.'),
      done: metrics.hasVaultNote,
      action: onNavigateAiTools,
      actionLabel: t('creatorChecklist.actions.writeVault', 'Edit Vault'),
      helpQuestion: 'How do I train my AI Copilot using Obsidian Markdown notes?'
    },
    {
      id: 'kyc',
      title: t('creatorChecklist.items.kyc.title', 'Identity Shield (KYC 18+)'),
      desc: t('creatorChecklist.items.kyc.desc', 'Verify zero-knowledge 18+ identity to unlock public live streams & payouts.'),
      done: metrics.hasKyc,
      action: onOpenKyc,
      actionLabel: t('creatorChecklist.actions.verify', 'Verify'),
      helpQuestion: 'Is my real identity kept confidential when I verify with DIDIT Zero-Knowledge?'
    },
    {
      id: 'tax',
      title: t('creatorChecklist.items.tax.title', 'Tax Profile & Payout Destination'),
      desc: t('creatorChecklist.items.tax.desc', 'Register tax business name and TIN in settings for global DAC7/1099 compliance.'),
      done: metrics.hasTaxId,
      action: () => onNavigateTab('settings'),
      actionLabel: t('creatorChecklist.actions.submitTax', 'Submit Tax'),
      helpQuestion: 'What tax documents do I need to receive automated 90% payouts?'
    }
  ];

  const completedCount = checklistItems.filter(i => i.done).length;
  const progressPercent = Math.round((completedCount / checklistItems.length) * 100);
  const isAllComplete = progressPercent === 100;

  const promoStartMs = vipFastTrack?.promo90ApprovedAt
    ? new Date(vipFastTrack.promo90ApprovedAt).getTime()
    : NaN;
  const year1DaysLeft = Number.isFinite(promoStartMs)
    ? Math.max(0, Math.ceil((promoStartMs + 365 * 24 * 60 * 60 * 1000 - Date.now()) / 86_400_000))
    : 365;
  const aiFreeDateLabel = vipFastTrack?.aiFreeUntil
    ? new Date(vipFastTrack.aiFreeUntil).toLocaleDateString()
    : null;

  return (
    <div className="w-full mb-8 glass-card bg-gradient-to-r from-white/[0.04] via-black/40 to-white/[0.02] border border-white/10 rounded-3xl p-5 sm:p-6 shadow-[0_10px_40px_rgba(0,0,0,0.5)] backdrop-blur-xl relative overflow-hidden text-left">
      {/* Background Neon Aura */}
      <div className="absolute top-0 right-1/4 w-96 h-32 bg-[#00fbfb]/10 rounded-full blur-3xl pointer-events-none" />

      {vipFastTrack?.isVipFastTrack && (
        <div className="mb-5 rounded-2xl bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-violet-500/15 border border-emerald-500/30 p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-emerald-300">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t('creatorChecklist.vipBanner.badge', 'VIP Fast-Track Active · Pre-Approved Creator')}</span>
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-white/85">
              <span className="font-bold text-white">
                {t('creatorChecklist.vipBanner.splitLabel', '90% Year-1 Net Split Active (80% Standard After)')}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold">
                {t('creatorChecklist.vipBanner.daysLeft', '{days}d remaining in Year 1').replace('{days}', String(year1DaysLeft))}
              </span>
              {aiFreeDateLabel && (
                <span className="text-[11px] text-violet-200">
                  {t('creatorChecklist.vipBanner.aiFreeLabel', 'AI Copilot & Content Ops Free Until')}:{' '}
                  <strong className="text-white">{aiFreeDateLabel}</strong>
                </span>
              )}
              {vipFastTrack.moroccoShieldActive && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 text-[10px] font-bold">
                  <ShieldCheck className="w-3 h-3" />
                  {t('creatorChecklist.vipBanner.moroccoShield', 'Morocco Domestic Shield (MA) Active')}
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => onNavigateTab(metrics.hasVisuals ? 'content' : 'settings')}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-[10px] font-black uppercase tracking-wider transition cursor-pointer inline-flex items-center gap-1"
            >
              <ImageIcon className="w-3 h-3 text-[#ffabf3]" />
              {t('creatorChecklist.vipBanner.quickAvatarPhotos', '1 Avatar + 2 Photos')}
            </button>
            <button
              type="button"
              onClick={() => onNavigateTab('settings')}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-[10px] font-black uppercase tracking-wider transition cursor-pointer inline-flex items-center gap-1"
            >
              <DollarSign className="w-3 h-3 text-emerald-300" />
              {t('creatorChecklist.vipBanner.quickRatesGeo', 'Rates & Geo Shield')}
            </button>
            {!metrics.hasKyc && (
              <button
                type="button"
                onClick={onOpenKyc}
                className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-[10px] font-black uppercase tracking-wider transition cursor-pointer inline-flex items-center gap-1"
              >
                <ShieldCheck className="w-3 h-3" />
                {t('creatorChecklist.vipBanner.quickKyc', 'DIDIT 18+ KYC')}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex items-center justify-between gap-4 flex-wrap pb-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
            {/* SVG Progress Circle */}
            <svg className="w-12 h-12 -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-white/10"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className={isAllComplete ? 'text-emerald-400' : 'text-[#00fbfb]'}
                strokeDasharray={`${progressPercent}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <span className="absolute text-[10px] font-black font-mono text-white">
              {progressPercent}%
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-black uppercase tracking-wider text-white">
                {t('creatorChecklist.header.title', 'Creator 1st Steps Cockpit')}
              </h3>
              {isAllComplete ? (
                <span className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  {t('creatorChecklist.status.ready', 'Portfolio Ready')}
                </span>
              ) : (
                <span className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-[#00fbfb]/10 text-[#00fbfb] border border-[#00fbfb]/20">
                  {completedCount}/{checklistItems.length} {t('creatorChecklist.status.steps', 'Completed')}
                </span>
              )}
            </div>
            <p className="text-[10px] text-white/50 font-medium mt-0.5">
              {t(
                'creatorChecklist.header.sub',
                'Complete your initial setup to unlock live streaming and start collecting your 90% founding revenue.'
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenTour}
            className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 hover:text-white border border-white/10 text-[10px] font-black uppercase tracking-wider transition flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span>{t('creatorChecklist.actions.tour', 'Studio Tour')}</span>
          </button>

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white border border-white/10 transition cursor-pointer"
            aria-label={isCollapsed ? 'Expand checklist' : 'Collapse checklist'}
          >
            {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Collapsible Checklist Items */}
      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 space-y-2.5 overflow-hidden"
          >
            {!metrics.hasVisuals && (
              <div className="p-3.5 rounded-2xl border border-[#ffabf3]/30 bg-gradient-to-r from-[#ffabf3]/10 via-black/40 to-[#00fbfb]/10 flex items-center justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="mt-0.5 shrink-0">
                    <ImageIcon className="w-4 h-4 text-[#ffabf3]" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-black uppercase tracking-wider text-white">
                      {t('creatorChecklist.items.visuals.title', 'Add Profile Avatar & Creator Bio')}
                    </p>
                    <p className="text-[10px] text-white/60 leading-relaxed font-normal truncate sm:whitespace-normal">
                      {t('creatorChecklist.items.visuals.desc', 'Upload your main cover photo and write a short bio in Studio Settings so members can discover you.')}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => onNavigateTab('settings')}
                  className="px-3.5 py-1.5 rounded-xl bg-[#ffabf3] hover:bg-[#ffabf3]/90 text-black text-[10px] font-black uppercase tracking-wider transition flex items-center gap-1 shrink-0 cursor-pointer"
                >
                  <span>{t('creatorChecklist.actions.setupProfile', 'Edit Profile')}</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            )}

            {checklistItems.map((item) => (
              <div
                key={item.id}
                className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                  item.done
                    ? 'bg-white/[0.01] border-white/5 opacity-70'
                    : 'bg-white/[0.03] border-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className="mt-0.5 shrink-0">
                    {item.done ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Circle className="w-4 h-4 text-white/30" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className={`text-xs font-black uppercase tracking-wider ${item.done ? 'line-through text-white/50' : 'text-white'}`}>
                      {item.title}
                    </p>
                    <p className="text-[10px] text-white/40 leading-relaxed font-normal truncate sm:whitespace-normal">
                      {item.desc}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {/* Ask Copilot Button for this step */}
                  <button
                    onClick={() => onAskCopilot(item.helpQuestion)}
                    className="p-2 rounded-xl text-white/40 hover:text-[#00fbfb] hover:bg-[#00fbfb]/10 transition cursor-pointer"
                    title={t('creatorChecklist.actions.askAi', 'Ask Copilot about this step')}
                  >
                    <Bot className="w-3.5 h-3.5" />
                  </button>

                  {!item.done ? (
                    <button
                      onClick={item.action}
                      className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-[10px] font-black uppercase tracking-wider transition flex items-center gap-1 cursor-pointer"
                    >
                      <span>{item.actionLabel}</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  ) : (
                    <span className="text-[9px] font-black uppercase tracking-widest text-emerald-400 px-2.5 py-1 rounded-lg bg-emerald-500/10">
                      Done
                    </span>
                  )}
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
