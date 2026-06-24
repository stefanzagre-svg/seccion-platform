/**
 * Match Engine v2 — Project Fusion / Session
 *
 * Multi-Signal Scoring Pipeline
 * ─────────────────────────────────────────────
 * 6-dimensional compatibility system that integrates archetype chemistry,
 * lifestyle sync, hobby overlap, mood/passion resonance, temporal engagement
 * signals, and geo-proximity into a unified score.
 *
 * Hard blockers gate the pipeline — if any fire, score = 0 immediately.
 * Otherwise, each signal layer contributes a weighted share to the final score.
 *
 * Score range: 0–100
 */

import { FREQUENCY_LEVELS, ARCHETYPE_PROFILES, type ArchetypeId } from './constants';
import type { MoodId, PassionId } from './constants';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface UserProfile {
  gender: string;
  location: string;
  hobbies: string[];
  lifestyle: Record<string, string>;
  relationshipGoal: string;
  relationshipType: string;
  sexualPreferences: string[];
  familyGoals: string;
  /** Archetype from onboarding Stage 2 */
  archetype?: ArchetypeId;
  /** Selected moods from onboarding Stage 1 vibe check */
  moods?: MoodId[];
  /** Core passion from onboarding Stage 1 */
  corePassion?: PassionId;
  /** User's age (for future age-range filtering) */
  age?: number;
  /** City/region origin string */
  origins?: string;
  /** KYC verification status */
  isKycVerified?: boolean;
  /** Active Master Subscriber */
  isMasterSubscriber?: boolean;
  /** ISO timestamp of last platform activity */
  lastActiveAt?: string;
  /** Platform-computed engagement quality score (0–100) */
  engagementScore?: number;
  /** AI analyzed narrative vectors from profile prompts */
  bioAnalysis?: {
    Emotional_Vector?: {
      Vulnerability_Score?: number;
      Defensive_Score?: number;
      Idealization_Bias?: number;
    };
    Interaction_Style?: {
      Directness?: string;
      Witty?: string;
      Introspective?: string;
    };
    Behavioral_Pattern?: {
      Investment_Driver?: string[];
      Red_Flags?: string[];
    };
  };
}

export interface MatchBreakdown {
  archetypeChemistry: number;  // 0–100
  lifestyleSync: number;       // 0–100
  hobbyOverlap: number;        // 0–100
  moodResonance: number;       // 0–100
  temporalSignal: number;      // 0–100
  geoProximity: number;        // 0–100
  narrativeResonance: number;  // 0–100
}

export type CompatibilityTier =
  | 'soul_aligned'   // 85–100
  | 'high_spark'     // 65–84
  | 'moderate'       // 40–64
  | 'low'            // 1–39
  | 'blocked';       // 0

export interface MatchExplanationElement {
  factor: string;
  score: number;
  impact: 'positive' | 'negative' | 'neutral';
  description: string;
}

export interface MatchResult {
  totalScore: number;
  breakdown: MatchBreakdown;
  hardBlockerHit: string | null;
  compatibilityTier: CompatibilityTier;
  /** Human-readable reason for the tier classification */
  tierReason: string;
  explanation?: MatchExplanationElement[];
}

export interface RankedCandidate {
  profile: UserProfile;
  id: string;
  result: MatchResult;
}

// ─── Signal Weights ──────────────────────────────────────────────────────────

export const SIGNAL_WEIGHTS = {
  archetypeChemistry: 0.15,
  lifestyleSync:      0.20,
  hobbyOverlap:       0.10,
  moodResonance:      0.15,
  temporalSignal:     0.15,
  geoProximity:       0.10,
  narrativeResonance: 0.15,
} as const;

