'use client';

import { useEffect } from 'react';
import { captureError } from '@/lib/error-logger';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    captureError(error, { digest: error.digest });
  }, [error]);

  return (
    <html lang="en">
      <body className="bg-slate-950 text-slate-100 min-h-screen flex items-center justify-center p-4 font-sans">
        <div className="max-w-md w-full p-8 rounded-3xl bg-slate-900/90 border border-red-500/30 backdrop-blur-xl space-y-6 text-center shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto">
            <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-slate-100">Something went wrong</h1>
            <p className="text-sm text-slate-400">
              An unexpected application error occurred. Our team has been notified.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => reset()}
              className="flex-1 px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold transition-colors shadow-lg shadow-cyan-500/20"
            >
              Try Again
            </button>
            <button
              onClick={() => window.location.assign('/')}
              className="flex-1 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold border border-slate-700 transition-colors"
            >
              Go Home
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
