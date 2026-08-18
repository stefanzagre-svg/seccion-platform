"use client";

import PublicFooter from "@/components/PublicFooter";
import React from "react";
import Link from "next/link";
import PublicNavbar from "@/components/PublicNavbar";
import { useTranslation } from "@/context/LanguageContext";
import { ArrowLeft, Scale, Shield, Landmark, Globe, FileText, Bot, AlertTriangle, Eye, ShieldAlert, BadgePercent } from "lucide-react";

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

export default function CreatorHubPage() {
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
            {locale === "es" ? "Centro de Creadores y Contrato" : "Creator Hub & Contract Terms"}
          </h1>
          <p className="text-xs sm:text-sm text-[#b9cac9] max-w-xl">
            {locale === "es" ? "Acuerdo de contratista independiente, directrices 2257, reparto 80/20 y herramientas de monetización." : "Independent contractor agreement, 2257 guidelines, 80/20 net split, and creator monetization tools."}
          </p>
          <div className="p-3 bg-white/[0.03] border border-white/10 rounded-xl text-left text-[11px] text-[#b9cac9] font-mono space-y-1">
            <div className="text-white font-bold uppercase tracking-wider flex items-center gap-1.5">
              <span>📜</span> {locale === "es" ? "ENTIDAD CONTRATANTE & CUSTODIA 2257" : "CONTRACTING ENTITY & 2257 CUSTODIAN"}: <span className="text-[#00fbfb]">SECCION AI CONCEPT S.L.</span>
            </div>
            <div className="text-[10px] text-white/60">
              📍 Calle Ingeniero Canales 4, Oficina 1B, 03013 Alicante, España (Spain) · Creator Desk: <a href="mailto:creators@seccion.ai" className="text-[#00fbfb] underline">creators@seccion.ai</a>
            </div>
          </div>
        </div>

        <DoubleBezelCard>
          <div className="space-y-10 text-left text-xs font-medium leading-relaxed text-[#b9cac9] font-sans">
            
            {/* Section 1: Age verification & KYC Gates */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-white uppercase font-mono text-sm font-bold">
                <ShieldAlert className="w-5 h-5 text-[#00fbfb]" />
                <h3>{locale === "es" ? "1. Verificación de Edad y Accesos KYC" : "1. Age Verification & KYC Gates"}</h3>
              </div>
              <div className="p-4 bg-white/[0.02] border-l-2 border-[#00fbfb] rounded-r-xl space-y-1">
                <span className="text-[9px] font-mono font-bold text-[#00fbfb] uppercase tracking-wider block">{locale === "es" ? "🔮 Traducción Mágica (TL;DR)" : "🔮 Magic Translation (TL;DR)"}</span>
                <p className="text-[10.5px] italic text-[#b9cac9]">
                  {locale === "es" ? "Tolerancia cero con menores. Debes tener +18 para ver o publicar. Si eres creador/a, debes superar las pruebas biométricas de vida SnapSign y subir un documento de identidad oficial válido antes de compartir publicaciones, iniciar transmisiones en vivo o recibir propinas." : "Zero minor tolerance. You must be 18+ to view or post. If you're a creator, you must clear SnapSign liveness checks and upload a valid government ID before you can share posts, launch live streams, or receive tips."}
                </p>
              </div>
              <div className="space-y-2">
                <span className="text-[9px] font-mono text-white/30 uppercase font-bold block">{locale === "es" ? "⚖️ Términos Legales" : "⚖️ Legal Terms"}</span>
                <p>
                  {locale === "es" ? "La Plataforma mantiene un estricto sistema de control para evitar que menores accedan o publiquen contenido. Antes de publicar contenido, iniciar streams en vivo o habilitar funciones de monetización (suscripciones, propinas, objetivos), los creadores deben completar el **KYC Nivel 3**. Esto requiere:" : "The Platform maintains a strict gating system to prevent minors from accessing or publishing content. Before publishing content, launching live streams, or enabling monetization features (subscriptions, tips, goals), creators must complete **KYC Tier 3**. This requires:"}
                </p>
                <ul className="list-disc pl-4 space-y-1">
                  <li>{locale === "es" ? "**Verificación de ID**: Subir un escaneo claro y vigente de un documento de identidad oficial con foto." : "**ID Verification**: Submit a clear, unexpired scan of a government-issued photo ID."}</li>
                  <li>{locale === "es" ? "**Selfie con ID en mano**: Tomarse una selfie sosteniendo el documento de identidad junto al rostro para demostrar la titularidad de la identidad." : "**Liveness holding Selfie**: Take a selfie holding your government ID next to your face to prove identity ownership."}</li>
                  <li>{locale === "es" ? "**Acuerdo de Cesión de Imagen**: Firmar el Acuerdo Digital de Cesión de Derechos de Imagen (mediante SnapSign) confirmando tu participación voluntaria y consentimiento comercial." : "**Model Release**: Sign the digital Model Release Agreement (using SnapSign) confirming your voluntary participation and commercial consent."}</li>
                  <li>{locale === "es" ? "**Filtro de Sanciones y Listas de Vigilancia**: Todos los creadores se someten a un escaneo automatizado contra registros internacionales (incluyendo listas de la OFAC de EE. UU., UE y RU). Está prohibido el registro de personas bloqueadas/sancionadas o residentes en territorios embargados." : "**Sanctions & Watchlist Screening**: All creators undergo automated screening against international registers (including US OFAC, EU, and UK watchlists). Onboarding is prohibited for blocked/sanctioned individuals or residents of embargoed territories."}</li>
                  <li>{locale === "es" ? "**Conservación de Registros**: Toda la documentación de identidad se almacena de forma cifrada y segura durante el tiempo de operación de la plataforma más 5 años adicionales." : "**Life of Records**: All identity documentation is encrypted and stored securely for the duration of platform operations plus an additional 5 years."}</li>
                </ul>
              </div>
            </div>

            {/* Section 2: Revenue splits and tax setup */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-white uppercase font-mono text-sm font-bold">
                <BadgePercent className="w-5 h-5 text-[#ffabf3]" />
                <h3>{locale === "es" ? "2. Reparto de Ingresos Netos 80/20 y Declaración Fiscal" : "2. 80/20 Net Revenue Split & Tax Reporting"}</h3>
              </div>
              <div className="p-4 bg-white/[0.02] border-l-2 border-[#ffabf3] rounded-r-xl space-y-1">
                <span className="text-[9px] font-mono font-bold text-[#ffabf3] uppercase tracking-wider block">{locale === "es" ? "🔮 Traducción Mágica (TL;DR)" : "🔮 Magic Translation (TL;DR)"}</span>
                <p className="text-[10.5px] italic text-[#b9cac9]">
                  {locale === "es" ? "Los creadores reciben el **80% de los Ingresos Netos** (Ingresos Brutos menos comisiones de procesamiento bancario). SECCION retiene el 20% de los Ingresos Netos, garantizando un margen operativo neto de plataforma del 15% al 18%. Gestionamos la distribución automática de pagos y reportamos ganancias bajo las normativas DAC7 y el formulario 1099 del IRS." : "Creators receive **80% of Net Revenue** (Gross Revenue minus credit card processing fees). SECCION retains 20% of Net Revenue, guaranteeing a 15%–18% net platform operating margin. We handle automatic payout distribution and report earnings under DAC7 and IRS 1099 guidelines."}
                </p>
              </div>
              <div className="space-y-2">
                <span className="text-[9px] font-mono text-white/30 uppercase font-bold block">{locale === "es" ? "⚖️ Términos Legales" : "⚖️ Legal Terms"}</span>
                <p>
                  {locale === "es" ? "Los creadores en SECCION retienen el **80% de los Ingresos Netos** de suscripciones, propinas y pedidos personalizados de escrow. Los Ingresos Netos se definen como los Pagos Brutos del Cliente menos las tarifas bancarias de procesamiento de terceros (comisiones de transacción con tarjeta de crédito Segpay / CCBill y reservas de contracargo)." : "Creators on SECCION retain **80% of Net Revenue** on subscriptions, tips, and custom escrow orders. Net Revenue is defined as Gross Customer Payments minus third-party payment processing fees (Segpay / CCBill credit card transaction fees & chargeback reserves)."}
                </p>
                <ul className="list-disc pl-4 space-y-1">
                  <li>{locale === "es" ? "**Fórmula de Pago de Ingresos Netos**: Pago al Creador = 80% × (Ingresos Brutos - Comisiones de Procesamiento de Pago). SECCION retiene el 20% de los Ingresos Netos, manteniendo un margen neto garantizado del 15% al 18%." : "**Net Revenue Payout Formula**: Creator Payout = 80% × (Gross Revenue - Payment Processing Fees). SECCION retains 20% of Net Revenue, maintaining a guaranteed 15%–18% net margin."}</li>
                  <li>{locale === "es" ? "**Identificación y Declaración Fiscal**: Los creadores son los únicos responsables de declarar y pagar todos los impuestos aplicables. En cumplimiento con la Directiva europea **DAC7** y las normativas del IRS de EE. UU., la Plataforma recopilará y verificará tu Número de Identificación Fiscal (NIF/TIN) y datos de IVA." : "**Tax Identification & Reporting**: Creators are solely responsible for reporting and paying all applicable taxes. In compliance with the **EU DAC7 Directive** and U.S. IRS regulations, the Platform will collect and verify your Tax Identification Number (TIN) and VAT details."}</li>
                  <li>{locale === "es" ? "**Reporte ante Autoridades**: La Plataforma está obligada legalmente a reportar anualmente las transacciones y pagos de los creadores ante la Agencia Tributaria española (AEAT) y el IRS de EE. UU. (mediante el Formulario **1099**-NEC)." : "**Reporting to Authorities**: The Platform is legally mandated to report creator transactions and payouts annually to the Spanish tax authorities and the IRS (via Form **1099**-NEC)."}</li>
                  <li>{locale === "es" ? "**Registro CNMC y Transparencia**: En cumplimiento con la Ley General de Comunicación Audiovisual (Reforma 2025) de España, la Plataforma está inscrita en el Registro Estatal de Prestadores del Servicio de Comunicación Audiovisual. Divulgamos nuestras estructuras de Titularidad Real (UBO) y declaramos los ingresos publicitarios." : "**CNMC Registration & Transparency**: In compliance with Spain's **General Law on Audiovisual and Media Communication (2025 Reform)**, the Platform is registered in the National Registry for Media Service Providers. We disclose our Ultimate Beneficial Ownership (UBO) structures and declare advertising revenue."}</li>
                </ul>
              </div>
            </div>

            {/* Section 3: Co-Performer Verification & 2257 Rules */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-white uppercase font-mono text-sm font-bold">
                <Scale className="w-5 h-5 text-emerald-400" />
                <h3>{locale === "es" ? "3. Verificación de Co-Intérpretes y Normas 2257" : "3. Co-Performer Verification & 2257 Rules"}</h3>
              </div>
              <div className="p-4 bg-white/[0.02] border-l-2 border-emerald-400 rounded-r-xl space-y-1">
                <span className="text-[9px] font-mono font-bold text-emerald-400 uppercase tracking-wider block">{locale === "es" ? "🔮 Traducción Mágica (TL;DR)" : "🔮 Magic Translation (TL;DR)"}</span>
                <p className="text-[10.5px] italic text-[#b9cac9]">
                  {locale === "es" ? "Si grabas contenido con una pareja o colaborador/a, también deben estar verificados. Sin excepciones. Exigimos un documento de identidad y una selfie con el ID en mano de cada co-intérprete antes de que publiques el contenido. Las apariciones de terceros no verificados provocarán el bloqueo de tu cuenta." : "If you film with a partner, they must be verified too. No exceptions. We require a government ID and a selfie holding that ID for every single co-performer before you post the content. Unverified background appearances will trigger a ban."}
                </p>
              </div>
              <div className="space-y-2">
                <span className="text-[9px] font-mono text-white/30 uppercase font-bold block">{locale === "es" ? "⚖️ Términos Legales" : "⚖️ Legal Terms"}</span>
                <p>
                  {locale === "es" ? "Para proteger las pasarelas de pago y cumplir con 18 U.S.C. § 2257 de EE. UU.:" : "To protect payment rails and comply with U.S. 18 U.S.C. § 2257:"}
                </p>
                <ul className="list-disc pl-4 space-y-1">
                  <li>{locale === "es" ? "**KYC de Co-Intérpretes**: El contenido explícito en colaboración o con co-intérpretes no se puede subir a menos que todos los participantes sean miembros verificados de la Plataforma y estén etiquetados en la publicación." : "**Co-Performer KYC**: Collaborative or co-performed explicit content cannot be uploaded unless all participants are verified members of the Platform and tagged in the post."}</li>
                  <li>{locale === "es" ? "**Selfie con ID en mano**: Los creadores deben obtener una identificación con foto oficial y una selfie de vida del co-intérprete sosteniendo su documento." : "**Selfie Holding ID**: Creators must collect a government photo ID and a liveness selfie of the co-performer holding their ID."}</li>
                  <li>{locale === "es" ? "**Auditoría de Fondo**: Asegúrate de que no aparezcan menores ni personas no verificadas en el fondo de ningún contenido subido. La presencia de transeúntes no verificados es causa directa para la suspensión permanente de la cuenta." : "**Background Auditing**: Ensure that no unverified or minor individuals appear in the background of any uploaded content. The presence of unverified bystanders is a primary trigger for permanent account suspension."}</li>
                </ul>
              </div>
            </div>

            {/* Section 4: Content watermarking and copyright tools */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-white uppercase font-mono text-sm font-bold">
                <Globe className="w-5 h-5 text-[#00fbfb]" />
                <h3>{locale === "es" ? "4. Protección Anti-Piratería y Marca de Agua Digital" : "4. Anti-Piracy & Content Watermarking"}</h3>
              </div>
              <div className="p-4 bg-white/[0.02] border-l-2 border-[#00fbfb] rounded-r-xl space-y-1">
                <span className="text-[9px] font-mono font-bold text-[#00fbfb] uppercase tracking-wider block">{locale === "es" ? "🔮 Traducción Mágica (TL;DR)" : "🔮 Magic Translation (TL;DR)"}</span>
                <p className="text-[10.5px] italic text-[#b9cac9]">
                  {locale === "es" ? "Protegemos tu contenido utilizando marcas visibles y firmas esteganográficas invisibles incrustadas en secreto en los archivos. Si alguien filtra tu trabajo, localizamos su cuenta de suscriptor y emitimos solicitudes automáticas de retiro DMCA a los motores de búsqueda de inmediato." : "We protect your content using visible tags and invisible steganographic signatures embedded secretly into media. If someone leaks your work, we locate their subscriber account and issue automated DMCA takedowns to search engines immediately."}
                </p>
              </div>
              <div className="space-y-2">
                <span className="text-[9px] font-mono text-white/30 uppercase font-bold block">{locale === "es" ? "⚖️ Términos Legales" : "⚖️ Legal Terms"}</span>
                <p>
                  {locale === "es" ? "SECCION equipa a los creadores con herramientas avanzadas para salvaguardar su presencia digital:" : "SECCION equips creators with advanced resources to safeguard their digital presence:"}
                </p>
                <ul className="list-disc pl-4 space-y-1">
                  <li>{locale === "es" ? "**Marcas de Agua Visibles**: La Plataforma superpone tu nombre de usuario o nombre artístico en imágenes y videos." : "**Visible Watermarks**: The Platform overlays your username or stage name onto images and videos."}</li>
                  <li>{locale === "es" ? "**Marcas de Agua Esteganográficas Invisibles**: Se incrustan en secreto datos de rastreo invisibles y avanzados en los archivos multimedia, lo que nos permite identificar al suscriptor responsable en caso de filtración." : "**Invisible Steganographic Watermarks**: Advanced invisible tracking data is secretly embedded into media files, allowing us to identify the specific subscriber account responsible in the event of a leak."}</li>
                  <li>{locale === "es" ? "**Retiros DMCA**: SECCION ofrece herramientas automatizadas para generar y enviar avisos de retiro por infracción de derechos de autor (DMCA) a servidores de terceros o motores de búsqueda que alojen material robado." : "**DMCA Takedowns**: SECCION provides automated tools to generate and issue Digital Millennium Copyright Act (DMCA) takedown notices to third-party hosts or search engines hosting stolen media."}</li>
                </ul>
              </div>
            </div>

            {/* Section 5: Creator Operations AI Assistant & privacy tools */}
            <div className="space-y-4 border-t border-white/5 pt-8">
              <div className="flex items-center gap-2 text-white uppercase font-mono text-sm font-bold">
                <Bot className="w-5 h-5 text-emerald-400" />
                <h3>{locale === "es" ? "5. Suite IA de Respaldo y Herramientas de Seguridad" : "5. Creator Back-Office AI Suite & Safety Tools"}</h3>
              </div>
              <div className="space-y-2">
                <p>
                  {locale === "es" ? "Para dejar atrás a las agencias de representación abusivas, SECCION ofrece herramientas automatizadas y filtros de privacidad:" : "To render exploitative talent agencies obsolete, SECCION provides automated tools and privacy filters:"}
                </p>
                <ul className="list-disc pl-4 space-y-2">
                  <li>{locale === "es" ? "**Copiloto de Contratos**: Nuestro escáner legal integrado revisa contratos de marcas y acuerdos de agencias, detectando cláusulas abusivas como retención de imagen o pérdida de propiedad intelectual exclusiva." : "**Contract Copilot**: Our built-in legal scanner reviews brand contracts and agency agreements, flagging predatory terms such as likeness lock-in clauses or exclusive IP forfeitures."}</li>
                  <li>{locale === "es" ? "**Asistente de Operaciones**: El asistente IA te ayuda a gestionar solicitudes de reservas personalizadas, programar transmisiones, escribir descripciones atractivas y traducir mensajes de chat (texto y notas de voz) en tiempo real." : "**Operations Assistant**: AI assistant helps you manage custom booking requests, schedule streams, write description teasers, and translate chat messages (text and speech note translation) in real-time."}</li>
                  <li>{locale === "es" ? "**Filtros de Geocerca y Bloqueo**: Protege tu identidad local bloqueando países, estados o ciudades específicas, evitando que perfiles de esas regiones vean tus streams, álbumes o tarjetas de match." : "**Geofencing & Blocking Filters**: Protect your local identity by geofencing specific countries, states, or cities, preventing profiles in those regions from seeing your streams, content albums, or matching cards."}</li>
                  <li>{locale === "es" ? "**Seguridad Bancaria y Apartado Postal**: Se recomienda encarecidamente a los creadores utilizar un nombre artístico distintivo, un Apartado Postal (PO Box) y una cuenta bancaria comercial dedicada para su registro fiscal y comercial." : "**Creator Safety PO Box**: Creators are strongly advised to use a distinct stage name, PO Box, and dedicated business bank account for tax/business registration."}</li>
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
