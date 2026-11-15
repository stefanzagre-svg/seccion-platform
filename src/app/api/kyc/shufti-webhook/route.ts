import { NextResponse } from 'next/server';

/**
 * Legacy Shufti Pro endpoint retired.
 * All identity & age verification now routes through Didit v3 (/api/kyc/didit-session + /api/kyc/didit-webhook).
 */
export async function POST() {
  return NextResponse.json(
    { error: 'Legacy Shufti verification endpoint has been retired. Use DIDIT verification instead.' },
    { status: 410 }
  );
}
