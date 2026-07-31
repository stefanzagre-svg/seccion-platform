import type { Metadata } from "next";
import { cookies } from "next/headers";
import { SupportedLocale } from "@/context/LanguageContext";
import en from "@/locales/en.json";
import es from "@/locales/es.json";
import ClientPage from "./page-client";

export async function generateMetadata(): Promise<Metadata> {
  const cookieStore = await cookies();
  const savedLocale = (cookieStore.get("seccion_user_locale")?.value || "en") as SupportedLocale;
  const dict = savedLocale === "es" ? es : en;

  return {
    title: dict.seo.becomeCreator.title,
    description: dict.seo.becomeCreator.desc,
    openGraph: {
      title: dict.seo.becomeCreator.title,
      description: dict.seo.becomeCreator.desc,
    }
  };
}

export default function Page() {
  return <ClientPage />;
}
