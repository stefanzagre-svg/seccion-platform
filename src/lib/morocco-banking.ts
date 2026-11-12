/**
 * Moroccan Banking Standards Utility (RIB & SWIFT BIC Parser)
 * 
 * Implements Bank Al-Maghrib & ISO 13616 specifications:
 * - 24-digit numeric Relevé d'Identité Bancaire (RIB)
 * - Bank Code (3 digits) + Branch Code (3 digits) + Account Number (16 digits) + Check Key (2 digits)
 * - Modulo 97 Check Key validation using BigInt
 * - Direct conversion to ISO 13616 Moroccan IBAN (28 characters: MA + 2 check digits + 24-digit RIB)
 * - Official SWIFT BIC directory for Moroccan commercial banks
 * - B2B Digital Export Invoicing & Office des Changes (IGOC Formule 5) metadata
 */

export interface MoroccanBankInfo {
  code: string;
  name: string;
  shortName: string;
  bic: string;
  country: 'MA';
}

export interface MoroccoRibValidationResult {
  isValid: boolean;
  cleanRib: string;
  formattedRib: string;
  bankCode?: string;
  branchCode?: string;
  accountNumber?: string;
  checkKey?: string;
  calculatedKey?: string;
  bankInfo: MoroccanBankInfo | null;
  iban?: string;
  formattedIban?: string;
  error?: string;
}

/**
 * Official Bank Al-Maghrib Directory of Commercial Banks & SWIFT BICs
 */
export const MOROCCAN_BANKS: Record<string, MoroccanBankInfo> = {
  '007': {
    code: '007',
    name: 'Attijariwafa Bank',
    shortName: 'Attijariwafa',
    bic: 'BCMADMMC',
    country: 'MA',
  },
  '230': {
    code: '230',
    name: 'CIH Bank (Crédit Immobilier et Hôtelier)',
    shortName: 'CIH Bank',
    bic: 'CIHMMAMC',
    country: 'MA',
  },
  '011': {
    code: '011',
    name: 'BMCE Bank of Africa',
    shortName: 'Bank of Africa',
    bic: 'BMCEMAMC',
    country: 'MA',
  },
  '190': {
    code: '190',
    name: 'Banque Centrale Populaire (BCP / Chaabi)',
    shortName: 'BCP Chaabi',
    bic: 'BCPMMAMC',
    country: 'MA',
  },
  '182': {
    code: '182',
    name: 'Banque Populaire Régionale (BCP Group)',
    shortName: 'Banque Populaire',
    bic: 'BCPMMAMC',
    country: 'MA',
  },
  '013': {
    code: '013',
    name: "BMCI (Banque Marocaine pour le Commerce et l'Industrie - BNP Paribas)",
    shortName: 'BMCI BNP Paribas',
    bic: 'BCIIMAXX',
    country: 'MA',
  },
  '021': {
    code: '021',
    name: 'Crédit du Maroc (CDM - Groupe Holmarcom)',
    shortName: 'Crédit du Maroc',
    bic: 'CDMAMAMC',
    country: 'MA',
  },
  '022': {
    code: '022',
    name: 'Société Générale Maroc (SGMB)',
    shortName: 'Société Générale',
    bic: 'SGMBMAMC',
    country: 'MA',
  },
  '225': {
    code: '225',
    name: 'Crédit Agricole du Maroc (CAM)',
    shortName: 'Crédit Agricole',
    bic: 'AGMAMAMC',
    country: 'MA',
  },
  '310': {
    code: '310',
    name: 'Al Barid Bank (Poste Maroc)',
    shortName: 'Al Barid Bank',
    bic: 'PABAMAMC',
    country: 'MA',
  },
  '175': {
    code: '175',
    name: 'CFG Bank',
    shortName: 'CFG Bank',
    bic: 'CFGBMAMC',
    country: 'MA',
  },
  '050': {
    code: '050',
    name: 'Arab Bank Maroc',
    shortName: 'Arab Bank',
    bic: 'ARABMAMC',
    country: 'MA',
  },
  '101': {
    code: '101',
    name: 'Bank of Africa Europe / Africa',
    shortName: 'Bank of Africa',
    bic: 'BMCEMAMC',
    country: 'MA',
  },
};

/**
 * Strips formatting characters from a raw RIB string
 */
export function cleanMoroccanRib(raw: string): string {
  if (!raw) return '';
  return raw.replace(/[\s\-_./]/g, '').trim();
}

/**
 * Formats a 24-digit RIB into standard bank grouping:
 * `007 780 0001234567890123 96`
 */
