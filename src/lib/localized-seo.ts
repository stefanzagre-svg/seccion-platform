import type { Metadata } from 'next';

export type SeoLocale = 'en' | 'es' | 'fr';

export const SEO_LOCALES: readonly SeoLocale[] = ['en', 'es', 'fr'];

const BASE_URL = 'https://seccion.ai';

/**
 * Resolves the canonical URL path for a public SEO page and locale.
 * English keeps root paths to preserve existing authority links; ES/FR sit under /es and /fr.
 */
export function getLocalizedPath(basePath: string, locale: SeoLocale): string {
  const normalized = basePath === '/' ? '' : basePath.startsWith('/') ? basePath : `/${basePath}`;
  if (locale === 'en') {
    return normalized || '/';
  }
  return `/${locale}${normalized}`;
}

/**
 * Resolves the full canonical HTTPS URL for a public SEO page and locale.
 */
export function getLocalizedUrl(basePath: string, locale: SeoLocale): string {
  return `${BASE_URL}${getLocalizedPath(basePath, locale)}`;
}

/**
 * Generates Next.js `alternates` metadata with canonical URL and bidirectional EN/ES/FR hreflang tags.
 */
export function buildLocaleAlternates(
  basePath: string,
  locale: SeoLocale
): NonNullable<Metadata['alternates']> {
  const enUrl = getLocalizedUrl(basePath, 'en');
  return {
    canonical: getLocalizedUrl(basePath, locale),
    languages: {
      en: enUrl,
      es: getLocalizedUrl(basePath, 'es'),
      fr: getLocalizedUrl(basePath, 'fr'),
      'x-default': enUrl,
    },
  };
}

/**
 * Maps internal locale codes to OpenGraph locale identifiers.
 */
export function getOpenGraphLocale(locale: SeoLocale): string {
  if (locale === 'fr') return 'fr_FR';
  if (locale === 'es') return 'es_ES';
  return 'en_US';
}

/**
 * Picks localized content for the target locale, falling back to English when omitted.
 */
export function pickLocalized<T>(locale: SeoLocale, en: T, es?: T, fr?: T): T {
  if (locale === 'fr' && fr) return fr;
  if (locale === 'es' && es) return es;
  return en;
}

/**
 * Trims a metadata title cleanly at a word boundary so "<title> | SECCION" stays <= 70 chars.
 */
export function fitSeoTitle(title: string, maxChars = 58): string {
  const clean = title.trim();
  if (clean.length <= maxChars) return clean;
  const sliced = clean.slice(0, maxChars);
  const lastSpace = sliced.lastIndexOf(' ');
  const trimmed = lastSpace > Math.floor(maxChars * 0.6) ? sliced.slice(0, lastSpace) : sliced;
  return trimmed.replace(/[:\-–—,;.\s]+$/, '');
}

/**
 * Trims a meta description cleanly at a word boundary inside search-engine display bounds (<= 160 chars).
 */
export function fitSeoDescription(description: string, maxChars = 160): string {
  const clean = description.trim();
  if (clean.length <= maxChars) return clean;
  const sliced = clean.slice(0, maxChars - 1);
  const lastSpace = sliced.lastIndexOf(' ');
  const trimmed = lastSpace > 110 ? sliced.slice(0, lastSpace) : sliced;
  return `${trimmed.replace(/[:\-–—,;.\s]+$/, '')}.`;
}
