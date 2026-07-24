import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Parse .env.local
const envPath = path.resolve(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([^#=]+)\s*=\s*(.*)\s*$/);
  if (match) {
    const key = match[1].trim();
    let value = match[2].trim();
    if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
    if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
    env[key] = value;
  }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL || 'https://sfthjyawyxjlbyszjkiu.supabase.co';
const supabaseAnonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_g77dP1FAhpIg3orcGwOLnw_hN0PeTV0';
const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY;

const client = createClient(supabaseUrl, supabaseAnonKey);
const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false, autoRefreshToken: false }
});
const BASE_URL = 'http://localhost:3000';

let passed = 0;
let failed = 0;

function assert(condition, label) {
  if (condition) {
    console.log(`  ✅ ${label}`);
    passed++;
  } else {
    console.log(`  ❌ ${label}`);
    failed++;
  }
}

async function runTest() {
  console.log('=== RUNNING LIVE STREAM TOKEN DISTRIBUTION E2E TEST ===\n');

  const creatorEmail = `test_stream_c_${Math.floor(Math.random() * 1000000)}@session.com`;
  const viewerEmail = `test_stream_v_${Math.floor(Math.random() * 1000000)}@session.com`;
  const password = 'TestStreamPassword123!';
  const creatorUsername = `stream_creator_${Math.floor(Math.random() * 1000000)}`;
  const viewerUsername = `stream_viewer_${Math.floor(Math.random() * 1000000)}`;

  let creatorUserId = null;
  let viewerUserId = null;
  let activeEventId = null;
  let activeSubId = null;
  let viewerAuthClient = null;

  try {
    // 1. Sign up Creator
    console.log(`1. Registering test creator: ${creatorEmail}...`);
    const { data: creatorAuth, error: creatorErr } = await client.auth.signUp({
      email: creatorEmail,
      password,
      options: { data: { username: creatorUsername } }
    });
    if (creatorErr) throw creatorErr;
    creatorUserId = creatorAuth.user.id;

    // Provision profile
    await client.from('profiles').upsert({
      id: creatorUserId,
      username: creatorUsername,
      display_name: 'Stream Host',
      role: 'creator'
    });

    // 2. Sign up Viewer
    console.log(`2. Registering test viewer: ${viewerEmail}...`);
    const { data: viewerAuth, error: viewerErr } = await client.auth.signUp({
      email: viewerEmail,
      password,
      options: { data: { username: viewerUsername } }
    });
    if (viewerErr) throw viewerErr;
    viewerUserId = viewerAuth.user.id;

    // Provision profile
    await client.from('profiles').upsert({
      id: viewerUserId,
      username: viewerUsername,
      display_name: 'Stream Viewer',
      role: 'member'
    });

    const { data: creatorSession } = await client.auth.signInWithPassword({
      email: creatorEmail,
      password
    });
    const creatorAuthClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false, autoRefreshToken: false }
    });
    await creatorAuthClient.auth.setSession(creatorSession.session);

    // Establish Viewer session to insert subscriptions
    const { data: viewerSession, error: viewerSignInError } = await client.auth.signInWithPassword({
      email: viewerEmail,
      password
    });
    if (viewerSignInError) throw viewerSignInError;

    viewerAuthClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false, autoRefreshToken: false }
    });
    await viewerAuthClient.auth.setSession(viewerSession.session);

    // Cleanup old streams
    await client.from('live_streams').delete().eq('creator_id', creatorUserId);

    // 3. Start Live Stream (POST /api/integrations/stream)
    console.log('3. Starting live stream as creator...');
    const startRes = await fetch(`${BASE_URL}/api/integrations/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-dev-user-id': creatorUserId
      },
      body: JSON.stringify({
        action: 'start',
        creatorId: creatorUserId
      })
    });

    const startJson = await startRes.json();
    assert(startRes.status === 200, `Stream start HTTP is 200 (got ${startRes.status})`);
    assert(startJson.success === true, 'Stream start returned success === true');
    assert(startJson.token !== undefined, 'Stream start returned a token');
    assert(startJson.token?.startsWith('host_stream_token_'), `Returned host token: ${startJson.token}`);

    // 4. Get Stream status as Host
    console.log('4. Fetching stream status as Host...');
    const getHostRes = await fetch(`${BASE_URL}/api/integrations/stream?creatorId=${creatorUserId}`, {
      headers: { 'x-dev-user-id': creatorUserId }
    });
    const getHostJson = await getHostRes.json();
    assert(getHostJson.isLive === true, 'Stream status reports isLive: true');
    assert(getHostJson.hasAccess === true, 'Host has access to their own stream');
    assert(getHostJson.token?.startsWith('host_stream_token_'), `Host received host token: ${getHostJson.token}`);

    // 5. Get Stream status as Public Viewer (Unsubscribed/Unmatched)
    console.log('5. Fetching stream status as Public Viewer...');
    const getPubRes = await fetch(`${BASE_URL}/api/integrations/stream?creatorId=${creatorUserId}`, {
      headers: { 'x-dev-user-id': viewerUserId }
    });
    const getPubJson = await getPubRes.json();
    assert(getPubJson.hasAccess === true, 'Public viewer has access to public stream');
    assert(getPubJson.isVipRestricted === false, 'Stream is currently not VIP restricted');
    assert(getPubJson.token?.startsWith('public_viewer_stream_token_'), `Public viewer distributed public token: ${getPubJson.token}`);

    // 6. Restrict stream to VIP using an active VIP calendar event
    console.log('6. Scheduling VIP calendar event to restrict stream...');
    const now = Date.now();
    const { data: eventData, error: eventErr } = await creatorAuthClient
      .from('calendar_events')
      .insert({
        creator_id: creatorUserId,
        title: 'VIP Exclusive Live Event',
        description: 'VIP only live sync',
        start_time: new Date(now - 1800 * 1000).toISOString(), // 30 mins ago
        end_time: new Date(now + 1800 * 1000).toISOString(),   // 30 mins from now
        type: 'vip'
      })
      .select()
      .single();

    if (eventErr) throw eventErr;
    activeEventId = eventData.id;

    // 7. Get Stream status as Unsubscribed Viewer (Should be blocked)
    console.log('7. Fetching VIP stream status as Unsubscribed Viewer...');
    const getBlockedRes = await fetch(`${BASE_URL}/api/integrations/stream?creatorId=${creatorUserId}`, {
      headers: { 'x-dev-user-id': viewerUserId }
    });
    const getBlockedJson = await getBlockedRes.json();
    assert(getBlockedJson.isVipRestricted === true, 'Stream is now reported as VIP restricted');
    assert(getBlockedJson.hasAccess === false, 'Unsubscribed viewer is denied access');
    assert(getBlockedJson.token === null, 'No token distributed to unauthorized viewer');

    // 8. Subscribe Viewer to Creator
    console.log('8. Subscribing viewer to creator...');
    const { data: subData, error: subErr } = await adminClient
      .from('subscriptions')
      .insert({
        subscriber_id: viewerUserId,
        creator_id: creatorUserId,
        tier: 'vip',
        is_active: true,
        expires_at: new Date(now + 3600 * 1000 * 24).toISOString(), // 1 day
        price_paid: 9.99
      })
      .select()
      .single();

    if (subErr) throw subErr;
    activeSubId = subData.id;

    // 9. Get Stream status as Subscribed Viewer (Should be allowed)
    console.log('9. Fetching VIP stream status as Subscribed Viewer...');
    const getAllowedRes = await fetch(`${BASE_URL}/api/integrations/stream?creatorId=${creatorUserId}`, {
      headers: { 'x-dev-user-id': viewerUserId }
    });
    const getAllowedJson = await getAllowedRes.json();
    assert(getAllowedJson.hasAccess === true, 'Subscribed viewer is granted access to VIP stream');
    assert(getAllowedJson.token?.startsWith('vip_viewer_stream_token_'), `VIP viewer distributed VIP token: ${getAllowedJson.token}`);

  } catch (err) {
    console.error('❌ Live Stream token test failed:', err.message || err);
    failed++;
  } finally {
    // Cleanup
    console.log('\n🧹 Cleaning up test database records...');
    if (creatorUserId) {
      await adminClient.from('live_streams').delete().eq('creator_id', creatorUserId);
    }
    if (activeEventId) {
      await adminClient.from('calendar_events').delete().eq('id', activeEventId);
    }
    if (activeSubId) {
      await adminClient.from('subscriptions').delete().eq('id', activeSubId);
    }

    console.log(`\nTest Run Finished: ${passed} passed, ${failed} failed.`);
    process.exit(failed > 0 ? 1 : 0);
  }
}

runTest();
