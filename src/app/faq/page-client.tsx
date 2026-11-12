"use client";

import React from "react";
import Link from "next/link";
import { useTranslation } from "@/context/LanguageContext";
import { FAQSchema, BreadcrumbSchema } from "@/components/seo/JsonLd";

interface FAQItem {
  question: string;
  answer: string;
}

export default function FAQClientPage() {
  const { locale } = useTranslation();
  const isFr = locale === "fr";
  const isEs = locale === "es";

  const faqs: FAQItem[] = isFr
    ? [
        {
          question: "Qu'est-ce que SECCION ?",
          answer:
            "SECCION (prononcé 'Session') est une plateforme de monétisation pour créateurs propulsée par l'IA qui associe un matchmaking basé sur la complicité à une économie créateur complète. Elle offre un versement direct garanti de 90 % pour les Créateurs Fondateurs, un AI Copilot 24/7 qui échange avec les fans avec votre voix exacte, et un coffre-fort DRM inviolable prévenant le piratage et les fuites.",
        },
        {
          question: "Quel pourcentage de revenus SECCION verse-t-il aux créateurs ?",
          answer:
            "Les Créateurs Fondateurs (les 500 premiers créateurs approuvés dans le monde) bénéficient d'un partage net garanti de 90 %. Après l'allocation fondatrice, le socle permanent de SECCION reste à 80 %, bien au-dessus des standards de l'industrie. Zéro frais caché, zéro commission d'agence et zéro déduction intermédiaire.",
        },
        {
          question: "Comment fonctionne l'AI Copilot 24/7 de SECCION ?",
          answer:
            "L'AI Copilot autonome de SECCION dialogue avec vos fans par message direct (DM) 24h/24 et 7j/7 en adoptant fidèlement votre intonation, votre vocabulaire et votre style. Il est entraîné uniquement avec votre consentement explicite : vous gardez le contrôle total en permanence. L'AI Copilot remplace avantageusement les agences de chatting qui prélèvent d'ordinaire 40 à 50 % de vos gains, vous faisant économiser plus de 4 000 €/mois en frais d'intermédiaires.",
        },
        {
          question: "Comment SECCION protège-t-il les contenus contre le piratage ?",
          answer:
            "SECCION intègre un Content Vault sous DRM (gestion des droits numériques) apposant un filigrane cryptographique invisible sur chaque média. Un robot d'indexation IA autonome scrute en continu le web, les forums et les sites pirates pour repérer toute fuite et soumettre automatiquement des requêtes DMCA et DSA, sans aucune démarche manuelle. La technologie Zero-Knowledge Face Blur floute également les visages sur le feed public pour préserver votre vie privée.",
        },
        {
          question: "Qu'est-ce que le Warm Paywall ?",
          answer:
            "Le Warm Paywall est au cœur de l'approche SECCION : les transactions et l'accès aux contenus exclusifs ne se déverrouillent qu'une fois qu'une complicité et une confiance réelles sont établies entre le créateur et le fan. La découverte, le matching et les premiers messages sont 100 % gratuits pour les membres. Cela élimine les contestations de paiement impulsives, réduit le churn de plus de 30 % et multiplie par 3,4 la valeur à vie des fans par rapport aux paywalls froids traditionnels.",
        },
        {
          question: "SECCION est-il une vraie alternative à OnlyFans ?",
          answer:
            "Absolument. SECCION assure une rémunération supérieure (90 % contre 80 % sur OnlyFans), un AI Copilot 24/7 sans frais éliminant les agences de chatting, une protection DRM automatisée contre le piratage et un moteur de découverte basé sur les affinités qui fidélise durablement vos fans. OnlyFans n'intègre aucun outil IA natif, aucune protection DRM et aucune découverte organique : les créateurs doivent générer tout leur trafic par eux-mêmes.",
        },
        {
          question: "SECCION est-il une alternative pertinente à Patreon ?",
          answer:
            "Oui. Patreon prélève de 8 à 12 % de commission auxquels s'ajoutent les frais de traitement (revenu réel créateur : 75–82 %). L'offre Créateur Fondateur de SECCION vous garantit 90 % net. Contrairement à Patreon, SECCION intègre en natif un AI Copilot 24/7, une protection DRM, le live streaming et la découverte par complicité, sans outil tiers.",
        },
        {
          question: "Comment SECCION vérifie-t-il l'âge et l'identité des créateurs ?",
          answer:
            "SECCION utilise la passerelle d'identité Zero-Knowledge DIDIT (verify.didit.me) couvrant plus de 220 pays, associée à Sightengine AI pour la détection biométrique 3D et la vérification d'âge. Le contrôle s'effectue de manière éphémère sans stockage de pièces d'identité, en totale conformité avec le RGPD et le 18 U.S.C. § 2257.",
        },
        {
          question: "Qu'est-ce que le Chemistry Meter à 8 Niveaux ?",
          answer:
            "Le Système de Niveaux de Relation (RLS v2.0) est un barème de complicité en 8 étapes gradué du Niveau 1 (Indéfini) au Niveau 8 (Âme Sœur). À mesure que l'affinité grandit au fil des échanges réels, de nouveaux privilèges se débloquent : mémos vocaux, appels vidéo, révélation du visage (Face Blur), galeries privées et abonnements créateur. Il supprime toute ambiguïté et valorise chaque étape de la relation.",
        },
        {
          question: "Comment devenir Créateur Fondateur sur SECCION ?",
          answer:
            "Candidatez via le Portail Créateurs SECCION sur seccion.ai/become-creator. La promotion Fondatrice est strictement réservée aux 500 premiers créateurs validés dans le monde. Les créateurs retenus bénéficient d'une garantie à vie de 90 % net ainsi que d'un an d'assistance AI Copilot offerte. Les dossiers sont examinés par l'équipe SECCION et validés sous 48 à 72 heures.",
        },
        {
          question: "Quels modes de paiement SECCION propose-t-il pour les reversements créateurs ?",
          answer:
            "SECCION prend en charge de multiples canaux de paiement : virements instantanés SEPA dans toute l'Union Européenne, virements ACH et bancaires aux États-Unis, solutions bancaires locales en Amérique latine (Colombie, Mexique, Argentine) et règlements crypto directs via NOWPayments (USDT TRC20/Polygon, USDC, BTC, ETH) pour une liquidité immédiate sans pénalités de change.",
        },
      ]
    : isEs
    ? [
        {
          question: "¿Qué es SECCION?",
          answer:
            "SECCION (pronunciado 'Session') es una plataforma de monetización para creadores impulsada por IA que combina matchmaking basado en química con una economía de creadores completa. Ofrece un pago directo del 90% para Creadores Fundadores, un AI Copilot 24/7 que interactúa con los fans en la voz exacta del creador, y un Content Vault DRM irrompible que previene la piratería y filtraciones.",
        },
        {
          question: "¿Qué porcentaje de ingresos paga SECCION a los creadores?",
          answer:
            "Los Creadores Fundadores (los primeros 500 creadores aprobados a nivel global) reciben una división neta garantizada del 90%. Tras la cohorte fundadora, la base permanente de SECCION se mantiene en el 80%, muy por encima del promedio de la industria. Cero comisiones ocultas, cero comisiones de agencia y cero deducciones intermediarias.",
        },
        {
          question: "¿Cómo funciona el AI Copilot 24/7 de SECCION?",
          answer:
            "El AI Copilot independiente de SECCION interactúa con tus fans en mensajes directos (DM) 24/7 usando tu tono exacto, vocabulario y estilo de comunicación. Se entrena estrictamente con tu permiso explícito y consentimiento: mantienes el control total en todo momento. El AI Copilot reemplaza a las costosas agencias de chatting que suelen retener el 40–50% de tus ingresos, ahorrando a los creadores más de 4.000 €/mes en tarifas de intermediarios.",
        },
        {
          question: "¿Cómo protege SECCION el contenido de los creadores contra la piratería?",
          answer:
            "SECCION utiliza un Content Vault con DRM (Gestión de Derechos Digitales) con marcas de agua criptográficas en cada archivo multimedia. Un rastreador web autónomo con IA escanea continuamente índices web, foros y sitios de piratería en busca de contenido filtrado y emite automáticamente avisos de eliminación DMCA, sin ningún esfuerzo manual. La tecnología de desenfoque facial Zero-Knowledge (ZKP Face Blur) también previene la identificación facial no autorizada en los feeds públicos.",
        },
        {
          question: "¿Qué es el Warm Paywall?",
          answer:
            "El Warm Paywall es la filosofía central de SECCION: las transacciones financieras y el acceso a contenido exclusivo solo se desbloquean una vez que se ha establecido una afinidad y confianza genuinas entre el creador y el fan. El descubrimiento básico, el matching y los mensajes iniciales son 100% gratuitos para los miembros. Esto elimina contracargos impulsivos, reduce la cancelación de suscripciones en más del 30% y multiplica por 3,4 el valor de vida del fan en comparación con las plataformas de paywall frío.",
        },
        {
          question: "¿Es SECCION una buena alternativa a OnlyFans?",
          answer:
            "Sí. SECCION ofrece un pago superior (90% frente al 80% de OnlyFans), un AI Copilot 24/7 gratuito que reemplaza la necesidad de agencias de chatting costosas, protección antipiratería DRM automatizada integrada y un sistema de descubrimiento basado en química que crea lealtad real entre los fans. OnlyFans no tiene herramientas nativas de IA, carece de protección DRM y no ofrece descubrimiento orgánico: los creadores deben atraer todo su tráfico externamente.",
        },
        {
          question: "¿Es SECCION una buena alternativa a Patreon?",
          answer:
            "Sí. Patreon cobra entre un 8% y un 12% en comisiones de plataforma más tarifas de procesamiento (margen efectivo del creador: 75–82%). La oferta para Creadores Fundadores de SECCION garantiza un 90% neto. A diferencia de Patreon, SECCION incluye además un AI Copilot de operaciones 24/7, bóveda antipiratería DRM, transmisiones en vivo y descubrimiento de fans por afinidad, todo en una sola plataforma.",
        },
        {
          question: "¿Cómo verifica SECCION la edad e identidad de los creadores?",
          answer:
            "SECCION utiliza la pasarela de identidad Zero-Knowledge de DIDIT (verify.didit.me) para la verificación en más de 220 países, combinada con la IA de Sightengine para biometría facial 3D y estimación de edad. La verificación se procesa de forma efímera sin almacenar documentos de identidad, en estricto cumplimiento con la minimización de datos del RGPD y el 18 U.S.C. § 2257.",
        },
        {
          question: "¿Qué es el Chemistry Meter de 8 Niveles?",
          answer:
            "El Sistema de Niveles de Relación (RLS v2.0) es el medidor de conexión en 8 etapas de SECCION, que abarca desde el Nivel 1 (Indefinido) hasta el Nivel 8 (Alma Gemela). A medida que la afinidad mutua se fortalece mediante interacciones reales, se desbloquean nuevos privilegios: notas de voz, videollamadas, revelación de rostro (Face Blur), acceso a galerías privadas y suscripciones de creador. Elimina la ambigüedad en las relaciones y hace que cada progreso sea transparente y significativo.",
        },
        {
          question: "¿Cómo me convierto en Creador Fundador en SECCION?",
          answer:
            "Postula a través del Portal de Creadores de SECCION en seccion.ai/become-creator. La cohorte de Creadores Fundadores está estrictamente limitada a los primeros 500 creadores aprobados en todo el mundo. Los creadores aprobados reciben una garantía de por vida del 90% neto más 1 año de asistencia operativa gratuita con el AI Copilot. La postulación es revisada por el equipo de SECCION y suele confirmarse en un plazo de 48 a 72 horas.",
        },
        {
          question: "¿Qué métodos de pago admite SECCION para los pagos a creadores?",
          answer:
            "SECCION admite múltiples vías de pago: transferencias bancarias SEPA Instant en toda la Unión Europea, transferencias bancarias y ACH en Estados Unidos, pasarelas bancarias locales en Latinoamérica (Colombia, México, Argentina) y liquidaciones directas en criptomonedas a través de NOWPayments (USDT TRC20/Polygon, USDC, BTC, ETH) para liquidez instantánea e inembargable sin penalizaciones por cambio de divisa.",
        },
      ]
    : [
        {
          question: "What is SECCION?",
          answer:
            "SECCION (pronounced 'Session') is an AI-powered creator monetization platform that combines chemistry-first matchmaking with a full creator economy. It offers a 90% direct payout for Founding Creators, a 24/7 AI Copilot that engages fans in the creator's exact voice, and an unbreakable DRM content vault that prevents piracy and leaks.",
        },
        {
          question: "What percentage of revenue does SECCION pay creators?",
          answer:
            "Founding Creators (the first 500 approved creators globally) receive a guaranteed 90% net revenue split. After the founding allocation, SECCION's permanent baseline remains 80% — significantly above industry averages. There are zero hidden fees, zero agency commissions, and zero intermediary deductions.",
        },
        {
          question: "How does SECCION's 24/7 AI Copilot work?",
          answer:
            "SECCION's independent AI Copilot engages with your fans in direct messages 24/7 using your exact tone, vocabulary, and messaging style. It is trained strictly with your explicit permission and consent — you remain in full control at all times. The AI Copilot replaces expensive chatting agencies that typically take 40–50% of creator revenue, saving creators over €4,000/month in agency fees.",
        },
        {
          question: "How does SECCION protect creator content from piracy?",
          answer:
            "SECCION uses a DRM (Digital Rights Management) content vault with cryptographic watermarking on every piece of media. An autonomous web sweeper continuously scans web indexes, forums, and piracy sites for leaked content and automatically files DMCA takedown notices — all without manual effort. Zero-Knowledge face blur technology also prevents unauthorized facial identification in public feeds.",
        },
        {
          question: "What is the Warm Paywall?",
          answer:
            "The Warm Paywall is SECCION's core philosophy: financial transactions and premium content access are only unlocked after genuine chemistry and trust have been established between a creator and a fan. Basic discovery, matching, and messaging are 100% free for members. This eliminates impulse chargebacks, reduces subscriber churn by over 30%, and increases creator customer lifetime value by 3.4x compared to cold paywall platforms.",
        },
        {
          question: "Is SECCION a good alternative to OnlyFans?",
          answer:
            "Yes. SECCION offers a higher payout (90% vs OnlyFans' 80%), a free 24/7 AI Copilot replacing the need for expensive chatting agencies, built-in automated DRM anti-piracy protection, and a chemistry-based discovery system that builds genuine fan loyalty. OnlyFans has no native AI tools, no DRM protection, and no organic discovery — creators must drive all traffic externally.",
        },
        {
          question: "Is SECCION a good alternative to Patreon?",
          answer:
            "Yes. Patreon charges 8–12% platform fees plus processing fees (effective creator cut: 75–82%). SECCION's Founding Creator offer guarantees 90% net retention. Unlike Patreon, SECCION also includes a 24/7 AI Operations Copilot, DRM anti-piracy vaulting, live streaming, and chemistry-gated fan discovery — all in one platform.",
        },
        {
          question: "How does SECCION verify creator age and identity?",
          answer:
            "SECCION uses the DIDIT Zero-Knowledge Identity Gateway (verify.didit.me) for creator verification across 220+ countries, combined with Sightengine AI for biometric 3D facial liveness and age estimation. Identity verification is processed ephemerally with zero document storage — fully compliant with GDPR data minimization and 18 U.S.C. § 2257.",
        },
        {
          question: "What is the 8-Level Chemistry Meter?",
          answer:
            "The Relationship Level System (RLS v2.0) is SECCION's 8-stage connection tracker ranging from Level 1 (Undefined) to Level 8 (Soulmate). As mutual affinity grows through real interaction, new privileges unlock: voice memos, video calls, face reveals, private gallery access, and creator subscriptions. It eliminates situationship ambiguity and makes every relationship progression transparent and meaningful.",
        },
        {
          question: "How do I become a Founding Creator on SECCION?",
          answer:
            "Apply through the SECCION Creator Portal at seccion.ai/become-creator. The Founding Creator cohort is strictly limited to the first 500 approved creators globally. Approved creators receive a 90% lifetime net revenue guarantee plus 1 year of free AI Copilot operations assistance. Approval is reviewed by the SECCION team and typically confirmed within 48–72 hours.",
        },
        {
          question: "What payment methods does SECCION support for creator payouts?",
          answer:
            "SECCION supports multiple payout rails: SEPA Instant bank transfers across the EU, US Domestic ACH and wire transfers, Latin American localized banking gateways (Colombia, Mexico, Argentina), and direct cryptocurrency settlements via NOWPayments (USDT TRC20/Polygon, USDC, BTC, ETH) for instant, unfreezable liquidity with zero FX spread penalties.",
        },
      ];

  const breadcrumbs = [
    { name: isFr ? "Accueil" : isEs ? "Inicio" : "Home", url: "https://seccion.ai" },
    { name: isFr ? "FAQ" : isEs ? "Preguntas Frecuentes" : "FAQ", url: "https://seccion.ai/faq" },
  ];

  return (
    <>
      <FAQSchema faqs={faqs} />
      <BreadcrumbSchema items={breadcrumbs} />

      <main className="min-h-screen bg-background text-foreground">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
          {/* Hero */}
          <div className="mb-14 text-center">
            <span className="inline-block px-4 py-1.5 rounded-full border border-primary/30 bg-primary/5 text-primary text-xs font-mono font-bold uppercase tracking-widest mb-5">
              {isFr ? "Guide de la Plateforme" : isEs ? "Guía de la Plataforma" : "Platform Guide"}
            </span>
            <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight mb-4">
              {isFr
                ? "Questions Fréquemment Posées"
                : isEs
                ? "Preguntas Frecuentes"
                : "Frequently Asked Questions"}
            </h1>
            <p className="text-lg text-[#b9cac9] max-w-2xl mx-auto leading-relaxed">
              {isFr ? (
                <>
                  Tout ce que vous devez savoir sur SECCION — la plateforme créateur IA avec{" "}
                  <span className="text-primary font-semibold">90 % de reversement</span>,{" "}
                  <span className="text-[#ffabf3] font-semibold">AI Copilot DMs 24/7</span> et{" "}
                  <span className="text-[#39FF14] font-semibold">protection DRM anti-piratage</span>.
                </>
              ) : isEs ? (
                <>
                  Todo lo que necesitas saber sobre SECCION: la plataforma para creadores con IA con{" "}
                  <span className="text-primary font-semibold">90% de pagos directos</span>,{" "}
                  <span className="text-[#ffabf3] font-semibold">AI Copilot en DMs 24/7</span> y{" "}
                  <span className="text-[#39FF14] font-semibold">protección DRM contra piratería</span>.
                </>
              ) : (
                <>
                  Everything you need to know about SECCION — the AI-powered creator platform with{" "}
                  <span className="text-primary font-semibold">90% payouts</span>,{" "}
                  <span className="text-[#ffabf3] font-semibold">24/7 AI Copilot DMs</span>, and{" "}
                  <span className="text-[#39FF14] font-semibold">DRM anti-piracy protection</span>.
                </>
              )}
            </p>
          </div>

          {/* FAQ Accordion */}
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <details
                key={i}
                className="group p-6 rounded-3xl bg-white/[0.03] border border-white/10 hover:border-white/20 transition-all duration-200 cursor-pointer open:border-primary/30 open:bg-primary/[0.03]"
              >
                <summary className="flex items-start justify-between gap-4 list-none">
                  <h2 className="text-sm sm:text-base font-bold text-white group-open:text-primary transition-colors pr-4">
                    {faq.question}
                  </h2>
                  <span className="text-white/40 group-open:text-primary text-lg font-light shrink-0 mt-0.5 transition-colors select-none">
                    <span className="group-open:hidden">+</span>
                    <span className="hidden group-open:block">−</span>
                  </span>
                </summary>
                <p className="mt-4 text-sm text-[#b9cac9] leading-relaxed">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-16 p-8 rounded-3xl bg-gradient-to-br from-primary/10 via-transparent to-[#ffabf3]/10 border border-primary/20 text-center">
            <h3 className="text-xl font-black text-white mb-2">
              {isFr
                ? "Vous avez encore des questions ?"
                : isEs
                ? "¿Aún tienes preguntas?"
                : "Still have questions?"}
            </h3>
            <p className="text-sm text-[#b9cac9] mb-6">
              {isFr
                ? "Notre équipe est disponible par e-mail, WhatsApp et Telegram pour accompagner les créateurs du monde entier."
                : isEs
                ? "Nuestro equipo está disponible por correo, WhatsApp y Telegram para apoyar a creadores de todo el mundo."
                : "Our team is available via email, WhatsApp, and Telegram to support creators worldwide."}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/become-creator"
                className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-[#00fbfb] to-[#ffabf3] text-black font-mono text-xs font-black uppercase tracking-wider hover:shadow-[0_0_20px_rgba(0,251,251,0.4)] transition"
              >
                {isFr
                  ? "Devenir Créateur Fondateur"
                  : isEs
                  ? "Convertirse en Creador Fundador"
                  : "Become a Founding Creator"}
              </Link>
              <Link
                href="/hit-us-up"
                className="px-8 py-3.5 rounded-2xl bg-white/5 border border-white/15 text-white font-mono text-xs font-bold uppercase tracking-wider hover:bg-white/10 transition"
              >
                {isFr ? "Nous Contacter" : isEs ? "Contáctanos" : "Contact Us"}
              </Link>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
