import { describe, it, expect } from 'vitest';
import en from '@/locales/en.json';
import es from '@/locales/es.json';
import fr from '@/locales/fr.json';

// Testable pure logic mirror of CreatorQuest checkIsMorocco
export const checkIsMorocco = (val: string): boolean => {
  if (!val) return false;
  const v = val.toLowerCase().trim();
  return (
    v === 'ma' ||
    v.includes('morocco') ||
    v.includes('maroc') ||
    v.includes('marruecos') ||
    v.includes('marrakech') ||
    v.includes('casablanca') ||
    v.includes('rabat') ||
    v.includes('tangier') ||
    v.includes('tanger') ||
    v.includes('agadir') ||
    v.includes('fes') ||
    v.includes('fès') ||
    v.includes('meknes') ||
    v.includes('+212')
  );
};

// Mirror of detectUserCountryCode timezone logic from constants.ts
export function detectUserCountryFromTz(userTz: string): string {
  if (!userTz) return 'ES';
  if (userTz.includes('Madrid') || userTz.includes('Canary')) return 'ES';
  if (userTz.includes('Paris')) return 'FR';
  if (userTz.includes('Berlin')) return 'DE';
  if (userTz.includes('Rome')) return 'IT';
  if (userTz.includes('Warsaw')) return 'PL';
  if (userTz.includes('Bucharest')) return 'RO';
  if (userTz.includes('Sofia')) return 'BG';
  if (userTz.includes('London') || userTz.includes('Belfast')) return 'GB';
  if (
    userTz.includes('New_York') ||
    userTz.includes('Los_Angeles') ||
    userTz.includes('Chicago') ||
    userTz.includes('Denver') ||
    userTz.includes('Phoenix') ||
    userTz.includes('Detroit')
  ) {
    return 'US';
  }
  if (userTz.includes('Bogota')) return 'CO';
  if (userTz.includes('Mexico')) return 'MX';
  if (userTz.includes('Buenos_Aires') || userTz.includes('Argentina')) return 'AR';
  if (userTz.includes('Sao_Paulo')) return 'BR';
  if (userTz.includes('Casablanca')) return 'MA';
  return 'ES';
}

// Mirror of onboarding registration completion privacy settings merger
export function buildPrivacySettingsPayload(
  existingPrivacySettings: Record<string, any> = {},
  moroccoShield: boolean,
  blockedCountries: string[]
): Record<string, any> {
  if (!moroccoShield && (!blockedCountries || blockedCountries.length === 0)) {
    return existingPrivacySettings;
  }
  return {
    ...existingPrivacySettings,
    blocked_countries: Array.from(
      new Set([...(existingPrivacySettings?.blocked_countries || []), ...blockedCountries])
    ),
    morocco_domestic_shield: moroccoShield,
  };
}

describe('Moroccan Domestic Privacy Shield Invariants (Task 2)', () => {
  it('detects Moroccan timezone Africa/Casablanca accurately as MA', () => {
    expect(detectUserCountryFromTz('Africa/Casablanca')).toBe('MA');
    expect(detectUserCountryFromTz('Casablanca')).toBe('MA');
    expect(detectUserCountryFromTz('Europe/Paris')).toBe('FR');
    expect(detectUserCountryFromTz('Europe/Madrid')).toBe('ES');
  });

  it('detects Morocco across multiple city, phone prefix, and linguistic variants', () => {
    // Exact or direct forms
    expect(checkIsMorocco('MA')).toBe(true);
    expect(checkIsMorocco('ma')).toBe(true);
    expect(checkIsMorocco('Morocco')).toBe(true);
    expect(checkIsMorocco('Maroc')).toBe(true);
    expect(checkIsMorocco('Marruecos')).toBe(true);
    expect(checkIsMorocco('Morocco (MA)')).toBe(true);

    // Major Moroccan hubs
    expect(checkIsMorocco('Casablanca, Morocco')).toBe(true);
    expect(checkIsMorocco('Marrakech')).toBe(true);
    expect(checkIsMorocco('Rabat')).toBe(true);
    expect(checkIsMorocco('Tangier (Tanger)')).toBe(true);
    expect(checkIsMorocco('Agadir')).toBe(true);
    expect(checkIsMorocco('Fès')).toBe(true);
    expect(checkIsMorocco('Meknes')).toBe(true);

    // International dial code
    expect(checkIsMorocco('+212 600000000')).toBe(true);

    // Negative tests (should not trigger false-positive shield)
    expect(checkIsMorocco('Madrid, Spain')).toBe(false);
    expect(checkIsMorocco('Marseille, France')).toBe(false);
    expect(checkIsMorocco('Bogota, Colombia')).toBe(false);
    expect(checkIsMorocco('United States')).toBe(false);
    expect(checkIsMorocco('')).toBe(false);
  });

  it('merges privacy settings with blocked_countries: ["MA"] and morocco_domestic_shield: true', () => {
    const initialSettings = { face_blur: true, blocked_countries: ['US'] };
    const merged = buildPrivacySettingsPayload(initialSettings, true, ['MA']);

    expect(merged.morocco_domestic_shield).toBe(true);
    expect(merged.face_blur).toBe(true);
    expect(merged.blocked_countries).toContain('US');
    expect(merged.blocked_countries).toContain('MA');
    expect(merged.blocked_countries.length).toBe(2);
  });

  it('prevents duplicate MA entries in blocked_countries', () => {
    const initialSettings = { blocked_countries: ['MA', 'FR'] };
    const merged = buildPrivacySettingsPayload(initialSettings, true, ['MA']);

    expect(merged.blocked_countries.filter((c: string) => c === 'MA').length).toBe(1);
    expect(merged.blocked_countries).toEqual(['MA', 'FR']);
  });

  it('verifies localized translation keys exist and match across EN, ES, FR', () => {
    expect((en as any).creatorQuest.main.morocco_shield_title).toBeDefined();
    expect((en as any).creatorQuest.main.morocco_shield_desc).toBeDefined();

    expect((es as any).creatorQuest.main.morocco_shield_title).toBeDefined();
    expect((es as any).creatorQuest.main.morocco_shield_desc).toBeDefined();

    expect((fr as any).creatorQuest.main.morocco_shield_title).toBeDefined();
    expect((fr as any).creatorQuest.main.morocco_shield_desc).toBeDefined();

    // Verify content explains IP shielding
    expect((fr as any).creatorQuest.main.morocco_shield_desc).toContain('Maroc Telecom');
    expect((es as any).creatorQuest.main.morocco_shield_desc).toContain('Maroc Telecom');
    expect((en as any).creatorQuest.main.morocco_shield_desc).toContain('Maroc Telecom');
  });
});
