import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://sfthjyawyxjlbyszjkiu.supabase.co';
const supabaseAnonKey = 'sb_publishable_g77dP1FAhpIg3orcGwOLnw_hN0PeTV0';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function check(userId) {
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('archetype, lifestyle_habits')
    .eq('id', userId)
    .single();

  if (error) {
    console.error(`Error fetching profile for ${userId}:`, error.message);
    return;
  }

  console.log(`Profile for ${userId}:`, profile);
  const archetypeVal = profile?.archetype;
  const lifestyleVal = profile?.lifestyle_habits;
  
  // Let's check if they are considered truthy
  const hasArchetype = !!archetypeVal;
  const hasLifestyle = !!lifestyleVal && (
    typeof lifestyleVal === 'object' && lifestyleVal !== null 
      ? Object.keys(lifestyleVal).length > 0 
      : Array.isArray(lifestyleVal) 
        ? lifestyleVal.length > 0 
        : false
  );

  console.log(`- hasArchetype: ${hasArchetype} (value: ${JSON.stringify(archetypeVal)})`);
  console.log(`- hasLifestyle: ${hasLifestyle} (value: ${JSON.stringify(lifestyleVal)})`);
  
  const onboardingCompletedOld = !!(profile?.archetype && profile?.lifestyle_habits);
  const onboardingCompletedNew = !!(hasArchetype && hasLifestyle);
  
  console.log(`- onboardingCompleted (original logic): ${onboardingCompletedOld}`);
  console.log(`- onboardingCompleted (stricter logic): ${onboardingCompletedNew}`);
}

async function run() {
  // Check the tester_onb_1 profile
  await check('4329620b-6554-4cd5-8300-f5c9ce914429');
}

run();
