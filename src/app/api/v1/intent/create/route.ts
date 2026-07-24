import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { checkUserQuota, createDatePlan } from '@/lib/date-plan-db';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // 1. Authenticate user session
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Fetch user's role from profiles
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: 'User profile not found.' }, { status: 404 });
    }

    // 3. Perform Monthly Quota Enforcement check
    const quota = await checkUserQuota(user.id, profile.role);
    if (!quota.allowed) {
      return NextResponse.json({
        success: false,
        errorType: 'PLAN_QUOTA_EXCEEDED_NON_PREMIUM',
        message: "You've reached your monthly limit. Upgrade to Premium for unlimited plans."
      }, { status: 403 });
    }

    // 4. Parse request payload
    const body = await request.json();
    const {
      intent_type,
      plan_scope,
      start_timestamp_utc,
      end_timestamp_utc,
      max_applications_int,
      plan_scope_geo_point,
      allowed_move_tags_array
    } = body;

    // Validate required fields
    if (!intent_type || !plan_scope || !start_timestamp_utc || !end_timestamp_utc) {
      return NextResponse.json({
        error: 'Missing required fields: intent_type, plan_scope, start_timestamp_utc, end_timestamp_utc'
      }, { status: 400 });
    }

    // 5. Create the Date Plan
    const newPlan = await createDatePlan({
      poster_user_uuid: user.id,
      intent_type,
      plan_scope,
      start_timestamp_utc,
      end_timestamp_utc,
      max_applications_int,
      plan_scope_geo_point,
      allowed_move_tags_array
    });

    return NextResponse.json({
      success: true,
      message: 'Date plan created successfully.',
      plan: newPlan
    });
  } catch (err: any) {
    console.error('Error creating date plan:', err);
    return NextResponse.json({ error: err.message || 'Internal server error.' }, { status: 500 });
  }
}
