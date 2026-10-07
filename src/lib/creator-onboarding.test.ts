import { describe, it, expect } from 'vitest';
import { type CreatorChecklistMetrics } from '@/components/studio/CreatorOnboardingChecklist';

// Helper function to calculate progress percentage identically to CreatorOnboardingChecklist
export function calculateCreatorChecklistProgress(metrics: CreatorChecklistMetrics) {
  const items = [
    { id: 'pricing', done: metrics.hasMonetization },
    { id: 'content', done: metrics.hasSeedContent },
    { id: 'vault', done: metrics.hasVaultNote },
    { id: 'kyc', done: metrics.hasKyc },
    { id: 'tax', done: metrics.hasTaxId }
  ];

  const completedCount = items.filter(i => i.done).length;
  const progressPercent = Math.round((completedCount / items.length) * 100);
  const isAllComplete = progressPercent === 100;

  return {
    completedCount,
    totalCount: items.length,
    progressPercent,
    isAllComplete
  };
}

describe('Creator Onboarding Progress Logic', () => {
  it('returns 0% when no steps are completed', () => {
    const metrics: CreatorChecklistMetrics = {
      hasVisuals: false,
      hasMonetization: false,
      hasSeedContent: false,
      hasVaultNote: false,
      hasKyc: false,
      hasTaxId: false
    };

    const res = calculateCreatorChecklistProgress(metrics);
    expect(res.progressPercent).toBe(0);
    expect(res.completedCount).toBe(0);
    expect(res.isAllComplete).toBe(false);
  });

  it('calculates 40% when 2 steps are completed', () => {
    const metrics: CreatorChecklistMetrics = {
      hasVisuals: true,
      hasMonetization: true,
      hasSeedContent: true,
      hasVaultNote: false,
      hasKyc: false,
      hasTaxId: false
    };

    const res = calculateCreatorChecklistProgress(metrics);
    expect(res.progressPercent).toBe(40);
    expect(res.completedCount).toBe(2);
    expect(res.isAllComplete).toBe(false);
  });

  it('calculates 100% when all steps are completed', () => {
    const metrics: CreatorChecklistMetrics = {
      hasVisuals: true,
      hasMonetization: true,
      hasSeedContent: true,
      hasVaultNote: true,
      hasKyc: true,
      hasTaxId: true
    };

    const res = calculateCreatorChecklistProgress(metrics);
    expect(res.progressPercent).toBe(100);
    expect(res.completedCount).toBe(5);
    expect(res.isAllComplete).toBe(true);
  });

  it('handles partial state with KYC and Tax set', () => {
    const metrics: CreatorChecklistMetrics = {
      hasVisuals: false,
      hasMonetization: false,
      hasSeedContent: false,
      hasVaultNote: false,
      hasKyc: true,
      hasTaxId: true
    };

    const res = calculateCreatorChecklistProgress(metrics);
    expect(res.progressPercent).toBe(40);
    expect(res.completedCount).toBe(2);
    expect(res.isAllComplete).toBe(false);
  });
});
