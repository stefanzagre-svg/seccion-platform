import type { Metadata } from "next";
import {
  getBlogHubMetadata,
  LocalizedBlogHubView,
} from "@/components/seo/LocalizedBlogViews";

export const metadata: Metadata = getBlogHubMetadata("es");

export default function EsBlogHubPage() {
  return <LocalizedBlogHubView locale="es" />;
}
