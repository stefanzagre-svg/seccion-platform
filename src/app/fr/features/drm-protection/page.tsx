import type { Metadata } from "next";
import {
  getPhase2Metadata,
  LocalizedPhase2View,
} from "@/components/seo/LocalizedPhase2Views";

export const metadata: Metadata = getPhase2Metadata("drm-protection", "fr");

export default function FrDrmProtectionPage() {
  return <LocalizedPhase2View routeKey="drm-protection" locale="fr" />;
}
