/**
 * Provenance-Backed Creator & VIP Copilot Memory Graph (Lean Plan E)
 *
 * Applies the 3-Layer Second Brain Architecture to SECCION's AI Operations Assistant:
 *   1. Scrubs raw PII before storage (GDPR-clean).
 *   2. Separates active rules/facts from superseded offers/decisions.
 *   3. Formats a compact, date-stamped provenance block for Gemini system instructions.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import { scrubPIIBeforeLLM } from '@/lib/ai/pii-scrubber';
import { extractWikilinks } from '@/lib/vault/vault-graph-engine';

export type CopilotMemoryType =
  | 'brand_voice'
  | 'boundary'
  | 'vip_preference'
  | 'vip_offer_decision';

export type CopilotMemoryStatus = 'active' | 'superseded';

export type CopilotMemoryLifecycleState = 'active' | 'expired' | 'superseded';

/**
 * Memory Engineering invariants (Distort 6-Part Loop):
 * - Always-loaded Brand Voice + Hard Boundary rules are strictly capped at 20 per creator.
 * - Temporary VIP offer/promo notes automatically expire after 7 days unless renewed.
 */
export const MAX_ACTIVE_BRAND_RULES = 20;
export const DEFAULT_VIP_OFFER_TTL_DAYS = 7;

export interface CopilotMemoryRecord {
  id: string;
  creator_id: string;
  target_member_id: string | null;
  title: string;
  memory_type: CopilotMemoryType;
  topic_slug: string;
  summary: string;
  wikilinks: string[];
  status: CopilotMemoryStatus;
  superseded_by?: string | null;
  source_context: string;
  checked_at: string;
  recheck_when: string;
  expires_at?: string | null;
}

export interface PrepareMemoryInput {
  title: string;
  memoryType: CopilotMemoryType;
  topicSlug?: string;
  summary: string;
  targetMemberId?: string | null;
  sourceContext?: string;
  recheckWhen?: string;
}

export interface PreparedMemoryPayload {
  title: string;
  memory_type: CopilotMemoryType;
  topic_slug: string;
  summary: string;
  wikilinks: string[];
  target_member_id: string | null;
  source_context: string;
  recheck_when: string;
  piiRedacted: boolean;
  redactedTypes: string[];
}

export function normalizeTopicSlug(raw: string): string {
  const slug = raw
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
  return slug || 'general-note';
}

/**
 * Scrubs all sensitive PII from user-supplied memory text before persistence
 * and extracts Obsidian [[wikilinks]] for Vault graph rendering.
 */
export function sanitizeAndPrepareMemoryInput(input: PrepareMemoryInput): PreparedMemoryPayload {
  const cleanTitle = scrubPIIBeforeLLM(input.title.trim());
  const cleanSummary = scrubPIIBeforeLLM(input.summary.trim());
  const links = extractWikilinks(cleanSummary.sanitizedText);

  return {
    title: cleanTitle.sanitizedText.slice(0, 140) || 'Untitled Memory',
    memory_type: input.memoryType,
    topic_slug: normalizeTopicSlug(input.topicSlug || input.title),
    summary: cleanSummary.sanitizedText.slice(0, 1200),
    wikilinks: links,
    target_member_id: input.targetMemberId || null,
    source_context: (input.sourceContext || 'studio_cockpit').slice(0, 120),
    recheck_when:
      (input.recheckWhen || 'When creator pricing, boundaries, or VIP agreement changes.').slice(0, 240),
    piiRedacted: cleanTitle.hasRedactions || cleanSummary.hasRedactions,
    redactedTypes: Array.from(new Set([...cleanTitle.redactedTypes, ...cleanSummary.redactedTypes])),
  };
}

/**
 * Identifies existing active rows that must be marked 'superseded' (never silently erased)
 * when a newer decision/rule arrives for the same (target_member_id, topic_slug).
 */
export function detectMemoryTopicConflict(
  existing: Pick<CopilotMemoryRecord, 'id' | 'target_member_id' | 'topic_slug' | 'status' | 'memory_type'>[],
  targetMemberId: string | null,
  topicSlug: string
): string[] {
  const normalizedTarget = targetMemberId || null;
  const slug = normalizeTopicSlug(topicSlug);
  return existing
    .filter(
      (row) =>
        row.status === 'active' &&
        (row.target_member_id || null) === normalizedTarget &&
        normalizeTopicSlug(row.topic_slug) === slug
    )
    .map((row) => row.id);
}

const BRAND_RULE_TYPES = new Set<CopilotMemoryType>(['brand_voice', 'boundary']);

const MEMORY_PRIORITY_WEIGHT: Record<CopilotMemoryType, number> = {
  boundary: 4,
  brand_voice: 3,
  vip_preference: 2,
  vip_offer_decision: 1,
};

export function isBrandRuleMemoryType(memoryType: CopilotMemoryType): boolean {
  return BRAND_RULE_TYPES.has(memoryType);
}

/**
 * Computes default expiration ISO timestamp:
 * - `vip_offer_decision` expires after 7 days unless explicitly extended.
 * - Evergreen `brand_voice`, `boundary`, and `vip_preference` return null.
 */
export function computeMemoryExpiresAt(
  memoryType: CopilotMemoryType,
  checkedAtIso?: string
): string | null {
  if (memoryType !== 'vip_offer_decision') {
    return null;
  }
  const baseMs = checkedAtIso ? Date.parse(checkedAtIso) : Date.now();
  const safeBaseMs = Number.isFinite(baseMs) ? baseMs : Date.now();
  return new Date(safeBaseMs + DEFAULT_VIP_OFFER_TTL_DAYS * 86_400_000).toISOString();
}

/**
 * Evaluates whether an active memory record has exceeded its TTL.
 * Works both with explicit `expires_at` and without schema changes via `checked_at` + 7d TTL.
 */
