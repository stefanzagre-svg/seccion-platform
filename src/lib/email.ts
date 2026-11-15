export type EmailLocale = "en" | "es" | "fr";

export function normalizeEmailLocale(
  locale?: string | null,
  acceptLanguage?: string | null
): EmailLocale {
  const normalized = (locale || "").toLowerCase().trim();
  if (normalized.startsWith("fr")) return "fr";
  if (normalized.startsWith("es")) return "es";
  if (normalized.startsWith("en")) return "en";

  const header = (acceptLanguage || "").toLowerCase();
  if (header.includes("fr")) return "fr";
  if (header.includes("es")) return "es";
  return "en";
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

async function sendResendEmail(params: {
  apiKey: string;
  to: string;
  subject: string;
  html: string;
  logContext: string;
}) {
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${params.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "SECCION Creators <creator@seccion.ai>",
        reply_to: "creator@seccion.ai",
        to: [params.to],
        subject: params.subject,
        html: params.html,
      }),
    });

    if (!res.ok) {
      const err = await res.text().catch(() => "");
      console.error(`[Resend:${params.logContext}] send error:`, res.status, err);
      if (res.status === 403 || err.includes("domain") || err.includes("verification")) {
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${params.apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "SECCION <onboarding@resend.dev>",
            reply_to: "creator@seccion.ai",
            to: [params.to],
            subject: `[SECCION] ${params.subject}`,
            html: params.html,
          }),
        }).catch(() => {});
      }
    }
  } catch (err) {
    console.error(`[Resend:${params.logContext}] failed:`, err);
  }
}

const WELCOME_COPY: Record<
  EmailLocale,
  {
    fallbackName: string;
    subject: string;
    waMessage: (name: string, email: string) => string;
    greeting: (safeName: string) => string;
    introHtml: string;
    frictionHtml: string;
    waButton: string;
    perk1Title: string;
    perk1Desc: string;
    perk2Title: string;
    perk2Desc: string;
    perk3Title: string;
    perk3Desc: string;
    statusCta: string;
    privacyLabel: string;
  }
