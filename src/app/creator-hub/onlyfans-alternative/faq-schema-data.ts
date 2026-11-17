import { getLocalizedUrl, type SeoLocale } from "@/lib/localized-seo";

export const comparisonFaqs = [
  {
    question: "Why is SECCION the best alternative platform to OnlyFans, Fansly, and Patreon in 2026?",
    answer: "SECCION combines the highest payout in the industry (90% net revenue split) with the latest artificial intelligence tools. Creators get a 24/7 AI Operations Copilot that manages fan DMs in their unique voice, screens brand contracts, and automatically sweeps the web to file legal DMCA takedowns against leaked content."
  },
  {
    question: "How does SECCION compare to traditional webcam sites like Chaturbate?",
    answer: "Webcam sites take 50% of creator earnings through token markdowns, offer zero leak protection, and expose creators to heavy public stigma. SECCION allows creators to retain 90% of earnings, gates live streams for Level 3+ verified supporters, and includes Stealth Face Blur encryption to protect their personal identity."
  },
  {
    question: "How does SECCION differ from dating apps like Tinder?",
    answer: "Dating apps like Tinder offer zero monetization and cause immense swipe fatigue through superficial algorithmic matching. SECCION turns social discovery into a high-retention creator economy: members match with creators based on lifestyle compatibility and unlock VIP access through the Warm Paywall."
  },
  {
    question: "How do I claim the 90% Founding Creator Offer and Free AI Copilot?",
    answer: "Simply click 'Apply as a Founding Creator' and complete the 2-minute onboarding form. The first 500 creators receive a 90% net revenue payout lock for their entire first year and 12 months of the AI Operations Copilot 100% free (saving €828/year)."
  }
];

const comparisonFaqsEs = [
  {
    question: "¿Por qué SECCION es la mejor alternativa a OnlyFans, Fansly y Patreon en 2026?",
    answer: "SECCION combina la mayor retención de ingresos del sector (90% neto) con un Copiloto IA 24/7 que atiende DMs con tu voz real, audita contratos de marca y realiza barridos DRM automáticos con retiradas DMCA contra filtraciones."
  },
  {
    question: "¿Cómo se compara SECCION con sitios de webcam como Chaturbate?",
    answer: "Los sitios de webcam retienen el 50% mediante tokens y carecen de protección frente a filtraciones. En SECCION conservas el 90% de tus ingresos, reservas los directos para seguidores verificados Nivel 3+ y proteges tu rostro con Difuminado Facial ZKP."
  },
  {
    question: "¿En qué se diferencia SECCION de aplicaciones sociales tradicionales?",
    answer: "SECCION elimina los muros de pago fríos para miembros y transforma el descubrimiento por afinidad real en una economía sostenible para creadores a través del Warm Paywall."
  },
  {
    question: "¿Cómo reclamo la oferta Fundadora del 90% y 1 año gratis de Copiloto IA?",
    answer: "Completa tu solicitud de Creador Fundador en 2 minutos. Los primeros 500 creadores aseguran el 90% neto durante su primer año y 12 meses de Copiloto IA de Operaciones 100% gratis."
  }
];

const comparisonFaqsFr = [
  {
    question: "Pourquoi SECCION est-elle la meilleure alternative à OnlyFans, Fansly et MYM en 2026 ?",
    answer: "SECCION associe la rémunération la plus élevée du marché (90 % net) à un Copilote IA 24/7 qui répond aux DMs avec votre ton exact, analyse vos contrats et lance des retraits DMCA automatisés grâce au Vault DRM anti-fuite."
  },
  {
    question: "Comment SECCION se compare-t-elle aux sites de webcam comme Chaturbate ?",
    answer: "Les sites de webcam prélèvent 50 % via les jetons sans aucune protection contre les fuites. Sur SECCION, vous conservez 90 % de vos gains nets, vos lives sont réservés aux membres vérifiés Niveau 3+ et le Flou Facial ZKP préserve votre anonymat."
  },
  {
    question: "En quoi SECCION diffère-t-elle des plateformes à paywall froid ?",
    answer: "SECCION garde la découverte et la messagerie 100 % gratuites pour de vraies personnes vérifiées et active la monétisation VIP une fois la complicité établie grâce au Warm Paywall."
  },
  {
    question: "Comment obtenir l'offre Fondateur à 90 % et le Copilote IA gratuit pendant 1 an ?",
    answer: "Remplissez la candidature Créateur Fondateur en 2 minutes. Les 500 premiers créateurs verrouillent 90 % de revenus nets et reçoivent 12 mois d'Assistant Opérationnel IA inclus."
  }
];

