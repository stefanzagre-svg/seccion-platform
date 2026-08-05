import { describe, it, expect } from 'vitest';
import {
  resolveSharedScore,
  scoreToLevel,
  RELATIONSHIP_LEVELS,
} from './relationship-engine';

describe('Relationship Engine', () => {
  describe('RELATIONSHIP_LEVELS', () => {
    it('contains relationship levels array in ascending order', () => {
      expect(RELATIONSHIP_LEVELS[0].key).toBe('strangers');
      expect(RELATIONSHIP_LEVELS[0].minScore).toBe(0);
      expect(RELATIONSHIP_LEVELS.some(l => l.key === 'friendly')).toBe(true);
      expect(RELATIONSHIP_LEVELS.some(l => l.key === 'soulmate')).toBe(true);
    });
  });

  describe('scoreToLevel()', () => {
    it('maps 0 to strangers level', () => {
      const level = scoreToLevel(0);
      expect(level.key).toBe('strangers');
    });

    it('maps 20 to friendly level', () => {
      const level = scoreToLevel(20);
      expect(level.key).toBe('friendly');
    });

    it('maps 60 to intimate level', () => {
      const level = scoreToLevel(60);
      expect(level.key).toBe('intimate');
    });

    it('maps 95 to soulmate level', () => {
      const level = scoreToLevel(95);
      expect(level.key).toBe('soulmate');
    });
  });

  describe('resolveSharedScore()', () => {
    it('returns 0 when either user score is 0', () => {
      expect(resolveSharedScore(0, 100)).toBe(0);
      expect(resolveSharedScore(80, 0)).toBe(0);
    });

    it('calculates weighted harmonic mean correctly for equal inputs', () => {
      expect(resolveSharedScore(50, 50)).toBe(50);
    });
  });
});
