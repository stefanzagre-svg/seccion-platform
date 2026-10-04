export async function sendCreatorWelcomeEmail(params: {
  email: string;
  fullName: string;
  applicationId?: string;
  locale?: string;
}) {
  const apiKey = process.env.RESEND_API_KEY || "process.env.RESEND_API_KEY || """;
  if (!apiKey) return;

  const isEs = params.locale !== "en";
  const name = params.fullName?.trim() || (isEs ? "Creador/a" : "Creator");
  const subject = isEs
    ? "⚡ Bienvenido/a a SECCION — Tu 90% de Ganancias & Próximos Pasos"
    : "⚡ Welcome to SECCION — Your 90% Payout & Next Steps";

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
          .btn { display: inline-block; background: #00FFFF; color: #000000 !0important; font-weight: 700; text-decoration: none; padding: 14px 28px; border-radius: 50px; margin: 12px 0 20px; text-align: center; }
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
                ? "Hemos recibido tu pre-registro como Creador Fundador en SECCION. Tu lugar prioritario y la tasa especial del <b>90% de ganancias netas</b> (sujeto a aprobación de perfil) han quedado registrados."
                : "We received your early application as a Founding Creator on SECCION. Your priority spot and the special <b>90% net payout rate</b> (subject to profile approval) have been logged."
            }
          </p>

          <div class="perk-box">
            <div class="perk-item">💎 <b>${isEs ? "90% Ganancias Netas" : "90% Net Payout"}</b> — ${isEs ? "Para creadores fundadores aprobados en su 1er año" : "For approved founding creators in their 1st year"}</div>
            <div class="perk-item">🤖 <b>${isEs ? "Copiloto IA Propio" : "Custom AI Copilot"}</b> — ${isEs ? "Entrenado con tu voz para atender tus DMs 24/7" : "Trained in your voice to handle DMs 24/7"}</div>
            <div class="perk-item">🛡️ <b>${isEs ? "Bóveda DRM Anti-Piratería" : "DRM Anti-Piracy Vault"}</b> — ${isEs ? "Protección de contenido contra capturas y filtraciones" : "Zero leaks and screenshot protection"}</div>
          </div>

          <p>
            ${
              isEs
                ? "¿Quieres acelerar tu verificación de perfil y activar tu cuenta de inmediato? Escríbenos directamente por WhatsApp con nuestro equipo de creadores:"
                : "Want to fast-track your profile approval and activate your creator account immediately? Chat directly with our Creator Onboarding Team on WhatsApp:"
            }
          </p>

          <p style="text-align: center;">
            <a href="${directWhatsAppLink}" class="btn-wa">
              💬 ${isEs ? "Verificar en WhatsApp (+34 662 907 153)" : "Verify on WhatsApp (+34 662 907 153)"}
            </a>
          </p>

          <p style="font-size: 13px; color: #a1a1aa;">
            ${
              isEs
                ? "También puedes responder directamente a este correo (creator@seccion.ai) con tus dudas o enlaces adicionales."
                : "You can also reply directly to this email (creator@seccion.ai) with any questions or extra links."
            }
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
      // Fallback: if domain seccion.ai is still verifying in Resend DNS, try onboard address
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
