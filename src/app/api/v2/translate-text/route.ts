import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { GoogleGenAI } from '@google/genai';

// Mock translation dictionary for sandbox environment if Gemini is unavailable
const SANDBOX_TRANSLATIONS: Record<string, Record<string, string>> = {
  es: {
    "hello": "hola",
    "how are you?": "¿cómo estás?",
    "i love your profile": "me encanta tu perfil",
    "good morning": "buenos días",
    "good night": "buenas noches",
    "thank you": "gracias",
    "yes": "sí",
    "no": "no"
  },
  fr: {
    "hello": "bonjour",
    "how are you?": "comment ça va ?",
    "i love your profile": "j'adore ton profil",
    "good morning": "bonjour",
    "good night": "bonne nuit",
    "thank you": "merci",
    "yes": "oui",
    "no": "non"
  },
  de: {
    "hello": "hallo",
    "how are you?": "wie geht es dir?",
    "i love your profile": "ich liebe dein profil",
    "good morning": "guten morgen",
    "good night": "gute nacht",
    "thank you": "danke",
    "yes": "ja",
    "no": "nein"
  },
  en: {
    "hola": "hello",
    "¿cómo estás?": "how are you?",
    "me encanta tu perfil": "i love your profile",
    "buenos días": "good morning",
    "buenas noches": "good night",
    "gracias": "thank you",
    "sí": "yes",
    "no": "no",
    "bonjour": "hello",
    "comment ça va ?": "how are you?",
    "j'adore ton profil": "i love your profile",
    "bonne nuit": "good night",
    "merci": "thank you",
    "oui": "yes"
  }
};

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();

    // 1. Get user session to identify caller
    let user;
    const devUserId = req.headers.get('x-dev-user-id');
    if (process.env.NODE_ENV === 'development' && devUserId) {
      user = { id: devUserId };
    } else {
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
      if (authError || !authUser) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      user = authUser;
    }

    const { text, targetLanguage, sourceLanguage } = await req.json();

    if (!text || !targetLanguage) {
      return NextResponse.json({ error: 'Missing text or targetLanguage' }, { status: 400 });
    }

    const normalizedTarget = targetLanguage.toLowerCase().substring(0, 2);
    let translatedText = '';
    let engine: 'gemini' | 'sandbox' = 'sandbox';

    // 2. Run Gemini Translation if key exists
    const geminiKey = process.env.GEMINI_API_KEY;
    if (geminiKey) {
      try {
        const ai = new GoogleGenAI({ apiKey: geminiKey });
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: `Translate the following text into target language code "${normalizedTarget}". Return ONLY the translation, no explanation, no formatting, no extra tokens.\n\nText: ${text}`,
          config: {
            temperature: 0.1
          }
        });
        
        translatedText = response.text?.trim() || '';
        engine = 'gemini';
      } catch (err) {
        console.warn('[Translate API] Gemini translation failed, falling back to sandbox dictionary:', err);
      }
    }

    // 3. Sandbox Dictionary Fallback (e.g. for local testing/sandbox mode)
    if (!translatedText) {
      const lowerText = text.toLowerCase().trim();
      const targetDict = SANDBOX_TRANSLATIONS[normalizedTarget] || {};
      translatedText = targetDict[lowerText] || `[Translated to ${normalizedTarget}]: ${text}`;
      engine = 'sandbox';
    }

    // 4. Log in audit table (handle error if table not migrated yet in local environment)
    try {
      await supabase.from('translation_audit_logs').insert({
        profile_id: user.id,
        session_type: 'TEXT',
        duration_seconds: 0,
        characters_count: text.length,
        cost_charged: 0.0000
      });
    } catch (dbError) {
      console.warn('[Translate API] Database audit log failed (likely missing columns or tables in local DB):', dbError);
    }

    return NextResponse.json({
      translatedText,
      engine,
      targetLanguage: normalizedTarget,
      sourceLanguage: sourceLanguage || 'auto'
    });

  } catch (err: any) {
    console.error('[Translate Text API Error]:', err);
    return NextResponse.json({ error: 'Internal Server Error', message: err.message }, { status: 500 });
  }
}
