'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { 
  Search, 
  UserCheck, 
  UserMinus, 
  Tv, 
  User, 
  ShieldAlert, 
  Check, 
  X,
  ExternalLink,
  ChevronDown,
  RefreshCw
} from 'lucide-react';
import DataTable, { Column } from '@/components/admin/DataTable';
import { cn } from '@/lib/utils';

interface UserProfile {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  role: 'member' | 'creator';
  is_kyc_verified: boolean;
  platform_role: 'user' | 'moderator' | 'admin' | 'super_admin';
  created_at: string;
  bio: string | null;
}

export default function UsersManagement() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination & Filtering state
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [kycFilter, setKycFilter] = useState('');
  const [platformRoleFilter, setPlatformRoleFilter] = useState('');
  const [sortField, setSortField] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Row selection
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());

  // Action status indicators
  const [actionLoading, setActionLoading] = useState(false);
  const [showPlatformRoleSelect, setShowPlatformRoleSelect] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page + 1),
        limit: String(pageSize),
        sort: sortField,
        order: sortOrder,
      });

      if (search) params.append('search', search);
      if (roleFilter) params.append('role', roleFilter);
      if (kycFilter) params.append('kyc', kycFilter);
      if (platformRoleFilter) params.append('platform_role', platformRoleFilter);

      const res = await fetch(`/api/admin/users?${params.toString()}`);
      if (!res.ok) {
        throw new Error('Failed to fetch user list');
      }
      const data = await res.json();
      setUsers(data.users);
      setTotalItems(data.pagination.total);
      setTotalPages(data.pagination.totalPages);
    } catch (err: any) {
      setError(err.message || 'Error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, pageSize, roleFilter, kycFilter, platformRoleFilter, sortField, sortOrder]);

  // Handle manual trigger for search
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
    fetchUsers();
  };

  // Row Selection logic
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
        return new Set(users.map(u => u.id));
      } else {
        return new Set();
      }
    });
  };

  // Execute bulk action
  const handleBulkAction = async (action: string, data?: any) => {
    if (selectedRows.size === 0) return;
    setActionLoading(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          userIds: Array.from(selectedRows),
          data,
        })
      });

      if (!res.ok) {
        throw new Error('Bulk action failed');
      }

      setSelectedRows(new Set());
      setShowPlatformRoleSelect(false);
      await fetchUsers();
    } catch (err: any) {
      alert(err.message || 'An error occurred during bulk operation');
    } finally {
      setActionLoading(false);
    }
  };

  // Define Columns
  const columns: Column<UserProfile>[] = [
    {
      header: 'Username',
      accessorKey: 'username',
      sortable: true,
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full border border-white/10 bg-white/5 overflow-hidden shrink-0 flex items-center justify-center">
            {row.avatar_url ? (
              <img src={row.avatar_url} alt={row.username} className="w-full h-full object-cover" />
            ) : (
              <User className="w-4 h-4 text-white/40" />
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
      header: 'Role',
      accessorKey: 'role',
      sortable: true,
      cell: ({ row }) => (
        <span className={cn(
          "text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md border inline-flex items-center gap-1 font-mono",
          row.role === 'creator'
            ? "bg-[#ffabf3]/10 text-[#ffabf3] border-[#ffabf3]/25"
            : "bg-[#00fbfb]/10 text-[#00fbfb] border-[#00fbfb]/25"
        )}>
          {row.role === 'creator' ? <Tv className="w-2.5 h-2.5" /> : <User className="w-2.5 h-2.5" />}
          {row.role}
        </span>
      )
    },
    {
      header: 'KYC',
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
      header: 'Platform Role',
      accessorKey: 'platform_role',
      sortable: true,
      cell: ({ row }) => {
        const getStyles = (role: string) => {
          switch (role) {
            case 'super_admin': return 'bg-red-500/10 text-red-400 border-red-500/20';
            case 'admin': return 'bg-primary/10 text-primary border-primary/20';
            case 'moderator': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
            default: return 'bg-white/5 text-white/50 border-white/10';
          }
        };
        return (
          <span className={cn(
            "text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md border font-mono",
            getStyles(row.platform_role)
          )}>
            {row.platform_role}
          </span>
        );
      }
    },
    {
      header: 'Joined',
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
          className="p-1.5 rounded-lg border border-white/10 bg-white/5 text-white/60 hover:text-primary hover:border-primary/30 transition-all inline-flex items-center gap-1 text-[10px] uppercase font-bold"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span>Inspect</span>
        </Link>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-['Outfit'] text-2xl font-black text-white tracking-tight">
            USER STATION REGISTRY
          </h2>
          <p className="text-xs text-white/50 font-medium mt-1">
            Browse, inspect, and perform administrative operations on platform user credentials and roles.
          </p>
        </div>

        <button 
          onClick={fetchUsers}
          className="self-start p-2 rounded-xl border border-white/10 bg-white/5 text-white/60 hover:text-white hover:border-primary/45 transition-all"
          title="Refresh User Data"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Filters Form */}
      <div className="glass p-5 rounded-2xl">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 items-end">
          {/* Search */}
          <div className="md:col-span-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-white/40 block mb-2 font-mono">
              Search Username / Display Name
            </label>
            <div className="relative group">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 group-focus-within:text-primary transition-colors" />
              <input
                type="text"
                placeholder="Enter search term..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl py-2 pl-11 pr-4 outline-none focus:border-primary/50 focus:bg-black/60 transition-all text-xs font-semibold text-white placeholder-white/30"
              />
            </div>
          </div>

          {/* Role filter */}
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-white/40 block mb-2 font-mono">
              Profile Role
            </label>
            <select
              value={roleFilter}
              onChange={(e) => { setRoleFilter(e.target.value); setPage(0); }}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primary/50"
            >
              <option value="">All Roles</option>
              <option value="member">Member</option>
              <option value="creator">Creator</option>
            </select>
          </div>

          {/* KYC filter */}
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-white/40 block mb-2 font-mono">
              KYC Status
            </label>
            <select
              value={kycFilter}
              onChange={(e) => { setKycFilter(e.target.value); setPage(0); }}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primary/50"
            >
              <option value="">All Statuses</option>
              <option value="true">Verified</option>
              <option value="false">Unverified</option>
            </select>
          </div>

          {/* Platform Role Filter */}
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-white/40 block mb-2 font-mono">
              Platform Role
            </label>
            <select
              value={platformRoleFilter}
              onChange={(e) => { setPlatformRoleFilter(e.target.value); setPage(0); }}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primary/50"
            >
              <option value="">All Platform Roles</option>
              <option value="user">User</option>
              <option value="moderator">Moderator</option>
              <option value="admin">Admin</option>
              <option value="super_admin">Super Admin</option>
            </select>
          </div>
        </form>
      </div>

      {/* Main Table */}
      <div className="glass-card p-6 min-h-[400px]">
        <DataTable
          columns={columns}
          data={users}
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

      {/* Bulk Action Panel (Fixed float at the bottom of page if selection active) */}
      {selectedRows.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-black/90 backdrop-blur-xl border border-primary/30 rounded-2xl px-6 py-4 shadow-2xl flex items-center gap-6 animate-fade-in glow-cyan-sm">
          <div className="text-xs font-bold text-white">
            <span className="text-primary font-mono font-black">{selectedRows.size}</span> users selected
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
              onClick={() => handleBulkAction('unverify_kyc')}
              disabled={actionLoading}
              className="px-3 py-1.5 rounded-xl border border-white/10 bg-white/5 text-white hover:bg-white/10 active:scale-95 transition-all text-[10px] uppercase font-bold"
            >
              Unverify KYC
            </button>
            <button
              onClick={() => handleBulkAction('change_role', { role: 'creator' })}
              disabled={actionLoading}
              className="px-3 py-1.5 rounded-xl border border-[#ffabf3]/30 bg-[#ffabf3]/10 text-[#ffabf3] hover:bg-[#ffabf3]/20 active:scale-95 transition-all text-[10px] uppercase font-bold"
            >
              Make Creator
            </button>
            <button
              onClick={() => handleBulkAction('change_role', { role: 'member' })}
              disabled={actionLoading}
              className="px-3 py-1.5 rounded-xl border border-[#00fbfb]/30 bg-[#00fbfb]/10 text-[#00fbfb] hover:bg-[#00fbfb]/20 active:scale-95 transition-all text-[10px] uppercase font-bold"
            >
              Make Member
            </button>

            {/* Platform Role Promote Trigger */}
            <div className="relative">
              <button
                onClick={() => setShowPlatformRoleSelect(!showPlatformRoleSelect)}
                disabled={actionLoading}
                className="px-3 py-1.5 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 active:scale-95 transition-all text-[10px] uppercase font-bold flex items-center gap-1"
              >
                Promote Role
                <ChevronDown className="w-3.5 h-3.5" />
              </button>

              {showPlatformRoleSelect && (
                <div className="absolute bottom-full right-0 mb-2 w-40 rounded-xl border border-white/10 bg-black p-1 shadow-2xl z-50">
                  {['user', 'moderator', 'admin', 'super_admin'].map((role) => (
                    <button
                      key={role}
                      onClick={() => handleBulkAction('change_platform_role', { platform_role: role })}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg text-[10px] font-bold text-white/70 hover:text-white hover:bg-white/5 transition-all uppercase"
                    >
                      {role}
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
