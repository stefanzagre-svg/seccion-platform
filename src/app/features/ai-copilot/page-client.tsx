"use client";

import React from "react";
import Link from "next/link";
import Script from "next/script";
import { useTranslation } from "@/context/LanguageContext";
import { BreadcrumbSchema } from "@/components/seo/JsonLd";

export default function AICopilotClientPage() {
  const { locale } = useTranslation();
  const isFr = locale === "fr";
  const isEs = locale === "es";

  const breadcrumbs = [
    { name: isFr ? "Accueil" : isEs ? "Inicio" : "Home", url: "https://seccion.ai" },
    { name: isFr ? "Fonctionnalités" : isEs ? "Funciones" : "Features", url: "https://seccion.ai/features/ai-copilot" },
    { name: "AI Copilot", url: "https://seccion.ai/features/ai-copilot" },
  ];

  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: isFr
      ? "Comment fonctionne l'AI Copilot 24/7 de SECCION pour les messages privés"
      : isEs
      ? "Cómo funciona el AI Copilot 24/7 de SECCION para DMs de creadores"
      : "How SECCION's 24/7 AI Copilot Works for Creator DMs",
    description: isFr
      ? "L'AI Copilot de SECCION dialogue avec vos fans en direct 24/7 avec votre voix, votre ton et votre style authentiques — entraîné strictement avec votre consentement explicite."
      : isEs
      ? "El AI Copilot de SECCION interactúa con tus fans en mensajes directos 24/7 usando tu voz exacta, tono y estilo, entrenado exclusivamente con tu consentimiento explícito."
      : "SECCION's AI Copilot engages your fans in direct messages 24/7 using your exact voice, tone, and style — trained exclusively with your explicit consent.",
    step: [
      {
        "@type": "HowToStep",
        name: isFr ? "Entraînez l'IA avec votre voix" : isEs ? "Entrena a la IA con tu voz" : "Train the AI on your voice",
        text: isFr
          ? "Importez votre historique de messages. L'IA apprend fidèlement votre vocabulaire, vos expressions signature et votre rythme de réponse — en toute sécurité et avec votre consentement."
          : isEs
          ? "Sube tu historial de mensajes. La IA aprende tu vocabulario, tono, emojis y patrones de respuesta, de forma segura y con tu pleno consentimiento."
          : "Upload or sync your historical messaging samples. The AI learns your vocabulary, tone, emoji usage, and response patterns — securely and with your full consent.",
      },
      {
        "@type": "HowToStep",
        name: isFr ? "Définissez vos règles d'engagement" : isEs ? "Establece tus reglas de interacción" : "Set your engagement rules",
        text: isFr
          ? "Indiquez les types de messages pris en charge par l'IA (FAQ, aperçus PPV, messages de bienvenue) et ceux qui vous sont transmis directement (connexions complices Niveau 4+, demandes sur mesure)."
          : isEs
          ? "Define qué mensajes gestiona la IA (preguntas frecuentes, adelantos PPV, saludos) y cuáles se te escalan directamente (conexiones de química Nivel 4+, pedidos personalizados)."
          : "Define which types of messages the AI handles (FAQs, PPV previews, greetings) and which escalate to you directly (Level 4+ chemistry connections, custom requests).",
      },
      {
        "@type": "HowToStep",
        name: isFr ? "Passez en direct 24/7" : isEs ? "Actívate 24/7 y genera ingresos" : "Go live 24/7",
        text: isFr
          ? "Votre AI Copilot dialogue avec vos fans sur tous les fuseaux horaires, partage des aperçus de contenus et génère des revenus d'abonnements pendant votre sommeil."
          : isEs
          ? "Tu AI Copilot interactúa con fans en todas las zonas horarias, compartiendo avances de contenido e impulsando ingresos por suscripción mientras duermes."
          : "Your AI Copilot starts engaging fans across all time zones — maintaining your authentic voice, sharing content previews, and driving subscription revenue while you sleep.",
      },
    ],
  };

  const agencyStats = [
    {
      stat: "40–50%",
      label: isFr
        ? "Part prélevée par l'agence sur vos revenus"
        : isEs
        ? "Comisión de agencia sobre tus ingresos"
        : "Agency cut of your revenue",
      color: "text-red-400",
      border: "border-red-500/20",
      bg: "bg-red-500/5",
    },
    {
      stat: isFr ? "24h" : isEs ? "24h" : "24hrs",
      label: isFr
        ? "Délai lorsque votre équipe est hors ligne"
        : isEs
        ? "Demora cuando tu equipo está desconectado"
        : "Delay when your team is offline",
      color: "text-orange-400",
      border: "border-orange-500/20",
      bg: "bg-orange-500/5",
    },
    {
      stat: isFr ? "Risque élevé" : isEs ? "Alto riesgo" : "High risk",
      label: isFr
        ? "Les rédacteurs brisent le personnage et fuient du contenu"
        : isEs
        ? "Chatters pierden el personaje y filtran contenido"
        : "Ghostwriters break character & leak content",
      color: "text-yellow-400",
      border: "border-yellow-500/20",
      bg: "bg-yellow-500/5",
    },
  ];

  const steps = [
    {
      step: "01",
      title: isFr
        ? "Entraînez l'IA avec votre voix"
        : isEs
        ? "Entrena a la IA con tu voz"
        : "Train the AI on your voice",
      body: isFr
        ? "Importez votre historique de messagerie. L'IA apprend votre vocabulaire, vos phrases signatures, vos emojis et votre tempo de réponse — traité de façon sécurisée et jamais partagé avec des tiers."
        : isEs
        ? "Sube tu historial de mensajes. La IA aprende tu vocabulario, frases distintivas, patrones de emojis y ritmo de respuesta: procesado de forma segura y nunca compartido con terceros."
        : "Upload your messaging history. The AI learns your vocabulary, signature phrases, emoji patterns, and response tempo — securely processed and never shared with third parties.",
      color: "text-[#00fbfb]",
      border: "border-[#00fbfb]/20",
    },
    {
      step: "02",
      title: isFr
        ? "Définissez vos règles d'engagement"
        : isEs
        ? "Define tus reglas de interacción"
        : "Set your engagement rules",
      body: isFr
        ? "Indiquez ce que l'IA gère de façon autonome (FAQ, aperçus PPV, messages de bienvenue) et ce qui vous est escaladé en direct (relations complices Niveau 4+, demandes sur mesure)."
        : isEs
        ? "Define qué gestiona la IA de manera autónoma (preguntas frecuentes, adelantos PPV, saludos a nuevos suscriptores) y qué se te escala directamente (conexiones de afinidad Nivel 4+, contenido a medida)."
        : "Define what the AI handles autonomously (FAQs, PPV previews, new subscriber greetings) and what gets escalated to you directly (high-chemistry Level 4+ connections, custom content requests).",
      color: "text-[#ffabf3]",
      border: "border-[#ffabf3]/20",
    },
    {
      step: "03",
      title: isFr
        ? "Passez en direct — gagnez 24/7"
        : isEs
        ? "Actívate — genera ingresos 24/7"
        : "Go live — earn 24/7",
      body: isFr
        ? "Votre Copilot échange avec vos fans sur tous les fuseaux horaires avec votre intonation authentique. Il favorise les déblocages PPV, les renouvellements et les pourboires pendant que vous créez du contenu et vivez votre vie."
        : isEs
        ? "Tu Copilot interactúa con tus fans en cada zona horaria con tu voz auténtica. Impulsa desbloqueos PPV, renovaciones de suscripción e ingresos por propinas mientras creas contenido, descansas y disfrutas tu vida."
        : "Your Copilot engages fans across every time zone in your authentic voice. It drives PPV unlocks, subscription renewals, and tip revenue while you create content, rest, and live your life.",
      color: "text-[#39FF14]",
      border: "border-[#39FF14]/20",
    },
  ];

  return (
    <>
      <Script
        id="howto-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
      />
      <BreadcrumbSchema items={breadcrumbs} />

      <main className="min-h-screen bg-background text-foreground">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
          {/* Hero */}
          <div className="mb-16 text-center">
            <span className="inline-block px-4 py-1.5 rounded-full border border-[#00fbfb]/30 bg-[#00fbfb]/5 text-[#00fbfb] text-xs font-mono font-bold uppercase tracking-widest mb-5">
              {isFr ? "Fonctionnalité — Opérations IA" : isEs ? "Función — Operaciones de IA" : "Feature — AI Operations"}
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight mb-5 leading-tight">
              {isFr ? "Votre AI Copilot 24/7" : isEs ? "Tu AI Copilot 24/7" : "Your 24/7 AI Copilot"}
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00fbfb] to-[#ffabf3]">
                {isFr ? "Avec Votre Voix Exacte" : isEs ? "Con Tu Voz Exacta" : "In Your Exact Voice"}
              </span>
            </h1>
            <p className="text-lg text-[#b9cac9] max-w-2xl mx-auto leading-relaxed mb-8">
              {isFr ? (
                <>
                  Cessez de céder <strong className="text-white">40 à 50 % de vos revenus</strong> à une agence de chatting pour ghostwriter vos DMs.
                  L&apos;AI Copilot autonome de SECCION dialogue avec vos fans jour et nuit avec votre voix authentique —{" "}
                  <strong className="text-[#00fbfb]">entraîné strictement avec votre consentement</strong>.
                </>
              ) : isEs ? (
                <>
                  Deja de pagar a una agencia de chatting el <strong className="text-white">40–50% de tus ingresos</strong> para responder tus DMs.
                  El AI Copilot independiente de SECCION interactúa con tus fans las 24 horas con tu tono auténtico,{" "}
                  <strong className="text-[#00fbfb]">entrenado estrictamente con tu consentimiento</strong>.
                </>
              ) : (
                <>
                  Stop paying a chatting agency <strong className="text-white">40–50% of your revenue</strong> to ghostwrite your DMs.
                  SECCION&apos;s independent AI Copilot engages your fans around the clock in your authentic tone —{" "}
                  <strong className="text-[#00fbfb]">trained strictly with your permission</strong>.
                </>
              )}
            </p>
            <Link
              href="/become-creator"
              className="inline-flex items-center gap-2 px-10 py-4 rounded-2xl bg-gradient-to-r from-[#00fbfb] to-[#ffabf3] text-black font-mono text-sm font-black uppercase tracking-wider hover:shadow-[0_0_30px_rgba(0,251,251,0.5)] transition"
            >
              {isFr ? "Activer Votre AI Copilot" : isEs ? "Activar Tu AI Copilot" : "Activate Your AI Copilot"}
            </Link>
          </div>

          {/* The Agency Problem */}
          <section className="mb-16">
            <h2 className="text-2xl sm:text-3xl font-black text-white mb-6 text-center">
              {isFr
                ? "Le Problème des Agences de Chatting"
                : isEs
                ? "El Problema de las Agencias de Chatting"
                : "The Chatting Agency Problem"}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {agencyStats.map((item, i) => (
                <div key={i} className={`p-6 rounded-3xl border ${item.border} ${item.bg} text-center`}>
                  <div className={`text-3xl font-black ${item.color} mb-2`}>{item.stat}</div>
                  <p className="text-sm text-white/70">{item.label}</p>
                </div>
              ))}
            </div>
          </section>

          {/* How the AI Copilot Works */}
          <section className="mb-16">
            <h2 className="text-2xl sm:text-3xl font-black text-white mb-3 text-center">
              {isFr
                ? "Comment Fonctionne l'AI Copilot de SECCION"
                : isEs
                ? "Cómo Funciona el AI Copilot de SECCION"
                : "How SECCION's AI Copilot Works"}
            </h2>
            <p className="text-center text-[#b9cac9] text-sm mb-8 max-w-xl mx-auto">
              {isFr
                ? "Trois étapes simples pour vous affranchir des agences de chatting et conserver 90 % de vos gains."
                : isEs
                ? "Tres simples pasos para reemplazar tu agencia de chatting y quedarte con el 90% de tus ingresos."
                : "Three simple steps to replace your chatting agency and keep 90% of your earnings."}
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

          {/* Savings Calculator */}
          <section className="mb-16 p-8 rounded-3xl bg-gradient-to-br from-[#00fbfb]/10 via-transparent to-[#ffabf3]/10 border border-[#00fbfb]/20">
            <h2 className="text-2xl font-black text-white mb-6 text-center">
              {isFr ? "Ce Que Vous Conservez Réellement" : isEs ? "Lo Que Realmente Te Quedas" : "What You Actually Keep"}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 rounded-2xl bg-red-500/10 border border-red-500/20">
                <h3 className="font-mono text-red-400 font-bold uppercase text-xs mb-4">
                  {isFr ? "OnlyFans + Agence de Chatting" : isEs ? "OnlyFans + Agencia de Chatting" : "OnlyFans + Chatting Agency"}
                </h3>
                <ul className="text-sm space-y-2 text-white/80">
                  <li>
                    {isFr ? "Revenus Bruts Mensuels : " : isEs ? "Ingresos Brutos Mensuales: " : "Gross Monthly Revenue: "}
                    <strong>$10,000</strong>
                  </li>
                  <li className="text-red-400">
                    {isFr ? "Frais de Plateforme (20 %) : −$2,000" : isEs ? "Comisión de Plataforma (20%): −$2,000" : "Platform Fee (20%): −$2,000"}
                  </li>
                  <li className="text-red-400">
                    {isFr ? "Part Agence (45 %) : −$3,600" : isEs ? "Comisión de Agencia (45%): −$3,600" : "Agency Cut (45%): −$3,600"}
                  </li>
                  <li className="pt-3 border-t border-red-500/30 text-base font-black text-red-300">
                    {isFr ? "Vous Conservez : $4,400 (44 %)" : isEs ? "Te Quedas: $4,400 (44%)" : "You Keep: $4,400 (44%)"}
                  </li>
                </ul>
              </div>
              <div className="p-6 rounded-2xl bg-[#39FF14]/10 border border-[#39FF14]/20">
                <h3 className="font-mono text-[#39FF14] font-bold uppercase text-xs mb-4">
                  {isFr ? "SECCION Créateur Fondateur + AI Copilot" : isEs ? "SECCION Creador Fundador + AI Copilot" : "SECCION Founding Creator + AI Copilot"}
                </h3>
                <ul className="text-sm space-y-2 text-white/80">
                  <li>
                    {isFr ? "Revenus Bruts Mensuels : " : isEs ? "Ingresos Brutos Mensuales: " : "Gross Monthly Revenue: "}
                    <strong>$10,000</strong>
                  </li>
                  <li className="text-[#39FF14]">
                    {isFr ? "Frais de Plateforme (10 %) : −$1,000" : isEs ? "Comisión de Plataforma (10%): −$1,000" : "Platform Fee (10%): −$1,000"}
                  </li>
                  <li className="text-[#39FF14]">
                    {isFr ? "AI Copilot (Année 1) : $0 inclus" : isEs ? "AI Copilot (Año 1): $0 incluido" : "AI Copilot (Year 1): $0 included"}
                  </li>
                  <li className="pt-3 border-t border-[#39FF14]/30 text-base font-black text-[#39FF14]">
                    {isFr ? "Vous Conservez : $9,000 (90 %)" : isEs ? "Te Quedas: $9,000 (90%)" : "You Keep: $9,000 (90%)"}
                  </li>
                </ul>
              </div>
            </div>
            <p className="text-center text-xs font-mono text-[#00fbfb] mt-4">
              {isFr
                ? "Différence nette annuelle : +$54,720 de gains conservés par le créateur"
                : isEs
                ? "Diferencia neta anual: +$54,720 en ingresos retenidos para el creador"
                : "Net annual difference: +$54,720 in retained creator earnings"}
            </p>
          </section>

          {/* CTA */}
          <div className="text-center">
            <h2 className="text-2xl font-black text-white mb-3">
              {isFr
                ? "Prête à vous libérer de votre agence de chatting ?"
                : isEs
                ? "¿Lista para despedir a tu agencia de chatting?"
                : "Ready to fire your chatting agency?"}
            </h2>
            <p className="text-sm text-[#b9cac9] mb-6">
              {isFr
                ? "Rejoignez la promotion des Créateurs Fondateurs et activez votre AI Copilot dès le premier jour."
                : isEs
                ? "Postula a la cohorte de Creadores Fundadores y activa tu AI Copilot desde el Día 1."
                : "Apply for the Founding Creator cohort and activate your AI Copilot on Day 1."}
            </p>
            <Link
              href="/become-creator"
              className="inline-flex items-center gap-2 px-10 py-4 rounded-2xl bg-gradient-to-r from-[#00fbfb] to-[#ffabf3] text-black font-mono text-sm font-black uppercase tracking-wider hover:shadow-[0_0_30px_rgba(0,251,251,0.5)] transition"
            >
              {isFr ? "Devenir Créateur Fondateur →" : isEs ? "Convertirse en Creador Fundador →" : "Become a Founding Creator →"}
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
