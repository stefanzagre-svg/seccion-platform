import { describe, it, expect, vi } from 'vitest';
import { checkUserQuota } from './date-plan-db';

// Mock Supabase client
vi.mock('./supabase', () => ({
  supabase: {
    from: vi.fn((table: string) => {
      if (table === 'subscriptions') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          in: vi.fn().mockReturnThis(),
          gt: vi.fn().mockResolvedValue({
            data: [{ id: 'sub-vip-1' }],
            error: null
          })
        };
      }
      return {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        gte: vi.fn().mockResolvedValue({ count: 0, error: null })
      };
    })
  }
}));

describe('Date Plan DB Logic - Quota Checks', () => {
  it('should exempt creators from monthly quota limits', async () => {
    const quota = await checkUserQuota('creator-1', 'creator');
    expect(quota.allowed).toBe(true);
    expect(quota.count).toBe(0);
  });

  it('should allow members with active VIP/Master subscriptions to bypass quota', async () => {
    const quota = await checkUserQuota('member-vip-1', 'member');
    expect(quota.allowed).toBe(true);
    expect(quota.count).toBe(0);
  });
});
