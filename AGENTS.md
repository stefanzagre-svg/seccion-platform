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

> **Last Synced**: 2026-08-05  
> **Production Cloudflare Version ID**: `8785e768-fb61-444e-ac65-5363eabbf2b8`  
> **Unit Test Suite**: 49 / 49 PASSING (`npm test` / `vitest run --globals`)

### 🏆 Audit Execution Scorecard

- 🔴 **CRITICAL (4/5 Live)**:
  - `[✓]` **C1**: Server-side `getUser()` ownership validation in `/api/kyc/verify`
  - `[✓]` **C2**: `getUser()` session spoofing fix applied across all API routes
  - `[✓]` **C3**: Authenticated user check in `/api/v2/messages/analyze`
  - `[✓]` **C4**: Distributed rate-limiting in Supabase database
  - `[⏳]` **C5 (PENDING ACTION)**: Wire real 3rd-party KYC provider SDK (Shufti Pro / Yoti / Sumsub) when API keys arrive.

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
  - `[✓]` **L1**: 49 Vitest unit tests in `src/lib/*.test.ts`
  - `[✓]` **L2**: Strong TypeScript typing in `src/lib/supabase-safe.ts`
  - `[✓]` **L3**: Removed unauthenticated `x-dev-user-id` header bypasses across all routes
  - `[✓]` **L4**: Expanded middleware matcher regex for static assets, favicons, and `llms.txt`
  - `[✓]` **L5**: PII log sanitization across all Segpay billing endpoints
  - `[✓]` **L6**: Typed `RatingTargetProfile` interface in `src/lib/rating-engine.ts`

### 📱 Mobile Ergonomics Status (iOS & Android)
- **Safe Area Bottom Inset**: `pb-[calc(0.625rem+env(safe-area-inset-bottom,0px))]` applied on `.mobile-bottom-nav`
- **Native Touch Target Compliance**: Min 48dp / 44pt target sizes across all swipe actions
- **Mobile Card Swiper Haptics**: `navigator.vibrate([20, 50, 20])` enabled for card swipes
