import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://sfthjyawyxjlbyszjkiu.supabase.co';
const supabaseAnonKey = 'sb_publishable_g77dP1FAhpIg3orcGwOLnw_hN0PeTV0';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const tables = [
  'feed_ab_clicks',
  'feed_ab_impressions',
  'suggestion_caches',
  'ratings',
  'creator_goals',
  'goal_contributions',
  'calendar_events',
  'live_streams',
  'messages'
];

async function verifyAll() {
  console.log('=== VERIFYING DATABASE TABLES ===\n');

  for (const table of tables) {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .limit(1);

    if (error) {
      console.log(`❌ Table "${table}": Query failed! Error: ${error.message}`);
    } else {
      console.log(`✅ Table "${table}": Successfully queried! (Row count: ${data.length})`);
    }
  }

  // Also check if profiles table has the ab_group column
  console.log('\n=== VERIFYING PROFILES COLUMN ===');
  const { data: profile, error: profileErr } = await supabase
    .from('profiles')
    .select('ab_group')
    .limit(1);

  if (profileErr) {
    console.log(`❌ Profiles column check: Failed! Error: ${profileErr.message}`);
  } else {
    console.log(`✅ Profiles column check: "ab_group" exists and is queryable!`);
  }
}

verifyAll();
