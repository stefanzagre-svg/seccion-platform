import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { createNoIndexMetadata } from '@/lib/seo-metadata';

export const metadata: Metadata = createNoIndexMetadata(
  'Studio AI Operations & Copilot Settings',
  'Configure your voice-trained AI Copilot preferences, automated message guardrails, and legal/compliance assistant inside SECCION Studio.'
);

export default function StudioAiToolsLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
