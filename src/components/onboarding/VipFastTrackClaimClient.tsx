'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  ShieldCheck,
  Bot,
  Percent,
  ArrowRight,
  Mail,
  KeyRound,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Lock,
  LogOut,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { PublicVipInviteSummary } from '@/lib/vip-invites';
import type { EmailLocale } from '@/lib/email';

interface VipFastTrackClaimClientProps {
  summary: PublicVipInviteSummary;
  initialError: string | null;
  currentUserEmail: string | null;
}

const COPY: Record<
  EmailLocale,
  {
    badge: string;
    headingPrefix: string;
    headingFallback: string;
    subtitle: string;
    perk1Title: string;
    perk1Desc: string;
    perk2Title: string;
    perk2Desc: string;
    perk3Title: string;
    perk3Desc: string;
    moroccoBadge: string;
    googleCta: string;
    orDivider: string;
    emailPlaceholder: string;
    emailLockedHint: string;
    sendCodeCta: string;
    otpLabel: string;
    otpPlaceholder: string;
    verifyOtpCta: string;
    changeEmail: string;
    signedInTitle: string;
    enterStudioCta: string;
    switchAccountCta: string;
    statusTitles: Record<string, string>;
    statusDescs: Record<string, string>;
    applyFallbackCta: string;
    loginFallbackCta: string;
    errors: Record<string, string>;
    privacyNote: string;
  }
