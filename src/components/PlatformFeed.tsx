'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Video, LayoutGrid, Users, Heart, Crown, Lock, Search, Play, Clock, SlidersHorizontal, MapPin, Zap, ShieldAlert, Sparkles, Bell, Flag, Calendar, Globe, X, FileText, Info, Camera, Layers } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { calculateMatch, UserProfile } from '@/lib/match-engine';
import { fetchMatches, fetchPendingMatches, recordInteraction } from '@/lib/relationship-db';
import dynamic from 'next/dynamic';
import SafetyWarning from '@/components/SafetyWarning';
import ContentPolicyWarning from '@/components/ContentPolicyWarning';
import { calculateCreatorRating } from '@/lib/rating-engine';
import BlurredFaceImage from '@/components/BlurredFaceImage';
import { RELATIONSHIP_LEVELS, syncSuggestionMoves } from '@/lib/relationship-engine';
import { useTranslation } from '@/context/LanguageContext';
import ProvenanceBadge from '@/components/ProvenanceBadge';
import { type ProvenanceLevel } from '@/lib/content-provenance';
import { awardXp } from '@/lib/xp-service';
import { cn } from '@/lib/utils';
import FeedFilterBar, { type AdvancedFilterState } from '@/components/feed/FeedFilterBar';
import FeedPaywallModal from '@/components/feed/FeedPaywallModal';
import FeedCardSwiper from '@/components/feed/FeedCardSwiper';

