"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import PublicNavbar from "../PublicNavbar";
import PublicFooter from "@/components/PublicFooter";
import { useTranslation } from "@/context/LanguageContext";
import { supabase } from "@/lib/supabase";

const LaserLinesSVG = () => (
  <svg
    className="absolute w-full h-full opacity-90 hidden md:block"
    viewBox="0 0 1440 1024"
    preserveAspectRatio="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <filter id="g-laser-glow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="8" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
      <filter id="g-electric-glow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="4" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="blur" />
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
    <g>
      {/* Line 1 — Cyan Main */}
      <g style={{ animation: "float-laser 10s ease-in-out infinite" }}>
        <path
          d="M 1100, 100 C 500,-100 300,400 800,500 C 1300,600 1100,1100 500,900"
          fill="none"
          stroke="#00fbfb"
          strokeWidth="3"
          filter="url(#g-laser-glow)"
          opacity="0.5"
        />
        <path
          d="M 1100, 100 C 500,-100 300,400 800,500 C 1300,600 1100,1100 500,900"
          fill="none"
          stroke="#ffffff"
          strokeWidth="4"
          strokeLinecap="round"
          filter="url(#g-electric-glow)"
          style={{
            strokeDasharray: "250 3000",
            strokeDashoffset: 3250,
            animation: "electric-pulse 3.5s linear infinite 0s",
          }}
        />
      </g>
      {/* Line 2 — Pink Inner */}
      <g style={{ animation: "float-laser 12s ease-in-out infinite reverse" }}>
        <path
          d="M 1050, 150 C 450,-50 250,450 750,550 C 1250,650 1050,1150 450,950"
          fill="none"
          stroke="#ffabf3"
          strokeWidth="1.5"
          filter="url(#g-laser-glow)"
          opacity="0.6"
        />
        <path
          d="M 1050, 150 C 450,-50 250,450 750,550 C 1250,650 1050,1150 450,950"
          fill="none"
          stroke="#ffffff"
          strokeWidth="3"
          strokeLinecap="round"
          filter="url(#g-electric-glow)"
          style={{
            strokeDasharray: "150 2500",
            strokeDashoffset: 2650,
            animation: "electric-pulse 4.2s linear infinite 1.2s",
          }}
        />
      </g>
      {/* Line 3 — Deep Purple Outer */}
      <g style={{ animation: "float-laser 15s ease-in-out infinite" }}>
        <path
          d="M 1150, 50 C 550,-150 350,350 850,450 C 1350,550 1150,1050 550,850"
          fill="none"
          stroke="#fe00fe"
          strokeWidth="2.5"
          filter="url(#g-laser-glow)"
          opacity="0.5"
        />
        <path
          d="M 1150, 50 C 550,-150 350,350 850,450 C 1350,550 1150,1050 550,850"
          fill="none"
          stroke="#ffabf3"
          strokeWidth="4"
          strokeLinecap="round"
          filter="url(#g-electric-glow)"
          style={{
            strokeDasharray: "300 3500",
            strokeDashoffset: 3800,
            animation: "electric-pulse 5.5s linear infinite 0.5s",
          }}
        />
      </g>
    </g>
  </svg>
);

type InterestKey =
  | "education"
  | "romance"
  | "entertainment"
  | "culinary"
  | "fitness"
  | "aitech";

const PORTRAITS = {
  liam: "/assets/landing/liam.jpg",
  elena: "/assets/landing/elena.jpg",
  marco: "/assets/landing/marco.jpg",
  sofia: "/assets/landing/sofia.jpg",
  kai: "/assets/landing/kai.jpg",
  valeria: "/assets/landing/valeria.jpg",
  david: "/assets/landing/david.jpg",
  sarah: "/assets/landing/sarah.jpg",
};

interface ConnectPreviewData {
  leftImg: string;
  rightImg: string;
  pairTitle: string;
  leftPillEn: string;
  leftPillEs: string;
  rightPillEn: string;
  rightPillEs: string;
  subEn: string;
  subEs: string;
}

