import type { Metadata } from "next";
import HowWeDoClientPage from "@/app/how-we-do/page-client";
import VibeRadarClientPage from "@/app/vibe-radar/page-client";
import AICopilotClientPage from "@/app/features/ai-copilot/page-client";
import DRMProtectionClientPage from "@/app/features/drm-protection/page-client";
import { BreadcrumbSchema } from "@/components/seo/JsonLd";
import {
  buildLocaleAlternates,
  getLocalizedUrl,
  getOpenGraphLocale,
  type SeoLocale,
} from "@/lib/localized-seo";

export type Phase2RouteKey =
  | "how-we-do"
  | "vibe-radar"
  | "ai-copilot"
  | "drm-protection";

interface RouteMetaCopy {
  title: string;
  description: string;
  ogTitle?: string;
}

interface Phase2RouteConfig {
  basePath: string;
  breadcrumbName: Record<SeoLocale, string>;
  keywords: string[];
  locales: Record<SeoLocale, RouteMetaCopy>;
}

const PHASE2_ROUTES: Record<Phase2RouteKey, Phase2RouteConfig> = {
  "how-we-do": {
    basePath: "/how-we-do",
    breadcrumbName: {
      en: "How SECCION Works",
      es: "Cómo Funciona SECCION",
      fr: "Fonctionnement SECCION",
    },
    keywords: [
      "Warm Paywall social discovery",
      "8 level chemistry meter",
      "free matching messaging verified humans",
      "como funciona Warm Paywall SECCION",
      "fonctionnement Warm Paywall SECCION",
    ],
    locales: {
      en: {
        title: "How SECCION Works — AI Matchmaking & Creator Economy",
        description:
          "Discover how SECCION blends AI-assisted compatibility matching, Warm Paywall discovery, zero-knowledge Face Blur privacy, and high-yield creator live rooms.",
      },
      es: {
        title: "Cómo Funciona SECCION — Warm Paywall y Economía Creador",
        description:
          "Descubre cómo SECCION combina afinidad asistida por IA, descubrimiento Warm Paywall sin muros fríos, Face Blur ZKP y salas en vivo para creadores.",
      },
      fr: {
        title: "Fonctionnement de SECCION — Warm Paywall et Créateurs",
        description:
          "Découvrez comment SECCION réunit affinités assistées par IA, découverte Warm Paywall sans paywall froid, Flou Facial ZKP et lives créateurs à 90 %.",
      },
    },
  },
  "vibe-radar": {
    basePath: "/vibe-radar",
    breadcrumbName: {
      en: "Vibe Radar",
      es: "Vibe Radar",
      fr: "Vibe Radar",
    },
    keywords: [
      "Vibe Radar verified creators",
      "meet verified real humans by interests",
      "conectar personas reales por intereses sin paywall",
      "rencontres par affinités sans bots ni paywall",
    ],
    locales: {
      en: {
        title: "Vibe Radar — Real-Time Creator Discovery & Live Streams",
        description:
          "Explore verified creators, active live streams, and high-chemistry community connections in real time across interests and cities on SECCION Vibe Radar.",
        ogTitle: "Vibe Radar — Real-Time Creator Discovery & Live Streams | SECCION",
      },
      es: {
        title: "Vibe Radar — Descubrimiento Verificado y Lives en Vivo",
        description:
          "Explora creadores verificados, transmisiones en vivo y conexiones reales por intereses en tiempo real sin paywalls fríos en SECCION Vibe Radar.",
      },
      fr: {
        title: "Vibe Radar — Découverte Vérifiée et Lives en Direct",
        description:
          "Explorez des créateurs vérifiés, des lives actifs et des connexions humaines par affinités en temps réel sans paywall froid sur SECCION Vibe Radar.",
      },
    },
  },
  "ai-copilot": {
    basePath: "/features/ai-copilot",
    breadcrumbName: {
      en: "AI Copilot",
      es: "Copiloto IA",
      fr: "AI Copilot",
    },
    keywords: [
      "AI DM manager for content creators",
      "AI copilot for creators 2026",
      "replace chatting agency AI",
      "reemplazar agencia OnlyFans con IA",
      "remplacer agence chatting OnlyFans IA",
    ],
    locales: {
      en: {
        title: "AI Copilot for Creators — 24/7 DM Assistant in Your Voice",
        description:
          "SECCION's voice-trained AI Copilot handles 24/7 fan DMs with your explicit consent. Replace chatting agencies taking 40–50% and keep 90% net earnings.",
      },
      es: {
        title: "AI Copilot para Creadores — Asistente DM 24/7 con Tu Voz",
        description:
          "El AI Copilot de SECCION responde DMs 24/7 con tu tono exacto y tu permiso explícito. Reemplaza agencias que cobran 40–50% y conserva el 90% neto.",
      },
      fr: {
        title: "AI Copilot Créateurs — Assistant DM 24/7 à Votre Voix",
        description:
          "L'AI Copilot SECCION répond aux fans 24/7 en DM avec votre voix exacte et votre consentement. Remplacez les agences à 50 % et gardez 90 % des revenus.",
      },
    },
  },
  "drm-protection": {
    basePath: "/features/drm-protection",
    breadcrumbName: {
      en: "DRM Content Vault",
      es: "Content Vault DRM",
      fr: "DRM Content Vault",
    },
    keywords: [
      "DRM content protection for creators",
      "OnlyFans content leak protection",
      "face blur privacy creator",
      "protección DRM antifiltraciones creadores",
      "protection anti leak DRM flou facial ZKP",
    ],
    locales: {
      en: {
        title: "DRM Content Vault — Anti-Piracy Protection for Creators",
        description:
          "SECCION's DRM Content Vault combines cryptographic watermarking and an autonomous DMCA sweeper to stop creator leaks and piracy automatically 24/7.",
      },
      es: {
        title: "Content Vault DRM — Protección Antipiratería Creadores",
        description:
          "El Content Vault DRM de SECCION usa marcas de agua criptográficas y rastreo DMCA autónomo 24/7 para frenar filtraciones y piratería de tus archivos.",
      },
      fr: {
        title: "DRM Content Vault — Protection Anti-Fuite Créateurs",
        description:
          "Le DRM Content Vault de SECCION applique un filigrane cryptographique et un robot DMCA autonome pour stopper piratage, fuites et diffusions 24/7.",
      },
    },
  },
};

