'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, MapPin, Video, Globe, Loader2, Sparkles, AlertTriangle, ShieldCheck } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { checkUserQuota } from '@/lib/date-plan-db';

interface CreateDatePlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  userRole: 'member' | 'creator';
  onPlanCreated: () => Promise<void>;
}

export default function CreateDatePlanModal({
  isOpen,
  onClose,
  userId,
  userRole,
  onPlanCreated
}: CreateDatePlanModalProps) {
  // Quota states
  const [checkingQuota, setCheckingQuota] = useState(true);
  const [quotaAllowed, setQuotaAllowed] = useState(false);
  const [quotaCount, setQuotaCount] = useState(0);

  // Form states
  const [intentType, setIntentType] = useState<'Offer' | 'LookingFor'>('Offer');
  const [planScope, setPlanScope] = useState<'In-Person' | 'Digital Screen' | 'Hybrid'>('Hybrid');
  const [description, setDescription] = useState('');
  const [maxApplications, setMaxApplications] = useState(5);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  
  // Tag / suggestion moves states
  const [availableMoves, setAvailableMoves] = useState<any[]>([]);
  const [selectedMoves, setSelectedMoves] = useState<string[]>([]);
  const [loadingMoves, setLoadingMoves] = useState(true);

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Check quota on mount or open
  useEffect(() => {
    if (!isOpen || !userId) return;

    const runQuotaCheck = async () => {
      setCheckingQuota(true);
      const res = await checkUserQuota(userId, userRole);
      setQuotaAllowed(res.allowed);
      setQuotaCount(res.count);
      setCheckingQuota(false);
    };

    runQuotaCheck();
  }, [isOpen, userId, userRole]);

  // Load suggestion moves from db on mount
  useEffect(() => {
    const loadMoves = async () => {
      setLoadingMoves(true);
      try {
        const { data, error } = await supabase
          .from('suggestion_moves')
          .select('*')
          .order('relationship_level', { ascending: true });
        
        if (!error && data) {
          setAvailableMoves(data);
        }
      } catch (err) {
        console.error('Failed to load suggestion moves:', err);
      } finally {
        setLoadingMoves(false);
      }
    };

    loadMoves();
  }, []);

  const handleToggleMove = (moveId: string) => {
    setSelectedMoves(prev => 
      prev.includes(moveId) 
        ? prev.filter(id => id !== moveId) 
        : [...prev, moveId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    setFormError(null);

    // Validation
    if (!description.trim()) {
      setFormError('Please enter a description for the date plan.');
      return;
    }
    if (description.length > 200) {
      setFormError('Description must be 200 characters or less.');
      return;
    }
    if (!startTime || !endTime) {
      setFormError('Please select both start and end times.');
      return;
    }

    const start = new Date(startTime);
    const end = new Date(endTime);
    const now = new Date();

    if (start <= now) {
      setFormError('Start time must be in the future.');
      return;
    }
    if (end <= start) {
      setFormError('End time must be after the start time.');
      return;
    }
    if (maxApplications < 1 || maxApplications > 10) {
      setFormError('Capacity must be between 1 and 10.');
      return;
    }

    setSubmitting(true);

    try {
      const payload: any = {
        poster_user_uuid: userId,
        intent_type: intentType,
        plan_scope: planScope,
        start_timestamp_utc: start.toISOString(),
        end_timestamp_utc: end.toISOString(),
        max_applications_int: maxApplications,
        allowed_move_tags_array: selectedMoves,
        description: description.trim(),
        plan_status: 'New',
        applicants_waiting_list: []
      };

      const { error } = await supabase
        .from('session_intent_plans')
        .insert(payload);

      if (error) throw error;

      await onPlanCreated();
      onClose();
    } catch (err: any) {
      console.error('Failed to create date plan:', err);
      setFormError(err.message || 'An error occurred while creating the date plan.');
    } finally {
      setSubmitting(false);
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

        {/* Modal content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-lg bg-[#0a0a0a]/90 border border-white/10 rounded-[2.5rem] p-6 shadow-2xl overflow-hidden z-10 max-h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className="flex justify-between items-center pb-4 border-b border-white/5 shrink-0">
            <div className="flex items-center gap-2">
              <Calendar className="text-primary w-5 h-5 animate-pulse" />
              <h3 className="text-sm font-black uppercase tracking-widest text-white">
                Create Date Plan
              </h3>
            </div>
            <button 
              onClick={onClose}
              className="p-1.5 rounded-xl bg-white/5 border border-white/10 text-white/50 hover:text-white transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Form Area */}
          <div className="flex-1 overflow-y-auto pr-1 py-4 space-y-5">
            {checkingQuota ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-primary animate-spin mb-2" />
                <p className="text-[10px] text-white/50 uppercase tracking-wider font-bold">Checking your monthly drops...</p>
              </div>
            ) : !quotaAllowed ? (
              <div className="p-5 bg-red-950/20 border border-red-500/20 rounded-2xl space-y-4 text-center">
                <AlertTriangle className="w-10 h-10 text-red-500 mx-auto animate-bounce" />
                <h4 className="text-xs font-black uppercase tracking-wider text-red-400">Monthly Drop Limit Hit</h4>
                <p className="text-[10px] text-white/60 leading-relaxed font-medium">
                  Free accounts get 1 Date Plan a month — keeps connections premium and intentional. 
                  You have already created {quotaCount} plan(s) this month.
                </p>
                <div className="p-3 bg-white/5 border border-white/5 rounded-xl flex items-center justify-between text-left">
                  <div>
                    <p className="text-[9px] font-black uppercase text-primary">Master Subscription</p>
                    <p className="text-[8px] text-white/40 font-medium">Unlock unlimited Date Plans and VIP content access</p>
                  </div>
                  <button 
                    type="button" 
                    onClick={onClose}
                    className="px-3 py-1.5 bg-primary text-black font-black uppercase text-[8px] tracking-wider rounded-lg transition hover:shadow-[0_0_10px_rgba(102,252,241,0.4)]"
                  >
                    Upgrade
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {formError && (
                  <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl text-[10px] font-semibold flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                {/* Intent Type */}
                <div className="space-y-1.5">
                  <label className="text-[9px] uppercase tracking-widest font-black text-white/40">Intent Type</label>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setIntentType('Offer')}
                      className={`flex-1 py-3 rounded-xl border text-[10px] font-black uppercase tracking-wider transition ${
                        intentType === 'Offer'
                          ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.15)]'
                          : 'bg-white/5 border-white/5 text-white/40 hover:text-white'
                      }`}
                    >
                      Offer (I am proposing)
                    </button>
                    <button
                      type="button"
                      onClick={() => setIntentType('LookingFor')}
                      className={`flex-1 py-3 rounded-xl border text-[10px] font-black uppercase tracking-wider transition ${
                        intentType === 'LookingFor'
                          ? 'bg-pink-500/10 border-pink-500 text-pink-400 shadow-[0_0_15px_rgba(236,72,153,0.15)]'
                          : 'bg-white/5 border-white/5 text-white/40 hover:text-white'
                      }`}
                    >
                      Looking For (I am seeking)
                    </button>
                  </div>
                </div>

                {/* Scope */}
                <div className="space-y-1.5">
                  <label className="text-[9px] uppercase tracking-widest font-black text-white/40">Plan Scope</label>
                  <div className="flex gap-2">
                    {[
                      { value: 'In-Person' as const, icon: MapPin, color: 'text-red-400' },
                      { value: 'Digital Screen' as const, icon: Video, color: 'text-blue-400' },
                      { value: 'Hybrid' as const, icon: Globe, color: 'text-emerald-400' }
                    ].map(scope => {
                      const Icon = scope.icon;
                      const active = planScope === scope.value;
                      return (
                        <button
                          key={scope.value}
                          type="button"
                          onClick={() => setPlanScope(scope.value)}
                          className={`flex-1 py-3 border rounded-xl flex flex-col items-center gap-1.5 transition ${
                            active
                              ? 'bg-primary/10 border-primary text-primary shadow-[0_0_15px_rgba(102,252,241,0.1)]'
                              : 'bg-white/5 border-white/5 text-white/40 hover:text-white'
                          }`}
                        >
                          <Icon className={`w-4 h-4 ${scope.color}`} />
                          <span className="text-[8px] font-black uppercase tracking-wider">{scope.value}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[9px] uppercase tracking-widest font-black text-white/40">
                    <label>Description</label>
                    <span>{description.length}/200</span>
                  </div>
                  <textarea
                    value={description}
                    onChange={e => setDescription(e.target.value.slice(0, 200))}
                    placeholder="Describe the plan (e.g. Proposing a quiet coffee date...)"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-3 text-xs text-white placeholder:text-white/30 outline-none focus:border-primary/50 transition h-20 resize-none"
                  />
                </div>

                {/* Capacity */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[9px] uppercase tracking-widest font-black text-white/40">
                    <label>Max Shortlist Size</label>
                    <span>{maxApplications} Candidates</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min={1}
                      max={10}
                      value={maxApplications}
                      onChange={e => setMaxApplications(Number(e.target.value))}
                      className="flex-1 accent-primary bg-white/10 h-1 rounded-lg outline-none"
                    />
                    <span className="w-8 text-center text-xs font-bold text-white bg-white/5 border border-white/10 py-1 rounded-lg">{maxApplications}</span>
                  </div>
                </div>

                {/* Timing */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[9px] uppercase tracking-widest font-black text-white/40">Start Date & Time</label>
                    <input
                      type="datetime-local"
                      value={startTime}
                      onChange={e => setStartTime(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-[10px] text-white/80 outline-none focus:border-primary/50 transition"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] uppercase tracking-widest font-black text-white/40">End Date & Time</label>
                    <input
                      type="datetime-local"
                      value={endTime}
                      onChange={e => setEndTime(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-[10px] text-white/80 outline-none focus:border-primary/50 transition"
                    />
                  </div>
                </div>

                {/* Allowed Move Tags */}
                <div className="space-y-2">
                  <label className="text-[9px] uppercase tracking-widest font-black text-white/40">Allowed moves (Required relationship status)</label>
                  <div className="max-h-36 overflow-y-auto p-2 bg-black/40 border border-white/5 rounded-2xl space-y-3">
                    {loadingMoves ? (
                      <div className="flex justify-center items-center py-4">
                        <Loader2 className="w-4 h-4 text-primary animate-spin" />
                      </div>
                    ) : (
                      ['acquaintance', 'friendly', 'close', 'intimate', 'passionate', 'committed', 'soulmate'].map(level => {
                        const levelMoves = availableMoves.filter(m => m.relationship_level === level);
                        if (levelMoves.length === 0) return null;
                        return (
                          <div key={level} className="space-y-1">
                            <p className="text-[7px] uppercase font-black tracking-widest text-primary/75">{level}</p>
                            <div className="flex flex-wrap gap-1">
                              {levelMoves.map(move => {
                                const active = selectedMoves.includes(move.id);
                                return (
                                  <button
                                    key={move.id}
                                    type="button"
                                    onClick={() => handleToggleMove(move.id)}
                                    className={`px-2 py-1 rounded-xl text-[8px] flex items-center gap-1 transition ${
                                      active 
                                        ? 'bg-primary/20 border border-primary text-primary font-bold shadow-[0_0_10px_rgba(102,252,241,0.2)]'
                                        : 'bg-white/5 border border-white/5 text-white/50 hover:text-white'
                                    }`}
                                  >
                                    <span>{move.emoji || '📍'}</span>
                                    <span>{move.label}</span>
                                    {move.kyc_required && (
                                      <span title="Verification Required">
                                        <ShieldCheck className="w-2.5 h-2.5 text-yellow-500" />
                                      </span>
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3 bg-primary text-black font-black uppercase text-[10px] tracking-widest rounded-xl hover:shadow-[0_0_20px_rgba(102,252,241,0.5)] transition duration-300 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> Publishing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" /> Publish Date Plan
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
