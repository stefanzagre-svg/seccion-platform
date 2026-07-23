import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://sfthjyawyxjlbyszjkiu.supabase.co';
const supabaseAnonKey = 'sb_publishable_g77dP1FAhpIg3orcGwOLnw_hN0PeTV0';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function inspect() {
  console.log('Inspecting platform_content table fields...');
  const { data, error } = await supabase
    .from('platform_content')
    .select('*')
    .limit(1);

  if (error) {
    console.error('Error fetching platform_content:', error);
  } else if (data && data.length > 0) {
    console.log('Columns found in platform_content table:');
    console.log(Object.keys(data[0]));
  } else {
    console.log('No platform_content found in the table. Attempting to get columns via schema query...');
  }
}

inspect();