// ─── Archetype Chemistry Matrix (6×6) ────────────────────────────────────────
//
// Each cell is a 0.0–1.0 chemistry score between two archetypes.
// Diagonal = same-type (moderate — similar but lacks polarity).
// Off-diagonal = complementary pairs score highest.
//
// Psychology basis:
//   Caregiver ↔ Dreamer : Nurture meets vision → 0.90
//   Caregiver ↔ Protector : Shared stability → 0.85
//   Rebel ↔ Explorer : Shared adventure → 0.88
//   Visionary ↔ Rebel : Ambition meets boldness → 0.82
//   Dreamer ↔ Explorer : Imagination meets curiosity → 0.85
//   Protector ↔ Visionary : Loyalty meets strategy → 0.80

export const ARCHETYPE_CHEMISTRY: Record<ArchetypeId, Record<ArchetypeId, number>> = {
  caregiver: {
    caregiver:  0.65,
    rebel:      0.45,
    dreamer:    0.90,
    visionary:  0.60,
    protector:  0.85,
    explorer:   0.50,
  },
  rebel: {
    caregiver:  0.45,
    rebel:      0.70,
    dreamer:    0.72,
    visionary:  0.82,
    protector:  0.40,
    explorer:   0.88,
  },
  dreamer: {
    caregiver:  0.90,
    rebel:      0.72,
    dreamer:    0.60,
    visionary:  0.75,
    protector:  0.68,
    explorer:   0.85,
  },
  visionary: {
    caregiver:  0.60,
    rebel:      0.82,
    dreamer:    0.75,
    visionary:  0.65,
    protector:  0.80,
    explorer:   0.70,
  },
  protector: {
    caregiver:  0.85,
    rebel:      0.40,
    dreamer:    0.68,
    visionary:  0.80,
    protector:  0.60,
    explorer:   0.55,
  },
  explorer: {
    caregiver:  0.50,
    rebel:      0.88,
    dreamer:    0.85,
    visionary:  0.70,
    protector:  0.55,
    explorer:   0.62,
  },
};

// ─── Tier Classification ─────────────────────────────────────────────────────

function classifyTier(score: number): CompatibilityTier {
  if (score <= 0)  return 'blocked';
  if (score < 40)  return 'low';
  if (score < 65)  return 'moderate';
  if (score < 85)  return 'high_spark';
  return 'soul_aligned';
}

const TIER_REASONS: Record<CompatibilityTier, string> = {
  soul_aligned: 'Exceptional multi-signal alignment across archetypes, lifestyle, and engagement.',
  high_spark:   'Strong compatibility with promising overlap — high potential for deep connection.',
  moderate:     'Shared interests present but key lifestyle or archetype gaps reduce signal strength.',
  low:          'Minimal overlap detected — significant divergence in core values or lifestyle.',
  blocked:      'Fundamental incompatibility detected in relationship goals, preferences, or lifestyle.',
};

// ─── Hard Blockers ───────────────────────────────────────────────────────────

/**
 * Checks if two habits are fundamentally opposed
 */
function isHabitOpposed(habitA: string, habitB: string, category: string): boolean {
  if (!habitA || !habitB) return false;

  const hA = habitA.toLowerCase();
  const hB = habitB.toLowerCase();

  if (category === 'smoking') {
    const smokers = ['regularly', 'socially'];
    const nonSmokers = ['non-smoker', 'trying to quit'];
    if (
      (smokers.includes(hA) && nonSmokers.includes(hB)) ||
      (smokers.includes(hB) && nonSmokers.includes(hA))
    ) {
      return true;
    }
  }

  if (category === 'drinking') {
    const heavyDrinkers = ['most nights', 'regularly'];
    const nonDrinkers = ['never'];
    if (
      (heavyDrinkers.includes(hA) && nonDrinkers.includes(hB)) ||
      (heavyDrinkers.includes(hB) && nonDrinkers.includes(hA))
    ) {
      return true;
    }
  }

  return false;
}

