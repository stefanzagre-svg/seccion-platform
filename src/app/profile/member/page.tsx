"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
const framerMotion = motion;
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
import {
  HABIT_CHOICES,
  FAMILY_GOALS,
  RELATIONSHIP_GOALS,
  RELATIONSHIP_TYPES,
  SEXUAL_PREFERENCES,
  LANGUAGES,
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
    id: "elena",
    name: "Elena",
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
    id: "sofia",
    name: "Sofia",
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
    id: "valentina",
    name: "Valentina",
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
    moods: ["deep_intimate"] as MoodId[],
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
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<
    "status" | "calendar" | "livestream" | "track" | "master" | "insights" | "media"
  >("status");

  // Profile Album Media States
  const [mediaItems, setMediaItems] = useState<ProfileMedia[]>([]);
  const [isLoadingMedia, setIsLoadingMedia] = useState(false);
  const [mediaUrlInput, setMediaUrlInput] = useState("");
  const [mediaTypeInput, setMediaTypeInput] = useState<"image" | "video">("image");
  const [mediaIsHiddenInput, setMediaIsHiddenInput] = useState(false);
  const [mediaRequiredLevelInput, setMediaRequiredLevelInput] = useState("public");
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);

  const MOCK_MEDIA_ITEMS: ProfileMedia[] = [
    { id: 'mock-media-1', user_id: 'mock-user-id', media_url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&q=80', media_type: 'image', is_hidden: false, required_level: 'public' },
    { id: 'mock-media-2', user_id: 'mock-user-id', media_url: 'https://images.unsplash.com/photo-1511556532299-8f662fc26c06?w=600&q=80', media_type: 'image', is_hidden: false, required_level: 'public' },
    { id: 'mock-media-3', user_id: 'mock-user-id', media_url: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=600&q=80', media_type: 'image', is_hidden: true, required_level: 'friendly' },
    { id: 'mock-media-4', user_id: 'mock-user-id', media_url: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=600&q=80', media_type: 'image', is_hidden: true, required_level: 'vip' }
  ];

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
    setIsUploadingMedia(true);
    const userId = currentUser?.id || "mock-user-id";
    try {
      if (!currentUser) {
        const newItem: ProfileMedia = {
          id: `mock-media-${Date.now()}`,
          user_id: userId,
          media_url: mediaUrlInput,
          media_type: mediaTypeInput,
          is_hidden: mediaIsHiddenInput,
          required_level: mediaIsHiddenInput ? mediaRequiredLevelInput : "public"
        };
        setMediaItems(prev => [...prev, newItem]);
        setMediaUrlInput("");
        alert("Media uploaded successfully! (Demo Mode)");
        return;
      }

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
      setMediaItems(prev => prev.filter(m => m.id !== mediaId));
      alert("Media deleted successfully! (Demo Mode)");
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
    useState<string>("elena");
  const [matchedCreators, setMatchedCreators] = useState<
    Record<string, boolean>
  >({
    elena: false,
    sofia: false,
    valentina: false,
    marco: false,
  });

  // Master Subscription Roster Management States
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [roster, setRoster] = useState<any[]>([
    {
      id: "elena",
      name: "Elena",
      avatar:
        "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&q=80",
      niche: "Fitness",
      basePrice: 15,
      accelerator: 0.95,
      isCancelled: false,
    },
    {
      id: "sofia",
      name: "Sofia",
      avatar:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80",
      niche: "Tech",
      basePrice: 12,
      accelerator: 0.88,
      isCancelled: false,
    },
    {
      id: "valentina",
      name: "Valentina",
      avatar:
        "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=200&q=80",
      niche: "Music",
      basePrice: 10,
      accelerator: 0.6,
      isCancelled: false,
    },
  ]);
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

  // Load matches
  const loadMatches = async (userId: string) => {
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
        const fallbackMatches = [
          {
            relationship_id: "mock-rel-elena",
            target_profile: {
              id: "elena",
              username: "Elena",
              display_name: "Elena",
              avatar_url:
                "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&q=80",
              role: "creator",
              bio: "Fitness & lifestyle enthusiast",
              hobbies: ["Fitness", "Music", "Traveling"],
              lifestyle_habits: [],
              astro_sign: "Leo",
              relationship_goals: ["Good Vibe Instant Crush"],
            },
            current_level: "friendly",
            gauge_score: 22,
            is_matched: true,
          },
          {
            relationship_id: "mock-rel-sofia",
            target_profile: {
              id: "sofia",
              username: "Sofia",
              display_name: "Sofia",
              avatar_url:
                "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80",
              role: "creator",
              bio: "Tech & gaming enthusiast",
              hobbies: ["Tech", "Gaming", "Art"],
              lifestyle_habits: [],
              astro_sign: "Gemini",
              relationship_goals: ["Open to possibilities"],
            },
            current_level: "close",
            gauge_score: 35,
            is_matched: true,
          },
          {
            relationship_id: "mock-rel-valentina",
            target_profile: {
              id: "valentina",
              username: "Valentina",
              display_name: "Valentina",
              avatar_url:
                "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=200&q=80",
              role: "creator",
              bio: "Music & fashion enthusiast",
              hobbies: ["Music", "Yoga", "Fashion"],
              lifestyle_habits: [],
              astro_sign: "Libra",
              relationship_goals: ["Casual"],
            },
            current_level: "soulmate",
            gauge_score: 95,
            is_matched: true,
          },
        ];
        setLiveMatches(fallbackMatches);
        await selectMatch(
          userId,
          fallbackMatches[0].target_profile.id,
          fallbackMatches,
        );
      }
    } catch (e) {
      console.error("Failed to load matches:", e);
    }
  };

  const loadCalendarEvents = async () => {
    const userId = currentUser?.id || "mock-user-id";
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
        // Fallbacks for Guest Demo Mode to showcase premium UI
        if (creatorId === "elena") {
          setCreatorGoals([
            {
              id: "mock-goal-elena",
              creator_id: "elena",
              title: "Upgrade Live Stream Camera Setup",
              description:
                "Help me fund a new Sony A7S III camera for ultra-high-definition 4K broadcasts!",
              target_amount: 1200.0,
              current_amount: 850.0,
              is_completed: false,
            },
          ]);
        } else if (creatorId === "sofia") {
          setCreatorGoals([
            {
              id: "mock-goal-sofia",
              creator_id: "sofia",
              title: "New Coding & Gaming Rig",
              description:
                "Funding a high-spec AMD Ryzen 9 workstation for faster content compiling and high-frame-rate streaming.",
              target_amount: 2500.0,
              current_amount: 1420.0,
              is_completed: false,
            },
          ]);
        } else if (creatorId === "valentina") {
          setCreatorGoals([
            {
              id: "mock-goal-valentina",
              creator_id: "valentina",
              title: "Acoustic Studio Panels & Soundproofing",
              description:
                "Soundproofing my new recording booth to deliver crystal clear podcast audio and ASMR broadcasts.",
              target_amount: 600.0,
              current_amount: 450.0,
              is_completed: false,
            },
          ]);
        } else {
          setCreatorGoals([]);
        }
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
      if (
        targetId === "elena" ||
        targetId === "sofia" ||
        targetId === "valentina"
      ) {
        const found = matchesList.find((m) => m.target_profile.id === targetId);
        const myScore = found?.gauge_score || 50;
        const theirScore =
          targetId === "elena" ? 70 : targetId === "sofia" ? 45 : 98;
        const dualState = getDualGaugeState(myScore, theirScore);
        setSelectedMatchState(dualState);
      } else {
        const stateObj = await getRelationshipState(userId, targetId);
        const dualState = getDualGaugeState(
          stateObj.myScore,
          stateObj.theirScore,
        );
        setSelectedMatchState(dualState);
      }
    } catch (err) {
      console.error("Error selecting match:", err);
    }
  };

  const handleSelectMove = async (moveId: string, label: string) => {
    const userId = currentUser?.id || "mock-user-id";
    try {
      if (
        selectedMatchId === "elena" ||
        selectedMatchId === "sofia" ||
        selectedMatchId === "valentina"
      ) {
        setLiveMatches((prev) =>
          prev.map((m) => {
            if (m.target_profile.id === selectedMatchId) {
              const nextScore = Math.min(100, m.gauge_score + 20);
              return { ...m, gauge_score: nextScore };
            }
            return m;
          }),
        );
        setTimeout(() => {
          selectMatch(userId, selectedMatchId);
        }, 100);
      } else {
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
      }
    } catch (err) {
      console.error("Failed to send suggestion move:", err);
    }
  };

  // Auth and DB subscriptions loader
  useEffect(() => {
    const loadSessionAndRoster = async () => {
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
        // Fallback for non-authenticated view
        await loadMatches("mock-user-id");
        setCurrentUserProfile({
          id: "mock-user-id",
          username: "Alex_N",
          display_name: "Alex_N",
          avatar_url:
            "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80",
          role: "member",
          relationshipGoal: "Good Vibe Instant Crush",
          relationship_goals: ["Good Vibe Instant Crush"],
          relationship_types: ["Monogamous"],
          hobbies: ["Fitness", "Tech", "Traveler"],
          lifestyle_habits: MOCK_USER.habits,
          is_kyc_verified: true,
        });
        setMediaItems(MOCK_MEDIA_ITEMS);
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
      setCurrentUserProfile((prev: any) => ({ ...prev, bio: tempBio }));
      alert("Biography updated successfully! (Demo Mode)");
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
        setTimeout(() => {
          if (editingPromptIndex === 1) {
            setCurrentUserProfile((prev: any) => ({
              ...prev,
              bio_prompt_category: tempCategory,
              bio_prompt_question: tempQuestion,
              bio_prompt_answer: tempAnswer,
              bio_analysis: {
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
              }
            }));
          } else {
            setCurrentUserProfile((prev: any) => ({
              ...prev,
              bio_prompt_category_2: tempCategory,
              bio_prompt_question_2: tempQuestion,
              bio_prompt_answer_2: tempAnswer,
              bio_analysis_2: {
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
              }
            }));
          }
          setIsSavingPrompt(false);
          setIsPromptModalOpen(false);
          alert(`Relational prompt ${editingPromptIndex} and insights updated! (Demo Mode)`);
        }, 1500);
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
    const basePrice = cand.id === "elena" ? 15 : cand.id === "sofia" ? 12 : 10;
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
    
    // Maintain backward compatibility for mapped string fields if needed
    if (fieldKey === "relationship_goals") updatedProfile.relationshipGoal = selected[0] || "";
    if (fieldKey === "relationship_types") updatedProfile.relationshipType = selected[0] || "";
    if (fieldKey === "sexual_preferences") updatedProfile.sexual_preference = selected[0] || "";
    
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
          subscriberId: currentUser?.id || "mock-user-id",
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
            : [currentUserProfile.sexual_preference].filter(Boolean),
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
        id: currentUser?.id || currentUserProfile.id || "mock-user-id",
        username:
          currentUserProfile.username ||
          currentUserProfile.display_name ||
          "Alex_N",
        avatar:
          currentUserProfile.avatar_url ||
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80",
        bioPromptCategory: currentUserProfile.bio_prompt_category || "",
        bioPromptQuestion: currentUserProfile.bio_prompt_question || "",
        bioPromptAnswer: currentUserProfile.bio_prompt_answer || "",
        bioAnalysis: currentUserProfile.bio_analysis || null,
        bioPromptCategory2: currentUserProfile.bio_prompt_category_2 || "",
        bioPromptQuestion2: currentUserProfile.bio_prompt_question_2 || "",
        bioPromptAnswer2: currentUserProfile.bio_prompt_answer_2 || "",
        bioAnalysis2: currentUserProfile.bio_analysis_2 || null,
        bio: currentUserProfile.bio || "",
      }
    : {
        ...MOCK_USER,
        favoriteLanguages: MOCK_USER.favoriteLanguages || [],
        additionalLanguages: MOCK_USER.additionalLanguages || [],
        id: currentUser?.id || "mock-user-id",
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
    <div className="min-h-screen bg-transparent text-white pt-20 px-4 md:px-12 relative overflow-hidden">
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
                    Update Avatar
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
                  <span title="KYC Verified">
                    <ShieldCheck className="w-5 h-5 text-green-500" />
                  </span>
                )}
              </h1>
              <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
                {(mappedCurrentUser.relationshipGoals || []).map((goal: string, idx: number) => (
                  <div key={idx} className="flex items-center gap-1">
                    <p
                      className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.2em] cursor-pointer hover:text-primary transition bg-white/5 px-2 py-1 rounded border border-white/10"
                      onClick={() => handleOpenMultiSelect("relationship_goals", "Relationship Goals", RELATIONSHIP_GOALS, mappedCurrentUser.relationshipGoals || [])}
                    >
                      {goal}
                    </p>
                    {renderPrivacyToggle("relationship_goals", goal)}
                  </div>
                ))}
              </div>

              <div className="mt-6 w-full space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-widest text-white/40 px-2">
                    <span>Profile Completion</span>
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
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-widest text-white/40 px-2">
                    <span>Matching Probability</span>
                    <span className="text-primary">AI Powered</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                    <framerMotion.div
                      initial={{ width: 0 }}
                      animate={{ width: "94%" }}
                      className="h-full bg-gradient-to-r from-primary to-accent shadow-[0_0_10px_rgba(255,0,127,0.5)]"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-4 flex flex-col items-center gap-2">
                <div className="flex flex-wrap items-center justify-center gap-2">
                  {(mappedCurrentUser.relationshipTypes || []).map((type: string, idx: number) => (
                    <div key={idx} className="flex items-center gap-1">
                      <p
                        className="text-[10px] text-primary font-black uppercase tracking-[0.2em] cursor-pointer hover:text-accent transition bg-primary/10 px-2 py-1 rounded border border-primary/20"
                        onClick={() => handleOpenMultiSelect("relationship_types", "Relationship Types", RELATIONSHIP_TYPES, mappedCurrentUser.relationshipTypes || [])}
                      >
                        {type}
                      </p>
                      {renderPrivacyToggle("relationship_types", type)}
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-1 mt-2">
                  <div
                    className="flex items-center gap-2 text-[9px] text-white/60 font-black uppercase tracking-widest bg-white/5 px-4 py-1.5 rounded-full border border-white/10 cursor-pointer hover:text-accent transition"
                    onClick={handleCycleFamilyGoals}
                  >
                    <Users className="w-3.5 h-3.5 text-accent" />{" "}
                    {mappedCurrentUser.familyGoals}
                  </div>
                </div>
                
                {/* Sexual Preferences */}
                <div className="flex flex-wrap gap-2 justify-center mt-2">
                  {(mappedCurrentUser.sexualPreferences || []).map((pref: string) => (
                    <div key={pref} className="flex items-center gap-1">
                      <span 
                        className="text-[9px] text-accent font-black uppercase tracking-widest bg-white/5 px-3 py-1 rounded-full border border-white/10 cursor-pointer hover:border-accent transition"
                        onClick={() => handleOpenMultiSelect("sexual_preferences", "Sexual Preferences", SEXUAL_PREFERENCES, mappedCurrentUser.sexualPreferences)}
                      >
                        {pref}
                      </span>
                      {renderPrivacyToggle("sexual_preferences", pref)}
                    </div>
                  ))}
                </div>

                {/* Languages */}
                <div className="flex flex-col gap-2 justify-center mt-4">
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    <span className="text-[9px] font-black uppercase text-white/40 tracking-widest">Favorite:</span>
                    {(mappedCurrentUser.favoriteLanguages?.length > 0 ? mappedCurrentUser.favoriteLanguages : ["Add Favorite Language"]).map((lang: string) => (
                      <div key={lang} className="flex items-center gap-1">
                        <span 
                          className="text-[9px] text-primary font-black uppercase tracking-widest bg-white/5 px-3 py-1 rounded-full border border-white/10 cursor-pointer hover:border-primary transition"
                          onClick={() => handleOpenMultiSelect("favorite_languages", "Favorite Language(s)", LANGUAGES, mappedCurrentUser.favoriteLanguages)}
                        >
                          {lang}
                        </span>
                        {lang !== "Add Favorite Language" && renderPrivacyToggle("favorite_languages", lang)}
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex flex-wrap items-center justify-center gap-2 mt-1">
                    <span className="text-[9px] font-black uppercase text-white/40 tracking-widest">Additional:</span>
                    {(mappedCurrentUser.additionalLanguages?.length > 0 ? mappedCurrentUser.additionalLanguages : ["Add Additional Language"]).map((lang: string) => (
                      <div key={lang} className="flex items-center gap-1">
                        <span 
                          className="text-[9px] text-white/70 font-black uppercase tracking-widest bg-white/5 px-3 py-1 rounded-full border border-white/10 cursor-pointer hover:border-white transition"
                          onClick={() => handleOpenMultiSelect("additional_languages", "Additional Language(s)", LANGUAGES, mappedCurrentUser.additionalLanguages)}
                        >
                          {lang}
                        </span>
                        {lang !== "Add Additional Language" && renderPrivacyToggle("additional_languages", lang)}
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Hidden info badge */}
                {privacySettings?.hidden_values && Object.keys(privacySettings.hidden_values).length > 0 && (
                  <div className="mt-4 flex justify-center">
                    <div className="flex items-center gap-2 bg-[#dc143c]/10 border border-[#dc143c]/30 px-4 py-2 rounded-full shadow-[0_0_15px_rgba(220,20,60,0.15)]">
                      <Lock className="w-3.5 h-3.5 text-[#dc143c]" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-[#dc143c]">
                        {Object.values(privacySettings.hidden_values).reduce((acc, field) => acc + Object.keys(field).length, 0)}+ Hidden Info
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-2 justify-center mt-6">
                {MOCK_USER.hobbies.map((hobby) => (
                  <span
                    key={hobby}
                    className="px-3 py-1 bg-white/5 border border-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest text-white/40 hover:text-white hover:border-primary transition-all"
                  >
                    {hobby}
                  </span>
                ))}
              </div>
            </div>
          </framerMotion.div>

          <framerMotion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/[0.02] border border-white/5 p-2 rounded-[2rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)] backdrop-blur-xl relative overflow-hidden"
          >
            <div className="bg-black/40 border border-white/5 rounded-[calc(2rem-0.5rem)] p-4 space-y-2 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
              {[
                { id: "status", label: "Status Lists", icon: ListOrdered },
                { id: "insights", label: "Relational Insights", icon: Brain },
                { id: "track", label: "Track Record", icon: Activity },
                { id: "calendar", label: "Calendar Events", icon: Calendar },
                { id: "livestream", label: "Live Pulse Hub", icon: Video },
                { id: "master", label: "My Sponsored Creators", icon: Crown },
                { id: "media", label: "My Media Album", icon: Image },
              ].map((tab) => {
                const Icon = tab.icon;
                const isSelected = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`w-full flex items-center justify-between p-3 rounded-xl transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group hover:scale-[1.02] active:scale-[0.98] ${
                      isSelected
                        ? "bg-primary text-black font-black shadow-[0_0_20px_rgba(102,252,241,0.4)] border border-primary/20"
                        : "hover:bg-white/5 text-white/50 hover:text-white border border-transparent hover:border-white/5"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-110 ${isSelected ? "text-black" : "text-primary"}`} />
                      <span className="text-[10px] font-black uppercase tracking-widest">
                        {tab.label}
                      </span>
                    </div>
                    <ChevronRight className={`w-3.5 h-3.5 transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] ${isSelected ? "text-black translate-x-0" : "text-white/20 opacity-0 group-hover:opacity-100 group-hover:translate-x-1"}`} />
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
            {activeTab === "media" && (
              <div className="space-y-8 text-left">
                <div>
                  <h2 className="text-2xl font-bold uppercase tracking-tighter flex items-center gap-2 text-white">
                    <Image className="text-primary w-6 h-6" /> My Media Album
                  </h2>
                  <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest mt-1">
                    Upload and manage your public photos/videos and hidden media gated by connection levels.
                  </p>
                </div>

                {/* Upload Media Card */}
                <div className="glass-card p-6 bg-white/2 border border-white/5 rounded-3xl space-y-6">
                  <h3 className="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-2">
                    <Plus className="w-4 h-4" /> Upload New Media
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left: inputs */}
                    <div className="space-y-4">
                      <div>
                        <label className="text-[9px] font-black uppercase tracking-wider text-white/50 block mb-2">Media URL</label>
                        <input
                          type="text"
                          value={mediaUrlInput}
                          onChange={(e) => setMediaUrlInput(e.target.value)}
                          placeholder="https://images.unsplash.com/photo-..."
                          className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-xs font-semibold focus:border-primary focus:outline-none transition"
                        />
                      </div>
                      
                      {/* Presets */}
                      <div>
                        <label className="text-[8px] font-black uppercase tracking-wider text-white/30 block mb-1.5">Preset Demos (Click to populate)</label>
                        <div className="flex flex-wrap gap-2">
                          {[
                            { name: "Scenic Beach", url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80" },
                            { name: "City Skyline", url: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=800&q=80" },
                            { name: "Cozy Coffee", url: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=80" },
                            { name: "Mountain Hike", url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80" }
                          ].map(preset => (
                            <button
                              key={preset.name}
                              type="button"
                              onClick={() => setMediaUrlInput(preset.url)}
                              className="px-2.5 py-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-[8px] font-black uppercase tracking-wider transition text-white/60 hover:text-white"
                            >
                              {preset.name}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-[9px] font-black uppercase tracking-wider text-white/50 block mb-2">Media Type</label>
                          <select
                            value={mediaTypeInput}
                            onChange={(e) => setMediaTypeInput(e.target.value as any)}
                            className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2.5 text-xs font-bold focus:border-primary focus:outline-none text-white/80"
                          >
                            <option value="image">Image / Photo</option>
                            <option value="video">Video</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[9px] font-black uppercase tracking-wider text-white/50 block mb-2">Visibility</label>
                          <div className="flex items-center gap-2 h-10">
                            <input
                              type="checkbox"
                              id="isHiddenCheck"
                              checked={mediaIsHiddenInput}
                              onChange={(e) => setMediaIsHiddenInput(e.target.checked)}
                              className="w-4 h-4 rounded border-white/10 bg-black/50 text-primary focus:ring-0"
                            />
                            <label htmlFor="isHiddenCheck" className="text-xs font-bold text-white/80 cursor-pointer">
                              Hidden / Private
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right: Gating when hidden */}
                    <div className="flex flex-col justify-between p-4 bg-white/2 border border-white/5 rounded-2xl">
                      <div>
                        <h4 className="text-[10px] font-black uppercase tracking-wider text-white/60 mb-2">Gating Restrictions</h4>
                        <p className="text-[9px] text-white/40 leading-relaxed mb-4">
                          If hidden, other members must reach this connection stage to unlock and view the item.
                        </p>
                        
                        {mediaIsHiddenInput ? (
                          <div className="space-y-3">
                            <label className="text-[9px] font-black uppercase tracking-wider text-primary block">Required Level</label>
                            <select
                              value={mediaRequiredLevelInput}
                              onChange={(e) => setMediaRequiredLevelInput(e.target.value)}
                              className="w-full bg-black/50 border border-white/20 rounded-xl px-3 py-2.5 text-xs font-bold focus:border-primary focus:outline-none text-white/80"
                            >
                              <option value="subscriber">Subscribers Only (Creators)</option>
                              {RELATIONSHIP_LEVELS.filter(l => l.minScore > 0).map(level => (
                                <option key={level.key} value={level.key}>
                                  {level.label}
                                </option>
                              ))}
                            </select>
                          </div>
                        ) : (
                          <div className="py-6 flex flex-col items-center justify-center opacity-40">
                            <Eye className="w-8 h-8 text-white/40 mb-1" />
                            <span className="text-[9px] font-black uppercase tracking-widest text-white/40">Publicly Visible</span>
                          </div>
                        )}
                      </div>

                      <button
                        onClick={handleUploadMedia}
                        disabled={isUploadingMedia}
                        className="w-full mt-4 py-3 bg-primary text-black font-black uppercase tracking-widest text-[9px] rounded-xl hover:shadow-[0_0_15px_rgba(102,252,241,0.4)] transition disabled:opacity-50 flex items-center justify-center gap-1.5"
                      >
                        {isUploadingMedia ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" /> Uploading...
                          </>
                        ) : (
                          "Add to Album"
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Gallery Grid */}
                <div className="space-y-6">
                  {/* Public Grid */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-black uppercase tracking-widest text-white flex items-center gap-2 border-b border-white/5 pb-2">
                      <Eye className="w-4 h-4 text-emerald-400" /> Public Album ({mediaItems.filter(m => !m.is_hidden).length})
                    </h3>
                    
                    {mediaItems.filter(m => !m.is_hidden).length > 0 ? (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {mediaItems.filter(m => !m.is_hidden).map(media => (
                          <div key={media.id} className="relative aspect-square rounded-2xl overflow-hidden border border-white/5 group bg-white/2">
                            {media.media_type === "video" ? (
                              <div className="w-full h-full relative flex items-center justify-center">
                                <Video className="w-8 h-8 text-white/30 absolute z-10" />
                                <video src={media.media_url} className="w-full h-full object-cover opacity-60" muted />
                              </div>
                            ) : (
                              <img src={media.media_url} alt="Gallery" className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                            )}
                            <button
                              onClick={() => handleDeleteMedia(media.id)}
                              className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-red-500/80 rounded-xl border border-white/10 text-white/70 hover:text-white transition opacity-0 group-hover:opacity-100"
                              title="Delete media"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-white/40 py-4">No public media uploaded yet.</p>
                    )}
                  </div>

                  {/* Hidden Grid */}
                  <div className="space-y-3 pt-4">
                    <h3 className="text-xs font-black uppercase tracking-widest text-white flex items-center gap-2 border-b border-white/5 pb-2">
                      <Lock className="w-4 h-4 text-[#dc143c]" /> Hidden Album ({mediaItems.filter(m => m.is_hidden).length})
                    </h3>
                    
                    {mediaItems.filter(m => m.is_hidden).length > 0 ? (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {mediaItems.filter(m => m.is_hidden).map(media => (
                          <div key={media.id} className="relative aspect-square rounded-2xl overflow-hidden border border-[#dc143c]/15 group bg-white/2">
                            {media.media_type === "video" ? (
                              <div className="w-full h-full relative flex items-center justify-center">
                                <Video className="w-8 h-8 text-white/30 absolute z-10" />
                                <video src={media.media_url} className="w-full h-full object-cover opacity-60" muted />
                              </div>
                            ) : (
                              <img src={media.media_url} alt="Gallery" className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                            )}
                            
                            {/* Required level indicator */}
                            <div className="absolute bottom-2 left-2 right-2 px-2 py-1 bg-black/75 border border-white/10 rounded-lg text-[7px] font-black uppercase tracking-widest text-white/70 flex items-center gap-1">
                              <Lock className="w-2.5 h-2.5 text-primary shrink-0" />
                              <span className="truncate">
                                Reveals at: {media.required_level === 'subscriber' ? 'Subscribers' : RELATIONSHIP_LEVELS.find(l => l.key === media.required_level)?.label || 'Locked'}
                              </span>
                            </div>

                            <button
                              onClick={() => handleDeleteMedia(media.id)}
                              className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-red-500/80 rounded-xl border border-white/10 text-white/70 hover:text-white transition opacity-0 group-hover:opacity-100"
                              title="Delete media"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-white/40 py-4">No hidden media uploaded yet.</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "insights" && (() => {
              const renderPromptPrivacyToggle = (field: 'bio_prompt_answer' | 'bio_prompt_answer_2', currentVal: string) => {
                const isHidden = !!(privacySettings?.hidden_values?.[field] && Object.keys(privacySettings.hidden_values[field]).length > 0);
                const currentPromptAnswerHiddenValue = isHidden ? Object.keys(privacySettings.hidden_values[field])[0] : null;

                return (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (isHidden) {
                        handleRemovePrivacy(field, currentPromptAnswerHiddenValue || "");
                      } else {
                        setActivePrivacyField({ field, value: currentVal || "default" });
                      }
                    }}
                    className={`ml-2 p-1.5 rounded-full transition-colors ${isHidden ? "bg-primary/20 text-primary" : "bg-white/5 text-white/40 hover:bg-white/10 hover:text-white/80"}`}
                    title={isHidden ? "Hidden from public (Click to reveal)" : "Visible to public (Click to hide)"}
                  >
                    {isHidden ? <Lock className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                );
              };

              const getPromptLockLevelName = (field: 'bio_prompt_answer' | 'bio_prompt_answer_2') => {
                const isHidden = !!(privacySettings?.hidden_values?.[field] && Object.keys(privacySettings.hidden_values[field]).length > 0);
                if (!isHidden) return null;
                const requiredLevel = (Object.values(privacySettings.hidden_values[field])[0] as any)?.required_level;
                return RELATIONSHIP_LEVELS.find(l => l.key === requiredLevel)?.label || 'Higher Level';
              };

              return (
                <div className="space-y-8 text-left">
                  <div>
                    <h2 className="text-2xl font-bold uppercase tracking-tighter flex items-center gap-2 text-white">
                      <Brain className="text-primary w-6 h-6" /> Relational Insights & Bio
                    </h2>
                    <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest mt-1">
                      Manage your public biography, answer relational prompts, and review AI connection personality metrics.
                    </p>
                  </div>

                  {/* Optional Bio Text Input */}
                  <div className="glass-card p-6 bg-white/2 border border-white/5 rounded-3xl space-y-4">
                    <h3 className="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-2">
                      <FileText className="w-4 h-4" /> Custom Biography (Optional)
                    </h3>
                    <p className="text-[10px] text-white/40 uppercase font-bold tracking-wider">
                      Add a general introduction about yourself. This is public and can be updated at any time.
                    </p>
                    <textarea
                      value={tempBio}
                      onChange={(e) => setTempBio(e.target.value)}
                      placeholder="Describe yourself, your vibe, or what you're looking for..."
                      rows={4}
                      className="w-full bg-black/50 border border-white/10 rounded-2xl px-4 py-3 text-xs font-semibold focus:border-primary focus:outline-none transition-colors resize-none text-white leading-relaxed"
                    />
                    <div className="flex justify-end">
                      <button
                        onClick={handleSaveBio}
                        disabled={isSavingBio}
                        className="px-5 py-2.5 bg-primary text-black font-black uppercase tracking-widest text-[9px] rounded-xl hover:shadow-[0_0_15px_rgba(102,252,241,0.4)] transition disabled:opacity-50 flex items-center gap-1.5"
                      >
                        {isSavingBio ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving...
                          </>
                        ) : (
                          "Save Bio"
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Prompts Section: Render Prompt 1 and Prompt 2 Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Prompt 1 Card */}
                    <div className="glass-card p-6 bg-white/2 border border-white/5 rounded-3xl space-y-4 flex flex-col justify-between">
                      <div className="space-y-4">
                        <div className="flex justify-between items-start">
                          <h3 className="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-2">
                            <Heart className="w-4 h-4 text-accent" /> Relational Prompt 1
                          </h3>
                          {mappedCurrentUser.bioPromptAnswer && (
                            <div className="flex items-center gap-2">
                              <span className="text-[9px] font-black uppercase text-white/40 tracking-widest">
                                Gating Visibility:
                              </span>
                              {renderPromptPrivacyToggle('bio_prompt_answer', mappedCurrentUser.bioPromptAnswer)}
                            </div>
                          )}
                        </div>
                        <p className="text-[10px] text-white/40 uppercase font-bold tracking-wider">
                          Your response to this prompt is analyzed by AI to extract relationship styles.
                        </p>

                        {mappedCurrentUser.bioPromptAnswer ? (
                          <div className="p-4 bg-white/5 border border-white/10 rounded-2xl relative">
                            <span className="text-[8px] font-black uppercase text-accent tracking-widest block mb-1">
                              Category: {INSIGHT_PROMPTS[mappedCurrentUser.bioPromptCategory as keyof typeof INSIGHT_PROMPTS]?.categoryName || mappedCurrentUser.bioPromptCategory}
                            </span>
                            <p className="text-xs font-bold text-white mb-2 leading-relaxed">
                              Q: {mappedCurrentUser.bioPromptQuestion}
                            </p>
                            <p className="text-xs text-white/70 leading-relaxed border-l-2 border-primary pl-3">
                              "{mappedCurrentUser.bioPromptAnswer}"
                            </p>
                            {getPromptLockLevelName('bio_prompt_answer') && (
                              <div className="mt-3 flex items-center gap-1.5 px-3 py-1 bg-[#dc143c]/15 border border-[#dc143c]/25 rounded-xl w-fit">
                                <Lock className="w-3.5 h-3.5 text-[#dc143c]" />
                                <span className="text-[8px] font-black uppercase tracking-widest text-[#dc143c]">
                                  Gated (Reveals at {getPromptLockLevelName('bio_prompt_answer')})
                                </span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-center py-6 bg-white/5 border border-white/5 rounded-2xl flex flex-col items-center justify-center space-y-3">
                            <Brain className="w-8 h-8 text-white/20 animate-pulse" />
                            <p className="text-xs font-bold text-white">No prompt 1 answered yet</p>
                          </div>
                        )}
                      </div>

                      <div className="flex justify-end pt-4">
                        <button
                          onClick={() => {
                            setTempCategory((mappedCurrentUser.bioPromptCategory as any) || "chemistry");
                            setTempQuestion(mappedCurrentUser.bioPromptQuestion || INSIGHT_PROMPTS.chemistry.prompts[0]);
                            setTempAnswer(mappedCurrentUser.bioPromptAnswer || "");
                            setEditingPromptIndex(1);
                            setIsPromptModalOpen(true);
                          }}
                          className="px-5 py-2.5 bg-primary text-black font-black uppercase tracking-widest text-[9px] rounded-xl hover:shadow-[0_0_15px_rgba(102,252,241,0.4)] transition"
                        >
                          {mappedCurrentUser.bioPromptAnswer ? "Change Prompt 1" : "Answer Prompt 1"}
                        </button>
                      </div>
                    </div>

                    {/* Prompt 2 Card */}
                    <div className="glass-card p-6 bg-white/2 border border-white/5 rounded-3xl space-y-4 flex flex-col justify-between">
                      <div className="space-y-4">
                        <div className="flex justify-between items-start">
                          <h3 className="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-2">
                            <Heart className="w-4 h-4 text-accent" /> Relational Prompt 2
                          </h3>
                          {mappedCurrentUser.bioPromptAnswer2 && (
                            <div className="flex items-center gap-2">
                              <span className="text-[9px] font-black uppercase text-white/40 tracking-widest">
                                Gating Visibility:
                              </span>
                              {renderPromptPrivacyToggle('bio_prompt_answer_2', mappedCurrentUser.bioPromptAnswer2)}
                            </div>
                          )}
                        </div>
                        <p className="text-[10px] text-white/40 uppercase font-bold tracking-wider">
                          Your second answered prompt for deeper alignment analysis.
                        </p>

                        {mappedCurrentUser.bioPromptAnswer2 ? (
                          <div className="p-4 bg-white/5 border border-white/10 rounded-2xl relative">
                            <span className="text-[8px] font-black uppercase text-accent tracking-widest block mb-1">
                              Category: {INSIGHT_PROMPTS[mappedCurrentUser.bioPromptCategory2 as keyof typeof INSIGHT_PROMPTS]?.categoryName || mappedCurrentUser.bioPromptCategory2}
                            </span>
                            <p className="text-xs font-bold text-white mb-2 leading-relaxed">
                              Q: {mappedCurrentUser.bioPromptQuestion2}
                            </p>
                            <p className="text-xs text-white/70 leading-relaxed border-l-2 border-primary pl-3">
                              "{mappedCurrentUser.bioPromptAnswer2}"
                            </p>
                            {getPromptLockLevelName('bio_prompt_answer_2') && (
                              <div className="mt-3 flex items-center gap-1.5 px-3 py-1 bg-[#dc143c]/15 border border-[#dc143c]/25 rounded-xl w-fit">
                                <Lock className="w-3.5 h-3.5 text-[#dc143c]" />
                                <span className="text-[8px] font-black uppercase tracking-widest text-[#dc143c]">
                                  Gated (Reveals at {getPromptLockLevelName('bio_prompt_answer_2')})
                                </span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-center py-6 bg-white/5 border border-white/5 rounded-2xl flex flex-col items-center justify-center space-y-3">
                            <Brain className="w-8 h-8 text-white/20 animate-pulse" />
                            <p className="text-xs font-bold text-white">No prompt 2 answered yet</p>
                          </div>
                        )}
                      </div>

                      <div className="flex justify-end pt-4">
                        <button
                          onClick={() => {
                            setTempCategory((mappedCurrentUser.bioPromptCategory2 as any) || "conflict");
                            setTempQuestion(mappedCurrentUser.bioPromptQuestion2 || INSIGHT_PROMPTS.conflict.prompts[0]);
                            setTempAnswer(mappedCurrentUser.bioPromptAnswer2 || "");
                            setEditingPromptIndex(2);
                            setIsPromptModalOpen(true);
                          }}
                          className="px-5 py-2.5 bg-primary text-black font-black uppercase tracking-widest text-[9px] rounded-xl hover:shadow-[0_0_15px_rgba(102,252,241,0.4)] transition"
                        >
                          {mappedCurrentUser.bioPromptAnswer2 ? "Change Prompt 2" : "Answer Prompt 2"}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* AI Relational Insights (Prompt 1) */}
                  {mappedCurrentUser.bioAnalysis && (
                    <div className="space-y-6 pt-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-yellow-400 animate-pulse" /> AI Relational Insights (Prompt 1)
                        </h3>
                        {privacySettings?.hidden_values?.['bio_prompt_answer'] && Object.keys(privacySettings.hidden_values['bio_prompt_answer']).length > 0 && (
                          <div className="flex items-center gap-1.5 px-3 py-1 bg-[#dc143c]/10 border border-[#dc143c]/30 rounded-xl text-[#dc143c] text-[8px] font-black uppercase tracking-widest">
                            <Lock className="w-3 h-3 shrink-0" />
                            Gated
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Bento Card 1: Emotional Vectors */}
                        <div className="md:col-span-2 bg-white/[0.02] border border-white/5 p-1 rounded-[2rem] shadow-lg relative overflow-hidden transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:scale-[1.01] hover:border-primary/20">
                          <div className="bg-black/60 border border-white/5 rounded-[calc(2rem-0.25rem)] p-5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.03)] h-full space-y-4">
                            <h4 className="text-[10px] font-black uppercase tracking-wider text-white/50 border-b border-white/5 pb-2">
                              Emotional Vectors
                            </h4>
                            <div className="space-y-3.5">
                              <div className="space-y-1.5">
                                <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-white/70">
                                  <span>Introspection Depth</span>
                                  <span className="text-cyan-400">{mappedCurrentUser.bioAnalysis.Interaction_Style?.Introspective || "Moderate"}</span>
                                </div>
                                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5 p-[1px]">
                                  <div
                                    className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.5)] transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]"
                                    style={{
                                      width: mappedCurrentUser.bioAnalysis.Interaction_Style?.Introspective === "Very High" ? "95%" :
                                             mappedCurrentUser.bioAnalysis.Interaction_Style?.Introspective === "High" ? "80%" :
                                             mappedCurrentUser.bioAnalysis.Interaction_Style?.Introspective === "Moderate" ? "55%" : "25%"
                                    }}
                                  />
                                </div>
                              </div>
                              <div className="space-y-1.5">
                                <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-white/70">
                                  <span>Vulnerability Openness</span>
                                  <span className="text-primary">{Math.round((mappedCurrentUser.bioAnalysis.Emotional_Vector?.Vulnerability_Score || 0) * 100)}%</span>
                                </div>
                                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5 p-[1px]">
                                  <div
                                    className="h-full rounded-full bg-gradient-to-r from-blue-500 to-primary shadow-[0_0_10px_rgba(255,0,127,0.5)] transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]"
                                    style={{ width: `${(mappedCurrentUser.bioAnalysis.Emotional_Vector?.Vulnerability_Score || 0) * 100}%` }}
                                  />
                                </div>
                              </div>
                              <div className="space-y-1.5">
                                <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-white/70">
                                  <span>Defensive Guard</span>
                                  <span className="text-[#dc143c]">{Math.round((mappedCurrentUser.bioAnalysis.Emotional_Vector?.Defensive_Score || 0) * 100)}%</span>
                                </div>
                                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5 p-[1px]">
                                  <div
                                    className="h-full rounded-full bg-gradient-to-r from-red-600 to-[#dc143c] shadow-[0_0_10px_rgba(220,20,60,0.5)] transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]"
                                    style={{ width: `${(mappedCurrentUser.bioAnalysis.Emotional_Vector?.Defensive_Score || 0) * 100}%` }}
                                  />
                                </div>
                              </div>
                              <div className="space-y-1.5">
                                <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-white/70">
                                  <span>Idealization Bias</span>
                                  <span className="text-amber-500">{Math.round((mappedCurrentUser.bioAnalysis.Emotional_Vector?.Idealization_Bias || 0) * 100)}%</span>
                                </div>
                                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5 p-[1px]">
                                  <div
                                    className="h-full rounded-full bg-gradient-to-r from-amber-600 to-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.5)] transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]"
                                    style={{ width: `${(mappedCurrentUser.bioAnalysis.Emotional_Vector?.Idealization_Bias || 0) * 100}%` }}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Bento Card 2: Communication Style */}
                        <div className="md:col-span-1 bg-white/[0.02] border border-white/5 p-1 rounded-[2rem] shadow-lg relative overflow-hidden transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:scale-[1.01] hover:border-accent/20">
                          <div className="bg-black/60 border border-white/5 rounded-[calc(2rem-0.25rem)] p-5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.03)] h-full space-y-4 flex flex-col justify-between">
                            <h4 className="text-[10px] font-black uppercase tracking-wider text-white/50 border-b border-white/5 pb-2">
                              Communication Style
                            </h4>
                            <div className="flex flex-col gap-2.5 flex-grow justify-center py-2">
                              <div className="p-3.5 rounded-2xl border border-white/10 bg-white/2 flex flex-col gap-1 hover:bg-white/5 transition-all">
                                <span className="text-[8px] font-black uppercase text-white/40 tracking-wider">Directness Vector</span>
                                <span className="text-sm font-black text-white">{mappedCurrentUser.bioAnalysis.Interaction_Style?.Directness || "Moderate"}</span>
                              </div>
                              <div className="p-3.5 rounded-2xl border border-white/10 bg-white/2 flex flex-col gap-1 hover:bg-white/5 transition-all">
                                <span className="text-[8px] font-black uppercase text-white/40 tracking-wider">Wit & Expression</span>
                                <span className="text-sm font-black text-white">{mappedCurrentUser.bioAnalysis.Interaction_Style?.Witty || "Moderate"}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Bento Card 3: Primary Drivers */}
                        <div className="md:col-span-1 bg-white/[0.02] border border-white/5 p-1 rounded-[2rem] shadow-lg relative overflow-hidden transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:scale-[1.01] hover:border-primary/20">
                          <div className="bg-black/60 border border-white/5 rounded-[calc(2rem-0.25rem)] p-5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.03)] h-full space-y-4 flex flex-col justify-between">
                            <h4 className="text-[10px] font-black uppercase tracking-wider text-white/50 border-b border-white/5 pb-2">
                              Primary Drivers
                            </h4>
                            <div className="flex flex-wrap gap-2 flex-grow items-center justify-center py-4">
                              {mappedCurrentUser.bioAnalysis.Behavioral_Pattern?.Investment_Driver?.map((driver: string) => (
                                <span key={driver} className="px-3.5 py-1.5 bg-primary/10 border border-primary/20 rounded-full text-[9px] font-black uppercase tracking-widest text-primary shadow-sm hover:scale-105 transition-transform">
                                  {driver}
                                </span>
                              )) || <span className="text-xs text-white/40 font-medium">None identified</span>}
                            </div>
                          </div>
                        </div>

                        {/* Bento Card 4: Relational Vulnerabilities */}
                        <div className="md:col-span-2 bg-white/[0.02] border border-white/5 p-1 rounded-[2rem] shadow-lg relative overflow-hidden transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:scale-[1.01] hover:border-[#dc143c]/20">
                          <div className="bg-black/60 border border-white/5 rounded-[calc(2rem-0.25rem)] p-5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.03)] h-full space-y-4">
                            <h4 className="text-[10px] font-black uppercase tracking-wider text-[#dc143c] border-b border-[#dc143c]/20 pb-2">
                              Relational Vulnerabilities
                            </h4>
                            <div className="flex flex-wrap gap-2 py-2">
                              {mappedCurrentUser.bioAnalysis.Behavioral_Pattern?.Red_Flags && mappedCurrentUser.bioAnalysis.Behavioral_Pattern.Red_Flags.length > 0 ? (
                                mappedCurrentUser.bioAnalysis.Behavioral_Pattern.Red_Flags.map((flag: string) => (
                                  <span key={flag} className="px-3.5 py-2 bg-[#dc143c]/10 border border-[#dc143c]/20 rounded-full text-[9px] font-black uppercase tracking-widest text-[#dc143c] shadow-sm flex items-center gap-1.5 hover:scale-105 transition-transform">
                                    <span>⚠️</span> {flag}
                                  </span>
                                ))
                              ) : (
                                <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl w-full">
                                  <span className="text-emerald-400">🛡️</span>
                                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">No high-risk behaviors identified by AI analysis.</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* AI Relational Insights (Prompt 2) */}
                  {mappedCurrentUser.bioAnalysis2 && (
                    <div className="space-y-6 pt-8 border-t border-white/5">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-yellow-400 animate-pulse" /> AI Relational Insights (Prompt 2)
                        </h3>
                        {privacySettings?.hidden_values?.['bio_prompt_answer_2'] && Object.keys(privacySettings.hidden_values['bio_prompt_answer_2']).length > 0 && (
                          <div className="flex items-center gap-1.5 px-3 py-1 bg-[#dc143c]/10 border border-[#dc143c]/30 rounded-xl text-[#dc143c] text-[8px] font-black uppercase tracking-widest">
                            <Lock className="w-3 h-3 shrink-0" />
                            Gated
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Bento Card 1: Emotional Vectors */}
                        <div className="md:col-span-2 bg-white/[0.02] border border-white/5 p-1 rounded-[2rem] shadow-lg relative overflow-hidden transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:scale-[1.01] hover:border-primary/20">
                          <div className="bg-black/60 border border-white/5 rounded-[calc(2rem-0.25rem)] p-5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.03)] h-full space-y-4">
                            <h4 className="text-[10px] font-black uppercase tracking-wider text-white/50 border-b border-white/5 pb-2">
                              Emotional Vectors
                            </h4>
                            <div className="space-y-3.5">
                              <div className="space-y-1.5">
                                <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-white/70">
                                  <span>Introspection Depth</span>
                                  <span className="text-cyan-400">{mappedCurrentUser.bioAnalysis2.Interaction_Style?.Introspective || "Moderate"}</span>
                                </div>
                                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5 p-[1px]">
                                  <div
                                    className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.5)] transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]"
                                    style={{
                                      width: mappedCurrentUser.bioAnalysis2.Interaction_Style?.Introspective === "Very High" ? "95%" :
                                             mappedCurrentUser.bioAnalysis2.Interaction_Style?.Introspective === "High" ? "80%" :
                                             mappedCurrentUser.bioAnalysis2.Interaction_Style?.Introspective === "Moderate" ? "55%" : "25%"
                                    }}
                                  />
                                </div>
                              </div>
                              <div className="space-y-1.5">
                                <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-white/70">
                                  <span>Vulnerability Openness</span>
                                  <span className="text-primary">{Math.round((mappedCurrentUser.bioAnalysis2.Emotional_Vector?.Vulnerability_Score || 0) * 100)}%</span>
                                </div>
                                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5 p-[1px]">
                                  <div
                                    className="h-full rounded-full bg-gradient-to-r from-blue-500 to-primary shadow-[0_0_10px_rgba(255,0,127,0.5)] transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]"
                                    style={{ width: `${(mappedCurrentUser.bioAnalysis2.Emotional_Vector?.Vulnerability_Score || 0) * 100}%` }}
                                  />
                                </div>
                              </div>
                              <div className="space-y-1.5">
                                <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-white/70">
                                  <span>Defensive Guard</span>
                                  <span className="text-[#dc143c]">{Math.round((mappedCurrentUser.bioAnalysis2.Emotional_Vector?.Defensive_Score || 0) * 100)}%</span>
                                </div>
                                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5 p-[1px]">
                                  <div
                                    className="h-full rounded-full bg-gradient-to-r from-red-600 to-[#dc143c] shadow-[0_0_10px_rgba(220,20,60,0.5)] transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]"
                                    style={{ width: `${(mappedCurrentUser.bioAnalysis2.Emotional_Vector?.Defensive_Score || 0) * 100}%` }}
                                  />
                                </div>
                              </div>
                              <div className="space-y-1.5">
                                <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-white/70">
                                  <span>Idealization Bias</span>
                                  <span className="text-amber-500">{Math.round((mappedCurrentUser.bioAnalysis2.Emotional_Vector?.Idealization_Bias || 0) * 100)}%</span>
                                </div>
                                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5 p-[1px]">
                                  <div
                                    className="h-full rounded-full bg-gradient-to-r from-amber-600 to-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.5)] transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]"
                                    style={{ width: `${(mappedCurrentUser.bioAnalysis2.Emotional_Vector?.Idealization_Bias || 0) * 100}%` }}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Bento Card 2: Communication Style */}
                        <div className="md:col-span-1 bg-white/[0.02] border border-white/5 p-1 rounded-[2rem] shadow-lg relative overflow-hidden transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:scale-[1.01] hover:border-accent/20">
                          <div className="bg-black/60 border border-white/5 rounded-[calc(2rem-0.25rem)] p-5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.03)] h-full space-y-4 flex flex-col justify-between">
                            <h4 className="text-[10px] font-black uppercase tracking-wider text-white/50 border-b border-white/5 pb-2">
                              Communication Style
                            </h4>
                            <div className="flex flex-col gap-2.5 flex-grow justify-center py-2">
                              <div className="p-3.5 rounded-2xl border border-white/10 bg-white/2 flex flex-col gap-1 hover:bg-white/5 transition-all">
                                <span className="text-[8px] font-black uppercase text-white/40 tracking-wider">Directness Vector</span>
                                <span className="text-sm font-black text-white">{mappedCurrentUser.bioAnalysis2.Interaction_Style?.Directness || "Moderate"}</span>
                              </div>
                              <div className="p-3.5 rounded-2xl border border-white/10 bg-white/2 flex flex-col gap-1 hover:bg-white/5 transition-all">
                                <span className="text-[8px] font-black uppercase text-white/40 tracking-wider">Wit & Expression</span>
                                <span className="text-sm font-black text-white">{mappedCurrentUser.bioAnalysis2.Interaction_Style?.Witty || "Moderate"}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Bento Card 3: Primary Drivers */}
                        <div className="md:col-span-1 bg-white/[0.02] border border-white/5 p-1 rounded-[2rem] shadow-lg relative overflow-hidden transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:scale-[1.01] hover:border-primary/20">
                          <div className="bg-black/60 border border-white/5 rounded-[calc(2rem-0.25rem)] p-5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.03)] h-full space-y-4 flex flex-col justify-between">
                            <h4 className="text-[10px] font-black uppercase tracking-wider text-white/50 border-b border-white/5 pb-2">
                              Primary Drivers
                            </h4>
                            <div className="flex flex-wrap gap-2 flex-grow items-center justify-center py-4">
                              {mappedCurrentUser.bioAnalysis2.Behavioral_Pattern?.Investment_Driver?.map((driver: string) => (
                                <span key={driver} className="px-3.5 py-1.5 bg-primary/10 border border-primary/20 rounded-full text-[9px] font-black uppercase tracking-widest text-primary shadow-sm hover:scale-105 transition-transform">
                                  {driver}
                                </span>
                              )) || <span className="text-xs text-white/40 font-medium">None identified</span>}
                            </div>
                          </div>
                        </div>

                        {/* Bento Card 4: Relational Vulnerabilities */}
                        <div className="md:col-span-2 bg-white/[0.02] border border-white/5 p-1 rounded-[2rem] shadow-lg relative overflow-hidden transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:scale-[1.01] hover:border-[#dc143c]/20">
                          <div className="bg-black/60 border border-white/5 rounded-[calc(2rem-0.25rem)] p-5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.03)] h-full space-y-4">
                            <h4 className="text-[10px] font-black uppercase tracking-wider text-[#dc143c] border-b border-[#dc143c]/20 pb-2">
                              Relational Vulnerabilities
                            </h4>
                            <div className="flex flex-wrap gap-2 py-2">
                              {mappedCurrentUser.bioAnalysis2.Behavioral_Pattern?.Red_Flags && mappedCurrentUser.bioAnalysis2.Behavioral_Pattern.Red_Flags.length > 0 ? (
                                mappedCurrentUser.bioAnalysis2.Behavioral_Pattern.Red_Flags.map((flag: string) => (
                                  <span key={flag} className="px-3.5 py-2 bg-[#dc143c]/10 border border-[#dc143c]/20 rounded-full text-[9px] font-black uppercase tracking-widest text-[#dc143c] shadow-sm flex items-center gap-1.5 hover:scale-105 transition-transform">
                                    <span>⚠️</span> {flag}
                                  </span>
                                ))
                              ) : (
                                <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl w-full">
                                  <span className="text-emerald-400">🛡️</span>
                                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">No high-risk behaviors identified by AI analysis.</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}

            {activeTab === "status" && (
              <>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                      <Heart className="text-accent" /> Connection Status
                      Cockpit
                    </h2>
                    <p className="text-[9px] font-black text-primary uppercase tracking-[0.2em] bg-primary/10 px-3 py-1 rounded border border-primary/20">
                      RLS v2.0 Active
                    </p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Match list sidebar */}
                    <div className="lg:col-span-1 glass-card p-5 bg-white/2 border border-white/5 flex flex-col gap-4">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50 border-b border-white/5 pb-2">
                        Active Matches ({liveMatches.length})
                      </p>

                      <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1 scrollbar-hide">
                        {liveMatches.map((match) => {
                          const isSelected =
                            selectedMatchId === match.target_profile.id;
                          const levelObj = scoreToLevel(match.gauge_score);

                          return (
                            <button
                              key={match.target_profile.id}
                              onClick={() =>
                                selectMatch(
                                  currentUser?.id || "mock-user-id",
                                  match.target_profile.id,
                                )
                              }
                              className={`w-full p-3 rounded-2xl border text-left flex items-center gap-3 transition ${
                                isSelected
                                  ? "border-primary/50 bg-primary/5"
                                  : "border-white/5 bg-white/2 hover:border-white/20"
                              }`}
                            >
                              <div className="w-10 h-10 rounded-xl overflow-hidden border border-white/10 shadow-md relative">
                                <BlurredFaceImage
                                  src={match.target_profile.avatar_url}
                                  alt={match.target_profile.username}
                                  sharedScore={match.gauge_score ?? 0}
                                  isEnabledByOwner={match.target_profile.face_blur_active || false}
                                  faceCoordinates={match.target_profile.avatar_face_coordinates}
                                  className="w-full h-full"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-1.5">
                                  <p className="text-xs font-black text-white truncate">
                                    @{match.target_profile.username}
                                  </p>
                                  <span className="text-[8px] font-bold text-yellow-500 bg-yellow-500/10 px-1.5 py-0.5 rounded border border-yellow-500/20 shrink-0">
                                    ⭐{" "}
                                    {calculateCreatorRating(
                                      match.target_profile,
                                    ).toFixed(2)}
                                  </span>
                                </div>
                                <span
                                  className="text-[8px] font-black uppercase tracking-wider block mt-1"
                                  style={{ color: levelObj.color }}
                                >
                                  {levelObj.label} ({match.gauge_score} pts)
                                </span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Connection details story view */}
                    <div className="lg:col-span-2 space-y-4">
                      {selectedMatchState ? (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between glass-card p-4 bg-white/2 border border-white/5 rounded-2xl">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-black uppercase text-white/60 tracking-wider">
                                Relationship Balance:
                              </span>
                              <SparkHint tension={selectedMatchState.tension} />
                            </div>
                            <div className="flex gap-2">
                              {canRateConnection && (
                                <button
                                  onClick={() => setIsRateModalOpen(true)}
                                  className="px-4 py-2.5 bg-[#ffff00]/10 hover:bg-[#ffff00]/25 text-[#ffff00] border border-[#ffff00]/30 rounded-xl text-[9px] font-black uppercase tracking-widest transition shadow-lg shadow-[#ffff00]/15"
                                >
                                  Rate Connection
                                </button>
                              )}
                              <button
                                onClick={() => setIsMoveModalOpen(true)}
                                className="px-4 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition shadow-lg shadow-primary/15"
                              >
                                Propose Action Move
                              </button>
                            </div>
                          </div>

                          <RelationshipStory
                            gaugeState={selectedMatchState}
                            onMoveClick={(move) =>
                              handleSelectMove(move.id, move.label)
                            }
                          />

                          {/* Rendering goals for selected creator match */}
                          {creatorGoals.length > 0 && (
                            <div className="space-y-4 mt-6">
                              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">
                                Active Crowdfunding Goals
                              </h3>
                              <div className="space-y-4">
                                {creatorGoals.map((goal) => (
                                  <CreatorGoalProgress
                                    key={goal.id}
                                    goal={goal}
                                    isOwner={false}
                                    onSponsor={(g) => {
                                      setSelectedGoalForContrib(g);
                                      setIsContribModalOpen(true);
                                    }}
                                  />
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="glass-card p-10 bg-white/2 border border-white/5 text-center flex flex-col items-center justify-center opacity-40 h-[280px]">
                          <Activity className="w-8 h-8 mb-2 animate-pulse" />
                          <p className="text-[9px] font-black uppercase tracking-widest">
                            Loading connection story...
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Suggestion Moves modal */}
                  {selectedMatchState && (
                    <SuggestionMovesModal
                      isOpen={isMoveModalOpen}
                      onClose={() => setIsMoveModalOpen(false)}
                      gaugeLevel={
                        RELATIONSHIP_LEVELS.findIndex(
                          (l) => l.key === selectedMatchState.level.key,
                        ) + 1
                      }
                      isKycVerified={
                        currentUserProfile?.is_kyc_verified || false
                      }
                      userId={currentUser?.id}
                      userRole="member"
                      onSelectMove={handleSelectMove}
                      onKycSuccess={() =>
                        setCurrentUserProfile((prev: any) =>
                          prev ? { ...prev, is_kyc_verified: true } : prev,
                        )
                      }
                    />
                  )}

                  {/* ContributeModal */}
                  {selectedGoalForContrib && (
                    <ContributeModal
                      isOpen={isContribModalOpen}
                      onClose={() => setIsContribModalOpen(false)}
                      goal={selectedGoalForContrib}
                      contributorId={currentUser?.id || "mock-user-id"}
                      onSuccess={() => {
                        if (selectedMatchId) {
                          loadCreatorGoals(selectedMatchId);
                        }
                      }}
                    />
                  )}
                </div>

                <div className="mt-12 pt-12 border-t border-white/5">
                  <h2 className="text-2xl font-black mb-6 flex items-center gap-2">
                    <Activity className="text-primary" /> LIFESTYLE & HABITS
                  </h2>
                  <p className="text-[10px] text-white/40 uppercase font-bold tracking-[0.2em] mb-8">
                    Match-Depth depends on your lifestyle frequency
                    synchronization.
                  </p>

                  <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                      {HABIT_CATEGORIES.map((category) => {
                        const Icon = LIFESTYLE_ICONS[category] || Activity;
                        const currentValue = (mappedCurrentUser.lifestyle as any)[category] || "";
                        return (
                          <div key={category} className="p-3 bg-white/[0.02] border border-white/5 rounded-2xl hover:border-white/10 transition flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2 min-w-0">
                              <div className="w-7 h-7 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center shrink-0">
                                <Icon className="w-3.5 h-3.5 text-primary" />
                              </div>
                              <span className="text-[10px] font-black uppercase tracking-widest text-white/60 truncate">{category}</span>
                            </div>
                            <select
                              value={currentValue}
                              onChange={(e) => handleUpdateHabit(category, e.target.value)}
                              className="bg-black/50 border border-white/10 rounded-xl px-2 py-1 text-[9px] font-black uppercase outline-none focus:border-primary text-white/80 shrink-0 max-w-[110px] cursor-pointer"
                            >
                              <option value="" disabled>Select...</option>
                              {(HABIT_CHOICES as any)[category].map((option: string) => (
                                <option key={option} value={option} className="bg-[#11111A] text-white">
                                  {option}
                                </option>
                              ))}
                            </select>
                          </div>
                        );
                      })}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8 pt-8 border-t border-white/5">
                      <div className="flex flex-col gap-3">
                        <p className="text-xs font-black uppercase tracking-widest text-primary">
                          Career / Profession
                        </p>
                        <input
                          type="text"
                          value={mappedCurrentUser.career}
                          onChange={(e) =>
                            handleUpdateHabit("career", e.target.value)
                          }
                          placeholder="e.g. Software Engineer, Artist, Founder"
                          className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-xs font-semibold focus:border-primary focus:outline-none transition-colors"
                        />
                      </div>

                      <div className="flex flex-col gap-3">
                        <p className="text-xs font-black uppercase tracking-widest text-primary">
                          Family Goals
                        </p>
                        <select
                          value={mappedCurrentUser.familyGoals || ""}
                          onChange={(e) => handleUpdateFamilyGoals(e.target.value)}
                          className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-xs font-semibold focus:border-primary focus:outline-none transition-colors cursor-pointer text-white/80"
                        >
                          <option value="" disabled>Select Family Goals...</option>
                          {FAMILY_GOALS.map((option) => (
                            <option key={option} value={option} className="bg-[#11111A] text-white">
                              {option}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {activeTab === "track" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold flex items-center gap-2">
                    <Activity className="text-primary" /> Pulse Track Record
                  </h2>
                  <div className="text-[10px] font-black uppercase tracking-[0.2em] bg-white/5 px-4 py-2 rounded-xl border border-white/10">
                    Confidence Score: 85%
                  </div>
                </div>

                <div className="space-y-3">
                  {[
                    {
                      action: "Bought a Drink",
                      target: "Valentina",
                      time: "2 days ago",
                      pts: 10,
                      type: "social",
                    },
                    {
                      action: "Premium Subscription",
                      target: "Elena",
                      time: "5 days ago",
                      pts: 100,
                      type: "vip",
                    },
                    {
                      action: "Sent a Gift",
                      target: "Elena",
                      time: "1 week ago",
                      pts: 50,
                      type: "gift",
                    },
                    {
                      action: "Master Vault Access",
                      target: "Marcus_X",
                      time: "2 weeks ago",
                      pts: 250,
                      type: "master",
                    },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className="p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-white/20 transition group"
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                          <div
                            className={`w-2 h-10 rounded-full ${item.type === "master" ? "bg-[#dc143c]" : item.type === "vip" ? "bg-primary" : "bg-accent"}`}
                          />
                          <div>
                            <p className="font-bold text-sm tracking-tight">
                              {item.action}
                            </p>
                             <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">
                              For {item.target} • {item.time}
                            </p>
                          </div>
                        </div>
                        <span className="text-primary font-black text-sm tracking-tighter">
                          +{item.pts} PTS
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
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
              <div className="space-y-8">
                {/* Header */}
                <div className="flex justify-between items-start flex-wrap gap-4">
                  <div>
                    <h2 className="text-2xl font-black uppercase tracking-tighter flex items-center gap-2 text-white">
                      <Crown className="text-primary w-6 h-6 fill-current" /> My
                      Sponsored Creators
                    </h2>
                    <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest mt-1">
                      Manage your 10-person investment roster, swap matched
                      creators, and forecast payout escrow tranches
                    </p>
                  </div>
                </div>

                {/* Pricing Summary Banner */}
                <div className="p-6 bg-gradient-to-br from-primary/10 to-accent/5 rounded-3xl border border-primary/20 relative overflow-hidden flex flex-col md:flex-row justify-between items-center gap-6">
                  <div className="absolute -top-12 -right-12 w-48 h-48 bg-primary/10 blur-[50px] rounded-full pointer-events-none" />

                  <div className="space-y-2 relative z-10 text-center md:text-left">
                    <span className="px-3 py-1 bg-primary/25 border border-primary/30 text-[9px] font-black uppercase tracking-widest text-primary rounded-full">
                      Master Subscription Active
                    </span>
                    <div className="flex items-baseline gap-2 justify-center md:justify-start">
                      <span className="text-4xl font-black tracking-tight text-white">
                        ${masterPrice.toFixed(2)}
                      </span>
                      <span className="text-[10px] uppercase font-bold text-white/40 tracking-wider">
                        / month
                      </span>
                    </div>
                    <div className="text-[9px] font-black uppercase tracking-wider text-white/40 flex items-center gap-1.5 justify-center md:justify-start">
                      <span>
                        Roster value:{" "}
                        <span className="line-through">
                          ${aggregateValue.toFixed(2)}
                        </span>
                      </span>
                      <span className="text-primary">
                        • 20% Bundle discount applied
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 relative z-10 w-full md:w-auto text-xs font-bold">
                    <div className="p-4 bg-black/40 border border-white/5 rounded-2xl text-center">
                      <p className="text-white/40 text-[9px] uppercase tracking-widest mb-1">
                        Platform operations (20%)
                      </p>
                      <p className="text-sm font-black text-white/80">
                        ${payoutsBreakdown.platformCut.toFixed(2)}
                      </p>
                    </div>
                    <div className="p-4 bg-black/40 border border-white/5 rounded-2xl text-center">
                      <p className="text-primary/70 text-[9px] uppercase tracking-widest mb-1">
                        Creator escrow pool (80%)
                      </p>
                      <p className="text-sm font-black text-primary">
                        ${payoutsBreakdown.totalCreatorEscrow.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Creators List Matrix */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[...Array(10)].map((_, index) => {
                    const creator = roster[index];
                    if (creator) {
                      const distribution =
                        payoutsBreakdown.creatorDistributions.find(
                          (d) => d.creatorId === creator.id,
                        );
                      return (
                        <div
                          key={creator.id}
                          className="glass-card p-4 rounded-3xl border border-white/5 hover:border-primary/30 transition-all flex items-center justify-between gap-4 group"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-primary/20 group-hover:border-primary transition relative">
                              <BlurredFaceImage
                                src={creator.avatar}
                                alt={creator.name}
                                sharedScore={
                                  liveMatches.find((m) => m.target_profile.id === creator.id)?.gauge_score ?? 0
                                }
                                isEnabledByOwner={creator.face_blur_active || false}
                                faceCoordinates={creator.avatar_face_coordinates}
                                className="w-full h-full"
                              />
                            </div>
                            <div className="min-w-0">
                              <h4 className="font-bold text-sm text-white truncate">
                                {creator.name}
                              </h4>
                              <div className="flex items-center gap-2 mt-0.5">
                                <p className="text-[9px] uppercase tracking-widest text-white/30 truncate">
                                  {creator.niche}
                                </p>
                                <span className="text-[8px] font-bold text-yellow-500 bg-yellow-500/10 px-1.5 py-0.5 rounded border border-yellow-500/20">
                                  ⭐{" "}
                                  {calculateCreatorRating(creator).toFixed(2)}
                                </span>
                              </div>
                              <div className="flex items-center gap-1 mt-1 text-[9px] font-black uppercase text-success">
                                <TrendingUp className="w-3.5 h-3.5" />
                                {Math.round(creator.accelerator * 100)}%
                                Accelerator
                              </div>
                            </div>
                          </div>

                          <div className="text-right flex-shrink-0 flex flex-col justify-between items-end h-full py-1">
                            <div className="text-[10px] font-bold text-white/70">
                              <span className="text-[9px] text-white/40 mr-1 font-normal font-medium">
                                Base:
                              </span>
                              ${creator.basePrice.toFixed(2)}
                            </div>
                            <div className="text-[9px] font-black text-primary uppercase tracking-widest mt-1">
                              Payout: $
                              {distribution?.totalPayout.toFixed(2) || "0.00"}
                              <div className="text-[7px] text-white/30 font-medium normal-case tracking-normal">
                                (G: ${distribution?.guaranteedPayout.toFixed(2)}{" "}
                                + V: ${distribution?.variablePayout.toFixed(2)})
                              </div>
                            </div>
                            <div className="flex items-center gap-1 mt-3">
                              {creator.isCancelled ? (
                                <span className="text-[8px] font-black uppercase tracking-wider text-red-400 bg-red-500/10 px-2.5 py-1 rounded-md border border-red-500/20 mr-1.5">
                                  Auto-Renew Off
                                </span>
                              ) : (
                                <button
                                  onClick={() =>
                                    handleCancelRosterAutoRenew(creator.id)
                                  }
                                  disabled={cancellingRosterId === creator.id}
                                  className="px-2 py-1 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 text-[8px] font-black uppercase tracking-widest rounded-md transition duration-200 mr-1.5 flex items-center gap-1 disabled:opacity-50"
                                  title="Cancel Auto-Renew"
                                >
                                  {cancellingRosterId === creator.id ? (
                                    <Loader2 className="w-2.5 h-2.5 animate-spin" />
                                  ) : (
                                    "Cancel"
                                  )}
                                </button>
                              )}
                              <button
                                onClick={() => {
                                  setSwapTargetIndex(index);
                                  setIsSwapOpen(true);
                                }}
                                className="p-1.5 bg-white/5 border border-white/10 rounded-lg hover:bg-primary/20 hover:border-primary/40 hover:text-primary transition"
                                title="Swap Creator"
                              >
                                <RefreshCw className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleRemoveCreator(index)}
                                className="p-1.5 bg-white/5 border border-white/10 rounded-lg hover:bg-red-500/20 hover:border-red-500/40 hover:text-red-400 transition"
                                title="Remove Creator"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    } else {
                      // Empty Slot Card
                      return (
                        <div
                          key={`empty-${index}`}
                          onClick={() => {
                            setSwapTargetIndex(index);
                            setIsSwapOpen(true);
                          }}
                          className="p-4 rounded-3xl border-2 border-dashed border-white/10 hover:border-primary/40 hover:bg-primary/5 transition-all flex items-center justify-center h-[90px] cursor-pointer group"
                        >
                          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/30 group-hover:text-primary transition-colors">
                            <Plus className="w-4 h-4 text-white/20 group-hover:text-primary" />{" "}
                            Sponsor Creator
                          </div>
                        </div>
                      );
                    }
                  })}
                </div>

                {/* Master Mix content aggregator feed */}
                <div className="pt-8 border-t border-white/5">
                  <MasterMixFeed creators={roster} />
                </div>
              </div>
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
                            isEnabledByOwner={['elena', 'sofia', 'valentina'].includes(cand.id)}
                            faceCoordinates={{ x: 0.5, y: 0.35, r: 0.18 }}
                            className="w-full h-full"
                          />
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-white">
                            {cand.name}
                          </h4>
                          <p className="text-[9px] uppercase tracking-widest text-primary font-black mt-0.5">
                            {matchScore}% Match
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
                            {cand.id === "elena"
                              ? "15.00"
                              : cand.id === "sofia"
                                ? "12.00"
                                : "10.00"}
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
                    <span>Estimated Rating Score:</span>
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
                    {isSavingRating ? "Submitting Score..." : "Submit Rating"}
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
                    ℹ️ Tips: Write at least 2 sentences. Mentioning specific stories, emotions, or boundaries triggers richer AI profile vectors.
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
          maxSelections={multiSelectConfig.fieldKey === "sexual_preferences" ? 1 : 5}
          onSave={handleSaveMultiSelect}
        />
      )}
    </div>
  );
}
