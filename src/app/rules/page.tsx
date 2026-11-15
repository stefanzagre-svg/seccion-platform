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
    ? "Règles de la Plateforme, CGU & Sécurité 18+"
    : isEs
    ? "Reglas de la Plataforma, Términos y Seguridad"
    : "Platform Rules, Terms of Service & 18+ Safety";

  const description = isFr
    ? "Découvrez les conditions d'utilisation SECCION, les règles de monétisation créateur, les normes DSA européennes, le consentement vérifié et l'anti-piratage."
    : isEs
    ? "Revisa los términos de uso de SECCION, normas de monetización para creadores, estándares de seguridad DSA, consentimiento verificado y políticas antipiratería."
    : "Review SECCION Terms of Service, creator monetization rules, EU DSA safety standards, consent verification, anti-piracy policies, and community guidelines.";

  return {
    title,
    description,
    alternates: {
      canonical: "https://seccion.ai/rules",
    },
    openGraph: {
      title: `${title} | SECCION`,
      description,
      url: "https://seccion.ai/rules",
    }
  };
}

export default function Page() {
  return <ClientPage />;
}
