'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, AlertTriangle, ShieldCheck } from 'lucide-react';
import {
  type ProvenanceLevel,
  PROVENANCE_ORDER,
  PROVENANCE_TIERS,
  requiresReplicantConsent,
} from '@/lib/content-provenance';

// ─── Types ──────────────────────────────────────────────────────────────────────

interface ProvenanceSelectorProps {
  /** Currently selected provenance level */
  value: ProvenanceLevel;
  /** Callback when the user selects a provenance level */
  onChange: (level: ProvenanceLevel) => void;
  /** Whether the creator has active digital_replica_consent */
  hasReplicantConsent?: boolean;
  /** Language */
  locale?: 'en' | 'es';
  /** Additional className */
  className?: string;
}

// ─── Component ──────────────────────────────────────────────────────────────────

export default function ProvenanceSelector({
  value,
  onChange,
  hasReplicantConsent = false,
  locale = 'en',
  className = '',
}: ProvenanceSelectorProps) {
  const [expandedTier, setExpandedTier] = useState<ProvenanceLevel | null>(null);
  const isEs = locale === 'es';

  const handleSelect = (level: ProvenanceLevel) => {
    // If selecting ai_generated without consent, don't allow
    if (requiresReplicantConsent(level) && !hasReplicantConsent) {
      return;
    }
    onChange(level);
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <ShieldCheck className="w-4 h-4 text-primary" />
        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/80">
          {isEs ? 'Declaración de Procedencia del Contenido' : 'Content Provenance Declaration'}
        </h4>
      </div>

      <p className="text-[8px] text-white/40 uppercase tracking-widest leading-relaxed mb-4">
        {isEs
          ? 'Selecciona cómo fue creado este contenido. Tu audiencia verá esta etiqueta. Sé transparente — genera confianza.'
          : 'Select how this content was created. Your audience will see this label. Be transparent — it builds trust.'}
      </p>

      {/* Provenance Options */}
      <div className="space-y-2">
        {PROVENANCE_ORDER.map((level) => {
          const tier = PROVENANCE_TIERS[level];
          const isSelected = value === level;
          const isExpanded = expandedTier === level;
          const isLocked = requiresReplicantConsent(level) && !hasReplicantConsent;

          return (
            <div key={level}>
              {/* Option Card */}
              <button
                type="button"
                onClick={() => handleSelect(level)}
                disabled={isLocked}
                className={`
                  w-full text-left p-4 rounded-2xl border transition-all duration-300
                  ${isSelected
                    ? `${tier.bgClass} ${tier.borderClass} ring-1 ring-${tier.color}-500/30`
                    : 'bg-black/30 border-white/5 hover:border-white/10'
                  }
                  ${isLocked ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
                `}
              >
                <div className="flex items-center justify-between">
                  {/* Left: Radio + Label */}
                  <div className="flex items-center gap-3">
                    {/* Custom radio */}
                    <div
                      className={`
                        w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all shrink-0
                        ${isSelected
                          ? `${tier.borderClass.replace('/20', '')} ${tier.bgClass.replace('/10', '/40')}`
                          : 'border-white/20'
                        }
                      `}
                    >
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className={`w-2 h-2 rounded-full ${
                            level === 'genuine'
                              ? 'bg-emerald-400'
                              : level === 'ai_assisted'
                                ? 'bg-blue-400'
                                : level === 'ai_generated'
                                  ? 'bg-violet-400'
                                  : 'bg-amber-400'
                          }`}
                        />
                      )}
                    </div>

                    {/* Label + Short description */}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{tier.emoji}</span>
                        <span className={`text-[10px] font-black uppercase tracking-widest ${
                          isSelected ? tier.textClass : 'text-white/70'
                        }`}>
                          {isEs ? tier.labelEs : tier.label}
                        </span>
                      </div>
                      <p className="text-[8px] text-white/40 uppercase tracking-widest mt-0.5">
                        {isEs ? tier.shortDescEs : tier.shortDesc}
                      </p>
                    </div>
                  </div>

                  {/* Right: Expand toggle */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setExpandedTier(isExpanded ? null : level);
                    }}
                    className="p-1.5 rounded-lg hover:bg-white/5 transition-colors"
                  >
                    <ChevronDown
                      className={`w-3.5 h-3.5 text-white/30 transition-transform duration-200 ${
                        isExpanded ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                </div>

                {/* Locked warning for ai_generated without consent */}
                {isLocked && (
                  <div className="mt-2 flex items-center gap-1.5 text-[8px] text-amber-400/80 font-black uppercase tracking-widest">
                    <AlertTriangle className="w-3 h-3 shrink-0" />
                    {isEs
                      ? 'Requiere Autorización de Replicant activa en Studio → Configuración'
                      : 'Requires active Replicant Authorization in Studio → Settings'}
                  </div>
                )}
              </button>

              {/* Expandable detail panel */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-1 ml-7 p-3 bg-black/40 rounded-xl border border-white/5 space-y-2">
                      {/* Full description */}
                      <p className="text-[8px] text-white/50 uppercase tracking-widest leading-relaxed">
                        {isEs ? tier.fullDescEs : tier.fullDesc}
                      </p>

                      {/* Examples */}
                      <div className="pt-2 border-t border-white/5">
                        <span className="text-[7px] font-black uppercase tracking-widest text-white/30">
                          {isEs ? 'Ejemplos:' : 'Examples:'}
                        </span>
                        <p className="text-[8px] text-white/40 uppercase tracking-widest mt-0.5">
                          {isEs ? tier.examplesEs : tier.examples}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* Auto-detection notice */}
      <div className="mt-4 p-3 bg-white/2 rounded-xl border border-white/5 flex items-start gap-2">
        <ShieldCheck className="w-3.5 h-3.5 text-primary/60 shrink-0 mt-0.5" />
        <p className="text-[7px] text-white/30 uppercase tracking-widest leading-relaxed">
          {isEs
            ? 'SECCION analiza automáticamente el contenido subido para verificar la procedencia. Si nuestro análisis difiere de tu declaración, te pediremos que la reconsideres.'
            : 'SECCION automatically analyzes uploaded content to verify provenance. If our analysis differs from your declaration, we\'ll ask you to reconsider.'}
        </p>
      </div>
    </div>
  );
}
