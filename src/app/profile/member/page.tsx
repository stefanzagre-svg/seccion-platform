"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
const framerMotion = motion;
import ProfilePreviewModal from "@/components/ProfilePreviewModal";
import EditProfileTab from "@/components/profile/EditProfileTab";
import MemberMediaTab from "@/components/profile/member/MemberMediaTab";
import MemberConnectionsTab from "@/components/profile/member/MemberConnectionsTab";
import MemberRosterTab from "@/components/profile/member/MemberRosterTab";
import MemberInsightsTab from "@/components/profile/member/MemberInsightsTab";
import {
  Calendar,
  Video,
  ListOrdered,
  Activity,
  Heart,
  ShieldCheck,
  Calendar as CalendarIcon,
  History,
  Settings,
  LogOut,
  Lock,
  ChevronRight,
  Wine,
  Cigarette,
  Beer,
  Trophy,
  Plane,
  Music,
  Users,
  Utensils,
  Moon,
  BookOpen,
  Smartphone,
  PawPrint,
  Sun,
  MoreVertical,
  Star,
  CheckCircle2,
  AlertCircle,
  X,
  Shield,
  StarHalf,
  Play,
  Zap,
  PauseCircle,
  SlidersHorizontal,
  Crown,
  Plus,
  RefreshCw,
  Trash2,
  TrendingUp,
  Sparkles,
  DollarSign,
  EyeOff,
  Eye,
  Brain,
  FileText,
  Image,
  Flag,
  Globe,
  Edit3,
} from "lucide-react";

export interface PrivacySettings {
  hidden_values: {
    [field: string]: {
      [value: string]: {
        required_level: string;
        requires_subscription?: boolean;
      };
    };
  };
}
import SafetyWarning from "@/components/SafetyWarning";
import ProfileDetailsModal from "@/components/ProfileDetailsModal";
import {
  HABIT_CHOICES,
  FAMILY_GOALS,
  RELATIONSHIP_GOALS,
  RELATIONSHIP_TYPES,
  SEXUAL_PREFERENCES,
  LANGUAGES,
  HOBBIES,
  MEMBER_PURPOSES,
} from "@/lib/constants";
import MatchGate from "@/components/MatchGate";
import LivePulseHub from "@/components/LivePulseHub";
import RelationshipStory from "@/components/RelationshipStory";
import SparkHint from "@/components/SparkHint";
import SuggestionMovesModal from "@/components/SuggestionMovesModal";
import { type ArchetypeId, type MoodId, type PassionId } from "@/lib/constants";
import { calculateMatchProbability } from "@/lib/match-engine";
import { calculateMasterPrice, calculatePayouts } from "@/lib/pricing-service";
import MasterMixFeed from "@/components/MasterMixFeed";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { getResilientSession, getResilientProfile, safeSupabaseQuery } from "@/lib/supabase-safe";
import {
  getDualGaugeState,
  resolveSharedScore,
  scoreToLevel,
  RELATIONSHIP_LEVELS,
} from "@/lib/relationship-engine";
import {
  fetchMatches,
  getRelationshipState,
  sendSuggestionMove,
  updateRelationshipScore,
  fetchProfileMedia,
  uploadProfileMedia,
  deleteProfileMedia,
  type ProfileMedia,
} from "@/lib/relationship-db";
import {
  canRate,
  calculateCreatorRating,
  calculateMemberRating,
} from "@/lib/rating-engine";
import { ShieldAlert, Loader2 } from "lucide-react";
import CreatorGoalProgress from "@/components/CreatorGoalProgress";
import ContributeModal from "@/components/ContributeModal";
import MultiSelectModal from "@/components/MultiSelectModal";
import BlurredFaceImage from "@/components/BlurredFaceImage";
import ReportModal from "@/components/modals/ReportModal";
import RequirementGateModal from "@/components/modals/RequirementGateModal";
import { useTranslation } from "@/context/LanguageContext";

const LIFESTYLE_ICONS: Record<string, any> = {
  drinking: Wine,
  smoking: Cigarette,
  partying: Beer,
  workout: Trophy,
  traveling: Plane,
  dancing: Music,
  socializing: Users,
  'healthy eating': Utensils,
  sleep: Moon,
  reading: BookOpen,
  'social media': Smartphone,
  'pet lover': PawPrint,
  'morning/night': Sun
};

const MOCK_USER = {
  gender: "Male",
  location: "San Francisco",
  origins: "San Francisco",
  username: "Alex_N",
  avatar:
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80",
  kycVerified: true,
  hobbies: ["Fitness", "Tech", "Traveler"],
  relationshipGoal: "Good Vibe Instant Crush",
  relationshipType: "Monogamous",
  relationshipGoals: ["Good Vibe Instant Crush"],
  relationshipTypes: ["Monogamous"],
  sexualPreferences: ["Heterosexual"],
  favoriteLanguages: ["English"],
  additionalLanguages: ["Spanish"],
  familyGoals: "Want children",
  archetype: "caregiver" as ArchetypeId,
  moods: ["flirty_playful", "exclusive_vip"] as MoodId[],
  corePassion: "fitness" as PassionId,
  age: 28,
  isKycVerified: true,
  lastActiveAt: new Date().toISOString(),
  engagementScore: 92,
  lifestyle: {
    workout: "Often",
    traveling: "Monthly",
    partying: "Sometimes",
    "healthy eating": "Every Day",
    socializing: "Often",
    reading: "Weekly",
    sleep: "6-7 Hours",
    smoking: "Never",
    drinking: "Socially",
    "social media": "Socially active",
    pets: "Dog",
    "morning/night": "Night Owl",
  },
  habits: {
    workout: "Often",
    traveling: "Monthly",
    partying: "Sometimes",
    "healthy eating": "Every Day",
    socializing: "Often",
    reading: "Weekly",
    sleep: "6-7 Hours",
    smoking: "Never",
    drinking: "Socially",
    "social media": "Socially active",
    pets: "Dog",
    "morning/night": "Night Owl",
  },
};

const MOCK_CANDIDATES = [
  {
    id: "placeholder-creator-a",
    name: "Creator A",
    avatar:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&q=80",
    gender: "Female",
    location: "San Francisco",
    origins: "San Francisco",
    hobbies: ["Fitness", "Music", "Traveling"],
    relationshipGoal: "Good Vibe Instant Crush",
    relationshipType: "Monogamous",
    sexualPreferences: ["Heterosexual"],
    familyGoals: "Want children",
    archetype: "dreamer" as ArchetypeId,
    moods: ["flirty_playful", "exclusive_vip"] as MoodId[],
    corePassion: "fitness" as PassionId,
    age: 26,
    basePrice: 15,
    isKycVerified: true,
    lastActiveAt: new Date().toISOString(),
    engagementScore: 95,
    lifestyle: {
      workout: "Often",
      traveling: "Monthly",
      partying: "Sometimes",
      "healthy eating": "Every Day",
      socializing: "Often",
      reading: "Weekly",
      sleep: "6-7 Hours",
      smoking: "Never",
      drinking: "Socially",
      "social media": "Socially active",
      pets: "Dog",
      "morning/night": "Night Owl",
    },
  },
  {
    id: "placeholder-creator-b",
    name: "Creator B",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&q=80",
    gender: "Female",
    location: "San Jose",
    origins: "San Jose",
    hobbies: ["Tech", "Gaming", "Art"],
    relationshipGoal: "Not limit myself",
    relationshipType: "Monogamous",
    sexualPreferences: ["Heterosexual", "Bisexual"],
    familyGoals: "Open to children",
    archetype: "explorer" as ArchetypeId,
    moods: ["deep_intimate", "creative_showcase"] as MoodId[],
    corePassion: "art" as PassionId,
    age: 27,
    basePrice: 12,
    isKycVerified: true,
    lastActiveAt: new Date().toISOString(),
    engagementScore: 88,
    lifestyle: {
      workout: "Sometimes",
      traveling: "Every Week",
      partying: "Often",
      "healthy eating": "Sometimes",
      socializing: "Every Day",
      reading: "Monthly",
      sleep: "8+ Hours",
      smoking: "Never",
      drinking: "Socially",
      "social media": "Influencer status",
      pets: "Cat",
      "morning/night": "Balanced",
    },
  },
  {
    id: "placeholder-creator-c",
    name: "Creator C",
    avatar:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&q=80",
    gender: "Female",
    location: "Los Angeles",
    origins: "Los Angeles",
    hobbies: ["Music", "Yoga", "Fashion"],
    relationshipGoal: "Let's figure after a date.",
    relationshipType: "Monogamous",
    sexualPreferences: ["Heterosexual"],
    familyGoals: "Don't want children",
    archetype: "rebel" as ArchetypeId,
    moods: ["flirty_playful", "party_dance"] as MoodId[],
    corePassion: "music" as PassionId,
    age: 24,
    basePrice: 10,
    isKycVerified: false,
    lastActiveAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    engagementScore: 60,
    lifestyle: {
      workout: "Sometimes",
      traveling: "Yearly",
      partying: "Every Weekend",
      "healthy eating": "Sometimes",
      socializing: "Often",
      reading: "Never",
      sleep: "6-7 Hours",
      smoking: "Socially",
      drinking: "Regularly",
      "social media": "Influencer status",
      pets: "Not for me",
      "morning/night": "Night Owl",
    },
  },
  {
    id: "marco",
    name: "Marco",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&q=80",
    gender: "Male",
    location: "San Francisco",
    origins: "San Francisco",
    hobbies: ["Tech", "Outdoors"],
    relationshipGoal: "Long term partner",
    relationshipType: "Polyamorous",
    sexualPreferences: ["Gay"],
    familyGoals: "Want children",
    archetype: "protector" as ArchetypeId,
    moods: ["secret_confessions"] as MoodId[],
    corePassion: "career" as PassionId,
    age: 30,
    isKycVerified: true,
    lastActiveAt: new Date().toISOString(),
    engagementScore: 90,
    lifestyle: {
      workout: "Every Day",
      traveling: "Yearly",
      partying: "Never",
      "healthy eating": "Every Day",
      socializing: "Sometimes",
      reading: "Daily",
      sleep: "8+ Hours",
      smoking: "Never",
      drinking: "Never",
      "social media": "Off the grid",
      pets: "Dog",
      "morning/night": "Early Bird",
    },
  },
];

