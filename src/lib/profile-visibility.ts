/**
 * Canonical profile visibility, geoblocking (including Moroccan Domestic Shield),
 * and discovery/onboarding readiness helpers.
 */

export interface PrivacySettingsShape {
  blocked_countries?: unknown;
  morocco_domestic_shield?: boolean;
  [key: string]: unknown;
}

export interface VisibilityProfileShape {
  id?: string | null;
  role?: string | null;
  is_approved_founder_creator?: boolean | null;
  avatar_url?: string | null;
  bio?: string | null;
  bio_prompt_answer?: string | null;
  archetype?: string | null;
  lifestyle_habits?: Record<string, unknown> | null;
  sexual_preference?: string | null;
  is_kyc_verified?: boolean | null;
  privacy_settings?: PrivacySettingsShape | Record<string, unknown> | null;
}

export interface ReadinessOptions {
  /** Exact count of non-hidden rows in profile_media for this user. */
  publicMediaCount?: number | null;
  /** When true (default), creators must also be KYC verified for public discovery. */
  requireCreatorKyc?: boolean;
}

export interface GeoCodeInfo {
  code: string;
  name: string | null;
  isValid: boolean;
}

const COUNTRY_FALLBACK_NAMES: Record<string, { en: string; es: string; fr: string }> = {
  AE: { en: 'United Arab Emirates', es: 'Emiratos Árabes Unidos', fr: 'Émirats arabes unis' },
  AR: { en: 'Argentina', es: 'Argentina', fr: 'Argentine' },
  BE: { en: 'Belgium', es: 'Bélgica', fr: 'Belgique' },
  BG: { en: 'Bulgaria', es: 'Bulgaria', fr: 'Bulgarie' },
  BR: { en: 'Brazil', es: 'Brasil', fr: 'Brésil' },
  CA: { en: 'Canada', es: 'Canadá', fr: 'Canada' },
  CH: { en: 'Switzerland', es: 'Suiza', fr: 'Suisse' },
  CN: { en: 'China', es: 'China', fr: 'Chine' },
  CO: { en: 'Colombia', es: 'Colombia', fr: 'Colombie' },
  DE: { en: 'Germany', es: 'Alemania', fr: 'Allemagne' },
  DZ: { en: 'Algeria', es: 'Argelia', fr: 'Algérie' },
  EG: { en: 'Egypt', es: 'Egipto', fr: 'Égypte' },
  ES: { en: 'Spain', es: 'España', fr: 'Espagne' },
  FR: { en: 'France', es: 'Francia', fr: 'France' },
  GB: { en: 'United Kingdom', es: 'Reino Unido', fr: 'Royaume-Uni' },
  IR: { en: 'Iran', es: 'Irán', fr: 'Iran' },
  IT: { en: 'Italy', es: 'Italia', fr: 'Italie' },
  MA: { en: 'Morocco', es: 'Marruecos', fr: 'Maroc' },
  MX: { en: 'Mexico', es: 'México', fr: 'Mexique' },
  NL: { en: 'Netherlands', es: 'Países Bajos', fr: 'Pays-Bas' },
  PL: { en: 'Poland', es: 'Polonia', fr: 'Pologne' },
  PT: { en: 'Portugal', es: 'Portugal', fr: 'Portugal' },
  RO: { en: 'Romania', es: 'Rumanía', fr: 'Roumanie' },
  RU: { en: 'Russia', es: 'Rusia', fr: 'Russie' },
  SA: { en: 'Saudi Arabia', es: 'Arabia Saudita', fr: 'Arabie saoudite' },
  TN: { en: 'Tunisia', es: 'Túnez', fr: 'Tunisie' },
  TR: { en: 'Turkey', es: 'Turquía', fr: 'Turquie' },
  UA: { en: 'Ukraine', es: 'Ucrania', fr: 'Ukraine' },
  US: { en: 'United States', es: 'Estados Unidos', fr: 'États-Unis' },
};

const displayNamesCache = new Map<string, Intl.DisplayNames | null>();

function getRegionDisplayNames(locale: string): Intl.DisplayNames | null {
  const shortLocale = (locale || 'en').toLowerCase().slice(0, 2);
  if (displayNamesCache.has(shortLocale)) {
    return displayNamesCache.get(shortLocale) || null;
  }
  try {
    if (typeof Intl !== 'undefined' && typeof Intl.DisplayNames === 'function') {
      const formatter = new Intl.DisplayNames([shortLocale], { type: 'region' });
      displayNamesCache.set(shortLocale, formatter);
      return formatter;
    }
  } catch {
    // Ignore Intl fallback failures
  }
  displayNamesCache.set(shortLocale, null);
  return null;
}

