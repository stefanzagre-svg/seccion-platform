'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DollarSign, X, CheckCircle2, Gift } from 'lucide-react';

interface TipModalProps {
  isOpen: boolean;
  onClose: () => void;
  creatorName: string;
  onTipSent: (amount: number) => void;
}

const PRESET_AMOUNTS = [5, 10, 25, 50, 100];

export default function TipModal({ isOpen, onClose, creatorName, onTipSent }: TipModalProps) {
  const [selectedAmount, setSelectedAmount] = useState<number>(10);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [status, setStatus] = useState<'idle' | 'processing' | 'success'>('idle');

  const handleSendTip = () => {
    const amount = customAmount ? parseFloat(customAmount) : selectedAmount;
    if (!amount || amount <= 0) return;

    setStatus('processing');
    
    // Simulate payment processing delay
    setTimeout(() => {
      setStatus('success');
      
      // Notify parent component after showing success state
      setTimeout(() => {
        onTipSent(amount);
        setStatus('idle');
        onClose();
        setCustomAmount('');
      }, 1500);
      
    }, 1000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#111] border border-white/10 rounded-3xl w-full max-w-md overflow-hidden relative shadow-2xl"
            >
              {/* Header */}
              <div className="p-6 border-b border-white/10 flex justify-between items-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-purple-500/20 opacity-50" />
                <h2 className="text-xl font-black text-white relative z-10 flex items-center gap-2">
                  <Gift className="w-5 h-5 text-primary" /> 
                  Support {creatorName}
                </h2>
                <button 
                  onClick={onClose}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition text-white relative z-10"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6">
                {status === 'success' ? (
                  <div className="flex flex-col items-center justify-center py-10">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mb-4"
                    >
                      <CheckCircle2 className="w-10 h-10 text-green-500" />
                    </motion.div>
                    <h3 className="text-xl font-bold text-white mb-2">Tip Sent!</h3>
                    <p className="text-white/60 text-sm text-center">
                      Thank you for supporting {creatorName}.
                    </p>
                  </div>
                ) : (
                  <>
                    <p className="text-sm text-white/60 mb-6 text-center">
                      Choose an amount to tip in USD. 
                    </p>

                    <div className="grid grid-cols-3 gap-3 mb-6">
                      {PRESET_AMOUNTS.map((amount) => (
                        <button
                          key={amount}
                          onClick={() => {
                            setSelectedAmount(amount);
                            setCustomAmount('');
                          }}
                          className={`py-3 rounded-xl font-bold text-lg transition-all border ${
                            selectedAmount === amount && !customAmount
                              ? 'bg-primary/20 border-primary text-primary shadow-[0_0_15px_rgba(102,252,241,0.2)]'
                              : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
                          }`}
                        >
                          ${amount}
                        </button>
                      ))}
                    </div>

                    <div className="mb-8">
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <DollarSign className="h-5 w-5 text-white/40" />
                        </div>
                        <input
                          type="number"
                          placeholder="Custom Amount"
                          value={customAmount}
                          onChange={(e) => {
                            setCustomAmount(e.target.value);
                            setSelectedAmount(0);
                          }}
                          className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-10 pr-4 text-white text-lg focus:outline-none focus:border-primary/50 transition font-bold"
                        />
                      </div>
                    </div>

                    <button
                      onClick={handleSendTip}
                      disabled={status === 'processing' || (!selectedAmount && !customAmount)}
                      className="w-full py-4 bg-primary text-black font-black uppercase tracking-wider text-sm rounded-xl hover:shadow-[0_0_20px_rgba(102,252,241,0.4)] transition disabled:opacity-50 disabled:hover:shadow-none flex items-center justify-center gap-2"
                    >
                      {status === 'processing' ? (
                        <>Processing...</>
                      ) : (
                        <>Send ${(customAmount ? parseFloat(customAmount) : selectedAmount).toFixed(2)}</>
                      )}
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
