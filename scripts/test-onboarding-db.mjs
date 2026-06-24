import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://sfthjyawyxjlbyszjkiu.supabase.co';
const supabaseAnonKey = 'sb_publishable_g77dP1FAhpIg3orcGwOLnw_hN0PeTV0';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function runTest() {
  // Let's create a temporary profile to test updating columns
  const testId = 'test-onboarding-user-' + Math.floor(Math.random() * 100000);
  console.log('Inserting test profile...');
  const { data: insertData, error: insertError } = await supabase
    .from('profiles')
    .insert({
      id: 'c2e5667f-7044-4859-b0ab-72fd72ebd3e3', // Or we can update the existing one if it allows
      username: 'test_user_920538',
      display_name: 'Test Tester',
      role: 'member'
    });

  if (insertError) {
    console.log('Insert error (probably already exists, which is fine):', insertError.message);
  }

  // 1. Try to update archetype
  console.log('Testing update archetype...');
  const { data: updateArchData, error: updateArchError } = await supabase
    .from('profiles')
    .update({ archetype: 'The Dreamer' })
    .eq('id', 'c2e5667f-7044-4859-b0ab-72fd72ebd3e3');

  if (updateArchError) {
    console.error('Update archetype failed:', updateArchError);
  } else {
    console.log('Update archetype succeeded!');
  }

  // 2. Try to update lifestyle_habits with an object
  console.log('Testing update lifestyle_habits with object...');
  const { data: updateHabitsData, error: updateHabitsError } = await supabase
    .from('profiles')
    .update({ lifestyle_habits: { drinking: 'socially', smoking: 'never' } })
    .eq('id', 'c2e5667f-7044-4859-b0ab-72fd72ebd3e3');

  if (updateHabitsError) {
    console.error('Update lifestyle_habits with object failed:', updateHabitsError);
  } else {
    console.log('Update lifestyle_habits with object succeeded!');
  }

  // Fetch the result
  const { data: fetchedData, error: fetchError } = await supabase
    .from('profiles')
    .select('archetype, lifestyle_habits')
    .eq('id', 'c2e5667f-7044-4859-b0ab-72fd72ebd3e3')
    .single();

  console.log('Fetched data:', fetchedData);
}

runTest();
