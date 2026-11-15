import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { createNoIndexMetadata } from '@/lib/seo-metadata';

export const metadata: Metadata = createNoIndexMetadata(
  'Account Profile & Synergy Overview',
  'Authenticated SECCION user profile view for managing media galleries, active memberships, compatibility insights, and personal vibe preferences.'
);

export default function ProfileLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
