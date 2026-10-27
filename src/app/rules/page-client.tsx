"use client";

import PublicFooter from "@/components/PublicFooter";
import React from "react";
import Link from "next/link";
import PublicNavbar from "@/components/PublicNavbar";
import { useTranslation } from "@/context/LanguageContext";
import {
  ArrowLeft,
  AlertTriangle,
  Scale,
  UserCheck,
  MessageCircle,
  CreditCard,
  ShieldAlert,
  FileText,
  Landmark,
  ShieldCheck,
  Cpu,
  HelpCircle,
  Lock
} from "lucide-react";

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
  const isEs = locale === "es";

  return (
    <div className="w-full min-h-screen text-[#e2e2e2] overflow-x-hidden font-sans bg-transparent relative flex flex-col justify-between">
      
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
      <div className="relative z-10 pt-36 px-6 md:px-[84px] max-w-[880px] mx-auto w-full flex-grow">
        
        {/* Back Link */}
        <Link href="/" className="inline-flex items-center gap-2 text-xs font-mono font-bold text-white/40 hover:text-[#00fbfb] transition mb-8 group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>{isEs ? "Volver al Inicio" : "Back to Home"}</span>
        </Link>

        {/* Title & Institutional Legal Header */}
        <div className="text-left space-y-4 mb-12">
          <h1 className="font-display text-4xl md:text-5xl font-black text-white tracking-tight uppercase leading-none font-['Outfit']">
            {isEs ? "Términos de Servicio y Normas de Cumplimiento" : "Terms of Service & Compliance Rules"}
          </h1>
          <p className="text-xs sm:text-sm text-[#b9cac9] max-w-2xl">
            {isEs
              ? "Marco contractual maestro, condiciones de uso de tokens, directrices comunitarias, políticas contra el fraude y resolución de disputas de SECCION."
              : "Master contractual framework, in-app token conditions, community standards, anti-fraud policies, and statutory dispute resolution of SECCION."}
          </p>

          {/* Legal Entity & Descriptor Badge */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
            <div className="p-4 bg-white/[0.03] border border-white/10 rounded-2xl text-left text-[11px] text-[#b9cac9] font-mono space-y-1.5">
              <div className="text-white font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Landmark className="w-4 h-4 text-[#00fbfb]" />
                <span>{isEs ? "ENTIDAD LEGAL TITULAR" : "OPERATING LEGAL ENTITY"}</span>
              </div>
              <div className="text-white text-xs font-semibold">SECCION AI CONCEPT S.L.</div>
              <div className="text-[10px] text-white/70 leading-relaxed">
                NIF / CIF: <span className="text-[#00fbfb]">B05765441</span> • Registro Mercantil de Alicante (Tomo 4486, Hoja A 208743).
              </div>
              <div className="text-[10px] text-white/60 pt-1">
                Legal & Privacy Desk: <a href="mailto:legal@seccion.ai" className="text-[#00fbfb] underline">legal@seccion.ai</a>
              </div>
            </div>

            <div className="p-4 bg-white/[0.03] border border-emerald-500/20 rounded-2xl text-left text-[11px] text-[#b9cac9] font-mono space-y-1.5">
              <div className="text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-emerald-400" />
                <span>{isEs ? "DESCRIPTOR BANCARIO / EXTRACTO" : "BILLING DESCRIPTOR NOTICE"}</span>
              </div>
              <div className="text-white text-xs font-semibold">
                {isEs ? "Aparecerá como: " : "Card Statement Descriptor: "}
                <span className="text-emerald-400 font-bold">"Seccion Matrix"</span>
              </div>
              <div className="text-[10px] text-white/70 leading-relaxed">
                {isEs
                  ? "Las compras de tokens y pases se reflejarán en su extracto bancario como 'Seccion Matrix'. Centro de atención 24/7 disponible."
                  : "Purchases of in-app tokens and passes will reflect on your card or bank statement as 'Seccion Matrix'. Dedicated 24/7 billing support available."}
              </div>
              <div className="text-[10px] text-white/60 pt-1">
                DSA Single Point of Contact: <a href="mailto:dsa-compliance@seccion.ai" className="text-emerald-400 underline">dsa-compliance@seccion.ai</a>
              </div>
            </div>
          </div>
        </div>

        <DoubleBezelCard>
          <div className="space-y-12 text-left text-xs font-medium leading-relaxed text-[#b9cac9] font-sans">
            
            {/* =================================================================== */}
            {/* SECTION 1: PROHIBITED CONTENT & STATUTORY REPORTING */}
            {/* =================================================================== */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-white uppercase font-mono text-sm font-bold">
                <ShieldAlert className="w-5 h-5 text-[#00fbfb]" />
                <h3>{isEs ? "1. Contenido Prohibido y Normas Legales de Notificación" : "1. Prohibited Content & Statutory Reporting Standards"}</h3>
              </div>
              <div className="p-4 bg-white/[0.02] border-l-2 border-[#00fbfb] rounded-r-xl space-y-1">
                <span className="text-[9px] font-mono font-bold text-[#00fbfb] uppercase tracking-wider block">
                  {isEs ? "🔮 Traducción Mágica (TL;DR)" : "🔮 Magic Translation (TL;DR)"}
                </span>
                <p className="text-[10.5px] italic text-[#b9cac9]">
                  {isEs
                    ? "Tolerancia cero total. Prohibimos contenido no consensual, explotación de menores, deepfakes no autorizados, estafas y acoso. Reportamos de forma inmediata y automática cualquier material ilegal al NCMEC y a la Guardia Civil / Policía Nacional."
                    : "Zero tolerance. We strictly ban non-consensual media, child exploitation, unauthorized deepfakes, scams, and harassment. We immediately and automatically report illegal content to NCMEC and European cybercrime police."}
                </p>
              </div>
              <div className="space-y-3">
                <span className="text-[9px] font-mono text-white/30 uppercase font-bold block">{isEs ? "⚖️ Términos Legales y Obligaciones de Denuncia" : "⚖️ Legal Terms & Reporting Obligations"}</span>
                <p>
                  {isEs
                    ? "Los siguientes tipos de contenido y conductas están terminantemente prohibidos en la Plataforma bajo rescisión contractual inmediata y acciones penales:"
                    : "The following content types and behaviors are strictly prohibited on the Platform, incurring immediate account termination and criminal referral:"}
                </p>
                <ul className="list-disc pl-4 space-y-1.5">
                  <li>
                    <strong>{isEs ? "Tolerancia Cero con la Explotación Infantil (CSAM / NCMEC)" : "Zero-Tolerance Minor Exploitation (CSAM / NCMEC)"}:</strong>{" "}
                    {isEs
                      ? "La Plataforma prohíbe de forma absoluta cualquier material que involucre, represente o simule a menores de 18 años. En estricto cumplimiento del Título 18 U.S.C. § 2258A y del Artículo 189 del Código Penal español, todo intento de distribución de CSAM activará la congelación inmediata de la cuenta y la transmisión directa de telemetría e identidades a la CyberTipline del National Center for Missing & Exploited Children (NCMEC) y a las fuerzas y cuerpos de seguridad del Estado (Grupo de Delitos Telemáticos de la Guardia Civil y UFAM de la Policía Nacional)."
                      : "The Platform maintains zero tolerance for any content depicting, soliciting, or simulating minors under 18. In strict compliance with 18 U.S.C. § 2258A and Spanish Penal Code Article 189, any CSAM detection results in immediate account freezing and automated telemetry referral to the NCMEC CyberTipline (National Center for Missing & Exploited Children) and European cybercrime law enforcement (Guardia Civil GDT & Policía Nacional UFAM)."}
                  </li>
                  <li>
                    <strong>{isEs ? "Material Explícito No Consensual y Filtraciones" : "Non-Consensual Explicit Material & Leaks"}:</strong>{" "}
                    {isEs
                      ? "Está terminantemente prohibido subir, distribuir o comerciar con imágenes, audios o videos sin el consentimiento documentado de todos los participantes ('cyberflashing', sextorsión o 'stealthing'). Toda filtración de contenido protegido por DRM de SECCION conllevará la expulsión permanente y reclamación por daños civiles y penales."
                      : "Uploading or distributing media without verified documented consent of all appearing individuals (cyberflashing, sextortion, or non-consensual sharing) is strictly banned. Any leak of SECCION DRM-protected media triggers permanent ban and civil/criminal statutory damages."}
                  </li>
                  <li>
                    <strong>{isEs ? "Deepfakes, Clonación No Autorizada y Ley de IA" : "Deepfakes, Unauthorized Voice Cloning & AI Act"}:</strong>{" "}
                    {isEs
                      ? "Se prohíbe la creación o distribución de ultrafalsificaciones (deepfakes), clonación de voz de terceros sin autorización o contenido sintético difamatorio. En cumplimiento del Reglamento de IA de la UE (Reglamento 2024/1689), el contenido sintético autorizado debe incorporar marcas forenses indelebles (SynthID)."
                      : "Generating or distributing deepfakes, unauthorized voice cloning, or synthetic defamation is strictly prohibited. In compliance with the EU AI Act (Regulation 2024/1689), authorized synthetic content must carry indelible digital watermarking (SynthID)."}
                  </li>
                  <li>
                    <strong>{isEs ? "Canal de Notificación y Acción (Artículo 16 DSA)" : "Notice and Action Mechanism (Article 16 DSA)"}:</strong>{" "}
                    {isEs
                      ? "Cualquier usuario o entidad puede notificar la presencia de contenido supuestamente ilícito a través de nuestro formulario en línea o al correo dsa-compliance@seccion.ai. SECCION confirmará la recepción electrónicamente sin dilación indebida y tramitará la resolución en un plazo máximo de 24 horas laborables. Los alertadores fiables acreditados ('Trusted Flaggers' bajo Artículo 22 de la DSA) recibirán tratamiento prioritario inmediato."
                      : "Any individual or entity may submit a notice of alleged illegal content via our online reporting form or to dsa-compliance@seccion.ai. SECCION issues electronic confirmation of receipt without undue delay and resolves notices within 24 business hours. Accredited Trusted Flaggers (Article 22 DSA) receive immediate prioritized processing."}
                  </li>
                </ul>
              </div>
            </div>

            {/* =================================================================== */}
            {/* SECTION 2: SUBSCRIPTIONS, CANCELLATIONS & REFUND WAIVERS */}
            {/* =================================================================== */}
            <div className="space-y-4 border-t border-white/5 pt-8">
              <div className="flex items-center gap-2 text-white uppercase font-mono text-sm font-bold">
                <CreditCard className="w-5 h-5 text-[#ffabf3]" />
                <h3>{isEs ? "2. Suscripciones, Cancelaciones y Renuncia de Desistimiento Digital" : "2. Subscriptions, Cancellations & Digital Refund Waivers"}</h3>
              </div>
              <div className="p-4 bg-white/[0.02] border-l-2 border-[#ffabf3] rounded-r-xl space-y-1">
                <span className="text-[9px] font-mono font-bold text-[#ffabf3] uppercase tracking-wider block">
                  {isEs ? "🔮 Traducción Mágica (TL;DR)" : "🔮 Magic Translation (TL;DR)"}
                </span>
                <p className="text-[10.5px] italic text-[#b9cac9]">
                  {isEs
                    ? "Cancela cuando quieras en 2 clics sin preguntas ni laberintos. Para compras de tokens Matrix, el servicio digital se entrega al instante en tu saldo, por lo que aceptas que el derecho de desistimiento de 14 días finaliza en el momento de la entrega del token."
                    : "Cancel subscriptions anytime in 2 clicks with zero dark patterns. For Matrix token purchases, instant delivery into your balance waives the 14-day statutory refund right upon immediate execution of digital content."}
                </p>
              </div>
              <div className="space-y-2">
                <span className="text-[9px] font-mono text-white/30 uppercase font-bold block">{isEs ? "⚖️ Términos Legales de Consumo" : "⚖️ Consumer Legal Terms"}</span>
                <ul className="list-disc pl-4 space-y-1.5">
                  <li>
                    <strong>{isEs ? "Renovación Automática Transparente (UK DMCCA 2024 / UE)" : "Transparent Auto-Renewal (UK DMCCA 2024 / EU)"}:</strong>{" "}
                    {isEs
                      ? "Los pases VIP y suscripciones mensuales se renuevan automáticamente al término del ciclo de facturación. Enviamos recordatorios electrónicos antes del cobro de renovación."
                      : "VIP passes and monthly memberships automatically renew unless cancelled. Electronic reminders are dispatched prior to renewal billing."}
                  </li>
                  <li>
                    <strong>{isEs ? "Cancelación Directa en Dos Clics" : "Simple Two-Click Cancellation"}:</strong>{" "}
                    {isEs
                      ? "Los usuarios pueden cancelar cualquier suscripción activa en cualquier momento mediante un botón visible en los Ajustes de Cuenta. El acceso permanece activo hasta finalizar el ciclo pagado."
                      : "Users may cancel recurring subscriptions at any time via a prominent two-click path in Account Settings without penalty, maintaining access through the end of the paid billing period."}
                  </li>
                  <li>
                    <strong>{isEs ? "Renuncia de Desistimiento en Bienes Digitales (Directiva 2011/83/UE)" : "Digital Goods Waiver of Withdrawal (Directive 2011/83/EU)"}:</strong>{" "}
                    {isEs
                      ? "De conformidad con el Artículo 16(m) de la Directiva Europea 2011/83/UE y la normativa española de consumidores, la compra de Matrix Tokens (Red Pills) constituye contenido digital no suministrado en soporte material. Al adquirir tokens, el usuario consiente de forma expresa el inicio inmediato de la ejecución digital y reconoce formalmente que pierde su derecho de desistimiento de 14 días una vez los tokens son acreditados en su billetera digital."
                      : "In accordance with Article 16(m) of EU Directive 2011/83/EU and national consumer protection acts, purchasing Matrix Tokens constitutes digital content not supplied on a tangible medium. By purchasing, the member expressly consents to immediate digital performance and acknowledges forfeiture of the statutory 14-day right of withdrawal once tokens are credited to their in-app wallet balance."}
                  </li>
                  <li>
                    <strong>{isEs ? "Ventana de Cancelación en EE. UU." : "US State Cancellation Window"}:</strong>{" "}
                    {isEs
                      ? "Para residentes en estados de EE. UU. donde rija estatutariamente un derecho de cancelación contractual de 3 días (ej., California, Nueva York), se aplicará dicha ventana siempre que los tokens no hayan sido consumidos."
                      : "Where mandated by applicable US state statutes (e.g. California, New York), a 3-day cooling-off cancellation window applies provided tokens remain unburned."}
                  </li>
                </ul>
              </div>
            </div>

            {/* =================================================================== */}
            {/* SECTION 3: CLOSED-LOOP TOKEN ECONOMY & CHARGEBACK FIREWALL */}
            {/* =================================================================== */}
            <div className="space-y-4 border-t border-white/5 pt-8">
              <div className="flex items-center gap-2 text-white uppercase font-mono text-sm font-bold">
                <Scale className="w-5 h-5 text-emerald-400" />
                <h3>{isEs ? "3. Economía de Tokens Matrix (MCC 5818), Descriptor y Contracargos" : "3. Closed-Loop Matrix Token Economy (MCC 5818), Billing Descriptor & Chargebacks"}</h3>
              </div>
              <div className="p-4 bg-white/[0.02] border-l-2 border-emerald-400 rounded-r-xl space-y-1">
                <span className="text-[9px] font-mono font-bold text-emerald-400 uppercase tracking-wider block">
                  {isEs ? "🔮 Traducción Mágica (TL;DR)" : "🔮 Magic Translation (TL;DR)"}
                </span>
                <p className="text-[10.5px] italic text-[#b9cac9]">
                  {isEs
                    ? "Los tokens Matrix Red Pills son artículos virtuales cerrados para interactuar en la plataforma; no son dinero fiat ni transferibles fuera de SECCION. En tu extracto bancario verás 'Seccion Matrix'. Los contracargos fraudulentos implican baneo inmediato y cobro formal de la deuda."
                    : "Matrix Red Pills are closed-loop virtual in-app utility tokens for platform engagement; they have no cash value and cannot be withdrawn or transferred off-platform. Card statements display 'Seccion Matrix'. Fraudulent chargebacks result in immediate account banning and debt recovery."}
                </p>
              </div>
              <div className="space-y-3">
                <span className="text-[9px] font-mono text-white/30 uppercase font-bold block">{isEs ? "⚖️ Términos de tokens y cortafuegos financiero" : "⚖️ Token Terms & Financial Firewall"}</span>
                <ul className="list-disc pl-4 space-y-1.5">
                  <li>
                    <strong>{isEs ? "Clasificación como Bienes Digitales (MCC 5818)" : "Closed-Loop Digital Goods Classification (MCC 5818)"}:</strong>{" "}
                    {isEs
                      ? "Los Matrix Tokens (Red Pills 💊 y Blue Pills 💊) representan una licencia limitada, no exclusiva, revocable e intransferible para el acceso a funciones interactivas, desbloqueos de medios DRM y propinas en vivo dentro de SECCION. Los tokens carecen de valor monetario intrínseco, no son moneda de curso legal, no devengan intereses y bajo ninguna circunstancia pueden ser canjeados, recomprados o reembolsados en moneda fiat a miembros o usuarios comunes (garantizando estricto cumplimiento contra la transmisión no autorizada de dinero)."
                      : "Matrix Tokens (Red Pills 💊 and Blue Pills 💊) represent a limited, revocable, non-transferable license to access interactive features, DRM media unlocks, and live stream tipping on SECCION under Merchant Category Code MCC 5818 (Digital Goods / Entertainment). Tokens possess no cash value, are non-redeemable for fiat by purchasing members, and cannot be transferred outside the platform ecosystem."}
                  </li>
                  <li>
                    <strong>{isEs ? "Identificación del Cobro en Extractos ('Seccion Matrix')" : "Statement Billing Descriptor ('Seccion Matrix')"}:</strong>{" "}
                    {isEs
                      ? "Todas las transacciones procesadas mediante tarjeta de crédito, débito o pasarelas de pago se identificarán formalmente en el extracto bancario del titular bajo el descriptor oficial 'Seccion Matrix' o 'SECCION MATRIX'. El titular asume la responsabilidad de reconocer dicho cargo."
                      : "All transactions processed via credit card, debit card, or payment gateways will formally appear on cardholder billing statements under the official descriptor 'Seccion Matrix' (or 'SECCION MATRIX'). Cardholders are legally responsible for acknowledging authorized charges under this descriptor."}
                  </li>
                  <li>
                    <strong>{isEs ? "Política Contra el Fraude Amistoso y Resolución RDR" : "Anti-Friendly Fraud Policy & Visa RDR Deflection"}:</strong>{" "}
                    {isEs
                      ? "La Plataforma opera sistemas de resolución temprana (Ethoca y Visa Rapid Dispute Resolution - RDR). Si tiene cualquier duda con un cargo, debe contactar primero a support@seccion.ai. El inicio de contracargos injustificados ('friendly fraud') o disputas bancarias maliciosas resultará en el bloqueo permanente del usuario, la confiscación de tokens no consumidos y el traslado del expediente a agencias de cobro de deudas comerciales con repercusión de los costes de disputa (€25 a €45 por contracargo)."
                      : "The Platform operates automated pre-dispute resolution (Ethoca alerts & Visa Rapid Dispute Resolution - RDR). If an unauthorized transaction is suspected, cardholders must contact support@seccion.ai prior to bank escalation. Filing malicious or unjustified chargebacks constitutes breach of contract and triggers immediate account termination, forfeiture of remaining tokens, and formal debt collection for disputed amounts plus associated scheme dispute fees (€25–€45 per chargeback)."}
                  </li>
                </ul>
              </div>
            </div>

            {/* =================================================================== */}
            {/* SECTION 4: CONTENT MODERATION, DSA & EU AI ACT */}
            {/* =================================================================== */}
            <div className="space-y-4 border-t border-white/5 pt-8">
              <div className="flex items-center gap-2 text-white uppercase font-mono text-sm font-bold">
                <MessageCircle className="w-5 h-5 text-[#00fbfb]" />
                <h3>{isEs ? "4. Moderación de Contenido, Cumplimiento DSA y Transparencia de IA" : "4. Content Moderation, DSA Compliance & AI Transparency"}</h3>
              </div>
              <div className="p-4 bg-white/[0.02] border-l-2 border-[#00fbfb] rounded-r-xl space-y-1">
                <span className="text-[9px] font-mono font-bold text-[#00fbfb] uppercase tracking-wider block">
                  {isEs ? "🔮 Traducción Mágica (TL;DR)" : "🔮 Magic Translation (TL;DR)"}
                </span>
                <p className="text-[10.5px] italic text-[#b9cac9]">
                  {isEs
                    ? "Feeds públicos 100% limpios; el contenido sensual vive estrictamente tras muros de pago con verificación de edad 18+. Si moderamos tu cuenta, recibirás una Declaración de Razones humana. Los Copilotos de IA de creadores están claramente identificados."
                    : "Public feeds are 100% clean; sensual content is strictly quarantined behind 18+ token paywalls. If content is moderated, you receive a written Statement of Reasons with a right to human appeal. Creator AI Copilots are always transparently badged."}
                </p>
              </div>
              <div className="space-y-3">
                <span className="text-[9px] font-mono text-white/30 uppercase font-bold block">{isEs ? "⚖️ Marco Regulatorio DSA y Ley de Inteligencia Artificial" : "⚖️ DSA Framework & EU AI Act Governance"}</span>
                <ul className="list-disc pl-4 space-y-1.5">
                  <li>
                    <strong>{isEs ? "Aislamiento SFW / NSFW y Protección de Menores (Art. 28 DSA)" : "SFW / NSFW Isolation & Minor Protection (Art. 28 DSA)"}:</strong>{" "}
                    {isEs
                      ? "El feed público de SECCION es estrictamente apto para todos los públicos (SFW). El contenido para adultos o sensual está confinado en un entorno restringido que exige verificación criptográfica de mayoría de edad (18+) y consentimiento explícito doble, impidiendo cualquier acceso o perfilado de menores."
                      : "SECCION's discovery feed is strictly non-explicit (SFW). Sensitive or adult-oriented creator media is strictly quarantined behind age-verified 18+ Warm Paywalls requiring cryptographic zero-knowledge age verification, eliminating minor exposure or profiling."}
                  </li>
                  <li>
                    <strong>{isEs ? "Declaración de Razones y Recursos (Artículo 17 y Artículo 20 de la DSA)" : "Statement of Reasons & Human Appeal (Article 17 & Article 20 DSA)"}:</strong>{" "}
                    {isEs
                      ? "Cualquier decisión de retirada de contenido o limitación de cuenta irá acompañada de una Declaración de Razones individualizada (fundamento fáctico y legal). El creador o miembro tiene derecho a recurrir la decisión durante un plazo de 6 meses ante nuestro sistema interno de tramitación de quejas, garantizando la intervención y revisión por personal humano cualificado (prohibiendo resoluciones finales 100% automatizadas)."
                      : "Any content removal, account suspension, or monetization lock includes an individualized Statement of Reasons detailing factual and legal grounds. Users hold the right to appeal decisions free of charge for 6 months through our internal complaint-handling system, ensuring review by qualified human moderation officers."}
                  </li>
                  <li>
                    <strong>{isEs ? "Transparencia de IA y Agentes Conversacionales (Art. 50 Ley de IA)" : "AI Transparency & Synthetic Interactions (Art. 50 EU AI Act)"}:</strong>{" "}
                    {isEs
                      ? "En cumplimiento con el Artículo 50 del Reglamento de IA de la UE, los usuarios son notificados de que los creadores pueden habilitar un Copiloto de IA ('Creator Studio Copilot') entrenado en su propia base de conocimiento para responder mensajes de texto. Todas las conversaciones asistidas por IA muestran el distintivo visible '✨ AI Copilot'."
                      : "In compliance with Article 50 of the EU AI Act (Regulation 2024/1689), members are explicitly notified when interacting with an automated AI conversational agent. Creator Studio Copilots powered by Google Gemini AI are prominently marked with '✨ AI Copilot'."}
                  </li>
                </ul>
              </div>
            </div>

            {/* =================================================================== */}
            {/* SECTION 5: DATE PLANS, TRUST SCORE & ACCESSIBILITY */}
            {/* =================================================================== */}
            <div className="space-y-4 border-t border-white/5 pt-8">
              <div className="flex items-center gap-2 text-white uppercase font-mono text-sm font-bold">
                <UserCheck className="w-5 h-5 text-emerald-400" />
                <h3>{isEs ? "5. Planes de Cita, Calificación de Confianza y Accesibilidad (Ley 11/2023)" : "5. Date Plans, Trust Ratings & Accessibility (Spanish Law 11/2023)"}</h3>
              </div>
              <div className="space-y-2">
                <p>
                  {isEs
                    ? "El módulo de Planes de Cita fomenta interacciones reales y seguras. Cancelar reiteradamente citas confirmadas reduce la puntuación mutua de confianza en la escala de 20.00 puntos."
                    : "The Date Plan module requires genuine relational intent. Cancelling confirmed meetings without justification degrades the member's mutual trust rating on our 20.00 scale."}
                </p>
                <p>
                  {isEs
                    ? "En estricto cumplimiento con la **Ley 11/2023** de España (transposición del Acta Europea de Accesibilidad), las interfaces públicas, pasarelas de pago y flujos de suscripción de SECCION cumplen con los estándares técnicos **EN 301 549** incorporando conformidad **WCAG 2.1 Nivel AA**."
                    : "In strict compliance with Spanish **Law 11/2023** (transposing the European Accessibility Act), SECCION’s public interfaces, payment flows, and digital subscription portals conform to **EN 301 549** technical standards, achieving **WCAG 2.1 Level AA** accessibility."}
                </p>
              </div>
            </div>

            {/* =================================================================== */}
            {/* SECTION 6: CREATOR REVENUE SPLIT, 50-50 CARD SHARE & DAC7 TAX */}
            {/* =================================================================== */}
            <div className="space-y-4 border-t border-white/5 pt-8">
              <div className="flex items-center gap-2 text-white uppercase font-mono text-sm font-bold">
                <CreditCard className="w-5 h-5 text-[#00fbfb]" />
                <h3>{isEs ? "6. Reparto de Ingresos (90% Fundador), Reparto 50-50 de Comisiones y DAC7" : "6. Creator Revenue (90% Founding Split), 50-50 Fee Share & DAC7 Tax Reporting"}</h3>
              </div>
              <div className="p-4 bg-white/[0.02] border-l-2 border-[#00fbfb] rounded-r-xl space-y-1">
                <span className="text-[9px] font-mono font-bold text-[#00fbfb] uppercase tracking-wider block">
                  {isEs ? "🔮 Traducción Mágica (TL;DR)" : "🔮 Magic Translation (TL;DR)"}
                </span>
                <p className="text-[10.5px] italic text-[#b9cac9]">
                  {isEs
                    ? "Los Creadores Fundadores reciben el 90% neto de sus ingresos (80% estándar posterior). Las pasarelas de bajo coste (Open Banking y Cripto) tienen 0% de comisión. En pagos con tarjeta de crédito (~4%), el coste se reparte 50-50 de forma transparente: el miembro paga +2% al comprar y el creador absorbe -2% al canjear. Reportamos anualmente a Hacienda bajo la directiva DAC7."
                    : "Founding Creators receive 90% net revenue split (80% standard thereafter). Zero-fee rails (Open Banking and Crypto) carry 0% gateway deductions. For credit card payments (~4% toll), the cost is split 50-50 transparently: the member pays +2% at checkout, and the creator absorbs -2% on token burn. Mandatory annual DAC7 tax reporting applies."}
                </p>
              </div>
              <div className="space-y-3">
                <span className="text-[9px] font-mono text-white/30 uppercase font-bold block">{isEs ? "⚖️ Condiciones Financieras y Fiscales de Creadores" : "⚖️ Creator Financial & Fiscal Framework"}</span>
                <ul className="list-disc pl-4 space-y-1.5 font-mono text-[11px] text-[#b9cac9]">
                  <li>
                    <strong className="text-white">{isEs ? "Reparto del 90% de Ingresos Netos:" : "90% Net Revenue Split (Founding Tier):"}</strong>{" "}
                    {isEs
                      ? "Los Creadores Fundadores aprobados durante la fase inicial reciben el 90% de los Ingresos Netos por venta de pases VIP, desbloqueo de contenido DRM, propinas en vivo y pedidos de escrow personalizado (80% estándar para nuevos registros tras el primer año). SECCION retiene el 10% restante de la plataforma."
                      : "Approved Founding Creators receive a guaranteed 90% Net Revenue split on VIP passes, DRM media unlocks, live tips, and custom escrow orders (80% standard thereafter). SECCION retains a 10% platform margin."}
                  </li>
                  <li>
                    <strong className="text-white">{isEs ? "Mecanismo de Reparto 50-50 de Comisiones de Tarjeta:" : "50-50 Card Processing Fee Share Engine:"}</strong>{" "}
                    {isEs
                      ? "Para proteger el margen de los creadores sin inflar costes, cuando un miembro adquiere tokens con tarjeta de crédito/débito (tarifa típica de procesamiento ~4.0%): el miembro cubre el 50% (+2.0%) como tarifa de conveniencia visible al pagar; y el creador absorbe el 50% restante (-2.0%) únicamente al monetizar dichos tokens. Si el miembro utiliza Open Banking (Bizum / SEPA Instant) o Cripto (USDT), la comisión es del 0.0% y el creador cobra el 90% íntegro."
                      : "When tokens are funded via credit card (~4.0% acquiring toll): the member covers 50% (+2.0%) as a transparent checkout convenience fee; and the creator absorbs the remaining 50% (-2.0%) only upon token redemption. Payments funded via Open Banking or Web3 Crypto carry 0.0% gateway toll, netting the creator a full 90% payout."}
                  </li>
                  <li>
                    <strong className="text-white">{isEs ? "Cumplimiento Fiscal y Directiva DAC7 / 1099:" : "Fiscal Compliance (EU DAC7 Directive & US 1099 / TIN):"}</strong>{" "}
                    {isEs
                      ? "En cumplimiento de la Directiva (UE) 2021/514 (DAC7) y normativas tributarias internacionales, SECCION recopila el NIF/NIE, TIN (Tax Identification Number), número de IVA/VAT y residencia fiscal de todos los creadores para la declaración informativa anual obligatoria ante la Agencia Estatal de Administración Tributaria (AEAT) y organismos fiscales correspondientes."
                      : "Under Council Directive (EU) 2021/514 (DAC7) and international tax regulations, SECCION collects the creator's Tax Identification Number (TIN/NIF/NIE), VAT registration, and fiscal domicile for mandatory annual platform reporting to the Spanish Tax Agency (AEAT) and relevant tax authorities."}
                  </li>
                </ul>
              </div>
            </div>

            {/* =================================================================== */}
            {/* SECTION 7: 18 U.S.C. § 2257 CUSTODIAN & CO-PERFORMER RELEASES */}
            {/* =================================================================== */}
            <div className="space-y-4 border-t border-white/5 pt-8">
              <div className="flex items-center gap-2 text-white uppercase font-mono text-sm font-bold">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <h3>{isEs ? "7. Declaración de Custodia de Registros (18 U.S.C. § 2257) y Autorizaciones" : "7. Record-Keeping Custodian (18 U.S.C. § 2257) & Model Releases"}</h3>
              </div>
              <div className="p-4 bg-white/[0.02] border-l-2 border-emerald-400 rounded-r-xl space-y-1">
                <span className="text-[9px] font-mono font-bold text-emerald-400 uppercase tracking-wider block">
                  {isEs ? "🔮 Traducción Mágica (TL;DR)" : "🔮 Magic Translation (TL;DR)"}
                </span>
                <p className="text-[10.5px] italic text-[#b9cac9]">
                  {isEs
                    ? "Todos los creadores y co-participantes deben verificar su identidad 18+ con documento oficial y selfie de liveness antes de publicar. Mantenemos el registro de custodia legal conforme al estatuto federal 2257."
                    : "All creators and co-performers must complete 18+ government photo ID and biometric liveness verification with signed model releases prior to publication under 18 U.S.C. 2257."}
                </p>
              </div>
              <div className="space-y-3">
                <span className="text-[9px] font-mono text-white/30 uppercase font-bold block">{isEs ? "⚖️ Declaración Estatutaria de Custodia 2257" : "⚖️ Statutory 2257 Custodian Disclosure"}</span>
                <p>
                  {isEs
                    ? "En estricto cumplimiento del Título 18 U.S.C. § 2257 y 2257A y sus reglamentos de desarrollo:"
                    : "In strict compliance with 18 U.S.C. § 2257, 2257A, and implementing regulations:"}
                </p>
                <ul className="list-disc pl-4 space-y-1.5">
                  <li>
                    <strong>{isEs ? "Verificación de Identidad y Co-Participantes" : "Mandatory Photo ID & Co-Performer Verification"}:</strong>{" "}
                    {isEs
                      ? "Todo creador debe completar una verificación obligatoria con documento oficial de identidad con fotografía (Photo ID), selfie de prueba de vida (liveness) sosteniendo el documento y contrato de cesión de derechos ('Model Release'). Ningún co-participante puede figurar en imágenes o transmisiones sin haber completado previamente la verificación 2257 y autorización firmada."
                      : "Every creator must verify via government-issued Photo ID, biometric liveness selfie holding the photo ID, and signed Model Release. No co-performer may appear in media or live streams without prior independent 2257 verification and signed release documentation."}
                  </li>
                  <li>
                    <strong>{isEs ? "Custodio de Registros Designado" : "Designated Custodian of Records"}:</strong>{" "}
                    {isEs
                      ? "Los registros originales exigidos por el artículo 2257 se custodian de forma segura y cifrada por el Custodio de Registros de SECCION AI CONCEPT S.L. en su sede operativa de Alicante, España. Las consultas legales de inspección deben dirigirse a legal@seccion.ai."
                      : "The original records required under 18 U.S.C. 2257 are maintained in encrypted format by the designated Custodian of Records of SECCION AI CONCEPT S.L. at its corporate domicile in Alicante, Spain. Inspection inquiries may be directed to legal@seccion.ai."}
                  </li>
                  <li>
                    <strong>{isEs ? "Consentimiento Explícito y Minimización GDPR" : "Explicit Consent & GDPR Biometric Minimization"}:</strong>{" "}
                    {isEs
                      ? "Los datos biométricos de prueba de vida se tratan bajo consentimiento explícito (Artículo 9 RGPD). Conforme al principio de minimización de datos, las imágenes faciales de estimación de edad se descartan de forma inmediata una vez validado el acceso. Cualquier brecha de datos con riesgo elevado será notificada a la Agencia Española de Protección de Datos (AEPD) en un plazo máximo de 72 horas."
                      : "Biometric liveness data is processed under explicit consent (GDPR Article 9). Under strict data minimization, facial estimation selfies are discarded immediately following verification. Any high-risk data breach will be reported to the Spanish Data Protection Agency (AEPD) within 72 hours."}
                  </li>
                </ul>
              </div>
            </div>

            {/* =================================================================== */}
            {/* SECTION 8: MULTI-TIER DISPUTE SETTLEMENT & ARBITRATION */}
            {/* =================================================================== */}
            <div className="space-y-4 border-t border-white/5 pt-8">
              <div className="flex items-center gap-2 text-white uppercase font-mono text-sm font-bold">
                <Landmark className="w-5 h-5 text-[#00fbfb]" />
                <h3>{isEs ? "8. Resolución de Disputas, Arbitraje y Órganos Certificados (Art. 21 DSA)" : "8. Multi-Tier Dispute Settlement, Arbitration & Certified Bodies (Art. 21 DSA)"}</h3>
              </div>
              <div className="p-4 bg-white/[0.02] border-l-2 border-[#00fbfb] rounded-r-xl space-y-1">
                <span className="text-[9px] font-mono font-bold text-[#00fbfb] uppercase tracking-wider block">
                  {isEs ? "🔮 Traducción Mágica (TL;DR)" : "🔮 Magic Translation (TL;DR)"}
                </span>
                <p className="text-[10.5px] italic text-[#b9cac9]">
                  {isEs
                    ? "Resolvemos cualquier problema en 24-48 horas. Si no estás conforme con una decisión de moderación o bloqueo, tienes derecho a recurrir ante organismos independientes certificados por la CNMC bajo la Ley DSA o ante la plataforma de litigios de la Unión Europea."
                    : "We resolve inquiries within 24-48 hours. If unsatisfied with a moderation or account decision, you have the statutory right to escalate to out-of-court settlement bodies certified by the CNMC under the EU DSA, or to the EU Consumer Dispute platform."}
                </p>
              </div>
              <div className="space-y-3">
                <span className="text-[9px] font-mono text-white/30 uppercase font-bold block">{isEs ? "⚖️ Procedimiento Escalonado de Solución de Conflictos" : "⚖️ Multi-Tier Escalation Framework"}</span>
                <ul className="list-disc pl-4 space-y-1.5">
                  <li>
                    <strong>{isEs ? "Nivel 1 • Centro Interno de Resolución 24/7 (Art. 20 DSA):" : "Tier 1 • Internal 24/7 Dispute Resolution (Art. 20 DSA):"}</strong>{" "}
                    {isEs
                      ? "Cualquier controversia debe tramitarse inicialmente ante nuestro equipo de soporte en support@seccion.ai o legal@seccion.ai. El usuario dispone de 6 meses para recurrir cualquier resolución interna."
                      : "Users must first submit claims to support@seccion.ai or legal@seccion.ai. Users maintain a 6-month window to contest internal moderation decisions."}
                  </li>
                  <li>
                    <strong>{isEs ? "Nivel 2 • Organismos Extrajudiciales Certificados (Art. 21 DSA):" : "Tier 2 • Certified Out-of-Court Dispute Bodies (Art. 21 DSA):"}</strong>{" "}
                    {isEs
                      ? "Bajo el Artículo 21 del Reglamento de Servicios Digitales (DSA), los creadores y miembros tienen derecho a acudir a cualquier organismo de resolución extrajudicial de litigios certificado por el Coordinador de Servicios Digitales competente (en España, la Comisión Nacional de los Mercados y la Competencia - CNMC) para resolver disputas sobre contenidos o bloqueos de cuenta."
                      : "Under Article 21 of the EU Digital Services Act, creators and members are legally entitled to select any certified out-of-court dispute settlement body certified by the competent Digital Services Coordinator (in Spain, the CNMC) to resolve moderation disputes."}
                  </li>
                  <li>
                    <strong>{isEs ? "Nivel 3 • Plataforma de Litigios en Línea de la UE (ODR):" : "Tier 3 • European Online Dispute Resolution (ODR Platform):"}</strong>{" "}
                    {isEs
                      ? "Para controversias de consumo transfronterizas relativas a compras de tokens o suscripciones, la Comisión Europea facilita una plataforma de resolución en línea accesible en: https://ec.europa.eu/consumers/odr."
                      : "For cross-border consumer disputes regarding digital tokens or subscriptions, the European Commission provides an Online Dispute Resolution platform at: https://ec.europa.eu/consumers/odr."}
                  </li>
                  <li>
                    <strong>{isEs ? "Nivel 4 • Arbitraje de Consumo de España y Jurisdicción:" : "Tier 4 • Spanish Consumer Arbitration & Jurisdiction:"}</strong>{" "}
                    {isEs
                      ? "Para consumidores residentes en España, las controversias no resueltas podrán someterse a la Junta Arbitral de Consumo correspondiente. Para litigios mercantiles con empresas o profesionales, las partes se someten a la jurisdicción exclusiva de los Juzgados y Tribunales de la ciudad de Alicante, España."
                      : "Spanish consumers may refer unresolved consumer claims to the relevant Regional Consumer Arbitration Board (Junta Arbitral de Consumo). For commercial contracts with business creators, disputes are submitted to the exclusive jurisdiction of the Courts of Alicante, Spain."}
                  </li>
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
