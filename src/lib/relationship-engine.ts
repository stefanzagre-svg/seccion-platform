/**
 * Relationship Engine — Project Fusion
 *
 * Architecture: Dual-Gauge / Asymmetric Model
 * ─────────────────────────────────────────────
 * Each user holds their own private gauge score toward another user.
 * The "official" shared Relationship Level is resolved via the Weighted
 * Harmonic Mean of both scores, which naturally penalises imbalance.
 *
 * Score range : 0 – 100 (per user, per target)
 * Shared level: 0 – 100 (derived; used for UI display and feature unlocks)
 */

// ─── Types ───────────────────────────────────────────────────────────────────

export type RelationshipLevelKey =
  | 'strangers'
  | 'acquaintance'
  | 'friendly'
  | 'close'
  | 'intimate'
  | 'passionate'
  | 'committed'
  | 'soulmate';

export interface RelationshipLevel {
  key: RelationshipLevelKey;
  label: string;
  minScore: number;    // inclusive lower bound of shared harmonic score
  maxScore: number;    // inclusive upper bound
  color: string;       // CSS token / hex
  kycRequired: boolean;
  suggestionMoves: SuggestionMove[];
}

export interface SuggestionMove {
  id: string;
  label: string;
  emoji: string;
  kycRequired: boolean;
}

/** What the actor's individual gauge shows relative to the target's gauge */
export type GaugeTension = 'burning' | 'sparking' | 'fading' | 'neutral';

export interface DualGaugeState {
  /** Actor → Target score (the viewer's own score) */
  myScore: number;
  /** Target → Actor score (the other person's score, hidden exact value) */
  theirScore: number;
  /** Resolved shared level score via harmonic mean */
  sharedScore: number;
  /** Resolved level object */
  level: RelationshipLevel;
  /** Symbolic hint of balance */
  tension: GaugeTension;
}

export interface GaugeEvent {
  type: InteractionEventType;
  /** Override points — leave undefined to use default from POINT_VALUES */
  customPoints?: number;
  /** Monetary value involved in the transaction (for tips, subs, orders) */
  monetaryValue?: number;
  /** Is the actor a Master Subscriber to the target? */
  isMasterSubscriber?: boolean;
}

export type InteractionEventType =
  | 'profile_like'
  | 'content_like'
  | 'message_like'
  | 'comment'
  | 'live_heart'
  | 'live_tip'
  | 'subscribe_vip'
  | 'subscribe_master'
  | 'ppv_purchase'
  | 'custom_order_placed'
  | 'custom_order_delivered_rated'
  | 'suggestion_move_accepted'
  | 'funding_contribution'
  | 'content_dislike'
  | 'message_dislike'
  | 'suggestion_move_rejected'
  | 'user_rating_good'
  | 'user_rating_bad'
  | 'received_financial_support'
  | 'message_sent'
  | 'match_created';

// ─── Constants ───────────────────────────────────────────────────────────────

/**
 * Points awarded to the ACTOR's gauge toward the TARGET for each interaction.
 * Negative values reduce the actor's gauge.
 */
export const POINT_VALUES: Record<InteractionEventType, number> = {
  profile_like:                   5,
  content_like:                   2,
  message_like:                   1,
  comment:                        2,
  live_heart:                     1,   // capped at +10 per stream in caller
  live_tip:                      15,
  subscribe_vip:                 20,
  subscribe_master:              35,
  ppv_purchase:                  10,
  custom_order_placed:           12,
  custom_order_delivered_rated:   8,
  suggestion_move_accepted:      20,
  user_rating_good:              10,
  funding_contribution:          15,
  received_financial_support:    25, // Applies to the Creator's gauge toward the Member
  message_sent:                   1,
  match_created:                  5,
  // Negative
  content_dislike:               -3,
  message_dislike:               -1,
  suggestion_move_rejected:      -5,
  user_rating_bad:              -15,
};

/** Financial Multiplier divisor: 1 point per $X spent */
export const FINANCIAL_POINT_DIVISOR = 5;

