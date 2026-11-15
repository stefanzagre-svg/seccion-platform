import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { createNoIndexMetadata } from '@/lib/seo-metadata';

export const metadata: Metadata = createNoIndexMetadata(
  'Creator Studio — Revenue, Vault & Live Controls',
  'Authenticated Creator Studio workspace on SECCION for managing DRM uploads, live broadcasts, 90% revenue analytics, and payout settlements.'
);

export default function StudioLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
