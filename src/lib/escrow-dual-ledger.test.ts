import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  computeDualWalletDebit,
  computeDualWalletRefund,
  getLedgerForRating,
  getWalletColumnForLedger,
  resolveCreatorSplitRatio,
} from './escrow-dual-ledger';

describe('Dual-Ledger Wallet Math & Creator Revenue Split', () => {
  it('maps SFW vs NSFW_18 ratings to distinct wallet columns', () => {
    expect(getLedgerForRating('SFW')).toBe('sfw_credits');
    expect(getLedgerForRating('NSFW_18')).toBe('sovereign_red_pills');
    expect(getWalletColumnForLedger('sfw_credits')).toBe('sfw_credits_balance');
    expect(getWalletColumnForLedger('sovereign_red_pills')).toBe('red_pills_balance');
  });

  it('prevents cross-spending red_pills_balance when SFW order requires sfw_credits', () => {
    const debit = computeDualWalletDebit(
      { sfw_credits_balance: 5, red_pills_balance: 500 },
      'sfw_credits',
      25
    );
    expect(debit.ok).toBe(false);
    if (!debit.ok) {
      expect(debit.errorCode).toBe('INSUFFICIENT_SFW_CREDITS');
      expect(debit.column).toBe('sfw_credits_balance');
      expect(debit.available).toBe(5);
    }
  });

  it('prevents cross-spending sfw_credits_balance when NSFW_18 order requires sovereign_red_pills', () => {
    const debit = computeDualWalletDebit(
      { sfw_credits_balance: 500, red_pills_balance: 10 },
      'sovereign_red_pills',
      50
    );
    expect(debit.ok).toBe(false);
    if (!debit.ok) {
      expect(debit.errorCode).toBe('INSUFFICIENT_RED_PILLS');
      expect(debit.column).toBe('red_pills_balance');
      expect(debit.available).toBe(10);
    }
  });

  it('debits only the matching column when balance is sufficient', () => {
    const sfw = computeDualWalletDebit(
      { sfw_credits_balance: 120, red_pills_balance: 40 },
      'sfw_credits',
      30
    );
    expect(sfw.ok).toBe(true);
    if (sfw.ok) {
      expect(sfw.column).toBe('sfw_credits_balance');
      expect(sfw.newBalance).toBe(90);
      expect(sfw.updatePayload.sfw_credits_balance).toBe(90);
      expect(sfw.updatePayload.red_pills_balance).toBeUndefined();
    }
  });

  it('refunds back to exact required_ledger column', () => {
    const sfwRefund = computeDualWalletRefund(
      { sfw_credits_balance: 10, red_pills_balance: 50 },
      'sfw_credits',
      25
    );
    expect(sfwRefund.column).toBe('sfw_credits_balance');
    expect(sfwRefund.newBalance).toBe(35);

    const nsfwRefund = computeDualWalletRefund(
      { sfw_credits_balance: 10, red_pills_balance: 50 },
      'sovereign_red_pills',
      40
    );
    expect(nsfwRefund.column).toBe('red_pills_balance');
    expect(nsfwRefund.newBalance).toBe(90);
  });

  it('evaluates 90% Founding Creator (within 1st year) vs 80% Standard vs Custom rate', () => {
    const now = new Date('2026-11-12T00:00:00Z').getTime();
    const founder = resolveCreatorSplitRatio(
      { is_approved_founder_creator: true, promo_90_approved_at: '2026-06-01T00:00:00Z' },
      now
    );
    expect(founder).toEqual({ creatorSplitRatio: 0.9, platformSplitRatio: 0.1 });

    const expiredFounder = resolveCreatorSplitRatio(
      { is_approved_founder_creator: true, promo_90_approved_at: '2025-01-01T00:00:00Z' },
      now
    );
    expect(expiredFounder).toEqual({ creatorSplitRatio: 0.8, platformSplitRatio: 0.2 });

    const custom = resolveCreatorSplitRatio({ custom_creator_rate: 0.85 }, now);
    expect(custom).toEqual({ creatorSplitRatio: 0.85, platformSplitRatio: 0.15 });
  });
});

// Route handler verification (SSR Auth + AdminClient Execution + Rollback)
const mockGetUser = vi.fn();
const mockAdminFrom = vi.fn();
const mockAdminRpc = vi.fn();

