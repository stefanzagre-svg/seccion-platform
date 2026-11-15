import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import {
  detectMemoryTopicConflict,
  sanitizeAndPrepareMemoryInput,
} from '@/lib/ai/copilot-memory';

const createMemorySchema = z.object({
  title: z.string().min(1).max(140),
  memoryType: z.enum(['brand_voice', 'boundary', 'vip_preference', 'vip_offer_decision']),
  topicSlug: z.string().max(80).optional(),
  summary: z.string().min(1).max(1200),
  targetMemberId: z.string().uuid().nullable().optional(),
  sourceContext: z.string().max(120).optional(),
  recheckWhen: z.string().max(240).optional(),
  supersedePrevious: z.boolean().optional().default(true),
});

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const targetMemberId = searchParams.get('targetMemberId');
    const includeSuperseded = searchParams.get('includeSuperseded') !== 'false';

    let query = supabase
      .from('creator_copilot_memories')
      .select('*')
      .eq('creator_id', user.id)
      .order('checked_at', { ascending: false })
      .limit(100);

    if (targetMemberId) {
      query = query.eq('target_member_id', targetMemberId);
    }
    if (!includeSuperseded) {
      query = query.eq('status', 'active');
    }

    const { data, error } = await query;
    if (error) {
      // Graceful fallback when migration hasn't been applied to remote env yet
      if (error.code === '42P01' || error.message?.includes('does not exist')) {
        return NextResponse.json({ memories: [], schemaPending: true });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ memories: data || [] });
  } catch (err: any) {
    return NextResponse.json(
      { error: 'Internal Server Error', message: err?.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const rawBody = await req.json().catch(() => null);
    const parsed = createMemorySchema.safeParse(rawBody);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid memory payload', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const prepared = sanitizeAndPrepareMemoryInput(parsed.data);

    // Fetch existing active records for creator to detect same-topic decisions cleanly
    const { data: existingRows } = await supabase
      .from('creator_copilot_memories')
      .select('id, target_member_id, topic_slug, status, memory_type')
      .eq('creator_id', user.id)
      .eq('status', 'active');

    const conflictingIds = parsed.data.supersedePrevious
      ? detectMemoryTopicConflict(
          (existingRows || []) as any[],
          prepared.target_member_id,
          prepared.topic_slug
        )
      : [];

    if (conflictingIds.length > 0) {
      await supabase
        .from('creator_copilot_memories')
        .update({ status: 'superseded', updated_at: new Date().toISOString() })
        .eq('creator_id', user.id)
        .in('id', conflictingIds);
    }

    const { data: inserted, error: insertError } = await supabase
      .from('creator_copilot_memories')
      .insert({
        creator_id: user.id,
        target_member_id: prepared.target_member_id,
        title: prepared.title,
        memory_type: prepared.memory_type,
        topic_slug: prepared.topic_slug,
        summary: prepared.summary,
        wikilinks: prepared.wikilinks,
        status: 'active',
        source_context: prepared.source_context,
        checked_at: new Date().toISOString(),
        recheck_when: prepared.recheck_when,
      })
      .select('*')
      .single();

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    if (conflictingIds.length > 0 && inserted?.id) {
      await supabase
        .from('creator_copilot_memories')
        .update({ superseded_by: inserted.id })
        .eq('creator_id', user.id)
        .in('id', conflictingIds);
    }

    return NextResponse.json({
      success: true,
      memory: inserted,
      supersededCount: conflictingIds.length,
      piiRedacted: prepared.piiRedacted,
      redactedTypes: prepared.redactedTypes,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: 'Internal Server Error', message: err?.message },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const targetMemberId = searchParams.get('targetMemberId');

    if (!id && !targetMemberId) {
      return NextResponse.json(
        { error: 'Provide either id or targetMemberId (GDPR VIP forget) to delete.' },
        { status: 400 }
      );
    }

    let delQuery = supabase
      .from('creator_copilot_memories')
      .delete()
      .eq('creator_id', user.id);

    if (id) {
      delQuery = delQuery.eq('id', id);
    } else if (targetMemberId) {
      delQuery = delQuery.eq('target_member_id', targetMemberId);
    }

    const { error } = await delQuery;
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: 'Internal Server Error', message: err?.message },
      { status: 500 }
    );
  }
}
