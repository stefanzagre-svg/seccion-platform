"use client";

import React from "react";
import Link from "next/link";
import Script from "next/script";
import { useTranslation } from "@/context/LanguageContext";
import { BreadcrumbSchema } from "@/components/seo/JsonLd";

export default function DRMProtectionClientPage() {
  const { locale } = useTranslation();
  const isFr = locale === "fr";
  const isEs = locale === "es";

  const breadcrumbs = [
    { name: isFr ? "Accueil" : isEs ? "Inicio" : "Home", url: "https://seccion.ai" },
    { name: isFr ? "Fonctionnalités" : isEs ? "Funciones" : "Features", url: "https://seccion.ai/features/drm-protection" },
    { name: "DRM Content Vault", url: "https://seccion.ai/features/drm-protection" },
  ];

  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: isFr
      ? "Comment le DRM Content Vault de SECCION protège les contenus créateurs"
      : isEs
      ? "Cómo protege el Content Vault DRM de SECCION el contenido de los creadores"
      : "How SECCION's DRM Content Vault Protects Creator Content",
    description: isFr
      ? "SECCION applique automatiquement un filigrane, surveille le web et retire les contenus volés grâce au chiffrement DRM, au floutage Zero-Knowledge et aux requêtes DMCA/DSA autonomes."
      : isEs
      ? "SECCION marca con agua, monitorea y elimina automáticamente contenido robado de internet utilizando cifrado DRM, desenfoque facial Zero-Knowledge y solicitudes DMCA autónomas."
      : "SECCION automatically watermarks, monitors, and removes stolen creator content from the internet using DRM encryption, Zero-Knowledge face blur, and autonomous DMCA web sweeping.",
    step: [
      {
        "@type": "HowToStep",
        name: isFr ? "Importation dans le DRM Vault" : isEs ? "Subida al Content Vault DRM" : "Upload to the DRM Vault",
        text: isFr
          ? "Chaque photo ou vidéo importée sur SECCION est automatiquement chiffrée avec un filigrane cryptographique invisible associé à votre identité de créateur avant tout accès fan."
          : isEs
          ? "Cada foto o video subido a SECCION se cifra automáticamente con una marca de agua criptográfica invisible vinculada a tu identidad de creador antes del acceso del fan."
          : "Every photo or video uploaded to SECCION is automatically encrypted with an invisible cryptographic watermark tied to your creator identity before any fan receives access.",
      },
      {
        "@type": "HowToStep",
        name: isFr ? "Surveillance IA 24/7 du web" : isEs ? "Monitoreo 24/7 con rastreador IA" : "AI Web Sweeper monitors 24/7",
        text: isFr
          ? "Le robot d'indexation IA autonome de SECCION scrute en continu les moteurs de recherche, réseaux sociaux, forums pirates et hébergeurs en traquant l'empreinte du filigrane."
          : isEs
          ? "El rastreador web autónomo con IA de SECCION escanea continuamente índices web, redes sociales, foros de piratería y sitios de alojamiento usando la huella digital de la marca de agua."
          : "SECCION's autonomous AI web sweeper continuously scans web indexes, social platforms, piracy sites, and forums for unauthorized copies of your content — using the embedded watermark fingerprint.",
      },
      {
        "@type": "HowToStep",
        name: isFr ? "Retraits DMCA & DSA automatisés" : isEs ? "Emisión automática de avisos DMCA" : "Automatic DMCA takedowns filed",
        text: isFr
          ? "Dès qu'une fuite est repérée, SECCION génère et transmet automatiquement une notification de retrait DMCA et DSA — sans frais de procédure ni tracas juridique."
          : isEs
          ? "Cuando se detecta una copia no autorizada, SECCION genera y envía automáticamente avisos de retiro DMCA y DSA, sin tarifas de abogados ni esfuerzo manual."
          : "When a leak or unauthorized copy is detected, SECCION automatically files a DMCA takedown notice and DSA (Digital Services Act) removal request — no manual filing fees, no legal expertise required.",
      },
    ],
  };

  const drmFaqs = isFr
    ? [
        {
          question: "Qu'est-ce que le DRM Content Vault de SECCION ?",
          answer:
            "Le DRM Content Vault de SECCION est un système anti-piratage intégré qui appose un filigrane cryptographique sur chaque média importé, surveille le web 24/7 et soumet automatiquement des demandes de retrait DMCA et DSA dès qu'une fuite est repérée — sans aucune démarche de votre part.",
        },
        {
          question: "Comment fonctionne le floutage Zero-Knowledge Face Blur ?",
          answer:
            "La technologie ZKP Face Blur de SECCION applique un chiffrement préservant l'anonymat sur vos traits du visage dans les aperçus publics du feed. Votre visage n'est révélé qu'aux fans ayant atteint le Niveau 4+ de complicité vérifiée — empêchant toute capture d'écran malveillante tout en préservant votre découverte.",
        },
        {
          question: "SECCION émet-il les demandes de retrait DMCA automatiquement ?",
          answer:
            "Oui. Dès que le robot IA détecte une correspondance de filigrane sur un site pirate, un forum ou un réseau social, il génère et expédie immédiatement une mise en demeure DMCA et DSA. Les créateurs reçoivent un journal d'activité détaillant chaque action entreprise en leur nom.",
        },
      ]
    : isEs
    ? [
        {
          question: "¿Qué es el Content Vault DRM de SECCION?",
          answer:
            "El Content Vault DRM de SECCION es un sistema integrado antipiratería que añade marcas de agua criptográficas a cada archivo que subes, vigila la web 24/7 y emite avisos de retiro DMCA automáticamente cuando detecta una filtración, sin esfuerzo manual de tu parte.",
        },
        {
          question: "¿Cómo funciona el Desenfoque Facial Zero-Knowledge (ZKP)?",
          answer:
            "La tecnología ZKP Face Blur aplica cifrado a tus rasgos faciales en las vistas previas públicas del feed. Tu rostro solo se revela a fans que han alcanzado un Nivel 4+ de Química verificado, previniendo capturas de pantalla no autorizadas mientras mantienes tu visibilidad pública.",
        },
        {
          question: "¿SECCION envía avisos DMCA de manera automática?",
          answer:
            "Sí. En cuanto el rastreador web con IA detecta una coincidencia con la marca de agua en un foro o sitio pirata, genera y envía de inmediato la notificación de retiro DMCA y DSA. Los creadores reciben un registro de cada acción ejecutada en su nombre.",
        },
      ]
    : [
        {
          question: "What is SECCION's DRM Content Vault?",
          answer:
            "SECCION's DRM Content Vault is a built-in anti-piracy system that cryptographically watermarks every piece of media you upload, monitors the web 24/7 for unauthorized copies, and automatically fires DMCA takedown notices when a leak is detected — all without manual effort.",
        },
        {
          question: "How does the Zero-Knowledge Face Blur work?",
          answer:
            "SECCION's ZKP Face Blur technology applies privacy-preserving encryption to your facial features in public feed previews. Your face is only revealed to fans who have reached a verified Level 4+ Chemistry connection — preventing unauthorized screenshot identification while your public presence remains visible.",
        },
        {
          question: "Does SECCION file DMCA takedowns automatically?",
          answer:
            "Yes. When the AI web sweeper detects a watermark match on a piracy site, forum, or social platform, it automatically generates and submits a DMCA notice. Creators receive a notification log of every takedown action filed on their behalf.",
        },
      ];

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: drmFaqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };

  const stats = [
    {
      stat: "73%",
      label: isFr
        ? "des créateurs de contenu adulte subissent une diffusion non autorisée dans les 6 mois"
        : isEs
        ? "de los creadores reportan distribución no autorizada en sus primeros 6 meses"
        : "of adult creators report unauthorized content distribution within 6 months of launch",
      color: "text-red-400",
      border: "border-red-500/20",
      bg: "bg-red-500/5",
    },
    {
      stat: "$0",
      label: isFr
        ? "de compensation reçue des plateformes pirates pour les contenus volés"
        : isEs
        ? "de compensación recibida de plataformas piratas por contenido robado"
        : "compensation received from piracy platforms for stolen creator content",
      color: "text-orange-400",
      border: "border-orange-500/20",
      bg: "bg-orange-500/5",
    },
    {
      stat: isFr ? "Semaines" : isEs ? "Semanas" : "Weeks",
      label: isFr
        ? "durée moyenne d'une procédure DMCA manuelle — délai où le contenu s'est déjà propagé"
        : isEs
        ? "promedio del proceso DMCA manual, tiempo en el que el contenido ya se viralizó"
        : "average manual DMCA process — by which time content has spread irreversibly",
      color: "text-yellow-400",
      border: "border-yellow-500/20",
      bg: "bg-yellow-500/5",
    },
  ];

  const steps = [
    {
      step: "01",
      title: isFr
        ? "Filigrane cryptographique à l'importation"
        : isEs
        ? "Marcas de agua criptográficas al subir"
        : "Cryptographic watermarking on upload",
      body: isFr
        ? "Chaque photo et vidéo intègre un filigrane numérique invisible rattaché à votre profil créateur et à l'identifiant du fan destinataire. Même en cas de capture d'écran ou d'enregistrement, le filigrane persiste et identifie la source de la fuite."
        : isEs
        ? "Cada foto y video recibe una marca de agua digital invisible vinculada a tu identidad de creador y al ID del fan autorizado. Incluso si ocurre una captura o ripeo, la marca de agua sobrevive e identifica el origen de la filtración."
        : "Every photo and video receives an invisible digital watermark bound to your creator identity and the authorized recipient fan ID. Even if a screengrab or rip occurs, the watermark survives and identifies the source of the leak.",
      color: "text-[#39FF14]",
      border: "border-[#39FF14]/20",
    },
    {
      step: "02",
      title: isFr
        ? "Robot d'indexation IA autonome 24/7"
        : isEs
        ? "Rastreador web autónomo con IA"
        : "Autonomous AI web sweeper",
      body: isFr
        ? "L'IA de SECCION explore en continu les moteurs de recherche, Reddit, Telegram, les forums pirates et les hébergeurs de fichiers. Dès qu'une empreinte numérique est détectée en ligne, le système enclenche immédiatement une procédure."
        : isEs
        ? "La IA de SECCION rastrea continuamente índices web, Reddit, canales de Telegram, foros de piratería y servidores de archivos. Cuando la huella de la marca de agua coincide en la red, el sistema activa una respuesta inmediata."
        : "SECCION's AI continuously crawls web indexes, Reddit, Telegram channels, piracy forums, and file-hosting platforms. When the watermark fingerprint is matched anywhere online, the system immediately triggers a response.",
      color: "text-[#00fbfb]",
      border: "border-[#00fbfb]/20",
    },
    {
      step: "03",
      title: isFr
        ? "Retraits DMCA & DSA automatisés"
        : isEs
        ? "Avisos automáticos de retiro DMCA y DSA"
        : "Automatic DMCA & DSA takedown filing",
      body: isFr
        ? "Quelques heures après la détection, SECCION génère et transmet une mise en demeure DMCA (USA) et DSA (UE) à l'hébergeur. Zéro frais juridique, zéro formalité manuelle : vous recevez un journal complet de chaque procédure effectuée."
        : isEs
        ? "En cuestión de horas tras la detección, SECCION genera y envía un aviso de retiro DMCA (EE.UU.) y DSA (UE) a la plataforma de alojamiento. Sin honorarios legales ni papeleo manual: recibes un registro de cada acción."
        : "Within hours of detection, SECCION auto-generates and submits a DMCA (US) and DSA (EU) takedown notice to the hosting platform. No legal expertise, no filing fees, no manual work — you receive a notification log of every action taken.",
      color: "text-[#ffabf3]",
      border: "border-[#ffabf3]/20",
    },
  ];

  const faceBlurPoints = isFr
    ? [
        "Visage révélé uniquement aux fans atteignant le Niveau 4+ de complicité vérifiée — confiance mutuelle éprouvée avant toute exposition",
        "Le floutage est calculé côté client via cryptographie locale — les serveurs SECCION ne conservent aucune donnée faciale non chiffrée",
        "Empêche l'identification par capture d'écran et l'aspiration par les outils de reconnaissance faciale",
      ]
    : isEs
    ? [
        "El rostro solo se revela a fans que alcanzan el Nivel 4+ de Química verificado: confianza mutua antes de la exposición de identidad",
        "El desenfoque se aplica en el dispositivo del cliente con criptografía local: los servidores de SECCION nunca almacenan rostros sin cifrar",
        "Previene la identificación por captura de pantalla y el rastreo de herramientas de reconocimiento facial",
      ]
    : [
        "Face revealed only to fans who reach verified Level 4+ Chemistry — mutual trust proven before identity exposure",
        "Blur is applied client-side using on-device cryptography — SECCION servers never store unencrypted face data",
        "Prevents unauthorized screenshot identification and facial recognition scraping",
      ];

  return (
    <>
      <Script
        id="howto-drm-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
      />
      <Script
        id="faq-drm-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <BreadcrumbSchema items={breadcrumbs} />

      <main className="min-h-screen bg-background text-foreground">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
          {/* Hero */}
          <div className="mb-16 text-center">
            <span className="inline-block px-4 py-1.5 rounded-full border border-[#39FF14]/30 bg-[#39FF14]/5 text-[#39FF14] text-xs font-mono font-bold uppercase tracking-widest mb-5">
              {isFr ? "Fonctionnalité — Sécurité des Contenus" : isEs ? "Función — Seguridad de Contenido" : "Feature — Content Security"}
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight mb-5 leading-tight">
              DRM Content Vault<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#39FF14] to-[#00fbfb]">
                {isFr ? "Votre Contenu Reste le Vôtre" : isEs ? "Tu Contenido Sigue Siendo Tuyo" : "Your Content Stays Yours"}
              </span>
            </h1>
            <p className="text-lg text-[#b9cac9] max-w-2xl mx-auto leading-relaxed mb-8">
              {isFr ? (
                <>
                  Chaque photo et vidéo que vous importez bénéficie d&apos;un{" "}
                  <strong className="text-white">filigrane cryptographique invisible</strong>.
                  Notre robot IA autonome scrute le web 24/7 et{" "}
                  <strong className="text-[#39FF14]">émet automatiquement des requêtes DMCA</strong>{" "}
                  dès qu&apos;un contenu est partagé sans votre accord.
                </>
              ) : isEs ? (
                <>
                  Cada foto y video que subes está protegido con{" "}
                  <strong className="text-white">marcas de agua criptográficas</strong>.
                  Nuestro rastreador autónomo con IA monitorea la red 24/7 y{" "}
                  <strong className="text-[#39FF14]">envía avisos DMCA de inmediato</strong>{" "}
                  en el momento en que tu contenido aparece sin autorización.
                </>
              ) : (
                <>
                  Every photo and video you upload is{" "}
                  <strong className="text-white">cryptographically watermarked</strong>.
                  Our autonomous AI web sweeper monitors the internet 24/7 and{" "}
                  <strong className="text-[#39FF14]">auto-files DMCA takedowns</strong>{" "}
                  the moment your content appears without authorization.
                </>
              )}
            </p>
            <Link
              href="/become-creator"
              className="inline-flex items-center gap-2 px-10 py-4 rounded-2xl bg-gradient-to-r from-[#39FF14] to-[#00fbfb] text-black font-mono text-sm font-black uppercase tracking-wider hover:shadow-[0_0_30px_rgba(57,255,20,0.4)] transition"
            >
              {isFr ? "Protéger Vos Contenus" : isEs ? "Protege Tu Contenido Ahora" : "Protect Your Content Now"}
            </Link>
          </div>

          {/* The Leak Problem */}
          <section className="mb-16">
            <h2 className="text-2xl sm:text-3xl font-black text-white mb-6 text-center">
              {isFr
                ? "La Crise des Fuites de Contenu Créateur"
                : isEs
                ? "La Crisis de Filtraciones de Contenido"
                : "The Creator Content Leak Crisis"}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {stats.map((item, i) => (
                <div key={i} className={`p-6 rounded-3xl border ${item.border} ${item.bg} text-center`}>
                  <div className={`text-3xl font-black ${item.color} mb-2`}>{item.stat}</div>
                  <p className="text-sm text-white/70">{item.label}</p>
                </div>
              ))}
            </div>
          </section>

          {/* How DRM Vault Works */}
          <section className="mb-16">
            <h2 className="text-2xl sm:text-3xl font-black text-white mb-3 text-center">
              {isFr
                ? "Comment Fonctionne le DRM Content Vault"
                : isEs
                ? "Cómo Funciona el Content Vault DRM"
                : "How the DRM Content Vault Works"}
            </h2>
            <p className="text-center text-[#b9cac9] text-sm mb-8 max-w-xl mx-auto">
              {isFr
                ? "Trois niveaux automatisés de protection des contenus — aucune action manuelle requise."
                : isEs
                ? "Tres niveles automatizados de protección de contenido: sin esfuerzo manual requerido."
                : "Three automated layers of content protection — no manual action required from you."}
            </p>
            <div className="space-y-4">
              {steps.map((item, i) => (
                <div key={i} className={`p-6 sm:p-8 rounded-3xl bg-white/[0.02] border ${item.border} flex gap-6 items-start`}>
                  <span className={`text-3xl font-black font-mono ${item.color} shrink-0 leading-none`}>{item.step}</span>
                  <div>
                    <h3 className="text-base font-bold text-white mb-1.5">{item.title}</h3>
                    <p className="text-sm text-[#b9cac9] leading-relaxed">{item.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Zero-Knowledge Face Blur */}
          <section className="mb-16 p-8 rounded-3xl bg-gradient-to-br from-[#39FF14]/10 via-transparent to-[#00fbfb]/10 border border-[#39FF14]/20">
            <h2 className="text-xl sm:text-2xl font-black text-white mb-3">
              {isFr
                ? "Zero-Knowledge Face Blur — Confidentialité Sans Perdre la Visibilité"
                : isEs
                ? "Desenfoque Facial Zero-Knowledge — Privacidad Sin Perder Descubrimiento"
                : "Zero-Knowledge Face Blur — Privacy Without Losing Discovery"}
            </h2>
            <p className="text-sm text-[#b9cac9] leading-relaxed mb-4">
              {isFr
                ? "Le système ZKP Face Blur de SECCION applique un chiffrement préservant votre identité sur vos traits dans les aperçus publics du feed. Votre profil est visible dans la découverte sans livrer votre visage aux regards indiscrets ni aux bots d'aspiration."
                : isEs
                ? "El Face Blur ZKP (Zero-Knowledge) de SECCION aplica cifrado a tus rasgos faciales en las vistas previas del feed público. Tu perfil aparece en el descubrimiento sin exponer tu identidad a espectadores anónimos ni bots de capturas."
                : "SECCION's ZKP (Zero-Knowledge Proof) Face Blur applies privacy-preserving encryption to your facial features in public feed previews. Your profile appears in discovery without exposing your identity to anonymous scrollers or screenshot bots."}
            </p>
            <ul className="space-y-2 text-sm text-[#b9cac9]">
              {faceBlurPoints.map((point, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-[#39FF14] mt-0.5 shrink-0">✓</span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* DRM FAQ */}
          <section className="mb-16">
            <h2 className="text-xl font-black text-white mb-6">
              {isFr
                ? "Protection DRM — Questions Fréquentes"
                : isEs
                ? "Protección DRM — Preguntas Frecuentes"
                : "DRM Protection — Common Questions"}
            </h2>
            <div className="space-y-4">
              {drmFaqs.map((faq, i) => (
                <details
                  key={i}
                  className="group p-6 rounded-3xl bg-white/[0.02] border border-white/10 hover:border-white/20 transition-all duration-200 cursor-pointer open:border-[#39FF14]/30"
                >
                  <summary className="flex items-start justify-between gap-4 list-none">
                    <h3 className="text-sm font-bold text-white group-open:text-[#39FF14] transition-colors pr-4">
                      {faq.question}
                    </h3>
                    <span className="text-white/40 group-open:text-[#39FF14] text-lg font-light shrink-0 transition-colors select-none">
                      <span className="group-open:hidden">+</span>
                      <span className="hidden group-open:block">−</span>
                    </span>
                  </summary>
                  <p className="mt-4 text-sm text-[#b9cac9] leading-relaxed">{faq.answer}</p>
                </details>
              ))}
            </div>
          </section>

          {/* CTA */}
          <div className="text-center">
            <h2 className="text-2xl font-black text-white mb-3">
              {isFr
                ? "Vos contenus méritent une protection de niveau militaire."
                : isEs
                ? "Tu contenido merece protección de grado militar."
                : "Your content deserves military-grade protection."}
            </h2>
            <p className="text-sm text-[#b9cac9] mb-6">
              {isFr
                ? "Activez le DRM Vault et le robot d'indexation IA dès le premier jour en devenant Créateur Fondateur."
                : isEs
                ? "Activa el Content Vault DRM y el rastreador web con IA desde el Día 1 como Creador Fundador."
                : "Activate the DRM Vault and AI web sweeper from Day 1 as a Founding Creator."}
            </p>
            <Link
              href="/become-creator"
              className="inline-flex items-center gap-2 px-10 py-4 rounded-2xl bg-gradient-to-r from-[#39FF14] to-[#00fbfb] text-black font-mono text-sm font-black uppercase tracking-wider hover:shadow-[0_0_30px_rgba(57,255,20,0.4)] transition"
            >
              {isFr ? "Devenir Créateur Fondateur →" : isEs ? "Convertirse en Creador Fundador →" : "Become a Founding Creator →"}
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
