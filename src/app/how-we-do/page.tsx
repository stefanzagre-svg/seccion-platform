import type { Metadata } from "next";
import ClientPage from "./page-client";

export const metadata: Metadata = {
  title: "How SECCION Works — AI Matchmaking & Creator Economy",
  description: "Discover how SECCION blends AI-assisted compatibility matching, Warm Paywall discovery, zero-knowledge Face Blur privacy, and high-yield creator live rooms.",
  alternates: {
    canonical: "https://seccion.ai/how-we-do",
  },
  openGraph: {
    title: "How SECCION Works — AI Matchmaking & Creator Economy",
    description: "Discover how SECCION blends AI-assisted compatibility matching, Warm Paywall discovery, zero-knowledge Face Blur privacy, and high-yield creator live rooms.",
    url: "https://seccion.ai/how-we-do",
  }
};

export default function Page() {
  return <ClientPage />;
}
