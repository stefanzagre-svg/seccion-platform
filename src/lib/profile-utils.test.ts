import { describe, it, expect } from 'vitest';
import {
  normalizeProfileMedia,
  normalizeSpokenLanguages,
  getHiddenFieldCount,
  isFieldItemHidden,
  formatHiddenBadgeLabel,
} from './profile-utils';
import {
  buildArchetypeSynergyDefaults,
  isCountryStrictAgeMandate,
  normalizeArchetypeId,
  normalizePassionId,
} from './constants';
import { calculateMatch } from './match-engine';

describe('Profile Utils (DRY Normalizer & Privacy Helper)', () => {
  describe('normalizeProfileMedia()', () => {
    it('returns album_media when available', () => {
      const albumMedia = [
        { media_type: 'video' as const, media_url: 'https://example.com/video.mp4', video_start_time: 0, video_end_time: 10 },
      ];
      const res = normalizeProfileMedia(albumMedia, ['https://example.com/photo.jpg']);
      expect(res).toEqual(albumMedia);
    });

    it('falls back to album_photos when album_media is missing or empty', () => {
      const albumPhotos = ['https://example.com/1.jpg', 'https://example.com/2.jpg'];
      const res = normalizeProfileMedia([], albumPhotos);
      expect(res).toEqual([
        { media_type: 'image', media_url: 'https://example.com/1.jpg' },
        { media_type: 'image', media_url: 'https://example.com/2.jpg' },
      ]);
    });

    it('returns empty array when both are empty or undefined', () => {
      expect(normalizeProfileMedia(null, null)).toEqual([]);
    });
  });

  describe('normalizeSpokenLanguages()', () => {
    it('returns provided languages list', () => {
      expect(normalizeSpokenLanguages(['French', 'Spanish'])).toEqual(['French', 'Spanish']);
    });

    it('falls back to ["English"] when empty or undefined', () => {
      expect(normalizeSpokenLanguages([])).toEqual(['English']);
      expect(normalizeSpokenLanguages(null)).toEqual(['English']);
    });
  });

  describe('Privacy & Hidden Field Calculations', () => {
    const hiddenMap = {
      hobbies: {
        'Gaming & Esports': 'friendly', // minScore: 16
        'World Travel': 'intimate',      // minScore: 45
      },
    };

    it('correctly calculates hidden field counts based on viewer score', () => {
      // Score 0 (strangers): both hidden
      expect(getHiddenFieldCount('hobbies', hiddenMap, 0)).toBe(2);

      // Score 20 (friendly): only 'World Travel' hidden
      expect(getHiddenFieldCount('hobbies', hiddenMap, 20)).toBe(1);

      // Score 60 (intimate): none hidden
      expect(getHiddenFieldCount('hobbies', hiddenMap, 60)).toBe(0);
    });

    it('correctly checks isFieldItemHidden', () => {
      expect(isFieldItemHidden('hobbies', 'Gaming & Esports', hiddenMap, 10)).toBe(true);
      expect(isFieldItemHidden('hobbies', 'Gaming & Esports', hiddenMap, 20)).toBe(false);
      expect(isFieldItemHidden('hobbies', 'Nonexistent', hiddenMap, 0)).toBe(false);
    });

    it('formats hidden badge label cleanly', () => {
      expect(formatHiddenBadgeLabel(0)).toBeNull();
      expect(formatHiddenBadgeLabel(1)).toBe('Hidden');
      expect(formatHiddenBadgeLabel(3)).toBe('Hidden +3');
    });
  });

  describe('60-Second Smart Synergy Onboarding & Country Compliance Engine', () => {
    it('normalizes legacy, alias, and uppercase archetype strings to canonical IDs', () => {
      expect(normalizeArchetypeId('The Dreamer')).toBe('dreamer');
      expect(normalizeArchetypeId('DREAMER')).toBe('dreamer');
      expect(normalizeArchetypeId('rebel')).toBe('rebel');
      expect(normalizeArchetypeId('maverick')).toBe('rebel');
      expect(normalizeArchetypeId('The Intellectual')).toBe('visionary');
      expect(normalizeArchetypeId('mystic')).toBe('alchemist');
      expect(normalizeArchetypeId('stoic')).toBe('protector');
      expect(normalizeArchetypeId('The Lover')).toBe('hedonist');
      expect(normalizeArchetypeId('unknown_value')).toBe('explorer');
    });

    it('normalizes UI passion strings to canonical PassionIds across all save paths', () => {
      expect(normalizePassionId('ai_tech')).toBe('career');
      expect(normalizePassionId('culinary')).toBe('art');
      expect(normalizePassionId('creative')).toBe('art');
      expect(normalizePassionId('dating')).toBe('music');
      expect(normalizePassionId('adult')).toBe('music');
      expect(normalizePassionId('wellness')).toBe('fitness');
      expect(normalizePassionId('travel')).toBe('travel');
    });

    it('enforces strict age mandate only in GB and US at entry', () => {
      expect(isCountryStrictAgeMandate('GB')).toBe(true);
      expect(isCountryStrictAgeMandate('UK')).toBe(true);
      expect(isCountryStrictAgeMandate('US')).toBe(true);
      expect(isCountryStrictAgeMandate('ES')).toBe(false);
      expect(isCountryStrictAgeMandate('FR')).toBe(false);
      expect(isCountryStrictAgeMandate('CO')).toBe(false);
      expect(isCountryStrictAgeMandate('GLOBAL')).toBe(false);
    });

    it('builds full 5-signal synergy defaults from archetype and passion', () => {
      const defaults = buildArchetypeSynergyDefaults('dreamer', 'music', 'en');
      expect(defaults.archetype).toBe('dreamer');
      expect(defaults.corePassion).toBe('music');
      expect(defaults.moods.length).toBeGreaterThanOrEqual(3);
      expect(defaults.hobbies.length).toBeGreaterThanOrEqual(5);
      expect(Object.keys(defaults.lifestyleHabits).length).toBeGreaterThanOrEqual(10);
      expect(defaults.lifestyleHabits.smoking).toBe('Non-Smoker');
      expect(defaults.avatarUrl.startsWith('data:image/svg+xml;utf8,')).toBe(true);
      expect(defaults.bioPromptAnswer.length).toBeGreaterThan(15);
    });

    it('never hard-blocks Member <-> Creator matches on purpose mismatch and computes high synergy', () => {
      const memberDefaults = buildArchetypeSynergyDefaults('caregiver', 'art', 'en');
      const creatorDefaults = buildArchetypeSynergyDefaults('dreamer', 'art', 'en');

      const result = calculateMatch(
        {
          id: 'member-1',
          gender: 'Man',
          sexualPreferences: ['Everyone'],
          archetype: memberDefaults.archetype,
          corePassion: memberDefaults.corePassion,
          moods: memberDefaults.moods,
          hobbies: memberDefaults.hobbies,
          lifestyleHabits: memberDefaults.lifestyleHabits,
          bioAnalysis: memberDefaults.bioAnalysis,
          memberPurposes: ['lifestyle'],
        },
        {
          id: 'creator-magali',
          gender: 'Woman',
          sexualPreferences: ['Everyone'],
          archetype: 'The Dreamer', // test legacy display name normalization
          corePassion: creatorDefaults.corePassion,
          moods: creatorDefaults.moods,
          hobbies: creatorDefaults.hobbies,
          lifestyleHabits: creatorDefaults.lifestyleHabits,
          bioAnalysis: creatorDefaults.bioAnalysis,
          memberPurposes: ['creator'],
        }
      );

      expect(result.hardBlockerHit).toBeNull();
      expect(result.totalScore).toBeGreaterThanOrEqual(60);
    });
  });
});