/** Base Points lost per day of inactivity (before curve modifiers) */
export const DECAY_BASE_RATE = 1.5;

/** After how many days without interaction does decay begin */
export const DECAY_GRACE_DAYS = 21; // Extended from 14 based on feedback

// ─── Level Definitions ───────────────────────────────────────────────────────

export const RELATIONSHIP_LEVELS: RelationshipLevel[] = [
  {
    key: 'strangers',
    label: 'Strangers',
    minScore: 0,
    maxScore: 5,
    color: '#6B7280',       // gray-500
    kycRequired: false,
    suggestionMoves: [],
  },
  {
    key: 'acquaintance',
    label: 'Acquaintance',
    minScore: 6,
    maxScore: 15,
    color: '#93C5FD',       // blue-300
    kycRequired: false,
    suggestionMoves: [
      { id: 'follow',    label: 'Follow',          emoji: '👋', kycRequired: false },
      { id: 'wave',      label: 'Send a Wave',      emoji: '🙌', kycRequired: false },
    ],
  },
  {
    key: 'friendly',
    label: 'Friendly',
    minScore: 16,
    maxScore: 28,
    color: '#60A5FA',       // blue-400
    kycRequired: false,
    suggestionMoves: [
      { id: 'reaction',  label: 'Send a Reaction',  emoji: '🎉', kycRequired: false },
      { id: 'compliment',label: 'Send a Compliment',emoji: '💬', kycRequired: false },
      { id: 'playlist',  label: 'Share a Playlist', emoji: '🎵', kycRequired: false },
    ],
  },
  {
    key: 'close',
    label: 'Close',
    minScore: 29,
    maxScore: 44,
    color: '#F59E0B',       // amber-400
    kycRequired: false,
    suggestionMoves: [
      { id: 'coffee',    label: 'Coffee Date',      emoji: '☕', kycRequired: false },
      { id: 'gift',      label: 'Send a Gift',       emoji: '🎁', kycRequired: false },
      { id: 'movie',     label: 'Movie Night',       emoji: '🎬', kycRequired: false },
      { id: 'picnic',    label: 'Picnic Date',       emoji: '🧺', kycRequired: false },
    ],
  },
  {
    key: 'intimate',
    label: 'Intimate',
    minScore: 45,
    maxScore: 60,
    color: '#F472B6',       // pink-400  ← swapped from orange
    kycRequired: true,
    suggestionMoves: [
      { id: 'dinner',    label: 'First Real Dinner', emoji: '🍽️', kycRequired: true },
      { id: 'activity',  label: 'Activity Date',     emoji: '🎭', kycRequired: true },
      { id: 'spa',       label: 'Spa Day',            emoji: '💆', kycRequired: true },
      { id: 'cooking',   label: 'Cook Together',      emoji: '👨‍🍳', kycRequired: true },
    ],
  },
  {
    key: 'passionate',
    label: 'Passionate',
    minScore: 61,
    maxScore: 74,
    color: '#F97316',       // orange-500  ← swapped from pink
    kycRequired: true,
    suggestionMoves: [
      { id: 'escape',    label: 'Impromptu Escape',  emoji: '🏖️', kycRequired: true },
      { id: 'concert',   label: 'Concert Night',     emoji: '🎤', kycRequired: true },
      { id: 'exclusive', label: 'Exclusive Access',   emoji: '🔑', kycRequired: true },
      { id: 'surprise',  label: 'Plan a Surprise',    emoji: '🎊', kycRequired: true },
    ],
  },
  {
    key: 'committed',
    label: 'Committed',
    minScore: 75,
    maxScore: 88,
    color: '#10B981',       // emerald-500
    kycRequired: true,
    suggestionMoves: [
      { id: 'travel',    label: 'Travel Together',   emoji: '✈️', kycRequired: true },
      { id: 'collab',    label: 'Creative Collab',   emoji: '🎨', kycRequired: true },
      { id: 'inner_circle', label: 'Inner Circle Meet', emoji: '🤝', kycRequired: true },
      { id: 'dedicate',  label: 'Dedicate a Moment', emoji: '💌', kycRequired: true },
    ],
  },
  {
    key: 'soulmate',
    label: 'Soulmate',
    minScore: 89,
    maxScore: 100,
    color: '#DC2626',       // crimson
    kycRequired: true,
    suggestionMoves: [
      { id: 'move_in',   label: 'Co-Living Integration', emoji: '🏠', kycRequired: true },
      { id: 'partner',   label: 'Life Partner',       emoji: '💍', kycRequired: true },
      { id: 'legacy',    label: 'Legacy Team Venture', emoji: '🌟', kycRequired: true },
      { id: 'adventure', label: 'Epic Adventure',     emoji: '🌍', kycRequired: true },
    ],
  },
];

