import { NextRequest, NextResponse } from 'next/server';
import { AccessToken } from 'livekit-server-sdk';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Malformed JSON payload' }, { status: 400 });
    }

    const { roomName, participantName, isCreator } = body || {};

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
    const isBroadcast = roomName.startsWith('live_');
    const isPrivateCall = roomName.startsWith('call_');
    let canPublish = false;

    if (isBroadcast) {
      // Broadcast rooms (live_*): Only verified room owner (creator) can publish video/audio.
      const roomIdentifier = roomName.replace(/^live_/, '');

      // Check if current user has creator profile
      const { data: creatorProf } = await supabase
        .from('creator_profiles')
        .select('id')
        .eq('id', user.id)
        .single();

      if (isCreator) {
        if (!creatorProf) {
          return NextResponse.json({ error: 'Forbidden: Creator profile required to publish' }, { status: 403 });
        }

        const isDirectOwner = roomIdentifier === user.id;
        let isStreamOwner = false;

        if (!isDirectOwner) {
          const { data: stream } = await supabase
            .from('live_streams')
            .select('creator_id')
            .eq('id', roomIdentifier)
            .single();
          if (stream && stream.creator_id === user.id) {
            isStreamOwner = true;
          }
        }

        if (!isDirectOwner && !isStreamOwner) {
          return NextResponse.json({ error: 'Forbidden: You do not own this live broadcast room' }, { status: 403 });
        }

        canPublish = true;
      } else {
        // Audience / viewer member joining live stream
        canPublish = false;
      }
    } else if (isPrivateCall) {
      // Private 1-on-1 calls (call_*): Both authorized participants can publish
      const callIdentifier = roomName.replace(/^call_/, '');
      let isAuthorizedParticipant = false;

      // Check call_requests table
      const { data: callReq } = await supabase
        .from('call_requests')
        .select('member_id, creator_id')
        .eq('id', callIdentifier)
        .single();

      if (callReq) {
        if (callReq.member_id === user.id || callReq.creator_id === user.id) {
          isAuthorizedParticipant = true;
        }
      }

      if (!isAuthorizedParticipant) {
        return NextResponse.json({ error: 'Forbidden: You are not an authorized participant in this private call' }, { status: 403 });
      }

      canPublish = true;
    } else {
      // Other rooms: authenticated subscriber only
      canPublish = false;
    }

    const at = new AccessToken(apiKey, apiSecret, {
      identity: user.id,
      name: participantName,
      ttl: 3600, // Bounded 1 hour TTL
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
