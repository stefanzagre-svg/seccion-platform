# SECCION — Project & Brand Guidelines

## 🏷️ Brand Name & Pronunciation Rules

- **Branding Representation**: Always written in all caps as **SECCION** (standard Latin characters, no slashed 'Ø').
- **Pronunciation by Language**:
  - 🇬🇧 **English**: Pronounced *"Session"*
  - 🇫🇷 **French**: Pronounced *"Session"*
  - 🇪🇸 **Spanish**: Pronounced *"Sesión"*
- **AI Voice Generators**: When pasting scripts into an AI voice generator, write SECCION phonetically as "Session" (or "Sesh-un") so the AI pronounces it flawlessly every time.

## 🎨 Official Branding Assets

For all communication, design projects, and social media content creation, strictly use the following assets located in `web/public/assets/logo/`:
- **Icon Logo (Light)**: `seccion-icon-light.png`
- **Icon Logo (Dark)**: `seccion-icon-dark.jpg`
- **Wordmark (Light)**: `seccion-wordmark-light.png`
- **Wordmark (Dark)**: `seccion-wordmark-dark.png`

Always use these files for any platform development or content requiring SECCION's branding.

---

## 🚀 Platform Architecture & Audit Ledger (Synced with Antigravity 2.0 & IDE)

> **Last Synced**: 2026-09-03  
> **Production Cloudflare Version ID**: `e556f604-e254-47a5-8995-6f0198e2fb87` (commit `e744eb3` / Server-Side Image Blur Deployed)  
> **Live Production URL**: `https://seccion.ai` & `https://www.seccion.ai`  
> **Unit Test Suite**: 74 / 74 PASSING (`npm test` / `vitest run --globals`)  
> **E2E Certification Suite**: 19 / 19 PASSING across 6 Stages (`npm run test:e2e`)  
> **Scale Stability & Reliability Ratio**: **95.20% Target Verified**

### 🏆 Audit Execution Scorecard

- 🔴 **CRITICAL (5/5 ALL RESOLVED 🏆)**:
  - `[✓]` **C1**: Server-side `getUser()` ownership validation in `/api/kyc/verify`
  - `[✓]` **C2**: `getUser()` session spoofing fix applied across all API routes
  - `[✓]` **C3**: Authenticated user check in `/api/v2/messages/analyze`
  - `[✓]` **C4**: Distributed rate-limiting in Supabase database
  - `[✓]` **C5**: Wired real 3rd-party KYC provider via **DIDIT Zero-Knowledge Identity Gateway** (`verify.didit.me`) + webhook handler (`/api/kyc/didit-webhook`) & Sightengine Age/Liveness.

- 🟠 **HIGH (6/6 ALL RESOLVED 🏆)**:
  - `[✓]` **H1**: Eliminated un-cached middleware DB query on every request
  - `[✓]` **H2 / M2**: Zero-overhead Sentry Store API error logging (`src/lib/error-logger.ts`)
  - `[✓]` **H3**: Dynamic pricing fallback when DB is offline
  - `[✓]` **H4**: Webhook signature verification in Telegram & Cloudflare endpoints
  - `[✓]` **H5**: Content DRM security on premium media uploads
  - `[✓]` **H6**: Atomic credit balance check before assistant query execution

- 🟡 **MEDIUM (8/8 ALL RESOLVED 🏆)**:
  - `[✓]` **M1 / M3**: Shared TypeScript API contracts barrel (`src/types/api-responses.ts`)
  - `[✓]` **M4**: Dynamic stream buffer handling in AI assistant
  - `[✓]` **M5**: SHA-256 Web Crypto consent hash in `SuggestionMovesModal.tsx`
  - `[✓]` **M6**: Dark glassmorphism skeleton & error boundaries (`loading.tsx`, `error.tsx`)
  - `[✓]` **M7**: Dynamic import code-splitting for heavy feed modals (`PlatformFeed.tsx`)
  - `[✓]` **M8**: 60fps GPU particle canvas with reduced-motion detection (`MatchParticleCanvas.tsx`)

- 🟢 **LOW (6/6 ALL RESOLVED 🏆)**:
  - `[✓]` **L1**: 74 Vitest unit tests in `src/lib/*.test.ts` (pricing-service, date-plan-db, profile-utils, nowpayments, rating-engine, fusion-engine)
  - `[✓]` **L2**: Strong TypeScript typing in `src/lib/supabase-safe.ts`
  - `[✓]` **L3**: Removed unauthenticated `x-dev-user-id` header bypasses across all routes
  - `[✓]` **L4**: Expanded middleware matcher regex for static assets, favicons, and `llms.txt`
  - `[✓]` **L5**: PII log sanitization across all Segpay billing endpoints
  - `[✓]` **L6**: Typed `RatingTargetProfile` interface in `src/lib/rating-engine.ts`

### 📱 Mobile Ergonomics Status (iOS & Android)
- **Safe Area Bottom Inset**: `pb-[calc(0.625rem+env(safe-area-inset-bottom,0px))]` applied on `.mobile-bottom-nav`
- **Native Touch Target Compliance**: Min 48dp / 44pt target sizes across all swipe actions
- **Mobile Card Swiper Haptics**: `navigator.vibrate([20, 50, 20])` enabled for card swipes

