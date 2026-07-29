"use client";

import PublicFooter from "@/components/PublicFooter";
import React from "react";
import Link from "next/link";
import PublicNavbar from "@/components/PublicNavbar";
import { useTranslation } from "@/context/LanguageContext";
import { ArrowLeft, AlertTriangle, Scale, UserCheck, MessageCircle, Heart, CreditCard, ShieldAlert } from "lucide-react";

// Double bezel card
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

export default function RulesPage() {
  const { locale } = useTranslation();
  return (
    <div className="w-full min-h-screen text-[#e2e2e2] overflow-x-hidden font-sans bg-transparent relative flex flex-col justify-between">
      <title>{locale === "es" ? "Reglas" : "Rules"} | SECCION</title>
      
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
      <PublicNavbar />

      {/* Main Content Area */}
      <div className="relative z-10 pt-36 px-6 md:px-[84px] max-w-[840px] mx-auto w-full flex-grow">
        
        {/* Back Link */}
        <Link href="/" className="inline-flex items-center gap-2 text-xs font-mono font-bold text-white/40 hover:text-[#00fbfb] transition mb-8 group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>{locale === "es" ? "Volver al Inicio" : "Back to Home"}</span>
        </Link>

        {/* Title */}
        <div className="text-left space-y-3 mb-12">
          <h1 className="font-display text-4xl md:text-5xl font-black text-white tracking-tight uppercase leading-none font-['Outfit']">
            {locale === "es" ? "Reglas de la Comunidad" : "Community Rules"}
          </h1>
          <p className="text-xs sm:text-sm text-[#b9cac9] max-w-xl">
            {locale === "es" ? "Directrices para garantizar una comunidad segura, respetuosa y auténtica en SECCION." : "Guidelines ensuring a safe, respectful, and authentic community on SECCION."}
          </p>
          <div className="p-3 bg-[#ffabf3]/5 border border-[#ffabf3]/20 rounded-xl text-left text-[10px] text-[#ffabf3]">
            💡 **{locale === "es" ? "ESTÁNDARES LEGALES Y MONETIZACIÓN" : "LEGAL STANDARDS & MONETIZATION"}**: {locale === "es" ? "Términos, directrices legales y herramientas de monetización para creadores en SECCION." : "Terms, legal guidelines, and monetization tools for creators on SECCION."} <Link href="/creator-hub" className="underline font-bold">[{locale === "es" ? "Centro de Creadores" : "Creator Hub"}]</Link>
          </div>
        </div>

        <DoubleBezelCard>
          <div className="space-y-10 text-left text-xs font-medium leading-relaxed text-[#b9cac9] font-sans">
            
            {/* Section 1: Prohibited content & behaviors */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-white uppercase font-mono text-sm font-bold">
                <ShieldAlert className="w-5 h-5 text-[#00fbfb]" />
                <h3>{locale === "es" ? "1. Contenido y Conductas Prohibidas" : "1. Prohibited Content & Behaviors"}</h3>
              </div>
              <div className="p-4 bg-white/[0.02] border-l-2 border-[#00fbfb] rounded-r-xl space-y-1">
                <span className="text-[9px] font-mono font-bold text-[#00fbfb] uppercase tracking-wider block">{locale === "es" ? "🔮 Traducción Mágica (TL;DR)" : "🔮 Magic Translation (TL;DR)"}</span>
                <p className="text-[10.5px] italic text-[#b9cac9]">
                  {locale === "es" ? "El respeto es absoluto. Prohibimos contenido explícito no consensual (sin filtraciones, sin stealthing, sin cyberflashing), discursos de odio, acoso, estafas y pseudoperfiles (cuentas falsas o bots). Mantén el vibe limpio y consensual." : "Respect is absolute. We ban non-consensual explicit content (no leaks, no stealthing, no cyberflashing), hate speech, bullying, scams, and pseudo-profiles (fake/bot accounts). Keep the vibe clean and consensual."}
                </p>
              </div>
              <div className="space-y-2">
                <span className="text-[9px] font-mono text-white/30 uppercase font-bold block">{locale === "es" ? "⚖️ Términos Legales" : "⚖️ Legal Terms"}</span>
                <p>
                  {locale === "es" ? "Los siguientes tipos de contenido y conductas están estrictamente prohibidos en la Plataforma:" : "The following content types and behaviors are strictly prohibited on the Platform:"}
                </p>
                <ul className="list-disc pl-4 space-y-1">
                  <li>{locale === "es" ? "**Material Explícito No Consensual**: Subir o distribuir imágenes, videos o audios explícitos sin el consentimiento documentado de todos los participantes está estrictamente prohibido (incluyendo 'cyberflashing', retiro de condón sin consentimiento ['stealthing'] o redistribución no autorizada de contenido personal)." : "**Non-Consensual Explicit Material**: Uploading or distributing explicit images, videos, or audio without the documented consent of all participants is strictly banned (including \"cyberflashing,\" condom removal without consent [\"stealthing\"], or unauthorized redistribution of personal media)."}</li>
                  <li>{locale === "es" ? "**Explotación de Menores**: La Plataforma mantiene tolerancia cero ante cualquier contenido que represente, solicite o involucre a menores. Dicho contenido será eliminado de inmediato y se enviarán los datos a las autoridades policiales y al NCMEC." : "**Minor Exploitation**: The Platform maintains zero tolerance for any content depicting, soliciting, or involving minors. Any such content will be removed immediately, and details will be forwarded to law enforcement and the NCMEC."}</li>
                  <li>{locale === "es" ? "**Discurso de Odio y Acoso**: El contenido que muestre insultos, estereotipos dañinos, misgendering, acoso dirigido o ideologías de grupos de odio resultará en sanciones inmediatas o el bloqueo permanente de la cuenta." : "**Hate Speech & Harassment**: Content depicting slurs, harmful stereotypes, misgendering, targeted harassment, or hate group ideologies will result in immediate strikes or account bans."}</li>
                  <li>{locale === "es" ? "**Prácticas Engañosas y Estafas**: Están prohibidas las estafas financieras, publicidad no autorizada y la operación de cuentas automatizadas o 'pseudoperfiles' no etiquetados. Toda cuenta automatizada debe estar claramente identificada." : "**Deceptive Practices & Scams**: Financial scams, unauthorized advertising, and the operation of unlabelled automated or \"pseudo-profiles\" are prohibited. Any automated accounts must be clearly marked."}</li>
                </ul>
              </div>
            </div>

            {/* Section 2: Subscriptions, Cancellations & Refunds */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-white uppercase font-mono text-sm font-bold">
                <CreditCard className="w-5 h-5 text-[#ffabf3]" />
                <h3>{locale === "es" ? "2. Suscripciones, Cancelaciones y Reembolsos" : "2. Subscriptions, Cancellations, & Refunds"}</h3>
              </div>
              <div className="p-4 bg-white/[0.02] border-l-2 border-[#ffabf3] rounded-r-xl space-y-1">
                <span className="text-[9px] font-mono font-bold text-[#ffabf3] uppercase tracking-wider block">{locale === "es" ? "🔮 Traducción Mágica (TL;DR)" : "🔮 Magic Translation (TL;DR)"}</span>
                <p className="text-[10.5px] italic text-[#b9cac9]">
                  {locale === "es" ? "Las suscripciones se renuevan automáticamente, pero puedes cancelar en cualquier momento con una ruta sencilla de dos clics (sin trampas ocultas). Enviamos recordatorios antes de renovar. Bajo las leyes de la UE/RU, tienes un derecho de desistimiento de 14 días en nuevas compras, y se aplica una ventana de 3 días en ciertos estados de EE. UU." : "Subscriptions auto-renew, but you can cancel anytime with a simple two-click path (no hidden traps). We send reminders before renewing. Under EU/UK law, you have a 14-day right to withdraw from a new purchase, and a 3-day window applies in certain US states."}
                </p>
              </div>
              <div className="space-y-2">
                <span className="text-[9px] font-mono text-white/30 uppercase font-bold block">{locale === "es" ? "⚖️ Términos Legales" : "⚖️ Legal Terms"}</span>
                <p>
                  {locale === "es" ? "En cumplimiento con la UK DMCCA 2024 y las normativas de protección al consumidor de la UE:" : "In compliance with the UK DMCCA 2024 and EU consumer protection regulations:"}
                </p>
                <ul className="list-disc pl-4 space-y-1">
                  <li>{locale === "es" ? "**Renovación Automática**: Las suscripciones se renuevan automáticamente al final de cada ciclo de facturación a menos que se cancelen. La Plataforma enviará una notificación clara antes de realizar el cobro." : "**Auto-Renewal**: Subscriptions automatically renew at the end of each billing cycle unless cancelled. The Platform will provide a clear renewal notification prior to taking payment."}</li>
                  <li>{locale === "es" ? "**Ruta de Cancelación**: Los usuarios pueden cancelar sus suscripciones en cualquier momento a través de una ruta visible y sencilla de dos clics en la Configuración de su Cuenta. El acceso al contenido de pago se mantiene activo hasta el final del ciclo de facturación actual." : "**Cancellation Path**: Users can cancel subscriptions at any time via a prominent, simple, two-click path in their Account Settings. Access to paid content remains active until the end of the current billing cycle."}</li>
                  <li>{locale === "es" ? "**Derecho de Desistimiento (UE/RU)**: Los usuarios residentes en la Unión Europea o el Reino Unido tienen un **derecho de desistimiento de 14 días** en nuevas suscripciones o compras digitales, siempre que el contenido digital no haya sido consumido ni descargado en su totalidad." : "**Right of Withdrawal (EU/UK)**: Users residing in the European Union or United Kingdom have a **14-day right of withdrawal** from new subscriptions or digital purchases, provided the digital content has not been fully streamed or downloaded."}</li>
                  <li>{locale === "es" ? "**Ventana de Cancelación EE. UU.**: En ciertos estados de EE. UU., se aplica una **ventana de cancelación de 3 días**, permitiendo a los usuarios cancelar y recibir un reembolso dentro de los 3 días posteriores a la compra." : "**US Cancellation Window**: In certain US states, a **3-day cancellation window** applies, allowing users to cancel and receive a refund within 3 days of purchase."}</li>
                </ul>
              </div>
            </div>

            {/* Section 3: Chargebacks & Virtual Currencies */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-white uppercase font-mono text-sm font-bold">
                <Scale className="w-5 h-5 text-emerald-400" />
                <h3>{locale === "es" ? "3. Contracargos y Monedas Virtuales" : "3. Chargebacks & Virtual Currencies"}</h3>
              </div>
              <div className="p-4 bg-white/[0.02] border-l-2 border-emerald-400 rounded-r-xl space-y-1">
                <span className="text-[9px] font-mono font-bold text-emerald-400 uppercase tracking-wider block">{locale === "es" ? "🔮 Traducción Mágica (TL;DR)" : "🔮 Magic Translation (TL;DR)"}</span>
                <p className="text-[10.5px] italic text-[#b9cac9]">
                  {locale === "es" ? "Las Monedas de Oro son artículos virtuales para propinas y objetivos; no son dinero real y no se pueden canjear en efectivo ni transferir. Si inicias una solicitud de reembolso fraudulenta o un contracargo, tu cuenta será bloqueada de inmediato." : "Gold Coins are virtual items for tipping and goals; they are not real money and cannot be cashed out or transferred. If you initiate a fraudulent refund request or chargeback, your account will be immediately banned."}
                </p>
              </div>
              <div className="space-y-2">
                <span className="text-[9px] font-mono text-white/30 uppercase font-bold block">{locale === "es" ? "⚖️ Términos Legales" : "⚖️ Legal Terms"}</span>
                <p>
                  {locale === "es" ? "Nuestra política de tokens y términos de monedas virtuales:" : "Our tokens policy and virtual coin terms:"}
                </p>
                <ul className="list-disc pl-4 space-y-1">
                  <li>{locale === "es" ? "**Moneda Virtual (Monedas de Oro/Tokens)**: La Plataforma puede ofrecer artículos virtuales o moneda del juego ('Monedas de Oro') para propinas y objetivos de contribución. Las Monedas de Oro representan una licencia limitada, no reembolsable y no transferible, carecen de valor monetario real y no pueden intercambiarse por dinero fiat ni transferirse fuera de la plataforma." : "**Virtual Currency (Gold Coins/Tokens)**: The Platform may offer virtual items or in-app currency (\"Gold Coins\") for tipping and contribution goals. Gold Coins represent a limited, non-refundable, and non-transferable license, have no cash value, and cannot be exchanged for fiat currency or transferred off-platform."}</li>
                  <li>{locale === "es" ? "**Política contra Contracargos**: La Plataforma tiene tolerancia cero hacia el fraude por contracargo. Los contracargos injustificados o las solicitudes de reembolso fraudulentas presentadas ante redes de pago resultarán en la terminación inmediata y permanente de la cuenta, la pérdida de monedas virtuales y el cobro de deudas pendientes." : "**Chargeback Policy**: The Platform has a zero-tolerance policy for chargeback fraud. Unjustified chargebacks or fraudulent refund requests filed through payment networks will result in immediate and permanent account termination, forfeiture of virtual currency, and collection of outstanding debts."}</li>
                </ul>
              </div>
            </div>

            {/* Section 4: Content Tagging & DSA Compliance */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-white uppercase font-mono text-sm font-bold">
                <MessageCircle className="w-5 h-5 text-[#00fbfb]" />
                <h3>{locale === "es" ? "4. Etiquetado de Contenido y Cumplimiento DSA" : "4. Content Tagging & DSA Compliance"}</h3>
              </div>
              <div className="p-4 bg-white/[0.02] border-l-2 border-[#00fbfb] rounded-r-xl space-y-1">
                <span className="text-[9px] font-mono font-bold text-[#00fbfb] uppercase tracking-wider block">{locale === "es" ? "🔮 Traducción Mágica (TL;DR)" : "🔮 Magic Translation (TL;DR)"}</span>
                <p className="text-[10.5px] italic text-[#b9cac9]">
                  {locale === "es" ? "Mantén limpios los feeds públicos. El contenido explícito debe etiquetarse correctamente y ubicarse tras muros de pago de suscripción VIP/Master. Escáneres de IA y moderadores humanos revisan todas las publicaciones. Si eliminamos un post o bloqueamos una cuenta, te enviaremos una Declaración de Razones clara." : "Keep public feeds clean. Explicit content must be tagged properly and placed behind VIP/Master subscription locks. AI scanners and human moderators screen all uploads. If we remove a post or lock an account, we will send you a clear Statement of Reasons."}
                </p>
              </div>
              <div className="space-y-2">
                <span className="text-[9px] font-mono text-white/30 uppercase font-bold block">{locale === "es" ? "⚖️ Términos Legales" : "⚖️ Legal Terms"}</span>
                <p>
                  {locale === "es" ? "La Plataforma implementa un sistema multi-capa de seguridad y moderación de contenido para cumplir con la Ley de Servicios Digitales (DSA):" : "The Platform implements a multi-layer upload safety pipeline and content moderation framework to satisfy the Digital Services Act (DSA):"}
                </p>
                <ul className="list-disc pl-4 space-y-1">
                  <li>{locale === "es" ? "**Etiquetado de Contenido**: Los creadores deben asignar etiquetas descriptivas y explícitas a todos los archivos multimedia subidos." : "**Content Tagging**: Creators must assign descriptive and explicit tags to all media uploads."}</li>
                  <li>{locale === "es" ? "**Acceso VIP/Master & Protección de Menores**: Todo contenido explícito debe estar restringido tras los niveles de suscripción de pago VIP/Master. En cumplimiento con el Artículo 28 de la DSA, implementamos estrictos controles de edad para garantizar la protección de menores frente a material explícito." : "**VIP/Master Gating & Minor Protection**: All explicit content must be gated behind paid VIP/Master subscription tiers. In compliance with Article 28 of the DSA, we implement strict age gates to ensure minor protection from explicit material."}</li>
                  <li>{locale === "es" ? "**Declaración de Razones (Artículo 17)**: Si tomamos medidas contra tu contenido (ej. eliminación, suspensión o bloqueo de monetización), proporcionaremos una Declaración de Razones detallada explicando la regla específica infringida y los parámetros de transparencia de nuestra decisión." : "**Statement of Reasons (Article 17)**: If we take action against your content (e.g., removal, suspension, or monetization lock), we will provide a detailed Statement of Reasons explaining the specific rule violated and the transparency parameters of our decision."}</li>
                </ul>
              </div>
            </div>

            {/* Section 5: Date Plan commitments and accessibility */}
            <div className="space-y-4 border-t border-white/5 pt-8">
              <div className="flex items-center gap-2 text-white uppercase font-mono text-sm font-bold">
                <UserCheck className="w-5 h-5 text-emerald-400" />
                <h3>{locale === "es" ? "5. Intencionalidad en Planes de Cita y Calificaciones de Confianza" : "5. Date Plan Intentionality & Trust Ratings"}</h3>
              </div>
              <div className="space-y-2">
                <p>
                  {locale === "es" ? "Nuestro módulo de Planes de Cita es una herramienta contra las 'situationships'. Por favor, no publiques Planes de Cita ni postules a los planes de otros miembros o creadores a menos que tengas una intención genuina de asistir. Cancelar planes confirmados repetidamente sin motivo viola las directrices de la comunidad y reduce tu puntuación de confianza (escala máxima de 20.00)." : "Our Date Plan module is an anti-situationship tool. Please do not publish Date Plans or apply to other members' or creators' date plans unless you have genuine intent to meet. Canceling confirmed plans repeatedly without cause violates community guidelines and reduces your trust rating score (max 20.00 scale)."}
                </p>
                <p>
                  {locale === "es" ? "En cumplimiento con la **Ley 11/2023** de España (que traspone la Acta Europea de Accesibilidad), las interfaces públicas, rutas de comercio electrónico y flujos de suscripción de la Plataforma cumplen con los estándares técnicos **EN 301 549**, incorporando el cumplimiento **WCAG 2.1 Nivel AA**." : "In compliance with Spanish **Law 11/2023** (transposing the European Accessibility Act), the Platform’s public interfaces, e-commerce pathways, and subscription flows conform to the **EN 301 549** technical standards, incorporating **WCAG 2.1 Level AA** compliance."}
                </p>
              </div>
            </div>

            {/* Section 6: Creator Revenue & Net Revenue Terms */}
            <div className="space-y-4 border-t border-white/5 pt-8">
              <div className="flex items-center gap-2 text-white uppercase font-mono text-sm font-bold">
                <CreditCard className="w-5 h-5 text-[#00fbfb]" />
                <h3>{locale === "es" ? "6. Ingresos de Creadores y Términos de Pago Neto" : "6. Creator Revenue & Net Payout Terms"}</h3>
              </div>
              <div className="p-4 bg-white/[0.02] border-l-2 border-[#00fbfb] rounded-r-xl space-y-1">
                <span className="text-[9px] font-mono font-bold text-[#00fbfb] uppercase tracking-wider block">{locale === "es" ? "🔮 Traducción Mágica (TL;DR)" : "🔮 Magic Translation (TL;DR)"}</span>
                <p className="text-[10.5px] italic text-[#b9cac9]">
                  {locale === "es" ? "Los creadores ganan el **80% de los Ingresos Netos**. Los Ingresos Netos se calculan después de deducir las comisiones de procesamiento de pago de terceros (tarifas de tarjetas de crédito Segpay / CCBill). Esto garantiza que SECCION mantenga un sólido margen operativo neto del 15% al 18% mientras ofrece un alto rendimiento a los creadores." : "Creators earn **80% of Net Revenue**. Net Revenue is calculated after deducting third-party payment processing fees (Segpay / CCBill credit card fees). This guarantees SECCION maintains a solid 15%–18% net operating margin while delivering high yield to creators."}
                </p>
              </div>
              <div className="space-y-2">
                <span className="text-[9px] font-mono text-white/30 uppercase font-bold block">{locale === "es" ? "⚖️ Términos Legales" : "⚖️ Legal Terms"}</span>
                <p>
                  {locale === "es" ? "Marco de cálculo y distribución de pagos para creadores:" : "Creator payout calculation and distribution framework:"}
                </p>
                <ul className="list-disc pl-4 space-y-1 font-mono text-[11px] text-[#b9cac9]">
                  <li>{locale === "es" ? (<><strong className="text-white">Definición de Ingresos Netos:</strong> Los Ingresos Netos se definen como los Pagos Brutos del Cliente menos los costos obligatorios de procesamiento de pagos de terceros (ej., tarifas de transacción de Segpay / CCBill, tasas de intercambio de tarjetas y reservas para contracargos).</>) : (<><strong className="text-white">Net Revenue Definition:</strong> Net Revenue is defined as Gross Customer Payments minus mandatory third-party payment processing costs (e.g., Segpay / CCBill transaction fees, credit card interchange, and chargeback reserves).</>)}</li>
                  <li>{locale === "es" ? (<><strong className="text-white">División de Pago Neto del 80%:</strong> Los creadores reciben el <strong className="text-[#00fbfb]">80% de los Ingresos Netos</strong> en todos los niveles de suscripción, desbloqueos pay-per-view, streams en vivo y pedidos de escrow personalizados. SECCION retiene el 20% restante de los Ingresos Netos.</>) : (<><strong className="text-white">80% Net Payout Split:</strong> Creators receive <strong className="text-[#00fbfb]">80% of Net Revenue</strong> across all subscription tiers, pay-per-view unlocks, live streams, and custom escrow orders. SECCION retains the remaining 20% of Net Revenue.</>)}</li>
                  <li>{locale === "es" ? (<><strong className="text-white">Margen Operativo Garantizado:</strong> Esta fórmula de Ingresos Netos garantiza que SECCION mantenga de forma constante un saludable <strong className="text-emerald-400">margen operativo de plataforma del 15% al 18%</strong> independientemente de las tarifas de procesamiento bancario internacional.</>) : (<><strong className="text-white">Guaranteed Operating Margin:</strong> This Net Revenue formula guarantees SECCION consistently maintains a healthy <strong className="text-emerald-400">15% to 18% net platform margin</strong> regardless of international credit card processing fees.</>)}</li>
                </ul>
              </div>
            </div>

          </div>
        </DoubleBezelCard>

      </div>

      {/* Footer */}
      <PublicFooter />

    </div>
  );
}
