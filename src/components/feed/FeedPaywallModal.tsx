'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Sparkles, Zap, Shield, Crown, X } from 'lucide-react';
import { useTranslation } from '@/context/LanguageContext';

interface FeedPaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: {
    id: string;
    type: string;
    creator: string;
    avatar_url?: string;
    price?: number;
  } | null;
  onUnlockPpv: (postId: string) => Promise<void>;
  onUpgradeTier?: () => void;
}

export default function FeedPaywallModal({
  isOpen,
  onClose,
  post,
  onUnlockPpv,
  onUpgradeTier
}: FeedPaywallModalProps) {
  const { locale } = useTranslation();

  if (!isOpen || !post) return null;

  const isPpv = post.type === 'ppv';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xl p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', stiffness: 350, damping: 25 }}
          className="max-w-md w-full p-6 sm:p-8 rounded-[2.5rem] border border-[#00fbfb]/30 bg-[#0F0F1A]/95 shadow-[0_30px_70px_rgba(0,0,0,0.8)] text-center relative overflow-hidden"
        >
          {/* Top glow */}
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-48 h-48 bg-[#00fbfb]/15 blur-[60px] rounded-full pointer-events-none" />
          
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/5 border border-white/10 text-white/50 hover:text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Icon Header */}
          <div className="w-14 h-14 rounded-2xl bg-[#00fbfb]/10 border border-[#00fbfb]/30 flex items-center justify-center mx-auto mb-4 text-[#00fbfb] shadow-[0_0_20px_rgba(0,251,251,0.25)]">
            {isPpv ? (
              <Zap className="w-7 h-7 animate-pulse fill-[#00fbfb]" />
            ) : (
              <Crown className="w-7 h-7 text-[#00fbfb]" />
            )}
          </div>

          {/* Title & Creator */}
          <h3 className="font-display text-xl sm:text-2xl font-black text-white tracking-tight">
            {isPpv 
              ? (locale === 'es' ? 'Desbloquear Contenido PPV' : 'Unlock PPV Content') 
              : (locale === 'es' ? 'Contenido Exclusivo por Nivel' : 'Tier Restricted Content')}
          </h3>

          <p className="text-xs text-[#00fbfb] font-mono font-bold mt-1">
            @{post.creator}
          </p>

          <p className="text-xs text-[#b9cac9] max-w-sm mx-auto leading-relaxed mt-3">
            {isPpv
              ? (locale === 'es' 
                  ? 'Este post incluye video/álbum en alta resolución cifrado con ZKP. Desbloquéalo al instante para descifrarlo en tu feed y ganar +250 XP.' 
                  : 'This post includes high-resolution ZKP encrypted media. Unlock now to decrypt in-place on your feed and earn +250 XP.')
              : (locale === 'es'
                  ? `Este contenido está reservado para suscriptores de nivel ${post.type.toUpperCase()}. Actualiza tu suscripción para ver todas las publicaciones privadas.`
                  : `This content is reserved for ${post.type.toUpperCase()} tier subscribers. Upgrade your subscription to view all private posts.`)}
          </p>

          {/* Benefits Box */}
          <div className="my-5 p-4 rounded-2xl bg-white/[0.02] border border-white/5 text-left text-xs space-y-2 text-[#b9cac9]">
            <div className="flex items-center gap-2">
              <Shield className="w-3.5 h-3.5 text-[#39FF14] shrink-0" />
              <span>{locale === 'es' ? 'Cifrado DRM de extremo a extremo' : 'End-to-end DRM encrypted media'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-[#00fbfb] shrink-0" />
              <span>{locale === 'es' ? '+250 XP de afinidad con el creador' : '+250 XP creator affinity bonus'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Lock className="w-3.5 h-3.5 text-[#ffabf3] shrink-0" />
              <span>{locale === 'es' ? 'Acceso permanente desde tu cuenta' : 'Permanent access tied to your account'}</span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="space-y-2.5 pt-1">
            {isPpv ? (
              <button
                onClick={async () => {
                  await onUnlockPpv(post.id);
                  onClose();
                }}
                className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-[#00fbfb] to-[#00d2d2] text-black font-mono text-xs font-black uppercase tracking-wider hover:shadow-[0_0_25px_rgba(0,251,251,0.5)] transition duration-300 active:scale-95 cursor-pointer flex items-center justify-center gap-2"
              >
                <span>{locale === 'es' ? `Desbloquear ($${post.price || 4.99})` : `Unlock Post ($${post.price || 4.99})`}</span>
                <Zap className="w-4 h-4 fill-black" />
              </button>
            ) : (
              <button
                onClick={() => {
                  if (onUpgradeTier) onUpgradeTier();
                  onClose();
                }}
                className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-[#00fbfb] to-[#ffabf3] text-black font-mono text-xs font-black uppercase tracking-wider hover:shadow-[0_0_25px_rgba(0,251,251,0.5)] transition duration-300 active:scale-95 cursor-pointer flex items-center justify-center gap-2"
              >
                <span>{locale === 'es' ? 'Mejorar a VIP / Master' : 'Upgrade to VIP / Master'}</span>
                <Crown className="w-4 h-4 fill-black" />
              </button>
            )}

            <button
              onClick={onClose}
              className="w-full py-2.5 text-xs text-white/50 hover:text-white font-mono transition cursor-pointer"
            >
              {locale === 'es' ? 'Quizás más tarde' : 'Maybe later'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
