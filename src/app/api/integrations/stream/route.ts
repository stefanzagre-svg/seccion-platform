import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin-client';

export async function POST(request: Request) {
  let supabase = await createClient();
  const devUserId = request.headers.get('x-dev-user-id');
  if (process.env.NODE_ENV === 'development' && devUserId) {
    try {
      supabase = createAdminClient();
    } catch (e) {
      console.warn('Could not create admin client for testing:', e);
    }
  }

  try {
    const { userId, action, creatorId } = await request.json();
    const activeCreatorId = creatorId || userId;

    if (!activeCreatorId) {
      return NextResponse.json({ error: 'creatorId or userId is required' }, { status: 400 });
    }

    // Auth Check
    let user;
    const devUserId = request.headers.get('x-dev-user-id');
    if (process.env.NODE_ENV === 'development' && devUserId) {
      user = { id: devUserId };
    } else {
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
      if (!authError && authUser) {
        user = authUser;
      }
    }

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (user.id !== activeCreatorId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (action === 'start') {
      const streamKey = 'live_mock_stream_key_' + Math.random().toString(36).substring(7);
      const playbackId = 'mock_playback_id_' + Math.floor(Math.random() * 100000);
      const token = `host_stream_token_${activeCreatorId}_${Date.now()}`;

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
        status: 'active',
        token
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

  let supabase = await createClient();
  const devUserId = request.headers.get('x-dev-user-id');
  if (process.env.NODE_ENV === 'development' && devUserId) {
    try {
      supabase = createAdminClient();
    } catch (e) {
      console.warn('Could not create admin client for testing:', e);
    }
  }

  try {
    // 1. Fetch current user session
    let user;
    const devUserId = request.headers.get('x-dev-user-id');
    if (process.env.NODE_ENV === 'development' && devUserId) {
      user = { id: devUserId };
    } else {
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
      if (!authError && authUser) {
        user = authUser;
      }
    }
    const isAuthorized = !!user;

    // 2. Fetch live stream details
    const { data: stream, error } = await supabase
      .from('live_streams')
      .select('*')
      .eq('creator_id', creatorId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    // 3. Determine if the live stream is VIP restricted using calendar events schedule
    let isVipRestricted = false;
    if (stream?.is_live) {
      const nowStr = new Date().toISOString();
      const { data: activeVipEvent } = await supabase
        .from('calendar_events')
        .select('id')
        .eq('creator_id', creatorId)
        .in('type', ['vip', 'master'])
        .lte('start_time', nowStr)
        .gte('end_time', nowStr)
        .maybeSingle();

      if (activeVipEvent) {
        isVipRestricted = true;
      }
    }

    // 4. Check access permissions and generate token
    let hasAccess = !isVipRestricted; // Public streams do not require subscription/match checks
    let token = null;

    if (user) {
      if (user.id === creatorId) {
        hasAccess = true;
        token = `host_stream_token_${creatorId}_${Date.now()}`;
      } else if (isVipRestricted) {
        // VIP streams require active VIP/Master subscription or active match
        const { data: subscription } = await supabase
          .from('subscriptions')
          .select('id')
          .eq('subscriber_id', user.id)
          .eq('creator_id', creatorId)
          .eq('is_active', true)
          .maybeSingle();

        const { data: relationship } = await supabase
          .from('relationships')
          .select('is_matched')
          .or(`user_id.eq.${user.id},target_id.eq.${user.id}`)
          .or(`user_id.eq.${creatorId},target_id.eq.${creatorId}`)
          .maybeSingle();

        const isMatched = relationship?.is_matched || false;

        if (subscription || isMatched) {
          hasAccess = true;
          token = `vip_viewer_stream_token_${creatorId}_${user.id}_${Date.now()}`;
        }
      } else {
        // Public stream viewer token
        token = `public_viewer_stream_token_${creatorId}_${user.id}_${Date.now()}`;
      }
    }

    return NextResponse.json({
      creatorId,
      isLive: stream?.is_live || false,
      viewerCount: stream?.viewer_count || 0,
      startTime: stream?.start_time || null,
      playbackId: stream?.playback_id || null,
      isVipRestricted,
      hasAccess,
      token
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
