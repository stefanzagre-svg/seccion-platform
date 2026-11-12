import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  GEMINI_FREE_MODEL_CHAIN,
  isTransientGeminiError,
  generateContentWithFailover,
} from './gemini-failover';

describe('gemini-failover', () => {
  let warnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    warnSpy.mockRestore();
  });

  it('orders multi-bucket free models ahead of strictly capped gemini-2.5-flash', () => {
    expect(GEMINI_FREE_MODEL_CHAIN[0]).toBe('gemini-3-flash-preview');
    expect(GEMINI_FREE_MODEL_CHAIN).toContain('gemini-3.5-flash-lite');
    expect(GEMINI_FREE_MODEL_CHAIN[GEMINI_FREE_MODEL_CHAIN.length - 1]).toBe('gemini-2.5-flash');
    expect(GEMINI_FREE_MODEL_CHAIN).not.toContain('gemini-2.0-flash');
    expect(GEMINI_FREE_MODEL_CHAIN).not.toContain('gemini-2.5-flash-lite');
  });

  it('distinguishes transient RPM/503 spikes from 404 deprecation and PerDay exhaustion', () => {
    expect(isTransientGeminiError(new Error('503 UNAVAILABLE'))).toBe(true);
    expect(isTransientGeminiError(new Error('429 RESOURCE_EXHAUSTED timeout'))).toBe(true);
    expect(isTransientGeminiError(new Error('404 model no longer available'))).toBe(false);
    expect(isTransientGeminiError(new Error('Quota exceeded for FreeTier limit: 20 PerDay'))).toBe(false);
  });

  it('retries once on transient 503 error before succeeding on the same model', async () => {
    let calls = 0;
    const result = await generateContentWithFailover({
      apiKeys: 'key-1',
      contents: 'hello',
      transientRetryDelayMs: 0,
      clientFactory: () => ({
        models: {
          generateContent: async ({ model }) => {
            calls++;
            if (calls === 1) throw new Error('503 UNAVAILABLE');
            return { text: `ok-from-${model}` };
          },
        },
      }),
    });

    expect(calls).toBe(2);
    expect(result.modelUsed).toBe(GEMINI_FREE_MODEL_CHAIN[0]);
    expect(result.text).toBe(`ok-from-${GEMINI_FREE_MODEL_CHAIN[0]}`);
  });

  it('fails over immediately without retrying when PerDay quota or 404 occurs', async () => {
    const visitedModels: string[] = [];
    const result = await generateContentWithFailover({
      apiKeys: 'key-1',
      contents: 'hello',
      transientRetryDelayMs: 0,
      clientFactory: () => ({
        models: {
          generateContent: async ({ model }) => {
            visitedModels.push(model);
            if (model === 'gemini-3-flash-preview') {
              throw new Error('FreeTier quota exceeded: PerDay limit: 20');
            }
            if (model === 'gemini-3.5-flash-lite') {
              throw new Error('404 model not found');
            }
            return { text: `served-by-${model}` };
          },
        },
      }),
    });

    expect(visitedModels).toEqual([
      'gemini-3-flash-preview',
      'gemini-3.5-flash-lite',
      'gemini-flash-lite-latest',
    ]);
    expect(result.modelUsed).toBe('gemini-flash-lite-latest');
    expect(result.text).toBe('served-by-gemini-flash-lite-latest');
  });

  it('treats empty text responses as failures and fails over to the next model', async () => {
    const visitedModels: string[] = [];
    const result = await generateContentWithFailover({
      apiKeys: 'key-1',
      contents: ['prompt', { inlineData: { data: 'abc', mimeType: 'image/jpeg' } }],
      config: { responseMimeType: 'application/json' },
      transientRetryDelayMs: 0,
      clientFactory: () => ({
        models: {
          generateContent: async ({ model }) => {
            visitedModels.push(model);
            if (model === GEMINI_FREE_MODEL_CHAIN[0]) {
              return { text: '   ' };
            }
            return { text: '{"ok":true}' };
          },
        },
      }),
    });

    expect(visitedModels).toEqual([
      GEMINI_FREE_MODEL_CHAIN[0],
      GEMINI_FREE_MODEL_CHAIN[1],
    ]);
    expect(result.text).toBe('{"ok":true}');
  });

  it('rotates across multiple API keys and puts preferredModel first', async () => {
    const attempts: Array<{ key: string; model: string }> = [];
    const result = await generateContentWithFailover({
      apiKeys: ['primary-key', 'backup-key', 'primary-key'],
      preferredModel: 'custom-preview',
      modelChain: ['m1', 'm2'],
      contents: 'hi',
      transientRetryDelayMs: 0,
      clientFactory: (key) => ({
        models: {
          generateContent: async ({ model }) => {
            attempts.push({ key, model });
            if (key === 'primary-key') {
              throw new Error('404 not found');
            }
            return { text: 'backup-ok' };
          },
        },
      }),
    });

    expect(attempts).toEqual([
      { key: 'primary-key', model: 'custom-preview' },
      { key: 'primary-key', model: 'm1' },
      { key: 'primary-key', model: 'm2' },
      { key: 'backup-key', model: 'custom-preview' },
    ]);
    expect(result.text).toBe('backup-ok');
    expect(result.modelUsed).toBe('custom-preview');
  });

  it('throws when no API keys are provided or when all keys & models fail', async () => {
    await expect(
      generateContentWithFailover({
        apiKeys: ['', undefined],
        contents: 'hello',
      })
    ).rejects.toThrow(/No Gemini API keys configured/);

    await expect(
      generateContentWithFailover({
        apiKeys: 'key-1',
        modelChain: ['m1', 'm2'],
        contents: 'hello',
        transientRetryDelayMs: 0,
        clientFactory: () => ({
          models: {
            generateContent: async () => {
              throw new Error('404 not found');
            },
          },
        }),
      })
    ).rejects.toThrow('404 not found');
  });
});
