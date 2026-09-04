import { describe, it, expect } from 'vitest';

/**
 * ADVERSARIAL CHALLENGER SUITE: R1 Deep Concurrency & Race Condition Verification
 * 
 * Verifies:
 * 1. 50, 100, and 200 concurrent requests against a shared credit balance with row-level locking (FOR UPDATE)
 * 2. 0 double-spend occurrences and exact mathematical balance invariants
 * 3. Strict monotonic sequence of remaining balances across serialized executions
 * 4. Variable amount deductions under concurrent race conditions
 * 5. Boundary & poison parameters (amount <= 0, initial balance = 0)
 * 6. Lost-update contrast: empirical measurement of double-spending without row locks
 */

interface ProfileRecord {
  id: string;
  credits: number;
}

/**
 * True serialized transaction simulator representing PostgreSQL row-level lock (SELECT ... FOR UPDATE).
 * Uses promise-chain mutex queue modeling PostgreSQL ExclusiveLock serialization.
 */
class PostgresRowLockSimulator {
  private profile: ProfileRecord;
  private mutex: Promise<void> = Promise.resolve();

  constructor(initialCredits: number = 10) {
    this.profile = {
      id: 'a0000000-0000-0000-0000-000000000001',
      credits: initialCredits,
    };
  }

  /**
   * Models:
   * CREATE OR REPLACE FUNCTION public.consume_wingman_credit(p_user_id UUID, p_amount INT DEFAULT 1)
   * ...
   * IF p_amount <= 0 THEN RETURN error ...
   * SELECT ... FOR UPDATE;
   * IF v_current_credits < p_amount THEN RETURN error ...
   * UPDATE ...
   */
  async consumeWingmanCredit(amount: number = 1): Promise<{
    success: boolean;
    balance: number;
    latencyMs: number;
    error?: string;
  }> {
    const start = performance.now();

    // Input boundary check identical to SQL procedure: IF p_amount <= 0
    if (amount <= 0) {
      return {
        success: false,
        balance: this.profile.credits,
        latencyMs: performance.now() - start,
        error: 'Invalid credit deduction amount',
      };
    }

    // Acquire PostgreSQL FOR UPDATE tuple lock via mutex queue
    return new Promise((resolve) => {
      this.mutex = this.mutex.then(async () => {
        try {
          // Simulate network + DB MVCC disk I/O latency under concurrent contention
          const ioDelay = Math.random() * 4 + 1; // 1-5ms
          await new Promise((r) => setTimeout(r, ioDelay));

          if (this.profile.credits < amount) {
            resolve({
              success: false,
              balance: this.profile.credits,
              latencyMs: performance.now() - start,
              error: 'Insufficient wingman credits',
            });
            return;
          }

          this.profile.credits -= amount;
          resolve({
            success: true,
            balance: this.profile.credits,
            latencyMs: performance.now() - start,
          });
        } catch (err: any) {
          resolve({
            success: false,
            balance: this.profile.credits,
            latencyMs: performance.now() - start,
            error: err?.message || 'Database error',
          });
        }
      });
    });
  }

  getBalance(): number {
    return this.profile.credits;
  }
}

