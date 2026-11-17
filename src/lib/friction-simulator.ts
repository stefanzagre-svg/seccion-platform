import { getTaxFormatForResidence } from './match-engine';

export type PersonaRole = 'creator' | 'member';

export type PersonaDevice =
  | 'mobile_safari'
  | 'mobile_chrome'
  | 'mobile_ig_webview'
  | 'mobile_tiktok_webview'
  | 'desktop_chrome';

export type PersonaIntent =
  | '18+_adult'
  | 'sensual_glamour'
  | 'lifestyle_sfw'
  | 'coaching_mentorship'
  | 'romance_connection';

export type CryptoFamiliarity = 'none' | 'basic' | 'experienced';

export type PaymentPreference =
  | 'card'
  | 'instant_bank'
  | 'crypto_usdc'
  | 'epin_paypal'
  | 'local_bank_rib';

export type FunnelStepId =
  | '1_entry'
  | '2_registration'
  | '3_profile_quest'
  | '4_discovery_swipe'
  | '5_first_action'
  | '6_verification'
  | '7_payment_payout';

export type FrictionSeverity = 'low' | 'medium' | 'high' | 'critical';

export type CalibrationSource = 'known_prior' | 'blended' | 'empirical_dominant';

export interface PersonaSpec {
  id?: string;
  name?: string;
  handle?: string;
  email?: string;
  vipCode?: string;
  role: PersonaRole;
  age: number;
  country: string; // ISO-2 e.g. 'CO', 'MA', 'ES', 'FR', 'US', 'RO', 'PL', 'AR', 'MX'
  origins: string; // e.g. 'Medellín, Colombia'
  language: 'en' | 'es' | 'fr' | 'pt' | 'de' | 'pl' | 'ro' | 'ar';
  device: PersonaDevice;
  intent: PersonaIntent;
  cryptoFamiliarity: CryptoFamiliarity;
  paymentPreference: PaymentPreference;
  hasPreApprovedFastTrack?: boolean;
  hasThreePhotosReady?: boolean;
  hasRegisteredTaxId?: boolean;
  stalledAtStep?: FunnelStepId | null;
}

export interface ObservedStepStats {
  stepId: FunnelStepId;
  enteredCount: number;
  completedCount: number;
  validationErrorCount?: number;
  avgDurationMs?: number;
  domHicksDecisionSec?: number;
  domInputCount?: number;
  untranslatedCount?: number;
}

export interface StepFrictionResult {
  stepNumber: number;
  stepId: FunnelStepId;
  title: string;
  route: string;
  priorDropOffPct: number;
  observedDropOffPct: number | null;
  observedSampleSize: number;
  dataSource: CalibrationSource;
  frictionScore: number; // 0 - 100
  dropOffPct: number; // 1 - 85
  cumulativeSurvivalPct: number; // 0 - 100
  severity: FrictionSeverity;
  triggers: string[];
  uxFixes: string[];
  kateAction: string;
}

export interface KateOutreachBriefing {
  riskTier: 'smooth' | 'moderate_coaching_needed' | 'high_touch_concierge_required';
  predictedCompletionPct: number;
  topBottlenecks: StepFrictionResult[];
  recommendedFastTrackUrl: string;
  preEmptiveWatchouts: string[];
  tailoredDmAddendum: string;
  stalledStepFollowUp: string | null;
  onboardingGreetingOverride: string;
}

export interface PersonaSimulationReport {
  persona: PersonaSpec;
  overallFrictionScore: number;
  predictedEndToEndConversionPct: number;
  highestFrictionStep: StepFrictionResult;
  steps: StepFrictionResult[];
  kateBriefing: KateOutreachBriefing;
}

const HIGH_PRIVACY_COUNTRIES = new Set(['MA', 'TR', 'AE', 'SA', 'EG', 'DZ', 'TN', 'JO', 'CO']);
const LATAM_COUNTRIES = new Set(['CO', 'AR', 'VE', 'MX', 'BR', 'CL', 'PE', 'EC', 'UY', 'PY']);
const EEA_SEPA_COUNTRIES = new Set(['ES', 'FR', 'DE', 'IT', 'PT', 'NL', 'BE', 'AT', 'IE', 'PL', 'RO', 'BG']);
const NATIVE_SUPPORTED_LANGUAGES = new Set(['en', 'es', 'fr']);

function clamp(val: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, val));
}

function classifySeverity(dropOffPct: number): FrictionSeverity {
  if (dropOffPct >= 35) return 'critical';
  if (dropOffPct >= 22) return 'high';
  if (dropOffPct >= 12) return 'medium';
  return 'low';
}

const VALID_FUNNEL_STEPS = new Set<FunnelStepId>([
  '1_entry',
  '2_registration',
  '3_profile_quest',
  '4_discovery_swipe',
  '5_first_action',
  '6_verification',
  '7_payment_payout',
]);

/**
 * Maps raw onboarding/studio step identifiers into canonical 7-stage FunnelStepId values.
 */
