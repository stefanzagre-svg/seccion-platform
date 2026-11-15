import type { Metadata } from "next";
import ClientPage from "./page-client";

export const metadata: Metadata = {
  title: "Early Access — Founding Members & Priority Invites",
  description: "Join the SECCION Founding Members waitlist for priority access to AI-assisted real connection discovery, VIP live rooms, and direct creator support.",
  alternates: {
    canonical: "https://seccion.ai/early-access",
  },
  openGraph: {
    title: "Early Access — Founding Members & Priority Invites | SECCION",
    description: "Join the SECCION Founding Members waitlist for priority access to AI-assisted real connection discovery, VIP live rooms, and direct creator support.",
    url: "https://seccion.ai/early-access",
  }
};

export default function Page() {
  return <ClientPage />;
}
