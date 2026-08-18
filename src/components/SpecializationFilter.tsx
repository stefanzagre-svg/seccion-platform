'use client';

import React, { useState } from 'react';
import { CREATOR_SPECIALIZATIONS, CreatorSpecialization } from '@/lib/constants';
import { AgeConsentModal } from './AgeConsentModal';
import { ShieldCheck, ShieldAlert, Sparkles, Filter } from 'lucide-react';
import { useTranslation } from '@/context/LanguageContext';

const SHORT_TITLES: Record<string, string> = {
  ai_tech: "AI & Technology",
  beauty: "Beauty & Makeup",
  style: "Fashion & Style",
  culinary: "Cooking & Dining",
  dating: "Dating Coach",
  fitness: "Fitness Coach",
  creative: "Art & Performance",
  career: "Career & Ambition",
  wellness: "Wellness Guide",
  financial: "Wealth Architect",
  adult: "18+ Sensual"
};

const SHORT_TITLES_ES: Record<string, string> = {
  ai_tech: "IA y Tecnología",
  beauty: "Belleza y Maquillaje",
  style: "Moda y Estilo",
  culinary: "Cocina y Cena",
  dating: "Dating Coach",
  fitness: "Fitness Coach",
  creative: "Arte y Show",
  career: "Carrera y Ambición",
  wellness: "Guía de Bienestar",
  financial: "Arquitecto de Riqueza",
  adult: "18+ Sensual"
};

interface SpecializationFilterProps {
  selectedId: string;
  onSelectSpecialization: (specId: string) => void;
  includeAdult: boolean;
  onToggleAdult: (include: boolean) => void;
}