export function normalizeFunnelStepId(rawStep: string): FunnelStepId {
  const s = (rawStep || '').toLowerCase().trim();
  if (VALID_FUNNEL_STEPS.has(s as FunnelStepId)) {
    return s as FunnelStepId;
  }
  if (s.includes('vip_entry') || s.includes('landing') || s === 'entry' || s === '1') {
    return '1_entry';
  }
  if (s.includes('reg') || s.includes('auth') || s.includes('otp') || s.includes('oauth') || s === 'init') {
    return '2_registration';
  }
  if (
    s.includes('purpose') ||
    s.includes('intent') ||
    s.includes('quest') ||
    s.includes('profile-checklist') ||
    s.includes('visuals')
  ) {
    return '3_profile_quest';
  }
  if (s.includes('feed') || s.includes('swipe') || s.includes('discover')) {
    return '4_discovery_swipe';
  }
  if (
    s.includes('studio') ||
    s.includes('content') ||
    s.includes('vault') ||
    s.includes('copilot') ||
    s.includes('pricing') ||
    s.includes('chat')
  ) {
    return '5_first_action';
  }
  if (s.includes('kyc') || s.includes('tax') || s.includes('verif')) {
    return '6_verification';
  }
  if (s.includes('pay') || s.includes('wallet') || s.includes('topup') || s.includes('cashout')) {
    return '7_payment_payout';
  }
  return '2_registration';
}

/**
 * Detects PersonaDevice from a browser User-Agent string (including Instagram & TikTok webviews).
 */
export function detectPersonaDeviceFromUserAgent(userAgent?: string | null): PersonaDevice {
  const ua = (userAgent || '').toLowerCase();
  if (ua.includes('instagram')) return 'mobile_ig_webview';
  if (ua.includes('musical_ly') || ua.includes('tiktok') || ua.includes('bytedance')) {
    return 'mobile_tiktok_webview';
  }
  if (ua.includes('iphone') || ua.includes('ipad') || (ua.includes('safari') && ua.includes('mobile') && !ua.includes('chrome'))) {
    return 'mobile_safari';
  }
  if (ua.includes('android') || ua.includes('mobile')) {
    return 'mobile_chrome';
  }
  return 'desktop_chrome';
}

/**
 * Blends Known CRO Prior drop-off % with real observed telemetry from `funnel_step_telemetry`
 * using a Bayesian beta-binomial conjugate update:
 *   Blended = (N0 * Prior + N_obs * Observed) / (N0 + N_obs)
 */
export function blendPriorWithObserved(
  priorDropOffPct: number,
  observed?: ObservedStepStats | null,
  priorWeight = 20
): {
  blendedDropOffPct: number;
  observedDropOffPct: number | null;
  observedSampleSize: number;
  dataSource: CalibrationSource;
} {
  const cleanPrior = clamp(priorDropOffPct, 1, 85);
  if (!observed || observed.enteredCount <= 0) {
    return {
      blendedDropOffPct: Number(cleanPrior.toFixed(1)),
      observedDropOffPct: null,
      observedSampleSize: 0,
      dataSource: 'known_prior',
    };
  }

  const entered = Math.max(1, observed.enteredCount);
  const completed = clamp(observed.completedCount, 0, entered);
  let rawObservedDropOffPct = ((entered - completed) / entered) * 100;

  // Penalize high validation error rates or extreme DOM cognitive load if observed
  if (observed.validationErrorCount && observed.validationErrorCount > 0) {
    const errorRatePct = Math.min(25, (observed.validationErrorCount / entered) * 15);
    rawObservedDropOffPct += errorRatePct;
  }
  if (observed.domHicksDecisionSec && observed.domHicksDecisionSec > 4.5) {
    rawObservedDropOffPct += (observed.domHicksDecisionSec - 4.5) * 2.5;
  }
  if (observed.untranslatedCount && observed.untranslatedCount > 0) {
    rawObservedDropOffPct += Math.min(15, observed.untranslatedCount * 3);
  }

  const boundedObserved = clamp(rawObservedDropOffPct, 1, 85);
  const blended =
    (priorWeight * cleanPrior + entered * boundedObserved) / (priorWeight + entered);

  const dataSource: CalibrationSource =
    entered >= priorWeight * 2 ? 'empirical_dominant' : 'blended';

  return {
    blendedDropOffPct: Number(clamp(blended, 1, 85).toFixed(1)),
    observedDropOffPct: Number(boundedObserved.toFixed(1)),
    observedSampleSize: entered,
    dataSource,
  };
}

/**
 * Generates a localized recovery message for Kate when a real creator or member
 * clicks a VIP link or starts onboarding and stalls at a specific step.
 */
