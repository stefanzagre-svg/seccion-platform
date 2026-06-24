'use client';

import { useState, useEffect } from 'react';
import { ShieldCheck, ShieldAlert, AlertCircle, HelpCircle, Loader2, RefreshCw } from 'lucide-react';
import ModerationCard, { ModerationItem } from '@/components/admin/ModerationCard';
import { cn } from '@/lib/utils';

export default function ContentModerationWorkstation() {
  const [items, setItems] = useState<ModerationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Pagination
  const [statusFilter, setStatusFilter] = useState('pending'); // Default to pending
  const [priorityFilter, setPriorityFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    underReview: 0,
    approved: 0,
    rejected: 0,
    escalated: 0,
  });

  const fetchQueue = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        status: statusFilter,
      });

      if (priorityFilter) params.append('priority', priorityFilter);

      const res = await fetch(`/api/admin/moderation?${params.toString()}`);
      if (!res.ok) {
        throw new Error('Failed to fetch moderation queue');
      }
      const data = await res.json();
      setItems(data.items);
      setStats(data.stats);
      setTotalPages(data.pagination.totalPages);
    } catch (err: any) {
      setError(err.message || 'Error occurred while loading queue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, [statusFilter, priorityFilter, page]);

  const handleResolve = async (id: string, action: 'approved' | 'rejected' | 'escalated', notes: string) => {
    try {
      const res = await fetch('/api/admin/moderation', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemId: id,
          status: action,
          resolutionNotes: notes
        })
      });

      if (!res.ok) {
        throw new Error('Failed to resolve moderation item');
      }

      // Re-fetch queue to update local state
      await fetchQueue();
    } catch (err: any) {
      alert(err.message || 'An error occurred');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-['Outfit'] text-2xl font-black text-white tracking-tight uppercase flex items-center gap-2">
            <ShieldCheck className="w-7 h-7 text-primary" />
            CONTENT MODERATION WORKSTATION
          </h2>
          <p className="text-xs text-white/50 font-medium mt-1">
            Audit flagged profiles, dating media uploads, and conversations to maintain a safe platform ecosystem.
          </p>
        </div>

        <button 
          onClick={fetchQueue}
          className="self-start p-2 rounded-xl border border-white/10 bg-white/5 text-white/60 hover:text-white hover:border-primary/45 transition-all"
          title="Refresh Queue"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: 'Pending review', value: stats.pending, status: 'pending', color: 'text-yellow-400 border-yellow-500/25 bg-yellow-500/5' },
          { label: 'Under Review', value: stats.underReview, status: 'under_review', color: 'text-[#00fbfb] border-[#00fbfb]/25 bg-[#00fbfb]/5' },
          { label: 'Escalated', value: stats.escalated, status: 'escalated', color: 'text-red-400 border-red-500/25 bg-red-500/5' },
          { label: 'Approved Logs', value: stats.approved, status: 'approved', color: 'text-success border-success/20 bg-success/5' },
          { label: 'Rejected Logs', value: stats.rejected, status: 'rejected', color: 'text-white/40 border-white/10 bg-white/[0.02]' },
        ].map((stat) => (
          <button
            key={stat.status}
            onClick={() => { setStatusFilter(stat.status); setPage(1); }}
            className={cn(
              "p-4 rounded-2xl border text-center transition-all hover:brightness-110 active:scale-98",
              stat.color,
              statusFilter === stat.status ? "border-primary glow-cyan-sm font-black" : "border-white/5 opacity-60"
            )}
          >
            <div className="text-[10px] font-black uppercase tracking-wider text-white/40 font-mono">{stat.label}</div>
            <div className="text-xl font-black text-white mt-1.5">{stat.value}</div>
          </button>
        ))}
      </div>

      {/* Filter Row */}
      <div className="glass p-4 rounded-2xl flex flex-wrap gap-4 items-center justify-between">
        <div className="flex gap-3">
          <select
            value={priorityFilter}
            onChange={(e) => { setPriorityFilter(e.target.value); setPage(1); }}
            className="bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primary/50"
          >
            <option value="">All Priorities</option>
            <option value="low">Low Priority</option>
            <option value="normal">Normal Priority</option>
            <option value="high">High Priority</option>
            <option value="critical">Critical Priority</option>
          </select>
        </div>

        <span className="text-[10px] uppercase font-bold text-white/40 font-mono">
          Showing queue for: <span className="text-white">{statusFilter}</span>
        </span>
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-white/45">
          <Loader2 className="w-8 h-8 animate-spin text-primary mb-3" />
          <span className="text-xs font-semibold">Scanning moderation queue...</span>
        </div>
      ) : error ? (
        <div className="text-center py-12 border border-red-500/20 bg-red-500/5 rounded-2xl">
          <ShieldAlert className="w-8 h-8 text-red-400 mx-auto mb-2" />
          <p className="text-xs text-red-300 font-bold">{error}</p>
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-20 bg-white/[0.01] border border-white/5 rounded-2xl">
          <AlertCircle className="w-8 h-8 text-white/20 mx-auto mb-3" />
          <h3 className="text-white/60 font-bold text-sm">Station Clear</h3>
          <p className="text-xs text-white/30 max-w-xs mx-auto mt-1">
            No moderation items match these filter parameters. All queues cleared.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {items.map((item) => (
            <ModerationCard
              key={item.id}
              item={item}
              onResolve={handleResolve}
            />
          ))}
        </div>
      )}

      {/* Simple Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1.5 rounded-xl border border-white/10 bg-white/5 text-xs text-white hover:bg-white/10 disabled:opacity-30 transition-all font-bold"
          >
            Prev Page
          </button>
          <span className="px-3 py-1.5 text-xs text-white/50 font-semibold font-mono">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1.5 rounded-xl border border-white/10 bg-white/5 text-xs text-white hover:bg-white/10 disabled:opacity-30 transition-all font-bold"
          >
            Next Page
          </button>
        </div>
      )}
    </div>
  );
}
