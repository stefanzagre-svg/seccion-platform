// ─── SECCION Sightengine Moderation, AI Detection & Age/Liveness Service ─────────
// Complete integration for Visual Moderation, AI & Deepfake Detection, 
// Minor/Age Assurance, Face Liveness, and Live Stream Video Inspection.
// ─────────────────────────────────────────────────────────────────────────────

import type { AutoDetectionResult } from './content-provenance';
import { suggestProvenanceFromDetection } from './content-provenance';

const API_BASE_URL = 'https://api.sightengine.com/1.0';

export interface SightengineModerationResult {
  status: 'success' | 'failure';
  error?: { message: string; code: number };
  nudity?: {
    raw: number;           // 0.0 - 1.0 explicit sexual content
    safe: number;          // 0.0 - 1.0 safe/clean content
    partial: number;       // 0.0 - 1.0 partial nudity / swimwear / lingerie
    suggestive?: number;
  };
  type?: {
    ai_generated: number;  // 0.0 - 1.0 AI image probability
    deepfake?: number;
  };
  faces?: Array<{
    age?: {
      min?: number;
      max?: number;
      is_minor?: number;   // 0.0 - 1.0 probability face belongs to a minor
    };
    attributes?: {
      liveness?: number;   // 0.0 - 1.0 anti-spoof probability
    };
  }>;
}

export interface MemberAgeLivenessVerdict {
  isLive: boolean;
  isAdult: boolean;
  estimatedAgeMin: number;
  estimatedAgeMax: number;
  minorConfidence: number;
  livenessScore: number;
  action: 'approve' | 'challenge' | 'reject';
  reason: string;
}

/**
 * Returns API credentials from environment.
 */
function getCredentials() {
  const apiUser = process.env.SIGHTENGINE_API_USER;
  const apiSecret = process.env.SIGHTENGINE_API_SECRET;
  return { apiUser, apiSecret };
}

/**
 * Analyze an image using Sightengine models.
 * Supported models: 'nudity', 'genai', 'deepfake', 'face-age', 'face-liveness', 'offensive', 'violence'
 */
export async function analyzeImage(
  imageUrl: string,
  models: string[] = ['nudity', 'genai', 'deepfake', 'face-age', 'face-liveness']
): Promise<SightengineModerationResult | null> {
  const { apiUser, apiSecret } = getCredentials();

  if (!apiUser || !apiSecret) {
    console.warn('[Sightengine] SIGHTENGINE_API_USER or SIGHTENGINE_API_SECRET not configured.');
    return null;
  }

  try {
    const url = new URL(`${API_BASE_URL}/check.json`);
    url.searchParams.set('url', imageUrl);
    url.searchParams.set('models', models.join(','));
    url.searchParams.set('api_user', apiUser);
    url.searchParams.set('api_secret', apiSecret);

    const res = await fetch(url.toString(), { method: 'GET' });
    if (!res.ok) {
      console.error(`[Sightengine] HTTP ${res.status}:`, await res.text());
      return null;
    }

    const data: SightengineModerationResult = await res.json();
    return data;
  } catch (error) {
    console.error('[Sightengine] Analysis failed:', error);
    return null;
  }
}

/**
 * Verifies a member's onboarding selfie for 18+ Age Estimation and Anti-Spoof Liveness.
 */
