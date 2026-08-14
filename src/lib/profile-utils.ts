/**
 * Centralized Profile Normalization & Privacy Helpers
 * SECCION Platform — Shared Profile Utilities
 */

import { scoreToLevel, RELATIONSHIP_LEVELS, type RelationshipLevelKey } from './relationship-engine';

export interface HiddenValuesMap {
  [fieldKey: string]: {
    [value: string]: RelationshipLevelKey | string;
  };
}

export interface ProfilePrivacySettings {
  display_age?: string;
  hidden_values?: HiddenValuesMap;
  private_call_rate?: number;
  [key: string]: unknown;
}

export interface BaseProfileMedia {
  media_type: 'image' | 'video';
  media_url: string;
  video_start_time?: number | null;
  video_end_time?: number | null;
  [key: string]: unknown;
}

/**
 * Normalizes media albums from legacy `album_photos` and modern `album_media`.
 */
export function normalizeProfileMedia(
  albumMedia?: BaseProfileMedia[] | null,
  albumPhotos?: string[] | null
): BaseProfileMedia[] {
  if (albumMedia && albumMedia.length > 0) {
    return albumMedia;
  }
  if (albumPhotos && albumPhotos.length > 0) {
    return albumPhotos.map((url) => ({
      media_type: 'image' as const,
      media_url: url,
    }));
  }
  return [];
}

/**
 * Counts how many items in a specific field are hidden for the given viewer relationship score.
 */
export function getHiddenFieldCount(
  fieldKey: string,
  hiddenValues: HiddenValuesMap | undefined,
  viewerScore: number = 0
): number {
  if (!hiddenValues || !hiddenValues[fieldKey]) return 0;
  let count = 0;
  for (const val in hiddenValues[fieldKey]) {
    const requiredLevelKey = hiddenValues[fieldKey][val];
    const requiredLevel = RELATIONSHIP_LEVELS.find((l) => l.key === requiredLevelKey);
    if (requiredLevel && viewerScore < requiredLevel.minScore) {
      count++;
    }
  }
  return count;
}

/**
 * Checks whether an individual item is hidden from the viewer based on relationship score.
 */
export function isFieldItemHidden(
  fieldKey: string,
  itemValue: string,
  hiddenValues: HiddenValuesMap | undefined,
  viewerScore: number = 0
): boolean {
  if (!hiddenValues || !hiddenValues[fieldKey]?.[itemValue]) return false;
  const requiredLevelKey = hiddenValues[fieldKey][itemValue];
  const requiredLevel = RELATIONSHIP_LEVELS.find((l) => l.key === requiredLevelKey);
  return !!(requiredLevel && viewerScore < requiredLevel.minScore);
}

/**
 * Formats a hidden counter into a standard UI badge label.
 */
export function formatHiddenBadgeLabel(count: number): string | null {
  if (count <= 0) return null;
  return count === 1 ? 'Hidden' : `Hidden +${count}`;
}

/**
 * Normalizes spoken languages, ensuring fallback to default 'English'.
 */
export function normalizeSpokenLanguages(languages?: string[] | null): string[] {
  if (languages && languages.length > 0) {
    return languages;
  }
  return ['English'];
}
