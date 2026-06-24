import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const creatorId = searchParams.get('creatorId');

    if (!creatorId) {
      return NextResponse.json({ error: 'creatorId query parameter is required' }, { status: 400 });
    }

    const supabase = await createClient();

    // 1. Fetch all subscriptions for the creator
    const { data: subs, error: subsError } = await supabase
      .from('subscriptions')
      .select(`
        price_paid,
        tier,
        is_active,
        created_at,
        subscriber_id,
        subscriber_profile:profiles!subscriptions_subscriber_id_fkey(id, username, display_name, avatar_url)
      `)
      .eq('creator_id', creatorId);

    if (subsError) {
      console.error('Error fetching subscriptions for analytics:', subsError);
    }

    // 2. Fetch goals and goal contributions
    const { data: goals, error: goalsError } = await supabase
      .from('creator_goals')
      .select('id')
      .eq('creator_id', creatorId);

    if (goalsError) {
      console.error('Error fetching creator goals for analytics:', goalsError);
    }

    const goalIds = (goals || []).map(g => g.id);
    let contributions: any[] = [];

    if (goalIds.length > 0) {
      const { data: contribsData, error: contribsError } = await supabase
        .from('goal_contributions')
        .select(`
          id,
          amount,
          created_at,
          contributor_id,
          contributor_profile:profiles!goal_contributions_contributor_id_fkey(id, username, display_name, avatar_url)
        `)
        .in('goal_id', goalIds);

      if (contribsError) {
        console.error('Error fetching goal contributions for analytics:', contribsError);
      } else if (contribsData) {
        contributions = contribsData;
      }
    }

    // 3. Fetch relationships/matches for engagement depth
    const { data: rels, error: relsError } = await supabase
      .from('relationships')
      .select('current_level, gauge_score')
      .eq('user_id', creatorId)
      .eq('is_matched', true);

    if (relsError) {
      console.error('Error fetching relationships for analytics:', relsError);
    }

    // --- AGGREGATIONS ---

    // KPI Summary counts
    const activeVip = (subs || []).filter(s => s.tier === 'vip' && s.is_active === true).length;
    const activeMaster = (subs || []).filter(s => s.tier === 'master' && s.is_active === true).length;
    const totalSubscribers = activeVip + activeMaster;

    const subRevenue = (subs || []).reduce((sum, s) => sum + Number(s.price_paid || 0), 0);
    const goalRevenue = contributions.reduce((sum, c) => sum + Number(c.amount || 0), 0);
    const grossRevenue = subRevenue + goalRevenue;

    // 7-day subscriber growth chart
    const growthMap: Record<string, number> = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      growthMap[dateStr] = 0;
    }

    (subs || []).forEach(sub => {
      if (sub.created_at) {
        const dateStr = sub.created_at.split('T')[0];
        if (dateStr in growthMap) {
          growthMap[dateStr]++;
        }
      }
    });

    const growth = Object.entries(growthMap).map(([date, count]) => {
      const d = new Date(date + 'T00:00:00');
      const label = d.toLocaleDateString('en-US', { weekday: 'short' });
      return { day: label, count };
    });

    // Engagement Depth distribution percentages
    let soulAlignedCount = 0;
    let highSparkCount = 0;
    let moderateCount = 0;
    let lowCount = 0;

    (rels || []).forEach(r => {
      const score = r.gauge_score ?? 0;
      if (score >= 75) {
        soulAlignedCount++;
      } else if (score >= 45) {
        highSparkCount++;
      } else if (score >= 16) {
        moderateCount++;
      } else {
        lowCount++;
      }
    });

    const totalRels = (rels || []).length;
    const engagement = [
      { 
        label: 'Soul Aligned (Level 7-8)', 
        pct: totalRels > 0 ? Math.round((soulAlignedCount / totalRels) * 100) : 0, 
        count: soulAlignedCount, 
        color: 'bg-primary' 
      },
      { 
        label: 'High Spark (Level 5-6)', 
        pct: totalRels > 0 ? Math.round((highSparkCount / totalRels) * 100) : 0, 
        count: highSparkCount, 
        color: 'bg-accent' 
      },
      { 
        label: 'Moderate (Level 3-4)', 
        pct: totalRels > 0 ? Math.round((moderateCount / totalRels) * 100) : 0, 
        count: moderateCount, 
        color: 'bg-blue-500' 
      },
      { 
        label: 'Low (Level 1-2)', 
        pct: totalRels > 0 ? Math.round((lowCount / totalRels) * 100) : 0, 
        count: lowCount, 
        color: 'bg-zinc-500' 
      }
    ];

    // Revenue Split (80% creator escrow, 20% platform cut)
    const creatorEscrow = grossRevenue * 0.8;
    const platformCut = grossRevenue * 0.2;

    // Top Supporters aggregation
    const supportersMap: Record<string, { id: string; username: string; display_name: string; avatar_url: string; totalSpent: number }> = {};

    // Sum from subscriptions
    (subs || []).forEach(s => {
      const profile: any = s.subscriber_profile;
      if (!profile) return;
      const mId = profile.id;
      const amount = Number(s.price_paid || 0);

      if (!supportersMap[mId]) {
        supportersMap[mId] = {
          id: mId,
          username: profile.username || '',
          display_name: profile.display_name || '',
          avatar_url: profile.avatar_url || '',
          totalSpent: 0
        };
      }
      supportersMap[mId].totalSpent += amount;
    });

    // Sum from goal contributions
    contributions.forEach(c => {
      const profile: any = c.contributor_profile;
      if (!profile) return;
      const mId = profile.id;
      const amount = Number(c.amount || 0);

      if (!supportersMap[mId]) {
        supportersMap[mId] = {
          id: mId,
          username: profile.username || '',
          display_name: profile.display_name || '',
          avatar_url: profile.avatar_url || '',
          totalSpent: 0
        };
      }
      supportersMap[mId].totalSpent += amount;
    });

    const topSupporters = Object.values(supportersMap)
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 5);

    // --- A/B TELEMETRY & CAMPAIGN CONVERSION INTEGRATION ---
    const { data: posts, error: postsError } = await supabase
      .from('platform_content')
      .select('id, title, created_at')
      .eq('creator_id', creatorId);

    if (postsError) {
      console.error('Error fetching creator posts for analytics:', postsError);
    }

    const { data: impressions, error: impressionsError } = await supabase
      .from('feed_ab_impressions')
      .select('post_id, ab_group')
      .eq('creator_id', creatorId);

    if (impressionsError) {
      console.error('Error fetching impressions for analytics:', impressionsError);
    }

    const { data: clicks, error: clicksError } = await supabase
      .from('feed_ab_clicks')
      .select('post_id, ab_group')
      .eq('creator_id', creatorId);

    if (clicksError) {
      console.error('Error fetching clicks for analytics:', clicksError);
    }

    const imps = impressions || [];
    const clks = clicks || [];

    const impressionsA = imps.filter(i => i.ab_group === 'A').length;
    const impressionsB = imps.filter(i => i.ab_group === 'B').length;

    const clicksA = clks.filter(c => c.ab_group === 'A').length;
    const clicksB = clks.filter(c => c.ab_group === 'B').length;

    const ctrA = impressionsA > 0 ? (clicksA / impressionsA) * 100 : 0;
    const ctrB = impressionsB > 0 ? (clicksB / impressionsB) * 100 : 0;

    let recommendation = '';
    if (impressionsA === 0 && impressionsB === 0) {
      recommendation = 'Telemetry collection is underway. Keep sharing your feed content to gather compatibility and engagement metrics.';
    } else if (ctrB > ctrA) {
      const diff = (ctrB - ctrA).toFixed(1);
      recommendation = `Variant B (Engagement Mode) is performing better by +${diff}% CTR. Sorting by subscription and user rating increases overall click conversions. Consider promoting high-rating content.`;
    } else if (ctrA > ctrB) {
      const diff = (ctrA - ctrB).toFixed(1);
      recommendation = `Variant A (Compatibility Mode) is leading by +${diff}% CTR. Displaying highly compatible personality matches first generates cleaner user interest. Focus on highlighting shared passion tags in your posts.`;
    } else {
      recommendation = 'Both feed algorithms are performing equally. Variant A (Compatibility-based) and Variant B (Engagement-based) both yield stable click-through engagement.';
    }

    const postsList = posts || [];
    const postsMap = new Map<string, string>();
    postsList.forEach(p => postsMap.set(p.id, p.title));
    
    const mockTitles: Record<string, string> = {
      'mock-1': 'Excited for tonight! 🌙',
      'mock-2': 'Exclusive VIP Album: Midnight Pulse 🔐',
      'mock-3': 'Sneak peek at the new set! 📷',
      'mock-4': 'Inside the Master Vault 🔐',
      'mock-5': 'Morning routine starts now! ☀️',
      'live-1': 'Late Night Chat & Drinks 🎥',
      'live-2': 'VIP Q&A Session 🎥',
      'live-3': 'Workout with Me 🎥'
    };

    const uniquePostIds = new Set<string>();
    imps.forEach(i => uniquePostIds.add(i.post_id));
    clks.forEach(c => uniquePostIds.add(c.post_id));
    postsList.forEach(p => uniquePostIds.add(p.id));

    const clicksByPost = Array.from(uniquePostIds).map(postId => {
      const title = postsMap.get(postId) || mockTitles[postId] || `Post: ${postId.substring(0, 8)}`;
      const postImpsA = imps.filter(i => i.post_id === postId && i.ab_group === 'A').length;
      const postImpsB = imps.filter(i => i.post_id === postId && i.ab_group === 'B').length;
      const postClicksA = clks.filter(c => c.post_id === postId && c.ab_group === 'A').length;
      const postClicksB = clks.filter(c => c.post_id === postId && c.ab_group === 'B').length;

      return {
        postId,
        title,
        impressionsA: postImpsA,
        impressionsB: postImpsB,
        clicksA: postClicksA,
        clicksB: postClicksB,
        ctrA: postImpsA > 0 ? (postClicksA / postImpsA) * 100 : 0,
        ctrB: postImpsB > 0 ? (postClicksB / postImpsB) * 100 : 0
      };
    }).sort((a, b) => (b.clicksA + b.clicksB) - (a.clicksA + a.clicksB));

    return NextResponse.json({
      kpis: {
        activeVip,
        activeMaster,
        totalSubscribers,
        totalRevenue: subRevenue,
        goalRevenue,
        grossRevenue
      },
      growth,
      engagement,
      revenueBreakdown: {
        creatorEscrow,
        platformCut,
        creatorPercentage: 80,
        platformPercentage: 20
      },
      topSupporters,
      abTesting: {
        variantA: {
          impressions: impressionsA,
          clicks: clicksA,
          ctr: ctrA
        },
        variantB: {
          impressions: impressionsB,
          clicks: clicksB,
          ctr: ctrB
        },
        clicksByPost,
        recommendation
      }
    });

  } catch (error: any) {
    console.error('Fatal error in creator analytics API:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
