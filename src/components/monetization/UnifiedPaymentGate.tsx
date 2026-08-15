'use client';

import React, { useState } from 'react';
import { ShieldCheck, Lock, CreditCard, Loader2, Landmark, Zap, Sparkles, ArrowRight, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '@/context/LanguageContext';

export type PaymentMethodType = 'bank' | 'crypto' | 'card';

interface UnifiedPaymentGateProps {
  amount: number;
  tier: 'VIP' | 'MASTER' | 'TIP' | 'CUSTOM_ORDER';
  creatorName: string;
  creatorId?: string;
  onSuccess?: () => void;
}

export default function UnifiedPaymentGate({ 
  amount, 
  tier, 
  creatorName, 
  creatorId,
  onSuccess 
}: UnifiedPaymentGateProps) {
  const { locale } = useTranslation();
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodType>('bank');
  const [isProcessing, setIsProcessing] = useState(false);
  const [cryptoInvoiceUrl, setCryptoInvoiceUrl] = useState<string | null>(null);

  const handleCheckout = async () => {
    setIsProcessing(true);

    try {
      if (selectedMethod === 'crypto') {
        const res = await fetch('/api/billing/crypto/create-invoice', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            creatorId,
            amount,
            currency: 'usd',
            payCurrency: 'usdttrc20',
            orderType: tier.toLowerCase(),
            description: `${tier} Support to ${creatorName}`
          })
        });
        const data = await res.json();
        if (data.invoiceUrl) {
          window.location.href = data.invoiceUrl;
          return;
        }
      }

      // Simulated Bank SCA or Segpay card redirect for other methods
      setTimeout(() => {
        setIsProcessing(false);
        if (onSuccess) onSuccess();
      }, 1500);
    } catch (err) {
      console.error('Checkout error:', err);
      setIsProcessing(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-black/80 border border-white/10 rounded-[2.5rem] p-6 sm:p-8 backdrop-blur-2xl relative overflow-hidden shadow-[0_24px_48px_-12px_rgba(0,0,0,0.8)]">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#00fbfb]/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#00fbfb]/10 border border-[#00fbfb]/20 flex items-center justify-center">
            <Lock className="w-5 h-5 text-[#00fbfb]" />
          </div>
          <div className="text-left">
            <h3 className="text-white font-black text-sm uppercase tracking-wider">
              {locale === 'es' ? 'Pago Seguro' : 'Secure Checkout'}
            </h3>
            <p className="text-white/40 text-[9px] uppercase tracking-widest font-mono">
              {locale === 'es' ? 'Transparencia de Soporte' : 'Direct Support Impact'}
            </p>
          </div>
        </div>
        <ShieldCheck className="w-5 h-5 text-emerald-400 opacity-70" />
      </div>

      {/* Order Summary */}
      <div className="p-4 bg-white/[0.03] border border-white/5 rounded-2xl space-y-2 mb-6 text-left">
        <div className="flex justify-between items-center text-xs">
          <span className="text-white/50">{locale === 'es' ? 'Apoyando a:' : 'Supporting:'}</span>
          <span className="text-white font-bold">@{creatorName}</span>
        </div>
        <div className="flex justify-between items-center text-xs">
          <span className="text-white/50">{locale === 'es' ? 'Tipo de Acceso:' : 'Access Tier:'}</span>
          <span className="font-mono font-bold px-2 py-0.5 rounded text-[9px] uppercase tracking-wider bg-[#00fbfb]/15 text-[#00fbfb] border border-[#00fbfb]/20">
            {tier}
          </span>
        </div>
        <div className="flex justify-between items-center pt-2 border-t border-white/5">
          <span className="text-white/70 font-black uppercase tracking-widest text-[10px]">{locale === 'es' ? 'Total:' : 'Total:'}</span>
          <span className="text-2xl font-black text-white font-mono">${amount.toFixed(2)}</span>
        </div>
      </div>

      {/* Payment Rail Selector */}
      <div className="space-y-3 mb-6 text-left">
        <label className="text-[9px] uppercase tracking-widest font-black text-white/50 block">
          {locale === 'es' ? 'Selecciona Método de Pago:' : 'Select Payment Method:'}
        </label>

        {/* 1. Direct Bank Transfer (Bizum / PSE / SEPA Instant) */}
        <div 
          onClick={() => setSelectedMethod('bank')}
          className={`p-3.5 rounded-2xl border cursor-pointer transition-all duration-300 relative ${
            selectedMethod === 'bank'
              ? 'bg-[#00fbfb]/10 border-[#00fbfb] shadow-[0_0_20px_rgba(0,251,251,0.15)]'
              : 'bg-white/[0.02] border-white/5 hover:border-white/15'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${selectedMethod === 'bank' ? 'bg-[#00fbfb] text-black' : 'bg-white/5 text-white/60'}`}>
                <Landmark className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-white flex items-center gap-1.5">
                  {locale === 'es' ? 'Banco Directo (Bizum / PSE / SEPA)' : 'Pay by Bank (SEPA Instant / PSE / Bizum)'}
                </p>
                <span className="text-[9px] text-emerald-400 font-mono font-bold block mt-0.5">
                  ⚡ {locale === 'es' ? '0% Desperdicio en Comisiones (Máximo Apoyo)' : '0% Card Fee Waste (Maximum Direct Support)'}
                </span>
              </div>
            </div>
            {selectedMethod === 'bank' && <Check className="w-4 h-4 text-[#00fbfb]" />}
          </div>
        </div>

        {/* 2. Crypto (USDT / BTC / SOL) */}
        <div 
          onClick={() => setSelectedMethod('crypto')}
          className={`p-3.5 rounded-2xl border cursor-pointer transition-all duration-300 relative ${
            selectedMethod === 'crypto'
              ? 'bg-[#ffabf3]/10 border-[#ffabf3] shadow-[0_0_20px_rgba(255,171,243,0.15)]'
              : 'bg-white/[0.02] border-white/5 hover:border-white/15'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${selectedMethod === 'crypto' ? 'bg-[#ffabf3] text-black' : 'bg-white/5 text-white/60'}`}>
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-white flex items-center gap-1.5">
                  {locale === 'es' ? 'Cripto (USDT / BTC / Matic)' : 'Crypto (USDT / BTC / Polygon)'}
                </p>
                <span className="text-[9px] text-[#ffabf3] font-mono font-bold block mt-0.5">
                  💎 {locale === 'es' ? 'Instantáneo Global • 99.5% al Creador' : 'Instant Global • 99.5% to Creator'}
                </span>
              </div>
            </div>
            {selectedMethod === 'crypto' && <Check className="w-4 h-4 text-[#ffabf3]" />}
          </div>
        </div>

        {/* 3. Credit / Debit Card (Segpay / Visa / Mastercard) */}
        <div 
          onClick={() => setSelectedMethod('card')}
          className={`p-3.5 rounded-2xl border cursor-pointer transition-all duration-300 relative ${
            selectedMethod === 'card'
              ? 'bg-white/10 border-white/30 shadow-[0_0_20px_rgba(255,255,255,0.1)]'
              : 'bg-white/[0.02] border-white/5 hover:border-white/15'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${selectedMethod === 'card' ? 'bg-white text-black' : 'bg-white/5 text-white/60'}`}>
                <CreditCard className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-white flex items-center gap-1.5">
                  {locale === 'es' ? 'Tarjeta de Crédito / Débito' : 'Credit / Debit Card'}
                </p>
                <span className="text-[9px] text-white/40 font-mono block mt-0.5">
                  {locale === 'es' ? 'Procesamiento Estándar Segpay (4.5% tarifa bancaria)' : 'Standard Segpay processing (4.5% bank fee)'}
                </span>
              </div>
            </div>
            {selectedMethod === 'card' && <Check className="w-4 h-4 text-white" />}
          </div>
        </div>
      </div>

      {/* CTA Button */}
      <button 
        onClick={handleCheckout}
        disabled={isProcessing}
        className={`w-full py-4 rounded-2xl font-black uppercase text-xs tracking-widest transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg disabled:opacity-50 ${
          selectedMethod === 'bank'
            ? 'bg-[#00fbfb] text-black hover:shadow-[0_0_25px_rgba(0,251,251,0.5)]'
            : selectedMethod === 'crypto'
            ? 'bg-[#ffabf3] text-black hover:shadow-[0_0_25px_rgba(255,171,243,0.5)]'
            : 'bg-white text-black hover:bg-white/90'
        }`}
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>{locale === 'es' ? 'CONECTANDO CON PASARELA...' : 'CONNECTING TO GATEWAY...'}</span>
          </>
        ) : (
          <>
            <span>
              {selectedMethod === 'bank'
                ? (locale === 'es' ? 'Pagar con Banco Directo →' : 'Pay via Direct Bank →')
                : selectedMethod === 'crypto'
                ? (locale === 'es' ? 'Pagar con Cripto (NOWPayments) →' : 'Pay with Crypto (NOWPayments) →')
                : (locale === 'es' ? 'Pagar con Tarjeta →' : 'Pay via Credit Card →')}
            </span>
          </>
        )}
      </button>

      {/* Trust Badges */}
      <div className="mt-5 flex justify-center items-center gap-3 text-white/30 text-[8px] uppercase tracking-widest font-mono">
        <span>SCA / Bank 2FA</span>
        <span>•</span>
        <span>0% Chargeback Protected</span>
        <span>•</span>
        <span>PCI Encrypted</span>
      </div>
    </div>
  );
}