// ─── Core Functions ───────────────────────────────────────────────────────────

/**
 * Weighted Harmonic Mean of two gauge scores.
 * Returns 0 if either score is 0 (a completely disengaged party blocks progress).
 */
export function resolveSharedScore(scoreA: number, scoreB: number): number {
  if (scoreA <= 0 || scoreB <= 0) return 0;
  const harmonic = (2 * scoreA * scoreB) / (scoreA + scoreB);
  return Math.min(100, Math.round(harmonic));
}

/**
 * Maps a shared harmonic score to a RelationshipLevel object.
 */
export function scoreToLevel(sharedScore: number): RelationshipLevel {
  for (const level of [...RELATIONSHIP_LEVELS].reverse()) {
    if (sharedScore >= level.minScore) return level;
  }
  return RELATIONSHIP_LEVELS[0]; // fallback: strangers
}

/**
 * Determines the tension hint shown to the current user.
 * The exact "their score" is never revealed — only the symbolic hint.
 *
 * Threshold: ±15 points difference = imbalanced; otherwise sparking.
 */
export function resolveTension(myScore: number, theirScore: number): GaugeTension {
  const diff = theirScore - myScore;
  if (Math.abs(diff) < 15) return 'sparking';
  if (diff > 0) return 'burning';   // they are more invested in you
  return 'fading';                  // you are more invested in them
}

/**
 * Computes the full dual-gauge state for a pair.
 * `myScore`    = authenticated user's gauge toward the target
 * `theirScore` = target user's gauge toward the authenticated user
 */
export function getDualGaugeState(myScore: number, theirScore: number): DualGaugeState {
  const sharedScore = resolveSharedScore(myScore, theirScore);
  const level = scoreToLevel(sharedScore);
  const tension = resolveTension(myScore, theirScore);

  return { myScore, theirScore, sharedScore, level, tension };
}

/**
 * Calculates the updated gauge score after an interaction event.
 * Integrates financial multipliers and Master Subscriber boosts.
 * Clamps the result to [0, 100].
 */
export function applyInteractionEvent(currentScore: number, event: GaugeEvent): number {
  let points = event.customPoints ?? POINT_VALUES[event.type];
  
  // Financial Multiplier Logic (Base + MonetaryValue / Divisor)
  if (event.monetaryValue && event.monetaryValue > 0) {
    points += (event.monetaryValue / FINANCIAL_POINT_DIVISOR);
  }

  // Master Subscriber Boost: All positive interactions gain a 25% boost
  if (event.isMasterSubscriber && points > 0) {
    points *= 1.25;
  }

  return Math.max(0, Math.min(100, currentScore + points));
}

/**
 * Applies daily decay to a score using an "Engagement Curve Fade" algorithm.
 * High scores (L5+) decay faster, low scores decay extremely slowly.
 */
export function applyDecay(currentScore: number, daysSinceLastInteraction: number): number {
  if (daysSinceLastInteraction < DECAY_GRACE_DAYS) return currentScore;
  
  const decayDays = daysSinceLastInteraction - DECAY_GRACE_DAYS;
  let decayModifier = 1.0;

  // Anti-Penalty Curve: Accelerate decay at high levels, pause/taper at low levels
  if (currentScore >= 60) {
    decayModifier = 1.5; // Fast decay for L5+ (requires upkeep)
  } else if (currentScore <= 15) {
    decayModifier = 0.2; // Slow/almost paused for Acquaintances
  }

  const totalDecay = decayDays * (DECAY_BASE_RATE * decayModifier);
  return Math.max(0, currentScore - totalDecay);
}

