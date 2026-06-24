/**
 * SESSION AI Assistant — Integration Test Suite v3
 *
 * Tests:
 *  1. Legal Contract Audit (NY Labor Law Art. 36 + FTC flags)
 *  2. Content Ops Strategy Generator (FTC disclosure on sponsored)
 *  3. Chat Simulation — Level 3 Friendly devGaugeScore=22 (should SUCCEED)
 *  4. Chat Simulation — Level 4 Close Friend devGaugeScore=36 (should BLOCK 403)
 *
 * Sandbox / dev convenience:
 *  - No SUPABASE_SERVICE_ROLE_KEY required.
 *  - Routes skip ai_agent_active DB gate in dev mode automatically.
 *  - devGaugeScore parameter bypasses DB relationship lookup.
 *  - Gemini key is optional — local generators used as fallback.
 *
 * Requirements:
 *  - Dev server running at http://localhost:3000
 */

const BASE_URL   = 'http://localhost:3000';
const CREATOR_ID = 'cb17c0c2-e735-4744-a190-935a6b75b007'; // Elena

// ─── Helpers ─────────────────────────────────────────────────────────────────
let passed = 0;
let failed = 0;

function assert(condition, label) {
  if (condition) {
    console.log(`  ✅ ${label}`);
    passed++;
  } else {
    console.log(`  ❌ ${label}`);
    failed++;
  }
}

async function get(path) {
  const res = await fetch(`${BASE_URL}${path}`);
  let data = null;
  try { data = await res.json(); } catch { /**/ }
  return { status: res.status, data };
}

async function post(path, body) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  let data = null;
  try { data = await res.json(); } catch { /**/ }
  return { status: res.status, data };
}

// ─── Test 1: Legal Contract Audit ────────────────────────────────────────────
async function test1_LegalAudit() {
  console.log('\n━━━ Test 1: Legal Contract Audit ━━━');

  const contractText = `
    MANAGEMENT AGREEMENT
    Agency will represent Creator under the following terms:
    1. COMMISSION: Creator agrees to pay Agency a fee equal to 35% of all gross earnings.
    2. DIGITAL REPLICA: Agency shall have the exclusive, perpetual, worldwide right to
       create, reproduce, and utilise a digital replica, avatar, or voice clone of
       Creator's likeness for automated chatbot communications without separate written consent.
    3. AUTO-RENEWAL: This agreement shall renew automatically every 12 months unless
       terminated in writing 90 days before the renewal date.
  `;

  const { status, data } = await post('/api/v2/legal-audit', { contractText });

  assert(status === 200, `HTTP 200 OK (got ${status})`);
  assert(Array.isArray(data?.risks), 'Response has risks array');
  // Gemini may merge related clauses (e.g. combine commission + renewal);
  // the category assertions below are the real quality checks.
  assert((data?.risks?.length ?? 0) >= 2, `≥2 risk flags detected (got ${data?.risks?.length})`);

  // Each risk is an AuditRisk object: { clause, finding, severity, lawReference, recommendation }
  const riskText = r => `${r?.clause ?? ''} ${r?.finding ?? ''} ${r?.lawReference ?? ''}`.toLowerCase();

  assert(
    data?.risks?.some(r => riskText(r).includes('commission') || riskText(r).includes('35%')),
    'Flagged: commission rate > 20%'
  );
  assert(
    data?.risks?.some(r => riskText(r).includes('likeness') || riskText(r).includes('replica') || riskText(r).includes('digital')),
    'Flagged: likeness/digital replica rights (NY Art. 36)'
  );
  assert(
    data?.risks?.some(r => riskText(r).includes('renew') || riskText(r).includes('sunset') || riskText(r).includes('termination')),
    'Flagged: automatic renewal / missing sunset clause'
  );

  const mode = data?._sandboxMode ? ' [sandbox — heuristic engine]' : ' [Gemini engine]';
  if (data?.summary) console.log(`  📋 Summary${mode}: ${data.summary.slice(0, 130)}…`);
}

// ─── Test 2: Content Ops Generator ───────────────────────────────────────────
async function test2_ContentOps() {
  console.log('\n━━━ Test 2: Content Ops Generator (Sponsored) ━━━');

  const { status, data } = await post('/api/v2/copilot/content-ops', {
    creatorId: CREATOR_ID,
    topic: 'Fitness workout motivation routine',
    isSponsored: true,
  });

  assert(status === 200, `HTTP 200 OK (got ${status})`);
  assert(typeof data?.suggestion === 'string', 'Response has suggestion string');

  const text = data?.suggestion?.toLowerCase() ?? '';
  assert(text.includes('#ad') || text.includes('#sponsored'), 'FTC disclosure (#ad or #sponsored) present');
  assert(data?.isAiGenerated === true, 'isAiGenerated flag is true');

  const mode = data?._sandboxMode ? ' [sandbox — local generator]' : ' [Gemini]';
  if (data?.suggestion) console.log(`  📝 Preview${mode}: ${data.suggestion.slice(0, 160).replace(/\n/g, ' ')}…`);
}

