// ─── SECCION Geo-Routed Age Assurance & Dual-Workflow Policy Engine ───────────
// Pure, Cloudflare-Worker-safe routing helpers (zero Node-only imports so this
// module can safely be imported in both API routes and Client Components).
// ─────────────────────────────────────────────────────────────────────────────

export type VerificationMode = 'member_age' | 'creator_kyc';

export type AgeAssuranceMethod =
  | 'declared'
  | 'didit_age'
  | 'didit_reusable'
  | 'didit_kyc'
  | 'us_registry'
  | 'eudi_wallet'
  | 'privado_zkp';

export type AgeAssuranceProvider =
  | 'internal'
  | 'didit'
  | 'agechecker'
  | 'openid4vp'
  | 'privado';

export type AgeAssuranceLevel =
  | 'self'
  | 'estimated'
  | 'transactional'
  | 'document'
  | 'cryptographic';

export interface GeoAgeContext {
  countryCode: string;
  regionCode: string | null;
  isStrictUsState: boolean;
  recommendedMethod: 'us_transactional' | 'didit_age';
}

/**
 * US states with active statutory age-verification mandates patterned on
 * Texas HB 1181 (government ID or commercially reasonable transactional data).
 * Evaluated against Cloudflare's free `cf-region-code` ISO 3166-2 subdivision header.
 */
export const STRICT_US_AGE_STATES = new Set<string>([
  'AL',
  'AR',
  'AZ',
  'FL',
  'GA',
  'ID',
  'IN',
  'KS',
  'KY',
  'LA',
  'MO',
  'MS',
  'MT',
  'NC',
  'ND',
  'NE',
  'OH',
  'OK',
  'SC',
  'SD',
  'TN',
  'TX',
  'UT',
  'VA',
  'WV',
  'WY',
]);

export function normalizeCountryCode(raw?: string | null): string {
  if (!raw || typeof raw !== 'string') return 'GLOBAL';
  const cleaned = raw.trim().toUpperCase();
  if (cleaned === 'UK') return 'GB';
  return /^[A-Z]{2}$/.test(cleaned) ? cleaned : 'GLOBAL';
}

export function normalizeRegionCode(raw?: string | null): string | null {
  if (!raw || typeof raw !== 'string') return null;
  const cleaned = raw.trim().toUpperCase();
  return /^[A-Z0-9]{1,6}$/.test(cleaned) ? cleaned : null;
}

export function isStrictUsAgeState(
  countryCode?: string | null,
  regionCode?: string | null
): boolean {
  const country = normalizeCountryCode(countryCode);
  if (country !== 'US') return false;
  const region = normalizeRegionCode(regionCode);
  if (!region) return true; // Fail safe for US traffic when state header is absent
  return STRICT_US_AGE_STATES.has(region);
}

export function resolveGeoAgeContext(params: {
  countryCode?: string | null;
  regionCode?: string | null;
}): GeoAgeContext {
  const countryCode = normalizeCountryCode(params.countryCode);
  const regionCode = normalizeRegionCode(params.regionCode);
  const strictUs = isStrictUsAgeState(countryCode, regionCode);

  return {
    countryCode,
    regionCode,
    isStrictUsState: strictUs,
    recommendedMethod: strictUs ? 'us_transactional' : 'didit_age',
  };
}

export const DEFAULT_CREATOR_KYC_WORKFLOW_ID = '6cfcca5f-5f49-4226-b005-cbb22fd92b6b';
export const DEFAULT_MEMBER_AGE_WORKFLOW_ID = '9a941d9f-5bb5-4bb9-b704-734d3c29b54c';

export interface DiditWorkflowEnv {
  creatorWorkflowId?: string;
  memberAgeWorkflowId?: string;
  legacyWorkflowId?: string;
}

/**
 * Resolves the target DIDIT workflow ID for `member_age` (Adaptive Age Estimation ~$0.10)
 * vs. `creator_kyc` (Full Core KYC + OFAC/PEP AML ~$0.58-$0.83).
 */
