'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Heart, Sparkles, Zap, Shield, ShieldCheck, Lock, 
  MessageSquare, Calendar, Compass, Activity, ArrowUpRight,
  TrendingUp, Users, CheckCircle2
} from 'lucide-react';
import Link from 'next/link';
import BlurredFaceImage from '@/components/BlurredFaceImage';
import { 
  RELATIONSHIP_LEVELS, 
  type RelationshipLevel,
  type DualGaugeState 
} from '@/lib/relationship-engine';
import { useTranslation } from '@/context/LanguageContext';

export interface MatchConnectionItem {
  id: string;
  name: string;
  avatar: string;
  face_blur_active?: boolean;
  avatar_face_coordinates?: { x: number; y: number; r: number };
  matchScore: number;
  ratingScore?: number;
  current_level?: string;
  gauge_score?: number;
  is_matched?: boolean;
  kycVerified?: boolean;
  relationshipStatus?: string;
  datePlans?: any[];
}

interface MemberConnectionsTabProps {
  connections: MatchConnectionItem[];
  selectedConnection: MatchConnectionItem | null;
  onSelectConnection: (connection: MatchConnectionItem) => void;
  dualGauge: DualGaugeState | null;
  onOpenSuggestionMoves: (targetId: string, levelKey: string) => void;
  onOpenStory?: (targetId: string) => void;
  onOpenDatePlan?: (planId: string) => void;
}

