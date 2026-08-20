import { describe, it, expect } from 'vitest';
import { 
  BUG_CATEGORIES, 
  calculateBugReward, 
  checkBugReportRateLimit 
} from './bug-bounty';

describe('Bug Bounty Module', () => {
  it('defines intuitive, human-friendly categories with bilingual metadata', () => {
    expect(BUG_CATEGORIES.length).toBe(6);
    
    const visualCat = BUG_CATEGORIES.find((c) => c.id === 'visual_display');
    expect(visualCat).toBeDefined();
    expect(visualCat?.emoji).toBe('🖼️');
    expect(visualCat?.labelEn).toContain('Visual');
    expect(visualCat?.labelEs).toContain('Visual');

    const paymentCat = BUG_CATEGORIES.find((c) => c.id === 'payment_credits');
    expect(paymentCat).toBeDefined();
    expect(paymentCat?.emoji).toBe('💳');
  });

  describe('calculateBugReward', () => {
    it('calculates proper XP and VIP reward for members based on severity', () => {
      const mediumReward = calculateBugReward('member', 'medium');
      expect(mediumReward.rewardType).toBe('xp_vip');
      expect(mediumReward.rewardAmount).toBe(250);
      expect(mediumReward.descriptionEn).toContain('+250 Harmonic XP');

      const criticalReward = calculateBugReward('member', 'critical');
      expect(criticalReward.rewardAmount).toBe(500);
      expect(criticalReward.descriptionEn).toContain('+500 Harmonic XP');
    });

    it('calculates proper Radar Boost Pass and AI credits for creators', () => {
      const mediumReward = calculateBugReward('creator', 'medium');
      expect(mediumReward.rewardType).toBe('radar_boost');
      expect(mediumReward.rewardAmount).toBe(24);
      expect(mediumReward.descriptionEn).toContain('24h Radar Discovery Boost Pass');

      const criticalReward = calculateBugReward('creator', 'critical');
      expect(criticalReward.rewardAmount).toBe(72);
      expect(criticalReward.descriptionEn).toContain('72h Radar Discovery Boost Pass');
      expect(criticalReward.descriptionEn).toContain('100 AI Assistant Credits');
    });
  });

  describe('checkBugReportRateLimit', () => {
    it('allows submissions within limit and throttles after max exceeded', () => {
      const testId = `user_rate_test_${Date.now()}`;
      
      // 5 allowed
      expect(checkBugReportRateLimit(testId, 3).allowed).toBe(true);
      expect(checkBugReportRateLimit(testId, 3).allowed).toBe(true);
      expect(checkBugReportRateLimit(testId, 3).allowed).toBe(true);

      // 4th should be throttled
      const blocked = checkBugReportRateLimit(testId, 3);
      expect(blocked.allowed).toBe(false);
      expect(blocked.remaining).toBe(0);
    });
  });
});
