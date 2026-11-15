import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  calculateCheckoutVat,
  normalizeCountryCode,
  type LocationProofInput,
  type VoucherInstrumentType,
} from '@/lib/eu-tax-engine';

const proofSchema = z.object({
  type: z.enum([
    'billing_address',
    'geo_ip',
    'card_bin_country',
    'bank_iban_country',
    'mobile_mcc',
    'sim_country',
    'other_commercial',
  ]),
  countryCode: z.string().min(2).max(4),
  evidenceRef: z.string().optional(),
  capturedAtIso: z.string().optional(),
});

const vatPreviewSchema = z.object({
  netBaseEur: z.number().finite().nonnegative().max(100_000),
  country: z.string().min(2).max(4).optional(),
  postalCode: z.string().max(16).optional(),
  instrumentType: z.enum(['direct_service', 'spv', 'mpv']).optional(),
  creatorShareRate: z.number().min(0.5).max(1).optional(),
  euCrossBorderAnnualEur: z.number().nonnegative().optional(),
  ossRegistered: z.boolean().optional(),
  locationProofs: z.array(proofSchema).max(5).optional(),
});

function detectCountryHeader(req: NextRequest): string {
  const cf = req.headers.get('cf-ipcountry');
  if (cf && cf !== 'XX' && cf !== 'T1') return normalizeCountryCode(cf);
  const vercel = req.headers.get('x-vercel-ip-country');
  if (vercel) return normalizeCountryCode(vercel);
  return '';
}

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const netParam = Number(url.searchParams.get('netBaseEur') ?? url.searchParams.get('amount') ?? '0');
    const geoDetectedCountry = detectCountryHeader(req);
    const country = normalizeCountryCode(url.searchParams.get('country')) || geoDetectedCountry || 'ES';
    const postalCode = url.searchParams.get('postalCode') || undefined;
    const instrumentParam = url.searchParams.get('instrumentType') as VoucherInstrumentType | null;
    const instrumentType: VoucherInstrumentType =
      instrumentParam === 'spv' || instrumentParam === 'mpv' || instrumentParam === 'direct_service'
        ? instrumentParam
        : 'direct_service';
    const shareParam = url.searchParams.get('creatorShareRate');
    const creatorShareRate = shareParam ? Number(shareParam) : 0.9;

    if (!Number.isFinite(netParam) || netParam < 0 || netParam > 100_000) {
      return NextResponse.json(
        { error: 'netBaseEur must be between 0 and 100,000 EUR.' },
        { status: 400 }
      );
    }

    const preview = calculateCheckoutVat({
      netBaseEur: netParam,
      customerCountry: country,
      postalCode,
      instrumentType,
      creatorShareRate: Number.isFinite(creatorShareRate) ? creatorShareRate : 0.9,
      ossRegistered: process.env.SECCION_OSS_REGISTERED !== 'false',
    });

    return NextResponse.json({
      success: true,
      geoDetectedCountry: geoDetectedCountry || null,
      preview,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'VAT preview failed';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = vatPreviewSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid VAT preview payload', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const geoDetectedCountry = detectCountryHeader(req);
    const country =
      normalizeCountryCode(parsed.data.country) || geoDetectedCountry || 'ES';

    const proofs: LocationProofInput[] | undefined = parsed.data.locationProofs?.length
      ? parsed.data.locationProofs
      : geoDetectedCountry
        ? [{ type: 'geo_ip', countryCode: geoDetectedCountry }]
        : undefined;

    // Only enforce 2-proof contradiction override when caller explicitly supplied >=1 proof
    const preview = calculateCheckoutVat({
      netBaseEur: parsed.data.netBaseEur,
      customerCountry: country,
      postalCode: parsed.data.postalCode,
      instrumentType: parsed.data.instrumentType || 'direct_service',
      creatorShareRate: parsed.data.creatorShareRate ?? 0.9,
      euCrossBorderAnnualEur: parsed.data.euCrossBorderAnnualEur,
      ossRegistered: parsed.data.ossRegistered ?? process.env.SECCION_OSS_REGISTERED !== 'false',
      locationProofs: parsed.data.locationProofs?.length ? proofs : undefined,
    });

    return NextResponse.json({
      success: true,
      geoDetectedCountry: geoDetectedCountry || null,
      preview,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'VAT preview failed';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
