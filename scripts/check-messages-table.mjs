import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://sfthjyawyxjlbyszjkiu.supabase.co';
const supabaseAnonKey = 'sb_publishable_g77dP1FAhpIg3orcGwOLnw_hN0PeTV0';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function check() {
  console.log('Checking database table messages...');
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .limit(1);

  if (error) {
    console.error('Error querying messages table:', error.message);
  } else {
    console.log('Successfully queried messages table! Data:', data);
  }
}

check();
