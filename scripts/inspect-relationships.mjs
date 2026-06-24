import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://sfthjyawyxjlbyszjkiu.supabase.co';
const supabaseAnonKey = 'sb_publishable_g77dP1FAhpIg3orcGwOLnw_hN0PeTV0';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function inspect() {
  const { data, error } = await supabase.from('relationships').select('*').limit(10);
  if (error) {
    console.error('Error fetching relationships:', error);
  } else {
    console.log('Relationships sample:', data);
  }
}

inspect();
