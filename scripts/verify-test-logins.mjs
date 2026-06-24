import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://sfthjyawyxjlbyszjkiu.supabase.co';
const supabaseAnonKey = 'sb_publishable_g77dP1FAhpIg3orcGwOLnw_hN0PeTV0';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const TEST_PASSWORD = 'TestPass123!';

const testEmails = [
  'hf1@session-test.com',
  'hf2@session-test.com',
  'hf3@session-test.com',
  'hm1@session-test.com',
  'hm2@session-test.com',
  'af1@session-test.com',
  'af2@session-test.com',
  'af3@session-test.com',
  'am1@session-test.com',
  'am2@session-test.com',
  'am3@session-test.com',
];

async function verifyLogins() {
  console.log('🔐 VERIFYING AUTH LOGINS FOR ALL 11 TEST PROFILES...\n');
  let successCount = 0;

  for (const email of testEmails) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: TEST_PASSWORD,
    });

    if (error) {
      console.error(`  ✗ Login FAILED for ${email}:`, error.message);
    } else {
      console.log(`  ✓ Login SUCCESS for ${email} (ID: ${data.user?.id})`);
      successCount++;
    }
  }

  console.log('\n=============================================');
  if (successCount === testEmails.length) {
    console.log('✅ ALL 11 TEST ACCOUNTS ARE SUCCESSFULLY VERIFIED AND READY TO LOG IN!');
  } else {
    console.log(`⚠️ VERIFICATION COMPLETE: ${successCount}/${testEmails.length} accounts verified.`);
  }
  console.log('=============================================');
}

verifyLogins().catch(console.error);