export default function MemberConnectionsTab({
  connections,
  selectedConnection,
  onSelectConnection,
  dualGauge,
  onOpenSuggestionMoves,
  onOpenStory,
  onOpenDatePlan
}: MemberConnectionsTabProps) {
  const { t, locale } = useTranslation();

  const currentLevelIndex = RELATIONSHIP_LEVELS.findIndex(
    l => l.key === (dualGauge?.level?.key || 'strangers')
  );

  return (
    <div className="space-y-8 animate-fade-in text-left">
      
      {/* ─── Top Dual Gauge Hero Section ─────────────────────────────────── */}
      <div className="p-6 sm:p-8 rounded-[2.5rem] bg-gradient-to-br from-white/[0.04] via-black/60 to-white/[0.01] border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.6)] backdrop-blur-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                <Activity className="w-4 h-4" />
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                {locale === 'es' ? 'Rastreador de Relación & Sinergia' : 'Relationship Depth & Dual-Gauge'}
              </h2>
            </div>
            <p className="text-xs text-[#b9cac9] max-w-xl leading-relaxed">
              {locale === 'es'
                ? 'Monitorea la afinidad mutua calculada mediante la media armónica. Desbloquea permisos RLS, gestos de sugerencia y citas presenciales al subir de nivel.'
                : 'Track mutual relationship depth resolved via weighted harmonic scoring. Unlock RLS privacy gates, suggestion moves, and in-person plans as your synergy evolves.'}
            </p>
          </div>

          {/* Current Level Pill Badge */}
          {dualGauge && (
            <div className="flex items-center gap-4 bg-black/50 border border-white/10 p-3.5 rounded-2xl shrink-0">
              <div className="text-right">
                <p className="text-[9px] uppercase font-mono font-bold text-white/50">
                  {locale === 'es' ? 'Nivel de Conexión' : 'Harmonic Level'}
                </p>
                <p className="text-base font-black text-white flex items-center gap-1.5 justify-end" style={{ color: dualGauge.level.color }}>
                  <span>{dualGauge.level.label}</span>
                </p>
              </div>
              <div 
                className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg text-black shadow-lg"
                style={{ backgroundColor: dualGauge.level.color }}
              >
                {Math.round(dualGauge.sharedScore)}
              </div>
            </div>
          )}
        </div>

        {/* ─── 8 Milestone Progression Bar (Exact RLS Alignment) ──────────── */}
        <div className="mt-8 pt-6 border-t border-white/5 space-y-3">
          <div className="flex justify-between items-center text-[10px] font-mono font-bold uppercase tracking-wider text-white/60">
            <span>{locale === 'es' ? 'Hitos de Nivel (RLS)' : 'RLS Milestone Progression'}</span>
            <span className="text-primary font-black">
              {dualGauge ? `${Math.round(dualGauge.sharedScore)} / 100 PTS` : '0 / 100 PTS'}
            </span>
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
            {RELATIONSHIP_LEVELS.map((level, idx) => {
              const isPassed = currentLevelIndex >= idx;
              const isCurrent = currentLevelIndex === idx;

              return (
                <div 
                  key={level.key}
                  className={`p-2.5 rounded-2xl border transition-all duration-300 flex flex-col justify-between ${
                    isCurrent 
                      ? 'bg-primary/15 border-primary shadow-[0_0_15px_rgba(0,251,251,0.2)]'
                      : isPassed
                      ? 'bg-white/[0.04] border-white/20'
                      : 'bg-black/30 border-white/5 opacity-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[8px] font-mono font-bold text-white/40">
                      L{idx + 1}
                    </span>
                    {level.kycRequired && (
                      <span title="KYC Gate Required">
                        <ShieldCheck className="w-2.5 h-2.5 text-emerald-400" />
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="text-[9px] font-black tracking-tight truncate text-white">
                      {level.label}
                    </p>
                    <p className="text-[8px] text-white/40 font-mono">
                      {level.minScore}-{level.maxScore}p
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ─── Connections Grid & Actions Row ───────────────────────────────── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" />
            <span>{locale === 'es' ? 'Tus Conexiones & Matches' : 'Active Connections & Matches'}</span>
            <span className="text-xs text-white/40 font-mono">({connections.length})</span>
          </h3>
        </div>

        {connections.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {connections.map((conn) => {
              const isSelected = selectedConnection?.id === conn.id;

              return (
                <motion.div
                  key={conn.id}
                  onClick={() => onSelectConnection(conn)}
                  whileHover={{ scale: 1.01 }}
                  className={`p-5 rounded-3xl border transition-all duration-300 cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                    isSelected
                      ? 'bg-white/[0.08] border-primary shadow-[0_0_20px_rgba(0,251,251,0.2)]'
                      : 'bg-white/[0.02] border-white/5 hover:border-white/20'
                  }`}
                >
                  {/* Top Creator Info */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl overflow-hidden border border-white/10 shrink-0 relative bg-black/40">
                        <BlurredFaceImage
                          src={conn.avatar}
                          alt={conn.name}
                          sharedScore={conn.matchScore}
                          isEnabledByOwner={conn.face_blur_active}
                          faceCoordinates={conn.avatar_face_coordinates}
                          className="w-full h-full"
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="text-sm font-black text-white tracking-tight">@{conn.name}</p>
                          {conn.kycVerified && (
                            <span title="KYC Verified">
                              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-white/50 font-mono mt-0.5">
                          ⭐ {conn.ratingScore?.toFixed(2) || '10.00'} • {conn.current_level || 'Friendly'}
                        </p>
                      </div>
                    </div>

                    <span className="px-2.5 py-1 bg-primary/10 border border-primary/20 rounded-full text-[9px] font-black text-primary font-mono shrink-0">
                      {conn.matchScore}%
                    </span>
                  </div>

                  {/* Quick Action CTAs */}
                  <div className="flex items-center gap-2 pt-3 border-t border-white/5">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenSuggestionMoves(conn.id, conn.current_level || 'friendly');
                      }}
                      className="flex-1 py-2 px-3 rounded-xl bg-primary/15 hover:bg-primary/25 border border-primary/30 text-primary font-mono text-[9px] font-black uppercase tracking-wider transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>{locale === 'es' ? 'Gesto' : 'Move'}</span>
                    </button>

                    <Link
                      href={`/messages?id=${conn.id}`}
                      onClick={(e) => e.stopPropagation()}
                      className="flex-1 py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-mono text-[9px] font-black uppercase tracking-wider transition flex items-center justify-center gap-1.5 text-center"
                    >
                      <MessageSquare className="w-3 h-3" />
                      <span>{locale === 'es' ? 'Chat' : 'Chat'}</span>
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 rounded-3xl bg-white/[0.01] border border-white/5 text-center text-[#b9cac9] text-xs space-y-3">
            <Compass className="w-8 h-8 text-white/30 mx-auto" />
            <p>
              {locale === 'es'
                ? 'Aún no tienes conexiones activas. Explora el Feed o envía pulsos de afinidad para empezar a conectar.'
                : 'No active connections found yet. Explore the Feed or send affinity pulses to start connecting.'}
            </p>
            <Link
              href="/feed"
              className="inline-block py-2.5 px-6 rounded-xl bg-primary text-black font-mono text-[10px] font-black uppercase tracking-wider hover:shadow-[0_0_15px_rgba(0,251,251,0.4)] transition"
            >
              {locale === 'es' ? 'Explorar Feed' : 'Explore Feed'}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
