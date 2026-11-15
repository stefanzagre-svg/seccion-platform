import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin-client';
import { applyInteractionEvent, scoreToLevel, POINT_VALUES, type InteractionEventType } from '@/lib/relationship-engine';

async function incrementConnectionPoints(
  adminDb: ReturnType<typeof createAdminClient>,
  userId: string,
  pointsDelta: number
) {
  if (pointsDelta <= 0) return;
  const { data: prof } = await adminDb
    .from('profiles')
    .select('connection_points, quest_stage')
    .eq('id', userId)
    .maybeSingle();

  if (!prof) return;
  const nextPoints = (prof.connection_points || 0) + pointsDelta;
  let nextStage = Number(prof.quest_stage || 1);
  if (nextPoints >= 500 && nextStage < 3) nextStage = 3;
  else if (nextPoints >= 250 && nextStage < 2) nextStage = 2;

  await adminDb
    .from('profiles')
    .update({ connection_points: nextPoints, quest_stage: nextStage })
    .eq('id', userId);
}

async function applyGaugeEventAdmin(
  adminDb: ReturnType<typeof createAdminClient>,
  userId: string,
  targetId: string,
  eventType: InteractionEventType
) {
  const { data: rel } = await adminDb
    .from('relationships')
    .select('gauge_score')
    .eq('user_id', userId)
    .eq('target_id', targetId)
    .maybeSingle();

  const currentScore = rel?.gauge_score ?? 0;
  const newScore = applyInteractionEvent(currentScore, { type: eventType });
  const newLevel = scoreToLevel(newScore).key;

  await adminDb.from('relationships').upsert(
    {
      user_id: userId,
      target_id: targetId,
      gauge_score: newScore,
      current_level: newLevel,
    },
    { onConflict: 'user_id,target_id' }
  );

  const points = POINT_VALUES[eventType] || 0;
  if (points > 0) {
    await incrementConnectionPoints(adminDb, userId, points);
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authErr,
    } = await supabase.auth.getUser();

    if (authErr || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json().catch(() => null);
    const action = body?.action;
    const adminDb = createAdminClient();

    if (action === 'mutual_match') {
      const targetId = typeof body?.targetId === 'string' ? body.targetId.trim() : '';
      if (!targetId || targetId === user.id) {
        return NextResponse.json({ error: 'Invalid targetId' }, { status: 400 });
      }

      // Verify both users genuinely swiped heart on each other in DB
      const [{ data: myLike }, { data: theirLike }, { data: profs }] = await Promise.all([
        adminDb
          .from('interactions')
          .select('id')
          .eq('actor_id', user.id)
          .eq('target_id', targetId)
          .eq('type', 'heart')
          .limit(1)
          .maybeSingle(),
        adminDb
          .from('interactions')
          .select('id')
          .eq('actor_id', targetId)
          .eq('target_id', user.id)
          .eq('type', 'heart')
          .limit(1)
          .maybeSingle(),
        adminDb
          .from('profiles')
          .select('id, role')
          .in('id', [user.id, targetId]),
      ]);

      if (!myLike || !theirLike) {
        return NextResponse.json({ error: 'Mutual match not verified in interactions' }, { status: 403 });
      }

      const actorProf = profs?.find((p) => p.id === user.id);
      const targetProf = profs?.find((p) => p.id === targetId);
      if (actorProf?.role === 'creator' && targetProf?.role === 'creator') {
        return NextResponse.json({ matched: false });
      }

      await Promise.all([
        adminDb.from('relationships').upsert(
          {
            user_id: user.id,
            target_id: targetId,
            is_matched: true,
            gauge_score: 5,
            current_level: 'strangers',
          },
          { onConflict: 'user_id,target_id' }
        ),
        adminDb.from('relationships').upsert(
          {
            user_id: targetId,
            target_id: user.id,
            is_matched: true,
            gauge_score: 5,
            current_level: 'strangers',
          },
          { onConflict: 'user_id,target_id' }
        ),
      ]);

      await Promise.all([
        incrementConnectionPoints(adminDb, user.id, 100),
        incrementConnectionPoints(adminDb, targetId, 100),
      ]);

      return NextResponse.json({ success: true, matched: true });
    }

    if (action === 'respond_suggestion_move') {
      const messageId = typeof body?.messageId === 'string' ? body.messageId.trim() : '';
      const status = body?.status;
      if (!messageId || (status !== 'accepted' && status !== 'rejected')) {
        return NextResponse.json({ error: 'Invalid suggestion move payload' }, { status: 400 });
      }

      const { data: msg, error: msgFetchErr } = await adminDb
        .from('messages')
        .select('id, sender_id, receiver_id, is_suggestion')
        .eq('id', messageId)
        .maybeSingle();

      if (msgFetchErr || !msg || !msg.is_suggestion) {
        return NextResponse.json({ error: 'Suggestion message not found' }, { status: 404 });
      }

      // Only recipient can accept/reject a suggestion move
      if (msg.receiver_id !== user.id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      const { error: updateErr } = await adminDb
        .from('messages')
        .update({ suggestion_status: status })
        .eq('id', messageId);

      if (updateErr) {
        return NextResponse.json({ error: updateErr.message }, { status: 500 });
      }

      if (status === 'accepted') {
        await applyGaugeEventAdmin(adminDb, msg.sender_id, msg.receiver_id, 'suggestion_move_accepted');
        await applyGaugeEventAdmin(adminDb, msg.receiver_id, msg.sender_id, 'suggestion_move_accepted');
      } else {
        await applyGaugeEventAdmin(adminDb, msg.sender_id, msg.receiver_id, 'suggestion_move_rejected');
      }

      return NextResponse.json({ success: true, status });
    }

    return NextResponse.json({ error: 'Unsupported action' }, { status: 400 });
  } catch (err: any) {
    console.error('[RelationshipsSync] Error:', err);
    return NextResponse.json({ error: err?.message || 'Internal Server Error' }, { status: 500 });
  }
}
