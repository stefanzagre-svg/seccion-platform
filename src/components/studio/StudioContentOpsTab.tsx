'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Upload, Image as ImageIcon, Video, Sparkles, 
  ShieldCheck, Lock, Trash2, Eye, EyeOff, Plus, 
  DollarSign, Check, Loader2 
} from 'lucide-react';
import BlurredFaceImage from '@/components/BlurredFaceImage';
import ProvenanceSelector from '@/components/ProvenanceSelector';
import { type ProvenanceLevel } from '@/lib/content-provenance';
import { useTranslation } from '@/context/LanguageContext';

export interface StudioMediaItem {
  id: string;
  url: string;
  type: 'image' | 'video';
  title?: string;
  description?: string;
  price?: number;
  is_locked?: boolean;
  provenance?: ProvenanceLevel;
  face_blur_active?: boolean;
  content_rating?: 'SFW' | 'NSFW_18';
  required_ledger?: 'sfw_credits' | 'sovereign_red_pills';
  created_at?: string;
}

interface StudioContentOpsTabProps {
  mediaList: StudioMediaItem[];
  isUploading: boolean;
  onUploadContent: (data: {
    url: string;
    type: 'image' | 'video';
    description: string;
    price: number;
    isLocked: boolean;
    provenance: ProvenanceLevel;
    faceBlurActive: boolean;
    teaserType: 'none' | 'video_clip' | 'main_photo' | 'custom';
  }) => Promise<void>;
  onDeleteMedia: (id: string) => Promise<void>;
}

