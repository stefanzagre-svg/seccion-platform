import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { createNoIndexMetadata } from '@/lib/seo-metadata';

export const metadata: Metadata = createNoIndexMetadata(
  'Account Preferences & Security Settings',
  'Manage SECCION security credentials, regional geofencing, notification preferences, Face Blur controls, and billing payment methods.'
);

export default function SettingsLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
