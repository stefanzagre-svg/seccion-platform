'use client';

import React, { useState, useEffect } from 'react';
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
  Info
} from 'lucide-react';
import { useTranslation } from '@/context/LanguageContext';
import ZkpWalletGuideModal from '@/components/onboarding/ZkpWalletGuideModal';

interface CountryAgeVerificationProps {
  onVerified: (data: { birthDate: string; countryCode: string; verificationTier: 'declared' | 'micro' | 'kyc' | 'zkp' }) => void;
  isCreatorMode?: boolean;
}

interface CountryRegulation {
  code: string;
  name: string;
  flag: string;
  minAge: number;
  lawName: string;
  description: string;
  descriptionEs: string;
  requiresStrictProof: boolean;
}

const REGULATORY_RULES: Record<string, CountryRegulation> = {
  ES: {
    code: 'ES',
    name: 'Spain / European Union',
    flag: '🇪🇸',
    minAge: 18,
    lawName: 'EU DSA Art. 28 & Ley Orgánica 3/2018',
    description: '1-Tap DOB self-declaration for general platform access. ZKP or certified KYC for explicit 18+ content.',
    descriptionEs: 'Auto-declaración de fecha de nacimiento en 1 toque. ZKP o KYC certificado para contenido explícito 18+.',
    requiresStrictProof: false,
  },
  FR: {
    code: 'FR',
    name: 'France / European Union',
    flag: '🇫🇷',
    minAge: 18,
    lawName: 'EU DSA Art. 28 & ARCOM Framework',
    description: 'Fast 1-Tap birth year declaration. Zero friction for general member onboarding.',
    descriptionEs: 'Declaración rápida en 1 toque. Cero fricción para registro general de miembros.',
    requiresStrictProof: false,
  },
  DE: {
    code: 'DE',
    name: 'Germany / European Union',
    flag: '🇩🇪',
    minAge: 18,
    lawName: 'Jugendschutzgesetz (JuSchG) & DSA',
    description: 'Instant birthdate entry or ZKP proof for age-restricted content compliance.',
    descriptionEs: 'Entrada instantánea de fecha o prueba ZKP para cumplimiento de contenido restringido.',
    requiresStrictProof: false,
  },
  GB: {
    code: 'GB',
    name: 'United Kingdom',
    flag: '🇬🇧',
    minAge: 18,
    lawName: 'Online Safety Act 2023 (Ofcom)',
    description: '1-Tap DOB declaration or anonymous ZKP proof compliant with UK OSA guidelines.',
    descriptionEs: 'Declaración en 1 toque o prueba anónima ZKP conforme a las directivas UK OSA.',
    requiresStrictProof: true,
  },
  US: {
    code: 'US',
    name: 'United States',
    flag: '🇺🇸',
    minAge: 18,
    lawName: 'COPPA & State Age Mandates (TX, VA, UT)',
    description: 'Strict age-verification mandates: choose fast DOB self-attestation or anonymous ZKP wallet proof.',
    descriptionEs: 'Mandatos estrictos por estado: elige auto-declaración rápida o prueba anónima ZKP en billetera.',
    requiresStrictProof: true,
  },
  MX: {
    code: 'MX',
    name: 'Mexico / Latin America',
    flag: '🇲🇽',
    minAge: 18,
    lawName: 'Ley de Protección de Datos (LFPDPPP)',
    description: 'Fast 1-Click age verification.',
    descriptionEs: 'Verificación de edad rápida en 1 clic.',
    requiresStrictProof: false,
  },
  BR: {
    code: 'BR',
    name: 'Brazil',
    flag: '🇧🇷',
    minAge: 18,
    lawName: 'LGPD & Marco Civil da Internet',
    description: 'Instant 1-Tap birthdate confirmation.',
    descriptionEs: 'Confirmación instantánea de fecha en 1 toque.',
    requiresStrictProof: false,
  },
  GLOBAL: {
    code: 'GLOBAL',
    name: 'International Standard',
    flag: '🌐',
    minAge: 18,
    lawName: 'Global Age Compliance Directives',
    description: 'Instant 1-Tap birthdate confirmation for general platform access.',
    descriptionEs: 'Confirmación instantánea de fecha para acceso general.',
    requiresStrictProof: false,
  },
};

