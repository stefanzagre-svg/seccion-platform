'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Crown, Sparkles, Zap, ShieldCheck, Check, 
  Trash2, RefreshCw, DollarSign, ArrowUpRight, Lock 
} from 'lucide-react';
import Link from 'next/link';
import BlurredFaceImage from '@/components/BlurredFaceImage';
import { useTranslation } from '@/context/LanguageContext';

export interface MemberSubscriptionItem {
  id: string;
  creatorId: string;
  creatorName: string;
  avatarUrl?: string;
  tier: 'vip' | 'master';
  monthlyPrice: number;
  status: 'active' | 'cancelled' | 'expiring';
  nextBillingDate: string;
  autoRenew: boolean;
  unlockedPerks: string[];
}

interface MemberRosterTabProps {
  subscriptions: MemberSubscriptionItem[];
  onToggleAutoRenew: (subId: string, currentStatus: boolean) => Promise<void>;
  onCancelSubscription: (subId: string) => Promise<void>;
  onManagePledge?: (subId: string) => void;
}

export default function MemberRosterTab({
  subscriptions,
  onToggleAutoRenew,
  onCancelSubscription,
  onManagePledge
}: MemberRosterTabProps) {
  const { locale } = useTranslation();

  const totalMonthlySpend = subscriptions
    .filter(s => s.status === 'active')
    .reduce((sum, s) => sum + s.monthlyPrice, 0);

  return (
    <div className="space-y-8 animate-fade-in text-left">
      {/* ─── Top Hero Summary Card ───────────────────────────────────────── */}
      <div className="p-6 sm:p-8 rounded-[2.5rem] bg-gradient-to-br from-white/[0.04] via-black/60 to-white/[0.01] border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.6)] backdrop-blur-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <Crown className="w-4 h-4" />
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                {locale === 'es' ? 'Tu Roster & Suscripciones VIP' : 'Active Roster & VIP Subscriptions'}
              </h2>
            </div>
            <p className="text-xs text-[#b9cac9] max-w-xl leading-relaxed">
              {locale === 'es'
                ? 'Gestiona tus patrocinios VIP y Master directos con creadores. Tu apoyo asegura contenido exclusivo, transmisiones privadas y 90% de comisión directa para ellos.'
                : 'Manage your direct VIP and Master tier creator sponsorships. Your pledge unlocks full private access and direct 90% revenue support for creators.'}
            </p>
          </div>

          {/* Monthly Spend Pill */}
          <div className="p-4 rounded-2xl bg-black/60 border border-white/10 shrink-0">
            <p className="text-[9px] uppercase font-mono font-bold text-white/50">
              {locale === 'es' ? 'Aporte Mensual Activo' : 'Active Monthly Pledge'}
            </p>
            <p className="text-2xl font-black text-amber-400 font-mono mt-0.5">
              ${totalMonthlySpend.toFixed(2)}
              <span className="text-xs text-white/40 font-sans"> / mo</span>
            </p>
          </div>
        </div>
      </div>

      {/* ─── Subscriptions List ───────────────────────────────────────────── */}
      <div className="space-y-4">
        <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
          <span>{locale === 'es' ? 'Creadores en tu Roster' : 'Creators in Your Roster'}</span>
          <span className="text-xs text-white/40 font-mono">({subscriptions.length})</span>
        </h3>

        {subscriptions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {subscriptions.map((sub) => {
              const isMaster = sub.tier === 'master';

              return (
                <div
                  key={sub.id}
                  className="p-6 rounded-[2rem] bg-white/[0.02] border border-white/5 hover:border-white/15 transition-all duration-300 flex flex-col justify-between space-y-4"
                >
                  {/* Creator Header */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl overflow-hidden border border-white/10 bg-black/40 relative">
                        <BlurredFaceImage
                          src={sub.avatarUrl}
                          alt={sub.creatorName}
                          sharedScore={90}
                          className="w-full h-full"
                        />
                      </div>
                      <div>
                        <Link 
                          href={`/profile/${sub.creatorId}`}
                          className="text-sm font-black text-white hover:text-primary transition flex items-center gap-1"
                        >
                          <span>@{sub.creatorName}</span>
                          <ArrowUpRight className="w-3 h-3 text-white/40" />
                        </Link>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                            isMaster
                              ? 'bg-amber-500/15 border border-amber-500/30 text-amber-400'
                              : 'bg-primary/15 border border-primary/30 text-primary'
                          }`}>
                            {sub.tier.toUpperCase()} TIER
                          </span>
                          <span className="text-[10px] text-white/40 font-mono">
                            ${sub.monthlyPrice.toFixed(2)}/mo
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Auto-renew switch */}
                    <button
                      onClick={() => onToggleAutoRenew(sub.id, sub.autoRenew)}
                      className={`px-3 py-1.5 rounded-xl border text-[9px] font-mono font-bold uppercase transition flex items-center gap-1.5 cursor-pointer ${
                        sub.autoRenew
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                          : 'bg-white/5 border-white/10 text-white/40'
                      }`}
                    >
                      <RefreshCw className={`w-3 h-3 ${sub.autoRenew ? 'animate-spin-slow' : ''}`} />
                      <span>{sub.autoRenew ? (locale === 'es' ? 'Renovación ON' : 'Auto-Renew ON') : (locale === 'es' ? 'Renovación OFF' : 'Auto-Renew OFF')}</span>
                    </button>
                  </div>

                  {/* Perks Summary */}
                  <div className="p-3.5 rounded-2xl bg-black/40 border border-white/5 text-[11px] text-[#b9cac9] space-y-1.5 font-medium">
                    <div className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-primary shrink-0" />
                      <span>{locale === 'es' ? 'Acceso a todas las fotos y videos privados' : 'Full access to private photos & albums'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-primary shrink-0" />
                      <span>{locale === 'es' ? 'Transmisiones en vivo exclusivas y chat VIP' : 'Exclusive VIP live streams & priority chat'}</span>
                    </div>
                    {isMaster && (
                      <div className="flex items-center gap-2 text-amber-300">
                        <Crown className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span>{locale === 'es' ? 'Mensajes directos prioritarios 1-a-1' : '1-on-1 priority direct messaging'}</span>
                      </div>
                    )}
                  </div>

                  {/* Footer Action */}
                  <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[10px] text-white/40 font-mono">
                    <span>
                      {locale === 'es' ? 'Próxima facturación:' : 'Next billing:'} {sub.nextBillingDate}
                    </span>
                    <button
                      onClick={() => onCancelSubscription(sub.id)}
                      className="text-red-400 hover:text-red-300 transition cursor-pointer flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>{locale === 'es' ? 'Cancelar' : 'Cancel'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 rounded-3xl bg-white/[0.01] border border-white/5 text-center text-[#b9cac9] text-xs space-y-3">
            <Crown className="w-8 h-8 text-white/30 mx-auto" />
            <p>
              {locale === 'es'
                ? 'No tienes suscripciones activas en tu Roster. Apoya a creadores para desbloquear su contenido exclusivo.'
                : 'No active subscriptions in your Roster. Sponsor creators from the Feed to unlock their private vaults.'}
            </p>
            <Link
              href="/feed"
              className="inline-block py-2.5 px-6 rounded-xl bg-gradient-to-r from-[#00fbfb] to-[#ffabf3] text-black font-mono text-[10px] font-black uppercase tracking-wider hover:shadow-[0_0_15px_rgba(0,251,251,0.4)] transition"
            >
              {locale === 'es' ? 'Explorar Creadores' : 'Explore Creators'}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
