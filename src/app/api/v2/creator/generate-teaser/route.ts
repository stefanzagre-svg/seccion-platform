import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderTitle, description } = body;

    if (!orderTitle) {
      return NextResponse.json({ error: 'Missing orderTitle' }, { status: 400 });
    }

    const geminiKey = process.env.GEMINI_API_KEY;
    if (!geminiKey) {
      return NextResponse.json({ error: 'GEMINI_API_KEY not configured' }, { status: 500 });
    }

    const ai = new GoogleGenAI({ apiKey: geminiKey });

    // Step 1: Use Gemini to create an Imagen 3 Prompt cue
    const promptCueResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `You are an art director. Generate a highly detailed Imagen 3 prompt to create a "teaser thumbnail" for a custom content order titled: "${orderTitle}". Description: "${description}". The image should be cinematic, slightly mysterious, and hype up the delivery of the content.`
    });

    const imagenPrompt = promptCueResponse.text || `Cinematic teaser poster for ${orderTitle}`;

    // Note: In production, we would pass 'imagenPrompt' to the actual Imagen 3 API.
    // For this implementation, we will mock the Imagen 3 response URL as it requires specific GCP Imagen setup.
    const mockImagen3Url = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop";

    return NextResponse.json({
      success: true,
      imagenPrompt,
      teaserImageUrl: mockImagen3Url,
      generatedAt: new Date().toISOString()
    });

  } catch (err: any) {
    console.error('Teaser Generation Error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
