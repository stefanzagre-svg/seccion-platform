import type { Metadata } from "next";
import { cookies } from "next/headers";
import { SupportedLocale } from "@/context/LanguageContext";
import en from "@/locales/en.json";
import es from "@/locales/es.json";
import ClientPage from "./page-client";

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  try {
    const cookieStore = await cookies();
    const savedLocale = (cookieStore.get("seccion_user_locale")?.value || "en") as SupportedLocale;
    const dict = savedLocale === "es" ? es : en;

    const title = dict?.seo?.home?.title || dict?.metadata?.defaultTitle || "SECCION.ai | 1st AI Dating & Creator Live Streaming Hybrid Platform";
    const description = dict?.seo?.home?.desc || dict?.metadata?.description || "SECCION is the first AI-driven dating matchmaking and live streaming creator hybrid platform.";

    return {
      title,
      description,
      openGraph: {
        title,
        description,
      }
    };
  } catch {
    return {
      title: "SECCION.ai | 1st AI Dating & Creator Live Streaming Hybrid Platform",
      description: "SECCION is the first AI-driven dating matchmaking and live streaming creator hybrid platform.",
    };
  }
}

export default function Page() {
  return <ClientPage />;
}
