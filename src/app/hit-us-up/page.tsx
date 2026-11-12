import type { Metadata } from "next";
import { cookies } from "next/headers";
import { SupportedLocale } from "@/context/LanguageContext";
import ClientPage from "./page-client";

export async function generateMetadata(): Promise<Metadata> {
  const cookieStore = await cookies();
  const savedLocale = (cookieStore.get("seccion_user_locale")?.value || "en") as SupportedLocale;

  return {
    title: savedLocale === "fr" ? "Contactez-nous | SECCION" : savedLocale === "es" ? "Contáctanos | SECCION" : "Contact Us | SECCION",
    description: savedLocale === "fr" ? "Prenez contact avec l'équipe SECCION. Nous accompagnons créateurs et membres 24/7." : savedLocale === "es" ? "Ponte en contacto con el equipo de SECCION. Estamos aquí para apoyar a creadores y miembros." : "Get in touch with the SECCION team. We are here to support creators and members.",
    alternates: {
      canonical: "https://seccion.ai/hit-us-up",
    },
    openGraph: {
      title: savedLocale === "fr" ? "Contactez-nous | SECCION" : savedLocale === "es" ? "Contáctanos | SECCION" : "Contact Us | SECCION",
      description: savedLocale === "fr" ? "Prenez contact avec l'équipe SECCION. Nous accompagnons créateurs et membres 24/7." : savedLocale === "es" ? "Ponte en contacto con el equipo de SECCION. Estamos aquí para apoyar a creadores y miembros." : "Get in touch with the SECCION team. We are here to support creators and members.",
      url: "https://seccion.ai/hit-us-up",
    }
  };
}

export default function Page() {
  return <ClientPage />;
}
