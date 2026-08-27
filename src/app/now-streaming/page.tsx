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

    const title = dict?.seo?.nowStreaming?.title || "Live Streams & VIP Rooms | SECCION";
    const description = dict?.seo?.nowStreaming?.desc || "Watch live broadcasts, connect in interactive VIP sessions, and engage with verified creators worldwide.";

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
      title: "Live Streams & VIP Rooms | SECCION",
      description: "Watch live broadcasts, connect in interactive VIP sessions, and engage with verified creators worldwide.",
    };
  }
}

export default function Page() {
  return <ClientPage />;
}
