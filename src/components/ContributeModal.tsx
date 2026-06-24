'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, DollarSign, Gift, Loader2, Sparkles, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { CreatorGoal } from './CreatorGoalProgress';

interface ContributeModalProps {
  isOpen: boolean;
  onClose: () => void;
  goal: CreatorGoal;
  contributorId: string;
  onSuccess?: () => void;
}

export default function ContributeModal({ isOpen, onClose, goal, contributorId, onSuccess }: ContributeModalProps) {
  const [amount, setAmount] = useState<string>('25');
  const [message, setMessage] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const presets = ['5', '10', '25', '50', '100'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setErrorMsg('Please enter a valid contribution amount.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      // 1. Insert the contribution log
      const { error: contribError } = await supabase
        .from('goal_contributions')
        .insert({
          goal_id: goal.id,
          contributor_id: contributorId,
          amount: parsedAmount,
          message: message.trim() || null
        });

      if (contribError) throw contribError;

      // 2. Fetch the current amount to update it accurately (prevent race condition overwrite)
      const { data: currentGoal, error: goalFetchError } = await supabase
        .from('creator_goals')
        .select('current_amount, target_amount')
        .eq('id', goal.id)
        .single();

      if (goalFetchError) throw goalFetchError;

      const newAmount = Number(currentGoal.current_amount || 0) + parsedAmount;
      const isCompletedNow = newAmount >= Number(currentGoal.target_amount);

      // 3. Update the goal progress
      const { error: updateGoalError } = await supabase
        .from('creator_goals')
        .update({
          current_amount: newAmount,
          is_completed: isCompletedNow
        })
        .eq('id', goal.id);

      if (updateGoalError) throw updateGoalError;

      // 4. Reward Member with Connection Points (+50 Points)
      const { data: memberProfile } = await supabase
        .from('profiles')
        .select('connection_points')
        .eq('id', contributorId)
        .single();

      if (memberProfile) {
        const currentPoints = memberProfile.connection_points || 0;
        await supabase
          .from('profiles')
          .update({ connection_points: currentPoints + 50 })
          .eq('id', contributorId);
      }

      setIsSuccess(true);
      if (onSuccess) {
        onSuccess();
      }

      setTimeout(() => {
        setIsSuccess(false);
        setAmount('25');
        setMessage('');
        onClose();
      }, 2000);

    } catch (err: any) {
      console.error('Contribution failed:', err);
      setErrorMsg(err.message || 'An unexpected error occurred during processing.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className="w-full max-w-md relative bg-zinc-950 border border-white/10 rounded-[2.5rem] overflow-hidden p-8 shadow-[0_0_50px_rgba(0,0,0,0.8)] z-10"
        >
          {/* Close Button */}
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>

          {!isSuccess ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="text-center mb-4">
                <div className="w-12 h-12 rounded-3xl bg-primary/20 text-primary flex items-center justify-center mx-auto mb-3 border border-primary/20 shadow-[0_0_15px_rgba(255,0,127,0.2)]">
                  <Gift className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-black text-white tracking-tight">Sponsor Creator Goal</h3>
                <p className="text-[10px] text-white/50 uppercase tracking-wider font-bold mt-1 max-w-xs mx-auto line-clamp-1">
                  Target: {goal.title}
                </p>
              </div>

              {/* Amount Selection */}
              <div className="space-y-3">
                <label className="text-[10px] text-white/40 uppercase tracking-widest font-black block">
                  Select Amount
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {presets.map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setAmount(p)}
                      className={`py-2 rounded-xl text-xs font-black transition-all ${
                        amount === p 
                          ? 'bg-primary text-white shadow-[0_0_15px_rgba(255,0,127,0.4)] scale-105' 
                          : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      ${p}
                    </button>
                  ))}
                </div>

                {/* Custom Input */}
                <div className="relative mt-2">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 font-bold">$</div>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    placeholder="Enter custom amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 focus:border-primary/50 outline-none rounded-xl py-3 pl-8 pr-4 text-sm font-bold text-white transition"
                  />
                </div>
              </div>

              {/* Support Message */}
              <div className="space-y-2">
                <label className="text-[10px] text-white/40 uppercase tracking-widest font-black block">
                  Support Message (Optional)
                </label>
                <textarea
                  maxLength={140}
                  rows={3}
                  placeholder="Words of encouragement..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 focus:border-primary/50 outline-none rounded-xl p-3 text-xs text-white placeholder-white/30 resize-none transition"
                />
                <div className="text-right text-[9px] text-white/30 font-bold uppercase">
                  {message.length} / 140
                </div>
              </div>

              {errorMsg && (
                <div className="text-xs text-red-500 bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-xl text-center font-bold">
                  {errorMsg}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-gradient-to-r from-primary to-pink-500 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:brightness-110 active:scale-95 disabled:opacity-50 disabled:pointer-events-none transition-all duration-300 flex items-center justify-center gap-2 border border-primary/20 shadow-[0_0_20px_rgba(255,0,127,0.3)]"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing Payment...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 fill-current" />
                    Confirm Sponsorship
                  </>
                )}
              </button>
            </form>
          ) : (
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center py-8 flex flex-col items-center"
            >
              <div className="w-16 h-16 bg-success/20 text-success rounded-full flex items-center justify-center mb-6 border border-success/20 animate-bounce">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-black text-white tracking-tight mb-2">Contribution Successful!</h3>
              <p className="text-xs text-white/50 max-w-xs uppercase leading-relaxed font-bold tracking-wider mb-2">
                Thank you for sponsoring this creator goal.
              </p>
              <span className="text-[10px] text-primary font-black uppercase bg-primary/10 px-3 py-1 rounded-full border border-primary/20 animate-pulse">
                +50 Connection Points Awarded
              </span>
            </motion.div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
