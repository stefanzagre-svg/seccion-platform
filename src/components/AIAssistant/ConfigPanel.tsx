'use client';

import React from 'react';
import {
  Brain, MessageSquare, ShieldCheck, FileText,
  Loader2, Zap, AlertTriangle, Lock, Users,
} from 'lucide-react';
import { MIN_MATCHES_FOR_AUTO_CHAT } from '@/lib/relationship-engine';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ConfigPanelProps {
  // Master switch
  aiAgentActive: boolean;
  setAiAgentActive: (val: boolean) => void;

  // Per-service toggles
  chatAutoEnabled: boolean;
  setChatAutoEnabled: (val: boolean) => void;
  contentOpsEnabled: boolean;
  setContentOpsEnabled: (val: boolean) => void;
  legalAuditEnabled: boolean;
  setLegalAuditEnabled: (val: boolean) => void;

  // Digital replica consent
  digitalReplicaConsent: string | null;
  setDigitalReplicaConsent: (val: string | null) => void;

  // Match count for Auto-Chat eligibility gate
  matchCount?: number;

  // Optional: instant-save callback called after each toggle (async, best-effort)
  onToggleSave?: (field: string, value: boolean | string | null) => Promise<void>;

  // Saving state indicator
  isSaving?: boolean;
}

// ─── Sub-component: Toggle Row ────────────────────────────────────────────────

interface ToggleRowProps {
  id: string;
  label: string;
  badge?: string;
  description: string;
  warning?: string;
  checked: boolean;
  /** Soft-disable: renders toggle as off + locked */
  locked?: boolean;
  /** Reason shown in tooltip when locked */
  lockedReason?: React.ReactNode;
  disabled?: boolean;
  onChange: (val: boolean) => void;
  icon: React.ReactNode;
}

function ToggleRow({
  id, label, badge, description, warning,
  checked, locked = false, lockedReason, disabled = false, onChange, icon,
}: ToggleRowProps) {
  const isInactive = disabled || locked;

  return (
    <div
      className={`flex items-center justify-between gap-4 p-4 bg-black/30 rounded-2xl border transition-all duration-300 ${
        locked
          ? 'border-amber-400/10 opacity-70'
          : 'border-white/5'
      } ${disabled && !locked ? 'opacity-40 pointer-events-none select-none' : ''}`}
    >
      <div className="flex items-start gap-3 pr-2 min-w-0">
        <div className={`mt-0.5 shrink-0 ${locked ? 'text-amber-400/60' : 'text-primary/70'}`}>
          {locked ? <Lock className="w-3.5 h-3.5" /> : icon}
        </div>
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-black uppercase tracking-widest text-white/80">
              {label}
            </span>
            {badge && (
              <span className="text-[7px] bg-white/10 text-white/50 px-1.5 py-0.5 rounded uppercase tracking-wider font-bold shrink-0">
                {badge}
              </span>
            )}
            {locked && (
              <span className="text-[7px] bg-amber-400/10 text-amber-400/80 border border-amber-400/20 px-1.5 py-0.5 rounded uppercase tracking-wider font-bold shrink-0">
                Locked
              </span>
            )}
          </div>
          <p className="text-[8px] text-white/40 uppercase tracking-widest leading-relaxed">
            {description}
          </p>
          {locked && lockedReason && (
            <div className="text-[8px] text-amber-400/70 uppercase tracking-widest font-bold flex items-center gap-1 mt-1">
              <AlertTriangle className="w-2.5 h-2.5 shrink-0" />
              {lockedReason}
            </div>
          )}
          {!locked && warning && (
            <p className="text-[8px] text-amber-400/70 uppercase tracking-widest font-bold flex items-center gap-1 mt-0.5">
              <AlertTriangle className="w-2.5 h-2.5 shrink-0" /> {warning}
            </p>
          )}
        </div>
      </div>

      {/* Toggle pill */}
      <button
        id={id}
        type="button"
        disabled={isInactive}
        aria-checked={locked ? false : checked}
        role="switch"
        onClick={() => !locked && onChange(!checked)}
        title={locked && lockedReason ? String(lockedReason) : undefined}
        className={`relative flex-none w-12 h-6 rounded-full p-1 transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 ${
          locked
            ? 'bg-white/5 cursor-not-allowed'
            : checked
              ? 'bg-primary'
              : 'bg-white/10'
        } ${disabled && !locked ? 'pointer-events-none' : ''}`}
      >
        <div
          className={`w-4 h-4 rounded-full transition-transform duration-300 ${
            locked ? 'bg-white/20 translate-x-0' : checked ? 'bg-black translate-x-6' : 'bg-black translate-x-0'
          }`}
        />
      </button>
    </div>
  );
}

