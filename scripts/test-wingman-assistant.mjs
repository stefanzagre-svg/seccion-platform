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

async function post(path, body, headers = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      ...headers
    },
    body: JSON.stringify(body),
  });
  let data = null;
  try { data = await res.json(); } catch { /**/ }
  return { status: res.status, data };
}

async function runTests() {
  console.log('=== RUNNING AI WINGMAN DATING ASSISTANT LOGIC TESTS ===\n');

  const memberEmail = `wingman_member_${Math.floor(Math.random() * 1000000)}@session.com`;
  const creatorEmail = `wingman_creator_${Math.floor(Math.random() * 1000000)}@session.com`;
  const password = 'TestWingmanPassword123!';
  const memberUsername = `wm_member_${Math.floor(Math.random() * 1000000)}`;
  const creatorUsername = `wm_creator_${Math.floor(Math.random() * 1000000)}`;

  let memberUserId = null;
  let creatorUserId = null;

  try {
    // -------------------------------------------------------------
    // SETUP: Register test member and creator
    // -------------------------------------------------------------
    console.log(`1. Registering test Member user: ${memberEmail}...`);
    const { data: memberAuthData, error: memberSignUpError } = await client.auth.signUp({
      email: memberEmail,
      password,
      options: { data: { username: memberUsername } }
    });
    if (memberSignUpError) throw memberSignUpError;
    memberUserId = memberAuthData.user.id;

    // Log in member to acquire session for RLS bypass updates
    console.log('    Logging in Member to establish session...');
    const { data: memberSessionData, error: memberSignInError } = await client.auth.signInWithPassword({
      email: memberEmail,
      password
    });
    if (memberSignInError) throw memberSignInError;

    const memberAuthClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false, autoRefreshToken: false }
    });
    await memberAuthClient.auth.setSession(memberSessionData.session);

    console.log('2. Provisioning Member profile...');
    const { error: memberProfileError } = await memberAuthClient
      .from('profiles')
      .upsert({
        id: memberUserId,
        username: memberUsername,
        display_name: 'Test Member Wingman',
        role: 'member',
        privacy_settings: { wingman_credits: 5 },
        created_at: new Date().toISOString() // Brand new user (Trial active)
      });
    if (memberProfileError) throw memberProfileError;

    console.log(`\n3. Registering test Creator user: ${creatorEmail}...`);
    const { data: creatorAuthData, error: creatorSignUpError } = await client.auth.signUp({
      email: creatorEmail,
      password,
      options: { data: { username: creatorUsername } }
    });
    if (creatorSignUpError) throw creatorSignUpError;
    creatorUserId = creatorAuthData.user.id;

    console.log('4. Provisioning Creator profile...');
    const { error: creatorProfileError } = await client
      .from('profiles')
      .upsert({
        id: creatorUserId,
        username: creatorUsername,
        display_name: 'Test Creator Wingman',
        role: 'creator'
      });
    if (creatorProfileError) throw creatorProfileError;

    // -------------------------------------------------------------
    // TEST 1: Role Gating (Strictly for members)
    // -------------------------------------------------------------
    console.log('\n━━━ Test 1: Creator access gating (expect 403 Forbidden) ━━━');
    const creatorChatRes = await post('/api/v2/assistant/chat', {
      message: 'Hello Wingman'
    }, {
      'x-dev-user-id': creatorUserId
    });

    assert(creatorChatRes.status === 403, `HTTP status is 403 Forbidden (got ${creatorChatRes.status})`);
    assert(creatorChatRes.data?.error?.includes('Forbidden'), 'Returns correct forbidden error message');

    // -------------------------------------------------------------
    // TEST 2: Free Trial Active (Under 30 days)
    // -------------------------------------------------------------
    console.log('\n━━━ Test 2: Trial Active Chat (expect 200 OK & no credit cost) ━━━');
    const trialRes = await post('/api/v2/assistant/chat', {
      message: 'How do I level up my relationship with Fiona?'
    }, {
      'x-dev-user-id': memberUserId
    });

    assert(trialRes.status === 200, `HTTP status is 200 OK (got ${trialRes.status})`);
    assert(trialRes.data?.isTrial === true, 'Response identifies user is in Trial mode');
    assert(trialRes.data?.trialDaysLeft === 30, `trialDaysLeft matches 30 days (got ${trialRes.data?.trialDaysLeft})`);
    assert(trialRes.data?.credits === 5, `credits remain untouched at 5 (got ${trialRes.data?.credits})`);
    assert(trialRes.data?.reply !== undefined, 'Returns a Wingman recommendation reply');

    // -------------------------------------------------------------
    // TEST 3: Free Trial Expired (Simulating >30 days user)
    // -------------------------------------------------------------
    console.log('\n━━━ Test 3: Trial Expired Chat (expect 200 OK & credit decremented) ━━━');
    
    // Simulate expired trial by sending devCreatedAt in request payload
    const thirtyTwoDaysAgo = new Date();
    thirtyTwoDaysAgo.setDate(thirtyTwoDaysAgo.getDate() - 32);

    const expiredRes = await post('/api/v2/assistant/chat', {
      message: 'Give me match suggestions',
      devCreatedAt: thirtyTwoDaysAgo.toISOString()
    }, {
      'x-dev-user-id': memberUserId
    });
    console.log('    Debug - API Response:', expiredRes.data);

    assert(expiredRes.status === 200, `HTTP status is 200 OK (got ${expiredRes.status})`);
    assert(expiredRes.data?.isTrial === false, 'Response identifies Trial has expired');
    assert(expiredRes.data?.trialDaysLeft === 0, 'trialDaysLeft is 0');
    assert(expiredRes.data?.credits === 4, `credits decremented from 5 to 4 (got ${expiredRes.data?.credits})`);

    // -------------------------------------------------------------
    // TEST 4: Credits Depletion & Gating (deplete credits to 0 and query)
    // -------------------------------------------------------------
    console.log('\n━━━ Test 4: Credit Depletion Block (expect 402 Payment Required) ━━━');
    
    // Update credits to 0 in DB (stored inside privacy_settings JSONB)
    const { error: creditZeroError } = await memberAuthClient
      .from('profiles')
      .update({ privacy_settings: { wingman_credits: 0 } })
      .eq('id', memberUserId);
    if (creditZeroError) throw creditZeroError;

    const blockRes = await post('/api/v2/assistant/chat', {
      message: 'I want to ask another question',
      devCreatedAt: thirtyTwoDaysAgo.toISOString()
    }, {
      'x-dev-user-id': memberUserId
    });

    assert(blockRes.status === 402, `HTTP status is 402 Payment Required (got ${blockRes.status})`);
    assert(blockRes.data?.error === 'credits_exhausted', 'Returns credits_exhausted error code');

    // -------------------------------------------------------------
    // TEST 5: Purchase Credits refuels account (+50 credits)
    // -------------------------------------------------------------
    console.log('\n━━━ Test 5: Purchase Credits (expect 200 OK & credits = 50) ━━━');
    
    const purchaseRes = await post('/api/v2/assistant/purchase-credits', {}, {
      'x-dev-user-id': memberUserId
    });

    assert(purchaseRes.status === 200, `HTTP status is 200 OK (got ${purchaseRes.status})`);
    assert(purchaseRes.data?.success === true, 'Purchase response reports success');
    assert(purchaseRes.data?.newCredits === 50, `newCredits is 50 (got ${purchaseRes.data?.newCredits})`);

    // Verify chat works again after refuel
    console.log('    Verifying Wingman chat works again after credit purchase...');
    const postRefuelRes = await post('/api/v2/assistant/chat', {
      message: 'Hello Wingman, tell me more matches!',
      devCreatedAt: thirtyTwoDaysAgo.toISOString()
    }, {
      'x-dev-user-id': memberUserId
    });

    assert(postRefuelRes.status === 200, `HTTP status is 200 OK (got ${postRefuelRes.status})`);
    assert(postRefuelRes.data?.credits === 49, `credits decremented from 50 to 49 (got ${postRefuelRes.data?.credits})`);

  } catch (err) {
    console.error('❌ Integration Test Exception:', err);
    failed++;
  } finally {
    // -------------------------------------------------------------
    // CLEANUP
    // -------------------------------------------------------------
    console.log('\n6. Cleaning up test users...');
    if (memberUserId) {
      await client.from('profiles').delete().eq('id', memberUserId);
    }
    if (creatorUserId) {
      await client.from('profiles').delete().eq('id', creatorUserId);
    }
    console.log('   ✅ Cleanup complete.');
  }

  console.log('\n================================================');
  console.log(`Results: ${passed} passed / ${failed} failed / ${passed + failed} total`);
  if (failed === 0) {
    console.log('🎉 AI Wingman Dating Assistant Logic is 100% Operational & Verified!');
  } else {
    console.error('⚠️ Verification Failed.');
  }
  console.log('================================================');
}

runTests().catch(console.error);
