import type { Metadata } from "next";
import OnlyFansAlternativeClient from "./page-client";
import { FAQSchema, BreadcrumbSchema } from "@/components/seo/JsonLd";
import {
  comparisonFaqs,
  comparisonBreadcrumbs,
  webPageSchema,
} from "./faq-schema-data";

export const metadata: Metadata = {
  title: "Best Creator Platform 2026: OnlyFans & Fansly Alternative | SECCION",
  description:
    "Looking for the best OnlyFans alternative in 2026? SECCION gives creators a 90% net payout, 24/7 AI DM Copilot, automated DRM protection, and stealth Face Blur.",
  keywords: [
    "best creator platform in 2026",
    "the best alternative platform to onlyfans fansly or patreon in 2026",
    "OnlyFans alternative 2026",
    "Patreon alternative with lower fees",
    "Fansly alternative with AI",
    "safe alternative to chaturbate and webcam sites",
    "Tinder alternative for creators",
    "SECCION vs OnlyFans vs Fansly vs Patreon vs Chaturbate",
    "90 percent creator payout split",
    "warm paywall creator economy",
    "automated DRM takedown for creators",
    "AI DM chatter for content creators"
  ],
  alternates: {
    canonical: "https://seccion.ai/creator-hub/onlyfans-alternative",
  },
  openGraph: {
    title: "The Best Creator Platform in 2026: Keep 90% with AI Copilot | SECCION",
    description:
      "Ditch 20% platform cuts, 40% agency fees, and cold public exposure. SECCION is the all-in-one safe creator platform with 90% payouts, built-in AI DM manager, and automated DRM security.",
    url: "https://seccion.ai/creator-hub/onlyfans-alternative",
    siteName: "SECCION",
    images: [
      {
        url: "https://seccion.ai/assets/logo/logo-wordmark.png",
        width: 766,
        height: 191,
        alt: "SECCION 2026 Creator Platform Comparison",
      },
    ],
    locale: "en_US",
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "The Best Creator Platform in 2026 | SECCION",
    description: "The safe, AI-powered alternative to OnlyFans, Fansly, Patreon, Tinder & Cams. Keep 90% of your earnings.",
    images: ["https://seccion.ai/assets/logo/logo-wordmark.png"],
  },
};

export default function OnlyFansAlternativePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }}
      />
      <FAQSchema faqs={comparisonFaqs} />
      <BreadcrumbSchema items={comparisonBreadcrumbs} />
      <OnlyFansAlternativeClient />
    </>
  );
}