// ─── Sub-component: Match Progress Bar ────────────────────────────────────────

function MatchProgressBar({ current, required }: { current: number; required: number }) {
  const pct = Math.min(100, Math.round((current / required) * 100));
  const remaining = required - current;

  return (
    <div className="mt-3 p-3 bg-amber-400/5 border border-amber-400/15 rounded-xl space-y-2">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-[8px] font-black uppercase tracking-widest text-amber-400/80">
          <Users className="w-3 h-3" />
          Match Progress
        </span>
        <span className="text-[8px] font-mono font-black text-amber-400/80">
          {current} / {required}
        </span>
      </div>

      {/* Progress track */}
      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-amber-400/60 to-amber-400 transition-all duration-700"
          style={{ width: `${pct}%` }}
        />
      </div>

      <p className="text-[7.5px] text-white/30 uppercase tracking-widest">
        {remaining} more match{remaining !== 1 ? 'es' : ''} needed to unlock auto-chat
      </p>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ConfigPanel({
  aiAgentActive, setAiAgentActive,
  chatAutoEnabled, setChatAutoEnabled,
  contentOpsEnabled, setContentOpsEnabled,
  legalAuditEnabled, setLegalAuditEnabled,
  digitalReplicaConsent, setDigitalReplicaConsent,
  matchCount = 0,
  onToggleSave,
  isSaving = false,
}: ConfigPanelProps) {

  const autoChatEligible = matchCount >= MIN_MATCHES_FOR_AUTO_CHAT;

  // ── Instant-save helper ──────────────────────────────────────────────────
  const handleToggle = async (
    setter: (v: boolean) => void,
    field: string,
    newValue: boolean
  ) => {
    setter(newValue);
    if (onToggleSave) {
      try { await onToggleSave(field, newValue); } catch { /* non-fatal */ }
    }
  };

  const handleConsentToggle = async (checked: boolean) => {
    const val = checked ? new Date().toISOString() : null;
    setDigitalReplicaConsent(val);
    if (onToggleSave) {
      try { await onToggleSave('digital_replica_consent', val); } catch { /* non-fatal */ }
    }
  };

  const activeServicesCount = [
    chatAutoEnabled && autoChatEligible,
    contentOpsEnabled,
    legalAuditEnabled,
  ].filter(Boolean).length;

  return (
    <div className="glass-card p-6 bg-white/2 border border-white/5 rounded-3xl space-y-5">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex justify-between items-center pb-3 border-b border-white/5">
        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white/80 flex items-center gap-2">
          <Brain className="w-4 h-4 text-primary animate-pulse" />
          AI Assistant
        </h3>
        <div className="flex items-center gap-2">
          {isSaving && <Loader2 className="w-3 h-3 text-primary animate-spin" />}
          <span className={`text-[8px] font-black px-2 py-0.5 rounded border uppercase tracking-widest transition-colors ${
            aiAgentActive
              ? 'bg-primary/10 border-primary/20 text-primary'
              : 'bg-white/5 border-white/10 text-white/30'
          }`}>
            {aiAgentActive ? `${activeServicesCount} service${activeServicesCount !== 1 ? 's' : ''} on` : 'Offline'}
          </span>
        </div>
      </div>

      {/* ── Master Toggle ──────────────────────────────────────────────────── */}
      <ToggleRow
        id="toggle-ai-master"
        icon={<Zap className="w-4 h-4" />}
        label="Enable AI Copilot"
        description="Master switch. Activates automated lead scoring, reply drafts, content strategy, and contract vetting."
        checked={aiAgentActive}
        onChange={(v) => handleToggle(setAiAgentActive, 'ai_agent_active', v)}
      />

      {/* ── Per-service toggles ────────────────────────────────────────────── */}
      <div className={`space-y-3 transition-all duration-300 ${aiAgentActive ? 'opacity-100' : 'opacity-30 pointer-events-none'}`}>

        {/* Auto-Chat — locked until 30 matches */}
        <div>
          <ToggleRow
            id="toggle-auto-chat"
            icon={<MessageSquare className="w-3.5 h-3.5" />}
            label="Auto-Chat Simulation"
            badge="Draft Mode"
            description="AI drafts replies that match your tone. Each message is staged for your approval before sending."
            warning={autoChatEligible ? 'Hard guardrail: disabled for Level 4 Close Friend connections.' : undefined}
            locked={!autoChatEligible}
            lockedReason={
              !autoChatEligible
                ? `Requires ${MIN_MATCHES_FOR_AUTO_CHAT} matches — you have ${matchCount}`
                : undefined
            }
            checked={chatAutoEnabled && autoChatEligible}
            disabled={!aiAgentActive}
            onChange={(v) => handleToggle(setChatAutoEnabled, 'chat_auto_enabled', v)}
          />
          {/* Progress bar shown only when locked */}
          {!autoChatEligible && aiAgentActive && (
            <MatchProgressBar current={matchCount} required={MIN_MATCHES_FOR_AUTO_CHAT} />
          )}
        </div>

        {/* Content Ops */}
        <ToggleRow
          id="toggle-content-ops"
          icon={<FileText className="w-3.5 h-3.5" />}
          label="Content Ops Strategist"
          badge="Captions & Scripts"
          description="Generate punchy captions, video hooks, and 3-step recording guides for Instagram, TikTok, and X."
          checked={contentOpsEnabled}
          disabled={!aiAgentActive}
          onChange={(v) => handleToggle(setContentOpsEnabled, 'content_ops_enabled', v)}
        />

        {/* Legal Audit */}
        <ToggleRow
          id="toggle-legal-audit"
          icon={<ShieldCheck className="w-3.5 h-3.5" />}
          label="Contract Legal Audit"
          badge="NY Art. 36"
          description="Scans brand contracts for commission rate violations, missing sunset clauses, and digital replica terms."
          checked={legalAuditEnabled}
          disabled={!aiAgentActive}
          onChange={(v) => handleToggle(setLegalAuditEnabled, 'legal_audit_enabled', v)}
        />
      </div>

      {/* ── Digital Replica Consent ────────────────────────────────────────── */}
      <div className="p-5 bg-black/40 rounded-2xl border border-white/5 space-y-4">
        <div className="flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-white">
              Digital Replica Authorization
            </span>
            <p className="text-[8px] text-white/40 uppercase tracking-widest leading-relaxed">
              Under NY Labor Law Art. 36 (Fashion Workers Act), you must provide separate written
              consent to allow AI usage of your digital likeness, avatar, or voice clone.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-white/5">
          <span className="text-[8px] text-white/30 font-black uppercase tracking-widest">
            {digitalReplicaConsent
              ? `Authorized · ${new Date(digitalReplicaConsent).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
              : 'Consent not granted'}
          </span>
          <label className="relative flex items-center cursor-pointer select-none">
            <input
              type="checkbox"
              checked={!!digitalReplicaConsent}
              onChange={(e) => handleConsentToggle(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-black after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary" />
          </label>
        </div>
      </div>
    </div>
  );
}