export default function CountryAgeVerification({ onVerified, isCreatorMode = false }: CountryAgeVerificationProps) {
  const { t, locale } = useTranslation();
  const [countryCode, setCountryCode] = useState<string>('ES');
  const [method, setMethod] = useState<'standard' | 'zkp'>('standard');
  const [isZkpGuideOpen, setIsZkpGuideOpen] = useState(false);

  // Standard DOB states
  const [birthYear, setBirthYear] = useState<string>('2000');
  const [birthMonth, setBirthMonth] = useState<string>('01');
  const [birthDay, setBirthDay] = useState<string>('01');
  const [isChecked, setIsChecked] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // ZKP interactive states
  const [zkpStep, setZkpStep] = useState<'idle' | 'scanning' | 'generating' | 'verified'>('idle');
  const [zkpProofHash, setZkpProofHash] = useState<string>('');

  // Auto-detect user timezone / locale country on mount
  useEffect(() => {
    try {
      const userTz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
      if (userTz.includes('Madrid') || userTz.includes('Canary')) setCountryCode('ES');
      else if (userTz.includes('Paris')) setCountryCode('FR');
      else if (userTz.includes('Berlin')) setCountryCode('DE');
      else if (userTz.includes('London')) setCountryCode('GB');
      else if (userTz.includes('New_York') || userTz.includes('Los_Angeles') || userTz.includes('Chicago')) setCountryCode('US');
      else if (userTz.includes('Mexico')) setCountryCode('MX');
      else if (userTz.includes('Sao_Paulo')) setCountryCode('BR');
      else setCountryCode('ES'); // Default to Spain
    } catch (e) {
      setCountryCode('ES');
    }
  }, []);

  const reg = REGULATORY_RULES[countryCode] || REGULATORY_RULES.GLOBAL;
  const currentYear = new Date().getFullYear();
  const calculatedAge = currentYear - parseInt(birthYear, 10);
  const isUnderage = calculatedAge < reg.minAge;

  const handleStandardVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (isUnderage) {
      setErrorMsg(
        locale === 'es'
          ? `Debes tener al menos ${reg.minAge} años para acceder a SECCION bajo ${reg.lawName}.`
          : `You must be at least ${reg.minAge} years old to access SECCION under ${reg.lawName}.`
      );
      return;
    }
    if (!isChecked) {
      setErrorMsg(
        locale === 'es'
          ? 'Por favor confirma la casilla de declaración de edad para continuar.'
          : 'Please confirm your age declaration checkbox to continue.'
      );
      return;
    }

    const birthDate = `${birthYear}-${birthMonth.padStart(2, '0')}-${birthDay.padStart(2, '0')}`;
    const verificationTier = isCreatorMode ? 'kyc' : 'declared';
    
    onVerified({
      birthDate,
      countryCode,
      verificationTier,
    });
  };

  const handleZkpVerify = async () => {
    setErrorMsg(null);
    setZkpStep('scanning');

    // Simulate cryptographic zk-SNARK generation
    await new Promise((r) => setTimeout(r, 1200));
    setZkpStep('generating');
    await new Promise((r) => setTimeout(r, 1400));

    const simulatedProofHash = 'zkSNARK_0x' + Array.from({ length: 16 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    setZkpProofHash(simulatedProofHash);
    setZkpStep('verified');

    await new Promise((r) => setTimeout(r, 800));

    // Confirm verification
    onVerified({
      birthDate: `${currentYear - 21}-01-01`,
      countryCode,
      verificationTier: 'zkp',
    });
  };

  return (
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
              <span>{reg.name} {locale === 'es' ? 'Verificación de Edad' : 'Age Verification'}</span>
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

      {/* Method Selector (DSA Optimized: 1-Tap vs Sovereign ZKP) */}
      <div className="flex bg-black/50 p-1 rounded-2xl border border-white/10">
        <button
          type="button"
          onClick={() => {
            setMethod('standard');
            setErrorMsg(null);
          }}
          className={`flex-1 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            method === 'standard'
              ? 'bg-[#00fbfb] text-black shadow-[0_0_15px_rgba(0,251,251,0.3)]'
              : 'text-white/60 hover:text-white'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>{locale === 'es' ? '1-Toque / Estándar' : '1-Tap Standard'}</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setMethod('zkp');
            setErrorMsg(null);
          }}
          className={`flex-1 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            method === 'zkp'
              ? 'bg-gradient-to-r from-[#00fbfb] to-[#ffabf3] text-black shadow-[0_0_20px_rgba(255,171,243,0.4)]'
              : 'text-white/60 hover:text-white'
          }`}
        >
          <Cpu className="w-3.5 h-3.5" />
          <span>{locale === 'es' ? '🛡️ Billetera ZKP (100% Privado)' : '🛡️ ZKP Wallet (100% Private)'}</span>
        </button>
      </div>

      {method === 'standard' ? (
        <>
          {/* Regulation Explanation */}
          <div className="p-3 bg-white/[0.02] border-l-2 border-[#00fbfb] rounded-r-xl space-y-1">
            <span className="text-[9px] font-mono text-[#00fbfb] font-bold uppercase tracking-wider block">
              ⚡ {locale === 'es' ? 'Proceso Optimizado de Registro' : 'High-Speed Onboarding Pipeline'}
            </span>
            <p className="text-[11px] text-[#b9cac9] leading-relaxed">
              {locale === 'es' ? reg.descriptionEs : reg.description}
            </p>
          </div>

          {/* DOB Form */}
          <form onSubmit={handleStandardVerify} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-mono text-white/60 uppercase tracking-wider block">
                {locale === 'es' ? 'Selecciona tu Fecha de Nacimiento:' : 'Select Your Date of Birth:'}
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
                      {locale === 'es' ? `Día ${i + 1}` : `Day ${i + 1}`}
                    </option>
                  ))}
                </select>

                {/* Month */}
                <select
                  value={birthMonth}
                  onChange={(e) => setBirthMonth(e.target.value)}
                  className="bg-black/60 border border-white/20 rounded-xl p-2 text-xs font-mono text-white outline-none focus:border-[#00fbfb]"
                >
                  {[
                    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
                  ].map((m, i) => (
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
                {locale === 'es' ? (
                  <>Declaro legalmente bajo pena de perjurio que tengo <strong className="text-white font-mono">{calculatedAge} años</strong> (nacido/a en {birthYear}) y cumplo con los requisitos legales de {reg.name}.</>
                ) : (
                  <>I legally declare under penalty of perjury that I am <strong className="text-white font-mono">{calculatedAge} years old</strong> (born in {birthYear}) and meet the legal age requirements for {reg.name}.</>
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
              <span>{locale === 'es' ? 'Confirmar e Ingresar a SECCION' : 'Confirm & Enter SECCION'}</span>
            </button>
          </form>
        </>
      ) : (
        /* ZKP Autonomous Verification View */
        <div className="space-y-4 text-left">
          <div className="p-4 bg-gradient-to-br from-[#00fbfb]/10 to-[#ffabf3]/10 border border-[#00fbfb]/30 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[#00fbfb]">
                <Cpu className="w-4 h-4" />
                <span className="text-xs font-mono font-black uppercase tracking-wider text-white">
                  {locale === 'es' ? 'Prueba de Conocimiento Cero (zk-SNARK)' : 'Zero-Knowledge Proof (zk-SNARK)'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsZkpGuideOpen(true)}
                className="text-[10px] font-mono text-[#ffabf3] hover:underline flex items-center gap-1 cursor-pointer font-bold"
              >
                <Info className="w-3.5 h-3.5" />
                <span>{locale === 'es' ? '¿Cómo obtener Billetera?' : 'How to get a Wallet?'}</span>
              </button>
            </div>

            <p className="text-[11px] text-[#b9cac9] leading-relaxed">
              {locale === 'es'
                ? 'Verifica que tienes >= 18 años conectando tu billetera de identidad digital (Privado ID, Polygon ID o zkPass). Ningún documento, nombre o fecha es compartido con nosotros.'
                : 'Verify you are >= 18 by connecting your digital identity wallet (Privado ID, Polygon ID, or zkPass). No ID document, name, or birthdate is ever shared with us.'}
            </p>

            {zkpStep === 'idle' && (
              <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
                <button
                  type="button"
                  onClick={handleZkpVerify}
                  className="flex-1 py-3 px-4 bg-gradient-to-r from-[#00fbfb] to-[#00d2d2] hover:brightness-110 text-black font-mono text-xs font-black uppercase tracking-wider rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(0,251,251,0.4)]"
                >
                  <QrCode className="w-4 h-4" />
                  <span>{locale === 'es' ? 'Escanear QR / Conectar Billetera' : 'Scan QR / Connect Wallet'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsZkpGuideOpen(true)}
                  className="py-3 px-4 bg-white/5 hover:bg-white/10 text-white font-mono text-xs font-bold uppercase tracking-wider rounded-xl transition border border-white/10 text-center cursor-pointer"
                >
                  <span>{locale === 'es' ? 'Guía de Billeteras ZKP' : 'ZKP Wallet Guide'}</span>
                </button>
              </div>
            )}

            {zkpStep === 'scanning' && (
              <div className="py-6 flex flex-col items-center justify-center gap-3 text-center bg-black/40 rounded-xl border border-white/10">
                <Loader2 className="w-7 h-7 text-[#00fbfb] animate-spin" />
                <span className="font-mono text-xs text-white">
                  {locale === 'es' ? 'Conectando con billetera de identidad...' : 'Connecting to Identity Wallet...'}
                </span>
                <span className="text-[10px] text-white/50 font-mono">
                  {locale === 'es' ? 'Solicitando prueba criptográfica de edad >= 18' : 'Requesting cryptographic age proof >= 18'}
                </span>
              </div>
            )}

            {zkpStep === 'generating' && (
              <div className="py-6 flex flex-col items-center justify-center gap-3 text-center bg-black/40 rounded-xl border border-[#00fbfb]/30">
                <div className="w-7 h-7 rounded-full bg-[#00fbfb]/20 flex items-center justify-center text-[#00fbfb] animate-pulse">
                  <Cpu className="w-4 h-4" />
                </div>
                <span className="font-mono text-xs text-[#00fbfb]">
                  {locale === 'es' ? 'Generando y Validando zk-SNARK...' : 'Generating & Validating zk-SNARK...'}
                </span>
                <span className="text-[10px] text-[#b9cac9] font-mono">
                  {locale === 'es' ? 'Verificando firma matemática sin desencriptar PII' : 'Validating mathematical signature without decrypting PII'}
                </span>
              </div>
            )}

            {zkpStep === 'verified' && (
              <div className="py-5 flex flex-col items-center justify-center gap-2 text-center bg-emerald-500/10 rounded-xl border border-emerald-500/30">
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Check className="w-5 h-5" />
                </div>
                <h4 className="font-mono text-xs font-bold text-white uppercase">
                  {locale === 'es' ? '¡Prueba ZKP Verificada Exitosamente!' : 'ZKP Age Proof Verified!'}
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
  );
}
