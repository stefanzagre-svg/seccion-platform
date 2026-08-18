"use client";

import PublicFooter from "@/components/PublicFooter";
import React, { useState, useEffect } from "react";
import { useTranslation } from "@/context/LanguageContext";
import PublicNavbar from "@/components/PublicNavbar";
import { SpecializationFilter } from "@/components/SpecializationFilter";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import MemberTourModal from "@/components/onboarding/MemberTourModal";
import { 
  Sparkles, 
  ShieldCheck, 
  EyeOff, 
  Lock, 
  Unlock, 
  TrendingUp, 
  Gift, 
  Key, 
  ChevronRight, 
  Check, 
  AlertTriangle,
  HelpCircle,
  Heart,
  ArrowUpRight,
  UserCheck,
  Compass,
  Activity,
  Bot
} from "lucide-react";

// Double-Bezel Card wrapper matching SECCION design guidelines
function DoubleBezelCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-[2.5rem] p-1 bg-white/[0.04] border border-white/10 shadow-[0_24px_48px_-12px_rgba(0,0,0,0.6)] backdrop-blur-xl relative overflow-visible ${className}`}>
      <div className="absolute inset-0 border border-white/5 rounded-[2.5rem] pointer-events-none" />
      <div className="rounded-[calc(2.5rem-0.25rem)] bg-[#0F0F1A]/95 p-6 md:p-8 border border-white/5 relative z-10 overflow-visible">
        {children}
      </div>
    </div>
  );
}


const getMockCreators = (locale: string) => [
  {
    id: "elena",
    name: "Elena Vance",
    specialization: "beauty",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80",
    badge: locale === "es" ? "Arquitecta de Belleza 💄" : "Beauty Architect 💄",
    badgeColor: "bg-[#ffabf3]/15 border-[#ffabf3]/40 text-[#ffabf3]",
    borderColor: "border-[#ffabf3]",
    sampleActivity: locale === "es" ? "Glow-Up de Maquillaje" : "Makeup Glow-Up",
    description: locale === "es" ? "Ayudo a miembros a crear looks de maquillaje radiantes para citas nocturnas y rutinas de skincare personalizadas." : "I help members create glowing date-night makeup looks and personalized skincare routines.",
    tags: ["#EveningGlam", "#GRWM"],
    actionLabel: locale === "es" ? "Solicitar Orden de Estilo ($15)" : "Request Style Order ($15)",
    buttonHoverColor: "hover:bg-[#ffabf3]/20 hover:border-[#ffabf3]/50",
    isAdult: false
  },
  {
    id: "sofia",
    name: "Sofia Rossi",
    specialization: "style",
    image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&q=80",
    badge: locale === "es" ? "Estilista de Outfits 👗" : "Outfit Stylist 👗",
    badgeColor: "bg-amber-500/15 border border-amber-400/40 text-amber-300",
    borderColor: "border-amber-400",
    sampleActivity: locale === "es" ? "Fit Check" : "Fit Check",
    description: locale === "es" ? "Envíame 2 opciones de outfit antes de tu cita; te diré qué fit check tiene la mejor vibra." : "Send me 2 outfit choices before your date - I'll tell you which fit check gets the best vibe.",
    tags: ["#DateStyle", "#FitCheck"],
    actionLabel: locale === "es" ? "Solicitar Auditoría de Fit ($15)" : "Request Fit Audit ($15)",
    buttonHoverColor: "hover:bg-amber-500/20 hover:border-amber-400/50",
    isAdult: false
  },
  {
    id: "marco",
    name: "Chef Marco",
    specialization: "culinary",
    image: "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=150&q=80",
    badge: locale === "es" ? "Maestro Culinario 👨‍🍳" : "Culinary Master 👨‍🍳",
    badgeColor: "bg-emerald-500/15 border border-emerald-400/40 text-emerald-300",
    borderColor: "border-emerald-400",
    sampleActivity: locale === "es" ? "Cena para Deslumbrar" : "Impression Dinner",
    description: locale === "es" ? "Aprende recetas gourmet en 20 minutos que impresionan en tus citas siempre. Platillos sencillos de alta vibra." : "Learn 20-minute gourmet recipes that impress dates every single time. Simple, high-vibe dishes.",
    tags: ["#RomanticRecipes", "#ImpressionDinner"],
    actionLabel: locale === "es" ? "Reservar Clase de Cocina ($20)" : "Book Cooking Class ($20)",
    buttonHoverColor: "hover:bg-emerald-500/20 hover:border-emerald-400/50",
    isAdult: false
  },
  {
    id: "liam",
    name: "Liam Vance",
    specialization: "dating",
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&q=80",
    badge: locale === "es" ? "Wingman de Citas 🔮" : "Dating Wingman 🔮",
    badgeColor: "bg-purple-500/15 border border-purple-400/40 text-purple-300",
    borderColor: "border-purple-400",
    sampleActivity: locale === "es" ? "Consejo de Opener" : "Opener Advice",
    description: locale === "es" ? "Analizamos el arquetipo de tu match y creamos un rompehielos a medida para desbloquear Química Nivel 3+." : "We analyze your match's archetype and craft tailored icebreaker advice to unlock Chemistry Level 3+.",
    tags: ["#OpenerAdvice", "#ChemistryCoach"],
    actionLabel: locale === "es" ? "Solicitar Auditoría de Opener ($10)" : "Request Opener Audit ($10)",
    buttonHoverColor: "hover:bg-purple-500/20 hover:border-purple-400/50",
    isAdult: false
  },
  {
    id: "david",
    name: "David Chen",
    specialization: "career",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80",
    badge: locale === "es" ? "Estratega Profesional 💼" : "Career Strategist 💼",
    badgeColor: "bg-blue-500/15 border border-blue-400/40 text-blue-300",
    borderColor: "border-blue-400",
    sampleActivity: locale === "es" ? "Auditoría de LinkedIn" : "LinkedIn Audit",
    description: locale === "es" ? "Audito tu LinkedIn, refino tu presencia ejecutiva y te entreno en estrategias de negociación salarial." : "I audit your LinkedIn, refine your executive presence, and coach salary negotiation strategy.",
    tags: ["#ExecutivePresence", "#CareerCoaching"],
    actionLabel: locale === "es" ? "Solicitar Auditoría de LinkedIn ($25)" : "Request LinkedIn Audit ($25)",
    buttonHoverColor: "hover:bg-blue-500/20 hover:border-blue-400/50",
    isAdult: false
  },
  {
    id: "amara",
    name: "Amara Okafor",
    specialization: "wellness",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80",
    badge: locale === "es" ? "Guía de Bienestar 🌿" : "Wellness Guide 🌿",
    badgeColor: "bg-teal-500/15 border border-teal-400/40 text-teal-300",
    borderColor: "border-teal-400",
    sampleActivity: locale === "es" ? "Taller de Mindfulness" : "Mindfulness Workshop",
    description: locale === "es" ? "Sesiones de breathwork, protocolos para optimizar el sueño y resiliencia al estrés para personas de alto rendimiento." : "Breathwork sessions, sleep optimization protocols, and stress resilience for high achievers.",
    tags: ["#WellnessGuide", "#Mindfulness"],
    actionLabel: locale === "es" ? "Unirme a Sesión de Breathwork ($15)" : "Join Breathwork Session ($15)",
    buttonHoverColor: "hover:bg-teal-500/20 hover:border-teal-400/50",
    isAdult: false
  },
  {
    id: "alexandre",
    name: "Alexandre Dubois",
    specialization: "financial",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&q=80",
    badge: locale === "es" ? "Arquitecto Financiero 💰" : "Financial Architect 💰",
    badgeColor: "bg-amber-500/15 border border-amber-400/40 text-amber-300",
    borderColor: "border-amber-400",
    sampleActivity: locale === "es" ? "Revisión Patrimonial" : "Wealth Review",
    description: locale === "es" ? "Construye independencia financiera, domina inversiones automatizadas y planifica tus metas patrimoniales a largo plazo." : "Build financial independence, master automated investing, and plan long-term wealth goals.",
    tags: ["#WealthPlanning", "#FinancialFreedom"],
    actionLabel: locale === "es" ? "Agendar Revisión Patrimonial ($25)" : "Schedule Wealth Review ($25)",
    buttonHoverColor: "hover:bg-amber-500/20 hover:border-amber-400/50",
    isAdult: false
  },
  {
    id: "ryan",
    name: "Ryan Gallagher",
    specialization: "fitness",
    image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=150&q=80",
    badge: locale === "es" ? "Coach de Fitness 🏋️" : "Fitness Coach 🏋️",
    badgeColor: "bg-[#00fbfb]/15 border border-[#00fbfb]/40 text-[#00fbfb]",
    borderColor: "border-[#00fbfb]",
    sampleActivity: locale === "es" ? "Auditoría de Vitalidad" : "Vitality Audit",
    description: locale === "es" ? "Evaluaciones posturales personalizadas, planes de entrenamiento HIIT a medida y rutinas de biohackeo." : "Personalized posture assessments, customized high-intensity interval training plans, and bio-hacking routines.",
    tags: ["#FitnessCoach", "#VitalityAudit"],
    actionLabel: locale === "es" ? "Solicitar Auditoría Fitness ($20)" : "Request Fitness Audit ($20)",
    buttonHoverColor: "hover:bg-[#00fbfb]/20 hover:border-[#00fbfb]/50",
    isAdult: false
  },
  {
    id: "maya",
    name: "Maya Lin",
    specialization: "creative",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&q=80",
    badge: locale === "es" ? "Alquimista Creativa 🎨" : "Creative Alchemist 🎨",
    badgeColor: "bg-rose-500/15 border border-rose-400/40 text-rose-300",
    borderColor: "border-rose-400",
    sampleActivity: locale === "es" ? "Set Acústico & Comisiones de Arte" : "Acoustic Set & Art Commissions",
    description: locale === "es" ? "Ilustraciones digitales personalizadas, sesiones acústicas en vivo y talleres de flujo para lluvia de ideas creativas." : "Custom digital illustrations, live streaming acoustic sessions, and creative brainstorming flow workshops.",
    tags: ["#ArtCommission", "#LiveMusic"],
    actionLabel: locale === "es" ? "Solicitar Comisión de Arte ($30)" : "Request Art Commission ($30)",
    buttonHoverColor: "hover:bg-rose-500/20 hover:border-rose-400/50",
    isAdult: false
  },
  {
    id: "kai",
    name: "Kai Thorne",
    specialization: "ai_tech",
    image: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&q=80",
    badge: locale === "es" ? "Arquitecto IA & Tech 💻" : "AI & Tech Architect 💻",
    badgeColor: "bg-cyan-500/15 border border-cyan-400/40 text-cyan-300",
    borderColor: "border-cyan-400",
    sampleActivity: locale === "es" ? "Masterclass IA & Tareas de Software por Encargo" : "AI Masterclass & Custom Task Builds",
    description: locale === "es" ? "Cursos avanzados de IA, ingeniería de prompts, consultoría y tareas de software a medida construidas por encargo." : "Advanced AI courses, prompt engineering, architecture consulting, and custom software tasks built on order.",
    tags: ["#AIEngineering", "#CustomSoftware", "#PromptOps", "#Automation"],
    actionLabel: locale === "es" ? "Solicitar Tarea de Software ($30)" : "Request Custom Tech Task ($30)",
    buttonHoverColor: "hover:bg-cyan-500/20 hover:border-cyan-400/50",
    isAdult: false
  },
  {
    id: "valeria",
    name: "Valeria Night",
    specialization: "adult",
    image: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&q=80",
    badge: locale === "es" ? "Creadora Sensual 18+ 🔞" : "18+ Sensual Creator 🔞",
    badgeColor: "bg-red-500/20 border border-red-500/50 text-red-300",
    borderColor: "border-red-500",
    sampleActivity: locale === "es" ? "Arte Sensual & Streams VIP Privados" : "Sensual Art & Private VIP Streams",
    description: locale === "es" ? "Contenido VIP 18+ privado, streams a puerta cerrada y sesiones artísticas íntimas." : "Private 18+ VIP content, behind-closed-doors streams, and intimate artistic shoots.",
    tags: ["#SensualContent", "#PrivateStream"],
    actionLabel: locale === "es" ? "Acceder al Espacio VIP ($15)" : "Access VIP Space ($15)",
    buttonHoverColor: "hover:bg-red-600/50",
    isAdult: true
  }
];

const getComparisonData = (locale: string) => [
  {
    metric: locale === "es" ? "Tarifa de Matching" : "Matching Fee",
    seccion: locale === "es" ? "Matching 100% Gratis" : "100% Free Matching",
    tinder: locale === "es" ? "Tarifas de Boost para ser visto" : "Boost fees required to be seen",
    bumble: locale === "es" ? "Boosts de visibilidad de pago" : "Paid visibility boosts",
    hinge: locale === "es" ? "Likes premium de pago requeridos" : "Paid premium likes required"
  },
  {
    metric: locale === "es" ? "Sistema de Conexión" : "Connection System",
    seccion: locale === "es" ? "Medidor de Química de 8 Niveles" : "8-Level Chemistry Meter",
    tinder: locale === "es" ? "Historial superficial de swipes" : "Shallow swipe history",
    bumble: locale === "es" ? "Cuenta regresiva en conversaciones de texto" : "Text conversation countdown",
    hinge: locale === "es" ? "Likes en prompts estáticos del perfil" : "Static profile prompt likes"
  },
  {
    metric: locale === "es" ? "Asistente de Citas" : "Dating Assistant",
    seccion: locale === "es" ? "IA Dating Coach & Wingman" : "Dating Coach & Wingman AI",
    tinder: locale === "es" ? "Sin soporte de asistente" : "No assistant support",
    bumble: locale === "es" ? "Sin soporte de asistente" : "No assistant support",
    hinge: locale === "es" ? "Sin soporte de asistente" : "No assistant support"
  },
  {
    metric: locale === "es" ? "Seguridad & Catfishing" : "Safety & Catfishing",
    seccion: locale === "es" ? "Verificación Facial (Solo check, sin almacenar doc)" : "Face Check (Verification only, no doc storage)",
    tinder: locale === "es" ? "Permanecen perfiles sin verificar" : "Unverified profiles remain",
    bumble: locale === "es" ? "Insignia azul básica" : "Basic blue badge",
    hinge: locale === "es" ? "Insignia de verificación básica" : "Basic verification badge"
  },
  {
    metric: locale === "es" ? "Control de Privacidad" : "Privacy Control",
    seccion: locale === "es" ? "Anclas de Estilo + Llaves de Vistazo Limitado" : "Reveal Anchors + Limited Peek keys",
    tinder: locale === "es" ? "Descubrimiento de perfil únicamente público" : "Public profile discovery only",
    bumble: locale === "es" ? "Modo incógnito (solo con suscripción premium)" : "Incognito mode (premium only)",
    hinge: locale === "es" ? "Descubrimiento de perfil únicamente público" : "Public profile discovery only"
  }
];

const getFaqs = (locale: string) => [
  {
    q: locale === "es" ? "¿El matchmaking en SECCION es realmente 100% gratis para miembros?" : "Is SECCION matchmaking really 100% free for members?",
    a: locale === "es" ? "Sí. Todo el matchmaking, los canales de comunicación, los chequeos de radar de compatibilidad y nuestro asistente Dating Coach son gratis. A diferencia de otras plataformas que bloquean la visibilidad detrás de cuotas mensuales porque tienen demasiados perfiles de un solo género, SECCION se financia con nuestras capas de monetización de creadores. Esto significa que te valoramos como un socio en la conexión, no como un cliente al cual cobrarle." : "Yes. All matchmaking, communication channels, compatibility radar checks, and our Dating Coach assistant are free. Unlike other platforms that lock visibility behind monthly fees because they have too many profiles of one gender, SECCION is funded by our creator monetization layers. This means we value you as a partner in connection, not as a customer to be billed."
  },
  {
    q: locale === "es" ? "¿Cómo me conecta con matches el motor de Synergy?" : "How does the Synergy matching engine connect me with matches?",
    a: locale === "es" ? "En lugar de ordenar solo por proximidad o fotos, nuestro motor lee tu estilo personal, preferencias de vibra y mood actual para sugerirte matches. Te brinda una explicación simple y directa de por qué un match encaja con tu vibra, omitiendo hojas de cálculo aburridas y fórmulas para centrarse en una compatibilidad real." : "Instead of just sorting by proximity or photos, our engine reads your personal style, vibe preferences, and current mood to suggest matches. It provides a simple, direct explanation of why a match fits your vibe, skipping boring spreadsheets and formulas to focus on real compatibility."
  },
  {
    q: locale === "es" ? "¿Qué es el Medidor de Química y cómo funcionan los niveles?" : "What is the Chemistry Meter and how do levels work?",
    a: locale === "es" ? "El Medidor de Química es nuestro indicador de progreso. Rastrea el impulso mutuo en el chat y la actividad, escalando desde Nivel 1 (Indefinido) hasta Nivel 8 (Alma Gemela). A medida que sube tu Nivel de Vibra, la plataforma desbloquea automáticamente nuevas funciones, plantillas para citas en el mundo real y capacidades de intercambio más profundas." : "The Chemistry Meter is our progress gauge. It tracks mutual chat momentum and activity, scaling from Level 1 (Undefined) up to Level 8 (Soulmate). As your Vibe Level increases, the platform unlocks new features, real-world date templates, and deeper sharing capabilities automatically."
  },
  {
    q: locale === "es" ? "¿Cómo protege mi privacidad la Progresión de Revelado manteniendo el atractivo en el dating?" : "How does the Reveal Progression protect privacy while keeping dating attractive?",
    a: locale === "es" ? "Los perfiles muestran dos 'Anclas Estéticas' claras y sin desenfoque (fotos de estilo de vida, siluetas o vibras de moda) para que puedas sentir el estilo del partner. El retrato principal permanece desenfocado o visible según tus ajustes de privacidad. Puedes solicitar un 'Vistazo Limitado' de 5 minutos o recibir una 'Llave de Desbloqueo' (pase de visión clara por 24 horas) directamente de tu match para revelar los detalles." : "Profiles feature two clear, unblurred 'Aesthetic Anchors' (lifestyle shots, silhouette, or fashion vibes) so you can feel a partner's style. The main portrait stays blurred or visible based on privacy settings. You can request a 5-minute 'Limited Peek' or receive an 'Unblur Key' (24-hour clear view pass) directly from your match to reveal details."
  },
  {
    q: locale === "es" ? "¿Qué son los 'Creadores Patrocinados' y la Suscripción Master?" : "What are 'Sponsored Creators' and the Master Subscription?",
    a: locale === "es" ? "Los Creadores Patrocinados son creadores que eliges apoyar directamente. Una única Suscripción Master te conecta con hasta 10 creadores seleccionados de tu lista, desbloqueando sus espacios de trabajo exclusivos, canales y streams. Esto te brinda contenido de alta fidelidad y conexiones cercanas en un solo paquete mensual simple." : "Sponsored Creators are creators you choose to support directly. A single Master Subscription connects you with up to 10 chosen creators from your list, unlocking their exclusive workspaces, channels, and streams. This gives you high-fidelity content and close matches in one simple monthly bundle."
  },
  {
    q: locale === "es" ? "¿Puedo actualizar de una cuenta de Miembro a una cuenta de Creador?" : "Can I upgrade from a Member account to a Creator account?",
    a: locale === "es" ? "Sí. Para prevenir spam y mantener una comunidad verificada, debes registrarte primero con una cuenta de Miembro. Una vez que tu cuenta de miembro esté activa, puedes ir fácilmente a tu Configuración de Cuenta para solicitar el Upgrade a Creador, verificar tus canales externos y desbloquear el panel de Creator Studio." : "Yes. To prevent spam and maintain a verified community, you must sign up for a Member account first. Once your member account is active, you can easily go to your Account Settings to apply for a Creator Upgrade, verify your external channels, and unlock the Creator Studio dashboard."
  },
  {
    q: locale === "es" ? "¿Cómo funcionan los Planes de Citas (Date Plans)? ¿Son gratis?" : "How do Date Plans work? Are they free?",
    a: locale === "es" ? "Sí. Los miembros pueden crear gratis un Plan de Citas personalizado al mes (una propuesta de cita concreta y con fecha/hora), y tienes postulaciones ilimitadas para aplicar a citas publicadas por otros miembros o creadores. Confirmar una cita impulsa tu Medidor de Química, ayudándote a salir del limbo de las 'situationships' y conocerse en persona." : "Yes. Members can create one customized Date Plan (a concrete, time-bound date proposal) per month for free, and you get unlimited applications to apply to dates posted by other members or creators. Confirming a date boosts your Chemistry Meter, helping you skip situationship limbo and meet in person."
  },
  {
    q: locale === "es" ? "¿Cómo me ayuda a conectar el Dating Coach IA?" : "How does the Dating Coach AI help me connect?",
    a: locale === "es" ? "Nuestro Wingman IA integrado actúa como un coach de relaciones digital y asistente de plataforma. Evalúa el impulso en la fluidez del chat (Gravedad de Conexión), sugiere rompehielos cálidos y resalta los mejores momentos para invitar a tu pareja a una cita para un café, basándose en sus arquetipos de estilo de vida." : "Our built-in AI Wingman acts as a digital relationship coach and platform assistant. It reads chat flow momentum (Connection Gravity), suggests warm icebreakers, and highlights the best moments to invite a partner on a coffee date based on their lifestyle archetypes."
  },
  {
    q: locale === "es" ? "¿Cómo verifica SECCION la seguridad de mi perfil sin almacenar mis documentos de identidad?" : "How does SECCION verify profile safety without storing my ID documents?",
    a: locale === "es" ? "Para desbloquear citas en el mundo real (Nivel 4+), los usuarios completan una verificación facial y de prueba de vida segura para confirmar que coinciden con sus fotos de perfil. Para respetar tu privacidad al máximo, SECCION no almacena ningún documento oficial de identidad. En cuanto la verificación es exitosa, todos los archivos biométricos y de identificación se eliminan de forma permanente." : "To unlock real-world dating moves (Level 4+), users complete a secure face verification and liveness check to confirm they match their profile photos. To respect your privacy, SECCION does not store any official identity documents. Once the check succeeds, all ID media is permanently deleted."
  },
  {
    q: locale === "es" ? "¿Puedo conectar y hablar con matches en otros países?" : "Can I connect and talk with matches in other countries?",
    a: locale === "es" ? "Por supuesto. Nuestra plataforma está construida para vibras globales (conectando EE. UU., Reino Unido, Europa y Sudamérica). Nuestra puerta de enlace de Traducción en Vivo traduce mensajes de texto y voz automáticamente en tiempo real, permitiéndote hablar y escuchar sin fisuras en tus idiomas nativos." : "Absolutely. Our platform is built for global vibes (matching US, UK, EU, and South America). Our Live Translation gateway automatically translates text and voice messages in real-time, allowing you to speak and listen in your native languages seamlessly."
  }
];

export default function VibeRadarPage() {
  const router = useRouter();
  const { t, locale } = useTranslation();

  const [selectedSpecialization, setSelectedSpecialization] = useState<string>("all");
  const [includeAdultContent, setIncludeAdultContent] = useState<boolean>(false);
  
  const [isTourOpen, setIsTourOpen] = useState(false);
  
  // Reveal progression simulation states
  const [peekCountdown, setPeekCountdown] = useState<number | null>(null);
  const [hasUnblurKey, setHasUnblurKey] = useState<boolean>(false);
  const [isFaceBlurred, setIsFaceBlurred] = useState<boolean>(true);
  
  // Dynamic FAQ state
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  // Limited Peek simulation timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (peekCountdown !== null && peekCountdown > 0) {
      interval = setInterval(() => {
        setPeekCountdown(prev => (prev !== null ? prev - 1 : null));
      }, 1000);
    } else if (peekCountdown === 0) {
      setPeekCountdown(null);
      setIsFaceBlurred(true);
    }
    return () => clearInterval(interval);
  }, [peekCountdown]);

  const handlePeekRequest = () => {
    setIsFaceBlurred(false);
    setPeekCountdown(10); // 10 second demo countdown
    setHasUnblurKey(false);
  };

  const handleApplyKey = () => {
    setIsFaceBlurred(false);
    setHasUnblurKey(true);
    setPeekCountdown(null);
  };

  const resetRevealDemo = () => {
    setIsFaceBlurred(true);
    setPeekCountdown(null);
    setHasUnblurKey(false);
  };

  // Format timer text
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Competitor Matrix Data
  const comparisonData = getComparisonData(locale || "en");

  // Member FAQ Data (10 Questions focusing on Members)
  const faqs = getFaqs(locale || "en");
  const mockCreators = getMockCreators(locale || "en");

  return (
    <div 
      className="w-full min-h-[100dvh] text-[#e2e2e2] overflow-x-hidden font-sans bg-transparent relative flex flex-col"
      style={{
        backgroundImage: "radial-gradient(circle at 15% 50%, rgba(255, 171, 243, 0.05), transparent 25%), radial-gradient(circle at 85% 30%, rgba(0, 251, 251, 0.05), transparent 25%)"
      }}
    >
      
      
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

      {/* Floating Header */}
      <PublicNavbar activeTab="vibe-radar" />

      {/* Hero Section */}
      <header className="relative z-10 pt-28 sm:pt-36 pb-20 px-4 sm:px-6 md:px-12 lg:px-20 max-w-[1280px] mx-auto w-full flex-grow flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center w-full">
          
          {/* Left Column: Core pitch */}
          <div className="col-span-12 lg:col-span-6 space-y-8 text-left">
            <span className="text-[10px] font-mono font-bold text-[#00fbfb] bg-[#00fbfb]/5 border border-[#00fbfb]/25 px-3 py-1 rounded-full uppercase tracking-wider">
              {locale === "es" ? "Una Nueva Era de Conexión" : "A New Era of Connection"}
            </span>
            <h1 className="font-display font-black leading-[1.05] tracking-[-0.04em] text-white">
              <span className="block text-[42px] sm:text-[62px] md:text-[80px]">{locale === "es" ? "Deja de Pagar" : "Stop Paying"}</span>
              <span className="block text-[#00fbfb] drop-shadow-[0_0_25px_rgba(0,251,251,0.3)] text-[36px] sm:text-[52px] md:text-[66px] mt-2">{locale === "es" ? "Para Ser Visto." : "To Be Seen."}</span>
            </h1>
            <p className="text-sm sm:text-base text-[#b9cac9] leading-relaxed max-w-xl">
              {locale === "es" 
                ? "Las apps de citas tradicionales explotan los desequilibrios de género, cobrándote solo por escapar del fondo de su pila. En SECCION, nuestra plataforma se financia en su totalidad por las herramientas de monetización de creadores. Esto nos permite mantener el matchmaking y el chat **100% gratis** para los miembros. No eres un objetivo al cual exprimir; eres un socio valioso en la comunidad."
                : "Traditional dating apps exploit gender imbalances, charging you just to escape the bottom of their stack. On SECCION, our platform is fully funded by our creator monetization features. This allows us to keep matching and chatting **100% free** for members. You are not a target to be squeezed; you are a valued partner in the community."}
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <Link 
                href="/early-access"
                className="px-8 py-3.5 rounded-full bg-[#00fbfb] text-black font-mono text-xs font-black uppercase tracking-wider hover:shadow-[0_0_20px_rgba(0,251,251,0.5)] transition active:scale-[0.98] cursor-pointer"
              >
                {locale === "es" ? "Unirme al Quest de Onboarding" : "Join Onboarding Quest"}
              </Link>
              <button 
                type="button"
                onClick={() => setIsTourOpen(true)}
                className="px-8 py-3.5 rounded-full border-2 border-[#ffabf3] text-[#ffabf3] font-mono text-xs font-black uppercase tracking-wider bg-transparent hover:bg-[#ffabf3]/10 transition active:scale-[0.98] cursor-pointer shadow-[0_0_15px_rgba(255,171,243,0.3)] hover:shadow-[0_0_25px_rgba(255,171,243,0.5)]"
              >
                {locale === "es" ? "Vista Previa de Cabina de Miembro" : "Preview Member Cockpit"}
              </button>
            </div>
          </div>

          {/* Right Column: TOP Profile Preview Card */}
          <div className="col-span-12 lg:col-span-6 flex justify-center">
            <DoubleBezelCard className="w-full max-w-[380px]">
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">{locale === "es" ? "Ranking de Miembros TOP" : "Top Members Leaderboard"}</h3>
                  <span className="flex items-center gap-1.5 text-[9px] font-mono text-[#ffabf3] bg-[#ffabf3]/5 border border-[#ffabf3]/25 px-2 py-0.5 rounded-full uppercase">
                    <Sparkles className="w-3 h-3 text-[#ffabf3] animate-pulse" /> {locale === "es" ? "Activos en Ranking" : "Ranked Active"}
                  </span>
                </div>

                {/* Mock Leaderboard rows */}
                <div className="space-y-3.5">
                  <div className="p-3 bg-white/[0.03] border border-white/5 rounded-xl flex justify-between items-center hover:bg-white/[0.05] transition">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs font-bold text-white/40">#1</span>
                      <div className="relative w-9 h-9 rounded-full overflow-hidden border border-[#00fbfb]/30">
                        <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80" alt="Liam" className="w-full h-full object-cover" />
                      </div>
                      <div className="text-left">
                        <h4 className="text-xs font-bold text-white">Liam</h4>
                        <span className="text-[9px] text-[#b9cac9]">{locale === "es" ? "Especialista en Match de Vibra" : "Vibe Match Specialist"}</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-[#00fbfb]">{locale === "es" ? "L5 Íntimo" : "L5 Intimate"}</span>
                  </div>

                  <div className="p-3 bg-white/[0.03] border border-white/5 rounded-xl flex justify-between items-center hover:bg-white/[0.05] transition">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs font-bold text-white/40">#2</span>
                      <div className="relative w-9 h-9 rounded-full overflow-hidden border border-[#ffabf3]/30">
                        <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80" alt="Sarah" className="w-full h-full object-cover" />
                      </div>
                      <div className="text-left">
                        <h4 className="text-xs font-bold text-white">Sarah</h4>
                        <span className="text-[9px] text-[#b9cac9]">{locale === "es" ? "Explora Activa" : "Active Explorer"}</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-[#ffabf3]">{locale === "es" ? "L4 Cercano" : "L4 Close"}</span>
                  </div>

                  <div className="p-3 bg-white/[0.03] border border-white/5 rounded-xl flex justify-between items-center hover:bg-white/[0.05] transition">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs font-bold text-white/40">#3</span>
                      <div className="relative w-9 h-9 rounded-full overflow-hidden border border-white/10">
                        <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80" alt="Mateo" className="w-full h-full object-cover" />
                      </div>
                      <div className="text-left">
                        <h4 className="text-xs font-bold text-white">Mateo</h4>
                        <span className="text-[9px] text-[#b9cac9]">{locale === "es" ? "Contribuidor de Vibra" : "Vibe Contributor"}</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-[#b9cac9]">{locale === "es" ? "L3 Amigable" : "L3 Friendly"}</span>
                  </div>
                </div>

                <p className="text-[9px] text-[#b9cac9]/50 text-center leading-relaxed font-mono">
                  {locale === "es" ? "El ranking se actualiza a diario basándose en la gravedad de conversación y Planes de Citas completados. Los perfiles top ganan beneficios especiales en la comunidad." : "Ranked updates daily based on conversation gravity and completed Date Plans. Top profiles gain special community perks."}
                </p>
              </div>
            </DoubleBezelCard>
          </div>

        </div>
      </header>


      {/* Creators by Specialization Section */}
      <section className="relative z-10 py-24 px-4 sm:px-6 md:px-12 lg:px-20 max-w-[1280px] mx-auto w-full border-t border-white/5 bg-[#050505]/20">
        <div className="max-w-6xl mx-auto space-y-12 text-center">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 text-left">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ffabf3]/5 border border-[#ffabf3]/25 text-xs font-mono font-bold text-[#ffabf3]">
                <Sparkles className="w-3.5 h-3.5 text-[#ffabf3]" />
                <span>{locale === "es" ? "Mentores & Catalizadores de Conexión" : "Mentors & Connection Catalysts"}</span>
              </div>
              <h2 className="font-display text-3xl md:text-5xl font-black text-white tracking-tight">
                {locale === "es" ? "Explora Creadores por Especialización" : "Explore Creators by Specialization"}
              </h2>
              <p className="text-xs sm:text-sm text-[#b9cac9] max-w-xl leading-relaxed">
                {locale === "es" ? "Sube el nivel de tu confianza en citas, estilo de outfit, glow-up de maquillaje e índice de conexión química con nuestros especialistas en vibras seleccionados a mano." : "Level up your date night confidence, outfit style, makeup glow-up, and chemical connection index with our hand-selected vibe specialists."}
              </p>
            </div>
          </div>

          {/* Interactive Specialization Filter & SafeSearch Toggle */}
          <div className="pt-4">
            <SpecializationFilter
              selectedId={selectedSpecialization}
              onSelectSpecialization={setSelectedSpecialization}
              includeAdult={includeAdultContent}
              onToggleAdult={setIncludeAdultContent}
            />
          </div>

          {/* Grid of Creators */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
            {mockCreators
              .filter(creator => {
                if (creator.isAdult && !includeAdultContent) return false;
                if (selectedSpecialization !== 'all' && creator.specialization !== selectedSpecialization) return false;
                return true;
              })
              .map(creator => (
                <div 
                  key={creator.id}
                  className={`p-5 rounded-2xl bg-white/[0.02] border ${creator.borderColor || 'border-white/5'} hover:bg-white/[0.04] transition-all space-y-4 text-left group`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-mono font-bold ${creator.badgeColor} flex items-center gap-1.5`}>
                      {creator.badge}
                    </span>
                    <span className="text-[10px] font-mono text-white/40 bg-white/5 px-2 py-0.5 rounded-full">
                      {creator.sampleActivity}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-full overflow-hidden border-2 ${creator.borderColor || 'border-white/20'} shrink-0`}>
                      <img src={creator.image} alt={creator.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white group-hover:text-[#00fbfb] transition-colors">{creator.name}</h3>
                      <p className="text-[11px] text-[#b9cac9] font-mono capitalize">{creator.specialization} {locale === "es" ? "especialista" : "specialist"}</p>
                    </div>
                  </div>
                  <p className="text-xs text-[#b9cac9] leading-relaxed min-h-[36px]">
                    {creator.description}
                  </p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {creator.tags.map((tag, tIdx) => (
                      <span key={tIdx} className="text-[9px] font-mono text-white/30 bg-white/5 px-2 py-0.5 rounded-md">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <button 
                    type="button"
                    onClick={() => alert(locale === "es" ? `Conectando con ${creator.name} para ${creator.sampleActivity}...` : `Connecting with ${creator.name} for ${creator.sampleActivity}...`)}
                    className={`w-full py-2 rounded-xl bg-white/5 border border-white/10 ${creator.buttonHoverColor || 'hover:bg-[#00fbfb]/20 hover:border-[#00fbfb]/50'} text-xs font-mono font-bold text-white transition-all text-center block cursor-pointer`}
                  >
                    {creator.actionLabel}
                  </button>
                </div>
              ))}
          </div>
        </div>
      </section>

      {/* Swipe Recession / Sociological Section */}
      <section className="relative z-10 py-24 px-4 sm:px-6 md:px-12 lg:px-20 max-w-[1280px] mx-auto w-full border-t border-white/5 bg-[#050505]/20">
        <div className="max-w-4xl mx-auto space-y-12 text-center">
          <div className="space-y-4">
            <span className="text-[10px] font-mono font-bold text-[#ffabf3] bg-[#ffabf3]/5 border border-[#ffabf3]/25 px-3 py-1 rounded-full uppercase tracking-wider">
              {locale === "es" ? "Escapa de la Trampa del Swiping" : "Escape the Swiping Trap"}
            </span>
            <h2 className="font-display text-3xl md:text-5xl font-black text-white tracking-tight">
              {locale === "es" ? "¿Cansado del Ruido Digital Interminable?" : "Tired of Endless Digital Noise?"}
            </h2>
            <p className="text-xs sm:text-sm text-[#b9cac9] max-w-xl mx-auto leading-relaxed">
              {locale === "es" ? "Las apps de citas en 2026 se han convertido en catálogos transaccionales virtuales. Estamos atrapados en la etapa de 'solo hablar', experimentando fatiga de swiping y pagando por funciones que nunca se convierten en citas reales." : "Dating apps in 2026 have become virtual transaction catalogs. We are stuck in the 'just talking' phase, experiencing swiping fatigue, and paying for features that never turn into real dates."}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
            <div className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl space-y-4">
              <h3 className="text-sm font-bold text-rose-400 uppercase tracking-wider font-mono">{locale === "es" ? "La Trampa de las Apps Tradicionales" : "The Traditional App Trap"}</h3>
              <ul className="space-y-2 text-xs text-[#b9cac9] leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="text-rose-400 font-bold shrink-0 mt-0.5">•</span>
                  {locale === "es" ? "Ratios de +65% de hombres crean cuellos de botella en la visibilidad hipercompetitiva." : "65%+ male ratios create hyper-competitive visibility bottlenecks."}
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-400 font-bold shrink-0 mt-0.5">•</span>
                  {locale === "es" ? "Niveles premium sin tope te obligan a pagar solo para que tus mensajes sean leídos." : "Uncapped premium tiers force you to pay just to have your messages read."}
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-400 font-bold shrink-0 mt-0.5">•</span>
                  {locale === "es" ? "Limbo constante de 'situationship' sin un camino claro hacia planes en el mundo real." : "Constant 'situationship' limbo without a path to real-world plans."}
                </li>
              </ul>
            </div>

            <div className="p-6 bg-[#00fbfb]/5 border border-[#00fbfb]/10 rounded-2xl space-y-4">
              <h3 className="text-sm font-bold text-[#00fbfb] uppercase tracking-wider font-mono">{locale === "es" ? "El Camino SECCION" : "The SECCION Way"}</h3>
              <ul className="space-y-2 text-xs text-[#b9cac9] leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="text-[#00fbfb] font-bold shrink-0 mt-0.5">•</span>
                  {locale === "es" ? "Las suscripciones de creadores financian el matching, manteniendo las funciones de citas 100% gratis." : "Creator subscriptions fund matching, keeping basic dating features 100% free."}
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#00fbfb] font-bold shrink-0 mt-0.5">•</span>
                  {locale === "es" ? "Planes de Citas estructurados y niveles convierten el chat digital en citas verificadas." : "Structured Date Plans and levels turn digital talk into verified dates."}
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#00fbfb] font-bold shrink-0 mt-0.5">•</span>
                  {locale === "es" ? "Matching Synergy por mood, personalidad y valores, no solo tarjetas visuales." : "Synergy matching on mood, personality, and values, not just visual cards."}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Reveal Progression Interactive Simulator */}
      <section className="relative z-10 py-24 px-4 sm:px-6 md:px-12 lg:px-20 max-w-[1280px] mx-auto w-full border-t border-white/5">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center w-full">
          
          {/* Simulator copy */}
          <div className="col-span-12 lg:col-span-6 space-y-6 text-left">
            <span className="text-[10px] font-mono font-bold text-[#00fbfb] bg-[#00fbfb]/5 border border-[#00fbfb]/25 px-3 py-1 rounded-full uppercase tracking-wider">
              {locale === "es" ? "Vista Previa Interactiva" : "Interactive Preview"}
            </span>
            <h2 className="font-display text-3xl md:text-5xl font-black text-white tracking-tight">
              {locale === "es" ? "La Progresión de Revelado" : "The Reveal Progression"}
            </h2>
            <p className="text-xs sm:text-sm text-[#b9cac9] leading-relaxed font-semibold">
              {locale === "es" 
                ? "El dating es impulsado fundamentalmente por la atracción física. Por lo tanto, recomendamos encarecidamente mantener tu rostro totalmente visible y nítido desde el primer día. Mostrar tu rostro es el factor principal para generar matches, impulsando tus puntuaciones de atracción y acelerando las conexiones."
                : "Dating is fundamentally driven by physical attraction. Therefore, we highly recommend keeping your face fully clear and visible from day one. Showing your face is the primary driver of matches, boosting attraction scores and speeding up connections."}
            </p>
            <p className="text-xs sm:text-sm text-[#b9cac9] leading-relaxed">
              {locale === "es"
                ? "Nuestra **Encriptación con Desenfoque Facial** y **Anclas Estéticas** están diseñadas como un escudo de privacidad dedicado solo para miembros que priorizan la seguridad absoluta y el anonimato sobre la velocidad inmediata de conexión. Si eliges el modo privacidad, mostramos dos Anclas Estéticas sin desenfoque (mostrando estilo, silueta y vibra) para que tus partners obtengan tu contexto estético antes de que compartas la llave a tu retrato nítido."
                : "Our **Face Blur Encryption** and **Aesthetic Anchors** are designed as a dedicated privacy shield intended only for members who prioritize absolute safety and anonymity over immediate connection speed. If you choose privacy mode, we display two unblurred Aesthetic Anchors (showing style, silhouette, and vibe) so partners can get your aesthetic context before you share the key to your clear portrait."}
            </p>
            
            <div className="space-y-3.5 font-sans text-xs text-[#b9cac9] font-medium">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-[#00fbfb]/10 border border-[#00fbfb]/30 flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3 text-[#00fbfb]" />
                </div>
                <span>{locale === "es" ? "Los retratos nítidos son muy recomendados para una atracción inmediata en los matches" : "Clear portraits are highly recommended for immediate matching attraction"}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-[#00fbfb]/10 border border-[#00fbfb]/30 flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3 text-[#00fbfb]" />
                </div>
                <span>{locale === "es" ? "La Encriptación con Desenfoque Facial opcional mantiene tu perfil privado cuando lo necesitas" : "Optional Face Blur Encryption keeps your profile private when needed"}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-[#00fbfb]/10 border border-[#00fbfb]/30 flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3 text-[#00fbfb]" />
                </div>
                <span>{locale === "es" ? "Las Anclas Estéticas muestran el estilo visual sin exponer tu identidad" : "Aesthetic Anchors showcase visual style without exposing identity"}</span>
              </div>
            </div>
          </div>

          {/* Interactive Card */}
          <div className="col-span-12 lg:col-span-6 flex justify-center">
            <div className="w-full max-w-[380px] rounded-[2.5rem] p-1 bg-white/[0.03] border border-white/10 shadow-2xl relative">
              <div className="rounded-[calc(2.5rem-0.25rem)] bg-[#0F0F1A]/95 p-6 border border-white/5 space-y-6">
                
                {/* Main Avatar box */}
                <div className="relative aspect-square w-full rounded-2xl overflow-hidden border border-white/5 bg-black/30">
                  <img 
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80" 
                    alt="Siena" 
                    className="w-full h-full object-cover transition-all duration-700" 
                    style={{ filter: isFaceBlurred ? "blur(24px)" : "blur(0px)" }}
                  />

                  {/* Badges on Portrait overlay */}
                  <div className="absolute top-4 left-4 z-10 px-3 py-1 rounded-full backdrop-blur-md bg-black/60 border border-white/10 flex items-center gap-1.5">
                    {isFaceBlurred ? (
                      <>
                        <Lock className="w-3 h-3 text-[#ffabf3]" />
                        <span className="text-[8px] font-mono font-bold text-[#ffabf3] uppercase tracking-wider">{locale === "es" ? "Desenfoque Facial Encriptado" : "Face Blur Encrypted"}</span>
                      </>
                    ) : (
                      <>
                        <Unlock className="w-3 h-3 text-[#00fbfb]" />
                        <span className="text-[8px] font-mono font-bold text-[#00fbfb] uppercase tracking-wider">
                          {hasUnblurKey ? (locale === "es" ? "Totalmente Desbloqueado (Llave)" : "Fully Unlocked (Key)") : (locale === "es" ? "Vistazo Activo" : "Peek Active") + ` (${formatTime(peekCountdown || 0)})`}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Aesthetic Anchors (Mandatory 2 unblurred files) */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="relative h-20 rounded-xl overflow-hidden border border-white/5 bg-black/20">
                    <img 
                      src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=300&q=80" 
                      alt="Anchor 1" 
                      className="w-full h-full object-cover" 
                    />
                    <div className="absolute bottom-1.5 left-1.5 bg-black/60 border border-white/10 rounded px-1.5 py-0.5 text-[7px] font-mono text-white uppercase font-bold">{locale === "es" ? "Ancla de Estilo 1" : "Style Anchor 1"}</div>
                  </div>
                  <div className="relative h-20 rounded-xl overflow-hidden border border-white/5 bg-black/20">
                    <img 
                      src="https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=300&q=80" 
                      alt="Anchor 2" 
                      className="w-full h-full object-cover" 
                    />
                    <div className="absolute bottom-1.5 left-1.5 bg-black/60 border border-white/10 rounded px-1.5 py-0.5 text-[7px] font-mono text-white uppercase font-bold">{locale === "es" ? "Ancla de Vibra 2" : "Vibe Anchor 2"}</div>
                  </div>
                </div>

                {/* Actions Panel */}
                <div className="border-t border-white/5 pt-4 flex flex-col gap-3">
                  <div className="flex justify-between items-center">
                    <div className="text-left">
                      <h4 className="text-xs font-bold text-white">Siena Vibe</h4>
                      <span className="text-[9px] font-mono text-[#b9cac9]">{locale === "es" ? "Demo de Modo Privacidad" : "Privacy Mode Demo"}</span>
                    </div>
                    {(peekCountdown !== null || hasUnblurKey) && (
                      <button 
                        onClick={resetRevealDemo}
                        className="text-[8px] font-mono text-white/40 hover:text-white uppercase tracking-wider underline cursor-pointer"
                      >
                        {locale === "es" ? "Reiniciar Demo" : "Reset Demo"}
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <button 
                      type="button"
                      disabled={peekCountdown !== null || hasUnblurKey}
                      onClick={handlePeekRequest}
                      className="px-4 py-2.5 rounded-xl border border-[#ffabf3]/30 hover:border-[#ffabf3] text-[#ffabf3] font-mono text-[9px] font-bold uppercase tracking-wide bg-transparent transition active:scale-[0.98] disabled:opacity-40 cursor-pointer"
                    >
                      {locale === "es" ? "Solicitar Vistazo Limitado" : "Request Limited Peek"}
                    </button>
                    <button 
                      type="button"
                      disabled={hasUnblurKey}
                      onClick={handleApplyKey}
                      className="px-4 py-2.5 rounded-xl bg-[#00fbfb] text-black font-mono text-[9px] font-black uppercase tracking-wide hover:shadow-[0_0_15px_rgba(0,251,251,0.4)] transition active:scale-[0.98] disabled:opacity-40 cursor-pointer"
                    >
                      {locale === "es" ? "Usar Llave de Desbloqueo" : "Use Unblur Key"}
                    </button>
                  </div>
                </div>

              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Dating Coach / Wingman AI Section */}
      <section className="relative z-10 py-24 px-4 sm:px-6 md:px-12 lg:px-20 max-w-[1280px] mx-auto w-full border-t border-white/5 bg-[#050505]/20">
        <div className="max-w-4xl mx-auto space-y-12 text-center">
          <div className="space-y-4">
            <span className="text-[10px] font-mono font-bold text-[#00fbfb] bg-[#00fbfb]/5 border border-[#00fbfb]/25 px-3 py-1 rounded-full uppercase tracking-wider">
              {locale === "es" ? "Conoce a Tu Coach IA" : "Meet Your AI Coach"}
            </span>
            <h2 className="font-display text-3xl md:text-5xl font-black text-white tracking-tight">
              {locale === "es" ? "El Dating Coach & Asistente IA" : "The AI Dating Coach & Assistant"}
            </h2>
            <p className="text-xs sm:text-sm text-[#b9cac9] max-w-xl mx-auto leading-relaxed">
              {locale === "es" 
                ? "Sin fórmulas de ligue genéricas ni frases robóticas. Nuestro coach de relaciones integrado opera discretamente en tus chats para optimizar la fluidez de conversación y ayudarte a establecer conexiones."
                : "No generic pick-up formulas or robotic lines. Our built-in relationship coach operates silently in your chats to optimize conversation flow and help establish connections."}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div className="p-5 bg-white/[0.02] border border-white/5 rounded-2xl space-y-3">
              <div className="w-8 h-8 rounded-lg bg-[#00fbfb]/10 border border-[#00fbfb]/25 flex items-center justify-center">
                <Bot className="w-4.5 h-4.5 text-[#00fbfb]" />
              </div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">{locale === "es" ? "Gravedad de Conversación" : "Conversation Gravity"}</h3>
              <p className="text-[11px] text-[#b9cac9] leading-relaxed">
                {locale === "es" ? "El Coach mide el balance emocional y el impulso de conexión en tus chats, resaltando los mejores momentos para pasar a una cita real." : "The Coach measures emotional balance and connection momentum in your chats, highlighting the best moments to transition to a date."}
              </p>
            </div>

            <div className="p-5 bg-white/[0.02] border border-white/5 rounded-2xl space-y-3">
              <div className="w-8 h-8 rounded-lg bg-[#ffabf3]/10 border border-[#ffabf3]/25 flex items-center justify-center">
                <Sparkles className="w-4.5 h-4.5 text-[#ffabf3]" />
              </div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">{locale === "es" ? "Asistencia para Romper el Hielo" : "Icebreaker Assistance"}</h3>
              <p className="text-[11px] text-[#b9cac9] leading-relaxed">
                {locale === "es" ? "¿Atascado sin saber cómo empezar? El Wingman sugiere rompehielos personalizados basándose en el arquetipo específico de tu pareja." : "Stuck on how to start? The Wingman suggests customized conversation openers based on your partner's specific archetype."}
              </p>
            </div>

            <div className="p-5 bg-white/[0.02] border border-white/5 rounded-2xl space-y-3">
              <div className="w-8 h-8 rounded-lg bg-[#39FF14]/10 border border-[#39FF14]/25 flex items-center justify-center">
                <Compass className="w-4.5 h-4.5 text-[#39FF14]" />
              </div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">{locale === "es" ? "Guía de la Plataforma" : "Platform Guide"}</h3>
              <p className="text-[11px] text-[#b9cac9] leading-relaxed">
                {locale === "es" ? "Actúa como una guía útil para navegar configuraciones, listas de bloqueo, traducciones y detalles de ajuste sin interponerse en tu camino." : "Acts as a helpful guide to navigate settings, privacy blocklists, translations, and setup details without getting in your way."}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Date Plans & Chemistry Levels */}
      <section className="relative z-10 py-24 px-4 sm:px-6 md:px-12 lg:px-20 max-w-[1280px] mx-auto w-full border-t border-white/5">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center w-full">
          
          {/* Left Column: Chemistry meter timeline */}
          <div className="col-span-12 lg:col-span-5 space-y-6 text-left">
            <span className="text-[10px] font-mono font-bold text-[#ffabf3] bg-[#ffabf3]/5 border border-[#ffabf3]/25 px-3 py-1 rounded-full uppercase tracking-wider">
              {locale === "es" ? "Búsqueda de Conexión" : "Connection Quest"}
            </span>
            <h2 className="font-display text-3xl md:text-5xl font-black text-white tracking-tight">
              {locale === "es" ? "Niveles de Vibra y Química" : "Chemistry Vibe Levels"}
            </h2>
            <p className="text-xs sm:text-sm text-[#b9cac9] leading-relaxed font-semibold">
              {locale === "es" 
                ? "El progreso en la relación se rastrea a través de 8 Niveles de Vibra. A medida que sube tu Nivel de Vibra, desbloqueas actividades especiales llamadas **Suggestion Moves** directamente vinculadas con tu profundidad relacional."
                : "Relationship progress is tracked through 8 Vibe Levels. As your Vibe Level increases, you unlock special activities called **Suggestion Moves** directly linked to your relational depth."}
            </p>
            <p className="text-xs text-[#b9cac9] leading-relaxed">
              {locale === "es"
                ? "En el **Nivel 1 y 2**, desbloqueas el chat básico y movimientos digitales de baja intensidad (como compartir una playlist de música o enviar un saludo cálido). Una vez que alcanzas el **Nivel 3 y 4**, la plataforma desbloquea **más de 60 Suggestion Moves**: tarjetas de actividad física que van desde paseos por un café local hasta recorridos por museos o paseos en bicicleta un fin de semana. Esto guía tu conexión fluidamente desde la pantalla hacia citas en el mundo real, evitando que te estanques en el limbo de 'solo hablar'."
                : "At **Level 1 and 2**, you unlock basic chat and low-intensity digital moves (like sharing a custom music playlist or sending a warm wave). Once you reach **Level 3 and 4**, the platform unlocks **60+ Suggestion Moves**—physical activity cards ranging from cozy local coffee strolls to museum walk-throughs or weekend bike rides. This guides your connection smoothly from the screen into real-world dates, preventing you from getting stuck in the 'just talking' limbo."}
            </p>

            <div className="space-y-3 font-mono text-[10px] pt-2">
              <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl flex justify-between items-center">
                <span className="text-white/40">{locale === "es" ? "Nivel 1 - 2" : "Level 1 - 2"}</span>
                <span className="text-white font-bold uppercase">{locale === "es" ? "Chat Básico & Saludos Digitales" : "Basic Chat & Digital Waves"}</span>
              </div>
              <div className="p-3 bg-[#00fbfb]/5 border border-[#00fbfb]/20 rounded-xl flex justify-between items-center">
                <span className="text-[#00fbfb]">{locale === "es" ? "Nivel 3 - 4" : "Level 3 - 4"}</span>
                <span className="text-[#00fbfb] font-bold uppercase">{locale === "es" ? "+60 Suggestion Moves (Café, Paseos)" : "60+ Suggestion Moves (Coffee, Walks)"}</span>
              </div>
              <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl flex justify-between items-center">
                <span className="text-white/40">{locale === "es" ? "Nivel 5 - 8" : "Level 5 - 8"}</span>
                <span className="text-white font-bold uppercase">{locale === "es" ? "Planes de Viaje & Desbloqueo Alma Gemela" : "Travel Plans & Soulmate Unlock"}</span>
              </div>
            </div>
          </div>

          {/* Right Column: Date Plan Copy */}
          <div className="col-span-12 lg:col-span-7 space-y-6 text-left">
            <span className="text-[10px] font-mono font-bold text-[#00fbfb] bg-[#00fbfb]/5 border border-[#00fbfb]/25 px-3 py-1 rounded-full uppercase tracking-wider">
              {locale === "es" ? "La Herramienta Anti-Situationship" : "The Anti-Situationship Tool"}
            </span>
            <h2 className="font-display text-3xl md:text-5xl font-black text-white tracking-tight">
              {locale === "es" ? "Planes de Citas (Date Plans)" : "Dating Plans"}
            </h2>
            <p className="text-xs sm:text-sm text-[#b9cac9] leading-relaxed font-medium">
              {locale === "es"
                ? "Diseñamos nuestra plataforma para interacciones en el mundo real. Los **Planes de Citas** son invitaciones concretas y con fecha/hora diseñadas para evitar el interminable vaivén de mensajes."
                : "We design our platform for real-world interactions. **Date Plans** are concrete, time-bound date invitations designed to skip the endless back-and-forth texting."}
            </p>
            <p className="text-xs text-[#b9cac9] leading-relaxed">
              {locale === "es"
                ? "Los miembros estándar reciben **1 creación de Plan de Citas personalizado al mes** de forma gratuita. Puedes publicar un plan específico (ej. café en Blue Bottle el viernes por la tarde) para que tus matches lo vean. Al mismo tiempo, tienes **postulaciones ilimitadas** para aplicar a Planes de Citas publicados por otros miembros o creadores de la comunidad."
                : "Standard members get **1 customized Date Plan creation per month** for free. You can publish a specific plan (e.g. coffee stroll at Blue Bottle on Friday afternoon) for your matches to see. Meanwhile, you have **unlimited applications** to apply to Date Plans posted by other members or creators in the community."}
            </p>
            <div className="flex gap-4 pt-2">
              <Link 
                href="/early-access" 
                className="px-6 py-2.5 rounded-full border border-white/10 hover:border-white/30 text-white font-mono text-[10px] font-black uppercase tracking-wider transition cursor-pointer"
              >
                {locale === "es" ? "Saber Más en el Onboarding" : "Learn More in Onboarding"}
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* Competitor Matrix Section */}
      <section className="relative z-10 py-24 px-4 sm:px-6 md:px-12 lg:px-20 max-w-[1280px] mx-auto w-full border-t border-white/5 bg-[#050505]/20">
        <div className="max-w-4xl mx-auto space-y-12 text-center">
          <div className="space-y-4">
            <span className="text-[10px] font-mono font-bold text-[#00fbfb] bg-[#00fbfb]/5 border border-[#00fbfb]/25 px-3 py-1 rounded-full uppercase tracking-wider">
              {locale === "es" ? "Cómo Destacamos" : "How We Stand Out"}
            </span>
            <h2 className="font-display text-3xl md:text-5xl font-black text-white tracking-tight">
              {locale === "es" ? "Compara SECCION" : "Compare SECCION"}
            </h2>
          </div>

          <div className="w-full overflow-x-auto rounded-2xl border border-white/10 bg-[#0F0F1A]/75 backdrop-blur-xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.02]">
                  <th className="p-4 font-mono font-bold uppercase text-white/50">{locale === "es" ? "Dimensión de Característica" : "Feature Dimension"}</th>
                  <th className="p-4 font-mono font-bold uppercase text-[#00fbfb]">SECCION</th>
                  <th className="p-4 font-mono font-bold uppercase text-white/30">Tinder</th>
                  <th className="p-4 font-mono font-bold uppercase text-white/30">Bumble</th>
                  <th className="p-4 font-mono font-bold uppercase text-white/30">Hinge</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-sans">
                {comparisonData.map((row, idx) => (
                  <tr key={idx} className="hover:bg-white/[0.01] transition">
                    <td className="p-4 font-bold text-white uppercase tracking-wider font-mono text-[10px]">{row.metric}</td>
                    <td className="p-4 text-[#00fbfb] font-medium">{row.seccion}</td>
                    <td className="p-4 text-[#b9cac9]/60">{row.tinder}</td>
                    <td className="p-4 text-[#b9cac9]/60">{row.bumble}</td>
                    <td className="p-4 text-[#b9cac9]/60">{row.hinge}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Security & KYC (Identity Attestation) */}
      <section className="relative z-10 py-24 px-4 sm:px-6 md:px-12 lg:px-20 max-w-[1280px] mx-auto w-full border-t border-white/5">
        <div className="max-w-4xl mx-auto space-y-8 text-center">
          <div className="w-12 h-12 rounded-full bg-[#39FF14]/10 border border-[#39FF14]/25 flex items-center justify-center mx-auto">
            <ShieldCheck className="w-6 h-6 text-[#39FF14]" />
          </div>
          <div className="space-y-4">
            <h2 className="font-display text-3xl md:text-5xl font-black text-white tracking-tight">
              {locale === "es" ? "Perfiles Verificados. Sin Guardar Docs." : "Verified Profiles. No Doc Storage."}
            </h2>
            <p className="text-xs sm:text-sm text-[#b9cac9] max-w-xl mx-auto leading-relaxed font-medium">
              {locale === "es"
                ? "Eliminamos por completo el catfishing y las cuentas falsas. Cuando las conexiones progresan a planes de citas en el mundo real (Nivel 4+), los usuarios completan una breve **verificación facial y de prueba de vida (liveness)** para asegurar que coincidan con sus fotos de perfil."
                : "We eliminate catfishing and fake accounts completely. When connections progress to real-world dating plans (Level 4+), users complete a brief **liveness and face verification check** to ensure they match their profile photos."} 
            </p>
            <p className="text-xs text-[#b9cac9]/80 max-w-md mx-auto leading-relaxed">
              {locale === "es"
                ? "Para respetar tu privacidad absoluta, **SECCION no almacena ningún documento oficial de identidad**. La verificación ocurre en tiempo real, y todo el material de identidad es eliminado permanentemente de nuestros servidores inmediatamente después de finalizar la comprobación."
                : "To respect your absolute privacy, **SECCION does not store any official ID documents**. Verification happens in real-time, and all identity materials are permanently deleted from our servers immediately after the check finishes."}
            </p>
          </div>
        </div>
      </section>

      {/* Member FAQ Section */}
      <section className="relative z-10 py-24 px-4 sm:px-6 md:px-12 lg:px-20 max-w-[840px] mx-auto w-full border-t border-white/5">
        <div className="space-y-12">
          
          <div className="text-center space-y-4">
            <span className="text-[10px] font-mono font-bold text-[#ffabf3] bg-[#ffabf3]/5 border border-[#ffabf3]/25 px-3 py-1 rounded-full uppercase tracking-wider">
              {locale === "es" ? "Respuestas Claras" : "Clear Answers"}
            </span>
            <h2 className="font-display text-3xl md:text-4xl font-black text-white tracking-tight text-center">
              {locale === "es" ? "Preguntas Frecuentes" : "Member FAQ"}
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div 
                  key={idx}
                  className="bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden transition-all duration-300"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full px-6 py-5 flex justify-between items-center text-left focus:outline-none cursor-pointer"
                  >
                    <span className="text-xs font-bold text-white uppercase tracking-wider font-mono pr-4">
                      {faq.q}
                    </span>
                    <ChevronRight 
                      className={`w-4 h-4 text-[#00fbfb] shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-90' : ''}`} 
                    />
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                      >
                        <div className="px-6 pb-6 pt-2 border-t border-white/5 text-xs text-[#b9cac9] leading-relaxed">
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* Post FAQ Call To Action (As requested) */}
      <section className="relative z-10 pb-24 pt-4 px-4 sm:px-6 md:px-12 lg:px-20 max-w-[1280px] mx-auto w-full flex flex-col items-center justify-center">
        <DoubleBezelCard className="w-full max-w-[640px] text-center">
          <div className="space-y-6">
            <h3 className="font-display text-2xl font-black text-white tracking-tight">{locale === "es" ? "¿Listo para Iniciar tu Quest?" : "Ready to Begin Your Quest?"}</h3>
            <p className="text-xs text-[#b9cac9] max-w-md mx-auto leading-relaxed">
              {locale === "es" 
                ? "Adéntrate en un entorno de citas premium y transparente, financiado por la economía de creadores. Únete a SECCION hoy y desbloquea el matchmaking premium gratuito."
                : "Step into a premium, transparent dating landscape funded by the creator economy. Join SECCION today and unlock free premium matchmaking."}
            </p>
            <div className="pt-2">
              <Link 
                href="/early-access"
                className="inline-block px-10 py-4 rounded-full bg-[#00fbfb] text-black font-mono text-xs font-black uppercase tracking-widest hover:shadow-[0_0_25px_rgba(0,251,251,0.6)] hover:scale-[1.02] transition duration-300 cursor-pointer"
              >
                {locale === "es" ? "Unirme al Quest de Onboarding" : "Join Onboarding Quest"}
              </Link>
            </div>
          </div>
        </DoubleBezelCard>
      </section>

      {/* Footer */}
      <PublicFooter />

      {/* Immersive Guided Tour Modal */}
      <MemberTourModal 
        isOpen={isTourOpen} 
        onClose={() => setIsTourOpen(false)} 
        onStartQuest={() => {
          setIsTourOpen(false);
          router.push("/early-access");
        }}
      />

    </div>
  );
}