> = {
  en: {
    fallbackName: "Creator",
    subject: "⚡ Application Received on SECCION — Your 90% Founding Spot is Reserved",
    waMessage: (name, email) =>
      `Hi Stefan, I'm ${name} (${email}). I just applied for Founding Creator access (90% Split) on SECCION.`,
    greeting: (safeName) => `Hi ${safeName}!`,
    introHtml:
      "We received your application as a Founding Creator on SECCION. Your priority spot and the special <b>90% net payout rate + 1-Year Free AI Copilot</b> are reserved for your email while our team verifies your profile.",
    frictionHtml:
      "<b>Zero password friction:</b> As soon as your application is approved, you will receive a 1-click direct access link (and 6-digit code) to enter your Creator Studio immediately.",
    waButton: "Fast-Track Approval on WhatsApp (+34 662 907 153)",
    perk1Title: "90% Net Payout",
    perk1Desc: "For approved founding creators in their 1st year",
    perk2Title: "Custom AI Copilot",
    perk2Desc: "Trained in your voice to handle DMs 24/7",
    perk3Title: "DRM Anti-Piracy Vault",
    perk3Desc: "Zero leaks and screenshot protection",
    statusCta: "Check Application Status / Creator Login →",
    privacyLabel: "Privacy Policy",
  },
  es: {
    fallbackName: "Creador/a",
    subject: "⚡ Solicitud Recibida en SECCION — Tu Plaza del 90% Está Reservada",
    waMessage: (name, email) =>
      `Hola Stefan, soy ${name} (${email}). Acabo de solicitar mi acceso como Creador Fundador (90% Split) en SECCION.`,
    greeting: (safeName) => `¡Hola ${safeName}!`,
    introHtml:
      "Hemos recibido tu solicitud como Creador Fundador en SECCION. Tu lugar prioritario y la tasa especial del <b>90% de ganancias netas + 1 año de Copiloto IA gratis</b> han quedado reservados para tu correo mientras nuestro equipo verifica tu perfil.",
    frictionHtml:
      "<b>Sin contraseñas complicadas:</b> En cuanto tu solicitud sea aprobada, recibirás un enlace de acceso directo de 1 clic (y código de 6 dígitos) para entrar directamente a tu Creator Studio.",
    waButton: "Acelerar Aprobación por WhatsApp (+34 662 907 153)",
    perk1Title: "90% Ganancias Netas",
    perk1Desc: "Para creadores fundadores aprobados en su 1er año",
    perk2Title: "Copiloto IA Propio",
    perk2Desc: "Entrenado con tu voz para atender tus DMs 24/7",
    perk3Title: "Bóveda DRM Anti-Piratería",
    perk3Desc: "Protección de contenido contra capturas y filtraciones",
    statusCta: "Consultar Estado / Acceso Creador →",
    privacyLabel: "Política de Privacidad",
  },
  fr: {
    fallbackName: "Créateur / Créatrice",
    subject: "⚡ Candidature Reçue sur SECCION — Votre Place à 90% est Réservée",
    waMessage: (name, email) =>
      `Bonjour Stefan, je suis ${name} (${email}). Je viens de postuler pour l'accès Créateur Fondateur (90% Split) sur SECCION.`,
    greeting: (safeName) => `Bonjour ${safeName} !`,
    introHtml:
      "Nous avons bien reçu votre candidature de Créateur Fondateur sur SECCION. Votre place prioritaire ainsi que le taux spécial de <b>90% de revenus nets + 1 an de Copilote IA offert</b> sont réservés pour votre e-mail pendant la vérification de votre profil.",
    frictionHtml:
      "<b>Zéro mot de passe complexe :</b> Dès votre approbation, vous recevrez un lien d'accès direct en 1 clic (et un code à 6 chiffres) pour accéder immédiatement à votre Creator Studio.",
    waButton: "Accélérer l'Approbation sur WhatsApp (+34 662 907 153)",
    perk1Title: "90% de Revenus Nets",
    perk1Desc: "Pour les créateurs fondateurs approuvés durant leur 1re année",
    perk2Title: "Copilote IA Sur Mesure",
    perk2Desc: "Entraîné avec votre style pour gérer vos DM 24/7",
    perk3Title: "Coffre-Fort DRM Anti-Piratage",
    perk3Desc: "Protection avancée contre les captures et fuites",
    statusCta: "Vérifier le Statut / Connexion Créateur →",
    privacyLabel: "Politique de Confidentialité",
  },
};

const APPROVAL_COPY: Record<
  EmailLocale,
  {
    fallbackName: string;
    subject: string;
    headline: (safeName: string) => string;
    introHtml: string;
    primaryCta: string;
    secondaryCta: string;
  }
> = {
  en: {
    fallbackName: "Creator",
    subject: "✅ Approved! Your SECCION Creator Studio is Ready (1-Click Access)",
    headline: (safeName) => `Congratulations ${safeName}! Your profile is approved 🎉`,
    introHtml:
      "Your official <b>Founding Creator spot (90% net split + 1-Year Free AI Copilot)</b> is now active and your account has been created automatically. Click below to enter your Creator Studio directly with zero password required:",
    primaryCta: "Enter My Creator Studio (1-Click) →",
    secondaryCta: "Sign In with 6-Digit Email Code",
  },
  es: {
    fallbackName: "Creador/a",
    subject: "✅ ¡Aprobada! Tu Creator Studio en SECCION está listo (Acceso 1-Clic)",
    headline: (safeName) => `¡Felicidades ${safeName}! Tu perfil ha sido aprobado 🎉`,
    introHtml:
      "Tu plaza oficial de <b>Creador Fundador (90% de comisión neta + 1 Año de Copiloto IA Gratis)</b> ya está activa y tu cuenta ha sido creada automáticamente. Haz clic abajo para entrar directamente a tu Creator Studio sin necesidad de crear contraseña:",
    primaryCta: "Entrar a mi Creator Studio (1-Clic) →",
    secondaryCta: "Entrar con Código de 6 Dígitos por Correo",
  },
  fr: {
    fallbackName: "Créateur / Créatrice",
    subject: "✅ Approuvé ! Votre Creator Studio SECCION est Prêt (Accès 1-Clic)",
    headline: (safeName) => `Félicitations ${safeName} ! Votre profil est approuvé 🎉`,
    introHtml:
      "Votre place officielle de <b>Créateur Fondateur (90% de revenus nets + 1 An de Copilote IA Offert)</b> est désormais active et votre compte a été créé automatiquement. Cliquez ci-dessous pour entrer directement dans votre Creator Studio sans mot de passe requis :",
    primaryCta: "Entrer dans mon Creator Studio (1-Clic) →",
    secondaryCta: "Se Connecter avec un Code à 6 Chiffres par E-mail",
  },
};

