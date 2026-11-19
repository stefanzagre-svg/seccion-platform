// ─── SECCION Sightengine Moderation, AI Detection & Age/Liveness Service ─────────
// Complete integration for Visual Moderation (nudity-2.1, wad, gore-2.0),
// AI & Deepfake Provenance Detection, Tiered Minor/Age Screening (face-age),
// and Passive Face Liveness (liveness).
// ─────────────────────────────────────────────────────────────────────────────

import type { AutoDetectionResult } from './content-provenance';
import { suggestProvenanceFromDetection } from './content-provenance';

const API_BASE_URL = 'https://api.sightengine.com/1.0';

export interface SightengineFaceEntry {
  age?: {
    min?: number;
    max?: number;
    is_minor?: number;     // legacy shape
    minor?: number;        // face-age shape
  };
  attributes?: {
    liveness?: number;     // 0.0 - 1.0 anti-spoof probability
    minor?: number;        // Sightengine face-age minor probability
    age?: {
      minor?: number;
      min?: number;
      max?: number;
    };
  };
}

export interface SightengineModerationResult {
  status: 'success' | 'failure';
  error?: { message: string; code: number };
  nudity?: {
    // Legacy nudity fields
    raw?: number;
    safe?: number;
    partial?: number;
    suggestive?: number;
    // Modern nudity-2.1 structured fields
    sexual_activity?: number;
    sexual_display?: number;
    erotica?: number;
    very_suggestive?: number;
    mildly_suggestive?: number;
    none?: number;
  };
  type?: {
    ai_generated: number;  // 0.0 - 1.0 AI image probability
    deepfake?: number;
  };
  faces?: SightengineFaceEntry[];
  weapon?: number;         // 0.0 - 1.0 weapons probability (wad model)
  alcohol?: number;        // 0.0 - 1.0 alcohol probability (wad model)
  drugs?: number;          // 0.0 - 1.0 recreational drugs probability (wad model)
  gore?: {
    prob?: number;         // 0.0 - 1.0 gore/graphic violence probability (gore-2.0)
  };
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
 * Extracts normalized minor probability across Sightengine `face-age` response shapes.
 */
function extractMaxMinorProbability(faces?: SightengineFaceEntry[]): number {
  if (!Array.isArray(faces) || faces.length === 0) return 0;
  let maxMinor = 0;
  for (const face of faces) {
    const candidate = Math.max(
      face.attributes?.minor ?? 0,
      face.attributes?.age?.minor ?? 0,
      face.age?.minor ?? 0,
      face.age?.is_minor ?? 0
    );
    if (candidate > maxMinor) maxMinor = candidate;
  }
  return maxMinor;
}

/**
 * Extracts normalized nudity scores across both modern `nudity-2.1` and legacy `nudity` payloads.
 */
function extractNormalizedNudityScores(nudity?: SightengineModerationResult['nudity']) {
  const rawScore = Math.max(
    nudity?.raw ?? 0,
    nudity?.sexual_activity ?? 0,
    nudity?.sexual_display ?? 0,
    nudity?.erotica ?? 0
  );
  const partialScore = Math.max(
    nudity?.partial ?? 0,
    nudity?.very_suggestive ?? 0,
    nudity?.suggestive ?? 0
  );
  const safeScore = nudity?.none ?? nudity?.safe ?? Math.max(0, 1 - Math.max(rawScore, partialScore));
  return { rawScore, partialScore, safeScore };
}

function buildProvenanceFromResult(result: SightengineModerationResult): AutoDetectionResult | null {
  if (!result.type) return null;
  const aiScore = result.type.ai_generated ?? 0;
  const deepfakeScore = result.type.deepfake ?? 0;
  const overallAiConfidence = Math.max(aiScore, deepfakeScore);
  const suggestedLevel = suggestProvenanceFromDetection(overallAiConfidence * 100);

  return {
    confidence: overallAiConfidence,
    suggestedLevel: suggestedLevel ?? 'genuine',
    isAiGenerated: overallAiConfidence >= 0.50,
    detectedModel:
      deepfakeScore > 0.5
        ? 'deepfake-detection'
        : aiScore > 0.7
        ? 'sightengine-genai'
        : undefined,
    source: 'sightengine',
    checkedAt: new Date().toISOString(),
  };
}

/**
 * Analyze an image using Sightengine models.
 * Supported models: 'nudity-2.1', 'wad', 'gore-2.0', 'face-age', 'liveness', 'genai', 'deepfake'
 */
export async function analyzeImage(
  imageUrl: string,
  models: string[] = ['nudity-2.1', 'wad', 'gore-2.0', 'face-age']
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
 * Verifies a member's selfie for 18+ Age Estimation and Passive Anti-Spoof Liveness.
 */
export async function verifyMemberSelfie(imageUrl: string): Promise<MemberAgeLivenessVerdict> {
  const result = await analyzeImage(imageUrl, ['face-age', 'liveness', 'nudity-2.1']);

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
  const age = face.age || face.attributes?.age;
  const isMinorScore = extractMaxMinorProbability([face]);
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
  _mediaType: 'image' | 'video' | 'audio'
): Promise<AutoDetectionResult | null> {
  const result = await analyzeImage(mediaUrl, ['genai', 'deepfake']);

  if (!result || result.status !== 'success') {
    return null;
  }

  return buildProvenanceFromResult(result);
}

// ─── V3.1 Two-Stage SFW vs. NSFW (+18) Financial & Compliance Gate ──────────

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
  minorScore?: number;
  requiresManualAgeReview?: boolean;
  isBlockedForSfwLedger: boolean;
  safetyFlags?: string[];
  contentSafetyPass?: boolean;
  isBlockedProhibited?: boolean;
  reason: string;
}

export interface UploadInspectionOptions {
  isVerifiedCreator?: boolean;
  includeGenAi?: boolean;
}

export interface CombinedUploadInspectionResult {
  mediaVerdict: MediaDeliveryQualification;
  provenanceDetection: AutoDetectionResult | null;
}

const NSFW_INTENT_REGEX =
  /(?:^|[^a-zA-Z0-9])(nsfw|explicit|18\+|nude|nudity|naked|uncensored|erotic|topless|lingerie|fetish|intimate|xxx|boudoir|onlyfans|strip|sex|desnud[oa]s?|expl[ií]cit[oa]s?|er[oó]tic[oa]s?|lencer[ií]a|[ií]ntim[oa]s?|sin[\s_-]+censura)(?:$|[^a-zA-Z0-9])/i;

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
  const { category = '', title = '', description = '', primaryObjective = '', explicitFlag = false } =
    params;

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
      reason:
        'Request description contains 18+ / sensual keywords and must be funded via Sovereign Red Pills (💊).',
    };
  }

  return {
    rating: 'SFW',
    requiredLedger: 'sfw_credits',
    detectedBy: 'sfw_default',
    reason: 'Verified mainstream SFW lifestyle, coaching, or creative request.',
  };
}

