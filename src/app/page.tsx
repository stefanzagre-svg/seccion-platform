import type { Metadata } from "next";
import ClientPage from "./page-client";

export const metadata: Metadata = {
  title: "SECCION.ai | 1st AI Dating & Creator Live Streaming Hybrid Platform",
  description: "SECCION (seccion.ai) is the first AI-driven dating matchmaking and live streaming creator hybrid platform. 90% creator revenue split, 8-level chemistry meter, and real-life vibe synergy.",
  alternates: {
    canonical: "https://seccion.ai/",
  },
  openGraph: {
    title: "SECCION.ai | 1st AI Dating & Creator Live Streaming Hybrid Platform",
    description: "SECCION (seccion.ai) is the first AI-driven dating matchmaking and live streaming creator hybrid platform.",
    url: "https://seccion.ai",
  }
};

export default function Page() {
  return <ClientPage />;
}
