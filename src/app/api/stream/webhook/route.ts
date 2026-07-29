import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin-client';
import crypto from 'crypto';

/**
 * Cloudflare Stream Webhook Handler
 * Receives video status updates (video.ready, video.errored)
 * and updates Supabase platform_content or profiles tables.
 */
export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signatureHeader = req.headers.get('Webhook-Signature');
    const webhookSecret = process.env.CLOUDFLARE_STREAM_WEBHOOK_SECRET;

    // Verify webhook signature if secret is configured
    if (webhookSecret && signatureHeader) {
      const parts = signatureHeader.split(',');
      const timePart = parts.find((p) => p.startsWith('t='))?.split('=')[1];
      const sigPart = parts.find((p) => p.startsWith('v1='))?.split('=')[1];

      if (timePart && sigPart) {
        const hmac = crypto
          .createHmac('sha256', webhookSecret)
          .update(`${timePart}.${rawBody}`)
          .digest('hex');

        if (hmac !== sigPart) {
          console.error('Cloudflare Stream Webhook: Signature mismatch.');
          return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 401 });
        }
      }
    }

    const body = JSON.parse(rawBody);
    const { uid, status, thumbnail, duration, meta } = body;

    if (!uid) {
      return NextResponse.json({ error: 'Missing video UID' }, { status: 400 });
    }

    const adminDb = createAdminClient();
    const state = status?.state; // 'ready' or 'error' / 'errored'
    const target = meta?.target; // 'profile' or 'platform_content'

    const isReady = state === 'ready';
    const isError = state === 'errored' || state === 'error';
    const videoStatus = isReady ? 'ready' : isError ? 'error' : 'pending';

    if (target === 'profile') {
      await adminDb
        .from('profiles')
        .update({
          video_status: videoStatus,
          video_thumbnail_url: thumbnail || null,
        })
        .eq('cloudflare_stream_uid', uid);
    } else {
      // Default to platform_content table
      await adminDb
        .from('platform_content')
        .update({
          video_status: videoStatus,
          thumbnail_url: thumbnail || null,
          duration_seconds: duration ? parseFloat(duration) : null,
          media_url: body.playback?.hls || `https://videodelivery.net/${uid}/manifest/video.m3u8`,
        })
        .eq('cloudflare_stream_uid', uid);
    }

    return NextResponse.json({ success: true, uid, status: videoStatus });
  } catch (error: any) {
    console.error('Error processing Cloudflare Stream Webhook:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
