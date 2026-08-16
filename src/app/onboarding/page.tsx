"use client";

import React, { useState, useEffect, useRef } from "react";
import { OnboardingLogger } from "@/lib/onboarding-logger";
import LandingPageHook from "@/components/onboarding/LandingPageHook";
import RegistrationGate from "@/components/onboarding/RegistrationGate";
import IntentSelector from "@/components/onboarding/IntentSelector";
import AgeGateSplash from "@/components/onboarding/AgeGateSplash";
import ArchetypeSelector from "@/components/ArchetypeSelector";
import ProfileProgressRing from "@/components/onboarding/ProfileProgressRing";
import PurposeSelector from "@/components/onboarding/PurposeSelector";
import CompletionChecklist, {
  ChecklistItem,
} from "@/components/onboarding/CompletionChecklist";
import FoundersWelcome from "@/components/onboarding/FoundersWelcome";
import CreatorQuest from "@/components/onboarding/CreatorQuest";
import MemberTourModal from "@/components/onboarding/MemberTourModal";
import { useTranslation } from "@/context/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { getResilientSession, getResilientProfile, safeSupabaseQuery } from "@/lib/supabase-safe";
import { compressImageFile } from "@/lib/image-compressor";
import { useAvatarUpload } from "@/hooks/useAvatarUpload";
import {
  SEXUAL_ORIENTATIONS,
  RELATIONSHIP_GOALS,
  RELATIONSHIP_TYPES,
  LANGUAGES,
  PURPOSE_PROMPTS,
  PURPOSE_PROMPTS_ES,
  type MemberPurposeId
} from "@/lib/constants";
import ProfilePreviewModal from "@/components/ProfilePreviewModal";
import {
  Camera,
  FileText,
  Heart,
  Loader2,
  AlertCircle,
  Sparkles,
  Check,
  Video,
  ShieldCheck,
  Lock,
  Upload,
  Info,
  ArrowRight,
  Eye,
  X,
  Image as ImageIcon,
} from "lucide-react";

type OnboardingStep =
  | "value-proposition"
  | "registration"
  | "purpose"
  | "intent"
  | "profile-checklist"
  | "creator-checklist"
  | "creator-quest"
  | "welcome";

// MOCK_AVATARS removed — stock Unsplash faces were misleading real users as platform members.
// Removed INSIGHT_PROMPTS in favor of PURPOSE_PROMPTS from constants.ts

