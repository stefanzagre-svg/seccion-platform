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
  grossRevenue: number;
  processorFee: number;       // e.g. 4.5% Segpay/CCBill credit card fee
  netRevenue: number;         // grossRevenue - processorFee
  platformCut: number;        // 20% of netRevenue (Guarantees ~15.2% - 18.5% net platform margin)
  totalCreatorEscrow: number; // 80% of netRevenue
  creatorDistributions: Array<{
    creatorId: string;
    guaranteedPayout: number; // 20% of the 80% net escrow
    variablePayout: number;   // up to 60% of the 80% net escrow based on engagement
    totalPayout: number;
  }>;
}

// ─── Constants ───────────────────────────────────────────────────────────────

export const DEFAULT_PROCESSOR_FEE_PERCENT = 0.045; // 4.5% avg Segpay / CCBill processing & reserve
export const PLATFORM_CUT_PERCENT = 0.20;         // 20% of Net Revenue
export const CREATOR_ESCROW_PERCENT = 0.80;        // 80% of Net Revenue

// Of the 80% escrow, how is it split?
export const ESCROW_GUARANTEED_RATIO = 0.25; // 25% of 80% = 20% overall
export const ESCROW_VARIABLE_RATIO = 0.75;   // 75% of 80% = 60% overall

// ─── Functions ───────────────────────────────────────────────────────────────

/**
 * Calculates Net Revenue after deducting payment processor fees (Segpay / CCBill).
 */
export function calculateNetRevenue(grossAmount: number, processorFeePercent: number = DEFAULT_PROCESSOR_FEE_PERCENT): { grossAmount: number; processorFee: number; netRevenue: number } {
  const processorFee = Math.round(grossAmount * processorFeePercent * 100) / 100;
  const netRevenue = Math.max(0, grossAmount - processorFee);
  return { grossAmount, processorFee, netRevenue };
}

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
 * Payouts are calculated as 80% of NET Revenue (Gross minus processor fees).
 * The platform retains 20% of Net Revenue, guaranteeing a 15% - 18% net margin.
 */
export function calculatePayouts(req: MasterSubscriptionRequest, processorFeePercent: number = DEFAULT_PROCESSOR_FEE_PERCENT): PayoutBreakdown {
  const grossRevenue = calculateMasterPrice(req);
  const { processorFee, netRevenue } = calculateNetRevenue(grossRevenue, processorFeePercent);
  
  const platformCut = Math.round(netRevenue * PLATFORM_CUT_PERCENT * 100) / 100;
  const totalCreatorEscrow = Math.round(netRevenue * CREATOR_ESCROW_PERCENT * 100) / 100;

  // If no creators, all net revenue goes to platform
  if (req.creators.length === 0) {
    return {
      grossRevenue,
      processorFee,
      netRevenue,
      platformCut: netRevenue,
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
    const guaranteedPayout = Math.round(creatorTotalPool * ESCROW_GUARANTEED_RATIO * 100) / 100;
    
    // Variable portion (scales with engagement accelerator)
    const maxVariablePayout = creatorTotalPool * ESCROW_VARIABLE_RATIO;
    const variablePayout = Math.round(maxVariablePayout * creator.engagementAccelerator * 100) / 100;

    return {
      creatorId: creator.creatorId,
      guaranteedPayout,
      variablePayout,
      totalPayout: Math.round((guaranteedPayout + variablePayout) * 100) / 100
    };
  });

  return {
    grossRevenue,
    processorFee,
    netRevenue,
    platformCut,
    totalCreatorEscrow,
    creatorDistributions: distributions
  };
}
