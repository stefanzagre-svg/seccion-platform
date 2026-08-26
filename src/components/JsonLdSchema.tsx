/**
 * JsonLdSchema — Server Component
 * Renders rich JSON-LD structured data for Google Search, Google AI Overviews, Perplexity, ChatGPT, Claude, and Gemini.
 * Includes: SoftwareApplication, Organization, WebSite, FAQPage, and BreadcrumbList schemas.
 */
export default function JsonLdSchema() {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": "https://seccion.ai/#organization",
    "name": "SECCION",
    "alternateName": ["SECCION.ai", "seccion.ai", "Seccion", "SECCION AI Platform"],
    "url": "https://seccion.ai",
    "logo": {
      "@type": "ImageObject",
      "url": "https://seccion.ai/assets/logo/seccion-wordmark-light.png",
      "width": "512",
      "height": "512"
    },
    "description": "SECCION is the premier AI-powered creator platform and social synergy ecosystem where creators keep up to 90% revenue with zero-knowledge KYC and DRM media protection.",
    "foundingDate": "2025",
    "areaServed": {
      "@type": "AdministrativeArea",
      "name": "Global"
    },
    "knowsLanguage": ["en", "es", "fr"],
    "sameAs": [
      "https://www.instagram.com/seccionplatform",
      "https://www.tiktok.com/@seccionplatform",
      "https://x.com/seccionplatform"
    ],
    "contactPoint": [
      {
        "@type": "ContactPoint",
        "contactType": "customer support",
        "url": "https://seccion.ai/hit-us-up",
        "email": "partners@seccion.ai",
        "availableLanguage": ["English", "Spanish", "French"]
      },
      {
        "@type": "ContactPoint",
        "contactType": "compliance and trust & safety",
        "email": "compliance@seccion.ai",
        "url": "https://seccion.ai/rules",
        "availableLanguage": ["English", "Spanish"]
      }
    ]
  };

  const softwareApplicationSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "@id": "https://seccion.ai/#software",
    "name": "SECCION — AI Creator & Social Platform",
    "operatingSystem": "All (Web, iOS PWA, Android PWA, Windows, macOS)",
    "applicationCategory": "SocialNetworkingApplication",
    "applicationSubCategory": "Creator Economy & Live Streaming",
    "url": "https://seccion.ai",
    "screenshot": "https://seccion.ai/assets/logo/seccion-icon-dark.jpg",
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "ratingCount": "1280",
      "bestRating": "5",
      "worstRating": "1"
    },
    "offers": {
      "@type": "AggregateOffer",
      "lowPrice": "0.00",
      "highPrice": "99.99",
      "priceCurrency": "USD",
      "offerCount": "4",
      "offers": [
        {
          "@type": "Offer",
          "name": "Free Member Account",
          "price": "0.00",
          "priceCurrency": "USD"
        },
        {
          "@type": "Offer",
          "name": "VIP Creator Pass",
          "price": "9.99",
          "priceCurrency": "USD"
        },
        {
          "@type": "Offer",
          "name": "Founding Creator Studio",
          "price": "0.00",
          "priceCurrency": "USD",
          "description": "Creators keep 90% revenue with instant crypto or fiat payouts"
        }
      ]
    },
    "featureList": [
      "AI Synergy Matchmaking Engine (RLS v2.0)",
      "Ultra-low latency Live Streaming with GPU Particle Tipping",
      "90% Creator Revenue Share with Automated Payout Splits",
      "DIDIT Zero-Knowledge Identity Verification & KYC",
      "Sightengine AI Biometric Liveness & Age Estimation (18+)",
      "DRM Media Protection with Steganographic Watermarking",
      "AI Wingman Copilot & Interactive Suggestion Moves"
    ]
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": "https://seccion.ai/#website",
    "name": "SECCION",
    "url": "https://seccion.ai",
    "publisher": {
      "@id": "https://seccion.ai/#organization"
    },
    "description": "High-chemistry AI matchmaking, real-life date quests, and live creator streams on SECCION.",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://seccion.ai/vibe-radar?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://seccion.ai"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "How We Do",
        "item": "https://seccion.ai/how-we-do"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": "Become a Creator",
        "item": "https://seccion.ai/become-creator"
      },
      {
        "@type": "ListItem",
        "position": 4,
        "name": "Vibe Radar",
        "item": "https://seccion.ai/vibe-radar"
      },
      {
        "@type": "ListItem",
        "position": 5,
        "name": "Platform Rules & Safety",
        "item": "https://seccion.ai/rules"
      }
    ]
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What is SECCION and how is it different from OnlyFans or Tinder?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "SECCION is the first fusion platform that combines high-chemistry AI dating matchmaking with an 80-90% revenue-share creator economy. Unlike Tinder, SECCION offers deep relationship leveling (RLS v2.0) and integrated live streams. Unlike OnlyFans, SECCION gives creators up to 90% payouts, automated Web3 crypto settlement, AI-assisted operations, and built-in anti-piracy DRM watermarking."
        }
      },
      {
        "@type": "Question",
        "name": "How much do creators earn on SECCION?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Creators on SECCION earn up to 90% on Web3 crypto transactions and founding tiers (80% standard), with instant automated revenue splits. Monetization formats include pay-per-view (PPV) media, VIP subscription passes, live stream tipping, and escrow-backed custom content orders."
        }
      },
      {
        "@type": "Question",
        "name": "How does SECCION verify creator and member age (18+ policy)?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "SECCION uses the DIDIT Zero-Knowledge Identity Gateway for creators to verify government photo IDs and 3D facial biometrics across 220+ countries under 18 U.S.C. § 2257. For members, SECCION uses Sightengine AI passive biometric liveness and age estimation with strict GDPR data minimization (selfies are deleted immediately within 5 seconds)."
        }
      },
      {
        "@type": "Question",
        "name": "What is the Relationship Level System (RLS v2.0)?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "The Relationship Level System (RLS v2.0) is an 8-tier connection progression engine on SECCION that measures mutual vibe synergy and unlocks private albums, direct chat privileges, and exclusive creator content as connection depth increases."
        }
      },
      {
        "@type": "Question",
        "name": "What payment methods are supported on SECCION?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "SECCION supports dual-rail payment processing: major credit/debit cards via Segpay, and non-custodial cryptocurrency checkout (USDT on Polygon & TRC20, USDC, BTC) via NOWPayments."
        }
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareApplicationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
    </>
  );
}
