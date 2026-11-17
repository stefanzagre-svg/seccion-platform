import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BookOpen } from "lucide-react";
import PublicNavbar from "@/components/PublicNavbar";
import PublicFooter from "@/components/PublicFooter";
import { BreadcrumbSchema } from "@/components/seo/JsonLd";
import LocaleSwitchPills from "@/components/seo/LocaleSwitchPills";
import BlogClient from "@/app/blog/blog-client";
import BlogArticleClient from "@/app/blog/[slug]/BlogArticleClient";
import { getAllBlogPosts, getBlogPostBySlug } from "@/lib/blog-data";
import {
  buildLocaleAlternates,
  fitSeoDescription,
  fitSeoTitle,
  getLocalizedUrl,
  getOpenGraphLocale,
  pickLocalized,
  type SeoLocale,
} from "@/lib/localized-seo";

const BLOG_HUB_COPY: Record<
  SeoLocale,
  {
    title: string;
    description: string;
    ogTitle: string;
    backLabel: string;
    eyebrow: string;
    headingLead: string;
    headingAccentA: string;
    headingJoin: string;
    headingAccentB: string;
    subtitle: string;
    breadcrumbHome: string;
    breadcrumbBlog: string;
  }
> = {
  en: {
    title: "Blog & Insights — Creator Economy, AI Copilot & Warm Paywall",
    description:
      "In-depth research, platform comparisons, and guides on creator platform payouts, 90% revenue economics, AI operations, and chemistry-first monetization.",
    ogTitle: "Blog & Insights — Creator Economy & AI Tools | SECCION",
    backLabel: "Back to Home",
    eyebrow: "SECCION INSIGHTS & ENGINEERING",
    headingLead: "Platform",
    headingAccentA: "Economics",
    headingJoin: "&",
    headingAccentB: "Culture",
    subtitle:
      "Rigorous breakdowns on creator unit economics, AI operations, relationship psychology, and the evolution of the Warm Paywall. Written by founders and operators.",
    breadcrumbHome: "Home",
    breadcrumbBlog: "Blog",
  },
  es: {
    title: "Blog e Ideas — Economía Creador e IA",
    description:
      "Investigación y comparativas sobre pagos al 90%, operaciones con IA, protección DRM y monetización Warm Paywall para creadores en español.",
    ogTitle: "Blog e Ideas — Economía del Creador y Copiloto IA | SECCION",
    backLabel: "Volver al Inicio",
    eyebrow: "ANÁLISIS E INGENIERÍA SECCION",
    headingLead: "Economía",
    headingAccentA: "Creador",
    headingJoin: "y",
    headingAccentB: "Cultura",
    subtitle:
      "Análisis rigurosos sobre pagos netos al 90%, automatización con Copiloto IA, seguridad DRM anti-filtraciones y el modelo Warm Paywall en español.",
    breadcrumbHome: "Inicio",
    breadcrumbBlog: "Blog",
  },
  fr: {
    title: "Blog & Analyses — Économie Créateur et IA",
    description:
      "Analyses et comparatifs sur les revenus à 90 %, l'AI Copilot, la protection DRM anti-fuite et le Warm Paywall pour les créateurs francophones.",
    ogTitle: "Blog & Analyses — Économie Créateur et Outils IA | SECCION",
    backLabel: "Retour à l'Accueil",
    eyebrow: "ANALYSES & INGÉNIERIE SECCION",
    headingLead: "Économie",
    headingAccentA: "Créateur",
    headingJoin: "&",
    headingAccentB: "Culture",
    subtitle:
      "Études détaillées sur le partage de revenus à 90 %, l'automatisation par Copilote IA, la protection DRM anti-fuite et le modèle Warm Paywall.",
    breadcrumbHome: "Accueil",
    breadcrumbBlog: "Blog",
  },
};

export function getBlogHubMetadata(locale: SeoLocale): Metadata {
  const copy = BLOG_HUB_COPY[locale];
  const url = getLocalizedUrl("/blog", locale);
  return {
    title: copy.title,
    description: copy.description,
    keywords: [
      "SECCION blog",
      "creator platform payout comparison 2026",
      "what is a warm paywall",
      "OnlyFans alternative 90% payout",
      "alternativa OnlyFans 90 por ciento",
      "alternative OnlyFans 90 pourcent",
      "AI matchmaking chemistry meter",
    ],
    alternates: buildLocaleAlternates("/blog", locale),
    openGraph: {
      title: copy.ogTitle,
      description: copy.description,
      url,
      siteName: "SECCION",
      locale: getOpenGraphLocale(locale),
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: copy.ogTitle,
      description: copy.description,
    },
  };
}

