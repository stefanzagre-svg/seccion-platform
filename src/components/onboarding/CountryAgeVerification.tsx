'use client';

import React, { useState, useEffect } from 'react';
import { ShieldCheck, Globe, CheckCircle2, AlertCircle, Sparkles, Lock, Shield } from 'lucide-react';

interface CountryAgeVerificationProps {
  onVerified: (data: { birthDate: string; countryCode: string; verificationTier: 'declared' | 'micro' | 'kyc' }) => void;
  isCreatorMode?: boolean;
}

interface CountryRegulation {
  code: string;
  name: string;
  flag: string;
  minAge: number;
  lawName: string;
  description: string;
  requiresKYC: boolean;
}

const REGULATORY_RULES: Record<string, CountryRegulation> = {
  ES: {
    code: 'ES',
    name: 'Spain / European Union',
    flag: '🇪🇸',
    minAge: 18,
    lawName: 'DSA Art. 28 & Ley Orgánica 3/2018',
    description: 'Instant 1-Tap DOB self-declaration for general feeds. ID verification only required for explicit VIP unlocks.',
    requiresKYC: false,
  },
  FR: {
    code: 'FR',
    name: 'France / European Union',
    flag: '🇫🇷',
    minAge: 18,
    lawName: 'DSA Art. 28 & ARCOM Framework',
    description: 'Fast 1-Tap birth year declaration. Zero friction for non-explicit member onboarding.',
    requiresKYC: false,
  },
  DE: {
    code: 'DE',
    name: 'Germany / European Union',
    flag: '🇩🇪',
    minAge: 18,
    lawName: 'Jugendschutzgesetz (JuSchG)',
    description: 'Instant birthdate entry for platform browsing.',
    requiresKYC: false,
  },
  GB: {
    code: 'GB',
    name: 'United Kingdom',
    flag: '🇬🇧',
    minAge: 18,
    lawName: 'Online Safety Act 2023',
    description: '1-Tap DOB declaration for general access. Payment method validation satisfies age proof for paid tiers.',
    requiresKYC: false,
  },
  US: {
    code: 'US',
    name: 'United States',
    flag: '🇺🇸',
    minAge: 18,
    lawName: 'COPPA & State Age Mandates',
    description: 'Instant birthdate verification tailored to state compliance.',
    requiresKYC: false,
  },
  MX: {
    code: 'MX',
    name: 'Mexico / Latin America',
    flag: '🇲🇽',
    minAge: 18,
    lawName: 'Ley de Protección de Datos (LFPDPPP)',
    description: 'Fast 1-Click age verification.',
    requiresKYC: false,
  },
  BR: {
    code: 'BR',
    name: 'Brazil',
    flag: '🇧🇷',
    minAge: 18,
    lawName: 'LGPD & Marco Civil da Internet',
    description: 'Instant 1-Tap birthdate confirmation.',
    requiresKYC: false,
  },
  GLOBAL: {
    code: 'GLOBAL',
    name: 'International Standard',
    flag: '🌐',
    minAge: 18,
    lawName: 'Global Age Compliance Directives',
    description: 'Instant 1-Tap birthdate confirmation for general platform access.',
    requiresKYC: false,
  },
};

export default function CountryAgeVerification({ onVerified, isCreatorMode = false }: CountryAgeVerificationProps) {
  const [countryCode, setCountryCode] = useState<string>('ES');
  const [birthYear, setBirthYear] = useState<string>('2000');
  const [birthMonth, setBirthMonth] = useState<string>('01');
  const [birthDay, setBirthDay] = useState<string>('01');
  const [isChecked, setIsChecked] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

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
      else setCountryCode('ES'); // Default to Spain (home market)
    } catch (e) {
      setCountryCode('ES');
    }
  }, []);

  const reg = REGULATORY_RULES[countryCode] || REGULATORY_RULES.GLOBAL;

  const currentYear = new Date().getFullYear();
  const calculatedAge = currentYear - parseInt(birthYear, 10);
  const isUnderage = calculatedAge < reg.minAge;

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (isUnderage) {
      setErrorMsg(`You must be at least ${reg.minAge} years old to access SECCION under ${reg.lawName}.`);
      return;
    }
    if (!isChecked) {
      setErrorMsg('Please confirm your age declaration checkbox to continue.');
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

  return (
    <div className="w-full bg-[#0c1017] border border-[#00fbfb]/30 rounded-3xl p-6 shadow-2xl relative overflow-hidden text-white font-sans space-y-5">
      {/* Header Badge */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#00fbfb]/10 border border-[#00fbfb]/30 flex items-center justify-center text-[#00fbfb]">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs font-mono font-bold tracking-wider uppercase text-white flex items-center gap-1.5">
              <span>{reg.flag}</span>
              <span>{reg.name} Age Verification</span>
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

      {/* Regulation Fast-Track Explanation */}
      <div className="p-3 bg-white/[0.02] border-l-2 border-[#00fbfb] rounded-r-xl space-y-1">
        <span className="text-[9px] font-mono text-[#00fbfb] font-bold uppercase tracking-wider block">
          ⚡ High-Speed Onboarding Pipeline
        </span>
        <p className="text-[11px] text-[#b9cac9] leading-relaxed">
          {reg.description}
        </p>
      </div>

      {/* DOB Form */}
      <form onSubmit={handleVerify} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-[11px] font-mono text-white/60 uppercase tracking-wider block">
            Select Your Date of Birth:
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
                  Day {i + 1}
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
            I legally declare under penalty of perjury that I am <strong className="text-white font-mono">{calculatedAge} years old</strong> (born in {birthYear}) and meet the legal age requirements for {reg.name}.
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
          <span>Confirm & Enter SECCION</span>
        </button>
      </form>
    </div>
  );
}
