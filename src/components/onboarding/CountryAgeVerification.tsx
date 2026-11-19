'use client';

import React, { useState, useEffect } from 'react';
import Script from 'next/script';
import { 
  ShieldCheck, 
  Globe, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  Lock, 
  Shield, 
  QrCode, 
  Cpu, 
  ExternalLink, 
  Loader2,
  Wallet,
  Check,
  Info,
  BadgeCheck
} from 'lucide-react';
import { useTranslation } from '@/context/LanguageContext';
import ZkpWalletGuideModal from '@/components/onboarding/ZkpWalletGuideModal';

interface AgeCheckerWidget {
  open: (options: {
    key: string;
    onSuccess: (response: { uuid?: string; dob?: string; country?: string }) => void | Promise<void>;
    onCancel: () => void;
    onError: (err: unknown) => void;
  }) => void;
}

declare global {
  interface Window {
    AgeChecker?: AgeCheckerWidget;
    AgeCheckerAPI?: Record<string, unknown>;
  }
}

function detectInitialTimezoneCountry(): string {
  if (typeof window === 'undefined') return 'ES';
  try {
    const userTz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    if (userTz.includes('Madrid') || userTz.includes('Canary')) return 'ES';
    if (userTz.includes('Paris')) return 'FR';
    if (userTz.includes('Berlin')) return 'DE';
    if (userTz.includes('London')) return 'GB';
    if (userTz.includes('New_York') || userTz.includes('Los_Angeles') || userTz.includes('Chicago')) return 'US';
    if (userTz.includes('Mexico')) return 'MX';
    if (userTz.includes('Sao_Paulo')) return 'BR';
    if (userTz.includes('Casablanca')) return 'MA';
    return 'ES';
  } catch {
    return 'ES';
  }
}

interface CountryAgeVerificationProps {
  onVerified: (data: { birthDate: string; countryCode: string; verificationTier: 'declared' | 'micro' | 'kyc' | 'zkp' | 'agechecker' }) => void;
  isCreatorMode?: boolean;
}

interface CountryRegulation {
  code: string;
  name: string;
  nameEs: string;
  nameFr: string;
  flag: string;
  minAge: number;
  lawName: string;
  description: string;
  descriptionEs: string;
  descriptionFr: string;
  requiresStrictProof: boolean;
}

