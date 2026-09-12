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
          'Bingbot'
        ],
        allow: [
          '/',
          '/llms.txt',
          '/become-creator',
          '/how-we-do',
          '/creator-hub',
          '/vibe-radar',
          '/early-access',
          '/rules',
          '/hit-us-up'
        ],
      }
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
