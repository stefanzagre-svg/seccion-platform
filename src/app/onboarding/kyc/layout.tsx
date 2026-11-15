import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { createNoIndexMetadata } from '@/lib/seo-metadata';

export const metadata: Metadata = createNoIndexMetadata(
  'Identity & Age Verification (KYC)',
  'Complete zero-knowledge KYC identity and age verification securely via DIDIT before publishing creator media or receiving payouts on SECCION.'
);

export default function OnboardingKycLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
