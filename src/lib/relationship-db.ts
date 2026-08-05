import { supabase } from './supabase';
import { applyInteractionEvent, scoreToLevel, resolveSharedScore, POINT_VALUES } from './relationship-engine';
import { awardXp } from './xp-service';

export interface Profile {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string;
  role: 'member' | 'creator';
  bio: string;
  hobbies: string[];
  lifestyle_habits: Record<string, string>;
  astro_sign: string;
  relationship_goals: string[];
  relationship_types?: string[];
  sexual_preferences?: string[];
  spoken_languages?: string[];
  album_photos?: string[];
  core_passion?: string;
  bio_prompt_category?: string;
  bio_prompt_question?: string;
  bio_prompt_answer?: string;
  bio_prompt_category_2?: string;
  bio_prompt_question_2?: string;
  bio_prompt_answer_2?: string;
  bio_analysis?: any;
  face_blur_active?: boolean;
  avatar_face_coordinates?: any;
  native_town?: string;
  residence?: string;
  current_location?: string;
  origins?: string;
  privacy_settings?: Record<string, any>;
  is_kyc_verified?: boolean;
}

export interface MatchInfo {
  relationship_id: string;
  target_profile: Profile;
  current_level: string;
  gauge_score: number;
  is_matched: boolean;
}

/**
 * Fetch profiles available for the current user to swipe on.
 * Excludes the current user and any users they have already interacted with.
 */
export async function fetchSwipeableProfiles(currentUserId: string): Promise<Profile[]> {
  try {
    // 1. Get list of user IDs that the current user has already interacted with
    const { data: interactions, error: intError } = await supabase
      .from('interactions')
      .select('target_id')
      .eq('actor_id', currentUserId);

    if (intError) throw intError;

    // Fetch blocked users (where user is blocker or blocked)
    const { data: blocks, error: blockError } = await supabase
      .from('blocked_users')
      .select('blocker_id, blocked_id')
      .or(`blocker_id.eq.${currentUserId},blocked_id.eq.${currentUserId}`);
      
    if (blockError) throw blockError;

    const interactedIds = (interactions || []).map(i => i.target_id);
    const blockedIds = (blocks || []).map(b => b.blocker_id === currentUserId ? b.blocked_id : b.blocker_id);
    
    const excludedIds = Array.from(new Set([...interactedIds, ...blockedIds, currentUserId]));

    // 2. Fetch profiles not in that list
    const { data: profiles, error: profError } = await supabase
      .from('profiles')
      .select('*')
      .not('id', 'in', `(${excludedIds.join(',')})`)
      .limit(10);

    if (profError) throw profError;
    return profiles || [];
  } catch (err) {
    console.error('Error fetching swipeable profiles:', err);
    return [];
  }
}

/**
 * Record a swipe interaction (heart/like or broken_heart/dislike).
 * If mutual heart interaction, creates/updates matched relationships.
 */
export async function recordInteraction(
  actorId: string,
  targetId: string,
  type: 'heart' | 'broken_heart'
): Promise<{ matched: boolean }> {
  try {
    const pointsImpact = type === 'heart' ? 5 : -5;

    // 1. Log interaction
    const { error: intError } = await supabase
      .from('interactions')
      .insert({
        actor_id: actorId,
        target_id: targetId,
        type,
        points_impact: pointsImpact
      });

    if (intError) throw intError;

    // Award Swipe XP (+2 XP)
    await awardXp(actorId, 2);

    if (type === 'heart') {
      // 1.5 Fetch profiles to check roles (Business Rule: Creators cannot match between creators)
      const { data: profiles, error: profError } = await supabase
        .from('profiles')
        .select('id, role')
        .in('id', [actorId, targetId]);

      if (profError) throw profError;

      const actorProfile = profiles?.find(p => p.id === actorId);
      const targetProfile = profiles?.find(p => p.id === targetId);

      if (actorProfile?.role === 'creator' && targetProfile?.role === 'creator') {
        return { matched: false };
      }

      // 2. Check if the target user has already liked the actor
      const { data: targetLikedBack, error: checkError } = await supabase
        .from('interactions')
        .select('*')
        .eq('actor_id', targetId)
        .eq('target_id', actorId)
        .eq('type', 'heart')
        .limit(1);

      if (checkError) throw checkError;

      if (targetLikedBack && targetLikedBack.length > 0) {
        // Mutual Match!
        // 3. Upsert relationship records for both users
        // Actor -> Target
        const { error: rel1Error } = await supabase
          .from('relationships')
          .upsert({
            user_id: actorId,
            target_id: targetId,
            is_matched: true,
            gauge_score: 5, // base score for match created
            current_level: 'strangers'
          }, { onConflict: 'user_id,target_id' });

        if (rel1Error) throw rel1Error;

        // Target -> Actor
        const { error: rel2Error } = await supabase
          .from('relationships')
          .upsert({
            user_id: targetId,
            target_id: actorId,
            is_matched: true,
            gauge_score: 5,
            current_level: 'strangers'
          }, { onConflict: 'user_id,target_id' });

        if (rel2Error) throw rel2Error;

        // Award Match XP (+100 XP to both matched users)
        await awardXp(actorId, 100);
        await awardXp(targetId, 100);

        return { matched: true };
      }
    }

    return { matched: false };
  } catch (err) {
    console.error('Error recording interaction:', err);
    return { matched: false };
  }
}