// Dynamic imports for heavy modals (loaded on-demand when opened)
const ProfileDetailsModal = dynamic(() => import('@/components/ProfileDetailsModal'), { ssr: false });
const AISuggestionPanel = dynamic(() => import('@/components/AISuggestionPanel'), { ssr: false });
const ReportModal = dynamic(() => import('@/components/modals/ReportModal'), { ssr: false });
const CreateDatePlanModal = dynamic(() => import('@/components/CreateDatePlanModal'), { ssr: false });
const ManageApplicantsModal = dynamic(() => import('@/components/ManageApplicantsModal'), { ssr: false });

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
  { id: 'mock-1', creator: 'Valentina', type: 'public', content: 'Excited for tonight! 🌙', image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&q=80', timestamp: '2h ago', locked: false, relationship: 'matched', media_type: 'photo', teaser_type: 'none', profile: { hobbies: ['Music', 'Art'], lifestyle: { partying: 'Often', traveling: 'Every Day', socializing: 'Often' }, relationshipGoal: 'Short-term', relationshipType: 'Open Relationship', sexualPreferences: ['Heterosexual'], familyGoals: 'Open to children' } },
  { id: 'mock-2', creator: 'Elena', type: 'vip', content: 'Exclusive VIP Album: Midnight Pulse', image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&q=80', timestamp: '5h ago', locked: true, relationship: 'subscribed', media_type: 'album', album_name: 'Midnight Pulse', album_count: 8, teaser_type: 'none', profile: { hobbies: ['Tech', 'Music'], lifestyle: { workout: 'Every Day', traveling: 'Often', socializing: 'Often' }, relationshipGoal: 'Long-term', relationshipType: 'Monogamous', sexualPreferences: ['Heterosexual'], familyGoals: 'Want children' } },
  { id: 'mock-3', creator: 'Elena', type: 'public', content: 'Sneak peek at the new set! 📷', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&q=80', timestamp: '1h ago', locked: false, relationship: 'subscribed', media_type: 'video', video_duration: '0:15', teaser_type: 'none', profile: { hobbies: ['Tech', 'Music'], lifestyle: { workout: 'Every Day', traveling: 'Often', socializing: 'Often' }, relationshipGoal: 'Long-term', relationshipType: 'Monogamous', sexualPreferences: ['Heterosexual'], familyGoals: 'Want children' } },
  { id: 'mock-4', creator: 'Marcus_X', type: 'master', content: 'Inside the Master Vault', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&q=80', timestamp: '1d ago', locked: true, relationship: 'none', media_type: 'photo', teaser_type: 'main_photo', profile: { hobbies: ['Fitness', 'Cars'], lifestyle: { workout: 'Every Day', socializing: 'Sometimes' }, relationshipGoal: 'Casual', relationshipType: 'Monogamous', sexualPreferences: ['Heterosexual'], familyGoals: "Don't want children" } },
  { id: 'mock-5', creator: 'Sofia', type: 'ppv', content: 'Morning routine starts now! ☀️ (PPV Video)', image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&q=80', timestamp: '3h ago', locked: true, relationship: 'none', media_type: 'video', video_duration: '1:30', teaser_type: 'video_clip', video_start_time: 15, profile: { hobbies: ['Fitness', 'Yoga'], lifestyle: { workout: 'Every Day', 'healthy eating': 'Every Day', socializing: 'Sometimes' }, relationshipGoal: 'Long-term', relationshipType: 'Monogamous', sexualPreferences: ['Heterosexual'], familyGoals: 'Want children' } },
  { id: 'mock-6', creator: 'Valentina', type: 'ppv', content: 'Special Dance Clips (PPV Preview)', image: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=800&q=80', timestamp: '1d ago', locked: true, relationship: 'matched', media_type: 'video', video_duration: '0:45', teaser_type: 'custom', thumbnail_url: 'https://images.unsplash.com/photo-1545235617-9465d2a55698?w=800&q=80', thumbnail_type: 'photo', profile: { hobbies: ['Music', 'Art'], lifestyle: { partying: 'Often', traveling: 'Every Day', socializing: 'Often' }, relationshipGoal: 'Short-term', relationshipType: 'Open Relationship', sexualPreferences: ['Heterosexual'], familyGoals: 'Open to children' } },
];

const MOCK_MATCHED_USERS = [
  { id: 'match-1', username: 'Valentina', avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80', current_level: 'Friendly', gauge_score: 25, target_profile: { id: 'val-001', username: 'Valentina', display_name: 'Valentina V.', avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80' } },
  { id: 'match-2', username: 'Elena', avatar_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&q=80', current_level: 'Close Friend', gauge_score: 38, target_profile: { id: 'ele-002', username: 'Elena', display_name: 'Elena R.', avatar_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&q=80' } }
];

// Floating Media Metadata Badges Configuration
// - Photos: Camera tag (Accent color)
// - Videos: Play tag + duration (Primary color)
// - Albums: Layers icon + Name + Count (Yellow color)
const SCANNING_STATES = [
  'SCANNING MEMORY BLOCKS',
  'ENFORCING ZK-RLS SHIELD',
  'MONITORING PUBLIC CHANNELS',
  'BLURRING SENSITIVE MEDIA',
  'SECURE SANDBOX ACTIVE'
];

interface TeaserMetadata {
  teaser_type: 'none' | 'video_clip' | 'main_photo' | 'custom';
  video_start_time?: number;
  thumbnail_url?: string;
  thumbnail_type?: 'photo' | 'video';
}

function parseDescription(description: string) {
  let cleanDesc = description || '';
  let coPerformers: any[] = [];
  let teaser: TeaserMetadata = { teaser_type: 'none' };

  if (cleanDesc.includes('===CO_PERFORMERS===')) {
    const parts = cleanDesc.split('\n\n===CO_PERFORMERS===\n');
    cleanDesc = parts[0];
    const secondPart = parts[1] || '';
    if (secondPart.includes('===THUMBNAIL===')) {
      const subParts = secondPart.split('\n\n===THUMBNAIL===\n');
      try {
        coPerformers = JSON.parse(subParts[0]);
        teaser = JSON.parse(subParts[1]);
      } catch (e) {}
    } else {
      try {
        coPerformers = JSON.parse(secondPart);
      } catch (e) {}
    }
  } else if (cleanDesc.includes('===THUMBNAIL===')) {
    const parts = cleanDesc.split('\n\n===THUMBNAIL===\n');
    cleanDesc = parts[0];
    try {
      teaser = JSON.parse(parts[1]);
    } catch (e) {}
  }

  return { cleanDesc, coPerformers, teaser };
}

export default function PlatformFeed() {
  const { t } = useTranslation();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [optimisticLikes, setOptimisticLikes] = useState<Record<string, boolean>>({});
  const [currentUserProfile, setCurrentUserProfile] = useState<UserProfile>(DEFAULT_USER_PROFILE);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [userTier, setUserTier] = useState<'free' | 'vip' | 'master'>('free');
  const [sidebarTab, setSidebarTab] = useState<'matches' | 'likes'>('matches');
  const [activeTrustInfo, setActiveTrustInfo] = useState<'policy' | 'restriction' | null>(null);
  const [scanStateIndex, setScanStateIndex] = useState(0);
  
  // Database States
  const [matches, setMatches] = useState<any[]>([]);
  const [pendingMatches, setPendingMatches] = useState<any[]>([]);
  const [feedContent, setFeedContent] = useState<any[]>([]);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [ratingsMap, setRatingsMap] = useState<Record<string, number[]>>({});
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [abGroup, setAbGroup] = useState<'A' | 'B'>('A');
  const [searchQuery, setSearchQuery] = useState('');
  const [reportingContent, setReportingContent] = useState<{ id: string, type: 'platform_content' | 'profile' | 'message' } | null>(null);
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);

  // Date Plan States
  const [datePlans, setDatePlans] = useState<any[]>([]);
  const [planApplyingId, setPlanApplyingId] = useState<string | null>(null);
  const [showCreatePlanModal, setShowCreatePlanModal] = useState(false);
  const [showManageApplicantsModal, setShowManageApplicantsModal] = useState(false);
  const [selectedPlanForManagement, setSelectedPlanForManagement] = useState<any>(null);
  const [userRole, setUserRole] = useState<'member' | 'creator'>('member');
  const [liveToast, setLiveToast] = useState<{ message: string; subMessage?: string; type: 'plan' | 'post' | 'level_up' } | null>(null);

  // Advanced Search Filter State Object
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedFilterState>({
    minAge: '',
    maxAge: '',
    minHeight: '',
    maxHeight: '',
    sexualPreference: 'All',
    relationshipGoal: 'All',
    relationshipType: 'All',
    minMatchScore: '',
    locationType: 'All',
    relationshipLevel: 'All',
    profileStatus: 'All'
  });
  
  // Cost & Results States
  const [searchXpBalance, setSearchXpBalance] = useState<number | null>(null);
  const [searchResults, setSearchResults] = useState<any[] | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedPaywallPost, setSelectedPaywallPost] = useState<any | null>(null);

  const executeSearch = async () => {
    setIsSearching(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      const res = await fetch('/api/v2/search/advanced', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: session.user.id,
          query: searchQuery,
          minAge: advancedFilters.minAge ? parseInt(advancedFilters.minAge) : null,
          maxAge: advancedFilters.maxAge ? parseInt(advancedFilters.maxAge) : null,
          minHeight: advancedFilters.minHeight ? parseInt(advancedFilters.minHeight) : null,
          maxHeight: advancedFilters.maxHeight ? parseInt(advancedFilters.maxHeight) : null,
          sexualPreference: advancedFilters.sexualPreference,
          relationshipGoal: advancedFilters.relationshipGoal !== 'All' ? advancedFilters.relationshipGoal : null,
          relationshipType: advancedFilters.relationshipType !== 'All' ? advancedFilters.relationshipType : null,
          minMatchScore: advancedFilters.minMatchScore ? parseInt(advancedFilters.minMatchScore) : null,
          locationType: advancedFilters.locationType,
          relationshipLevel: advancedFilters.relationshipLevel,
          profileStatus: advancedFilters.profileStatus
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to execute search');

      setSearchResults(data.results);
      setSearchXpBalance(data.currentXp);
    } catch (err: any) {
      alert(err.message || 'Error executing advanced search.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleResetSearch = () => {
    setSearchResults(null);
    setAdvancedFilters({
      minAge: '',
      maxAge: '',
      minHeight: '',
      maxHeight: '',
      sexualPreference: 'All',
      relationshipGoal: 'All',
      relationshipType: 'All',
      minMatchScore: '',
      locationType: 'All',
      relationshipLevel: 'All',
      profileStatus: 'All'
    });
    setSearchQuery('');
  };

  const loadDatePlans = async () => {
    try {
      const { data, error } = await supabase
        .from('session_intent_plans')
        .select(`
          *,
          poster_profile:profiles!session_intent_plans_poster_user_uuid_fkey(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDatePlans(data || []);
    } catch (err) {
      console.error('Error loading date plans:', err);
    }
  };

  const loadFeedContent = async () => {
    try {
      const { data: content, error: contentError } = await supabase
        .from('platform_content')
        .select(`
          *,
          creator_profile:profiles!platform_content_creator_id_fkey(*)
        `)
        .order('created_at', { ascending: false });

      let baseContent = content && content.length > 0 ? content : [];

      // Phase 14: Surface members with public albums in the feed
      const { data: publicAlbums } = await supabase
        .from('member_albums')
        .select('*, profile:profiles(*)')
        .eq('visibility', 'public')
        .order('created_at', { ascending: false })
        .limit(3);

      if (publicAlbums && publicAlbums.length > 0) {
        const albumPosts = publicAlbums.map((album: any) => ({
          id: `album-${album.id}`,
          creator_id: album.member_id,
          creator: album.profile?.username || 'Member',
          type: 'public',
          content: 'Just uploaded to their public album! 📸 Match to see more.',
          image: album.media_url,
          timestamp: new Date(album.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
          locked: false,
          relationship: 'none',
          media_type: album.media_type,
          teaser_type: 'none',
          avatar_url: album.profile?.avatar_url,
          matchScore: 0,
          creator_profile: album.profile,
          face_blur_active: album.profile?.face_blur_active,
          avatar_face_coordinates: album.profile?.avatar_face_coordinates
        }));
        
        baseContent = [...albumPosts, ...baseContent];
      }

      setFeedContent(baseContent);
    } catch (err) {
      console.error('Error loading feed content:', err);
    }
  };

  const handleApplyToPlan = async (planId: string) => {
    if (!currentUser) return;
    setPlanApplyingId(planId);
    try {
      const { error } = await supabase.rpc('apply_to_date_plan', {
        target_plan_id: planId,
        applicant_id: currentUser.id
      });

      if (error) throw error;
      // Reload plans to show updated waitlist/status
      await loadDatePlans();
    } catch (err: any) {
      console.error('Error applying to date plan:', err);
      alert(`Could not apply to date plan: ${err.message || err}`);
    } finally {
      setPlanApplyingId(null);
    }
  };

  const handleLikeBack = async (targetId: string) => {
    if (!currentUser) return;
    try {
      const { matched } = await recordInteraction(currentUser.id, targetId, 'heart');
      
      const { data: targetProfile } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', targetId)
        .single();

      if (matched) {
        setLiveToast({
          message: '🎉 Mutual Connection!',
          subMessage: `You and @${targetProfile?.username || 'user'} are now connected!`,
          type: 'level_up'
        });
      } else {
        setLiveToast({
          message: '❤️ Like Sent',
          subMessage: `Liked @${targetProfile?.username || 'user'}!`,
          type: 'post'
        });
      }
      
      // Refresh matches and pending lists
      const myMatches = await fetchMatches(currentUser.id);
      setMatches(myMatches.length > 0 ? myMatches : MOCK_MATCHED_USERS);

      const pending = await fetchPendingMatches(currentUser.id);
      setPendingMatches(pending);
    } catch (err) {
      console.error('Error liking back user:', err);
    }
  };

  const handleDislikePending = async (targetId: string) => {
    if (!currentUser) return;
    try {
      await recordInteraction(currentUser.id, targetId, 'broken_heart');
      
      // Refresh pending matches list
      const pending = await fetchPendingMatches(currentUser.id);
      setPendingMatches(pending);
    } catch (err) {
      console.error('Error disliking user:', err);
    }
  };


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
      await syncSuggestionMoves(supabase);
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
          if (profile.role) {
            setUserRole(profile.role as 'member' | 'creator');
          }

          // Load search XP balance
          const { data: xpProf } = await supabase
            .from('user_xp_profiles')
            .select('current_xp')
            .eq('user_id', session.user.id)
            .single();
          if (xpProf) {
            setSearchXpBalance(xpProf.current_xp);
          }
        }
      } else {
        setLoading(false);
      }
    };
    loadSession();
  }, []);

  // Realtime channel subscriptions for live feed updates & relationship level ups
  useEffect(() => {
    if (!currentUser) return;

    // 1. Listen to session_intent_plans (Dating Plans)
    const plansChannel = supabase
      .channel('realtime_date_plans')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'session_intent_plans'
        },
        async (payload: any) => {
          await loadDatePlans();

          // If a new plan is created by someone else, trigger live toast
          if (payload.eventType === 'INSERT' && payload.new.poster_user_uuid !== currentUser.id) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('username')
              .eq('id', payload.new.poster_user_uuid)
              .single();

            const username = profile?.username || 'Someone';
            setLiveToast({
              message: '🔥 New Date Plan!',
              subMessage: `@${username} posted: "${payload.new.description || ''}"`,
              type: 'plan'
            });
          }
        }
      )
      .subscribe();

    // 2. Listen to platform_content (Feed posts)
    const contentChannel = supabase
      .channel('realtime_feed_content')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'platform_content'
        },
        async () => {
          await loadFeedContent();
        }
      )
      .subscribe();

    // 3. Listen to relationships (Level ups)
    const relationshipsChannel = supabase
      .channel('realtime_relationships')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'relationships',
          filter: `user_id=eq.${currentUser.id}`
        },
        async (payload: any) => {
          const oldLevel = payload.old?.current_level;
          const newLevel = payload.new?.current_level;
          if (oldLevel && newLevel && oldLevel !== newLevel) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('username')
              .eq('id', payload.new.target_id)
              .single();

            setLiveToast({
              message: '🎉 Relationship Level Up!',
              subMessage: `You and @${profile?.username || 'user'} are now '${newLevel}'!`,
              type: 'level_up'
            });
          }

          // Reload matches
          const myMatches = await fetchMatches(currentUser.id);
          setMatches(myMatches.length > 0 ? myMatches : MOCK_MATCHED_USERS);
        }
      )
      .subscribe();

    // 4. Listen to interactions (incoming likes)
    const interactionsChannel = supabase
      .channel('realtime_interactions_feed')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'interactions',
          filter: `target_id=eq.${currentUser.id}`
        },
        async () => {
          const pending = await fetchPendingMatches(currentUser.id);
          setPendingMatches(pending);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(plansChannel);
      supabase.removeChannel(contentChannel);
      supabase.removeChannel(relationshipsChannel);
      supabase.removeChannel(interactionsChannel);
    };
  }, [currentUser]);

  // Auto-dismiss notification toasts
  useEffect(() => {
    if (liveToast) {
      const timer = setTimeout(() => setLiveToast(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [liveToast]);

  // Live scanning status cycle
  useEffect(() => {
    const timer = setInterval(() => {
      setScanStateIndex((prev) => (prev + 1) % SCANNING_STATES.length);
    }, 2500);
    return () => clearInterval(timer);
  }, []);

  // Pay-Per-View Unlock Handler
  const handleUnlockPpv = async (postId: string) => {
    if (!currentUser) {
      setLiveToast({
        message: 'Authentication Required',
        subMessage: 'Please log in to purchase PPV content.',
        type: 'post'
      });
      return;
    }

    try {
      // 1. Simulate transaction
      localStorage.setItem(`unlocked_ppv_${postId}`, 'true');

      // 2. Award connection points / XP to the user
      await awardXp(currentUser.id, 250);

      // 3. Show live Toast notification
      setLiveToast({
        message: 'PPV Post Unlocked! 🔓',
        subMessage: 'Content decrypted in-place. +250 XP earned!',
        type: 'post'
      });

      // 4. Force state reload in-place
      setFeedContent(prev => prev.map(post => {
        if (post.id === postId) {
          return { ...post }; 
        }
        return post;
      }));

    } catch (err) {
      console.error('Error unlocking PPV post:', err);
    }
  };

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
        await loadFeedContent();

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

        // 5. Fetch Date Plans
        await loadDatePlans();

        // 6. Fetch Pending Matches
        const pending = await fetchPendingMatches(currentUser.id);
        setPendingMatches(pending);
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
      if (item.tier === 'ppv') {
        const isUnlocked = typeof window !== 'undefined' && localStorage.getItem(`unlocked_ppv_${item.id}`) === 'true';
        if (!isUnlocked) {
          isLocked = true;
        }
      } else {
        if (!activeSub) {
          isLocked = true;
        }
      }
    }

    const isMatched = matches.some(m => m.target_profile.id === item.creator_id);
    const { cleanDesc, teaser } = parseDescription(item.description || item.title);

    return {
      id: item.id,
      creator: creatorProf?.username || 'creator',
      creator_id: item.creator_id,
      avatar_url: creatorProf?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80',
      type: item.tier === 'none' ? 'public' : item.tier,
      content: cleanDesc,
      image: item.media_url,
      timestamp: new Date(item.created_at).toLocaleDateString(),
      matchScore: matchProb,
      matchResult,
      locked: isLocked,
      isMatched,
      relationship: activeSub ? 'subscribed' : isMatched ? 'matched' : 'none',
      ratingScore: calculateCreatorRating(creatorProf, ratingsMap[item.creator_id] || []),
      face_blur_active: creatorProf?.face_blur_active || false,
      avatar_face_coordinates: creatorProf?.avatar_face_coordinates || null,
      media_type: item.media_type || (item.media_url?.includes('mp4') || item.media_url?.includes('video') ? 'video' : 'photo'),
      video_duration: item.video_duration || null,
      album_name: item.album_name || null,
      album_count: item.album_count || null,
      teaser_type: teaser.teaser_type || 'none',
      video_start_time: teaser.video_start_time || 0,
      thumbnail_url: teaser.thumbnail_url || null,
      thumbnail_type: teaser.thumbnail_type || null,
      specialization: creatorProf?.specialization || null
    };
  });

  // Merge database content and mock content fallback if DB feed is empty
  const enrichedFeed = dbEnrichedFeed.length > 0 
    ? dbEnrichedFeed 
    : MOCK_RECENT_CONTENT.map(item => {
        const matchResult = calculateMatch(currentUserProfile, item.profile as unknown as UserProfile);
        const isFaceBlurCreator = ['Valentina', 'Elena', 'Sofia'].includes(item.creator);
        const isUnlocked = typeof window !== 'undefined' && localStorage.getItem(`unlocked_ppv_${item.id}`) === 'true';
        const isLocked = item.locked && (item.type === 'ppv' ? !isUnlocked : true);
        return {
          ...item,
          avatar_url: item.image,
          creator_id: item.id,
          isMatched: item.relationship === 'matched',
          matchScore: matchResult.totalScore,
          matchResult,
          ratingScore: calculateCreatorRating(item.profile, ratingsMap[item.id] || []),
          face_blur_active: isFaceBlurCreator,
          avatar_face_coordinates: isFaceBlurCreator ? { x: 0.5, y: 0.35, r: 0.18 } : null,
          locked: isLocked,
          specialization: (item as any).specialization || (item.profile as any).specialization || null
        };
      });

  const filteredFeed = enrichedFeed.filter(item => {
    if (activeFilter === 'subscribed') return item.relationship === 'subscribed';
    if (activeFilter === 'matched') return item.isMatched || item.matchScore >= 80;
    if (activeFilter === 'live') return item.type === 'live';
    if (activeFilter === 'all' || activeFilter === 'date_plans') return true;
    
    // Check specialization ID or alias
    const spec = (item.specialization || '').toLowerCase();
    const filter = activeFilter.toLowerCase();
    
    if (filter === 'ai_tech' || filter === 'ai & tech' || filter === 'ai & technology') {
      return spec === 'ai_tech' || spec.includes('ai') || spec.includes('tech');
    }
    if (filter === 'beauty' || filter === 'beauty & makeup') {
      return spec === 'beauty' || spec.includes('beauty') || spec.includes('makeup');
    }
    if (filter === 'style' || filter === 'fashion & style') {
      return spec === 'style' || spec.includes('style') || spec.includes('fashion');
    }
    if (filter === 'fitness' || filter === 'fitness & vitality' || filter === 'fitness & wellness') {
      return spec === 'fitness' || spec.includes('fitness') || spec.includes('workout');
    }
    if (filter === 'health' || filter === 'health & psychology') {
      return spec === 'health' || spec.includes('health') || spec.includes('psychology');
    }
    if (filter === 'wellness' || filter === 'mindfulness & wellness') {
      return spec === 'wellness' || spec.includes('wellness') || spec.includes('mindfulness');
    }
    if (filter === 'dating' || filter === 'dating coach' || filter === 'dating & marriage') {
      return spec === 'dating' || spec.includes('dating');
    }
    if (filter === 'culinary' || filter === 'cooking & dining' || filter === 'cooking') {
      return spec === 'culinary' || spec.includes('culinary') || spec.includes('cooking');
    }
    if (filter === 'financial' || filter === 'economy & finance' || filter === 'wealth') {
      return spec === 'financial' || spec.includes('financial') || spec.includes('economy');
    }
    if (filter === 'career' || filter === 'career & ambition' || filter === 'social & communication') {
      return spec === 'career' || spec.includes('career') || spec.includes('ambition');
    }
    if (filter === 'creative' || filter === 'art & music' || filter === 'art & performance') {
      return spec === 'creative' || spec.includes('creative') || spec.includes('art') || spec.includes('music');
    }
    if (filter === 'gaming' || filter === 'gaming & esports') {
      return spec === 'gaming' || spec.includes('gaming');
    }
    if (filter === 'adult' || filter === '18+ sensual' || filter === 'explicit') {
      return spec === 'adult' || item.type === 'explicit' || item.type === '18+';
    }

    return spec === filter;
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
      <div className="min-h-screen bg-transparent p-4 md:p-6 space-y-6 pt-24 max-w-2xl mx-auto">
        {[1, 2, 3].map(i => (
          <div key={i} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 overflow-hidden relative">
            <div className="absolute inset-0 bg-white/5 animate-pulse" />
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-white/10" />
              <div className="space-y-2">
                <div className="w-24 h-3 rounded-full bg-white/10" />
                <div className="w-16 h-2 rounded-full bg-white/5" />
              </div>
            </div>
            <div className="w-full h-64 rounded-xl bg-white/5 mb-4" />
            <div className="w-3/4 h-3 rounded-full bg-white/10" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent text-white pt-16 pb-24 md:pb-0 relative overflow-hidden">
      {/* Real-time Dynamic Toast Notification */}
      <AnimatePresence>
        {liveToast && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className={`fixed top-24 right-6 z-50 max-w-sm border rounded-2xl p-4 shadow-[0_0_30px_rgba(102,252,241,0.2)] backdrop-blur-xl flex items-center gap-3 ${
              liveToast.type === 'level_up'
                ? 'bg-purple-950/80 border-purple-500/30'
                : 'bg-black/90 border-primary/30'
            }`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center border animate-pulse shrink-0 ${
              liveToast.type === 'level_up'
                ? 'bg-purple-500/10 border-purple-500/20 text-purple-400'
                : 'bg-primary/10 border-primary/20 text-primary'
            }`}>
              {liveToast.type === 'level_up' ? '🎉' : '⚡'}
            </div>
            <div>
              <p className="text-xs font-black text-white uppercase tracking-wider">{liveToast.message}</p>
              {liveToast.subMessage && <p className="text-[10px] text-white/60 font-medium mt-0.5">{liveToast.subMessage}</p>}
            </div>
            <button 
              onClick={() => setLiveToast(null)} 
              className="ml-auto p-1 text-white/40 hover:text-white transition"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      <ReportModal 
        isOpen={!!reportingContent} 
        onClose={() => setReportingContent(null)} 
        contentId={reportingContent?.id || ''} 
        contentType={reportingContent?.type || 'platform_content'} 
      />
      {/* Background neon accent mesh orbs */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary/10 blur-[150px] rounded-full pointer-events-none animate-pulse-cyan" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-accent/10 blur-[150px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 md:px-12 pt-12 pb-8 space-y-12 relative z-10">
        
        {/* Top Grid Row: Active Streams & Matches Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Active Live Streams section (2/3 width) */}
          <div className="lg:col-span-9 space-y-6">
            
            {/* Feed Filters & Mode Badge Row */}
            <FeedFilterBar
              activeFilter={activeFilter}
              setActiveFilter={setActiveFilter}
              abGroup={abGroup}
              userRole={userRole}
              userTier={userTier}
              searchXpBalance={searchXpBalance}
              filters={advancedFilters}
              setFilters={setAdvancedFilters}
              isSearching={isSearching}
              searchResultsCount={searchResults ? searchResults.length : null}
              onExecuteSearch={executeSearch}
              onResetSearch={handleResetSearch}
            />
 
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

            {/* System Security & Trust Center */}
            <div className="glass-card p-6 border border-white/10 bg-black/45 rounded-3xl relative z-10 overflow-hidden text-left space-y-4">
              <div className="absolute -right-16 -top-16 w-32 h-32 bg-primary/10 blur-[40px] rounded-full pointer-events-none" />
              
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-4">
                <div className="flex items-center gap-3">
                  <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 shadow-[0_0_15px_rgba(102,252,241,0.2)] shrink-0">
                    <span className="absolute inset-0 rounded-xl border border-primary/40 animate-ping opacity-75" />
                    <ShieldAlert className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black uppercase tracking-[0.2em] text-white">System Security & Trust</h3>
                    <p className="text-[9px] text-white/40 uppercase font-black tracking-widest mt-0.5 flex items-center gap-1.5">
                      <span className="inline-block w-1 h-1 rounded-full bg-primary animate-ping" />
                      Secure AI Sandbox Status: Real-time RLS Shield Enforced
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2.5 px-3.5 py-1.5 bg-emerald-500/5 border border-emerald-500/20 rounded-full text-[9px] font-black uppercase tracking-widest text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.1)] shrink-0 select-none">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                  </span>
                  <div className="flex items-center gap-1.5 min-w-[170px]">
                    <span className="text-white/40 font-bold">LIVE SCAN:</span>
                    <AnimatePresence mode="wait">
                      <motion.span 
                        key={scanStateIndex}
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 4 }}
                        transition={{ duration: 0.2 }}
                        className="text-[9px] font-black text-emerald-400 font-mono tracking-wider"
                      >
                        {SCANNING_STATES[scanStateIndex]}
                      </motion.span>
                    </AnimatePresence>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Content Public Policy Card */}
                <div className="relative">
                  <button 
                    onClick={() => setActiveTrustInfo(activeTrustInfo === 'policy' ? null : 'policy')}
                    className={`w-full flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border transition-all duration-300 group text-left ${
                      activeTrustInfo === 'policy' ? 'border-primary/40 bg-white/[0.05]' : 'border-white/5 hover:border-primary/20 hover:bg-white/[0.04]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-xl border border-primary/20 text-primary shrink-0 group-hover:scale-110 transition duration-300">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-[11px] font-black text-white uppercase tracking-wider">Content Public Policy</h4>
                        <p className="text-[8px] text-white/40 uppercase tracking-widest font-black mt-0.5">Click to read info</p>
                      </div>
                    </div>
                    <div className={`w-6 h-6 rounded-full border flex items-center justify-center transition ${
                      activeTrustInfo === 'policy' ? 'bg-primary/20 border-primary/40 text-primary' : 'bg-white/5 border-white/5 text-white/50 group-hover:text-primary group-hover:border-primary/20'
                    }`}>
                      <Info className="w-3.5 h-3.5" />
                    </div>
                  </button>

                  <AnimatePresence>
                    {activeTrustInfo === 'policy' && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                        className="absolute bottom-full left-0 mb-3 w-80 p-4 bg-black/95 backdrop-blur-2xl border border-primary/30 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] z-50 text-left text-white"
                      >
                        <div className="absolute -bottom-1.5 left-6 w-3 h-3 bg-black border-r border-b border-primary/30 rotate-45" />
                        <h5 className="text-[10px] font-black text-primary uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5" /> Content Public Policy
                        </h5>
                        <p className="text-[9.5px] text-white/80 font-semibold leading-relaxed">
                          Explicit adult content is strictly restricted on public channels (Avatar, Profile Photos, Public Posts). Please ensure all public media complies with our safety guidelines.
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Safety Restriction Card */}
                <div className="relative">
                  <button 
                    onClick={() => setActiveTrustInfo(activeTrustInfo === 'restriction' ? null : 'restriction')}
                    className={`w-full flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border transition-all duration-300 group text-left ${
                      activeTrustInfo === 'restriction' ? 'border-accent/40 bg-white/[0.05]' : 'border-white/5 hover:border-accent/20 hover:bg-white/[0.04]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-accent/10 rounded-xl border border-accent/20 text-accent shrink-0 group-hover:scale-110 transition duration-300">
                        <ShieldAlert className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-[11px] font-black text-white uppercase tracking-wider">Safety Restriction Info</h4>
                        <p className="text-[8px] text-white/40 uppercase tracking-widest font-black mt-0.5">Click to read info</p>
                      </div>
                    </div>
                    <div className={`w-6 h-6 rounded-full border flex items-center justify-center transition ${
                      activeTrustInfo === 'restriction' ? 'bg-accent/20 border-accent/40 text-accent' : 'bg-white/5 border-white/5 text-white/50 group-hover:text-accent group-hover:border-accent/20'
                    }`}>
                      <Info className="w-3.5 h-3.5" />
                    </div>
                  </button>

                  <AnimatePresence>
                    {activeTrustInfo === 'restriction' && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                        className="absolute bottom-full right-0 mb-3 w-80 p-4 bg-black/95 backdrop-blur-2xl border border-accent/30 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] z-50 text-left text-white"
                      >
                        <div className="absolute -bottom-1.5 right-6 w-3 h-3 bg-black border-r border-b border-accent/30 rotate-45" />
                        <h5 className="text-[10px] font-black text-accent uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                          <ShieldAlert className="w-3.5 h-3.5" /> Safety Alert: Restriction Info
                        </h5>
                        <p className="text-[9.5px] text-white/80 font-semibold leading-relaxed">
                          Explicit adult content is strictly restricted in public spaces (Avatar, Profile Photos, Bio, Public Posts). Such content must be exclusively uploaded to VIP or Master vaults. Violations result in automatic blurring or account suspension.
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Column (1/3 width) */}
          <div className="lg:col-span-3 space-y-8">
            
            {/* Connections Hub Sidebar */}
            <div className="glass-card p-4 flex flex-col h-[400px]">
              {/* Tab Toggles */}
              <div className="flex border-b border-white/10 pb-3 mb-4 shrink-0">
                <button
                  onClick={() => setSidebarTab('matches')}
                  className={`flex-1 py-1 text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 text-center relative ${
                    sidebarTab === 'matches' ? 'text-primary' : 'text-white/40 hover:text-white'
                  }`}
                >
                  My Connections
                  {sidebarTab === 'matches' && (
                    <motion.div
                      layoutId="sidebarTabIndicator"
                      className="absolute bottom-[-13px] left-0 right-0 h-0.5 bg-primary shadow-[0_0_10px_rgba(102,252,241,0.5)]"
                    />
                  )}
                </button>
                <button
                  onClick={() => setSidebarTab('likes')}
                  className={`flex-1 py-1 text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 text-center relative flex items-center justify-center gap-1.5 ${
                    sidebarTab === 'likes' ? 'text-accent' : 'text-white/40 hover:text-white'
                  }`}
                >
                  Pending Connections
                  {pendingMatches.length > 0 && (
                    <span className="w-1.5 h-1.5 rounded-full bg-accent animate-ping" />
                  )}
                  {sidebarTab === 'likes' && (
                    <motion.div
                      layoutId="sidebarTabIndicator"
                      className="absolute bottom-[-13px] left-0 right-0 h-0.5 bg-accent shadow-[0_0_10px_rgba(255,107,107,0.5)]"
                    />
                  )}
                </button>
              </div>

              {/* Tab Contents */}
              <div className="flex-1 overflow-y-auto pr-1 scrollbar-hide space-y-2">
                {sidebarTab === 'matches' ? (
                  matches.length > 0 ? (
                    matches.map((m) => (
                      <div 
                        key={m.id} 
                        onClick={() => router.push(`/profile/${m.target_profile.id}`)}
                        className="flex items-center justify-between p-2.5 bg-white/[0.01] rounded-xl border border-white/5 hover:border-primary/40 hover:bg-white/[0.03] transition group cursor-pointer text-left"
                        title="Click to view profile details"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-8 h-8 rounded-full overflow-hidden border border-white/10 shrink-0">
                            <img 
                              src={m.target_profile.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80'} 
                              alt={m.target_profile.display_name} 
                              className="w-full h-full object-cover" 
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="font-black text-[11px] text-white truncate">@{m.target_profile.display_name || m.target_profile.username}</p>
                            <p className="text-[7px] text-primary/60 font-black tracking-widest uppercase mt-0.5">
                              {m.current_level} • {m.gauge_score} XP
                            </p>
                          </div>
                        </div>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            window.location.href = `/messages?id=${m.target_profile.id}`;
                          }}
                          className="p-1.5 bg-white/5 rounded-lg text-muted-foreground group-hover:text-primary border border-white/5 hover:border-primary/25 transition shrink-0"
                          title="Start Direct Message"
                        >
                          <Play className="w-3 h-3 fill-current" />
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12 text-white/40 text-[9px] font-black uppercase tracking-wider">
                      No active connections.
                    </div>
                  )
                ) : (
                  pendingMatches.length > 0 ? (
                    pendingMatches.map((m) => (
                      <div 
                        key={m.id} 
                        onClick={() => router.push(`/profile/${m.id}`)}
                        className="flex items-center justify-between p-2.5 bg-white/[0.01] rounded-xl border border-white/5 hover:border-accent/40 hover:bg-white/[0.03] transition group cursor-pointer text-left"
                        title="Click to view profile details"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-8 h-8 rounded-full overflow-hidden border border-white/10 shrink-0">
                            <img 
                              src={m.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80'} 
                              alt={m.display_name} 
                              className="w-full h-full object-cover" 
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="font-black text-[11px] text-white truncate">@{m.display_name || m.username}</p>
                            <span className="inline-block text-[7px] text-accent/80 font-black tracking-widest uppercase mt-0.5">
                              Likes You
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex gap-1.5 shrink-0">
                          {/* Quick Like Back (Creates Match) */}
                          <button 
                            onClick={async (e) => {
                              e.stopPropagation();
                              await handleLikeBack(m.id);
                            }}
                            className="p-1.5 bg-accent/10 hover:bg-accent/25 text-accent rounded-lg border border-accent/20 transition hover:border-accent/50"
                            title="Like back to match!"
                          >
                            <Heart className="w-3 h-3 fill-current" />
                          </button>
                          
                          {/* Dislike/Dismiss */}
                          <button 
                            onClick={async (e) => {
                              e.stopPropagation();
                              await handleDislikePending(m.id);
                            }}
                            className="p-1.5 bg-white/5 hover:bg-white/10 text-white/50 hover:text-white rounded-lg border border-white/5 hover:border-white/20 transition"
                            title="Pass"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12 text-white/40 text-[9px] font-black uppercase tracking-wider">
                      No pending likes.
                    </div>
                  )
                )}
              </div>
            </div>
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
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-black flex items-center gap-2 tracking-tighter">
                {activeFilter === 'date_plans' ? (
                  <>
                    <Calendar className="text-accent w-6 h-6 animate-pulse" /> DATING PLANS
                  </>
                ) : (
                  <>
                    <LayoutGrid className="text-accent w-6 h-6" /> YOUR FEED
                  </>
                )}
              </h2>
              {activeFilter === 'date_plans' && currentUser && (
                <button
                  onClick={() => setShowCreatePlanModal(true)}
                  className="px-4 py-2 bg-primary text-black font-black uppercase text-[10px] tracking-widest rounded-xl hover:shadow-[0_0_15px_rgba(102,252,241,0.5)] transition duration-300 flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" /> Post Plan
                </button>
              )}
            </div>
          </div>
 
          {searchResults !== null ? (
            searchResults.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 text-left">
                {searchResults.map((profile) => (
                  <motion.div 
                    key={profile.id}
                    className="flex flex-col bg-white/[0.02] border border-white/5 p-4 rounded-[2.5rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)] backdrop-blur-xl hover:border-primary/20 transition group"
                  >
                    <div className="relative rounded-[2rem] overflow-hidden aspect-[3/4] border border-white/5 bg-black/40">
                      <img 
                        src={profile.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&q=80'} 
                        alt={profile.display_name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-[1.2s] ease-[cubic-bezier(0.32,0.72,0,1)]" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent z-20" />
                      
                      <div className="absolute top-3 right-3 z-30">
                        <div className="px-3 py-1.5 rounded-full text-[9px] font-black uppercase bg-black/75 backdrop-blur-md text-primary border border-primary/20 shadow-lg">
                          ⚡ {profile.matchScore}% Synergy
                        </div>
                      </div>

                      <div className="absolute bottom-4 left-4 right-4 z-30 space-y-1">
                        <h4 className="text-sm font-black text-white">@{profile.display_name || profile.username}</h4>
                        <div className="flex flex-wrap gap-1.5 text-[8px] font-black uppercase tracking-wider text-white/50">
                          <span>Age: {profile.privacyFlags.ageHidden ? 'Hidden' : profile.age || 'N/A'}</span>
                          <span>•</span>
                          <span>Height: {profile.privacyFlags.heightHidden ? 'Hidden' : profile.height ? `${profile.height}cm` : 'N/A'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 px-2 flex-1 flex flex-col justify-between space-y-4">
                      <div className="space-y-3">
                        <p className="text-white/60 text-[10px] leading-relaxed line-clamp-2 font-medium">
                          {profile.bio || "No biography provided."}
                        </p>
                        
                        <div className="space-y-1 text-[8px] font-black uppercase tracking-widest text-primary/80">
                          {!profile.privacyFlags.goalsHidden && profile.relationship_goals && (
                            <p>Goal: {profile.relationship_goals.join(', ')}</p>
                          )}
                          {!profile.privacyFlags.typesHidden && profile.relationship_types && (
                            <p>Type: {profile.relationship_types.join(', ')}</p>
                          )}
                          <p>Preference: {profile.sexual_preference || 'All'}</p>
                          <p>Location: {profile.current_location || 'N/A'}</p>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-white/5 flex gap-2 justify-end">
                        <button 
                          onClick={() => router.push(`/profile/${profile.id}`)}
                          className="px-4 py-2 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition cursor-pointer"
                        >
                          Profile
                        </button>
                        <button 
                          onClick={() => {
                            window.location.href = `/messages?id=${profile.id}`;
                          }}
                          className="px-4 py-2 bg-[#00fbfb] text-black rounded-xl text-[9px] font-black uppercase tracking-widest shadow-md hover:shadow-primary/20 transition cursor-pointer"
                        >
                          Chat
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-white/50 text-sm font-black uppercase tracking-wider">
                No profiles found for these filters.
              </div>
            )
          ) : activeFilter === 'date_plans' ? (
            datePlans.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {datePlans.map((plan) => {
                  const isPoster = plan.poster_user_uuid === currentUser?.id;
                  const isApplied = plan.applicants_waiting_list?.includes(currentUser?.id);
                  const isFull = (plan.applicants_waiting_list?.length || 0) >= plan.max_applications_int;
                  
                  // Calculate match compatibility with the poster if they are not the poster
                  const posterProf = plan.poster_profile;
                  const matchResult = posterProf ? calculateMatch(currentUserProfile, {
                    gender: posterProf.sexual_preference === 'Lesbian' || posterProf.sexual_preference === 'Gay' ? 'female' : 'male',
                    location: posterProf.origins || '',
                    hobbies: posterProf.hobbies || [],
                    lifestyle: posterProf.lifestyle_habits || {},
                    relationshipGoal: posterProf.relationship_goals?.[0] || 'Long-term',
                    relationshipType: posterProf.relationship_types?.[0] || 'Monogamous',
                    sexualPreferences: [posterProf.sexual_preference].filter(Boolean),
                    familyGoals: posterProf.lifestyle_habits?.family_goals || 'Open to children'
                  }) : null;
                  const matchScore = matchResult ? matchResult.totalScore : 0;

                  return (
                    <motion.div 
                      key={plan.plan_id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      className="bg-white/[0.02] border border-white/5 p-2 rounded-[2.5rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)] backdrop-blur-xl hover:scale-[1.01] hover:border-primary/25 hover:shadow-[0_0_30px_rgba(102,252,241,0.15)] transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group"
                    >
                      <div className="bg-black/40 border border-white/5 rounded-[2rem] p-5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] h-full flex flex-col justify-between overflow-hidden">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/10 overflow-hidden shadow-inner relative">
                              <BlurredFaceImage
                                src={posterProf?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80'}
                                alt="Avatar"
                                sharedScore={matchScore}
                                isEnabledByOwner={posterProf?.face_blur_active}
                                faceCoordinates={posterProf?.avatar_face_coordinates}
                                className="w-full h-full"
                              />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-black text-sm tracking-tight">@{posterProf?.username || 'user'}</p>
                                <span className="text-[9px] font-bold text-yellow-500 bg-yellow-500/10 px-1.5 py-0.5 rounded border border-yellow-500/20 shrink-0">
                                  ⭐ {calculateCreatorRating(posterProf, ratingsMap[plan.poster_user_uuid] || []).toFixed(2)}
                                </span>
                              </div>
                              <p className="text-[8px] text-primary/60 font-black tracking-widest uppercase mt-0.5">
                                {isPoster ? 'Your Plan' : `Match: ${matchScore}%`}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-1.5">
                            {plan.plan_status === 'Booked' && (
                              <span className="px-2.5 py-1 rounded-full text-[8px] font-black uppercase tracking-wider bg-purple-500/15 text-purple-400 border border-purple-500/25 shadow-[0_0_10px_rgba(168,85,247,0.2)] animate-pulse">
                                Booked
                              </span>
                            )}
                            <span className={`px-2.5 py-1 rounded-full text-[8px] font-black uppercase tracking-wider ${
                              plan.intent_type === 'Offer' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.15)]' : 'bg-pink-500/10 text-pink-400 border border-pink-500/20 shadow-[0_0_10px_rgba(236,72,153,0.15)]'
                            }`}>
                              {plan.intent_type === 'Offer' ? 'Offer' : 'Looking For'}
                            </span>
                          </div>
                        </div>

                        <div className="my-3 space-y-3">
                          <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.15em] text-white/50 bg-white/5 px-3 py-1.5 rounded-xl border border-white/10 w-fit">
                            {plan.plan_scope === 'In-Person' && <MapPin className="w-3 h-3 text-red-400" />}
                            {plan.plan_scope === 'Digital Screen' && <Video className="w-3 h-3 text-blue-400" />}
                            {plan.plan_scope === 'Hybrid' && <Globe className="w-3 h-3 text-emerald-400" />}
                            <span>{plan.plan_scope}</span>
                          </div>

                          <p className="text-white/90 text-xs italic font-medium leading-relaxed bg-white/[0.01] border border-white/5 p-3 rounded-2xl">
                            "{plan.description || 'No description provided.'}"
                          </p>

                          <div className="space-y-1.5">
                            <p className="text-[8px] text-white/40 uppercase tracking-widest font-black">Date Plan Tags</p>
                            <div className="flex flex-wrap gap-1">
                              {plan.allowed_move_tags_array && plan.allowed_move_tags_array.length > 0 ? (
                                plan.allowed_move_tags_array.map((tagId: string) => {
                                  let moveObj: any = null;
                                  for (const level of RELATIONSHIP_LEVELS) {
                                    const found = level.suggestionMoves.find(m => m.id === tagId);
                                    if (found) {
                                      moveObj = found;
                                      break;
                                    }
                                  }
                                  return (
                                    <span key={tagId} className="px-2.5 py-1 bg-white/5 border border-white/10 rounded-xl text-[9px] text-white/80 flex items-center gap-1 font-semibold hover:bg-white/10 transition duration-300">
                                      <span>{moveObj?.emoji || '📍'}</span>
                                      <span>{moveObj?.label || tagId}</span>
                                    </span>
                                  );
                                })
                              ) : (
                                <span className="text-[9px] text-white/30 italic">No tags selected</span>
                              )}
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <div className="flex justify-between text-[8px] uppercase tracking-wider font-black text-white/40">
                              <span>Applicants Waiting List</span>
                              <span>{plan.applicants_waiting_list?.length || 0} / {plan.max_applications_int}</span>
                            </div>
                            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                              <div 
                                className="h-full rounded-full bg-primary shadow-[0_0_10px_rgba(102,252,241,0.5)] transition-all duration-500"
                                style={{ width: `${Math.min(100, (((plan.applicants_waiting_list?.length || 0) / plan.max_applications_int) * 100))}%` }}
                              />
                            </div>
                          </div>

                          <div className="text-[8px] text-white/30 flex flex-col gap-1 font-sans pt-1 border-t border-white/5">
                            <div className="flex items-center gap-1">
                              <span className="font-black text-white/45 tracking-wider uppercase">Starts:</span>
                              <span className="font-semibold text-white/60">{new Date(plan.start_timestamp_utc).toLocaleString()}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="font-black text-white/45 tracking-wider uppercase">Ends:</span>
                              <span className="font-semibold text-white/60">{new Date(plan.end_timestamp_utc).toLocaleString()}</span>
                            </div>
                          </div>
                        </div>

                        <div className="border-t border-white/5 pt-4 mt-2">
                          {plan.plan_status === 'Booked' ? (
                            <button disabled className="w-full py-2.5 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-xl text-[10px] font-black uppercase tracking-widest text-center cursor-not-allowed">
                              Plan Booked
                            </button>
                          ) : isPoster ? (
                            <button 
                              onClick={() => {
                                setSelectedPlanForManagement(plan);
                                setShowManageApplicantsModal(true);
                              }}
                              className="w-full py-2.5 bg-primary/20 border border-primary/30 text-primary hover:bg-primary/30 hover:border-primary/50 rounded-xl text-[10px] font-black uppercase tracking-widest text-center transition duration-300 flex items-center justify-center gap-1.5"
                            >
                              Manage ({plan.applicants_waiting_list?.length || 0} Applied)
                            </button>
                          ) : isApplied ? (
                            <button disabled className="w-full py-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-[10px] font-black uppercase tracking-widest text-center cursor-not-allowed shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                              Applied ✓
                            </button>
                          ) : isFull ? (
                            <button disabled className="w-full py-2.5 bg-white/5 border border-white/10 text-white/30 rounded-xl text-[10px] font-black uppercase tracking-widest text-center cursor-not-allowed">
                              Applications Full
                            </button>
                          ) : (
                            <button 
                              onClick={() => handleApplyToPlan(plan.plan_id)}
                              disabled={planApplyingId === plan.plan_id}
                              className="w-full py-2.5 bg-primary text-black rounded-xl text-[10px] font-black uppercase tracking-widest text-center hover:shadow-[0_0_20px_rgba(102,252,241,0.5)] scale-100 hover:scale-[1.02] active:scale-95 transition-all duration-300 disabled:opacity-50"
                            >
                              {planApplyingId === plan.plan_id ? 'Applying...' : 'Apply to Plan'}
                            </button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 text-white/50 text-sm">
                No active Date Plans found. Start connecting or check back later!
              </div>
            )
          ) : filteredFeed.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {filteredFeed.map((post) => (
                <FeedCardSwiper
                  key={post.id}
                  post={post}
                  optimisticLiked={!!optimisticLikes[post.id]}
                  onToggleLike={(postId) => {
                    setOptimisticLikes(prev => ({ ...prev, [postId]: !prev[postId] }));
                  }}
                  onUnlockPpv={handleUnlockPpv}
                  onOpenPaywallModal={(p) => setSelectedPaywallPost(p)}
                  onReport={(content) => setReportingContent(content)}
                  onLogClick={logFeedClick}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-white/50 text-sm">
              The feed is currently empty. Start subscribing or checking recommendations!
            </div>
          )}
        </section>
      </div>

      {/* Feed Paywall Modal */}
      <FeedPaywallModal
        isOpen={!!selectedPaywallPost}
        onClose={() => setSelectedPaywallPost(null)}
        post={selectedPaywallPost}
        onUnlockPpv={handleUnlockPpv}
        onUpgradeTier={() => router.push('/settings')}
      />

      {currentUser && (
        <CreateDatePlanModal
          isOpen={showCreatePlanModal}
          onClose={() => setShowCreatePlanModal(false)}
          userId={currentUser.id}
          userRole={userRole}
          onPlanCreated={loadDatePlans}
        />
      )}

      {currentUser && selectedPlanForManagement && (
        <ManageApplicantsModal
          isOpen={showManageApplicantsModal}
          onClose={() => {
            setShowManageApplicantsModal(false);
            setSelectedPlanForManagement(null);
          }}
          planId={selectedPlanForManagement.plan_id}
          applicantIds={selectedPlanForManagement.applicants_waiting_list || []}
          currentUserProfile={currentUserProfile}
          posterId={currentUser.id}
          onActionComplete={loadDatePlans}
        />
      )}
      {selectedProfileId && (
        <ProfileDetailsModal
          profileId={selectedProfileId}
          onClose={() => setSelectedProfileId(null)}
          currentUserId={currentUser?.id}
        />
      )}
    </div>
  );
}
