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
import { LanguageProvider, SupportedLocale } from "@/context/LanguageContext";

export const viewport: Viewport = {
  themeColor: "#0a0a0c",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://seccion.ai"),
  alternates: {
    canonical: "https://seccion.ai",
  },
  title: {
    default: "SECCION.ai | 1st AI Dating & Creator Live Streaming Hybrid Platform",
    template: "%s | SECCION",
  },
  description: "SECCION is the first AI-driven dating matchmaking and live streaming creator hybrid platform.",
  keywords: ["SECCION", "AI dating app for creators", "live streaming matchmaking app", "seccion.ai", "creator economy"],
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
    title: "SECCION.ai | 1st AI Dating & Creator Live Streaming Hybrid Platform",
    description: "SECCION is the first AI-driven dating matchmaking and live streaming creator hybrid platform.",
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
    locale: "en",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SECCION.ai | 1st AI Dating & Creator Live Streaming Hybrid Platform",
    description: "SECCION is the first AI-driven dating matchmaking and live streaming creator hybrid platform.",
    images: ["https://seccion.ai/assets/seo/og-image.jpg"],
    creator: "@seccionplatform",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const savedLocale: SupportedLocale = "en";

  return (
    <html
      lang={savedLocale}
      className="h-full antialiased dark font-sans"
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
