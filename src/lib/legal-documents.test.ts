import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  getAllLegalDocumentVariants,
  getLegalDocument,
  LEGAL_ENTITY,
  LEGAL_PDF_FILES,
} from "./legal-documents";

describe("legal-documents single source of truth & PDF parity", () => {
  it("exposes valid non-empty downloadable PDF files for all 3 docs in EN, ES, and FR", () => {
    const publicDir = path.resolve(process.cwd(), "public");

    for (const [docId, locales] of Object.entries(LEGAL_PDF_FILES)) {
      for (const [locale, urlPath] of Object.entries(locales)) {
        const diskPath = path.join(publicDir, urlPath.replace(/^\//, ""));
        expect(fs.existsSync(diskPath), `Missing PDF for ${docId}.${locale} at ${diskPath}`).toBe(
          true
        );

        const stats = fs.statSync(diskPath);
        expect(stats.size).toBeGreaterThan(50_000);

        const fd = fs.openSync(diskPath, "r");
        try {
          const header = Buffer.alloc(5);
          fs.readSync(fd, header, 0, 5, 0);
          expect(header.toString("ascii")).toBe("%PDF-");
        } finally {
          fs.closeSync(fd);
        }
      }
    }
  });

  it("maintains strict section and bullet parity across EN, ES, and FR with zero raw markdown", () => {
    for (const docId of ["terms", "privacy", "creator"] as const) {
      const en = getLegalDocument(docId, "en");
      const es = getLegalDocument(docId, "es");
      const fr = getLegalDocument(docId, "fr");

      expect(es.sections.map((s) => s.id)).toEqual(en.sections.map((s) => s.id));
      expect(fr.sections.map((s) => s.id)).toEqual(en.sections.map((s) => s.id));

      for (let i = 0; i < en.sections.length; i++) {
        expect(es.sections[i].bullets?.length ?? 0).toBe(en.sections[i].bullets?.length ?? 0);
        expect(fr.sections[i].bullets?.length ?? 0).toBe(en.sections[i].bullets?.length ?? 0);
      }
    }

    for (const { doc, locale } of getAllLegalDocumentVariants()) {
      expect(LEGAL_ENTITY.addressByLocale[locale]).toContain(
        "Calle Ingeniero Canales 4, Oficina 1B, 03013 Alicante"
      );
      const serialized = JSON.stringify(doc);
      expect(serialized).not.toContain("**");
      expect(serialized).not.toContain("SnapSign");
    }
  });

  it("keeps Creator Hub aligned on 90% Founding / 80% Standard net revenue split", () => {
    for (const locale of ["en", "es", "fr"] as const) {
      const creatorDoc = getLegalDocument("creator", locale);
      expect(creatorDoc.subtitle).toMatch(/90\s*%/);
      expect(creatorDoc.subtitle).toMatch(/80\s*%/);
      const revenueSection = creatorDoc.sections.find((s) => s.id === "revenue-split");
      expect(revenueSection?.title).toContain("90");
      expect(revenueSection?.title).toContain("80");
    }
  });
});
