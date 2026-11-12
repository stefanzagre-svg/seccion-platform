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
    ? "Tout ce que vous devez savoir sur SECCION : reversement de 90 %, AI Copilot 24/7 en DM, coffre DRM anti-piratage, Warm Paywall, vérification KYC et statut Créateur Fondateur."
    : isEs
    ? "Todo lo que necesitas saber sobre SECCION: cómo funciona el pago del 90%, el AI Copilot 24/7 en DMs, la bóveda DRM antipiratería, el Warm Paywall, la verificación KYC y cómo unirte como Creador Fundador."
    : "Everything you need to know about SECCION: how the 90% creator payout works, the 24/7 AI Copilot DMs, DRM anti-piracy vault, Warm Paywall, KYC verification, and how to join as a Founding Creator.";

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