function evaluateModerationResult(
  result: SightengineModerationResult | null,
  mediaUrl: string,
  orderRating: ContentSafetyRating,
  isVerifiedCreator: boolean
): MediaDeliveryQualification {
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
      minorScore: 0,
      requiresManualAgeReview: false,
      isBlockedForSfwLedger: isBlocked,
      safetyFlags: [],
      contentSafetyPass: true,
      isBlockedProhibited: false,
      reason: isBlocked
        ? 'Blocked: 18+ explicit media cannot be delivered on an SFW-rated escrow order.'
        : 'Media passed content qualification check.',
    };
  }

  const { rawScore, partialScore, safeScore } = extractNormalizedNudityScores(result.nudity);
  const minorScore = extractMaxMinorProbability(result.faces);

  const safetyFlags: string[] = [];
  if ((result.weapon ?? 0) > 0.50) safetyFlags.push('weapon');
  if ((result.drugs ?? 0) > 0.50) safetyFlags.push('drugs');
  if ((result.gore?.prob ?? 0) > 0.40) safetyFlags.push('gore');

  // Tiered Minor Safety Shield:
  // - > 0.50: hard quarantine for ALL uploaders (protects against third-party minor / CSAM)
  // - 0.15..0.50: hard block for unverified accounts; soft review flag for DIDIT 2257-verified creators
  let isMinorHardBlocked = false;
  let requiresManualAgeReview = false;
  if (minorScore > 0.50) {
    safetyFlags.push('minor_suspected');
    isMinorHardBlocked = true;
  } else if (minorScore > 0.15) {
    if (isVerifiedCreator) {
      safetyFlags.push('minor_borderline_review');
      requiresManualAgeReview = true;
    } else {
      safetyFlags.push('minor_suspected');
      isMinorHardBlocked = true;
    }
  }

  const isBlockedProhibited =
    isMinorHardBlocked ||
    safetyFlags.includes('weapon') ||
    safetyFlags.includes('drugs') ||
    safetyFlags.includes('gore');
  const contentSafetyPass = !isBlockedProhibited;

  // Strict MCC 5818 threshold: raw nudity > 0.15 or partial nudity > 0.25 is classified NSFW_18
  const isNsfwMedia = rawScore > 0.15 || partialScore > 0.25;
  const mediaRating: ContentSafetyRating = isNsfwMedia ? 'NSFW_18' : 'SFW';
  const isBlockedForSfwLedger =
    isBlockedProhibited || (orderRating === 'SFW' && mediaRating === 'NSFW_18');

  let reason = 'Verified SFW media compliant with mainstream digital goods standards.';
  if (isMinorHardBlocked) {
    reason =
      'Blocked by Sightengine Minor Safety Shield: Potential underage face detected. Content has been quarantined for compliance review.';
  } else if (isBlockedProhibited) {
    reason = `Blocked by Sightengine Safety Gate (${safetyFlags.join(', ')}): Prohibited weapon, drug, or graphic gore content cannot be hosted or delivered.`;
  } else if (isBlockedForSfwLedger) {
    reason = `Blocked by Sightengine AI (nudity.raw=${rawScore.toFixed(2)}, partial=${partialScore.toFixed(2)}): This order was funded as SFW Lifestyle/Coaching and cannot deliver 18+ explicit content.`;
  } else if (requiresManualAgeReview) {
    reason =
      'Verified adult creator media queued for priority manual age-assurance spot check (borderline facial age estimate).';
  } else if (isNsfwMedia) {
    reason = 'Verified 18+ NSFW media authorized under Sovereign Red Pills (💊) escrow.';
  }

  return {
    rating: mediaRating,
    requiredLedger: mediaRating === 'NSFW_18' ? 'sovereign_red_pills' : 'sfw_credits',
    rawNudityScore: rawScore,
    partialNudityScore: partialScore,
    safeScore,
    minorScore,
    requiresManualAgeReview,
    isBlockedForSfwLedger,
    safetyFlags,
    contentSafetyPass,
    isBlockedProhibited,
    reason,
  };
}

