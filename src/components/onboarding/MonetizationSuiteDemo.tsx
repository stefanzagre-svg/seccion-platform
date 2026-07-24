"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Sparkles, MessageSquare, AlertTriangle, FileText, CheckCircle, HelpCircle } from "lucide-react";

interface MonetizationSuiteDemoProps {
  onComplete: () => void;
}

export default function MonetizationSuiteDemo({ onComplete }: MonetizationSuiteDemoProps) {
  const [activeTab, setActiveTab] = useState<"streams" | "ai-agent">("streams");
  const [scanState, setScanState] = useState<"idle" | "scanning" | "done">("idle");
  const [dmState, setDmState] = useState<"idle" | "answering" | "replied">("idle");

  const startContractScan = () => {
    setScanState("scanning");
    setTimeout(() => {
      setScanState("done");
    }, 2000);
  };

  const simulateDmResponse = () => {
    setDmState("answering");
    setTimeout(() => {
      setDmState("replied");
    }, 1500);
  };

  return (
    <div className="space-y-6 w-full max-w-lg mx-auto p-1">
      <div className="text-center">
        <span className="text-[10px] uppercase tracking-widest font-black text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
          Monetization Suite Overview
        </span>
        <h4 className="text-2xl font-black tracking-tight mt-2 uppercase Outfit">
          7 Streams & AI Automation
        </h4>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-white/5 border border-white/10 rounded-xl p-1">
        <button
          onClick={() => setActiveTab("streams")}
          className={`flex-1 py-2 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all ${
            activeTab === "streams" ? "bg-primary text-black" : "text-white/60 hover:text-white"
          }`}
        >
          7 Revenue Streams
        </button>
        <button
          onClick={() => setActiveTab("ai-agent")}
          className={`flex-1 py-2 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all ${
            activeTab === "ai-agent" ? "bg-primary text-black" : "text-white/60 hover:text-white"
          }`}
        >
          AI Replacements
        </button>
      </div>

      <div className="relative min-h-[300px] flex flex-col justify-between">
        <AnimatePresence mode="wait">
          {/* TAB 1: 7 Revenue Streams Comparison */}
          {activeTab === "streams" && (
            <motion.div
              key="tab-streams"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
              className="glass-card p-5 rounded-3xl border border-white/10 bg-black/40 space-y-4 flex-1"
            >
              <div className="space-y-1">
                <span className="text-[9px] font-black uppercase text-primary tracking-widest">Revenue Comparison</span>
                <h5 className="text-sm font-black uppercase text-white tracking-wide">SECCION vs Competitors</h5>
              </div>

              {/* Grid of Streams */}
              <div className="space-y-2 text-left max-h-[220px] overflow-y-auto pr-1 custom-scrollbar">
                <div className="flex justify-between items-center p-2 bg-white/5 rounded-xl border border-white/5 text-xs">
                  <span className="font-bold text-white/90">1. Subscriptions & PPV</span>
                  <span className="text-primary font-mono text-[10px] font-bold">Included</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-white/5 rounded-xl border border-white/5 text-xs">
                  <span className="font-bold text-white/90">2. Interactive Tipping</span>
                  <span className="text-primary font-mono text-[10px] font-bold">Included</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-white/5 rounded-xl border border-white/5 text-xs">
                  <span className="font-bold text-white/90">3. Private Chats & Streaming</span>
                  <span className="text-primary font-mono text-[10px] font-bold">Included</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-white/5 rounded-xl border border-white/5 text-xs">
                  <span className="font-bold text-white/90">4. Custom Request Manager</span>
                  <span className="text-primary font-mono text-[10px] font-bold">DSA Compliant</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-white/5 rounded-xl border border-white/5 text-xs">
                  <span className="font-bold text-white/90">5. Contribution Goals</span>
                  <span className="text-primary font-mono text-[10px] font-bold">Included</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-white/5 rounded-xl border border-white/5 text-xs">
                  <span className="font-bold text-white/90">6. Sponsored Creators Bundle</span>
                  <span className="text-primary font-mono text-[10px] font-bold">Up to 10 Creators</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-white/5 rounded-xl border border-white/5 text-xs">
                  <span className="font-bold text-white/90">7. AI Auto-Upsell Engine</span>
                  <span className="text-primary font-mono text-[10px] font-bold">Platform Built-In</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 2: AI Replacements Panel */}
          {activeTab === "ai-agent" && (
            <motion.div
              key="tab-ai-agent"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
              className="space-y-4 flex-1 flex flex-col justify-between"
            >
              {/* Row 1: DM Handler */}
              <div className="glass-card p-4 rounded-2xl border border-white/10 bg-black/40 space-y-3 text-left">
                <div className="flex items-center gap-1.5 text-primary">
                  <MessageSquare className="w-4 h-4" />
                  <span className="text-[9px] font-black uppercase tracking-widest">24/7 Fan DM Auto-Pilot</span>
                </div>
                
                <div className="space-y-2 text-[10px] font-medium bg-black/30 p-2.5 rounded-xl border border-white/5">
                  <div className="text-white/40">Fan: "Hey! When is the next exclusive photo drops coming?"</div>
                  
                  {dmState === "idle" && (
                    <button
                      onClick={simulateDmResponse}
                      className="py-1 px-2.5 bg-primary/20 hover:bg-primary/35 border border-primary/30 text-primary text-[8px] font-black uppercase tracking-wider rounded-lg transition-all"
                    >
                      Trigger AI Response Simulation
                    </button>
                  )}

                  {dmState === "answering" && (
                    <div className="text-primary font-mono text-[9px] animate-pulse">
                      AI replacement analyzing sentiment and matching unlocks...
                    </div>
                  )}

                  {dmState === "replied" && (
                    <div className="text-primary animate-fadeIn leading-relaxed">
                      AI response: "Hey! Dropping an exclusive preview right now. Unlock below to view once! 😉"
                      <span className="block mt-1 font-mono text-[8px] text-white/40">✓ PPV media attached automatically</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Row 2: Contract Clause Analyzer */}
              <div className="glass-card p-4 rounded-2xl border border-white/10 bg-black/40 space-y-3 text-left">
                <div className="flex items-center gap-1.5 text-primary">
                  <FileText className="w-4 h-4" />
                  <span className="text-[9px] font-black uppercase tracking-widest">AI Legal & Contract Scanner</span>
                </div>

                <div className="space-y-2 bg-black/30 p-2.5 rounded-xl border border-white/5">
                  <div className="text-[9px] text-white/60 font-mono italic leading-tight">
                    "Creator agrees to assign 50% of all future intellectual property and pay a 10% lifetime exit penalty."
                  </div>

                  {scanState === "idle" && (
                    <button
                      onClick={startContractScan}
                      className="py-1 px-2.5 bg-primary/20 hover:bg-primary/35 border border-primary/30 text-primary text-[8px] font-black uppercase tracking-wider rounded-lg transition-all"
                    >
                      Analyze Clauses
                    </button>
                  )}

                  {scanState === "scanning" && (
                    <div className="text-primary font-mono text-[9px] animate-pulse">
                      Parsing agency clauses for traps...
                    </div>
                  )}

                  {scanState === "done" && (
                    <div className="p-2 bg-red-500/10 border border-red-500/20 rounded-lg text-[9px] text-red-400 flex items-start gap-1.5 animate-fadeIn">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <div>
                        <span className="font-bold uppercase block">Commission Trap Flagged!</span>
                        Contract commission overrides default laws (lifetime penalty clause matches block).
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Done Button */}
      <button
        onClick={onComplete}
        className="w-full mt-4 bg-primary text-black font-black uppercase tracking-widest py-4 rounded-xl hover:shadow-[0_0_20px_rgba(102,252,241,0.4)] transition text-xs flex items-center justify-center gap-2"
      >
        <Sparkles className="w-4 h-4 text-black" />
        Finish Studio Tour
      </button>
    </div>
  );
}
