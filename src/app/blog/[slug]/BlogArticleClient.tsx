"use client";

import React from "react";
import Link from "next/link";
import { BlogPost } from "@/lib/blog-data";
import { useTranslation } from "@/context/LanguageContext";
import { getLocalizedPath, pickLocalized, type SeoLocale } from "@/lib/localized-seo";
import LocaleSwitchPills from "@/components/seo/LocaleSwitchPills";
import {
  ArrowLeft,
  Calendar,
  Clock,
  CheckCircle2,
  Sparkles,
  Tag,
  ArrowRight,
} from "lucide-react";

interface BlogArticleClientProps {
  post: BlogPost;
  relatedPosts: BlogPost[];
  forcedLocale?: SeoLocale;
}

export default function BlogArticleClient({
  post,
  relatedPosts,
  forcedLocale,
}: BlogArticleClientProps) {
  const { locale: contextLocale } = useTranslation();
  const locale = forcedLocale ?? contextLocale;
  const isFr = locale === "fr";
  const isEs = locale === "es";

  const title = pickLocalized(locale, post.title, post.titleEs, post.titleFr);
  const description = pickLocalized(
    locale,
    post.description,
    post.descriptionEs,
    post.descriptionFr
  );
  const readTime = pickLocalized(
    locale,
    post.readTime,
    post.readTimeEs,
    post.readTimeFr
  );
  const summaryPoints = pickLocalized(
    locale,
    post.summaryPoints,
    post.summaryPointsEs,
    post.summaryPointsFr
  );
  const contentHtml = pickLocalized(
    locale,
    post.contentHtml,
    post.contentHtmlEs,
    post.contentHtmlFr
  );

  return (
    <main className="relative z-10 pt-36 px-4 sm:px-6 md:px-12 lg:px-20 max-w-5xl mx-auto w-full space-y-12 mb-24">
      {/* Back navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href={getLocalizedPath("/blog", locale)}
          className="inline-flex items-center gap-2 text-xs font-mono font-bold text-white/40 hover:text-[#00fbfb] transition group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>
            {isFr
              ? "Retour aux Articles"
              : isEs
              ? "Volver a Todos los Artículos"
              : "Back to All Articles"}
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <LocaleSwitchPills basePath={`/blog/${post.slug}`} currentLocale={locale} />
          <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 font-mono text-[10px] font-bold uppercase tracking-wider text-[#00fbfb]">
            {post.category}
          </span>
        </div>
      </div>

      {/* Article Header */}
      <header className="space-y-6 text-left">
        <h1 className="font-['Outfit'] text-3xl sm:text-5xl md:text-6xl font-black text-white leading-tight tracking-tight uppercase">
          {title}
        </h1>

        <p className="text-base sm:text-xl text-[#b9cac9] leading-relaxed">
          {description}
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
              <span>{readTime}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Executive Summary Box (Double-Bezel Card) */}
      {summaryPoints && summaryPoints.length > 0 && (
        <div className="rounded-[2.5rem] p-1 bg-white/[0.04] border border-[#00fbfb]/30 shadow-[0_24px_48px_-12px_rgba(0,0,0,0.6)] backdrop-blur-xl relative">
          <div className="rounded-[calc(2.5rem-0.25rem)] bg-[#0F0F1A]/95 p-6 sm:p-8 border border-white/5 space-y-4 text-left">
            <div className="flex items-center gap-2 text-[#00fbfb] font-mono text-xs font-bold uppercase tracking-widest">
              <Sparkles className="w-4 h-4" />
              <span>
                {isFr
                  ? "Résumé Exécutif & Points Clés"
                  : isEs
                  ? "Resumen Ejecutivo y Puntos Clave"
                  : "Executive Summary & Key Takeaways"}
              </span>
            </div>
            <ul className="space-y-2.5 text-xs sm:text-sm text-white/80">
              {summaryPoints.map((pt, i) => (
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
        <div dangerouslySetInnerHTML={{ __html: contentHtml }} />
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
              {isFr
                ? "PASS CRÉATEUR FONDATEUR"
                : isEs
                ? "PASE CREADOR FUNDADOR"
                : "FOUNDING CREATOR PASS"}
            </span>
            <h3 className="font-['Outfit'] text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
              {isFr
                ? "Réclamez 90 % de Revenus Nets + 1 An d'AI Copilot Offert"
                : isEs
                ? "Asegura tu 90% Neto + 1 Año de AI Copilot Gratis"
                : "Claim Your 90% Net Payout + 1-Yr Free AI Copilot"}
            </h3>
            <p className="text-xs sm:text-sm text-[#b9cac9] leading-relaxed">
              {isFr
                ? "Rejoignez les 500 premiers Créateurs Fondateurs sur SECCION. Protégez votre image avec le DRM, automatisez vos DM en gardant votre voix et conservez 90 % de vos gains."
                : isEs
                ? "Únete a los primeros 500 Creadores Fundadores en SECCION. Protege tu contenido con DRM, automatiza tus DM con tu propia voz y quédate con el 90% de tus ingresos."
                : "Join the first 500 founding creators on SECCION. Protect your likeness, automate chat operations, and retain 90% of your earnings."}
            </p>
          </div>
          <Link
            href="/become-creator#apply"
            className="px-8 py-3.5 rounded-full bg-[#00fbfb] text-black font-mono text-xs font-black uppercase tracking-wider hover:shadow-[0_0_20px_rgba(0,251,251,0.5)] transition active:scale-[0.98] shrink-0"
          >
            {isFr
              ? "Postuler comme Creator →"
              : isEs
              ? "Aplicar como Creator →"
              : "Apply as Creator →"}
          </Link>
        </div>
      </div>

      {/* Related Articles Section */}
      {relatedPosts.length > 0 && (
        <div className="space-y-6 pt-6">
          <h3 className="font-['Outfit'] text-xl font-bold text-white uppercase tracking-wider">
            {isFr
              ? "Analyses & Guides Associés"
              : isEs
              ? "Análisis y Guías Relacionadas"
              : "Related Research & Guides"}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {relatedPosts.map((rel) => {
              const relTitle = pickLocalized(
                locale,
                rel.title,
                rel.titleEs,
                rel.titleFr
              );
              const relDesc = pickLocalized(
                locale,
                rel.description,
                rel.descriptionEs,
                rel.descriptionFr
              );
              return (
                <Link
                  key={rel.slug}
                  href={getLocalizedPath(`/blog/${rel.slug}`, locale)}
                  className="p-6 rounded-3xl bg-[#0F0F1A]/80 border border-white/10 hover:border-[#00fbfb]/50 transition group block space-y-3 text-left"
                >
                  <span className="font-mono text-[10px] text-[#00fbfb] font-bold uppercase tracking-wider">
                    {rel.category}
                  </span>
                  <h4 className="font-['Outfit'] text-lg font-bold text-white group-hover:text-[#00fbfb] transition-colors leading-snug">
                    {relTitle}
                  </h4>
                  <p className="text-xs text-white/60 line-clamp-2">{relDesc}</p>
                  <div className="inline-flex items-center gap-1.5 font-mono text-xs text-[#00fbfb] pt-1">
                    <span>
                      {isFr
                        ? "Lire le Guide"
                        : isEs
                        ? "Leer Guía"
                        : "Read Guide"}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </main>
  );
}
