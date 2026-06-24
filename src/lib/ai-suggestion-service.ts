/**
 * AI Suggestion Service — Project Fusion / Session
 *
 * Implements the Intelligence Layer (Phase 0 + Phase 2) from the backlog:
 *   AI-SVC-001 – Facade endpoint logic
 *   AI-SVC-002 – LLM integration abstraction (Gemini-ready)
 *   AI-SVC-003 – Prediction prompt logic
 *   AI-SVC-004 – PredictionPayload schema
 *   BE-LOG-001  – Signal prioritisation
 *   BE-LOG-002  – Narrative generation (rule-based + LLM)
 *
 * The service operates in two modes:
 *   1. `local`  – pure client-side, no API call (PME + RLS math only)
 *   2. `remote` – calls POST /api/v2/suggestions/predict, which can delegate to Gemini
 */

import { calculateMatch, calculateMatchProbability, getChemistryNarrative, UserProfile, type MatchResult } from './match-engine';
import { getDualGaugeState, RELATIONSHIP_LEVELS } from './relationship-engine';
import { getQuestState, getUserProfile } from './quest-service';

// ─── Schema ──────────────────────────────────────────────────────────────────

/** Category of insight powering the suggestion */
export type SuggestionCategory =
  | 'high_compatibility'
  | 'momentum_opportunity'
  | 'data_gap_bridge'
  | 'rising_star'
  | 'dormant_spark';

/** The strict output schema (AI-SVC-004) */
export interface PredictionPayload {
  target_id: string;
  score: number;               // 0-100, composite signal strength
  category: SuggestionCategory;
  narrative_insight: string;   // Short teaser (1-2 sentences)
  narrative_detail: string;    // Full reasoning revealed on "Read More"
  suggested_action_id: string; // Maps to a SuggestionMove ID in the RLS
  avatar_url: string;
  username: string;
  match_probability: number;   // Raw PME score
  momentum_score: number;      // Simulated engagement momentum (0-100)
  opportunity_gap: number;     // Distance-to-next-level (0-100)
}

export interface SuggestionRequest {
  user_id: string;
  context_data: {
    current_feed_view: 'all' | 'live' | 'subscribed' | 'matched';
    last_5_interactions: string[];
    quest_stage: number;
    connection_points: number;
  };
  force_refresh?: boolean;
}

export interface SuggestionResponse {
  suggestions: PredictionPayload[];
  generated_at: string;
  model_version: string;
  limit_reached?: boolean;
  error?: string;
}

// ─── Candidate pool (mirrors PlatformFeed mock data) ─────────────────────────

export interface CandidateProfile {
  id: string;
  username: string;
  avatar_url: string;
  profile: UserProfile;
  /** Simulated engagement momentum 0-100 */
  momentum: number;
  /** Simulated their-gauge score toward current user 0-100 */
  their_gauge: number;
  /** Shared interests beyond hobbies (for deep narrative) */
  shared_interests?: string[];
  /** Complementary desires (for deep narrative) */
  complementary_desires?: string[];
}

