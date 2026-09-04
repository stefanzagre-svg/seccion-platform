import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from '@/app/api/v2/assistant/chat/route';

/**
 * ADVERSARIAL CHALLENGER SUITE: Wingman Assistant Chat Concurrency & Fail-Closed Behavior
 * 
 * Verifies that `web/src/app/api/v2/assistant/chat/route.ts`:
 * 1. Fails closed with 503 Service Unavailable when consume_wingman_credit RPC errors
 * 2. Strictly returns 402 Payment Required when credits are exhausted (success: false)
 * 3. Never falls back to un-locked client-side writes or grants free AI queries
 * 4. Correctly extracts `balance` from RPC return without undefined values
 */

let mockUser: { id: string } | null = null;
let mockProfile: any = null;
let mockRpcResult: { data: any; error: any } = { data: null, error: null };

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(async () => ({
    auth: {
      getUser: vi.fn(async () => ({
        data: { user: mockUser },
        error: mockUser ? null : { message: 'Not authenticated' },
      })),
    },
    from: vi.fn((table: string) => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(async () => ({
            data: mockProfile,
            error: mockProfile ? null : { message: 'Profile not found' },
          })),
          limit: vi.fn(async () => ({
            data: [],
            error: null,
          })),
        })),
        limit: vi.fn(async () => ({
          data: [],
          error: null,
        })),
      })),
    })),
    rpc: vi.fn(async (fnName: string, params: any) => {
      if (fnName === 'consume_wingman_credit') {
        return mockRpcResult;
      }
      return { data: null, error: { message: 'Unknown RPC' } };
    }),
  })),
}));

vi.mock('@/lib/supabase/admin-client', () => ({
  createAdminClient: vi.fn(() => ({
    from: vi.fn(() => ({
      insert: vi.fn(async () => ({ error: null })),
    })),
  })),
}));

vi.mock('@google/genai', () => ({
  GoogleGenAI: class {
    models = {
      generateContent: vi.fn(async () => ({
        text: 'Mocked Gemini response for dating advice',
      })),
    };
  },
}));

function createChatRequest(body: any): NextRequest {
  return new NextRequest('http://localhost:3000/api/v2/assistant/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('Adversarial Challenge: Wingman Assistant Chat API Gating', () => {
  beforeEach(() => {
    process.env.GEMINI_API_KEY = 'mock_gemini_key';
    mockUser = { id: 'member_user_01' };
    mockProfile = {
      role: 'member',
      display_name: 'Alex',
      username: 'alex',
      created_at: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString(), // 40 days old -> outside 30-day free trial
      privacy_settings: { wingman_credits: 10 },
      archetype: 'The Explorer',
      core_passion: 'Art & Cinema',
    };
    mockRpcResult = {
      data: { success: true, balance: 9, remaining_credits: 9 },
      error: null,
    };
  });

  it('fails closed with 503 Service Unavailable when stored procedure RPC returns an error', async () => {
    // Simulate DB connection failure / lock timeout
    mockRpcResult = {
      data: null,
      error: { message: 'canceling statement due to statement timeout / lock wait' },
    };

    const req = createChatRequest({ message: 'What is a good opener?' });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(503);
    expect(data.error).toBe('service_unavailable');
    expect(data.message).toMatch(/Credit verification service unavailable/i);
  });

  it('strictly returns 402 Payment Required when wingman credits are exhausted (success: false)', async () => {
    mockRpcResult = {
      data: { success: false, balance: 0, error: 'Insufficient wingman credits' },
      error: null,
    };

    const req = createChatRequest({ message: 'Can you help me with this bio?' });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(402);
    expect(data.error).toBe('credits_exhausted');
    expect(data.credits).toBe(0);
  });

  it('deducts credit via atomic RPC and grants response when credits are available', async () => {
    mockRpcResult = {
      data: { success: true, balance: 9, remaining_credits: 9 },
      error: null,
    };

    const req = createChatRequest({ message: 'Help me craft an opening message' });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.reply).toBeDefined();
    expect(data.credits).toBe(9);
  });
});
