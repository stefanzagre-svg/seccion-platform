import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { createNoIndexMetadata } from '@/lib/seo-metadata';

export const metadata: Metadata = createNoIndexMetadata(
  'Reset Onboarding Session',
  'Internal account setup utility for clearing and restarting a member or creator onboarding flow session on SECCION.'
);

export default function OnboardingResetLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
