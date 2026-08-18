"use client";

import PublicFooter from "@/components/PublicFooter";
import React from "react";
import Link from "next/link";
import PublicNavbar from "@/components/PublicNavbar";
import { useTranslation } from "@/context/LanguageContext";
import { ArrowLeft, Shield, Eye, Lock, RefreshCw, HelpCircle, Users, Activity } from "lucide-react";

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

export default function PrivacyPage() {
  const { locale } = useTranslation();
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
      <div className="relative z-10 pt-36 px-6 md:px-[84px] max-w-[840px] mx-auto w-full flex-grow">
        
        {/* Back Link */}
        <Link href="/" className="inline-flex items-center gap-2 text-xs font-mono font-bold text-white/40 hover:text-[#00fbfb] transition mb-8 group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>{locale === "es" ? "Volver al Inicio" : "Back to Home"}</span>
        </Link>

        {/* Title */}
        <div className="text-left space-y-3 mb-12">
          <h1 className="font-display text-4xl md:text-5xl font-black text-white tracking-tight uppercase leading-none font-['Outfit']">
            {locale === "es" ? "Política de Privacidad" : "Privacy Policy"}
          </h1>
          <p className="text-xs sm:text-sm text-[#b9cac9] max-w-xl">
            {locale === "es" ? "Protegemos tus datos personales, rostro y preferencias con altos estándares de seguridad y RGPD." : "We protect your personal data, face, and preferences with high security and GDPR standards."}
          </p>
          <div className="p-3 bg-white/[0.03] border border-white/10 rounded-xl text-left text-[11px] text-[#b9cac9] font-mono space-y-1">
            <div className="text-white font-bold uppercase tracking-wider flex items-center gap-1.5">
              <span>🛡️</span> {locale === "es" ? "RESPONSABLE DEL TRATAMIENTO (DATA CONTROLLER)" : "DATA CONTROLLER"}: <span className="text-[#00fbfb]">SECCION AI CONCEPT S.L.</span>
            </div>
            <div className="text-[10px] text-white/60">
              Data Protection Officer (DPO): <a href="mailto:dpo@seccion.ai" className="text-[#00fbfb] underline">dpo@seccion.ai</a>
            </div>
          </div>
          <div className="p-3 bg-[#ffabf3]/5 border border-[#ffabf3]/20 rounded-xl text-left text-[10px] text-[#ffabf3]">
            💡 **{locale === "es" ? "ESTÁNDARES LEGALES Y MONETIZACIÓN" : "LEGAL STANDARDS & MONETIZATION"}**: {locale === "es" ? "Términos, directrices legales y herramientas de monetización para creadores en SECCION." : "Terms, legal guidelines, and monetization tools for creators on SECCION."} <Link href="/creator-hub" className="underline font-bold">[{locale === "es" ? "Centro de Creadores" : "Creator Hub"}]</Link>
          </div>
        </div>

        <DoubleBezelCard>
          <div className="space-y-10 text-left text-xs font-medium leading-relaxed text-[#b9cac9] font-sans">
            
            {/* Section 1 */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-white uppercase font-mono text-sm font-bold">
                <Eye className="w-5 h-5 text-[#00fbfb]" />
                <h3>{locale === "es" ? "1. Recopilación de Datos Sensibles y Consentimiento Explícito" : "1. Sensitive Data Collection & Explicit Opt-In"}</h3>
              </div>
              <div className="p-4 bg-white/[0.02] border-l-2 border-[#00fbfb] rounded-r-xl space-y-1">
                <span className="text-[9px] font-mono font-bold text-[#00fbfb] uppercase tracking-wider block">{locale === "es" ? "🔮 Traducción Mágica (TL;DR)" : "🔮 Magic Translation (TL;DR)"}</span>
                <p className="text-[10.5px] italic text-[#b9cac9]">
                  {locale === "es" ? "Recopilamos detalles sobre quién eres, qué te gusta y tu ubicación para potenciar el matchmaking y las interacciones con creadores. Nunca procesaremos esto sin tu consentimiento claro y activo. Sin casillas marcadas por defecto, sin términos ocultos. Tú tienes el control de tu vibe." : "We collect details about who you are, what you like, and your location to power our matchmaking and creator interactions. We will never process this without your clear, active opt-in. No pre-ticked boxes, no hidden terms. You are in control of your vibes."}
                </p>
              </div>
              <div className="space-y-2">
                <span className="text-[9px] font-mono text-white/30 uppercase font-bold block">{locale === "es" ? "⚖️ Términos Legales" : "⚖️ Legal Terms"}</span>
                <p>
                  {locale === "es" ? "La Plataforma procesa datos personales sensibles, incluyendo orientación sexual, preferencias de relación, datos de ubicación y registros de comunicación. De acuerdo con el Artículo 9 del RGPD, el tratamiento de estos datos de 'categoría especial' requiere tu consentimiento explícito, libre, específico, informado e inequívoco." : "The Platform processes sensitive personal data, including sexual orientation, relationship preferences, location data, and communication records. In accordance with Article 9 of the GDPR, the processing of this \"special category\" data requires your explicit, freely given, specific, informed, and unambiguous consent."}
                </p>
                <ul className="list-disc pl-4 space-y-1">
                  <li>{locale === "es" ? "**Mecanismo**: Debes completar una casilla de verificación manual y no marcada previamente durante el registro." : "**Mechanism**: You must complete a manual, unticked opt-in checkbox during onboarding."}</li>
                  <li>{locale === "es" ? "**Registros de Consentimiento**: Mantenemos registros seguros y auditables de las marcas de tiempo y parámetros de tu consentimiento para cumplir con los requisitos de la AEPD (Agencia Española de Protección de Datos)." : "**Consent Records**: We maintain secure, auditable logs of your consent timestamps and parameters to comply with AEPD (Agencia Española de Protección de Datos) requirements."}</li>
                  <li>{locale === "es" ? "**Derecho de Retirada**: Tienes derecho a retirar tu consentimiento en cualquier momento, lo cual puede gestionarse desde la Configuración de tu Cuenta o solicitando la eliminación de la misma." : "**Right to Withdraw**: You have the right to withdraw your consent at any time, which can be done via your Account Settings or by requesting account deletion."}</li>
                </ul>
              </div>
            </div>

            {/* Section 2 */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-white uppercase font-mono text-sm font-bold">
                <Shield className="w-5 h-5 text-[#ffabf3]" />
                <h3>{locale === "es" ? "2. Datos Biométricos y Verificación de Edad" : "2. Biometric Data & Age Verification"}</h3>
              </div>
              <div className="p-4 bg-white/[0.02] border-l-2 border-[#ffabf3] rounded-r-xl space-y-1">
                <span className="text-[9px] font-mono font-bold text-[#ffabf3] uppercase tracking-wider block">{locale === "es" ? "🔮 Traducción Mágica (TL;DR)" : "🔮 Magic Translation (TL;DR)"}</span>
                <p className="text-[10.5px] italic text-[#b9cac9]">
                  {locale === "es" ? "Para mantener la comunidad segura, real y +18, usamos una verificación rápida con selfie. La IA estima tu edad desde una foto en vivo e inmediatamente la elimina. Si eres miembro, no almacenamos tu documento de identidad en nuestros servidores. Las coincidencias biométricas mantienen a los estafadores y bots fuera del Modo Co-Op." : "To keep the community safe, real, and 18+, we use a quick selfie check. AI estimates your age from a live snap and immediately deletes it. If you're a member, we do not store your government ID on our servers. Biometric template matches keep catfish and bots out of Co-Op Mode."}
                </p>
              </div>
              <div className="space-y-2">
                <span className="text-[9px] font-mono text-white/30 uppercase font-bold block">{locale === "es" ? "⚖️ Términos Legales" : "⚖️ Legal Terms"}</span>
                <p>
                  {locale === "es" ? "Los datos biométricos (ej., plantillas faciales extraídas de selfies de verificación) están clasificados como datos de categoría especial bajo el RGPD." : "Biometric data (e.g., facial templates extracted from verification selfies) is classified as special category data under the GDPR."}
                </p>
                <ul className="list-disc pl-4 space-y-1">
                  <li>{locale === "es" ? "**Estimación de Edad**: Durante el registro, los usuarios suben una selfie en vivo verificada con prueba de vida. Una IA de terceros estima la elegibilidad (+18). La imagen se procesa en memoria y se **elimina de inmediato** (en un plazo de 5 segundos) tras completar la estimación (Minimización de Datos)." : "**Age Estimation**: During onboarding, users upload a live liveness-verified selfie. Third-party age estimation AI estimates eligibility (18+). The selfie image is processed in memory and **deleted immediately** (within 5 seconds) after the age estimation is complete (Data Minimization)."}</li>
                  <li>{locale === "es" ? "**Verificación de Perfil Anti-Catfish**: La Plataforma compara la plantilla biométrica de tu selfie en vivo con tus fotos de perfil subidas mediante reconocimiento facial. Las plantillas faciales matemáticas se almacenan en una base de datos encriptada y se eliminan de inmediato al cerrar la cuenta." : "**Anti-Catfishing Profile Verification**: The Platform compares the biometric template of your liveness selfie against your uploaded profile photos using facial matching. The mathematical facial templates are stored in an encrypted database and are deleted immediately upon account termination."}</li>
                  <li>{locale === "es" ? "**Consentimiento Biométrico**: Es obligatoria una casilla de consentimiento explícito y dedicado antes de iniciar los escaneos biométricos." : "**Biometric Consent**: A dedicated, explicit consent checkbox is mandatory before biometric scans are initiated."}</li>
                </ul>
              </div>
            </div>

            {/* Section 3 */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-white uppercase font-mono text-sm font-bold">
                <Activity className="w-5 h-5 text-[#00fbfb]" />
                <h3>{locale === "es" ? "3. Toma de Decisiones Automatizada y Sistemas de Recomendación" : "3. Automated Decision-Making & Recommender Systems"}</h3>
              </div>
              <div className="p-4 bg-white/[0.02] border-l-2 border-[#00fbfb] rounded-r-xl space-y-1">
                <span className="text-[9px] font-mono font-bold text-[#00fbfb] uppercase tracking-wider block">{locale === "es" ? "🔮 Traducción Mágica (TL;DR)" : "🔮 Magic Translation (TL;DR)"}</span>
                <p className="text-[10.5px] italic text-[#b9cac9]">
                  {locale === "es" ? "Nuestro Motor de Sinergia ejecuta algoritmos de matching basados en química de arquetipos, ubicación y sincronía de estilo de vida para sugerir conexiones. Internamente esto es automatizado, pero siempre tienes el derecho de impugnar el algoritmo o solicitar que un moderador humano lo revise." : "Our Synergy Engine runs matching algorithms based on archetype chemistry, location, and lifestyle sync to suggest connection cards. Under the hood, this is automated, but you always have the right to challenge the algorithm or request a human coach to review it."}
                </p>
              </div>
              <div className="space-y-2">
                <span className="text-[9px] font-mono text-white/30 uppercase font-bold block">{locale === "es" ? "⚖️ Términos Legales" : "⚖️ Legal Terms"}</span>
                <p>
                  {locale === "es" ? "Bajo el Artículo 22 del RGPD y el Artículo 27 de la DSA, informamos sobre el uso de perfiles automatizados y emparejamiento:" : "Under Article 22 of the GDPR and Article 27 of the DSA, we disclose the use of automated profiling and matchmaking:"}
                </p>
                <ul className="list-disc pl-4 space-y-1">
                  <li>{locale === "es" ? "**El Algoritmo de Sinergia**: Los matches se calculan usando preferencias de estilo de vida, alineación de arquetipos y proximidad geográfica. Estas puntuaciones determinan la visibilidad y clasificación del perfil." : "**The Synergy Algorithm**: Matches are calculated using lifestyle preferences, archetype alignment, and location proximity. These scores determine profile visibility and ranking."}</li>
                  <li>{locale === "es" ? "**Transparencia**: Proporcionamos explicaciones claras de la lógica de emparejamiento si se solicitan." : "**Transparency**: We provide clear explanations of the matching logic upon request."}</li>
                  <li>{locale === "es" ? "**Intervención Humana**: Los usuarios tienen el derecho legal de impugnar decisiones automatizadas (como calificaciones de compatibilidad o alertas automáticas de seguridad) y solicitar una revisión manual por un moderador humano." : "**Human Intervention**: Users have a legal right to challenge automated decisions (such as compatibility ratings or automated safety flags) and request a manual review by a human moderator."}</li>
                </ul>
              </div>
            </div>

            {/* Section 4 */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-white uppercase font-mono text-sm font-bold">
                <Lock className="w-5 h-5 text-[#ffabf3]" />
                <h3>{locale === "es" ? "4. Seguridad Técnica y Notificación de Brechas de Datos" : "4. Technical Security & Data Breach Notifications"}</h3>
              </div>
              <div className="p-4 bg-white/[0.02] border-l-2 border-[#ffabf3] rounded-r-xl space-y-1">
                <span className="text-[9px] font-mono font-bold text-[#ffabf3] uppercase tracking-wider block">{locale === "es" ? "🔮 Traducción Mágica (TL;DR)" : "🔮 Magic Translation (TL;DR)"}</span>
                <p className="text-[10.5px] italic text-[#b9cac9]">
                  {locale === "es" ? "Encriptamos tus datos en reposo y en tránsito, usando estrictas reglas de acceso para proteger la información sensible. Si ocurriera una fuga de datos, notificaremos a la AEPD española y a ti en un plazo de 72 horas con todos los detalles y pasos a seguir." : "We encrypt your data at rest and in transit, using strict access rules to lock down sensitive information. If a data leak ever happens, we will notify the Spanish AEPD and you within 72 hours with full details and next steps."}
                </p>
              </div>
              <div className="space-y-2">
                <span className="text-[9px] font-mono text-white/30 uppercase font-bold block">{locale === "es" ? "⚖️ Términos Legales" : "⚖️ Legal Terms"}</span>
                <p>
                  {locale === "es" ? "Implementamos sólidas Medidas Técnicas y Organizativas (MTO) para proteger tus datos:" : "We implement robust Technical and Organizational Measures (TOMs) to secure your data:"}
                </p>
                <ul className="list-disc pl-4 space-y-1">
                  <li>{locale === "es" ? "**Encriptación**: Todos los datos personales y de comportamiento se encriptan en tránsito mediante TLS 1.3 y en reposo mediante cifrado AES-256." : "**Encryption**: All personal and behavioral data is encrypted in transit using TLS 1.3 and at rest using AES-256 encryption."}</li>
                  <li>{locale === "es" ? "**Control de Acceso**: Aplicamos el principio de privilegio mínimo, exigiendo autenticación multifactor (MFA) para todo acceso administrativo." : "**Access Control**: We enforce the principle of least privilege, requiring multi-factor authentication (MFA) for all administrative access."}</li>
                  <li>{locale === "es" ? "**Protocolos de Brecha de Datos**: En caso de una brecha de seguridad física o técnica, notificaremos a la Autoridad de Control Española (AEPD) en un plazo de **72 horas** desde su detección. Si la brecha supone un alto riesgo para la privacidad o seguridad de los usuarios, notificaremos a los afectados directamente y sin demoras indebidas." : "**Data Breach Protocols**: In the event of a physical or technical data breach, we will notify the Spanish Supervisory Authority (AEPD) within **72 hours** of discovery. If the breach poses a high risk to user privacy or safety, we will notify the affected individuals directly and without undue delay."}</li>
                </ul>
              </div>
            </div>

            {/* Section 5: Platform Guidance Additions */}
            <div className="space-y-4 border-t border-white/5 pt-8">
              <div className="flex items-center gap-2 text-white uppercase font-mono text-sm font-bold">
                <Users className="w-5 h-5 text-emerald-400" />
                <h3>{locale === "es" ? "5. Verificación de Miembros y Estándares EU Wallet" : "5. Member Verification & EU Wallet Standards"}</h3>
              </div>
              <div className="space-y-2">
                <p>
                  {locale === "es" ? "Implementamos una verificación de edad centrada en la privacidad que confirma que tienes 18 años o más sin almacenar tu información de identificación personal (PII):" : "We implement a privacy-centric age check that confirms you are 18 or older without storing your personally identifiable information (PII):"}
                </p>
                <ul className="list-disc pl-4 space-y-2">
                  <li>{locale === "es" ? "**Pruebas de Conocimiento Cero (ZKP)**: Nos integramos con proveedores de identidad acreditados que apoyan el modelo de verificación de edad de código abierto de la Comisión Europea." : "**Zero-Knowledge Proofs (ZKP)**: We integrate with accredited identity providers supporting the European Commission's open-source age-verification blueprint."}</li>
                  <li>{locale === "es" ? "**Divulgación Selectiva**: El sistema solicita una prueba criptográfica simple (ej. `IsOver18: True`) desde tu Cartera de Identidad Digital de la UE. **No** recibimos ni almacenamos tu nombre, fecha de nacimiento exacta ni dirección." : "**Selective Disclosure**: The system requests a simple cryptographic proof (e.g., `IsOver18: True`) from your EU Digital Identity Wallet. We do **not** receive or store your name, exact date of birth, or address."}</li>
                  <li>{locale === "es" ? "**Seguridad de Contenido Efímero**: Las fotos, videos y notas de voz que desaparecen en el chat se procesan en memoria volátil. Se borran y eliminan de inmediato de nuestra caché activa una vez vistos o tras expirar, garantizando que tus intercambios privados sigan siendo seguros." : "**Ephemeral Media Security**: All disappearing photos, videos, and voice notes shared in chat are processed in volatile memory. They are immediately wiped and deleted from our active cache once viewed or after expiration, ensuring your private exchanges remain secure."}</li>
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
