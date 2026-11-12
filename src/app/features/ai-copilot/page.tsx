import type { Metadata } from "next";
import { cookies } from "next/headers";
import { SupportedLocale } from "@/context/LanguageContext";
import AICopilotClientPage from "./page-client";

export async function generateMetadata(): Promise<Metadata> {
  const cookieStore = await cookies();
  const savedLocale = (cookieStore.get("seccion_user_locale")?.value || "en") as SupportedLocale;

  const isFr = savedLocale === "fr";
  const isEs = savedLocale === "es";

  const title = isFr
    ? "AI Copilot pour Créateurs — Gestionnaire DM 24/7 avec Votre Voix Exacte"
    : isEs
    ? "AI Copilot para Creadores — Gestor de DMs 24/7 con Tu Voz Exacta"
    : "AI Copilot for Creators — 24/7 DM Manager in Your Exact Voice";

  const description = isFr
    ? "L'AI Copilot de SECCION répond à vos fans 24/7 en messages privés avec votre ton et votre voix authentiques — entraîné avec votre consentement. Remplacez les agences à 50 % et gardez 90 % de vos revenus."
    : isEs
    ? "El AI Copilot de SECCION interactúa con tus fans 24/7 en DMs con tu tono y voz exactos, entrenado con tu consentimiento. Despide a las agencias que cobran 40–50% y quédate con el 90%."
    : "SECCION's AI Copilot engages your fans 24/7 in direct messages using your exact tone and voice — trained with your explicit permission. Replace chatting agencies taking 40–50% and keep 90% of your earnings.";

  return {
    title,
    description,
    keywords: [
      "AI DM manager for content creators",
      "AI copilot for creators 2026",
      "auto reply fan DMs AI",
      "replace chatting agency AI",
      "AI voice clone for creator DMs",
      "24/7 fan engagement AI",
      "creator AI operations manager",
      "AI fan chat automation",
      "chatting agency alternative AI",
      "SECCION AI copilot",
      "creator AI assistant",
    ],
    alternates: {
      canonical: "https://seccion.ai/features/ai-copilot",
    },
    openGraph: {
      title,
      description,
      url: "https://seccion.ai/features/ai-copilot",
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
  return <AICopilotClientPage />;
}
