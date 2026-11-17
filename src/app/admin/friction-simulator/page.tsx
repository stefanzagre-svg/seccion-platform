'use client';

import React, { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Activity,
  AlertTriangle,
  Bot,
  Check,
  Copy,
  Database,
  Gauge,
  Loader2,
  RefreshCw,
  Send,
  ShieldCheck,
  Sparkles,
  TrendingDown,
  UserCheck,
} from 'lucide-react';
import {
  PRESET_PERSONAS,
  type CryptoFamiliarity,
  type FunnelStepId,
  type PaymentPreference,
  type PersonaDevice,
  type PersonaIntent,
  type PersonaRole,
  type PersonaSimulationReport,
  type PersonaSpec,
  buildKateFollowUpForStalledStep,
  inferPersonaFromCrmLead,
  simulatePersonaFriction,
} from '@/lib/friction-simulator';
import type { TelemetryTrailItem } from '@/lib/funnel-telemetry-server';

interface TelemetryMeta {
  useLiveTelemetry: boolean;
  cohortEvents: number;
  cohortSessions: number;
  vipCode: string | null;
  vipTrail: TelemetryTrailItem[];
  latestStalledStep: FunnelStepId | null;
}

const SEVERITY_BADGE: Record<string, string> = {
  low: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  medium: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  high: 'bg-orange-500/15 text-orange-300 border-orange-500/30',
  critical: 'bg-red-500/20 text-red-300 border-red-500/40',
};

const SEVERITY_BAR: Record<string, string> = {
  low: 'bg-emerald-400',
  medium: 'bg-amber-400',
  high: 'bg-orange-400',
  critical: 'bg-red-500',
};

const SOURCE_BADGE: Record<string, string> = {
  known_prior: 'bg-white/10 text-white/70 border-white/15',
  blended: 'bg-[#00fbfb]/15 text-[#00fbfb] border-[#00fbfb]/30',
  empirical_dominant: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
};

function FrictionSimulatorContent() {
  const searchParams = useSearchParams();

  const initialPersona = useMemo<PersonaSpec>(() => {
    const hasLeadParams =
      searchParams.get('city') ||
      searchParams.get('name') ||
      searchParams.get('ig') ||
      searchParams.get('tt') ||
      searchParams.get('email');

    if (hasLeadParams) {
      return inferPersonaFromCrmLead(
        {
          full_name: searchParams.get('name'),
          email: searchParams.get('email'),
          city: searchParams.get('city'),
          instagram_handle: searchParams.get('ig'),
          tiktok_handle: searchParams.get('tt'),
          status: searchParams.get('status'),
        },
        searchParams.get('vipCode') ? { code: searchParams.get('vipCode') } : null
      );
    }

    const presetKey = searchParams.get('preset');
    if (presetKey && PRESET_PERSONAS[presetKey]) {
      return PRESET_PERSONAS[presetKey];
    }
    return PRESET_PERSONAS.colombia_ig_creator;
  }, [searchParams]);

  return (
    <FrictionSimulatorWorkspace
      key={searchParams.toString() || 'default'}
      initialPersona={initialPersona}
    />
  );
}

