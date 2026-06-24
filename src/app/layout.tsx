import type { Metadata } from "next";
import "./globals.css";
import React from "react";

const plusJakartaSans = { variable: "font-plus-jakarta-sans-fallback" };
const hankenGrotesk = { variable: "font-hanken-grotesk-fallback" };
const jetBrainsMono = { variable: "font-jetbrains-mono-fallback" };

export const metadata: Metadata = {
  title: "Session | Authentic Connections",
  description:
    "1st Fusion Platform Dating App - Live Streaming Content Creators",
  keywords: ["social platform", "AI matching", "authentic connections", "relationship app", "live streaming"],
  openGraph: {
    title: "Session | Authentic Connections",
    description: "1st Fusion Platform Dating App - Live Streaming Content Creators",
    type: "website",
  },
};

import Navbar from "@/components/Navbar";
import AmbientBackground from "@/components/AmbientBackground";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
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
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans relative overflow-x-hidden">
        {/* Global ambient atmosphere — matches the landing page hook */}
        <AmbientBackground />
        <Navbar />
        <div className="relative z-10 flex-1 flex flex-col">
          {children}
        </div>
      </body>
    </html>
  );
}
