import type { Metadata } from "next";
import {
  getPhase2Metadata,
  LocalizedPhase2View,
} from "@/components/seo/LocalizedPhase2Views";

export const metadata: Metadata = getPhase2Metadata("how-we-do", "en");

export default function Page() {
  return <LocalizedPhase2View routeKey="how-we-do" locale="en" />;
}
