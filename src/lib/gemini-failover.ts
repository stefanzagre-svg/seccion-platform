import { GoogleGenAI } from '@google/genai';

/**
 * Multi-bucket Free-Tier Gemini model failover chain.
 * Avoids exhausting the low 20 RPD quota on `gemini-2.5-flash` alone and skips
 * retired/deprecated models (`gemini-2.0-flash`, `gemini-2.5-flash-lite`).
 */
export const GEMINI_FREE_MODEL_CHAIN: readonly string[] = [
  'gemini-3-flash-preview',
  'gemini-3.5-flash-lite',
  'gemini-flash-lite-latest',
  'gemini-3.1-flash-lite-preview',
  'gemini-2.5-flash',
];

export interface GeminiClientLike {
  models: {
    generateContent: (params: {
      model: string;
      contents: any;
      config?: any;
    }) => Promise<{ text?: string | null }>;
  };
}

export interface GeminiFailoverOptions {
  apiKeys: string | Array<string | undefined | null>;
  contents: any;
  config?: Record<string, any>;
  preferredModel?: string;
  modelChain?: readonly string[];
  transientRetryDelayMs?: number;
  logTag?: string;
  clientFactory?: (apiKey: string) => GeminiClientLike;
}

export interface GeminiFailoverResult {
  text: string;
  modelUsed: string;
  rawResponse: { text?: string | null };
}

/**
 * Identifies transient upstream Gemini errors (429 RPM, 500/502/503/504, timeouts)
 * worth a quick single retry before failing over to the next model bucket.
 * Immediately returns `false` on model 404s or daily PerDay quota exhaustion so
 * failover advances without wasting latency.
 */
export function isTransientGeminiError(err: unknown): boolean {
  const msg = String((err as any)?.message ?? err ?? '');
  if (!msg) return false;
  if (/\b404\b|no longer available|not found/i.test(msg)) return false;
  if (/PerDay|FreeTier.*limit:\s*\d+/i.test(msg)) return false;
  return /\b(429|500|502|503|504)\b|UNAVAILABLE|high demand|RESOURCE_EXHAUSTED|timeout|fetch failed/i.test(
    msg
  );
}

/**
 * Executes `models.generateContent` across one or more API keys and the ordered
 * multi-bucket Free-Tier model chain, returning the first non-empty response.
 */
export async function generateContentWithFailover(
  options: GeminiFailoverOptions
): Promise<GeminiFailoverResult> {
  const rawKeys = Array.isArray(options.apiKeys) ? options.apiKeys : [options.apiKeys];
  const keys = Array.from(
    new Set(
      rawKeys
        .map((k) => (typeof k === 'string' ? k.trim() : ''))
        .filter((k) => k.length > 0)
    )
  );

  if (keys.length === 0) {
    throw new Error('No Gemini API keys configured');
  }

  const baseChain = options.modelChain ?? GEMINI_FREE_MODEL_CHAIN;
  const preferred = options.preferredModel?.trim() || process.env.GEMINI_MODEL?.trim();
  const chain = preferred
    ? [preferred, ...baseChain.filter((m) => m !== preferred)]
    : [...baseChain];

  const retryDelay = options.transientRetryDelayMs ?? 250;
  const tag = options.logTag ?? 'GeminiFailover';
  const makeClient =
    options.clientFactory ?? ((key: string) => new GoogleGenAI({ apiKey: key }));

  let lastError: unknown = null;

  for (let keyIdx = 0; keyIdx < keys.length; keyIdx++) {
    const ai = makeClient(keys[keyIdx]);

    for (const model of chain) {
      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          const response = await ai.models.generateContent({
            model,
            contents: options.contents,
            ...(options.config ? { config: options.config } : {}),
          });

          const rawText = response?.text;
          if (typeof rawText === 'string' && rawText.trim().length > 0) {
            return {
              text: rawText,
              modelUsed: model,
              rawResponse: response,
            };
          }

          throw new Error(`Empty response from ${model}`);
        } catch (err) {
          lastError = err;
          if (attempt === 0 && isTransientGeminiError(err)) {
            if (retryDelay > 0) {
              await new Promise((r) => setTimeout(r, retryDelay));
            }
            continue;
          }
          break;
        }
      }

      const msg = String((lastError as any)?.message ?? lastError ?? '');
      console.warn(
        `[${tag}] key[${keyIdx}] model=${model} failed: ${msg.slice(0, 140)}`
      );
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error(String(lastError ?? 'All Gemini failover models failed'));
}