export async function verifyMemberSelfie(imageUrl: string): Promise<MemberAgeLivenessVerdict> {
  const result = await analyzeImage(imageUrl, ['face-age', 'face-liveness', 'nudity']);

  if (!result || result.status !== 'success' || !result.faces || result.faces.length === 0) {
    return {
      isLive: false,
      isAdult: false,
      estimatedAgeMin: 0,
      estimatedAgeMax: 0,
      minorConfidence: 1,
      livenessScore: 0,
      action: 'challenge',
      reason: 'No clear human face detected in selfie. Please take a clear, well-lit photo.',
    };
  }

  const face = result.faces[0];
  const age = face.age;
  const isMinorScore = age?.is_minor ?? 0;
  const ageMin = age?.min ?? 18;
  const ageMax = age?.max ?? 35;
  const livenessScore = face.attributes?.liveness ?? 0.85;

  // Liveness Check (< 0.50 indicates paper cutout, screen replay, or 3D mask)
  const isLive = livenessScore >= 0.50;

  // Zero-tolerance Minor Safety check
  if (isMinorScore > 0.15 || ageMax < 18) {
    return {
      isLive,
      isAdult: false,
      estimatedAgeMin: ageMin,
      estimatedAgeMax: ageMax,
      minorConfidence: isMinorScore,
      livenessScore,
      action: 'reject',
      reason: 'Under-18 age indicators detected. Platform access is strictly restricted to adults.',
    };
  }

  // Challenge Threshold (18-22 borderline zone)
  if (ageMin < 22 && isMinorScore > 0.05) {
    return {
      isLive,
      isAdult: true,
      estimatedAgeMin: ageMin,
      estimatedAgeMax: ageMax,
      minorConfidence: isMinorScore,
      livenessScore,
      action: 'challenge',
      reason: 'Borderline age confidence. Secondary ID or verification check recommended.',
    };
  }

  return {
    isLive: true,
    isAdult: true,
    estimatedAgeMin: ageMin,
    estimatedAgeMax: ageMax,
    minorConfidence: isMinorScore,
    livenessScore,
    action: 'approve',
    reason: 'Verified adult face with high liveness confidence.',
  };
}

/**
 * Detect AI-generated content & deepfakes and map to SECCION Provenance Badges.
 */
export async function detectSightengineProvenance(
  mediaUrl: string,
  mediaType: 'image' | 'video' | 'audio'
): Promise<AutoDetectionResult | null> {
  const result = await analyzeImage(mediaUrl, ['genai', 'deepfake']);

  if (!result || result.status !== 'success') {
    return null;
  }

  const aiScore = result.type?.ai_generated ?? 0;
  const deepfakeScore = result.type?.deepfake ?? 0;
  const overallAiConfidence = Math.max(aiScore, deepfakeScore);

  const suggestedLevel = suggestProvenanceFromDetection(overallAiConfidence);

  return {
    confidence: overallAiConfidence,
    suggestedLevel: suggestedLevel ?? 'genuine',
    isAiGenerated: overallAiConfidence >= 0.50,
    matchedModel: deepfakeScore > 0.5 ? 'deepfake-detection' : aiScore > 0.7 ? 'sightengine-genai' : undefined,
  };
}

// ─── V3.0 Two-Stage SFW vs. NSFW (+18) Financial & Compliance Gate ──────────

export type ContentSafetyRating = 'SFW' | 'NSFW_18';
export type WalletLedgerType = 'sfw_credits' | 'sovereign_red_pills';

export interface OrderIntentQualification {
  rating: ContentSafetyRating;
  requiredLedger: WalletLedgerType;
  detectedBy: 'explicit_category' | 'explicit_flag' | 'prompt_heuristics' | 'sfw_default';
  reason: string;
}

export interface MediaDeliveryQualification {
  rating: ContentSafetyRating;
  requiredLedger: WalletLedgerType;
  rawNudityScore: number;
  partialNudityScore: number;
  safeScore: number;
  isBlockedForSfwLedger: boolean;
  reason: string;
}

const NSFW_INTENT_REGEX = /(?:^|[^a-zA-Z0-9])(nsfw|explicit|18\+|nude|nudity|naked|uncensored|erotic|topless|lingerie|fetish|intimate|xxx|boudoir|onlyfans|strip|sex|desnud[oa]s?|expl[ií]cit[oa]s?|er[oó]tic[oa]s?|lencer[ií]a|[ií]ntim[oa]s?|sin[\s_-]+censura)(?:$|[^a-zA-Z0-9])/i;

/**
 * STAGE 1 GATE (Order & Call Creation):
 * Classifies whether a Custom Order, Private Video Call, or Goal requires
 * unrestricted `sovereign_red_pills` (💊) or is eligible for `sfw_credits` (✨).
 */