### 🆕 Post-Audit Feature Additions (Aug 6–10)
- **[✓] CreatorQuest**: 5-stage identity onboarding quest with Health & Psychology specialization
- **[✓] Member Purpose Logic**: Minimum required field enforcement before feed access
- **[✓] Advanced Search Filters**: Profile Status (Member/Creator), age/height min/max
- **[✓] SEO Infrastructure**: Native `sitemap.ts` + `robots.ts` + canonical URL de-indexing fix
- **[✓] AI Wingman Tests**: Cookie-based JWT auth test suite, 18/18 assertions passing
- **[✓] Match Engine Stability**: Null guard on `ARCHETYPE_PROFILES` lookup
- **[✓] PWA Auto-Close**: `about:blank` redirect after native app install
- **[✓] Slop Cleanup (Wave 1 & 2)**: Dead code removed, weak types eliminated, scoring constants standardized
- **[✓] Clean Code Audit (Tasks 3.1, 3.2, 3.3, 2.1, 2.2, 2.3)**: `MemberMediaTab`, `CreatorGoalsTab`, `useAvatarUpload`, and pricing tests completed
- **[✓] SEO Content & AI Crawlers**: AI-SEO / GEO strategy, `robots.txt` updated for GPTBot/ClaudeBot/PerplexityBot, JSON-LD schema integration

### 🧹 Platform Integrity & Global Outreach (Aug 11–26)
- **[✓] Demo Login Removal**: Removed `handleDemoLogin` (113 lines), `isMockPhoneMode`, `123456` OTP bypass from `RegistrationGate.tsx` — no more ghost Supabase accounts
- **[✓] Creator Onboarding Fix**: `?role=creator` URL param + `useEffect` mount fix in `onboarding/page.tsx`; both `/become-creator` CTAs now pass `?role=creator` correctly
- **[✓] Mock Profiles Purged**: Removed all `elena/sofia/valentina` hardcoded data + `mock-user-id` fallbacks from `member/page.tsx` — empty states replace mock match/goal injection
- **[✓] Photo Copy Corrected**: Onboarding requirement now reads **1 profile avatar + 2 public album photos** (was ambiguous "min 2 photos")
- **[✓] `/stream-demo` Auth-Gated**: Added to middleware `PROTECTED_ROUTES` — unauthenticated → `/login`
- **[✓] NOWPayments Crypto Gateway (`b2722db`)**: USDT (TRC20/Polygon), USDC, BTC gateway with automated 90%/80% revenue split & Creator Studio payout wallet settings
- **[✓] Global Creator Outreach**: Worldwide option (`global_other`) added to `become-creator`, smart handle/URL normalizer, multilingual FAQ explaining Day 1 worldwide access
- **[✓] 18 Specialization Filters**: Added full category chip coverage (including AI & Tech, Fashion, Career, Wellness) with EN/ES labels and archetype bindings
- **[✓] Creator Approval Messaging Protocol**: Confirmation emails, WhatsApp, and Telegram approval notifications MUST include direct links to `/onboarding?role=creator&email={email}` or `/login?email={email}` redirecting creators directly to the Registration Gate with their approved status pre-loaded.
- **[✓] Supabase Cleanup SQL**: `web/scripts/cleanup_demo_accounts.sql` ready to purge stale `guest_*/demo-*` rows
- **[✓] C5 KYC Provider**: Live **DIDIT Zero-Knowledge Identity Gateway** (`verify.didit.me`) & Sightengine AI integrated
- **[⏳] Run cleanup_demo_accounts.sql**: Execute once in Supabase SQL Editor (service role) to purge existing ghost rows
- **[⏳] Dynamic Founding Spots Counter**: Trigger display when creator applications hit 50 milestone
- **[⏳] Company Web3 Wallet in NOWPayments**: Configure SECCION treasury wallet (USDT Polygon / TRC20) in NOWPayments payout settings
- **[⏳] NCMEC ESP Registration**: Register `SECCION AI CONCEPT S.L.` on `report.cybertip.org` as an Electronic Service Provider once company tax number (CIF) is issued
- **[⏳] Segpay Live Production Credentials**: Plug `MERCHANT_ID`, `PACKAGE_ID`, and `SECRET_KEY` into `.env.local` upon final merchant account approval from Steve / Segpay


---

## 🎯 Architectural Refactoring Roadmap (Component Decomposition Sprints — ALL COMPLETE 🏆)

### ⚡ Sprint 1: Feed Decomposition (`PlatformFeed.tsx` — 100% COMPLETE 🏆)
- **[✓] `FeedCardSwiper.tsx`**: Extracted Framer Motion gesture physics, ZKP face-blur, DRM previews, and synergy tooltips.
- **[✓] `FeedFilterBar.tsx`**: Extracted purpose, vibe, archetype, and all 18 specialization filter controls + advanced search drawer.
- **[✓] `FeedPaywallModal.tsx`**: Extracted tier gating, PPV unlocking dialog, and subscription unlock dialogs.

