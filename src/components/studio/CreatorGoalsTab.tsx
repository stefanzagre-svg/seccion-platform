"use client";

import React from 'react';
import { Crown, Plus, Loader2, Sparkles, Activity } from 'lucide-react';
import CreatorGoalProgress, { type CreatorGoal } from '@/components/CreatorGoalProgress';

interface CreatorGoalsTabProps {
  goals: CreatorGoal[];
  contributions: any[];
  isLoadingGoals: boolean;
  isCreatingGoal: boolean;
  newGoalTitle: string;
  setNewGoalTitle: (val: string) => void;
  newGoalDesc: string;
  setNewGoalDesc: (val: string) => void;
  newGoalTarget: string;
  setNewGoalTarget: (val: string) => void;
  goalError: string | null;
  handleCreateGoal: (e: React.FormEvent) => Promise<void>;
}

export const CreatorGoalsTab: React.FC<CreatorGoalsTabProps> = ({
  goals,
  contributions,
  isLoadingGoals,
  isCreatingGoal,
  newGoalTitle,
  setNewGoalTitle,
  newGoalDesc,
  setNewGoalDesc,
  newGoalTarget,
  setNewGoalTarget,
  goalError,
  handleCreateGoal,
}) => {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-black tracking-tighter uppercase mb-2">
          <Crown className="text-primary inline-block mr-2 w-6 h-6 align-text-bottom" /> Crowdfunding Goals
        </h2>
        <p className="text-[10px] text-white/40 uppercase font-black tracking-widest mt-1">
          Launch campaigns and track member-backed funding progress
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Create Goal Form */}
        <div className="space-y-6">
          <div className="glass-card p-6 bg-white/2 border border-white/5 rounded-3xl space-y-6">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white/80 flex items-center gap-2 pb-3 border-b border-white/5">
              <Plus className="w-4 h-4 text-primary" /> Create New Goal
            </h3>

            <form onSubmit={handleCreateGoal} className="space-y-4">
              <div className="space-y-2">
                <label className="text-[9px] font-black text-white/40 uppercase tracking-widest">Goal Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. New Streaming Microphone"
                  value={newGoalTitle}
                  onChange={e => setNewGoalTitle(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-xs font-bold text-white outline-none focus:border-primary transition"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-black text-white/40 uppercase tracking-widest">Description</label>
                <textarea
                  rows={3}
                  placeholder="Tell your fans why you're raising these funds..."
                  value={newGoalDesc}
                  onChange={e => setNewGoalDesc(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-xs text-white placeholder-white/30 resize-none outline-none focus:border-primary transition"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-black text-white/40 uppercase tracking-widest">Target Amount ($)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 text-xs font-black font-mono">$</span>
                  <input
                    type="number"
                    required
                    min="1"
                    step="0.01"
                    placeholder="150.00"
                    value={newGoalTarget}
                    onChange={e => setNewGoalTarget(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl pl-8 pr-6 py-3.5 text-xs font-mono text-white outline-none focus:border-primary transition"
                  />
                </div>
              </div>

              {goalError && (
                <div className="text-xs text-red-500 bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-xl text-center font-bold">
                  {goalError}
                </div>
              )}

              <button
                type="submit"
                disabled={isCreatingGoal}
                className="w-full py-3 bg-gradient-to-r from-primary to-pink-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg hover:brightness-110 active:scale-98 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isCreatingGoal ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 fill-current" />}
                Launch Campaign
              </button>
            </form>
          </div>
        </div>

        {/* Active & Past Goals List */}
        <div className="space-y-6">
          <div className="glass-card p-6 bg-white/2 border border-white/5 rounded-3xl space-y-6">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white/80 flex items-center gap-2 pb-3 border-b border-white/5">
              <Activity className="w-4 h-4 text-accent" /> Active Campaigns ({goals.length})
            </h3>

            {isLoadingGoals ? (
              <div className="py-12 flex flex-col items-center justify-center space-y-3">
                <Loader2 className="w-6 h-6 text-accent animate-spin" />
                <p className="text-[9px] font-black uppercase tracking-widest text-white/40">Syncing goals from DB...</p>
              </div>
            ) : goals.length === 0 ? (
              <div className="py-12 text-center text-white/40 text-xs uppercase tracking-widest font-black">
                No goals configured yet.
              </div>
            ) : (
              <div className="space-y-6 max-h-[450px] overflow-y-auto pr-2 scrollbar-thin">
                {goals.map(goal => (
                  <div key={goal.id} className="space-y-3">
                    <CreatorGoalProgress goal={goal} isOwner={true} />

                    {contributions.filter(c => c.goal_id === goal.id).length > 0 && (
                      <div className="pl-4 border-l border-white/10 space-y-2">
                        <p className="text-[8px] font-black text-white/40 uppercase tracking-widest">Goal Backers</p>
                        {contributions
                          .filter(c => c.goal_id === goal.id)
                          .map(c => (
                            <div key={c.id} className="flex items-start gap-2 bg-white/2 p-2 rounded-xl border border-white/5 text-[10px]">
                              <div className="w-6 h-6 rounded-full overflow-hidden shrink-0 border border-white/10">
                                <img
                                  src={c.contributor_profile?.avatar_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80'}
                                  alt={c.contributor_profile?.username}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-center">
                                  <span className="font-bold text-white">@{c.contributor_profile?.display_name || c.contributor_profile?.username}</span>
                                  <span className="font-black text-success">+${Number(c.amount).toFixed(2)}</span>
                                </div>
                                {c.message && (
                                  <p className="text-[9px] text-white/60 font-medium mt-0.5 leading-tight">
                                    "{c.message}"
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatorGoalsTab;
