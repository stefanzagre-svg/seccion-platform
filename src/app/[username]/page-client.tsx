'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, Sparkles, Lock, Check, Copy, 
  MapPin, Heart, Zap, ArrowRight, X, Loader2, Globe, Info
} from 'lucide-react';
import { useTranslation } from '@/context/LanguageContext';
import { supabase } from '@/lib/supabase';
import { calculateMatch, type UserProfile as UserMatchProfile } from '@/lib/match-engine';
import CountryAgeVerification from '@/components/onboarding/CountryAgeVerification';
import {
  detectUserCountryCode,
  isCountryStrictAgeMandate,
  buildArchetypeSynergyDefaults,
  MEMBER_VIBE_CHIPS,
  MEMBER_VIBE_CHIPS_ES,
} from '@/lib/constants';

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
  archetype?: string | null;
  core_passion?: string | null;
  moods?: string[] | null;
  hobbies?: string[] | null;
  lifestyle_habits?: Record<string, string> | null;
  favorite_languages?: string[] | null;
  relationship_goals?: string[] | null;
  sexual_preference?: string | null;
}

interface ProfileMediaItem {
  id: string;
  media_url: string;
  media_type: string;
  is_hidden?: boolean;
  required_level?: string;
  created_at: string;
}

const MODAL_ARCHETYPES = [
  { id: 'rebel', label: 'The Rebel', labelEs: 'El Rebelde', icon: '🔥' },
  { id: 'visionary', label: 'The Visionary', labelEs: 'El Visionario', icon: '🚀' },
  { id: 'hedonist', label: 'The Hedonist', labelEs: 'El Hedonista', icon: '🥂' },
  { id: 'explorer', label: 'The Explorer', labelEs: 'El Explorador', icon: '🌍' },
  { id: 'dreamer', label: 'The Dreamer', labelEs: 'El Soñador', icon: '✨' },
  { id: 'caregiver', label: 'The Caregiver', labelEs: 'El Cuidador', icon: '💝' },
];

const MODAL_PASSIONS = [
  { id: 'dating', label: 'Romance & Real Connection', labelEs: 'Romance y Conexión Real' },
  { id: 'ai_tech', label: 'AI & Tech Innovation', labelEs: 'IA y Tecnología' },
  { id: 'creative', label: 'Art, Music & Creative Flow', labelEs: 'Arte, Música y Creatividad' },
  { id: 'culinary', label: 'Culinary & Gastronomy', labelEs: 'Gastronomía y Vino' },
  { id: 'fitness', label: 'Fitness & Vitality', labelEs: 'Fitness y Vitalidad' },
  { id: 'adult', label: '18+ Unfiltered & Sensual', labelEs: '18+ Sin Filtros y Sensual' },
];

const QUICK_VIBE_PILLS = [
  'Deep Talk',
  'Late Night Vibes',
  'Spontaneous',
  'Romantic',
  'High Energy',
  'Luxury & Wine',
  'Adventure',
  'Creative Flow',
  'Bold & Unfiltered',
];

const QUICK_HOBBY_PILLS = [
  'Travel',
  'Fine Dining',
  'Live Music',
  'Fitness',
  'AI & Tech',
  'Photography',
  'Cinema',
  'Art Galleries',
  'Nightlife',
];

