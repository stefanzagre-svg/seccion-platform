import { describe, it, expect } from 'vitest';
import {
  ART_24B_RETENTION_YEARS,
  EU_STANDARD_VAT_RATES,
  buildVerifactuInvoiceRecord,
  calculateCheckoutVat,
  classifyCreatorSelfBillingTax,
  evaluateDac7Readiness,
  isEuMemberState,
  isSpanishSpecialTaxTerritory,
  sha256HexSync,
  validateArt24bLocationProofs,
} from './eu-tax-engine';

describe('EU-27 2026 Tax Matrix & Geographic Normalization', () => {
  it('contains all 27 EU member states with verified 2026 standard VAT rates', () => {
    expect(Object.keys(EU_STANDARD_VAT_RATES)).toHaveLength(27);
    expect(EU_STANDARD_VAT_RATES.EE).toBe(0.24);
    expect(EU_STANDARD_VAT_RATES.FI).toBe(0.255);
    expect(EU_STANDARD_VAT_RATES.RO).toBe(0.21);
    expect(EU_STANDARD_VAT_RATES.SK).toBe(0.23);
    expect(EU_STANDARD_VAT_RATES.LU).toBe(0.17);
    expect(EU_STANDARD_VAT_RATES.HU).toBe(0.27);
    expect(isEuMemberState('EL')).toBe(true); // Greece tax code alias
    expect(isEuMemberState('GB')).toBe(false);
    expect(isEuMemberState('UK')).toBe(false);
    expect(isEuMemberState('CO')).toBe(false);
    expect(isEuMemberState('MA')).toBe(false);
  });

  it('recognizes Canary Islands, Ceuta, and Melilla as outside EU VAT scope', () => {
    expect(isSpanishSpecialTaxTerritory('ES', '35001')).toBe(true);
    expect(isSpanishSpecialTaxTerritory('ES', '38004')).toBe(true);
    expect(isSpanishSpecialTaxTerritory('ES', '51001')).toBe(true);
    expect(isSpanishSpecialTaxTerritory('ES', '52002')).toBe(true);
    expect(isSpanishSpecialTaxTerritory('ES', '03001')).toBe(false);
  });
});

describe('CJEU C-695/20 Fenix Deemed Supplier Checkout VAT & OSS Engine', () => {
  it('adds Spanish 21% IVA on top of Net Base and protects 90% Creator split', () => {
    const res = calculateCheckoutVat({
      netBaseEur: 100,
      customerCountry: 'ES',
      creatorShareRate: 0.9,
    });

    expect(res.vatRate).toBe(0.21);
    expect(res.vatAmountEur).toBe(21);
    expect(res.grossTotalEur).toBe(121);
    expect(res.creatorEarningsEur).toBe(90); // 90% of Net Base — zero VAT leakage
    expect(res.platformFeeNetEur).toBe(10);
    expect(res.taxRegime).toBe('ES_DOMESTIC_IVA');
    expect(res.aeatReturnForm).toBe('Modelo 303');
  });

  it('charges EU destination OSS VAT under Modelo 369 when OSS active or >= €10,000', () => {
    const fi = calculateCheckoutVat({
      netBaseEur: 100,
      customerCountry: 'FI',
      instrumentType: 'spv',
      euCrossBorderAnnualEur: 15_000,
    });
    expect(fi.vatRate).toBe(0.255);
    expect(fi.vatAmountEur).toBe(25.5);
    expect(fi.grossTotalEur).toBe(125.5);
    expect(fi.creatorEarningsEur).toBe(90);
    expect(fi.taxRegime).toBe('EU_OSS_MODELO_369');
    expect(fi.aeatReturnForm).toBe('Modelo 369');
  });

  it('applies 21% ES origin VAT under €10,000 micro-business threshold when OSS is not opted in', () => {
    const deUnder = calculateCheckoutVat({
      netBaseEur: 50,
      customerCountry: 'DE',
      euCrossBorderAnnualEur: 4_500,
      ossRegistered: false,
    });
    expect(deUnder.vatRate).toBe(0.21);
    expect(deUnder.vatAmountEur).toBe(10.5);
    expect(deUnder.grossTotalEur).toBe(60.5);
    expect(deUnder.taxRegime).toBe('EU_UNDER_10K_ORIGIN_ES');
    expect(deUnder.ossThresholdApplied).toBe(true);
    expect(deUnder.aeatReturnForm).toBe('Modelo 303');
  });

  it('applies 0% VAT for Non-EU buyers (US, CO, MA) and Spanish special territories', () => {
    const us = calculateCheckoutVat({ netBaseEur: 100, customerCountry: 'US' });
    expect(us.vatRate).toBe(0);
    expect(us.vatAmountEur).toBe(0);
    expect(us.grossTotalEur).toBe(100);
    expect(us.taxRegime).toBe('NON_EU_EXPORT_0');

    const tf = calculateCheckoutVat({
      netBaseEur: 100,
      customerCountry: 'ES',
      postalCode: '38001',
    });
    expect(tf.vatRate).toBe(0);
    expect(tf.taxRegime).toBe('ES_SPECIAL_TERRITORY_0');
  });

  it('defers VAT at issuance for Multi-Purpose Vouchers (MPV)', () => {
    const mpv = calculateCheckoutVat({
      netBaseEur: 100,
      customerCountry: 'FR',
      instrumentType: 'mpv',
    });
    expect(mpv.vatRate).toBe(0);
    expect(mpv.vatTiming).toBe('deferred_at_redemption');
    expect(mpv.taxRegime).toBe('MPV_DEFERRED_REDEMPTION');
  });
});

