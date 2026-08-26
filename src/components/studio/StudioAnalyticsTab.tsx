'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, DollarSign, TrendingUp, Users, 
  ArrowUpRight, ShieldCheck, Zap, Sparkles, 
  CheckCircle2, Clock, Wallet 
} from 'lucide-react';
import { useTranslation } from '@/context/LanguageContext';

export interface CreatorPayoutItem {
  id: string;
  period: string;
  grossAmount: number;
  netPayout: number;
  channel: 'NOWPayments (USDT/BTC)' | 'Segpay Card';
  status: 'released' | 'escrow_pending' | 'processing';
  releasedAt?: string;
}

interface StudioAnalyticsTabProps {
  grossRevenue: number;
  netRevenue: number;
  commissionRate: number; // e.g. 0.90 for 90%
  activeSubscribers: number;
  conversionRate: number;
  payouts: CreatorPayoutItem[];
  walletAddress?: string;
  onUpdatePayoutWallet?: (address: string) => void;
}

export default function StudioAnalyticsTab({
  grossRevenue,
  netRevenue,
  commissionRate = 0.90,
  activeSubscribers,
  conversionRate,
  payouts,
  walletAddress,
  onUpdatePayoutWallet
}: StudioAnalyticsTabProps) {
  const { locale } = useTranslation();

  return (
    <div className="space-y-8 animate-fade-in text-left">
      
      {/* ─── Top 90% Revenue Split Hero ──────────────────────────────────── */}
      <div className="p-6 sm:p-8 rounded-[2.5rem] bg-gradient-to-br from-white/[0.04] via-black/60 to-white/[0.01] border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.6)] backdrop-blur-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <BarChart3 className="w-4 h-4" />
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                {locale === 'es' ? 'Rendimiento Financiero & Escrow' : 'Creator Revenue & Escrow Analytics'}
              </h2>
            </div>
            <p className="text-xs text-[#b9cac9] max-w-xl leading-relaxed">
              {locale === 'es'
                ? `Disfruta del ${Math.round(commissionRate * 100)}% de comisión neta directa en todas tus suscripciones, propinas y ventas PPV. Liquidaciones transparentes protegidas por contrato inteligente.`
                : `Benefit from ${Math.round(commissionRate * 100)}% net revenue payout across all subscriptions, tips, and PPV unlocks. Fast, transparent payouts backed by automated escrow.`}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-4 py-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-center">
              <span className="text-[9px] uppercase font-bold block">{locale === 'es' ? 'Comisión Neta' : 'Net Take-Home'}</span>
              <span className="text-2xl font-black">{Math.round(commissionRate * 100)}%</span>
            </div>
          </div>
        </div>

        {/* ─── Metric Cards Grid ─────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-white/5">
          <div className="p-4 rounded-2xl bg-black/40 border border-white/5">
            <p className="text-[9px] uppercase font-mono font-bold text-white/50">{locale === 'es' ? 'Ganancias Brutas' : 'Gross Volume'}</p>
            <p className="text-xl font-black text-white font-mono mt-1">${grossRevenue.toFixed(2)}</p>
          </div>

          <div className="p-4 rounded-2xl bg-black/40 border border-white/5">
            <p className="text-[9px] uppercase font-mono font-bold text-emerald-400/70">{locale === 'es' ? 'Tu Pago Neto (90%)' : 'Net Payout'}</p>
            <p className="text-xl font-black text-emerald-400 font-mono mt-1">${netRevenue.toFixed(2)}</p>
          </div>

          <div className="p-4 rounded-2xl bg-black/40 border border-white/5">
            <p className="text-[9px] uppercase font-mono font-bold text-white/50">{locale === 'es' ? 'Suscriptores Activos' : 'Active Sponsors'}</p>
            <p className="text-xl font-black text-primary font-mono mt-1">{activeSubscribers}</p>
          </div>

          <div className="p-4 rounded-2xl bg-black/40 border border-white/5">
            <p className="text-[9px] uppercase font-mono font-bold text-white/50">{locale === 'es' ? 'Conversión de Feed' : 'Conversion Rate'}</p>
            <p className="text-xl font-black text-white font-mono mt-1">{conversionRate.toFixed(1)}%</p>
          </div>
        </div>
      </div>

      {/* ─── Payout Wallet & Tranches ────────────────────────────────────── */}
      <div className="p-6 rounded-[2rem] bg-white/[0.02] border border-white/5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-2">
            <Wallet className="w-4 h-4 text-primary" />
            <span>{locale === 'es' ? 'Historial de Liquidaciones & Escrow' : 'Escrow Payouts & Settlement History'}</span>
          </h3>

          {walletAddress && (
            <span className="text-[9px] font-mono text-white/50 bg-black/50 px-3 py-1 rounded-xl border border-white/10">
              {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
            </span>
          )}
        </div>

        {payouts.length > 0 ? (
          <div className="space-y-2.5">
            {payouts.map((payout) => (
              <div
                key={payout.id}
                className="p-4 rounded-2xl bg-black/40 border border-white/5 hover:border-white/15 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-white">{payout.period}</p>
                    <span className="text-[8px] font-mono uppercase bg-white/5 px-2 py-0.5 rounded text-white/50">
                      {payout.channel}
                    </span>
                  </div>
                  <p className="text-[10px] text-white/40 font-mono mt-0.5">
                    Gross: ${payout.grossAmount.toFixed(2)} • Net: ${payout.netPayout.toFixed(2)}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className={`px-3 py-1 rounded-full text-[9px] font-mono font-black uppercase tracking-wider ${
                    payout.status === 'released'
                      ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                      : payout.status === 'processing'
                      ? 'bg-amber-500/10 border border-amber-500/30 text-amber-400'
                      : 'bg-primary/10 border border-primary/30 text-primary'
                  }`}>
                    {payout.status.replace('_', ' ')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 rounded-2xl bg-black/30 border border-white/5 text-center text-[#b9cac9] text-xs">
            {locale === 'es' ? 'Las liquidaciones se ejecutan automáticamente cada ciclo de facturación vía NOWPayments USDT / Segpay.' : 'Payout settlements process automatically every billing cycle via NOWPayments USDT / Segpay.'}
          </div>
        )}
      </div>
    </div>
  );
}
