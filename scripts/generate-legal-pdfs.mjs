import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import {
  getAllLegalDocumentVariants,
  LEGAL_ENTITY,
} from "../src/lib/legal-documents.ts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const WEB_ROOT = path.resolve(__dirname, "..");
const PUBLIC_DIR = path.join(WEB_ROOT, "public");
const LOGO_PATH = path.join(PUBLIC_DIR, "assets", "logo", "seccion-wordmark-dark.png");

const ACCENT_HEX = {
  cyan: "#0e7490",
  pink: "#be185d",
  emerald: "#047857",
};

const EXTRA_LABELS = {
  en: {
    office: "Registered Office",
    registry: "Commercial Registry",
    effective: "Effective Date",
    version: "Document Version",
    billing: "Billing Descriptor",
    dsa: "DSA Contact",
    entityHeading: "Operating Entity & LSSI-CE Disclosure",
    foundingTitle: "Founding Creator Cohort Summary",
    foundingBody:
      "First 500 verified creators retain 90% Net Revenue (10% platform margin) plus 1 full year of complimentary AI Operations & Contract Copilot access. Permanent guaranteed standard baseline thereafter: 80% Creator / 20% Platform. Open Banking & USDC Crypto carry 0.0% gateway toll.",
    generatedNote: "Official Durable Medium Export — EU Directive 2011/83/EU & Spanish Law 34/2002 (LSSI-CE)",
  },
  es: {
    office: "Domicilio Social",
    registry: "Registro Mercantil",
    effective: "Fecha de Vigencia",
    version: "Versión del Documento",
    billing: "Descriptor Bancario",
    dsa: "Contacto DSA",
    entityHeading: "Entidad Titular e Información Legal (LSSI-CE)",
    foundingTitle: "Resumen Programa Creador Fundador",
    foundingBody:
      "Los primeros 500 creadores verificados conservan el 90 % de los Ingresos Netos (10 % margen de plataforma) y 1 año gratis de Asistente de Operaciones IA y Copiloto Legal. Base estándar permanente garantizada posterior: 80 % Creador / 20 % Plataforma. Open Banking y Cripto USDC tienen 0,0 % de comisión de pasarela.",
    generatedNote: "Copia Oficial en Soporte Duradero — Directiva UE 2011/83/UE y Ley 34/2002 (LSSI-CE)",
  },
  fr: {
    office: "Siège Social",
    registry: "Registre du Commerce",
    effective: "Date d'Entrée en Vigueur",
    version: "Version du Document",
    billing: "Libellé Bancaire",
    dsa: "Point de Contact DSA",
    entityHeading: "Entité Exploitante & Mentions Légales (LSSI-CE)",
    foundingTitle: "Synthèse du Programme Créateur Fondateur",
    foundingBody:
      "Les 500 premiers créateurs vérifiés conservent 90 % des Revenus Nets (10 % marge plateforme) et bénéficient d'1 an gratuit d'accès à l'Assistant d'Opérations IA et au Copilote Juridique. Taux standard permanent garanti ultérieur : 80 % Créateur / 20 % Plateforme. Open Banking et Crypto USDC supportent 0,0 % de frais de passerelle.",
    generatedNote: "Exemplaire Officiel sur Support Durable — Directive UE 2011/83/UE & Loi 34/2002 (LSSI-CE)",
  },
};

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function stripLeadingSymbol(text) {
  return String(text || "").replace(/^(?:🔮|⚖️)\s*/u, "").trim();
}

