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

export default function PrivacyPage() {
  const { locale } = useTranslation();
  const activeLocale = normalizeLegalLocale(locale);
  const isFr = activeLocale === "fr";
  const isEs = activeLocale === "es";
  const doc = getLegalDocument("privacy", activeLocale);

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
        <div className="text-left space-y-4 mb-12">
          <h1 className="font-display text-4xl md:text-5xl font-black text-white tracking-tight uppercase leading-none font-['Outfit']">
            {doc.title}
          </h1>
          <p className="text-xs sm:text-sm text-[#b9cac9] max-w-xl">{doc.subtitle}</p>

          <LegalDocumentActions docId="privacy" locale={activeLocale} />

          <LegalEntityCard
            title={doc.entityCardTitle}
            contactLabel={doc.contactLabel}
            contactEmail={doc.contactEmail}
            locale={activeLocale}
            variant="shield"
          />

          <div className="p-3 bg-[#ffabf3]/5 border border-[#ffabf3]/20 rounded-xl text-left text-[10px] text-[#ffabf3]">
            💡{" "}
            <strong>
              {isFr
                ? "STANDARDS LÉGAUX ET MONÉTISATION"
                : isEs
                ? "ESTÁNDARES LEGALES Y MONETIZACIÓN"
                : "LEGAL STANDARDS & MONETIZATION"}
            </strong>
            :{" "}
            {isFr
              ? "Conditions, directives légales et outils de monétisation pour les créateurs sur SECCION."
              : isEs
              ? "Términos, directrices legales y herramientas de monetización para creadores en SECCION."
              : "Terms, legal guidelines, and monetization tools for creators on SECCION."}{" "}
            <Link href="/creator-hub" className="underline font-bold">
              [{isFr ? "Centre des Créateurs" : isEs ? "Centro de Creadores" : "Creator Hub"}]
            </Link>
          </div>
        </div>

        <LegalSectionsList sections={doc.sections} />
      </div>

      <PublicFooter />
    </div>
  );
}
