"use client";

import PublicFooter from "@/components/PublicFooter";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import PublicNavbar from "@/components/PublicNavbar";
import { useTranslation } from "@/context/LanguageContext";
import { motion } from "framer-motion";
import { 
  Compass, 
  Sparkles, 
  Heart, 
  Flame, 
  Cpu, 
  Zap, 
  EyeOff, 
  ShieldCheck, 
  Landmark, 
  Play, 
  ArrowLeft, 
  Lock, 
  Unlock, 
  MessageSquare, 
  Globe, 
  FileText, 
  Check, 
  ChevronRight, 
  UserCheck, 
  ArrowUpRight, 
  Scale, 
  Bot,
  HelpCircle,
  TrendingUp,
  Award,
  Shield,
  Layers,
  ArrowRight,
  Video,
  Phone,
  HelpCircle as QuestionIcon
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

// Monospace number component for precise metrics
function MonoNumber({ value, suffix = "" }: { value: string | number; suffix?: string }) {
  return (
    <span className="font-mono text-[#00fbfb] drop-shadow-[0_0_10px_rgba(0,251,251,0.3)] font-bold tracking-tight">
      {value}{suffix}
    </span>
  );
}

export default function HowWeDoPage() {
  const router = useRouter();
  const { t, locale } = useTranslation();

  // 1. Interactive Chemistry Meter State
  const [activeChemLevel, setActiveChemLevel] = useState<number>(3);
  const chemLevels = locale === "fr" ? [
    { 
      level: 1, 
      name: "Intro Vibe", 
      description: "Déblocage standard de match. Chat textuel de base activé.", 
      moves: "Poke Digital, Phrases d'Accroche" 
    },
    { 
      level: 2, 
      name: "Synergy Sync", 
      description: "Partage de playlists d'intérêts et d'albums de style.", 
      moves: "Médias Personnalisés, Messages Vocaux Débloqués" 
    },
    { 
      level: 3, 
      name: "Intérêt Actif", 
      description: "Seuil recommandé pour les rencontres réelles et appels vidéo.", 
      moves: "Proposition de Café, Appels Audio et Vidéo" 
    },
    { 
      level: 4, 
      name: "Connexion Vérifiée", 
      description: "Vérification d'identité réussie. Débloque les projets de rendez-vous dans le monde réel.", 
      moves: "Statut Biométrique Vérifié, Proposition de Dîner" 
    },
    { 
      level: 5, 
      name: "Étincelle Mutuelle", 
      description: "Forte fréquence d'engagement. Les accès aux contenus s'étendent.", 
      moves: "Échange de Playlists, Rendez-vous Actifs" 
    },
    { 
      level: 6, 
      name: "Cercle de Confiance", 
      description: "Fonctions de communication étendues. Check-ins de sécurité activés.", 
      moves: "Planificateur de Week-end, Tracker de Localisation Sécurisée" 
    },
    { 
      level: 7, 
      name: "Harmonie Intime", 
      description: "Profonde résonance de connexion. Accès complet au profil.", 
      moves: "Priorité sur les Commandes de Contenu Personnalisé" 
    },
    { 
      level: 8, 
      name: "Aura d'Âmes Sœurs", 
      description: "Alchimie maximale. Récompenses d'insignes exclusifs sur le profil.", 
      moves: "Succès de Match Exclusifs, Visibilité Prioritaire" 
    }
  ] : locale === "es" ? [
    { 
      level: 1, 
      name: "Intro Vibe", 
      description: "Desbloqueo estándar de match. Chat de texto básico activado.", 
      moves: "Poke Digital, Openers Rompehielos" 
    },
    { 
      level: 2, 
      name: "Synergy Sync", 
      description: "Intercambio de playlists de intereses y álbumes de estilo.", 
      moves: "Archivos Multimedia, Audios Desbloqueados" 
    },
    { 
      level: 3, 
      name: "Interés Activo", 
      description: "Umbral recomendado para citas casuales en persona y videollamadas.", 
      moves: "Propuesta de Café, Llamadas de Voz y Video" 
    },
    { 
      level: 4, 
      name: "Conexión Verificada", 
      description: "Verificación de identidad superada. Desbloquea planes de citas en el mundo real.", 
      moves: "Estado Biométrico Verificado, Propuesta de Cena" 
    },
    { 
      level: 5, 
      name: "Chispa Mutua", 
      description: "Alta frecuencia de interacción. Los accesos de contenido se amplían.", 
      moves: "Intercambio de Playlists, Citas Activas" 
    },
    { 
      level: 6, 
      name: "Círculo de Confianza", 
      description: "Funciones de comunicación extendida. Check-ins de seguridad activados.", 
      moves: "Planificador de Viajes de Fin de Semana, Tracker de Ubicación Segura" 
    },
    { 
      level: 7, 
      name: "Armonía Íntima", 
      description: "Resonancia profunda de conexión. Acceso total al perfil.", 
      moves: "Prioridad en Pedidos de Contenido Personalizado" 
    },
    { 
      level: 8, 
      name: "Aura de Almas Gemelas", 
      description: "Química máxima. Recompensas especiales de insignia en el perfil.", 
      moves: "Logros Exclusivos de Match, Visibilidad Prioritaria" 
    }
  ] : [
    { 
      level: 1, 
      name: "Intro Vibe", 
      description: "Standard match unlock. Basic text chat activated.", 
      moves: "Digital Poke, Icebreaker Openers" 
    },
    { 
      level: 2, 
      name: "Synergy Sync", 
      description: "Sharing interest playlists and style albums.", 
      moves: "Custom Media Shares, Audio Message Unlocks" 
    },
    { 
      level: 3, 
      name: "Active Interest", 
      description: "Recommended threshold for casual real-life meetings and digital video checks.", 
      moves: "Coffee Walk Suggestion Card, Voice Calls, Video Call Scheduling" 
    },
    { 
      level: 4, 
      name: "Verified Connection", 
      description: "Secure Identity check passed. Unlocks real-world dating plans and coordinates sharing.", 
      moves: "Biometric Verification Status, Dinner Plan Proposals" 
    },
    { 
      level: 5, 
      name: "Mutual Spark", 
      description: "High frequency engagement. Content access levels automatically expand.", 
      moves: "Custom Playlist Exchange, Active Dating Plans" 
    },
    { 
      level: 6, 
      name: "Trust Circle", 
      description: "Extended communication features. Safe check-ins unlocked.", 
      moves: "Weekend Travel Mates Planner, Safe Location Tracker" 
    },
    { 
      level: 7, 
      name: "Intimate Harmony", 
      description: "Deep connection resonance. Full profile access.", 
      moves: "Custom Content Order Prioritizations" 
    },
    { 
      level: 8, 
      name: "Soulmate Aura", 
      description: "Maximum chemistry. Special badge profile rewards.", 
      moves: "Exclusive Matching Achievements, Priority Visibility" 
    }
  ];

  // 2. Master Sub Simulator State
  const [selectedCreatorsCount, setSelectedCreatorsCount] = useState<number>(10);
  const [averageCreatorPrice, setAverageCreatorPrice] = useState<number>(15);

  const calculateMasterSubscriptionPrice = () => {
    // Blended Indexing Formula: Base Fee + Discounted Aggregate Cost
    // P_M = Base_Master_Fee + MIN(Sum(P_C)) * Discount_Factor
    const baseFee = 9.99;
    const aggregateCost = selectedCreatorsCount * averageCreatorPrice;
    const discountFactor = 0.45; // 55% discount
    const discountedCost = Math.min(aggregateCost, 120) * discountFactor;
    return parseFloat((baseFee + discountedCost).toFixed(2));
  };

  const calculateCreatorGuaranteedPayout = () => {
    // 20% guaranteed base payout divided among selected creators
    const totalMasterSub = calculateMasterSubscriptionPrice();
    const creatorPool = totalMasterSub * 0.85;
    const guaranteedBase = creatorPool * 0.25; // 25% of pool is guaranteed base
    return parseFloat((guaranteedBase / selectedCreatorsCount).toFixed(2));
  };

  // 3. Face Blur Simulation State
  const [faceBlurred, setFaceBlurred] = useState<boolean>(true);

  // 4. Translation Thread State
  const [isTranslated, setIsTranslated] = useState<boolean>(false);
  const chatMessages = locale === "fr" ? [
    { sender: "Siena (UK)", original: "Hey! I love piano, what's your favorite style?", translated: "Coucou ! J'adore le piano, quel est ton style préféré ?" },
    { sender: "Toi", original: "J'adore le jazz et le piano classique. Tu as déjà joué en public ?", translated: "J'adore le jazz et le piano classique. Tu as déjà joué en public ?" }
  ] : locale === "es" ? [
    { sender: "Siena (UK)", original: "Hey! I love piano, what's your favorite style?", translated: "¡Hola! Me encanta el piano, ¿cuál es tu estilo favorito?" },
    { sender: "Tú", original: "Me encanta el jazz y el piano clásico. ¿Has tocado en vivo?", translated: "Me encanta el jazz y el piano clásico. ¿Has tocado en vivo?" }
  ] : [
    { sender: "Siena (ES)", original: "¡Hola! Me encanta el piano, ¿cuál es tu estilo favorito?", translated: "Hey! I love piano, what's your favorite style?" },
    { sender: "You", original: "I love jazz and classical piano. Have you performed live?", translated: "I love jazz and classical piano. Have you performed live?" }
  ];

  // 5. Operations Assistant State
  const [assistantStep, setAssistantStep] = useState<number>(0);
  const assistantPrompts = locale === "fr" ? [
    { query: "Scanner le contrat d'Agency Prime", reply: "Scan terminé. Alerte : clause de cession d'image perpétuelle détectée à la ligne 42. Droits d'image cédés à perpétuité. Action recommandée : Supprimer la clause avant signature." },
    { query: "Optimiser les horaires de live", reply: "Les analyses de résonance recommandent les mardis à 20h GMT selon l'activité de votre audience Archétype Muse. Débloque +12 % de vélocité de pourboires." },
    { query: "Filtrer les commandes de contenu", reply: "3 commandes en attente auditées. Commande #108 (Cover classique) validée. Paiement vérifié sous séquestre. Commande #109 rejetée pour non-conformité aux directives." }
  ] : locale === "es" ? [
    { query: "Escanear contrato de Agency Prime", reply: "Escaneo completo. Alerta: cláusula de retención de imagen detectada en línea 42. Imagen retenida a perpetuidad. Acción recomendada: Eliminar sección antes de firmar." },
    { query: "Optimizar horario de stream", reply: "Analíticas de resonancia recomiendan los martes a las 8PM GMT según la actividad de tu audiencia de Arquetipo Muse. Desbloquea +12% de velocidad en tips." },
    { query: "Filtrar pedidos de contenido", reply: "3 pedidos pendientes auditados. Pedido #108 (Cover clásico) validado. Pago verificado en escrow. Pedido #109 rechazado por no coincidir con las guías." }
  ] : [
    { query: "Scan contract from Agency Prime", reply: "Scan complete. Alert: likeness lock-in clause detected on line 42. likeness owned in perpetuity. Recommended action: Strike section before signing." },
    { query: "Optimize stream schedule", reply: "Resonance analytics recommend Tuesdays at 8PM GMT based on your Muse Archetype audience activity. Unlocks +12% tip velocity." },
    { query: "Filter custom content orders", reply: "Audited 3 pending orders. Order #108 (Classical cover) passed validation. Verified payment held in escrow. Order #109 rejected due to guideline mismatch." }
  ];

  return (
    <div 
      className="w-full min-h-screen text-[#e2e2e2] overflow-x-hidden font-['Hanken_Grotesk'] relative pb-32"
      style={{
        backgroundColor: 'transparent',
        backgroundImage: 'radial-gradient(circle at 15% 50%, rgba(255, 171, 243, 0.05), transparent 25%), radial-gradient(circle at 85% 30%, rgba(0, 251, 251, 0.05), transparent 25%)'
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

      {/* Floating Navbar */}
      <PublicNavbar activeTab="how-we-do" />

      {/* Main Container */}
      <main className="relative z-10 pt-36 px-6 md:px-[84px] max-w-[1280px] mx-auto space-y-24">
        
        {/* Back navigation */}
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-xs font-mono font-bold text-white/40 hover:text-[#00fbfb] transition group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>{locale === "fr" ? "Retour à l'accueil" : locale === "es" ? "Volver al Inicio" : "Back to Home"}</span>
        </Link>

        {/* Hero Section */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6 text-left">
            <span className="text-[10px] font-mono font-bold text-[#00fbfb] bg-[#00fbfb]/5 border border-[#00fbfb]/25 px-3 py-1 rounded-full uppercase tracking-wider">
              {locale === "fr" ? "PHILOSOPHIE DU WARM PAYWALL" : locale === "es" ? "FILOSOFÍA WARM PAYWALL" : "Warm Paywall Philosophy"}
            </span>
            <h1 className="font-['Outfit'] text-4xl sm:text-6xl font-black text-white leading-[1.05] tracking-tight uppercase">
              {locale === "fr" ? (
                <>Comment Nous <span className="text-[#00fbfb]">Faisons</span> les Choses</>
              ) : locale === "es" ? (
                <>Cómo <span className="text-[#00fbfb]">Hacemos</span> las Cosas</>
              ) : (
                <>How We <span className="text-[#00fbfb]">Do</span> Things</>
              )}
            </h1>
            <p className="text-sm sm:text-base text-[#b9cac9] leading-relaxed max-w-xl">
              {locale === "fr" ? "Les réseaux de rencontre traditionnels traitent les membres comme des produits à monétiser, facturant des frais simplement pour être remarqués. Chez SECCION, nous croyons que la connexion doit être gratuite." : locale === "es" ? "Las redes de citas tradicionales tratan a los miembros como productos para monetizar, cobrándo tarifas solo para ser vistos. En SECCION, creemos que la conexión debe ser gratis." : "Traditional dating networks treat members as assets to squeeze, charging fees just to get noticed. At SECCION, we believe connection should be free."}
            </p>
            <p className="text-sm sm:text-base text-[#b9cac9] leading-relaxed max-w-xl">
              {locale === "fr" ? "Notre modèle économique maintient le matchmaking et le chat **100 % gratuits pour les membres généraux** car il est intégralement financé par notre économie de créateurs. En offrant des outils premium, des portails d'abonnement et du streaming pour les créateurs, nous bâtissons un écosystème coopératif où tout le monde gagne." : locale === "es" ? "Nuestro modelo mantiene el matchmaking y el chat **100% gratis para miembros** porque es financiado al 100% por nuestra economía de creadores. Al ofrecer herramientas premium y suscripciones para creadores, establecemos un ecosistema cooperativo donde todos ganan." : "Our business model keeps matchmaking and chatting **100% free for general members** because it is fully funded by our creator-centric economy. By providing premium tools, subscription portals, and streaming options for creators, we establish a cooperative ecosystem where everyone wins."}
            </p>
            <div className="flex gap-4 pt-2">
              <Link 
                href="/early-access"
                className="px-8 py-3.5 rounded-full bg-[#00fbfb] text-black font-mono text-xs font-black uppercase tracking-wider hover:shadow-[0_0_20px_rgba(0,251,251,0.5)] transition active:scale-[0.98] cursor-pointer"
              >
                {locale === "fr" ? "Rejoindre la Quête d'Onboarding" : locale === "es" ? "Unirme al Quest" : "Join Onboarding Quest"}
              </Link>
            </div>
          </div>
          <div className="lg:col-span-5 flex justify-center">
            <DoubleBezelCard className="w-full max-w-[420px]">
              <div className="space-y-6 text-left">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-mono text-white/40 uppercase font-bold tracking-wider">{locale === "fr" ? "Écosystème Vibe" : locale === "es" ? "Ecosistema Vibe" : "Vibe Ecosystem"}</span>
                  <div className="w-2.5 h-2.5 rounded-full bg-[#39FF14] animate-pulse" />
                </div>
                
                <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-white uppercase">{locale === "fr" ? "Plateforme de Rencontre" : locale === "es" ? "Plataforma de Citas" : "Dating Platform"}</span>
                    <span className="text-[9px] font-mono text-[#00fbfb] font-bold">{locale === "fr" ? "100 % GRATUIT" : locale === "es" ? "100% GRATIS" : "100% FREE"}</span>
                  </div>
                  <p className="text-[10px] text-[#b9cac9] leading-relaxed">
                    {locale === "fr" ? "Matchmaking général, messagerie texte, personnalisation du profil et calculs de synergie sans aucun abonnement payant. Aucun artifice de paiement pour être vu." : locale === "es" ? "Matchmaking general, mensajería, configuración de perfil y cálculos de sinergia no tienen costos de suscripción. Sin trucos de pagar para ser visto." : "General matching, text messaging, profile setup, and synergy calculations carry zero subscription costs. No pay-to-be-seen tricks."}
                  </p>
                </div>

                <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-white uppercase">{locale === "fr" ? "Plateforme Créateurs" : locale === "es" ? "Plataforma de Creadores" : "Creator Platform"}</span>
                    <span className="text-[9px] font-mono text-[#ffabf3] font-bold">{locale === "fr" ? "80 % DE REVERSEMENT" : locale === "es" ? "80% PAYOUT" : "80% PAYOUT"}</span>
                  </div>
                  <p className="text-[10px] text-[#b9cac9] leading-relaxed">
                    {locale === "fr" ? "Les créateurs monétisent leurs lives premium, galeries privées, commandes personnalisées et abonnements VIP/Master via des jetons in-app." : locale === "es" ? "Los creadores monetizan streams premium, álbumes, pedidos personalizados y suscripciones VIP/Master usando tokens dentro de la app." : "Creators monetize premium streams, media albums, custom orders, and VIP/Master subscriptions using in-app tokens."}
                  </p>
                </div>
              </div>
            </DoubleBezelCard>
          </div>
        </section>

        {/* Infographic Replica: SECCION: The Future of Connection & Creation */}
        <section className="space-y-12 py-10 border-y border-white/5 relative">
          <div className="flex flex-col items-center justify-center text-center space-y-4 mb-12">
            <div className="relative w-20 h-20 rounded-full bg-black/40 border border-white/10 flex items-center justify-center shadow-[0_0_30px_rgba(0,251,251,0.2),0_0_50px_rgba(255,171,243,0.15)] group hover:scale-105 transition-all duration-500">
              <div className="absolute inset-0 rounded-full border border-[#00fbfb]/30 animate-pulse pointer-events-none" />
              <img 
                src="/assets/logo/logo-mark.png" 
                alt="SECCION Icon" 
                className="w-12 h-14 object-contain drop-shadow-[0_0_15px_rgba(0,251,251,0.6)]" 
              />
            </div>
            <h2 className="font-['Outfit'] text-2xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#00fbfb] via-white to-[#ffabf3] uppercase tracking-tight">
              {locale === "fr" ? "SECCION : Le Futur de la Connexion et de la Création" : locale === "es" ? "SECCION: El Futuro de la Conexión y Creación" : "SECCION: The Future of Connection & Creation"}
            </h2>
            <p className="text-xs sm:text-sm text-[#b9cac9]/70 max-w-xl leading-relaxed">
              {locale === "fr" ? "Plateforme hybride de matchmaking premium et d'économie créateur, fondée sur la philosophie du Warm Paywall." : locale === "es" ? "Plataforma híbrida de matchmaking premium y economía de creadores, construida bajo la filosofía Warm Paywall." : "Hybrid platform for premium matchmaking and a creator-centric economy, built on the Warm Paywall philosophy."}
            </p>
          </div>

          {/* Two side-by-side columns */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
            
            {/* Left Column: For Members */}
            <div className="rounded-[2.5rem] p-1 bg-gradient-to-b from-[#00fbfb]/20 to-transparent border border-[#00fbfb]/20 shadow-2xl relative flex flex-col">
              <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-b from-[#00fbfb]/5 to-transparent pointer-events-none" />
              <div className="rounded-[calc(2.5rem-0.25rem)] bg-[#0C0C14]/95 p-8 border border-white/5 relative z-10 flex-1 flex flex-col justify-between space-y-8 text-left">
                <div>
                  <span className="text-[10px] font-mono font-bold text-[#00fbfb] uppercase tracking-widest block mb-2">{locale === "fr" ? "POUR LES MEMBRES :" : locale === "es" ? "PARA MIEMBROS:" : "FOR MEMBERS:"}</span>
                  <h3 className="font-['Outfit'] text-xl sm:text-2xl font-black text-white uppercase tracking-tight">{locale === "fr" ? "L'Expérience Anti-Situationship" : locale === "es" ? "La Experiencia Anti-Situationship" : "The Anti-Situationship Experience"}</h3>
                </div>

                <div className="space-y-6">
                  {/* Gauge widget */}
                  <div className="p-5 bg-white/[0.02] border border-white/5 rounded-3xl space-y-4">
                    <div className="flex justify-between items-center text-xs font-bold text-white uppercase">
                      <span>{locale === "fr" ? "Le Chemistry Meter à 8 Niveaux 💥" : locale === "es" ? "El Chemistry Meter de 8 Niveles 💥" : "The 8-Level Chemistry Meter 💥"}</span>
                    </div>
                    <div className="flex flex-col items-center justify-center py-2">
                      <svg className="w-36 h-18" viewBox="0 0 100 50">
                        <path
                          d="M 10 50 A 40 40 0 0 1 90 50"
                          fill="none"
                          stroke="url(#chem-gauge-grad)"
                          strokeWidth="8"
                          strokeLinecap="round"
                        />
                        <defs>
                          <linearGradient id="chem-gauge-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#00fbfb" />
                            <stop offset="50%" stopColor="#ffabf3" />
                            <stop offset="100%" stopColor="#fe00fe" />
                          </linearGradient>
                        </defs>
                        <line
                          x1="50"
                          y1="50"
                          x2="35"
                          y2="22"
                          stroke="#ffffff"
                          strokeWidth="3.5"
                          strokeLinecap="round"
                        />
                        <circle cx="50" cy="50" r="4.5" fill="#ffffff" />
                      </svg>
                      <div className="flex justify-between w-full px-4 text-[8px] font-mono text-white/40 uppercase mt-1">
                        <span>{locale === "fr" ? "Indéfini" : locale === "es" ? "Indefinido" : "Undefined"}</span>
                        <span>{locale === "fr" ? "Âme Sœur" : locale === "es" ? "Alma Gemela" : "Soulmate"}</span>
                      </div>
                    </div>
                    <p className="text-[10px] text-[#b9cac9] leading-relaxed">
                      {locale === "fr"
                        ? "Système de notation dynamique suivant la progression de la relation, d'« Indéfini » à « Âme Sœur »."
                        : locale === "es"
                        ? "Sistema de puntuación dinámico que sigue el progreso de la relación desde 'Indefinido' hasta 'Alma Gemela'."
                        : 'A dynamic scoring system that tracks relationship progress from "Undefined" to "Soulmate."'}
                    </p>
                  </div>

                  {/* Synergy Card */}
                  <div className="p-5 bg-white/[0.02] border border-white/5 rounded-3xl flex gap-4 items-start">
                    <div className="w-10 h-10 rounded-xl bg-[#00fbfb]/10 border border-[#00fbfb]/25 flex items-center justify-center shrink-0">
                      <svg className="w-5 h-5 text-[#00fbfb]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase mb-1">{locale === "fr" ? "Moteur de Synergie par Personnalité" : locale === "es" ? "Motor de Sinergia por Personalidad" : "Personality-First Synergy Engine"}</h4>
                      <p className="text-[10px] text-[#b9cac9] leading-relaxed">
                        {locale === "fr" ? "L'IA vous connecte selon 9 archétypes et une résonance d'humeur, pas seulement sur de simples photos." : locale === "es" ? "La IA te conecta según 9 arquetipos y resonancia de estado de ánimo, no solo fotos." : "AI matches you based on 9 archetypes and mood resonance, not just photos."}
                      </p>
                    </div>
                  </div>

                  {/* Suggestion Card */}
                  <div className="p-5 bg-white/[0.02] border border-white/5 rounded-3xl flex gap-4 items-start">
                    <div className="w-10 h-10 rounded-xl bg-[#00fbfb]/10 border border-[#00fbfb]/25 flex items-center justify-center shrink-0">
                      <Compass className="w-5 h-5 text-[#00fbfb]" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-xs font-bold text-white uppercase mb-1">{locale === "fr" ? "+60 Cartes d'Invitations Réelles" : locale === "es" ? "+60 Propuestas de Citas Reales" : "60+ Real-World Suggestion Moves"}</h4>
                      <div className="flex items-center gap-2 py-2 mb-2">
                        <div className="px-2 py-0.5 rounded bg-white/5 border border-white/10 font-mono text-[8px] text-[#b9cac9]">Poke</div>
                        <Zap className="w-3 h-3 text-[#ffabf3]" />
                        <div className="px-2 py-0.5 rounded bg-white/5 border border-white/10 font-mono text-[8px] text-[#b9cac9]">{locale === "fr" ? "Café" : locale === "es" ? "Café" : "Coffee"}</div>
                        <Zap className="w-3 h-3 text-[#ffabf3]" />
                        <div className="px-2 py-0.5 rounded bg-white/5 border border-white/10 font-mono text-[8px] text-[#b9cac9]">{locale === "fr" ? "Voyage" : locale === "es" ? "Viaje" : "Trip"}</div>
                      </div>
                      <p className="text-[10px] text-[#b9cac9] leading-relaxed">
                        {locale === "fr"
                          ? "Débloquez des rendez-vous progressivement : du « Poke » digital au café et aux voyages internationaux."
                          : locale === "es"
                          ? "Desbloquea citas progresivamente: desde un 'Poke' digital hasta café y viajes internacionales."
                          : 'Progressively unlock dates—from a digital "Poke" to coffee and international trips.'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: For Creators */}
            <div className="rounded-[2.5rem] p-1 bg-gradient-to-b from-[#ffabf3]/20 to-transparent border border-[#ffabf3]/20 shadow-2xl relative flex flex-col">
              <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-b from-[#ffabf3]/5 to-transparent pointer-events-none" />
              <div className="rounded-[calc(2.5rem-0.25rem)] bg-[#0C0C14]/95 p-8 border border-white/5 relative z-10 flex-1 flex flex-col justify-between space-y-8 text-left">
                <div>
                  <span className="text-[10px] font-mono font-bold text-[#ffabf3] uppercase tracking-widest block mb-2">{locale === "fr" ? "POUR LES CRÉATEURS :" : locale === "es" ? "PARA CREADORES:" : "FOR CREATORS:"}</span>
                  <h3 className="font-['Outfit'] text-xl sm:text-2xl font-black text-white uppercase tracking-tight">{locale === "fr" ? "Votre Activité Clé en Main" : locale === "es" ? "Tu Negocio Todo-en-Uno" : "Your Business-in-a-Box"}</h3>
                </div>

                <div className="space-y-6">
                  {/* Revenue Split Card */}
                  <div className="p-5 bg-white/[0.02] border border-white/5 rounded-3xl flex items-center justify-between gap-4">
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-white uppercase">{locale === "fr" ? "Rétention Record de 80 % 🔥" : locale === "es" ? "Insuperable Reparto de Ingresos 80% 🔥" : "Unbeatable 80% Revenue Split 🔥"}</h4>
                      <p className="text-[10px] text-[#b9cac9] leading-relaxed">
                        {locale === "fr" ? "Conservez 80 % de chaque abonnement et pourboire sans aucun frais d'agence caché." : locale === "es" ? "Conserva el 80% de cada suscripción y propina sin tarifas ocultas de agencia." : "Keep 80% of every subscription and tip with zero hidden agency fees."}
                      </p>
                    </div>
                    <div className="flex flex-col items-center justify-center p-3 bg-[#ffabf3]/10 border border-[#ffabf3]/25 rounded-2xl shrink-0">
                      <span className="text-2xl font-black font-mono text-[#ffabf3] leading-none">80%</span>
                      <span className="text-[7px] font-mono uppercase text-white/40 tracking-wider mt-1 font-bold">{locale === "fr" ? "Garanti" : locale === "es" ? "Garantizado" : "Guaranteed"}</span>
                    </div>
                  </div>

                  {/* AI Operations Assistant Card */}
                  <div className="p-5 bg-white/[0.02] border border-white/5 rounded-3xl flex gap-4 items-start">
                    <div className="w-10 h-10 rounded-xl bg-[#ffabf3]/10 border border-[#ffabf3]/25 flex items-center justify-center shrink-0">
                      <svg className="w-5 h-5 text-[#ffabf3]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <rect x="3" y="11" width="18" height="10" rx="2" />
                        <circle cx="8" cy="16" r="1" />
                        <circle cx="16" cy="16" r="1" />
                        <path d="M9 22v-2h6v2" />
                        <path d="M12 11V9" />
                        <circle cx="12" cy="7" r="1.5" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase mb-1">{locale === "fr" ? "Assistant d'Opérations IA Gratuit" : locale === "es" ? "Asistente AI de Operaciones Gratis" : "Free AI Operations Assistant"}</h4>
                      <p className="text-[10px] text-[#b9cac9] leading-relaxed">
                        {locale === "fr" ? "Remplacez les agences coûteuses grâce à la gestion des DMs, du planning et l'audit de contrats." : locale === "es" ? "Reemplaza agencias costosas gestionando DMs, calendario y revisión de contratos." : "Replaces expensive agencies by managing DMs, content scheduling, and legal reviews."}
                      </p>
                    </div>
                  </div>

                  {/* Privacy Blur Card */}
                  <div className="p-5 bg-white/[0.02] border border-white/5 rounded-3xl flex gap-4 items-start">
                    <div className="w-10 h-10 rounded-xl bg-[#ffabf3]/10 border border-[#ffabf3]/25 flex items-center justify-center shrink-0">
                      <EyeOff className="w-5 h-5 text-[#ffabf3]" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase mb-1">{locale === "fr" ? "Confidentialité avec Flou Facial" : locale === "es" ? "Privacidad con Face Blur" : "Privacy-First Face Blur"}</h4>
                      <p className="text-[10px] text-[#b9cac9] leading-relaxed">
                        {locale === "fr" ? "Votre visage reste flouté jusqu'à ce que votre match atteigne un haut niveau de complicité." : locale === "es" ? "Tu rostro permanece difuminado hasta alcanzar un alto Nivel de Química." : "Your face stays blurred until a match reaches a high Chemistry Level."}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Comparison box */}
          <div className="rounded-[2.5rem] p-1 bg-white/[0.03] border border-white/10 shadow-2xl relative">
            <div className="rounded-[calc(2.5rem-0.25rem)] bg-[#0C0C14]/90 p-8 border border-white/5 space-y-6 text-left">
              <h3 className="font-['Outfit'] text-xs font-black uppercase tracking-widest text-center text-transparent bg-clip-text bg-gradient-to-r from-[#00fbfb] to-[#ffabf3]">
                {locale === "fr" ? "COMPARAISON : SECCION vs. Standards de l'Industrie" : locale === "es" ? "COMPARACIÓN: SECCION vs. Estándares de la Industria" : "COMPARISON: SECCION vs. Industry Standards"}
              </h3>
              
              <div className="space-y-4">
                {/* Row 1: Matching Cost */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center border-b border-white/5 pb-4">
                  <div className="md:col-span-4 text-xs font-bold text-white uppercase font-mono tracking-wider">{locale === "fr" ? "Coût du Matchmaking" : locale === "es" ? "Costo de Matchmaking" : "Matching Cost"}</div>
                  <div className="md:col-span-4">
                    <div className="flex justify-between items-center bg-[#00fbfb]/10 border border-[#00fbfb]/25 px-4 py-2 rounded-full text-xs font-bold text-[#00fbfb] shadow-[0_0_15px_rgba(0,251,251,0.1)]">
                      <span>{locale === "fr" ? "100 % Gratuit" : locale === "es" ? "100% Gratis" : "100% Free"}</span>
                      <Check className="w-4 h-4 text-emerald-400 bg-emerald-400/10 rounded-full p-0.5" />
                    </div>
                  </div>
                  <div className="md:col-span-4">
                    <div className="flex justify-between items-center bg-white/5 border border-white/5 px-4 py-2 rounded-full text-xs font-medium text-white/50">
                      <span>{locale === "fr" ? "9 € à 30 € / Mois" : locale === "es" ? "€9–€30 / Mes" : "€9–€30 / Month"}</span>
                      <Lock className="w-4 h-4 text-white/20" />
                    </div>
                  </div>
                </div>

                {/* Row 2: Creator Payout */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center border-b border-white/5 pb-4">
                  <div className="md:col-span-4 text-xs font-bold text-white uppercase font-mono tracking-wider">{locale === "fr" ? "Paiement au Créateur" : locale === "es" ? "Pago al Creador" : "Creator Payout"}</div>
                  <div className="md:col-span-4">
                    <div className="flex justify-between items-center bg-[#ffabf3]/10 border border-[#ffabf3]/25 px-4 py-2 rounded-full text-xs font-bold text-[#ffabf3] shadow-[0_0_15px_rgba(255,171,243,0.1)]">
                      <span>{locale === "fr" ? "80 % Garanti" : locale === "es" ? "80% Garantizado" : "80% Guaranteed"}</span>
                      <span className="text-[10px] font-mono font-bold">%</span>
                    </div>
                  </div>
                  <div className="md:col-span-4">
                    <div className="flex justify-between items-center bg-white/5 border border-white/5 px-4 py-2 rounded-full text-xs font-medium text-white/50">
                      <span>{locale === "fr" ? "40 à 50 % (Après Commissions)" : locale === "es" ? "40-50% (Tras Comisiones)" : "40-50% (After Fees)"}</span>
                      <span className="text-[10px] font-mono">%</span>
                    </div>
                  </div>
                </div>

                {/* Row 3: Agency Support */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                  <div className="md:col-span-4 text-xs font-bold text-white uppercase font-mono tracking-wider">{locale === "fr" ? "Gestion d'Agence" : locale === "es" ? "Soporte de Agencia" : "Agency Support"}</div>
                  <div className="md:col-span-4">
                    <div className="flex justify-between items-center bg-[#00fbfb]/10 border border-[#00fbfb]/25 px-4 py-2 rounded-full text-xs font-bold text-[#00fbfb] shadow-[0_0_15px_rgba(0,251,251,0.1)]">
                      <span>{locale === "fr" ? "IA Intégrée (Gratuite)" : locale === "es" ? "IA Integrada (Gratis)" : "Built-in AI (Free)"}</span>
                      <Bot className="w-4 h-4 text-[#00fbfb]" />
                    </div>
                  </div>
                  <div className="md:col-span-4">
                    <div className="flex justify-between items-center bg-white/5 border border-white/5 px-4 py-2 rounded-full text-xs font-medium text-white/50">
                      <span>{locale === "fr" ? "Équipes Externes Coûteuses" : locale === "es" ? "Equipos Externos Costosos" : "Expensive External Teams"}</span>
                      <Lock className="w-4 h-4 text-white/20" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Chemistry Meter & Suggestion Moves */}
        <section className="space-y-8">
          <div className="text-left space-y-3">
            <h2 className="font-['Outfit'] text-2xl sm:text-4xl font-black text-white uppercase tracking-tight">
              {locale === "fr" ? "Le Chemistry Meter & Cartes de Rendez-vous" : locale === "es" ? "El Chemistry Meter & Propuestas de Citas" : "The Chemistry Meter & Suggestion Moves"}
            </h2>
            <p className="text-xs sm:text-sm text-[#b9cac9] max-w-2xl leading-relaxed">
              {locale === "fr" ? "Nous éliminons les situationship loops en mesurant la résonance réelle de votre connexion. Les interactions (chats, vues, pourboires) alimentent un Chemistry Meter à 8 niveaux. Atteindre de nouveaux paliers débloque des options personnalisées appelées **Suggestion Moves**, rapprochant le monde digital du réel." : locale === "es" ? "Eliminamos el situationship limbo monitoreando la resonancia real de tu conexión. Las interacciones (chats, vistas, tips) impulsan un Chemistry Meter de 8 niveles. Alcanzar nuevos niveles desbloquea opciones personalizadas llamadas **Suggestion Moves**, conectando el mundo digital y real." : "We eliminate situationship loops by tracking real relationship resonance. Interactions (chatting, content views, tips) drive a dynamic 8-Level Chemistry Meter. Reaching new levels unlocks custom dating options called **Suggestion Moves**, progressively bridging the digital gap."}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Interactive dial selectors */}
            <div className="lg:col-span-5">
              <DoubleBezelCard>
                <div className="space-y-6">
                  <span className="text-[10px] font-mono text-white/40 uppercase font-bold tracking-wider block text-left">{locale === "fr" ? "Sélecteur de Niveau" : locale === "es" ? "Selector de Nivel" : "Level Selector"}</span>
                  
                  <div className="grid grid-cols-4 gap-2">
                    {chemLevels.map((lvl) => (
                      <button
                        key={lvl.level}
                        onClick={() => setActiveChemLevel(lvl.level)}
                        className={`py-3 rounded-xl border font-mono text-xs font-bold transition-all cursor-pointer ${
                          activeChemLevel === lvl.level 
                            ? 'border-[#00fbfb] text-[#00fbfb] bg-[#00fbfb]/10 shadow-[0_0_15px_rgba(0,251,251,0.2)]' 
                            : 'border-white/5 text-white/40 hover:text-white/60 bg-transparent'
                        }`}
                      >
                        {locale === "fr" ? "Niv " : locale === "es" ? "Nvl " : "Lvl "}{lvl.level}
                      </button>
                    ))}
                  </div>

                  {/* Level status visualization */}
                  <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl space-y-3 text-left">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-white uppercase">{chemLevels[activeChemLevel - 1].name}</span>
                      <span className="text-[10px] font-mono text-[#ffabf3] font-bold">{locale === "fr" ? "Niveau " : locale === "es" ? "Nivel " : "Level "}{activeChemLevel} / 8</span>
                    </div>
                    <p className="text-[10px] text-[#b9cac9] leading-relaxed">
                      {chemLevels[activeChemLevel - 1].description}
                    </p>
                    <div className="border-t border-white/5 pt-3">
                      <span className="text-[8px] font-mono text-white/30 uppercase font-bold block mb-1">{locale === "fr" ? "Cartes d'Invitations Débloquées" : locale === "es" ? "Propuestas de Cita Desbloqueadas" : "Unlocked Suggestion Moves"}</span>
                      <span className="text-[10px] text-[#39FF14] font-medium">
                        {chemLevels[activeChemLevel - 1].moves}
                      </span>
                    </div>
                  </div>
                </div>
              </DoubleBezelCard>
            </div>

            {/* Visual description of levels */}
            <div className="lg:col-span-7 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 bg-white/[0.02] border border-white/5 rounded-3xl text-left space-y-2">
                  <div className="w-8 h-8 rounded-lg bg-[#00fbfb]/10 border border-[#00fbfb]/25 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-[#00fbfb]" />
                  </div>
                  <h3 className="text-xs font-bold text-white uppercase">{locale === "fr" ? "Confiance Progressive" : locale === "es" ? "Confianza Progresiva" : "Progressive Trust"}</h3>
                  <p className="text-[11px] text-[#b9cac9] leading-relaxed">
                    {locale === "fr" ? "Les niveaux de complicité plus élevés suggèrent automatiquement des invitations sécurisées. Les invitations à un café, appels audio et visio se débloquent au Niveau 3. Les projets de dîner au restaurant se débloquent au Niveau 4." : locale === "es" ? "Los niveles de química más altos sugieren propuestas seguras de forma automática. Propuestas de café, llamadas y video se desbloquean en el Nivel 3. Planes para cenar se desbloquean en el Nivel 4." : "Higher chemistry levels automatically prompt safe suggestions. Coffee walk cards, voice calls, and video scheduling unlock at Level 3. Real-world dinner proposal cards unlock at Level 4."}
                  </p>
                </div>

                <div className="p-5 bg-white/[0.02] border border-white/5 rounded-3xl text-left space-y-2">
                  <div className="w-8 h-8 rounded-lg bg-[#ffabf3]/10 border border-[#ffabf3]/25 flex items-center justify-center">
                    <ShieldCheck className="w-4 h-4 text-[#ffabf3]" />
                  </div>
                  <h3 className="text-xs font-bold text-white uppercase">{locale === "fr" ? "L3 Planning d'Appels Vidéo" : locale === "es" ? "L3 Agenda de Videollamadas" : "L3 Video Call Scheduling"}</h3>
                  <p className="text-[11px] text-[#b9cac9] leading-relaxed">
                    {locale === "fr" ? "**Le planning d'appels vidéo s'active au Niveau 3**. Les membres peuvent planifier des visioconférences sécurisées pour confirmer leur feeling avant d'organiser une rencontre ou un dîner au Niveau 4." : locale === "es" ? "**La agenda de videollamadas se activa en el Nivel 3**. Los miembros pueden agendar videochats seguros para confirmar alineación antes de coordinar encuentros o planes de cena en el Nivel 4." : "**Video Call Scheduling is placed in Level 3**. Members can schedule secure video chats to confirm alignment before coordinating physical real-life coordinates or dinner plans at Level 4."}
                  </p>
                </div>
              </div>

              <div className="p-6 bg-white/[0.03] border border-[#00fbfb]/20 rounded-3xl text-left space-y-3">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-[#00fbfb]" />
                  <h3 className="text-xs font-bold text-white uppercase font-mono tracking-wider">{locale === "fr" ? "Logique de Connexion & Match Gate" : locale === "es" ? "Lógica de Conexión y Match Gate" : "The Match Gate Connection Logic"}</h3>
                </div>
                <p className="text-[11px] text-[#b9cac9] leading-relaxed">
                  {locale === "fr"
                    ? "Les connexions sont protégées. Pour échanger et débloquer les outils de messagerie, les deux utilisateurs doivent se liker mutuellement sur leur profil."
                    : locale === "es"
                    ? "Las conexiones están protegidas. Para conectar y habilitar herramientas de mensajería, ambos usuarios deben darse 'LIKE' mutuamente en sus perfiles."
                    : 'Connections are protected. To connect and unlock potential messaging tools, both users must mutually "LIKE" each other\'s profile cards.'}
                </p>
                <p className="text-[11px] text-[#b9cac9] leading-relaxed">
                  {locale === "fr" ? "Pour éviter le démarchage intrusif, **les créateurs ne peuvent pas liker d'autres créateurs**. Cette règle garantit que les créateurs n'échangent qu'avec des membres sincèrement intéressés, préservant la messagerie de tout spam promotionnel." : locale === "es" ? "Para evitar spam, **los creadores no pueden darse like a otros creadores**. Esta regla garantiza que los creadores interactúen solo con miembros interesados, manteniendo el chat libre de spam promocional." : "To prevent abuse, **content creators cannot like other content creators** on the platform. The gate guarantees that creators only interact with interested members and keeps chat boxes free from promotional spam."}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: VIP vs. Master Subscription & Payouts */}
        <section className="space-y-8">
          <div className="text-left space-y-3">
            <h2 className="font-['Outfit'] text-2xl sm:text-4xl font-black text-white uppercase tracking-tight">
              {locale === "fr" ? "Abonnements VIP vs. Master" : locale === "es" ? "Suscripciones VIP vs. Master" : "VIP vs. Master Subscriptions"}
            </h2>
            <p className="text-xs sm:text-sm text-[#b9cac9] max-w-2xl leading-relaxed">
              {locale === "fr" ? "Nous concevons le financement des créateurs comme un investissement communautaire. Les membres choisissent entre des abonnements individuels directs ou des packs groupés dynamiques, assurant des revenus réguliers et prévisibles aux créateurs." : locale === "es" ? "Diseñamos el financiamiento de creadores como una inversión comunitaria. Los miembros eligen entre suscripciones individuales directas o paquetes grupales dinámicos, asegurando ingresos estables y recurrentes para los creadores." : "We design creator funding as a community investment. Members choose between direct creator subscriptions or dynamic group bundles, ensuring creators enjoy stable, recurring payout streams."}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            
            {/* VIP Card */}
            <div className="lg:col-span-4 flex">
              <DoubleBezelCard className="w-full flex flex-col justify-between">
                <div className="space-y-4 text-left">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-mono font-bold text-[#ffabf3] bg-[#ffabf3]/5 border border-[#ffabf3]/25 px-2 py-0.5 rounded-full uppercase">{locale === "fr" ? "PASS VIP" : locale === "es" ? "PASE VIP" : "VIP PASS"}</span>
                    <span className="text-[11px] text-[#b9cac9] font-mono">{locale === "fr" ? "Un Seul Créateur" : locale === "es" ? "Un Solo Creador" : "Single Creator"}</span>
                  </div>
                  <h3 className="text-lg font-black uppercase text-white tracking-tight">{locale === "fr" ? "Abonnement VIP" : locale === "es" ? "Suscripción VIP" : "VIP Subscription"}</h3>
                  <p className="text-[11px] text-[#b9cac9] leading-relaxed">
                    {locale === "fr" ? "Abonnement mensuel renouvelable automatiquement dédié à un seul créateur avec lequel vous avez matché." : locale === "es" ? "Suscripción mensual auto-renovable dedicada a un solo creador con el que hiciste match." : "Auto-renewing monthly subscription dedicated to a single creator you matched with."}
                  </p>
                  <ul className="space-y-2 border-t border-white/5 pt-4 text-[10px] text-[#b9cac9]">
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-[#ffabf3] shrink-0" />
                      <span>{locale === "fr" ? "Priorité de chat et messagerie privée directe" : locale === "es" ? "Prioridad en chat y mensajería privada directa" : "Direct private messaging chat priority"}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-[#ffabf3] shrink-0" />
                      <span>{locale === "fr" ? "Débloque les Galeries & Salons de Live VIP" : locale === "es" ? "Desbloquea Álbumes y Streams VIP" : "Unlock VIP Content Albums & Streams"}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-[#ffabf3] shrink-0" />
                      <span>{locale === "fr" ? "1 Jeton d'Appel Privé par semaine (5 min)" : locale === "es" ? "1 Token de Llamada Privada por semana (5m)" : "1 Private Call token per week (5m)"}</span>
                    </li>
                  </ul>
                </div>
                <div className="border-t border-white/5 pt-4 mt-6 text-left">
                  <span className="text-[9px] font-mono text-white/30 uppercase block font-bold">{locale === "fr" ? "Modèle tarifaire" : locale === "es" ? "Modelo de precio" : "Pricing model"}</span>
                  <span className="text-sm font-bold text-white">{locale === "fr" ? "Fixé directement par le Créateur" : locale === "es" ? "Fijado directamente por el Creador" : "Set directly by the Creator"}</span>
                </div>
              </DoubleBezelCard>
            </div>

            {/* Master Card */}
            <div className="lg:col-span-8 flex">
              <DoubleBezelCard className="w-full border-t-2 border-t-[#00fbfb]/30">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left h-full justify-between">
                  <div className="space-y-4 flex flex-col justify-between">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] font-mono font-bold text-[#00fbfb] bg-[#00fbfb]/5 border border-[#00fbfb]/25 px-2 py-0.5 rounded-full uppercase">{locale === "fr" ? "PACK MASTER" : locale === "es" ? "PAQUETE MASTER" : "MASTER BUNDLE"}</span>
                        <span className="text-[11px] text-[#b9cac9] font-mono">{locale === "fr" ? "10 Créateurs" : locale === "es" ? "10 Creadores" : "10 Creators"}</span>
                      </div>
                      <h3 className="text-lg font-black uppercase text-white tracking-tight">{locale === "fr" ? "Abonnement Master" : locale === "es" ? "Suscripción Master" : "Master Subscription"}</h3>
                      <p className="text-[11px] text-[#b9cac9] leading-relaxed">
                        {locale === "fr" ? "Sélectionnez jusqu'à 10 créateurs avec lesquels vous avez matché et regroupez-les dans votre espace **Créateurs Sponsorisés**. Débloquez les privilèges VIP pour les 10 profils à un tarif mensuel unique." : locale === "es" ? "Elige hasta 10 creadores con match y agrúpalos en tu panel de **Creadores Patrocinados**. Desbloquea privilegios VIP para los 10 perfiles bajo un solo precio mensual." : "Choose up to 10 matched creators and aggregate them into your **Sponsored Creators** dashboard. Unlocks VIP privileges for all 10 profiles under a single price for a month."}
                      </p>
                      <p className="text-[11px] text-[#b9cac9] leading-relaxed">
                        {locale === "fr" ? "Les créateurs bénéficient de revenus stables et prévisibles. Sur le total des abonnements, **85 % sont distribués aux créateurs** (avec un socle garanti de 20 % et 60 % de bonus variable selon les avis)." : locale === "es" ? "Los creadores obtienen ingresos estables y predecibles. Del fondo total de suscripciones, **el 85% se distribuye a los creadores** (con un 20% de pago base garantizado y 60% de impulso variable según rating)." : "Creators gain highly predictable, stable payouts. Out of total subscription pool revenue, **85% is distributed to the creators** (with a 20% guaranteed base payout and 60% variable rating boost)."}
                      </p>
                    </div>
                    <div className="border-t border-white/5 pt-4 mt-4">
                      <span className="text-[9px] font-mono text-white/30 uppercase block font-bold">{locale === "fr" ? "Logique de Répartition" : locale === "es" ? "Lógica de Distribución" : "Distribution Logic"}</span>
                      <span className="text-[10px] text-[#39FF14] font-bold">{locale === "fr" ? "85 % Répartition du Fonds • 20 % Socle Garanti" : locale === "es" ? "85% Reparto del Fondo • 20% Base garantizada" : "85% Pool Payout • 20% Guaranteed base"}</span>
                    </div>
                  </div>

                  {/* Pricing Calculator Mock */}
                  <div className="p-5 bg-white/[0.02] border border-white/5 rounded-3xl flex flex-col justify-between">
                    <span className="text-[8px] font-mono uppercase text-white/40 block mb-3 font-bold">{locale === "fr" ? "Calculateur de Sponsoring" : locale === "es" ? "Calculadora de Patrocinio" : "Sponsored Calculator"}</span>
                    
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] font-mono font-bold text-[#b9cac9]">
                          <span>{locale === "fr" ? "Créateurs dans la Liste :" : locale === "es" ? "Creadores en Lista:" : "Creators in List:"}</span>
                          <MonoNumber value={selectedCreatorsCount} />
                        </div>
                        <input 
                          type="range" 
                          min={2} 
                          max={10} 
                          value={selectedCreatorsCount} 
                          onChange={(e) => setSelectedCreatorsCount(parseInt(e.target.value))}
                          className="w-full accent-[#00fbfb] cursor-pointer h-1 bg-white/10 rounded-lg appearance-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] font-mono font-bold text-[#b9cac9]">
                          <span>{locale === "fr" ? "Tarif Moyen :" : locale === "es" ? "Precio Promedio:" : "Avg Creator Price:"}</span>
                          <MonoNumber value={`$${averageCreatorPrice}`} />
                        </div>
                        <input 
                          type="range" 
                          min={10} 
                          max={50} 
                          value={averageCreatorPrice} 
                          onChange={(e) => setAverageCreatorPrice(parseInt(e.target.value))}
                          className="w-full accent-[#ffabf3] cursor-pointer h-1 bg-white/10 rounded-lg appearance-none"
                        />
                      </div>
                    </div>

                    <div className="border-t border-white/5 pt-4 mt-4 space-y-2">
                      <div className="flex justify-between items-center text-[10px] font-bold text-white uppercase">
                        <span>{locale === "fr" ? "Prix du Pack (PM) :" : locale === "es" ? "Precio Paquete (PM):" : "Bundle Price (PM):"}</span>
                        <span className="text-sm font-mono text-[#00fbfb] font-black">${calculateMasterSubscriptionPrice()}/mo</span>
                      </div>
                      <div className="flex justify-between items-center text-[8px] font-mono font-bold text-[#b9cac9]">
                        <span>{locale === "fr" ? "Base Garantie (par créateur) :" : locale === "es" ? "Base Garantizada (por creador):" : "Guaranteed Base (per creator):"}</span>
                        <span className="text-[#39FF14]">${calculateCreatorGuaranteedPayout()}/mo</span>
                      </div>
                    </div>
                  </div>
                </div>
              </DoubleBezelCard>
            </div>

          </div>
        </section>

        {/* Section 4: Comparison Matrix (Reworked for OnlyFans & Tinder, Bumble, Hinge) */}
        <section className="space-y-8">
          <div className="text-left space-y-3">
            <h2 className="font-['Outfit'] text-2xl sm:text-4xl font-black text-white uppercase tracking-tight">
              {locale === "fr" ? "SECCION vs. Standards de l'Industrie" : locale === "es" ? "SECCION vs. Estándares de la Industria" : "SECCION vs. Industry Standards"}
            </h2>
            <p className="text-xs sm:text-sm text-[#b9cac9] max-w-2xl leading-relaxed">
              {locale === "fr" ? "Nous remplaçons les commissions abusives, faux comptes et contrats de gestion prédateurs par une technologie équitable et intégrée." : locale === "es" ? "Reemplazamos comisiones predatorias, cuentas falsas y contratos abusivos de gestión con tecnología justa e integrada." : "We replace predatory fees, fake accounts, and exploitative management contracts with fair, built-in technology."}
            </p>
          </div>

          <DoubleBezelCard>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-[#b9cac9] min-w-[650px]">
                <thead>
                  <tr className="border-b border-white/10 text-[9px] font-mono uppercase tracking-widest text-white/50">
                    <th className="py-4 font-bold">{locale === "fr" ? "Critère de Comparaison" : locale === "es" ? "Vector de Comparación" : "Comparison Vector"}</th>
                    <th className="py-4 font-bold text-[#00fbfb]">{locale === "fr" ? "Plateforme SECCION" : locale === "es" ? "Plataforma SECCION" : "SECCION Platform"}</th>
                    <th className="py-4 font-bold text-[#ffabf3]">{locale === "fr" ? "Apps de Rencontre (Tinder, Bumble, Hinge)" : locale === "es" ? "Apps de Citas (Tinder, Bumble, Hinge)" : "Dating Apps (Tinder, Bumble, Hinge)"}</th>
                    <th className="py-4 font-bold text-[#ffcd2b]">{locale === "fr" ? "Plateformes de Contenu (OnlyFans)" : locale === "es" ? "Plataformas de Contenido (OnlyFans)" : "Content Platforms (OnlyFans)"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  <tr>
                    <td className="py-4 font-bold text-white font-mono uppercase text-[10px]">{locale === "fr" ? "Coût du Matchmaking" : locale === "es" ? "Costo de Matchmaking" : "Matching Cost"}</td>
                    <td className="py-4 text-[#00fbfb] font-bold">{locale === "fr" ? "100 % Gratuit - Financé par les créateurs" : locale === "es" ? "100% Gratis - Financiado por creadores" : "100% Free - Funded by creators"}</td>
                    <td className="py-4 text-red-400">{locale === "fr" ? "9 $ à 30 $ / Mois pour de simples boosts de visibilité" : locale === "es" ? "$9 - $30 / Mes por impulsos de visibilidad básicos" : "$9 - $30 / Month for basic visibility boosts"}</td>
                    <td className="py-4">{locale === "fr" ? "Aucune fonction de match (Liens directs uniquement)" : locale === "es" ? "Sin funciones de match (Solo enlaces directos)" : "No matching features (Direct links only)"}</td>
                  </tr>
                  <tr>
                    <td className="py-4 font-bold text-white font-mono uppercase text-[10px]">{locale === "fr" ? "Paiement au Créateur" : locale === "es" ? "Pago al Creador" : "Creator Payout"}</td>
                    <td className="py-4 text-[#00fbfb] font-bold">{locale === "fr" ? "Rétention de 80 % Garantie" : locale === "es" ? "Reparto del 80% Garantizado" : "80% Guaranteed Payout Split"}</td>
                    <td className="py-4">{locale === "fr" ? "Non applicable (Pas de modèle créateur)" : locale === "es" ? "No aplica (Sin modelos de pago a creadores)" : "Not applicable (No creator payout models)"}</td>
                    <td className="py-4 text-red-400">{locale === "fr" ? "80 % théorique (Tombant à 50-60 % après frais cachés et intermédiaires)" : locale === "es" ? "80% teórico (Pero cae a 50-60% tras comisiones ocultas y costos de gestión)" : "80% theoretical (But drops to 50-60% after hidden escrow and layout fees)"}</td>
                  </tr>
                  <tr>
                    <td className="py-4 font-bold text-white font-mono uppercase text-[10px]">{locale === "fr" ? "Support Opérationnel" : locale === "es" ? "Soporte de Operaciones" : "Operations Support"}</td>
                    <td className="py-4 text-[#00fbfb] font-bold">{locale === "fr" ? "Assistant d'Opérations IA Intégré (Gratuit)" : locale === "es" ? "Asistente de Operaciones IA Integrado (Gratis)" : "Free Built-in Operations AI Assistant"}</td>
                    <td className="py-4">{locale === "fr" ? "Aucun (Profils autogérés)" : locale === "es" ? "Ninguno (Perfiles autogestionados)" : "None (Self managed profiles)"}</td>
                    <td className="py-4 text-red-400">{locale === "fr" ? "Nécessite des agences tierces très coûteuses (prenant jusqu'à 50 % de commission supplémentaire)" : locale === "es" ? "Requiere soporte costoso de agencia externa (toma hasta el 50% extra)" : "Requires expensive external agency support (takes up to 50% extra cut)"}</td>
                  </tr>
                  <tr>
                    <td className="py-4 font-bold text-white font-mono uppercase text-[10px]">{locale === "fr" ? "Protection du Chat" : locale === "es" ? "Protección en Chat" : "Chat Safeguards"}</td>
                    <td className="py-4 text-[#00fbfb] font-bold">{locale === "fr" ? "Option Flou Facial + Cache de médias éphémères" : locale === "es" ? "Opción Face Blur + Caché de medios efímeros" : "Face Blur option + Disappearing Media cache"}</td>
                    <td className="py-4 text-red-400">{locale === "fr" ? "Aucun (Tous les profils et photos publics pour tous)" : locale === "es" ? "Ninguno (Perfiles y fotos públicos para todos)" : "None (All profiles and photos public to anyone)"}</td>
                    <td className="py-4">{locale === "fr" ? "Simples barrières de paiement (Aucune vérification biométrique)" : locale === "es" ? "Solo barreras de pago básicas (Sin checks biométricos)" : "Basic paywall overlays only (No biometric checks)"}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </DoubleBezelCard>
        </section>

        {/* Section 5: Unique Technology Bento Grid */}
        <section className="space-y-8">
          <div className="text-left space-y-3">
            <h2 className="font-['Outfit'] text-2xl sm:text-4xl font-black text-white uppercase tracking-tight">
              {locale === "fr" ? "Infrastructure Technologique Unique" : locale === "es" ? "Infraestructura Tecnológica Única" : "Unique Technology Infrastructure"}
            </h2>
            <p className="text-xs sm:text-sm text-[#b9cac9] max-w-2xl leading-relaxed">
              {locale === "fr" ? "Nous exploitons l'IA de pointe, un cache temps réel et des couches de sécurité pour protéger votre vie privée et fluidifier vos opérations quotidiennes." : locale === "es" ? "Aprovechamos IA moderna, caché en tiempo real y capas de seguridad para proteger tu privacidad y facilitar tus operaciones diarias." : "We leverage modern AI, real-time caching, and security layers to protect your privacy and ease daily operations."}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Box 1: Face Blur Simulation */}
            <DoubleBezelCard>
              <div className="space-y-4 text-left">
                <div className="flex justify-between items-start">
                  <div className="w-10 h-10 rounded-xl bg-[#00fbfb]/10 border border-[#00fbfb]/25 flex items-center justify-center">
                    <EyeOff className="w-5 h-5 text-[#00fbfb]" />
                  </div>
                  <button 
                    onClick={() => setFaceBlurred(!faceBlurred)}
                    className="px-3 py-1 bg-white/5 border border-white/10 hover:border-white/30 text-white rounded-lg text-[9px] font-mono uppercase font-bold cursor-pointer transition"
                  >
                    {locale === "fr" ? "Basculer le Filtre" : locale === "es" ? "Alternar Filtro" : "Toggle Decrypter"}
                  </button>
                </div>
                
                <div className="flex gap-4 items-center p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0">
                    <img 
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80" 
                      className={`w-full h-full object-cover transition-all duration-300 ${faceBlurred ? 'blur-[12px]' : ''}`}
                    />
                    <div className="absolute inset-0 border border-white/10 rounded-xl" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase flex items-center gap-1.5">
                      {faceBlurred ? <Lock className="w-3.5 h-3.5 text-[#ffabf3]" /> : <Unlock className="w-3.5 h-3.5 text-[#00fbfb]" />}
                      {locale === "fr" ? "Protection Flou Facial" : locale === "es" ? "Protección Face Blur" : "Face Blur Protection"}
                    </h4>
                    <p className="text-[10px] text-[#b9cac9] leading-relaxed mt-1">
                      {locale === "fr" ? "Choisissez de flouter votre visage sur vos cartes de swipe. Vos photos mettent en avant votre style général et les traits de votre visage ne se révèlent qu'aux paliers de complicité élevés." : locale === "es" ? "Elige difuminar el rostro en tus tarjetas de swipe. Las fotos muestran tu estilo general y los detalles faciales se desbloquean solo en umbrales de química altos." : "Choose to blur your face overlay on swipes. Unblurred style anchors show your look, and face detail unlocks only at higher chemistry thresholds."}
                    </p>
                  </div>
                </div>
              </div>
            </DoubleBezelCard>

            {/* Box 2: Instant Translation Simulation */}
            <DoubleBezelCard>
              <div className="space-y-4 text-left">
                <div className="flex justify-between items-start">
                  <div className="w-10 h-10 rounded-xl bg-[#ffabf3]/10 border border-[#ffabf3]/25 flex items-center justify-center">
                    <Globe className="w-5 h-5 text-[#ffabf3]" />
                  </div>
                  <button 
                    onClick={() => setIsTranslated(!isTranslated)}
                    className="px-3 py-1 bg-white/5 border border-white/10 hover:border-white/30 text-white rounded-lg text-[9px] font-mono uppercase font-bold cursor-pointer transition"
                  >
                    {isTranslated ? (locale === "fr" ? "Voir l'Original" : locale === "es" ? "Ver Original" : "Show Original") : (locale === "fr" ? "Traduire le fil" : locale === "es" ? "Traducir chat" : "Translate thread")}
                  </button>
                </div>

                <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl space-y-2.5">
                  {chatMessages.map((msg, i) => (
                    <div key={i} className="text-[10px]">
                      <span className="font-mono text-white/50 block mb-0.5">{msg.sender}</span>
                      <p className="text-white bg-white/5 px-2.5 py-1.5 rounded-lg inline-block max-w-full">
                        {isTranslated ? msg.translated : msg.original}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </DoubleBezelCard>

            {/* Box 3: AI Operations Assistant Terminal */}
            <DoubleBezelCard>
              <div className="space-y-4 text-left">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center">
                    <Bot className="w-5 h-5 text-emerald-400" />
                  </div>
                  <h4 className="text-xs font-bold text-white uppercase">{locale === "fr" ? "Assistant d'Opérations IA" : locale === "es" ? "Asistente de Operaciones IA" : "Operations AI Assistant"}</h4>
                </div>

                <div className="flex gap-2 border-b border-white/5 pb-2.5 overflow-x-auto">
                  {assistantPrompts.map((p, idx) => (
                    <button
                      key={idx}
                      onClick={() => setAssistantStep(idx)}
                      className={`px-3 py-1.5 rounded-lg border font-mono text-[8px] uppercase font-bold transition shrink-0 cursor-pointer ${
                        assistantStep === idx ? 'border-emerald-400 text-emerald-400 bg-emerald-400/5' : 'border-white/5 text-white/30 hover:text-white/50'
                      }`}
                    >
                      {locale === "fr" ? "Tâche " : locale === "es" ? "Tarea " : "Task "}{idx + 1}
                    </button>
                  ))}
                </div>

                <div className="p-4 bg-[#050505] border border-white/5 rounded-2xl space-y-2 font-mono text-[9px]">
                  <div className="text-white/40">&gt; Prompt: {assistantPrompts[assistantStep].query}</div>
                  <div className="text-[#39FF14] leading-relaxed">&gt; Reply: {assistantPrompts[assistantStep].reply}</div>
                </div>
              </div>
            </DoubleBezelCard>

            {/* Box 4: Content Orders & Escrow Protection */}
            <DoubleBezelCard>
              <div className="space-y-4 text-left">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#00fbfb]/10 border border-[#00fbfb]/25 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-[#00fbfb]" />
                  </div>
                  <h3 className="text-xs font-bold text-white uppercase">{locale === "fr" ? "Commandes personnalisées & Séquestre" : locale === "es" ? "Pedidos de contenido personalizado y escrow" : "Custom content order & escrow"}</h3>
                </div>

                <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl space-y-3">
                  <p className="text-[10px] text-[#b9cac9] leading-relaxed">
                    {locale === "fr" ? "Les membres peuvent commander du contenu digital exclusif (dédicaces vidéo, sessions de conseils ou lives privés)." : locale === "es" ? "Los miembros pueden solicitar contenido digital personalizado (como videos exclusivos, consejos o streams privados)." : "Members can request personalized digital content (such as custom recordings, advice reels, or custom streams)."}
                  </p>
                  <p className="text-[10px] text-[#b9cac9] leading-relaxed">
                    {locale === "fr" ? "Pour garantir une confiance totale, les fonds sont consignés sous **Séquestre Sécurisé** et ne sont libérés au créateur qu'une fois le contenu livré et validé, protégeant les deux parties de toute fraude." : locale === "es" ? "Para garantizar confianza, los fondos se retienen de forma segura en **Escrow de Plataforma** y solo se liberan al creador cuando el contenido es entregado y verificado, protegiendo a ambas partes del fraude." : "To guarantee trust, payment tokens are held securely in **Platform Escrow** and are only released to the creator once the content is delivered and verified by the member, protecting both sides from fraud."}
                  </p>
                </div>
              </div>
            </DoubleBezelCard>

          </div>
        </section>

        {/* Section 6: User Rating & Profile Switching */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5 flex justify-center">
            <DoubleBezelCard className="w-full max-w-[420px]">
              <div className="space-y-6 text-left">
                <span className="text-[10px] font-mono text-white/40 uppercase font-bold tracking-wider block">{locale === "fr" ? "Indicateurs de Trust Score" : locale === "es" ? "Métricas de Trust Score" : "Trust Score Metrics"}</span>
                
                <div className="p-5 bg-white/[0.02] border border-[#ffabf3]/20 rounded-2xl text-center space-y-3">
                  <span className="text-[9px] font-mono text-[#ffabf3] uppercase font-bold block">{locale === "fr" ? "Seuil d'évaluation" : locale === "es" ? "Límite de puntuación" : "Rating score limit"}</span>
                  <div className="text-3xl font-black font-mono text-white">
                    20.00 <span className="text-xs text-[#ffabf3]">MAX</span>
                  </div>
                  <p className="text-[9px] text-[#b9cac9] leading-relaxed">
                    {locale === "fr" ? "Membres et créateurs s'évaluent mutuellement après chaque interaction. Une note élevée augmente votre priorité de match, tandis qu'une note basse restreint la visibilité du profil." : locale === "es" ? "Miembros y creadores se califican mutuamente tras interactuar. Las altas puntuaciones mejoran la prioridad de match, mientras que las bajas limitan la visibilidad del perfil." : "General members and creators rate each other after interactions. High ratings boost match priority, while low scores limit profile visibility."}
                  </p>
                </div>
              </div>
            </DoubleBezelCard>
          </div>

          <div className="lg:col-span-7 space-y-6 text-left">
            <h2 className="font-['Outfit'] text-2xl sm:text-4xl font-black text-white uppercase tracking-tight">
              {locale === "fr" ? "Évaluations & Changement Rapide de Rôle" : locale === "es" ? "Calificaciones y Cambio de Rol" : "Rating & Quick Role Switching"}
            </h2>
            <div className="space-y-4 text-xs sm:text-sm text-[#b9cac9] leading-relaxed">
              <p>
                {locale === "fr" ? "Pour préserver un niveau d'exigence élevé, créateurs et membres évaluent leurs interactions. Une dynamique d'avis positifs améliore la priorité dans les recherches." : locale === "es" ? "Para mantener altos estándares, creadores y miembros califican sus matches. Las calificaciones positivas aumentan tu prioridad en las búsquedas." : "To maintain high community standards, both creators and members rate their matches. Positive rating velocity boosts visibility in search priority."}
              </p>
              <p>
                {locale === "fr" ? "Notre processus d'onboarding reste limpide. **Chaque créateur s'inscrit d'abord comme membre général.** Cela garantit le contrôle d'identité et de liveness. Une fois inscrit, vous activez le Mode Créateur dans vos paramètres pour débloquer les outils d'édition, les salons de live et les filtres de géoblocage." : locale === "es" ? "Mantenemos el onboarding simple. **Todo creador se registra primero como miembro general.** Esto asegura que pases el control de seguridad y liveness. Una vez registrado, puedes activar el Modo Creador en tus ajustes para desbloquear herramientas de publicación, salas de streaming y filtros de geocerca." : "We keep the onboarding flow simple. **Every creator registers as a general member first.** This ensures you pass the initial safety and liveness check. Once registered, you can toggle Creator Mode inside your settings panel to unlock publishing tools, streaming control rooms, and geofencing filters."}
              </p>
            </div>
            <div className="flex items-center gap-3 p-4 bg-white/[0.02] border border-white/5 rounded-3xl">
              <UserCheck className="w-5 h-5 text-[#00fbfb]" />
              <span className="text-[11px] text-[#b9cac9] leading-relaxed">
                {locale === "fr" ? "Inscrivez-vous une seule fois, explorez vos affinités et activez les fonctionnalités créateur en un clic. Aucun double compte requis." : locale === "es" ? "Regístrate una vez, explora los matches y activa las opciones de creador al instante. Sin necesidad de cuentas dobles." : "Register once, explore matching, and toggle creator options instantly. No dual accounts needed."}
              </span>
            </div>
          </div>
        </section>

        {/* Section 7: Extra Platform Features */}
        <section className="space-y-8">
          <div className="text-left space-y-3">
            <h2 className="font-['Outfit'] text-2xl sm:text-4xl font-black text-white uppercase tracking-tight">
              {locale === "fr" ? "Bouclier de Sécurité & Confidentialité" : locale === "es" ? "Escudo de Seguridad y Protección" : "Safety & Security Shield"}
            </h2>
            <p className="text-xs sm:text-sm text-[#b9cac9] max-w-2xl leading-relaxed">
              {locale === "fr" ? "La sécurité est primordiale sur SECCION. Nous effectuons des audits actifs et déployons des couches sur-mesure pour protéger créateurs comme membres." : locale === "es" ? "La seguridad es primordial en SECCION. Ejecutamos rastreos activos y capas personalizadas para proteger a creadores y miembros por igual." : "Safety isn't an afterthought on SECCION. We run active sweeps and custom layers to protect creators and members alike."}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-white/[0.02] border border-white/5 rounded-3xl text-left space-y-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center">
                <Shield className="w-4 h-4 text-emerald-400" />
              </div>
              <h3 className="text-xs font-bold text-white uppercase">{locale === "fr" ? "Protection DRM Sweeper" : locale === "es" ? "Protección DRM Sweeper" : "DRM Sweeper Protection"}</h3>
              <p className="text-[10px] text-[#b9cac9] leading-relaxed">
                {locale === "fr" ? "Notre Web Sweeper automatisé scanne les index et caches externes pour repérer et faire supprimer toute fuite non autorisée, protégeant vos droits d'auteur." : locale === "es" ? "Nuestro Web Sweeper automatizado escanea cachés e índices externos para localizar y eliminar filtraciones no autorizadas, protegiendo los derechos de autor del creador." : "Our automated Web Sweeper scans external file locks and index caches to locate and remove unauthorized content leaks, protecting creator copyright."}
              </p>
            </div>

            <div className="p-6 bg-white/[0.02] border border-white/5 rounded-3xl text-left space-y-3">
              <div className="w-8 h-8 rounded-lg bg-[#00fbfb]/10 border border-[#00fbfb]/25 flex items-center justify-center">
                <Globe className="w-4 h-4 text-[#00fbfb]" />
              </div>
              <h3 className="text-xs font-bold text-white uppercase">{locale === "fr" ? "Filtres de Géoblocage" : locale === "es" ? "Filtros de Geocerca" : "Geofencing Filters"}</h3>
              <p className="text-[10px] text-[#b9cac9] leading-relaxed">
                {locale === "fr" ? "Les créateurs peuvent masquer des pays, villes ou régions précises pour bloquer la visibilité locale et empêcher leur entourage de trouver leur profil." : locale === "es" ? "Los creadores pueden restringir países, ciudades o provincias específicas para bloquear la visibilidad local y evitar que conocidos o familiares descubran su perfil." : "Creators can geofence specific countries, cities, or provinces to block local visibility and prevent acquaintances or family from discovering their profile."}
              </p>
            </div>

            <div className="p-6 bg-white/[0.02] border border-white/5 rounded-3xl text-left space-y-3">
              <div className="w-8 h-8 rounded-lg bg-[#ffabf3]/10 border border-[#ffabf3]/25 flex items-center justify-center">
                <FileText className="w-4 h-4 text-[#ffabf3]" />
              </div>
              <h3 className="text-xs font-bold text-white uppercase">{locale === "fr" ? "Copilote de Contrats" : locale === "es" ? "Copiloto de Contratos" : "Contract Copilot"}</h3>
              <p className="text-[10px] text-[#b9cac9] leading-relaxed">
                {locale === "fr" ? "Un scanner intégré qui analyse automatiquement les contrats d'agences tierces pour détecter les clauses abusives et protéger votre propriété intellectuelle." : locale === "es" ? "Un escáner integrado que revisa automáticamente acuerdos de agencias externas en busca de cláusulas abusivas, protegiendo la propiedad intelectual del creador." : "A built-in scanner that automatically reviews external agency agreements for predatory lock-in conditions, protecting creator intellectual property."}
              </p>
            </div>
          </div>
        </section>

        {/* Final Call to Action */}
        <section className="pt-12 text-center space-y-6">
          <h2 className="font-['Outfit'] text-3xl sm:text-5xl font-black text-white uppercase tracking-tight">
            {locale === "fr" ? "Prêt(e) à Trouver Votre Résonance ?" : locale === "es" ? "¿Listo para Encontrar tu Resonancia?" : "Ready to Find Your Resonance?"}
          </h2>
          <p className="text-[#b9cac9] text-xs sm:text-sm max-w-md mx-auto">
            {locale === "fr" ? "Participez à la quête d'onboarding pour découvrir votre archétype, synchroniser vos vibes et débloquer de vraies affinités." : locale === "es" ? "Realiza el quest de onboarding para descubrir tu arquetipo, sincronizar tus vibes y desbloquear conexiones genuinas." : "Take the onboarding quest to discover your archetype, sync your vibes, and unlock genuine connections."}
          </p>
          <div className="flex justify-center">
            <Link 
              href="/early-access"
              className="px-10 py-4 rounded-full bg-[#00fbfb] text-black font-mono text-xs font-black uppercase tracking-widest hover:shadow-[0_0_25px_rgba(0,251,251,0.6)] transition active:scale-[0.98] cursor-pointer inline-flex items-center gap-2"
            >
              <span>{locale === "fr" ? "Démarrer la Quête d'Onboarding" : locale === "es" ? "Iniciar Quest de Onboarding" : "Start Onboarding Quest"}</span>
              <ArrowRight className="w-4 h-4 text-black" />
            </Link>
          </div>
        </section>

      </main>

      {/* Footer */}
      <PublicFooter />

    </div>
  );
}