export function formatMoroccanRib(raw: string): string {
  const clean = cleanMoroccanRib(raw);
  if (clean.length !== 24) return clean;
  return `${clean.slice(0, 3)} ${clean.slice(3, 6)} ${clean.slice(6, 22)} ${clean.slice(22, 24)}`;
}

/**
 * Formats a 28-character Moroccan IBAN into 4-character groups:
 * `MA64 0077 8000 0123 4567 8901 2396`
 */
export function formatMoroccanIban(iban: string): string {
  const clean = iban.replace(/[\s\-_./]/g, '').toUpperCase();
  if (clean.length !== 28) return clean;
  return clean.match(/.{1,4}/g)?.join(' ') || clean;
}

/**
 * Calculates the 2-digit Moroccan RIB check key (Clé RIB)
 * Formula: 97 - ((N * 100) mod 97) where N = BankCode(3) + BranchCode(3) + AccountNumber(16)
 */
export function calculateMoroccoRibKey(bankCode: string, branchCode: string, accountNum: string): string {
  const cleanBank = bankCode.replace(/\D/g, '').padStart(3, '0').slice(-3);
  const cleanBranch = branchCode.replace(/\D/g, '').padStart(3, '0').slice(-3);
  const cleanAcc = accountNum.replace(/\D/g, '').padStart(16, '0').slice(-16);

  const full22 = `${cleanBank}${cleanBranch}${cleanAcc}`;
  const bigN = BigInt(full22);
  const remainder = Number((bigN * 100n) % 97n);
  const key = 97 - remainder;
  return String(key).padStart(2, '0');
}

/**
 * Converts a valid 24-digit Moroccan RIB into its corresponding 28-character ISO 13616 IBAN
 * Appends '221000' (MA00 numeric encoding) and applies modulo 97 check digit derivation.
 */
export function convertRibToMoroccanIban(rib24: string): string {
  const clean = cleanMoroccanRib(rib24);
  if (clean.length !== 24 || !/^\d{24}$/.test(clean)) {
    throw new Error('A valid 24-digit numeric RIB is required to derive an IBAN.');
  }

  // ISO 7064 Modulo 97-10 check digits derivation for 'MA' + check_digits + RIB
  // Step 1: Append 221000 ('M' = 22, 'A' = 10, '00' = 00)
  const numericString = `${clean}221000`;
  const remainder = Number(BigInt(numericString) % 97n);
  const checkDigits = 98 - remainder;
  const cdString = String(checkDigits).padStart(2, '0');

  return `MA${cdString}${clean}`;
}

/**
 * Verifies a 28-character Moroccan IBAN
 */
export function verifyMoroccanIban(iban: string): boolean {
  const clean = iban.replace(/[\s\-_./]/g, '').toUpperCase();
  if (clean.length !== 28 || !clean.startsWith('MA')) return false;

  const cd = clean.slice(2, 4);
  const rib = clean.slice(4);
  if (!/^\d{2}$/.test(cd) || !/^\d{24}$/.test(rib)) return false;

  // Modulo 97 verification
  const numericString = `${rib}2210${cd}`;
  return BigInt(numericString) % 97n === 1n;
}

/**
 * Looks up bank information by 3-digit bank code
 */
export function getMoroccanBankByCode(code: string): MoroccanBankInfo | null {
  if (!code) return null;
  const cleanCode = code.replace(/\D/g, '').padStart(3, '0').slice(-3);
  return MOROCCAN_BANKS[cleanCode] || null;
}

/**
 * Validates a Moroccan 24-digit RIB or 28-character Moroccan IBAN, identifying bank and SWIFT BIC
 */
