'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, AlertTriangle, Info, X } from 'lucide-react';
import { useState } from 'react';

interface UploadSafetyNoticeProps {
  onAccept: () => void;
  onCancel: () => void;
  type?: 'post' | 'stream' | 'profile';
}

export default function UploadSafetyNotice({ onAccept, onCancel, type = 'post' }: UploadSafetyNoticeProps) {
  const [isVisible, setIsVisible] = useState(true);

  const handleAccept = () => {
    setIsVisible(false);
    onAccept();
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="w-full max-w-xl bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)]"
          >
            {/* Header */}
            <div className="bg-primary/10 px-8 py-6 border-b border-primary/20 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center shadow-[0_0_20px_rgba(255,0,127,0.2)]">
                <ShieldAlert className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-black tracking-tighter uppercase">Safety Protocol</h2>
                <p className="text-[10px] text-primary/60 font-black uppercase tracking-widest">Public Content Restriction</p>
              </div>
              <button 
                onClick={onCancel}
                className="ml-auto p-2 hover:bg-white/5 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-white/40" />
              </button>
            </div>

            {/* Content */}
            <div className="p-8 space-y-6">
              <div className="flex gap-4 p-4 bg-white/5 rounded-2xl border border-white/10">
                <AlertTriangle className="w-5 h-5 text-yellow-500 shrink-0" />
                <div className="space-y-1">
                  <p className="text-sm font-bold text-white/90">Strict Restriction of Explicit Content</p>
                  <p className="text-xs text-white/50 leading-relaxed">
                    Posting explicit adult content in public channels is strictly forbidden. This includes your:
                  </p>
                  <ul className="grid grid-cols-2 gap-x-4 gap-y-2 mt-3">
                    {['Profile Avatar', 'Profile Photos', 'Video Descriptions', 'Public Feed Posts'].map(item => (
                      <li key={item} className="text-[10px] font-black text-white/30 uppercase tracking-widest flex items-center gap-2">
                        <div className="w-1 h-1 bg-primary rounded-full" /> {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="flex gap-4 p-4 bg-blue-500/5 rounded-2xl border border-blue-500/20">
                <Info className="w-5 h-5 text-blue-400 shrink-0" />
                <div className="space-y-1">
                  <p className="text-sm font-bold text-white/90">Private vs Public Content</p>
                  <p className="text-xs text-white/50 leading-relaxed">
                    Explicit content is exclusively reserved for <span className="text-primary font-black uppercase tracking-widest">VIP or Master</span> subscribers in private, matched sessions or dedicated private galleries.
                  </p>
                </div>
              </div>

              <p className="text-[10px] text-center text-white/30 font-black uppercase tracking-widest pt-4">
                By continuing, you acknowledge that any violation of this protocol will lead to an immediate account suspension and content removal.
              </p>
            </div>

            {/* Actions */}
            <div className="p-8 pt-0 flex gap-4">
              <button 
                onClick={onCancel}
                className="flex-1 py-4 bg-white/5 border border-white/10 text-white/60 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-white/10 hover:text-white transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={handleAccept}
                className="flex-[2] py-4 bg-primary text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-[0_10px_30px_rgba(255,0,127,0.4)] hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                I Understand & Accept
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
