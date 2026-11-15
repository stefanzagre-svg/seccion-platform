import type { Metadata } from 'next';

/**
 * Builds unique `noindex, nofollow` metadata for authenticated, onboarding, or
 * internal utility routes so they never fall back to the root homepage title
 * or meta description in search-engine site scans.
 */
export function createNoIndexMetadata(title: string, description: string): Metadata {
  return {
    title,
    description,
    robots: {
      index: false,
      follow: false,
    },
  };
}