export const SpecializationFilter: React.FC<SpecializationFilterProps> = ({
  selectedId,
  onSelectSpecialization,
  includeAdult,
  onToggleAdult,
}) => {
  const [showAgeModal, setShowAgeModal] = useState(false);
  const { locale } = useTranslation();

  const handleAdultToggleClick = () => {
    if (includeAdult) {
      // If currently unlocked, turn back off cleanly
      onToggleAdult(false);
    } else {
      // Open consent modal before unlocking
      setShowAgeModal(true);
    }
  };

  const handleConsentConfirm = () => {
    setShowAgeModal(false);
    onToggleAdult(true);
  };

  const titles = locale === 'es' ? SHORT_TITLES_ES : SHORT_TITLES;

  return (
    <div className="w-full space-y-3">
      {/* Explicit & Sensual Content Discovery (SafeSearch 18+) Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-red-950/40 via-[#0A0A18] to-purple-950/40 border border-red-500/40 shadow-[0_0_25px_rgba(239,68,68,0.15)] flex flex-col md:flex-row items-start md:items-center justify-between gap-4 my-2 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex items-start gap-3.5 relative z-10">
          <div className="w-10 h-10 rounded-xl bg-red-500/15 border border-red-500/40 flex items-center justify-center shrink-0 mt-0.5">
            <ShieldAlert className="w-5 h-5 text-red-400 animate-pulse" />
          </div>
          <div className="space-y-1 text-left">
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                {locale === 'es' ? 'Descubrimiento de Contenido 18+ y Explícito (SafeSearch)' : 'Explicit & 18+ Content Discovery (SafeSearch Tool)'}
              </h4>
              <span className="text-[9px] font-mono text-red-400 bg-red-500/10 border border-red-500/30 px-2 py-0.5 rounded-full font-bold uppercase">
                {includeAdult ? (locale === 'es' ? '18+ Desbloqueado' : '18+ Unlocked') : (locale === 'es' ? 'Filtro SFW Activo' : 'SFW Filter Active')}
              </span>
            </div>
            <p className="text-xs text-[#b9cac9] leading-relaxed max-w-2xl font-medium">
              {locale === 'es' ? (
                <>SECCION mantiene los feeds públicos 100% SFW por defecto con SafeSearch <strong>ACTIVO</strong>. Para encontrar Creadores Sensuales 18+, desbloquear contenido privado PPV y acceder a streams en vivo sin censura, usa el botón SafeSearch abajo para verificar tu edad y activar el contenido explícito.</>
              ) : (
                <>SECCION keeps public discovery feeds 100% SFW by default with SafeSearch <strong>ON</strong>. To find 18+ Sensual Creators, unlock private PPV content, and access behind-closed-doors live streams nationwide, use the SafeSearch toggle below to verify age and enable explicit content.</>
              )}
            </p>
          </div>
        </div>

        <button
          onClick={handleAdultToggleClick}
          className={`px-4 py-2.5 rounded-xl border text-xs font-mono font-black uppercase tracking-wider transition-all duration-300 shrink-0 cursor-pointer shadow-lg relative z-10 ${
            includeAdult
              ? 'bg-red-500/25 border-red-400 text-red-200 shadow-red-500/30 hover:bg-red-500/35'
              : 'bg-[#00fbfb]/15 border-[#00fbfb] text-[#00fbfb] hover:bg-[#00fbfb]/25 shadow-[0_0_20px_rgba(0,251,251,0.3)]'
          }`}
        >
          {includeAdult
            ? (locale === 'es' ? '🔞 18+ Desbloqueado (SafeSearch OFF)' : '🔞 18+ Unlocked (SafeSearch OFF)')
            : (locale === 'es' ? '🔓 Desbloquear SafeSearch 18+' : '🔓 Unlock 18+ SafeSearch')}
        </button>
      </div>

      {/* Top Filter Bar Header with 18+ SafeSearch Toggle */}
      <div className="flex items-center justify-between gap-2 px-1 pt-2">
        <div className="flex items-center gap-2 text-xs font-mono font-bold text-white/80">
          <Filter className="w-3.5 h-3.5 text-[#ffabf3]" />
          <span>{locale === 'es' ? 'Filtrar Creadores por Categoría' : 'Filter Creators by Category'}</span>
        </div>

        {/* 18+ SafeSearch Toggle Pill */}
        <button
          onClick={handleAdultToggleClick}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-[11px] font-mono transition-all cursor-pointer ${
            includeAdult
              ? 'bg-red-500/20 border-red-500/50 text-red-300 shadow-lg shadow-red-500/20'
              : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
          }`}
        >
          {includeAdult ? (
            <>
              <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
              <span>SafeSearch: <strong className="text-red-300">{locale === 'es' ? 'OFF (18+ Desbloqueado)' : 'OFF (18+ Unlocked)'}</strong></span>
            </>
          ) : (
            <>
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>SafeSearch: <strong className="text-emerald-300">{locale === 'es' ? 'ACTIVO (100% SFW)' : 'ON (100% SFW)'}</strong></span>
            </>
          )}
        </button>
      </div>

      {/* Category Specialization Chips */}
      <div className="flex flex-wrap items-center gap-2.5 pt-1.5 pb-2">
        {/* "All Specializations" Chip */}
        <button
          onClick={() => onSelectSpecialization('all')}
          className={`shrink-0 px-3.5 py-1.5 rounded-xl border text-xs font-mono transition-all flex items-center gap-1.5 ${
            selectedId === 'all'
              ? 'bg-gradient-to-r from-[#ffabf3]/30 to-[#00fbfb]/30 border-[#ffabf3] text-white font-bold shadow-lg shadow-[#ffabf3]/20'
              : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:text-white'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-[#ffabf3]" />
          <span>{locale === 'es' ? 'Todos los Creadores' : 'All Creators'}</span>
        </button>

        {/* Mainstream & Adult Specialization Chips */}
        {CREATOR_SPECIALIZATIONS.map((spec: CreatorSpecialization) => {
          // If adult specialization, hide from bar if SafeSearch is ON
          if (spec.isAdult && !includeAdult) return null;

          const isSelected = selectedId === spec.id;

          return (
            <button
              key={spec.id}
              onClick={() => onSelectSpecialization(spec.id)}
              className={`shrink-0 px-3.5 py-1.5 rounded-xl border text-xs font-mono transition-all flex items-center gap-1.5 ${
                isSelected
                  ? `bg-gradient-to-r ${spec.color} border-current font-bold shadow-md`
                  : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:text-white'
              }`}
            >
              <span>{spec.icon}</span>
              <span>{titles[spec.id] || spec.title}</span>
            </button>
          );
        })}
      </div>

      {/* Interactive 18+ Consent Modal */}
      <AgeConsentModal
        isOpen={showAgeModal}
        onConfirm={handleConsentConfirm}
        onCancel={() => setShowAgeModal(false)}
      />
    </div>
  );
};

