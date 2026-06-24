import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const supabase = await createClient();
  
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ connected: false, error: 'Unauthorized session' }, { status: 401 });
    }

    const { data: tokens, error } = await supabase
      .from('creator_google_tokens')
      .select('google_email')
      .eq('creator_id', user.id)
      .maybeSingle();

    if (error) throw error;

    if (tokens) {
      return NextResponse.json({
        connected: true,
        email: tokens.google_email || 'Connected Google Account'
      });
    }

    return NextResponse.json({ connected: false });
  } catch (error: any) {
    console.error('Error in calendar status check:', error);
    return NextResponse.json({ connected: false, error: error.message }, { status: 500 });
  }
}
