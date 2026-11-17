import { describe, expect, it } from 'vitest';
import {
  PRESET_PERSONAS,
  blendPriorWithObserved,
  buildKateFollowUpForStalledStep,
  buildKateFrictionPromptBlock,
  detectPersonaDeviceFromUserAgent,
  inferPersonaFromCrmLead,
  normalizeFunnelStepId,
  simulatePersonaFriction,
} from './friction-simulator';

describe('Parametric Persona Friction Simulator & Empirical Blender (Milestone 1)', () => {
  it('simulates all 7 funnel steps with monotonically decreasing cumulative survival', () => {
    const report = simulatePersonaFriction(PRESET_PERSONAS.colombia_ig_creator);
    expect(report.steps).toHaveLength(7);
    expect(report.steps.map((s) => s.stepId)).toEqual([
      '1_entry',
      '2_registration',
      '3_profile_quest',
      '4_discovery_swipe',
      '5_first_action',
      '6_verification',
      '7_payment_payout',
    ]);

    for (let i = 1; i < report.steps.length; i++) {
      expect(report.steps[i].cumulativeSurvivalPct).toBeLessThan(
        report.steps[i - 1].cumulativeSurvivalPct
      );
    }

    // Colombian IG webview creator should flag in-app browser & Cédula/RUT guidance in Spanish
    expect(report.kateBriefing.tailoredDmAddendum).toContain('Cédula o RUT');
    expect(report.kateBriefing.tailoredDmAddendum).toContain('Safari/Chrome');
  });

  it('flags critical Stage 7 payment cliff for 18+ card-only member with no crypto familiarity', () => {
    const franceCardMember = simulatePersonaFriction(PRESET_PERSONAS.france_18_card_member);
    const step7 = franceCardMember.steps.find((s) => s.stepId === '7_payment_payout')!;

    expect(step7.severity).toBe('critical');
    expect(step7.dropOffPct).toBeGreaterThanOrEqual(45);
    expect(franceCardMember.highestFrictionStep.stepId).toBe('7_payment_payout');
    expect(franceCardMember.kateBriefing.riskTier).toBe('high_touch_concierge_required');

    // Compare against US crypto-savvy member
    const usCryptoMember = simulatePersonaFriction(PRESET_PERSONAS.us_crypto_member);
    const usStep7 = usCryptoMember.steps.find((s) => s.stepId === '7_payment_payout')!;
    expect(usStep7.dropOffPct).toBeLessThan(step7.dropOffPct);
  });

  it('applies Morocco Domestic Shield and Formule 5 RIB advantages + VIP link routing for Moroccan creators', () => {
    const moroccoReport = simulatePersonaFriction(PRESET_PERSONAS.morocco_vip_creator);
    const step1 = moroccoReport.steps.find((s) => s.stepId === '1_entry')!;
    const step3 = moroccoReport.steps.find((s) => s.stepId === '3_profile_quest')!;
    const step7 = moroccoReport.steps.find((s) => s.stepId === '7_payment_payout')!;

    expect(step1.route).toBe('/vip/sofia-vip90');
    expect(step3.triggers.some((t) => t.includes('Morocco Domestic Privacy Shield'))).toBe(true);
    expect(step7.triggers.some((t) => t.includes('Formule 5'))).toBe(true);
    expect(moroccoReport.kateBriefing.recommendedFastTrackUrl).toBe(
      'https://seccion.ai/vip/sofia-vip90'
    );
    expect(moroccoReport.kateBriefing.tailoredDmAddendum).toContain('Bouclier Maroc');
  });

  it('blends Known CRO Priors with Observed Telemetry using Bayesian weighting', () => {
    // 1. No observed data -> 100% known_prior
    const priorOnly = blendPriorWithObserved(20, null);
    expect(priorOnly.dataSource).toBe('known_prior');
    expect(priorOnly.blendedDropOffPct).toBe(20);
    expect(priorOnly.observedDropOffPct).toBeNull();

    // 2. Moderate sample size (N_obs = 20, N0 = 20) with 40% observed drop-off -> 30% blended
    const blended = blendPriorWithObserved(
      20,
      {
        stepId: '3_profile_quest',
        enteredCount: 20,
        completedCount: 12, // 40% drop-off
      },
      20
    );
    expect(blended.dataSource).toBe('blended');
    expect(blended.observedDropOffPct).toBe(40);
    expect(blended.blendedDropOffPct).toBe(30);

    // 3. Large sample size (N_obs = 80 >= 2 * N0) -> empirical_dominant
    const empirical = blendPriorWithObserved(
      20,
      {
        stepId: '3_profile_quest',
        enteredCount: 80,
        completedCount: 68, // 15% drop-off
      },
      20
    );
    expect(empirical.dataSource).toBe('empirical_dominant');
    expect(empirical.blendedDropOffPct).toBe(16);
  });

  it('infers PersonaSpec from CRM leads and generates localized stalled-step follow-ups', () => {
    const colombiaLead = inferPersonaFromCrmLead(
      {
        id: 'lead-1',
        full_name: 'Camila Gomez',
        city: 'Medellín, Colombia',
        instagram_handle: '@camilag',
        status: 'dm_sent',
      },
      { code: 'camila-vip', locale: 'es' },
      '6_verification'
    );

    expect(colombiaLead.country).toBe('CO');
    expect(colombiaLead.language).toBe('es');
    expect(colombiaLead.device).toBe('mobile_ig_webview');
    expect(colombiaLead.vipCode).toBe('camila-vip');
    expect(colombiaLead.hasPreApprovedFastTrack).toBe(true);

    const followUpEs = buildKateFollowUpForStalledStep(colombiaLead, '6_verification');
    expect(followUpEs).toContain('Camila');
    expect(followUpEs).toContain('Cédula o RUT');

    const followUpFr = buildKateFollowUpForStalledStep(
      PRESET_PERSONAS.morocco_vip_creator,
      '1_entry'
    );
    expect(followUpFr).toContain('Safari/Chrome');
    expect(followUpFr).toContain('https://seccion.ai/vip/sofia-vip90');
  });

  it('normalizes raw funnel step names and detects in-app social webview user-agents (Milestone 2)', () => {
    expect(normalizeFunnelStepId('1_entry')).toBe('1_entry');
    expect(normalizeFunnelStepId('registration')).toBe('2_registration');
    expect(normalizeFunnelStepId('profile-checklist')).toBe('3_profile_quest');
    expect(normalizeFunnelStepId('feed_swipe')).toBe('4_discovery_swipe');
    expect(normalizeFunnelStepId('studio_content')).toBe('5_first_action');
    expect(normalizeFunnelStepId('kyc_verify')).toBe('6_verification');
    expect(normalizeFunnelStepId('wallet_topup')).toBe('7_payment_payout');

    expect(
      detectPersonaDeviceFromUserAgent(
        'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) Mobile/15E148 Instagram 320.0.0.0'
      )
    ).toBe('mobile_ig_webview');
    expect(
      detectPersonaDeviceFromUserAgent(
        'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 Musical_ly_33.5.0 BytedanceWebview'
      )
    ).toBe('mobile_tiktok_webview');
    expect(
      detectPersonaDeviceFromUserAgent(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/126.0.0.0 Safari/537.36'
      )
    ).toBe('desktop_chrome');
  });

  it('builds a clean internal prompt briefing for Kate Specialist API (Milestone 3)', () => {
    const report = simulatePersonaFriction(PRESET_PERSONAS.colombia_ig_creator);
    const promptBlock = buildKateFrictionPromptBlock(report);

    expect(promptBlock).toContain('KATE PRE-EMPTIVE FRICTION BRIEFING');
    expect(promptBlock).toContain('country=CO');
    expect(promptBlock).toContain('device=mobile_ig_webview');
    expect(promptBlock).toContain('Top Predicted Bottlenecks to Neutralize Proactively');
    expect(promptBlock).toContain('never mention internal scores');
  });
});
