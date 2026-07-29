import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin-client';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Dev/Test bypass handling matching existing pattern
    const isDev = process.env.NODE_ENV === 'development';
    let userId = user?.id;

    if (!userId && isDev) {
      // In dev mode, check for x-user-id header or default test ID if specified
      userId = req.headers.get('x-user-id') || 'dev-creator-id';
    }

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { target = 'platform_content', title = 'Untitled Video', description = '', tier = 'vip', maxDurationSeconds = 3600 } = body;

    const cfAccountId = process.env.CLOUDFLARE_ACCOUNT_ID;
    const cfApiToken = process.env.CLOUDFLARE_API_TOKEN;

    if (!cfAccountId || !cfApiToken) {
      // Return mock response in development if CF credentials are not configured yet
      if (isDev) {
        const mockUid = `mock_stream_${Date.now()}`;
        const mockUploadUrl = `https://upload.videodelivery.net/${mockUid}`;

        const adminDb = createAdminClient();
        if (target === 'profile') {
          await adminDb.from('profiles').update({
            cloudflare_stream_uid: mockUid,
            video_status: 'pending',
          }).eq('id', userId);
        } else {
          await adminDb.from('platform_content').insert({
            creator_id: userId,
            title,
            description,
            tier,
            media_url: mockUploadUrl,
            media_type: 'video',
            cloudflare_stream_uid: mockUid,
            video_status: 'pending',
          });
        }

        return NextResponse.json({
          success: true,
          uploadUrl: mockUploadUrl,
          uid: mockUid,
          isMock: true,
          message: 'Cloudflare Stream credentials not set. Operating in Dev Mock Mode.',
        });
      }

      return NextResponse.json(
        { error: 'Cloudflare Stream credentials are missing on the server.' },
        { status: 500 }
      );
    }

    // Call Cloudflare Stream API to get a direct upload URL
    const cfRes = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${cfAccountId}/stream/direct_upload`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${cfApiToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          maxDurationSeconds,
          creator: userId,
          meta: {
            creator_id: userId,
            target,
            title,
          },
        }),
      }
    );

    const cfData = await cfRes.json();

    if (!cfData.success || !cfData.result) {
      console.error('Cloudflare Direct Upload Error:', cfData.errors);
      return NextResponse.json(
        { error: 'Failed to generate direct upload URL from Cloudflare Stream.', details: cfData.errors },
        { status: 502 }
      );
    }

    const { uploadURL, uid } = cfData.result;
    const adminDb = createAdminClient();

    let contentId = null;

    if (target === 'profile') {
      await adminDb.from('profiles').update({
        cloudflare_stream_uid: uid,
        video_status: 'pending',
      }).eq('id', userId);
    } else {
      const { data: inserted, error: dbErr } = await adminDb.from('platform_content').insert({
        creator_id: userId,
        title,
        description,
        tier,
        media_url: uploadURL,
        media_type: 'video',
        cloudflare_stream_uid: uid,
        video_status: 'pending',
      }).select('id').single();

      if (dbErr) {
        console.error('Database insertion error:', dbErr);
      }
      contentId = inserted?.id || null;
    }

    return NextResponse.json({
      success: true,
      uploadUrl: uploadURL,
      uid,
      contentId,
    });
  } catch (error: any) {
    console.error('Direct upload route handler error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