// ─── Test 3: Chat Simulation — Level 3 Friendly ───────────────────────────────
async function test3_ChatSimulation_Friendly() {
  console.log('\n━━━ Test 3: Chat Simulation — Level 3 Friendly (devGaugeScore=22, expect 200) ━━━');

  const { status, data } = await post('/api/v2/copilot/chat-simulation', {
    creatorId: CREATOR_ID,
    targetId: '00000000-0000-0000-0000-000000000001',
    messageContext: 'Hey! I loved your last post about morning routines.',
    devGaugeScore: 22,  // sandbox override — simulates Friendly relationship level
  });

  assert(status === 200, `HTTP 200 OK (got ${status})`);
  assert(typeof data?.draftText === 'string' && data.draftText.length > 0, 'Draft reply text returned');
  assert(data?.isAiGenerated === true, 'isAiGenerated flag is true');
  assert(data?.resolvedLevel !== 'close', `Resolved level is not "close" (got "${data?.resolvedLevel}")`);

  const mode = data?._sandboxMode ? ' [sandbox]' : '';
  if (data?.draftText) console.log(`  💬 Draft${mode}: "${data.draftText.slice(0, 120)}"`);
  if (status !== 200) console.log(`  ℹ️  Error: ${data?.error}`);
}

// ─── Test 4: Chat Simulation — Level 4 Close Friend (blocked) ────────────────
async function test4_ChatSimulation_Close_Blocked() {
  console.log('\n━━━ Test 4: Chat Simulation — Level 4 Close Friend (devGaugeScore=36, expect 403) ━━━');

  const { status, data } = await post('/api/v2/copilot/chat-simulation', {
    creatorId: CREATOR_ID,
    targetId: '00000000-0000-0000-0000-000000000002',
    messageContext: 'We talk every day now!',
    devGaugeScore: 36,  // sandbox override — simulates Close Friend relationship level
  });

  assert(status === 403, `HTTP 403 Forbidden (got ${status})`);
  assert(data?.isBlocked === true, 'isBlocked flag is true');
  assert(
    data?.error?.toLowerCase().includes('human mode') || data?.error?.toLowerCase().includes('close friend'),
    'Error message references human mode / close friend'
  );

  console.log(`  🚫 Block message: "${data?.error?.slice(0, 100)}"`);
}

// ─── Test 5: Chat Simulation — Below minimum match count (expect 403) ────────
async function test5_ChatSimulation_NotEnoughMatches() {
  console.log('\n━━━ Test 5: Below 30 Matches (devMatchCount=5, expect 403 notEligible) ━━━');

  const { status, data } = await post('/api/v2/copilot/chat-simulation', {
    creatorId: CREATOR_ID,
    targetId: '00000000-0000-0000-0000-000000000001',
    messageContext: 'Hey! love your content.',
    devGaugeScore: 22,    // Friendly level — normally allowed
    devMatchCount: 5,     // Only 5 matches — below the 30 threshold
  });

  assert(status === 403, `HTTP 403 Forbidden (got ${status})`);
  assert(data?.notEligible === true, 'notEligible flag is true');
  assert(typeof data?.matchCount === 'number', `matchCount returned (got ${data?.matchCount})`);
  assert(data?.matchCount === 5, `matchCount echoes devMatchCount=5 (got ${data?.matchCount})`);
  assert(data?.requiredMatches === 30, `requiredMatches is 30 (got ${data?.requiredMatches})`);
  assert(
    data?.error?.includes('30') || data?.error?.includes('matches'),
    'Error message references 30 matches'
  );

  console.log(`  🔒 Block message: "${data?.error?.slice(0, 120)}"`);
}

// ─── Runner ──────────────────────────────────────────────────────────────────
async function runTests() {
  console.log('🧪  SESSION AI Assistant — Integration Test Suite');
  console.log('   Server :', BASE_URL);
  console.log('   Creator:', CREATOR_ID);

  // Query setup route to understand environment
  const { data: setupInfo } = await get('/api/v2/test-setup?action=add_relationships');
  const isSandbox = setupInfo?._sandboxMode;
  console.log(`   Mode   : ${isSandbox ? '🏖️  Sandbox (devGaugeScore, local generators)' : '🔑  Full (service key + Gemini)'}`);
  if (setupInfo?.message) console.log(`   ℹ️   ${setupInfo.message}`);

  await test1_LegalAudit();
  await test2_ContentOps();
  await test3_ChatSimulation_Friendly();
  await test4_ChatSimulation_Close_Blocked();
  await test5_ChatSimulation_NotEnoughMatches();

  // Cleanup (no-op in sandbox, real cleanup with service key)
  await get('/api/v2/test-setup?action=cleanup');

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`Results: ${passed} passed / ${failed} failed / ${passed + failed} total`);
  if (failed === 0) {
    console.log('🎉 All tests passed!');
  } else {
    console.log('⚠️  Some tests failed — review output above.');
    process.exitCode = 1;
  }
}

runTests().catch(err => {
  console.error('Fatal test runner error:', err);
  process.exitCode = 1;
});
