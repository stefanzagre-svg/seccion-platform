'use client';

import React, { useEffect, useState } from 'react';
import {
  X,
  Sparkles,
  ShieldCheck,
  Zap,
  ArrowRight,
  Check,
  QrCode,
  CreditCard,
  Building2,
  Coins,
  ExternalLink,
  AlertCircle,
} from 'lucide-react';
import { MATRIX_PACKS, MatrixPack } from '@/lib/matrix-packs';
import { useTranslation } from '@/context/LanguageContext';

interface MatrixTopUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (pack: MatrixPack) => void;
  userBluePillsXp?: number; // Chemistry XP available to burn for discounts
  defaultLedger?: 'sfw_credits' | 'sovereign_red_pills';
}

export default function MatrixTopUpModal({
  isOpen,
  onClose,
  onSuccess,
  userBluePillsXp = 250,
  defaultLedger = 'sfw_credits',
}: MatrixTopUpModalProps) {
  const { locale } = useTranslation();
  const [selectedPack, setSelectedPack] = useState<MatrixPack>(MATRIX_PACKS[1]); // Synergy pulse default
  const [burnXp, setBurnXp] = useState<boolean>(false);
  const [targetLedger, setTargetLedger] = useState<'sfw_credits' | 'sovereign_red_pills'>(defaultLedger);
  const [paymentRail, setPaymentRail] = useState<'crypto' | 'open_banking' | 'coinflow' | 'rewarble'>('crypto');
  const [usdcNetwork, setUsdcNetwork] = useState<'usdcpolygon' | 'usdcsol'>('usdcpolygon');
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [invoiceUrl, setInvoiceUrl] = useState<string | null>(null);
  const [vatPreview, setVatPreview] = useState<{
    vatRate: number;
    vatPercentageLabel: string;
    vatAmountEur: number;
    grossTotalEur: number;
    effectiveCountry: string;
  } | null>(null);

  const tx = (en: string, es: string, fr: string) =>
    locale === 'es' ? es : locale === 'fr' ? fr : en;

  const availableDiscount = Math.min(
    selectedPack.maxEuroDiscount,
    Number(((userBluePillsXp / 50) * 1.5).toFixed(2))
  );

  const finalPriceEur = burnXp
    ? Math.max(1.0, Number((selectedPack.priceEur - availableDiscount).toFixed(2)))
    : selectedPack.priceEur;

  useEffect(() => {
    if (!isOpen) return;
    let active = true;
    const loadVat = async () => {
      try {
        const res = await fetch(
          `/api/billing/vat-preview?netBaseEur=${encodeURIComponent(finalPriceEur)}&instrumentType=spv`
        );
        if (!res.ok) return;
        const json = await res.json();
        if (active && json?.preview) {
          setVatPreview(json.preview);
        }
      } catch {
        // Authoritative VAT calculated server-side
      }
    };
    loadVat();
    return () => {
      active = false;
    };
  }, [isOpen, finalPriceEur]);

  if (!isOpen) return null;

  const handleCheckout = async () => {
    setLoading(true);
    setErrorMsg(null);
    setInvoiceUrl(null);

    try {
      if (paymentRail === 'crypto') {
        const res = await fetch('/api/billing/crypto/create-invoice', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            packId: selectedPack.id,
            applyXpDiscount: burnXp,
            currency: 'eur',
            payCurrency: usdcNetwork,
            orderType: targetLedger === 'sovereign_red_pills' ? 'nsfw_topup' : 'topup',
            ledger: targetLedger,
            instrumentType: 'spv',
            description: `${selectedPack.name} (${selectedPack.totalRedPills} ${
              targetLedger === 'sovereign_red_pills' ? 'Red Pills' : 'SFW Credits'
            })`,
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || data.message || 'Unable to generate USDC invoice');
        }

        setInvoiceUrl(data.invoiceUrl);
        if (typeof window !== 'undefined' && data.invoiceUrl) {
          window.open(data.invoiceUrl, '_blank', 'noopener,noreferrer');
        }
        return;
      }

      if (targetLedger === 'sovereign_red_pills' && (paymentRail === 'coinflow' || paymentRail === 'open_banking')) {
        throw new Error(
          tx(
            '18+ Sovereign Red Pills must be topped up via Instant MiCA USDC or E-Pin.',
            'Los Red Pills 18+ deben recargarse vía MiCA USDC o E-Pin.',
            'Les Red Pills 18+ doivent être rechargés via MiCA USDC ou E-Pin.'
          )
        );
      }

      throw new Error(
        tx(
          'External Open Banking / Card / E-Pin top-up is activating after S.L.U. KYB approval. Please use Instant MiCA USDC (0.5% fee) now.',
          'Recarga vía Open Banking / Tarjeta / E-Pin activándose tras aprobación KYB S.L.U. Usa Instant MiCA USDC (0.5%) ahora.',
          'Recharge Open Banking / Carte / E-Pin en cours d’activation KYB S.L.U. Utilisez MiCA USDC (0,5%) dès maintenant.'
        )
      );
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Top-up initialization failed');
    } finally {
      setLoading(false);
    }
  };

  const vatEur = vatPreview ? vatPreview.vatAmountEur : 0;
  const grossEur = vatPreview ? vatPreview.grossTotalEur : finalPriceEur;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="w-full max-w-2xl bg-[#0e0e13] border border-white/10 rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-red-500/10 via-transparent to-transparent">
          <div>
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-red-400">
              <Zap className="w-4 h-4 fill-red-400" />
              {tx('Dual-Ledger Wallet Top-Up', 'Recarga Cartera Dual-Ledger', 'Recharge Portefeuille Dual-Ledger')}
            </div>
            <h2 className="text-xl font-black text-white mt-1">
              {targetLedger === 'sfw_credits'
                ? tx('Add SFW Studio Credits ✨', 'Añadir Créditos Studio SFW ✨', 'Ajouter des Crédits SFW ✨')
                : tx('Add 18+ Sovereign Red Pills 💊', 'Añadir Red Pills Sovereign 💊', 'Ajouter des Red Pills 18+ 💊')}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-white/60 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6">
          {/* Dual-Ledger Selector */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => {
                setTargetLedger('sfw_credits');
                setErrorMsg(null);
              }}
              className={`p-3 rounded-2xl border text-left transition cursor-pointer ${
                targetLedger === 'sfw_credits'
                  ? 'bg-emerald-500/15 border-emerald-500/40 text-white'
                  : 'bg-white/[0.02] border-white/10 text-white/60 hover:text-white'
              }`}
            >
              <div className="text-xs font-black">✨ SFW Studio Credits</div>
              <div className="text-[10px] text-white/50 mt-0.5">
                {tx('Coaching, Lifestyle & Mainstream Tiers', 'Coaching, Estilo de Vida y SFW', 'Coaching, Lifestyle & SFW')}
              </div>
            </button>
            <button
              type="button"
              onClick={() => {
                setTargetLedger('sovereign_red_pills');
                setPaymentRail('crypto');
                setErrorMsg(null);
              }}
              className={`p-3 rounded-2xl border text-left transition cursor-pointer ${
                targetLedger === 'sovereign_red_pills'
                  ? 'bg-red-500/15 border-red-500/40 text-white'
                  : 'bg-white/[0.02] border-white/10 text-white/60 hover:text-white'
              }`}
            >
              <div className="text-xs font-black">💊 18+ Sovereign Red Pills</div>
              <div className="text-[10px] text-white/50 mt-0.5">
                {tx('18+ Vaults, Custom Escrow & Private Streams', 'Contenido 18+, Escrow y Streams', 'Coffre 18+, Escrow & Streams')}
              </div>
            </button>
          </div>

          {/* 1. Credit / Pill Pack Selection */}
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-white/40 block mb-3">
              {tx('1. Select Capsule Pack', '1. Selecciona tu Paquete', '1. Choisissez votre Pack')}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {MATRIX_PACKS.map((pack) => {
                const isSelected = selectedPack.id === pack.id;
                return (
                  <button
                    key={pack.id}
                    type="button"
                    onClick={() => setSelectedPack(pack)}
                    className={`p-4 rounded-2xl border text-left transition-all relative flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'bg-red-500/15 border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.15)]'
                        : 'bg-white/[0.03] border-white/5 hover:border-white/15'
                    }`}
                  >
                    {pack.popular && (
                      <span className="absolute -top-2.5 right-4 bg-gradient-to-r from-red-500 to-rose-600 text-white text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full shadow-md">
                        {tx('Best Value', 'Mejor Valor', 'Meilleure Valeur')}
                      </span>
                    )}

                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-lg font-black text-white">
                          {pack.totalRedPills} {targetLedger === 'sfw_credits' ? '✨' : '💊'}
                        </span>
                        {pack.bonusRedPills > 0 && (
                          <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-1.5 py-0.5 rounded">
                            +{pack.bonusRedPills} Bonus
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-semibold text-white/70 mt-0.5">{pack.name}</p>
                    </div>

                    <div className="text-right">
                      <div className="text-lg font-black text-white font-mono">
                        €{pack.priceEur.toFixed(2)}
                      </div>
                      <div className="text-[9px] text-white/40">+ VAT</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Blue Pill XP Burn Discount Toggle */}
          {userBluePillsXp >= 50 && (
            <div className="p-4 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-white">
                    {tx('Apply Blue Pill Chemistry XP Discount', 'Aplicar Descuento Chemistry XP', 'Appliquer Réduction Chemistry XP')}
                  </h4>
                  <p className="text-[11px] text-white/60">
                    {tx(
                      `Save €${availableDiscount.toFixed(2)} using ${userBluePillsXp} XP`,
                      `Ahorra €${availableDiscount.toFixed(2)} usando ${userBluePillsXp} XP`,
                      `Économisez €${availableDiscount.toFixed(2)} avec ${userBluePillsXp} XP`
                    )}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setBurnXp(!burnXp)}
                className={`w-12 h-6 rounded-full transition-colors p-1 cursor-pointer ${
                  burnXp ? 'bg-sky-500' : 'bg-white/10'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    burnXp ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          )}

          {/* 3. Payment Rail */}
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-white/40 block mb-3">
              {tx('2. Zero-Robbery Payment Method', '2. Método de Pago Directo', '2. Moyen de Paiement Direct')}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setPaymentRail('crypto');
                  setErrorMsg(null);
                }}
                className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 text-center transition-all cursor-pointer ${
                  paymentRail === 'crypto'
                    ? 'bg-amber-500/15 border-amber-500/60 text-white'
                    : 'bg-white/[0.02] border-white/5 text-white/50 hover:text-white/80'
                }`}
              >
                <Coins className="w-5 h-5 text-amber-400" />
                <span className="text-[11px] font-bold">USDC (MiCA)</span>
                <span className="text-[9px] text-emerald-400 font-mono">0.5% Fee · Live</span>
              </button>

              <button
                type="button"
                disabled={targetLedger === 'sovereign_red_pills'}
                onClick={() => {
                  setPaymentRail('open_banking');
                  setErrorMsg(null);
                }}
                className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 text-center transition-all ${
                  targetLedger === 'sovereign_red_pills'
                    ? 'opacity-40 cursor-not-allowed bg-white/[0.01] border-white/5'
                    : paymentRail === 'open_banking'
                      ? 'bg-sky-500/15 border-sky-500/60 text-white cursor-pointer'
                      : 'bg-white/[0.02] border-white/5 text-white/50 hover:text-white/80 cursor-pointer'
                }`}
              >
                <QrCode className="w-5 h-5 text-sky-400" />
                <span className="text-[11px] font-bold">Open Banking</span>
                <span className="text-[9px] text-white/40 font-mono">SFW · 0.8%</span>
              </button>

              <button
                type="button"
                disabled={targetLedger === 'sovereign_red_pills'}
                onClick={() => {
                  setPaymentRail('coinflow');
                  setErrorMsg(null);
                }}
                className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 text-center transition-all ${
                  targetLedger === 'sovereign_red_pills'
                    ? 'opacity-40 cursor-not-allowed bg-white/[0.01] border-white/5'
                    : paymentRail === 'coinflow'
                      ? 'bg-violet-500/15 border-violet-500/60 text-white cursor-pointer'
                      : 'bg-white/[0.02] border-white/5 text-white/50 hover:text-white/80 cursor-pointer'
                }`}
              >
                <CreditCard className="w-5 h-5 text-violet-400" />
                <span className="text-[11px] font-bold">Apple Pay / Card</span>
                <span className="text-[9px] text-white/40 font-mono">SFW Only</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setPaymentRail('rewarble');
                  setErrorMsg(null);
                }}
                className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 text-center transition-all cursor-pointer ${
                  paymentRail === 'rewarble'
                    ? 'bg-emerald-500/15 border-emerald-500/60 text-white'
                    : 'bg-white/[0.02] border-white/5 text-white/50 hover:text-white/80'
                }`}
              >
                <Building2 className="w-5 h-5 text-emerald-400" />
                <span className="text-[11px] font-bold">PayPal E-Pin</span>
                <span className="text-[9px] text-white/40 font-mono">Rewarble</span>
              </button>
            </div>

            {paymentRail === 'crypto' && (
              <div className="flex gap-2 mt-3">
                {(['usdcpolygon', 'usdcsol'] as const).map((net) => (
                  <button
                    key={net}
                    type="button"
                    onClick={() => setUsdcNetwork(net)}
                    className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase border transition cursor-pointer ${
                      usdcNetwork === net
                        ? 'bg-amber-400 text-black border-amber-400'
                        : 'bg-white/5 text-white/60 border-white/10'
                    }`}
                  >
                    {net === 'usdcpolygon' ? 'Circle USDC · Polygon' : 'Circle USDC · Solana'}
                  </button>
                ))}
              </div>
            )}
          </div>

          {errorMsg && (
            <div className="p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-200 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {invoiceUrl && (
            <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-200 flex items-center justify-between">
              <span className="flex items-center gap-2 font-semibold">
                <Check className="w-4 h-4 text-emerald-400" />
                {tx(
                  'USDC Invoice Ready — Wallet credits upon on-chain confirmation.',
                  'Factura USDC lista — Cartera se acreditará al confirmar.',
                  'Facture USDC prête — Crédit automatique à la confirmation.'
                )}
              </span>
              <a
                href={invoiceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="underline font-bold flex items-center gap-1"
              >
                {tx('Open', 'Abrir', 'Ouvrir')} <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}

          {/* Checkout Summary & CTA */}
          <div className="pt-2 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <div className="text-[11px] text-white/50 flex items-center gap-2">
                <span>
                  {tx('Total Charged:', 'Total a pagar:', 'Total TTC :')}
                </span>
                {burnXp && (
                  <span className="line-through text-red-400">
                    €{selectedPack.priceEur.toFixed(2)}
                  </span>
                )}
                {vatPreview?.effectiveCountry && (
                  <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-white/75">
                    {vatPreview.effectiveCountry} VAT {vatPreview.vatPercentageLabel} (€{vatEur.toFixed(2)})
                  </span>
                )}
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-white font-mono">
                  €{grossEur.toFixed(2)}
                </span>
                <span className="text-xs text-white/50 font-medium">
                  ({selectedPack.totalRedPills}{' '}
                  {targetLedger === 'sfw_credits' ? 'SFW Credits ✨' : 'Red Pills 💊'})
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleCheckout}
              disabled={loading}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-red-500 to-rose-600 text-white font-black uppercase text-xs tracking-wider shadow-lg shadow-red-500/20 hover:opacity-95 transition-opacity flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>
                    {tx(
                      `Pay €${grossEur.toFixed(2)}`,
                      `Pagar €${grossEur.toFixed(2)}`,
                      `Payer €${grossEur.toFixed(2)}`
                    )}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

          <div className="flex items-center justify-center gap-2 text-[10px] text-white/30">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500/70" />
            <span>
              {tx(
                'Direct creator settlement (90% Founding / 80% Std Net) · MiCA USDC Compliant',
                'Liquidación directa al creador (90% Fundador / 80% Est.) · MiCA USDC',
                'Règlement direct créateur (90% Fondateur / 80% Std) · MiCA USDC'
              )}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