const INTEREST_CONNECT_MAP: Record<InterestKey, ConnectPreviewData> = {
  education: {
    leftImg: PORTRAITS.kai,
    rightImg: PORTRAITS.elena,
    pairTitle: "Kai & Elena",
    leftPillEn: "💻 AI Tech",
    leftPillEs: "💻 IA Tech",
    rightPillEn: "🎓 Student · Tech",
    rightPillEs: "🎓 Interés Tech",
    subEn: "💻 AI Tech ↔ 🎓 Student Interested in Tech",
    subEs: "💻 IA Tech ↔ 🎓 Estudiante Interesada en Tech",
  },
  romance: {
    leftImg: PORTRAITS.liam,
    rightImg: PORTRAITS.elena,
    pairTitle: "Liam & Elena",
    leftPillEn: "🎸 Acoustic",
    leftPillEs: "🎸 Acústico",
    rightPillEn: "🎵 Music Fan",
    rightPillEs: "🎵 Música",
    subEn: "🎸 Acoustic Guitar ↔ 🎵 Live Music & Travel",
    subEs: "🎸 Guitarra Acústica ↔ 🎵 Música y Viajes",
  },
  entertainment: {
    leftImg: PORTRAITS.david,
    rightImg: PORTRAITS.sarah,
    pairTitle: "David & Sarah",
    leftPillEn: "🎹 Live Host",
    leftPillEs: "🎹 Host Live",
    rightPillEn: "🎬 Streamer",
    rightPillEs: "🎬 Streamer",
    subEn: "🎹 Lounge Host ↔ 🎬 Co-Stream & Nightlife",
    subEs: "🎹 Host en Vivo ↔ 🎬 Co-Stream y Noche",
  },
  culinary: {
    leftImg: PORTRAITS.marco,
    rightImg: PORTRAITS.elena,
    pairTitle: "Marco & Elena",
    leftPillEn: "👨‍🍳 Italian Chef",
    leftPillEs: "👨‍🍳 Chef Italiano",
    rightPillEn: "🍝 Foodie",
    rightPillEs: "🍝 Foodie",
    subEn: "👨‍🍳 Italian Chef ↔ 🍝 Learning Pasta & Wine",
    subEs: "👨‍🍳 Chef Italiano ↔ 🍝 Aprender Pasta y Vino",
  },
  fitness: {
    leftImg: PORTRAITS.liam,
    rightImg: PORTRAITS.sarah,
    pairTitle: "Liam & Sarah",
    leftPillEn: "🏋️ Coach",
    leftPillEs: "🏋️ Coach",
    rightPillEn: "🔥 Into Fitness",
    rightPillEs: "🔥 Interés Fitness",
    subEn: "🏋️ Fitness Coach ↔ 🔥 Member in Fitness",
    subEs: "🏋️ Coach Fitness ↔ 🔥 Miembro Fitness",
  },
  aitech: {
    leftImg: PORTRAITS.kai,
    rightImg: PORTRAITS.elena,
    pairTitle: "Kai & Elena",
    leftPillEn: "💻 AI Tech",
    leftPillEs: "💻 IA Tech",
    rightPillEn: "🎓 Student · Tech",
    rightPillEs: "🎓 Interés Tech",
    subEn: "💻 AI Tech ↔ 🎓 Student Interested in Tech",
    subEs: "💻 IA Tech ↔ 🎓 Estudiante Interesada en Tech",
  },
};

const EXTRA_INTERESTS: Array<{ labelEn: string; labelEs: string; key: InterestKey }> = [
  { labelEn: "🎵 Live Music & Acoustic", labelEs: "🎵 Música en Vivo y Acústico", key: "entertainment" },
  { labelEn: "✈️ World Travel & Adventure", labelEs: "✈️ Viajes y Aventura", key: "romance" },
  { labelEn: "🗣️ Language Exchange", labelEs: "🗣️ Intercambio de Idiomas", key: "education" },
  { labelEn: "🌿 Breathwork & Mindset", labelEs: "🌿 Breathwork y Mindfulness", key: "fitness" },
  { labelEn: "👗 Fashion & Fit Checks", labelEs: "👗 Moda y Fit Checks", key: "entertainment" },
  { labelEn: "💄 Makeup & Skincare", labelEs: "💄 Maquillaje y Skincare", key: "entertainment" },
  { labelEn: "💰 Economy & Wealth", labelEs: "💰 Economía y Patrimonio", key: "aitech" },
  { labelEn: "🎮 Co-Op Gaming & Esports", labelEs: "🎮 Gaming Co-Op y Esports", key: "entertainment" },
  { labelEn: "🎨 Visual Art & Photography", labelEs: "🎨 Arte Visual y Fotografía", key: "education" },
  { labelEn: "🥂 Nightlife & Dancing", labelEs: "🥂 Vida Nocturna y Baile", key: "romance" },
  { labelEn: "🚀 Startups & Networking", labelEs: "🚀 Startups y Networking", key: "aitech" },
  { labelEn: "🔞 18+ Sensual & VIP", labelEs: "🔞 18+ Sensual y VIP", key: "romance" },
];