export function validateMoroccanRib(raw: string): MoroccoRibValidationResult {
  if (!raw) {
    return {
      isValid: false,
      cleanRib: '',
      formattedRib: '',
      bankInfo: null,
      error: 'Le numéro RIB marocain est requis (24 chiffres numériques).',
    };
  }

  let clean = raw.replace(/[\s\-_./]/g, '').toUpperCase();

  // If user provided a Moroccan IBAN (MA + 26 chars), extract the 24-digit RIB
  if (clean.startsWith('MA')) {
    if (clean.length !== 28) {
      return {
        isValid: false,
        cleanRib: clean,
        formattedRib: clean,
        bankInfo: null,
        error: 'L\'IBAN marocain doit comporter exactement 28 caractères (MA + 26 chiffres).',
      };
    }
    if (!verifyMoroccanIban(clean)) {
      return {
        isValid: false,
        cleanRib: clean,
        formattedRib: clean,
        bankInfo: null,
        error: 'La clé de contrôle de l\'IBAN marocain est invalide.',
      };
    }
    // Extract the inner 24-digit RIB
    clean = clean.slice(4);
  }

  if (clean.length !== 24) {
    return {
      isValid: false,
      cleanRib: clean,
      formattedRib: clean,
      bankInfo: null,
      error: `Le RIB doit comporter exactement 24 chiffres (actuellement ${clean.length} caractères).`,
    };
  }

  if (!/^\d{24}$/.test(clean)) {
    return {
      isValid: false,
      cleanRib: clean,
      formattedRib: clean,
      bankInfo: null,
      error: 'Le RIB marocain ne doit contenir que des chiffres numériques.',
    };
  }

  const bankCode = clean.slice(0, 3);
  const branchCode = clean.slice(3, 6);
  const accountNumber = clean.slice(6, 22);
  const checkKey = clean.slice(22, 24);

  const calculatedKey = calculateMoroccoRibKey(bankCode, branchCode, accountNumber);
  const bankInfo = getMoroccanBankByCode(bankCode);

  if (checkKey !== calculatedKey) {
    return {
      isValid: false,
      cleanRib: clean,
      formattedRib: formatMoroccanRib(clean),
      bankCode,
      branchCode,
      accountNumber,
      checkKey,
      calculatedKey,
      bankInfo,
      error: `Clé RIB invalide (${checkKey}). La clé calculée pour ce compte est ${calculatedKey}.`,
    };
  }

  const derivedIban = convertRibToMoroccanIban(clean);

  return {
    isValid: true,
    cleanRib: clean,
    formattedRib: formatMoroccanRib(clean),
    bankCode,
    branchCode,
    accountNumber,
    checkKey,
    calculatedKey,
    bankInfo,
    iban: derivedIban,
    formattedIban: formatMoroccanIban(derivedIban),
  };
}

/**
 * Returns localized tax and foreign exchange guidance for Moroccan creators
 */
export function getMoroccanCreatorFxNotice(lang: 'en' | 'es' | 'fr' = 'fr') {
  if (lang === 'fr') {
    return {
      title: 'Conformité Bancaire Maroc & Compte en Devises (Formule 5)',
      description:
        'Virements libellés en EUR/USD depuis SECCION AI CONCEPT S.L. (Espagne). En vertu de la circulaire IGOC 2026 de l\'Office des Changes, vos revenus d\'exportation de services numériques permettent d\'alimenter jusqu\'à 70% sur votre Compte en Devises professionnel (Formule 5) et 30% en Dirhams (MAD).',
      taxTreaty:
        'Convention fiscale Espagne-Maroc (Art. 14): 0% de retenue à la source en Espagne (IRNR) sur présentation de votre facture B2B auto-générée.',
      supportedBanks: 'Compatible Attijariwafa, CIH Bank, BMCE Bank of Africa, BCP Chaabi, BMCI, Crédit du Maroc, Al Barid Bank.',
    };
  }

  if (lang === 'es') {
    return {
      title: 'Cumplimiento Bancario Marruecos y Cuenta en Divisas (Fórmula 5)',
      description:
        'Transferencias emitidas en EUR/USD desde SECCION AI CONCEPT S.L. (España). Bajo la circular IGOC 2026 de la Oficina de Cambios, los ingresos por exportación de servicios digitales permiten retener hasta el 70% en Cuenta en Divisas profesional (Fórmula 5) y 30% en Dirhams (MAD).',
      taxTreaty:
        'Convenio de Doble Imposición España-Marruecos (Art. 14): 0% de retención en España (IRNR) mediante factura B2B digital auto-generada.',
      supportedBanks: 'Compatible con Attijariwafa, CIH Bank, BMCE Bank of Africa, BCP Chaabi, BMCI, Crédit du Maroc y Al Barid Bank.',
    };
  }

  return {
    title: 'Morocco Banking Compliance & Foreign Currency Account (Formule 5)',
    description:
      'Transfers wired in EUR/USD from SECCION AI CONCEPT S.L. (Spain). Under Office des Changes IGOC 2026 regulations, digital export earnings qualify for up to 70% retention in your professional Foreign Currency Account (Formule 5) and 30% in Dirhams (MAD).',
    taxTreaty:
      'Spain-Morocco Double Taxation Treaty (Art. 14): 0% Spanish IRNR withholding tax applied on auto-generated B2B export invoices.',
    supportedBanks: 'Compatible with Attijariwafa, CIH Bank, BMCE Bank of Africa, BCP Chaabi, BMCI, Crédit du Maroc, Al Barid Bank.',
  };
}
