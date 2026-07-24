import type { Metadata, Viewport } from "next";
import "./globals.css";
import React from "react";

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

export const metadata: Metadata = {
  metadataBase: new URL("https://seccion.ai"),
  title: {
    default: "SECCIØN | Authentic Connections & Content Creators",
    template: "%s | SECCIØN",
  },
  description:
    "1st Fusion Platform combining AI-driven dating matchmaking with live streaming content creators.",
  keywords: [
    "SECCIØN",
    "seccion.ai",
    "social platform",
    "AI matching",
    "authentic connections",
    "relationship app",
    "live streaming",
    "content creator platform",
    "OnlyFans alternative",
  ],
  alternates: {
    canonical: "https://seccion.ai",
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/assets/logo/logo-mark.png", type: "image/png" },
    ],
    shortcut: "/icon.svg",
    apple: "/assets/logo/logo-mark.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "SECCIØN",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    title: "SECCIØN | Authentic Connections & Content Creators",
    description:
      "1st Fusion Platform combining AI-driven dating matchmaking with live streaming content creators.",
    url: "https://seccion.ai",
    siteName: "SECCIØN",
    images: [
      {
        url: "/assets/logo/logo-wordmark.png",
        width: 766,
        height: 191,
        alt: "SECCIØN Logo",
      },
    ],
    locale: "es_CO",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SECCIØN | Authentic Connections & Content Creators",
    description:
      "1st Fusion Platform combining AI-driven dating matchmaking with live streaming content creators.",
    images: ["/assets/logo/logo-wordmark.png"],
  },
};

import Navbar from "@/components/Navbar";
import AmbientBackground from "@/components/AmbientBackground";
import AIWingmanBubble from "@/components/AIWingmanBubble";
import SeccionAgentBubble from "@/components/SeccionAgentBubble";
import ServiceWorkerRegister from "@/components/pwa/ServiceWorkerRegister";
import InAppBrowserDetector from "@/components/pwa/InAppBrowserDetector";
import PWAInstallPrompt from "@/components/pwa/PWAInstallPrompt";
import { LanguageProvider } from "@/context/LanguageContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
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
        <LanguageProvider>
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
          {/* SECCIØN Agent for public/unauthenticated pages */}
          <SeccionAgentBubble />
          {/* AI Dating Wingman Coach for authenticated member accounts */}
          <AIWingmanBubble />
        </LanguageProvider>
      </body>
    </html>
  );
}