/**
 * Resolve a 2-letter ISO 3166-1 alpha-2 country code (e.g. "MA", "GB", "AE")
 * to its localized full country name for hover readers and audit labels.
 */
export function getCountryDisplayName(
  code?: string | null,
  locale: string = 'en'
): string | null {
  const normalized = normalizeCountryCode(code);
  if (!normalized || !/^[A-Z]{2}$/.test(normalized)) {
    return null;
  }

  const shortLocale = (locale || 'en').toLowerCase().slice(0, 2);
  const langKey: 'en' | 'es' | 'fr' =
    shortLocale === 'es' ? 'es' : shortLocale === 'fr' ? 'fr' : 'en';

  const formatter = getRegionDisplayNames(langKey);
  if (formatter) {
    try {
      const resolved = formatter.of(normalized);
      if (
        resolved &&
        resolved.toUpperCase() !== normalized &&
        !/unknown\s+region|regi[oó]n\s+desconocida|r[eé]gion\s+inconnue/i.test(resolved)
      ) {
        return resolved;
      }
    } catch {
      // Fallback to static lookup
    }
  }

  return COUNTRY_FALLBACK_NAMES[normalized]?.[langKey] || null;
}

/**
 * Parse a comma/whitespace-separated string or array of ISO country codes into
 * deduplicated GeoCodeInfo descriptors with localized full country names.
 */
export function readGeoRestrictionCodes(
  input: string | Array<string | null | undefined> | null | undefined,
  locale: string = 'en'
): GeoCodeInfo[] {
  const rawTokens = Array.isArray(input)
    ? input.filter((v): v is string => typeof v === 'string')
    : typeof input === 'string'
      ? input.split(/[\s,;]+/)
      : [];

  const seen = new Set<string>();
  const results: GeoCodeInfo[] = [];

  for (const token of rawTokens) {
    const code = token.toUpperCase().trim();
    if (!code || seen.has(code)) continue;
    seen.add(code);

    const name = getCountryDisplayName(code, locale);
    results.push({
      code,
      name,
      isValid: Boolean(name),
    });
  }

  return results;
}

let cachedGeoCountry: string | null | undefined;
let inflightGeoPromise: Promise<string | null> | null = null;

/** Normalize a Cloudflare / ISO country header into a 2-letter uppercase code. */
export function normalizeCountryCode(country?: string | null): string | null {
  if (!country || typeof country !== 'string') return null;
  const normalized = country.toUpperCase().trim();
  if (!normalized || normalized === 'XX' || normalized === 'T1') return null;
  return normalized;
}

/** Reset cached client visitor country (intended for test isolation). */
export function resetVisitorCountryCache(): void {
  cachedGeoCountry = undefined;
  inflightGeoPromise = null;
}

/** Fetch visitor ISO country code from `/api/v2/geo` on client runtimes. */
export async function fetchVisitorCountryCode(): Promise<string | null> {
  if (typeof window === 'undefined') return null;
  if (cachedGeoCountry !== undefined) return cachedGeoCountry;
  if (inflightGeoPromise) return inflightGeoPromise;

  inflightGeoPromise = fetch('/api/v2/geo', { cache: 'no-store' })
    .then(async (res) => {
      if (!res.ok) return null;
      const body = await res.json().catch(() => null);
      const code = normalizeCountryCode(body?.country);
      cachedGeoCountry = code;
      return code;
    })
    .catch(() => {
      cachedGeoCountry = null;
      return null;
    })
    .finally(() => {
      inflightGeoPromise = null;
    });

  return inflightGeoPromise;
}

/**
 * Determine whether a visitor from `visitorCountry` (e.g. Cloudflare `cf-ipcountry`)
 * must be blocked from viewing `privacySettings`.
 */
export function isCountryBlocked(
  privacySettings: PrivacySettingsShape | Record<string, unknown> | null | undefined,
  visitorCountry?: string | null
): boolean {
  const country = normalizeCountryCode(visitorCountry);
  if (!country || !privacySettings || typeof privacySettings !== 'object') {
    return false;
  }

  if (privacySettings.morocco_domestic_shield === true && country === 'MA') {
    return true;
  }

  if (privacySettings.geo_restriction_enabled === false) {
    return false;
  }

  const rawList = privacySettings.blocked_countries;
  if (!Array.isArray(rawList) || rawList.length === 0) {
    return false;
  }

  return rawList.some((entry) => normalizeCountryCode(typeof entry === 'string' ? entry : null) === country);
}

