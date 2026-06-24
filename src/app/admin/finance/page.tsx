'use client';

import { useState, useEffect } from 'react';
import { Coins, CreditCard, Languages, ArrowUpRight, DollarSign, Activity, Loader2, RefreshCw } from 'lucide-react';
import KPICard from '@/components/admin/KPICard';
import AdminChart from '@/components/admin/AdminChart';
import DataTable, { Column } from '@/components/admin/DataTable';
import { cn } from '@/lib/utils';

interface SubscriptionTransaction {
  id: string;
  tier: string;
  price_paid: number;
  is_active: boolean;
  created_at: string;
  subscriber?: {
    id: string;
    username: string;
  };
  creator?: {
    id: string;
    username: string;
  };
}

interface FinanceDashboardAggs {
  kpis: {
    totalRevenue: number;
    mrr: number;
    platformCut: number;
    translationRevenue: number;
    activeSubs: number;
    activeVip: number;
    activeMaster: number;
  };
  revenueTrend: { date: string; amount: number }[];
}

export default function FinancialReconciliationCenter() {
  const [aggs, setAggs] = useState<FinanceDashboardAggs | null>(null);
  const [transactions, setTransactions] = useState<SubscriptionTransaction[]>([]);
  const [loadingAggs, setLoadingAggs] = useState(true);
  const [loadingSubs, setLoadingSubs] = useState(true);

  // Pagination
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const fetchAggs = async () => {
    setLoadingAggs(true);
    try {
      const res = await fetch('/api/admin/dashboard');
      if (!res.ok) throw new Error('Failed to fetch dashboard aggregates');
      const data = await res.json();
      setAggs({
        kpis: data.kpis,
        revenueTrend: data.revenueTrend,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAggs(false);
    }
  };

  const fetchTransactions = async () => {
    setLoadingSubs(true);
    try {
      const params = new URLSearchParams({
        page: String(page + 1),
        limit: String(pageSize),
      });
      const res = await fetch(`/api/admin/finance?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch subscription records');
      const data = await res.json();
      setTransactions(data.subscriptions);
      setTotalItems(data.pagination.total);
      setTotalPages(data.pagination.totalPages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingSubs(false);
    }
  };

  useEffect(() => {
    fetchAggs();
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [page, pageSize]);

  const handleRefresh = () => {
    fetchAggs();
    fetchTransactions();
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
    }).format(val);
  };

  const getTierBreakdownData = () => {
    if (!aggs) return [];
    return [
      { name: 'VIP Tier', count: aggs.kpis.activeVip },
      { name: 'Master Tier', count: aggs.kpis.activeMaster },
    ];
  };

  const columns: Column<SubscriptionTransaction>[] = [
    {
      header: 'Transaction ID',
      accessorKey: 'id',
      cell: ({ row }) => <span className="font-mono text-white/50">{row.id.substring(0, 8)}...</span>
    },
    {
      header: 'Timestamp',
      accessorKey: 'created_at',
      cell: ({ row }) => <span className="font-mono text-white/40">{new Date(row.created_at).toLocaleString()}</span>
    },
    {
      header: 'Subscriber',
      accessorKey: 'id',
      cell: ({ row }) => (
        <span className="font-bold text-white">
          {row.subscriber ? `@${row.subscriber.username}` : 'unknown'}
        </span>
      )
    },
    {
      header: 'Creator',
      accessorKey: 'id',
      cell: ({ row }) => (
        <span className="font-bold text-[#ffabf3]">
          {row.creator ? `@${row.creator.username}` : 'unknown'}
        </span>
      )
    },
    {
      header: 'Tier',
      accessorKey: 'tier',
      cell: ({ row }) => (
        <span className={cn(
          "text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md border font-mono",
          row.tier === 'master'
            ? "bg-red-500/10 text-red-400 border-red-500/25"
            : "bg-primary/10 text-primary border-primary/25"
        )}>
          {row.tier}
        </span>
      )
    },
    {
      header: 'Gross Price',
      accessorKey: 'price_paid',
      cell: ({ row }) => <span className="font-mono font-bold text-white">{formatCurrency(row.price_paid)}</span>
    },
    {
      header: 'Creator (80%)',
      accessorKey: 'price_paid',
      cell: ({ row }) => <span className="font-mono text-white/60">{formatCurrency(row.price_paid * 0.80)}</span>
    },
    {
      header: 'Platform (20%)',
      accessorKey: 'price_paid',
      cell: ({ row }) => <span className="font-mono text-primary font-bold">{formatCurrency(row.price_paid * 0.20)}</span>
    },
    {
      header: 'Status',
      accessorKey: 'is_active',
      cell: ({ row }) => (
        <span className={cn(
          "text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md border font-mono",
          row.is_active ? "bg-success/15 border-success/35 text-success" : "bg-white/5 border-white/10 text-white/40"
        )}>
          {row.is_active ? 'Active' : 'Expired'}
        </span>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-['Outfit'] text-2xl font-black text-white tracking-tight uppercase flex items-center gap-2">
            <Coins className="w-7 h-7 text-primary" />
            FINANCIAL RECONCILIATION CENTER
          </h2>
          <p className="text-xs text-white/50 font-medium mt-1">
            Audit subscription logs, calculate 20% platform commission cuts, and trace speech translation micropayments.
          </p>
        </div>

        <button 
          onClick={handleRefresh}
          className="self-start p-2 rounded-xl border border-white/10 bg-white/5 text-white/60 hover:text-white hover:border-primary/45 transition-all"
          title="Refresh Data"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Total Gross Revenue"
          value={loadingAggs ? '...' : formatCurrency(aggs?.kpis.totalRevenue || 0)}
          icon={DollarSign}
          loading={loadingAggs}
        />
        <KPICard
          title="Active MRR (Active Subs)"
          value={loadingAggs ? '...' : formatCurrency(aggs?.kpis.mrr || 0)}
          icon={CreditCard}
          loading={loadingAggs}
        />
        <KPICard
          title="Commission Cut (20%)"
          value={loadingAggs ? '...' : formatCurrency(aggs?.kpis.platformCut || 0)}
          icon={Coins}
          loading={loadingAggs}
        />
        <KPICard
          title="Speech & Text Micropayments"
          value={loadingAggs ? '...' : formatCurrency(aggs?.kpis.translationRevenue || 0)}
          icon={Languages}
          loading={loadingAggs}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass-card p-6 lg:col-span-2">
          <h3 className="font-['Outfit'] text-sm font-black uppercase tracking-widest text-white/60 mb-6">
            Gross Subscription Revenue Trend (30D)
          </h3>
          {loadingAggs ? (
            <div className="h-[260px] w-full bg-white/5 rounded-xl animate-pulse" />
          ) : (
            <AdminChart
              type="area"
              data={aggs?.revenueTrend || []}
              index="date"
              categories={['amount']}
              colors={['#39FF14']}
              height={260}
              valueFormatter={formatCurrency}
            />
          )}
        </div>

        <div className="glass-card p-6">
          <h3 className="font-['Outfit'] text-sm font-black uppercase tracking-widest text-white/60 mb-6">
            Subscriber Tier Share
          </h3>
          {loadingAggs ? (
            <div className="h-[260px] w-full bg-white/5 rounded-xl animate-pulse" />
          ) : (
            <AdminChart
              type="pie"
              data={getTierBreakdownData()}
              index="name"
              categories={['count']}
              colors={['#66FCF1', '#FF204E']}
              height={260}
            />
          )}
        </div>
      </div>

      {/* Ledger DataTable */}
      <div className="glass-card p-6">
        <h3 className="font-['Outfit'] text-sm font-black uppercase tracking-widest text-white/60 mb-6">
          TRANSACTION LEDGER
        </h3>
        
        <DataTable
          columns={columns}
          data={transactions}
          loading={loadingSubs}
          pageIndex={page}
          pageSize={pageSize}
          pageCount={totalPages}
          totalItems={totalItems}
          onPageChange={setPage}
          onPageSizeChange={(size) => { setPageSize(size); setPage(0); }}
        />
      </div>

    </div>
  );
}