export default function StudioContentOpsTab({
  mediaList,
  isUploading,
  onUploadContent,
  onDeleteMedia
}: StudioContentOpsTabProps) {
  const { locale } = useTranslation();

  const [contentUrl, setContentUrl] = React.useState('');
  const [contentType, setContentType] = React.useState<'image' | 'video'>('image');
  const [description, setDescription] = React.useState('');
  const [price, setPrice] = React.useState<number>(0);
  const [isLocked, setIsLocked] = React.useState(true);
  const [faceBlurActive, setFaceBlurActive] = React.useState(false);
  const [provenance, setProvenance] = React.useState<ProvenanceLevel>('genuine');
  const [teaserType, setTeaserType] = React.useState<'none' | 'video_clip' | 'main_photo' | 'custom'>('main_photo');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contentUrl.trim()) return;

    await onUploadContent({
      url: contentUrl.trim(),
      type: contentType,
      description: description.trim(),
      price: isLocked ? price : 0,
      isLocked,
      provenance,
      faceBlurActive,
      teaserType
    });

    setContentUrl('');
    setDescription('');
    setPrice(0);
  };

  return (
    <div className="space-y-8 animate-fade-in text-left">
      {/* ─── Upload Content Card ─────────────────────────────────────────── */}
      <div className="p-6 sm:p-8 rounded-[2.5rem] bg-gradient-to-br from-white/[0.04] via-black/60 to-white/[0.01] border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.6)] backdrop-blur-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center gap-2.5 mb-2 relative z-10">
          <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
            <Upload className="w-4 h-4" />
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            {locale === 'es' ? 'Gestor de Contenido & Operaciones DRM' : 'Content Studio & DRM Operations'}
          </h2>
        </div>
        <p className="text-xs text-[#b9cac9] max-w-xl leading-relaxed relative z-10 mb-6">
          {locale === 'es'
            ? 'Sube fotos y videos a tu bóveda protegida. Configura paywalls dinámicos, difuminado facial Zero-Knowledge y certificación de procedencia de contenido.'
            : 'Publish media into your secured vault. Configure PPV unlocking tiers, Zero-Knowledge face blur, and provenance authenticity tagging.'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* URL Input */}
            <div>
              <label className="block text-[10px] font-mono uppercase text-white/50 mb-1">
                {locale === 'es' ? 'URL del Recurso Multimedia' : 'Media Direct URL'}
              </label>
              <input
                type="url"
                required
                value={contentUrl}
                onChange={(e) => setContentUrl(e.target.value)}
                placeholder="https://..."
                className="w-full bg-black/50 border border-white/10 rounded-2xl px-4 py-3 text-xs text-white focus:border-primary focus:outline-none"
              />
            </div>

            {/* Type selector */}
            <div>
              <label className="block text-[10px] font-mono uppercase text-white/50 mb-1">
                {locale === 'es' ? 'Tipo de Contenido' : 'Content Media Type'}
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setContentType('image')}
                  className={`py-2.5 px-4 rounded-xl border text-xs font-mono font-bold flex items-center justify-center gap-2 cursor-pointer transition ${
                    contentType === 'image' ? 'bg-primary/20 border-primary text-primary' : 'bg-black/40 border-white/10 text-white/50'
                  }`}
                >
                  <ImageIcon className="w-4 h-4" />
                  <span>{locale === 'es' ? 'Foto' : 'Photo'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setContentType('video')}
                  className={`py-2.5 px-4 rounded-xl border text-xs font-mono font-bold flex items-center justify-center gap-2 cursor-pointer transition ${
                    contentType === 'video' ? 'bg-primary/20 border-primary text-primary' : 'bg-black/40 border-white/10 text-white/50'
                  }`}
                >
                  <Video className="w-4 h-4" />
                  <span>{locale === 'es' ? 'Video' : 'Video'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-[10px] font-mono uppercase text-white/50 mb-1">
              {locale === 'es' ? 'Descripción / Mensaje para Fans' : 'Caption / Description'}
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={locale === 'es' ? 'Escribe una leyenda para este contenido...' : 'Write an engaging caption...'}
              className="w-full bg-black/50 border border-white/10 rounded-2xl px-4 py-3 text-xs text-white focus:border-primary focus:outline-none resize-none"
            />
          </div>

          {/* Options Row (Paywall + Face Blur + Provenance) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-white/5">
            {/* Paywall toggle */}
            <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold uppercase text-white/70">
                  {locale === 'es' ? 'Bóveda Paywall (PPV)' : 'PPV Lock Gating'}
                </span>
                <input
                  type="checkbox"
                  checked={isLocked}
                  onChange={(e) => setIsLocked(e.target.checked)}
                  className="rounded accent-primary w-4 h-4 cursor-pointer"
                />
              </div>
              {isLocked && (
                <div className="flex items-center gap-1 mt-1">
                  <span className="text-xs text-white/40 font-mono">$</span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-xs text-white font-mono"
                    placeholder="10"
                  />
                </div>
              )}
            </div>

            {/* Face Blur Toggle */}
            <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold uppercase text-white/70">
                  {locale === 'es' ? 'Difuminado Facial ZKP' : 'ZKP Face Blur'}
                </span>
                <input
                  type="checkbox"
                  checked={faceBlurActive}
                  onChange={(e) => setFaceBlurActive(e.target.checked)}
                  className="rounded accent-primary w-4 h-4 cursor-pointer"
                />
              </div>
              <p className="text-[9px] text-[#b9cac9]">
                {faceBlurActive ? (locale === 'es' ? 'Rostro protegido' : 'Face anonymized') : (locale === 'es' ? 'Rostro visible' : 'Public face')}
              </p>
            </div>

            {/* Provenance Selector */}
            <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-2">
              <span className="text-[10px] font-mono font-bold uppercase text-white/70 block mb-1">
                {locale === 'es' ? 'Autenticidad' : 'Provenance'}
              </span>
              <select
                value={provenance}
                onChange={(e) => setProvenance(e.target.value as ProvenanceLevel)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-2 py-1.5 text-xs text-white font-mono focus:outline-none"
              >
                <option value="genuine" className="bg-[#111]">{locale === 'es' ? '📸 Contenido Genuino' : '📸 Genuine Photo/Video'}</option>
                <option value="ai_enhanced" className="bg-[#111]">{locale === 'es' ? '✨ Mejorado con IA' : '✨ AI Enhanced'}</option>
                <option value="ai_generated" className="bg-[#111]">{locale === 'es' ? '🤖 Generado con IA' : '🤖 AI Generated'}</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isUploading || !contentUrl.trim()}
              className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-[#00fbfb] to-[#ffabf3] text-black font-mono text-xs font-black uppercase tracking-wider hover:shadow-[0_0_20px_rgba(0,251,251,0.4)] transition disabled:opacity-50 flex items-center gap-2 cursor-pointer"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{locale === 'es' ? 'Publicando...' : 'Publishing...'}</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span>{locale === 'es' ? 'Publicar a la Bóveda' : 'Publish to Vault'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* ─── Media Vault List ────────────────────────────────────────────── */}
      <div className="space-y-4">
        <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
          <span>
            {locale === 'es'
              ? 'Contenido Publicado en tu Bóveda'
              : locale === 'fr'
                ? 'Médias publiés dans votre coffre'
                : 'Published Media in Vault'}
          </span>
          <span className="text-xs text-white/40 font-mono">({mediaList.length})</span>
        </h3>

        {mediaList.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {mediaList.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-3xl bg-white/[0.02] border border-white/5 hover:border-white/15 transition flex flex-col justify-between space-y-3"
              >
                <div className="h-44 rounded-2xl overflow-hidden bg-black/50 border border-white/10 relative">
                  {item.type === 'video' ? (
                    <video src={item.url} className="w-full h-full object-cover" />
                  ) : (
                    <BlurredFaceImage
                      src={item.url}
                      alt={item.title || 'Studio media'}
                      sharedScore={item.is_locked ? 50 : 100}
                      isEnabledByOwner={item.face_blur_active}
                      className="w-full h-full object-cover"
                    />
                  )}

                  {item.content_rating && (
                    <span
                      className={`absolute top-2.5 left-2.5 px-2 py-0.5 rounded-lg border font-mono text-[9px] font-black ${
                        item.content_rating === 'NSFW_18'
                          ? 'bg-red-500/20 border-red-400/40 text-red-200'
                          : 'bg-emerald-500/20 border-emerald-400/40 text-emerald-200'
                      }`}
                    >
                      {item.content_rating === 'NSFW_18' ? '💊 NSFW 18+' : '✨ SFW'}
                    </span>
                  )}

                  {item.is_locked && (
                    <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-lg bg-black/70 border border-white/20 text-primary font-mono text-[9px] font-black flex items-center gap-1">
                      <Lock className="w-2.5 h-2.5" />
                      {item.price ? `€${item.price}` : 'PPV'}
                    </span>
                  )}
                </div>

                <div>
                  <p className="text-xs font-bold text-white truncate">{item.description || 'Exclusive post'}</p>
                  <div className="flex items-center justify-between text-[9px] text-white/40 font-mono mt-1">
                    <span>{item.type.toUpperCase()}</span>
                    <span>
                      {item.required_ledger === 'sovereign_red_pills'
                        ? 'Red Pills Ledger'
                        : item.required_ledger === 'sfw_credits'
                          ? 'SFW Credits Ledger'
                          : item.provenance}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-end pt-2 border-t border-white/5">
                  <button
                    onClick={() => onDeleteMedia(item.id)}
                    className="text-red-400 hover:text-red-300 transition text-[10px] font-mono font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>{locale === 'es' ? 'Eliminar' : locale === 'fr' ? 'Supprimer' : 'Delete'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 rounded-3xl bg-white/[0.01] border border-white/5 text-center text-[#b9cac9] text-xs space-y-2">
            <p>
              {locale === 'es'
                ? 'Aún no has publicado fotos o videos en tu bóveda.'
                : locale === 'fr'
                  ? 'Aucun média publié dans votre coffre pour le moment.'
                  : 'No media published in your vault yet.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
