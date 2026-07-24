import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { supabase } from './supabase';
import { applyInteractionEvent, scoreToLevel, POINT_VALUES } from './relationship-engine';

export interface DatePlan {
  plan_id: string;
  poster_user_uuid: string;
  intent_type: 'Offer' | 'LookingFor';
  plan_scope: 'In-Person' | 'Digital Screen' | 'Hybrid';
  start_timestamp_utc: string;
  end_timestamp_utc: string;
  max_applications_int: number;
  plan_scope_geo_point?: { lat: number; lng: number } | null;
  allowed_move_tags_array?: string[] | null;
  plan_status: 'New' | 'Active' | 'FinalCall' | 'Booked' | 'Expired';
  applicants_waiting_list: string[];
  created_at: string;
  updated_at: string;
}

export interface DatePlanInsertPayload {
  poster_user_uuid: string;
  intent_type: 'Offer' | 'LookingFor';
  plan_scope: 'In-Person' | 'Digital Screen' | 'Hybrid';
  start_timestamp_utc: string;
  end_timestamp_utc: string;
  max_applications_int?: number;
  plan_scope_geo_point?: { lat: number; lng: number } | null;
  allowed_move_tags_array?: string[] | null;
}

/**
 * Instantiates a privileged Supabase client that uses the SERVICE_ROLE_KEY to bypass RLS.
 * Falls back to the public anon key if the service role key is not configured in local environment.
 */
export function getPrivilegedClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  return createSupabaseClient(url, serviceKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '');
}

/**
 * Updates a relationship score using the privileged client to bypass RLS restrictions
 * on symmetric updates (e.g. updating the applier's gauge from the poster's API context).
 */
export async function updateRelationshipScorePrivileged(
  userId: string,
  targetId: string,
  eventType: any
): Promise<number> {
  const client = getPrivilegedClient();
  
  // 1. Get current score
  const { data: rel, error: fetchError } = await client
    .from('relationships')
    .select('gauge_score')
    .eq('user_id', userId)
    .eq('target_id', targetId)
    .maybeSingle();

  if (fetchError) throw fetchError;

  const currentScore = rel?.gauge_score ?? 0;
  const newScore = applyInteractionEvent(currentScore, { type: eventType });
  const newLevel = scoreToLevel(newScore).key;

  // 2. Save updated score
  const { error: updateError } = await client
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
    const { data: profile } = await client
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
      
      await client
        .from('profiles')
        .update({
          connection_points: newPoints,
          quest_stage: newStage
        })
        .eq('id', userId);
    }
  }
  return newScore;
}

/**
 * Checks if a user is allowed to create a new Date Plan based on monthly quota.
 * - Creators bypass the quota limit (unlimited).
 * - Members with an active VIP or Master subscription bypass the quota limit (unlimited).
 * - Standard Members are limited to 1 Date Plan per calendar month.
 */
export async function checkUserQuota(
  userId: string,
  role: 'member' | 'creator'
): Promise<{ allowed: boolean; count: number }> {
  try {
    // 1. Creators are exempt from limits
    if (role === 'creator') {
      return { allowed: true, count: 0 };
    }

    // 2. Query active VIP or Master subscriptions for this user
    const nowIso = new Date().toISOString();
    const { data: activeSubs, error: subError } = await supabase
      .from('subscriptions')
      .select('id')
      .eq('subscriber_id', userId)
      .eq('is_active', true)
      .in('tier', ['master', 'vip'])
      .gt('expires_at', nowIso);

    if (subError) throw subError;

    if (activeSubs && activeSubs.length > 0) {
      return { allowed: true, count: 0 };
    }

    // 3. Basic member: Count plans created during the current calendar month (UTC)
    const startOfMonth = new Date();
    startOfMonth.setUTCDate(1);
    startOfMonth.setUTCHours(0, 0, 0, 0);

    const { count, error: countError } = await supabase
      .from('session_intent_plans')
      .select('plan_id', { count: 'exact', head: true })
      .eq('poster_user_uuid', userId)
      .gte('created_at', startOfMonth.toISOString());

    if (countError) throw countError;

    const currentCount = count || 0;
    return {
      allowed: currentCount < 1,
      count: currentCount,
    };
  } catch (err) {
    console.error('Error checking user Date Plan quota:', err);
    // Safe default to prevent abuse if DB query fails
    return { allowed: false, count: 0 };
  }
}

