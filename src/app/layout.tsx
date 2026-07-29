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
import JsonLdSchema from "@/components/JsonLdSchema";
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
  const cookieStore = await cookies();
  const savedLocale = (cookieStore.get("seccion_user_locale")?.value || "en") as SupportedLocale;
  const dict = savedLocale === "es" ? es : en;

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "SECCION",
    "alternateName": ["Seccion", "seccion.ai"],
    "url": "https://seccion.ai",
    "logo": "https://seccion.ai/assets/logo/seccion-wordmark-light.png",
    "description": "SECCION is the first fusion platform combining AI-driven dating matchmaking with live streaming content creators. Creators keep 90% of revenue with built-in DRM protection and AI operations assistant.",
    "foundingDate": "2025",
    "areaServed": ["CO", "ES", "US"],
    "knowsLanguage": ["es", "en", "fr"],
    "sameAs": [
      "https://www.instagram.com/seccionplatform",
      "https://www.tiktok.com/@seccionplatform",
      "https://x.com/seccionplatfrom"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer support",
      "url": "https://seccion.ai/hit-us-up",
      "availableLanguage": ["English", "Spanish"]
    }
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "SECCION",
    "url": "https://seccion.ai",
    "description": "The first fusion platform combining AI matchmaking with live content creators.",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://seccion.ai/vibe-radar?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  return {
    metadataBase: new URL("https://seccion.ai"),
    title: {
      default: dict.metadata.defaultTitle,
      template: "%s | SECCION",
    },
    description: dict.metadata.description,
    keywords: dict.metadata.keywords.split(", ").concat(["SECCION"]),
    alternates: {
      canonical: "https://seccion.ai",
    },
    icons: {
      icon: "/icon.jpg",
      shortcut: "/icon.jpg",
      apple: "/assets/logo/app-icon.jpg",
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
      title: dict.metadata.defaultTitle,
      description: dict.metadata.description,
      url: "https://seccion.ai",
      siteName: "SECCION",
      images: [
        {
          url: "/assets/logo/seccion-wordmark-light.png",
          width: 766,
          height: 191,
          alt: "SECCION Logo",
        },
      ],
      locale: savedLocale === "es" ? "es_ES" : "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: dict.metadata.defaultTitle,
      description: dict.metadata.description,
      images: ["/assets/logo/seccion-wordmark-light.png"],
    },
    // JSON-LD structured data injected via metadata 'other' — works in RSC streaming
    other: {
      "script:ld+json:organization": JSON.stringify(organizationSchema),
      "script:ld+json:website": JSON.stringify(websiteSchema),
    },
  };
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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@400;500&family=JetBrains+Mono:wght@500&family=Plus+Jakarta+Sans:wght@500;700;800&family=Outfit:wght@400;500;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans relative overflow-x-hidden pt-safe pb-safe">
        <LanguageProvider initialLocale={savedLocale}>
          {/* PWA Background Services & Smart Prompts */}
          <ServiceWorkerRegister />
          <InAppBrowserDetector />
          <PWAInstallPrompt />

          {/* Global ambient atmosphere — matches the landing page hook */}
          <AmbientBackground />
          <Navbar />
          <div className="relative z-10 flex-1 flex flex-col">
            {children}
          </div>
          {/* SECCION Agent for public/unauthenticated pages */}
          <SeccionAgentBubble />
          {/* AI Dating Wingman Coach for authenticated member accounts */}
          <AIWingmanBubble />
          {/* JSON-LD Structured Data — rendered in body for RSC/Cloudflare Workers compatibility */}
          <JsonLdSchema />
        </LanguageProvider>
      </body>
    </html>
  );
}
