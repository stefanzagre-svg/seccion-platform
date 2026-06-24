import { motion, AnimatePresence } from 'framer-motion';
import { GaugeTension, TENSION_DISPLAY } from '@/lib/relationship-engine';
import { Info } from 'lucide-react';
import { useState } from 'react';

interface SparkHintProps {
  tension: GaugeTension;
}

export default function SparkHint({ tension }: SparkHintProps) {
  const [isOpen, setIsOpen] = useState(false);
  const info = TENSION_DISPLAY[tension];

  const getHintText = (t: GaugeTension) => {
    switch(t) {
      case 'burning': return "Their investment gauge is significantly higher than yours. They are waiting for you to reciprocate.";
      case 'sparking': return "Both of your gauges are closely aligned. Keep up the mutual momentum!";
      case 'fading': return "Your investment is higher than theirs. Give them space to engage, or send a high-value move.";
      case 'neutral': return "The connection is new. Early interactions will set the tone for your dynamic.";
    }
  };

  return (
    <div className="relative inline-block">
      <button 
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border bg-black/40 backdrop-blur-sm transition-all duration-300 hover:scale-105"
        style={{ borderColor: `${info.color}40` }}
      >
        <span className="text-sm">{info.emoji}</span>
        <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: info.color }}>
          {info.label}
        </span>
        <Info className="w-3 h-3 text-white/30 ml-1" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-48 p-3 rounded-xl glass-card border border-white/10 z-50 shadow-2xl"
          >
            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-[#111] border-b border-r border-white/10 rotate-45" />
            
            <div className="relative z-10">
              <h4 className="text-[9px] font-black uppercase tracking-widest mb-1.5 flex items-center gap-1" style={{ color: info.color }}>
                {info.emoji} Spark Hint
              </h4>
              <p className="text-xs text-white/70 leading-relaxed">
                {getHintText(tension)}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
