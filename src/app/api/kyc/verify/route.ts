import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Legacy self-attested KYC endpoint retired.
 * Verification and role upgrades are handled strictly by verified DIDIT webhooks (/api/kyc/didit-webhook).
 */
export async function POST(_request: NextRequest) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json(
      { error: 'Unauthorized. Please log in to verify your identity.' },
      { status: 401 }
    );
  }

  return NextResponse.json(
    { error: 'Direct self-verification is disabled. Complete biometric KYC via DIDIT instead.' },
    { status: 410 }
  );
}
