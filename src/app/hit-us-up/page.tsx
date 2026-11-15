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
    ? "Contacter SECCION — Support Créateurs & Membres"
    : isEs
    ? "Contacto y Soporte — Ayuda a Creadores y Miembros"
    : "Contact SECCION Support — Creator & Member Help";

  const description = isFr
    ? "Contactez l'équipe support SECCION à Madrid pour l'onboarding Créateur Fondateur, vos paiements, le retrait DMCA anti-piratage, le RGPD ou l'aide membre."
    : isEs
    ? "Contacta con el equipo de soporte de SECCION en Madrid para onboarding de Creadores Fundadores, pagos, retiros DMCA, solicitudes GDPR o ayuda a miembros."
    : "Contact the SECCION support team in Madrid for Founding Creator onboarding, payouts, DRM anti-piracy takedowns, GDPR privacy requests, or member help.";

  return {
    title,
    description,
    alternates: {
      canonical: "https://seccion.ai/hit-us-up",
    },
    openGraph: {
      title: `${title} | SECCION`,
      description,
      url: "https://seccion.ai/hit-us-up",
    }
  };
}

export default function Page() {
  return <ClientPage />;
}