function checkHardBlockers(userA: UserProfile, userB: UserProfile): string | null {
  // 1. Sexual Preference Gate
  const prefA = (userA.sexualPreferences || []).map(s => s.toLowerCase());
  const prefB = (userB.sexualPreferences || []).map(s => s.toLowerCase());
  const genderA = (userA.gender || '').toLowerCase();
  const genderB = (userB.gender || '').toLowerCase();

  const openPrefs = ['everyone', 'open to exploring', 'pansexual', 'bisexual', 'queer'];

  if (prefA.length > 0 && !prefA.some(p => openPrefs.includes(p)) && !prefA.includes(genderB)) {
    return 'sexual_preference_mismatch';
  }
  if (prefB.length > 0 && !prefB.some(p => openPrefs.includes(p)) && !prefB.includes(genderA)) {
    return 'sexual_preference_mismatch';
  }

  // 2. Relationship Goals
  const goalsA = (userA.relationshipGoal || '').toLowerCase();
  const goalsB = (userB.relationshipGoal || '').toLowerCase();
  const flexGoals = ['open to possibilities', 'not sure yet', 'still figuring it out', 'new friends'];

  if (goalsA !== goalsB && !flexGoals.includes(goalsA) && !flexGoals.includes(goalsB)) {
    if (
      (goalsA.includes('short') && goalsB.includes('long')) ||
      (goalsA.includes('long') && goalsB.includes('short'))
    ) {
      if (!goalsA.includes('open to') && !goalsB.includes('open to')) {
        return 'relationship_goal_conflict';
      }
    }
  }

  // 3. Relationship Type
  const typeA = (userA.relationshipType || '').toLowerCase();
  const typeB = (userB.relationshipType || '').toLowerCase();
  if (typeA !== typeB) {
    const openTypes = ['polyamorous', 'open relationship'];
    if (
      (typeA === 'monogamous' && openTypes.includes(typeB)) ||
      (typeB === 'monogamous' && openTypes.includes(typeA))
    ) {
      return 'relationship_type_conflict';
    }
  }

  // 4. Family Goals
  const famA = (userA.familyGoals || '').toLowerCase();
  const famB = (userB.familyGoals || '').toLowerCase();
  const famConflict =
    (famA.includes('want') && !famA.includes("don't") && famB.includes("don't want")) ||
    (famB.includes('want') && !famB.includes("don't") && famA.includes("don't want"));
  if (famConflict) return 'family_goals_conflict';

  // 5. Smoking / Drinking Opposition
  const lifestyleA = Object.fromEntries(
    Object.entries(userA.lifestyle || {}).map(([k, v]) => [k.toLowerCase(), v])
  );
  const lifestyleB = Object.fromEntries(
    Object.entries(userB.lifestyle || {}).map(([k, v]) => [k.toLowerCase(), v])
  );

  if (isHabitOpposed(lifestyleA['smoking'], lifestyleB['smoking'], 'smoking')) {
    return 'smoking_lifestyle_conflict';
  }
  if (isHabitOpposed(lifestyleA['drinking'], lifestyleB['drinking'], 'drinking')) {
    return 'drinking_lifestyle_conflict';
  }

  return null;
}

// ─── Signal Layer Functions ──────────────────────────────────────────────────

/**
 * Layer 1: Archetype Chemistry (0–100)
 * Uses the 6×6 matrix. Falls back to 50 if either archetype is unknown.
 */
function scoreArchetypeChemistry(userA: UserProfile, userB: UserProfile): number {
  if (!userA.archetype || !userB.archetype) return 50; // neutral fallback

  const chemistry = ARCHETYPE_CHEMISTRY[userA.archetype]?.[userB.archetype];
  if (chemistry === undefined) return 50;

  return Math.round(chemistry * 100);
}

/**
 * Layer 2: Lifestyle Synchronization (0–100)
 * Compares habit frequency levels with normalized distance scoring.
 */
