'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, Sparkles, Lock, Unlock, Share2, Check, Copy, 
  MapPin, Heart, MessageCircle, Star, Eye, Zap, Flame, ExternalLink,
  ArrowRight, X, Loader2
} from 'lucide-react';
import { useTranslation } from '@/context/LanguageContext';

interface CreatorProfileData {
  id: string;
  username: string;
  display_name?: string | null;
  avatar_url?: string | null;
  cover_url?: string | null;
  bio?: string | null;
  base_subscription_price?: number | null;
  is_kyc_verified?: boolean | null;
  specialization?: string | null;
  origins?: string | null;
  is_adult_content?: boolean | null;
}

interface ProfileMediaItem {
  id: string;
  media_url: string;
  media_type: string;
  is_hidden?: boolean;
  required_level?: string;
  created_at: string;
}

export default function CreatorPublicProfileClient({
  creator,
  media = [],
}: {
  creator: CreatorProfileData;
  media: ProfileMediaItem[];
}) {
  const { t, locale } = useTranslation();
  const [activeTab, setActiveTab] = useState<'all' | 'locked' | 'teasers'>('all');
  const [copiedLink, setCopiedLink] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authAction, setAuthAction] = useState<'subscribe' | 'tip' | 'message'>('subscribe');
  
  // Instant Fan Signup State
  const [fanEmail, setFanEmail] = useState('');
  const [fanPassword, setFanPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [registerError, setRegisterError] = useState('');

  const displayName = creator.display_name || creator.username;
  const vipPrice = creator.base_subscription_price && creator.base_subscription_price > 0 
    ? Number(creator.base_subscription_price).toFixed(2) 
    : '9.99';

  const shareUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/${creator.username}` 
    : `https://seccion.ai/${creator.username}`;

  const handleCopyLink = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleOpenAuth = (action: 'subscribe' | 'tip' | 'message') => {
    setAuthAction(action);
    setIsAuthModalOpen(true);
  };

  const handleFanRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsRegistering(true);
    setRegisterError('');

    try {
      const res = await fetch('/api/v2/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: fanEmail.toLowerCase().trim(),
          password: fanPassword,
          role: 'member',
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setRegisterError(data.error || 'Registration failed. Please try again.');
        setIsRegistering(false);
        return;
      }

      // Signed in successfully -> redirect to subscribe checkout
      window.location.href = `/api/billing/checkout?creatorId=${creator.id}&mode=subscription`;
    } catch (err: any) {
      setRegisterError(err.message || 'Network error. Please try again.');
      setIsRegistering(false);
    }
  };

  const filteredMedia = media.filter((item) => {
    if (activeTab === 'locked') return item.is_hidden || (item.required_level && item.required_level !== 'public');
    if (activeTab === 'teasers') return !item.is_hidden && (!item.required_level || item.required_level === 'public');
    return true;
  });

  return (
    <div className="min-h-screen bg-[#0B0C10] text-[#FFFFFF] font-sans relative selection:bg-[#00fbfb] selection:text-black pb-28 sm:pb-16">
      
      {/* ── Top Floating Navigation Bar ──────────────────────────── */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-black/60 border-b border-white/10 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#00fbfb] to-[#ffabf3] p-[1px] shadow-[0_0_15px_rgba(0,251,251,0.4)]">
            <div className="w-full h-full bg-[#0B0C10] rounded-[11px] flex items-center justify-center">
              <span className="font-mono font-black text-xs text-white tracking-tighter">SC</span>
            </div>
          </div>
          <span className="font-mono font-black text-sm tracking-wider text-white group-hover:text-[#00fbfb] transition">
            SECCION
          </span>
        </Link>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleCopyLink}
            className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 hover:text-white font-mono text-xs flex items-center gap-1.5 transition cursor-pointer"
            title="Copy share link"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{copiedLink ? 'Copied!' : 'Share'}</span>
          </button>

          <Link
            href={`/login?redirect=/${creator.username}`}
            className="px-4 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-mono text-xs font-bold transition"
          >
            {locale === 'es' ? 'Iniciar Sesión' : 'Login'}
          </Link>
          
          <Link
            href="/become-creator"
            className="hidden md:inline-flex px-3.5 py-1.5 rounded-xl bg-[#00fbfb]/10 border border-[#00fbfb]/30 text-[#00fbfb] hover:bg-[#00fbfb]/20 font-mono text-xs font-bold transition"
          >
            {locale === 'es' ? 'Soy Creador' : 'For Creators'}
          </Link>
        </div>
      </header>

      {/* ── Main Container ────────────────────────────────────────── */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-4 sm:pt-6">
        
        {/* Profile Card Container */}
        <div className="rounded-3xl bg-gradient-to-b from-white/[0.06] to-white/[0.02] border border-white/10 overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.8)] backdrop-blur-2xl relative">
          
          {/* Header Banner */}
          <div className="h-44 sm:h-56 w-full relative bg-gradient-to-r from-[#1F2833] via-[#0B0C10] to-[#1F2833] overflow-hidden">
            {creator.cover_url ? (
              <img
                src={creator.cover_url}
                alt={`${displayName} Cover`}
                className="w-full h-full object-cover opacity-80"
              />
            ) : (
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#00fbfb_1px,transparent_1px)] [background-size:16px_16px]" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B0C10] via-transparent to-black/30" />
          </div>

          {/* Profile Header Details */}
          <div className="px-5 sm:px-8 pb-6 sm:pb-8 relative -mt-16 sm:-mt-20">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              
              {/* Avatar + Badges */}
              <div className="flex items-end gap-4">
                <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-3xl p-1 bg-gradient-to-tr from-[#00fbfb] via-white/20 to-[#ffabf3] shadow-[0_10px_30px_rgba(0,0,0,0.6)] shrink-0">
                  <div className="w-full h-full rounded-[22px] overflow-hidden bg-[#1F2833] relative">
                    {creator.avatar_url ? (
                      <img
                        src={creator.avatar_url}
                        alt={displayName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-mono font-black text-3xl text-white/40">
                        {displayName.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  {creator.is_kyc_verified && (
                    <div 
                      className="absolute -bottom-1 -right-1 p-1.5 rounded-xl bg-black border border-[#39FF14]/50 shadow-[0_0_10px_rgba(57,255,20,0.4)]"
                      title="18+ Identity Verified"
                    >
                      <ShieldCheck className="w-4 h-4 text-[#39FF14]" />
                    </div>
                  )}
                </div>

                <div className="space-y-1 pb-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-xl sm:text-2xl font-black text-white font-display">
                      {displayName}
                    </h1>
                    <span className="text-xs font-mono text-[#00fbfb] bg-[#00fbfb]/10 border border-[#00fbfb]/30 px-2 py-0.5 rounded-full">
                      @{creator.username}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-white/60 font-mono">
                    {creator.specialization && (
                      <span className="capitalize">{creator.specialization}</span>
                    )}
                    {creator.specialization && creator.origins && <span>•</span>}
                    {creator.origins && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-[#ffabf3]" />
                        {creator.origins}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons (Desktop) */}
              <div className="flex items-center gap-2 pt-2 sm:pt-0">
                <button
                  onClick={() => handleOpenAuth('subscribe')}
                  className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-[#00fbfb] to-[#00d2d2] text-black font-mono font-black text-xs uppercase tracking-wider hover:shadow-[0_0_25px_rgba(0,251,251,0.5)] active:scale-[0.98] transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Zap className="w-4 h-4 fill-black" />
                  <span>{locale === 'es' ? `Suscribirme ($${vipPrice}/mes)` : `Join VIP ($${vipPrice}/mo)`}</span>
                </button>
              </div>
            </div>

            {/* Creator Bio */}
            {creator.bio && (
              <div className="mt-5 p-4 rounded-2xl bg-black/40 border border-white/5 text-sm text-white/80 leading-relaxed font-sans">
                {creator.bio}
              </div>
            )}
          </div>
        </div>

        {/* ── VIP Pass Monetization Bento Card ────────────────────────── */}
        <section className="mt-6 rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-[#00fbfb]/10 via-[#0B0C10] to-[#ffabf3]/10 border border-white/10 shadow-[0_15px_40px_rgba(0,0,0,0.5)] text-left relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#00fbfb]/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00fbfb]/15 border border-[#00fbfb]/40">
                <Sparkles className="w-3.5 h-3.5 text-[#00fbfb]" />
                <span className="text-[10px] font-mono font-bold text-[#00fbfb] uppercase tracking-wider">
                  {locale === 'es' ? 'Pase VIP Oficial' : 'Official VIP Membership'}
                </span>
              </div>

              <div>
                <h2 className="text-2xl font-black text-white font-display">
                  {locale === 'es' ? `Acceso Exclusivo a ${displayName}` : `Unlock Full Access to ${displayName}`}
                </h2>
                <p className="text-xs text-white/60 font-sans mt-1">
                  {locale === 'es' 
                    ? 'El 90% de tu suscripción va directo al creador. Sin intermediarios ni agencias.' 
                    : '90% of your pass goes directly to the creator. No middlemen.'}
                </p>
              </div>

              {/* VIP Perks */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 text-xs text-white/80 font-sans">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-[#00fbfb]/20 flex items-center justify-center text-[#00fbfb] shrink-0">
                    <Check className="w-2.5 h-2.5" />
                  </div>
                  <span>{locale === 'es' ? 'Acceso al Vault Completo DRM' : 'Unrestricted DRM Content Vault'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-[#00fbfb]/20 flex items-center justify-center text-[#00fbfb] shrink-0">
                    <Check className="w-2.5 h-2.5" />
                  </div>
                  <span>{locale === 'es' ? 'Mensajería Directa 1 a 1' : 'Direct 1-on-1 Encrypted DMs'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-[#00fbfb]/20 flex items-center justify-center text-[#00fbfb] shrink-0">
                    <Check className="w-2.5 h-2.5" />
                  </div>
                  <span>{locale === 'es' ? 'Transmisiones en Vivo VIP' : 'Exclusive VIP Live Broadcasts'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-[#00fbfb]/20 flex items-center justify-center text-[#00fbfb] shrink-0">
                    <Check className="w-2.5 h-2.5" />
                  </div>
                  <span>{locale === 'es' ? 'Cero Spam • Cifrado Seguro' : 'Discreet & Anti-Piracy Watermarking'}</span>
                </div>
              </div>
            </div>

            {/* Price & Action */}
            <div className="p-5 rounded-2xl bg-black/60 border border-white/10 flex flex-col items-center justify-center gap-3 shrink-0 md:min-w-[240px]">
              <div className="text-center">
                <span className="text-3xl font-black text-white font-mono tracking-tight">${vipPrice}</span>
                <span className="text-xs text-white/50 font-mono"> / {locale === 'es' ? 'mes' : 'month'}</span>
              </div>

              <button
                onClick={() => handleOpenAuth('subscribe')}
                className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-[#00fbfb] to-[#00d2d2] text-black font-mono font-black text-xs uppercase tracking-wider hover:opacity-95 transition shadow-lg flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{locale === 'es' ? 'ACTIVAR PASE VIP' : 'UNLOCK VIP PASS'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <span className="text-[10px] font-mono text-white/40">
                {locale === 'es' ? 'Cancela en cualquier momento' : 'Cancel anytime with 1 click'}
              </span>
            </div>
          </div>
        </section>

        {/* ── Content Vault Section ───────────────────────────────────── */}
        <section className="mt-8 space-y-4">
          <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-black uppercase tracking-wider font-mono text-white">
                {locale === 'es' ? 'Bóveda de Contenido' : 'Content Vault'}
              </h3>
              <span className="text-xs font-mono text-white/40 bg-white/5 px-2 py-0.5 rounded-full">
                {media.length} {locale === 'es' ? 'posts' : 'items'}
              </span>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/5 text-xs font-mono">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-3 py-1 rounded-lg transition ${activeTab === 'all' ? 'bg-[#00fbfb] text-black font-bold' : 'text-white/60 hover:text-white'}`}
              >
                {locale === 'es' ? 'Todos' : 'All'}
              </button>
              <button
                onClick={() => setActiveTab('locked')}
                className={`px-3 py-1 rounded-lg transition ${activeTab === 'locked' ? 'bg-[#00fbfb] text-black font-bold' : 'text-white/60 hover:text-white'}`}
              >
                {locale === 'es' ? 'VIP Lock' : 'Locked'}
              </button>
              <button
                onClick={() => setActiveTab('teasers')}
                className={`px-3 py-1 rounded-lg transition ${activeTab === 'teasers' ? 'bg-[#00fbfb] text-black font-bold' : 'text-white/60 hover:text-white'}`}
              >
                {locale === 'es' ? 'Público' : 'Public'}
              </button>
            </div>
          </div>

          {/* Grid */}
          {filteredMedia.length === 0 ? (
            <div className="py-12 px-4 rounded-3xl bg-white/[0.02] border border-white/5 text-center space-y-2">
              <Lock className="w-8 h-8 text-white/20 mx-auto" />
              <p className="text-sm font-mono text-white/60">
                {locale === 'es' ? 'No hay publicaciones en esta categoría.' : 'No media items currently in this section.'}
              </p>
              <p className="text-xs text-white/40 font-mono">
                {locale === 'es' ? 'Suscríbete al pase VIP para desbloquear nuevos drops.' : 'Subscribe to VIP to unlock upcoming drops.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
              {filteredMedia.map((item, idx) => {
                const isLocked = item.is_hidden || (item.required_level && item.required_level !== 'public');
                return (
                  <div
                    key={item.id || idx}
                    className="group relative aspect-[3/4] rounded-2xl overflow-hidden bg-black/60 border border-white/10 shadow-md"
                  >
                    <img
                      src={item.media_url}
                      alt={`Post ${idx + 1}`}
                      className={`w-full h-full object-cover transition duration-300 ${isLocked ? 'blur-xl scale-105 opacity-60' : 'group-hover:scale-105'}`}
                    />

                    {/* Warm Paywall Blur Overlay */}
                    {isLocked && (
                      <div className="absolute inset-0 bg-black/40 backdrop-blur-md flex flex-col items-center justify-center p-3 text-center gap-2">
                        <div className="w-9 h-9 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-[#ffabf3] shadow-lg">
                          <Lock className="w-4 h-4" />
                        </div>
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-white">
                          {locale === 'es' ? 'Contenido VIP' : 'VIP Locked'}
                        </span>
                        <button
                          onClick={() => handleOpenAuth('subscribe')}
                          className="px-2.5 py-1 rounded-lg bg-[#00fbfb] text-black text-[10px] font-mono font-black uppercase hover:opacity-90 transition cursor-pointer"
                        >
                          {locale === 'es' ? 'Desbloquear' : 'Unlock'}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>

      </main>

      {/* ── Sticky Mobile Bottom Action Bar ─────────────────────────── */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-black/90 backdrop-blur-xl border-t border-white/10 p-3 px-4 flex items-center justify-between gap-3 shadow-[0_-10px_30px_rgba(0,0,0,0.8)] pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))]">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-10 h-10 rounded-xl overflow-hidden bg-white/10 shrink-0 border border-white/10">
            {creator.avatar_url && (
              <img src={creator.avatar_url} alt={displayName} className="w-full h-full object-cover" />
            )}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-white truncate font-display">{displayName}</p>
            <p className="text-[11px] font-mono text-[#00fbfb] font-bold">${vipPrice} / mo</p>
          </div>
        </div>

        <button
          onClick={() => handleOpenAuth('subscribe')}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#00fbfb] to-[#00d2d2] text-black font-mono font-black text-xs uppercase tracking-wider shrink-0 cursor-pointer shadow-lg"
        >
          {locale === 'es' ? 'UNIRME VIP' : 'UNLOCK VIP'}
        </button>
      </div>

      {/* ── 60-Second Frictionless Fan Signup Modal ───────────────────── */}
      <AnimatePresence>
        {isAuthModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md rounded-3xl p-1 bg-gradient-to-tr from-[#00fbfb]/30 via-white/10 to-[#ffabf3]/30 border border-white/20 shadow-2xl overflow-hidden my-4"
            >
              <div className="rounded-[calc(1.5rem-2px)] bg-[#0A0A14] p-6 sm:p-7 relative text-left space-y-4">
                
                <button
                  onClick={() => setIsAuthModalOpen(false)}
                  className="absolute top-4 right-4 p-2 rounded-full bg-white/5 border border-white/10 text-white/60 hover:text-white transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#00fbfb]/10 border border-[#00fbfb]/30 text-[10px] font-mono text-[#00fbfb] font-bold uppercase">
                    <Sparkles className="w-3 h-3" />
                    <span>{locale === 'es' ? 'Acceso Rápido en 30s' : 'Instant Fan Access (30s)'}</span>
                  </div>
                  <h3 className="text-xl font-black text-white font-display">
                    {locale === 'es' ? `Suscribirme a ${displayName}` : `Subscribe to ${displayName}`}
                  </h3>
                  <p className="text-xs text-white/60 font-sans">
                    {locale === 'es' 
                      ? 'Crea tu cuenta de miembro sin cuestionarios para desbloquear el contenido inmediatamente.' 
                      : 'Create your member account in one step with zero questionnaires to unlock content.'}
                  </p>
                </div>

                {registerError && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-mono">
                    ⚠️ {registerError}
                  </div>
                )}

                <form onSubmit={handleFanRegister} className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-white/60 font-bold">
                      {locale === 'es' ? 'Correo Electrónico' : 'Email Address'}
                    </label>
                    <input
                      type="email"
                      required
                      value={fanEmail}
                      onChange={(e) => setFanEmail(e.target.value)}
                      placeholder="fan@example.com"
                      className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/15 focus:border-[#00fbfb] text-white text-sm placeholder-white/20 focus:outline-none transition font-sans"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-white/60 font-bold">
                      {locale === 'es' ? 'Contraseña' : 'Password'}
                    </label>
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={fanPassword}
                      onChange={(e) => setFanPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/15 focus:border-[#00fbfb] text-white text-sm placeholder-white/20 focus:outline-none transition font-sans"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isRegistering}
                    className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-[#00fbfb] to-[#00d2d2] text-black font-mono font-black text-xs uppercase tracking-wider hover:opacity-90 active:scale-[0.98] transition flex items-center justify-center gap-2 cursor-pointer shadow-lg disabled:opacity-50"
                  >
                    {isRegistering ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-black" />
                        <span>{locale === 'es' ? 'ACTIVANDO CUENTA...' : 'ACTIVATING ACCOUNT...'}</span>
                      </>
                    ) : (
                      <>
                        <span>{locale === 'es' ? `CONTINUAR AL PAGO ($${vipPrice})` : `CONTINUE TO CHECKOUT ($${vipPrice})`}</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>

                <div className="pt-2 border-t border-white/10 text-center">
                  <span className="text-xs text-white/50 font-sans">
                    {locale === 'es' ? '¿Ya tienes cuenta?' : 'Already have an account?'}{' '}
                    <Link
                      href={`/login?redirect=/${creator.username}`}
                      className="text-[#00fbfb] hover:underline font-bold"
                    >
                      {locale === 'es' ? 'Iniciar Sesión' : 'Login'}
                    </Link>
                  </span>
                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