export function buildKateFollowUpForStalledStep(
  persona: PersonaSpec,
  stalledStep: FunnelStepId,
  metadata?: Record<string, unknown>
): string {
  const name = persona.name?.split(' ')[0] || persona.handle?.replace(/^@/, '') || '';
  const greetingEn = name ? `Hey ${name}!` : 'Hey!';
  const greetingEs = name ? `¡Hola ${name}!` : '¡Hola!';
  const greetingFr = name ? `Salut ${name} !` : 'Salut !';
  const fastTrackUrl = persona.vipCode
    ? `https://seccion.ai/vip/${persona.vipCode}`
    : persona.role === 'creator'
      ? `https://seccion.ai/onboarding?role=creator${persona.email ? `&email=${encodeURIComponent(persona.email)}` : ''}`
      : 'https://seccion.ai/onboarding';

  const lang = persona.language === 'es' ? 'es' : persona.language === 'fr' ? 'fr' : 'en';

  switch (stalledStep) {
    case '1_entry':
    case '2_registration': {
      if (lang === 'es') {
        return `${greetingEs} Vi que abriste tu invitación desde ${persona.device.includes('ig') ? 'Instagram' : 'el móvil'}. Tip rápido: toca los 3 puntos arriba y elige "Abrir en el navegador" (Safari/Chrome) para entrar directo con tu 90% activado aquí: ${fastTrackUrl}`;
      }
      if (lang === 'fr') {
        return `${greetingFr} J'ai vu que tu as ouvert ton lien depuis ${persona.device.includes('ig') ? 'Instagram' : 'ton mobile'}. Astuce : clique sur les 3 points en haut et choisis "Ouvrir dans Safari/Chrome" pour activer tes 90% directement : ${fastTrackUrl}`;
      }
      return `${greetingEn} Saw you opened your invite inside the in-app browser. Quick tip: tap '...' at the top and choose "Open in Safari/Chrome" so your 90% fast-track activates cleanly: ${fastTrackUrl}`;
    }
    case '3_profile_quest': {
      if (lang === 'es') {
        return `${greetingEs} Ya casi tienes tu perfil listo. Solo necesitas subir 1 foto de perfil y 2 fotos de galería (puedes activar el Desenfoque Facial con 1 clic si prefieres privacidad total). Continúa aquí: ${fastTrackUrl}`;
      }
      if (lang === 'fr') {
        return `${greetingFr} Ton profil est presque prêt ! Il suffit d'ajouter 1 photo de profil et 2 photos de galerie (le Flou Facial et le Bouclier Maroc sont activables en 1 clic). Reprends ici : ${fastTrackUrl}`;
      }
      return `${greetingEn} Your profile is almost live! Just add 1 profile photo + 2 gallery photos (you can toggle Auto Face Blur in 1 tap for full privacy). Resume here: ${fastTrackUrl}`;
    }
    case '6_verification': {
      const isColombian = persona.country.toUpperCase() === 'CO';
      const isMoroccan = persona.country.toUpperCase() === 'MA';
      if (lang === 'es') {
        return `${greetingEs} Para el paso fiscal y de edad (+18): tu verificación de cámara es 100% privada (nunca se muestra en tu perfil), y en Identificación Fiscal puedes poner simplemente tu ${isColombian ? 'Cédula o RUT' : 'documento fiscal o DNI'} para activar tus retiros del 90%.`;
      }
      if (lang === 'fr') {
        return `${greetingFr} Pour la vérification 18+ et fiscale : le scan est 100% confidentiel (jamais visible publiquement)${isMoroccan ? ', et tu peux utiliser ton numéro CNIE ou Auto-Entrepreneur (ICE) avec virement RIB Maroc (Formule 5)' : ''}.`;
      }
      return `${greetingEn} For the 18+ ID & Tax step: the quick camera check is 100% private (never shown publicly), and you can use your personal national ID or Tax ID to unlock your 90% payouts.`;
    }
    case '7_payment_payout': {
      if (persona.role === 'member') {
        if (lang === 'es') {
          return `${greetingEs} Para desbloquear contenido 18+ al instante sin bloqueos bancarios, elige "USDC (Dólar Digital)" o "PayPal E-Pin" en la recarga de tu cartera.`;
        }
        if (lang === 'fr') {
          return `${greetingFr} Pour débloquer les contenus 18+ instantanément sans blocage bancaire, choisis "USDC (USD Numérique)" ou "PayPal E-Pin" lors de ta recharge.`;
        }
        return `${greetingEn} To unlock 18+ content instantly without card bank declines, select "USDC (Digital USD)" or "PayPal E-Pin" in the wallet top-up modal.`;
      }
      const errHint = metadata?.error_field ? ` (${String(metadata.error_field)})` : '';
      if (lang === 'es') {
        return `${greetingEs} Para recibir tu 90% sin comisiones bancarias altas${errHint}, te recomiendo elegir "USDC (Dólar Digital)" en Polygon/Solana o transferencia directa Wise/SEPA en Ajustes del Studio.`;
      }
      if (lang === 'fr') {
        return `${greetingFr} Pour recevoir tes 90% rapidement${errHint}, choisis le virement Banque Maroc (RIB Formule 5), SEPA Instantané ou USDC dans les Paramètres du Studio.`;
      }
      return `${greetingEn} To receive your 90% payouts with near-zero fees${errHint}, select USDC (Digital USD), SEPA Instant, or Wise inside Studio Settings.`;
    }
    default: {
      if (lang === 'es') {
        return `${greetingEs} Tu cuenta en SECCION está lista para el siguiente paso. Si tienes cualquier duda con tus precios VIP o tu Copilot IA, respóndeme por aquí y lo configuramos juntas en 2 minutos: ${fastTrackUrl}`;
      }
      if (lang === 'fr') {
        return `${greetingFr} Ton espace SECCION t'attend. Si tu veux qu'on configure tes tarifs VIP ou ton Copilote IA ensemble en 2 minutes, réponds-moi ici : ${fastTrackUrl}`;
      }
      return `${greetingEn} Your SECCION account is ready for the next step! Reply here if you want help setting your VIP price or AI Copilot in 2 minutes: ${fastTrackUrl}`;
    }
  }
}

/**
 * Evaluates all 7 lifecycle steps for a given PersonaSpec, combining Known CRO Priors
 * with optional live ObservedStepStats from `funnel_step_telemetry`.
 */
