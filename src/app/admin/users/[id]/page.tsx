'use client';

import { useState, useEffect, use } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  ShieldAlert, 
  Check, 
  X, 
  Tv, 
  User, 
  Award, 
  Globe, 
  Shield, 
  History, 
  Calendar,
  Lock,
  ChevronDown,
  Volume2
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface UserDetail {
  profile: {
    id: string;
    username: string;
    display_name: string | null;
    avatar_url: string | null;
    role: 'member' | 'creator';
    is_kyc_verified: boolean;
    platform_role: 'user' | 'moderator' | 'admin' | 'super_admin';
    created_at: string;
    bio: string | null;
    text_translation_enabled: boolean;
    speech_translation_enabled: boolean;
    creator_ultimate_pack: boolean;
    promo_status: 'none' | 'active' | 'best_50';
  };
  stats: {
    matchesCount: number;
    relationshipsCount: number;
    subscribingCount: number;
    subscribersCount: number;
  };
  subscriptions: {
    active: any[];
    subscribers: any[];
  };
  moderation: any[];
  auditLogs: any[];
}

export default function UserDetailInspector() {
  const router = useRouter();
  const { id } = useParams() as { id: string };

  const [data, setData] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [showPlatformRoleSelect, setShowPlatformRoleSelect] = useState(false);

  const fetchUserDetail = async () => {
    try {
      const res = await fetch(`/api/admin/users/${id}`);
      if (!res.ok) {
        throw new Error('Failed to fetch user details');
      }
      const json = await res.json();
      setData(json);
    } catch (err: any) {
      setError(err.message || 'Error occurred while loading user');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchUserDetail();
  }, [id]);

  const handleUpdatePlatformRole = async (role: string) => {
    setUpdateLoading(true);
    try {
      // Use general PATCH /api/admin/users for platform role
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'change_platform_role',
          userIds: [id],
          data: { platform_role: role }
        })
      });
      if (!res.ok) throw new Error('Failed to update platform role');
      setShowPlatformRoleSelect(false);
      await fetchUserDetail();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleToggleKYC = async () => {
    if (!data) return;
    setUpdateLoading(true);
    try {
      const action = data.profile.is_kyc_verified ? 'unverify_kyc' : 'verify_kyc';
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          userIds: [id]
        })
      });
      if (!res.ok) throw new Error('Failed to update KYC verification');
      await fetchUserDetail();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleToggleUltimatePack = async () => {
    if (!data) return;
    setUpdateLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'toggle_ultimate_pack',
          value: !data.profile.creator_ultimate_pack
        })
      });
      if (!res.ok) throw new Error('Failed to toggle Ultimate Pack');
      await fetchUserDetail();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleUpdatePromoStatus = async (status: string) => {
    setUpdateLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_promo_status',
          value: status
        })
      });
      if (!res.ok) throw new Error('Failed to update promo status');
      await fetchUserDetail();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleToggleTranslation = async (type: 'text' | 'speech', currentVal: boolean) => {
    setUpdateLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'toggle_translation_feature',
          value: { type, enabled: !currentVal }
        })
      });
      if (!res.ok) throw new Error('Failed to update translation toggle');
      await fetchUserDetail();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleToggleRole = async () => {
    if (!data) return;
    setUpdateLoading(true);
    try {
      const newRole = data.profile.role === 'creator' ? 'member' : 'creator';
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'change_role',
          userIds: [id],
          data: { role: newRole }
        })
      });
      if (!res.ok) throw new Error('Failed to switch role');
      await fetchUserDetail();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setUpdateLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] text-center px-4">
        <ShieldAlert className="w-8 h-8 text-red-500 mb-2 animate-bounce" />
        <h2 className="text-md font-bold text-white mb-1">Inspector Error</h2>
        <p className="text-xs text-white/50 mb-4">{error || 'User not found'}</p>
        <Link href="/admin/users" className="text-xs font-semibold text-primary hover:underline">
          Back to User Registry
        </Link>
      </div>
    );
  }

  const { profile, stats, subscriptions, moderation, auditLogs } = data;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex items-center gap-4">
        <Link 
          href="/admin/users"
          className="p-2 rounded-xl border border-white/10 bg-white/5 text-white/60 hover:text-white hover:border-primary/45 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>

        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-['Outfit'] text-2xl font-black text-white tracking-tight uppercase">
              @{profile.username}
            </h2>
            <span className={cn(
              "text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded border font-mono",
              profile.role === 'creator' ? 'bg-[#ffabf3]/10 text-[#ffabf3] border-[#ffabf3]/20' : 'bg-[#00fbfb]/10 text-[#00fbfb] border-[#00fbfb]/20'
            )}>
              {profile.role}
            </span>
            {profile.is_kyc_verified && (
              <span className="bg-success/15 border border-success/30 text-success text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded font-mono">
                KYC Verified
              </span>
            )}
          </div>
          <p className="text-[10px] text-white/45 font-mono mt-1 font-semibold">
            ID: {profile.id}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Details & Actions */}
        <div className="space-y-6 lg:col-span-1">
          {/* Avatar & Profile Details */}
          <div className="glass-card p-6">
            <div className="flex flex-col items-center text-center pb-6 border-b border-white/5">
              <div className="w-24 h-24 rounded-full border-2 border-primary/30 p-1 bg-black/40 overflow-hidden mb-4 relative">
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} alt={profile.username} className="w-full h-full object-cover rounded-full" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-white/5 text-white/40">
                    <User className="w-8 h-8" />
                  </div>
                )}
              </div>

              <h3 className="font-bold text-white text-md">
                {profile.display_name || 'No display name'}
              </h3>
              <p className="text-xs text-white/40 font-mono mt-1 uppercase tracking-wider font-bold">
                Platform role: <span className="text-primary">{profile.platform_role}</span>
              </p>
              
              {profile.bio && (
                <p className="text-xs text-white/60 mt-4 italic bg-black/30 p-3 rounded-xl border border-white/5 w-full">
                  "{profile.bio}"
                </p>
              )}
            </div>

            <div className="pt-6 space-y-4 text-xs font-semibold text-white/70">
              <div className="flex justify-between">
                <span className="text-white/40">Registration Date</span>
                <span className="font-mono">{new Date(profile.created_at).toLocaleString()}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-white/40">Text Translation</span>
                <button
                  onClick={() => handleToggleTranslation('text', profile.text_translation_enabled)}
                  disabled={updateLoading}
                  className={cn(
                    "text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded border font-mono transition-all",
                    profile.text_translation_enabled ? "bg-success/15 border-success/35 text-success" : "bg-white/5 border-white/10 text-white/40"
                  )}
                >
                  {profile.text_translation_enabled ? 'Enabled' : 'Disabled'}
                </button>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-white/40">Speech Translation</span>
                <button
                  onClick={() => handleToggleTranslation('speech', profile.speech_translation_enabled)}
                  disabled={updateLoading}
                  className={cn(
                    "text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded border font-mono transition-all",
                    profile.speech_translation_enabled ? "bg-success/15 border-success/35 text-success" : "bg-white/5 border-white/10 text-white/40"
                  )}
                >
                  {profile.speech_translation_enabled ? 'Enabled' : 'Disabled'}
                </button>
              </div>
            </div>
          </div>

          {/* Platform Actions */}
          <div className="glass-card p-6 space-y-4">
            <h4 className="font-['Outfit'] text-xs font-black uppercase tracking-widest text-white/50 border-b border-white/5 pb-2.5">
              STATION CONTROLS
            </h4>

            {/* KYC Toggle */}
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-white/70">KYC Verification</span>
              <button
                onClick={handleToggleKYC}
                disabled={updateLoading}
                className={cn(
                  "px-3 py-1.5 rounded-xl border font-bold transition-all",
                  profile.is_kyc_verified
                    ? "bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20"
                    : "bg-success/15 border-success/30 text-success hover:bg-success/25"
                )}
              >
                {profile.is_kyc_verified ? 'Revoke KYC' : 'Verify KYC'}
              </button>
            </div>

            {/* Role switch toggle */}
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-white/70">Platform User Role</span>
              <button
                onClick={handleToggleRole}
                disabled={updateLoading}
                className="px-3 py-1.5 rounded-xl border border-white/10 bg-white/5 text-white hover:bg-white/10 font-bold transition-all"
              >
                Switch to {profile.role === 'creator' ? 'member' : 'creator'}
              </button>
            </div>

            {/* Platform Role promotion */}
            <div className="flex items-center justify-between text-xs font-semibold relative">
              <span className="text-white/70">Station Authority</span>
              <div className="relative">
                <button
                  onClick={() => setShowPlatformRoleSelect(!showPlatformRoleSelect)}
                  disabled={updateLoading}
                  className="px-3 py-1.5 rounded-xl border border-white/10 bg-white/5 text-white/80 hover:text-white font-bold transition-all flex items-center gap-1.5 uppercase font-mono text-[10px]"
                >
                  {profile.platform_role}
                  <ChevronDown className="w-3.5 h-3.5 text-white/40" />
                </button>

                {showPlatformRoleSelect && (
                  <div className="absolute right-0 top-full mt-1.5 w-36 rounded-xl border border-white/10 bg-black/95 p-1.5 shadow-2xl z-50 animate-fade-in">
                    {['user', 'moderator', 'admin', 'super_admin'].map((role) => (
                      <button
                        key={role}
                        onClick={() => handleUpdatePlatformRole(role)}
                        className="w-full text-left px-2 py-1 rounded-lg text-[9px] uppercase font-bold text-white/70 hover:text-white hover:bg-white/5 transition-all font-mono"
                      >
                        {role}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Creator Promo Program Controls */}
          {profile.role === 'creator' && (
            <div className="glass-card p-6 space-y-4">
              <h4 className="font-['Outfit'] text-xs font-black uppercase tracking-widest text-[#ffabf3] border-b border-[#ffabf3]/10 pb-2.5">
                CREATOR PROMO CONTROLS
              </h4>

              {/* Ultimate Pack toggle */}
              <div className="flex items-center justify-between text-xs font-semibold">
                <div className="flex flex-col">
                  <span className="text-white/70">Ultimate Pack Promo</span>
                  <span className="text-[9px] text-white/40 mt-0.5">12-Month free upgrade</span>
                </div>
                <button
                  onClick={handleToggleUltimatePack}
                  disabled={updateLoading}
                  className={cn(
                    "px-3 py-1.5 rounded-xl border font-bold transition-all",
                    profile.creator_ultimate_pack
                      ? "bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20"
                      : "bg-success/15 border-success/30 text-success hover:bg-success/25"
                  )}
                >
                  {profile.creator_ultimate_pack ? 'Revoke Ultimate' : 'Grant Ultimate'}
                </button>
              </div>

              {/* Promo Selection Criteria */}
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-white/70">Promo Status Group</span>
                <select
                  value={profile.promo_status || 'none'}
                  onChange={(e) => handleUpdatePromoStatus(e.target.value)}
                  disabled={updateLoading}
                  className="bg-black/40 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-primary/50"
                >
                  <option value="none">None</option>
                  <option value="active">Active Promo</option>
                  <option value="best_50">Best 50 Flag</option>
                </select>
              </div>
            </div>
          )}

        </div>

        {/* Right Column: Analytics, Moderation & Audit Logs */}
        <div className="space-y-6 lg:col-span-2">
          {/* Quick stats summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="glass-card p-4 text-center">
              <span className="text-[10px] font-black uppercase text-white/40 tracking-wider font-mono">Relationships</span>
              <div className="text-lg font-black text-white mt-1">{stats.relationshipsCount}</div>
            </div>
            <div className="glass-card p-4 text-center">
              <span className="text-[10px] font-black uppercase text-white/40 tracking-wider font-mono">Matched</span>
              <div className="text-lg font-black text-primary mt-1">{stats.matchesCount}</div>
            </div>
            <div className="glass-card p-4 text-center">
              <span className="text-[10px] font-black uppercase text-white/40 tracking-wider font-mono">Subscribed To</span>
              <div className="text-lg font-black text-white mt-1">{stats.subscribingCount}</div>
            </div>
            <div className="glass-card p-4 text-center">
              <span className="text-[10px] font-black uppercase text-white/40 tracking-wider font-mono">Subscribers</span>
              <div className="text-lg font-black text-[#ffabf3] mt-1">{stats.subscribersCount}</div>
            </div>
          </div>

          {/* Subscriptions */}
          <div className="glass-card p-6">
            <h4 className="font-['Outfit'] text-xs font-black uppercase tracking-widest text-white/50 border-b border-white/5 pb-2.5 mb-4">
              SUBSCRIPTIONS HISTORY
            </h4>
            
            {profile.role === 'creator' ? (
              // Subscribers List
              <div className="space-y-3">
                {subscriptions.subscribers.length === 0 ? (
                  <div className="text-xs text-white/40 py-4 text-center">No active subscribers.</div>
                ) : (
                  subscriptions.subscribers.map((s) => (
                    <div key={s.id} className="flex justify-between items-center bg-white/[0.02] border border-white/5 p-3 rounded-xl">
                      <div>
                        <div className="text-xs font-bold text-white">Subscriber: {s.subscriber_id.substring(0, 8)}...</div>
                        <div className="text-[10px] text-white/40 font-mono mt-0.5">Purchased: {new Date(s.created_at).toLocaleDateString()}</div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-black text-[#ffabf3] uppercase font-mono">{s.tier}</span>
                        <div className="text-[10px] text-white/50 mt-0.5">Paid: {s.price_paid} EUR</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            ) : (
              // Active Subscriptions purchased by member
              <div className="space-y-3">
                {subscriptions.active.length === 0 ? (
                  <div className="text-xs text-white/40 py-4 text-center">No active purchases.</div>
                ) : (
                  subscriptions.active.map((s) => (
                    <div key={s.id} className="flex justify-between items-center bg-white/[0.02] border border-white/5 p-3 rounded-xl">
                      <div>
                        <div className="text-xs font-bold text-white">Creator: {s.creator_id.substring(0, 8)}...</div>
                        <div className="text-[10px] text-white/40 font-mono mt-0.5">Date: {new Date(s.created_at).toLocaleDateString()}</div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-black text-primary uppercase font-mono">{s.tier}</span>
                        <div className="text-[10px] text-white/50 mt-0.5">Cost: {s.price_paid} EUR</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Content Moderation Tickets */}
          <div className="glass-card p-6">
            <h4 className="font-['Outfit'] text-xs font-black uppercase tracking-widest text-white/50 border-b border-white/5 pb-2.5 mb-4">
              FLAGGED MODERATION HISTORICAL LOGS ({moderation.length})
            </h4>

            {moderation.length === 0 ? (
              <div className="text-xs text-white/40 py-4 text-center">No moderation flags filed against this user profile.</div>
            ) : (
              <div className="space-y-3">
                {moderation.map((m) => (
                  <div key={m.id} className="bg-white/[0.02] border border-white/5 p-3 rounded-xl flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-white">Reason: {m.reason}</div>
                      <p className="text-[10px] text-white/50 mt-1">Desc: {m.description || 'No report notes'}</p>
                    </div>
                    <div className="text-right">
                      <span className={cn(
                        "text-[9px] font-black uppercase font-mono px-1.5 py-0.5 rounded-md border",
                        m.status === 'approved' && "bg-success/10 text-success border-success/20",
                        m.status === 'rejected' && "bg-destructive/10 text-destructive border-destructive/20",
                        m.status === 'pending' && "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                      )}>
                        {m.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Targeted Audit Logs */}
          <div className="glass-card p-6">
            <h4 className="font-['Outfit'] text-xs font-black uppercase tracking-widest text-white/50 border-b border-white/5 pb-2.5 mb-4 flex items-center gap-2">
              <History className="w-4 h-4 text-white/40" />
              TARGET OPERATION AUDIT TRAIL ({auditLogs.length})
            </h4>

            {auditLogs.length === 0 ? (
              <div className="text-xs text-white/40 py-4 text-center">No administrative changes recorded for this user.</div>
            ) : (
              <div className="space-y-3.5 max-h-96 overflow-y-auto pr-2">
                {auditLogs.map((log) => (
                  <div key={log.id} className="bg-black/40 border border-white/10 rounded-xl p-3.5">
                    <div className="flex justify-between items-center">
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5 text-primary" />
                        {log.action}
                      </div>
                      <div className="text-[9px] text-white/40 font-mono">
                        {new Date(log.created_at).toLocaleString()}
                      </div>
                    </div>
                    <div className="text-[9px] text-white/40 mt-1 font-semibold uppercase tracking-wider">
                      Operator: <span className="text-white">@{log.admin?.username || 'System'}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-white/5 text-[9px] font-mono">
                      <div>
                        <div className="text-red-400 uppercase font-black mb-1">Old state</div>
                        <pre className="p-1.5 bg-red-950/15 border border-red-950/30 rounded text-red-300 max-h-24 overflow-y-auto">
                          {JSON.stringify(log.old_value, null, 2)}
                        </pre>
                      </div>
                      <div>
                        <div className="text-success uppercase font-black mb-1">New state</div>
                        <pre className="p-1.5 bg-green-950/15 border border-green-950/30 rounded text-success max-h-24 overflow-y-auto">
                          {JSON.stringify(log.new_value, null, 2)}
                        </pre>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
