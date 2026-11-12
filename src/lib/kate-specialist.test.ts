import { describe, it, expect } from 'vitest';
import {
  detectSpecialistLanguage,
  getContextualFallbackReply,
  prepareSpeechText,
  sanitizeHistory,
} from './kate-specialist';
import { POST as speakPost } from '@/app/api/v2/voice/speak/route';
import { POST as specialistPost } from '@/app/api/v2/onboarding/specialist/route';
import { NextRequest } from 'next/server';

describe('Kate Specialist Resilience & Multilingual Engine', () => {
  describe('detectSpecialistLanguage', () => {
    it('classifies English questions containing "comment" or "non-stop" as English instead of French', () => {
      const singular = detectSpecialistLanguage('Can a fan leave a comment on my post?', 'en');
      expect(singular.uiLang).toBe('en');

      const nonStop = detectSpecialistLanguage('Are payouts really non-stop and instant in USDT?', 'en');
      expect(nonStop.uiLang).toBe('en');
    });

    it('detects French accurately without false positives on English', () => {
      const fr = detectSpecialistLanguage("Comment activer le blocage Maroc MA et retirer en USDT ?", 'en');
      expect(fr.uiLang).toBe('fr');
      expect(fr.promptLang).toBe('fr');
    });

    it('detects Spanish accurately', () => {
      const es = detectSpecialistLanguage('¿Cómo retiro mis ganancias en USDT desde Colombia?', 'en');
      expect(es.uiLang).toBe('es');
    });

    it('detects Arabic script and normalizes Darija Arabizi uiLang to ar for client sync', () => {
      const arabic = detectSpecialistLanguage('كيفاش نسحب الفلوس ديالي؟', 'fr');
      expect(arabic.uiLang).toBe('ar');
      expect(arabic.promptLang).toBe('ar');

      const arabizi = detectSpecialistLanguage('Kifash n-bloquer l-Maroc f compte dyali?', 'fr');
      expect(arabizi.uiLang).toBe('ar');
      expect(arabizi.promptLang).toBe('darija');
    });

    it('uses clientLocale as deterministic tie-breaker on ambiguous or numeric inputs', () => {
      expect(detectSpecialistLanguage('90%?', 'fr').uiLang).toBe('fr');
      expect(detectSpecialistLanguage('90%?', 'es').uiLang).toBe('es');
      expect(detectSpecialistLanguage('90%?', 'ar').uiLang).toBe('ar');
      expect(detectSpecialistLanguage('OK', 'en').uiLang).toBe('en');
    });
  });

  describe('sanitizeHistory', () => {
    it('keeps valid bounded multi-turn history starting on a user turn', () => {
      const turns = sanitizeHistory([
        { sender: 'agent', text: 'Welcome greeting should be trimmed if leading model turn' },
        { sender: 'user', text: 'How do payouts work?' },
        { sender: 'agent', text: 'You keep 90% net via USDT or SEPA.' },
        { sender: 'user', text: '' },
        null,
      ]);

      expect(turns).toHaveLength(2);
      expect(turns[0]).toEqual({ role: 'user', parts: [{ text: 'How do payouts work?' }] });
      expect(turns[1]).toEqual({
        role: 'model',
        parts: [{ text: 'You keep 90% net via USDT or SEPA.' }],
      });
    });

    it('bounds long conversations to at most maxTurns recent items', () => {
      const longHistory = Array.from({ length: 14 }, (_, idx) => ({
        sender: idx % 2 === 0 ? 'user' : 'agent',
        text: `Turn ${idx}`,
      }));

      const trimmed = sanitizeHistory(longHistory, 6);
      expect(trimmed).toHaveLength(6);
      expect(trimmed[0].parts[0].text).toBe('Turn 8');
    });
  });

  describe('getContextualFallbackReply', () => {
    it('answers payout, privacy, and studio topics in all 4 supported languages', () => {
      expect(getContextualFallbackReply('fr', 'Comment retirer en USDT ?')).toContain('90 %');
      expect(getContextualFallbackReply('en', 'How does Morocco geo-blocking work?')).toContain('geo-blocking');
      expect(getContextualFallbackReply('es', '¿Cómo configuro mis precios VIP en Studio?')).toContain('Creator Studio');
      expect(getContextualFallbackReply('ar', 'Kifash n-jbed flous USDT?')).toContain('90%');
    });
  });

  describe('prepareSpeechText', () => {
    it('enforces phonetic Session pronunciation and strips URLs and markdown', () => {
      const input =
        'Check **SECCION** [Creator Studio](https://seccion.ai/studio) or visit https://seccion.ai/onboarding?role=creator now!';
      const prepared = prepareSpeechText(input, 400);
      expect(prepared).toBe('Check Session Creator Studio or visit now!');
      expect(prepared).not.toContain('https://');
      expect(prepared).not.toContain('**');
    });

    it('truncates long responses cleanly at sentence or word boundary without mid-word chop', () => {
      const longText =
        'First complete sentence about SECCION payouts. Second very long sentence with detailed explanations about zero-knowledge KYC verification and automated compliance workflows across Europe and Latin America.';
      const prepared = prepareSpeechText(longText, 120);
      expect(prepared.length).toBeLessThanOrEqual(120);
      expect(prepared.endsWith('.') || !longText.slice(prepared.length).startsWith('a')).toBe(true);
      expect(prepared).toBe('First complete sentence about Session payouts.');
    });

    it('returns empty string for symbol-only or empty input', () => {
      expect(prepareSpeechText('*** https://seccion.ai ###')).toBe('');
      expect(prepareSpeechText('   ')).toBe('');
    });
  });

  describe('API Route Validation', () => {
    it('POST /api/v2/onboarding/specialist rejects empty whitespace messages with 400', async () => {
      const req = new NextRequest('http://localhost/api/v2/onboarding/specialist', {
        method: 'POST',
        body: JSON.stringify({ message: '   ', locale: 'en' }),
      });
      const res = await specialistPost(req);
      expect(res.status).toBe(400);
    });

    it('POST /api/v2/voice/speak rejects empty or URL-only input with 400', async () => {
      const req1 = new NextRequest('http://localhost/api/v2/voice/speak', {
        method: 'POST',
        body: JSON.stringify({ text: '' }),
      });
      expect((await speakPost(req1)).status).toBe(400);

      const req2 = new NextRequest('http://localhost/api/v2/voice/speak', {
        method: 'POST',
        body: JSON.stringify({ text: 'https://seccion.ai/onboarding' }),
      });
      expect((await speakPost(req2)).status).toBe(400);
    });
  });
});