export function resolveDiditWorkflowId(
  mode: VerificationMode,
  env: DiditWorkflowEnv = {
    creatorWorkflowId: process.env.DIDIT_CREATOR_KYC_WORKFLOW_ID,
    memberAgeWorkflowId:
      process.env.DIDIT_MEMBER_AGE_WORKFLOW_ID || DEFAULT_MEMBER_AGE_WORKFLOW_ID,
    legacyWorkflowId: process.env.DIDIT_WORKFLOW_ID,
  }
): { workflowId: string; isDedicatedMemberWorkflow: boolean } {
  const creatorId =
    env.creatorWorkflowId?.trim() ||
    env.legacyWorkflowId?.trim() ||
    DEFAULT_CREATOR_KYC_WORKFLOW_ID;
  const memberId = env.memberAgeWorkflowId?.trim() || '';

  if (mode === 'member_age' && memberId) {
    return {
      workflowId: memberId,
      isDedicatedMemberWorkflow: memberId !== creatorId,
    };
  }

  return {
    workflowId: creatorId,
    isDedicatedMemberWorkflow: false,
  };
}

/**
 * Server-authoritative webhook workflow classification.
 * NEVER trusts mutable client metadata to elevate `member_age` into `creator_kyc`
 * when distinct workflow IDs are configured.
 */
export function classifyDiditWebhookWorkflow(
  params: {
    payloadWorkflowId?: string | null;
    metadataMode?: string | null;
  },
  env: DiditWorkflowEnv = {
    creatorWorkflowId: process.env.DIDIT_CREATOR_KYC_WORKFLOW_ID,
    memberAgeWorkflowId:
      process.env.DIDIT_MEMBER_AGE_WORKFLOW_ID || DEFAULT_MEMBER_AGE_WORKFLOW_ID,
    legacyWorkflowId: process.env.DIDIT_WORKFLOW_ID,
  }
): {
  mode: VerificationMode;
  grantsCreatorKyc: boolean;
  grantsMemberAge: boolean;
  assuranceMethod: AgeAssuranceMethod;
  assuranceLevel: AgeAssuranceLevel;
} {
  const creatorId =
    env.creatorWorkflowId?.trim() ||
    env.legacyWorkflowId?.trim() ||
    DEFAULT_CREATOR_KYC_WORKFLOW_ID;
  const memberId = env.memberAgeWorkflowId?.trim() || '';
  const incomingWorkflowId = params.payloadWorkflowId?.trim() || '';

  // 1. Authoritative match against dedicated Member Age Estimation workflow
  if (memberId && incomingWorkflowId && incomingWorkflowId === memberId && memberId !== creatorId) {
    return {
      mode: 'member_age',
      grantsCreatorKyc: false,
      grantsMemberAge: true,
      assuranceMethod: 'didit_age',
      assuranceLevel: 'estimated',
    };
  }

  // 2. Authoritative match against Creator Full KYC workflow
  if (incomingWorkflowId && incomingWorkflowId === creatorId) {
    const requestedMember = params.metadataMode === 'member_age' && !memberId;
    if (requestedMember) {
      return {
        mode: 'member_age',
        grantsCreatorKyc: false,
        grantsMemberAge: true,
        assuranceMethod: 'didit_kyc',
        assuranceLevel: 'document',
      };
    }
    return {
      mode: 'creator_kyc',
      grantsCreatorKyc: true,
      grantsMemberAge: true,
      assuranceMethod: 'didit_kyc',
      assuranceLevel: 'document',
    };
  }

  // 3. Unknown workflow_id fails closed on creator KYC escalation
  if (incomingWorkflowId && incomingWorkflowId !== creatorId) {
    return {
      mode: 'member_age',
      grantsCreatorKyc: false,
      grantsMemberAge: true,
      assuranceMethod: 'didit_age',
      assuranceLevel: 'estimated',
    };
  }

  // 4. Legacy payloads without workflow_id field: respect explicit member_age downgrade, else creator_kyc
  if (params.metadataMode === 'member_age') {
    return {
      mode: 'member_age',
      grantsCreatorKyc: false,
      grantsMemberAge: true,
      assuranceMethod: 'didit_age',
      assuranceLevel: 'estimated',
    };
  }

  return {
    mode: 'creator_kyc',
    grantsCreatorKyc: true,
    grantsMemberAge: true,
    assuranceMethod: 'didit_kyc',
    assuranceLevel: 'document',
  };
}

/**
 * Computes a one-way SHA-256 hex digest using standard Web Crypto
 * (compatible with Cloudflare Workers edge runtime without node:crypto).
 */
export async function computeAgeProofHash(provider: string, rawToken: string): Promise<string> {
  const input = new TextEncoder().encode(`${provider}:${rawToken.trim()}`);
  const digest = await crypto.subtle.digest('SHA-256', input);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}
