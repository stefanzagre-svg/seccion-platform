import type { Metadata } from "next";
import ClientPage from "./page-client";

export const metadata: Metadata = {
  // Note: layout.tsx template is "%s | SECCION" — do NOT add "| SECCION" here to avoid duplication
  title: "Become a Creator — 90% Payout, AI Copilot & DRM Vault",
  description: "Join SECCION as a Founding Creator. Keep 90% net revenue, get a free 24/7 AI Copilot that engages fans in your exact voice, and protect your content with DRM anti-piracy vaulting. Zero agency cuts.",
  keywords: [
    "become a content creator",
    "join creator platform 90% payout",
    "OnlyFans alternative creator signup",
    "best creator platform 2026",
    "AI copilot for content creators",
    "DRM content protection signup",
    "founding creator SECCION",
    "creator monetization no agency"
  ],
  alternates: {
    canonical: "https://seccion.ai/become-creator",
  },
  openGraph: {
    title: "Become a Creator — 90% Payout, AI Copilot & DRM Vault | SECCION",
    description: "Join SECCION as a Founding Creator. Keep 90% net revenue, get a free 24/7 AI Copilot in your exact voice, and protect your content with DRM anti-piracy vaulting.",
    url: "https://seccion.ai/become-creator",
    siteName: "SECCION",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Become a Creator on SECCION — 90% Payout & Free AI Copilot",
    description: "Join SECCION as a Founding Creator. Keep 90% net revenue, get a free AI Copilot that handles DMs 24/7 in your voice, and seal your content with DRM protection.",
    images: ["https://seccion.ai/assets/seo/og-image.jpg"],
    site: "@steveseccion",
    creator: "@steveseccion",
  }
};

export default function Page() {
  return <ClientPage />;
}
