import type { Metadata } from "next";
import ClientPage from "./page-client";

export const metadata: Metadata = {
  title: "Live Streams & VIP Rooms — Real-Time Broadcasts",
  description: "Watch live broadcasts, connect in interactive VIP sessions, and engage with verified creators worldwide in real time with multilingual audio translation.",
  alternates: {
    canonical: "https://seccion.ai/now-streaming",
  },
  openGraph: {
    title: "Live Streams & VIP Rooms | SECCION",
    description: "Watch live broadcasts, connect in interactive VIP sessions, and engage with verified creators worldwide.",
    url: "https://seccion.ai/now-streaming",
    siteName: "SECCION",
    images: [
      {
        url: "https://seccion.ai/assets/seo/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "SECCION Live Streaming and VIP Rooms",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Live Streams & VIP Rooms | SECCION",
    description: "Watch live broadcasts, connect in interactive VIP sessions, and engage with verified creators worldwide.",
    images: ["https://seccion.ai/assets/seo/og-image.jpg"],
  },
};

export default function Page() {
  return <ClientPage />;
}
