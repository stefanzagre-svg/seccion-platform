import crypto from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin-client';
import { sendTelegramNotification } from '@/lib/telegram';

// Whole-number floats (1.0) -> integers (1), recursively. Matches Didit's server canonicalisation.
export function shortenFloats(v: unknown): unknown {
  if (Array.isArray(v)) return v.map(shortenFloats);
  if (v && typeof v === 'object') {
    return Object.fromEntries(
      Object.entries(v as Record<string, unknown>).map(([k, x]) => [k, shortenFloats(x)]),
    );
  }
  if (typeof v === 'number' && !Number.isInteger(v) && v % 1 === 0) return Math.trunc(v);
  return v;
}

// Recursive lexicographic key sort (array order preserved).
export function sortKeys(v: unknown): unknown {
  if (Array.isArray(v)) return v.map(sortKeys);
  if (v && typeof v === 'object') {
    return Object.keys(v as object)
      .sort()
      .reduce<Record<string, unknown>>((acc, k) => {
        acc[k] = sortKeys((v as Record<string, unknown>)[k]);
        return acc;
      }, {});
  }
  return v;
}

export function verifyDiditSignature(rawBody: string, sig: string, secret: string): boolean {
  if (!secret || !sig) return false;
  try {
    const parsed = JSON.parse(rawBody);
    const canonical = JSON.stringify(sortKeys(shortenFloats(parsed)));
    const expected = crypto
      .createHmac('sha256', secret)
      .update(canonical, 'utf8')
      .digest('hex');

    if (sig.length !== expected.length) return false;
    return crypto.timingSafeEqual(
      Buffer.from(expected.toLowerCase()),
      Buffer.from(sig.toLowerCase())
    );
  } catch {
    return false;
  }
}

// In-memory processed event set for idempotency deduplication
const processedEvents = new Set<string>();

export async function POST(req: NextRequest) {
  try {
    const raw = await req.text();
    const sig = req.headers.get('x-signature-v2') ?? '';
    const ts = Number(req.headers.get('x-timestamp'));
    const secret = process.env.DIDIT_WEBHOOK_SECRET;

    // 1. Freshness check: reject requests older/newer than 300s (replay protection)
    if (ts && Math.abs(Date.now() / 1000 - ts) > 300) {
      console.warn('[DIDIT Webhook] Stale timestamp rejected');
      return new Response('stale', { status: 401 });
    }

    // 2. Strict Signature verification (fail-closed)
    if (!secret) {
      console.error('[DIDIT Webhook] Secret not configured');
      return new Response('secret not configured', { status: 500 });
    }

    if (!sig) {
      console.warn('[DIDIT Webhook] Missing x-signature-v2 header');
      return new Response('missing signature', { status: 401 });
    }

    let parsed: any;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return new Response('invalid json', { status: 400 });
    }

    if (!verifyDiditSignature(raw, sig, secret)) {
      console.warn('[DIDIT Webhook] Bad signature rejected');
      return new Response('bad sig', { status: 401 });
    }

    const payload = parsed;
    const eventId = payload.event_id || payload.session_id;

    // 3. Idempotency dedupe
    if (eventId && processedEvents.has(eventId)) {
      return new Response('ok', { status: 200 });
    }
    if (eventId) {
      processedEvents.add(eventId);
    }

    const status = payload.status;
    const vendorData = payload.vendor_data || payload.metadata?.user_id;

    console.log(`[DIDIT Webhook] Status: "${status}" for User: ${vendorData}`);

    if (vendorData) {
      const adminDb = createAdminClient();

      switch (status) {
        case 'Approved': {
          // Update profile to KYC Verified & Active Creator
          const { data: profile } = await adminDb
            .from('profiles')
            .update({
              is_kyc_verified: true,
              role: 'creator',
              updated_at: new Date().toISOString(),
            })
            .eq('id', vendorData)
            .select()
            .single();

          // Award KYC Completion XP (+500 XP)
          const currentXp = profile?.connection_points || 0;
          await adminDb
            .from('profiles')
            .update({ connection_points: currentXp + 500 })
            .eq('id', vendorData);

          // Telegram Alert
          const msg =
            `🛡️ *CREATOR KYC VERIFIED (DIDIT)*\n\n` +
            `👤 *User:* @${profile?.username || 'Creator'} (${profile?.email || vendorData})\n` +
            `✅ *Decision:* Approved\n` +
            `🆔 *Session:* ${payload.session_id || 'N/A'}\n` +
            `🎁 *XP Awarded:* +500 XP (Creator Studio Unlocked)`;

          sendTelegramNotification(msg).catch((err) => console.warn(err));
          break;
        }

        case 'Declined': {
          await adminDb
            .from('profiles')
            .update({ is_kyc_verified: false })
            .eq('id', vendorData);
          break;
        }

        case 'In Review':
        case 'Resubmitted':
        case 'Kyc Expired':
        default:
          break;
      }
    }

    // Return 200 within 5 seconds
    return new Response('ok', { status: 200 });
  } catch (error: any) {
    console.error('[DIDIT Webhook Error]:', error);
    return new Response('error', { status: 500 });
  }
}
