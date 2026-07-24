import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

// Parse .env.local
const envPath = path.resolve('.env.local');
if (!fs.existsSync(envPath)) {
  console.error('.env.local not found!');
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
  const parts = line.split('=');
  if (parts.length >= 2) {
    const key = parts[0].trim();
    const value = parts.slice(1).join('=').trim().replace(/^['"]|['"]$/g, '');
    env[key] = value;
  }
});

const url = env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceRoleKey) {
  console.error('Supabase URL or Key missing in environment.');
  process.exit(1);
}

console.log(`Connecting to Supabase at: ${url}`);
const supabase = createClient(url, serviceRoleKey);

async function run() {
  const newMoves = [
    { id: 'live_streaming_performance', label: 'Live Streaming performance', emoji: '📹', kyc_required: false, relationship_level: 'friendly' },
    { id: 'live_stream_introduction', label: 'Live Stream introduction', emoji: '🎙️', kyc_required: false, relationship_level: 'friendly' }
  ];

  for (const move of newMoves) {
    console.log(`Upserting suggestion move: ${move.label}`);
    const { data, error } = await supabase
      .from('suggestion_moves')
      .upsert(move, { onConflict: 'id' });
    
    if (error) {
      console.error(`Error inserting ${move.id}:`, error);
    } else {
      console.log(`Successfully upserted ${move.id}`);
    }
  }
}

run();
