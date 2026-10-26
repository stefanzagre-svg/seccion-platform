import { describe, it, expect } from 'vitest';
import { 
  normalizeUsername, 
  isValidUsernameFormat, 
  isReservedUsername,
  getUsernameCooldownStatus,
  USERNAME_CHANGE_COOLDOWN_DAYS,
  USERNAME_REDIRECT_GRACE_DAYS,
  RESERVED_USERNAMES 
} from './reserved-usernames';

describe('Creator Vanity URL Engine & Security Guardrails', () => {
  describe('normalizeUsername', () => {
    it('strips single leading @', () => {
      expect(normalizeUsername('@magali')).toBe('magali');
    });

    it('strips multiple leading @ symbols', () => {
      expect(normalizeUsername('@@@elena_vip')).toBe('elena_vip');
    });

    it('lowercases and trims whitespace', () => {
      expect(normalizeUsername('  @MagaliGimenez  ')).toBe('magaligimenez');
    });

    it('handles URL encoded @ (%40)', () => {
      expect(normalizeUsername('%40sofia_ai')).toBe('sofia_ai');
    });

    it('handles empty or null values safely', () => {
      expect(normalizeUsername('')).toBe('');
      expect(normalizeUsername(null)).toBe('');
      expect(normalizeUsername(undefined)).toBe('');
    });
  });

  describe('isValidUsernameFormat', () => {
    it('accepts valid alphanumeric usernames with underscores and dots', () => {
      expect(isValidUsernameFormat('magali')).toBe(true);
      expect(isValidUsernameFormat('elena_vip')).toBe(true);
      expect(isValidUsernameFormat('sofia.model')).toBe(true);
      expect(isValidUsernameFormat('creator123')).toBe(true);
    });

    it('rejects usernames under 3 characters', () => {
      expect(isValidUsernameFormat('ab')).toBe(false);
      expect(isValidUsernameFormat('a')).toBe(false);
      expect(isValidUsernameFormat('')).toBe(false);
    });

    it('rejects usernames over 30 characters', () => {
      const longName = 'a'.repeat(31);
      expect(isValidUsernameFormat(longName)).toBe(false);
    });

    it('rejects usernames with consecutive dots', () => {
      expect(isValidUsernameFormat('magali..gimenez')).toBe(false);
    });

    it('rejects usernames starting or ending with dots or underscores', () => {
      expect(isValidUsernameFormat('.magali')).toBe(false);
      expect(isValidUsernameFormat('magali.')).toBe(false);
      expect(isValidUsernameFormat('_magali')).toBe(false);
      expect(isValidUsernameFormat('magali_')).toBe(false);
    });

    it('rejects probe characters and file extensions', () => {
      expect(isValidUsernameFormat('wp-login.php')).toBe(false);
      expect(isValidUsernameFormat('config.env')).toBe(false);
      expect(isValidUsernameFormat('script<alert>')).toBe(false);
      expect(isValidUsernameFormat('user/path')).toBe(false);
    });
  });

  describe('isReservedUsername', () => {
    it('blocks core platform pages and routes', () => {
      expect(isReservedUsername('admin')).toBe(true);
      expect(isReservedUsername('login')).toBe(true);
      expect(isReservedUsername('studio')).toBe(true);
      expect(isReservedUsername('feed')).toBe(true);
      expect(isReservedUsername('api')).toBe(true);
      expect(isReservedUsername('onboarding')).toBe(true);
      expect(isReservedUsername('become-creator')).toBe(true);
    });

    it('blocks system files, web standards, and brand names', () => {
      expect(isReservedUsername('robots.txt')).toBe(true);
      expect(isReservedUsername('sitemap.xml')).toBe(true);
      expect(isReservedUsername('favicon.ico')).toBe(true);
      expect(isReservedUsername('seccion')).toBe(true);
      expect(isReservedUsername('support')).toBe(true);
      expect(isReservedUsername('billing')).toBe(true);
    });

    it('blocks reserved usernames even when passed with @ or mixed case', () => {
      expect(isReservedUsername('@Admin')).toBe(true);
      expect(isReservedUsername('@STUDIO')).toBe(true);
      expect(isReservedUsername('  @API  ')).toBe(true);
    });

    it('allows legitimate creator handles that are not reserved', () => {
      expect(isReservedUsername('magali')).toBe(false);
      expect(isReservedUsername('maguivogel18')).toBe(false);
      expect(isReservedUsername('valentina_ai')).toBe(false);
      expect(isReservedUsername('elena_official')).toBe(false);
    });
  });

  describe('getUsernameCooldownStatus', () => {
    const NOW = new Date('2026-10-26T12:00:00Z').getTime();
    const ONE_DAY_MS = 24 * 60 * 60 * 1000;

    it('allows immediate change when user has never changed username before (null / undefined)', () => {
      expect(getUsernameCooldownStatus(null, 14, NOW).canChange).toBe(true);
      expect(getUsernameCooldownStatus(undefined, 14, NOW).canChange).toBe(true);
      expect(getUsernameCooldownStatus('', 14, NOW).canChange).toBe(true);
    });

    it('blocks change and reports accurate remaining days when within 14-day window', () => {
      // Changed 4 days ago -> 10 days remaining
      const changed4DaysAgo = new Date(NOW - 4 * ONE_DAY_MS).toISOString();
      const status = getUsernameCooldownStatus(changed4DaysAgo, 14, NOW);

      expect(status.canChange).toBe(false);
      expect(status.daysRemaining).toBe(10);
      expect(status.hoursRemaining).toBe(10 * 24);
      expect(status.nextAvailableDate?.toISOString()).toBe(new Date(NOW + 10 * ONE_DAY_MS).toISOString());
    });

    it('blocks change when changed 13 days and 23 hours ago (1 day remaining)', () => {
      const almostDone = new Date(NOW - (14 * ONE_DAY_MS - 3600 * 1000)).toISOString();
      const status = getUsernameCooldownStatus(almostDone, 14, NOW);

      expect(status.canChange).toBe(false);
      expect(status.daysRemaining).toBe(1);
      expect(status.hoursRemaining).toBe(1);
    });

    it('allows change once exactly 14 days or more have elapsed', () => {
      // Changed exactly 14 days ago
      const exactly14DaysAgo = new Date(NOW - 14 * ONE_DAY_MS).toISOString();
      expect(getUsernameCooldownStatus(exactly14DaysAgo, 14, NOW).canChange).toBe(true);

      // Changed 30 days ago
      const changed30DaysAgo = new Date(NOW - 30 * ONE_DAY_MS).toISOString();
      expect(getUsernameCooldownStatus(changed30DaysAgo, 14, NOW).canChange).toBe(true);
    });

    it('handles malformed date strings safely without throwing', () => {
      expect(getUsernameCooldownStatus('invalid-date', 14, NOW).canChange).toBe(true);
    });

    it('verifies standard platform policy constants', () => {
      expect(USERNAME_CHANGE_COOLDOWN_DAYS).toBe(14);
      expect(USERNAME_REDIRECT_GRACE_DAYS).toBe(30);
    });
  });
});
