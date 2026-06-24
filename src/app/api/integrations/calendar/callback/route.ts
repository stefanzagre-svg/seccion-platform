import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const stateStr = searchParams.get('state');

  let state = 'default_state';
  let returnTo = '/studio';

  if (stateStr) {
    try {
      const parsed = JSON.parse(stateStr);
      state = parsed.state || 'default_state';
      returnTo = parsed.returnTo || '/studio';
    } catch (e) {
      state = stateStr;
    }
  }

  if (!code) {
    return NextResponse.json({ error: 'Authorization code is missing' }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    // If not authenticated, redirect to login page
    const loginUrl = new URL('/auth', request.url);
    loginUrl.searchParams.set('returnTo', returnTo);
    return NextResponse.redirect(loginUrl.toString());
  }

  try {
    let accessToken = '';
    let refreshToken = '';
    let expiresAt = new Date();
    let googleEmail = '';

    const isMock = code.startsWith('mock_') || !process.env.GOOGLE_CLIENT_ID;

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
