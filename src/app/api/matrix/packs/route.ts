import { NextRequest, NextResponse } from 'next/server';

export interface MatrixPack {
  id: string;
  name: string;
  priceEur: number;
  baseRedPills: number;
  bonusRedPills: number;
  totalRedPills: number;
  popular?: boolean;
  maxBluePillDiscountPills: number;
  maxEuroDiscount: number;
}

export const MATRIX_PACKS: MatrixPack[] = [
  {
    id: 'starter',
    name: 'Starter Capsule',
    priceEur: 9.99,
    baseRedPills: 10,
    bonusRedPills: 0,
    totalRedPills: 10,
    maxBluePillDiscountPills: 50,
    maxEuroDiscount: 1.50
  },
  {
    id: 'synergy',
    name: 'Synergy Pulse',
    priceEur: 24.99,
    baseRedPills: 25,
    bonusRedPills: 5,
    totalRedPills: 30,
    popular: true,
    maxBluePillDiscountPills: 150,
    maxEuroDiscount: 4.00
  },
  {
    id: 'guild',
    name: 'Creator Guild',
    priceEur: 49.99,
    baseRedPills: 50,
    bonusRedPills: 20,
    totalRedPills: 70,
    maxBluePillDiscountPills: 300,
    maxEuroDiscount: 8.00
  },
  {
    id: 'whale',
    name: 'Zion Overdrive',
    priceEur: 99.99,
    baseRedPills: 100,
    bonusRedPills: 60,
    totalRedPills: 160,
    maxBluePillDiscountPills: 600,
    maxEuroDiscount: 18.00
  }
];

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
