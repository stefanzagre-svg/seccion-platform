import type { Metadata } from "next";
import {
  getPhase2Metadata,
  LocalizedPhase2View,
} from "@/components/seo/LocalizedPhase2Views";

export async function generateMetadata(): Promise<Metadata> {
  return getPhase2Metadata("ai-copilot", "en");
}

export default function Page() {
  return <LocalizedPhase2View routeKey="ai-copilot" locale="en" />;
}
