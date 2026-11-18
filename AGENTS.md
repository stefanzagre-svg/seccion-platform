# SECCION — Core Agent Rules & Canonical Navigation (`web/`)

> Synchronized mirror of `SESSION/AGENTS.md`. Structured by **6-Part Memory Engineering** (`RULES <= 20` | `FACTS` overwrite in place | `LOG` in maps).

## Always-Loaded RULES (Hard Cap <= 20)

1. **Brand Representation**: Always write **SECCION** in all caps (no slashed `Ø`). Phonetic cue for EN/FR voice: `"Session"`; ES: `"Sesión"`. Strictly use logo files from `web/public/assets/logo/`.
2. **Deep Reasoning & Zero Placeholders**: Verify security boundaries, `FOR UPDATE` concurrency invariants, and GDPR/DSA/EU AI Act/18 U.S.C. § 2257 liabilities before coding. Deliver complete code without `// TODO` stubs.
3. **Math to Magic & Human-First Copy**: Translate technical architecture into plain human outcomes; frame AI strictly as an assistant for real people (never `"AI Dating"`, never pitch internal tool names like `"DRM"` or `"RLS"` in user copy).
4. **3-Way Multilingual Parity (`EN`/`ES`/`FR`)**: Every user-facing string MUST use `t("key", "EN fallback")` with simultaneous `en.json`, `es.json`, and `fr.json` updates. Keep platform brand terms (`VIP`, `Creator`, `Studio`, `Wingman`, `SECCION`) untranslated; avoid false friends (`vibra`, never `vibración`).
5. **Browser Baseline 2024 & WebView Safety**: Target Baseline 2024 on public/conversion routes (`/become-creator`, `/onboarding`, `/login`, `/[username]`); keep any fallback `<= 20` lines, zero external polyfills, and test WebKit + Chromium.
6. **Outreach Account Isolation & Limits**: Never link banned `@seccionplatform` assets to `@seccion.ai`, `@steveseccion`, `seccioncreatorstudio`, or `seccion ai`. Enforce `18–22` actions/day, `.vault/STOP` check, zero URLs in cold DM #1, and Jaccard `< 0.45`.
7. **Paid Ads vs. Organic DM Boundary**: Paid ad creatives/OCR (`X`, `Meta`, `TikTok`) must use B2B Studio framing only (`Creator Business Tools`, `AI Community Copilot`) with zero `90%`/`80%` claims or adult keywords; toggle TikTok `AI-generated content = ON` and `Your brand = ON`.
8. **Cloudflare Worker Compatibility**: Keep `web/src/middleware.ts` on OpenNext’s officially supported edge runtime (do not migrate to `proxy.ts` while OpenNext flags Node middleware experimental). Keep Node-only modules (`node:crypto`) out of client bundles.
9. **Atomic Verification & Deploy Sync**: Run `npx tsc --noEmit` and `npm test` before claiming passes; after any production deploy, atomically update matching `Production Cloudflare Version ID` across `SESSION/AGENTS.md`, `web/AGENTS.md`, `PROJECT_STATUS.md`, and `.harness/`.
10. **Trace-to-Regression & Memory Hygiene**: Lock every real production/QA bug as a test (`web/**/*.test.ts` or `.harness/tests/`). Log 1-line lessons to maps (never transcripts); overwrite facts in place; expire 7d notes / archive 30d stale rules; run `.harness/` Monday human review.

---

## SECCION Executive Team Roster

- **Stefan** — Founder & Architect (final architecture & product direction)
- **Kate** — Executive AI Outreach & Creator Acquisition (`CRM`, `/vip/[code]`, friction coaching)
- **Sophia** — Platform SEO-AEO & Dual-Sided Trend Radar (`EN`/`ES`/`FR` growth & search intelligence)
- **Pavel** — Software Product Engineer (resilience, efficiency, strict typing & security)
- **Lukas** — Administrator & Financial Stack (Spanish S.L.U. admin, tax & 3-ring payouts)

---

## Canonical Live FACTS (Overwrite in Place)

- **Live Production URL**: `https://seccion.ai` & `https://www.seccion.ai` (`www` -> `301` apex)
- **Production Cloudflare Version ID**: 40ed6810-dcae-426e-bb01-6785a26d93a3
- **Medium Editorial**: `https://medium.com/@seccionadmin/i-built-a-creator-platform-that-pays-90-and-replaces-40-management-agencies-with-ai-heres-what-2170851fa9ef`
- **Unit & Stress Test Suite**: `45 / 45` files, `463 / 463` tests PASSING (`npm test -- --run` in `web/`)
- **E2E Certification Suite**: `20 / 20` PASSING across Stages 1–6 + onboarding guide (`npm run test:e2e`)
- **Active Locales**: `EN`, `ES`, `FR` (100% 3-way parity)
- **Official Social Accounts**: Instagram `@seccion.ai` | X `@steveseccion` | TikTok `@seccioncreatorstudio` | Facebook `seccion ai` (`61588742763454`) | YouTube `@Seccion-Platform` | WhatsApp & Telegram `+34 662 907 153` | VKontakte `vk.ru/id200006515840`
- **Open Pre-Launch Backlog**:
  - `[⏳]` Execute `web/scripts/cleanup_demo_accounts.sql` once in Supabase SQL Editor (service role)
  - `[⏳]` Configure NOWPayments company Web3 wallet (Circle `USDC` Polygon/Solana — MiCA compliant)
  - `[⏳]` Complete NCMEC ESP verification (`report.cybertip.org`) & IURE `Titularidad Real`

---

## Progressive Context Recall Index (`../.harness/maps/` & `../Obsidian/`)

Load only the domain map matching your current task:
- `../.harness/maps/architecture-web.md` — Next.js 16.4, OpenNext Cloudflare 1.20, LiveKit, Gemini & SynthID
- `../.harness/maps/security-and-rls.md` — Supabase RLS, DIDIT SDK `0.6.0` KYC, HSTS headers, `FOR UPDATE` ledger locks
- `../.harness/maps/i18n-math-to-magic.md` — EN/ES/FR parity, preserved brand terms, Creator Intent pipeline
- `../.harness/maps/outreach-and-stealth.md` — 12-platform acquisition, TreeSHAP $\tau \ge 0.70$, CDP port `9222`, Kate pacing
- `../.harness/maps/deployment-ledger.md` — Cross-ledger sync rules & `sensor_ledger_sync.py`
- `../.harness/maps/memory-engineering-sop.md` — 6-part memory cycle, trace-to-regression loop & Copilot Cap/TTL
- `../.harness/maps/platform-audit-and-history.md` — Resolved C1–L6 audit archive, ship history, FinStack V3.1 & Morocco 5-layer shield
- `../.harness/maps/learned-guardrails.md` — Auto-promoted guardrails, deadlines & regression alerts
- `../Obsidian/HOME.md` — Executive Second Brain (`[[decisions]]`, `[[Architecture/Financial-Stack-And-Inflow-Outflow-Isolation]]`, `[[inbox]]`)
