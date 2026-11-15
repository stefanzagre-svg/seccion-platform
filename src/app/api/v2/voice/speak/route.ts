import { NextRequest, NextResponse } from 'next/server';
import { prepareSpeechText } from '@/lib/kate-specialist';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin-client';
import { checkEndpointRateLimit } from '@/lib/auth-admin';

const DEFAULT_KATE_VOICE_ID = 'Xb7hH8MSUJpSbSDYk0k2'; // Alice (British, clear, engaging, articulate)
const ALLOWED_VOICE_IDS = new Set([DEFAULT_KATE_VOICE_ID]);

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const adminClient = createAdminClient();
    const isRateLimited = await checkEndpointRateLimit(
      adminClient,
      user.id,
      'v2/voice/speak',
      15,
      60
    );
    if (isRateLimited) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }

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

    const requestedVoiceId = typeof body?.voiceId === 'string' ? body.voiceId.trim() : '';
    const voiceId = ALLOWED_VOICE_IDS.has(requestedVoiceId) ? requestedVoiceId : DEFAULT_KATE_VOICE_ID;
    const apiKey = process.env.ELEVENLABS_API_KEY?.trim();

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