/**
 * Returns the percentage progress within the current level band.
 * Useful for rendering the gauge fill animation in the UI.
 */
export function levelProgress(sharedScore: number): number {
  const level = scoreToLevel(sharedScore);
  const range = level.maxScore - level.minScore;
  if (range <= 0) return 100;
  return Math.min(100, Math.round(((sharedScore - level.minScore) / range) * 100));
}

/**
 * Returns available Suggestion Moves for the current level,
 * filtering by KYC status if the user is not yet verified.
 */
export function getAvailableMoves(
  level: RelationshipLevel,
  isKycVerified: boolean
): SuggestionMove[] {
  if (isKycVerified) return level.suggestionMoves;
  return level.suggestionMoves.filter((m) => !m.kycRequired);
}

/**
 * Tension label and icon map — used by the UI.
 */
export const TENSION_DISPLAY: Record<GaugeTension, { label: string; emoji: string; color: string }> = {
  burning: { label: 'They\'re into you',  emoji: '🔥', color: '#EF4444' },
  sparking: { label: 'Mutual spark',      emoji: '⚡', color: '#F59E0B' },
  fading:   { label: 'Keep the energy',   emoji: '💤', color: '#6B7280' },
  neutral:  { label: 'New connection',    emoji: '✨', color: '#93C5FD' },
};

/**
 * Minimum number of confirmed matches (non-stranger relationship rows)
 * a creator must have before the Auto-Chat feature can be activated.
 * This prevents newly-joined creators from automating contact before
 * they have built a meaningful audience.
 */
export const MIN_MATCHES_FOR_AUTO_CHAT = 30;

/**
 * Validates if the AI Assistant can auto-chat with a user based on:
 *  1. Creator has enabled the AI master switch (ai_agent_active)
 *  2. Creator has enabled the auto-chat service (chat_auto_enabled)
 *  3. Creator has reached at least MIN_MATCHES_FOR_AUTO_CHAT (30) total matches
 *  4. The current relationship level is not Level 4 "Close Friend" (hard block)
 *
 * @param creatorProfile   - must contain ai_agent_active, chat_auto_enabled
 * @param relationshipState - shared scores for the specific sender↔creator pair
 * @param totalMatchCount  - total number of non-stranger connections the creator has
 */
export const isAutoChatAllowed = (
  creatorProfile: any,
  relationshipState: { myScore: number; theirScore: number; sharedScore: number },
  totalMatchCount: number = 0
): { allowed: boolean; reason?: string } => {
  if (!creatorProfile.ai_agent_active) {
    return { allowed: false, reason: 'AI Assistant is currently disabled.' };
  }
  if (!creatorProfile.chat_auto_enabled) {
    return { allowed: false, reason: 'Auto-Chat Simulation is currently paused by the creator.' };
  }
  if (totalMatchCount < MIN_MATCHES_FOR_AUTO_CHAT) {
    return {
      allowed: false,
      reason: `Auto-Chat requires a minimum of ${MIN_MATCHES_FOR_AUTO_CHAT} matches. You currently have ${totalMatchCount}.`,
      ...(({ notEligible: true }) as any),
    };
  }
  const currentLevel = scoreToLevel(relationshipState.sharedScore);
  // Hard block Level 4 (Close Friend / 'close' key)
  if (currentLevel.key === 'close') {
    return {
      allowed: false,
      reason: 'Human mode active. Genuine human connection required for Close Friend status.',
    };
  }
  return { allowed: true };
};

/**
 * Determines if the face blur filter should be rendered.
 * Returns true only if the owner has opted-in to face blur AND the shared harmonic score is below Level 3 (16).
 */
export function isFaceBlurRequired(sharedScore: number, isEnabledByOwner?: boolean): boolean {
  if (!isEnabledByOwner) return false;
  return sharedScore < 16; // Level 3 (friendly) and above are unblurred (revealed)
}


