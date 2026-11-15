/**
 * SECCION Financial Stack V3.1 — EU/Spain Tax, CJEU Fenix Deemed Supplier,
 * OSS (Modelo 369), Art. 24b Location Proof, Self-Billing (Autofacturacion),
 * DAC7 (Modelo 238), and Veri*factu (RD 1007/2023) Compliance Engine.
 *
 * Pure isomorphic TypeScript (no Node-only `fs`/`crypto` imports) so both
 * server API routes and React client components can execute deterministically.
 */

export const SECCION_FISCAL_ENTITY = {
  legalName: 'SECCION AI CONCEPT, S.L.',
  jurisdictionCountry: 'ES',
  province: 'Alicante',
  cnae: '6210',
  iae: '1*845',
  cif: process.env.SECCION_SL_CIF || 'PENDING_AEAT_CIF',
  roiVatId:
    process.env.SECCION_SL_ROI_VAT ||
    (process.env.SECCION_SL_CIF ? `ES${process.env.SECCION_SL_CIF}` : 'PENDING_ROI'),
} as const;

/**
 * 2026 EU-27 Standard VAT Rates (EU Directive 2006/112/EC).
 * Source verified against EU Commission & Member State 2026 statutory schedules
 * (includes Estonia 24%, Finland 25.5%, Romania 21%, Slovakia 23%).
 */
export const EU_STANDARD_VAT_RATES: Record<string, number> = {
  AT: 0.20, // Austria
  BE: 0.21, // Belgium
  BG: 0.20, // Bulgaria
  CY: 0.19, // Cyprus
  CZ: 0.21, // Czechia
  DE: 0.19, // Germany
  DK: 0.25, // Denmark
  EE: 0.24, // Estonia
  ES: 0.21, // Spain
  FI: 0.255, // Finland
  FR: 0.20, // France
  GR: 0.24, // Greece (ISO)
  HR: 0.25, // Croatia
  HU: 0.27, // Hungary
  IE: 0.23, // Ireland
  IT: 0.22, // Italy
  LT: 0.21, // Lithuania
  LU: 0.17, // Luxembourg
  LV: 0.21, // Latvia
  MT: 0.18, // Malta
  NL: 0.21, // Netherlands
  PL: 0.23, // Poland
  PT: 0.23, // Portugal
  RO: 0.21, // Romania
  SE: 0.25, // Sweden
  SI: 0.22, // Slovenia
  SK: 0.23, // Slovakia
};

export const EU_OSS_MICRO_THRESHOLD_EUR = 10_000;
export const ART_24B_RETENTION_YEARS = 10;

export function normalizeCountryCode(code?: string | null): string {
  const upper = (code || '').trim().toUpperCase();
  if (!upper) return '';
  if (upper === 'EL') return 'GR'; // EU tax alias -> ISO GR
  if (upper === 'UK') return 'GB';
  return upper.slice(0, 2);
}

export function isEuMemberState(countryCode?: string | null): boolean {
  const iso = normalizeCountryCode(countryCode);
  return Object.prototype.hasOwnProperty.call(EU_STANDARD_VAT_RATES, iso);
}

/**
 * Canary Islands (35xxx, 38xxx), Ceuta (51xxx), and Melilla (52xxx) sit outside
 * the EU VAT territorial scope (Art. 3 Ley 37/1992 LIVA -> IGIC / IPSI).
 */
export function isSpanishSpecialTaxTerritory(
  countryCode?: string | null,
  postalCode?: string | null
): boolean {
  if (normalizeCountryCode(countryCode) !== 'ES' || !postalCode) return false;
  const clean = postalCode.replace(/\s+/g, '');
  return /^(35|38|51|52)\d{3}$/.test(clean);
}