describe('Adversarial Challenge: R1 Concurrency & Race Conditions', () => {
  describe('Pillar 1: 50 Concurrent Requests Stress Test (Row-Level Locking)', () => {
    it('guarantees 0 double-spends across 50 concurrent requests against initial balance of 10', async () => {
      const INITIAL_CREDITS = 10;
      const CONCURRENCY = 50;
      const db = new PostgresRowLockSimulator(INITIAL_CREDITS);

      // Trigger 50 concurrent deduction requests simultaneously
      const start = performance.now();
      const promises = Array.from({ length: CONCURRENCY }).map((_, i) =>
        db.consumeWingmanCredit(1).then((res) => ({ reqId: i, ...res }))
      );

      const results = await Promise.all(promises);
      const totalTime = performance.now() - start;

      const successful = results.filter((r) => r.success);
      const exhausted = results.filter((r) => !r.success);

      // Invariants verification
      expect(successful.length).toBe(INITIAL_CREDITS);
      expect(exhausted.length).toBe(CONCURRENCY - INITIAL_CREDITS);
      expect(db.getBalance()).toBe(0);

      // Double spend verification
      const doubleSpends = successful.length - INITIAL_CREDITS;
      expect(doubleSpends).toBe(0);

      // Verify returned balances of successful transactions form the exact set [9, 8, 7, 6, 5, 4, 3, 2, 1, 0]
      const successfulBalances = successful.map((s) => s.balance).sort((a, b) => b - a);
      expect(successfulBalances).toEqual([9, 8, 7, 6, 5, 4, 3, 2, 1, 0]);

      // Verify all exhausted requests observed 0 balance and correct error message
      expect(exhausted.every((e) => e.balance === 0)).toBe(true);
      expect(exhausted.every((e) => e.error === 'Insufficient wingman credits')).toBe(true);

      const latencies = results.map((r) => r.latencyMs).sort((a, b) => a - b);
      const p50 = latencies[Math.floor(latencies.length * 0.5)];
      const p95 = latencies[Math.floor(latencies.length * 0.95)];
      const p99 = latencies[Math.floor(latencies.length * 0.99)];

      console.log(`[Adversarial R1] 50 Concurrent Requests Result:`);
      console.log(`  Total time: ${totalTime.toFixed(2)}ms`);
      console.log(`  Successful: ${successful.length} (Expected: 10)`);
      console.log(`  Exhausted: ${exhausted.length} (Expected: 40)`);
      console.log(`  Double-spends: ${doubleSpends}`);
      console.log(`  p50: ${p50.toFixed(2)}ms, p95: ${p95.toFixed(2)}ms, p99: ${p99.toFixed(2)}ms`);
    });
  });

  describe('Pillar 2: Scale Expansion — 100 and 200 Concurrent Requests', () => {
    it('survives 100 concurrent requests with initial balance 25: exactly 25 succeed, 75 fail, 0 double-spends', async () => {
      const INITIAL = 25;
      const CONCURRENCY = 100;
      const db = new PostgresRowLockSimulator(INITIAL);

      const tasks = Array.from({ length: CONCURRENCY }).map(() => db.consumeWingmanCredit(1));
      const results = await Promise.all(tasks);

      const successful = results.filter((r) => r.success);
      const exhausted = results.filter((r) => !r.success);

      expect(successful.length).toBe(INITIAL);
      expect(exhausted.length).toBe(CONCURRENCY - INITIAL);
      expect(db.getBalance()).toBe(0);
    });

    it('survives 200 concurrent requests with initial balance 50: exactly 50 succeed, 150 fail, 0 double-spends', async () => {
      const INITIAL = 50;
      const CONCURRENCY = 200;
      const db = new PostgresRowLockSimulator(INITIAL);

      const tasks = Array.from({ length: CONCURRENCY }).map(() => db.consumeWingmanCredit(1));
      const results = await Promise.all(tasks);

      const successful = results.filter((r) => r.success);
      const exhausted = results.filter((r) => !r.success);

      expect(successful.length).toBe(INITIAL);
      expect(exhausted.length).toBe(CONCURRENCY - INITIAL);
      expect(db.getBalance()).toBe(0);
    });
  });

  describe('Pillar 3: Variable Amount Deductions under Race Conditions', () => {
    it('maintains strict ledger balance when 50 concurrent requests deduct randomized amounts (1 to 5 credits)', async () => {
      const INITIAL = 35;
      const CONCURRENCY = 50;
      const db = new PostgresRowLockSimulator(INITIAL);

      // Seed deterministic varied amounts
      const amounts = Array.from({ length: CONCURRENCY }).map((_, i) => (i % 5) + 1); // 1, 2, 3, 4, 5

      const tasks = amounts.map((amount) =>
        db.consumeWingmanCredit(amount).then((res) => ({ amount, ...res }))
      );

      const results = await Promise.all(tasks);

      const successful = results.filter((r) => r.success);
      const exhausted = results.filter((r) => !r.success);

      const totalDeducted = successful.reduce((sum, r) => sum + r.amount, 0);
      const finalBalance = db.getBalance();

      // Invariant: initial balance == total deducted + final balance
      expect(totalDeducted + finalBalance).toBe(INITIAL);
      expect(finalBalance).toBeGreaterThanOrEqual(0);

      // Verify that every exhausted transaction requested more credits than the remaining balance
      for (const ex of exhausted) {
        expect(ex.amount).toBeGreaterThan(ex.balance);
      }

      console.log(`[Adversarial R1 Variable Amounts] Initial: ${INITIAL}, Deducted: ${totalDeducted}, Remainder: ${finalBalance}`);
    });
  });

  describe('Pillar 4: Boundary & Poison Input Invariants', () => {
    it('rejects zero or negative credit deduction amounts and preserves balance', async () => {
      const db = new PostgresRowLockSimulator(10);

      const zeroRes = await db.consumeWingmanCredit(0);
      expect(zeroRes.success).toBe(false);
      expect(zeroRes.error).toBe('Invalid credit deduction amount');
      expect(db.getBalance()).toBe(10);

      const negRes = await db.consumeWingmanCredit(-5);
      expect(negRes.success).toBe(false);
      expect(negRes.error).toBe('Invalid credit deduction amount');
      expect(db.getBalance()).toBe(10);
    });

    it('rejects all 50 concurrent requests when starting balance is 0', async () => {
      const db = new PostgresRowLockSimulator(0);

      const tasks = Array.from({ length: 50 }).map(() => db.consumeWingmanCredit(1));
      const results = await Promise.all(tasks);

      expect(results.every((r) => !r.success)).toBe(true);
      expect(results.every((r) => r.balance === 0)).toBe(true);
      expect(db.getBalance()).toBe(0);
    });
  });

  describe('Pillar 5: Lost-Update Contrast Benchmark (Without Row-Level Lock)', () => {
    it('empirically demonstrates severe double-spending (300%+ over-consumption) when FOR UPDATE is absent', async () => {
      let unprotectedCredits = 10;
      const CONCURRENCY = 50;

      // Simulate unprotected client-side read-modify-write
      const tasks = Array.from({ length: CONCURRENCY }).map(async () => {
        // 1. Read un-locked
        const current = unprotectedCredits;
        // 2. Simulated network/context switch delay
        await new Promise((r) => setTimeout(r, Math.random() * 5 + 1));
        // 3. Write back
        if (current > 0) {
          unprotectedCredits = current - 1;
          return { allowed: true, readVal: current };
        }
        return { allowed: false, readVal: current };
      });

      const results = await Promise.all(tasks);
      const passed = results.filter((r) => r.allowed).length;

      const overconsumptionPct = ((passed - 10) / 10) * 100;
      console.log(`[Adversarial R1 Contrast] Unlocked execution allowed ${passed}/50 requests on 10 initial credits (+${overconsumptionPct.toFixed(0)}% over-consumption)`);

      // Empirically confirm that unprotected read-modify-write produces catastrophic double spending
      expect(passed).toBeGreaterThan(10);
      expect(passed).toBeGreaterThanOrEqual(25); // At least 2.5x over-consumption under concurrent load
    });
  });
});
