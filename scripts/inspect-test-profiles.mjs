import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://sfthjyawyxjlbyszjkiu.supabase.co';
const supabaseAnonKey = 'sb_publishable_g77dP1FAhpIg3orcGwOLnw_hN0PeTV0';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .in('username', ['test_user_75004', 'test_cal_creator_955877']);

  if (error) {
    console.error('Error fetching profiles:', error);
  } else {
    console.log('Test profiles fetched:', JSON.stringify(data, null, 2));
  }
}

run();
