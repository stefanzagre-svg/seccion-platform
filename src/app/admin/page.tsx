'use client';

import { useState, useEffect } from 'react';
import { 
  Users, 
  Tv, 
  DollarSign, 
  ShieldAlert, 
  Radio, 
  CreditCard,
  Languages,
  Activity
} from 'lucide-react';
import KPICard from '@/components/admin/KPICard';
import AdminChart from '@/components/admin/AdminChart';

interface DashboardData {
  kpis: {
    totalUsers: number;
    totalCreators: number;
    totalMembers: number;
    kycVerified: number;
    activeSubs: number;
    activeVip: number;
    activeMaster: number;
    totalRevenue: number;
    mrr: number;
    platformCut: number;
    translationRevenue: number;
    goalRevenue: number;
    moderationPending: number;
    activeLiveStreams: number;
    totalViewers: number;
  };
  userGrowth: { date: string; count: number }[];
  revenueTrend: { date: string; amount: number }[];
  relationshipDistribution: { level: string; count: number }[];
  moderationStats: {
    total: number;
    pending: number;
    underReview: number;
    approved: number;
    rejected: number;
    escalated: number;
  };
}

export default function DashboardOverview() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const res = await fetch('/api/admin/dashboard');
        if (!res.ok) {
          throw new Error(`Failed to load dashboard data: ${res.statusText}`);
        }
        const json = await res.json();
        setData(json);
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'An error occurred while loading dashboard');
      } finally {
        setLoading(false);
      }
    }
    fetchDashboard();
  }, []);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center px-4">
        <div className="p-4 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 mb-4">
          <ShieldAlert className="w-8 h-8 animate-bounce" />
        </div>
        <h2 className="font-['Outfit'] text-lg font-black uppercase tracking-wider text-white mb-2">
          Station Connection Error
        </h2>
        <p className="text-sm text-white/50 max-w-md mb-6">{error}</p>
        <button
          onClick={() => {
            setLoading(true);
            setError(null);
            window.location.reload();
          }}
          className="px-5 py-2.5 bg-primary hover:bg-primary-foreground text-black font-semibold rounded-xl text-xs uppercase tracking-wider transition-all"
        >
          Re-establish Connection
        </button>
      </div>
    );
  }

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2
    }).format(val);
  };

  const formatNumber = (val: number) => {
    return new Intl.NumberFormat('en-US').format(val);
  };

  // Map database level to readable names
  const getLevelLabel = (level: string) => {
    const maps: Record<string, string> = {
      '1': 'Strangers',
      '2': 'Acquaintances',
      '3': 'Friendly',
      '4': 'Close',
      '5': 'Intimate',
      '6': 'Passionate',
      '7': 'Committed',
      '8': 'Soulmate',
    };
    return maps[level] || `Level ${level}`;
  };

  const getRelationshipChartData = () => {
    if (!data?.relationshipDistribution) return [];
    return data.relationshipDistribution.map(d => ({
      name: getLevelLabel(d.level),
      value: d.count,
    }));
  };

  const getModerationChartData = () => {
    if (!data?.moderationStats) return [];
    const stats = data.moderationStats;
    return [
      { name: 'Pending', count: stats.pending },
      { name: 'Under Review', count: stats.underReview },
      { name: 'Approved', count: stats.approved },
      { name: 'Rejected', count: stats.rejected },
      { name: 'Escalated', count: stats.escalated },
    ];
  };

  return (
    <div className="space-y-8">
      {/* Welcome header info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-['Outfit'] text-2xl font-black text-white tracking-tight">
            SYSTEM STATUS OVERVIEW
          </h2>
          <p className="text-xs text-white/50 font-medium mt-1">
            Real-time analytics and system monitoring of dating feeds, creators, and platform financials.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-white/40 bg-white/5 border border-white/10 px-4 py-2 rounded-xl">
          <Activity className="w-4 h-4 text-primary animate-pulse" />
          SYSTEM LIVE & ONLINE
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Total Users"
          value={loading ? '...' : formatNumber(data?.kpis.totalUsers || 0)}
          icon={Users}
          change={14.2}
          changeType="positive"
          loading={loading}
        />
        <KPICard
          title="Total Creators"
          value={loading ? '...' : formatNumber(data?.kpis.totalCreators || 0)}
          icon={Tv}
          change={8.5}
          changeType="positive"
          loading={loading}
        />
        <KPICard
          title="Total Revenue (Gross)"
          value={loading ? '...' : formatCurrency(data?.kpis.totalRevenue || 0)}
          icon={DollarSign}
          change={23.4}
          changeType="positive"
          loading={loading}
        />
        <KPICard
          title="Pending Moderation"
          value={loading ? '...' : formatNumber(data?.kpis.moderationPending || 0)}
          icon={ShieldAlert}
          change={data?.kpis.moderationPending && data.kpis.moderationPending > 5 ? 12 : 0}
          changeType={data?.kpis.moderationPending && data.kpis.moderationPending > 5 ? 'negative' : 'neutral'}
          timeframe="requires review"
          loading={loading}
        />
      </div>

      {/* Secondary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Monthly Recurring Revenue"
          value={loading ? '...' : formatCurrency(data?.kpis.mrr || 0)}
          icon={CreditCard}
          loading={loading}
        />
        <KPICard
          title="Platform Commission (20%)"
          value={loading ? '...' : formatCurrency(data?.kpis.platformCut || 0)}
          icon={CreditCard}
          loading={loading}
        />
        <KPICard
          title="S2ST Translation Revenue"
          value={loading ? '...' : formatCurrency(data?.kpis.translationRevenue || 0)}
          icon={Languages}
          loading={loading}
        />
        <KPICard
          title="Active Live Streams"
          value={loading ? '...' : `${formatNumber(data?.kpis.activeLiveStreams || 0)} (${formatNumber(data?.kpis.totalViewers || 0)} viewers)`}
          icon={Radio}
          loading={loading}
        />
      </div>

      {/* Primary Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <h3 className="font-['Outfit'] text-sm font-black uppercase tracking-widest text-white/60 mb-6 flex items-center justify-between">
            <span>USER GROWTH TREND (30D)</span>
            <span className="text-[10px] font-semibold text-primary">Signups</span>
          </h3>
          {loading ? (
            <div className="h-[300px] w-full bg-white/5 rounded-xl animate-pulse" />
          ) : (
            <AdminChart
              type="area"
              data={data?.userGrowth || []}
              index="date"
              categories={['count']}
              colors={['#66FCF1']}
            />
          )}
        </div>

        <div className="glass-card p-6">
          <h3 className="font-['Outfit'] text-sm font-black uppercase tracking-widest text-white/60 mb-6 flex items-center justify-between">
            <span>REVENUE SUBSCRIPTION TREND (30D)</span>
            <span className="text-[10px] font-semibold text-primary">Earnings (€)</span>
          </h3>
          {loading ? (
            <div className="h-[300px] w-full bg-white/5 rounded-xl animate-pulse" />
          ) : (
            <AdminChart
              type="area"
              data={data?.revenueTrend || []}
              index="date"
              categories={['amount']}
              colors={['#39FF14']}
              valueFormatter={formatCurrency}
            />
          )}
        </div>
      </div>

      {/* Secondary Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass-card p-6 lg:col-span-2">
          <h3 className="font-['Outfit'] text-sm font-black uppercase tracking-widest text-white/60 mb-6">
            RELATIONSHIP GAUGE DISTRIBUTION
          </h3>
          {loading ? (
            <div className="h-[300px] w-full bg-white/5 rounded-xl animate-pulse" />
          ) : (
            <AdminChart
              type="bar"
              data={getRelationshipChartData()}
              index="name"
              categories={['value']}
              colors={['#45A29E']}
            />
          )}
        </div>

        <div className="glass-card p-6">
          <h3 className="font-['Outfit'] text-sm font-black uppercase tracking-widest text-white/60 mb-6">
            MODERATION WORKLOAD
          </h3>
          {loading ? (
            <div className="h-[300px] w-full bg-white/5 rounded-xl animate-pulse" />
          ) : (
            <AdminChart
              type="pie"
              data={getModerationChartData()}
              index="name"
              categories={['count']}
              colors={['#FF204E', '#F59E0B', '#39FF14', '#95a5a6', '#66FCF1']}
            />
          )}
        </div>
      </div>
    </div>
  );
}
