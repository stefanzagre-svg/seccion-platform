/**
 * Pricing & Monetization Service — Project Fusion
 * 
 * Handles the "Sponsored Creators" Master Subscription anchor-price formula 
 * and escrow payout calculations.
 */

// ─── Types ───────────────────────────────────────────────────────────────────

export interface CreatorSubscription {
  creatorId: string;
  basePrice: number; // e.g., 5.00 for $5
  engagementAccelerator: number; // 0.0 to 1.0 (multiplier for variable payout)
}

export interface MasterSubscriptionRequest {
  baseMasterFee: number; // Anchor fee (e.g., $15.00)
  creators: CreatorSubscription[];
  bundleDiscountPercent: number; // e.g., 0.20 for 20% off the aggregate cost
}

export interface PayoutBreakdown {
  totalRevenue: number;
  platformCut: number;       // 20%
  totalCreatorEscrow: number; // 80%
  creatorDistributions: Array<{
    creatorId: string;
    guaranteedPayout: number; // 20% of the 80% escrow
    variablePayout: number;   // up to 60% of the 80% escrow based on engagement
    totalPayout: number;
  }>;
}

// ─── Constants ───────────────────────────────────────────────────────────────

export const PLATFORM_CUT_PERCENT = 0.20;
export const CREATOR_ESCROW_PERCENT = 0.80;

// Of the 80% escrow, how is it split?
export const ESCROW_GUARANTEED_RATIO = 0.25; // 25% of 80% = 20% overall
export const ESCROW_VARIABLE_RATIO = 0.75;   // 75% of 80% = 60% overall

// ─── Functions ───────────────────────────────────────────────────────────────

/**
 * Calculates the total cost to the user for the Master Subscription.
 * Formula: PM = Base_Master_Fee + (Sum(Creator_Prices) * (1 - Discount))
 */
export function calculateMasterPrice(req: MasterSubscriptionRequest): number {
  const aggregateCost = req.creators.reduce((sum, c) => sum + c.basePrice, 0);
  const discountedCost = aggregateCost * (1 - req.bundleDiscountPercent);
  return req.baseMasterFee + discountedCost;
}

/**
 * Calculates the escrow payouts for a given billing cycle.
 * The total revenue is split: 20% platform, 80% creators.
 * The creator pool is distributed proportionally based on their base price weight,
 * then split into guaranteed and variable tranches.
 */
export function calculatePayouts(req: MasterSubscriptionRequest): PayoutBreakdown {
  const totalRevenue = calculateMasterPrice(req);
  const platformCut = totalRevenue * PLATFORM_CUT_PERCENT;
  const totalCreatorEscrow = totalRevenue * CREATOR_ESCROW_PERCENT;

  // If no creators, all goes to platform (or hold in escrow)
  if (req.creators.length === 0) {
    return {
      totalRevenue,
      platformCut: totalRevenue,
      totalCreatorEscrow: 0,
      creatorDistributions: []
    };
  }

  // Calculate weights for each creator based on their original price
  const aggregateCost = req.creators.reduce((sum, c) => sum + c.basePrice, 0);

  const distributions = req.creators.map(creator => {
    const shareWeight = creator.basePrice / aggregateCost;
    const creatorTotalPool = totalCreatorEscrow * shareWeight;
    
    // Guaranteed portion
    const guaranteedPayout = creatorTotalPool * ESCROW_GUARANTEED_RATIO;
    
    // Variable portion (scales with engagement accelerator)
    const maxVariablePayout = creatorTotalPool * ESCROW_VARIABLE_RATIO;
    const variablePayout = maxVariablePayout * creator.engagementAccelerator;

    // Any unearned variable payout (if accelerator < 1) could theoretically return to platform or roll over,
    // but for this model we assume it's kept by the platform or a community pool.

    return {
      creatorId: creator.creatorId,
      guaranteedPayout,
      variablePayout,
      totalPayout: guaranteedPayout + variablePayout
    };
  });

  return {
    totalRevenue,
    platformCut,
    totalCreatorEscrow,
    creatorDistributions: distributions
  };
}
