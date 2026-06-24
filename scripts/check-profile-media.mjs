import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://sfthjyawyxjlbyszjkiu.supabase.co';
const supabaseAnonKey = 'sb_publishable_g77dP1FAhpIg3orcGwOLnw_hN0PeTV0';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkTable() {
  const { data, error } = await supabase
    .from('profile_media')
    .select('*')
    .limit(1);

  if (error) {
    console.log(`❌ Table "profile_media": Query failed! Error: ${error.message}`);
  } else {
    console.log(`✅ Table "profile_media": Successfully queried! (Row count: ${data.length})`);
  }
}

checkTable();
