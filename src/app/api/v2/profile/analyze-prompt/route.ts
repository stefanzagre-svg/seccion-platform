import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { GoogleGenAI } from '@google/genai';

interface AnalyzePromptRequest {
  promptCategory: string;
  promptQuestion: string;
  promptAnswer: string;
  promptIndex?: number;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as AnalyzePromptRequest;
    const { promptCategory, promptQuestion, promptAnswer, promptIndex = 1 } = body;

    if (!promptCategory || !promptQuestion || !promptAnswer) {
      return NextResponse.json(
        { error: 'Missing required fields: promptCategory, promptQuestion, promptAnswer' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // 1. Get current authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let analysisResult: any = null;
    const geminiKey = process.env.GEMINI_API_KEY;

    if (geminiKey) {
      try {
        const ai = new GoogleGenAI({ apiKey: geminiKey });
        
        const systemInstruction = `
You are an expert Relational Psychologist and Personality Analyzer.
Analyze the user's narrative response to a modern dating and connection profile prompt.
Your task is to extract scores for:
1. "Emotional_Vector": Vulnerability_Score (0.0 to 1.0), Defensive_Score (0.0 to 1.0), and Idealization_Bias (0.0 to 1.0).
2. "Interaction_Style": Directness (High/Moderate/Low), Witty (High/Moderate/Low), and Introspective (High/Moderate/Low/Very High).
3. "Behavioral_Pattern": Investment_Driver (array of motivations, e.g., "Experience", "Emotional Connection", "Security", "Validation", "Intellectual Stimulation") and Red_Flags (array of potential negative traits, e.g., "Idealization Bias", "Low Vulnerability", "High Defensiveness", "Conflict Avoidance").

Return ONLY a valid JSON object matching the requested schema.
        `;

        const prompt = `
Analyze the user's response to this profile prompt:
Category: "${promptCategory}"
Prompt Question: "${promptQuestion}"
User's Answer: "${promptAnswer}"

Return a JSON matching this schema:
{
  "Emotional_Vector": {
    "Vulnerability_Score": number,
    "Defensive_Score": number,
    "Idealization_Bias": number
  },
  "Interaction_Style": {
    "Directness": "High" | "Moderate" | "Low",
    "Witty": "High" | "Moderate" | "Low",
    "Introspective": "High" | "Moderate" | "Low" | "Very High"
  },
  "Behavioral_Pattern": {
    "Investment_Driver": string[],
    "Red_Flags": string[]
  }
}
        `;

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: {
            systemInstruction,
            responseMimeType: 'application/json',
            temperature: 0.3,
          }
        });

        const text = response.text;
        if (text) {
          analysisResult = JSON.parse(text);
        }
      } catch (err) {
        console.error('Gemini API Prompt Analysis Error, falling back to mock analysis:', err);
      }
    }

    // Fallback Mock Analysis if Gemini fails or is not configured
    if (!analysisResult) {
      // Generate somewhat realistic mock scores based on word count/sentiment indicators
      const length = promptAnswer.length;
      const lowerAnswer = promptAnswer.toLowerCase();
      
      const vulnerability = Math.min(0.95, Math.max(0.25, 0.4 + (length / 800) + (lowerAnswer.includes('sad') || lowerAnswer.includes('pain') || lowerAnswer.includes('cry') || lowerAnswer.includes('vulnerable') ? 0.25 : 0)));
      const defensive = Math.min(0.9, Math.max(0.05, 0.5 - (length / 1000) - (lowerAnswer.includes('sorry') || lowerAnswer.includes('learning') || lowerAnswer.includes('mistake') ? 0.2 : 0)));
      const idealization = Math.min(0.95, Math.max(0.1, 0.3 + (lowerAnswer.includes('perfect') || lowerAnswer.includes('always') || lowerAnswer.includes('dream') ? 0.3 : 0)));
      
      const introspective = length > 300 ? 'Very High' : length > 180 ? 'High' : 'Moderate';
      const directness = lowerAnswer.includes('confront') || lowerAnswer.includes('direct') || lowerAnswer.includes('straight') ? 'High' : 'Moderate';
      const witty = lowerAnswer.includes('funny') || lowerAnswer.includes('laugh') || lowerAnswer.includes('joke') ? 'High' : 'Low';

      const investmentDrivers = ['Experience'];
      if (promptCategory === 'investment_value') investmentDrivers.push('Material Effort');
      if (lowerAnswer.includes('connection') || lowerAnswer.includes('deep')) investmentDrivers.push('Emotional Connection');

      const redFlags: string[] = [];
      if (defensive > 0.6) redFlags.push('High Defensiveness');
      if (idealization > 0.7) redFlags.push('Idealization Bias');

      analysisResult = {
        Emotional_Vector: {
          Vulnerability_Score: parseFloat(vulnerability.toFixed(2)),
          Defensive_Score: parseFloat(defensive.toFixed(2)),
          Idealization_Bias: parseFloat(idealization.toFixed(2))
        },
        Interaction_Style: {
          Directness: directness,
          Witty: witty,
          Introspective: introspective
        },
        Behavioral_Pattern: {
          Investment_Driver: investmentDrivers,
          Red_Flags: redFlags
        }
      };
    }

    // 2. Update user's profile in Supabase
    const updatePayload = promptIndex === 2 ? {
      bio_prompt_category_2: promptCategory,
      bio_prompt_question_2: promptQuestion,
      bio_prompt_answer_2: promptAnswer,
      bio_analysis_2: analysisResult
    } : {
      bio_prompt_category: promptCategory,
      bio_prompt_question: promptQuestion,
      bio_prompt_answer: promptAnswer,
      bio_analysis: analysisResult
    };

    const { error: dbError } = await supabase
      .from('profiles')
      .update(updatePayload)
      .eq('id', user.id);

    if (dbError) {
      throw dbError;
    }

    return NextResponse.json({
      success: true,
      ...(promptIndex === 2 ? {
        bio_prompt_category_2: promptCategory,
        bio_prompt_question_2: promptQuestion,
        bio_prompt_answer_2: promptAnswer,
        bio_analysis_2: analysisResult
      } : {
        bio_prompt_category: promptCategory,
        bio_prompt_question: promptQuestion,
        bio_prompt_answer: promptAnswer,
        bio_analysis: analysisResult
      })
    });

  } catch (err: any) {
    console.error('Error in analyze-prompt API:', err);
    return NextResponse.json(
      { error: 'Internal Server Error', message: err.message || err },
      { status: 500 }
    );
  }
}
