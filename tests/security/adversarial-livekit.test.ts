import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from '@/app/api/livekit/token/route';

/**
 * ADVERSARIAL CHALLENGER SUITE: R4 LiveKit WebRTC Signaling & Anti-Takeover
 * 
 * Verifies the ACTUAL production route handler: `web/src/app/api/livekit/token/route.ts`
 * 
 * Tests:
 * 1. Unauthorized creator publishing to another creator's broadcast room -> 403 Forbidden
 * 2. Unauthorized user eavesdropping on private 1-on-1 call -> 403 Forbidden
 * 3. Non-creator user attempting to publish -> 403 Forbidden
 * 4. Legitimate creator publishing on own broadcast room -> 200 OK + JWT canPublish: true
 * 5. Viewer joining broadcast stream to watch -> 200 OK + JWT canPublish: false, canSubscribe: true
 * 6. Authorized participants in private call -> 200 OK + JWT canPublish: true
 * 7. Token TTL verification: exp - iat === 3600 (bounded 1-hour TTL, not default 6h)
 * 8. Input validation robustness: malformed JSON (400), missing params (400), unauthenticated (401)
 * 9. Rapid signaling bursts: 100 concurrent requests without failure or token corruption
 */

// Mock database state
let mockCurrentUser: { id: string } | null = null;
let mockCreatorProfiles: Set<string> = new Set();
let mockLiveStreams: Map<string, { creator_id: string }> = new Map();
let mockCallRequests: Map<string, { member_id: string; creator_id: string }> = new Map();

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(async () => ({
    auth: {
      getUser: vi.fn(async () => ({
        data: { user: mockCurrentUser },
        error: mockCurrentUser ? null : { message: 'Not authenticated' },
      })),
    },
    from: vi.fn((table: string) => {
      return {
        select: vi.fn(() => ({
          eq: vi.fn((col: string, val: string) => ({
            single: vi.fn(async () => {
              if (table === 'creator_profiles') {
                if (mockCreatorProfiles.has(val)) {
                  return { data: { id: val }, error: null };
                }
                return { data: null, error: { message: 'Not found' } };
              }
              if (table === 'live_streams') {
                const stream = mockLiveStreams.get(val);
                if (stream) {
                  return { data: stream, error: null };
                }
                return { data: null, error: { message: 'Stream not found' } };
              }
              if (table === 'call_requests') {
                const call = mockCallRequests.get(val);
                if (call) {
                  return { data: call, error: null };
                }
                return { data: null, error: { message: 'Call not found' } };
              }
              return { data: null, error: { message: 'Unknown table' } };
            }),
          })),
        })),
      };
    }),
  })),
}));

function createNextRequest(body: any): NextRequest {
  const bodyStr = typeof body === 'string' ? body : JSON.stringify(body);
  return new NextRequest('http://localhost:3000/api/livekit/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: bodyStr,
  });
}

function decodeJwtPayload(token: string): any {
  const parts = token.split('.');
  if (parts.length < 2) throw new Error('Invalid JWT');
  return JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'));
}

