"use client";

import React from "react";
import Link from "next/link";
import PublicNavbar from "@/components/PublicNavbar";
import PublicFooter from "@/components/PublicFooter";
import { LegalDocumentActions } from "@/components/legal/LegalDocumentActions";
import { LegalEntityCard } from "@/components/legal/LegalEntityCard";
import { LegalSectionsList } from "@/components/legal/LegalSectionsList";
import { useTranslation } from "@/context/LanguageContext";
import { getLegalDocument, LEGAL_ENTITY, normalizeLegalLocale } from "@/lib/legal-documents";
import { ArrowLeft, CreditCard } from "lucide-react";

export default function RulesPage() {
  const { locale } = useTranslation();
  const activeLocale = normalizeLegalLocale(locale);
  const isFr = activeLocale === "fr";
  const isEs = activeLocale === "es";
  const doc = getLegalDocument("terms", activeLocale);

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

      <div className="relative z-10 pt-36 px-6 md:px-[84px] max-w-[880px] mx-auto w-full flex-grow">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-mono font-bold text-white/40 hover:text-[#00fbfb] transition mb-8 group print:hidden"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>{doc.backToHome}</span>
        </Link>

        {/* Title & Institutional Legal Header */}
        <div className="text-left space-y-4 mb-12">
          <h1 className="font-display text-4xl md:text-5xl font-black text-white tracking-tight uppercase leading-none font-['Outfit']">
            {doc.title}
          </h1>
          <p className="text-xs sm:text-sm text-[#b9cac9] max-w-2xl">{doc.subtitle}</p>

          <LegalDocumentActions docId="terms" locale={activeLocale} />

          {/* Legal Entity & Billing Descriptor Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
            <LegalEntityCard
              title={doc.entityCardTitle}
              contactLabel={doc.contactLabel}
              contactEmail={doc.contactEmail}
              locale={activeLocale}
            />

            <div className="p-4 bg-white/[0.03] border border-emerald-500/20 rounded-2xl text-left text-[11px] text-[#b9cac9] font-mono space-y-1.5">
              <div className="text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  {isFr
                    ? "LIBELLÉ BANCAIRE / RELEVÉ"
                    : isEs
                    ? "DESCRIPTOR BANCARIO / EXTRACTO"
                    : "BILLING DESCRIPTOR NOTICE"}
                </span>
              </div>
              <div className="text-white text-xs font-semibold">
                {isFr
                  ? "Apparaîtra sous l'intitulé : "
                  : isEs
                  ? "Aparecerá como: "
                  : "Card Statement Descriptor: "}
                <span className="text-emerald-400 font-bold">
                  &quot;{LEGAL_ENTITY.billingDescriptor}&quot;
                </span>
              </div>
              <div className="text-[10px] text-white/70 leading-relaxed">
                {isFr
                  ? "Les achats de jetons et de pass apparaîtront sur votre relevé bancaire sous le libellé 'Seccion Matrix' sans mention explicite de catégorie afin de préserver votre discrétion. Support facturation disponible 24/7."
                  : isEs
                  ? "Las compras de tokens y pases se reflejarán en su extracto bancario como 'Seccion Matrix'. Centro de atención de facturación disponible 24/7."
                  : "Purchases of in-app tokens and passes will reflect on your card or bank statement as 'Seccion Matrix'. Dedicated 24/7 billing support available."}
              </div>
              <div className="text-[10px] text-white/60 pt-1">
                DSA Single Point of Contact:{" "}
                <a
                  href={`mailto:${LEGAL_ENTITY.emails.dsa}`}
                  className="text-emerald-400 underline"
                >
                  {LEGAL_ENTITY.emails.dsa}
                </a>
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
