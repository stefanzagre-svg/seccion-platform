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
    ? "Politique de Confidentialité — RGPD, ZKP & Données"
    : isEs
    ? "Política de Privacidad — GDPR, ZKP y Protección"
    : "Privacy Policy — GDPR, ZKP & Data Protection";

  const description = isFr
    ? "Consultez la politique de confidentialité SECCION : conformité RGPD, vérification KYC zero-knowledge, stockage DRM chiffré et contrôle total de vos données."
    : isEs
    ? "Consulta la política de privacidad de SECCION: cumplimiento GDPR, verificación KYC zero-knowledge, almacenamiento DRM cifrado y control total de tus datos."
    : "Read the SECCION Privacy Policy: GDPR compliance, zero-knowledge KYC identity verification, encrypted DRM media storage, and user data rights in Europe.";

  return {
    title,
    description,
    alternates: {
      canonical: "https://seccion.ai/privacy",
    },
    openGraph: {
      title: `${title} | SECCION`,
      description,
      url: "https://seccion.ai/privacy",
    }
  };
}

export default function Page() {
  return <ClientPage />;
}
