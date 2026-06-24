import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://sfthjyawyxjlbyszjkiu.supabase.co';
const supabaseAnonKey = 'sb_publishable_g77dP1FAhpIg3orcGwOLnw_hN0PeTV0';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function list() {
  const { data, error } = await supabase.from('profiles').select('id, username, display_name, role');
  if (error) {
    console.error('Error fetching profiles:', error);
  } else {
    console.log('Existing profiles in database:', data);
  }
}

list();
