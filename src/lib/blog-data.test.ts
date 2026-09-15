import { describe, it, expect } from 'vitest';
import { 
  getAllBlogPosts, 
  getBlogPostBySlug, 
  getBlogPostsByCategory, 
  BLOG_CATEGORIES, 
  BLOG_POSTS 
} from './blog-data';
import sitemap from '../app/sitemap';
import robots from '../app/robots';
import { generateStaticParams, generateMetadata } from '../app/blog/[slug]/page';

describe('SECCION Blog Core Data & Content Pillar Integrity', () => {
  it('loads all blog posts and ensures at least the 2 cornerstone pillar articles exist', () => {
    const posts = getAllBlogPosts();
    expect(posts.length).toBeGreaterThanOrEqual(2);

    const slugs = posts.map((p) => p.slug);
    expect(slugs).toContain('creator-platform-90-percent-payout-comparison-2026');
    expect(slugs).toContain('what-is-a-warm-paywall-creator-economy');
  });

  it('verifies Article 1: Creator Platform Payout Comparison 2026 has required depth and metrics', () => {
    const post = getBlogPostBySlug('creator-platform-90-percent-payout-comparison-2026');
    expect(post).toBeDefined();
    if (!post) return;

    expect(post.title).toContain('Creator Platform Payout Comparison 2026');
    expect(post.category).toBe('Payouts & Taxes');
    expect(post.author.name).toBe('Stefan Zagre');
    expect(post.canonical).toBe('https://seccion.ai/blog/creator-platform-90-percent-payout-comparison-2026');
    expect(post.summaryPoints.length).toBeGreaterThanOrEqual(3);

    // Verify key data elements in contentHtml
    expect(post.contentHtml).toContain('OnlyFans (Solo)');
    expect(post.contentHtml).toContain('Fansly');
    expect(post.contentHtml).toContain('Patreon');
    expect(post.contentHtml).toContain('SECCION Founding Offer');
    expect(post.contentHtml).toContain('90% Guaranteed');
    expect(post.contentHtml).toContain('AI Operations Assistant');
    expect(post.contentHtml).toContain('$85,764 in retained earnings');
  });

  it('verifies Article 2: What Is a Warm Paywall has required relational mechanics and LTV breakdown', () => {
    const post = getBlogPostBySlug('what-is-a-warm-paywall-creator-economy');
    expect(post).toBeDefined();
    if (!post) return;

    expect(post.title).toContain('What Is a Warm Paywall?');
    expect(post.category).toBe('Creator Economy');
    expect(post.author.name).toBe('Stefan Zagre');
    expect(post.canonical).toBe('https://seccion.ai/blog/what-is-a-warm-paywall-creator-economy');
    expect(post.summaryPoints.length).toBeGreaterThanOrEqual(3);

    // Verify key conceptual and empirical elements in contentHtml
    expect(post.contentHtml).toContain('Cold Paywall');
    expect(post.contentHtml).toContain('Warm Paywall');
    expect(post.contentHtml).toContain('Level 1 — Intro Vibe');
    expect(post.contentHtml).toContain('Level 3 — Active Interest');
    expect(post.contentHtml).toContain('Level 4 — Verified Connection');
    expect(post.contentHtml).toContain('Level 8 — Soulmate Aura');
    expect(post.contentHtml).toContain('3.4x Higher Customer Lifetime Value');
    expect(post.contentHtml).toContain('situationship loop');
  });

  it('filters posts accurately by category', () => {
    for (const cat of BLOG_CATEGORIES) {
      const filtered = getBlogPostsByCategory(cat);
      for (const p of filtered) {
        expect(p.category).toBe(cat);
      }
    }
  });

  it('returns undefined for non-existent post slugs', () => {
    const post = getBlogPostBySlug('non-existent-random-article-12345');
    expect(post).toBeUndefined();
  });
});

describe('SECCION Blog Next.js Static & Metadata Generation', () => {
  it('generates static params matching all published slugs', async () => {
    const params = await generateStaticParams();
    expect(params.length).toBeGreaterThanOrEqual(2);
    expect(params).toContainEqual({ slug: 'creator-platform-90-percent-payout-comparison-2026' });
    expect(params).toContainEqual({ slug: 'what-is-a-warm-paywall-creator-economy' });
  });

  it('generates rich metadata for existing article routes', async () => {
    const meta = await generateMetadata({
      params: Promise.resolve({ slug: 'creator-platform-90-percent-payout-comparison-2026' }),
    });

    expect(meta.title).toContain('Creator Platform Payout Comparison 2026');
    expect(meta.description).toBeDefined();
    expect(meta.alternates?.canonical).toBe('https://seccion.ai/blog/creator-platform-90-percent-payout-comparison-2026');
    expect((meta.openGraph as any)?.type).toBe('article');
  });

  it('handles not-found metadata cleanly for invalid slug', async () => {
    const meta = await generateMetadata({
      params: Promise.resolve({ slug: 'unknown-slug-abc' }),
    });

    expect(meta.title).toContain('Article Not Found');
  });
});

describe('SECCION SEO & Crawler Discovery Verification', () => {
  it('ensures sitemap contains /blog and all individual article URLs', () => {
    const map = sitemap();
    const urls = map.map((entry) => entry.url);

    expect(urls).toContain('https://seccion.ai/blog');
    expect(urls).toContain('https://seccion.ai/blog/creator-platform-90-percent-payout-comparison-2026');
    expect(urls).toContain('https://seccion.ai/blog/what-is-a-warm-paywall-creator-economy');
  });

  it('ensures robots.txt explicitly allows /blog and /blog/ for AI search bots', () => {
    const r = robots();
    const rulesList = Array.isArray(r.rules) ? r.rules : [r.rules];
    const aiRule = rulesList.find((rule: any) => 
      Array.isArray(rule.userAgent) && rule.userAgent.includes('GPTBot')
    );

    expect(aiRule).toBeDefined();
    if (!aiRule || typeof aiRule !== 'object') return;
    
    const allowed = Array.isArray(aiRule.allow) ? aiRule.allow : [aiRule.allow];
    expect(allowed).toContain('/blog');
    expect(allowed).toContain('/blog/');
  });

  it('ensures public/llms.txt and public/llms-full.txt cite the blog and both pillar articles', async () => {
    const fs = await import('fs/promises');
    const path = await import('path');

    const llmsTxt = await fs.readFile(path.join(process.cwd(), 'public/llms.txt'), 'utf-8');
    expect(llmsTxt).toContain('https://seccion.ai/blog');
    expect(llmsTxt).toContain('creator-platform-90-percent-payout-comparison-2026');
    expect(llmsTxt).toContain('what-is-a-warm-paywall-creator-economy');

    const llmsFullTxt = await fs.readFile(path.join(process.cwd(), 'public/llms-full.txt'), 'utf-8');
    expect(llmsFullTxt).toContain('https://seccion.ai/blog');
    expect(llmsFullTxt).toContain('creator-platform-90-percent-payout-comparison-2026');
    expect(llmsFullTxt).toContain('what-is-a-warm-paywall-creator-economy');
  });
});