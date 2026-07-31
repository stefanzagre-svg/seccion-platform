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
    title: savedLocale === "es" ? "Centro de Creadores | SECCION" : "Creator Hub | SECCION",
    description: dict.metadata.description,
    openGraph: {
      title: savedLocale === "es" ? "Centro de Creadores | SECCION" : "Creator Hub | SECCION",
      description: dict.metadata.description,
    }
  };
}

export default function Page() {
  return <ClientPage />;
}
