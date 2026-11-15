import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { createNoIndexMetadata } from '@/lib/seo-metadata';

export const metadata: Metadata = createNoIndexMetadata(
  'Creator Operations & Live Broadcast Area',
  'Private SECCION creator workspace for studio verification, KYC checks, and real-time interactive broadcast rooms.'
);

export default function DashboardGroupLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
