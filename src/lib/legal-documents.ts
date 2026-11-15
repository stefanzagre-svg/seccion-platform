export type LegalDocId = "terms" | "privacy" | "creator";
export type LegalLocale = "en" | "es" | "fr";

export interface LegalBullet {
  label: string;
  text: string;
}

export type LegalIconKey =
  | "shieldAlert"
  | "creditCard"
  | "scale"
  | "messageCircle"
  | "userCheck"
  | "shieldCheck"
  | "landmark"
  | "eye"
  | "shield"
  | "activity"
  | "lock"
  | "users"
  | "badgePercent"
  | "globe"
  | "bot";

export interface LegalSection {
  id: string;
  accent: "cyan" | "pink" | "emerald";
  iconKey: LegalIconKey;
  title: string;
  tldrTitle?: string;
  tldr?: string;
  legalLabel?: string;
  introParagraphs?: string[];
  bullets?: LegalBullet[];
}

export interface LegalDocumentData {
  id: LegalDocId;
  code: string;
  title: string;
  subtitle: string;
  backToHome: string;
  entityCardTitle: string;
  contactLabel: string;
  contactEmail: string;
  pdfUrl: string;
  pdfFileName: string;
  effectiveDateLabel: string;
  effectiveDate: string;
  version: string;
  sections: LegalSection[];
}

export const LEGAL_ENTITY = {
  name: "SECCION AI CONCEPT S.L.",
  nif: "B05765441",
  registry: "Registro Mercantil de Alicante (Tomo 4486, Hoja A 208743)",
  addressByLocale: {
    en: "Calle Ingeniero Canales 4, Oficina 1B, 03013 Alicante, Spain",
    es: "Calle Ingeniero Canales 4, Oficina 1B, 03013 Alicante, España",
    fr: "Calle Ingeniero Canales 4, Oficina 1B, 03013 Alicante, Espagne",
  },
  website: "https://seccion.ai",
  billingDescriptor: "Seccion Matrix",
  version: "v2.8.4",
  effectiveDate: "2026-11-15",
  emails: {
    legal: "legal@seccion.ai",
    dpo: "dpo@seccion.ai",
    dsa: "dsa-compliance@seccion.ai",
    creators: "creators@seccion.ai",
    support: "support@seccion.ai",
  },
} as const;

export const LEGAL_PDF_FILES: Record<LegalDocId, Record<LegalLocale, string>> = {
  terms: {
    en: "/legal/seccion-terms-of-service-en.pdf",
    es: "/legal/seccion-terms-of-service-es.pdf",
    fr: "/legal/seccion-terms-of-service-fr.pdf",
  },
  privacy: {
    en: "/legal/seccion-privacy-policy-en.pdf",
    es: "/legal/seccion-privacy-policy-es.pdf",
    fr: "/legal/seccion-privacy-policy-fr.pdf",
  },
  creator: {
    en: "/legal/seccion-creator-agreement-en.pdf",
    es: "/legal/seccion-creator-agreement-es.pdf",
    fr: "/legal/seccion-creator-agreement-fr.pdf",
  },
};

export function normalizeLegalLocale(locale?: string): LegalLocale {
  if (locale === "es" || locale === "fr") return locale;
  return "en";
}

const TLDR_TITLE: Record<LegalLocale, string> = {
  en: "🔮 Magic Translation (TL;DR)",
  es: "🔮 Traducción Mágica (TL;DR)",
  fr: "🔮 Traduction Magique (TL;DR)",
};