### ⚡ Sprint 2: Member Dashboard Modularization (`profile/member/page.tsx` — 100% COMPLETE 🏆)
- **[✓] `MemberMediaTab.tsx`**: Extracted media gallery, upload inputs, and relationship level gating.
- **[✓] `MemberConnectionsTab.tsx`**: Extracted dual-gauge harmonic relationship tracker with all 8 RLS relationship levels, active matches, and Suggestion Moves.
- **[✓] `MemberRosterTab.tsx`**: Extracted active subscription management, tier breakdown, and auto-renew cancellation controls.
- **[✓] `MemberInsightsTab.tsx`**: Extracted AI profile vectors, emotional aura bento cards, and prompt answer displays.

### ⚡ Sprint 3: Creator Studio Modularization (`studio/page.tsx` — 100% COMPLETE 🏆)
- **[✓] `CreatorGoalsTab.tsx`**: Extracted crowdfunding campaigns and backer feed.
- **[✓] `StudioStreamTab.tsx`**: Extracted live broadcast cockpit, viewer chat feed, and 18 U.S.C. § 2257 co-performer consent management.
- **[✓] `StudioContentOpsTab.tsx`**: Extracted DRM upload manager, ZKP face blur, and Content Provenance selector.
- **[✓] `StudioAnalyticsTab.tsx`**: Extracted 90% Founding Creator net revenue split metrics, conversion graphs, and escrow payout settlement tables.

---

## 🌐 Multilingual Deployment Protocol

> **Rule**: Any new text, label, error message, button, placeholder, hint, or UI copy added in English **MUST** be simultaneously translated into all active languages. Currently active: **ES (Spanish)**.

### ⚙️ Implementation Pattern

Every user-facing string in a component MUST use the `t()` helper from `useTranslation()` with an inline English fallback:

```tsx
// ✅ CORRECT — translatable, fallback safe
t("onboarding.creatorExt.bioLabel", "Creator Bio")

// ❌ WRONG — hardcoded, not translatable
"Creator Bio"
```

Translation keys are stored in:
- `web/src/locales/en.json` — English source
- `web/src/locales/es.json` — Spanish translation

Both files MUST be updated atomically in the same commit as the feature.

---

### 🗣️ Translation Quality Rules (via `/seccion-math-to-magic-skill`)

1. **Use natural, culturally fluent Spanish** — not machine-translated output. Phrasing must match Gen Z creator & member vernacular in Latin America and Spain.
2. **Apply Math to Magic tone** — technical jargon in EN gets human, financial, or social equivalents in ES (e.g., *Synergy Engine* → *Motor de Sinergia*, not *Motor de Sincronía Algorítmica*).
3. **Never translate globally recognized EN brand/platform words** — the following stay in English across all locales:
   - Platform terms: `VIP`, `Creator`, `Studio`, `Creator Studio`, `Wingman`, `Synergy`, `Feed`, `Stream`, `Quest`
   - UI/Tech universals: `Bio`, `DM`, `URL`, `VIP`, `FAQ`, `OnlyFans`, `Vimeo`, `YouTube`
   - SECCION brand terms: `SECCION`, `Warm Paywall`, `Face Blur`, `Match`, `Roster`
4. **Avoid false friends** — e.g., do not translate `"vibe"` as `"vibración"` (wrong connotation); use `"vibra"` or `"onda"`.
5. **Tone**: Peer-level, high-status, warm — never cold corporate or robotic helpdesk language.

---

### 🔁 Trigger Checklist for Any Agent

When adding or editing any UI text:
- [ ] Wrap string in `t("section.key", "EN fallback")`
- [ ] Add key + EN value to `web/src/locales/en.json`
- [ ] Add key + ES translation to `web/src/locales/es.json`
- [ ] Validate both JSON files parse correctly (`ConvertFrom-Json`)
- [ ] ES translation reviewed against Math to Magic tone imperatives

---

## 🎨 Creator Intent & Content Synergy Protocol (via `/seccion-creator-intent-protocol`)

When introducing a new **Creator Intent, Content Synergy, or Specialization** (e.g. `ai_tech`, `fitness`, `beauty`), execute the mandatory 5-stage pipeline:
1. **Constants & Prompts (`constants.ts`)**: Add to `CREATOR_SPECIALIZATIONS`, plus symmetrical EN & ES prompt questions in `PURPOSE_PROMPTS` & `PURPOSE_PROMPTS_ES`.
2. **Onboarding & Quests**: Update `SPECIALIZATIONS` & `SPECIALIZATIONS_ES` in `CreatorQuest.tsx`, and `INTENTS` / `CORE_PASSIONS` in `IntentSelector.tsx`.
3. **Filters & Feed Discovery**: Update `SHORT_TITLES` & `SHORT_TITLES_ES` in `SpecializationFilter.tsx` and add mock showcase archetypes in discovery.
4. **Multilingual Sync**: Sync translation keys across `en.json` & `es.json` using Math-to-Magic tone.
5. **Validation**: Verify type-safety with `npx tsc --noEmit`.


