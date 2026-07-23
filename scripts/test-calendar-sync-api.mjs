import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://sfthjyawyxjlbyszjkiu.supabase.co';
const supabaseAnonKey = 'sb_publishable_g77dP1FAhpIg3orcGwOLnw_hN0PeTV0';

const client = createClient(supabaseUrl, supabaseAnonKey);
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
  console.log('=== RUNNING CALENDAR SYNC API ENDPOINT E2E TEST ===\n');

  const email = `test_api_sync_${Math.floor(Math.random() * 1000000)}@session.com`;
  const password = 'TestApiSyncPassword123!';
  const username = `api_creator_${Math.floor(Math.random() * 1000000)}`;

  let creatorUserId = null;

  try {
    // 1. Sign up creator
    console.log(`1. Registering test creator: ${email}...`);
    const { data: authData, error: signUpError } = await client.auth.signUp({
      email,
      password,
      options: { data: { username } }
    });

    if (signUpError) throw signUpError;
    creatorUserId = authData.user.id;
    console.log(`   Registered creator ID: ${creatorUserId}`);

    // 2. Provision profile row
    console.log('2. Provisioning profile row...');
    const { error: profileError } = await client
      .from('profiles')
      .upsert({
        id: creatorUserId,
        username,
        display_name: 'API Sync Creator',
        role: 'creator'
      });
    if (profileError) throw profileError;

    // Authenticated Supabase Client to insert tokens
    const { data: sessionData, error: signInError } = await client.auth.signInWithPassword({
      email,
      password
    });
    if (signInError) throw signInError;

    const authClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false, autoRefreshToken: false }
    });
    await authClient.auth.setSession(sessionData.session);

    // 3. Store mock google token
    console.log('3. Seeding mock Google OAuth token...');
    const { error: tokenError } = await authClient
      .from('creator_google_tokens')
      .insert({
        creator_id: creatorUserId,
        access_token: 'mock_sync_access_token',
        refresh_token: 'mock_sync_refresh_token',
        expires_at: new Date(Date.now() + 3600 * 1000).toISOString(),
        google_email: 'api.creator.sync@gmail.com'
      });
    if (tokenError) throw tokenError;

    // 4. Invoke API Endpoint
    console.log('4. Invoking Calendar Sync API Endpoint...');
    const res = await fetch(`${BASE_URL}/api/integrations/calendar`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-dev-user-id': creatorUserId
      },
      body: JSON.stringify({
        action: 'sync',
        creatorId: creatorUserId
      })
    });

    const resJson = await res.json();
    
    assert(res.status === 200, `HTTP status is 200 (got ${res.status})`);
    assert(resJson.success === true, 'Response shows success === true');
    assert(resJson.syncedCount === 2, `syncedCount is 2 (got ${resJson.syncedCount})`);

    // 5. Query local DB to verify
    console.log('5. Querying database to verify sync persistence...');
    const { data: dbEvents, error: queryErr } = await client
      .from('calendar_events')
      .select('*')
      .eq('creator_id', creatorUserId);

    if (queryErr) throw queryErr;

    assert(dbEvents && dbEvents.length === 2, `DB holds 2 events for creator (got ${dbEvents?.length})`);
    const coffeeEvent = dbEvents.find(e => e.google_event_id === 'mock_gcal_event_1');
    const vipEvent = dbEvents.find(e => e.google_event_id === 'mock_gcal_event_2');

    assert(coffeeEvent !== undefined, 'Found Coffee Date event in local DB');
    assert(coffeeEvent?.type === 'public', 'Coffee Date type is public');
    assert(vipEvent !== undefined, 'Found VIP Event in local DB');
    assert(vipEvent?.type === 'vip', 'VIP Event type is vip');

  } catch (err) {
    console.error('❌ Integration API Test failed:', err.message || err);
    failed++;
  } finally {
    // Cleanup
    console.log('\n🧹 Cleaning up test database records...');
    if (creatorUserId) {
      await client.from('calendar_events').delete().eq('creator_id', creatorUserId);
      await client.from('creator_google_tokens').delete().eq('creator_id', creatorUserId);
    }

    console.log(`\nTest Run Finished: ${passed} passed, ${failed} failed.`);
    process.exit(failed > 0 ? 1 : 0);
  }
}

runTest();
