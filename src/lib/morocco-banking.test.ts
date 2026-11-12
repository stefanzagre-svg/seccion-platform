import { describe, it, expect } from 'vitest';
import {
  calculateMoroccoRibKey,
  convertRibToMoroccanIban,
  verifyMoroccanIban,
  validateMoroccanRib,
  cleanMoroccanRib,
  formatMoroccanRib,
  formatMoroccanIban,
  getMoroccanBankByCode,
  getMoroccanCreatorFxNotice,
  MOROCCAN_BANKS,
} from './morocco-banking';

describe('Moroccan Banking & 24-Digit RIB Standards (Task 3)', () => {
  describe('Bank Code Directory & SWIFT BICs', () => {
    it('contains all major commercial Moroccan banks', () => {
      expect(MOROCCAN_BANKS['007']).toBeDefined();
      expect(MOROCCAN_BANKS['007'].name).toContain('Attijariwafa');
      expect(MOROCCAN_BANKS['007'].bic).toBe('BCMADMMC');

      expect(MOROCCAN_BANKS['230']).toBeDefined();
      expect(MOROCCAN_BANKS['230'].name).toContain('CIH');
      expect(MOROCCAN_BANKS['230'].bic).toBe('CIHMMAMC');

      expect(MOROCCAN_BANKS['011']).toBeDefined();
      expect(MOROCCAN_BANKS['011'].name).toContain('BMCE');
      expect(MOROCCAN_BANKS['011'].bic).toBe('BMCEMAMC');

      expect(MOROCCAN_BANKS['190']).toBeDefined();
      expect(MOROCCAN_BANKS['190'].name).toContain('Banque Centrale Populaire');
      expect(MOROCCAN_BANKS['190'].bic).toBe('BCPMMAMC');

      expect(MOROCCAN_BANKS['310']).toBeDefined();
      expect(MOROCCAN_BANKS['310'].name).toContain('Al Barid Bank');
      expect(MOROCCAN_BANKS['310'].bic).toBe('PABAMAMC');
    });

    it('retrieves bank info using getMoroccanBankByCode', () => {
      const bank = getMoroccanBankByCode('007');
      expect(bank).not.toBeNull();
      expect(bank?.shortName).toBe('Attijariwafa');
      expect(bank?.bic).toBe('BCMADMMC');

      const cih = getMoroccanBankByCode('230');
      expect(cih?.shortName).toBe('CIH Bank');
      expect(cih?.bic).toBe('CIHMMAMC');

      expect(getMoroccanBankByCode('999')).toBeNull();
    });
  });

  describe('RIB Check Key (Clé RIB) Calculation & Cleansing', () => {
    it('calculates exact 2-digit check key using modulo 97', () => {
      // Test sample: Bank 007, Branch 780, Account 0001234567890123
      const key = calculateMoroccoRibKey('007', '780', '0001234567890123');
      expect(key).toBe('96');
      expect(key.length).toBe(2);
    });

    it('cleanses raw RIB strings with spaces, hyphens, and dots', () => {
      const formatted = '007 780 0001234567890123 96';
      expect(cleanMoroccanRib(formatted)).toBe('007780000123456789012396');

      const dashed = '007-780-0001234567890123-96';
      expect(cleanMoroccanRib(dashed)).toBe('007780000123456789012396');
    });

    it('formats 24-digit RIB into standard bank grouping', () => {
      const raw = '007780000123456789012396';
      expect(formatMoroccanRib(raw)).toBe('007 780 0001234567890123 96');
    });
  });

  describe('ISO 13616 Moroccan IBAN Derivation', () => {
    it('derives a valid 28-character Moroccan IBAN from a 24-digit RIB', () => {
      const rib = '007780000123456789012396';
      const iban = convertRibToMoroccanIban(rib);

      expect(iban).toBe('MA64007780000123456789012396');
      expect(iban.length).toBe(28);
      expect(verifyMoroccanIban(iban)).toBe(true);
      expect(formatMoroccanIban(iban)).toBe('MA64 0077 8000 0123 4567 8901 2396');
    });

    it('rejects invalid IBAN check digits', () => {
      // Bit-flip check digits: MA64 -> MA65
      expect(verifyMoroccanIban('MA65007780000123456789012396')).toBe(false);
      expect(verifyMoroccanIban('ES64007780000123456789012396')).toBe(false);
      expect(verifyMoroccanIban('MA6400778000012345678901239')).toBe(false); // short
    });
  });

  describe('Comprehensive RIB Validation (validateMoroccanRib)', () => {
    it('validates a genuine Attijariwafa Bank RIB', () => {
      const rawRib = '007 780 0001234567890123 96';
      const result = validateMoroccanRib(rawRib);

      expect(result.isValid).toBe(true);
      expect(result.cleanRib).toBe('007780000123456789012396');
      expect(result.bankCode).toBe('007');
      expect(result.branchCode).toBe('780');
      expect(result.accountNumber).toBe('0001234567890123');
      expect(result.checkKey).toBe('96');
      expect(result.bankInfo?.shortName).toBe('Attijariwafa');
      expect(result.bankInfo?.bic).toBe('BCMADMMC');
      expect(result.iban).toBe('MA64007780000123456789012396');
    });

    it('validates a genuine CIH Bank RIB', () => {
      // Calculate key for CIH (code 230)
      const cihKey = calculateMoroccoRibKey('230', '810', '0000987654321098');
      const cihRib = `230 810 0000987654321098 ${cihKey}`;

      const result = validateMoroccanRib(cihRib);
      expect(result.isValid).toBe(true);
      expect(result.bankCode).toBe('230');
      expect(result.bankInfo?.shortName).toBe('CIH Bank');
      expect(result.bankInfo?.bic).toBe('CIHMMAMC');
      expect(result.iban?.startsWith('MA')).toBe(true);
    });

    it('validates a genuine BMCE Bank of Africa RIB', () => {
      const bmceKey = calculateMoroccoRibKey('011', '010', '1234567890123456');
      const bmceRib = `011 010 1234567890123456 ${bmceKey}`;

      const result = validateMoroccanRib(bmceRib);
      expect(result.isValid).toBe(true);
      expect(result.bankCode).toBe('011');
      expect(result.bankInfo?.shortName).toBe('Bank of Africa');
      expect(result.bankInfo?.bic).toBe('BMCEMAMC');
    });

    it('accepts full 28-character Moroccan IBAN input and extracts RIB', () => {
      const fullIban = 'MA64 0077 8000 0123 4567 8901 2396';
      const result = validateMoroccanRib(fullIban);

      expect(result.isValid).toBe(true);
      expect(result.cleanRib).toBe('007780000123456789012396');
      expect(result.bankCode).toBe('007');
      expect(result.bankInfo?.bic).toBe('BCMADMMC');
    });

    it('rejects an invalid check key with helpful error message', () => {
      // Real key is 96, but user entered 95
      const invalidKeyRib = '007 780 0001234567890123 95';
      const result = validateMoroccanRib(invalidKeyRib);

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Clé RIB invalide');
      expect(result.calculatedKey).toBe('96');
      expect(result.checkKey).toBe('95');
    });

    it('rejects short or non-numeric RIBs', () => {
      expect(validateMoroccanRib('0077800001234567890123').isValid).toBe(false); // 22 chars
      expect(validateMoroccanRib('0077800001234567890123969').isValid).toBe(false); // 25 chars
      expect(validateMoroccanRib('0077800001234567890123AB').isValid).toBe(false); // non-numeric
      expect(validateMoroccanRib('').isValid).toBe(false);
    });
  });

  describe('Regulatory Guidance Notice', () => {
    it('returns accurate localized guidance across FR, ES, EN', () => {
      const frNotice = getMoroccanCreatorFxNotice('fr');
      expect(frNotice.description).toContain('Office des Changes');
      expect(frNotice.description).toContain('Formule 5');
      expect(frNotice.taxTreaty).toContain('Art. 14');
      expect(frNotice.taxTreaty).toContain('0% de retenue');

      const esNotice = getMoroccanCreatorFxNotice('es');
      expect(esNotice.description).toContain('Fórmula 5');
      expect(esNotice.taxTreaty).toContain('0% de retención');

      const enNotice = getMoroccanCreatorFxNotice('en');
      expect(enNotice.description).toContain('Formule 5');
      expect(enNotice.taxTreaty).toContain('0% Spanish IRNR withholding tax');
    });
  });
});
