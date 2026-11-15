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
    ? "L'AI Copilot SECCION répond aux fans 24/7 en DM avec votre voix exacte et votre consentement. Remplacez les agences à 50 % et gardez 90 % des revenus."
    : isEs
    ? "El AI Copilot de SECCION responde DMs 24/7 con tu tono exacto y tu permiso explícito. Reemplaza agencias que cobran 40–50% y conserva el 90% neto."
    : "SECCION's voice-trained AI Copilot handles 24/7 fan DMs with your explicit consent. Replace chatting agencies taking 40–50% and keep 90% net earnings.";

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