describe('Adversarial Challenge: R4 LiveKit Signaling & Anti-Takeover', () => {
  beforeEach(() => {
    process.env.LIVEKIT_API_KEY = 'APIeBTxEmBoDnLS';
    process.env.LIVEKIT_API_SECRET = 'KfWQpjVzNfcDxtPc9ARqYoRnYb7nPdDXVvHT8GGqL7U';

    mockCurrentUser = { id: 'creator_alice' };
    mockCreatorProfiles = new Set(['creator_alice', 'creator_bob', 'creator_victim']);
    mockLiveStreams = new Map([
      ['stream_alice_uuid', { creator_id: 'creator_alice' }],
      ['stream_victim_uuid', { creator_id: 'creator_victim' }],
    ]);
    mockCallRequests = new Map([
      ['req_call_100', { member_id: 'member_charlie', creator_id: 'creator_alice' }],
    ]);
  });

  describe('Pillar 1: Broadcast Stream Takeover Prevention (BOLA/IDOR)', () => {
    it('strictly returns 403 Forbidden when Creator Bob attempts to publish to Creator Alice broadcast room', async () => {
      mockCurrentUser = { id: 'creator_bob' };

      const req = createNextRequest({
        roomName: 'live_creator_alice',
        participantName: 'Bob Attacker',
        isCreator: true,
      });

      const res = await POST(req);
      const data = await res.json();

      expect(res.status).toBe(403);
      expect(data.error).toBe('Forbidden: You do not own this live broadcast room');
      expect(data.token).toBeUndefined();
    });

    it('strictly returns 403 Forbidden when Creator Bob attempts to hijack Alice stream ID', async () => {
      mockCurrentUser = { id: 'creator_bob' };

      const req = createNextRequest({
        roomName: 'live_stream_alice_uuid',
        participantName: 'Bob Attacker',
        isCreator: true,
      });

      const res = await POST(req);
      const data = await res.json();

      expect(res.status).toBe(403);
      expect(data.error).toBe('Forbidden: You do not own this live broadcast room');
    });

    it('strictly returns 403 Forbidden when a non-creator member claims isCreator: true to publish', async () => {
      mockCurrentUser = { id: 'member_impostor' };
      // member_impostor is NOT in mockCreatorProfiles

      const req = createNextRequest({
        roomName: 'live_member_impostor',
        participantName: 'Fake Creator',
        isCreator: true,
      });

      const res = await POST(req);
      const data = await res.json();

      expect(res.status).toBe(403);
      expect(data.error).toBe('Forbidden: Creator profile required to publish');
    });

    it('allows verified creator to publish to their own direct broadcast room', async () => {
      mockCurrentUser = { id: 'creator_alice' };

      const req = createNextRequest({
        roomName: 'live_creator_alice',
        participantName: 'Alice',
        isCreator: true,
      });

      const res = await POST(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.token).toBeDefined();

      const payload = decodeJwtPayload(data.token);
      expect(payload.video.room).toBe('live_creator_alice');
      expect(payload.video.canPublish).toBe(true);
      expect(payload.video.canSubscribe).toBe(true);
      expect(payload.sub).toBe('creator_alice');
    });

    it('allows verified creator to publish to their stream ID room', async () => {
      mockCurrentUser = { id: 'creator_alice' };

      const req = createNextRequest({
        roomName: 'live_stream_alice_uuid',
        participantName: 'Alice Streamer',
        isCreator: true,
      });

      const res = await POST(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      const payload = decodeJwtPayload(data.token);
      expect(payload.video.canPublish).toBe(true);
    });

    it('allows audience member to join broadcast stream as subscriber only (canPublish: false)', async () => {
      mockCurrentUser = { id: 'member_viewer' };

      const req = createNextRequest({
        roomName: 'live_creator_alice',
        participantName: 'Audience Fan',
        isCreator: false,
      });

      const res = await POST(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.token).toBeDefined();

      const payload = decodeJwtPayload(data.token);
      expect(payload.video.room).toBe('live_creator_alice');
      expect(payload.video.canPublish).toBe(false); // Audience cannot broadcast
      expect(payload.video.canSubscribe).toBe(true); // Audience can watch
    });
  });

  describe('Pillar 2: Private 1-on-1 Call Gating (Anti-Eavesdropping)', () => {
    it('strictly returns 403 Forbidden when unauthorized user Eve attempts to join private call', async () => {
      mockCurrentUser = { id: 'member_eve_eavesdropper' };

      const req = createNextRequest({
        roomName: 'call_req_call_100',
        participantName: 'Eve Snooper',
        isCreator: false,
      });

      const res = await POST(req);
      const data = await res.json();

      expect(res.status).toBe(403);
      expect(data.error).toBe('Forbidden: You are not an authorized participant in this private call');
      expect(data.token).toBeUndefined();
    });

    it('allows authorized member participant to join private 1-on-1 call with publishing rights', async () => {
      mockCurrentUser = { id: 'member_charlie' };

      const req = createNextRequest({
        roomName: 'call_req_call_100',
        participantName: 'Charlie Member',
        isCreator: false,
      });

      const res = await POST(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      const payload = decodeJwtPayload(data.token);
      expect(payload.video.room).toBe('call_req_call_100');
      expect(payload.video.canPublish).toBe(true);
      expect(payload.video.canSubscribe).toBe(true);
    });

    it('allows authorized creator participant to join private 1-on-1 call with publishing rights', async () => {
      mockCurrentUser = { id: 'creator_alice' };

      const req = createNextRequest({
        roomName: 'call_req_call_100',
        participantName: 'Alice Creator',
        isCreator: true,
      });

      const res = await POST(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      const payload = decodeJwtPayload(data.token);
      expect(payload.video.canPublish).toBe(true);
    });
  });

  describe('Pillar 3: Token TTL & Cryptographic Claim Invariants', () => {
    it('strictly enforces bounded 3600s (1 hour) TTL on minted JWT tokens', async () => {
      mockCurrentUser = { id: 'creator_alice' };

      const req = createNextRequest({
        roomName: 'live_creator_alice',
        participantName: 'Alice',
        isCreator: true,
      });

      const res = await POST(req);
      const data = await res.json();
      const payload = decodeJwtPayload(data.token);

      console.log(`[Adversarial R4 TTL Payload Keys]`, Object.keys(payload), payload);
      const now = Math.floor(Date.now() / 1000);
      const ttlSeconds = payload.exp - (payload.nbf || payload.iat || now);
      console.log(`[Adversarial R4 TTL] exp: ${payload.exp}, nbf: ${payload.nbf}, iat: ${payload.iat}, calculated TTL: ${payload.exp - now}s`);

      // Verify that exp is roughly now + 3600 (within 5 seconds tolerance)
      expect(payload.exp - now).toBeGreaterThanOrEqual(3595);
      expect(payload.exp - now).toBeLessThanOrEqual(3605);
    });
  });

  describe('Pillar 4: Edge Error Boundaries & Defensive Parsing', () => {
    it('returns 400 Bad Request on malformed JSON payload without crashing', async () => {
      const req = new NextRequest('http://localhost:3000/api/livekit/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{"unclosed_json',
      });

      const res = await POST(req);
      const data = await res.json();

      expect(res.status).toBe(400);
      expect(data.error).toBe('Malformed JSON payload');
    });

    it('returns 400 Bad Request when roomName or participantName is missing', async () => {
      const req = createNextRequest({ roomName: 'live_test' }); // missing participantName
      const res = await POST(req);
      const data = await res.json();

      expect(res.status).toBe(400);
      expect(data.error).toBe('Missing roomName or participantName');
    });

    it('returns 401 Unauthorized when auth session is missing', async () => {
      mockCurrentUser = null; // unauthenticated

      const req = createNextRequest({
        roomName: 'live_test',
        participantName: 'Anonymous',
      });

      const res = await POST(req);
      const data = await res.json();

      expect(res.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('returns 500 Internal Server Error when LiveKit credentials are unconfigured', async () => {
      delete process.env.LIVEKIT_API_KEY;

      const req = createNextRequest({
        roomName: 'live_test',
        participantName: 'TestUser',
      });

      const res = await POST(req);
      const data = await res.json();

      expect(res.status).toBe(500);
      expect(data.error).toBe('LiveKit credentials not configured');
    });
  });

  describe('Pillar 5: High-Concurrency Burst Stress', () => {
    it('mints 100 tokens concurrently under mixed room types with zero failures', async () => {
      const BURST_COUNT = 100;
      mockCurrentUser = { id: 'creator_alice' };

      const start = performance.now();
      const promises = Array.from({ length: BURST_COUNT }).map((_, i) => {
        const isBroadcast = i % 2 === 0;
        const req = createNextRequest({
          roomName: isBroadcast ? 'live_creator_alice' : 'call_req_call_100',
          participantName: `Alice_Burst_${i}`,
          isCreator: isBroadcast,
        });
        return POST(req).then(async (res) => ({
          status: res.status,
          data: await res.json(),
        }));
      });

      const results = await Promise.all(promises);
      const duration = performance.now() - start;

      const successCount = results.filter((r) => r.status === 200 && r.data.token).length;
      console.log(`[Adversarial R4 Burst] Minted ${BURST_COUNT} tokens concurrently in ${duration.toFixed(2)}ms (${(duration / BURST_COUNT).toFixed(2)}ms/req)`);

      expect(successCount).toBe(BURST_COUNT);
    });
  });
});
