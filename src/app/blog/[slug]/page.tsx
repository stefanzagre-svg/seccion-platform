import type { Metadata } from "next";
import { getAllBlogPosts } from "@/lib/blog-data";
import {
  getBlogPostMetadata,
  LocalizedBlogPostView,
} from "@/components/seo/LocalizedBlogViews";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllBlogPosts().map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  return getBlogPostMetadata(slug, "en");
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  return <LocalizedBlogPostView slug={slug} locale="en" />;
}
