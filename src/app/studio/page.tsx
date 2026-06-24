'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Video, Upload, LayoutGrid, BarChart3, Settings, Zap, 
  Play, Image as ImageIcon, Plus, Crown, ShieldAlert, X, 
  Tv, Sparkles, MessageSquare, ListOrdered, ShieldCheck, 
  Volume2, Users, Compass, Activity, MapPin, Send, Check,
  SlidersHorizontal, Globe, DollarSign, Phone, Lock, Shield, Loader2, Calendar, Inbox,
  Eye, EyeOff
} from 'lucide-react';
import UploadSafetyNotice from '@/components/UploadSafetyNotice';
import { calculateMatch, type UserProfile, type MatchResult } from '@/lib/match-engine';
import { type ArchetypeId, type MoodId, type PassionId } from '@/lib/constants';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import CreatorGoalProgress, { type CreatorGoal } from '@/components/CreatorGoalProgress';
import CreatorOrdersPanel from '@/components/CreatorOrdersPanel';
import ConfigPanel from '@/components/AIAssistant/ConfigPanel';
import BlurredFaceImage from '@/components/BlurredFaceImage';

// Simulated Creator Profile (Elena)
const CREATOR_PROFILE: UserProfile = {
  gender: 'Female',
  location: 'San Francisco',
  origins: 'San Francisco',
  hobbies: ['Fitness', 'Music', 'Traveling'],
  relationshipGoal: 'Short-term',
  relationshipType: 'Monogamous',
  sexualPreferences: ['Heterosexual'],
  familyGoals: 'Want children',
  archetype: 'dreamer' as ArchetypeId,
  moods: ['flirty_playful', 'exclusive_vip'] as MoodId[],
  corePassion: 'fitness' as PassionId,
  age: 26,
  isKycVerified: true,
  lastActiveAt: new Date().toISOString(),
  engagementScore: 95,
  lifestyle: {
    workout: 'Often',
    traveling: 'Monthly',
    partying: 'Sometimes',
    'healthy eating': 'Every Day',
    socializing: 'Often',
    reading: 'Weekly',
    sleep: '6-7 Hours',
    smoking: 'Never',
    drinking: 'Socially',
    'social media': 'Moderate',
    'pet lover': 'Dog Person',
    'morning/night': 'Night Owl'
  }
};

// Simulated Audience (Members viewing the stream)
const AUDIENCE_MEMBERS = [
  {
    id: 'alex_n',
    name: 'Alex_N',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80',
    gender: 'Male',
    location: 'San Francisco',
    origins: 'San Francisco',
    hobbies: ['Fitness', 'Tech', 'Traveler'],
    relationshipGoal: 'Short-term',
    relationshipType: 'Monogamous',
    sexualPreferences: ['Heterosexual'],
    familyGoals: 'Want children',
    archetype: 'caregiver' as ArchetypeId, // Caregiver ↔ Dreamer = 0.90!
    moods: ['flirty_playful', 'exclusive_vip'] as MoodId[],
    corePassion: 'fitness' as PassionId,
    age: 28,
    isKycVerified: true,
    lastActiveAt: new Date().toISOString(),
    engagementScore: 92,
    lifestyle: {
      workout: 'Often',
      traveling: 'Monthly',
      partying: 'Sometimes',
      'healthy eating': 'Every Day',
      socializing: 'Often',
      reading: 'Weekly',
      sleep: '6-7 Hours',
      smoking: 'Never',
      drinking: 'Socially',
      'social media': 'Moderate',
      'pet lover': 'Dog Person',
      'morning/night': 'Night Owl'
    }
  },
  {
    id: 'sofia_v',
    name: 'Sofia_V',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&q=80',
    gender: 'Female',
    location: 'San Jose',
    origins: 'San Jose',
    hobbies: ['Tech', 'Gaming', 'Art'],
    relationshipGoal: 'Open to possibilities',
    relationshipType: 'Monogamous',
    sexualPreferences: ['Heterosexual', 'Bisexual'],
    familyGoals: 'Open to children',
    archetype: 'explorer' as ArchetypeId, // Explorer ↔ Dreamer = 0.85!
    moods: ['deep_intimate', 'creative_showcase'] as MoodId[],
    corePassion: 'art' as PassionId,
    age: 27,
    isKycVerified: true,
    lastActiveAt: new Date().toISOString(),
    engagementScore: 88,
    lifestyle: {
      workout: 'Sometimes',
      traveling: 'Every Week',
      partying: 'Often',
      'healthy eating': 'Sometimes',
      socializing: 'Every Day',
      reading: 'Monthly',
      sleep: '8+ Hours',
      smoking: 'Never',
      drinking: 'Socially',
      'social media': 'Heavy User',
      'pet lover': 'Cat Person',
      'morning/night': 'Balanced'
    }
  },
  {
    id: 'marcus_x',
    name: 'Marcus_X',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&q=80',
    gender: 'Male',
    location: 'Los Angeles',
    origins: 'Los Angeles',
    hobbies: ['Music', 'Yoga', 'Fashion'],
    relationshipGoal: 'Casual',
    relationshipType: 'Monogamous',
    sexualPreferences: ['Heterosexual'],
    familyGoals: "Don't want children",
    archetype: 'rebel' as ArchetypeId, // Rebel ↔ Dreamer = 0.72!
    moods: ['flirty_playful', 'party_dance'] as MoodId[],
    corePassion: 'music' as PassionId,
    age: 24,
    isKycVerified: false,
    lastActiveAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    engagementScore: 60,
    lifestyle: {
      workout: 'Sometimes',
      traveling: 'Yearly',
      partying: 'Every Weekend',
      'healthy eating': 'Sometimes',
      socializing: 'Often',
      reading: 'Never',
      sleep: '6-7 Hours',
      smoking: 'Socially',
      drinking: 'Regularly',
      'social media': 'Heavy User',
      'pet lover': 'None',
      'morning/night': 'Night Owl'
    }
  },
  {
    id: 'tom_b',
    name: 'Tom_B',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=800&q=80',
    gender: 'Male',
    location: 'San Francisco',
    origins: 'San Francisco',
    hobbies: ['Tech', 'Outdoors'],
    relationshipGoal: 'Long-term',
    relationshipType: 'Polyamorous', // Blocker match!
    sexualPreferences: ['Gay'],
    familyGoals: 'Want children',
    archetype: 'protector' as ArchetypeId,
    moods: ['deep_intimate'] as MoodId[],
    corePassion: 'career' as PassionId,
    age: 30,
    isKycVerified: true,
    lastActiveAt: new Date().toISOString(),
    engagementScore: 90,
    lifestyle: {
      workout: 'Every Day',
      traveling: 'Yearly',
      partying: 'Never',
      'healthy eating': 'Every Day',
      socializing: 'Sometimes',
      reading: 'Daily',
      sleep: '8+ Hours',
      smoking: 'Never',
      drinking: 'Never',
      'social media': 'Never',
      'pet lover': 'Dog Person',
      'morning/night': 'Early Bird'
    }
  }
];

class CreatorParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
  size: number;
  emoji: string;
  rotation: number;
  rotationSpeed: number;

  constructor(canvasWidth: number, canvasHeight: number, emoji: string) {
    this.x = canvasWidth / 2 + (Math.random() - 0.5) * 60;
    this.y = canvasHeight - 20;
    this.vx = (Math.random() - 0.5) * 5;
    this.vy = -Math.random() * 4 - 4;
    this.alpha = 1;
    this.size = Math.random() * 10 + 15;
    this.emoji = emoji;
    this.rotation = Math.random() * 360;
    this.rotationSpeed = (Math.random() - 0.5) * 4;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.vy += 0.04;
    this.alpha -= 0.015;
    this.rotation += this.rotationSpeed;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.globalAlpha = Math.max(this.alpha, 0);
    ctx.translate(this.x, this.y);
    ctx.rotate((this.rotation * Math.PI) / 180);
    ctx.font = `${this.size}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.emoji, 0, 0);
    ctx.restore();
  }
}

export default function CreatorStudio() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'content' | 'live' | 'analytics' | 'settings' | 'goals' | 'safety_ops' | 'orders' | 'consent_inbox'>('content');
  const [customRequestPermission, setCustomRequestPermission] = useState<'anyone' | 'restricted'>('anyone');
  const [isUploading, setIsUploading] = useState(false);

  // Registered Users lookup for co-performance tagging
  const REGISTERED_USERS = [
    { id: 'u1', name: 'Marcus L.', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&q=80' },
    { id: 'u2', name: 'Sofia V.', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&q=80' },
    { id: 'u3', name: 'Jordan P.', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80' },
    { id: 'u4', name: 'Alex R.', avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&q=80' },
  ];

  // Content Upload Co-Performer States
  const [hasCoPerformers, setHasCoPerformers] = useState(false);
  const [coPerformerType, setCoPerformerType] = useState<'registered' | 'external'>('registered');
  const [selectedRegisteredUser, setSelectedRegisteredUser] = useState('Marcus L.');
  const [externalPerformerName, setExternalPerformerName] = useState('');
  const [externalConsentFile, setExternalConsentFile] = useState<string>('');
  const [addedCoPerformers, setAddedCoPerformers] = useState<any[]>([]);

  // Live Session Co-Performer States
  const [hasLiveCoPerformers, setHasLiveCoPerformers] = useState(false);
  const [liveCoPerformerType, setLiveCoPerformerType] = useState<'registered' | 'external'>('registered');
  const [selectedLiveRegisteredUser, setSelectedLiveRegisteredUser] = useState('Marcus L.');
  const [externalLivePerformerName, setExternalLivePerformerName] = useState('');
  const [externalLiveConsentFile, setExternalLiveConsentFile] = useState<string>('');
  const [addedLiveCoPerformers, setAddedLiveCoPerformers] = useState<any[]>([]);

  // Received Depict Consent Requests
  const [receivedConsents, setReceivedConsents] = useState<any[]>([
    {
      id: 'req1',
      creatorName: 'Marcus L.',
      creatorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&q=80',
      type: 'VIP Post',
      title: 'Co-op gym training highlights',
      status: 'pending',
      createdAt: '2026-06-13T10:00:00Z',
    },
    {
      id: 'req2',
      creatorName: 'Sofia V.',
      creatorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&q=80',
      type: 'Live Session',
      title: 'Sunset Partner Yoga',
      status: 'pending',
      createdAt: '2026-06-13T11:30:00Z',
    },
  ]);

  // Content Upload States
  const [uploadedPosts, setUploadedPosts] = useState<any[]>([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);
  const [postTitle, setPostTitle] = useState('');
  const [postDesc, setPostDesc] = useState('');
  const [postTier, setPostTier] = useState<'vip' | 'master'>('vip');
  const [postMediaUrl, setPostMediaUrl] = useState('');
  const [postTags, setPostTags] = useState('');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [allPendingPosts, setAllPendingPosts] = useState<any[]>([]);
  const [isModerating, setIsModerating] = useState<string | null>(null);

  const getSimulatedModerationStatus = (postId: string, dbStatus?: string) => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`sim_moderation_status_${postId}`);
      if (saved) return saved;
    }
    return dbStatus || 'pending';
  };

  const loadCreatorPosts = async (creatorId: string) => {
    try {
      setIsLoadingPosts(true);
      const { data, error } = await supabase
        .from('platform_content')
        .select('*')
        .eq('creator_id', creatorId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const enriched = (data || []).map((post: any) => ({
        ...post,
        moderation_status: getSimulatedModerationStatus(post.id, post.moderation_status)
      }));
      setUploadedPosts(enriched);
    } catch (err) {
      console.error('Error loading creator posts:', err);
    } finally {
      setIsLoadingPosts(false);
    }
  };

  const loadAllPendingPosts = async () => {
    try {
      // Attempt to query with DB filter first
      let { data, error } = await supabase
        .from('platform_content')
        .select('*, creator_profile:profiles!platform_content_creator_id_fkey(*)')
        .eq('moderation_status', 'pending')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('DB filter by moderation_status failed, falling back to in-memory filter:', error);
        // Fallback: load all posts and filter in memory
        const { data: allData, error: allErr } = await supabase
          .from('platform_content')
          .select('*, creator_profile:profiles!platform_content_creator_id_fkey(*)')
          .order('created_at', { ascending: false });

        if (allErr) throw allErr;
        
        data = (allData || []).map((post: any) => ({
          ...post,
          moderation_status: getSimulatedModerationStatus(post.id, post.moderation_status)
        })).filter((post: any) => post.moderation_status === 'pending');
      } else {
        // Enforce simulation overrides even if DB query succeeded
        data = (data || []).map((post: any) => ({
          ...post,
          moderation_status: getSimulatedModerationStatus(post.id, post.moderation_status)
        })).filter((post: any) => post.moderation_status === 'pending');
      }

      setAllPendingPosts(data || []);
    } catch (err) {
      console.error('Error loading pending posts:', err);
    }
  };

  const handleModeratePost = async (postId: string, action: 'approved' | 'rejected') => {
    setIsModerating(postId);
    try {
      // 1. Try to update in database
      const { error } = await supabase
        .from('platform_content')
        .update({ moderation_status: action })
        .eq('id', postId);

      if (error) {
        console.warn('DB update of moderation_status failed, falling back to localStorage simulation:', error);
      }
      
      // 2. Always persist in localStorage to override/simulate
      if (typeof window !== 'undefined') {
        localStorage.setItem(`sim_moderation_status_${postId}`, action);
      }
      
      if (profile) {
        await loadCreatorPosts(profile.id);
      }
      await loadAllPendingPosts();
    } catch (err: any) {
      console.error('Moderation error:', err);
      // Fallback in case of absolute failure
      if (typeof window !== 'undefined') {
        localStorage.setItem(`sim_moderation_status_${postId}`, action);
      }
      if (profile) {
        await loadCreatorPosts(profile.id);
      }
      await loadAllPendingPosts();
    } finally {
      setIsModerating(null);
    }
  };

  const handleUploadPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    if (!postTitle.trim() || !postMediaUrl.trim()) {
      setUploadError('Title and Media URL are required.');
      return;
    }

    setUploadError(null);
    setIsUploading(true);
    setUploadSuccess(false);

    try {
      const parsedTags = postTags
        .split(',')
        .map(t => t.trim())
        .filter(t => t.length > 0);

      // Serialize co-performers inside description if toggle is enabled
      const finalDesc = hasCoPerformers && addedCoPerformers.length > 0
        ? `${postDesc.trim()}\n\n===CO_PERFORMERS===\n${JSON.stringify(addedCoPerformers)}`
        : postDesc.trim();

      const res = await fetch('/api/content/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          creatorId: profile.id,
          title: postTitle.trim(),
          description: finalDesc,
          mediaUrl: postMediaUrl.trim(),
          mediaType: postMediaUrl.toLowerCase().endsWith('.mp4') ? 'video' : 'image',
          tier: postTier,
          tags: parsedTags
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || data.error || 'Failed to upload.');
      }

      setUploadSuccess(true);
      setPostTitle('');
      setPostDesc('');
      setPostMediaUrl('');
      setPostTags('');
      setAddedCoPerformers([]);
      setHasCoPerformers(false);
      
      await loadCreatorPosts(profile.id);
      await loadAllPendingPosts();
    } catch (err: any) {
      setUploadError(err.message || 'An error occurred during upload.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddCoPerformer = () => {
    if (coPerformerType === 'registered') {
      const user = REGISTERED_USERS.find(u => u.name === selectedRegisteredUser);
      if (!user) return;
      if (addedCoPerformers.some(p => p.name === user.name)) return;
      setAddedCoPerformers(prev => [...prev, {
        name: user.name,
        type: 'registered',
        userId: user.id,
        avatar: user.avatar,
        status: 'pending'
      }]);
    } else {
      if (!externalPerformerName.trim()) return;
      if (!externalConsentFile) {
        alert('Please attach/upload a signed consent document.');
        return;
      }
      setAddedCoPerformers(prev => [...prev, {
        name: externalPerformerName.trim(),
        type: 'external',
        status: 'approved',
        consentDocumentUrl: externalConsentFile
      }]);
      setExternalPerformerName('');
      setExternalConsentFile('');
    }
  };

  const handleRemoveCoPerformer = (idx: number) => {
    setAddedCoPerformers(prev => prev.filter((_, i) => i !== idx));
  };

  const handleAddLiveCoPerformer = () => {
    if (liveCoPerformerType === 'registered') {
      const user = REGISTERED_USERS.find(u => u.name === selectedLiveRegisteredUser);
      if (!user) return;
      if (addedLiveCoPerformers.some(p => p.name === user.name)) return;
      setAddedLiveCoPerformers(prev => [...prev, {
        name: user.name,
        type: 'registered',
        userId: user.id,
        avatar: user.avatar,
        status: 'pending'
      }]);
    } else {
      if (!externalLivePerformerName.trim()) return;
      if (!externalLiveConsentFile) {
        alert('Please attach/upload a signed consent document.');
        return;
      }
      setAddedLiveCoPerformers(prev => [...prev, {
        name: externalLivePerformerName.trim(),
        type: 'external',
        status: 'approved',
        consentDocumentUrl: externalLiveConsentFile
      }]);
      setExternalLivePerformerName('');
      setExternalLiveConsentFile('');
    }
  };

  const handleRemoveLiveCoPerformer = (idx: number) => {
    setAddedLiveCoPerformers(prev => prev.filter((_, i) => i !== idx));
  };

  const handleUpdateConsentRequest = (reqId: string, status: 'approved' | 'declined') => {
    setReceivedConsents(prev => prev.map(r => r.id === reqId ? { ...r, status } : r));
    const target = receivedConsents.find(r => r.id === reqId);
    if (target && status === 'approved') {
      setSuccessToast(`Consent request from ${target.creatorName} approved successfully!`);
      setTimeout(() => setSuccessToast(null), 3000);
    }
  };

  const handleSimulateConsentApprove = async (postId: string, performerName: string) => {
    const targetPost = uploadedPosts.find(p => p.id === postId);
    if (!targetPost) return;
    const parts = targetPost.description?.split('\n\n===CO_PERFORMERS===\n');
    if (!parts?.[1]) return;
    let coPerformers = [];
    try {
      coPerformers = JSON.parse(parts[1]);
    } catch(e) { return; }
    const updated = coPerformers.map((p: any) => p.name === performerName ? { ...p, status: 'approved' } : p);
    const newDesc = `${parts[0]}\n\n===CO_PERFORMERS===\n${JSON.stringify(updated)}`;
    
    const { error } = await supabase
      .from('platform_content')
      .update({ description: newDesc })
      .eq('id', postId);
    if (error) {
      console.error(error);
      return;
    }
    if (profile) {
      await loadCreatorPosts(profile.id);
      await loadAllPendingPosts();
    }
    setSuccessToast(`Simulation: ${performerName} has granted depiction consent!`);
    setTimeout(() => setSuccessToast(null), 3000);
  };

  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Creator Settings State
  const [profile, setProfile] = useState<any>(null);
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Form Fields
  const [baseSubscriptionPrice, setBaseSubscriptionPrice] = useState<number>(0);
  const [ppvBaseRate, setPpvBaseRate] = useState<number>(0);
  const [privateCallPrice, setPrivateCallPrice] = useState<number>(0);
  const [geoRestrictionEnabled, setGeoRestrictionEnabled] = useState<boolean>(false);
  const [blockedCountries, setBlockedCountries] = useState<string>('');

  // AI Assistant Configurations State
  const [aiAgentActive, setAiAgentActive] = useState<boolean>(false);
  const [chatAutoEnabled, setChatAutoEnabled] = useState<boolean>(true);
  const [contentOpsEnabled, setContentOpsEnabled] = useState<boolean>(true);
  const [legalAuditEnabled, setLegalAuditEnabled] = useState<boolean>(true);
  const [digitalReplicaConsent, setDigitalReplicaConsent] = useState<string | null>(null);
  const [aiSuggestionStatus, setAiSuggestionStatus] = useState<string>('idle');
  const [isAiToggleSaving, setIsAiToggleSaving] = useState<boolean>(false);
  // Total confirmed matches — used to enforce the 30-match minimum for Auto-Chat
  const [creatorMatchCount, setCreatorMatchCount] = useState<number>(0);

  // Tax & Payout Fields (Financial Gateway)
  const [legalBusinessName, setLegalBusinessName] = useState<string>('');
  const [taxIdNumber, setTaxIdNumber] = useState<string>('');
  const [vatGstNumber, setVatGstNumber] = useState<string>('');

  // Google Calendar Sync State
  const [isCalendarConnected, setIsCalendarConnected] = useState<boolean>(false);
  const [calendarEmail, setCalendarEmail] = useState<string>('');
  const [isCheckingCalendar, setIsCheckingCalendar] = useState<boolean>(true);

  // Face Blur Settings State
  const [faceBlurActive, setFaceBlurActive] = useState<boolean>(false);
  const [faceBlurDefault, setFaceBlurDefault] = useState<boolean>(false);
  const [previewLevel, setPreviewLevel] = useState<'none' | 'stranger'>('none');

  // Crowdfunding Goals State
  const [goals, setGoals] = useState<CreatorGoal[]>([]);
  const [contributions, setContributions] = useState<any[]>([]);
  const [isLoadingGoals, setIsLoadingGoals] = useState(true);
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [newGoalDesc, setNewGoalDesc] = useState('');
  const [newGoalTarget, setNewGoalTarget] = useState('');
  const [isCreatingGoal, setIsCreatingGoal] = useState(false);
  const [goalError, setGoalError] = useState<string | null>(null);

  // Creator Analytics State
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState<boolean>(false);
  const [analyticsError, setAnalyticsError] = useState<string | null>(null);

  const loadAnalyticsData = async (creatorId: string) => {
    try {
      setIsLoadingAnalytics(true);
      setAnalyticsError(null);
      const res = await fetch(`/api/analytics/creator?creatorId=${creatorId}`);
      if (!res.ok) {
        throw new Error(`Failed to load analytics: ${res.statusText}`);
      }
      const data = await res.json();
      setAnalyticsData(data);
    } catch (err: any) {
      console.error('Error loading analytics:', err);
      setAnalyticsError(err.message || 'Failed to sync live insights');
    } finally {
      setIsLoadingAnalytics(false);
    }
  };

  // Event Scheduling State
  const [eventTitle, setEventTitle] = useState('');
  const [eventDesc, setEventDesc] = useState('');
  const [eventStart, setEventStart] = useState('');
  const [eventEnd, setEventEnd] = useState('');
  const [eventType, setEventType] = useState('public');
  const [isScheduling, setIsScheduling] = useState(false);

  // Suggestions for country blocking
  const SUGGESTED_COUNTRIES = ['US', 'FR', 'GB', 'CA', 'DE', 'CN', 'RU', 'IR'];

  const loadGoalsData = async (userId: string) => {
    try {
      setIsLoadingGoals(true);
      const { data: goalsData, error: gErr } = await supabase
        .from('creator_goals')
        .select('*')
        .eq('creator_id', userId)
        .order('created_at', { ascending: false });

      if (gErr) throw gErr;
      setGoals(goalsData || []);

      if (goalsData && goalsData.length > 0) {
        const goalIds = goalsData.map(g => g.id);
        const { data: contribsData, error: cErr } = await supabase
          .from('goal_contributions')
          .select(`
            *,
            contributor_profile:profiles!goal_contributions_contributor_id_fkey(username, display_name, avatar_url)
          `)
          .in('goal_id', goalIds)
          .order('created_at', { ascending: false });

        if (cErr) throw cErr;
        setContributions(contribsData || []);
      }
    } catch (err) {
      console.error('Error loading goals:', err);
    } finally {
      setIsLoadingGoals(false);
    }
  };

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalTitle || !newGoalTarget || !profile) return;
    const target = parseFloat(newGoalTarget);
    if (isNaN(target) || target <= 0) {
      setGoalError('Please enter a valid target amount.');
      return;
    }

    setIsCreatingGoal(true);
    setGoalError(null);
    try {
      const { data, error } = await supabase
        .from('creator_goals')
        .insert({
          creator_id: profile.id,
          title: newGoalTitle.trim(),
          description: newGoalDesc.trim() || null,
          target_amount: target,
          current_amount: 0.00,
          is_completed: false
        })
        .select()
        .single();

      if (error) throw error;

      setGoals(prev => [data, ...prev]);
      setNewGoalTitle('');
      setNewGoalDesc('');
      setNewGoalTarget('');
    } catch (err: any) {
      setGoalError(err.message || 'Failed to create goal.');
    } finally {
      setIsCreatingGoal(false);
    }
  };

  useEffect(() => {
    async function loadCreatorSettings() {
      try {
        setIsLoadingSettings(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
            
          if (profileData) {
            if (profileData.role !== 'creator') {
              router.push('/profile/member');
              return;
            }
            setProfile(profileData);
            setBaseSubscriptionPrice(Number(profileData.base_subscription_price || 0));
            setAiAgentActive(Boolean(profileData.ai_agent_active || false));
            setChatAutoEnabled(Boolean(profileData.chat_auto_enabled || false));
            setContentOpsEnabled(profileData.content_ops_enabled !== false); // default true
            setLegalAuditEnabled(profileData.legal_audit_enabled !== false); // default true
            setDigitalReplicaConsent(profileData.digital_replica_consent || null);
            setAiSuggestionStatus(profileData.ai_suggestion_status || 'idle');
            setFaceBlurActive(Boolean(profileData.face_blur_active || false));
            
            const privacy = profileData.privacy_settings || {};
            setPpvBaseRate(Number(privacy.ppv_base_rate || 0));
            setPrivateCallPrice(Number(privacy.private_call_rate || 0));
            setGeoRestrictionEnabled(Boolean(privacy.geo_restriction_enabled || false));
            setBlockedCountries(Array.isArray(privacy.blocked_countries) ? privacy.blocked_countries.join(', ') : '');
            setCustomRequestPermission(privacy.custom_request_permission || 'anyone');
            setFaceBlurDefault(Boolean(privacy.face_blur_default || false));

            // Tax & Payout Profile Init
            setLegalBusinessName(privacy.legal_business_name || '');
            setTaxIdNumber(privacy.tax_id_number || '');
            setVatGstNumber(privacy.vat_gst_number || '');
            
            // Load Calendar Status
            try {
              const calRes = await fetch('/api/integrations/calendar/status');
              if (calRes.ok) {
                const calData = await calRes.json();
                setIsCalendarConnected(calData.connected);
                setCalendarEmail(calData.email || '');
              }
            } catch (e) {
              console.error('Failed to load calendar status:', e);
            } finally {
              setIsCheckingCalendar(false);
            }

            // Load Goals
            loadGoalsData(user.id);
            // Load Posts & Moderation
            loadCreatorPosts(user.id);
            loadAllPendingPosts();
            // Load creator match count for AI Auto-Chat eligibility
            supabase
              .from('relationships')
              .select('id', { count: 'exact', head: true })
              .eq('user_id', user.id)
              .gt('gauge_score', 0)
              .then(({ count }) => setCreatorMatchCount(count ?? 0));
          }
        }
      } catch (err) {
        console.error('Error loading settings:', err);
      } finally {
        setIsLoadingSettings(false);
      }
    }
    loadCreatorSettings();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get('activeTab');
    if (tab && ['content', 'live', 'analytics', 'settings', 'goals', 'safety_ops', 'orders'].includes(tab)) {
      setActiveTab(tab as any);
    }
    const calConnected = params.get('calendarConnected');
    if (calConnected === 'true') {
      alert('Google Calendar linked successfully! Sync is now active.');
      // Clean up search parameters so alerts don't re-fire on reload
      const newUrl = window.location.pathname + '?activeTab=settings';
      window.history.replaceState({}, '', newUrl);
    }
    const calError = params.get('calendarError');
    if (calError) {
      alert(`Calendar Sync Error: ${calError}`);
      const newUrl = window.location.pathname + '?activeTab=settings';
      window.history.replaceState({}, '', newUrl);
    }
  }, []);

  const handleConnectCalendar = () => {
    window.location.href = `/api/integrations/calendar/auth?returnTo=${encodeURIComponent(window.location.pathname)}`;
  };

  const handleDisconnectCalendar = async () => {
    if (!confirm('Are you sure you want to disconnect your Google Calendar?')) return;
    try {
      const res = await fetch('/api/integrations/calendar/disconnect', { method: 'POST' });
      if (res.ok) {
        setIsCalendarConnected(false);
        setCalendarEmail('');
        alert('Google Calendar disconnected successfully.');
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to disconnect calendar.');
      }
    } catch (e) {
      console.error(e);
      alert('Network error disconnecting calendar.');
    }
  };

  useEffect(() => {
    if (activeTab === 'analytics' && profile?.id) {
      loadAnalyticsData(profile.id);
    }
  }, [activeTab, profile?.id]);

  const handleScheduleEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventTitle || !eventStart || !eventEnd || !profile) return;
    
    setIsScheduling(true);
    try {
      const res = await fetch('/api/integrations/calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: profile.id,
          action: 'create',
          title: eventTitle,
          description: eventDesc,
          startTime: new Date(eventStart).toISOString(),
          endTime: new Date(eventEnd).toISOString(),
          type: eventType
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create event');
      
      alert('Event scheduled successfully and pushed to calendar!');
      setEventTitle('');
      setEventDesc('');
      setEventStart('');
      setEventEnd('');
    } catch (err: any) {
      console.error('Error scheduling event:', err);
      alert(err.message || 'Failed to schedule event.');
    } finally {
      setIsScheduling(false);
    }
  };

  const toggleCountryChip = (code: string) => {
    const currentArray = blockedCountries
      .split(',')
      .map(c => c.trim().toUpperCase())
      .filter(Boolean);
    if (currentArray.includes(code)) {
      setBlockedCountries(currentArray.filter(c => c !== code).join(', '));
    } else {
      setBlockedCountries([...currentArray, code].join(', '));
    }
  };

  // Instant-save a single AI toggle field to Supabase (called on each toggle click)
  const handleAiToggleSave = async (field: string, value: boolean | string | null) => {
    if (!profile) return;
    setIsAiToggleSaving(true);
    try {
      await supabase
        .from('profiles')
        .update({ [field]: value })
        .eq('id', profile.id);
      setProfile((prev: any) => ({ ...prev, [field]: value }));
    } catch (err) {
      console.error('[AI Toggle] Failed to save:', field, err);
    } finally {
      setIsAiToggleSaving(false);
    }
  };

  const handleSaveSettings = async () => {
    if (!profile) return;
    setIsSavingSettings(true);
    setSaveSuccess(false);
    setSaveError(null);
    
    try {
      // Fetch latest privacy settings to avoid overwriting fields (like stripe_connect_id)
      const { data: latestProfile } = await supabase
        .from('profiles')
        .select('privacy_settings')
        .eq('id', profile.id)
        .single();
        
      const currentPrivacy = latestProfile?.privacy_settings || {};
      const updatedPrivacy = {
        ...currentPrivacy,
        ppv_base_rate: ppvBaseRate,
        private_call_rate: privateCallPrice,
        geo_restriction_enabled: geoRestrictionEnabled,
        blocked_countries: blockedCountries
          .split(',')
          .map(c => c.trim().toUpperCase())
          .filter(Boolean),
        legal_business_name: legalBusinessName,
        tax_id_number: taxIdNumber,
        vat_gst_number: vatGstNumber,
        custom_request_permission: customRequestPermission,
        face_blur_default: faceBlurDefault,
      };
      
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          base_subscription_price: baseSubscriptionPrice,
          privacy_settings: updatedPrivacy,
          ai_agent_active: aiAgentActive,
          chat_auto_enabled: chatAutoEnabled,
          content_ops_enabled: contentOpsEnabled,
          legal_audit_enabled: legalAuditEnabled,
          digital_replica_consent: digitalReplicaConsent,
          ai_suggestion_status: aiSuggestionStatus,
          face_blur_active: faceBlurActive,
        })
        .eq('id', profile.id);
        
      if (updateError) throw updateError;
      
      setProfile((prev: any) => ({
        ...prev,
        base_subscription_price: baseSubscriptionPrice,
        privacy_settings: updatedPrivacy,
        ai_agent_active: aiAgentActive,
        chat_auto_enabled: chatAutoEnabled,
        content_ops_enabled: contentOpsEnabled,
        legal_audit_enabled: legalAuditEnabled,
        digital_replica_consent: digitalReplicaConsent,
        ai_suggestion_status: aiSuggestionStatus,
        face_blur_active: faceBlurActive,
      }));
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      console.error('Error saving settings:', err);
      setSaveError(err.message || 'Failed to save settings.');
    } finally {
      setIsSavingSettings(false);
    }
  };

  // Broadcasting Dashboard State
  const [safetyGateAccepted, setSafetyGateAccepted] = useState(false);
  const [showSafetyNotice, setShowSafetyNotice] = useState(false);
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [interactionsLog, setInteractionsLog] = useState<Array<{ 
    id: string; 
    user: string; 
    text: string; 
    pts: number; 
    emoji: string;
    type?: 'tip' | 'chat';
  }>>([]);
  const [activeBreakdownViewerId, setActiveBreakdownViewerId] = useState<string | null>(null);
  
  // Interactive poll manager state
  const [poll, setPoll] = useState({
    question: 'Select next activity:',
    options: [
      { id: '1', text: 'Live Q&A Chat', votes: 14 },
      { id: '2', text: 'Share Private Album', votes: 8 },
      { id: '3', text: 'IRL Picnic poll', votes: 19 },
    ],
    isCustom: false
  });
  const [pollInputs, setPollInputs] = useState({ question: '', opt1: '', opt2: '', opt3: '' });

  // Privacy Shield setting: minimum compatibility required to comment
  const [minMatchThreshold, setMinMatchThreshold] = useState<number>(30);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<CreatorParticle[]>([]);
  const animationFrameRef = useRef<number | null>(null);

  // Canvas visualizer loop
  useEffect(() => {
    if (!isBroadcasting) {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      particlesRef.current = [];
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.parentElement?.clientWidth || 600;
      canvas.height = canvas.parentElement?.clientHeight || 340;
    };
    resize();
    window.addEventListener('resize', resize);

    let tick = 0;
    const drawLoop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      tick++;

      // Draw audio wave visualizer curves
      ctx.strokeStyle = 'rgba(255, 0, 127, 0.4)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let x = 0; x < canvas.width; x++) {
        const y = canvas.height / 2 + 
          Math.sin(x * 0.01 + tick * 0.05) * 25 * Math.sin(x * 0.002) +
          Math.sin(x * 0.03 + tick * 0.1) * 8;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      ctx.strokeStyle = 'rgba(0, 240, 255, 0.3)';
      ctx.beginPath();
      for (let x = 0; x < canvas.width; x++) {
        const y = canvas.height / 2 + 
          Math.cos(x * 0.008 + tick * 0.04) * 20 * Math.cos(x * 0.003) +
          Math.cos(x * 0.02 + tick * 0.08) * 6;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Update and draw flying emojis
      const particles = particlesRef.current;
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.update();
        p.draw(ctx);
        if (p.alpha <= 0) particles.splice(i, 1);
      }

      animationFrameRef.current = requestAnimationFrame(drawLoop);
    };
    drawLoop();

    return () => {
      window.removeEventListener('resize', resize);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isBroadcasting]);

  const channelRef = useRef<any>(null);

  // Initialize Supabase realtime broadcast subscription
  useEffect(() => {
    if (!isBroadcasting) {
      if (channelRef.current) {
        channelRef.current.send({
          type: 'broadcast',
          event: 'stream_status',
          payload: { isLive: false }
        });
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
      return;
    }

    const channelId = `stream_broadcast:${profile?.id || 'elena'}`;
    const channel = supabase.channel(channelId, {
      config: {
        broadcast: { self: false }
      }
    });

    channel
      .on('broadcast', { event: 'member_joined' }, () => {
        channel.send({
          type: 'broadcast',
          event: 'stream_status',
          payload: { isLive: true }
        });
        channel.send({
          type: 'broadcast',
          event: 'poll_created',
          payload: { question: poll.question, options: poll.options }
        });
      })
      .on('broadcast', { event: 'chat_message' }, ({ payload }) => {
        const viewer = AUDIENCE_MEMBERS.find(m => m.name === payload.user);
        let matchScore = 100;
        if (viewer) {
          const res = calculateMatch(viewer, CREATOR_PROFILE);
          matchScore = res.totalScore;
        }

        if (matchScore >= minMatchThreshold) {
          setInteractionsLog(prev => [
            { 
              id: Math.random().toString(), 
              user: payload.user, 
              text: `Message: "${payload.msg}"`, 
              pts: 0, 
              emoji: '💬',
              type: 'chat'
            },
            ...prev.slice(0, 15)
          ]);
        }
      })
      .on('broadcast', { event: 'tip_sent' }, ({ payload }) => {
        setInteractionsLog(prev => [
          {
            id: Math.random().toString(),
            user: payload.user,
            text: `Sent a ${payload.name}!`,
            pts: payload.cost,
            emoji: payload.emoji,
            type: 'tip'
          },
          ...prev.slice(0, 15)
        ]);

        const canvas = canvasRef.current;
        if (canvas) {
          for (let i = 0; i < 12; i++) {
            particlesRef.current.push(new CreatorParticle(canvas.width, canvas.height, payload.emoji));
          }
        }
      })
      .on('broadcast', { event: 'poll_voted' }, ({ payload }) => {
        setPoll(prev => {
          const updatedOptions = prev.options.map(opt => 
            opt.id === payload.optionId ? { ...opt, votes: opt.votes + 1 } : opt
          );
          
          channel.send({
            type: 'broadcast',
            event: 'poll_updated',
            payload: { options: updatedOptions }
          });

          return {
            ...prev,
            options: updatedOptions
          };
        });
      });

    channel.subscribe((status) => {
      console.log('CreatorStudio Realtime Sub:', status);
      if (status === 'SUBSCRIBED') {
        channel.send({
          type: 'broadcast',
          event: 'stream_status',
          payload: { isLive: true }
        });
      }
    });

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [isBroadcasting, minMatchThreshold, poll.question, poll.options, profile?.id]);

  const handleToggleBroadcast = async () => {
    const nextStatus = !isBroadcasting;
    try {
      const res = await fetch('/api/integrations/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: profile?.id || 'mock-user-id',
          action: nextStatus ? 'start' : 'stop'
        })
      });
      if (!res.ok) throw new Error('Failed to update live stream status');
      
      setIsBroadcasting(nextStatus);
      if (channelRef.current) {
        channelRef.current.send({
          type: 'broadcast',
          event: 'stream_status',
          payload: { isLive: nextStatus }
        });
      }
    } catch (err) {
      console.error('Error toggling stream:', err);
      alert('Could not synchronize live status with server. Try again.');
    }
  };

  const handleBroadcastPoll = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pollInputs.question || !pollInputs.opt1 || !pollInputs.opt2) return;

    const newOptions = [
      { id: '1', text: pollInputs.opt1, votes: 0 },
      { id: '2', text: pollInputs.opt2, votes: 0 },
      ...(pollInputs.opt3 ? [{ id: '3', text: pollInputs.opt3, votes: 0 }] : []),
    ];

    setPoll({
      question: pollInputs.question,
      options: newOptions,
      isCustom: true
    });
    setPollInputs({ question: '', opt1: '', opt2: '', opt3: '' });

    if (channelRef.current) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'poll_created',
        payload: { question: pollInputs.question, options: newOptions }
      });
    }
  };

  const handleAcceptSafety = () => {
    setSafetyGateAccepted(true);
    setShowSafetyNotice(false);
  };

  return (
    <div className="min-h-screen bg-transparent text-white pt-24 px-6 pb-12 relative">
      {/* Background glow */}
      <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-primary/5 blur-[150px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-12 relative z-10">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 text-left">
          <div>
            <h1 className="text-4xl font-black tracking-tighter flex items-center gap-4">
              <span className="w-2.5 h-10 bg-primary rounded-full shadow-[0_0_20px_rgba(255,0,127,0.5)]" />
              CREATOR STUDIO
            </h1>
            <p className="text-[10px] text-white/40 font-black uppercase tracking-[0.3em] mt-2">Manage your pulse, content, and interactive sessions.</p>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-3 bg-white/5 border border-white/10 px-6 py-3 rounded-2xl hover:bg-white/10 transition group">
              <div className="w-8 h-8 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/30 group-hover:scale-110 transition">
                <Zap className="w-4 h-4 text-primary fill-current" />
              </div>
              <div className="text-left">
                <p className="text-[9px] font-black uppercase tracking-widest text-white/40">Tier Status</p>
                <p className="text-xs font-black uppercase text-primary">Master Creator</p>
              </div>
            </button>
            
            <button 
              onClick={() => setActiveTab('content')}
              className="flex items-center gap-3 bg-primary text-white px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-lg shadow-primary/20 border border-white/10 hover:scale-105 transition"
            >
              <Plus className="w-4 h-4" /> New Pulse
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-white/5 p-1.5 rounded-2xl border border-white/5 w-fit">
          {[
            { id: 'content', icon: LayoutGrid, label: 'Content' },
            { id: 'live', icon: Video, label: 'Live Sessions' },
            { id: 'orders', icon: ListOrdered, label: 'Custom Requests' },
            { id: 'consent_inbox', icon: Users, label: 'Consent Inbox' },
            { id: 'goals', icon: Crown, label: 'Goals' },
            { id: 'analytics', icon: BarChart3, label: 'Analytics' },
            { id: 'settings', icon: Settings, label: 'Settings' },
            { id: 'safety_ops', icon: Shield, label: 'Safety Ops' },
            { id: 'ai_tools', icon: Zap, label: 'AI Tools' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => tab.id === 'ai_tools' ? router.push('/studio/ai-tools') : setActiveTab(tab.id as any)}
              className={`flex items-center gap-3 px-6 py-3 rounded-xl transition-all duration-300 ${activeTab === tab.id ? 'bg-white/10 text-white shadow-xl' : 'text-white/40 hover:text-white/60'}`}
            >
              <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-primary' : ''}`} />
              <span className="text-[10px] font-black uppercase tracking-widest">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
          <div className="lg:col-span-8 space-y-8">
            {activeTab === 'content' && (
              <div className="space-y-8">
                {/* Upload Form Panel */}
                <div className="glass-card p-6 border border-white/10 bg-black/40 rounded-3xl space-y-6">
                  <div>
                    <h3 className="text-base font-black tracking-wider uppercase flex items-center gap-2 text-white">
                      <Plus className="w-5 h-5 text-primary animate-pulse" /> Upload New Premium Media
                    </h3>
                    <p className="text-[10px] text-white/40 uppercase font-black tracking-widest mt-1">Submit content to the compliance pipeline</p>
                  </div>

                  {uploadError && (
                    <div className="p-4 bg-red-950/20 border border-red-500/30 rounded-2xl flex items-start gap-3 text-left">
                      <ShieldAlert className="w-5 h-5 text-[#ff007f] shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-white uppercase tracking-wider">Compliance Upload Conflict</p>
                        <p className="text-[10px] text-white/70 leading-normal">{uploadError}</p>
                      </div>
                    </div>
                  )}

                  {uploadSuccess && (
                    <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-2xl flex items-center gap-3 text-left">
                      <ShieldCheck className="w-5 h-5 text-green-400 shrink-0" />
                      <div>
                        <p className="text-xs font-bold text-white uppercase tracking-wider">Asset Submitted Successfully</p>
                        <p className="text-[10px] text-green-400/80 font-mono leading-none">Status: Pending Layer 3 Human Review</p>
                      </div>
                    </div>
                  )}

                  <form onSubmit={handleUploadPost} className="space-y-4 text-xs font-semibold">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[9px] uppercase tracking-widest font-black text-white/40">Post Title</label>
                        <input 
                          type="text" 
                          placeholder="e.g. A Night in Paris" 
                          value={postTitle}
                          onChange={(e) => setPostTitle(e.target.value)}
                          className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-xs text-white placeholder-white/20 focus:border-primary focus:outline-none transition"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] uppercase tracking-widest font-black text-white/40">Media URL</label>
                        <div className="flex gap-2">
                          <input 
                            type="text" 
                            placeholder="https://images.unsplash.com/..." 
                            value={postMediaUrl}
                            onChange={(e) => setPostMediaUrl(e.target.value)}
                            className="flex-1 px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-xs text-white placeholder-white/20 focus:border-primary focus:outline-none transition"
                          />
                          <button
                            type="button"
                            onClick={() => setPostMediaUrl('https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&q=80')}
                            className="px-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 text-[9px] uppercase font-black tracking-widest transition"
                          >
                            Mock
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[9px] uppercase tracking-widest font-black text-white/40">Tags (Comma-separated, e.g. explicit, fantasy)</label>
                      <input 
                        type="text" 
                        placeholder="e.g. explicit, fantasy, photography" 
                        value={postTags}
                        onChange={(e) => setPostTags(e.target.value)}
                        className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-xs text-white placeholder-white/20 focus:border-primary focus:outline-none transition"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[9px] uppercase tracking-widest font-black text-white/40">Description</label>
                      <textarea 
                        rows={2}
                        placeholder="Describe your asset for Layer 1 tag verification..." 
                        value={postDesc}
                        onChange={(e) => setPostDesc(e.target.value)}
                        className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-xs text-white placeholder-white/20 focus:border-primary focus:outline-none transition resize-none"
                      />
                    </div>

                    {/* Co-Performance Section */}
                    <div className="space-y-4 p-4 bg-white/5 border border-white/10 rounded-2xl">
                      <div className="flex items-center justify-between">
                        <label className="flex items-center gap-2 cursor-pointer font-black text-[10px] uppercase tracking-widest text-white/70">
                          <input 
                            type="checkbox"
                            checked={hasCoPerformers}
                            onChange={(e) => setHasCoPerformers(e.target.checked)}
                            className="accent-primary"
                          />
                          Contains Co-Performer(s)
                        </label>
                      </div>

                      {hasCoPerformers && (
                        <div className="space-y-3 pt-2 border-t border-white/5">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <label className="text-[9px] uppercase tracking-widest font-black text-white/40">Performer Type</label>
                              <select
                                value={coPerformerType}
                                onChange={(e) => setCoPerformerType(e.target.value as any)}
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-primary transition"
                              >
                                <option value="registered">Registered Platform User</option>
                                <option value="external">External Performer (Upload Consent)</option>
                              </select>
                            </div>

                            {coPerformerType === 'registered' ? (
                              <div className="space-y-1">
                                <label className="text-[9px] uppercase tracking-widest font-black text-white/40">Select Registered Creator</label>
                                <select
                                  value={selectedRegisteredUser}
                                  onChange={(e) => setSelectedRegisteredUser(e.target.value)}
                                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-primary transition"
                                >
                                  {REGISTERED_USERS.map(u => (
                                    <option key={u.id} value={u.name}>{u.name}</option>
                                  ))}
                                </select>
                              </div>
                            ) : (
                              <div className="space-y-1">
                                <label className="text-[9px] uppercase tracking-widest font-black text-white/40">Performer Full Name</label>
                                <input
                                  type="text"
                                  value={externalPerformerName}
                                  onChange={(e) => setExternalPerformerName(e.target.value)}
                                  placeholder="e.g. John Doe"
                                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-primary transition"
                                />
                              </div>
                            )}
                          </div>

                          {coPerformerType === 'external' && (
                            <div className="space-y-1">
                              <label className="text-[9px] uppercase tracking-widest font-black text-white/40">Signed Consent Document (PDF/Image)</label>
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  disabled
                                  value={externalConsentFile || 'No file selected'}
                                  placeholder="Upload consent form..."
                                  className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white/50 outline-none"
                                />
                                <button
                                  type="button"
                                  onClick={() => setExternalConsentFile(`consent_form_${Date.now()}.pdf`)}
                                  className="px-3 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl text-[9px] uppercase font-black tracking-widest transition"
                                >
                                  Upload PDF
                                </button>
                              </div>
                            </div>
                          )}

                          <button
                            type="button"
                            onClick={handleAddCoPerformer}
                            className="w-full py-2 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest text-primary transition"
                          >
                            + Add Co-Performer to List
                          </button>

                          {addedCoPerformers.length > 0 && (
                            <div className="space-y-1.5 pt-2">
                              <span className="text-[8px] uppercase tracking-widest font-black text-white/40">Added Performers:</span>
                              <div className="flex flex-wrap gap-2">
                                {addedCoPerformers.map((p, idx) => (
                                  <div key={idx} className="flex items-center gap-1.5 px-2.5 py-1 bg-white/5 border border-white/10 rounded-xl text-[9px] font-semibold text-white/80">
                                    {p.avatar && <img src={p.avatar} className="w-4 h-4 rounded-full object-cover" />}
                                    <span>{p.name}</span>
                                    <span className={`text-[7px] font-black uppercase px-1 rounded ${
                                      p.status === 'approved' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                                    }`}>
                                      {p.status}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveCoPerformer(idx)}
                                      className="text-red-400 hover:text-red-300 font-bold ml-1"
                                    >
                                      &times;
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex justify-between items-center pt-2">
                      {/* Tier Toggle */}
                      <div className="flex bg-white/5 p-1 rounded-xl border border-white/15">
                        <button
                          type="button"
                          onClick={() => setPostTier('vip')}
                          className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-wider transition ${postTier === 'vip' ? 'bg-[#ff007f] text-white' : 'text-white/40 hover:text-white/80'}`}
                        >
                          VIP Access
                        </button>
                        <button
                          type="button"
                          onClick={() => setPostTier('master')}
                          className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-wider transition ${postTier === 'master' ? 'bg-[#9d4edd] text-white font-black' : 'text-white/40 hover:text-white/80'}`}
                        >
                          Master Tier
                        </button>
                      </div>

                      <button
                        type="submit"
                        disabled={isUploading}
                        className="px-8 py-3 bg-primary text-black font-black uppercase tracking-wider text-[10px] rounded-xl hover:shadow-[0_0_20px_rgba(102,252,241,0.4)] transition disabled:opacity-50 flex items-center gap-2"
                      >
                        {isUploading ? <><Loader2 className="w-4 h-4 animate-spin" /> Scanning Media...</> : 'Publish to Gateway'}
                      </button>
                    </div>
                  </form>
                </div>

                {/* Uploaded Posts List */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-black tracking-tight text-white">UPLOADED CONTENT</h2>
                    <div className="flex items-center gap-2 text-[9px] text-white/40 font-black uppercase tracking-widest bg-white/5 px-3 py-1.5 rounded-lg">
                      Total Assets: {uploadedPosts.length}
                    </div>
                  </div>
                  
                  {isLoadingPosts ? (
                    <div className="flex justify-center py-12">
                      <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                  ) : uploadedPosts.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {uploadedPosts.map((post) => {
                        const parts = post.description?.split('\n\n===CO_PERFORMERS===\n');
                        const cleanDesc = parts?.[0] || post.description || '';
                        let coPerformers: any[] = [];
                        try {
                          if (parts?.[1]) {
                            coPerformers = JSON.parse(parts[1]);
                          }
                        } catch (e) {}

                        return (
                          <motion.div 
                            key={post.id}
                            whileHover={{ y: -4 }}
                            className="glass-card aspect-square relative group overflow-hidden border border-white/5 bg-black/40 rounded-3xl"
                          >
                            <img src={post.media_url} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition duration-500" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            
                            {/* Access tier badge */}
                            <div className="absolute top-3 right-3 flex gap-1.5">
                              {post.tier === 'master' ? (
                                <div className="px-2 py-0.5 bg-[#9d4edd] text-white rounded-md text-[8px] font-black uppercase tracking-widest shadow-[0_0_10px_rgba(157,78,221,0.5)]">Master</div>
                              ) : post.tier === 'vip' ? (
                                <div className="px-2 py-0.5 bg-[#ff007f] text-white rounded-md text-[8px] font-black uppercase tracking-widest shadow-[0_0_10px_rgba(255,0,127,0.5)]">VIP</div>
                              ) : (
                                <div className="px-2 py-0.5 bg-gray-600 text-white rounded-md text-[8px] font-black uppercase tracking-widest">Public</div>
                              )}
                            </div>

                            {/* Moderation status badge */}
                            <div className="absolute top-3 left-3">
                              {post.moderation_status === 'pending' ? (
                                <div className="px-2 py-0.5 bg-amber-500/20 text-amber-400 border border-amber-500/40 rounded-md text-[7px] font-black uppercase tracking-widest animate-pulse">Pending</div>
                              ) : post.moderation_status === 'approved' ? (
                                <div className="px-2 py-0.5 bg-green-500/20 text-green-400 border border-green-500/40 rounded-md text-[7px] font-black uppercase tracking-widest">Approved</div>
                              ) : (
                                <div className="px-2 py-0.5 bg-red-500/20 text-red-400 border border-red-500/40 rounded-md text-[7px] font-black uppercase tracking-widest">Rejected</div>
                              )}
                            </div>

                            {/* Co-Performers List overlay */}
                            {coPerformers.length > 0 && (
                              <div className="absolute bottom-16 left-3 right-3 flex flex-wrap gap-1 z-20">
                                {coPerformers.map((p, i) => (
                                  <span key={i} className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[7px] font-black uppercase tracking-wider ${
                                    p.status === 'approved' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse'
                                  }`} title={`${p.name} (${p.status})`}>
                                    {p.avatar && <img src={p.avatar} className="w-3 h-3 rounded-full object-cover" />}
                                    {p.name}
                                  </span>
                                ))}
                              </div>
                            )}

                            <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity space-y-1 z-10">
                               <p className="font-bold text-xs text-white truncate">{post.title}</p>
                               <p className="text-[8px] text-white/60 line-clamp-1">{cleanDesc || 'No description'}</p>
                               <p className="text-[7px] font-mono text-white/30">{new Date(post.created_at).toLocaleDateString()}</p>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="py-12 text-center text-white/30 font-bold uppercase tracking-widest text-[10px] border-2 border-dashed border-white/5 rounded-3xl">
                      No uploaded assets found. Complete the gateway scan above to publish.
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'live' && (
              <div className="space-y-8">
                {!safetyGateAccepted ? (
                  /* Safety Gate Verification Screen */
                  <div className="glass-card p-10 flex flex-col items-center text-center bg-red-950/5 border-red-500/20 border-dashed border-2">
                    <div className="w-20 h-20 bg-red-500/10 rounded-[2rem] flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(239,68,68,0.2)] border border-red-500/30">
                      <ShieldAlert className="w-10 h-10 text-red-500" />
                    </div>
                    <h2 className="text-2xl font-black tracking-tighter uppercase mb-2">Safety Verification Required</h2>
                    <p className="text-[10px] text-white/40 uppercase font-black tracking-widest max-w-sm leading-relaxed mb-8">
                      To broadcast public streams or matched video sessions, you must review and confirm the platform safety gate protocol.
                    </p>

                    <button 
                      onClick={() => setShowSafetyNotice(true)}
                      className="px-10 py-4 bg-red-500 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-red-500/10 hover:scale-105 transition-all"
                    >
                      Verify Safety Gate
                    </button>

                    {showSafetyNotice && (
                      <UploadSafetyNotice 
                        type="stream"
                        onAccept={handleAcceptSafety}
                        onCancel={() => setShowSafetyNotice(false)}
                      />
                    )}
                  </div>
                ) : (
                  /* Broadcasting Studio Cockpit */
                  <div className="space-y-8">
                    
                    {/* Viewport Control Panel */}
                    <div className="relative aspect-video rounded-[2.5rem] overflow-hidden bg-black border border-white/5 shadow-2xl flex flex-col justify-end">
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent pointer-events-none z-10" />
                      
                      {isBroadcasting ? (
                        <>
                          <div className="absolute inset-0 bg-primary/5 pointer-events-none" />
                          <canvas ref={canvasRef} className="absolute inset-0 z-0 pointer-events-none" />
                          
                          {/* Live broadcast header */}
                          <div className="absolute top-6 left-6 right-6 flex justify-between items-center z-20">
                            <div className="flex gap-2">
                              <span className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl text-[9px] font-black uppercase tracking-widest animate-pulse">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" /> Live Broadcasting
                              </span>
                              <span className="flex items-center gap-1.5 px-3 py-1.5 bg-black/60 backdrop-blur-xl border border-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest text-white/80">
                                <Volume2 className="w-3.5 h-3.5 text-primary" /> Audio Synced
                              </span>
                            </div>
                            
                            <span className="text-[9px] font-black uppercase text-white/40 tracking-widest">
                              Stream: Elena_Room
                            </span>
                          </div>
                        </>
                      ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-10 z-20 bg-white/2 backdrop-blur-sm">
                          <Tv className="w-12 h-12 text-white/20 mb-4" />
                          <p className="text-[10px] text-white/40 uppercase font-black tracking-widest">
                            Ready to stream feed. All safety gates passed.
                          </p>
                        </div>
                      )}

                      {/* Cockpit Actions footer */}
                      {/* Cockpit Actions footer */}
                      <div className="relative z-20 p-6 flex flex-col gap-4 bg-black/75 backdrop-blur-xl border-t border-white/5 text-left">
                        {/* Live Co-performers Setup */}
                        {!isBroadcasting && (
                          <div className="space-y-3 p-4 bg-white/5 border border-white/10 rounded-2xl">
                            <div className="flex items-center justify-between">
                              <label className="flex items-center gap-2 cursor-pointer font-black text-[9px] uppercase tracking-widest text-white/70">
                                <input 
                                  type="checkbox"
                                  checked={hasLiveCoPerformers}
                                  onChange={(e) => setHasLiveCoPerformers(e.target.checked)}
                                  className="accent-primary"
                                />
                                Tag Co-Performer(s) for Live Stream
                              </label>
                            </div>

                            {hasLiveCoPerformers && (
                              <div className="space-y-3 pt-2 border-t border-white/5">
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-1">
                                    <label className="text-[8px] uppercase tracking-widest font-black text-white/40">Performer Type</label>
                                    <select
                                      value={liveCoPerformerType}
                                      onChange={(e) => setLiveCoPerformerType(e.target.value as any)}
                                      className="w-full bg-black/40 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white outline-none"
                                    >
                                      <option value="registered">Registered Platform User</option>
                                      <option value="external">External Performer (Upload Consent)</option>
                                    </select>
                                  </div>

                                  {liveCoPerformerType === 'registered' ? (
                                    <div className="space-y-1">
                                      <label className="text-[8px] uppercase tracking-widest font-black text-white/40">Select Registered Creator</label>
                                      <select
                                        value={selectedLiveRegisteredUser}
                                        onChange={(e) => setSelectedLiveRegisteredUser(e.target.value)}
                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white outline-none"
                                      >
                                        {REGISTERED_USERS.map(u => (
                                          <option key={u.id} value={u.name}>{u.name}</option>
                                        ))}
                                      </select>
                                    </div>
                                  ) : (
                                    <div className="space-y-1">
                                      <label className="text-[8px] uppercase tracking-widest font-black text-white/40">Performer Name</label>
                                      <input
                                        type="text"
                                        value={externalLivePerformerName}
                                        onChange={(e) => setExternalLivePerformerName(e.target.value)}
                                        placeholder="Full Name"
                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white outline-none"
                                      />
                                    </div>
                                  )}
                                </div>

                                {liveCoPerformerType === 'external' && (
                                  <div className="space-y-1">
                                    <label className="text-[8px] uppercase tracking-widest font-black text-white/40">Consent Form (PDF/Image)</label>
                                    <div className="flex gap-2">
                                      <input
                                        type="text"
                                        disabled
                                        value={externalLiveConsentFile || 'No file selected'}
                                        className="flex-1 bg-black/40 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white/50"
                                      />
                                      <button
                                        type="button"
                                        onClick={() => setExternalLiveConsentFile(`live_consent_${Date.now()}.pdf`)}
                                        className="px-2.5 bg-white/5 border border-white/10 rounded-xl text-[8px] font-black uppercase tracking-wider"
                                      >
                                        Upload
                                      </button>
                                    </div>
                                  </div>
                                )}

                                <button
                                  type="button"
                                  onClick={handleAddLiveCoPerformer}
                                  className="w-full py-1.5 bg-white/5 border border-white/10 rounded-xl text-[8px] font-black uppercase tracking-wider text-primary"
                                >
                                  + Add Live Co-Performer
                                </button>

                                {addedLiveCoPerformers.length > 0 && (
                                  <div className="space-y-1.5 pt-1.5">
                                    <span className="text-[8px] uppercase tracking-widest font-black text-white/40">Tagged Live Performers & Consent Status:</span>
                                    <div className="flex flex-col gap-1.5">
                                      {addedLiveCoPerformers.map((p, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-2 bg-black/40 border border-white/5 rounded-xl text-[10px]">
                                          <div className="flex items-center gap-1.5">
                                            {p.avatar && <img src={p.avatar} className="w-5 h-5 rounded-full object-cover" />}
                                            <span className="font-bold">{p.name}</span>
                                            <span className="text-white/40 uppercase text-[8px]">({p.type})</span>
                                          </div>
                                          <div className="flex items-center gap-1.5">
                                            <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                                              p.status === 'approved' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/20 text-amber-400 border border-amber-500/20 animate-pulse'
                                            }`}>
                                              {p.status}
                                            </span>
                                            {p.status === 'pending' && (
                                              <button
                                                type="button"
                                                onClick={() => {
                                                  setAddedLiveCoPerformers(prev => prev.map((item, i) => i === idx ? { ...item, status: 'approved' } : item));
                                                  setSuccessToast(`Simulation: ${p.name} accepted live depiction consent!`);
                                                  setTimeout(() => setSuccessToast(null), 3000);
                                                }}
                                                className="px-2 py-0.5 bg-accent/20 border border-accent/30 text-accent rounded text-[7px] font-black uppercase tracking-wider"
                                              >
                                                Simulate Accept
                                              </button>
                                            )}
                                            <button
                                              type="button"
                                              onClick={() => handleRemoveLiveCoPerformer(idx)}
                                              className="text-red-400 hover:text-red-300 font-bold"
                                            >
                                              &times;
                                            </button>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )}

                        <div className="flex justify-between items-center w-full">
                          <div className="flex gap-2">
                            <button 
                              onClick={() => {
                                // Prevent broadcast if there is a pending co-performer consent
                                const hasPendingLiveConsent = addedLiveCoPerformers.some(p => p.status === 'pending');
                                if (hasPendingLiveConsent) {
                                  alert('Cannot start broadcast: You have pending co-performer consent requests. All co-performers must approve or you must upload signed consent forms.');
                                  return;
                                }
                                handleToggleBroadcast();
                              }}
                              className={`px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg transition-all ${
                                isBroadcasting 
                                  ? 'bg-red-500 hover:bg-red-600 text-white shadow-red-500/10' 
                                  : 'bg-primary hover:bg-primary/90 text-white shadow-primary/20'
                              }`}
                            >
                              {isBroadcasting ? 'Disconnect Broadcast' : 'Start Session Broadcast'}
                            </button>
                            
                            <button 
                              onClick={() => setSafetyGateAccepted(false)}
                              className="px-6 py-3.5 bg-white/5 border border-white/10 hover:bg-white/10 text-white/70 hover:text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition"
                            >
                              Lock Safety Gate
                            </button>
                          </div>

                          <span className="text-[9px] text-white/30 font-black uppercase tracking-widest">
                            {isBroadcasting ? 'Speed: 5.6 mb/s • Viewers: 1,420' : 'Cockpit Offline'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {!isBroadcasting && (
                      <div className="glass-card p-6 bg-white/2 border border-white/5 space-y-6">
                        <div className="flex justify-between items-center border-b border-white/5 pb-3">
                          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/80 flex items-center gap-2">
                            <Calendar className="w-4.5 h-4.5 text-primary" /> Schedule Live Session
                          </h3>
                          <span className={`text-[8px] font-black px-2 py-0.5 rounded border transition-colors ${
                            isCalendarConnected 
                              ? 'text-primary bg-primary/10 border-primary/20' 
                              : 'text-white/40 bg-white/5 border-white/10'
                          }`}>
                            {isCalendarConnected ? 'Google Sync Active' : 'Local Sandbox Only'}
                          </span>
                        </div>
                        
                        <form onSubmit={handleScheduleEvent} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-[9px] uppercase tracking-widest font-black text-white/40">Event Title</label>
                            <input 
                              type="text" 
                              placeholder="e.g. VIP Q&A & Chill"
                              value={eventTitle}
                              onChange={(e) => setEventTitle(e.target.value)}
                              required
                              className="w-full px-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-xs text-white placeholder-white/20 focus:border-primary focus:outline-none transition"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[9px] uppercase tracking-widest font-black text-white/40">Tier / Type</label>
                            <select
                              value={eventType}
                              onChange={(e) => setEventType(e.target.value)}
                              className="w-full px-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-xs text-white focus:border-primary focus:outline-none transition"
                            >
                              <option value="public">Public (Everyone)</option>
                              <option value="vip">VIP Subscribers Only</option>
                              <option value="master">Master Subscribers Only</option>
                            </select>
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[9px] uppercase tracking-widest font-black text-white/40">Start Time</label>
                            <input 
                              type="datetime-local"
                              value={eventStart}
                              onChange={(e) => setEventStart(e.target.value)}
                              required
                              className="w-full px-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-xs text-white focus:border-primary focus:outline-none transition"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[9px] uppercase tracking-widest font-black text-white/40">End Time</label>
                            <input 
                              type="datetime-local"
                              value={eventEnd}
                              onChange={(e) => setEventEnd(e.target.value)}
                              required
                              className="w-full px-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-xs text-white focus:border-primary focus:outline-none transition"
                            />
                          </div>

                          <div className="space-y-1.5 md:col-span-2">
                            <label className="text-[9px] uppercase tracking-widest font-black text-white/40">Description</label>
                            <textarea 
                              placeholder="Tell your subscribers what this session is about..."
                              value={eventDesc}
                              onChange={(e) => setEventDesc(e.target.value)}
                              rows={3}
                              className="w-full px-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-xs text-white placeholder-white/20 focus:border-primary focus:outline-none transition"
                            />
                          </div>

                          <div className="md:col-span-2 pt-2">
                            <button
                              type="submit"
                              disabled={isScheduling}
                              className="w-full flex items-center justify-center gap-2 py-3 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:shadow-[0_0_20px_rgba(255,0,127,0.4)] disabled:opacity-50 transition cursor-pointer"
                            >
                              {isScheduling ? (
                                <Loader2 className="w-4.5 h-4.5 animate-spin" />
                              ) : (
                                <>
                                  <Calendar className="w-4 h-4" />
                                  Schedule Event
                                </>
                              )}
                            </button>
                          </div>
                        </form>
                      </div>
                    )}

                    {/* Cockpit Widgets */}
                    {isBroadcasting && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        
                        {/* 1. Audience Match HUD */}
                        <div className="glass-card p-6 bg-white/2 border border-white/5 flex flex-col h-[350px]">
                          <div className="flex justify-between items-center border-b border-white/5 pb-3 mb-4">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/80 flex items-center gap-2">
                              <Users className="w-4.5 h-4.5 text-primary" /> Audience Match HUD
                            </h3>
                            <span className="text-[8px] font-black text-accent bg-accent/10 px-2 py-0.5 rounded border border-accent/20">
                              RLS Active
                            </span>
                          </div>

                          <div className="flex-1 space-y-2.5 overflow-y-auto pr-2 scrollbar-hide">
                            {AUDIENCE_MEMBERS.map(viewer => {
                              const matchScore = calculateMatch(viewer, CREATOR_PROFILE);
                              const isRestricted = matchScore.totalScore < minMatchThreshold;
                              const isViewerHUDOpen = activeBreakdownViewerId === viewer.id;

                              return (
                                <div 
                                  key={viewer.id}
                                  className={`p-3 rounded-2xl border transition-all relative ${
                                    isRestricted 
                                      ? 'border-red-500/20 bg-red-950/5 opacity-55' 
                                      : 'border-white/5 bg-white/2 hover:border-white/20'
                                  }`}
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                      <img src={viewer.avatar} className="w-8 h-8 rounded-full object-cover border border-white/10" />
                                      <div>
                                        <div className="flex items-center gap-1.5">
                                          <p className="text-[10px] font-black text-white/90">{viewer.name}</p>
                                          {viewer.isKycVerified && <ShieldCheck className="w-3.5 h-3.5 text-green-400" />}
                                        </div>
                                        <span className="text-[7px] font-black text-white/30 uppercase tracking-widest block mt-0.5">
                                          Archetype: {viewer.archetype}
                                        </span>
                                      </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                      <span className={`text-[10px] font-black ${isRestricted ? 'text-red-400' : 'text-primary'}`}>
                                        {isRestricted ? 'Muted' : `${matchScore.totalScore}%`}
                                      </span>
                                      <button 
                                        onClick={() => setActiveBreakdownViewerId(isViewerHUDOpen ? null : viewer.id)}
                                        className="text-[9px] font-black uppercase text-white/40 hover:text-white"
                                      >
                                        HUD
                                      </button>
                                    </div>
                                  </div>

                                  {/* Viewer HUD Breakdown overlay */}
                                  <AnimatePresence>
                                    {isViewerHUDOpen && (
                                      <motion.div 
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="mt-3 pt-3 border-t border-white/5 space-y-2"
                                      >
                                        <p className="text-[8px] font-black text-white/40 uppercase tracking-wider mb-2">
                                          Signal breakdown for {viewer.name}:
                                        </p>
                                        <div className="grid grid-cols-2 gap-2">
                                          {Object.entries(matchScore.breakdown).map(([key, val]) => (
                                            <div key={key} className="text-[8px] font-bold text-white/70 uppercase">
                                              {key.replace(/([A-Z])/g, ' $1')}: <span className="text-primary">{Math.round(val * 100)}%</span>
                                            </div>
                                          ))}
                                        </div>
                                        <p className="text-[8px] text-white/50 leading-relaxed pt-1 border-t border-white/5 mt-1">
                                          {matchScore.tierReason}
                                        </p>
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* 2. Live Tipping alerts */}
                        <div className="glass-card p-6 bg-white/2 border border-white/5 flex flex-col h-[350px]">
                          <div className="flex justify-between items-center border-b border-white/5 pb-3 mb-4">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/80 flex items-center gap-2">
                              <Sparkles className="w-4.5 h-4.5 text-yellow-500" /> Tipping Alerts Log
                            </h3>
                            <Crown className="w-4.5 h-4.5 text-yellow-500" />
                          </div>

                          <div className="flex-1 space-y-3 overflow-y-auto pr-2 scrollbar-hide">
                            {interactionsLog.length === 0 ? (
                              <div className="flex flex-col items-center justify-center h-full text-center opacity-40">
                                <Activity className="w-8 h-8 mb-2 animate-pulse" />
                                <p className="text-[9px] font-black uppercase tracking-widest">
                                  Waiting for live feed interactions...
                                </p>
                              </div>
                            ) : (
                              interactionsLog.map(alert => (
                                <motion.div 
                                  key={alert.id}
                                  initial={{ x: -20, opacity: 0 }}
                                  animate={{ x: 0, opacity: 1 }}
                                  className={`p-3 border rounded-2xl flex items-center justify-between transition ${
                                    alert.type === 'chat' 
                                      ? 'bg-primary/5 border-primary/10' 
                                      : 'bg-yellow-500/5 border-yellow-500/10'
                                  }`}
                                >
                                  <div className="flex items-center gap-3">
                                    <span className="text-2xl">{alert.emoji}</span>
                                    <div>
                                      <p className="text-[10px] font-black text-white">{alert.user}</p>
                                      <p className="text-[9px] text-white/50 font-medium">{alert.text}</p>
                                    </div>
                                  </div>
                                  {alert.pts > 0 ? (
                                    <span className="text-[10px] font-black text-yellow-500 shrink-0">
                                      +{alert.pts} PTS
                                    </span>
                                  ) : (
                                    <span className="text-[9px] font-black text-primary uppercase shrink-0">
                                      VIP Message
                                    </span>
                                  )}
                                </motion.div>
                              ))
                            )}
                          </div>
                        </div>

                        {/* 3. Stream Poll manager */}
                        <div className="glass-card p-6 bg-white/2 border border-white/5">
                          <div className="flex justify-between items-center border-b border-white/5 pb-3 mb-4">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/80 flex items-center gap-2">
                              <ListOrdered className="w-4.5 h-4.5 text-accent" /> Live Polls Manager
                            </h3>
                            <span className="text-[8px] font-black text-accent bg-accent/10 px-2 py-0.5 rounded border border-accent/20">
                              Broadcasting
                            </span>
                          </div>

                          <div className="space-y-4">
                            {/* Create Poll inputs */}
                            <form onSubmit={handleBroadcastPoll} className="space-y-2">
                              <input 
                                type="text"
                                placeholder="Enter poll question..."
                                value={pollInputs.question}
                                onChange={e => setPollInputs(prev => ({ ...prev, question: e.target.value }))}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-[10px] font-bold text-white outline-none focus:border-accent"
                              />
                              <div className="grid grid-cols-2 gap-2">
                                <input 
                                  type="text"
                                  placeholder="Option 1"
                                  value={pollInputs.opt1}
                                  onChange={e => setPollInputs(prev => ({ ...prev, opt1: e.target.value }))}
                                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-[10px] font-bold text-white outline-none focus:border-accent"
                                />
                                <input 
                                  type="text"
                                  placeholder="Option 2"
                                  value={pollInputs.opt2}
                                  onChange={e => setPollInputs(prev => ({ ...prev, opt2: e.target.value }))}
                                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-[10px] font-bold text-white outline-none focus:border-accent"
                                />
                              </div>
                              <input 
                                type="text"
                                placeholder="Option 3 (Optional)"
                                value={pollInputs.opt3}
                                onChange={e => setPollInputs(prev => ({ ...prev, opt3: e.target.value }))}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-[10px] font-bold text-white outline-none focus:border-accent"
                              />
                              <button 
                                type="submit"
                                className="w-full py-3 bg-accent text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:brightness-110 active:scale-98 transition shadow-lg shadow-accent/15"
                              >
                                Broadcast New Poll
                              </button>
                            </form>

                            {/* Active poll votes */}
                            <div className="pt-3 border-t border-white/5">
                              <p className="text-[9px] font-black text-white/50 uppercase tracking-widest mb-2">
                                Active Broadcast: {poll.question}
                              </p>
                              <div className="space-y-2">
                                {poll.options.map(opt => {
                                  const totalVotes = poll.options.reduce((sum, o) => sum + o.votes, 0);
                                  const pct = totalVotes > 0 ? Math.round((opt.votes / totalVotes) * 100) : 0;
                                  return (
                                    <div key={opt.id} className="relative p-2.5 bg-white/2 border border-white/5 rounded-xl overflow-hidden">
                                      <div 
                                        className="absolute inset-y-0 left-0 bg-accent/10" 
                                        style={{ width: `${pct}%` }}
                                      />
                                      <div className="relative z-10 flex justify-between text-[9px] font-black uppercase tracking-wider">
                                        <span>{opt.text}</span>
                                        <span>{pct}% ({opt.votes})</span>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>

                          </div>
                        </div>

                        {/* 4. Privacy Shield Threshold setup */}
                        <div className="glass-card p-6 bg-white/2 border border-white/5">
                          <div className="flex justify-between items-center border-b border-white/5 pb-3 mb-4">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/80 flex items-center gap-2">
                              <ShieldCheck className="w-4.5 h-4.5 text-green-400" /> Privacy Shield Cockpit
                            </h3>
                            <SlidersHorizontal className="w-4.5 h-4.5 text-white/40" />
                          </div>

                          <div className="space-y-4">
                            <div>
                              <div className="flex justify-between text-[9px] font-black uppercase tracking-widest mb-2">
                                <span className="text-white/60">Minimum Compatibility Threshold</span>
                                <span className="text-primary">{minMatchThreshold}% Match</span>
                              </div>
                              <input 
                                type="range" 
                                min="0" 
                                max="100" 
                                value={minMatchThreshold}
                                onChange={e => setMinMatchThreshold(Number(e.target.value))}
                                className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary"
                              />
                              <p className="text-[8px] text-white/40 uppercase font-black tracking-wider leading-relaxed mt-2">
                                Fans below this match threshold are muted in chat feeds.
                              </p>
                            </div>

                            <div className="pt-3 border-t border-white/5 space-y-2">
                              <div className="flex justify-between items-center text-[9px] font-black uppercase text-white/60">
                                <span>Require Verified KYC</span>
                                <input type="checkbox" defaultChecked className="accent-primary" />
                              </div>
                              <div className="flex justify-between items-center text-[9px] font-black uppercase text-white/60">
                                <span>VIP Comment Mode Only</span>
                                <input type="checkbox" className="accent-primary" />
                              </div>
                            </div>
                          </div>
                        </div>

                      </div>
                    )}

                  </div>
                )}
              </div>
            )}

            {activeTab === 'goals' && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-2xl font-black tracking-tighter uppercase mb-2">
                    <Crown className="text-primary inline-block mr-2 w-6 h-6 align-text-bottom" /> Crowdfunding Goals
                  </h2>
                  <p className="text-[10px] text-white/40 uppercase font-black tracking-widest mt-1">
                    Launch campaigns and track member-backed funding progress
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Create Goal Form */}
                  <div className="space-y-6">
                    <div className="glass-card p-6 bg-white/2 border border-white/5 rounded-3xl space-y-6">
                      <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white/80 flex items-center gap-2 pb-3 border-b border-white/5">
                        <Plus className="w-4 h-4 text-primary" /> Create New Goal
                      </h3>

                      <form onSubmit={handleCreateGoal} className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-[9px] font-black text-white/40 uppercase tracking-widest">Goal Title</label>
                          <input 
                            type="text" 
                            required
                            placeholder="e.g. New Streaming Microphone"
                            value={newGoalTitle}
                            onChange={e => setNewGoalTitle(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-xs font-bold text-white outline-none focus:border-primary transition"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-[9px] font-black text-white/40 uppercase tracking-widest">Description</label>
                          <textarea 
                            rows={3}
                            placeholder="Tell your fans why you're raising these funds..."
                            value={newGoalDesc}
                            onChange={e => setNewGoalDesc(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-xs text-white placeholder-white/30 resize-none outline-none focus:border-primary transition"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-[9px] font-black text-white/40 uppercase tracking-widest">Target Amount ($)</label>
                          <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 text-xs font-black font-mono">$</span>
                            <input 
                              type="number" 
                              required
                              min="1"
                              step="0.01"
                              placeholder="150.00"
                              value={newGoalTarget}
                              onChange={e => setNewGoalTarget(e.target.value)}
                              className="w-full bg-white/5 border border-white/10 rounded-2xl pl-8 pr-6 py-3.5 text-xs font-mono text-white outline-none focus:border-primary transition"
                            />
                          </div>
                        </div>

                        {goalError && (
                          <div className="text-xs text-red-500 bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-xl text-center font-bold">
                            {goalError}
                          </div>
                        )}

                        <button 
                          type="submit"
                          disabled={isCreatingGoal}
                          className="w-full py-3 bg-gradient-to-r from-primary to-pink-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg hover:brightness-110 active:scale-98 transition disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          {isCreatingGoal ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 fill-current" />}
                          Launch Campaign
                        </button>
                      </form>
                    </div>
                  </div>

                  {/* Active & Past Goals List */}
                  <div className="space-y-6">
                    <div className="glass-card p-6 bg-white/2 border border-white/5 rounded-3xl space-y-6">
                      <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white/80 flex items-center gap-2 pb-3 border-b border-white/5">
                        <Activity className="w-4 h-4 text-accent" /> Active Campaigns ({goals.length})
                      </h3>

                      {isLoadingGoals ? (
                        <div className="py-12 flex flex-col items-center justify-center space-y-3">
                          <Loader2 className="w-6 h-6 text-accent animate-spin" />
                          <p className="text-[9px] font-black uppercase tracking-widest text-white/40">Syncing goals from DB...</p>
                        </div>
                      ) : goals.length === 0 ? (
                        <div className="py-12 text-center text-white/40 text-xs uppercase tracking-widest font-black">
                          No goals configured yet.
                        </div>
                      ) : (
                        <div className="space-y-6 max-h-[450px] overflow-y-auto pr-2 scrollbar-thin">
                          {goals.map(goal => (
                            <div key={goal.id} className="space-y-3">
                              <CreatorGoalProgress goal={goal} isOwner={true} />
                              
                              {/* List contributions to this goal */}
                              {contributions.filter(c => c.goal_id === goal.id).length > 0 && (
                                <div className="pl-4 border-l border-white/10 space-y-2">
                                  <p className="text-[8px] font-black text-white/40 uppercase tracking-widest">Goal Backers</p>
                                  {contributions
                                    .filter(c => c.goal_id === goal.id)
                                    .map(c => (
                                      <div key={c.id} className="flex items-start gap-2 bg-white/2 p-2 rounded-xl border border-white/5 text-[10px]">
                                        <div className="w-6 h-6 rounded-full overflow-hidden shrink-0 border border-white/10">
                                          <img 
                                            src={c.contributor_profile?.avatar_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80'} 
                                            alt={c.contributor_profile?.username}
                                            className="w-full h-full object-cover"
                                          />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <div className="flex justify-between items-center">
                                            <span className="font-bold text-white">@{c.contributor_profile?.display_name || c.contributor_profile?.username}</span>
                                            <span className="font-black text-success">+${Number(c.amount).toFixed(2)}</span>
                                          </div>
                                          {c.message && (
                                            <p className="text-[9px] text-white/60 font-medium mt-0.5 leading-tight">
                                              "{c.message}"
                                            </p>
                                          )}
                                        </div>
                                      </div>
                                    ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'analytics' && (
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-black tracking-tighter uppercase mb-2 flex items-center gap-2">
                      <BarChart3 className="text-accent w-6 h-6" /> Analytics Insights
                    </h2>
                    <p className="text-[10px] text-white/40 uppercase font-black tracking-widest mt-1">
                      Review weekly conversion flows, relationship depths, and escrow yields
                    </p>
                  </div>
                  {profile && (
                    <button
                      onClick={() => loadAnalyticsData(profile.id)}
                      disabled={isLoadingAnalytics}
                      className="bg-white/5 hover:bg-white/10 text-white font-black text-[9px] uppercase tracking-widest px-4 py-2 rounded-xl border border-white/5 disabled:opacity-50 transition"
                    >
                      {isLoadingAnalytics ? 'Syncing...' : 'Refresh'}
                    </button>
                  )}
                </div>

                {isLoadingAnalytics ? (
                  <div className="p-16 flex flex-col items-center justify-center space-y-4 glass-card bg-white/2 border border-white/5 rounded-3xl">
                    <Loader2 className="w-8 h-8 text-accent animate-spin" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Aggregating live ledger and match data...</p>
                  </div>
                ) : analyticsError ? (
                  <div className="p-12 text-center glass-card bg-red-950/5 border border-red-500/20 rounded-3xl space-y-4">
                    <ShieldAlert className="w-10 h-10 text-red-500 mx-auto" />
                    <h3 className="text-lg font-black uppercase tracking-wider text-white">Sync Failed</h3>
                    <p className="text-xs text-white/40 max-w-sm mx-auto">{analyticsError}</p>
                    {profile && (
                      <button
                        onClick={() => loadAnalyticsData(profile.id)}
                        className="bg-red-550/20 hover:bg-red-550/30 text-red-400 font-black text-[10px] uppercase tracking-widest px-6 py-2.5 rounded-xl border border-red-500/25 transition"
                      >
                        Retry Sync
                      </button>
                    )}
                  </div>
                ) : !analyticsData ? (
                  <div className="p-16 text-center glass-card bg-white/2 border border-white/5 rounded-3xl space-y-2">
                    <BarChart3 className="w-10 h-10 text-white/20 mx-auto" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/40">No analytics data available yet</p>
                  </div>
                ) : (
                  <div className="space-y-8">
                    {/* KPI SUMMARY ROW */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="glass-card p-5 bg-white/2 border border-white/5 rounded-2xl relative overflow-hidden">
                        <div className="absolute top-3 right-3 opacity-20"><Users className="w-5 h-5 text-accent" /></div>
                        <p className="text-[8px] font-black uppercase tracking-widest text-white/40 mb-1">Active VIP Subs</p>
                        <h3 className="text-2xl font-black text-white">{analyticsData.kpis.activeVip}</h3>
                      </div>
                      <div className="glass-card p-5 bg-white/2 border border-white/5 rounded-2xl relative overflow-hidden">
                        <div className="absolute top-3 right-3 opacity-20"><Zap className="w-5 h-5 text-primary" /></div>
                        <p className="text-[8px] font-black uppercase tracking-widest text-white/40 mb-1">Active Master Subs</p>
                        <h3 className="text-2xl font-black text-white">{analyticsData.kpis.activeMaster}</h3>
                      </div>
                      <div className="glass-card p-5 bg-white/2 border border-white/5 rounded-2xl relative overflow-hidden">
                        <div className="absolute top-3 right-3 opacity-20"><Users className="w-5 h-5 text-blue-400" /></div>
                        <p className="text-[8px] font-black uppercase tracking-widest text-white/40 mb-1">Total Audience</p>
                        <h3 className="text-2xl font-black text-white">{analyticsData.kpis.totalSubscribers}</h3>
                      </div>
                      <div className="glass-card p-5 bg-white/2 border border-white/5 rounded-2xl relative overflow-hidden">
                        <div className="absolute top-3 right-3 opacity-20"><DollarSign className="w-5 h-5 text-success" /></div>
                        <p className="text-[8px] font-black uppercase tracking-widest text-white/40 mb-1">Gross Yield</p>
                        <h3 className="text-2xl font-black text-success">${Number(analyticsData.kpis.grossRevenue).toFixed(2)}</h3>
                      </div>
                    </div>

                    {/* A/B TESTING TELEMETRY SECTION */}
                    <div className="glass-card p-6 bg-white/2 border border-white/5 rounded-3xl space-y-6">
                      <div className="flex items-center justify-between border-b border-white/5 pb-4">
                        <div>
                          <h4 className="text-sm font-black uppercase tracking-widest text-white flex items-center gap-2">
                            <SlidersHorizontal className="w-4 h-4 text-primary" /> Feed Algorithm A/B Split Test
                          </h4>
                          <p className="text-[9px] text-white/40 uppercase font-black tracking-widest mt-1">
                            Live telemetry tracking impressions, clicks, and conversion rates
                          </p>
                        </div>
                        <div className="px-3 py-1 bg-primary/10 border border-primary/20 text-primary rounded-full text-[9px] font-black uppercase tracking-widest animate-pulse">
                          Live Experiment Active
                        </div>
                      </div>

                      {/* Side-by-side variant comparisons */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Variant A Card */}
                        <div className="bg-black/30 border border-white/5 rounded-2xl p-5 space-y-4 hover:border-pink-500/20 transition-all duration-300">
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] font-black uppercase tracking-wider text-pink-400 flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-pink-400 animate-pulse" />
                              Variant A: Compatibility Mode
                            </span>
                            <span className="text-[8px] font-bold text-white/40 uppercase">Harmony First</span>
                          </div>
                          
                          <div className="grid grid-cols-3 gap-2 text-center">
                            <div className="bg-white/2 p-3 rounded-xl border border-white/5">
                              <p className="text-[8px] font-black uppercase tracking-widest text-white/40">Impressions</p>
                              <p className="text-lg font-black text-white mt-1">{analyticsData.abTesting?.variantA?.impressions ?? 0}</p>
                            </div>
                            <div className="bg-white/2 p-3 rounded-xl border border-white/5">
                              <p className="text-[8px] font-black uppercase tracking-widest text-white/40">Clicks</p>
                              <p className="text-lg font-black text-white mt-1">{analyticsData.abTesting?.variantA?.clicks ?? 0}</p>
                            </div>
                            <div className="bg-white/2 p-3 rounded-xl border border-white/5">
                              <p className="text-[8px] font-black uppercase tracking-widest text-white/40">CTR</p>
                              <p className="text-lg font-black text-pink-400 mt-1">{(analyticsData.abTesting?.variantA?.ctr ?? 0).toFixed(1)}%</p>
                            </div>
                          </div>

                          <div className="space-y-1">
                            <div className="flex justify-between text-[8px] font-black uppercase tracking-wider text-white/40">
                              <span>Click-Through Rate (CTR)</span>
                              <span>{(analyticsData.abTesting?.variantA?.ctr ?? 0).toFixed(1)}%</span>
                            </div>
                            <div className="h-2 bg-black/40 rounded-full overflow-hidden border border-white/5 relative">
                              <div 
                                className="h-full bg-pink-500 rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(236,72,153,0.5)]" 
                                style={{ width: `${Math.min(100, (analyticsData.abTesting?.variantA?.ctr ?? 0) * 10)}%` }}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Variant B Card */}
                        <div className="bg-black/30 border border-white/5 rounded-2xl p-5 space-y-4 hover:border-purple-500/20 transition-all duration-300">
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] font-black uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                              Variant B: Engagement Mode
                            </span>
                            <span className="text-[8px] font-bold text-white/40 uppercase">Engagement First</span>
                          </div>

                          <div className="grid grid-cols-3 gap-2 text-center">
                            <div className="bg-white/2 p-3 rounded-xl border border-white/5">
                              <p className="text-[8px] font-black uppercase tracking-widest text-white/40">Impressions</p>
                              <p className="text-lg font-black text-white mt-1">{analyticsData.abTesting?.variantB?.impressions ?? 0}</p>
                            </div>
                            <div className="bg-white/2 p-3 rounded-xl border border-white/5">
                              <p className="text-[8px] font-black uppercase tracking-widest text-white/40">Clicks</p>
                              <p className="text-lg font-black text-white mt-1">{analyticsData.abTesting?.variantB?.clicks ?? 0}</p>
                            </div>
                            <div className="bg-white/2 p-3 rounded-xl border border-white/5">
                              <p className="text-[8px] font-black uppercase tracking-widest text-white/40">CTR</p>
                              <p className="text-lg font-black text-purple-400 mt-1">{(analyticsData.abTesting?.variantB?.ctr ?? 0).toFixed(1)}%</p>
                            </div>
                          </div>

                          <div className="space-y-1">
                            <div className="flex justify-between text-[8px] font-black uppercase tracking-wider text-white/40">
                              <span>Click-Through Rate (CTR)</span>
                              <span>{(analyticsData.abTesting?.variantB?.ctr ?? 0).toFixed(1)}%</span>
                            </div>
                            <div className="h-2 bg-black/40 rounded-full overflow-hidden border border-white/5 relative">
                              <div 
                                className="h-full bg-purple-500 rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]" 
                                style={{ width: `${Math.min(100, (analyticsData.abTesting?.variantB?.ctr ?? 0) * 10)}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Winner / Recommendation Callout */}
                      {analyticsData.abTesting?.recommendation && (
                        <div className={`p-4 rounded-2xl border transition-all duration-300 ${
                          (analyticsData.abTesting.variantB?.ctr > analyticsData.abTesting.variantA?.ctr) 
                            ? 'bg-purple-950/10 border-purple-500/25 text-purple-300'
                            : (analyticsData.abTesting.variantA?.ctr > analyticsData.abTesting.variantB?.ctr)
                            ? 'bg-pink-950/10 border-pink-500/25 text-pink-300'
                            : 'bg-white/5 border-white/10 text-white/80'
                        }`}>
                          <div className="flex gap-3 items-start">
                            <div className="p-2 rounded-xl bg-white/5 border border-white/15">
                              <Sparkles className="w-4 h-4 text-primary" />
                            </div>
                            <div className="space-y-1 text-left">
                              <p className="text-[10px] font-black uppercase tracking-widest">
                                {(analyticsData.abTesting.variantB?.ctr === 0 && analyticsData.abTesting.variantA?.ctr === 0) 
                                  ? 'Experiment Status'
                                  : (analyticsData.abTesting.variantB?.ctr > analyticsData.abTesting.variantA?.ctr)
                                  ? 'Engagement Winner: Variant B'
                                  : (analyticsData.abTesting.variantA?.ctr > analyticsData.abTesting.variantB?.ctr)
                                  ? 'Compatibility Winner: Variant A'
                                  : 'Experiment Tied'}
                              </p>
                              <p className="text-xs font-semibold leading-relaxed">
                                {analyticsData.abTesting.recommendation}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Post-Level Breakdown */}
                      <div className="space-y-3">
                        <span className="text-[10px] font-black uppercase text-white/40 tracking-widest block text-left">
                          Content-Level A/B Performance Breakdown
                        </span>
                        
                        {!analyticsData.abTesting?.clicksByPost || analyticsData.abTesting.clicksByPost.length === 0 ? (
                          <div className="py-6 text-center border border-dashed border-white/10 rounded-2xl">
                            <p className="text-[9px] font-black uppercase tracking-widest text-white/30">No post telemetry recorded yet</p>
                          </div>
                        ) : (
                          <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1 scrollbar-thin">
                            {analyticsData.abTesting.clicksByPost.map((post: any) => {
                              const totalPostClicks = post.clicksA + post.clicksB;
                              const shareA = totalPostClicks > 0 ? (post.clicksA / totalPostClicks) * 100 : 50;
                              const shareB = totalPostClicks > 0 ? (post.clicksB / totalPostClicks) * 100 : 50;

                              return (
                                <div key={post.postId} className="bg-white/2 p-4 rounded-2xl border border-white/5 hover:border-white/10 transition space-y-3">
                                  <div className="flex justify-between items-start">
                                    <div className="text-left max-w-[70%]">
                                      <p className="text-xs font-black text-white leading-relaxed">{post.title}</p>
                                      <p className="text-[8px] text-white/40 uppercase tracking-widest mt-0.5">Post ID: {post.postId}</p>
                                    </div>
                                    <div className="text-right">
                                      <span className="text-xs font-black text-success">{totalPostClicks} Total Clicks</span>
                                      <p className="text-[8px] text-white/40 uppercase tracking-widest mt-0.5">
                                        {(post.impressionsA + post.impressionsB)} views
                                      </p>
                                    </div>
                                  </div>

                                  {/* Split distribution bar */}
                                  <div className="space-y-1.5">
                                    <div className="h-2 bg-white/5 rounded-full overflow-hidden flex border border-white/5">
                                      <div 
                                        className="h-full bg-pink-500 shadow-[0_0_10px_rgba(236,72,153,0.3)] transition-all duration-500" 
                                        style={{ width: `${shareA}%` }} 
                                      />
                                      <div 
                                        className="h-full bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.3)] transition-all duration-500" 
                                        style={{ width: `${shareB}%` }} 
                                      />
                                    </div>
                                    <div className="flex justify-between text-[7px] font-black uppercase tracking-widest text-white/30">
                                      <span className="text-pink-400">Variant A: {post.clicksA} clicks (CTR: {post.ctrA.toFixed(1)}%)</span>
                                      <span className="text-purple-400">Variant B: {post.clicksB} clicks (CTR: {post.ctrB.toFixed(1)}%)</span>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* MAIN CHARTS SECTION */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* 7-DAY GROWTH CHART */}
                      <div className="glass-card p-6 bg-white/2 border border-white/5 rounded-3xl flex flex-col justify-between">
                        <div>
                          <h4 className="text-[10px] font-black uppercase tracking-widest mb-4 flex items-center gap-1.5 text-white/70">
                            <Activity className="w-3.5 h-3.5 text-accent" /> 7-Day Subscriber Growth Flow
                          </h4>
                        </div>
                        <div className="flex items-end gap-2 h-40 mt-2">
                          {analyticsData.growth.map((g: any, i: number) => {
                            const maxCount = Math.max(...analyticsData.growth.map((item: any) => item.count), 1);
                            const heightPct = (g.count / maxCount) * 100;
                            return (
                              <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                                <div className="w-full relative flex items-end justify-center h-full">
                                  <span className="absolute -top-6 bg-accent text-black font-black text-[9px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition duration-200 pointer-events-none">
                                    {g.count}
                                  </span>
                                  <div 
                                    className="w-full bg-accent/20 hover:bg-accent border border-accent/20 hover:border-accent rounded-t-lg transition-all duration-300" 
                                    style={{ height: `${Math.max(heightPct, 5)}%` }} 
                                  />
                                </div>
                                <span className="text-[8px] font-black text-white/30 uppercase">{g.day}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* ENGAGEMENT DEPTH DISTRIBUTION */}
                      <div className="glass-card p-6 bg-white/2 border border-white/5 rounded-3xl">
                        <h4 className="text-[10px] font-black uppercase tracking-widest mb-4 flex items-center gap-1.5 text-white/70">
                          <Sparkles className="w-3.5 h-3.5 text-primary" /> Engagement Depth Distribution
                        </h4>
                        <div className="space-y-4">
                          {analyticsData.engagement.map((item: any) => (
                            <div key={item.label} className="group">
                              <div className="flex justify-between text-[9px] font-black uppercase tracking-wider mb-1 text-white/70">
                                <span>{item.label}</span>
                                <span className="group-hover:text-white transition">{item.count} ({item.pct}%)</span>
                              </div>
                              <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
                                <div 
                                  className={`h-full ${item.color} shadow-lg transition-all duration-500`} 
                                  style={{ width: `${item.pct}%` }} 
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* REVENUE SPLIT & TOP SUPPORTERS */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* REVENUE ESCROW SPLIT */}
                      <div className="glass-card p-6 bg-white/2 border border-white/5 rounded-3xl flex flex-col justify-between">
                        <div>
                          <h4 className="text-[10px] font-black uppercase tracking-widest mb-4 flex items-center gap-1.5 text-white/70">
                            <Lock className="w-3.5 h-3.5 text-success" /> Escrow Payout Matrix
                          </h4>
                          <p className="text-[9px] text-white/40 uppercase font-black tracking-widest leading-relaxed mb-6">
                            Under the platform model, 80% of sub & crowdfunding revenue goes to creator escrow immediately. 20% is retained as platform commission.
                          </p>
                        </div>
                        
                        <div className="space-y-4">
                          <div className="flex justify-between text-[11px] font-black uppercase tracking-wider text-white">
                            <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-success" /> Escrow (80%)</span>
                            <span className="text-success">${analyticsData.revenueBreakdown.creatorEscrow.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-[11px] font-black uppercase tracking-wider text-white/60">
                            <span className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5 text-white/40" /> Platform (20%)</span>
                            <span>${analyticsData.revenueBreakdown.platformCut.toFixed(2)}</span>
                          </div>
                          
                          <div className="h-3 bg-white/5 rounded-xl overflow-hidden flex border border-white/5 mt-4">
                            <div className="h-full bg-primary" style={{ width: '80%' }} />
                            <div className="h-full bg-white/10" style={{ width: '20%' }} />
                          </div>
                          <div className="flex justify-between text-[7px] font-black text-white/30 uppercase tracking-widest pt-1">
                            <span>Creator Yield (80%)</span>
                            <span>Fee (20%)</span>
                          </div>
                        </div>
                      </div>

                      {/* TOP SUPPORTERS LIST */}
                      <div className="glass-card p-6 bg-white/2 border border-white/5 rounded-3xl">
                        <h4 className="text-[10px] font-black uppercase tracking-widest mb-4 flex items-center gap-1.5 text-white/70">
                          <Crown className="w-3.5 h-3.5 text-primary" /> Premium Supporters Roster
                        </h4>
                        
                        {analyticsData.topSupporters.length === 0 ? (
                          <div className="h-36 flex items-center justify-center border border-dashed border-white/10 rounded-2xl">
                            <p className="text-[9px] font-black uppercase tracking-widest text-white/30">No supporters registered yet</p>
                          </div>
                        ) : (
                          <div className="space-y-3 max-h-[190px] overflow-y-auto pr-1 scrollbar-thin">
                            {analyticsData.topSupporters.map((supporter: any, idx: number) => (
                              <div key={supporter.id} className="flex items-center justify-between bg-white/2 p-2.5 rounded-xl border border-white/5 hover:border-white/10 transition">
                                <div className="flex items-center gap-2.5">
                                  <span className="text-[9px] font-black text-white/30 w-4">#{idx + 1}</span>
                                  <div className="w-8 h-8 rounded-full overflow-hidden border border-white/10 bg-white/5">
                                    <img 
                                      src={supporter.avatar_url || `https://images.unsplash.com/photo-${1500000000000 + idx * 10000}?w=100&q=80`} 
                                      alt={supporter.username}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                  <div className="text-left">
                                    <p className="text-[10px] font-bold text-white leading-none">
                                      {supporter.display_name || `@${supporter.username}`}
                                    </p>
                                    <p className="text-[8px] text-white/40 mt-0.5">
                                      @{supporter.username}
                                    </p>
                                  </div>
                                </div>
                                <span className="text-[10px] font-black text-success">
                                  +${Number(supporter.totalSpent).toFixed(2)}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'consent_inbox' && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-2xl font-black tracking-tighter uppercase mb-2">
                    <Users className="text-primary inline-block mr-2 w-6 h-6 align-text-bottom" /> Consent & Depiction Inbox
                  </h2>
                  <p className="text-[10px] text-white/40 uppercase font-black tracking-widest mt-1">
                    Manage digital consent requests and track outbound performer approvals
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-8">
                  {/* Pane 1: Received Consent Requests */}
                  <div className="glass-card p-6 bg-white/2 border border-white/5 rounded-3xl space-y-6">
                    <div className="flex justify-between items-center border-b border-white/5 pb-3">
                      <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white/80 flex items-center gap-2">
                        <Inbox className="w-4 h-4 text-primary" /> Received Requests (Inbox)
                      </h3>
                      <span className="text-[8px] font-black text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
                        {receivedConsents.filter(r => r.status === 'pending').length} Pending
                      </span>
                    </div>

                    {receivedConsents.length === 0 ? (
                      <div className="py-12 text-center text-white/30 font-bold uppercase tracking-widest text-[9px] border border-dashed border-white/5 rounded-2xl">
                        Your consent inbox is empty
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {receivedConsents.map((req) => (
                          <div 
                            key={req.id} 
                            className={`p-4 rounded-2xl border transition-all duration-300 flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                              req.status === 'approved' 
                                ? 'bg-emerald-950/10 border-emerald-500/20' 
                                : req.status === 'declined'
                                ? 'bg-red-950/10 border-red-500/20'
                                : 'bg-white/2 border-white/5 hover:border-white/10'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full overflow-hidden border border-white/10 shrink-0">
                                <img src={req.creatorAvatar} alt={req.creatorName} className="w-full h-full object-cover" />
                              </div>
                              <div className="text-left space-y-1">
                                <div className="flex items-center gap-2">
                                  <p className="text-xs font-black text-white">{req.creatorName}</p>
                                  <span className="px-2 py-0.5 bg-white/5 border border-white/10 rounded text-[7px] font-black uppercase tracking-widest text-primary">
                                    {req.type}
                                  </span>
                                </div>
                                <p className="text-xs text-white/70 font-semibold">"{req.title}"</p>
                                <p className="text-[8px] text-white/30 font-mono">Requested at: {new Date(req.createdAt).toLocaleString()}</p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 self-end md:self-center">
                              {req.status === 'pending' ? (
                                <>
                                  <button
                                    onClick={() => handleUpdateConsentRequest(req.id, 'declined')}
                                    className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/25 rounded-xl text-[9px] font-black uppercase tracking-widest transition"
                                  >
                                    Deny Consent
                                  </button>
                                  <button
                                    onClick={() => handleUpdateConsentRequest(req.id, 'approved')}
                                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-black rounded-xl text-[9px] font-black uppercase tracking-widest transition shadow-lg shadow-emerald-500/15"
                                  >
                                    Grant Consent
                                  </button>
                                </>
                              ) : (
                                <span className={`px-3 py-1 rounded-xl text-[8px] font-black uppercase tracking-widest border ${
                                  req.status === 'approved' 
                                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' 
                                    : 'bg-red-500/20 text-red-400 border-red-500/30'
                                }`}>
                                  {req.status === 'approved' ? 'Consent Granted' : 'Consent Denied'}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Pane 2: Outgoing Tracking */}
                  <div className="glass-card p-6 bg-white/2 border border-white/5 rounded-3xl space-y-6">
                    <div className="flex justify-between items-center border-b border-white/5 pb-3">
                      <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white/80 flex items-center gap-2">
                        <Send className="w-4.5 h-4.5 text-primary" /> Outgoing Tracking & Verification
                      </h3>
                      <span className="text-[8px] font-black text-white/40 bg-white/5 px-2 py-0.5 rounded border border-white/10 uppercase">
                        Real-time status
                      </span>
                    </div>

                    <p className="text-[9px] text-white/40 uppercase tracking-widest leading-relaxed">
                      Track the approval status of registered platform performers tagged in your media uploads. Gated uploads will be released to public feeds once all consents are granted.
                    </p>

                    {(() => {
                      const postsWithCoPerformers = uploadedPosts.filter(post => {
                        const parts = post.description?.split('\n\n===CO_PERFORMERS===\n');
                        return !!parts?.[1];
                      });

                      if (postsWithCoPerformers.length === 0) {
                        return (
                          <div className="py-12 text-center text-white/30 font-bold uppercase tracking-widest text-[9px] border border-dashed border-white/5 rounded-2xl">
                            No co-performer posts found
                          </div>
                        );
                      }

                      return (
                        <div className="space-y-4">
                          {postsWithCoPerformers.map(post => {
                            const parts = post.description.split('\n\n===CO_PERFORMERS===\n');
                            let coPerformers: any[] = [];
                            try {
                              coPerformers = JSON.parse(parts[1]);
                            } catch (e) {}

                            return (
                              <div key={post.id} className="p-4 bg-black/40 border border-white/5 rounded-2xl space-y-3">
                                <div className="flex justify-between items-start">
                                  <div className="text-left">
                                    <h4 className="font-bold text-xs text-white">{post.title}</h4>
                                    <p className="text-[8px] font-mono text-white/30">Post ID: {post.id}</p>
                                  </div>
                                  <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${
                                    post.moderation_status === 'approved' 
                                      ? 'bg-green-500/20 text-green-400 border border-green-500/20' 
                                      : 'bg-amber-500/20 text-amber-400 border border-amber-500/20 animate-pulse'
                                  }`}>
                                    Gate: {post.moderation_status === 'approved' ? 'Released' : 'Compliance Hold'}
                                  </span>
                                </div>

                                <div className="space-y-2">
                                  {coPerformers.map((p, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-2 bg-white/2 border border-white/5 rounded-xl">
                                      <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full overflow-hidden border border-white/10 shrink-0 bg-white/5">
                                          {p.avatar && <img src={p.avatar} className="w-full h-full object-cover" />}
                                        </div>
                                        <div className="text-left">
                                          <p className="text-[10px] font-black text-white">{p.name}</p>
                                          <p className="text-[8px] text-white/30 uppercase tracking-widest">{p.type} Performer</p>
                                        </div>
                                      </div>

                                      <div className="flex items-center gap-2">
                                        <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                                          p.status === 'approved' 
                                            ? 'bg-emerald-500/20 text-emerald-400' 
                                            : 'bg-amber-500/20 text-amber-400 animate-pulse'
                                        }`}>
                                          {p.status === 'approved' ? 'Consent Granted' : 'Pending Consent'}
                                        </span>

                                        {p.status === 'pending' && p.type === 'registered' && (
                                          <button
                                            type="button"
                                            onClick={() => handleSimulateConsentApprove(post.id, p.name)}
                                            className="px-2 py-1 bg-primary/20 hover:bg-primary/30 border border-primary/30 text-primary rounded text-[7px] font-black uppercase tracking-wider transition"
                                          >
                                            Simulate Accept
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-2xl font-black tracking-tighter uppercase mb-2">
                    <Settings className="text-primary inline-block mr-2 w-6 h-6 align-text-bottom" /> Studio Settings
                  </h2>
                  <p className="text-[10px] text-white/40 uppercase font-black tracking-widest mt-1">
                    Configure base subscription, private interaction rates, and geo restrictions
                  </p>
                </div>

                {isLoadingSettings ? (
                  <div className="p-12 flex flex-col items-center justify-center space-y-4 glass-card bg-white/2 border border-white/5 rounded-3xl">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Loading Secure Settings Matrix...</p>
                  </div>
                ) : !profile ? (
                  <div className="p-12 text-center glass-card bg-red-950/5 border border-red-500/20 rounded-3xl space-y-4">
                    <ShieldAlert className="w-10 h-10 text-red-500 mx-auto" />
                    <h3 className="text-lg font-black uppercase tracking-wider">Authentication Required</h3>
                    <p className="text-xs text-white/40 max-w-sm mx-auto">Please sign in to access your Creator Studio settings.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* LEFT COLUMN: Pricing & Rates */}
                    <div className="space-y-6">
                      <div className="glass-card p-6 bg-white/2 border border-white/5 rounded-3xl space-y-6">
                        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white/80 flex items-center gap-2 pb-3 border-b border-white/5">
                          <DollarSign className="w-4 h-4 text-primary" /> Monetization Settings
                        </h3>

                        {/* Subscription price */}
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <label className="text-[9px] font-black text-white/40 uppercase tracking-widest">Base Subscription Price</label>
                            <span className="text-[10px] font-black text-primary">${baseSubscriptionPrice.toFixed(2)} / Month</span>
                          </div>
                          <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 text-xs font-black font-mono">$</span>
                            <input 
                              type="number" 
                              min="0"
                              max="1000"
                              step="0.01"
                              value={baseSubscriptionPrice || ''}
                              onChange={e => setBaseSubscriptionPrice(Math.max(0, Number(e.target.value)))}
                              className="w-full bg-white/5 border border-white/10 rounded-2xl pl-8 pr-6 py-4 text-xs font-black tracking-widest text-white outline-none focus:border-primary transition"
                              placeholder="0.00"
                            />
                          </div>
                          <p className="text-[8px] text-white/30 uppercase tracking-widest">
                            Monthly VIP Subscription Rate for premium post feeds.
                          </p>
                        </div>

                        {/* PPV base rate */}
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <label className="text-[9px] font-black text-white/40 uppercase tracking-widest">PPV Base Rate</label>
                            <span className="text-[10px] font-black text-primary">${ppvBaseRate.toFixed(2)}</span>
                          </div>
                          <div className="flex items-center gap-4">
                            <input 
                              type="range" 
                              min="0" 
                              max="200" 
                              step="5"
                              value={ppvBaseRate}
                              onChange={e => setPpvBaseRate(Number(e.target.value))}
                              className="flex-1 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary"
                            />
                            <div className="w-16 bg-white/5 border border-white/10 text-center py-2 rounded-xl text-xs font-black font-mono">
                              ${ppvBaseRate}
                            </div>
                          </div>
                          <p className="text-[8px] text-white/30 uppercase tracking-widest">
                            Default price required to unlock PPV images or custom clips.
                          </p>
                        </div>

                        {/* Private Call price */}
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <label className="text-[9px] font-black text-white/40 uppercase tracking-widest">Private Video Call Rate</label>
                            <span className="text-[10px] font-black text-primary">${privateCallPrice.toFixed(2)} / Min</span>
                          </div>
                          <div className="flex items-center gap-4">
                            <input 
                              type="range" 
                              min="0" 
                              max="50" 
                              step="1"
                              value={privateCallPrice}
                              onChange={e => setPrivateCallPrice(Number(e.target.value))}
                              className="flex-1 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary"
                            />
                            <div className="w-16 bg-white/5 border border-white/10 text-center py-2 rounded-xl text-xs font-black font-mono">
                              ${privateCallPrice}/m
                            </div>
                          </div>
                          <p className="text-[8px] text-white/30 uppercase tracking-widest">
                            Rate per minute charged to fans for private live interactions.
                          </p>
                        </div>

                        {/* Custom Request Permissions */}
                        <div className="space-y-2 pt-4 border-t border-white/5">
                          <label className="text-[9px] font-black text-white/40 uppercase tracking-widest">Custom Request Permissions</label>
                          <select 
                            value={customRequestPermission}
                            onChange={e => setCustomRequestPermission(e.target.value as 'anyone' | 'restricted')}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-4 text-xs font-black tracking-widest text-white outline-none focus:border-primary transition"
                          >
                            <option value="anyone" className="bg-black text-white">Allow Any Member</option>
                            <option value="restricted" className="bg-black text-white">Only Matched / Subscribed Members</option>
                          </select>
                          <p className="text-[8px] text-white/30 uppercase tracking-widest">
                            Control which members are allowed to submit custom content orders.
                          </p>
                        </div>
                      </div>

                      {/* Tax & Payout Form Section (Financial Gateway DAC7/TIN check) */}
                      <div className="glass-card p-6 bg-white/2 border border-white/5 rounded-3xl space-y-6">
                        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white/80 flex items-center gap-2 pb-3 border-b border-white/5">
                          <ShieldCheck className="w-4 h-4 text-primary" /> Tax Profile (Financial Gateway)
                        </h3>
                        <p className="text-[8px] text-white/40 uppercase tracking-widest leading-relaxed">
                          To comply with DAC7, IRS Form 1099, and global AML regulations, creators must submit a valid taxpayer identification card.
                        </p>

                        <div className="space-y-2">
                          <label className="text-[9px] uppercase tracking-widest font-black text-white/40">Legal Business / Individual Name</label>
                          <input 
                            type="text" 
                            placeholder="e.g. Elena Rostova Media LLC" 
                            value={legalBusinessName}
                            onChange={(e) => setLegalBusinessName(e.target.value)}
                            className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-xs text-white placeholder-white/20 focus:border-primary focus:outline-none transition"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-[9px] uppercase tracking-widest font-black text-white/40">Taxpayer ID Number (TIN / SSN / EIN)</label>
                          <input 
                            type="text" 
                            placeholder="e.g. XX-XXXXXXX" 
                            value={taxIdNumber}
                            onChange={(e) => setTaxIdNumber(e.target.value)}
                            className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-xs text-white placeholder-white/20 focus:border-primary focus:outline-none transition font-mono"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-[9px] uppercase tracking-widest font-black text-white/40">VAT / GST Identification (Optional)</label>
                          <input 
                            type="text" 
                            placeholder="e.g. EU123456789" 
                            value={vatGstNumber}
                            onChange={(e) => setVatGstNumber(e.target.value)}
                            className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-xs text-white placeholder-white/20 focus:border-primary focus:outline-none transition font-mono"
                          />
                        </div>
                      </div>
                    </div>

                    {/* RIGHT COLUMN: Geo restrictions & Integrations */}
                    <div className="space-y-6">
                      {/* AI Assistant Config Card */}
                      <ConfigPanel
                        aiAgentActive={aiAgentActive}
                        setAiAgentActive={setAiAgentActive}
                        chatAutoEnabled={chatAutoEnabled}
                        setChatAutoEnabled={setChatAutoEnabled}
                        contentOpsEnabled={contentOpsEnabled}
                        setContentOpsEnabled={setContentOpsEnabled}
                        legalAuditEnabled={legalAuditEnabled}
                        setLegalAuditEnabled={setLegalAuditEnabled}
                        digitalReplicaConsent={digitalReplicaConsent}
                        setDigitalReplicaConsent={setDigitalReplicaConsent}
                        onToggleSave={handleAiToggleSave}
                        isSaving={isAiToggleSaving}
                        matchCount={creatorMatchCount}
                      />

                      {/* Google Calendar Sync Card */}
                      <div className="glass-card p-6 bg-white/2 border border-white/5 rounded-3xl space-y-6">
                        <div className="flex justify-between items-center pb-3 border-b border-white/5">
                          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white/80 flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-primary" /> Google Calendar Sync
                          </h3>
                          {isCalendarConnected && (
                            <span className="text-[8px] font-black text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20 uppercase tracking-widest animate-pulse">
                              Sync Active
                            </span>
                          )}
                        </div>

                        <div className="space-y-4">
                          <p className="text-[9px] text-white/40 uppercase tracking-widest leading-relaxed">
                            Synchronize your connection availability, VIP date events, and stream listings directly to your Google Calendar.
                          </p>

                          {isCheckingCalendar ? (
                            <div className="flex items-center gap-2 text-white/40 text-xs font-black">
                              <Loader2 className="w-4 h-4 animate-spin text-primary" />
                              Checking availability gateway...
                            </div>
                          ) : isCalendarConnected ? (
                            <div className="space-y-3">
                              <div className="p-4 bg-primary/5 border border-primary/10 rounded-2xl flex items-center gap-3">
                                <ShieldCheck className="w-5 h-5 text-primary shrink-0" />
                                <div>
                                  <p className="text-[9px] font-black text-white/60 uppercase tracking-widest">Connection Live</p>
                                  <p className="text-[10px] text-white/40 font-mono select-all mt-0.5">{calendarEmail}</p>
                                </div>
                              </div>

                              <button 
                                type="button"
                                onClick={handleDisconnectCalendar}
                                className="w-full py-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 rounded-xl text-[9px] font-black uppercase tracking-widest transition cursor-pointer"
                              >
                                Disconnect Calendar
                              </button>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              <div className="p-4 bg-white/5 border border-white/5 rounded-2xl flex items-center gap-3">
                                <Calendar className="w-5 h-5 text-white/20 shrink-0" />
                                <p className="text-[8px] text-white/40 uppercase tracking-widest leading-relaxed">
                                  No calendar linked. Connect your Google account to automate scheduling.
                                </p>
                              </div>

                              <button 
                                type="button"
                                onClick={handleConnectCalendar}
                                className="w-full py-3 bg-white text-black hover:bg-primary hover:text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition cursor-pointer shadow-lg"
                              >
                                Connect Google Calendar
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="glass-card p-6 bg-white/2 border border-white/5 rounded-3xl space-y-6">
                        <div className="flex justify-between items-center pb-3 border-b border-white/5">
                          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white/80 flex items-center gap-2">
                            <Globe className="w-4 h-4 text-accent" /> Geo Restriction Controls
                          </h3>
                          {/* Custom Toggle switch */}
                          <button 
                            type="button"
                            onClick={() => setGeoRestrictionEnabled(!geoRestrictionEnabled)}
                            className={`relative w-12 h-6 rounded-full transition-colors duration-300 border border-white/10 flex items-center ${
                              geoRestrictionEnabled ? 'bg-accent shadow-[0_0_15px_rgba(0,240,255,0.4)]' : 'bg-white/5'
                            }`}
                          >
                            <motion.div 
                              layout
                              className="w-4 h-4 bg-black rounded-full mx-1"
                              animate={{ x: geoRestrictionEnabled ? 20 : 0 }}
                              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                            />
                          </button>
                        </div>

                        <div className={`space-y-4 transition-opacity duration-300 ${geoRestrictionEnabled ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
                          <div className="space-y-2">
                            <label className="text-[9px] font-black text-white/40 uppercase tracking-widest">Blocked Country Codes</label>
                            <input 
                              type="text" 
                              value={blockedCountries}
                              disabled={!geoRestrictionEnabled}
                              onChange={e => setBlockedCountries(e.target.value)}
                              className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-4 text-xs font-black uppercase tracking-widest text-white outline-none focus:border-accent transition disabled:opacity-50"
                              placeholder="US, FR, CA..."
                            />
                            <p className="text-[8px] text-white/30 uppercase tracking-widest">
                              Comma-separated ISO country codes (e.g. US, FR, GB).
                            </p>
                          </div>

                          {/* Quick suggestions */}
                          <div className="space-y-2">
                            <span className="text-[8px] font-black text-white/40 uppercase tracking-widest">Quick Toggle Suggestions</span>
                            <div className="flex flex-wrap gap-2">
                              {SUGGESTED_COUNTRIES.map(code => {
                                const isBlocked = blockedCountries
                                  .split(',')
                                  .map(c => c.trim().toUpperCase())
                                  .includes(code);
                                return (
                                  <button
                                    key={code}
                                    type="button"
                                    disabled={!geoRestrictionEnabled}
                                    onClick={() => toggleCountryChip(code)}
                                    className={`px-3 py-1.5 rounded-full text-[9px] font-black border transition ${
                                      isBlocked 
                                        ? 'bg-accent/20 border-accent text-accent shadow-[0_0_10px_rgba(0,240,255,0.2)]'
                                        : 'bg-white/5 border-white/10 text-white/40 hover:text-white/80'
                                    }`}
                                  >
                                    {code}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </div>

                        {!geoRestrictionEnabled && (
                          <div className="p-4 bg-white/5 border border-white/5 rounded-2xl flex items-center gap-3">
                            <Shield className="w-5 h-5 text-white/20 shrink-0" />
                            <p className="text-[8px] text-white/40 uppercase tracking-widest leading-relaxed">
                              Geo-restrictions are disabled. Your profile is visible worldwide.
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Face Blur Privacy Controls Card */}
                      <div className="glass-card p-6 bg-white/2 border border-white/5 rounded-3xl space-y-6">
                        <div className="flex justify-between items-center pb-3 border-b border-white/5">
                          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white/80 flex items-center gap-2">
                            <EyeOff className="w-4 h-4 text-primary" /> Face Blur Privacy
                          </h3>
                          {/* Face Blur Active global switch */}
                          <button 
                            type="button"
                            onClick={() => setFaceBlurActive(!faceBlurActive)}
                            className={`relative w-12 h-6 rounded-full transition-colors duration-300 border border-white/10 flex items-center ${
                              faceBlurActive ? 'bg-primary shadow-[0_0_15px_rgba(102,252,241,0.4)]' : 'bg-white/5'
                            }`}
                          >
                            <motion.div 
                              layout
                              className="w-4 h-4 bg-black rounded-full mx-1"
                              animate={{ x: faceBlurActive ? 20 : 0 }}
                              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                            />
                          </button>
                        </div>

                        <div className="space-y-4">
                          <p className="text-[9px] text-white/40 uppercase tracking-widest leading-relaxed">
                            Protect your biometric identity. Obscure your face automatically for low-level connection tiers.
                          </p>

                          <div className={`space-y-4 transition-all duration-500 ${faceBlurActive ? 'opacity-100 max-h-[500px]' : 'opacity-40 pointer-events-none max-h-0 overflow-hidden'}`}>
                            {/* Default policy for uploads toggle */}
                            <div className="flex items-center justify-between p-3 bg-black/20 border border-white/5 rounded-2xl">
                              <div className="text-left">
                                <p className="text-[10px] font-black uppercase tracking-widest text-white/80">Blur New Uploads by Default</p>
                                <p className="text-[8px] text-white/30 uppercase tracking-widest mt-0.5">Automatically enable face blur for all new media gallery uploads.</p>
                              </div>
                              <input 
                                type="checkbox"
                                checked={faceBlurDefault}
                                disabled={!faceBlurActive}
                                onChange={e => setFaceBlurDefault(e.target.checked)}
                                className="accent-primary w-4 h-4 cursor-pointer"
                              />
                            </div>

                            {/* Level Preview Switcher */}
                            <div className="space-y-2 pt-2 border-t border-white/5 text-left">
                              <label className="text-[9px] font-black text-white/40 uppercase tracking-widest">Simulate Relationship Profile View</label>
                              <select 
                                value={previewLevel}
                                onChange={e => setPreviewLevel(e.target.value as any)}
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-xs font-black tracking-widest text-white outline-none focus:border-primary transition"
                              >
                                <option value="none" className="bg-black text-white">Full Reveal (L3+ Friends / Owner)</option>
                                <option value="stranger" className="bg-black text-white">Stranger / L1-2 View (Blurred)</option>
                              </select>
                            </div>

                            {/* Interactive Avatar Preview Box */}
                            <div className="p-4 bg-black/40 border border-white/5 rounded-2xl flex flex-col items-center justify-center text-center">
                              <span className="text-[8px] font-black text-white/30 uppercase tracking-widest mb-3">Live Interactive Preview</span>
                              <div className="w-24 h-24 rounded-full overflow-hidden border border-primary/20 relative shadow-[0_0_20px_rgba(102,252,241,0.15)]">
                                <BlurredFaceImage 
                                  src={profile.avatar_url || 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&q=80'}
                                  alt="Avatar Preview"
                                  sharedScore={previewLevel === 'stranger' ? 5 : 25} // 5 = Stranger (blurred), 25 = Friendly (unblurred)
                                  isEnabledByOwner={faceBlurActive}
                                  faceCoordinates={profile.avatar_face_coordinates || { x: 0.5, y: 0.38, r: 0.18 }}
                                  className="w-full h-full"
                                />
                              </div>
                              <p className="text-[8px] text-primary/80 font-black uppercase tracking-widest mt-3">
                                {previewLevel === 'stranger' ? '🔴 Simulated: Blurred' : '🟢 Simulated: Unblurred'}
                              </p>
                            </div>
                          </div>

                          {!faceBlurActive && (
                            <div className="p-4 bg-white/5 border border-white/5 rounded-2xl flex items-center gap-3">
                              <Eye className="w-5 h-5 text-white/20 shrink-0" />
                              <p className="text-[8px] text-white/40 uppercase tracking-widest leading-relaxed">
                                Face blur privacy is disabled. Your profile photo and public media will be fully visible to all members.
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Action save button */}
                      <div className="space-y-3">
                        {saveError && (
                          <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl text-[9px] font-black uppercase tracking-widest flex items-center gap-2 animate-shake">
                            <ShieldAlert className="w-4 h-4 shrink-0" /> {saveError}
                          </div>
                        )}

                        <button
                          type="button"
                          onClick={handleSaveSettings}
                          disabled={isSavingSettings || isLoadingSettings}
                          className={`w-full py-5 rounded-[2rem] font-black text-[10px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 border ${
                            saveSuccess
                              ? 'bg-emerald-500 text-white border-emerald-400 shadow-[0_0_25px_rgba(16,185,129,0.3)]'
                              : 'bg-primary text-white border-white/10 hover:shadow-[0_0_25px_rgba(102,252,241,0.3)] hover:scale-102 active:scale-98'
                          } disabled:opacity-55`}
                        >
                          {isSavingSettings ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" /> Saving Matrix...
                            </>
                          ) : saveSuccess ? (
                            <>
                              <Check className="w-4 h-4" /> Settings Updated Successfully
                            </>
                          ) : (
                            <>
                              <Settings className="w-4 h-4" /> Save Configuration
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            <div className="glass-card p-6 border-accent/20">
              <h3 className="text-sm font-black uppercase tracking-widest mb-6 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-accent" /> Insights Pulse
              </h3>
              <div className="space-y-6">
                 {[
                   { label: 'Weekly Reach', val: '12.4k', change: '+12%' },
                   { label: 'Engagement Rate', val: '18.2%', change: '+5%' },
                   { label: 'Revenue (7d)', val: '$2,450', change: '+24%' },
                 ].map((stat, i) => (
                   <div key={i} className="flex justify-between items-end border-b border-white/5 pb-4 last:border-0 last:pb-0">
                      <div>
                        <p className="text-[9px] font-black uppercase tracking-widest text-white/40 mb-1">{stat.label}</p>
                        <p className="text-2xl font-black tracking-tighter">{stat.val}</p>
                      </div>
                      <span className="text-[9px] font-black text-green-500 bg-green-500/10 px-2 py-0.5 rounded-md">{stat.change}</span>
                   </div>
                 ))}
              </div>
            </div>

            <div className="glass-card p-6 bg-white/2 border-white/10">
              <h3 className="text-sm font-black uppercase tracking-widest mb-4">Quick Setup</h3>
              <div className="space-y-4">
                 <button className="w-full flex items-center justify-between p-4 bg-black/40 rounded-2xl border border-white/5 hover:border-primary/40 transition group">
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/60 group-hover:text-white">Verify KYC Status</span>
                    <ShieldCheck className="w-4 h-4 text-green-400" />
                 </button>
                 <button className="w-full flex items-center justify-between p-4 bg-black/40 rounded-2xl border border-white/5 hover:border-primary/40 transition group">
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/60 group-hover:text-white">Update Vault Keys</span>
                    <Crown className="w-4 h-4 text-yellow-500" />
                 </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Safety Operations Panel (Layer 3 Content Moderation Queue) */}
      {activeTab === 'safety_ops' && (
        <div className="space-y-6 mt-8">
          <div>
            <h2 className="text-2xl font-black tracking-tighter uppercase mb-2 flex items-center gap-2">
              <Shield className="text-primary inline-block w-6 h-6 animate-pulse" /> Safety Operations Queue (Layer 3)
            </h2>
            <p className="text-[10px] text-white/40 uppercase font-black tracking-widest mt-1">
              DSA Content Moderation Desk — Review and approve/reject pending uploads
            </p>
          </div>

          {allPendingPosts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {allPendingPosts.map((post) => (
                <div 
                  key={post.id} 
                  className="glass-card p-6 bg-black/45 border border-white/10 rounded-3xl space-y-4 text-left relative overflow-hidden"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full overflow-hidden border border-white/10 bg-white/5">
                      <img src={post.creator_profile?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80'} alt={post.creator_profile?.username} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">@{post.creator_profile?.username || 'unknown'}</p>
                      <p className="text-[9px] text-white/40 font-mono">Role: Creator | KYC: Verified</p>
                    </div>
                    <span className="ml-auto text-[8px] font-black uppercase tracking-wider bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2 py-0.5 rounded">
                      {post.tier}
                    </span>
                  </div>

                  <div className="aspect-video rounded-2xl overflow-hidden border border-white/5 relative bg-white/5 flex items-center justify-center">
                    {post.media_type === 'video' ? (
                      <video src={post.media_url} className="w-full h-full object-cover" controls />
                    ) : (
                      <img src={post.media_url} alt={post.title} className="w-full h-full object-cover" />
                    )}
                  </div>

                  {(() => {
                    const parts = post.description?.split('\n\n===CO_PERFORMERS===\n');
                    const cleanDesc = parts?.[0] || post.description || '';
                    let coPerformers: any[] = [];
                    try {
                      if (parts?.[1]) {
                        coPerformers = JSON.parse(parts[1]);
                      }
                    } catch (e) {}
                    
                    const hasPendingConsent = coPerformers.some((p: any) => p.status === 'pending');

                    return (
                      <div className="space-y-3">
                        <div className="space-y-1">
                          <h4 className="font-bold text-sm text-white">{post.title}</h4>
                          <p className="text-xs text-white/60">{cleanDesc || 'No description'}</p>
                          <p className="text-[8px] font-mono text-white/30">Uploaded at: {new Date(post.created_at).toLocaleString()}</p>
                        </div>

                        {coPerformers.length > 0 && (
                          <div className="p-3 bg-white/5 border border-white/10 rounded-2xl space-y-2">
                            <span className="text-[8px] font-black uppercase tracking-widest text-white/40 block">Co-Performer Consent Verification Gate:</span>
                            <div className="flex flex-wrap gap-2">
                              {coPerformers.map((p: any, idx: number) => (
                                <div key={idx} className="flex items-center gap-1.5 px-2 py-1 bg-black/40 border border-white/5 rounded-xl text-[9px]">
                                  {p.avatar && <img src={p.avatar} className="w-4 h-4 rounded-full object-cover" />}
                                  <span className="font-semibold text-white/80">{p.name}</span>
                                  <span className={`text-[7px] font-black uppercase px-1 rounded ${
                                    p.status === 'approved' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400 animate-pulse'
                                  }`}>
                                    {p.status === 'approved' ? 'Verified' : 'Pending'}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {hasPendingConsent && (
                          <div className="p-3 bg-red-950/20 border border-red-500/30 rounded-2xl flex items-start gap-2 text-red-400">
                            <ShieldAlert className="w-4.5 h-4.5 shrink-0 mt-0.5" />
                            <div>
                              <p className="text-[9px] font-black uppercase tracking-wider">Consent Gate Hold</p>
                              <p className="text-[8px] text-red-200 leading-normal">
                                This content contains co-performers with pending digital consent. Release is gated until all parties approve depiction.
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-3 pt-2">
                          <button
                            onClick={() => handleModeratePost(post.id, 'rejected')}
                            disabled={isModerating === post.id}
                            className="flex-1 py-3 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 rounded-xl text-[9px] font-black uppercase tracking-wider transition disabled:opacity-50"
                          >
                            Reject & Quarantine
                          </button>
                          <button
                            onClick={() => handleModeratePost(post.id, 'approved')}
                            disabled={isModerating === post.id || hasPendingConsent}
                            className="flex-1 py-3 bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/30 rounded-xl text-[9px] font-black uppercase tracking-wider transition disabled:opacity-50 flex items-center justify-center gap-1.5"
                            title={hasPendingConsent ? 'Gated: Awaiting performer consent' : undefined}
                          >
                            {isModerating === post.id ? 'Processing...' : (
                              <>
                                {hasPendingConsent && <Lock className="w-3 h-3" />}
                                Approve & Release
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              ))}
            </div>
          ) : (
            <div className="py-20 text-center glass-card bg-white/2 border border-dashed border-white/10 rounded-3xl space-y-3">
              <ShieldCheck className="w-10 h-10 text-green-400 mx-auto" />
              <p className="text-[10px] font-black uppercase tracking-widest text-white/30">Moderation Desk Empty</p>
              <p className="text-xs text-white/40 max-w-xs mx-auto">No pending content requires Layer 3 audit. Publish new media in the Content tab to populate this queue.</p>
            </div>
          )}
        </div>
      )}

      {/* Custom Requests Panel */}
      {activeTab === 'orders' && (
        <div className="space-y-6 mt-8 text-left">
          <div>
            <h2 className="text-2xl font-black tracking-tighter uppercase mb-2 flex items-center gap-2">
              <ListOrdered className="text-primary inline-block w-6 h-6" /> Custom Content Requests
            </h2>
            <p className="text-[10px] text-white/40 uppercase font-black tracking-widest mt-1">
              Review, approve/deny, and track payments for bespoke content requests from members
            </p>
          </div>
          <div className="p-8 glass-card bg-black/40 border border-white/5 rounded-[2rem]">
            <CreatorOrdersPanel customRequestPermission={customRequestPermission} />
          </div>
        </div>
      )}

      {/* Floating Toast Notification */}
      <AnimatePresence>
        {successToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-6 right-6 z-50 glass-card bg-emerald-950/80 border border-emerald-500/30 px-6 py-4 rounded-2xl flex items-center gap-3 shadow-[0_0_30px_rgba(16,185,129,0.3)]"
          >
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
            <span className="text-xs font-black uppercase tracking-wider text-white">{successToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
