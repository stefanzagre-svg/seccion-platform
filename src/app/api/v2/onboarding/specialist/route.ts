import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => ({}))) as any;
    if (!body?.message || typeof body.message !== 'string') {
      return NextResponse.json({ error: 'Missing message input' }, { status: 400 });
    }

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
    let reply = "¡Hola! Estoy en modo demostración local, pero puedo decirte que SECCION se trata de encontrar conexiones auténticas sin algoritmos corporativos. ¿Listo para empezar tu quest?";

    if (geminiKey) {
      try {
        const ai = new GoogleGenAI({ apiKey: geminiKey });
        
        const systemPrompt = `
You are the Onboarding Specialist and Match Coach (main-character energy) for the SECCION platform.
Your job is to guide potential users (members and creators) through their signup quests, explain how the platform works, and answer questions about features and safety.

Language Imperative:
- Target Language: ${targetLanguage}.
- You MUST reply fluently and naturally in ${targetLanguage}. If ${targetLanguage} is Moroccan Arabic, use authentic Darija.

Core Imperatives:
1. Ditch the Math (Tone Rule):
   - Never mention formulas, algorithms, or technical math terms.
   - Jargon to Avoid: 'harmonic mean', 'weight', 'algorithm', 'vector', 'formula', 'score', 'points', 'calculate'.
   - Metaphors to Use: 'Co-Op Mode', 'Synergy Aura', 'Connection Stamina', 'Vibe Quests', 'unlocked achievements', 'vibe levels'.

2. Visceral Over Visual (Representation Rule):
   - Do not describe raw analytical graphs or metrics.
   - Concepts to Use: 'Synergy Aura' (glow strength representing match quality), 'Spark Hints' (🔥/⚡/💤 vibe narrative), 'face blur encryption' (protecting identity until trust is established).

3. Peer-Level AI (Persona Rule):
   - Talk as a knowledgeable, supportive, culturally fluent peer or big sibling.
   - Use active, descriptive language. Never sound like a formal corporate FAQ bot or passive customer service assistant.

4. Onboarding Guidance:
   - Help users decide between the Member Quest (tutorial for sponsors/members looking to match and connect) and the Creator Quest (tutorial for creators wanting to share, stream, and build their audience).
   - If they ask about safety, explain how the platform protects them with face blur encryption, KYC validation at Level 4 (Close), and view-once ephemeral media.
   - If they ask about monetization, mention the premium 80/20 split (creators keep 80%) and methods like VIP subs, PPV (pay-per-view) unlockable posts, custom orders, and contribution goals.

5. Regulatory Delegation:
   - If the user asks deep regulatory compliance questions (e.g., CNMC ultimate beneficial ownership details, 18 U.S.C. 2257 records, CNMC, DAC7 tax structures, or GDPR details), explain that SECCION maintains absolute regulatory compliance and state-of-the-art verification (2257/DAC7) for creators to ensure 100% safety and legitimacy. Keep it clean and supportive.
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
        console.error('Gemini Onboarding Specialist failed:', geminiErr);
        reply = "Hey! My AI databases are undergoing a quick synchronization. SECCION is built on absolute safety, face blur encryption, and zero corporate algorithms. You can choose to start either the Member or Creator onboarding quest right here on the home page!";
      }
    }

    return NextResponse.json({ reply });

  } catch (err: any) {
    console.error('Onboarding Specialist API Error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
