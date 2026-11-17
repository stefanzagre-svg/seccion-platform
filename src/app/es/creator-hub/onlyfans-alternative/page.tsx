import type { Metadata } from "next";
import {
  getOnlyFansAlternativeMetadata,
  LocalizedOnlyFansAltView,
} from "@/components/seo/LocalizedOnlyFansAltView";

export const metadata: Metadata = getOnlyFansAlternativeMetadata("es");

export default function EsOnlyFansAlternativePage() {
  return <LocalizedOnlyFansAltView locale="es" />;
}
