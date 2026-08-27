import type { Metadata, Viewport } from "next";
import "./globals.css";
import React from "react";
import Navbar from "@/components/Navbar";
import AmbientBackground from "@/components/AmbientBackground";
import AIWingmanBubble from "@/components/AIWingmanBubble";
import SeccionAgentBubble from "@/components/SeccionAgentBubble";
import ServiceWorkerRegister from "@/components/pwa/ServiceWorkerRegister";
import InAppBrowserDetector from "@/components/pwa/InAppBrowserDetector";
import PWAInstallPrompt from "@/components/pwa/PWAInstallPrompt";
import JsonLdSuite from "@/components/seo/JsonLd";
import CookieConsentBanner from "@/components/CookieConsentBanner";
import EmailVerificationGuard from "@/components/auth/EmailVerificationGuard";
import FloatingBugButton from "@/components/bug-bounty/FloatingBugButton";
import { cookies } from "next/headers";
import { LanguageProvider, SupportedLocale } from "@/context/LanguageContext";
import en from "@/locales/en.json";
import es from "@/locales/es.json";

const plusJakartaSans = { variable: "font-plus-jakarta-sans-fallback" };
const hankenGrotesk = { variable: "font-hanken-grotesk-fallback" };
const jetBrainsMono = { variable: "font-jetbrains-mono-fallback" };

export const viewport: Viewport = {
  themeColor: "#0a0a0c",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export async function generateMetadata(): Promise<Metadata> {
  try {
    const cookieStore = await cookies();
    const savedLocale = (cookieStore.get("seccion_user_locale")?.value || "en") as SupportedLocale;
    const dict = savedLocale === "es" ? es : en;

    const defaultTitle = dict?.metadata?.defaultTitle || "SECCION.ai | 1st AI Dating & Creator Live Streaming Hybrid Platform";
    const description = dict?.metadata?.description || "SECCION is the first AI-driven dating matchmaking and live streaming creator hybrid platform.";
    const keywords = (dict?.metadata?.keywords || "").split(", ").filter(Boolean).concat(["SECCION", "AI dating app for creators", "live streaming matchmaking app"]);

    return {
      metadataBase: new URL("https://seccion.ai"),
      alternates: {
        canonical: "https://seccion.ai",
      },
      title: {
        default: defaultTitle,
        template: "%s | SECCION",
      },
      description,
      keywords,
      icons: {
        icon: [
          { url: '/favicon.ico', sizes: 'any' },
          { url: '/favicon.png', type: 'image/png' },
          { url: '/icon.png', type: 'image/png' },
        ],
        shortcut: '/favicon.ico',
        apple: '/apple-touch-icon.png',
      },
      appleWebApp: {
        capable: true,
        statusBarStyle: "black-translucent",
        title: "SECCION",
      },
      formatDetection: {
        telephone: false,
      },
      openGraph: {
        title: defaultTitle,
        description,
        url: "https://seccion.ai",
        siteName: "SECCION",
        images: [
          {
            url: "https://seccion.ai/assets/seo/og-image.jpg",
            width: 1200,
            height: 630,
            alt: "SECCION Platform",
          },
        ],
        locale: savedLocale,
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title: defaultTitle,
        description,
        images: ["https://seccion.ai/assets/seo/og-image.jpg"],
        creator: "@seccionplatform",
      },
    };
  } catch {
    return {
      metadataBase: new URL("https://seccion.ai"),
      title: {
        default: "SECCION.ai | 1st AI Dating & Creator Live Streaming Hybrid Platform",
        template: "%s | SECCION",
      },
      description: "SECCION is the first AI-driven dating matchmaking and live streaming creator hybrid platform.",
    };
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const savedLocale = (cookieStore.get("seccion_user_locale")?.value || "en") as SupportedLocale;

  return (
    <html
      lang={savedLocale}
      className={`${plusJakartaSans.variable} ${hankenGrotesk.variable} ${jetBrainsMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans relative overflow-x-hidden pt-safe pb-safe">
        {/* Rich Structured Data for AI Search & Engine Indexing */}
        <JsonLdSuite />
        <LanguageProvider initialLocale={savedLocale}>
          {/* PWA Background Services & Smart Prompts */}
          <ServiceWorkerRegister />
          <InAppBrowserDetector />
          <PWAInstallPrompt />

          {/* Global ambient atmosphere — matches the landing page hook */}
          <AmbientBackground />
          <Navbar />
          <div className="relative z-10 flex-1 flex flex-col">
            <EmailVerificationGuard>
              {children}
            </EmailVerificationGuard>
          </div>
          {/* SECCION Agent for public/unauthenticated pages */}
          <SeccionAgentBubble />
          {/* AI Dating Wingman Coach for authenticated member accounts */}
          <AIWingmanBubble />
          {/* Community Bug Bounty & Glitch Reporter */}
          <FloatingBugButton />
          <CookieConsentBanner />
        </LanguageProvider>
      </body>
    </html>
  );
}