function scoreLifestyleSync(userA: UserProfile, userB: UserProfile): number {
  const lifestyleA = Object.fromEntries(
    Object.entries(userA.lifestyle || {}).map(([k, v]) => [k.toLowerCase(), v])
  );
  const lifestyleB = Object.fromEntries(
    Object.entries(userB.lifestyle || {}).map(([k, v]) => [k.toLowerCase(), v])
  );

  const allCategories = Array.from(
    new Set([...Object.keys(lifestyleA), ...Object.keys(lifestyleB)])
  );

  let totalScore = 0;
  let categoryCount = 0;

  for (const cat of allCategories) {
    if (lifestyleA[cat] && lifestyleB[cat]) {
      categoryCount++;
      const levelA = FREQUENCY_LEVELS[lifestyleA[cat]] ?? 0;
      const levelB = FREQUENCY_LEVELS[lifestyleB[cat]] ?? 0;
      const diff = Math.abs(levelA - levelB);
      // Max diff is 3 — normalize to 0–1, invert so close = high
      totalScore += Math.max(0, (3 - diff) / 3);
    }
  }

  if (categoryCount === 0) return 40; // neutral if no overlap
  return Math.round((totalScore / categoryCount) * 100);
}

/**
 * Layer 3: Hobby Overlap — Jaccard Similarity (0–100)
 */
function scoreHobbyOverlap(userA: UserProfile, userB: UserProfile): number {
  const setA = new Set((userA.hobbies || []).map(h => h.toLowerCase()));
  const setB = new Set((userB.hobbies || []).map(h => h.toLowerCase()));

  if (setA.size === 0 && setB.size === 0) return 40; // neutral

  const intersection = new Set([...setA].filter(x => setB.has(x)));
  const union = new Set([...setA, ...setB]);

  return Math.round((intersection.size / union.size) * 100);
}

/**
 * Layer 4: Mood & Passion Resonance (0–100)
 * Compares selected moods (vibe check) and core passion alignment.
 */
function scoreMoodResonance(userA: UserProfile, userB: UserProfile): number {
  let score = 0;
  let signals = 0;

  // Mood overlap (Jaccard on mood arrays)
  const moodsA = userA.moods || [];
  const moodsB = userB.moods || [];

  if (moodsA.length > 0 && moodsB.length > 0) {
    signals++;
    const setA = new Set(moodsA);
    const setB = new Set(moodsB);
    const intersection = [...setA].filter(x => setB.has(x));
    const union = new Set([...setA, ...setB]);
    score += (intersection.length / union.size) * 100;
  }

  // Core passion match (exact = 100, different = 30, missing = neutral 50)
  if (userA.corePassion && userB.corePassion) {
    signals++;
    score += userA.corePassion === userB.corePassion ? 100 : 30;
  }

  if (signals === 0) return 45; // neutral fallback
  return Math.round(score / signals);
}

/**
 * Layer 5: Temporal & Engagement Signals (0–100)
 * Recency bonus: active within 24h = 100, 7d = 70, 30d = 40, older = 10.
 * Combined with the engagement quality score if available.
 */
function scoreTemporalSignal(userA: UserProfile, userB: UserProfile): number {
  // We score the *candidate* (userB) — how active/engaged are they?
  let recencyScore = 50; // default if no timestamp

  if (userB.lastActiveAt) {
    const now = Date.now();
    const lastActive = new Date(userB.lastActiveAt).getTime();
    const hoursSince = (now - lastActive) / (1000 * 60 * 60);

    if (hoursSince <= 24) recencyScore = 100;
    else if (hoursSince <= 24 * 3) recencyScore = 85;
    else if (hoursSince <= 24 * 7) recencyScore = 70;
    else if (hoursSince <= 24 * 14) recencyScore = 50;
    else if (hoursSince <= 24 * 30) recencyScore = 30;
    else recencyScore = 10;
  }

  // Engagement quality (0–100, from platform analytics)
  const engagementScore = userB.engagementScore ?? 50;

  // Weighted: 60% recency, 40% engagement quality
  return Math.round(recencyScore * 0.6 + engagementScore * 0.4);
}

/**
 * Layer 6: Geo-Proximity (0–100)
 * Same location = 100, different + no long-distance support = 30, missing = 60.
 */
