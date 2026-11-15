import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { createNoIndexMetadata } from '@/lib/seo-metadata';

export const metadata: Metadata = createNoIndexMetadata(
  'Sign In to Your Account',
  'Sign in securely to your SECCION member or creator account to access private messages, live rooms, creator studio tools, and payout dashboards.'
);

export default function LoginLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
