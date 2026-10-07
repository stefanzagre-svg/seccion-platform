import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
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
    const { container } = render(
      <CreatorTourModal
        isOpen={false}
        onClose={vi.fn()}
        onNavigateTab={vi.fn()}
        onNavigateAiTools={vi.fn()}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders step 1 when isOpen is true', () => {
    render(
      <CreatorTourModal
        isOpen={true}
        onClose={vi.fn()}
        onNavigateTab={vi.fn()}
        onNavigateAiTools={vi.fn()}
      />
    );
    expect(screen.getByText('Welcome to SECCION Creator Studio')).toBeDefined();
    expect(screen.getByText('Next: Earnings & Rates')).toBeDefined();
  });

  it('navigates through tour steps on next button click', () => {
    render(
      <CreatorTourModal
        isOpen={true}
        onClose={vi.fn()}
        onNavigateTab={vi.fn()}
        onNavigateAiTools={vi.fn()}
      />
    );
    const nextBtn = screen.getByText('Next');
    fireEvent.click(nextBtn);
    expect(screen.getByText('Configure Your Founding Rates')).toBeDefined();
  });

  it('triggers onNavigateTab when clicking step action button', () => {
    const mockNavigateTab = vi.fn();
    const mockClose = vi.fn();

    render(
      <CreatorTourModal
        isOpen={true}
        onClose={mockClose}
        onNavigateTab={mockNavigateTab}
        onNavigateAiTools={vi.fn()}
      />
    );

    // Advance to pricing step
    const nextBtn = screen.getByText('Next');
    fireEvent.click(nextBtn);

    const actionBtn = screen.getByText('Go to Earnings Settings');
    fireEvent.click(actionBtn);

    expect(mockClose).toHaveBeenCalled();
    expect(mockNavigateTab).toHaveBeenCalledWith('settings');
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
    render(
      <CreatorOnboardingChecklist
        metrics={mockMetricsZero}
        onNavigateTab={vi.fn()}
        onNavigateAiTools={vi.fn()}
        onOpenTour={vi.fn()}
        onOpenKyc={vi.fn()}
        onAskCopilot={vi.fn()}
      />
    );
    expect(screen.getByText('0%')).toBeDefined();
    expect(screen.getByText('0/5 Completed')).toBeDefined();
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

    render(
      <CreatorOnboardingChecklist
        metrics={mockMetricsComplete}
        onNavigateTab={vi.fn()}
        onNavigateAiTools={vi.fn()}
        onOpenTour={vi.fn()}
        onOpenKyc={vi.fn()}
        onAskCopilot={vi.fn()}
      />
    );
    expect(screen.getByText('100%')).toBeDefined();
    expect(screen.getByText('Portfolio Ready')).toBeDefined();
  });

  it('triggers deep-action routing on button click', () => {
    const mockNavigateTab = vi.fn();

    render(
      <CreatorOnboardingChecklist
        metrics={mockMetricsZero}
        onNavigateTab={mockNavigateTab}
        onNavigateAiTools={vi.fn()}
        onOpenTour={vi.fn()}
        onOpenKyc={vi.fn()}
        onAskCopilot={vi.fn()}
      />
    );

    const configureBtn = screen.getByText('Configure');
    fireEvent.click(configureBtn);
    expect(mockNavigateTab).toHaveBeenCalledWith('settings');
  });

  it('triggers onAskCopilot with pre-seeded question', () => {
    const mockAskCopilot = vi.fn();

    render(
      <CreatorOnboardingChecklist
        metrics={mockMetricsZero}
        onNavigateTab={vi.fn()}
        onNavigateAiTools={vi.fn()}
        onOpenTour={vi.fn()}
        onOpenKyc={vi.fn()}
        onAskCopilot={mockAskCopilot}
      />
    );

    const copilotButtons = screen.getAllByTitle('Ask Copilot about this step');
    expect(copilotButtons.length).toBeGreaterThan(0);
    fireEvent.click(copilotButtons[0]);
    expect(mockAskCopilot).toHaveBeenCalledWith(
      'How should I price my base VIP pass and PPV media for best conversion?'
    );
  });
});
