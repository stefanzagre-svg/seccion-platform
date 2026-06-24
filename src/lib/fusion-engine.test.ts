import { resolveSharedScore, applyInteractionEvent } from './relationship-engine';
import { calculateMasterPrice, calculatePayouts } from './pricing-service';
import {
  calculateMatch,
  calculateMatchProbability,
  rankCandidates,
  ARCHETYPE_CHEMISTRY,
  type UserProfile,
  type MatchResult,
} from './match-engine';

// ─── Test Helpers ────────────────────────────────────────────────────────────

function makeProfile(overrides: Partial<UserProfile> = {}): UserProfile {
  return {
    gender: 'male',
    location: 'Berlin',
    hobbies: ['Tech', 'Music', 'Fitness'],
    lifestyle: { workout: 'Every Day', traveling: 'Often', socializing: 'Often' },
    relationshipGoal: 'Long-term',
    relationshipType: 'Monogamous',
    sexualPreferences: ['Heterosexual'],
    familyGoals: 'Want children',
    archetype: 'visionary',
    moods: ['deep_intimate', 'creative_showcase'],
    corePassion: 'career',
    lastActiveAt: new Date().toISOString(),
    engagementScore: 75,
    ...overrides,
  };
}

// ─── Existing Tests ──────────────────────────────────────────────────────────

describe('Project Fusion Engine Core Tests', () => {
  describe('Relationship Engine (RLS)', () => {
    it('calculates the weighted harmonic mean correctly', () => {
      expect(resolveSharedScore(50, 50)).toBe(50);
      expect(resolveSharedScore(90, 10)).toBe(18);
      expect(resolveSharedScore(100, 0)).toBe(0);
    });

    it('applies interaction events with financial multipliers', () => {
      const newScore = applyInteractionEvent(10, { type: 'message_like' });
      expect(newScore).toBe(11);

      const financialScore = applyInteractionEvent(10, { type: 'custom_order_placed', monetaryValue: 100 });
      expect(financialScore).toBe(42);

      const masterScore = applyInteractionEvent(10, { type: 'message_like', isMasterSubscriber: true });
      expect(masterScore).toBe(11.25);
    });
  });

  describe('Pricing & Monetization Service', () => {
    const mockRequest = {
      baseMasterFee: 15.00,
      creators: [
        { creatorId: 'C1', basePrice: 10.00, engagementAccelerator: 1.0 },
        { creatorId: 'C2', basePrice: 20.00, engagementAccelerator: 0.5 },
      ],
      bundleDiscountPercent: 0.20
    };

    it('calculates the discounted master price anchor correctly', () => {
      const price = calculateMasterPrice(mockRequest);
      expect(price).toBe(39.00);
    });

    it('splits escrow payouts 20/80 and handles guaranteed/variable tranches', () => {
      const payouts = calculatePayouts(mockRequest);
      expect(payouts.totalRevenue).toBe(39.00);
      expect(payouts.platformCut).toBeCloseTo(7.80, 2);
      expect(payouts.totalCreatorEscrow).toBeCloseTo(31.20, 2);

      const c1 = payouts.creatorDistributions.find(c => c.creatorId === 'C1');
      expect(c1?.guaranteedPayout).toBeCloseTo(2.60, 2);
      expect(c1?.variablePayout).toBeCloseTo(7.80, 2);
      expect(c1?.totalPayout).toBeCloseTo(10.40, 2);

      const c2 = payouts.creatorDistributions.find(c => c.creatorId === 'C2');
      expect(c2?.guaranteedPayout).toBeCloseTo(5.20, 2);
      expect(c2?.variablePayout).toBeCloseTo(7.80, 2);
      expect(c2?.totalPayout).toBeCloseTo(13.00, 2);
    });
  });
});

// ─── Match Engine v2 Tests ───────────────────────────────────────────────────

