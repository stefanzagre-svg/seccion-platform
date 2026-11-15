import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import CreatorTourModal from '@/components/studio/CreatorTourModal';
import CreatorOnboardingChecklist, { type CreatorChecklistMetrics } from '@/components/studio/CreatorOnboardingChecklist';

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
    expect(html).toContain('Next: Earnings &amp; Rates');
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
    expect(html).toContain('Configure');
    expect(html).toContain('Ask Copilot about this step');
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
    expect(html).toContain('Portfolio Ready');
  });
});
