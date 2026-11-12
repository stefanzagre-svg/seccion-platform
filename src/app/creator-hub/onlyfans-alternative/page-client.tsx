"use client";

import React from "react";
import Link from "next/link";
import PublicNavbar from "@/components/PublicNavbar";
import PublicFooter from "@/components/PublicFooter";
import { useTranslation } from "@/context/LanguageContext";
import {
  ShieldCheck,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Bot,
  DollarSign,
  Scale
} from "lucide-react";

export default function OnlyFansAlternativeClient() {
  const { locale } = useTranslation();

  const comparisonData = [
    {
      feature: locale === "fr" ? "Commission de la Plateforme" : locale === "es" ? "Comisión de la Plataforma" : "Platform Revenue Take-Rate",
      seccion: locale === "fr" ? "10 % (Vous conservez 90 %)" : locale === "es" ? "10% (Tú te quedas con el 90%)" : "10% (Creator Keeps 90%)",
      onlyfans: locale === "fr" ? "20 % (Vous conservez 80 %)" : locale === "es" ? "20% (Te quedas con el 80%)" : "20% (Creator Keeps 80%)",
      fansly: locale === "fr" ? "20 % (Vous conservez 80 %)" : locale === "es" ? "20% (Te quedas con el 80%)" : "20% (Creator Keeps 80%)",
      patreon: locale === "fr" ? "8 % à 12 % + Frais de Traitement Élevés" : locale === "es" ? "8% a 12% + Comisiones Altas" : "8% to 12% + High Processing",
      tinder: locale === "fr" ? "0 % de Monétisation (Modèle Publicitaire)" : locale === "es" ? "0% Monetización (Solo Anuncios)" : "0% Monetization (Ad Model)",
      chaturbate: locale === "fr" ? "50 % (Jetons partagés 50/50)" : locale === "es" ? "50% (Tokens divididos 50/50)" : "50% (Tokens Split 50/50)",
      highlight: true,
    },
    {
      feature: locale === "fr" ? "Copilote IA 24/7 pour les DMs" : locale === "es" ? "Copiloto IA 24/7 para DMs" : "Built-in 24/7 AI DM Copilot",
      seccion: locale === "fr" ? "Inclus (GRATUIT 1ère Année)" : locale === "es" ? "Incluido (GRATIS 1er Año)" : "Included (FREE Year 1)",
      onlyfans: locale === "fr" ? "Aucun (40 % prélevés par l'agence)" : locale === "es" ? "Ninguno (40% para agencia)" : "None (40% Agency Fee)",
      fansly: locale === "fr" ? "Aucun" : locale === "es" ? "Ninguno" : "None",
      patreon: locale === "fr" ? "Aucun" : locale === "es" ? "Ninguno" : "None",
      tinder: locale === "fr" ? "Aucun" : locale === "es" ? "Ninguno" : "None",
      chaturbate: locale === "fr" ? "Aucun" : locale === "es" ? "Ninguno" : "None",
      highlight: true,
    },
    {
      feature: locale === "fr" ? "Audits DRM Anti-Fuite" : locale === "es" ? "Barridos DRM Anti-Filtración" : "Automated DRM Anti-Leak Sweeps",
      seccion: locale === "fr" ? "Automatique 24/7 avec DMCA Légal" : locale === "es" ? "Automático 24/7 con DMCA Legal" : "Automated 24/7 Legal DMCA",
      onlyfans: locale === "fr" ? "Manuel / Service Tiers Payant" : locale === "es" ? "Manual / Servicio de Pago" : "Manual / Paid 3rd-Party",
      fansly: locale === "fr" ? "Signalement Manuel" : locale === "es" ? "Reporte Manual" : "Manual Reporting",
      patreon: locale === "fr" ? "Aucun" : locale === "es" ? "Ninguno" : "None",
      tinder: "N/A",
      chaturbate: locale === "fr" ? "Zéro Protection (Risque Élevé de Fuite)" : locale === "es" ? "Cero Protección (Alto Riesgo)" : "Zero Protection (High Leak Risk)",
      highlight: true,
    },
    {
      feature: locale === "fr" ? "Confidentialité & Flou Facial" : locale === "es" ? "Privacidad y Difuminado Facial" : "Privacy & Stealth Face Blur",
      seccion: locale === "fr" ? "Oui (Chiffrement ZKP sur les Feeds)" : locale === "es" ? "Sí (Cifrado ZKP en Feeds)" : "Yes (ZKP Face Blur on Feeds)",
      onlyfans: locale === "fr" ? "Non (Entièrement Exposé)" : locale === "es" ? "No (Totalmente Expuesto)" : "No (Fully Exposed)",
      fansly: locale === "fr" ? "Non" : locale === "es" ? "No" : "No",
      patreon: locale === "fr" ? "Non" : locale === "es" ? "No" : "No",
      tinder: locale === "fr" ? "Non" : locale === "es" ? "No" : "No",
      chaturbate: locale === "fr" ? "Non (Flux Publics)" : locale === "es" ? "No (Transmisión Pública)" : "No (Public Live Feeds)",
      highlight: true,
    },
    {
      feature: locale === "fr" ? "Modèle de Découverte & Matchmaking" : locale === "es" ? "Modelo de Descubrimiento" : "Discovery & Matchmaking Model",
      seccion: locale === "fr" ? "Warm Paywall (L'Alchimie d'Abord)" : locale === "es" ? "Warm Paywall (Conexión Primero)" : "Warm Paywall (Chemistry First)",
      onlyfans: locale === "fr" ? "Paywall Froid (Zéro Découverte Organique)" : locale === "es" ? "Paywall Frío (0 Descubrimiento)" : "Cold Paywall (0 Organic Discovery)",
      fansly: locale === "fr" ? "Feed Interne FYP" : locale === "es" ? "Feed Interno FYP" : "Internal FYP Feed",
      patreon: locale === "fr" ? "Zéro Découverte (Trafic Externe Uniquement)" : locale === "es" ? "Cero Descubrimiento Interno" : "Zero Discovery (Off-site Only)",
      tinder: locale === "fr" ? "Fatigue du Swipe Superficiel" : locale === "es" ? "Desgaste de Swipes Superficiales" : "Superficial Swipe Fatigue",
      chaturbate: locale === "fr" ? "Annuaire Public (Forte Stigmatisation)" : locale === "es" ? "Directorio Público (Alto Estigma)" : "Public Directory (High Stigma)",
      highlight: false,
    },
    {
      feature: locale === "fr" ? "Appels Vidéo 1-à-1 & Lives Intégrés" : locale === "es" ? "Videollamadas 1-a-1 y Streams" : "Integrated 1-on-1 Video & Live",
      seccion: locale === "fr" ? "Appels & Lives WebRTC Natifs" : locale === "es" ? "Llamadas y Streams Nativos" : "Native WebRTC Calls & Streams",
      onlyfans: locale === "fr" ? "Liens Externes Requis" : locale === "es" ? "Requiere Enlaces Externos" : "External Links Required",
      fansly: locale === "fr" ? "Streaming Limité" : locale === "es" ? "Streaming Limitado" : "Limited Streaming",
      patreon: locale === "fr" ? "Outils Tiers (Zoom / Vimeo)" : locale === "es" ? "Terceros (Zoom / Vimeo)" : "3rd Party (Zoom/Vimeo)",
      tinder: locale === "fr" ? "Aucun" : locale === "es" ? "Ninguno" : "None",
      chaturbate: locale === "fr" ? "Cams Publiques à Pourboires Uniquement" : locale === "es" ? "Cams Públicas de Propinas" : "Public Tip Cams Only",
      highlight: false,
    },
    {
      feature: locale === "fr" ? "Audit de Contrats avec l'IA" : locale === "es" ? "Auditoría de Contratos con IA" : "Brand Deal & Contract Screening AI",
      seccion: locale === "fr" ? "Copilote Légal Intégré" : locale === "es" ? "Copiloto Legal Integrado" : "Built-in Legal Copilot",
      onlyfans: locale === "fr" ? "Aucun" : locale === "es" ? "Ninguno" : "None",
      fansly: locale === "fr" ? "Aucun" : locale === "es" ? "Ninguno" : "None",
      patreon: locale === "fr" ? "Aucun" : locale === "es" ? "Ninguno" : "None",
      tinder: locale === "fr" ? "Aucun" : locale === "es" ? "Ninguno" : "None",
      chaturbate: locale === "fr" ? "Aucun" : locale === "es" ? "Ninguno" : "None",
      highlight: false,
    },
    {
      feature: locale === "fr" ? "Moyens de Paiement & Retraits" : locale === "es" ? "Métodos de Cobro y Pagos" : "Payout Methods",
      seccion: locale === "fr" ? "Virement Bancaire Direct (UE/US/LATAM) + USDT/USDC" : locale === "es" ? "Banco Directo + Cripto USDT/USDC" : "Direct Bank (EU/US/LatAm) + USDT/USDC",
      onlyfans: locale === "fr" ? "Virement Bancaire Uniquement" : locale === "es" ? "Solo Transferencia Bancaria" : "Bank Transfer Only",
      fansly: locale === "fr" ? "Banque / Skrill" : locale === "es" ? "Banco / Skrill" : "Bank / Skrill",
      patreon: locale === "fr" ? "Banque / PayPal" : locale === "es" ? "Banco / PayPal" : "Bank / PayPal",
      tinder: "N/A",
      chaturbate: locale === "fr" ? "Chèque / Virement / Crypto" : locale === "es" ? "Cheque / Cripto" : "Check / Wire / Crypto",
      highlight: false,
    },
  ];

  const faqs = [
    {
      q: locale === "fr" ? "Pourquoi SECCION est-elle la meilleure plateforme créateur en 2026 ?" : locale === "es" ? "¿Por qué SECCION es la mejor plataforma para creadores en 2026?" : "Why is SECCION the best alternative platform to OnlyFans, Fansly, and Patreon in 2026?",
      a: locale === "fr" ? "SECCION réunit le taux de reversement le plus élevé du marché (90 % de rétention nette en Année 1) et des technologies d'intelligence artificielle de pointe. Vous profitez d'un Copilote IA 24/7 qui répond aux messages privés avec votre ton exact, audite vos contrats et effectue des analyses automatiques contre le piratage avec retraits DMCA immédiats." : locale === "es" ? "SECCION combina la mayor retención de ingresos del mercado (te quedas con el 90% neto en el Año 1) con herramientas de inteligencia artificial de última generación. Cuentas con un Copiloto IA 24/7 que responde mensajes privados con tu tono exacto, audita contratos y realiza barridos automáticos contra filtraciones con retiros DMCA inmediatos." : "SECCION combines the highest payout in the industry (90% net revenue split) with the latest artificial intelligence tools. Creators get a 24/7 AI Operations Copilot that manages fan DMs in their unique voice, screens brand contracts, and automatically sweeps the web to file legal DMCA takedowns against leaked content."
    },
    {
      q: locale === "fr" ? "Comment SECCION se compare-t-elle aux sites de webcam traditionnels comme Chaturbate ?" : locale === "es" ? "¿Cómo se compara SECCION con sitios tradicionales de webcam como Chaturbate?" : "How does SECCION compare to traditional webcam sites like Chaturbate?",
      a: locale === "fr" ? "Les sites de webcam retiennent 50 % de vos revenus via les jetons, n'offrent aucune protection contre les fuites et exposent les créateurs à une forte stigmatisation. Sur SECCION, vous conservez 90 % de vos gains, vos lives sont privés et réservés à vos soutiens de Niveau 3+, et le Flou Facial garantit votre discrétion." : locale === "es" ? "Los sitios de webcam se quedan con el 50% de tus ingresos mediante tokens, ofrecen nula protección contra filtraciones y exponen a los creadores a un fuerte estigma. En SECCION conservas el 90% de tus ingresos, tus transmisiones en vivo son privadas para tus fans de Nivel 3+ y cuentas con Difuminado Facial para proteger tu anonimato." : "Webcam sites take 50% of creator earnings through token markdowns, offer zero leak protection, and expose creators to heavy public stigma. SECCION allows creators to retain 90% of earnings, gates live streams for Level 3+ verified supporters, and includes Stealth Face Blur encryption to protect their personal identity."
    },
    {
      q: locale === "fr" ? "En quoi SECCION se distingue-t-elle des applications de rencontre comme Tinder ?" : locale === "es" ? "¿En qué se diferencia SECCION de aplicaciones de citas como Tinder?" : "How does SECCION differ from dating apps like Tinder?",
      a: locale === "fr" ? "Les apps de rencontre traditionnelles n'offrent aucune monétisation et génèrent une lassitude infinie due au swipe superficiel. SECCION transforme la découverte sociale en une économie créateur pérenne : les membres matchent par affinité et accèdent à vos contenus exclusifs en témoignant d'une réelle fidélité via le Warm Paywall." : locale === "es" ? "Las apps de citas no ofrecen monetización y generan un desgaste infinito por swipes superficiales. SECCION convierte el descubrimiento social en un negocio rentable: los miembros conectan contigo por compatibilidad y desbloquean tu contenido demostrando lealtad a través del Warm Paywall." : "Dating apps like Tinder offer zero monetization and cause immense swipe fatigue through superficial algorithmic matching. SECCION turns social discovery into a high-retention creator economy: members match with creators based on lifestyle compatibility and unlock VIP access through the Warm Paywall."
    },
    {
      q: locale === "fr" ? "Comment bénéficier de l'offre Fondateur 90 % et du Copilote IA Offert ?" : locale === "es" ? "¿Cómo reclamo la oferta del 90% y el Copiloto IA Gratis?" : "How do I claim the 90% Founding Creator Offer and Free AI Copilot?",
      a: locale === "fr" ? "Cliquez simplement sur 'Postuler comme Créateur Fondateur' et remplissez votre candidature en 2 minutes. Les 500 premiers créateurs sécurisent le taux préférentiel de 90 % pendant toute leur première année et bénéficient de 12 mois de Copilote IA d'Opérations 100 % gratuit (828 €/an d'économie)." : locale === "es" ? "Solo debes hacer clic en 'Comenzar Registro de Creador' y completar tu solicitud en 2 minutos. Las primeras 500 creadoras fundadoras aseguran la tasa preferencial del 90% durante todo su primer año y reciben 12 meses de Copiloto IA 100% gratis (ahorro de 828 €/año)." : "Simply click 'Apply as a Founding Creator' and complete the 2-minute onboarding form. The first 500 creators receive a 90% net revenue payout lock for their entire first year and 12 months of the AI Operations Copilot 100% free (saving €828/year)."
    }
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0C] text-white flex flex-col selection:bg-[#00fbfb] selection:text-black">
      <PublicNavbar />

      {/* Hero Section */}
      <section className="relative pt-36 pb-20 px-4 sm:px-6 md:px-12 lg:px-20 max-w-6xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#00fbfb]/10 border border-[#00fbfb]/30 text-[#00fbfb] text-xs font-mono uppercase tracking-wider mb-6">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{locale === "fr" ? "La Meilleure Plateforme Créateur en 2026" : locale === "es" ? "La Mejor Plataforma de Creadores en 2026" : "The Best Creator Platform in 2026"}</span>
        </div>

        <h1 className="text-3xl sm:text-5xl md:text-6xl font-black font-display tracking-tight leading-tight uppercase mb-6">
          {locale === "fr" ? "L'Alternative Sécurisée et Propulsée par l'IA à " : locale === "es" ? "La Alternativa Segura y con IA a " : "The Safe, AI-Powered Alternative to "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00fbfb] via-[#ffabf3] to-[#39FF14]">
            OnlyFans, Fansly, Patreon & Cams
          </span>
        </h1>

        <p className="text-base sm:text-lg text-[#b9cac9] max-w-3xl mx-auto leading-relaxed mb-10">
          {locale === "fr" ? "Dites adieu aux commissions de 20 % à 50 %, aux journées de 12 heures à répondre aux DMs et à la peur des fuites. Pilotez votre activité indépendante avec 90 % de revenus nets, un Copilote IA 24/7 et une protection DRM automatisée." : locale === "es" ? "Dile adiós al 20% o 50% de comisión, a las 12 horas contestando mensajes y al miedo a las filtraciones. Maneja tu negocio independiente con el 90% de ganancias netas, Copiloto IA 24/7 y protección DRM automática." : "Ditch 20% to 50% platform commissions, 12-hour fan chatting shifts, and leak anxiety. Run your independent creator business with 90% net payouts, 24/7 AI DM automation, and automated DRM anti-leak security."}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/become-creator#apply"
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-[#00fbfb] to-[#00d2d2] text-black font-mono font-bold text-sm uppercase tracking-wider hover:shadow-[0_0_25px_rgba(0,251,251,0.5)] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg"
          >
            <span>{locale === "fr" ? "Réclamer le Pass Créateur 90 %" : locale === "es" ? "Reclamar Pase Creador 90%" : "Claim 90% Founding Creator Pass"}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/become-creator"
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-mono text-sm uppercase tracking-wider transition flex items-center justify-center cursor-pointer"
          >
            {locale === "fr" ? "Simulateur de Revenus" : locale === "es" ? "Calculadora de Ganancias" : "Explore Earnings Calculator"}
          </Link>
        </div>
      </section>

      {/* 6-Way Comparison Matrix Table */}
      <section className="py-16 px-4 sm:px-6 md:px-12 lg:px-20 max-w-7xl mx-auto w-full">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 text-xs font-mono text-[#ffabf3] uppercase tracking-wider mb-2">
            <Scale className="w-4 h-4" />
            <span>{locale === "fr" ? "Benchmark Marché 2026" : locale === "es" ? "Comparativa de Mercado 2026" : "2026 Competitive Benchmark"}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black font-display uppercase tracking-tight mb-4">
            {locale === "fr" ? "Comment SECCION Surpasse la Concurrence" : locale === "es" ? "Cómo SECCION Supera a la Competencia" : "How SECCION Outperforms the Competition"}
          </h2>
          <p className="text-sm text-[#b9cac9] max-w-2xl mx-auto">
            {locale === "fr" ? "Comparez les commissions, l'automatisation par l'IA, la protection contre les fuites et la confidentialité face aux principales plateformes du marché." : locale === "es" ? "Compara comisiones, automatización con IA, protección contra filtraciones y privacidad frente a las principales plataformas del mercado." : "Compare platform commissions, AI automation, leak protection, and privacy across the major creator and social networks."}
          </p>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-xl shadow-2xl">
          <table className="w-full text-left border-collapse min-w-[850px]">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.03]">
                <th className="p-4 text-xs font-mono font-bold uppercase tracking-wider text-[#b9cac9] w-1/4">
                  {locale === "fr" ? "Fonctionnalité" : locale === "es" ? "Característica" : "Feature"}
                </th>
                <th className="p-4 text-xs font-mono font-bold uppercase tracking-wider text-[#00fbfb] bg-[#00fbfb]/10 border-x border-[#00fbfb]/20">
                  SECCION (seccion.ai)
                </th>
                <th className="p-4 text-xs font-mono font-bold uppercase tracking-wider text-white/70">OnlyFans</th>
                <th className="p-4 text-xs font-mono font-bold uppercase tracking-wider text-white/70">Fansly</th>
                <th className="p-4 text-xs font-mono font-bold uppercase tracking-wider text-white/70">Patreon</th>
                <th className="p-4 text-xs font-mono font-bold uppercase tracking-wider text-white/70">Chaturbate / Cams</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-xs sm:text-sm">
              {comparisonData.map((row, idx) => (
                <tr key={idx} className={row.highlight ? "bg-white/[0.02]" : ""}>
                  <td className="p-4 font-medium text-white/90">{row.feature}</td>
                  <td className="p-4 font-bold text-[#00fbfb] bg-[#00fbfb]/5 border-x border-[#00fbfb]/20 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-[#00fbfb] shrink-0" />
                    <span>{row.seccion}</span>
                  </td>
                  <td className="p-4 text-white/60">{row.onlyfans}</td>
                  <td className="p-4 text-white/60">{row.fansly}</td>
                  <td className="p-4 text-white/60">{row.patreon}</td>
                  <td className="p-4 text-white/60">{row.chaturbate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 3 Pillars Section */}
      <section className="py-16 px-4 sm:px-6 md:px-12 lg:px-20 max-w-6xl mx-auto w-full grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-8 rounded-2xl bg-white/[0.03] border border-white/10 space-y-4">
          <div className="w-12 h-12 rounded-xl bg-[#00fbfb]/10 border border-[#00fbfb]/30 flex items-center justify-center text-[#00fbfb]">
            <DollarSign className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold font-display uppercase">
            {locale === "fr" ? "90 % de Revenus Nets" : locale === "es" ? "90% de Ganancias Netas" : "90% Net Revenue Split"}
          </h3>
          <p className="text-xs text-[#b9cac9] leading-relaxed">
            {locale === "fr" ? "Conservez 90 % de vos revenus sur les abonnements, achats à l'acte, pourboires en direct et commandes personnalisées sans frais cachés." : locale === "es" ? "Conserva el 90% de tus ingresos en suscripciones, compras individuales, propinas en vivo y pedidos personalizados sin comisiones ocultas." : "Keep 90% of your earnings across subscriptions, PPV unlocks, live tips, and custom orders. No hidden fees or predatory cuts."}
          </p>
        </div>

        <div className="p-8 rounded-2xl bg-white/[0.03] border border-white/10 space-y-4">
          <div className="w-12 h-12 rounded-xl bg-[#ffabf3]/10 border border-[#ffabf3]/30 flex items-center justify-center text-[#ffabf3]">
            <Bot className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold font-display uppercase">
            {locale === "fr" ? "Copilote IA 24/7 pour les DMs" : locale === "es" ? "Copiloto IA 24/7 para DMs" : "24/7 AI Operations Copilot"}
          </h3>
          <p className="text-xs text-[#b9cac9] leading-relaxed">
            {locale === "fr" ? "Votre IA s'entraîne sur votre style pour répondre aux messages privés, qualifier les fans réguliers et auditer vos contrats sans payer 40 % à une agence." : locale === "es" ? "Tu IA aprende tu estilo para responder mensajes privados, filtrar fans destacados y auditar contratos sin pagar el 40% a una agencia." : "Your custom AI handles fan DMs in your exact voice, filters top spenders, and audits brand contracts without paying 40% to chatter agencies."}
          </p>
        </div>

        <div className="p-8 rounded-2xl bg-white/[0.03] border border-white/10 space-y-4">
          <div className="w-12 h-12 rounded-xl bg-[#39FF14]/10 border border-[#39FF14]/30 flex items-center justify-center text-[#39FF14]">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold font-display uppercase">
            {locale === "fr" ? "Bouclier DRM Anti-Fuite" : locale === "es" ? "Escudo DRM Anti-Filtraciones" : "Automated DRM Anti-Leak"}
          </h3>
          <p className="text-xs text-[#b9cac9] leading-relaxed">
            {locale === "fr" ? "Balayage web continu avec signalements DMCA automatiques, complété par le Flou Facial pour protéger votre anonymat sur les flux de découverte." : locale === "es" ? "Rastreo web continuo con denuncias legales DMCA automáticas, más Difuminado Facial para proteger tu identidad en feeds públicos." : "Automated 24/7 web crawling with instant DMCA legal takedowns, plus Stealth Face Blur to maintain privacy on discovery feeds."}
          </p>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-4 sm:px-6 md:px-12 lg:px-20 max-w-4xl mx-auto w-full space-y-6">
        <h2 className="text-3xl font-black font-display text-center uppercase tracking-tight mb-8">
          {locale === "fr" ? "Foire Aux Questions" : locale === "es" ? "Preguntas Frecuentes" : "Frequently Asked Questions"}
        </h2>
        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div key={idx} className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 space-y-2">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#00fbfb] shrink-0" />
                <span>{faq.q}</span>
              </h4>
              <p className="text-xs text-[#b9cac9] leading-relaxed pl-6">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="py-20 px-4 sm:px-6 max-w-4xl mx-auto text-center">
        <div className="p-10 rounded-3xl bg-gradient-to-b from-[#00fbfb]/10 to-transparent border border-[#00fbfb]/30 space-y-6">
          <h3 className="text-3xl font-black font-display uppercase">
            {locale === "fr" ? "Choisissez la Meilleure Plateforme Créateur en 2026" : locale === "es" ? "Elige la Mejor Plataforma de Creadores en 2026" : "Upgrade to the Best Creator Platform in 2026"}
          </h3>
          <p className="text-xs text-[#b9cac9] max-w-md mx-auto leading-relaxed">
            {locale === "fr" ? "Rejoignez le programme des Créateurs Fondateurs. Verrouillez votre taux de 90 % et 1 An de Copilote IA offert dès aujourd'hui." : locale === "es" ? "Únete al programa de Creadoras Fundadoras. Reclama tu 90% de comisión y 1 Año de Copiloto IA gratis hoy mismo." : "Join the Founding Creator program. Claim your 90% payout rate and 1 Year of free AI Copilot tools today."}
          </p>
          <Link
            href="/become-creator#apply"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-[#00fbfb] text-black font-mono font-bold text-sm uppercase tracking-wider hover:shadow-[0_0_25px_rgba(0,251,251,0.5)] transition-all cursor-pointer shadow-lg"
          >
            <span>{locale === "fr" ? "Postuler comme Créateur Fondateur" : locale === "es" ? "Comenzar Registro de Creador" : "Apply as a Founding Creator"}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
