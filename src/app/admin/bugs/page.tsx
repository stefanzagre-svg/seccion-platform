'use client';

import React, { useState, useEffect } from 'react';
import { 
  Bug, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertTriangle, 
  Gift, 
  Filter, 
  ExternalLink, 
  Smartphone, 
  RefreshCw, 
  Loader2, 
  Sparkles,
  ChevronRight,
  ShieldCheck,
  User
} from 'lucide-react';
import { BUG_CATEGORIES, BugCategory, BugSeverity, BugStatus } from '@/lib/bug-bounty';

interface BugReportRecord {
  id: string;
  reporter_id: string | null;
  reporter_email: string | null;
  reporter_role: 'member' | 'creator' | 'guest';
  category: BugCategory;
  title: string;
  description: string;
  severity: BugSeverity;
  status: BugStatus;
  page_url: string | null;
  user_agent: string | null;
  viewport_size: string | null;
  screenshot_url: string | null;
  reward_status: 'none' | 'pending' | 'distributed';
  reward_type: string;
  reward_amount: number;
  admin_notes: string | null;
  created_at: string;
  reporter?: {
    id: string;
    username: string;
    display_name: string;
    avatar_url: string | null;
    role: string;
  };
}

export default function AdminBugBountyPage() {
  const [reports, setReports] = useState<BugReportRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [selectedReport, setSelectedReport] = useState<BugReportRecord | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');

  const fetchReports = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (categoryFilter !== 'all') params.append('category', categoryFilter);

      const res = await fetch(`/api/admin/bugs?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setReports(data.reports || []);
      }
    } catch (err) {
      console.error('Failed to load bug reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [statusFilter, categoryFilter]);

  const handleUpdateStatus = async (status: BugStatus, distributeReward = false) => {
    if (!selectedReport) return;
    setActionLoading(true);

    try {
      const res = await fetch('/api/admin/bugs', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportId: selectedReport.id,
          status,
          adminNotes,
          distributeReward,
        }),
      });

      const data = await res.json();
      if (data.success && data.report) {
        setReports((prev) =>
          prev.map((r) => (r.id === selectedReport.id ? { ...r, ...data.report } : r))
        );
        setSelectedReport(data.report);
      }
    } catch (err) {
      console.error('Failed to update bug report:', err);
    } finally {
      setActionLoading(false);
    }
  };

  // KPIs
  const totalReports = reports.length;
  const pendingCount = reports.filter((r) => r.status === 'pending').length;
  const verifiedCount = reports.filter((r) => r.status === 'verified' || r.reward_status === 'distributed').length;
  const criticalCount = reports.filter((r) => r.severity === 'critical').length;

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-8 font-sans text-white">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-[#00fbfb]/10 border border-[#00fbfb]/30 rounded-2xl text-[#00fbfb]">
              <Bug className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Community Bug Bounty & Glitch Triage
            </h1>
          </div>
          <p className="text-xs text-[#b9cac9] font-mono">
            Review user-reported glitches, verify issues, and distribute XP & Radar Boost bounties.
          </p>
        </div>

        <button
          onClick={fetchReports}
          disabled={loading}
          className="self-start sm:self-auto px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-mono text-[#00fbfb] flex items-center gap-2 transition cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-1">
          <span className="text-[10px] font-mono uppercase text-white/40 font-bold">Total Filed</span>
          <div className="text-2xl font-black text-white">{totalReports}</div>
        </div>
        <div className="p-4 bg-[#00fbfb]/5 border border-[#00fbfb]/20 rounded-2xl space-y-1">
          <span className="text-[10px] font-mono uppercase text-[#00fbfb] font-bold">Pending Review</span>
          <div className="text-2xl font-black text-[#00fbfb]">{pendingCount}</div>
        </div>
        <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl space-y-1">
          <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold">Verified & Rewarded</span>
          <div className="text-2xl font-black text-emerald-400">{verifiedCount}</div>
        </div>
        <div className="p-4 bg-red-500/5 border border-red-500/20 rounded-2xl space-y-1">
          <span className="text-[10px] font-mono uppercase text-red-400 font-bold">Critical Severity</span>
          <div className="text-2xl font-black text-red-400">{criticalCount}</div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-3 p-3 bg-white/5 border border-white/10 rounded-2xl text-xs font-mono">
        <div className="flex items-center gap-2 text-white/40">
          <Filter className="w-3.5 h-3.5" />
          <span>Filters:</span>
        </div>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-black/60 border border-white/10 text-white rounded-xl px-3 py-1.5 outline-none text-xs"
        >
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="under_review">Under Review</option>
          <option value="verified">Verified</option>
          <option value="resolved">Resolved</option>
          <option value="rejected">Rejected</option>
        </select>

        {/* Category Filter */}
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="bg-black/60 border border-white/10 text-white rounded-xl px-3 py-1.5 outline-none text-xs"
        >
          <option value="all">All Categories</option>
          {BUG_CATEGORIES.map((c) => (
            <option key={c.id} value={c.id}>
              {c.emoji} {c.labelEn}
            </option>
          ))}
        </select>
      </div>

      {/* Reports Data Table */}
      <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-white/40 flex flex-col items-center gap-3 font-mono text-xs">
            <Loader2 className="w-6 h-6 animate-spin text-[#00fbfb]" />
            <span>Loading community reports...</span>
          </div>
        ) : reports.length === 0 ? (
          <div className="py-16 text-center text-white/40 font-mono text-xs space-y-1">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto opacity-40 mb-2" />
            <p className="text-white font-bold">No bug reports matching filters</p>
            <p className="text-[11px]">All reported glitches have been triaged.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-black/40 text-[10px] font-mono text-white/40 uppercase">
                  <th className="py-3.5 px-4 font-bold">Reporter</th>
                  <th className="py-3.5 px-4 font-bold">Category</th>
                  <th className="py-3.5 px-4 font-bold">Narrative / Title</th>
                  <th className="py-3.5 px-4 font-bold">Severity</th>
                  <th className="py-3.5 px-4 font-bold">Status</th>
                  <th className="py-3.5 px-4 font-bold">Reward</th>
                  <th className="py-3.5 px-4 font-bold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-sans">
                {reports.map((r) => {
                  const sevColors: Record<BugSeverity, string> = {
                    low: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
                    medium: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30',
                    high: 'text-orange-400 bg-orange-500/10 border-orange-500/30',
                    critical: 'text-red-400 bg-red-500/10 border-red-500/30',
                  };

                  const statusColors: Record<BugStatus, string> = {
                    pending: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30',
                    under_review: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
                    verified: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
                    resolved: 'text-emerald-400 bg-emerald-500/20 border-emerald-500/40',
                    rejected: 'text-white/40 bg-white/5 border-white/10',
                  };

                  return (
                    <tr
                      key={r.id}
                      onClick={() => {
                        setSelectedReport(r);
                        setAdminNotes(r.admin_notes || '');
                      }}
                      className="hover:bg-white/[0.03] transition cursor-pointer group"
                    >
                      {/* Reporter */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold font-mono uppercase text-[#00fbfb]">
                            {r.reporter?.username?.[0] || 'G'}
                          </div>
                          <div>
                            <span className="font-bold text-white block">
                              {r.reporter?.username ? `@${r.reporter.username}` : r.reporter_email || 'Guest'}
                            </span>
                            <span className="text-[9px] font-mono text-white/40 uppercase">
                              {r.reporter_role}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4 font-mono text-[11px] text-white/70">
                        {r.category.replace('_', ' ')}
                      </td>

                      {/* Title / Description */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <p className="font-bold text-white truncate">{r.title}</p>
                        <p className="text-[11px] text-[#b9cac9] truncate font-mono">{r.description}</p>
                      </td>

                      {/* Severity */}
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase border ${sevColors[r.severity]}`}>
                          {r.severity}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase border ${statusColors[r.status]}`}>
                          {r.status.replace('_', ' ')}
                        </span>
                      </td>

                      {/* Reward */}
                      <td className="py-3.5 px-4 font-mono text-[11px]">
                        {r.reward_status === 'distributed' ? (
                          <span className="text-emerald-400 font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Rewarded
                          </span>
                        ) : (
                          <span className="text-white/50">{r.reward_amount} {r.reward_type}</span>
                        )}
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-right">
                        <button className="p-1.5 text-white/40 group-hover:text-[#00fbfb] transition rounded-lg hover:bg-white/5">
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Inspector Detail Modal / Drawer */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-2xl bg-[#0F1117] border border-white/15 rounded-3xl p-6 shadow-[0_0_50px_rgba(0,251,251,0.2)] text-white space-y-6 max-h-[90vh] overflow-y-auto">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-[#00fbfb]/10 border border-[#00fbfb]/30 rounded-2xl text-[#00fbfb]">
                  <Bug className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase text-white/40 font-bold block">
                    Report ID: #{selectedReport.id.slice(0, 8)}
                  </span>
                  <h3 className="text-base font-bold text-white">{selectedReport.title}</h3>
                </div>
              </div>
              <button
                onClick={() => setSelectedReport(null)}
                className="p-2 text-white/40 hover:text-white rounded-xl hover:bg-white/5 transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Narrative Box */}
            <div className="space-y-1.5 p-4 bg-white/5 border border-white/10 rounded-2xl">
              <span className="text-[10px] font-mono uppercase text-[#00fbfb] font-bold">
                User Explanation
              </span>
              <p className="text-xs text-white leading-relaxed whitespace-pre-wrap">
                {selectedReport.description}
              </p>
            </div>

            {/* Telemetry Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs font-mono">
              <div className="p-3 bg-white/5 border border-white/5 rounded-xl space-y-0.5">
                <span className="text-[9px] text-white/40 uppercase block">Reporter</span>
                <span className="font-bold text-white truncate block">
                  {selectedReport.reporter?.username ? `@${selectedReport.reporter.username}` : selectedReport.reporter_email || 'Guest'}
                </span>
                <span className="text-[9px] text-[#ffabf3] uppercase font-bold">{selectedReport.reporter_role}</span>
              </div>
              <div className="p-3 bg-white/5 border border-white/5 rounded-xl space-y-0.5">
                <span className="text-[9px] text-white/40 uppercase block">Category</span>
                <span className="font-bold text-white capitalize">{selectedReport.category.replace('_', ' ')}</span>
              </div>
              <div className="p-3 bg-white/5 border border-white/5 rounded-xl space-y-0.5">
                <span className="text-[9px] text-white/40 uppercase block">Severity</span>
                <span className="font-bold text-yellow-400 uppercase">{selectedReport.severity}</span>
              </div>
              <div className="p-3 bg-white/5 border border-white/5 rounded-xl space-y-0.5 col-span-2">
                <span className="text-[9px] text-white/40 uppercase block">Reported URL</span>
                <a 
                  href={selectedReport.page_url || '#'} 
                  target="_blank" 
                  rel="noreferrer"
                  className="font-bold text-[#00fbfb] hover:underline truncate flex items-center gap-1"
                >
                  <span className="truncate">{selectedReport.page_url || 'N/A'}</span>
                  <ExternalLink className="w-3 h-3 shrink-0" />
                </a>
              </div>
              <div className="p-3 bg-white/5 border border-white/5 rounded-xl space-y-0.5">
                <span className="text-[9px] text-white/40 uppercase block">Screen Viewport</span>
                <span className="font-bold text-white">{selectedReport.viewport_size || 'N/A'}</span>
              </div>
            </div>

            {/* Optional Screenshot */}
            {selectedReport.screenshot_url && (
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono uppercase text-white/40 font-bold">Screenshot Attachment</span>
                <a href={selectedReport.screenshot_url} target="_blank" rel="noreferrer" className="block">
                  <img 
                    src={selectedReport.screenshot_url} 
                    alt="Bug Screenshot" 
                    className="max-h-48 rounded-xl border border-white/10 object-contain bg-black/40 hover:opacity-90 transition"
                  />
                </a>
              </div>
            )}

            {/* Reward Card */}
            <div className="p-4 bg-gradient-to-r from-[#00fbfb]/10 to-[#ffabf3]/10 border border-[#00fbfb]/30 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Gift className="w-5 h-5 text-[#ffabf3]" />
                <div>
                  <span className="text-[10px] font-mono uppercase text-white/40 block font-bold">Configured Bounty Reward</span>
                  <span className="text-xs font-bold text-white">
                    {selectedReport.reporter_role === 'creator' 
                      ? `${selectedReport.reward_amount || 48}h Radar Boost Pass + 50 AI Credits` 
                      : `+${selectedReport.reward_amount || 250} Harmonic XP + 7-Day VIP Badge`}
                  </span>
                </div>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase border ${
                selectedReport.reward_status === 'distributed' 
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                  : 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400'
              }`}>
                {selectedReport.reward_status === 'distributed' ? '✓ Distributed' : 'Pending Verification'}
              </span>
            </div>

            {/* Admin Notes */}
            <div className="space-y-1.5">
              <label className="block text-[10px] font-mono uppercase text-white/40 font-bold">
                Internal Engineering Notes
              </label>
              <textarea
                rows={2}
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Add developer notes or fix PR link..."
                className="w-full bg-black/40 border border-white/10 focus:border-[#00fbfb] rounded-xl p-2.5 text-xs text-white outline-none transition"
              />
            </div>

            {/* Actions Toolbar */}
            <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-white/10">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleUpdateStatus('rejected')}
                  disabled={actionLoading}
                  className="px-3.5 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl text-xs font-mono font-bold transition cursor-pointer"
                >
                  Reject / Duplicate
                </button>
                <button
                  onClick={() => handleUpdateStatus('resolved')}
                  disabled={actionLoading}
                  className="px-3.5 py-2 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl text-xs font-mono font-bold transition cursor-pointer"
                >
                  Mark Resolved
                </button>
              </div>

              {selectedReport.reward_status !== 'distributed' && selectedReport.reporter_id && (
                <button
                  onClick={() => handleUpdateStatus('verified', true)}
                  disabled={actionLoading}
                  className="px-5 py-2.5 bg-[#00fbfb] hover:bg-[#00fbfb]/90 text-black font-mono text-xs font-black uppercase tracking-wider rounded-xl shadow-[0_0_20px_rgba(0,251,251,0.4)] transition flex items-center gap-2 cursor-pointer disabled:opacity-40"
                >
                  {actionLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Verify & Grant Bounty Reward</span>
                    </>
                  )}
                </button>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
