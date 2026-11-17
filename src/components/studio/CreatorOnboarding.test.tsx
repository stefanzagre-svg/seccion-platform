import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import CreatorTourModal from '@/components/studio/CreatorTourModal';
import CreatorOnboardingChecklist, { type CreatorChecklistMetrics } from '@/components/studio/CreatorOnboardingChecklist';
import { getStudioTabs } from '@/lib/studio-navigation';

// Mock Language Context
vi.mock('@/context/LanguageContext', () => ({
  useTranslation: () => ({
    t: (key: string, fallback: string) => fallback,
    locale: 'en',
    setLocale: vi.fn(),
  }),
}));

describe('Creator Tour Modal Component', () => {
  it('renders nothing when isOpen is false', () => {
    const html = renderToStaticMarkup(
      <CreatorTourModal
        isOpen={false}
        onClose={vi.fn()}
        onNavigateTab={vi.fn()}
        onNavigateAiTools={vi.fn()}
      />
    );
    expect(html).toBe('');
  });

  it('renders step 1 when isOpen is true', () => {
    const html = renderToStaticMarkup(
      <CreatorTourModal
        isOpen={true}
        onClose={vi.fn()}
        onNavigateTab={vi.fn()}
        onNavigateAiTools={vi.fn()}
      />
    );
    expect(html).toContain('Welcome to SECCION Creator Studio');
    expect(html).toContain('Next: Pricing &amp; Earnings');
  });
});

describe('Creator Onboarding Checklist Component', () => {
  const mockMetricsZero: CreatorChecklistMetrics = {
    hasVisuals: false,
    hasMonetization: false,
    hasSeedContent: false,
    hasVaultNote: false,
    hasKyc: false,
    hasTaxId: false,
  };

  it('calculates 0% progress when no metrics are complete', () => {
    const html = renderToStaticMarkup(
      <CreatorOnboardingChecklist
        metrics={mockMetricsZero}
        onNavigateTab={vi.fn()}
        onNavigateAiTools={vi.fn()}
        onOpenTour={vi.fn()}
        onOpenKyc={vi.fn()}
        onAskCopilot={vi.fn()}
      />
    );
    expect(html).toContain('0%');
    expect(html).toContain('0/5 Completed');
    expect(html).toContain('Set Prices');
    expect(html).toContain('Upload Your First 2 Posts');
    expect(html).toContain('Ask Copilot about this step');
    expect(html).not.toContain('Obsidian Vault');
  });

  it('calculates 100% progress when all items are complete', () => {
    const mockMetricsComplete: CreatorChecklistMetrics = {
      hasVisuals: true,
      hasMonetization: true,
      hasSeedContent: true,
      hasVaultNote: true,
      hasKyc: true,
      hasTaxId: true,
    };

    const html = renderToStaticMarkup(
      <CreatorOnboardingChecklist
        metrics={mockMetricsComplete}
        onNavigateTab={vi.fn()}
        onNavigateAiTools={vi.fn()}
        onOpenTour={vi.fn()}
        onOpenKyc={vi.fn()}
        onAskCopilot={vi.fn()}
      />
    );
    expect(html).toContain('100%');
    expect(html).toContain('Ready to Launch');
  });
});

describe('Studio Navigation Labels', () => {
  it('returns plain-language localized tabs without jargon', () => {
    const enTabs = getStudioTabs(false, 'en');
    expect(enTabs.map((t) => t.label)).toEqual([
      'Posts & Media',
      'Livestreams',
      'Custom Requests',
      'Co-Star Approvals',
      'Goals',
      'Analytics',
      'Settings',
      'AI Copilot',
    ]);

    const esTabs = getStudioTabs(true, 'es');
    expect(esTabs.some((t) => t.id === 'safety_ops' && t.label === 'Moderación')).toBe(true);

    const frTabs = getStudioTabs(false, 'fr');
    expect(frTabs.some((t) => t.id === 'live' && t.label === 'Directs')).toBe(true);
  });
});