export function getPhase2Metadata(
  routeKey: Phase2RouteKey,
  locale: SeoLocale
): Metadata {
  const cfg = PHASE2_ROUTES[routeKey];
  const copy = cfg.locales[locale];
  const url = getLocalizedUrl(cfg.basePath, locale);

  return {
    title: copy.title,
    description: copy.description,
    keywords: cfg.keywords,
    alternates: buildLocaleAlternates(cfg.basePath, locale),
    openGraph: {
      title: copy.ogTitle || copy.title,
      description: copy.description,
      url,
      siteName: "SECCION",
      locale: getOpenGraphLocale(locale),
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: copy.ogTitle || copy.title,
      description: copy.description,
      site: "@steveseccion",
      creator: "@steveseccion",
    },
  };
}

export function LocalizedPhase2View({
  routeKey,
  locale,
}: {
  routeKey: Phase2RouteKey;
  locale: SeoLocale;
}) {
  if (routeKey === "ai-copilot") {
    return <AICopilotClientPage forcedLocale={locale} />;
  }
  if (routeKey === "drm-protection") {
    return <DRMProtectionClientPage forcedLocale={locale} />;
  }

  const cfg = PHASE2_ROUTES[routeKey];
  const pageUrl = getLocalizedUrl(cfg.basePath, locale);
  const copy = cfg.locales[locale];
  const breadcrumbs = [
    {
      name: locale === "fr" ? "Accueil" : locale === "es" ? "Inicio" : "Home",
      url: "https://seccion.ai",
    },
    { name: cfg.breadcrumbName[locale], url: pageUrl },
  ];
  const webPageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${pageUrl}#webpage`,
    url: pageUrl,
    inLanguage: locale,
    name: copy.title,
    description: copy.description,
    isPartOf: {
      "@type": "WebSite",
      "@id": "https://seccion.ai/#website",
      name: "SECCION",
      url: "https://seccion.ai",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }}
      />
      <BreadcrumbSchema items={breadcrumbs} />
      {routeKey === "how-we-do" ? (
        <HowWeDoClientPage forcedLocale={locale} />
      ) : (
        <VibeRadarClientPage forcedLocale={locale} />
      )}
    </>
  );
}
