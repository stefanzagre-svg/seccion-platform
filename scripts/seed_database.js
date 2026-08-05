const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const CREATORS = [
  {
    email: 'elena@example.com',
    password: 'password123',
    profile: {
      role: 'creator',
      username: 'elena',
      display_name: 'Elena',
      avatar_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&q=80',
      bio: 'Fitness coach and wellness advocate. Let\'s get healthy together! 💪',
      is_kyc_verified: true,
      sexual_preference: 'Heterosexual',
      hobbies: ['Fitness', 'Yoga', 'Healthy Eating'],
      origins: 'Medellín',
      base_subscription_price: 19.99,
      relationship_goals: ['Casual', 'Friendship']
    },
    media: [
      { media_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&q=80', required_level: 'public' },
      { media_url: 'https://images.unsplash.com/photo-1518310383802-640c2de311b2?w=400&q=80', required_level: 'public' },
      { media_url: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=400&q=80', required_level: 'friendly' },
      { media_url: 'https://images.unsplash.com/photo-1507398941214-572c25f4b1dc?w=400&q=80', required_level: 'close' }
    ]
  },
  {
    email: 'sofia@example.com',
    password: 'password123',
    profile: {
      role: 'creator',
      username: 'sofia',
      display_name: 'Sofia',
      avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&q=80',
      bio: 'Digital nomad and travel vlogger. Catch me in a new city every month! ✈️',
      is_kyc_verified: true,
      sexual_preference: 'Bisexual',
      hobbies: ['Travel', 'Photography', 'Foodie'],
      origins: 'Barcelona',
      base_subscription_price: 14.99,
      relationship_goals: ['Networking', 'Collab']
    },
    media: [
      { media_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80', required_level: 'public' },
      { media_url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400&q=80', required_level: 'public' },
      { media_url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400&q=80', required_level: 'friendly' },
      { media_url: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=400&q=80', required_level: 'close' }
    ]
  },
  {
    email: 'valentina@example.com',
    password: 'password123',
    profile: {
      role: 'creator',
      username: 'valentina',
      display_name: 'Valentina',
      avatar_url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&q=80',
      bio: 'Fashion designer & artist. Creating beauty every day. ✨',
      is_kyc_verified: true,
      sexual_preference: 'Heterosexual',
      hobbies: ['Fashion', 'Art', 'Design'],
      origins: 'Bogotá',
      base_subscription_price: 24.99,
      relationship_goals: ['Friendship', 'Networking']
    },
    media: [
      { media_url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&q=80', required_level: 'public' },
      { media_url: 'https://images.unsplash.com/photo-1487180142328-0c4e37023af5?w=400&q=80', required_level: 'public' },
      { media_url: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=400&q=80', required_level: 'friendly' },
      { media_url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&q=80', required_level: 'close' }
    ]
  },
  {
    email: 'marco@example.com',
    password: 'password123',
    profile: {
      role: 'creator',
      username: 'marco',
      display_name: 'Marco',
      avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&q=80',
      bio: 'Musician & Producer. Catch my next live set! 🎧',
      is_kyc_verified: true,
      sexual_preference: 'Heterosexual',
      hobbies: ['Music', 'Producing', 'Nightlife'],
      origins: 'Miami',
      base_subscription_price: 9.99,
      relationship_goals: ['Collab', 'Networking']
    },
    media: [
      { media_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80', required_level: 'public' },
      { media_url: 'https://images.unsplash.com/photo-1480429370139-e0132c086e2a?w=400&q=80', required_level: 'public' },
      { media_url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400&q=80', required_level: 'friendly' }
    ]
  }
];

async function seed() {
  console.log("Starting DB Seed...");

  for (const c of CREATORS) {
    // 1. Create User in Auth
    console.log(`Creating auth user: ${c.email}...`);
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: c.email,
      password: c.password,
      email_confirm: true
    });

    if (authError) {
      if (authError.message.includes('already exists') || authError.message.includes('already been registered')) {
        console.log(`User ${c.email} already exists, skipping creation.`);
      } else {
        console.error(`Error creating user ${c.email}:`, authError.message);
        continue;
      }
    }

    // Retrieve user id to update profile
    const { data: userData } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', c.profile.username)
      .single();

    let userId = authData?.user?.id;
    
    if (!userId && userData) {
      userId = userData.id;
    }

    if (!userId) {
       // if we couldn't create them and they don't exist by username, fetch by email
       const { data: users } = await supabase.auth.admin.listUsers();
       const existingUser = users.users.find(u => u.email === c.email);
       if (existingUser) {
          userId = existingUser.id;
       }
    }

    if (!userId) {
      console.error(`Could not resolve user ID for ${c.email}`);
      continue;
    }

    // 2. Update Profile
    console.log(`Updating profile for ${c.profile.username}...`);
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        ...c.profile
      }, { onConflict: 'id' });

    if (profileError) {
      console.error(`Error updating profile ${c.profile.username}:`, profileError.message);
    }

    // 3. Clear existing media for this user
    await supabase.from('platform_content').delete().eq('creator_id', userId);

    // 4. Insert Media
    console.log(`Inserting media for ${c.profile.username}...`);
    for (let i = 0; i < c.media.length; i++) {
      const mediaItem = c.media[i];
      const { error: mediaError } = await supabase
        .from('platform_content')
        .insert({
          creator_id: userId,
          tier: mediaItem.required_level === 'public' ? 'vip' : 'master', // mock mapping
          title: `Media ${i + 1}`,
          media_url: mediaItem.media_url,
          media_type: 'image',
          // adding a mock requirement in description for UI parsing if needed
          description: `Required level: ${mediaItem.required_level}` 
        });

      if (mediaError) {
        console.error(`Error inserting media for ${c.profile.username}:`, mediaError.message);
      }
    }

    console.log(`Successfully seeded ${c.profile.username}!`);
  }

  console.log("Seed complete.");
}

seed().catch(console.error);
