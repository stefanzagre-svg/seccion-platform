import type { Metadata } from "next";
import {
  getBlogHubMetadata,
  LocalizedBlogHubView,
} from "@/components/seo/LocalizedBlogViews";

export const metadata: Metadata = getBlogHubMetadata("fr");

export default function FrBlogHubPage() {
  return <LocalizedBlogHubView locale="fr" />;
}
