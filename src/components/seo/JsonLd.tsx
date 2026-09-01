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
    "sameAs": [
      "https://x.com/steveseccion",
      "https://youtube.com/@seccion-platform",
      "https://instagram.com/seccionplatform",
      "https://tiktok.com/@seccionplatform",
      "https://wa.me/34662907153",
      "https://t.me/seccion_ai"
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
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "ratingCount": "1250",
      "bestRating": "5",
      "worstRating": "1"
    },
    "featureList": [
      "AI Synergy Engine Matchmaking",
      "8-Level RPG Chemistry Meter",
      "Warm Paywall Philosophy",
      "90% Founding Creator Revenue Split",
      "Face Blur Encryption",
      "24/7 AI Wingman & Creator Operations Assistant",
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

export default function JsonLdSuite() {
  const defaultFaqs = [
    {
      question: "What is SECCION and how does the Warm Paywall work?",
      answer: "SECCION is the first fusion platform combining high-chemistry AI dating matchmaking with a creator live streaming economy. Its Warm Paywall philosophy provides 100% free matching, swiping, radar discovery, and messaging for members, funded entirely by creator ecosystem monetization (VIP passes, tips, and custom requests)."
    },
    {
      question: "What is the revenue split for content creators on SECCION?",
      answer: "Founding creators (first 500 creators) and Web3 crypto payouts receive a 90% net revenue split (10% platform take-rate) plus 1 year of free AI operations assistance. Standard baseline creator monetization is an 80% net revenue split."
    },
    {
      question: "How does SECCION verify 18+ age and ensure safety?",
      answer: "SECCION uses the DIDIT Zero-Knowledge Identity Gateway for creator verification across 220+ countries and Sightengine AI for biometric 3D facial liveness and age estimation. Member selfies are processed ephemerally and deleted within 5 seconds under GDPR data minimization with zero PII retention."
    },
    {
      question: "What is the 8-Level Chemistry Meter (RLS v2.0)?",
      answer: "The Relationship Level System (RLS v2.0) is an 8-stage connection tracker on SECCION ranging from Level 1 (Undefined) to Level 8 (Soulmate) that dynamically unlocks private galleries, direct calling privileges, and exclusive creator spaces as mutual affinity grows."
    }
  ];

  const defaultBreadcrumbs = [
    { name: "Home", url: "https://seccion.ai" },
    { name: "How We Do", url: "https://seccion.ai/how-we-do" },
    { name: "Become a Creator", url: "https://seccion.ai/become-creator" },
    { name: "Creator Hub", url: "https://seccion.ai/creator-hub" },
    { name: "Vibe Radar", url: "https://seccion.ai/vibe-radar" },
    { name: "Platform Rules & Safety", url: "https://seccion.ai/rules" }
  ];

  return (
    <>
      <OrganizationSchema />
      <SoftwareAppSchema />
      <FAQSchema faqs={defaultFaqs} />
      <BreadcrumbSchema items={defaultBreadcrumbs} />
    </>
  );
}
