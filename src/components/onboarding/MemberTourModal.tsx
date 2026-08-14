"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, 
  ChevronRight, 
  ChevronLeft, 
  Sparkles, 
  ShieldCheck, 
  EyeOff, 
  Lock, 
  Unlock, 
  Check, 
  Mic, 
  TrendingUp, 
  HelpCircle,
  Heart,
  Star,
  User,
  Coffee,
  Compass,
  Trophy,
  Camera,
  Activity,
  Bot,
  Plus
} from "lucide-react";

// Helper Info Bubble Tooltip
function InfoBubble({ title, content }: { title: string; content: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative inline-block z-30 mx-1">
      <button
        type="button"
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        onClick={() => setIsOpen(!isOpen)}
        className="w-5 h-5 rounded-full bg-[#00fbfb]/15 border border-[#00fbfb]/60 text-[#00fbfb] hover:bg-[#00fbfb]/30 hover:border-[#00fbfb] flex items-center justify-center text-xs font-bold font-mono transition-all cursor-pointer shadow-[0_0_10px_rgba(0,251,251,0.2)]"
      >
        ?
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -5 }}
            className="absolute bottom-full left-0 sm:left-1/2 sm:-translate-x-1/2 mb-2 w-60 sm:w-64 max-w-[80vw] p-3 bg-[#0c0c18] border border-[#00fbfb]/30 rounded-xl shadow-2xl backdrop-blur-xl text-left z-50 pointer-events-auto"
          >
            <h5 className="text-[10px] font-mono font-bold text-[#00fbfb] uppercase tracking-wider mb-1 flex items-center justify-between">
              <span>{title}</span>
              <button onClick={() => setIsOpen(false)} className="text-white/40 hover:text-white text-[10px] sm:hidden">✕</button>
            </h5>
            <p className="text-[10px] text-[#b9cac9] leading-relaxed font-sans font-medium break-words">
              {content}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface MemberTourModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartQuest: () => void;
}

