"use client";

import React from "react";
import Link from "next/link";
import PublicNavbar from "@/components/PublicNavbar";
import PublicFooter from "@/components/PublicFooter";
import { LegalDocumentActions } from "@/components/legal/LegalDocumentActions";
import { LegalEntityCard } from "@/components/legal/LegalEntityCard";
import { LegalSectionsList } from "@/components/legal/LegalSectionsList";
import { useTranslation } from "@/context/LanguageContext";
import { getLegalDocument, normalizeLegalLocale } from "@/lib/legal-documents";
import { ArrowLeft } from "lucide-react";

export default function CreatorHubPage() {
  const { locale } = useTranslation();
  const activeLocale = normalizeLegalLocale(locale);
  const isFr = activeLocale === "fr";
  const isEs = activeLocale === "es";
  const doc = getLegalDocument("creator", activeLocale);

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

      <PublicNavbar />

      <div className="relative z-10 pt-36 px-6 md:px-[84px] max-w-[840px] mx-auto w-full flex-grow">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-mono font-bold text-white/40 hover:text-[#00fbfb] transition mb-8 group print:hidden"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>{doc.backToHome}</span>
        </Link>

        {/* Title */}
        <div className="text-left space-y-4 mb-8">
          <h1 className="font-display text-4xl md:text-5xl font-black text-white tracking-tight uppercase leading-none font-['Outfit']">
            {doc.title}
          </h1>
          <p className="text-xs sm:text-sm text-[#b9cac9] max-w-xl">{doc.subtitle}</p>

          <LegalDocumentActions docId="creator" locale={activeLocale} />

          <LegalEntityCard
            title={doc.entityCardTitle}
            contactLabel={doc.contactLabel}
            contactEmail={doc.contactEmail}
            locale={activeLocale}
          />
        </div>

        {/* Founding Creator Callout Banner (Double-Bezel Cyber Design) */}
        <div className="mb-10 rounded-[2rem] p-1 bg-gradient-to-r from-[#00fbfb]/30 via-[#ffabf3]/20 to-[#00fbfb]/30 border border-[#00fbfb]/40 shadow-[0_0_35px_rgba(0,251,251,0.15)] relative overflow-hidden group">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(0,251,251,0.12),transparent_70%)] pointer-events-none" />
          <div className="rounded-[calc(2rem-0.25rem)] bg-[#0A0A14]/95 p-6 md:p-8 border border-white/10 relative z-10 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00fbfb]/10 border border-[#00fbfb]/30 text-[#00fbfb] text-[11px] font-mono font-bold uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-[#00fbfb] animate-pulse" />
                {isFr
                  ? "OFFRE EXCLUSIVE · 500 PREMIERS CRÉATEURS"
                  : isEs
                  ? "OFERTA EXCLUSIVA · PRIMEROS 500 CREADORES"
                  : "EXCLUSIVE OFFER · FIRST 500 CREATORS"}
              </div>
              <div className="text-[10px] font-mono uppercase tracking-widest text-[#ffabf3] font-semibold">
                {isFr
                  ? "Programme Créateur Fondateur"
                  : isEs
                  ? "Programa Creador Fundador"
                  : "Founding Creator Cohort"}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              <div className="md:col-span-8 space-y-3">
                <h2 className="text-xl md:text-2xl font-black text-white font-['Outfit'] uppercase tracking-tight flex flex-wrap items-center gap-2">
                  <span className="text-[#00fbfb]">90%</span>{" "}
                  {isFr
                    ? "Rétention des Revenus Nets"
                    : isEs
                    ? "Reparto de Ingresos Netos"
                    : "Net Revenue Split"}
                  <span className="text-white/30 text-sm font-normal font-mono">+</span>
                  <span className="text-[#ffabf3] text-lg md:text-xl">
                    {isFr
                      ? "Assistant IA 1 An Offert"
                      : isEs
                      ? "Asistente IA 1 Año Gratis"
                      : "1-Yr Free AI Ops"}
                  </span>
                </h2>
                <p className="text-xs text-[#b9cac9] leading-relaxed">
                  {isFr
                    ? "Les 500 premiers créateurs vérifiés bénéficient d'un taux de rétention préférentiel de 90 % sur les revenus nets (SECCION ne retient que 10 %), ainsi que d'un accès illimité et sans frais pendant 1 an à l'Assistant d'Opérations et au Copilote Légal de SECCION (plus de 4 000 €/mois d'économie sur les agences intermédiaires). Au-delà des 500 créateurs, le taux standard permanent de la plateforme est de 80/20 garanti."
                    : isEs
                    ? "Los primeros 500 creadores verificados se benefician de una tasa de retención preferencial del 90% sobre ingresos netos (SECCION retiene solo el 10%), además de acceso ilimitado sin costo por 1 año al Asistente de Operaciones y Copiloto Legal de SECCION (ahorro de más de 4.000 €/mes en agencias intermediarias). Superados los 500 creadores, la tasa estándar permanente de la plataforma es del 80/20 garantizado."
                    : "The first 500 verified creators secure a preferential 90% net revenue split (SECCION retains only 10%), plus 1 full year of free access to SECCION's AI Operations Assistant & Legal Copilot (saving €4,000+/mo vs predatory agency fees). After the first 500 creators, the platform operates on our permanent guaranteed 80/20 standard split baseline."}
                </p>
                <div className="flex flex-wrap items-center gap-4 text-[11px] font-mono pt-1 text-white/70">
                  <div className="flex items-center gap-1.5">
                    <span className="text-emerald-400 font-bold">✓</span>
                    <span>
                      {isFr
                        ? "90/10 Fondateurs (Base : 80/20)"
                        : isEs
                        ? "90/10 Fundadores (Base: 80/20)"
                        : "90/10 Founders (Base: 80/20)"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-emerald-400 font-bold">✓</span>
                    <span>
                      {isFr
                        ? "Zéro commission d'agence"
                        : isEs
                        ? "Cero comisiones de agencia"
                        : "Zero agency cuts"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[#00fbfb] font-bold">✓</span>
                    <span>
                      {isFr
                        ? "Audit légal des contrats"
                        : isEs
                        ? "Auditoría legal de contratos"
                        : "Contract screening AI"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="md:col-span-4 flex flex-col sm:flex-row md:flex-col gap-3 justify-center print:hidden">
                <Link
                  href="/creator-hub/onlyfans-alternative"
                  className="w-full text-center px-4 py-3 rounded-xl bg-[#00fbfb] text-[#0A0A14] font-mono font-bold text-xs uppercase tracking-wider hover:bg-[#00fbfb]/90 hover:shadow-[0_0_20px_rgba(0,251,251,0.4)] transition-all"
                >
                  {isFr
                    ? "Comparatif 6 Plateformes"
                    : isEs
                    ? "Comparativa 6 Plataformas"
                    : "Compare 6 Platforms"}
                </Link>
                <Link
                  href="/become-creator#apply"
                  className="w-full text-center px-4 py-3 rounded-xl bg-white/[0.05] border border-white/15 text-white font-mono font-semibold text-xs uppercase tracking-wider hover:bg-white/10 hover:border-white/30 transition-all"
                >
                  {isFr
                    ? "Postuler au Programme Fondateur"
                    : isEs
                    ? "Solicitar Cupo Fundador"
                    : "Apply For Founding Cohort"}
                </Link>
              </div>
            </div>
          </div>
        </div>

        <LegalSectionsList sections={doc.sections} />
      </div>

      <PublicFooter />
    </div>
  );
}
