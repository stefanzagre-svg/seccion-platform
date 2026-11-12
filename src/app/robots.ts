import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://seccion.ai';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/api/',
          '/onboarding',
          '/onboarding/',
          '/onboarding-reset',
          '/onboarding-reset/',
          '/dashboard',
          '/dashboard/',
          '/top-profile',
          '/top-profile/',
          '/settings/',
          '/profile/',
          '/messages/',
          '/pulse/live/',
          '/auth/'
        ],
      },
      {
        userAgent: [
          'GPTBot',
          'ChatGPT-User',
          'ClaudeBot',
          'anthropic-ai',
          'PerplexityBot',
          'Google-Extended',
          'Applebot-Extended',
          'Bingbot',
          'Twitterbot',
          'Meta-ExternalAgent',
          'FacebookBot',
          'CCBot',
          'cohere-ai',
          'Diffbot'
        ],
        allow: [
          '/',
          '/llms.txt',
          '/llms-full.txt',
          '/blog',
          '/blog/',
          '/faq',
          '/faq/',
          '/features',
          '/features/',
          '/become-creator',
          '/how-we-do',
          '/creator-hub',
          '/creator-hub/onlyfans-alternative',
          '/vibe-radar',
          '/early-access',
          '/now-streaming',
          '/rules',
          '/privacy',
          '/hit-us-up'
        ],
        disallow: [
          '/admin/',
          '/api/',
          '/dashboard/',
          '/settings/',
          '/profile/',
          '/messages/',
          '/auth/'
        ],
      }
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
