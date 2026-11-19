import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  resolveDiditWorkflowId,
  resolveGeoAgeContext,
  type VerificationMode,
} from '@/lib/age-assurance';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in to start verification.' },
        { status: 401 }
      );
    }

    const apiKey = process.env.DIDIT_API_KEY;
    if (!apiKey) {
      console.error('[DIDIT Session]: DIDIT_API_KEY is not configured');
      return NextResponse.json(
        { error: 'Identity verification gateway is not configured.' },
        { status: 503 }
      );
    }

    const rawBody = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    const mode: VerificationMode =
      rawBody?.mode === 'member_age' ? 'member_age' : 'creator_kyc';

    const requestedReturnTo =
      typeof rawBody?.returnTo === 'string' &&
      rawBody.returnTo.startsWith('/') &&
      !rawBody.returnTo.startsWith('//')
        ? rawBody.returnTo
        : '/onboarding/kyc?session_done=true';

    const origin = req.headers.get('origin') || 'https://seccion.ai';
    const callbackUrl = `${origin}${requestedReturnTo}`;

    const geo = resolveGeoAgeContext({
      countryCode: req.headers.get('cf-ipcountry'),
      regionCode: req.headers.get('cf-region-code'),
    });

    const { workflowId, isDedicatedMemberWorkflow } = resolveDiditWorkflowId(mode);

    const res = await fetch('https://verification.didit.me/v3/session/', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        workflow_id: workflowId,
        vendor_data: user.id,
        callback: callbackUrl,
        contact_details: {
          email: user.email,
        },
        metadata: {
          user_id: user.id,
          platform: 'SECCION',
          verification_mode: mode,
          country_code: geo.countryCode,
          region_code: geo.regionCode,
        },
      }),
    });

    if (!res.ok) {
      const detail = await res.text();
      console.error('[DIDIT Session Create Failed]:', res.status, detail);
      return NextResponse.json(
        { error: 'Unable to start verification session right now. Please try again shortly.' },
        { status: 502 }
      );
    }

    const session = (await res.json()) as { url?: string; session_id?: string };
    return NextResponse.json({
      url: session.url,
      session_id: session.session_id,
      mode,
      dedicated_member_workflow: isDedicatedMemberWorkflow,
    });
  } catch (error: unknown) {
    console.error('[DIDIT Session API Error]:', error);
    return NextResponse.json(
      { error: 'Identity verification session failed to initialize.' },
      { status: 500 }
    );
  }
}
