'use client';

import React, { useState, useEffect } from 'react';
import { Building2, Coins, Globe, CreditCard, Check, ShieldCheck, ArrowUpRight, Loader2, Sparkles, Landmark } from 'lucide-react';
import { useTranslation } from '@/context/LanguageContext';
import { validateMoroccanRib, formatMoroccanRib, MoroccanBankInfo } from '@/lib/morocco-banking';

export default function CreatorPayoutSettings() {
  const { locale } = useTranslation();
  const [preferredRail, setPreferredRail] = useState<'sepa' | 'crypto_usdt' | 'wise' | 'cosmo_card' | 'morocco_bank'>('crypto_usdt');
  const [sepaIban, setSepaIban] = useState('');
  const [accountHolderName, setAccountHolderName] = useState('');
  const [cryptoNetwork, setCryptoNetwork] = useState<'solana' | 'tron_trc20'>('solana');
  const [cryptoWalletAddress, setCryptoWalletAddress] = useState('');
  const [wiseEmail, setWiseEmail] = useState('');
  const [cosmoAccountId, setCosmoAccountId] = useState('');
  
  // Moroccan Bank Specific States (Task 3)
  const [moroccoRib, setMoroccoRib] = useState('');
  const [moroccoBankInfo, setMoroccoBankInfo] = useState<MoroccanBankInfo | null>(null);
  const [moroccoRibError, setMoroccoRibError] = useState<string | null>(null);
  const [moroccoIsValid, setMoroccoIsValid] = useState<boolean>(false);
  const [derivedIban, setDerivedIban] = useState<string>('');

  const [availableBalanceEur, setAvailableBalanceEur] = useState<number>(0);
  const [saving, setSaving] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch('/api/creator/cashout');
        const data = await res.json();
        if (data.success) {
          if (data.settings?.preferred_rail) setPreferredRail(data.settings.preferred_rail);
          if (data.settings?.sepa_iban) setSepaIban(data.settings.sepa_iban);
          if (data.settings?.account_holder_name) setAccountHolderName(data.settings.account_holder_name);
          if (data.settings?.crypto_network) setCryptoNetwork(data.settings.crypto_network);
          if (data.settings?.crypto_wallet_address) setCryptoWalletAddress(data.settings.crypto_wallet_address);
          if (data.settings?.wise_email) setWiseEmail(data.settings.wise_email);
          if (data.settings?.cosmo_account_id) setCosmoAccountId(data.settings.cosmo_account_id);
          
          if (data.settings?.morocco_rib) {
            const raw = data.settings.morocco_rib;
            setMoroccoRib(formatMoroccanRib(raw));
            const check = validateMoroccanRib(raw);
            if (check.isValid) {
              setMoroccoIsValid(true);
              setMoroccoBankInfo(check.bankInfo);
              if (check.formattedIban) setDerivedIban(check.formattedIban);
            }
          } else if (data.settings?.sepa_iban?.startsWith('MA')) {
            const check = validateMoroccanRib(data.settings.sepa_iban);
            if (check.isValid) {
              setMoroccoRib(check.formattedRib);
              setMoroccoIsValid(true);
              setMoroccoBankInfo(check.bankInfo);
              if (check.formattedIban) setDerivedIban(check.formattedIban);
            }
          }

          setAvailableBalanceEur(data.availableBalanceEur || 0);
        }
      } catch (e) {
        console.error('Failed to load payout settings', e);
      }
    }
    loadSettings();
  }, []);

  const handleMoroccoRibChange = (val: string) => {
    const rawClean = val.replace(/[\s\-_./]/g, '').trim();
    if (rawClean.length <= 24) {
      setMoroccoRib(val);
    }

    if (!rawClean) {
      setMoroccoRibError(null);
      setMoroccoIsValid(false);
      setMoroccoBankInfo(null);
      setDerivedIban('');
      return;
    }

    const check = validateMoroccanRib(rawClean);
    if (check.isValid) {
      setMoroccoRibError(null);
      setMoroccoIsValid(true);
      setMoroccoBankInfo(check.bankInfo);
      if (check.formattedIban) setDerivedIban(check.formattedIban);
    } else {
      setMoroccoIsValid(false);
      setMoroccoBankInfo(check.bankInfo);
      if (rawClean.length >= 24) {
        setMoroccoRibError(check.error || 'Clé RIB invalide');
      } else {
        setMoroccoRibError(null);
      }
      setDerivedIban('');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);

    try {
      const payload: Record<string, any> = {
        preferredRail,
        sepaIban,
        accountHolderName,
        cryptoNetwork,
        cryptoWalletAddress,
        wiseEmail,
        cosmoAccountId
      };

      if (preferredRail === 'morocco_bank') {
        const cleanRib = moroccoRib.replace(/[\s\-_./]/g, '').trim();
        const check = validateMoroccanRib(cleanRib);
        if (!check.isValid) {
          setMoroccoRibError(check.error || 'Numéro RIB marocain invalide');
          setSaving(false);
          return;
        }
        payload.moroccoRib = check.cleanRib;
        payload.moroccoSwiftBic = check.bankInfo?.bic || 'BCMADMMC';
        payload.moroccoBankName = check.bankInfo?.name || 'Moroccan Commercial Bank';
        payload.sepaIban = check.iban;
        payload.sepaBic = check.bankInfo?.bic || 'BCMADMMC';
      }

      const res = await fetch('/api/creator/cashout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (data.success) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      }
    } catch (e) {
      console.error('Failed to save settings', e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Earnings Overview Card */}
      <div className="p-6 rounded-3xl bg-[#0F0F1A] border border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.5)] flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#39FF14]/10 text-[#39FF14] border border-[#39FF14]/30">
              90% REVENUE SPLIT GUARANTEE (YEAR 1)
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-white flex items-center gap-2">
            <span>€{availableBalanceEur.toFixed(2)}</span>
            <span className="text-xs font-mono font-normal text-white/50">
              ({Math.round(availableBalanceEur / 0.90)} Red Pills 💊 cashed out)
            </span>
          </div>
          <p className="text-xs text-[#C5C6C7] mt-1 max-w-lg">
            {locale === 'es'
              ? 'Tus fans te envían Red Pills. Cuando usan Banco Instantáneo o Cripto, evitan peajes bancarios y tu liquidación llega limpia.'
              : 'Fans unlock your content with Red Pills. When they use Instant Bank or Crypto, gateway tolls drop and your net take-home is maximized.'}
          </p>
        </div>

        <button
          type="button"
          disabled={availableBalanceEur < 45}
          className="px-6 py-3 bg-[#00FFFF] hover:shadow-[0_0_20px_rgba(0,255,255,0.4)] text-black font-mono text-xs font-bold uppercase tracking-wider rounded-full transition disabled:opacity-40 disabled:pointer-events-none flex items-center gap-2"
        >
          <span>{locale === 'es' ? 'Solicitar Retiro' : 'Request Payout'}</span>
          <ArrowUpRight className="w-4 h-4" />
        </button>
      </div>

      {/* Payout Channel Configuration */}
      <form onSubmit={handleSave} className="p-6 sm:p-8 rounded-3xl bg-[#0F0F1A] border border-white/10 space-y-6">
        <div>
          <h3 className="text-base font-bold text-white font-mono tracking-wider flex items-center gap-2">
            <Globe className="w-5 h-5 text-[#00FFFF]" />
            <span>{locale === 'es' ? 'MÉTODO DE RETIRO PREFERIDO' : 'PREFERRED CASHOUT METHOD'}</span>
          </h3>
          <p className="text-xs text-[#C5C6C7] mt-1">
            {locale === 'es'
              ? 'Configura cómo deseas recibir tus fondos netos. Compatible con creadores en Europa y Latinoamérica.'
              : 'Select how you want to receive your net creator earnings. Compatible globally across EU and Americas.'}
          </p>
        </div>

        {/* Rail Selector Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          {/* Moroccan Bank Transfer (RIB / SWIFT) */}
          <button
            type="button"
            onClick={() => setPreferredRail('morocco_bank')}
            className={`p-4 rounded-2xl border text-left transition flex flex-col justify-between ${
              preferredRail === 'morocco_bank'
                ? 'bg-[#00fbfb]/10 border-[#00fbfb] shadow-[0_0_15px_rgba(0,251,251,0.25)]'
                : 'bg-white/[0.02] border-white/10 hover:border-white/20'
            }`}
          >
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <span className="text-lg">🇲🇦</span>
                <Landmark className="w-4 h-4 text-[#00fbfb]" />
              </div>
              <div className="text-xs font-bold text-white font-mono">
                {locale === 'fr' ? 'Banque Maroc (RIB)' : locale === 'es' ? 'Banco Marruecos (RIB)' : 'Morocco Bank (RIB)'}
              </div>
              <div className="text-[10px] text-white/50 font-mono mt-0.5">Attijariwafa, CIH, BMCE, BCP</div>
            </div>
            <div className="text-[10px] font-mono text-[#00fbfb] font-bold mt-4">
              0% Retenue · Formule 5 (70% Devises)
            </div>
          </button>

          {/* Crypto USDT (Global / Non-EU) */}
          <button
            type="button"
            onClick={() => setPreferredRail('crypto_usdt')}
            className={`p-4 rounded-2xl border text-left transition flex flex-col justify-between ${
              preferredRail === 'crypto_usdt'
                ? 'bg-[#FF204E]/10 border-[#FF204E] shadow-[0_0_15px_rgba(255,32,78,0.25)]'
                : 'bg-white/[0.02] border-white/10 hover:border-white/20'
            }`}
          >
            <div>
              <Coins className="w-5 h-5 text-[#FF204E] mb-2" />
              <div className="text-xs font-bold text-white font-mono">USDT / USDC</div>
              <div className="text-[10px] text-white/50 font-mono mt-0.5">Solana / Tron (TRC-20)</div>
            </div>
            <div className="text-[10px] font-mono text-[#39FF14] font-bold mt-4">
              Instant · Gas ~$0.50 (Best for LATAM)
            </div>
          </button>

          {/* SEPA Instant (EU) */}
          <button
            type="button"
            onClick={() => setPreferredRail('sepa')}
            className={`p-4 rounded-2xl border text-left transition flex flex-col justify-between ${
              preferredRail === 'sepa'
                ? 'bg-[#00FFFF]/10 border-[#00FFFF] shadow-[0_0_15px_rgba(0,255,255,0.25)]'
                : 'bg-white/[0.02] border-white/10 hover:border-white/20'
            }`}
          >
            <div>
              <Building2 className="w-5 h-5 text-[#00FFFF] mb-2" />
              <div className="text-xs font-bold text-white font-mono">SEPA Transfer</div>
              <div className="text-[10px] text-white/50 font-mono mt-0.5">Spain & European Banks</div>
            </div>
            <div className="text-[10px] font-mono text-[#00FFFF] font-bold mt-4">
              €0.00 Fee · Same Day
            </div>
          </button>

          {/* Wise Direct */}
          <button
            type="button"
            onClick={() => setPreferredRail('wise')}
            className={`p-4 rounded-2xl border text-left transition flex flex-col justify-between ${
              preferredRail === 'wise'
                ? 'bg-[#00FFFF]/10 border-[#00FFFF] shadow-[0_0_15px_rgba(0,255,255,0.25)]'
                : 'bg-white/[0.02] border-white/10 hover:border-white/20'
            }`}
          >
            <div>
              <Globe className="w-5 h-5 text-white/80 mb-2" />
              <div className="text-xs font-bold text-white font-mono">Wise Payout</div>
              <div className="text-[10px] text-white/50 font-mono mt-0.5">Direct Interbank Transfer</div>
            </div>
            <div className="text-[10px] font-mono text-white/70 font-bold mt-4">
              Interbank FX Rate
            </div>
          </button>

          {/* Cosmo / Paxum Card */}
          <button
            type="button"
            onClick={() => setPreferredRail('cosmo_card')}
            className={`p-4 rounded-2xl border text-left transition flex flex-col justify-between ${
              preferredRail === 'cosmo_card'
                ? 'bg-[#00FFFF]/10 border-[#00FFFF] shadow-[0_0_15px_rgba(0,255,255,0.25)]'
                : 'bg-white/[0.02] border-white/10 hover:border-white/20'
            }`}
          >
            <div>
              <CreditCard className="w-5 h-5 text-white/80 mb-2" />
              <div className="text-xs font-bold text-white font-mono">Cosmo / Paxum</div>
              <div className="text-[10px] text-white/50 font-mono mt-0.5">Creator Prepaid Card</div>
            </div>
            <div className="text-[10px] font-mono text-white/70 font-bold mt-4">
              ATM Cashout Anywhere
            </div>
          </button>
        </div>

        {/* Dynamic Fields Based on Selection */}
        <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-4">
          {preferredRail === 'morocco_bank' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-mono uppercase font-bold text-white/50 block mb-1">
                    {locale === 'fr'
                      ? 'Titulaire du Compte (Nom & Prénom / Auto-Entrepreneur)'
                      : locale === 'es'
                      ? 'Titular de la Cuenta (Nombre / Auto-Entrepreneur)'
                      : 'Account Holder Legal Name (Auto-Entrepreneur)'}
                  </label>
                  <input
                    type="text"
                    value={accountHolderName}
                    onChange={(e) => setAccountHolderName(e.target.value)}
                    placeholder="e.g. Sofia El Amrani"
                    className="w-full bg-[#050505] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono outline-none focus:border-[#00fbfb]"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[10px] font-mono uppercase font-bold text-white/50 block">
                      {locale === 'fr'
                        ? 'RIB Bancaire Maroc (24 Chiffres)'
                        : locale === 'es'
                        ? 'RIB Bancario Marruecos (24 Dígitos)'
                        : 'Moroccan Bank RIB (24 Digits)'}
                    </label>
                    {moroccoBankInfo && (
                      <span className="text-[9px] font-mono font-bold text-[#00fbfb] bg-[#00fbfb]/10 border border-[#00fbfb]/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <span>🇲🇦</span>
                        <span>{moroccoBankInfo.shortName}</span>
                      </span>
                    )}
                  </div>
                  <input
                    type="text"
                    value={moroccoRib}
                    onChange={(e) => handleMoroccoRibChange(e.target.value)}
                    placeholder="007 780 0001234567890123 96"
                    className={`w-full bg-[#050505] border rounded-xl px-3.5 py-2.5 text-xs font-mono outline-none transition ${
                      moroccoRibError
                        ? 'border-red-500/60 text-red-300'
                        : moroccoIsValid
                        ? 'border-[#00fbfb] text-[#00fbfb]'
                        : 'border-white/10 text-white'
                    }`}
                  />
                  {moroccoRibError ? (
                    <span className="text-[9px] text-red-400 font-mono mt-1 block">
                      ⚠️ {moroccoRibError}
                    </span>
                  ) : moroccoIsValid && derivedIban ? (
                    <span className="text-[9px] text-[#39FF14] font-mono mt-1 block">
                      ✓ IBAN Maroc Dérivé: {derivedIban} ({moroccoBankInfo?.bic})
                    </span>
                  ) : (
                    <span className="text-[8.5px] text-white/30 font-mono mt-1 block">
                      {locale === 'fr'
                        ? '3 chiffres banque + 3 chiffres ville/guichet + 16 chiffres compte + 2 chiffres clé'
                        : '3 digits bank + 3 digits branch + 16 digits account + 2 digits key'}
                    </span>
                  )}
                </div>
              </div>

              {/* Moroccan B2B Export Regulatory & Privacy Discretion HUD */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-black/80 via-[#00fbfb]/5 to-black/80 border border-white/10 space-y-2 text-left">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-[#00fbfb]" />
                    <span>
                      {locale === 'fr'
                        ? 'Facturation B2B & Discrétion Bancaire Totale'
                        : locale === 'es'
                        ? 'Facturación B2B y Discreción Bancaria Total'
                        : 'B2B Digital Export & Full Banking Discretion'}
                    </span>
                  </span>
                  <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[9px] font-mono text-[#00fbfb]">
                    SWIFT: {moroccoBankInfo?.bic || 'AUTO'}
                  </span>
                </div>
                <p className="text-[11px] text-[#b9cac9] leading-relaxed">
                  {locale === 'fr'
                    ? 'Vos virements sont émis depuis SECCION AI CONCEPT S.L. (Espagne) avec l\'intitulé neutre "Prestation de services numériques B2B". Aucune mention pour adulte n\'apparaît sur votre relevé bancaire (Attijariwafa, CIH, BMCE, BCP).'
                    : locale === 'es'
                    ? 'Tus transferencias se emiten desde SECCION AI CONCEPT S.L. (España) con concepto neutral de "Servicios digitales B2B". Cero mención para adultos en tu extracto bancario marroquí.'
                    : 'Transfers are wired from SECCION AI CONCEPT S.L. (Spain) with neutral B2B digital export descriptors. Zero adult-industry flags appear on your Moroccan bank statement.'}
                </p>
                <div className="pt-1 flex flex-wrap items-center gap-2 text-[9px] font-mono">
                  <span className="px-2 py-0.5 rounded bg-[#00fbfb]/10 text-[#00fbfb] border border-[#00fbfb]/20">
                    0% IRNR (DTT Art. 14)
                  </span>
                  <span className="px-2 py-0.5 rounded bg-[#39FF14]/10 text-[#39FF14] border border-[#39FF14]/20">
                    70% Compte en Devises (Formule 5)
                  </span>
                  <span className="px-2 py-0.5 rounded bg-white/5 text-white/60 border border-white/10">
                    Régime Auto-Entrepreneur 1%
                  </span>
                </div>
              </div>
            </div>
          )}

          {preferredRail === 'crypto_usdt' && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-mono uppercase font-bold text-white/50 block mb-1">
                    Blockchain Network
                  </label>
                  <select
                    value={cryptoNetwork}
                    onChange={(e: any) => setCryptoNetwork(e.target.value)}
                    className="w-full bg-[#050505] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono outline-none focus:border-[#FF204E]"
                  >
                    <option value="solana">Solana (SPL Token) — Fast & $0.01 fee</option>
                    <option value="tron_trc20">Tron (TRC-20) — Binance & Local P2P friendly</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-mono uppercase font-bold text-white/50 block mb-1">
                    Wallet Address (USDT or USDC)
                  </label>
                  <input
                    type="text"
                    value={cryptoWalletAddress}
                    onChange={(e) => setCryptoWalletAddress(e.target.value)}
                    placeholder="e.g. 7xKX... or T9yX..."
                    className="w-full bg-[#050505] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono outline-none focus:border-[#FF204E]"
                  />
                </div>
              </div>
              <p className="text-[11px] text-[#39FF14] font-mono">
                💡 Ideal for creators in Colombia: paste your Binance or Bitso USDT address to withdraw directly to Bancolombia/Nequi in minutes.
              </p>
            </div>
          )}

          {preferredRail === 'sepa' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-mono uppercase font-bold text-white/50 block mb-1">
                  Account Holder Name
                </label>
                <input
                  type="text"
                  value={accountHolderName}
                  onChange={(e) => setAccountHolderName(e.target.value)}
                  placeholder="Full Legal Name"
                  className="w-full bg-[#050505] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono outline-none focus:border-[#00FFFF]"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono uppercase font-bold text-white/50 block mb-1">
                  IBAN (European Bank)
                </label>
                <input
                  type="text"
                  value={sepaIban}
                  onChange={(e) => setSepaIban(e.target.value)}
                  placeholder="ES00 0000 0000 0000 0000 0000"
                  className="w-full bg-[#050505] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono outline-none focus:border-[#00FFFF]"
                />
              </div>
            </div>
          )}

          {preferredRail === 'wise' && (
            <div>
              <label className="text-[10px] font-mono uppercase font-bold text-white/50 block mb-1">
                Wise Email Address
              </label>
              <input
                type="email"
                value={wiseEmail}
                onChange={(e) => setWiseEmail(e.target.value)}
                placeholder="your-email@example.com"
                className="w-full bg-[#050505] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono outline-none focus:border-[#00FFFF]"
              />
            </div>
          )}

          {preferredRail === 'cosmo_card' && (
            <div>
              <label className="text-[10px] font-mono uppercase font-bold text-white/50 block mb-1">
                Cosmo Payment / Paxum Account ID
              </label>
              <input
                type="text"
                value={cosmoAccountId}
                onChange={(e) => setCosmoAccountId(e.target.value)}
                placeholder="Account ID / Card Handle"
                className="w-full bg-[#050505] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono outline-none focus:border-[#00FFFF]"
              />
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-2">
          {savedSuccess && (
            <span className="text-xs font-mono text-[#39FF14] flex items-center gap-1.5">
              <Check className="w-4 h-4" />
              <span>{locale === 'es' ? 'Preferencias guardadas exitosamente.' : 'Preferences saved successfully.'}</span>
            </span>
          )}
          <div className="ml-auto">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-white text-black font-mono text-xs font-bold uppercase tracking-wider rounded-full hover:bg-white/90 transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              <span>{locale === 'es' ? 'Guardar Cambios' : 'Save Payout Preferences'}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
