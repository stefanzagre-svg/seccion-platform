import { NextResponse } from 'next/server';
import { MATRIX_PACKS } from '@/lib/matrix-packs';

export async function GET() {
  return NextResponse.json({
    success: true,
    packs: MATRIX_PACKS,
    conversionBenchmark: '10 Red Pills (💊) ≈ €9.99 baseline',
    rules: {
      bluePillBurnRate: '50 Blue Pills (XP) = €1.50 Discount',
      creatorSplit: '90% Creator / 10% Platform (Honored net of gateway toll)'
    }
  });
}
