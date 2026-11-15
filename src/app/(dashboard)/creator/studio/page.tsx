"use client";

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

/**
 * Legacy dashboard Studio route retired in favor of the canonical Studio (/studio).
 */
export default function CreatorStudioRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/studio');
  }, [router]);

  return (
    <div className="min-h-screen bg-[#0A0A0C] text-white flex flex-col items-center justify-center gap-4 px-4 text-center">
      <Loader2 className="w-8 h-8 animate-spin text-[#00fbfb]" />
      <p className="text-xs font-mono uppercase tracking-widest text-white/60">
        Redirecting to Creator Studio...
      </p>
      <Link
        href="/studio"
        className="text-xs font-mono text-[#00fbfb] underline hover:opacity-80"
      >
        Open Creator Studio →
      </Link>
    </div>
  );
}
