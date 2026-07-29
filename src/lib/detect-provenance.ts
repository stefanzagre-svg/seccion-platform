// ─── AI Content Provenance Auto-Detection Service ──────────────────────────────
// Stub for Phase 1: Hive Moderation API + C2PA Content Credentials verification.
// This module provides the interface for auto-detecting AI-generated content.
// Actual API integration requires HIVE_API_KEY environment variable.
// ────────────────────────────────────────────────────────────────────────────────

import type { ProvenanceLevel, AutoDetectionResult } from './content-provenance';
import { suggestProvenanceFromDetection } from './content-provenance';

// ─── Hive Moderation API Integration ────────────────────────────────────────────

interface HiveApiResponse {
  status: { code: number; message: string };
  output: Array<{
    classes: Array<{
      class: string;    // 'ai_generated', 'not_ai_generated'
      score: number;    // 0.0–1.0
    }>;
    models?: Array<{
      model: string;    // e.g., 'midjourney', 'dall-e', 'stable-diffusion'
      score: number;
    }>;
  }>;
}

/**
 * Detect whether uploaded media is AI-generated using the Hive Moderation API.
 *
 * @param mediaUrl - The public URL of the media to analyze
 * @param mediaType - The type of media ('image' | 'video' | 'audio')
 * @returns Detection result with confidence score and suggested provenance level,
 *          or null if the API is unavailable.
 */
export async function detectContentProvenance(
  mediaUrl: string,
  mediaType: 'image' | 'video' | 'audio',
): Promise<AutoDetectionResult | null> {
  const hiveApiKey = process.env.HIVE_API_KEY;

  if (!hiveApiKey) {
    console.warn('[Provenance Detection] HIVE_API_KEY not configured. Skipping auto-detection.');
    return null;
  }

  try {
    const response = await fetch('https://api.thehive.ai/api/v2/task/sync', {
      method: 'POST',
      headers: {
        Authorization: `Token ${hiveApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: mediaUrl,
        // Hive's AI-generated content detection model
        models: { ai_generated_media_detection: {} },
      }),
    });

    if (!response.ok) {
      console.warn(`[Provenance Detection] Hive API returned ${response.status}`);
      return null;
    }

    const data: HiveApiResponse = await response.json();
    const output = data.output?.[0];

    if (!output?.classes?.length) {
      return null;
    }

    // Extract AI-generated confidence score
    const aiClass = output.classes.find((c) => c.class === 'ai_generated');
    const confidence = aiClass ? Math.round(aiClass.score * 100) : 0;

    // Identify source model if available
    const topModel = output.models
      ?.sort((a, b) => b.score - a.score)?.[0];

    const suggestedLevel = suggestProvenanceFromDetection(confidence);

    return {
      isAiGenerated: confidence > 50,
      confidence,
      detectedModel: topModel?.model,
      suggestedLevel: suggestedLevel ?? 'genuine',
      source: 'hive',
      checkedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error('[Provenance Detection] Hive API error:', error);
    return null;
  }
}

// ─── C2PA Content Credentials Verification ──────────────────────────────────────

export interface C2PAVerificationResult {
  hasManifest: boolean;
  isValid: boolean;
  signer?: string;               // e.g., 'Adobe Photoshop', 'Sony Camera'
  digitalSourceType?: string;     // e.g., 'trainedAlgorithmicMedia', 'digitalCapture'
  assertions?: string[];
  timestamp?: string;
}

/**
 * Verify C2PA Content Credentials in a media file.
 *
 * Phase 1: Stub — returns null (C2PA integration requires @contentauth/c2pa-web
 * or c2pa-node server-side library).
 *
 * Phase 2: Will use c2pa-node to extract and validate manifests, checking the
 * official C2PA Trust List for certificate validation.
 *
 * @param _mediaBuffer - The raw media file buffer
 * @returns C2PA verification result or null if no manifest found
 */
export async function verifyC2PA(
  _mediaBuffer: Buffer,
): Promise<C2PAVerificationResult | null> {
  // Phase 1: Stub — C2PA integration planned for Phase 2
  // Will require: npm install c2pa-node
  // Implementation will:
  //   1. Extract C2PA manifest from media
  //   2. Validate certificate chain against C2PA Trust List
  //   3. Check digitalSourceType assertion
  //   4. Return structured verification result
  console.info('[C2PA] Content Credentials verification not yet implemented (Phase 2).');
  return null;
}

/**
 * Run the full auto-detection pipeline on uploaded content.
 * Tries C2PA first (cryptographic proof), falls back to Hive (probabilistic).
 */
export async function runAutoDetection(
  mediaUrl: string,
  mediaType: 'image' | 'video' | 'audio',
  mediaBuffer?: Buffer,
): Promise<AutoDetectionResult | null> {
  // Phase 1: C2PA check (if buffer is available)
  if (mediaBuffer) {
    const c2paResult = await verifyC2PA(mediaBuffer);
    if (c2paResult?.hasManifest && c2paResult.isValid) {
      // C2PA provides cryptographic proof — map to provenance level
      const isAiSource =
        c2paResult.digitalSourceType === 'trainedAlgorithmicMedia' ||
        c2paResult.digitalSourceType === 'algorithmicMedia';

      return {
        isAiGenerated: isAiSource,
        confidence: 99, // C2PA is cryptographic, near-certain
        suggestedLevel: isAiSource ? 'ai_generated' : 'genuine',
        source: 'c2pa',
        checkedAt: new Date().toISOString(),
      };
    }
  }

  // Phase 2: Fall back to Hive probabilistic detection
  return detectContentProvenance(mediaUrl, mediaType);
}
