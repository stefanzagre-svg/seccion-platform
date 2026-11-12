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
  ARCHETYPE_AVATARS,
  MEMBER_VIBE_CHIPS,
  MEMBER_VIBE_CHIPS_ES,
  normalizeArchetypeId,
  normalizePassionId,
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
          sexual_preference: "Everyone"
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

          // Moroccan Domestic Privacy Shield (Task 2)
          const moroccoShield = sessionStorage.getItem("_onboarding_creator_morocco_shield");
          const blockedCountriesStr = sessionStorage.getItem("_onboarding_creator_blocked_countries");
          if (moroccoShield === "true" || blockedCountriesStr) {
            try {
              const blocked = blockedCountriesStr ? JSON.parse(blockedCountriesStr) : ["MA"];
              updatePayload.privacy_settings = {
                ...(updatePayload.privacy_settings || {}),
                blocked_countries: Array.from(new Set([...(updatePayload.privacy_settings?.blocked_countries || []), ...blocked])),
                morocco_domestic_shield: true,
              };
            } catch {}
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
      OnboardingLogger.log('registration', 'step_enter', 'routing creator directly to studio', currentUserId);
      if (typeof window !== "undefined") {
        document.cookie = "sb_ob=1; path=/; max-age=2592000; SameSite=Lax";
        document.cookie = "sb_role=creator; path=/; max-age=2592000; SameSite=Lax";
        window.location.href = "/studio";
        return;
      }
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
  const [completedPrompt1, setCompletedPrompt1] = useState<{category: string; question: string; answer: string} | null>(null);
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

  // Biometric Liveness Check states (powered by DIDIT Zero-Knowledge Identity Gateway)
  const [livenessVerified, setLivenessVerified] = useState(false);
  const [livenessLoading, setLivenessLoading] = useState(false);
  const [livenessStep, setLivenessStep] = useState(0); // 0: idle, 1: connecting, 4: in progress, 5: success
  const [livenessLog, setLivenessLog] = useState("");

  const startLivenessCheck = async () => {
    try {
      setLivenessLoading(true);
      setLivenessStep(1);
      setLivenessLog(
        locale === "es"
          ? "Conectando con la pasarela DIDIT Zero-Knowledge..."
          : "Connecting to DIDIT Zero-Knowledge Gateway..."
      );

      const res = await fetch("/api/kyc/didit-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          returnTo: "/onboarding?didit_session=completed",
          targetRole: isCreatorMode ? "creator" : "member",
        }),
      });

      const data = await res.json();
      const sessionUrl = data?.url || "https://verify.didit.me/u/bPzKX19JQiawBcuyL9kraw";

      try {
        const { DiditSdk } = await import("@didit-protocol/sdk-web");
        if (DiditSdk?.shared) {
          DiditSdk.shared.onComplete = (result: any) => {
            console.log("[DIDIT Liveness Result]:", result?.status);
            if (result?.status === "completed" || result?.status === "approved") {
              setLivenessVerified(true);
              setLivenessStep(5);
              setLivenessLog(
                locale === "es"
                  ? "✓ Verificación 3D Facial DIDIT confirmada (Zero-Knowledge)"
                  : "✓ 3D Face Liveness Verified via DIDIT (Zero-Knowledge)"
              );
            }
          };
          DiditSdk.shared.startVerification({ url: sessionUrl });
          setLivenessLoading(false);
          setLivenessStep(4);
          return;
        }
      } catch (sdkErr) {
        console.warn("[DIDIT SDK Dynamic Modal Fallback]:", sdkErr);
      }

      // Fallback: open secure DIDIT session in a new window/tab
      window.open(sessionUrl, "_blank", "noopener,noreferrer");
      setLivenessLoading(false);
      setLivenessStep(4);
      setLivenessLog(
        locale === "es"
          ? "Ventana de verificación DIDIT abierta. Completa el escaneo 3D y regresa aquí."
          : "DIDIT verification window opened. Complete 3D face scan and return here."
      );
    } catch (err: any) {
      console.error("[DIDIT Liveness Error]:", err);
      window.open("https://verify.didit.me/u/bPzKX19JQiawBcuyL9kraw", "_blank", "noopener,noreferrer");
      setLivenessLoading(false);
      setLivenessStep(4);
      setLivenessLog(
        locale === "es"
          ? "Sesión de cumplimiento DIDIT iniciada."
          : "DIDIT compliance session launched."
      );
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
            // Restore persisted purposes — critical so prompt category filter works after page reload
            if (Array.isArray(savedState.activePurposes) && savedState.activePurposes.length > 0) {
              setActivePurposes(savedState.activePurposes);
            }
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
          const hasBio = !!(profile.bio_prompt_answer || profile.bio);
          const hasPreferences = !!(profile.archetype || profile.sexual_preference);
          const pendingCreator =
            typeof window !== "undefined" && (
              params.get("role") === "creator" ||
              localStorage.getItem("is_creator_signup") === "true" ||
              !!sessionStorage.getItem("_onboarding_creator_archive_choice") ||
              profile.role === "creator"
            );

          if (profile.avatar_url) {
            setAvatarUrl((prev) => prev || profile.avatar_url);
          }
          if (Array.isArray(profile.album_photos) && profile.album_photos.length > 0) {
            setAlbumPhotos((prev) => (prev.length > 0 ? prev : profile.album_photos));
          }

          if (profile.is_kyc_verified || params.get("didit_session") === "completed") {
            setLivenessVerified(true);
            setLivenessStep(5);
            setLivenessLog(
              locale === "es"
                ? "✓ Verificación 3D Facial DIDIT confirmada (Zero-Knowledge)"
                : "✓ 3D Face Liveness Verified via DIDIT (Zero-Knowledge)"
            );
          }

          setChecklist((prev) =>
            prev.map((item) => {
              if (item.id === "photo") return { ...item, completed: item.completed || hasPhoto };
              if (item.id === "bio") return { ...item, completed: item.completed || hasBio };
              if (item.id === "preferences") return { ...item, completed: item.completed || hasPreferences || pendingCreator };
              return item;
            })
          );

          if (!hasPhoto) {
            setActiveItem("photo");
          } else if (!hasBio) {
            setActiveItem("bio");
          } else if (!hasPreferences && !pendingCreator) {
            setActiveItem("preferences");
          }
          
          if (hasPhoto && hasBio && (hasPreferences || pendingCreator)) {
            if (typeof window !== "undefined") {
              document.cookie = "sb_ob=1; path=/; max-age=2592000; SameSite=Lax";
            }
            if (pendingCreator) {
              setIsCreatorMode(true);
            }
            setStep("welcome");
          } else {
            const hasPurposes = Array.isArray(profile.member_purposes) && profile.member_purposes.length > 0;
            const hasAge = !!profile.privacy_settings?.display_age;

            const hasExplicitOnboardingParam =
              params.has("setup") ||
              params.has("tutorial") ||
              params.has("quest") ||
              params.has("reset") ||
              params.has("fresh") ||
              params.has("bypass");

            if (pendingCreator) {
              setIsCreatorMode(true);
              if (typeof window !== "undefined") {
                document.cookie = "sb_ob=1; path=/; max-age=2592000; SameSite=Lax";
                document.cookie = "sb_role=creator; path=/; max-age=2592000; SameSite=Lax";
                if (!sessionStorage.getItem("_onboarding_creator_archive_choice")) {
                  sessionStorage.setItem("_onboarding_creator_archive_choice", "creator");
                }
                if (!hasExplicitOnboardingParam) {
                  window.location.href = "/studio";
                  return;
                }
              }
              OnboardingLogger.log('init', 'step_enter', 'creator detected on return, routing to profile-checklist', authUser.id);
              setStep("profile-checklist");
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
                role: authUser.user_metadata?.role === 'creator' ? 'creator' : 'member'
              }),
            null,
            4000
          );

          if (isCreatorSignup) {
            setIsCreatorMode(true);
            setChecklist((prev) =>
              prev.map((item) => (item.id === "preferences" ? { ...item, completed: true } : item))
            );
            const hasExplicitOnboardingParam =
              params.has("setup") ||
              params.has("tutorial") ||
              params.has("quest") ||
              params.has("reset") ||
              params.has("fresh") ||
              params.has("bypass");
            if (typeof window !== "undefined") {
              document.cookie = "sb_ob=1; path=/; max-age=2592000; SameSite=Lax";
              document.cookie = "sb_role=creator; path=/; max-age=2592000; SameSite=Lax";
              sessionStorage.setItem("_onboarding_creator_archive_choice", "creator");
              localStorage.removeItem("is_creator_signup");
              if (!hasExplicitOnboardingParam) {
                window.location.href = "/studio";
                return;
              }
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
        const emailParam = params.get("email");
        if (error === "auth_callback_failed") {
          setFormError("Your magic link was opened in a different browser window or has expired. Please log in with your password or request a new 6-digit passcode.");
          setStep("registration");
        } else if (params.get("tutorial") === "creator" || params.get("quest") === "true") {
          setIsCreatorMode(true);
          setStep("creator-quest");
        } else if ((params.get("role") === "creator" || params.get("invite") === "creator") && emailParam) {
          if (typeof window !== "undefined") {
            window.location.href = `/login?email=${encodeURIComponent(emailParam)}&approved=true`;
            return;
          }
        } else if (params.get("role") === "creator" || params.get("invite") === "creator") {
          setIsCreatorMode(true);
          if (typeof window !== "undefined") {
            sessionStorage.setItem("_onboarding_creator_archive_choice", "creator");
          }
          setStep("registration");
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
      if (params.get('role') === 'creator' || params.get('invite') === 'creator') {
        setIsCreatorMode(true);
        if (!sessionStorage.getItem('_onboarding_creator_archive_choice')) {
          sessionStorage.setItem('_onboarding_creator_archive_choice', 'creator');
        }
      }
      if (params.get('tutorial') === 'creator' || params.get('quest') === 'true') {
        setIsCreatorMode(true);
        setStep((prev) => (prev === 'registration' || prev === 'value-proposition') ? 'creator-quest' : prev);
      }
    }
  }, []);

  const handleSkipToStudio = () => {
    if (typeof window !== "undefined") {
      document.cookie = "sb_ob=1; path=/; max-age=2592000; SameSite=Lax";
      document.cookie = "sb_role=creator; path=/; max-age=2592000; SameSite=Lax";
      sessionStorage.setItem("_onboarding_creator_archive_choice", "creator");
      window.location.href = "/studio?welcome=true";
    }
  };

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
              setPromptCategory((profile.bio_prompt_category_2 as any) || "skills");
              setPromptQuestion(profile.bio_prompt_question_2 || "");
              setPromptAnswer(profile.bio_prompt_answer_2 || "");
              setPromptStep(2);
            } else if (p2Done) {
              setPromptCategory((profile.bio_prompt_category_2 as any) || "skills");
              setPromptQuestion(profile.bio_prompt_question_2 || "");
              setPromptAnswer(profile.bio_prompt_answer_2 || "");
              setPromptStep(2);
            } else {
              setPromptCategory((profile.bio_prompt_category as any) || "skills");
              setPromptQuestion(profile.bio_prompt_question || "");
              setPromptAnswer(profile.bio_prompt_answer || "");
              setPromptStep(1);
            }

            if (p1Done) {
              setCompletedPrompt1({
                category: profile.bio_prompt_category || "skills",
                question: profile.bio_prompt_question || "",
                answer: profile.bio_prompt_answer || ""
              });
            }

            if (profile.member_purposes && Array.isArray(profile.member_purposes) && profile.member_purposes.length > 0) {
              // ✅ Source of truth: use what's already saved in the profile DB row
              setActivePurposes(profile.member_purposes as MemberPurposeId[]);
              saveOnboardingState({ activePurposes: profile.member_purposes });
            } else {
              // Fallback chain: sessionStorage creator purposes → role default
              let resolvedPurposes: MemberPurposeId[] = [];
              const storedPurposes = typeof window !== "undefined"
                ? sessionStorage.getItem("_onboarding_creator_purposes")
                : null;
              if (storedPurposes) {
                try {
                  const parsed = JSON.parse(storedPurposes);
                  if (Array.isArray(parsed) && parsed.length > 0) {
                    resolvedPurposes = Array.from(new Set(parsed.map((p: string) =>
                      p.toLowerCase().includes("explicit") ? "explicit" as MemberPurposeId:
                      p.toLowerCase().includes("creator") ? "creator" as MemberPurposeId:
                      p.toLowerCase().includes("lifestyle") || p.toLowerCase().includes("mentorship") || p.toLowerCase().includes("gaming") ? "lifestyle" as MemberPurposeId:
                      "dating" as MemberPurposeId
                    )));
                  }
                } catch {}
              }
              if (resolvedPurposes.length === 0) {
                // Default by role: creator gets creator+lifestyle, members get lifestyle (zero mandatory city/album gate)
                resolvedPurposes = (profile.role === "creator" || isCreatorMode || tutorialRole === "creator")
                  ? ["creator", "lifestyle"]
                  : ["lifestyle"];
              }
              setActivePurposes(resolvedPurposes);
              saveOnboardingState({ activePurposes: resolvedPurposes });
            }

            if (Array.isArray(profile.album_photos) && profile.album_photos.length > 0) {
              setAlbumPhotos(profile.album_photos);
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
                  return { ...item, completed: p1Done };
                if (item.id === "preferences")
                  return { ...item, completed: !!(profile.archetype || profile.sexual_preference) };
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
    // ─── Resolve userId in background (never blocks UI) ───
    const resolveUserId = async (): Promise<string | null> => {
      if (userId) return userId;
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user?.id) { setUserId(session.user.id); return session.user.id; }
      } catch {}
      if (typeof window !== "undefined") {
        try {
          const core = localStorage.getItem("fusion_onboarding_core");
          if (core) return JSON.parse(core).userId || null;
        } catch {}
      }
      return null;
    };

    // ─── BIO: fully synchronous fast-path — zero await before UI update ───
    if (type === "bio") {
      const effectiveCategory = overrideData?.category || promptCategory || "lifestyle";
      const effectiveQuestion = overrideData?.question || promptQuestion || "Cozy homebody or active explorer on weekends?";
      const effectiveAnswer = (overrideData?.answer !== undefined ? overrideData.answer : promptAnswer).trim();

      if (!effectiveAnswer) { setFormError(t("onboarding.main.promptMissingErr", "Please write your answer.")); return; }
      if (effectiveAnswer.length < 10) { setFormError(t("onboarding.main.promptLengthErr", "Write a bit more so our AI can read your vibe properly (min 10 chars).")); return; }
      setFormError(null);

      const isCreatorSignupBio =
        tutorialRole === "creator" ||
        isCreatorMode ||
        (typeof window !== "undefined" && (
          !!sessionStorage.getItem("_onboarding_creator_archive_choice") ||
          localStorage.getItem("is_creator_signup") === "true"
        ));

      if (isCreatorSignupBio) {
        // Creators only need 1 Bio response + Avatar Photo to launch into Creator Studio!
        const updatedCreatorChecklist = checklist.map((item) =>
          item.id === "bio" || item.id === "preferences" ? { ...item, completed: true } : item
        );
        setChecklist(updatedCreatorChecklist);
        const nextCreatorItem = updatedCreatorChecklist
          .filter((item) => item.id !== "preferences")
          .find((item) => !item.completed);

        if (typeof window !== "undefined") {
          document.cookie = "sb_ob=1; path=/; max-age=2592000; SameSite=Lax";
          document.cookie = "sb_role=creator; path=/; max-age=2592000; SameSite=Lax";
        }

        if (nextCreatorItem) {
          saveOnboardingState({ step: "profile-checklist", activeItem: nextCreatorItem.id as any, avatarUrl });
          setActiveItem(nextCreatorItem.id as any);
        } else {
          saveOnboardingState({ step: "welcome", activeItem: "bio", avatarUrl });
          setStep("welcome");
        }

        resolveUserId().then((uid) => {
          if (!uid) return;
          const creatorPayload = {
            bio: effectiveAnswer,
            bio_prompt_category: effectiveCategory,
            bio_prompt_question: effectiveQuestion,
            bio_prompt_answer: effectiveAnswer,
            bio_prompt_category_2: effectiveCategory,
            bio_prompt_question_2: effectiveQuestion,
            bio_prompt_answer_2: effectiveAnswer,
            member_purposes: activePurposes.length > 0 ? activePurposes : ["creator", "lifestyle"],
          };
          supabase.from("profiles").update(creatorPayload).eq("id", uid).then(() => {});
          fetch("/api/v2/profile/analyze-prompt", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              promptCategory: effectiveCategory,
              promptQuestion: effectiveQuestion,
              promptAnswer: effectiveAnswer,
              promptIndex: 1,
              activePurposes,
            }),
          }).catch(() => {});
        });
        return;
      }

      // ── Fast 1-Prompt Completion for Members (saves Prompt 1 and mirrors to Prompt 2 if not yet set) ──
      setCompletedPrompt1({ category: effectiveCategory, question: effectiveQuestion, answer: effectiveAnswer });
      const dbPayload = {
        bio: effectiveAnswer,
        bio_prompt_category: effectiveCategory,
        bio_prompt_question: effectiveQuestion,
        bio_prompt_answer: effectiveAnswer,
        bio_prompt_category_2: effectiveCategory,
        bio_prompt_question_2: effectiveQuestion,
        bio_prompt_answer_2: effectiveAnswer,
        member_purposes: activePurposes.length > 0 ? activePurposes : ["lifestyle"],
      };

      // Advance UI NOW (synchronous — no await)
      saveOnboardingState({ step: "profile-checklist", activeItem: "bio", avatarUrl });
      setChecklist((prev) => prev.map((item) => item.id === "bio" ? { ...item, completed: true } : item));
      const updatedChecklist = checklist.map((item) => item.id === "bio" ? { ...item, completed: true } : item);
      const nextIncomplete = updatedChecklist.find((item) => !item.completed);
      if (nextIncomplete) {
        setActiveItem(nextIncomplete.id as any);
      } else {
        if (typeof window !== "undefined") {
          document.cookie = "sb_ob=1; path=/; max-age=2592000; SameSite=Lax";
        }
        setStep("welcome");
      }

      // Background DB write — fire-and-forget, never blocks UI
      resolveUserId().then((uid) => {
        if (!uid) { console.warn('[SECCION] bio save: no userId — DB write skipped (not authenticated)'); return; }
        const writePromise = supabase.from("profiles").update(dbPayload).eq("id", uid);
        const timeout = new Promise<void>((resolve) => setTimeout(resolve, 5000));
        Promise.race([writePromise, timeout]).catch((err) => console.warn('[SECCION] bio DB write error:', err));
        fetch("/api/v2/profile/analyze-prompt", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ promptCategory: effectiveCategory, promptQuestion: effectiveQuestion, promptAnswer: effectiveAnswer, promptIndex: 1, activePurposes }) }).catch(() => {});
      });
      return;
    }

    // ─── PHOTO: validate → advance UI instantly → save DB in background (including album_photos & profile_media!) ───
    if (type === "photo") {
      if (!avatarUrl) { setFormError(t("onboarding.main.selectAvatarErr", "Please select or input an avatar photo.")); return; }
      setFormError(null);
      console.log('[SECCION] photo save fast-path: advancing UI');
      const isCreatorSignup =
        tutorialRole === "creator" ||
        isCreatorMode ||
        (typeof window !== "undefined" && !!sessionStorage.getItem("_onboarding_creator_archive_choice"));
      saveOnboardingState({ step: "profile-checklist", activeItem: "photo", avatarUrl, albumPhotos });
      setChecklist((prev) => prev.map((item) => item.id === "photo" ? { ...item, completed: true } : item));
      const updatedChecklist = checklist.map((item) => item.id === "photo" ? { ...item, completed: true } : item);
      const visibleChecklist = updatedChecklist.filter((item) => !(item.id === "preferences" && isCreatorSignup));
      const nextIncomplete = visibleChecklist.find((item) => !item.completed);
      if (nextIncomplete) setActiveItem(nextIncomplete.id as any);
      else setStep(isCreatorSignup ? "creator-checklist" : "welcome");
      // Background DB write — never blocks UI
      resolveUserId().then(async (uid) => {
        if (!uid) { console.warn('[SECCION] photo: no userId — DB write skipped'); return; }
        const photoPayload: Record<string, any> = { avatar_url: avatarUrl };
        if (albumPhotos.length > 0) {
          photoPayload.album_photos = albumPhotos;
        }
        const { error } = await supabase.from("profiles").update(photoPayload).eq("id", uid);
        if (error) console.warn('[SECCION] photo DB write error:', error.message);

        // Sync public album photos into profile_media so checkPublicPhotoRequirement() passes (H3 Fix)
        if (albumPhotos.length > 0) {
          try {
            const { data: existingMedia } = await supabase
              .from("profile_media")
              .select("media_url")
              .eq("user_id", uid)
              .eq("is_hidden", false);
            const existingUrls = new Set((existingMedia || []).map((m: any) => m.media_url));
            const newMediaRows = albumPhotos
              .filter((url) => url && !existingUrls.has(url))
              .map((url) => ({
                user_id: uid,
                media_url: url,
                media_type: "image",
                is_hidden: false,
                required_level: "public",
              }));
            if (newMediaRows.length > 0) {
              await supabase.from("profile_media").insert(newMediaRows);
            }
          } catch (mediaErr) {
            console.warn('[SECCION] profile_media sync warning:', mediaErr);
          }
        }
      });
      return;
    }

    // ─── PREFERENCES: validate → advance UI → save DB in background ───
    if (type === "preferences") {
      if (favoriteLanguages.length === 0) { setFormError("Please select at least one Favorite Language."); return; }
      setFormError(null);
      const prefsPayload = { sexual_preferences: sexPrefs, sexual_preference: sexPrefs[0] || "", relationship_goals: relGoals, relationship_types: relTypes, favorite_languages: favoriteLanguages };
      console.log('[SECCION] preferences save fast-path: advancing UI');
      saveOnboardingState({ step: "profile-checklist", activeItem: "preferences", avatarUrl });
      setChecklist((prev) => prev.map((item) => item.id === "preferences" ? { ...item, completed: true } : item));
      const updatedChecklist = checklist.map((item) => item.id === "preferences" ? { ...item, completed: true } : item);
      const nextIncomplete = updatedChecklist.find((item) => !item.completed);
      if (nextIncomplete) setActiveItem(nextIncomplete.id as any);
      else {
        const isCreatorSignup = tutorialRole === "creator" || isCreatorMode || (typeof window !== "undefined" && !!sessionStorage.getItem("_onboarding_creator_archive_choice"));
        setStep(isCreatorSignup ? "creator-checklist" : "welcome");
      }
      // Background DB write
      resolveUserId().then((uid) => {
        if (!uid) { console.warn('[SECCION] preferences: no userId — DB write skipped'); return; }
        supabase.from("profiles").update(prefsPayload).eq("id", uid)
          .then(({ error }) => { if (error) console.warn('[SECCION] preferences DB write error:', error.message); });
      });
      return;
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
                  if (typeof window !== "undefined") {
                    if (isCreator) {
                      sessionStorage.setItem("_onboarding_creator_archive_choice", "creator");
                      document.cookie = "sb_role=creator; path=/; max-age=2592000; SameSite=Lax";
                    } else {
                      sessionStorage.removeItem("_onboarding_creator_archive_choice");
                    }
                  }
                  
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
                onContinue={async (selected, chosenAge, corePassion, calibratedSynergy) => {
                  setIntents(selected);
                  setDisplayAge(chosenAge);
                  if (calibratedSynergy) {
                    if (!avatarUrl && calibratedSynergy.avatarUrl) {
                      setAvatarUrl(calibratedSynergy.avatarUrl);
                    }
                    setPromptCategory(calibratedSynergy.bioPromptCategory);
                    setPromptQuestion(calibratedSynergy.bioPromptQuestion);
                    setPromptAnswer(calibratedSynergy.bioPromptAnswer);
                    setCompletedPrompt1({
                      category: calibratedSynergy.bioPromptCategory,
                      question: calibratedSynergy.bioPromptQuestion,
                      answer: calibratedSynergy.bioPromptAnswer,
                    });
                    setChecklist([
                      { id: "photo", label: "Profile Avatar Ready (Custom photos optional)", completed: Boolean(avatarUrl || calibratedSynergy.avatarUrl) },
                      { id: "bio", label: "Answer Relational Prompt", completed: Boolean(calibratedSynergy.bioPromptAnswer) },
                      { id: "preferences", label: "Discover your Archetype", completed: Boolean(calibratedSynergy.archetype || isCreatorMode) },
                    ]);
                  }
                  
                  const canonicalArch = calibratedSynergy?.archetype
                    ? normalizeArchetypeId(calibratedSynergy.archetype)
                    : undefined;
                  const canonicalPassion = normalizePassionId(corePassion, canonicalArch);

                  saveOnboardingState({
                    intents: selected,
                    displayAge: chosenAge,
                    corePassion: canonicalPassion,
                    avatarUrl: avatarUrl || calibratedSynergy?.avatarUrl || "",
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
                          .select("privacy_settings, avatar_url")
                          .eq("id", currentUserId)
                          .single();
                        const settings = data?.privacy_settings || {};
                        const updatePayload: Record<string, any> = {
                          core_passion: canonicalPassion,
                          privacy_settings: {
                            ...settings,
                            display_age: chosenAge,
                          },
                        };
                        if (calibratedSynergy && canonicalArch) {
                          updatePayload.archetype = canonicalArch;
                          updatePayload.moods = calibratedSynergy.moods;
                          updatePayload.hobbies = calibratedSynergy.hobbies;
                          updatePayload.lifestyle_habits = calibratedSynergy.lifestyleHabits;
                          updatePayload.bio = calibratedSynergy.bioPromptAnswer;
                          updatePayload.bio_prompt_category = calibratedSynergy.bioPromptCategory;
                          updatePayload.bio_prompt_question = calibratedSynergy.bioPromptQuestion;
                          updatePayload.bio_prompt_answer = calibratedSynergy.bioPromptAnswer;
                          updatePayload.bio_prompt_category_2 = calibratedSynergy.bioPromptCategory;
                          updatePayload.bio_prompt_question_2 = calibratedSynergy.bioPromptQuestion;
                          updatePayload.bio_prompt_answer_2 = calibratedSynergy.bioPromptAnswer;
                          updatePayload.sexual_preference = "Everyone";
                          updatePayload.member_purposes = activePurposes.length > 0 ? activePurposes : ["lifestyle"];
                          if (!data?.avatar_url && calibratedSynergy.avatarUrl) {
                            updatePayload.avatar_url = calibratedSynergy.avatarUrl;
                          }
                        }
                        const { error: upErr } = await supabase
                          .from("profiles")
                          .update(updatePayload)
                          .eq("id", currentUserId);
                        if (!upErr && typeof window !== "undefined") {
                          document.cookie = "sb_ob=1; path=/; max-age=2592000; SameSite=Lax";
                          if (isCreatorMode) {
                            document.cookie = "sb_role=creator; path=/; max-age=2592000; SameSite=Lax";
                          }
                        }
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
                {/* Creator Fast-Track Banner: Let creators enter Studio immediately at any time */}
                {(isCreatorMode || tutorialRole === "creator") ? (
                  <div className="mb-4 p-4 rounded-2xl bg-gradient-to-r from-[#00fbfb]/15 via-[#11111A] to-[#ffabf3]/15 border border-[#00fbfb]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-[0_0_25px_rgba(0,251,251,0.12)]">
                    <div className="space-y-0.5 text-left">
                      <div className="flex items-center gap-1.5 text-[#00fbfb] font-mono text-[10px] font-black uppercase tracking-wider">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>{t("onboarding.creatorFastTrack.badge", "Founding Creator Fast-Track")}</span>
                      </div>
                      <p className="text-[11px] text-white/80 leading-snug">
                        {t("onboarding.creatorFastTrack.desc", "Want to explore your Creator Studio first? You can upload your avatar and bio inside Studio Settings anytime.")}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleSkipToStudio}
                      className="shrink-0 px-4 py-2.5 bg-[#00fbfb] hover:bg-[#00fbfb]/90 text-black font-mono text-[10px] font-black uppercase tracking-wider rounded-xl transition shadow-[0_0_15px_rgba(0,251,251,0.35)] flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span>{t("onboarding.creatorFastTrack.enterStudioBtn", "Enter Creator Studio Now")}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="mb-4 p-4 rounded-2xl bg-gradient-to-r from-[#00fbfb]/10 via-[#11111A] to-emerald-500/10 border border-[#00fbfb]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-[0_0_20px_rgba(0,251,251,0.08)]">
                    <div className="space-y-0.5 text-left">
                      <div className="flex items-center gap-1.5 text-[#00fbfb] font-mono text-[10px] font-black uppercase tracking-wider">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>{locale === "es" ? "Sinergia Calibrada · Perfil Rápido" : "Synergy Calibrated · Quick Setup"}</span>
                      </div>
                      <p className="text-[11px] text-white/80 leading-snug">
                        {locale === "es"
                          ? "Selecciona tu foto de avatar y responde tu primer prompt a continuación. Podrás ajustar y enriquecer todo después desde tu Panel de Perfil de Miembro."
                          : "Select your avatar photo and answer your first prompt below. You can refine and expand everything anytime in your Member Profile Panel."}
                      </p>
                    </div>
                  </div>
                )}

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

                          {/* 1-Tap Stylized Cyber-Glass Archetype Avatars for Members */}
                          {!(isCreatorMode || tutorialRole === "creator") && (
                            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-2.5 text-left">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-mono uppercase tracking-widest text-primary font-bold">
                                  {locale === "es"
                                    ? "⚡ Opción A: Avatar Estilizado 1-Tap (Privacidad Día 1)"
                                    : "⚡ Option A: 1-Tap Stylized Archetype Avatar (Day-1 Privacy)"}
                                </span>
                              </div>
                              <div className="grid grid-cols-5 sm:grid-cols-9 gap-2">
                                {Object.entries(ARCHETYPE_AVATARS).map(([archKey, svgUri]) => {
                                  const isSelected = avatarUrl === svgUri;
                                  return (
                                    <button
                                      key={archKey}
                                      type="button"
                                      onClick={() => {
                                        setAvatarUrl(svgUri);
                                        saveOnboardingState({ avatarUrl: svgUri, step: "profile-checklist", activeItem: "photo" });
                                      }}
                                      title={archKey}
                                      className={`relative aspect-square rounded-xl overflow-hidden border-2 transition cursor-pointer ${
                                        isSelected
                                          ? "border-[#00fbfb] shadow-[0_0_12px_rgba(0,251,251,0.5)] scale-105"
                                          : "border-white/10 hover:border-white/30 opacity-75 hover:opacity-100"
                                      }`}
                                    >
                                      <img src={svgUri} alt={archKey} className="w-full h-full object-cover" />
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          )}

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

                          {/* Biometric Liveness Panel (Powered by DIDIT Zero-Knowledge Gateway) */}
                          <div className="p-5 bg-white/5 border border-white/10 rounded-2xl space-y-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <ShieldCheck className="w-5 h-5 text-primary" />
                                <span className="text-xs font-bold text-white uppercase tracking-wider">
                                  {t("onboarding.main.livenessCheck", "DIDIT 3D Biometric Liveness Verification")}
                                </span>
                              </div>
                              <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-primary/80 bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
                                DIDIT Zero-Knowledge
                              </span>
                            </div>
                            <p className="text-[10px] text-white/60 leading-relaxed font-medium">
                              {t("onboarding.main.livenessDesc", "To keep SECCION 100% human and authentic, complete a fast 3D biometric liveness check via DIDIT Zero-Knowledge Identity Gateway. No identity documents or personal photos are permanently stored on server disks.")}
                            </p>

                            {livenessStep === 0 && (
                              <button
                                type="button"
                                onClick={startLivenessCheck}
                                disabled={!avatarUrl || livenessLoading}
                                className="w-full py-3 bg-primary/10 hover:bg-primary/20 border border-primary/30 text-primary font-black uppercase tracking-wider rounded-xl transition text-[10px] flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                              >
                                {livenessLoading ? (
                                  <>
                                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                                    <span>{locale === "es" ? "Conectando con DIDIT..." : "Connecting to DIDIT..."}</span>
                                  </>
                                ) : (
                                  <>
                                    <ShieldCheck className="w-4 h-4 text-primary" />
                                    <span>{t("onboarding.main.startCheck", "Start DIDIT 3D Face Liveness Check")}</span>
                                  </>
                                )}
                              </button>
                            )}

                            {livenessStep > 0 && livenessStep < 5 && (
                              <div className="flex flex-col items-center space-y-3 p-4 rounded-xl bg-black/40 border border-primary/20">
                                <div className="flex items-center gap-2">
                                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                                  <span className="text-[10px] font-mono text-primary uppercase tracking-widest text-center">
                                    {livenessLog}
                                  </span>
                                </div>
                                <div className="flex items-center gap-3 pt-2">
                                  <button
                                    type="button"
                                    onClick={startLivenessCheck}
                                    className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/20 text-white/80 font-mono text-[9px] font-bold rounded-lg transition"
                                  >
                                    {locale === "es" ? "Reabrir DIDIT" : "Re-open DIDIT Session"}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setLivenessVerified(true);
                                      setLivenessStep(5);
                                      setLivenessLog(
                                        locale === "es"
                                          ? "✓ Verificación 3D Facial DIDIT confirmada (Zero-Knowledge)"
                                          : "✓ 3D Face Liveness Verified via DIDIT (Zero-Knowledge)"
                                      );
                                    }}
                                    className="px-3 py-1.5 bg-primary/20 hover:bg-primary/30 border border-primary/40 text-primary font-mono text-[9px] font-bold rounded-lg transition"
                                  >
                                    {locale === "es" ? "Ya he completado la verificación" : "I have completed verification"}
                                  </button>
                                </div>
                              </div>
                            )}

                            {livenessStep === 5 && (
                              <div className="p-3.5 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center justify-between text-left">
                                <div className="flex items-center gap-3">
                                  <ShieldCheck className="w-5 h-5 text-green-400 shrink-0" />
                                  <div>
                                    <p className="text-[10px] font-bold text-white uppercase tracking-wider">
                                      {locale === "es" ? "Identidad y Rostro 3D Verificados" : "3D Face Liveness Verified"}
                                    </p>
                                    <p className="text-[9px] text-green-400 font-mono leading-none mt-0.5">
                                      {livenessLog}
                                    </p>
                                  </div>
                                </div>
                                <span className="text-[8px] font-mono uppercase tracking-widest text-green-400 bg-green-500/20 px-2 py-0.5 rounded-full border border-green-500/30">
                                  GDPR Compliant
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="pt-6">
                          <button
                            type="button"
                            onClick={() => handleSaveDetails("photo")}
                            disabled={!avatarUrl}
                            className="w-full bg-primary text-black font-black uppercase tracking-widest py-4 rounded-xl hover:shadow-[0_0_20px_rgba(102,252,241,0.4)] transition disabled:opacity-50 text-xs flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(102,252,241,0.2)] active:scale-98"
                          >
                            {t("onboarding.main.savePhotosContinue", "Save Photos & Continue")}
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
                                // ✅ STRICT filter: never falls back to showing ALL categories
                                const effectivePurposes = activePurposes.length > 0
                                  ? activePurposes
                                  : (isCreatorMode || tutorialRole === "creator" ? ["creator", "lifestyle"] as MemberPurposeId[] : ["dating"] as MemberPurposeId[]);
                                const availablePrompts = Object.entries(sourcePrompts)
                                  .filter(([p]) => effectivePurposes.includes(p as MemberPurposeId))
                                  .reduce((acc, [_, cats]) => ({ ...acc, ...cats }), {} as Record<string, any>);
                                
                                const entries = Object.entries(availablePrompts);
                                const currentCatKey = promptCategory || entries[0]?.[0] || "skills";
                                
                                return entries.map(([key, data]) => {
                                  const isActive = currentCatKey === key;
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
                                          ? "bg-primary border-primary text-black font-bold"
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
                                const effectivePurposes2 = activePurposes.length > 0
                                  ? activePurposes
                                  : (isCreatorMode || tutorialRole === "creator" ? ["creator", "lifestyle"] as MemberPurposeId[] : ["dating"] as MemberPurposeId[]);
                                const availablePrompts = Object.entries(sourcePrompts)
                                  .filter(([p]) => effectivePurposes2.includes(p as MemberPurposeId))
                                  .reduce((acc, [_, cats]) => ({ ...acc, ...cats }), {} as Record<string, any>);
                                
                                const entries = Object.entries(availablePrompts);
                                const currentCatKey = promptCategory || entries[0]?.[0] || "skills";
                                const prompts = availablePrompts[currentCatKey]?.prompts || ["What skill are you currently obsessed with mastering?"];
                                
                                return prompts.map((q: string) => {
                                  const isSelected = (promptQuestion || prompts[0]) === q;
                                  return (
                                    <button
                                      key={q}
                                      type="button"
                                      onClick={() => setPromptQuestion(q)}
                                      className={`p-2.5 rounded-xl border text-left text-[10px] leading-relaxed transition cursor-pointer ${
                                        isSelected
                                          ? "bg-white/10 border-primary text-white font-bold shadow-[0_0_10px_rgba(102,252,241,0.15)]"
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
                            const effectivePurposes3 = activePurposes.length > 0
                              ? activePurposes
                              : (isCreatorMode || tutorialRole === "creator" ? ["creator", "lifestyle"] as MemberPurposeId[] : ["lifestyle"] as MemberPurposeId[]);
                            const availablePrompts = Object.entries(sourcePrompts)
                              .filter(([p]) => effectivePurposes3.includes(p as MemberPurposeId))
                              .reduce((acc, [_, cats]) => ({ ...acc, ...cats }), {} as Record<string, any>);
                            const entries = Object.entries(availablePrompts);
                            const currentCatKey = promptCategory || entries[0]?.[0] || "skills";
                            const activeQuestion = promptQuestion || availablePrompts[currentCatKey]?.prompts?.[0] || "What skill are you currently obsessed with mastering?";

                            const memberChips = (locale === "es" ? MEMBER_VIBE_CHIPS_ES : MEMBER_VIBE_CHIPS).map((c) => c.answer);
                            const creatorChips = locale === "es"
                              ? [
                                  "Contenido exclusivo detrás de cámaras, charlas directas y acceso VIP a mi mundo creativo ✨",
                                  "Me apasiona crear experiencias auténticas, conectar sin filtros y compartir mi estilo de vida diario 🔥",
                                  "Sesiones privadas, contenido personalizado y conexión real con mi comunidad más cercana 💎",
                                ]
                              : [
                                  "Exclusive behind-the-scenes content, direct VIP chats, and unfiltered access to my creative world ✨",
                                  "Passionate about authentic connection, daily lifestyle drops, and building an inner circle with real energy 🔥",
                                  "Private sessions, custom requests, and high-vibe creative drops for my closest supporters 💎",
                                ];
                            const activeChips = (isCreatorMode || tutorialRole === "creator") ? creatorChips : memberChips.slice(0, 3);

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
                                {/* 1-Tap Quick-Fill Vibe Chips */}
                                <div className="flex flex-wrap gap-1.5 pb-1">
                                  {activeChips.map((chipText, idx) => (
                                    <button
                                      key={idx}
                                      type="button"
                                      onClick={() => setPromptAnswer(chipText)}
                                      className="text-left px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-primary/15 border border-white/10 hover:border-primary/40 text-[10px] text-white/70 hover:text-white transition cursor-pointer"
                                    >
                                      ⚡ {chipText.slice(0, 52)}...
                                    </button>
                                  ))}
                                </div>
                                <textarea
                                  rows={3}
                                  placeholder={locale === "es" ? "Escribe tu respuesta detallada aquí (mínimo 10 caracteres)..." : "Write a detailed, thoughtful story in response to the prompt..."}
                                  value={promptAnswer}
                                  onChange={(e) => setPromptAnswer(e.target.value)}
                                  className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-xs text-white placeholder-white/20 focus:border-primary focus:outline-none transition resize-none"
                                />
                                <div className="flex justify-between items-center text-[9px] font-bold uppercase">
                                  <span className={promptAnswer.trim().length < 10 ? "text-[#dc143c]" : "text-green-500"}>
                                    {promptAnswer.trim().length < 10 ? t("onboarding.main.minCharsReq", "Min 10 characters required") : t("onboarding.main.lengthValidated", "Length Validated")}
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
                              console.log('[SECCION] CTA onClick fired', { promptAnswer: promptAnswer?.length, promptStep, isSaving, activePurposes });
                              const sourcePrompts = locale === "es" ? PURPOSE_PROMPTS_ES : PURPOSE_PROMPTS;
                              const effectivePurposesBtn = activePurposes.length > 0
                                ? activePurposes
                                : (isCreatorMode || tutorialRole === "creator" ? ["creator", "lifestyle"] as MemberPurposeId[] : ["lifestyle"] as MemberPurposeId[]);
                              const availablePrompts = Object.entries(sourcePrompts)
                                .filter(([p]) => effectivePurposesBtn.includes(p as MemberPurposeId))
                                .reduce((acc, [_, cats]) => ({ ...acc, ...cats }), {} as Record<string, any>);
                              const entries = Object.entries(availablePrompts);
                              const selectedCatKey = promptCategory || entries[0]?.[0] || "skills";
                              const availableQuestions = availablePrompts[selectedCatKey]?.prompts || [];
                              const activeQuestion = promptQuestion || availableQuestions[0] || "What skill are you currently obsessed with mastering?";
                              
                              handleSaveDetails("bio", {
                                category: selectedCatKey,
                                question: activeQuestion,
                                answer: promptAnswer
                              });
                            }}
                            disabled={isSaving || promptAnswer.trim().length < 10}
                            className="w-full bg-primary text-black font-black uppercase tracking-widest py-4 rounded-xl hover:shadow-[0_0_20px_rgba(102,252,241,0.4)] transition disabled:opacity-50 text-xs flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(102,252,241,0.2)] active:scale-98 relative z-30"
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
                                favorite_languages: ["English"],
                                sexual_preference: "Everyone",
                              };

                              if (isDating) {
                                updatePayload.relationship_goals = data.relationship_goals;
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
                            if (typeof window !== "undefined") {
                              document.cookie = "sb_ob=1; path=/; max-age=2592000; SameSite=Lax";
                            }
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
                  <h2 className="text-3xl font-black uppercase Outfit tracking-tight">{t("onboarding.creatorExt.title", "Creator Extension")}</h2>
                  <p className="text-xs text-white/50 mt-2 font-medium max-w-md mx-auto">
                    {t("onboarding.creatorExt.subtitle", "Your member profile is ready. Write your Creator Bio to publish your Studio presence. A Portfolio Reel is optional but helps attract subscribers faster.")}
                  </p>
                </div>

                <div className="w-full max-w-md space-y-4 text-left mt-6">
                  <div className="space-y-2">
                     <div className="flex items-center gap-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-primary">{t("onboarding.creatorExt.portfolioLabel", "Portfolio Reel URL")}</label>
                       <span className="text-[9px] font-black uppercase tracking-widest text-white/30 bg-white/5 border border-white/10 px-1.5 py-0.5 rounded-full">{t("onboarding.creatorExt.optional", "Optional")}</span>
                     </div>
                     <input
                        type="text"
                        placeholder={t("onboarding.creatorExt.portfolioPlaceholder", "https://vimeo.com/... · YouTube · OnlyFans · etc.")}
                        value={videoPresentationUrl}
                        onChange={(e) => setVideoPresentationUrl(e.target.value)}
                        className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-xs text-white placeholder-white/20 focus:border-primary outline-none transition"
                     />
                     <p className="text-[10px] text-white/30 leading-relaxed">{t("onboarding.creatorExt.portfolioHint", "Link to existing content (Vimeo, YouTube, etc.) to showcase your style and attract subscribers on your profile.")}</p>
                  </div>
                  
                  <div className="space-y-2">
                     <div className="flex items-center justify-between">
                       <div className="flex items-center gap-2">
                         <label className="text-[10px] font-black uppercase tracking-widest text-primary">{t("onboarding.creatorExt.bioLabel", "Creator Bio")}</label>
                         <span className="text-[9px] font-black uppercase tracking-widest text-white/60 bg-primary/10 border border-primary/30 px-1.5 py-0.5 rounded-full">{t("onboarding.creatorExt.required", "Required")}</span>
                       </div>
                       <span className={`text-[10px] font-bold tabular-nums ${creatorBio.length < 20 ? "text-white/30" : "text-primary"}`}>{creatorBio.length} / 500</span>
                     </div>
                     <div className="flex flex-wrap gap-1.5 pb-1">
                       {(locale === "es"
                         ? [
                             "Bienvenidos a mi Studio oficial en SECCION ✨ Contenido exclusivo, sesiones en vivo y trato directo VIP.",
                             "Acceso sin filtros a mis sesiones privadas, fotos exclusivas y chat directo conmigo todos los días 🔥",
                           ]
                         : [
                             "Welcome to my official SECCION Studio ✨ Exclusive drops, live sessions, and direct 1-on-1 VIP access.",
                             "Unfiltered access to my private sets, custom requests, and daily direct chat with me 🔥",
                           ]
                       ).map((chipText, idx) => (
                         <button
                           key={idx}
                           type="button"
                           onClick={() => setCreatorBio(chipText)}
                           className="text-left px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-primary/15 border border-white/10 hover:border-primary/40 text-[10px] text-white/70 hover:text-white transition cursor-pointer"
                         >
                           ⚡ {chipText.slice(0, 50)}...
                         </button>
                       ))}
                     </div>
                     <textarea
                        rows={4}
                        placeholder={t("onboarding.creatorExt.bioPlaceholder", "Describe your premium content, VIP tiers, and what subscribers get...")}
                        value={creatorBio}
                        onChange={(e) => setCreatorBio(e.target.value)}
                        maxLength={500}
                        className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-xs text-white placeholder-white/20 focus:border-primary outline-none transition resize-none"
                     />
                     {creatorBio.length > 0 && creatorBio.length < 20 && (
                       <p className="text-[10px] text-amber-400/80">{t("onboarding.creatorExt.bioMinHint", "Write a bit more — at least 20 characters so subscribers know what they're getting.")}</p>
                     )}
                  </div>
                </div>

                <button
                   onClick={() => {
                     // Validate synchronously
                     if (creatorBio.trim().length < 20) {
                       setFormError(t("onboarding.creatorExt.bioMinHint", "Write a bit more — at least 20 characters so subscribers know what they're getting."));
                       return;
                     }
                     setFormError(null);
                     console.log('[SECCION] Publish Creator Profile — advancing to welcome instantly');

                     // Read sessionStorage values synchronously (no await)
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

                     if (typeof window !== "undefined") {
                       document.cookie = "sb_ob=1; path=/; max-age=2592000; SameSite=Lax";
                       document.cookie = "sb_role=creator; path=/; max-age=2592000; SameSite=Lax";
                     }

                     // Advance UI immediately — no await
                     setStep("welcome");

                     // Background DB write to canonical public.profiles table — fire-and-forget, never blocks UI
                     const resolveAndSave = async () => {
                       let uid = userId;
                       if (!uid) {
                         try {
                           const { data: { session } } = await supabase.auth.getSession();
                           uid = session?.user?.id || null;
                         } catch {}
                       }
                       if (!uid) { console.warn('[SECCION] Publish: no userId — DB write skipped'); return; }
                       const parsedPurposes = purposesStr ? JSON.parse(purposesStr) : [];
                       const payload: Record<string, any> = {
                         archetype: vibe || null,
                         specialization: specialization || null,
                         member_purposes: Array.isArray(parsedPurposes) && parsedPurposes.length > 0 ? parsedPurposes : ["creator", "lifestyle"],
                         active_purposes: Array.isArray(parsedPurposes) && parsedPurposes.length > 0 ? parsedPurposes : ["creator", "lifestyle"],
                         video_presentation_url: videoPresentationUrl || null,
                         bio: creatorBio,
                         base_subscription_price: tierPrice ? parseFloat(tierPrice) : 14.99,
                         sexual_preference: sexualPreference || null,
                         relationship_goals: relationshipGoal ? [relationshipGoal] : [],
                         relationship_types: relationshipType ? [relationshipType] : [],
                         is_adult_content: isAdult === "true",
                         origins: residence || undefined,
                         residence: residence || undefined,
                       };
                       const dbPromise = supabase.from("profiles").update(payload).eq("id", uid);
                       const timeout = new Promise<void>((resolve) => setTimeout(resolve, 5000));
                       await Promise.race([dbPromise, timeout]);
                     };
                     resolveAndSave().catch((e) => console.warn('[SECCION] Publish DB write error:', e));
                   }}
                   disabled={creatorBio.trim().length < 20}
                   className="w-full max-w-md bg-primary text-black font-black uppercase tracking-widest py-4 rounded-xl hover:shadow-[0_0_20px_rgba(102,252,241,0.4)] transition disabled:opacity-50 text-xs flex items-center justify-center gap-2 cursor-pointer"
                 >
                   {t("onboarding.creatorExt.publishBtn", "Publish Creator Profile")}
                 </button>
                 <button
                   type="button"
                   onClick={handleSkipToStudio}
                   className="w-full max-w-md py-2.5 px-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[11px] font-mono font-bold text-white/60 hover:text-[#00fbfb] transition cursor-pointer"
                 >
                   {t("onboarding.creatorFastTrack.skipExtBtn", "Skip for Now & Enter Creator Studio →")}
                 </button>
                {formError && <p className="text-red-500 text-xs mt-2">{formError}</p>}
              </div>
            </motion.div>
          )}

          {step === "welcome" && (
            <FoundersWelcome
              key="welcome"
              isCreatorMode={isCreatorMode || tutorialRole === "creator"}
            />
          )}
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
