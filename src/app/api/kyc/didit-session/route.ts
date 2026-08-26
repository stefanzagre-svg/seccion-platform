import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Official Didit Compliance Workflow ID
const WORKFLOW_ID = process.env.DIDIT_WORKFLOW_ID || '6cfcca5f-5f49-4226-b005-cbb22fd92b6b';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in to start verification.' },
        { status: 401 }
      );
    }

    const apiKey = process.env.DIDIT_API_KEY;
    if (!apiKey) {
      // Graceful fallback to hosted link if API key is not configured
      return NextResponse.json({
        url: process.env.NEXT_PUBLIC_DIDIT_KYC_URL || 'https://verify.didit.me/u/bPzKX19JQiawBcuyL9kraw',
        session_id: 'hosted_link_fallback',
      });
    }

    const origin = req.headers.get('origin') || 'https://seccion.ai';
    const callbackUrl = `${origin}/onboarding/kyc?session_done=true`;

    const res = await fetch('https://verification.didit.me/v3/session/', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        workflow_id: WORKFLOW_ID,
        vendor_data: user.id,
        callback: callbackUrl,
        contact_details: {
          email: user.email,
        },
        metadata: {
          user_id: user.id,
          platform: 'SECCION',
        },
      }),
    });

    if (!res.ok) {
      const detail = await res.text();
      console.error('[DIDIT Session Create Failed]:', res.status, detail);
      // Fallback to hosted link so the user is never blocked
      return NextResponse.json({
        url: process.env.NEXT_PUBLIC_DIDIT_KYC_URL || 'https://verify.didit.me/u/bPzKX19JQiawBcuyL9kraw',
        session_id: 'fallback',
      });
    }

    const session = await res.json();
    return NextResponse.json({
      url: session.url,
      session_id: session.session_id,
    });
  } catch (error: any) {
    console.error('[DIDIT Session API Error]:', error);
    return NextResponse.json(
      { url: process.env.NEXT_PUBLIC_DIDIT_KYC_URL || 'https://verify.didit.me/u/bPzKX19JQiawBcuyL9kraw' },
      { status: 200 }
    );
  }
}
