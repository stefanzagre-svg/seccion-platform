import type { Metadata } from "next";
import { cookies } from "next/headers";
import { SupportedLocale } from "@/context/LanguageContext";
import en from "@/locales/en.json";
import es from "@/locales/es.json";
import ClientPage from "./page-client";

export async function generateMetadata(): Promise<Metadata> {
  try {
    const cookieStore = await cookies();
    const savedLocale = (cookieStore.get("seccion_user_locale")?.value || "en") as SupportedLocale;
    const dict = savedLocale === "es" ? es : en;

    const title = dict?.seo?.howWeDo?.title || "How SECCION Works — AI Matchmaking & Creator Economy";
    const description = dict?.seo?.howWeDo?.desc || "Discover how SECCION blends zero-knowledge AI matchmaking with high-yield creator live streaming.";

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
      title: "How SECCION Works — AI Matchmaking & Creator Economy",
      description: "Discover how SECCION blends zero-knowledge AI matchmaking with high-yield creator live streaming.",
    };
  }
}

export default function Page() {
  return <ClientPage />;
}
