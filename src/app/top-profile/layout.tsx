import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { createNoIndexMetadata } from '@/lib/seo-metadata';

export const metadata: Metadata = createNoIndexMetadata(
  'Featured Top Profiles Directory',
  'Authenticated showcase view displaying high-synergy creators and featured community highlights inside your signed-in SECCION session.'
);

export default function TopProfileLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
