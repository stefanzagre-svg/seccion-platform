/**
 * SECCION Onboarding Step Logger
 * Lightweight localStorage-based step tracker for QA/debugging during test period.
 * Enabled by NEXT_PUBLIC_ONBOARDING_LOGGING=true in .env.local
 * Access logs in browser console: window.__ob_log.printReport()
 */

export interface OnboardingEvent {
  ts: string;
  step: string;
  action: string;
  detail?: string;
  userId?: string;
}

const LOG_KEY = "_seccion_ob_log";
const MAX_EVENTS = 300;
const ENABLED = process.env.NEXT_PUBLIC_ONBOARDING_LOGGING === "true";

function maskId(id?: string | null): string {
  if (!id) return "anon";
  return id.substring(0, 8) + "...";
}

export const OnboardingLogger = {
  log(step: string, action: string, detail?: string, userId?: string | null) {
    if (!ENABLED || typeof window === "undefined") return;
    try {
      const existing: OnboardingEvent[] = JSON.parse(
        localStorage.getItem(LOG_KEY) || "[]"
      );
      const event: OnboardingEvent = {
        ts: new Date().toISOString(),
        step,
        action,
        detail,
        userId: maskId(userId),
      };
      const updated = [...existing, event].slice(-MAX_EVENTS);
      localStorage.setItem(LOG_KEY, JSON.stringify(updated));
    } catch {}
  },

  getReport(): OnboardingEvent[] {
    if (typeof window === "undefined") return [];
    try {
      return JSON.parse(localStorage.getItem(LOG_KEY) || "[]");
    } catch {
      return [];
    }
  },

  printReport() {
    const events = this.getReport();
    if (events.length === 0) {
      console.info("No onboarding events recorded yet.");
      return events;
    }
    console.group("SECCION Onboarding Log");
    events.forEach((e) => {
      const icon =
        e.action === "error"      ? "ERROR" :
        e.action === "complete"   ? "DONE"  :
        e.action === "cta_click"  ? "CLICK" :
        e.action === "step_enter" ? "STEP"  : "INFO";
      console.log(
        `[${e.ts.substring(11,19)}] ${icon} step=${e.step} | ${e.action}${e.detail ? " | " + e.detail : ""} (uid:${e.userId})`
      );
    });
    console.groupEnd();
    return events;
  },

  export(): string {
    return JSON.stringify(this.getReport(), null, 2);
  },

  clear() {
    if (typeof window === "undefined") return;
    localStorage.removeItem(LOG_KEY);
    console.info("Onboarding log cleared.");
  },
};

declare global {
  interface Window {
    __ob_log?: typeof OnboardingLogger;
  }
}

if (typeof window !== "undefined" && ENABLED) {
  window.__ob_log = OnboardingLogger;
  console.info(
    "SECCION Onboarding Logger active.\n" +
    "  window.__ob_log.printReport()  - view step log\n" +
    "  window.__ob_log.export()       - copy JSON for bug report\n" +
    "  window.__ob_log.clear()        - reset between tests"
  );
}
