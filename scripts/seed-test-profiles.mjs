/**
 * SESSION — Functional Acceptance Test: Profile Seeder
 * 
 * Creates 11 test accounts in Supabase:
 *   - 5 Human Tester profiles (Hf1, Hf2, Hf3, Hm1, Hm2)
 *   - 6 AI Background Agent profiles (Af1, Af2, Af3, Am1, Am2, Am3)
 * 
 * All accounts use password: TestPass123!
 * All emails are @session-test.com for easy identification.
 * 
 * Usage:
 *   node scripts/seed-test-profiles.mjs
 * 
 * Prerequisite:
 *   - Supabase "Confirm Email" must be DISABLED
 *   - Run from the web/ directory
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://sfthjyawyxjlbyszjkiu.supabase.co';
const supabaseAnonKey = 'sb_publishable_g77dP1FAhpIg3orcGwOLnw_hN0PeTV0';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const TEST_PASSWORD = 'TestPass123!';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ─── Human Test Profiles ─────────────────────────────────────────────────────

const HUMAN_PROFILES = [
  {
    email: 'hf1@session-test.com',
    username: 'hf1_rebel',
    display_name: 'Hannah F. (Rebel)',
    gender: 'female',
    role: 'creator', // Starts as creator, will test role switch to member
    archetype: 'rebel',
    connection_points: 500,
    quest_stage: 3,
    bio: 'Live fast, create fearlessly. I write my own rules and expect the same from you.',
    hobbies: ['Art', 'Photography', 'Music', 'Dancing'],
    sexual_preference: 'Straight',
    relationship_goals: ['Not limit myself'],
    relationship_types: ['Open to Explore'],
    lifestyle_habits: { 'adventure seek': 'High Adrenaline', partying: 'Often', traveling: 'Every Week', smoking: 'Non-Smoker', drinking: 'Socially' },
    moods: ['flirty_playful', 'high_energy', 'creative_showcase'],
    core_passion: 'art',
    avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&q=80',
    is_kyc_verified: true,
    posts: [
      { tier: 'none', title: 'Neon Nights — Street Art', description: 'Midnight graffiti session in Berlin 🎨', media_url: 'https://images.unsplash.com/photo-1561059488-916d69792237?w=800&q=80', media_type: 'image' },
      { tier: 'vip', title: 'Behind the Lens', description: 'VIP exclusive: raw photo series from my latest rooftop shoot.', media_url: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&q=80', media_type: 'image' },
    ],
  },
  {
    email: 'hf2@session-test.com',
    username: 'hf2_seeker',
    display_name: 'Fiona S. (Seeker)',
    gender: 'female',
    role: 'member',
    archetype: 'explorer',
    connection_points: 200,
    quest_stage: 2,
    bio: 'Just arrived. Curious about everything — show me what this place is about.',
    hobbies: ['Traveling', 'Reading', 'Yoga', 'Cooking'],
    sexual_preference: 'Straight',
    relationship_goals: ['Long term partner'],
    relationship_types: ['Monogamous'],
    lifestyle_habits: { traveling: 'Monthly', reading: 'Daily', workout: 'Sometimes', smoking: 'Non-Smoker', drinking: 'Never' },
    moods: ['deep_intimate', 'dinner_date', 'travel_trip'],
    core_passion: 'travel',
    avatar_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=600&q=80',
    is_kyc_verified: false,
    posts: [],
  },
  {
    email: 'hf3@session-test.com',
    username: 'hf3_dreamer',
    display_name: 'Clara D. (Dreamer)',
    gender: 'female',
    role: 'member',
    archetype: 'dreamer',
    connection_points: 500,
    quest_stage: 3,
    bio: 'Poet, thinker, stargazer. I believe in connections that transcend the ordinary.',
    hobbies: ['Art', 'Reading', 'Music', 'Photography'],
    sexual_preference: 'Bisexual',
    relationship_goals: ['Long term not against Short term Crush'],
    relationship_types: ['Open to Explore'],
    lifestyle_habits: { 'creative flow': 'Every Day', reading: 'Daily', 'morning/night': 'Night Owl', smoking: 'Non-Smoker', drinking: 'Socially' },
    moods: ['deep_intimate', 'creative_showcase', 'exclusive_vip'],
    core_passion: 'art',
    avatar_url: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=600&q=80',
    is_kyc_verified: false,
    posts: [],
  },
  {
    email: 'hm1@session-test.com',
    username: 'hm1_provider',
    display_name: 'Marcus P. (Provider)',
    gender: 'male',
    role: 'member',
    archetype: 'protector',
    connection_points: 200,
    quest_stage: 2,
    bio: 'I invest in what matters — relationships, health, and experiences. Loyal to the core.',
    hobbies: ['Fitness', 'Cooking', 'Cars', 'Tech'],
    sexual_preference: 'Straight',
    relationship_goals: ['Long term partner'],
    relationship_types: ['Monogamous'],
    lifestyle_habits: { workout: 'Every Day', 'healthy eating': 'Most Days', sleep: '8+ Hours', smoking: 'Non-Smoker', drinking: 'Socially' },
    moods: ['dinner_date', 'workout_mate', 'deep_intimate'],
    core_passion: 'fitness',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80',
    is_kyc_verified: false,
    posts: [],
  },
  {
    email: 'hm2@session-test.com',
    username: 'hm2_stable',
    display_name: 'Nathan C. (Stable)',
    gender: 'male',
    role: 'member',
    archetype: 'caregiver',
    connection_points: 50,
    quest_stage: 1, // Cold start — hasn't completed onboarding
    bio: 'New here. Just downloaded the app. Let us see what happens.',
    hobbies: ['Gaming', 'Music', 'Tech'],
    sexual_preference: 'Straight',
    relationship_goals: ["Let's figure after a date."],
    relationship_types: ['Not sure yet'],
    lifestyle_habits: { socializing: 'Sometimes', 'morning/night': 'Night Owl', smoking: 'Non-Smoker', drinking: 'Socially' },
    moods: ['grab_drink', 'party_dance'],
    core_passion: 'music',
    avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&q=80',
    is_kyc_verified: false,
    posts: [],
  },
];

// ─── AI Background Agent Profiles ────────────────────────────────────────────

const AI_AGENT_PROFILES = [
  {
    email: 'af1@session-test.com',
    username: 'ai_valentina',
    display_name: 'Valentina (AI Creator)',
    gender: 'female',
    role: 'creator',
    archetype: 'dreamer',
    connection_points: 300,
    quest_stage: 3,
    bio: '[AI Agent] Visual artist and photographer. Creates content periodically.',
    hobbies: ['Art', 'Photography', 'Music', 'Travel'],
    sexual_preference: 'Straight',
    relationship_goals: ['Not limit myself'],
    relationship_types: ['Open Relationship'],
    lifestyle_habits: { 'creative flow': 'Every Day', traveling: 'Monthly', smoking: 'Non-Smoker', drinking: 'Socially' },
    moods: ['creative_showcase', 'exclusive_vip'],
    core_passion: 'art',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&q=80',
    is_kyc_verified: true,
    posts: [
      { tier: 'none', title: 'Golden Hour Portraits', description: 'AI-curated visual diary from golden hour shoots 📸', media_url: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80', media_type: 'image' },
      { tier: 'vip', title: 'Private Gallery Preview', description: 'VIP exclusive: behind-the-scenes of a private gallery.', media_url: 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=800&q=80', media_type: 'image' },
    ],
  },
  {
    email: 'af2@session-test.com',
    username: 'ai_elena',
    display_name: 'Elena (AI Creator)',
    gender: 'female',
    role: 'creator',
    archetype: 'visionary',
    connection_points: 400,
    quest_stage: 3,
    bio: '[AI Agent] Software engineer + violinist. Streams live background sessions.',
    hobbies: ['Tech', 'Music', 'Reading', 'Yoga'],
    sexual_preference: 'Straight',
    relationship_goals: ['Long term partner'],
    relationship_types: ['Monogamous'],
    lifestyle_habits: { reading: 'Daily', workout: 'Often', smoking: 'Non-Smoker', drinking: 'Never' },
    moods: ['deep_intimate', 'creative_showcase'],
    core_passion: 'music',
    avatar_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&q=80',
    is_kyc_verified: true,
    posts: [
      { tier: 'none', title: 'Code & Compose', description: 'Finding rhythm between coding and music 🎻💻', media_url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&q=80', media_type: 'image' },
      { tier: 'vip', title: 'Late Night Practice', description: 'VIP: a raw violin practice session.', media_url: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=800&q=80', media_type: 'image' },
      { tier: 'master', title: 'The Complete Symphony', description: 'Master only: my private musical works.', media_url: 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=800&q=80', media_type: 'image' },
    ],
  },
  {
    email: 'af3@session-test.com',
    username: 'ai_sofia',
    display_name: 'Sofia (AI Creator)',
    gender: 'female',
    role: 'creator',
    archetype: 'caregiver',
    connection_points: 350,
    quest_stage: 3,
    bio: '[AI Agent] Fitness coach. High engagement — responds to all interactions.',
    hobbies: ['Fitness', 'Yoga', 'Cooking', 'Outdoors'],
    sexual_preference: 'Straight',
    relationship_goals: ['Long term partner'],
    relationship_types: ['Monogamous'],
    lifestyle_habits: { workout: 'Every Day', 'healthy eating': 'Every Day', sleep: '8+ Hours', smoking: 'Non-Smoker', drinking: 'Never' },
    moods: ['workout_mate', 'dinner_date'],
    core_passion: 'fitness',
    avatar_url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=600&q=80',
    is_kyc_verified: true,
    posts: [
      { tier: 'none', title: 'Morning Calisthenics', description: 'Start your day strong 💪', media_url: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&q=80', media_type: 'image' },
      { tier: 'vip', title: 'Private Meal Prep Guide', description: 'VIP exclusive: full week high-protein plan.', media_url: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=800&q=80', media_type: 'image' },
    ],
  },
  {
    email: 'am1@session-test.com',
    username: 'ai_marco',
    display_name: 'Marco (AI Member)',
    gender: 'male',
    role: 'member',
    archetype: 'rebel',
    connection_points: 150,
    quest_stage: 2,
    bio: '[AI Agent] Sends scheduled messages to Hf2 for RLS testing.',
    hobbies: ['Music', 'Outdoors', 'Fitness'],
    sexual_preference: 'Straight',
    relationship_goals: ['Good Vibe Instant Crush'],
    relationship_types: ['Open to Explore'],
    lifestyle_habits: { partying: 'Every Weekend', 'adventure seek': 'High Adrenaline', smoking: 'Non-Smoker', drinking: 'Socially' },
    moods: ['party_dance', 'grab_drink', 'high_energy'],
    core_passion: 'music',
    avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=600&q=80',
    is_kyc_verified: false,
    posts: [],
  },
  {
    email: 'am2@session-test.com',
    username: 'ai_luca',
    display_name: 'Luca (AI Member)',
    gender: 'male',
    role: 'member',
    archetype: 'visionary',
    connection_points: 250,
    quest_stage: 2,
    bio: '[AI Agent] Likes profiles of Hm1 for PME visibility testing.',
    hobbies: ['Tech', 'Cars', 'Fitness', 'Reading'],
    sexual_preference: 'Straight',
    relationship_goals: ['Long term partner'],
    relationship_types: ['Monogamous'],
    lifestyle_habits: { workout: 'Every Day', 'healthy eating': 'Most Days', smoking: 'Non-Smoker', drinking: 'Never' },
    moods: ['deep_intimate', 'workout_mate'],
    core_passion: 'career',
    avatar_url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=600&q=80',
    is_kyc_verified: false,
    posts: [],
  },
  {
    email: 'am3@session-test.com',
    username: 'ai_theo',
    display_name: 'Theo (AI Member)',
    gender: 'male',
    role: 'member',
    archetype: 'explorer',
    connection_points: 100,
    quest_stage: 2,
    bio: '[AI Agent] Passive viewer. Joins streams, browses feed.',
    hobbies: ['Traveling', 'Photography', 'Music'],
    sexual_preference: 'Straight',
    relationship_goals: ['Travel Companion'],
    relationship_types: ['Not sure yet'],
    lifestyle_habits: { traveling: 'Every Week', 'adventure seek': 'Moderate', smoking: 'Non-Smoker', drinking: 'Socially' },
    moods: ['travel_trip', 'grab_drink'],
    core_passion: 'travel',
    avatar_url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600&q=80',
    is_kyc_verified: false,
    posts: [],
  },
];

const ALL_PROFILES = [...HUMAN_PROFILES, ...AI_AGENT_PROFILES];

// ─── Seeder Logic ────────────────────────────────────────────────────────────

async function createOrGetUser(profile) {
  // Check if profile already exists
  const { data: existing } = await supabase
    .from('profiles')
    .select('id')
    .eq('username', profile.username)
    .maybeSingle();

  if (existing?.id) {
    console.log(`  ↳ Profile @${profile.username} already exists (id: ${existing.id})`);
    return existing.id;
  }

  // Create auth user
  const { data: authData, error: signUpError } = await supabase.auth.signUp({
    email: profile.email,
    password: TEST_PASSWORD,
  });

  if (signUpError) {
    // If user already exists in auth but not in profiles, try signing in
    if (signUpError.message.includes('already registered') || signUpError.message.includes('already been registered')) {
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: profile.email,
        password: TEST_PASSWORD,
      });
      if (signInError) {
        console.error(`  ✗ Cannot sign in as ${profile.email}:`, signInError.message);
        return null;
      }
      return signInData.user?.id || null;
    }
    console.error(`  ✗ Sign up error for ${profile.email}:`, signUpError.message);
    return null;
  }

  return authData.user?.id || null;
}

async function seedProfile(profile) {
  console.log(`\n🧩 Seeding: ${profile.display_name} (${profile.email})`);

  const userId = await createOrGetUser(profile);
  if (!userId) {
    console.error(`  ✗ Skipping — could not get user ID`);
    return;
  }

  // Authenticate as this user for RLS-compliant writes
  await supabase.auth.signInWithPassword({
    email: profile.email,
    password: TEST_PASSWORD,
  });

  // Upsert profile
  const { error: profileError } = await supabase.from('profiles').upsert({
    id: userId,
    username: profile.username,
    display_name: profile.display_name,
    gender: profile.gender,
    role: profile.role,
    archetype: profile.archetype,
    connection_points: profile.connection_points,
    quest_stage: profile.quest_stage,
    bio: profile.bio,
    hobbies: profile.hobbies,
    sexual_preference: profile.sexual_preference,
    relationship_goals: profile.relationship_goals,
    relationship_types: profile.relationship_types,
    lifestyle_habits: profile.lifestyle_habits,
    moods: profile.moods,
    core_passion: profile.core_passion,
    avatar_url: profile.avatar_url,
    is_kyc_verified: profile.is_kyc_verified,
  });

  if (profileError) {
    console.error(`  ✗ Profile upsert error:`, profileError.message);
    return;
  }
  console.log(`  ✓ Profile saved — ${profile.role} / ${profile.archetype} / ${profile.connection_points} CP`);

  // Seed content posts for creators
  if (profile.posts && profile.posts.length > 0) {
    for (const post of profile.posts) {
      const { data: existingPost } = await supabase
        .from('platform_content')
        .select('id')
        .eq('creator_id', userId)
        .eq('title', post.title)
        .maybeSingle();

      if (!existingPost) {
        const { error: postError } = await supabase.from('platform_content').insert({
          creator_id: userId,
          tier: post.tier,
          title: post.title,
          description: post.description,
          media_url: post.media_url,
          media_type: post.media_type,
          moderation_status: 'approved',
        });
        if (postError) {
          console.error(`    ✗ Post "${post.title}":`, postError.message);
        } else {
          console.log(`    ✓ Post: "${post.title}" (${post.tier})`);
        }
      } else {
        console.log(`    ↳ Post "${post.title}" already exists`);
      }
    }
  }

  await sleep(1500); // Respect Supabase rate limits
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log('╔══════════════════════════════════════════════════════╗');
  console.log('║  SESSION — Functional Acceptance Test Seeder        ║');
  console.log('║  Creating 11 test profiles (5 human + 6 AI agents) ║');
  console.log('╚══════════════════════════════════════════════════════╝');
  console.log(`\nTarget: ${supabaseUrl}`);
  console.log(`Password for all accounts: ${TEST_PASSWORD}\n`);

  for (const profile of ALL_PROFILES) {
    await seedProfile(profile);
  }

  console.log('\n═══════════════════════════════════════════════════════');
  console.log('✅ Seeding Complete!');
  console.log('');
  console.log('🧑‍🤝‍🧑 HUMAN TESTER CREDENTIALS:');
  console.log('─────────────────────────────────────────────────────');
  for (const p of HUMAN_PROFILES) {
    console.log(`  ${p.display_name.padEnd(28)} → ${p.email} / ${TEST_PASSWORD}`);
  }
  console.log('');
  console.log('🤖 AI AGENT ACCOUNTS (background use):');
  console.log('─────────────────────────────────────────────────────');
  for (const p of AI_AGENT_PROFILES) {
    console.log(`  ${p.display_name.padEnd(28)} → ${p.email}`);
  }
  console.log('═══════════════════════════════════════════════════════');
}

main().catch(console.error);
