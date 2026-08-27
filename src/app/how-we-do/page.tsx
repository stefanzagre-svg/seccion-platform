import type { Metadata } from "next";
import ClientPage from "./page-client";

export const metadata: Metadata = {
  title: "How SECCION Works — AI Matchmaking & Creator Economy",
  description: "Discover how SECCION blends zero-knowledge AI matchmaking with high-yield creator live streaming.",
  openGraph: {
    title: "How SECCION Works — AI Matchmaking & Creator Economy",
    description: "Discover how SECCION blends zero-knowledge AI matchmaking with high-yield creator live streaming.",
  }
};

export default function Page() {
  return <ClientPage />;
}
