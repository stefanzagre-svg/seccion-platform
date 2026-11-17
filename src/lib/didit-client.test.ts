import { describe, it, expect } from 'vitest';
import { isDiditVerificationCompleted } from './didit-client';

describe('isDiditVerificationCompleted', () => {
  it('recognizes @didit-protocol/sdk-web 0.6.x VerificationResult completion shapes', () => {
    expect(isDiditVerificationCompleted({ type: 'completed', session: { sessionId: 's1', status: 'Pending' } })).toBe(true);
    expect(isDiditVerificationCompleted({ type: 'completed', session: { sessionId: 's2', status: 'Approved' } })).toBe(true);
    expect(isDiditVerificationCompleted({ type: 'failed', session: { sessionId: 's3', status: 'Approved' } })).toBe(true);
  });

  it('rejects cancelled, declined, and empty payloads', () => {
    expect(isDiditVerificationCompleted({ type: 'cancelled' })).toBe(false);
    expect(isDiditVerificationCompleted({ type: 'failed', session: { sessionId: 's4', status: 'Declined' } })).toBe(false);
    expect(isDiditVerificationCompleted(null)).toBe(false);
    expect(isDiditVerificationCompleted(undefined)).toBe(false);
  });

  it('preserves compatibility with legacy result.status shapes', () => {
    expect(isDiditVerificationCompleted({ status: 'completed' })).toBe(true);
    expect(isDiditVerificationCompleted({ status: 'approved' })).toBe(true);
  });
});
