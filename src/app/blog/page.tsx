import type { Metadata } from "next";
import PublicNavbar from "@/components/PublicNavbar";
import PublicFooter from "@/components/PublicFooter";
import BlogClient from "./blog-client";
import { getAllBlogPosts } from "@/lib/blog-data";
import { BreadcrumbSchema } from "@/components/seo/JsonLd";
import Link from "next/link";
import { ArrowLeft, Sparkles, BookOpen } from "lucide-react";

export const metadata: Metadata = {
  title: "SECCION Blog & Insights | Creator Economy, AI Tools & Warm Paywall",
  description: "In-depth research, platform comparisons, and guides on creator platform payouts, 90% revenue economics, AI operations, and chemistry-first monetization.",
  keywords: [
    "SECCION blog",
    "creator platform payout comparison 2026",
    "what is a warm paywall",
    "OnlyFans alternative 90% payout",
    "creator economy unit economics",
    "AI dating chemistry meter",
    "creator tax and legal tools"
  ],
  alternates: {
    canonical: "https://seccion.ai/blog"
  },
  openGraph: {
    title: "SECCION Blog & Insights | Creator Economy, AI Tools & Warm Paywall",
    description: "In-depth research and platform economics: 90% creator splits, AI copilot, and chemistry-first Warm Paywalls.",
    url: "https://seccion.ai/blog",
    siteName: "SECCION",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "SECCION Blog & Insights | Creator Economy, AI Tools & Warm Paywall",
    description: "In-depth research and platform economics: 90% creator splits, AI copilot, and chemistry-first Warm Paywalls."
  }
};

export default function BlogHubPage() {
  const posts = getAllBlogPosts();

  const breadcrumbs = [
    { name: "Home", url: "https://seccion.ai" },
    { name: "Blog", url: "https://seccion.ai/blog" }
  ];

  return (
    <div
      className="w-full min-h-screen text-[#e2e2e2] overflow-x-hidden font-['Hanken_Grotesk'] relative flex flex-col justify-between"
      style={{
        backgroundColor: "#0A0A0C",
        backgroundImage:
          "radial-gradient(circle at 15% 30%, rgba(0, 251, 251, 0.04), transparent 30%), radial-gradient(circle at 85% 60%, rgba(255, 171, 243, 0.04), transparent 30%)"
      }}
    >
      {/* Background Cyber Grid */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
            backgroundSize: "40px 40px"
          }}
        />
      </div>

      <PublicNavbar />

      <main className="relative z-10 pt-36 px-4 sm:px-6 md:px-12 lg:px-20 max-w-7xl mx-auto w-full space-y-12 mb-24">
        {/* Breadcrumb Schema */}
        <BreadcrumbSchema items={breadcrumbs} />

        {/* Back Link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-mono font-bold text-white/40 hover:text-[#00fbfb] transition group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Home</span>
        </Link>

        {/* Hero Banner */}
        <div className="space-y-4 text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00fbfb]/5 border border-[#00fbfb]/25 font-mono text-[10px] font-bold text-[#00fbfb] uppercase tracking-wider">
            <BookOpen className="w-3.5 h-3.5" />
            <span>SECCION INSIGHTS & ENGINEERING</span>
          </div>

          <h1 className="font-['Outfit'] text-4xl sm:text-6xl font-black text-white leading-none tracking-tight uppercase">
            Platform <span className="text-[#00fbfb]">Economics</span> &amp; <span className="text-[#ffabf3]">Culture</span>
          </h1>

          <p className="text-sm sm:text-base text-[#b9cac9] max-w-2xl leading-relaxed">
            Rigorous breakdowns on creator unit economics, AI operations, relationship psychology, and the evolution of the Warm Paywall. Written by founders and operators.
          </p>
        </div>

        {/* Client Interactive Filter & Grid */}
        <BlogClient posts={posts} />
      </main>

      <PublicFooter />
    </div>
  );
}