> = {
  en: {
    badge: 'FOUNDER VIP FAST-TRACK PASS',
    headingPrefix: 'Express Studio Access for',
    headingFallback: 'Founding Creator',
    subtitle:
      'You have been pre-approved by Stefan. Skip the application form and approval queue — activate your creator studio in 60 seconds.',
    perk1Title: '90% Net Payout (Year 1)',
    perk1Desc:
      'Keep 90% of your net creator earnings during your entire 1st year (365 days). Automatically shifts to SECCION’s standard 80% split in Year 2.',
    perk2Title: '1 Year Free AI Copilot',
    perk2Desc:
      '24/7 multilingual DM wingman, automated upsell suggestions, and Content Ops included free for 12 months.',
    perk3Title: 'Zero Form, Instant Studio',
    perk3Desc:
      'Go straight to your Creator Studio. Finish 18+ DIDIT KYC, upload 1 avatar + 2 photos, and set your rates at your own pace.',
    moroccoBadge: 'Morocco Domestic Privacy Shield (`MA` Geofence) pre-armed for your Studio',
    googleCta: 'Continue with Google (1-Click Studio)',
    orDivider: 'OR ACTIVATE WITH EMAIL CODE (INSTANT IN THIS TAB)',
    emailPlaceholder: 'creator@email.com',
    emailLockedHint: 'This personal pass is reserved for',
    sendCodeCta: 'Send 6-Digit Access Code',
    otpLabel: 'Enter the 6-digit code sent to your inbox:',
    otpPlaceholder: '123456',
    verifyOtpCta: 'Verify & Open Creator Studio',
    changeEmail: 'Use a different email',
    signedInTitle: 'Signed in as',
    enterStudioCta: 'Activate VIP Pass & Enter Studio',
    switchAccountCta: 'Use another account',
    statusTitles: {
      claimed: 'This VIP Pass Has Already Been Activated',
      expired: 'This VIP Pass Has Expired',
      revoked: 'This VIP Pass Was Revoked',
      not_found: 'VIP Pass Not Found',
    },
    statusDescs: {
      claimed:
        'If you already activated this invite, sign in to access your Creator Studio with your Year-1 benefits.',
      expired:
        'Invitation links stay active for a limited window. Request a fresh pass or submit a standard creator application below.',
      revoked:
        'This invite link is no longer active. Contact Stefan on WhatsApp (+34 662 907 153) or submit a fresh application.',
      not_found:
        'Double-check your VIP link, or submit a creator application directly below.',
    },
    applyFallbackCta: 'Apply on SECCION',
    loginFallbackCta: 'Sign in to Studio',
    errors: {
      email_mismatch: 'Please authenticate using the email address bound to this VIP pass.',
      already_claimed: 'This VIP pass was already claimed.',
      expired: 'This VIP pass has expired.',
      revoked: 'This VIP pass has been revoked.',
      rate_limited: 'Too many attempts. Please wait a minute and try again.',
    },
    privacyNote: '18+ DIDIT KYC & Content Ops setup happens securely inside Creator Studio before going live.',
  },
  es: {
    badge: 'PASE VIP FAST-TRACK FUNDADORA',
    headingPrefix: 'Acceso Express al Studio para',
    headingFallback: 'Creadora Fundadora',
    subtitle:
      'Has sido preaprobada directamente por Stefan. Sáltate el formulario y la cola de espera: activa tu Creator Studio en 60 segundos.',
    perk1Title: '90% Neto (Primer Año)',
    perk1Desc:
      'Conservas el 90% neto de tus ingresos durante todo tu 1er año (365 días). A partir del año 2 pasa automáticamente al 80% estándar de SECCION.',
    perk2Title: '1 Año Gratis de Copiloto IA',
    perk2Desc:
      'Asistente de respuestas 24/7 multilingüe, sugerencias de venta y Content Ops incluidos sin coste durante 12 meses.',
    perk3Title: 'Sin Formularios, Studio Directo',
    perk3Desc:
      'Entra directo a tu Creator Studio. Completa tu KYC 18+ DIDIT, sube 1 avatar + 2 fotos y fija tus tarifas a tu ritmo.',
    moroccoBadge: 'Escudo de Privacidad Doméstico Marruecos (`MA`) preactivado para tu Studio',
    googleCta: 'Continuar con Google (1-Click Studio)',
    orDivider: 'O ACTIVA CON CÓDIGO POR EMAIL (SIN SALIR DE ESTA PESTAÑA)',
    emailPlaceholder: 'creadora@email.com',
    emailLockedHint: 'Este pase personal está reservado para',
    sendCodeCta: 'Enviar Código de 6 Dígitos',
    otpLabel: 'Introduce el código de 6 dígitos enviado a tu correo:',
    otpPlaceholder: '123456',
    verifyOtpCta: 'Verificar y Entrar al Studio',
    changeEmail: 'Usar otro correo',
    signedInTitle: 'Sesión iniciada como',
    enterStudioCta: 'Activar Pase VIP y Entrar al Studio',
    switchAccountCta: 'Cambiar de cuenta',
    statusTitles: {
      claimed: 'Este Pase VIP Ya Fue Activado',
      expired: 'Este Pase VIP Ha Expirado',
      revoked: 'Este Pase VIP Fue Revocado',
      not_found: 'Pase VIP No Encontrado',
    },
    statusDescs: {
      claimed:
        'Si ya activaste esta invitación, inicia sesión para entrar a tu Creator Studio con tus beneficios del 1er año.',
      expired:
        'Los enlaces VIP tienen una validez limitada. Pide uno nuevo o envía tu solicitud rápida abajo.',
      revoked:
        'Este enlace ya no está activo. Escríbenos por WhatsApp (+34 662 907 153) o aplica directamente.',
      not_found:
        'Comprueba el enlace VIP o envía tu solicitud de creadora directamente abajo.',
    },
    applyFallbackCta: 'Aplicar en SECCION',
    loginFallbackCta: 'Entrar a mi Studio',
    errors: {
      email_mismatch: 'Por favor entra con el correo electrónico asignado a este pase VIP.',
      already_claimed: 'Este pase VIP ya fue reclamado.',
      expired: 'Este pase VIP ha expirado.',
      revoked: 'Este pase VIP ha sido revocado.',
      rate_limited: 'Demasiados intentos. Espera un minuto y vuelve a intentarlo.',
    },
    privacyNote: 'La verificación DIDIT 18+ y Content Ops se completan de forma privada dentro del Studio antes de publicar.',
  },
  fr: {
    badge: 'PASS VIP FAST-TRACK FONDATRICE',
    headingPrefix: 'Accès Studio Express pour',
    headingFallback: 'Créatrice Fondatrice',
    subtitle:
      'Vous avez été pré-approuvée par Stefan. Évitez le formulaire et la file d’attente : activez votre Creator Studio en 60 secondes.',
    perk1Title: '90% Net (1re Année)',
    perk1Desc:
      'Gardez 90% de vos revenus nets pendant toute votre 1re année (365 jours). Passe automatiquement à 80% standard dès la 2e année.',
    perk2Title: '1 An d’AI Copilot Offert',
    perk2Desc:
      'Assistant DM multilingue 24/7, relances intelligentes et Content Ops inclus gratuitement pendant 12 mois.',
    perk3Title: 'Zéro Formulaire, Studio Direct',
    perk3Desc:
      'Accédez directement au Studio. Finalisez le KYC 18+ DIDIT, ajoutez 1 avatar + 2 photos et fixez vos tarifs à votre rythme.',
    moroccoBadge: 'Bouclier IP Domestique Maroc (`MA`) pré-armé sur votre Studio',
    googleCta: 'Continuer avec Google (1-Click Studio)',
    orDivider: 'OU ACTIVER PAR CODE EMAIL (DIRECTEMENT ICI)',
    emailPlaceholder: 'creatrice@email.com',
    emailLockedHint: 'Ce pass personnel est réservé à',
    sendCodeCta: 'Envoyer le Code à 6 Chiffres',
    otpLabel: 'Saisissez le code à 6 chiffres reçu par email :',
    otpPlaceholder: '123456',
    verifyOtpCta: 'Vérifier et Ouvrir le Studio',
    changeEmail: 'Utiliser un autre email',
    signedInTitle: 'Connectée avec',
    enterStudioCta: 'Activer le Pass VIP & Ouvrir le Studio',
    switchAccountCta: 'Changer de compte',
    statusTitles: {
      claimed: 'Ce Pass VIP a Déjà Été Activé',
      expired: 'Ce Pass VIP a Expiré',
      revoked: 'Ce Pass VIP a Été Révoqué',
      not_found: 'Pass VIP Introuvable',
    },
    statusDescs: {
      claimed:
        'Si vous avez déjà activé cette invitation, connectez-vous pour retrouver votre Creator Studio et vos avantages Année 1.',
      expired:
        'Ce lien d’invitation a expiré. Demandez un nouveau pass ou postulez ci-dessous.',
      revoked:
        'Ce lien n’est plus actif. Contactez-nous sur WhatsApp (+34 662 907 153) ou postulez directement.',
      not_found:
        'Vérifiez votre lien VIP ou déposez votre candidature ci-dessous.',
    },
    applyFallbackCta: 'Postuler sur SECCION',
    loginFallbackCta: 'Accéder au Studio',
    errors: {
      email_mismatch: 'Veuillez vous connecter avec l’adresse email liée à ce pass VIP.',
      already_claimed: 'Ce pass VIP a déjà été utilisé.',
      expired: 'Ce pass VIP a expiré.',
      revoked: 'Ce pass VIP a été révoqué.',
      rate_limited: 'Trop de tentatives. Patientez une minute puis réessayez.',
    },
    privacyNote: 'La vérification DIDIT 18+ et les réglages Content Ops se font en privé dans le Studio avant mise en ligne.',
  },
};