const TERMS_DOCS: Record<LegalLocale, LegalDocumentData> = {
  en: {
    id: "terms",
    code: "SEC-TOS-2026",
    title: "Terms of Service & Compliance Rules",
    subtitle:
      "Master contractual framework, in-app token conditions, community standards, anti-fraud policies, and statutory dispute resolution of SECCION.",
    backToHome: "Back to Home",
    entityCardTitle: "OPERATING LEGAL ENTITY",
    contactLabel: "Legal & Privacy Desk",
    contactEmail: LEGAL_ENTITY.emails.legal,
    pdfUrl: LEGAL_PDF_FILES.terms.en,
    pdfFileName: "seccion-terms-of-service-en.pdf",
    effectiveDateLabel: "Effective Date",
    effectiveDate: LEGAL_ENTITY.effectiveDate,
    version: LEGAL_ENTITY.version,
    sections: [
      {
        id: "prohibited-content",
        accent: "cyan",
        iconKey: "shieldAlert",
        title: "1. Prohibited Content & Statutory Reporting Standards",
        tldrTitle: TLDR_TITLE.en,
        tldr: "Zero tolerance. We strictly ban non-consensual media, child exploitation, unauthorized deepfakes, scams, and harassment. We immediately and automatically report illegal content to NCMEC and European cybercrime police.",
        legalLabel: "⚖️ Legal Terms & Reporting Obligations",
        introParagraphs: [
          "The following content types and behaviors are strictly prohibited on the Platform, incurring immediate account termination and criminal referral:",
        ],
        bullets: [
          {
            label: "Zero-Tolerance Minor Exploitation (CSAM / NCMEC)",
            text: "The Platform maintains zero tolerance for any content depicting, soliciting, or simulating minors under 18. In strict compliance with 18 U.S.C. § 2258A and Spanish Penal Code Article 189, any CSAM detection results in immediate account freezing and automated telemetry referral to the NCMEC CyberTipline (National Center for Missing & Exploited Children) and European cybercrime law enforcement (Guardia Civil GDT & Policía Nacional UFAM).",
          },
          {
            label: "Non-Consensual Explicit Material & Leaks",
            text: "Uploading or distributing media without verified documented consent of all appearing individuals (cyberflashing, sextortion, or non-consensual sharing) is strictly banned. Any leak of SECCION DRM-protected media triggers permanent ban and civil/criminal statutory damages.",
          },
          {
            label: "Deepfakes, Unauthorized Voice Cloning & AI Act",
            text: "Generating or distributing deepfakes, unauthorized voice cloning, or synthetic defamation is strictly prohibited. In compliance with the EU AI Act (Regulation 2024/1689), authorized synthetic content must carry indelible digital watermarking (SynthID).",
          },
          {
            label: "Notice and Action Mechanism (Article 16 DSA)",
            text: "Any individual or entity may submit a notice of alleged illegal content via our online reporting form or to dsa-compliance@seccion.ai. SECCION issues electronic confirmation of receipt without undue delay and resolves notices within 24 business hours. Accredited Trusted Flaggers (Article 22 DSA) receive immediate prioritized processing.",
          },
        ],
      },
      {
        id: "subscriptions",
        accent: "pink",
        iconKey: "creditCard",
        title: "2. Subscriptions, Cancellations & Digital Refund Waivers",
        tldrTitle: TLDR_TITLE.en,
        tldr: "Cancel subscriptions anytime in 2 clicks with zero dark patterns. For Matrix token purchases, instant delivery into your balance waives the 14-day statutory refund right upon immediate execution of digital content.",
        legalLabel: "⚖️ Consumer Legal Terms",
        bullets: [
          {
            label: "Transparent Auto-Renewal (UK DMCCA 2024 / EU)",
            text: "VIP passes and monthly memberships automatically renew unless cancelled. Electronic reminders are dispatched prior to renewal billing.",
          },
          {
            label: "Simple Two-Click Cancellation",
            text: "Users may cancel recurring subscriptions at any time via a prominent two-click path in Account Settings without penalty, maintaining access through the end of the paid billing period.",
          },
          {
            label: "Digital Goods Waiver of Withdrawal (Directive 2011/83/EU)",
            text: "In accordance with Article 16(m) of EU Directive 2011/83/EU and Spanish Consumer Protection Law (TRLGDCU Art. 103.m), purchasing Matrix Tokens constitutes digital content not supplied on a tangible medium. By purchasing, the member expressly consents to immediate digital performance and acknowledges forfeiture of the statutory 14-day right of withdrawal once tokens are credited to their in-app wallet balance.",
          },
          {
            label: "US State Cancellation Window",
            text: "Where mandated by applicable US state statutes (e.g., California, New York), a 3-day cooling-off cancellation window applies provided tokens remain unburned.",
          },
        ],
      },
      {
        id: "token-economy",
        accent: "emerald",
        iconKey: "scale",
        title: "3. Closed-Loop Matrix Token Economy (MCC 5818), Billing Descriptor & Chargebacks",
        tldrTitle: TLDR_TITLE.en,
        tldr: "Matrix Red Pills are closed-loop virtual in-app utility tokens for platform engagement; they have no cash value and cannot be withdrawn or transferred off-platform. Card statements display 'Seccion Matrix'. Fraudulent chargebacks result in immediate account banning and debt recovery.",
        legalLabel: "⚖️ Token Terms & Financial Firewall",
        bullets: [
          {
            label: "Closed-Loop Digital Goods Classification (MCC 5818)",
            text: "Matrix Tokens (Red Pills 💊 and Blue Pills 💊) represent a limited, revocable, non-transferable license to access interactive features, DRM media unlocks, and live stream tipping on SECCION under Merchant Category Code MCC 5818 (Digital Goods / Entertainment). Tokens possess no cash value, are non-redeemable for fiat by purchasing members, and cannot be transferred outside the platform ecosystem.",
          },
          {
            label: "Statement Billing Descriptor ('Seccion Matrix')",
            text: "All transactions processed via credit card, debit card, or payment gateways will formally appear on cardholder billing statements under the official descriptor 'Seccion Matrix' (or 'SECCION MATRIX'). Cardholders are legally responsible for acknowledging authorized charges under this descriptor.",
          },
          {
            label: "Anti-Friendly Fraud Policy & Visa RDR Deflection",
            text: "The Platform operates automated pre-dispute resolution (Ethoca alerts & Visa Rapid Dispute Resolution - RDR). If an unauthorized transaction is suspected, cardholders must contact support@seccion.ai prior to bank escalation. Filing malicious or unjustified chargebacks constitutes breach of contract and triggers immediate account termination, forfeiture of remaining tokens, and formal debt collection for disputed amounts plus associated scheme dispute fees (€25–€45 per chargeback).",
          },
        ],
      },
      {
        id: "dsa-ai-transparency",
        accent: "cyan",
        iconKey: "messageCircle",
        title: "4. Content Moderation, DSA Compliance & AI Transparency",
        tldrTitle: TLDR_TITLE.en,
        tldr: "Public feeds are 100% clean; sensual content is strictly quarantined behind 18+ token paywalls. If content is moderated, you receive a written Statement of Reasons with a right to human appeal. Creator AI Copilots are always transparently badged.",
        legalLabel: "⚖️ DSA Framework & EU AI Act Governance",
        bullets: [
          {
            label: "SFW / NSFW Isolation & Minor Protection (Art. 28 DSA)",
            text: "SECCION's discovery feed is strictly non-explicit (SFW). Sensitive or adult-oriented creator media is strictly quarantined behind age-verified 18+ Warm Paywalls requiring cryptographic zero-knowledge age verification, eliminating minor exposure or profiling.",
          },
          {
            label: "Statement of Reasons & Human Appeal (Article 17 & Article 20 DSA)",
            text: "Any content removal, account suspension, or monetization lock includes an individualized Statement of Reasons detailing factual and legal grounds. Users hold the right to appeal decisions free of charge for 6 months through our internal complaint-handling system, ensuring review by qualified human moderation officers.",
          },
          {
            label: "AI Transparency & Synthetic Interactions (Art. 50 EU AI Act)",
            text: "In compliance with Article 50 of the EU AI Act (Regulation 2024/1689), members are explicitly notified when interacting with an automated AI conversational agent. Creator Studio Copilots powered by Google Gemini AI are prominently marked with '✨ AI Copilot'.",
          },
        ],
      },
      {
        id: "accessibility-ratings",
        accent: "emerald",
        iconKey: "userCheck",
        title: "5. Date Plans, Trust Ratings & Accessibility (Spanish Law 11/2023)",
        introParagraphs: [
          "The Date Plan module requires genuine relational intent. Cancelling confirmed meetings without justification degrades the member's mutual trust rating on our 20.00 scale.",
          "In strict compliance with Spanish Law 11/2023 (transposing the European Accessibility Act), SECCION’s public interfaces, payment flows, and digital subscription portals conform to EN 301 549 technical standards, achieving WCAG 2.1 Level AA accessibility.",
        ],
      },
      {
        id: "creator-revenue",
        accent: "cyan",
        iconKey: "creditCard",
        title: "6. Creator Revenue (90% Founding Split), 50-50 Fee Share & DAC7 Tax Reporting",
        tldrTitle: TLDR_TITLE.en,
        tldr: "Founding Creators receive 90% net revenue split (80% standard thereafter). Zero-fee rails (Open Banking and USDC Crypto) carry 0% gateway deductions. For credit card payments (~4% toll), the cost is split 50-50 transparently: the member pays +2% at checkout, and the creator absorbs -2% on token burn. Mandatory annual DAC7 tax reporting applies.",
        legalLabel: "⚖️ Creator Financial & Fiscal Framework",
        bullets: [
          {
            label: "90% Net Revenue Split (Founding Tier)",
            text: "Approved Founding Creators (first 500 verified creators) receive a guaranteed 90% Net Revenue split on VIP passes, DRM media unlocks, live tips, and custom escrow orders (80% permanent standard baseline thereafter). SECCION retains a 10% platform margin (20% standard).",
          },
          {
            label: "50-50 Card Processing Fee Share Engine",
            text: "When tokens are funded via credit card (~4.0% acquiring toll), the member covers 50% (+2.0%) as a transparent checkout convenience fee, and the creator absorbs the remaining 50% (-2.0%) only upon token redemption. Payments funded via Open Banking (Bizum / SEPA Instant) or Web3 Crypto (USDC / Crypto) carry 0.0% gateway toll, netting the creator a full 90% payout.",
          },
          {
            label: "Fiscal Compliance (EU DAC7 Directive & US 1099 / TIN)",
            text: "Under Council Directive (EU) 2021/514 (DAC7) and international tax regulations, SECCION collects the creator's Tax Identification Number (TIN/NIF/NIE), VAT registration, and fiscal domicile for mandatory annual platform reporting to the Spanish Tax Agency (AEAT) and relevant tax authorities.",
          },
        ],
      },
      {
        id: "custodian-2257",
        accent: "emerald",
        iconKey: "shieldCheck",
        title: "7. Record-Keeping Custodian (18 U.S.C. § 2257) & Model Releases",
        tldrTitle: TLDR_TITLE.en,
        tldr: "All creators and co-performers must complete 18+ government photo ID and biometric liveness verification with signed model releases prior to publication under 18 U.S.C. § 2257.",
        legalLabel: "⚖️ Statutory 2257 Custodian Disclosure",
        introParagraphs: [
          "In strict compliance with 18 U.S.C. § 2257, 2257A, and implementing regulations:",
        ],
        bullets: [
          {
            label: "Mandatory Photo ID & Co-Performer Verification",
            text: "Every creator must verify via government-issued Photo ID, biometric liveness selfie holding the photo ID, and signed Model Release. No co-performer may appear in media or live streams without prior independent 2257 verification and signed release documentation.",
          },
          {
            label: "Designated Custodian of Records",
            text: `The original records required under 18 U.S.C. § 2257 are maintained in encrypted format by the designated Custodian of Records of SECCION AI CONCEPT S.L. at its corporate domicile (${LEGAL_ENTITY.addressByLocale.en}). Inspection inquiries may be directed to legal@seccion.ai.`,
          },
          {
            label: "Explicit Consent & GDPR Biometric Minimization",
            text: "Biometric liveness data is processed under explicit consent (GDPR Article 9). Under strict data minimization, facial estimation selfies are discarded immediately following verification. Any high-risk data breach will be reported to the Spanish Data Protection Agency (AEPD) within 72 hours.",
          },
        ],
      },
      {
        id: "dispute-settlement",
        accent: "cyan",
        iconKey: "landmark",
        title: "8. Multi-Tier Dispute Settlement, Arbitration & Certified Bodies (Art. 21 DSA)",
        tldrTitle: TLDR_TITLE.en,
        tldr: "We resolve inquiries within 24–48 hours. If unsatisfied with a moderation or account decision, you have the statutory right to escalate to out-of-court settlement bodies certified by the CNMC under the EU DSA, or to the EU Consumer Dispute platform.",
        legalLabel: "⚖️ Multi-Tier Escalation Framework",
        bullets: [
          {
            label: "Tier 1 • Internal 24/7 Dispute Resolution (Art. 20 DSA)",
            text: "Users must first submit claims to support@seccion.ai or legal@seccion.ai. Users maintain a 6-month window to contest internal moderation decisions.",
          },
          {
            label: "Tier 2 • Certified Out-of-Court Dispute Bodies (Art. 21 DSA)",
            text: "Under Article 21 of the EU Digital Services Act, creators and members are legally entitled to select any certified out-of-court dispute settlement body certified by the competent Digital Services Coordinator (in Spain, the CNMC) to resolve moderation disputes.",
          },
          {
            label: "Tier 3 • European Online Dispute Resolution (ODR Platform)",
            text: "For cross-border consumer disputes regarding digital tokens or subscriptions, the European Commission provides an Online Dispute Resolution platform at: https://ec.europa.eu/consumers/odr.",
          },
          {
            label: "Tier 4 • Spanish Consumer Arbitration & Jurisdiction",
            text: "Spanish consumers may refer unresolved consumer claims to the relevant Regional Consumer Arbitration Board (Junta Arbitral de Consumo). For commercial contracts with business creators, disputes are submitted to the exclusive jurisdiction of the Courts of Alicante, Spain.",
          },
        ],
      },
    ],
  },
  es: {
    id: "terms",
    code: "SEC-TOS-2026",
    title: "Términos de Servicio y Normas de Cumplimiento",
    subtitle:
      "Marco contractual maestro, condiciones de uso de tokens, directrices comunitarias, políticas contra el fraude y resolución de disputas de SECCION.",
    backToHome: "Volver al Inicio",
    entityCardTitle: "ENTIDAD LEGAL TITULAR",
    contactLabel: "Departamento Legal y Privacidad",
    contactEmail: LEGAL_ENTITY.emails.legal,
    pdfUrl: LEGAL_PDF_FILES.terms.es,
    pdfFileName: "seccion-terms-of-service-es.pdf",
    effectiveDateLabel: "Fecha de Vigencia",
    effectiveDate: LEGAL_ENTITY.effectiveDate,
    version: LEGAL_ENTITY.version,
    sections: [
      {
        id: "prohibited-content",
        accent: "cyan",
        iconKey: "shieldAlert",
        title: "1. Contenido Prohibido y Normas Legales de Notificación",
        tldrTitle: TLDR_TITLE.es,
        tldr: "Tolerancia cero total. Prohibimos contenido no consensual, explotación de menores, deepfakes no autorizados, estafas y acoso. Reportamos de forma inmediata y automática cualquier material ilegal al NCMEC y a la Guardia Civil / Policía Nacional.",
        legalLabel: "⚖️ Términos Legales y Obligaciones de Denuncia",
        introParagraphs: [
          "Los siguientes tipos de contenido y conductas están terminantemente prohibidos en la Plataforma bajo rescisión contractual inmediata y acciones penales:",
        ],
        bullets: [
          {
            label: "Tolerancia Cero con la Explotación Infantil (CSAM / NCMEC)",
            text: "La Plataforma prohíbe de forma absoluta cualquier material que involucre, represente o simule a menores de 18 años. En estricto cumplimiento del Título 18 U.S.C. § 2258A y del Artículo 189 del Código Penal español, todo intento de distribución de CSAM activará la congelación inmediata de la cuenta y la transmisión directa de telemetría e identidades a la CyberTipline del National Center for Missing & Exploited Children (NCMEC) y a las fuerzas y cuerpos de seguridad del Estado (Grupo de Delitos Telemáticos de la Guardia Civil y UFAM de la Policía Nacional).",
          },
          {
            label: "Material Explícito No Consensual y Filtraciones",
            text: "Está terminantemente prohibido subir, distribuir o comerciar con imágenes, audios o videos sin el consentimiento documentado de todos los participantes ('cyberflashing', sextorsión o 'stealthing'). Toda filtración de contenido protegido por DRM de SECCION conllevará la expulsión permanente y reclamación por daños civiles y penales.",
          },
          {
            label: "Deepfakes, Clonación No Autorizada y Ley de IA",
            text: "Se prohíbe la creación o distribución de ultrafalsificaciones (deepfakes), clonación de voz de terceros sin autorización o contenido sintético difamatorio. En cumplimiento del Reglamento de IA de la UE (Reglamento 2024/1689), el contenido sintético autorizado debe incorporar marcas forenses indelebles (SynthID).",
          },
          {
            label: "Canal de Notificación y Acción (Artículo 16 DSA)",
            text: "Cualquier usuario o entidad puede notificar la presencia de contenido supuestamente ilícito a través de nuestro formulario en línea o al correo dsa-compliance@seccion.ai. SECCION confirmará la recepción electrónicamente sin dilación indebida y tramitará la resolución en un plazo máximo de 24 horas laborables. Los alertadores fiables acreditados ('Trusted Flaggers' bajo Artículo 22 de la DSA) recibirán tratamiento prioritario inmediato.",
          },
        ],
      },
      {
        id: "subscriptions",
        accent: "pink",
        iconKey: "creditCard",
        title: "2. Suscripciones, Cancelaciones y Renuncia de Desistimiento Digital",
        tldrTitle: TLDR_TITLE.es,
        tldr: "Cancela cuando quieras en 2 clics sin preguntas ni laberintos. Para compras de tokens Matrix, el servicio digital se entrega al instante en tu saldo, por lo que aceptas que el derecho de desistimiento de 14 días finaliza en el momento de la entrega del token.",
        legalLabel: "⚖️ Términos Legales de Consumo",
        bullets: [
          {
            label: "Renovación Automática Transparente (UK DMCCA 2024 / UE)",
            text: "Los pases VIP y suscripciones mensuales se renuevan automáticamente al término del ciclo de facturación. Enviamos recordatorios electrónicos antes del cobro de renovación.",
          },
          {
            label: "Cancelación Directa en Dos Clics",
            text: "Los usuarios pueden cancelar cualquier suscripción activa en cualquier momento mediante un botón visible en los Ajustes de Cuenta. El acceso permanece activo hasta finalizar el ciclo pagado.",
          },
          {
            label: "Renuncia de Desistimiento en Bienes Digitales (Directiva 2011/83/UE)",
            text: "De conformidad con el Artículo 16(m) de la Directiva Europea 2011/83/UE y el Artículo 103.m del TRLGDCU español, la compra de Matrix Tokens constituye contenido digital no suministrado en soporte material. Al adquirir tokens, el usuario consiente de forma expresa el inicio inmediato de la ejecución digital y reconoce formalmente que pierde su derecho de desistimiento de 14 días una vez los tokens son acreditados en su billetera digital.",
          },
          {
            label: "Ventana de Cancelación en EE. UU.",
            text: "Para residentes en estados de EE. UU. donde rija estatutariamente un derecho de cancelación contractual de 3 días (ej., California, Nueva York), se aplicará dicha ventana siempre que los tokens no hayan sido consumidos.",
          },
        ],
      },
      {
        id: "token-economy",
        accent: "emerald",
        iconKey: "scale",
        title: "3. Economía de Tokens Matrix (MCC 5818), Descriptor y Contracargos",
        tldrTitle: TLDR_TITLE.es,
        tldr: "Los tokens Matrix Red Pills son artículos virtuales cerrados para interactuar en la plataforma; no son dinero fiat ni transferibles fuera de SECCION. En tu extracto bancario verás 'Seccion Matrix'. Los contracargos fraudulentos implican baneo inmediato y cobro formal de la deuda.",
        legalLabel: "⚖️ Términos de Tokens y Cortafuegos Financiero",
        bullets: [
          {
            label: "Clasificación como Bienes Digitales (MCC 5818)",
            text: "Los Matrix Tokens (Red Pills 💊 y Blue Pills 💊) representan una licencia limitada, no exclusiva, revocable e intransferible para el acceso a funciones interactivas, desbloqueos de medios DRM y propinas en vivo dentro de SECCION bajo el código MCC 5818. Los tokens carecen de valor monetario intrínseco, no son moneda de curso legal, no devengan intereses y bajo ninguna circunstancia pueden ser canjeados o reembolsados en moneda fiat por los miembros.",
          },
          {
            label: "Identificación del Cobro en Extractos ('Seccion Matrix')",
            text: "Todas las transacciones procesadas mediante tarjeta de crédito, débito o pasarelas de pago se identificarán formalmente en el extracto bancario del titular bajo el descriptor oficial 'Seccion Matrix' o 'SECCION MATRIX'. El titular asume la responsabilidad de reconocer dicho cargo.",
          },
          {
            label: "Política Contra el Fraude Amistoso y Resolución RDR",
            text: "La Plataforma opera sistemas de resolución temprana (Ethoca y Visa Rapid Dispute Resolution - RDR). Si tiene cualquier duda con un cargo, debe contactar primero a support@seccion.ai. El inicio de contracargos injustificados ('friendly fraud') resultará en el bloqueo permanente del usuario, la confiscación de tokens no consumidos y el cobro formal de los importes más los costes de disputa (€25 a €45 por contracargo).",
          },
        ],
      },
      {
        id: "dsa-ai-transparency",
        accent: "cyan",
        iconKey: "messageCircle",
        title: "4. Moderación de Contenido, Cumplimiento DSA y Transparencia de IA",
        tldrTitle: TLDR_TITLE.es,
        tldr: "Feeds públicos 100% limpios; el contenido sensual vive estrictamente tras muros de pago con verificación de edad 18+. Si moderamos tu cuenta, recibirás una Declaración de Razones humana. Los Copilotos de IA de creadores están claramente identificados.",
        legalLabel: "⚖️ Marco Regulatorio DSA y Ley de Inteligencia Artificial",
        bullets: [
          {
            label: "Aislamiento SFW / NSFW y Protección de Menores (Art. 28 DSA)",
            text: "El feed público de SECCION es estrictamente apto para todos los públicos (SFW). El contenido para adultos o sensual está confinado en un entorno restringido que exige verificación criptográfica de mayoría de edad (18+) y consentimiento explícito doble, impidiendo cualquier acceso o perfilado de menores.",
          },
          {
            label: "Declaración de Razones y Recursos (Artículo 17 y Artículo 20 de la DSA)",
            text: "Cualquier decisión de retirada de contenido o limitación de cuenta irá acompañada de una Declaración de Razones individualizada (fundamento fáctico y legal). El creador o miembro tiene derecho a recurrir la decisión de forma gratuita durante 6 meses ante nuestro sistema interno de tramitación de quejas con revisión humana cualificada.",
          },
          {
            label: "Transparencia de IA y Agentes Conversacionales (Art. 50 Ley de IA)",
            text: "En cumplimiento con el Artículo 50 del Reglamento de IA de la UE (Reglamento 2024/1689), los usuarios son notificados cuando interactúan con un agente conversacional automatizado. Los Copilotos de Creator Studio impulsados por IA muestran el distintivo visible '✨ AI Copilot'.",
          },
        ],
      },
      {
        id: "accessibility-ratings",
        accent: "emerald",
        iconKey: "userCheck",
        title: "5. Planes de Cita, Calificación de Confianza y Accesibilidad (Ley 11/2023)",
        introParagraphs: [
          "El módulo de Planes de Cita fomenta interacciones reales y seguras. Cancelar reiteradamente citas confirmadas sin justificación reduce la puntuación mutua de confianza en la escala de 20.00 puntos.",
          "En estricto cumplimiento con la Ley 11/2023 de España (transposición del Acta Europea de Accesibilidad), las interfaces públicas, pasarelas de pago y flujos de suscripción de SECCION cumplen con los estándares técnicos EN 301 549 incorporando conformidad WCAG 2.1 Nivel AA.",
        ],
      },
      {
        id: "creator-revenue",
        accent: "cyan",
        iconKey: "creditCard",
        title: "6. Reparto de Ingresos (90% Fundador), Reparto 50-50 de Comisiones y DAC7",
        tldrTitle: TLDR_TITLE.es,
        tldr: "Los Creadores Fundadores reciben el 90% neto de sus ingresos (80% estándar posterior). Las pasarelas de bajo coste (Open Banking y Cripto USDC) tienen 0% de comisión. En pagos con tarjeta de crédito (~4%), el coste se reparte 50-50 de forma transparente: el miembro paga +2% al comprar y el creador absorbe -2% al canjear. Reportamos anualmente a Hacienda bajo la directiva DAC7.",
        legalLabel: "⚖️ Condiciones Financieras y Fiscales de Creadores",
        bullets: [
          {
            label: "Reparto del 90% de Ingresos Netos (Nivel Fundador)",
            text: "Los Creadores Fundadores aprobados (primeros 500 creadores verificados) reciben el 90% de los Ingresos Netos por venta de pases VIP, desbloqueo de contenido DRM, propinas en vivo y pedidos de escrow personalizado (80% estándar permanente posterior). SECCION retiene el 10% (o 20% estándar) de la plataforma.",
          },
          {
            label: "Mecanismo de Reparto 50-50 de Comisiones de Tarjeta",
            text: "Cuando un miembro adquiere tokens con tarjeta de crédito/débito (tarifa típica ~4.0%), el miembro cubre el 50% (+2.0%) como tarifa visible al pagar y el creador absorbe el 50% restante (-2.0%) únicamente al canjear dichos tokens. Si el miembro utiliza Open Banking (Bizum / SEPA Instant) o Cripto (USDC / Web3), la comisión es del 0.0% y el creador cobra el 90% íntegro.",
          },
          {
            label: "Cumplimiento Fiscal y Directiva DAC7 / 1099",
            text: "En cumplimiento de la Directiva (UE) 2021/514 (DAC7) y normativas tributarias internacionales, SECCION recopila el NIF/NIE/TIN, número de IVA/VAT y residencia fiscal de todos los creadores para la declaración informativa anual obligatoria ante la AEAT y organismos fiscales correspondientes.",
          },
        ],
      },
      {
        id: "custodian-2257",
        accent: "emerald",
        iconKey: "shieldCheck",
        title: "7. Declaración de Custodia de Registros (18 U.S.C. § 2257) y Autorizaciones",
        tldrTitle: TLDR_TITLE.es,
        tldr: "Todos los creadores y co-participantes deben verificar su identidad 18+ con documento oficial y selfie de liveness antes de publicar. Mantenemos el registro de custodia legal conforme al estatuto federal 2257.",
        legalLabel: "⚖️ Declaración Estatutaria de Custodia 2257",
        introParagraphs: [
          "En estricto cumplimiento del Título 18 U.S.C. § 2257 y 2257A y sus reglamentos de desarrollo:",
        ],
        bullets: [
          {
            label: "Verificación de Identidad y Co-Participantes",
            text: "Todo creador debe completar una verificación obligatoria con documento oficial de identidad con fotografía (Photo ID), selfie de prueba de vida (liveness) sosteniendo el documento y contrato de cesión de derechos ('Model Release'). Ningún co-participante puede figurar en imágenes o transmisiones sin verificación 2257 previa y autorización firmada.",
          },
          {
            label: "Custodio de Registros Designado",
            text: `Los registros originales exigidos por el artículo 2257 se custodian de forma segura y cifrada por el Custodio de Registros de SECCION AI CONCEPT S.L. en su domicilio social (${LEGAL_ENTITY.addressByLocale.es}). Las consultas legales de inspección deben dirigirse a legal@seccion.ai.`,
          },
          {
            label: "Consentimiento Explícito y Minimización GDPR",
            text: "Los datos biométricos de prueba de vida se tratan bajo consentimiento explícito (Artículo 9 RGPD). Las imágenes faciales de estimación de edad se descartan de forma inmediata una vez validado el acceso. Cualquier brecha de datos con riesgo elevado será notificada a la AEPD en un plazo máximo de 72 horas.",
          },
        ],
      },
      {
        id: "dispute-settlement",
        accent: "cyan",
        iconKey: "landmark",
        title: "8. Resolución de Disputas, Arbitraje y Órganos Certificados (Art. 21 DSA)",
        tldrTitle: TLDR_TITLE.es,
        tldr: "Resolvemos cualquier problema en 24-48 horas. Si no estás conforme con una decisión de moderación o bloqueo, tienes derecho a recurrir ante organismos independientes certificados por la CNMC bajo la Ley DSA o ante la plataforma de litigios de la Unión Europea.",
        legalLabel: "⚖️ Procedimiento Escalonado de Solución de Conflictos",
        bullets: [
          {
            label: "Nivel 1 • Centro Interno de Resolución 24/7 (Art. 20 DSA)",
            text: "Cualquier controversia debe tramitarse inicialmente ante nuestro equipo de soporte en support@seccion.ai o legal@seccion.ai. El usuario dispone de 6 meses para recurrir cualquier resolución interna.",
          },
          {
            label: "Nivel 2 • Organismos Extrajudiciales Certificados (Art. 21 DSA)",
            text: "Bajo el Artículo 21 del Reglamento de Servicios Digitales (DSA), los creadores y miembros tienen derecho a acudir a cualquier organismo de resolución extrajudicial de litigios certificado por la CNMC para resolver disputas sobre contenidos o bloqueos de cuenta.",
          },
          {
            label: "Nivel 3 • Plataforma de Litigios en Línea de la UE (ODR)",
            text: "Para controversias de consumo transfronterizas relativas a compras de tokens o suscripciones, la Comisión Europea facilita una plataforma de resolución en línea accesible en: https://ec.europa.eu/consumers/odr.",
          },
          {
            label: "Nivel 4 • Arbitraje de Consumo de España y Jurisdicción",
            text: "Para consumidores residentes en España, las controversias no resueltas podrán someterse a la Junta Arbitral de Consumo correspondiente. Para litigios mercantiles con empresas o creadores profesionales, las partes se someten a la jurisdicción exclusiva de los Juzgados y Tribunales de Alicante, España.",
          },
        ],
      },
    ],
  },
  fr: {
    id: "terms",
    code: "SEC-TOS-2026",
    title: "Conditions Générales d'Utilisation & Règles de Conformité",
    subtitle:
      "Cadre contractuel maître, conditions d'utilisation des jetons, directives communautaires, politique antifraude et résolution des litiges de SECCION sous le droit espagnol et de l'Union européenne.",
    backToHome: "Retour à l'accueil",
    entityCardTitle: "ENTITÉ LÉGALE EXPLOITANTE",
    contactLabel: "Service Juridique & Confidentialité",
    contactEmail: LEGAL_ENTITY.emails.legal,
    pdfUrl: LEGAL_PDF_FILES.terms.fr,
    pdfFileName: "seccion-terms-of-service-fr.pdf",
    effectiveDateLabel: "Date d'Entrée en Vigueur",
    effectiveDate: LEGAL_ENTITY.effectiveDate,
    version: LEGAL_ENTITY.version,
    sections: [
      {
        id: "prohibited-content",
        accent: "cyan",
        iconKey: "shieldAlert",
        title: "1. Contenus Prohibés et Obligations Légales de Signalement",
        tldrTitle: TLDR_TITLE.fr,
        tldr: "Tolérance zéro absolue. Nous interdisons strictement les médias non consentis, toute exploitation de mineurs, les deepfakes non autorisés, les escroqueries et le harcèlement. Tout contenu illégal est signalé sans délai au NCMEC et aux autorités européennes de cybercriminalité.",
        legalLabel: "⚖️ Termes Juridiques & Obligations de Notification",
        introParagraphs: [
          "Les contenus et comportements suivants sont formellement interdits sur la Plateforme et entraînent la résiliation immédiate du compte ainsi que des poursuites pénales :",
        ],
        bullets: [
          {
            label: "Tolérance Zéro envers l'Exploitation des Mineurs (CSAM / NCMEC)",
            text: "La Plateforme applique une tolérance zéro envers tout contenu représentant, sollicitant ou simulant des mineurs de moins de 18 ans. Conformément au titre 18 U.S.C. § 2258A et à l'Article 189 du Code Pénal espagnol, toute détection de CSAM entraîne le gel immédiat du compte et la transmission automatisée de la télémétrie à la CyberTipline du NCMEC et aux forces de police judiciaire européennes (Guardia Civil GDT & Policía Nacional UFAM).",
          },
          {
            label: "Contenus Intimes Non Consentis et Fuites (Leaks)",
            text: "Il est strictement interdit de publier ou diffuser des médias sans le consentement documenté et vérifié de toutes les personnes apparaissant (cyberflashing, sextorsion ou diffusion non consentie). Toute fuite de média protégé par le DRM de SECCION entraîne une exclusion définitive et des actions en dommages et intérêts civils et pénaux.",
          },
          {
            label: "Deepfakes, Clonage Vocal Non Autorisé et Règlement IA (EU AI Act)",
            text: "La génération ou diffusion de deepfakes, de clonage vocal de tiers sans autorisation ou de contenus synthétiques diffamatoires est strictement interdite. Conformément au Règlement européen sur l'IA (2024/1689), tout contenu synthétique autorisé doit intégrer un tatouage numérique indélébile (SynthID).",
          },
          {
            label: "Mécanisme de Notification et d'Action (Article 16 du DSA)",
            text: "Toute personne ou entité peut signaler un contenu présumé illicite via notre formulaire en ligne ou à l'adresse dsa-compliance@seccion.ai. SECCION délivre un accusé de réception électronique sans retard injustifié et statue sous 24 heures ouvrées. Les signaleurs de confiance accrédités (Trusted Flaggers, Art. 22 du DSA) bénéficient d'un traitement prioritaire immédiat.",
          },
        ],
      },
      {
        id: "subscriptions",
        accent: "pink",
        iconKey: "creditCard",
        title: "2. Abonnements, Résiliation et Renonciation à la Rétractation Numérique",
        tldrTitle: TLDR_TITLE.fr,
        tldr: "Résiliez votre abonnement à tout moment en 2 clics sans parcours piégé. Pour les achats de jetons Matrix, la livraison instantanée sur votre solde vaut exécution immédiate du contenu numérique et renonciation au droit de rétractation de 14 jours.",
        legalLabel: "⚖️ Termes Juridiques de Consommation",
        bullets: [
          {
            label: "Renouvellement Automatique Transparent (UK DMCCA 2024 / UE)",
            text: "Les pass VIP et abonnements mensuels sont renouvelés automatiquement à échéance sauf résiliation préalable. Des rappels électroniques sont envoyés avant chaque facturation de renouvellement.",
          },
          {
            label: "Résiliation Directe en Deux Clics",
            text: "Les utilisateurs peuvent résilier tout abonnement récurrent à tout moment via un bouton dédié et visible dans les Paramètres du Compte sans pénalité, tout en conservant l'accès jusqu'au terme de la période déjà réglée.",
          },
          {
            label: "Renonciation au Droit de Rétractation sur les Biens Numériques (Directive 2011/83/UE)",
            text: "Conformément à l'Article 16(m) de la Directive 2011/83/UE et à la loi espagnole de protection des consommateurs (TRLGDCU, art. 103.m), l'achat de Jetons Matrix constitue un contenu numérique non fourni sur support matériel. En validant l'achat, le membre consent expressément à l'exécution numérique immédiate et reconnaît perdre son droit légal de rétractation de 14 jours dès le crédit des jetons sur son portefeuille.",
          },
          {
            label: "Délai Légal de Rétractation dans Certains États des États-Unis",
            text: "Lorsque la loi locale d'un État américain l'impose impérativement (ex. Californie, New York), une fenêtre d'annulation de 3 jours s'applique sous réserve que les jetons n'aient pas été consommés.",
          },
        ],
      },
      {
        id: "token-economy",
        accent: "emerald",
        iconKey: "scale",
        title: "3. Économie de Jetons Matrix en Circuit Fermé (MCC 5818), Libellé et Rétrofacturations",
        tldrTitle: TLDR_TITLE.fr,
        tldr: "Les Matrix Red Pills sont des jetons utilitaires virtuels en circuit fermé ; ils n'ont aucune valeur monétaire fiduciaire et ne peuvent être retirés hors de la plateforme. Votre relevé bancaire affiche 'Seccion Matrix'. Toute rétrofacturation abusive entraîne un bannissement immédiat et le recouvrement des sommes.",
        legalLabel: "⚖️ Conditions des Jetons & Pare-Feu Financier",
        bullets: [
          {
            label: "Classification en Biens Numériques en Circuit Fermé (MCC 5818)",
            text: "Les Jetons Matrix (Red Pills 💊 et Blue Pills 💊) constituent une licence limitée, révocable et non transférable donnant accès aux fonctionnalités interactives, au déblocage de médias DRM et aux pourboires en direct sous le code MCC 5818. Les jetons sont dépourvus de valeur fiduciaire, ne sont pas convertibles en espèces par les membres acheteurs et ne sont pas transférables hors de l'écosystème SECCION.",
          },
          {
            label: "Libellé sur Relevé Bancaire ('Seccion Matrix')",
            text: "Toutes les transactions par carte ou prestataire de paiement apparaissent sur le relevé du titulaire sous l'intitulé officiel 'Seccion Matrix' (ou 'SECCION MATRIX'). Le titulaire assume la responsabilité de reconnaître les paiements légitimement autorisés sous ce libellé.",
          },
          {
            label: "Politique Anti-Fraude Amicale et Pré-Résolution Visa RDR",
            text: "La Plateforme déploie des mécanismes automatisés de pré-litige (alertes Ethoca & Visa Rapid Dispute Resolution - RDR). En cas de doute sur un débit, vous devez contacter support@seccion.ai avant toute opposition bancaire. Toute rétrofacturation abusive ('friendly fraud') constitue une rupture contractuelle entraînant l'exclusion définitive, la perte des jetons restants et le recouvrement des montants contestés majorés des frais de litige (25 € à 45 € par dossier).",
          },
        ],
      },
      {
        id: "dsa-ai-transparency",
        accent: "cyan",
        iconKey: "messageCircle",
        title: "4. Modération, Conformité au DSA et Transparence de l'IA",
        tldrTitle: TLDR_TITLE.fr,
        tldr: "Les fils publics restent 100 % tout public (SFW) ; les contenus sensuels sont strictement isolés derrière des murs de paiement réservés aux +18 ans vérifiés. En cas de modération, vous recevez une déclaration de motifs écrite avec droit de recours humain. Les Copilotes IA sont toujours signalés de manière visible.",
        legalLabel: "⚖️ Cadre Réglementaire DSA & Règlement IA (EU AI Act)",
        bullets: [
          {
            label: "Isolation SFW / NSFW et Protection des Mineurs (Art. 28 du DSA)",
            text: "Le fil de découverte public de SECCION est strictement non explicite (SFW). Les médias sensuels ou réservés aux adultes sont confinés derrière des Warm Paywalls +18 exigeant une vérification cryptographique d'âge sans divulgation de données personnelles, empêchant tout accès ou profilage de mineurs.",
          },
          {
            label: "Exposé des Motifs et Recours Humain (Articles 17 et 20 du DSA)",
            text: "Toute décision de retrait de contenu, suspension de compte ou blocage de monétisation s'accompagne d'un exposé des motifs détaillant ses fondements factuels et juridiques. L'utilisateur dispose d'un délai de 6 mois pour contester gratuitement la décision via notre système interne garantissant une révision par des modérateurs humains qualifiés.",
          },
          {
            label: "Transparence de l'IA et Agents Conversationnels (Art. 50 de l'EU AI Act)",
            text: "Conformément à l'Article 50 du Règlement européen sur l'IA (2024/1689), les membres sont informés explicitement lorsqu'ils échangent avec un agent conversationnel automatisé. Les Copilotes IA du Creator Studio affichent le badge visible '✨ AI Copilot'.",
          },
        ],
      },
      {
        id: "accessibility-ratings",
        accent: "emerald",
        iconKey: "userCheck",
        title: "5. Projets de Rencontre, Indice de Confiance et Accessibilité (Loi Espagnole 11/2023)",
        introParagraphs: [
          "Le module Date Plan repose sur une intention relationnelle authentique. L'annulation injustifiée et répétée de rendez-vous confirmés diminue l'indice mutuel de confiance sur notre échelle de 20.00 points.",
          "En stricte conformité avec la Loi espagnole 11/2023 (transposant l'Acte européen sur l'accessibilité), les interfaces publiques, parcours de paiement et portails d'abonnement de SECCION respectent la norme technique EN 301 549 avec conformité WCAG 2.1 Niveau AA.",
        ],
      },
      {
        id: "creator-revenue",
        accent: "cyan",
        iconKey: "creditCard",
        title: "6. Revenus Créateurs (90 % Fondateur), Partage 50-50 des Frais Carte et Fiscalité DAC7",
        tldrTitle: TLDR_TITLE.fr,
        tldr: "Les Créateurs Fondateurs conservent 90 % des revenus nets (80 % au tarif standard ensuite). Les paiements par Open Banking et Crypto USDC supportent 0 % de frais de passerelle. Pour les paiements par carte (~4 % de frais bancaires), le coût est partagé à 50-50 en toute transparence : le membre règle +2 % au paiement et le créateur absorbe -2 % lors de l'encaissement. La déclaration fiscale annuelle DAC7 s'applique.",
        legalLabel: "⚖️ Cadre Financier et Fiscal des Créateurs",
        bullets: [
          {
            label: "Partage des Revenus Nets à 90 % (Offre Créateur Fondateur)",
            text: "Les Créateurs Fondateurs approuvés (500 premiers créateurs vérifiés) perçoivent 90 % des revenus nets issus des pass VIP, médias DRM débloqués, pourboires en direct et commandes personnalisées sous séquestre (80 % au taux standard permanent ensuite). SECCION conserve une marge plateforme de 10 % (20 % en standard).",
          },
          {
            label: "Partage Transparent 50-50 des Frais de Carte Bancaire",
            text: "Lorsqu'un membre achète des jetons par carte bancaire (~4,0 % de frais acquéreur), le membre couvre 50 % (+2,0 %) sous forme de frais de service visibles à l'achat et le créateur absorbe les 50 % restants (-2,0 %) uniquement lors du rachat des jetons. Les règlements par Open Banking (Bizum / SEPA Instant) ou Crypto Web3 (USDC) supportent 0,0 % de commission, reversant 90 % nets intégraux au créateur.",
          },
          {
            label: "Conformité Fiscale Européenne (Directive DAC7 & Formulaires 1099 / TIN)",
            text: "Conformément à la Directive (UE) 2021/514 (DAC7) et aux législations fiscales applicables, SECCION collecte le numéro d'identification fiscale (NIF/NIE/TIN), le numéro de TVA et la résidence fiscale du créateur en vue de la déclaration annuelle obligatoire auprès de l'administration fiscale espagnole (AEAT) et des autorités compétentes.",
          },
        ],
      },
      {
        id: "custodian-2257",
        accent: "emerald",
        iconKey: "shieldCheck",
        title: "7. Conservation des Registres (18 U.S.C. § 2257) et Cessions de Droits",
        tldrTitle: TLDR_TITLE.fr,
        tldr: "Tous les créateurs et co-intervenants doivent valider leur majorité (+18) par pièce d'identité officielle, test de présence biométrique et cession de droits signée avant toute publication conformément au statut 18 U.S.C. § 2257.",
        legalLabel: "⚖️ Déclaration Statutaire de Conservation 2257",
        introParagraphs: [
          "En stricte conformité avec le titre 18 U.S.C. § 2257, 2257A et leurs textes d'application :",
        ],
        bullets: [
          {
            label: "Vérification Obligatoire d'Identité et des Co-Intervenants",
            text: "Chaque créateur doit s'authentifier par pièce d'identité officielle avec photo, selfie biométrique de présence tenant la pièce et autorisation de diffusion signée (Model Release). Aucun co-intervenant ne peut apparaître dans un média ou un direct sans vérification 2257 préalable et autorisation signée.",
          },
          {
            label: "Dépositaire Désigné des Registres (Custodian of Records)",
            text: `Les registres originaux exigés par l'article 18 U.S.C. § 2257 sont conservés sous forme chiffrée par le Dépositaire des Registres désigné de SECCION AI CONCEPT S.L. à son siège social (${LEGAL_ENTITY.addressByLocale.fr}). Toute demande légale d'inspection doit être adressée à legal@seccion.ai.`,
          },
          {
            label: "Consentement Explicite et Minimisation Biométrique RGPD",
            text: "Les données biométriques de présence sont traitées sur la base du consentement explicite (Article 9 du RGPD). Selon le principe de minimisation, les selfies d'estimation d'âge sont détruits immédiatement après vérification. Toute violation de données à risque élevé est notifiée à l'AEPD sous 72 heures.",
          },
        ],
      },
      {
        id: "dispute-settlement",
        accent: "cyan",
        iconKey: "landmark",
        title: "8. Règlement des Litiges par Paliers, Arbitrage et Organes Certifiés (Art. 21 DSA)",
        tldrTitle: TLDR_TITLE.fr,
        tldr: "Nous traitons les réclamations sous 24 à 48 heures. En cas de désaccord avec une décision de modération ou de blocage, vous avez le droit légal de saisir un organisme extrajudiciaire certifié par la CNMC au titre du DSA européen ou la plateforme européenne de règlement en ligne des litiges.",
        legalLabel: "⚖️ Procédure d'Escalade Multi-Paliers",
        bullets: [
          {
            label: "Palier 1 • Centre Interne de Résolution 24/7 (Art. 20 du DSA)",
            text: "Toute réclamation doit être soumise en premier lieu à support@seccion.ai ou legal@seccion.ai. Les utilisateurs disposent d'un délai de 6 mois pour contester une décision interne de modération.",
          },
          {
            label: "Palier 2 • Organismes Extrajudiciaires Certifiés (Art. 21 du DSA)",
            text: "En vertu de l'Article 21 du Digital Services Act (DSA), les créateurs et membres peuvent librement saisir tout organe de règlement extrajudiciaire certifié par le Coordinateur des Services Numériques compétent (en Espagne, la CNMC).",
          },
          {
            label: "Palier 3 • Plateforme Européenne de Règlement en Ligne des Litiges (ODR)",
            text: "Pour les litiges transfrontaliers de consommation liés aux jetons numériques ou abonnements, la Commission européenne met à disposition la plateforme ODR à l'adresse : https://ec.europa.eu/consumers/odr.",
          },
          {
            label: "Palier 4 • Arbitrage de Consommation Espagnol et Juridiction Compétente",
            text: "Les consommateurs résidant en Espagne peuvent saisir le Conseil Régional d'Arbitrage de Consommation compétent (Junta Arbitral de Consumo). Pour les contrats commerciaux conclus avec des créateurs professionnels, compétence exclusive est attribuée aux Tribunaux d'Alicante (Espagne).",
          },
        ],
      },
    ],
  },
};