export default function CreatorPublicProfileClient({
  creator,
  media = [],
}: {
  creator: CreatorProfileData;
  media: ProfileMediaItem[];
}) {
  const { locale } = useTranslation();
  const [activeTab, setActiveTab] = useState<'all' | 'locked' | 'teasers'>('all');
  const [copiedLink, setCopiedLink] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authAction, setAuthAction] = useState<'match' | 'subscribe' | 'tip' | 'message'>('match');
  const [modalStep, setModalStep] = useState<1 | 2>(1);

  // Logged-in user detection
  const [loggedInUserId, setLoggedInUserId] = useState<string | null>(null);
  const [loggedInProfile, setLoggedInProfile] = useState<any | null>(null);

  // Instant Fan Signup State
  const [fanEmail, setFanEmail] = useState('');
  const [fanPassword, setFanPassword] = useState('');
  const [fanUsername, setFanUsername] = useState('');
  const [userCountry, setUserCountry] = useState<string>('ES');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showStrictAgeGate, setShowStrictAgeGate] = useState(false);
  const [ageVerificationData, setAgeVerificationData] = useState<{
    birthDate: string;
    countryCode: string;
    verificationTier: string;
  } | null>(null);

  // Step 2 Smart Synergy State (with inline customization)
  const [selectedArchetype, setSelectedArchetype] = useState<string>('rebel');
  const [selectedPassion, setSelectedPassion] = useState<string>('dating');
  const [displayAge, setDisplayAge] = useState<number>(26);
  const initialDefaults = buildArchetypeSynergyDefaults('rebel', 'dating', locale === 'es' ? 'es' : 'en');
  const [moods, setMoods] = useState<string[]>(initialDefaults.moods);
  const [hobbies, setHobbies] = useState<string[]>(initialDefaults.hobbies);
  const [lifestyleHabits, setLifestyleHabits] = useState<Record<string, string>>(initialDefaults.lifestyle_habits);
  const [bioPromptAnswer, setBioPromptAnswer] = useState<string>(initialDefaults.bio_prompt_answer);

  const [isRegistering, setIsRegistering] = useState(false);
  const [registerError, setRegisterError] = useState('');

  const displayName = creator.display_name || creator.username;
  const vipPrice = creator.base_subscription_price && creator.base_subscription_price > 0 
    ? Number(creator.base_subscription_price).toFixed(2) 
    : '9.99';

  const shareUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/${creator.username}` 
    : `https://seccion.ai/${creator.username}`;

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const detected = detectUserCountryCode();
      setUserCountry(detected);
      if (!isCountryStrictAgeMandate(detected)) {
        setAgeVerificationData({
          birthDate: '',
          countryCode: detected,
          verificationTier: 'declared',
        });
      }
    }

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user?.id) {
        setLoggedInUserId(session.user.id);
        const { data: prof } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .maybeSingle();
        if (prof) setLoggedInProfile(prof);
      }
    });
  }, []);

  const applyCalibration = (archId: string, passionId: string) => {
    const defs = buildArchetypeSynergyDefaults(archId, passionId, locale === 'es' ? 'es' : 'en');
    setMoods(defs.moods);
    setHobbies(defs.hobbies);
    setLifestyleHabits(defs.lifestyle_habits);
    setBioPromptAnswer(defs.bio_prompt_answer);
  };

  // Live Synergy % preview with @creator
  const liveSynergyPercent = useMemo(() => {
    const creatorMatchProfile: UserMatchProfile = {
      id: creator.id,
      name: displayName,
      languages: creator.favorite_languages?.length ? creator.favorite_languages : ['English', 'Spanish'],
      sexualPreferences: ['Everyone'],
      relationshipGoals: creator.relationship_goals?.length ? creator.relationship_goals : ['Casual & Fun'],
      hobbies: creator.hobbies?.length ? creator.hobbies : ['Travel', 'Fine Dining', 'Live Music', 'Photography'],
      lifestyleHabits: creator.lifestyle_habits || {},
      archetype: creator.archetype || 'hedonist',
      moods: creator.moods?.length ? creator.moods : ['Deep Talk', 'Romantic', 'Late Night Vibes'],
      corePassion: creator.core_passion || 'dating',
      memberPurposes: ['creator', 'lifestyle'],
    };

    const visitorProfile: UserMatchProfile = loggedInProfile
      ? {
          id: loggedInProfile.id,
          name: loggedInProfile.display_name || 'You',
          languages: loggedInProfile.favorite_languages?.length ? loggedInProfile.favorite_languages : ['English', 'Spanish'],
          sexualPreferences: ['Everyone'],
          relationshipGoals: ['Casual & Fun'],
          hobbies: loggedInProfile.hobbies?.length ? loggedInProfile.hobbies : hobbies,
          lifestyleHabits: loggedInProfile.lifestyle_habits || lifestyleHabits,
          archetype: loggedInProfile.archetype || selectedArchetype,
          moods: loggedInProfile.moods?.length ? loggedInProfile.moods : moods,
          corePassion: loggedInProfile.core_passion || selectedPassion,
          memberPurposes: ['lifestyle'],
        }
      : {
          id: 'visitor-preview',
          name: fanUsername || 'You',
          languages: ['English', 'Spanish'],
          sexualPreferences: ['Everyone'],
          relationshipGoals: ['Casual & Fun'],
          hobbies,
          lifestyleHabits,
          archetype: selectedArchetype,
          moods,
          corePassion: selectedPassion,
          memberPurposes: ['lifestyle'],
        };

    const res = calculateMatch(visitorProfile, creatorMatchProfile);
    return Math.max(76, res.totalScore || 86);
  }, [creator, displayName, loggedInProfile, selectedArchetype, selectedPassion, moods, hobbies, lifestyleHabits, fanUsername]);

  const handleCopyLink = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleOpenAuth = (action: 'match' | 'subscribe' | 'tip' | 'message') => {
    if (loggedInUserId) {
      if (action === 'subscribe') {
        window.location.href = `/api/billing/checkout?creatorId=${creator.id}&mode=subscription`;
      } else {
        window.location.href = `/profile/${creator.id}?autoMatch=true`;
      }
      return;
    }
    setAuthAction(action);
    setModalStep(1);
    setRegisterError('');
    setIsAuthModalOpen(true);
  };

  const handleStep1Next = (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterError('');
    if (!acceptedTerms) {
      setRegisterError(
        locale === 'es'
          ? 'Debes confirmar que eres mayor de 18 años y aceptar las condiciones.'
          : 'Please confirm you are 18+ and accept the platform conditions.'
      );
      return;
    }
    if (isCountryStrictAgeMandate(userCountry) && !ageVerificationData?.birthDate) {
      setShowStrictAgeGate(true);
      setRegisterError(
        locale === 'es'
          ? `Tu jurisdicción (${userCountry}) requiere verificar tu fecha de nacimiento para continuar.`
          : `Your jurisdiction (${userCountry}) requires date-of-birth age assurance before continuing.`
      );
      return;
    }
    setModalStep(2);
  };

  const handleFanRegister = async () => {
    setIsRegistering(true);
    setRegisterError('');

    try {
      const defaults = buildArchetypeSynergyDefaults(
        selectedArchetype,
        selectedPassion,
        locale === 'es' ? 'es' : 'en'
      );
      const effectiveAge = ageVerificationData || {
        birthDate: '',
        countryCode: userCountry,
        verificationTier: 'declared',
      };

      const res = await fetch('/api/v2/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: fanEmail.toLowerCase().trim(),
          password: fanPassword,
          username: fanUsername.trim() || undefined,
          role: 'member',
          archetype: defaults.archetype,
          corePassion: defaults.core_passion,
          displayAge,
          moods,
          hobbies,
          lifestyleHabits,
          bioPromptCategory: defaults.bio_prompt_category,
          bioPromptQuestion: defaults.bio_prompt_question,
          bioPromptAnswer,
          avatarUrl: defaults.avatar_url,
          memberPurposes: ['lifestyle'],
          ageVerification: effectiveAge,
          locale,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setRegisterError(data.error || 'Registration failed. Please try again.');
        setIsRegistering(false);
        return;
      }

      if (data.session?.access_token && data.session?.refresh_token) {
        await supabase.auth.setSession({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        });
      }

      if (typeof window !== 'undefined') {
        document.cookie = 'sb_ob=1; path=/; max-age=2592000; SameSite=Lax';
      }

      // Route based on intent: Match & Interact -> Interactive Creator Profile with autoMatch=true
      if (authAction === 'subscribe') {
        window.location.href = `/api/billing/checkout?creatorId=${creator.id}&mode=subscription`;
      } else {
        window.location.href = `/profile/${creator.id}?autoMatch=true`;
      }
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
                    <span className="text-[11px] font-mono text-[#ffabf3] bg-[#ffabf3]/10 border border-[#ffabf3]/30 px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      {loggedInUserId
                        ? `${liveSynergyPercent}% ${locale === 'es' ? 'Sinergia' : 'Synergy'}`
                        : locale === 'es'
                        ? 'Motor de Sinergia Activo'
                        : 'Synergy Match Ready'}
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
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 pt-2 sm:pt-0">
                <button
                  onClick={() => handleOpenAuth('match')}
                  className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-gradient-to-r from-[#ff204e] to-[#ffabf3] text-black font-mono font-black text-xs uppercase tracking-wider hover:shadow-[0_0_25px_rgba(255,32,78,0.45)] active:scale-[0.98] transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Heart className="w-4 h-4 fill-black" />
                  <span>
                    {locale === 'es'
                      ? `Hacer Match e Interactuar`
                      : `Match & Interact`}
                  </span>
                </button>
                <button
                  onClick={() => handleOpenAuth('subscribe')}
                  className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-gradient-to-r from-[#00fbfb] to-[#00d2d2] text-black font-mono font-black text-xs uppercase tracking-wider hover:shadow-[0_0_25px_rgba(0,251,251,0.5)] active:scale-[0.98] transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Zap className="w-4 h-4 fill-black" />
                  <span>{locale === 'es' ? `Pase VIP ($${vipPrice}/mes)` : `Join VIP ($${vipPrice}/mo)`}</span>
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
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-black/90 backdrop-blur-xl border-t border-white/10 p-3 px-4 flex items-center justify-between gap-2 shadow-[0_-10px_30px_rgba(0,0,0,0.8)] pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))]">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-9 h-9 rounded-xl overflow-hidden bg-white/10 shrink-0 border border-white/10">
            {creator.avatar_url && (
              <img src={creator.avatar_url} alt={displayName} className="w-full h-full object-cover" />
            )}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-white truncate font-display">{displayName}</p>
            <p className="text-[10px] font-mono text-[#00fbfb] font-bold">${vipPrice} / mo</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => handleOpenAuth('match')}
            className="px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-[#ff204e] to-[#ffabf3] text-black font-mono font-black text-[11px] uppercase tracking-wider cursor-pointer shadow-lg flex items-center gap-1"
          >
            <Heart className="w-3.5 h-3.5 fill-black" />
            <span>{locale === 'es' ? 'MATCH' : 'MATCH'}</span>
          </button>
          <button
            onClick={() => handleOpenAuth('subscribe')}
            className="px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-[#00fbfb] to-[#00d2d2] text-black font-mono font-black text-[11px] uppercase tracking-wider cursor-pointer shadow-lg"
          >
            {locale === 'es' ? 'VIP' : 'VIP'}
          </button>
        </div>
      </div>

      {/* ── 2-Step Country-Adaptive + 60s Smart Synergy Modal ─────────────── */}
      <AnimatePresence>
        {isAuthModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-lg rounded-3xl p-1 bg-gradient-to-tr from-[#00fbfb]/30 via-white/10 to-[#ffabf3]/30 border border-white/20 shadow-2xl overflow-hidden my-4"
            >
              <div className="rounded-[calc(1.5rem-2px)] bg-[#0A0A14] p-5 sm:p-7 relative text-left space-y-4 max-h-[90vh] overflow-y-auto custom-scrollbar">
                
                <button
                  onClick={() => setIsAuthModalOpen(false)}
                  className="absolute top-4 right-4 p-2 rounded-full bg-white/5 border border-white/10 text-white/60 hover:text-white transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="space-y-1 pr-8">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#00fbfb]/10 border border-[#00fbfb]/30 text-[10px] font-mono text-[#00fbfb] font-bold uppercase">
                    <Sparkles className="w-3 h-3" />
                    <span>
                      {modalStep === 1
                        ? locale === 'es'
                          ? 'Paso 1 de 2 · Registro Rápido por País'
                          : 'Step 1 of 2 · Country-Adaptive Fast Entry'
                        : locale === 'es'
                        ? `Paso 2 de 2 · ${liveSynergyPercent}% Sinergia con @${creator.username}`
                        : `Step 2 of 2 · ${liveSynergyPercent}% Synergy with @${creator.username}`}
                    </span>
                  </div>
                  <h3 className="text-xl font-black text-white font-display">
                    {authAction === 'match'
                      ? locale === 'es'
                        ? `Hacer Match e Interactuar con ${displayName}`
                        : `Match & Interact with ${displayName}`
                      : locale === 'es'
                      ? `Suscribirme a ${displayName}`
                      : `Subscribe to ${displayName}`}
                  </h3>
                  <p className="text-xs text-white/60 font-sans">
                    {modalStep === 1
                      ? locale === 'es'
                        ? 'Crea tu cuenta según la normativa de tu país para hacer Match con ella y empezar a interactuar.'
                        : 'Create your member account under your country regulation to match and start interacting.'
                      : locale === 'es'
                      ? 'Elige tu Arquetipo para calcular tu Sinergia con ella y enviarle tu Match.'
                      : 'Pick your Archetype to calibrate your Synergy and send your Match spark.'}
                  </p>
                </div>

                {registerError && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-mono">
                    ⚠️ {registerError}
                  </div>
                )}

                {modalStep === 1 ? (
                  <form onSubmit={handleStep1Next} className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono uppercase tracking-wider text-white/60 font-bold">
                          {locale === 'es' ? 'Usuario / Handle' : 'Username'}
                        </label>
                        <input
                          type="text"
                          value={fanUsername}
                          onChange={(e) => setFanUsername(e.target.value)}
                          placeholder="alex_vibe"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/15 focus:border-[#00fbfb] text-white text-xs placeholder-white/20 focus:outline-none transition font-sans"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-mono uppercase tracking-wider text-white/60 font-bold">
                          {locale === 'es' ? 'País de Residencia' : 'Residence Country'}
                        </label>
                        <select
                          value={userCountry}
                          onChange={(e) => {
                            const c = e.target.value;
                            setUserCountry(c);
                            if (isCountryStrictAgeMandate(c)) {
                              setShowStrictAgeGate(true);
                            } else {
                              setShowStrictAgeGate(false);
                              setAgeVerificationData({
                                birthDate: '',
                                countryCode: c,
                                verificationTier: 'declared',
                              });
                            }
                          }}
                          aria-label="Select Country"
                          className="w-full px-3 py-2.5 rounded-xl bg-black/60 border border-white/15 focus:border-[#00fbfb] text-white text-xs focus:outline-none"
                        >
                          <option value="ES">🇪🇸 Spain (ES)</option>
                          <option value="FR">🇫🇷 France (FR)</option>
                          <option value="DE">🇩🇪 Germany (DE)</option>
                          <option value="IT">🇮🇹 Italy (IT)</option>
                          <option value="PL">🇵🇱 Poland (PL)</option>
                          <option value="RO">🇷🇴 Romania (RO)</option>
                          <option value="BG">🇧🇬 Bulgaria (BG)</option>
                          <option value="CO">🇨🇴 Colombia (CO)</option>
                          <option value="MX">🇲🇽 Mexico (MX)</option>
                          <option value="AR">🇦🇷 Argentina (AR)</option>
                          <option value="BR">🇧🇷 Brazil (BR)</option>
                          <option value="GB">🇬🇧 UK (Strict ZKP)</option>
                          <option value="US">🇺🇸 USA (Strict Age)</option>
                          <option value="GLOBAL">🌍 Worldwide</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-mono uppercase tracking-wider text-white/60 font-bold">
                        {locale === 'es' ? 'Correo Electrónico' : 'Email Address'}
                      </label>
                      <input
                        type="email"
                        required
                        value={fanEmail}
                        onChange={(e) => {
                          const v = e.target.value;
                          setFanEmail(v);
                          if (!fanUsername && v.includes('@')) {
                            setFanUsername(v.split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, ''));
                          }
                        }}
                        placeholder="fan@example.com"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/15 focus:border-[#00fbfb] text-white text-xs placeholder-white/20 focus:outline-none transition font-sans"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-mono uppercase tracking-wider text-white/60 font-bold">
                        {locale === 'es' ? 'Contraseña (mín. 6 caracteres)' : 'Password (min. 6 chars)'}
                      </label>
                      <input
                        type="password"
                        required
                        minLength={6}
                        value={fanPassword}
                        onChange={(e) => setFanPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/15 focus:border-[#00fbfb] text-white text-xs placeholder-white/20 focus:outline-none transition font-sans"
                      />
                    </div>

                    {/* Country-Adaptive Legal Entry Notice */}
                    {showStrictAgeGate ? (
                      <div className="p-3 rounded-2xl bg-black/50 border border-white/10">
                        <CountryAgeVerification
                          onVerified={(data) => {
                            setAgeVerificationData(data);
                            setUserCountry(data.countryCode);
                            setShowStrictAgeGate(false);
                            setRegisterError('');
                          }}
                        />
                      </div>
                    ) : (
                      <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 space-y-2">
                        <div className="flex items-center justify-between text-[10px] font-mono text-[#00fbfb]">
                          <span className="flex items-center gap-1.5 font-bold">
                            <Globe className="w-3.5 h-3.5" />
                            {isCountryStrictAgeMandate(userCountry)
                              ? locale === 'es'
                                ? `Verificación ZKP obligatoria (${userCountry})`
                                : `Strict Age Assurance Required (${userCountry})`
                              : locale === 'es'
                              ? `Acceso Rápido (${userCountry}) · Sin Biometría/DNI en el registro`
                              : `Fast Entry (${userCountry}) · No Biometric/ID scan required at signup`}
                          </span>
                        </div>
                        <p className="text-[10px] text-white/50 leading-relaxed">
                          {locale === 'es'
                            ? 'La verificación biométrica o ZKP solo se solicita más adelante si reservas una Cita Real en persona o desbloqueas contenido +18.'
                            : 'Biometric or ZKP verification is only proposed/enforced later for Real-Life Date Plans or +18 Explicit unlocks.'}
                        </p>
                        <label className="flex items-start gap-2.5 pt-1 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={acceptedTerms}
                            onChange={(e) => setAcceptedTerms(e.target.checked)}
                            className="mt-0.5 accent-[#00fbfb]"
                          />
                          <span className="text-[10px] text-white/80 leading-snug">
                            {locale === 'es'
                              ? 'Confirmo que soy mayor de 18 años y acepto las Condiciones Generales y la Política de Privacidad.'
                              : 'I confirm I am 18+ and accept the General Conditions and Privacy Policy.'}
                          </span>
                        </label>
                      </div>
                    )}

                    <button
                      type="submit"
                      className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-[#00fbfb] to-[#00d2d2] text-black font-mono font-black text-xs uppercase tracking-wider hover:opacity-90 transition flex items-center justify-center gap-2 cursor-pointer shadow-lg"
                    >
                      <span>
                        {locale === 'es'
                          ? `CALIBRAR SINERGIA CON @${creator.username.toUpperCase()} →`
                          : `CALIBRATE SYNERGY WITH @${creator.username.toUpperCase()} →`}
                      </span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </form>
                ) : (
                  <div className="space-y-3.5">
                    {/* Live Synergy Preview Pill */}
                    <div className="p-3 rounded-2xl bg-gradient-to-r from-[#00fbfb]/15 via-black/40 to-[#ffabf3]/15 border border-[#00fbfb]/40 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl overflow-hidden border border-[#00fbfb]/50 shrink-0">
                          {creator.avatar_url && (
                            <img src={creator.avatar_url} alt={displayName} className="w-full h-full object-cover" />
                          )}
                        </div>
                        <div>
                          <div className="text-xs font-black text-white">
                            {locale === 'es' ? `Tu Sinergia con ${displayName}` : `Your Synergy with ${displayName}`}
                          </div>
                          <div className="text-[10px] text-white/60">
                            {locale === 'es' ? 'Basado en tu Arquetipo y Vibras' : 'Calibrated from your Archetype & Vibes'}
                          </div>
                        </div>
                      </div>
                      <span className="text-lg font-mono font-black text-[#00fbfb]">{liveSynergyPercent}%</span>
                    </div>

                    {/* Reassurance Note */}
                    <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-start gap-2">
                      <Info className="w-3.5 h-3.5 text-[#00fbfb] shrink-0 mt-0.5" />
                      <p className="text-[10px] text-white/80 leading-relaxed">
                        {locale === 'es'
                          ? '✨ Auto-calibrado: puedes personalizar tus vibras, hobbies o frase aquí mismo, o cambiarlos cuando quieras desde tu Panel de Perfil de Miembro.'
                          : '✨ Smart-calibrated: customize your vibes, hobbies, or prompt below—or change them anytime from your Member Profile Panel.'}
                      </p>
                    </div>

                    {/* 1. Archetype Picker */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono uppercase tracking-wider text-[#00fbfb] font-bold">
                        {locale === 'es' ? '1. Tu Arquetipo' : '1. Your Archetype'}
                      </label>
                      <div className="grid grid-cols-3 gap-1.5">
                        {MODAL_ARCHETYPES.map((arch) => {
                          const active = selectedArchetype === arch.id;
                          return (
                            <button
                              key={arch.id}
                              type="button"
                              onClick={() => {
                                setSelectedArchetype(arch.id);
                                applyCalibration(arch.id, selectedPassion);
                              }}
                              className={`p-2 rounded-xl border text-left transition cursor-pointer ${
                                active
                                  ? 'bg-[#00fbfb]/20 border-[#00fbfb] text-white'
                                  : 'bg-white/5 border-white/10 text-white/60 hover:text-white'
                              }`}
                            >
                              <div className="text-sm">{arch.icon}</div>
                              <div className="text-[10px] font-bold truncate">
                                {locale === 'es' ? arch.labelEs : arch.label}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* 2. Core Passion Picker */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono uppercase tracking-wider text-[#00fbfb] font-bold">
                        {locale === 'es' ? '2. Tu Pasión Principal' : '2. Your Core Passion'}
                      </label>
                      <div className="grid grid-cols-2 gap-1.5">
                        {MODAL_PASSIONS.map((p) => {
                          const active = selectedPassion === p.id;
                          return (
                            <button
                              key={p.id}
                              type="button"
                              onClick={() => {
                                setSelectedPassion(p.id);
                                applyCalibration(selectedArchetype, p.id);
                              }}
                              className={`px-2.5 py-1.5 rounded-xl border text-left text-[10px] font-bold transition cursor-pointer truncate ${
                                active
                                  ? 'bg-[#ffabf3]/20 border-[#ffabf3] text-white'
                                  : 'bg-white/5 border-white/10 text-white/60 hover:text-white'
                              }`}
                            >
                              {locale === 'es' ? p.labelEs : p.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* 3. Inline Editable Vibe Pills & Hobbies */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono uppercase tracking-wider text-white/60 font-bold">
                        {locale === 'es' ? '3. Tus Vibras y Hobbies (Clic para ajustar)' : '3. Your Vibes & Hobbies (Tap to customize)'}
                      </label>
                      <div className="flex flex-wrap gap-1">
                        {QUICK_VIBE_PILLS.map((vibe) => {
                          const active = moods.includes(vibe);
                          return (
                            <button
                              key={vibe}
                              type="button"
                              onClick={() =>
                                setMoods((prev) =>
                                  prev.includes(vibe) ? prev.filter((x) => x !== vibe) : [...prev, vibe]
                                )
                              }
                              className={`px-2 py-0.5 rounded-full text-[9px] font-bold border transition cursor-pointer ${
                                active
                                  ? 'bg-[#00fbfb] text-black border-[#00fbfb]'
                                  : 'bg-white/5 text-white/50 border-white/10'
                              }`}
                            >
                              {vibe}
                            </button>
                          );
                        })}
                        {QUICK_HOBBY_PILLS.map((hobby) => {
                          const active = hobbies.includes(hobby);
                          return (
                            <button
                              key={hobby}
                              type="button"
                              onClick={() =>
                                setHobbies((prev) =>
                                  prev.includes(hobby) ? prev.filter((x) => x !== hobby) : [...prev, hobby]
                                )
                              }
                              className={`px-2 py-0.5 rounded-full text-[9px] font-bold border transition cursor-pointer ${
                                active
                                  ? 'bg-[#ffabf3] text-black border-[#ffabf3]'
                                  : 'bg-white/5 text-white/50 border-white/10'
                              }`}
                            >
                              {hobby}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* 4. Inline Editable Prompt */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono uppercase tracking-wider text-white/60 font-bold">
                        {locale === 'es' ? '4. Tu Frase de Presentación (Editable)' : '4. Your Intro Vibe (Editable)'}
                      </label>
                      <input
                        type="text"
                        value={bioPromptAnswer}
                        onChange={(e) => setBioPromptAnswer(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/15 text-white text-xs focus:border-[#00fbfb] focus:outline-none"
                      />
                    </div>

                    <div className="flex gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setModalStep(1)}
                        className="px-3.5 py-3 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-white/70 cursor-pointer"
                      >
                        ←
                      </button>
                      <button
                        type="button"
                        onClick={handleFanRegister}
                        disabled={isRegistering}
                        className="flex-1 py-3.5 px-5 rounded-xl bg-gradient-to-r from-[#ff204e] via-[#ffabf3] to-[#00fbfb] text-black font-mono font-black text-xs uppercase tracking-wider hover:opacity-95 transition flex items-center justify-center gap-2 cursor-pointer shadow-lg disabled:opacity-50"
                      >
                        {isRegistering ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin text-black" />
                            <span>{locale === 'es' ? 'CONECTANDO...' : 'CONNECTING...'}</span>
                          </>
                        ) : authAction === 'subscribe' ? (
                          <>
                            <span>{locale === 'es' ? `CONTINUAR AL PASE VIP ($${vipPrice})` : `CONTINUE TO VIP ($${vipPrice})`}</span>
                            <ArrowRight className="w-4 h-4" />
                          </>
                        ) : (
                          <>
                            <Heart className="w-4 h-4 fill-black" />
                            <span>
                              {locale === 'es'
                                ? `VER PERFIL DE @${creator.username.toUpperCase()} Y HACER MATCH`
                                : `ENTER @${creator.username.toUpperCase()}'S PROFILE & MATCH`}
                            </span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                <div className="pt-2 border-t border-white/10 text-center">
                  <span className="text-xs text-white/50 font-sans">
                    {locale === 'es' ? '¿Ya tienes cuenta?' : 'Already have an account?'}{' '}
                    <Link
                      href={`/login?redirect=/profile/${creator.id}?autoMatch=true`}
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