export default function VipFastTrackClaimClient({
  summary,
  initialError,
  currentUserEmail,
}: VipFastTrackClaimClientProps) {
  const router = useRouter();
  const [locale, setLocale] = useState<EmailLocale>(summary.locale || 'en');
  const t = COPY[locale];

  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(
    initialError ? t.errors[initialError] || initialError : null
  );
  const [signedInEmail, setSignedInEmail] = useState<string | null>(currentUserEmail);

  const recipientLabel =
    summary.creatorName ||
    (summary.socialHandle ? `@${summary.socialHandle}` : t.headingFallback);

  const finalizeClaim = async () => {
    const res = await fetch('/api/v2/creator/vip-claim', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'finalize', code: summary.code }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.ok) {
      throw new Error(t.errors[data.reason] || data.error || 'Could not activate VIP pass.');
    }
    router.push(data.redirectTo || '/studio?vip=welcome');
    router.refresh();
  };

  const handleGoogleOAuth = async () => {
    setErrorMsg(null);
    setBusy('google');
    try {
      const prep = await fetch('/api/v2/creator/vip-claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'prepare_oauth', code: summary.code }),
      });
      const prepData = await prep.json().catch(() => ({}));
      if (!prep.ok || !prepData.ok) {
        throw new Error(t.errors[prepData.reason] || 'Unable to prepare VIP OAuth.');
      }

      const supabase = createClient();
      const callbackUrl = `${window.location.origin}/auth/callback?vip=${encodeURIComponent(
        summary.code
      )}&next=${encodeURIComponent('/studio?vip=welcome')}`;

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: callbackUrl },
      });
      if (error) throw error;
    } catch (err: any) {
      setErrorMsg(err?.message || 'OAuth failed.');
      setBusy(null);
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    const clean = email.trim().toLowerCase();
    if (!clean || !clean.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    setBusy('send_otp');
    try {
      const prep = await fetch('/api/v2/creator/vip-claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'prepare_otp', code: summary.code, email: clean }),
      });
      const prepData = await prep.json().catch(() => ({}));
      if (!prep.ok || !prepData.ok) {
        throw new Error(t.errors[prepData.reason] || 'Could not validate VIP pass email.');
      }

      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOtp({
        email: clean,
        options: {
          shouldCreateUser: true,
          emailRedirectTo: `${window.location.origin}/auth/callback?vip=${encodeURIComponent(
            summary.code
          )}&next=${encodeURIComponent('/studio?vip=welcome')}`,
          data: {
            role: 'creator',
            vip_fast_track: true,
          },
        },
      });
      if (error) throw error;
      setOtpSent(true);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to send verification code.');
    } finally {
      setBusy(null);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    const clean = email.trim().toLowerCase();
    const token = otpCode.replace(/\s+/g, '');
    if (token.length < 6) {
      setErrorMsg('Please enter the 6-digit code from your email.');
      return;
    }

    setBusy('verify_otp');
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.verifyOtp({
        email: clean,
        token,
        type: 'email',
      });
      if (error) throw error;
      await finalizeClaim();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Invalid or expired code. Please try again.');
      setBusy(null);
    }
  };

  const handleExistingSessionActivate = async () => {
    setErrorMsg(null);
    setBusy('existing');
    try {
      await finalizeClaim();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Activation failed.');
      setBusy(null);
    }
  };

  const handleSwitchAccount = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setSignedInEmail(null);
    setErrorMsg(null);
  };

  return (
    <main className="min-h-screen bg-[#06060b] text-white flex flex-col items-center justify-center px-4 py-10 relative overflow-hidden">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(16,185,129,0.14),_transparent_55%),radial-gradient(ellipse_at_bottom_right,_rgba(139,92,246,0.12),_transparent_55%)]" />

      <div className="relative z-10 w-full max-w-2xl">
        {/* Top bar: Brand + Locale switcher */}
        <div className="flex items-center justify-between mb-6">
          <Link href="/" className="text-xl font-black tracking-[0.22em] text-white">
            SECCION
          </Link>
          <div className="flex items-center gap-1 rounded-full bg-white/5 border border-white/10 p-1">
            {(['en', 'es', 'fr'] as EmailLocale[]).map((loc) => (
              <button
                key={loc}
                type="button"
                onClick={() => setLocale(loc)}
                className={`px-3 py-1 rounded-full text-xs font-bold uppercase transition-colors ${
                  locale === loc
                    ? 'bg-white text-black'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                {loc}
              </button>
            ))}
          </div>
        </div>

        {/* Non-active states */}
        {summary.status !== 'active' ? (
          <div className="rounded-3xl bg-[#0d0d16]/95 border border-white/10 p-8 text-center shadow-2xl">
            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              {summary.status === 'claimed' ? (
                <CheckCircle2 className="w-7 h-7 text-emerald-400" />
              ) : summary.status === 'expired' ? (
                <Clock className="w-7 h-7" />
              ) : (
                <AlertTriangle className="w-7 h-7" />
              )}
            </div>
            <h1 className="text-2xl font-black tracking-tight mb-3">
              {t.statusTitles[summary.status] || t.statusTitles.not_found}
            </h1>
            <p className="text-sm text-white/65 max-w-md mx-auto mb-6 leading-relaxed">
              {t.statusDescs[summary.status] || t.statusDescs.not_found}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {summary.status === 'claimed' ? (
                <Link
                  href="/login?next=/studio"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-sm transition"
                >
                  {t.loginFallbackCta}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              ) : (
                <Link
                  href="/become-creator#apply"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white text-black font-bold text-sm hover:bg-white/90 transition"
                >
                  {t.applyFallbackCta}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              )}
            </div>
          </div>
        ) : (
          <div className="rounded-3xl bg-[#0d0d16]/95 border border-emerald-500/30 p-6 sm:p-8 shadow-[0_0_80px_rgba(16,185,129,0.12)]">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[11px] font-bold tracking-widest uppercase mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              {t.badge}
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight mb-2">
              {t.headingPrefix}{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-teal-200 to-violet-300">
                {recipientLabel}
              </span>
            </h1>
            <p className="text-sm text-white/70 leading-relaxed mb-6">{t.subtitle}</p>

            {/* Year-1 Perk Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
              <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-4">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider mb-1.5">
                  <Percent className="w-4 h-4" />
                  {t.perk1Title}
                </div>
                <p className="text-xs text-white/65 leading-relaxed">{t.perk1Desc}</p>
              </div>
              <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-4">
                <div className="flex items-center gap-2 text-violet-300 font-bold text-xs uppercase tracking-wider mb-1.5">
                  <Bot className="w-4 h-4" />
                  {t.perk2Title}
                </div>
                <p className="text-xs text-white/65 leading-relaxed">{t.perk2Desc}</p>
              </div>
              <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-4">
                <div className="flex items-center gap-2 text-amber-300 font-bold text-xs uppercase tracking-wider mb-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  {t.perk3Title}
                </div>
                <p className="text-xs text-white/65 leading-relaxed">{t.perk3Desc}</p>
              </div>
            </div>

            {summary.moroccoShield && (
              <div className="mb-5 rounded-xl bg-indigo-500/10 border border-indigo-400/30 px-4 py-2.5 text-xs text-indigo-200 flex items-center gap-2">
                <Lock className="w-4 h-4 shrink-0 text-indigo-300" />
                <span>{t.moroccoBadge}</span>
              </div>
            )}

            {summary.requiresEmailMatch && summary.maskedEmail && (
              <div className="mb-5 rounded-xl bg-amber-500/10 border border-amber-400/25 px-4 py-2.5 text-xs text-amber-200">
                {t.emailLockedHint}{' '}
                <span className="font-mono font-bold text-white">{summary.maskedEmail}</span>
              </div>
            )}

            {errorMsg && (
              <div className="mb-5 rounded-xl bg-red-500/10 border border-red-500/35 px-4 py-3 text-xs text-red-200 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
                <span>{errorMsg}</span>
              </div>
            )}

            {signedInEmail ? (
              <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/30 p-5 space-y-4">
                <div className="text-sm text-white/80">
                  {t.signedInTitle}{' '}
                  <span className="font-bold text-white">{signedInEmail}</span>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    disabled={busy !== null}
                    onClick={handleExistingSessionActivate}
                    className="flex-1 min-h-[48px] inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-sm transition disabled:opacity-50 cursor-pointer"
                  >
                    {busy === 'existing' ? '...' : t.enterStudioCta}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    disabled={busy !== null}
                    onClick={handleSwitchAccount}
                    className="min-h-[48px] inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-white/80 transition cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    {t.switchAccountCta}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <button
                  type="button"
                  disabled={busy !== null}
                  onClick={handleGoogleOAuth}
                  className="w-full min-h-[50px] inline-flex items-center justify-center gap-3 px-5 py-3.5 rounded-xl bg-white hover:bg-white/90 text-black font-extrabold text-sm transition disabled:opacity-50 cursor-pointer shadow-lg"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      fill="#4285F4"
                      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.14C3.26 21.3 7.31 24 12 24z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.28 14.24c-.24-.72-.38-1.49-.38-2.24s.14-1.52.38-2.24V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.99-3.14z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.99 3.14c.95-2.85 3.6-4.96 6.72-4.96z"
                    />
                  </svg>
                  {busy === 'google' ? '...' : t.googleCta}
                </button>

                <div className="flex items-center gap-3 py-1">
                  <div className="h-px flex-1 bg-white/10" />
                  <span className="text-[10px] font-bold tracking-widest text-white/40 uppercase text-center">
                    {t.orDivider}
                  </span>
                  <div className="h-px flex-1 bg-white/10" />
                </div>

                {!otpSent ? (
                  <form onSubmit={handleSendOtp} className="flex flex-col sm:flex-row gap-2.5">
                    <div className="relative flex-1">
                      <Mail className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder={t.emailPlaceholder}
                        className="w-full min-h-[48px] bg-black/50 border border-white/15 focus:border-emerald-400 rounded-xl pl-10 pr-4 text-sm text-white placeholder:text-white/35 outline-none transition"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={busy !== null}
                      className="min-h-[48px] px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-sm transition disabled:opacity-50 cursor-pointer whitespace-nowrap"
                    >
                      {busy === 'send_otp' ? '...' : t.sendCodeCta}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleVerifyOtp} className="space-y-3 rounded-2xl bg-black/40 border border-emerald-500/25 p-4">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs text-white/80">
                        {t.otpLabel} <strong className="text-emerald-300">{email}</strong>
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setOtpSent(false);
                          setOtpCode('');
                        }}
                        className="text-xs text-white/50 hover:text-white underline cursor-pointer"
                      >
                        {t.changeEmail}
                      </button>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2.5">
                      <div className="relative flex-1">
                        <KeyRound className="w-4 h-4 text-emerald-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          inputMode="numeric"
                          autoComplete="one-time-code"
                          required
                          maxLength={8}
                          value={otpCode}
                          onChange={(e) => setOtpCode(e.target.value)}
                          placeholder={t.otpPlaceholder}
                          className="w-full min-h-[48px] bg-black/60 border border-emerald-500/40 focus:border-emerald-400 rounded-xl pl-10 pr-4 text-base font-mono tracking-[0.25em] text-white placeholder:text-white/25 outline-none"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={busy !== null}
                        className="min-h-[48px] inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-sm transition disabled:opacity-50 cursor-pointer whitespace-nowrap"
                      >
                        {busy === 'verify_otp' ? '...' : t.verifyOtpCta}
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            <p className="mt-5 text-[11px] text-white/45 text-center leading-relaxed">
              {t.privacyNote}
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
