import type { Metadata } from "next";
import { cookies } from "next/headers";
import { SupportedLocale } from "@/context/LanguageContext";
import FAQClientPage from "./page-client";

export async function generateMetadata(): Promise<Metadata> {
  const cookieStore = await cookies();
  const savedLocale = (cookieStore.get("seccion_user_locale")?.value || "en") as SupportedLocale;

  const isFr = savedLocale === "fr";
  const isEs = savedLocale === "es";

  const title = isFr
    ? "FAQ — Guide de la Plateforme SECCION pour Créateurs & Membres"
    : isEs
    ? "Preguntas Frecuentes — Guía de la Plataforma SECCION para Creadores y Miembros"
    : "FAQ — SECCION Platform Guide for Creators & Members";

  const description = isFr
    ? "Guide FAQ SECCION : paiement Créateur Fondateur à 90 %, AI Copilot DM 24/7, coffre DRM anti-piratage, Warm Paywall et vérification KYC confidentielle."
    : isEs
    ? "Guía FAQ de SECCION: pago del 90% para Creadores Fundadores, AI Copilot en DMs 24/7, bóveda DRM antipiratería, Warm Paywall y verificación KYC segura."
    : "SECCION FAQ guide: how the 90% Founding Creator payout works, 24/7 voice-trained AI Copilot DMs, DRM anti-piracy vault, Warm Paywall, and KYC safety.";

  return {
    title,
    description,
    keywords: [
      "SECCION FAQ",
      "how does SECCION work",
      "SECCION creator payout explained",
      "AI copilot for creators FAQ",
      "DRM content protection explained",
      "OnlyFans alternative FAQ 2026",
      "warm paywall explained",
      "SECCION vs OnlyFans",
      "how to join SECCION as creator",
      "creator platform no agency fees",
      "SECCION KYC verification",
    ],
    alternates: {
      canonical: "https://seccion.ai/faq",
    },
    openGraph: {
      title,
      description,
      url: "https://seccion.ai/faq",
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

export default function FAQPage() {
  return <FAQClientPage />;
}
