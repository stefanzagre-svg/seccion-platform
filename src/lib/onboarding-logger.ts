/**
 * SECCION Onboarding & Funnel Step Logger (Closed-Loop VIP & User Telemetry)
 * 1. Persists step logs locally in `localStorage` (`_seccion_ob_log`) for QA inspection.
 * 2. Automatically tracks `sessionId`, `vipCode` (`/vip/[code]` or `?vip=`), `utm_source`,
 *    and step `durationMs`, beaconing non-blocking telemetry to `/api/v2/telemetry/funnel`
 *    so the Friction Simulator continuously self-calibrates from real user behavior.
 */

export interface OnboardingEvent {
  ts: string;
  step: string;
  action: string;
  detail?: string;
  userId?: string;
  vipCode?: string | null;
  durationMs?: number | null;
}

const LOG_KEY = '_seccion_ob_log';
const SESSION_ID_KEY = '_seccion_ob_sid';
const VIP_CODE_KEY = '_seccion_ob_vip';
const UTM_SOURCE_KEY = '_seccion_ob_utm';
const STEP_ENTER_TS_KEY = '_seccion_ob_step_ts';
const MAX_EVENTS = 300;
const ENABLED = process.env.NEXT_PUBLIC_ONBOARDING_LOGGING !== 'false';

function maskId(id?: string | null): string {
  if (!id) return 'anon';
  return id.substring(0, 8) + '...';
}

function getOrCreateSessionId(): string {
  if (typeof window === 'undefined') return 'server_session';
  try {
    let sid = sessionStorage.getItem(SESSION_ID_KEY);
    if (!sid) {
      sid =
        typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
          ? crypto.randomUUID()
          : `sid_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
      sessionStorage.setItem(SESSION_ID_KEY, sid);
    }
    return sid;
  } catch {
    return `sid_${Date.now()}`;
  }
}

function captureAttributionContext(): { vipCode: string | null; utmSource: string | null; roleHint?: 'creator' | 'member' } {
  if (typeof window === 'undefined') return { vipCode: null, utmSource: null };
  try {
    const url = new URL(window.location.href);
    const pathMatch = url.pathname.match(/^\/vip\/([^/?#]+)/i);
    const vipFromUrl = pathMatch?.[1] || url.searchParams.get('vip') || null;
    if (vipFromUrl) {
      sessionStorage.setItem(VIP_CODE_KEY, vipFromUrl);
    }

    const utmFromUrl = url.searchParams.get('utm_source') || null;
    if (utmFromUrl) {
      sessionStorage.setItem(UTM_SOURCE_KEY, utmFromUrl);
    }

    const vipCode = sessionStorage.getItem(VIP_CODE_KEY) || null;
    const utmSource = sessionStorage.getItem(UTM_SOURCE_KEY) || null;
    const roleParam = url.searchParams.get('role');
    const roleHint: 'creator' | 'member' | undefined =
      roleParam === 'creator' || vipCode || url.pathname.startsWith('/studio') || url.pathname.startsWith('/become-creator')
        ? 'creator'
        : roleParam === 'member'
          ? 'member'
          : undefined;

    return { vipCode, utmSource, roleHint };
  } catch {
    return { vipCode: null, utmSource: null };
  }
}

function computeAndStoreStepDuration(step: string, action: string): number | null {
  if (typeof window === 'undefined') return null;
  try {
    const mapRaw = sessionStorage.getItem(STEP_ENTER_TS_KEY);
    const map: Record<string, number> = mapRaw ? JSON.parse(mapRaw) : {};
    const now = Date.now();
    if (action === 'step_enter') {
      map[step] = now;
      sessionStorage.setItem(STEP_ENTER_TS_KEY, JSON.stringify(map));
      return null;
    }
    if ((action === 'complete' || action === 'step_complete') && map[step]) {
      const elapsed = Math.max(0, now - map[step]);
      return elapsed;
    }
    return null;
  } catch {
    return null;
  }
}

export const OnboardingLogger = {
  log(
    step: string,
    action: string,
    detail?: string,
    userId?: string | null,
    metadata?: Record<string, unknown>
  ) {
    if (!ENABLED || typeof window === 'undefined') return;
    try {
      const sessionId = getOrCreateSessionId();
      const { vipCode, utmSource, roleHint } = captureAttributionContext();
      const durationMs = computeAndStoreStepDuration(step, action);

      const existing: OnboardingEvent[] = JSON.parse(
        localStorage.getItem(LOG_KEY) || '[]'
      );
      const event: OnboardingEvent = {
        ts: new Date().toISOString(),
        step,
        action,
        detail,
        userId: maskId(userId),
        vipCode: (metadata?.vipCode as string) || vipCode,
        durationMs,
      };
      const updated = [...existing, event].slice(-MAX_EVENTS);
      localStorage.setItem(LOG_KEY, JSON.stringify(updated));

      // Dispatch non-blocking telemetry beacon to self-calibrate the Friction Simulator
      const payload = JSON.stringify({
        sessionId,
        step,
        action:
          action === 'complete' ||
          action === 'step_complete' ||
          action === 'step_enter' ||
          action === 'validation_error' ||
          action === 'error' ||
          action === 'cta_click' ||
          action === 'abandon_signal'
            ? action
            : 'step_enter',
        role: (metadata?.role as 'creator' | 'member') || roleHint,
        vipCode: (metadata?.vipCode as string) || vipCode,
        locale: localStorage.getItem('seccion_user_locale') || navigator.language?.slice(0, 2) || 'en',
        utmSource,
        durationMs,
        detail,
        userId: userId && /^[0-9a-f-]{36}$/i.test(userId) ? userId : undefined,
        metadata,
      });

      if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
        const blob = new Blob([payload], { type: 'application/json' });
        navigator.sendBeacon('/api/v2/telemetry/funnel', blob);
      } else if (typeof fetch === 'function') {
        fetch('/api/v2/telemetry/funnel', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: payload,
          keepalive: true,
        }).catch(() => {});
      }
    } catch {}
  },

  getReport(): OnboardingEvent[] {
    if (typeof window === 'undefined') return [];
    try {
      return JSON.parse(localStorage.getItem(LOG_KEY) || '[]');
    } catch {
      return [];
    }
  },

  printReport() {
    const events = this.getReport();
    if (events.length === 0) {
      console.info('No onboarding events recorded yet.');
      return events;
    }
    console.group('SECCION Onboarding Log');
    events.forEach((e) => {
      const icon =
        e.action === 'error' || e.action === 'validation_error'
          ? 'ERROR'
          : e.action === 'complete' || e.action === 'step_complete'
            ? 'DONE'
            : e.action === 'cta_click'
              ? 'CLICK'
              : e.action === 'step_enter'
                ? 'STEP'
                : 'INFO';
      console.log(
        `[${e.ts.substring(11, 19)}] ${icon} step=${e.step} | ${e.action}${e.detail ? ' | ' + e.detail : ''}${e.vipCode ? ' | vip=' + e.vipCode : ''} (uid:${e.userId})`
      );
    });
    console.groupEnd();
    return events;
  },

  export(): string {
    return JSON.stringify(this.getReport(), null, 2);
  },

  clear() {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(LOG_KEY);
    console.info('Onboarding log cleared.');
  },
};

declare global {
  interface Window {
    __ob_log?: typeof OnboardingLogger;
  }
}

if (typeof window !== 'undefined' && ENABLED) {
  window.__ob_log = OnboardingLogger;
}
