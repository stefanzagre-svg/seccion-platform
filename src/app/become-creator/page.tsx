import type { Metadata } from "next";
import ClientPage from "./page-client";

export const metadata: Metadata = {
  title: "Become a Creator — 90% Revenue Split & AI Studio | SECCION",
  description: "Join SECCION as a Founding Creator. Enjoy a 90% net revenue split, AI Operations Assistant, and global reach.",
  openGraph: {
    title: "Become a Creator — 90% Revenue Split & AI Studio | SECCION",
    description: "Join SECCION as a Founding Creator. Enjoy a 90% net revenue split, AI Operations Assistant, and global reach.",
  }
};

export default function Page() {
  return <ClientPage />;
}