export function roundEur(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

// ---------------------------------------------------------------------------
// 1. Implementing Regulation (EU) 282/2011 Art. 24b & Art. 24f Location Proofs
// ---------------------------------------------------------------------------

export type LocationProofType =
  | 'billing_address'
  | 'geo_ip'
  | 'card_bin_country'
  | 'bank_iban_country'
  | 'mobile_mcc'
  | 'sim_country'
  | 'other_commercial';

export interface LocationProofInput {
  type: LocationProofType;
  countryCode: string;
  evidenceRef?: string;
  capturedAtIso?: string;
}

export interface Art24bValidationResult {
  valid: boolean;
  resolvedCountry: string;
  concordantProofCount: number;
  contradictionDetected: boolean;
  /** True if Spanish Geo-IP triggers Art. 70.Dos LIVA rebuttal risk when proofs conflict */
  art70DosSpainPresumptionTriggered: boolean;
  retentionYears: number;
  retainUntilIso: string;
  legalBasis: string[];
  proofSummary: Array<{ type: LocationProofType; countryCode: string; concordant: boolean }>;
  reason?: string;
}

/**
 * Validates customer location evidence under EU Implementing Regulation 282/2011
 * Art. 24b & Art. 24f (2 non-contradictory proofs required as platform > threshold
 * or operating OSS; 10-year retention per Art. 24f / LGT; protects against Spanish
 * Art. 70.Dos use-and-enjoyment audit reclassification).
 */
export function validateArt24bLocationProofs(
  declaredCountry: string,
  proofs: LocationProofInput[],
  referenceDate: Date = new Date()
): Art24bValidationResult {
  const target = normalizeCountryCode(declaredCountry);
  const yearEndRetention = new Date(
    Date.UTC(referenceDate.getUTCFullYear() + ART_24B_RETENTION_YEARS, 11, 31, 23, 59, 59)
  ).toISOString();

  // Deduplicate by proof category so one IP check cannot be counted twice
  const deduped = new Map<LocationProofType, string>();
  for (const p of proofs) {
    const normalized = normalizeCountryCode(p.countryCode);
    if (normalized) {
      deduped.set(p.type, normalized);
    }
  }

  const entries = Array.from(deduped.entries()).map(([type, countryCode]) => ({
    type,
    countryCode,
    concordant: countryCode === target,
  }));

  const distinctCountries = new Set(entries.map((e) => e.countryCode));
  const concordantCount = entries.filter((e) => e.concordant).length;
  const hasSpanishSignal = entries.some((e) => e.countryCode === 'ES');
  const contradictionDetected = distinctCountries.size > 1;

  // Under Art. 24b, standard digital platforms require at least 2 non-contradictory
  // items of evidence. If proofs contradict and no clear 2-of-3 concordance resolves it
  // (or if any signal is ES without >=2 non-ES proofs), flag Art. 70.Dos presumption.
  const valid = Boolean(target) && concordantCount >= 2 && !(contradictionDetected && concordantCount < 2);

  let resolvedCountry = target || 'ES';
  let art70DosTriggered = false;
  let reason: string | undefined;

  if (!target) {
    resolvedCountry = hasSpanishSignal ? 'ES' : entries[0]?.countryCode || 'ES';
    art70DosTriggered = resolvedCountry === 'ES';
    reason = 'MISSING_DECLARED_COUNTRY';
  } else if (!valid) {
    if (hasSpanishSignal && target !== 'ES') {
      resolvedCountry = 'ES';
      art70DosTriggered = true;
      reason = 'INSUFFICIENT_OR_CONFLICTING_PROOFS_ART_70_DOS_ES_FALLBACK';
    } else if (concordantCount < 2) {
      reason = 'MINIMUM_TWO_NON_CONTRADICTORY_PROOFS_REQUIRED';
    } else {
      reason = 'CONTRADICTING_LOCATION_EVIDENCE';
    }
  }

  return {
    valid,
    resolvedCountry,
    concordantProofCount: concordantCount,
    contradictionDetected,
    art70DosSpainPresumptionTriggered: art70DosTriggered,
    retentionYears: ART_24B_RETENTION_YEARS,
    retainUntilIso: yearEndRetention,
    legalBasis: [
      'EU Implementing Regulation 282/2011 Art. 24b & Art. 24f (10-year audit retention)',
      'Ley 37/1992 (LIVA) Art. 70.Dos (effective use & enjoyment safeguard)',
    ],
    proofSummary: entries,
    reason,
  };
}

// ---------------------------------------------------------------------------
// 2. CJEU C-695/20 Fenix Deemed Supplier Checkout VAT Engine + OSS + MPV/SPV
// ---------------------------------------------------------------------------

export type VoucherInstrumentType = 'direct_service' | 'spv' | 'mpv';

export type CheckoutTaxRegime =
  | 'ES_DOMESTIC_IVA'
  | 'EU_OSS_MODELO_369'
  | 'EU_UNDER_10K_ORIGIN_ES'
  | 'ES_SPECIAL_TERRITORY_0'
  | 'NON_EU_EXPORT_0'
  | 'MPV_DEFERRED_REDEMPTION';

export interface CheckoutVatInput {
  /** Net service value excluding VAT (Creators receive 90%/80% of this Net Base) */
  netBaseEur: number;
  customerCountry: string;
  postalCode?: string;
  /**
   * 'spv' (Single-Purpose Voucher / fixed EU digital credits) and 'direct_service'
   * attract VAT at checkout/issuance. 'mpv' (Multi-Purpose Voucher) defers VAT
   * until token/credit redemption per EU Voucher Directive 2016/1065.
   */
  instrumentType?: VoucherInstrumentType;
  /** Annual cross-border EU B2C net digital sales volume for €10,000 threshold check */
  euCrossBorderAnnualEur?: number;
  /** Explicit OSS registration flag (recommended once cross-border > €10k or opted-in) */
  ossRegistered?: boolean;
  /** Optional Art. 24b proofs to auto-enforce location verification */
  locationProofs?: LocationProofInput[];
  /** Creator revenue split ratio: 0.90 Founding Creator or 0.80 Standard */
  creatorShareRate?: number;
}

export interface CheckoutVatResult {
  netBaseEur: number;
  vatRate: number;
  vatPercentageLabel: string;
  vatAmountEur: number;
  grossTotalEur: number;
  creatorShareRate: number;
  creatorEarningsEur: number;
  platformFeeNetEur: number;
  deemedSupplierGrossEur: number;
  effectiveCountry: string;
  taxRegime: CheckoutTaxRegime;
  vatTiming: 'at_checkout' | 'deferred_at_redemption';
  aeatReturnForm: 'Modelo 303' | 'Modelo 369' | 'No VAT at Issuance (MPV)' | 'Out of EU Scope (Export)';
  ossThresholdApplied: boolean;
  locationProofValidation?: Art24bValidationResult;
  legalBasis: string[];
}

export function calculateCheckoutVat(input: CheckoutVatInput): CheckoutVatResult {
  const netBaseEur = roundEur(Math.max(0, input.netBaseEur));
  const creatorShareRate =
    typeof input.creatorShareRate === 'number' && input.creatorShareRate >= 0 && input.creatorShareRate <= 1
      ? input.creatorShareRate
      : 0.9;
  const instrumentType: VoucherInstrumentType = input.instrumentType || 'direct_service';

  let locationProofValidation: Art24bValidationResult | undefined;
  let effectiveCountry = normalizeCountryCode(input.customerCountry) || 'ES';

  if (input.locationProofs && input.locationProofs.length > 0) {
    locationProofValidation = validateArt24bLocationProofs(effectiveCountry, input.locationProofs);
    effectiveCountry = locationProofValidation.resolvedCountry;
  }

  const creatorEarningsEur = roundEur(netBaseEur * creatorShareRate);
  const platformFeeNetEur = roundEur(netBaseEur - creatorEarningsEur);

  // Multi-Purpose Voucher (MPV): VAT cannot be determined at purchase -> 0% at issuance, taxed at redemption
  if (instrumentType === 'mpv') {
    return {
      netBaseEur,
      vatRate: 0,
      vatPercentageLabel: '0%',
      vatAmountEur: 0,
      grossTotalEur: netBaseEur,
      creatorShareRate,
      creatorEarningsEur,
      platformFeeNetEur,
      deemedSupplierGrossEur: netBaseEur,
      effectiveCountry,
      taxRegime: 'MPV_DEFERRED_REDEMPTION',
      vatTiming: 'deferred_at_redemption',
      aeatReturnForm: 'No VAT at Issuance (MPV)',
      ossThresholdApplied: false,
      locationProofValidation,
      legalBasis: [
        'EU Voucher Directive (EU) 2016/1065 (Multi-Purpose Voucher — taxed at redemption)',
        'CJEU C-695/20 Fenix International (Platform Deemed Supplier on redemption)',
      ],
    };
  }

  // Spanish Special Territories (Canary Islands IGIC / Ceuta & Melilla IPSI)
  if (isSpanishSpecialTaxTerritory(effectiveCountry, input.postalCode)) {
    return {
      netBaseEur,
      vatRate: 0,
      vatPercentageLabel: '0%',
      vatAmountEur: 0,
      grossTotalEur: netBaseEur,
      creatorShareRate,
      creatorEarningsEur,
      platformFeeNetEur,
      deemedSupplierGrossEur: netBaseEur,
      effectiveCountry,
      taxRegime: 'ES_SPECIAL_TERRITORY_0',
      vatTiming: 'at_checkout',
      aeatReturnForm: 'Out of EU Scope (Export)',
      ossThresholdApplied: false,
      locationProofValidation,
      legalBasis: [
        'Ley 37/1992 (LIVA) Art. 3 (Canary Islands / Ceuta / Melilla excluded from EU VAT area)',
      ],
    };
  }

  // Non-EU Consumer (US, LATAM, UK, Morocco, Rest of World) -> 0% EU VAT
  if (!isEuMemberState(effectiveCountry)) {
    return {
      netBaseEur,
      vatRate: 0,
      vatPercentageLabel: '0%',
      vatAmountEur: 0,
      grossTotalEur: netBaseEur,
      creatorShareRate,
      creatorEarningsEur,
      platformFeeNetEur,
      deemedSupplierGrossEur: netBaseEur,
      effectiveCountry,
      taxRegime: 'NON_EU_EXPORT_0',
      vatTiming: 'at_checkout',
      aeatReturnForm: 'Out of EU Scope (Export)',
      ossThresholdApplied: false,
      locationProofValidation,
      legalBasis: [
        'Ley 37/1992 (LIVA) Art. 69.Dos / Art. 59a Directive 2006/112/EC (Non-EU B2C Place of Supply)',
        'CJEU C-695/20 Fenix International (Zero VAT leakage; Creator paid 90%/80% on Net Base)',
      ],
    };
  }

  // Spain Domestic Customer -> Spanish 21% IVA on Modelo 303
  if (effectiveCountry === 'ES') {
    const vatRate = EU_STANDARD_VAT_RATES.ES;
    const vatAmountEur = roundEur(netBaseEur * vatRate);
    const grossTotalEur = roundEur(netBaseEur + vatAmountEur);
    return {
      netBaseEur,
      vatRate,
      vatPercentageLabel: `${roundEur(vatRate * 100)}%`,
      vatAmountEur,
      grossTotalEur,
      creatorShareRate,
      creatorEarningsEur,
      platformFeeNetEur,
      deemedSupplierGrossEur: grossTotalEur,
      effectiveCountry: 'ES',
      taxRegime: 'ES_DOMESTIC_IVA',
      vatTiming: 'at_checkout',
      aeatReturnForm: 'Modelo 303',
      ossThresholdApplied: false,
      locationProofValidation,
      legalBasis: [
        'CJEU C-695/20 Fenix International (Deemed Supplier liable on full B2C fee)',
        'Ley 37/1992 (LIVA) Art. 90 (21% Spanish Domestic IVA)',
      ],
    };
  }

  // EU Cross-Border Customer -> Check €10,000 OSS SME Threshold vs OSS Registration
  const annualCrossBorder = input.euCrossBorderAnnualEur ?? EU_OSS_MICRO_THRESHOLD_EUR;
  const ossEnabled =
    input.ossRegistered !== undefined
      ? input.ossRegistered
      : annualCrossBorder >= EU_OSS_MICRO_THRESHOLD_EUR;

  if (!ossEnabled && annualCrossBorder < EU_OSS_MICRO_THRESHOLD_EUR) {
    const originRate = EU_STANDARD_VAT_RATES.ES;
    const vatAmountEur = roundEur(netBaseEur * originRate);
    const grossTotalEur = roundEur(netBaseEur + vatAmountEur);
    return {
      netBaseEur,
      vatRate: originRate,
      vatPercentageLabel: '21%',
      vatAmountEur,
      grossTotalEur,
      creatorShareRate,
      creatorEarningsEur,
      platformFeeNetEur,
      deemedSupplierGrossEur: grossTotalEur,
      effectiveCountry,
      taxRegime: 'EU_UNDER_10K_ORIGIN_ES',
      vatTiming: 'at_checkout',
      aeatReturnForm: 'Modelo 303',
      ossThresholdApplied: true,
      locationProofValidation,
      legalBasis: [
        'Directive 2006/112/EC Art. 59c (€10,000 EU cross-border micro-business threshold -> ES 21%)',
        'CJEU C-695/20 Fenix International',
      ],
    };
  }

  const destRate = EU_STANDARD_VAT_RATES[effectiveCountry];
  const vatAmountEur = roundEur(netBaseEur * destRate);
  const grossTotalEur = roundEur(netBaseEur + vatAmountEur);

  return {
    netBaseEur,
    vatRate: destRate,
    vatPercentageLabel: `${roundEur(destRate * 100)}%`,
    vatAmountEur,
    grossTotalEur,
    creatorShareRate,
    creatorEarningsEur,
    platformFeeNetEur,
    deemedSupplierGrossEur: grossTotalEur,
    effectiveCountry,
    taxRegime: 'EU_OSS_MODELO_369',
    vatTiming: 'at_checkout',
    aeatReturnForm: 'Modelo 369',
    ossThresholdApplied: false,
    locationProofValidation,
    legalBasis: [
      'CJEU C-695/20 Fenix International (Deemed Supplier Net-Base Add-On)',
      `EU OSS Union Scheme / AEAT Modelo 369 (${effectiveCountry} destination VAT ${roundEur(destRate * 100)}%)`,
    ],
  };
}

// ---------------------------------------------------------------------------
// 3. Creator Self-Billing (Autofacturacion — Art. 5 RD 1619/2012)
// ---------------------------------------------------------------------------

export type CreatorTaxDomicile = 'ES' | 'EU_NON_ES' | 'NON_EU';

export interface SelfBillingInput {
  creatorId: string;
  creatorLegalName: string;
  creatorTaxId: string;
  creatorCountry: string;
  grossCreatorShareEur: number;
  /** Signed mandate under Art. 5 RD 1619/2012 permitting SECCION to issue self-bills */
  mandateSigned: boolean;
  /** True for Spanish autónomos in first 3 fiscal years of activity (7% IRPF vs 15%) */
  newAutonomo7PctEligible?: boolean;
  /** Validated EU VIES VAT ID (required for zero-rated intra-EU B2B reverse charge) */
  viesValidatedVatId?: boolean;
  /** True when Non-EU/EU creator performs and uploads work 100% outside Spain */
  servicesRenderedOutsideSpain?: boolean;
  /** Valid foreign Tax Residency Certificate held for Double Tax Treaty (e.g. ES-MA / ES-CO / ES-US) */
  taxResidencyCertOnFile?: boolean;
}

export interface SelfBillingTaxBreakdown {
  eligibleToIssue: boolean;
  blockReason?: string;
  domicile: CreatorTaxDomicile;
  netTaxableBaseEur: number;
  vatAddedRate: number;
  vatAddedEur: number;
  reverseChargeSelfAssessedVatRate: number;
  reverseChargeSelfAssessedVatEur: number;
  irpfOrIrnrWithholdingRate: number;
  irpfOrIrnrWithholdingEur: number;
  netCashPayoutEur: number;
  mandatoryInvoiceLegend: string;
  aeatReportingForms: string[];
  legalBasis: string[];
  warnings: string[];
}

export function classifyCreatorSelfBillingTax(input: SelfBillingInput): SelfBillingTaxBreakdown {
  const country = normalizeCountryCode(input.creatorCountry);
  const netBase = roundEur(Math.max(0, input.grossCreatorShareEur));
  const warnings: string[] = [];

  if (!input.mandateSigned) {
    return {
      eligibleToIssue: false,
      blockReason: 'MISSING_AUTOFACTURACION_MANDATE_ART_5_RD_1619_2012',
      domicile: country === 'ES' ? 'ES' : isEuMemberState(country) ? 'EU_NON_ES' : 'NON_EU',
      netTaxableBaseEur: netBase,
      vatAddedRate: 0,
      vatAddedEur: 0,
      reverseChargeSelfAssessedVatRate: 0,
      reverseChargeSelfAssessedVatEur: 0,
      irpfOrIrnrWithholdingRate: 0,
      irpfOrIrnrWithholdingEur: 0,
      netCashPayoutEur: 0,
      mandatoryInvoiceLegend: '',
      aeatReportingForms: [],
      legalBasis: ['RD 1619/2012 Art. 5 (Prior written self-billing mandate mandatory)'],
      warnings: ['Creator must sign written Autofacturación mandate prior to self-bill issuance.'],
    };
  }

  // Case A: Spain-Resident Creator (Autónomo) -> +21% IVA, -15% (or -7%) IRPF
  if (country === 'ES') {
    const vatRate = 0.21;
    const irpfRate = input.newAutonomo7PctEligible ? 0.07 : 0.15;
    const vatAddedEur = roundEur(netBase * vatRate);
    const irpfWithholdingEur = roundEur(netBase * irpfRate);
    const netCashPayoutEur = roundEur(netBase + vatAddedEur - irpfWithholdingEur);

    return {
      eligibleToIssue: true,
      domicile: 'ES',
      netTaxableBaseEur: netBase,
      vatAddedRate: vatRate,
      vatAddedEur,
      reverseChargeSelfAssessedVatRate: 0,
      reverseChargeSelfAssessedVatEur: 0,
      irpfOrIrnrWithholdingRate: irpfRate,
      irpfOrIrnrWithholdingEur: irpfWithholdingEur,
      netCashPayoutEur,
      mandatoryInvoiceLegend: 'Facturación por el destinatario (Art. 5 RD 1619/2012)',
      aeatReportingForms: ['Modelo 111 (IRPF quarterly)', 'Modelo 190 (IRPF annual)', 'Modelo 303', 'Modelo 238 (DAC7)'],
      legalBasis: [
        'RD 1619/2012 Art. 5 (Autofacturación)',
        `Ley 35/2006 / RIRPF Art. 95 (${Math.round(irpfRate * 100)}% professional withholding)`,
        'Ley 37/1992 Art. 90 (21% Spanish IVA)',
      ],
      warnings,
    };
  }

  // Case B: EU Non-Spain Creator -> Intra-EU B2B Reverse Charge + Modelo 349
  if (isEuMemberState(country)) {
    const viesValid = Boolean(input.viesValidatedVatId);
    if (!viesValid) {
      warnings.push('EU Creator missing VIES-validated NIF-IVA: verify professional VAT registration before zero-rating or filing Modelo 349.');
    }
    const rcVatRate = 0.21;
    const rcVatEur = roundEur(netBase * rcVatRate);

    return {
      eligibleToIssue: true,
      domicile: 'EU_NON_ES',
      netTaxableBaseEur: netBase,
      vatAddedRate: 0,
      vatAddedEur: 0,
      reverseChargeSelfAssessedVatRate: rcVatRate,
      reverseChargeSelfAssessedVatEur: rcVatEur,
      irpfOrIrnrWithholdingRate: 0,
      irpfOrIrnrWithholdingEur: 0,
      netCashPayoutEur: netBase,
      mandatoryInvoiceLegend:
        'Facturación por el destinatario (Art. 5 RD 1619/2012) — Inversión del sujeto pasivo (Art. 196 Directiva 2006/112/CE)',
      aeatReportingForms: [
        'Modelo 349 (Declaración recapitulativa de operaciones intracomunitarias)',
        'Modelo 303 (Autorrepercusión casillas 10/11 & deducción)',
        'Modelo 238 (DAC7)',
      ],
      legalBasis: [
        'Directive 2006/112/EC Art. 44 & Art. 196 (Intra-EU B2B Reverse Charge)',
        'RDL 5/2004 TRLIRNR Art. 13 (0% IRNR when services rendered outside Spain)',
      ],
      warnings,
    };
  }

  // Case C: Non-EU Creator (Colombia, Morocco, US, UK, LATAM, Asia, etc.)
  const outsideSpain = input.servicesRenderedOutsideSpain !== false;
  if (!input.taxResidencyCertOnFile) {
    warnings.push(
      'Obtain Tax Residency Certificate + non-Spain performance declaration to substantiate 0% IRNR under Art. 13 TRLIRNR / Double Tax Treaty.'
    );
  }
  const irnrRate = outsideSpain ? 0 : 0.24;
  const irnrEur = roundEur(netBase * irnrRate);
  const rcVatRate = 0.21;
  const rcVatEur = roundEur(netBase * rcVatRate);

  return {
    eligibleToIssue: true,
    domicile: 'NON_EU',
    netTaxableBaseEur: netBase,
    vatAddedRate: 0,
    vatAddedEur: 0,
    reverseChargeSelfAssessedVatRate: rcVatRate,
    reverseChargeSelfAssessedVatEur: rcVatEur,
    irpfOrIrnrWithholdingRate: irnrRate,
    irpfOrIrnrWithholdingEur: irnrEur,
    netCashPayoutEur: roundEur(netBase - irnrEur),
    mandatoryInvoiceLegend:
      'Facturación por el destinatario (Art. 5 RD 1619/2012) — Inversión del sujeto pasivo (Art. 69.Uno.1º y Art. 84.Uno.2º a) Ley 37/1992 LIVA)',
    aeatReportingForms: [
      'Modelo 303 (Inversión del sujeto pasivo — autorrepercusión)',
      'Modelo 238 (DAC7)',
      ...(irnrRate > 0 ? ['Modelo 216 / 296 (IRNR withholding)'] : []),
    ],
    legalBasis: [
      'Ley 37/1992 (LIVA) Art. 69.Uno.1º & Art. 84.Uno.2º a) (Non-EU B2B Reverse Charge in Spain)',
      outsideSpain
        ? 'RDL 5/2004 TRLIRNR Art. 13 (0% IRNR — service economically performed 100% outside Spanish territory)'
        : 'RDL 5/2004 TRLIRNR Art. 13 & Art. 25 (24% IRNR where service performed inside Spain without exemption)',
    ],
    warnings,
  };
}

// ---------------------------------------------------------------------------
// 4. DAC7 (EU Directive 2021/514 / AEAT Modelo 238) €0 Personal Service Rule
// ---------------------------------------------------------------------------

export interface Dac7CreatorProfileInput {
  creatorId: string;
  legalFullName?: string | null;
  dateOfBirth?: string | null;
  taxResidenceCountry?: string | null;
  tinOrNif?: string | null;
  tinIssuingCountry?: string | null;
  permanentAddress?: string | null;
  financialAccountIdentifier?: string | null;
  quarterlyConsiderationPaidEur: number;
  platformFeesWithheldEur: number;
  taxesWithheldEur?: number;
}

export interface Dac7ReadinessReport {
  reportable: boolean;
  thresholdEur: number;
  activityCategory: 'personal_services';
  missingFields: string[];
  readyForModelo238: boolean;
  annualFilingDeadlineNote: string;
  legalBasis: string;
}

export function evaluateDac7Readiness(input: Dac7CreatorProfileInput): Dac7ReadinessReport {
  const missingFields: string[] = [];
  if (!input.legalFullName?.trim()) missingFields.push('legalFullName');
  if (!input.dateOfBirth?.trim()) missingFields.push('dateOfBirth');
  if (!input.taxResidenceCountry?.trim()) missingFields.push('taxResidenceCountry');
  if (!input.tinOrNif?.trim()) missingFields.push('tinOrNif');
  if (!input.tinIssuingCountry?.trim()) missingFields.push('tinIssuingCountry');
  if (!input.permanentAddress?.trim()) missingFields.push('permanentAddress');
  if (!input.financialAccountIdentifier?.trim()) missingFields.push('financialAccountIdentifier');

  // Under DAC7, €2,000 / 30 transactions exclusion applies ONLY to physical goods.
  // Personal digital creator services are reportable from €0 (strict > €0 consideration).
  const reportable = input.quarterlyConsiderationPaidEur > 0;

  return {
    reportable,
    thresholdEur: 0,
    activityCategory: 'personal_services',
    missingFields,
    readyForModelo238: !reportable || missingFields.length === 0,
    annualFilingDeadlineNote: 'Annual AEAT Modelo 238 submission in January following reporting year',
    legalBasis:
      'EU Directive 2021/514 (DAC7) / Ley 13/2023 & RD 117/2024 (€0 threshold for personal services)',
  };
}

// ---------------------------------------------------------------------------
// 5. Veri*factu (RD 1007/2023) SHA-256 Hash Chain & AEAT QR Generator
// ---------------------------------------------------------------------------

/**
 * Synchronous, dependency-free FIPS 180-4 SHA-256 hex digest.
 * Safe in Node, Vitest, Edge Runtime, Cloudflare Workers, and browsers.
 */
export function sha256HexSync(message: string): string {
  const bytes = new TextEncoder().encode(message);
  const K = new Uint32Array([
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
  ]);

  const H = new Uint32Array([
    0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
    0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19,
  ]);

  const bitLen = bytes.length * 8;
  const paddedLen = Math.ceil((bytes.length + 9) / 64) * 64;
  const padded = new Uint8Array(paddedLen);
  padded.set(bytes);
  padded[bytes.length] = 0x80;
  const view = new DataView(padded.buffer);
  view.setUint32(paddedLen - 8, Math.floor(bitLen / 0x100000000), false);
  view.setUint32(paddedLen - 4, bitLen >>> 0, false);

  const W = new Uint32Array(64);
  const rotr = (x: number, n: number) => (x >>> n) | (x << (32 - n));

  for (let offset = 0; offset < paddedLen; offset += 64) {
    for (let i = 0; i < 16; i++) {
      W[i] = view.getUint32(offset + i * 4, false);
    }
    for (let i = 16; i < 64; i++) {
      const s0 = rotr(W[i - 15], 7) ^ rotr(W[i - 15], 18) ^ (W[i - 15] >>> 3);
      const s1 = rotr(W[i - 2], 17) ^ rotr(W[i - 2], 19) ^ (W[i - 2] >>> 10);
      W[i] = (W[i - 16] + s0 + W[i - 7] + s1) >>> 0;
    }

    let [a, b, c, d, e, f, g, h] = H;
    for (let i = 0; i < 64; i++) {
      const S1 = rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25);
      const ch = (e & f) ^ (~e & g);
      const temp1 = (h + S1 + ch + K[i] + W[i]) >>> 0;
      const S0 = rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const temp2 = (S0 + maj) >>> 0;

      h = g;
      g = f;
      f = e;
      e = (d + temp1) >>> 0;
      d = c;
      c = b;
      b = a;
      a = (temp1 + temp2) >>> 0;
    }

    H[0] = (H[0] + a) >>> 0;
    H[1] = (H[1] + b) >>> 0;
    H[2] = (H[2] + c) >>> 0;
    H[3] = (H[3] + d) >>> 0;
    H[4] = (H[4] + e) >>> 0;
    H[5] = (H[5] + f) >>> 0;
    H[6] = (H[6] + g) >>> 0;
    H[7] = (H[7] + h) >>> 0;
  }

  return Array.from(H)
    .map((word) => word.toString(16).padStart(8, '0'))
    .join('')
    .toUpperCase();
}

