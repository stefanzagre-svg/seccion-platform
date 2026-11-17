import type { Metadata } from "next";
import OnlyFansAlternativeClient from "@/app/creator-hub/onlyfans-alternative/page-client";
import { FAQSchema, BreadcrumbSchema } from "@/components/seo/JsonLd";
import {
  getOnlyFansAlternativeBreadcrumbs,
  getOnlyFansAlternativeFaqs,
  getOnlyFansAlternativeWebPageSchema,
} from "@/app/creator-hub/onlyfans-alternative/faq-schema-data";
import {
  buildLocaleAlternates,
  getLocalizedUrl,
  getOpenGraphLocale,
  type SeoLocale,
} from "@/lib/localized-seo";

const ALT_METADATA_BY_LOCALE: Record<
  SeoLocale,
  {
    title: string;
    description: string;
    ogTitle: string;
    ogDescription: string;
    twitterTitle: string;
    twitterDescription: string;
    keywords: string[];
  }
> = {
  en: {
    title: "Best Creator Platform 2026: OnlyFans & Fansly Alternative",
    description:
      "Looking for the best OnlyFans alternative in 2026? SECCION gives creators a 90% net payout, 24/7 AI DM Copilot, automated DRM protection, and stealth Face Blur.",
    ogTitle: "The Best Creator Platform in 2026: Keep 90% with AI Copilot | SECCION",
    ogDescription:
      "Ditch 20% platform cuts, 40% agency fees, and cold public exposure. SECCION is the all-in-one safe creator platform with 90% payouts, built-in AI DM manager, and automated DRM security.",
    twitterTitle: "The Best Creator Platform in 2026 | SECCION",
    twitterDescription:
      "The safe, AI-powered alternative to OnlyFans, Fansly, Patreon, Tinder & Cams. Keep 90% of your earnings.",
    keywords: [
      "best creator platform in 2026",
      "OnlyFans alternative 2026",
      "Fansly alternative with AI",
      "90 percent creator payout split",
      "automated DRM takedown for creators",
      "AI DM chatter for content creators",
    ],
  },
  es: {
    title: "Mejor Alternativa a OnlyFans 2026 (90% Neto)",
    description:
      "¿Buscas la mejor alternativa a OnlyFans en 2026? SECCION te ofrece 90% de ganancias netas, Copiloto IA 24/7, protección DRM y Difuminado Facial.",
    ogTitle: "La Mejor Alternativa a OnlyFans y Fansly en 2026 (90% Neto) | SECCION",
    ogDescription:
      "Deja atrás comisiones del 20% y agencias del 40%. SECCION reúne 90% neto para fundadores, Copiloto IA en tu tono y protección DRM anti-filtraciones.",
    twitterTitle: "Mejor Alternativa a OnlyFans 2026 | SECCION",
    twitterDescription:
      "Conserva el 90% neto, automatiza tus DMs con IA en español real y protege tu contenido con DRM 24/7.",
    keywords: [
      "mejor alternativa a OnlyFans 2026",
      "alternativa a OnlyFans y Fansly",
      "plataforma creadores 90 por ciento pago",
      "cobros SEPA USDC creadores sin retenciones",
      "protección DRM antifiltraciones creadores",
    ],
  },
  fr: {
    title: "Meilleure Alternative à OnlyFans 2026 (90 %)",
    description:
      "La meilleure alternative à OnlyFans en 2026 : SECCION reverse 90 % des gains nets, offre un Copilote IA 24/7, un Vault DRM et le Flou Facial.",
    ogTitle: "Meilleure Alternative à OnlyFans, Fansly et MYM en 2026 | SECCION",
    ogDescription:
      "Évitez les 20 % de plateforme et 40 % d'agence. Gardez 90 % nets avec Copilote IA vocal, Vault DRM anti-fuite et Flou Facial ZKP sur SECCION.",
    twitterTitle: "Meilleure Alternative à OnlyFans 2026 | SECCION",
    twitterDescription:
      "Conservez 90 % de vos gains nets, protégez votre anonymat avec le Flou Facial ZKP et automatisez vos DMs avec l'IA.",
    keywords: [
      "meilleure alternative OnlyFans 2026",
      "alternative OnlyFans MYM France",
      "plateforme créateurs 90 pourcent revenus",
      "protection anti leak DRM créateur",
      "flou facial ZKP confidentialité créateur",
    ],
  },
};

export function getOnlyFansAlternativeMetadata(locale: SeoLocale): Metadata {
  const copy = ALT_METADATA_BY_LOCALE[locale];
  const url = getLocalizedUrl("/creator-hub/onlyfans-alternative", locale);

  return {
    title: copy.title,
    description: copy.description,
    keywords: copy.keywords,
    alternates: buildLocaleAlternates("/creator-hub/onlyfans-alternative", locale),
    openGraph: {
      title: copy.ogTitle,
      description: copy.ogDescription,
      url,
      siteName: "SECCION",
      images: [
        {
          url: "https://seccion.ai/assets/logo/logo-wordmark.png",
          width: 766,
          height: 191,
          alt: "SECCION 2026 Creator Platform Comparison",
        },
      ],
      locale: getOpenGraphLocale(locale),
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: copy.twitterTitle,
      description: copy.twitterDescription,
      images: ["https://seccion.ai/assets/logo/logo-wordmark.png"],
    },
  };
}

export function LocalizedOnlyFansAltView({ locale }: { locale: SeoLocale }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(getOnlyFansAlternativeWebPageSchema(locale)),
        }}
      />
      <FAQSchema faqs={getOnlyFansAlternativeFaqs(locale)} />
      <BreadcrumbSchema items={getOnlyFansAlternativeBreadcrumbs(locale)} />
      <OnlyFansAlternativeClient forcedLocale={locale} />
    </>
  );
}
