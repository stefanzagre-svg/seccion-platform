'use client';

import { useState } from 'react';
import { ShieldCheck, Lock, CreditCard, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface SegpayPaymentGateProps {
  amount: number;
  tier: 'VIP' | 'MASTER';
  creatorName: string;
  onSuccess?: () => void;
}

export default function SegpayPaymentGate({ amount, tier, creatorName, onSuccess }: SegpayPaymentGateProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCheckout = () => {
    setIsProcessing(true);
    // Simulate a redirect or iframe load to Segpay's secure payment page
    // In a real implementation, we would fetch a secure token from our backend
    // and use it to initiate the Segpay flow.
    setTimeout(() => {
      setIsProcessing(false);
      if (onSuccess) onSuccess();
    }, 2000);
  };

  return (
    <div className="w-full max-w-md mx-auto bg-black/60 border border-white/10 rounded-3xl p-8 backdrop-blur-xl relative overflow-hidden">
      {/* Secure Header */}
      <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#00fbfb]/10 border border-[#00fbfb]/20 flex items-center justify-center">
            <Lock className="w-5 h-5 text-[#00fbfb]" />
          </div>
          <div>
            <h3 className="text-white font-bold text-sm">Secure Checkout</h3>
            <p className="text-white/50 text-[10px] uppercase tracking-wider">Processed by Segpay</p>
          </div>
        </div>
        <ShieldCheck className="w-6 h-6 text-green-400 opacity-50" />
      </div>

      {/* Order Summary */}
      <div className="space-y-4 mb-8">
        <div className="flex justify-between items-center text-sm">
          <span className="text-white/60">Subscription To</span>
          <span className="text-white font-bold">{creatorName}</span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-white/60">Tier</span>
          <span className={`font-bold px-2 py-0.5 rounded text-[10px] uppercase tracking-wider ${
            tier === 'MASTER' ? 'bg-[#00fbfb]/20 text-[#00fbfb]' : 'bg-purple-500/20 text-purple-400'
          }`}>
            {tier}
          </span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-white/60">Billing Cycle</span>
          <span className="text-white font-bold">Monthly (Auto-renew)</span>
        </div>
        
        <div className="pt-4 mt-4 border-t border-white/10 flex justify-between items-end">
          <span className="text-white/80 font-bold uppercase tracking-wider text-xs">Total</span>
          <span className="text-3xl font-black text-white font-['JetBrains_Mono']">${amount.toFixed(2)}</span>
        </div>
      </div>

      {/* Checkout Action */}
      <button 
        onClick={handleCheckout}
        disabled={isProcessing}
        className="w-full py-4 bg-white text-black font-black uppercase text-sm rounded-xl hover:bg-gray-200 transition flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Connecting to Gateway...
          </>
        ) : (
          <>
            <CreditCard className="w-5 h-5" />
            Proceed to Payment
          </>
        )}
      </button>

      {/* Trust Badges */}
      <div className="mt-6 flex justify-center items-center gap-4 text-white/30 text-[10px] uppercase tracking-widest font-bold">
        <span>PCI Compliant</span>
        <span>•</span>
        <span>256-bit Encryption</span>
      </div>
    </div>
  );
}
