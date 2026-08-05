'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, Calendar, XCircle, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface Subscription {
  id: string;
  creatorName: string;
  tier: 'VIP' | 'MASTER';
  price: number;
  nextBillingDate: string;
  autoRenew: boolean;
  status: 'active' | 'canceled_pending' | 'expired';
}

const mockSubscriptions: Subscription[] = [
  { id: 'sub_123', creatorName: 'Sofia', tier: 'VIP', price: 15, nextBillingDate: 'Oct 15, 2026', autoRenew: true, status: 'active' },
  { id: 'sub_456', creatorName: 'Elena', tier: 'MASTER', price: 99, nextBillingDate: 'Oct 01, 2026', autoRenew: false, status: 'canceled_pending' },
];

export default function SubscriptionManager() {
  const [subs, setSubs] = useState<Subscription[]>(mockSubscriptions);
  const [cancelTargetId, setCancelTargetId] = useState<string | null>(null);

  // Two-Click Cancellation (UK DMCCA Compliance)
  // Click 1: Click 'Cancel' on the row -> opens confirmation overlay.
  // Click 2: Click 'Confirm Cancellation' -> instantly cancels auto-renew.
  const handleCancelClick1 = (id: string) => {
    setCancelTargetId(id);
  };

  const handleCancelClick2 = (id: string) => {
    setSubs(current => 
      current.map(sub => 
        sub.id === id ? { ...sub, autoRenew: false, status: 'canceled_pending' } : sub
      )
    );
    setCancelTargetId(null);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-black text-white font-['JetBrains_Mono']">Manage Subscriptions</h2>
          <p className="text-sm text-white/50 mt-1">Review active tiers, billing dates, and manage auto-renewals.</p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
          <CreditCard className="w-6 h-6 text-white/40" />
        </div>
      </div>

      <div className="space-y-4">
        {subs.map((sub) => (
          <div key={sub.id} className="bg-white/5 border border-white/10 rounded-2xl p-6 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
            
            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className={`w-14 h-14 rounded-full flex items-center justify-center border-2 ${
                sub.tier === 'MASTER' ? 'border-[#00fbfb] bg-[#00fbfb]/10' : 'border-purple-500 bg-purple-500/10'
              }`}>
                <span className={`text-lg font-black ${sub.tier === 'MASTER' ? 'text-[#00fbfb]' : 'text-purple-400'}`}>
                  {sub.creatorName.charAt(0)}
                </span>
              </div>
              
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-white">{sub.creatorName}</h3>
                  <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
                    sub.tier === 'MASTER' ? 'bg-[#00fbfb]/20 text-[#00fbfb]' : 'bg-purple-500/20 text-purple-400'
                  }`}>
                    {sub.tier}
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-1 text-xs text-white/50">
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {sub.nextBillingDate}</span>
                  <span>•</span>
                  <span>${sub.price.toFixed(2)}/mo</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 w-full md:w-auto justify-end">
              {sub.status === 'canceled_pending' ? (
                <div className="flex items-center gap-2 text-yellow-500 bg-yellow-500/10 px-4 py-2 rounded-xl text-xs font-bold border border-yellow-500/20">
                  <AlertTriangle className="w-4 h-4" />
                  Cancels on {sub.nextBillingDate}
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2 text-green-400 bg-green-400/10 px-4 py-2 rounded-xl text-xs font-bold border border-green-400/20">
                    <CheckCircle2 className="w-4 h-4" />
                    Active
                  </div>
                  {/* Click 1 */}
                  <button 
                    onClick={() => handleCancelClick1(sub.id)}
                    className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold uppercase tracking-wider rounded-xl border border-red-500/20 transition flex items-center gap-2"
                  >
                    <XCircle className="w-4 h-4" /> Cancel
                  </button>
                </>
              )}
            </div>

            {/* Click 2 Overlay (DMCCA Compliant - No hidden friction) */}
            <AnimatePresence>
              {cancelTargetId === sub.id && (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="absolute inset-0 bg-black/90 backdrop-blur-md flex items-center justify-between px-6 z-10"
                >
                  <div className="text-white">
                    <p className="font-bold">Cancel Auto-Renew for {sub.creatorName}?</p>
                    <p className="text-xs text-white/50 mt-1">You will retain access until {sub.nextBillingDate}.</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => setCancelTargetId(null)}
                      className="px-4 py-2 text-white/60 hover:text-white text-xs font-bold uppercase tracking-wider transition"
                    >
                      Keep Active
                    </button>
                    {/* Click 2 */}
                    <button 
                      onClick={() => handleCancelClick2(sub.id)}
                      className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-[0_0_15px_rgba(239,68,68,0.3)] transition"
                    >
                      Confirm Cancellation
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
          </div>
        ))}
      </div>
      
      <div className="mt-8 p-4 bg-white/5 border border-white/10 rounded-xl text-xs text-white/50 leading-relaxed text-center">
        <p>In accordance with the UK Digital Markets, Competition and Consumers Act (DMCCA), subscriptions can be cancelled easily with two clicks. Cancellations take effect at the end of the current billing cycle.</p>
      </div>
    </div>
  );
}