const PRIVACY_DOCS: Record<LegalLocale, LegalDocumentData> = {
  en: {
    id: "privacy",
    code: "SEC-PRIV-2026",
    title: "Privacy Policy",
    subtitle:
      "We protect your personal data, face, and preferences with high security and GDPR standards.",
    backToHome: "Back to Home",
    entityCardTitle: "DATA CONTROLLER",
    contactLabel: "Data Protection Officer (DPO)",
    contactEmail: LEGAL_ENTITY.emails.dpo,
    pdfUrl: LEGAL_PDF_FILES.privacy.en,
    pdfFileName: "seccion-privacy-policy-en.pdf",
    effectiveDateLabel: "Effective Date",
    effectiveDate: LEGAL_ENTITY.effectiveDate,
    version: LEGAL_ENTITY.version,
    sections: [
      {
        id: "sensitive-data",
        accent: "cyan",
        iconKey: "eye",
        title: "1. Sensitive Data Collection & Explicit Opt-In",
        tldrTitle: TLDR_TITLE.en,
        tldr: "We collect details about who you are, what you like, and your location to power our matchmaking and creator interactions. We will never process this without your clear, active opt-in. No pre-ticked boxes, no hidden terms. You are in control of your vibes.",
        legalLabel: "⚖️ Legal Terms",
        introParagraphs: [
          'The Platform processes sensitive personal data, including sexual orientation, relationship preferences, location data, and communication records. In accordance with Article 9 of the GDPR, the processing of this "special category" data requires your explicit, freely given, specific, informed, and unambiguous consent.',
        ],
        bullets: [
          {
            label: "Mechanism",
            text: "You must complete a manual, unticked opt-in checkbox during onboarding.",
          },
          {
            label: "Consent Records",
            text: "We maintain secure, auditable logs of your consent timestamps and parameters to comply with AEPD (Agencia Española de Protección de Datos) requirements.",
          },
          {
            label: "Right to Withdraw",
            text: "You have the right to withdraw your consent at any time, which can be done via your Account Settings or by requesting account deletion.",
          },
        ],
      },
      {
        id: "biometrics",
        accent: "pink",
        iconKey: "shield",
        title: "2. Biometric Data & Age Verification",
        tldrTitle: TLDR_TITLE.en,
        tldr: "To keep the community safe, real, and 18+, we use a quick selfie check. AI estimates your age from a live snap and immediately deletes it. If you're a member, we do not store your government ID on our servers. Biometric template matches keep catfish and bots out of Co-Op Mode.",
        legalLabel: "⚖️ Legal Terms",
        introParagraphs: [
          "Biometric data (e.g., facial templates extracted from verification selfies) is classified as special category data under the GDPR.",
        ],
        bullets: [
          {
            label: "Age Estimation",
            text: "During onboarding, users upload a live liveness-verified selfie. Third-party age estimation AI estimates eligibility (18+). The selfie image is processed in memory and deleted immediately (within 5 seconds) after the age estimation is complete (Data Minimization).",
          },
          {
            label: "Anti-Catfishing Profile Verification",
            text: "The Platform compares the biometric template of your liveness selfie against your uploaded profile photos using facial matching. The mathematical facial templates are stored in an encrypted database and are deleted immediately upon account termination.",
          },
          {
            label: "Biometric Consent",
            text: "A dedicated, explicit consent checkbox is mandatory before biometric scans are initiated.",
          },
        ],
      },
      {
        id: "automated-decisions",
        accent: "cyan",
        iconKey: "activity",
        title: "3. Automated Decision-Making & Recommender Systems",
        tldrTitle: TLDR_TITLE.en,
        tldr: "Our Synergy Engine runs matching algorithms based on archetype chemistry, location, and lifestyle sync to suggest connection cards. Under the hood, this is automated, but you always have the right to challenge the algorithm or request a human coach to review it.",
        legalLabel: "⚖️ Legal Terms",
        introParagraphs: [
          "Under Article 22 of the GDPR and Article 27 of the DSA, we disclose the use of automated profiling and matchmaking:",
        ],
        bullets: [
          {
            label: "The Synergy Algorithm",
            text: "Matches are calculated using lifestyle preferences, archetype alignment, and location proximity. These scores determine profile visibility and ranking.",
          },
          {
            label: "Transparency",
            text: "We provide clear explanations of the matching logic upon request.",
          },
          {
            label: "Human Intervention",
            text: "Users have a legal right to challenge automated decisions (such as compatibility ratings or automated safety flags) and request a manual review by a human moderator.",
          },
        ],
      },
      {
        id: "security",
        accent: "pink",
        iconKey: "lock",
        title: "4. Technical Security & Data Breach Notifications",
        tldrTitle: TLDR_TITLE.en,
        tldr: "We encrypt your data at rest and in transit, using strict access rules to lock down sensitive information. If a data leak ever happens, we will notify the Spanish AEPD and you within 72 hours with full details and next steps.",
        legalLabel: "⚖️ Legal Terms",
        introParagraphs: [
          "We implement robust Technical and Organizational Measures (TOMs) to secure your data:",
        ],
        bullets: [
          {
            label: "Encryption",
            text: "All personal and behavioral data is encrypted in transit using TLS 1.3 and at rest using AES-256 encryption.",
          },
          {
            label: "Access Control",
            text: "We enforce the principle of least privilege, requiring multi-factor authentication (MFA) for all administrative access.",
          },
          {
            label: "Data Breach Protocols",
            text: "In the event of a physical or technical data breach, we will notify the Spanish Supervisory Authority (AEPD) within 72 hours of discovery. If the breach poses a high risk to user privacy or safety, we will notify the affected individuals directly and without undue delay.",
          },
        ],
      },
      {
        id: "eu-wallet",
        accent: "emerald",
        iconKey: "users",
        title: "5. Member Verification & EU Wallet Standards",
        tldrTitle: TLDR_TITLE.en,
        tldr: "We prove you are 18+ using cryptographic verification without hoarding sensitive ID documents on platform servers, and ephemeral media disappears cleanly from active memory.",
        legalLabel: "⚖️ Legal Terms",
        introParagraphs: [
          "We implement a privacy-centric age check that confirms you are 18 or older without storing your personally identifiable information (PII):",
        ],
        bullets: [
          {
            label: "Zero-Knowledge Proofs (ZKP)",
            text: "We integrate with accredited identity providers supporting the European Commission's open-source age-verification blueprint.",
          },
          {
            label: "Selective Disclosure",
            text: "The system requests a simple cryptographic proof (e.g., IsOver18: True) from your EU Digital Identity Wallet. We do not receive or store your name, exact date of birth, or address.",
          },
          {
            label: "Ephemeral Media Security",
            text: "All disappearing photos, videos, and voice notes shared in chat are processed in volatile memory. They are immediately wiped and deleted from our active cache once viewed or after expiration, ensuring your private exchanges remain secure.",
          },
        ],
      },
    ],
  },
  es: {
    id: "privacy",
    code: "SEC-PRIV-2026",
    title: "Política de Privacidad",
    subtitle:
      "Protegemos tus datos personales, rostro y preferencias con altos estándares de seguridad y RGPD.",
    backToHome: "Volver al Inicio",
    entityCardTitle: "RESPONSABLE DEL TRATAMIENTO (DATA CONTROLLER)",
    contactLabel: "Delegado de Protección de Datos (DPO)",
    contactEmail: LEGAL_ENTITY.emails.dpo,
    pdfUrl: LEGAL_PDF_FILES.privacy.es,
    pdfFileName: "seccion-privacy-policy-es.pdf",
    effectiveDateLabel: "Fecha de Vigencia",
    effectiveDate: LEGAL_ENTITY.effectiveDate,
    version: LEGAL_ENTITY.version,
    sections: [
      {
        id: "sensitive-data",
        accent: "cyan",
        iconKey: "eye",
        title: "1. Recopilación de Datos Sensibles y Consentimiento Explícito",
        tldrTitle: TLDR_TITLE.es,
        tldr: "Recopilamos detalles sobre quién eres, qué te gusta y tu ubicación para potenciar el matchmaking y las interacciones con creadores. Nunca procesaremos esto sin tu consentimiento claro y activo. Sin casillas marcadas por defecto, sin términos ocultos. Tú tienes el control de tu vibe.",
        legalLabel: "⚖️ Términos Legales",
        introParagraphs: [
          "La Plataforma procesa datos personales sensibles, incluyendo orientación sexual, preferencias de relación, datos de ubicación y registros de comunicación. De acuerdo con el Artículo 9 del RGPD, el tratamiento de estos datos de 'categoría especial' requiere tu consentimiento explícito, libre, específico, informado e inequívoco.",
        ],
        bullets: [
          {
            label: "Mecanismo",
            text: "Debes completar una casilla de verificación manual y no marcada previamente durante el registro.",
          },
          {
            label: "Registros de Consentimiento",
            text: "Mantenemos registros seguros y auditables de las marcas de tiempo y parámetros de tu consentimiento para cumplir con los requisitos de la AEPD (Agencia Española de Protección de Datos).",
          },
          {
            label: "Derecho de Retirada",
            text: "Tienes derecho a retirar tu consentimiento en cualquier momento, lo cual puede gestionarse desde la Configuración de tu Cuenta o solicitando la eliminación de la misma.",
          },
        ],
      },
      {
        id: "biometrics",
        accent: "pink",
        iconKey: "shield",
        title: "2. Datos Biométricos y Verificación de Edad",
        tldrTitle: TLDR_TITLE.es,
        tldr: "Para mantener la comunidad segura, real y +18, usamos una verificación rápida con selfie. La IA estima tu edad desde una foto en vivo e inmediatamente la elimina. Si eres miembro, no almacenamos tu documento de identidad en nuestros servidores. Las coincidencias biométricas mantienen a los estafadores y bots fuera del Modo Co-Op.",
        legalLabel: "⚖️ Términos Legales",
        introParagraphs: [
          "Los datos biométricos (ej., plantillas faciales extraídas de selfies de verificación) están clasificados como datos de categoría especial bajo el RGPD.",
        ],
        bullets: [
          {
            label: "Estimación de Edad",
            text: "Durante el registro, los usuarios suben una selfie en vivo verificada con prueba de vida. Una IA acreditada estima la elegibilidad (+18). La imagen se procesa en memoria y se elimina de inmediato (en un plazo de 5 segundos) tras completar la estimación (Minimización de Datos).",
          },
          {
            label: "Verificación de Perfil Anti-Catfish",
            text: "La Plataforma compara la plantilla biométrica de tu selfie en vivo con tus fotos de perfil subidas mediante reconocimiento facial. Las plantillas faciales matemáticas se almacenan en una base de datos encriptada y se eliminan de inmediato al cerrar la cuenta.",
          },
          {
            label: "Consentimiento Biométrico",
            text: "Es obligatoria una casilla de consentimiento explícito y dedicado antes de iniciar los escaneos biométricos.",
          },
        ],
      },
      {
        id: "automated-decisions",
        accent: "cyan",
        iconKey: "activity",
        title: "3. Toma de Decisiones Automatizada y Sistemas de Recomendación",
        tldrTitle: TLDR_TITLE.es,
        tldr: "Nuestro Motor de Sinergia ejecuta algoritmos de matching basados en química de arquetipos, ubicación y sincronía de estilo de vida para sugerir conexiones. Internamente esto es automatizado, pero siempre tienes el derecho de impugnar el algoritmo o solicitar que un moderador humano lo revise.",
        legalLabel: "⚖️ Términos Legales",
        introParagraphs: [
          "Bajo el Artículo 22 del RGPD y el Artículo 27 de la DSA, informamos sobre el uso de perfiles automatizados y emparejamiento:",
        ],
        bullets: [
          {
            label: "El Algoritmo de Sinergia",
            text: "Los matches se calculan usando preferencias de estilo de vida, alineación de arquetipos y proximidad geográfica. Estas puntuaciones determinan la visibilidad y clasificación del perfil.",
          },
          {
            label: "Transparencia",
            text: "Proporcionamos explicaciones claras de la lógica de emparejamiento si se solicitan.",
          },
          {
            label: "Intervención Humana",
            text: "Los usuarios tienen el derecho legal de impugnar decisiones automatizadas (como calificaciones de compatibilidad o alertas automáticas de seguridad) y solicitar una revisión manual por un moderador humano.",
          },
        ],
      },
      {
        id: "security",
        accent: "pink",
        iconKey: "lock",
        title: "4. Seguridad Técnica y Notificación de Brechas de Datos",
        tldrTitle: TLDR_TITLE.es,
        tldr: "Encriptamos tus datos en reposo y en tránsito, usando estrictas reglas de acceso para proteger la información sensible. Si ocurriera una fuga de datos, notificaremos a la AEPD española y a ti en un plazo de 72 horas con todos los detalles y pasos a seguir.",
        legalLabel: "⚖️ Términos Legales",
        introParagraphs: [
          "Implementamos sólidas Medidas Técnicas y Organizativas (MTO) para proteger tus datos:",
        ],
        bullets: [
          {
            label: "Encriptación",
            text: "Todos los datos personales y de comportamiento se encriptan en tránsito mediante TLS 1.3 y en reposo mediante cifrado AES-256.",
          },
          {
            label: "Control de Acceso",
            text: "Aplicamos el principio de privilegio mínimo, exigiendo autenticación multifactor (MFA) para todo acceso administrativo.",
          },
          {
            label: "Protocolos de Brecha de Datos",
            text: "En caso de una brecha de seguridad física o técnica, notificaremos a la Autoridad de Control Española (AEPD) en un plazo de 72 horas desde su detección. Si la brecha supone un alto riesgo para la privacidad o seguridad de los usuarios, notificaremos a los afectados directamente y sin demoras indebidas.",
          },
        ],
      },
      {
        id: "eu-wallet",
        accent: "emerald",
        iconKey: "users",
        title: "5. Verificación de Miembros y Estándares EU Wallet",
        tldrTitle: TLDR_TITLE.es,
        tldr: "Confirmamos que eres mayor de 18 años mediante pruebas criptográficas sin acumular documentos de identidad en nuestros servidores, y los mensajes efímeros se borran automáticamente tras expirar.",
        legalLabel: "⚖️ Términos Legales",
        introParagraphs: [
          "Implementamos una verificación de edad centrada en la privacidad que confirma que tienes 18 años o más sin almacenar tu información de identificación personal (PII):",
        ],
        bullets: [
          {
            label: "Pruebas de Conocimiento Cero (ZKP)",
            text: "Nos integramos con proveedores de identidad acreditados que apoyan el modelo de verificación de edad de código abierto de la Comisión Europea.",
          },
          {
            label: "Divulgación Selectiva",
            text: "El sistema solicita una prueba criptográfica simple (ej. IsOver18: True) desde tu Cartera de Identidad Digital de la UE. No recibimos ni almacenamos tu nombre, fecha de nacimiento exacta ni dirección.",
          },
          {
            label: "Seguridad de Contenido Efímero",
            text: "Las fotos, videos y notas de voz que desaparecen en el chat se procesan en memoria volátil. Se borran y eliminan de inmediato de nuestra caché activa una vez vistos o tras expirar, garantizando que tus intercambios privados sigan siendo seguros.",
          },
        ],
      },
    ],
  },
  fr: {
    id: "privacy",
    code: "SEC-PRIV-2026",
    title: "Politique de Confidentialité",
    subtitle:
      "Nous protégeons vos données personnelles, votre visage et vos préférences selon les normes les plus strictes de sécurité et du RGPD.",
    backToHome: "Retour à l'accueil",
    entityCardTitle: "RESPONSABLE DU TRAITEMENT",
    contactLabel: "Délégué à la Protection des Données (DPO)",
    contactEmail: LEGAL_ENTITY.emails.dpo,
    pdfUrl: LEGAL_PDF_FILES.privacy.fr,
    pdfFileName: "seccion-privacy-policy-fr.pdf",
    effectiveDateLabel: "Date d'Entrée en Vigueur",
    effectiveDate: LEGAL_ENTITY.effectiveDate,
    version: LEGAL_ENTITY.version,
    sections: [
      {
        id: "sensitive-data",
        accent: "cyan",
        iconKey: "eye",
        title: "1. Collecte de Données Sensibles et Consentement Exprès",
        tldrTitle: TLDR_TITLE.fr,
        tldr: "Nous collectons des détails sur qui vous êtes, ce que vous aimez et votre localisation pour alimenter le matchmaking et vos échanges avec les créateurs. Nous ne traiterons jamais ces données sans votre accord clair et actif. Zéro case pré-cochée, contrôle total.",
        legalLabel: "⚖️ Termes Juridiques",
        introParagraphs: [
          "La Plateforme traite des données personnelles sensibles, incluant l'orientation sexuelle, les préférences relationnelles, la géolocalisation et les historiques de communication. Conformément à l'Article 9 du RGPD, le traitement de ces données de « catégorie particulière » repose exclusivement sur votre consentement exprès, libre, spécifique, éclairé et univoque :",
        ],
        bullets: [
          {
            label: "Mécanisme",
            text: "Vous devez valider une case à cocher manuelle et non pré-cochée lors de votre inscription.",
          },
          {
            label: "Registres de Consentement",
            text: "Nous conservons des traces sécurisées et vérifiables des horodatages et conditions de votre consentement pour satisfaire aux exigences de l'AEPD (Agence Espagnole de Protection des Données).",
          },
          {
            label: "Droit de Retrait",
            text: "Vous disposez du droit de retirer votre consentement à tout moment via les Paramètres de votre Compte ou en demandant la suppression de celui-ci.",
          },
        ],
      },
      {
        id: "biometrics",
        accent: "pink",
        iconKey: "shield",
        title: "2. Données Biométriques et Vérification d'Âge",
        tldrTitle: TLDR_TITLE.fr,
        tldr: "Pour maintenir une communauté sûre, authentique et 100 % majeure (+18), nous effectuons une vérification rapide par selfie. L'IA évalue votre âge à partir d'une photo en direct et la supprime immédiatement. Pour les membres, nous ne stockons aucun document d'identité sur nos serveurs.",
        legalLabel: "⚖️ Termes Juridiques",
        introParagraphs: [
          "Les données biométriques (ex. empreintes faciales extraites des selfies de contrôle) constituent des données de catégorie particulière sous l'empire du RGPD :",
        ],
        bullets: [
          {
            label: "Estimation d'Âge",
            text: "À l'inscription, l'utilisateur soumet un selfie en direct avec test de présence (liveness). Une IA certifiée évalue la majorité (+18). L'image est traitée en mémoire vive et supprimée immédiatement (dans un délai de 5 secondes) après estimation (Minimisation des Données).",
          },
          {
            label: "Contrôle Anti-Usurpation (Catfish)",
            text: "La Plateforme compare l'empreinte biométrique du selfie en direct avec vos photos de profil par reconnaissance faciale. Les vecteurs mathématiques sont conservés dans une base chiffrée isolée et purgés dès la clôture du compte.",
          },
          {
            label: "Consentement Biométrique",
            text: "Une case d'accord explicite et dédiée est obligatoire avant toute analyse biométrique.",
          },
        ],
      },
      {
        id: "automated-decisions",
        accent: "cyan",
        iconKey: "activity",
        title: "3. Décisions Automatisées et Systèmes de Recommandation",
        tldrTitle: TLDR_TITLE.fr,
        tldr: "Notre Moteur de Synergie opère des algorithmes de matchmaking fondés sur l'alchimie des archétypes, la localisation et le style de vie pour vous suggérer des affinités. Bien que le processus soit automatisé, vous conservez le droit légal d'en demander la révision par un être humain.",
        legalLabel: "⚖️ Termes Juridiques",
        introParagraphs: [
          "Conformément à l'Article 22 du RGPD et à l'Article 27 du DSA, nous détaillons le fonctionnement de nos algorithmes :",
        ],
        bullets: [
          {
            label: "L'Algorithme de Synergie",
            text: "Les correspondances sont calculées à partir de vos centres d'intérêt, de l'harmonie des archétypes et de la proximité géographique. Ces scores orientent la visibilité et l'ordonnancement des profils.",
          },
          {
            label: "Transparence",
            text: "Nous fournissons sur demande des explications claires et compréhensibles sur la logique de recommandation.",
          },
          {
            label: "Intervention Humaine",
            text: "Les utilisateurs ont le droit légal de contester toute décision automatisée (score de compatibilité ou restriction automatique) et d'exiger un réexamen par un modérateur humain.",
          },
        ],
      },
      {
        id: "security",
        accent: "pink",
        iconKey: "lock",
        title: "4. Sécurité Technique et Notification des Violations de Données",
        tldrTitle: TLDR_TITLE.fr,
        tldr: "Nous chiffrons vos données au repos et en transit, avec des règles d'accès strictes pour protéger votre vie privée. En cas d'incident de sécurité, nous notifierons l'autorité espagnole (AEPD) et vous-même sous 72 heures avec tous les détails nécessaires.",
        legalLabel: "⚖️ Termes Juridiques",
        introParagraphs: [
          "Nous mettons en œuvre des Mesures Techniques et Organisationnelles (MTO) rigoureuses pour sécuriser vos données :",
        ],
        bullets: [
          {
            label: "Chiffrement",
            text: "Toutes les données personnelles et comportementales sont chiffrées en transit via TLS 1.3 et au repos par un chiffrement AES-256.",
          },
          {
            label: "Contrôle des Accès",
            text: "Nous appliquons le principe du moindre privilège, imposant une authentification multifacteur (MFA) pour tout accès administratif.",
          },
          {
            label: "Protocole en Cas de Violation",
            text: "En cas de faille de sécurité physique ou technique, nous notifierons l'autorité de contrôle compétente (AEPD) dans un délai de 72 heures. Si la violation présente un risque élevé pour vos droits, vous en serez informé(e) directement et sans délai.",
          },
        ],
      },
      {
        id: "eu-wallet",
        accent: "emerald",
        iconKey: "users",
        title: "5. Vérification des Membres et Standards EU Wallet",
        tldrTitle: TLDR_TITLE.fr,
        tldr: "Nous prouvons votre majorité (+18) par vérification cryptographique sans stocker vos documents d'identité sur nos serveurs, et les médias éphémères disparaissent de la mémoire vive dès leur lecture.",
        legalLabel: "⚖️ Termes Juridiques",
        introParagraphs: [
          "Nous déployons une vérification de majorité respectueuse de la vie privée qui valide que vous avez 18 ans ou plus sans stocker vos informations d'identification personnelle (PII) :",
        ],
        bullets: [
          {
            label: "Preuves à Divulgation Nulle de Connaissance (ZKP)",
            text: "Nous nous intégrons avec des prestataires d'identité accrédités conformes au modèle open source de vérification d'âge de la Commission Européenne.",
          },
          {
            label: "Divulgation Sélective",
            text: "Le système sollicite une preuve cryptographique simple (ex. IsOver18: True) depuis votre Portefeuille d'Identité Numérique de l'UE. Nous ne recevons ni ne stockons votre nom officiel, votre date de naissance exacte ou votre adresse.",
          },
          {
            label: "Sécurité des Médias Éphémères",
            text: "Toutes les photos, vidéos et notes vocales éphémères partagées dans le chat sont traitées en mémoire volatile. Elles sont immédiatement effacées de notre cache actif après consultation ou expiration, garantissant la confidentialité de vos échanges.",
          },
        ],
      },
    ],
  },
};

