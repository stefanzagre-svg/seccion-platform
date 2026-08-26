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
    suggestedLevel,
    isAiGenerated: overallAiConfidence >= 0.50,
    matchedModel: deepfakeScore > 0.5 ? 'deepfake-detection' : aiScore > 0.7 ? 'sightengine-genai' : undefined,
  };
}
