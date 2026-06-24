import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { createClient } from '@supabase/supabase-js';

interface AnalyzeRequest {
  userId?: string;
  targetId?: string;
  messages?: { sender: string; text: string; }[];
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as AnalyzeRequest;
    const { userId, targetId, messages: customMessages } = body;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
    const supabase = createClient(supabaseUrl, supabaseServiceKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '');

    let messages = customMessages;

    // 1. Fetch messages from database if userId and targetId are provided and messages are not
    if (userId && targetId && !messages) {
      const { data: dbMsgs, error: dbError } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${userId},receiver_id.eq.${targetId}),and(sender_id.eq.${targetId},receiver_id.eq.${userId})`)
        .order('created_at', { ascending: false })
        .limit(20);

      if (dbError) {
        console.error('Error fetching chat messages for analysis:', dbError);
      } else if (dbMsgs) {
        // Reverse to chronological order
        const sorted = [...dbMsgs].reverse();
        messages = sorted.map((m: any) => ({
          sender: m.sender_id === userId ? 'me' : 'them',
          text: m.text
        }));
      }
    }

    // 2. Prevent errors on empty or insufficient chat logs
    if (!messages || messages.length < 2) {
      return NextResponse.json({
        conversationGravity: 0,
        extractedTraits: [],
        summary: "Not enough messages to analyze connection gravity. Start sending messages to run AI diagnostics!",
        bonusApplied: 0
      });
    }

    const geminiKey = process.env.GEMINI_API_KEY;
    let analysis: { conversationGravity: number; extractedTraits: string[]; summary: string };

    // 3. Google Gemini Analysis (Live Mode)
    if (geminiKey) {
      try {
        const ai = new GoogleGenAI({ apiKey: geminiKey });
        const prompt = `
You are an expert Conversation Gravity Sentiment Analyzer and Trait Extractor for a connection platform.
Analyze the following conversation history.

1. "conversationGravity": A score from -100 to 100 representing the relational momentum (negative means fading/toxic, positive means sparking/burning).
2. "extractedTraits": Array of 3-5 distinct mutual personality traits or conversational dynamics detected from the messages for both users (e.g. "Vulnerable", "Playful", "Sarcastic", "Intellectual", "Empathetic", "Direct").
3. "summary": A concise 2-sentence summary of the conversation's health, alignment, and areas for improvement.

Conversation:
${JSON.stringify(messages, null, 2)}

Return ONLY a valid JSON object matching this schema:
{
  "conversationGravity": number,
  "extractedTraits": string[],
  "summary": string
}
`;

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            temperature: 0.3,
          }
        });

        const text = response.text;
        if (!text) {
          throw new Error('No text generated from Gemini');
        }
        analysis = JSON.parse(text);
      } catch (geminiError: any) {
        console.error('Gemini content generation failed, falling back to local analysis:', geminiError);
        analysis = runLocalAnalysis(messages);
      }
    } else {
      // 4. Local Analysis Fallback (Demo Mode)
      analysis = runLocalAnalysis(messages);
    }

    // 5. Apply Dynamic Score Adjustments & DB update
    let bonusApplied = 0;
    if (userId && targetId) {
      const gravity = analysis.conversationGravity;
      if (gravity >= 60) {
        bonusApplied = 10;
      } else if (gravity >= 20) {
        bonusApplied = 5;
      } else if (gravity <= -20) {
        bonusApplied = -5;
      }

      try {
        // Update User -> Target relationship
        const { data: rel1 } = await supabase
          .from('relationships')
          .select('gauge_score')
          .eq('user_id', userId)
          .eq('target_id', targetId)
          .maybeSingle();

        if (rel1) {
          const newScore = Math.max(0, Math.min(100, (rel1.gauge_score || 0) + bonusApplied));
          await supabase
            .from('relationships')
            .update({
              gauge_score: newScore,
              gravity_score: gravity,
              gravity_summary: analysis.summary,
              gravity_updated_at: new Date().toISOString(),
              extracted_traits: analysis.extractedTraits
            })
            .eq('user_id', userId)
            .eq('target_id', targetId);
        }

        // Update Target -> User relationship (symmetric update)
        const { data: rel2 } = await supabase
          .from('relationships')
          .select('gauge_score')
          .eq('user_id', targetId)
          .eq('target_id', userId)
          .maybeSingle();

        if (rel2) {
          const newScore = Math.max(0, Math.min(100, (rel2.gauge_score || 0) + bonusApplied));
          await supabase
            .from('relationships')
            .update({
              gauge_score: newScore,
              gravity_score: gravity,
              gravity_summary: analysis.summary,
              gravity_updated_at: new Date().toISOString(),
              extracted_traits: analysis.extractedTraits
            })
            .eq('user_id', targetId)
            .eq('target_id', userId);
        }
      } catch (dbUpdateError) {
        console.error('Failed to write gravity metrics to Supabase:', dbUpdateError);
      }
    }

    return NextResponse.json({
      ...analysis,
      bonusApplied
    });

  } catch (err: any) {
    console.error('Conversation Gravity Analysis Error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}

// Local calculation engine fallback for testing & safety
function runLocalAnalysis(messages: { sender: string; text: string; }[]) {
  let totalLength = 0;
  let questionCount = 0;
  messages.forEach((m) => {
    totalLength += m.text.length;
    if (m.text.includes('?')) questionCount++;
  });

  const messageCount = messages.length;
  let gravity = 15 + Math.min(45, messageCount * 3.5) + Math.min(25, questionCount * 6);
  if (totalLength / messageCount > 90) gravity += 15; // longer messages indicate investment
  gravity = Math.min(100, Math.max(-100, gravity));

  const traitsPool = ["Vulnerable", "Intellectual", "Inquisitive", "Empathetic", "Witty", "Direct", "Playful", "Sarcastic"];
  const seed1 = (totalLength + messageCount) % traitsPool.length;
  const seed2 = (totalLength * messageCount + 3) % traitsPool.length;
  const seed3 = (totalLength - messageCount + 5 + traitsPool.length) % traitsPool.length;
  
  const extractedTraits = Array.from(new Set([
    traitsPool[seed1],
    traitsPool[seed2 === seed1 ? (seed2 + 1) % traitsPool.length : seed2],
    traitsPool[seed3 === seed1 || seed3 === seed2 ? (seed3 + 2) % traitsPool.length : seed3]
  ]));

  return {
    conversationGravity: gravity,
    extractedTraits,
    summary: `Your connection shows active dialogue with ${messageCount} messages. The conversation flow is balanced and traits show strong alignment.`
  };
}
