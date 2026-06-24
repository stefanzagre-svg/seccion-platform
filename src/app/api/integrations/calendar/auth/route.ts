import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const state = searchParams.get('state') || 'default_state';
  const returnTo = searchParams.get('returnTo') || '/studio';

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;

  // Sandbox / Mock Mode Check
  if (!clientId || clientId.startsWith('MOCK') || !redirectUri || redirectUri.startsWith('MOCK')) {
    const callbackUrl = new URL('/api/integrations/calendar/callback', request.url);
    callbackUrl.searchParams.set('code', 'mock_auth_code_' + Math.random().toString(36).substring(7));
    callbackUrl.searchParams.set('state', JSON.stringify({ state, returnTo }));
    return NextResponse.redirect(callbackUrl.toString());
  }

  // Real Google OAuth Redirect
  const oauthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  oauthUrl.searchParams.set('client_id', clientId);
  oauthUrl.searchParams.set('redirect_uri', redirectUri);
  oauthUrl.searchParams.set('response_type', 'code');
  oauthUrl.searchParams.set('scope', 'https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/userinfo.email');
  oauthUrl.searchParams.set('access_type', 'offline');
  oauthUrl.searchParams.set('prompt', 'consent');
  oauthUrl.searchParams.set('state', JSON.stringify({ state, returnTo }));

  return NextResponse.redirect(oauthUrl.toString());
}