describe('Art. 24b / Art. 24f 10-Year Customer Location Proof Validator', () => {
  it('accepts 2 non-contradictory foreign proofs with 10-year retention timestamp', () => {
    const ref = new Date('2026-11-12T00:00:00Z');
    const res = validateArt24bLocationProofs(
      'FR',
      [
        { type: 'geo_ip', countryCode: 'FR' },
        { type: 'card_bin_country', countryCode: 'FR' },
      ],
      ref
    );

    expect(res.valid).toBe(true);
    expect(res.resolvedCountry).toBe('FR');
    expect(res.concordantProofCount).toBe(2);
    expect(res.art70DosSpainPresumptionTriggered).toBe(false);
    expect(res.retentionYears).toBe(ART_24B_RETENTION_YEARS);
    expect(res.retainUntilIso.startsWith('2036-12-31')).toBe(true);
  });

  it('falls back to ES under Art. 70.Dos when ES IP conflicts with foreign declaration without 2 concordant proofs', () => {
    const res = validateArt24bLocationProofs('US', [
      { type: 'geo_ip', countryCode: 'ES' },
      { type: 'billing_address', countryCode: 'US' },
    ]);

    expect(res.valid).toBe(false);
    expect(res.resolvedCountry).toBe('ES');
    expect(res.art70DosSpainPresumptionTriggered).toBe(true);

    const vat = calculateCheckoutVat({
      netBaseEur: 100,
      customerCountry: 'US',
      locationProofs: [
        { type: 'geo_ip', countryCode: 'ES' },
        { type: 'billing_address', countryCode: 'US' },
      ],
    });
    expect(vat.effectiveCountry).toBe('ES');
    expect(vat.vatRate).toBe(0.21);
  });
});

