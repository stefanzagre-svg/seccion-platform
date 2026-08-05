'use client';

import { useEffect } from 'react';

export default function ProfileError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[Profile Member Error Boundary Caught]:', error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
      <div className="max-w-md w-full p-8 rounded-3xl bg-slate-900/80 border border-red-500/20 backdrop-blur-xl space-y-6 shadow-2xl">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto">
          <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-slate-100">Unable to load profile</h2>
          <p className="text-sm text-slate-400">
            A temporary connection issue occurred while fetching your account details.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={() => reset()}
            className="flex-1 px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-medium transition-colors shadow-lg shadow-cyan-500/20"
          >
            Try Again
          </button>
          <button
            onClick={() => window.location.reload()}
            className="flex-1 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium border border-slate-700 transition-colors"
          >
            Refresh Page
          </button>
        </div>
      </div>
    </div>
  );
}
