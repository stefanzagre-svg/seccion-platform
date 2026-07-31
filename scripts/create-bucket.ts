import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function createBucket() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Missing Supabase env vars");
  }
  
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  console.log("Checking if 'social-assets' bucket exists...");
  
  const { data: buckets, error: listError } = await supabaseAdmin.storage.listBuckets();
  if (listError) throw listError;

  const exists = buckets.find(b => b.name === 'social-assets');
  if (exists) {
    console.log("Bucket already exists!");
    return;
  }

  console.log("Creating 'social-assets' bucket as public...");
  const { data, error } = await supabaseAdmin.storage.createBucket('social-assets', {
    public: true,
    fileSizeLimit: 52428800 // 50MB
  });

  if (error) {
    console.error("Failed to create bucket:", error.message);
  } else {
    console.log("Successfully created bucket:", data);
  }
}

createBucket().catch(console.error);
