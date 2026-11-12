import type { Metadata } from "next";
import { cookies } from "next/headers";
import { SupportedLocale } from "@/context/LanguageContext";
import DRMProtectionClientPage from "./page-client";

export async function generateMetadata(): Promise<Metadata> {
  const cookieStore = await cookies();
  const savedLocale = (cookieStore.get("seccion_user_locale")?.value || "en") as SupportedLocale;

  const isFr = savedLocale === "fr";
  const isEs = savedLocale === "es";

  const title = isFr
    ? "DRM Content Vault — Protection Anti-Piratage pour Créateurs"
    : isEs
    ? "Content Vault DRM — Protección Antipiratería para Creadores"
    : "DRM Content Vault — Anti-Piracy Protection for Creators";

  const description = isFr
    ? "Le DRM Content Vault de SECCION utilise un filigrane cryptographique et un robot DMCA autonome pour protéger vos photos et vidéos du piratage et des fuites — automatiquement, 24/7."
    : isEs
    ? "El Content Vault DRM de SECCION utiliza marcas de agua criptográficas y un rastreador web DMCA autónomo para proteger tus fotos y videos contra piratería y filtraciones 24/7."
    : "SECCION's DRM Content Vault uses cryptographic watermarking and an autonomous DMCA web sweeper to protect your photos and videos from piracy, leaks, and unauthorized distribution — automatically, 24/7.";

  return {
    title,
    description,
    keywords: [
      "DRM content protection for creators",
      "creator content anti-piracy 2026",
      "OnlyFans content leak protection",
      "automated DMCA takedown creators",
      "content watermarking creators",
      "face blur privacy creator",
      "creator content vault",
      "stop fan leak creator content",
      "DRM video protection creator platform",
      "SECCION DRM vault",
      "content creator piracy protection",
    ],
    alternates: {
      canonical: "https://seccion.ai/features/drm-protection",
    },
    openGraph: {
      title,
      description,
      url: "https://seccion.ai/features/drm-protection",
      siteName: "SECCION",
      locale: isFr ? "fr_FR" : isEs ? "es_ES" : "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      site: "@steveseccion",
      creator: "@steveseccion",
    },
  };
}

export default function Page() {
  return <DRMProtectionClientPage />;
}