export async function sendCreatorWelcomeEmail(params: {
  email: string;
  fullName: string;
  applicationId?: string;
  locale?: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return;

  const locale = normalizeEmailLocale(params.locale);
  const copy = WELCOME_COPY[locale];
  const rawName = params.fullName?.trim() || copy.fallbackName;
  const safeName = escapeHtml(rawName);
  const statusUrl = `https://seccion.ai/login?email=${encodeURIComponent(params.email)}`;
  const directWhatsAppLink = `https://wa.me/34662907153?text=${encodeURIComponent(
    copy.waMessage(rawName, params.email)
  )}`;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #050505; color: #FFFFFF; margin: 0; padding: 24px; }
          .container { max-width: 560px; margin: 0 auto; background: #0d0d12; border: 1px solid rgba(255,255,255,0.1); border-radius: 20px; padding: 32px; box-sizing: border-box; }
          .logo { color: #00FFFF; font-size: 24px; font-weight: 900; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 24px; }
          h1 { font-size: 22px; line-height: 1.3; color: #FFFFFF; margin-top: 0; }
          p { font-size: 15px; line-height: 1.6; color: #d4d4d8; }
          .perk-box { background: rgba(0, 255, 255, 0.05); border: 1px solid rgba(0, 255, 255, 0.2); border-radius: 12px; padding: 16px; margin: 24px 0; }
          .perk-item { font-size: 14px; margin: 8px 0; color: #f4f4f5; }
          .btn { display: inline-block; background: #00FFFF; color: #000000 !important; font-weight: 800; text-decoration: none; padding: 14px 28px; border-radius: 50px; margin: 12px 0; text-align: center; font-size: 14px; }
          .btn-wa { display: inline-block; background: #25D366; color: #FFFFFF !important; font-weight: 700; text-decoration: none; padding: 12px 24px; border-radius: 50px; margin: 8px 0; font-size: 14px; }
          .footer { margin-top: 32px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.1); font-size: 12px; color: #71717a; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo">SECCION</div>
          <h1>${copy.greeting(safeName)}</h1>
          <p>${copy.introHtml}</p>
          <p>${copy.frictionHtml}</p>

          <p style="text-align: center;">
            <a href="${directWhatsAppLink}" class="btn-wa">
              💬 ${copy.waButton}
            </a>
          </p>

          <div class="perk-box">
            <div class="perk-item">💎 <b>${copy.perk1Title}</b> — ${copy.perk1Desc}</div>
            <div class="perk-item">🤖 <b>${copy.perk2Title}</b> — ${copy.perk2Desc}</div>
            <div class="perk-item">🛡️ <b>${copy.perk3Title}</b> — ${copy.perk3Desc}</div>
          </div>

          <p style="text-align: center;">
            <a href="${statusUrl}" class="btn">
              ⚡ ${copy.statusCta}
            </a>
          </p>

          <div class="footer">
            SECCION AI CONCEPT SL · Madrid / Barcelona, España<br>
            <a href="https://seccion.ai/privacy" style="color: #a1a1aa;">${copy.privacyLabel}</a> · 
            <a href="https://seccion.ai" style="color: #a1a1aa;">seccion.ai</a>
          </div>
        </div>
      </body>
    </html>
  `;

  await sendResendEmail({
    apiKey,
    to: params.email,
    subject: copy.subject,
    html,
    logContext: "welcome",
  });
}

export async function sendCreatorApprovalEmail(params: {
  email: string;
  fullName: string;
  locale?: string;
  magicLinkUrl?: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return;

  const locale = normalizeEmailLocale(params.locale);
  const copy = APPROVAL_COPY[locale];
  const rawName = params.fullName?.trim() || copy.fallbackName;
  const safeName = escapeHtml(rawName);
  const loginUrl = `https://seccion.ai/login?email=${encodeURIComponent(params.email)}&approved=true`;
  const primaryAccessUrl = params.magicLinkUrl || loginUrl;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #050505; color: #FFFFFF; margin: 0; padding: 24px; }
          .container { max-width: 560px; margin: 0 auto; background: #0d0d12; border: 1px solid rgba(0,255,255,0.25); border-radius: 20px; padding: 32px; box-sizing: border-box; }
          .logo { color: #00FFFF; font-size: 24px; font-weight: 900; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 24px; }
          h1 { font-size: 22px; line-height: 1.3; color: #FFFFFF; margin-top: 0; }
          p { font-size: 15px; line-height: 1.6; color: #d4d4d8; }
          .btn { display: inline-block; background: #00FFFF; color: #000000 !important; font-weight: 800; text-decoration: none; padding: 14px 28px; border-radius: 50px; margin: 12px 0; text-align: center; font-size: 14px; }
          .btn-sec { display: inline-block; background: rgba(255,255,255,0.08); color: #FFFFFF !important; font-weight: 700; text-decoration: none; padding: 11px 22px; border-radius: 50px; margin: 6px 0; font-size: 13px; border: 1px solid rgba(255,255,255,0.15); }
          .footer { margin-top: 32px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.1); font-size: 12px; color: #71717a; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo">SECCION</div>
          <h1>${copy.headline(safeName)}</h1>
          <p>${copy.introHtml}</p>

          <p style="text-align: center;">
            <a href="${primaryAccessUrl}" class="btn">
              🚀 ${copy.primaryCta}
            </a>
          </p>

          <p style="text-align: center;">
            <a href="${loginUrl}" class="btn-sec">
              🔑 ${copy.secondaryCta}
            </a>
          </p>

          <div class="footer">
            SECCION AI CONCEPT SL · Madrid / Barcelona, España<br>
            <a href="https://seccion.ai" style="color: #a1a1aa;">seccion.ai</a>
          </div>
        </div>
      </body>
    </html>
  `;

  await sendResendEmail({
    apiKey,
    to: params.email,
    subject: copy.subject,
    html,
    logContext: "approval",
  });
}

const VIP_FAST_TRACK_COPY: Record<
  EmailLocale,
  {
    fallbackName: string;
    subject: string;
    headline: (safeName: string) => string;
    introHtml: string;
    perks: [string, string, string];
    cta: string;
    footnote: string;
  }
> = {
  en: {
    fallbackName: "Creator",
    subject: "⚡ Personal VIP Fast-Track to SECCION (90% Year-1 Payout + 1Y AI Free)",
    headline: (safeName) => `${safeName}, your VIP Fast-Track Studio Pass is reserved ⚡`,
    introHtml:
      "You have been personally vetted for immediate Founding Creator access on <b>SECCION</b> — no application form, no approval queue, and direct Studio onboarding in 60 seconds.",
    perks: [
      "90% Net Payout for your 1st year (80% standard rate thereafter)",
      "1 Year Free AI Copilot & Content Ops automated assistant",
      "Instant Creator Studio access — upload 1 avatar + 2 teasers & pass 18+ KYC to go live",
    ],
    cta: "Claim VIP Studio Pass →",
    footnote: "Personal invite link · single-use & expires automatically.",
  },
  es: {
    fallbackName: "Creador/a",
    subject: "⚡ Pase VIP Fast-Track Personal en SECCION (90% 1er Año + 1 Año IA Gratis)",
    headline: (safeName) => `${safeName}, tu Pase VIP Fast-Track al Studio está reservado ⚡`,
    introHtml:
      "Has sido validada directamente como Creadora Fundadora en <b>SECCION</b> — sin formulario de solicitud, sin cola de aprobación y entrada directa a tu Creator Studio en 60 segundos.",
    perks: [
      "90% de ganancia neta durante tu 1er año (80% tarifa estándar después)",
      "1 Año Gratis de Copiloto IA & Content Ops automatizado",
      "Acceso inmediato al Creator Studio — sube 1 avatar + 2 fotos y completa KYC 18+ para salir en vivo",
    ],
    cta: "Activar mi Pase VIP Studio →",
    footnote: "Enlace personal · de un solo uso con expiración automática.",
  },
  fr: {
    fallbackName: "Créatrice",
    subject: "⚡ Pass VIP Fast-Track Personnel SECCION (90% 1re Année + 1 An IA Offert)",
    headline: (safeName) => `${safeName}, votre Pass VIP Fast-Track Studio est réservé ⚡`,
    introHtml:
      "Vous avez été sélectionnée directement comme Créatrice Fondatrice sur <b>SECCION</b> — sans formulaire de candidature, sans file d'attente, avec accès direct au Creator Studio en 60 secondes.",
    perks: [
      "90% de revenus nets pendant votre 1re année (80% tarif standard ensuite)",
      "1 An Offert d'AI Copilot & Content Ops automatisé",
      "Accès immédiat au Creator Studio — ajoutez 1 avatar + 2 visuels & KYC 18+ pour passer en ligne",
    ],
    cta: "Activer mon Pass VIP Studio →",
    footnote: "Invitation personnelle · usage unique avec expiration automatique.",
  },
};

export async function sendVipFastTrackInviteEmail(params: {
  email: string;
  creatorName?: string | null;
  socialHandle?: string | null;
  locale?: string;
  inviteUrl: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return;

  const locale = normalizeEmailLocale(params.locale);
  const copy = VIP_FAST_TRACK_COPY[locale];
  const rawName =
    params.creatorName?.trim() ||
    (params.socialHandle ? `@${params.socialHandle.replace(/^@+/, "")}` : copy.fallbackName);
  const safeName = escapeHtml(rawName);
  const safeUrl = escapeHtml(params.inviteUrl);

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #050505; color: #FFFFFF; margin: 0; padding: 24px; }
          .container { max-width: 560px; margin: 0 auto; background: #0d0d12; border: 1px solid rgba(0,255,255,0.28); border-radius: 20px; padding: 32px; box-sizing: border-box; }
          .logo { color: #00FFFF; font-size: 24px; font-weight: 900; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 24px; }
          h1 { font-size: 22px; line-height: 1.3; color: #FFFFFF; margin-top: 0; }
          p { font-size: 15px; line-height: 1.6; color: #d4d4d8; }
          .perk-box { background: rgba(0, 255, 255, 0.05); border: 1px solid rgba(0, 255, 255, 0.22); border-radius: 12px; padding: 16px; margin: 20px 0; }
          .perk-item { font-size: 14px; margin: 8px 0; color: #f4f4f5; }
          .btn { display: inline-block; background: #00FFFF; color: #000000 !important; font-weight: 800; text-decoration: none; padding: 14px 28px; border-radius: 50px; margin: 14px 0; text-align: center; font-size: 14px; }
          .footer { margin-top: 28px; padding-top: 18px; border-top: 1px solid rgba(255,255,255,0.1); font-size: 12px; color: #71717a; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo">SECCION</div>
          <h1>${copy.headline(safeName)}</h1>
          <p>${copy.introHtml}</p>
          <div class="perk-box">
            <div class="perk-item">💎 ${escapeHtml(copy.perks[0])}</div>
            <div class="perk-item">🤖 ${escapeHtml(copy.perks[1])}</div>
            <div class="perk-item">🚀 ${escapeHtml(copy.perks[2])}</div>
          </div>
          <p style="text-align: center;">
            <a href="${safeUrl}" class="btn">${copy.cta}</a>
          </p>
          <p style="font-size: 12px; color: #a1a1aa; text-align: center;">${copy.footnote}</p>
          <div class="footer">
            SECCION AI CONCEPT SL · Madrid / Barcelona, España<br>
            <a href="https://seccion.ai" style="color: #a1a1aa;">seccion.ai</a>
          </div>
        </div>
      </body>
    </html>
  `;

  await sendResendEmail({
    apiKey,
    to: params.email,
    subject: copy.subject,
    html,
    logContext: "vip-invite",
  });
}
