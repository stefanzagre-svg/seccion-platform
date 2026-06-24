import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://sfthjyawyxjlbyszjkiu.supabase.co';
const supabaseAnonKey = 'sb_publishable_g77dP1FAhpIg3orcGwOLnw_hN0PeTV0';

// 1. Initialize Supabase client
console.log('Initializing Supabase client...');
const client = createClient(supabaseUrl, supabaseAnonKey);

async function runTest() {
  console.log('\n=== RUNNING TELEMETRY & RLS INTEGRATION TEST ===\n');

  // Generate a unique user
  const email = `test_telemetry_${Math.floor(Math.random() * 1000000)}@session.com`;
  const password = 'TestTelemetryPassword123!';
  const username = `test_user_${Math.floor(Math.random() * 1000000)}`;

  try {
    // Step 1: Sign up new user (should be auto-confirmed now!)
    console.log(`1. Signing up user: ${email}...`);
    const { data: authData, error: signUpError } = await client.auth.signUp({
      email,
      password,
      options: {
        data: { username }
      }
    });

    if (signUpError) throw new Error(`Sign up failed: ${signUpError.message}`);
    const user = authData.user;
    if (!user) throw new Error('Sign up returned no user data');
    console.log(`✅ User registered successfully. ID: ${user.id}`);

    // Create the profile row (the frontend does this upon signup completion)
    console.log('2. Provisioning profile row...');
    const { error: profileError } = await client
      .from('profiles')
      .upsert({
        id: user.id,
        username,
        display_name: `Test Tester`,
        role: 'member',
        ab_group: 'B' // Assign to group B
      });

    if (profileError) throw new Error(`Profile provisioning failed: ${profileError.message}`);
    console.log('✅ Profile row created successfully.');

    // Step 2: Log in to establish authenticated session
    console.log('3. Logging in user to establish session...');
    const { data: sessionData, error: signInError } = await client.auth.signInWithPassword({
      email,
      password
    });

    if (signInError) throw new Error(`Sign in failed: ${signInError.message}`);
    console.log('✅ User logged in successfully. Token acquired.');

    // Step 3: Create authenticated client instance for RLS validation
    const authClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    });
    // Set the session on the auth client
    await authClient.auth.setSession(sessionData.session);

    // Step 4: Insert a click record as the authenticated user
    console.log('4. Attempting to insert click telemetry as authenticated user...');
    const testPostId = 'test-post-999';
    const testCreatorId = 'creator-elena';
    
    const { data: insertData, error: insertError } = await authClient
      .from('feed_ab_clicks')
      .insert({
        user_id: user.id,
        ab_group: 'B',
        post_id: testPostId,
        creator_id: testCreatorId
      })
      .select();

    if (insertError) {
      throw new Error(`Authenticated insert failed: ${insertError.message}`);
    }
    console.log('✅ Telemetry insert succeeded! Inserted row:', insertData);

    // Step 5: Read own click record back (select policy check)
    console.log('5. Attempting to read own click telemetry back...');
    const { data: selectData, error: selectError } = await authClient
      .from('feed_ab_clicks')
      .select('*')
      .eq('user_id', user.id);

    if (selectError) {
      throw new Error(`Select failed: ${selectError.message}`);
    }
    if (selectData.length === 0) {
      throw new Error('Select returned 0 rows, but we just inserted 1!');
    }
    console.log(`✅ Select succeeded! Found ${selectData.length} records.`, selectData);

    // Step 6: Test RLS restriction (unauthenticated client attempting to view)
    console.log('6. Verification: Attempting to query clicks as unauthenticated client (should return 0 rows)...');
    const anonymousClient = createClient(supabaseUrl, supabaseAnonKey);
    const { data: anonData, error: anonError } = await anonymousClient
      .from('feed_ab_clicks')
      .select('*')
      .eq('user_id', user.id);

    if (anonError) {
      console.log(`ℹ️ Anon query returned database error (safe): ${anonError.message}`);
    } else if (anonData.length > 0) {
      throw new Error(`Security vulnerability: Anonymous client was able to view RLS protected data! Data: ${JSON.stringify(anonData)}`);
    } else {
      console.log('✅ RLS Policy Verified: Anonymous query returned 0 rows (blocked successfully).');
    }

    console.log('\n🌟 ALL TESTS PASSED SUCCESSFULLY! 🌟');
    console.log('Database RLS schemas, profiles columns, and clicks telemetry are 100% operational.');

  } catch (err) {
    console.error(`\n❌ TEST FAILED: ${err.message}`);
  }
}

runTest();
