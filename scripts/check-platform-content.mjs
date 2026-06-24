import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://sfthjyawyxjlbyszjkiu.supabase.co';
const supabaseAnonKey = 'sb_publishable_g77dP1FAhpIg3orcGwOLnw_hN0PeTV0';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function inspect() {
  const { data, error } = await supabase.from('platform_content').select('*').limit(1);
  if (error) {
    console.error('Error fetching platform_content:', error);
  } else if (data && data.length > 0) {
    console.log('platform_content columns:', Object.keys(data[0]));
    console.log('platform_content sample data:', data[0]);
  } else {
    console.log('No platform_content found in table or query returned empty.');
    // Let's see if we can get table description or schema info
    const { data: listData, error: listError } = await supabase.from('platform_content').select('*');
    if (listError) {
      console.error('List error:', listError);
    } else {
      console.log('platform_content count:', listData?.length);
      if (listData && listData.length > 0) {
        console.log('platform_content columns:', Object.keys(listData[0]));
      }
    }
  }
}

inspect();
