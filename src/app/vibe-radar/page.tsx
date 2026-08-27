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

    const title = dict?.seo?.vibeRadar?.title || "Vibe Radar — Real-Time Discovery | SECCION";
    const description = dict?.seo?.vibeRadar?.desc || "Explore creators, active live sessions, and compatible dating connections in real time.";

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
      title: "Vibe Radar — Real-Time Discovery | SECCION",
      description: "Explore creators, active live sessions, and compatible dating connections in real time.",
    };
  }
}

export default function Page() {
  return <ClientPage />;
}
