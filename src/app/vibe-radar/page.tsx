import type { Metadata } from "next";
import ClientPage from "./page-client";

export const metadata: Metadata = {
  title: "Vibe Radar — Real-Time Creator Discovery & Live Streams",
  description: "Explore verified creators, active live streams, and high-chemistry community connections in real time across interests and cities on SECCION Vibe Radar.",
  alternates: {
    canonical: "https://seccion.ai/vibe-radar",
  },
  openGraph: {
    title: "Vibe Radar — Real-Time Creator Discovery & Live Streams | SECCION",
    description: "Explore verified creators, active live streams, and high-chemistry community connections in real time across interests and cities on SECCION Vibe Radar.",
    url: "https://seccion.ai/vibe-radar",
  }
};

export default function Page() {
  return <ClientPage />;
}