/**
 * Fetch all relationships where is_matched = true for the current user.
 */
export async function fetchMatches(userId: string): Promise<MatchInfo[]> {
  try {
    const { data: blocks, error: blockError } = await supabase
      .from('blocked_users')
      .select('blocker_id, blocked_id')
      .or(`blocker_id.eq.${userId},blocked_id.eq.${userId}`);
      
    if (blockError) throw blockError;
    const blockedIds = (blocks || []).map(b => b.blocker_id === userId ? b.blocked_id : b.blocker_id);

    let query = supabase
      .from('relationships')
      .select(`
        id,
        current_level,
        gauge_score,
        is_matched,
        target_id,
        target_profile:profiles!relationships_target_id_fkey(*)
      `)
      .eq('user_id', userId)
      .eq('is_matched', true);

    if (blockedIds.length > 0) {
      query = query.not('target_id', 'in', `(${blockedIds.join(',')})`);
    }

    const { data: relationships, error } = await query;

    if (error) throw error;

    return (relationships || []).map((r: any) => ({
      relationship_id: r.id,
      target_profile: r.target_profile,
      current_level: r.current_level,
      gauge_score: r.gauge_score,
      is_matched: r.is_matched
    }));
  } catch (err) {
    console.error('Error fetching matches:', err);
    return [];
  }
}

/**
 * Fetch profiles of users who have liked the current user,
 * but the current user has not yet interacted with them.
 */
export async function fetchPendingMatches(currentUserId: string): Promise<Profile[]> {
  try {
    // 1. Get list of user IDs that the current user has already interacted with (swiped heart or broken_heart)
    const { data: interactions, error: intError } = await supabase
      .from('interactions')
      .select('target_id')
      .eq('actor_id', currentUserId);

    if (intError) throw intError;

    const interactedIds = (interactions || []).map(i => i.target_id);
    interactedIds.push(currentUserId); // Exclude self

    // 2. Get list of user IDs that have liked the current user
    const { data: likesReceived, error: likesError } = await supabase
      .from('interactions')
      .select('actor_id')
      .eq('target_id', currentUserId)
      .eq('type', 'heart');

    if (likesError) throw likesError;

    const likerIds = (likesReceived || []).map(i => i.actor_id);

    // Filter out likers that the current user has already interacted with
    const pendingLikerIds = Array.from(new Set(likerIds.filter(id => !interactedIds.includes(id))));

    if (pendingLikerIds.length === 0) return [];

    // 3. Fetch profiles of those pending likers
    const { data: profiles, error: profError } = await supabase
      .from('profiles')
      .select('*')
      .in('id', pendingLikerIds);

    if (profError) throw profError;
    return profiles || [];
  } catch (err) {
    console.error('Error fetching pending matches:', err);
    return [];
  }
}


/**
 * Fetch relationship metrics between two users (symmetric/harmonic RLS metrics).
 */
export async function getRelationshipState(userId: string, targetId: string) {
  try {
    const { data: rels, error } = await supabase
      .from('relationships')
      .select('*')
      .or(`and(user_id.eq.${userId},target_id.eq.${targetId}),and(user_id.eq.${targetId},target_id.eq.${userId})`);

    if (error) throw error;

    const myRel = rels?.find(r => r.user_id === userId);
    const theirRel = rels?.find(r => r.user_id === targetId);

    const myScore = myRel?.gauge_score ?? 0;
    const theirScore = theirRel?.gauge_score ?? 0;

    return {
      myScore,
      theirScore,
      sharedScore: resolveSharedScore(myScore, theirScore),
      isMatched: myRel?.is_matched || false,
      myRel: myRel || null
    };
  } catch (err) {
    console.error('Error fetching relationship state:', err);
    return { myScore: 0, theirScore: 0, sharedScore: 0, isMatched: false, myRel: null };
  }
}

