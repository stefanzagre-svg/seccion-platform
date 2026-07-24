"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import PublicNavbar from "@/components/PublicNavbar";
import { useTranslation } from "@/context/LanguageContext";
import { motion } from "framer-motion";
import { 
  Compass, 
  Sparkles, 
  Heart, 
  Flame, 
  Cpu, 
  Zap, 
  EyeOff, 
  ShieldCheck, 
  Landmark, 
  Play, 
  ArrowLeft, 
  Lock, 
  Unlock, 
  MessageSquare, 
  Globe, 
  FileText, 
  Check, 
  ChevronRight, 
  UserCheck, 
  ArrowUpRight, 
  Scale, 
  Bot,
  HelpCircle,
  TrendingUp,
  Award,
  Shield,
  Layers,
  ArrowRight,
  Video,
  Phone,
  HelpCircle as QuestionIcon
} from "lucide-react";

// Double-Bezel Card wrapper matching SECCION design guidelines
function DoubleBezelCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-[2.5rem] p-1 bg-white/[0.04] border border-white/10 shadow-[0_24px_48px_-12px_rgba(0,0,0,0.6)] backdrop-blur-xl relative overflow-visible ${className}`}>
      <div className="absolute inset-0 border border-white/5 rounded-[2.5rem] pointer-events-none" />
      <div className="rounded-[calc(2.5rem-0.25rem)] bg-[#0F0F1A]/95 p-6 md:p-8 border border-white/5 relative z-10 overflow-visible">
        {children}
      </div>
    </div>
  );
}

// Monospace number component for precise metrics
function MonoNumber({ value, suffix = "" }: { value: string | number; suffix?: string }) {
  return (
    <span className="font-mono text-[#00fbfb] drop-shadow-[0_0_10px_rgba(0,251,251,0.3)] font-bold tracking-tight">
      {value}{suffix}
    </span>
  );
}

export default function HowWeDoPage() {
  const router = useRouter();
  const { t } = useTranslation();

  // 1. Chemistry Meter State
  const [activeChemLevel, setActiveChemLevel] = useState<number>(3);
  const chemLevels = [
    { 
      level: 1, 
      name: "Intro Vibe", 
      description: "Standard match unlock. Basic text chat activated.", 
      moves: "Digital Poke, Icebreaker Openers" 
    },
    { 
      level: 2, 
      name: "Synergy Sync", 
      description: "Sharing interest playlists and style albums.", 
      moves: "Custom Media Shares, Audio Message Unlocks" 
    },
    { 
      level: 3, 
      name: "Active Interest", 
      description: "Recommended threshold for casual real-life meetings and digital video checks.", 
      moves: "Coffee Walk Suggestion Card, Voice Calls, Video Call Scheduling" 
    },
    { 
      level: 4, 
      name: "Verified Connection", 
      description: "Secure Identity check passed. Unlocks real-world dating plans and coordinates sharing.", 
      moves: "Biometric Verification Status, Dinner Plan Proposals" 
    },
    { 
      level: 5, 
      name: "Mutual Spark", 
      description: "High frequency engagement. Content access levels automatically expand.", 
      moves: "Custom Playlist Exchange, Active Dating Plans" 
    },
    { 
      level: 6, 
      name: "Trust Circle", 
      description: "Extended communication features. Safe check-ins unlocked.", 
      moves: "Weekend Travel Mates Planner, Safe Location Tracker" 
    },
    { 
      level: 7, 
      name: "Intimate Harmony", 
      description: "Deep connection resonance. Full profile access.", 
      moves: "Custom Content Order Prioritizations" 
    },
    { 
      level: 8, 
      name: "Soulmate Aura", 
      description: "Maximum chemistry. Special badge profile rewards.", 
      moves: "Exclusive Matching Achievements, Priority Visibility" 
    }
  ];

  // 2. Master Sub Simulator State
  const [selectedCreatorsCount, setSelectedCreatorsCount] = useState<number>(10);
  const [averageCreatorPrice, setAverageCreatorPrice] = useState<number>(15);

  const calculateMasterSubscriptionPrice = () => {
    // Blended Indexing Formula: Base Fee + Discounted Aggregate Cost
    // P_M = Base_Master_Fee + MIN(Sum(P_C)) * Discount_Factor
    const baseFee = 9.99;
    const aggregateCost = selectedCreatorsCount * averageCreatorPrice;
    const discountFactor = 0.45; // 55% discount
    const discountedCost = Math.min(aggregateCost, 120) * discountFactor;
    return parseFloat((baseFee + discountedCost).toFixed(2));
  };

  const calculateCreatorGuaranteedPayout = () => {
    // 20% guaranteed base payout divided among selected creators
    const totalMasterSub = calculateMasterSubscriptionPrice();
    const creatorPool = totalMasterSub * 0.85;
    const guaranteedBase = creatorPool * 0.25; // 25% of pool is guaranteed base
    return parseFloat((guaranteedBase / selectedCreatorsCount).toFixed(2));
  };

  // 3. Face Blur Simulation State
  const [faceBlurred, setFaceBlurred] = useState<boolean>(true);

  // 4. Translation Thread State
  const [isTranslated, setIsTranslated] = useState<boolean>(false);
  const chatMessages = [
    { sender: "Siena", original: "Hola! Me encanta el piano, ¿cuál es tu estilo favorito?", translated: "Hey! I love the piano, what's your favorite style?" },
    { sender: "You", original: "I love jazz and classical piano. Have you performed live?", translated: "Me encanta el jazz y el piano clásico. ¿Has tocado en vivo?" }
  ];

  // 5. Operations Assistant State
  const [assistantStep, setAssistantStep] = useState<number>(0);
  const assistantPrompts = [
    { query: "Scan contract from Agency Prime", reply: "Scan complete. Alert: likeness lock-in clause detected on line 42. likeness owned in perpetuity. Recommended action: Strike section before signing." },
    { query: "Optimize stream schedule", reply: "Resonance analytics recommend Tuesdays at 8PM GMT based on your Muse Archetype audience activity. Unlocks +12% tip velocity." },
    { query: "Filter custom content orders", reply: "Audited 3 pending orders. Order #108 (Classical cover) passed validation. Verified payment held in escrow. Order #109 rejected due to guideline mismatch." }
  ];

  return (
    <div 
      className="w-full min-h-screen text-[#e2e2e2] overflow-x-hidden font-['Hanken_Grotesk'] relative pb-32"
      style={{
        backgroundColor: 'transparent',
        backgroundImage: 'radial-gradient(circle at 15% 50%, rgba(255, 171, 243, 0.05), transparent 25%), radial-gradient(circle at 85% 30%, rgba(0, 251, 251, 0.05), transparent 25%)'
      }}
    >
      {/* Background Cyber Grid */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      {/* Floating Navbar */}
      <PublicNavbar activeTab="how-we-do" />

      {/* Main Container */}
      <main className="relative z-10 pt-36 px-6 md:px-[84px] max-w-[1280px] mx-auto space-y-24">
        
        {/* Back navigation */}
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-xs font-mono font-bold text-white/40 hover:text-[#00fbfb] transition group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Home</span>
        </Link>

        {/* Hero Section */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6 text-left">
            <span className="text-[10px] font-mono font-bold text-[#00fbfb] bg-[#00fbfb]/5 border border-[#00fbfb]/25 px-3 py-1 rounded-full uppercase tracking-wider">
              Warm Paywall Philosophy
            </span>
            <h1 className="font-['Outfit'] text-4xl sm:text-6xl font-black text-white leading-[1.05] tracking-tight uppercase">
              How We <span className="text-[#00fbfb]">Do</span> Things
            </h1>
            <p className="text-sm sm:text-base text-[#b9cac9] leading-relaxed max-w-xl">
              Traditional dating networks treat members as assets to squeeze, charging fees just to get noticed. At SECCION, we believe connection should be free. 
            </p>
            <p className="text-sm sm:text-base text-[#b9cac9] leading-relaxed max-w-xl">
              Our business model keeps matchmaking and chatting **100% free for general members** because it is fully funded by our creator-centric economy. By providing premium tools, subscription portals, and streaming options for creators, we establish a cooperative ecosystem where everyone wins.
            </p>
            <div className="flex gap-4 pt-2">
              <Link 
                href="/early-access"
                className="px-8 py-3.5 rounded-full bg-[#00fbfb] text-black font-mono text-xs font-black uppercase tracking-wider hover:shadow-[0_0_20px_rgba(0,251,251,0.5)] transition active:scale-[0.98] cursor-pointer"
              >
                Join Onboarding Quest
              </Link>
            </div>
          </div>
          <div className="lg:col-span-5 flex justify-center">
            <DoubleBezelCard className="w-full max-w-[420px]">
              <div className="space-y-6 text-left">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-mono text-white/40 uppercase font-bold tracking-wider">Vibe Ecosystem</span>
                  <div className="w-2.5 h-2.5 rounded-full bg-[#39FF14] animate-pulse" />
                </div>
                
                <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-white uppercase">Dating Platform</span>
                    <span className="text-[9px] font-mono text-[#00fbfb] font-bold">100% FREE</span>
                  </div>
                  <p className="text-[10px] text-[#b9cac9] leading-relaxed">
                    General matching, text messaging, profile setup, and synergy calculations carry zero subscription costs. No pay-to-be-seen tricks.
                  </p>
                </div>

                <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-white uppercase">Creator Platform</span>
                    <span className="text-[9px] font-mono text-[#ffabf3] font-bold">80% PAYOUT</span>
                  </div>
                  <p className="text-[10px] text-[#b9cac9] leading-relaxed">
                    Creators monetize premium streams, media albums, custom orders, and VIP/Master subscriptions using in-app tokens.
                  </p>
                </div>
              </div>
            </DoubleBezelCard>
          </div>
        </section>

        {/* Infographic Replica: SECCION: The Future of Connection & Creation */}
        <section className="space-y-12 py-10 border-y border-white/5 relative">
          <div className="flex flex-col items-center justify-center text-center space-y-4 mb-12">
            <div className="relative w-20 h-20 rounded-full bg-black/40 border border-white/10 flex items-center justify-center shadow-[0_0_30px_rgba(0,251,251,0.2),0_0_50px_rgba(255,171,243,0.15)] group hover:scale-105 transition-all duration-500">
              <div className="absolute inset-0 rounded-full border border-[#00fbfb]/30 animate-pulse pointer-events-none" />
              <img 
                src="/images/s-logo-user.png" 
                alt="SECCION Icon" 
                className="w-10 h-14 object-contain drop-shadow-[0_0_15px_rgba(0,251,251,0.6)]" 
              />
            </div>
            <h2 className="font-['Outfit'] text-2xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#00fbfb] via-white to-[#ffabf3] uppercase tracking-tight">
              SECCION: The Future of Connection & Creation
            </h2>
            <p className="text-xs sm:text-sm text-[#b9cac9]/70 max-w-xl leading-relaxed">
              Hybrid platform for premium matchmaking and a creator-centric economy, built on the Warm Paywall philosophy.
            </p>
          </div>

          {/* Two side-by-side columns */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
            
            {/* Left Column: For Members */}
            <div className="rounded-[2.5rem] p-1 bg-gradient-to-b from-[#00fbfb]/20 to-transparent border border-[#00fbfb]/20 shadow-2xl relative flex flex-col">
              <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-b from-[#00fbfb]/5 to-transparent pointer-events-none" />
              <div className="rounded-[calc(2.5rem-0.25rem)] bg-[#0C0C14]/95 p-8 border border-white/5 relative z-10 flex-1 flex flex-col justify-between space-y-8 text-left">
                <div>
                  <span className="text-[10px] font-mono font-bold text-[#00fbfb] uppercase tracking-widest block mb-2">FOR MEMBERS:</span>
                  <h3 className="font-['Outfit'] text-xl sm:text-2xl font-black text-white uppercase tracking-tight">The Anti-Situationship Experience</h3>
                </div>

                <div className="space-y-6">
                  {/* Gauge widget */}
                  <div className="p-5 bg-white/[0.02] border border-white/5 rounded-3xl space-y-4">
                    <div className="flex justify-between items-center text-xs font-bold text-white uppercase">
                      <span>The 8-Level Chemistry Meter 💥</span>
                    </div>
                    <div className="flex flex-col items-center justify-center py-2">
                      <svg className="w-36 h-18" viewBox="0 0 100 50">
                        <path
                          d="M 10 50 A 40 40 0 0 1 90 50"
                          fill="none"
                          stroke="url(#chem-gauge-grad)"
                          strokeWidth="8"
                          strokeLinecap="round"
                        />
                        <defs>
                          <linearGradient id="chem-gauge-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#00fbfb" />
                            <stop offset="50%" stopColor="#ffabf3" />
                            <stop offset="100%" stopColor="#fe00fe" />
                          </linearGradient>
                        </defs>
                        <line
                          x1="50"
                          y1="50"
                          x2="35"
                          y2="22"
                          stroke="#ffffff"
                          strokeWidth="3.5"
                          strokeLinecap="round"
                        />
                        <circle cx="50" cy="50" r="4.5" fill="#ffffff" />
                      </svg>
                      <div className="flex justify-between w-full px-4 text-[8px] font-mono text-white/40 uppercase mt-1">
                        <span>Undefined</span>
                        <span>Soulmate</span>
                      </div>
                    </div>
                    <p className="text-[10px] text-[#b9cac9] leading-relaxed">
                      A dynamic scoring system that tracks relationship progress from "Undefined" to "Soulmate."
                    </p>
                  </div>

                  {/* Synergy Card */}
                  <div className="p-5 bg-white/[0.02] border border-white/5 rounded-3xl flex gap-4 items-start">
                    <div className="w-10 h-10 rounded-xl bg-[#00fbfb]/10 border border-[#00fbfb]/25 flex items-center justify-center shrink-0">
                      <svg className="w-5 h-5 text-[#00fbfb]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase mb-1">Personality-First Synergy Engine</h4>
                      <p className="text-[10px] text-[#b9cac9] leading-relaxed">
                        AI matches you based on 9 archetypes and mood resonance, not just photos.
                      </p>
                    </div>
                  </div>

                  {/* Suggestion Card */}
                  <div className="p-5 bg-white/[0.02] border border-white/5 rounded-3xl flex gap-4 items-start">
                    <div className="w-10 h-10 rounded-xl bg-[#00fbfb]/10 border border-[#00fbfb]/25 flex items-center justify-center shrink-0">
                      <Compass className="w-5 h-5 text-[#00fbfb]" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-xs font-bold text-white uppercase mb-1">60+ Real-World Suggestion Moves</h4>
                      <div className="flex items-center gap-2 py-2 mb-2">
                        <div className="px-2 py-0.5 rounded bg-white/5 border border-white/10 font-mono text-[8px] text-[#b9cac9]">Poke</div>
                        <Zap className="w-3 h-3 text-[#ffabf3]" />
                        <div className="px-2 py-0.5 rounded bg-white/5 border border-white/10 font-mono text-[8px] text-[#b9cac9]">Coffee</div>
                        <Zap className="w-3 h-3 text-[#ffabf3]" />
                        <div className="px-2 py-0.5 rounded bg-white/5 border border-white/10 font-mono text-[8px] text-[#b9cac9]">Trip</div>
                      </div>
                      <p className="text-[10px] text-[#b9cac9] leading-relaxed">
                        Progressively unlock dates—from a digital "Poke" to coffee and international trips.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: For Creators */}
            <div className="rounded-[2.5rem] p-1 bg-gradient-to-b from-[#ffabf3]/20 to-transparent border border-[#ffabf3]/20 shadow-2xl relative flex flex-col">
              <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-b from-[#ffabf3]/5 to-transparent pointer-events-none" />
              <div className="rounded-[calc(2.5rem-0.25rem)] bg-[#0C0C14]/95 p-8 border border-white/5 relative z-10 flex-1 flex flex-col justify-between space-y-8 text-left">
                <div>
                  <span className="text-[10px] font-mono font-bold text-[#ffabf3] uppercase tracking-widest block mb-2">FOR CREATORS:</span>
                  <h3 className="font-['Outfit'] text-xl sm:text-2xl font-black text-white uppercase tracking-tight">Your Business-in-a-Box</h3>
                </div>

                <div className="space-y-6">
                  {/* Revenue Split Card */}
                  <div className="p-5 bg-white/[0.02] border border-white/5 rounded-3xl flex items-center justify-between gap-4">
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-white uppercase">Unbeatable 80% Revenue Split 🔥</h4>
                      <p className="text-[10px] text-[#b9cac9] leading-relaxed">
                        Keep 80% of every subscription and tip with zero hidden agency fees.
                      </p>
                    </div>
                    <div className="flex flex-col items-center justify-center p-3 bg-[#ffabf3]/10 border border-[#ffabf3]/25 rounded-2xl shrink-0">
                      <span className="text-2xl font-black font-mono text-[#ffabf3] leading-none">80%</span>
                      <span className="text-[7px] font-mono uppercase text-white/40 tracking-wider mt-1 font-bold">Guaranteed</span>
                    </div>
                  </div>

                  {/* AI Operations Assistant Card */}
                  <div className="p-5 bg-white/[0.02] border border-white/5 rounded-3xl flex gap-4 items-start">
                    <div className="w-10 h-10 rounded-xl bg-[#ffabf3]/10 border border-[#ffabf3]/25 flex items-center justify-center shrink-0">
                      <svg className="w-5 h-5 text-[#ffabf3]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <rect x="3" y="11" width="18" height="10" rx="2" />
                        <circle cx="8" cy="16" r="1" />
                        <circle cx="16" cy="16" r="1" />
                        <path d="M9 22v-2h6v2" />
                        <path d="M12 11V9" />
                        <circle cx="12" cy="7" r="1.5" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase mb-1">Free AI Operations Assistant</h4>
                      <p className="text-[10px] text-[#b9cac9] leading-relaxed">
                        Replaces expensive agencies by managing DMs, content scheduling, and legal reviews.
                      </p>
                    </div>
                  </div>

                  {/* Privacy Blur Card */}
                  <div className="p-5 bg-white/[0.02] border border-white/5 rounded-3xl flex gap-4 items-start">
                    <div className="w-10 h-10 rounded-xl bg-[#ffabf3]/10 border border-[#ffabf3]/25 flex items-center justify-center shrink-0">
                      <EyeOff className="w-5 h-5 text-[#ffabf3]" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase mb-1">Privacy-First Face Blur</h4>
                      <p className="text-[10px] text-[#b9cac9] leading-relaxed">
                        Your face stays blurred until a match reaches a high Chemistry Level.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Comparison box */}
          <div className="rounded-[2.5rem] p-1 bg-white/[0.03] border border-white/10 shadow-2xl relative">
            <div className="rounded-[calc(2.5rem-0.25rem)] bg-[#0C0C14]/90 p-8 border border-white/5 space-y-6 text-left">
              <h3 className="font-['Outfit'] text-xs font-black uppercase tracking-widest text-center text-transparent bg-clip-text bg-gradient-to-r from-[#00fbfb] to-[#ffabf3]">
                COMPARISON: SECCION vs. Industry Standards
              </h3>
              
              <div className="space-y-4">
                {/* Row 1: Matching Cost */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center border-b border-white/5 pb-4">
                  <div className="md:col-span-4 text-xs font-bold text-white uppercase font-mono tracking-wider">Matching Cost</div>
                  <div className="md:col-span-4">
                    <div className="flex justify-between items-center bg-[#00fbfb]/10 border border-[#00fbfb]/25 px-4 py-2 rounded-full text-xs font-bold text-[#00fbfb] shadow-[0_0_15px_rgba(0,251,251,0.1)]">
                      <span>100% Free</span>
                      <Check className="w-4 h-4 text-emerald-400 bg-emerald-400/10 rounded-full p-0.5" />
                    </div>
                  </div>
                  <div className="md:col-span-4">
                    <div className="flex justify-between items-center bg-white/5 border border-white/5 px-4 py-2 rounded-full text-xs font-medium text-white/50">
                      <span>€9–€30 / Month</span>
                      <Lock className="w-4 h-4 text-white/20" />
                    </div>
                  </div>
                </div>

                {/* Row 2: Creator Payout */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center border-b border-white/5 pb-4">
                  <div className="md:col-span-4 text-xs font-bold text-white uppercase font-mono tracking-wider">Creator Payout</div>
                  <div className="md:col-span-4">
                    <div className="flex justify-between items-center bg-[#ffabf3]/10 border border-[#ffabf3]/25 px-4 py-2 rounded-full text-xs font-bold text-[#ffabf3] shadow-[0_0_15px_rgba(255,171,243,0.1)]">
                      <span>80% Guaranteed</span>
                      <span className="text-[10px] font-mono font-bold">%</span>
                    </div>
                  </div>
                  <div className="md:col-span-4">
                    <div className="flex justify-between items-center bg-white/5 border border-white/5 px-4 py-2 rounded-full text-xs font-medium text-white/50">
                      <span>40-50% (After Fees)</span>
                      <span className="text-[10px] font-mono">%</span>
                    </div>
                  </div>
                </div>

                {/* Row 3: Agency Support */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                  <div className="md:col-span-4 text-xs font-bold text-white uppercase font-mono tracking-wider">Agency Support</div>
                  <div className="md:col-span-4">
                    <div className="flex justify-between items-center bg-[#00fbfb]/10 border border-[#00fbfb]/25 px-4 py-2 rounded-full text-xs font-bold text-[#00fbfb] shadow-[0_0_15px_rgba(0,251,251,0.1)]">
                      <span>Built-in AI (Free)</span>
                      <Bot className="w-4 h-4 text-[#00fbfb]" />
                    </div>
                  </div>
                  <div className="md:col-span-4">
                    <div className="flex justify-between items-center bg-white/5 border border-white/5 px-4 py-2 rounded-full text-xs font-medium text-white/50">
                      <span>Expensive External Teams</span>
                      <Lock className="w-4 h-4 text-white/20" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Chemistry Meter & Suggestion Moves */}
        <section className="space-y-8">
          <div className="text-left space-y-3">
            <h2 className="font-['Outfit'] text-2xl sm:text-4xl font-black text-white uppercase tracking-tight">
              The Chemistry Meter & Suggestion Moves
            </h2>
            <p className="text-xs sm:text-sm text-[#b9cac9] max-w-2xl leading-relaxed">
              We eliminate situationship loops by tracking real relationship resonance. Interactions (chatting, content views, tips) drive a dynamic 8-Level Chemistry Meter. Reaching new levels unlocks custom dating options called **Suggestion Moves**, progressively bridging the digital gap.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Interactive dial selectors */}
            <div className="lg:col-span-5">
              <DoubleBezelCard>
                <div className="space-y-6">
                  <span className="text-[10px] font-mono text-white/40 uppercase font-bold tracking-wider block text-left">Level Selector</span>
                  
                  <div className="grid grid-cols-4 gap-2">
                    {chemLevels.map((lvl) => (
                      <button
                        key={lvl.level}
                        onClick={() => setActiveChemLevel(lvl.level)}
                        className={`py-3 rounded-xl border font-mono text-xs font-bold transition-all cursor-pointer ${
                          activeChemLevel === lvl.level 
                            ? 'border-[#00fbfb] text-[#00fbfb] bg-[#00fbfb]/10 shadow-[0_0_15px_rgba(0,251,251,0.2)]' 
                            : 'border-white/5 text-white/40 hover:text-white/60 bg-transparent'
                        }`}
                      >
                        Lvl {lvl.level}
                      </button>
                    ))}
                  </div>

                  {/* Level status visualization */}
                  <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl space-y-3 text-left">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-white uppercase">{chemLevels[activeChemLevel - 1].name}</span>
                      <span className="text-[10px] font-mono text-[#ffabf3] font-bold">Level {activeChemLevel} / 8</span>
                    </div>
                    <p className="text-[10px] text-[#b9cac9] leading-relaxed">
                      {chemLevels[activeChemLevel - 1].description}
                    </p>
                    <div className="border-t border-white/5 pt-3">
                      <span className="text-[8px] font-mono text-white/30 uppercase font-bold block mb-1">Unlocked Suggestion Moves</span>
                      <span className="text-[10px] text-[#39FF14] font-medium">
                        {chemLevels[activeChemLevel - 1].moves}
                      </span>
                    </div>
                  </div>
                </div>
              </DoubleBezelCard>
            </div>

            {/* Visual description of levels */}
            <div className="lg:col-span-7 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 bg-white/[0.02] border border-white/5 rounded-3xl text-left space-y-2">
                  <div className="w-8 h-8 rounded-lg bg-[#00fbfb]/10 border border-[#00fbfb]/25 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-[#00fbfb]" />
                  </div>
                  <h3 className="text-xs font-bold text-white uppercase">Progressive Trust</h3>
                  <p className="text-[11px] text-[#b9cac9] leading-relaxed">
                    Higher chemistry levels automatically prompt safe suggestions. Coffee walk cards, voice calls, and video scheduling unlock at Level 3. Real-world dinner proposal cards unlock at Level 4.
                  </p>
                </div>

                <div className="p-5 bg-white/[0.02] border border-white/5 rounded-3xl text-left space-y-2">
                  <div className="w-8 h-8 rounded-lg bg-[#ffabf3]/10 border border-[#ffabf3]/25 flex items-center justify-center">
                    <ShieldCheck className="w-4 h-4 text-[#ffabf3]" />
                  </div>
                  <h3 className="text-xs font-bold text-white uppercase">L3 Video Call Scheduling</h3>
                  <p className="text-[11px] text-[#b9cac9] leading-relaxed">
                    **Video Call Scheduling is placed in Level 3**. Members can schedule secure video chats to confirm alignment before coordinating physical real-life coordinates or dinner plans at Level 4.
                  </p>
                </div>
              </div>

              <div className="p-6 bg-white/[0.03] border border-[#00fbfb]/20 rounded-3xl text-left space-y-3">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-[#00fbfb]" />
                  <h3 className="text-xs font-bold text-white uppercase font-mono tracking-wider">The Match Gate Connection Logic</h3>
                </div>
                <p className="text-[11px] text-[#b9cac9] leading-relaxed">
                  Connections are protected. To connect and unlock potential messaging tools, both users must mutually "LIKE" each other's profile cards. 
                </p>
                <p className="text-[11px] text-[#b9cac9] leading-relaxed">
                  To prevent abuse, **content creators cannot like other content creators** on the platform. The gate guarantees that creators only interact with interested members and keeps chat boxes free from promotional spam.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: VIP vs. Master Subscription & Payouts */}
        <section className="space-y-8">
          <div className="text-left space-y-3">
            <h2 className="font-['Outfit'] text-2xl sm:text-4xl font-black text-white uppercase tracking-tight">
              VIP vs. Master Subscriptions
            </h2>
            <p className="text-xs sm:text-sm text-[#b9cac9] max-w-2xl leading-relaxed">
              We design creator funding as a community investment. Members choose between direct creator subscriptions or dynamic group bundles, ensuring creators enjoy stable, recurring payout streams.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            
            {/* VIP Card */}
            <div className="lg:col-span-4 flex">
              <DoubleBezelCard className="w-full flex flex-col justify-between">
                <div className="space-y-4 text-left">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-mono font-bold text-[#ffabf3] bg-[#ffabf3]/5 border border-[#ffabf3]/25 px-2 py-0.5 rounded-full uppercase">VIP PASS</span>
                    <span className="text-[11px] text-[#b9cac9] font-mono">Single Creator</span>
                  </div>
                  <h3 className="text-lg font-black uppercase text-white tracking-tight">VIP Subscription</h3>
                  <p className="text-[11px] text-[#b9cac9] leading-relaxed">
                    Auto-renewing monthly subscription dedicated to a single creator you matched with. 
                  </p>
                  <ul className="space-y-2 border-t border-white/5 pt-4 text-[10px] text-[#b9cac9]">
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-[#ffabf3] shrink-0" />
                      <span>Direct private messaging chat priority</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-[#ffabf3] shrink-0" />
                      <span>Unlock VIP Content Albums & Streams</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-[#ffabf3] shrink-0" />
                      <span>1 Private Call token per week (5m)</span>
                    </li>
                  </ul>
                </div>
                <div className="border-t border-white/5 pt-4 mt-6 text-left">
                  <span className="text-[9px] font-mono text-white/30 uppercase block font-bold">Pricing model</span>
                  <span className="text-sm font-bold text-white">Set directly by the Creator</span>
                </div>
              </DoubleBezelCard>
            </div>

            {/* Master Card */}
            <div className="lg:col-span-8 flex">
              <DoubleBezelCard className="w-full border-t-2 border-t-[#00fbfb]/30">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left h-full justify-between">
                  <div className="space-y-4 flex flex-col justify-between">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] font-mono font-bold text-[#00fbfb] bg-[#00fbfb]/5 border border-[#00fbfb]/25 px-2 py-0.5 rounded-full uppercase">MASTER BUNDLE</span>
                        <span className="text-[11px] text-[#b9cac9] font-mono">10 Creators</span>
                      </div>
                      <h3 className="text-lg font-black uppercase text-white tracking-tight">Master Subscription</h3>
                      <p className="text-[11px] text-[#b9cac9] leading-relaxed">
                        Choose up to 10 matched creators and aggregate them into your **Sponsored Creators** dashboard. Unlocks VIP privileges for all 10 profiles under a single price for a month.
                      </p>
                      <p className="text-[11px] text-[#b9cac9] leading-relaxed">
                        Creators gain highly predictable, stable payouts. Out of total subscription pool revenue, **85% is distributed to the creators** (with a 20% guaranteed base payout and 60% variable rating boost).
                      </p>
                    </div>
                    <div className="border-t border-white/5 pt-4 mt-4">
                      <span className="text-[9px] font-mono text-white/30 uppercase block font-bold">Distribution Logic</span>
                      <span className="text-[10px] text-[#39FF14] font-bold">85% Pool Payout • 20% Guaranteed base</span>
                    </div>
                  </div>

                  {/* Pricing Calculator Mock */}
                  <div className="p-5 bg-white/[0.02] border border-white/5 rounded-3xl flex flex-col justify-between">
                    <span className="text-[8px] font-mono uppercase text-white/40 block mb-3 font-bold">Sponsored Calculator</span>
                    
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] font-mono font-bold text-[#b9cac9]">
                          <span>Creators in List:</span>
                          <MonoNumber value={selectedCreatorsCount} />
                        </div>
                        <input 
                          type="range" 
                          min={2} 
                          max={10} 
                          value={selectedCreatorsCount} 
                          onChange={(e) => setSelectedCreatorsCount(parseInt(e.target.value))}
                          className="w-full accent-[#00fbfb] cursor-pointer h-1 bg-white/10 rounded-lg appearance-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] font-mono font-bold text-[#b9cac9]">
                          <span>Avg Creator Price:</span>
                          <MonoNumber value={`$${averageCreatorPrice}`} />
                        </div>
                        <input 
                          type="range" 
                          min={10} 
                          max={50} 
                          value={averageCreatorPrice} 
                          onChange={(e) => setAverageCreatorPrice(parseInt(e.target.value))}
                          className="w-full accent-[#ffabf3] cursor-pointer h-1 bg-white/10 rounded-lg appearance-none"
                        />
                      </div>
                    </div>

                    <div className="border-t border-white/5 pt-4 mt-4 space-y-2">
                      <div className="flex justify-between items-center text-[10px] font-bold text-white uppercase">
                        <span>Bundle Price (PM):</span>
                        <span className="text-sm font-mono text-[#00fbfb] font-black">${calculateMasterSubscriptionPrice()}/mo</span>
                      </div>
                      <div className="flex justify-between items-center text-[8px] font-mono font-bold text-[#b9cac9]">
                        <span>Guaranteed Base (per creator):</span>
                        <span className="text-[#39FF14]">${calculateCreatorGuaranteedPayout()}/mo</span>
                      </div>
                    </div>
                  </div>
                </div>
              </DoubleBezelCard>
            </div>

          </div>
        </section>

        {/* Section 4: Comparison Matrix (Reworked for OnlyFans & Tinder, Bumble, Hinge) */}
        <section className="space-y-8">
          <div className="text-left space-y-3">
            <h2 className="font-['Outfit'] text-2xl sm:text-4xl font-black text-white uppercase tracking-tight">
              SECCION vs. Industry Standards
            </h2>
            <p className="text-xs sm:text-sm text-[#b9cac9] max-w-2xl leading-relaxed">
              We replace predatory fees, fake accounts, and exploitative management contracts with fair, built-in technology.
            </p>
          </div>

          <DoubleBezelCard>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-[#b9cac9] min-w-[650px]">
                <thead>
                  <tr className="border-b border-white/10 text-[9px] font-mono uppercase tracking-widest text-white/50">
                    <th className="py-4 font-bold">Comparison Vector</th>
                    <th className="py-4 font-bold text-[#00fbfb]">SECCION Platform</th>
                    <th className="py-4 font-bold text-[#ffabf3]">Dating Apps (Tinder, Bumble, Hinge)</th>
                    <th className="py-4 font-bold text-[#ffcd2b]">Content Platforms (OnlyFans)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  <tr>
                    <td className="py-4 font-bold text-white font-mono uppercase text-[10px]">Matching Cost</td>
                    <td className="py-4 text-[#00fbfb] font-bold">100% Free - Funded by creators</td>
                    <td className="py-4 text-red-400">$9 - $30 / Month for basic visibility boosts</td>
                    <td className="py-4">No matching features (Direct links only)</td>
                  </tr>
                  <tr>
                    <td className="py-4 font-bold text-white font-mono uppercase text-[10px]">Creator Payout</td>
                    <td className="py-4 text-[#00fbfb] font-bold">80% Guaranteed Payout Split</td>
                    <td className="py-4">Not applicable (No creator payout models)</td>
                    <td className="py-4 text-red-400">80% theoretical (But drops to 50-60% after hidden escrow and layout fees)</td>
                  </tr>
                  <tr>
                    <td className="py-4 font-bold text-white font-mono uppercase text-[10px]">Operations Support</td>
                    <td className="py-4 text-[#00fbfb] font-bold">Free Built-in Operations AI Assistant</td>
                    <td className="py-4">None (Self managed profiles)</td>
                    <td className="py-4 text-red-400">Requires expensive external agency support (takes up to 50% extra cut)</td>
                  </tr>
                  <tr>
                    <td className="py-4 font-bold text-white font-mono uppercase text-[10px]">Chat Safeguards</td>
                    <td className="py-4 text-[#00fbfb] font-bold">Face Blur option + Disappearing Media cache</td>
                    <td className="py-4 text-red-400">None (All profiles and photos public to anyone)</td>
                    <td className="py-4">Basic paywall overlays only (No biometric checks)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </DoubleBezelCard>
        </section>

        {/* Section 5: Unique Technology Bento Grid */}
        <section className="space-y-8">
          <div className="text-left space-y-3">
            <h2 className="font-['Outfit'] text-2xl sm:text-4xl font-black text-white uppercase tracking-tight">
              Unique Technology Infrastructure
            </h2>
            <p className="text-xs sm:text-sm text-[#b9cac9] max-w-2xl leading-relaxed">
              We leverage modern AI, real-time caching, and security layers to protect your privacy and ease daily operations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Box 1: Face Blur Simulation */}
            <DoubleBezelCard>
              <div className="space-y-4 text-left">
                <div className="flex justify-between items-start">
                  <div className="w-10 h-10 rounded-xl bg-[#00fbfb]/10 border border-[#00fbfb]/25 flex items-center justify-center">
                    <EyeOff className="w-5 h-5 text-[#00fbfb]" />
                  </div>
                  <button 
                    onClick={() => setFaceBlurred(!faceBlurred)}
                    className="px-3 py-1 bg-white/5 border border-white/10 hover:border-white/30 text-white rounded-lg text-[9px] font-mono uppercase font-bold cursor-pointer transition"
                  >
                    Toggle Decrypter
                  </button>
                </div>
                
                <div className="flex gap-4 items-center p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0">
                    <img 
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80" 
                      className={`w-full h-full object-cover transition-all duration-300 ${faceBlurred ? 'blur-[12px]' : ''}`}
                    />
                    <div className="absolute inset-0 border border-white/10 rounded-xl" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase flex items-center gap-1.5">
                      {faceBlurred ? <Lock className="w-3.5 h-3.5 text-[#ffabf3]" /> : <Unlock className="w-3.5 h-3.5 text-[#00fbfb]" />}
                      Face Blur Protection
                    </h4>
                    <p className="text-[10px] text-[#b9cac9] leading-relaxed mt-1">
                      Choose to blur your face overlay on swipes. Unblurred style anchors show your look, and face detail unlocks only at higher chemistry thresholds.
                    </p>
                  </div>
                </div>
              </div>
            </DoubleBezelCard>

            {/* Box 2: Instant Translation Simulation */}
            <DoubleBezelCard>
              <div className="space-y-4 text-left">
                <div className="flex justify-between items-start">
                  <div className="w-10 h-10 rounded-xl bg-[#ffabf3]/10 border border-[#ffabf3]/25 flex items-center justify-center">
                    <Globe className="w-5 h-5 text-[#ffabf3]" />
                  </div>
                  <button 
                    onClick={() => setIsTranslated(!isTranslated)}
                    className="px-3 py-1 bg-white/5 border border-white/10 hover:border-white/30 text-white rounded-lg text-[9px] font-mono uppercase font-bold cursor-pointer transition"
                  >
                    {isTranslated ? "Show Original" : "Translate thread"}
                  </button>
                </div>

                <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl space-y-2.5">
                  {chatMessages.map((msg, i) => (
                    <div key={i} className="text-[10px]">
                      <span className="font-mono text-white/50 block mb-0.5">{msg.sender}</span>
                      <p className="text-white bg-white/5 px-2.5 py-1.5 rounded-lg inline-block max-w-full">
                        {isTranslated ? msg.translated : msg.original}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </DoubleBezelCard>

            {/* Box 3: AI Operations Assistant Terminal */}
            <DoubleBezelCard>
              <div className="space-y-4 text-left">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center">
                    <Bot className="w-5 h-5 text-emerald-400" />
                  </div>
                  <h4 className="text-xs font-bold text-white uppercase">Operations AI Assistant</h4>
                </div>

                <div className="flex gap-2 border-b border-white/5 pb-2.5 overflow-x-auto">
                  {assistantPrompts.map((p, idx) => (
                    <button
                      key={idx}
                      onClick={() => setAssistantStep(idx)}
                      className={`px-3 py-1.5 rounded-lg border font-mono text-[8px] uppercase font-bold transition shrink-0 cursor-pointer ${
                        assistantStep === idx ? 'border-emerald-400 text-emerald-400 bg-emerald-400/5' : 'border-white/5 text-white/30 hover:text-white/50'
                      }`}
                    >
                      Task {idx + 1}
                    </button>
                  ))}
                </div>

                <div className="p-4 bg-[#050505] border border-white/5 rounded-2xl space-y-2 font-mono text-[9px]">
                  <div className="text-white/40">&gt; Prompt: {assistantPrompts[assistantStep].query}</div>
                  <div className="text-[#39FF14] leading-relaxed">&gt; Reply: {assistantPrompts[assistantStep].reply}</div>
                </div>
              </div>
            </DoubleBezelCard>

            {/* Box 4: Content Orders & Escrow Protection */}
            <DoubleBezelCard>
              <div className="space-y-4 text-left">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#00fbfb]/10 border border-[#00fbfb]/25 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-[#00fbfb]" />
                  </div>
                  <h3 className="text-xs font-bold text-white uppercase">Custom content order & escrow</h3>
                </div>

                <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl space-y-3">
                  <p className="text-[10px] text-[#b9cac9] leading-relaxed">
                    Members can request personalized digital content (such as custom recordings, advice reels, or custom streams). 
                  </p>
                  <p className="text-[10px] text-[#b9cac9] leading-relaxed">
                    To guarantee trust, payment tokens are held securely in **Platform Escrow** and are only released to the creator once the content is delivered and verified by the member, protecting both sides from fraud.
                  </p>
                </div>
              </div>
            </DoubleBezelCard>

          </div>
        </section>

        {/* Section 6: User Rating & Profile Switching */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5 flex justify-center">
            <DoubleBezelCard className="w-full max-w-[420px]">
              <div className="space-y-6 text-left">
                <span className="text-[10px] font-mono text-white/40 uppercase font-bold tracking-wider block">Trust Score Metrics</span>
                
                <div className="p-5 bg-white/[0.02] border border-[#ffabf3]/20 rounded-2xl text-center space-y-3">
                  <span className="text-[9px] font-mono text-[#ffabf3] uppercase font-bold block">Rating score limit</span>
                  <div className="text-3xl font-black font-mono text-white">
                    20.00 <span className="text-xs text-[#ffabf3]">MAX</span>
                  </div>
                  <p className="text-[9px] text-[#b9cac9] leading-relaxed">
                    General members and creators rate each other after interactions. High ratings boost match priority, while low scores limit profile visibility.
                  </p>
                </div>
              </div>
            </DoubleBezelCard>
          </div>

          <div className="lg:col-span-7 space-y-6 text-left">
            <h2 className="font-['Outfit'] text-2xl sm:text-4xl font-black text-white uppercase tracking-tight">
              Rating & Quick Role Switching
            </h2>
            <div className="space-y-4 text-xs sm:text-sm text-[#b9cac9] leading-relaxed">
              <p>
                To maintain high community standards, both creators and members rate their matches. Positive rating velocity boosts visibility in search priority.
              </p>
              <p>
                We keep the onboarding flow simple. **Every creator registers as a general member first.** This ensures you pass the initial safety and liveness check. Once registered, you can toggle Creator Mode inside your settings panel to unlock publishing tools, streaming control rooms, and geofencing filters.
              </p>
            </div>
            <div className="flex items-center gap-3 p-4 bg-white/[0.02] border border-white/5 rounded-3xl">
              <UserCheck className="w-5 h-5 text-[#00fbfb]" />
              <span className="text-[11px] text-[#b9cac9] leading-relaxed">
                Register once, explore matching, and toggle creator options instantly. No dual accounts needed.
              </span>
            </div>
          </div>
        </section>

        {/* Section 7: Extra Platform Features */}
        <section className="space-y-8">
          <div className="text-left space-y-3">
            <h2 className="font-['Outfit'] text-2xl sm:text-4xl font-black text-white uppercase tracking-tight">
              Safety & Security Shield
            </h2>
            <p className="text-xs sm:text-sm text-[#b9cac9] max-w-2xl leading-relaxed">
              Safety isn't an afterthought on SECCION. We run active sweeps and custom layers to protect creators and members alike.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-white/[0.02] border border-white/5 rounded-3xl text-left space-y-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center">
                <Shield className="w-4 h-4 text-emerald-400" />
              </div>
              <h3 className="text-xs font-bold text-white uppercase">DRM Sweeper Protection</h3>
              <p className="text-[10px] text-[#b9cac9] leading-relaxed">
                Our automated Web Sweeper scans external file locks and index caches to locate and remove unauthorized content leaks, protecting creator copyright.
              </p>
            </div>

            <div className="p-6 bg-white/[0.02] border border-white/5 rounded-3xl text-left space-y-3">
              <div className="w-8 h-8 rounded-lg bg-[#00fbfb]/10 border border-[#00fbfb]/25 flex items-center justify-center">
                <Globe className="w-4 h-4 text-[#00fbfb]" />
              </div>
              <h3 className="text-xs font-bold text-white uppercase">Geofencing Filters</h3>
              <p className="text-[10px] text-[#b9cac9] leading-relaxed">
                Creators can geofence specific countries, cities, or provinces to block local visibility and prevent acquaintances or family from discovering their profile.
              </p>
            </div>

            <div className="p-6 bg-white/[0.02] border border-white/5 rounded-3xl text-left space-y-3">
              <div className="w-8 h-8 rounded-lg bg-[#ffabf3]/10 border border-[#ffabf3]/25 flex items-center justify-center">
                <FileText className="w-4 h-4 text-[#ffabf3]" />
              </div>
              <h3 className="text-xs font-bold text-white uppercase">Contract Copilot</h3>
              <p className="text-[10px] text-[#b9cac9] leading-relaxed">
                A built-in scanner that automatically reviews external agency agreements for predatory lock-in conditions, protecting creator intellectual property.
              </p>
            </div>
          </div>
        </section>

        {/* Final Call to Action */}
        <section className="pt-12 text-center space-y-6">
          <h2 className="font-['Outfit'] text-3xl sm:text-5xl font-black text-white uppercase tracking-tight">
            Ready to Find Your Resonance?
          </h2>
          <p className="text-[#b9cac9] text-xs sm:text-sm max-w-md mx-auto">
            Take the onboarding quest to discover your archetype, sync your vibes, and unlock genuine connections.
          </p>
          <div className="flex justify-center">
            <Link 
              href="/early-access"
              className="px-10 py-4 rounded-full bg-[#00fbfb] text-black font-mono text-xs font-black uppercase tracking-widest hover:shadow-[0_0_25px_rgba(0,251,251,0.6)] transition active:scale-[0.98] cursor-pointer inline-flex items-center gap-2"
            >
              <span>Start Onboarding Quest</span>
              <ArrowRight className="w-4 h-4 text-black" />
            </Link>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="relative z-10 bg-[#0B0C10] border-t border-white/10 flex flex-col items-center justify-center w-full px-4 sm:px-6 md:px-12 lg:px-20 py-12 gap-8 text-center mt-20">
        {/* Top: Centered 3D Icon */}
        <div className="flex justify-center">
          <img 
            src="/assets/logo/logo-mark.png" 
            alt="SECCION Icon" 
            className="w-12 h-12 md:w-14 md:h-14 drop-shadow-[0_0_20px_rgba(0,251,251,0.4)] object-contain" 
          />
        </div>

        {/* Middle: Navigation Links */}
        <div className="flex flex-wrap justify-center gap-4 sm:gap-8">
          <Link className="text-[#b9cac9] hover:text-[#ffabf3] transition-colors font-mono text-[11px] font-medium tracking-widest uppercase" href="/privacy">Your Privacy</Link>
          <Link className="text-[#b9cac9] hover:text-[#ffabf3] transition-colors font-mono text-[11px] font-medium tracking-widest uppercase" href="/rules">The Rules</Link>
          <Link className="text-[#b9cac9] hover:text-[#ffabf3] transition-colors font-mono text-[11px] font-medium tracking-widest uppercase" href="/creator-hub">Creator Hub</Link>
          <Link className="text-[#b9cac9] hover:text-[#ffabf3] transition-colors font-mono text-[11px] font-medium tracking-widest uppercase" href="/hit-us-up">Hit Us Up</Link>
        </div>

        {/* Bottom: Clean Wordmark Only */}
        <div className="flex flex-col items-center gap-3">
          <img 
            src="/assets/logo/logo-wordmark.png" 
            alt="SECCION Logo" 
            className="h-8 md:h-10 drop-shadow-[0_0_25px_rgba(0,251,251,0.4)] object-contain" 
          />
          <p className="font-mono text-[11px] font-medium tracking-widest text-[#b9cac9] opacity-40 pt-2">© 2026 SECCION. ALL RIGHTS RESERVED.</p>
        </div>
      </footer>

    </div>
  );
}
