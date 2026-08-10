import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://sfthjyawyxjlbyszjkiu.supabase.co';
const supabaseAnonKey = 'sb_publishable_g77dP1FAhpIg3orcGwOLnw_hN0PeTV0';
const client = createClient(supabaseUrl, supabaseAnonKey);
const BASE_URL = 'http://localhost:3000';

let passed = 0;
let failed = 0;

function assert(condition, label) {
  if (condition) {
    console.log('  ✅ ' + label);
    passed++;
  } else {
    console.log('  ❌ ' + label);
    failed++;
  }
}

async function post(path, body, cookieHeader) {
  const headers = { 'Content-Type': 'application/json' };
  if (cookieHeader) headers['Cookie'] = cookieHeader;
  const res = await fetch(BASE_URL + path, { method: 'POST', headers, body: JSON.stringify(body) });
  let data = null;
  try { data = await res.json(); } catch {}
  return { status: res.status, data };
}

function buildCookieHeader(session) {
  // Supabase SSR stores the session as JSON in sb-<ref>-auth-token cookie
  const projectRef = 'sfthjyawyxjlbyszjkiu';
  const tokenValue = JSON.stringify({
    access_token: session.access_token,
    refresh_token: session.refresh_token,
    token_type: 'bearer',
    expires_in: session.expires_in,
    expires_at: session.expires_at,
    user: session.user
  });
  const encoded = encodeURIComponent(tokenValue);
  return 'sb-' + projectRef + '-auth-token=' + encoded + '; sb-' + projectRef + '-auth-token.0=' + encoded;
}

