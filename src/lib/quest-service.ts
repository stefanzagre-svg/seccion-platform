/**
 * Quest Service — Project Fusion / Session
 *
 * Manages the gamified onboarding quest state.
 * Phase 1: localStorage (client-side). Phase 2+: will sync to Supabase backend.
 */

export type QuestStage = 1 | 2 | 3;

export interface QuestState {
  stage: QuestStage;
  connectionPoints: number;
  completedQuests: string[];
  badges: string[];
  archetype: string | null;
  mood: string | null;
  corePasion: string | null;
}

const QUEST_KEY   = 'fusion_quest_state';
const PROFILE_KEY = 'userProfile';

function defaultQuestState(): QuestState {
  return {
    stage: 1,
    connectionPoints: 0,
    completedQuests: [],
    badges: [],
    archetype: null,
    mood: null,
    corePasion: null,
  };
}

// ─── State Accessors ──────────────────────────────────────────────────────────

export function getQuestState(): QuestState {
  if (typeof window === 'undefined') return defaultQuestState();
  const raw = localStorage.getItem(QUEST_KEY);
  return raw ? (JSON.parse(raw) as QuestState) : defaultQuestState();
}

export function saveQuestState(state: QuestState): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(QUEST_KEY, JSON.stringify(state));
}

// ─── Actions ──────────────────────────────────────────────────────────────────

/** Award XP points without completing a formal quest */
export function awardPoints(points: number): QuestState {
  const state = getQuestState();
  const updated: QuestState = { ...state, connectionPoints: state.connectionPoints + points };
  saveQuestState(updated);
  return updated;
}

/** Complete a quest: award points + optional badge, advance stage if applicable */
export function completeQuest(
  questId: string,
  points: number,
  badge?: string
): QuestState {
  const state = getQuestState();

  const completedQuests = state.completedQuests.includes(questId)
    ? state.completedQuests
    : [...state.completedQuests, questId];

  const badges =
    badge && !state.badges.includes(badge)
      ? [...state.badges, badge]
      : state.badges;

  // Auto-advance quest stage
  const stageMap: Record<string, QuestStage> = {
    onboarding_stage1: 1,
    onboarding_stage2: 2,
    hidden_goals:      3,
  };
  const newStage = Math.max(state.stage, (stageMap[questId] ?? 0) + 1) as QuestStage;

  const updated: QuestState = {
    ...state,
    connectionPoints: state.connectionPoints + points,
    completedQuests,
    badges,
    stage: Math.min(newStage, 3) as QuestStage,
  };

  saveQuestState(updated);
  return updated;
}

/** Check if a specific quest has been completed */
export function isQuestComplete(questId: string): boolean {
  return getQuestState().completedQuests.includes(questId);
}

/** Get accumulated connection points */
export function getTotalConnectionPoints(): number {
  return getQuestState().connectionPoints;
}

// ─── User Profile Helpers ─────────────────────────────────────────────────────

export function getUserProfile(): Record<string, unknown> {
  if (typeof window === 'undefined') return {};
  const raw = localStorage.getItem(PROFILE_KEY);
  return raw ? (JSON.parse(raw) as Record<string, unknown>) : {};
}

export function updateUserProfile(updates: Record<string, unknown>): void {
  if (typeof window === 'undefined') return;
  const current = getUserProfile();
  localStorage.setItem(PROFILE_KEY, JSON.stringify({ ...current, ...updates }));
}

export function clearSession(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(QUEST_KEY);
  localStorage.removeItem(PROFILE_KEY);
  localStorage.removeItem('fusion_onboarding_core');
}
