'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Video, LayoutGrid, Users, Heart, Crown, Lock, Search, Play, Clock, SlidersHorizontal, MapPin, Zap, ShieldAlert, Sparkles, Bell } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { calculateMatch, UserProfile } from '@/lib/match-engine';
import { fetchMatches } from '@/lib/relationship-db';
import SafetyWarning from '@/components/SafetyWarning';
import AISuggestionPanel from '@/components/AISuggestionPanel';
import { calculateCreatorRating } from '@/lib/rating-engine';
import BlurredFaceImage from '@/components/BlurredFaceImage';

// Default User Profile for Fallbacks
const DEFAULT_USER_PROFILE: UserProfile = {
  gender: 'Male',
  location: 'Paris, France',
  hobbies: ['Fitness', 'Tech', 'Music'],
  lifestyle: {},
  relationshipGoal: 'Long-term',
  relationshipType: 'Monogamous',
  sexualPreferences: ['Female'],
  familyGoals: 'Open to children'
};

// Mock Fallback Data (if DB is empty)
const MOCK_LIVE_STREAMS = [
  { id: 'live-1', creator: 'Valentina', viewers: '1.2k', image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80', title: 'Late Night Chat & Drinks', isVIP: false, profile: { hobbies: ['Music', 'Art'], lifestyle: { partying: 'Often', traveling: 'Often', socializing: 'Often', drinking: 'Often', 'morning/night': 'Night Owl' }, relationshipGoal: 'Short-term', relationshipType: 'Open Relationship', sexualPreferences: ['Heterosexual'], familyGoals: 'Open to children' } },
  { id: 'live-2', creator: 'Elena', viewers: '850', image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&q=80', title: 'VIP Q&A Session', isVIP: true, profile: { hobbies: ['Tech', 'Music'], lifestyle: { workout: 'Every Day', traveling: 'Often', socializing: 'Often', smoking: 'Never', 'pet lover': 'Often' }, relationshipGoal: 'Long-term', relationshipType: 'Monogamous', sexualPreferences: ['Heterosexual'], familyGoals: 'Want children' } },
  { id: 'live-3', creator: 'Sofia', viewers: '2.1k', image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&q=80', title: 'Workout with Me', isVIP: false, profile: { hobbies: ['Fitness', 'Yoga'], lifestyle: { workout: 'Every Day', 'healthy eating': 'Every Day', socializing: 'Sometimes', sleep: 'Every Day', 'pet lover': 'Often' }, relationshipGoal: 'Long-term', relationshipType: 'Monogamous', sexualPreferences: ['Heterosexual'], familyGoals: 'Want children' } },
];

const MOCK_RECENT_CONTENT = [
  { id: 'mock-1', creator: 'Valentina', type: 'public', content: 'Excited for tonight! 🌙', image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&q=80', timestamp: '2h ago', locked: false, relationship: 'matched', profile: { hobbies: ['Music', 'Art'], lifestyle: { partying: 'Often', traveling: 'Every Day', socializing: 'Often' }, relationshipGoal: 'Short-term', relationshipType: 'Open Relationship', sexualPreferences: ['Heterosexual'], familyGoals: 'Open to children' } },
  { id: 'mock-2', creator: 'Elena', type: 'vip', content: 'Exclusive VIP Album: Midnight Pulse', image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&q=80', timestamp: '5h ago', locked: true, relationship: 'subscribed', profile: { hobbies: ['Tech', 'Music'], lifestyle: { workout: 'Every Day', traveling: 'Often', socializing: 'Often' }, relationshipGoal: 'Long-term', relationshipType: 'Monogamous', sexualPreferences: ['Heterosexual'], familyGoals: 'Want children' } },
  { id: 'mock-3', creator: 'Elena', type: 'public', content: 'Sneak peek at the new set! 📷', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&q=80', timestamp: '1h ago', locked: false, relationship: 'subscribed', profile: { hobbies: ['Tech', 'Music'], lifestyle: { workout: 'Every Day', traveling: 'Often', socializing: 'Often' }, relationshipGoal: 'Long-term', relationshipType: 'Monogamous', sexualPreferences: ['Heterosexual'], familyGoals: 'Want children' } },
  { id: 'mock-4', creator: 'Marcus_X', type: 'master', content: 'Inside the Master Vault', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&q=80', timestamp: '1d ago', locked: true, relationship: 'none', profile: { hobbies: ['Fitness', 'Cars'], lifestyle: { workout: 'Every Day', socializing: 'Sometimes' }, relationshipGoal: 'Casual', relationshipType: 'Monogamous', sexualPreferences: ['Heterosexual'], familyGoals: "Don't want children" } },
  { id: 'mock-5', creator: 'Sofia', type: 'public', content: 'Morning routine starts now! ☀️', image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&q=80', timestamp: '3h ago', locked: false, relationship: 'none', profile: { hobbies: ['Fitness', 'Yoga'], lifestyle: { workout: 'Every Day', 'healthy eating': 'Every Day', socializing: 'Sometimes' }, relationshipGoal: 'Long-term', relationshipType: 'Monogamous', sexualPreferences: ['Heterosexual'], familyGoals: 'Want children' } },
];

const MOCK_MATCHED_USERS = [
  { id: 'match-1', username: 'Valentina', avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80', current_level: 'Friendly', gauge_score: 25, target_profile: { id: 'val-001', username: 'Valentina', display_name: 'Valentina V.', avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80' } },
  { id: 'match-2', username: 'Elena', avatar_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&q=80', current_level: 'Close Friend', gauge_score: 38, target_profile: { id: 'ele-002', username: 'Elena', display_name: 'Elena R.', avatar_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&q=80' } }
];

export default function PlatformFeed() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [currentUserProfile, setCurrentUserProfile] = useState<UserProfile>(DEFAULT_USER_PROFILE);
  const [activeFilter, setActiveFilter] = useState<'all' | 'live' | 'subscribed' | 'matched'>('all');
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [userTier, setUserTier] = useState<'free' | 'vip' | 'master'>('free');
  
  // Database States
  const [matches, setMatches] = useState<any[]>([]);
  const [feedContent, setFeedContent] = useState<any[]>([]);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [ratingsMap, setRatingsMap] = useState<Record<string, number[]>>({});
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [abGroup, setAbGroup] = useState<'A' | 'B'>('A');
  const [searchQuery, setSearchQuery] = useState('');

  // Sync search query from URL on mount and handle custom search-changed events
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const query = params.get('search') || '';
      setSearchQuery(query);
    }

    const handleSearch = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      setSearchQuery(customEvent.detail || '');
    };

    window.addEventListener('search-changed', handleSearch);
    return () => {
      window.removeEventListener('search-changed', handleSearch);
    };
  }, []);

  const loadUnreadCount = async (userId: string) => {
    try {
      const { count } = await supabase
        .from('suggestion_caches')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_read', false);
      setUnreadCount(count || 0);
    } catch (err) {
      console.error('Error loading unread suggestions count:', err);
    }
  };

  useEffect(() => {
    if (!currentUser) return;
    loadUnreadCount(currentUser.id);

    const channel = supabase
      .channel('suggestion_caches_unread')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'suggestion_caches',
          filter: `user_id=eq.${currentUser.id}`
        },
        () => {
          loadUnreadCount(currentUser.id);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUser]);


  // Check auth session
  useEffect(() => {
    const loadSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setCurrentUser(session.user);
        
        // Determine A/B test group assignment deterministically on mount
        const assignedGroup = (session.user.id.charCodeAt(0) % 2 === 0 ? 'A' : 'B');
        setAbGroup(assignedGroup);
        
        // Load profile details
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        if (profile) {
          setCurrentUserProfile({
            gender: profile.sexual_preference === 'Lesbian' || profile.sexual_preference === 'Gay' ? 'female' : 'male',
            location: profile.origins || 'Paris, France',
            hobbies: profile.hobbies || [],
            lifestyle: profile.lifestyle_habits || {},
            relationshipGoal: profile.relationship_goals?.[0] || 'Long-term',
            relationshipType: profile.relationship_types?.[0] || 'Monogamous',
            sexualPreferences: [profile.sexual_preference].filter(Boolean),
            familyGoals: profile.lifestyle_habits?.family_goals || 'Open to children'
          });
          
          if (profile.ab_group) {
            setAbGroup(profile.ab_group as 'A' | 'B');
          }
        }
      } else {
        setLoading(false);
      }
    };
    loadSession();
  }, []);

  // Telemetry logger for A/B testing click-through rates
  const logFeedClick = async (postId: string, creatorId: string) => {
    if (!currentUser) return;
    try {
      await supabase.from('feed_ab_clicks').insert({
        user_id: currentUser.id,
        ab_group: abGroup,
        post_id: postId,
        creator_id: creatorId
      });
    } catch (err) {
      console.error('Failed to log feed click telemetry:', err);
    }
  };

  // Keep track of already logged impressions during the session to avoid spamming
  const loggedImpressionsRef = useRef<Set<string>>(new Set());

  // Telemetry logger for A/B testing impressions
  const logFeedImpressions = async (posts: any[]) => {
    if (!currentUser || posts.length === 0) return;
    try {
      const rows = posts.map(post => ({
        user_id: currentUser.id,
        ab_group: abGroup,
        post_id: post.id,
        creator_id: post.creator_id || post.creator || null
      }));
      await supabase.from('feed_ab_impressions').insert(rows);
    } catch (err) {
      console.error('Failed to log feed impressions telemetry:', err);
    }
  };

  // Fetch feed content, matches, and subscriptions
  useEffect(() => {
    if (!currentUser) return;

    const loadData = async () => {
      setLoading(true);
      try {
        // 1. Fetch Matches
        const myMatches = await fetchMatches(currentUser.id);
        setMatches(myMatches.length > 0 ? myMatches : MOCK_MATCHED_USERS);

        // 2. Fetch Active Subscriptions
        const { data: subs } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('subscriber_id', currentUser.id)
          .eq('is_active', true);
        
        setSubscriptions(subs || []);
        
        if (subs && subs.length > 0) {
          const hasMaster = subs.some(s => s.tier === 'master');
          setUserTier(hasMaster ? 'master' : 'vip');
        } else {
          // Defaulting to VIP/Master for preview if matches exist to allow browsing
          setUserTier('vip');
        }

        // 3. Fetch Content Uploads (only approved ones)
        const { data: content, error: contentError } = await supabase
          .from('platform_content')
          .select(`
            *,
            creator_profile:profiles!platform_content_creator_id_fkey(*)
          `)
          .order('created_at', { ascending: false });


        if (contentError) throw contentError;
        setFeedContent(content && content.length > 0 ? content : []);

        // 4. Fetch Ratings for Dynamic Weight Calculation
        const { data: ratingData, error: ratingError } = await supabase
          .from('ratings')
          .select('ratee_id, calculated_score')
          .order('created_at', { ascending: false });

        if (!ratingError && ratingData) {
          const map: Record<string, number[]> = {};
          ratingData.forEach(r => {
            if (!map[r.ratee_id]) {
              map[r.ratee_id] = [];
            }
            map[r.ratee_id].push(Number(r.calculated_score));
          });
          setRatingsMap(map);
        }

      } catch (err) {
        console.error('Error loading dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [currentUser]);

  // Enrich and filter feed content items
  const dbEnrichedFeed = feedContent.map(item => {
    const creatorProf = item.creator_profile;
    const matchResult = creatorProf ? calculateMatch(currentUserProfile, {
      gender: creatorProf.sexual_preference === 'Lesbian' || creatorProf.sexual_preference === 'Gay' ? 'female' : 'male',
      location: creatorProf.origins || '',
      hobbies: creatorProf.hobbies || [],
      lifestyle: creatorProf.lifestyle_habits || {},
      relationshipGoal: creatorProf.relationship_goals?.[0] || 'Long-term',
      relationshipType: creatorProf.relationship_types?.[0] || 'Monogamous',
      sexualPreferences: [creatorProf.sexual_preference].filter(Boolean),
      familyGoals: creatorProf.lifestyle_habits?.family_goals || 'Open to children'
    }) : null;

    const matchProb = matchResult ? matchResult.totalScore : 0;

    const activeSub = subscriptions.find(s => s.creator_id === item.creator_id);
    const isSelf = item.creator_id === currentUser?.id;
    
    let isLocked = false;
    if (!isSelf && item.tier !== 'none') {
      if (!activeSub) {
        isLocked = true;
      }
    }

    const isMatched = matches.some(m => m.target_profile.id === item.creator_id);

    return {
      id: item.id,
      creator: creatorProf?.username || 'creator',
      creator_id: item.creator_id,
      avatar_url: creatorProf?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80',
      type: item.tier === 'none' ? 'public' : item.tier,
      content: item.description || item.title,
      image: item.media_url,
      timestamp: new Date(item.created_at).toLocaleDateString(),
      matchScore: matchProb,
      matchResult,
      locked: isLocked,
      isMatched,
      relationship: activeSub ? 'subscribed' : isMatched ? 'matched' : 'none',
      ratingScore: calculateCreatorRating(creatorProf, ratingsMap[item.creator_id] || []),
      face_blur_active: creatorProf?.face_blur_active || false,
      avatar_face_coordinates: creatorProf?.avatar_face_coordinates || null
    };
  });

  // Merge database content and mock content fallback if DB feed is empty
  const enrichedFeed = dbEnrichedFeed.length > 0 
    ? dbEnrichedFeed 
    : MOCK_RECENT_CONTENT.map(item => {
        const matchResult = calculateMatch(currentUserProfile, item.profile as unknown as UserProfile);
        const isFaceBlurCreator = ['Valentina', 'Elena', 'Sofia'].includes(item.creator);
        return {
          ...item,
          avatar_url: item.image,
          creator_id: item.id,
          isMatched: item.relationship === 'matched',
          matchScore: matchResult.totalScore,
          matchResult,
          ratingScore: calculateCreatorRating(item.profile, ratingsMap[item.id] || []),
          face_blur_active: isFaceBlurCreator,
          avatar_face_coordinates: isFaceBlurCreator ? { x: 0.5, y: 0.35, r: 0.18 } : null
        };
      });

  const filteredFeed = enrichedFeed.filter(item => {
    if (activeFilter === 'subscribed') return item.relationship === 'subscribed';
    if (activeFilter === 'matched') return item.isMatched || item.matchScore >= 80;
    if (activeFilter === 'live') return item.type === 'live';
    return true;
  }).filter(item => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const creatorMatch = item.creator?.toLowerCase().includes(q);
    const contentMatch = item.content?.toLowerCase().includes(q);
    return creatorMatch || contentMatch;
  }).sort((a, b) => {
    if (abGroup === 'B') {
      // Group B (Engagement-Prioritized Sorting)
      if (a.relationship === 'subscribed' && b.relationship !== 'subscribed') return -1;
      if (b.relationship === 'subscribed' && a.relationship !== 'subscribed') return 1;
      
      const ratingDiff = b.ratingScore - a.ratingScore;
      if (Math.abs(ratingDiff) > 0.01) {
        return ratingDiff;
      }
      return b.matchScore - a.matchScore;
    } else {
      // Group A (Compatibility-Prioritized Sorting)
      if (a.relationship === 'subscribed' && b.relationship !== 'subscribed') return -1;
      if (b.relationship === 'subscribed' && a.relationship !== 'subscribed') return 1;
      if (a.isMatched && !b.isMatched) return -1;
      if (b.isMatched && !a.isMatched) return 1;
      return b.matchScore - a.matchScore;
    }
  });

  // Wire impressions logging to trigger when feed loads or filter changes
  useEffect(() => {
    if (!currentUser || filteredFeed.length === 0) return;
    const newPostsToLog = filteredFeed.filter(p => !loggedImpressionsRef.current.has(p.id));
    if (newPostsToLog.length > 0) {
      newPostsToLog.forEach(p => loggedImpressionsRef.current.add(p.id));
      logFeedImpressions(newPostsToLog);
    }
  }, [filteredFeed, currentUser, abGroup]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-black text-white">
        <Sparkles className="w-8 h-8 animate-spin text-primary mr-2" />
        <span className="font-semibold">Syncing intelligence feed...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent text-white pt-16 relative overflow-hidden">
      {/* Background neon accent mesh orbs */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary/10 blur-[150px] rounded-full pointer-events-none animate-pulse-cyan" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-accent/10 blur-[150px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 md:px-12 pt-12 pb-8 space-y-12 relative z-10">
        
        {/* Top Grid Row: Active Streams & Matches Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Active Live Streams section (2/3 width) */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Feed Filters & Mode Badge Row */}
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-xl relative z-30">
              <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
                {['all', 'live', 'subscribed', 'matched'].map((f) => (
                  <button 
                    key={f}
                    onClick={() => setActiveFilter(f as any)}
                    className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${activeFilter === f ? 'bg-primary text-black font-black shadow-[0_0_20px_rgba(102,252,241,0.4)] scale-105 border border-primary/20' : 'bg-white/5 text-white/40 border border-white/10 hover:bg-white/10 hover:text-white'}`}
                  >
                    {f}
                  </button>
                ))}
              </div>

              {/* A/B Test Group Visual Pill Badge */}
              <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border shrink-0 flex items-center gap-1.5 transition-all duration-300 ${
                abGroup === 'B' 
                  ? 'bg-purple-500/10 text-purple-400 border-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.15)]' 
                  : 'bg-pink-500/10 text-pink-400 border-pink-500/20 shadow-[0_0_15px_rgba(236,72,153,0.15)]'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${abGroup === 'B' ? 'bg-purple-400 animate-pulse' : 'bg-pink-400 animate-pulse'}`} />
                {abGroup === 'B' ? 'B: Engagement Mode' : 'A: Compatibility Mode'}
              </div>
            </div>

            <section className="relative">
              <div className="absolute -top-12 -left-12 w-64 h-64 bg-primary/10 blur-[100px] rounded-full pointer-events-none" />
              <div className="flex items-center justify-between mb-6 relative z-10">
                <h2 className="text-2xl font-black flex items-center gap-2 tracking-tighter">
                  <span className="w-2 h-8 bg-red-500 rounded-full animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.5)]" />
                  ACTIVE STREAMS
                </h2>
              </div>
              <div className="flex gap-6 overflow-x-auto pb-6 scrollbar-hide relative z-10 px-2">
                {MOCK_LIVE_STREAMS.map((stream) => (
                  <motion.div 
                    key={stream.id}
                    onClick={() => logFeedClick(stream.id, stream.creator)}
                    className="flex-shrink-0 w-72 bg-white/[0.02] border border-white/5 p-2 rounded-[2.5rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)] backdrop-blur-xl cursor-pointer transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:scale-[1.03] hover:border-primary/20 hover:shadow-[0_0_35px_rgba(102,252,241,0.2)] group"
                  >
                    <div className="relative rounded-[2rem] overflow-hidden aspect-[3/4] border border-white/5 bg-black/40">
                      <img src={stream.image} alt={stream.creator} className="w-full h-full object-cover group-hover:scale-105 transition duration-[1.2s] ease-[cubic-bezier(0.32,0.72,0,1)]" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent z-20" />
                      
                      <div className="absolute top-4 left-4 flex gap-2 z-30">
                        <div className="px-3.5 py-1.5 bg-red-600 backdrop-blur-md rounded-full text-[9px] font-black flex items-center gap-2 border border-white/20 shadow-lg shadow-red-600/30">
                          <div className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
                          <span>LIVE {stream.viewers}</span>
                        </div>
                      </div>
                      
                      <div className="absolute bottom-4 left-4 right-4 z-30">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm font-black text-white tracking-tight">@{stream.creator}</p>
                          <span className="text-[9px] font-black text-yellow-500 bg-black/70 backdrop-blur-md px-2 py-0.5 rounded-lg border border-yellow-500/20 shrink-0">
                            ⭐ {calculateCreatorRating(stream.profile, ratingsMap[stream.id] || []).toFixed(2)}
                          </span>
                        </div>
                        <p className="text-[10px] text-white/80 font-medium line-clamp-1">{stream.title}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar Column (1/3 width) */}
          <div className="lg:col-span-4 space-y-8">
            
            {/* Matched Users Sidebar */}
            <div className="glass-card p-6">
              <h3 className="text-sm font-bold uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" /> My Matches
              </h3>
              <div className="space-y-4">
                {matches.length > 0 ? (
                  matches.map((m) => (
                    <div key={m.id} className="flex items-center justify-between p-3 bg-white/2 rounded-2xl border border-white/5 hover:border-primary/30 transition group">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden border border-white/10">
                          <img 
                            src={m.target_profile.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80'} 
                            alt={m.target_profile.display_name} 
                            className="w-full h-full object-cover" 
                          />
                        </div>
                        <div>
                          <p className="font-bold text-xs">@{m.target_profile.display_name || m.target_profile.username}</p>
                          <p className="text-[8px] text-primary/60 font-black tracking-widest uppercase mt-0.5">
                            {m.current_level} • {m.gauge_score} PTS
                          </p>
                        </div>
                      </div>
                      <button 
                        onClick={() => window.location.href = '/messages'}
                        className="p-2 bg-white/5 rounded-xl text-muted-foreground group-hover:text-primary transition"
                      >
                        <Play className="w-4 h-4 fill-current" />
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-white/40 text-xs">
                    No active matches.
                  </div>
                )}
              </div>
            </div>

            <div className="glass-card p-6 bg-primary/5 border-primary/20">
              <h3 className="text-sm font-bold mb-4 flex items-center gap-2 text-primary">
                <ShieldAlert className="w-4 h-4" /> Content Policy
              </h3>
              <p className="text-xs text-white/60 leading-relaxed">
                Explicit adult content is strictly restricted on public channels (Avatar, Profile Photos, Public Posts). Please ensure all public media complies with our safety guidelines.
              </p>
            </div>

            <SafetyWarning />
          </div>

        </div>

        {/* AI Prediction Panel (Full Width) */}
        <div id="ai-suggestion-panel" className="w-full pt-4">
          <AISuggestionPanel
            currentUserProfile={currentUserProfile}
            currentUserId={currentUser?.id}
            isVisible={activeFilter === 'all'}
          />
        </div>
 
        {/* YOUR FEED (Full Width 3-Column Grid) */}
        <section className="w-full pt-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-black flex items-center gap-2">
              <LayoutGrid className="text-accent w-6 h-6" /> YOUR FEED
            </h2>
            <div className="flex items-center gap-3 text-[9px] text-white/40 font-black uppercase tracking-[0.2em] bg-white/5 px-4 py-2 rounded-xl border border-white/10">
              <ShieldAlert className="w-4 h-4 text-primary" /> 
              <span>Public Safety Protocol Active</span>
            </div>
          </div>
 
          {filteredFeed.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {filteredFeed.map((post) => (
                <motion.div 
                  key={post.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  onClick={() => logFeedClick(post.id, post.creator_id)}
                  className="bg-white/[0.02] border border-white/5 p-2 rounded-[2.5rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)] backdrop-blur-xl hover:scale-[1.01] hover:border-primary/25 hover:shadow-[0_0_30px_rgba(102,252,241,0.15)] transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] cursor-pointer group"
                >
                  <div className="bg-black/40 border border-white/5 rounded-[2rem] p-5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] h-full flex flex-col justify-between overflow-hidden">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/10 overflow-hidden shadow-inner relative">
                          <BlurredFaceImage
                            src={post.avatar_url}
                            alt="Avatar"
                            sharedScore={post.matchScore}
                            isEnabledByOwner={post.face_blur_active}
                            faceCoordinates={post.avatar_face_coordinates}
                            className="w-full h-full"
                          />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-black text-sm tracking-tight">@{post.creator}</p>
                            <span className="text-[9px] font-bold text-yellow-500 bg-yellow-500/10 px-1.5 py-0.5 rounded border border-yellow-500/20 shrink-0">
                              ⭐ {post.ratingScore?.toFixed(2) || '10.00'}
                            </span>
                          </div>
                          <p className="text-[10px] text-muted-foreground opacity-60 flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5" /> {post.timestamp}
                          </p>
                        </div>
                      </div>
                      
                      <div className="relative group/tooltip">
                        <div className="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter flex items-center gap-1.5 bg-primary/20 text-primary hover:bg-primary/30 transition cursor-help">
                          <Zap className="w-2.5 h-2.5 fill-current" />
                          {post.matchScore}% Match
                        </div>
                        
                        {/* Tooltip breakdown */}
                        {post.matchResult?.explanation && (
                          <div className="absolute top-full right-0 mt-2 w-72 p-4 bg-black/90 backdrop-blur-2xl border border-white/15 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] opacity-0 pointer-events-none group-hover/tooltip:opacity-100 transition-opacity duration-300 z-50 text-left font-sans font-medium">
                            <div className="flex justify-between items-center border-b border-white/5 pb-2 mb-2">
                              <span className="text-[10px] font-black uppercase tracking-wider text-white">Fusion Compatibility Analysis</span>
                              <span className="text-[10px] font-black text-primary">{post.matchScore}%</span>
                            </div>
                            
                            <div className="space-y-2.5">
                              {post.matchResult.explanation.map((exp: any, idx: number) => (
                                <div key={idx} className="space-y-1">
                                  <div className="flex justify-between items-center text-[8px] font-black uppercase tracking-wider">
                                    <span className="text-white/85">{exp.factor}</span>
                                    <span className={exp.impact === 'positive' ? 'text-primary' : exp.impact === 'negative' ? 'text-destructive' : 'text-white/45'}>
                                      {exp.score}%
                                    </span>
                                  </div>
                                  {/* compatibility progress bar */}
                                  <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                    <div 
                                      className={`h-full rounded-full ${exp.impact === 'positive' ? 'bg-primary shadow-[0_0_5px_rgba(102,252,241,0.5)]' : exp.impact === 'negative' ? 'bg-destructive' : 'bg-white/20'}`}
                                      style={{ width: `${exp.score}%` }}
                                    />
                                  </div>
                                  <p className="text-[8px] text-white/50 leading-relaxed font-semibold">
                                    {exp.description}
                                  </p>
                                </div>
                              ))}
                            </div>
                            
                            <div className="border-t border-white/5 pt-2 mt-2 text-[7px] text-white/30 uppercase tracking-widest font-black text-center">
                              Secure ZKP verified signals
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="relative aspect-square overflow-hidden mx-1.5 rounded-2xl border border-white/5 shadow-2xl">
                      {post.locked && (
                        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/80 backdrop-blur-[32px] p-8 text-center border border-white/5 animate-fade-in">
                          <div className="w-16 h-16 bg-white/[0.03] border border-white/10 rounded-3xl flex items-center justify-center mb-5 shadow-inner">
                            <Lock className="w-6 h-6 text-primary drop-shadow-[0_0_10px_rgba(102,252,241,0.4)] animate-pulse" />
                          </div>
                          <h3 className="text-sm font-black mb-1 tracking-wider uppercase text-white">Tier Restricted Content</h3>
                          <p className="text-[9px] text-white/40 mb-6 max-w-xs uppercase leading-relaxed font-black tracking-widest">
                            This sensitive asset is gated for <span className="text-primary font-black">{post.type}</span> tier sponsors.
                          </p>
                          <button className="px-5 py-2.5 bg-primary text-black text-[9px] font-black uppercase tracking-widest rounded-xl hover:shadow-[0_0_15px_rgba(102,252,241,0.4)] transition duration-300">
                            Upgrade & Unlock
                          </button>
                        </div>
                      )}
                      
                      <BlurredFaceImage
                        src={post.image}
                        alt="Content"
                        sharedScore={post.matchScore}
                        isEnabledByOwner={post.face_blur_active && !post.locked}
                        faceCoordinates={post.avatar_face_coordinates || { x: 0.5, y: 0.4, r: 0.22 }}
                        className="w-full h-full"
                        imgClassName={`group-hover:scale-105 transition duration-[1.2s] ease-[cubic-bezier(0.32,0.72,0,1)] ${post.locked ? 'blur-2xl opacity-50 grayscale' : ''}`}
                      />
                    </div>
                    
                    <div className="pt-4 px-2">
                      <p className="text-white/80 text-sm mb-4 leading-relaxed font-medium">"{post.content}"</p>
                      <div className="flex items-center justify-between text-muted-foreground border-t border-white/5 pt-4">
                        <div className="flex gap-6">
                          <button className="flex items-center gap-2 hover:text-primary transition group/btn">
                            <Heart className="w-5 h-5 group-hover/btn:scale-110 transition" /> <span className="text-[10px] font-black">124</span>
                          </button>
                        </div>
                        {post.isMatched ? (
                          <Link href="/messages" className="px-6 py-2 bg-primary text-black rounded-xl text-[10px] font-black uppercase tracking-widest text-center shadow-md">Chat Now</Link>
                        ) : (
                          <button className="text-[9px] font-black text-white/30 hover:text-white uppercase tracking-widest">Share Pulse</button>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-white/50 text-sm">
              The feed is currently empty. Start subscribing or checking recommendations!
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