export function LocalizedBlogHubView({ locale }: { locale: SeoLocale }) {
  const posts = getAllBlogPosts();
  const copy = BLOG_HUB_COPY[locale];

  const breadcrumbs = [
    { name: copy.breadcrumbHome, url: "https://seccion.ai" },
    { name: copy.breadcrumbBlog, url: getLocalizedUrl("/blog", locale) },
  ];

  return (
    <div
      className="w-full min-h-screen text-[#e2e2e2] overflow-x-hidden font-['Hanken_Grotesk'] relative flex flex-col justify-between"
      style={{
        backgroundColor: "#0A0A0C",
        backgroundImage:
          "radial-gradient(circle at 15% 30%, rgba(0, 251, 251, 0.04), transparent 30%), radial-gradient(circle at 85% 60%, rgba(255, 171, 243, 0.04), transparent 30%)",
      }}
    >
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

      <main className="relative z-10 pt-36 px-4 sm:px-6 md:px-12 lg:px-20 max-w-7xl mx-auto w-full space-y-12 mb-24">
        <BreadcrumbSchema items={breadcrumbs} />

        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-mono font-bold text-white/40 hover:text-[#00fbfb] transition group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>{copy.backLabel}</span>
          </Link>
          <LocaleSwitchPills basePath="/blog" currentLocale={locale} />
        </div>

        <div className="space-y-4 text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00fbfb]/5 border border-[#00fbfb]/25 font-mono text-[10px] font-bold text-[#00fbfb] uppercase tracking-wider">
            <BookOpen className="w-3.5 h-3.5" />
            <span>{copy.eyebrow}</span>
          </div>

          <h1 className="font-['Outfit'] text-4xl sm:text-6xl font-black text-white leading-none tracking-tight uppercase">
            {copy.headingLead}{" "}
            <span className="text-[#00fbfb]">{copy.headingAccentA}</span>{" "}
            {copy.headingJoin}{" "}
            <span className="text-[#ffabf3]">{copy.headingAccentB}</span>
          </h1>

          <p className="text-sm sm:text-base text-[#b9cac9] max-w-2xl leading-relaxed">
            {copy.subtitle}
          </p>
        </div>

        <BlogClient posts={posts} forcedLocale={locale} />
      </main>

      <PublicFooter />
    </div>
  );
}

export function getBlogPostMetadata(slug: string, locale: SeoLocale): Metadata {
  const post = getBlogPostBySlug(slug);
  if (!post) {
    return {
      title: "Article Not Found",
      description:
        "The requested article could not be found on SECCION. Explore creator payout comparisons, AI Copilot guides, and creator economy insights instead.",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const rawTitle = pickLocalized(
    locale,
    post.metaTitle || post.title,
    post.metaTitleEs || post.titleEs,
    post.metaTitleFr || post.titleFr
  );
  const seoTitle = fitSeoTitle(rawTitle);

  const rawDescription = pickLocalized(
    locale,
    post.description,
    post.metaDescriptionEs || post.descriptionEs,
    post.metaDescriptionFr || post.descriptionFr
  );
  const seoDescription = fitSeoDescription(rawDescription);

  const displayTitle = pickLocalized(locale, post.title, post.titleEs, post.titleFr);
  const url = getLocalizedUrl(`/blog/${post.slug}`, locale);
  const imageUrl = post.coverImage
    ? `https://seccion.ai${post.coverImage}`
    : "https://seccion.ai/assets/seo/og-image.jpg";

  return {
    title: seoTitle,
    description: seoDescription,
    keywords: post.tags,
    authors: [{ name: post.author.name, url: post.author.twitter }],
    alternates: buildLocaleAlternates(`/blog/${post.slug}`, locale),
    openGraph: {
      title: displayTitle,
      description: seoDescription,
      url,
      siteName: "SECCION",
      locale: getOpenGraphLocale(locale),
      type: "article",
      publishedTime: post.date,
      modifiedTime: post.lastModified || post.date,
      authors: [post.author.name],
      tags: post.tags,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: post.coverImage ? 675 : 630,
          alt: displayTitle,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: displayTitle,
      description: seoDescription,
      images: [imageUrl],
      creator: "@steveseccion",
    },
  };
}

export function LocalizedBlogPostView({
  slug,
  locale,
}: {
  slug: string;
  locale: SeoLocale;
}) {
  const post = getBlogPostBySlug(slug);
  if (!post) {
    notFound();
  }

  const allPosts = getAllBlogPosts();
  const relatedPosts = allPosts.filter((p) => p.slug !== post.slug).slice(0, 2);

  const localizedTitle = pickLocalized(locale, post.title, post.titleEs, post.titleFr);
  const localizedDescription = pickLocalized(
    locale,
    post.description,
    post.descriptionEs,
    post.descriptionFr
  );
  const pageUrl = getLocalizedUrl(`/blog/${post.slug}`, locale);

  const breadcrumbs = [
    {
      name: locale === "fr" ? "Accueil" : locale === "es" ? "Inicio" : "Home",
      url: "https://seccion.ai",
    },
    { name: "Blog", url: getLocalizedUrl("/blog", locale) },
    { name: localizedTitle, url: pageUrl },
  ];

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    inLanguage: locale,
    headline: localizedTitle,
    description: localizedDescription,
    datePublished: post.date,
    dateModified: post.lastModified || post.date,
    author: {
      "@type": "Person",
      name: post.author.name,
      jobTitle: post.author.role,
      url: post.author.twitter || "https://seccion.ai",
    },
    publisher: {
      "@type": "Organization",
      name: "SECCION AI CONCEPT S.L.",
      url: "https://seccion.ai",
      logo: {
        "@type": "ImageObject",
        url: "https://seccion.ai/assets/logo/logo-wordmark.png",
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": pageUrl,
    },
    keywords: post.tags.join(", "),
    articleSection: post.category,
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

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <BreadcrumbSchema items={breadcrumbs} />

      <BlogArticleClient
        post={post}
        relatedPosts={relatedPosts}
        forcedLocale={locale}
      />

      <PublicFooter />
    </div>
  );
}
