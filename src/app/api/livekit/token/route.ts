import { NextRequest, NextResponse } from 'next/server';
import { AccessToken } from 'livekit-server-sdk';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const { roomName, participantName, isCreator } = await req.json();

    if (!roomName || !participantName) {
      return NextResponse.json({ error: 'Missing roomName or participantName' }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const apiKey = process.env.LIVEKIT_API_KEY;
    const apiSecret = process.env.LIVEKIT_API_SECRET;

    if (!apiKey || !apiSecret) {
      return NextResponse.json({ error: 'LiveKit credentials not configured' }, { status: 500 });
    }

    // Determine permissions
    // Broadcast rooms (live_*): Only verified room owner (creator) can publish video/audio.
    const isBroadcast = roomName.startsWith('live_');
    let canPublish = false;

    if (isBroadcast) {
      // Check if current user is the creator owner of this room or has role 'creator'
      const { data: creatorProf } = await supabase
        .from('creator_profiles')
        .select('id')
        .eq('id', user.id)
        .single();
      
      canPublish = !!creatorProf;
    } else {
      // Private 1-on-1 calls: both authenticated participants can publish
      canPublish = true;
    }

    const at = new AccessToken(apiKey, apiSecret, {
      identity: user.id,
      name: participantName,
    });

    at.addGrant({
      roomJoin: true,
      room: roomName,
      canPublish: canPublish,
      canSubscribe: true,
    });

    const token = await at.toJwt();

    return NextResponse.json({ token });
  } catch (error: any) {
    console.error('Failed to generate LiveKit token:', error);
    return NextResponse.json({ error: 'Failed to generate token' }, { status: 500 });
  }
}
