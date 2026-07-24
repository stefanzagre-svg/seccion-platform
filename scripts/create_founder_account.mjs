import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const adminClient = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
  const email = 'stefan.zagre@gmail.com';
  const password = process.argv[2] || 'StefanAdmin2026!';

  console.log(`Setting up Founder Super Admin account for ${email}...`);

  // Check if user exists in auth.users
  const { data: { users }, error: listErr } = await adminClient.auth.admin.listUsers();
  if (listErr) {
    console.error('Error listing users:', listErr);
    process.exit(1);
  }

  let existingUser = users.find(u => u.email === email);

  if (!existingUser) {
    console.log(`User ${email} does not exist. Creating user in auth.users...`);
    const { data: newUser, error: createErr } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { display_name: 'Stefan (Founder)', username: 'stefan' },
    });

    if (createErr) {
      console.error('Failed to create user:', createErr);
      process.exit(1);
    }
    existingUser = newUser.user;
    console.log('✅ Created user:', existingUser.id);
  } else {
    console.log(`User ${email} exists. Updating password...`);
    const { error: updateErr } = await adminClient.auth.admin.updateUserById(existingUser.id, {
      password,
      email_confirm: true,
    });
    if (updateErr) {
      console.error('Failed to update password:', updateErr);
      process.exit(1);
    }
    console.log('✅ Password updated successfully!');
  }

  // Ensure profile exists in public.profiles with super_admin role
  const { data: profile } = await adminClient
    .from('profiles')
    .select('*')
    .eq('id', existingUser.id)
    .single();

  if (!profile) {
    console.log('Creating profile in public.profiles...');
    const { error: profErr } = await adminClient.from('profiles').insert({
      id: existingUser.id,
      username: 'stefan',
      display_name: 'Stefan (Founder)',
      role: 'creator',
      is_kyc_verified: true,
      created_at: new Date().toISOString(),
    });
    if (profErr) {
      console.error('Error creating profile:', profErr);
    } else {
      console.log('✅ Profile created!');
    }
  }

  console.log('\n🎉 Founder Credentials Ready:');
  console.log(`Email: ${email}`);
  console.log(`Password: ${password}`);
  console.log(`Login Link: https://seccion-platform.stefan-zagre.workers.dev/login?next=/admin`);
}

main();
