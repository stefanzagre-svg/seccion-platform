import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { createNoIndexMetadata } from '@/lib/seo-metadata';

export const metadata: Metadata = createNoIndexMetadata(
  'Onboarding Step 2 — Lifestyle & Synergy',
  'Calibrate lifestyle compatibility preferences, communication goals, and profile visibility details during Step 2 of SECCION onboarding.'
);

export default function OnboardingStep2Layout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
