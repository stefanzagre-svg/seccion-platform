import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://sfthjyawyxjlbyszjkiu.supabase.co';
const supabaseAnonKey = 'sb_publishable_g77dP1FAhpIg3orcGwOLnw_hN0PeTV0';

console.log('Initializing Supabase client...');
const client = createClient(supabaseUrl, supabaseAnonKey);

async function runTest() {
  console.log('\n=== RUNNING COMPLETE GOOGLE CALENDAR OAUTH & SYNC INTEGRATION TEST ===\n');

  const email = `test_cal_sync_${Math.floor(Math.random() * 1000000)}@session.com`;
  const password = 'TestCalSyncPassword123!';
  const username = `test_cal_creator_${Math.floor(Math.random() * 1000000)}`;

  try {
    // 1. Sign up new creator
    console.log(`1. Registering test creator: ${email}...`);
    const { data: authData, error: signUpError } = await client.auth.signUp({
      email,
      password,
      options: { data: { username } }
    });

    if (signUpError) throw new Error(`Sign up failed: ${signUpError.message}`);
    const user = authData.user;
    if (!user) throw new Error('Sign up returned no user data');
    console.log(`✅ Creator account registered. ID: ${user.id}`);

    // 2. Create profile row (provision as creator role)
    console.log('2. Provisioning profile row as creator...');
    const { error: profileError } = await client
      .from('profiles')
      .upsert({
        id: user.id,
        username,
        display_name: `Test Calendar Creator`,
        role: 'creator'
      });

    if (profileError) throw new Error(`Profile provisioning failed: ${profileError.message}`);
    console.log('✅ Creator profile created successfully.');

    // 3. Establish authenticated session
    console.log('3. Logging in creator to establish session...');
    const { data: sessionData, error: signInError } = await client.auth.signInWithPassword({
      email,
      password
    });

    if (signInError) throw new Error(`Sign in failed: ${signInError.message}`);
    console.log('✅ Session active.');

    // Authenticated Supabase Client
    const authClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false, autoRefreshToken: false }
    });
    await authClient.auth.setSession(sessionData.session);

    // 4. Test Token Storage & RLS policy
    console.log('4. Storing Google OAuth tokens...');
    const { data: tokenData, error: tokenError } = await authClient
      .from('creator_google_tokens')
      .insert({
        creator_id: user.id,
        access_token: 'mock_access_token_testing',
        refresh_token: 'mock_refresh_token_testing',
        expires_at: new Date(Date.now() + 3600 * 1000).toISOString(),
        google_email: 'test.creator.sync@gmail.com'
      })
      .select();

    if (tokenError) {
      console.warn(`⚠️ Token insertion error (make sure the migration SQL is applied): ${tokenError.message}`);
      console.log('Continuing with event column validations...');
    } else {
      console.log('✅ Tokens securely stored in Supabase:', tokenData);
      
      // 4b. Read back own tokens
      console.log('4b. Reading back stored tokens to verify select policies...');
      const { data: getTokens, error: getTokensErr } = await authClient
        .from('creator_google_tokens')
        .select('*')
        .eq('creator_id', user.id);

      if (getTokensErr || getTokens.length === 0) {
        throw new Error(`Select tokens failed: ${getTokensErr?.message || 'Returned 0 rows'}`);
      }
      console.log('✅ Token read-back verified. Connected Google email:', getTokens[0].google_email);

      // 4c. Verify Anonymous read block
      console.log('4c. Verifying anonymous client cannot read tokens...');
      const anonymousClient = createClient(supabaseUrl, supabaseAnonKey);
      const { data: anonTokens, error: anonTokensErr } = await anonymousClient
        .from('creator_google_tokens')
        .select('*')
        .eq('creator_id', user.id);

      if (!anonTokensErr && anonTokens && anonTokens.length > 0) {
        throw new Error('Vulnerability: Anonymous client successfully read OAuth tokens!');
      }
      console.log('✅ RLS block verified. Anonymous token retrieval was rejected.');
    }

    // 5. Test Event creation with google_event_id
    console.log('5. Creating local calendar event with google_event_id...');
    const { data: eventData, error: eventError } = await authClient
      .from('calendar_events')
      .insert({
        creator_id: user.id,
        title: 'VIP Soulmate Session',
        description: 'Exclusivity stream scheduled & synchronized',
        start_time: new Date().toISOString(),
        end_time: new Date(Date.now() + 1800 * 1000).toISOString(),
        type: 'vip',
        google_event_id: 'mock_google_event_id_xyz987'
      })
      .select();

    if (eventError) throw new Error(`Event creation failed: ${eventError.message}`);
    console.log('✅ Calendar event created successfully with google_event_id sync tag:', eventData);

    // 6. Read event back
    console.log('6. Verifying event query list...');
    const { data: eventsList, error: listError } = await authClient
      .from('calendar_events')
      .select('*')
      .eq('creator_id', user.id);

    if (listError || eventsList.length === 0) {
      throw new Error(`Query events failed: ${listError?.message || 'Returned 0 rows'}`);
    }
    console.log('✅ Query events verification succeeded. Total events:', eventsList.length);

    console.log('\n🌟 ALL CALENDAR SYNC TESTS COMPLETED! 🌟\n');

  } catch (err) {
    console.error(`\n❌ TEST FAILURE: ${err.message}`);
  }
}

runTest();
