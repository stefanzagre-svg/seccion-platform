import { describe, it, expect } from 'vitest';
import { safeSupabaseQuery } from './supabase-safe';

describe('Supabase Safe Module Resilience', () => {
  it('returns data and isTimeout: false when query promise succeeds', async () => {
    const mockSuccessQuery = Promise.resolve({ data: { id: 'test-123', name: 'Alice' }, error: null });
    const result = await safeSupabaseQuery(mockSuccessQuery, { id: 'fallback-id' }, 1000);
    expect(result.data).toEqual({ id: 'test-123', name: 'Alice' });
    expect(result.isTimeout).toBe(false);
  });

  it('returns fallback data when query promise returns Supabase error', async () => {
    const mockErrorQuery = Promise.resolve({ data: null, error: { message: 'Database offline' } });
    const fallback = { id: 'fallback-123' };
    const result = await safeSupabaseQuery(mockErrorQuery, fallback, 1000);
    expect(result.error).toBeDefined();
    expect(result.isTimeout).toBe(false);
  });

  it('returns fallback data with isTimeout: true when query times out', async () => {
    const mockHangingQuery = new Promise<{ data: null; error: null }>((resolve) => setTimeout(resolve, 5000));
    const fallback = { id: 'timeout-fallback' };
    const result = await safeSupabaseQuery(mockHangingQuery, fallback, 100);
    expect(result.data).toEqual(fallback);
    expect(result.isTimeout).toBe(true);
  });
});
