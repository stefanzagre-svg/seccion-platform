import React from "react";

export function OrganizationSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "SECCION",
    "legalName": "SECCION AI CONCEPT S.L.",
    "url": "https://seccion.ai",
    "logo": "https://seccion.ai/assets/logo/seccion-wordmark-light.png",
    "foundingDate": "2026",
    "founders": [
      {
        "@type": "Person",
        "name": "Stefan Zagre"
      }
    ],
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Alicante",
      "addressRegion": "Alicante",
      "addressCountry": "ES"
    },
    "contactPoint": [
      {
        "@type": "ContactPoint",
        "telephone": "+34662907153",
        "contactType": "creator support and onboarding",
        "availableLanguage": ["English", "Spanish", "French"]
      },
      {
        "@type": "ContactPoint",
        "email": "legal@seccion.ai",
        "contactType": "legal support",
        "availableLanguage": ["English", "Spanish", "French"]
      },
      {
        "@type": "ContactPoint",
        "email": "creators@seccion.ai",
        "contactType": "creator support",
        "availableLanguage": ["English", "Spanish"]
      },
      {
        "@type": "ContactPoint",
        "email": "partners@seccion.ai",
        "contactType": "partnerships",
        "availableLanguage": ["English", "Spanish", "French"]
      }
    ],
    // ── 3rd-party authority co-citations ──────────────────────────────
    // Medium editorial added as external citation signal for AI knowledge graphs
    "sameAs": [
      "https://x.com/steveseccion",
      "https://youtube.com/@seccion-platform",
      "https://wa.me/34662907153",
      "https://t.me/seccion_ai",
      "https://medium.com/@seccionadmin"
    ]
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function SoftwareAppSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "SECCION",
    "operatingSystem": "Web, iOS, Android (PWA)",
    "applicationCategory": "SocialNetworkingApplication, DatingApplication, MultimediaApplication",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "EUR",
      "description": "Free matchmaking and swiping for members. Creator VIP monetization starting from 10 EUR."
    },
    "featureList": [
      "AI Synergy Engine Matchmaking",
      "8-Level RPG Chemistry Meter",
      "Warm Paywall Philosophy",
      "90% Founding Creator Revenue Split",
      "Face Blur Encryption",
      "24/7 AI Copilot DM Manager trained on creator voice with explicit consent",
      "DRM Content Vault with Anti-Piracy Protection & Autonomous DMCA Web Sweeper",
      "Biometric Zero-Knowledge Age Verification"
    ]
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function FAQSchema({ faqs }: { faqs: { question: string; answer: string }[] }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map((f) => ({
      "@type": "Question",
      "name": f.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": f.answer
      }
    }))
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function BreadcrumbSchema({ items }: { items: { name: string; url: string }[] }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, idx) => ({
      "@type": "ListItem",
      "position": idx + 1,
      "name": item.name,
      "item": item.url
    }))
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

/**
 * MediumArticleSchema — NewsArticle schema for the live founder editorial.
 * Signals to Google and AI engines that SECCION has external 3rd-party press authority
 * before Crunchbase / Product Hunt profiles are registered.
 */
