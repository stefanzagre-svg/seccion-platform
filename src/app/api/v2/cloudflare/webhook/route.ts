import { NextResponse } from 'next/server';
// In a real app, you would import your DB client here (e.g. Supabase or PostgreSQL)

export async function POST(req: Request) {
  try {
    // Cloudflare sends a signature header to verify the webhook authenticity
    const signatureHeader = req.headers.get('Webhook-Signature');
    
    // In production, verify the signature using your webhook secret from Cloudflare
    // if (!verifySignature(await req.clone().text(), signatureHeader, process.env.CLOUDFLARE_WEBHOOK_SECRET)) {
    //   return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    // }

    const payload = await req.json();

    // Cloudflare Stream webhook payload structure
    // We care about the 'video.encoding.success' or 'video.encoding.error' events
    
    if (payload.status && payload.uid) {
      const videoUid = payload.uid;
      const status = payload.status.state; // usually 'ready' or 'error'

      console.log(`Webhook received for video ${videoUid}. Status: ${status}`);

      // Here you would update your database:
      /*
      await db.query(
        `UPDATE public.platform_content 
         SET video_status = $1, duration_seconds = $2, thumbnail_url = $3 
         WHERE cloudflare_stream_uid = $4`,
        [
          status === 'ready' ? 'ready' : 'error',
          payload.meta?.duration || null,
          payload.thumbnail || null,
          videoUid
        ]
      );
      */
      
      return NextResponse.json({ success: true, message: 'Webhook processed' });
    }

    return NextResponse.json({ success: true, message: 'Ignored unrelated event' });
    
  } catch (error) {
    console.error('Webhook Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