export function getOnlyFansAlternativeFaqs(locale: SeoLocale) {
  if (locale === "fr") return comparisonFaqsFr;
  if (locale === "es") return comparisonFaqsEs;
  return comparisonFaqs;
}

export function getOnlyFansAlternativeBreadcrumbs(locale: SeoLocale) {
  const url = getLocalizedUrl("/creator-hub/onlyfans-alternative", locale);
  if (locale === "fr") {
    return [
      { name: "Accueil", url: "https://seccion.ai" },
      { name: "Creator Hub", url: "https://seccion.ai/creator-hub" },
      { name: "Alternative OnlyFans & MYM 2026", url },
    ];
  }
  if (locale === "es") {
    return [
      { name: "Inicio", url: "https://seccion.ai" },
      { name: "Creator Hub", url: "https://seccion.ai/creator-hub" },
      { name: "Alternativas a OnlyFans 2026", url },
    ];
  }
  return comparisonBreadcrumbs;
}

export const comparisonBreadcrumbs = [
  { name: "Home", url: "https://seccion.ai" },
  { name: "Creator Hub", url: "https://seccion.ai/creator-hub" },
  { name: "OnlyFans & Creator Alternatives 2026", url: "https://seccion.ai/creator-hub/onlyfans-alternative" }
];

export function getOnlyFansAlternativeWebPageSchema(locale: SeoLocale) {
  const url = getLocalizedUrl("/creator-hub/onlyfans-alternative", locale);
  const name =
    locale === "fr"
      ? "Meilleure Alternative à OnlyFans 2026 : 90 % Net & Copilote IA — SECCION"
      : locale === "es"
      ? "Mejor Alternativa a OnlyFans 2026 : 90% Neto y Copiloto IA — SECCION"
      : "The Best Creator Platform in 2026 | Safe AI Alternative to OnlyFans, Fansly, Patreon & Cams — SECCION";
  const description =
    locale === "fr"
      ? "Alternative sécurisée à OnlyFans, Fansly, Fanvue et MYM en 2026 : conservez 90 % net, utilisez le Copilote IA 24/7 et protégez vos médias avec DRM et Flou Facial ZKP."
      : locale === "es"
      ? "Alternativa segura a OnlyFans, Fansly y Fanvue en 2026: conserva el 90% neto, usa tu Copiloto IA 24/7 y protege tu contenido con DRM y Difuminado Facial ZKP."
      : "Looking for the best alternative to OnlyFans, Fansly, Patreon, Tinder or Chaturbate in 2026? SECCION gives creators a 90% net payout, built-in 24/7 AI DM Copilot, automated DRM anti-leak protection, and stealth Face Blur.";

  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${url}#webpage`,
    "url": url,
    "inLanguage": locale,
    "name": name,
    "description": description,
    "isPartOf": {
      "@type": "WebSite",
      "@id": "https://seccion.ai/#website",
      "name": "SECCION",
      "url": "https://seccion.ai"
    },
    "about": {
      "@type": "SoftwareApplication",
      "name": "SECCION Creator Platform",
      "applicationCategory": "MultimediaApplication, SocialNetworkingApplication",
      "operatingSystem": "Web, iOS, Android (PWA)",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "EUR",
        "description": "90% Net Payout Split for Founding Creators + 1 Year Free AI Copilot"
      },
      "featureList": [
        "90% Net Revenue Split",
        "24/7 AI DM Copilot & Operations Chatter",
        "Automated DRM Anti-Leak Legal DMCA Sweeps",
        "Stealth Zero-Knowledge Face Blur Encryption",
        "Warm Paywall Chemistry-First Discovery",
        "Native WebRTC 1-on-1 Video Calls and Live Streaming"
      ]
    }
  };
}

export const webPageSchema = getOnlyFansAlternativeWebPageSchema("en");
