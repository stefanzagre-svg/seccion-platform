import { NextRequest, NextResponse } from 'next/server';
import { normalizeCountryCode } from '@/lib/profile-visibility';

export async function GET(request: NextRequest) {
  const cfCountry = normalizeCountryCode(request.headers.get('cf-ipcountry'));
  return NextResponse.json(
    { country: cfCountry },
    {
      headers: {
        'Cache-Control': 'no-store, private',
      },
    }
  );
}
