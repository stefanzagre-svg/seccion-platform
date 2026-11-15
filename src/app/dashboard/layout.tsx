import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { createNoIndexMetadata } from '@/lib/seo-metadata';

export const metadata: Metadata = createNoIndexMetadata(
  'Member & Creator Workspace Dashboard',
  'Private SECCION dashboard for tracking active connections, upcoming VIP streams, subscriptions, and personalized account notifications.'
);

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
