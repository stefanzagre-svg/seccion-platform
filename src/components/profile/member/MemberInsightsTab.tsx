'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Sparkles, Brain, Lock, Shield, 
  MessageSquare, HelpCircle, CheckCircle2, AlertTriangle 
} from 'lucide-react';
import { useTranslation } from '@/context/LanguageContext';

export interface BioAnalysisData {
  Emotional_Vector?: {
    Vulnerability_Score?: number;
    Defensive_Score?: number;
    Idealization_Bias?: number;
  };
  Interaction_Style?: {
    Directness?: string;
    Witty?: string;
    Introspective?: string;
  };
  Behavioral_Pattern?: {
    Investment_Driver?: string[];
    Red_Flags?: string[];
  };
}

interface MemberInsightsTabProps {
  bioAnalysis1?: BioAnalysisData | null;
  bioAnalysis2?: BioAnalysisData | null;
  prompt1?: { question: string; answer: string; isGated?: boolean };
  prompt2?: { question: string; answer: string; isGated?: boolean };
}

export default function MemberInsightsTab({
  bioAnalysis1,
  bioAnalysis2,
  prompt1,
  prompt2
}: MemberInsightsTabProps) {
  const { locale } = useTranslation();

  return (
    <div className="space-y-8 animate-fade-in text-left">
      
      {/* ─── Top Hero Card ──────────────────────────────────────────────── */}
      <div className="p-6 sm:p-8 rounded-[2.5rem] bg-gradient-to-br from-white/[0.04] via-black/60 to-white/[0.01] border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.6)] backdrop-blur-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <Brain className="w-4 h-4" />
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            {locale === 'es' ? 'Vectores de Compatibilidad IA' : 'AI Psychological Compatibility Vectors'}
          </h2>
        </div>
        <p className="text-xs text-[#b9cac9] max-w-xl leading-relaxed">
          {locale === 'es'
            ? 'Análisis relacional profundo extraído de tus respuestas de perfil. Ayuda al Asistente IA a recomendar conexiones con sinergia emocional y conductual auténtica.'
            : 'Deep psychological vectors extracted from your bio prompt answers. Powers the Synergy Engine to recommend high-vibration emotional matches.'}
        </p>
      </div>

      {/* ─── Prompt 1 Analysis ──────────────────────────────────────────── */}
      {prompt1 && (
        <div className="p-6 rounded-[2rem] bg-white/[0.02] border border-white/5 space-y-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-mono font-bold text-primary uppercase tracking-wider">
                {locale === 'es' ? 'Pregunta de Perfil 1' : 'Profile Prompt 1'}
              </p>
              <h3 className="text-sm font-black text-white mt-0.5">"{prompt1.question}"</h3>
              <p className="text-xs text-[#b9cac9] mt-2 italic font-medium leading-relaxed bg-black/40 p-3 rounded-xl border border-white/5">
                "{prompt1.answer || (locale === 'es' ? 'Sin respuesta' : 'No answer provided')}"
              </p>
            </div>

            {prompt1.isGated && (
              <span className="px-3 py-1 bg-red-500/10 border border-red-500/20 text-red-400 text-[8px] font-mono font-black uppercase tracking-wider rounded-xl shrink-0 flex items-center gap-1">
                <Lock className="w-2.5 h-2.5" />
                {locale === 'es' ? 'Privado RLS' : 'RLS Gated'}
              </span>
            )}
          </div>

          {/* Vectors Grid */}
          {bioAnalysis1?.Emotional_Vector && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-white/5">
              {/* Vulnerability */}
              <div className="p-3.5 rounded-2xl bg-black/50 border border-white/5 space-y-2">
                <div className="flex justify-between text-[9px] font-mono font-bold uppercase text-white/60">
                  <span>{locale === 'es' ? 'Apertura' : 'Vulnerability'}</span>
                  <span className="text-primary">
                    {Math.round((bioAnalysis1.Emotional_Vector.Vulnerability_Score || 0) * 100)}%
                  </span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-primary rounded-full"
                    style={{ width: `${(bioAnalysis1.Emotional_Vector.Vulnerability_Score || 0) * 100}%` }}
                  />
                </div>
              </div>

              {/* Defensive Guard */}
              <div className="p-3.5 rounded-2xl bg-black/50 border border-white/5 space-y-2">
                <div className="flex justify-between text-[9px] font-mono font-bold uppercase text-white/60">
                  <span>{locale === 'es' ? 'Guardia Defensiva' : 'Defensive Guard'}</span>
                  <span className="text-red-400">
                    {Math.round((bioAnalysis1.Emotional_Vector.Defensive_Score || 0) * 100)}%
                  </span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full"
                    style={{ width: `${(bioAnalysis1.Emotional_Vector.Defensive_Score || 0) * 100}%` }}
                  />
                </div>
              </div>

              {/* Idealization */}
              <div className="p-3.5 rounded-2xl bg-black/50 border border-white/5 space-y-2">
                <div className="flex justify-between text-[9px] font-mono font-bold uppercase text-white/60">
                  <span>{locale === 'es' ? 'Idealización' : 'Idealization'}</span>
                  <span className="text-amber-400">
                    {Math.round((bioAnalysis1.Emotional_Vector.Idealization_Bias || 0) * 100)}%
                  </span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-amber-600 to-yellow-400 rounded-full"
                    style={{ width: `${(bioAnalysis1.Emotional_Vector.Idealization_Bias || 0) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── Prompt 2 Analysis ──────────────────────────────────────────── */}
      {prompt2 && (
        <div className="p-6 rounded-[2rem] bg-white/[0.02] border border-white/5 space-y-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-mono font-bold text-[#ffabf3] uppercase tracking-wider">
                {locale === 'es' ? 'Pregunta de Perfil 2' : 'Profile Prompt 2'}
              </p>
              <h3 className="text-sm font-black text-white mt-0.5">"{prompt2.question}"</h3>
              <p className="text-xs text-[#b9cac9] mt-2 italic font-medium leading-relaxed bg-black/40 p-3 rounded-xl border border-white/5">
                "{prompt2.answer || (locale === 'es' ? 'Sin respuesta' : 'No answer provided')}"
              </p>
            </div>

            {prompt2.isGated && (
              <span className="px-3 py-1 bg-red-500/10 border border-red-500/20 text-red-400 text-[8px] font-mono font-black uppercase tracking-wider rounded-xl shrink-0 flex items-center gap-1">
                <Lock className="w-2.5 h-2.5" />
                {locale === 'es' ? 'Privado RLS' : 'RLS Gated'}
              </span>
            )}
          </div>

          {/* Vectors Grid */}
          {bioAnalysis2?.Emotional_Vector && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-white/5">
              {/* Vulnerability */}
              <div className="p-3.5 rounded-2xl bg-black/50 border border-white/5 space-y-2">
                <div className="flex justify-between text-[9px] font-mono font-bold uppercase text-white/60">
                  <span>{locale === 'es' ? 'Apertura' : 'Vulnerability'}</span>
                  <span className="text-primary">
                    {Math.round((bioAnalysis2.Emotional_Vector.Vulnerability_Score || 0) * 100)}%
                  </span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-primary rounded-full"
                    style={{ width: `${(bioAnalysis2.Emotional_Vector.Vulnerability_Score || 0) * 100}%` }}
                  />
                </div>
              </div>

              {/* Defensive Guard */}
              <div className="p-3.5 rounded-2xl bg-black/50 border border-white/5 space-y-2">
                <div className="flex justify-between text-[9px] font-mono font-bold uppercase text-white/60">
                  <span>{locale === 'es' ? 'Guardia Defensiva' : 'Defensive Guard'}</span>
                  <span className="text-red-400">
                    {Math.round((bioAnalysis2.Emotional_Vector.Defensive_Score || 0) * 100)}%
                  </span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full"
                    style={{ width: `${(bioAnalysis2.Emotional_Vector.Defensive_Score || 0) * 100}%` }}
                  />
                </div>
              </div>

              {/* Idealization */}
              <div className="p-3.5 rounded-2xl bg-black/50 border border-white/5 space-y-2">
                <div className="flex justify-between text-[9px] font-mono font-bold uppercase text-white/60">
                  <span>{locale === 'es' ? 'Idealización' : 'Idealization'}</span>
                  <span className="text-amber-400">
                    {Math.round((bioAnalysis2.Emotional_Vector.Idealization_Bias || 0) * 100)}%
                  </span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-amber-600 to-yellow-400 rounded-full"
                    style={{ width: `${(bioAnalysis2.Emotional_Vector.Idealization_Bias || 0) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── Behavioral Drivers & Safety Shield ─────────────────────────── */}
      <div className="p-6 rounded-[2rem] bg-white/[0.02] border border-white/5 space-y-4">
        <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-white/70">
          {locale === 'es' ? 'Conducta y Seguridad Emocional' : 'Behavioral Drivers & Safety'}
        </h4>

        <div className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
          <Shield className="w-4 h-4 shrink-0" />
          <span>
            {locale === 'es'
              ? 'Tus vectores psicológicos están protegidos por ZKP y nunca se comparten con terceros ni con otros usuarios sin tu consentimiento explícito.'
              : 'Your psychological vectors are zero-knowledge protected and never shared with 3rd parties or members without your explicit permission.'}
          </span>
        </div>
      </div>
    </div>
  );
}
