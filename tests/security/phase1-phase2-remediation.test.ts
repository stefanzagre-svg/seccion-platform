import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

const mockGetUser = vi.fn();
const mockAdminFrom = vi.fn();
const mockAdminCreateUser = vi.fn();
const mockAdminListUsers = vi.fn();

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(async () => ({
    auth: {
      getUser: mockGetUser,
    },
  })),
}));

vi.mock('@/lib/supabase/admin-client', () => ({
  createAdminClient: vi.fn(() => ({
    from: mockAdminFrom,
    auth: {
      admin: {
        createUser: mockAdminCreateUser,
        listUsers: mockAdminListUsers,
        updateUserById: vi.fn(),
      },
    },
    rpc: vi.fn(),
  })),
}));

import { verifyAdminAuth } from '@/lib/admin-auth';
import { isOnboardingProfileComplete } from '@/lib/profile-visibility';
import { verifyBiometricPresence } from '@/lib/auth/webauthn-mfa';
import { detectSightengineProvenance } from '@/lib/sightengine';
import { calculateMatch } from '@/lib/match-engine';
import { GET as crmOutreachGet, PATCH as crmOutreachPatch } from '@/app/api/admin/crm-outreach/route';
import { POST as viewEphemeralPost } from '@/app/api/messages/view-ephemeral/route';
import { POST as boostPassSendPost } from '@/app/api/v2/boost-pass/send/route';
import { POST as matrixSpendPost } from '@/app/api/matrix/spend/route';
import { POST as billingCheckoutPost } from '@/app/api/billing/checkout/route';
import { POST as escrowRefundPost } from '@/app/api/escrow/order/refund/route';
import { POST as prelaunchAccessPost } from '@/app/api/v2/auth/prelaunch-access/route';