export default function LandingPageHook({
  onAccept,
}: {
  onAccept: () => void;
  onBecomeCreator: () => void;
}) {
  const router = useRouter();
  const { t, locale } = useTranslation();

  // 1st position is Learn / Teach Skills ('education'); 2nd position is Romance & Chemistry ('romance')
  const [selectedInterest, setSelectedInterest] = useState<InterestKey>("education");
  const [showDiscoverText, setShowDiscoverText] = useState(false);
  const [studioBlurred, setStudioBlurred] = useState(false);

  // Registration Role Toggle: 'member' vs 'creator'
  const [regRole, setRegRole] = useState<"member" | "creator">("member");
  const [emailInput, setEmailInput] = useState("");
  const [isOAuthLoading, setIsOAuthLoading] = useState<"google" | "twitter" | null>(null);

  const activeConnect = INTEREST_CONNECT_MAP[selectedInterest] || INTEREST_CONNECT_MAP.education;
  const isCreatorRole = regRole === "creator";

  const persistRoleSelection = (role: "member" | "creator") => {
    if (typeof window === "undefined") return;
    if (role === "creator") {
      sessionStorage.setItem("_onboarding_creator_archive_choice", "creator");
      localStorage.setItem("is_creator_signup", "true");
    } else {
      sessionStorage.removeItem("_onboarding_creator_archive_choice");
      localStorage.removeItem("is_creator_signup");
    }
  };

  const handleRoleToggle = (role: "member" | "creator") => {
    setRegRole(role);
    persistRoleSelection(role);
  };

  const handleOAuthRegister = async (provider: "google" | "twitter") => {
    try {
      setIsOAuthLoading(provider);
      persistRoleSelection(regRole);
      const nextTarget = regRole === "creator" ? "/onboarding?role=creator" : "/onboarding?role=member";
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextTarget)}`,
        },
      });
      if (error) {
        router.push(nextTarget);
      }
    } catch {
      router.push(regRole === "creator" ? "/onboarding?role=creator" : "/onboarding?role=member");
    } finally {
      setIsOAuthLoading(null);
    }
  };

  const handleEmailRegister = (e: React.FormEvent) => {
    e.preventDefault();
    persistRoleSelection(regRole);
    const cleanEmail = emailInput.trim();
    const base = regRole === "creator" ? "/onboarding?role=creator" : "/onboarding?role=member";
    const target = cleanEmail ? `${base}&email=${encodeURIComponent(cleanEmail)}` : base;
    router.push(target);
  };

  const primaryInterests: Array<{ key: InterestKey; label: string }> = [
    { key: "education", label: t("landing.interestEducation", "🎓 Learn / Teach Skills") },
    { key: "romance", label: t("landing.interestRomance", "🩷 Romance & Chemistry") },
    { key: "entertainment", label: t("landing.interestEntertainment", "🎬 Entertainment & Live") },
    { key: "culinary", label: t("landing.interestCulinary", "👨‍🍳 Culinary & Wine") },
    { key: "fitness", label: t("landing.interestFitness", "🏋️ Fitness & Vitality") },
    { key: "aitech", label: t("landing.interestAiTech", "💻 AI, Tech & Business") },
  ];

  const storiesList: Array<{
    name: string;
    img: string;
    tag: string;
    isLive?: boolean;
    interestKey: InterestKey;
  }> = [
    { name: "Liam · 28", img: PORTRAITS.liam, tag: "🏋️ Fitness", interestKey: "fitness" },
    {
      name: "Elena · 25",
      img: PORTRAITS.elena,
      tag: locale === "es" ? "🎓 Interés Tech" : "🎓 Into Tech",
      interestKey: "aitech",
    },
    { name: "Marco · 31", img: PORTRAITS.marco, tag: "👨‍🍳 Chef", interestKey: "culinary" },
    {
      name: "Sofia · 24",
      img: PORTRAITS.sofia,
      tag: locale === "es" ? "● EN VIVO" : "● LIVE",
      isLive: true,
      interestKey: "entertainment",
    },
    {
      name: "Kai · 29",
      img: PORTRAITS.kai,
      tag: locale === "es" ? "💻 IA Tech" : "💻 AI Tech",
      interestKey: "aitech",
    },
    { name: "Valeria · 25", img: PORTRAITS.valeria, tag: "💎 Studio", interestKey: "education" },
    {
      name: "David · 30",
      img: PORTRAITS.david,
      tag: locale === "es" ? "💼 Negocios" : "💼 Business",
      interestKey: "aitech",
    },
    { name: "Sarah · 26", img: PORTRAITS.sarah, tag: "🔥 Fitness", interestKey: "fitness" },
  ];

  return (
    <div
      className="w-full min-h-screen text-[#f8fafc] overflow-x-hidden font-['Hanken_Grotesk'] relative flex flex-col isolate"
      style={{
        backgroundColor: "transparent",
        backgroundImage:
          "radial-gradient(circle at 18% 12%, rgba(255, 32, 78, 0.12), transparent 40%), radial-gradient(circle at 82% 18%, rgba(0, 251, 251, 0.12), transparent 42%), radial-gradient(circle at 50% 60%, rgba(255, 171, 243, 0.07), transparent 50%)",
      }}
    >
      {/* Background Laser Lines (Strictly Below Transparent Passions & Spheres Tabs & UI Content) */}
      <div className="hidden md:block absolute inset-0 overflow-hidden pointer-events-none z-0">
        <LaserLinesSVG />
      </div>

      {/* Untouched PublicNavbar with Official SECCION Wordmark & Mobile Menu */}
      <PublicNavbar onSignUp={onAccept} />

      {/* Main Mobile-First Option 2 Canvas */}
      <main className="relative z-10 flex-1 pt-28 sm:pt-32 pb-10 sm:pb-16 px-3.5 sm:px-6 md:px-12 lg:px-16 max-w-[1200px] w-full mx-auto flex flex-col justify-center">
        {/* Top Hero Header: Eyebrow + Headline + Non-Exhaustive Subtitle */}
        <div className="relative z-10 text-center max-w-3xl mx-auto mb-3 sm:mb-5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#090914]/75 backdrop-blur-md border border-[#00fbfb]/40 mb-2.5 shadow-[0_0_16px_rgba(0,251,251,0.15)]">
            <span className="w-2 h-2 rounded-full bg-[#00fbfb] shadow-[0_0_8px_#00fbfb] animate-pulse" />
            <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-[0.14em] text-white">
              {t("landing.eyebrowBadge", "MATCH PEOPLE WITH A NEXTGEN PLATFORM")}
            </span>
          </div>

          <h1 className="font-['Plus_Jakarta_Sans'] font-black text-[22px] xs:text-[25px] sm:text-4xl lg:text-[42px] leading-[1.14] tracking-[-0.02em] text-white mb-2">
            {t(
              "landing.heroTitleLead",
              "Connect by Shared Interests, Enlarge Your Circle & "
            )}
            <span className="bg-gradient-to-r from-[#00fbfb] via-[#ffabf3] to-[#fde68a] bg-clip-text text-transparent">
              {t("landing.heroTitleHighlight", "Learn or Teach Skills.")}
            </span>
          </h1>

          {/* Collapsible Discover + More Button for First-Sight Clarity */}
          <div className="flex flex-col items-center">
            <button
              type="button"
              onClick={() => setShowDiscoverText((prev) => !prev)}
              className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#090914]/75 backdrop-blur-md border border-white/15 hover:border-[#00fbfb] text-xs font-extrabold text-slate-200 hover:text-white transition cursor-pointer"
            >
              <span>{t("landing.discoverShortLabel", "✨ Discover")}</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-[#00fbfb]/15 text-[#00fbfb] border border-[#00fbfb]/40">
                {showDiscoverText
                  ? t("landing.discoverLessBtn", "Less ▴")
                  : t("landing.discoverMoreBtn", "More ▾")}
              </span>
            </button>

            {showDiscoverText && (
              <p className="mt-2 text-[12px] sm:text-[14px] leading-[1.45] text-slate-300 max-w-2xl mx-auto">
                {t(
                  "landing.heroSubtitle",
                  "Discover—with our integrated AI matchmaking assistant—real people who fit you best across 30+ passions & spheres (e.g., Romance, Entertainment, Lifestyle, Fitness, Culinary, Art, Education, Business & more)."
                )}
              </p>
            )}
          </div>
        </div>

        {/* Horizontally Scrollable Passions & Spheres Strip (Frosted Glass Above Laser Lines) */}
        <div className="relative z-10 w-full mb-3.5 sm:mb-5">
          <div
            onWheel={(e) => {
              if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
                e.currentTarget.scrollLeft += e.deltaY;
              }
            }}
            className="flex flex-nowrap items-center justify-start gap-1.5 sm:gap-2 overflow-x-auto overflow-y-hidden py-2 px-1.5"
            style={{
              scrollbarWidth: "thin",
              scrollbarColor: "rgba(0, 251, 251, 0.45) rgba(255, 255, 255, 0.04)",
            }}
          >
            {primaryInterests.map((item) => {
              const isActive = selectedInterest === item.key;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setSelectedInterest(item.key)}
                  className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] sm:text-xs font-bold leading-snug transition-all cursor-pointer select-none border-[1.5px] backdrop-blur-md ${
                    isActive
                      ? "bg-[#090914]/85 border-[#00fbfb] text-white shadow-[0_0_12px_rgba(0,251,251,0.25)]"
                      : "bg-[#090914]/70 border-white/15 text-slate-200 hover:bg-[#090914]/85 hover:border-[#00fbfb]/60 hover:text-white"
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
            {EXTRA_INTERESTS.map((extra, idx) => (
              <button
                key={`extra-${idx}`}
                type="button"
                onClick={() => setSelectedInterest(extra.key)}
                className="shrink-0 inline-flex items-center px-3 py-1.5 rounded-full text-[11px] sm:text-xs font-bold leading-snug bg-[#090914]/70 backdrop-blur-md border-[1.5px] border-white/15 text-slate-200 hover:bg-[#090914]/85 hover:border-[#00fbfb] hover:text-white transition cursor-pointer select-none"
              >
                {locale === "es" ? extra.labelEs : extra.labelEn}
              </button>
            ))}
          </div>
        </div>

        {/* Option 2 Grid: Left = Horizontally Scrollable Social Stories & 4 Photo Cards | Right = Registration Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-7 items-center w-full">
          {/* Left Column (7 cols on Desktop): Horizontally Scrollable Stories Ring Bar + 4 Visual Photo Cards */}
          <div className="lg:col-span-7 flex flex-col gap-2.5">
            {/* Horizontally Scrollable Live Human Stories Ring Bar */}
            <div
              onWheel={(e) => {
                if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
                  e.currentTarget.scrollLeft += e.deltaY;
                }
              }}
              className="flex flex-nowrap items-center justify-start gap-3 sm:gap-4 overflow-x-auto overflow-y-hidden py-1.5 px-1"
              style={{
                scrollbarWidth: "thin",
                scrollbarColor: "rgba(0, 251, 251, 0.45) rgba(255, 255, 255, 0.04)",
              }}
            >
              {storiesList.map((st, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedInterest(st.interestKey)}
                  className="flex flex-col items-center gap-1 shrink-0 cursor-pointer group"
                >
                  <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full p-[2px] bg-gradient-to-tr from-[#ff204e] via-[#ffabf3] to-[#00fbfb] group-hover:scale-105 transition-transform">
                    <img
                      src={st.img}
                      alt={st.name}
                      className="w-full h-full rounded-full object-cover border-2 border-[#07070F]"
                    />
                    <span
                      className={`absolute -bottom-1 left-1/2 -translate-x-1/2 px-1.5 py-[1px] rounded-full text-[8px] font-black whitespace-nowrap bg-[#0f172a] border ${
                        st.isLive
                          ? "text-[#ffabf3] border-[#ffabf3]/50"
                          : "text-[#00fbfb] border-[#00fbfb]/45"
                      }`}
                    >
                      {st.tag}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-200 mt-0.5">
                    {st.name}
                  </span>
                </button>
              ))}
            </div>

            {/* 4 Visual Photo Cards in a 2x2 Grid (Pills at the Very Bottom Edge to Leave Max Photo Visual) */}
            <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
              {/* Card 1: Connect #1 (AI Tech + Student Interested in Tech — Closely Linked in One Card) */}
              <div
                onClick={() =>
                  setSelectedInterest(
                    selectedInterest === "education" ? "romance" : "education"
                  )
                }
                className="relative col-span-1 h-[146px] sm:h-[170px] rounded-2xl overflow-hidden border border-[#00fbfb] shadow-[0_8px_24px_rgba(0,251,251,0.18)] cursor-pointer group transition-transform hover:-translate-y-0.5"
              >
                <div className="w-full h-full grid grid-cols-2">
                  <img
                    src={activeConnect.leftImg}
                    alt="Connect Person 1"
                    className="w-full h-full object-cover object-[center_18%] border-r border-[#00fbfb]/50"
                  />
                  <img
                    src={activeConnect.rightImg}
                    alt="Connect Person 2"
                    className="w-full h-full object-cover object-[center_18%]"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-[#05050c]/95 p-2 sm:p-2.5 flex flex-col justify-between">
                  <span className="self-start text-[8px] sm:text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#00fbfb]/25 text-[#00fbfb] border border-[#00fbfb]">
                    {t("landing.reelConnectTechChip", "Connect · Tech")}
                  </span>
                  <div className="text-left">
                    <div className="text-[10.5px] sm:text-[11.5px] font-black text-white leading-tight mb-1 drop-shadow-[0_2px_6px_rgba(0,0,0,0.95)]">
                      {activeConnect.pairTitle}
                    </div>
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[7.5px] sm:text-[8.5px] font-extrabold px-1.5 py-0.5 rounded-full bg-[#07070F]/90 border border-[#00fbfb]/45 text-slate-100 whitespace-nowrap">
                        {locale === "es" ? activeConnect.leftPillEs : activeConnect.leftPillEn}
                      </span>
                      <span className="text-[7.5px] sm:text-[8.5px] font-extrabold px-1.5 py-0.5 rounded-full bg-[#07070F]/90 border border-[#ffabf3]/55 text-slate-100 whitespace-nowrap">
                        {locale === "es" ? activeConnect.rightPillEs : activeConnect.rightPillEn}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 2: Connect #2 (Male Fitness Coach + Female Member Interested in Fitness — Closely Linked in One Card) */}
              <div
                onClick={() => setSelectedInterest("fitness")}
                className="relative col-span-1 h-[146px] sm:h-[170px] rounded-2xl overflow-hidden border border-emerald-400/60 shadow-[0_8px_20px_rgba(16,185,129,0.14)] cursor-pointer group transition-transform hover:-translate-y-0.5"
              >
                <div className="w-full h-full grid grid-cols-2">
                  <img
                    src={PORTRAITS.liam}
                    alt="Liam Fitness Coach"
                    className="w-full h-full object-cover object-[center_18%] border-r border-emerald-400/50"
                  />
                  <img
                    src={PORTRAITS.sarah}
                    alt="Sarah Fitness Member"
                    className="w-full h-full object-cover object-[center_18%]"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-[#05050c]/95 p-2 sm:p-2.5 flex flex-col justify-between">
                  <span className="self-start text-[8px] sm:text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/25 text-emerald-300 border border-emerald-400">
                    {t("landing.reelConnectFitnessChip", "Connect · Fitness")}
                  </span>
                  <div className="text-left">
                    <div className="text-[10.5px] sm:text-[11.5px] font-black text-white leading-tight mb-1 drop-shadow-[0_2px_6px_rgba(0,0,0,0.95)]">
                      Liam & Sarah
                    </div>
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[7.5px] sm:text-[8.5px] font-extrabold px-1.5 py-0.5 rounded-full bg-[#07070F]/90 border border-emerald-400/55 text-slate-100 whitespace-nowrap">
                        {t("landing.reelFitnessLeftPill", "🏋️ Coach")}
                      </span>
                      <span className="text-[7.5px] sm:text-[8.5px] font-extrabold px-1.5 py-0.5 rounded-full bg-[#07070F]/90 border border-[#ffabf3]/55 text-slate-100 whitespace-nowrap">
                        {t("landing.reelFitnessRightPill", "🔥 Into Fitness")}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 3: Stream (Single Live Host Portrait Adjusted for Desktop & Mobile) */}
              <Link
                href="/now-streaming"
                className="relative col-span-1 h-[146px] sm:h-[170px] rounded-2xl overflow-hidden border border-white/15 hover:border-[#00fbfb] shadow-[0_8px_20px_rgba(239,68,68,0.14)] cursor-pointer group transition-all hover:-translate-y-0.5 block"
              >
                <img
                  src={PORTRAITS.sofia}
                  alt="Sofia Live Stream"
                  className="w-full h-full object-cover object-[center_18%]"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-[#05050c]/95 p-2 sm:p-2.5 flex flex-col justify-between">
                  <span className="self-start text-[8px] sm:text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-red-500/90 text-white shadow-[0_0_10px_rgba(239,68,68,0.5)]">
                    {t("landing.reelStreamChip", "● Stream")}
                  </span>
                  <div className="text-left">
                    <div className="text-[10.5px] sm:text-[11.5px] font-black text-white leading-tight drop-shadow-[0_2px_6px_rgba(0,0,0,0.95)]">
                      {t("landing.reelStreamTitle", "Sofia Live")}
                    </div>
                    <div className="text-[8.5px] sm:text-[9px] text-slate-200 leading-snug mt-0.5 font-semibold drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)]">
                      {t(
                        "landing.reelStreamSub",
                        "🌐 75+ Lang Voice AI · Interactive Rooms"
                      )}
                    </div>
                  </div>
                </div>
              </Link>

              {/* Card 4: Studio (Single Creator Studio Portrait with Interactive Face-Blur Preview) */}
              <div
                onClick={() => setStudioBlurred((prev) => !prev)}
                title="Tap to preview SECCION Smart Face-Blur"
                className="relative col-span-1 h-[146px] sm:h-[170px] rounded-2xl overflow-hidden border border-white/15 hover:border-[#ffabf3] shadow-[0_8px_20px_rgba(255,171,243,0.14)] cursor-pointer group transition-all hover:-translate-y-0.5"
              >
                <img
                  src={PORTRAITS.valeria}
                  alt="Creator Studio"
                  className={`w-full h-full object-cover object-[center_18%] transition-all duration-300 ${
                    studioBlurred ? "blur-md scale-105" : ""
                  }`}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-[#05050c]/95 p-2 sm:p-2.5 flex flex-col justify-between">
                  <span className="self-start text-[8px] sm:text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#ffabf3]/25 text-[#ffabf3] border border-[#ffabf3]">
                    {t("landing.reelStudioChip", "Studio")}
                  </span>
                  <div className="text-left">
                    <div className="text-[10.5px] sm:text-[11.5px] font-black text-white leading-tight drop-shadow-[0_2px_6px_rgba(0,0,0,0.95)]">
                      {t("landing.reelStudioTitle", "Creator Studio")}
                    </div>
                    <div className="text-[8.5px] sm:text-[9px] text-slate-200 leading-snug mt-0.5 font-semibold drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)]">
                      {t(
                        "landing.reelStudioSub",
                        "🛡️ Face-Blur Privacy · Custom Skill Orders"
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column (5 cols on Desktop): Registration Card with Member vs. Creator Role Toggle */}
          <div className="lg:col-span-5">
            <div
              className={`rounded-[24px] p-4 sm:p-5 bg-gradient-to-b from-[#131324]/95 to-[#0A0A14]/98 backdrop-blur-2xl border-[1.5px] transition-all duration-300 ${
                isCreatorRole
                  ? "border-[#ffabf3]/55 shadow-[0_16px_40px_rgba(0,0,0,0.75),0_0_28px_rgba(255,171,243,0.15)]"
                  : "border-[#00fbfb]/45 shadow-[0_16px_40px_rgba(0,0,0,0.75),0_0_28px_rgba(0,251,251,0.12)]"
              }`}
            >
              {/* Role Toggle Bar: Member vs Creator */}
              <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-black/50 border border-white/10 mb-3">
                <button
                  type="button"
                  onClick={() => handleRoleToggle("member")}
                  className={`py-2 px-2.5 rounded-lg text-[10.5px] sm:text-[11px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                    !isCreatorRole
                      ? "bg-[#00fbfb] text-[#05050c] shadow-[0_0_14px_rgba(0,251,251,0.35)]"
                      : "text-white/55 hover:text-white"
                  }`}
                >
                  {t("landing.roleToggleMember", "⚡ Join as Member")}
                </button>
                <button
                  type="button"
                  onClick={() => handleRoleToggle("creator")}
                  className={`py-2 px-2.5 rounded-lg text-[10.5px] sm:text-[11px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                    isCreatorRole
                      ? "bg-[#ffabf3] text-[#05050c] shadow-[0_0_14px_rgba(255,171,243,0.38)]"
                      : "text-white/55 hover:text-white"
                  }`}
                >
                  {t("landing.roleToggleCreator", "👑 Join as Creator")}
                </button>
              </div>

              {/* Registration Header */}
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center">
                  <div className="flex items-center">
                    <img
                      src={PORTRAITS.liam}
                      alt="Member 1"
                      className="w-6 h-6 rounded-full object-cover border-[1.5px] border-[#090914] -mr-1.5"
                    />
                    <img
                      src={PORTRAITS.sofia}
                      alt="Member 2"
                      className="w-6 h-6 rounded-full object-cover border-[1.5px] border-[#090914] -mr-1.5"
                    />
                    <img
                      src={PORTRAITS.marco}
                      alt="Member 3"
                      className="w-6 h-6 rounded-full object-cover border-[1.5px] border-[#090914]"
                    />
                  </div>
                  <span className="text-[11px] sm:text-xs font-extrabold text-slate-100 ml-2.5">
                    {isCreatorRole
                      ? t("landing.regTitleCreator", "Launch Your Creator Studio")
                      : t("landing.regTitleMember", "Meet Real People on SECCION")}
                  </span>
                </div>

                <span
                  className={`shrink-0 text-[9px] font-black px-2 py-0.5 rounded-full border ${
                    isCreatorRole
                      ? "bg-[#ffabf3]/15 text-[#ffabf3] border-[#ffabf3]/45"
                      : "bg-emerald-500/15 text-emerald-400 border-emerald-500/35"
                  }`}
                >
                  {isCreatorRole
                    ? t("landing.regBadgeCreator", "KEEP 90% · FREE AI")
                    : t("landing.regBadgeMember", "100% FREE MATCHING")}
                </span>
              </div>

              {/* OAuth Row: Google + Continue with X */}
              <div className="grid grid-cols-2 gap-2 mb-2.5">
                <button
                  type="button"
                  disabled={isOAuthLoading !== null}
                  onClick={() => handleOAuthRegister("google")}
                  className="w-full py-2.5 px-3 rounded-xl bg-white text-slate-900 font-extrabold text-xs flex items-center justify-center gap-2 hover:-translate-y-0.5 transition cursor-pointer disabled:opacity-60"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24">
                    <path
                      fill="#EA4335"
                      d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.4 1 3.5 3.6 1.6 7.4l3.7 2.8C6.2 7.2 8.9 5 12 5z"
                    />
                    <path
                      fill="#4285F4"
                      d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.6l3.7 2.9c2.2-2 3.7-5 3.7-8.7z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.3 14.2c-.2-.7-.4-1.4-.4-2.2s.2-1.5.4-2.2L1.6 7.4C.6 9.4 0 11.6 0 12s.6 2.6 1.6 4.6l3.7-2.4z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3.1 0-5.8-2.1-6.7-5l-3.7 2.8C3.5 19.9 7.4 23 12 23z"
                    />
                  </svg>
                  <span>{t("landing.oauthGoogle", "Google")}</span>
                </button>

                <button
                  type="button"
                  disabled={isOAuthLoading !== null}
                  onClick={() => handleOAuthRegister("twitter")}
                  className="w-full py-2.5 px-3 rounded-xl bg-[#09090f] text-white border border-white/20 hover:border-[#00fbfb] font-extrabold text-xs flex items-center justify-center gap-2 hover:-translate-y-0.5 transition cursor-pointer disabled:opacity-60"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="#ffffff">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                  <span>{t("landing.oauthX", "Continue with X")}</span>
                </button>
              </div>

              {/* Direct Email Registration Form */}
              <form onSubmit={handleEmailRegister} className="flex gap-2">
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder={t("landing.emailPlaceholder", "Or enter your email...")}
                  className="flex-1 min-w-0 bg-white/[0.06] border border-white/15 focus:border-[#00fbfb] rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-400 outline-none transition"
                />
                <button
                  type="submit"
                  className="shrink-0 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#00fbfb] to-[#ffabf3] text-[#05050c] font-black text-xs whitespace-nowrap shadow-[0_4px_16px_rgba(0,251,251,0.3)] hover:opacity-95 transition cursor-pointer"
                >
                  {isCreatorRole
                    ? t("landing.submitCreatorBtn", "Join as Creator →")
                    : t("landing.submitMemberBtn", "Join as Member →")}
                </button>
              </form>

              {/* Micro Footer Note & Quick Switch / Details Link */}
              <div className="mt-2.5 flex items-center justify-between gap-2 text-[10px] text-slate-400">
                <span className="truncate">
                  {isCreatorRole
                    ? t(
                        "landing.microNoteCreator",
                        "👑 90% Founding Split · Free Year-1 AI Assistant · Face-Blur"
                      )
                    : t(
                        "landing.microNoteMember",
                        "✨ 30+ Spheres: Skills, Romance, Entertainment & more"
                      )}
                </span>

                {isCreatorRole ? (
                  <Link
                    href="/become-creator"
                    className="shrink-0 text-[#ffabf3] hover:underline font-extrabold"
                  >
                    {t("landing.fullCreatorDetailsLink", "Full Creator Details →")}
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleRoleToggle("creator")}
                    className="shrink-0 text-[#ffabf3] hover:underline font-extrabold cursor-pointer"
                  >
                    {t("landing.switchToCreatorLink", "Switch to Creator →")}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Untouched PublicFooter with Official 3D "S" Icon, Legal Links & SECCION Wordmark */}
      <PublicFooter />
    </div>
  );
}
