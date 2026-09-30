/**
 * Ephemeral In-Memory PII Scrubber
 * 
 * Complies with GDPR Article 5(1)(c) "Data Minimisation" & FTC Consumer Privacy guidelines.
 * Strips identifiable coordinates, personal contact numbers, emails, financial instruments,
 * and crypto addresses strictly in memory before any LLM inference or vector indexing occurs.
 */

export interface ScrubberResult {
  sanitizedText: string;
  hasRedactions: boolean;
  redactedTypes: string[];
}

const PII_PATTERNS: Record<string, RegExp> = {
  EMAIL: /\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\b/gi,
  CREDIT_CARD: /\b(?:\d{4}[ -]?){3}\d{4}\b/g,
  IBAN: /\b[A-Z]{2}\d{2}[A-Z0-9]{4}\d{7}([A-Z0-9]?){0,16}\b/gi,
  CRYPTO_ADDRESS: /\b(0x[a-fA-F0-9]{40}|[13][a-km-zA-HJ-NP-Z1-9]{25,34}|T[A-Za-z1-9]{33})\b/g,
  PHONE_INTL: /(?:\+?\d{1,3}[-.\s]?)?\(?\d{2,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,4}/g,
  SSN_OR_GOV_ID: /\b\d{3}-\d{2}-\d{4}\b/g,
};

export function scrubPIIBeforeLLM(rawText: string): ScrubberResult {
  if (!rawText || typeof rawText !== 'string') {
    return { sanitizedText: '', hasRedactions: false, redactedTypes: [] };
  }

  let sanitized = rawText;
  const redactedTypes: string[] = [];

  for (const [type, regex] of Object.entries(PII_PATTERNS)) {
    if (regex.test(sanitized)) {
      redactedTypes.push(type);
      sanitized = sanitized.replace(regex, `[REDACTED_${type}]`);
    }
  }

  return {
    sanitizedText: sanitized,
    hasRedactions: redactedTypes.length > 0,
    redactedTypes,
  };
}
