# Antigravity Remote Agent Specification for SECCION Platform

This document defines how Google Antigravity Remote Agents execute background tasks on the SECCION web codebase (`https://github.com/stefanzagre-svg/seccion-platform.git`).

---

## 1. Remote Execution Environment
- **Target Subdirectory**: `web/`
- **Node Environment**: Node.js 20.x
- **Package Manager**: npm (`npm ci`)
- **Primary Commands**:
  - `npm test -- --globals` (Run 28 test suites, 294 unit & regression tests)
  - `npx tsc --noEmit` (Strict TypeScript type-safety audit)
  - `npm run test:e2e` (Playwright end-to-end browser verification)

---

## 2. Remote Agent Autonomous Responsibilities
When dispatched via `antigravity.google.com/remote` with your laptop powered off:
1. **Pull & Branch**: Creates an isolated branch for the task (e.g., `remote-agent/task-name`).
2. **Execute Invariants**:
   - Maintains Math to Magic tone across UI components.
   - Preserves bilingual parity between `web/src/locales/en.json` and `web/src/locales/es.json`.
   - Respects Universal Supabase RLS policies and Segpay-free financial gateways.
3. **Verify & Test**: Runs Vitest test suites to ensure 0 regressions.
4. **Pull Request**: Submits a clean GitHub Pull Request against `origin/main` for Stefan's approval.

---

## 3. How to Trigger From Mobile or Cloud
- Navigate to: **`https://antigravity.google.com/remote`**
- Select Repository: **`stefanzagre-svg/seccion-platform`**
- Prompt Example:
  > *"Run a full test suite certification and type-check on branch main, and summarize any failing tests."*
- You can immediately close your phone or laptop. Antigravity handles execution in the cloud.
