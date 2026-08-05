/**
 * SECCIØN Platform — API Response Schema Contracts
 *
 * M3 ARCHITECTURE STANDARD:
 * ─────────────────────────────────────────────────────────────────────────────
 * Defines shared TypeScript contracts for all API route responses (v1, v2, admin).
 * Import these interfaces in API route handlers and client-side fetchers to ensure
 * zero-any type safety and prevent API versioning drift.
 */

// ── 1. Generic & Base Responses ──────────────────────────────────────────────

export interface ApiErrorResponse {
  error: string;
  details?: unknown;
  code?: string;
  _sandbox?: boolean;
}

export interface ApiSuccessMessageResponse {
  success: boolean;
  message: string;
}

// ── 2. Auth & KYC Endpoints ──────────────────────────────────────────────────

export interface KycVerifyResponse {
  success: boolean;
  message: string;
  userId: string;
  is_kyc_verified: boolean;
}

export interface CreatorApplyResponse {
  success: boolean;
  applicationId: string;
  status: 'pending' | 'approved' | 'rejected';
  message: string;
}

export interface RedeemAiPasscodeResponse {
  success: boolean;
  message: string;
  passcode: string;
  expiryDate: string;
}

// ── 3. Billing & Checkout Endpoints ──────────────────────────────────────────

export interface BillingCheckoutResponse {
  url: string;
  mock?: boolean;
}

export interface PurchaseCreditsResponse {
  success: boolean;
  newCredits: number;
  message: string;
}

// ── 4. AI & Assistant Endpoints ─────────────────────────────────────────────

export interface AssistantChatResponse {
  text: string;
  credits: number;
  isTrial: boolean;
  trialDaysLeft: number;
  suggestedAction?: string;
}

export interface CopilotChatSimResponse {
  draftText: string;
  resolvedLevel: string;
  isAiGenerated: boolean;
  replicantCreatorName: string;
  _sandboxMode?: boolean;
}

export interface CopilotContentOpsResponse {
  suggestion: string;
  isAiGenerated: boolean;
  _sandboxMode?: boolean;
}

export interface MessagesAnalyzeResponse {
  conversationGravity: number;
  extractedTraits: string[];
  summary: string;
  bonusApplied: number;
}

// ── 5. Intent & Social Endpoints ─────────────────────────────────────────────

export interface IntentCreateResponse {
  success: boolean;
  plan_id: string;
  message: string;
}

export interface IntentRespondResponse {
  success: boolean;
  application_id: string;
  status: 'applied' | 'accepted' | 'declined';
  message: string;
}

export interface WaitlistJoinResponse {
  success: boolean;
  message: string;
  position?: number;
}

// ── 6. Integrations & Live Streaming ───────────────────────────────────────

export interface LivekitTokenResponse {
  token: string;
  wsUrl: string;
  roomName: string;
}

export interface CloudflareUploadUrlResponse {
  uploadUrl: string;
  mediaId: string;
}
