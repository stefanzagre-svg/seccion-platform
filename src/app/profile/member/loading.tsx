'use client';

export default function ProfileLoading() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 px-4 py-8 max-w-7xl mx-auto space-y-8 animate-pulse">
      {/* Hero Header Skeleton */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900/60 border border-slate-800/80 p-6 md:p-8 backdrop-blur-xl">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="w-28 h-28 md:w-36 md:h-36 rounded-full bg-slate-800/80 shrink-0" />
          <div className="space-y-3 text-center md:text-left flex-1 w-full">
            <div className="h-8 w-48 bg-slate-800/80 rounded-lg mx-auto md:mx-0" />
            <div className="h-4 w-32 bg-slate-800/60 rounded-md mx-auto md:mx-0" />
            <div className="h-16 w-full max-w-xl bg-slate-800/40 rounded-xl mt-4" />
          </div>
        </div>
      </div>

      {/* Grid Tabs Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="h-64 rounded-2xl bg-slate-900/40 border border-slate-800/60 p-6 space-y-4">
            <div className="h-6 w-36 bg-slate-800/80 rounded-md" />
            <div className="h-4 w-full bg-slate-800/40 rounded-md" />
            <div className="h-4 w-4/5 bg-slate-800/40 rounded-md" />
            <div className="h-4 w-2/3 bg-slate-800/40 rounded-md" />
          </div>
          <div className="h-48 rounded-2xl bg-slate-900/40 border border-slate-800/60 p-6 space-y-4">
            <div className="h-6 w-44 bg-slate-800/80 rounded-md" />
            <div className="h-20 w-full bg-slate-800/30 rounded-xl" />
          </div>
        </div>

        {/* Sidebar Skeleton */}
        <div className="space-y-6">
          <div className="h-80 rounded-2xl bg-slate-900/40 border border-slate-800/60 p-6 space-y-4">
            <div className="h-6 w-32 bg-slate-800/80 rounded-md" />
            <div className="h-12 w-full bg-slate-800/50 rounded-xl" />
            <div className="h-12 w-full bg-slate-800/50 rounded-xl" />
            <div className="h-12 w-full bg-slate-800/50 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
