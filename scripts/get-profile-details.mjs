import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://sfthjyawyxjlbyszjkiu.supabase.co';
const supabaseAnonKey = 'sb_publishable_g77dP1FAhpIg3orcGwOLnw_hN0PeTV0';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, username, display_name, role, archetype, lifestyle_habits, quest_stage')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Last 5 profiles created:');
    data.slice(0, 8).forEach(p => {
      console.log(`- User: ${p.username} (${p.id})`);
      console.log(`  Role: ${p.role}`);
      console.log(`  Archetype: ${p.archetype}`);
      console.log(`  Lifestyle Habits:`, p.lifestyle_habits);
      console.log(`  Quest Stage: ${p.quest_stage}`);
    });
  }
}

run();
