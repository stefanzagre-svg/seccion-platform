import { describe, it, expect, vi } from 'vitest';
import type { Metadata } from 'next';

vi.mock('next/headers', () => ({
  cookies: async () => ({
    get: () => ({ value: 'en' }),
  }),
  headers: async () => new Headers(),
}));

vi.mock('@/lib/supabase', () => ({
  supabase: {},
}));

vi.mock('@/lib/supabase/server', () => ({
  createClient: async () => ({}),
}));

import { metadata as homeMeta } from '../app/page';
import { metadata as becomeCreatorMeta } from '../app/become-creator/page';
import { metadata as onlyfansAltMeta } from '../app/creator-hub/onlyfans-alternative/page';
import { metadata as howWeDoMeta } from '../app/how-we-do/page';
import { metadata as vibeRadarMeta } from '../app/vibe-radar/page';
import { metadata as earlyAccessMeta } from '../app/early-access/page';
import { metadata as nowStreamingMeta } from '../app/now-streaming/page';
import { metadata as blogMeta } from '../app/blog/page';

import { generateMetadata as creatorHubGen } from '../app/creator-hub/page';
import { generateMetadata as privacyGen } from '../app/privacy/page';
import { generateMetadata as rulesGen } from '../app/rules/page';
import { generateMetadata as hitUsUpGen } from '../app/hit-us-up/page';
import { generateMetadata as faqGen } from '../app/faq/page';
import { generateMetadata as aiCopilotGen } from '../app/features/ai-copilot/page';
import { generateMetadata as drmGen } from '../app/features/drm-protection/page';

import { metadata as loginMeta } from '../app/login/layout';
import { metadata as onboardingMeta } from '../app/onboarding/layout';
import { metadata as onboardingStep2Meta } from '../app/onboarding/step-2/layout';
import { metadata as onboardingKycMeta } from '../app/onboarding/kyc/layout';
import { metadata as onboardingResetMeta } from '../app/onboarding-reset/layout';
import { metadata as dashboardMeta } from '../app/dashboard/layout';
import { metadata as studioMeta } from '../app/studio/layout';
import { metadata as studioAiMeta } from '../app/studio/ai-tools/layout';
import { metadata as profileMeta } from '../app/profile/layout';
import { metadata as settingsMeta } from '../app/settings/layout';
import { metadata as streamDemoMeta } from '../app/stream-demo/layout';
import { metadata as topProfileMeta } from '../app/top-profile/layout';
import { metadata as dashboardGroupMeta } from '../app/(dashboard)/layout';
import { metadata as feedMeta } from '../app/feed/page';
import { metadata as messagesMeta } from '../app/messages/page';
import { metadata as pulseMeta } from '../app/pulse/page';
import { metadata as pulseLiveMeta } from '../app/pulse/live/[id]/page';
import { generateMetadata as blogPostGen } from '../app/blog/[slug]/page';
import { metadata as esBlogMeta } from '../app/es/blog/page';
import { metadata as frBlogMeta } from '../app/fr/blog/page';
import { generateMetadata as esBlogPostGen } from '../app/es/blog/[slug]/page';
import { generateMetadata as frBlogPostGen } from '../app/fr/blog/[slug]/page';
import { metadata as esOnlyfansAltMeta } from '../app/es/creator-hub/onlyfans-alternative/page';
import { metadata as frOnlyfansAltMeta } from '../app/fr/creator-hub/onlyfans-alternative/page';
import { metadata as esHowWeDoMeta } from '../app/es/how-we-do/page';
import { metadata as frHowWeDoMeta } from '../app/fr/how-we-do/page';
import { metadata as esVibeRadarMeta } from '../app/es/vibe-radar/page';
import { metadata as frVibeRadarMeta } from '../app/fr/vibe-radar/page';
import { metadata as esAiCopilotMeta } from '../app/es/features/ai-copilot/page';
import { metadata as frAiCopilotMeta } from '../app/fr/features/ai-copilot/page';
import { metadata as esDrmMeta } from '../app/es/features/drm-protection/page';
import { metadata as frDrmMeta } from '../app/fr/features/drm-protection/page';
import { getAllBlogPosts } from './blog-data';
import { isReservedUsername } from './reserved-usernames';
import sitemap from '../app/sitemap';
import robots from '../app/robots';

function extractTitleString(title: Metadata['title']): string {
  if (!title) return '';
  if (typeof title === 'string') return title;
  if ('default' in title) return title.default;
  if ('absolute' in title) return title.absolute;
  return '';
}

