"use client";

import React, { useState } from "react";
import { useTranslation } from "@/context/LanguageContext";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowUpRight, 
  ShieldCheck, 
  Sparkles, 
  Zap, 
  EyeOff, 
  Lock, 
  Unlock, 
  Scale, 
  ChevronRight, 
  Check, 
  UserCheck, 
  HelpCircle, 
  Send,
  Phone,
  Mail,
  SendHorizontal,
  Play,
  MapPin,
  Loader2
} from "lucide-react";
import StudioTourModal from "@/components/onboarding/StudioTourModal";
import VisibilityAdvisor from "@/components/onboarding/VisibilityAdvisor";
import PublicNavbar from "@/components/PublicNavbar";

const CITIES = [
  // Pre-launch cities (top of list)
  { value: 'medellin', label: '🥇 Medellín, Colombia', group: 'Pre-Launch' },
  { value: 'bogota', label: '🥈 Bogotá, Colombia', group: 'Pre-Launch' },
  { value: 'barcelona', label: '🥉 Barcelona, Spain', group: 'Pre-Launch' },
  { value: 'lisbon', label: 'Lisbon, Portugal', group: 'Pre-Launch' },
  { value: 'mexico-city', label: 'Mexico City, Mexico', group: 'Pre-Launch' },
  // Expansion cities
  { value: 'berlin', label: 'Berlin, Germany', group: 'Expansion' },
  { value: 'bucharest', label: 'Bucharest, Romania', group: 'Expansion' },
  { value: 'london', label: 'London, UK', group: 'Expansion' },
  { value: 'miami', label: 'Miami, USA', group: 'Expansion' },
  { value: 'bangkok', label: 'Bangkok, Thailand', group: 'Global' },
  { value: 'sao-paulo', label: 'São Paulo, Brazil', group: 'Global' },
  { value: 'other', label: 'Other City', group: 'Global' },
];

