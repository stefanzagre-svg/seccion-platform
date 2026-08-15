'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  Search, 
  Check, 
  X, 
  Clock, 
  ExternalLink, 
  RefreshCw,
  FileText,
  Users
} from 'lucide-react';
import DataTable, { Column } from '@/components/admin/DataTable';
import { cn } from '@/lib/utils';

interface CreatorApplication {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  city: string;
  telegram: string;
  link1?: string;
  link2?: string;
  link3?: string;
  social_links?: any;
  status: 'pending' | 'waitlist' | 'approved' | 'rejected';
  created_at: string;
  reviewer_notes: string;
}

export default function CreatorApplicationsQueue() {
  const [applications, setApplications] = useState<CreatorApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination & Filtering state
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  
  // Local state for reviewer notes before saving
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page + 1),
        limit: String(pageSize),
        status: statusFilter,
      });

      if (search) params.append('search', search);
      
      const res = await fetch(`/api/admin/creator-applications?${params.toString()}`);
      if (!res.ok) {
        throw new Error('Failed to fetch applications');
      }
      
      const data = await res.json();
      setApplications(data.applications || []);
      setTotalItems(data.totalCount || 0);
      setTotalPages(Math.ceil((data.totalCount || 0) / pageSize));

      // Initialize notes state with fetched data
      const initialNotes: Record<string, string> = {};
      (data.applications || []).forEach((app: CreatorApplication) => {
        if (app.reviewer_notes) {
          initialNotes[app.id] = app.reviewer_notes;
        }
      });
      // Merge with existing edited notes (don't overwrite unsaved local edits if any)
      setNotes(prev => ({ ...initialNotes, ...prev }));
      
    } catch (err: any) {
      setError(err.message || 'Error occurred');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, statusFilter, search]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
    fetchApplications();
  };

  const handleAction = async (id: string, action: string) => {
    setActionLoading(id);
    try {
      const currentNote = notes[id] || '';
      const res = await fetch('/api/admin/creator-applications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          action,
          reviewer_notes: currentNote,
        })
      });
      
      if (!res.ok) throw new Error('Action failed');
      
      // Update local state to reflect changes instantly
      setApplications(prev => prev.map(app => {
        if (app.id === id) {
          return { 
            ...app, 
            status: action === 'approve' ? 'approved' : action === 'waitlist' ? 'waitlist' : 'rejected',
            reviewer_notes: currentNote 
          };
        }
        return app;
      }));
      
    } catch (err: any) {
      alert(err.message || 'An error occurred');
    } finally {
      setActionLoading(null);
    }
  };

  // Define Columns
  const columns: Column<CreatorApplication>[] = [
    {
      header: 'Applicant',
      accessorKey: 'full_name',
      cell: ({ row }) => (
        <div className="min-w-0">
          <span className="font-bold text-white block truncate">{row.full_name}</span>
          <span className="text-[10px] text-white/45 truncate block">
            {row.email}
          </span>
        </div>
      )
    },
    {
      header: 'Location',
      accessorKey: 'city',
      cell: ({ row }) => <span className="text-white/80">{row.city || '-'}</span>
    },
    {
      header: 'Direct Contact',
      accessorKey: 'telegram',
      cell: ({ row }) => (
        <div className="flex flex-col gap-1 text-[11px]">
          {row.phone ? (
            <span className="text-[#00fbfb] font-mono flex items-center gap-1 font-bold">
              📱 {row.phone}
            </span>
          ) : (
            <span className="text-white/30 text-[9px] font-mono">No phone</span>
          )}
          {row.telegram ? (
            <span className="text-[#ffabf3] font-mono flex items-center gap-1">
              ✈️ {row.telegram.startsWith('@') ? row.telegram : `@${row.telegram}`}
            </span>
          ) : (
            <span className="text-white/30 text-[9px] font-mono">No telegram</span>
          )}
        </div>
      )
    },
    {
      header: 'Social Links',
      accessorKey: 'link1',
      cell: ({ row }) => {
        let links: string[] = [];
        
        // Aggregate link1, link2, link3 if present
        if (row.link1) links.push(row.link1);
        if (row.link2) links.push(row.link2);
        if (row.link3) links.push(row.link3);

        // Also check legacy social_links array/string if link1 was empty
        if (links.length === 0 && row.social_links) {
          if (Array.isArray(row.social_links)) {
            links = row.social_links;
          } else if (typeof row.social_links === 'string') {
            try {
              const parsed = JSON.parse(row.social_links);
              if (Array.isArray(parsed)) links = parsed;
              else links = [row.social_links];
            } catch {
              links = row.social_links.split(',').map((s: string) => s.trim()).filter(Boolean);
            }
          }
        }

        if (links.length === 0) return <span className="text-white/40">-</span>;

        return (
          <div className="flex flex-col gap-1.5 min-w-[140px]">
            {links.map((link, i) => (
              <a 
                key={i} 
                href={link.startsWith('http') ? link : `https://${link}`} 
                target="_blank" 
                rel="noreferrer" 
                className="text-[#00fbfb] hover:text-white hover:underline text-[10px] font-mono flex items-center gap-1 max-w-[180px] truncate bg-white/5 px-2 py-0.5 rounded border border-white/5 hover:border-[#00fbfb]/30 transition"
                title={link}
              >
                <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                <span className="truncate">{link.replace(/^https?:\/\/(www\.)?/, '')}</span>
              </a>
            ))}
          </div>
        );
      }
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: ({ row }) => {
        const getStatusStyles = (status: string) => {
          switch (status) {
            case 'approved': return 'bg-success/10 text-success border-success/20';
            case 'waitlist': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
            case 'rejected': return 'bg-red-500/10 text-red-500 border-red-500/20';
            default: return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
          }
        };
        
        const getStatusIcon = (status: string) => {
          switch (status) {
            case 'approved': return <Check className="w-2.5 h-2.5" />;
            case 'waitlist': return <Clock className="w-2.5 h-2.5" />;
            case 'rejected': return <X className="w-2.5 h-2.5" />;
            default: return <Clock className="w-2.5 h-2.5" />;
          }
        };

        return (
          <span className={cn(
            "text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md border inline-flex items-center gap-1 font-mono",
            getStatusStyles(row.status)
          )}>
            {getStatusIcon(row.status)}
            {row.status || 'pending'}
          </span>
        );
      }
    },
    {
      header: 'Applied Date',
      accessorKey: 'created_at',
      cell: ({ row }) => <span className="font-mono text-[10px] text-white/50">{new Date(row.created_at).toLocaleDateString()}</span>
    },
    {
      header: 'Review & Actions',
      accessorKey: 'actions',
      cell: ({ row }) => {
        const currentNote = notes[row.id] ?? '';
        const isLoading = actionLoading === row.id;
        
        return (
          <div className="flex flex-col gap-3 min-w-[240px]">
            <textarea
              value={currentNote}
              onChange={(e) => setNotes(prev => ({ ...prev, [row.id]: e.target.value }))}
              placeholder="Reviewer notes..."
              className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-xs text-white placeholder-white/30 focus:border-[#ffabf3]/50 focus:bg-black/60 transition-all min-h-[60px] resize-y outline-none"
            />
            
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => handleAction(row.id, 'approve')}
                disabled={isLoading}
                className="flex-1 min-w-[70px] px-2 py-1.5 rounded-lg border border-success/30 bg-success/10 text-success hover:bg-success/20 active:scale-95 transition-all text-[10px] uppercase font-bold flex items-center justify-center gap-1 disabled:opacity-50"
              >
                <Check className="w-3 h-3" /> Approve
              </button>
              
              <button
                onClick={() => handleAction(row.id, 'waitlist')}
                disabled={isLoading}
                title="Your profile is being reviewed"
                className="flex-1 min-w-[70px] px-2 py-1.5 rounded-lg border border-blue-500/30 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 active:scale-95 transition-all text-[10px] uppercase font-bold flex items-center justify-center gap-1 disabled:opacity-50 group relative"
              >
                <Clock className="w-3 h-3" /> Waitlist
              </button>
              
              <button
                onClick={() => handleAction(row.id, 'reject')}
                disabled={isLoading}
                className="flex-1 min-w-[70px] px-2 py-1.5 rounded-lg border border-red-500/30 bg-red-500/10 text-red-500 hover:bg-red-500/20 active:scale-95 transition-all text-[10px] uppercase font-bold flex items-center justify-center gap-1 disabled:opacity-50"
              >
                <X className="w-3 h-3" /> Reject
              </button>
            </div>
          </div>
        );
      }
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-['Outfit'] text-2xl font-black text-white tracking-tight uppercase flex items-center gap-2">
            <Users className="w-6 h-6 text-[#00fbfb]" />
            CREATOR APPLICATIONS QUEUE
          </h2>
          <p className="text-xs text-white/50 font-medium mt-1">
            Review, waitlist, or approve incoming creator applications.
          </p>
        </div>

        <button 
          onClick={fetchApplications}
          className="self-start p-2 rounded-xl border border-white/10 bg-white/5 text-white/60 hover:text-white hover:border-[#00fbfb]/45 transition-all"
          title="Refresh Queue"
        >
          <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
        </button>
      </div>

      {/* Filters Form */}
      <div className="glass p-5 rounded-2xl">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-end">
          {/* Search */}
          <div className="sm:col-span-2 md:col-span-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-white/40 block mb-2 font-mono">
              Search by Name or Email
            </label>
            <div className="relative group">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 group-focus-within:text-[#00fbfb] transition-colors" />
              <input
                type="text"
                placeholder="Enter applicant name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl py-2 pl-11 pr-4 outline-none focus:border-[#00fbfb]/50 focus:bg-black/60 transition-all text-xs font-semibold text-white placeholder-white/30"
              />
            </div>
          </div>

          {/* Status filter */}
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-white/40 block mb-2 font-mono flex items-center gap-1">
              <FileText className="w-3 h-3" /> Status Filter
            </label>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00fbfb]/50"
            >
              <option value="All">All Applications</option>
              <option value="pending">Pending</option>
              <option value="waitlist">Waitlist</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </form>
      </div>

      {/* Main Table */}
      <div className="glass-card p-6 min-h-[400px]">
        <DataTable
          columns={columns}
          data={applications}
          loading={loading}
          pageIndex={page}
          pageSize={pageSize}
          pageCount={totalPages}
          totalItems={totalItems}
          onPageChange={setPage}
          onPageSizeChange={(size) => { setPageSize(size); setPage(0); }}
          getRowId={(row) => row.id}
        />
      </div>
    </div>
  );
}
