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
  alternates: {},
  title: {
    // Page-level titles should NOT include "| SECCION" — this template appends it automatically
    default: "SECCION — AI-Powered Creator Platform | 90% Payout, AI Copilot & DRM Protection",
    template: "%s | SECCION",
  },
  description: "SECCION is the creator platform built for independence: keep 90% of your earnings, engage fans 24/7 with an AI Copilot trained in your exact voice, and protect your content with an unbreakable DRM vault. Zero agency cuts.",
  keywords: [
    "creator platform 90% payout",
    "OnlyFans alternative 2026",
    "AI copilot for content creators",
    "DRM content protection creator",
    "content creator anti-piracy",
    "best Patreon alternative",
    "AI DM manager creators",
    "live streaming creator platform",
    "creator monetization platform",
    "warm paywall creator economy",
    "SECCION platform",
    "creator economy 2026"
  ],
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
    title: "SECCION — 90% Payout, AI Copilot & DRM Content Vault",
    description: "Keep 90% of your earnings. Your AI Copilot handles DMs 24/7 in your exact voice. Your content is sealed with DRM anti-piracy protection. Zero agency cuts.",
    url: "https://seccion.ai",
    siteName: "SECCION",
    images: [
      {
        url: "https://seccion.ai/assets/seo/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "SECCION — AI-Powered Creator Platform",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SECCION — The Creator Platform That Pays 90% & Kills Piracy",
    description: "Keep 90% of your earnings. AI Copilot DMs 24/7 in your voice. DRM vault locks out piracy. No agency cuts. Built for independent creators.",
    images: ["https://seccion.ai/assets/seo/og-image.jpg"],
    site: "@steveseccion",
    creator: "@steveseccion",
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