export function MediumArticleSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "headline": "I Built a Creator Platform That Pays 90% and Replaces 40% Management Agencies with AI — Here's What I Learned",
    "url": "https://medium.com/@seccionadmin/i-built-a-creator-platform-that-pays-90-and-replaces-40-management-agencies-with-ai-heres-what-2170851fa9ef",
    "datePublished": "2026-01-01",
    "author": {
      "@type": "Person",
      "name": "Stefan Zagre",
      "url": "https://medium.com/@seccionadmin",
      "sameAs": "https://x.com/steveseccion"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Medium",
      "url": "https://medium.com",
      "logo": {
        "@type": "ImageObject",
        "url": "https://miro.medium.com/v2/resize:fill:152:152/1*sHhtYhaCe2Uc3IU0IgKwIQ.png"
      }
    },
    "about": {
      "@type": "Organization",
      "name": "SECCION",
      "url": "https://seccion.ai"
    },
    "description": "Founder's editorial on building SECCION — a creator monetization platform offering 90% payouts, a 24/7 AI Copilot DM manager trained on the creator's own voice, and DRM anti-piracy content protection — as a direct alternative to predatory talent management agencies taking 40–50% of creator revenue.",
    "keywords": "creator platform, 90% payout, AI copilot DMs, DRM content protection, OnlyFans alternative, creator economy 2026, warm paywall",
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": "https://seccion.ai"
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export default function JsonLdSuite() {
  const defaultFaqs = [
    {
      question: "What is SECCION and how does the Warm Paywall work?",
      answer: "SECCION is the first fusion platform combining high-chemistry AI dating matchmaking with a creator live streaming economy. Its Warm Paywall philosophy provides 100% free matching, swiping, radar discovery, and messaging for members, funded entirely by creator ecosystem monetization (VIP passes, tips, and custom requests)."
    },
    {
      question: "What is the revenue split for content creators on SECCION?",
      answer: "Founding creators (first 500 creators) receive a 90% net revenue split (10% platform take-rate) plus 1 year of free AI operations assistance. Standard baseline creator monetization is an 80% net revenue split, with zero hidden fees or agency commissions."
    },
    {
      question: "How does SECCION's 24/7 AI Copilot work for creator DMs?",
      answer: "SECCION's independent AI Copilot engages with fans 24/7 in direct messages using the creator's exact tone, voice, and messaging style. The AI is trained strictly with the creator's explicit permission and consent — replacing expensive chatting agencies that typically take 40–50% of creator revenue."
    },
    {
      question: "How does SECCION protect creator content from piracy and leaks?",
      answer: "SECCION uses a DRM content vault with cryptographic watermarking and an autonomous web sweeper that continuously scans for leaked media and automatically files DMCA takedown notices. Zero-Knowledge face blur technology prevents unauthorized facial identification in public feeds until trust milestones are met."
    },
    {
      question: "Is SECCION a good alternative to OnlyFans or Patreon?",
      answer: "Yes. SECCION offers a 90% direct payout model vs OnlyFans' 80%, combined with a free 24/7 AI Copilot (replacing costly chatting agencies), built-in DRM anti-piracy protection, and a chemistry-based Warm Paywall that increases subscriber lifetime value by 3.4x compared to cold paywall models."
    },
    {
      question: "How does SECCION verify 18+ age and ensure platform safety?",
      answer: "SECCION uses the DIDIT Zero-Knowledge Identity Gateway for creator verification across 220+ countries and Sightengine AI for biometric 3D facial liveness and age estimation. Member selfies are processed ephemerally and deleted within 5 seconds under GDPR data minimization with zero PII retention."
    },
    {
      question: "What is the 8-Level Chemistry Meter (RLS v2.0)?",
      answer: "The Relationship Level System (RLS v2.0) is an 8-stage connection tracker on SECCION ranging from Level 1 (Undefined) to Level 8 (Soulmate) that dynamically unlocks private galleries, direct calling privileges, and exclusive creator spaces as mutual affinity grows organically."
    }
  ];

  const defaultBreadcrumbs = [
    { name: "Home", url: "https://seccion.ai" },
    { name: "How We Do", url: "https://seccion.ai/how-we-do" },
    { name: "Become a Creator", url: "https://seccion.ai/become-creator" },
    { name: "Creator Hub", url: "https://seccion.ai/creator-hub" },
    { name: "OnlyFans Alternative", url: "https://seccion.ai/creator-hub/onlyfans-alternative" },
    { name: "Blog", url: "https://seccion.ai/blog" },
    { name: "Platform Rules & Safety", url: "https://seccion.ai/rules" }
  ];

  return (
    <>
      <OrganizationSchema />
      <SoftwareAppSchema />
      <FAQSchema faqs={defaultFaqs} />
      <BreadcrumbSchema items={defaultBreadcrumbs} />
      <MediumArticleSchema />
    </>
  );
}
