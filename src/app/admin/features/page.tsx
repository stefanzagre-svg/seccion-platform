'use client';

import { useState, useEffect } from 'react';
import { Languages, Activity, MessagesSquare, Clock, Users, ArrowUpRight, DollarSign, RefreshCw } from 'lucide-react';
import KPICard from '@/components/admin/KPICard';
import AdminChart from '@/components/admin/AdminChart';
import { cn } from '@/lib/utils';

interface FeatureAnalytics {
  summary: {
    totalSessions: number;
    textSessions: number;
    speechSessions: number;
    totalDurationMins: number;
    totalRevenue: number;
    uniqueUsers: number;
  };
  timeseries: {
    date: string;
    sessions: number;
    revenue: number;
    duration: number;
  }[];
}

export default function FeatureAnalyticsPage() {
  const [data, setData] = useState<FeatureAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFeatures = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/features');
      if (!res.ok) {
        throw new Error('Failed to fetch feature analytics');
      }
      const json = await res.json();
      setData(json);
    } catch (err: any) {
      setError(err.message || 'Error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeatures();
  }, []);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
    }).format(val);
  };

  const getSessionTypeShare = () => {
    if (!data) return [];
    return [
      { name: 'Text Chat', count: data.summary.textSessions },
      { name: 'S2ST Speech', count: data.summary.speechSessions },
    ];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-['Outfit'] text-2xl font-black text-white tracking-tight uppercase flex items-center gap-2">
            <Languages className="w-7 h-7 text-primary" />
            FEATURE USAGE ANALYTICS
          </h2>
          <p className="text-xs text-white/50 font-medium mt-1">
            Observe real-time usage metrics for speech translation APIs, S2ST duration distributions, and chat translations.
          </p>
        </div>

        <button 
          onClick={fetchFeatures}
          className="self-start p-2 rounded-xl border border-white/10 bg-white/5 text-white/60 hover:text-white hover:border-primary/45 transition-all"
          title="Refresh Data"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Total Translation Runs"
          value={loading ? '...' : data?.summary.totalSessions || 0}
          icon={MessagesSquare}
          loading={loading}
        />
        <KPICard
          title="S2ST Speech Runs"
          value={loading ? '...' : data?.summary.speechSessions || 0}
          icon={Activity}
          loading={loading}
        />
        <KPICard
          title="Total S2ST Duration"
          value={loading ? '...' : `${Math.round(data?.summary.totalDurationMins || 0)} min`}
          icon={Clock}
          loading={loading}
        />
        <KPICard
          title="Active Translation Users"
          value={loading ? '...' : data?.summary.uniqueUsers || 0}
          icon={Users}
          loading={loading}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass-card p-6 lg:col-span-2">
          <h3 className="font-['Outfit'] text-sm font-black uppercase tracking-widest text-white/60 mb-6">
            Daily Translation Runs Volume (30D)
          </h3>
          {loading ? (
            <div className="h-[280px] w-full bg-white/5 rounded-xl animate-pulse" />
          ) : (
            <AdminChart
              type="area"
              data={data?.timeseries || []}
              index="date"
              categories={['sessions']}
              colors={['#66FCF1']}
              height={280}
            />
          )}
        </div>

        <div className="glass-card p-6">
          <h3 className="font-['Outfit'] text-sm font-black uppercase tracking-widest text-white/60 mb-6">
            Session Type Distribution
          </h3>
          {loading ? (
            <div className="h-[280px] w-full bg-white/5 rounded-xl animate-pulse" />
          ) : (
            <AdminChart
              type="pie"
              data={getSessionTypeShare()}
              index="name"
              categories={['count']}
              colors={['#45A29E', '#fe00fe']}
              height={280}
            />
          )}
        </div>
      </div>

      {/* S2ST Pricing Card */}
      <div className="glass p-6 rounded-2xl grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        <div className="md:col-span-2">
          <h3 className="font-['Outfit'] text-sm font-black uppercase tracking-widest text-white mb-2">
            SPEECH-TO-SPEECH (S2ST) PRICING & LIMIT RULES
          </h3>
          <p className="text-xs text-white/60 leading-relaxed">
            SECCION implements a premium translation system for international matches. Regular text translation is included, while real-time S2ST streaming utilizes high-performance endpoints charged at a billing rate of <span className="text-primary font-bold">€0.10 per minute</span>, with a default free quota of <span className="text-primary font-bold">300 seconds (5 minutes)</span> per user account every 24 hours.
          </p>
        </div>
        <div className="bg-primary/5 border border-primary/20 p-4 rounded-xl text-center">
          <div className="text-[10px] font-black uppercase tracking-widest text-white/55 font-mono">Total Translation Revenue</div>
          <div className="text-2xl font-black text-primary mt-2">{loading ? '...' : formatCurrency(data?.summary.totalRevenue || 0)}</div>
          <div className="text-[9px] text-white/40 mt-1 font-mono">Billed beyond free quotas</div>
        </div>
      </div>
    </div>
  );
}
