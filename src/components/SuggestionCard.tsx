'use client';

/**
 * SuggestionCard.tsx — FE-UI-003 / UX-002 / FE-UI-004
 *
 * Renders a single AI prediction card with:
 *  - Profile image, category badge, composite score
 *  - Narrative teaser (always visible)
 *  - "Read More" expander revealing full reasoning (FE-UI-004)
 *  - Micro-animations: glow on hover, smooth expand, spring entrance
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Zap, TrendingUp, ArrowRight } from 'lucide-react';
import type { PredictionPayload } from '@/lib/ai-suggestion-service';
import { CATEGORY_META } from '@/lib/ai-suggestion-service';

interface SuggestionCardProps {
  payload: PredictionPayload;
  rank: number;
  onAction: (payload: PredictionPayload) => void;
}

/** Maps a suggested_action_id to a human-readable CTA */
const ACTION_LABELS: Record<string, string> = {
  compliment: 'Send a Compliment',
  wave: 'Send a Wave',
  reaction: 'Send a Reaction',
  follow: 'Follow Now',
  playlist: 'Share a Playlist',
};

export default function SuggestionCard({ payload, rank, onAction }: SuggestionCardProps) {
  const [expanded, setExpanded] = useState(false);
  const meta = CATEGORY_META[payload.category];

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.45, delay: rank * 0.08, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ scale: 1.015 }}
      className="relative rounded-2xl border border-white/8 bg-black/40 backdrop-blur-xl overflow-hidden group transition-shadow duration-500"
      style={{
        boxShadow: `0 0 0 0px ${meta.glowColor}`,
      }}
      onHoverStart={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow = `0 0 32px 2px ${meta.glowColor}`;
      }}
      onHoverEnd={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow = `0 0 0 0px ${meta.glowColor}`;
      }}
    >
      {/* Ambient glow background */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none rounded-2xl"
        style={{ background: `radial-gradient(ellipse at 50% 0%, ${meta.glowColor} 0%, transparent 70%)` }}
      />

      {/* Rank indicator */}
      <div className="absolute top-3 left-3 z-10 w-6 h-6 rounded-full bg-black/60 border border-white/10 flex items-center justify-center">
        <span className="text-[9px] font-black text-white/50">#{rank + 1}</span>
      </div>

      {/* Category badge */}
      <div
        className="absolute top-3 right-3 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[9px] font-black uppercase tracking-widest backdrop-blur-md"
        style={{
          borderColor: `${meta.color}40`,
          backgroundColor: `${meta.color}15`,
          color: meta.color,
        }}
      >
        <span>{meta.icon}</span>
        {meta.label}
      </div>

      <div className="p-4 pt-12 flex items-start gap-4">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <div
            className="w-14 h-14 rounded-2xl overflow-hidden border-2 shadow-xl"
            style={{ borderColor: `${meta.color}60` }}
          >
            <img
              src={payload.avatar_url}
              alt={payload.username}
              className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
            />
          </div>
          {/* Score ring */}
          <div
            className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-full border-2 border-black flex items-center justify-center text-[8px] font-black shadow-lg"
            style={{ backgroundColor: meta.color }}
          >
            {payload.score}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Username + signals row */}
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <p className="font-black text-sm text-white tracking-tight">@{payload.username}</p>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-[9px] text-white/40 font-bold uppercase">
                <Zap className="w-2.5 h-2.5" style={{ color: meta.color }} />
                <span style={{ color: meta.color }}>{payload.match_probability}%</span>
              </div>
              <div className="flex items-center gap-1 text-[9px] text-white/40 font-bold uppercase">
                <TrendingUp className="w-2.5 h-2.5 text-emerald-400" />
                <span className="text-emerald-400">{payload.momentum_score}</span>
              </div>
            </div>
          </div>

          {/* Teaser narrative */}
          <p className="text-[11px] text-white/70 leading-relaxed font-medium">
            {payload.narrative_insight}
          </p>

          {/* Read More expander (FE-UI-004) */}
          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="overflow-hidden"
              >
                <div
                  className="mt-3 p-3 rounded-xl border text-[10px] text-white/60 leading-relaxed font-medium"
                  style={{
                    borderColor: `${meta.color}20`,
                    backgroundColor: `${meta.color}08`,
                  }}
                >
                  {payload.narrative_detail}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Expand toggle */}
          <button
            onClick={() => setExpanded(!expanded)}
            className="mt-2 flex items-center gap-1 text-[9px] font-black uppercase tracking-widest transition-colors"
            style={{ color: expanded ? meta.color : 'rgba(255,255,255,0.30)' }}
          >
            {expanded ? (
              <>
                <ChevronUp className="w-3 h-3" /> Close
              </>
            ) : (
              <>
                <ChevronDown className="w-3 h-3" /> Read More
              </>
            )}
          </button>
        </div>
      </div>

      {/* Opportunity gap bar */}
      <div className="px-4 pb-1">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[8px] font-black text-white/30 uppercase tracking-widest">
            Next Level Gap
          </span>
          <span className="text-[8px] font-black text-white/30">
            {100 - payload.opportunity_gap}% → Unlock
          </span>
        </div>
        <div className="h-0.5 bg-white/5 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${100 - payload.opportunity_gap}%` }}
            transition={{ duration: 0.8, delay: rank * 0.1 + 0.4, ease: 'easeOut' }}
            className="h-full rounded-full"
            style={{ backgroundColor: meta.color }}
          />
        </div>
      </div>

      {/* CTA */}
      <div className="px-4 pb-4 pt-3">
        <button
          onClick={() => onAction(payload)}
          className="w-full py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all duration-300 border"
          style={{
            backgroundColor: `${meta.color}15`,
            borderColor: `${meta.color}30`,
            color: meta.color,
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.backgroundColor = meta.color;
            (e.currentTarget as HTMLElement).style.color = '#000';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.backgroundColor = `${meta.color}15`;
            (e.currentTarget as HTMLElement).style.color = meta.color;
          }}
        >
          {ACTION_LABELS[payload.suggested_action_id] ?? 'Connect'}
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </motion.div>
  );
}
