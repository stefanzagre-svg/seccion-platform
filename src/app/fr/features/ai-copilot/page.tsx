import type { Metadata } from "next";
import {
  getPhase2Metadata,
  LocalizedPhase2View,
} from "@/components/seo/LocalizedPhase2Views";

export const metadata: Metadata = getPhase2Metadata("ai-copilot", "fr");

export default function FrAiCopilotPage() {
  return <LocalizedPhase2View routeKey="ai-copilot" locale="fr" />;
}