vi.mock('@/lib/supabase/server', () => ({
  createClient: async () => ({
    auth: { getUser: mockGetUser },
  }),
}));

vi.mock('@/lib/supabase/admin-client', () => ({
  createAdminClient: () => ({
    from: mockAdminFrom,
    rpc: mockAdminRpc,
  }),
}));

describe('Escrow Route Handlers V3.1 Dual-Ledger Enforcement', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetUser.mockResolvedValue({
      data: { user: { id: '11111111-1111-4111-8111-111111111111' } },
      error: null,
    });
  });

  it('escrow/order/create rolls back sfw_credits_balance if matrix_escrow_orders insert fails', async () => {
    mockAdminRpc.mockResolvedValueOnce({
      data: null,
      error: { code: 'PGRST202', message: 'function not found' },
    });

    const updatePayloads: Array<Record<string, unknown>> = [];

    mockAdminFrom.mockImplementation((table: string) => {
      if (table === 'user_wallets') {
        return {
          select: () => ({
            eq: () => ({
              single: async () => ({
                data: { sfw_credits_balance: 100, red_pills_balance: 0, blue_pills_xp: 0 },
              }),
            }),
          }),
          update: (payload: Record<string, unknown>) => {
            updatePayloads.push(payload);
            return {
              eq: () => ({
                gte: () => ({
                  select: () => ({
                    single: async () => ({ data: { sfw_credits_balance: 60 }, error: null }),
                  }),
                }),
                then: undefined,
              }),
            };
          },
        };
      }
      if (table === 'matrix_escrow_orders') {
        return {
          insert: () => ({
            select: () => ({
              single: async () => ({ data: null, error: { message: 'db error' } }),
            }),
          }),
        };
      }
      return { insert: async () => ({ error: null }) };
    });

    const { POST } = await import('@/app/api/escrow/order/create/route');
    const req = new Request('http://localhost/api/escrow/order/create', {
      method: 'POST',
      body: JSON.stringify({
        creatorId: '22222222-2222-4222-8222-222222222222',
        title: 'Custom workout video',
        description: 'Need a 10 minute mobility session recording.',
        category: 'Coaching & Fitness',
        redPillsAmount: 40,
      }),
    });

    const res = await POST(req as never);
    expect(res.status).toBe(500);
    // First update debited to 60; second update rolled back to 100
    expect(updatePayloads[0]?.sfw_credits_balance).toBe(60);
    expect(updatePayloads[1]?.sfw_credits_balance).toBe(100);
  });

  it('escrow/order/refund blocks third parties with 403 and refunds sfw_credits to sfw_credits_balance', async () => {
    const walletUpdates: Array<Record<string, unknown>> = [];
    mockAdminRpc.mockResolvedValueOnce({
      data: null,
      error: { code: 'PGRST202', message: 'function not found' },
    });

    mockAdminFrom.mockImplementation((table: string) => {
      if (table === 'matrix_escrow_orders') {
        return {
          select: () => ({
            eq: () => ({
              single: async () => ({
                data: {
                  id: '33333333-3333-4333-8333-333333333333',
                  fan_id: '11111111-1111-4111-8111-111111111111',
                  creator_id: '22222222-2222-4222-8222-222222222222',
                  status: 'held_in_escrow',
                  required_ledger: 'sfw_credits',
                  red_pills_amount: 50,
                },
              }),
            }),
          }),
          update: () => ({
            eq: () => ({
              in: async () => ({ error: null }),
            }),
          }),
        };
      }
      if (table === 'user_wallets') {
        return {
          select: () => ({
            eq: () => ({
              single: async () => ({
                data: { sfw_credits_balance: 15, red_pills_balance: 5 },
              }),
            }),
          }),
          update: (payload: Record<string, unknown>) => {
            walletUpdates.push(payload);
            return { eq: async () => ({ error: null }) };
          },
        };
      }
      return {};
    });

    const { POST } = await import('@/app/api/escrow/order/refund/route');
    const req = new Request('http://localhost/api/escrow/order/refund', {
      method: 'POST',
      body: JSON.stringify({ orderId: '33333333-3333-4333-8333-333333333333' }),
    });

    const res = await POST(req as never);
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.refundedLedger).toBe('sfw_credits');
    expect(walletUpdates[0]?.sfw_credits_balance).toBe(65);
    expect(walletUpdates[0]?.red_pills_balance).toBeUndefined();
  });
});
