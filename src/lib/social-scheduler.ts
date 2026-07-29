/**
 * Social Media Scheduler Helper — SECCION Platform
 * Integrates with Buffer GraphQL API (api.buffer.com/graphql)
 * Get your token at: https://publish.buffer.com/settings/api
 *
 * Capabilities:
 *  - pushBufferDraft()    — Schedule/queue a post to Buffer
 *  - getBufferPostStatus() — Check published/pending/draft posts
 *  - pushSocialDraft()    — Universal dispatcher (Buffer → mock fallback)
 */

const BUFFER_GRAPHQL_URL = 'https://api.buffer.com/graphql';

export interface SocialDraftPayload {
  text: string;
  mediaUrls?: string[];
  scheduledAt?: string; // ISO date string (UTC) if scheduling for future
  platforms?: ('instagram' | 'tiktok' | 'twitter' | 'facebook')[];
}

export interface SocialDraftResponse {
  success: boolean;
  provider: 'buffer' | 'mock';
  draftId?: string;
  message: string;
  approvalUrl?: string;
}

export interface BufferPost {
  id: string;
  status: 'sent' | 'draft' | 'scheduled' | 'error';
  text: string;
  createdAt: string;
  channel: {
    name: string;
    service: string;
  };
}

export interface BufferPostsStatusResponse {
  success: boolean;
  sent: BufferPost[];
  scheduled: BufferPost[];
  drafts: BufferPost[];
  error?: string;
}

/**
 * Execute a GraphQL query against the Buffer API
 */
async function bufferGQL(query: string, variables?: Record<string, unknown>): Promise<unknown> {
  const token = process.env.BUFFER_ACCESS_TOKEN;
  if (!token) throw new Error('BUFFER_ACCESS_TOKEN is not configured in environment variables.');

  const res = await fetch(BUFFER_GRAPHQL_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!res.ok) throw new Error(`Buffer API HTTP error: ${res.status} ${res.statusText}`);

  const json = (await res.json()) as { data?: unknown; errors?: { message: string }[] };
  if (json.errors?.length) {
    throw new Error(`Buffer GraphQL error: ${json.errors.map((e) => e.message).join(', ')}`);
  }

  return json.data;
}

/**
 * Retrieves the Buffer Organization ID for the authenticated account.
 * Cached at module level to avoid repeated API calls.
 */
let _cachedOrgId: string | null = null;
async function getOrgId(): Promise<string> {
  if (_cachedOrgId) return _cachedOrgId;

  const data = (await bufferGQL(`
    { account { organizations { id name } } }
  `)) as { account: { organizations: { id: string; name: string }[] } };

  const org = data.account.organizations[0];
  if (!org) throw new Error('No Buffer organization found for this account.');

  _cachedOrgId = org.id;
  return _cachedOrgId;
}

/**
 * Fetches posts from Buffer filtered by status.
 * Status options: sent | draft | scheduled | error
 */
export async function getBufferPostStatus(
  statusFilter: ('sent' | 'draft' | 'scheduled' | 'error')[] = ['sent', 'scheduled', 'draft']
): Promise<BufferPostsStatusResponse> {
  try {
    const orgId = await getOrgId();

    const data = (await bufferGQL(`
      query GetPosts($orgId: OrganizationId!, $statuses: [PostStatus!]) {
        posts(input: { organizationId: $orgId, filter: { status: $statuses } }) {
          edges {
            node {
              id
              status
              text
              createdAt
              channel {
                name
                service
              }
            }
          }
        }
      }
    `, {
      orgId,
      statuses: statusFilter,
    })) as { posts: { edges: { node: BufferPost }[] } };

    const allPosts = data.posts.edges.map((e) => e.node);

    return {
      success: true,
      sent: allPosts.filter((p) => p.status === 'sent'),
      scheduled: allPosts.filter((p) => p.status === 'scheduled'),
      drafts: allPosts.filter((p) => p.status === 'draft'),
    };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, sent: [], scheduled: [], drafts: [], error: msg };
  }
}

/**
 * Creates a post in Buffer (scheduled or draft).
 * To keep it as a draft (requires manual approval), pass scheduledAt as undefined.
 */
export async function pushBufferDraft(payload: SocialDraftPayload): Promise<SocialDraftResponse> {
  const token = process.env.BUFFER_ACCESS_TOKEN;

  if (!token) {
    return {
      success: false,
      provider: 'buffer',
      message: 'BUFFER_ACCESS_TOKEN is not configured in .env.local.',
    };
  }

  try {
    const orgId = await getOrgId();

    // Get connected channel IDs
    const channelsData = (await bufferGQL(`
      query GetChannels($orgId: OrganizationId!) {
        channels(input: { organizationId: $orgId }) {
          id
          name
          service
        }
      }
    `, { orgId })) as { channels: { id: string; name: string; service: string }[] };

    // Filter channels by requested platforms (or use all if not specified)
    const targetPlatforms = payload.platforms || ['instagram', 'tiktok', 'twitter'];
    const targetChannels = channelsData.channels.filter((ch) =>
      targetPlatforms.includes(ch.service as 'instagram' | 'tiktok' | 'twitter' | 'facebook')
    );

    if (targetChannels.length === 0) {
      return {
        success: false,
        provider: 'buffer',
        message: 'No matching Buffer channels found for the requested platforms.',
      };
    }

    // Create a post for each target channel
    const createdIds: string[] = [];
    for (const channel of targetChannels) {
      const result = (await bufferGQL(`
        mutation CreatePost($channelId: ChannelId!, $text: String!, $dueAt: DateTime) {
          createPost(input: {
            channelId: $channelId
            content: { text: $text }
            dueAt: $dueAt
          }) {
            post { id status }
          }
        }
      `, {
        channelId: channel.id,
        text: payload.text,
        dueAt: payload.scheduledAt ?? null,
      })) as { createPost: { post: { id: string } } };

      createdIds.push(result.createPost.post.id);
    }

    return {
      success: true,
      provider: 'buffer',
      draftId: createdIds.join(','),
      message: `✅ Successfully queued post to ${targetChannels.map((c) => c.service).join(', ')} via Buffer!`,
      approvalUrl: 'https://publish.buffer.com',
    };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, provider: 'buffer', message: msg };
  }
}

/**
 * Universal Social Scheduler Dispatcher
 * Tries Buffer first, falls back to mock mode for local development.
 */
export async function pushSocialDraft(payload: SocialDraftPayload): Promise<SocialDraftResponse> {
  if (process.env.BUFFER_ACCESS_TOKEN) {
    return await pushBufferDraft(payload);
  }

  // Fallback: simulated mock (for local dev without credentials)
  return {
    success: true,
    provider: 'mock',
    draftId: `draft-mock-${Date.now()}`,
    message:
      '🧪 Simulated draft saved locally! Add BUFFER_ACCESS_TOKEN to .env.local to send to live Buffer queue.',
    approvalUrl: 'https://seccion.ai/admin',
  };
}
