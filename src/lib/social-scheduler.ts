/**
 * Social Media Scheduler Helper — SECCIØN Platform
 * Integrates with Make.com Webhook using validated HTTPS media URLs.
 */

export interface SocialDraftPayload {
  text: string;
  mediaUrls?: string[]; // Array of validated HTTPS media URLs
  platforms?: ('instagram' | 'tiktok' | 'twitter' | 'facebook')[];
  scheduledAt?: string;
}

export interface SocialDraftResponse {
  success: boolean;
  provider: 'make.com';
  message: string;
}

const MAKE_WEBHOOK_URL = process.env.MAKE_SOCIAL_WEBHOOK_URL?.trim();

function sanitizeExternalMediaUrl(rawUrl: string): string {
  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    throw new Error('Invalid media URL: local file paths are not allowed.');
  }
  if (parsed.protocol !== 'https:') {
    throw new Error('Invalid media URL: HTTPS protocol is required.');
  }
  return parsed.toString();
}

export async function pushSocialDraft(payload: SocialDraftPayload): Promise<SocialDraftResponse> {
  try {
    if (!MAKE_WEBHOOK_URL) {
      return {
        success: false,
        provider: 'make.com',
        message: 'MAKE_SOCIAL_WEBHOOK_URL is not configured.',
      };
    }

    const publicMediaUrls = (payload.mediaUrls || [])
      .filter((u): u is string => typeof u === 'string' && u.trim().length > 0)
      .map((u) => sanitizeExternalMediaUrl(u.trim()));

    const makePayload = {
      text: payload.text,
      platforms: payload.platforms || ['instagram', 'tiktok', 'twitter'],
      mediaUrls: publicMediaUrls
    };

    const res = await fetch(MAKE_WEBHOOK_URL, {
      method: 'POST',
      signal: AbortSignal.timeout(10000),
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(makePayload),
    });

    if (!res.ok) {
      throw new Error(`Make.com webhook failed: ${res.statusText}`);
    }

    // Trigger the scenario immediately since Make webhooks respond instantly
    return {
      success: true,
      provider: 'make.com',
      message: `✅ Successfully pushed payload to Make.com webhook! Platforms: ${makePayload.platforms.join(', ')}`,
    };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, provider: 'make.com', message: msg };
  }
}
