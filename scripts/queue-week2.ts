import dotenv from 'dotenv';
import path from 'path';
import { pushSocialDraft } from '../src/lib/social-scheduler';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function queueWeek2() {
  console.log("Queuing Week 2 Content to Make.com Webhook (Privacy, DRM, Contracts)...");

  // These are the absolute paths to the generated AI visuals in your artifacts folder
  const faceBlurImg = "C:\\Users\\USER\\.gemini\\antigravity\\brain\\398b2d87-fbd4-4d3c-8374-f91c547511a5\\face_blur_demo_1785328321485.jpg";
  const drmSweeperImg = "C:\\Users\\USER\\.gemini\\antigravity\\brain\\398b2d87-fbd4-4d3c-8374-f91c547511a5\\drm_sweeper_1785328330496.jpg";
  const contractSunsetImg = "C:\\Users\\USER\\.gemini\\antigravity\\brain\\398b2d87-fbd4-4d3c-8374-f91c547511a5\\contract_sunset_1785328340185.jpg";

  // Post 1: TikTok / Reel - Face Blur Demo
  const post1 = await pushSocialDraft({
    platforms: ['tiktok', 'instagram'],
    text: "Your face, your choice. SECCIØN’s new Face Blur Encryption lets you protect your identity natively before it ever hits the web. 🛡️✨ No more manual editing, no more leaks. #PrivacyFirst #CreatorEconomy #SECCION #ContentCreator",
    mediaUrls: [faceBlurImg]
  });
  console.log('Post 1 (Face Blur):', post1.message);

  // Post 2: Instagram Carousel - DRM Sweeper
  const post2 = await pushSocialDraft({
    platforms: ['instagram'],
    text: "Ever found your premium content on a sketchy forum? 😡 Our automated DRM Web Sweeper scans the dark web and unauthorized sites 24/7. When it spots a leak, it issues automated takedowns. Total protection. 🔒 #DRM #CreatorSafety #SECCION",
    mediaUrls: [drmSweeperImg]
  });
  console.log('Post 2 (DRM Sweeper):', post2.message);

  // Post 3: X (Twitter) - Predatory Sunset Clauses
  const post3 = await pushSocialDraft({
    platforms: ['twitter'],
    text: "Predatory agency contracts are trapping creators with 'Sunset Clauses'—meaning the agency keeps taking 50% of your earnings EVEN AFTER you leave them. 🛑 SECCIØN has 0 sunset clauses. You own your content, always. Read your contracts, creators! 📜✂️",
    mediaUrls: [contractSunsetImg]
  });
  console.log('Post 3 (Sunset Clauses):', post3.message);

  console.log("\nWeek 2 Queue Complete! All payloads sent to Make.com Webhook.");
}

queueWeek2().catch(console.error);