describe('Bing & Search Engine Metadata Hygiene', () => {
  it('ensures every public page has a unique title and a unique description between 125 and 165 chars', async () => {
    const publicEntries: Array<[string, Metadata]> = [
      ['/', homeMeta],
      ['/become-creator', becomeCreatorMeta],
      ['/creator-hub/onlyfans-alternative', onlyfansAltMeta],
      ['/how-we-do', howWeDoMeta],
      ['/vibe-radar', vibeRadarMeta],
      ['/early-access', earlyAccessMeta],
      ['/now-streaming', nowStreamingMeta],
      ['/blog', blogMeta],
      ['/creator-hub', await creatorHubGen()],
      ['/privacy', await privacyGen()],
      ['/rules', await rulesGen()],
      ['/hit-us-up', await hitUsUpGen()],
      ['/faq', await faqGen()],
      ['/features/ai-copilot', await aiCopilotGen()],
      ['/features/drm-protection', await drmGen()],
    ];

    const seenTitles = new Set<string>();
    const seenDescs = new Set<string>();

    for (const [route, meta] of publicEntries) {
      const title = extractTitleString(meta.title).trim();
      const desc = (meta.description || '').trim();

      expect(title.length, `${route} title length`).toBeGreaterThanOrEqual(20);
      expect(seenTitles.has(title), `Duplicate title on ${route}: ${title}`).toBe(false);
      seenTitles.add(title);

      expect(desc.length, `${route} description too short (${desc.length} chars): ${desc}`).toBeGreaterThanOrEqual(125);
      expect(desc.length, `${route} description too long (${desc.length} chars): ${desc}`).toBeLessThanOrEqual(165);
      expect(seenDescs.has(desc), `Duplicate description on ${route}: ${desc}`).toBe(false);
      seenDescs.add(desc);
    }
  });

  it('ensures auth, onboarding, and private routes are noindex with unique titles and descriptions', () => {
    const privateEntries: Array<[string, Metadata]> = [
      ['/login', loginMeta],
      ['/onboarding', onboardingMeta],
      ['/onboarding/step-2', onboardingStep2Meta],
      ['/onboarding/kyc', onboardingKycMeta],
      ['/onboarding-reset', onboardingResetMeta],
      ['/dashboard', dashboardMeta],
      ['/studio', studioMeta],
      ['/studio/ai-tools', studioAiMeta],
      ['/profile', profileMeta],
      ['/settings', settingsMeta],
      ['/stream-demo', streamDemoMeta],
      ['/top-profile', topProfileMeta],
      ['/(dashboard)', dashboardGroupMeta],
      ['/feed', feedMeta],
      ['/messages', messagesMeta],
      ['/pulse', pulseMeta],
      ['/pulse/live/[id]', pulseLiveMeta],
    ];

    const seenTitles = new Set<string>();
    const seenDescs = new Set<string>();

    for (const [route, meta] of privateEntries) {
      const title = extractTitleString(meta.title).trim();
      const desc = (meta.description || '').trim();
      const robotsCfg = meta.robots as { index?: boolean; follow?: boolean } | undefined;

      expect(robotsCfg?.index, `${route} must be noindex`).toBe(false);
      expect(robotsCfg?.follow, `${route} must be nofollow`).toBe(false);

      expect(title.length, `${route} title`).toBeGreaterThan(5);
      expect(seenTitles.has(title), `Duplicate private title on ${route}`).toBe(false);
      seenTitles.add(title);

      expect(desc.length, `${route} desc too short`).toBeGreaterThanOrEqual(100);
      expect(seenDescs.has(desc), `Duplicate private desc on ${route}`).toBe(false);
      seenDescs.add(desc);
    }
  });

  it('disallows auth, onboarding, studio, and app routes for Bingbot and wildcard crawlers', () => {
    const r = robots();
    const rulesList = Array.isArray(r.rules) ? r.rules : [r.rules];
    const botRule = rulesList.find((rule: any) =>
      Array.isArray(rule.userAgent) && rule.userAgent.includes('Bingbot')
    );

    expect(botRule).toBeDefined();
    if (!botRule || typeof botRule !== 'object') return;
    const disallowed = Array.isArray(botRule.disallow) ? botRule.disallow : [botRule.disallow];
    for (const path of ['/onboarding', '/studio', '/dashboard/', '/admin/']) {
      expect(disallowed).toContain(path);
    }
    expect(disallowed).not.toContain('/login');
  });

  it('keeps blog post metadata <title> including template within 70 characters', async () => {
    for (const post of getAllBlogPosts()) {
      for (const [loc, gen] of [
        ['en', blogPostGen],
        ['es', esBlogPostGen],
        ['fr', frBlogPostGen],
      ] as const) {
        const meta = await gen({ params: Promise.resolve({ slug: post.slug }) });
        const titleStr = extractTitleString(meta.title).trim();
        const descStr = (meta.description || '').trim();
        expect(`${titleStr} | SECCION`.length, `${loc}:${post.slug} full <title>`).toBeLessThanOrEqual(70);
        expect(descStr.length, `${loc}:${post.slug} desc length`).toBeGreaterThanOrEqual(125);
        expect(descStr.length, `${loc}:${post.slug} desc length`).toBeLessThanOrEqual(165);
        expect(meta.alternates?.languages).toMatchObject({
          en: `https://seccion.ai/blog/${post.slug}`,
          es: `https://seccion.ai/es/blog/${post.slug}`,
          fr: `https://seccion.ai/fr/blog/${post.slug}`,
          'x-default': `https://seccion.ai/blog/${post.slug}`,
        });
      }
    }
  });

  it('emits localized ES/FR SSR metadata, hreflang alternates, sitemap URLs, and reserved prefix guards', () => {
    const localizedHubs: Array<[string, Metadata, string]> = [
      ['/es/blog', esBlogMeta, 'https://seccion.ai/es/blog'],
      ['/fr/blog', frBlogMeta, 'https://seccion.ai/fr/blog'],
      [
        '/es/creator-hub/onlyfans-alternative',
        esOnlyfansAltMeta,
        'https://seccion.ai/es/creator-hub/onlyfans-alternative',
      ],
      [
        '/fr/creator-hub/onlyfans-alternative',
        frOnlyfansAltMeta,
        'https://seccion.ai/fr/creator-hub/onlyfans-alternative',
      ],
      ['/es/how-we-do', esHowWeDoMeta, 'https://seccion.ai/es/how-we-do'],
      ['/fr/how-we-do', frHowWeDoMeta, 'https://seccion.ai/fr/how-we-do'],
      ['/es/vibe-radar', esVibeRadarMeta, 'https://seccion.ai/es/vibe-radar'],
      ['/fr/vibe-radar', frVibeRadarMeta, 'https://seccion.ai/fr/vibe-radar'],
      ['/es/features/ai-copilot', esAiCopilotMeta, 'https://seccion.ai/es/features/ai-copilot'],
      ['/fr/features/ai-copilot', frAiCopilotMeta, 'https://seccion.ai/fr/features/ai-copilot'],
      ['/es/features/drm-protection', esDrmMeta, 'https://seccion.ai/es/features/drm-protection'],
      ['/fr/features/drm-protection', frDrmMeta, 'https://seccion.ai/fr/features/drm-protection'],
    ];

    const seenTitles = new Set<string>();
    const seenDescs = new Set<string>();

    for (const [route, meta, canonicalUrl] of localizedHubs) {
      const titleStr = extractTitleString(meta.title).trim();
      const descStr = (meta.description || '').trim();
      expect(`${titleStr} | SECCION`.length, `${route} <title>`).toBeLessThanOrEqual(70);
      expect(seenTitles.has(titleStr), `Duplicate localized title on ${route}`).toBe(false);
      seenTitles.add(titleStr);
      expect(descStr.length, `${route} description min`).toBeGreaterThanOrEqual(125);
      expect(descStr.length, `${route} description max`).toBeLessThanOrEqual(165);
      expect(seenDescs.has(descStr), `Duplicate localized description on ${route}`).toBe(false);
      seenDescs.add(descStr);
      expect(meta.alternates?.canonical, `${route} canonical`).toBe(canonicalUrl);
      expect(meta.alternates?.languages?.es, `${route} hreflang es`).toBeDefined();
      expect(meta.alternates?.languages?.fr, `${route} hreflang fr`).toBeDefined();
    }

    const urls = sitemap().map((entry) => entry.url);
    expect(urls).toContain('https://seccion.ai/es/blog');
    expect(urls).toContain('https://seccion.ai/fr/blog');
    expect(urls).toContain('https://seccion.ai/es/creator-hub/onlyfans-alternative');
    expect(urls).toContain('https://seccion.ai/fr/creator-hub/onlyfans-alternative');
    expect(urls).toContain('https://seccion.ai/es/how-we-do');
    expect(urls).toContain('https://seccion.ai/fr/how-we-do');
    expect(urls).toContain('https://seccion.ai/es/vibe-radar');
    expect(urls).toContain('https://seccion.ai/fr/vibe-radar');
    expect(urls).toContain('https://seccion.ai/es/features/ai-copilot');
    expect(urls).toContain('https://seccion.ai/fr/features/ai-copilot');
    expect(urls).toContain('https://seccion.ai/es/features/drm-protection');
    expect(urls).toContain('https://seccion.ai/fr/features/drm-protection');

    expect(isReservedUsername('es')).toBe(true);
    expect(isReservedUsername('fr')).toBe(true);
  });
});
