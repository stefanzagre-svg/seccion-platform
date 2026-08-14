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
  purposeCategory?: ('dating' | 'lifestyle' | 'intimate' | 'all')[];
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
  | 'match_created'
  | 'date_plan_confirmed'
  | 'date_plan_denied'
  | 'date_plan_shortlisted_not_chosen';

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
  // Date Plan Integration
  date_plan_confirmed:           25,
  date_plan_denied:             -10,
  date_plan_shortlisted_not_chosen: 8,
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
      { id: 'follow',    label: 'Send a Hi five',      emoji: '🖐️', kycRequired: false, purposeCategory: ['all'] },
      { id: 'poke',      label: 'Send a Poke',         emoji: '👉', kycRequired: false, purposeCategory: ['dating', 'intimate'] },
      { id: 'punch',     label: 'Send a Punch Line',   emoji: '🎙️', kycRequired: false, purposeCategory: ['all'] },
    ],
  },
  {
    key: 'friendly',
    label: 'Friendly & Learning',
    minScore: 16,
    maxScore: 28,
    color: '#60A5FA',       // blue-400
    kycRequired: false,
    suggestionMoves: [
      { id: 'reaction',           label: 'Send a Reaction',                 emoji: '🎉', kycRequired: false, purposeCategory: ['all'] },
      { id: 'compliment',         label: 'Send a Compliment',               emoji: '💬', kycRequired: false, purposeCategory: ['dating', 'intimate'] },
      { id: 'introduce_yourself', label: 'Send your presentation',          emoji: '📝', kycRequired: false, purposeCategory: ['all'] },
      { id: 'playlist',           label: 'Share your playlist',             emoji: '🎵', kycRequired: false, purposeCategory: ['all'] },
      { id: 'movie',              label: 'Share your Favorite Movies/Series', emoji: '🎬', kycRequired: false, purposeCategory: ['all'] },
      { id: 'gaming',             label: 'Ask online Gaming Session',       emoji: '🎮', kycRequired: false, purposeCategory: ['lifestyle', 'dating'] },
      { id: 'gift',               label: 'Send a gift',                     emoji: '🎁', kycRequired: false, purposeCategory: ['all'] },
      { id: 'online',             label: 'Propose Online Date',             emoji: '💻', kycRequired: false, purposeCategory: ['dating', 'intimate'] },
      { id: 'learn',              label: 'Suggest Online Masterclass',      emoji: '📚', kycRequired: false, purposeCategory: ['lifestyle'] },
      { id: 'mentorship',         label: 'Book 1-on-1 Skill Mentorship',    emoji: '🎓', kycRequired: false, purposeCategory: ['lifestyle'] },
      { id: 'career_advice',      label: 'Ask for Career / Business Advice',emoji: '📈', kycRequired: false, purposeCategory: ['lifestyle'] },
      { id: 'wellness_session',   label: 'Join Wellness & Mindfulness Stream', emoji: '🧘', kycRequired: false, purposeCategory: ['lifestyle'] },
      { id: 'tutorial_dining',    label: 'Tutorial: Perfect First Date Dinner', emoji: '🍽️', kycRequired: false, purposeCategory: ['lifestyle'] },
      { id: 'tutorial_styling',   label: 'Tutorial: Outfit & Styling Check',    emoji: '👗', kycRequired: false, purposeCategory: ['lifestyle'] },
      { id: 'course_confidence',  label: 'Course: Confidence & Charisma',       emoji: '✨', kycRequired: false, purposeCategory: ['lifestyle'] },
      { id: 'live_streaming_performance', label: 'Live Streaming performance', emoji: '📹', kycRequired: false, purposeCategory: ['all'] },
      { id: 'live_stream_introduction', label: 'Live Stream introduction', emoji: '🎙️', kycRequired: false, purposeCategory: ['all'] },
    ],
  },
  {
    key: 'close',
    label: 'Close & Mentorship',
    minScore: 29,
    maxScore: 44,
    color: '#F59E0B',       // amber-400
    kycRequired: true,      // Changed to true based on user feedback
    suggestionMoves: [
      { id: 'coffee',     label: 'Propose Coffee Date',              emoji: '☕', kycRequired: true, purposeCategory: ['dating', 'intimate'] },
      { id: 'picnic',     label: 'Propose Picnic Date',              emoji: '🧺', kycRequired: true, purposeCategory: ['dating', 'intimate'] },
      { id: 'city',       label: 'Propose City/Park walk',           emoji: '🌳', kycRequired: true, purposeCategory: ['dating', 'lifestyle'] },
      { id: 'culture',    label: 'Propose Cultural Visit',           emoji: '🏛️', kycRequired: true, purposeCategory: ['lifestyle', 'dating'] },
      { id: 'mastermind', label: 'Propose Business / Tech Mastermind', emoji: '🚀', kycRequired: true, purposeCategory: ['lifestyle'] },
      { id: 'co_working', label: 'Propose Co-Working Session',       emoji: '💻', kycRequired: true, purposeCategory: ['lifestyle'] },
      { id: 'beach',      label: 'Propose Beach Activities',         emoji: '🏖️', kycRequired: true, purposeCategory: ['lifestyle', 'dating'] },
      { id: 'beach_bar',  label: 'Propose beach bar/Party',          emoji: '🍹', kycRequired: true, purposeCategory: ['dating', 'lifestyle'] },
      { id: 'lunch',      label: 'Propose Lunch out',                emoji: '🍱', kycRequired: true, purposeCategory: ['all'] },
      { id: 'brunch',     label: 'Propose Brunch out',               emoji: '🥞', kycRequired: true, purposeCategory: ['all'] },
      { id: 'shopping',   label: 'Suggest to go to Shopping together', emoji: '🛍️', kycRequired: true, purposeCategory: ['lifestyle', 'dating'] },
      { id: 'happy',      label: 'Propose happy hour',               emoji: '🍻', kycRequired: true, purposeCategory: ['all'] },
      { id: 'concert',    label: 'Propose to go to Concert Live',    emoji: '🎸', kycRequired: true, purposeCategory: ['all'] },
      { id: 'tour',       label: 'Propose City Tour',                emoji: '🚌', kycRequired: true, purposeCategory: ['lifestyle', 'dating'] },
      { id: 'yoga',       label: 'Propose Yoga Session',             emoji: '🧘', kycRequired: true, purposeCategory: ['lifestyle', 'dating'] },
      { id: 'run',        label: 'Suggest Running mate',             emoji: '🏃', kycRequired: true, purposeCategory: ['lifestyle', 'dating'] },
      { id: 'outdoor',    label: 'suggest outdoors Excursion',       emoji: '🥾', kycRequired: true, purposeCategory: ['lifestyle', 'dating'] },
      { id: 'drink',      label: 'Propose night out',                emoji: '🥂', kycRequired: true, purposeCategory: ['dating', 'intimate'] },
      { id: 'restaurant', label: 'propose dinner out',               emoji: '🍴', kycRequired: true, purposeCategory: ['dating', 'intimate'] },
      { id: 'exhibition', label: 'suggest an exhibition',            emoji: '🎨', kycRequired: true, purposeCategory: ['lifestyle', 'dating'] },
      { id: 'show',       label: 'Propose a Restaurant Live',        emoji: '🎪', kycRequired: true, purposeCategory: ['dating', 'lifestyle'] },
      { id: 'sport',      label: 'Suggest Sport activities',         emoji: '⚽', kycRequired: true, purposeCategory: ['lifestyle'] },
      { id: 'coach_dating', label: '1-on-1 Dating Strategy Coaching',     emoji: '🎯', kycRequired: true, purposeCategory: ['lifestyle'] },
      { id: 'coach_career', label: '1-on-1 Executive Presence Coaching',  emoji: '💼', kycRequired: true, purposeCategory: ['lifestyle'] },
      { id: 'cook',       label: 'Propose to cook together',         emoji: '🧑‍🍳', kycRequired: true, purposeCategory: ['dating', 'intimate'] },
    ],
  },
  {
    key: 'intimate',
    label: 'Intimate',
    minScore: 45,
    maxScore: 60,
    color: '#F472B6',       // pink-400
    kycRequired: true,
    suggestionMoves: [
      { id: 'cook',        label: 'Propose to cook together', emoji: '🧑‍🍳', kycRequired: true, purposeCategory: ['dating', 'intimate'] },
      { id: 'spa',         label: 'Spa day',                  emoji: '💆', kycRequired: true, purposeCategory: ['dating', 'intimate'] },
      { id: 'karaoke',     label: 'karaoke date',             emoji: '🎤', kycRequired: true, purposeCategory: ['dating', 'intimate'] },
      { id: 'local',       label: 'Local Short Trip',         emoji: '🚗', kycRequired: true, purposeCategory: ['dating', 'intimate'] },
      { id: 'appetizer',   label: 'Libertine appetizer',      emoji: '🍢', kycRequired: true, purposeCategory: ['intimate'] },
      { id: 'club',        label: 'Night club/ lounge bar',   emoji: '🕺', kycRequired: true, purposeCategory: ['dating', 'intimate'] },
      { id: 'home',        label: 'Invitation home',          emoji: '🏠', kycRequired: true, purposeCategory: ['dating', 'intimate'] },
      { id: 'relax',       label: 'Massage/Relaxation',       emoji: '🕯️', kycRequired: true, purposeCategory: ['dating', 'intimate'] },
      { id: 'performance', label: 'Sexual partner',           emoji: '🫦', kycRequired: true, purposeCategory: ['intimate'] },
    ],
  },
  {
    key: 'passionate',
    label: 'Passionate',
    minScore: 61,
    maxScore: 74,
    color: '#F97316',       // orange-500
    kycRequired: true,
    suggestionMoves: [
      { id: 'escape',        label: 'impromptu escape',   emoji: '🏝️', kycRequired: true, purposeCategory: ['dating', 'intimate'] },
      { id: 'surprise',      label: 'surprise plan',      emoji: '🎊', kycRequired: true, purposeCategory: ['dating', 'intimate'] },
      { id: 'international', label: 'International trip', emoji: '✈️', kycRequired: true, purposeCategory: ['dating', 'intimate'] },
      { id: 'swing',         label: 'Swinger Party',      emoji: '😈', kycRequired: true, purposeCategory: ['intimate'] },
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
      { id: 'collab',       label: 'Business/Social/Creative collaboration', emoji: '🎨', kycRequired: true, purposeCategory: ['lifestyle'] },
      { id: 'sponsor',      label: 'Financial/Social sponsor',               emoji: '💎', kycRequired: true, purposeCategory: ['lifestyle'] },
      { id: 'inner_circle', label: 'inner circle meet',                      emoji: '🤝', kycRequired: true, purposeCategory: ['lifestyle', 'dating'] },
      { id: 'engagement',   label: 'being engage',                           emoji: '💍', kycRequired: true, purposeCategory: ['dating', 'intimate'] },
      { id: 'move_in',      label: 'Co-Living ready',                        emoji: '🏠', kycRequired: true, purposeCategory: ['dating', 'intimate'] },
      { id: 'family',       label: 'build a Family',                         emoji: '👨‍👩‍👧‍👦', kycRequired: true, purposeCategory: ['dating', 'intimate'] },
      { id: 'investment',   label: 'Economical/Social investment together',  emoji: '📈', kycRequired: true, purposeCategory: ['lifestyle'] },
      { id: 'house',        label: 'buy a property',                         emoji: '🏡', kycRequired: true, purposeCategory: ['dating', 'intimate'] },
      { id: 'parents',      label: 'meet parents',                           emoji: '👥', kycRequired: true, purposeCategory: ['dating', 'intimate'] },
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
      { id: 'partner',  label: 'Life Partner',     emoji: '💖', kycRequired: true, purposeCategory: ['dating', 'intimate'] },
      { id: 'business', label: 'Business Partner', emoji: '💼', kycRequired: true, purposeCategory: ['lifestyle'] },
      { id: 'adopt',    label: 'Adopt a child',    emoji: '👶', kycRequired: true, purposeCategory: ['dating', 'intimate'] },
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
 * Returns moves for a single level only (no accumulation).
 * Used internally and for display of "new unlocks" at a given level.
 */
export function getMovesForLevel(
  level: RelationshipLevel,
  isKycVerified: boolean
): SuggestionMove[] {
  if (isKycVerified) return level.suggestionMoves;
  return level.suggestionMoves.filter((m) => !m.kycRequired);
}

/**
 * Returns ALL available Suggestion Moves up to and including the current level.
 * Higher levels inherit all moves from every previous level (cumulative unlock).
 * Moves are deduplicated by id — if the same move id appears at multiple levels
 * (e.g. 'cook' at both Close and Intimate), only the first occurrence is kept.
 * KYC-required moves are filtered out when the user is not yet verified.
 */
export function getAvailableMoves(
  level: RelationshipLevel,
  isKycVerified: boolean
): SuggestionMove[] {
  const currentIdx = RELATIONSHIP_LEVELS.findIndex((l) => l.key === level.key);
  if (currentIdx === -1) return getMovesForLevel(level, isKycVerified);

  // Accumulate moves from all levels 0 → currentIdx
  const seen = new Set<string>();
  const accumulated: SuggestionMove[] = [];

  for (let i = 0; i <= currentIdx; i++) {
    const levelMoves = RELATIONSHIP_LEVELS[i].suggestionMoves;
    for (const move of levelMoves) {
      if (!seen.has(move.id)) {
        // Apply KYC filter: skip KYC-required moves if user is not verified
        if (!move.kycRequired || isKycVerified) {
          seen.add(move.id);
          accumulated.push(move);
        }
      }
    }
  }

  return accumulated;
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

export interface CreatorChatProfile {
  ai_agent_active?: boolean;
  chat_auto_enabled?: boolean;
}

export interface SuggestionMoveDbRow {
  id: string;
  label: string;
  emoji?: string | null;
  kyc_required?: boolean;
  kycRequired?: boolean;
  relationship_level?: RelationshipLevelKey;
  relationshipLevel?: RelationshipLevelKey;
  purpose_category?: ('dating' | 'lifestyle' | 'intimate' | 'all')[];
  purposeCategory?: ('dating' | 'lifestyle' | 'intimate' | 'all')[];
}

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
  creatorProfile: CreatorChatProfile,
  relationshipState: { myScore: number; theirScore: number; sharedScore: number },
  totalMatchCount: number = 0
): { allowed: boolean; reason?: string; notEligible?: boolean } => {
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
      notEligible: true,
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

/**
 * Synchronously populates the in-memory RELATIONSHIP_LEVELS suggestionMoves list.
 */
export function populateRelationshipLevels(moves: SuggestionMoveDbRow[]) {
  // Clear existing suggestion moves in RELATIONSHIP_LEVELS
  for (const level of RELATIONSHIP_LEVELS) {
    level.suggestionMoves = [];
  }

  // Populate suggestion moves into respective levels
  for (const move of moves) {
    const levelKey = move.relationship_level || move.relationshipLevel;
    const level = RELATIONSHIP_LEVELS.find(l => l.key === levelKey);
    if (level) {
      level.suggestionMoves.push({
        id: move.id,
        label: move.label,
        emoji: move.emoji || '',
        kycRequired: move.kyc_required ?? move.kycRequired ?? false,
        purposeCategory: move.purpose_category ?? move.purposeCategory ?? ['all']
      });
    }
  }
}

/**
 * Fetches suggestion moves from the database and updates RELATIONSHIP_LEVELS in-memory.
 */
export async function syncSuggestionMoves(supabaseClient: {
  from: (table: string) => {
    select: (columns: string) => Promise<{ data: SuggestionMoveDbRow[] | null; error: unknown }>;
  };
}) {
  try {
    const { data: dbMoves, error } = await supabaseClient
      .from('suggestion_moves')
      .select('id, label, emoji, kyc_required, relationship_level, purpose_category');
    
    if (error) throw error;
    if (dbMoves) {
      populateRelationshipLevels(dbMoves);
    }
  } catch (err) {
    console.error('Error syncing suggestion moves with DB:', err);
  }
}



