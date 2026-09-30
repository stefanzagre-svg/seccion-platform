import { describe, it, expect } from 'vitest';
import { scrubPIIBeforeLLM } from '@/lib/ai/pii-scrubber';
import { classifyMessageIntent } from '@/lib/ai/intent-classifier';
import { analyzeMemberFriction } from '@/lib/ai/whale-friction-detector';
import { resolveRampDirective, calculateTypingCadence } from '@/lib/ai/conversion-engine';
import { extractWikilinks, buildVaultGraph } from '@/lib/vault/vault-graph-engine';

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
});
