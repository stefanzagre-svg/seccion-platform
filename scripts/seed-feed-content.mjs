import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://sfthjyawyxjlbyszjkiu.supabase.co';
const supabaseAnonKey = 'sb_publishable_g77dP1FAhpIg3orcGwOLnw_hN0PeTV0';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const CREATORS = [
  {
    email: 'valentina@session.com',
    username: 'valentina',
    display_name: 'Valentina V.',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&q=80',
    bio: 'Photographer and visual artist. Let us build a visual diary together.',
    hobbies: ['Art', 'Photography', 'Music', 'Travel'],
    sexual_preference: 'Heterosexual',
    relationship_goals: ['Short-term', 'Open to possibilities'],
    relationship_types: ['Open Relationship'],
    lifestyle_habits: { family_goals: 'Open to children', drinking: 'socially', smoking: 'never' },
    role: 'creator',
    posts: [
      { tier: 'none', title: 'A Midnight Walk in Paris', description: 'Taking photos under the moonlight 🌙', media_url: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80', media_type: 'image' },
      { tier: 'vip', title: 'Exclusive Behind-The-Scenes', description: 'VIP exclusive: behind the camera of my latest gallery shoot.', media_url: 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=800&q=80', media_type: 'image' }
    ]
  },
  {
    email: 'elena@session.com',
    username: 'elena',
    display_name: 'Elena R.',
    avatar_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&q=80',
    bio: 'Software engineer by day, violinist by night. Looking for harmonic connections.',
    hobbies: ['Tech', 'Music', 'Reading', 'Yoga'],
    sexual_preference: 'Heterosexual',
    relationship_goals: ['Long-term'],
    relationship_types: ['Monogamous'],
    lifestyle_habits: { family_goals: 'Want children', drinking: 'never', smoking: 'never' },
    role: 'creator',
    posts: [
      { tier: 'none', title: 'Strings and Codes', description: 'Finding the rhythm between coding and composing music 🎻💻', media_url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&q=80', media_type: 'image' },
      { tier: 'vip', title: 'Late Night Violin Practice', description: 'VIP exclusive: a raw violin practice session video.', media_url: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=800&q=80', media_type: 'image' },
      { tier: 'master', title: 'Master Vault: The Complete Symphony', description: 'Master subscription only: my private musical works.', media_url: 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=800&q=80', media_type: 'image' }
    ]
  },
  {
    email: 'sofia@session.com',
    username: 'sofia',
    display_name: 'Sofia G.',
    avatar_url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=600&q=80',
    bio: 'Fitness and nutrition coach. Let us calibrate your wellness routine.',
    hobbies: ['Fitness', 'Yoga', 'Cooking', 'Outdoors'],
    sexual_preference: 'Heterosexual',
    relationship_goals: ['Long-term'],
    relationship_types: ['Monogamous'],
    lifestyle_habits: { family_goals: 'Want children', drinking: 'socially', smoking: 'never' },
    role: 'creator',
    posts: [
      { tier: 'none', title: 'Morning Calisthenics', description: 'Calisthenics calibration routine to start your day strong 💪', media_url: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&q=80', media_type: 'image' },
      { tier: 'vip', title: 'Private Meal Prep Guide', description: 'VIP exclusive: full week high-protein nutrition mapping.', media_url: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=800&q=80', media_type: 'image' }
    ]
  }
];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function seed() {
  console.log('🧪 Starting Creator Data Seeding...');

  for (const c of CREATORS) {
    console.log(`Checking if creator exists: @${c.username}...`);
    
    let { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', c.username)
      .maybeSingle();

    let userId = profile?.id;

    if (!userId) {
      console.log(`Creating auth user: ${c.email}...`);
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: c.email,
        password: 'Password123!',
      });

      if (signUpError) {
        console.error(`Sign up error for ${c.email}:`, signUpError.message);
        console.log('Waiting 5 seconds to retry/continue...');
        await sleep(5000);
        continue;
      }
      userId = authData.user?.id;
      // Wait to respect rate limits
      await sleep(2000);
    }
    if (userId) {
      // Authenticate as this creator to pass RLS policies
      await supabase.auth.signInWithPassword({
        email: c.email,
        password: 'Password123!'
      });

      console.log(`Upserting profile for: @${c.username}...`);
      const { error: profileError } = await supabase.from('profiles').upsert({
        id: userId,
        username: c.username,
        display_name: c.display_name,
        avatar_url: c.avatar_url,
        bio: c.bio,
        hobbies: c.hobbies,
        sexual_preference: c.sexual_preference,
        relationship_goals: c.relationship_goals,
        relationship_types: c.relationship_types,
        lifestyle_habits: c.lifestyle_habits,
        role: c.role,
        is_kyc_verified: true
      });

      if (profileError) {
        console.error(`Profile error for @${c.username}:`, profileError.message);
        continue;
      }

      // Seed content posts
      console.log(`Seeding posts for @${c.username}...`);
      for (const post of c.posts) {
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
            moderation_status: 'approved'
          });

          if (postError) {
            console.error(`Post error for "${post.title}":`, postError.message);
          } else {
            console.log(`Seeded post: "${post.title}" (${post.tier})`);
          }
        }
      }
    }
  }

  console.log('✅ Creator Data Seeding Completed!');
}

seed();
