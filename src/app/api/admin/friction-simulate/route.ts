import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createAdminClient } from '@/lib/supabase/admin-client';
import { unauthorizedResponse, verifyAdminAuth } from '@/lib/admin-auth';
import {
  PRESET_PERSONAS,
  type PersonaSpec,
  inferPersonaFromCrmLead,
  simulatePersonaFriction,
} from '@/lib/friction-simulator';
import { fetchCohortTelemetrySummary } from '@/lib/funnel-telemetry-server';

const FUNNEL_STEP_ENUM = z.enum([
  '1_entry',
  '2_registration',
  '3_profile_quest',
  '4_discovery_swipe',
  '5_first_action',
  '6_verification',
  '7_payment_payout',
]);

const personaInputSchema = z.object({
  id: z.string().optional(),
  name: z.string().optional(),
  handle: z.string().optional(),
  email: z.string().optional(),
  vipCode: z.string().optional(),
  role: z.enum(['creator', 'member']),
  age: z.number().int().min(18).max(99),
  country: z.string().trim().min(2).max(4),
  origins: z.string().trim().min(1).max(120),
  language: z.enum(['en', 'es', 'fr', 'pt', 'de', 'pl', 'ro', 'ar']),
  device: z.enum([
    'mobile_safari',
    'mobile_chrome',
    'mobile_ig_webview',
    'mobile_tiktok_webview',
    'desktop_chrome',
  ]),
  intent: z.enum([
    '18+_adult',
    'sensual_glamour',
    'lifestyle_sfw',
    'coaching_mentorship',
    'romance_connection',
  ]),
  cryptoFamiliarity: z.enum(['none', 'basic', 'experienced']),
  paymentPreference: z.enum([
    'card',
    'instant_bank',
    'crypto_usdc',
    'epin_paypal',
    'local_bank_rib',
  ]),
  hasPreApprovedFastTrack: z.boolean().optional(),
  hasThreePhotosReady: z.boolean().optional(),
  hasRegisteredTaxId: z.boolean().optional(),
  stalledAtStep: FUNNEL_STEP_ENUM.optional().nullable(),
});

const simulateRequestSchema = z.object({
  persona: personaInputSchema.optional(),
  crmLead: z
    .object({
      id: z.string().optional(),
      full_name: z.string().nullable().optional(),
      email: z.string().nullable().optional(),
      city: z.string().nullable().optional(),
      instagram_handle: z.string().nullable().optional(),
      tiktok_handle: z.string().nullable().optional(),
      status: z.string().nullable().optional(),
      outreach_stage: z.string().nullable().optional(),
    })
    .optional(),
  vipCode: z.string().trim().max(64).optional().nullable(),
  useLiveTelemetry: z.boolean().optional(),
});

export async function GET(request: NextRequest) {
  const admin = await verifyAdminAuth(request, ['moderator', 'admin', 'super_admin']);
  if (!admin) {
    return unauthorizedResponse();
  }

  const adminDb = createAdminClient();
  const telemetryOverview = await fetchCohortTelemetrySummary(adminDb, { limit: 2000 });

  const presetReports = Object.fromEntries(
    Object.entries(PRESET_PERSONAS).map(([key, spec]) => [
      key,
      simulatePersonaFriction(spec, telemetryOverview.observedStatsByStep),
    ])
  );

  return NextResponse.json({
    ok: true,
    presets: PRESET_PERSONAS,
    presetReports,
    telemetryOverview: {
      totalEvents: telemetryOverview.totalEvents,
      uniqueSessions: telemetryOverview.uniqueSessions,
    },
  });
}

export async function POST(request: NextRequest) {
  const admin = await verifyAdminAuth(request, ['moderator', 'admin', 'super_admin']);
  if (!admin) {
    return unauthorizedResponse();
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = simulateRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: 'Invalid simulation payload', details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { persona: rawPersona, crmLead, vipCode: rawVipCode, useLiveTelemetry = true } = parsed.data;
  const adminDb = createAdminClient();

  let targetPersona: PersonaSpec;
  const requestedVipCode = rawVipCode?.trim() || rawPersona?.vipCode?.trim() || undefined;

  // Lookup VIP invite metadata if a vipCode or CRM lead handle/email is provided
  let matchedInvite: {
    code?: string | null;
    locale?: string | null;
    morocco_shield?: boolean | null;
  } | null = null;

  if (requestedVipCode) {
    const { data } = await adminDb
      .from('creator_vip_invites')
      .select('code, locale, morocco_shield')
      .eq('code', requestedVipCode)
      .maybeSingle();
    if (data) matchedInvite = data;
  } else if (crmLead?.email) {
    const { data } = await adminDb
      .from('creator_vip_invites')
      .select('code, locale, morocco_shield')
      .ilike('email', crmLead.email.trim())
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (data) matchedInvite = data;
  }

  const effectiveVipCode = requestedVipCode || matchedInvite?.code || undefined;

  // Pull VIP invite trail if a vipCode exists
  const vipSummary = effectiveVipCode
    ? await fetchCohortTelemetrySummary(adminDb, { vipCode: effectiveVipCode, limit: 200 })
    : null;

  if (crmLead) {
    const inferred = inferPersonaFromCrmLead(
      crmLead,
      matchedInvite,
      vipSummary?.latestStalledStep || null
    );
    targetPersona = {
      ...inferred,
      ...(rawPersona || {}),
      vipCode: effectiveVipCode || inferred.vipCode,
      stalledAtStep: rawPersona?.stalledAtStep ?? vipSummary?.latestStalledStep ?? inferred.stalledAtStep,
    };
  } else if (rawPersona) {
    targetPersona = {
      ...rawPersona,
      vipCode: effectiveVipCode,
      stalledAtStep: rawPersona.stalledAtStep ?? vipSummary?.latestStalledStep ?? null,
    };
  } else {
    targetPersona = PRESET_PERSONAS.colombia_ig_creator;
  }

  // Pull demographic cohort telemetry for Bayesian blend if enabled
  const cohortTelemetry = useLiveTelemetry
    ? await fetchCohortTelemetrySummary(adminDb, {
        role: targetPersona.role,
        country: targetPersona.country,
        limit: 2000,
      })
    : null;

  const report = simulatePersonaFriction(
    targetPersona,
    cohortTelemetry?.observedStatsByStep
  );

  return NextResponse.json({
    ok: true,
    report,
    telemetryMeta: {
      useLiveTelemetry,
      cohortEvents: cohortTelemetry?.totalEvents ?? 0,
      cohortSessions: cohortTelemetry?.uniqueSessions ?? 0,
      vipCode: effectiveVipCode || null,
      vipTrail: vipSummary?.vipTrail ?? [],
      latestStalledStep: vipSummary?.latestStalledStep ?? null,
    },
  });
}
