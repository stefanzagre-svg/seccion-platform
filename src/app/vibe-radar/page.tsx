import type { Metadata } from "next";
import ClientPage from "./page-client";

export const metadata: Metadata = {
  title: "Vibe Radar — Real-Time Discovery | SECCION",
  description: "Explore creators, active live sessions, and compatible dating connections in real time on SECCION Vibe Radar.",
  alternates: {
    canonical: "https://seccion.ai/vibe-radar",
  },
  openGraph: {
    title: "Vibe Radar — Real-Time Discovery | SECCION",
    description: "Explore creators, active live sessions, and compatible dating connections in real time on SECCION Vibe Radar.",
    url: "https://seccion.ai/vibe-radar",
  }
};

export default function Page() {
  return <ClientPage />;
}
