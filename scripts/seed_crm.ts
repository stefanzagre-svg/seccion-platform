import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

async function seed() {
  console.log("Loading CRM JSON...");
  const jsonPath = path.resolve(process.cwd(), 'scripts', 'creator_crm_tracker.json');
  
  if (!fs.existsSync(jsonPath)) {
    console.error("Tracker JSON not found at", jsonPath);
    process.exit(1);
  }

  const raw = fs.readFileSync(jsonPath, 'utf8');
  const data = JSON.parse(raw);
  
  const creators = data.creators || [];
  
  if (creators.length === 0) {
    console.log("No creators to insert.");
    return;
  }

  console.log(`Found ${creators.length} creators. Seeding into Supabase...`);
  
  for (const creator of creators) {
    // Map fields to DB columns
    const payload = {
      legacy_id: creator.id,
      full_name: creator.full_name,
      city: creator.city,
      specialization: creator.specialization,
      instagram_handle: creator.instagram_handle,
      tiktok_handle: creator.tiktok_handle,
      telegram: creator.telegram,
      email: creator.email,
      status: creator.status,
      outreach_stage: creator.outreach_stage,
      outreach_date: creator.outreach_date ? new Date(creator.outreach_date).toISOString() : null,
      applied_via_web: creator.applied_via_web || false,
      year1_founding_rate: creator.year1_founding_rate || false,
      reviewer_notes: creator.reviewer_notes || ''
    };

    const { error } = await supabaseAdmin
      .from('crm_outreach_leads')
      .upsert(payload, { onConflict: 'legacy_id' });
      
    if (error) {
      console.error(`Error inserting ${creator.full_name}:`, error.message);
    } else {
      console.log(`✅ Inserted: ${creator.full_name}`);
    }
  }

  console.log("Seed completed!");
}

seed().catch(console.error);
