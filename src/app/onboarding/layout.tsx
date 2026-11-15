import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { createNoIndexMetadata } from '@/lib/seo-metadata';

export const metadata: Metadata = createNoIndexMetadata(
  'Account Onboarding Setup',
  'Complete your SECCION onboarding profile, choose your member or creator path, and calibrate privacy and compatibility preferences.'
);

export default function OnboardingLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
