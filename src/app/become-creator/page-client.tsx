"use client";

import PublicFooter from "@/components/PublicFooter";
import React, { useState } from "react";
import { useTranslation } from "@/context/LanguageContext";
import Link from "next/link";
import AgeGateSplash from "@/components/onboarding/AgeGateSplash";
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
  Loader2,
  AlertTriangle
} from "lucide-react";
import StudioTourModal from "@/components/onboarding/StudioTourModal";
import VisibilityAdvisor from "@/components/onboarding/VisibilityAdvisor";
import PublicNavbar from "@/components/PublicNavbar";

const CITIES = [
  { value: "global_other", label: "🌍 Global / Worldwide (Any City or Country)", labelEs: "🌍 Global / Internacional (Cualquier Ciudad o País)" },
  { value: "medellin", label: "🇨🇴 Medellín (Soft Launch Hub)", labelEs: "🇨🇴 Medellín (Hub de Lanzamiento)" },
  { value: "bogota", label: "🇨🇴 Bogotá", labelEs: "🇨🇴 Bogotá" },
  { value: "cali", label: "🇨🇴 Cali", labelEs: "🇨🇴 Cali" },
  { value: "madrid", label: "🇪🇸 Madrid", labelEs: "🇪🇸 Madrid" },
  { value: "barcelona", label: "🇪🇸 Barcelona", labelEs: "🇪🇸 Barcelona" },
  { value: "alicante", label: "🇪🇸 Alicante / Valencia", labelEs: "🇪🇸 Alicante / Valencia" },
  { value: "paris", label: "🇫🇷 Paris", labelEs: "🇫🇷 París" },
  { value: "london", label: "🇬🇧 London", labelEs: "🇬🇧 Londres" },
  { value: "miami", label: "🇺🇸 Miami, FL", labelEs: "🇺🇸 Miami, FL" },
  { value: "new_york", label: "🇺🇸 New York, NY", labelEs: "🇺🇸 Nueva York, NY" },
  { value: "mexico_city", label: "🇲🇽 Mexico City", labelEs: "🇲🇽 Ciudad de México" },
  { value: "buenos_aires", label: "🇦🇷 Buenos Aires", labelEs: "🇦🇷 Buenos Aires" },
  { value: "santiago", label: "🇨🇱 Santiago", labelEs: "🇨🇱 Santiago" },
  { value: "other", label: "✨ Other City (Type Below)", labelEs: "✨ Otra Ciudad (Escribir abajo)" },
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

export default function BecomeCreatorPage({ initialProfile, userEmail }: { initialProfile?: any, userEmail?: string }) {
  const { t, locale } = useTranslation();
  // Tour State
  const [isTourOpen, setIsTourOpen] = useState<boolean>(false);

  // Calculator State
  const [earnings, setEarnings] = useState<number>(8000);
  
  // Face Blur Demo State
  const [isFaceBlurred, setIsFaceBlurred] = useState<boolean>(true);

  // Form Flow States
  const [formStep, setFormStep] = useState<"input" | "submitting" | "success">("input");
  const [formData, setFormData] = useState({
    fullName: initialProfile?.display_name || initialProfile?.username || "",
    email: userEmail || "",
    phone: "",
    telegram: "",
    city: initialProfile?.origins || "",
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

  // Helper to normalize any handle or URL to a valid web link
  const normalizeSocialLink = (input: string) => {
    const trimmed = input.trim();
    if (!trimmed) return "";
    if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed;
    if (trimmed.startsWith("@")) return `https://instagram.com/${trimmed.slice(1)}`;
    if (trimmed.includes(".com") || trimmed.includes(".me") || trimmed.includes(".tv") || trimmed.includes(".fans") || trimmed.includes(".ai")) return `https://${trimmed}`;
    return `https://instagram.com/${trimmed}`;
  };

  const validateInput = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.fullName.trim()) {
      newErrors.fullName = locale === "es" ? "El nombre es obligatorio" : "Creator name is required";
    }
    
    if (!formData.email.trim() || !formData.email.includes("@")) {
      newErrors.email = locale === "es" ? "Email válido obligatorio" : "Valid email required";
    }
    
    if (!formData.phone?.trim() && !formData.telegram?.trim()) {
      newErrors.contact = locale === "es" 
        ? "Indica WhatsApp o Telegram para enviarte tu acceso" 
        : "Provide WhatsApp or Telegram to receive your access";
    }

    // Smart handle validation (Accepts @handle or full URL)
    if (!formData.link1.trim()) {
      newErrors.link1 = locale === "es" 
        ? "Indica tu @usuario o enlace principal" 
        : "Primary handle or link is required";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateInput()) return;
    
    setFormStep("submitting");

    const payload = {
      ...formData,
      link1: normalizeSocialLink(formData.link1),
      link2: normalizeSocialLink(formData.link2),
      link3: normalizeSocialLink(formData.link3),
    };
    
    try {
      const response = await fetch('/api/v2/creator/apply', { 
        method: 'POST', 
        body: JSON.stringify(payload) 
      });
      
      if (response.status === 409) {
        setErrors({ submit: locale === "es" ? "Ya existe una solicitud registrada con este correo electrónico" : "An application with this email already exists" });
        setFormStep("input");
        return;
      }
      
      if (!response.ok) {
        setErrors({ submit: locale === "es" ? "Ocurrió un error al enviar tu solicitud. Por favor intenta de nuevo." : "An error occurred submitting your application. Please try again." });
        setFormStep("input");
        return;
      }
      
      if (typeof window !== "undefined") {
        localStorage.setItem("seccion_creator_applied", "true");
        localStorage.setItem("seccion_creator_data", JSON.stringify(payload));
      }
      setFormStep("success");
    } catch (error) {
      setErrors({ submit: locale === "es" ? "Error de red. Por favor intenta más tarde." : "Network error. Please try again later." });
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
      <AgeGateSplash />
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
                  {locale === "es" ? "Únete a la Campaña de Creadores" : "Join the Creator Campaign"}
                </span>
              </div>
              <h1 className="font-display font-black leading-[1.05] tracking-tight text-white text-[32px] sm:text-[56px] md:text-[72px] lg:text-[80px] text-left">
                {locale === "es" ? (
                  <>
                    Tu Espacio. <br/>
                    Tus Reglas. <br/>
                    Quédate el <span className="text-[#00fbfb] drop-shadow-[0_0_35px_rgba(0,251,251,0.5)]">90%</span>.
                  </>
                ) : (
                  <>
                    Your Space. <br/>
                    Your Rules. <br/>
                    Keep <span className="text-[#00fbfb] drop-shadow-[0_0_35px_rgba(0,251,251,0.5)]">90%</span>.
                  </>
                )}
              </h1>
            </div>
            
            <p className="max-w-full sm:max-w-[580px] text-xs sm:text-base text-[#b9cac9] leading-relaxed font-medium break-words text-left">
              {locale === "es" 
                ? "Dirige tu negocio de creador de forma independiente y recupera tus ingresos de las agencias. Los primeros 500 creadores fundadores aseguran un 90% de retención neta y reciben su Asistente IA de Operaciones 100% gratis durante el 1er Año." 
                : "Run your creator business independently and reclaim your income from agencies. The first 500 founding creators lock in a 90% net revenue split and receive their built-in AI Operations Assistant free for Year 1."}
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <a 
                href="#apply" 
                className="group px-5 py-3 rounded-full bg-[#00fbfb] text-black font-mono text-[11px] font-black uppercase tracking-wider inline-flex items-center justify-between gap-3 hover:shadow-[0_0_30px_rgba(0,251,251,0.6)] active:scale-[0.98] transition-all duration-300 min-h-[44px] cursor-pointer"
              >
                <span>{locale === "es" ? "Reclama tu 90% y Año Gratis" : "Claim 90% & Free Year"}</span>
                <span className="w-6 h-6 rounded-full bg-black/10 flex items-center justify-center shrink-0 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </span>
              </a>
              <button 
                type="button"
                onClick={() => setIsTourOpen(true)}
                className="group px-5 py-3 rounded-full border border-[#ffabf3]/40 bg-[#ffabf3]/5 text-[#ffabf3] font-mono text-[11px] font-black uppercase tracking-wider inline-flex items-center justify-between gap-3 hover:bg-[#ffabf3]/15 hover:border-[#ffabf3] active:scale-[0.98] transition-all duration-300 shadow-[0_0_15px_rgba(255,171,243,0.2)] hover:shadow-[0_0_25px_rgba(255,171,243,0.4)] min-h-[44px] cursor-pointer"
              >
                <span>{locale === "es" ? "Tour de la Demo" : "Take Demo Tour"}</span>
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
                      <h4 className="text-[11px] sm:text-[12px] font-bold text-white leading-none">SECCION Studio</h4>
                      <span className="text-[8px] font-mono text-[#ffabf3] uppercase tracking-wider">Live Station</span>
                    </div>
                  </div>
                  <span className="h-2 w-2 rounded-full bg-[#39FF14] animate-pulse shrink-0" />
                </div>

                {/* Mock Live HUD Compatibility metrics */}
                <div className="flex-1 flex flex-col justify-center space-y-4 my-3 sm:my-5">
                  <div className="text-center space-y-1">
                    <span className="text-[9px] font-mono uppercase tracking-widest text-white/40">
                      {locale === "es" ? "HUD de Aura de Audiencia" : "Audience Aura HUD"}
                    </span>
                    <h3 className="text-2xl sm:text-3xl font-black text-white leading-none">
                      <MonoNumber value="94.2" suffix="%" />
                    </h3>
                    <p className="text-[9px] text-[#00fbfb] tracking-wider font-semibold">
                      {locale === "es" ? "Sincronización de Sinergia con Espectador Top" : "Synergy Sync with Top Viewer"}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="p-3 bg-white/[0.04] border border-white/5 rounded-2xl flex flex-row justify-between items-center gap-2">
                      <span className="text-[10px] sm:text-xs text-white/70 font-medium shrink-0">
                        {locale === "es" ? "Módulo de Chat" : "Chatter Module"}
                      </span>
                      <span className="text-[8px] sm:text-[9px] font-mono text-[#39FF14] bg-[#39FF14]/10 border border-[#39FF14]/30 px-2.5 py-0.5 rounded-full uppercase shrink-0 font-bold">
                        {locale === "es" ? "Activo 24/7" : "Running 24/7"}
                      </span>
                    </div>
                    <div className="p-3 bg-white/[0.04] border border-white/5 rounded-2xl flex flex-row justify-between items-center gap-2">
                      <span className="text-[10px] sm:text-xs text-white/70 font-medium shrink-0">
                        {locale === "es" ? "Cifrado Difuminado Facial" : "Face Blur Encryption"}
                      </span>
                      <span className="text-[8px] sm:text-[9px] font-mono text-[#00fbfb] bg-[#00fbfb]/10 border border-[#00fbfb]/30 px-2.5 py-0.5 rounded-full uppercase shrink-0 font-bold">
                        {locale === "es" ? "Activo" : "Active"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Status Bar */}
                <div className="border-t border-white/5 pt-3 sm:pt-4 flex justify-between items-center">
                  <div className="text-left">
                    <span className="text-[8px] font-mono uppercase text-white/40 block">
                      {locale === "es" ? "Retención Neta Fundador" : "Founding Net Keeps"}
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-white"><MonoNumber value="90" suffix="%" /></span>
                  </div>
                  <div className="text-right">
                    <span className="text-[8px] font-mono uppercase text-white/40 block">
                      {locale === "es" ? "Comisión Intermediarios" : "Middlemen Cut"}
                    </span>
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
              {locale === "es" ? "Tu Espacio. Tus Ahorros." : "Your Space. Your Savings."}
            </span>
            <h2 className="font-display text-3xl md:text-5xl font-black text-white tracking-tight">
              {locale === "es" ? "Calcula tus Ingresos Reales" : "Calculate Your True Earnings"}
            </h2>
            <p className="max-w-[550px] mx-auto text-xs sm:text-sm text-[#b9cac9] leading-relaxed">
              {locale === "es" 
                ? "Las agencias de gestión tradicionales y las comisiones estándar de plataforma combinadas pueden llevarse hasta el 60% de tus ingresos brutos. Mueve el control deslizante para ver la diferencia." 
                : "Traditional management agencies and standard platform fees combined can take up to 60% of your gross income. Drag the slider below to see the difference."}
            </p>
          </div>

          <DoubleBezelCard className="max-w-[720px] mx-auto">
            <div className="space-y-8">
              {/* Earnings Slider Input */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-mono uppercase text-[#b9cac9]">
                    {locale === "es" ? "Ingresos Brutos Mensuales" : "Gross Monthly Earnings"}
                  </span>
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
                  <h4 className="text-[10px] font-mono font-bold text-rose-500 uppercase tracking-widest">
                    {locale === "es" ? "Agencia + Competencia" : "Agency + Competitors"}
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-[#b9cac9]">
                      <span>{locale === "es" ? "Comisión Plataforma (20%)" : "Platform Cut (20%)"}</span>
                      <span className="font-mono text-white/70">-{traditionalPlatformFee.toLocaleString()} €</span>
                    </div>
                    <div className="flex justify-between text-xs text-[#b9cac9]">
                      <span>{locale === "es" ? "Comisión Agencia (40%)" : "Agency Manager Cut (40%)"}</span>
                      <span className="font-mono text-white/70">-{traditionalAgencyFee.toLocaleString()} €</span>
                    </div>
                  </div>
                  <div className="border-t border-white/5 pt-3 flex justify-between items-center">
                    <span className="text-xs font-bold text-white">{locale === "es" ? "Lo Que Conservas (40%)" : "What You Keep (40%)"}</span>
                    <span className="font-mono text-rose-400 font-bold">{traditionalCreatorKeeps.toLocaleString()} €</span>
                  </div>
                </div>

                {/* SECCION */}
                <div className="p-5 bg-[#00fbfb]/[0.02] border border-[#00fbfb]/20 rounded-2xl space-y-4 text-left relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-[120px] h-[120px] rounded-full bg-[#00fbfb]/5 blur-2xl pointer-events-none" />
                  <h4 className="text-[10px] font-mono font-bold text-[#00fbfb] uppercase tracking-widest">SECCION space</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-[#b9cac9]">
                      <span>{locale === "es" ? "Tasa Creador Fundador (10%)" : "Founding Creator Rate (10%)"}</span>
                      <span className="font-mono text-white/70">-{seccionFee.toLocaleString()} €</span>
                    </div>
                    <div className="flex justify-between text-xs text-[#b9cac9]">
                      <span>{locale === "es" ? "Asistente IA Año 1 (0%)" : "AI Assistant Year 1 (0%)"}</span>
                      <span className="font-mono text-[#39FF14] font-semibold">{locale === "es" ? "GRATIS" : "FREE"}</span>
                    </div>
                  </div>
                  <div className="border-t border-white/10 pt-3 flex justify-between items-center">
                    <span className="text-xs font-bold text-white">{locale === "es" ? "Lo Que Conservas (90%)" : "What You Keep (90%)"}</span>
                    <span className="font-mono text-[#00fbfb] text-glow font-bold">{seccionCreatorKeeps.toLocaleString()} €</span>
                  </div>
                </div>
              </div>

              {/* Savings Announcement */}
              <div className="p-4 bg-[#39FF14]/5 border border-[#39FF14]/20 rounded-2xl text-center">
                <p className="text-xs text-[#b9cac9] font-medium leading-relaxed">
                  {locale === "es" ? "Al dirigir tu canal de forma independiente en SECCION, ahorras " : "By running your channel independently on SECCION, you save "}
                  <MonoNumber value={monthlySavings.toLocaleString()} suffix={locale === "es" ? " €/mes" : " €/month"} />
                </p>
              </div>

              <p className="text-[10px] text-[#b9cac9]/50 font-medium leading-normal max-w-[550px] mx-auto">
                {locale === "es" 
                  ? "Los primeros 500 creadores fundadores conservan el 90% de sus ingresos netos y reciben el Asistente IA 100% gratis durante todo el Año 1. Posteriormente, la tasa estándar de plataforma es del 20% (conservas el 80% de por vida) y el asistente IA cuesta 69 €/mes opcional. Sin intermediarios ni comisiones ocultas." 
                  : "The first 500 founding creators keep 90% of net earnings and receive the built-in AI Operations Assistant 100% free for Year 1. Afterwards, the standard platform rate is just 20% (you keep 80% lifetime) with optional AI assistant at €69/month. Zero middlemen, zero hidden fees."}
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
              {locale === "es" ? "Recupera tu Libertad" : "Reclaim Your Freedom"}
            </span>
            <h2 className="font-display text-3xl md:text-5xl font-black text-white tracking-tight">
              {locale === "es" ? "Tu Agencia en un Solo Clic" : "Your Agency in a Single Toggle"}
            </h2>
            <p className="max-w-[550px] text-xs sm:text-sm text-[#b9cac9] leading-relaxed">
              {locale === "es" 
                ? "Creamos nuestro Asistente de Operaciones IA para manejar las tareas repetitivas y complejas que las agencias tradicionales cobran al 40% de comisión por gestionar." 
                : "We built our AI Operations Assistant to handle the repetitive, complex chores that traditional agencies charge a 40% commission to manage."}
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
                  <h3 className="font-display text-xl font-bold text-white">
                    {locale === "es" ? "Chat de Conexión con Fans" : "Fan Connection Chatter"}
                  </h3>
                  <p className="text-xs text-[#b9cac9] leading-relaxed">
                    {locale === "es" 
                      ? "Nuestro asistente inteligente se entrena con tu historial de chat para replicar a la perfección tu voz y tono únicos. Gestiona mensajes directos 24/7, segmenta fans según su nivel de inversión y recomienda desbloqueos de contenido—etiqueta bots de forma transparente y se pausa automáticamente para conexiones profundas de nivel 4." 
                      : "Our smart assistant is trained on your chat history to perfectly replicate your unique voice and tone. It manages direct messages 24/7, segments fans based on their spending levels, and recommends content unlocks—labels bots transparently, and automatically pauses for deeper, level-4 matched connections."}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 text-[9px] font-mono text-[#00fbfb]/80">
                  <span className="bg-[#00fbfb]/5 border border-[#00fbfb]/20 px-2.5 py-1 rounded-full">{locale === "es" ? "DMs 24/7" : "24/7 DMs"}</span>
                  <span className="bg-[#00fbfb]/5 border border-[#00fbfb]/20 px-2.5 py-1 rounded-full">{locale === "es" ? "Etiquetas de Bot Transparentes" : "Bot Transparency Labels"}</span>
                  <span className="bg-[#00fbfb]/5 border border-[#00fbfb]/20 px-2.5 py-1 rounded-full">{locale === "es" ? "Pausas Adaptativas de Nivel" : "Adaptive Level Breaks"}</span>
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
                  <h3 className="font-display text-xl font-bold text-white">
                    {locale === "es" ? "Copiloto Legal de Contratos" : "Legal Contract Copilot"}
                  </h3>
                  <p className="text-xs text-[#b9cac9] leading-relaxed">
                    {locale === "es" 
                      ? "Analiza al instante patrocinios de marcas o contratos de gestión. Nuestro asistente de lenguaje natural detecta cláusulas abusivas (que reclaman comisión sobre tu trabajo al terminar el contrato) y te protege de ceder los derechos de imagen de tu réplica digital de IA." 
                      : "Instantly screen brand sponsorships or management contracts. Our natural language assistant flags predatory sunset clauses (which claim commission on your work after contracts end) and protects you from signing away your AI digital replica likeness rights."}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 text-[9px] font-mono text-[#ffabf3]/80">
                  <span className="bg-[#ffabf3]/5 border border-[#ffabf3]/20 px-2.5 py-1 rounded-full">{locale === "es" ? "Análisis de Contratos" : "Contract Screening"}</span>
                  <span className="bg-[#ffabf3]/5 border border-[#ffabf3]/20 px-2.5 py-1 rounded-full">{locale === "es" ? "Protección de Imagen" : "Likeness Protection"}</span>
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
                  <h3 className="font-display text-xl font-bold text-white">
                    {locale === "es" ? "Protección de Contenido DRM" : "DRM Content Guard"}
                  </h3>
                  <p className="text-xs text-[#b9cac9] leading-relaxed">
                    {locale === "es" 
                      ? "Nuestra plataforma rastrea automáticamente la web para detectar subidas no autorizadas de tus creaciones y genera solicitudes de retiro DMCA legales de inmediato. Mantén tu propiedad intelectual estrictamente tuya." 
                      : "Our platform automatically sweeps the web to find unauthorized uploads of your creations and generates legal DMCA takedown requests instantly. Keep your intellectual property strictly yours."}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 text-[9px] font-mono text-[#ffabf3]/80">
                  <span className="bg-[#ffabf3]/5 border border-[#ffabf3]/20 px-2.5 py-1 rounded-full">{locale === "es" ? "Retiros Automáticos" : "Auto-Takedowns"}</span>
                  <span className="bg-[#ffabf3]/5 border border-[#ffabf3]/20 px-2.5 py-1 rounded-full">{locale === "es" ? "Rastreo de Filtraciones Web" : "Web Leak Sweeps"}</span>
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
                  <h3 className="font-display text-xl font-bold text-white">
                    {locale === "es" ? "Creadores Patrocinados con Match" : "Match-Gated Sponsored Creators"}
                  </h3>
                  <p className="text-xs text-[#b9cac9] leading-relaxed">
                    {locale === "es" 
                      ? "Olvídate de los feeds de transacciones fríos y anónimos. Los miembros solo pueden suscribirse una vez que hacen match contigo a través de nuestro Motor de Sinergia. Tus suscriptores forman un círculo de Creadores Patrocinados, transformando la compatibilidad en fans altamente comprometidos, reduciendo la deserción y construyendo un apoyo estable a largo plazo." 
                      : "Ditch cold, anonymous transaction feeds. Members can only subscribe once they match with you through our Synergy Engine. Your subscribers form a Sponsored Creators circle, translating mutual vibe compatibility into highly invested fans, slashing churn rates, and building stable long-term support."}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 text-[9px] font-mono text-[#00fbfb]/80">
                  <span className="bg-[#00fbfb]/5 border border-[#00fbfb]/20 px-2.5 py-1 rounded-full">{locale === "es" ? "Matching de Sinergia" : "Synergy Matching"}</span>
                  <span className="bg-[#00fbfb]/5 border border-[#00fbfb]/20 px-2.5 py-1 rounded-full">{locale === "es" ? "Baja Deserción" : "Low Subscriber Churn"}</span>
                  <span className="bg-[#00fbfb]/5 border border-[#00fbfb]/20 px-2.5 py-1 rounded-full">{locale === "es" ? "Compatibilidad de Vibe" : "Vibe Compatibility"}</span>
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
              {locale === "es" ? "Control Total del Creador" : "Total Creator Control"}
            </span>
            <h2 className="font-display text-2xl sm:text-3xl md:text-5xl font-black text-white tracking-tight">
              {locale === "es" ? "Cifrado Difuminado Facial" : "Face Blur Encryption"}
            </h2>
            <p className="text-xs sm:text-sm text-[#b9cac9] leading-relaxed font-medium break-words">
              {locale === "es" 
                ? "Tienes el control absoluto de quién ve tu contenido y cuándo. Nuestra tecnología de Difuminado Facial oculta automáticamente tu rostro en los feeds de descubrimiento públicos. Solo tú decides cuándo quitar el difuminado—ya sea automáticamente cuando un miembro compatible alcanza el Nivel 4 de Química al chatear e interactuar contigo, o de inmediato cuando elige una suscripción." 
                : "You are in absolute control of who sees your content, and when. Our Face Blur technology automatically obscures your face on all public discovery feeds. Only you decide when to lift the blur—whether automatically when a matched member climbs to Chemistry Level 4 by chatting and interacting with you, or immediately when they choose a subscription."}
            </p>
            <div className="space-y-3 sm:space-y-4 font-medium text-xs text-[#b9cac9]">
              <div className="flex items-start sm:items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-[#00fbfb]/10 border border-[#00fbfb]/30 flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
                  <Check className="w-3.5 h-3.5 text-[#00fbfb]" />
                </div>
                <span className="break-words">{locale === "es" ? "Mantente anónimo/a en el feed público y en las búsquedas" : "Stay anonymous to the public feed and search results"}</span>
              </div>
              <div className="flex items-start sm:items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-[#00fbfb]/10 border border-[#00fbfb]/30 flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
                  <Check className="w-3.5 h-3.5 text-[#00fbfb]" />
                </div>
                <span className="break-words">{locale === "es" ? "Muestra tu contenido selectivamente solo al generar confianza" : "Selectively reveal your content only when trust is established"}</span>
              </div>
              <div className="flex items-start sm:items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-[#00fbfb]/10 border border-[#00fbfb]/30 flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
                  <Check className="w-3.5 h-3.5 text-[#00fbfb]" />
                </div>
                <span className="break-words">{locale === "es" ? "Controles de geocerca para ocultar tu perfil en países o ciudades específicas" : "Geofencing controls to hide your profile in specific countries or cities"}</span>
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
                        <span className="text-[8px] sm:text-[9px] font-mono font-bold text-[#ffabf3] uppercase tracking-wider truncate">{locale === "es" ? "Cifrado Difuminado Activo" : "Blur Encryption Active"}</span>
                      </>
                    ) : (
                      <>
                        <Unlock className="w-3.5 h-3.5 text-[#00fbfb] shrink-0" />
                        <span className="text-[8px] sm:text-[9px] font-mono font-bold text-[#00fbfb] uppercase tracking-wider truncate">{locale === "es" ? "Descifrado (Confianza L4)" : "Decrypted (L4 Trust)"}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Control Swtich */}
                <div className="flex justify-between items-center border-t border-white/5 pt-3 sm:pt-4">
                  <div className="text-left">
                    <h4 className="text-xs font-bold text-white">Siena Vibe</h4>
                    <span className="text-[9px] font-mono text-[#b9cac9]">{locale === "es" ? "Vibe de Artista Exclusiva" : "Exclusive Artist Vibe"}</span>
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
            <span className="text-[9px] font-mono text-[#ffabf3] uppercase font-bold tracking-wider">{locale === "es" ? "Optimización de Crecimiento" : "Growth Optimization"}</span>
            <h3 className="text-xl font-bold text-white uppercase tracking-wider">{locale === "es" ? "Asesor de Visibilidad y Atractivo" : "Visibility & Attractiveness Advisor"}</h3>
            <p className="text-xs text-[#b9cac9] max-w-lg mx-auto">
              {locale === "es" 
                ? "¿Cómo afectarán tus decisiones de privacidad a tu rendimiento de suscriptores? Cambia los modos de configuración a continuación para ver cómo nuestros sistemas de revelación equilibran la privacidad con la atracción del match." 
                : "How will your privacy choices impact your subscriber yield? Toggle the config modes below to see how our reveal systems balance privacy with matching attraction."}
            </p>
          </div>
          <VisibilityAdvisor />
        </div>

      </section>

      {/* Creator Registration & Application Section */}
      <section id="apply" className="relative z-10 py-20 sm:py-28 px-4 sm:px-6 md:px-12 lg:px-20 max-w-[1440px] mx-auto w-full border-t border-white/5 bg-gradient-to-b from-black/40 via-[#0A0A14] to-black/60">
        <div className="max-w-[860px] mx-auto space-y-10 text-center">
          
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#00fbfb]/30 bg-[#00fbfb]/5 backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-[#00fbfb] animate-pulse" />
              <span className="text-[10px] font-mono font-bold text-[#00fbfb] uppercase tracking-[0.2em]">
                {locale === "es" ? "Puerta de Registro de Creadores" : "Creator Registration Gate"}
              </span>
            </div>
            
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">
              {locale === "es" ? "Solicita tu Acceso Exclusivo de Creador" : "Apply for Creator Early Access"}
            </h2>
            
            <p className="max-w-[620px] mx-auto text-xs sm:text-sm text-[#b9cac9] leading-relaxed">
              {locale === "es" 
                ? "Asegura una de las 500 plazas de Creador Fundador: garantiza tu 90% de comisión neta y desbloquea tu Asistente IA de Operaciones 100% gratis durante todo el 1er Año." 
                : "Lock in one of the 500 Founding Creator spots: secure your 90% net revenue split and unlock your built-in AI Operations Assistant 100% free for your entire 1st Year."}
            </p>

          </div>

          <DoubleBezelCard className="text-left">
            {formStep === "success" ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-12 px-4 sm:px-8 text-center space-y-6"
              >
                <div className="w-16 h-16 rounded-full bg-[#00fbfb]/10 border border-[#00fbfb]/40 flex items-center justify-center mx-auto text-[#00fbfb] shadow-[0_0_30px_rgba(0,251,251,0.3)]">
                  <Check className="w-8 h-8 stroke-[3]" />
                </div>

                <div className="space-y-3">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00fbfb]/10 border border-[#00fbfb]/30 text-[#00fbfb]">
                    <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                    <span className="text-[9px] font-mono font-bold uppercase tracking-[0.2em]">
                      {locale === "es" ? "ACCESO EN REVISIÓN VIP" : "VIP ACCESS IN REVIEW"}
                    </span>
                  </div>
                  <h3 className="font-display text-2xl sm:text-4xl font-black text-white tracking-tight">
                    {locale === "es" ? "¡Estás en la lista!" : "You're on the Inside!"}
                  </h3>
                  <p className="text-xs sm:text-base text-[#b9cac9] max-w-lg mx-auto leading-relaxed font-medium">
                    {locale === "es"
                      ? "Revisaremos tus redes para activar tu cuenta. En cuanto esté lista, te avisaremos por WhatsApp, Telegram o correo para que entres directo con tu email y estrenes tu Asistente IA."
                      : "We're reviewing your links right now. As soon as you're approved, we'll ping you on WhatsApp, Telegram, or email so you can sign in directly with this email and unlock your AI Manager."}
                  </p>
                </div>

                <div className="p-5 bg-white/[0.04] border border-white/10 rounded-2xl max-w-md mx-auto text-left text-xs font-mono space-y-2 text-[#b9cac9] backdrop-blur-md">
                  <div className="flex justify-between">
                    <span className="text-white/40">{locale === "es" ? "Creador/a:" : "Creator:"}</span>
                    <span className="text-white font-bold">{formData.fullName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/40">{locale === "es" ? "Email Autorizado:" : "Whitelisted Email:"}</span>
                    <span className="text-[#00fbfb] font-bold">{formData.email}</span>
                  </div>
                  {formData.city && (
                    <div className="flex justify-between">
                      <span className="text-white/40">{locale === "es" ? "Ciudad Hub:" : "Hub City:"}</span>
                      <span className="text-[#ffabf3] font-bold">{formData.city}</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-1 border-t border-white/5">
                    <span className="text-white/40">{locale === "es" ? "Pack IA 1er Año:" : "Year 1 AI Pack:"}</span>
                    <span className="text-[#39FF14] font-bold">{locale === "es" ? "RECLAMADO (0 € / 90% NET)" : "CLAIMED (0 € / 90% NET)"}</span>
                  </div>
                </div>

                {/* VIP Fast-Track Concierge & Login CTAs */}
                <div className="pt-2 max-w-md mx-auto space-y-3">
                  <div className="p-3.5 bg-white/[0.03] border border-[#00fbfb]/20 rounded-2xl space-y-2 text-center">
                    <span className="text-[10px] font-mono text-[#00fbfb] font-bold uppercase tracking-wider block">
                      {locale === "es" ? "⚡ Acelerador de Aprobación VIP" : "⚡ Fast-Track VIP Approval"}
                    </span>
                    <p className="text-[11px] text-[#b9cac9]">
                      {locale === "es"
                        ? "¿Quieres activar tu cuenta en minutos? Escríbenos directamente por WhatsApp o Telegram para verificar tus enlaces al instante."
                        : "Want your account live in minutes? Message our concierge team directly to verify your creator links immediately."}
                    </p>
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <a
                        href={`https://wa.me/?text=${encodeURIComponent(
                          locale === "es"
                            ? `¡Hola equipo SECCION! Acabo de enviar mi solicitud como creador/a: ${formData.fullName} (${formData.email}). ¿Podemos revisar mi perfil para activar mi Pack 90% Creador Fundador?`
                            : `Hi SECCION Team! I just submitted my creator application: ${formData.fullName} (${formData.email}). Can we fast-track my approval for the 90% Founding Creator Pack?`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="py-2.5 px-3 rounded-xl bg-[#25D366]/20 border border-[#25D366]/40 hover:bg-[#25D366] text-[#25D366] hover:text-black font-mono text-[11px] font-bold transition flex items-center justify-center gap-1.5"
                      >
                        <span>WhatsApp VIP</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </a>
                      <a
                        href="https://t.me/seccion_ai"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="py-2.5 px-3 rounded-xl bg-[#229ED9]/20 border border-[#229ED9]/40 hover:bg-[#229ED9] text-[#229ED9] hover:text-white font-mono text-[11px] font-bold transition flex items-center justify-center gap-1.5"
                      >
                        <span>Telegram VIP</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </a>
                    </div>
                  </div>

                  <Link
                    href={`/onboarding?role=creator&email=${encodeURIComponent(formData.email)}&name=${encodeURIComponent(formData.fullName)}`}
                    className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-[#00fbfb] to-[#00d2d2] text-black font-mono text-xs font-black uppercase tracking-wider hover:shadow-[0_0_25px_rgba(0,251,251,0.5)] transition-all duration-300 flex items-center justify-center gap-2 shadow-lg cursor-pointer"
                  >
                    <span>{locale === "es" ? "Comenzar Tour de Creador" : "Start Creator Quest Tour"}</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </Link>

                  <Link
                    href={`/login?email=${encodeURIComponent(formData.email)}`}
                    className="w-full py-2.5 px-6 rounded-xl bg-white/5 hover:bg-white/10 text-white font-mono text-xs font-medium transition flex items-center justify-center gap-2 border border-white/10"
                  >
                    <span>{locale === "es" ? "Ir al Login de Creadores" : "Go to Creator Login"}</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
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
                      if (typeof window !== "undefined") {
                        localStorage.removeItem("seccion_creator_applied");
                        localStorage.removeItem("seccion_creator_data");
                      }
                    }}
                    className="text-xs text-white/50 hover:text-white underline font-mono"
                  >
                    {locale === "es" ? "Enviar otra solicitud" : "Submit another application"}
                  </button>
                </div>
              </motion.div>
            ) : (
              <form onSubmit={handleFormSubmit} className="space-y-6">
                
                {errors.submit && (
                  <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{errors.submit}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-[#b9cac9]">
                      {locale === "es" ? "Nombre de Creador / Nombre Completo *" : "Creator / Full Name *"}
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      placeholder="e.g. Elena Vibe / @elenavibe"
                      className={`w-full px-4 py-3 rounded-xl bg-black/50 border ${errors.fullName ? "border-rose-500" : "border-white/10 focus:border-[#00fbfb]"} text-white text-xs placeholder-white/20 focus:outline-none transition font-sans`}
                    />
                    {errors.fullName && (
                      <p className="text-[10px] text-rose-400 font-mono">{errors.fullName}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-[#b9cac9]">
                      {locale === "es" ? "Correo Electrónico *" : "Email Address *"}
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="creator@example.com"
                      className={`w-full px-4 py-3 rounded-xl bg-black/50 border ${errors.email ? "border-rose-500" : "border-white/10 focus:border-[#00fbfb]"} text-white text-xs placeholder-white/20 focus:outline-none transition font-sans`}
                    />
                    {errors.email && (
                      <p className="text-[10px] text-rose-400 font-mono">{errors.email}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* WhatsApp Phone */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-[#b9cac9]">
                        {locale === "es" ? "WhatsApp / Teléfono" : "WhatsApp / Phone"}
                      </label>
                      <span className="text-[9px] text-[#00fbfb]/70 font-mono">
                        {locale === "es" ? "(Requerido WhatsApp o Telegram)" : "(WhatsApp or Telegram required)"}
                      </span>
                    </div>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+34 600 000 000 / +57 300 000 0000"
                      className={`w-full px-4 py-3 rounded-xl bg-black/50 border ${errors.contact ? "border-amber-500/60" : "border-white/10 focus:border-[#00fbfb]"} text-white text-xs placeholder-white/20 focus:outline-none transition font-sans`}
                    />
                  </div>

                  {/* Telegram Handle */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-[#b9cac9]">
                        {locale === "es" ? "Usuario de Telegram (@tag)" : "Telegram Handle (@tag)"}
                      </label>
                      <span className="text-[9px] text-[#ffabf3]/70 font-mono">
                        {locale === "es" ? "(Requerido WhatsApp o Telegram)" : "(WhatsApp or Telegram required)"}
                      </span>
                    </div>
                    <input
                      type="text"
                      name="telegram"
                      value={formData.telegram}
                      onChange={handleInputChange}
                      placeholder="@yourcreatorhandle"
                      className={`w-full px-4 py-3 rounded-xl bg-black/50 border ${errors.contact ? "border-amber-500/60" : "border-white/10 focus:border-[#00fbfb]"} text-white text-xs placeholder-white/20 focus:outline-none transition font-mono`}
                    />
                  </div>
                </div>

                {errors.contact && (
                  <p className="text-[11px] text-amber-400 font-mono bg-amber-500/10 border border-amber-500/20 p-2.5 rounded-xl">
                    ⚠️ {errors.contact}
                  </p>
                )}

                {/* Primary Location Selection */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-[#b9cac9]">
                      {locale === "es" ? "Ubicación / Ciudad Principal *" : "Primary Location / City *"}
                    </label>
                    <span className="text-[9px] text-[#00fbfb] font-mono font-bold">
                      {locale === "es" ? "🌍 Streams & Contenido Activos a Nivel Mundial" : "🌍 Streams & Content Live Worldwide"}
                    </span>
                  </div>

                  <select
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl bg-black/50 border border-white/10 focus:border-[#00fbfb] text-white text-xs focus:outline-none transition"
                  >
                    <option value="" className="bg-[#0F0F1A] text-white/50">
                      {locale === "es" ? "-- Selecciona tu ubicación --" : "-- Select your location --"}
                    </option>
                    {CITIES.map((c) => (
                      <option key={c.value} value={c.value} className="bg-[#0F0F1A] text-white">
                        {locale === "es" ? c.labelEs : c.label}
                      </option>
                    ))}
                  </select>

                  {/* Custom City Text Input when 'Other' or 'Global' is selected */}
                  {(formData.city === "other" || formData.city === "global_other") && (
                    <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="pt-2">
                      <input
                        type="text"
                        name="customCity"
                        placeholder={locale === "es" ? "Escribe tu ciudad y país (ej. Buenos Aires, Argentina / Montreal, Canadá)" : "Enter your city & country (e.g. Buenos Aires, Argentina / Montreal, Canada)"}
                        className="w-full px-4 py-3 rounded-xl bg-black/60 border border-[#00fbfb]/40 focus:border-[#00fbfb] text-white text-xs placeholder-white/30 focus:outline-none transition font-sans"
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      />
                    </motion.div>
                  )}

                  <p className="text-[10px] text-white/50 leading-relaxed font-mono pt-1">
                    {locale === "es"
                      ? "💡 Puedes transmitir en vivo y monetizar con miembros de todo el mundo sin importar tu país. Tu ubicación nos ayuda a activar los radares locales de fans."
                      : "💡 You can broadcast live and monetize with members worldwide regardless of your country. Your location helps us prioritize local fan radars."}
                  </p>
                </div>

                {/* Social & Creator Links */}
                <div className="space-y-3 pt-2">
                  <div className="flex justify-between items-center">
                    <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-[#b9cac9]">
                      {locale === "es" ? "Perfiles de Creador / Redes Sociales *" : "Creator Handles / Social Links *"}
                    </label>
                    <span className="text-[9px] text-[#00fbfb] font-mono font-semibold">
                      {locale === "es" ? "✨ Acepta @usuario o enlaces" : "✨ Accepts @handle or full links"}
                    </span>
                  </div>
                  
                  <div className="space-y-2.5">
                    <input
                      type="text"
                      name="link1"
                      value={formData.link1}
                      onChange={handleInputChange}
                      placeholder={locale === "es" ? "@tuusuario o enlace (Instagram / TikTok / OF) *" : "@yourhandle or link (Instagram / TikTok / OF) *"}
                      className={`w-full px-4 py-3 rounded-xl bg-black/50 border ${errors.link1 ? "border-rose-500" : "border-white/10 focus:border-[#00fbfb]"} text-white text-xs placeholder-white/20 focus:outline-none transition font-sans`}
                    />
                    {errors.link1 && (
                      <p className="text-[10px] text-rose-400 font-mono">{errors.link1}</p>
                    )}

                    <input
                      type="text"
                      name="link2"
                      value={formData.link2}
                      onChange={handleInputChange}
                      placeholder={locale === "es" ? "Segundo perfil (Opcional, ej. @onlyfans / Fansly / Twitch)" : "Second handle/link (Optional, e.g. @onlyfans / Fansly / Twitch)"}
                      className="w-full px-4 py-3 rounded-xl bg-black/50 border border-white/10 focus:border-[#00fbfb] text-white text-xs placeholder-white/20 focus:outline-none transition font-sans"
                    />

                    <input
                      type="text"
                      name="link3"
                      value={formData.link3}
                      onChange={handleInputChange}
                      placeholder={locale === "es" ? "Tercer perfil (Opcional, ej. Twitch / YouTube / Web)" : "Third handle/link (Optional, e.g. Twitch / YouTube / Web)"}
                      className="w-full px-4 py-3 rounded-xl bg-black/50 border border-white/10 focus:border-[#00fbfb] text-white text-xs placeholder-white/20 focus:outline-none transition font-sans"
                    />
                  </div>
                </div>

                {/* Zero-Risk Reassurance Banner */}
                <div className="p-3.5 bg-gradient-to-r from-[#00fbfb]/10 to-transparent border border-[#00fbfb]/25 rounded-2xl flex items-center gap-3 text-left">
                  <div className="w-8 h-8 rounded-xl bg-[#00fbfb]/10 flex items-center justify-center shrink-0 text-[#00fbfb]">
                    <Zap className="w-4 h-4" />
                  </div>
                  <p className="text-[11px] text-[#b9cac9] leading-tight">
                    <strong className="text-white font-semibold">
                      {locale === "es" ? "Sin tarjeta ni DNI para comenzar: " : "No ID or credit card needed to apply: "}
                    </strong>
                    {locale === "es" 
                      ? "Explora el Studio y prueba las herramientas de IA en 30 segundos. La verificación oficial solo se realiza cuando decidas retirar fondos." 
                      : "Explore the Studio and test-drive AI tools in 30 seconds. Official ID check is only required when you are ready for payouts."}
                  </p>
                </div>

                {/* Claim 1-Year Pack Checkbox */}
                <div className="p-4 bg-[#00fbfb]/5 border border-[#00fbfb]/20 rounded-2xl flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="claimOffer"
                    name="claimOffer"
                    checked={formData.claimOffer}
                    onChange={handleInputChange}
                    className="mt-1 w-4 h-4 rounded border-white/20 accent-[#00fbfb] cursor-pointer shrink-0"
                  />
                  <label htmlFor="claimOffer" className="text-xs text-[#b9cac9] leading-relaxed cursor-pointer select-none">
                    <strong className="text-white">
                      {locale === "es" ? "Reclamar Pack Asistente IA 1er Año Gratis" : "Claim 1-Year Free AI Assistant Pack"}
                    </strong>{" "}
                    ({locale === "es" ? "Ahorro de 4.000 €/mes en costes de agencia, 90% retención neta en pre-launch." : "Save €4,000/mo in agency fees, 90% net revenue split during pre-launch."})
                  </label>
                </div>

                {/* Submit Action */}
                <button
                  type="submit"
                  disabled={formStep === "submitting"}
                  className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#00fbfb] to-[#00d2d2] text-black font-mono font-black text-xs uppercase tracking-widest hover:shadow-[0_0_30px_rgba(0,251,251,0.6)] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(0,251,251,0.3)]"
                >
                  {formStep === "submitting" ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-black" />
                      <span>{locale === "es" ? "ENVIANDO SOLICITUD..." : "SUBMITTING APPLICATION..."}</span>
                    </>
                  ) : (
                    <>
                      <span>{locale === "es" ? "ENVIAR SOLICITUD DE CREADOR" : "SUBMIT CREATOR APPLICATION"}</span>
                      <ArrowUpRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                {/* Privacy & Discreet Guarantee Card */}
                <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl space-y-2 text-left backdrop-blur-md">
                  <div className="flex items-center gap-2 text-white font-mono text-[10px] font-bold uppercase tracking-wider">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#39FF14]" />
                    <span>{locale === "es" ? "Garantía de Privacidad y Anonimato" : "Discreet Privacy & Safety Guarantee"}</span>
                  </div>
                  
                  <ul className="space-y-1.5 text-[10px] text-[#b9cac9] font-sans">
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#39FF14]" />
                      <span>{locale === "es" ? "Tu nombre legal, teléfono y WhatsApp NUNCA se muestran a los miembros." : "Your legal name, phone, and WhatsApp are NEVER visible to members."}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#00fbfb]" />
                      <span>{locale === "es" ? "Cifrado Difuminado Facial activo por defecto en feeds públicos." : "Face Blur Encryption active by default on public discovery feeds."}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#ffabf3]" />
                      <span>{locale === "es" ? "Cero publicaciones automáticas ni acceso a tus contactos personales." : "Zero automatic posting and no access to your personal contacts."}</span>
                    </li>
                  </ul>
                </div>
              </form>
            )}
          </DoubleBezelCard>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="relative z-10 py-24 px-4 sm:px-6 md:px-12 lg:px-20 max-w-[800px] mx-auto w-full border-t border-white/5 bg-black/20">
        <div className="space-y-12">
          
          <div className="text-center space-y-3">
            <span className="text-[10px] font-mono font-bold text-[#ffabf3] bg-[#ffabf3]/5 border border-[#ffabf3]/25 px-3 py-1 rounded-full uppercase tracking-wider">
              {locale === "es" ? "¿Tienes Dudas?" : "Have Questions?"}
            </span>
            <h2 className="font-display text-3xl md:text-5xl font-black text-white tracking-tight">
              {locale === "es" ? "Preguntas Frecuentes de Campaña de Creadores" : "Creator Campaign FAQ"}
            </h2>
          </div>

          <div className="space-y-4">
            
            {/* Global Creator FAQ */}
            <div className="p-5 bg-white/[0.02] border border-white/5 rounded-2xl text-left space-y-2.5">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-[#00fbfb] shrink-0" />
                {locale === "es" 
                  ? "¿Puedo unirme como Creador/a si no estoy en Medellín o en una ciudad de pre-lanzamiento?" 
                  : "Can I join as a Creator if I am not located in Medellín or a pre-launch city?"}
              </h4>
              <p className="text-xs text-[#b9cac9] leading-relaxed pl-6">
                {locale === "es"
                  ? "¡Sí, por supuesto! Mientras que las funciones de citas presenciales se despliegan ciudad por ciudad, las transmisiones en vivo, el contenido premium, los espacios VIP, las propinas y el Asistente IA están 100% activos a nivel mundial desde el Día 1. Creadores de cualquier país pueden registrarse hoy, asegurar su 90% de comisión neta de Creador Fundador y monetizar una audiencia global."
                  : "Yes, absolutely! While in-person dating cohorts are expanding city by city, all Live Streaming, premium digital unlocks, VIP workspaces, direct tips, and AI Operations tools are 100% active worldwide from Day 1. Creators from any country can join today, secure the 90% Founding Creator revenue split, and monetize a global audience."}
              </p>
            </div>
            
            {/* FAQ 1 */}
            <div className="p-5 bg-white/[0.02] border border-white/5 rounded-2xl text-left space-y-2.5">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-[#00fbfb] shrink-0" />
                {locale === "es" ? "¿Qué es la oferta del Pack Creador Fundador (90% Comisión + 1 Año IA Gratis)?" : "What is the Founding Creator Pack (90% Revenue Split + 1-Year Free AI)?"}
              </h4>
              <p className="text-xs text-[#b9cac9] leading-relaxed pl-6">
                {locale === "es"
                  ? "Para los primeros 500 creadores de nuestra campaña de lanzamiento, ofrecemos el 90% de retención de ingresos netos y acceso total 100% gratuito a nuestro Asistente IA de Operaciones durante todo su primer año en SECCION. Tras el primer año, la tasa estándar de plataforma pasa al 20% (conservas el 80% de por vida) y el asistente IA cuesta solo 69 €/mes opcional."
                  : "For the first 500 creators joining our launch campaign, we offer a 90% net revenue split and 100% free, complete access to our built-in AI Operations Assistant for their entire first year on SECCION. After Year 1, the standard platform rate transitions to 20% (you keep 80% lifetime) with optional AI assistant at just €69/month."}
              </p>
            </div>

            {/* FAQ 2 */}
            <div className="p-5 bg-white/[0.02] border border-white/5 rounded-2xl text-left space-y-2.5">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-[#00fbfb] shrink-0" />
                {locale === "es" ? "¿Cómo reemplaza el Asistente IA a una agencia de gestión tradicional?" : "How does the AI Assistant replace a traditional management agency?"}
              </h4>
              <p className="text-xs text-[#b9cac9] leading-relaxed pl-6">
                {locale === "es"
                  ? "Las agencias cobran enormes comisiones (a menudo entre 30% y 50%) por responder tus mensajes directos, publicar contenido promocional y revisar contratos. El asistente IA nativo de SECCION hace este trabajo por ti. Responde mensajes con tu voz única 24/7, programa teasers en redes externas, gestiona tu contabilidad y rastrea la web para retirar contenido filtrado. Obtienes el poder de una agencia sin pagar la comisión de agencia."
                  : "Management agencies charge huge commissions (often 30% to 50%) to handle your direct messages, post teaser content, and review contracts. SECCION’s native AI assistant does this work for you. It responds to messages in your unique voice 24/7, schedules teasers on external social platforms, manages your bookkeeping, and scans the web to take down leaked content. You get the power of an agency without the agency fee."}
              </p>
            </div>

            {/* FAQ 3 */}
            <div className="p-5 bg-white/[0.02] border border-white/5 rounded-2xl text-left space-y-2.5">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-[#00fbfb] shrink-0" />
                {locale === "es" ? "¿Cómo funciona el reparto de ingresos (90% Fundadores / 80% Estándar)?" : "How does the revenue split work (90% Founding / 80% Standard)?"}
              </h4>
              <p className="text-xs text-[#b9cac9] leading-relaxed pl-6">
                {locale === "es"
                  ? "Los creadores fundadores reciben el 90% de los Ingresos Netos durante su período de campaña (y el 80% estándar posteriormente) en todas las suscripciones, propinas, streams y pedidos personalizados. Los Ingresos Netos son el Valor Bruto del Cliente menos las comisiones de procesamiento bancario de terceros (tarifas de tarjeta Segpay / CCBill). Cero comisiones de agencia o intermediarios abusivos."
                  : "Founding creators receive 90% of Net Revenue during their campaign period (and 80% standard afterwards) across all subscriptions, tips, streams, and custom orders. Net Revenue is Gross Customer Value minus third-party payment processing fees (Segpay / CCBill credit card fees). Zero agency cuts or exploitative markups."}
              </p>
            </div>


            {/* FAQ 4 */}
            <div className="p-5 bg-white/[0.02] border border-white/5 rounded-2xl text-left space-y-2.5">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-[#00fbfb] shrink-0" />
                {locale === "es" ? "¿Qué son los \"Creadores Patrocinados\" y cómo funciona el matchmaking?" : "What are \"Sponsored Creators\" and how does matchmaking work?"}
              </h4>
              <p className="text-xs text-[#b9cac9] leading-relaxed pl-6">
                {locale === "es"
                  ? "En lugar de tener una página pública y vender a desconocidos, SECCION se enfoca en conexiones de calidad. Los miembros hacen match contigo según intereses comunes y compatibilidad de vibe. Una vez hecho el match, pueden unirse a tu círculo de Creadores Patrocinados para desbloquear tu espacio premium. Este proceso de matching construye relaciones de alta confianza, generando fans felices a largo plazo y unos ingresos estables."
                  : "Instead of setting up a public page and selling to strangers, SECCION focuses on quality connections. Members match with you based on shared interests and vibe compatibility. Once a match is made, they can join your Sponsored Creators circle to unlock your premium space. This matching process builds high-trust relationships, resulting in happy, long-term fans and a steady income."}
              </p>
            </div>

            {/* FAQ 5 */}
            <div className="p-5 bg-white/[0.02] border border-white/5 rounded-2xl text-left space-y-2.5">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-[#00fbfb] shrink-0" />
                {locale === "es" ? "¿Cómo protege SECCION mi contenido contra filtraciones?" : "How does SECCION protect my content from leaks?"}
              </h4>
              <p className="text-xs text-[#b9cac9] leading-relaxed pl-6">
                {locale === "es"
                  ? "Mantenemos tus creaciones seguras con doble capa de protección. Primero, nuestro Cifrado Difuminado Facial mantiene tu rostro en privado en los feeds públicos, permitiéndote elegir exactamente quién te ve conforme construyes confianza. Segundo, tus fotos y videos compartidos desaparecen de nuestros servidores tan pronto se abren, y bloqueamos automáticamente los intentos de captura de pantalla tanto en iPhone como en Android. Lo que compartes se queda entre tú y tu match."
                  : "We keep your creations safe with double-layer protection. First, our Face Blur Encryption keeps your face private on public feeds, letting you choose exactly who gets to see you as you build trust. Second, your shared photos and videos disappear from our servers immediately after they're opened, and we automatically stop screenshot attempts on both iPhones and Androids. What you share stays between you and your match."}
              </p>
            </div>

            {/* FAQ 6 */}
            <div className="p-5 bg-white/[0.02] border border-white/5 rounded-2xl text-left space-y-2.5">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-[#00fbfb] shrink-0" />
                {locale === "es" ? "¿Tengo el control de quién ve mi contenido?" : "Am I in control of who sees my content?"}
              </h4>
              <p className="text-xs text-[#b9cac9] leading-relaxed pl-6">
                {locale === "es"
                  ? "Por supuesto. Tienes el control total sobre la visibilidad de tu perfil. Puedes bloquear a usuarios específicos, restringir el acceso por ubicación geográfica (países, estados o ciudades), ocultar tu estado en línea y usar un alias de creador para proteger tu identidad personal."
                  : "Absolutely. You have total control over your profile's visibility. You can block specific users, restrict access by geographic location (countries, states, or cities), hide your online status, and use a creator alias to protect your personal identity."}
              </p>
            </div>

            {/* FAQ 7 */}
            <div className="p-5 bg-white/[0.02] border border-white/5 rounded-2xl text-left space-y-2.5">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-[#00fbfb] shrink-0" />
                {locale === "es" ? "¿Tengo que completar una Verificación de Identidad inmediatamente?" : "Do I have to complete an Identity Check immediately?"}
              </h4>
              <p className="text-xs text-[#b9cac9] leading-relaxed pl-6">
                {locale === "es"
                  ? "No. Para hacer el Tour Demo y explorar la plataforma, solo necesitas compartir tu email, usuario de Telegram y número de WhatsApp. Una Verificación de Identidad estricta (documento oficial y prueba de vida) solo se requiere para Creadores cuando están listos para publicar contenido premium, configurar su espacio público y procesar pagos. Los Miembros no necesitan verificación de ID para navegar o hacer match."
                  : "No. To take the Demo Tour and explore the platform, you only need to share your email, Telegram username, and WhatsApp number. A strict Identity Check (government-issued ID and liveness check) is only required for Creators when they are ready to publish premium content, set up their public space, and process payouts. Members are not required to complete ID checks for standard browsing or matching."}
              </p>
            </div>

            {/* FAQ 8 */}
            <div className="p-5 bg-white/[0.02] border border-white/5 rounded-2xl text-left space-y-2.5">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-[#00fbfb] shrink-0" />
                {locale === "es" ? "¿Cómo mantiene SECCION una plataforma segura y que cumpla la normativa?" : "How does SECCION keep the platform safe and compliant?"}
              </h4>
              <p className="text-xs text-[#b9cac9] leading-relaxed pl-6">
                {locale === "es"
                  ? "SECCION se construye sobre la seguridad y la protección legal. Cumplimos con las regulaciones de contenido digital, las leyes de seguridad del creador independiente y los estándares de seguridad de contenido para proteger tanto a creadores como a miembros. Brindamos un espacio seguro, profesional y normativo donde puedes construir tu marca con total tranquilidad."
                  : "SECCION is built on safety and legal protection. We adhere to digital content regulations, independent creator safety laws, and content safety standards to protect creators and members alike. We provide a secure, professional, and compliant space where you can build your brand with peace of mind."}
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Footer */}
      <PublicFooter />

      <StudioTourModal 
        isOpen={isTourOpen} 
        onClose={() => setIsTourOpen(false)} 
        onClaimOffer={() => {
          setIsTourOpen(false);
          const applyElem = document.getElementById("apply");
          if (applyElem) {
            applyElem.scrollIntoView({ behavior: "smooth" });
          } else {
            window.location.href = '#apply';
          }
        }}
      />
    </div>
  );
}
