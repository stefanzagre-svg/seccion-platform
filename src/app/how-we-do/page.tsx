import type { Metadata } from "next";
import ClientPage from "./page-client";

export const metadata: Metadata = {
  title: "How SECCION Works — AI Matchmaking & Creator Economy",
  description: "Discover how SECCION blends zero-knowledge AI matchmaking with high-yield creator live streaming.",
  alternates: {
    canonical: "https://seccion.ai/how-we-do",
  },
  openGraph: {
    title: "How SECCION Works — AI Matchmaking & Creator Economy",
    description: "Discover how SECCION blends zero-knowledge AI matchmaking with high-yield creator live streaming.",
    url: "https://seccion.ai/how-we-do",
  }
};

export default function Page() {
  return <ClientPage />;
}
