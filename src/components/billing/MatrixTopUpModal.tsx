'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, ShieldCheck, Zap, ArrowRight, Check, QrCode, CreditCard, Building2, Coins } from 'lucide-react';
import { MATRIX_PACKS, MatrixPack } from '@/app/api/matrix/packs/route';
import { useTranslation } from '@/context/LanguageContext';

interface MatrixTopUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (pack: MatrixPack) => void;
  userBluePillsXp?: number; // Chemistry XP available to burn for discounts
}

export default function MatrixTopUpModal({
  isOpen,
  onClose,
  onSuccess,
  userBluePillsXp = 250
}: MatrixTopUpModalProps) {
  const { locale } = useTranslation();
  const [selectedPack, setSelectedPack] = useState<MatrixPack>(MATRIX_PACKS[1]); // Synergy pulse default
  const [burnXp, setBurnXp] = useState<boolean>(false);
  const [paymentRail, setPaymentRail] = useState<'revolut' | 'bank' | 'card' | 'crypto'>('revolut');
  const [loading, setLoading] = useState<boolean>(false);

  if (!isOpen) return null;

  // Calculate potential XP discount
  const availableDiscount = Math.min(
    selectedPack.maxEuroDiscount,
    Number(((userBluePillsXp / 50) * 1.50).toFixed(2))
  );

  const finalPriceEur = burnXp
    ? Math.max(1.00, Number((selectedPack.priceEur - availableDiscount).toFixed(2)))
    : selectedPack.priceEur;

  const handleCheckout = async () => {
    setLoading(true);
    // Simulate instantaneous frictionless order creation
    setTimeout(() => {
      setLoading(false);
      if (onSuccess) onSuccess(selectedPack);
      onClose();
    }, 1200);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-2xl bg-[#0F0F1A] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden"
        >
          {/* Subtle Aesthetic Ambient Highlights */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#FF204E]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#00FFFF]/10 rounded-full blur-3xl pointer-events-none" />

          {/* Header */}
          <div className="flex items-center justify-between pb-6 border-b border-white/5 relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#FF204E]/10 border border-[#FF204E]/30 flex items-center justify-center text-[#FF204E] text-xl shadow-[0_0_15px_rgba(255,32,78,0.3)]">
                💊
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-white font-mono tracking-wider">
                    {locale === 'es' ? 'MATRIZ DE RED PILLS' : 'MATRIX RED PILLS'}
                  </h2>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#FF204E]/20 text-[#FF204E] border border-[#FF204E]/30">
                    FUEL
                  </span>
                </div>
                <p className="text-xs text-[#C5C6C7]">
                  {locale === 'es' 
                    ? 'Energía limpia para propinas, transmisiones en vivo y creadores.' 
                    : 'Clean fuel for tips, live streaming and creator passes.'}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-[#C5C6C7] hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content Body */}
          <div className="mt-6 space-y-6 relative z-10">
            {/* Step 1: Pack Selection */}
            <div>
              <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-white/50 block mb-3">
                {locale === 'es' ? '1. Elige tu cápsula de Red Pills' : '1. Select Red Pill Capsule'}
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {MATRIX_PACKS.map((pack) => {
                  const isSelected = selectedPack.id === pack.id;
                  return (
                    <button
                      key={pack.id}
                      type="button"
                      onClick={() => setSelectedPack(pack)}
                      className={`relative p-3.5 rounded-2xl border text-left transition flex flex-col justify-between ${
                        isSelected
                          ? 'bg-[#FF204E]/10 border-[#FF204E] shadow-[0_0_20px_rgba(255,32,78,0.25)]'
                          : 'bg-white/[0.03] border-white/10 hover:border-white/20'
                      }`}
                    >
                      {pack.bonusRedPills > 0 && (
                        <span className="absolute -top-2 right-2 px-1.5 py-0.5 rounded-full text-[9px] font-mono font-black bg-[#FF204E] text-white">
                          +{pack.bonusRedPills} FREE
                        </span>
                      )}

                      <div>
                        <div className="flex items-center gap-1 text-sm font-bold text-white font-mono">
                          <span>{pack.totalRedPills}</span>
                          <span className="text-[#FF204E] text-xs">💊</span>
                        </div>
                        <div className="text-[10px] text-white/50 font-mono mt-0.5">{pack.name}</div>
                      </div>

                      <div className="mt-3 pt-2 border-t border-white/5 text-xs font-mono font-bold text-[#00FFFF]">
                        €{pack.priceEur.toFixed(2)}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Blue Pill (XP) Burn Discount (Math-to-Magic) */}
            {userBluePillsXp >= 50 && (
              <div className="p-3.5 rounded-2xl bg-[#00FFFF]/5 border border-[#00FFFF]/20 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#00FFFF]/10 border border-[#00FFFF]/30 flex items-center justify-center text-[#00FFFF] text-sm">
                    🟦
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white font-mono flex items-center gap-1.5">
                      <span>{userBluePillsXp} {locale === 'es' ? 'Blue Pills XP Disponibles' : 'Blue Pills XP Available'}</span>
                      <span className="text-[10px] text-[#00FFFF]">(-€{availableDiscount.toFixed(2)})</span>
                    </div>
                    <div className="text-[10px] text-[#C5C6C7]">
                      {locale === 'es' 
                        ? 'Canjea tu química para reducir el precio de tu compra.' 
                        : 'Burn connection chemistry to slash your pack price.'}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setBurnXp(!burnXp)}
                  className={`px-3 py-1.5 rounded-full text-xs font-mono font-bold transition flex items-center gap-1.5 ${
                    burnXp
                      ? 'bg-[#00FFFF] text-black shadow-[0_0_12px_rgba(0,255,255,0.4)]'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  {burnXp ? <Check className="w-3.5 h-3.5" /> : null}
                  <span>{burnXp ? (locale === 'es' ? 'Aplicado' : 'Applied') : (locale === 'es' ? 'Canjear' : 'Redeem')}</span>
                </button>
              </div>
            )}

            {/* Step 3: Payment Rail Selection */}
            <div>
              <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-white/50 block mb-3">
                {locale === 'es' ? '2. Selecciona tu método de pago' : '2. Select Direct Payment Rail'}
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {/* Revolut Pay / QR */}
                <button
                  type="button"
                  onClick={() => setPaymentRail('revolut')}
                  className={`p-3 rounded-2xl border text-center transition ${
                    paymentRail === 'revolut'
                      ? 'bg-[#00FFFF]/10 border-[#00FFFF] shadow-[0_0_15px_rgba(0,255,255,0.2)]'
                      : 'bg-white/[0.03] border-white/10 hover:border-white/20'
                  }`}
                >
                  <QrCode className="w-5 h-5 mx-auto mb-1 text-[#00FFFF]" />
                  <div className="text-xs font-bold text-white font-mono">Revolut Pay</div>
                  <div className="text-[9px] text-[#39FF14] font-mono mt-0.5">0% Toll · 1-Click</div>
                </button>

                {/* Open Banking / SEPA */}
                <button
                  type="button"
                  onClick={() => setPaymentRail('bank')}
                  className={`p-3 rounded-2xl border text-center transition ${
                    paymentRail === 'bank'
                      ? 'bg-[#00FFFF]/10 border-[#00FFFF] shadow-[0_0_15px_rgba(0,255,255,0.2)]'
                      : 'bg-white/[0.03] border-white/10 hover:border-white/20'
                  }`}
                >
                  <Building2 className="w-5 h-5 mx-auto mb-1 text-white/80" />
                  <div className="text-xs font-bold text-white font-mono">Instant Bank</div>
                  <div className="text-[9px] text-[#39FF14] font-mono mt-0.5">SEPA Instant</div>
                </button>

                {/* Credit / Debit Card */}
                <button
                  type="button"
                  onClick={() => setPaymentRail('card')}
                  className={`p-3 rounded-2xl border text-center transition ${
                    paymentRail === 'card'
                      ? 'bg-[#00FFFF]/10 border-[#00FFFF] shadow-[0_0_15px_rgba(0,255,255,0.2)]'
                      : 'bg-white/[0.03] border-white/10 hover:border-white/20'
                  }`}
                >
                  <CreditCard className="w-5 h-5 mx-auto mb-1 text-white/80" />
                  <div className="text-xs font-bold text-white font-mono">Debit Card</div>
                  <div className="text-[9px] text-white/40 font-mono mt-0.5">Visa / MC Pack</div>
                </button>

                {/* Crypto USDT */}
                <button
                  type="button"
                  onClick={() => setPaymentRail('crypto')}
                  className={`p-3 rounded-2xl border text-center transition ${
                    paymentRail === 'crypto'
                      ? 'bg-[#00FFFF]/10 border-[#00FFFF] shadow-[0_0_15px_rgba(0,255,255,0.2)]'
                      : 'bg-white/[0.03] border-white/10 hover:border-white/20'
                  }`}
                >
                  <Coins className="w-5 h-5 mx-auto mb-1 text-[#FF204E]" />
                  <div className="text-xs font-bold text-white font-mono">USDT Crypto</div>
                  <div className="text-[9px] text-[#39FF14] font-mono mt-0.5">100% Stealth</div>
                </button>
              </div>
            </div>

            {/* Total Settlement & Submit Action */}
            <div className="pt-4 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <div className="text-xs text-white/50 font-mono">
                  {locale === 'es' ? 'Total a liquidar:' : 'Total Settlement:'}
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-white font-mono">€{finalPriceEur.toFixed(2)}</span>
                  {burnXp && (
                    <span className="text-xs text-white/40 line-through font-mono">
                      €{selectedPack.priceEur.toFixed(2)}
                    </span>
                  )}
                  <span className="text-xs text-[#00FFFF] font-mono">
                    ({selectedPack.totalRedPills} Red Pills 💊)
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCheckout}
                disabled={loading}
                className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-[#FF204E] to-[#FF00D4] hover:opacity-90 text-white font-mono text-xs font-black uppercase tracking-wider rounded-full shadow-[0_0_25px_rgba(255,32,78,0.4)] transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <span>{locale === 'es' ? 'Confirmando...' : 'Authorizing...'}</span>
                ) : (
                  <>
                    <span>{locale === 'es' ? 'Adquirir Red Pills' : 'Unlock Red Pills'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
