'use client';

import React, { useEffect, useState } from 'react';
import {
  ShieldCheck,
  Lock,
  Landmark,
  Coins,
  CreditCard,
  Wallet,
  ExternalLink,
  AlertCircle,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import { useTranslation } from '@/context/LanguageContext';

type PaymentMethodType = 'crypto' | 'wallet' | 'open_banking' | 'coinflow';

interface VatPreviewSummary {
  netBaseEur: number;
  vatRate: number;
  vatPercentageLabel: string;
  vatAmountEur: number;
  grossTotalEur: number;
  effectiveCountry: string;
  taxRegime: string;
}

interface UnifiedPaymentGateProps {
  amount: number;
  tier: 'VIP' | 'MASTER' | 'TIP' | 'CUSTOM_ORDER' | 'PRIVATE_CALL' | 'PPV';
  creatorName: string;
  creatorId?: string;
  contentRating?: 'SFW' | 'NSFW_18';
  itemType?: 'subscription' | 'private_call' | 'tip' | 'unlock';
  callId?: string;
  duration?: number;
  onSuccess?: () => void;
}

export default function UnifiedPaymentGate({
  amount,
  tier,
  creatorName,
  creatorId,
  contentRating = 'SFW',
  itemType,
  callId,
  duration,
  onSuccess,
}: UnifiedPaymentGateProps) {
  const { locale } = useTranslation();
  const isNsfwLocked = contentRating === 'NSFW_18' || tier === 'PPV';
  const isTipAupRestricted = tier === 'TIP' || itemType === 'tip';

  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodType>('wallet');
  const [usdcNetwork, setUsdcNetwork] = useState<'usdcpolygon' | 'usdcsol'>('usdcpolygon');
  const [isProcessing, setIsProcessing] = useState(false);
  const [cryptoInvoiceUrl, setCryptoInvoiceUrl] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [vatPreview, setVatPreview] = useState<VatPreviewSummary | null>(null);

  useEffect(() => {
    let active = true;
    const loadVat = async () => {
      try {
        const res = await fetch(
          `/api/billing/vat-preview?netBaseEur=${encodeURIComponent(amount)}&instrumentType=direct_service`
        );
        if (!res.ok) return;
        const json = await res.json();
        if (active && json?.preview) {
          setVatPreview(json.preview);
        }
      } catch {
        // Fallback silently if offline; server enforces authoritative VAT
      }
    };
    if (amount > 0) loadVat();
    return () => {
      active = false;
    };
  }, [amount]);

  const tx = (en: string, es: string, fr: string) =>
    locale === 'es' ? es : locale === 'fr' ? fr : en;

  const resolvedItemType: 'subscription' | 'private_call' | 'tip' | 'unlock' =
    itemType ||
    (tier === 'PRIVATE_CALL'
      ? 'private_call'
      : tier === 'TIP'
        ? 'tip'
        : tier === 'PPV'
          ? 'unlock'
          : 'subscription');

  const handleCheckout = async () => {
    setIsProcessing(true);
    setErrorMsg(null);
    setStatusMessage(null);

    try {
      if (selectedMethod === 'crypto') {
        const res = await fetch('/api/billing/crypto/create-invoice', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            creatorId,
            amount,
            currency: 'eur',
            payCurrency: usdcNetwork,
            orderType: resolvedItemType,
            ledger: isNsfwLocked ? 'sovereign_red_pills' : 'sfw_credits',
            description: `${tier} · ${creatorName}`,
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || data.message || 'Crypto invoice creation failed');
        }

        setCryptoInvoiceUrl(data.invoiceUrl);
        if (typeof window !== 'undefined' && data.invoiceUrl) {
          window.open(data.invoiceUrl, '_blank', 'noopener,noreferrer');
        }
        setStatusMessage(
          tx(
            'MiCA USDC invoice generated. Complete settlement in the opened window.',
            'Factura MiCA USDC generada. Completa el pago en la ventana abierta.',
            'Facture MiCA USDC générée. Finalisez le paiement dans la fenêtre ouverte.'
          )
        );
        return;
      }

      if (!creatorId) {
        throw new Error(
          tx(
            'Missing creator target identifier for checkout.',
            'Falta el identificador de creador para procesar el pago.',
            'Identifiant du créateur manquant pour le paiement.'
          )
        );
      }

      const res = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          creatorId,
          tier: isNsfwLocked ? 'nsfw_18' : tier.toLowerCase(),
          price: amount,
          type: resolvedItemType,
          paymentMethod: selectedMethod,
          callId,
          duration,
          rating: contentRating,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        if (res.status === 402) {
          setSelectedMethod('crypto');
        }
        throw new Error(data.message || data.error || 'Checkout failed');
      }

      if (data.unlockedImmediately) {
        setStatusMessage(
          tx(
            'Payment settled atomically from your wallet ledger!',
            'Pago liquidado al instante desde tu cartera.',
            'Paiement réglé instantanément depuis votre portefeuille.'
          )
        );
        onSuccess?.();
        return;
      }

      if (data.url && typeof window !== 'undefined') {
        window.location.href = data.url;
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Checkout error';
      setErrorMsg(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  const displayVatRate = vatPreview?.vatPercentageLabel || '—';
  const displayVatEur = vatPreview ? vatPreview.vatAmountEur.toFixed(2) : '0.00';
  const displayGrossEur = vatPreview ? vatPreview.grossTotalEur.toFixed(2) : amount.toFixed(2);

  return (
    <div className="bg-[#0e0e13] border border-white/10 rounded-[2rem] p-6 max-w-md w-full space-y-5 shadow-2xl relative overflow-hidden">
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-start justify-between border-b border-white/10 pb-4">
        <div>
          <span
            className={`inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full border mb-2 ${
              isNsfwLocked
                ? 'bg-red-500/10 text-red-400 border-red-500/20'
                : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
            }`}
          >
            {isNsfwLocked ? (
              <ShieldCheck className="w-3 h-3" />
            ) : (
              <Lock className="w-3 h-3" />
            )}
            {isNsfwLocked
              ? tx('18+ Sovereign Rail', '18+ Red Sovereign', '18+ Réseau Sovereign')
              : tx('SFW Protected Rail', 'Canal SFW Protegido', 'Canal SFW Protégé')}
          </span>
          <h3 className="text-lg font-black text-white">
            {tier} · {creatorName}
          </h3>
        </div>
        <div className="text-right">
          <div className="text-2xl font-black text-white">€{displayGrossEur}</div>
          <div className="text-[10px] text-white/50 font-mono">
            {tx('Net', 'Base', 'Net')} €{amount.toFixed(2)} + VAT ({displayVatRate}) €{displayVatEur}
          </div>
        </div>
      </div>

      {/* Transparent V3.1 Tax & Creator Protection Strip */}
      <div className="px-3.5 py-2.5 rounded-2xl bg-white/[0.02] border border-white/5 text-[11px] text-white/65 flex items-center justify-between">
        <span>
          {tx(
            'Creator keeps 90% Founding / 80% Std of Net Base',
            'Creador recibe 90% Fundador / 80% Est. de Base Neta',
            'Le créateur garde 90% Fondateur / 80% Std du Net'
          )}
        </span>
        {vatPreview?.effectiveCountry && (
          <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-white/10 text-white/80">
            {vatPreview.effectiveCountry}
          </span>
        )}
      </div>

      {/* Payment Rail Selection */}
      <div className="space-y-2.5">
        {/* Option 1: Dual Wallet Instant Spend */}
        <button
          type="button"
          onClick={() => {
            setSelectedMethod('wallet');
            setErrorMsg(null);
          }}
          className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer text-left ${
            selectedMethod === 'wallet'
              ? 'bg-emerald-500/10 border-emerald-500/40 shadow-lg shadow-emerald-500/5'
              : 'bg-white/[0.02] border-white/5 hover:border-white/15'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-xl">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-white flex items-center gap-2">
                {isNsfwLocked
                  ? tx('Red Pills Wallet (💊)', 'Cartera Red Pills (💊)', 'Portefeuille Red Pills (💊)')
                  : tx('SFW Studio Credits (✨)', 'Créditos Studio SFW (✨)', 'Crédits Studio SFW (✨)')}
                <span className="text-[9px] bg-emerald-500 text-black font-black px-1.5 py-0.5 rounded uppercase">
                  0% Fee
                </span>
              </div>
              <div className="text-[11px] text-white/50">
                {tx(
                  'Instant ledger unlock from balance',
                  'Desbloqueo inmediato desde tu saldo',
                  'Déblocage instantané depuis votre solde'
                )}
              </div>
            </div>
          </div>
        </button>

        {/* Option 2: Instant MiCA USDC (Polygon / Solana) */}
        <div
          className={`rounded-2xl border transition-all ${
            selectedMethod === 'crypto'
              ? 'bg-amber-500/10 border-amber-500/40 shadow-lg shadow-amber-500/5'
              : 'bg-white/[0.02] border-white/5 hover:border-white/15'
          }`}
        >
          <button
            type="button"
            onClick={() => {
              setSelectedMethod('crypto');
              setErrorMsg(null);
            }}
            className="w-full flex items-center justify-between p-4 cursor-pointer text-left"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-xl">
                <Coins className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-white flex items-center gap-2">
                  {tx(
                    'Instant USDC (MiCA Compliant)',
                    'USDC Instantáneo (MiCA)',
                    'USDC Instantané (MiCA)'
                  )}
                  <span className="text-[9px] bg-amber-500 text-black font-black px-1.5 py-0.5 rounded uppercase">
                    0.5% Fee
                  </span>
                </div>
                <div className="text-[11px] text-white/50">
                  {tx(
                    'Circle USDC · Polygon & Solana · Discreet & Direct',
                    'Circle USDC · Polygon y Solana · Discreto y directo',
                    'Circle USDC · Polygon & Solana · Discret & Direct'
                  )}
                </div>
              </div>
            </div>
          </button>

          {selectedMethod === 'crypto' && (
            <div className="px-4 pb-3 flex gap-2">
              {(['usdcpolygon', 'usdcsol'] as const).map((net) => (
                <button
                  key={net}
                  type="button"
                  onClick={() => setUsdcNetwork(net)}
                  className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border transition ${
                    usdcNetwork === net
                      ? 'bg-amber-400 text-black border-amber-400'
                      : 'bg-black/40 text-white/60 border-white/10 hover:text-white'
                  }`}
                >
                  {net === 'usdcpolygon' ? 'USDC Polygon' : 'USDC Solana'}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Option 3: Open Banking A2A (SFW Only) */}
        <button
          type="button"
          disabled={isNsfwLocked}
          onClick={() => {
            if (!isNsfwLocked) {
              setSelectedMethod('open_banking');
              setErrorMsg(null);
            }
          }}
          className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all text-left ${
            isNsfwLocked
              ? 'opacity-40 cursor-not-allowed bg-white/[0.01] border-white/5'
              : selectedMethod === 'open_banking'
                ? 'bg-sky-500/10 border-sky-500/40 cursor-pointer'
                : 'bg-white/[0.02] border-white/5 hover:border-white/15 cursor-pointer'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-sky-500/20 text-sky-400 rounded-xl">
              <Landmark className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-white flex items-center gap-2">
                {tx(
                  'Open Banking A2A QR',
                  'Open Banking A2A QR',
                  'Open Banking A2A QR'
                )}
                {isNsfwLocked && (
                  <span className="text-[9px] text-red-400 font-normal">
                    ({tx('SFW Only', 'Solo SFW', 'SFW Uniquement')})
                  </span>
                )}
              </div>
              <div className="text-[11px] text-white/50">
                {tx(
                  'EU/UK PSD2 Instant Bank QR (~0.8% fee)',
                  'QR Bancario Instantáneo PSD2 (~0.8% comisión)',
                  'QR Bancaire Instantané PSD2 (~0.8% frais)'
                )}
              </div>
            </div>
          </div>
        </button>

        {/* Option 4: Card / Apple Pay (Coinflow — Blocked for NSFW_18 & Tips per AUP) */}
        <button
          type="button"
          disabled={isNsfwLocked || isTipAupRestricted}
          onClick={() => {
            if (!isNsfwLocked && !isTipAupRestricted) {
              setSelectedMethod('coinflow');
              setErrorMsg(null);
            }
          }}
          className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all text-left ${
            isNsfwLocked || isTipAupRestricted
              ? 'opacity-40 cursor-not-allowed bg-white/[0.01] border-white/5'
              : selectedMethod === 'coinflow'
                ? 'bg-violet-500/10 border-violet-500/40 cursor-pointer'
                : 'bg-white/[0.02] border-white/5 hover:border-white/15 cursor-pointer'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-violet-500/20 text-violet-400 rounded-xl">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-white flex items-center gap-2">
                {tx('Apple Pay / Card (SFW)', 'Apple Pay / Tarjeta (SFW)', 'Apple Pay / Carte (SFW)')}
                {(isNsfwLocked || isTipAupRestricted) && (
                  <span className="text-[9px] text-red-400 font-normal">
                    ({tx('Use Wallet/USDC', 'Usa Cartera/USDC', 'Portefeuille/USDC')})
                  </span>
                )}
              </div>
              <div className="text-[11px] text-white/50">
                {tx(
                  '100% Chargeback Protected · Coaching & SFW Passes',
                  'Protegido contra contracargos · Pases SFW',
                  'Protégé anti-rétrofacturation · Pass SFW'
                )}
              </div>
            </div>
          </div>
        </button>
      </div>

      {/* Feedback & Invoice Link */}
      {errorMsg && (
        <div className="p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-200 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {statusMessage && (
        <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-200 flex items-start gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <span>{statusMessage}</span>
        </div>
      )}

      {cryptoInvoiceUrl && (
        <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-between text-xs text-amber-200">
          <span>{tx('USDC Invoice Ready', 'Factura USDC Lista', 'Facture USDC Prête')}</span>
          <a
            href={cryptoInvoiceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 font-bold underline hover:text-amber-100"
          >
            {tx('Open Gateway', 'Abrir Pasarela', 'Ouvrir')} <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      )}

      {/* Checkout Action */}
      <button
        type="button"
        onClick={handleCheckout}
        disabled={isProcessing}
        className="w-full py-4 rounded-xl bg-gradient-to-r from-primary to-amber-500 text-black font-black uppercase text-xs tracking-wider shadow-lg shadow-primary/20 hover:opacity-95 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
      >
        {isProcessing ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          tx(
            `Continue · €${displayGrossEur}`,
            `Continuar · €${displayGrossEur}`,
            `Continuer · €${displayGrossEur}`
          )
        )}
      </button>

      <div className="flex items-center justify-center gap-2 text-[10px] text-white/40 pt-1">
        <ShieldCheck className="w-3.5 h-3.5 text-primary/70" />
        <span>
          {tx(
            'SECCION V3.1 · CJEU Fenix Compliant · Spanish S.L.U. Treasury',
            'SECCION V3.1 · Cumplimiento TJUE Fenix · Tesorería S.L.U.',
            'SECCION V3.1 · Conformité CJUE Fenix · Trésorerie S.L.U.'
          )}
        </span>
      </div>
    </div>
  );
}
