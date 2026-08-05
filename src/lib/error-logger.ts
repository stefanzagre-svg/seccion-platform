/**
 * SECCIØN Lightweight Sentry Error Reporter (Cloudflare Worker Optimized)
 * ─────────────────────────────────────────────────────────────────────────────
 * Sends runtime exceptions directly to Sentry via HTTP Envelope / Store API.
 * Adds ZERO size overhead to the Cloudflare Worker script, preventing size limit errors.
 */

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN || "https://0ae9cd57153d8ee1b676ee5e92d2580e@o4511857749590016.ingest.de.sentry.io/4511857779998800";

function parseSentryDsn(dsn: string) {
  try {
    const url = new URL(dsn);
    const publicKey = url.username;
    const projectId = url.pathname.replace('/', '');
    const ingestHost = url.hostname;
    return {
      publicKey,
      projectId,
      endpoint: `https://${ingestHost}/api/${projectId}/store/?sentry_key=${publicKey}&sentry_version=7`,
    };
  } catch {
    return null;
  }
}

export function captureError(error: unknown, context?: Record<string, unknown>): void {
  const err = error instanceof Error ? error : new Error(String(error));
  console.error('[SECCIØN Error]:', err.message, context || '');

  const parsed = parseSentryDsn(SENTRY_DSN);
  if (!parsed) return;

  const eventPayload = {
    event_id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID().replace(/-/g, '') : Math.random().toString(36).substring(2),
    timestamp: new Date().toISOString(),
    platform: 'javascript',
    level: 'error',
    exception: {
      values: [
        {
          type: err.name || 'Error',
          value: err.message,
          stacktrace: err.stack ? { frames: [] } : undefined,
        },
      ],
    },
    extra: context,
    tags: {
      environment: process.env.NODE_ENV || 'production',
    },
  };

  fetch(parsed.endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(eventPayload),
  }).catch(() => {
    // Ignore reporting network failures silently
  });
}
