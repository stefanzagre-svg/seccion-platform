"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, ArrowRight, Check, AlertTriangle, Loader2, MessageCircle, ShieldCheck, Zap } from "lucide-react";
import { useTranslation } from "@/context/LanguageContext";

interface CreatorQuickApplyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreatorQuickApplyModal({ isOpen, onClose }: CreatorQuickApplyModalProps) {
  const { t, locale } = useTranslation();
  
  // Multi-step micro-commitment state
  const [step, setStep] = useState<1 | 2 | "submitting" | "success">(1);
  const [handleOrLink, setHandleOrLink] = useState("");
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [phoneOrTelegram, setPhoneOrTelegram] = useState("");
  const [city, setCity] = useState("");
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const normalizeSocialLink = (input: string) => {
    const trimmed = input.trim();
    if (!trimmed) return "";
    if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed;
    if (trimmed.startsWith("@")) return `https://instagram.com/${trimmed.slice(1)}`;
    if (trimmed.includes(".com") || trimmed.includes(".me") || trimmed.includes(".tv") || trimmed.includes(".fans") || trimmed.includes(".ai") || trimmed.includes(".")) return `https://${trimmed}`;
    return `https://instagram.com/${trimmed}`;
  };

  // Step 1: Capture Handle + Email (High intent, zero friction)
  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!handleOrLink.trim()) {
      setError(locale === "es" ? "Ingresa tu @usuario o enlace de red social" : "Enter your @handle or social link");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setError(locale === "es" ? "Ingresa un correo electrónico válido" : "Enter a valid email address");
      return;
    }
    setError("");
    setStep(2);
    // Capture the lead immediately so abandoning step 2 never loses it
    fetch("/api/v2/creator/apply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName: handleOrLink.replace("@", "").trim() || "Creator",
        email: email.toLowerCase().trim(),
        link1: normalizeSocialLink(handleOrLink),
        claimOffer: true,
        stage: "lead",
        locale,
        source: getLeadSource(),
      }),
      keepalive: true,
    }).catch(() => {});
  };

  const getLeadSource = () => {
    if (typeof window === "undefined") return "direct";
    const p = new URLSearchParams(window.location.search);
    const utm = ["utm_source", "utm_medium", "utm_campaign"].map((k) => p.get(k)).filter(Boolean).join("/");
    return (utm || document.referrer || navigator.userAgent.match(/Instagram|TikTok|musical_ly|FBAN|FBAV/i)?.[0] || "direct") as string;
  };

  // Step 2: Finalize optional extra details & send
  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStep("submitting");
    setError("");

    const payload = {
      fullName: fullName.trim() || handleOrLink.replace("@", "").trim(),
      email: email.toLowerCase().trim(),
      link1: normalizeSocialLink(handleOrLink),
      phone: phoneOrTelegram.trim() || null,
      telegram: phoneOrTelegram.startsWith("@") ? phoneOrTelegram.trim() : null,
      city: city.trim() || null,
      claimOffer: true,
      stage: "details",
      source: getLeadSource(),
    };

    try {
      const res = await fetch("/api/v2/creator/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.status === 409) {
        // Already registered -> treat as success for the creator
        setStep("success");
        return;
      }

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || (locale === "es" ? "Error al enviar. Intenta de nuevo." : "Submission error. Please try again."));
        setStep(2);
        return;
      }

      if (typeof window !== "undefined") {
        localStorage.setItem("seccion_creator_applied", "true");
        localStorage.setItem("seccion_creator_data", JSON.stringify(payload));
        (window as any).fbq?.("track", "Lead");
        (window as any).ttq?.track("SubmitForm");
      }

      setStep("success");
    } catch (err) {
      setError(locale === "es" ? "Error de red. Intenta más tarde." : "Network error. Please try again later.");
      setStep(2);
    }
  };

  // 1-Tap WhatsApp Direct Apply
  const handleWhatsAppDirect = () => {
    const defaultMsg = locale === "es"
      ? "Hola SECCION, vi su plataforma y quiero asegurar mi 90% de ganancias y Pack de IA como Creador Fundador."
      : "Hi SECCION, I saw your platform and want to claim my 90% payout and free AI Pack as a Founding Creator.";
    const url = `https://wa.me/34662907153?text=${encodeURIComponent(defaultMsg)}`;
    (window as any).fbq?.("track", "Contact");
    (window as any).ttq?.track("Contact");
    window.open(url, "_blank");
  };


  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-xl overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-3xl p-1 bg-gradient-to-tr from-[#00fbfb]/30 via-white/10 to-[#ffabf3]/30 border border-white/20 shadow-[0_20px_70px_rgba(0,0,0,0.9)] overflow-hidden my-4">
        <div className="rounded-[calc(1.5rem-2px)] bg-[#0A0A14]/98 p-6 sm:p-8 relative">
          
          {/* Close button with safe area */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/15 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          <AnimatePresence mode="wait">
            {step === "success" ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-6 space-y-4"
              >
                <div className="w-16 h-16 rounded-full bg-[#00fbfb]/20 border border-[#00fbfb]/40 flex items-center justify-center mx-auto text-[#00fbfb]">
                  <Check className="w-8 h-8" />
                </div>
                
                <h3 className="text-2xl font-black text-white font-display">
                  {locale === "es" ? "¡Solicitud Recibida! 🎉" : "Application Received! 🎉"}
                </h3>

                <p className="text-sm text-[#b9cac9] leading-relaxed max-w-sm mx-auto">
                  {locale === "es" 
                    ? "Tu puesto para el 90% de ganancias y Pack de IA del 1er Año está reservado. Te contactaremos en breve para darte acceso al Studio."
                    : "Your spot for the 90% payout split and Year 1 AI Pack is locked in. We will reach out shortly to activate your Studio access."}
                </p>

                <div className="pt-2">
                  <button
                    onClick={onClose}
                    className="w-full py-3.5 px-6 rounded-2xl bg-[#00fbfb] text-black font-mono font-bold text-xs uppercase tracking-wider hover:opacity-90 transition"
                  >
                    {locale === "es" ? "Entendido / Continuar" : "Got it / Continue"}
                  </button>
                </div>
              </motion.div>
            ) : step === 1 ? (
              <motion.div
                key="step1"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-5 text-left"
              >
                {/* Header Badge */}
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00fbfb]/10 border border-[#00fbfb]/30">
                  <Sparkles className="w-3.5 h-3.5 text-[#00fbfb]" />
                  <span className="text-[10px] font-mono font-bold text-[#00fbfb] uppercase tracking-wider">
                    {locale === "es" ? "Paso 1 de 2: Acceso Rápido (30s)" : "Step 1 of 2: Fast Track (30s)"}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <h3 className="text-xl sm:text-2xl font-black text-white font-display leading-tight">
                    {locale === "es" ? "Asegura tu 90% de Ganancias" : "Claim Your 90% Net Payout"}
                  </h3>
                  <p className="text-xs text-[#b9cac9] font-sans leading-relaxed">
                    {locale === "es" 
                      ? "Sin tarjeta, sin DNI para probar. Ingresa tus datos básicos y te enviaremos tu invitación oficial."
                      : "No ID or credit card required. Enter your basic handle to receive your official studio invitation."}
                  </p>
                </div>

                {error && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2 font-mono">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <form onSubmit={handleStep1Submit} className="space-y-4 pt-1">
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-[#b9cac9]">
                      {locale === "es" ? "Tu @Instagram, @TikTok o Enlace *" : "Your @Instagram, @TikTok or Link *"}
                    </label>
                    <input
                      type="text"
                      required
                      value={handleOrLink}
                      onChange={(e) => setHandleOrLink(e.target.value)}
                      placeholder="@tuusuario o instagram.com/tuusuario"
                      className="w-full px-4 py-3.5 rounded-xl bg-black/60 border border-white/15 focus:border-[#00fbfb] text-white text-base placeholder-white/30 focus:outline-none transition font-sans"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-[#b9cac9]">
                      {locale === "es" ? "Correo Electrónico *" : "Email Address *"}
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="creador@ejemplo.com"
                      className="w-full px-4 py-3.5 rounded-xl bg-black/60 border border-white/15 focus:border-[#00fbfb] text-white text-base placeholder-white/30 focus:outline-none transition font-sans"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#00fbfb] to-[#00d2d2] text-black font-mono font-black text-xs uppercase tracking-widest hover:shadow-[0_0_30px_rgba(0,251,251,0.6)] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg"
                  >
                    <span>{locale === "es" ? "CONTINUAR (PASO 2)" : "CONTINUE (STEP 2)"}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>

                {/* Direct WhatsApp Action Alternative */}
                <div className="pt-2 border-t border-white/10 flex flex-col items-center gap-2">
                  <span className="text-[10px] font-mono text-white/40 uppercase">
                    {locale === "es" ? "¿Prefieres aplicar por WhatsApp?" : "Prefer to apply via WhatsApp?"}
                  </span>
                  <button
                    type="button"
                    onClick={handleWhatsAppDirect}
                    className="w-full py-2.5 px-4 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-mono font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>{locale === "es" ? "Hablar directo con el Equipo (WhatsApp)" : "Chat with our Team (WhatsApp)"}</span>
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4 text-left"
              >
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ffabf3]/10 border border-[#ffabf3]/30">
                  <Zap className="w-3.5 h-3.5 text-[#ffabf3]" />
                  <span className="text-[10px] font-mono font-bold text-[#ffabf3] uppercase tracking-wider">
                    {locale === "es" ? "Paso 2 de 2: Últimos Detalles (Opcional)" : "Step 2 of 2: Final Details (Optional)"}
                  </span>
                </div>

                <div className="space-y-1">
                  <h3 className="text-xl font-bold text-white font-display">
                    {locale === "es" ? "¿Dónde te enviamos tu acceso?" : "Where should we send your invite?"}
                  </h3>
                  <p className="text-xs text-[#b9cac9]">
                    {locale === "es" ? "Opcional: déjanos tu WhatsApp o Telegram para enviarte tu código VIP de inmediato." : "Optional: leave WhatsApp or Telegram to receive your VIP access code instantly."}
                  </p>
                </div>

                {error && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2 font-mono">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <form onSubmit={handleFinalSubmit} className="space-y-3.5 pt-1">
                  <div className="space-y-1">
                    <label className="block text-[11px] font-mono uppercase tracking-wider text-[#b9cac9]">
                      {locale === "es" ? "Nombre o Apodo de Creador" : "Creator Name or Nickname"}
                    </label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Elena"
                      className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/15 focus:border-[#00fbfb] text-white text-base placeholder-white/30 focus:outline-none transition font-sans"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[11px] font-mono uppercase tracking-wider text-[#b9cac9]">
                      {locale === "es" ? "WhatsApp o Telegram (Opcional)" : "WhatsApp or Telegram (Optional)"}
                    </label>
                    <input
                      type="text"
                      value={phoneOrTelegram}
                      onChange={(e) => setPhoneOrTelegram(e.target.value)}
                      placeholder="+54 9 11... / +1 809... / @usuario"
                      className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/15 focus:border-[#00fbfb] text-white text-base placeholder-white/30 focus:outline-none transition font-sans"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[11px] font-mono uppercase tracking-wider text-[#b9cac9]">
                      {locale === "es" ? "Ciudad y País (Opcional)" : "City & Country (Optional)"}
                    </label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g. Buenos Aires, Argentina"
                      className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/15 focus:border-[#00fbfb] text-white text-base placeholder-white/30 focus:outline-none transition font-sans"
                    />
                  </div>

                  <div className="pt-2 flex gap-3">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="py-3.5 px-4 rounded-xl border border-white/15 text-white/70 font-mono text-xs hover:bg-white/5 transition"
                    >
                      {locale === "es" ? "Atrás" : "Back"}
                    </button>
                    <button
                      type="submit"
                      disabled={step === "submitting"}
                      className="flex-1 py-3.5 px-6 rounded-xl bg-gradient-to-r from-[#00fbfb] to-[#00d2d2] text-black font-mono font-black text-xs uppercase tracking-wider hover:opacity-90 transition flex items-center justify-center gap-2 cursor-pointer shadow-lg disabled:opacity-50"
                    >
                      {step === "submitting" ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-black" />
                          <span>{locale === "es" ? "ENVIANDO..." : "SUBMITTING..."}</span>
                        </>
                      ) : (
                        <span>{locale === "es" ? "FINALIZAR SOLICITUD" : "FINISH APPLICATION"}</span>
                      )}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Privacy badge */}
          <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-center gap-2 text-[10px] text-white/40 font-mono">
            <ShieldCheck className="w-3.5 h-3.5 text-[#39FF14]" />
            <span>{locale === "es" ? "100% Confidencial. Tus datos nunca son públicos." : "100% Confidential. Your info is never public."}</span>
          </div>

        </div>
      </div>
    </div>
  );
}
