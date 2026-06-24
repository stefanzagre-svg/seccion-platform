import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenAI } from '@google/genai';
import { scoreToLevel, resolveSharedScore, MIN_MATCHES_FOR_AUTO_CHAT } from '@/lib/relationship-engine';

/**
 * Sandbox / Development convenience:
 * ─────────────────────────────────────────────────────────────────────────────
 * When SUPABASE_SERVICE_ROLE_KEY is absent and NODE_ENV === 'development':
 *   - The ai_agent_active / chat_auto_enabled / match-count DB gates are skipped.
 *   - Pass `devGaugeScore` (number 0–100) in the request body to simulate any
 *     relationship level without needing real DB rows.
 *   - Pass `devMatchCount` to simulate the creator's total match count (defaults
 *     to MIN_MATCHES_FOR_AUTO_CHAT so tests pass unless explicitly overridden).
 *     e.g. { creatorId, targetId, devGaugeScore: 22 }          → Friendly, allowed
 *          { creatorId, targetId, devGaugeScore: 36 }          → Close Friend, blocked
 *          { creatorId, targetId, devMatchCount: 5 }           → Not enough matches
 * When GEMINI_API_KEY is absent, the local reply generator is used.
 */

const IS_DEV = process.env.NODE_ENV === 'development';

export async function POST(req: NextRequest) {
  try {
    const { creatorId, targetId, messageContext, devGaugeScore, devMatchCount } = await req.json();

    if (!creatorId || !targetId) {
      return NextResponse.json(
        { error: 'Missing required fields: creatorId, targetId' },
        { status: 400 }
      );
    }

    const supabaseUrl        = process.env.NEXT_PUBLIC_SUPABASE_URL       || '';
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY      || '';
    const supabaseAnonKey    = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY  || '';
    const sandboxMode        = IS_DEV && !supabaseServiceKey;

    const supabase = createClient(supabaseUrl, supabaseServiceKey || supabaseAnonKey);

    // ── 1. Fetch Creator Profile ─────────────────────────────────────────────
    const { data: creatorProfile, error: profileError } = await supabase
      .from('profiles')
      .select('id, username, display_name, ai_agent_active, chat_auto_enabled')
      .eq('id', creatorId)
      .single();

    if (profileError || !creatorProfile) {
      if (sandboxMode) {
        console.warn('[AI Copilot] Sandbox: creator profile not found, using mock profile.');
      } else {
        return NextResponse.json({ error: 'Creator profile not found' }, { status: 404 });
      }
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

    // ── 3. Minimum 30-matches gate ───────────────────────────────────────────
    // Count how many non-stranger connections the creator has accumulated.
    // In sandbox mode devMatchCount can override this (defaults to MIN so tests pass).
    let totalMatchCount: number;

    if (sandboxMode) {
      totalMatchCount = typeof devMatchCount === 'number' ? devMatchCount : MIN_MATCHES_FOR_AUTO_CHAT;
    } else {
      const { count, error: countError } = await supabase
        .from('relationships')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', creatorId)
        .gt('gauge_score', 0); // any non-zero score = a meaningful match

      if (countError) {
        console.warn('[AI Copilot] Could not count matches (non-fatal):', countError.message);
        totalMatchCount = 0;
      } else {
        totalMatchCount = count ?? 0;
      }
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

    // ── 4. Resolve relationship level ────────────────────────────────────────
    let sharedScore = 0;

    if (sandboxMode && typeof devGaugeScore === 'number') {
      sharedScore = devGaugeScore;
    } else {
      const { data: rels, error: relError } = await supabase
        .from('relationships')
        .select('user_id, target_id, gauge_score')
        .or(
          `and(user_id.eq.${creatorId},target_id.eq.${targetId}),` +
          `and(user_id.eq.${targetId},target_id.eq.${creatorId})`
        );

      if (relError) console.error('[AI Copilot] Error fetching relationships:', relError);

      const myScore    = rels?.find(r => r.user_id === creatorId)?.gauge_score ?? 0;
      const theirScore = rels?.find(r => r.user_id === targetId)?.gauge_score  ?? 0;
      sharedScore = resolveSharedScore(myScore, theirScore);
    }

    const currentLevel = scoreToLevel(sharedScore);

    // ── 5. Hard block: Level 4 Close Friend ──────────────────────────────────
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

    // ── 6. Generate reply ────────────────────────────────────────────────────
    const geminiKey   = process.env.GEMINI_API_KEY;
    const creatorName = creatorProfile?.display_name || creatorProfile?.username || 'Creator';
    let replyText     = '';

    if (geminiKey) {
      try {
        const ai = new GoogleGenAI({ apiKey: geminiKey });

        const systemInstruction = `
You are the AI Assistant for the Creator ${creatorName}.
Your role is to draft authentic, engaging direct message responses to a fan based on the creator's tone.
Creator Tone: Friendly, charismatic, slightly flirty but respectful, and authentic.
Tone instructions: Speak in lowercase or casual case, use brief 1-2 sentence replies, avoid robotic templates, and keep it human.

Waiver & Consent status: The creator has explicitly consented to your operations.
Constraint: Keep it safe and fun. Do not suggest private meetings or give financial advice.
`;
        const prompt = `
Recent chat history context:
${messageContext || 'No previous history. Start a warm conversation.'}

Draft a single-sentence or double-sentence casual reply. Keep it very conversational.
`;

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: { systemInstruction, temperature: 0.8, maxOutputTokens: 100 },
        });

        replyText = response.text || '';
      } catch (geminiError) {
        console.warn('[AI Copilot] Gemini unavailable, using local reply generator:', geminiError);
        replyText = getLocalSimulatedReply(creatorName, messageContext);
      }
    } else {
      replyText = getLocalSimulatedReply(creatorName, messageContext);
    }

    // ── 7. Log AI interaction (best-effort, non-blocking) ───────────────────
    supabase
      .from('ai_interaction_logs')
      .insert({
        sender_id: creatorId,
        recipient_id: targetId,
        interaction_type: 'AUTO_CHAT',
        is_ai_generated: true,
        resolved_level_key: currentLevel.key,
      })
      .then(({ error }) => {
        if (error) console.warn('[AI Copilot] Interaction log insert failed (non-fatal):', error.message);
      });

    return NextResponse.json({
      draftText: replyText,
      resolvedLevel: currentLevel.key,
      isAiGenerated: true,
      matchCount: totalMatchCount,
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
