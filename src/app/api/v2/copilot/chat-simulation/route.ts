import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { scoreToLevel, resolveSharedScore, MIN_MATCHES_FOR_AUTO_CHAT } from '@/lib/relationship-engine';
import { createAdminClient } from '@/lib/supabase/admin-client';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { scrubPIIBeforeLLM } from '@/lib/ai/pii-scrubber';
import { classifyMessageIntent } from '@/lib/ai/intent-classifier';
import { analyzeMemberFriction } from '@/lib/ai/whale-friction-detector';
import { resolveRampDirective, calculateTypingCadence } from '@/lib/ai/conversion-engine';

/**
 * Sandbox / Development convenience:
 * ─────────────────────────────────────────────────────────────────────────────
 * When SUPABASE_SERVICE_ROLE_KEY is absent and NODE_ENV === 'development':
 *   - The ai_agent_active / chat_auto_enabled / match-count DB gates are skipped.
 *   - Pass `devGaugeScore` (number 0–100) in the request body to simulate any
 *     relationship level without needing real DB rows.
 *   - Pass `devMatchCount` to simulate the creator's total match count (defaults
 *     to MIN_MATCHES_FOR_AUTO_CHAT so tests pass unless explicitly overridden).
 * When GEMINI_API_KEY is absent, the local reply generator is used.
 */

const IS_DEV = process.env.NODE_ENV === 'development';

