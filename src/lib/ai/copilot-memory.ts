/**
 * Provenance-Backed Creator & VIP Copilot Memory Graph (Lean Plan E)
 *
 * Applies the 3-Layer Second Brain Architecture to SECCION's AI Operations Assistant:
 *   1. Scrubs raw PII before storage (GDPR-clean).
 *   2. Separates active rules/facts from superseded offers/decisions.
 *   3. Formats a compact, date-stamped provenance block for Gemini system instructions.
 */

import { scrubPIIBeforeLLM } from '@/lib/ai/pii-scrubber';
import { extractWikilinks } from '@/lib/vault/vault-graph-engine';

export type CopilotMemoryType =
  | 'brand_voice'
  | 'boundary'
  | 'vip_preference'
  | 'vip_offer_decision';

export type CopilotMemoryStatus = 'active' | 'superseded';

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

/**
 * Formats ONLY active, provenance-backed memories into a compact, non-bloated
 * system instruction block (< ~900 chars) with checked dates and strict honesty rules.
 */
export function formatProvenanceMemoryBlock(
  memories: CopilotMemoryRecord[],
  maxItems = 6
): string {
  const active = memories
    .filter((m) => m.status === 'active')
    .slice(0, maxItems);

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
 * Loads compact active brand memories + optional target VIP memories from Supabase.
 * Fail-safe: returns empty list if table does not yet exist in sandbox/local DB.
 */
export async function loadActiveCopilotMemories(
  supabase: any,
  creatorId: string,
  targetMemberId?: string | null,
  limit = 6
): Promise<CopilotMemoryRecord[]> {
  try {
    let query = supabase
      .from('creator_copilot_memories')
      .select(
        'id, creator_id, target_member_id, title, memory_type, topic_slug, summary, wikilinks, status, superseded_by, source_context, checked_at, recheck_when'
      )
      .eq('creator_id', creatorId)
      .eq('status', 'active')
      .order('checked_at', { ascending: false })
      .limit(limit);

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
    return data as CopilotMemoryRecord[];
  } catch {
    return [];
  }
}
