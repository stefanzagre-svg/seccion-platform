import { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, TrendingUp, ShieldCheck, XCircle, Loader2 } from 'lucide-react';

interface SponsoredCreator {
  id: string;
  name: string;
  avatarUrl: string;
  niche: string;
  accelerator: number; // 0.0 to 1.0
  basePrice: number;
}

const MOCK_CREATORS: SponsoredCreator[] = [
  { id: '1', name: 'Aria V.', avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80', niche: 'Photography', accelerator: 0.95, basePrice: 15 },
  { id: '2', name: 'Marcus K.', avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&q=80', niche: 'Fitness', accelerator: 0.88, basePrice: 10 },
  { id: '3', name: 'Elena R.', avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80', niche: 'Music', accelerator: 0.92, basePrice: 12 },
  { id: '4', name: 'Julian M.', avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80', niche: 'Tech', accelerator: 0.75, basePrice: 8 },
];

export default function SponsoredCreators() {
  const [cancelledIds, setCancelledIds] = useState<string[]>([]);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleCancelSubscription = async (creatorId: string) => {
    setLoadingId(creatorId);
    try {
      const response = await fetch('/api/billing/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          creatorId,
          subscriberId: 'mock-subscriber-id', // Simulated current user ID
        }),
      });

      if (response.ok) {
        setCancelledIds((prev) => [...prev, creatorId]);
      } else {
        console.error('Failed to cancel subscription');
      }
    } catch (error) {
      console.error('Error during cancellation:', error);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="glass-card p-6 rounded-3xl border border-primary/20 relative overflow-hidden bg-black/40">
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[100px] rounded-full pointer-events-none" />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-black uppercase tracking-tighter flex items-center gap-2 text-white">
              <ShieldCheck className="text-primary w-5 h-5" /> Sponsored Creators
            </h2>
            <p className="text-[10px] uppercase tracking-widest text-primary/70 font-bold mt-1">
              Your Master Subscription Roster
            </p>
          </div>
          <div className="text-right">
            <span className="text-[10px] uppercase tracking-widest text-white/50">Total Bundled Value</span>
            <div className="text-lg font-black text-white">$45.00/mo</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {MOCK_CREATORS.map((creator, i) => {
            const isCancelled = cancelledIds.includes(creator.id);
            const isLoading = loadingId === creator.id;

            return (
              <motion.div
                key={creator.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`flex flex-col gap-3 p-4 rounded-2xl border transition-all duration-300 relative overflow-hidden group ${
                  isCancelled 
                    ? 'border-red-500/20 bg-red-950/5 opacity-70' 
                    : 'bg-white/5 border-white/10 hover:border-primary/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <img 
                    src={creator.avatarUrl} 
                    alt={creator.name} 
                    className="w-12 h-12 rounded-full object-cover border-2 border-transparent group-hover:border-primary transition"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-sm text-white truncate">{creator.name}</h3>
                      <span className="text-xs font-black text-white/80">${creator.basePrice}</span>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-[9px] uppercase tracking-widest text-white/40 truncate">{creator.niche}</span>
                      <div className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-success">
                        <TrendingUp className="w-3 h-3" />
                        {(creator.accelerator * 100).toFixed(0)}% Escrow
                      </div>
                    </div>
                  </div>
                </div>

                {/* Cancel Action Footer */}
                <div className="flex items-center justify-between pt-2 border-t border-white/5 mt-1">
                  {isCancelled ? (
                    <span className="text-[8px] font-black uppercase tracking-wider text-red-400 flex items-center gap-1">
                      <XCircle className="w-3.5 h-3.5" /> Auto-Renewal Inactive
                    </span>
                  ) : (
                    <span className="text-[8px] font-bold uppercase tracking-wider text-white/40">
                      Auto-renews monthly
                    </span>
                  )}

                  {!isCancelled && (
                    <button
                      onClick={() => handleCancelSubscription(creator.id)}
                      disabled={isLoading}
                      className="px-2.5 py-1 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 text-[8px] font-black uppercase tracking-widest rounded-md transition duration-200 flex items-center gap-1 disabled:opacity-50"
                    >
                      {isLoading ? (
                        <Loader2 className="w-2.5 h-2.5 animate-spin" />
                      ) : (
                        'Cancel Auto-Renew'
                      )}
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
          <div className="flex -space-x-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="w-8 h-8 rounded-full bg-white/10 border border-black flex items-center justify-center">
                <Star className="w-3 h-3 text-white/30" />
              </div>
            ))}
            <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary text-[9px] font-black flex items-center justify-center text-primary">
              +6
            </div>
          </div>
          <button className="text-[10px] font-black uppercase tracking-widest text-white/70 hover:text-white transition px-4 py-2 rounded-full bg-white/5 border border-white/10">
            Manage Roster
          </button>
        </div>
      </div>
    </div>
  );
}
