"use client";

import React from "react";
import Link from "next/link";
import PublicNavbar from "@/components/PublicNavbar";
import PublicFooter from "@/components/PublicFooter";
import { WaitlistSignup } from "@/components/WaitlistSignup";
import AgeGateSplash from "@/components/onboarding/AgeGateSplash";
import { useTranslation } from "@/context/LanguageContext";

export default function EarlyAccessPage() {
  const { locale } = useTranslation();
  const isFr = locale === "fr";
  const isEs = locale === "es";

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center p-4 relative overflow-hidden font-sans">
      <AgeGateSplash />
      <PublicNavbar />

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

      {/* Decorative gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#ffabf3]/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#00fbfb]/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-3xl relative z-10 pt-36 md:pt-40 pb-16 flex-grow flex flex-col justify-center space-y-10">
        {/* Early Access form */}
        <WaitlistSignup variant="card" />

        {/* Founding Member & Creator Access Highlights */}
        <section className="grid sm:grid-cols-3 gap-4 text-left" aria-label="Early Access Highlights">
          <div className="rounded-3xl bg-white/[0.03] border border-white/10 p-5 space-y-2">
            <h2 className="text-xs font-mono font-black uppercase tracking-wider text-[#00fbfb]">
              {isFr ? "Découverte Humaine" : isEs ? "Conexión Real" : "Real Human Discovery"}
            </h2>
            <p className="text-xs text-[#b9cac9] leading-relaxed">
              {isFr
                ? "Notre assistant IA met en relation de vraies personnes vérifiées autour d'intérêts communs : éducation, style de vie, romance, économie ou business."
                : isEs
                ? "Nuestro asistente de IA conecta a personas reales verificadas por intereses reales: educación, estilo de vida, romance, economía o negocios."
                : "Discover verified people that match your life spheres across Education, Lifestyle, Romance, Economy, and Business—never synthetic bots."}
            </p>
          </div>
          <div className="rounded-3xl bg-white/[0.03] border border-white/10 p-5 space-y-2">
            <h2 className="text-xs font-mono font-black uppercase tracking-wider text-[#ffabf3]">
              {isFr ? "90 % Fondateurs" : isEs ? "90% Fundadores" : "90% Founding Split"}
            </h2>
            <p className="text-xs text-[#b9cac9] leading-relaxed">
              {isFr
                ? "Les créateurs approuvés en pré-lancement conservent 90 % des revenus nets avec un AI Copilot vocal gratuit la 1re année et un coffre DRM anti-fuite."
                : isEs
                ? "Los creadores aprobados en prelanzamiento conservan el 90% de ingresos netos, AI Copilot con su voz gratis el primer año y bóveda DRM."
                : "Approved pre-launch creators lock in a 90% net payout split, a free Year-1 voice-trained AI Copilot, and cryptographic DRM anti-leak protection."}
            </p>
          </div>
          <div className="rounded-3xl bg-white/[0.03] border border-white/10 p-5 space-y-2">
            <h2 className="text-xs font-mono font-black uppercase tracking-wider text-[#39FF14]">
              {isFr ? "Warm Paywall Équitable" : isEs ? "Warm Paywall Justo" : "Chemistry-First Access"}
            </h2>
            <p className="text-xs text-[#b9cac9] leading-relaxed">
              {isFr
                ? "Fini les murs payants à l'aveugle : discutez, évaluez la synergie et débloquez les salles VIP en direct quand la connexion est réelle."
                : isEs
                ? "Sin muros de pago a ciegas: conversa, valida la sinergia y desbloquea salas VIP o contenido exclusivo cuando exista química real."
                : "Skip blind cold paywalls. Build real rapport first, preview live rooms, and unlock VIP creator tiers once genuine synergy is established."}
            </p>
          </div>
        </section>

        <div className="text-center text-xs text-white/50">
          <Link href="/become-creator" className="text-[#00fbfb] hover:underline font-mono uppercase tracking-wider">
            {isFr ? "Postuler comme Créateur Fondateur →" : isEs ? "Aplicar como Creador Fundador →" : "Applying as a Founding Creator? Apply Here →"}
          </Link>
        </div>
      </div>

      <div className="w-full relative z-10">
        <PublicFooter />
      </div>
    </div>
  );
}

