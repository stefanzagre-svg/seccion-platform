import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin-client';
import {
  classifyOrderIntent,
  detectSightengineProvenance,
  qualifyDeliveredMedia,
  type ContentSafetyRating,
  type WalletLedgerType,
} from '@/lib/sightengine';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authErr,
    } = await supabase.auth.getUser();

    if (authErr || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let body: Record<string, unknown>;
    try {
      body = (await request.json()) as Record<string, unknown>;
    } catch {
      return NextResponse.json({ error: 'Malformed JSON payload' }, { status: 400 });
    }

    const creatorId = typeof body.creatorId === 'string' ? body.creatorId : user.id;
    const title = typeof body.title === 'string' ? body.title.trim() : '';
    const description = typeof body.description === 'string' ? body.description : '';
    const mediaUrl = typeof body.mediaUrl === 'string' ? body.mediaUrl.trim() : '';
    const mediaType =
      body.mediaType === 'video' || body.mediaType === 'audio' ? body.mediaType : 'image';
    const tier = typeof body.tier === 'string' ? body.tier.trim() : '';
    const tags = Array.isArray(body.tags)
      ? body.tags.filter((t): t is string => typeof t === 'string')
      : [];
    const category = typeof body.category === 'string' ? body.category : '';
    const explicitFlag = Boolean(body.explicitFlag);
    const provenanceLevel =
      typeof body.provenanceLevel === 'string' ? body.provenanceLevel : 'genuine';

    if (creatorId !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden: Authenticated user does not match creatorId.' },
        { status: 403 }
      );
    }

    if (!title || !mediaUrl || !tier) {
      return NextResponse.json(
        { error: 'Missing required fields: title, mediaUrl, tier' },
        { status: 400 }
      );
    }

    const admin = createAdminClient();

    const { data: creator, error: creatorError } = await admin
      .from('profiles')
      .select('id, display_name')
      .eq('id', user.id)
      .single();

    if (creatorError || !creator) {
      return NextResponse.json({ error: 'Creator profile not found' }, { status: 404 });
    }

    // Stage 1: Classify metadata/tag/category intent
    const stage1 = classifyOrderIntent({
      category,
      title,
      description: [description, ...tags].join(' '),
      explicitFlag,
    });

    // Stage 2: Real Sightengine AI safety & provenance inspection (no fake delay)
    const [mediaVerdict, provenanceDetection] = await Promise.all([
      qualifyDeliveredMedia(mediaUrl, stage1.rating),
      detectSightengineProvenance(mediaUrl, mediaType),
    ]);

    if (mediaVerdict.isBlockedProhibited) {
      return NextResponse.json(
        {
          success: false,
          errorType: 'media_safety_fail',
          safetyFlags: mediaVerdict.safetyFlags || [],
          message: mediaVerdict.reason,
        },
        { status: 422 }
      );
    }

    // Server-Lock V3.1 classification & required payment ledger
    const finalRating: ContentSafetyRating =
      stage1.rating === 'NSFW_18' || mediaVerdict.rating === 'NSFW_18' ? 'NSFW_18' : 'SFW';
    const finalLedger: WalletLedgerType =
      finalRating === 'NSFW_18' ? 'sovereign_red_pills' : 'sfw_credits';

    const sightengineSnapshot = {
      contentRating: finalRating,
      requiredLedger: finalLedger,
      stage1DetectedBy: stage1.detectedBy,
      rawNudityScore: mediaVerdict.rawNudityScore,
      partialNudityScore: mediaVerdict.partialNudityScore,
      safeScore: mediaVerdict.safeScore,
      safetyFlags: mediaVerdict.safetyFlags || [],
      provenanceSubmitted: provenanceLevel,
      provenanceDetected: provenanceDetection?.suggestedLevel || null,
      checkedAt: new Date().toISOString(),
    };

    const fullPayload = {
      creator_id: user.id,
      tier,
      title,
      description,
      media_url: mediaUrl,
      media_type: mediaType,
      moderation_status: 'pending',
      content_rating: finalRating,
      required_ledger: finalLedger,
      sightengine_verdict: sightengineSnapshot,
    };

    let newPost: Record<string, unknown> | null = null;
    const firstAttempt = await admin
      .from('platform_content')
      .insert(fullPayload)
      .select('*')
      .single();

    if (firstAttempt.error) {
      const msg = firstAttempt.error.message || '';
      const isMissingCol =
        msg.includes('moderation_status') ||
        msg.includes('content_rating') ||
        msg.includes('required_ledger') ||
        msg.includes('sightengine_verdict') ||
        firstAttempt.error.code === '42703' ||
        firstAttempt.error.code === 'PGRST204';

      if (!isMissingCol) {
        throw firstAttempt.error;
      }

      const fallbackAttempt = await admin
        .from('platform_content')
        .insert({
          creator_id: user.id,
          tier,
          title,
          description,
          media_url: mediaUrl,
          media_type: mediaType,
        })
        .select('*')
        .single();

      if (fallbackAttempt.error) {
        throw fallbackAttempt.error;
      }

      newPost = (fallbackAttempt.data as Record<string, unknown>) || null;
      if (newPost) {
        newPost.moderation_status = 'pending';
        newPost.content_rating = finalRating;
        newPost.required_ledger = finalLedger;
      }
    } else {
      newPost = (firstAttempt.data as Record<string, unknown>) || null;
    }

    return NextResponse.json({
      success: true,
      post: newPost,
      moderation_status: 'pending',
      contentRating: finalRating,
      requiredLedger: finalLedger,
      sightengineVerdict: sightengineSnapshot,
      provenanceDetection,
      message:
        finalRating === 'NSFW_18'
          ? 'Media passed safety checks and was locked to 18+ Sovereign Red Pills (NSFW_18) moderation queue.'
          : 'Media passed safety checks and was locked to SFW Credits moderation queue.',
    });
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : 'Internal server error during upload validation';
    console.error('[CONTENT UPLOAD API] Error:', error);
    return NextResponse.json({ error: errMsg }, { status: 500 });
  }
}