function buildHtml({ docId, locale, doc }, logoDataUri) {
  const labels = EXTRA_LABELS[locale];
  const address = LEGAL_ENTITY.addressByLocale[locale];

  const extraBox =
    docId === "terms"
      ? `
      <div class="meta-card">
        <div class="meta-label">${escapeHtml(labels.billing)} & ${escapeHtml(labels.dsa)}</div>
        <div class="meta-value"><strong>"${escapeHtml(LEGAL_ENTITY.billingDescriptor)}"</strong></div>
        <div class="meta-sub">${escapeHtml(labels.dsa)}: ${escapeHtml(LEGAL_ENTITY.emails.dsa)}</div>
        <div class="meta-sub">${escapeHtml(LEGAL_ENTITY.website)}</div>
      </div>`
      : docId === "creator"
      ? `
      <div class="callout-box">
        <div class="callout-title">${escapeHtml(labels.foundingTitle)}</div>
        <p class="callout-body">${escapeHtml(labels.foundingBody)}</p>
      </div>`
      : "";

  const sectionsHtml = doc.sections
    .map((sec) => {
      const color = ACCENT_HEX[sec.accent] || "#0e7490";
      const tldrBlock = sec.tldr
        ? `
        <div class="tldr" style="border-left-color: ${color};">
          <div class="tldr-title" style="color: ${color};">${escapeHtml(stripLeadingSymbol(sec.tldrTitle))}</div>
          <p class="tldr-body">${escapeHtml(sec.tldr)}</p>
        </div>`
        : "";

      const parasHtml = (sec.introParagraphs || [])
        .map((p) => `<p class="body-para">${escapeHtml(p)}</p>`)
        .join("");

      const bulletsHtml =
        sec.bullets && sec.bullets.length > 0
          ? `<ul class="legal-list">${sec.bullets
              .map(
                (b) =>
                  `<li><strong>${escapeHtml(b.label)}:</strong> ${escapeHtml(b.text)}</li>`
              )
              .join("")}</ul>`
          : "";

      return `
      <section class="legal-section">
        <h2 style="border-bottom-color: ${color}25;">
          <span class="sec-bar" style="background: ${color};"></span>
          ${escapeHtml(sec.title)}
        </h2>
        ${tldrBlock}
        ${sec.legalLabel ? `<div class="legal-tag">${escapeHtml(stripLeadingSymbol(sec.legalLabel))}</div>` : ""}
        ${parasHtml}
        ${bulletsHtml}
      </section>`;
    })
    .join("\n");

  return `<!DOCTYPE html>
<html lang="${escapeHtml(locale)}">
<head>
  <meta charset="UTF-8" />
  <title>${escapeHtml(doc.title)} — SECCION</title>
  <style>
    @page {
      size: A4;
      margin: 19mm 16mm 17mm 16mm;
    }
    * {
      box-sizing: border-box;
    }
    body {
      margin: 0;
      padding: 0;
      font-family: "Segoe UI", -apple-system, BlinkMacSystemFont, "Helvetica Neue", Arial, sans-serif;
      color: #1e293b;
      background: #ffffff;
      font-size: 9.1pt;
      line-height: 1.46;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .doc-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #0f172a;
      padding-bottom: 10px;
      margin-bottom: 11px;
    }
    .brand-col img {
      height: 24px;
      width: auto;
      display: block;
      margin-bottom: 4px;
    }
    .brand-sub {
      font-size: 7.5pt;
      color: #64748b;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      font-weight: 600;
    }
    .doc-meta-badges {
      text-align: right;
      font-size: 8pt;
      color: #475569;
    }
    .badge-row {
      display: inline-flex;
      gap: 6px;
      margin-bottom: 4px;
    }
    .badge {
      display: inline-block;
      padding: 2px 7px;
      border-radius: 4px;
      background: #f1f5f9;
      border: 1px solid #cbd5e1;
      font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
      font-size: 7.5pt;
      font-weight: 700;
      color: #0f172a;
    }
    .badge-lang {
      background: #ecfeff;
      border-color: #67e8f9;
      color: #0e7490;
    }
    h1 {
      font-size: 18pt;
      line-height: 1.18;
      margin: 0 0 6px 0;
      color: #0f172a;
      letter-spacing: -0.015em;
      text-transform: uppercase;
    }
    .subtitle {
      font-size: 9.5pt;
      color: #475569;
      margin: 0 0 14px 0;
    }
    .meta-grid {
      display: grid;
      grid-template-columns: ${docId === "terms" ? "1.35fr 1fr" : "1fr"};
      gap: 10px;
      margin-bottom: 16px;
    }
    .meta-card {
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      padding: 10px 12px;
      background: #f8fafc;
    }
    .meta-label {
      font-size: 7.5pt;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: #0e7490;
      margin-bottom: 3px;
    }
    .meta-value {
      font-size: 9.5pt;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 2px;
    }
    .meta-sub {
      font-size: 8.2pt;
      color: #334155;
      line-height: 1.4;
    }
    .callout-box {
      border: 1px solid #67e8f9;
      background: #f0fdfa;
      border-radius: 8px;
      padding: 10px 12px;
      margin-bottom: 16px;
      page-break-inside: avoid;
    }
    .callout-title {
      font-size: 8.5pt;
      font-weight: 700;
      text-transform: uppercase;
      color: #0e7490;
      margin-bottom: 3px;
    }
    .callout-body {
      margin: 0;
      font-size: 8.8pt;
      color: #134e4a;
    }
    .legal-section {
      margin-bottom: 12px;
    }
    h2 {
      display: flex;
      align-items: center;
      gap: 7px;
      font-size: 10.5pt;
      font-weight: 700;
      text-transform: uppercase;
      color: #0f172a;
      margin: 0 0 6px 0;
      padding-bottom: 3px;
      border-bottom: 1px solid #e2e8f0;
      break-after: avoid;
      page-break-after: avoid;
    }
    .sec-bar {
      display: inline-block;
      width: 4px;
      height: 14px;
      border-radius: 2px;
      flex-shrink: 0;
    }
    .tldr {
      background: #f8fafc;
      border-left: 3px solid #0e7490;
      border-radius: 0 6px 6px 0;
      padding: 8px 10px;
      margin-bottom: 8px;
      page-break-inside: avoid;
    }
    .tldr-title {
      font-size: 7.5pt;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 2px;
    }
    .tldr-body {
      margin: 0;
      font-size: 8.8pt;
      font-style: italic;
      color: #334155;
    }
    .legal-tag {
      font-size: 7.5pt;
      font-weight: 700;
      text-transform: uppercase;
      color: #64748b;
      letter-spacing: 0.05em;
      margin: 6px 0 4px 0;
      break-after: avoid;
    }
    .body-para {
      margin: 0 0 6px 0;
      color: #334155;
    }
    .legal-list {
      margin: 4px 0 0 0;
      padding-left: 16px;
    }
    .legal-list li {
      margin-bottom: 5px;
      color: #334155;
      page-break-inside: avoid;
    }
    .legal-list li strong {
      color: #0f172a;
    }
    .doc-signoff {
      margin-top: 18px;
      padding-top: 10px;
      border-top: 1px solid #cbd5e1;
      font-size: 8pt;
      color: #64748b;
      page-break-inside: avoid;
    }
  </style>
</head>
<body>
  <header class="doc-header">
    <div class="brand-col">
      ${logoDataUri ? `<img src="${logoDataUri}" alt="SECCION" />` : `<div style="font-size:18pt;font-weight:900;">SECCION</div>`}
      <div class="brand-sub">${escapeHtml(labels.entityHeading)}</div>
    </div>
    <div class="doc-meta-badges">
      <div class="badge-row">
        <span class="badge">${escapeHtml(doc.code)}</span>
        <span class="badge">${escapeHtml(doc.version)}</span>
        <span class="badge badge-lang">${escapeHtml(locale.toUpperCase())}</span>
      </div>
      <div>${escapeHtml(labels.effective)}: <strong>${escapeHtml(doc.effectiveDate)}</strong></div>
    </div>
  </header>

  <h1>${escapeHtml(doc.title)}</h1>
  <p class="subtitle">${escapeHtml(doc.subtitle)}</p>

  <div class="meta-grid">
    <div class="meta-card">
      <div class="meta-label">${escapeHtml(doc.entityCardTitle)}</div>
      <div class="meta-value">${escapeHtml(LEGAL_ENTITY.name)} · NIF/CIF: ${escapeHtml(LEGAL_ENTITY.nif)}</div>
      <div class="meta-sub"><strong>${escapeHtml(labels.office)}:</strong> ${escapeHtml(address)}</div>
      <div class="meta-sub"><strong>${escapeHtml(labels.registry)}:</strong> ${escapeHtml(LEGAL_ENTITY.registry)}</div>
      <div class="meta-sub"><strong>${escapeHtml(doc.contactLabel)}:</strong> ${escapeHtml(doc.contactEmail)}</div>
    </div>
    ${docId === "terms" ? extraBox : ""}
  </div>
  ${docId === "creator" ? extraBox : ""}

  <main>
    ${sectionsHtml}
  </main>

  <footer class="doc-signoff">
    <div><strong>${escapeHtml(LEGAL_ENTITY.name)}</strong> (NIF ${escapeHtml(LEGAL_ENTITY.nif)}) — ${escapeHtml(address)}</div>
    <div>${escapeHtml(labels.generatedNote)} · ${escapeHtml(LEGAL_ENTITY.website)}</div>
  </footer>
</body>
</html>`;
}