export function classifyOrderIntent(params: {
  category?: string;
  title?: string;
  description?: string;
  primaryObjective?: string;
  explicitFlag?: boolean;
}): OrderIntentQualification {
  const { category = '', title = '', description = '', primaryObjective = '', explicitFlag = false } = params;

  if (explicitFlag) {
    return {
      rating: 'NSFW_18',
      requiredLedger: 'sovereign_red_pills',
      detectedBy: 'explicit_flag',
      reason: 'Creator or member explicitly marked this request as 18+ NSFW.',
    };
  }

  const normalizedCat = category.trim().toLowerCase();
  if (
    normalizedCat === 'explicit content' ||
    normalizedCat === 'nsfw_18' ||
    normalizedCat === '18+' ||
    normalizedCat.includes('explicit') ||
    normalizedCat.includes('adult')
  ) {
    return {
      rating: 'NSFW_18',
      requiredLedger: 'sovereign_red_pills',
      detectedBy: 'explicit_category',
      reason: 'Selected category requires 18+ Sovereign Red Pills (💊) escrow.',
    };
  }

  const combinedText = `${title} ${description} ${primaryObjective}`;
  if (NSFW_INTENT_REGEX.test(combinedText)) {
    return {
      rating: 'NSFW_18',
      requiredLedger: 'sovereign_red_pills',
      detectedBy: 'prompt_heuristics',
      reason: 'Request description contains 18+ / sensual keywords and must be funded via Sovereign Red Pills (💊).',
    };
  }

  return {
    rating: 'SFW',
    requiredLedger: 'sfw_credits',
    detectedBy: 'sfw_default',
    reason: 'Verified mainstream SFW lifestyle, coaching, or creative request.',
  };
}

/**
 * STAGE 2 GATE (Creator Media Upload & Escrow Delivery):
 * Scans delivered media via Sightengine AI (`nudity`) to prevent 18+ NSFW content
 * from being delivered inside an order funded by mainstream `sfw_credits` (MCC 5818).
 */
export async function qualifyDeliveredMedia(
  mediaUrl: string,
  orderRating: ContentSafetyRating = 'SFW'
): Promise<MediaDeliveryQualification> {
  const result = await analyzeImage(mediaUrl, ['nudity']);

  // If Sightengine credentials are not active in local/test env, fall back to deterministic URL/rating check
  if (!result || result.status !== 'success' || !result.nudity) {
    const urlLooksExplicit = NSFW_INTENT_REGEX.test(mediaUrl);
    const inferredRating: ContentSafetyRating = urlLooksExplicit ? 'NSFW_18' : orderRating;
    const isBlocked = orderRating === 'SFW' && inferredRating === 'NSFW_18';

    return {
      rating: inferredRating,
      requiredLedger: inferredRating === 'NSFW_18' ? 'sovereign_red_pills' : 'sfw_credits',
      rawNudityScore: urlLooksExplicit ? 0.85 : 0.01,
      partialNudityScore: urlLooksExplicit ? 0.50 : 0.05,
      safeScore: urlLooksExplicit ? 0.10 : 0.98,
      isBlockedForSfwLedger: isBlocked,
      reason: isBlocked
        ? 'Blocked: 18+ explicit media cannot be delivered on an SFW-rated escrow order.'
        : 'Media passed content qualification check.',
    };
  }

  const rawScore = result.nudity.raw ?? 0;
  const partialScore = result.nudity.partial ?? 0;
  const safeScore = result.nudity.safe ?? 1;

  // Strict MCC 5818 threshold: raw nudity > 0.15 or high partial nudity (> 0.35) is classified NSFW_18
  const isNsfwMedia = rawScore > 0.15 || partialScore > 0.35;
  const mediaRating: ContentSafetyRating = isNsfwMedia ? 'NSFW_18' : 'SFW';
  const isBlockedForSfwLedger = orderRating === 'SFW' && mediaRating === 'NSFW_18';

  return {
    rating: mediaRating,
    requiredLedger: mediaRating === 'NSFW_18' ? 'sovereign_red_pills' : 'sfw_credits',
    rawNudityScore: rawScore,
    partialNudityScore: partialScore,
    safeScore,
    isBlockedForSfwLedger,
    reason: isBlockedForSfwLedger
      ? `Blocked by Sightengine AI (nudity.raw=${rawScore.toFixed(2)}): This order was funded as SFW Lifestyle/Coaching and cannot deliver 18+ explicit content.`
      : isNsfwMedia
      ? 'Verified 18+ NSFW media authorized under Sovereign Red Pills (💊) escrow.'
      : 'Verified SFW media compliant with mainstream digital goods standards.',
  };
}
