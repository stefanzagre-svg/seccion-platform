import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import esbuild from 'esbuild';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const webRoot = path.resolve(__dirname, '..');

function parseCliArgs(argv) {
  const args = {};
  for (const raw of argv) {
    if (!raw.startsWith('--')) continue;
    const trimmed = raw.slice(2);
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) {
      args[trimmed] = 'true';
    } else {
      args[trimmed.slice(0, eqIdx)] = trimmed.slice(eqIdx + 1);
    }
  }
  return args;
}

async function loadSimulationEngine() {
  const cacheDir = path.join(webRoot, 'node_modules', '.cache');
  fs.mkdirSync(cacheDir, { recursive: true });
  const outfile = path.join(cacheDir, 'friction-sim-engine.mjs');

  esbuild.buildSync({
    entryPoints: [path.join(webRoot, 'src', 'lib', 'friction-simulator.ts')],
    bundle: true,
    platform: 'node',
    format: 'esm',
    outfile,
    alias: {
      '@': path.join(webRoot, 'src'),
    },
    logLevel: 'silent',
  });

  return import(`${pathToFileURL(outfile).href}?t=${Date.now()}`);
}

function loadEnvLocal() {
  const envPath = path.join(webRoot, '.env.local');
  if (!fs.existsSync(envPath)) return;
  const content = fs.readFileSync(envPath, 'utf-8');
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed.slice(eqIdx + 1).trim().replace(/^['"]|['"]$/g, '');
    if (!process.env[key]) {
      process.env[key] = val;
    }
  }
}

async function fetchLiveTelemetryStats(persona, engine) {
  loadEnvLocal();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return {};

  try {
    const { createClient } = await import('@supabase/supabase-js');
    const db = createClient(url, key);
    let query = db
      .from('funnel_step_telemetry')
      .select('session_id, funnel_step, event_action, duration_ms')
      .eq('role', persona.role)
      .order('created_at', { ascending: false })
      .limit(1000);

    if (persona.country && persona.country.length === 2) {
      query = query.eq('country_code', persona.country.toUpperCase());
    }

    const { data, error } = await query;
    if (error || !data || data.length === 0) return {};

    const buckets = new Map();
    for (const row of data) {
      const stepId = engine.normalizeFunnelStepId(String(row.funnel_step || ''));
      if (!buckets.has(stepId)) {
        buckets.set(stepId, { entered: new Set(), completed: new Set(), errors: 0, durations: [] });
      }
      const b = buckets.get(stepId);
      const sid = String(row.session_id || 'anon');
      if (row.event_action === 'step_enter' || row.event_action === 'cta_click') {
        b.entered.add(sid);
      } else if (row.event_action === 'step_complete') {
        b.entered.add(sid);
        b.completed.add(sid);
      } else if (row.event_action === 'validation_error') {
        b.entered.add(sid);
        b.errors += 1;
      }
      if (typeof row.duration_ms === 'number' && row.duration_ms > 0) {
        b.durations.push(row.duration_ms);
      }
    }

    const stats = {};
    for (const [stepId, b] of buckets.entries()) {
      stats[stepId] = {
        stepId,
        enteredCount: b.entered.size,
        completedCount: b.completed.size,
        validationErrorCount: b.errors,
        avgDurationMs:
          b.durations.length > 0
            ? Math.round(b.durations.reduce((x, y) => x + y, 0) / b.durations.length)
            : undefined,
      };
    }
    return stats;
  } catch {
    return {};
  }
}

async function inspectLiveDom(persona, baseUrl) {
  try {
    const { chromium } = await import('playwright');
    const isDesktop = persona.device === 'desktop_chrome';
    const userAgentMap = {
      mobile_ig_webview:
        'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) Mobile/15E148 Instagram 320.0.0.0',
      mobile_tiktok_webview:
        'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 Musical_ly_33.5.0 BytedanceWebview',
      mobile_safari:
        'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 Version/17.4 Mobile/15E148 Safari/604.1',
      mobile_chrome:
        'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 Chrome/126.0.0.0 Mobile Safari/537.36',
      desktop_chrome:
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/126.0.0.0 Safari/537.36',
    };

    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
      viewport: isDesktop ? { width: 1280, height: 800 } : { width: 390, height: 844 },
      userAgent: userAgentMap[persona.device] || userAgentMap.mobile_safari,
    });
    const page = await context.newPage();

    const stepRoutes = [
      ['1_entry', persona.role === 'creator' ? '/become-creator' : '/'],
      ['2_registration', persona.role === 'creator' ? '/onboarding?role=creator' : '/onboarding'],
      ['4_discovery_swipe', '/feed'],
      ['5_first_action', persona.role === 'creator' ? '/studio' : '/messages'],
    ];

    const domStats = {};
    for (const [stepId, route] of stepRoutes) {
      try {
        await page.goto(`${baseUrl}${route}`, { waitUntil: 'domcontentloaded', timeout: 15000 });
        const metrics = await page.evaluate(() => {
          const interactive = document.querySelectorAll(
            'button, a, input, select, textarea, [role="button"]'
          ).length;
          const inputs = document.querySelectorAll('input, select, textarea').length;
          return {
            hicksSec: Number(Math.log2(interactive + 1).toFixed(2)),
            inputs,
          };
        });
        domStats[stepId] = {
          stepId,
          enteredCount: 1,
          completedCount: 1,
          domHicksDecisionSec: metrics.hicksSec,
          domInputCount: metrics.inputs,
        };
      } catch {
        // Continue remaining routes if offline or route gated
      }
    }
    await browser.close();
    return domStats;
  } catch (err) {
    console.warn(`[live-dom] Skipped Playwright inspection (${err?.message || err})`);
    return {};
  }
}

