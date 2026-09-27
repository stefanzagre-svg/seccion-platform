import { MetadataRoute } from 'next';
import { getAllBlogPosts } from '@/lib/blog-data';

// ── Static build dates ─────────────────────────────────────────────────────
// Use fixed dates instead of new Date() to prevent lastmod changing on every
// request/build — dynamic lastmod causes Google to treat sitemap signals as
// unreliable and ignore crawl priority hints entirely.
const PLATFORM_LAUNCH_DATE = new Date('2026-03-01');
const CONTENT_REFRESH_DATE = new Date('2026-09-20'); // Matches Canonical SEO Live build

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://seccion.ai';

  // ── Core public marketing routes ────────────────────────────────────────
  // Public marketing and discoverability routes for indexing.
  const routes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/`,
      lastModified: CONTENT_REFRESH_DATE,
      changeFrequency: 'weekly' as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/become-creator`,
      lastModified: CONTENT_REFRESH_DATE,
      changeFrequency: 'monthly' as const,
      priority: 0.95,
    },
    {
      url: `${baseUrl}/faq`,
      lastModified: CONTENT_REFRESH_DATE,
      changeFrequency: 'monthly' as const,
      priority: 0.85,
    },
    {
      url: `${baseUrl}/features/ai-copilot`,
      lastModified: CONTENT_REFRESH_DATE,
      changeFrequency: 'monthly' as const,
      priority: 0.85,
    },
    {
      url: `${baseUrl}/features/drm-protection`,
      lastModified: CONTENT_REFRESH_DATE,
      changeFrequency: 'monthly' as const,
      priority: 0.85,
    },
    {
      url: `${baseUrl}/creator-hub`,
      lastModified: CONTENT_REFRESH_DATE,
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/creator-hub/onlyfans-alternative`,
      lastModified: CONTENT_REFRESH_DATE,
      changeFrequency: 'weekly' as const,
      priority: 0.95,
    },
    {
      url: `${baseUrl}/how-we-do`,
      lastModified: CONTENT_REFRESH_DATE,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/vibe-radar`,
      lastModified: CONTENT_REFRESH_DATE,
      changeFrequency: 'daily' as const,
      priority: 0.85,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: CONTENT_REFRESH_DATE,
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/now-streaming`,
      lastModified: CONTENT_REFRESH_DATE,
      changeFrequency: 'daily' as const,
      priority: 0.85,
    },
    {
      url: `${baseUrl}/early-access`,
      lastModified: PLATFORM_LAUNCH_DATE,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/hit-us-up`,
      lastModified: PLATFORM_LAUNCH_DATE,
      changeFrequency: 'yearly' as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/rules`,
      lastModified: PLATFORM_LAUNCH_DATE,
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: PLATFORM_LAUNCH_DATE,
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
  ];

  // ── Dynamic blog articles ────────────────────────────────────────────────
  // Blog data includes real lastModified dates — use them directly.
  const blogPosts = getAllBlogPosts();
  const blogRoutes: MetadataRoute.Sitemap = blogPosts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: post.lastModified ? new Date(post.lastModified) : new Date(post.date),
    changeFrequency: 'weekly' as const,
    priority: 0.85,
  }));

  return [...routes, ...blogRoutes];
}
