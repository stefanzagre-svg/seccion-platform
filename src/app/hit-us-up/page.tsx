import type { Metadata } from "next";
import ClientPage from "./page-client";

export const metadata: Metadata = {
  title: "Contact Us | SECCION",
  description: "Get in touch with the SECCION team. We are here to support creators and members.",
  alternates: {
    canonical: "https://seccion.ai/hit-us-up",
  },
  openGraph: {
    title: "Contact Us | SECCION",
    description: "Get in touch with the SECCION team. We are here to support creators and members.",
    url: "https://seccion.ai/hit-us-up",
  }
};

export default function Page() {
  return <ClientPage />;
}