export function simulatePersonaFriction(
  persona: PersonaSpec,
  observedStatsByStep?: Partial<Record<FunnelStepId, ObservedStepStats>>
): PersonaSimulationReport {
  const country = (persona.country || 'US').toUpperCase().trim();
  const isInAppWebview =
    persona.device === 'mobile_ig_webview' || persona.device === 'mobile_tiktok_webview';
  const isDesktop = persona.device === 'desktop_chrome';
  const isHighPrivacyCountry = HIGH_PRIVACY_COUNTRIES.has(country);
  const isLatam = LATAM_COUNTRIES.has(country);
  const isSepa = EEA_SEPA_COUNTRIES.has(country);
  const hasNativeLang = NATIVE_SUPPORTED_LANGUAGES.has(persona.language);
  const isAdultIntent =
    persona.intent === '18+_adult' || persona.intent === 'sensual_glamour';
  const taxFormat = getTaxFormatForResidence(`${persona.origins} ${country}`);
  const usesGenericTaxFallback = taxFormat.label.startsWith('Taxpayer ID Number');

  const rawSteps: Array<{
    stepNumber: number;
    stepId: FunnelStepId;
    title: string;
    route: string;
    priorDropOffPct: number;
    triggers: string[];
    uxFixes: string[];
    kateAction: string;
  }> = [];

  // ── STEP 1: Entry & Landing ───────────────────────────────────────────────
  {
    let prior = 8;
    const triggers: string[] = [];
    const uxFixes: string[] = [];

    if (isInAppWebview) {
      prior += 18;
      triggers.push(
        `In-app social browser (${persona.device}) restricts camera permissions, file uploads, and persistent cookies (+18%)`
      );
      uxFixes.push('Trigger InAppBrowserDetector banner prompting "Open in Safari/Chrome" on entry');
    }
    if (!hasNativeLang) {
      prior += 12;
      triggers.push(
        `Persona native language (${persona.language.toUpperCase()}) falls back to EN/ES/FR UI (+12%)`
      );
      uxFixes.push('Route outreach DM in native language and pre-select closest supported UI locale');
    }
    if (persona.vipCode || persona.hasPreApprovedFastTrack) {
      prior = Math.max(3, prior - 5);
      triggers.push('Pre-approved VIP Fast-Track invite link reduces initial skepticism (-5%)');
    }

    rawSteps.push({
      stepNumber: 1,
      stepId: '1_entry',
      title: persona.role === 'creator' ? 'Entry & Creator Landing / VIP Claim' : 'Entry & Discovery Landing',
      route: persona.vipCode ? `/vip/${persona.vipCode}` : persona.role === 'creator' ? '/become-creator' : '/',
      priorDropOffPct: prior,
      triggers: triggers.length > 0 ? triggers : ['Standard web landing entry (8% baseline bounce)'],
      uxFixes:
        uxFixes.length > 0
          ? uxFixes
          : ['Keep direct value proposition ("90% net split") visible above the fold'],
      kateAction: isInAppWebview
        ? 'Remind user in DM to tap "..." -> "Open in Safari/Chrome" or send direct WhatsApp fast-track link.'
        : 'Send personalized /vip/[code] link so their name and 90% split appear immediately.',
    });
  }

  // ── STEP 2: Registration & Consent Gate ───────────────────────────────────
  {
    let prior = 10;
    const triggers: string[] = [];
    const uxFixes: string[] = [];

    if (persona.role === 'creator' && !persona.hasPreApprovedFastTrack && !persona.vipCode) {
      prior += 14;
      triggers.push(
        'Cold creator signup without pre-approved ?role=creator&email= or /vip/[code] token (+14%)'
      );
      uxFixes.push('Issue a VIP Fast-Track code before sending DM #2');
    }
    if (isHighPrivacyCountry && isAdultIntent) {
      prior += 9;
      triggers.push(
        `High privacy sensitivity in ${country} for ${persona.intent} profiles (+9%)`
      );
      uxFixes.push('Highlight confidential age check & Country Geo-Block right on RegistrationGate');
    }

    rawSteps.push({
      stepNumber: 2,
      stepId: '2_registration',
      title: 'Registration & 18+ Consent Gate',
      route: '/onboarding',
      priorDropOffPct: prior,
      triggers: triggers.length > 0 ? triggers : ['Standard email + 2 consent checkboxes (10% baseline)'],
      uxFixes:
        uxFixes.length > 0
          ? uxFixes
          : ['Auto-derive clean @username from email or social handle'],
      kateAction:
        country === 'MA'
          ? 'Reassure creator upfront that Morocco Domestic Shield (MA) blocks local Moroccan IPs automatically.'
          : 'Send pre-loaded /onboarding?role=creator&email= link so registration takes 1 tap.',
    });
  }

  // ── STEP 3: 1st Step Profile Quest ────────────────────────────────────────
  {
    let prior = isDesktop ? 15 : 11;
    const triggers: string[] = [
      `Mandatory 1 Avatar + 2 Gallery Photos upload (${isDesktop ? '15% desktop' : '11% mobile'} baseline)`,
    ];
    const uxFixes: string[] = [];

    if (persona.hasThreePhotosReady === false) {
      prior += 14;
      triggers.push('User does not have 3 photos ready on current device (+14%)');
      uxFixes.push('Allow saving draft progress or importing from social handle preview');
    }
    if (persona.role === 'creator') {
      prior += 6;
      triggers.push('Creator specialization & bio configuration step (+6%)');
    }
    if (country === 'MA' && isAdultIntent) {
      prior = Math.max(4, prior - 8);
      triggers.push('Morocco Domestic Privacy Shield [Recommended] badge actively reduces local exposure fear (-8%)');
    }

    rawSteps.push({
      stepNumber: 3,
      stepId: '3_profile_quest',
      title: persona.role === 'creator' ? 'Creator Profile & Photo Setup' : '60-Second Smart Synergy Setup',
      route: '/onboarding',
      priorDropOffPct: prior,
      triggers,
      uxFixes:
        uxFixes.length > 0
          ? uxFixes
          : ['Keep 2-tap Smart Synergy auto-fill and Face Blur toggle prominent'],
      kateAction:
        'Tell them prior to signup: "Have 1 avatar photo + 2 gallery photos ready (Face Blur can be turned on in 1 tap)."',
    });
  }

  // ── STEP 4: Feed, Swipe & Discovery ───────────────────────────────────────
  {
    let prior = 5;
    const triggers: string[] = [];
    const uxFixes: string[] = [];

    if (persona.role === 'member') {
      prior += 8;
      triggers.push('Free-tier member encountering 250 XP cost on Advanced Search Filters (+8%)');
      uxFixes.push('Grant initial welcome XP or clearly explain how swiping/chatting earns free XP');
    } else {
      triggers.push('Creator previewing public feed & vanity URL card (5% baseline)');
    }

    rawSteps.push({
      stepNumber: 4,
      stepId: '4_discovery_swipe',
      title: 'Feed Discovery & Swipe Mechanics',
      route: '/feed',
      priorDropOffPct: prior,
      triggers,
      uxFixes:
        uxFixes.length > 0
          ? uxFixes
          : ['Keep Warm Paywall teaser previews fast-loading on mobile'],
      kateAction:
        persona.role === 'creator'
          ? 'Show creator their live shareable vanity link (seccion.ai/username) right after setup.'
          : 'Guide member to swipe 3 cards to calibrate match scores and earn starter activity points.',
    });
  }

  // ── STEP 5: Studio Setup / First Match & Chat ─────────────────────────────
  {
    let prior = persona.role === 'creator' ? 12 : 9;
    const triggers: string[] = [];
    const uxFixes: string[] = [];

    if (persona.role === 'creator') {
      if (!isDesktop) {
        prior += 14;
        triggers.push(
          'Creator uploading first 2 posts on mobile where direct URL input is harder than phone camera roll (+14%)'
        );
        uxFixes.push('Prioritize direct file picker / Cloudflare Stream upload over raw Media URL input');
      } else {
        triggers.push('Creator completing 1st Steps Checklist (Set VIP price + Upload first 2 posts + Train AI Copilot) (12% baseline)');
      }
    } else {
      triggers.push('Member sending first chat message or unlocking Warm Paywall post (9% baseline)');
    }

    rawSteps.push({
      stepNumber: 5,
      stepId: '5_first_action',
      title: persona.role === 'creator' ? 'Creator Studio 1st Steps & AI Copilot' : 'First Match, Chat & Unlock',
      route: persona.role === 'creator' ? '/studio' : '/messages',
      priorDropOffPct: prior,
      triggers,
      uxFixes:
        uxFixes.length > 0
          ? uxFixes
          : ['Pre-fill suggested baseline rates ($9.99 VIP / $4.99 PPV / $3.00/min Call)'],
      kateAction:
        persona.role === 'creator'
          ? 'Recommend starter rates ($9.99/mo single-creator VIP, $4.99 PPV) and pre-fill AI Copilot voice rules.'
          : 'Suggest an icebreaker move based on shared interests.',
    });
  }

  // ── STEP 6: 18+ ID (DIDIT) & Tax Verification ─────────────────────────────
  {
    let prior = isDesktop ? 20 : 13;
    const triggers: string[] = [
      `18+ DIDIT camera liveness check (${isDesktop ? '20% desktop webcam handoff' : '13% mobile camera'} baseline)`,
    ];
    const uxFixes: string[] = [];

    if (persona.role === 'creator') {
      if (persona.age <= 22 || persona.hasRegisteredTaxId === false) {
        prior += 15;
        triggers.push(
          `Young creator (age ${persona.age}) or no formal business Tax ID asked for tax registration (${taxFormat.label}) (+15%)`
        );
        uxFixes.push('Clarify that individual national ID (Cédula / DNI / CNIE) works for individual creators');
      }
      if (usesGenericTaxFallback) {
        prior += 7;
        triggers.push(
          `Residence "${persona.origins || country}" uses generic "${taxFormat.label}" label instead of localized national ID name (+7%)`
        );
        uxFixes.push(`Add localized tax label & regex hint for ${country} in getTaxFormatForResidence()`);
      }
    } else if (!isAdultIntent) {
      // Mainstream SFW member doesn't hit mandatory KYC on day 1
      prior = 4;
      triggers.length = 0;
      triggers.push('Fast-Track entry active: 18+ ID only requested later if booking in-person date or 18+ content (4%)');
    }

    rawSteps.push({
      stepNumber: 6,
      stepId: '6_verification',
      title: persona.role === 'creator' ? '18+ ID Verification & Tax Info' : '18+ Age & Trust Verification',
      route: '/onboarding/kyc',
      priorDropOffPct: prior,
      triggers,
      uxFixes:
        uxFixes.length > 0
          ? uxFixes
          : ['Keep "Verified privately — never shown on your profile" micro-copy next to Verify 18+ ID'],
      kateAction:
        country === 'CO'
          ? 'Proactively tell Colombian creators: "In the Tax ID field, your personal Cédula or RUT works—no company required."'
          : country === 'MA'
            ? 'Proactively tell Moroccan creators: "Your CNIE or Auto-Entrepreneur (1% regime) number works, and your ID is never public."'
            : 'Reassure that DIDIT 18+ check takes 30 seconds on phone camera and is never shown publicly.',
    });
  }

  // ── STEP 7: Payment Top-Up / Creator Payout Setup ─────────────────────────
  {
    let prior = 8;
    const triggers: string[] = [];
    const uxFixes: string[] = [];

    if (persona.role === 'member') {
      if (
        isAdultIntent &&
        (persona.paymentPreference === 'card' || persona.paymentPreference === 'instant_bank') &&
        persona.cryptoFamiliarity === 'none'
      ) {
        prior += 42;
        triggers.push(
          'CRITICAL CLIFF: Member wants 18+ Tokens with Card/Bank, but 18+ wallet requires Digital USD (USDC) or PayPal E-Pin (+42%)'
        );
        uxFixes.push('Highlight 1-click PayPal E-Pin (Rewarble) tutorial for non-crypto 18+ buyers');
      } else if (!isAdultIntent) {
        prior += 4;
        triggers.push('Standard Credits top-up supports all rails (12% baseline checkout drop-off)');
      } else {
        prior += 7;
        triggers.push('Member familiar with USDC or E-Pin completing 18+ Token top-up (15% total)');
      }
    } else {
      // Creator Payout Setup
      if (country === 'MA') {
        if (persona.paymentPreference === 'local_bank_rib') {
          prior = Math.max(4, prior - 3);
          triggers.push('Native Moroccan Bank (24-digit RIB · Formule 5 · 0% withholding) removes payout friction (-3%)');
        } else {
          prior += 6;
          triggers.push('Moroccan creator choosing between RIB and USDC');
        }
      } else if (isLatam && persona.cryptoFamiliarity === 'none') {
        prior += 18;
        triggers.push(
          `LATAM creator (${country}) unfamiliar with crypto choosing payout method where USDC (Polygon/Solana) has lowest fees (+18%)`
        );
        uxFixes.push('Provide 60-second visual guide for receiving USDC via Binance/Lemon/Bitso or selecting Wise/Cosmo Card');
      } else if (isSepa) {
        triggers.push('European creator using €0 fee SEPA Instant or USDC payout (8% baseline)');
      } else {
        prior += 6;
        triggers.push('Global creator selecting USDC, Wise, or Cosmo/Paxum payout rail (14% total)');
      }
    }

    rawSteps.push({
      stepNumber: 7,
      stepId: '7_payment_payout',
      title: persona.role === 'creator' ? 'Payout Method & 90% Cashout Setup' : 'Wallet Top-Up & Subscription Checkout',
      route: persona.role === 'creator' ? '/studio?activeTab=settings' : '/feed',
      priorDropOffPct: prior,
      triggers,
      uxFixes:
        uxFixes.length > 0
          ? uxFixes
          : ['Keep fee comparison badges (€0 SEPA / ~$0.01 USDC / Formule 5 RIB) visible'],
      kateAction:
        persona.role === 'member' && isAdultIntent && persona.cryptoFamiliarity === 'none'
          ? 'Guide member to PayPal E-Pin option so they can fund 18+ Tokens without needing a crypto wallet.'
          : isLatam && persona.role === 'creator'
            ? 'Explain that she can cash out via Wise/Cosmo Card or receive instant Digital Dollars (USDC) to Binance/Nequi/Bancolombia in 1 minute.'
            : 'Confirm payout method is linked so her 90% split settles automatically.',
    });
  }

  // ── Blend Priors with Observed Telemetry & Compute Cumulative Survival ────
  let cumulativeSurvival = 1.0;
  const steps: StepFrictionResult[] = rawSteps.map((raw) => {
    const obs = observedStatsByStep?.[raw.stepId];
    const blended = blendPriorWithObserved(raw.priorDropOffPct, obs);
    const dropOffRatio = blended.blendedDropOffPct / 100;
    cumulativeSurvival *= 1 - dropOffRatio;

    const frictionScore = clamp(Math.round(blended.blendedDropOffPct * 1.45), 5, 99);

    return {
      stepNumber: raw.stepNumber,
      stepId: raw.stepId,
      title: raw.title,
      route: raw.route,
      priorDropOffPct: Number(clamp(raw.priorDropOffPct, 1, 85).toFixed(1)),
      observedDropOffPct: blended.observedDropOffPct,
      observedSampleSize: blended.observedSampleSize,
      dataSource: blended.dataSource,
      frictionScore,
      dropOffPct: blended.blendedDropOffPct,
      cumulativeSurvivalPct: Number((cumulativeSurvival * 100).toFixed(1)),
      severity: classifySeverity(blended.blendedDropOffPct),
      triggers: raw.triggers,
      uxFixes: raw.uxFixes,
      kateAction: raw.kateAction,
    };
  });

  const sortedByFriction = [...steps].sort((a, b) => b.dropOffPct - a.dropOffPct);
  const highestFrictionStep = sortedByFriction[0];
  const topBottlenecks = sortedByFriction.slice(0, 3);
  const predictedEndToEndConversionPct =
    steps[steps.length - 1]?.cumulativeSurvivalPct ?? 0;
  const overallFrictionScore = clamp(
    Math.round(
      steps.reduce((acc, s) => acc + s.frictionScore, 0) / steps.length +
        (highestFrictionStep.severity === 'critical' ? 15 : 0)
    ),
    5,
    99
  );

  const recommendedFastTrackUrl = persona.vipCode
    ? `https://seccion.ai/vip/${persona.vipCode}`
    : persona.role === 'creator'
      ? `https://seccion.ai/onboarding?role=creator${persona.email ? `&email=${encodeURIComponent(persona.email)}` : ''}`
      : 'https://seccion.ai/onboarding';

  const riskTier: KateOutreachBriefing['riskTier'] =
    predictedEndToEndConversionPct < 30 || highestFrictionStep.severity === 'critical'
      ? 'high_touch_concierge_required'
      : predictedEndToEndConversionPct < 48
        ? 'moderate_coaching_needed'
        : 'smooth';

  const lang = persona.language === 'es' ? 'es' : persona.language === 'fr' ? 'fr' : 'en';
  const tailoredDmAddendum =
    lang === 'es'
      ? `Te activé acceso directo con el 90% neto garantizado. Consejo rápido: abre el enlace en Safari/Chrome (no dentro del navegador de IG), ten 1 foto de perfil + 2 de galería listas, y recuerda que en datos fiscales sirve tu Cédula o RUT: ${recommendedFastTrackUrl}`
      : lang === 'fr'
        ? `Ton accès prioritaire à 90% net est prêt. Astuce : ouvre le lien dans Safari/Chrome, prépare 1 photo de profil + 2 photos de galerie${country === 'MA' ? ' (le Bouclier Maroc MA et le virement RIB Formule 5 sont inclus)' : ''} : ${recommendedFastTrackUrl}`
        : `I unlocked your 90% net Founding Creator fast-track. Quick tip: open the link in Safari/Chrome (outside the IG browser) and have 1 profile photo + 2 gallery photos ready: ${recommendedFastTrackUrl}`;

  const onboardingGreetingOverride =
    lang === 'es'
      ? `¡Bienvenida! Configuramos tu ruta rápida para ${persona.origins || country}: tus primeros pasos son subir 1 avatar + 2 fotos, fijar tu precio VIP individual y elegir tu método de cobro.`
      : lang === 'fr'
        ? `Bienvenue ! Ton parcours rapide pour ${persona.origins || country} est prêt : ajoute 1 avatar + 2 photos, fixe ton tarif VIP et choisis ton mode de paiement.`
        : `Welcome! We tailored your fast-track setup for ${persona.origins || country}: add 1 avatar + 2 photos, set your VIP rate, and pick your payout method.`;

  return {
    persona,
    overallFrictionScore,
    predictedEndToEndConversionPct,
    highestFrictionStep,
    steps,
    kateBriefing: {
      riskTier,
      predictedCompletionPct: predictedEndToEndConversionPct,
      topBottlenecks,
      recommendedFastTrackUrl,
      preEmptiveWatchouts: topBottlenecks.map(
        (b) => `Step ${b.stepNumber} (${b.title} — ${b.dropOffPct}% drop-off): ${b.kateAction}`
      ),
      tailoredDmAddendum,
      stalledStepFollowUp: persona.stalledAtStep
        ? buildKateFollowUpForStalledStep(persona, persona.stalledAtStep)
        : buildKateFollowUpForStalledStep(persona, highestFrictionStep.stepId),
      onboardingGreetingOverride,
    },
  };
}