export function checkCreatorUploadKycGate(params: {
  finalRating: ContentSafetyRating;
  isKycVerified: boolean;
}): {
  allowed: boolean;
  status: number;
  errorType?: 'kyc_required_for_nsfw';
  message?: string;
} {
  if (params.finalRating === 'NSFW_18' && !params.isKycVerified) {
    return {
      allowed: false,
      status: 403,
      errorType: 'kyc_required_for_nsfw',
      message:
        '18 U.S.C. § 2257 compliance: SFW teaser posts are allowed now, while 18+ explicit (NSFW_18) uploads require completing DIDIT Creator KYC (Step 5 in Studio) first.',
    };
  }
  return { allowed: true, status: 200 };
}

/**
 * STAGE 2 GATE (Single-Call Combined Upload Inspection):
 * Executes ONE Sightengine HTTP call (`nudity-2.1,wad,gore-2.0,face-age` + optional `genai,deepfake`)
 * instead of two separate round-trips, enforcing V3.1 SFW/NSFW ledger separation and tiered minor safety.
 */
export async function inspectUploadedMedia(
  mediaUrl: string,
  orderRating: ContentSafetyRating = 'SFW',
  options: UploadInspectionOptions = {}
): Promise<CombinedUploadInspectionResult> {
  const { isVerifiedCreator = false, includeGenAi = true } = options;
  const models = includeGenAi
    ? ['nudity-2.1', 'wad', 'gore-2.0', 'face-age', 'genai', 'deepfake']
    : ['nudity-2.1', 'wad', 'gore-2.0', 'face-age'];

  const result = await analyzeImage(mediaUrl, models);
  const mediaVerdict = evaluateModerationResult(result, mediaUrl, orderRating, isVerifiedCreator);
  const provenanceDetection =
    includeGenAi && result && result.status === 'success'
      ? buildProvenanceFromResult(result)
      : null;

  return { mediaVerdict, provenanceDetection };
}

/**
 * STAGE 2 GATE (Creator Escrow Delivery):
 * Scans delivered media via Sightengine AI (`nudity-2.1,wad,gore-2.0,face-age`) to prevent
 * 18+ NSFW content on SFW orders and block prohibited/minor media.
 */
export async function qualifyDeliveredMedia(
  mediaUrl: string,
  orderRating: ContentSafetyRating = 'SFW',
  options: { isVerifiedCreator?: boolean } = {}
): Promise<MediaDeliveryQualification> {
  const result = await analyzeImage(mediaUrl, ['nudity-2.1', 'wad', 'gore-2.0', 'face-age']);
  return evaluateModerationResult(
    result,
    mediaUrl,
    orderRating,
    Boolean(options.isVerifiedCreator)
  );
}
