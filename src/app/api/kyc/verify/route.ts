import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const supabase = await createClient();

    // Simulate premium biometric document scans (biometric verification + matching)
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Update the user's profile to be KYC verified
    const { error } = await supabase
      .from('profiles')
      .update({ is_kyc_verified: true })
      .eq('id', userId);

    if (error) throw error;

    return NextResponse.json({ success: true, message: 'KYC Verification Successful' });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
