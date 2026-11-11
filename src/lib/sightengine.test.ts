import { describe, it, expect } from 'vitest';
import {
  verifyMemberSelfie,
  analyzeImage,
  classifyOrderIntent,
  qualifyDeliveredMedia
} from './sightengine';

describe('Sightengine Service Module', () => {
  it('handles missing credentials or invalid image gracefully without crashing', async () => {
    const verdict = await verifyMemberSelfie('https://invalid-non-existent-image-url.com/selfie.jpg');
    expect(verdict).toBeDefined();
    expect(verdict.isAdult).toBe(false);
    expect(verdict.action).toBe('challenge');
  });

  it('analyzeImage returns null gracefully when given invalid remote url or offline network', async () => {
    const res = await analyzeImage('https://invalid-test-url.com/fake.png');
    expect(res === null || res.status === 'failure').toBe(true);
  });

  describe('V3.0 Two-Stage SFW vs. NSFW (+18) Gate', () => {
    it('Stage 1: classifies mainstream coaching & lifestyle orders as SFW (sfw_credits)', () => {
      const verdict = classifyOrderIntent({
        category: 'Tutorial & Coaching',
        title: 'Personalized upper-body gym routine',
        description: 'Please record a 5-minute posture and form review video for my bench press.'
      });
      expect(verdict.rating).toBe('SFW');
      expect(verdict.requiredLedger).toBe('sfw_credits');
      expect(verdict.detectedBy).toBe('sfw_default');
    });

    it('Stage 1: classifies Explicit Content category as NSFW_18 (sovereign_red_pills)', () => {
      const verdict = classifyOrderIntent({
        category: 'Explicit Content',
        title: 'Custom private set',
        description: 'Bespoke photo set for VIP tier.'
      });
      expect(verdict.rating).toBe('NSFW_18');
      expect(verdict.requiredLedger).toBe('sovereign_red_pills');
      expect(verdict.detectedBy).toBe('explicit_category');
    });

    it('Stage 1: detects disguised 18+ keywords in EN and ES even when category is marked SFW', () => {
      const enVerdict = classifyOrderIntent({
        category: 'Lifestyle & Fashion',
        title: 'Private boudoir video',
        description: 'Uncensored topless try-on haul'
      });
      expect(enVerdict.rating).toBe('NSFW_18');
      expect(enVerdict.requiredLedger).toBe('sovereign_red_pills');
      expect(enVerdict.detectedBy).toBe('prompt_heuristics');

      const esVerdict = classifyOrderIntent({
        category: 'Tutorial & Coaching',
        title: 'Video personalizado',
        description: 'Quiero un video en lencería sin censura para mí'
      });
      expect(esVerdict.rating).toBe('NSFW_18');
      expect(esVerdict.requiredLedger).toBe('sovereign_red_pills');
      expect(esVerdict.detectedBy).toBe('prompt_heuristics');
    });

    it('Stage 2: blocks explicit 18+ media delivery on an SFW-rated escrow order', async () => {
      const blocked = await qualifyDeliveredMedia(
        'https://cdn.seccion.ai/deliveries/uncensored_nude_set.mp4',
        'SFW'
      );
      expect(blocked.rating).toBe('NSFW_18');
      expect(blocked.isBlockedForSfwLedger).toBe(true);
      expect(blocked.requiredLedger).toBe('sovereign_red_pills');
    });

    it('Stage 2: permits explicit 18+ media delivery when order was funded via NSFW_18 Sovereign Red Pills', async () => {
      const allowed = await qualifyDeliveredMedia(
        'https://cdn.seccion.ai/deliveries/uncensored_nude_set.mp4',
        'NSFW_18'
      );
      expect(allowed.rating).toBe('NSFW_18');
      expect(allowed.isBlockedForSfwLedger).toBe(false);
    });
  });
});