/**
 * Update the RLS gauge score for the current user toward a target.
 */
export async function updateRelationshipScore(
  userId: string,
  targetId: string,
  eventType: any
): Promise<number> {
  try {
    // 1. Get current score
    const { data: rel, error: fetchError } = await supabase
      .from('relationships')
      .select('gauge_score')
      .eq('user_id', userId)
      .eq('target_id', targetId)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;

    const currentScore = rel?.gauge_score ?? 0;
    const newScore = applyInteractionEvent(currentScore, { type: eventType });
    const newLevel = scoreToLevel(newScore).key;

    // 2. Save updated score
    const { error: updateError } = await supabase
      .from('relationships')
      .upsert({
        user_id: userId,
        target_id: targetId,
        gauge_score: newScore,
        current_level: newLevel
      }, { onConflict: 'user_id,target_id' });

    if (updateError) throw updateError;

    // 3. Award Connection Points to the active user (actor)
    const pointsAwarded = POINT_VALUES[eventType as keyof typeof POINT_VALUES] || 0;
    if (pointsAwarded > 0) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('connection_points, quest_stage')
        .eq('id', userId)
        .maybeSingle();
      
      if (profile) {
        const currentPoints = profile.connection_points || 0;
        const newPoints = currentPoints + pointsAwarded;
        let newStage = profile.quest_stage || 1;
        
        // Auto-advance quest_stage if crossing thresholds
        if (newPoints >= 500 && newStage < 3) {
          newStage = 3;
        } else if (newPoints >= 250 && newStage < 2) {
          newStage = 2;
        }
        
        await supabase
          .from('profiles')
          .update({
            connection_points: newPoints,
            quest_stage: newStage
          })
          .eq('id', userId);
      }
    }
    return newScore;
  } catch (err) {
    console.error('Error updating relationship score:', err);
    return 0;
  }
}

/**
 * Fetch message history between two users.
 */
export async function fetchMessages(userId: string, targetId: string) {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .or(`and(sender_id.eq.${userId},receiver_id.eq.${targetId}),and(sender_id.eq.${targetId},receiver_id.eq.${userId})`)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Error fetching messages:', err);
    return [];
  }
}

/**
 * Send a message and update the relationship gauge score.
 */
export async function sendMessage(
  senderId: string,
  receiverId: string,
  text: string,
  ephemeralData?: {
    is_ephemeral?: boolean;
    media_url?: string | null;
    media_type?: 'image' | 'video' | 'file' | null;
    media_name?: string | null;
    media_size?: string | null;
  }
) {
  try {
    // 1. Insert message
    const insertObj: any = {
      sender_id: senderId,
      receiver_id: receiverId,
      text
    };

    if (ephemeralData) {
      insertObj.is_ephemeral = ephemeralData.is_ephemeral ?? false;
      insertObj.media_url = ephemeralData.media_url ?? null;
      insertObj.media_type = ephemeralData.media_type ?? null;
      insertObj.media_name = ephemeralData.media_name ?? null;
      insertObj.media_size = ephemeralData.media_size ?? null;
    }

    const { data: message, error: sendError } = await supabase
      .from('messages')
      .insert(insertObj)
      .select()
      .single();

    if (sendError) throw sendError;

    // Award Message XP (+5 XP to sender)
    await awardXp(senderId, 5);

    // 2. Update relationship gauge
    const newScore = await updateRelationshipScore(senderId, receiverId, 'message_sent');

    return { message, newScore };
  } catch (err) {
    console.error('Error sending message:', err);
    throw err;
  }
}

/**
 * Update the current user's profile with chosen Archetype pre-configurations.
 */
