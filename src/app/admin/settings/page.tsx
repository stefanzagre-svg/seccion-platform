'use client';

import { useState, useEffect } from 'react';
import { Settings, Save, ShieldAlert, Check, AlertTriangle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PlatformSettings {
  feature_flags: {
    text_translation: boolean;
    speech_translation: boolean;
    ephemeral_media: boolean;
    ai_suggestions: boolean;
    blur_filter: boolean;
  };
  pricing: {
    s2st_rate_per_min_eur: number;
    free_s2st_seconds: number;
    vip_price_default: number;
    master_price_default: number;
  };
  creator_promo: {
    max_promo_slots: number;
    promo_duration_months: number;
    selection_criteria: string;
  };
  moderation: {
    auto_flag_threshold: number;
    escalation_timeout_hours: number;
    ban_appeal_window_days: number;
  };
}

export default function PlatformSettingsPage() {
  const [settings, setSettings] = useState<PlatformSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/settings');
      if (!res.ok) throw new Error('Failed to fetch settings');
      const data = await res.json();
      setSettings(data.settings as PlatformSettings);
    } catch (err: any) {
      setError(err.message || 'Error occurred loading settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSaveSetting = async (key: keyof PlatformSettings, updatedVal: any) => {
    setSavingKey(key);
    setError(null);
    setSuccessMsg(null);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value: updatedVal })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to save settings. You might have insufficient authority.');
      }

      setSuccessMsg(`Setting "${key}" updated successfully!`);
      // Update local state
      setSettings(prev => prev ? ({ ...prev, [key]: updatedVal }) : null);
    } catch (err: any) {
      setError(err.message || 'Failed to save configuration');
    } finally {
      setSavingKey(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="text-center py-12">
        <ShieldAlert className="w-8 h-8 text-red-500 mx-auto mb-2" />
        <p className="text-xs text-white/50">Could not retrieve platform settings.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h2 className="font-['Outfit'] text-2xl font-black text-white tracking-tight uppercase flex items-center gap-2">
          <Settings className="w-7 h-7 text-primary" />
          SYSTEM CONFIGURATION CONTROL
        </h2>
        <p className="text-xs text-white/50 font-medium mt-1">
          Adjust live pricing limits, feature flags, automatic moderation thresholds, and creator promotional packs.
        </p>
      </div>

      {/* Warnings & Success messages */}
      {error && (
        <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/5 text-xs text-red-400 font-semibold flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
          {error}
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-xl border border-success/30 bg-success/10 text-xs text-success font-semibold flex items-center gap-2">
          <Check className="w-4 h-4 text-success shrink-0" />
          {successMsg}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Feature Flags */}
        <div className="glass-card p-6 flex flex-col justify-between">
          <div>
            <h3 className="font-['Outfit'] text-xs font-black uppercase tracking-widest text-primary border-b border-white/5 pb-2.5 mb-4">
              Feature Toggles
            </h3>
            
            <div className="space-y-4">
              {[
                { label: 'Real-Time Text Chat Translation', key: 'text_translation' },
                { label: 'S2ST Speech-to-Speech Translation', key: 'speech_translation' },
                { label: 'Ephemeral Media Auto-Expiry', key: 'ephemeral_media' },
                { label: 'AI Suggestion Matchmaking Engine', key: 'ai_suggestions' },
                { label: 'NSFW Profile Face-Blur Filtering', key: 'blur_filter' },
              ].map((flag) => (
                <div key={flag.key} className="flex items-center justify-between">
                  <span className="text-xs text-white/70 font-semibold">{flag.label}</span>
                  <input
                    type="checkbox"
                    checked={(settings.feature_flags as any)[flag.key]}
                    onChange={(e) => {
                      const updatedFlags = {
                        ...settings.feature_flags,
                        [flag.key]: e.target.checked
                      };
                      setSettings({ ...settings, feature_flags: updatedFlags });
                    }}
                    className="w-4 h-4 rounded border-white/10 bg-black text-primary focus:ring-primary focus:ring-offset-black accent-primary cursor-pointer"
                  />
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => handleSaveSetting('feature_flags', settings.feature_flags)}
            disabled={savingKey === 'feature_flags'}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-primary text-black hover:bg-primary-foreground font-bold active:scale-98 transition-all text-xs uppercase tracking-wider mt-6"
          >
            {savingKey === 'feature_flags' ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                Save Toggles
              </>
            )}
          </button>
        </div>

        {/* Pricing Config */}
        <div className="glass-card p-6 flex flex-col justify-between">
          <div>
            <h3 className="font-['Outfit'] text-xs font-black uppercase tracking-widest text-primary border-b border-white/5 pb-2.5 mb-4">
              Pricing Configuration
            </h3>

            <div className="space-y-4 text-xs font-semibold text-white/70">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] text-white/40 uppercase tracking-wider font-bold font-mono">S2ST Rate per Minute (EUR)</label>
                <input
                  type="number"
                  step="0.01"
                  value={settings.pricing.s2st_rate_per_min_eur}
                  onChange={(e) => {
                    const pricing = { ...settings.pricing, s2st_rate_per_min_eur: parseFloat(e.target.value) };
                    setSettings({ ...settings, pricing });
                  }}
                  className="bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-primary/50 text-xs font-mono"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] text-white/40 uppercase tracking-wider font-bold font-mono">Daily Free S2ST seconds</label>
                <input
                  type="number"
                  value={settings.pricing.free_s2st_seconds}
                  onChange={(e) => {
                    const pricing = { ...settings.pricing, free_s2st_seconds: parseInt(e.target.value) };
                    setSettings({ ...settings, pricing });
                  }}
                  className="bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-primary/50 text-xs font-mono"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] text-white/40 uppercase tracking-wider font-bold font-mono">VIP Sub default price (EUR)</label>
                <input
                  type="number"
                  step="0.01"
                  value={settings.pricing.vip_price_default}
                  onChange={(e) => {
                    const pricing = { ...settings.pricing, vip_price_default: parseFloat(e.target.value) };
                    setSettings({ ...settings, pricing });
                  }}
                  className="bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-primary/50 text-xs font-mono"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] text-white/40 uppercase tracking-wider font-bold font-mono">Master Sub default price (EUR)</label>
                <input
                  type="number"
                  step="0.01"
                  value={settings.pricing.master_price_default}
                  onChange={(e) => {
                    const pricing = { ...settings.pricing, master_price_default: parseFloat(e.target.value) };
                    setSettings({ ...settings, pricing });
                  }}
                  className="bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-primary/50 text-xs font-mono"
                />
              </div>
            </div>
          </div>

          <button
            onClick={() => handleSaveSetting('pricing', settings.pricing)}
            disabled={savingKey === 'pricing'}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-primary text-black hover:bg-primary-foreground font-bold active:scale-98 transition-all text-xs uppercase tracking-wider mt-6"
          >
            {savingKey === 'pricing' ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                Save Pricing
              </>
            )}
          </button>
        </div>

        {/* Creator Promo */}
        <div className="glass-card p-6 flex flex-col justify-between">
          <div>
            <h3 className="font-['Outfit'] text-xs font-black uppercase tracking-widest text-primary border-b border-white/5 pb-2.5 mb-4">
              Creator Promo settings
            </h3>

            <div className="space-y-4 text-xs font-semibold text-white/70">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] text-white/40 uppercase tracking-wider font-bold font-mono">Max Promo slots limit</label>
                <input
                  type="number"
                  value={settings.creator_promo.max_promo_slots}
                  onChange={(e) => {
                    const creator_promo = { ...settings.creator_promo, max_promo_slots: parseInt(e.target.value) };
                    setSettings({ ...settings, creator_promo });
                  }}
                  className="bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-primary/50 text-xs font-mono"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] text-white/40 uppercase tracking-wider font-bold font-mono">Promo Duration (Months)</label>
                <input
                  type="number"
                  value={settings.creator_promo.promo_duration_months}
                  onChange={(e) => {
                    const creator_promo = { ...settings.creator_promo, promo_duration_months: parseInt(e.target.value) };
                    setSettings({ ...settings, creator_promo });
                  }}
                  className="bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-primary/50 text-xs font-mono"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] text-white/40 uppercase tracking-wider font-bold font-mono">Selection Criteria Criteria</label>
                <select
                  value={settings.creator_promo.selection_criteria}
                  onChange={(e) => {
                    const creator_promo = { ...settings.creator_promo, selection_criteria: e.target.value };
                    setSettings({ ...settings, creator_promo });
                  }}
                  className="bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-primary/50 text-xs"
                >
                  <option value="best_50">best_50 Selection</option>
                  <option value="first_50">first_50 Selection</option>
                </select>
              </div>
            </div>
          </div>

          <button
            onClick={() => handleSaveSetting('creator_promo', settings.creator_promo)}
            disabled={savingKey === 'creator_promo'}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-primary text-black hover:bg-primary-foreground font-bold active:scale-98 transition-all text-xs uppercase tracking-wider mt-6"
          >
            {savingKey === 'creator_promo' ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                Save Promo Settings
              </>
            )}
          </button>
        </div>

        {/* Moderation Rules */}
        <div className="glass-card p-6 flex flex-col justify-between">
          <div>
            <h3 className="font-['Outfit'] text-xs font-black uppercase tracking-widest text-primary border-b border-white/5 pb-2.5 mb-4">
              Moderation Rules
            </h3>

            <div className="space-y-4 text-xs font-semibold text-white/70">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] text-white/40 uppercase tracking-wider font-bold font-mono">Auto Flag Threshold</label>
                <input
                  type="number"
                  value={settings.moderation.auto_flag_threshold}
                  onChange={(e) => {
                    const moderation = { ...settings.moderation, auto_flag_threshold: parseInt(e.target.value) };
                    setSettings({ ...settings, moderation });
                  }}
                  className="bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-primary/50 text-xs font-mono"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] text-white/40 uppercase tracking-wider font-bold font-mono">Escalation Timeout (Hours)</label>
                <input
                  type="number"
                  value={settings.moderation.escalation_timeout_hours}
                  onChange={(e) => {
                    const moderation = { ...settings.moderation, escalation_timeout_hours: parseInt(e.target.value) };
                    setSettings({ ...settings, moderation });
                  }}
                  className="bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-primary/50 text-xs font-mono"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] text-white/40 uppercase tracking-wider font-bold font-mono">Ban Appeal Window (Days)</label>
                <input
                  type="number"
                  value={settings.moderation.ban_appeal_window_days}
                  onChange={(e) => {
                    const moderation = { ...settings.moderation, ban_appeal_window_days: parseInt(e.target.value) };
                    setSettings({ ...settings, moderation });
                  }}
                  className="bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-primary/50 text-xs font-mono"
                />
              </div>
            </div>
          </div>

          <button
            onClick={() => handleSaveSetting('moderation', settings.moderation)}
            disabled={savingKey === 'moderation'}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-primary text-black hover:bg-primary-foreground font-bold active:scale-98 transition-all text-xs uppercase tracking-wider mt-6"
          >
            {savingKey === 'moderation' ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                Save Moderation Rules
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
