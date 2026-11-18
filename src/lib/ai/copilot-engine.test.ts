import { describe, it, expect } from 'vitest';
import { scrubPIIBeforeLLM } from '@/lib/ai/pii-scrubber';
import { classifyMessageIntent } from '@/lib/ai/intent-classifier';
import { analyzeMemberFriction } from '@/lib/ai/whale-friction-detector';
import { resolveRampDirective, calculateTypingCadence } from '@/lib/ai/conversion-engine';
import { extractWikilinks, buildVaultGraph } from '@/lib/vault/vault-graph-engine';
import {
  MAX_ACTIVE_BRAND_RULES,
  DEFAULT_VIP_OFFER_TTL_DAYS,
  sanitizeAndPrepareMemoryInput,
  detectMemoryTopicConflict,
  formatProvenanceMemoryBlock,
  isCopilotMemoryExpired,
  selectOverflowBrandRuleIdsToSupersede,
  type CopilotMemoryRecord,
} from '@/lib/ai/copilot-memory';

describe('AI Copilot 2.0 Security & Conversion Engine Suite', () => {
  describe('Ephemeral PII Scrubber', () => {
    it('should scrub email addresses and credit card numbers from memory', () => {
      const input = 'My email is test@seccion.ai and card is 4532 0152 4589 1234';
      const result = scrubPIIBeforeLLM(input);
      expect(result.hasRedactions).toBe(true);
      expect(result.sanitizedText).not.toContain('test@seccion.ai');
      expect(result.sanitizedText).not.toContain('4532 0152 4589 1234');
      expect(result.sanitizedText).toContain('[REDACTED_EMAIL]');
      expect(result.sanitizedText).toContain('[REDACTED_CREDIT_CARD]');
    });

    it('should pass benign messages without modification', () => {
      const input = 'Loved your latest dance clip, so energetic!';
      const result = scrubPIIBeforeLLM(input);
      expect(result.hasRedactions).toBe(false);
      expect(result.sanitizedText).toBe(input);
    });
  });

  describe('Threat Intent Classifier', () => {
    it('should block offline in-person meetup attempts', () => {
      const query = 'Can we meet up at my hotel room tonight?';
      const result = classifyMessageIntent(query);
      expect(result.isSafe).toBe(false);
      expect(result.flaggedIntent).toBe('IN_PERSON_MEETUP');
      expect(result.deflectionMessage).toContain('never arrange in-person');
    });

    it('should block off-platform cash transactions', () => {
      const query = 'Send me your CashApp or Venmo so I can tip you direct';
      const result = classifyMessageIntent(query);
      expect(result.isSafe).toBe(false);
      expect(result.flaggedIntent).toBe('OFF_PLATFORM_TRANSACTION');
    });

    it('should respect creator photo restriction settings', () => {
      const query = 'Can you send a selfie right now?';
      const result = classifyMessageIntent(query, { allow_photos: false });
      expect(result.isSafe).toBe(false);
      expect(result.flaggedIntent).toBe('MEDIA_REQUEST_BLOCKED');
    });
  });

  describe('Whale & Friction Detector', () => {
    it('should escalate hostile dispute terms immediately', () => {
      const query = 'This is a scam, I am doing a chargeback now';
      const result = analyzeMemberFriction(query);
      expect(result.requiresHumanEscalation).toBe(true);
      expect(result.sentimentScore).toBeLessThan(0);
    });

    it('should detect VIP whales when spend exceeds threshold', () => {
      const result = analyzeMemberFriction('Hey there', 30000); // $300.00
      expect(result.isWhale).toBe(true);
      expect(result.requiresHumanEscalation).toBe(false);
    });
  });

  describe('Conversion Engine: Multi-Turn Ramp & Latency', () => {
    it('should resolve sequential directives for VIP subscription pitches', () => {
      const step1 = resolveRampDirective('SUBSCRIBE_VIP', 1);
      expect(step1.step).toBe(1);
      expect(step1.instruction).toContain('Do NOT pitch the subscription yet');

      const step3 = resolveRampDirective('SUBSCRIBE_VIP', 3);
      expect(step3.step).toBe(3);
      expect(step3.instruction).toContain('Call-to-Action');
    });

    it('should calculate natural typing latency bounded between 1.8s and 8s', () => {
      const delayShort = calculateTypingCadence('hey!');
      expect(delayShort).toBeGreaterThanOrEqual(1800);
      expect(delayShort).toBeLessThanOrEqual(8000);

      const longReply = 'This is a significantly longer reply that mimics an authentic thoughtful answer.'.repeat(4);
      const delayLong = calculateTypingCadence(longReply);
      expect(delayLong).toBeLessThanOrEqual(8000);
    });
  });

  describe('Obsidian Vault Graph Engine', () => {
    it('should extract bi-directional wikilinks correctly', () => {
      const content = 'Notes on [[Fitness]] and member [[Lucas]] who enjoys [[Pilates]].';
      const links = extractWikilinks(content);
      expect(links).toEqual(['Fitness', 'Lucas', 'Pilates']);
    });

    it('should build connected graph data for visualization', () => {
      const notes = [
        {
          id: '1',
          title: 'Persona',
          note_type: 'PERSONA' as const,
          content: 'I love [[Pilates]] and healthy food.',
        },
      ];
      const graph = buildVaultGraph(notes);
      expect(graph.nodes.some(n => n.id === 'Persona')).toBe(true);
      expect(graph.nodes.some(n => n.id === 'Pilates')).toBe(true);
      expect(graph.edges).toEqual([{ source: 'Persona', target: 'Pilates' }]);
    });
  });

  describe('Provenance-Backed Copilot Memory Graph (Lean Plan E)', () => {
    it('scrubs PII and extracts [[wikilinks]] before storage', () => {
      const prepared = sanitizeAndPrepareMemoryInput({
        title: 'VIP Lucas email@example.com Offer',
        memoryType: 'vip_offer_decision',
        summary: 'Prefers [[Fitness]] tips; card 4532 0152 4589 1234 rejected on [[VIP_Bundle]].',
      });

      expect(prepared.piiRedacted).toBe(true);
      expect(prepared.summary).toContain('[REDACTED_CREDIT_CARD]');
      expect(prepared.summary).not.toContain('4532 0152 4589 1234');
      expect(prepared.title).toContain('[REDACTED_EMAIL]');
      expect(prepared.wikilinks).toEqual(['Fitness', 'VIP_Bundle']);
      expect(prepared.topic_slug).toContain('vip-lucas');
    });

    it('detects active same-topic conflicts for superseding without silent erasure', () => {
      const existing: Pick<
        CopilotMemoryRecord,
        'id' | 'target_member_id' | 'topic_slug' | 'status' | 'memory_type'
      >[] = [
        {
          id: 'mem-old-active',
          target_member_id: 'vip-1',
          topic_slug: 'vip-tier-pricing',
          status: 'active',
          memory_type: 'vip_offer_decision',
        },
        {
          id: 'mem-other-vip',
          target_member_id: 'vip-2',
          topic_slug: 'vip-tier-pricing',
          status: 'active',
          memory_type: 'vip_offer_decision',
        },
        {
          id: 'mem-already-old',
          target_member_id: 'vip-1',
          topic_slug: 'vip-tier-pricing',
          status: 'superseded',
          memory_type: 'vip_offer_decision',
        },
      ];

      const conflicts = detectMemoryTopicConflict(existing, 'vip-1', 'VIP Tier Pricing');
      expect(conflicts).toEqual(['mem-old-active']);
    });

    it('formats only active date-stamped provenance memories and excludes superseded items', () => {
      const records: CopilotMemoryRecord[] = [
        {
          id: '1',
          creator_id: 'c1',
          target_member_id: null,
          title: 'Brand Voice',
          memory_type: 'brand_voice',
          topic_slug: 'brand-voice',
          summary: 'Playful peer tone, keep replies punchy.',
          wikilinks: [],
          status: 'active',
          source_context: 'studio_cockpit',
          checked_at: '2026-11-13T10:00:00Z',
          recheck_when: 'Quarterly',
        },
        {
          id: '2',
          creator_id: 'c1',
          target_member_id: 'vip-1',
          title: 'Old Offer',
          memory_type: 'vip_offer_decision',
          topic_slug: 'vip-offer',
          summary: 'SUPERSEDED 50% discount.',
          wikilinks: [],
          status: 'superseded',
          source_context: 'studio_cockpit',
          checked_at: '2026-10-01T10:00:00Z',
          recheck_when: 'Never',
        },
      ];

      const block = formatProvenanceMemoryBlock(records);
      expect(block).toContain('[BRAND | brand_voice | Checked 2026-11-13] Brand Voice');
      expect(block).not.toContain('SUPERSEDED 50% discount');
      expect(block).toContain('MEMORY RULE:');
    });

    it('expires vip_offer_decision notes after 7 days while keeping evergreen brand rules active', () => {
      const refNow = new Date('2026-11-18T12:00:00Z');
      const staleOffer: CopilotMemoryRecord = {
        id: 'offer-stale',
        creator_id: 'c1',
        target_member_id: 'vip-1',
        title: 'Weekend Promo',
        memory_type: 'vip_offer_decision',
        topic_slug: 'weekend-promo',
        summary: 'Expired 20% bundle quote from 10 days ago.',
        wikilinks: [],
        status: 'active',
        source_context: 'studio_cockpit',
        checked_at: '2026-11-08T12:00:00Z',
        recheck_when: 'Weekly',
      };
      const evergreenBoundary: CopilotMemoryRecord = {
        id: 'rule-evergreen',
        creator_id: 'c1',
        target_member_id: null,
        title: 'No Off-Platform Cash',
        memory_type: 'boundary',
        topic_slug: 'no-offplatform',
        summary: 'Never move payments off SECCION.',
        wikilinks: [],
        status: 'active',
        source_context: 'studio_cockpit',
        checked_at: '2026-10-01T12:00:00Z',
        recheck_when: 'Always',
      };

      expect(DEFAULT_VIP_OFFER_TTL_DAYS).toBe(7);
      expect(isCopilotMemoryExpired(staleOffer, refNow)).toBe(true);
      expect(isCopilotMemoryExpired(evergreenBoundary, refNow)).toBe(false);

      const promptBlock = formatProvenanceMemoryBlock([staleOffer, evergreenBoundary], 6, refNow);
      expect(promptBlock).toContain('No Off-Platform Cash');
      expect(promptBlock).not.toContain('Expired 20% bundle quote');
    });

    it('enforces the 20-rule cap by selecting oldest active brand/boundary rules for overflow archival', () => {
      const rules = Array.from({ length: MAX_ACTIVE_BRAND_RULES }, (_, i) => ({
        id: `rule-${i}`,
        memory_type: (i % 2 === 0 ? 'brand_voice' : 'boundary') as CopilotMemoryRecord['memory_type'],
        status: 'active' as const,
        checked_at: new Date(Date.UTC(2026, 10, 1 + i)).toISOString(),
      }));

      const overflowIds = selectOverflowBrandRuleIdsToSupersede(rules, 'boundary', []);
      expect(MAX_ACTIVE_BRAND_RULES).toBe(20);
      expect(overflowIds).toEqual(['rule-0']);
    });
  });
});
