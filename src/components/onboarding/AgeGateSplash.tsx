'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, Info, ArrowRight, Cpu } from 'lucide-react';
import { useTranslation } from '@/context/LanguageContext';
import ZkpWalletGuideModal from '@/components/onboarding/ZkpWalletGuideModal';

export default function AgeGateSplash() {
  const { t, locale } = useTranslation();
  const [isVerified, setIsVerified] = useState(true);
  const [showZkpInfo, setShowZkpInfo] = useState(false);
  const [isZkpModalOpen, setIsZkpModalOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const verified = localStorage.getItem('seccion_age_verified');
      if (verified === 'false') {
        setIsVerified(false);
      }
    }
  }, []);

  const handleVerify = () => {
    localStorage.setItem('seccion_age_verified', 'true');
    setIsVerified(true);
  };

  if (isVerified) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black backdrop-blur-3xl p-4">
        {/* Background ambient glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 via-black to-black pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="relative max-w-md w-full bg-black/90 border border-white/10 p-8 rounded-3xl shadow-[0_0_50px_rgba(102,252,241,0.15)] text-center overflow-hidden"
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-primary/20 blur-[60px] rounded-full pointer-events-none" />
          
          <div className="relative z-10">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-2xl border border-primary/20 flex items-center justify-center mb-6">
              <ShieldAlert className="w-8 h-8 text-primary" />
            </div>

            <h1 className="text-3xl font-black text-white font-['JetBrains_Mono'] mb-3 tracking-tighter">
              RESTRICTED <span className="text-primary">ACCESS</span>
            </h1>
            
            <p className="text-white/70 text-sm mb-8 leading-relaxed">
              SECCION is an adult content platform. You must be at least 18 years old to enter. 
              Please confirm your age to proceed.
            </p>

            <div className="space-y-4">
              <button
                onClick={handleVerify}
                className="w-full py-4 bg-primary hover:bg-[#45f2e6] text-black font-black uppercase tracking-wider text-sm rounded-xl transition-all shadow-[0_0_20px_rgba(102,252,241,0.3)] flex items-center justify-center gap-2"
              >
                I am 18 or older <ArrowRight className="w-4 h-4" />
              </button>
              
              <button
                onClick={() => window.location.href = 'https://google.com'}
                className="w-full py-4 bg-white/5 hover:bg-white/10 text-white font-bold uppercase tracking-wider text-xs rounded-xl transition border border-white/10"
              >
                I am under 18 (Exit)
              </button>
            </div>

            <div className="mt-8 pt-6 border-t border-white/10">
              <button 
                onClick={() => setShowZkpInfo(!showZkpInfo)}
                className="text-[10px] uppercase font-bold tracking-widest text-white/40 hover:text-white flex items-center justify-center gap-1.5 mx-auto transition cursor-pointer"
              >
                <Info className="w-3 h-3" /> {locale === 'es' ? 'Cómo verificamos tu edad (Protocolo Híbrido & ZKP)' : 'How we verify age (Hybrid Protocol & ZKP)'}
              </button>
              
              <AnimatePresence>
                {showZkpInfo && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="p-4 mt-4 bg-white/5 border border-white/10 rounded-xl text-left space-y-3">
                      <p className="text-xs text-white/70 leading-relaxed">
                        <strong className="text-white">{locale === 'es' ? 'Privacidad Soberana & DSA:' : 'Sovereign Privacy & DSA:'}</strong>{' '}
                        {locale === 'es' 
                          ? 'SECCION utiliza un protocolo híbrido. Puedes auto-declarar tu fecha de nacimiento bajo las leyes locales, o utilizar una Billetera de Identidad ZKP para verificar tu edad de forma 100% matemática y privada sin compartir documentos.'
                          : 'SECCION uses a hybrid verification approach. You can self-declare your DOB under local regulations, or use a ZKP Identity Wallet to verify age mathematically with zero data storage.'}
                      </p>
                      <button
                        type="button"
                        onClick={() => setIsZkpModalOpen(true)}
                        className="w-full py-2 bg-[#00fbfb]/15 hover:bg-[#00fbfb]/25 border border-[#00fbfb]/40 text-[#00fbfb] font-mono text-[10px] font-bold uppercase tracking-wider rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Cpu className="w-3.5 h-3.5" />
                        <span>{locale === 'es' ? 'Abrir Guía de Billeteras ZKP' : 'Open ZKP Wallet Guide'}</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>

        <ZkpWalletGuideModal isOpen={isZkpModalOpen} onClose={() => setIsZkpModalOpen(false)} />
      </div>
    </AnimatePresence>
  );
}
