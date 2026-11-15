'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Sparkles,
  Copy,
  Check,
  Send,
  Shield,
  MessageCircle,
  Ban,
  RotateCcw,
  Plus,
  Clock,
  Trash2,
  ExternalLink,
} from 'lucide-react';
import type { EmailLocale } from '@/lib/email';

interface AdminVipInviteItem {
  id: string;
  code: string;
  creator_name: string | null;
  social_handle: string | null;
  platform: string;
  email: string | null;
  locale: EmailLocale;
  niche: string | null;
  morocco_shield: boolean;
  ai_free_months: number;
  founding_split: number;
  max_uses: number;
  uses_count: number;
  is_revoked: boolean;
  expires_at: string;
  claimed_email: string | null;
  claimed_at: string | null;
  notes: string | null;
  created_at: string;
  status: 'active' | 'claimed' | 'expired' | 'revoked' | 'not_found';
  inviteUrl: string;
  dmTemplates: Record<EmailLocale, string>;
}

interface VipStats {
  total: number;
  active: number;
  claimed: number;
  revoked: number;
  expired: number;
}

const PLATFORMS = [
  'instagram',
  'tiktok',
  'x',
  'youtube',
  'onlyfans',
  'whatsapp',
  'other',
] as const;

export default function VipFastTrackPanel() {
  const [invites, setInvites] = useState<AdminVipInviteItem[]>([]);
  const [stats, setStats] = useState<VipStats>({
    total: 0,
    active: 0,
    claimed: 0,
    revoked: 0,
    expired: 0,
  });
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  // Generator form state
  const [creatorName, setCreatorName] = useState('');
  const [socialHandle, setSocialHandle] = useState('');
  const [platform, setPlatform] = useState<(typeof PLATFORMS)[number]>('instagram');
  const [email, setEmail] = useState('');
  const [locale, setLocale] = useState<EmailLocale>('en');
  const [niche, setNiche] = useState('Lifestyle');
  const [moroccoShield, setMoroccoShield] = useState(false);
  const [expiresInDays, setExpiresInDays] = useState(14);
  const [sendEmail, setSendEmail] = useState(false);
  const [notes, setNotes] = useState('');
  const [latestCreated, setLatestCreated] = useState<AdminVipInviteItem | null>(null);

  const fetchInvites = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/vip-invites', { cache: 'no-store' });
      const data = await res.json();
      if (res.ok) {
        setInvites(data.invites || []);
        setStats(
          data.stats || { total: 0, active: 0, claimed: 0, revoked: 0, expired: 0 }
        );
      }
    } catch {
      // handled gracefully in empty UI
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInvites();
  }, [fetchInvites]);

  const handleCopy = async (key: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch {
      // ignore clipboard restrictions
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    setCreating(true);
    try {
      const res = await fetch('/api/admin/vip-invites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          creatorName: creatorName.trim() || null,
          socialHandle: socialHandle.trim() || null,
          platform,
          email: email.trim() || null,
          locale,
          niche: niche.trim() || null,
          moroccoShield,
          expiresInDays,
          maxUses: 1,
          sendEmail: Boolean(sendEmail && email.trim()),
          notes: notes.trim() || null,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || 'Could not generate VIP invite.');
      }

      setLatestCreated(data.invite);
      setInvites((prev) => [data.invite, ...prev]);
      setStats((prev) => ({
        ...prev,
        total: prev.total + 1,
        active: prev.active + 1,
      }));
      setCreatorName('');
      setSocialHandle('');
      setEmail('');
      setNotes('');
      setMoroccoShield(false);
      setSendEmail(false);
      setFeedback({
        type: 'ok',
        text: data.emailSent
          ? `VIP pass created & emailed (${data.invite.code}) — 90% Year 1 + 1Y AI Free.`
          : `VIP pass created (${data.invite.code}) — ready to DM!`,
      });
    } catch (err: any) {
      setFeedback({ type: 'err', text: err?.message || 'Creation failed.' });
    } finally {
      setCreating(false);
    }
  };

  const handlePatch = async (
    id: string,
    action: 'revoke' | 'reactivate' | 'extend' | 'resend_email'
  ) => {
    setBusyId(`${id}:${action}`);
    setFeedback(null);
    try {
      const res = await fetch('/api/admin/vip-invites', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action, extendDays: 14 }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || 'Update failed.');

      if (action === 'resend_email') {
        setFeedback({ type: 'ok', text: `VIP pass email resent to ${data.invite.email}.` });
      } else {
        setInvites((prev) => prev.map((inv) => (inv.id === id ? data.invite : inv)));
      }
    } catch (err: any) {
      setFeedback({ type: 'err', text: err?.message || 'Action failed.' });
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (id: string) => {
    setBusyId(`${id}:delete`);
    setFeedback(null);
    try {
      const res = await fetch(`/api/admin/vip-invites?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || 'Delete failed.');
      setInvites((prev) => prev.filter((inv) => inv.id !== id));
    } catch (err: any) {
      setFeedback({ type: 'err', text: err?.message || 'Delete failed.' });
    } finally {
      setBusyId(null);
    }
  };

  const statusBadge = (status: AdminVipInviteItem['status']) => {
    const styles: Record<string, string> = {
      active: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
      claimed: 'bg-violet-500/15 text-violet-300 border-violet-500/30',
      revoked: 'bg-red-500/15 text-red-300 border-red-500/30',
      expired: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    };
    return (
      <span
        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
          styles[status] || 'bg-white/10 text-white/60 border-white/15'
        }`}
      >
        {status}
      </span>
    );
  };

  return (
    <section className="mb-8 rounded-2xl bg-[#0d0d16] border border-emerald-500/25 p-5 sm:p-6 shadow-xl">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[10px] font-bold uppercase tracking-widest mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            Founder VIP Fast-Track Concierge
          </div>
          <h2 className="text-lg sm:text-xl font-black text-white">
            Direct Pre-Vetted Creator Invites (90% Year-1 / 80% After + 1Y Free AI)
          </h2>
          <p className="text-xs text-white/60 mt-1">
            Issue personal links so vetted creators skip forms &amp; queues and enter Creator Studio in 60s.
          </p>
        </div>

        <div className="grid grid-cols-4 gap-2 text-center">
          <div className="rounded-xl bg-white/[0.03] border border-white/10 px-3 py-2">
            <div className="text-sm font-black text-white">{stats.total}</div>
            <div className="text-[10px] text-white/50 uppercase">Total</div>
          </div>
          <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/25 px-3 py-2">
            <div className="text-sm font-black text-emerald-300">{stats.active}</div>
            <div className="text-[10px] text-emerald-200/70 uppercase">Active</div>
          </div>
          <div className="rounded-xl bg-violet-500/10 border border-violet-500/25 px-3 py-2">
            <div className="text-sm font-black text-violet-300">{stats.claimed}</div>
            <div className="text-[10px] text-violet-200/70 uppercase">Claimed</div>
          </div>
          <div className="rounded-xl bg-amber-500/10 border border-amber-500/25 px-3 py-2">
            <div className="text-sm font-black text-amber-300">
              {stats.expired + stats.revoked}
            </div>
            <div className="text-[10px] text-amber-200/70 uppercase">Closed</div>
          </div>
        </div>
      </div>

      {/* Create VIP Invite Form */}
      <form
        onSubmit={handleCreate}
        className="rounded-xl bg-black/35 border border-white/10 p-4 mb-5 space-y-3"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <input
            type="text"
            value={creatorName}
            onChange={(e) => setCreatorName(e.target.value)}
            placeholder="Creator Name (e.g. Elena R.)"
            className="bg-black/60 border border-white/15 focus:border-emerald-400 rounded-lg px-3 py-2 text-xs text-white placeholder:text-white/35 outline-none"
          />
          <input
            type="text"
            value={socialHandle}
            onChange={(e) => setSocialHandle(e.target.value)}
            placeholder="@handle or social URL"
            className="bg-black/60 border border-white/15 focus:border-emerald-400 rounded-lg px-3 py-2 text-xs text-white placeholder:text-white/35 outline-none"
          />
          <select
            value={platform}
            onChange={(e) => setPlatform(e.target.value as (typeof PLATFORMS)[number])}
            className="bg-black/60 border border-white/15 focus:border-emerald-400 rounded-lg px-3 py-2 text-xs text-white outline-none"
          >
            {PLATFORMS.map((p) => (
              <option key={p} value={p} className="bg-[#0d0d16]">
                Platform: {p.toUpperCase()}
              </option>
            ))}
          </select>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Optional Email Lock (or leave open)"
            className="bg-black/60 border border-white/15 focus:border-emerald-400 rounded-lg px-3 py-2 text-xs text-white placeholder:text-white/35 outline-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-center">
          <select
            value={locale}
            onChange={(e) => setLocale(e.target.value as EmailLocale)}
            className="bg-black/60 border border-white/15 rounded-lg px-3 py-2 text-xs text-white outline-none"
          >
            <option value="en" className="bg-[#0d0d16]">Locale: EN</option>
            <option value="es" className="bg-[#0d0d16]">Locale: ES</option>
            <option value="fr" className="bg-[#0d0d16]">Locale: FR</option>
          </select>
          <input
            type="text"
            value={niche}
            onChange={(e) => setNiche(e.target.value)}
            placeholder="Niche (e.g. Fitness, Glamour)"
            className="bg-black/60 border border-white/15 rounded-lg px-3 py-2 text-xs text-white placeholder:text-white/35 outline-none"
          />
          <select
            value={expiresInDays}
            onChange={(e) => setExpiresInDays(Number(e.target.value))}
            className="bg-black/60 border border-white/15 rounded-lg px-3 py-2 text-xs text-white outline-none"
          >
            <option value={7} className="bg-[#0d0d16]">Expires: 7 Days</option>
            <option value={14} className="bg-[#0d0d16]">Expires: 14 Days</option>
            <option value={30} className="bg-[#0d0d16]">Expires: 30 Days</option>
            <option value={60} className="bg-[#0d0d16]">Expires: 60 Days</option>
          </select>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Internal vetting note (optional)"
            className="bg-black/60 border border-white/15 rounded-lg px-3 py-2 text-xs text-white placeholder:text-white/35 outline-none lg:col-span-2"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex flex-wrap items-center gap-4 text-xs text-white/80">
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={moroccoShield}
                onChange={(e) => setMoroccoShield(e.target.checked)}
                className="accent-indigo-400"
              />
              <Shield className="w-3.5 h-3.5 text-indigo-300" />
              Pre-enable Morocco Domestic Shield (`MA`)
            </label>
            <label
              className={`inline-flex items-center gap-2 ${
                email.trim() ? 'cursor-pointer' : 'opacity-40 cursor-not-allowed'
              }`}
            >
              <input
                type="checkbox"
                disabled={!email.trim()}
                checked={sendEmail && Boolean(email.trim())}
                onChange={(e) => setSendEmail(e.target.checked)}
                className="accent-emerald-400"
              />
              <Send className="w-3.5 h-3.5 text-emerald-300" />
              Also email VIP link immediately
            </label>
          </div>

          <button
            type="submit"
            disabled={creating}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs transition disabled:opacity-50 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            {creating ? 'Generating...' : 'Generate VIP Fast-Track Link'}
          </button>
        </div>
      </form>

      {feedback && (
        <div
          className={`mb-4 rounded-xl px-4 py-2.5 text-xs font-medium border ${
            feedback.type === 'ok'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
              : 'bg-red-500/10 border-red-500/30 text-red-200'
          }`}
        >
          {feedback.text}
        </div>
      )}

      {/* Newly created quick-share drawer */}
      {latestCreated && (
        <div className="mb-5 rounded-xl bg-emerald-500/[0.08] border border-emerald-500/35 p-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
              Ready to Send: {latestCreated.inviteUrl}
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handleCopy(`new-link`, latestCreated.inviteUrl)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white text-black font-bold text-[11px] cursor-pointer"
              >
                {copiedKey === 'new-link' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                Copy Link
              </button>
              {(['en', 'es', 'fr'] as EmailLocale[]).map((dmLoc) => (
                <button
                  key={dmLoc}
                  type="button"
                  onClick={() => handleCopy(`new-dm-${dmLoc}`, latestCreated.dmTemplates[dmLoc])}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-semibold text-[11px] cursor-pointer uppercase"
                >
                  {copiedKey === `new-dm-${dmLoc}` ? (
                    <Check className="w-3.5 h-3.5 text-emerald-300" />
                  ) : (
                    <MessageCircle className="w-3.5 h-3.5" />
                  )}
                  Copy {dmLoc} DM
                </button>
              ))}
              <a
                href={`https://wa.me/?text=${encodeURIComponent(
                  latestCreated.dmTemplates[latestCreated.locale]
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 font-semibold text-[11px]"
              >
                WhatsApp
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
          <p className="text-xs text-white/75 bg-black/40 rounded-lg p-2.5 font-mono leading-relaxed">
            {latestCreated.dmTemplates[latestCreated.locale]}
          </p>
        </div>
      )}

      {/* Invite Ledger */}
      <div className="overflow-x-auto">
        {loading ? (
          <div className="py-6 text-center text-xs text-white/50">Loading VIP passes...</div>
        ) : invites.length === 0 ? (
          <div className="py-6 text-center text-xs text-white/45 border border-dashed border-white/10 rounded-xl">
            No VIP Fast-Track passes issued yet. Generate one above for your next vetted creator.
          </div>
        ) : (
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-white/10 text-[10px] uppercase tracking-wider text-white/45">
                <th className="py-2 pr-3">Creator / Handle</th>
                <th className="py-2 px-3">VIP Code</th>
                <th className="py-2 px-3">Status</th>
                <th className="py-2 px-3">Claimed / Terms</th>
                <th className="py-2 pl-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              {invites.slice(0, 20).map((inv) => (
                <tr key={inv.id} className="hover:bg-white/[0.02]">
                  <td className="py-2.5 pr-3">
                    <div className="font-bold text-white flex items-center gap-1.5">
                      {inv.creator_name || (inv.social_handle ? `@${inv.social_handle}` : 'Unnamed VIP')}
                      {inv.morocco_shield && (
                        <span className="px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 text-[9px] font-bold">
                          MA SHIELD
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-white/50">
                      {inv.platform.toUpperCase()}
                      {inv.social_handle ? ` · @${inv.social_handle}` : ''}
                      {inv.email ? ` · ${inv.email}` : ''}
                    </div>
                  </td>
                  <td className="py-2.5 px-3 font-mono text-[11px] text-emerald-300">
                    {inv.code}
                  </td>
                  <td className="py-2.5 px-3">{statusBadge(inv.status)}</td>
                  <td className="py-2.5 px-3 text-[11px] text-white/65">
                    {inv.claimed_at ? (
                      <span>
                        {inv.claimed_email || 'Claimed'} ·{' '}
                        {new Date(inv.claimed_at).toLocaleDateString()}
                      </span>
                    ) : (
                      <span>
                        90% Y1 / 80% Y2 · Exp {new Date(inv.expires_at).toLocaleDateString()}
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 pl-3">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleCopy(`link-${inv.id}`, inv.inviteUrl)}
                        title="Copy VIP link"
                        className="px-2 py-1 rounded bg-white/10 hover:bg-white/20 text-white text-[10px] font-semibold cursor-pointer inline-flex items-center gap-1"
                      >
                        {copiedKey === `link-${inv.id}` ? (
                          <Check className="w-3 h-3 text-emerald-300" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                        Link
                      </button>
                      <button
                        type="button"
                        onClick={() => handleCopy(`dm-${inv.id}`, inv.dmTemplates[inv.locale])}
                        title={`Copy ${inv.locale.toUpperCase()} DM`}
                        className="px-2 py-1 rounded bg-white/10 hover:bg-white/20 text-white text-[10px] font-semibold cursor-pointer inline-flex items-center gap-1 uppercase"
                      >
                        {copiedKey === `dm-${inv.id}` ? (
                          <Check className="w-3 h-3 text-emerald-300" />
                        ) : (
                          <MessageCircle className="w-3 h-3" />
                        )}
                        {inv.locale}
                      </button>
                      {inv.email && inv.status === 'active' && (
                        <button
                          type="button"
                          disabled={busyId === `${inv.id}:resend_email`}
                          onClick={() => handlePatch(inv.id, 'resend_email')}
                          title="Send / Resend Email"
                          className="p-1.5 rounded bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 cursor-pointer"
                        >
                          <Send className="w-3 h-3" />
                        </button>
                      )}
                      {inv.status === 'active' && (
                        <button
                          type="button"
                          disabled={busyId === `${inv.id}:revoke`}
                          onClick={() => handlePatch(inv.id, 'revoke')}
                          title="Revoke pass"
                          className="p-1.5 rounded bg-red-500/15 hover:bg-red-500/25 text-red-300 cursor-pointer"
                        >
                          <Ban className="w-3 h-3" />
                        </button>
                      )}
                      {(inv.status === 'revoked' || inv.status === 'expired') && (
                        <button
                          type="button"
                          disabled={busyId === `${inv.id}:reactivate`}
                          onClick={() => handlePatch(inv.id, 'reactivate')}
                          title="Reactivate (+14d)"
                          className="p-1.5 rounded bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 cursor-pointer"
                        >
                          <RotateCcw className="w-3 h-3" />
                        </button>
                      )}
                      {inv.status === 'active' && (
                        <button
                          type="button"
                          disabled={busyId === `${inv.id}:extend`}
                          onClick={() => handlePatch(inv.id, 'extend')}
                          title="Extend +14 days"
                          className="p-1.5 rounded bg-white/10 hover:bg-white/20 text-white/80 cursor-pointer"
                        >
                          <Clock className="w-3 h-3" />
                        </button>
                      )}
                      {inv.uses_count === 0 && (
                        <button
                          type="button"
                          disabled={busyId === `${inv.id}:delete`}
                          onClick={() => handleDelete(inv.id)}
                          title="Delete unclaimed invite"
                          className="p-1.5 rounded bg-white/5 hover:bg-red-500/20 text-white/50 hover:text-red-300 cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}
