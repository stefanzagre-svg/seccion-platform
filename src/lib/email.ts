export async function sendCreatorWelcomeEmail(params: {
  email: string;
  fullName: string;
  applicationId?: string;
  locale?: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return;

  const isEs = params.locale !== "en";
  const name = params.fullName?.trim() || (isEs ? "Creador/a" : "Creator");
  const subject = isEs
    ? "⚡ Bienvenido/a a SECCION — Activa tu Cuenta y 90% de Ganancias"
    : "⚡ Welcome to SECCION — Activate Your Account & 90% Payout";

  const setupUrl = `https://seccion.ai/onboarding?role=creator&email=${encodeURIComponent(params.email)}&name=${encodeURIComponent(name)}`;

  const directWhatsAppLink = `https://wa.me/34662907153?text=${encodeURIComponent(
    isEs
      ? `Hola Stefan, soy ${name} (${params.email}). Acabo de registrarme en SECCION para el 90% de ganancias.`
      : `Hi Stefan, I'm ${name} (${params.email}). I just registered on SECCION for the 90% payout rate.`
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
          <h1>${isEs ? `¡Hola ${name}!` : `Hi ${name}!`}</h1>
          <p>
            ${
              isEs
                ? "Hemos recibido tu registro como Creador Fundador en SECCION. Tu lugar prioritario y la tasa especial del <b>90% de ganancias netas + 1 año de Copiloto IA gratis</b> han quedado reservados para tu correo."
                : "We received your application as a Founding Creator on SECCION. Your priority spot and the special <b>90% net payout rate + 1-Year Free AI Copilot</b> are reserved for your email."
            }
          </p>

          <p style="text-align: center;">
            <a href="${setupUrl}" class="btn">
              ⚡ ${isEs ? "Activar Mi Cuenta y Crear Contraseña →" : "Activate My Account & Set Password →"}
            </a>
          </p>

          <div class="perk-box">
            <div class="perk-item">💎 <b>${isEs ? "90% Ganancias Netas" : "90% Net Payout"}</b> — ${isEs ? "Para creadores fundadores aprobados en su 1er año" : "For approved founding creators in their 1st year"}</div>
            <div class="perk-item">🤖 <b>${isEs ? "Copiloto IA Propio" : "Custom AI Copilot"}</b> — ${isEs ? "Entrenado con tu voz para atender tus DMs 24/7" : "Trained in your voice to handle DMs 24/7"}</div>
            <div class="perk-item">🛡️ <b>${isEs ? "Bóveda DRM Anti-Piratería" : "DRM Anti-Piracy Vault"}</b> — ${isEs ? "Protección de contenido contra capturas y filtraciones" : "Zero leaks and screenshot protection"}</div>
          </div>

          <p>
            ${
              isEs
                ? "¿Necesitas ayuda personalizada o quieres confirmar tus enlaces al instante? Escríbenos directamente por WhatsApp:"
                : "Need personal assistance or want to fast-track your link verification? Message our Creator Concierge on WhatsApp:"
            }
          </p>

          <p style="text-align: center;">
            <a href="${directWhatsAppLink}" class="btn-wa">
              💬 ${isEs ? "Concierge en WhatsApp (+34 662 907 153)" : "WhatsApp Concierge (+34 662 907 153)"}
            </a>
          </p>

          <div class="footer">
            SECCION AI CONCEPT SL · Madrid / Barcelona, España<br>
            <a href="https://seccion.ai/privacy" style="color: #a1a1aa;">${isEs ? "Política de Privacidad" : "Privacy Policy"}</a> · 
            <a href="https://seccion.ai" style="color: #a1a1aa;">seccion.ai</a>
          </div>
        </div>
      </body>
    </html>
  `;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "SECCION Creators <creator@seccion.ai>",
        reply_to: "creator@seccion.ai",
        to: [params.email],
        subject,
        html,
      }),
    });

    if (!res.ok) {
      const err = await res.text().catch(() => "");
      console.error("Resend send email error:", res.status, err);
      if (res.status === 403 || err.includes("domain") || err.includes("verification")) {
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "SECCION <onboarding@resend.dev>",
            reply_to: "creator@seccion.ai",
            to: [params.email],
            subject: `[SECCION] ${subject}`,
            html,
          }),
        }).catch(() => {});
      }
    }
  } catch (err) {
    console.error("Failed to send creator welcome email:", err);
  }
}

export async function sendCreatorApprovalEmail(params: {
  email: string;
  fullName: string;
  locale?: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return;

  const isEs = params.locale !== "en";
  const name = params.fullName?.trim() || (isEs ? "Creador/a" : "Creator");
  const subject = isEs
    ? "✅ ¡Aprobada! Tu Creator Studio en SECCION está listo (90% Split)"
    : "✅ Approved! Your SECCION Creator Studio is Ready (90% Split)";

  const setupUrl = `https://seccion.ai/onboarding?role=creator&email=${encodeURIComponent(params.email)}&name=${encodeURIComponent(name)}`;
  const loginUrl = `https://seccion.ai/login?email=${encodeURIComponent(params.email)}`;

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
          <h1>${isEs ? `¡Felicidades ${name}! Tu perfil ha sido aprobado 🎉` : `Congratulations ${name}! Your profile is approved 🎉`}</h1>
          <p>
            ${
              isEs
                ? "Tu plaza oficial de <b>Creador Fundador (90% de comisión neta + 1 Año de Copiloto IA Gratis)</b> ya está activa. Haz clic en el botón de abajo para elegir tu contraseña y entrar directamente a tu Creator Studio:"
                : "Your official <b>Founding Creator spot (90% net split + 1-Year Free AI Copilot)</b> is now active. Click below to set your password and enter your Creator Studio directly:"
            }
          </p>

          <p style="text-align: center;">
            <a href="${setupUrl}" class="btn">
              🚀 ${isEs ? "Activar Cuenta y Entrar al Creator Studio →" : "Activate Account & Enter Creator Studio →"}
            </a>
          </p>

          <p style="text-align: center;">
            <a href="${loginUrl}" class="btn-sec">
              🔑 ${isEs ? "Ir al Login Directo de Creadores" : "Go to Direct Creator Login"}
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

  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "SECCION Creators <creator@seccion.ai>",
        reply_to: "creator@seccion.ai",
        to: [params.email],
        subject,
        html,
      }),
    });
  } catch (err) {
    console.error("Failed to send creator approval email:", err);
  }
}
