/**
 * Test Setup Route (dev-only) — manages test fixtures for AI Assistant integration tests.
 *
 * GET /api/v2/test-setup?action=enable_ai
 *   → Enables AI features on Elena's creator profile.
 *   → Uses service key if available; falls back to anon key (best-effort).
 *   → In sandbox mode (no service key), the routes already skip the DB gate,
 *     so this step is informational only.
 *
 * GET /api/v2/test-setup?action=add_relationships
 *   → Inserts mock relationship rows for guardrail tests.
 *   → Requires SUPABASE_SERVICE_ROLE_KEY to bypass RLS.
 *   → In sandbox mode (no service key), returns a sandboxInstructions object
 *     telling the test runner to use devGaugeScore instead.
 *
 * GET /api/v2/test-setup?action=cleanup
 *   → Removes mock relationship rows (best-effort; fails silently without service key).
 *
 * WARNING: This route is restricted to NODE_ENV === 'development'.
 */
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const CREATOR_ID       = 'cb17c0c2-e735-4744-a190-935a6b75b007';
const MEMBER_ID_FRIENDLY = '00000000-0000-0000-0000-000000000001';
const MEMBER_ID_CLOSE    = '00000000-0000-0000-0000-000000000002';

export async function GET(req: NextRequest) {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 });
  }

  const action     = req.nextUrl.searchParams.get('action');
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  const anonKey    = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const sandboxMode = !serviceKey;

  const supabase = createClient(supabaseUrl, serviceKey || anonKey);

  // ── enable_ai ──────────────────────────────────────────────────────────────
  if (action === 'enable_ai') {
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ ai_agent_active: true, chat_auto_enabled: true })
      .eq('id', CREATOR_ID);

    if (updateError) {
      // In sandbox mode, the chat-simulation and content-ops routes skip this
      // check anyway — surface the warning but don't block the test run.
      if (sandboxMode) {
        return NextResponse.json({
          success: true,
          _sandboxMode: true,
          warning: `Could not write to DB (anon key + RLS): ${updateError.message}. Routes will skip ai_agent_active gate automatically in dev mode.`,
        });
      }
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    // Verify with a separate read
    const { data: profile, error: readError } = await supabase
      .from('profiles')
      .select('id, username, ai_agent_active, chat_auto_enabled')
      .eq('id', CREATOR_ID)
      .single();

    return NextResponse.json({
      success: true,
      profile: profile ?? null,
      _sandboxMode: sandboxMode,
      ...(readError && { readWarning: readError.message }),
    });
  }

  // ── add_relationships ─────────────────────────────────────────────────────
  if (action === 'add_relationships') {
    if (sandboxMode) {
      // No service key → routes accept devGaugeScore inline. Tell the caller.
      return NextResponse.json({
        success: true,
        _sandboxMode: true,
        message:
          'No SUPABASE_SERVICE_ROLE_KEY — relationship DB rows cannot be inserted (RLS). ' +
          'The chat-simulation route accepts a `devGaugeScore` field in the request body ' +
          'to simulate any relationship level without real DB rows.',
        sandboxInstructions: {
          friendlyTest: { devGaugeScore: 22, expectStatus: 200 },
          closeTest:    { devGaugeScore: 36, expectStatus: 403, expectIsBlocked: true },
        },
      });
    }

    // Service key available → write real rows
    const { error: err1 } = await supabase.from('relationships').upsert(
      [
        { user_id: CREATOR_ID,       target_id: MEMBER_ID_FRIENDLY, gauge_score: 22 },
        { user_id: MEMBER_ID_FRIENDLY, target_id: CREATOR_ID,       gauge_score: 22 },
      ],
      { onConflict: 'user_id,target_id' }
    );

    const { error: err2 } = await supabase.from('relationships').upsert(
      [
        { user_id: CREATOR_ID,    target_id: MEMBER_ID_CLOSE, gauge_score: 36 },
        { user_id: MEMBER_ID_CLOSE, target_id: CREATOR_ID,    gauge_score: 36 },
      ],
      { onConflict: 'user_id,target_id' }
    );

    if (err1 || err2) {
      return NextResponse.json({ error: err1?.message || err2?.message }, { status: 500 });
    }

    const { data: rels } = await supabase
      .from('relationships')
      .select('user_id, target_id, gauge_score')
      .or(
        `user_id.eq.${MEMBER_ID_FRIENDLY},user_id.eq.${MEMBER_ID_CLOSE},` +
        `target_id.eq.${MEMBER_ID_FRIENDLY},target_id.eq.${MEMBER_ID_CLOSE}`
      );

    return NextResponse.json({ success: true, relationships: rels });
  }

  // ── cleanup ───────────────────────────────────────────────────────────────
  if (action === 'cleanup') {
    if (sandboxMode) {
      return NextResponse.json({
        success: true,
        _sandboxMode: true,
        message: 'Sandbox mode — no real relationship rows were inserted, nothing to clean up.',
      });
    }

    await supabase.from('relationships').delete()
      .in('user_id',    [MEMBER_ID_FRIENDLY, MEMBER_ID_CLOSE]);
    await supabase.from('relationships').delete()
      .in('target_id',  [MEMBER_ID_FRIENDLY, MEMBER_ID_CLOSE]);

    return NextResponse.json({ success: true, message: 'Mock relationship rows cleaned up.' });
  }

  return NextResponse.json(
    { error: 'Unknown action. Valid actions: enable_ai | add_relationships | cleanup' },
    { status: 400 }
  );
}
