import { describe, it, expect, vi, beforeEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const { mockIn, mockSelect, mockFrom } = vi.hoisted(() => {
  const mockOrder = vi.fn();
  const mockIn = vi.fn(() => ({ order: mockOrder }));
  const mockSelect = vi.fn(() => ({ in: mockIn }));
  const mockFrom = vi.fn(() => ({ select: mockSelect }));
  return { mockIn, mockSelect, mockFrom, mockOrder };
});

vi.mock('./supabase', () => ({
  supabase: {
    from: mockFrom,
  },
}));

import { fetchProfileMediaBatch } from './relationship-db';

describe('Phase 3 UI Wiring, Batch Queries & Mock Removal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetchProfileMediaBatch short-circuits on empty input without DB roundtrip', async () => {
    const result = await fetchProfileMediaBatch([]);
    expect(result).toEqual({});
    expect(mockFrom).not.toHaveBeenCalled();
  });

  it('fetchProfileMediaBatch issues a single deduplicated IN query and groups by user_id', async () => {
    const mockRows = [
      { id: 'm1', user_id: 'u1', media_url: 'https://cdn/1.jpg', media_type: 'image', is_hidden: false, required_level: 'public' },
      { id: 'm2', user_id: 'u1', media_url: 'https://cdn/2.jpg', media_type: 'image', is_hidden: false, required_level: 'public' },
    ];
    mockIn.mockReturnValueOnce({
      order: vi.fn().mockResolvedValueOnce({ data: mockRows, error: null }),
    });

    const grouped = await fetchProfileMediaBatch(['u1', 'u1', 'u2']);

    expect(mockFrom).toHaveBeenCalledTimes(1);
    expect(mockFrom).toHaveBeenCalledWith('profile_media');
    expect(mockIn).toHaveBeenCalledWith('user_id', ['u1', 'u2']);
    expect(grouped['u1']).toHaveLength(2);
    expect(grouped['u2']).toEqual([]);
  });

  it('MatchSwiper uses batch media loading and isolated per-card gaugeLevels state', () => {
    const src = fs.readFileSync(path.resolve(__dirname, '../components/MatchSwiper.tsx'), 'utf8');
    expect(src).toContain('fetchProfileMediaBatch');
    expect(src).toContain('gaugeLevels');
    expect(src).toContain('cardGaugeLevel');
  });

  it('Member dashboard removes MOCK_CANDIDATES and mounts SuggestionMovesModal & ContributeModal', () => {
    const src = fs.readFileSync(path.resolve(__dirname, '../app/profile/member/page.tsx'), 'utf8');
    expect(src).not.toContain('MOCK_CANDIDATES');
    expect(src).toContain('<SuggestionMovesModal');
    expect(src).toContain('<ContributeModal');
  });

  it('Feed, Messages, and CreatorOrdersPanel are wired to live data with zero mock fallbacks', () => {
    const feedSrc = fs.readFileSync(path.resolve(__dirname, '../app/feed/page.tsx'), 'utf8');
    expect(feedSrc).not.toContain('MOCK_VIDEOS');
    expect(feedSrc).not.toContain('cdn.pixabay.com');
    expect(feedSrc).toContain("from('platform_content')");

    const messagesSrc = fs.readFileSync(path.resolve(__dirname, '../app/messages/page.tsx'), 'utf8');
    expect(messagesSrc).not.toContain('MOCK_CONVERSATIONS');

    const chatSrc = fs.readFileSync(path.resolve(__dirname, '../components/messaging/ChatWindow.tsx'), 'utf8');
    expect(chatSrc).not.toContain('MOCK_MESSAGES');
    expect(chatSrc).toContain('fetchMessages');
    expect(chatSrc).toContain('sendDbMessage');

    const ordersSrc = fs.readFileSync(path.resolve(__dirname, '../components/CreatorOrdersPanel.tsx'), 'utf8');
    expect(ordersSrc).not.toContain('MOCK_ORDERS');
    expect(ordersSrc).not.toContain('Jordan P.');
    expect(ordersSrc).toContain("from('matrix_escrow_orders')");
  });

  it('Advanced search API enforces DB and response result bounds', () => {
    const searchSrc = fs.readFileSync(
      path.resolve(__dirname, '../app/api/v2/search/advanced/route.ts'),
      'utf8'
    );
    expect(searchSrc).toContain('.limit(100)');
    expect(searchSrc).toContain('results.slice(0, 50)');
  });
});
