import type { SupabaseClient } from '@supabase/supabase-js';
import {
  type FunnelStepId,
  type ObservedStepStats,
  normalizeFunnelStepId,
} from '@/lib/friction-simulator';

export interface TelemetryTrailItem {
  step: string;
  action: string;
  detail: string | null;
  country: string;
  device: string;
  createdAt: string;
}

export interface CohortTelemetrySummary {
  totalEvents: number;
  uniqueSessions: number;
  observedStatsByStep: Partial<Record<FunnelStepId, ObservedStepStats>>;
  latestStalledStep: FunnelStepId | null;
  vipTrail: TelemetryTrailItem[];
}

export interface TelemetryFilter {
  role?: string;
  country?: string;
  device?: string;
  vipCode?: string;
  limit?: number;
}

const EMPTY_SUMMARY: CohortTelemetrySummary = {
  totalEvents: 0,
  uniqueSessions: 0,
  observedStatsByStep: {},
  latestStalledStep: null,
  vipTrail: [],
};

/**
 * Queries `public.funnel_step_telemetry` and aggregates unique session entries/completions
 * per canonical funnel step, gracefully returning an empty summary if the table does not exist yet.
 */
export async function fetchCohortTelemetrySummary(
  adminDb: SupabaseClient,
  filter: TelemetryFilter = {}
): Promise<CohortTelemetrySummary> {
  try {
    let query = adminDb
      .from('funnel_step_telemetry')
      .select(
        'session_id, vip_code, role, country_code, device_type, funnel_step, event_action, duration_ms, detail, created_at'
      )
      .order('created_at', { ascending: false })
      .limit(filter.limit ?? 2000);

    if (filter.role === 'creator' || filter.role === 'member') {
      query = query.eq('role', filter.role);
    }
    const cleanCountry = filter.country?.trim().toUpperCase();
    if (cleanCountry && cleanCountry.length === 2 && cleanCountry !== 'XX') {
      query = query.eq('country_code', cleanCountry);
    }
    if (filter.device) {
      query = query.eq('device_type', filter.device);
    }
    if (filter.vipCode) {
      query = query.eq('vip_code', filter.vipCode.trim());
    }

    const { data: rows, error } = await query;
    if (error || !rows || rows.length === 0) {
      return EMPTY_SUMMARY;
    }

    const allSessions = new Set<string>();
    const stepBuckets = new Map<
      FunnelStepId,
      {
        enteredSessions: Set<string>;
        completedSessions: Set<string>;
        validationErrorCount: number;
        durations: number[];
      }
    >();

    for (const row of rows) {
      const sid = String(row.session_id || 'anon');
      allSessions.add(sid);

      const stepId = normalizeFunnelStepId(String(row.funnel_step || ''));
      let bucket = stepBuckets.get(stepId);
      if (!bucket) {
        bucket = {
          enteredSessions: new Set<string>(),
          completedSessions: new Set<string>(),
          validationErrorCount: 0,
          durations: [],
        };
        stepBuckets.set(stepId, bucket);
      }

      if (row.event_action === 'step_enter' || row.event_action === 'cta_click') {
        bucket.enteredSessions.add(sid);
      } else if (row.event_action === 'step_complete') {
        bucket.enteredSessions.add(sid);
        bucket.completedSessions.add(sid);
      } else if (row.event_action === 'validation_error') {
        bucket.enteredSessions.add(sid);
        bucket.validationErrorCount += 1;
      }

      if (typeof row.duration_ms === 'number' && row.duration_ms > 0) {
        bucket.durations.push(row.duration_ms);
      }
    }

    const observedStatsByStep: Partial<Record<FunnelStepId, ObservedStepStats>> = {};
    for (const [stepId, bucket] of stepBuckets.entries()) {
      const avgDurationMs =
        bucket.durations.length > 0
          ? Math.round(bucket.durations.reduce((a, b) => a + b, 0) / bucket.durations.length)
          : undefined;
      observedStatsByStep[stepId] = {
        stepId,
        enteredCount: bucket.enteredSessions.size,
        completedCount: bucket.completedSessions.size,
        validationErrorCount: bucket.validationErrorCount,
        avgDurationMs,
      };
    }

    const vipTrail: TelemetryTrailItem[] = filter.vipCode
      ? rows.slice(0, 25).map((r) => ({
          step: String(r.funnel_step || ''),
          action: String(r.event_action || ''),
          detail: r.detail ? String(r.detail) : null,
          country: String(r.country_code || 'XX'),
          device: String(r.device_type || 'desktop_chrome'),
          createdAt: String(r.created_at || ''),
        }))
      : [];

    const latestStalledStep: FunnelStepId | null =
      vipTrail.length > 0 ? normalizeFunnelStepId(vipTrail[0].step) : null;

    return {
      totalEvents: rows.length,
      uniqueSessions: allSessions.size,
      observedStatsByStep,
      latestStalledStep,
      vipTrail,
    };
  } catch {
    return EMPTY_SUMMARY;
  }
}
