'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Video, Tv, ShieldCheck, Users, Sparkles, 
  MessageSquare, Volume2, Shield, Heart, Plus, X 
} from 'lucide-react';
import { useTranslation } from '@/context/LanguageContext';

export interface CoPerformerConsent {
  id: string;
  legal_name: string;
  stage_name?: string;
  dob: string;
  id_document_url?: string;
  is_verified_2257: boolean;
  signature_timestamp?: string;
}

interface StudioStreamTabProps {
  isStreaming: boolean;
  onToggleStream: () => void;
  viewerCount: number;
  liveChatMessages: { id: string; user: string; text: string; isVip?: boolean; tipAmount?: number }[];
  onSendChatMessage: (text: string) => void;
  coPerformers: CoPerformerConsent[];
  onAddCoPerformer: (performer: Omit<CoPerformerConsent, 'id' | 'is_verified_2257'>) => void;
  onRemoveCoPerformer: (id: string) => void;
}

export default function StudioStreamTab({
  isStreaming,
  onToggleStream,
  viewerCount,
  liveChatMessages,
  onSendChatMessage,
  coPerformers,
  onAddCoPerformer,
  onRemoveCoPerformer
}: StudioStreamTabProps) {
  const { locale } = useTranslation();
  const [chatInput, setChatInput] = React.useState('');
  const [showAddPerformerModal, setShowAddPerformerModal] = React.useState(false);
  const [performerName, setPerformerName] = React.useState('');
  const [performerStageName, setPerformerStageName] = React.useState('');
  const [performerDob, setPerformerDob] = React.useState('');

  const handleCreatePerformer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!performerName.trim() || !performerDob.trim()) return;

    onAddCoPerformer({
      legal_name: performerName.trim(),
      stage_name: performerStageName.trim() || undefined,
      dob: performerDob,
      signature_timestamp: new Date().toISOString()
    });

    setPerformerName('');
    setPerformerStageName('');
    setPerformerDob('');
    setShowAddPerformerModal(false);
  };

  return (
    <div className="space-y-8 animate-fade-in text-left">
      {/* ─── Stream Cockpit Card ─────────────────────────────────────────── */}
      <div className="p-6 sm:p-8 rounded-[2.5rem] bg-gradient-to-br from-white/[0.04] via-black/60 to-white/[0.01] border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.6)] backdrop-blur-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                isStreaming ? 'bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse' : 'bg-white/5 text-white/50 border border-white/10'
              }`}>
                <Tv className="w-4 h-4" />
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                {locale === 'es' ? 'Cabina de Transmisión VIP en Vivo' : 'VIP Live Stream Broadcast Cockpit'}
              </h2>
            </div>
            <p className="text-xs text-[#b9cac9] max-w-xl leading-relaxed">
              {locale === 'es'
                ? 'Emite transmisiones interactivas con baja latencia para tus suscriptores VIP y Master. Recibe propinas directas y preguntas destacadas en tiempo real.'
                : 'Broadcast ultra-low latency live streams to your VIP & Master subscribers. Receive instant tips, hearts, and prioritized chat queries.'}
            </p>
          </div>

          {/* Stream CTA */}
          <button
            onClick={onToggleStream}
            className={`px-8 py-4 rounded-2xl font-mono text-xs font-black uppercase tracking-wider transition-all duration-300 shadow-xl cursor-pointer flex items-center gap-2.5 ${
              isStreaming
                ? 'bg-red-500 hover:bg-red-600 text-white shadow-red-500/20 animate-pulse'
                : 'bg-gradient-to-r from-[#00fbfb] to-[#ffabf3] text-black hover:shadow-[0_0_25px_rgba(0,251,251,0.4)]'
            }`}
          >
            <Video className="w-4 h-4" />
            <span>{isStreaming ? (locale === 'es' ? 'FINALIZAR EN VIVO' : 'END BROADCAST') : (locale === 'es' ? 'INICIAR EN VIVO VIP' : 'GO LIVE NOW')}</span>
          </button>
        </div>

        {/* Live Status Bar */}
        {isStreaming && (
          <div className="mt-6 pt-6 border-t border-white/5 flex items-center gap-6 text-xs font-mono font-bold">
            <div className="flex items-center gap-2 text-red-400">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
              <span>LIVE</span>
            </div>
            <div className="flex items-center gap-1.5 text-white/70">
              <Users className="w-4 h-4 text-primary" />
              <span>{viewerCount} {locale === 'es' ? 'espectadores' : 'viewers'}</span>
            </div>
          </div>
        )}
      </div>

      {/* ─── 2257 Co-Performer Compliance Section ────────────────────────── */}
      <div className="p-6 rounded-[2rem] bg-white/[0.02] border border-white/5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-black uppercase tracking-wider text-white">
              {locale === 'es' ? 'Cumplimiento 18 U.S.C. § 2257 (Co-Performers)' : '18 U.S.C. § 2257 Co-Performer Compliance'}
            </h3>
          </div>
          <button
            onClick={() => setShowAddPerformerModal(true)}
            className="px-3 py-1.5 rounded-xl bg-primary/10 hover:bg-primary/20 border border-primary/30 text-primary text-[9px] font-mono font-bold uppercase transition flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3 h-3" />
            <span>{locale === 'es' ? 'Agregar Co-Performer' : 'Add Co-Performer'}</span>
          </button>
        </div>

        <p className="text-[11px] text-[#b9cac9] leading-relaxed">
          {locale === 'es'
            ? 'Todos los participantes que aparezcan en streams o contenido grabado deben registrar su consentimiento legal y verificación de mayoría de edad según la normativa 2257.'
            : 'All individuals appearing in live broadcasts or recorded content must have verified age and signed consent on file in accordance with 18 U.S.C. § 2257.'}
        </p>

        {coPerformers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
            {coPerformers.map((p) => (
              <div key={p.id} className="p-3.5 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold text-white">{p.legal_name}</p>
                  {p.stage_name && <p className="text-[10px] text-white/50">AKA: {p.stage_name}</p>}
                  <p className="text-[9px] text-emerald-400 font-mono flex items-center gap-1 mt-0.5">
                    <ShieldCheck className="w-2.5 h-2.5" /> Verified 2257
                  </p>
                </div>
                <button
                  onClick={() => onRemoveCoPerformer(p.id)}
                  className="text-white/30 hover:text-red-400 transition cursor-pointer p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-black/30 border border-white/5 text-[11px] text-white/40 text-center font-mono">
            {locale === 'es' ? 'No hay co-performers registrados en esta sesión (Transmisión en solitario)' : 'No co-performers registered (Solo Broadcast)'}
          </div>
        )}
      </div>

      {/* ─── Live Chat Feed (When Streaming) ─────────────────────────────── */}
      {isStreaming && (
        <div className="p-6 rounded-[2rem] bg-white/[0.02] border border-white/5 space-y-4">
          <h3 className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-primary" />
            <span>{locale === 'es' ? 'Chat de la Transmisión' : 'Live Stream Chat Room'}</span>
          </h3>

          <div className="h-64 overflow-y-auto space-y-2 p-3 bg-black/50 border border-white/5 rounded-2xl">
            {liveChatMessages.map((msg) => (
              <div key={msg.id} className="text-xs flex items-start gap-2">
                <span className={`font-bold shrink-0 ${msg.isVip ? 'text-amber-400' : 'text-primary'}`}>
                  @{msg.user}:
                </span>
                <span className="text-[#b9cac9]">{msg.text}</span>
                {msg.tipAmount && (
                  <span className="ml-auto px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono text-[9px] font-black shrink-0">
                    +${msg.tipAmount} TIP
                  </span>
                )}
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && chatInput.trim()) {
                  onSendChatMessage(chatInput.trim());
                  setChatInput('');
                }
              }}
              placeholder={locale === 'es' ? 'Escribe un mensaje en vivo...' : 'Send message to stream...'}
              className="flex-1 bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-white/30 focus:border-primary focus:outline-none"
            />
            <button
              onClick={() => {
                if (chatInput.trim()) {
                  onSendChatMessage(chatInput.trim());
                  setChatInput('');
                }
              }}
              className="px-5 py-2.5 bg-primary text-black font-mono text-[10px] font-black uppercase rounded-xl hover:shadow-[0_0_15px_rgba(0,251,251,0.3)] transition"
            >
              {locale === 'es' ? 'Enviar' : 'Send'}
            </button>
          </div>
        </div>
      )}

      {/* ─── Add Co-Performer Modal ─────────────────────────────────────── */}
      {showAddPerformerModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#11111A] border border-white/10 p-6 rounded-3xl max-w-md w-full space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>{locale === 'es' ? 'Registrar Co-Performer (§ 2257)' : 'Register Co-Performer (§ 2257)'}</span>
              </h4>
              <button onClick={() => setShowAddPerformerModal(false)} className="text-white/40 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreatePerformer} className="space-y-3 text-xs">
              <div>
                <label className="block text-[10px] font-mono uppercase text-white/50 mb-1">{locale === 'es' ? 'Nombre Legal Completo' : 'Legal Full Name'}</label>
                <input
                  type="text"
                  required
                  value={performerName}
                  onChange={(e) => setPerformerName(e.target.value)}
                  placeholder="e.g. Sofia Rodriguez Perez"
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-white focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-white/50 mb-1">{locale === 'es' ? 'Nombre Artístico (Opcional)' : 'Stage Name (Optional)'}</label>
                <input
                  type="text"
                  value={performerStageName}
                  onChange={(e) => setPerformerStageName(e.target.value)}
                  placeholder="e.g. Sofia_Art"
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-white focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-white/50 mb-1">{locale === 'es' ? 'Fecha de Nacimiento' : 'Date of Birth (18+)'}</label>
                <input
                  type="date"
                  required
                  value={performerDob}
                  onChange={(e) => setPerformerDob(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-white focus:border-primary focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddPerformerModal(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 text-white/60 font-mono text-[10px] uppercase hover:bg-white/10"
                >
                  {locale === 'es' ? 'Cancelar' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-primary text-black font-mono text-[10px] font-black uppercase hover:shadow-[0_0_15px_rgba(0,251,251,0.3)]"
                >
                  {locale === 'es' ? 'Guardar y Certificar' : 'Save & Certify'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