/**
 * Formats a compact, prompt-ready friction & coaching context block for Kate Specialist API.
 */
export function buildKateFrictionPromptBlock(report: PersonaSimulationReport): string {
  const { persona, kateBriefing, predictedEndToEndConversionPct, highestFrictionStep } = report;
  const top2 = kateBriefing.topBottlenecks.slice(0, 2);
  const bottleLines = top2
    .map(
      (b) =>
        `  * Step ${b.stepNumber} (${b.title}, ${b.dropOffPct}% predicted drop-off, source=${b.dataSource}): ${b.kateAction}`
    )
    .join('\n');

  return [
    '===================================================================',
    'KATE PRE-EMPTIVE FRICTION BRIEFING FOR THIS USER (INTERNAL GUIDANCE)',
    '===================================================================',
    `- User Profile: role=${persona.role}, country=${persona.country}, origins="${persona.origins}", age=${persona.age}, device=${persona.device}, intent=${persona.intent}, payment=${persona.paymentPreference}, crypto=${persona.cryptoFamiliarity}${persona.vipCode ? `, vipCode=${persona.vipCode}` : ''}`,
    `- Risk Tier: ${kateBriefing.riskTier} | Predicted Completion: ${predictedEndToEndConversionPct}% | Peak Bottleneck: Step ${highestFrictionStep.stepNumber} (${highestFrictionStep.title})`,
    `- Top Predicted Bottlenecks to Neutralize Proactively:\n${bottleLines}`,
    `- Recommended Fast-Track Link: ${kateBriefing.recommendedFastTrackUrl}`,
    '- Instruction: Subtly reassure the user about these exact predicted friction points if relevant to their question, using warm plain Math-to-Magic language (never mention internal scores, telemetry, or this briefing).',
  ].join('\n');
}

