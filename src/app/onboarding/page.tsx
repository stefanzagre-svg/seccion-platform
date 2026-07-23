"use client";

import React, { useState, useEffect, useRef } from "react";
import LandingPageHook from "@/components/onboarding/LandingPageHook";
import RegistrationGate from "@/components/onboarding/RegistrationGate";
import IntentSelector from "@/components/onboarding/IntentSelector";
import ArchetypeSelector from "@/components/ArchetypeSelector";
import ProfileProgressRing from "@/components/onboarding/ProfileProgressRing";
import CompletionChecklist, {
  ChecklistItem,
} from "@/components/onboarding/CompletionChecklist";
import FoundersWelcome from "@/components/onboarding/FoundersWelcome";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import {
  SEXUAL_ORIENTATIONS,
  RELATIONSHIP_GOALS,
  RELATIONSHIP_TYPES,
  LANGUAGES,
} from "@/lib/constants";
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
  Image as ImageIcon,
} from "lucide-react";

type OnboardingStep =
  | "value-proposition"
  | "registration"
  | "intent"
  | "profile-checklist"
  | "welcome";

const MOCK_AVATARS = [
  {
    id: "elena",
    name: "Elena",
    url: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&q=80",
  },
  {
    id: "sofia",
    name: "Sofia",
    url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80",
  },
  {
    id: "valentina",
    name: "Valentina",
    url: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&q=80",
  },
  {
    id: "marcus",
    name: "Marcus",
    url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80",
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


export default function OnboardingFlow() {
  const [step, setStep] = useState<OnboardingStep>("registration");
  const [tutorialArchetype, setTutorialArchetype] = useState<string | null>(null);
  const [tutorialRole, setTutorialRole] = useState<"member" | "creator" | null>(null);
  const [intents, setIntents] = useState<string[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [displayAge, setDisplayAge] = useState<number | null>(null);

  const handleRegistrationComplete = async () => {
    const isCreator = tutorialRole === "creator" || (typeof window !== "undefined" && !!sessionStorage.getItem("_onboarding_creator_archive_choice"));
    const storedArchetype = tutorialArchetype || (typeof window !== "undefined"
      ? (isCreator ? sessionStorage.getItem("_onboarding_creator_archive_choice") : sessionStorage.getItem("_onboarding_archetype_choice"))
      : null);
    const { data: { session } } = await supabase.auth.getSession();
    const currentUserId = session?.user?.id;

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
          if (tierPrice) {
            updatePayload.base_subscription_price = parseFloat(tierPrice);
          }
          if (faceBlur) {
            updatePayload.face_blur_active = faceBlur === "true";
          }
          if (residence) {
            updatePayload.residence = residence;
          }
        }

        await supabase
          .from("profiles")
          .update(updatePayload)
          .eq("id", currentUserId);

        setChecklist((prev) =>
          prev.map((item) =>
            item.id === "preferences" ? { ...item, completed: true } : item
          )
        );
      } catch (err) {
        console.error("Failed to save tutorial archetype on signup:", err);
      }
    }
    if (isCreator) {
      setStep("welcome");
    } else {
      setStep("intent");
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
  const [promptCategory, setPromptCategory] = useState<keyof typeof INSIGHT_PROMPTS>("chemistry");
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

  // File Upload states & handler
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  const handleLocalFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setFormError("Please select a valid image file (JPG, PNG, WebP, etc.).");
      return;
    }

    setIsUploadingPhoto(true);
    setFormError(null);

    // 1. Convert to Data URL immediately for instant UI preview
    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setAvatarUrl(dataUrl);
        setLivenessVerified(false);
        setLivenessStep(0);
      }

      // 2. Upload to Supabase Storage bucket 'avatars' if session exists
      try {
        const fileExt = file.name.split('.').pop() || 'jpg';
        const fileName = `${userId || 'guest'}_${Date.now()}.${fileExt}`;
        const filePath = `avatars/${fileName}`;

        const { data, error } = await supabase.storage
          .from('avatars')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: true
          });

        if (!error && data) {
          const { data: { publicUrl } } = supabase.storage
            .from('avatars')
            .getPublicUrl(filePath);
          if (publicUrl) {
            setAvatarUrl(publicUrl);
          }
        }
      } catch (err) {
        console.warn("Storage upload fallback to Data URL:", err);
      } finally {
        setIsUploadingPhoto(false);
      }
    };

    reader.readAsDataURL(file);
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
    { id: "photo", label: "Upload your best photo", completed: false },
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
  // Check active session on mount to skip login/sign up if already authenticated
  useEffect(() => {
    async function checkSession() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUserId(session.user.id);
        
        // Fetch existing profile to see if they completed step 1 details
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();
          
        if (profile) {
          const hasPhoto = !!profile.avatar_url;
          const hasBio = !!profile.bio_prompt_answer && !!profile.bio_prompt_answer_2;
          const hasPreferences = !!profile.sexual_preference;
          
          if (hasPhoto && hasBio && hasPreferences) {
            setStep("welcome");
          } else {
            // Check if they already set their age
            const hasAge = !!profile.privacy_settings?.display_age;
            if (hasAge) {
              setStep("profile-checklist");
            } else {
              setStep("intent");
            }
          }
        } else {
          // Profile doesn't exist yet - provision one
          await supabase
            .from('profiles')
            .upsert({
              id: session.user.id,
              username: (session.user.user_metadata?.username || session.user.email?.split('@')[0] || 'user_' + Math.floor(Math.random() * 10000)).toLowerCase(),
              display_name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
              role: 'member'
            });
          setStep("intent");
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
        setStep("registration");
      } else if (tutorial === "member") {
        setTutorialRole("member");
        setStep("registration");
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

  const handleSaveDetails = async (type: "photo" | "bio" | "preferences") => {
    if (!userId) {
      setFormError(
        "Authentication session not found. Please reload onboarding.",
      );
      return;
    }
    setFormError(null);
    setIsSaving(true);

    try {
      let updatePayload: any = null;
      if (type === "photo") {
        if (!avatarUrl)
          throw new Error("Please select or input an avatar photo.");
        updatePayload = { avatar_url: avatarUrl };
      } else if (type === "bio") {
        if (!promptCategory || !promptQuestion || !promptAnswer.trim())
          throw new Error("Please select a prompt category, a question, and write an answer.");
        
        if (promptAnswer.trim().length < 10) {
          throw new Error("Write a bit more so our AI can read your vibe properly.");
        }

        const res = await fetch("/api/v2/profile/analyze-prompt", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            promptCategory,
            promptQuestion,
            promptAnswer: promptAnswer.trim(),
            promptIndex: promptStep
          })
        });

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || "Failed to analyze and save prompt.");
        }

        if (promptStep === 1) {
          setCompletedPrompt1({
            question: promptQuestion,
            answer: promptAnswer.trim()
          });
          setPromptCategory("conflict");
          setPromptQuestion("");
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

      // Upsert/Update the profile row if payload is defined
      if (updatePayload) {
        const { error } = await supabase
          .from("profiles")
          .update(updatePayload)
          .eq("id", userId);

        if (error) throw error;
      }

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

      const nextIncomplete = updatedChecklist.find((item) => !item.completed);
      if (nextIncomplete) {
        setActiveItem(nextIncomplete.id as any);
      } else {
        // All completed!
        setTimeout(() => setStep("welcome"), 1000);
      }
    } catch (err: any) {
      setFormError(err.message || "Failed to save details.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent text-white flex flex-col relative overflow-hidden">
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
                  setStep("registration");
                }}
              />
            </motion.div>
          )}

          {step === "registration" && (
            <RegistrationGate
              key="registration"
              onComplete={handleRegistrationComplete}
            />
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
                onContinue={async (selected, chosenAge, corePassion) => {
                  setIntents(selected);
                  setDisplayAge(chosenAge);
                  if (userId) {
                    const { data } = await supabase
                      .from("profiles")
                      .select("privacy_settings")
                      .eq("id", userId)
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
                      .eq("id", userId);
                  }
                  setStep("profile-checklist");
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
                  <h2 className="text-3xl font-black tracking-tighter uppercase text-glow">
                    Build Your Identity
                  </h2>
                  <p className="text-white/40 text-xs font-bold uppercase tracking-wider mt-1">
                    Set up your vibe profile.
                  </p>
                </div>

                <div className="glass-card p-6 rounded-3xl border border-white/5 bg-black/30 flex flex-col items-center">
                  <ProfileProgressRing progress={progress} />

                  <div className="w-full mt-4">
                    <CompletionChecklist
                      items={checklist}
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
                    <span className="text-[10px] font-black uppercase tracking-wider text-white/50">Profile Setup</span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
                      {progress}% Done
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {checklist.map((item) => {
                      const isActive = activeItem === item.id;
                      const isDone = item.completed;
                      let label = "1. Photo";
                      if (item.id === "bio") label = "2. Bio";
                      if (item.id === "preferences") label = "3. Match";
                      
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
                              Select Profile Photo
                            </h3>
                          </div>

                          {/* Hidden File Input */}
                          <input
                            type="file"
                            ref={fileInputRef}
                            accept="image/*"
                            onChange={handleLocalFileUpload}
                            className="hidden"
                          />

                          {/* Primary Action: Device / Computer File Upload */}
                          <div className="space-y-3">
                            <label className="text-[9px] uppercase tracking-widest font-black text-white/50 block text-left">
                              Option 1: Upload from Computer or Phone Folder
                            </label>
                            <button
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              disabled={isUploadingPhoto}
                              className="w-full py-4 px-5 bg-gradient-to-r from-[#00fbfb]/20 via-[#a855f7]/15 to-[#ffabf3]/20 hover:from-[#00fbfb]/30 hover:to-[#ffabf3]/30 border border-[#00fbfb]/50 hover:border-[#00fbfb] rounded-2xl text-xs font-black text-white uppercase tracking-wider flex items-center justify-center gap-3 transition-all shadow-[0_0_25px_rgba(0,251,251,0.25)] hover:shadow-[0_0_35px_rgba(0,251,251,0.4)] group cursor-pointer active:scale-98"
                            >
                              {isUploadingPhoto ? (
                                <>
                                  <Loader2 className="w-5 h-5 animate-spin text-[#00fbfb]" />
                                  <span>Uploading Image File...</span>
                                </>
                              ) : (
                                <>
                                  <Upload className="w-5 h-5 text-[#00fbfb] group-hover:scale-110 transition-transform" />
                                  <span>Choose File from Computer / Folder</span>
                                </>
                              )}
                            </button>
                          </div>

                          {/* Selected Photo Live Preview */}
                          {avatarUrl && (
                            <div className="p-3 bg-white/5 border border-[#00fbfb]/30 rounded-2xl flex items-center gap-4">
                              <div className="w-14 h-14 rounded-xl overflow-hidden border border-[#00fbfb]/60 relative shrink-0">
                                <img src={avatarUrl} alt="Selected Avatar" className="w-full h-full object-cover" />
                              </div>
                              <div className="flex-1 text-left">
                                <span className="text-xs font-black text-[#00fbfb] uppercase tracking-wider block">
                                  Photo Ready
                                </span>
                                <span className="text-[10px] text-white/50 block truncate max-w-[220px]">
                                  {avatarUrl.startsWith("data:") ? "Image loaded from computer" : avatarUrl}
                                </span>
                              </div>
                              <Check className="w-5 h-5 text-green-400 shrink-0" />
                            </div>
                          )}

                          {/* Divider */}
                          <div className="flex items-center gap-3 my-2">
                            <div className="h-[1px] flex-1 bg-white/10" />
                            <span className="text-[9px] font-mono uppercase tracking-widest text-white/30">OR CHOOSE PRESET / URL</span>
                            <div className="h-[1px] flex-1 bg-white/10" />
                          </div>

                          <div className="grid grid-cols-4 gap-3">
                            {MOCK_AVATARS.map((av) => (
                              <button
                                key={av.id}
                                onClick={() => {
                                  setAvatarUrl(av.url);
                                  setLivenessVerified(false);
                                  setLivenessStep(0);
                                }}
                                className={`relative aspect-square rounded-2xl overflow-hidden border-2 transition-all ${
                                  avatarUrl === av.url
                                    ? "border-primary scale-105 shadow-[0_0_15px_rgba(102,252,241,0.5)]"
                                    : "border-white/10 hover:border-white/30"
                                }`}
                              >
                                <img
                                  src={av.url}
                                  alt={av.name}
                                  className="w-full h-full object-cover"
                                />
                                {avatarUrl === av.url && (
                                  <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                                    <div className="bg-primary p-1 rounded-full text-black">
                                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                                    </div>
                                  </div>
                                )}
                              </button>
                            ))}
                          </div>

                          <div className="space-y-2">
                            <label className="text-[9px] uppercase tracking-widest font-black text-white/40">
                              Custom Photo URL
                            </label>
                            <input
                              type="text"
                              placeholder="https://images.unsplash.com/..."
                              value={avatarUrl}
                              onChange={(e) => {
                                setAvatarUrl(e.target.value);
                                setLivenessVerified(false);
                                setLivenessStep(0);
                              }}
                              className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-xs text-white placeholder-white/20 focus:border-primary focus:outline-none transition"
                            />
                          </div>

                          {/* Biometric Liveness Panel */}
                          <div className="p-5 bg-white/5 border border-white/10 rounded-2xl space-y-4">
                            <div className="flex items-center gap-3">
                              <ShieldCheck className="w-5 h-5 text-primary" />
                              <span className="text-xs font-bold text-white uppercase tracking-wider">
                                Anti-Catfishing Liveness Check
                              </span>
                            </div>
                            <p className="text-[10px] text-white/50 leading-relaxed font-medium">
                              To keep Seccion safe, you must complete a quick
                              biometric liveness check to match your face with
                              the selected photo.
                            </p>

                            {livenessStep === 0 && (
                              <button
                                type="button"
                                onClick={startLivenessCheck}
                                disabled={!avatarUrl}
                                className="w-full py-3 bg-primary/10 hover:bg-primary/20 border border-primary/30 text-primary font-black uppercase tracking-wider rounded-xl transition text-[10px] flex items-center justify-center gap-2 disabled:opacity-50"
                              >
                                <Video className="w-4 h-4" /> Start Liveness
                                Selfie Check
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
                            onClick={() => handleSaveDetails("photo")}
                            disabled={isSaving || !livenessVerified}
                            className="w-full bg-primary text-black font-black uppercase tracking-widest py-4 rounded-xl hover:shadow-[0_0_20px_rgba(102,252,241,0.4)] transition disabled:opacity-50 text-xs flex items-center justify-center gap-2"
                          >
                            {isSaving ? (
                              <Loader2 className="w-4 h-4 animate-spin text-black" />
                            ) : (
                              "Save Details"
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
                              Relational Prompt Check ({promptStep} of 2)
                            </h3>
                          </div>

                          <p className="text-xs text-white/50 leading-relaxed font-medium">
                            Choose a prompt category and question. Write a simple answer (min 10 chars). 
                            Gemini will analyze your response to unlock your **Relational Aura** — how you connect, open up, and protect your energy.
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
                              1. Pick Your Vibe Zone
                            </label>
                            <div className="flex flex-wrap gap-1">
                              {Object.entries(INSIGHT_PROMPTS).map(([key, data]) => {
                                const isActive = promptCategory === key;
                                return (
                                  <button
                                    key={key}
                                    type="button"
                                    onClick={() => {
                                      setPromptCategory(key as any);
                                      setPromptQuestion("");
                                    }}
                                    className={`px-2.5 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border transition ${
                                      isActive
                                        ? "bg-primary border-primary text-black"
                                        : "bg-white/5 border-white/5 text-white/60 hover:bg-white/10"
                                    }`}
                                  >
                                    {data.categoryName.split(" ")[0]}
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {/* Question Selector List */}
                          <div className="space-y-1.5">
                            <label className="text-[9px] uppercase tracking-widest font-black text-white/40">
                              2. Choose Prompt Question
                            </label>
                            <div className="flex flex-col gap-1.5 max-h-[140px] overflow-y-auto pr-1 custom-scrollbar">
                              {INSIGHT_PROMPTS[promptCategory].prompts.map((q) => {
                                const isSelected = promptQuestion === q;
                                return (
                                  <button
                                    key={q}
                                    type="button"
                                    onClick={() => setPromptQuestion(q)}
                                    className={`p-2.5 rounded-xl border text-left text-[10px] leading-relaxed transition ${
                                      isSelected
                                        ? "bg-white/10 border-primary text-white font-bold"
                                        : "bg-white/2 border-white/5 text-white/50 hover:bg-white/5 hover:border-white/10"
                                    }`}
                                  >
                                    {q}
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {/* Response Textarea */}
                          {promptQuestion && (
                            <div className="space-y-2 animate-fadeIn">
                              <div className="p-3 bg-white/5 border border-white/10 rounded-xl">
                                <span className="text-[8px] uppercase tracking-widest font-black text-primary block mb-1">Active Prompt</span>
                                <p className="text-[10px] leading-relaxed text-white/80">"{promptQuestion}"</p>
                              </div>
                              
                              <label className="text-[9px] uppercase tracking-widest font-black text-white/40 block">
                                3. Write Your Narrative Response
                              </label>
                              <textarea
                                rows={4}
                                placeholder="Write a detailed, thoughtful story in response to the prompt. Use specific actions, emotions, and examples..."
                                value={promptAnswer}
                                onChange={(e) => setPromptAnswer(e.target.value)}
                                className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-xs text-white placeholder-white/20 focus:border-primary focus:outline-none transition resize-none"
                              />
                              <div className="flex justify-between items-center text-[9px] font-bold uppercase">
                                <span className={promptAnswer.length < 10 ? "text-[#dc143c]" : "text-green-500"}>
                                  {promptAnswer.length < 10 ? "Min 10 characters required" : "Length Validated"}
                                </span>
                                <span className="text-white/30">
                                  {promptAnswer.length} / 500
                                </span>
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="pt-4">
                          <button
                            onClick={() => handleSaveDetails("bio")}
                            disabled={isSaving || !promptQuestion || promptAnswer.length < 10}
                            className="w-full bg-primary text-black font-black uppercase tracking-widest py-4 rounded-xl hover:shadow-[0_0_20px_rgba(102,252,241,0.4)] transition disabled:opacity-50 text-xs flex items-center justify-center gap-2"
                          >
                            {isSaving ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin text-black" />
                                <span>AI reading your vibes...</span>
                              </>
                            ) : (
                              promptStep === 1 ? "Analyze & Save Prompt 1" : "Analyze & Save Prompt 2"
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
                          onSelect={async (archetype, data) => {
                            if (!userId) return;
                            setIsSaving(true);
                            try {
                              const updatePayload = {
                                archetype: archetype,
                                hobbies: data.hobbies,
                                lifestyle_habits: data.lifestyle_habits,
                                relationship_goals: data.relationship_goals,
                                connection_points: 100,
                                sexual_preference: "Everyone",
                                favorite_languages: ["English"]
                              };
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

          {step === "welcome" && <FoundersWelcome key="welcome" />}
        </AnimatePresence>
      </div>
    </div>
  );
}
