"use client";

import PublicFooter from "@/components/PublicFooter";
import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import PublicNavbar from "@/components/PublicNavbar";
import { WaitlistSignup } from "@/components/WaitlistSignup";
import { useTranslation } from "@/context/LanguageContext";
import { Compass, Users, Sparkles, Tv, ArrowLeft, ArrowUpRight, Play, Mic, Search } from "lucide-react";

// Double bezel card
function DoubleBezelCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-[2.5rem] p-1 bg-white/[0.04] border border-white/10 shadow-[0_24px_48px_-12px_rgba(0,0,0,0.6)] backdrop-blur-xl relative overflow-visible ${className}`}>
      <div className="absolute inset-0 border border-white/5 rounded-[2.5rem] pointer-events-none" />
      <div className="rounded-[calc(2.5rem-0.25rem)] bg-[#0F0F1A]/95 p-6 border border-white/5 relative z-10">
        {children}
      </div>
    </div>
  );
}

export default function NowStreamingPage() {
  const [activeTab, setActiveTab] = useState<"all" | "music" | "chat" | "fashion">("all");
  const { t, locale } = useTranslation();

  const mockStreams = [
    {
      id: "siena",
      name: "Siena Vibe",
      title: "🎹 Live Piano Visualizer & Chill Beats",
      titleEs: "🎹 Visualizador de Piano en Vivo & Beats Relax",
      viewers: "1,240",
      category: "music",
      categoryEs: "música",
      image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&q=80",
      archetype: "Creative Muse",
      archetypeEs: "Musa Creativa"
    },
    {
      id: "sarah",
      name: "Sarah Sparks",
      title: "☕ Midnight Vulnerability Confessions",
      titleEs: "☕ Confesiones Íntimas de Medianoche",
      viewers: "840",
      category: "chat",
      categoryEs: "chat",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500&q=80",
      archetype: "Deep Confessor",
      archetypeEs: "Confesión Profunda"
    },
    {
      id: "elena",
      name: "Elena Reads",
      title: "📚 Quiet Literary Review & Chatting",
      titleEs: "📚 Reseña Literaria Tranquila & Charla",
      viewers: "450",
      category: "fashion",
      categoryEs: "estilo",
      image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500&q=80",
      archetype: "Quiet Intellectual",
      archetypeEs: "Intelectual"
    },
    {
      id: "lisa",
      name: "Lisa Style",
      title: "👗 Summer Fashion Wardrobe Haul!",
      titleEs: "👗 ¡Haul de Moda y Guardarropa de Verano!",
      viewers: "1,110",
      category: "fashion",
      categoryEs: "estilo",
      image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=500&q=80",
      archetype: "Creative Muse",
      archetypeEs: "Musa Creativa"
    }
  ];

  const filteredStreams = mockStreams.filter(
    s => activeTab === "all" || s.category === activeTab
  );

  return (
    <div className="w-full min-h-screen text-[#e2e2e2] overflow-x-hidden font-sans bg-transparent relative flex flex-col justify-between">
      
      
      
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

      {/* Floating Navbar */}
      <PublicNavbar activeTab="now-streaming" />

      {/* Main Content Area */}
      <div className="relative z-10 pt-36 px-6 md:px-[84px] max-w-[1440px] mx-auto w-full flex-grow">
        
        {/* Back Link */}
        <Link href="/" className="inline-flex items-center gap-2 text-xs font-mono font-bold text-white/40 hover:text-[#00fbfb] transition mb-8 group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>{locale === "es" ? "Volver al Inicio" : "Back to Home"}</span>
        </Link>

        {/* Title */}
        <div className="text-left space-y-3 mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#39FF14]/5 border border-[#39FF14]/25 text-[#39FF14] text-[9px] font-mono font-bold uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-[#39FF14] animate-pulse" /> {locale === "es" ? "EN VIVO" : "LIVE"}
          </div>
          <h1 className="font-display text-4xl md:text-6xl font-black text-white tracking-tight uppercase leading-none">
            {locale === "es" ? "Transmisiones en Vivo" : "Now Streaming"}
          </h1>
          <p className="text-xs sm:text-sm text-[#b9cac9] max-w-xl">
            {locale === "es" 
              ? "Explora streams en vivo exclusivos presentados por creadores destacados en SECCION."
              : "Explore exclusive live streams hosted by featured creators on SECCION."}
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-3 border-b border-white/5 pb-4 mb-8 overflow-x-auto">
          {[
            { key: "all", label: locale === "es" ? "Todos los Streams" : "All Streams" },
            { key: "music", label: locale === "es" ? "Música" : "Music" },
            { key: "chat", label: locale === "es" ? "Chat y Vibe" : "Chat & Vibe" },
            { key: "fashion", label: locale === "es" ? "Estilo de Vida" : "Lifestyle" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-5 py-2 rounded-xl border font-mono text-[10px] font-bold uppercase transition cursor-pointer shrink-0 ${
                activeTab === tab.key 
                  ? 'border-[#00fbfb] text-[#00fbfb] bg-[#00fbfb]/5' 
                  : 'border-white/5 text-white/40 hover:text-white/60'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Grid List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredStreams.map((stream) => (
            <DoubleBezelCard key={stream.id} className="relative overflow-visible group">
              <div className="space-y-4">
                
                {/* Visualizer Block */}
                <div className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden bg-black/30 border border-white/5">
                  <img src={stream.image} alt={stream.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                  
                  {/* Glowing Live tag */}
                  <div className="absolute top-3 left-3 bg-red-600 px-2 py-0.5 rounded text-[8px] font-mono text-white uppercase font-bold flex items-center gap-1.5 shadow-[0_0_10px_rgba(220,38,38,0.5)]">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                    <span>{locale === "es" ? "EN VIVO" : "LIVE"}</span>
                  </div>

                  {/* Viewer Badge */}
                  <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded text-[8px] font-mono text-[#b9cac9] flex items-center gap-1.5">
                    <Users className="w-3 h-3 text-[#b9cac9]" />
                    <span>{stream.viewers}</span>
                  </div>

                  {/* Play Button Overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition duration-300 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-[#00fbfb] text-black flex items-center justify-center shadow-[0_0_20px_rgba(0,251,251,0.5)] cursor-pointer">
                      <Play className="w-5 h-5 fill-current ml-0.5" />
                    </div>
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-2 text-left">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xs font-bold text-white font-mono uppercase tracking-wider">{stream.name}</h3>
                    <span className="text-[8px] font-mono font-bold text-[#ffabf3] bg-[#ffabf3]/5 border border-[#ffabf3]/25 px-2 py-0.5 rounded-full">
                      {locale === "es" ? stream.archetypeEs : stream.archetype}
                    </span>
                  </div>
                  <p className="text-[10px] text-[#b9cac9] leading-snug line-clamp-2">
                    {locale === "es" ? stream.titleEs : stream.title}
                  </p>
                  
                  <div className="border-t border-white/5 pt-3.5 flex justify-between items-center">
                    <span className="text-[8px] font-mono text-white/30 uppercase font-bold">{locale === "es" ? "Categoría: " : "Category: "}{locale === "es" ? stream.categoryEs : stream.category}</span>
                    <Link 
                      href="#waitlist" 
                      className="text-[9px] font-mono font-bold text-[#00fbfb] hover:underline flex items-center gap-1 uppercase"
                    >
                      <span>{locale === "es" ? "Unirse al Stream" : "Join Stream"}</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>

              </div>
            </DoubleBezelCard>
          ))}
        </div>

      </div>

      <section id="waitlist" className="py-20 w-full px-4 md:px-12 relative z-10">
        <WaitlistSignup variant="card" />
      </section>

      {/* Footer */}
      <PublicFooter />

    </div>
  );
}
