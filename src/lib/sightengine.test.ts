import { describe, it, expect } from 'vitest';
import { verifyMemberSelfie, analyzeImage } from './sightengine';

describe('Sightengine Service Module', () => {
  it('handles missing credentials or invalid image gracefully without crashing', async () => {
    const verdict = await verifyMemberSelfie('https://invalid-non-existent-image-url.com/selfie.jpg');
    expect(verdict).toBeDefined();
    expect(verdict.isAdult).toBe(false);
    expect(verdict.action).toBe('challenge');
  });

  it('analyzeImage returns null gracefully when given invalid remote url or offline network', async () => {
    const res = await analyzeImage('https://invalid-test-url.com/fake.png');
    expect(res === null || res.status === 'failure').toBe(true);
  });
});