/**
 * Merge Morocco Domestic Shield / blocked_countries into existing `privacy_settings`
 * without clobbering unrelated keys (e.g. `face_blur`, `display_age`, `age_verification`).
 */
export function buildMergedPrivacySettings(
  existingPrivacySettings: Record<string, any> | null | undefined = {},
  moroccoShield: boolean,
  blockedCountries: string[]
): Record<string, any> {
  const base = existingPrivacySettings && typeof existingPrivacySettings === 'object'
    ? existingPrivacySettings
    : {};

  const normalizedIncoming = (Array.isArray(blockedCountries) ? blockedCountries : [])
    .map((c) => normalizeCountryCode(c))
    .filter((c): c is string => Boolean(c));

  if (!moroccoShield && normalizedIncoming.length === 0) {
    return base;
  }

  const existingBlocked = (Array.isArray(base.blocked_countries) ? base.blocked_countries : [])
    .map((c: unknown) => normalizeCountryCode(typeof c === 'string' ? c : null))
    .filter((c): c is string => Boolean(c));

  return {
    ...base,
    blocked_countries: Array.from(new Set([...existingBlocked, ...normalizedIncoming])),
    morocco_domestic_shield: moroccoShield,
  };
}

/**
 * Check canonical public discovery readiness:
 * - avatar_url present
 * - bio or bio_prompt_answer present
 * - >= 2 non-hidden `profile_media` items
 * - is_kyc_verified === true for creators when `requireCreatorKyc` is enabled (default)
 */
export function isProfileReadyForDiscovery(
  profile: VisibilityProfileShape | null | undefined,
  options: ReadinessOptions = {}
): boolean {
  if (!profile) return false;

  const hasAvatar = Boolean(typeof profile.avatar_url === 'string' && profile.avatar_url.trim().length > 0);
  if (!hasAvatar) return false;

  const hasBio = Boolean(
    (typeof profile.bio === 'string' && profile.bio.trim().length > 0) ||
      (typeof profile.bio_prompt_answer === 'string' && profile.bio_prompt_answer.trim().length > 0)
  );
  if (!hasBio) return false;

  const mediaCount = typeof options.publicMediaCount === 'number' ? options.publicMediaCount : 0;
  if (mediaCount < 2) return false;

  const requireKyc = options.requireCreatorKyc ?? true;
  if (requireKyc && profile.role === 'creator' && profile.is_kyc_verified !== true) {
    return false;
  }

  return true;
}

/**
 * Canonical onboarding completion check used to decide when `sb_ob=1`
 * and `/onboarding` exit redirects may be granted.
 */
export function isOnboardingProfileComplete(
  profile: VisibilityProfileShape | null | undefined
): boolean {
  if (!profile) return false;
  if (profile.role === 'admin' || profile.is_approved_founder_creator === true) return true;

  const hasAvatar = Boolean(typeof profile.avatar_url === 'string' && profile.avatar_url.trim().length > 0);
  const hasBio = Boolean(
    (typeof profile.bio === 'string' && profile.bio.trim().length > 0) ||
      (typeof profile.bio_prompt_answer === 'string' && profile.bio_prompt_answer.trim().length > 0)
  );

  if (profile.role === 'creator') {
    return hasAvatar && hasBio;
  }

  const hasPreferences = Boolean(
    profile.archetype ||
      profile.sexual_preference ||
      (profile.lifestyle_habits && Object.keys(profile.lifestyle_habits).length > 0)
  );

  return hasAvatar && hasBio && hasPreferences;
}

/**
 * Batch-count non-hidden `profile_media` rows per user in a single query.
 */
export async function buildPublicMediaCountMap(
  supabaseClient: any,
  userIds: Array<string | null | undefined>
): Promise<Map<string, number>> {
  const counts = new Map<string, number>();
  const uniqueIds = Array.from(
    new Set(userIds.filter((id): id is string => typeof id === 'string' && id.trim().length > 0))
  );
  if (uniqueIds.length === 0) return counts;

  try {
    const { data, error } = await supabaseClient
      .from('profile_media')
      .select('user_id')
      .in('user_id', uniqueIds)
      .eq('is_hidden', false);

    if (error || !Array.isArray(data)) return counts;

    for (const row of data) {
      if (typeof row?.user_id === 'string') {
        counts.set(row.user_id, (counts.get(row.user_id) || 0) + 1);
      }
    }
  } catch (err) {
    console.warn('[profile-visibility] Failed to batch count public media:', err);
  }

  return counts;
}
