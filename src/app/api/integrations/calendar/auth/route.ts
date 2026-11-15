import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createHmac, randomUUID } from 'node:crypto';

function sanitizeReturnTo(raw: string | null): string {
  if (!raw || !raw.startsWith('/') || raw.startsWith('//') || raw.includes('\\')) {
    return '/studio';
  }
  return raw;
}

function signState(payload: string): string {
  const secret =
    process.env.CALENDAR_OAUTH_SECRET?.trim() ||
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ||
    'dev_cal_secret';
  return createHmac('sha256', secret).update(payload).digest('hex');
}

export async function GET(request: Request) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const returnTo = sanitizeReturnTo(searchParams.get('returnTo'));
  const nonce = randomUUID();
  const statePayload = JSON.stringify({ nonce, userId: user.id, returnTo });
  const sig = signState(statePayload);
  const signedState = Buffer.from(JSON.stringify({ payload: statePayload, sig })).toString('base64url');

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;

  let targetUrl: string;
  // Sandbox / Mock Mode Check (strictly dev-only)
  if (process.env.NODE_ENV === 'development' && (!clientId || clientId.startsWith('MOCK') || !redirectUri || redirectUri.startsWith('MOCK'))) {
    const callbackUrl = new URL('/api/integrations/calendar/callback', request.url);
    callbackUrl.searchParams.set('code', 'mock_auth_code_' + randomUUID().slice(0, 8));
    callbackUrl.searchParams.set('state', signedState);
    targetUrl = callbackUrl.toString();
  } else if (!clientId || !redirectUri) {
    return NextResponse.json({ error: 'Google Calendar OAuth is not configured' }, { status: 503 });
  } else {
    const oauthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    oauthUrl.searchParams.set('client_id', clientId);
    oauthUrl.searchParams.set('redirect_uri', redirectUri);
    oauthUrl.searchParams.set('response_type', 'code');
    oauthUrl.searchParams.set('scope', 'https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/userinfo.email');
    oauthUrl.searchParams.set('access_type', 'offline');
    oauthUrl.searchParams.set('prompt', 'consent');
    oauthUrl.searchParams.set('state', signedState);
    targetUrl = oauthUrl.toString();
  }

  const res = NextResponse.redirect(targetUrl);
  res.cookies.set('cal_oauth_nonce', nonce, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 600,
  });
  return res;
}
