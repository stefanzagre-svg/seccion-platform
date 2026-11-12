import { NextRequest, NextResponse } from 'next/server';
import { prepareSpeechText } from '@/lib/kate-specialist';

const FALLBACK_ELEVEN_KEY = Buffer.from('c2tfYWI1NGQ5ZWMwMWI1Mjk4N2MxOTdjNDU1M2QxNDM1YzJhZjFjMmZmNjViYTU3ZGZj', 'base64').toString('utf-8');
const DEFAULT_KATE_VOICE_ID = 'Xb7hH8MSUJpSbSDYk0k2'; // Alice (British, clear, engaging, articulate)

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => ({}))) as any;
    const rawText = body?.text || '';
    if (!rawText || typeof rawText !== 'string') {
      return NextResponse.json({ error: 'Missing text parameter' }, { status: 400 });
    }

    // Sanitize markdown/URLs, apply Session phonetic spelling, and trim cleanly on sentence/word boundary
    const cleanedText = prepareSpeechText(rawText, 400);
    if (!cleanedText) {
      return NextResponse.json({ error: 'Text contains no speakable content' }, { status: 400 });
    }

    const voiceId = body?.voiceId || DEFAULT_KATE_VOICE_ID;
    const apiKey = process.env.ELEVENLABS_API_KEY || FALLBACK_ELEVEN_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: 'ElevenLabs not configured' }, { status: 503 });
    }

    const elevenUrl = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`;
    const response = await fetch(elevenUrl, {
      method: 'POST',
      signal: AbortSignal.timeout(10000),
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json',
        'Accept': 'audio/mpeg',
      },
      body: JSON.stringify({
        text: cleanedText,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
          style: 0.0,
          use_speaker_boost: true,
        },
      }),
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      console.error('[ElevenLabs Speak] API error:', response.status, errText);
      return NextResponse.json(
        { error: 'Speech synthesis upstream error', details: errText },
        { status: response.status }
      );
    }

    const audioArrayBuffer = await response.arrayBuffer();
    return new NextResponse(audioArrayBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioArrayBuffer.byteLength.toString(),
        'Cache-Control': 'public, max-age=86400, s-maxage=86400',
      },
    });
  } catch (err: any) {
    console.error('[ElevenLabs Speak] Unhandled error:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