function scoreGeoProximity(userA: UserProfile, userB: UserProfile): number {
  const locA = (userA.location || userA.origins || '').toLowerCase().trim();
  const locB = (userB.location || userB.origins || '').toLowerCase().trim();

  // Both missing — neutral
  if (!locA || !locB) return 60;

  // Same city/region
  if (locA === locB) return 100;

  // Different location — check if either supports long-distance
  const typeA = (userA.relationshipType || '').toLowerCase();
  const typeB = (userB.relationshipType || '').toLowerCase();

  if (typeA.includes('distant') || typeB.includes('distant')) return 70;

  // Mild penalty for geographic mismatch
  return 35;
}

/**
 * Layer 7: Narrative Resonance (0–100)
 * Compares user response vectors analyzed by AI. Falls back to 50 if missing.
 */
function scoreNarrativeResonance(userA: UserProfile, userB: UserProfile): number {
  const analysisA = userA.bioAnalysis;
  const analysisB = userB.bioAnalysis;

  if (!analysisA || !analysisB || !analysisA.Emotional_Vector || !analysisB.Emotional_Vector) {
    return 50; // Neutral fallback
  }

  const evA = analysisA.Emotional_Vector;
  const evB = analysisB.Emotional_Vector;

  const vulnA = evA.Vulnerability_Score ?? 0.5;
  const vulnB = evB.Vulnerability_Score ?? 0.5;
  const defA = evA.Defensive_Score ?? 0.5;
  const defB = evB.Defensive_Score ?? 0.5;
  const idealA = evA.Idealization_Bias ?? 0.5;
  const idealB = evB.Idealization_Bias ?? 0.5;

  // 1. Vulnerability: Similarity and high scores are rewarded
  const vulnScore = (1.0 - Math.abs(vulnA - vulnB)) * 60 + ((vulnA + vulnB) / 2) * 40;

  // 2. Defensiveness Friction: High defensiveness drag
  const avgDef = (defA + defB) / 2;
  const defScore = (1.0 - avgDef) * 100;

  // 3. Introspection Resonance: Average introspection depth
  const mapIntro = (val?: string) => {
    switch (val?.toLowerCase()) {
      case 'very high': return 1.0;
      case 'high': return 0.8;
      case 'moderate': return 0.6;
      case 'low': return 0.3;
      default: return 0.5;
    }
  };
  const introA = mapIntro(analysisA.Interaction_Style?.Introspective);
  const introB = mapIntro(analysisB.Interaction_Style?.Introspective);
  const introScore = ((introA + introB) / 2) * 100;

  // 4. Behavioral Pattern motivates alignment
  const driversA = new Set((analysisA.Behavioral_Pattern?.Investment_Driver || []).map(d => d.toLowerCase()));
  const driversB = new Set((analysisB.Behavioral_Pattern?.Investment_Driver || []).map(d => d.toLowerCase()));
  let driverScore = 50; // Neutral
  if (driversA.size > 0 && driversB.size > 0) {
    const intersection = [...driversA].filter(d => driversB.has(d));
    const union = new Set([...driversA, ...driversB]);
    driverScore = (intersection.length / union.size) * 100;
  }

  // Calculate weighted Narrative Resonance
  // 30% Vulnerability, 30% Introspection, 20% Defensiveness, 20% Motivations/Drivers
  const resonanceScore = Math.round(
    vulnScore * 0.30 +
    introScore * 0.30 +
    defScore * 0.20 +
    driverScore * 0.20
  );

  return Math.max(10, Math.min(100, resonanceScore));
}

// ─── Main Scoring Pipeline ───────────────────────────────────────────────────

/**
 * Calculates the full match result between two users.
 * Returns a MatchResult with breakdown, tier, and hard-blocker info.
 */