export const SUGGESTION_CANDIDATES: CandidateProfile[] = [
  {
    id: 'val-001',
    username: 'Valentina',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80',
    profile: {
      gender: 'female',
      location: 'Paris',
      hobbies: ['Music', 'Art', 'Travel'],
      lifestyle: { partying: 'Often', traveling: 'Every Day', socializing: 'Often', drinking: 'Often', 'morning/night': 'Night Owl' },
      relationshipGoal: 'Short-term',
      relationshipType: 'Open Relationship',
      sexualPreferences: ['Heterosexual'],
      familyGoals: 'Open to children',
      archetype: 'rebel',
      moods: ['flirty_playful', 'high_energy'],
      corePassion: 'travel',
    },
    momentum: 78,
    their_gauge: 42,
    shared_interests: ['Creative Expression', 'Night Culture'],
    complementary_desires: ['Adventure', 'Spontaneity'],
  },
  {
    id: 'ele-002',
    username: 'Elena',
    avatar_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&q=80',
    profile: {
      gender: 'female',
      location: 'Milan',
      hobbies: ['Tech', 'Music', 'Reading'],
      lifestyle: { workout: 'Every Day', traveling: 'Often', socializing: 'Often', smoking: 'Never', 'pet lover': 'Often' },
      relationshipGoal: 'Long-term',
      relationshipType: 'Monogamous',
      sexualPreferences: ['Heterosexual'],
      familyGoals: 'Want children',
      archetype: 'visionary',
      moods: ['deep_intimate', 'creative_showcase'],
      corePassion: 'career',
    },
    momentum: 91,
    their_gauge: 68,
    shared_interests: ['Technology', 'Music', 'Intellectual Depth'],
    complementary_desires: ['Stability', 'Deep Connection'],
  },
  {
    id: 'sof-003',
    username: 'Sofia',
    avatar_url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&q=80',
    profile: {
      gender: 'female',
      location: 'Barcelona',
      hobbies: ['Fitness', 'Yoga', 'Nutrition'],
      lifestyle: { workout: 'Every Day', 'healthy eating': 'Every Day', socializing: 'Sometimes', sleep: 'Every Day', 'pet lover': 'Often' },
      relationshipGoal: 'Long-term',
      relationshipType: 'Monogamous',
      sexualPreferences: ['Heterosexual'],
      familyGoals: 'Want children',
      archetype: 'caregiver',
      moods: ['dinner_date', 'workout_mate'],
      corePassion: 'fitness',
    },
    momentum: 65,
    their_gauge: 30,
    shared_interests: ['Health', 'Fitness', 'Mindfulness'],
    complementary_desires: ['Shared Wellness Routine', 'Family Life'],
  },
  {
    id: 'isa-004',
    username: 'Isabella',
    avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80',
    profile: {
      gender: 'female',
      location: 'London',
      hobbies: ['Fashion', 'Music', 'Art'],
      lifestyle: { partying: 'Sometimes', 'healthy eating': 'Often', socializing: 'Often', workout: 'Often' },
      relationshipGoal: 'Long-term',
      relationshipType: 'Open Relationship',
      sexualPreferences: ['Heterosexual'],
      familyGoals: 'Want children',
      archetype: 'dreamer',
      moods: ['creative_showcase', 'exclusive_vip'],
      corePassion: 'art',
    },
    momentum: 55,
    their_gauge: 50,
    shared_interests: ['Music', 'Aesthetic Culture'],
    complementary_desires: ['Creative Partnership', 'Depth of Connection'],
  },
];

// ─── Signal Processing (BE-LOG-001) ──────────────────────────────────────────

interface SignalBundle {
  candidate: CandidateProfile;
  matchResult: MatchResult;
  matchProbability: number;
  myGauge: number;
  theirGauge: number;
  sharedScore: number;
  opportunityGap: number;
  compositeScore: number;
  category: SuggestionCategory;
  /** Archetype chemistry narrative for enriched suggestions */
  archetypeNarrative: string;
}

function computeSignals(
  currentUser: UserProfile,
  candidate: CandidateProfile,
  myGaugeEstimate: number
): SignalBundle {
  // Use new Match Engine v2 for full breakdown
  const matchResult = calculateMatch(currentUser, candidate.profile);
  const matchProbability = matchResult.totalScore;
  const gaugeState = getDualGaugeState(myGaugeEstimate, candidate.their_gauge);

  // Archetype chemistry narrative
  const archetypeNarrative = getChemistryNarrative(
    currentUser.archetype,
    candidate.profile.archetype
  );

  // Opportunity gap = how close they are to the next relationship level
  const currentLevel = gaugeState.level;
  const currentLevelIdx = RELATIONSHIP_LEVELS.findIndex(l => l.key === currentLevel.key);
  const nextLevel = RELATIONSHIP_LEVELS[Math.min(currentLevelIdx + 1, RELATIONSHIP_LEVELS.length - 1)];
  const levelRange = currentLevel.maxScore - currentLevel.minScore || 1;
  const progressInLevel = gaugeState.sharedScore - currentLevel.minScore;
  const opportunityGap = Math.round(((levelRange - progressInLevel) / levelRange) * 100);

  // Composite score: weighted sum of PME + Momentum + Opportunity Gap (inverted)
  // Enhanced: archetype chemistry contributes a 10% bonus to composite
  const archetypeBonus = matchResult.breakdown.archetypeChemistry * 0.10;
  const compositeScore = Math.min(100, Math.round(
    matchProbability * 0.25 +
    candidate.momentum * 0.35 +
    (100 - opportunityGap) * 0.25 +
    archetypeBonus +
    matchResult.breakdown.moodResonance * 0.05
  ));

  // Category classification
  let category: SuggestionCategory;
  if (matchProbability >= 85 && compositeScore >= 75) {
    category = 'high_compatibility';
  } else if (candidate.momentum >= 80 && opportunityGap <= 30) {
    category = 'momentum_opportunity';
  } else if (candidate.their_gauge > myGaugeEstimate + 20) {
    category = 'dormant_spark';
  } else if (candidate.momentum >= 65 && matchProbability >= 60) {
    category = 'rising_star';
  } else {
    category = 'data_gap_bridge';
  }

  return {
    candidate,
    matchResult,
    matchProbability,
    myGauge: myGaugeEstimate,
    theirGauge: candidate.their_gauge,
    sharedScore: gaugeState.sharedScore,
    opportunityGap,
    compositeScore,
    category,
    archetypeNarrative,
  };
}

