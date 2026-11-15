"use client";

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

/**
 * Legacy dashboard KYC route retired in favor of canonical DIDIT flow (/onboarding/kyc).
 */
export default function CreatorKycRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/onboarding/kyc?role=creator');
  }, [router]);

  return (
    <div className="min-h-screen bg-[#0A0A0C] text-white flex flex-col items-center justify-center gap-4 px-4 text-center">
      <Loader2 className="w-8 h-8 animate-spin text-[#00fbfb]" />
      <p className="text-xs font-mono uppercase tracking-widest text-white/60">
        Redirecting to DIDIT Verification Portal...
      </p>
      <Link
        href="/onboarding/kyc?role=creator"
        className="text-xs font-mono text-[#00fbfb] underline hover:opacity-80"
      >
        Continue to Verification →
      </Link>
    </div>
  );
}
