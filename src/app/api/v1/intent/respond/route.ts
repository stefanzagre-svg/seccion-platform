import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { respondToDatePlanApplication } from '@/lib/date-plan-db';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // 1. Authenticate poster session
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Parse request payload
    const body = await request.json();
    const { planId, applierId, action } = body;

    // Validate parameters
    if (!planId || !applierId || !action) {
      return NextResponse.json({
        error: 'Missing required parameters: planId, applierId, action'
      }, { status: 400 });
    }

    if (action !== 'accept' && action !== 'deny') {
      return NextResponse.json({
        error: 'Invalid action. Must be either "accept" or "deny".'
      }, { status: 400 });
    }

    // 3. Process the response (accept or deny) via DB layer
    // This helper checks ownership and performs RLS point modifications (confirmed, denied, waitlist)
    await respondToDatePlanApplication(planId, applierId, action, user.id);

    return NextResponse.json({
      success: true,
      message: `Date plan application ${action}ed successfully.`
    });
  } catch (err: any) {
    console.error('Error responding to date plan application:', err);
    return NextResponse.json({ error: err.message || 'Internal server error.' }, { status: 500 });
  }
}
