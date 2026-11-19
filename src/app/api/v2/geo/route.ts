import { NextRequest, NextResponse } from 'next/server';
import { normalizeCountryCode } from '@/lib/profile-visibility';
import { resolveGeoAgeContext } from '@/lib/age-assurance';

export async function GET(request: NextRequest) {
  const cfCountry = normalizeCountryCode(request.headers.get('cf-ipcountry'));
  const cfRegion = request.headers.get('cf-region-code');
  const ageContext = resolveGeoAgeContext({
    countryCode: cfCountry,
    regionCode: cfRegion,
  });

  return NextResponse.json(
    {
      country: cfCountry,
      region: ageContext.regionCode,
      isStrictUsState: ageContext.isStrictUsState,
      recommendedAgeMethod: ageContext.recommendedMethod,
      ageCheckerAvailable: Boolean(process.env.NEXT_PUBLIC_AGECHECKER_KEY),
    },
    {
      headers: {
        'Cache-Control': 'no-store, private',
      },
    }
  );
}
