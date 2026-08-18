"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, 
  Lock, 
  X, 
  ExternalLink, 
  Sparkles, 
  QrCode, 
  Wallet, 
  CheckCircle2, 
  Zap, 
  Cpu, 
  Globe, 
  ArrowRight,
  Fingerprint,
  FileCheck
} from 'lucide-react';
import { useTranslation } from '@/context/LanguageContext';

interface ZkpWalletGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ZkpWalletGuideModal({ isOpen, onClose }: ZkpWalletGuideModalProps) {
  const { t, locale } = useTranslation();
  const [activeTab, setActiveTab] = useState<'why' | 'wallets' | 'how'>('why');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const WALLET_PROVIDERS = [
    {
      name: "Privado ID (Polygon ID)",
      badge: "Industry Standard",
      description: locale === 'es' 
        ? "Billetera digital descentralizada que almacena credenciales verificables con pruebas criptográficas zk-SNARK."
        : "Decentralized identity wallet holding verifiable credentials with zk-SNARK cryptographic proofs.",
      url: "https://privado.id",
      icon: "🟣"
    },
    {
      name: "zkPass TransGate",
      badge: "Web3 Privacy",
      description: locale === 'es'
        ? "Protocolo de verificación privada con tecnología 3P-TLS para generar pruebas de edad desde pasaportes y banca sin compartir datos."
        : "Privacy verification protocol using 3P-TLS to generate age proofs from passports and banking without data leakage.",
      url: "https://zkpass.org",
      icon: "⚡"
    },
    {
      name: "World ID / Proof of Human",
      badge: "Biometric ZK",
      description: locale === 'es'
        ? "Credencial de anonimato que demuestra que eres un humano mayor de edad único sin recopilar identificaciones gubernamentales."
        : "Anonymous credential proving you are a unique human of legal age without collecting government IDs.",
      url: "https://world.org",
      icon: "🌐"
    }
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/85 backdrop-blur-md"
        />

        {/* Modal Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="relative w-full max-w-2xl bg-[#0a0f18]/98 border border-[#00fbfb]/30 rounded-[2.5rem] p-6 sm:p-8 shadow-[0_0_60px_rgba(0,251,251,0.2)] text-white z-10 overflow-hidden"
        >
          {/* Ambient Glow */}
          <div className="absolute -top-24 -left-24 w-60 h-60 bg-[#00fbfb]/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-60 h-60 bg-[#ffabf3]/15 rounded-full blur-3xl pointer-events-none" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white transition-all cursor-pointer z-20"
            aria-label="Close ZKP Guide"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="text-center space-y-2.5 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#00fbfb]/40 bg-[#00fbfb]/10 text-[#00fbfb] font-mono text-[10px] font-black uppercase tracking-widest">
              <Cpu className="w-3.5 h-3.5" />
              <span>{locale === 'es' ? 'PROTOCOLO ZKP & SOBERANÍA DIGITAL' : 'ZKP PROTOCOL & DIGITAL SOVEREIGNTY'}</span>
            </div>

            <h2 className="font-['Outfit'] text-2xl sm:text-3xl font-black uppercase tracking-tight text-white">
              {locale === 'es' ? 'Verificación de Edad con Conocimiento Cero (ZKP)' : 'Zero-Knowledge Proof (ZKP) Age Verification'}
            </h2>

            <p className="text-xs sm:text-sm text-[#b9cac9] max-w-lg mx-auto leading-relaxed">
              {locale === 'es'
                ? 'Demuestra matemáticamente que tienes más de 18 años bajo las leyes europeas (DSA) y globales sin subir tu pasaporte ni revelar tu fecha de nacimiento.'
                : 'Mathematically prove you are 18+ under EU DSA and global regulations without uploading passports or exposing your date of birth.'}
            </p>
          </div>

          {/* Tabs */}
          <div className="flex bg-black/60 p-1.5 rounded-full border border-white/10 my-6 relative z-10">
            <button
              onClick={() => setActiveTab('why')}
              className={`flex-1 py-2 rounded-full text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'why'
                  ? 'bg-[#00fbfb] text-black shadow-[0_0_15px_rgba(0,251,251,0.4)]'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{locale === 'es' ? '¿Por qué ZKP?' : 'Why ZKP?'}</span>
            </button>
            <button
              onClick={() => setActiveTab('how')}
              className={`flex-1 py-2 rounded-full text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'how'
                  ? 'bg-[#00fbfb] text-black shadow-[0_0_15px_rgba(0,251,251,0.4)]'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>{locale === 'es' ? 'Cómo Funciona' : 'How It Works'}</span>
            </button>
            <button
              onClick={() => setActiveTab('wallets')}
              className={`flex-1 py-2 rounded-full text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'wallets'
                  ? 'bg-[#00fbfb] text-black shadow-[0_0_15px_rgba(0,251,251,0.4)]'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              <Wallet className="w-3.5 h-3.5" />
              <span>{locale === 'es' ? 'Billeteras ZKP' : 'ZKP Wallets'}</span>
            </button>
          </div>

          {/* Dynamic Content */}
          <div className="space-y-4 min-h-[220px] relative z-10 text-left">
            {activeTab === 'why' && (
              <motion.div
                key="why-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-3 bg-black/40 border border-white/10 p-5 rounded-2xl"
              >
                <h4 className="text-xs font-mono font-black uppercase text-[#00fbfb] flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  {locale === 'es' ? 'Privacidad Absoluta + Cumplimiento Legal Total' : 'Absolute Privacy + Total Legal Compliance'}
                </h4>
                <ul className="space-y-2.5 text-xs text-[#b9cac9]">
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#00fbfb] shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-white">{locale === 'es' ? 'Cero Datos Personales en Servidores: ' : 'Zero Personal Data on Servers: '}</strong>
                      {locale === 'es' 
                        ? 'SECCION solo recibe una afirmación criptográfica verdadera ("Edad >= 18"). Nunca conocemos tu nombre, cumpleaños o dirección.'
                        : 'SECCION only receives a true cryptographic statement ("Age >= 18"). We never see your name, birthday, or address.'}
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#00fbfb] shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-white">{locale === 'es' ? 'Optimizado para la Ley DSA Europea & UK OSA: ' : 'Optimized for EU DSA & UK OSA: '}</strong>
                      {locale === 'es'
                        ? 'Cumple con los estándares más estrictos de protección de menores sin los riesgos de filtración de bases de datos de identidad tradicionales.'
                        : 'Complies with strict child-protection mandates without the vulnerability of centralized ID database leaks.'}
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#00fbfb] shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-white">{locale === 'es' ? 'Verificación Reutilizable Universal: ' : 'Universal Reusable Verification: '}</strong>
                      {locale === 'es'
                        ? 'Una vez que tu billetera tiene la credencial, puedes verificar tu edad en segundos en cualquier plataforma compatible.'
                        : 'Once verified in your digital wallet, you can reuse the same age proof in seconds across any supported platform.'}
                    </span>
                  </li>
                </ul>
              </motion.div>
            )}

            {activeTab === 'how' && (
              <motion.div
                key="how-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-3 bg-black/40 border border-white/10 p-5 rounded-2xl text-xs text-[#b9cac9]"
              >
                <h4 className="text-xs font-mono font-black uppercase text-[#00fbfb] flex items-center gap-2">
                  <Fingerprint className="w-4 h-4" />
                  {locale === 'es' ? 'El Proceso en 3 Pasos' : 'The 3-Step Process'}
                </h4>
                
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-white/5 rounded-xl border border-white/5">
                    <div className="w-6 h-6 rounded-full bg-[#00fbfb]/20 text-[#00fbfb] flex items-center justify-center font-mono font-bold shrink-0">1</div>
                    <div>
                      <strong className="text-white block">{locale === 'es' ? '1. Descarga una Billetera de Identidad' : '1. Download an Identity Wallet'}</strong>
                      <span>{locale === 'es' ? 'Instala Privado ID, Polygon ID o zkPass en tu móvil o navegador.' : 'Install Privado ID, Polygon ID, or zkPass on your phone or browser.'}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-white/5 rounded-xl border border-white/5">
                    <div className="w-6 h-6 rounded-full bg-[#00fbfb]/20 text-[#00fbfb] flex items-center justify-center font-mono font-bold shrink-0">2</div>
                    <div>
                      <strong className="text-white block">{locale === 'es' ? '2. Emite tu Credencial Anónima' : '2. Issue Your Anonymous Credential'}</strong>
                      <span>{locale === 'es' ? 'Escanea el chip NFC de tu pasaporte o conecta un emisor acreditado una sola vez en tu dispositivo privado.' : 'Scan your passport NFC chip or connect an accredited issuer once inside your private device.'}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-white/5 rounded-xl border border-white/5">
                    <div className="w-6 h-6 rounded-full bg-[#00fbfb]/20 text-[#00fbfb] flex items-center justify-center font-mono font-bold shrink-0">3</div>
                    <div>
                      <strong className="text-white block">{locale === 'es' ? '3. Escanea y Entra a SECCION' : '3. Scan and Access SECCION'}</strong>
                      <span>{locale === 'es' ? 'Escanea el código QR de SECCION. Tu billetera genera la prueba zk-SNARK y desbloquea tu acceso al instante.' : 'Scan the SECCION QR code. Your wallet generates the zk-SNARK proof and unlocks instant access.'}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'wallets' && (
              <motion.div
                key="wallets-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-3"
              >
                <div className="space-y-2.5">
                  {WALLET_PROVIDERS.map((w, idx) => (
                    <div key={idx} className="p-4 bg-black/40 border border-white/10 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-[#00fbfb]/40 transition">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{w.icon}</span>
                          <span className="text-sm font-bold text-white font-mono">{w.name}</span>
                          <span className="text-[9px] font-mono bg-[#00fbfb]/20 text-[#00fbfb] px-2 py-0.5 rounded-full uppercase font-bold">
                            {w.badge}
                          </span>
                        </div>
                        <p className="text-xs text-[#b9cac9] leading-snug">
                          {w.description}
                        </p>
                      </div>

                      <a
                        href={w.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0 inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-white/5 hover:bg-[#00fbfb] hover:text-black text-white text-xs font-mono font-bold uppercase tracking-wider rounded-xl transition border border-white/10 hover:border-[#00fbfb]"
                      >
                        <span>{locale === 'es' ? 'Obtener Billetera' : 'Get Wallet'}</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Footer CTA */}
          <div className="mt-6 pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/50 relative z-10">
            <span className="text-[11px] text-left">
              {locale === 'es' ? '🛡️ SECCION es pionero en privacidad criptográfica y cumplimiento normativo.' : '🛡️ SECCION leads in cryptographic privacy and regulatory compliance.'}
            </span>
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-6 py-2.5 bg-[#00fbfb] hover:bg-[#00fbfb]/80 text-black font-mono text-xs font-black uppercase tracking-wider rounded-xl transition cursor-pointer"
            >
              {locale === 'es' ? 'Entendido / Continuar' : 'Got It / Continue'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