export async function updateProfileArchetype(userId: string, data: any) {
  try {
    // Award Profile Completion XP (+250 XP)
    await awardXp(userId, 250);

    const { error } = await supabase
      .from('profiles')
      .update({
        archetype: data.archetype,
        hobbies: data.hobbies,
        lifestyle_habits: data.lifestyle_habits,
        relationship_goals: data.relationship_goals,
        quest_stage: data.quest_stage,
        connection_points: data.connection_points
      })
      .eq('id', userId);

    if (error) throw error;
  } catch (err) {
    console.error('Error updating archetype profile details:', err);
    throw err;
  }
}

/**
 * Send a suggestion move as a message.
 */
export async function sendSuggestionMove(
  senderId: string,
  receiverId: string,
  moveId: string,
  label: string
) {
  try {
    const { data: message, error: sendError } = await supabase
      .from('messages')
      .insert({
        sender_id: senderId,
        receiver_id: receiverId,
        text: `Proposing a suggestion move: ${label}`,
        is_suggestion: true,
        suggestion_move_id: moveId,
        suggestion_status: 'pending'
      })
      .select()
      .single();

    if (sendError) throw sendError;
    return message;
  } catch (err) {
    console.error('Error sending suggestion move message:', err);
    throw err;
  }
}

/**
 * Accept or reject a suggestion move. Updates RLS score gauge accordingly.
 */
export async function respondToSuggestionMove(
  messageId: string,
  senderId: string,
  receiverId: string,
  status: 'accepted' | 'rejected'
) {
  try {
    // 1. Update message status
    const { error: msgError } = await supabase
      .from('messages')
      .update({ suggestion_status: status })
      .eq('id', messageId);

    if (msgError) throw msgError;

    // 2. Adjust RLS Scores based on acceptance/rejection
    if (status === 'accepted') {
      // Both users gain mutual spark points (+20)
      await updateRelationshipScore(senderId, receiverId, 'suggestion_move_accepted');
      await updateRelationshipScore(receiverId, senderId, 'suggestion_move_accepted');
    } else {
      // Rejection reduces the score (-5 points)
      await updateRelationshipScore(senderId, receiverId, 'suggestion_move_rejected');
    }
  } catch (err) {
    console.error('Error responding to suggestion move:', err);
    throw err;
  }
}

// ─── Profile Album/Media Helpers ─────────────────────────────────────────────

export interface ProfileMedia {
  id: string;
  user_id: string;
  media_url: string;
  media_type: 'image' | 'video';
  is_hidden: boolean;
  required_level: string;
  created_at?: string;
  face_blur_enabled?: boolean;
  face_coordinates?: any;
  video_start_time?: number | null;
  video_end_time?: number | null;
}

/**
 * Fetch all media items in a user's profile album.
 */
export async function fetchProfileMedia(userId: string): Promise<ProfileMedia[]> {
  try {
    const { data, error } = await supabase
      .from('profile_media')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Error fetching profile media:', err);
    return [];
  }
}

/**
 * Upload a media item (photo/video) to a user's album.
 */
export async function uploadProfileMedia(
  userId: string,
  mediaUrl: string,
  mediaType: 'image' | 'video',
  isHidden: boolean,
  requiredLevel: string
): Promise<ProfileMedia | null> {
  try {
    const { data, error } = await supabase
      .from('profile_media')
      .insert({
        user_id: userId,
        media_url: mediaUrl,
        media_type: mediaType,
        is_hidden: isHidden,
        required_level: requiredLevel
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Error uploading profile media:', err);
    return null;
  }
}

/**
 * Delete a media item from the user's album.
 */
export async function deleteProfileMedia(mediaId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('profile_media')
      .delete()
      .eq('id', mediaId);

    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Error deleting profile media:', err);
    return false;
  }
}

/**
 * Check if the user meets the minimum of 2 public photos/videos requirement in member_albums
 */
export async function checkPublicPhotoRequirement(userId: string): Promise<boolean> {
  try {
    const { count: countAlbums } = await supabase
      .from('member_albums')
      .select('id', { count: 'exact', head: true })
      .eq('member_id', userId)
      .eq('visibility', 'public');

    const { count: countMedia } = await supabase
      .from('profile_media')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_hidden', false);

    const totalPublic = (countAlbums || 0) + (countMedia || 0);
    return totalPublic >= 2;
  } catch (err) {
    console.error('Error checking public photo requirement:', err);
    return false;
  }
}

/**
 * Fetch member albums
 */
export async function fetchMemberAlbums(userId: string): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('member_albums')
      .select('*')
      .eq('member_id', userId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Error fetching member albums:', err);
    return [];
  }
}
