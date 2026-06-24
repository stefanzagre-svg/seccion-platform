import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenAI } from '@google/genai';

/**
 * Sandbox / Development convenience:
 * ─────────────────────────────────────────────────────────────────────────────
 * When SUPABASE_SERVICE_ROLE_KEY is absent and NODE_ENV === 'development':
 *   - The ai_agent_active DB gate is skipped (assumed true for testing).
 *   - Creator profile lookup is still attempted; if it fails, a mock name is used.
 * When GEMINI_API_KEY is absent, the local content generator is used.
 */

const IS_DEV = process.env.NODE_ENV === 'development';

export async function POST(req: NextRequest) {
  try {
    const { creatorId, topic, isSponsored } = await req.json();

    if (!creatorId) {
      return NextResponse.json(
        { error: 'Missing required field: creatorId' },
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
      .select('id, username, display_name, ai_agent_active, content_ops_enabled')
      .eq('id', creatorId)
      .single();

    if (profileError || !creatorProfile) {
      if (!sandboxMode) {
        return NextResponse.json({ error: 'Creator profile not found' }, { status: 404 });
      }
      // Sandbox: continue with a synthetic name so the content generator still works.
      console.warn('[Content Ops] Sandbox: creator not found, using mock profile name.');
    }

    // ── 2. AI Agent activation gate ──────────────────────────────────────────
    // Skipped in sandbox/dev mode (no service key) so tests don't need a DB write.
    if (!sandboxMode) {
      if (!creatorProfile?.ai_agent_active) {
        return NextResponse.json(
          { error: 'AI Assistant features are currently disabled.' },
          { status: 403 }
        );
      }
      if (creatorProfile?.content_ops_enabled === false) {
        return NextResponse.json(
          { error: 'Content Ops Strategist is currently disabled by the creator. Enable it in Studio → Settings → AI Assistant.' },
          { status: 403 }
        );
      }
    }

    const creatorName = creatorProfile?.display_name || creatorProfile?.username || 'Creator';

    // ── 3. Generate content ──────────────────────────────────────────────────
    const geminiKey = process.env.GEMINI_API_KEY;
    let suggestion = '';

    if (geminiKey) {
      try {
        const ai = new GoogleGenAI({ apiKey: geminiKey });

        const systemInstruction = `
You are the AI Content Strategist for Creator ${creatorName}.
Your task is to generate premium short-form marketing captions and video concepts.
Always write high-converting, punchy captions for platforms like Instagram, TikTok, and X.
Compliance Constraint: If the promotion is sponsored, you MUST prepend or append prominent FTC ad disclosures (e.g. #ad or #sponsored) at the very beginning of the caption.
`;
        const prompt = `
Topic/Concept: "${topic || 'General update / Life update'}"
Is Sponsored Campaign: ${isSponsored ? 'YES' : 'NO'}

Generate a short, punchy marketing caption and a 3-step video recording prompt for the creator.
`;

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: { systemInstruction, temperature: 0.7, maxOutputTokens: 250 },
        });

        suggestion = response.text || '';
      } catch (geminiError) {
        console.warn('[Content Ops] Gemini unavailable, using local content generator:', geminiError);
        suggestion = getLocalContentSuggestion(topic, isSponsored, creatorName);
      }
    } else {
      // No Gemini key — use local generator (sandbox convenience)
      suggestion = getLocalContentSuggestion(topic, isSponsored, creatorName);
    }

    // ── FTC Compliance Guard (post-processing) ─────────────────────────────────
    // Regardless of what the generator returned, if this is a sponsored campaign
    // and the output is missing an FTC disclosure, we enforce it server-side.
    if (isSponsored) {
      const lower = suggestion.toLowerCase();
      if (!lower.includes('#ad') && !lower.includes('#sponsored')) {
        suggestion = `#ad #sponsored\n\n${suggestion}`;
      }
    }

    // ── 4. Log AI interaction (best-effort, non-blocking) ───────────────────
    supabase
      .from('ai_interaction_logs')
      .insert({
        sender_id: creatorId,
        interaction_type: 'CONTENT_GEN',
        is_ai_generated: true,
        resolved_level_key: 'n/a',
      })
      .then(({ error }) => {
        if (error) console.warn('[Content Ops] Interaction log insert failed (non-fatal):', error.message);
      });

    return NextResponse.json({
      suggestion,
      isAiGenerated: true,
      ...(sandboxMode && { _sandboxMode: true }),
    });
  } catch (err: any) {
    console.error('[Content Ops] Error:', err);
    return NextResponse.json(
      { error: 'Internal Server Error', message: err.message },
      { status: 500 }
    );
  }
}

// ── Local content generator (sandbox / no-Gemini fallback) ──────────────────
function getLocalContentSuggestion(
  topic: string,
  isSponsored: boolean,
  creatorName = 'Creator'
): string {
  const disclosure = isSponsored ? `#ad #sponsored\n\n` : '';
  const topicLine  = topic ? `focused on: ${topic}.` : 'just living the process.';

  return `${disclosure}✨ caption:
"behind the scenes of today's session — ${topicLine} can't wait to share the finished edit with you all. exclusive details drop in my circle first! link in bio 👇"

🎬 video recording guide for ${creatorName}:
1. hook (0–3 s): open on your workspace or setup — let them see your world.
2. value/body (3–20 s): share one quick tip, reaction, or sneak peek from today's project.
3. call-to-action: point to camera and say "drop a comment if you want the full breakdown — and hit the link in bio to get it first."`;
}
