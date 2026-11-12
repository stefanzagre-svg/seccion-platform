import { describe, it, expect } from 'vitest';
import en from '@/locales/en.json';
import es from '@/locales/es.json';
import fr from '@/locales/fr.json';
import { LOCALES, SupportedLocale } from '@/context/LanguageContext';

function flattenKeys(obj: any, prefix = ''): string[] {
  let keys: string[] = [];
  if (obj && typeof obj === 'object') {
    for (const [k, v] of Object.entries(obj)) {
      const full = prefix ? `${prefix}.${k}` : k;
      if (v && typeof v === 'object' && !Array.isArray(v)) {
        keys = keys.concat(flattenKeys(v, full));
      } else {
        keys.push(full);
      }
    }
  }
  return keys;
}

export function detectSupportedLocale(navigatorLanguage: string): SupportedLocale {
  const clean = (navigatorLanguage || '').toLowerCase();
  if (clean.startsWith('fr')) return 'fr';
  if (clean.startsWith('es')) return 'es';
  return 'en';
}

describe('Multilingual i18n Invariants (EN / ES / FR)', () => {
  it('registers French (FR) in LOCALES metadata with proper flag and LTR direction', () => {
    expect(LOCALES.fr).toBeDefined();
    expect(LOCALES.fr.code).toBe('fr');
    expect(LOCALES.fr.name).toBe('French');
    expect(LOCALES.fr.nativeName).toBe('Français');
    expect(LOCALES.fr.flag).toBe('🇫🇷');
    expect(LOCALES.fr.dir).toBe('ltr');
  });

  it('guarantees 100% top-level section parity between EN and FR', () => {
    const enSections = Object.keys(en).sort();
    const frSections = Object.keys(fr).sort();
    expect(frSections).toEqual(enSections);
    expect(frSections.length).toBe(34);
  });

  it('guarantees 100% leaf key parity between EN and FR with zero missing keys', () => {
    const enKeys = new Set(flattenKeys(en));
    const frKeys = new Set(flattenKeys(fr));

    const missingInFr = [...enKeys].filter((k) => !frKeys.has(k));
    const extraInFr = [...frKeys].filter((k) => !enKeys.has(k));

    expect(missingInFr).toEqual([]);
    expect(extraInFr).toEqual([]);
    expect(frKeys.size).toBe(enKeys.size);
  });

  it('accurately detects French, Spanish, and English browser language prefixes', () => {
    expect(detectSupportedLocale('fr-FR')).toBe('fr');
    expect(detectSupportedLocale('fr-CA')).toBe('fr');
    expect(detectSupportedLocale('fr')).toBe('fr');
    expect(detectSupportedLocale('es-ES')).toBe('es');
    expect(detectSupportedLocale('es-CO')).toBe('es');
    expect(detectSupportedLocale('es')).toBe('es');
    expect(detectSupportedLocale('en-US')).toBe('en');
    expect(detectSupportedLocale('en-GB')).toBe('en');
    expect(detectSupportedLocale('de-DE')).toBe('en'); // fallback
    expect(detectSupportedLocale('')).toBe('en'); // fallback
  });

  it('enforces Math-to-Magic tone and forbids Spanish false-friends in es.json', () => {
    const esText = JSON.stringify(es).toLowerCase();
    expect(esText).not.toContain('vibración');
    expect(esText).not.toContain('vibracion');
  });

  it('contains vital French platform terms and ensures brand integrity', () => {
    const frText = JSON.stringify(fr);
    // Brand stays in all caps
    expect(frText).toContain('SECCION');
    // Key Math to Magic translations
    expect((fr as any).landing.memberFeature1Title).toBe('Synergy Sync 100% Gratuit');
    expect((fr as any).landing.memberFeature2Title).toBe('La Jauge de Chimie Relationnelle');
    expect((fr as any).landing.memberFeature4Title).toBe('Coach AI Wingman');
    expect((fr as any).nav.howWeDo).toBe('Comment Ça Marche');
    expect((fr as any).nav.becomeCreator).toBe('Devenir Créateur');
  });
});
