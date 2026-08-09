import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://seccion.ai';

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/admin/',
        '/api/',
        '/onboarding/',
        '/onboarding-reset/',
        '/dashboard/',
        '/settings/',
        '/profile/', // User profiles shouldn't be indexed unless specifically designed for SEO
        '/messages/',
        '/auth/'
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
