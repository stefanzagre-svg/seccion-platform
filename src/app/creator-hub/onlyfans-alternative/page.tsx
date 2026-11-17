import type { Metadata } from "next";
import {
  getOnlyFansAlternativeMetadata,
  LocalizedOnlyFansAltView,
} from "@/components/seo/LocalizedOnlyFansAltView";

export const metadata: Metadata = getOnlyFansAlternativeMetadata("en");

export default function OnlyFansAlternativePage() {
  return <LocalizedOnlyFansAltView locale="en" />;
}
