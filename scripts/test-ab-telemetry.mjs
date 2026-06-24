import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://sfthjyawyxjlbyszjkiu.supabase.co';
const supabaseAnonKey = 'sb_publishable_g77dP1FAhpIg3orcGwOLnw_hN0PeTV0';

// Initialize Supabase client
console.log('Initializing Supabase client...');
const client = createClient(supabaseUrl, supabaseAnonKey);

async function runTest() {
  console.log('\n=== RUNNING COMPLETE A/B TELEMETRY & RLS INTEGRATION TEST ===\n');

  // Generate unique credentials
  const email = `test_ab_telemetry_${Math.floor(Math.random() * 1000000)}@session.com`;
  const password = 'TestABTelemetryPassword123!';
  const username = `test_ab_user_${Math.floor(Math.random() * 1000000)}`;

  try {
    // 1. Sign up new user
    console.log(`1. Signing up user: ${email}...`);
    const { data: authData, error: signUpError } = await client.auth.signUp({
      email,
      password,
      options: { data: { username } }
    });

    if (signUpError) throw new Error(`Sign up failed: ${signUpError.message}`);
    const user = authData.user;
    if (!user) throw new Error('Sign up returned no user data');
    console.log(`✅ User registered successfully. ID: ${user.id}`);

    // 2. Create profile row
    console.log('2. Provisioning profile row...');
    const { error: profileError } = await client
      .from('profiles')
      .upsert({
        id: user.id,
        username,
        display_name: `Test A/B User`,
        role: 'member',
        ab_group: 'A' // Assign to group A
      });

    if (profileError) throw new Error(`Profile provisioning failed: ${profileError.message}`);
    console.log('✅ Profile row created successfully.');

    // 3. Log in to establish authenticated session
    console.log('3. Logging in user to establish session...');
    const { data: sessionData, error: signInError } = await client.auth.signInWithPassword({
      email,
      password
    });

    if (signInError) throw new Error(`Sign in failed: ${signInError.message}`);
    console.log('✅ User logged in successfully.');

    // Create authenticated client
    const authClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false, autoRefreshToken: false }
    });
    await authClient.auth.setSession(sessionData.session);

    // 4. Insert telemetry as authenticated user
    console.log('4. Inserting click & impression telemetry...');
    const testPostId = 'post-ethereal-001';
    const testCreatorId = 'creator-elena';

    // Insert Impression
    const { data: impData, error: impError } = await authClient
      .from('feed_ab_impressions')
      .insert({
        user_id: user.id,
        ab_group: 'A',
        post_id: testPostId,
        creator_id: testCreatorId
      })
      .select();

    if (impError) throw new Error(`Impression insert failed: ${impError.message}`);
    console.log('✅ Impression insert succeeded:', impData);

    // Insert Click
    const { data: clickData, error: clickError } = await authClient
      .from('feed_ab_clicks')
      .insert({
        user_id: user.id,
        ab_group: 'A',
        post_id: testPostId,
        creator_id: testCreatorId
      })
      .select();

    if (clickError) throw new Error(`Click insert failed: ${clickError.message}`);
    console.log('✅ Click insert succeeded:', clickData);

    // 5. Read own records back
    console.log('5. Verifying user can select own telemetry...');
    const { data: getImp, error: getImpErr } = await authClient
      .from('feed_ab_impressions')
      .select('*')
      .eq('user_id', user.id);

    if (getImpErr || getImp.length === 0) {
      throw new Error(`Select impressions failed: ${getImpErr?.message || 'Returned 0 rows'}`);
    }

    const { data: getClick, error: getClickErr } = await authClient
      .from('feed_ab_clicks')
      .select('*')
      .eq('user_id', user.id);

    if (getClickErr || getClick.length === 0) {
      throw new Error(`Select clicks failed: ${getClickErr?.message || 'Returned 0 rows'}`);
    }
    console.log('✅ Telemetry read-back verified successfully.');

    // 6. Test RLS block on anonymous client
    console.log('6. Verifying anonymous client is blocked by RLS...');
    const anonymousClient = createClient(supabaseUrl, supabaseAnonKey);
    
    const { data: anonImp, error: anonImpErr } = await anonymousClient
      .from('feed_ab_impressions')
      .select('*')
      .eq('user_id', user.id);

    if (!anonImpErr && anonImp && anonImp.length > 0) {
      throw new Error('Vulnerability: Anonymous client read impressions data!');
    }

    const { data: anonClick, error: anonClickErr } = await anonymousClient
      .from('feed_ab_clicks')
      .select('*')
      .eq('user_id', user.id);

    if (!anonClickErr && anonClick && anonClick.length > 0) {
      throw new Error('Vulnerability: Anonymous client read clicks data!');
    }
    console.log('✅ RLS verification passed. Anonymous queries blocked.');

    console.log('\n🌟 ALL A/B TELEMETRY TESTS PASSED SUCCESSFULLY! 🌟\n');

  } catch (err) {
    console.error(`\n❌ TEST FAILED: ${err.message}`);
  }
}

runTest();