/**
 * Persists a new Date Plan into the database.
 */
export async function createDatePlan(payload: DatePlanInsertPayload): Promise<DatePlan> {
  // Format PostGIS geography point if provided
  const dbPayload: any = {
    poster_user_uuid: payload.poster_user_uuid,
    intent_type: payload.intent_type,
    plan_scope: payload.plan_scope,
    start_timestamp_utc: payload.start_timestamp_utc,
    end_timestamp_utc: payload.end_timestamp_utc,
    max_applications_int: payload.max_applications_int ?? 10,
    allowed_move_tags_array: payload.allowed_move_tags_array ?? [],
    plan_status: 'New',
  };

  if (payload.plan_scope_geo_point) {
    const { lat, lng } = payload.plan_scope_geo_point;
    dbPayload.plan_scope_geo_point = `POINT(${lng} ${lat})`;
  }

  const { data, error } = await supabase
    .from('session_intent_plans')
    .insert(dbPayload)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Adds an applicant to the Date Plan waitlist.
 */
export async function applyToDatePlan(planId: string, applicantId: string): Promise<void> {
  const { error } = await supabase.rpc('apply_to_date_plan', {
    target_plan_id: planId,
    applicant_id: applicantId
  });

  if (error) throw error;
}

/**
 * Processes poster's response to an application on a Date Plan.
 * - Accept: Books plan, confirms RLS spark (+25) mutually, shortlist reward (+8) symmetrically to others.
 * - Deny: Removes applicant, applies asymmetric RLS rejection penalty (-10) to applier.
 */
export async function respondToDatePlanApplication(
  planId: string,
  applierId: string,
  status: 'accept' | 'deny',
  posterId: string
): Promise<void> {
  // 1. Retrieve the plan details
  const { data: plan, error: fetchError } = await supabase
    .from('session_intent_plans')
    .select('*')
    .eq('plan_id', planId)
    .single();

  if (fetchError) throw fetchError;
  if (!plan) throw new Error('Date plan not found.');
  if (plan.poster_user_uuid !== posterId) {
    throw new Error('Unauthorized: You are not the poster of this plan.');
  }

  const waitingList: string[] = plan.applicants_waiting_list || [];

  if (status === 'accept') {
    if (!waitingList.includes(applierId)) {
      throw new Error('This applicant is not on the waiting list.');
    }

    // 2. Set plan to booked and clear list
    const { error: updateError } = await supabase
      .from('session_intent_plans')
      .update({
        plan_status: 'Booked',
        applicants_waiting_list: [],
      })
      .eq('plan_id', planId);

    if (updateError) throw updateError;

    // 3. Apply mutual confirmed points (+25) using the privileged client
    await updateRelationshipScorePrivileged(posterId, applierId, 'date_plan_confirmed');
    await updateRelationshipScorePrivileged(applierId, posterId, 'date_plan_confirmed');

    // 4. Apply non-punitive waitlist progression points (+8) symmetrically to all other waitlisted candidates
    const waitlistedOthers = waitingList.filter(id => id !== applierId);
    for (const otherId of waitlistedOthers) {
      await updateRelationshipScorePrivileged(posterId, otherId, 'date_plan_shortlisted_not_chosen');
      await updateRelationshipScorePrivileged(otherId, posterId, 'date_plan_shortlisted_not_chosen');
    }
  } else if (status === 'deny') {
    // 2. Remove user from waitlist
    const newList = waitingList.filter(id => id !== applierId);
    const { error: updateError } = await supabase
      .from('session_intent_plans')
      .update({
        applicants_waiting_list: newList,
      })
      .eq('plan_id', planId);

    if (updateError) throw updateError;

    // 3. Apply RLS denial consequence (-10 points) on the applier's gauge toward the poster
    await updateRelationshipScorePrivileged(applierId, posterId, 'date_plan_denied');
  }
}
