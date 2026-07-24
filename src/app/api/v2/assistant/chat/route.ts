import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin-client';
import { GoogleGenAI } from '@google/genai';

interface ChatRequest {
  message: string;
}

export async function POST(req: NextRequest) {
  try {
    const devUserId = req.headers.get('x-dev-user-id');
    const isDevBypass = process.env.NODE_ENV === 'development' && !!devUserId;
    const supabase = isDevBypass ? createAdminClient() : await createClient();

    // 1. Authenticate user (with x-dev-user-id support in dev mode)
    let userId = null;

    if (isDevBypass) {
      userId = devUserId;
    } else {
      const { data: { session }, error: authError } = await supabase.auth.getSession();
      if (authError || !session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      userId = session.user.id;
    }

    // 2. Fetch User Profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role, display_name, username, created_at, privacy_settings, archetype, core_passion')
      .eq('id', userId)
      .single();

    if (profileError || !profile) {
      console.error('Wingman Chat - Profile Error:', profileError, 'userId:', userId);
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // 3. Gate Role (strictly for member accounts)
    if (profile.role !== 'member') {
      return NextResponse.json({ error: 'Forbidden. Dating assistant is strictly for members.' }, { status: 403 });
    }

    // 4. Parse request body
    const body = (await req.json().catch(() => ({}))) as any;
    if (!body?.message || typeof body.message !== 'string') {
      return NextResponse.json({ error: 'Missing message input' }, { status: 400 });
    }

    // 5. Calculate Trial / Age Metrics (30 days free trial with devCreatedAt support)
    let joinedDate = new Date(profile.created_at);
    if (process.env.NODE_ENV === 'development' && body.devCreatedAt) {
      joinedDate = new Date(body.devCreatedAt);
    }
    const ageInMs = Date.now() - joinedDate.getTime();
    const daysDiff = ageInMs / (1000 * 60 * 60 * 24);
    const isTrial = daysDiff <= 30;
    const trialDaysLeft = Math.max(0, Math.ceil(30 - daysDiff));

    // 6. Calculate Credits (Pay-Per-Query fallback using JSONB privacy_settings)
    let credits = profile.privacy_settings?.wingman_credits ?? 10;

    // 7. Gating logic
    if (!isTrial && credits <= 0) {
      return NextResponse.json({
        error: 'credits_exhausted',
        isTrial: false,
        trialDaysLeft: 0,
        credits: 0
      }, { status: 402 }); // Payment Required
    }

    // 8. Decrement credits if outside trial
    let remainingCredits = credits;
    if (!isTrial) {
      remainingCredits = Math.max(0, credits - 1);
      const updates = {
        privacy_settings: {
          ...(profile.privacy_settings || {}),
          wingman_credits: remainingCredits
        }
      };

      await supabase.from('profiles').update(updates).eq('id', userId);
    }

    // 9. Fetch top compatible creators/candidates for context
    const { data: candidates } = await supabase
      .from('profiles')
      .select('username, display_name, archetype, core_passion, bio')
      .eq('role', 'creator')
      .limit(5);

    // 10. Call Google Gemini Wingman Prompt
    const locale = body.locale || 'es';
    const localeNames: Record<string, string> = {
      es: 'Spanish (Español)',
      en: 'English',
      fr: 'French (Français)',
      pt: 'Portuguese (Português)',
      uk: 'Ukrainian (Українська)',
      ro: 'Romanian (Română)',
      ar: 'Moroccan Arabic / Darija (الدارجة المغربية)'
    };
    const targetLanguage = localeNames[locale] || 'Spanish (Español)';

    const geminiKey = process.env.GEMINI_API_KEY;
    let reply = "¡Hola! Tu Wingman de IA está listo para ayudarte con consejos de citas y compatibilidad.";

    if (geminiKey) {
      try {
        const ai = new GoogleGenAI({ apiKey: geminiKey });
        
        const systemPrompt = `
You are the elite AI Dating Wingman for a premium connection platform called SECCION.
Your role is to advise and coach members to help them navigate the platform, start conversations, and find matches.

Language Imperative:
- Target Language: ${targetLanguage}.
- You MUST reply fluently and naturally in ${targetLanguage}. If ${targetLanguage} is Moroccan Arabic, use authentic Darija.

Active User Profile:
- Name: ${profile.display_name || profile.username}
- Archetype: ${profile.archetype || 'Not selected yet'}
- Core Passion: ${profile.core_passion || 'Not specified'}

Potential Mapped Candidates/Creators:
${JSON.stringify(candidates || [], null, 2)}

Instructions:
1. Act as a supportive, highly calibrating wingman. Be direct, witty, and encouraging.
2. Advise the user on how to level up their relationship gauges by using "Suggestion Moves".
3. Use the candidate list above to suggest potential matches, explaining why their Archetypes or Core Passions align or create positive chemistry.
4. Give specific conversation prompts (icebreakers) they can use.
5. Keep answers concise, glassmorphic-themed, and tailored to the SECCION platform features.
`;

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: body.message,
          config: {
            systemInstruction: systemPrompt,
            temperature: 0.7,
          }
        });

        reply = response.text || reply;
      } catch (geminiErr) {
        console.error('Gemini Wingman failed:', geminiErr);
        reply = "Wingman system is updating its relational databases. Feel free to ask about matching archetypes or how to boost relationship gauges!";
      }
    }

    return NextResponse.json({
      reply,
      isTrial,
      trialDaysLeft,
      credits: remainingCredits
    });

  } catch (err: any) {
    console.error('AI Wingman Error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