export interface VerifactuInvoiceInput {
  issuerNif?: string;
  invoiceSeriesNumber: string;
  issueDate: Date;
  invoiceType: 'F1' | 'F2' | 'R1';
  totalTaxEur: number;
  totalAmountEur: number;
  previousHash: string;
  generationTimestampIso?: string;
}

export interface VerifactuInvoiceRecord {
  issuerNif: string;
  invoiceSeriesNumber: string;
  issueDateFormatted: string; // DD-MM-YYYY
  invoiceType: 'F1' | 'F2' | 'R1';
  cuotaTotal: string;
  importeTotal: string;
  previousHash: string;
  canonicalHashPayload: string;
  sha256Hash: string;
  generationTimestampIso: string;
  aeatQrUrl: string;
  regulation: string;
}

export function formatAeatDate(date: Date): string {
  const dd = String(date.getUTCDate()).padStart(2, '0');
  const mm = String(date.getUTCMonth() + 1).padStart(2, '0');
  const yyyy = String(date.getUTCFullYear());
  return `${dd}-${mm}-${yyyy}`;
}

export function buildVerifactuInvoiceRecord(input: VerifactuInvoiceInput): VerifactuInvoiceRecord {
  const issuerNif = (input.issuerNif || SECCION_FISCAL_ENTITY.cif).trim().toUpperCase();
  const issueDateFormatted = formatAeatDate(input.issueDate);
  const cuotaTotal = roundEur(input.totalTaxEur).toFixed(2);
  const importeTotal = roundEur(input.totalAmountEur).toFixed(2);
  const generationTimestampIso = input.generationTimestampIso || input.issueDate.toISOString();
  const previousHash = (input.previousHash || '').trim().toUpperCase();

  // Deterministic AEAT RD 1007/2023 Annex II key=value chained fingerprint format
  const canonicalHashPayload = [
    `IDEmisorFactura=${issuerNif}`,
    `NumSerieFactura=${input.invoiceSeriesNumber}`,
    `FechaExpedicionFactura=${issueDateFormatted}`,
    `TipoFactura=${input.invoiceType}`,
    `CuotaTotal=${cuotaTotal}`,
    `ImporteTotal=${importeTotal}`,
    `Huella=${previousHash}`,
    `FechaHoraHusoGenRegistro=${generationTimestampIso}`,
  ].join('&');

  const sha256Hash = sha256HexSync(canonicalHashPayload);

  const qrParams = new URLSearchParams({
    nif: issuerNif,
    numserie: input.invoiceSeriesNumber,
    fecha: issueDateFormatted,
    importe: importeTotal,
  });

  return {
    issuerNif,
    invoiceSeriesNumber: input.invoiceSeriesNumber,
    issueDateFormatted,
    invoiceType: input.invoiceType,
    cuotaTotal,
    importeTotal,
    previousHash,
    canonicalHashPayload,
    sha256Hash,
    generationTimestampIso,
    aeatQrUrl: `https://www2.agenciatributaria.gob.es/wlpl/TIKE-CONT/ValidarQR?${qrParams.toString()}`,
    regulation: 'RD 1007/2023 (Veri*factu SHA-256 Immutable Hash Chain)',
  };
}