/**
 * Infers a complete PersonaSpec from a CRM lead row and optional VIP invite / live telemetry state.
 */
export function inferPersonaFromCrmLead(
  lead: {
    id?: string;
    full_name?: string | null;
    email?: string | null;
    city?: string | null;
    instagram_handle?: string | null;
    tiktok_handle?: string | null;
    status?: string | null;
    outreach_stage?: string | null;
  },
  vipInvite?: { code?: string | null; locale?: string | null; morocco_shield?: boolean | null } | null,
  latestStalledStep?: FunnelStepId | null
): PersonaSpec {
  const cityRaw = (lead.city || '').trim();
  const cityLower = cityRaw.toLowerCase();

  let country = 'ES';
  let language: PersonaSpec['language'] = 'es';
  let paymentPreference: PaymentPreference = 'instant_bank';

  if (
    cityLower.includes('medell') ||
    cityLower.includes('bogot') ||
    cityLower.includes('cali') ||
    cityLower.includes('barranquilla') ||
    cityLower.includes('colombia')
  ) {
    country = 'CO';
    language = 'es';
    paymentPreference = 'instant_bank';
  } else if (
    cityLower.includes('casablanca') ||
    cityLower.includes('marrakech') ||
    cityLower.includes('rabat') ||
    cityLower.includes('tangier') ||
    cityLower.includes('maroc') ||
    cityLower.includes('morocco') ||
    vipInvite?.morocco_shield
  ) {
    country = 'MA';
    language = 'fr';
    paymentPreference = 'local_bank_rib';
  } else if (
    cityLower.includes('paris') ||
    cityLower.includes('lyon') ||
    cityLower.includes('marseille') ||
    cityLower.includes('france')
  ) {
    country = 'FR';
    language = 'fr';
    paymentPreference = 'instant_bank';
  } else if (
    cityLower.includes('bucharest') ||
    cityLower.includes('cluj') ||
    cityLower.includes('romania')
  ) {
    country = 'RO';
    language = 'en';
    paymentPreference = 'instant_bank';
  } else if (
    cityLower.includes('warsaw') ||
    cityLower.includes('krakow') ||
    cityLower.includes('poland')
  ) {
    country = 'PL';
    language = 'en';
    paymentPreference = 'instant_bank';
  } else if (
    cityLower.includes('miami') ||
    cityLower.includes('los angeles') ||
    cityLower.includes('new york') ||
    cityLower.includes('usa') ||
    cityLower.includes('uk') ||
    cityLower.includes('london')
  ) {
    country = 'US';
    language = 'en';
    paymentPreference = 'card';
  } else if (
    cityLower.includes('buenos aires') ||
    cityLower.includes('argentina')
  ) {
    country = 'AR';
    language = 'es';
    paymentPreference = 'crypto_usdc';
  } else if (cityLower.includes('mexico') || cityLower.includes('cdmx')) {
    country = 'MX';
    language = 'es';
    paymentPreference = 'instant_bank';
  }

  if (vipInvite?.locale === 'en' || vipInvite?.locale === 'es' || vipInvite?.locale === 'fr') {
    language = vipInvite.locale;
  }

  const device: PersonaDevice = lead.instagram_handle
    ? 'mobile_ig_webview'
    : lead.tiktok_handle
      ? 'mobile_tiktok_webview'
      : 'mobile_safari';

  const isApproved =
    lead.status === 'approved_onboarded' || Boolean(vipInvite?.code);

  return {
    id: lead.id,
    name: lead.full_name || undefined,
    handle: lead.instagram_handle || lead.tiktok_handle || undefined,
    email: lead.email || undefined,
    vipCode: vipInvite?.code || undefined,
    role: 'creator',
    age: 22,
    country,
    origins: cityRaw || country,
    language,
    device,
    intent: 'sensual_glamour',
    cryptoFamiliarity: country === 'AR' ? 'basic' : 'none',
    paymentPreference,
    hasPreApprovedFastTrack: isApproved,
    hasThreePhotosReady: true,
    hasRegisteredTaxId: false,
    stalledAtStep: latestStalledStep || null,
  };
}

