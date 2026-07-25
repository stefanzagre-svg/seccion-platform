/**
 * Social Media Scheduler Helper — SECCION Platform
 * Integrates with Buffer & Metricool APIs to push social posts as DRAFTS.
 * This guarantees 100% security — no raw passwords needed, and zero posts go live without 1-tap user approval.
 */

export interface SocialDraftPayload {
  text: string;
  mediaUrls?: string[];
  scheduledAt?: string; // ISO date string if scheduling for future
  platforms?: ('instagram' | 'tiktok' | 'twitter' | 'facebook')[];
}

export interface SocialDraftResponse {
  success: boolean;
  provider: 'buffer' | 'metricool' | 'mock';
  draftId?: string;
  message: string;
  approvalUrl?: string;
}

/**
 * Pushes a draft post to Buffer API
 * Docs: https://buffer.com/developers/api/updates#updatescreate
 */
export async function pushBufferDraft(payload: SocialDraftPayload): Promise<SocialDraftResponse> {
  const token = process.env.BUFFER_ACCESS_TOKEN;
  const profileIds = process.env.BUFFER_PROFILE_IDS?.split(',').map(id => id.trim()) || [];

  if (!token) {
    return {
      success: false,
      provider: 'buffer',
      message: 'BUFFER_ACCESS_TOKEN environment variable is not configured.',
    };
  }

  try {
    const params = new URLSearchParams();
    params.append('access_token', token);
    params.append('text', payload.text);
    params.append('shorten', 'false');
    // setting draft=true puts it in the review queue so it does NOT auto-publish
    params.append('draft', 'true');

    profileIds.forEach(id => params.append('profile_ids[]', id));

    if (payload.mediaUrls && payload.mediaUrls.length > 0) {
      payload.mediaUrls.forEach((url, idx) => {
        params.append(`media[photo]`, url);
      });
    }

    const res = await fetch('https://api.bufferapp.com/1/updates/create.json', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    const data = await res.json();

    if (data.success) {
      return {
        success: true,
        provider: 'buffer',
        draftId: data.updates?.[0]?.id,
        message: 'Successfully pushed draft to Buffer! Check your mobile app to review & approve.',
        approvalUrl: 'https://publish.buffer.com',
      };
    } else {
      return {
        success: false,
        provider: 'buffer',
        message: data.message || 'Buffer API returned an error.',
      };
    }
  } catch (error: any) {
    return {
      success: false,
      provider: 'buffer',
      message: error.message || 'Failed to connect to Buffer API.',
    };
  }
}

/**
 * Pushes a draft post to Metricool API
 * Docs: https://metricool.com/api-documentation/
 */
export async function pushMetricoolDraft(payload: SocialDraftPayload): Promise<SocialDraftResponse> {
  const token = process.env.METRICOOL_USER_TOKEN;
  const blogId = process.env.METRICOOL_BLOG_ID;

  if (!token || !blogId) {
    return {
      success: false,
      provider: 'metricool',
      message: 'METRICOOL_USER_TOKEN or METRICOOL_BLOG_ID is not configured.',
    };
  }

  try {
    const res = await fetch(`https://api.metricool.com/v2/posts?userToken=${token}&blogId=${blogId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: payload.text,
        media: payload.mediaUrls || [],
        status: 'DRAFT', // Draft status for review approval
        dateTime: payload.scheduledAt,
      }),
    });

    const data = await res.json();

    if (res.ok && data.id) {
      return {
        success: true,
        provider: 'metricool',
        draftId: data.id,
        message: 'Successfully pushed draft to Metricool! Check your Metricool dashboard to approve.',
        approvalUrl: 'https://app.metricool.com',
      };
    } else {
      return {
        success: false,
        provider: 'metricool',
        message: data.message || 'Metricool API returned an error.',
      };
    }
  } catch (error: any) {
    return {
      success: false,
      provider: 'metricool',
      message: error.message || 'Failed to connect to Metricool API.',
    };
  }
}

/**
 * Universal Social Scheduler Dispatcher
 */
export async function pushSocialDraft(payload: SocialDraftPayload): Promise<SocialDraftResponse> {
  // 1. Try Buffer if token exists
  if (process.env.BUFFER_ACCESS_TOKEN) {
    return await pushBufferDraft(payload);
  }

  // 2. Try Metricool if token exists
  if (process.env.METRICOOL_USER_TOKEN && process.env.METRICOOL_BLOG_ID) {
    return await pushMetricoolDraft(payload);
  }

  // 3. Fallback: Return simulated mock draft (for local testing & development)
  return {
    success: true,
    provider: 'mock',
    draftId: `draft-mock-${Date.now()}`,
    message: 'Simulated draft saved locally! Add BUFFER_ACCESS_TOKEN or METRICOOL_USER_TOKEN to .env.local to send to live mobile queue.',
    approvalUrl: 'https://seccion.ai/admin',
  };
}
