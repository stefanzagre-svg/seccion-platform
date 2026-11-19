import { describe, it, expect } from 'vitest';
import {
  classifyDiditWebhookWorkflow,
  computeAgeProofHash,
  isStrictUsAgeState,
  resolveDiditWorkflowId,
  resolveGeoAgeContext,
} from './age-assurance';

describe('Age Assurance Policy, Geo-Routing & Dual-Workflow Guards (Phase 1)', () => {
  describe('US State-Level Geo-Routing (cf-ipcountry + cf-region-code)', () => {
    it('routes strict US mandate states (TX, FL, VA, UT) to us_transactional', () => {
      for (const state of ['TX', 'FL', 'VA', 'UT', 'LA', 'NC']) {
        expect(isStrictUsAgeState('US', state)).toBe(true);
        const ctx = resolveGeoAgeContext({ countryCode: 'US', regionCode: state });
        expect(ctx.countryCode).toBe('US');
        expect(ctx.regionCode).toBe(state);
        expect(ctx.isStrictUsState).toBe(true);
        expect(ctx.recommendedMethod).toBe('us_transactional');
      }
    });

    it('routes non-strict US states (CA, NY, WA, IL) to lower-cost didit_age', () => {
      for (const state of ['CA', 'NY', 'WA', 'IL']) {
        expect(isStrictUsAgeState('US', state)).toBe(false);
        const ctx = resolveGeoAgeContext({ countryCode: 'US', regionCode: state });
        expect(ctx.isStrictUsState).toBe(false);
        expect(ctx.recommendedMethod).toBe('didit_age');
      }
    });

    it('fails safe to us_transactional when country is US and region header is absent', () => {
      const ctx = resolveGeoAgeContext({ countryCode: 'US', regionCode: null });
      expect(ctx.isStrictUsState).toBe(true);
      expect(ctx.recommendedMethod).toBe('us_transactional');
    });

    it('routes EU, UK, LATAM, Morocco, and Global traffic strictly to didit_age (never AgeChecker)', () => {
      for (const country of ['ES', 'FR', 'GB', 'UK', 'DE', 'MA', 'CO', 'BR', 'GLOBAL']) {
        const ctx = resolveGeoAgeContext({ countryCode: country, regionCode: 'TX' });
        expect(ctx.isStrictUsState).toBe(false);
        expect(ctx.recommendedMethod).toBe('didit_age');
      }
    });
  });

  describe('Dual DIDIT Workflow Resolution & Webhook Security Binding', () => {
    const dualEnv = {
      creatorWorkflowId: 'wf-creator-2257-aml',
      memberAgeWorkflowId: 'wf-member-age-010',
    };

    it('selects dedicated member_age workflow when configured and creator workflow for creator_kyc', () => {
      const member = resolveDiditWorkflowId('member_age', dualEnv);
      expect(member.workflowId).toBe('wf-member-age-010');
      expect(member.isDedicatedMemberWorkflow).toBe(true);

      const creator = resolveDiditWorkflowId('creator_kyc', dualEnv);
      expect(creator.workflowId).toBe('wf-creator-2257-aml');
      expect(creator.isDedicatedMemberWorkflow).toBe(false);
    });

    it('falls back safely to legacy/creator workflow when DIDIT_MEMBER_AGE_WORKFLOW_ID is unset', () => {
      const fallback = resolveDiditWorkflowId('member_age', {
        legacyWorkflowId: 'wf-legacy-shared',
      });
      expect(fallback.workflowId).toBe('wf-legacy-shared');
      expect(fallback.isDedicatedMemberWorkflow).toBe(false);
    });

    it('SECURITY: never grants Creator KYC (is_kyc_verified) from member_age workflow even if metadata is forged', () => {
      const result = classifyDiditWebhookWorkflow(
        {
          payloadWorkflowId: 'wf-member-age-010',
          metadataMode: 'creator_kyc', // forged metadata attempt
        },
        dualEnv
      );
      expect(result.mode).toBe('member_age');
      expect(result.grantsCreatorKyc).toBe(false);
      expect(result.grantsMemberAge).toBe(true);
      expect(result.assuranceMethod).toBe('didit_age');
    });

    it('SECURITY: fails closed on unknown workflow_id (never grants Creator KYC)', () => {
      const result = classifyDiditWebhookWorkflow(
        {
          payloadWorkflowId: 'wf-unknown-other',
          metadataMode: 'creator_kyc',
        },
        dualEnv
      );
      expect(result.grantsCreatorKyc).toBe(false);
      expect(result.grantsMemberAge).toBe(true);
    });

    it('grants both Creator KYC and Member Age strictly when Creator workflow_id matches', () => {
      const result = classifyDiditWebhookWorkflow(
        {
          payloadWorkflowId: 'wf-creator-2257-aml',
          metadataMode: 'creator_kyc',
        },
        dualEnv
      );
      expect(result.mode).toBe('creator_kyc');
      expect(result.grantsCreatorKyc).toBe(true);
      expect(result.grantsMemberAge).toBe(true);
      expect(result.assuranceMethod).toBe('didit_kyc');
    });
  });

  describe('Zero-PII Proof Hash Generation', () => {
    it('produces deterministic 64-char SHA-256 hex digest without exposing raw token', async () => {
      const h1 = await computeAgeProofHash('agechecker', 'uuid-secret-token-123');
      const h2 = await computeAgeProofHash('agechecker', 'uuid-secret-token-123');
      const h3 = await computeAgeProofHash('didit', 'uuid-secret-token-123');

      expect(h1).toMatch(/^[0-9a-f]{64}$/);
      expect(h1).toBe(h2);
      expect(h1).not.toBe(h3);
      expect(h1).not.toContain('uuid-secret-token-123');
    });
  });
});