describe('Match Engine v2', () => {

  describe('Hard Blockers', () => {

    it('blocks on sexual preference mismatch', () => {
      const userA = makeProfile({ gender: 'male', sexualPreferences: ['Heterosexual'] });
      const userB = makeProfile({ gender: 'male', sexualPreferences: ['Heterosexual'] });
      const result = calculateMatch(userA, userB);
      expect(result.totalScore).toBe(0);
      expect(result.hardBlockerHit).toBe('sexual_preference_mismatch');
      expect(result.compatibilityTier).toBe('blocked');
    });

    it('does NOT block when preferences include open/pansexual', () => {
      const userA = makeProfile({ gender: 'male', sexualPreferences: ['Pansexual'] });
      const userB = makeProfile({ gender: 'male', sexualPreferences: ['Bisexual'] });
      const result = calculateMatch(userA, userB);
      expect(result.totalScore).toBeGreaterThan(0);
      expect(result.hardBlockerHit).toBeNull();
    });

    it('blocks on relationship goal conflict (short vs long)', () => {
      const userA = makeProfile({ relationshipGoal: 'Short-term' });
      const userB = makeProfile({ gender: 'female', relationshipGoal: 'Long-term' });
      const result = calculateMatch(userA, userB);
      expect(result.totalScore).toBe(0);
      expect(result.hardBlockerHit).toBe('relationship_goal_conflict');
    });

    it('does NOT block when one has flexible goals', () => {
      const userA = makeProfile({ relationshipGoal: 'Short-term' });
      const userB = makeProfile({ gender: 'female', relationshipGoal: 'Open to possibilities' });
      const result = calculateMatch(userA, userB);
      expect(result.totalScore).toBeGreaterThan(0);
    });

    it('blocks on relationship type conflict (monogamous vs polyamorous)', () => {
      const userA = makeProfile({ relationshipType: 'Monogamous' });
      const userB = makeProfile({ gender: 'female', relationshipType: 'Polyamorous' });
      const result = calculateMatch(userA, userB);
      expect(result.totalScore).toBe(0);
      expect(result.hardBlockerHit).toBe('relationship_type_conflict');
    });

    it('blocks on family goals conflict', () => {
      const userA = makeProfile({ familyGoals: 'Want children' });
      const userB = makeProfile({ gender: 'female', familyGoals: "Don't want children" });
      const result = calculateMatch(userA, userB);
      expect(result.totalScore).toBe(0);
      expect(result.hardBlockerHit).toBe('family_goals_conflict');
    });

    it('blocks on smoking lifestyle conflict', () => {
      const userA = makeProfile({ lifestyle: { smoking: 'Regularly' } });
      const userB = makeProfile({ gender: 'female', lifestyle: { smoking: 'Non-Smoker' } });
      const result = calculateMatch(userA, userB);
      expect(result.totalScore).toBe(0);
      expect(result.hardBlockerHit).toBe('smoking_lifestyle_conflict');
    });

    it('blocks on drinking lifestyle conflict', () => {
      const userA = makeProfile({ lifestyle: { drinking: 'Most Nights' } });
      const userB = makeProfile({ gender: 'female', lifestyle: { drinking: 'Never' } });
      const result = calculateMatch(userA, userB);
      expect(result.totalScore).toBe(0);
      expect(result.hardBlockerHit).toBe('drinking_lifestyle_conflict');
    });
  });

  describe('Archetype Chemistry Matrix', () => {

    it('returns highest chemistry for Caregiver ↔ Dreamer (0.90)', () => {
      expect(ARCHETYPE_CHEMISTRY.caregiver.dreamer).toBe(0.90);
      expect(ARCHETYPE_CHEMISTRY.dreamer.caregiver).toBe(0.90);
    });

    it('returns high chemistry for Rebel ↔ Explorer (0.88)', () => {
      expect(ARCHETYPE_CHEMISTRY.rebel.explorer).toBe(0.88);
      expect(ARCHETYPE_CHEMISTRY.explorer.rebel).toBe(0.88);
    });

    it('returns moderate chemistry for same archetypes', () => {
      expect(ARCHETYPE_CHEMISTRY.visionary.visionary).toBe(0.65);
      expect(ARCHETYPE_CHEMISTRY.dreamer.dreamer).toBe(0.60);
    });

    it('returns lowest chemistry for Protector ↔ Rebel (0.40)', () => {
      expect(ARCHETYPE_CHEMISTRY.protector.rebel).toBe(0.40);
      expect(ARCHETYPE_CHEMISTRY.rebel.protector).toBe(0.40);
    });

    it('matrix is symmetric', () => {
      const archetypes = Object.keys(ARCHETYPE_CHEMISTRY) as Array<keyof typeof ARCHETYPE_CHEMISTRY>;
      for (const a of archetypes) {
        for (const b of archetypes) {
          expect(ARCHETYPE_CHEMISTRY[a][b]).toBe(ARCHETYPE_CHEMISTRY[b][a]);
        }
      }
    });
  });

  describe('Multi-Signal Pipeline', () => {

    it('returns a MatchResult with full breakdown', () => {
      const userA = makeProfile();
      const userB = makeProfile({
        gender: 'female',
        archetype: 'dreamer',
        corePassion: 'art',
        moods: ['creative_showcase', 'deep_intimate'],
      });

      const result = calculateMatch(userA, userB);
      expect(result.totalScore).toBeGreaterThan(0);
      expect(result.breakdown).toHaveProperty('archetypeChemistry');
      expect(result.breakdown).toHaveProperty('lifestyleSync');
      expect(result.breakdown).toHaveProperty('hobbyOverlap');
      expect(result.breakdown).toHaveProperty('moodResonance');
      expect(result.breakdown).toHaveProperty('temporalSignal');
      expect(result.breakdown).toHaveProperty('geoProximity');
      expect(result.hardBlockerHit).toBeNull();
      expect(['soul_aligned', 'high_spark', 'moderate', 'low']).toContain(result.compatibilityTier);
    });

    it('scores higher for same-location users', () => {
      const userA = makeProfile({ location: 'Paris' });
      const userBSame = makeProfile({ gender: 'female', location: 'Paris' });
      const userBDiff = makeProfile({ gender: 'female', location: 'Tokyo' });

      const resultSame = calculateMatch(userA, userBSame);
      const resultDiff = calculateMatch(userA, userBDiff);

      expect(resultSame.breakdown.geoProximity).toBeGreaterThan(resultDiff.breakdown.geoProximity);
    });

    it('scores higher for complementary archetypes', () => {
      const userA = makeProfile({ archetype: 'caregiver' });
      const dreamerB = makeProfile({ gender: 'female', archetype: 'dreamer' });
      const rebelB = makeProfile({ gender: 'female', archetype: 'rebel' });

      const resultDreamer = calculateMatch(userA, dreamerB);
      const resultRebel = calculateMatch(userA, rebelB);

      expect(resultDreamer.breakdown.archetypeChemistry).toBeGreaterThan(resultRebel.breakdown.archetypeChemistry);
    });

    it('scores mood resonance higher when passions match', () => {
      const userA = makeProfile({ corePassion: 'travel', moods: ['travel_trip', 'grab_drink'] });
      const userBMatch = makeProfile({ gender: 'female', corePassion: 'travel', moods: ['travel_trip', 'party_dance'] });
      const userBNoMatch = makeProfile({ gender: 'female', corePassion: 'fitness', moods: ['workout_mate'] });

      const resultMatch = calculateMatch(userA, userBMatch);
      const resultNoMatch = calculateMatch(userA, userBNoMatch);

      expect(resultMatch.breakdown.moodResonance).toBeGreaterThan(resultNoMatch.breakdown.moodResonance);
    });
  });

  describe('Compatibility Tiers', () => {

    it('classifies soul_aligned for 85+ scores', () => {
      const userA = makeProfile({
        archetype: 'caregiver',
        hobbies: ['Cooking', 'Reading', 'Music', 'Yoga', 'Art'],
        lifestyle: { workout: 'Every Day', socializing: 'Every Day', 'healthy eating': 'Every Day' },
        corePassion: 'art',
        moods: ['deep_intimate', 'dinner_date'],
        location: 'Milan',
      });
      const userB = makeProfile({
        gender: 'female',
        archetype: 'dreamer',
        hobbies: ['Cooking', 'Reading', 'Music', 'Yoga', 'Art'],
        lifestyle: { workout: 'Every Day', socializing: 'Every Day', 'healthy eating': 'Every Day' },
        corePassion: 'art',
        moods: ['deep_intimate', 'dinner_date'],
        location: 'Milan',
        engagementScore: 95,
      });

      const result = calculateMatch(userA, userB);
      expect(result.compatibilityTier).toBe('soul_aligned');
      expect(result.totalScore).toBeGreaterThanOrEqual(85);
    });

    it('classifies blocked for hard-blocked pairs', () => {
      const userA = makeProfile({ relationshipType: 'Monogamous' });
      const userB = makeProfile({ gender: 'female', relationshipType: 'Open Relationship' });
      const result = calculateMatch(userA, userB);
      expect(result.compatibilityTier).toBe('blocked');
    });
  });

  describe('Batch Ranking', () => {

    it('returns candidates sorted by score, excluding blocked', () => {
      const me = makeProfile({ archetype: 'visionary' });

      const candidates = [
        {
          id: 'c1',
          profile: makeProfile({
            gender: 'female', archetype: 'rebel', location: 'Berlin',
            hobbies: ['Tech', 'Music'],
          }),
        },
        {
          id: 'c2',
          profile: makeProfile({
            gender: 'female', archetype: 'dreamer', location: 'Berlin',
            hobbies: ['Art', 'Music', 'Fitness'],
          }),
        },
        {
          id: 'c3-blocked',
          profile: makeProfile({
            gender: 'female', relationshipType: 'Open Relationship',
          }),
        },
      ];

      const ranked = rankCandidates(me, candidates, 10);

      // Blocked candidate should be filtered out
      expect(ranked.find(r => r.id === 'c3-blocked')).toBeUndefined();

      // Results should be sorted descending by totalScore
      for (let i = 1; i < ranked.length; i++) {
        expect(ranked[i - 1].result.totalScore).toBeGreaterThanOrEqual(ranked[i].result.totalScore);
      }
    });

    it('respects the limit parameter', () => {
      const me = makeProfile();
      const candidates = Array.from({ length: 20 }, (_, i) => ({
        id: `c${i}`,
        profile: makeProfile({ gender: 'female', location: `City${i}` }),
      }));

      const ranked = rankCandidates(me, candidates, 5);
      expect(ranked.length).toBeLessThanOrEqual(5);
    });
  });

  describe('Backward Compatibility', () => {

    it('calculateMatchProbability returns same score as calculateMatch().totalScore', () => {
      const userA = makeProfile();
      const userB = makeProfile({ gender: 'female', archetype: 'dreamer' });

      const legacyScore = calculateMatchProbability(userA, userB);
      const newResult = calculateMatch(userA, userB);

      expect(legacyScore).toBe(newResult.totalScore);
    });
  });

  describe('Narrative Resonance', () => {
    it('returns neutral fallback 50 if bioAnalysis is missing', () => {
      const userA = makeProfile({ bioAnalysis: undefined });
      const userB = makeProfile({ gender: 'female', bioAnalysis: undefined });
      const result = calculateMatch(userA, userB);
      expect(result.breakdown.narrativeResonance).toBe(50);
    });

    it('returns high compatibility for matching high vulnerability and low defensiveness profiles', () => {
      const userA = makeProfile({
        bioAnalysis: {
          Emotional_Vector: { Vulnerability_Score: 0.9, Defensive_Score: 0.1, Idealization_Bias: 0.2 },
          Interaction_Style: { Introspective: 'Very High', Directness: 'High', Witty: 'Moderate' },
          Behavioral_Pattern: { Investment_Driver: ['Emotional Connection', 'Validation'], Red_Flags: [] }
        }
      });
      const userB = makeProfile({
        gender: 'female',
        bioAnalysis: {
          Emotional_Vector: { Vulnerability_Score: 0.85, Defensive_Score: 0.15, Idealization_Bias: 0.3 },
          Interaction_Style: { Introspective: 'High', Directness: 'High', Witty: 'Moderate' },
          Behavioral_Pattern: { Investment_Driver: ['Emotional Connection', 'Experience'], Red_Flags: [] }
        }
      });
      const result = calculateMatch(userA, userB);
      expect(result.breakdown.narrativeResonance).toBeGreaterThanOrEqual(75);
    });

    it('returns lower compatibility for defensive or low introspection profiles', () => {
      const userA = makeProfile({
        bioAnalysis: {
          Emotional_Vector: { Vulnerability_Score: 0.3, Defensive_Score: 0.8, Idealization_Bias: 0.6 },
          Interaction_Style: { Introspective: 'Low', Directness: 'Moderate', Witty: 'Low' },
          Behavioral_Pattern: { Investment_Driver: ['Security'], Red_Flags: ['High Defensiveness'] }
        }
      });
      const userB = makeProfile({
        gender: 'female',
        bioAnalysis: {
          Emotional_Vector: { Vulnerability_Score: 0.2, Defensive_Score: 0.75, Idealization_Bias: 0.5 },
          Interaction_Style: { Introspective: 'Low', Directness: 'Moderate', Witty: 'Low' },
          Behavioral_Pattern: { Investment_Driver: ['Security'], Red_Flags: ['High Defensiveness'] }
        }
      });
      const result = calculateMatch(userA, userB);
      expect(result.breakdown.narrativeResonance).toBeLessThan(50);
    });
  });

  describe('Edge Cases', () => {

    it('handles empty profiles gracefully', () => {
      const empty: UserProfile = {
        gender: '',
        location: '',
        hobbies: [],
        lifestyle: {},
        relationshipGoal: '',
        relationshipType: '',
        sexualPreferences: [],
        familyGoals: '',
      };

      const result = calculateMatch(empty, empty);
      // Should not crash — produces a valid result
      expect(result.totalScore).toBeGreaterThanOrEqual(0);
      expect(result.totalScore).toBeLessThanOrEqual(100);
    });

    it('handles null profiles with blocked result', () => {
      const result = calculateMatch(null as any, null as any);
      expect(result.totalScore).toBe(0);
      expect(result.hardBlockerHit).toBe('missing_profile');
    });

    it('handles missing archetypes with neutral fallback', () => {
      const userA = makeProfile({ archetype: undefined });
      const userB = makeProfile({ gender: 'female', archetype: undefined });
      const result = calculateMatch(userA, userB);
      expect(result.breakdown.archetypeChemistry).toBe(50); // neutral
    });
  });
});
