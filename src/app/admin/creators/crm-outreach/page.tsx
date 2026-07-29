'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  Search, 
  Check, 
  ExternalLink, 
  RefreshCw,
  FileText,
  Target,
  MapPin
} from 'lucide-react';
import DataTable, { Column } from '@/components/admin/DataTable';
import { cn } from '@/lib/utils';

interface CRMLead {
  id: string;
  full_name: string;
  email: string;
  city: string;
  instagram_handle: string;
  tiktok_handle: string;
  status: string;
  outreach_stage: string;
  reviewer_notes: string;
  created_at: string;
}

const OUTREACH_STAGES = [
  'To Contact',
  'First DM Sent',
  'Follow-up Sent',
  'In Conversation',
  'Call Booked',
  'Applied',
  'Not Interested'
];

const STATUS_OPTIONS = [
  'lead_identified', 
  'dm_sent', 
  'application_submitted', 
  'under_review', 
  'waitlist', 
  'approved_onboarded', 
  'rejected'
];

const formatStatus = (status: string) => {
  return status.replace(/_/g, ' ').toUpperCase();
};

export default function CRMOutreachPage() {
  const [leads, setLeads] = useState<CRMLead[]>([]);
  const [cityStats, setCityStats] = useState<Record<string, { total: number, approved: number }>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination & Filtering state
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  
  // Local state for edits
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page + 1),
        limit: String(pageSize),
        status: statusFilter,
      });

      if (search) params.append('search', search);
      
      const res = await fetch(`/api/admin/crm-outreach?${params.toString()}`);
      if (!res.ok) {
        throw new Error('Failed to fetch CRM leads');
      }
      
      const data = await res.json();
      setLeads(data.leads || []);
      setCityStats(data.cityStats || {});
      setTotalItems(data.totalCount || 0);
      setTotalPages(Math.ceil((data.totalCount || 0) / pageSize));

      // Initialize notes state
      const initialNotes: Record<string, string> = {};
      (data.leads || []).forEach((lead: CRMLead) => {
        if (lead.reviewer_notes) {
          initialNotes[lead.id] = lead.reviewer_notes;
        }
      });
      setNotes(prev => ({ ...initialNotes, ...prev }));
      
    } catch (err: any) {
      setError(err.message || 'Error occurred');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, statusFilter, search]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
    fetchLeads();
  };

  const handleUpdate = async (id: string, updates: Partial<CRMLead>) => {
    setActionLoading(id);
    try {
      const res = await fetch('/api/admin/crm-outreach', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          ...updates
        })
      });
      
      if (!res.ok) throw new Error('Update failed');
      
      const updatedLead = await res.json();
      
      setLeads(prev => prev.map(lead => {
        if (lead.id === id) {
          return { ...lead, ...updatedLead.lead };
        }
        return lead;
      }));
      
      // Update local notes if they were saved
      if (updates.reviewer_notes !== undefined) {
         setNotes(prev => ({ ...prev, [id]: updates.reviewer_notes as string }));
      }
      
    } catch (err: any) {
      alert(err.message || 'An error occurred');
    } finally {
      setActionLoading(null);
    }
  };

  const columns: Column<CRMLead>[] = [
    {
      header: 'Lead Info',
      accessorKey: 'full_name',
      cell: ({ row }) => (
        <div className="min-w-0">
          <span className="font-bold text-white block truncate">{row.full_name}</span>
          <span className="text-[10px] text-white/45 truncate block">
            {row.email || 'No email provided'}
          </span>
        </div>
      )
    },
    {
      header: 'Location',
      accessorKey: 'city',
      cell: ({ row }) => (
        <span className="text-white/80 flex items-center gap-1 text-xs">
          <MapPin className="w-3 h-3 text-[#00fbfb]" />
          {row.city || '-'}
        </span>
      )
    },
    {
      header: 'Social Handles',
      accessorKey: 'instagram_handle',
      cell: ({ row }) => {
        return (
          <div className="flex flex-col gap-1.5">
            {row.instagram_handle && (
              <a 
                href={`https://instagram.com/${row.instagram_handle.replace('@', '')}`} 
                target="_blank" 
                rel="noreferrer" 
                className="text-[#ffabf3] hover:text-white hover:underline text-[10px] flex items-center gap-1 max-w-[150px] truncate"
              >
                <ExternalLink className="w-3 h-3 shrink-0" />
                <span className="truncate">IG: {row.instagram_handle}</span>
              </a>
            )}
            {row.tiktok_handle && (
              <a 
                href={`https://tiktok.com/@${row.tiktok_handle.replace('@', '')}`} 
                target="_blank" 
                rel="noreferrer" 
                className="text-[#00fbfb] hover:text-white hover:underline text-[10px] flex items-center gap-1 max-w-[150px] truncate"
              >
                <ExternalLink className="w-3 h-3 shrink-0" />
                <span className="truncate">TikTok: {row.tiktok_handle}</span>
              </a>
            )}
            {!row.instagram_handle && !row.tiktok_handle && (
              <span className="text-white/40 text-xs">-</span>
            )}
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
            case 'approved_onboarded': return 'bg-success/10 text-success border-success/20';
            case 'application_submitted': 
            case 'under_review': return 'bg-[#00fbfb]/10 text-[#00fbfb] border-[#00fbfb]/20';
            case 'waitlist': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
            case 'rejected': return 'bg-red-500/10 text-red-500 border-red-500/20';
            case 'dm_sent': return 'bg-[#ffabf3]/10 text-[#ffabf3] border-[#ffabf3]/20';
            default: return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
          }
        };
        
        return (
          <select
             value={row.status || 'lead_identified'}
             onChange={(e) => handleUpdate(row.id, { status: e.target.value })}
             disabled={actionLoading === row.id}
             className={cn(
               "text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded-md border inline-flex items-center gap-1 font-mono outline-none appearance-none cursor-pointer",
               getStatusStyles(row.status || 'lead_identified'),
               actionLoading === row.id && "opacity-50"
             )}
          >
            {STATUS_OPTIONS.map(opt => (
              <option key={opt} value={opt} className="bg-black text-white">{formatStatus(opt)}</option>
            ))}
          </select>
        );
      }
    },
    {
      header: 'Outreach Stage',
      accessorKey: 'outreach_stage',
      cell: ({ row }) => {
         return (
          <select
            value={row.outreach_stage || 'To Contact'}
            onChange={(e) => handleUpdate(row.id, { outreach_stage: e.target.value })}
            disabled={actionLoading === row.id}
            className="bg-black/40 border border-white/10 rounded-lg px-2 py-1.5 text-[10px] text-white focus:outline-none focus:border-[#00fbfb]/50 cursor-pointer disabled:opacity-50 appearance-none font-semibold min-w-[120px]"
          >
            <option value="" disabled className="bg-black text-white/50">Select Stage...</option>
            {OUTREACH_STAGES.map(stage => (
              <option key={stage} value={stage} className="bg-black text-white">{stage}</option>
            ))}
          </select>
         );
      }
    },
    {
      header: 'Reviewer Notes',
      accessorKey: 'actions',
      cell: ({ row }) => {
        const currentNote = notes[row.id] ?? '';
        const isLoading = actionLoading === row.id;
        const isModified = currentNote !== (row.reviewer_notes || '');
        
        return (
          <div className="flex flex-col gap-2 min-w-[200px]">
            <textarea
              value={currentNote}
              onChange={(e) => setNotes(prev => ({ ...prev, [row.id]: e.target.value }))}
              placeholder="Add outreach notes..."
              className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-xs text-white placeholder-white/30 focus:border-[#ffabf3]/50 focus:bg-black/60 transition-all min-h-[60px] resize-y outline-none"
            />
            
            {isModified && (
              <button
                onClick={() => handleUpdate(row.id, { reviewer_notes: currentNote })}
                disabled={isLoading}
                className="self-end px-3 py-1 rounded-md border border-[#00fbfb]/30 bg-[#00fbfb]/10 text-[#00fbfb] hover:bg-[#00fbfb]/20 active:scale-95 transition-all text-[9px] uppercase font-bold flex items-center gap-1 disabled:opacity-50"
              >
                <Check className="w-3 h-3" /> Save Note
              </button>
            )}
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
            <Target className="w-6 h-6 text-[#ffabf3]" />
            CRM OUTREACH
          </h2>
          <p className="text-xs text-white/50 font-medium mt-1">
            Manage creator leads, track DMs, and move candidates through the pipeline.
          </p>
        </div>

        <button 
          onClick={fetchLeads}
          className="self-start p-2 rounded-xl border border-white/10 bg-white/5 text-white/60 hover:text-white hover:border-[#00fbfb]/45 transition-all"
          title="Refresh Leads"
        >
          <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
        </button>
      </div>

      {/* City Milestones */}
      {Object.keys(cityStats).length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Object.entries(cityStats).map(([city, stats]) => (
            <div key={city} className="glass p-4 rounded-2xl flex flex-col gap-2 relative overflow-hidden group border-white/5 hover:border-[#00fbfb]/30 transition-colors">
              <div className="flex items-center justify-between">
                 <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5 z-10">
                   <MapPin className="w-4 h-4 text-[#ffabf3]" /> {city}
                 </h3>
                 <span className="text-[10px] font-mono text-[#00fbfb] bg-[#00fbfb]/10 px-2 py-0.5 rounded-full z-10">
                   {stats.approved} / {stats.total} Appr
                 </span>
              </div>
              <div className="flex items-center gap-4 mt-2 z-10">
                <div className="flex-1">
                  <div className="text-[10px] text-white/50 font-mono mb-1 uppercase">Total Leads</div>
                  <div className="text-xl font-black text-white">{stats.total}</div>
                </div>
                <div className="w-px h-8 bg-white/10"></div>
                <div className="flex-1">
                  <div className="text-[10px] text-white/50 font-mono mb-1 uppercase">Approved</div>
                  <div className="text-xl font-black text-white">{stats.approved}</div>
                </div>
              </div>
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none scale-150 -translate-y-1/4 translate-x-1/4">
                 <Target className="w-24 h-24 text-[#00fbfb]" />
              </div>
            </div>
          ))}
        </div>
      )}

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
                placeholder="Enter lead name or email..."
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
              className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00fbfb]/50 cursor-pointer appearance-none"
            >
              <option value="All">All Leads</option>
              {STATUS_OPTIONS.map(opt => (
                <option key={opt} value={opt} className="bg-black text-white">{formatStatus(opt)}</option>
              ))}
            </select>
          </div>
        </form>
      </div>

      {/* Main Table */}
      <div className="glass-card p-6 min-h-[400px]">
        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-xs rounded-lg">
            {error}
          </div>
        )}
        <DataTable
          columns={columns}
          data={leads}
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
