/**
 * Reserved Username Denylist and Validation Helpers
 * Prevents dynamic creator vanity URLs (e.g. /magali or /@magali) from colliding
 * with core platform static routes, APIs, administrative endpoints, and brand assets.
 */

export const RESERVED_USERNAMES = new Set([
  // Core Platform Pages
  'admin',
  'api',
  'auth',
  'become-creator',
  'blog',
  'creator-hub',
  'dashboard',
  'early-access',
  'faq',
  'features',
  'feed',
  'hit-us-up',
  'how-we-do',
  'login',
  'messages',
  'now-streaming',
  'nowstreaming',
  'onboarding',
  'onboarding-reset',
  'privacy',
  'profile',
  'pulse',
  'rules',
  'settings',
  'stream-demo',
  'studio',
  'top-profile',
  'vibe-radar',

  // Static Assets & Web Standards
  'favicon',
  'favicon.ico',
  'favicon.png',
  'icon.png',
  'icon.jpg',
  'robots',
  'robots.txt',
  'sitemap',
  'sitemap.xml',
  'manifest',
  'manifest.webmanifest',
  '.well-known',
  '_next',
  'assets',
  'public',
  'static',

  // Brand, Security, Legal & System Aliases
  'seccion',
  'session',
  'steve',
  'support',
  'help',
  'terms',
  'legal',
  'compliance',
  'billing',
  'payouts',
  'wallet',
  'escrow',
  'root',
  'system',
  'moderation',
  'security',
  'status',
  'app',
  'web',
  'dev',
  'staging',
  'production'
]);

// Common attack/probe file extensions that should never be valid creator handles
const PROBE_EXTENSION_REGEX = /\.(php|env|html?|js|json|xml|txt|sql|git|sh|exe|bak|map|config|asp|aspx|jsp)$/i;

/**
 * Normalizes any handle or URL path segment by stripping leading '@', 
 * lowercasing, and trimming whitespace.
 */
export function normalizeUsername(input: string | null | undefined): string {
  if (!input) return '';
  return decodeURIComponent(input)
    .trim()
    .replace(/^@+/, '')
    .toLowerCase()
    .trim();
}

/**
 * Validates whether a normalized username meets platform naming standards:
 * - 3 to 30 characters
 * - Alphanumeric, underscores, dots
 * - Cannot start or end with a dot/underscore
 * - No consecutive dots
 * - Rejects web vulnerability probe extensions (.php, .env, etc.)
 */
export function isValidUsernameFormat(username: string): boolean {
  if (!username || username.length < 3 || username.length > 30) {
    return false;
  }
  // Reject probe file extensions
  if (PROBE_EXTENSION_REGEX.test(username)) {
    return false;
  }
  // No consecutive dots or starting/ending with dot or underscore
  if (username.startsWith('.') || username.endsWith('.') || username.startsWith('_') || username.endsWith('_') || username.includes('..')) {
    return false;
  }
  // Alphanumeric + underscore + dot
  return /^[a-zA-Z0-9_.]+$/.test(username);
}

/**
 * Checks whether a given username is reserved by the platform.
 */
export function isReservedUsername(username: string): boolean {
  const normalized = normalizeUsername(username);
  return RESERVED_USERNAMES.has(normalized);
}

// ── Cooldown & Redirect Policy Constants ──────────────────────────────
export const USERNAME_CHANGE_COOLDOWN_DAYS = 14;
export const USERNAME_REDIRECT_GRACE_DAYS = 30;

export interface UsernameCooldownStatus {
  canChange: boolean;
  daysRemaining: number;
  hoursRemaining: number;
  nextAvailableDate: Date | null;
}

/**
 * Calculates whether a creator is currently eligible to update their username
 * or if they must wait out the 14-day anti-abuse cooldown.
 */
export function getUsernameCooldownStatus(
  lastChangedAt: string | null | undefined,
  cooldownDays: number = USERNAME_CHANGE_COOLDOWN_DAYS,
  currentTimestamp: number = Date.now()
): UsernameCooldownStatus {
  if (!lastChangedAt) {
    return { canChange: true, daysRemaining: 0, hoursRemaining: 0, nextAvailableDate: null };
  }
  const lastChange = new Date(lastChangedAt).getTime();
  if (isNaN(lastChange)) {
    return { canChange: true, daysRemaining: 0, hoursRemaining: 0, nextAvailableDate: null };
  }
  const cooldownMs = cooldownDays * 24 * 60 * 60 * 1000;
  const elapsedMs = currentTimestamp - lastChange;
  if (elapsedMs >= cooldownMs) {
    return { canChange: true, daysRemaining: 0, hoursRemaining: 0, nextAvailableDate: null };
  }
  const remainingMs = cooldownMs - elapsedMs;
  const daysRemaining = Math.max(1, Math.ceil(remainingMs / (24 * 60 * 60 * 1000)));
  const hoursRemaining = Math.max(1, Math.ceil(remainingMs / (60 * 60 * 1000)));
  const nextAvailableDate = new Date(lastChange + cooldownMs);
  return {
    canChange: false,
    daysRemaining,
    hoursRemaining,
    nextAvailableDate,
  };
}

