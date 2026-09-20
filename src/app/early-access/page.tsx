import type { Metadata } from "next";
import ClientPage from "./page-client";

export const metadata: Metadata = {
  title: "Early Access — Founding Members | SECCION",
  description: "Join the SECCION Founding Members waitlist. Get early access to AI-powered dating and creator discovery.",
  alternates: {
    canonical: "https://seccion.ai/early-access",
  },
  openGraph: {
    title: "Early Access — Founding Members | SECCION",
    description: "Join the SECCION Founding Members waitlist. Get early access to AI-powered dating and creator discovery.",
    url: "https://seccion.ai/early-access",
  }
};

export default function Page() {
  return <ClientPage />;
}
