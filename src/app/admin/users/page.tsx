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
  RefreshCw, 
  MessageSquare, 
  Bell, 
  Sparkles,
  Users as UsersIcon,
  Clock,
  MapPin,
  Sparkle
} from 'lucide-react';
import DataTable, { Column } from '@/components/admin/DataTable';
import { cn } from '@/lib/utils';
import { AdminSendMessageModal } from '@/components/admin/AdminSendMessageModal';
import { createClient } from '@/lib/supabase/client';

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

interface WaitlistMember {
  id: string;
  email: string;
  city: string;
  founding_member: boolean;
  created_at: string;
}

export default function UsersManagement() {
  // Tab state: 'registered' vs 'waitlist'
  const [activeTab, setActiveTab] = useState<'registered' | 'waitlist'>('registered');

  // Registered Users State
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Registered Users Pagination & Filtering state
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

  // Admin Direct Message Modal state
  const [messageModalUser, setMessageModalUser] = useState<UserProfile | null>(null);

  // Realtime signup alert notification banner (Option A)
  const [latestRealtimeSignup, setLatestRealtimeSignup] = useState<{ username: string; role: string } | null>(null);

  // Waitlist State
  const [waitlist, setWaitlist] = useState<WaitlistMember[]>([]);
  const [waitlistLoading, setWaitlistLoading] = useState(false);
  const [waitlistPage, setWaitlistPage] = useState(0);
  const [waitlistPageSize, setWaitlistPageSize] = useState(10);
  const [waitlistTotalItems, setWaitlistTotalItems] = useState(0);
  const [waitlistTotalPages, setWaitlistTotalPages] = useState(1);
  const [waitlistSearch, setWaitlistSearch] = useState('');
  const [waitlistCityFilter, setWaitlistCityFilter] = useState('');
  const [waitlistCities, setWaitlistCities] = useState<string[]>([]);

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
      setUsers(data.users || []);
      setTotalItems(data.pagination.total);
      setTotalPages(data.pagination.totalPages);
    } catch (err: any) {
      setError(err.message || 'Error occurred');
    } finally {
      setLoading(false);
    }
  };

  const fetchWaitlist = async () => {
    setWaitlistLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(waitlistPage + 1),
        limit: String(waitlistPageSize),
      });

      if (waitlistSearch) params.append('search', waitlistSearch);
      if (waitlistCityFilter) params.append('city', waitlistCityFilter);

      const res = await fetch(`/api/admin/waitlist?${params.toString()}`);
      if (!res.ok) {
        throw new Error('Failed to fetch waitlist');
      }
      const data = await res.json();
      setWaitlist(data.waitlist || []);
      if (data.cities) setWaitlistCities(data.cities);
      setWaitlistTotalItems(data.pagination.total);
      setWaitlistTotalPages(data.pagination.totalPages);
    } catch (err: any) {
      console.error('Waitlist fetch error:', err);
    } finally {
      setWaitlistLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'registered') {
      fetchUsers();
    } else {
      fetchWaitlist();
    }
  }, [
    activeTab, 
    page, 
    pageSize, 
    roleFilter, 
    kycFilter, 
    platformRoleFilter, 
    sortField, 
    sortOrder,
    waitlistPage,
    waitlistPageSize,
    waitlistCityFilter
  ]);

  // Initial load of waitlist count for tab badge
  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const res = await fetch('/api/admin/waitlist?limit=1');
        if (res.ok) {
          const data = await res.json();
          setWaitlistTotalItems(data.pagination.total);
          if (data.cities) setWaitlistCities(data.cities);
        }
      } catch (e) {
        // silent
      }
    };
    fetchCounts();
  }, []);

  useEffect(() => {
    // Option A: Subscribe to real-time new user signups via Supabase Realtime
    const supabase = createClient();
    const channel = supabase
      .channel('admin-realtime-signups')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'profiles' },
        (payload: any) => {
          const newProfile = payload.new;
          if (newProfile && newProfile.username) {
            console.log('[Realtime Signup Alert]', newProfile);
            setLatestRealtimeSignup({
              username: newProfile.username,
              role: newProfile.role || 'member',
            });
            // Automatically refresh user list
            if (activeTab === 'registered') fetchUsers();
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'member_waitlist' },
        () => {
          // Auto-refresh waitlist when new signup happens
          fetchWaitlist();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeTab, page, pageSize, roleFilter, kycFilter, platformRoleFilter, sortField, sortOrder, waitlistPage, waitlistPageSize, waitlistCityFilter]);

  // Handle manual trigger for search
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
    fetchUsers();
  };

  const handleWaitlistSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setWaitlistPage(0);
    fetchWaitlist();
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

  // Define Columns for Registered Users
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
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMessageModalUser(row)}
            className="p-1.5 rounded-lg border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20 hover:border-cyan-400 transition-all inline-flex items-center gap-1 text-[10px] font-mono uppercase font-bold"
            title="Send Admin Direct Message"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Message</span>
          </button>
          <Link
            href={`/admin/users/${row.id}`}
            className="p-1.5 rounded-lg border border-white/10 bg-white/5 text-white/60 hover:text-white hover:border-white/20 transition-all inline-flex items-center gap-1 text-[10px] font-mono uppercase font-bold"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Inspect</span>
          </Link>
        </div>
      )
    }
  ];

  // Define Columns for Early Access Waitlist
  const waitlistColumns: Column<WaitlistMember>[] = [
    {
      header: 'Member Email',
      accessorKey: 'email',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full border border-primary/20 bg-primary/10 flex items-center justify-center shrink-0">
            <User className="w-4 h-4 text-primary" />
          </div>
          <div>
            <span className="font-mono font-bold text-xs text-white block">{row.email}</span>
            <span className="text-[10px] text-white/40 font-mono">ID: {row.id.substring(0, 8)}...</span>
          </div>
        </div>
      )
    },
    {
      header: 'City Hub',
      accessorKey: 'city',
      cell: ({ row }) => (
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 font-mono text-xs text-white">
          <MapPin className="w-3 h-3 text-[#00fbfb]" />
          <span>{row.city || 'Global / Other'}</span>
        </div>
      )
    },
    {
      header: 'Cohort Status',
      accessorKey: 'founding_member',
      cell: ({ row }) => (
        <span className={cn(
          "text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border inline-flex items-center gap-1 font-mono",
          row.founding_member
            ? "bg-primary/15 text-primary border-primary/30"
            : "bg-white/5 text-white/50 border-white/10"
        )}>
          <Sparkle className="w-3 h-3 text-primary" />
          {row.founding_member ? 'Founding Member' : 'Standard Member'}
        </span>
      )
    },
    {
      header: 'Signed Up',
      accessorKey: 'created_at',
      cell: ({ row }) => (
        <div className="flex items-center gap-1.5 text-white/50 font-mono text-xs">
          <Clock className="w-3.5 h-3.5" />
          <span>{new Date(row.created_at).toLocaleString()}</span>
        </div>
      )
    },
    {
      header: 'Contact Action',
      accessorKey: 'id',
      cell: ({ row }) => (
        <a
          href={`mailto:${row.email}?subject=Welcome%20to%20SECCION%20Founding%20Member%20Early%20Access`}
          className="px-2.5 py-1.5 rounded-lg border border-primary/30 bg-primary/10 text-primary hover:bg-primary/20 hover:border-primary/50 transition-all inline-flex items-center gap-1.5 text-[10px] font-mono uppercase font-bold"
        >
          <span>Send Invitation</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Option A: Real-Time Signup Alert Banner */}
      {latestRealtimeSignup && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-purple-500/20 border border-cyan-500/40 text-white flex items-center justify-between shadow-xl shadow-cyan-500/10 animate-in slide-in-from-top duration-300">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-cyan-500/30 border border-cyan-400 flex items-center justify-center text-cyan-300 shrink-0">
              <Bell className="w-4 h-4 animate-bounce" />
            </div>
            <div>
              <h4 className="text-xs font-bold font-mono tracking-tight flex items-center gap-2">
                🎉 Real-Time Signup Alert (Option A Active)
              </h4>
              <p className="text-[11px] text-cyan-200">
                <strong className="text-white">@{latestRealtimeSignup.username}</strong> just registered as a <span className="uppercase font-mono font-bold text-cyan-300">{latestRealtimeSignup.role}</span>!
              </p>
            </div>
          </div>
          <button
            onClick={() => setLatestRealtimeSignup(null)}
            className="px-3 py-1 rounded-lg bg-black/40 border border-white/10 hover:bg-black/60 text-xs font-mono text-white/70"
          >
            Dismiss
          </button>
        </div>
      )}

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
          onClick={activeTab === 'registered' ? fetchUsers : fetchWaitlist}
          className="self-start p-2 rounded-xl border border-white/10 bg-white/5 text-white/60 hover:text-white hover:border-primary/45 transition-all"
          title="Refresh Data"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Tabs navigation */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-2">
        <button
          onClick={() => setActiveTab('registered')}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono uppercase font-bold tracking-wider transition-all",
            activeTab === 'registered'
              ? "bg-primary text-black shadow-[0_0_15px_rgba(0,251,251,0.3)]"
              : "text-white/60 hover:text-white hover:bg-white/5"
          )}
        >
          <UsersIcon className="w-3.5 h-3.5" />
          <span>Registered Profiles</span>
          <span className={cn(
            "text-[10px] px-1.5 py-0.5 rounded-full font-mono",
            activeTab === 'registered' ? "bg-black/20 text-black" : "bg-white/10 text-white/70"
          )}>
            {totalItems}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('waitlist')}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono uppercase font-bold tracking-wider transition-all",
            activeTab === 'waitlist'
              ? "bg-primary text-black shadow-[0_0_15px_rgba(0,251,251,0.3)]"
              : "text-white/60 hover:text-white hover:bg-white/5"
          )}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Early Access Waitlist</span>
          <span className={cn(
            "text-[10px] px-1.5 py-0.5 rounded-full font-mono font-bold",
            activeTab === 'waitlist' ? "bg-black/20 text-black" : "bg-primary/20 text-primary border border-primary/30"
          )}>
            {waitlistTotalItems}
          </span>
        </button>
      </div>

      {/* Tab 1: Registered Users View */}
      {activeTab === 'registered' && (
        <>
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
        </>
      )}

      {/* Tab 2: Early Access Waitlist View */}
      {activeTab === 'waitlist' && (
        <>
          {/* Filters Form for Waitlist */}
          <div className="glass p-5 rounded-2xl">
            <form onSubmit={handleWaitlistSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-end">
              {/* Search by email */}
              <div className="md:col-span-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/40 block mb-2 font-mono">
                  Search Member Email
                </label>
                <div className="relative group">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 group-focus-within:text-primary transition-colors" />
                  <input
                    type="text"
                    placeholder="Enter email to search..."
                    value={waitlistSearch}
                    onChange={(e) => setWaitlistSearch(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl py-2 pl-11 pr-4 outline-none focus:border-primary/50 focus:bg-black/60 transition-all text-xs font-semibold text-white placeholder-white/30"
                  />
                </div>
              </div>

              {/* City filter */}
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-white/40 block mb-2 font-mono">
                  Filter by City Hub
                </label>
                <select
                  value={waitlistCityFilter}
                  onChange={(e) => { setWaitlistCityFilter(e.target.value); setWaitlistPage(0); }}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primary/50"
                >
                  <option value="">All Cities</option>
                  {waitlistCities.map((city) => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>

              {/* Total Summary Badge */}
              <div className="flex items-center justify-end">
                <div className="px-4 py-2 rounded-xl bg-primary/10 border border-primary/20 text-right">
                  <div className="text-[10px] font-mono uppercase text-white/50">Total Signups</div>
                  <div className="text-base font-mono font-black text-primary">{waitlistTotalItems}</div>
                </div>
              </div>
            </form>
          </div>

          {/* Waitlist Data Table */}
          <div className="glass-card p-6 min-h-[400px]">
            <DataTable
              columns={waitlistColumns}
              data={waitlist}
              loading={waitlistLoading}
              pageIndex={waitlistPage}
              pageSize={waitlistPageSize}
              pageCount={waitlistTotalPages}
              totalItems={waitlistTotalItems}
              onPageChange={setWaitlistPage}
              onPageSizeChange={(size) => { setWaitlistPageSize(size); setWaitlistPage(0); }}
              getRowId={(row) => row.id}
            />
          </div>
        </>
      )}

      {/* Direct Message Modal */}
      <AdminSendMessageModal
        isOpen={!!messageModalUser}
        targetUser={messageModalUser}
        onClose={() => setMessageModalUser(null)}
        onSuccess={fetchUsers}
      />
    </div>
  );
}
