'use client';

import React from 'react';
import { ShieldAlert, CheckCircle2, Lock, Eye, AlertTriangle } from 'lucide-react';
import { useTranslation } from '@/context/LanguageContext';

interface AgeConsentModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const AgeConsentModal: React.FC<AgeConsentModalProps> = ({
  isOpen,
  onConfirm,
  onCancel,
}) => {
  const { locale } = useTranslation();
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#0a1215] border border-red-500/40 rounded-2xl p-6 shadow-2xl shadow-red-500/10 space-y-5">
        
        {/* Top Header Badge */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-red-500/20 border border-red-500/50 flex items-center justify-center text-red-400">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white font-mono tracking-tight flex items-center gap-2">
              {locale === 'es' ? '🔞 Consentimiento de Edad y Contenido 18+' : '🔞 18+ Age & Content Consent'}
            </h3>
            <p className="text-xs text-white/50">
              {locale === 'es' ? 'Protección y Cumplimiento SECCION' : 'SECCION Safety & Compliance Guard'}
            </p>
          </div>
        </div>

        {/* Informational Message */}
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 space-y-2 text-xs text-red-200/90 leading-relaxed">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <p>
              {locale === 'es' ? (
                <>Estás activando <strong className="text-red-300">Especializaciones 18+ y Explícitas</strong>. Este modo muestra perfiles de creadores adultos sin censura, etiquetas sensuales y contenido explícito en el feed.</>
              ) : (
                <>You are enabling <strong className="text-red-300">18+ Mature & Explicit Specializations</strong>. This mode displays un-blurred adult creator profiles, sensual tags, and explicit feed content.</>
              )}
            </p>
          </div>
        </div>

        {/* Verification Checklist */}
        <div className="space-y-2 text-xs text-white/80">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              {locale === 'es'
                ? 'Confirmo que tengo al menos 18 años (o la mayoría de edad legal en mi jurisdicción).'
                : 'I confirm I am at least 18 years of age (or legal age in my jurisdiction).'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              {locale === 'es'
                ? 'Consiento ver especializaciones y etiquetas explícitas de creadores adultos.'
                : 'I consent to viewing adult explicit creator specializations and tags.'}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 rounded-xl border border-white/10 text-xs text-white/70 font-mono hover:bg-white/5 transition-all"
          >
            {locale === 'es' ? 'Mantener SafeSearch ACTIVO' : 'Keep SafeSearch ON'}
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-pink-600 text-xs text-white font-bold font-mono shadow-lg shadow-red-500/30 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <Eye className="w-4 h-4" />
            {locale === 'es' ? 'Desbloquear Contenido 18+' : 'Unlock 18+ Content'}
          </button>
        </div>
      </div>
    </div>
  );
};

