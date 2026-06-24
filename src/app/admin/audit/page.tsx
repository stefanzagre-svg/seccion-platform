'use client';

import { useState, useEffect } from 'react';
import { History, Search, RefreshCw, Loader2, Calendar } from 'lucide-react';
import AuditLogEntry, { AuditLog } from '@/components/admin/AuditLogEntry';
import { cn } from '@/lib/utils';

export default function AuditTrailLogs() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const [actionSearch, setActionSearch] = useState('');
  const [tableFilter, setTableFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: '25',
      });

      if (actionSearch) params.append('action', actionSearch);
      if (tableFilter) params.append('target_table', tableFilter);
      if (dateFrom) params.append('date_from', new Date(dateFrom).toISOString());
      if (dateTo) params.append('date_to', new Date(dateTo).toISOString());

      const res = await fetch(`/api/admin/audit?${params.toString()}`);
      if (!res.ok) {
        throw new Error('Failed to load audit trail logs');
      }
      const data = await res.json();
      setLogs(data.logs);
      setTotalItems(data.pagination.total);
      setTotalPages(data.pagination.totalPages);
    } catch (err: any) {
      setError(err.message || 'Error loading logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, tableFilter, dateFrom, dateTo]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchLogs();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-['Outfit'] text-2xl font-black text-white tracking-tight uppercase flex items-center gap-2">
            <History className="w-7 h-7 text-primary" />
            IMMUTABLE SECURITY AUDIT TRAIL
          </h2>
          <p className="text-xs text-white/50 font-medium mt-1">
            Reconcile all administrative actions, role updates, settings modifications, and moderation queue approvals.
          </p>
        </div>

        <button 
          onClick={fetchLogs}
          className="self-start p-2 rounded-xl border border-white/10 bg-white/5 text-white/60 hover:text-white hover:border-primary/45 transition-all"
          title="Refresh Audit Logs"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Filters */}
      <div className="glass p-5 rounded-2xl">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 items-end">
          {/* Action Search */}
          <div className="md:col-span-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-white/40 block mb-2 font-mono">
              Filter by Action type
            </label>
            <div className="relative group">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 group-focus-within:text-primary transition-colors" />
              <input
                type="text"
                placeholder="e.g. user.verify_kyc or setting.update"
                value={actionSearch}
                onChange={(e) => setActionSearch(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl py-2 pl-11 pr-4 outline-none focus:border-primary/50 focus:bg-black/60 transition-all text-xs font-semibold text-white placeholder-white/30"
              />
            </div>
          </div>

          {/* Target Table filter */}
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-white/40 block mb-2 font-mono">
              Target Component
            </label>
            <select
              value={tableFilter}
              onChange={(e) => { setTableFilter(e.target.value); setPage(1); }}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primary/50"
            >
              <option value="">All Components</option>
              <option value="profiles">profiles (users)</option>
              <option value="content_moderation_queue">content_moderation_queue</option>
              <option value="platform_settings">platform_settings</option>
              <option value="subscriptions">subscriptions</option>
            </select>
          </div>

          {/* Date from */}
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-white/40 block mb-2 font-mono flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-white/40" /> Date From
            </label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-primary/50 font-mono"
            />
          </div>

          {/* Date to */}
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-white/40 block mb-2 font-mono flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-white/40" /> Date To
            </label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-primary/50 font-mono"
            />
          </div>
        </form>
      </div>

      {/* Timeline Content */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-white/45">
            <Loader2 className="w-8 h-8 animate-spin text-primary mb-3" />
            <span className="text-xs font-semibold">Retrieving secure logs...</span>
          </div>
        ) : error ? (
          <div className="text-center py-12 border border-red-500/25 bg-red-500/5 rounded-2xl">
            <p className="text-xs text-red-300 font-bold">{error}</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-20 bg-white/[0.01] border border-white/5 rounded-2xl text-white/40 font-semibold text-xs">
            No audit logs found.
          </div>
        ) : (
          <div className="space-y-3.5">
            {logs.map((log) => (
              <AuditLogEntry key={log.id} log={log} />
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex justify-between items-center px-4 mt-6">
          <span className="text-xs text-white/40 font-semibold font-mono">
            Showing {logs.length} logs of {totalItems} total
          </span>

          <div className="flex gap-2">
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
        </div>
      )}
    </div>
  );
}
