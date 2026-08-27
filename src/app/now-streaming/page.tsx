import type { Metadata } from "next";
import ClientPage from "./page-client";

export const metadata: Metadata = {
  title: "Live Streams & VIP Rooms | SECCION",
  description: "Watch live broadcasts, connect in interactive VIP sessions, and engage with verified creators worldwide.",
  openGraph: {
    title: "Live Streams & VIP Rooms | SECCION",
    description: "Watch live broadcasts, connect in interactive VIP sessions, and engage with verified creators worldwide.",
  }
};

export default function Page() {
  return <ClientPage />;
}