async function main() {
  const logoBuffer = fs.existsSync(LOGO_PATH) ? fs.readFileSync(LOGO_PATH) : null;
  const logoDataUri = logoBuffer
    ? `data:image/png;base64,${logoBuffer.toString("base64")}`
    : "";

  const variants = getAllLegalDocumentVariants();
  const browser = await chromium.launch({ headless: true });

  try {
    const context = await browser.newContext();
    const page = await context.newPage();

    for (const variant of variants) {
      const { doc, locale } = variant;
      const outPath = path.join(PUBLIC_DIR, doc.pdfUrl.replace(/^\//, ""));
      fs.mkdirSync(path.dirname(outPath), { recursive: true });

      const html = buildHtml(variant, logoDataUri);
      await page.setContent(html, { waitUntil: "load" });

      const address = LEGAL_ENTITY.addressByLocale[locale];
      await page.pdf({
        path: outPath,
        format: "A4",
        printBackground: true,
        margin: {
          top: "19mm",
          right: "16mm",
          bottom: "17mm",
          left: "16mm",
        },
        displayHeaderFooter: true,
        headerTemplate: `
          <div style="width:100%;font-family:Arial,sans-serif;font-size:7pt;color:#64748b;padding:0 16mm;display:flex;justify-content:space-between;border-bottom:0.5pt solid #e2e8f0;padding-bottom:3pt;">
            <span><strong>SECCION AI CONCEPT S.L.</strong> · ${escapeHtml(doc.code)} (${escapeHtml(doc.version)})</span>
            <span>${escapeHtml(doc.title)}</span>
          </div>`,
        footerTemplate: `
          <div style="width:100%;font-family:Arial,sans-serif;font-size:7pt;color:#64748b;padding:0 16mm;display:flex;justify-content:space-between;border-top:0.5pt solid #e2e8f0;padding-top:3pt;">
            <span>NIF ${escapeHtml(LEGAL_ENTITY.nif)} · ${escapeHtml(address)}</span>
            <span>Page <span class="pageNumber"></span> / <span class="totalPages"></span></span>
          </div>`,
      });

      const stats = fs.statSync(outPath);
      console.log(`Generated ${doc.pdfUrl} (${(stats.size / 1024).toFixed(1)} KB)`);
    }
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error("Failed to generate legal PDFs:", err);
  process.exit(1);
});
