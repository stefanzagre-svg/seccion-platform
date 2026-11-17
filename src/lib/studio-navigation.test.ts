import { describe, expect, it } from 'vitest';
import { getStudioTabs } from './studio-navigation';

describe('Studio Navigation Labels', () => {
  it('returns plain-language localized tabs without jargon for creators', () => {
    const enTabs = getStudioTabs(false, 'en');
    expect(enTabs.map((t) => t.label)).toEqual([
      'Posts & Media',
      'Livestreams',
      'Custom Requests',
      'Co-Star Approvals',
      'Goals',
      'Analytics',
      'Settings',
      'AI Copilot',
    ]);
    expect(enTabs.some((t) => t.label.includes('Pulse') || t.label.includes('Station'))).toBe(false);
  });

  it('includes Moderation Queue only for moderators/admins and localizes across ES and FR', () => {
    const esAdminTabs = getStudioTabs(true, 'es');
    expect(esAdminTabs.some((t) => t.id === 'safety_ops' && t.label === 'Moderación')).toBe(true);

    const frCreatorTabs = getStudioTabs(false, 'fr');
    expect(frCreatorTabs.some((t) => t.id === 'safety_ops')).toBe(false);
    expect(frCreatorTabs.some((t) => t.id === 'live' && t.label === 'Directs')).toBe(true);
    expect(frCreatorTabs.some((t) => t.id === 'consent_inbox' && t.label === 'Co-Créateurs')).toBe(true);
  });
});
