import type { Metadata } from "next";
import ClientPage from "./page-client";

export const metadata: Metadata = {
  title: "SECCION — AI-Powered Creator Platform | 90% Payout, AI Copilot & DRM Protection",
  description: "SECCION is the creator platform built for independence: keep 90% of your earnings, engage fans 24/7 with an AI Copilot trained in your exact voice, and protect your content with an unbreakable DRM vault. Zero agency cuts.",
  keywords: [
    "creator platform 90% payout",
    "OnlyFans alternative 2026",
    "AI copilot for content creators",
    "DRM content protection creator",
    "content creator anti-piracy",
    "creator economy platform",
    "best Patreon alternative",
    "AI DM manager creators",
    "live streaming creator platform",
    "creator monetization platform",
    "warm paywall",
    "SECCION platform"
  ],
  alternates: {
    canonical: "https://seccion.ai/",
  },
  openGraph: {
    title: "SECCION — 90% Payout, AI Copilot & DRM Content Vault",
    description: "Keep 90% of your earnings. Your AI Copilot handles DMs 24/7 in your exact voice. Your content is sealed with DRM anti-piracy protection. Zero agency cuts.",
    url: "https://seccion.ai",
    siteName: "SECCION",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SECCION — The Creator Platform That Pays 90% & Kills Piracy",
    description: "Keep 90% of your earnings. AI Copilot DMs 24/7 in your voice. DRM vault locks out piracy. No agency cuts. Built for independent creators.",
    site: "@steveseccion",
    creator: "@steveseccion",
  }
};

export default function Page() {
  return <ClientPage />;
}
