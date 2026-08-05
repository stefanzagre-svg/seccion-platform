'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MEMBER_PURPOSES, type MemberPurposeId } from '@/lib/constants';
import { ArrowRight, Info, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useTranslation } from '@/context/LanguageContext';

interface PurposeSelectorProps {
  onContinue: (purposes: MemberPurposeId[], isCreator: boolean) => void;
}

export default function PurposeSelector({ onContinue }: PurposeSelectorProps) {
  const { t } = useTranslation();
  const [selected, setSelected] = useState<MemberPurposeId[]>([]);

  const togglePurpose = (id: MemberPurposeId) => {
    if (id === 'creator') {
      setSelected((prev) => 
        prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
      );
      return;
    }
    
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const handleContinue = () => {
    const isCreator = selected.includes('creator');
    const memberPurposes = selected.filter((p) => p !== 'creator');
    
    const finalPurposes = memberPurposes.length > 0 ? memberPurposes : ['lifestyle' as MemberPurposeId];
    
    onContinue(finalPurposes, isCreator);
  };
  
  const hasMemberPurpose = selected.some(p => p !== 'creator');
  const canProceed = selected.length > 0 && (!selected.includes('creator') || hasMemberPurpose);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full max-w-4xl mx-auto flex flex-col items-center justify-center min-h-[70vh] px-4"
    >
      <div className="text-center space-y-4 mb-8">
        <h1 className="text-3xl md:text-5xl font-light text-white tracking-wide flex items-center justify-center flex-wrap gap-2">
          <span>What brings you to</span>
          <img src="/assets/logo/seccion-wordmark-light.png" alt="SECCION" className="h-8 md:h-12 object-contain inline-block drop-shadow-[0_0_15px_rgba(0,251,251,0.5)]" />
          <span>?</span>
        </h1>
        <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto">
          Select all that apply. Your experience will adapt to your goals.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full mb-10">
        {MEMBER_PURPOSES.map((purpose) => {
          const isSelected = selected.includes(purpose.id);
          
          return (
            <motion.div
              key={purpose.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => togglePurpose(purpose.id)}
              className={`relative overflow-hidden rounded-2xl cursor-pointer border backdrop-blur-xl transition-all duration-300 flex flex-col p-6
                ${isSelected 
                  ? `bg-gradient-to-br ${purpose.color} shadow-lg shadow-black/50 border-opacity-100` 
                  : 'bg-slate-900/40 border-white/5 hover:border-white/10 hover:bg-slate-800/60'
                }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <span className="text-4xl">{purpose.emoji}</span>
                  <h3 className="text-xl font-medium text-white">{purpose.label}</h3>
                </div>
                <div className={`h-6 w-6 rounded-full border flex items-center justify-center transition-colors
                  ${isSelected ? 'bg-white border-white text-black' : 'border-slate-600 text-transparent'}
                `}>
                  <CheckCircle2 className="h-4 w-4" />
                </div>
              </div>

              <p className="text-slate-300 mb-4">{purpose.description}</p>

              <ul className="space-y-2 mt-auto">
                {purpose.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center text-sm text-slate-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-slate-500 mr-2" />
                    {feature}
                  </li>
                ))}
              </ul>
              
              {purpose.id === 'explicit' && (
                <div className="mt-4 flex items-center space-x-2 text-xs text-red-400 bg-red-950/30 p-2 rounded-lg border border-red-500/20">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>Mandatory 18+ age verification required</span>
                </div>
              )}
              
              {purpose.id === 'creator' && isSelected && !hasMemberPurpose && (
                <div className="mt-4 flex items-start space-x-2 text-xs text-amber-400 bg-amber-950/30 p-2 rounded-lg border border-amber-500/20">
                  <Info className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>You'll set up your member profile first, then unlock your Creator Studio. Please select a member purpose above as well.</span>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      <motion.button
        disabled={!canProceed}
        whileHover={canProceed ? { scale: 1.05 } : {}}
        whileTap={canProceed ? { scale: 0.95 } : {}}
        onClick={handleContinue}
        className={`flex items-center space-x-2 px-8 py-4 rounded-full text-lg font-medium transition-all duration-300
          ${canProceed 
            ? 'bg-white text-black shadow-lg shadow-white/20 hover:shadow-white/40' 
            : 'bg-white/5 text-white/30 cursor-not-allowed border border-white/5'
          }`}
      >
        <span>Continue</span>
        <ArrowRight className="h-5 w-5" />
      </motion.button>
    </motion.div>
  );
}
