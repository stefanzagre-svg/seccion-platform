import type { Metadata } from "next";
import { cookies } from "next/headers";
import { SupportedLocale } from "@/context/LanguageContext";
import ClientPage from "./page-client";

export async function generateMetadata(): Promise<Metadata> {
  const cookieStore = await cookies();
  const savedLocale = (cookieStore.get("seccion_user_locale")?.value || "en") as SupportedLocale;

  const isFr = savedLocale === "fr";
  const isEs = savedLocale === "es";

  const title = isFr
    ? "Centre des Créateurs — Revenus 90 % & Outils Studio"
    : isEs
    ? "Centro de Creadores — 90% de Ingresos y Estudio"
    : "Creator Hub — 90% Revenue Split & Studio Tools";

  const description = isFr
    ? "Explorez le Centre des Créateurs SECCION : gardez 90 % des revenus Fondateur, automatisez vos DM avec l'AI Copilot 24/7 et protégez vos médias via DRM."
    : isEs
    ? "Explora el Centro de Creadores de SECCION: conserva el 90% de ingresos Fundador, automatiza tus DMs con AI Copilot 24/7 y protege tu contenido con DRM."
    : "Explore the SECCION Creator Hub: keep 90% Founding Creator revenue, automate 24/7 DMs with AI Copilot, seal media in a DRM vault, and earn via Warm Paywall.";

  return {
    title,
    description,
    alternates: {
      canonical: "https://seccion.ai/creator-hub",
    },
    openGraph: {
      title: `${title} | SECCION`,
      description,
      url: "https://seccion.ai/creator-hub",
    }
  };
}

export default function Page() {
  return <ClientPage />;
}
