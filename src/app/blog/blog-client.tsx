"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { 
  BlogPost, 
  BlogCategory, 
  BLOG_CATEGORIES 
} from "@/lib/blog-data";
import { useTranslation } from "@/context/LanguageContext";
import { 
  Search, 
  Tag, 
  Calendar, 
  Clock, 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  Coins, 
  Bot, 
  Flame, 
  SlidersHorizontal 
} from "lucide-react";

interface BlogClientProps {
  posts: BlogPost[];
}

export default function BlogClient({ posts }: BlogClientProps) {
  const { locale } = useTranslation();
  const isEs = locale === "es";

  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const categoryIcons: Record<string, React.ReactNode> = {
    "Creator Economy": <Coins className="w-3.5 h-3.5 text-[#00fbfb]" />,
    "Payouts & Taxes": <Coins className="w-3.5 h-3.5 text-[#39FF14]" />,
    "AI Tools": <Bot className="w-3.5 h-3.5 text-[#ffabf3]" />,
    "Safety & DRM": <ShieldCheck className="w-3.5 h-3.5 text-[#00fbfb]" />
  };

  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      // Category filter
      if (selectedCategory !== "All" && post.category !== selectedCategory) {
        return false;
      }
      // Tag filter
      if (selectedTag && !post.tags.includes(selectedTag)) {
        return false;
      }
      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const titleMatch = post.title.toLowerCase().includes(q) || (post.titleEs?.toLowerCase().includes(q) ?? false);
        const descMatch = post.description.toLowerCase().includes(q) || (post.descriptionEs?.toLowerCase().includes(q) ?? false);
        const tagMatch = post.tags.some((t) => t.toLowerCase().includes(q));
        if (!titleMatch && !descMatch && !tagMatch) {
          return false;
        }
      }
      return true;
    });
  }, [posts, selectedCategory, selectedTag, searchQuery]);

  const allTags = useMemo(() => {
    const set = new Set<string>();
    posts.forEach((p) => p.tags.forEach((t) => set.add(t)));
    return Array.from(set);
  }, [posts]);

  return (
    <div className="space-y-12">
      {/* Search & Filter Controls */}
      <div className="p-4 sm:p-6 rounded-3xl bg-[#0F0F1A]/90 border border-white/10 backdrop-blur-xl shadow-2xl space-y-5">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
          {/* Search bar */}
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isEs ? "Buscar artículos, análisis o palabras clave..." : "Search articles, guides, or keywords..."}
              className="w-full pl-11 pr-4 py-2.5 rounded-full bg-white/5 border border-white/10 text-xs sm:text-sm text-white placeholder-white/40 focus:outline-none focus:border-[#00fbfb]/60 focus:bg-white/[0.08] transition-all font-sans"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-white/40 hover:text-white"
              >
                ✕
              </button>
            )}
          </div>

          {/* Tag Quick Reset */}
          {selectedTag && (
            <div className="flex items-center gap-2 self-start md:self-auto">
              <span className="text-[11px] font-mono text-white/50">
                {isEs ? "Etiqueta activa:" : "Active tag:"}
              </span>
              <button
                onClick={() => setSelectedTag(null)}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ffabf3]/15 border border-[#ffabf3]/40 text-[#ffabf3] text-[11px] font-mono font-bold hover:bg-[#ffabf3]/25 transition"
              >
                <span>#{selectedTag}</span>
                <span>✕</span>
              </button>
            </div>
          )}
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-white/5">
          <button
            onClick={() => {
              setSelectedCategory("All");
              setSelectedTag(null);
            }}
            className={`px-4 py-2 rounded-full font-mono text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              selectedCategory === "All" && !selectedTag
                ? "bg-[#00fbfb] text-black shadow-[0_0_15px_rgba(0,251,251,0.4)]"
                : "bg-white/5 text-white/60 hover:text-white hover:bg-white/10 border border-white/5"
            }`}
          >
            {isEs ? "Todos los Artículos" : "All Articles"}
          </button>

          {BLOG_CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => {
                  setSelectedCategory(cat);
                  setSelectedTag(null);
                }}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-mono text-xs font-bold tracking-wider transition-all cursor-pointer ${
                  isSelected
                    ? "bg-[#00fbfb]/15 text-[#00fbfb] border border-[#00fbfb]/60 shadow-[0_0_15px_rgba(0,251,251,0.25)]"
                    : "bg-white/5 text-white/60 hover:text-white hover:bg-white/10 border border-white/5"
                }`}
              >
                {categoryIcons[cat]}
                <span>{cat}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Articles Grid */}
      {filteredPosts.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white/[0.02] border border-white/5 space-y-4">
          <SlidersHorizontal className="w-8 h-8 text-white/30 mx-auto" />
          <h3 className="font-['Outfit'] text-lg font-bold text-white uppercase">
            {isEs ? "No se encontraron artículos" : "No Articles Found"}
          </h3>
          <p className="text-xs text-white/50 max-w-md mx-auto">
            {isEs
              ? "Prueba ajustando los términos de búsqueda o selecciona otra categoría."
              : "Try adjusting your search criteria or clear active category filters."}
          </p>
          <button
            onClick={() => {
              setSelectedCategory("All");
              setSelectedTag(null);
              setSearchQuery("");
            }}
            className="px-5 py-2 rounded-full bg-white/10 text-white font-mono text-xs font-bold hover:bg-white/20 transition"
          >
            {isEs ? "Restablecer Filtros" : "Reset Filters"}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {filteredPosts.map((post, idx) => {
            const isPillar = idx === 0;
            const title = (isEs && post.titleEs) ? post.titleEs : post.title;
            const desc = (isEs && post.descriptionEs) ? post.descriptionEs : post.description;

            return (
              <article
                key={post.slug}
                className="group relative rounded-[2.5rem] p-1 bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-[#00fbfb]/40 shadow-[0_24px_48px_-12px_rgba(0,0,0,0.6)] backdrop-blur-xl transition-all duration-300 flex flex-col justify-between"
              >
                <div className="rounded-[calc(2.5rem-0.25rem)] bg-[#0F0F1A]/95 p-6 sm:p-8 border border-white/5 flex flex-col justify-between h-full space-y-6">
                  {/* Top Badge & Metadata */}
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 font-mono text-[10px] font-bold uppercase tracking-wider text-[#00fbfb]">
                        {categoryIcons[post.category]}
                        <span>{post.category}</span>
                      </span>
                      <div className="flex items-center gap-3 text-white/40 text-[11px] font-mono">
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {post.date}
                        </span>
                        <span>•</span>
                        <span className="inline-flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {post.readTime}
                        </span>
                      </div>
                    </div>

                    {/* Title */}
                    <Link href={`/blog/${post.slug}`} className="block group-hover:text-[#00fbfb] transition-colors">
                      <h2 className="font-['Outfit'] text-xl sm:text-2xl font-black text-white leading-snug tracking-tight group-hover:text-[#00fbfb] transition-colors">
                        {title}
                      </h2>
                    </Link>

                    {/* Excerpt */}
                    <p className="text-xs sm:text-sm text-[#b9cac9] leading-relaxed line-clamp-3">
                      {desc}
                    </p>
                  </div>

                  {/* Bullet Takeaways */}
                  {post.summaryPoints && post.summaryPoints.length > 0 && (
                    <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
                      <span className="font-mono text-[9px] font-bold text-white/40 uppercase tracking-widest block">
                        {isEs ? "CLAVES DEL ANÁLISIS" : "KEY TAKEAWAYS"}
                      </span>
                      <ul className="space-y-1.5 text-[11px] text-white/70">
                        {post.summaryPoints.slice(0, 2).map((pt, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-[#00fbfb] font-bold">•</span>
                            <span className="line-clamp-2">{pt}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Footer: Tags, Author & Read Button */}
                  <div className="pt-4 border-t border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex flex-wrap gap-1.5">
                      {post.tags.slice(0, 3).map((tag) => (
                        <button
                          key={tag}
                          onClick={() => setSelectedTag(tag)}
                          className="px-2.5 py-0.5 rounded-full bg-white/[0.03] border border-white/10 font-mono text-[9px] text-white/50 hover:text-[#00fbfb] hover:border-[#00fbfb]/30 transition"
                        >
                          #{tag}
                        </button>
                      ))}
                    </div>

                    <Link
                      href={`/blog/${post.slug}`}
                      className="inline-flex items-center gap-2 font-mono text-xs font-bold text-[#00fbfb] group-hover:translate-x-1 transition-transform self-end sm:self-auto shrink-0"
                    >
                      <span>{isEs ? "Leer Artículo" : "Read Article"}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Bottom Tag Cloud */}
      <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 space-y-3">
        <div className="flex items-center gap-2">
          <Tag className="w-4 h-4 text-[#ffabf3]" />
          <span className="font-['Outfit'] text-xs font-bold text-white uppercase tracking-wider">
            {isEs ? "Explorar por Temas Populares" : "Explore Popular Topics"}
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => {
                setSelectedTag(tag);
                setSelectedCategory("All");
              }}
              className={`px-3 py-1 rounded-full font-mono text-[11px] transition cursor-pointer ${
                selectedTag === tag
                  ? "bg-[#ffabf3] text-black font-bold"
                  : "bg-white/5 text-white/60 hover:text-white hover:bg-white/10 border border-white/5"
              }`}
            >
              #{tag}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}