async function runTests() {
  console.log('=== RUNNING AI WINGMAN DATING ASSISTANT LOGIC TESTS ===\n');
  const rand = () => Math.floor(Math.random() * 1000000);
  const memberEmail = 'wingman_member_' + rand() + '@session-test.com';
  const creatorEmail = 'wingman_creator_' + rand() + '@session-test.com';
  const password = 'TestWingmanPassword123!';
  const memberUsername = 'wm_member_' + rand();
  const creatorUsername = 'wm_creator_' + rand();
  let memberUserId = null, creatorUserId = null, memberAccessToken = null, creatorAccessToken = null, memberAuthClient = null;

  try {
    console.log('1. Registering test Member user: ' + memberEmail + '...');
    const { data: memberAuthData, error: memberSignUpError } = await client.auth.signUp({ email: memberEmail, password, options: { data: { username: memberUsername } } });
    if (memberSignUpError) throw memberSignUpError;
    memberUserId = memberAuthData.user.id;
    console.log('    Logging in Member to establish session...');
    const { data: memberSessionData, error: memberSignInError } = await client.auth.signInWithPassword({ email: memberEmail, password });
    if (memberSignInError) throw memberSignInError;
    memberAccessToken = memberSessionData.session.access_token;
    const memberCookieHeader = buildCookieHeader(memberSessionData.session);
    memberAuthClient = createClient(supabaseUrl, supabaseAnonKey, { auth: { persistSession: false, autoRefreshToken: false } });
    await memberAuthClient.auth.setSession(memberSessionData.session);
    console.log('2. Provisioning Member profile...');
    const { error: mPErr } = await memberAuthClient.from('profiles').upsert({ id: memberUserId, username: memberUsername, display_name: 'Test Member Wingman', role: 'member', privacy_settings: { wingman_credits: 5 }, created_at: new Date().toISOString() });
    if (mPErr) throw mPErr;

    console.log('\n3. Registering test Creator user: ' + creatorEmail + '...');
    const { data: creatorAuthData, error: creatorSignUpError } = await client.auth.signUp({ email: creatorEmail, password, options: { data: { username: creatorUsername } } });
    if (creatorSignUpError) throw creatorSignUpError;
    creatorUserId = creatorAuthData.user.id;
    console.log('    Logging in Creator to establish session...');
    const { data: creatorSessionData, error: creatorSignInError } = await client.auth.signInWithPassword({ email: creatorEmail, password });
    if (creatorSignInError) throw creatorSignInError;
    creatorAccessToken = creatorSessionData.session.access_token;
    const creatorCookieHeader = buildCookieHeader(creatorSessionData.session);
    const creatorAuthClient = createClient(supabaseUrl, supabaseAnonKey, { auth: { persistSession: false, autoRefreshToken: false } });
    await creatorAuthClient.auth.setSession(creatorSessionData.session);
    console.log('4. Provisioning Creator profile...');
    const { error: creatorProfileError } = await creatorAuthClient.from('profiles').upsert({ id: creatorUserId, username: creatorUsername, display_name: 'Test Creator Wingman', role: 'creator' });
    if (creatorProfileError) throw creatorProfileError;

    console.log('\n━━━ Test 1: Creator access gating (expect 403 Forbidden) ━━━');
    const creatorChatRes = await post('/api/v2/assistant/chat', { message: 'Hello Wingman' }, creatorCookieHeader);
    assert(creatorChatRes.status === 403, 'HTTP status is 403 Forbidden (got ' + creatorChatRes.status + ')');
    assert(creatorChatRes.data?.error?.toLowerCase().includes('forbidden') || creatorChatRes.data?.error?.toLowerCase().includes('creator') || creatorChatRes.data?.error?.toLowerCase().includes('member'), 'Returns correct forbidden error message');

    console.log('\n━━━ Test 2: Trial Active Chat (expect 200 OK & no credit cost) ━━━');
    const trialRes = await post('/api/v2/assistant/chat', { message: 'How do I level up my relationship with Fiona?' }, memberCookieHeader);
    assert(trialRes.status === 200, 'HTTP status is 200 OK (got ' + trialRes.status + ')');
    assert(trialRes.data?.isTrial === true, 'Response identifies user is in Trial mode');
    assert(typeof trialRes.data?.trialDaysLeft === 'number' && trialRes.data.trialDaysLeft >= 0 && trialRes.data.trialDaysLeft <= 30, 'trialDaysLeft is within trial window (got ' + trialRes.data?.trialDaysLeft + ')');
    assert(trialRes.data?.credits !== undefined, 'credits field returned (got ' + trialRes.data?.credits + ')');
    assert(trialRes.data?.reply !== undefined, 'Returns a Wingman recommendation reply');

    console.log('\n━━━ Test 3: Trial Expired Chat (expect 200 OK & credit decremented) ━━━');
    const thirtyTwoDaysAgo = new Date();
    thirtyTwoDaysAgo.setDate(thirtyTwoDaysAgo.getDate() - 32);
    const expiredRes = await post('/api/v2/assistant/chat', { message: 'Give me match suggestions', devCreatedAt: thirtyTwoDaysAgo.toISOString() }, memberCookieHeader);
    console.log('    Debug - API Response:', expiredRes.data);
    assert(expiredRes.status === 200, 'HTTP status is 200 OK (got ' + expiredRes.status + ')');
    assert(expiredRes.data?.isTrial === false, 'Response identifies Trial has expired');
    assert(expiredRes.data?.trialDaysLeft === 0, 'trialDaysLeft is 0');
    assert(expiredRes.data?.credits === 4, 'credits decremented from 5 to 4 (got ' + expiredRes.data?.credits + ')');

    console.log('\n━━━ Test 4: Credit Depletion Block (expect 402 Payment Required) ━━━');
    await memberAuthClient.from('profiles').update({ privacy_settings: { wingman_credits: 0 } }).eq('id', memberUserId);
    const blockRes = await post('/api/v2/assistant/chat', { message: 'I want to ask another question', devCreatedAt: thirtyTwoDaysAgo.toISOString() }, memberCookieHeader);
    assert(blockRes.status === 402, 'HTTP status is 402 Payment Required (got ' + blockRes.status + ')');
    assert(blockRes.data?.error === 'credits_exhausted', 'Returns credits_exhausted error code');

    console.log('\n━━━ Test 5: Purchase Credits (expect 200 OK & credits = 50) ━━━');
    const purchaseRes = await post('/api/v2/assistant/purchase-credits', {}, memberCookieHeader);
    assert(purchaseRes.status === 200, 'HTTP status is 200 OK (got ' + purchaseRes.status + ')');
    assert(purchaseRes.data?.success === true, 'Purchase response reports success');
    assert(purchaseRes.data?.newCredits === 50, 'newCredits is 50 (got ' + purchaseRes.data?.newCredits + ')');
    console.log('    Verifying Wingman chat works again after credit purchase...');
    const postRefuelRes = await post('/api/v2/assistant/chat', { message: 'Hello Wingman, tell me more matches!', devCreatedAt: thirtyTwoDaysAgo.toISOString() }, memberCookieHeader);
    assert(postRefuelRes.status === 200, 'HTTP status is 200 OK (got ' + postRefuelRes.status + ')');
    assert(postRefuelRes.data?.credits === 49, 'credits decremented from 50 to 49 (got ' + postRefuelRes.data?.credits + ')');

  } catch (err) {
    console.error('❌ Integration Test Exception:', err);
    failed++;
  } finally {
    console.log('\n6. Cleaning up test users...');
    if (memberUserId) await client.from('profiles').delete().eq('id', memberUserId);
    if (creatorUserId) await client.from('profiles').delete().eq('id', creatorUserId);
    console.log('   ✅ Cleanup complete.');
  }
  console.log('\n================================================');
  console.log('Results: ' + passed + ' passed / ' + failed + ' failed / ' + (passed + failed) + ' total');
  if (failed === 0) { console.log('🎉 AI Wingman Dating Assistant Logic is 100% Operational & Verified!'); }
  else { console.error('⚠️ Verification Failed.'); }
  console.log('================================================');
}
runTests().catch(console.error);