function FrictionSimulatorWorkspace({ initialPersona }: { initialPersona: PersonaSpec }) {
  const [persona, setPersona] = useState<PersonaSpec>(initialPersona);
  const [useLiveTelemetry, setUseLiveTelemetry] = useState(true);
  const [report, setReport] = useState<PersonaSimulationReport>(() =>
    simulatePersonaFriction(initialPersona)
  );
  const [telemetryMeta, setTelemetryMeta] = useState<TelemetryMeta>({
    useLiveTelemetry: true,
    cohortEvents: 0,
    cohortSessions: 0,
    vipCode: initialPersona.vipCode || null,
    vipTrail: [],
    latestStalledStep: null,
  });
  const [globalOverview, setGlobalOverview] = useState<{
    totalEvents: number;
    uniqueSessions: number;
  }>({ totalEvents: 0, uniqueSessions: 0 });
  const [isSimulating, setIsSimulating] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [selectedRecoveryStep, setSelectedRecoveryStep] = useState<FunnelStepId>(() => {
    const initialReport = simulatePersonaFriction(initialPersona);
    return initialPersona.stalledAtStep || initialReport.highestFrictionStep.stepId;
  });

  const runServerSimulation = useCallback(
    async (spec: PersonaSpec, liveFlag: boolean, optimistic = true) => {
      if (optimistic) {
        const localReport = simulatePersonaFriction(spec);
        setReport(localReport);
        setSelectedRecoveryStep(spec.stalledAtStep || localReport.highestFrictionStep.stepId);
      }

      setIsSimulating(true);
      try {
        const res = await fetch('/api/admin/friction-simulate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            persona: spec,
            vipCode: spec.vipCode || undefined,
            useLiveTelemetry: liveFlag,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.ok && data.report) {
            setReport(data.report);
            if (data.telemetryMeta) {
              setTelemetryMeta(data.telemetryMeta);
              if (data.telemetryMeta.latestStalledStep) {
                setSelectedRecoveryStep(data.telemetryMeta.latestStalledStep);
              }
            }
          }
        }
      } catch (err) {
        console.error('Server friction simulation failed, keeping local CRO prior:', err);
      } finally {
        setIsSimulating(false);
      }
    },
    []
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [overviewRes, simRes] = await Promise.all([
          fetch('/api/admin/friction-simulate'),
          fetch('/api/admin/friction-simulate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              persona: initialPersona,
              vipCode: initialPersona.vipCode || undefined,
              useLiveTelemetry: true,
            }),
          }),
        ]);

        if (cancelled) return;

        if (overviewRes.ok) {
          const overviewData = await overviewRes.json();
          if (!cancelled && overviewData?.telemetryOverview) {
            setGlobalOverview(overviewData.telemetryOverview);
          }
        }

        if (simRes.ok) {
          const simData = await simRes.json();
          if (!cancelled && simData?.ok && simData?.report) {
            setReport(simData.report);
            if (simData.telemetryMeta) {
              setTelemetryMeta(simData.telemetryMeta);
              if (simData.telemetryMeta.latestStalledStep) {
                setSelectedRecoveryStep(simData.telemetryMeta.latestStalledStep);
              }
            }
          }
        }
      } catch {
        // Keep local CRO prior report silently on initial network failure
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [initialPersona]);

  const copyText = (key: string, text: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    }
  };

  const liveRecoveryCopy = useMemo(
    () => buildKateFollowUpForStalledStep(report.persona, selectedRecoveryStep),
    [report.persona, selectedRecoveryStep]
  );

  return (
    <div className="space-y-8 text-left">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="font-['Outfit'] text-2xl sm:text-3xl font-black text-white tracking-tight uppercase flex items-center gap-3">
            <Gauge className="w-7 h-7 text-[#00fbfb]" />
            Persona Friction Simulator &amp; VIP Tracker
          </h1>
          <p className="text-xs text-white/50 mt-1 max-w-2xl">
            Predict step-by-step drop-off rates across Known CRO Priors blended with live real-user &amp;{' '}
            <code className="text-[#ffabf3]">/vip/[code]</code> funnel telemetry so Kate can adapt outreach before friction hits.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-[10px] font-mono flex items-center gap-2 text-white/80">
            <Database className="w-3.5 h-3.5 text-[#00fbfb]" />
            <span>
              Global Telemetry: <strong className="text-white">{globalOverview.totalEvents}</strong> events (
              <strong className="text-[#00fbfb]">{globalOverview.uniqueSessions}</strong> sessions)
            </span>
          </div>

          <button
            type="button"
            onClick={() => {
              const next = !useLiveTelemetry;
              setUseLiveTelemetry(next);
              void runServerSimulation(persona, next);
            }}
            className={`px-3.5 py-2 rounded-xl border text-[10px] font-mono font-bold uppercase tracking-wider transition cursor-pointer flex items-center gap-2 ${
              useLiveTelemetry
                ? 'bg-[#00fbfb]/15 border-[#00fbfb]/40 text-[#00fbfb]'
                : 'bg-white/5 border-white/10 text-white/50'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            {useLiveTelemetry ? 'Live Bayesian Blend: ON' : 'Known CRO Priors Only'}
          </button>
        </div>
      </div>

      {/* Preset Selector */}
      <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-2.5">
        <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-white/50 block">
          Quick Demographic Presets
        </span>
        <div className="flex flex-wrap gap-2">
          {Object.entries(PRESET_PERSONAS).map(([key, spec]) => {
            const isSelected = persona.id === spec.id;
            return (
              <button
                key={key}
                type="button"
                onClick={() => {
                  setPersona(spec);
                  runServerSimulation(spec, useLiveTelemetry);
                }}
                className={`px-3.5 py-2 rounded-xl border text-xs font-semibold transition cursor-pointer ${
                  isSelected
                    ? 'bg-[#ffabf3]/15 border-[#ffabf3]/50 text-white'
                    : 'bg-white/[0.03] border-white/10 text-white/70 hover:text-white hover:border-white/25'
                }`}
              >
                {spec.name || key}
              </button>
            );
          })}
        </div>
      </div>

      {/* Persona Configurator + Summary KPIs */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Left: Persona Builder */}
        <div className="xl:col-span-5 p-6 rounded-3xl bg-[#0F0F1A]/80 border border-white/10 space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <h2 className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-[#ffabf3]" />
              Target Persona Parameters
            </h2>
            <button
              type="button"
              onClick={() => runServerSimulation(persona, useLiveTelemetry)}
              disabled={isSimulating}
              className="px-3.5 py-1.5 rounded-xl bg-[#00fbfb] text-black text-[10px] font-mono font-black uppercase tracking-wider hover:brightness-110 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isSimulating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
              Simulate
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <label className="text-[10px] font-mono uppercase text-white/40 block mb-1">Role</label>
              <select
                value={persona.role}
                onChange={(e) => setPersona({ ...persona, role: e.target.value as PersonaRole })}
                className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:border-[#00fbfb]"
              >
                <option value="creator">Creator</option>
                <option value="member">Member</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-mono uppercase text-white/40 block mb-1">Age</label>
              <input
                type="number"
                min={18}
                max={85}
                value={persona.age}
                onChange={(e) => setPersona({ ...persona, age: Math.max(18, Number(e.target.value) || 18) })}
                className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:border-[#00fbfb]"
              />
            </div>

            <div>
              <label className="text-[10px] font-mono uppercase text-white/40 block mb-1">Country (ISO-2)</label>
              <input
                type="text"
                maxLength={2}
                value={persona.country}
                onChange={(e) => setPersona({ ...persona, country: e.target.value.toUpperCase() })}
                placeholder="CO, MA, ES, FR, US..."
                className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-white font-mono uppercase outline-none focus:border-[#00fbfb]"
              />
            </div>

            <div>
              <label className="text-[10px] font-mono uppercase text-white/40 block mb-1">Origins / City</label>
              <input
                type="text"
                value={persona.origins}
                onChange={(e) => setPersona({ ...persona, origins: e.target.value })}
                placeholder="Medellín, Colombia"
                className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:border-[#00fbfb]"
              />
            </div>

            <div>
              <label className="text-[10px] font-mono uppercase text-white/40 block mb-1">Language</label>
              <select
                value={persona.language}
                onChange={(e) =>
                  setPersona({ ...persona, language: e.target.value as PersonaSpec['language'] })
                }
                className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:border-[#00fbfb]"
              >
                <option value="es">Spanish (ES)</option>
                <option value="en">English (EN)</option>
                <option value="fr">French (FR)</option>
                <option value="ro">Romanian (RO)</option>
                <option value="pl">Polish (PL)</option>
                <option value="pt">Portuguese (PT)</option>
                <option value="de">German (DE)</option>
                <option value="ar">Arabic / Darija (AR)</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-mono uppercase text-white/40 block mb-1">Device / Browser</label>
              <select
                value={persona.device}
                onChange={(e) => setPersona({ ...persona, device: e.target.value as PersonaDevice })}
                className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:border-[#00fbfb]"
              >
                <option value="mobile_ig_webview">Instagram In-App Browser</option>
                <option value="mobile_tiktok_webview">TikTok In-App Browser</option>
                <option value="mobile_safari">iPhone Safari</option>
                <option value="mobile_chrome">Android Chrome</option>
                <option value="desktop_chrome">Desktop Chrome</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-mono uppercase text-white/40 block mb-1">Intent</label>
              <select
                value={persona.intent}
                onChange={(e) => setPersona({ ...persona, intent: e.target.value as PersonaIntent })}
                className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:border-[#00fbfb]"
              >
                <option value="sensual_glamour">Sensual / Glamour</option>
                <option value="18+_adult">18+ Explicit / Adult</option>
                <option value="lifestyle_sfw">Lifestyle (Non-Explicit)</option>
                <option value="coaching_mentorship">Coaching / Mentorship</option>
                <option value="romance_connection">Romance / Social Connection</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-mono uppercase text-white/40 block mb-1">Payment / Payout Pref</label>
              <select
                value={persona.paymentPreference}
                onChange={(e) =>
                  setPersona({ ...persona, paymentPreference: e.target.value as PaymentPreference })
                }
                className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:border-[#00fbfb]"
              >
                <option value="instant_bank">Instant Bank / SEPA / Wise</option>
                <option value="card">Card / Apple Pay</option>
                <option value="crypto_usdc">Digital USD (USDC)</option>
                <option value="local_bank_rib">Morocco Bank (RIB Formule 5)</option>
                <option value="epin_paypal">PayPal E-Pin</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-mono uppercase text-white/40 block mb-1">Crypto Familiarity</label>
              <select
                value={persona.cryptoFamiliarity}
                onChange={(e) =>
                  setPersona({ ...persona, cryptoFamiliarity: e.target.value as CryptoFamiliarity })
                }
                className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:border-[#00fbfb]"
              >
                <option value="none">None (Beginner)</option>
                <option value="basic">Basic</option>
                <option value="experienced">Experienced</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-mono uppercase text-white/40 block mb-1">VIP Tracking Code (Optional)</label>
              <input
                type="text"
                value={persona.vipCode || ''}
                onChange={(e) => setPersona({ ...persona, vipCode: e.target.value || undefined })}
                placeholder="e.g. sofia-vip90"
                className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-white font-mono outline-none focus:border-[#00fbfb]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2">
            <label className="flex items-center gap-2 p-2.5 rounded-xl bg-black/30 border border-white/5 text-[11px] text-white/80 cursor-pointer">
              <input
                type="checkbox"
                checked={Boolean(persona.hasPreApprovedFastTrack)}
                onChange={(e) => setPersona({ ...persona, hasPreApprovedFastTrack: e.target.checked })}
                className="accent-[#00fbfb]"
              />
              VIP Fast-Track
            </label>
            <label className="flex items-center gap-2 p-2.5 rounded-xl bg-black/30 border border-white/5 text-[11px] text-white/80 cursor-pointer">
              <input
                type="checkbox"
                checked={persona.hasThreePhotosReady !== false}
                onChange={(e) => setPersona({ ...persona, hasThreePhotosReady: e.target.checked })}
                className="accent-[#00fbfb]"
              />
              3 Photos Ready
            </label>
            <label className="flex items-center gap-2 p-2.5 rounded-xl bg-black/30 border border-white/5 text-[11px] text-white/80 cursor-pointer">
              <input
                type="checkbox"
                checked={Boolean(persona.hasRegisteredTaxId)}
                onChange={(e) => setPersona({ ...persona, hasRegisteredTaxId: e.target.checked })}
                className="accent-[#00fbfb]"
              />
              Tax ID Ready
            </label>
          </div>
        </div>

        {/* Right: Top KPIs + Kate Pre-Emptive Outreach Playbook */}
        <div className="xl:col-span-7 space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-2xl bg-[#0F0F1A]/80 border border-white/10">
              <span className="text-[10px] font-mono uppercase text-white/40">Predicted E2E</span>
              <div className="text-2xl font-black text-emerald-400 font-mono mt-1">
                {report.predictedEndToEndConversionPct}%
              </div>
              <span className="text-[10px] text-white/50">Complete all 7 steps</span>
            </div>

            <div className="p-4 rounded-2xl bg-[#0F0F1A]/80 border border-white/10">
              <span className="text-[10px] font-mono uppercase text-white/40">Friction Score</span>
              <div className="text-2xl font-black text-white font-mono mt-1">
                {report.overallFrictionScore}/100
              </div>
              <span className="text-[10px] text-white/50">Lower = smoother</span>
            </div>

            <div className="p-4 rounded-2xl bg-[#0F0F1A]/80 border border-white/10">
              <span className="text-[10px] font-mono uppercase text-white/40">Peak Bottleneck</span>
              <div className="text-sm font-black text-red-400 mt-1 truncate">
                Step {report.highestFrictionStep.stepNumber}: {report.highestFrictionStep.dropOffPct}% drop
              </div>
              <span className="text-[10px] text-white/50 truncate block">
                {report.highestFrictionStep.title}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-[#0F0F1A]/80 border border-white/10">
              <span className="text-[10px] font-mono uppercase text-white/40">Kate Support Tier</span>
              <div className="text-xs font-black uppercase text-[#ffabf3] mt-1.5">
                {report.kateBriefing.riskTier.replace(/_/g, ' ')}
              </div>
              <span className="text-[10px] text-white/50">
                Cohort n={telemetryMeta.cohortSessions}
              </span>
            </div>
          </div>

          {/* Kate Playbook Card */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-[#ffabf3]/10 via-[#0F0F1A] to-[#00fbfb]/10 border border-[#ffabf3]/30 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-2">
                <Bot className="w-4 h-4 text-[#ffabf3]" />
                Kate Pre-Emptive Outreach &amp; Stalled-Step Playbook
              </h2>
              <button
                type="button"
                onClick={() => copyText('fast_url', report.kateBriefing.recommendedFastTrackUrl)}
                className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-[10px] font-mono text-[#00fbfb] font-bold flex items-center gap-1.5 cursor-pointer"
              >
                {copiedKey === 'fast_url' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                Copy Fast-Track URL
              </button>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase text-white/50">
                  1. Pre-Emptive DM Addendum (Send Before They Click)
                </span>
                <button
                  type="button"
                  onClick={() => copyText('dm_addendum', report.kateBriefing.tailoredDmAddendum)}
                  className="text-[10px] font-mono text-[#ffabf3] hover:text-white flex items-center gap-1 cursor-pointer"
                >
                  {copiedKey === 'dm_addendum' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  {copiedKey === 'dm_addendum' ? 'Copied' : 'Copy DM'}
                </button>
              </div>
              <div className="p-3.5 rounded-2xl bg-black/50 border border-white/10 text-xs text-white/90 leading-relaxed">
                {report.kateBriefing.tailoredDmAddendum}
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono uppercase text-white/50">
                    2. Stalled-Step Recovery Message for Step:
                  </span>
                  <select
                    value={selectedRecoveryStep}
                    onChange={(e) => setSelectedRecoveryStep(e.target.value as FunnelStepId)}
                    className="bg-black/60 border border-white/15 rounded-lg px-2 py-1 text-[10px] text-white font-mono outline-none"
                  >
                    {report.steps.map((s) => (
                      <option key={s.stepId} value={s.stepId}>
                        {s.stepNumber}. {s.title}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  type="button"
                  onClick={() => copyText('recovery', liveRecoveryCopy)}
                  className="text-[10px] font-mono text-[#00fbfb] hover:text-white flex items-center gap-1 cursor-pointer"
                >
                  {copiedKey === 'recovery' ? <Check className="w-3 h-3" /> : <Send className="w-3 h-3" />}
                  {copiedKey === 'recovery' ? 'Copied' : 'Copy Recovery Follow-Up'}
                </button>
              </div>
              <div className="p-3.5 rounded-2xl bg-black/50 border border-white/10 text-xs text-white/90 leading-relaxed">
                {liveRecoveryCopy}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 7-Step Friction & Survival Waterfall */}
      <div className="p-6 rounded-3xl bg-[#0F0F1A]/80 border border-white/10 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/5 pb-4">
          <div>
            <h2 className="text-base font-black uppercase tracking-wider text-white flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-[#00fbfb]" />
              7-Step Funnel Friction Breakdown &amp; Survival Waterfall
            </h2>
            <p className="text-xs text-white/50 mt-0.5">
              Each step blends known CRO priors with real observed sessions (Bayesian prior weight N₀ = 20).
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {report.steps.map((step) => (
            <div
              key={step.stepId}
              className="p-4 sm:p-5 rounded-2xl bg-black/40 border border-white/10 space-y-3"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center font-mono text-xs font-black text-white shrink-0">
                    {step.stepNumber}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-black text-white">{step.title}</h3>
                      <span
                        className={`text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded-full border ${
                          SEVERITY_BADGE[step.severity]
                        }`}
                      >
                        {step.severity} · {step.dropOffPct}% drop-off
                      </span>
                      <span
                        className={`text-[9px] font-mono px-2 py-0.5 rounded-full border ${
                          SOURCE_BADGE[step.dataSource]
                        }`}
                      >
                        {step.dataSource === 'known_prior'
                          ? 'Known CRO Prior'
                          : `${step.dataSource.replace('_', ' ')} (n=${step.observedSampleSize})`}
                      </span>
                    </div>
                    <p className="text-[11px] text-white/40 font-mono mt-0.5">{step.route}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right">
                    <span className="text-[9px] font-mono uppercase text-white/40 block">
                      Cumulative Survival
                    </span>
                    <span className="text-base font-black font-mono text-emerald-400">
                      {step.cumulativeSurvivalPct}%
                    </span>
                  </div>
                  <div className="w-32 h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${SEVERITY_BAR[step.severity]} transition-all duration-500`}
                      style={{ width: `${Math.min(100, step.dropOffPct)}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 border-t border-white/5 text-xs">
                <div className="space-y-1">
                  <span className="text-[9px] font-mono uppercase text-white/40 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3 text-amber-400" /> Why Friction Happens
                  </span>
                  <ul className="space-y-1 text-white/75 list-disc list-inside">
                    {step.triggers.map((trig, idx) => (
                      <li key={idx}>{trig}</li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-1">
                  <span className="text-[9px] font-mono uppercase text-white/40 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-[#00fbfb]" /> Platform UX Fix
                  </span>
                  <ul className="space-y-1 text-white/75 list-disc list-inside">
                    {step.uxFixes.map((fix, idx) => (
                      <li key={idx}>{fix}</li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-1">
                  <span className="text-[9px] font-mono uppercase text-white/40 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-[#ffabf3]" /> Kate Neutralizer
                  </span>
                  <p className="text-[#ffabf3]/90">{step.kateAction}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Live VIP Trail (When inspecting a VIP code with events) */}
      {telemetryMeta.vipCode && (
        <div className="p-6 rounded-3xl bg-[#0F0F1A]/80 border border-[#00fbfb]/25 space-y-3">
          <h3 className="text-sm font-black uppercase tracking-wider text-white">
            Live Telemetry Trail for VIP Code:{' '}
            <code className="text-[#00fbfb]">{telemetryMeta.vipCode}</code>
          </h3>
          {telemetryMeta.vipTrail.length === 0 ? (
            <p className="text-xs text-white/50">
              No live click events recorded yet for this VIP invite code. Once clicked on seccion.ai/vip/{telemetryMeta.vipCode}, each step will appear here automatically.
            </p>
          ) : (
            <div className="space-y-2">
              {telemetryMeta.vipTrail.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-black/40 border border-white/5 flex flex-wrap items-center justify-between gap-2 text-xs font-mono"
                >
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-[#00fbfb]/15 text-[#00fbfb]">
                      {item.step}
                    </span>
                    <span className="text-white font-bold">{item.action}</span>
                    {item.detail && <span className="text-white/50">({item.detail})</span>}
                  </div>
                  <div className="text-white/40">
                    {item.country} · {item.device} · {new Date(item.createdAt).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function AdminFrictionSimulatorPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-8 h-8 animate-spin text-[#00fbfb]" />
        </div>
      }
    >
      <FrictionSimulatorContent />
    </Suspense>
  );
}
