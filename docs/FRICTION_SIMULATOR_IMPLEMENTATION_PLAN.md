# Parametric Persona Friction Simulator, Live VIP/User Telemetry & Kate Playbook — Implementation Plan

> **Baton-Passing & Model Handoff Design (`Argon` -> `Hydrogen`)**
> This plan is structured into **5 atomic, independently testable milestones** (`M1`–`M5`). Every milestone specifies exact file paths, SQL schema, TypeScript interfaces, deterministic formulas, and its own verification command (`npx tsc --noEmit && npm test -- --run`). If model quota runs out after any milestone, switch to **Hydrogen** and say: *"Continue `web/docs/FRICTION_SIMULATOR_IMPLEMENTATION_PLAN.md` from Milestone X"*.

---

## 1. Closed-Loop Calibration Formula (Known Priors + Live User & VIP Telemetry)

For each step `s` in `1..7` and demographic cohort `c` (`role`, `country`, `device`):
`EffectiveDropOff = (N0 * KnownPrior + N_obs * ObservedDropOff) / (N0 + N_obs)`
- `N0 = 20` (Prior Confidence Weight): On Day 1 (`N_obs = 0`), the simulator relies 100% on Known CRO Data.
- As real creators and members click `/vip/[code]` or register (`N_obs >= 20`), the engine automatically shifts step weights to reflect actual observed SECCION user behavior (including exact field errors, time-on-step spikes, and VIP link drop-offs).

---

## 2. Milestones (Execute Sequentially)

### Milestone 1: Core Friction Engine, Empirical Blender & Kate Playbook (`Pure TS + Unit Tests`)
- **Create** `web/src/lib/friction-simulator.ts`:
  - Exports `PersonaSpec`, `FunnelStepId`, `StepFrictionResult`, `ObservedStepStats`, `KateOutreachBriefing`, `PersonaSimulationReport`, `PRESET_PERSONAS`.
  - Exports `blendPriorWithObserved(priorDropOffPct, observed, priorWeight)`.
  - Exports `simulatePersonaFriction(persona, observedStatsByStep)`.
  - Exports `inferPersonaFromCrmLead(lead, vipInvite, latestTelemetry)`.
  - Exports `buildKateFollowUpForStalledStep(persona, stalledStep, metadata)`.
- **Create** `web/src/lib/friction-simulator.test.ts` testing all 7 steps, `blendPriorWithObserved` math, VIP invite fast-track bonus, `MA` shield, `18+_adult` card cliff, CRM lead inference, and stalled-step recovery copy (`EN`/`ES`/`FR`).
- **Verify**: `Set-Location web; npx tsc --noEmit && npx vitest run --globals src/lib/friction-simulator.test.ts`

### Milestone 2: Live Funnel & VIP Tracking Telemetry (`Supabase Schema + Logger + API`)
- **Create** `web/scripts/add_funnel_telemetry_table.sql` (`public.funnel_step_telemetry` with `session_id`, `user_id`, `vip_code`, `role`, `country_code`, `locale`, `device_type`, `utm_source`, `funnel_step`, `event_action`, `duration_ms`, `metadata`, `created_at` + RLS & indexes).
- **Create** `web/src/app/api/v2/telemetry/funnel/route.ts` (`POST` non-blocking ingestion capturing `cf-ipcountry`, `seccion_vip_code` cookie, webview UA; `GET` cohort aggregation returning `ObservedStepStats` + per-`vip_code` step trail).
- **Modify** `web/src/lib/onboarding-logger.ts` to beacon step events (`step_enter`, `step_complete`, `validation_error`) with `session_id` and `vip_code` to `/api/v2/telemetry/funnel`, and wire into `VipFastTrackClaimClient.tsx` and `CreatorOnboardingChecklist.tsx`.
- **Verify**: `Set-Location web; npx tsc --noEmit && npm test -- --run`

### Milestone 3: Kate Specialist & Admin Simulation API
- **Create** `web/src/app/api/admin/friction-simulate/route.ts` (`GET` presets + telemetry summary; `POST` runs `simulatePersonaFriction` blended with live `funnel_step_telemetry` stats and returns any live `/vip/[code]` trail).
- **Modify** `web/src/app/api/v2/onboarding/specialist/route.ts` to accept optional `personaContext` or `vipCode` and inject `[KATE PRE-EMPTIVE FRICTION BRIEFING]` into Kate's system prompt.
- **Verify**: `Set-Location web; npx tsc --noEmit && npm test -- --run`

### Milestone 4: Interactive Admin Simulator UI + CRM Lead VIP Tracking Integration
- **Create** `web/src/app/admin/friction-simulator/page.tsx` (preset selector, custom demographic form, Prior vs. Live Telemetry blend indicator, 7-step survival waterfall chart, and Kate Pre-Emptive & Stalled-Step Recovery card).
- **Modify** `web/src/components/admin/AdminSidebar.tsx` (add `Friction Sim` link to `/admin/friction-simulator`).
- **Modify** `web/src/app/admin/creators/crm-outreach/page.tsx` (add 1-click `Simulate & Track` button per lead row that opens `/admin/friction-simulator` pre-filled with that lead's city, handle, VIP code, and live step status).
- **Verify**: `Set-Location web; npx tsc --noEmit && npm test -- --run`

### Milestone 5: CLI + Live Playwright DOM Runner (`npm run simulate:friction`)
- **Create** `web/scripts/simulate-persona-friction.mjs` + add `"simulate:friction": "node scripts/simulate-persona-friction.mjs"` to `web/package.json`.
- Supports `--persona=...`, custom demographic flags, and `--live-dom` (Playwright headless DOM inspection + Markdown report output at `web/reports/friction-simulation-latest.md`).
- **Verify**: `Set-Location web; npm run simulate:friction`