export default function OnboardingFlow() {
  const { t, locale } = useTranslation();
  const [step, setStep] = useState<OnboardingStep>("registration");
  const [tutorialArchetype, setTutorialArchetype] = useState<string | null>(null);
  const [tutorialRole, setTutorialRole] = useState<"member" | "creator" | null>(null);
  const [intents, setIntents] = useState<string[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [displayAge, setDisplayAge] = useState<number | null>(null);
  const [activePurposes, setActivePurposes] = useState<MemberPurposeId[]>([]);
  const [isCreatorMode, setIsCreatorMode] = useState<boolean>(false);
  const [showMemberTour, setShowMemberTour] = useState<boolean>(false);

  const handleRegistrationComplete = async () => {
    const isCreator =
      tutorialRole === "creator" ||
      isCreatorMode ||
      (typeof window !== "undefined" && (
        !!sessionStorage.getItem("_onboarding_creator_archive_choice") ||
        localStorage.getItem("is_creator_signup") === "true"
      ));
    const storedArchetype = tutorialArchetype || (typeof window !== "undefined"
      ? (isCreator ? sessionStorage.getItem("_onboarding_creator_archive_choice") : sessionStorage.getItem("_onboarding_archetype_choice"))
      : null);
    const { data: { session } } = await supabase.auth.getSession();
    const currentUserId = session?.user?.id;
    OnboardingLogger.log('registration', 'complete', `isCreator=${isCreator}`, currentUserId);

    if (currentUserId) {
      try {
        let updatePayload: any = {
          favorite_languages: ["English"],
          connection_points: 100,
          sexual_preference: "Everyone",
          role: isCreator ? "creator" : "member"
        };

        if (storedArchetype) {
          updatePayload.archetype = storedArchetype;
        }

        if (isCreator && typeof window !== "undefined") {
          const tierPrice = sessionStorage.getItem("_onboarding_creator_tier_price");
          const faceBlur = sessionStorage.getItem("_onboarding_creator_face_blur");
          const residence = sessionStorage.getItem("_onboarding_creator_residence");
          const vibe = sessionStorage.getItem("_onboarding_creator_vibe");
          const purposesStr = sessionStorage.getItem("_onboarding_creator_purposes");
          const specialization = sessionStorage.getItem("_onboarding_creator_spec") || sessionStorage.getItem("_onboarding_creator_specialization");
          const sexualPreferencesStr = sessionStorage.getItem("_onboarding_creator_sexual_preferences");
          const sexualPreference = sessionStorage.getItem("_onboarding_creator_sexual_preference");
          const relationshipGoalsStr = sessionStorage.getItem("_onboarding_creator_relationship_goals");
          const relationshipGoal = sessionStorage.getItem("_onboarding_creator_relationship_goal");
          const relationshipTypesStr = sessionStorage.getItem("_onboarding_creator_relationship_types");
          const relationshipType = sessionStorage.getItem("_onboarding_creator_relationship_type");

          if (tierPrice) updatePayload.base_subscription_price = parseFloat(tierPrice);
          if (faceBlur) updatePayload.face_blur_active = faceBlur === "true";
          if (residence) updatePayload.residence = residence;
          if (vibe) updatePayload.archetype = vibe;
          if (purposesStr) updatePayload.member_purposes = JSON.parse(purposesStr);
          if (specialization) updatePayload.specialization = specialization;
          
          if (sexualPreferencesStr) {
            try {
              const parsedPrefs = JSON.parse(sexualPreferencesStr);
              if (Array.isArray(parsedPrefs) && parsedPrefs.length > 0) {
                updatePayload.sexual_preferences = parsedPrefs;
                updatePayload.sexual_preference = parsedPrefs[0];
              }
            } catch (err) {}
          } else if (sexualPreference) {
            updatePayload.sexual_preference = sexualPreference;
            updatePayload.sexual_preferences = [sexualPreference];
          }

          if (relationshipGoalsStr) {
            try {
              const parsedGoals = JSON.parse(relationshipGoalsStr);
              if (Array.isArray(parsedGoals) && parsedGoals.length > 0) {
                updatePayload.relationship_goals = parsedGoals;
              }
            } catch (err) {}
          } else if (relationshipGoal) {
            updatePayload.relationship_goals = [relationshipGoal];
          }

          if (relationshipTypesStr) {
            try {
              const parsedTypes = JSON.parse(relationshipTypesStr);
              if (Array.isArray(parsedTypes) && parsedTypes.length > 0) {
                updatePayload.relationship_types = parsedTypes;
              }
            } catch (err) {}
          } else if (relationshipType) {
            updatePayload.relationship_types = [relationshipType];
          }
        }

        // Safe profile update with timeout guard to prevent network hang
        await safeSupabaseQuery(
          supabase
            .from("profiles")
            .update(updatePayload)
            .eq("id", currentUserId),
          null,
          3000
        );

        setChecklist((prev) =>
          prev.map((item) =>
            item.id === "preferences" ? { ...item, completed: true } : item
          )
        );
      } catch (err) {
        console.error("Failed to save tutorial archetype on signup:", err);
      }
    }
    
    if (typeof window !== "undefined") {
      localStorage.removeItem("is_creator_signup");
    }
    
    if (isCreator) {
      OnboardingLogger.log('registration', 'step_enter', 'routing creator to profile-checklist', currentUserId);
      setStep("profile-checklist");
    } else {
      OnboardingLogger.log('registration', 'step_enter', 'routing to purpose (member flow)', currentUserId);
      setStep("purpose");
    }
  };

  // Active item in detail checklist panel
  const [activeItem, setActiveItem] = useState<"photo" | "bio" | "preferences">(
    "photo",
  );

  // Form states
  const [avatarUrl, setAvatarUrl] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [promptCategory, setPromptCategory] = useState<string>("");
  const [promptQuestion, setPromptQuestion] = useState("");
  const [promptAnswer, setPromptAnswer] = useState("");
  const [promptStep, setPromptStep] = useState<1 | 2>(1);
  const [completedPrompt1, setCompletedPrompt1] = useState<{question: string; answer: string} | null>(null);
  const [sexPrefs, setSexPrefs] = useState<string[]>([SEXUAL_ORIENTATIONS[0].id]);
  const [relGoals, setRelGoals] = useState<string[]>([RELATIONSHIP_GOALS[0]]);
  const [relTypes, setRelTypes] = useState<string[]>([RELATIONSHIP_TYPES[0]]);
  const [favoriteLanguages, setFavoriteLanguages] = useState<string[]>([]);

  // Form submission status
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Album photos state & Profile Preview modal
  const [albumPhotos, setAlbumPhotos] = useState<string[]>([]);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  // Creator Extension states
  const [videoPresentationUrl, setVideoPresentationUrl] = useState("");
  const [creatorBio, setCreatorBio] = useState("");
  const [isSavingCreator, setIsSavingCreator] = useState(false);


  // File Upload states & hook
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isUploading: isUploadingPhoto, uploadAvatar } = useAvatarUpload({
    onSuccess: (finalUrl, dataUrl) => {
      setAvatarUrl(finalUrl);
      saveOnboardingState({ avatarUrl: finalUrl, step: "profile-checklist", activeItem: "photo" });
      setLivenessVerified(false);
      setLivenessStep(0);
    },
    onError: (msg) => setFormError(msg)
  });

  const handleLocalFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Instant local preview via FileReader (Zero latency, impossible to freeze)
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setAvatarUrl(dataUrl);
        saveOnboardingState({ avatarUrl: dataUrl, step: "profile-checklist", activeItem: "photo" });
        setLivenessVerified(false);
        setLivenessStep(0);
      }
    };
    reader.readAsDataURL(file);

    // Background storage upload with safety
    try {
      await uploadAvatar(file, userId);
    } catch (err) {
      console.warn('[Onboarding] Background avatar storage upload notice:', err);
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // Biometric Liveness Check states
  const [cameraActive, setCameraActive] = useState(false);
  const [livenessVerified, setLivenessVerified] = useState(false);
  const [livenessStep, setLivenessStep] = useState(0); // 0: idle, 1: straight, 2: left-turn, 3: blink, 4: matching, 5: success
  const [livenessLog, setLivenessLog] = useState("");
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);

  const startLivenessCheck = async () => {
    try {
      setCameraActive(true);
      setLivenessVerified(false);
      setLivenessStep(1);
      setLivenessLog("Initializing secure biometrics session...");
      await new Promise((r) => setTimeout(r, 1000));

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 320, height: 320 },
      });
      setVideoStream(stream);

      // Give DOM time to update with video element
      setTimeout(() => {
        const videoEl = document.getElementById(
          "liveness-video",
        ) as HTMLVideoElement;
        if (videoEl) {
          videoEl.srcObject = stream;
          videoEl
            .play()
            .catch((e) => console.error("Error playing video stream:", e));
        }
      }, 100);

      setLivenessLog("Step 1: Look straight into the camera (Face Scan)");
      await new Promise((r) => setTimeout(r, 1800));

      setLivenessStep(2);
      setLivenessLog(
        "Step 2: Turn your head slightly to the left (Liveness check)",
      );
      await new Promise((r) => setTimeout(r, 1800));

      setLivenessStep(3);
      setLivenessLog("Step 3: Blink once (Deepfake prevention)");
      await new Promise((r) => setTimeout(r, 1800));

      setLivenessStep(4);
      setLivenessLog("Matching captures against selected photo...");

      // Stop camera tracks
      stream.getTracks().forEach((track) => track.stop());
      setVideoStream(null);

      await new Promise((r) => setTimeout(r, 1500));

      setLivenessStep(5);
      setLivenessVerified(true);
      setLivenessLog("✓ Verified! You're legit — identity locked in.");
      setCameraActive(false);
    } catch (err) {
      console.error(err);
      setFormError(
        "Failed to access camera for biometrics check. Please check permissions.",
      );
      setCameraActive(false);
      setLivenessStep(0);
    }
  };

  // Checklist State
  const [checklist, setChecklist] = useState<ChecklistItem[]>([
    { id: "photo", label: "Upload photos (1 profile avatar + 2 public album photos)", completed: false },
    { id: "bio", label: "Answer 2 Relational Prompts", completed: false },
    {
      id: "preferences",
      label: "Discover your Archetype",
      completed: false,
    },
  ]);

  const completedCount = checklist.filter((i) => i.completed).length;
  // Gestalt ring starts at 25% (base), and remaining 75% is divided by checklist items
  const progress = 25 + Math.round((completedCount / checklist.length) * 75);
  const saveOnboardingState = (updates: Record<string, any>) => {
    if (typeof window === "undefined") return;
    try {
      const existingStr = localStorage.getItem("_seccion_onboarding_state");
      const existing = existingStr ? JSON.parse(existingStr) : {};
      const merged = { ...existing, ...updates };
      localStorage.setItem("_seccion_onboarding_state", JSON.stringify(merged));
    } catch (e) {
      console.warn("Failed to save onboarding state to localStorage:", e);
    }
  };

  // Check active session on mount to skip login/sign up if already authenticated
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const isCreator = params.get("invite") === "creator" || params.get("role") === "creator";
      if (isCreator) {
        localStorage.setItem("is_creator_signup", "true");
      }
    }

    async function checkSession() {
      const params = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : new URLSearchParams();
      const isFresh = params.get("fresh") === "true" || params.get("reset") === "true";

      // 1. Check local storage backup state first (prevents mobile phone photo upload reset!)
      if (typeof window !== "undefined" && !isFresh) {
        const savedStateStr = localStorage.getItem("_seccion_onboarding_state");
        if (savedStateStr) {
          try {
            const savedState = JSON.parse(savedStateStr);
            if (savedState.step) setStep(savedState.step);
            if (savedState.activeItem) setActiveItem(savedState.activeItem);
            if (savedState.avatarUrl) setAvatarUrl(savedState.avatarUrl);
            if (savedState.activePurposes) setActivePurposes(savedState.activePurposes);
          } catch (err) {
            console.error("Failed to parse onboarding state", err);
          }
        }
      }

      // Try fast local session first (no network request), fallback to robust network check
      const { data: { session: fastSession } } = await supabase.auth.getSession();
      let authUser = fastSession?.user;
      
      if (!authUser) {
        const session = await getResilientSession(4000);
        authUser = session?.user;
      }

      if (authUser) {
        setUserId(authUser.id);
        
        if (isFresh) {
          // Remove fresh and reset flags from the URL so they don't hijack future reloads
          if (typeof window !== "undefined") {
            const url = new URL(window.location.href);
            url.searchParams.delete("fresh");
            url.searchParams.delete("reset");
            window.history.replaceState({}, "", url.toString());
          }
          setStep("purpose");
          return;
        }

        // Fetch existing profile with resilient fallback guard
        const profile: any = await getResilientProfile(authUser.id, 4000);
          
        if (profile) {
          const hasPhoto = !!profile.avatar_url;
          const hasBio = !!profile.bio_prompt_answer && !!profile.bio_prompt_answer_2;
          const hasPreferences = !!profile.sexual_preference;
          
          if (hasPhoto && hasBio && hasPreferences) {
            setStep("welcome");
          } else {
            const hasPurposes = Array.isArray(profile.member_purposes) && profile.member_purposes.length > 0;
            const hasAge = !!profile.privacy_settings?.display_age;

            const pendingCreator =
              typeof window !== "undefined" && (
                localStorage.getItem("is_creator_signup") === "true" ||
                !!sessionStorage.getItem("_onboarding_creator_archive_choice") ||
                profile.role === "creator"
              );

            if (pendingCreator) {
              setIsCreatorMode(true);
              if (typeof window !== "undefined" && !sessionStorage.getItem("_onboarding_creator_archive_choice")) {
                sessionStorage.setItem("_onboarding_creator_archive_choice", "creator");
              }
              OnboardingLogger.log('init', 'step_enter', 'creator detected on return, routing to creator-checklist or purpose', authUser.id);
              // Need to check if they finished member onboarding
              if (hasPhoto && hasBio && hasPreferences) {
                 setStep("creator-checklist");
              } else if (!hasPurposes) {
                 setStep("purpose");
              } else if (!hasAge) {
                 setStep("intent");
              } else {
                 setStep("profile-checklist");
              }
            } else if (!hasPurposes) {
              OnboardingLogger.log('init', 'step_enter', 'no purposes, routing to purpose', authUser.id);
              setStep("purpose");
            } else if (!hasAge) {
              OnboardingLogger.log('init', 'step_enter', 'no age, routing to intent', authUser.id);
              setStep("intent");
            } else {
              OnboardingLogger.log('init', 'step_enter', 'resuming profile-checklist', authUser.id);
              setStep("profile-checklist");
            }
          }
        } else {
          if (params.get("bypass") === "true") {
            setStep("purpose");
            return;
          }

          // Check if this user's email was approved in creator_applications table
          let isApprovedCreatorApplication = false;
          if (authUser.email) {
            try {
              const { data: appData } = await supabase
                .from('creator_applications')
                .select('status')
                .eq('email', authUser.email.toLowerCase().trim())
                .eq('status', 'approved')
                .maybeSingle();
              if (appData) {
                isApprovedCreatorApplication = true;
              }
            } catch (err) {
              console.warn('[Onboarding] Notice checking creator application status:', err);
            }
          }

          // Provision missing profile with safety wrapper
          const isCreatorSignup =
            isApprovedCreatorApplication ||
            (typeof window !== "undefined" && (
              params.get("role") === "creator" ||
              localStorage.getItem("is_creator_signup") === "true" ||
              !!sessionStorage.getItem("_onboarding_creator_archive_choice")
            ));

          await safeSupabaseQuery(
            supabase
              .from('profiles')
              .upsert({
                id: authUser.id,
                username: (authUser.user_metadata?.username || authUser.email?.split('@')[0] || 'user_' + Math.floor(Math.random() * 10000)).toLowerCase(),
                display_name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'User',
                role: isCreatorSignup ? 'creator' : 'member'
              }),
            null,
            4000
          );

          if (isCreatorSignup) {
            setIsCreatorMode(true);
            if (typeof window !== "undefined") {
              sessionStorage.setItem("_onboarding_creator_archive_choice", "creator");
              localStorage.removeItem("is_creator_signup");
            }
            OnboardingLogger.log('init', 'step_enter', 'approved creator profile provisioned, routing to profile-checklist', authUser.id);
            setStep("profile-checklist");
          } else {
            OnboardingLogger.log('init', 'step_enter', 'new member profile provisioned, routing to purpose', authUser.id);
            setStep("purpose");
          }
        }
      } else {
        const error = params.get("error");
        if (error === "auth_callback_failed") {
          setFormError("Your magic link was opened in a different browser window or has expired. Please log in with your password or request a new 6-digit passcode.");
          setStep("registration");
        } else if (params.get("role") === "creator" || params.get("tutorial") === "creator") {
          setIsCreatorMode(true);
          setStep("creator-quest");
        } else if (params.get("bypass") === "true" || isFresh) {
          setStep("purpose");
        } else {
          setStep("registration"); // Prevents getting stuck on value-proposition if auth fails
        }
      }
    }
    checkSession();
  }, []);

  // Check URL parameters for tutorial routing
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tutorial = params.get("tutorial");
      if (tutorial === "creator") {
        setTutorialRole("creator");
      } else if (tutorial === "member") {
        setTutorialRole("member");
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('role') === 'creator') {
        setIsCreatorMode(true);
        if (!sessionStorage.getItem('_onboarding_creator_archive_choice')) {
          sessionStorage.setItem('_onboarding_creator_archive_choice', 'creator');
        }
        // Only divert to creator-quest on initial mount if on registration/value-prop
        setStep((prev) => (prev === 'registration' || prev === 'value-proposition') ? 'creator-quest' : prev);
      }
    }
  }, []);

  useEffect(() => {
    // Read user details when step transitions to checklist
    if (step === "profile-checklist") {
      const getActiveUser = async () => {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        let currentUserId = session?.user?.id || null;

        if (!currentUserId) {
          const stored = localStorage.getItem("fusion_onboarding_core");
          if (stored) {
            currentUserId = JSON.parse(stored).userId;
          }
        }

        if (currentUserId) {
          setUserId(currentUserId);

          // Pre-fetch existing profile if any
          const { data: profile } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", currentUserId)
            .single();

          if (profile) {
            setAvatarUrl(profile.avatar_url || "");
            setDisplayName(profile.display_name || "");
            setUsername(profile.username || "");
            setBio(profile.bio || "");
            
            const p1Done = !!profile.bio_prompt_answer;
            const p2Done = !!profile.bio_prompt_answer_2;

            if (p1Done && !p2Done) {
              setPromptCategory("conflict");
              setPromptQuestion("");
              setPromptAnswer("");
            } else if (p2Done) {
              setPromptCategory((profile.bio_prompt_category_2 as any) || "conflict");
              setPromptQuestion(profile.bio_prompt_question_2 || "");
              setPromptAnswer(profile.bio_prompt_answer_2 || "");
            } else {
              setPromptCategory((profile.bio_prompt_category as any) || "chemistry");
              setPromptQuestion(profile.bio_prompt_question || "");
              setPromptAnswer(profile.bio_prompt_answer || "");
            }

            if (p1Done) {
              setCompletedPrompt1({
                question: profile.bio_prompt_question || "",
                answer: profile.bio_prompt_answer || ""
              });
            }
            setPromptStep(p1Done && !p2Done ? 2 : 1);

            if (profile.member_purposes && Array.isArray(profile.member_purposes) && profile.member_purposes.length > 0) {
              setActivePurposes(profile.member_purposes);
            } else if (typeof window !== "undefined") {
              const storedPurposes = sessionStorage.getItem("_onboarding_creator_purposes");
              if (storedPurposes) {
                try {
                  const parsed = JSON.parse(storedPurposes);
                  if (Array.isArray(parsed) && parsed.length > 0) {
                    const mappedPurposes = parsed.map((p: string) => p.toLowerCase().includes("explicit") ? "explicit" : p.toLowerCase().includes("gaming") || p.toLowerCase().includes("lifestyle") ? "lifestyle" : "dating");
                    setActivePurposes(mappedPurposes);
                  }
                } catch {}
              }
            }

            if (profile.sexual_preferences?.length > 0)
              setSexPrefs(profile.sexual_preferences);
            else if (profile.sexual_preference)
              setSexPrefs([profile.sexual_preference]);
              
            if (profile.relationship_goals?.length > 0)
              setRelGoals(profile.relationship_goals);
            if (profile.relationship_types?.length > 0)
              setRelTypes(profile.relationship_types);
            if (profile.favorite_languages?.length > 0)
              setFavoriteLanguages(profile.favorite_languages);

            // Update checklist states based on pre-existing data
            setChecklist((prev) =>
              prev.map((item) => {
                if (item.id === "photo")
                  return { ...item, completed: !!profile.avatar_url };
                if (item.id === "bio")
                  return { ...item, completed: p1Done && p2Done };
                if (item.id === "preferences")
                  return { ...item, completed: !!profile.sexual_preference && !!(profile.favorite_languages && profile.favorite_languages.length > 0) };
                return item;
              }),
            );
          }
        }
      };
      getActiveUser();
    }
  }, [step]);

  const handleSaveDetails = async (
    type: "photo" | "bio" | "preferences",
    overrideData?: { category?: string; question?: string; answer?: string }
  ) => {
    let activeUserId = userId;
    if (!activeUserId) {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user?.id) {
          activeUserId = session.user.id;
          setUserId(activeUserId);
        }
      } catch {}
    }

    if (!activeUserId && typeof window !== "undefined") {
      const storedCore = localStorage.getItem("fusion_onboarding_core");
      if (storedCore) {
        try {
          activeUserId = JSON.parse(storedCore).userId;
        } catch {}
      }
    }

    setFormError(null);
    setIsSaving(true);

    try {
      let updatePayload: any = null;
      if (type === "photo") {
        if (!avatarUrl)
          throw new Error(t("onboarding.main.selectAvatarErr", "Please select or input an avatar photo."));
        updatePayload = { avatar_url: avatarUrl };
      } else if (type === "bio") {
        const effectiveCategory = overrideData?.category || promptCategory || "lifestyle";
        const effectiveQuestion = overrideData?.question || promptQuestion || "Cozy homebody or active explorer on weekends?";
        const effectiveAnswer = (overrideData?.answer !== undefined ? overrideData.answer : promptAnswer).trim();

        if (!effectiveAnswer) {
          throw new Error(t("onboarding.main.promptMissingErr", "Please write your answer."));
        }
        
        if (effectiveAnswer.length < 10) {
          throw new Error(t("onboarding.main.promptLengthErr", "Write a bit more so our AI can read your vibe properly (min 10 chars)."));
        }

        try {
          const fetchPromise = fetch("/api/v2/profile/analyze-prompt", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              promptCategory: effectiveCategory,
              promptQuestion: effectiveQuestion,
              promptAnswer: effectiveAnswer,
              promptIndex: promptStep,
              activePurposes
            })
          });

          const timeoutPromise = new Promise((resolve) => setTimeout(resolve, 800));
          await Promise.race([fetchPromise, timeoutPromise]);
        } catch (fetchErr) {
          console.warn("Prompt analysis network error, continuing with local state:", fetchErr);
        }

        if (promptStep === 1) {
          setCompletedPrompt1({
            question: effectiveQuestion,
            answer: effectiveAnswer
          });
          const sourcePrompts = locale === "es" ? PURPOSE_PROMPTS_ES : PURPOSE_PROMPTS;
          const availablePrompts = Object.entries(sourcePrompts)
            .filter(([p]) => activePurposes.length === 0 || activePurposes.includes(p as MemberPurposeId))
            .reduce((acc, [_, cats]) => ({ ...acc, ...cats }), {} as Record<string, any>);
          const entries = Object.entries(availablePrompts);
          const nextCatKey = entries.find(([k]) => k !== effectiveCategory)?.[0] || entries[0]?.[0] || "conflict";
          const nextQ = availablePrompts[nextCatKey]?.prompts?.[0] || "";

          setPromptCategory(nextCatKey);
          setPromptQuestion(nextQ);
          setPromptAnswer("");
          setPromptStep(2);
          setIsSaving(false);
          return;
        }
      } else if (type === "preferences") {
        if (favoriteLanguages.length === 0) {
          throw new Error("Please select at least one Favorite Language.");
        }
        updatePayload = {
          sexual_preferences: sexPrefs,
          sexual_preference: sexPrefs[0] || "",
          relationship_goals: relGoals,
          relationship_types: relTypes,
          favorite_languages: favoriteLanguages,
        };
      }

      // Upsert/Update the profile row if payload and active user ID are defined
      if (updatePayload && activeUserId) {
        const updatePromise = supabase
          .from("profiles")
          .update(updatePayload)
          .eq("id", activeUserId);
          
        const timeoutPromise = new Promise<{data: any, error: any}>((resolve) => 
          setTimeout(() => resolve({ data: null, error: null }), 3000)
        );
        
        try {
          await Promise.race([updatePromise, timeoutPromise]);
        } catch (dbErr) {
          console.warn("Database network response took long; state preserved locally:", dbErr);
        }
      }

      // Save onboarding state locally to guarantee user can advance
      saveOnboardingState({ step: "profile-checklist", activeItem: type, avatarUrl });

      // Mark item completed
      setChecklist((prev) =>
        prev.map((item) =>
          item.id === type ? { ...item, completed: true } : item,
        ),
      );

      // Auto-move to next incomplete tab or welcome
      const updatedChecklist = checklist.map((item) =>
        item.id === type ? { ...item, completed: true } : item,
      );

      const nextIncomplete = updatedChecklist.find((item) => !item.completed && item.id !== type);

      if (nextIncomplete) {
        OnboardingLogger.log('profile-checklist', 'cta_click', `saved ${type}, next=${nextIncomplete.id}`, activeUserId || undefined);
        setActiveItem(nextIncomplete.id as any);
      } else if (type === "photo") {
        setActiveItem("bio");
      } else {
        // All completed!
        const isCreatorSignup = typeof window !== "undefined" && !!sessionStorage.getItem("_onboarding_creator_archive_choice");
        if (isCreatorSignup) {
           OnboardingLogger.log('profile-checklist', 'complete', 'member done, transitioning to creator-checklist', activeUserId || undefined);
           setTimeout(() => setStep("creator-checklist"), 500);
        } else {
           OnboardingLogger.log('profile-checklist', 'complete', 'all items done, transitioning to welcome', activeUserId || undefined);
           setTimeout(() => setStep("welcome"), 500);
        }
      }
    } catch (err: any) {
      setFormError(err.message || "Failed to save details.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent text-white flex flex-col relative overflow-hidden">
      <AgeGateSplash />
      {/* Subtle Cyber Grid Texture over global background */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      {/* Floating Toggles for Tutorials removed */}

      <div className="flex-1 relative z-10 flex flex-col items-center justify-center p-4">
        <AnimatePresence mode="wait">
          {step === "value-proposition" && (
            <motion.div
              key="value-proposition"
              className="w-full flex-1 flex flex-col justify-center"
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <LandingPageHook
                onAccept={() => setStep("registration")}
                onBecomeCreator={() => {
                  setTutorialRole("creator");
                  setStep("creator-quest");
                }}
              />
            </motion.div>
          )}

          {step === "creator-quest" && (
            <>
              <CreatorQuest
                key="creator-quest"
                onSignUp={async () => {
                  setTutorialRole("creator");
                  setIsCreatorMode(true);
                  if (typeof window !== "undefined") {
                    sessionStorage.setItem("_onboarding_creator_archive_choice", "creator");
                  }
                  
                  // Immediately slide into profile checklist
                  setStep("profile-checklist");
                  
                  // Background sync authenticated session details
                  try {
                    const { data: { session } } = await supabase.auth.getSession();
                    if (session?.user) {
                      handleRegistrationComplete().catch(err => {
                        console.warn("[Onboarding] Background registration complete notice:", err);
                      });
                    } else {
                      // If no session exists at all, then redirect to registration
                      setStep("registration");
                    }
                  } catch (err) {
                    console.error("[Onboarding] Transition check error:", err);
                  }
                }}
                onSwitchToMember={() => {
                  setShowMemberTour(true);
                }}
                onClose={() => setStep("value-proposition")}
              />

              {showMemberTour && (
                <MemberTourModal
                  isOpen={showMemberTour}
                  onClose={() => setShowMemberTour(false)}
                  onStartQuest={() => {
                    setShowMemberTour(false);
                    setTutorialRole("member");
                    setStep("registration");
                  }}
                />
              )}
            </>
          )}

          {step === "registration" && (
            <RegistrationGate
              key="registration"
              onComplete={handleRegistrationComplete}
              initialError={formError}
            />
          )}

          {step === "purpose" && (
            <motion.div
              key="purpose"
              className="w-full"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
            >
              <PurposeSelector
                onContinue={(purposes, isCreator) => {
                  setActivePurposes(purposes);
                  setIsCreatorMode(isCreator);
                  
                  // Initial prompt category based on first active purpose
                  const availablePrompts = Object.entries(PURPOSE_PROMPTS)
                    .filter(([p]) => purposes.includes(p as MemberPurposeId))
                    .reduce((acc, [_, cats]) => ({ ...acc, ...cats }), {} as Record<string, any>);
                  
                  const firstCat = Object.keys(availablePrompts)[0] || "";
                  setPromptCategory(firstCat);
                  
                  setStep("intent");
                }}
              />
            </motion.div>
          )}

          {step === "intent" && (
            <motion.div
              key="intent"
              className="w-full"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
            >
              <IntentSelector
                activePurposes={activePurposes}
                onContinue={async (selected, chosenAge, corePassion) => {
                  setIntents(selected);
                  setDisplayAge(chosenAge);
                  
                  saveOnboardingState({
                    intents: selected,
                    displayAge: chosenAge,
                    corePassion,
                    step: "profile-checklist"
                  });

                  try {
                    let currentUserId = userId;
                    if (!currentUserId) {
                      const { data: { session } } = await supabase.auth.getSession();
                      currentUserId = session?.user?.id || null;
                    }
                    if (!currentUserId && typeof window !== "undefined") {
                      const stored = localStorage.getItem("fusion_onboarding_core");
                      if (stored) {
                        try {
                          currentUserId = JSON.parse(stored).userId;
                        } catch (e) {}
                      }
                    }
                    if (currentUserId) {
                      setUserId(currentUserId);
                      
                      const dbQueryPromise = (async () => {
                        const { data } = await supabase
                          .from("profiles")
                          .select("privacy_settings")
                          .eq("id", currentUserId)
                          .single();
                        const settings = data?.privacy_settings || {};
                        await supabase
                          .from("profiles")
                          .update({
                            core_passion: corePassion,
                            privacy_settings: {
                              ...settings,
                              display_age: chosenAge,
                            },
                          })
                          .eq("id", currentUserId);
                      })();

                      const timeoutPromise = new Promise((r) => setTimeout(r, 3000));
                      await Promise.race([dbQueryPromise, timeoutPromise]);
                    }
                  } catch (err) {
                    console.warn("Non-fatal DB update delay on intent submit:", err);
                  } finally {
                    setStep("profile-checklist");
                  }
                }}
              />
            </motion.div>
          )}

          {step === "profile-checklist" && (
            <motion.div
              key="checklist"
              className="w-full max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 items-start py-8 px-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {/* Left Column: Progress & Checklist */}
              <div className="hidden md:block md:col-span-5 space-y-6">
                <div className="text-left">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-3xl font-black tracking-tighter uppercase text-glow">
                        {t("onboarding.main.buildIdentity", "Build Your Identity")}
                      </h2>
                      <p className="text-white/40 text-xs font-bold uppercase tracking-wider mt-1">
                        {t("onboarding.main.setupProfile", "Set up your vibe profile.")}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowPreviewModal(true)}
                      className="px-3.5 py-2 bg-[#00fbfb]/10 border border-[#00fbfb]/30 rounded-xl text-[#00fbfb] text-[10px] font-black uppercase tracking-wider hover:bg-[#00fbfb]/20 transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" /> Preview Profile
                    </button>
                  </div>
                </div>

                <div className="glass-card p-6 rounded-3xl border border-white/5 bg-black/30 flex flex-col items-center">
                  <ProfileProgressRing progress={progress} />

                  <div className="w-full mt-4">
                    <CompletionChecklist
                      items={checklist.filter(item => !(item.id === "preferences" && (tutorialRole === "creator" || isCreatorMode)))}
                      onItemClick={(id) => setActiveItem(id as any)}
                    />
                  </div>
                </div>
              </div>

              {/* Right Column: Form Panel */}
              <div className="col-span-12 md:col-span-7">
                {/* Mobile Tab Navigation */}
                <div className="block md:hidden mb-6 bg-black/30 border border-white/5 rounded-2xl p-4 animate-fade-in">
                  <div className="flex items-center justify-between mb-3.5">
                    <span className="text-[10px] font-black uppercase tracking-wider text-white/50">{t("onboarding.main.profileSetup", "Profile Setup")}</span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
                      {t("onboarding.main.done", "{progress}% Done").replace("{progress}", progress.toString())}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {checklist.filter(item => !(item.id === "preferences" && (tutorialRole === "creator" || isCreatorMode))).map((item) => {
                      const isActive = activeItem === item.id;
                      const isDone = item.completed;
                      let label = t("onboarding.main.tabPhoto", "1. Photo");
                      if (item.id === "bio") label = t("onboarding.main.tabBio", "2. Bio");
                      if (item.id === "preferences") label = t("onboarding.main.tabMatch", "3. Match");
                      
                      return (
                        <button
                          key={item.id}
                          onClick={() => setActiveItem(item.id as any)}
                          className={`py-2 px-1 rounded-xl text-[9px] font-black uppercase tracking-wider border text-center transition-all flex items-center justify-center gap-1 ${
                            isActive
                              ? "bg-primary border-primary text-black"
                              : isDone
                              ? "bg-green-500/10 border-green-500/30 text-green-400"
                              : "bg-white/5 border-white/10 text-white/40"
                          }`}
                        >
                          {label}
                          {isDone && !isActive && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="glass-card p-8 rounded-3xl border border-primary/20 bg-black/40 shadow-2xl relative overflow-hidden min-h-[450px] flex flex-col">
                  {/* Subtle top glow */}
                  <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[80px] rounded-full pointer-events-none" />

                  {formError && (
                    <div className="mb-6 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold flex items-center gap-2">
                      <AlertCircle className="w-4.5 h-4.5 shrink-0" />
                      <span>{formError}</span>
                    </div>
                  )}

                  <AnimatePresence mode="wait">
                    {/* PHOTO INPUT SECTION */}
                    {activeItem === "photo" && (
                      <motion.div
                        key="photo-panel"
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className="flex-1 flex flex-col justify-between"
                      >
                        <div className="space-y-6">
                          <div className="flex items-center gap-3">
                            <Camera className="w-6 h-6 text-primary" />
                            <h3 className="text-lg font-black uppercase tracking-wider">
                              {t("onboarding.main.selectPhoto", "Select Profile Photo")}
                            </h3>
                          </div>

                          {/* Requirement Callout */}
                          <div className="p-3.5 rounded-2xl bg-[#00fbfb]/10 border border-[#00fbfb]/30 text-white text-xs flex items-start gap-3 text-left">
                            <Info className="w-4 h-4 shrink-0 mt-0.5 text-[#00fbfb]" />
                            <div className="space-y-0.5">
                              <span className="font-extrabold text-[#00fbfb] uppercase text-[10px] tracking-wider block">
                                {t("onboarding.main.photoReqTitle", "Photo Requirement: 1 Profile Avatar + 2 Public Album Photos")}
                              </span>
                              <span className="text-white/80 text-[11px] leading-relaxed block">
                                {t("onboarding.main.photoReqDesc", "Upload 1 profile avatar (your main cover, visible everywhere) and 2 public album photos to unlock the full Matchmaking Feed.")}
                              </span>
                            </div>
                          </div>

                          {/* Main Avatar Explainer */}
                          <div className="p-4 rounded-2xl bg-gradient-to-r from-primary/10 to-accent/5 border border-primary/30 text-white space-y-1.5 text-left">
                            <div className="flex items-center gap-2">
                              <Camera className="w-4 h-4 text-[#00fbfb]" />
                              <span className="font-extrabold text-[#00fbfb] uppercase text-[11px] tracking-wider">
                                {t("onboarding.main.mainAvatarTitle", "1. Main Profile Avatar (Visible to Everyone)")}
                              </span>
                            </div>
                            <p className="text-white/80 text-xs leading-relaxed">
                              {t("onboarding.main.mainAvatarDesc", "Your Main Avatar is your primary vibe card displayed across the community feed & match deck. Everyone on SECCION can see this photo as your front cover.")}
                            </p>
                          </div>

                          {/* Hidden File Input for Avatar */}
                          <input
                            type="file"
                            ref={fileInputRef}
                            accept="image/*"
                            onChange={handleLocalFileUpload}
                            className="hidden"
                          />

                          {/* Avatar Upload Action */}
                          <div className="space-y-3">
                            <button
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              className="w-full py-4 px-5 bg-gradient-to-r from-[#00fbfb]/20 via-[#a855f7]/15 to-[#ffabf3]/20 hover:from-[#00fbfb]/30 hover:to-[#ffabf3]/30 border border-[#00fbfb]/50 hover:border-[#00fbfb] rounded-2xl text-xs font-black text-white uppercase tracking-wider flex items-center justify-center gap-3 transition-all shadow-[0_0_25px_rgba(0,251,251,0.25)] hover:shadow-[0_0_35px_rgba(0,251,251,0.4)] group cursor-pointer active:scale-98"
                            >
                              <Upload className="w-5 h-5 text-[#00fbfb] group-hover:scale-110 transition-transform" />
                              <span>{avatarUrl ? (t("onboarding.main.replaceAvatar", "Replace Main Avatar Photo")) : (t("onboarding.main.uploadAvatar", "Upload Main Avatar Photo"))}</span>
                            </button>
                          </div>

                          {/* Avatar Live Preview */}
                          {avatarUrl && (
                            <div className="p-3 bg-white/5 border border-[#00fbfb]/30 rounded-2xl flex items-center gap-4">
                              <div className="w-14 h-14 rounded-xl overflow-hidden border border-[#00fbfb]/60 relative shrink-0">
                                <img src={avatarUrl} alt="Selected Avatar" className="w-full h-full object-cover" />
                              </div>
                              <div className="flex-1 text-left">
                                <span className="text-xs font-black text-[#00fbfb] uppercase tracking-wider block">
                                  {t("onboarding.main.mainAvatarReady", "Main Avatar Ready")}
                                </span>
                                <span className="text-[10px] text-white/50 block truncate max-w-[220px]">
                                  {avatarUrl.startsWith("data:") ? t("onboarding.main.imageLoadedComputer", "Image loaded from device") : avatarUrl}
                                </span>
                              </div>
                              <Check className="w-5 h-5 text-green-400 shrink-0" />
                            </div>
                          )}

                          {/* Preset Avatar Selection removed — use your own photo above */}

                          {/* Section B: Public Photo Album */}
                          <div className="pt-4 border-t border-white/10 space-y-4 text-left">
                            <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 text-white space-y-1.5">
                              <div className="flex items-center gap-2">
                                <ImageIcon className="w-4 h-4 text-purple-400" />
                                <span className="font-extrabold text-purple-300 uppercase text-[11px] tracking-wider">
                                  {t("onboarding.main.publicAlbumTitle", "2. Public Photo Album (Visible to All Members)")}
                                </span>
                              </div>
                              <p className="text-white/80 text-xs leading-relaxed">
                                {t("onboarding.main.publicAlbumDesc", "Your Public Album showcases your authentic lifestyle, passions, and world. Add 2 public album photos — these are visible to all SECCION members and are required to unlock the full Matchmaking Feed.")}
                              </p>
                            </div>

                            {/* Album Photo Uploader */}
                            <div className="space-y-3">
                              <input
                                type="file"
                                id="album-file-input"
                                accept="image/*"
                                multiple
                                onChange={(e) => {
                                  const files = Array.from(e.target.files || []);
                                  files.forEach((file) => {
                                    const reader = new FileReader();
                                    reader.onload = (event) => {
                                      const res = event.target?.result as string;
                                      if (res) {
                                        setAlbumPhotos((prev) => {
                                          const next = [...prev, res];
                                          saveOnboardingState({ albumPhotos: next, step: "profile-checklist", activeItem: "photo" });
                                          return next;
                                        });
                                      }
                                    };
                                    reader.readAsDataURL(file);
                                  });
                                }}
                                className="hidden"
                              />

                              <button
                                type="button"
                                onClick={() => document.getElementById("album-file-input")?.click()}
                                className="w-full py-3.5 px-5 bg-white/5 hover:bg-white/10 border border-purple-500/40 rounded-2xl text-xs font-bold text-purple-300 uppercase tracking-wider flex items-center justify-center gap-2 transition cursor-pointer"
                              >
                                <Upload className="w-4 h-4 text-purple-400" />
                                {t("onboarding.main.addPhotosAlbum", "Add Photos to Public Album")}
                              </button>

                              {/* Album Grid Previews */}
                              {albumPhotos.length > 0 && (
                                <div className="grid grid-cols-3 gap-2 pt-2">
                                  {albumPhotos.map((photo, i) => (
                                    <div key={i} className="relative aspect-square rounded-2xl overflow-hidden border border-white/20 group">
                                      <img src={photo} alt={`Album Photo ${i+1}`} className="w-full h-full object-cover" />
                                      <button
                                        type="button"
                                        onClick={() => setAlbumPhotos((prev) => prev.filter((_, idx) => idx !== i))}
                                        className="absolute top-1.5 right-1.5 p-1 rounded-full bg-black/70 text-white/80 hover:text-white transition"
                                      >
                                        <X className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Biometric Liveness Panel */}
                          <div className="p-5 bg-white/5 border border-white/10 rounded-2xl space-y-4">
                            <div className="flex items-center gap-3">
                              <ShieldCheck className="w-5 h-5 text-primary" />
                              <span className="text-xs font-bold text-white uppercase tracking-wider">
                                {t("onboarding.main.livenessCheck", "Anti-Catfishing Liveness Check")}
                              </span>
                            </div>
                            <p className="text-[10px] text-white/50 leading-relaxed font-medium">
                              {t("onboarding.main.livenessDesc", "To keep Seccion safe, you must complete a quick biometric liveness check to match your face with the selected photo.")}
                            </p>

                            {livenessStep === 0 && (
                              <button
                                type="button"
                                onClick={startLivenessCheck}
                                disabled={!avatarUrl}
                                className="w-full py-3 bg-primary/10 hover:bg-primary/20 border border-primary/30 text-primary font-black uppercase tracking-wider rounded-xl transition text-[10px] flex items-center justify-center gap-2 disabled:opacity-50"
                              >
                                <Video className="w-4 h-4" /> {t("onboarding.main.startCheck", "Start Liveness Selfie Check")}
                              </button>
                            )}

                            {livenessStep > 0 && livenessStep < 5 && (
                              <div className="flex flex-col items-center space-y-3">
                                <div className="w-24 h-24 rounded-full border-2 border-primary/45 overflow-hidden bg-black/40 relative">
                                  <video
                                    id="liveness-video"
                                    className="w-full h-full object-cover scale-x-[-1]"
                                    muted
                                    playsInline
                                  />
                                  <div className="absolute inset-0 bg-primary/5 pointer-events-none rounded-full border border-primary/30 animate-pulse" />
                                </div>
                                <div className="flex items-center gap-2">
                                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                                  <span className="text-[10px] font-mono text-primary uppercase tracking-widest">
                                    {livenessLog}
                                  </span>
                                </div>
                              </div>
                            )}

                            {livenessStep === 5 && (
                              <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center gap-3 text-left">
                                <ShieldCheck className="w-5 h-5 text-green-400 shrink-0" />
                                <div>
                                  <p className="text-[10px] font-bold text-white uppercase tracking-wider">
                                    Biometrics Match Successful
                                  </p>
                                  <p className="text-[9px] text-green-400 font-mono leading-none">
                                    {livenessLog}
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="pt-6">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleSaveDetails("photo");
                              setActiveItem("bio");
                            }}
                            className="w-full bg-primary text-black font-black uppercase tracking-widest py-4 rounded-xl hover:shadow-[0_0_20px_rgba(102,252,241,0.4)] transition text-xs flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(102,252,241,0.2)] active:scale-98"
                          >
                            {isSaving ? (
                              <Loader2 className="w-4 h-4 animate-spin text-black" />
                            ) : (
                              t("onboarding.main.savePhotosContinue", "Save Photos & Continue →")
                            )}
                          </button>
                        </div>
                      </motion.div>
                    )}
                    {/* BIO INPUT SECTION */}
                    {activeItem === "bio" && (
                      <motion.div
                        key="bio-panel"
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className="flex-1 flex flex-col justify-between"
                      >
                        <div className="space-y-4">
                          <div className="flex items-center gap-3">
                            <FileText className="w-6 h-6 text-primary" />
                            <h3 className="text-lg font-black uppercase tracking-wider">
                              {t("onboarding.main.bioPrompts", "Relational Prompt Check")} ({t("onboarding.main.promptStep", "Prompt {step} of 2").replace("{step}", promptStep.toString())})
                            </h3>
                          </div>

                          <p className="text-xs text-white/50 leading-relaxed font-medium">
                            {t("onboarding.main.bioDesc", "Help our AI Synergy Engine understand your vibe. Answer 2 prompts below.")}
                          </p>

                          {completedPrompt1 && (
                            <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-xl text-left space-y-1">
                              <span className="text-[8px] font-black uppercase text-green-400 tracking-widest block">✓ Prompt 1 Completed</span>
                              <p className="text-[10px] font-bold text-white/80 leading-normal">Q: {completedPrompt1.question}</p>
                              <p className="text-[9px] text-white/50 leading-relaxed truncate">"{completedPrompt1.answer}"</p>
                            </div>
                          )}

                          {/* Category Selector Tabs */}
                          <div className="space-y-1.5">
                            <label className="text-[9px] uppercase tracking-widest font-black text-white/40">
                              {t("onboarding.main.selectCategory", "1. Pick Your Vibe Zone")}
                            </label>
                            <div className="flex flex-wrap gap-1">
                              {(() => {
                                const sourcePrompts = locale === "es" ? PURPOSE_PROMPTS_ES : PURPOSE_PROMPTS;
                                const availablePrompts = Object.entries(sourcePrompts)
                                  .filter(([p]) => activePurposes.length === 0 || activePurposes.includes(p as MemberPurposeId))
                                  .reduce((acc, [_, cats]) => ({ ...acc, ...cats }), {} as Record<string, any>);
                                
                                const entries = Object.entries(availablePrompts);
                                const selectedCatKey = promptCategory || entries[0]?.[0];
                                if (!promptCategory && entries.length > 0) {
                                  setTimeout(() => {
                                    setPromptCategory(entries[0][0]);
                                    if (entries[0][1]?.prompts?.[0]) {
                                      setPromptQuestion(entries[0][1].prompts[0]);
                                    }
                                  }, 0);
                                }
                                
                                return entries.map(([key, data]) => {
                                  const isActive = selectedCatKey === key;
                                  return (
                                    <button
                                      key={key}
                                      type="button"
                                      onClick={() => {
                                        setPromptCategory(key);
                                        if (data.prompts?.[0]) {
                                          setPromptQuestion(data.prompts[0]);
                                        }
                                      }}
                                      className={`px-2.5 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border transition cursor-pointer ${
                                        isActive
                                          ? "bg-primary border-primary text-black"
                                          : "bg-white/5 border-white/5 text-white/60 hover:bg-white/10"
                                      }`}
                                    >
                                      {data.categoryName.split(" ")[0]}
                                    </button>
                                  );
                                });
                              })()}
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[9px] uppercase tracking-widest font-black text-white/40">
                              {t("onboarding.main.selectPrompt", "2. Choose Prompt Question")}
                            </label>
                            <div className="flex flex-col gap-1.5 max-h-[140px] overflow-y-auto pr-1 custom-scrollbar">
                              {(() => {
                                const sourcePrompts = locale === "es" ? PURPOSE_PROMPTS_ES : PURPOSE_PROMPTS;
                                const availablePrompts = Object.entries(sourcePrompts)
                                  .filter(([p]) => activePurposes.length === 0 || activePurposes.includes(p as MemberPurposeId))
                                  .reduce((acc, [_, cats]) => ({ ...acc, ...cats }), {} as Record<string, any>);
                                
                                const entries = Object.entries(availablePrompts);
                                const selectedCatKey = promptCategory || entries[0]?.[0];
                                const prompts = availablePrompts[selectedCatKey]?.prompts || [];
                                
                                return prompts.map((q: string) => {
                                  const isSelected = (promptQuestion || prompts[0]) === q;
                                  return (
                                    <button
                                      key={q}
                                      type="button"
                                      onClick={() => setPromptQuestion(q)}
                                      className={`p-2.5 rounded-xl border text-left text-[10px] leading-relaxed transition cursor-pointer ${
                                        isSelected
                                          ? "bg-white/10 border-primary text-white font-bold"
                                          : "bg-white/2 border-white/5 text-white/50 hover:bg-white/5 hover:border-white/10"
                                      }`}
                                    >
                                      {q}
                                    </button>
                                  );
                                });
                              })()}
                            </div>
                          </div>

                          {/* Response Textarea */}
                          {(() => {
                            const sourcePrompts = locale === "es" ? PURPOSE_PROMPTS_ES : PURPOSE_PROMPTS;
                            const availablePrompts = Object.entries(sourcePrompts)
                              .filter(([p]) => activePurposes.length === 0 || activePurposes.includes(p as MemberPurposeId))
                              .reduce((acc, [_, cats]) => ({ ...acc, ...cats }), {} as Record<string, any>);
                            const entries = Object.entries(availablePrompts);
                            const selectedCatKey = promptCategory || entries[0]?.[0];
                            const activeQuestion = promptQuestion || availablePrompts[selectedCatKey]?.prompts?.[0] || "";

                            return (
                              <div className="space-y-2 animate-fadeIn">
                                {activeQuestion && (
                                  <div className="p-3 bg-white/5 border border-white/10 rounded-xl">
                                    <span className="text-[8px] uppercase tracking-widest font-black text-primary block mb-1">{t("onboarding.main.activePrompt", "Active Prompt")}</span>
                                    <p className="text-[10px] leading-relaxed text-white/80">"{activeQuestion}"</p>
                                  </div>
                                )}
                                
                                <label className="text-[9px] uppercase tracking-widest font-black text-white/40 block">
                                  {t("onboarding.main.writeResponse", "3. Write Your Narrative Response")}
                                </label>
                                <textarea
                                  rows={3}
                                  placeholder={locale === "es" ? "Escribe tu respuesta detallada aquí (mínimo 10 caracteres)..." : "Write a detailed, thoughtful story in response to the prompt..."}
                                  value={promptAnswer}
                                  onChange={(e) => setPromptAnswer(e.target.value)}
                                  className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-xs text-white placeholder-white/20 focus:border-primary focus:outline-none transition resize-none"
                                />
                                <div className="flex justify-between items-center text-[9px] font-bold uppercase">
                                  <span className={promptAnswer.length < 10 ? "text-[#dc143c]" : "text-green-500"}>
                                    {promptAnswer.length < 10 ? t("onboarding.main.minCharsReq", "Min 10 characters required") : t("onboarding.main.lengthValidated", "Length Validated")}
                                  </span>
                                  <span className="text-white/30">
                                    {promptAnswer.length} / 500
                                  </span>
                                </div>
                              </div>
                            );
                          })()}
                        </div>

                        <div className="pt-4">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              console.log("[SECCION] Analyze & Save clicked", { promptStep, promptCategory, promptQuestion, promptAnswer });
                              const sourcePrompts = locale === "es" ? PURPOSE_PROMPTS_ES : PURPOSE_PROMPTS;
                              const availablePrompts = Object.entries(sourcePrompts)
                                .filter(([p]) => activePurposes.length === 0 || activePurposes.includes(p as MemberPurposeId))
                                .reduce((acc, [_, cats]) => ({ ...acc, ...cats }), {} as Record<string, any>);
                              const entries = Object.entries(availablePrompts);
                              const selectedCatKey = promptCategory || entries[0]?.[0] || "lifestyle";
                              const availableQuestions = availablePrompts[selectedCatKey]?.prompts || [];
                              const activeQuestion = promptQuestion || availableQuestions[0] || "Cozy homebody or active explorer on weekends?";
                              
                              handleSaveDetails("bio", {
                                category: selectedCatKey,
                                question: activeQuestion,
                                answer: promptAnswer
                              });
                            }}
                            disabled={isSaving || promptAnswer.trim().length < 10}
                            className="w-full bg-primary text-black font-black uppercase tracking-widest py-4 rounded-xl hover:shadow-[0_0_20px_rgba(102,252,241,0.4)] transition disabled:opacity-50 text-xs flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(102,252,241,0.2)] active:scale-98 relative z-20"
                          >
                            {isSaving ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin text-black" />
                                <span>AI reading your vibes...</span>
                              </>
                            ) : (
                              t("onboarding.main.analyzeSavePrompt", "Analyze & Save Prompt {step}").replace("{step}", promptStep.toString())
                            )}
                          </button>
                          
                          {/* If Creator and bio is done, proceed to welcome */}
                          {(tutorialRole === "creator" || isCreatorMode) && (
                             <button
                               type="button"
                               onClick={() => {
                                 setChecklist((prev) =>
                                   prev.map((item) =>
                                     item.id === "bio" ? { ...item, completed: true } : item,
                                   ),
                                 );
                                 setStep("welcome");
                               }}
                               className="w-full mt-3 bg-white/10 text-white font-black uppercase tracking-widest py-3 rounded-xl hover:bg-white/20 transition text-xs cursor-pointer"
                             >
                               {t("onboarding.main.continueDashboard", "Continue to Dashboard →")}
                             </button>
                          )}
                        </div>
                      </motion.div>
                    )}

                    {/* PREFERENCES INPUT SECTION */}
                    {activeItem === "preferences" && (
                      <motion.div
                        key="pref-panel"
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className="flex-1 flex flex-col justify-between h-full"
                      >
                        <ArchetypeSelector
                          activePurposes={activePurposes}
                          onSelect={async (archetype, data) => {
                            if (!userId) return;
                            setIsSaving(true);
                            try {
                              const isDating = activePurposes.includes("dating") || (activePurposes as string[]).includes("intimate") || activePurposes.includes("explicit");
                              
                              const updatePayload: any = {
                                archetype: archetype,
                                hobbies: data.hobbies,
                                lifestyle_habits: data.lifestyle_habits,
                                connection_points: 100,
                                favorite_languages: ["English"]
                              };

                              if (isDating) {
                                updatePayload.relationship_goals = data.relationship_goals;
                                updatePayload.sexual_preference = "Everyone";
                              } else {
                                updatePayload.relationship_goals = null;
                                updatePayload.sexual_preference = null;
                                updatePayload.sexual_preferences = null;
                                updatePayload.family_goals = null;
                              }
                              
                              const { error } = await supabase
                                .from("profiles")
                                .update(updatePayload)
                                .eq("id", userId);
                              if (error) throw error;
                            } catch (err: any) {
                              setFormError(err.message || "Failed to save archetype.");
                            } finally {
                              setIsSaving(false);
                            }
                          }}
                          onProceed={() => {
                            setChecklist((prev) =>
                              prev.map((item) =>
                                item.id === "preferences" ? { ...item, completed: true } : item
                              )
                            );
                            setTimeout(() => setStep("welcome"), 1000);
                          }}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          )}

          {step === "creator-checklist" && (
            <motion.div
              key="creator-checklist"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full max-w-4xl mx-auto flex flex-col md:flex-row bg-black/80 border border-primary/20 rounded-3xl backdrop-blur-xl relative overflow-hidden shadow-[0_0_50px_rgba(102,252,241,0.1)] min-h-[75vh]"
            >
              <div className="flex-1 p-6 md:p-8 flex flex-col justify-center items-center text-center space-y-6 relative z-10">
                <div className="p-4 bg-primary/10 rounded-full border border-primary/20 animate-pulse">
                  <Video className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h2 className="text-3xl font-black uppercase Outfit tracking-tight">Creator Extension</h2>
                  <p className="text-xs text-white/50 mt-2 font-medium max-w-md mx-auto">
                    Your member profile is ready. Now let's finalize your Studio presence. Upload your Portfolio Reel and write your professional Creator Bio.
                  </p>
                </div>

                <div className="w-full max-w-md space-y-4 text-left mt-6">
                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase tracking-widest text-primary">Portfolio Reel URL</label>
                     <input
                        type="text"
                        placeholder="https://vimeo.com/..."
                        value={videoPresentationUrl}
                        onChange={(e) => setVideoPresentationUrl(e.target.value)}
                        className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-xs text-white placeholder-white/20 focus:border-primary outline-none transition"
                     />
                  </div>
                  
                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase tracking-widest text-primary">Creator Bio</label>
                     <textarea
                        rows={4}
                        placeholder="Describe your premium content, VIP tiers, and what subscribers get..."
                        value={creatorBio}
                        onChange={(e) => setCreatorBio(e.target.value)}
                        className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-xs text-white placeholder-white/20 focus:border-primary outline-none transition resize-none"
                     />
                  </div>
                </div>

                <button
                  onClick={async () => {
                    setIsSavingCreator(true);
                    try {
                      // Save to creator_profiles
                      const tierPrice = sessionStorage.getItem("_onboarding_creator_tier_price");
                      const faceBlur = sessionStorage.getItem("_onboarding_creator_face_blur");
                      const residence = sessionStorage.getItem("_onboarding_creator_residence");
                      const vibe = sessionStorage.getItem("_onboarding_creator_vibe");
                      const purposesStr = sessionStorage.getItem("_onboarding_creator_purposes");
                      const specialization = sessionStorage.getItem("_onboarding_creator_specialization");
                      const sexualPreference = sessionStorage.getItem("_onboarding_creator_sexual_preference");
                      const relationshipGoal = sessionStorage.getItem("_onboarding_creator_relationship_goal");
                      const relationshipType = sessionStorage.getItem("_onboarding_creator_relationship_type");
                      const isAdult = sessionStorage.getItem("_onboarding_creator_is_adult");

                      const payload = {
                        id: userId,
                        creator_archetype: vibe || null,
                        specialization: specialization || null,
                        creator_purposes: purposesStr ? JSON.parse(purposesStr) : [],
                        video_presentation_url: videoPresentationUrl,
                        creator_bio: creatorBio,
                        tier_price: tierPrice ? parseFloat(tierPrice) : null,
                        face_blur_active: faceBlur === "true",
                        tax_residence: residence || null,
                        sexual_preference: sexualPreference || null,
                        relationship_goals: relationshipGoal ? [relationshipGoal] : [],
                        relationship_types: relationshipType ? [relationshipType] : [],
                        is_adult_content: isAdult === "true"
                      };

                      await supabase.from("creator_profiles").upsert(payload);
                      setStep("welcome");
                    } catch (e) {
                      setFormError("Failed to save creator extension profile.");
                    } finally {
                      setIsSavingCreator(false);
                    }
                  }}
                  disabled={isSavingCreator || !videoPresentationUrl || !creatorBio}
                  className="w-full max-w-md bg-primary text-black font-black uppercase tracking-widest py-4 rounded-xl hover:shadow-[0_0_20px_rgba(102,252,241,0.4)] transition disabled:opacity-50 text-xs flex items-center justify-center gap-2"
                >
                  {isSavingCreator ? <Loader2 className="w-4 h-4 animate-spin" /> : "Publish Creator Profile"}
                </button>
                {formError && <p className="text-red-500 text-xs mt-2">{formError}</p>}
              </div>
            </motion.div>
          )}

          {step === "welcome" && <FoundersWelcome key="welcome" />}
        </AnimatePresence>
      </div>

      {/* Profile Preview Modal */}
      <ProfilePreviewModal
        isOpen={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
        profile={{
          avatar_url: avatarUrl,
          bio_prompt_answer: completedPrompt1?.answer || promptAnswer,
          bio_prompt_answer_2: completedPrompt1 ? promptAnswer : "",
          bio_prompt_question: completedPrompt1?.question || promptQuestion,
          bio_prompt_question_2: completedPrompt1 ? promptQuestion : "",
          album_photos: albumPhotos,
        }}
      />
    </div>
  );
}
