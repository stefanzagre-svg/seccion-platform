import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// 1. Parse .env.local for Supabase Credentials
const envPath = path.resolve(process.cwd(), '.env.local');
let supabaseUrl = '';
let serviceRoleKey = '';

try {
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    const envLines = envContent.split('\n');
    for (const line of envLines) {
      if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) {
        supabaseUrl = line.split('=')[1].trim();
      }
      if (line.startsWith('SUPABASE_SERVICE_ROLE_KEY=')) {
        serviceRoleKey = line.split('=')[1].trim();
      }
    }
  }
} catch (err) {
  console.error('⚠️ Could not load .env.local file.', err.message);
}

if (!serviceRoleKey) {
  console.log('\n========================================================================');
  console.log('⚠️  SUPABASE_SERVICE_ROLE_KEY is not set in your web/.env.local file.');
  console.log('👉 To run these automated RLS tests, please set it.');
  console.log('========================================================================\n');
  process.exit(0);
}

supabaseUrl = supabaseUrl || 'https://sfthjyawyxjlbyszjkiu.supabase.co';

// Create Supabase Admin client
const supabase = createClient(supabaseUrl, serviceRoleKey);

async function runTests() {
  console.log('🧪 Starting KYC Enforcement DB Trigger Test Suite\n');

  let KYC_USER_ID = '';
  let NON_KYC_USER_ID = '';
  let TARGET_USER_ID = '';

  try {
    // 1. Query existing seeded profiles (seeded by seed-test-profiles.mjs)
    console.log('🔍 Fetching existing test profiles (hf1_rebel, hf2_seeker, hm1_provider)...');
    const { data: profiles, error: fetchErr } = await supabase
      .from('profiles')
      .select('id, username')
      .in('username', ['hf1_rebel', 'hf2_seeker', 'hm1_provider']);

    if (fetchErr) throw fetchErr;
    if (!profiles || profiles.length < 3) {
      throw new Error(
        'Could not find test profiles (hf1_rebel, hf2_seeker, hm1_provider) in profiles table.\n' +
        '👉 Please run the seeder script first: node scripts/seed-test-profiles.mjs'
      );
    }

    const kycUser = profiles.find(p => p.username === 'hf1_rebel');
    const nonKycUser = profiles.find(p => p.username === 'hf2_seeker');
    const targetUser = profiles.find(p => p.username === 'hm1_provider');

    KYC_USER_ID = kycUser.id;
    NON_KYC_USER_ID = nonKycUser.id;
    TARGET_USER_ID = targetUser.id;

    console.log(`📌 Test Users Identified:`);
    console.log(`   - Verified User (hf1_rebel): ${KYC_USER_ID}`);
    console.log(`   - Unverified User (hf2_seeker): ${NON_KYC_USER_ID}`);
    console.log(`   - Target User (hm1_provider): ${TARGET_USER_ID}\n`);

    // 2. Clean up previous test messages
    console.log('🧹 Cleaning up old test messages...');
    await supabase.from('messages').delete().in('sender_id', [KYC_USER_ID, NON_KYC_USER_ID]);

    // 3. Ensure test state (verified vs unverified) in DB profiles
    console.log('⚙️ Configuring KYC flags in profiles...');
    await supabase.from('profiles').update({ is_kyc_verified: true }).eq('id', KYC_USER_ID);
    await supabase.from('profiles').update({ is_kyc_verified: false }).eq('id', NON_KYC_USER_ID);

    // 4. Test Cases
    console.log('\n--- Running Test Cases ---\n');

    // Test 1: Non-KYC User sends a low-level move (e.g. 'poke', kyc_required=false)
    console.log('🧪 Test 1: Unverified User sends low-level move (Should Pass)');
    const { error: test1Error } = await supabase.from('messages').insert([{
      sender_id: NON_KYC_USER_ID,
      receiver_id: TARGET_USER_ID,
      text: 'Sent you a poke!',
      is_suggestion: true,
      suggestion_move_id: 'poke'
    }]);

    if (test1Error) {
      console.error('❌ Test 1 Failed:', test1Error.message);
    } else {
      console.log('✅ Test 1 Passed');
    }

    // Test 2: Non-KYC User sends a high-level move (e.g. 'coffee', kyc_required=true)
    console.log('🧪 Test 2: Unverified User sends high-level move (Should Fail)');
    const { error: test2Error } = await supabase.from('messages').insert([{
      sender_id: NON_KYC_USER_ID,
      receiver_id: TARGET_USER_ID,
      text: 'Coffee Date suggestion',
      is_suggestion: true,
      suggestion_move_id: 'coffee'
    }]);

    if (test2Error && test2Error.message.includes('KYC verification is required')) {
      console.log('✅ Test 2 Passed (Caught expected exception)');
    } else if (test2Error) {
      console.error('❌ Test 2 Failed with unexpected error:', test2Error.message);
    } else {
      console.error('❌ Test 2 Failed: Insert was allowed when it should have been blocked');
    }

    // Test 3: KYC Verified User sends a high-level move (e.g. 'coffee', kyc_required=true)
    console.log('🧪 Test 3: KYC Verified User sends high-level move (Should Pass)');
    const { error: test3Error } = await supabase.from('messages').insert([{
      sender_id: KYC_USER_ID,
      receiver_id: TARGET_USER_ID,
      text: 'Coffee Date suggestion',
      is_suggestion: true,
      suggestion_move_id: 'coffee'
    }]);

    if (test3Error) {
      console.error('❌ Test 3 Failed:', test3Error.message);
    } else {
      console.log('✅ Test 3 Passed');
    }

  } catch (err) {
    console.error('\n❌ Test Suite Failed:', err.message);
  } finally {
    if (KYC_USER_ID && NON_KYC_USER_ID) {
      console.log('\n🧹 Cleaning up test messages...');
      await supabase.from('messages').delete().in('sender_id', [KYC_USER_ID, NON_KYC_USER_ID]);
      // Restore non-verified state for hf2_seeker
      await supabase.from('profiles').update({ is_kyc_verified: false }).eq('id', NON_KYC_USER_ID);
    }
    console.log('✨ Done.');
  }
}

runTests();
