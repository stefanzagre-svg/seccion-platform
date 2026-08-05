/**
 * JsonLdSchema — Server Component
 * Renders Organization + WebSite JSON-LD structured data inline in the page body.
 * This ensures Google and all crawlers see the schema regardless of RSC streaming.
 * Placed in <body> (before </body>) — Google reads JSON-LD anywhere in the document.
 */
export default function JsonLdSchema() {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "SECCION",
    "alternateName": ["Seccion", "seccion.ai"],
    "url": "https://seccion.ai",
    "logo": "https://seccion.ai/assets/logo/logo-wordmark.png",
    "description": "SECCION is the first fusion platform combining AI-driven dating matchmaking with live streaming content creators. Creators keep 90% of revenue with built-in DRM protection and AI operations assistant.",
    "foundingDate": "2025",
    "areaServed": ["CO", "ES", "US"],
    "knowsLanguage": ["es", "en", "fr"],
    "sameAs": [
      "https://www.instagram.com/seccionplatform",
      "https://www.tiktok.com/@seccionplatform",
      "https://x.com/seccionplatfrom"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer support",
      "url": "https://seccion.ai/hit-us-up",
      "availableLanguage": ["English", "Spanish"]
    }
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "SECCION",
    "url": "https://seccion.ai",
    "description": "The first fusion platform combining AI matchmaking with live content creators.",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://seccion.ai/vibe-radar?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
    </>
  );
}
