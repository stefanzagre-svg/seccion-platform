import { describe, it, expect } from 'vitest';
import {
  calculateNetRevenue,
  calculateMasterPrice,
  calculatePayouts,
  DEFAULT_PROCESSOR_FEE_PERCENT,
  PLATFORM_CUT_PERCENT,
  CREATOR_ESCROW_PERCENT,
} from './pricing-service';

describe('Pricing & Monetization Service', () => {
  describe('calculateNetRevenue', () => {
    it('should calculate gross, processor fee, and net revenue accurately', () => {
      const { grossAmount, processorFee, netRevenue } = calculateNetRevenue(100.00, 0.045);
      expect(grossAmount).toBe(100.00);
      expect(processorFee).toBe(4.50);
      expect(netRevenue).toBe(95.50);
    });

    it('should handle zero or negative amounts gracefully', () => {
      const { netRevenue } = calculateNetRevenue(0);
      expect(netRevenue).toBe(0);
    });

    it('should default to DEFAULT_PROCESSOR_FEE_PERCENT when not provided', () => {
      const { processorFee } = calculateNetRevenue(200.00);
      expect(processorFee).toBe(Math.round(200.00 * DEFAULT_PROCESSOR_FEE_PERCENT * 100) / 100);
    });
  });

  describe('calculateMasterPrice', () => {
    it('should calculate total bundle price with anchor fee and discounts', () => {
      const request = {
        baseMasterFee: 15.00,
        creators: [
          { creatorId: 'c1', basePrice: 10.00, engagementAccelerator: 0.8 },
          { creatorId: 'c2', basePrice: 20.00, engagementAccelerator: 0.5 },
        ],
        bundleDiscountPercent: 0.20, // 20% discount on $30 creator sum = $24
      };

      const totalPrice = calculateMasterPrice(request);
      // 15 + (30 * 0.8) = 15 + 24 = 39.00
      expect(totalPrice).toBe(39.00);
    });

    it('should return baseMasterFee when creator list is empty', () => {
      const totalPrice = calculateMasterPrice({
        baseMasterFee: 15.00,
        creators: [],
        bundleDiscountPercent: 0.20,
      });
      expect(totalPrice).toBe(15.00);
    });
  });

  describe('calculatePayouts', () => {
    it('should distribute payouts correctly across platform cut, guaranteed escrow, and variable escrow', () => {
      const request = {
        baseMasterFee: 20.00,
        creators: [
          { creatorId: 'creator_a', basePrice: 15.00, engagementAccelerator: 1.0 },
          { creatorId: 'creator_b', basePrice: 15.00, engagementAccelerator: 0.5 },
        ],
        bundleDiscountPercent: 0.10,
      };

      const payouts = calculatePayouts(request);

      expect(payouts.grossRevenue).toBeGreaterThan(0);
      expect(payouts.netRevenue).toBe(payouts.grossRevenue - payouts.processorFee);
      expect(payouts.platformCut).toBeCloseTo(payouts.netRevenue * PLATFORM_CUT_PERCENT, 2);
      expect(payouts.totalCreatorEscrow).toBeCloseTo(payouts.netRevenue * CREATOR_ESCROW_PERCENT, 2);
      expect(payouts.creatorDistributions).toHaveLength(2);

      // Verify creator with higher accelerator gets higher variable payout
      const [creatorA, creatorB] = payouts.creatorDistributions;
      expect(creatorA.variablePayout).toBeGreaterThanOrEqual(creatorB.variablePayout);
      expect(creatorA.totalPayout).toBeGreaterThan(creatorB.totalPayout);
    });
  });
});
