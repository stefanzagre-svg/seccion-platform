"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  Loader2,
  Key,
  Mail,
  Lock,
  ArrowLeft,
  AlertCircle,
  ShieldAlert,
  Sparkles,
  CheckCircle2,
  Clock,
  Crown,
  MessageCircle,
  ShieldCheck,
} from "lucide-react";
import PrelaunchModal from "@/components/PrelaunchModal";
import { useTranslation } from "@/context/LanguageContext";

// Double bezel card wrapper
function DoubleBezelCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-[2.5rem] p-1 bg-white/[0.04] border border-white/10 shadow-[0_24px_48px_-12px_rgba(0,0,0,0.6)] backdrop-blur-xl relative overflow-visible ${className}`}>
      <div className="absolute inset-0 border border-white/5 rounded-[2.5rem] pointer-events-none" />
      <div className="rounded-[calc(2.5rem-0.25rem)] bg-[#0F0F1A]/95 p-8 border border-white/5 relative z-10">
        {children}
      </div>
    </div>
  );
}

type PrelaunchStatusState = "idle" | "pending_creator" | "unregistered" | "waitlist_joined";

export default function LoginPage() {
  const router = useRouter();
  const { t, locale } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(true);
  const [showPasswordMode, setShowPasswordMode] = useState(false);
  const [sentMode, setSentMode] = useState<"code" | "link">("code");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [isPrelaunchModalOpen, setIsPrelaunchModalOpen] = useState(false);

  // Pre-launch status states for non-approved or member visitors
  const [prelaunchState, setPrelaunchState] = useState<PrelaunchStatusState>("idle");
  const [waitlistPosition, setWaitlistPosition] = useState<number | null>(null);
  const [joiningWaitlist, setJoiningWaitlist] = useState(false);

  // Auto-fill email from URL query parameters (?email=...) and listen for auth callbacks
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const emailParam = params.get("email");
      if (emailParam) {
        setEmail(emailParam.trim());
      }
      if (params.get("mode") === "password") {
        setShowPasswordMode(true);
      }
      if (params.get("error") === "auth_callback_failed") {
        setErrorMsg(
          locale === "es"
            ? "El enlace de acceso directo expiró o se abrió en otro navegador. Introduce tu correo para recibir un código de 6 dígitos instantáneo."
            : "The 1-click access link expired or was opened in another browser. Enter your email below to receive an instant 6-digit passcode."
        );
      }

      // Catch any URL hash fragments (#access_token=...) from legacy email links
      const supabase = createClient();
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (session?.user && (event === "SIGNED_IN" || event === "TOKEN_REFRESHED")) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", session.user.id)
            .maybeSingle();

          const role = profile?.role || session.user.user_metadata?.role || "creator";
          document.cookie = `sb_role=${role}; path=/; max-age=2592000; SameSite=Lax`;
          document.cookie = "sb_ob=1; path=/; max-age=2592000; SameSite=Lax";
          const explicitNext = params.get("next");
          const destination = explicitNext || (role === "creator" ? "/studio" : "/early-access");
          window.location.href = destination;
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [locale]);

  const handleOneClickWaitlist = async () => {
    if (!email) return;
    setJoiningWaitlist(true);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/v2/waitlist/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.toLowerCase().trim(), city: "Global" }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok || res.status === 409) {
        setWaitlistPosition(data.position || null);
        setPrelaunchState("waitlist_joined");
      } else {
        setErrorMsg(data.error || "Could not join waitlist. Please try again.");
      }
    } catch {
      setErrorMsg("Network error while joining waitlist.");
    } finally {
      setJoiningWaitlist(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode || !email) return;
    setVerifyingOtp(true);
    setErrorMsg(null);

    const supabase = createClient();
    try {
      const cleanEmail = email.toLowerCase().trim();
      const { data, error } = await supabase.auth.verifyOtp({
        email: cleanEmail,
        token: otpCode.trim(),
        type: "email",
      });
      if (error) throw error;

      const params = new URLSearchParams(window.location.search);
      let resolvedRole: "creator" | "member" = "creator";

      if (data?.user) {
        const { data: existingProfile } = await supabase
          .from("profiles")
          .select("id, username, role")
          .eq("id", data.user.id)
          .maybeSingle();

        const defaultUsername = (cleanEmail.split("@")[0] || "creator")
          .toLowerCase()
          .replace(/[^a-z0-9_]/g, "");

        if (!existingProfile) {
          const isApprovedCreatorMeta = data.user.user_metadata?.role === "creator";
          resolvedRole = isApprovedCreatorMeta ? "creator" : "member";
          await supabase.from("profiles").upsert({
            id: data.user.id,
            username: defaultUsername,
            display_name: defaultUsername,
            role: resolvedRole,
          });
        } else {
          resolvedRole =
            existingProfile.role === "creator" || existingProfile.role === "admin"
              ? "creator"
              : "member";
        }

        document.cookie = "sb_ob=1; path=/; max-age=2592000; SameSite=Lax";
        document.cookie = `sb_role=${resolvedRole}; path=/; max-age=2592000; SameSite=Lax`;
        document.cookie = "sb_onboarding_completed=true; path=/; max-age=2592000; SameSite=Lax";
        if (typeof window !== "undefined") {
          if (resolvedRole === "creator") {
            sessionStorage.setItem("_onboarding_creator_archive_choice", "creator");
          } else {
            sessionStorage.removeItem("_onboarding_creator_archive_choice");
          }
        }
      }

      const explicitNext = params.get("next");
      // Approved Creators skip /onboarding and land directly in /studio
      const defaultDestination = resolvedRole === "creator" ? "/studio" : "/early-access";
      const nextTarget = explicitNext || defaultDestination;
      window.location.href = nextTarget;
    } catch (err: any) {
      console.error("OTP Verification Error:", err);
      setErrorMsg(
        err.message ||
          (locale === "es"
            ? "Código inválido o expirado. Revisa tu correo e inténtalo de nuevo."
            : "Invalid or expired code. Check your email for the 6-digit passcode.")
      );
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleMagicOtp = async (mode: "code" | "link") => {
    if (!email) return;
    setLoading(true);
    setErrorMsg(null);
    setPrelaunchState("idle");
    setSentMode(mode);

    const supabase = createClient();

    try {
      const cleanEmail = email.toLowerCase().trim();

      // Step 1: Check pre-launch status & auto-provision approved creators so they never hit password/signup errors
      const checkRes = await fetch("/api/v2/auth/prelaunch-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleanEmail }),
      });

      if (checkRes.ok) {
        const checkData = await checkRes.json();
        if (checkData.status === "pending_creator") {
          setPrelaunchState("pending_creator");
          setLoading(false);
          return;
        }
        if (checkData.status === "unregistered") {
          if (checkData.alreadyOnWaitlist) {
            setPrelaunchState("waitlist_joined");
          } else {
            setPrelaunchState("unregistered");
          }
          setLoading(false);
          return;
        }
      } else if (checkRes.status === 429) {
        setErrorMsg(
          locale === "es"
            ? "Demasiadas solicitudes. Por favor espera un momento antes de volver a intentarlo."
            : "Too many requests. Please wait a moment and try again."
        );
        setLoading(false);
        return;
      }

      // Step 2: Approved Creator -> Send 6-Digit Code or 1-Click Magic Link straight to /studio
      const params = new URLSearchParams(window.location.search);
      const explicitNext = params.get("next") || "/studio";
      const callbackUrl = `${window.location.origin}/auth/callback?next=${encodeURIComponent(explicitNext)}`;
      const options =
        mode === "link"
          ? {
              emailRedirectTo: callbackUrl,
            }
          : undefined;

      const { error } = await supabase.auth.signInWithOtp({
        email: cleanEmail,
        ...(options && { options }),
      });
      if (error) throw error;
      setMagicLinkSent(true);
    } catch (err: any) {
      console.error("Magic link error:", err);
      setErrorMsg(err.message || "Failed to send access code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSingleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    if (!agreedToTerms) {
      setErrorMsg(
        locale === "es"
          ? "Debes confirmar que eres mayor de 18 años y aceptar los Términos de Servicio y la Política de Privacidad para continuar."
          : "You must confirm that you are at least 18 years old and agree to SECCION's Terms of Service and Privacy Policy to continue."
      );
      return;
    }
    return handleMagicOtp("code");
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    setErrorMsg(null);
    setPrelaunchState("idle");
    const supabase = createClient();

    try {
      const cleanEmail = email.toLowerCase().trim();
      const res = await fetch("/api/admin/auth/founder-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleanEmail, password }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Failed to authenticate.");
      }

      if (json.session?.access_token && json.session?.refresh_token) {
        await supabase.auth.setSession({
          access_token: json.session.access_token,
          refresh_token: json.session.refresh_token,
        });
      }

      const searchParams = new URLSearchParams(window.location.search);
      const nextTarget =
        searchParams.get("next") ||
        json.redirectUrl ||
        (cleanEmail === "stefan.zagre@gmail.com" ? "/admin" : "/studio");

      window.location.href = nextTarget;
    } catch (err: any) {
      console.error("Password login error:", err);
      setErrorMsg(
        err.message ||
          (locale === "es"
            ? "Error de autenticación. Verifica tus credenciales o utiliza el acceso sin contraseña."
            : "Authentication error. Check your credentials or use passwordless access.")
      );
    } finally {
      setLoading(false);
    }
  };

  const directWhatsAppLink = `https://wa.me/34662907153?text=${encodeURIComponent(
    locale === "es"
      ? `Hola Stefan, mi correo es ${email}. Quiero confirmar mi aprobación como Creador Fundador en SECCION.`
      : `Hi Stefan, my email is ${email}. I'd like to fast-track my Founding Creator approval on SECCION.`
  )}`;

  return (
    <div className="min-h-screen bg-transparent text-white flex flex-col justify-center items-center p-4 relative">
      <PrelaunchModal isOpen={isPrelaunchModalOpen} onClose={() => setIsPrelaunchModalOpen(false)} />

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

      <div className="w-full max-w-[440px] relative z-10">
        {/* Back Link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-mono font-bold text-white/40 hover:text-[#00fbfb] transition mb-6 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>{locale === "es" ? "Volver al Inicio" : "Back to Home"}</span>
        </Link>

        {/* Pre-Launch Locked Banner */}
        <div className="mb-4 p-3.5 bg-[#00fbfb]/10 border border-[#00fbfb]/30 rounded-2xl flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-[#00fbfb] font-mono font-bold text-[11px] uppercase">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>
              {locale === "es" ? "Acceso Creadores Pre-Lanzamiento" : "Creator Pre-Launch Access"}
            </span>
          </div>
          <button
            onClick={() => setIsPrelaunchModalOpen(true)}
            className="text-[10px] font-mono font-bold text-[#ffabf3] underline hover:text-white transition cursor-pointer"
          >
            {locale === "es" ? "Saber Más" : "Learn Why"}
          </button>
        </div>

        <DoubleBezelCard>
          <div className="space-y-6 text-left">
            <div className="text-center space-y-2">
              <img
                src="/assets/logo/logo-wordmark.png"
                alt="SECCION"
                className="h-8 mx-auto object-contain drop-shadow-[0_0_20px_rgba(0,251,251,0.4)]"
              />
              <p className="text-[11px] font-mono font-bold text-[#00fbfb] uppercase tracking-wider">
                {t("onboarding.prelaunchGates.singleEmailTagline", "Instant Creator Studio & VIP Access (Passwordless)")}
              </p>
              <p className="text-[11px] text-[#b9cac9] leading-relaxed">
                {t(
                  "onboarding.prelaunchGates.singleEmailDesc",
                  "Enter your email. Approved Creators enter Studio directly; Members get instant VIP waitlist access."
                )}
              </p>
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded-xl flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Case B: Pending Creator Application Status Screen */}
            {prelaunchState === "pending_creator" ? (
              <div className="p-5 bg-[#ffabf3]/10 border border-[#ffabf3]/30 rounded-2xl space-y-4 text-center">
                <div className="w-12 h-12 rounded-full bg-[#ffabf3]/20 border border-[#ffabf3]/40 flex items-center justify-center mx-auto">
                  <Clock className="w-6 h-6 text-[#ffabf3]" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                    {t("onboarding.prelaunchGates.applicationUnderReviewTitle", "Your Creator Application is Under Review")}
                  </h3>
                  <p className="text-xs text-[#b9cac9] leading-relaxed">
                    {locale === "es" ? (
                      <>
                        Recibimos la solicitud para <strong className="text-white">{email}</strong>. En
                        cuanto sea aprobada recibirás acceso directo a tu Creator Studio (90% Split).
                      </>
                    ) : (
                      <>
                        We received the application for <strong className="text-white">{email}</strong>.
                        As soon as it is approved, your email will unlock direct access to Creator Studio
                        (90% Split).
                      </>
                    )}
                  </p>
                </div>
                <a
                  href={directWhatsAppLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-4 bg-[#25D366] hover:bg-[#25D366]/90 text-black font-mono text-xs font-black uppercase tracking-wider rounded-xl transition flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>
                    {t("onboarding.prelaunchGates.whatsappFastTrackBtn", "Fast-Track Approval on WhatsApp →")}
                  </span>
                </a>
                <button
                  type="button"
                  onClick={() => setPrelaunchState("idle")}
                  className="text-[10px] font-mono text-white/50 hover:text-white underline uppercase cursor-pointer"
                >
                  {t("onboarding.prelaunchGates.tryAnotherEmail", "← Use a different email")}
                </button>
              </div>
            ) : prelaunchState === "unregistered" ? (
              /* Case C: Unregistered Email -> 1-Click Creator Apply OR 1-Click Member VIP Waitlist */
              <div className="p-5 bg-white/5 border border-white/15 rounded-2xl space-y-4 text-center">
                <div className="space-y-1.5">
                  <span className="inline-block text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-[#00fbfb]/15 text-[#00fbfb]">
                    {t("onboarding.prelaunchGates.prelaunchGateTitle", "Pre-Launch Access Gate")}
                  </span>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                    {locale === "es"
                      ? "¿Cómo quieres unirte a SECCION?"
                      : "How would you like to join SECCION?"}
                  </h3>
                  <p className="text-xs text-[#b9cac9] leading-relaxed">
                    {locale === "es" ? (
                      <>
                        El correo <strong className="text-white">{email}</strong> aún no tiene una
                        cuenta activa de Creador Aprobado. Elige tu acceso en 1 clic:
                      </>
                    ) : (
                      <>
                        <strong className="text-white">{email}</strong> does not have an approved
                        Creator account yet. Choose your pre-launch path in 1 click:
                      </>
                    )}
                  </p>
                </div>

                <div className="space-y-2.5">
                  <Link
                    href={`/become-creator?email=${encodeURIComponent(email)}#apply`}
                    className="w-full py-3.5 px-4 bg-[#ffabf3] hover:bg-[#ffabf3]/90 text-black font-mono text-xs font-black uppercase tracking-wider rounded-xl transition flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,171,243,0.35)]"
                  >
                    <Crown className="w-4 h-4" />
                    <span>
                      {t("onboarding.prelaunchGates.applyAsCreatorBtn", "I'm a Creator — Apply for 90% Split →")}
                    </span>
                  </Link>

                  <button
                    type="button"
                    onClick={handleOneClickWaitlist}
                    disabled={joiningWaitlist}
                    className="w-full py-3 px-4 bg-[#00fbfb]/15 hover:bg-[#00fbfb]/25 border border-[#00fbfb]/40 text-[#00fbfb] font-mono text-xs font-bold uppercase tracking-wider rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {joiningWaitlist ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>
                          {t("onboarding.prelaunchGates.joinMemberWaitlistBtn", "I'm a Member — Join VIP Waitlist (1-Click)")}
                        </span>
                      </>
                    )}
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setPrelaunchState("idle")}
                  className="text-[10px] font-mono text-white/50 hover:text-white underline uppercase cursor-pointer"
                >
                  {t("onboarding.prelaunchGates.tryAnotherEmail", "← Use a different email")}
                </button>
              </div>
            ) : prelaunchState === "waitlist_joined" ? (
              <div className="p-5 bg-[#00fbfb]/10 border border-[#00fbfb]/30 rounded-2xl space-y-3 text-center">
                <CheckCircle2 className="w-10 h-10 text-[#00fbfb] mx-auto" />
                <h3 className="text-base font-bold text-white">
                  {t("onboarding.prelaunchGates.waitlistSuccessTitle", "You're on the Founding Member VIP List! 🎉")}
                </h3>
                <p className="text-xs text-[#b9cac9] leading-relaxed">
                  {locale === "es" ? (
                    <>
                      Reservamos el acceso prioritario para <strong className="text-white">{email}</strong>
                      {waitlistPosition ? ` (Posición #${waitlistPosition})` : ""}. Te avisaremos por
                      correo en cuanto abramos el acceso a Miembros.
                    </>
                  ) : (
                    <>
                      We reserved priority member access for{" "}
                      <strong className="text-white">{email}</strong>
                      {waitlistPosition ? ` (Position #${waitlistPosition})` : ""}. We will notify you as
                      soon as Member access opens.
                    </>
                  )}
                </p>
                <Link
                  href="/become-creator#apply"
                  className="inline-block text-[11px] font-mono font-bold text-[#ffabf3] hover:underline pt-1"
                >
                  {locale === "es"
                    ? "¿Eres Creador/a? Solicita tu 90% Split aquí →"
                    : "Are you a Creator instead? Apply for 90% Split here →"}
                </Link>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setPrelaunchState("idle")}
                    className="text-[10px] font-mono text-white/50 hover:text-white underline uppercase cursor-pointer"
                  >
                    {t("onboarding.prelaunchGates.tryAnotherEmail", "← Use a different email")}
                  </button>
                </div>
              </div>
            ) : magicLinkSent ? (
              <div className="space-y-4">
                {sentMode === "code" ? (
                  <>
                    <div className="p-4 bg-[#00fbfb]/5 border border-[#00fbfb]/20 text-[#00fbfb] text-xs rounded-xl space-y-1.5 text-center">
                      <h4 className="font-bold uppercase tracking-wider text-white">
                        {t("onboarding.prelaunchGates.enterOtpTitle", "Enter 6-Digit Access Code")}
                      </h4>
                      <p className="text-[11px] text-[#b9cac9] leading-relaxed">
                        {t("onboarding.prelaunchGates.enterOtpDesc", "We sent a 6-digit passcode to your email.")}{" "}
                        <strong className="text-white">{email}</strong>.
                      </p>
                    </div>

                    <form
                      onSubmit={handleVerifyOtp}
                      className="space-y-3 p-4 bg-white/5 border border-white/10 rounded-2xl"
                    >
                      <label className="block text-[10px] font-mono text-[#00fbfb] uppercase font-bold tracking-wider text-center">
                        {locale === "es" ? "Ingresa el Código:" : "Enter Code:"}
                      </label>
                      <input
                        type="text"
                        maxLength={8}
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value)}
                        placeholder="123456"
                        autoFocus
                        className="w-full bg-black/60 border border-white/20 focus:border-[#00fbfb] rounded-xl py-3 text-center text-xl font-mono tracking-[0.25em] font-bold outline-none transition text-white"
                      />
                      <button
                        type="submit"
                        disabled={verifyingOtp || otpCode.length < 6}
                        className="w-full py-3.5 bg-[#00fbfb] text-black font-mono text-xs font-black uppercase tracking-wider rounded-xl hover:shadow-[0_0_15px_rgba(0,251,251,0.5)] transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40"
                      >
                        {verifyingOtp ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <span>
                            {t("onboarding.prelaunchGates.enterStudioDirectly", "Enter Creator Studio Directly →")}
                          </span>
                        )}
                      </button>
                    </form>

                    <button
                      type="button"
                      onClick={() => handleMagicOtp("link")}
                      disabled={loading}
                      className="w-full py-2.5 bg-white/5 border border-white/10 text-white font-mono text-[10px] font-bold uppercase tracking-wider rounded-xl hover:bg-white/10 transition flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span>
                        {t("onboarding.prelaunchGates.sendMagicLinkInstead", "✉️ Send 1-Click Magic Link instead")}
                      </span>
                    </button>
                  </>
                ) : (
                  <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl space-y-2 text-center">
                    <h4 className="font-bold uppercase tracking-wider">
                      {locale === "es" ? "¡Enlace de 1-Clic Enviado!" : "1-Click Magic Link Sent!"}
                    </h4>
                    <p className="text-[10px] text-[#b9cac9] leading-relaxed">
                      {locale === "es" ? (
                        <>
                          Enviamos tu enlace directo a <strong className="text-white">{email}</strong>.
                          Haz clic en el enlace desde tu correo para entrar directo a tu Creator Studio.
                        </>
                      ) : (
                        <>
                          We sent your 1-click link to <strong className="text-white">{email}</strong>.
                          Click the link in your email to enter your Creator Studio directly.
                        </>
                      )}
                    </p>
                  </div>
                )}

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setMagicLinkSent(false);
                      setErrorMsg(null);
                    }}
                    className="text-[10px] font-mono text-white/50 hover:text-white underline uppercase cursor-pointer"
                  >
                    {t("onboarding.prelaunchGates.tryAnotherEmail", "← Use a different email")}
                  </button>
                </div>
              </div>
            ) : showPasswordMode ? (
              /* Founder / Admin Password Mode */
              <form onSubmit={handlePasswordLogin} className="space-y-4">
                <div className="p-3 bg-white/5 border border-white/15 rounded-xl text-[11px] text-[#b9cac9] leading-relaxed flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#00fbfb] shrink-0 mt-0.5" />
                  <span>
                    {locale === "es"
                      ? "Acceso administrativo con contraseña para fundadores y equipo de SECCION."
                      : "Administrative password authentication for SECCION founders and staff."}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[9px] font-mono text-white/50 uppercase font-bold tracking-wider">
                    {t("onboarding.prelaunchGates.emailInputLabel", "Your Email Address")}
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={t("onboarding.prelaunchGates.emailPlaceholder", "you@email.com")}
                      required
                      className="w-full bg-black/40 border border-white/10 focus:border-[#00fbfb]/50 rounded-xl py-3 pl-10 pr-4 text-xs outline-none transition text-white"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[9px] font-mono text-white/50 uppercase font-bold tracking-wider">
                    {t("onboarding.prelaunchGates.passwordLabel", "Account Password")}
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      minLength={6}
                      className="w-full bg-black/40 border border-white/10 focus:border-[#00fbfb]/50 rounded-xl py-3 pl-10 pr-4 text-xs outline-none transition text-white"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-[#00fbfb] text-black font-mono text-xs font-black uppercase tracking-wider rounded-xl hover:shadow-[0_0_15px_rgba(0,251,251,0.5)] transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Key className="w-4 h-4" />
                      <span>
                        {locale === "es" ? "Entrar con Contraseña →" : "Sign In with Password →"}
                      </span>
                    </>
                  )}
                </button>

                <div className="text-center pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setShowPasswordMode(false);
                      setErrorMsg(null);
                    }}
                    className="text-[10px] font-mono text-white/50 hover:text-white underline uppercase cursor-pointer"
                  >
                    {t("onboarding.prelaunchGates.backToEmailLogin", "← Back to Passwordless Email")}
                  </button>
                </div>
              </form>
            ) : (
              /* UNIFIED SINGLE-FIELD EMAIL ENTRY (Core Flow) */
              <form onSubmit={handleSingleEmailSubmit} className="space-y-4">
                {/* Email Input */}
                <div className="space-y-1.5">
                  <label className="block text-[9px] font-mono text-white/50 uppercase font-bold tracking-wider">
                    {t("onboarding.prelaunchGates.emailInputLabel", "Your Email Address")}
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (prelaunchState !== "idle") setPrelaunchState("idle");
                      }}
                      placeholder={t("onboarding.prelaunchGates.emailPlaceholder", "you@email.com")}
                      required
                      autoFocus
                      className="w-full bg-black/40 border border-white/10 focus:border-[#00fbfb]/50 rounded-xl py-3.5 pl-10 pr-4 text-sm outline-none transition text-white placeholder:text-white/20"
                    />
                  </div>
                </div>

                {/* 18+ and Terms & Privacy Consent Checkbox (M1 Security & Compliance) */}
                <label className="flex items-start gap-2.5 text-[11px] text-[#b9cac9] leading-tight cursor-pointer pt-1 select-none">
                  <input
                    type="checkbox"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="mt-0.5 rounded border-white/20 bg-black/40 text-[#00fbfb] focus:ring-0 cursor-pointer"
                  />
                  <span>
                    {locale === "es" ? (
                      <>
                        Declaro ser mayor de 18 años y acepto los{" "}
                        <Link href="/rules" target="_blank" className="text-[#00fbfb] underline hover:text-white">
                          Términos de Servicio
                        </Link>{" "}
                        y la{" "}
                        <Link href="/privacy" target="_blank" className="text-[#00fbfb] underline hover:text-white">
                          Política de Privacidad
                        </Link>{" "}
                        de SECCION.
                      </>
                    ) : (
                      <>
                        I declare that I am at least 18 years old and agree to SECCION's{" "}
                        <Link href="/rules" target="_blank" className="text-[#00fbfb] underline hover:text-white">
                          Terms of Service
                        </Link>{" "}
                        and{" "}
                        <Link href="/privacy" target="_blank" className="text-[#00fbfb] underline hover:text-white">
                          Privacy Policy
                        </Link>
                        .
                      </>
                    )}
                  </span>
                </label>

                {/* Single Primary Action Button */}
                <button
                  type="submit"
                  disabled={loading || !email}
                  className="w-full py-3.5 bg-[#00fbfb] text-black font-mono text-xs font-black uppercase tracking-wider rounded-xl hover:shadow-[0_0_20px_rgba(0,251,251,0.5)] transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>
                        {t("onboarding.prelaunchGates.continueWithEmail", "Continue with Email →")}
                      </span>
                    </>
                  )}
                </button>

                {/* Discreet Admin / Password Sign-In Toggle */}
                <div className="pt-2 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setShowPasswordMode(true);
                      setErrorMsg(null);
                    }}
                    className="text-[10px] font-mono text-white/35 hover:text-[#00fbfb] transition underline uppercase cursor-pointer"
                  >
                    {t("onboarding.prelaunchGates.adminLoginLink", "Admin / Founder password sign-in")}
                  </button>
                </div>
              </form>
            )}

            <div className="border-t border-white/5 pt-4 text-center space-y-2">
              <p className="text-[10px] text-[#b9cac9]">
                {t(
                  "onboarding.prelaunchGates.loginNotAppliedNotice",
                  "Are you a creator who hasn't applied for 90% revenue & 1-Year Free AI Assistant?"
                )}
              </p>
              <Link
                href="/become-creator#apply"
                className="inline-block text-[11px] font-mono font-bold text-[#ffabf3] hover:underline"
              >
                {t("onboarding.prelaunchGates.loginApplyNow", "APPLY NOW")} →
              </Link>
            </div>
          </div>
        </DoubleBezelCard>
      </div>
    </div>
  );
}
