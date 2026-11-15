"use client";

import React from "react";
import { Download, Printer } from "lucide-react";
import {
  LEGAL_PDF_FILES,
  LegalDocId,
  LegalLocale,
  normalizeLegalLocale,
} from "@/lib/legal-documents";

interface LegalDocumentActionsProps {
  docId: LegalDocId;
  locale?: string;
}

const LABELS: Record<
  LegalLocale,
  {
    downloadPrefix: string;
    durableNote: string;
    printLabel: string;
    otherLanguages: string;
  }
> = {
  en: {
    downloadPrefix: "Download Official PDF",
    durableNote: "Durable Medium · EU 2011/83 & LSSI-CE",
    printLabel: "Print View",
    otherLanguages: "PDF:",
  },
  es: {
    downloadPrefix: "Descargar PDF Oficial",
    durableNote: "Soporte Duradero · UE 2011/83 y LSSI-CE",
    printLabel: "Imprimir Vista",
    otherLanguages: "PDF:",
  },
  fr: {
    downloadPrefix: "Télécharger le PDF Officiel",
    durableNote: "Support Durable · UE 2011/83 & LSSI-CE",
    printLabel: "Imprimer la Vue",
    otherLanguages: "PDF :",
  },
};

export function LegalDocumentActions({ docId, locale }: LegalDocumentActionsProps) {
  const activeLocale = normalizeLegalLocale(locale);
  const copy = LABELS[activeLocale];
  const pdfMap = LEGAL_PDF_FILES[docId];
  const primaryHref = pdfMap[activeLocale];
  const primaryFileName = primaryHref.split("/").pop() || "document.pdf";

  return (
    <div className="pt-1 print:hidden flex flex-col sm:flex-row sm:items-center gap-2.5 flex-wrap">
      <a
        href={primaryHref}
        download={primaryFileName}
        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#00fbfb]/10 hover:bg-[#00fbfb]/20 border border-[#00fbfb]/35 text-[#00fbfb] text-xs font-bold transition shadow-[0_0_20px_rgba(0,251,251,0.12)]"
      >
        <Download className="w-4 h-4 shrink-0" />
        <span>
          {copy.downloadPrefix} ({activeLocale.toUpperCase()})
        </span>
        <span className="hidden md:inline text-[10px] font-mono text-[#00fbfb]/75 font-normal">
          · {copy.durableNote}
        </span>
      </a>

      <button
        type="button"
        onClick={() => typeof window !== "undefined" && window.print()}
        className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/15 text-white/80 hover:text-white text-xs font-mono font-semibold transition"
      >
        <Printer className="w-3.5 h-3.5 shrink-0" />
        <span>{copy.printLabel}</span>
      </button>

      <div className="inline-flex items-center gap-1.5 text-[10px] font-mono text-white/50">
        <span>{copy.otherLanguages}</span>
        {(["en", "es", "fr"] as const).map((lang) => {
          const href = pdfMap[lang];
          const fileName = href.split("/").pop() || `document-${lang}.pdf`;
          const isCurrent = lang === activeLocale;
          return (
            <a
              key={lang}
              href={href}
              download={fileName}
              className={`px-2 py-1 rounded-md border uppercase transition ${
                isCurrent
                  ? "border-[#00fbfb]/40 bg-[#00fbfb]/15 text-[#00fbfb] font-bold"
                  : "border-white/10 bg-white/[0.02] text-white/60 hover:text-white hover:border-white/25"
              }`}
            >
              {lang}
            </a>
          );
        })}
      </div>
    </div>
  );
}
