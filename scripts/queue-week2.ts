import dotenv from 'dotenv';
import path from 'path';
import { pushSocialDraft } from '../src/lib/social-scheduler';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function queueWeek2() {
  console.log("Queuing Week 2 Content to Buffer (Privacy, DRM, Contracts)...");

  // Post 1: TikTok / Reel - Face Blur Demo
  const post1 = await pushSocialDraft({
    platforms: ['tiktok', 'instagram'],
    text: "Your face, your choice. SECCIØN’s new Face Blur Encryption lets you protect your identity natively before it ever hits the web. 🛡️✨ No more manual editing, no more leaks. #PrivacyFirst #CreatorEconomy #SECCION #ContentCreator",
    mediaUrls: ["face_blur_demo.jpg"] // Attached locally
  });
  console.log('Post 1 (Face Blur):', post1.message);

  // Post 2: Instagram Carousel - DRM Sweeper
  const post2 = await pushSocialDraft({
    platforms: ['instagram'],
    text: "Ever found your premium content on a sketchy forum? 😡 Our automated DRM Web Sweeper scans the dark web and unauthorized sites 24/7. When it spots a leak, it issues automated takedowns. Total protection. 🔒 #DRM #CreatorSafety #SECCION",
    mediaUrls: ["drm_sweeper.jpg"]
  });
  console.log('Post 2 (DRM Sweeper):', post2.message);

  // Post 3: X (Twitter) - Predatory Sunset Clauses
  const post3 = await pushSocialDraft({
    platforms: ['twitter'],
    text: "Predatory agency contracts are trapping creators with 'Sunset Clauses'—meaning the agency keeps taking 50% of your earnings EVEN AFTER you leave them. 🛑 SECCIØN has 0 sunset clauses. You own your content, always. Read your contracts, creators! 📜✂️",
    mediaUrls: ["contract_sunset.jpg"]
  });
  console.log('Post 3 (Sunset Clauses):', post3.message);

  console.log("\nWeek 2 Queue Complete!");
  console.log("Head over to https://publish.buffer.com to review the drafts and attach the generated AI images!");
}

queueWeek2().catch(console.error);