const INSIGHT_PROMPTS = {
  chemistry: {
    categoryName: "Chemistry & Connection",
    prompts: [
      "What is your dream first date?",
      "What is your biggest green flag in a partner?",
      "How do you show someone you care?"
    ]
  },
  conflict: {
    categoryName: "Vibes & Communication",
    prompts: [
      "When stressed, do you prefer space or talking it out?",
      "What is a funny or annoying pet peeve of yours?",
      "Do you resolve arguments immediately or cool down first?"
    ]
  },
  investment: {
    categoryName: "Lifestyle & Space",
    prompts: [
      "Cozy homebody or active explorer on weekends?",
      "What is a thoughtful gesture you always appreciate?",
      "How would you spend a perfect free day?"
    ]
  },
  archetype: {
    categoryName: "Passions & Vibe",
    prompts: [
      "What hobby could you talk about for hours?",
      "What song or movie always boosts your mood?",
      "What is a simple daily pleasure you love?"
    ]
  },
  ethics: {
    categoryName: "Growth & Values",
    prompts: [
      "What is a goal you're excited about right now?",
      "What is an important relationship boundary for you?"
    ]
  }
};

export default function MemberProfile() {
  const { t } = useTranslation();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<
    "status" | "calendar" | "livestream" | "track" | "master" | "insights" | "media" | "edit" | "preferences"
  >("edit");

  // Profile Album Media States
  const [mediaItems, setMediaItems] = useState<ProfileMedia[]>([]);
  const [isLoadingMedia, setIsLoadingMedia] = useState(false);
  const [mediaUrlInput, setMediaUrlInput] = useState("");
  
  // Settings Gate Modal State
  const [gateModalState, setGateModalState] = useState<{
    isOpen: boolean;
    purposeId: string;
    purposeLabel: string;
    missingRequirements: { id: string; label: string; met: boolean }[];
    requiresAdultConsent: boolean;
  }>({
    isOpen: false,
    purposeId: '',
    purposeLabel: '',
    missingRequirements: [],
    requiresAdultConsent: false,
  });
  const [mediaTypeInput, setMediaTypeInput] = useState<"image" | "video">("image");
  const [mediaIsHiddenInput, setMediaIsHiddenInput] = useState(false);
  const [mediaRequiredLevelInput, setMediaRequiredLevelInput] = useState("public");
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);

  const MOCK_MEDIA_ITEMS: ProfileMedia[] = [];

  const loadUserMedia = async (userId: string) => {
    setIsLoadingMedia(true);
    try {
      const items = await fetchProfileMedia(userId);
      setMediaItems(items.length > 0 ? items : MOCK_MEDIA_ITEMS);
    } catch (err) {
      console.error("Failed to load user media:", err);
      setMediaItems(MOCK_MEDIA_ITEMS);
    } finally {
      setIsLoadingMedia(false);
    }
  };

  const handleUploadMedia = async () => {
    if (!mediaUrlInput.trim()) {
      alert("Please enter a media URL.");
      return;
    }
    if (!currentUser) {
      console.error('You must be logged in to manage media.');
      return;
    }
    setIsUploadingMedia(true);
    const userId = currentUser.id;
    try {

      const uploaded = await uploadProfileMedia(
        userId,
        mediaUrlInput,
        mediaTypeInput,
        mediaIsHiddenInput,
        mediaIsHiddenInput ? mediaRequiredLevelInput : "public"
      );

      if (uploaded) {
        setMediaItems(prev => [...prev, uploaded]);
        setMediaUrlInput("");
        alert("Media uploaded successfully!");
      } else {
        throw new Error("Failed to insert media row");
      }
    } catch (err) {
      console.error("Failed to upload media:", err);
      alert("Failed to upload media.");
    } finally {
      setIsUploadingMedia(false);
    }
  };

  const handleDeleteMedia = async (mediaId: string) => {
    if (!confirm("Are you sure you want to delete this media item?")) return;

    if (!currentUser) {
      console.error('You must be logged in to manage media.');
      return;
    }

    try {
      const success = await deleteProfileMedia(mediaId);
      if (success) {
        setMediaItems(prev => prev.filter(m => m.id !== mediaId));
        alert("Media deleted successfully!");
      } else {
        alert("Failed to delete media.");
      }
    } catch (err) {
      console.error("Failed to delete media:", err);
      alert("Failed to delete media.");
    }
  };
  const [tempBio, setTempBio] = useState("");
  const [isSavingBio, setIsSavingBio] = useState(false);
  const [isPromptModalOpen, setIsPromptModalOpen] = useState(false);
  const [tempCategory, setTempCategory] = useState<keyof typeof INSIGHT_PROMPTS>("chemistry");
  const [tempQuestion, setTempQuestion] = useState("");
  const [tempAnswer, setTempAnswer] = useState("");
  const [isSavingPrompt, setIsSavingPrompt] = useState(false);
  const [promptError, setPromptError] = useState<string | null>(null);
  const [editingPromptIndex, setEditingPromptIndex] = useState<1 | 2>(1);
  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>({ hidden_values: {} });
  const [activePrivacyField, setActivePrivacyField] = useState<{ field: string; value: string } | null>(null);
  
  const [showMemberPreviewModal, setShowMemberPreviewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== "DELETE") return;
    setIsDeletingAccount(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("No active session");
      
      const res = await fetch("/api/user/delete", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${session.access_token}`
        }
      });
      if (!res.ok) throw new Error("Failed to delete account");
      
      await supabase.auth.signOut();
      window.location.href = "/";
    } catch (err) {
      console.error("Delete account error:", err);
      alert("Failed to delete account. Please try again or contact support.");
    } finally {
      setIsDeletingAccount(false);
      setShowDeleteModal(false);
    }
  };
  
  const [multiSelectConfig, setMultiSelectConfig] = useState<{
    isOpen: boolean;
    title: string;
    options: string[];
    initialSelected: string[];
    fieldKey: string;
  } | null>(null);

  const [calendarEvents, setCalendarEvents] = useState<any[]>([]);
  const [isLoadingCalendar, setIsLoadingCalendar] = useState(false);
  const [selectedCandidateId, setSelectedCandidateId] =
    useState<string>("");
  const [matchedCreators, setMatchedCreators] = useState<
    Record<string, boolean>
  >({});

  // Master Subscription Roster Management States
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [roster, setRoster] = useState<any[]>([]);
  const [cancellingRosterId, setCancellingRosterId] = useState<string | null>(
    null,
  );

  const [isSwapOpen, setIsSwapOpen] = useState(false);
  const [swapTargetIndex, setSwapTargetIndex] = useState<number | null>(null);

  const selectedCandidate =
    MOCK_CANDIDATES.find((c) => c.id === selectedCandidateId) ||
    MOCK_CANDIDATES[0];
  const HABIT_CATEGORIES = Object.keys(HABIT_CHOICES);

  // Live Relationship cockpit states
  const [liveMatches, setLiveMatches] = useState<any[]>([]);
  const [selectedMatchId, setSelectedMatchId] = useState<string>("");
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  const [selectedMatchState, setSelectedMatchState] = useState<any | null>(
    null,
  );
  const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);

  // Rating states
  const [isRateModalOpen, setIsRateModalOpen] = useState(false);
  const [ratingC1, setRatingC1] = useState(5);
  const [ratingC2, setRatingC2] = useState(5);
  const [ratingC3, setRatingC3] = useState(5);
  const [ratingC4, setRatingC4] = useState(5);
  const [ratingC5, setRatingC5] = useState(5);
  const [isSavingRating, setIsSavingRating] = useState(false);
  const [activeSubscriptions, setActiveSubscriptions] = useState<any[]>([]);
  const [currentUserProfile, setCurrentUserProfile] = useState<any>(null);

  // Crowdfunding Goals States
  const [creatorGoals, setCreatorGoals] = useState<any[]>([]);
  const [isLoadingGoals, setIsLoadingGoals] = useState(false);
  const [selectedGoalForContrib, setSelectedGoalForContrib] = useState<
    any | null
  >(null);
  const [isContribModalOpen, setIsContribModalOpen] = useState(false);
  const [reportingContent, setReportingContent] = useState<{ id: string, type: 'platform_content' | 'profile' | 'message' } | null>(null);

  // Load matches
  const loadMatches = async (userId: string) => {
    if (!userId || !userId.match(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/)) {
      setLiveMatches([]);
      setSelectedMatchId('');
      setSelectedMatchState(null);
      return;
    }
    try {
      const matchesData = await fetchMatches(userId);
      if (matchesData && matchesData.length > 0) {
        setLiveMatches(matchesData);
        await selectMatch(
          userId,
          matchesData[0].target_profile.id,
          matchesData,
        );
      } else {
        setLiveMatches([]);
        setSelectedMatchId("");
        setSelectedMatchState(null);
      }
    } catch (e) {
      console.error("Failed to load matches:", e);
    }
  };

  const loadCalendarEvents = async () => {
    const userId = currentUser?.id;
    if (!userId) return;
    setIsLoadingCalendar(true);
    try {
      const res = await fetch(`/api/integrations/calendar?userId=${userId}`);
      if (res.ok) {
        const data = await res.json();
        setCalendarEvents(data.events || []);
      }
    } catch (e) {
      console.error("Failed to load calendar events:", e);
    } finally {
      setIsLoadingCalendar(false);
    }
  };

  useEffect(() => {
    if (activeTab === "calendar") {
      loadCalendarEvents();
    }
  }, [activeTab, currentUser]);

  const loadCreatorGoals = async (creatorId: string) => {
    if (!creatorId || !creatorId.match(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/)) {
      setCreatorGoals([]);
      setIsLoadingGoals(false);
      return;
    }
    try {
      setIsLoadingGoals(true);
      const { data, error } = await supabase
        .from("creator_goals")
        .select("*")
        .eq("creator_id", creatorId)
        .eq("is_completed", false)
        .order("created_at", { ascending: false });

      if (!error && data && data.length > 0) {
        setCreatorGoals(data);
      } else {
        setCreatorGoals([]);
      }
    } catch (err) {
      console.error("Error loading creator goals:", err);
      setCreatorGoals([]);
    } finally {
      setIsLoadingGoals(false);
    }
  };

  const selectMatch = async (
    userId: string,
    targetId: string,
    matchesList = liveMatches,
  ) => {
    setSelectedMatchId(targetId);
    loadCreatorGoals(targetId);
    try {
      const stateObj = await getRelationshipState(userId, targetId);
      const dualState = getDualGaugeState(
        stateObj.myScore,
        stateObj.theirScore,
      );
      setSelectedMatchState(dualState);
    } catch (err) {
      console.error("Error selecting match:", err);
    }
  };

  const handleSelectMove = async (moveId: string, label: string) => {
    const userId = currentUser?.id;
    if (!userId) return;
    try {
      await sendSuggestionMove(userId, selectedMatchId, moveId, label);
      const newScore = await updateRelationshipScore(
        userId,
        selectedMatchId,
        "suggestion_move_accepted",
      );

      setLiveMatches((prev) =>
        prev.map((m) => {
          if (m.target_profile.id === selectedMatchId) {
            const levelKey = scoreToLevel(newScore).key;
            return { ...m, gauge_score: newScore, current_level: levelKey };
          }
          return m;
        }),
      );

      await selectMatch(userId, selectedMatchId);
    } catch (err) {
      console.error("Failed to send suggestion move:", err);
    }
  };

  // Auth and DB subscriptions loader
  useEffect(() => {
    const loadSessionAndRoster = async () => {
      if (typeof window !== 'undefined') {
        const isCreatorSignup = localStorage.getItem('is_creator_signup') === 'true';
        if (isCreatorSignup) {
          window.location.href = '/onboarding/kyc';
          return;
        }
      }
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user) {
        setCurrentUser(session.user);

        // Load profile details
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();
        if (profile) {
          if (profile.role !== "member") {
            router.push("/studio");
            return;
          }
          setCurrentUserProfile(profile);
          setPrivacySettings(profile.privacy_settings || { hidden_values: {} });
        }

        // Fetch active subscriptions (VIP or Master)
        const { data: subs } = await supabase
          .from("subscriptions")
          .select(
            `
            id,
            price_paid,
            creator_id,
            tier,
            is_active,
            profiles:profiles!subscriptions_creator_id_fkey(*)
          `,
          )
          .eq("subscriber_id", session.user.id)
          .eq("is_active", true);

        if (subs) {
          setActiveSubscriptions(subs);
          const masterSubs = subs.filter((s) => s.tier === "master");
          if (masterSubs.length > 0) {
            const dbRoster = masterSubs.map((s) => {
              const cp: any = s.profiles;
              return {
                id: cp.id,
                name: cp.display_name || cp.username,
                avatar:
                  cp.avatar_url ||
                  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80",
                niche: cp.hobbies?.[0] || "Creative",
                basePrice: Number(cp.base_subscription_price) || 15,
                accelerator: cp.engagement_score
                  ? Number(cp.engagement_score) / 100
                  : 0.85,
                subscriptionId: s.id,
                isCancelled: false,
                face_blur_active: cp.face_blur_active || false,
                avatar_face_coordinates: cp.avatar_face_coordinates || null,
              };
            });
            setRoster(dbRoster);
          }
        }

        // Fetch matches
        await loadMatches(session.user.id);
        // Load media album
        await loadUserMedia(session.user.id);
      } else {
        // No authenticated session — show empty state
        setLiveMatches([]);
        setMediaItems([]);
      }
    };
    loadSessionAndRoster();
  }, []);

  useEffect(() => {
    if (currentUserProfile) {
      setTempBio(currentUserProfile.bio || "");
    }
  }, [currentUserProfile]);

  const handleSaveBio = async () => {
    if (!currentUser) {
      console.error('You must be logged in to update your biography.');
      return;
    }
    setIsSavingBio(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ bio: tempBio })
        .eq("id", currentUser.id);
      if (error) throw error;
      
      setCurrentUserProfile((prev: any) => ({ ...prev, bio: tempBio }));
      alert("Biography updated successfully!");
    } catch (err: any) {
      console.error("Failed to update bio:", err);
      alert(err.message || "Failed to update bio.");
    } finally {
      setIsSavingBio(false);
    }
  };

  const handleSavePrompt = async () => {
    if (tempAnswer.length < 10 || tempAnswer.length > 500) {
      setPromptError("Response must be between 10 and 500 characters.");
      return;
    }
    setIsSavingPrompt(true);
    setPromptError(null);
    try {
      if (!currentUser) {
        console.error('You must be logged in to update relational prompts.');
        setIsSavingPrompt(false);
        return;
      }
      const response = await fetch("/api/v2/profile/analyze-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          promptCategory: tempCategory,
          promptQuestion: tempQuestion,
          promptAnswer: tempAnswer,
          promptIndex: editingPromptIndex,
        }),
      });
      
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to analyze prompt.");
      }
      
      const data = await response.json();
      if (editingPromptIndex === 1) {
        setCurrentUserProfile((prev: any) => ({
          ...prev,
          bio_prompt_category: data.bio_prompt_category,
          bio_prompt_question: data.bio_prompt_question,
          bio_prompt_answer: data.bio_prompt_answer,
          bio_analysis: data.bio_analysis,
        }));
      } else {
        setCurrentUserProfile((prev: any) => ({
          ...prev,
          bio_prompt_category_2: data.bio_prompt_category_2,
          bio_prompt_question_2: data.bio_prompt_question_2,
          bio_prompt_answer_2: data.bio_prompt_answer_2,
          bio_analysis_2: data.bio_analysis_2,
        }));
      }
      
      setIsPromptModalOpen(false);
      alert(`Relational prompt ${editingPromptIndex} and insights updated!`);
    } catch (err: any) {
      console.error("Failed to save prompt:", err);
      setPromptError(err.message || "Failed to analyze prompt.");
    } finally {
      setIsSavingPrompt(false);
    }
  };

  // Database helper to swap creators
  const swapCreatorInDb = async (
    oldCreatorId: string | null,
    newCreatorId: string,
    newPrice: number,
  ) => {
    if (!currentUser) return;
    try {
      if (oldCreatorId) {
        // Deactivate old subscription
        await supabase
          .from("subscriptions")
          .update({ is_active: false })
          .eq("subscriber_id", currentUser.id)
          .eq("creator_id", oldCreatorId)
          .eq("tier", "master");
      }

      // Insert new master subscription row
      await supabase.from("subscriptions").insert({
        subscriber_id: currentUser.id,
        creator_id: newCreatorId,
        tier: "master",
        price_paid: newPrice,
        expires_at: new Date(
          Date.now() + 30 * 24 * 60 * 60 * 1000,
        ).toISOString(),
        is_active: true,
      });
    } catch (err) {
      console.error("Failed to sync subscriptions in database:", err);
    }
  };

  const handleSwapConfirm = async (cand: any) => {
    if (swapTargetIndex === null) return;

    const oldCreator = roster[swapTargetIndex];
    const basePrice = cand.basePrice ?? 10;
    const newCreatorObj = {
      id: cand.id,
      name: cand.name,
      avatar: cand.avatar,
      niche: cand.hobbies?.[0] || "Creative",
      basePrice,
      accelerator: cand.engagementScore ? cand.engagementScore / 100 : 0.85,
    };

    const newRoster = [...roster];
    newRoster[swapTargetIndex] = newCreatorObj;
    setRoster(newRoster);

    setIsSwapOpen(false);
    setSwapTargetIndex(null);

    // Call Supabase DB sync
    if (currentUser) {
      await swapCreatorInDb(oldCreator?.id || null, cand.id, basePrice);
    }
  };

  const handleRemoveCreator = async (index: number) => {
    const creatorToRemove = roster[index];
    if (!creatorToRemove) return;

    const newRoster = roster.filter((_, i) => i !== index);
    setRoster(newRoster);

    if (currentUser) {
      await supabase
        .from("subscriptions")
        .update({ is_active: false })
        .eq("subscriber_id", currentUser.id)
        .eq("creator_id", creatorToRemove.id)
        .eq("tier", "master");
    }
  };

  // Dynamic pricing calculation variables
  const baseMasterFee = 15.0;
  const bundleDiscountPercent = 0.2;

  const pricingRequest = {
    baseMasterFee,
    creators: roster.map((c) => ({
      creatorId: c.id,
      basePrice: c.basePrice,
      engagementAccelerator: c.accelerator,
    })),
    bundleDiscountPercent,
  };

  const masterPrice = calculateMasterPrice(pricingRequest);
  const payoutsBreakdown = calculatePayouts(pricingRequest);
  const aggregateValue =
    baseMasterFee + roster.reduce((sum, c) => sum + c.basePrice, 0);

  const availableCandidates = MOCK_CANDIDATES.filter(
    (c) => !roster.some((r) => r.id === c.id),
  );

  const selectedMatch = liveMatches.find(
    (m) => m.target_profile.id === selectedMatchId,
  );
  const relationshipLevelIndex = selectedMatch
    ? RELATIONSHIP_LEVELS.findIndex(
        (l) => l.key === selectedMatch.current_level,
      )
    : 0;

  const hasSubscription = activeSubscriptions.some(
    (s) =>
      s.creator_id === selectedMatchId &&
      (s.tier === "vip" || s.tier === "master"),
  );

  const canRateConnection =
    currentUserProfile &&
    selectedMatch &&
    canRate(
      {
        id: currentUserProfile.id,
        role: (currentUserProfile.role || "member") as "member" | "creator",
        is_kyc_verified: currentUserProfile.is_kyc_verified || false,
      },
      {
        id: selectedMatch.target_profile.id,
        role: (selectedMatch.target_profile.role || "creator") as
          | "member"
          | "creator",
        is_kyc_verified: selectedMatch.target_profile.is_kyc_verified || false,
      },
      relationshipLevelIndex,
      hasSubscription,
    );

  const handleSaveRating = async () => {
    if (!currentUserProfile || !selectedMatch) return;
    setIsSavingRating(true);
    try {
      const isCreator = selectedMatch.target_profile.role === "creator";
      const score = isCreator
        ? (ratingC1 + ratingC2 + ratingC3 + ratingC4 + ratingC5) * 0.8
        : ratingC1 + ratingC2 + ratingC3 + ratingC4;

      const { error } = await supabase.from("ratings").upsert(
        {
          rater_id: currentUserProfile.id,
          ratee_id: selectedMatch.target_profile.id,
          c1: ratingC1,
          c2: ratingC2,
          c3: ratingC3,
          c4: ratingC4,
          c5: isCreator ? ratingC5 : null,
          calculated_score: score,
        },
        { onConflict: "rater_id,ratee_id" },
      );

      if (error) throw error;

      alert("Rating submitted successfully!");
      setIsRateModalOpen(false);
    } catch (err: any) {
      console.error("Failed to save rating:", err);
      alert(err.message || "Failed to save rating.");
    } finally {
      setIsSavingRating(false);
    }
  };

  const handleUpdateProfileField = async (field: string, value: any) => {
    if (currentUserProfile) {
      const updatedProfile = {
        ...currentUserProfile,
        [field]: value,
      };
      setCurrentUserProfile(updatedProfile);

      if (currentUser) {
        try {
          const { error } = await supabase
            .from("profiles")
            .update({ [field]: value })
            .eq("id", currentUser.id);
          if (error) throw error;
        } catch (err) {
          console.error(`Failed to update ${field}:`, err);
        }
      }
    }
  };

  const handleUpdateHabit = async (category: string, value: string) => {
    const currentLifestyle =
      currentUserProfile?.lifestyle_habits || MOCK_USER.habits;
    const updatedLifestyle = { ...currentLifestyle, [category]: value };

    if (currentUserProfile) {
      const updatedProfile = {
        ...currentUserProfile,
        lifestyle_habits: updatedLifestyle,
      };
      setCurrentUserProfile(updatedProfile);

      if (currentUser) {
        try {
          const { error } = await supabase
            .from("profiles")
            .update({ lifestyle_habits: updatedLifestyle })
            .eq("id", currentUser.id);
          if (error) throw error;
        } catch (err) {
          console.error("Failed to update lifestyle habits:", err);
        }
      }
    }
  };

  const handleUpdateFamilyGoals = async (value: string) => {
    const currentLifestyle =
      currentUserProfile?.lifestyle_habits || MOCK_USER.habits;
    const updatedLifestyle = { ...currentLifestyle, family_goals: value };

    if (currentUserProfile) {
      const updatedProfile = {
        ...currentUserProfile,
        familyGoals: value,
        lifestyle_habits: updatedLifestyle,
      };
      setCurrentUserProfile(updatedProfile);

      if (currentUser) {
        try {
          const { error } = await supabase
            .from("profiles")
            .update({ lifestyle_habits: updatedLifestyle })
            .eq("id", currentUser.id);
          if (error) throw error;
        } catch (err) {
          console.error("Failed to update family goals:", err);
        }
      }
    }
  };

  const handleCycleFamilyGoals = async () => {
    const currentIndex = FAMILY_GOALS.indexOf(mappedCurrentUser.familyGoals);
    const nextIndex = (currentIndex + 1) % FAMILY_GOALS.length;
    const nextGoal = FAMILY_GOALS[nextIndex];
    await handleUpdateFamilyGoals(nextGoal);
  };

  const handleUpdateAvatar = async () => {
    const newUrl = prompt(
      "Enter a new Avatar Image URL:",
      mappedCurrentUser.avatar,
    );
    if (newUrl === null) return;

    if (currentUserProfile) {
      const updatedProfile = { ...currentUserProfile, avatar_url: newUrl };
      setCurrentUserProfile(updatedProfile);

      if (currentUser) {
        try {
          const { error } = await supabase
            .from("profiles")
            .update({ avatar_url: newUrl })
            .eq("id", currentUser.id);
          if (error) throw error;
        } catch (err) {
          console.error("Failed to update avatar in database:", err);
        }
      }
    }
  };

  const handleUpdateUsername = async () => {
    const newUsername = prompt(
      "Enter a new display name:",
      mappedCurrentUser.username,
    );
    if (!newUsername) return;

    if (currentUserProfile) {
      const updatedProfile = {
        ...currentUserProfile,
        username: newUsername,
        display_name: newUsername,
      };
      setCurrentUserProfile(updatedProfile);

      if (currentUser) {
        try {
          const { error } = await supabase
            .from("profiles")
            .update({ username: newUsername, display_name: newUsername })
            .eq("id", currentUser.id);
          if (error) throw error;
        } catch (err) {
          console.error("Failed to update username in database:", err);
        }
      }
    }
  };

  const handleUpdatePrivacy = async (field: string, value: string, required_level: string) => {
    if (!currentUser) return;
    
    // Check "One Visible, Four Hidden" rule for sensitive array fields
    if (['sexual_preferences', 'relationship_goals', 'relationship_types', 'nsfw_boundaries'].includes(field)) {
      const selectedItems = currentUserProfile?.[field] || [];
      const currentlyHiddenValues = privacySettings?.hidden_values?.[field] || {};
      
      // Calculate how many items are currently hidden
      const currentlyHiddenCount = Object.keys(currentlyHiddenValues).length;
      
      // If we are hiding a new item, check if it leaves at least 1 visible
      if (!currentlyHiddenValues[value]) {
        if (selectedItems.length - currentlyHiddenCount <= 1) {
          alert(`You must keep at least one ${field.replace('_', ' ')} visible.`);
          return;
        }
      }
    }

    const newSettings = JSON.parse(JSON.stringify(privacySettings));
    if (!newSettings.hidden_values) newSettings.hidden_values = {};
    if (!newSettings.hidden_values[field]) newSettings.hidden_values[field] = {};
    
    newSettings.hidden_values[field][value] = { required_level };
    setPrivacySettings(newSettings);
    setActivePrivacyField(null);
    
    try {
      await supabase
        .from("profiles")
        .update({ privacy_settings: newSettings })
        .eq("id", currentUser.id);
    } catch (err) {
      console.error("Failed to update privacy settings:", err);
    }
  };

  const handleRemovePrivacy = async (field: string, value: string) => {
    if (!currentUser) return;
    
    const newSettings = JSON.parse(JSON.stringify(privacySettings));
    if (newSettings.hidden_values?.[field]?.[value]) {
      delete newSettings.hidden_values[field][value];
      setPrivacySettings(newSettings);
      
      try {
        await supabase
          .from("profiles")
          .update({ privacy_settings: newSettings })
          .eq("id", currentUser.id);
      } catch (err) {
        console.error("Failed to update privacy settings:", err);
      }
    }
  };

  const handleOpenMultiSelect = (fieldKey: string, title: string, options: string[], currentVal: any) => {
    let initialSelected: string[] = [];
    if (Array.isArray(currentVal)) {
      initialSelected = currentVal;
    } else if (typeof currentVal === "string") {
      initialSelected = [currentVal];
    }
    
    setMultiSelectConfig({
      isOpen: true,
      title,
      options,
      initialSelected,
      fieldKey
    });
  };

  const handleSaveMultiSelect = async (selected: string[]) => {
    if (!multiSelectConfig || !currentUserProfile) return;
    
    const { fieldKey } = multiSelectConfig;
    
    const updatedProfile = {
      ...currentUserProfile,
      [fieldKey]: selected,
    };
    
    // Maintain backward compatibility for mapped string & array fields
    if (fieldKey === "relationship_goals") {
      updatedProfile.relationship_goals = selected;
      updatedProfile.relationshipGoals = selected;
      updatedProfile.relationshipGoal = selected[0] || "";
    }
    if (fieldKey === "relationship_types") {
      updatedProfile.relationship_types = selected;
      updatedProfile.relationshipTypes = selected;
      updatedProfile.relationshipType = selected[0] || "";
    }
    if (fieldKey === "sexual_preferences") {
      updatedProfile.sexual_preferences = selected;
      updatedProfile.sexualPreferences = selected;
      updatedProfile.sexual_preference = selected[0] || "Straight";
    }
    
    setCurrentUserProfile(updatedProfile);

    if (currentUser) {
      try {
        const updatePayload: any = { [fieldKey]: selected };
        if (fieldKey === "sexual_preferences") {
          updatePayload.sexual_preference = selected[0] || "";
        }
        const { error } = await supabase
          .from("profiles")
          .update(updatePayload)
          .eq("id", currentUser.id);
        if (error) throw error;
      } catch (err) {
        console.error(`Failed to update ${fieldKey} in database:`, err);
      }
    }
  };

  const handleCancelRosterAutoRenew = async (creatorId: string) => {
    setCancellingRosterId(creatorId);
    try {
      const response = await fetch("/api/billing/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          creatorId,
          subscriberId: currentUser?.id || "",
        }),
      });

      if (response.ok) {
        setRoster((prev) =>
          prev.map((c) =>
            c.id === creatorId ? { ...c, isCancelled: true } : c,
          ),
        );
      } else {
        console.error("Failed to cancel auto-renewal");
      }
    } catch (err) {
      console.error("Error cancelling auto-renewal:", err);
    } finally {
      setCancellingRosterId(null);
    }
  };

  const mappedCurrentUser = currentUserProfile
    ? {
        gender:
          currentUserProfile.gender ||
          (currentUserProfile.sexual_preference === "Lesbian" ||
          currentUserProfile.sexual_preference === "Gay"
            ? "female"
            : "male"),
        location:
          currentUserProfile.origins || currentUserProfile.location || "",
        hobbies: currentUserProfile.hobbies || [],
        lifestyle: currentUserProfile.lifestyle_habits || {},
        career:
          currentUserProfile.lifestyle_habits?.career ||
          currentUserProfile.career ||
          "",
        relationshipGoal:
          currentUserProfile.relationship_goals?.[0] ||
          currentUserProfile.relationshipGoal ||
          "Long term partner",
        relationshipType:
          currentUserProfile.relationship_types?.[0] ||
          currentUserProfile.relationshipType ||
          "Monogamous",
        relationshipGoals:
          currentUserProfile.relationship_goals?.length > 0 
            ? currentUserProfile.relationship_goals 
            : [currentUserProfile.relationshipGoal || "Long term partner"],
        relationshipTypes:
          currentUserProfile.relationship_types?.length > 0 
            ? currentUserProfile.relationship_types 
            : [currentUserProfile.relationshipType || "Monogamous"],
        sexualPreferences:
          currentUserProfile.sexual_preferences?.length > 0
            ? currentUserProfile.sexual_preferences
            : currentUserProfile.sexual_preference && currentUserProfile.sexual_preference !== "EVERYONE" && currentUserProfile.sexual_preference !== "Everyone"
            ? [currentUserProfile.sexual_preference]
            : ["Straight"],
        favoriteLanguages: currentUserProfile.favorite_languages || [],
        additionalLanguages: currentUserProfile.additional_languages || [],
        familyGoals:
          currentUserProfile.lifestyle_habits?.family_goals ||
          currentUserProfile.familyGoals ||
          "Open to children",
        archetype: currentUserProfile.archetype || undefined,
        moods: currentUserProfile.moods || undefined,
        corePassion:
          currentUserProfile.core_passion ||
          currentUserProfile.corePassion ||
          undefined,
        origins: currentUserProfile.origins || undefined,
        nativeTown: currentUserProfile.native_town || currentUserProfile.nativeTown || undefined,
        residence: currentUserProfile.residence || undefined,
        currentLocation: currentUserProfile.current_location || currentUserProfile.currentLocation || undefined,
        isKycVerified:
          currentUserProfile.is_kyc_verified ||
          currentUserProfile.isKycVerified ||
          false,
        lastActiveAt:
          currentUserProfile.last_active_at ||
          currentUserProfile.lastActiveAt ||
          undefined,
        engagementScore:
          currentUserProfile.engagement_score ||
          currentUserProfile.engagementScore ||
          undefined,
        id: currentUser?.id || currentUserProfile.id || "",
        username:
          currentUserProfile.username ||
          currentUserProfile.display_name ||
          (currentUser?.email ? currentUser.email.split('@')[0] : "Member"),
        avatar:
          currentUserProfile.avatar_url ||
          currentUserProfile.avatar ||
          "/assets/logo/logo-mark.png",
        height: currentUserProfile.height || "",
        bioPromptCategory: currentUserProfile.bio_prompt_category || "",
        bioPromptQuestion: currentUserProfile.bio_prompt_question || "",
        bioPromptAnswer: currentUserProfile.bio_prompt_answer || "",
        bioAnalysis: currentUserProfile.bio_analysis || null,
        bioPromptCategory2: currentUserProfile.bio_prompt_category_2 || "",
        bioPromptQuestion2: currentUserProfile.bio_prompt_question_2 || "",
        bioPromptAnswer2: currentUserProfile.bio_prompt_answer_2 || "",
        bioAnalysis2: currentUserProfile.bio_analysis_2 || null,
        bio: currentUserProfile.bio || "",
        face_blur_active: currentUserProfile.face_blur_active || false,
      }
    : {
        ...MOCK_USER,
        favoriteLanguages: MOCK_USER.favoriteLanguages || [],
        additionalLanguages: MOCK_USER.additionalLanguages || [],
        id: currentUser?.id || "",
        username: currentUserProfile?.username || "Alex_N",
        career: currentUserProfile?.lifestyle_habits?.career || "",
        avatar: currentUserProfile?.avatar_url || MOCK_USER.avatar,
        bioPromptCategory: "chemistry",
        bioPromptQuestion: "Describe a moment where you felt truly seen by another person—when they saw your messiest or least-photogenic side and still stayed. What did that feel like, and what specific action made the difference?",
        bioPromptAnswer: "I was once going through a really tough professional failure, and instead of telling me it would be okay or giving advice, she just sat with me in silence, ordered pizza, and let me be sad. That simple presence made me feel so accepted.",
        bioAnalysis: {
          Emotional_Vector: {
            Vulnerability_Score: 0.85,
            Defensive_Score: 0.15,
            Idealization_Bias: 0.30
          },
          Interaction_Style: {
            Directness: "High",
            Witty: "Moderate",
            Introspective: "Very High"
          },
          Behavioral_Pattern: {
            Investment_Driver: ["Emotional Connection", "Validation"],
            Red_Flags: []
          }
        },
        bioPromptCategory2: "conflict",
        bioPromptQuestion2: "When stressed, do you prefer space or talking it out?",
        bioPromptAnswer2: "I usually prefer a bit of space to gather my thoughts and calm down first, so I don't say anything reactive, and then I like to talk it out completely.",
        bioAnalysis2: {
          Emotional_Vector: {
            Vulnerability_Score: 0.70,
            Defensive_Score: 0.30,
            Idealization_Bias: 0.45
          },
          Interaction_Style: {
            Directness: "Moderate",
            Witty: "High",
            Introspective: "High"
          },
          Behavioral_Pattern: {
            Investment_Driver: ["Novelty Seeking", "Playfulness"],
            Red_Flags: []
          }
        },
        bio: "",
      };

  const totalFields = HABIT_CATEGORIES.length + 5;
  let filledFields = 0;
  HABIT_CATEGORIES.forEach((cat) => {
    if (
      mappedCurrentUser.lifestyle &&
      (mappedCurrentUser.lifestyle as any)[cat]
    )
      filledFields++;
  });
  if (mappedCurrentUser.career) filledFields++;
  if (mappedCurrentUser.familyGoals) filledFields++;
  if (mappedCurrentUser.avatar) filledFields++;
  if (mappedCurrentUser.username) filledFields++;
  if (mappedCurrentUser.relationshipGoal) filledFields++;

  const profileCompletion = Math.round((filledFields / totalFields) * 100);

  const renderPrivacyToggle = (field: string, value: string) => {
    const isHidden = !!privacySettings?.hidden_values?.[field]?.[value];
    
    return (
      <button
        onClick={(e) => {
          e.stopPropagation();
          if (isHidden) {
            handleRemovePrivacy(field, value);
          } else {
            setActivePrivacyField({ field, value });
          }
        }}
        className={`ml-2 p-1 rounded-full transition-colors ${isHidden ? "bg-primary/20 text-primary" : "bg-white/5 text-white/40 hover:bg-white/10 hover:text-white/80"}`}
        title={isHidden ? "Hidden from public (Click to reveal)" : "Visible to public (Click to hide)"}
      >
        {isHidden ? <Lock className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-transparent text-white pt-20 pb-24 md:pb-12 px-4 md:px-12 relative overflow-hidden">
      {/* Privacy Settings Modal */}
      {activePrivacyField && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#111] border border-white/10 rounded-2xl p-6 w-full max-w-sm relative shadow-2xl">
            <button
              onClick={() => setActivePrivacyField(null)}
              className="absolute top-4 right-4 text-white/40 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold flex items-center gap-2 mb-2">
              <Lock className="w-5 h-5 text-primary" />
              Hide Profile Info
            </h3>
            <p className="text-xs text-white/60 mb-6">
              Select the minimum relationship level required to view{" "}
              <span className="text-white font-bold">{activePrivacyField.value}</span>.
            </p>

            <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
              {RELATIONSHIP_LEVELS.filter(l => l.minScore >= 0).map((level) => (
                <button
                  key={level.key}
                  onClick={() => handleUpdatePrivacy(activePrivacyField.field, activePrivacyField.value, level.key)}
                  className="w-full flex items-center justify-between p-3 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 transition text-left group"
                >
                  <span className="text-sm font-bold">{level.label}</span>
                  <span className="text-[10px] uppercase font-black tracking-widest text-white/30 group-hover:text-primary transition-colors">Select</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <RequirementGateModal
        isOpen={gateModalState.isOpen}
        onClose={() => setGateModalState(prev => ({ ...prev, isOpen: false }))}
        purposeId={gateModalState.purposeId}
        purposeLabel={gateModalState.purposeLabel}
        missingRequirements={gateModalState.missingRequirements}
        requiresAdultConsent={gateModalState.requiresAdultConsent}
        onNavigateToEditProfile={() => {
          setActiveTab("edit");
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onConfirmAdultConsent={async () => {
          if (!currentUser) return;
          const currentPurposes = [...(currentUserProfile?.member_purposes || []), gateModalState.purposeId];
          await supabase.from('profiles').update({ 
            member_purposes: currentPurposes,
            is_adult_content: true
          }).eq('id', currentUser.id);
          
          setCurrentUserProfile((prev: any) => ({ 
            ...prev, 
            member_purposes: currentPurposes,
            is_adult_content: true
          }));
          
          setGateModalState(prev => ({ ...prev, isOpen: false }));
        }}
      />

      <ReportModal 
        isOpen={!!reportingContent} 
        onClose={() => setReportingContent(null)} 
        contentId={reportingContent?.id || ''} 
        contentType={reportingContent?.type || 'profile'} 
      />

      {/* Background neon accent mesh orbs */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary/10 blur-[150px] rounded-full pointer-events-none animate-pulse-cyan" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-accent/10 blur-[150px] rounded-full pointer-events-none" />

      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
        {/* Left Column: Basic Info */}
        <div className="md:col-span-1 space-y-6">
          <framerMotion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/[0.02] border border-white/5 p-2 rounded-[2.5rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)] backdrop-blur-xl relative overflow-hidden"
          >
            <div className="bg-black/40 border border-white/5 rounded-[2rem] p-6 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] flex flex-col items-center text-center relative overflow-hidden">
              {/* Match Pulse Indicator */}
              <div className="absolute top-0 right-0 p-4">
                <div className="flex flex-col items-end">
                  <div className="flex items-center gap-1.5 px-2 py-0.5 bg-primary/20 rounded-full border border-primary/30">
                    <Zap className="w-2.5 h-2.5 text-primary fill-current" />
                    <span className="text-[9px] font-black text-white tracking-widest uppercase">
                      94% PULSE
                    </span>
                  </div>
                </div>
              </div>

              <div
                className="relative w-32 h-32 rounded-full overflow-hidden mb-4 border-2 border-primary group cursor-pointer"
                onClick={handleUpdateAvatar}
              >
                <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <p className="text-[8px] font-black uppercase tracking-[0.2em]">
                    {t('memberProfile.updateAvatar', 'Update Avatar')}
                  </p>
                </div>
                <img
                  src={mappedCurrentUser.avatar}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              </div>
              <h1
                className="text-2xl font-bold flex items-center justify-center gap-2 tracking-tight cursor-pointer hover:text-primary transition group"
                onClick={handleUpdateUsername}
              >
                {mappedCurrentUser.username}
                {mappedCurrentUser.isKycVerified && (
                  <span title="Verified Face">
                    <ShieldCheck className="w-5 h-5 text-green-500" />
                  </span>
                )}
              </h1>

              <div className="mt-6 w-full space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-widest text-white/40 px-2">
                    <span>{t('memberProfile.profileCompletion', 'Profile Completion')}</span>
                    <span className="text-primary">{profileCompletion}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                    <framerMotion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${profileCompletion}%` }}
                      className="h-full bg-gradient-to-r from-blue-500 to-primary shadow-[0_0_10px_rgba(255,0,127,0.5)]"
                    />
                  </div>
                </div>
              </div>
            </div>
          </framerMotion.div>

          <framerMotion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/[0.02] border border-white/5 p-2 rounded-[2rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)] backdrop-blur-xl relative overflow-hidden"
          >
            <div 
              className="bg-black/40 border border-white/5 rounded-[calc(2rem-0.5rem)] p-3 flex md:flex-col overflow-x-auto md:overflow-visible gap-2 md:gap-1.5 scrollbar-hide relative"
              style={{
                maskImage: "linear-gradient(to right, black 82%, transparent 100%)",
                WebkitMaskImage: "linear-gradient(to right, black 82%, transparent 100%)",
              }}
            >
              {[
                { id: "edit", label: "Edit Profile", icon: Edit3 },
                { id: "media", label: "My Media Album", icon: Image },
                { id: "status", label: "Status Lists", icon: ListOrdered },
                { id: "insights", label: "Relational Insights", icon: Brain },
                { id: "track", label: "Track Record", icon: Activity },
                { id: "calendar", label: "Calendar Events", icon: Calendar },
                { id: "livestream", label: "Live Pulse Hub", icon: Video },
                { id: "master", label: "My Sponsored Creators", icon: Crown },
                { id: "preferences", label: "Account Settings", icon: Settings },
              ].map((tab) => {
                const Icon = tab.icon;
                const isSelected = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      if (tab.id === "preferences") {
                        router.push("/settings");
                      } else {
                        setActiveTab(tab.id as any);
                      }
                    }}
                    className={`shrink-0 md:shrink w-auto md:w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group hover:scale-[1.02] active:scale-[0.98] ${
                      isSelected
                        ? "bg-primary text-black font-black shadow-[0_0_20px_rgba(102,252,241,0.4)] border border-primary/20"
                        : "hover:bg-white/5 text-white/50 hover:text-white border border-transparent hover:border-white/5"
                    }`}
                  >
                    <div className="flex items-center gap-3 whitespace-nowrap">
                      <Icon className={`w-4 h-4 transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-110 ${isSelected ? "text-black" : "text-primary"}`} />
                      <span className="text-[10px] font-black uppercase tracking-widest">
                        {tab.label}
                      </span>
                    </div>
                    <ChevronRight className={`w-3.5 h-3.5 hidden md:block transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] ${isSelected ? "text-black translate-x-0" : "text-white/20 opacity-0 group-hover:opacity-100 group-hover:translate-x-1"}`} />
                  </button>
                );
              })}
            </div>
          </framerMotion.div>
        </div>

        {/* Right Column: Tab Content */}
        <div className="md:col-span-2">
          <framerMotion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white/[0.02] border border-white/5 p-2 rounded-[2.5rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)] backdrop-blur-xl min-h-[500px]"
          >
            <div className="bg-black/40 border border-white/5 rounded-[2rem] p-6 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] h-full min-h-[484px]">

            
            {activeTab === "edit" && (
              <EditProfileTab
                mappedCurrentUser={mappedCurrentUser}
                currentUserProfile={currentUserProfile}
                handleOpenMultiSelect={handleOpenMultiSelect}
                renderPrivacyToggle={renderPrivacyToggle}
                handleCycleFamilyGoals={handleCycleFamilyGoals}
                handleUpdateHabit={handleUpdateHabit}
                handleUpdateProfileField={handleUpdateProfileField}
              />
            )}

            {activeTab === "media" && (
              <MemberMediaTab
                mediaItems={mediaItems}
                mediaUrlInput={mediaUrlInput}
                setMediaUrlInput={setMediaUrlInput}
                mediaTypeInput={mediaTypeInput}
                setMediaTypeInput={setMediaTypeInput}
                mediaIsHiddenInput={mediaIsHiddenInput}
                setMediaIsHiddenInput={setMediaIsHiddenInput}
                handleAddMedia={handleUploadMedia}
                handleDeleteMedia={handleDeleteMedia}
              />
            )}

            {activeTab === "insights" && (
              <MemberInsightsTab
                bioAnalysis1={mappedCurrentUser.bioAnalysis}
                bioAnalysis2={mappedCurrentUser.bioAnalysis2}
                prompt1={{
                  question: mappedCurrentUser.bioPromptQuestion || "What is your dream first date?",
                  answer: mappedCurrentUser.bioPromptAnswer || "",
                  isGated: !!(privacySettings?.hidden_values?.['bio_prompt_answer'] && Object.keys(privacySettings.hidden_values['bio_prompt_answer']).length > 0)
                }}
                prompt2={{
                  question: mappedCurrentUser.bioPromptQuestion2 || "When stressed, do you prefer space or talking it out?",
                  answer: mappedCurrentUser.bioPromptAnswer2 || "",
                  isGated: !!(privacySettings?.hidden_values?.['bio_prompt_answer_2'] && Object.keys(privacySettings.hidden_values['bio_prompt_answer_2']).length > 0)
                }}
              />
            )}

            {activeTab === "status" && (
              <MemberConnectionsTab
                connections={liveMatches.map((m) => ({
                  id: m.target_profile.id,
                  name: m.target_profile.username,
                  avatar: m.target_profile.avatar_url,
                  face_blur_active: m.target_profile.face_blur_active,
                  avatar_face_coordinates: m.target_profile.avatar_face_coordinates,
                  matchScore: m.gauge_score || 0,
                  ratingScore: calculateCreatorRating(m.target_profile),
                  current_level: scoreToLevel(m.gauge_score).label,
                  gauge_score: m.gauge_score,
                  kycVerified: m.target_profile.is_kyc_verified
                }))}
                selectedConnection={selectedMatchId ? {
                  id: selectedMatchId,
                  name: liveMatches.find(m => m.target_profile.id === selectedMatchId)?.target_profile.username || "",
                  avatar: liveMatches.find(m => m.target_profile.id === selectedMatchId)?.target_profile.avatar_url || "",
                  matchScore: Math.round(selectedMatchState?.sharedScore || 0),
                  current_level: selectedMatchState?.level.label
                } : null}
                onSelectConnection={(conn) => selectMatch(currentUser?.id || "", conn.id)}
                dualGauge={selectedMatchState}
                onOpenSuggestionMoves={(targetId) => {
                  setSelectedMatchId(targetId);
                  setIsMoveModalOpen(true);
                }}
              />
            )}

            {activeTab === "calendar" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold flex items-center gap-2">
                    <Calendar className="text-primary" /> Connection Events
                    Calendar
                  </h2>
                  <p className="text-[9px] font-black text-primary uppercase tracking-[0.2em] bg-primary/10 px-3 py-1 rounded border border-primary/20">
                    VIP & Soulmate Schedule
                  </p>
                </div>
                {isLoadingCalendar ? (
                  <div className="flex justify-center items-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                ) : calendarEvents.length > 0 ? (
                  <div className="space-y-3">
                    {calendarEvents.map((event) => (
                      <div
                        key={event.id}
                        className="p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-white/20 transition group flex justify-between items-center"
                      >
                        <div>
                          <p className="font-bold text-sm tracking-tight">
                            {event.title}
                          </p>
                          <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mt-1">
                            {new Date(event.start_time).toLocaleString()} -{" "}
                            {new Date(event.end_time).toLocaleTimeString()}
                          </p>
                          {event.description && (
                            <p className="text-xs text-white/70 mt-2">
                              {event.description}
                            </p>
                          )}
                        </div>
                        <span
                          className={`text-[9px] font-black uppercase tracking-wider px-3 py-1 rounded-full border ${
                            event.type === "master"
                              ? "bg-[#ffabf3]/15 text-[#ffabf3] border-[#ffabf3]/30"
                              : "bg-primary/15 text-primary border-primary/30"
                          }`}
                        >
                          {event.type}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 text-center opacity-50">
                    <Calendar className="w-16 h-16 mb-4 text-white/30" />
                    <p className="text-xs font-black uppercase tracking-widest">
                      No upcoming events or dates scheduled.
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "livestream" && (
              <div className="space-y-6">
                {matchedCreators[selectedCandidate.id] ? (
                  <LivePulseHub
                    currentUser={mappedCurrentUser}
                    candidateProfile={selectedCandidate}
                    onLock={() =>
                      setMatchedCreators((prev) => ({
                        ...prev,
                        [selectedCandidate.id]: false,
                      }))
                    }
                  />
                ) : (
                  <MatchGate
                    currentUser={mappedCurrentUser}
                    candidateProfile={selectedCandidate}
                    onUnlocked={() =>
                      setMatchedCreators((prev) => ({
                        ...prev,
                        [selectedCandidate.id]: true,
                      }))
                    }
                    onSelectCandidate={(id) => setSelectedCandidateId(id)}
                    candidatesList={MOCK_CANDIDATES}
                  />
                )}

                <div className="pt-4">
                  <SafetyWarning />
                </div>
              </div>
            )}

            {activeTab === "master" && (
              <MemberRosterTab
                subscriptions={roster.map((c) => ({
                  id: c.id,
                  creatorId: c.id,
                  creatorName: c.name,
                  avatarUrl: c.avatar,
                  tier: 'master' as const,
                  monthlyPrice: c.basePrice || 10,
                  status: c.isCancelled ? ('cancelled' as const) : ('active' as const),
                  nextBillingDate: 'Next 1st of month',
                  autoRenew: !c.isCancelled,
                  unlockedPerks: ['VIP Streams', 'Direct Messaging', 'Private Vault']
                }))}
                onToggleAutoRenew={async (subId) => {
                  handleCancelRosterAutoRenew(subId);
                }}
                onCancelSubscription={async (subId) => {
                  const idx = roster.findIndex(r => r.id === subId);
                  if (idx !== -1) handleRemoveCreator(idx);
                }}
              />
            )}
            </div>
          </framerMotion.div>
        </div>
      </div>

      {/* SWAP/ADD CREATOR MODAL */}
      <AnimatePresence>
        {isSwapOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <framerMotion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="w-full max-w-lg bg-[#11111A] border border-white/10 p-6 rounded-3xl shadow-2xl relative"
            >
              <button
                onClick={() => {
                  setIsSwapOpen(false);
                  setSwapTargetIndex(null);
                }}
                className="absolute top-4 right-4 text-white/30 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-xl font-black uppercase tracking-tighter mb-2 text-white flex items-center gap-2">
                <Crown className="w-5 h-5 text-primary" /> Add Creator to Roster
              </h3>
              <p className="text-[10px] text-white/40 uppercase font-bold tracking-wider mb-6">
                Choose a matched candidate to sponsor. This will adjust your
                monthly master fee.
              </p>

              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                {availableCandidates.map((cand) => {
                  const matchScore = calculateMatchProbability(
                    mappedCurrentUser,
                    cand,
                  );
                  return (
                    <div
                      key={cand.id}
                      className="flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-2xl hover:border-primary/40 transition group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden border border-white/20 relative">
                          <BlurredFaceImage
                            src={cand.avatar}
                            alt={cand.name}
                            sharedScore={
                              liveMatches.find((m) => m.target_profile.id === cand.id)?.gauge_score ?? 0
                            }
                            isEnabledByOwner={false}
                            faceCoordinates={{ x: 0.5, y: 0.35, r: 0.18 }}
                            className="w-full h-full"
                          />
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-white">
                            {cand.name}
                          </h4>
                          <p className="text-[9px] uppercase tracking-widest text-primary font-black mt-0.5">
                            {matchScore}% Synergy
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <span className="text-[9px] text-white/40 font-bold uppercase block">
                            Base Price
                          </span>
                          <span className="text-xs font-black text-white">
                            $
                            {(cand.basePrice ?? 10).toFixed(2)}
                          </span>
                        </div>
                        <button
                          onClick={() => handleSwapConfirm(cand)}
                          className="px-3.5 py-2 bg-primary text-black font-black uppercase tracking-widest text-[9px] rounded-xl hover:shadow-[0_0_15px_rgba(102,252,241,0.4)] transition"
                        >
                          Sponsor
                        </button>
                      </div>
                    </div>
                  );
                })}
                {availableCandidates.length === 0 && (
                  <p className="text-center py-6 text-xs text-white/30 font-medium">
                    All matched candidates are already sponsored!
                  </p>
                )}
              </div>
            </framerMotion.div>
          </div>
        )}
      </AnimatePresence>

      {/* RATING MODAL */}
      <AnimatePresence>
        {isRateModalOpen && selectedMatch && (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-[#11111A] border border-white/10 p-8 rounded-[2.5rem] shadow-2xl relative"
            >
              <button
                onClick={() => setIsRateModalOpen(false)}
                className="absolute top-6 right-6 text-white/30 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-xl font-black uppercase tracking-tighter mb-2 text-white flex items-center gap-2">
                <Crown className="w-5 h-5 text-yellow-500" /> Rate Connection
              </h3>
              <p className="text-[10px] text-white/40 uppercase font-bold tracking-wider mb-6">
                Submit dynamic review for @
                {selectedMatch.target_profile.username}.
              </p>

              <div className="space-y-6">
                {selectedMatch.target_profile.role === "creator" ? (
                  <>
                    {/* Creator Criteria: Content Quality, Content Exclusivity, Communication experience, Attractiveness, Kindness */}
                    {[
                      {
                        label: "Content Quality",
                        val: ratingC1,
                        set: setRatingC1,
                      },
                      {
                        label: "Content Exclusivity",
                        val: ratingC2,
                        set: setRatingC2,
                      },
                      {
                        label: "Communication Experience",
                        val: ratingC3,
                        set: setRatingC3,
                      },
                      {
                        label: "Attractiveness",
                        val: ratingC4,
                        set: setRatingC4,
                      },
                      { label: "Kindness", val: ratingC5, set: setRatingC5 },
                    ].map((crit, idx) => (
                      <div key={idx} className="space-y-2">
                        <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-white/60">
                          <span>{crit.label}</span>
                          <span className="text-primary">{crit.val} / 5</span>
                        </div>
                        <input
                          type="range"
                          min="1"
                          max="5"
                          step="1"
                          value={crit.val}
                          onChange={(e) => crit.set(Number(e.target.value))}
                          className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary"
                        />
                      </div>
                    ))}
                  </>
                ) : (
                  <>
                    {/* Member Criteria: Kindness, Communication experience, Attractiveness, Common Interests */}
                    {[
                      { label: "Kindness", val: ratingC1, set: setRatingC1 },
                      {
                        label: "Communication Experience",
                        val: ratingC2,
                        set: setRatingC2,
                      },
                      {
                        label: "Attractiveness",
                        val: ratingC3,
                        set: setRatingC3,
                      },
                      {
                        label: "Common Interests",
                        val: ratingC4,
                        set: setRatingC4,
                      },
                    ].map((crit, idx) => (
                      <div key={idx} className="space-y-2">
                        <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-white/60">
                          <span>{crit.label}</span>
                          <span className="text-accent">{crit.val} / 5</span>
                        </div>
                        <input
                          type="range"
                          min="1"
                          max="5"
                          step="1"
                          value={crit.val}
                          onChange={(e) => crit.set(Number(e.target.value))}
                          className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-accent"
                        />
                      </div>
                    ))}
                  </>
                )}

                <div className="pt-4 border-t border-white/5 flex flex-col gap-3">
                  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-wider text-white/60">
                    <span>Estimated Vibe Rating:</span>
                    <span className="text-yellow-500 font-bold text-sm">
                      {(selectedMatch.target_profile.role === "creator"
                        ? (ratingC1 +
                            ratingC2 +
                            ratingC3 +
                            ratingC4 +
                            ratingC5) *
                          0.8
                        : ratingC1 + ratingC2 + ratingC3 + ratingC4
                      ).toFixed(2)}{" "}
                      / 20.00
                    </span>
                  </div>

                  <button
                    onClick={handleSaveRating}
                    disabled={isSavingRating}
                    className="w-full py-4 bg-gradient-to-r from-primary to-accent text-black font-black uppercase tracking-widest text-xs rounded-2xl hover:shadow-[0_0_20px_rgba(102,252,241,0.4)] transition disabled:opacity-50"
                  >
                    {isSavingRating ? "Submitting Rating..." : "Submit Rating"}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* EDIT PROMPT MODAL */}
      <AnimatePresence>
        {isPromptModalOpen && (
          <div className="fixed inset-0 z-[120] bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
            <framerMotion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-xl bg-[#11111A] border border-white/10 p-8 rounded-[2rem] shadow-2xl relative max-h-[90vh] overflow-y-auto custom-scrollbar"
            >
              <button
                onClick={() => {
                  setIsPromptModalOpen(false);
                  setPromptError(null);
                }}
                disabled={isSavingPrompt}
                className="absolute top-6 right-6 text-white/30 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-xl font-black uppercase tracking-tighter mb-2 text-white flex items-center gap-2">
                <Brain className="w-5 h-5 text-primary animate-pulse" /> Relational Prompt Picker
              </h3>
              <p className="text-[10px] text-white/40 uppercase font-bold tracking-wider mb-6">
                Choose a category and prompt question. Write a raw, vulnerable narrative response (50-500 chars) for AI analysis.
              </p>

              <div className="space-y-6">
                {/* Categories Tab Selector */}
                <div className="flex flex-wrap gap-1.5 p-1 bg-white/5 rounded-2xl border border-white/5">
                  {(Object.keys(INSIGHT_PROMPTS) as Array<keyof typeof INSIGHT_PROMPTS>).map((catKey) => {
                    const isSel = tempCategory === catKey;
                    return (
                      <button
                        key={catKey}
                        type="button"
                        onClick={() => {
                          setTempCategory(catKey);
                          setTempQuestion(INSIGHT_PROMPTS[catKey].prompts[0]);
                        }}
                        disabled={isSavingPrompt}
                        className={`px-3 py-2 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all duration-200 flex-1 min-w-[80px] ${
                          isSel
                            ? "bg-primary text-black shadow-lg"
                            : "text-white/40 hover:text-white/80 hover:bg-white/5"
                        }`}
                      >
                        {catKey}
                      </button>
                    );
                  })}
                </div>

                {/* Prompt Question list */}
                <div className="space-y-2 text-left">
                  <span className="text-[9px] font-black uppercase text-white/50 tracking-widest block mb-1">
                    Select Question
                  </span>
                  <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1 custom-scrollbar">
                    {INSIGHT_PROMPTS[tempCategory].prompts.map((q) => {
                      const isSel = tempQuestion === q;
                      return (
                        <button
                          key={q}
                          type="button"
                          onClick={() => setTempQuestion(q)}
                          disabled={isSavingPrompt}
                          className={`w-full text-left p-3.5 rounded-xl border text-xs font-semibold leading-relaxed transition ${
                            isSel
                              ? "border-primary/50 bg-primary/5 text-white"
                              : "border-white/5 bg-white/2 text-white/60 hover:border-white/10 hover:text-white/80"
                          }`}
                        >
                          {q}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Answer Text Area */}
                <div className="space-y-2 text-left">
                  <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-white/50">
                    <span>Vulnerable Answer</span>
                    <span className={tempAnswer.length < 10 || tempAnswer.length > 500 ? "text-primary animate-pulse" : "text-success"}>
                      {tempAnswer.length} / 500 chars (Min 10)
                    </span>
                  </div>
                  <textarea
                    value={tempAnswer}
                    onChange={(e) => setTempAnswer(e.target.value)}
                    placeholder="Write your honest, descriptive response. Avoid cliché answers. Focus on feelings, insights, or personal examples..."
                    disabled={isSavingPrompt}
                    rows={5}
                    className="w-full bg-black/50 border border-white/10 rounded-2xl px-4 py-3 text-xs font-semibold focus:border-primary focus:outline-none transition-colors resize-none leading-relaxed text-white"
                  />
                  <p className="text-[8px] text-white/30">
                    ℹ️ Tips: Write at least 2 sentences. Mentioning specific stories, emotions, or boundaries unlocks deeper AI personality reads.
                  </p>
                </div>

                {promptError && (
                  <div className="flex items-center gap-2 p-3 bg-red-950/20 border border-red-500/20 rounded-xl text-red-400 text-xs font-semibold">
                    <AlertCircle className="w-4.5 h-4.5 shrink-0" />
                    <span>{promptError}</span>
                  </div>
                )}

                {/* CTAs */}
                <div className="pt-4 border-t border-white/5 flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setIsPromptModalOpen(false);
                      setPromptError(null);
                    }}
                    disabled={isSavingPrompt}
                    className="flex-1 py-3.5 bg-white/5 border border-white/10 text-white/50 font-black text-[10px] tracking-widest uppercase hover:bg-white/10 rounded-xl transition disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSavePrompt}
                    disabled={isSavingPrompt || tempAnswer.length < 10 || tempAnswer.length > 500}
                    className="flex-1 py-3.5 bg-gradient-to-r from-primary to-accent text-black font-black uppercase tracking-widest text-[10px] rounded-xl hover:shadow-[0_0_20px_rgba(102,252,241,0.4)] transition disabled:opacity-50 flex items-center justify-center gap-1.5"
                  >
                    {isSavingPrompt ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" /> Analyzing response...
                      </>
                    ) : (
                      "Submit & Analyze"
                    )}
                  </button>
                </div>
              </div>
            </framerMotion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MultiSelect Modal */}
      {multiSelectConfig && (
        <MultiSelectModal
          isOpen={multiSelectConfig.isOpen}
          onClose={() => setMultiSelectConfig(null)}
          title={multiSelectConfig.title}
          options={multiSelectConfig.options}
          initialSelected={multiSelectConfig.initialSelected}
          minSelections={1}
          maxSelections={multiSelectConfig.fieldKey === "hobbies" ? 10 : multiSelectConfig.fieldKey === "sexual_preferences" ? 1 : 5}
          onSave={handleSaveMultiSelect}
        />
      )}
      {/* Profile Details Modal */}
      {selectedProfileId && (
        <ProfileDetailsModal
          profileId={selectedProfileId}
          onClose={() => setSelectedProfileId(null)}
          currentUserId={currentUser?.id}
        />
      )}

      {/* Delete Account Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <framerMotion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => !isDeletingAccount && setShowDeleteModal(false)}
            />
            <framerMotion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-black/90 border border-red-500/30 p-6 rounded-[2rem] shadow-2xl"
            >
              <div className="text-center space-y-6">
                <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto border border-red-500/50">
                  <AlertCircle className="w-8 h-8 text-red-500" />
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-xl font-bold uppercase tracking-widest text-red-500">Delete Account</h3>
                  <p className="text-sm text-red-400/80">
                    This action is permanent. All your data, matches, and media will be wiped immediately.
                  </p>
                </div>

                <div className="space-y-3">
                  <p className="text-[10px] font-black text-white/50 uppercase tracking-widest text-left pl-2">
                    Type <span className="text-red-500">DELETE</span> to confirm
                  </p>
                  <input
                    type="text"
                    value={deleteConfirmation}
                    onChange={(e) => setDeleteConfirmation(e.target.value)}
                    disabled={isDeletingAccount}
                    className="w-full bg-black/50 border border-red-500/30 rounded-xl p-4 text-center font-black tracking-widest text-red-500 placeholder-red-900/50 focus:outline-none focus:border-red-500 transition-colors"
                    placeholder="DELETE"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    disabled={isDeletingAccount}
                    className="flex-1 py-3 rounded-xl border border-white/10 text-white/70 font-bold text-xs uppercase tracking-widest hover:bg-white/5 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteAccount}
                    disabled={deleteConfirmation !== "DELETE" || isDeletingAccount}
                    className="flex-1 py-3 rounded-xl bg-red-500 text-white font-bold text-xs uppercase tracking-widest hover:bg-red-600 transition-colors disabled:opacity-50 disabled:bg-red-500/20 disabled:text-red-500/50 flex justify-center items-center gap-2"
                  >
                    {isDeletingAccount ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                    Confirm
                  </button>
                </div>
              </div>
            </framerMotion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Profile Preview Modal */}
      <ProfilePreviewModal
        isOpen={showMemberPreviewModal}
        onClose={() => setShowMemberPreviewModal(false)}
        profile={{
          display_name: (currentUserProfile as any)?.display_name || (mappedCurrentUser as any)?.name,
          username: (currentUserProfile as any)?.username,
          avatar_url: (currentUserProfile as any)?.avatar_url || (mappedCurrentUser as any)?.avatar,
          archetype: (currentUserProfile as any)?.archetype,
          core_passion: (currentUserProfile as any)?.core_passion,
          bio_prompt_answer: (currentUserProfile as any)?.bio_prompt_answer,
          bio_prompt_answer_2: (currentUserProfile as any)?.bio_prompt_answer_2,
          privacy_settings: (currentUserProfile as any)?.privacy_settings,
          spoken_languages: (currentUserProfile as any)?.spoken_languages || (mappedCurrentUser as any)?.favoriteLanguages || ["English"],
          album_photos: (mediaItems || []).map((p: any) => p.media_url || p.url),
          album_media: mediaItems || [],
          role: "member",
          education_level: (currentUserProfile as any)?.education_level,
          career: (currentUserProfile as any)?.career,
          astro_sign: (currentUserProfile as any)?.astro_sign,
          habits: (currentUserProfile as any)?.lifestyle_habits?.habits || [],
          relationship_goals: (currentUserProfile as any)?.relationship_goals,
          relationship_types: (currentUserProfile as any)?.relationship_types,
          sexual_preferences: (currentUserProfile as any)?.sexual_preferences,
          family_goals: (currentUserProfile as any)?.lifestyle_habits?.family_goals,
          hobbies: (currentUserProfile as any)?.hobbies,
          bio: (currentUserProfile as any)?.bio,
        }}
      />
    </div>
  );
}
