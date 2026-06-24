'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Tv, 
  Search, 
  Award, 
  Check, 
  X, 
  ExternalLink, 
  ChevronDown,
  RefreshCw,
  Sparkles,
  Zap
} from 'lucide-react';
import DataTable, { Column } from '@/components/admin/DataTable';
import { cn } from '@/lib/utils';

interface CreatorProfile {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  role: 'creator';
  is_kyc_verified: boolean;
  platform_role: string;
  created_at: string;
  creator_ultimate_pack: boolean;
  promo_status: 'none' | 'active' | 'best_50';
}

export default function CreatorsManagement() {
  const [creators, setCreators] = useState<CreatorProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination & Filtering state
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [search, setSearch] = useState('');
  const [ultimatePackFilter, setUltimatePackFilter] = useState('');
  const [promoStatusFilter, setPromoStatusFilter] = useState('');
  const [sortField, setSortField] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Selection
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [actionLoading, setActionLoading] = useState(false);
  const [showPromoSelect, setShowPromoSelect] = useState(false);

  const fetchCreators = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page + 1),
        limit: String(pageSize),
        sort: sortField,
        order: sortOrder,
        role: 'creator', // Hardcoded filter for creators
      });

      if (search) params.append('search', search);
      // Wait, client-side pagination will work, but the /api/admin/users doesn't directly filter by creator_ultimate_pack or promo_status in searchParams?
      // Let's check /api/admin/users/route.ts in line 32:
      // It supports role, kyc, platform_role, search, sort, order.
      // It doesn't filter creator_ultimate_pack or promo_status directly via query params (they are just returned in SELECT).
      // So if the user filters by ultimate pack or promo status, we can filter them on the client side, or fetch all and filter.
      // Wait! There are only 50 promo slots max, so the creator table is usually small.
      // Let's implement client-side filtering if ultimatePackFilter or promoStatusFilter is set, or better yet, since the API doesn't support them, we can filter the result array!
      // This is extremely safe and simple.
      
      const res = await fetch(`/api/admin/users?${params.toString()}`);
      if (!res.ok) {
        throw new Error('Failed to fetch creators list');
      }
      const data = await res.json();
      
      let filteredCreators = data.users as CreatorProfile[];
      
      // Client-side fallback filters since these columns are returned but not indexed-queried in the main API
      if (ultimatePackFilter) {
        const targetVal = ultimatePackFilter === 'true';
        filteredCreators = filteredCreators.filter(c => c.creator_ultimate_pack === targetVal);
      }
      if (promoStatusFilter) {
        filteredCreators = filteredCreators.filter(c => c.promo_status === promoStatusFilter);
      }

      setCreators(filteredCreators);
      setTotalItems(filteredCreators.length);
      setTotalPages(Math.ceil(filteredCreators.length / pageSize));
    } catch (err: any) {
      setError(err.message || 'Error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCreators();
  }, [page, pageSize, ultimatePackFilter, promoStatusFilter, sortField, sortOrder]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
    fetchCreators();
  };

  const handleSelectRow = (id: string, checked: boolean) => {
    setSelectedRows(prev => {
      const next = new Set(prev);
      if (checked) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectedRows(prev => {
      if (checked) {
        return new Set(creators.map(c => c.id));
      } else {
        return new Set();
      }
    });
  };

  // Perform bulk update action
  const handleBulkAction = async (action: string, data?: any) => {
    if (selectedRows.size === 0) return;
    setActionLoading(true);
    try {
      // For verify_kyc, change_role, we use PATCH /api/admin/users
      if (action === 'verify_kyc' || action === 'unverify_kyc') {
        const res = await fetch('/api/admin/users', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action,
            userIds: Array.from(selectedRows),
          })
        });
        if (!res.ok) throw new Error('Bulk operation failed');
      } else {
        // For toggle_ultimate_pack, update_promo_status, we hit /api/admin/users/[id] sequentially (since it's a small list)
        for (const userId of Array.from(selectedRows)) {
          const res = await fetch(`/api/admin/users/${userId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action,
              value: data
            })
          });
          if (!res.ok) throw new Error(`Operation failed for user ${userId}`);
        }
      }

      setSelectedRows(new Set());
      setShowPromoSelect(false);
      await fetchCreators();
    } catch (err: any) {
      alert(err.message || 'An error occurred during bulk operation');
    } finally {
      setActionLoading(false);
    }
  };

  // Define Columns
  const columns: Column<CreatorProfile>[] = [
    {
      header: 'Creator',
      accessorKey: 'username',
      sortable: true,
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full border border-white/10 bg-white/5 overflow-hidden shrink-0 flex items-center justify-center">
            {row.avatar_url ? (
              <img src={row.avatar_url} alt={row.username} className="w-full h-full object-cover" />
            ) : (
              <Tv className="w-4 h-4 text-white/40" />
            )}
          </div>
          <div className="min-w-0">
            <span className="font-bold text-white block truncate">@{row.username}</span>
            <span className="text-[10px] text-white/45 truncate block max-w-[120px]">
              {row.id.substring(0, 8)}...
            </span>
          </div>
        </div>
      )
    },
    {
      header: 'Display Name',
      accessorKey: 'display_name',
      sortable: true,
      cell: ({ row }) => <span>{row.display_name || '-'}</span>
    },
    {
      header: 'KYC Status',
      accessorKey: 'is_kyc_verified',
      sortable: true,
      cell: ({ row }) => (
        <span className={cn(
          "text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md border inline-flex items-center gap-1 font-mono",
          row.is_kyc_verified
            ? "bg-success/10 text-success border-success/20"
            : "bg-white/5 text-white/40 border-white/10"
        )}>
          {row.is_kyc_verified ? <Check className="w-2.5 h-2.5" /> : <X className="w-2.5 h-2.5" />}
          {row.is_kyc_verified ? 'Verified' : 'Unverified'}
        </span>
      )
    },
    {
      header: 'Ultimate Pack',
      accessorKey: 'creator_ultimate_pack',
      cell: ({ row }) => (
        <span className={cn(
          "text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md border inline-flex items-center gap-1 font-mono",
          row.creator_ultimate_pack
            ? "bg-purple-500/10 text-purple-400 border-purple-500/25"
            : "bg-white/5 text-white/40 border-white/10"
        )}>
          {row.creator_ultimate_pack ? <Zap className="w-2.5 h-2.5" /> : null}
          {row.creator_ultimate_pack ? 'Ultimate (Active)' : 'Standard'}
        </span>
      )
    },
    {
      header: 'Promo Status Group',
      accessorKey: 'promo_status',
      cell: ({ row }) => {
        const getStyles = (status: string) => {
          switch (status) {
            case 'best_50': return 'bg-yellow-500/15 text-yellow-400 border-yellow-500/25 shadow-[0_0_10px_rgba(234,179,8,0.1)]';
            case 'active': return 'bg-primary/10 text-primary border-primary/25';
            default: return 'bg-white/5 text-white/40 border-white/10';
          }
        };
        return (
          <span className={cn(
            "text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md border inline-flex items-center gap-1 font-mono",
            getStyles(row.promo_status)
          )}>
            {row.promo_status === 'best_50' && <Sparkles className="w-2.5 h-2.5" />}
            {row.promo_status}
          </span>
        );
      }
    },
    {
      header: 'Joined Date',
      accessorKey: 'created_at',
      sortable: true,
      cell: ({ row }) => <span className="font-mono text-[10px] text-white/50">{new Date(row.created_at).toLocaleDateString()}</span>
    },
    {
      header: 'Actions',
      accessorKey: 'id',
      cell: ({ row }) => (
        <Link
          href={`/admin/users/${row.id}`}
          className="p-1.5 rounded-lg border border-white/10 bg-white/5 text-white/60 hover:text-[#ffabf3] hover:border-[#ffabf3]/30 transition-all inline-flex items-center gap-1 text-[10px] uppercase font-bold"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span>Control Panel</span>
        </Link>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-['Outfit'] text-2xl font-black text-white tracking-tight uppercase">
            CREATOR AUDIT STATION
          </h2>
          <p className="text-xs text-white/50 font-medium mt-1">
            Monitor and manage creator accounts, verify KYC authenticity, and audit 12-month free promotional campaigns.
          </p>
        </div>

        <button 
          onClick={fetchCreators}
          className="self-start p-2 rounded-xl border border-white/10 bg-white/5 text-white/60 hover:text-white hover:border-primary/45 transition-all"
          title="Refresh Creators Data"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Filters Form */}
      <div className="glass p-5 rounded-2xl">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-end">
          {/* Search */}
          <div className="sm:col-span-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-white/40 block mb-2 font-mono">
              Search Creator Username
            </label>
            <div className="relative group">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 group-focus-within:text-primary transition-colors" />
              <input
                type="text"
                placeholder="Enter creator name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl py-2 pl-11 pr-4 outline-none focus:border-primary/50 focus:bg-black/60 transition-all text-xs font-semibold text-white placeholder-white/30"
              />
            </div>
          </div>

          {/* Ultimate Pack filter */}
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-white/40 block mb-2 font-mono">
              Ultimate Pack Promo
            </label>
            <select
              value={ultimatePackFilter}
              onChange={(e) => { setUltimatePackFilter(e.target.value); setPage(0); }}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primary/50"
            >
              <option value="">All Tiers</option>
              <option value="true">Ultimate Pack Active</option>
              <option value="false">Standard Tier Only</option>
            </select>
          </div>

          {/* Promo Status filter */}
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-white/40 block mb-2 font-mono">
              Promo status
            </label>
            <select
              value={promoStatusFilter}
              onChange={(e) => { setPromoStatusFilter(e.target.value); setPage(0); }}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primary/50"
            >
              <option value="">All Promos</option>
              <option value="none">None</option>
              <option value="active">Active</option>
              <option value="best_50">Best 50 Flag</option>
            </select>
          </div>
        </form>
      </div>

      {/* Main Table */}
      <div className="glass-card p-6 min-h-[400px]">
        <DataTable
          columns={columns}
          data={creators}
          loading={loading}
          pageIndex={page}
          pageSize={pageSize}
          pageCount={totalPages}
          totalItems={totalItems}
          onPageChange={setPage}
          onPageSizeChange={(size) => { setPageSize(size); setPage(0); }}
          onSort={(col, dir) => { setSortField(col); setSortOrder(dir); }}
          selectedRows={selectedRows}
          onSelectRow={handleSelectRow}
          onSelectAll={handleSelectAll}
          getRowId={(row) => row.id}
        />
      </div>

      {/* Bulk Action Panel for Creators */}
      {selectedRows.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-black/90 backdrop-blur-xl border border-[#ffabf3]/30 rounded-2xl px-6 py-4 shadow-2xl flex items-center gap-6 animate-fade-in">
          <div className="text-xs font-bold text-white">
            <span className="text-[#ffabf3] font-mono font-black">{selectedRows.size}</span> creators selected
          </div>

          <div className="h-6 w-px bg-white/10" />

          <div className="flex gap-2">
            <button
              onClick={() => handleBulkAction('verify_kyc')}
              disabled={actionLoading}
              className="px-3 py-1.5 rounded-xl border border-success/30 bg-success/10 text-success hover:bg-success/20 active:scale-95 transition-all text-[10px] uppercase font-bold"
            >
              Verify KYC
            </button>
            <button
              onClick={() => handleBulkAction('toggle_ultimate_pack', true)}
              disabled={actionLoading}
              className="px-3 py-1.5 rounded-xl border border-purple-500/30 bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 active:scale-95 transition-all text-[10px] uppercase font-bold"
            >
              Grant Ultimate Pack
            </button>
            <button
              onClick={() => handleBulkAction('toggle_ultimate_pack', false)}
              disabled={actionLoading}
              className="px-3 py-1.5 rounded-xl border border-white/10 bg-white/5 text-white hover:bg-white/10 active:scale-95 transition-all text-[10px] uppercase font-bold"
            >
              Revoke Ultimate Pack
            </button>

            {/* Bulk Promo Status Change */}
            <div className="relative">
              <button
                onClick={() => setShowPromoSelect(!showPromoSelect)}
                disabled={actionLoading}
                className="px-3 py-1.5 rounded-xl border border-yellow-500/30 bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20 active:scale-95 transition-all text-[10px] uppercase font-bold flex items-center gap-1"
              >
                Promo Status
                <ChevronDown className="w-3.5 h-3.5" />
              </button>

              {showPromoSelect && (
                <div className="absolute bottom-full right-0 mb-2 w-40 rounded-xl border border-white/10 bg-black p-1 shadow-2xl z-50">
                  {['none', 'active', 'best_50'].map((promo) => (
                    <button
                      key={promo}
                      onClick={() => handleBulkAction('update_promo_status', promo)}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg text-[10px] font-bold text-white/70 hover:text-white hover:bg-white/5 transition-all uppercase"
                    >
                      {promo}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