export function calculateMatch(userA: UserProfile, userB: UserProfile): MatchResult {
  if (!userA || !userB) {
    return {
      totalScore: 0,
      breakdown: {
        archetypeChemistry: 0,
        lifestyleSync: 0,
        hobbyOverlap: 0,
        moodResonance: 0,
        temporalSignal: 0,
        geoProximity: 0,
        narrativeResonance: 0,
      },
      hardBlockerHit: 'missing_profile',
      compatibilityTier: 'blocked',
      tierReason: TIER_REASONS['blocked'],
    };
  }

  // Gate: Hard blockers
  const blocker = checkHardBlockers(userA, userB);
  if (blocker) {
    return {
      totalScore: 0,
      breakdown: {
        archetypeChemistry: 0,
        lifestyleSync: 0,
        hobbyOverlap: 0,
        moodResonance: 0,
        temporalSignal: 0,
        geoProximity: 0,
        narrativeResonance: 0,
      },
      hardBlockerHit: blocker,
      compatibilityTier: 'blocked',
      tierReason: TIER_REASONS['blocked'],
    };
  }

  // Score each signal layer (0–100)
  const breakdown: MatchBreakdown = {
    archetypeChemistry: scoreArchetypeChemistry(userA, userB),
    lifestyleSync:      scoreLifestyleSync(userA, userB),
    hobbyOverlap:       scoreHobbyOverlap(userA, userB),
    moodResonance:      scoreMoodResonance(userA, userB),
    temporalSignal:     scoreTemporalSignal(userA, userB),
    geoProximity:       scoreGeoProximity(userA, userB),
    narrativeResonance: scoreNarrativeResonance(userA, userB),
  };

  // Weighted sum → final 0–100 score
  const totalScore = Math.min(100, Math.round(
    breakdown.archetypeChemistry * SIGNAL_WEIGHTS.archetypeChemistry +
    breakdown.lifestyleSync      * SIGNAL_WEIGHTS.lifestyleSync +
    breakdown.hobbyOverlap       * SIGNAL_WEIGHTS.hobbyOverlap +
    breakdown.moodResonance      * SIGNAL_WEIGHTS.moodResonance +
    breakdown.temporalSignal     * SIGNAL_WEIGHTS.temporalSignal +
    breakdown.geoProximity       * SIGNAL_WEIGHTS.geoProximity +
    breakdown.narrativeResonance * SIGNAL_WEIGHTS.narrativeResonance
  ));

  const tier = classifyTier(totalScore);

  const explanation: MatchExplanationElement[] = [
    {
      factor: 'Archetype Chemistry',
      score: breakdown.archetypeChemistry,
      impact: breakdown.archetypeChemistry >= 75 ? 'positive' : breakdown.archetypeChemistry < 50 ? 'negative' : 'neutral',
      description: getChemistryNarrative(userA.archetype, userB.archetype)
    },
    {
      factor: 'Lifestyle Synchronization',
      score: breakdown.lifestyleSync,
      impact: breakdown.lifestyleSync >= 70 ? 'positive' : breakdown.lifestyleSync < 50 ? 'negative' : 'neutral',
      description: breakdown.lifestyleSync >= 70 
        ? 'Outstanding sync in daily routines, sleep habits, and social schedules.'
        : breakdown.lifestyleSync < 50 
          ? 'Divergence in key daily routines or habits which may require adjustment.'
          : 'Moderate lifestyle coordination with minor routine gaps.'
    },
    {
      factor: 'Vibe & Passion Resonance',
      score: breakdown.moodResonance,
      impact: breakdown.moodResonance >= 70 ? 'positive' : breakdown.moodResonance < 45 ? 'negative' : 'neutral',
      description: userA.corePassion && userB.corePassion && userA.corePassion === userB.corePassion
        ? `Exceptional alignment centered around your shared core passion for ${userA.corePassion}.`
        : 'Harmonious emotional moods and complementary connection goals.'
    },
    {
      factor: 'Geographic Proximity',
      score: breakdown.geoProximity,
      impact: breakdown.geoProximity >= 80 ? 'positive' : breakdown.geoProximity < 40 ? 'negative' : 'neutral',
      description: breakdown.geoProximity >= 80 
        ? `Both located in ${userA.location || 'the same region'}, facilitating effortless offline meetups.`
        : 'Geographic distance detected; may require long-distance relationship pacing.'
    },
    {
      factor: 'Personality Resonance',
      score: breakdown.narrativeResonance,
      impact: breakdown.narrativeResonance >= 75 ? 'positive' : breakdown.narrativeResonance < 50 ? 'negative' : 'neutral',
      description: breakdown.narrativeResonance >= 75
        ? 'Deep emotional compatibility: highly introspective alignment with healthy vulnerability patterns.'
        : breakdown.narrativeResonance < 50
          ? 'Noticeable friction in connection pacing or emotional availability styles.'
          : 'Healthy relational alignment with balanced communication styles.'
    }
  ];

  return {
    totalScore,
    breakdown,
    hardBlockerHit: null,
    compatibilityTier: tier,
    tierReason: TIER_REASONS[tier],
    explanation
  };
}