const CREATOR_DOCS: Record<LegalLocale, LegalDocumentData> = {
  en: {
    id: "creator",
    code: "SEC-CREATOR-2026",
    title: "Creator Hub & Contract Terms",
    subtitle:
      "Independent contractor agreement, 2257 guidelines, 90% Founding / 80% Standard net revenue split, and creator monetization tools.",
    backToHome: "Back to Home",
    entityCardTitle: "CONTRACTING ENTITY & 2257 CUSTODIAN",
    contactLabel: "Creator Desk & Compliance",
    contactEmail: LEGAL_ENTITY.emails.creators,
    pdfUrl: LEGAL_PDF_FILES.creator.en,
    pdfFileName: "seccion-creator-agreement-en.pdf",
    effectiveDateLabel: "Effective Date",
    effectiveDate: LEGAL_ENTITY.effectiveDate,
    version: LEGAL_ENTITY.version,
    sections: [
      {
        id: "kyc-gates",
        accent: "cyan",
        iconKey: "shieldAlert",
        title: "1. Age Verification & KYC Gates",
        tldrTitle: TLDR_TITLE.en,
        tldr: "Zero minor tolerance. You must be 18+ to view or post. If you're a creator, you must clear DIDIT biometric liveness checks and upload a valid government ID before you can share posts, launch live streams, or receive tips.",
        legalLabel: "⚖️ Legal Terms",
        introParagraphs: [
          "The Platform maintains a strict gating system to prevent minors from accessing or publishing content. Before publishing content, launching live streams, or enabling monetization features (subscriptions, tips, goals), creators must complete KYC Tier 3. This requires:",
        ],
        bullets: [
          {
            label: "ID Verification",
            text: "Submit a clear, unexpired scan of a government-issued photo ID through our zero-knowledge identity gateway (DIDIT).",
          },
          {
            label: "Liveness Holding Selfie",
            text: "Complete a biometric liveness check holding your government ID to prove identity ownership.",
          },
          {
            label: "Digital Model Release",
            text: "Sign the cryptographic digital Model Release Agreement confirming your voluntary participation and commercial consent.",
          },
          {
            label: "Sanctions & Watchlist Screening",
            text: "All creators undergo automated screening against international registers (including US OFAC, EU, and UK watchlists). Onboarding is prohibited for blocked/sanctioned individuals or residents of embargoed territories.",
          },
          {
            label: "Life of Records",
            text: "All identity documentation is encrypted and stored securely for the duration of platform operations plus an additional 5 years.",
          },
        ],
      },
      {
        id: "revenue-split",
        accent: "pink",
        iconKey: "badgePercent",
        title: "2. 90% Founding / 80% Standard Net Revenue Split & Tax Reporting",
        tldrTitle: TLDR_TITLE.en,
        tldr: "Founding Creators (first 500 verified) keep 90% of Net Revenue, and all subsequent creators keep our permanent 80/20 guaranteed standard split. Open Banking and USDC Crypto carry 0% gateway toll, while card fees are shared 50-50 cleanly. We report payouts under EU DAC7 and US IRS 1099 rules.",
        legalLabel: "⚖️ Legal Terms",
        introParagraphs: [
          "Creators on SECCION operate as independent contractors (Article 1255 of the Spanish Civil Code) and retain 90% (Founding Cohort) or 80% (Permanent Standard) of Net Revenue on subscriptions, tips, DRM unlocks, and custom escrow orders. Net Revenue is defined as Gross Customer Payments minus shared gateway processing fees (Open Banking A2A, Instant USDC settlement, and digital payment rails).",
        ],
        bullets: [
          {
            label: "Net Revenue Payout Formula",
            text: "Creator Payout = 90% (Founding) or 80% (Standard) × (Gross Revenue − Shared Payment Processing Fees). SECCION retains 10% (Founding) or 20% (Standard) of Net Revenue. Open Banking & USDC Crypto carry 0.0% gateway toll.",
          },
          {
            label: "Independent Contractor Status",
            text: "Creators set their own pricing, schedules, and content output with zero exclusivity lock-in and zero employment subordination to SECCION.",
          },
          {
            label: "Tax Identification & Authority Reporting",
            text: "Creators are solely responsible for reporting and paying applicable taxes. Under the EU DAC7 Directive (2021/514) and IRS regulations, the Platform verifies your TIN/NIF/NIE and VAT details and reports annual creator transactions to AEAT and relevant tax authorities (including Form 1099-NEC where applicable).",
          },
          {
            label: "CNMC Registration & Transparency",
            text: "In compliance with Spain's General Law on Audiovisual Communication, the Platform complies with National Media Service Provider transparency rules, Ultimate Beneficial Ownership (UBO) disclosures, and advertising revenue reporting.",
          },
        ],
      },
      {
        id: "co-performers-2257",
        accent: "emerald",
        iconKey: "scale",
        title: "3. Co-Performer Verification & 2257 Rules",
        tldrTitle: TLDR_TITLE.en,
        tldr: "If you film with a partner, they must be verified too. No exceptions. We require a government ID and a liveness selfie holding that ID for every single co-performer before you post the content. Unverified background appearances trigger immediate removal or suspension.",
        legalLabel: "⚖️ Legal Terms",
        introParagraphs: [
          "To protect payment rails and comply with U.S. 18 U.S.C. § 2257 and European adult safety regulations:",
        ],
        bullets: [
          {
            label: "Co-Performer KYC",
            text: "Collaborative or co-performed explicit content cannot be uploaded unless all participants are verified members of the Platform and tagged in the post.",
          },
          {
            label: "Selfie Holding ID & Signed Release",
            text: "Creators must collect a government photo ID, a liveness selfie of the co-performer holding their ID, and a signed consent release prior to upload.",
          },
          {
            label: "Background Auditing",
            text: "Ensure that no unverified individuals or minors appear in the background of any uploaded content. The presence of unverified bystanders is a primary trigger for permanent account suspension.",
          },
        ],
      },
      {
        id: "watermarking-drm",
        accent: "cyan",
        iconKey: "globe",
        title: "4. Anti-Piracy & Content Watermarking",
        tldrTitle: TLDR_TITLE.en,
        tldr: "We protect your content using visible tags and invisible steganographic signatures embedded secretly into media. If someone leaks your work, we trace their subscriber account and issue automated DMCA takedowns immediately.",
        legalLabel: "⚖️ Legal Terms",
        introParagraphs: [
          "SECCION equips creators with advanced technical safeguards to protect their intellectual property:",
        ],
        bullets: [
          {
            label: "Visible Watermarks",
            text: "The Platform optionally overlays your username or stage name onto images and videos.",
          },
          {
            label: "Invisible Steganographic Watermarks",
            text: "Advanced forensic tracking signatures are invisibly embedded into media files, enabling identification of the specific subscriber account responsible in the event of a leak.",
          },
          {
            label: "Automated DMCA Takedowns",
            text: "SECCION provides automated workflows to generate and dispatch Digital Millennium Copyright Act (DMCA) and EU copyright takedown notices to third-party hosts and search engines hosting stolen media.",
          },
        ],
      },
      {
        id: "ai-suite-safety",
        accent: "emerald",
        iconKey: "bot",
        title: "5. Creator Back-Office AI Suite & Safety Tools",
        tldrTitle: TLDR_TITLE.en,
        tldr: "Keep 100% ownership of your brand with AI tools built to replace 40% talent agencies: scan predatory contracts, translate DMs live across languages, and geofence regions to protect your local privacy.",
        legalLabel: "⚖️ Legal Terms",
        introParagraphs: [
          "To render exploitative talent agencies obsolete, SECCION provides automated AI tools and privacy filters:",
        ],
        bullets: [
          {
            label: "Contract Copilot",
            text: "Our built-in legal scanner reviews brand sponsorship contracts and agency agreements, flagging predatory terms such as perpetual likeness lock-in clauses or exclusive IP forfeitures.",
          },
          {
            label: "Operations Assistant",
            text: "AI assistant helps manage custom booking requests, schedule live streams, draft promotional copy, and translate chat messages (text and voice notes) in real-time.",
          },
          {
            label: "Geofencing & Blocking Filters",
            text: "Protect your local identity by geofencing specific countries, states, or cities, preventing profiles in those regions from seeing your streams, content albums, or discovery cards.",
          },
          {
            label: "Creator Safety PO Box & Business Banking",
            text: "Creators are strongly advised to use a distinct stage name, registered PO Box, and dedicated business bank account for tax and business registration.",
          },
        ],
      },
    ],
  },
  es: {
    id: "creator",
    code: "SEC-CREATOR-2026",
    title: "Centro de Creadores y Contrato",
    subtitle:
      "Acuerdo de contratista independiente, directrices 2257, reparto neto 90% Fundador / 80% Estándar y herramientas de monetización.",
    backToHome: "Volver al Inicio",
    entityCardTitle: "ENTIDAD CONTRATANTE & CUSTODIA 2257",
    contactLabel: "Soporte y Cumplimiento de Creadores",
    contactEmail: LEGAL_ENTITY.emails.creators,
    pdfUrl: LEGAL_PDF_FILES.creator.es,
    pdfFileName: "seccion-creator-agreement-es.pdf",
    effectiveDateLabel: "Fecha de Vigencia",
    effectiveDate: LEGAL_ENTITY.effectiveDate,
    version: LEGAL_ENTITY.version,
    sections: [
      {
        id: "kyc-gates",
        accent: "cyan",
        iconKey: "shieldAlert",
        title: "1. Verificación de Edad y Accesos KYC",
        tldrTitle: TLDR_TITLE.es,
        tldr: "Tolerancia cero con menores. Debes tener +18 para ver o publicar. Si eres creador/a, debes superar la verificación biométrica de vida DIDIT y subir un documento de identidad oficial válido antes de compartir publicaciones, iniciar transmisiones en vivo o recibir propinas.",
        legalLabel: "⚖️ Términos Legales",
        introParagraphs: [
          "La Plataforma mantiene un estricto sistema de control para evitar que menores accedan o publiquen contenido. Antes de publicar contenido, iniciar streams en vivo o habilitar funciones de monetización (suscripciones, propinas, objetivos), los creadores deben completar el KYC Nivel 3. Esto requiere:",
        ],
        bullets: [
          {
            label: "Verificación de ID",
            text: "Subir un escaneo claro y vigente de un documento de identidad oficial con foto mediante nuestra pasarela de identidad zero-knowledge (DIDIT).",
          },
          {
            label: "Selfie con Prueba de Vida",
            text: "Superar la prueba biométrica de vida sosteniendo tu documento de identidad para demostrar la titularidad de la identidad.",
          },
          {
            label: "Acuerdo Digital de Cesión de Imagen",
            text: "Firmar digitalmente el Acuerdo de Cesión de Derechos de Imagen ('Model Release') confirmando tu participación voluntaria y consentimiento comercial.",
          },
          {
            label: "Filtro de Sanciones y Listas de Vigilancia",
            text: "Todos los creadores se someten a un escaneo automatizado contra registros internacionales (incluyendo listas de la OFAC de EE. UU., UE y RU). Está prohibido el registro de personas sancionadas o residentes en territorios embargados.",
          },
          {
            label: "Conservación de Registros",
            text: "Toda la documentación de identidad se almacena de forma cifrada y segura durante el tiempo de operación de la plataforma más 5 años adicionales.",
          },
        ],
      },
      {
        id: "revenue-split",
        accent: "pink",
        iconKey: "badgePercent",
        title: "2. Reparto de Ingresos Netos (90% Fundador / 80% Estándar) y Declaración Fiscal",
        tldrTitle: TLDR_TITLE.es,
        tldr: "Los Creadores Fundadores (primeros 500 verificados) conservan el 90% de los Ingresos Netos y la base estándar permanente posterior es del 80/20 garantizado. Open Banking y Cripto USDC tienen 0% de comisión de pasarela, y las comisiones de tarjeta se comparten 50-50. Reportamos pagos bajo las normativas DAC7 e IRS 1099.",
        legalLabel: "⚖️ Términos Legales",
        introParagraphs: [
          "Los creadores en SECCION operan como contratistas independientes (Artículo 1255 del Código Civil español) y retienen el 90% (Fundadores) o el 80% (Estándar Permanente) de los Ingresos Netos de suscripciones, propinas, desbloqueos DRM y pedidos personalizados de escrow. Los Ingresos Netos se definen como los Pagos Brutos del Cliente menos las tarifas compartidas de pasarela bancaria (Open Banking A2A, liquidación USDC y rieles de pago).",
        ],
        bullets: [
          {
            label: "Fórmula de Pago de Ingresos Netos",
            text: "Pago al Creador = 90% (Fundador) o 80% (Estándar) × (Ingresos Brutos − Comisiones Compartidas de Pasarela). SECCION retiene el 10% (Fundador) o el 20% (Estándar). Open Banking y Cripto USDC tienen 0,0% de deducción de pasarela.",
          },
          {
            label: "Estatus de Contratista Independiente",
            text: "Los creadores fijan libremente sus tarifas, horarios y frecuencia de publicación sin exclusividad ni relación laboral subordinada con SECCION.",
          },
          {
            label: "Identificación y Declaración Fiscal",
            text: "Los creadores son los únicos responsables de declarar y pagar los impuestos aplicables. En cumplimiento con la Directiva europea DAC7 (2021/514) y normativas del IRS, la Plataforma recopilará tu NIF/NIE/TIN y datos de IVA para reportar anualmente los pagos ante la AEAT y autoridades fiscales competentes (incluyendo Formulario 1099-NEC cuando proceda).",
          },
          {
            label: "Registro CNMC y Transparencia",
            text: "En cumplimiento con la Ley General de Comunicación Audiovisual de España, la Plataforma cumple con los requisitos estatales de transparencia, divulgación de Titularidad Real (UBO) y declaración de ingresos publicitarios.",
          },
        ],
      },
      {
        id: "co-performers-2257",
        accent: "emerald",
        iconKey: "scale",
        title: "3. Verificación de Co-Intérpretes y Normas 2257",
        tldrTitle: TLDR_TITLE.es,
        tldr: "Si grabas contenido con una pareja o colaborador/a, también deben estar verificados. Sin excepciones. Exigimos un documento de identidad y una selfie de vida con el ID en mano de cada co-intérprete antes de publicar. Las apariciones de terceros no verificados provocarán la suspensión de la cuenta.",
        legalLabel: "⚖️ Términos Legales",
        introParagraphs: [
          "Para proteger las pasarelas de pago y cumplir con 18 U.S.C. § 2257 de EE. UU. y la normativa europea de mayores:",
        ],
        bullets: [
          {
            label: "KYC de Co-Intérpretes",
            text: "El contenido explícito en colaboración o con co-intérpretes no se puede subir a menos que todos los participantes sean miembros verificados de la Plataforma y estén etiquetados en la publicación.",
          },
          {
            label: "Selfie con ID en Mano y Cesión Firmada",
            text: "Los creadores deben recopilar una identificación oficial con foto, una selfie de vida del co-intérprete sosteniendo su documento y la autorización firmada antes de publicar.",
          },
          {
            label: "Auditoría de Fondo",
            text: "Asegúrate de que no aparezcan menores ni personas no verificadas en el fondo de ningún contenido subido. La presencia de transeúntes no verificados es causa directa para la suspensión permanente de la cuenta.",
          },
        ],
      },
      {
        id: "watermarking-drm",
        accent: "cyan",
        iconKey: "globe",
        title: "4. Protección Anti-Piratería y Marca de Agua Digital",
        tldrTitle: TLDR_TITLE.es,
        tldr: "Protegemos tu contenido utilizando marcas visibles y firmas esteganográficas invisibles incrustadas en los archivos. Si alguien filtra tu trabajo, localizamos su cuenta de suscriptor y emitimos solicitudes automáticas de retiro DMCA de inmediato.",
        legalLabel: "⚖️ Términos Legales",
        introParagraphs: [
          "SECCION equipa a los creadores con herramientas técnicas avanzadas para salvaguardar su propiedad intelectual:",
        ],
        bullets: [
          {
            label: "Marcas de Agua Visibles",
            text: "La Plataforma superpone de forma configurable tu nombre de usuario o nombre artístico en imágenes y videos.",
          },
          {
            label: "Marcas de Agua Esteganográficas Invisibles",
            text: "Se incrustan de forma invisible datos forenses de rastreo en los archivos multimedia, permitiendo identificar la cuenta de suscriptor responsable en caso de filtración.",
          },
          {
            label: "Retiros DMCA Automatizados",
            text: "SECCION ofrece herramientas automatizadas para generar y enviar avisos de retiro DMCA y por derechos de autor europeos a servidores de terceros o motores de búsqueda que alojen material robado.",
          },
        ],
      },
      {
        id: "ai-suite-safety",
        accent: "emerald",
        iconKey: "bot",
        title: "5. Suite IA de Respaldo y Herramientas de Seguridad",
        tldrTitle: TLDR_TITLE.es,
        tldr: "Mantén el 100% de tu marca con herramientas IA diseñadas para volver obsoletas a las agencias del 40%: audita contratos abusivos, traduce DMs en tiempo real y bloquea regiones para proteger tu anonimato local.",
        legalLabel: "⚖️ Términos Legales",
        introParagraphs: [
          "Para dejar atrás a las agencias de representación abusivas, SECCION ofrece herramientas automatizadas de IA y filtros de privacidad:",
        ],
        bullets: [
          {
            label: "Copiloto de Contratos",
            text: "Nuestro escáner legal integrado revisa contratos de marcas y acuerdos de agencias, detectando cláusulas abusivas como retención perpetua de imagen o pérdida de propiedad intelectual exclusiva.",
          },
          {
            label: "Asistente de Operaciones",
            text: "El asistente IA te ayuda a gestionar solicitudes de reservas personalizadas, programar transmisiones, redactar descripciones atractivas y traducir mensajes de chat (texto y notas de voz) en tiempo real.",
          },
          {
            label: "Filtros de Geocerca y Bloqueo",
            text: "Protege tu identidad local bloqueando países, estados o ciudades específicas, evitando que perfiles de esas regiones vean tus streams, álbumes o tarjetas de descubrimiento.",
          },
          {
            label: "Seguridad Bancaria y Apartado Postal",
            text: "Se recomienda encarecidamente a los creadores utilizar un nombre artístico distintivo, un Apartado Postal (PO Box) y una cuenta bancaria comercial dedicada para su registro fiscal.",
          },
        ],
      },
    ],
  },
  fr: {
    id: "creator",
    code: "SEC-CREATOR-2026",
    title: "Centre des Créateurs et Contrat",
    subtitle:
      "Accord de prestataire indépendant, directives 2257, rétention nette 90 % Fondateur / 80 % Standard et outils de monétisation.",
    backToHome: "Retour à l'accueil",
    entityCardTitle: "ENTITÉ CONTRACTANTE & CUSTODE 2257",
    contactLabel: "Support & Conformité Créateurs",
    contactEmail: LEGAL_ENTITY.emails.creators,
    pdfUrl: LEGAL_PDF_FILES.creator.fr,
    pdfFileName: "seccion-creator-agreement-fr.pdf",
    effectiveDateLabel: "Date d'Entrée en Vigueur",
    effectiveDate: LEGAL_ENTITY.effectiveDate,
    version: LEGAL_ENTITY.version,
    sections: [
      {
        id: "kyc-gates",
        accent: "cyan",
        iconKey: "shieldAlert",
        title: "1. Vérification d'Âge et Procédure KYC",
        tldrTitle: TLDR_TITLE.fr,
        tldr: "Tolérance zéro pour les mineurs. Vous devez être majeur (+18) pour consulter ou publier. En tant que créateur, vous devez valider le test de présence biométrique DIDIT et fournir une pièce d'identité officielle valide avant de publier, lancer un direct ou recevoir des pourboires.",
        legalLabel: "⚖️ Termes Juridiques",
        introParagraphs: [
          "La Plateforme maintient un contrôle strict interdisant tout accès ou publication par des mineurs. Avant de publier du contenu, lancer des flux vidéo ou activer les fonctionnalités monétisées (abonnements, pourboires, objectifs), les créateurs doivent valider le KYC Niveau 3, qui requiert :",
        ],
        bullets: [
          {
            label: "Vérification d'Identité",
            text: "Fournir une copie nette et valide d'un document d'identité officiel avec photo via notre passerelle d'identité à divulgation nulle (DIDIT).",
          },
          {
            label: "Selfie avec Test de Présence",
            text: "Effectuer une vérification biométrique de présence en tenant votre pièce d'identité pour attester de la titularité du compte.",
          },
          {
            label: "Accord de Cession de Droits à l'Image",
            text: "Signer l'accord numérique cryptographique de cession de droits à l'image (Model Release) certifiant votre consentement volontaire et commercial.",
          },
          {
            label: "Filtrage des Sanctions et Listes de Vigilance",
            text: "Tous les créateurs font l'objet d'un contrôle automatisé auprès des registres internationaux (OFAC, UE, Royaume-Uni). L'inscription est interdite aux personnes sanctionnées ou résidant dans des territoires sous embargo.",
          },
          {
            label: "Conservation des Registres",
            text: "Toute la documentation d'identité est conservée de manière chiffrée et sécurisée pendant toute la durée d'exploitation de la plateforme plus 5 années supplémentaires.",
          },
        ],
      },
      {
        id: "revenue-split",
        accent: "pink",
        iconKey: "badgePercent",
        title: "2. Répartition des Revenus Nets (90 % Fondateur / 80 % Standard) et Déclaration Fiscale",
        tldrTitle: TLDR_TITLE.fr,
        tldr: "Les Créateurs Fondateurs (500 premiers vérifiés) conservent 90 % des Revenus Nets, et la base standard permanente ultérieure est garantie à 80/20. Les paiements par Open Banking et Crypto USDC supportent 0 % de frais de passerelle, et les frais de carte sont partagés 50-50. Nous déclarons les versements conformément aux directives DAC7 et IRS 1099.",
        legalLabel: "⚖️ Termes Juridiques",
        introParagraphs: [
          "Les créateurs opèrent sur SECCION en tant que prestataires indépendants (Article 1255 du Code Civil espagnol) et conservent 90 % (Cohorte Fondateur) ou 80 % (Standard Permanent) des Revenus Nets générés par les abonnements, pourboires, médias DRM débloqués et commandes sur mesure sous séquestre. Les Revenus Nets correspondent aux Paiements Bruts diminués des frais partagés de passerelle (Open Banking A2A, règlement USDC et cartes).",
        ],
        bullets: [
          {
            label: "Formule de Rétribution des Revenus Nets",
            text: "Versement Créateur = 90 % (Fondateur) ou 80 % (Standard) × (Revenus Bruts − Frais Partagés de Traitement). SECCION conserve 10 % (Fondateur) ou 20 % (Standard). Les paiements Open Banking et Crypto USDC comportent 0,0 % de frais de passerelle.",
          },
          {
            label: "Statut de Prestataire Indépendant",
            text: "Les créateurs fixent librement leurs tarifs, leurs horaires et leur rythme de publication, sans clause d'exclusivité ni aucun lien de subordination salariale avec SECCION.",
          },
          {
            label: "Identification Fiscale et Déclaration aux Autorités",
            text: "Les créateurs assument l'entière responsabilité de leurs déclarations fiscales et sociales. Conformément à la Directive européenne DAC7 (2021/514) et aux règles fiscales américaines, la Plateforme vérifie votre NIF/TIN et numéro de TVA et déclare annuellement les paiements auprès de l'AEAT et des autorités compétentes (y compris formulaire 1099-NEC le cas échéant).",
          },
          {
            label: "Enregistrement CNMC et Transparence",
            text: "Conformément à la Loi Générale espagnole sur la Communication Audiovisuelle, la Plateforme respecte les obligations d'enregistrement, de transparence sur les Bénéficiaires Effectifs (UBO) et de déclaration des revenus publicitaires.",
          },
        ],
      },
      {
        id: "co-performers-2257",
        accent: "emerald",
        iconKey: "scale",
        title: "3. Vérification des Co-Intervenants et Règles 18 U.S.C. § 2257",
        tldrTitle: TLDR_TITLE.fr,
        tldr: "Si une autre personne apparaît dans vos vidéos ou photos intimes, elle doit également être vérifiée sans exception. Nous exigeons une pièce d'identité officielle et un selfie de présence avec pièce en main pour chaque co-intervenant avant publication. Toute apparition tierce non vérifiée entraîne la suspension du compte.",
        legalLabel: "⚖️ Termes Juridiques",
        introParagraphs: [
          "Pour protéger les circuits de paiement et assurer la conformité au statut 18 U.S.C. § 2257 ainsi qu'aux exigences européennes :",
        ],
        bullets: [
          {
            label: "KYC Obligatoire des Co-Intervenants",
            text: "Tout contenu explicite collaboratif ou avec co-intervenants ne peut être mis en ligne que si chaque participant est un membre vérifié de la Plateforme et dûment identifié sur la publication.",
          },
          {
            label: "Selfie avec Pièce d'Identité et Accord Signé",
            text: "Le créateur doit recueillir une pièce d'identité officielle avec photo, un selfie de présence du co-intervenant tenant son document et son consentement écrit signé avant toute publication.",
          },
          {
            label: "Contrôle d'Arrière-Plan",
            text: "Veillez à ce qu'aucun mineur ou personne non vérifiée n'apparaisse, même fortuitement, à l'arrière-plan. La présence de tiers non vérifiés constitue un motif immédiat de suspension définitive du compte.",
          },
        ],
      },
      {
        id: "watermarking-drm",
        accent: "cyan",
        iconKey: "globe",
        title: "4. Protection Anti-Piratage et Marquage Numérique (DRM)",
        tldrTitle: TLDR_TITLE.fr,
        tldr: "Nous protégeons vos contenus par des filigranes visibles et des signatures stéganographiques invisibles intégrées aux fichiers. En cas de fuite, nous identifions le compte d'abonné responsable et émettons immédiatement des notifications de retrait DMCA.",
        legalLabel: "⚖️ Termes Juridiques",
        introParagraphs: [
          "SECCION dote les créateurs d'outils technologiques avancés pour défendre leur propriété intellectuelle :",
        ],
        bullets: [
          {
            label: "Filigranes Visibles",
            text: "La Plateforme appose de manière configurable votre pseudonyme ou nom d'artiste sur vos images et vidéos.",
          },
          {
            label: "Marquage Stéganographique Invisible",
            text: "Des signatures forensiques de traçage sont intégrées de façon invisible dans les fichiers multimédias afin d'identifier le compte d'abonné à l'origine d'une éventuelle fuite.",
          },
          {
            label: "Retraits DMCA Automatisés",
            text: "SECCION fournit des outils automatisés pour générer et adresser des notifications de retrait DMCA et de droits d'auteur européens aux hébergeurs tiers et moteurs de recherche.",
          },
        ],
      },
      {
        id: "ai-suite-safety",
        accent: "emerald",
        iconKey: "bot",
        title: "5. Suite IA de Gestion et Outils de Sécurité du Créateur",
        tldrTitle: TLDR_TITLE.fr,
        tldr: "Gardez 100 % du contrôle de votre activité avec des outils IA conçus pour rendre caduques les agences à 40 % : auditez vos contrats, traduisez vos messages en direct et géobloquez les zones géographiques de votre choix.",
        legalLabel: "⚖️ Termes Juridiques",
        introParagraphs: [
          "Pour remplacer les agences intermédiaires abusives, SECCION met à votre disposition des outils IA et des filtres de confidentialité :",
        ],
        bullets: [
          {
            label: "Copilote de Contrats",
            text: "Notre scanner juridique intégré analyse vos contrats de sponsoring et accords d'agences afin de détecter les clauses abusives telles que la cession perpétuelle d'image ou d'exclusivité de propriété intellectuelle.",
          },
          {
            label: "Assistant d'Opérations",
            text: "L'assistant IA vous aide à gérer les demandes privées sur mesure, planifier vos directs, rédiger vos descriptions et traduire les messages (texte et notes vocales) en temps réel.",
          },
          {
            label: "Filtres de Géoblocage",
            text: "Préservez votre vie privée locale en masquant votre profil, vos flux en direct et vos albums dans les pays, régions ou villes de votre choix.",
          },
          {
            label: "Sécurité Bancaire et Boîte Postale",
            text: "Il est vivement recommandé aux créateurs d'utiliser un nom de scène distinct, une boîte postale professionnelle (PO Box) et un compte bancaire dédié pour leurs démarches fiscales.",
          },
        ],
      },
    ],
  },
};

const ALL_LEGAL_DOCS: Record<LegalDocId, Record<LegalLocale, LegalDocumentData>> = {
  terms: TERMS_DOCS,
  privacy: PRIVACY_DOCS,
  creator: CREATOR_DOCS,
};

export function getLegalDocument(docId: LegalDocId, locale?: string): LegalDocumentData {
  return ALL_LEGAL_DOCS[docId][normalizeLegalLocale(locale)];
}

export function getAllLegalDocumentVariants(): Array<{
  docId: LegalDocId;
  locale: LegalLocale;
  doc: LegalDocumentData;
}> {
  const result: Array<{ docId: LegalDocId; locale: LegalLocale; doc: LegalDocumentData }> = [];
  for (const docId of ["terms", "privacy", "creator"] as const) {
    for (const locale of ["en", "es", "fr"] as const) {
      result.push({ docId, locale, doc: ALL_LEGAL_DOCS[docId][locale] });
    }
  }
  return result;
}