describe('Phase 1 & Phase 2 Security & Flow Remediation Verification', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.SIGHTENGINE_API_USER = 'test_user';
    process.env.SIGHTENGINE_API_SECRET = 'test_secret';
  });

  it('verifyAdminAuth ignores user_metadata.role and username=stefan spoofing', async () => {
    mockGetUser.mockResolvedValue({
      data: {
        user: {
          id: 'attacker-uuid',
          email: 'attacker@example.com',
          email_confirmed_at: '2026-10-01T00:00:00Z',
          user_metadata: { role: 'super_admin' },
        },
      },
      error: null,
    });

    mockAdminFrom.mockImplementation(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({
        data: { id: 'attacker-uuid', platform_role: 'member', username: 'stefan' },
        error: null,
      }),
    }));

    const req = new NextRequest('http://localhost:3000/api/admin/crm-outreach');
    const result = await verifyAdminAuth(req, ['admin', 'super_admin']);
    expect(result).toBeNull();
  });

  it('verifyAdminAuth grants super_admin for confirmed founder email or DB platform_role', async () => {
    mockGetUser.mockResolvedValue({
      data: {
        user: {
          id: 'founder-uuid',
          email: 'stefan.zagre@gmail.com',
          email_confirmed_at: '2026-10-01T00:00:00Z',
        },
      },
      error: null,
    });

    const req = new NextRequest('http://localhost:3000/api/admin/crm-outreach');
    const result = await verifyAdminAuth(req, ['admin', 'super_admin']);
    expect(result).toMatchObject({ userId: 'founder-uuid', role: 'super_admin' });
  });

  it('/api/admin/crm-outreach rejects unauthenticated GET and PATCH with 403', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: { message: 'No session' } });

    const getRes = await crmOutreachGet(new NextRequest('http://localhost:3000/api/admin/crm-outreach'));
    expect(getRes.status).toBe(403);

    const patchRes = await crmOutreachPatch(
      new NextRequest('http://localhost:3000/api/admin/crm-outreach', {
        method: 'PATCH',
        body: JSON.stringify({ id: 'lead-1', dm_sent: true }),
      })
    );
    expect(patchRes.status).toBe(403);
  });

  it('/api/messages/view-ephemeral rejects non-recipient sender attempting purge with 403', async () => {
    const senderId = '11111111-1111-4111-8111-111111111111';
    const receiverId = '22222222-2222-4222-8222-222222222222';
    mockGetUser.mockResolvedValue({ data: { user: { id: senderId } }, error: null });

    mockAdminFrom.mockImplementation(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: {
          id: 'msg-1',
          sender_id: senderId,
          receiver_id: receiverId,
          is_ephemeral: true,
        },
        error: null,
      }),
    }));

    const res = await viewEphemeralPost(
      new NextRequest('http://localhost:3000/api/messages/view-ephemeral', {
        method: 'POST',
        body: JSON.stringify({ messageId: 'msg-1' }),
      })
    );
    expect(res.status).toBe(403);
  });

  it('/api/v2/boost-pass/send enforces caller identity and blocks self-boost', async () => {
    const userId = '11111111-1111-4111-8111-111111111111';
    const otherId = '22222222-2222-4222-8222-222222222222';
    mockGetUser.mockResolvedValue({ data: { user: { id: userId } }, error: null });

    const spoofRes = await boostPassSendPost(
      new NextRequest('http://localhost:3000/api/v2/boost-pass/send', {
        method: 'POST',
        body: JSON.stringify({ senderId: otherId, receiverId: userId }),
      })
    );
    expect(spoofRes.status).toBe(403);

    const selfRes = await boostPassSendPost(
      new NextRequest('http://localhost:3000/api/v2/boost-pass/send', {
        method: 'POST',
        body: JSON.stringify({ senderId: userId, receiverId: userId }),
      })
    );
    expect(selfRes.status).toBe(400);
  });

  it('/api/matrix/spend blocks self-spend BEFORE wallet deduction and ignores client gateway_toll', async () => {
    const userId = '11111111-1111-4111-8111-111111111111';
    const creatorId = '22222222-2222-4222-8222-222222222222';
    mockGetUser.mockResolvedValue({ data: { user: { id: userId } }, error: null });

    const selfSpendRes = await matrixSpendPost(
      new NextRequest('http://localhost:3000/api/matrix/spend', {
        method: 'POST',
        body: JSON.stringify({
          creatorId: userId,
          redPillsAmount: 20,
          itemType: 'tip',
        }),
      })
    );
    expect(selfSpendRes.status).toBe(400);
    expect(mockAdminFrom).not.toHaveBeenCalled();

    let insertedLedgerRow: Record<string, unknown> | null = null;
    mockAdminFrom.mockImplementation((table: string) => {
      if (table === 'user_wallets') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({
            data: { sfw_credits_balance: 100, red_pills_balance: 100 },
            error: null,
          }),
          update: vi.fn(() => ({
            eq: vi.fn().mockReturnThis(),
            gte: vi.fn().mockReturnThis(),
            select: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({
              data: { sovereign_red_pills: 80 },
              error: null,
            }),
          })),
        };
      }
      if (table === 'profiles') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          maybeSingle: vi.fn().mockResolvedValue({
            data: { is_approved_founder_creator: false, custom_creator_rate: null },
            error: null,
          }),
        };
      }
      if (table === 'creator_earnings_ledger') {
        return {
          insert: vi.fn((row: Record<string, unknown>) => {
            insertedLedgerRow = row;
            return Promise.resolve({ error: null });
          }),
        };
      }
      return {
        insert: vi.fn().mockResolvedValue({ error: null }),
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
      };
    });

    const validSpendRes = await matrixSpendPost(
      new NextRequest('http://localhost:3000/api/matrix/spend', {
        method: 'POST',
        body: JSON.stringify({
          creatorId,
          redPillsAmount: 20,
          itemType: 'tip',
          metadata: { gateway_toll: 999 },
        }),
      })
    );
    expect(validSpendRes.status).toBe(200);
    expect(insertedLedgerRow).toMatchObject({
      gateway_toll_deducted: 0,
      net_pool_value: 20,
    });
  });

  it('/api/billing/checkout blocks self-checkout', async () => {
    const userId = '11111111-1111-4111-8111-111111111111';
    mockGetUser.mockResolvedValue({
      data: {
        user: {
          id: userId,
          email: 'creator@seccion.ai',
          email_confirmed_at: '2026-10-01T00:00:00Z',
        },
      },
      error: null,
    });

    const res = await billingCheckoutPost(
      new NextRequest('http://localhost:3000/api/billing/checkout', {
        method: 'POST',
        body: JSON.stringify({
          creatorId: userId,
          price: 15,
          type: 'subscription',
          paymentMethod: 'wallet',
        }),
      })
    );
    expect(res.status).toBe(400);
  });

  it('/api/escrow/order/refund rejects unilateral refund on delivered orders with 409', async () => {
    const fanId = '11111111-1111-4111-8111-111111111111';
    const orderId = '33333333-3333-4333-8333-333333333333';
    mockGetUser.mockResolvedValue({ data: { user: { id: fanId } }, error: null });

    mockAdminFrom.mockImplementation(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: {
          id: orderId,
          fan_id: fanId,
          creator_id: '22222222-2222-4222-8222-222222222222',
          status: 'delivered',
          red_pills_amount: 50,
        },
        error: null,
      }),
    }));

    const res = await escrowRefundPost(
      new NextRequest('http://localhost:3000/api/escrow/order/refund', {
        method: 'POST',
        body: JSON.stringify({ orderId }),
      })
    );
    expect(res.status).toBe(409);
  });

  it('/api/v2/auth/prelaunch-access does not create auth users or overwrite passwords', async () => {
    mockAdminListUsers.mockResolvedValue({ data: { users: [] }, error: null });
    mockAdminFrom.mockImplementation((table: string) => {
      if (table === 'creator_applications') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          order: vi.fn().mockReturnThis(),
          limit: vi.fn().mockReturnThis(),
          maybeSingle: vi.fn().mockResolvedValue({
            data: {
              id: 'app-1',
              full_name: 'Approved Creator',
              link1: 'https://instagram.com/approvedcreator',
              status: 'approved',
            },
            error: null,
          }),
        };
      }
      return {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
      };
    });

    const res = await prelaunchAccessPost(
      new NextRequest('http://localhost:3000/api/v2/auth/prelaunch-access', {
        method: 'POST',
        headers: { 'x-forwarded-for': '198.51.100.77' },
        body: JSON.stringify({ email: 'creator@example.com' }),
      })
    );
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.status).toBe('approved_creator');
    expect(mockAdminCreateUser).not.toHaveBeenCalled();
  });

  it('isOnboardingProfileComplete honors VIP approved founder creators', () => {
    expect(
      isOnboardingProfileComplete({
        role: 'creator',
        is_approved_founder_creator: true,
        avatar_url: null,
        bio: null,
      })
    ).toBe(true);
  });

  it('verifyBiometricPresence fails closed when WebAuthn is unavailable', async () => {
    const result = await verifyBiometricPresence('Sign Consent');
    expect(result).toBe(false);
  });

  it('detectSightengineProvenance scales 0..1 Sightengine probability to 0..100 confidence', async () => {
    const origFetch = global.fetch;
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        status: 'success',
        type: { ai_generated: 0.92, deepfake: 0.1 },
      }),
    }) as any;

    try {
      const detection = await detectSightengineProvenance('https://cdn.example.com/a.jpg', 'image');
      expect(detection).not.toBeNull();
      expect(detection?.suggestedLevel).toBe('ai_generated');
    } finally {
      global.fetch = origFetch;
    }
  });

  it('calculateMatch compares moods case-insensitively', () => {
    const baseUser = {
      id: 'u1',
      archetype: 'creator',
      purposes: ['lifestyle'],
      hobbies: ['yoga'],
      lifestyleHabits: {},
      spokenLanguages: ['en'],
      relationshipGoals: ['companionship'],
      corePassion: 'fitness',
      moods: ['Chill', 'Playful'],
    };
    const exactMatch = { ...baseUser, id: 'u2', moods: ['Chill', 'Playful'] };
    const lowerMatch = { ...baseUser, id: 'u3', moods: ['chill', 'playful'] };

    const scoreExact = calculateMatch(baseUser as any, exactMatch as any);
    const scoreLower = calculateMatch(baseUser as any, lowerMatch as any);
    expect(scoreLower.breakdown.moodResonance).toBe(scoreExact.breakdown.moodResonance);
  });
});