const REGULATORY_RULES: Record<string, CountryRegulation> = {
  ES: {
    code: 'ES',
    name: 'Spain / European Union',
    nameEs: 'España / Unión Europea',
    nameFr: 'Espagne / Union Européenne',
    flag: '🇪🇸',
    minAge: 18,
    lawName: 'EU DSA Art. 28 & Ley Orgánica 3/2018',
    description: '1-Tap DOB self-declaration for general platform access. ZKP or certified KYC for explicit 18+ content.',
    descriptionEs: 'Auto-declaración de fecha de nacimiento en 1 toque. ZKP o KYC certificado para contenido explícito 18+.',
    descriptionFr: 'Déclaration de date de naissance en 1 touche pour l\'accès général. ZKP ou KYC certifié pour le contenu explicite 18+.',
    requiresStrictProof: false,
  },
  FR: {
    code: 'FR',
    name: 'France / European Union',
    nameEs: 'Francia / Unión Europea',
    nameFr: 'France / Union Européenne',
    flag: '🇫🇷',
    minAge: 18,
    lawName: 'EU DSA Art. 28 & ARCOM Framework',
    description: 'Fast 1-Tap birth year declaration. Zero friction for general member onboarding.',
    descriptionEs: 'Declaración rápida en 1 toque. Cero fricción para registro general de miembros.',
    descriptionFr: 'Déclaration rapide de l\'année de naissance en 1 touche. Zéro friction pour l\'inscription des membres.',
    requiresStrictProof: false,
  },
  DE: {
    code: 'DE',
    name: 'Germany / European Union',
    nameEs: 'Alemania / Unión Europea',
    nameFr: 'Allemagne / Union Européenne',
    flag: '🇩🇪',
    minAge: 18,
    lawName: 'Jugendschutzgesetz (JuSchG) & DSA',
    description: 'Instant birthdate entry or ZKP proof for age-restricted content compliance.',
    descriptionEs: 'Entrada instantánea de fecha o prueba ZKP para cumplimiento de contenido restringido.',
    descriptionFr: 'Saisie instantanée de la date de naissance ou preuve ZKP pour la conformité aux contenus restreints.',
    requiresStrictProof: false,
  },
  GB: {
    code: 'GB',
    name: 'United Kingdom',
    nameEs: 'Reino Unido',
    nameFr: 'Royaume-Uni',
    flag: '🇬🇧',
    minAge: 18,
    lawName: 'Online Safety Act 2023 (Ofcom HEAA)',
    description: '1-Tap DOB covers SFW account setup only. Unlocking 18+ content or dating requires ephemeral DIDIT facial age assurance (Ofcom HEAA).',
    descriptionEs: 'El registro 1-Toque cubre solo acceso SFW. Desbloquear contenido +18 o citas requiere verificación facial efímera DIDIT (Ofcom HEAA).',
    descriptionFr: 'La déclaration 1-Touche couvre uniquement l’accès SFW. Le contenu 18+ ou les rencontres exigent une estimation faciale éphémère DIDIT (Ofcom HEAA).',
    requiresStrictProof: true,
  },
  US: {
    code: 'US',
    name: 'United States',
    nameEs: 'Estados Unidos',
    nameFr: 'États-Unis',
    flag: '🇺🇸',
    minAge: 18,
    lawName: 'US State Age Mandates (TX HB 1181, FL, VA, UT…)',
    description: '1-Tap DOB covers SFW signup only. Regulated US states use instant US public-record verification (AgeChecker) or DIDIT 18+ verification before 18+ access.',
    descriptionEs: 'El registro 1-Toque cubre solo acceso SFW. Los estados regulados de EE. UU. usan registro público instantáneo (AgeChecker) o verificación DIDIT antes de acceder a +18.',
    descriptionFr: 'La déclaration 1-Touche couvre uniquement l’accès SFW. Les États américains réglementés utilisent une vérification par registre public (AgeChecker) ou DIDIT avant tout accès 18+.',
    requiresStrictProof: true,
  },
  MX: {
    code: 'MX',
    name: 'Mexico / Latin America',
    nameEs: 'México / América Latina',
    nameFr: 'Mexique / Amérique Latine',
    flag: '🇲🇽',
    minAge: 18,
    lawName: 'Ley de Protección de Datos (LFPDPPP)',
    description: 'Fast 1-Click age verification.',
    descriptionEs: 'Verificación de edad rápida en 1 clic.',
    descriptionFr: 'Vérification de l\'âge rapide en 1 clic.',
    requiresStrictProof: false,
  },
  BR: {
    code: 'BR',
    name: 'Brazil',
    nameEs: 'Brasil',
    nameFr: 'Brésil',
    flag: '🇧🇷',
    minAge: 18,
    lawName: 'LGPD & Marco Civil da Internet',
    description: 'Instant 1-Tap birthdate confirmation.',
    descriptionEs: 'Confirmación instantánea de fecha en 1 toque.',
    descriptionFr: 'Confirmation instantanée de la date de naissance en 1 touche.',
    requiresStrictProof: false,
  },
  MA: {
    code: 'MA',
    name: 'Morocco / Royaume du Maroc',
    nameEs: 'Marruecos / Reino de Marruecos',
    nameFr: 'Maroc / Royaume du Maroc',
    flag: '🇲🇦',
    minAge: 18,
    lawName: 'Loi 09-08 (CNDP) & Code Pénal Art. 483',
    description: '1-Tap declaration. Built-in Domestic Privacy Shield to protect creators from local discovery.',
    descriptionEs: 'Declaración en 1 toque. Escudo de Privacidad Doméstica integrado para proteger a los creadores de visibilidad local.',
    descriptionFr: 'Déclaration en 1 geste. Bouclier de Confidentialité Domestique intégré pour protéger les créateurs de toute visibilité locale.',
    requiresStrictProof: false,
  },
  GLOBAL: {
    code: 'GLOBAL',
    name: 'International Standard',
    nameEs: 'Estándar Internacional',
    nameFr: 'Standard International',
    flag: '🌐',
    minAge: 18,
    lawName: 'Global Age Compliance Directives',
    description: 'Instant 1-Tap birthdate confirmation for general platform access.',
    descriptionEs: 'Confirmación instantánea de fecha para acceso general.',
    descriptionFr: 'Confirmation instantanée de la date de naissance pour l\'accès général.',
    requiresStrictProof: false,
  },
};

