import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createHmac, timingSafeEqual } from 'node:crypto';

function sanitizeReturnTo(raw: string | undefined): string {
  if (!raw || !raw.startsWith('/') || raw.startsWith('//') || raw.includes('\\')) {
    return '/studio';
  }
  return raw;
}

function verifySignedState(stateParam: string | null): { nonce: string; userId: string; returnTo: string } | null {
  if (!stateParam) return null;
  try {
    const decoded = JSON.parse(Buffer.from(stateParam, 'base64url').toString('utf8'));
    const { payload, sig } = decoded || {};
    if (typeof payload !== 'string' || typeof sig !== 'string') return null;

    const secret =
      process.env.CALENDAR_OAUTH_SECRET?.trim() ||
      process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ||
      'dev_cal_secret';
    const expected = createHmac('sha256', secret).update(payload).digest('hex');
    if (sig.length !== expected.length || !timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) {
      return null;
    }

    const parsed = JSON.parse(payload);
    if (!parsed?.nonce || !parsed?.userId) return null;
    return {
      nonce: String(parsed.nonce),
      userId: String(parsed.userId),
      returnTo: sanitizeReturnTo(parsed.returnTo),
    };
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const stateStr = searchParams.get('state');

  const verifiedState = verifySignedState(stateStr);
  const cookieNonce = request.cookies.get('cal_oauth_nonce')?.value;

  if (!verifiedState || !cookieNonce || verifiedState.nonce !== cookieNonce) {
    return NextResponse.json({ error: 'Invalid or expired OAuth state' }, { status: 403 });
  }

  const returnTo = verifiedState.returnTo;

  if (!code) {
    return NextResponse.json({ error: 'Authorization code is missing' }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    const loginUrl = new URL('/auth', request.url);
    loginUrl.searchParams.set('returnTo', returnTo);
    return NextResponse.redirect(loginUrl.toString());
  }

  if (verifiedState.userId !== user.id) {
    return NextResponse.json({ error: 'OAuth state user mismatch' }, { status: 403 });
  }

  try {
    let accessToken = '';
    let refreshToken = '';
    let expiresAt = new Date();
    let googleEmail = '';

    const isMock =
      process.env.NODE_ENV === 'development' &&
      (code.startsWith('mock_') || !process.env.GOOGLE_CLIENT_ID);

    if (isMock) {
      // Sandbox Simulator Tokens
      accessToken = 'mock_access_token_' + Math.random().toString(36).substring(7);
      refreshToken = 'mock_refresh_token_' + Math.random().toString(36).substring(7);
      expiresAt = new Date(Date.now() + 3600 * 1000); // 1 hour
      googleEmail = 'sandbox.creator@gmail.com';
    } else {
      // Live Google Token Exchange
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          code,
          client_id: process.env.GOOGLE_CLIENT_ID!,
          client_secret: process.env.GOOGLE_CLIENT_SECRET!,
          redirect_uri: process.env.GOOGLE_REDIRECT_URI!,
          grant_type: 'authorization_code'
        })
      });

      if (!tokenResponse.ok) {
        const errDetails = await tokenResponse.text();
        throw new Error(`Token exchange failed: ${errDetails}`);
      }

      const tokens = await tokenResponse.json();
      accessToken = tokens.access_token;
      expiresAt = new Date(Date.now() + (tokens.expires_in || 3600) * 1000);

      // Extract or preserve refresh token
      if (tokens.refresh_token) {
        refreshToken = tokens.refresh_token;
      } else {
        // Retrieve existing token if prompt consent didn't yield a refresh token this time
        const { data: existing } = await supabase
          .from('creator_google_tokens')
          .select('refresh_token')
          .eq('creator_id', user.id)
          .single();
        refreshToken = existing?.refresh_token || '';
      }

      // Fetch user profile email
      const userinfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      if (userinfoResponse.ok) {
        const userinfo = await userinfoResponse.json();
        googleEmail = userinfo.email || '';
      }
    }

    if (!refreshToken) {
      throw new Error('No refresh token received. Try revoking permissions and reconnecting.');
    }

    // Persist to Supabase
    const { error: dbError } = await supabase
      .from('creator_google_tokens')
      .upsert({
        creator_id: user.id,
        access_token: accessToken,
        refresh_token: refreshToken,
        expires_at: expiresAt.toISOString(),
        google_email: googleEmail || null,
        updated_at: new Date().toISOString()
      });

    if (dbError) throw dbError;

    // Build redirect target with tab state triggers
    const redirectUrl = new URL(returnTo, request.url);
    if (returnTo.includes('/studio')) {
      redirectUrl.searchParams.set('activeTab', 'settings');
      redirectUrl.searchParams.set('calendarConnected', 'true');
    } else if (returnTo.includes('/profile/creator')) {
      redirectUrl.searchParams.set('activeTab', 'calendar');
      redirectUrl.searchParams.set('calendarConnected', 'true');
    }

    return NextResponse.redirect(redirectUrl.toString());

  } catch (error: any) {
    console.error('OAuth callback execution error:', error);
    // Redirect with error info
    const errorUrl = new URL(returnTo, request.url);
    errorUrl.searchParams.set('calendarError', error.message || 'unknown_oauth_error');
    return NextResponse.redirect(errorUrl.toString());
  }
}
