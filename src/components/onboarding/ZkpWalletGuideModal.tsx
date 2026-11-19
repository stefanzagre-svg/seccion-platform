"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck,
  Lock,
  X,
  ExternalLink,
  Wallet,
  CheckCircle2,
  Zap,
  Cpu,
  Fingerprint,
} from 'lucide-react';
import { useTranslation } from '@/context/LanguageContext';

interface ZkpWalletGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ZkpWalletGuideModal({ isOpen, onClose }: ZkpWalletGuideModalProps) {
  const { locale } = useTranslation();
  const [activeTab, setActiveTab] = useState<'why' | 'wallets' | 'how'>('why');

  const isFr = locale === 'fr';
  const isEs = locale === 'es';

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
      name: isFr
        ? 'EU Age Verification App (eIDAS 2.0)'
        : isEs
        ? 'App Europea de Verificación de Edad (eIDAS 2.0)'
        : 'EU Age Verification App (eIDAS 2.0)',
      badge: isFr ? 'Pilotes EU 2026–2027' : isEs ? 'Pilotos UE 2026–2027' : 'EU Pilots 2026–2027',
      description: isFr
        ? 'Application officielle à double anonymat (OpenID4VP) pilotée en Espagne, France, Italie, Danemark, Grèce, Chypre et Irlande : prouve « +18 = Oui » sans révéler votre identité ni le site visité.'
        : isEs
        ? 'Aplicación oficial de doble anonimato (OpenID4VP) en piloto en España, Francia, Italia, Dinamarca, Grecia, Chipre e Irlanda: demuestra «+18 = Sí» sin revelar tu identidad ni el sitio visitado.'
        : 'Official double-anonymous OpenID4VP age app piloted across Spain, France, Italy, Denmark, Greece, Cyprus, and Ireland: proves "18+ = Yes" without exposing your identity or browsing history.',
      url: 'https://ageverification.dev',
      icon: '🇪🇺',
    },
    {
      name: isFr
        ? 'DIDIT — Vérification Éphémère 18+'
        : isEs
        ? 'DIDIT — Verificación Efímera 18+'
        : 'DIDIT — Ephemeral 18+ Verification',
      badge: isFr ? 'Actif Aujourd’hui' : isEs ? 'Activo Hoy' : 'Live Today',
      description: isFr
        ? 'Selfie passif de 3 secondes (sans pièce d’identité pour les adultes confirmés). SECCION ne reçoit qu’un reçu signé « 18+ vérifié » et ne stocke jamais votre visage ni vos documents.'
        : isEs
        ? 'Selfie pasivo de 3 segundos (sin subir documento para adultos claros). SECCION solo recibe un recibo firmado «18+ verificado» y nunca guarda tu rostro ni tu documento.'
        : '3-second passive selfie check (no ID document upload for clear adults). SECCION receives only a signed "18+ verified" receipt and never stores your face or ID.',
      url: 'https://didit.me',
      icon: '🛡️',
    },
    {
      name: isFr
        ? 'Registre Public US (États Réglementés)'
        : isEs
        ? 'Registro Público EE. UU. (Estados Regulados)'
        : 'US Transactional Registry (Regulated US States)',
      badge: isFr ? 'États-Unis Uniquement' : isEs ? 'Solo EE. UU.' : 'US Only (HB 1181)',
      description: isFr
        ? 'Pour les États américains concernés (TX, FL, VA, UT…), validation instantanée via registres publics autorisés sans caméra ni téléchargement de permis pour la majorité des adultes.'
        : isEs
        ? 'Para estados regulados de EE. UU. (TX, FL, VA, UT…), validación instantánea mediante registros públicos autorizados sin cámara ni subida de documento para la mayoría de adultos.'
        : 'For regulated US states (TX, FL, VA, UT, etc.), instant validation via authorized public records with no camera or driver’s license upload for most US adults.',
      url: 'https://agechecker.net',
      icon: '🇺🇸',
    },
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
            aria-label={isFr ? 'Fermer le guide' : isEs ? 'Cerrar guía' : 'Close Privacy Guide'}
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="text-center space-y-2.5 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#00fbfb]/40 bg-[#00fbfb]/10 text-[#00fbfb] font-mono text-[10px] font-black uppercase tracking-widest">
              <Cpu className="w-3.5 h-3.5" />
              <span>
                {isFr
                  ? 'CONFIDENTIALITÉ & VÉRIFICATION 18+'
                  : isEs
                  ? 'PRIVACIDAD & VERIFICACIÓN 18+'
                  : 'PRIVACY-FIRST 18+ ASSURANCE'}
              </span>
            </div>

            <h2 className="font-['Outfit'] text-2xl sm:text-3xl font-black uppercase tracking-tight text-white">
              {isFr
                ? 'Comment SECCION Vérifie Votre Âge Sans Garder Vos Données'
                : isEs
                ? 'Cómo Verifica SECCION Tu Edad Sin Guardar Tus Datos'
                : 'How SECCION Verifies Age Without Storing Your Data'}
            </h2>

            <p className="text-xs sm:text-sm text-[#b9cac9] max-w-lg mx-auto leading-relaxed">
              {isFr
                ? 'Prouvez votre majorité (18+) en quelques secondes selon les lois UE (DSA), Royaume-Uni (Ofcom) et États-Unis, sans jamais stocker de pièce d’identité sur les serveurs SECCION.'
                : isEs
                ? 'Demuestra tu mayoría de edad (18+) en segundos bajo las leyes de la UE (DSA), Reino Unido (Ofcom) y EE. UU., sin almacenar documentos de identidad en los servidores de SECCION.'
                : 'Prove you are 18+ in seconds under EU DSA, UK Ofcom, and US state laws — without SECCION ever storing your ID photo or face data.'}
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
              <span>{isFr ? 'Confidentialité' : isEs ? 'Privacidad' : 'Privacy'}</span>
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
              <span>{isFr ? 'Fonctionnement' : isEs ? 'Cómo Funciona' : 'How It Works'}</span>
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
              <span>{isFr ? 'Options & EU Wallet' : isEs ? 'Opciones & EU Wallet' : 'Options & EU Wallet'}</span>
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
                  {isFr
                    ? 'Zéro Stockage PII + Conformité Totale'
                    : isEs
                    ? 'Cero Almacenamiento PII + Cumplimiento Total'
                    : 'Zero PII Storage + Full Regulatory Compliance'}
                </h4>
                <ul className="space-y-2.5 text-xs text-[#b9cac9]">
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#00fbfb] shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-white">
                        {isFr
                          ? 'Ce que SECCION reçoit : '
                          : isEs
                          ? 'Qué recibe SECCION: '
                          : 'What SECCION receives: '}
                      </strong>
                      {isFr
                        ? 'Uniquement un reçu cryptographique signé « 18+ = Oui » et une empreinte à sens unique. Jamais votre nom, votre selfie ni votre pièce d’identité.'
                        : isEs
                        ? 'Únicamente un recibo criptográfico firmado «18+ = Sí» y un hash irreversible. Nunca tu nombre, selfie ni documento.'
                        : 'Only a signed receipt ("18+ = Yes") and a one-way proof hash. Never your name, selfie, or ID document.'}
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#00fbfb] shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-white">
                        {isFr
                          ? 'Une seule fois par compte : '
                          : isEs
                          ? 'Una sola vez por cuenta: '
                          : 'Verified once per account: '}
                      </strong>
                      {isFr
                        ? 'Dès validation, votre accès 18+ reste actif sans jamais devoir répéter la procédure.'
                        : isEs
                        ? 'Una vez validado, tu acceso 18+ queda desbloqueado sin repetir el proceso.'
                        : 'Once confirmed, your 18+ status stays unlocked without repeating verification.'}
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#00fbfb] shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-white">
                        {isFr
                          ? 'Prêt pour eIDAS 2.0 (2026–2027) : '
                          : isEs
                          ? 'Listo para eIDAS 2.0 (2026–2027): '
                          : 'Ready for EU eIDAS 2.0 (2026–2027): '}
                      </strong>
                      {isFr
                        ? 'Notre architecture modulaire intégrera nativement l’EU Age Verification App (Espagne, France, Italie…) dès l’ouverture des registres nationaux.'
                        : isEs
                        ? 'Nuestra arquitectura modular integrará de forma nativa la EU Age Verification App (España, Francia, Italia…) en cuanto abran los registros nacionales.'
                        : 'Our modular architecture is built to plug directly into the official EU Age Verification App / EUDI Wallets (Spain, France, Italy, and EU-27) as national registries open.'}
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
                  {isFr ? 'Le Processus en 3 Étapes' : isEs ? 'El Proceso en 3 Pasos' : 'The 3-Step Process'}
                </h4>

                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-white/5 rounded-xl border border-white/5">
                    <div className="w-6 h-6 rounded-full bg-[#00fbfb]/20 text-[#00fbfb] flex items-center justify-center font-mono font-bold shrink-0">
                      1
                    </div>
                    <div>
                      <strong className="text-white block">
                        {isFr
                          ? '1. Inscription SFW rapide (< 30 s)'
                          : isEs
                          ? '1. Registro SFW rápido (< 30 s)'
                          : '1. Fast SFW Signup (< 30s)'}
                      </strong>
                      <span>
                        {isFr
                          ? 'Explorez la plateforme sans aucune barrière biométrique ni documentaire.'
                          : isEs
                          ? 'Explora la plataforma sin ninguna barrera biométrica ni de documentos.'
                          : 'Explore the platform immediately with zero ID or camera friction.'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-white/5 rounded-xl border border-white/5">
                    <div className="w-6 h-6 rounded-full bg-[#00fbfb]/20 text-[#00fbfb] flex items-center justify-center font-mono font-bold shrink-0">
                      2
                    </div>
                    <div>
                      <strong className="text-white block">
                        {isFr
                          ? '2. Vérification 18+ adaptée à votre pays'
                          : isEs
                          ? '2. Verificación 18+ adaptada a tu país'
                          : '2. Country-Adapted 18+ Verification'}
                      </strong>
                      <span>
                        {isFr
                          ? 'Pour débloquer +18 ou Rencontres : selfie éphémère de 3 s via DIDIT (UE/UK/Monde) ou registre public instantané (États US réglementés).'
                          : isEs
                          ? 'Al desbloquear +18 o Citas: selfie efímero de 3 s con DIDIT (UE/UK/Global) o registro público instantáneo (estados regulados de EE. UU.).'
                          : 'When unlocking +18 or Dating: 3-second ephemeral DIDIT selfie (EU/UK/Global) or instant public-record lookup (regulated US states).'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-white/5 rounded-xl border border-white/5">
                    <div className="w-6 h-6 rounded-full bg-[#00fbfb]/20 text-[#00fbfb] flex items-center justify-center font-mono font-bold shrink-0">
                      3
                    </div>
                    <div>
                      <strong className="text-white block">
                        {isFr
                          ? '3. Reçu signé zéro-PII'
                          : isEs
                          ? '3. Recibo firmado cero-PII'
                          : '3. Signed Zero-PII Receipt'}
                      </strong>
                      <span>
                        {isFr
                          ? 'Votre profil est marqué 18+ côté serveur sans que SECCION ne conserve jamais vos images ou pièces d’identité.'
                          : isEs
                          ? 'Tu perfil se marca como 18+ en el servidor sin que SECCION guarde jamás tus imágenes ni documentos.'
                          : 'Your account is marked 18+ server-side without SECCION ever storing your photos or ID documents.'}
                      </span>
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
                    <div
                      key={idx}
                      className="p-4 bg-black/40 border border-white/10 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-[#00fbfb]/40 transition"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center flex-wrap gap-2">
                          <span className="text-lg">{w.icon}</span>
                          <span className="text-sm font-bold text-white font-mono">{w.name}</span>
                          <span className="text-[9px] font-mono bg-[#00fbfb]/20 text-[#00fbfb] px-2 py-0.5 rounded-full uppercase font-bold">
                            {w.badge}
                          </span>
                        </div>
                        <p className="text-xs text-[#b9cac9] leading-snug">{w.description}</p>
                      </div>

                      <a
                        href={w.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0 inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-white/5 hover:bg-[#00fbfb] hover:text-black text-white text-xs font-mono font-bold uppercase tracking-wider rounded-xl transition border border-white/10 hover:border-[#00fbfb]"
                      >
                        <span>{isFr ? 'En savoir plus' : isEs ? 'Saber más' : 'Learn More'}</span>
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
              {isFr
                ? '🛡️ SECCION applique la minimisation stricte RGPD et prépare l’interopérabilité eIDAS 2.0.'
                : isEs
                ? '🛡️ SECCION aplica minimización estricta RGPD y prepara interoperabilidad nativa con eIDAS 2.0.'
                : '🛡️ SECCION enforces strict GDPR minimization and builds toward native EU eIDAS 2.0 wallet support.'}
            </span>
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-6 py-2.5 bg-[#00fbfb] hover:bg-[#00fbfb]/80 text-black font-mono text-xs font-black uppercase tracking-wider rounded-xl transition cursor-pointer"
            >
              {isFr ? 'Compris / Continuer' : isEs ? 'Entendido / Continuar' : 'Got It / Continue'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