export default function CountryAgeVerification({ onVerified, isCreatorMode = false }: CountryAgeVerificationProps) {
  const { t, locale } = useTranslation();
  const [countryCode, setCountryCode] = useState<string>(detectInitialTimezoneCountry);
  const [method, setMethod] = useState<'standard' | 'agechecker' | 'zkp'>('standard');
  const [isZkpGuideOpen, setIsZkpGuideOpen] = useState(false);
  const [ageCheckerLoaded, setAgeCheckerLoaded] = useState(() =>
    typeof window !== 'undefined' ? Boolean(window.AgeChecker) : false
  );
  const [isAgeCheckerLoading, setIsAgeCheckerLoading] = useState(false);

  // Standard DOB states
  const [birthYear, setBirthYear] = useState<string>('2000');
  const [birthMonth, setBirthMonth] = useState<string>('01');
  const [birthDay, setBirthDay] = useState<string>('01');
  const [isChecked, setIsChecked] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // ZKP interactive states
  const [zkpStep, setZkpStep] = useState<'idle' | 'scanning' | 'generating' | 'verified'>('idle');
  const [zkpProofHash, setZkpProofHash] = useState<string>('');

  // Refine country & US state with Cloudflare edge headers (cf-ipcountry + cf-region-code)
  const [isStrictUsState, setIsStrictUsState] = useState<boolean>(true);
  const [detectedRegion, setDetectedRegion] = useState<string | null>(null);
  const ageCheckerPublicKey = process.env.NEXT_PUBLIC_AGECHECKER_KEY || '';
  const showUsAgeCheckerTab = countryCode === 'US' && isStrictUsState && Boolean(ageCheckerPublicKey);
  const activeMethod = method === 'agechecker' && !showUsAgeCheckerTab ? 'standard' : method;

  useEffect(() => {
    fetch('/api/v2/geo')
      .then((r) => (r.ok ? r.json() : null))
      .then((geo: { country?: string; region?: string | null; isStrictUsState?: boolean } | null) => {
        if (!geo) return;
        if (geo.country && geo.country in REGULATORY_RULES) {
          setCountryCode(geo.country);
        }
        if (typeof geo.isStrictUsState === 'boolean') {
          setIsStrictUsState(geo.isStrictUsState);
        }
        if (typeof geo.region === 'string') {
          setDetectedRegion(geo.region);
        }
      })
      .catch(() => {
        // Timezone fallback already active
      });
  }, []);

  const isFr = locale === 'fr';
  const isEs = locale === 'es';
  const reg = REGULATORY_RULES[countryCode] || REGULATORY_RULES.GLOBAL;
  const regName = isFr ? reg.nameFr : isEs ? reg.nameEs : reg.name;
  const currentYear = new Date().getFullYear();
  const calculatedAge = currentYear - parseInt(birthYear, 10);
  const isUnderage = calculatedAge < reg.minAge;

  const handleStandardVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (isUnderage) {
      setErrorMsg(
        isFr
          ? `Vous devez avoir au moins ${reg.minAge} ans pour accéder à SECCION selon ${reg.lawName}.`
          : isEs
          ? `Debes tener al menos ${reg.minAge} años para acceder a SECCION bajo ${reg.lawName}.`
          : `You must be at least ${reg.minAge} years old to access SECCION under ${reg.lawName}.`
      );
      return;
    }
    if (!isChecked) {
      setErrorMsg(
        isFr
          ? 'Veuillez cocher la case de déclaration d’âge pour continuer.'
          : isEs
          ? 'Por favor confirma la casilla de declaración de edad para continuar.'
          : 'Please confirm your age declaration checkbox to continue.'
      );
      return;
    }

    const birthDate = `${birthYear}-${birthMonth.padStart(2, '0')}-${birthDay.padStart(2, '0')}`;

    onVerified({
      birthDate,
      countryCode,
      verificationTier: 'declared',
    });
  };

  const handleTriggerAgeChecker = () => {
    if (!ageCheckerPublicKey) {
      setErrorMsg(
        isFr
          ? 'Le registre public US n’est pas configuré sur cet environnement. Utilisez la vérification 18+ DIDIT.'
          : isEs
          ? 'El registro público de EE. UU. no está configurado en este entorno. Usa la verificación 18+ DIDIT.'
          : 'US public-record verification is not configured in this environment. Please use DIDIT 18+ verification.'
      );
      return;
    }

    if (typeof window === 'undefined' || !window.AgeChecker) {
      setErrorMsg(
        isFr
          ? 'Chargement du module sécurisé AgeChecker.net… Patientez un instant ou utilisez la vérification DIDIT.'
          : isEs
          ? 'Cargando el módulo seguro de AgeChecker.net... Por favor espera un momento o usa verificación DIDIT.'
          : 'Loading secure AgeChecker.net module... Please wait a moment or use DIDIT verification.'
      );
      return;
    }

    setErrorMsg(null);
    setIsAgeCheckerLoading(true);

    window.AgeChecker.open({
      key: ageCheckerPublicKey,
      onSuccess: async function (response: { uuid?: string; dob?: string; country?: string }) {
        const dobString = typeof response?.dob === 'string' ? response.dob : '';
        const detectedCountry = response?.country || countryCode;
        const uuid = typeof response?.uuid === 'string' ? response.uuid.trim() : '';

        let verifiedTier: 'declared' | 'agechecker' = 'declared';
        if (uuid) {
          try {
            const verifyRes = await fetch('/api/kyc/agechecker-verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ uuid }),
            });
            if (verifyRes.ok) {
              verifiedTier = 'agechecker';
            }
          } catch {
            // Unauthenticated pre-signup flow safely stays 'declared' until account exists
          }
        }

        setIsAgeCheckerLoading(false);
        onVerified({
          birthDate: dobString,
          countryCode: detectedCountry,
          verificationTier: verifiedTier,
        });
      },
      onCancel: function () {
        setIsAgeCheckerLoading(false);
      },
      onError: function (err: unknown) {
        setIsAgeCheckerLoading(false);
        console.error('AgeChecker error:', err);
        setErrorMsg(
          isFr
            ? 'La vérification par registre US a été annulée ou a échoué. Vous pouvez utiliser la vérification 18+ DIDIT.'
            : isEs
            ? 'La verificación por registro de EE. UU. fue cancelada o falló. Puedes usar la verificación 18+ DIDIT.'
            : 'US registry verification was cancelled or encountered an issue. You can verify via DIDIT 18+ check.'
        );
      }
    });
  };

  const handleZkpVerify = async () => {
    setErrorMsg(null);
    setZkpStep('scanning');
    try {
      const returnPath = typeof window !== 'undefined' ? window.location.pathname : '/feed';
      const res = await fetch('/api/kyc/didit-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'member_age', returnTo: returnPath }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data?.url && typeof window !== 'undefined') {
        window.open(data.url, '_blank', 'noopener,noreferrer');
        setZkpStep('idle');
        setErrorMsg(
          isFr
            ? 'Portail éphémère DIDIT 18+ ouvert. Une fois terminé, notre webhook sécurisé mettra votre statut à jour automatiquement.'
            : isEs
            ? 'Se abrió el portal efímero DIDIT 18+. Una vez completado, nuestro webhook seguro actualizará tu estado automáticamente.'
            : 'Opened ephemeral DIDIT 18+ age check. Once completed, our signed server webhook updates your verified status automatically.'
        );
        return;
      }

      setZkpStep('idle');
      setErrorMsg(
        data?.error ||
          (isFr
            ? 'Créez d’abord votre compte SFW avec 1-Touche, puis validez votre âge 18+ via DIDIT en 3 secondes.'
            : isEs
            ? 'Crea primero tu cuenta SFW con 1-Toque y luego valida tu edad 18+ con DIDIT en 3 segundos.'
            : 'Complete your fast SFW signup with 1-Tap first, then verify 18+ via DIDIT in 3 seconds.')
      );
    } catch {
      setZkpStep('idle');
      setErrorMsg(
        isFr
          ? 'Erreur réseau lors de la création de votre session DIDIT sécurisée. Veuillez réessayer.'
          : isEs
          ? 'Error de red al iniciar tu sesión segura de DIDIT. Inténtalo de nuevo.'
          : 'Network error starting your authenticated DIDIT session. Please try again.'
      );
    }
  };

  return (
    <>
      {showUsAgeCheckerTab && (
        <Script
          src="https://agechecker.net/api/v1/agechecker.js"
          strategy="lazyOnload"
          onLoad={() => setAgeCheckerLoaded(true)}
        />
      )}

      <div className="w-full bg-[#0c1017] border border-[#00fbfb]/30 rounded-3xl p-5 sm:p-6 shadow-2xl relative overflow-hidden text-white font-sans space-y-5">
        <ZkpWalletGuideModal isOpen={isZkpGuideOpen} onClose={() => setIsZkpGuideOpen(false)} />

        {/* Header Badge */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#00fbfb]/10 border border-[#00fbfb]/30 flex items-center justify-center text-[#00fbfb]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-mono font-bold tracking-wider uppercase text-white flex items-center gap-1.5">
                <span>{reg.flag}</span>
                <span>{regName} {isFr ? 'Vérification d’Âge' : isEs ? 'Verificación de Edad' : 'Age Verification'}</span>
              </h3>
              <p className="text-[10px] text-[#00fbfb] font-mono">{reg.lawName}</p>
            </div>
          </div>

          {/* Country Switcher */}
          <select
            value={countryCode}
            onChange={(e) => setCountryCode(e.target.value)}
            className="bg-black/60 border border-white/20 rounded-xl px-2.5 py-1.5 text-[11px] font-mono text-white outline-none focus:border-[#00fbfb]"
          >
            {Object.values(REGULATORY_RULES).map((c) => (
              <option key={c.code} value={c.code}>
                {c.flag} {c.code}
              </option>
            ))}
          </select>
        </div>

        {/* Method Selector (1-Tap SFW vs US Registry [US strict states only] vs DIDIT 18+ Selfie) */}
        <div
          className={`grid ${showUsAgeCheckerTab ? 'grid-cols-3' : 'grid-cols-2'} bg-black/50 p-1 rounded-2xl border border-white/10 gap-1`}
        >
          <button
            type="button"
            onClick={() => {
              setMethod('standard');
              setErrorMsg(null);
            }}
            className={`py-2 rounded-xl text-[11px] font-mono font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1 ${
              activeMethod === 'standard'
                ? 'bg-[#00fbfb] text-black shadow-[0_0_15px_rgba(0,251,251,0.3)]'
                : 'text-white/60 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isFr ? '1-Touche' : isEs ? '1-Toque' : '1-Tap'}</span>
          </button>

          {showUsAgeCheckerTab && (
            <button
              type="button"
              onClick={() => {
                setMethod('agechecker');
                setErrorMsg(null);
              }}
              className={`py-2 rounded-xl text-[11px] font-mono font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1 ${
                activeMethod === 'agechecker'
                  ? 'bg-gradient-to-r from-[#00fbfb] to-[#22c55e] text-black shadow-[0_0_15px_rgba(34,197,94,0.3)]'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              <BadgeCheck className="w-3.5 h-3.5" />
              <span>{isFr ? 'Registre US' : isEs ? 'Registro US' : 'US Registry'}</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              setMethod('zkp');
              setErrorMsg(null);
            }}
            className={`py-2 rounded-xl text-[11px] font-mono font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1 ${
              activeMethod === 'zkp'
                ? 'bg-gradient-to-r from-[#00fbfb] to-[#ffabf3] text-black shadow-[0_0_20px_rgba(255,171,243,0.4)]'
                : 'text-white/60 hover:text-white'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>{isFr ? 'DIDIT 18+ 🛡️' : isEs ? 'DIDIT 18+ 🛡️' : 'DIDIT 18+ 🛡️'}</span>
          </button>
        </div>

      {activeMethod === 'standard' ? (
        <>
          {/* Regulation Explanation */}
          <div className="p-3 bg-white/[0.02] border-l-2 border-[#00fbfb] rounded-r-xl space-y-1">
            <span className="text-[9px] font-mono text-[#00fbfb] font-bold uppercase tracking-wider block">
              ⚡ {isFr ? "Processus d'Inscription Accéléré" : isEs ? 'Proceso Optimizado de Registro' : 'High-Speed Onboarding Pipeline'}
            </span>
            <p className="text-[11px] text-[#b9cac9] leading-relaxed">
              {isFr
                ? reg.descriptionFr
                : isEs
                ? reg.descriptionEs
                : reg.description}
            </p>
          </div>

          {/* Moroccan Domestic Privacy Shield Banner */}
          {countryCode === 'MA' && isCreatorMode && (
            <div className="p-3 bg-[#00fbfb]/10 border border-[#00fbfb]/40 rounded-xl flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="text-base">🇲🇦</span>
                <span className="font-mono text-[#00fbfb] font-bold text-[11px]">
                  {isFr
                    ? 'Bouclier Maroc Activé (Géoblocage IP National Automatique)'
                    : isEs
                    ? 'Escudo Marruecos Activado (Geobloqueo IP Nacional Automático)'
                    : 'Morocco Domestic Privacy Shield Active (Auto IP Geoblock)'}
                </span>
              </div>
              <span className="px-2 py-0.5 rounded bg-[#00fbfb]/20 text-[#00fbfb] font-mono text-[9px] font-bold border border-[#00fbfb]/30">
                {isFr ? 'ACTIF' : isEs ? 'ACTIVO' : 'LOCKED'}
              </span>
            </div>
          )}

          {/* DOB Form */}
          <form onSubmit={handleStandardVerify} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-mono text-white/60 uppercase tracking-wider block">
                {isFr ? 'Sélectionnez votre Date de Naissance :' : isEs ? 'Selecciona tu Fecha de Nacimiento:' : 'Select Your Date of Birth:'}
              </label>
              <div className="grid grid-cols-3 gap-2">
                
                {/* Day */}
                <select
                  value={birthDay}
                  onChange={(e) => setBirthDay(e.target.value)}
                  className="bg-black/60 border border-white/20 rounded-xl p-2 text-xs font-mono text-white outline-none focus:border-[#00fbfb]"
                >
                  {Array.from({ length: 31 }, (_, i) => (
                    <option key={i + 1} value={String(i + 1).padStart(2, '0')}>
                      {isFr ? `Jour ${i + 1}` : isEs ? `Día ${i + 1}` : `Day ${i + 1}`}
                    </option>
                  ))}
                </select>

                {/* Month */}
                <select
                  value={birthMonth}
                  onChange={(e) => setBirthMonth(e.target.value)}
                  className="bg-black/60 border border-white/20 rounded-xl p-2 text-xs font-mono text-white outline-none focus:border-[#00fbfb]"
                >
                  {(isFr
                    ? ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc']
                    : isEs
                    ? ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
                    : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
                  ).map((m, i) => (
                    <option key={m} value={String(i + 1).padStart(2, '0')}>
                      {m} ({i + 1})
                    </option>
                  ))}
                </select>

                {/* Year */}
                <select
                  value={birthYear}
                  onChange={(e) => setBirthYear(e.target.value)}
                  className="bg-black/60 border border-white/20 rounded-xl p-2 text-xs font-mono text-white outline-none focus:border-[#00fbfb]"
                >
                  {Array.from({ length: 70 }, (_, i) => {
                    const year = currentYear - 18 - i;
                    return (
                      <option key={year} value={String(year)}>
                        {year}
                      </option>
                    );
                  })}
                </select>

              </div>
            </div>

            {/* 1-Tap Checkbox Declaration */}
            <label className="flex items-start gap-3 p-3 bg-black/40 border border-white/10 rounded-xl cursor-pointer hover:border-[#00fbfb]/50 transition">
              <input
                type="checkbox"
                checked={isChecked}
                onChange={(e) => {
                  setIsChecked(e.target.checked);
                  setErrorMsg(null);
                }}
                className="mt-0.5 w-4 h-4 rounded border-white/30 text-[#00fbfb] focus:ring-0 bg-black cursor-pointer"
              />
              <span className="text-[11px] text-[#b9cac9] leading-snug">
                {isFr ? (
                  <>Je déclare légalement sur l’honneur avoir <strong className="text-white font-mono">{calculatedAge} ans</strong> (né(e) en {birthYear}) et respecter l’âge légal requis pour {regName}.</>
                ) : isEs ? (
                  <>Declaro legalmente bajo pena de perjurio que tengo <strong className="text-white font-mono">{calculatedAge} años</strong> (nacido/a en {birthYear}) y cumplo con los requisitos legales de {regName}.</>
                ) : (
                  <>I legally declare under penalty of perjury that I am <strong className="text-white font-mono">{calculatedAge} years old</strong> (born in {birthYear}) and meet the legal age requirements for {regName}.</>
                )}
              </span>
            </label>

            {errorMsg && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-300 flex items-center gap-2 font-mono">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={!isChecked || isUnderage}
              className="w-full py-3 rounded-xl bg-[#00fbfb] hover:bg-[#00fbfb]/90 text-black font-extrabold font-mono text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-[#00fbfb]/20"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isFr ? 'Confirmer et Entrer sur SECCION' : isEs ? 'Confirmar e Ingresar a SECCION' : 'Confirm & Enter SECCION'}</span>
            </button>
          </form>
        </>
      ) : activeMethod === 'agechecker' ? (
        /* AgeChecker.net Certified Verification View */
        <div className="space-y-4 text-left">
          <div className="p-5 bg-gradient-to-br from-emerald-500/10 via-[#00fbfb]/5 to-black border border-emerald-500/30 rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-400">
                <BadgeCheck className="w-5 h-5" />
                <span className="text-xs font-mono font-black uppercase tracking-wider text-white">
                  {isFr ? 'Vérification Officielle AgeChecker.net' : isEs ? 'Verificación Oficial AgeChecker.net' : 'Official AgeChecker.net Verification'}
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[9px] uppercase font-bold border border-emerald-500/40">
                {isFr ? 'Certifié 18+' : isEs ? 'Certificado 18+' : '18+ Certified'}
              </span>
            </div>

            <p className="text-[11px] text-[#b9cac9] leading-relaxed">
              {isFr
                ? 'Validation sécurisée et instantanée de majorité 18+ via registres officiels ou contrôle photo éphémère.'
                : isEs
                ? 'Validación segura instantánea de mayoría de edad por pasaporte, DNI o base de datos de identidad pública.'
                : 'Instant secure 18+ age validation via official identity registries or digital document photo check.'}
            </p>

            {errorMsg && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-300 flex items-center gap-2 font-mono">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <button
              type="button"
              onClick={handleTriggerAgeChecker}
              disabled={isAgeCheckerLoading}
              className="w-full py-3.5 bg-gradient-to-r from-[#00fbfb] to-[#22c55e] hover:brightness-110 text-black font-mono text-xs font-black uppercase tracking-wider rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(34,197,94,0.35)] disabled:opacity-50"
            >
              {isAgeCheckerLoading ? (
                <Loader2 className="w-4 h-4 animate-spin text-black" />
              ) : (
                <>
                  <BadgeCheck className="w-4 h-4" />
                  <span>{isFr ? 'Lancer la Vérification AgeChecker (18+) →' : isEs ? 'Abrir Verificación AgeChecker (18+) →' : 'Launch AgeChecker Verification (18+) →'}</span>
                </>
              )}
            </button>

            <p className="text-[10px] text-white/40 text-center font-mono">
              {isFr
                ? '🔒 Conforme aux réglementations internationales de confidentialité et de protection des mineurs.'
                : isEs
                ? '🔒 Cumple con estándares internacionales de privacidad y leyes de protección al menor.'
                : '🔒 Fully compliant with global online age gating and child safety frameworks.'}
            </p>
          </div>
        </div>
      ) : (
        /* DIDIT Ephemeral 18+ Age Assurance View (Clear Information Card) */
        <div className="space-y-4 text-left">
          <div className="p-4 bg-gradient-to-br from-[#00fbfb]/10 to-[#ffabf3]/10 border border-[#00fbfb]/30 rounded-2xl space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-[#00fbfb]">
                <Cpu className="w-4 h-4" />
                <span className="text-xs font-mono font-black uppercase tracking-wider text-white">
                  {isFr
                    ? 'Vérification Éphémère 18+ (DIDIT)'
                    : isEs
                    ? 'Verificación Efímera 18+ (DIDIT)'
                    : 'Ephemeral 18+ Age Check (DIDIT)'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsZkpGuideOpen(true)}
                className="text-[10px] font-mono text-[#ffabf3] hover:underline flex items-center gap-1 cursor-pointer font-bold"
              >
                <Info className="w-3.5 h-3.5" />
                <span>{isFr ? 'Comment ça marche ?' : isEs ? '¿Cómo funciona?' : 'How it works?'}</span>
              </button>
            </div>

            {/* Clear Information Card */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px] font-mono bg-black/40 border border-white/10 rounded-xl p-3 text-[#b9cac9]">
              <div>
                <span className="text-white/50 block uppercase">
                  {isFr ? 'Temps & Méthode' : isEs ? 'Tiempo y Método' : 'Time & Method'}
                </span>
                <span className="text-white font-bold">
                  {isFr
                    ? '~3 s · Selfie passif (pièce requise uniquement si âge limite)'
                    : isEs
                    ? '~3 s · Selfie pasivo (ID solo si la edad estimada es límite)'
                    : '~3s · Passive selfie (ID fallback only if borderline 18–21)'}
                </span>
              </div>
              <div>
                <span className="text-white/50 block uppercase">
                  {isFr ? 'Ce que SECCION reçoit' : isEs ? 'Qué recibe SECCION' : 'What SECCION Receives'}
                </span>
                <span className="text-emerald-300 font-bold">
                  {isFr
                    ? 'Uniquement « 18+ = Oui » (zéro photo ou document stocké)'
                    : isEs
                    ? 'Solo «18+ = Sí» (cero fotos ni documentos guardados)'
                    : 'Only "18+ = Yes" receipt (zero selfie or ID stored)'}
                </span>
              </div>
            </div>

            {detectedRegion && countryCode === 'US' && (
              <p className="text-[10px] font-mono text-white/50">
                {isFr
                  ? `Région détectée : US-${detectedRegion}`
                  : isEs
                  ? `Región detectada: US-${detectedRegion}`
                  : `Detected region: US-${detectedRegion}`}
              </p>
            )}

            {errorMsg && (
              <div className="p-3 bg-white/5 border border-white/15 rounded-xl text-xs text-[#b9cac9] flex items-center gap-2 font-mono">
                <AlertCircle className="w-4 h-4 text-[#00fbfb] shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {zkpStep === 'idle' && (
              <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
                <button
                  type="button"
                  onClick={handleZkpVerify}
                  className="flex-1 py-3 px-4 bg-gradient-to-r from-[#00fbfb] to-[#00d2d2] hover:brightness-110 text-black font-mono text-xs font-black uppercase tracking-wider rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(0,251,251,0.4)]"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>
                    {isFr
                      ? 'Vérifier 18+ avec DIDIT (~3 s)'
                      : isEs
                      ? 'Verificar 18+ con DIDIT (~3 s)'
                      : 'Verify 18+ with DIDIT (~3s)'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsZkpGuideOpen(true)}
                  className="py-3 px-4 bg-white/5 hover:bg-white/10 text-white font-mono text-xs font-bold uppercase tracking-wider rounded-xl transition border border-white/10 text-center cursor-pointer"
                >
                  <span>
                    {isFr ? 'Guide & EU Wallet' : isEs ? 'Guía & EU Wallet' : 'Privacy & EU Wallet'}
                  </span>
                </button>
              </div>
            )}

            {zkpStep === 'scanning' && (
              <div className="py-6 flex flex-col items-center justify-center gap-3 text-center bg-black/40 rounded-xl border border-white/10">
                <Loader2 className="w-7 h-7 text-[#00fbfb] animate-spin" />
                <span className="font-mono text-xs text-white">
                  {isFr ? 'Connexion au portefeuille d’identité…' : isEs ? 'Conectando con billetera de identidad...' : 'Connecting to Identity Wallet...'}
                </span>
                <span className="text-[10px] text-white/50 font-mono">
                  {isFr ? 'Demande de preuve cryptographique d’âge >= 18' : isEs ? 'Solicitando prueba criptográfica de edad >= 18' : 'Requesting cryptographic age proof >= 18'}
                </span>
              </div>
            )}

            {zkpStep === 'generating' && (
              <div className="py-6 flex flex-col items-center justify-center gap-3 text-center bg-black/40 rounded-xl border border-[#00fbfb]/30">
                <div className="w-7 h-7 rounded-full bg-[#00fbfb]/20 flex items-center justify-center text-[#00fbfb] animate-pulse">
                  <Cpu className="w-4 h-4" />
                </div>
                <span className="font-mono text-xs text-[#00fbfb]">
                  {isFr ? 'Génération et Validation zk-SNARK…' : isEs ? 'Generando y Validando zk-SNARK...' : 'Generating & Validating zk-SNARK...'}
                </span>
                <span className="text-[10px] text-[#b9cac9] font-mono">
                  {isFr ? 'Validation de signature mathématique sans déchiffrer vos données' : isEs ? 'Verificando firma matemática sin desencriptar PII' : 'Validating mathematical signature without decrypting PII'}
                </span>
              </div>
            )}

            {zkpStep === 'verified' && (
              <div className="py-5 flex flex-col items-center justify-center gap-2 text-center bg-emerald-500/10 rounded-xl border border-emerald-500/30">
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Check className="w-5 h-5" />
                </div>
                <h4 className="font-mono text-xs font-bold text-white uppercase">
                  {isFr ? 'Preuve d’Âge ZKP Vérifiée !' : isEs ? '¡Prueba ZKP Verificada Exitosamente!' : 'ZKP Age Proof Verified!'}
                </h4>
                <p className="text-[10px] font-mono text-emerald-300">
                  {zkpProofHash} (Age &gt;= 18: TRUE)
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
    </>
  );
}
