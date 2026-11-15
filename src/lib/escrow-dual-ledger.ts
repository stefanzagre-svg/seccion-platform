/**
 * SECCION Financial Stack V3.1 — Dual-Ledger Wallet & Escrow Settlement Helpers
 *
 * Strictly isolates mainstream `sfw_credits` (`sfw_credits_balance`) from
 * 18+ `sovereign_red_pills` (`red_pills_balance`), evaluates Founding (90%) vs
 * Standard (80%) creator revenue splits, and guards atomic debit/refund math.
 */

import type { ContentSafetyRating, WalletLedgerType } from '@/lib/sightengine';

export type WalletColumnName = 'sfw_credits_balance' | 'red_pills_balance';

export interface WalletBalancesSnapshot {
  sfw_credits_balance?: number | null;
  red_pills_balance?: number | null;
  blue_pills_xp?: number | null;
}

export interface CreatorSplitProfile {
  is_approved_founder_creator?: boolean | null;
  promo_90_approved_at?: string | null;
  custom_creator_rate?: number | string | null;
}

export function getWalletColumnForLedger(ledger: WalletLedgerType): WalletColumnName {
  return ledger === 'sfw_credits' ? 'sfw_credits_balance' : 'red_pills_balance';
}

export function getLedgerForRating(rating: ContentSafetyRating): WalletLedgerType {
  return rating === 'NSFW_18' ? 'sovereign_red_pills' : 'sfw_credits';
}

export function computeDualWalletDebit(
  wallet: WalletBalancesSnapshot | null | undefined,
  requiredLedger: WalletLedgerType,
  amount: number
):
  | {
      ok: true;
      column: WalletColumnName;
      previousBalance: number;
      newBalance: number;
      updatePayload: Record<string, number | string>;
    }
  | {
      ok: false;
      errorCode: 'INSUFFICIENT_SFW_CREDITS' | 'INSUFFICIENT_RED_PILLS' | 'INVALID_AMOUNT';
      available: number;
      column: WalletColumnName;
    } {
  const column = getWalletColumnForLedger(requiredLedger);
  const currentSfw = Number(wallet?.sfw_credits_balance ?? 0);
  const currentRed = Number(wallet?.red_pills_balance ?? 0);
  const available = requiredLedger === 'sfw_credits' ? currentSfw : currentRed;

  if (!Number.isFinite(amount) || amount <= 0) {
    return { ok: false, errorCode: 'INVALID_AMOUNT', available, column };
  }

  if (available < amount) {
    return {
      ok: false,
      errorCode: requiredLedger === 'sfw_credits' ? 'INSUFFICIENT_SFW_CREDITS' : 'INSUFFICIENT_RED_PILLS',
      available,
      column,
    };
  }

  const newBalance = Number((available - amount).toFixed(2));
  return {
    ok: true,
    column,
    previousBalance: available,
    newBalance,
    updatePayload: {
      [column]: newBalance,
      updated_at: new Date().toISOString(),
    },
  };
}

export function computeDualWalletRefund(
  wallet: WalletBalancesSnapshot | null | undefined,
  requiredLedger: WalletLedgerType | null | undefined,
  amount: number
): {
  ledger: WalletLedgerType;
  column: WalletColumnName;
  previousBalance: number;
  newBalance: number;
  updatePayload: Record<string, number | string>;
} {
  const ledger: WalletLedgerType =
    requiredLedger === 'sfw_credits' ? 'sfw_credits' : 'sovereign_red_pills';
  const column = getWalletColumnForLedger(ledger);
  const current = Number(
    ledger === 'sfw_credits' ? wallet?.sfw_credits_balance ?? 0 : wallet?.red_pills_balance ?? 0
  );
  const refundAmt = Math.max(0, Number(amount || 0));
  const newBalance = Number((current + refundAmt).toFixed(2));

  return {
    ledger,
    column,
    previousBalance: current,
    newBalance,
    updatePayload: {
      [column]: newBalance,
      updated_at: new Date().toISOString(),
    },
  };
}

/**
 * Resolves exact Creator / Platform revenue split ratio on Net Base EUR:
 * - Custom negotiated rate (`custom_creator_rate`) overrides defaults
 * - Approved Founding Creators within first 12 months receive 90% / 10%
 * - Standard Creators receive 80% / 20%
 */
export function resolveCreatorSplitRatio(
  creatorProfile: CreatorSplitProfile | null | undefined,
  nowMs: number = Date.now()
): { creatorSplitRatio: number; platformSplitRatio: number } {
  let creatorSplitRatio = 0.80;

  if (
    creatorProfile?.custom_creator_rate !== undefined &&
    creatorProfile?.custom_creator_rate !== null &&
    Number.isFinite(Number(creatorProfile.custom_creator_rate))
  ) {
    const custom = Number(creatorProfile.custom_creator_rate);
    if (custom > 0 && custom <= 1) {
      creatorSplitRatio = custom;
    }
  } else if (creatorProfile?.is_approved_founder_creator && creatorProfile?.promo_90_approved_at) {
    const approvedMs = new Date(creatorProfile.promo_90_approved_at).getTime();
    const oneYearMs = 365 * 24 * 60 * 60 * 1000;
    if (Number.isFinite(approvedMs) && nowMs - approvedMs <= oneYearMs) {
      creatorSplitRatio = 0.90;
    }
  }

  return {
    creatorSplitRatio: Number(creatorSplitRatio.toFixed(4)),
    platformSplitRatio: Number((1.0 - creatorSplitRatio).toFixed(4)),
  };
}