export async function POST(req: NextRequest) {
  try {
    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Malformed JSON payload' }, { status: 400 });
    }
    const { creatorId, targetId, messageContext, devGaugeScore, devMatchCount } = body || {};

    if (!creatorId || !targetId) {
      return NextResponse.json(
        { error: 'Missing required fields: creatorId, targetId' },
        { status: 400 }
      );
    }

    const hasServiceKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY;
    const sandboxMode = IS_DEV && !hasServiceKey;
    const supabase: any = hasServiceKey ? createAdminClient() : await createServerClient();

    // ── 1. Fetch Creator Profile & Global Emergency Halt Check ───────────────
    const { data: creatorProfile, error: profileError } = await supabase
      .from('profiles')
      .select('id, username, display_name, ai_agent_active, chat_auto_enabled, ai_suggestion_status')
      .eq('id', creatorId)
      .single();

    if (profileError || !creatorProfile) {
      if (sandboxMode) {
        console.warn('[AI Copilot] Sandbox: creator profile not found, using mock profile.');
      } else {
        return NextResponse.json({ error: 'Creator profile not found' }, { status: 404 });
      }
    }

    // Emergency Kill-Switch verification
    if (creatorProfile?.ai_suggestion_status === 'emergency_halt') {
      return NextResponse.json(
        {
          error: 'AI Copilot is in Emergency Halt mode. Replicant operations suspended.',
          emergencyHalt: true,
        },
        { status: 503 }
      );
    }

    // ── 2. AI Agent activation gate ──────────────────────────────────────────
    if (!sandboxMode) {
      if (!creatorProfile?.ai_agent_active) {
        return NextResponse.json(
          { error: 'AI Assistant is currently disabled by the creator.' },
          { status: 403 }
        );
      }
      if (creatorProfile?.chat_auto_enabled === false) {
        return NextResponse.json(
          {
            error: 'Auto-Chat Simulation is currently paused by the creator. Enable it in Studio → Settings → AI Assistant.',
            servicePaused: true,
          },
          { status: 403 }
        );
      }
    }

    // ── 3. Ephemeral In-Memory PII Scrubbing ──────────────────────────────────
    const scrubbed = scrubPIIBeforeLLM(messageContext || '');

    // ── 4. Whale & Member Sentiment Friction Detector ─────────────────────────
    const friction = analyzeMemberFriction(scrubbed.sanitizedText);
    if (friction.requiresHumanEscalation) {
      // Log escalation and halt automated generation
      supabase
        .from('ai_interaction_logs')
        .insert({
          sender_id: creatorId,
          recipient_id: targetId,
          interaction_type: 'AUTO_CHAT',
          is_ai_generated: false,
          execution_status: 'whale_escalated',
          sentiment_score: friction.sentimentScore,
          whale_escalated: true,
        })
        .then(() => {});

      return NextResponse.json({
        humanModeEscalated: true,
        reason: friction.escalationReason,
        isWhale: friction.isWhale,
        message: 'Personal creator touch required. Message queued for creator manual review.',
      }, { status: 200 });
    }

    // ── 5. Intent Classifier & Threat Guardrail ───────────────────────────────
    // Query any specific creator restrictions
    let creatorRestrictions: any = null;
    try {
      const { data: restrictions } = await supabase
        .from('copilot_intent_restrictions')
        .select('*')
        .eq('creator_id', creatorId)
        .limit(1)
        .maybeSingle();
      creatorRestrictions = restrictions;
    } catch {
      // non-fatal
    }

    const intentCheck = classifyMessageIntent(scrubbed.sanitizedText, creatorRestrictions);
    if (!intentCheck.isSafe) {
      // Write to audit log as blocked guardrail
      supabase
        .from('ai_interaction_logs')
        .insert({
          sender_id: creatorId,
          recipient_id: targetId,
          interaction_type: 'AUTO_CHAT',
          is_ai_generated: true,
          execution_status: 'blocked_guardrail',
          flagged_intent: intentCheck.flaggedIntent,
          pii_redacted: scrubbed.hasRedactions,
          redacted_types: scrubbed.redactedTypes,
        })
        .then(() => {});

      return NextResponse.json({
        draftText: intentCheck.deflectionMessage,
        flaggedIntent: intentCheck.flaggedIntent,
        reason: intentCheck.reason,
        isGuardrailDeflection: true,
        isAiGenerated: true,
      });
    }

    // ── 6. Minimum 30-matches gate ───────────────────────────────────────────
    let totalMatchCount: number;
    if (sandboxMode) {
      totalMatchCount = typeof devMatchCount === 'number' ? devMatchCount : MIN_MATCHES_FOR_AUTO_CHAT;
    } else {
      const { count, error: countError } = await supabase
        .from('relationships')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', creatorId)
        .gt('gauge_score', 0);

      totalMatchCount = countError ? 0 : (count ?? 0);
    }

    if (totalMatchCount < MIN_MATCHES_FOR_AUTO_CHAT) {
      return NextResponse.json(
        {
          error: `Auto-Chat requires ${MIN_MATCHES_FOR_AUTO_CHAT} matches. You currently have ${totalMatchCount}. Keep building connections to unlock this feature.`,
          notEligible: true,
          matchCount: totalMatchCount,
          requiredMatches: MIN_MATCHES_FOR_AUTO_CHAT,
          ...(sandboxMode && { _sandboxMode: true }),
        },
        { status: 403 }
      );
    }

    // ── 7. Resolve relationship level ────────────────────────────────────────
    let sharedScore = 0;
    if (sandboxMode && typeof devGaugeScore === 'number') {
      sharedScore = devGaugeScore;
    } else {
      const { data: rels } = await supabase
        .from('relationships')
        .select('user_id, target_id, gauge_score')
        .or(
          `and(user_id.eq.${creatorId},target_id.eq.${targetId}),` +
          `and(user_id.eq.${targetId},target_id.eq.${creatorId})`
        );

      const myScore    = rels?.find((r: any) => r.user_id === creatorId)?.gauge_score ?? 0;
      const theirScore = rels?.find((r: any) => r.user_id === targetId)?.gauge_score  ?? 0;
      sharedScore = resolveSharedScore(myScore, theirScore);
    }

    const currentLevel = scoreToLevel(sharedScore);

    // ── 8. Hard block: Level 4 Close Friend ──────────────────────────────────
    if (currentLevel.key === 'close') {
      return NextResponse.json(
        {
          error:
            'Human mode active. Relationship has reached "Close Friend" status. ' +
            'Genuine human connection is required for this connection level.',
          isBlocked: true,
          resolvedLevel: currentLevel.key,
          ...(sandboxMode && { _sandboxMode: true, devGaugeScore: sharedScore }),
        },
        { status: 403 }
      );
    }

    // ── 9. Resolve Conversation Goal & Multi-Turn Ramp ────────────────────────
    let activeGoalType = 'DISCOVERY';
    let currentRampStep = 1;

    try {
      const { data: goalRow } = await supabase
        .from('copilot_interaction_goals')
        .select('goal_type')
        .eq('creator_id', creatorId)
        .eq('is_active', true)
        .limit(1)
        .maybeSingle();

      if (goalRow?.goal_type) {
        activeGoalType = goalRow.goal_type;
      }

      const { data: rampRow } = await supabase
        .from('copilot_sales_ramps')
        .select('current_step')
        .eq('creator_id', creatorId)
        .eq('member_id', targetId)
        .eq('active_goal_type', activeGoalType)
        .maybeSingle();

      if (rampRow?.current_step) {
        currentRampStep = rampRow.current_step;
      }
    } catch {
      // non-fatal
    }

    const rampDirective = resolveRampDirective(activeGoalType, currentRampStep);

    // ── 10. Generate Reply with Gemini 2.5 Flash ──────────────────────────────
    const geminiKey   = process.env.GEMINI_API_KEY;
    const creatorName = creatorProfile?.display_name || creatorProfile?.username || 'Creator';
    let replyText     = '';

    if (geminiKey) {
      try {
        const ai = new GoogleGenAI({ apiKey: geminiKey });

        const systemInstruction = `
You are the AI Digital Twin for Creator "${creatorName}".
Creator Tone: Friendly, authentic, witty, engaging, peer-level.
Tone guidelines: Speak casually, brief 1-2 sentences maximum.

CONVERSATION GOAL & RAMP DIRECTIVE:
${rampDirective.instruction}

STRICT SAFETY CONSTRAINTS:
1. NEVER arrange or agree to in-person rendezvous.
2. NEVER give investment or financial advice.
3. NEVER solicit off-platform payments (CashApp, Venmo, etc.).
4. Keep the connection respectful, fun, and aligned with SECCION guidelines.
`;
        const prompt = `
Recent chat history context (Sanitized):
${scrubbed.sanitizedText || 'No previous history. Start a warm conversation.'}

Draft a single-sentence or double-sentence casual reply:
`;

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: { systemInstruction, temperature: 0.8, maxOutputTokens: 100 },
        });

        replyText = response.text || '';
      } catch (geminiError: any) {
        console.warn('[AI Copilot] Gemini unavailable, using local reply generator:', geminiError);
        replyText = getLocalSimulatedReply(creatorName, scrubbed.sanitizedText);
      }
    } else {
      replyText = getLocalSimulatedReply(creatorName, scrubbed.sanitizedText);
    }

    // ── 11. Calculate Organic Typing Cadence ──────────────────────────────────
    const latencyEmulatedMs = calculateTypingCadence(replyText);

    // ── 12. Advance Sales Ramp (Next Step) ───────────────────────────────────
    if (currentRampStep < 3) {
      supabase
        .from('copilot_sales_ramps')
        .upsert({
          creator_id: creatorId,
          member_id: targetId,
          active_goal_type: activeGoalType,
          current_step: currentRampStep + 1,
          last_interaction_at: new Date().toISOString(),
        })
        .then(() => {});
    }

    // ── 13. Audit Log AI interaction ─────────────────────────────────────────
    supabase
      .from('ai_interaction_logs')
      .insert({
        sender_id: creatorId,
        recipient_id: targetId,
        interaction_type: 'AUTO_CHAT',
        is_ai_generated: true,
        resolved_level_key: currentLevel.key,
        pii_redacted: scrubbed.hasRedactions,
        redacted_types: scrubbed.redactedTypes,
        sentiment_score: friction.sentimentScore,
        execution_status: 'success',
        latency_emulated_ms: latencyEmulatedMs,
      })
      .then(({ error }: { error: any }) => {
        if (error) console.warn('[AI Copilot] Interaction log insert failed:', error.message);
      });

    return NextResponse.json({
      draftText: replyText,
      resolvedLevel: currentLevel.key,
      isAiGenerated: true,
      replicantCreatorName: creatorName,
      matchCount: totalMatchCount,
      latencyEmulatedMs,
      activeGoal: activeGoalType,
      rampStep: currentRampStep,
      ...(sandboxMode && { _sandboxMode: true, devGaugeScore: sharedScore }),
    });
  } catch (err: any) {
    console.error('[AI Copilot] Chat Simulation Error:', err);
    return NextResponse.json(
      { error: 'Internal Server Error', message: err.message },
      { status: 500 }
    );
  }
}

// ── Local reply generator (sandbox / no-Gemini fallback) ────────────────────
function getLocalSimulatedReply(creatorName: string, context?: string): string {
  const contextHint = context ? context.toLowerCase() : '';
  if (contextHint.includes('morning') || contextHint.includes('routine')) {
    return `omg yes, morning routines are everything — mine starts with a 10-min walk. what does yours look like?`;
  }
  if (contextHint.includes('post') || contextHint.includes('love')) {
    return `that genuinely means so much to hear 🥺 stay tuned — there's way more coming soon!`;
  }
  const replies = [
    `hey! thanks for reaching out. how's your day going so far?`,
    `loved seeing your comment on my latest post! what did you think of it?`,
    `just working on some new content for the feed. can't wait to share it!`,
    `hey there! what's on your mind today?`,
    `so glad to connect with you here. tell me more about yourself!`,
  ];
  return replies[Math.floor(Math.random() * replies.length)];
}
