import { describe, it, expect } from 'vitest';
import {
  normalizeProfileMedia,
  normalizeSpokenLanguages,
  getHiddenFieldCount,
  isFieldItemHidden,
  formatHiddenBadgeLabel,
} from './profile-utils';

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
});
