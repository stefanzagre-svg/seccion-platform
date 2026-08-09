import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load .env.local
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables.");
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const email = process.argv[2];

if (!email) {
  console.error("Please provide an email address as the first argument.");
  console.log("Usage: node scripts/delete_user_by_email.mjs <email>");
  process.exit(1);
}

async function deleteUser(targetEmail) {
  console.log(`Looking for user with email: ${targetEmail}`);
  
  const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();
  
  if (listError) {
    console.error("Error listing users:", listError);
    process.exit(1);
  }
  
  const user = users.find(u => u.email === targetEmail);
  
  if (!user) {
    console.log(`No user found in auth.users with email ${targetEmail}.`);
    // Attempt to delete orphaned profile just in case
    const { data: profile } = await supabaseAdmin.from('profiles').select('*').eq('email', targetEmail).maybeSingle();
    if (profile) {
      console.log(`Found orphaned profile in public.profiles. Deleting ID: ${profile.id}...`);
      await supabaseAdmin.from('profiles').delete().eq('id', profile.id);
      console.log("Orphaned profile deleted.");
    }
    return;
  }
  
  console.log(`Found user in Auth! ID: ${user.id}`);
  
  const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(user.id);
  
  if (deleteError) {
    console.error("Error deleting user from Auth:", deleteError);
  } else {
    console.log("User successfully deleted from auth.users.");
  }
  
  // Double check profiles table (in case cascade didn't run)
  const { error: profileError } = await supabaseAdmin.from('profiles').delete().eq('id', user.id);
  if (profileError) {
    // It's ok if it fails because it might have already been cascade deleted
    console.log("Note: Profile might already be deleted via cascade.");
  } else {
    console.log("Profile cleanup confirmed in public.profiles.");
  }
  
  console.log("Deletion complete! You can now register again.");
}

deleteUser(email);
