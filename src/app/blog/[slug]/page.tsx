import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import PublicNavbar from "@/components/PublicNavbar";
import PublicFooter from "@/components/PublicFooter";
import { 
  getBlogPostBySlug, 
  getAllBlogPosts, 
  BlogPost 
} from "@/lib/blog-data";
import { BreadcrumbSchema } from "@/components/seo/JsonLd";
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  User, 
  Share2, 
  CheckCircle2, 
  Sparkles, 
  Tag, 
  Coins, 
  ArrowRight, 
  ShieldCheck, 
  BookOpen 
} from "lucide-react";

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
      title: "Article Not Found | SECCION Blog",
      description: "The requested article does not exist on SECCION.",
    };
  }

  return {
    title: `${post.title} | SECCION Insights`,
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

      <main className="relative z-10 pt-36 px-4 sm:px-6 md:px-12 lg:px-20 max-w-5xl mx-auto w-full space-y-12 mb-24">
        {/* Back navigation */}
        <div className="flex items-center justify-between">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-xs font-mono font-bold text-white/40 hover:text-[#00fbfb] transition group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Back to All Articles</span>
          </Link>

          <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 font-mono text-[10px] font-bold uppercase tracking-wider text-[#00fbfb]">
            {post.category}
          </span>
        </div>

        {/* Article Header */}
        <header className="space-y-6 text-left">
          <h1 className="font-['Outfit'] text-3xl sm:text-5xl md:text-6xl font-black text-white leading-tight tracking-tight uppercase">
            {post.title}
          </h1>

          <p className="text-base sm:text-xl text-[#b9cac9] leading-relaxed">
            {post.description}
          </p>

          {/* Author & Meta Row */}
          <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#00fbfb]/10 border border-[#00fbfb]/30 flex items-center justify-center overflow-hidden">
                <img
                  src={post.author.avatar}
                  alt={post.author.name}
                  className="w-6 h-6 object-contain drop-shadow-[0_0_8px_rgba(0,251,251,0.5)]"
                />
              </div>
              <div>
                <div className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                  <span>{post.author.name}</span>
                  {post.author.twitter && (
                    <a
                      href={post.author.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] font-mono text-[#00fbfb] hover:underline"
                    >
                      @steveseccion
                    </a>
                  )}
                </div>
                <div className="text-[11px] font-mono text-white/40">
                  {post.author.role}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs font-mono text-white/50">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                <span>{post.date}</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>{post.readTime}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Executive Summary Box (Double-Bezel Card) */}
        {post.summaryPoints && post.summaryPoints.length > 0 && (
          <div className="rounded-[2.5rem] p-1 bg-white/[0.04] border border-[#00fbfb]/30 shadow-[0_24px_48px_-12px_rgba(0,0,0,0.6)] backdrop-blur-xl relative">
            <div className="rounded-[calc(2.5rem-0.25rem)] bg-[#0F0F1A]/95 p-6 sm:p-8 border border-white/5 space-y-4 text-left">
              <div className="flex items-center gap-2 text-[#00fbfb] font-mono text-xs font-bold uppercase tracking-widest">
                <Sparkles className="w-4 h-4" />
                <span>Executive Summary & Key Takeaways</span>
              </div>
              <ul className="space-y-2.5 text-xs sm:text-sm text-white/80">
                {post.summaryPoints.map((pt, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-[#39FF14] shrink-0 mt-0.5" />
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Article Body */}
        <article className="prose prose-invert prose-cyan max-w-none text-[#b9cac9] text-sm sm:text-base leading-relaxed space-y-6 [&_h2]:font-['Outfit'] [&_h2]:text-2xl [&_h2]:sm:text-3xl [&_h2]:font-black [&_h2]:text-white [&_h2]:uppercase [&_h2]:tracking-tight [&_h2]:mt-10 [&_h2]:mb-4 [&_h3]:font-['Outfit'] [&_h3]:text-lg [&_h3]:sm:text-xl [&_h3]:font-bold [&_h3]:text-white [&_h3]:mt-6 [&_h3]:mb-3 [&_p]:leading-relaxed [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:space-y-2 [&_strong]:text-white">
          <div dangerouslySetInnerHTML={{ __html: post.contentHtml }} />
        </article>

        {/* Tags & Share */}
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-xs font-mono text-white/40 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5" />
              Tags:
            </span>
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 rounded-full bg-white/5 border border-white/10 font-mono text-[11px] text-white/70"
              >
                #{tag}
              </span>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-white/40">Canonical URL:</span>
            <span className="text-xs font-mono text-[#00fbfb] select-all bg-white/5 px-2.5 py-1 rounded-md border border-white/10">
              {post.canonical}
            </span>
          </div>
        </div>

        {/* Creator CTA Box */}
        <div className="rounded-[2.5rem] p-1 bg-gradient-to-r from-[#00fbfb]/30 via-white/10 to-[#ffabf3]/30 border border-white/10 shadow-2xl">
          <div className="rounded-[calc(2.5rem-0.25rem)] bg-[#0C0C14] p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6 text-left">
            <div className="space-y-2 max-w-xl">
              <span className="font-mono text-xs font-bold text-[#39FF14] uppercase tracking-wider">
                FOUNDING CREATOR PASS
              </span>
              <h3 className="font-['Outfit'] text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
                Claim Your 90% Net Payout + 1-Yr Free AI Copilot
              </h3>
              <p className="text-xs sm:text-sm text-[#b9cac9] leading-relaxed">
                Join the first 500 founding creators on SECCION. Protect your likeness, automate chat operations, and retain 90% of your earnings.
              </p>
            </div>
            <Link
              href="/become-creator"
              className="px-8 py-3.5 rounded-full bg-[#00fbfb] text-black font-mono text-xs font-black uppercase tracking-wider hover:shadow-[0_0_20px_rgba(0,251,251,0.5)] transition active:scale-[0.98] shrink-0"
            >
              Apply as Creator →
            </Link>
          </div>
        </div>

        {/* Related Articles Section */}
        {relatedPosts.length > 0 && (
          <div className="space-y-6 pt-6">
            <h3 className="font-['Outfit'] text-xl font-bold text-white uppercase tracking-wider">
              Related Research &amp; Guides
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {relatedPosts.map((rel) => (
                <Link
                  key={rel.slug}
                  href={`/blog/${rel.slug}`}
                  className="p-6 rounded-3xl bg-[#0F0F1A]/80 border border-white/10 hover:border-[#00fbfb]/50 transition group block space-y-3 text-left"
                >
                  <span className="font-mono text-[10px] text-[#00fbfb] font-bold uppercase tracking-wider">
                    {rel.category}
                  </span>
                  <h4 className="font-['Outfit'] text-lg font-bold text-white group-hover:text-[#00fbfb] transition-colors leading-snug">
                    {rel.title}
                  </h4>
                  <p className="text-xs text-white/60 line-clamp-2">
                    {rel.description}
                  </p>
                  <div className="inline-flex items-center gap-1.5 font-mono text-xs text-[#00fbfb] pt-1">
                    <span>Read Guide</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>

      <PublicFooter />
    </div>
  );
}