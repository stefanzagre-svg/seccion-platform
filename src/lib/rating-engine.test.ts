import { describe, it, expect } from 'vitest';
import { canRate, calculateCreatorRating, calculateMemberRating, calculateDynamicRating } from './rating-engine';

describe('Rating Engine', () => {
  describe('canRate()', () => {
    it('returns false when creators try to rate other creators', () => {
      const creatorA = { id: 'c1', role: 'creator' as const };
      const creatorB = { id: 'c2', role: 'creator' as const };
      expect(canRate(creatorA, creatorB, 5, true)).toBe(false);
    });

    it('returns true when subscribed member rates a creator', () => {
      const member = { id: 'm1', role: 'member' as const };
      const creator = { id: 'c1', role: 'creator' as const };
      expect(canRate(member, creator, 2, true)).toBe(true);
    });

    it('returns false when non-subscribed member tries to rate a creator', () => {
      const member = { id: 'm1', role: 'member' as const };
      const creator = { id: 'c1', role: 'creator' as const };
      expect(canRate(member, creator, 2, false)).toBe(false);
    });

    it('returns true when rating a member with relationship level >= 3', () => {
      const creator = { id: 'c1', role: 'creator' as const };
      const member = { id: 'm1', role: 'member' as const };
      expect(canRate(creator, member, 3, false)).toBe(true);
    });
  });

  describe('calculateDynamicRating()', () => {
    it('returns 0 for empty scores list', () => {
      expect(calculateDynamicRating([])).toBe(0);
    });

    it('applies exponential decay weighting to recent scores', () => {
      const score = calculateDynamicRating([20, 10]);
      expect(score).toBeGreaterThan(14);
    });
  });

  describe('calculateCreatorRating()', () => {
    it('computes creator overall score out of 20.00', () => {
      const profile = { engagementScore: 80, isKycVerified: true };
      const rating = calculateCreatorRating(profile, [18, 19]);
      expect(rating).toBeGreaterThanOrEqual(10.00);
      expect(rating).toBeLessThanOrEqual(20.00);
    });
  });

  describe('calculateMemberRating()', () => {
    it('computes member overall score out of 20.00', () => {
      const profile = { isKycVerified: true };
      const rating = calculateMemberRating(profile, 80, [15]);
      expect(rating).toBeGreaterThanOrEqual(10.00);
      expect(rating).toBeLessThanOrEqual(20.00);
    });
  });
});
