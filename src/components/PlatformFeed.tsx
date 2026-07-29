'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Video, LayoutGrid, Users, Heart, Crown, Lock, Search, Play, Clock, SlidersHorizontal, MapPin, Zap, ShieldAlert, Sparkles, Bell, Flag, Calendar, Globe, X, FileText, Info, Camera, Layers } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { calculateMatch, UserProfile } from '@/lib/match-engine';
import { fetchMatches, fetchPendingMatches, recordInteraction } from '@/lib/relationship-db';
import SafetyWarning from '@/components/SafetyWarning';
import ContentPolicyWarning from '@/components/ContentPolicyWarning';
import ProfileDetailsModal from '@/components/ProfileDetailsModal';
import AISuggestionPanel from '@/components/AISuggestionPanel';
import { calculateCreatorRating } from '@/lib/rating-engine';
import BlurredFaceImage from '@/components/BlurredFaceImage';
import ReportModal from '@/components/modals/ReportModal';
import { RELATIONSHIP_LEVELS, syncSuggestionMoves } from '@/lib/relationship-engine';
import CreateDatePlanModal from '@/components/CreateDatePlanModal';
import ManageApplicantsModal from '@/components/ManageApplicantsModal';
import ProvenanceBadge from '@/components/ProvenanceBadge';
import { type ProvenanceLevel } from '@/lib/content-provenance';
import { awardXp } from '@/lib/xp-service';

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
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [optimisticLikes, setOptimisticLikes] = useState<Record<string, boolean>>({});
  const [currentUserProfile, setCurrentUserProfile] = useState<UserProfile>(DEFAULT_USER_PROFILE);
  const [activeFilter, setActiveFilter] = useState<'all' | 'live' | 'subscribed' | 'matched' | 'date_plans'>('all');
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

  // Advanced Search Filter States
  const [minAge, setMinAge] = useState<string>('');
  const [maxAge, setMaxAge] = useState<string>('');
  const [minHeight, setMinHeight] = useState<string>('');
  const [maxHeight, setMaxHeight] = useState<string>('');
  const [sexualPreference, setSexualPreference] = useState<string>('All');
  const [relationshipGoal, setRelationshipGoal] = useState<string>('All');
  const [relationshipType, setRelationshipType] = useState<string>('All');
  const [minMatchScore, setMinMatchScore] = useState<string>('');
  const [locationType, setLocationType] = useState<string>('All');
  const [relationshipLevel, setRelationshipLevel] = useState<string>('All');
  
  // Cost & Results States
  const [searchXpBalance, setSearchXpBalance] = useState<number | null>(null);
  const [searchResults, setSearchResults] = useState<any[] | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showConfirmSearchModal, setShowConfirmSearchModal] = useState(false);

  const handleTriggerSearchClick = () => {
    const isFree = userRole === 'creator' || userTier === 'vip' || userTier === 'master';
    if (isFree) {
      executeSearch();
    } else {
      if ((searchXpBalance ?? 0) < 250) {
        alert(`Insufficient XP. Advanced Search costs 250 XP. You currently have ${searchXpBalance ?? 0} XP. Complete profiles, match, or chat to earn more!`);
        return;
      }
      setShowConfirmSearchModal(true);
    }
  };

  const executeSearch = async () => {
    setShowConfirmSearchModal(false);
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
          minAge: minAge ? parseInt(minAge) : null,
          maxAge: maxAge ? parseInt(maxAge) : null,
          minHeight: minHeight ? parseInt(minHeight) : null,
          maxHeight: maxHeight ? parseInt(maxHeight) : null,
          sexualPreference,
          relationshipGoal: relationshipGoal !== 'All' ? relationshipGoal : null,
          relationshipType: relationshipType !== 'All' ? relationshipType : null,
          minMatchScore: minMatchScore ? parseInt(minMatchScore) : null,
          locationType,
          relationshipLevel
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
    setMinAge('');
    setMaxAge('');
    setMinHeight('');
    setMaxHeight('');
    setSexualPreference('All');
    setRelationshipGoal('All');
    setRelationshipType('All');
    setMinMatchScore('');
    setLocationType('All');
    setRelationshipLevel('All');
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

      if (contentError) throw contentError;
      setFeedContent(content && content.length > 0 ? content : []);
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
      thumbnail_type: teaser.thumbnail_type || null
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
          locked: isLocked
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
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-xl relative z-30">
              <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
                {['all', 'live', 'subscribed', 'matched', 'date_plans'].map((f) => (
                  <button 
                    key={f}
                    onClick={() => setActiveFilter(f as any)}
                    className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${activeFilter === f ? 'bg-primary text-black font-black shadow-[0_0_20px_rgba(102,252,241,0.4)] scale-105 border border-primary/20' : 'bg-white/5 text-white/40 border border-white/10 hover:bg-white/10 hover:text-white'}`}
                  >
                    {f.replace('_', ' ')}
                  </button>
                ))}
              </div>

              {/* Advanced Search Toggle Button */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
                  className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 flex items-center gap-1.5 border shrink-0 ${
                    showAdvancedSearch 
                      ? 'bg-primary text-black border-primary shadow-[0_0_15px_rgba(102,252,241,0.45)] font-black' 
                      : 'bg-white/5 text-white/70 border-white/10 hover:bg-white/10'
                  }`}
                  title="Toggle Advanced Search Filters"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>Advanced Filters</span>
                </button>
              </div>

              {/* A/B Test Group Visual Pill Badge */}
              <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border shrink-0 flex items-center gap-1.5 transition-all duration-300 ${
                abGroup === 'B' 
                  ? 'bg-purple-500/10 text-purple-400 border-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.15)]' 
                  : 'bg-pink-500/10 text-pink-400 border-pink-500/20 shadow-[0_0_15px_rgba(236,72,153,0.15)]'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${abGroup === 'B' ? 'bg-purple-400 animate-pulse' : 'bg-pink-400 animate-pulse'}`} />
                {abGroup === 'B' ? 'B: Interaction Priority' : 'A: Synergy Mode'}
              </div>
            </div>

            {/* Advanced Search Form Panel */}
            {showAdvancedSearch && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-xl space-y-6 relative overflow-hidden text-left"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 pointer-events-none" />
                
                <div className="flex flex-wrap justify-between items-center gap-4 border-b border-white/5 pb-3">
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white flex items-center gap-2">
                    <SlidersHorizontal className="w-4 h-4 text-primary" /> Advanced Search Filters
                  </h3>
                  
                  {/* Status Badge */}
                  {userRole === 'creator' || userTier === 'vip' || userTier === 'master' ? (
                    <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[8px] font-black uppercase tracking-widest rounded-lg shadow-sm">
                      ✨ FREE UNLIMITED SEARCHES (Active VIP/Creator Tier)
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-[8px] font-black uppercase tracking-widest rounded-lg shadow-sm">
                      ⚡ COST: 250 XP per search (Available: {searchXpBalance ?? 0} XP)
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs font-semibold">
                  {/* Age Filter */}
                  <div className="space-y-1.5">
                    <label className="text-[9px] uppercase tracking-widest font-black text-white/40">Age Range (Years)</label>
                    <div className="flex gap-2">
                      <input 
                        type="number" 
                        placeholder="Min" 
                        value={minAge} 
                        onChange={(e) => setMinAge(e.target.value)}
                        className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-white placeholder-white/20 text-xs focus:border-primary focus:outline-none"
                      />
                      <input 
                        type="number" 
                        placeholder="Max" 
                        value={maxAge} 
                        onChange={(e) => setMaxAge(e.target.value)}
                        className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-white placeholder-white/20 text-xs focus:border-primary focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Height Filter */}
                  <div className="space-y-1.5">
                    <label className="text-[9px] uppercase tracking-widest font-black text-white/40">Height Range (cm)</label>
                    <div className="flex gap-2">
                      <input 
                        type="number" 
                        placeholder="Min" 
                        value={minHeight} 
                        onChange={(e) => setMinHeight(e.target.value)}
                        className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-white placeholder-white/20 text-xs focus:border-primary focus:outline-none"
                      />
                      <input 
                        type="number" 
                        placeholder="Max" 
                        value={maxHeight} 
                        onChange={(e) => setMaxHeight(e.target.value)}
                        className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-white placeholder-white/20 text-xs focus:border-primary focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Sex Preference */}
                  <div className="space-y-1.5">
                    <label className="text-[9px] uppercase tracking-widest font-black text-white/40">Sexual Preference</label>
                    <select 
                      value={sexualPreference} 
                      onChange={(e) => setSexualPreference(e.target.value)}
                      className="w-full px-3 py-2.5 bg-black border border-white/10 rounded-xl text-white text-xs focus:border-primary focus:outline-none"
                    >
                      <option value="All">All Preferences</option>
                      <option value="Straight">Straight</option>
                      <option value="Bisexual">Bisexual</option>
                      <option value="Lesbian">Lesbian</option>
                      <option value="Gay">Gay</option>
                    </select>
                  </div>

                  {/* Min Match Score */}
                  <div className="space-y-1.5">
                    <label className="text-[9px] uppercase tracking-widest font-black text-white/40">Min Vibe Level</label>
                    <select 
                      value={minMatchScore} 
                      onChange={(e) => setMinMatchScore(e.target.value)}
                      className="w-full px-3 py-2.5 bg-black border border-white/10 rounded-xl text-white text-xs focus:border-primary focus:outline-none"
                    >
                      <option value="">Any Vibe</option>
                      <option value="50">⚡ 50% or higher</option>
                      <option value="70">⚡ 70% or higher</option>
                      <option value="80">🏆 80% or higher (Inner Circle)</option>
                      <option value="90">🔮 90% or higher (Soulmate)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs font-semibold pt-2">
                  {/* Relationship Goal */}
                  <div className="space-y-1.5">
                    <label className="text-[9px] uppercase tracking-widest font-black text-white/40">Relationship Goal</label>
                    <select 
                      value={relationshipGoal} 
                      onChange={(e) => setRelationshipGoal(e.target.value)}
                      className="w-full px-3 py-2.5 bg-black border border-white/10 rounded-xl text-white text-xs focus:border-primary focus:outline-none"
                    >
                      <option value="All">All Goals</option>
                      <option value="Long term partner">Long-term partner</option>
                      <option value="Short term fun">Short-term fun</option>
                      <option value="Casual">Casual</option>
                      <option value="Open to explore">Open to explore</option>
                    </select>
                  </div>

                  {/* Relationship Type */}
                  <div className="space-y-1.5">
                    <label className="text-[9px] uppercase tracking-widest font-black text-white/40">Relationship Type</label>
                    <select 
                      value={relationshipType} 
                      onChange={(e) => setRelationshipType(e.target.value)}
                      className="w-full px-3 py-2.5 bg-black border border-white/10 rounded-xl text-white text-xs focus:border-primary focus:outline-none"
                    >
                      <option value="All">All Types</option>
                      <option value="Monogamous">Monogamous</option>
                      <option value="Non-monogamous">Non-monogamous</option>
                      <option value="Polyamorous">Polyamorous</option>
                      <option value="Open to Explore">Open to explore</option>
                    </select>
                  </div>

                  {/* Location Filtering */}
                  <div className="space-y-1.5">
                    <label className="text-[9px] uppercase tracking-widest font-black text-white/40">Location Constraint</label>
                    <select 
                      value={locationType} 
                      onChange={(e) => setLocationType(e.target.value)}
                      className="w-full px-3 py-2.5 bg-black border border-white/10 rounded-xl text-white text-xs focus:border-primary focus:outline-none"
                    >
                      <option value="All">Any Location</option>
                      <option value="Current">Match Current Location</option>
                      <option value="Origins">Match Native Town / Origins</option>
                    </select>
                  </div>

                  {/* Relationship Level */}
                  <div className="space-y-1.5">
                    <label className="text-[9px] uppercase tracking-widest font-black text-white/40">Relationship Status</label>
                    <select 
                      value={relationshipLevel} 
                      onChange={(e) => setRelationshipLevel(e.target.value)}
                      className="w-full px-3 py-2.5 bg-black border border-white/10 rounded-xl text-white text-xs focus:border-primary focus:outline-none"
                    >
                      <option value="All">All Connections</option>
                      <option value="strangers">Strangers</option>
                      <option value="friendly">Friendly (Level 3+)</option>
                      <option value="close friend">Close Friends (Level 4+)</option>
                    </select>
                  </div>
                </div>

                {/* Actions Row */}
                <div className="flex justify-between items-center pt-4 border-t border-white/5">
                  <div className="text-[10px] text-white/40 uppercase font-black tracking-widest">
                    {searchResults !== null && `Found ${searchResults.length} connections`}
                  </div>
                  
                  <div className="flex gap-3">
                    {searchResults !== null && (
                      <button 
                        onClick={handleResetSearch}
                        className="px-5 py-2 rounded-xl bg-white/5 border border-white/10 text-white/70 text-[9px] font-black uppercase tracking-widest hover:bg-white/10 active:scale-95 transition cursor-pointer"
                      >
                        Reset Results
                      </button>
                    )}
                    <button 
                      onClick={handleTriggerSearchClick}
                      disabled={isSearching}
                      className="px-6 py-2.5 bg-[#00fbfb] text-black border border-[#00fbfb] shadow-[0_0_15px_rgba(0,251,251,0.25)] rounded-xl text-[9px] font-black uppercase tracking-widest hover:brightness-110 transition duration-300 flex items-center gap-1.5 active:scale-95 cursor-pointer"
                    >
                      {isSearching ? 'Searching...' : 'Apply Filters'}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Confirm Advanced Search XP Deduction Modal */}
            {showConfirmSearchModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md">
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="max-w-md w-full p-6 rounded-3xl border border-yellow-500/30 bg-[#0F0F1A]/95 shadow-[0_20px_50px_rgba(234,179,8,0.15)] text-center flex flex-col items-center space-y-4"
                >
                  <div className="w-12 h-12 rounded-full bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center text-yellow-400 shadow-[0_0_15px_rgba(234,179,8,0.2)] animate-bounce">
                    <Zap className="w-6 h-6 fill-yellow-400" />
                  </div>
                  <h3 className="text-sm font-black uppercase tracking-widest text-white">Confirm Advanced Search</h3>
                  <p className="text-xs text-white/70 max-w-xs leading-relaxed uppercase tracking-wider font-black">
                    Executing this advanced search will deduct <span className="text-yellow-400">250 XP</span> from your profile balance.
                  </p>
                  <div className="px-4 py-2 bg-white/5 border border-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white/60">
                    Your Current Balance: {searchXpBalance ?? 0} XP
                  </div>
                  <div className="flex gap-3 w-full pt-2">
                    <button
                      onClick={executeSearch}
                      className="flex-1 py-2.5 rounded-xl bg-yellow-500 text-black font-black text-[10px] uppercase tracking-widest shadow hover:brightness-110 active:scale-95 transition cursor-pointer"
                    >
                      Deduct & Search
                    </button>
                    <button
                      onClick={() => setShowConfirmSearchModal(false)}
                      className="flex-1 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/70 font-semibold text-[10px] uppercase tracking-widest hover:bg-white/10 active:scale-95 transition cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
 
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
                        <div 
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/profile/${post.creator_id}`);
                          }}
                          className="w-10 h-10 rounded-2xl bg-white/10 border border-white/10 overflow-hidden shadow-inner relative cursor-pointer hover:border-primary/40 transition"
                          title="View Profile Details"
                        >
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
                            <p 
                              onClick={(e) => {
                                  e.stopPropagation();
                                  router.push(`/profile/${post.creator_id}`);
                              }}
                              className="font-black text-sm tracking-tight hover:text-primary transition cursor-pointer"
                              title="View Profile Details"
                            >
                              @{post.creator}
                            </p>
                            <span className="text-[9px] font-bold text-yellow-500 bg-yellow-500/10 px-1.5 py-0.5 rounded border border-yellow-500/20 shrink-0">
                              ⭐ {post.ratingScore?.toFixed(2) || '10.00'}
                            </span>
                          </div>
                          <p className="text-[10px] text-muted-foreground opacity-60 flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5" /> {post.timestamp}
                          </p>
                          <ProvenanceBadge
                            level={((post as any).provenance_level as ProvenanceLevel) || 'genuine'}
                            creatorName={post.creator}
                            size="sm"
                          />
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            setReportingContent({ id: post.id, type: 'platform_content' }); 
                          }} 
                          className="p-1.5 bg-white/5 hover:bg-[#dc143c]/20 text-white/40 hover:text-[#dc143c] rounded-full transition-colors group/report"
                          title="Report Post"
                        >
                          <Flag className="w-3 h-3 group-hover/report:fill-current" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="relative mx-1.5">
                      {/* Match percentage badge overlay */}
                      <div className="absolute top-3 right-3 z-30">
                        <div className="relative group/tooltip">
                          <div className="px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-tighter flex items-center gap-1.5 bg-black/75 backdrop-blur-md text-primary border border-primary/20 hover:bg-black/90 transition cursor-help shadow-lg">
                            <Zap className="w-2.5 h-2.5 fill-current animate-pulse text-primary" />
                            {post.matchScore}% Synergy
                          </div>
                          
                          {/* Tooltip breakdown */}
                          {post.matchResult?.explanation && (
                            <div className="absolute top-full right-0 mt-2 w-72 p-4 bg-black/95 backdrop-blur-2xl border border-white/15 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] opacity-0 pointer-events-none group-hover/tooltip:opacity-100 transition-opacity duration-300 z-50 text-left font-sans font-medium">
                              <div className="flex justify-between items-center border-b border-white/5 pb-2 mb-2">
                                <span className="text-[10px] font-black uppercase tracking-wider text-white">Synergy Breakdown</span>
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

                      {/* Main media element */}
                      <div className="relative aspect-[3/4] overflow-hidden rounded-2xl border border-white/5 shadow-2xl bg-black/40">
                        {post.locked ? (
                          <>
                            {/* Teaser Content */}
                            {post.teaser_type === 'main_photo' && (
                              <img 
                                src={post.image} 
                                alt="Teaser Preview" 
                                className="w-full h-full object-cover group-hover:scale-105 transition duration-[1.2s] ease-[cubic-bezier(0.32,0.72,0,1)]"
                              />
                            )}
                            {post.teaser_type === 'video_clip' && (
                              <video 
                                src={`${post.image}#t=${post.video_start_time},${Number(post.video_start_time) + 5}`}
                                autoPlay 
                                loop 
                                muted 
                                playsInline 
                                className="w-full h-full object-cover group-hover:scale-105 transition duration-[1.2s] ease-[cubic-bezier(0.32,0.72,0,1)]"
                              />
                            )}
                            {post.teaser_type === 'custom' && post.thumbnail_url && (
                              post.thumbnail_type === 'video' ? (
                                <video 
                                  src={post.thumbnail_url} 
                                  autoPlay 
                                  loop 
                                  muted 
                                  playsInline 
                                  className="w-full h-full object-cover group-hover:scale-105 transition duration-[1.2s] ease-[cubic-bezier(0.32,0.72,0,1)]"
                                />
                              ) : (
                                <img 
                                  src={post.thumbnail_url} 
                                  alt="Teaser Preview" 
                                  className="w-full h-full object-cover group-hover:scale-105 transition duration-[1.2s] ease-[cubic-bezier(0.32,0.72,0,1)]"
                                />
                              )
                            )}
                            {(post.teaser_type === 'none' || !post.teaser_type) && (
                              <BlurredFaceImage
                                src={post.image}
                                alt="Content"
                                sharedScore={post.matchScore}
                                isEnabledByOwner={post.face_blur_active}
                                faceCoordinates={post.avatar_face_coordinates || { x: 0.5, y: 0.4, r: 0.22 }}
                                className="w-full h-full"
                                imgClassName="w-full h-full blur-3xl opacity-30 grayscale transition duration-700"
                              />
                            )}
 
                            {/* Gated Lock Screen Overlay */}
                            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/75 backdrop-blur-[12px] p-6 text-center border border-white/5 animate-fade-in">
                              <div className="w-12 h-12 bg-white/[0.03] border border-white/10 rounded-2xl flex items-center justify-center mb-3 shadow-inner">
                                <Lock className="w-5 h-5 text-primary drop-shadow-[0_0_10px_rgba(102,252,241,0.4)] animate-pulse" />
                              </div>
                              <h3 className="text-xs font-black mb-1 tracking-wider uppercase text-white">
                                {post.type === 'ppv' ? 'Pay-Per-View Content' : 'Tier Restricted Content'}
                              </h3>
                              <p className="text-[8px] text-white/40 mb-4 max-w-[180px] uppercase leading-relaxed font-black tracking-widest">
                                {post.type === 'ppv' ? 'Purchase to unlock this exclusive clip' : `Gated for ${post.type} tier sponsors`}
                              </p>
                              {post.type === 'ppv' ? (
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleUnlockPpv(post.id);
                                  }}
                                  className="px-4 py-2 bg-primary text-black text-[9px] font-black uppercase tracking-widest rounded-xl hover:shadow-[0_0_15px_rgba(102,252,241,0.4)] transition duration-300 scale-100 active:scale-95 cursor-pointer"
                                >
                                  Unlock Post ($4.99)
                                </button>
                              ) : (
                                <button className="px-4 py-2 bg-primary text-black text-[9px] font-black uppercase tracking-widest rounded-xl hover:shadow-[0_0_15px_rgba(102,252,241,0.4)] transition duration-300">
                                  Upgrade & Unlock
                                </button>
                              )}
                            </div>
                          </>
                        ) : (
                          // Unlocked state (regular full view)
                          <BlurredFaceImage
                            src={post.image}
                            alt="Content"
                            sharedScore={post.matchScore}
                            isEnabledByOwner={post.face_blur_active}
                            faceCoordinates={post.avatar_face_coordinates || { x: 0.5, y: 0.4, r: 0.22 }}
                            className="w-full h-full"
                            imgClassName="group-hover:scale-105 transition duration-[1.2s] ease-[cubic-bezier(0.32,0.72,0,1)]"
                          />
                        )}
                        
                        {/* Media Type Overlay Badge */}
                        {post.media_type && (
                          <div className="absolute top-3 left-3 z-30 flex items-center gap-1.5 px-2.5 py-1 bg-black/70 backdrop-blur-md text-white/90 border border-white/10 rounded-xl text-[8px] font-black uppercase tracking-wider shadow-md select-none">
                            {post.media_type === 'video' && (
                              <>
                                <Play className="w-2.5 h-2.5 fill-current text-primary" />
                                <span>Video {post.video_duration && `• ${post.video_duration}`}</span>
                              </>
                            )}
                            {post.media_type === 'album' && (
                              <>
                                <Layers className="w-2.5 h-2.5 text-yellow-500 animate-pulse" />
                                <span className="max-w-[120px] truncate">
                                  Album {post.album_name ? `: ${post.album_name}` : ''} {post.album_count && `• ${post.album_count} Photos`}
                                </span>
                              </>
                            )}
                            {post.media_type === 'photo' && (
                              <>
                                <Camera className="w-2.5 h-2.5 text-accent" />
                                <span>Photo</span>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="pt-4 px-2">
                      <p className="text-white/80 text-sm mb-4 leading-relaxed font-medium">"{post.content}"</p>
                      <div className="flex items-center justify-between text-muted-foreground border-t border-white/5 pt-4">
                        <div className="flex gap-6">
                          <button 
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setOptimisticLikes(prev => ({ ...prev, [post.id]: !prev[post.id] }));
                            }}
                            className={cn(
                              "flex items-center gap-2 transition group/btn",
                              optimisticLikes[post.id] ? "text-primary" : "hover:text-primary"
                            )}
                          >
                            <Heart className={cn(
                              "w-5 h-5 transition",
                              optimisticLikes[post.id] ? "fill-current group-hover/btn:scale-110" : "group-hover/btn:scale-110"
                            )} /> 
                            <span className="text-[10px] font-black">
                              {124 + (optimisticLikes[post.id] ? 1 : 0)}
                            </span>
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
