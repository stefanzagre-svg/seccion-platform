'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { 
  X, 
  Bug, 
  Sparkles, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Camera, 
  Smartphone, 
  Laptop, 
  Gift 
} from 'lucide-react';
import { BUG_CATEGORIES, BugCategory, BugSeverity, calculateBugReward } from '@/lib/bug-bounty';
import { useTranslation } from '@/context/LanguageContext';

interface BugReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  userRole?: 'member' | 'creator' | 'guest';
}

export default function BugReportModal({ isOpen, onClose, userRole = 'member' }: BugReportModalProps) {
  const pathname = usePathname();
  const { t, locale } = useTranslation();

  const [category, setCategory] = useState<BugCategory>('visual_display');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState<BugSeverity>('medium');
  const [screenshotUrl, setScreenshotUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Client Telemetry
  const [viewport, setViewport] = useState('');
  const [userAgent, setUserAgent] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setViewport(`${window.innerWidth}x${window.innerHeight}`);
      setUserAgent(navigator.userAgent);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const reward = calculateBugReward(userRole, severity);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || description.trim().length < 5) {
      setErrorMessage(
        locale === 'es' 
          ? 'Por favor escribe al menos 5 caracteres describiendo lo que ocurrió.'
          : 'Please provide at least 5 characters describing what happened.'
      );
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/v2/bugs/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category,
          description: description.trim(),
          severity,
          pageUrl: typeof window !== 'undefined' ? window.location.href : pathname,
          userAgent,
          viewportSize: viewport,
          screenshotUrl: screenshotUrl.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit bug report.');
      }

      setIsSuccess(true);
    } catch (err: any) {
      console.error('[Bug Report Submit Error]:', err);
      setErrorMessage(err.message || 'An error occurred while submitting.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetAndClose = () => {
    setDescription('');
    setScreenshotUrl('');
    setIsSuccess(false);
    setErrorMessage(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-[#0F1117] border border-white/10 rounded-3xl p-6 shadow-[0_0_50px_rgba(0,251,251,0.15)] text-white overflow-hidden max-h-[90vh] flex flex-col">
        
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-24 bg-[#00fbfb]/10 blur-3xl pointer-events-none rounded-full" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 relative z-10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#00fbfb]/10 border border-[#00fbfb]/30 flex items-center justify-center text-[#00fbfb]">
              <Bug className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold tracking-tight text-white flex items-center gap-2">
                {t('bounty.modalTitle', 'Report a Glitch & Earn Rewards')}
              </h3>
              <p className="text-[11px] text-[#b9cac9] font-mono">
                {t('bounty.modalSubtitle', 'Help improve SECCION and get rewarded for confirmed fixes.')}
              </p>
            </div>
          </div>
          <button
            onClick={resetAndClose}
            className="p-2 text-white/40 hover:text-white hover:bg-white/5 rounded-xl transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSuccess ? (
          <div className="py-10 text-center space-y-4 my-auto">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto shadow-[0_0_20px_rgba(16,185,129,0.3)]">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="space-y-1.5">
              <h4 className="text-lg font-bold text-white">
                {locale === 'es' ? '¡Reporte Enviado con Éxito!' : 'Glitch Report Received!'}
              </h4>
              <p className="text-xs text-[#b9cac9] max-w-sm mx-auto leading-relaxed">
                {locale === 'es'
                  ? 'Nuestro equipo de ingeniería revisará el fallo. Una vez confirmado el fix, recibirás tu recompensa automáticamente.'
                  : 'Our engineering team will triage this report. Once verified, your reward will be automatically granted to your account.'}
              </p>
            </div>

            <div className="p-3 bg-white/5 border border-white/10 rounded-2xl max-w-xs mx-auto text-left flex items-center gap-3">
              <Gift className="w-5 h-5 text-[#ffabf3] shrink-0" />
              <div>
                <span className="text-[10px] font-mono uppercase text-white/40 block font-bold">
                  {locale === 'es' ? 'Recompensa Estimada' : 'Estimated Bounty'}
                </span>
                <span className="text-xs font-bold text-white">
                  {locale === 'es' ? reward.descriptionEs : reward.descriptionEn}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={resetAndClose}
              className="mt-4 px-6 py-2.5 bg-[#00fbfb] text-black font-mono text-xs font-black uppercase tracking-wider rounded-xl hover:shadow-[0_0_15px_rgba(0,251,251,0.5)] transition cursor-pointer"
            >
              {locale === 'es' ? 'Volver a la App' : 'Return to App'}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 pt-4 overflow-y-auto pr-1 flex-1">
            
            {/* Reward Banner */}
            <div className="p-3 bg-gradient-to-r from-[#00fbfb]/10 to-[#ffabf3]/10 border border-[#00fbfb]/30 rounded-2xl flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-5 h-5 text-[#00fbfb] shrink-0" />
                <div>
                  <span className="text-[10px] font-mono uppercase font-bold text-[#00fbfb] block">
                    {userRole === 'creator'
                      ? (locale === 'es' ? 'Recompensa para Creadores' : 'Creator Bounty Reward')
                      : (locale === 'es' ? 'Recompensa para Miembros' : 'Member Bounty Reward')}
                  </span>
                  <span className="text-[11px] font-bold text-white">
                    {locale === 'es' ? reward.descriptionEs : reward.descriptionEn}
                  </span>
                </div>
              </div>
            </div>

            {errorMessage && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded-xl flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* 1. Category Selection */}
            <div className="space-y-1.5">
              <label className="block text-[10px] font-mono text-white/60 uppercase font-bold tracking-wider">
                {t('bounty.categoryLabel', '1. What type of problem is it?')}
              </label>
              <div className="grid grid-cols-2 gap-2">
                {BUG_CATEGORIES.map((cat) => {
                  const isSelected = category === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategory(cat.id)}
                      className={`p-2.5 rounded-xl border text-left transition flex flex-col justify-between cursor-pointer ${
                        isSelected
                          ? 'bg-[#00fbfb]/15 border-[#00fbfb] text-white shadow-[0_0_10px_rgba(0,251,251,0.2)]'
                          : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm">{cat.emoji}</span>
                        <span className="text-[11px] font-bold leading-tight">
                          {locale === 'es' ? cat.labelEs : cat.labelEn}
                        </span>
                      </div>
                      <span className="text-[9px] text-[#b9cac9] line-clamp-1">
                        {locale === 'es' ? cat.descEs : cat.descEn}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Open Narrative Description Box */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="block text-[10px] font-mono text-white/60 uppercase font-bold tracking-wider">
                  {t('bounty.descriptionLabel', '2. Tell us what happened in your own words')}
                </label>
                <span className="text-[9px] font-mono text-white/30">
                  {description.length} {locale === 'es' ? 'caracteres' : 'chars'}
                </span>
              </div>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={
                  locale === 'es'
                    ? 'Cuéntanos con tus propias palabras qué ocurrió... (ej: Hice clic en el botón de reproducir video y la pantalla quedó en negro)'
                    : 'Tell us in your own words what happened... (e.g. I tapped the video play button and the screen stayed black)'
                }
                required
                className="w-full bg-black/50 border border-white/15 focus:border-[#00fbfb] rounded-2xl p-3 text-xs text-white placeholder-white/30 outline-none transition resize-none leading-relaxed"
              />
            </div>

            {/* 3. Severity Selector */}
            <div className="space-y-1.5">
              <label className="block text-[10px] font-mono text-white/60 uppercase font-bold tracking-wider">
                {t('bounty.severityLabel', '3. How much did this block your experience?')}
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {(['low', 'medium', 'high', 'critical'] as BugSeverity[]).map((sev) => {
                  const isSelected = severity === sev;
                  const colors: Record<BugSeverity, string> = {
                    low: 'text-blue-400 border-blue-500/40 bg-blue-500/10',
                    medium: 'text-yellow-400 border-yellow-500/40 bg-yellow-500/10',
                    high: 'text-orange-400 border-orange-500/40 bg-orange-500/10',
                    critical: 'text-red-400 border-red-500/40 bg-red-500/10',
                  };
                  return (
                    <button
                      key={sev}
                      type="button"
                      onClick={() => setSeverity(sev)}
                      className={`py-1.5 px-2 rounded-xl text-[10px] font-mono font-bold uppercase transition border cursor-pointer ${
                        isSelected
                          ? colors[sev] + ' shadow-[0_0_10px_rgba(255,255,255,0.1)]'
                          : 'bg-white/5 border-white/10 text-white/40 hover:text-white'
                      }`}
                    >
                      {sev}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 4. Optional Screenshot URL */}
            <div className="space-y-1.5">
              <label className="block text-[10px] font-mono text-white/60 uppercase font-bold tracking-wider flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-[#00fbfb]" />
                <span>{t('bounty.screenshotLabel', 'Screenshot or Video Link (Optional)')}</span>
              </label>
              <input
                type="url"
                value={screenshotUrl}
                onChange={(e) => setScreenshotUrl(e.target.value)}
                placeholder="https://imgur.com/... or cloud screenshot link"
                className="w-full bg-black/50 border border-white/15 focus:border-[#00fbfb] rounded-xl py-2 px-3 text-xs text-white placeholder-white/30 outline-none transition"
              />
            </div>

            {/* Auto Telemetry Note */}
            <div className="p-2 bg-white/5 border border-white/5 rounded-xl text-[9px] font-mono text-white/40 flex items-center justify-between">
              <span className="truncate max-w-[240px]">📍 {pathname}</span>
              <span>📱 {viewport}</span>
            </div>

            {/* Submit Button */}
            <div className="pt-2 pb-1">
              <button
                type="submit"
                disabled={isSubmitting || description.trim().length < 5}
                className="w-full py-3 bg-[#00fbfb] text-black font-mono text-xs font-black uppercase tracking-wider rounded-xl hover:shadow-[0_0_20px_rgba(0,251,251,0.5)] transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>{t('bounty.submitBtn', 'Send Report & Claim Bounty →')}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}
