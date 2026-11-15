import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PublicNavbar from "@/components/PublicNavbar";
import PublicFooter from "@/components/PublicFooter";
import {
  getBlogPostBySlug,
  getAllBlogPosts,
} from "@/lib/blog-data";
import { BreadcrumbSchema } from "@/components/seo/JsonLd";
import BlogArticleClient from "./BlogArticleClient";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const posts = getAllBlogPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);

  if (!post) {
    return {
      title: "Article Not Found",
      description: "The requested article could not be found on SECCION. Explore creator payout comparisons, AI Copilot guides, and creator economy insights instead.",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  return {
    title: post.title,
    description: post.description,
    keywords: post.tags,
    authors: [{ name: post.author.name, url: post.author.twitter }],
    alternates: {
      canonical: post.canonical,
    },
    openGraph: {
      title: post.title,
      description: post.description,
      url: post.canonical,
      siteName: "SECCION",
      type: "article",
      publishedTime: post.date,
      modifiedTime: post.lastModified || post.date,
      authors: [post.author.name],
      tags: post.tags,
      images: [
        {
          url: "https://seccion.ai/assets/seo/og-image.jpg",
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
      images: ["https://seccion.ai/assets/seo/og-image.jpg"],
      creator: "@steveseccion",
    },
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const allPosts = getAllBlogPosts();
  const relatedPosts = allPosts.filter((p) => p.slug !== post.slug).slice(0, 2);

  const breadcrumbs = [
    { name: "Home", url: "https://seccion.ai" },
    { name: "Blog", url: "https://seccion.ai/blog" },
    { name: post.title, url: post.canonical },
  ];

  // Schema.org Article / BlogPosting structured data
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": post.title,
    "description": post.description,
    "datePublished": post.date,
    "dateModified": post.lastModified || post.date,
    "author": {
      "@type": "Person",
      "name": post.author.name,
      "jobTitle": post.author.role,
      "url": post.author.twitter || "https://seccion.ai",
    },
    "publisher": {
      "@type": "Organization",
      "name": "SECCION AI CONCEPT S.L.",
      "url": "https://seccion.ai",
      "logo": {
        "@type": "ImageObject",
        "url": "https://seccion.ai/assets/logo/logo-wordmark.png",
      },
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": post.canonical,
    },
    "keywords": post.tags.join(", "),
    "articleSection": post.category,
  };

  return (
    <div
      className="w-full min-h-screen text-[#e2e2e2] overflow-x-hidden font-['Hanken_Grotesk'] relative flex flex-col justify-between"
      style={{
        backgroundColor: "#0A0A0C",
        backgroundImage:
          "radial-gradient(circle at 10% 25%, rgba(0, 251, 251, 0.04), transparent 30%), radial-gradient(circle at 90% 60%, rgba(255, 171, 243, 0.04), transparent 30%)",
      }}
    >
      {/* Background Cyber Grid */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <PublicNavbar />

      {/* JSON-LD Schemas */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <BreadcrumbSchema items={breadcrumbs} />

      <BlogArticleClient post={post} relatedPosts={relatedPosts} />

      <PublicFooter />
    </div>
  );
}