describe('Creator Self-Billing (Autofacturación Art. 5 RD 1619/2012) & DAC7', () => {
  it('blocks issuance without signed Art. 5 RD 1619/2012 mandate', () => {
    const res = classifyCreatorSelfBillingTax({
      creatorId: 'c1',
      creatorLegalName: 'Ana Garcia',
      creatorTaxId: '12345678Z',
      creatorCountry: 'ES',
      grossCreatorShareEur: 1000,
      mandateSigned: false,
    });
    expect(res.eligibleToIssue).toBe(false);
    expect(res.blockReason).toBe('MISSING_AUTOFACTURACION_MANDATE_ART_5_RD_1619_2012');
  });

  it('calculates Spanish autónomo +21% IVA and -15% (or -7%) IRPF withholding', () => {
    const standardEs = classifyCreatorSelfBillingTax({
      creatorId: 'c1',
      creatorLegalName: 'Ana Garcia',
      creatorTaxId: '12345678Z',
      creatorCountry: 'ES',
      grossCreatorShareEur: 1000,
      mandateSigned: true,
    });
    expect(standardEs.eligibleToIssue).toBe(true);
    expect(standardEs.vatAddedEur).toBe(210);
    expect(standardEs.irpfOrIrnrWithholdingEur).toBe(150);
    expect(standardEs.netCashPayoutEur).toBe(1060);
    expect(standardEs.aeatReportingForms).toContain('Modelo 111 (IRPF quarterly)');

    const newAutonomo = classifyCreatorSelfBillingTax({
      creatorId: 'c2',
      creatorLegalName: 'Lucia Perez',
      creatorTaxId: '87654321X',
      creatorCountry: 'ES',
      grossCreatorShareEur: 1000,
      mandateSigned: true,
      newAutonomo7PctEligible: true,
    });
    expect(newAutonomo.irpfOrIrnrWithholdingRate).toBe(0.07);
    expect(newAutonomo.irpfOrIrnrWithholdingEur).toBe(70);
    expect(newAutonomo.netCashPayoutEur).toBe(1140);
  });

  it('calculates EU non-ES intra-community reverse charge + Modelo 349', () => {
    const fr = classifyCreatorSelfBillingTax({
      creatorId: 'c3',
      creatorLegalName: 'Camille Laurent',
      creatorTaxId: 'FR12345678901',
      creatorCountry: 'FR',
      grossCreatorShareEur: 900,
      mandateSigned: true,
      viesValidatedVatId: true,
    });
    expect(fr.domicile).toBe('EU_NON_ES');
    expect(fr.vatAddedEur).toBe(0);
    expect(fr.reverseChargeSelfAssessedVatEur).toBe(189);
    expect(fr.netCashPayoutEur).toBe(900);
    expect(fr.aeatReportingForms.some((f) => f.includes('Modelo 349'))).toBe(true);
  });

  it('applies Art. 69.Uno.1º + 84.Uno.2º a) Reverse Charge and 0% Art. 13 TRLIRNR for Non-EU creators outside Spain', () => {
    const co = classifyCreatorSelfBillingTax({
      creatorId: 'c4',
      creatorLegalName: 'Sofia Rodriguez',
      creatorTaxId: 'CO-10203040',
      creatorCountry: 'CO',
      grossCreatorShareEur: 500,
      mandateSigned: true,
      servicesRenderedOutsideSpain: true,
      taxResidencyCertOnFile: true,
    });
    expect(co.domicile).toBe('NON_EU');
    expect(co.vatAddedEur).toBe(0);
    expect(co.reverseChargeSelfAssessedVatEur).toBe(105);
    expect(co.irpfOrIrnrWithholdingRate).toBe(0);
    expect(co.netCashPayoutEur).toBe(500);
    expect(co.mandatoryInvoiceLegend).toContain('69.Uno.1');
    expect(co.mandatoryInvoiceLegend).toContain('84.Uno.2');
  });

  it('enforces DAC7 Modelo 238 reporting from €0 for personal services', () => {
    const dac7 = evaluateDac7Readiness({
      creatorId: 'c5',
      legalFullName: 'Sofia Rodriguez',
      dateOfBirth: '1999-04-12',
      taxResidenceCountry: 'CO',
      tinOrNif: null,
      quarterlyConsiderationPaidEur: 1, // Even €1 is reportable!
      platformFeesWithheldEur: 0.11,
    });
    expect(dac7.reportable).toBe(true);
    expect(dac7.thresholdEur).toBe(0);
    expect(dac7.readyForModelo238).toBe(false);
    expect(dac7.missingFields).toContain('tinOrNif');
  });
});

describe('Veri*factu (RD 1007/2023) SHA-256 Chain & AEAT QR Generator', () => {
  it('matches NIST FIPS 180-4 SHA-256 reference vectors', () => {
    expect(sha256HexSync('')).toBe(
      'E3B0C44298FC1C149AFBF4C8996FB92427AE41E4649B934CA495991B7852B855'
    );
    expect(sha256HexSync('abc')).toBe(
      'BA7816BF8F01CFEA414140DE5DAE2223B00361A396177A9CB410FF61F20015AD'
    );
  });

  it('links consecutive self-bill hashes and builds official AEAT ValidarQR URL', () => {
    const rec1 = buildVerifactuInvoiceRecord({
      issuerNif: 'B05765441',
      invoiceSeriesNumber: 'AF-2026-0001',
      issueDate: new Date('2026-11-12T12:00:00Z'),
      invoiceType: 'F1',
      totalTaxEur: 21,
      totalAmountEur: 121,
      previousHash: '',
      generationTimestampIso: '2026-11-12T12:00:00Z',
    });
    expect(rec1.issueDateFormatted).toBe('12-11-2026');
    expect(rec1.sha256Hash).toHaveLength(64);
    expect(rec1.aeatQrUrl).toContain('https://www2.agenciatributaria.gob.es/wlpl/TIKE-CONT/ValidarQR');
    expect(rec1.aeatQrUrl).toContain('numserie=AF-2026-0001');

    const rec2 = buildVerifactuInvoiceRecord({
      issuerNif: 'B05765441',
      invoiceSeriesNumber: 'AF-2026-0002',
      issueDate: new Date('2026-11-12T12:05:00Z'),
      invoiceType: 'F1',
      totalTaxEur: 0,
      totalAmountEur: 90,
      previousHash: rec1.sha256Hash,
      generationTimestampIso: '2026-11-12T12:05:00Z',
    });
    expect(rec2.previousHash).toBe(rec1.sha256Hash);
    expect(rec2.sha256Hash).not.toBe(rec1.sha256Hash);
  });
});