// ─── Batch Ranking ───────────────────────────────────────────────────────────

/**
 * Scores, ranks, and returns the top-N candidates for the current user.
 */
export function rankCandidates(
  currentUser: UserProfile,
  candidates: Array<{ id: string; profile: UserProfile }>,
  limit = 10
): RankedCandidate[] {
  const scored = candidates.map((c) => ({
    profile: c.profile,
    id: c.id,
    result: calculateMatch(currentUser, c.profile),
  }));

  // Filter out blocked matches, sort by total score descending
  return scored
    .filter((s) => s.result.compatibilityTier !== 'blocked')
    .sort((a, b) => b.result.totalScore - a.result.totalScore)
    .slice(0, limit);
}

// ─── Backward Compatibility ──────────────────────────────────────────────────

/**
 * Legacy function — returns a single 0–100 number.
 * Kept for backward compatibility with existing callers.
 * @deprecated Use `calculateMatch()` for the full MatchResult.
 */
export function calculateMatchProbability(userA: UserProfile, userB: UserProfile): number {
  return calculateMatch(userA, userB).totalScore;
}

// ─── Tier Metadata (for UI rendering) ────────────────────────────────────────

export const TIER_META: Record<CompatibilityTier, {
  label: string;
  color: string;
  emoji: string;
  glowColor: string;
}> = {
  soul_aligned: {
    label: 'Soul Aligned',
    color: '#DC2626',
    emoji: '💎',
    glowColor: 'rgba(220, 38, 38, 0.4)',
  },
  high_spark: {
    label: 'High Spark',
    color: '#F97316',
    emoji: '⚡',
    glowColor: 'rgba(249, 115, 22, 0.4)',
  },
  moderate: {
    label: 'Moderate',
    color: '#F59E0B',
    emoji: '🔆',
    glowColor: 'rgba(245, 158, 11, 0.4)',
  },
  low: {
    label: 'Low Signal',
    color: '#6B7280',
    emoji: '🌫️',
    glowColor: 'rgba(107, 114, 128, 0.4)',
  },
  blocked: {
    label: 'Blocked',
    color: '#EF4444',
    emoji: '🚫',
    glowColor: 'rgba(239, 68, 68, 0.4)',
  },
};

// ─── Archetype Metadata Helpers ──────────────────────────────────────────────

/**
 * Returns a human-readable description of the chemistry between two archetypes.
 */
export function getChemistryNarrative(archA?: ArchetypeId, archB?: ArchetypeId): string {
  if (!archA || !archB) return 'Archetype data not yet available for this connection.';

  const chemistry = ARCHETYPE_CHEMISTRY[archA]?.[archB] ?? 0.5;
  const nameA = ARCHETYPE_PROFILES[archA].name;
  const nameB = ARCHETYPE_PROFILES[archB].name;

  if (chemistry >= 0.85) {
    return `${nameA} and ${nameB} share extraordinary chemistry — a rare complementary bond where each amplifies the other's strengths.`;
  }
  if (chemistry >= 0.70) {
    return `${nameA} and ${nameB} have strong natural chemistry. Their distinct energies create a dynamic, engaging connection.`;
  }
  if (chemistry >= 0.55) {
    return `${nameA} and ${nameB} have moderate chemistry — their differences can create growth, but alignment requires effort.`;
  }
  return `${nameA} and ${nameB} are fundamentally different in approach. Connection is possible but demands mutual understanding.`;
}
