/**
 * Creator & Member Rating Engine — Session Platform
 * ───────────────────────────────────────────────────
 * Implements a high-fidelity rating score out of 20.00.
 * Includes eligibility gates and dynamic decay averaging.
 */

// Exponential decay constant: newer ratings weigh more
const DECAY_ALPHA = 0.85;

export interface RaterProfile {
  id: string;
  role: 'member' | 'creator';
  is_kyc_verified?: boolean;
}

export interface RateeProfile {
  id: string;
  role: 'member' | 'creator';
  is_kyc_verified?: boolean;
  engagement_score?: number;
  engagementScore?: number;
}

/**
 * Checks if a rater is eligible to rate a ratee based on Session platform rules.
 */
export function canRate(
  rater: RaterProfile,
  ratee: RateeProfile,
  relationshipLevelIndex: number, // 0 to 7. Index 3 is "Its complicated", index 2 is "Casual friend"
  hasSubscription: boolean // For member rating creator (VIP/Master check)
): boolean {
  if (!rater || !ratee) return false;

  // Rule 4: Creators cannot rate other creators
  if (rater.role === 'creator' && ratee.role === 'creator') {
    return false;
  }

  // Rule 1 & 2: Member rating a Creator
  if (ratee.role === 'creator') {
    // Only members with VIP or Master subscription can rate creators
    return rater.role === 'member' && hasSubscription;
  }

  // Rule 3: Rating a Member (both Creator-to-Member and Member-to-Member)
  if (ratee.role === 'member') {
    // Must be matched and relationship level must be >= 3 ("Its complicated" or higher)
    return relationshipLevelIndex >= 3;
  }

  return false;
}

/**
 * Calculates a dynamically weighted average score from a list of rating scores.
 * Ratings should be sorted from newest to oldest.
 */
export function calculateDynamicRating(scores: number[]): number {
  if (!scores || scores.length === 0) return 0;

  let weightedSum = 0;
  let weightTotal = 0;

  for (let i = 0; i < scores.length; i++) {
    const weight = Math.pow(DECAY_ALPHA, i);
    weightedSum += scores[i] * weight;
    weightTotal += weight;
  }

  return weightedSum / weightTotal;
}

/**
 * Computes base score for a Creator (Max 17.00)
 */
export function getCreatorBaseScore(profile: Record<string, unknown>): number {
  const base = 10.00;
  
  // Engagement contribution (Max 5.00): e.g. score of 100 = 5.00
  const engScore = Number(profile?.engagement_score || profile?.engagementScore || 60);
  const engagementContribution = (engScore / 100) * 5.00;

  // KYC verification bonus (Max 2.00): mandatory for active creators
  const isKyc = profile?.is_kyc_verified || profile?.isKycVerified || false;
  const kycBonus = isKyc ? 2.00 : 0.00;

  return base + engagementContribution + kycBonus;
}

/**
 * Computes base score for a Member (Max 17.00)
 */
export function getMemberBaseScore(profile: Record<string, unknown>, avgChemistry = 75): number {
  const base = 10.00;

  // KYC concern bonus (Max 3.00): shows commitment to verification and safety
  const isKyc = profile?.is_kyc_verified || profile?.isKycVerified || false;
  const kycBonus = isKyc ? 3.00 : 0.00;

  // Chemistry contribution (Max 4.00): based on average matched compatibility
  const chemistryContribution = (avgChemistry / 100) * 4.00;

  return base + kycBonus + chemistryContribution;
}

/**
 * Calculates creator's overall rating score (10.00 - 20.00)
 * Uses dynamic reviews if available, combined with creator base metrics.
 */
export function calculateCreatorRating(profile: Record<string, unknown>, ratingScores: number[] = []): number {
  const baseScore = getCreatorBaseScore(profile);

  if (ratingScores.length === 0) {
    // Default fallback rating (base score + default 3.00, capped at 20.00)
    return Math.min(20.00, parseFloat((baseScore + 3.00).toFixed(2)));
  }

  const dynamicAvg = calculateDynamicRating(ratingScores);
  
  // Weighted: 40% Base Profile Metrics, 60% dynamic fan ratings
  const finalScore = baseScore * 0.4 + dynamicAvg * 0.6;

  return Math.min(20.00, Math.max(10.00, parseFloat(finalScore.toFixed(2))));
}

/**
 * Calculates member's overall rating score (10.00 - 20.00)
 */
export function calculateMemberRating(
  profile: Record<string, unknown>,
  avgChemistry = 75,
  ratingScores: number[] = []
): number {
  const baseScore = getMemberBaseScore(profile, avgChemistry);

  if (ratingScores.length === 0) {
    return Math.min(20.00, parseFloat(baseScore.toFixed(2)));
  }

  const dynamicAvg = calculateDynamicRating(ratingScores);

  // Weighted: 40% Base Profile Metrics, 60% dynamic peer ratings
  const finalScore = baseScore * 0.4 + dynamicAvg * 0.6;

  return Math.min(20.00, Math.max(10.00, parseFloat(finalScore.toFixed(2))));
}