export function isCopilotMemoryExpired(
  memory: Pick<CopilotMemoryRecord, 'memory_type' | 'checked_at' | 'expires_at' | 'status'>,
  now: Date = new Date()
): boolean {
  if (memory.status !== 'active') return false;
  if (memory.expires_at) {
    const expMs = Date.parse(memory.expires_at);
    if (Number.isFinite(expMs)) {
      return expMs <= now.getTime();
    }
  }
  if (memory.memory_type === 'vip_offer_decision' && memory.checked_at) {
    const checkedMs = Date.parse(memory.checked_at);
    if (Number.isFinite(checkedMs)) {
      return checkedMs + DEFAULT_VIP_OFFER_TTL_DAYS * 86_400_000 <= now.getTime();
    }
  }
  return false;
}

export function getCopilotMemoryLifecycleState(
  memory: Pick<CopilotMemoryRecord, 'memory_type' | 'checked_at' | 'expires_at' | 'status'>,
  now: Date = new Date()
): CopilotMemoryLifecycleState {
  if (memory.status === 'superseded') return 'superseded';
  if (isCopilotMemoryExpired(memory, now)) return 'expired';
  return 'active';
}

/**
 * Selects oldest active brand/boundary rule IDs to supersede when inserting a new rule
 * would push the creator past `MAX_ACTIVE_BRAND_RULES` (20).
 */
export function selectOverflowBrandRuleIdsToSupersede(
  existing: Pick<CopilotMemoryRecord, 'id' | 'memory_type' | 'status' | 'checked_at'>[],
  nextMemoryType: CopilotMemoryType,
  alreadyConflictingIds: string[],
  cap: number = MAX_ACTIVE_BRAND_RULES
): string[] {
  if (!isBrandRuleMemoryType(nextMemoryType)) return [];
  const conflictSet = new Set(alreadyConflictingIds);
  const remainingBrandRules = existing
    .filter(
      (row) =>
        row.status === 'active' &&
        isBrandRuleMemoryType(row.memory_type) &&
        !conflictSet.has(row.id)
    )
    .sort((a, b) => Date.parse(a.checked_at || '0') - Date.parse(b.checked_at || '0'));

  const overflowCount = remainingBrandRules.length + 1 - cap;
  if (overflowCount <= 0) return [];
  return remainingBrandRules.slice(0, overflowCount).map((row) => row.id);
}

/**
 * Filters out superseded and expired memories, sorting evergreen boundaries & brand rules
 * ahead of temporary VIP offers within the compact prompt budget.
 */
export function prioritizeCopilotMemories(
  memories: CopilotMemoryRecord[],
  maxItems = 6,
  now: Date = new Date()
): CopilotMemoryRecord[] {
  return memories
    .filter((m) => getCopilotMemoryLifecycleState(m, now) === 'active')
    .sort((a, b) => {
      const weightDiff =
        (MEMORY_PRIORITY_WEIGHT[b.memory_type] || 0) -
        (MEMORY_PRIORITY_WEIGHT[a.memory_type] || 0);
      if (weightDiff !== 0) return weightDiff;
      return Date.parse(b.checked_at || '0') - Date.parse(a.checked_at || '0');
    })
    .slice(0, maxItems);
}

/**
 * Formats ONLY active, non-expired, provenance-backed memories into a compact,
 * non-bloated system instruction block with checked dates and strict honesty rules.
 */
export function formatProvenanceMemoryBlock(
  memories: CopilotMemoryRecord[],
  maxItems = 6,
  now: Date = new Date()
): string {
  const active = prioritizeCopilotMemories(memories, maxItems, now);

  if (active.length === 0) {
    return '';
  }

  const lines = active.map((m) => {
    const scope = m.target_member_id ? 'VIP' : 'BRAND';
    const dateTag = m.checked_at ? m.checked_at.slice(0, 10) : 'undated';
    const compactSummary = m.summary.replace(/\s+/g, ' ').slice(0, 160);
    return `- [${scope} | ${m.memory_type} | Checked ${dateTag}] ${m.title}: ${compactSummary}`;
  });

  return [
    'VERIFIED CREATOR MEMORY (Provenance-Backed, Active Only):',
    ...lines,
    'MEMORY RULE: Follow active directives above. Never cite superseded offers/prices or invent unrecorded promises.',
  ].join('\n');
}

/**
 * Loads compact active, non-expired brand memories + optional target VIP memories from Supabase.
 * Fail-safe: returns empty list if table does not yet exist in sandbox/local DB.
 */
export async function loadActiveCopilotMemories(
  supabase: Pick<SupabaseClient, 'from'>,
  creatorId: string,
  targetMemberId?: string | null,
  limit = 6
): Promise<CopilotMemoryRecord[]> {
  try {
    const fetchWindow = Math.max(limit * 3, MAX_ACTIVE_BRAND_RULES + 5);
    let query = supabase
      .from('creator_copilot_memories')
      .select(
        'id, creator_id, target_member_id, title, memory_type, topic_slug, summary, wikilinks, status, superseded_by, source_context, checked_at, recheck_when'
      )
      .eq('creator_id', creatorId)
      .eq('status', 'active')
      .order('checked_at', { ascending: false })
      .limit(fetchWindow);

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (targetMemberId && uuidRegex.test(targetMemberId)) {
      query = query.or(`target_member_id.is.null,target_member_id.eq.${targetMemberId}`);
    } else {
      query = query.is('target_member_id', null);
    }

    const { data, error } = await query;
    if (error || !Array.isArray(data)) {
      return [];
    }
    return prioritizeCopilotMemories(data as CopilotMemoryRecord[], limit);
  } catch {
    return [];
  }
}
