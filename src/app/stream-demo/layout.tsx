import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { createNoIndexMetadata } from '@/lib/seo-metadata';

export const metadata: Metadata = createNoIndexMetadata(
  'Interactive Stream Test Environment',
  'Authenticated internal streaming preview player used by verified creators to test WebRTC latency, audio quality, and overlay controls.'
);

export default function StreamDemoLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
