/**
 * Social Media Scheduler Helper — SECCIØN Platform
 * Integrates with Supabase Storage (for media hosting) and Make.com Webhook
 */
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

export interface SocialDraftPayload {
  text: string;
  mediaUrls?: string[]; // Array of absolute local file paths to upload
  platforms?: ('instagram' | 'tiktok' | 'twitter' | 'facebook')[];
}

export interface SocialDraftResponse {
  success: boolean;
  provider: 'make.com';
  message: string;
}

const MAKE_WEBHOOK_URL = 'https://hook.eu1.make.com/zc2jronounqeqzvnq1iorj8tu8h70mnf';

// Initialize Supabase Admin Client
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function uploadMediaToSupabase(localFilePath: string): Promise<string> {
  if (!fs.existsSync(localFilePath)) {
    throw new Error(`File not found: ${localFilePath}`);
  }

  const fileName = `${Date.now()}_${path.basename(localFilePath)}`;
  const fileBuffer = fs.readFileSync(localFilePath);
  
  // Determine mime type
  const ext = path.extname(localFilePath).toLowerCase();
  let contentType = 'image/jpeg';
  if (ext === '.png') contentType = 'image/png';
  if (ext === '.mp4') contentType = 'video/mp4';

  console.log(`Uploading ${fileName} to Supabase...`);
  
  const { data, error } = await supabaseAdmin
    .storage
    .from('social-assets')
    .upload(fileName, fileBuffer, {
      contentType,
      upsert: true
    });

  if (error) {
    throw new Error(`Failed to upload to Supabase: ${error.message}`);
  }

  // Get the public URL
  const { data: publicUrlData } = supabaseAdmin
    .storage
    .from('social-assets')
    .getPublicUrl(fileName);

  return publicUrlData.publicUrl;
}

export async function pushSocialDraft(payload: SocialDraftPayload): Promise<SocialDraftResponse> {
  try {
    const publicMediaUrls: string[] = [];

    // 1. Upload local media files to Supabase to get public URLs for Make.com
    if (payload.mediaUrls && payload.mediaUrls.length > 0) {
      for (const localPath of payload.mediaUrls) {
        const publicUrl = await uploadMediaToSupabase(localPath);
        publicMediaUrls.push(publicUrl);
        console.log(`Uploaded! Public URL: ${publicUrl}`);
      }
    }

    // 2. Prepare payload for Make.com
    const makePayload = {
      text: payload.text,
      platforms: payload.platforms || ['instagram', 'tiktok', 'twitter'],
      mediaUrls: publicMediaUrls
    };

    console.log('Sending payload to Make.com...', JSON.stringify(makePayload, null, 2));

    // 3. POST to Make.com Webhook
    const res = await fetch(MAKE_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(makePayload),
    });

    if (!res.ok) {
      throw new Error(`Make.com webhook failed: ${res.statusText}`);
    }

    // Trigger the scenario immediately since Make webhooks respond instantly
    return {
      success: true,
      provider: 'make.com',
      message: `✅ Successfully pushed payload to Make.com webhook! Platforms: ${makePayload.platforms.join(', ')}`,
    };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, provider: 'make.com', message: msg };
  }
}
