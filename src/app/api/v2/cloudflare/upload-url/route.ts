import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

export async function POST(req: NextRequest) {
  try {
    const { title, description, tier } = await req.json();

    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
    const apiToken = process.env.CLOUDFLARE_API_TOKEN;

    if (!accountId || !apiToken) {
      return NextResponse.json({ error: 'Cloudflare credentials not configured' }, { status: 500 });
    }

    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          },
        },
      }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const creatorId = user.id;

    // Direct Upload URL request to Cloudflare
    const response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/stream/direct_upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        maxDurationSeconds: 3600, // 1 hour max
        requireSignedURLs: true,
        meta: {
          title: title || 'Untitled Video',
          creatorId: creatorId,
          tier: tier || 'VIP'
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Cloudflare Error:', errorData);
      return NextResponse.json({ error: 'Failed to generate upload URL' }, { status: response.status });
    }

    const data = await response.json();
    
    // Cloudflare returns an uploadURL (to POST the file to) and a uid (the video ID)
    const { uploadURL, uid } = data.result;

    return NextResponse.json({ 
      uploadURL, 
      uid,
      success: true 
    });
    
  } catch (error) {
    console.error('Upload URL Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
