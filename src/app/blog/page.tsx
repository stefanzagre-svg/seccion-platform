import type { Metadata } from "next";
import {
  getBlogHubMetadata,
  LocalizedBlogHubView,
} from "@/components/seo/LocalizedBlogViews";

export const metadata: Metadata = getBlogHubMetadata("en");

export default function BlogHubPage() {
  return <LocalizedBlogHubView locale="en" />;
}
