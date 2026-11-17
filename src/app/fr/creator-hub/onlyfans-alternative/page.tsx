import type { Metadata } from "next";
import {
  getOnlyFansAlternativeMetadata,
  LocalizedOnlyFansAltView,
} from "@/components/seo/LocalizedOnlyFansAltView";

export const metadata: Metadata = getOnlyFansAlternativeMetadata("fr");

export default function FrOnlyFansAlternativePage() {
  return <LocalizedOnlyFansAltView locale="fr" />;
}