export const PRESET_PERSONAS: Record<string, PersonaSpec> = {
  colombia_ig_creator: {
    id: 'colombia_ig_creator',
    name: 'Valentina (Medellín IG Creator)',
    handle: '@valentina.med',
    role: 'creator',
    age: 21,
    country: 'CO',
    origins: 'Medellín, Colombia',
    language: 'es',
    device: 'mobile_ig_webview',
    intent: 'sensual_glamour',
    cryptoFamiliarity: 'none',
    paymentPreference: 'instant_bank',
    hasPreApprovedFastTrack: false,
    hasThreePhotosReady: true,
    hasRegisteredTaxId: false,
  },
  morocco_vip_creator: {
    id: 'morocco_vip_creator',
    name: 'Sofia (Casablanca VIP Fast-Track)',
    handle: '@sofia.casa',
    vipCode: 'sofia-vip90',
    role: 'creator',
    age: 24,
    country: 'MA',
    origins: 'Casablanca, Morocco',
    language: 'fr',
    device: 'mobile_safari',
    intent: 'sensual_glamour',
    cryptoFamiliarity: 'basic',
    paymentPreference: 'local_bank_rib',
    hasPreApprovedFastTrack: true,
    hasThreePhotosReady: true,
    hasRegisteredTaxId: true,
  },
  spain_lifestyle_creator: {
    id: 'spain_lifestyle_creator',
    name: 'Lucía (Madrid Lifestyle Creator)',
    handle: '@lucia.madrid',
    vipCode: 'lucia-es90',
    role: 'creator',
    age: 26,
    country: 'ES',
    origins: 'Madrid, Spain',
    language: 'es',
    device: 'mobile_safari',
    intent: 'lifestyle_sfw',
    cryptoFamiliarity: 'basic',
    paymentPreference: 'instant_bank',
    hasPreApprovedFastTrack: true,
    hasThreePhotosReady: true,
    hasRegisteredTaxId: true,
  },
  france_18_card_member: {
    id: 'france_18_card_member',
    name: 'Lucas (Paris 18+ Card Member)',
    role: 'member',
    age: 32,
    country: 'FR',
    origins: 'Paris, France',
    language: 'fr',
    device: 'mobile_safari',
    intent: '18+_adult',
    cryptoFamiliarity: 'none',
    paymentPreference: 'card',
    hasThreePhotosReady: true,
  },
  us_crypto_member: {
    id: 'us_crypto_member',
    name: 'Marcus (Miami USDC Power Member)',
    role: 'member',
    age: 29,
    country: 'US',
    origins: 'Miami, USA',
    language: 'en',
    device: 'desktop_chrome',
    intent: '18+_adult',
    cryptoFamiliarity: 'experienced',
    paymentPreference: 'crypto_usdc',
    hasThreePhotosReady: true,
  },
  romania_switcher_creator: {
    id: 'romania_switcher_creator',
    name: 'Elena (Bucharest Agency Switcher)',
    handle: '@elena.ro',
    role: 'creator',
    age: 22,
    country: 'RO',
    origins: 'Bucharest, Romania',
    language: 'ro',
    device: 'mobile_tiktok_webview',
    intent: '18+_adult',
    cryptoFamiliarity: 'basic',
    paymentPreference: 'instant_bank',
    hasPreApprovedFastTrack: true,
    hasThreePhotosReady: true,
    hasRegisteredTaxId: false,
  },
};
