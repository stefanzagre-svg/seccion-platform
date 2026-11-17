import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin-client';
import { getClientIP, unauthorizedResponse, verifyAdminAuth } from '@/lib/admin-auth';
import { VIP_INVITE_COOKIE, checkPublicIpRateLimit } from '@/lib/vip-invites';
import {
  detectPersonaDeviceFromUserAgent,
  normalizeFunnelStepId,
} from '@/lib/friction-simulator';
import { fetchCohortTelemetrySummary } from '@/lib/funnel-telemetry-server';

const funnelTelemetryPostSchema = z.object({
  sessionId: z.string().trim().min(6).max(120),
  step: z.string().trim().min(1).max(80),
  action: z.enum(['step_enter', 'step_complete', 'complete', 'validation_error', 'error', 'cta_click', 'abandon_signal']),
  role: z.enum(['creator', 'member']).optional(),
  vipCode: z.string().trim().max(64).optional().nullable(),
  locale: z.string().trim().max(10).optional(),
  utmSource: z.string().trim().max(80).optional().nullable(),
  durationMs: z.number().int().min(0).max(86_400_000).optional().nullable(),
  detail: z.string().trim().max(500).optional().nullable(),
  userId: z.string().uuid().optional().nullable(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

function normalizeTelemetryAction(
  rawAction: z.infer<typeof funnelTelemetryPostSchema>['action']
): 'step_enter' | 'step_complete' | 'validation_error' | 'cta_click' | 'abandon_signal' {
  if (rawAction === 'complete') return 'step_complete';
  if (rawAction === 'error') return 'validation_error';
  return rawAction;
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get('cf-connecting-ip') || getClientIP(request);
  const blocked = checkPublicIpRateLimit(ip, 'funnel_telemetry_post', 180, 60);
  if (blocked) {
    return NextResponse.json({ ok: false, error: 'Rate limit exceeded' }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON payload' }, { status: 400 });
  }

  const parsed = funnelTelemetryPostSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: 'Invalid telemetry event schema' },
      { status: 400 }
    );
  }

  const data = parsed.data;
  const funnelStep = normalizeFunnelStepId(data.step);
  const eventAction = normalizeTelemetryAction(data.action);
  const cookieVipCode = request.cookies.get(VIP_INVITE_COOKIE)?.value?.trim() || null;
  const vipCode = (data.vipCode?.trim() || cookieVipCode || null)?.slice(0, 64) || null;
  const countryCode = (
    request.headers.get('cf-ipcountry') ||
    request.headers.get('x-vercel-ip-country') ||
    'XX'
  )
    .toUpperCase()
    .slice(0, 2);
  const deviceType = detectPersonaDeviceFromUserAgent(request.headers.get('user-agent'));
  const role =
    data.role ||
    (vipCode || data.detail?.includes('isCreator=true') || data.detail?.includes('creator')
      ? 'creator'
      : 'member');

  // Never trust an unverified userId in public telemetry beacons; verify against active Supabase session when provided.
  let verifiedUserId: string | null = null;
  if (data.userId) {
    try {
      const supabase = await createClient();
      const { data: authData } = await supabase.auth.getUser();
      if (authData?.user?.id === data.userId) {
        verifiedUserId = authData.user.id;
      }
    } catch {
      verifiedUserId = null;
    }
  }

  try {
    const adminDb = createAdminClient();
    const { error } = await adminDb.from('funnel_step_telemetry').insert({
      session_id: data.sessionId,
      user_id: verifiedUserId,
      vip_code: vipCode,
      role,
      country_code: countryCode,
      locale: (data.locale || 'en').slice(0, 5),
      device_type: deviceType,
      utm_source: data.utmSource || null,
      funnel_step: funnelStep,
      raw_step: data.step.slice(0, 80),
      event_action: eventAction,
      duration_ms: data.durationMs ?? null,
      detail: data.detail ?? null,
      metadata: data.metadata ?? {},
    });

    if (error) {
      return NextResponse.json({
        ok: true,
        persisted: false,
        funnelStep,
        eventAction,
      });
    }

    return NextResponse.json({
      ok: true,
      persisted: true,
      funnelStep,
      eventAction,
      vipCode,
      countryCode,
      deviceType,
    });
  } catch {
    return NextResponse.json({
      ok: true,
      persisted: false,
      funnelStep,
      eventAction,
    });
  }
}

export async function GET(request: NextRequest) {
  const admin = await verifyAdminAuth(request);
  if (!admin) {
    return unauthorizedResponse();
  }

  const search = request.nextUrl.searchParams;
  const adminDb = createAdminClient();

  const summary = await fetchCohortTelemetrySummary(adminDb, {
    role: search.get('role')?.trim() || undefined,
    country: search.get('country')?.trim().toUpperCase() || undefined,
    device: search.get('device')?.trim() || undefined,
    vipCode: search.get('vipCode')?.trim() || undefined,
  });

  return NextResponse.json({
    ok: true,
    ...summary,
  });
}
