import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://sfthjyawyxjlbyszjkiu.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_g77dP1FAhpIg3orcGwOLnw_hN0PeTV0';

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
  console.log('=== RUNNING LIVE TRANSLATION & MONETIZATION FRAMEWORK TESTS ===\n');

  const memberEmail = `test_member_${Math.floor(Math.random() * 1000000)}@session.com`;
  const creatorEmail = `test_creator_${Math.floor(Math.random() * 1000000)}@session.com`;
  const password = 'TestTranslationPassword123!';
  const memberUsername = `member_${Math.floor(Math.random() * 1000000)}`;
  const creatorUsername = `creator_${Math.floor(Math.random() * 1000000)}`;

  let memberUserId = null;
  let creatorUserId = null;

  try {
    // -------------------------------------------------------------
    // SETUP: Register and login test member
    // -------------------------------------------------------------
    console.log(`1. Registering test Member user: ${memberEmail}...`);
    const { data: memberAuthData, error: memberSignUpError } = await client.auth.signUp({
      email: memberEmail,
      password,
      options: { data: { username: memberUsername } }
    });
    if (memberSignUpError) throw memberSignUpError;
    memberUserId = memberAuthData.user.id;
    console.log(`   Registered Member user ID: ${memberUserId}`);

    console.log('2. Provisioning Member profile row...');
    const { error: memberProfileError } = await client
      .from('profiles')
      .upsert({
        id: memberUserId,
        username: memberUsername,
        display_name: 'Test Member',
        role: 'member',
        favorite_languages: ['es']
      });
    if (memberProfileError) {
      console.warn('   ⚠️ Member Profile Upsert warning:', memberProfileError.message);
    } else {
      console.log('   ✅ Member profile created.');
    }

    // -------------------------------------------------------------
    // SETUP: Register and login test creator
    // -------------------------------------------------------------
    console.log(`\n3. Registering test Creator user: ${creatorEmail}...`);
    const { data: creatorAuthData, error: creatorSignUpError } = await client.auth.signUp({
      email: creatorEmail,
      password,
      options: { data: { username: creatorUsername } }
    });
    if (creatorSignUpError) throw creatorSignUpError;
    creatorUserId = creatorAuthData.user.id;
    console.log(`   Registered Creator user ID: ${creatorUserId}`);

    console.log('4. Provisioning Creator profile row...');
    const { error: creatorProfileError } = await client
      .from('profiles')
      .upsert({
        id: creatorUserId,
        username: creatorUsername,
        display_name: 'Test Creator',
        role: 'creator',
        favorite_languages: ['en']
      });
    if (creatorProfileError) {
      console.warn('   ⚠️ Creator Profile Upsert warning:', creatorProfileError.message);
    } else {
      console.log('   ✅ Creator profile created.');
    }

    // -------------------------------------------------------------
    // TEST 1: Free Text-to-Text Translation
    // -------------------------------------------------------------
    console.log('\n━━━ Test 1: Free Text-to-Text Translation ━━━');
    const textRes = await post('/api/v2/translate-text', {
      text: 'hello',
      targetLanguage: 'es'
    }, {
      'x-dev-user-id': memberUserId
    });

    assert(textRes.status === 200, `HTTP 200 OK (got ${textRes.status})`);
    assert(textRes.data?.translatedText !== undefined, 'Response contains translatedText');
    assert(
      textRes.data?.translatedText?.toLowerCase() === 'hola' || 
      textRes.data?.translatedText?.toLowerCase().includes('hola'),
      `Correct translation returned (got "${textRes.data?.translatedText}")`
    );
    console.log(`   Result: "${textRes.data?.translatedText}" using engine "${textRes.data?.engine}"`);

    // -------------------------------------------------------------
    // TEST 2: Member S2ST Daily Free Quota (under 5 mins)
    // -------------------------------------------------------------
    console.log('\n━━━ Test 2: Member Speech-to-Speech Token (under 5-min free limit) ━━━');
    const speechRes1 = await post('/api/v2/translate-speech/token', {
      preAuthCardHoldActive: false,
      devSpeechSecondsUsed: 0
    }, {
      'x-dev-user-id': memberUserId
    });

    assert(speechRes1.status === 200, `HTTP 200 OK (got ${speechRes1.status})`);
    assert(speechRes1.data?.success === true, 'Response indicates success');
    assert(speechRes1.data?.token !== undefined, 'Returns valid translation session token');
    assert(speechRes1.data?.freeSecondsRemaining > 0, `Has free seconds remaining (got ${speechRes1.data?.freeSecondsRemaining}s)`);
    assert(speechRes1.data?.overageActive === false, 'Overage is not active');
    console.log(`   Generated Token: "${speechRes1.data?.token}"`);

    // -------------------------------------------------------------
    // TEST 3: Member S2ST Daily Quota Exceeded (over 5 mins, no hold)
    // -------------------------------------------------------------
    console.log('\n━━━ Test 3: Member Quota Exceeded Block (no card hold, expect 402) ━━━');
    const speechRes2 = await post('/api/v2/translate-speech/token', {
      preAuthCardHoldActive: false,
      devSpeechSecondsUsed: 300 // simulate quota exceeded (5 min)
    }, {
      'x-dev-user-id': memberUserId
    });

    assert(speechRes2.status === 402, `HTTP 402 Payment Required (got ${speechRes2.status})`);
    assert(speechRes2.data?.code === 'QUOTA_EXCEEDED', 'Returns code QUOTA_EXCEEDED');
    assert(speechRes2.data?.message?.includes('Stripe card hold'), 'Prompts user to authorize Stripe card hold');

    // -------------------------------------------------------------
    // TEST 4: Member S2ST Quota Exceeded with Card Hold Active
    // -------------------------------------------------------------
    console.log('\n━━━ Test 4: Member Quota Exceeded with Stripe Card Hold Active (expect 200) ━━━');
    const speechRes3 = await post('/api/v2/translate-speech/token', {
      preAuthCardHoldActive: true,
      devSpeechSecondsUsed: 300 // quota exceeded but pre-authorized card hold is active
    }, {
      'x-dev-user-id': memberUserId
    });

    assert(speechRes3.status === 200, `HTTP 200 OK (got ${speechRes3.status})`);
    assert(speechRes3.data?.success === true, 'Response indicates success');
    assert(speechRes3.data?.token !== undefined, 'Returns valid translation session token');
    assert(speechRes3.data?.overageActive === true, 'Overage is marked as active');
    console.log(`   Generated Overage Token: "${speechRes3.data?.token}"`);

    // -------------------------------------------------------------
    // TEST 5: Creator S2ST Token without subscription/promo (expect 402)
    // -------------------------------------------------------------
    console.log('\n━━━ Test 5: Creator Speech-to-Speech (No subscription/promo, expect 402) ━━━');
    const creatorRes1 = await post('/api/v2/translate-speech/token', {
      devCreatorUltimatePack: false
    }, {
      'x-dev-user-id': creatorUserId
    });

    assert(creatorRes1.status === 402, `HTTP 402 Payment Required (got ${creatorRes1.status})`);
    assert(creatorRes1.data?.code === 'SUBSCRIPTION_REQUIRED', 'Returns code SUBSCRIPTION_REQUIRED');
    assert(creatorRes1.data?.message?.includes('Creator Ultimate Pack'), 'Prompts creator to subscribe to Ultimate Pack');

    // -------------------------------------------------------------
    // TEST 6: Creator applies for 1-Year verified promo
    // -------------------------------------------------------------
    console.log('\n━━━ Test 6: Creator applies for 1-Year Verified Promo (expect 200) ━━━');
    const promoRes = await post('/api/v2/creator/promo-apply', {
      externalCreatorLink: 'https://onlyfans.com/top_creator_profile_999'
    }, {
      'x-dev-user-id': creatorUserId
    });

    assert(promoRes.status === 200, `HTTP 200 OK (got ${promoRes.status})`);
    assert(promoRes.data?.success === true, 'Promo application successfully submitted');
    assert(promoRes.data?.promoStatus === 'pending', 'Promo status is pending review');

    // -------------------------------------------------------------
    // TEST 7: Creator S2ST Token with Approved Promo
    // -------------------------------------------------------------
    console.log('\n━━━ Test 7: Creator Speech-to-Speech with Approved Promo (expect 200) ━━━');
    const creatorRes2 = await post('/api/v2/translate-speech/token', {
      devCreatorUltimatePack: true // Simulates approved Creator Ultimate Pack
    }, {
      'x-dev-user-id': creatorUserId
    });

    assert(creatorRes2.status === 200, `HTTP 200 OK (got ${creatorRes2.status})`);
    assert(creatorRes2.data?.success === true, 'Response indicates success');
    assert(creatorRes2.data?.token !== undefined, 'Returns valid translation session token');
    assert(creatorRes2.data?.role === 'creator', 'Correctly identified as creator role');
    console.log(`   Generated Token: "${creatorRes2.data?.token}"`);

    // -------------------------------------------------------------
    // CLEANUP
    // -------------------------------------------------------------
    console.log('\n8. Cleaning up test users...');
    if (memberUserId) {
      try {
        await client.from('translation_quotas').delete().eq('profile_id', memberUserId);
      } catch (err) {}
      await client.from('profiles').delete().eq('id', memberUserId);
    }
    if (creatorUserId) {
      await client.from('profiles').delete().eq('id', creatorUserId);
    }
    console.log('   ✅ Cleanup complete.');

  } catch (err) {
    console.error(`\n❌ TEST FAILURE: ${err.message}`);
    failed++;
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`Results: ${passed} passed / ${failed} failed / ${passed + failed} total`);
  if (failed === 0) {
    console.log('🎉 All tests passed successfully!');
  } else {
    console.log('⚠️ Some tests failed. Please review the output above.');
    process.exitCode = 1;
  }
}

runTests().catch(err => {
  console.error('Fatal test runner error:', err);
  process.exitCode = 1;
});