// Reusable Double-Bezel Container (Doppelrand)
function DoubleBezelCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-[2rem] sm:rounded-[2.5rem] p-1 bg-white/[0.04] border border-white/10 shadow-[0_24px_48px_-12px_rgba(0,0,0,0.6)] backdrop-blur-xl relative overflow-hidden ${className}`}>
      {/* Outer Glow Overlay */}
      <div className="absolute inset-0 border border-white/5 rounded-[2rem] sm:rounded-[2.5rem] pointer-events-none" />
      <div className="rounded-[calc(2rem-0.25rem)] sm:rounded-[calc(2.5rem-0.25rem)] bg-[#0F0F1A]/90 p-4 sm:p-6 md:p-8 border border-white/5 relative z-10">
        {children}
      </div>
    </div>
  );
}

// Monospace number component for precise metrics
function MonoNumber({ value, suffix = "" }: { value: string | number; suffix?: string }) {
  return (
    <span className="font-mono text-[#66FCF1] text-glow font-bold tracking-tight">
      {value}{suffix}
    </span>
  );
}

export default function BecomeCreatorPage() {
  const { t } = useTranslation();
  // Tour State
  const [isTourOpen, setIsTourOpen] = useState<boolean>(false);

  // Calculator State
  const [earnings, setEarnings] = useState<number>(8000);
  
  // Face Blur Demo State
  const [isFaceBlurred, setIsFaceBlurred] = useState<boolean>(true);

  // Form Flow States
  const [formStep, setFormStep] = useState<"input" | "submitting" | "success">("input");
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    telegram: "",
    city: "",
    link1: "",
    link2: "",
    link3: "",
    claimOffer: true,
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Load from localStorage on mount
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const isApplied = localStorage.getItem("seccion_creator_applied");
      const savedData = localStorage.getItem("seccion_creator_data");
      if (isApplied === "true" && savedData) {
        try {
          const parsed = JSON.parse(savedData);
          setFormData(prev => ({ ...prev, ...parsed }));
          setFormStep("success");
        } catch (e) {
          console.error("Failed to parse saved creator application:", e);
        }
      }
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const validateInput = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.fullName) newErrors.fullName = "Full Name / Creator Name is required";
    
    if (!formData.email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Invalid email format";
    
    if (!formData.link1) newErrors.link1 = "At least one social/creator profile link is required";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateInput()) return;
    
    setFormStep("submitting");
    
    try {
      const response = await fetch('/api/v2/creator/apply', { 
        method: 'POST', 
        body: JSON.stringify(formData) 
      });
      
      if (response.status === 409) {
        setErrors({ submit: "An application with this email already exists" });
        setFormStep("input");
        return;
      }
      
      if (!response.ok) {
        setErrors({ submit: "An error occurred submitting your application. Please try again." });
        setFormStep("input");
        return;
      }
      
      if (typeof window !== "undefined") {
        localStorage.setItem("seccion_creator_applied", "true");
        localStorage.setItem("seccion_creator_data", JSON.stringify(formData));
      }
      setFormStep("success");
    } catch (error) {
      setErrors({ submit: "Network error. Please try again later." });
      setFormStep("input");
    }
  };

  // Savings math
  const traditionalAgencyFee = earnings * 0.40; // 40% agency
  const traditionalPlatformFee = earnings * 0.20; // 20% OF/Fansly
  const traditionalCreatorKeeps = earnings * 0.40; // keeps 40%

  const seccionFee = earnings * 0.10; // 10% platform
  const seccionCreatorKeeps = earnings * 0.90; // keeps 90%
  const monthlySavings = seccionCreatorKeeps - traditionalCreatorKeeps;

  return (
    <div 
      className="w-full min-h-[100dvh] text-[#e2e2e2] overflow-x-hidden font-sans bg-transparent relative flex flex-col"
      style={{
        backgroundImage: "radial-gradient(circle at 15% 50%, rgba(255, 171, 243, 0.05), transparent 25%), radial-gradient(circle at 85% 30%, rgba(0, 251, 251, 0.05), transparent 25%)"
      }}
    >
      {/* Background mesh glow */}
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

      {/* Public Navbar */}
      <PublicNavbar activeTab="become-creator" />

      {/* Hero Section */}
      <header className="relative z-10 pt-24 sm:pt-32 pb-14 sm:pb-20 px-4 sm:px-6 md:px-12 lg:px-20 max-w-[1440px] mx-auto w-full flex-grow flex flex-col justify-center overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10 lg:gap-16 items-center w-full max-w-full">
          {/* Hero text */}
          <div className="col-span-12 lg:col-span-7 space-y-5 sm:space-y-7 text-left min-w-0">
            <div className="space-y-3 sm:space-y-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#ffabf3]/30 bg-[#ffabf3]/5 backdrop-blur-md">
                <Sparkles className="w-3.5 h-3.5 text-[#ffabf3] animate-pulse" />
                <span className="text-[10px] font-mono font-bold text-[#ffabf3] uppercase tracking-[0.2em]">
                  Join the Creator Campaign
                </span>
              </div>
              <h1 className="font-display font-black leading-[1.05] tracking-tight text-white text-[32px] sm:text-[56px] md:text-[72px] lg:text-[80px] text-left">
                Your Space. <br/>
                Your Rules. <br/>
                Keep <span className="text-[#00fbfb] drop-shadow-[0_0_35px_rgba(0,251,251,0.5)]">80%</span>.
              </h1>
            </div>
            
            <p className="max-w-full sm:max-w-[580px] text-xs sm:text-base text-[#b9cac9] leading-relaxed font-medium break-words text-left">
              Run your creator business independently. Reclaim your income from agencies with a built-in AI assistant. The first 500 creators receive their AI assistant free for Year 1.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <a 
                href="#apply" 
                className="group px-5 py-3 rounded-full bg-[#00fbfb] text-black font-mono text-[11px] font-black uppercase tracking-wider inline-flex items-center justify-between gap-3 hover:shadow-[0_0_30px_rgba(0,251,251,0.6)] active:scale-[0.98] transition-all duration-300 min-h-[44px] cursor-pointer"
              >
                <span>Claim Your Free Year</span>
                <span className="w-6 h-6 rounded-full bg-black/10 flex items-center justify-center shrink-0 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </span>
              </a>
              <button 
                type="button"
                onClick={() => setIsTourOpen(true)}
                className="group px-5 py-3 rounded-full border border-[#ffabf3]/40 bg-[#ffabf3]/5 text-[#ffabf3] font-mono text-[11px] font-black uppercase tracking-wider inline-flex items-center justify-between gap-3 hover:bg-[#ffabf3]/15 hover:border-[#ffabf3] active:scale-[0.98] transition-all duration-300 shadow-[0_0_15px_rgba(255,171,243,0.2)] hover:shadow-[0_0_25px_rgba(255,171,243,0.4)] min-h-[44px] cursor-pointer"
              >
                <span>Take Demo Tour</span>
                <span className="w-6 h-6 rounded-full bg-[#ffabf3]/10 flex items-center justify-center shrink-0">
                  <Play className="w-3 h-3 fill-current" />
                </span>
              </button>
            </div>
          </div>

          {/* Glowing cockpit preview */}
          <div className="col-span-12 lg:col-span-5 flex justify-center min-w-0 w-full">
            <div className="relative w-full max-w-full sm:max-w-[420px] rounded-[2.5rem] p-1.5 bg-gradient-to-tr from-[#00fbfb]/20 via-white/5 to-[#ffabf3]/20 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.6)] overflow-hidden">
              <div className="w-full h-full rounded-[calc(2.5rem-0.375rem)] bg-[#0A0A14]/95 border border-white/5 p-4 sm:p-6 space-y-4 sm:space-y-6 relative overflow-hidden flex flex-col justify-between">
                {/* Visual grid overlay */}
                <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(rgba(255,255,255,1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,1)_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />
                
                {/* Mock Stream Header */}
                <div className="flex justify-between items-center border-b border-white/5 pb-3">
                  <div className="flex items-center gap-2.5 sm:gap-3">
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-[#ffabf3] to-[#00fbfb] p-0.5 shrink-0">
                      <div className="w-full h-full rounded-[10px] bg-[#0A0A14] flex items-center justify-center text-xs font-black text-[#00fbfb]">S</div>
                    </div>
                    <div className="text-left">
                      <h4 className="text-[11px] sm:text-[12px] font-bold text-white leading-none">SECCIØN Studio</h4>
                      <span className="text-[8px] font-mono text-[#ffabf3] uppercase tracking-wider">Live Station</span>
                    </div>
                  </div>
                  <span className="h-2 w-2 rounded-full bg-[#39FF14] animate-pulse shrink-0" />
                </div>

                {/* Mock Live HUD Compatibility metrics */}
                <div className="flex-1 flex flex-col justify-center space-y-4 my-3 sm:my-5">
                  <div className="text-center space-y-1">
                    <span className="text-[9px] font-mono uppercase tracking-widest text-white/40">Audience Aura HUD</span>
                    <h3 className="text-2xl sm:text-3xl font-black text-white leading-none">
                      <MonoNumber value="94.2" suffix="%" />
                    </h3>
                    <p className="text-[9px] text-[#00fbfb] tracking-wider font-semibold">Synergy Sync with Top Viewer</p>
                  </div>

                  <div className="space-y-2">
                    <div className="p-3 bg-white/[0.04] border border-white/5 rounded-2xl flex flex-row justify-between items-center gap-2">
                      <span className="text-[10px] sm:text-xs text-white/70 font-medium shrink-0">Chatter Module</span>
                      <span className="text-[8px] sm:text-[9px] font-mono text-[#39FF14] bg-[#39FF14]/10 border border-[#39FF14]/30 px-2.5 py-0.5 rounded-full uppercase shrink-0 font-bold">Running 24/7</span>
                    </div>
                    <div className="p-3 bg-white/[0.04] border border-white/5 rounded-2xl flex flex-row justify-between items-center gap-2">
                      <span className="text-[10px] sm:text-xs text-white/70 font-medium shrink-0">Face Blur Encryption</span>
                      <span className="text-[8px] sm:text-[9px] font-mono text-[#00fbfb] bg-[#00fbfb]/10 border border-[#00fbfb]/30 px-2.5 py-0.5 rounded-full uppercase shrink-0 font-bold">Active</span>
                    </div>
                  </div>
                </div>

                {/* Status Bar */}
                <div className="border-t border-white/5 pt-3 sm:pt-4 flex justify-between items-center">
                  <div className="text-left">
                    <span className="text-[8px] font-mono uppercase text-white/40 block">Net Keeps</span>
                    <span className="text-xs sm:text-sm font-bold text-white"><MonoNumber value="80" suffix="%" /></span>
                  </div>
                  <div className="text-right">
                    <span className="text-[8px] font-mono uppercase text-white/40 block">Middlemen Cut</span>
                    <span className="text-xs sm:text-sm font-bold text-rose-500 font-mono">0%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Savings Calculator Section */}
      <section id="calculator" className="relative z-10 py-24 px-4 sm:px-6 md:px-12 lg:px-20 max-w-[1440px] mx-auto w-full border-t border-white/5 bg-black/20">
        <div className="max-w-[900px] mx-auto space-y-12 text-center">
          <div className="space-y-3">
            <span className="text-[10px] font-mono font-bold text-[#00fbfb] bg-[#00fbfb]/5 border border-[#00fbfb]/20 px-3 py-1 rounded-full uppercase tracking-wider">
              Your Space. Your Savings.
            </span>
            <h2 className="font-display text-3xl md:text-5xl font-black text-white tracking-tight">
              Calculate Your True Earnings
            </h2>
            <p className="max-w-[550px] mx-auto text-xs sm:text-sm text-[#b9cac9] leading-relaxed">
              Traditional management agencies and standard platform fees combined can take up to 60% of your gross income. Drag the slider below to see the difference.
            </p>
          </div>

          <DoubleBezelCard className="max-w-[720px] mx-auto">
            <div className="space-y-8">
              {/* Earnings Slider Input */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-mono uppercase text-[#b9cac9]">Gross Monthly Earnings</span>
                  <span className="text-xl sm:text-2xl font-bold text-white">
                    <MonoNumber value={earnings.toLocaleString()} suffix="€" />
                  </span>
                </div>
                <input 
                  type="range" 
                  min="1000" 
                  max="50000" 
                  step="500"
                  value={earnings}
                  onChange={(e) => setEarnings(Number(e.target.value))}
                  className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#00fbfb] focus:outline-none"
                  style={{
                    background: `linear-gradient(to right, #00fbfb 0%, #00fbfb ${((earnings - 1000) / 49000) * 100}%, rgba(255,255,255,0.1) ${((earnings - 1000) / 49000) * 100}%, rgba(255,255,255,0.1) 100%)`
                  }}
                />
                <div className="flex justify-between text-[9px] font-mono text-white/30 uppercase">
                  <span>1,000 €</span>
                  <span>25,000 €</span>
                  <span>50,000 €</span>
                </div>
              </div>

              {/* Comparison columns */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-white/5">
                {/* Traditional Agency */}
                <div className="p-5 bg-white/[0.02] border border-white/5 rounded-2xl space-y-4 text-left">
                  <h4 className="text-[10px] font-mono font-bold text-rose-500 uppercase tracking-widest">Agency + Competitors</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-[#b9cac9]">
                      <span>Platform Cut (20%)</span>
                      <span className="font-mono text-white/70">-{traditionalPlatformFee.toLocaleString()} €</span>
                    </div>
                    <div className="flex justify-between text-xs text-[#b9cac9]">
                      <span>Agency Manager Cut (40%)</span>
                      <span className="font-mono text-white/70">-{traditionalAgencyFee.toLocaleString()} €</span>
                    </div>
                  </div>
                  <div className="border-t border-white/5 pt-3 flex justify-between items-center">
                    <span className="text-xs font-bold text-white">What You Keep (40%)</span>
                    <span className="font-mono text-rose-400 font-bold">{traditionalCreatorKeeps.toLocaleString()} €</span>
                  </div>
                </div>

                {/* SECCIØN */}
                <div className="p-5 bg-[#00fbfb]/[0.02] border border-[#00fbfb]/20 rounded-2xl space-y-4 text-left relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-[120px] h-[120px] rounded-full bg-[#00fbfb]/5 blur-2xl pointer-events-none" />
                  <h4 className="text-[10px] font-mono font-bold text-[#00fbfb] uppercase tracking-widest">SECCIØN space</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-[#b9cac9]">
                      <span>Founding Creator Rate (10%)</span>
                      <span className="font-mono text-white/70">-{seccionFee.toLocaleString()} €</span>
                    </div>
                    <div className="flex justify-between text-xs text-[#b9cac9]">
                      <span>AI Assistant Year 1 (0%)</span>
                      <span className="font-mono text-[#39FF14] font-semibold">FREE</span>
                    </div>
                  </div>
                  <div className="border-t border-white/10 pt-3 flex justify-between items-center">
                    <span className="text-xs font-bold text-white">What You Keep (90%)</span>
                    <span className="font-mono text-[#00fbfb] text-glow font-bold">{seccionCreatorKeeps.toLocaleString()} €</span>
                  </div>
                </div>
              </div>

              {/* Savings Announcement */}
              <div className="p-4 bg-[#39FF14]/5 border border-[#39FF14]/20 rounded-2xl text-center">
                <p className="text-xs text-[#b9cac9] font-medium leading-relaxed">
                  By running your channel independently on SECCIØN, you save <MonoNumber value={monthlySavings.toLocaleString()} suffix=" €/month" />
                </p>
              </div>

              <p className="text-[10px] text-[#b9cac9]/50 font-medium leading-normal max-w-[500px] mx-auto">
                After your free year, using the AI Assistant is just 69€/month, or you can choose to manage your space manually at our free standard platform rate. You always retain 80% of your subscription and tip revenues. After Year 1, the standard platform rate is 20% (you keep 80%). No hidden fees.
              </p>
            </div>
          </DoubleBezelCard>
        </div>
      </section>

      {/* Bento Grid Features Section */}
      <section className="relative z-10 py-24 px-4 sm:px-6 md:px-12 lg:px-20 max-w-[1440px] mx-auto w-full border-t border-white/5">
        <div className="space-y-12">
          <div className="text-left space-y-3">
            <span className="text-[10px] font-mono font-bold text-[#ffabf3] bg-[#ffabf3]/5 border border-[#ffabf3]/25 px-3 py-1 rounded-full uppercase tracking-wider">
              Reclaim Your Freedom
            </span>
            <h2 className="font-display text-3xl md:text-5xl font-black text-white tracking-tight">
              Your Agency in a Single Toggle
            </h2>
            <p className="max-w-[550px] text-xs sm:text-sm text-[#b9cac9] leading-relaxed">
              We built our AI Operations Assistant to handle the repetitive, complex chores that traditional agencies charge a 40% commission to manage.
            </p>
          </div>

          {/* Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Card 1: Fan Connection */}
            <div className="p-[1px] bg-white/[0.04] border border-white/10 rounded-[2.5rem] md:col-span-2">
              <div className="bg-[#0F0F1A]/90 p-8 rounded-[calc(2.5rem-1px)] h-full flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div className="w-10 h-10 rounded-xl bg-[#00fbfb]/10 border border-[#00fbfb]/25 flex items-center justify-center">
                    <Zap className="w-5 h-5 text-[#00fbfb]" />
                  </div>
                  <h3 className="font-display text-xl font-bold text-white">Fan Connection Chatter</h3>
                  <p className="text-xs text-[#b9cac9] leading-relaxed">
                    Our smart assistant is trained on your chat history to perfectly replicate your unique voice and tone. It manages direct messages 24/7, segments fans based on their spending levels, and recommends content unlocks—labels bots transparently, and automatically pauses for deeper, level-4 matched connections.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 text-[9px] font-mono text-[#00fbfb]/80">
                  <span className="bg-[#00fbfb]/5 border border-[#00fbfb]/20 px-2.5 py-1 rounded-full">24/7 DMs</span>
                  <span className="bg-[#00fbfb]/5 border border-[#00fbfb]/20 px-2.5 py-1 rounded-full">Bot Transparency Labels</span>
                  <span className="bg-[#00fbfb]/5 border border-[#00fbfb]/20 px-2.5 py-1 rounded-full">Adaptive Level Breaks</span>
                </div>
              </div>
            </div>

            {/* Card 2: Legal Copilot */}
            <div className="p-[1px] bg-white/[0.04] border border-white/10 rounded-[2.5rem] md:col-span-1">
              <div className="bg-[#0F0F1A]/90 p-8 rounded-[calc(2.5rem-1px)] h-full flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div className="w-10 h-10 rounded-xl bg-[#ffabf3]/10 border border-[#ffabf3]/25 flex items-center justify-center">
                    <Scale className="w-5 h-5 text-[#ffabf3]" />
                  </div>
                  <h3 className="font-display text-xl font-bold text-white">Legal Contract Copilot</h3>
                  <p className="text-xs text-[#b9cac9] leading-relaxed">
                    Instantly screen brand sponsorships or management contracts. Our natural language assistant flags predatory sunset clauses (which claim commission on your work after contracts end) and protects you from signing away your AI digital replica likeness rights.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 text-[9px] font-mono text-[#ffabf3]/80">
                  <span className="bg-[#ffabf3]/5 border border-[#ffabf3]/20 px-2.5 py-1 rounded-full">Contract Screening</span>
                  <span className="bg-[#ffabf3]/5 border border-[#ffabf3]/20 px-2.5 py-1 rounded-full">Likeness Protection</span>
                </div>
              </div>
            </div>

            {/* Card 3: DRM Sweeper */}
            <div className="p-[1px] bg-white/[0.04] border border-white/10 rounded-[2.5rem] md:col-span-1">
              <div className="bg-[#0F0F1A]/90 p-8 rounded-[calc(2.5rem-1px)] h-full flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div className="w-10 h-10 rounded-xl bg-[#ffabf3]/10 border border-[#ffabf3]/25 flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5 text-[#ffabf3]" />
                  </div>
                  <h3 className="font-display text-xl font-bold text-white">DRM Content Guard</h3>
                  <p className="text-xs text-[#b9cac9] leading-relaxed">
                    Our platform automatically sweeps the web to find unauthorized uploads of your creations and generates legal DMCA takedown requests instantly. Keep your intellectual property strictly yours.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 text-[9px] font-mono text-[#ffabf3]/80">
                  <span className="bg-[#ffabf3]/5 border border-[#ffabf3]/20 px-2.5 py-1 rounded-full">Auto-Takedowns</span>
                  <span className="bg-[#ffabf3]/5 border border-[#ffabf3]/20 px-2.5 py-1 rounded-full">Web Leak Sweeps</span>
                </div>
              </div>
            </div>

            {/* Card 4: Sponsored Creators Match Loop */}
            <div className="p-[1px] bg-white/[0.04] border border-white/10 rounded-[2.5rem] md:col-span-2">
              <div className="bg-[#0F0F1A]/90 p-8 rounded-[calc(2.5rem-1px)] h-full flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div className="w-10 h-10 rounded-xl bg-[#00fbfb]/10 border border-[#00fbfb]/25 flex items-center justify-center">
                    <UserCheck className="w-5 h-5 text-[#00fbfb]" />
                  </div>
                  <h3 className="font-display text-xl font-bold text-white">Match-Gated Sponsored Creators</h3>
                  <p className="text-xs text-[#b9cac9] leading-relaxed">
                    Ditch cold, anonymous transaction feeds. Members can only subscribe once they match with you through our Synergy Engine. Your subscribers form a Sponsored Creators circle, translating mutual vibe compatibility into highly invested fans, slashing churn rates, and building stable long-term support.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 text-[9px] font-mono text-[#00fbfb]/80">
                  <span className="bg-[#00fbfb]/5 border border-[#00fbfb]/20 px-2.5 py-1 rounded-full">Synergy Matching</span>
                  <span className="bg-[#00fbfb]/5 border border-[#00fbfb]/20 px-2.5 py-1 rounded-full">Low Subscriber Churn</span>
                  <span className="bg-[#00fbfb]/5 border border-[#00fbfb]/20 px-2.5 py-1 rounded-full">Vibe Compatibility</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Face Blur Interactive Section */}
      <section className="relative z-10 py-16 sm:py-24 px-4 sm:px-6 md:px-12 lg:px-20 max-w-[1440px] mx-auto w-full border-t border-white/5 bg-black/10 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12 items-center w-full max-w-full">
          
          {/* Blur Copy */}
          <div className="col-span-12 lg:col-span-7 space-y-4 sm:space-y-6 text-left min-w-0">
            <span className="text-[10px] font-mono font-bold text-[#00fbfb] bg-[#00fbfb]/5 border border-[#00fbfb]/20 px-3 py-1 rounded-full uppercase tracking-wider">
              Total Creator Control
            </span>
            <h2 className="font-display text-2xl sm:text-3xl md:text-5xl font-black text-white tracking-tight">
              Face Blur Encryption
            </h2>
            <p className="text-xs sm:text-sm text-[#b9cac9] leading-relaxed font-medium break-words">
              You are in absolute control of who sees your content, and when. Our Face Blur technology automatically obscures your face on all public discovery feeds. 
              Only you decide when to lift the blur—whether automatically when a matched member climbs to Chemistry Level 4 by chatting and interacting with you, or immediately when they choose a subscription.
            </p>
            <div className="space-y-3 sm:space-y-4 font-medium text-xs text-[#b9cac9]">
              <div className="flex items-start sm:items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-[#00fbfb]/10 border border-[#00fbfb]/30 flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
                  <Check className="w-3.5 h-3.5 text-[#00fbfb]" />
                </div>
                <span className="break-words">Stay anonymous to the public feed and search results</span>
              </div>
              <div className="flex items-start sm:items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-[#00fbfb]/10 border border-[#00fbfb]/30 flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
                  <Check className="w-3.5 h-3.5 text-[#00fbfb]" />
                </div>
                <span className="break-words">Selectively reveal your content only when trust is established</span>
              </div>
              <div className="flex items-start sm:items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-[#00fbfb]/10 border border-[#00fbfb]/30 flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
                  <Check className="w-3.5 h-3.5 text-[#00fbfb]" />
                </div>
                <span className="break-words">Geofencing controls to hide your profile in specific countries or cities</span>
              </div>
            </div>
          </div>

          {/* Interactive Blur Card */}
          <div className="col-span-12 lg:col-span-5 flex justify-center min-w-0 w-full">
            <div className="w-full max-w-full sm:max-w-[360px] rounded-[2rem] sm:rounded-[2.5rem] p-1 bg-white/[0.03] border border-white/10 shadow-2xl relative">
              <div className="rounded-[calc(2rem-0.25rem)] sm:rounded-[calc(2.5rem-0.25rem)] bg-[#0F0F1A]/95 p-4 sm:p-6 border border-white/5 space-y-4 sm:space-y-6">
                
                {/* Profile Pic Frame */}
                <div className="relative aspect-square w-full rounded-2xl overflow-hidden border border-white/5 bg-black/20">
                  {/* Base Image (Simulating Creator portrait) */}
                  <img 
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80" 
                    alt="Siena" 
                    className="w-full h-full object-cover transition-all duration-700" 
                    style={{ filter: isFaceBlurred ? "blur(25px)" : "blur(0px)" }}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80";
                    }}
                  />
                  
                  {/* Status Indicator overlay */}
                  <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-10 px-2.5 sm:px-3 py-1 rounded-full backdrop-blur-md bg-black/60 border border-white/10 flex items-center gap-1.5 max-w-[calc(100%-1.5rem)]">
                    {isFaceBlurred ? (
                      <>
                        <Lock className="w-3.5 h-3.5 text-[#ffabf3] shrink-0" />
                        <span className="text-[8px] sm:text-[9px] font-mono font-bold text-[#ffabf3] uppercase tracking-wider truncate">Blur Encryption Active</span>
                      </>
                    ) : (
                      <>
                        <Unlock className="w-3.5 h-3.5 text-[#00fbfb] shrink-0" />
                        <span className="text-[8px] sm:text-[9px] font-mono font-bold text-[#00fbfb] uppercase tracking-wider truncate">Decrypted (L4 Trust)</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Control Swtich */}
                <div className="flex justify-between items-center border-t border-white/5 pt-3 sm:pt-4">
                  <div className="text-left">
                    <h4 className="text-xs font-bold text-white">Siena Vibe</h4>
                    <span className="text-[9px] font-mono text-[#b9cac9]">Exclusive Artist Vibe</span>
                  </div>
                  
                  <button 
                    onClick={() => setIsFaceBlurred(!isFaceBlurred)}
                    className={`w-14 h-8 rounded-full p-1 transition-colors duration-300 relative focus:outline-none cursor-pointer shrink-0 ${isFaceBlurred ? "bg-white/10" : "bg-[#00fbfb]/20 border border-[#00fbfb]/30"}`}
                  >
                    <motion.div 
                      layout
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      className={`w-6 h-6 rounded-full flex items-center justify-center shadow-md ${isFaceBlurred ? "bg-white/40" : "bg-[#00fbfb]"}`}
                      style={{
                        marginLeft: isFaceBlurred ? "0px" : "24px"
                      }}
                    >
                      {isFaceBlurred ? (
                        <Lock className="w-3.5 h-3.5 text-black" />
                      ) : (
                        <Unlock className="w-3.5 h-3.5 text-black" />
                      )}
                    </motion.div>
                  </button>
                </div>

              </div>
            </div>
          </div>

        </div>

        {/* Visibility & Attractiveness Advisor */}
        <div className="max-w-[840px] mx-auto mt-16 pt-12 border-t border-white/5 space-y-6 text-center overflow-visible relative">
          <div className="space-y-2">
            <span className="text-[9px] font-mono text-[#ffabf3] uppercase font-bold tracking-wider">Growth Optimization</span>
            <h3 className="text-xl font-bold text-white uppercase tracking-wider">Visibility & Attractiveness Advisor</h3>
            <p className="text-xs text-[#b9cac9] max-w-lg mx-auto">
              How will your privacy choices impact your subscriber yield? Toggle the config modes below to see how our reveal systems balance privacy with matching attraction.
            </p>
          </div>
          <VisibilityAdvisor />
        </div>

      </section>

      {/* Application Form Section */}
      <section id="apply" className="relative z-10 py-24 px-4 sm:px-6 md:px-12 lg:px-20 max-w-[1440px] mx-auto w-full border-t border-white/5">
        <div className="max-w-[720px] mx-auto space-y-12">
          
          <div className="text-center space-y-3">
            <span className="text-[10px] font-mono font-bold text-[#ffabf3] bg-[#ffabf3]/5 border border-[#ffabf3]/25 px-3 py-1 rounded-full uppercase tracking-wider">
              Enlist as Creator
            </span>
            <h2 className="font-display text-3xl md:text-5xl font-black text-white tracking-tight">
              Request Your Creator Access
            </h2>
            <p className="max-w-[500px] mx-auto text-xs sm:text-sm text-[#b9cac9] leading-relaxed font-medium">
              We review every creator manually to maintain high vibe standards. Share your profiles, claim your free year, and let's get you set up.
            </p>
          </div>

          <AnimatePresence mode="wait">
            {(formStep === "input" || formStep === "submitting") && (
              <motion.div
                key="form-input"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.4 }}
              >
                <DoubleBezelCard>
                  <form onSubmit={handleFormSubmit} className="space-y-6">
                    {/* Double Columns */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      
                      {/* Creator Name */}
                      <div className="space-y-2 text-left md:col-span-2">
                        <label className="text-[10px] font-mono uppercase text-[#b9cac9] tracking-wider block">Full Name / Creator Name</label>
                        <div className="relative">
                          <UserCheck className="w-4 h-4 text-white/30 absolute left-4 top-1/2 -translate-y-1/2" />
                          <input 
                            type="text"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleInputChange}
                            placeholder="e.g. Siena Vibe or Sarah Jenkins"
                            className={`w-full bg-black/40 border ${errors.fullName ? "border-rose-500" : "border-white/10"} rounded-xl pl-11 pr-4 py-3 text-xs text-white placeholder-white/20 outline-none focus:border-[#00fbfb] transition font-sans`}
                            suppressHydrationWarning
                          />
                        </div>
                        {errors.fullName && <p className="text-[9px] font-mono text-rose-400">{errors.fullName}</p>}
                      </div>
                      
                      {/* Email */}
                      <div className="space-y-2 text-left">
                        <label className="text-[10px] font-mono uppercase text-[#b9cac9] tracking-wider block">Primary Email</label>
                        <div className="relative">
                          <Mail className="w-4 h-4 text-white/30 absolute left-4 top-1/2 -translate-y-1/2" />
                          <input 
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder="you@example.com"
                            className={`w-full bg-black/40 border ${errors.email ? "border-rose-500" : "border-white/10"} rounded-xl pl-11 pr-4 py-3 text-xs text-white placeholder-white/20 outline-none focus:border-[#00fbfb] transition font-sans`}
                            suppressHydrationWarning
                          />
                        </div>
                        {errors.email && <p className="text-[9px] font-mono text-rose-400">{errors.email}</p>}
                      </div>

                      {/* WhatsApp / Phone */}
                      <div className="space-y-2 text-left">
                        <label className="text-[10px] font-mono uppercase text-[#b9cac9] tracking-wider block">WhatsApp Number</label>
                        <div className="relative">
                          <Phone className="w-4 h-4 text-white/30 absolute left-4 top-1/2 -translate-y-1/2" />
                          <input 
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            placeholder="+1 (555) 019-2834"
                            className={`w-full bg-black/40 border ${errors.phone ? "border-rose-500" : "border-white/10"} rounded-xl pl-11 pr-4 py-3 text-xs text-white placeholder-white/20 outline-none focus:border-[#00fbfb] transition font-sans`}
                            suppressHydrationWarning
                          />
                        </div>
                        {errors.phone && <p className="text-[9px] font-mono text-rose-400">{errors.phone}</p>}
                      </div>

                      {/* Telegram Username */}
                      <div className="space-y-2 text-left md:col-span-2">
                        <label className="text-[10px] font-mono uppercase text-[#b9cac9] tracking-wider block">Telegram Username</label>
                        <div className="relative">
                          <Send className="w-4 h-4 text-white/30 absolute left-4 top-1/2 -translate-y-1/2" />
                          <input 
                            type="text"
                            name="telegram"
                            value={formData.telegram}
                            onChange={handleInputChange}
                            placeholder="@yourusername"
                            className={`w-full bg-black/40 border ${errors.telegram ? "border-rose-500" : "border-white/10"} rounded-xl pl-11 pr-4 py-3 text-xs text-white placeholder-white/20 outline-none focus:border-[#00fbfb] transition font-sans`}
                            suppressHydrationWarning
                          />
                        </div>
                        {errors.telegram && <p className="text-[9px] font-mono text-rose-400">{errors.telegram}</p>}
                      </div>

                      {/* City Dropdown */}
                      <div className="space-y-2 text-left md:col-span-2">
                        <label className="text-[10px] font-mono uppercase text-[#b9cac9] tracking-wider block">City</label>
                        <div className="relative">
                          <MapPin className="w-4 h-4 text-white/30 absolute left-4 top-1/2 -translate-y-1/2" />
                          <select 
                            name="city"
                            value={formData.city}
                            onChange={handleInputChange}
                            className={`w-full bg-black/40 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-xs text-white appearance-none outline-none focus:border-[#00fbfb] transition font-sans`}
                            suppressHydrationWarning
                          >
                            <option value="" disabled className="text-black bg-white">Select a city...</option>
                            {CITIES.map((c) => (
                              <option key={c.value} value={c.value} className="text-black bg-white">
                                {c.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Links to existing accounts */}
                      <div className="space-y-3 text-left md:col-span-2 border-t border-white/5 pt-4">
                        <label className="text-[10px] font-mono uppercase text-[#b9cac9] tracking-wider block">Your Content Channels (links to review)</label>
                        
                        <div className="space-y-2">
                          <input 
                            type="text"
                            name="link1"
                            value={formData.link1}
                            onChange={handleInputChange}
                            placeholder="Content Creator profile Link (required)"
                            className={`w-full bg-black/40 border ${errors.link1 ? "border-rose-500" : "border-white/10"} rounded-xl px-4 py-3 text-xs text-white placeholder-white/20 outline-none focus:border-[#00fbfb] transition font-sans`}
                            suppressHydrationWarning
                          />
                          {errors.link1 && <p className="text-[9px] font-mono text-rose-400">{errors.link1}</p>}
                          
                          <input 
                            type="text"
                            name="link2"
                            value={formData.link2}
                            onChange={handleInputChange}
                            placeholder="Social Media Profile Link (optional)"
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-white/20 outline-none focus:border-[#00fbfb] transition font-sans"
                            suppressHydrationWarning
                          />
                          
                          <input 
                            type="text"
                            name="link3"
                            value={formData.link3}
                            onChange={handleInputChange}
                            placeholder="Social Media Profile Link (optional)"
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-white/20 outline-none focus:border-[#00fbfb] transition font-sans"
                            suppressHydrationWarning
                          />
                        </div>
                      </div>

                    </div>

                    {/* Claim Offer Checkbox */}
                    <div className="flex items-start gap-3 border-t border-white/5 pt-4">
                      <input 
                        type="checkbox"
                        id="claimOffer"
                        name="claimOffer"
                        checked={formData.claimOffer}
                        onChange={handleInputChange}
                        className="w-4.5 h-4.5 rounded border-white/10 bg-black/40 text-[#00fbfb] focus:ring-0 focus:ring-offset-0 mt-0.5"
                      />
                      <label htmlFor="claimOffer" className="text-[11px] text-[#b9cac9] leading-relaxed text-left cursor-pointer">
                        I want to claim the Free Year Pack AI offer. (Free first year of AI Operations Assistant, and €69/month after the year expires).
                      </label>
                    </div>

                    {errors.submit && (
                      <p className="text-[10px] font-mono text-rose-500 font-bold mt-2">{errors.submit}</p>
                    )}

                    {/* Submit Button */}
                    <button 
                      type="submit"
                      disabled={formStep === "submitting"}
                      className="w-full py-4 bg-[#00fbfb] text-black font-mono text-xs uppercase tracking-widest font-black rounded-xl hover:shadow-[0_0_25px_rgba(102,252,241,0.5)] transition active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer mt-4 disabled:opacity-70 disabled:cursor-wait"
                    >
                      {formStep === "submitting" ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Submitting...</span>
                        </>
                      ) : (
                        <>
                          <span>Request Creator Access</span>
                          <ChevronRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </form>
                </DoubleBezelCard>
              </motion.div>
            )}

            {formStep === "success" && (
              <motion.div
                key="form-success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, type: "spring", stiffness: 300, damping: 25 }}
              >
                <DoubleBezelCard>
                  <div className="space-y-6 text-center max-w-md mx-auto py-4">
                    <div className="w-14 h-14 rounded-full bg-[#39FF14]/10 border border-[#39FF14]/30 flex items-center justify-center mx-auto">
                      <Check className="w-7 h-7 text-[#39FF14]" />
                    </div>

                    <div className="space-y-3">
                      <h3 className="font-display text-2xl font-black text-white">Application Received</h3>
                      <p className="text-xs sm:text-sm text-[#b9cac9] leading-relaxed">
                        Welcome to SECCIØN, <span className="text-[#00fbfb] font-bold">{formData.fullName || "Creator"}</span>! Your profile status is now set to <span className="font-bold text-white uppercase font-mono bg-white/5 border border-white/10 px-2 py-0.5 rounded-md">UNDER REVIEW</span>.
                      </p>
                      <p className="text-xs text-[#b9cac9]/75 leading-relaxed">
                        Our curation team will personally review your profile links within 48 hours. Once approved, we will trigger your welcome message and studio invite directly on your Telegram username (<span className="text-[#00fbfb]">{formData.telegram}</span>) and WhatsApp.
                      </p>
                    </div>

                    <button 
                      onClick={() => setIsTourOpen(true)}
                      className="w-full py-4 bg-[#00fbfb] text-black font-mono text-xs uppercase tracking-widest font-black rounded-xl hover:shadow-[0_0_25px_rgba(102,252,241,0.5)] transition active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer mt-4"
                    >
                      <span>Explore Your Studio Cockpit</span>
                      <Play className="w-3.5 h-3.5 fill-current" />
                    </button>
                    
                    <button 
                      onClick={() => {
                        if (typeof window !== "undefined") {
                          localStorage.removeItem("seccion_creator_applied");
                          localStorage.removeItem("seccion_creator_data");
                        }
                        setFormStep("input");
                        setFormData({
                          fullName: "",
                          email: "",
                          phone: "",
                          telegram: "",
                          city: "",
                          link1: "",
                          link2: "",
                          link3: "",
                          claimOffer: true,
                        });
                      }}
                      className="w-full py-2.5 bg-transparent text-white/40 hover:text-white/60 font-mono text-[10px] uppercase tracking-widest font-bold rounded-xl transition"
                    >
                      Go Back / Reset
                    </button>
                  </div>
                </DoubleBezelCard>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </section>

      {/* FAQ Section */}
      <section className="relative z-10 py-24 px-4 sm:px-6 md:px-12 lg:px-20 max-w-[800px] mx-auto w-full border-t border-white/5 bg-black/20">
        <div className="space-y-12">
          
          <div className="text-center space-y-3">
            <span className="text-[10px] font-mono font-bold text-[#ffabf3] bg-[#ffabf3]/5 border border-[#ffabf3]/25 px-3 py-1 rounded-full uppercase tracking-wider">
              Have Questions?
            </span>
            <h2 className="font-display text-3xl md:text-5xl font-black text-white tracking-tight">
              Creator Campaign FAQ
            </h2>
          </div>

          <div className="space-y-4">
            
            {/* FAQ 1 */}
            <div className="p-5 bg-white/[0.02] border border-white/5 rounded-2xl text-left space-y-2.5">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-[#00fbfb] shrink-0" />
                What is the Free Year Pack AI offer, and how do I qualify?
              </h4>
              <p className="text-xs text-[#b9cac9] leading-relaxed pl-6">
                The Year-Pack AI offer gives our creators complete, free access to our AI Operations Assistant for their entire first year on SECCIØN. This offer is available for creators who join during our launch campaign. Because we personally review each application, we select the creators who best align with our community's vibe. After your first year, using the AI assistant is just €69/month, or you can choose to manage your channel manually at our free standard platform rate.
              </p>
            </div>

            {/* FAQ 2 */}
            <div className="p-5 bg-white/[0.02] border border-white/5 rounded-2xl text-left space-y-2.5">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-[#00fbfb] shrink-0" />
                How does the AI Assistant replace a traditional management agency?
              </h4>
              <p className="text-xs text-[#b9cac9] leading-relaxed pl-6">
                Management agencies charge huge commissions (often 30% to 50%) to handle your direct messages, post teaser content, and review contracts. SECCIØN’s native AI assistant does this work for you. It responds to messages in your unique voice 24/7, schedules teasers on external social platforms, manages your bookkeeping, and scans the web to take down leaked content. You get the power of an agency without the agency fee.
              </p>
            </div>

            {/* FAQ 3 */}
            <div className="p-5 bg-white/[0.02] border border-white/5 rounded-2xl text-left space-y-2.5">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-[#00fbfb] shrink-0" />
                How does the 80/20 split work? Are there hidden fees?
              </h4>
              <p className="text-xs text-[#b9cac9] leading-relaxed pl-6">
                You receive 80% of Net Revenue across all subscriptions, tips, streams, and custom orders. Net Revenue is simply Gross Customer Value minus third-party payment processing fees (Segpay / CCBill credit card fees). The remaining 20% of Net Revenue covers SECCIØN platform operations, guaranteeing high creator payout yield while maintaining zero hidden agency markups.
              </p>
            </div>

            {/* FAQ 4 */}
            <div className="p-5 bg-white/[0.02] border border-white/5 rounded-2xl text-left space-y-2.5">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-[#00fbfb] shrink-0" />
                What are "Sponsored Creators" and how does matchmaking work?
              </h4>
              <p className="text-xs text-[#b9cac9] leading-relaxed pl-6">
                Instead of setting up a public page and selling to strangers, SECCIØN focuses on quality connections. Members match with you based on shared interests and vibe compatibility. Once a match is made, they can join your Sponsored Creators circle to unlock your premium space. This matching process builds high-trust relationships, resulting in happy, long-term fans and a steady income.
              </p>
            </div>

            {/* FAQ 5 */}
            <div className="p-5 bg-white/[0.02] border border-white/5 rounded-2xl text-left space-y-2.5">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-[#00fbfb] shrink-0" />
                How does SECCIØN protect my content from leaks?
              </h4>
              <p className="text-xs text-[#b9cac9] leading-relaxed pl-6">
                We keep your creations safe with double-layer protection. First, our Face Blur Encryption keeps your face private on public feeds, letting you choose exactly who gets to see you as you build trust. Second, your shared photos and videos disappear from our servers immediately after they're opened, and we automatically stop screenshot attempts on both iPhones and Androids. What you share stays between you and your match.
              </p>
            </div>

            {/* FAQ 6 */}
            <div className="p-5 bg-white/[0.02] border border-white/5 rounded-2xl text-left space-y-2.5">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-[#00fbfb] shrink-0" />
                Am I in control of who sees my content?
              </h4>
              <p className="text-xs text-[#b9cac9] leading-relaxed pl-6">
                Absolutely. You have total control over your profile's visibility. You can block specific users, restrict access by geographic location (countries, states, or cities), hide your online status, and use a creator alias to protect your personal identity.
              </p>
            </div>

            {/* FAQ 7 */}
            <div className="p-5 bg-white/[0.02] border border-white/5 rounded-2xl text-left space-y-2.5">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-[#00fbfb] shrink-0" />
                Do I have to complete an Identity Check immediately?
              </h4>
              <p className="text-xs text-[#b9cac9] leading-relaxed pl-6">
                No. To take the Demo Tour and explore the platform, you only need to share your email, Telegram username, and WhatsApp number. A strict Identity Check (government-issued ID and liveness check) is only required for Creators when they are ready to publish premium content, set up their public space, and process payouts. Members are not required to complete ID checks for standard browsing or matching.
              </p>
            </div>

            {/* FAQ 8 */}
            <div className="p-5 bg-white/[0.02] border border-white/5 rounded-2xl text-left space-y-2.5">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-[#00fbfb] shrink-0" />
                How does SECCIØN keep the platform safe and compliant?
              </h4>
              <p className="text-xs text-[#b9cac9] leading-relaxed pl-6">
                SECCIØN is built on safety and legal protection. We adhere to digital content regulations, independent creator safety laws, and content safety standards to protect creators and members alike. We provide a secure, professional, and compliant space where you can build your brand with peace of mind.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 bg-[#0B0C10] border-t border-white/10 flex flex-col items-center justify-center w-full px-4 sm:px-6 md:px-12 lg:px-20 py-12 gap-8 text-center">
        {/* Top: Centered 3D Icon */}
        <div className="flex justify-center">
          <img 
            src="/assets/logo/logo-mark.png" 
            alt="SECCIØN Icon" 
            className="w-12 h-12 md:w-14 md:h-14 drop-shadow-[0_0_20px_rgba(0,251,251,0.4)] object-contain" 
          />
        </div>

        {/* Middle: Navigation Links */}
        <div className="flex flex-wrap justify-center gap-4 sm:gap-8">
          <Link className="text-[#b9cac9] hover:text-[#ffabf3] transition-colors font-mono text-[11px] font-medium tracking-widest uppercase" href="/privacy">{t("footer.privacy")}</Link>
          <Link className="text-[#b9cac9] hover:text-[#ffabf3] transition-colors font-mono text-[11px] font-medium tracking-widest uppercase" href="/rules">{t("footer.rules")}</Link>
          <Link className="text-[#b9cac9] hover:text-[#ffabf3] transition-colors font-mono text-[11px] font-medium tracking-widest uppercase" href="/creator-hub">{t("footer.creatorHub")}</Link>
          <Link className="text-[#b9cac9] hover:text-[#ffabf3] transition-colors font-mono text-[11px] font-medium tracking-widest uppercase" href="/hit-us-up">{t("footer.contact")}</Link>
        </div>

        {/* Bottom: Clean Wordmark Only (No Icon attached) */}
        <div className="flex flex-col items-center gap-3">
          <img 
            src="/assets/logo/logo-wordmark.png" 
            alt="SECCIØN Logo" 
            className="h-8 md:h-10 drop-shadow-[0_0_25px_rgba(0,251,251,0.4)] object-contain" 
          />
          <p className="font-mono text-[11px] font-medium tracking-widest text-[#b9cac9] opacity-40 pt-2">© 2026 SECCIØN. {t("footer.rights").toUpperCase()}</p>
        </div>
      </footer>

      <StudioTourModal 
        isOpen={isTourOpen} 
        onClose={() => setIsTourOpen(false)} 
        onClaimOffer={() => {
          setIsTourOpen(false);
          // Scroll to apply section
          const applySec = document.getElementById("apply");
          if (applySec) {
            applySec.scrollIntoView({ behavior: "smooth" });
          }
        }}
      />
    </div>
  );
}