// ─── Narrative Engine (BE-LOG-002) ───────────────────────────────────────────

const CATEGORY_TEASERS: Record<SuggestionCategory, (b: SignalBundle) => string> = {
  high_compatibility: (b) =>
    `${b.candidate.username} is a rare alignment — ${b.matchProbability}% compatibility across ${b.matchResult.compatibilityTier === 'soul_aligned' ? '6 signal layers' : 'archetype, lifestyle, and mood signals'}. ${b.archetypeNarrative.split('.')[0]}.`,
  momentum_opportunity: (b) =>
    `${b.candidate.username}'s engagement momentum is at ${b.candidate.momentum}/100 — only ${b.opportunityGap}% from the next connection level. Archetype chemistry: ${b.matchResult.breakdown.archetypeChemistry}%.`,
  dormant_spark: (b) =>
    `${b.candidate.username} has been signalling strong interest. Their engagement toward you is elevated — this spark is waiting for you to ignite it.`,
  rising_star: (b) =>
    `${b.candidate.username} is rapidly gaining momentum. ${b.archetypeNarrative.split('.')[0]}. A connection now secures a high-potential bond.`,
  data_gap_bridge: (b) =>
    `${b.candidate.username} fills key gaps in your social graph — lifestyle sync at ${b.matchResult.breakdown.lifestyleSync}% with complementary archetype energy.`,
};

const CATEGORY_DETAIL: Record<SuggestionCategory, (b: SignalBundle) => string> = {
  high_compatibility: (b) => {
    const shared = b.candidate.shared_interests?.join(', ') || 'multiple domains';
    const desires = b.candidate.complementary_desires?.join(' and ') || 'deeper connection';
    const bd = b.matchResult.breakdown;
    return `Recommended due to a ${b.matchProbability}% multi-signal compatibility score — Archetype Chemistry: ${bd.archetypeChemistry}%, Lifestyle Sync: ${bd.lifestyleSync}%, Hobby Overlap: ${bd.hobbyOverlap}%, Mood Resonance: ${bd.moodResonance}%. ${b.archetypeNarrative} Complementary desire analysis identifies a mutual pull toward ${desires}. This pairing has a high predicted conversion rate to the '${b.candidate.profile.relationshipGoal}' goal you share.`;
  },
  momentum_opportunity: (b) => {
    const shared = b.candidate.shared_interests?.join(' and ') || 'key areas';
    const bd = b.matchResult.breakdown;
    return `${b.candidate.username} is in their peak engagement window — momentum at ${b.candidate.momentum}/100 with Relationship Level only ${b.opportunityGap}% from the next tier. Signal breakdown: Archetype ${bd.archetypeChemistry}%, Lifestyle ${bd.lifestyleSync}%, Temporal ${bd.temporalSignal}%. ${b.archetypeNarrative} Acting now with a Suggestion Move yields the highest XP multiplier.`;
  },
  dormant_spark: (b) => {
    const desires = b.candidate.complementary_desires?.join(' and ') || 'connection';
    return `The dual-gauge model shows ${b.candidate.username}'s score toward you is ${b.theirGauge}/100 while your score toward them is estimated lower. ${b.archetypeNarrative} Their core desire for ${desires} aligns with what you can offer. Engage now to balance the dynamic and unlock the next level.`;
  },
  rising_star: (b) => {
    const shared = b.candidate.shared_interests?.join(', ') || 'multiple interests';
    const bd = b.matchResult.breakdown;
    return `${b.candidate.username}'s trajectory shows a ${b.candidate.momentum}/100 momentum surge. Signal analysis: Archetype Chemistry ${bd.archetypeChemistry}%, Mood Resonance ${bd.moodResonance}%, Lifestyle Sync ${bd.lifestyleSync}%. ${b.archetypeNarrative} Early connections with rising users historically show 2.3x higher long-term engagement rates.`;
  },
  data_gap_bridge: (b) => {
    const shared = b.candidate.shared_interests?.join(' and ') || 'emerging interests';
    const desires = b.candidate.complementary_desires?.join(' and ') || 'growth areas';
    const bd = b.matchResult.breakdown;
    return `The system identifies ${b.candidate.username} as a data-gap bridge — filling missing nodes in your social graph. Signal breakdown: Archetype ${bd.archetypeChemistry}%, Lifestyle ${bd.lifestyleSync}%, Geo ${bd.geoProximity}%. ${b.archetypeNarrative} The opportunity gap is ${b.opportunityGap}% — there is room to grow significantly together.`;
  },
};

