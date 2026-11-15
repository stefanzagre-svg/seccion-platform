import { NextRequest, NextResponse } from 'next/server';
import { pushSocialDraft, SocialDraftPayload } from '@/lib/social-scheduler';
import { verifyAdminAuth, unauthorizedResponse } from '@/lib/admin-auth';

/**
 * POST /api/v2/social/draft
 * Admin-only endpoint to push social media content drafts to Make.com scheduler.
 */
export async function POST(req: NextRequest) {
  try {
    const admin = await verifyAdminAuth(req, ['admin', 'super_admin']);
    if (!admin) {
      return unauthorizedResponse();
    }

    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Malformed JSON payload' }, { status: 400 });
    }

    if (!body?.text || typeof body.text !== 'string') {
      return NextResponse.json(
        { error: 'Field "text" is required and must be a string.' },
        { status: 400 }
      );
    }

    const payload: SocialDraftPayload = {
      text: body.text,
      mediaUrls: Array.isArray(body.mediaUrls) ? body.mediaUrls : [],
      scheduledAt: body.scheduledAt,
      platforms: Array.isArray(body.platforms) ? body.platforms : ['instagram', 'tiktok', 'twitter'],
    };

    const result = await pushSocialDraft(payload);

    return NextResponse.json(result, { status: result.success ? 200 : 400 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