function buildPersonaFromArgs(args, presets) {
  const baseKey = args.persona && args.persona !== 'all' ? args.persona : 'colombia_ig_creator';
  const base = presets[baseKey] || presets.colombia_ig_creator;
  const parseBool = (val, fallback) =>
    val === 'true' ? true : val === 'false' ? false : fallback;

  return {
    ...base,
    name: args.name || base.name,
    role: args.role || base.role,
    age: args.age ? Number(args.age) : base.age,
    country: (args.country || base.country).toUpperCase(),
    origins: args.origins || base.origins,
    language: args.lang || args.language || base.language,
    device: args.device || base.device,
    intent: args.intent || base.intent,
    cryptoFamiliarity: args.crypto || base.cryptoFamiliarity,
    paymentPreference: args.payment || base.paymentPreference,
    vipCode: args.vip || base.vipCode,
    hasPreApprovedFastTrack: parseBool(args['fast-track'], base.hasPreApprovedFastTrack),
    hasThreePhotosReady: parseBool(args['photos-ready'], base.hasThreePhotosReady),
    hasRegisteredTaxId: parseBool(args['tax-ready'], base.hasRegisteredTaxId),
  };
}

function formatMarkdownReport(reports) {
  const lines = [
    '# SECCION Persona Friction Simulation Scorecard',
    '',
    `Generated: ${new Date().toISOString()}`,
    '',
    '## Summary Comparison',
    '',
    '| Persona | Role | Country | Device | E2E Survival | Peak Bottleneck | Risk Tier |',
    '| :--- | :--- | :--- | :--- | :---: | :--- | :--- |',
  ];

  for (const r of reports) {
    lines.push(
      `| ${r.persona.name || r.persona.origins} | ${r.persona.role} | ${r.persona.country} | \`${r.persona.device}\` | **${r.predictedEndToEndConversionPct}%** | Step ${r.highestFrictionStep.stepNumber} (${r.highestFrictionStep.dropOffPct}%) | ${r.kateBriefing.riskTier} |`
    );
  }

  for (const r of reports) {
    lines.push('', `## ${r.persona.name || r.persona.origins} (\`${r.persona.country}\` · \`${r.persona.device}\`)`, '');
    lines.push('| Step | Stage | Drop-Off | Survival | Severity | Source | Kate Neutralizer |');
    lines.push('| :---: | :--- | :---: | :---: | :---: | :---: | :--- |');
    for (const s of r.steps) {
      lines.push(
        `| ${s.stepNumber} | ${s.title} | ${s.dropOffPct}% | ${s.cumulativeSurvivalPct}% | ${s.severity.toUpperCase()} | ${s.dataSource} | ${s.kateAction} |`
      );
    }
    lines.push('', `**Kate Pre-Emptive DM Addendum:**`, `> ${r.kateBriefing.tailoredDmAddendum}`);
  }

  return `${lines.join('\n')}\n`;
}

async function main() {
  const args = parseCliArgs(process.argv.slice(2));
  const engine = await loadSimulationEngine();
  const baseUrl = args['base-url'] || 'http://localhost:3000';
  const useLiveDb = args['live-db'] === 'true';
  const useLiveDom = args['live-dom'] === 'true';

  const targets =
    args.persona === 'all'
      ? Object.values(engine.PRESET_PERSONAS)
      : [buildPersonaFromArgs(args, engine.PRESET_PERSONAS)];

  const reports = [];
  for (const spec of targets) {
    const dbStats = useLiveDb ? await fetchLiveTelemetryStats(spec, engine) : {};
    const domStats = useLiveDom ? await inspectLiveDom(spec, baseUrl) : {};
    const mergedStats = { ...dbStats, ...domStats };
    reports.push(engine.simulatePersonaFriction(spec, mergedStats));
  }

  console.log('\n======================================================================');
  console.log('SECCION PARAMETRIC PERSONA FRICTION SIMULATOR');
  console.log('======================================================================');

  for (const r of reports) {
    console.log(
      `\n▶ ${r.persona.name || r.persona.origins} | role=${r.persona.role} | country=${r.persona.country} | age=${r.persona.age} | device=${r.persona.device} | intent=${r.persona.intent}`
    );
    console.log(
      `  Predicted E2E Completion: ${r.predictedEndToEndConversionPct}% | Friction Score: ${r.overallFrictionScore}/100 | Kate Tier: ${r.kateBriefing.riskTier}`
    );
    console.table(
      r.steps.map((s) => ({
        Step: `${s.stepNumber}. ${s.title}`,
        'Drop-Off': `${s.dropOffPct}%`,
        Survival: `${s.cumulativeSurvivalPct}%`,
        Severity: s.severity.toUpperCase(),
        Source: s.dataSource,
      }))
    );
    console.log(`  Kate DM Addendum:\n  "${r.kateBriefing.tailoredDmAddendum}"`);
  }

  const outDir = path.join(webRoot, 'reports');
  fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, 'friction-simulation-latest.md');
  fs.writeFileSync(outPath, formatMarkdownReport(reports), 'utf-8');
  console.log(`\n✅ Saved detailed Markdown scorecard to ${outPath}\n`);
}

main().catch((err) => {
  console.error('Friction simulation failed:', err);
  process.exit(1);
});
