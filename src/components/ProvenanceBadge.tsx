'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Info } from 'lucide-react';
import { type ProvenanceLevel, getProvenanceTier } from '@/lib/content-provenance';

// ─── Types ──────────────────────────────────────────────────────────────────────

interface ProvenanceBadgeProps {
  /** The provenance classification level */
  level: ProvenanceLevel;
  /** Creator name — shown for 'ai_generated' (Replicant) level */
  creatorName?: string;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Use Spanish labels */
  locale?: 'en' | 'es';
  /** Show tooltip on hover/tap */
  showTooltip?: boolean;
  /** Additional className */
  className?: string;
}

// ─── Component ──────────────────────────────────────────────────────────────────

export default function ProvenanceBadge({
  level,
  creatorName,
  size = 'sm',
  locale = 'en',
  showTooltip = true,
  className = '',
}: ProvenanceBadgeProps) {
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const tier = getProvenanceTier(level);
  const isEs = locale === 'es';

  // Dynamic label — for Replicant level, include creator's name
  const displayLabel =
    level === 'ai_generated' && creatorName
      ? isEs
        ? `100% Replicant de ${creatorName}`
        : `100% ${creatorName}'s Replicant`
      : isEs
        ? tier.labelEs
        : tier.label;

  const tooltipText = isEs ? tier.fullDescEs : tier.fullDesc;

  // Size variants
  const sizeClasses = {
    sm: 'text-[7px] px-2 py-0.5 gap-1',
    md: 'text-[9px] px-2.5 py-1 gap-1.5',
    lg: 'text-[10px] px-3 py-1.5 gap-2',
  };

  const dotSizes = {
    sm: 'w-1 h-1',
    md: 'w-1.5 h-1.5',
    lg: 'w-2 h-2',
  };

  return (
    <div className={`relative inline-flex ${className}`}>
      {/* Badge pill */}
      <button
        type="button"
        onClick={() => showTooltip && setTooltipOpen(!tooltipOpen)}
        onMouseEnter={() => showTooltip && setTooltipOpen(true)}
        onMouseLeave={() => showTooltip && setTooltipOpen(false)}
        className={`
          inline-flex items-center font-black uppercase tracking-widest
          rounded-full border backdrop-blur-sm transition-all duration-300
          select-none cursor-default
          ${sizeClasses[size]}
          ${tier.bgClass} ${tier.borderClass} ${tier.textClass}
          ${level === 'ai_generated' ? 'animate-pulse' : ''}
          ${showTooltip ? 'cursor-help' : ''}
        `}
      >
        {/* Status dot */}
        <span
          className={`
            inline-block rounded-full shrink-0
            ${dotSizes[size]}
            ${level === 'genuine'
              ? 'bg-emerald-400'
              : level === 'ai_assisted'
                ? 'bg-blue-400'
                : level === 'ai_generated'
                  ? 'bg-violet-400 animate-pulse'
                  : 'bg-amber-400'
            }
          `}
        />

        {/* Emoji + Label */}
        <span>{tier.emoji}</span>
        <span className="truncate max-w-[140px]">{displayLabel}</span>

        {showTooltip && (
          <Info className={`shrink-0 opacity-40 ${size === 'sm' ? 'w-2.5 h-2.5' : 'w-3 h-3'}`} />
        )}
      </button>

      {/* Tooltip */}
      <AnimatePresence>
        {tooltipOpen && showTooltip && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className={`
              absolute z-50 bottom-full mb-2 left-1/2 -translate-x-1/2
              w-64 p-3 rounded-2xl
              bg-black/90 backdrop-blur-xl border border-white/10
              shadow-2xl shadow-black/50
            `}
          >
            {/* Header */}
            <div className={`flex items-center gap-1.5 mb-1.5 ${tier.textClass}`}>
              <span className="text-sm">{tier.emoji}</span>
              <span className="text-[9px] font-black uppercase tracking-widest">
                {displayLabel}
              </span>
            </div>

            {/* Description */}
            <p className="text-[8px] text-white/50 uppercase tracking-wider leading-relaxed">
              {tooltipText}
            </p>

            {/* Arrow */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-l-transparent border-r-transparent border-t-black/90" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
