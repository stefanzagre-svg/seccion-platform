import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  const supabase = await createClient();

  try {
    const { userId, action, creatorId } = await request.json();
    const activeCreatorId = creatorId || userId;

    if (!activeCreatorId) {
      return NextResponse.json({ error: 'creatorId or userId is required' }, { status: 400 });
    }

    if (action === 'start') {
      const streamKey = 'live_mock_stream_key_' + Math.random().toString(36).substring(7);
      const playbackId = 'mock_playback_id_' + Math.floor(Math.random() * 100000);

      const { data, error } = await supabase
        .from('live_streams')
        .upsert({
          creator_id: activeCreatorId,
          is_live: true,
          viewer_count: Math.floor(Math.random() * 100) + 10,
          start_time: new Date().toISOString(),
          stream_key: streamKey,
          playback_id: playbackId
        }, { onConflict: 'creator_id' })
        .select()
        .single();

      if (error) throw error;

      return NextResponse.json({ 
        success: true, 
        streamKey: data.stream_key,
        playbackId: data.playback_id,
        status: 'active'
      });
    }

    if (action === 'stop') {
      const { data, error } = await supabase
        .from('live_streams')
        .update({
          is_live: false,
          viewer_count: 0,
          start_time: null
        })
        .eq('creator_id', activeCreatorId)
        .select()
        .single();

      if (error) throw error;

      return NextResponse.json({ success: true, status: 'offline' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const creatorId = searchParams.get('creatorId');

  if (!creatorId) {
    return NextResponse.json({ error: 'creatorId is required' }, { status: 400 });
  }

  const supabase = await createClient();

  try {
    const { data: stream, error } = await supabase
      .from('live_streams')
      .select('*')
      .eq('creator_id', creatorId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return NextResponse.json({
      creatorId,
      isLive: stream?.is_live || false,
      viewerCount: stream?.viewer_count || 0,
      startTime: stream?.start_time || null,
      playbackId: stream?.playback_id || null
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