// Suggested action IDs are mapped from Relationship Level suggestion moves
const CATEGORY_ACTION: Record<SuggestionCategory, string> = {
  high_compatibility: 'compliment',
  momentum_opportunity: 'wave',
  dormant_spark: 'reaction',
  rising_star: 'follow',
  data_gap_bridge: 'playlist',
};

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Generates a ranked list of AI predictions (local mode — no API call).
 * Suitable for client-side rendering before the backend Gemini integration is live.
 */
export function generateLocalSuggestions(
  currentUserProfile: UserProfile,
  contextData: SuggestionRequest['context_data'],
  limit = 5
): PredictionPayload[] {
  // Estimate my gauge toward each candidate from quest stage & connection points
  const baseGauge = Math.min(50, contextData.connection_points / 2 + contextData.quest_stage * 5);

  const bundles: SignalBundle[] = SUGGESTION_CANDIDATES.map((candidate) =>
    computeSignals(currentUserProfile, candidate, baseGauge + Math.random() * 15)
  );

  // Rank by composite score descending
  const ranked = [...bundles].sort((a, b) => b.compositeScore - a.compositeScore).slice(0, limit);

  return ranked.map((b): PredictionPayload => ({
    target_id: b.candidate.id,
    score: b.compositeScore,
    category: b.category,
    narrative_insight: CATEGORY_TEASERS[b.category](b),
    narrative_detail: CATEGORY_DETAIL[b.category](b),
    suggested_action_id: CATEGORY_ACTION[b.category],
    avatar_url: b.candidate.avatar_url,
    username: b.candidate.username,
    match_probability: b.matchProbability,
    momentum_score: b.candidate.momentum,
    opportunity_gap: b.opportunityGap,
  }));
}

/**
 * Fetches suggestions from the remote API endpoint.
 * Falls back to local generation if the request fails.
 */
export async function fetchSuggestions(
  currentUserProfile: UserProfile,
  forceRefresh?: boolean,
  signal?: AbortSignal
): Promise<SuggestionResponse> {
  const questState = getQuestState();
  const userProfile = getUserProfile();

  const body: SuggestionRequest = {
    user_id: (userProfile['id'] as string) || 'anonymous',
    context_data: {
      current_feed_view: 'all',
      last_5_interactions: [],
      quest_stage: questState.stage,
      connection_points: questState.connectionPoints,
    },
    force_refresh: forceRefresh,
  };

  try {
    const res = await fetch('/api/v2/suggestions/predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal,
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return (await res.json()) as SuggestionResponse;
  } catch {
    // Graceful fallback to local mode
    return {
      suggestions: generateLocalSuggestions(currentUserProfile, body.context_data),
      generated_at: new Date().toISOString(),
      model_version: 'local-v1.0',
    };
  }
}

// ─── Category Metadata (for UI rendering) ────────────────────────────────────

export const CATEGORY_META: Record<
  SuggestionCategory,
  { label: string; color: string; icon: string; glowColor: string }
> = {
  high_compatibility: {
    label: 'Peak Alignment',
    color: '#FF007F',
    icon: '⚡',
    glowColor: 'rgba(255,0,127,0.4)',
  },
  momentum_opportunity: {
    label: 'Momentum Window',
    color: '#00CFFF',
    icon: '🚀',
    glowColor: 'rgba(0,207,255,0.4)',
  },
  dormant_spark: {
    label: 'Dormant Spark',
    color: '#F59E0B',
    icon: '🔥',
    glowColor: 'rgba(245,158,11,0.4)',
  },
  rising_star: {
    label: 'Rising Star',
    color: '#10B981',
    icon: '⭐',
    glowColor: 'rgba(16,185,129,0.4)',
  },
  data_gap_bridge: {
    label: 'Signal Bridge',
    color: '#8B5CF6',
    icon: '🌐',
    glowColor: 'rgba(139,92,246,0.4)',
  },
};
