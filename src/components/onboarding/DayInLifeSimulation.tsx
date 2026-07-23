"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, MessageSquare, Check, X, Shield, Lock, Bell } from "lucide-react";

interface DayInLifeSimulationProps {
  onComplete: () => void;
}

export default function DayInLifeSimulation({ onComplete }: DayInLifeSimulationProps) {
  const [currentFrame, setCurrentFrame] = useState(1);
  const [typedMessage, setTypedMessage] = useState("");
  const [partnerMessage, setPartnerMessage] = useState("");
  const [showConfetti, setShowConfetti] = useState(false);

  // Auto typing animation for frame 3 (Chat)
  useEffect(() => {
    if (currentFrame === 3) {
      setTypedMessage("");
      setPartnerMessage("");
      const userText = "Hey! Loved your profile. Do you really write poems on napkins?";
      const partnerText = "Haha, yes! Napkins are the best canvas. What's your napkin vibe?";
      
      let uIdx = 0;
      let pIdx = 0;
      
      const userInterval = setInterval(() => {
        if (uIdx < userText.length) {
          setTypedMessage((prev) => prev + userText.charAt(uIdx));
          uIdx++;
        } else {
          clearInterval(userInterval);
          // Wait 1s, then simulate partner typing
          setTimeout(() => {
            const partnerInterval = setInterval(() => {
              if (pIdx < partnerText.length) {
                setPartnerMessage((prev) => prev + partnerText.charAt(pIdx));
                pIdx++;
              } else {
                clearInterval(partnerInterval);
              }
            }, 50);
          }, 1000);
        }
      }, 50);

      return () => {
        clearInterval(userInterval);
      };
    }
  }, [currentFrame]);

  // Confetti triggering on frame 5
  useEffect(() => {
    if (currentFrame === 5) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [currentFrame]);

  const nextFrame = () => {
    if (currentFrame < 6) {
      setCurrentFrame((prev) => prev + 1);
    } else {
      onComplete();
    }
  };

  const prevFrame = () => {
    if (currentFrame > 1) {
      setCurrentFrame((prev) => prev - 1);
    }
  };

  return (
    <div className="space-y-6 w-full max-w-lg mx-auto p-1">
      <div className="text-center">
        <span className="text-[10px] uppercase tracking-widest font-black text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
          Part 2: SECCIØN Day-In-The-Life
        </span>
        <h4 className="text-2xl font-black tracking-tight mt-2 uppercase Outfit">
          Experience a Day on SECCIØN
        </h4>
      </div>

      <div className="glass-card min-h-[380px] p-6 rounded-3xl border border-white/10 bg-black/40 flex flex-col justify-between relative overflow-hidden">
        {/* Confetti Animation Layer */}
        {showConfetti && (
          <div className="absolute inset-0 pointer-events-none z-50 flex items-center justify-center">
            {Array.from({ length: 20 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute text-xl"
                initial={{
                  x: 0,
                  y: -100,
                  scale: 0,
                  opacity: 1
                }}
                animate={{
                  x: (Math.random() - 0.5) * 300,
                  y: Math.random() * 200 - 50,
                  scale: [0, 1.2, 0.8],
                  opacity: [1, 1, 0]
                }}
                transition={{
                  duration: 2.5,
                  ease: "easeOut",
                  delay: Math.random() * 0.2
                }}
              >
                {["🎉", "✨", "🔥", "💖", "⚡"][i % 5]}
              </motion.div>
            ))}
          </div>
        )}

        <AnimatePresence mode="wait">
          {/* FRAME 1: Wake Up Notification */}
          {currentFrame === 1 && (
            <motion.div
              key="frame-1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6 flex-1 flex flex-col justify-center"
            >
              <div className="flex justify-center">
                <div className="p-4 bg-primary/10 rounded-full text-primary animate-bounce">
                  <Bell className="w-8 h-8" />
                </div>
              </div>
              <div className="glass-card p-4 rounded-2xl border border-primary/20 bg-primary/5 space-y-2 max-w-sm mx-auto text-left shadow-[0_0_15px_rgba(0,255,255,0.1)]">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-black tracking-widest text-primary">AI Wingman</span>
                  <span className="text-[9px] text-white/40">9:30 AM</span>
                </div>
                <h5 className="text-xs font-black uppercase text-white">Synergy Aura Flared Overnight ⚡</h5>
                <p className="text-[11px] text-white/70 leading-relaxed font-medium">
                  Two creative souls are glowing in sync with your vibe. Your next Co-Op quest awaits. Step inside.
                </p>
              </div>
              <p className="text-[10px] text-white/40 text-center font-mono">
                Slide 1/6: Wake up to vibe matches
              </p>
            </motion.div>
          )}

          {/* FRAME 2: The Swipe Deck */}
          {currentFrame === 2 && (
            <motion.div
              key="frame-2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6 flex-1 flex flex-col justify-between"
            >
              <div className="text-center space-y-2">
                <span className="text-[10px] uppercase font-black text-primary tracking-widest block">
                  Synergy Aura Swiper
                </span>
                <p className="text-[11px] text-white/50 leading-relaxed max-w-sm mx-auto font-medium">
                  We ditch the mathematical score. Feel the connection directly through the glowing Synergy Aura of each profile.
                </p>
              </div>

              {/* Profile Card Mock */}
              <div className="w-56 h-36 bg-gradient-to-br from-purple-950 to-slate-900 border border-white/10 rounded-2xl mx-auto relative overflow-hidden flex flex-col justify-between p-4 shadow-xl">
                {/* Glowing border simulation */}
                <div className="absolute inset-0 border border-primary/40 rounded-2xl blur-[1px] animate-pulse pointer-events-none" />
                <div className="flex justify-between items-start z-10">
                  <div>
                    <h5 className="text-xs font-black uppercase text-white">Valentina, 24</h5>
                    <span className="text-[8px] bg-cyan-400/10 border border-cyan-400/20 text-cyan-400 px-1.5 py-0.5 rounded font-black tracking-widest">
                      CREATIVE
                    </span>
                  </div>
                  <span className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-primary/10 border border-primary/30 text-primary">
                    ⚡ High Spark
                  </span>
                </div>
                <div className="flex gap-2 z-10">
                  <button className="p-1.5 bg-red-500/20 hover:bg-red-500/40 border border-red-500/30 rounded-lg text-red-400 transition">
                    <X className="w-4 h-4" />
                  </button>
                  <button className="flex-1 py-1 px-2 bg-primary/20 hover:bg-primary/45 border border-primary/30 rounded-lg text-[9px] font-black uppercase tracking-widest text-primary transition">
                    Accept Vibe
                  </button>
                </div>
              </div>
              <p className="text-[10px] text-white/40 text-center font-mono">
                Slide 2/6: Synergy Aura Vibe Matching
              </p>
            </motion.div>
          )}

          {/* FRAME 3: First Chat */}
          {currentFrame === 3 && (
            <motion.div
              key="frame-3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4 flex-1 flex flex-col justify-between"
            >
              <div className="space-y-1 text-center">
                <span className="text-[10px] uppercase font-black text-primary tracking-widest block">
                  Simulated Conversation
                </span>
              </div>

              {/* Chat bubbles */}
              <div className="space-y-3 max-w-sm mx-auto w-full px-2 text-left">
                {typedMessage && (
                  <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="p-3 bg-white/5 border border-white/10 rounded-2xl rounded-tr-none ml-8 text-[11px] text-white/90 leading-relaxed font-medium"
                  >
                    {typedMessage}
                  </motion.div>
                )}
                {partnerMessage && (
                  <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="p-3 bg-primary/5 border border-primary/20 rounded-2xl rounded-tl-none mr-8 text-[11px] text-primary leading-relaxed font-medium flex gap-2"
                  >
                    <span>{partnerMessage}</span>
                  </motion.div>
                )}
              </div>
              <p className="text-[10px] text-white/40 text-center font-mono">
                Slide 3/6: Conversational text simulation
              </p>
            </motion.div>
          )}

          {/* FRAME 4: Synergy Aura Alignment */}
          {currentFrame === 4 && (
            <motion.div
              key="frame-4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6 flex-1 flex flex-col justify-between"
            >
              <div className="text-center space-y-2">
                <span className="text-[10px] uppercase font-black text-primary tracking-widest block">
                  Synergy Aura Fusion
                </span>
                <p className="text-[11px] text-white/50 leading-relaxed max-w-sm mx-auto font-medium">
                  Auras adapt organically as you converse. Share authentic stories and watch the neon cyan and pink energy merge into a perfect sync.
                </p>
              </div>

              {/* Synergy Aura overlapping circles */}
              <div className="flex justify-center items-center py-2 relative">
                <div className="relative w-32 h-20 flex justify-center items-center">
                  {/* Left Circle (Cyan) */}
                  <motion.div
                    animate={{
                      scale: [1, 1.05, 1],
                      opacity: [0.7, 0.9, 0.7],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className="absolute left-4 w-16 h-16 rounded-full bg-cyan-500/20 border border-cyan-400/30 blur-sm shadow-[0_0_20px_rgba(6,182,212,0.4)]"
                  />
                  {/* Right Circle (Pink) */}
                  <motion.div
                    animate={{
                      scale: [1, 1.08, 1],
                      opacity: [0.6, 0.8, 0.6],
                    }}
                    transition={{
                      duration: 3.5,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className="absolute right-4 w-16 h-16 rounded-full bg-pink-500/20 border border-pink-400/30 blur-sm shadow-[0_0_20px_rgba(236,72,153,0.4)]"
                  />
                  {/* Synergy flare intersection */}
                  <motion.div
                    animate={{
                      scale: [0.9, 1.1, 0.9],
                      opacity: [0.8, 1, 0.8],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className="absolute w-8 h-8 rounded-full bg-white/40 blur-md shadow-[0_0_20px_rgba(255,255,255,0.7)] z-10 flex items-center justify-center text-[10px]"
                  >
                    💖
                  </motion.div>
                </div>
              </div>

              <div className="text-center">
                <span className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1 bg-primary/10 border border-primary/20 text-primary rounded-xl">
                  ⚡ Perfect Sync
                </span>
              </div>

              <p className="text-[10px] text-white/40 text-center font-mono">
                Slide 4/6: Synergy Aura glowing in real-time
              </p>
            </motion.div>
          )}

          {/* FRAME 5: Chemistry Level Up */}
          {currentFrame === 5 && (
            <motion.div
              key="frame-5"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6 flex-1 flex flex-col justify-center"
            >
              <div className="text-center space-y-3">
                <span className="text-[10px] uppercase font-black text-primary tracking-widest block">
                  Chemistry Meter Level Up
                </span>
                <div className="text-4xl font-black font-mono text-glow text-white">
                  L4 ➔ L6
                </div>
                <div className="max-w-xs mx-auto h-3 bg-white/5 border border-white/10 rounded-full p-[2px]">
                  <motion.div
                    className="h-full bg-gradient-to-r from-cyan-500 to-purple-600 rounded-full"
                    initial={{ width: "50%" }}
                    animate={{ width: "75%" }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                  />
                </div>
                <p className="text-[11px] text-white/70 leading-relaxed font-medium">
                  Co-op mode synergy level up! You can't level up if they are AFK, but you both invested effort.
                </p>
              </div>
              <p className="text-[10px] text-white/40 text-center font-mono">
                Slide 5/6: Chemistry Meter leveling up
              </p>
            </motion.div>
          )}

          {/* FRAME 6: Moves Unlock */}
          {currentFrame === 6 && (
            <motion.div
              key="frame-6"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4 flex-1 flex flex-col justify-between"
            >
              <div className="text-center space-y-2">
                <span className="text-[10px] uppercase font-black text-primary tracking-widest block">
                  Level 6 Co-Op Quests Unlocked
                </span>
                <p className="text-[11px] text-white/50 leading-relaxed max-w-sm mx-auto font-medium">
                  Depth equals access. New real-world relationship quests unlock automatically as your connection deepens.
                </p>
              </div>

              {/* Grid of Unlocked Moves */}
              <div className="grid grid-cols-2 gap-2 max-w-xs mx-auto w-full">
                <div className="p-3 bg-primary/5 border border-primary/20 rounded-xl flex items-center justify-between text-xs font-bold text-primary">
                  <span>☕ Coffee Date</span>
                  <Check className="w-3.5 h-3.5 text-primary" />
                </div>
                <div className="p-3 bg-primary/5 border border-primary/20 rounded-xl flex items-center justify-between text-xs font-bold text-primary">
                  <span>🚶 City Walk</span>
                  <Check className="w-3.5 h-3.5 text-primary" />
                </div>
                <div className="p-3 bg-primary/5 border border-primary/20 rounded-xl flex items-center justify-between text-xs font-bold text-primary">
                  <span>✈️ Trip Abroad</span>
                  <Check className="w-3.5 h-3.5 text-primary" />
                </div>
                <div className="p-3 bg-white/5 border border-white/10 rounded-xl flex items-center justify-between text-xs font-bold text-white/40">
                  <span>🔒 Business Collab</span>
                  <Lock className="w-3 h-3 text-white/30" />
                </div>
              </div>
              <p className="text-[10px] text-white/40 text-center font-mono">
                Slide 6/6: Relationship Skill Tree Unlocked
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation Controls */}
        <div className="flex justify-between items-center pt-4 border-t border-white/5 mt-4">
          <button
            onClick={prevFrame}
            disabled={currentFrame === 1}
            className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-white/50 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition"
          >
            Back
          </button>
          <button
            onClick={nextFrame}
            className="px-6 py-2.5 bg-primary text-black font-black uppercase tracking-widest rounded-xl hover:shadow-[0_0_15px_rgba(102,252,241,0.3)] transition text-[10px] flex items-center gap-1"
          >
            {currentFrame === 6 ? "Finish Quest" : "Continue"}
          </button>
        </div>
      </div>
    </div>
  );
}