export default function MemberTourModal({ isOpen, onClose, onStartQuest }: MemberTourModalProps) {
  const [activeStep, setActiveStep] = useState(0);

  // MOCK SIMULATION STATES
  
  // Step 1: Selected Archetype
  const [selectedArchetype, setSelectedArchetype] = useState<"muse" | "confessor" | "intellectual">("muse");
  
  // Step 2: Privacy Shield setting
  const [faceBlurSetting, setFaceBlurSetting] = useState<boolean>(false);
  
  // Step 3 & 4: Profile Inspection & Matching
  const [showInspection, setShowInspection] = useState<boolean>(false);
  const [matchStatus, setMatchStatus] = useState<"idle" | "liked" | "matched">("idle");
  
  // Step 6: Text translation
  const [isTranslated, setIsTranslated] = useState<boolean>(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [audioTimer, setAudioTimer] = useState<number>(0);
  
  // Step 7: Chemistry progression levels
  const [simulatedLevel, setSimulatedLevel] = useState<number>(2);
  
  // Step 8: Liveness scanning animation
  const [livenessStatus, setLivenessStatus] = useState<"idle" | "scanning" | "success">("idle");
  
  // Step 9: Date plan application
  const [datePlanApplied, setDatePlanApplied] = useState<boolean>(false);

  // Audio simulation timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlayingAudio && audioTimer > 0) {
      interval = setInterval(() => {
        setAudioTimer(prev => prev - 1);
      }, 1000);
    } else if (audioTimer === 0) {
      setIsPlayingAudio(false);
    }
    return () => clearInterval(interval);
  }, [isPlayingAudio, audioTimer]);

  // Liveness check simulation
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (livenessStatus === "scanning") {
      timeout = setTimeout(() => {
        setLivenessStatus("success");
      }, 2500);
    }
    return () => clearTimeout(timeout);
  }, [livenessStatus]);

  if (!isOpen) return null;

  const playSimulatedAudio = () => {
    setIsPlayingAudio(true);
    setAudioTimer(4); // 4-second audio note
  };

  const handleNext = () => {
    if (activeStep < 10) {
      setActiveStep(prev => prev + 1);
    } else {
      onStartQuest();
    }
  };

  const handleBack = () => {
    if (activeStep > 0) {
      setActiveStep(prev => prev - 1);
    }
  };

  const archetypes = {
    muse: {
      name: "Creative Muse",
      desc: "Driven by artistic expression, musical vibes, and aesthetic storytelling."
    },
    confessor: {
      name: "Deep Confessor",
      desc: "Values radical honesty, long late-night talks, and vulnerable connection."
    },
    intellectual: {
      name: "Quiet Intellectual",
      desc: "Enjoys literature, science chat, and sharing curated book notes."
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#050505]/95 backdrop-blur-2xl overflow-y-auto flex items-start sm:items-center justify-center p-2 sm:p-4 md:p-8 font-sans">
      
      {/* Container Box */}
      <div className="w-full max-w-[1000px] bg-[#0F0F1A]/95 border border-white/10 rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col lg:flex-row relative my-auto max-h-[95vh] lg:max-h-none overflow-y-auto lg:overflow-visible">
        
        {/* Absolute Close */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 sm:top-6 sm:right-6 z-50 p-2 sm:p-2.5 rounded-full bg-white/10 border border-white/20 text-white/70 hover:text-white transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* LEFT PANE: Mobile App Frame Mockup (Touch & Screen view) */}
        <div className="w-full lg:w-[420px] bg-black/40 border-b lg:border-b-0 lg:border-r border-white/5 p-4 sm:p-6 md:p-8 flex flex-col items-center justify-center relative shrink-0">
          
          {/* Simulated Mobile Outer Frame */}
          <div className="relative w-[240px] sm:w-[270px] h-[360px] sm:h-[460px] rounded-[2.5rem] sm:rounded-[3rem] border-[4px] sm:border-[6px] border-white/10 bg-[#07070E] shadow-[0_0_40px_rgba(0,251,251,0.15)] flex flex-col overflow-hidden select-none">
            
            {/* Phone Top Notch */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-5 bg-black rounded-b-xl z-30 flex items-center justify-center">
              <div className="w-12 h-1 bg-white/10 rounded-full mb-1" />
            </div>

            {/* Inner Phone screen */}
            <div className="flex-1 p-4 pt-8 flex flex-col relative z-20 overflow-hidden font-sans justify-between">
              
              {/* Active Step Mock Screen content */}
              <AnimatePresence mode="wait">
                {activeStep === 0 && (
                  <motion.div 
                    key="step0"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex-1 flex flex-col justify-center space-y-4"
                  >
                    <h4 className="text-[10px] font-mono font-bold text-[#00fbfb] uppercase tracking-widest text-center">Edit Profile details</h4>
                    
                    <div className="space-y-3">
                      <label className="block text-[8px] font-mono text-white/40 uppercase font-bold text-left">Select Vibe Archetype</label>
                      <div className="grid grid-cols-3 gap-2">
                        {(Object.keys(archetypes) as (keyof typeof archetypes)[]).map((key) => {
                          const isSelected = selectedArchetype === key;
                          return (
                            <button
                              key={key}
                              onClick={() => setSelectedArchetype(key)}
                              className={`p-2 rounded-xl border text-[8px] font-bold uppercase transition text-center cursor-pointer ${
                                isSelected 
                                  ? 'border-[#00fbfb] text-[#00fbfb] bg-[#00fbfb]/5' 
                                  : 'border-white/10 text-white/40 hover:text-white/60'
                              }`}
                            >
                              {key}
                            </button>
                          );
                        })}
                      </div>
                      
                      <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl text-left">
                        <span className="text-[9px] font-bold text-white uppercase block mb-1">
                          {archetypes[selectedArchetype].name}
                        </span>
                        <p className="text-[8px] text-[#b9cac9] leading-relaxed">
                          {archetypes[selectedArchetype].desc}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-[8px] font-mono text-white/40 uppercase font-bold text-left">Content Album preview</label>
                      <div className="grid grid-cols-3 gap-2">
                        <button className="flex-1 py-2 rounded-xl border border-dashed border-white/20 flex items-center justify-center gap-1.5 text-[8px] font-bold text-white/40 hover:text-white/60 hover:border-white/40 transition cursor-pointer">
                          <Plus className="w-4 h-4 text-white/20" />
                          <span>Add Bio Audio Clip (15s)</span>
                        </button>
                        <div className="aspect-square rounded-xl overflow-hidden border border-white/10">
                          <img src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=150&q=80" className="w-full h-full object-cover" />
                        </div>
                        <div className="aspect-square rounded-xl overflow-hidden border border-white/10">
                          <img src="https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=150&q=80" className="w-full h-full object-cover" />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeStep === 1 && (
                  <motion.div 
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex-1 flex flex-col justify-center space-y-5"
                  >
                    <h4 className="text-[10px] font-mono font-bold text-[#ffabf3] uppercase tracking-widest text-center">Set profile privacy</h4>
                    
                    <div className="space-y-4">
                      <div className="p-3.5 bg-white/[0.02] border border-white/5 rounded-2xl flex justify-between items-center">
                        <div className="text-left">
                          <span className="text-[9px] font-bold text-white block">Face Blur Encryption</span>
                          <span className="text-[7px] text-[#b9cac9]">Blur portrait until matching trust is built</span>
                        </div>
                        <button
                          onClick={() => setFaceBlurSetting(!faceBlurSetting)}
                          className={`w-8 h-4 rounded-full transition-colors relative cursor-pointer ${faceBlurSetting ? 'bg-[#ffabf3]' : 'bg-white/10'}`}
                        >
                          <span className={`absolute top-0.5 w-3 h-3 rounded-full bg-black transition-transform ${faceBlurSetting ? 'right-0.5' : 'left-0.5'}`} />
                        </button>
                      </div>

                      <div className="p-4 bg-white/[0.03] border border-white/10 rounded-2xl text-center space-y-2">
                        <span className="text-[8px] font-mono uppercase tracking-wider block text-white/50">Attraction Speed Calculator</span>
                        <div className="text-lg font-black font-mono">
                          {faceBlurSetting ? (
                            <span className="text-white/60">PRIVACY MODE</span>
                          ) : (
                            <span className="text-[#00fbfb] drop-shadow-[0_0_10px_rgba(0,251,251,0.4)]">+450% MATCH BOOST</span>
                          )}
                        </div>
                        <p className="text-[7px] text-[#b9cac9] leading-relaxed">
                          {faceBlurSetting 
                            ? "Absolute anonymity active. Matching speed will decrease." 
                            : "Recommended. Full clear face gives maximum attraction speed."}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeStep === 2 && (
                  <motion.div 
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex-1 flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="relative aspect-square w-full rounded-2xl overflow-hidden border border-white/5 bg-black/30">
                        <img 
                          src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&q=80" 
                          className="w-full h-full object-cover" 
                        />
                        <div className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded-full backdrop-blur-md bg-black/60 border border-white/10 flex items-center gap-1">
                          <Unlock className="w-2.5 h-2.5 text-[#00fbfb]" />
                          <span className="text-[6px] font-mono text-[#00fbfb] uppercase font-bold">Profile Unblurred</span>
                        </div>
                      </div>
                      
                      {/* Anchors row */}
                      <div className="grid grid-cols-2 gap-2">
                        <div className="h-10 rounded-lg overflow-hidden border border-white/5">
                          <img src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=150&q=80" className="w-full h-full object-cover" />
                        </div>
                        <div className="h-10 rounded-lg overflow-hidden border border-white/5">
                          <img src="https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=150&q=80" className="w-full h-full object-cover" />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <button
                        onClick={() => setShowInspection(!showInspection)}
                        className="w-full py-2 bg-white/5 border border-white/10 hover:border-white/30 text-white rounded-xl text-[9px] font-mono uppercase tracking-wider font-bold transition cursor-pointer"
                      >
                        {showInspection ? "Hide Profile details" : "Inspect Profile bio"}
                      </button>

                      {showInspection && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          className="p-2.5 bg-[#0F0F1A] border border-white/10 rounded-xl text-left"
                        >
                          <span className="text-[8px] font-mono uppercase text-[#00fbfb] block mb-0.5">Siena Vibe • Archetype: Muse</span>
                          <p className="text-[7px] text-[#b9cac9] leading-normal font-sans">
                            Classical pianist, style enthusiast. Let's share music reels and skip situationship chat loop.
                          </p>
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                )}

                {activeStep === 3 && (
                  <motion.div 
                    key="step3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex-1 flex flex-col justify-between"
                  >
                    <div className="relative aspect-[4/5] w-full rounded-2xl overflow-hidden border border-white/5 bg-black/30">
                      <img 
                        src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&q=80" 
                        className="w-full h-full object-cover" 
                      />
                      
                      {matchStatus === "matched" && (
                        <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center p-4 text-center z-30">
                          <Heart className="w-10 h-10 text-[#ffabf3] animate-bounce mb-2" />
                          <h4 className="text-xs font-mono font-black text-[#00fbfb] uppercase tracking-widest">VIBE MATCHED</h4>
                          <p className="text-[7px] text-[#b9cac9] leading-relaxed mt-1">
                            Siena Vibe liked you back! Vibe levels are now active.
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-3 gap-2 mt-4 shrink-0">
                      <button
                        onClick={() => {
                          setMatchStatus("idle");
                          alert("Passed profile");
                        }}
                        className="py-2.5 rounded-xl border border-white/10 hover:border-rose-500 hover:text-rose-500 text-white/50 text-[9px] font-mono uppercase font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                      >
                        ✖ Pass
                      </button>
                      <button
                        onClick={() => setMatchStatus("matched")}
                        className="py-2.5 rounded-xl bg-gradient-to-r from-[#00fbfb] to-[#ffabf3] text-black text-[9px] font-mono uppercase font-black transition flex items-center justify-center gap-1 cursor-pointer"
                      >
                        ❤ Vibe
                      </button>
                      <button
                        onClick={() => alert("Added to Favorites list")}
                        className="py-2.5 rounded-xl border border-[#ffabf3]/30 hover:border-[#ffabf3] text-[#ffabf3] text-[9px] font-mono uppercase font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                      >
                        ⭐ Star
                      </button>
                    </div>
                  </motion.div>
                )}

                {activeStep === 4 && (
                  <motion.div 
                    key="step4"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex-1 flex flex-col justify-start space-y-4"
                  >
                    <h4 className="text-[10px] font-mono font-bold text-[#ffabf3] uppercase tracking-widest text-center">Pending connections</h4>
                    
                    <div className="space-y-2">
                      <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full overflow-hidden border border-white/10">
                            <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80" className="w-full h-full object-cover" />
                          </div>
                          <div className="text-left">
                            <span className="text-[9px] font-bold text-white block">Sarah</span>
                            <span className="text-[6px] text-white/40">Archetype: Confessor</span>
                          </div>
                        </div>
                        <button
                          onClick={() => alert("Sarah match accepted!")}
                          className="px-3 py-1 rounded-lg bg-[#00fbfb] text-black text-[8px] font-mono uppercase font-black hover:shadow-[0_0_10px_rgba(0,251,251,0.5)] transition cursor-pointer"
                        >
                          Accept
                        </button>
                      </div>

                      <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl flex justify-between items-center opacity-60">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full overflow-hidden border border-white/10">
                            <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&q=80" className="w-full h-full object-cover" />
                          </div>
                          <div className="text-left">
                            <span className="text-[9px] font-bold text-white block">Elena</span>
                            <span className="text-[6px] text-white/40">Archetype: Intellectual</span>
                          </div>
                        </div>
                        <span className="text-[8px] font-mono text-white/30 uppercase font-bold">Waiting</span>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeStep === 5 && (
                  <motion.div 
                    key="step5"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex-1 flex flex-col justify-between"
                  >
                    {/* Chat feed */}
                    <div className="flex-1 space-y-3 overflow-y-auto pr-1">
                      <div className="flex justify-start">
                        <div className="max-w-[80%] p-2.5 bg-white/5 border border-white/5 text-white/80 rounded-2xl rounded-tl-none text-[8px] text-left leading-normal font-sans">
                          {isTranslated 
                            ? "Hey Liam! Loved your latest piano stream. The visualizer sync was crazy." 
                            : "¡Hola Liam! Me encantó tu última transmisión de piano. La sincronización del visualizador fue una locura."}
                        </div>
                      </div>

                      {/* Ephemeral Voice Note */}
                      <div className="flex justify-start">
                        <button
                          onClick={playSimulatedAudio}
                          className="flex items-center gap-2 p-2 bg-[#ffabf3]/10 border border-[#ffabf3]/30 rounded-2xl rounded-tl-none text-[#ffabf3] text-[8px] font-mono uppercase font-bold cursor-pointer"
                        >
                          <Mic className="w-3.5 h-3.5" />
                          <span>{isPlayingAudio ? `Playing (${audioTimer}s)` : "Play Ephemeral Voice Note"}</span>
                        </button>
                      </div>
                    </div>

                    <div className="border-t border-white/5 pt-3 flex justify-between items-center gap-3">
                      <button
                        onClick={() => setIsTranslated(!isTranslated)}
                        className={`px-3 py-1.5 rounded-lg border text-[8px] font-mono uppercase font-bold transition cursor-pointer ${
                          isTranslated ? 'border-[#00fbfb] text-[#00fbfb]' : 'border-white/10 text-white/40'
                        }`}
                      >
                        {isTranslated ? "Showing English" : "Translate to English"}
                      </button>
                      <span className="text-[7px] text-[#b9cac9] font-mono">100% Free Live translation</span>
                    </div>
                  </motion.div>
                )}

                {activeStep === 6 && (
                  <motion.div 
                    key="step6"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex-1 flex flex-col justify-center space-y-4"
                  >
                    <h4 className="text-[10px] font-mono font-bold text-[#ffabf3] uppercase tracking-widest text-center">Chemistry Vibe Levels</h4>
                    
                    <div className="space-y-4">
                      {/* Vibe progression bar */}
                      <div className="space-y-1 text-left">
                        <div className="flex justify-between items-center text-[8px] font-mono uppercase text-[#00fbfb] font-bold">
                          <span>Chemistry Level</span>
                          <span>Level {simulatedLevel} / 8</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-white/5 border border-white/10 overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-[#00fbfb] to-[#ffabf3] transition-all duration-500" 
                            style={{ width: `${(simulatedLevel / 8) * 100}%` }}
                          />
                        </div>
                      </div>

                      <div className="p-3 bg-white/[0.02] border border-white/5 rounded-2xl space-y-2 text-left">
                        <span className="text-[8px] font-mono uppercase text-white/50 block">Suggestion moves unlocked</span>
                        {simulatedLevel < 3 ? (
                          <div className="text-[8px] text-[#b9cac9] leading-relaxed font-medium">
                            💡 Send a digital wave or playlist suggestion. Reach Level 3 to unlock real-world activity plans!
                          </div>
                        ) : (
                          <div className="p-2 bg-[#00fbfb]/5 border border-[#00fbfb]/20 rounded-xl flex justify-between items-center">
                            <span className="text-[8px] font-bold text-white">☕ Suggest a Coffee Stroll</span>
                            <span className="text-[7px] font-mono text-[#00fbfb] uppercase font-bold">Level 3 Unlock</span>
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => setSimulatedLevel(simulatedLevel === 2 ? 3 : 2)}
                        className="w-full py-2 rounded-xl bg-white/5 border border-white/10 hover:border-white/30 text-white font-mono text-[9px] font-bold uppercase transition cursor-pointer"
                      >
                        {simulatedLevel === 2 ? "Simulate Level Up (Reach L3)" : "Reset Level to 2"}
                      </button>
                    </div>
                  </motion.div>
                )}

                {activeStep === 7 && (
                  <motion.div 
                    key="step7"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex-1 flex flex-col justify-center space-y-4"
                  >
                    <h4 className="text-[10px] font-mono font-bold text-[#39FF14] uppercase tracking-widest text-center">Real-World Trust</h4>
                    
                    <div className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl flex flex-col items-center justify-center space-y-4 relative">
                      {livenessStatus === "idle" && (
                        <>
                          <div className="w-16 h-16 rounded-full border border-white/10 flex items-center justify-center">
                            <Camera className="w-8 h-8 text-white/30" />
                          </div>
                          <button
                            onClick={() => setLivenessStatus("scanning")}
                            className="px-4 py-2 rounded-xl bg-[#39FF14] text-black font-mono text-[9px] font-black uppercase tracking-wider hover:shadow-[0_0_15px_rgba(57,255,20,0.5)] transition cursor-pointer"
                          >
                            Verify Liveness
                          </button>
                        </>
                      )}

                      {livenessStatus === "scanning" && (
                        <div className="space-y-3 flex flex-col items-center">
                          <div className="w-16 h-16 rounded-full border-2 border-[#39FF14] relative overflow-hidden animate-pulse">
                            <div className="absolute inset-x-0 h-1 bg-[#39FF14] animate-[bounce_2s_infinite]" />
                          </div>
                          <span className="text-[8px] font-mono text-[#39FF14] uppercase tracking-wider animate-pulse">Scanning face liveness...</span>
                        </div>
                      )}

                      {livenessStatus === "success" && (
                        <div className="space-y-3 flex flex-col items-center">
                          <ShieldCheck className="w-12 h-12 text-[#39FF14] animate-bounce" />
                          <div className="text-center">
                            <span className="text-[9px] font-bold text-white block uppercase">Verification Success</span>
                            <span className="text-[7px] text-[#b9cac9] block mt-0.5">Documents deleted. Safety status clear.</span>
                          </div>
                          <button
                            onClick={() => setLivenessStatus("idle")}
                            className="text-[7px] font-mono text-white/40 uppercase tracking-wider underline cursor-pointer"
                          >
                            Reset scan
                          </button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                {activeStep === 8 && (
                  <motion.div 
                    key="step8"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex-1 flex flex-col justify-center space-y-4"
                  >
                    <h4 className="text-[10px] font-mono font-bold text-[#00fbfb] uppercase tracking-widest text-center">Dating Plans</h4>
                    
                    <div className="p-4 bg-[#0F0F1A] border border-white/10 rounded-2xl space-y-3 text-left">
                      <div className="flex justify-between items-center">
                        <span className="text-[8px] font-mono text-[#00fbfb] uppercase font-bold">Coffee Date Stroll</span>
                        <span className="text-[6px] text-white/40">Blue Bottle</span>
                      </div>
                      <p className="text-[8px] text-[#b9cac9] leading-relaxed font-medium">
                        Looking to meet for a quick coffee walk this Friday around 4 PM.
                      </p>
                      
                      <div className="border-t border-white/5 pt-2 flex justify-between items-center">
                        <span className="text-[7px] text-white/40">Posted by Siena Vibe</span>
                        <button
                          onClick={() => setDatePlanApplied(true)}
                          disabled={datePlanApplied}
                          className={`px-3 py-1.5 rounded-lg font-mono text-[8px] font-black uppercase transition cursor-pointer ${
                            datePlanApplied 
                              ? 'bg-white/10 text-white/40 border border-white/5' 
                              : 'bg-[#00fbfb] text-black hover:shadow-[0_0_10px_rgba(0,251,251,0.4)]'
                          }`}
                        >
                          {datePlanApplied ? "Applied" : "Apply to join"}
                        </button>
                      </div>
                    </div>

                    {datePlanApplied && (
                      <p className="text-[7px] text-emerald-400 font-mono text-center">
                        ✓ Application sent! Siena will review and choose.
                      </p>
                    )}
                  </motion.div>
                )}

                {activeStep === 9 && (
                  <motion.div 
                    key="step9"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex-1 flex flex-col justify-center space-y-4"
                  >
                    <h4 className="text-[10px] font-mono font-bold text-[#ffabf3] uppercase tracking-widest text-center">Your AI Wingman</h4>
                    
                    <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl text-left space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-[#ffabf3]/10 border border-[#ffabf3]/25 flex items-center justify-center">
                          <Bot className="w-3.5 h-3.5 text-[#ffabf3]" />
                        </div>
                        <span className="text-[8px] font-mono font-bold text-white uppercase tracking-wider">Coach Feed</span>
                      </div>
                      
                      <p className="text-[8px] text-[#b9cac9] leading-relaxed font-medium">
                        Siena loves classical piano and live visuals. Try sending this icebreaker opener:
                      </p>
                      
                      <div className="p-2.5 bg-black/40 border border-white/10 rounded-xl">
                        <p className="text-[8px] text-[#ffabf3] italic font-sans font-medium">
                          "I spent hours watching visual sync videos. What's your go-to playlist for a rainy commute?"
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeStep === 10 && (
                  <motion.div 
                    key="step10"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex-1 flex flex-col justify-center space-y-4"
                  >
                    <h4 className="text-[10px] font-mono font-bold text-[#00fbfb] uppercase tracking-widest text-center">Leaderboard spotlight</h4>
                    
                    <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl space-y-3 text-left">
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] font-bold text-white block uppercase">Active Leaderboard Perks</span>
                        <Trophy className="w-4 h-4 text-[#00fbfb]" />
                      </div>
                      
                      <ul className="space-y-2 text-[8px] text-[#b9cac9] leading-relaxed font-medium">
                        <li className="flex items-start gap-1">
                          <span className="text-[#00fbfb] font-bold">•</span>
                          Top 5% active members get priority profile spotlight.
                        </li>
                        <li className="flex items-start gap-1">
                          <span className="text-[#00fbfb] font-bold">•</span>
                          Earn double Chemistry Points for completing verified Date Plans.
                        </li>
                        <li className="flex items-start gap-1">
                          <span className="text-[#00fbfb] font-bold">•</span>
                          Receive unblur keys passes directly from our Sponsored Creators.
                        </li>
                      </ul>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

            </div>

            {/* Phone Home Bar indicator */}
            <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-28 h-1 bg-white/25 rounded-full z-30" />
          </div>

        </div>

        {/* RIGHT PANE: Step Instructions & Context */}
        <div className="flex-1 p-6 md:p-10 flex flex-col justify-between text-left">
          
          {/* Main Info */}
          <div className="space-y-6">
            
            {/* Step status */}
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-mono font-bold text-[#ffabf3] uppercase tracking-wider">
                Step {(activeStep + 1).toString().padStart(2, '0')} / 11
              </span>
              <span className="text-[9px] text-[#b9cac9]/50 font-mono">Member Cockpit Preview</span>
            </div>

            {/* Step Title & Copy */}
            <AnimatePresence mode="wait">
              {activeStep === 0 && (
                <motion.div
                  key="info0"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-3"
                >
                  <h2 className="text-xl md:text-2xl font-black text-white uppercase tracking-tight">
                    How to Edit Your Profile Details
                  </h2>
                  <p className="text-xs text-[#b9cac9] leading-relaxed">
                    Set up your connection profile. Fill in your name, upload photos to your Content Album, and select your core **Archetype**. 
                  </p>
                  <p className="text-xs text-[#b9cac9] leading-relaxed font-medium">
                    Your Archetype acts as your relational aura, matching your personality type (Muse, Confessor, Intellectual) to compatible feeds in the system.
                  </p>
                  <div className="pt-2">
                    <InfoBubble 
                      title="Archetypes" 
                      content="We group profiles into 9 key Archetypes to pair matching lifestyle rhythms and mood compatibility seamlessly." 
                    />
                  </div>
                </motion.div>
              )}

              {activeStep === 1 && (
                <motion.div
                  key="info1"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-3"
                >
                  <h2 className="text-xl md:text-2xl font-black text-white uppercase tracking-tight">
                    Set Your Information Privacy
                  </h2>
                  <p className="text-xs text-[#b9cac9] leading-relaxed font-medium">
                    Dating is fundamentally driven by physical attraction. We highly recommend keeping your face fully clear and visible from day one to maximize your visibility and match speed (up to **4.5x faster**).
                  </p>
                  <p className="text-xs text-[#b9cac9] leading-relaxed font-medium">
                    However, if absolute privacy is your main priority, you can activate **Face Blur Encryption**. This hides your face and restricts your Content Album to matched connections or trusted keys.
                  </p>
                  <div className="pt-2">
                    <InfoBubble 
                      title="Face Blur" 
                      content="Keep your face secure from public view and only unblur it once mutual likes or direct keys are exchanged." 
                    />
                  </div>
                </motion.div>
              )}

              {activeStep === 2 && (
                <motion.div
                  key="info2"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-3"
                >
                  <h2 className="text-xl md:text-2xl font-black text-white uppercase tracking-tight">
                    Review Before Swiping
                  </h2>
                  <p className="text-xs text-[#b9cac9] leading-relaxed">
                    No blind swiping. Before making a choice, you can inspect their style through two unblurred **Aesthetic Anchors** (showing fashion, silhouettes, or locations).
                  </p>
                  <p className="text-xs text-[#b9cac9] leading-relaxed font-medium">
                    Tap the `Inspect Profile` trigger to view their full bio details, Spotify cards, and mood indicators before deciding to connect.
                  </p>
                  <div className="pt-2">
                    <InfoBubble 
                      title="Inspection Panel" 
                      content="Review their lifestyle habits, interests, and profile description to ensure values align before sending a like." 
                    />
                  </div>
                </motion.div>
              )}

              {activeStep === 3 && (
                <motion.div
                  key="info3"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-3"
                >
                  <h2 className="text-xl md:text-2xl font-black text-white uppercase tracking-tight">
                    Swipe Decisions & Favorites
                  </h2>
                  <p className="text-xs text-[#b9cac9] leading-relaxed font-medium">
                    When viewing profile cards, choose how to connect. Click `Pass` to view the next profile, `Vibe` to send a like, or `Star` to add them to your priority favorites list.
                  </p>
                  <p className="text-xs text-[#b9cac9] leading-relaxed font-medium">
                    Matching is reciprocal: once both profiles vibe with each other, a **Vibe Match** is formed and you can start chatting instantly.
                  </p>
                  <div className="pt-2">
                    <InfoBubble 
                      title="Matching Actions" 
                      content="Reciprocal likes are free. Adding to favorites highlights your card on their discovery feed." 
                    />
                  </div>
                </motion.div>
              )}

              {activeStep === 4 && (
                <motion.div
                  key="info4"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-3"
                >
                  <h2 className="text-xl md:text-2xl font-black text-white uppercase tracking-tight">
                    Connection Requests
                  </h2>
                  <p className="text-xs text-[#b9cac9] leading-relaxed">
                    Manage your relationships in the Connection Inbox. See incoming likes and pending match invites instantly.
                  </p>
                  <p className="text-xs text-[#b9cac9] leading-relaxed font-medium">
                    All matches, profiles, and basic chat tools are completely free, funded by our creator monetization ecosystems.
                  </p>
                  <div className="pt-2">
                    <InfoBubble 
                      title="Connections" 
                      content="You can review profiles who have already liked you and accept matching requests immediately." 
                    />
                  </div>
                </motion.div>
              )}

              {activeStep === 5 && (
                <motion.div
                  key="info5"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-3"
                >
                  <h2 className="text-xl md:text-2xl font-black text-white uppercase tracking-tight">
                    Communication Tools
                  </h2>
                  <p className="text-xs text-[#b9cac9] leading-relaxed">
                    Once connected, talk without boundaries. Send disappearing voice notes or photos (**Ephemeral Media**) that melt automatically after viewing to keep chat secure.
                  </p>
                  <p className="text-xs text-[#b9cac9] leading-relaxed font-medium">
                    Use our built-in **Live Translation** toggle to instantly translate incoming foreign text and speech in real-time, helping you connect globally.
                  </p>
                  <div className="pt-2">
                    <InfoBubble 
                      title="Translation & Media" 
                      content="Live translation works on text and audio streams. Ephemeral files are stored in volatile memory and deleted after playing." 
                    />
                  </div>
                </motion.div>
              )}

              {activeStep === 6 && (
                <motion.div
                  key="info6"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-3"
                >
                  <h2 className="text-xl md:text-2xl font-black text-white uppercase tracking-tight">
                    Vibe Levels & Suggestion Moves
                  </h2>
                  <p className="text-xs text-[#b9cac9] leading-relaxed font-medium">
                    Your relationship is a growing path. We track this via 8 Vibe Levels. Reaching **Level 3** unlocks **Suggestion Moves** directly related to your chat history.
                  </p>
                  <p className="text-xs text-[#b9cac9] leading-relaxed font-medium">
                    Suggestion Moves are contextual activities—like proposing a cozy local coffee stroll or gallery walk—that guide connections out of situationship text limbo.
                  </p>
                  <div className="pt-2">
                    <InfoBubble 
                      title="Suggestion Moves" 
                      content="Over 60+ activity cards that unlock based on relationship level, helping you meet in person naturally." 
                    />
                  </div>
                </motion.div>
              )}

              {activeStep === 7 && (
                <motion.div
                  key="info7"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-3"
                >
                  <h2 className="text-xl md:text-2xl font-black text-white uppercase tracking-tight">
                    Real-World Trust (KYC Check)
                  </h2>
                  <p className="text-xs text-[#b9cac9] leading-relaxed">
                    To make real-world intimacy moves (Level 4+), both partners complete a secure **liveness and face verification check** to ensure they match their photos.
                  </p>
                  <p className="text-xs text-[#b9cac9] leading-relaxed font-medium">
                    Your privacy is protected: **SECCION does not store any official ID documents**. Checks happen in real-time, and all ID media is permanently deleted.
                  </p>
                  <div className="pt-2">
                    <InfoBubble 
                      title="Liveness Check" 
                      content="Liveness verification ensures profiles are real people, completely eliminating catfishing and fake accounts." 
                    />
                  </div>
                </motion.div>
              )}

              {activeStep === 8 && (
                <motion.div
                  key="info8"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-3"
                >
                  <h2 className="text-xl md:text-2xl font-black text-white uppercase tracking-tight">
                    The Date Plan Module
                  </h2>
                  <p className="text-xs text-[#b9cac9] leading-relaxed">
                    Date Plans are concrete, time-bound date invitations (e.g. coffee stroll, art walk) posted directly on the board.
                  </p>
                  <p className="text-xs text-[#b9cac9] leading-relaxed font-medium">
                    Standard members can post **1 custom Date Plan per month** for free, and have **unlimited applications** to apply to dates proposed by other matches.
                  </p>
                  <div className="pt-2">
                    <InfoBubble 
                      title="Date Plans" 
                      content="Define location, time, and plan. It provides clear relational intentions to skip endless texting." 
                    />
                  </div>
                </motion.div>
              )}

              {activeStep === 9 && (
                <motion.div
                  key="info9"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-3"
                >
                  <h2 className="text-xl md:text-2xl font-black text-white uppercase tracking-tight">
                    Dating Coach AI wingman
                  </h2>
                  <p className="text-xs text-[#b9cac9] leading-relaxed">
                    Our AI Wingman serves as your personal dating coach and platform assistant. It reads conversation gravity, matches interests, and suggests openers.
                  </p>
                  <p className="text-xs text-[#b9cac9] leading-relaxed font-medium">
                    It avoids dry or robotic text, focusing on creative, contextual icebreakers and suggesting dates at the perfect chat moment.
                  </p>
                  <div className="pt-2">
                    <InfoBubble 
                      title="Dating Coach AI" 
                      content="Analyzes emotional flow in chats to provide icebreaker helpers and date scheduling advice." 
                    />
                  </div>
                </motion.div>
              )}

              {activeStep === 10 && (
                <motion.div
                  key="info10"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-3"
                >
                  <h2 className="text-xl md:text-2xl font-black text-white uppercase tracking-tight">
                    Leaderboard Spotlight & Perks
                  </h2>
                  <p className="text-xs text-[#b9cac9] leading-relaxed font-medium">
                    Active, high-ranked members climb the community leaderboard. The **Top Profile** section spotlights highly rated members to increase match visibility.
                  </p>
                  <p className="text-xs text-[#b9cac9] leading-relaxed font-medium">
                    Climbing the ranks unlocks priorities, special matching boosts, and direct unblur keys from our Sponsored Creators.
                  </p>
                  <div className="pt-2">
                    <InfoBubble 
                      title="Top Profiles" 
                      content="Daily calculations reward conversational gravity and completed Date Plans, putting active members in the spotlight." 
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </div>

          {/* Nav Controls */}
          <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4 shrink-0">
            <button
              onClick={onClose}
              className="text-xs font-mono font-medium text-white/40 hover:text-white uppercase tracking-widest cursor-pointer order-3 sm:order-1"
            >
              Skip Tour
            </button>
            
            <div className="flex items-center gap-3 order-1 sm:order-2">
              <button
                onClick={handleBack}
                disabled={activeStep === 0}
                className="w-10 h-10 rounded-full border border-white/10 hover:border-white/30 text-white flex items-center justify-center transition disabled:opacity-30 cursor-pointer"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              <button
                onClick={handleNext}
                className="px-6 py-2.5 rounded-full bg-[#00fbfb] text-black font-mono text-[11px] font-black uppercase tracking-wider hover:shadow-[0_0_15px_rgba(0,251,251,0.5)] transition flex items-center gap-2 cursor-pointer"
              >
                <span>{activeStep === 10 ? "Join Onboarding Quest" : "Next Step"}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            
            {/* Step Indicators */}
            <div className="flex gap-1.5 order-2 sm:order-3">
              {Array.from({ length: 11 }).map((_, idx) => (
                <div 
                  key={idx}
                  className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                    idx === activeStep ? 'bg-[#00fbfb] w-4' : 'bg-white/10'
                  }`}
                />
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
