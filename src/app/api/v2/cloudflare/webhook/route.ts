import { NextRequest } from 'next/server';
import { POST as streamWebhookPost } from '@/app/api/stream/webhook/route';

/**
 * Legacy Cloudflare Stream webhook path delegated to the canonical fail-closed handler.
 */
export async function POST(req: NextRequest) {
  return streamWebhookPost(req);
}
