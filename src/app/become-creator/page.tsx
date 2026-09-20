import type { Metadata } from "next";
import ClientPage from "./page-client";

export const metadata: Metadata = {
  title: "Become a Creator — 90% Revenue Split & AI Studio | SECCION",
  description: "Join SECCION as a Founding Creator. Enjoy a 90% net revenue split, AI Operations Assistant, and global reach.",
  alternates: {
    canonical: "https://seccion.ai/become-creator",
  },
  openGraph: {
    title: "Become a Creator — 90% Revenue Split & AI Studio | SECCION",
    description: "Join SECCION as a Founding Creator. Enjoy a 90% net revenue split, AI Operations Assistant, and global reach.",
    url: "https://seccion.ai/become-creator",
  },
  twitter: {
    card: "summary_large_image",
    title: "SECCION.ai | The 90% Payout Platform for Digital Creators",
    description: "Join SECCION as a Founding Creator. Keep 90% net revenue, AI Studio Copilot, and live global streaming.",
    images: ["https://seccion.ai/assets/seo/og-image.jpg"],
    creator: "@steveseccion",
  }
};

export default function Page() {
  return <ClientPage />;
}
