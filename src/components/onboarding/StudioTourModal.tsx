"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, 
  ChevronRight, 
  ChevronLeft, 
  Sparkles, 
  ShieldCheck, 
  Zap, 
  EyeOff, 
  Lock, 
  Unlock, 
  Scale, 
  Check, 
  Play, 
  MessageSquare, 
  Mic, 
  Radio, 
  MapPin, 
  TrendingUp, 
  Download, 
  FileText,
  AlertTriangle,
  HelpCircle,
  Video
} from "lucide-react";

// Contextual Info Bubble Component (Hover/Click Tooltip)
function InfoBubble({ title, content, position = "top" }: { title: string; content: string; position?: "top" | "bottom" | "left" | "right" }) {
  const [isOpen, setIsOpen] = useState(false);

  const positionClasses = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  };

  return (
    <div className="relative inline-block z-30 mx-1">
      <button
        type="button"
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        onClick={() => setIsOpen(!isOpen)}
        className="w-4 h-4 rounded-full bg-[#00fbfb]/10 border border-[#00fbfb]/50 text-[#00fbfb] hover:bg-[#00fbfb]/30 hover:border-[#00fbfb] flex items-center justify-center text-[10px] font-bold font-mono transition-all animate-pulse"
      >
        ?
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: position === "top" ? 5 : -5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: position === "top" ? 5 : -5 }}
            className={`absolute ${positionClasses[position]} w-56 p-3 bg-[#0F0F1A] border border-white/10 rounded-xl shadow-2xl backdrop-blur-md text-left z-50 pointer-events-none`}
          >
            <h5 className="text-[10px] font-mono font-bold text-[#00fbfb] uppercase tracking-wider mb-1">
              {title}
            </h5>
            <p className="text-[10px] text-[#b9cac9] leading-relaxed font-sans">
              {content}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface StudioTourModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClaimOffer: () => void;
}

export default function StudioTourModal({ isOpen, onClose, onClaimOffer }: StudioTourModalProps) {
  const [activeStep, setActiveStep] = useState(0);
  
  // Interactive Simulator States
  const [isAutopilotOn, setIsAutopilotOn] = useState(true);
  const [blockedRegions, setBlockedRegions] = useState<string[]>(["Berlin", "Paris"]);
  const [sliderBlurVal, setSliderBlurVal] = useState(80); // 0 = clear, 100 = full blur
  const [acceptedMatches, setAcceptedMatches] = useState<string[]>([]);
  const [chatMessages, setChatMessages] = useState([
    { id: 1, sender: "member", text: "Hey Siena! Loved your latest piano stream. The visualizer sync was crazy." },
    { id: 2, sender: "ai", text: "Thanks! I spent hours scripting that dynamic particle canvas. Glad it vibrated well with you!" }
  ]);
  const [inputText, setInputText] = useState("");
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isScanningContract, setIsScanningContract] = useState(false);
  const [scanResult, setScanResult] = useState<"idle" | "scanning" | "done">("idle");
  const [isLive, setIsLive] = useState(false);
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages]);

  if (!isOpen) return null;

  // Step Data
  const steps = [
    {
      title: "SECCION Studio Cockpit",
      description: "Experience your unified dashboard. View active earnings, subscriber rosters, and toggle your AI autopilot chatter on or off instantly.",
      tip: "Your studio dashboard gives you a high-density control center without visual clutter."
    },
    {
      title: "Customize & Protect Your Identity",
      description: "Maintain absolute control over your privacy. Block views in specific cities/countries (Geofencing) and configure how your face is blurred on public discovery feeds.",
      tip: "Geofencing helps keep your content invisible in your hometown or specific markets."
    },
    {
      title: "Synergy Matching System",
      description: "Ditch the public transactional inbox. Members match with you based on shared interests and vibe compatibility before they can subscribe.",
      tip: "High compatibility scores lead to better relationships and lower subscriber churn."
    },
    {
      title: "Seamless Matching Requests",
      description: "Review incoming matching invitations. Once you accept a sponsored connection, your Face Blur dissolves automatically for that specific user.",
      tip: "Accepting a match grants selected entry to your exclusive profile layers."
    },
    {
      title: "Interactive Communication Hub",
      description: "Engage your audience with chat, vocals, and HD live streams. Use the AI Suggestion deck to quickly reply to messages in your unique voice tone.",
      tip: "Double tap suggestions to customize or press Send to execute the chat loop."
    },
    {
      title: "Legal Contract & DRM Shields",
      description: "Protect your intellectual property. Run contracts through the Legal Shield to scan for sunset clauses, and check the DRM console to track down leaks.",
      tip: "We scan the web continuously to file automated takedowns for you."
    },
    {
      title: "Claim Campaign Offer",
      description: "Ready to launch your channel? The first 500 creators claim the AI Assistant free for Year 1 (saving €4,000/month in agency commission fees).",
      tip: "Click below to complete your studio sign up and claim your slot."
    }
  ];

  // Helper functions for mock interactions
  const handleToggleRegion = (region: string) => {
    if (blockedRegions.includes(region)) {
      setBlockedRegions(prev => prev.filter(r => r !== region));
    } else {
      setBlockedRegions(prev => [...prev, region]);
    }
  };

  const handleSendMessage = () => {
    if (!inputText.trim()) return;
    setChatMessages(prev => [
      ...prev,
      { id: Date.now(), sender: "creator", text: inputText }
    ]);
    setInputText("");
    
    // Simulate dynamic member response after a delay
    setTimeout(() => {
      setChatMessages(prev => [
        ...prev,
        { id: Date.now() + 1, sender: "member", text: "That sounds awesome. Let me know when you schedule the next session!" }
      ]);
    }, 1200);
  };

  const handleTriggerSuggestion = (text: string) => {
    setInputText(text);
  };

  const handleScanContract = () => {
    setIsScanningContract(true);
    setScanResult("scanning");
    setTimeout(() => {
      setIsScanningContract(false);
      setScanResult("done");
    }, 2500);
  };

  const handleNext = () => {
    if (activeStep < steps.length - 1) {
      setActiveStep(activeStep + 1);
    }
  };

  const handlePrev = () => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#020205]/95 backdrop-blur-md overflow-y-auto">
      {/* Outer Close Button */}
      <button 
        onClick={onClose} 
        className="fixed top-6 right-6 z-[60] p-2 rounded-full bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition cursor-pointer"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Main Container */}
      <div className="w-full max-w-[1200px] min-h-[600px] rounded-[2.5rem] p-1 bg-gradient-to-tr from-[#00fbfb]/10 to-[#ffabf3]/10 border border-white/15 shadow-[0_24px_64px_-12px_rgba(0,0,0,0.8)] relative flex flex-col lg:flex-row overflow-hidden my-8">
        
        {/* Left Side: Explanatory Tour Guide Panel */}
        <div className="w-full lg:w-[400px] bg-[#0F0F1A]/95 border-b lg:border-b-0 lg:border-r border-white/5 p-8 flex flex-col justify-between relative z-10">
          <div className="space-y-8 text-left">
            {/* Header logo / step tag */}
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-[#00fbfb] bg-[#00fbfb]/5 border border-[#00fbfb]/20 px-3 py-1 rounded-full uppercase tracking-wider">
                Studio Tour Mode
              </span>
              <span className="text-xs font-mono text-white/40">
                Step {activeStep + 1} of {steps.length}
              </span>
            </div>

            {/* Step Title & Details */}
            <div className="space-y-4">
              <motion.h3 
                key={`title-${activeStep}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="font-display text-2xl font-black text-white leading-tight"
              >
                {steps[activeStep].title}
              </motion.h3>
              
              <motion.p 
                key={`desc-${activeStep}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="text-xs text-[#b9cac9] leading-relaxed font-medium"
              >
                {steps[activeStep].description}
              </motion.p>
            </div>

            {/* Tip Alert box */}
            <motion.div 
              key={`tip-${activeStep}`}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl flex gap-3 text-left"
            >
              <Sparkles className="w-4 h-4 text-[#ffabf3] shrink-0 mt-0.5" />
              <p className="text-[11px] text-[#ffabf3]/80 leading-normal font-medium">
                {steps[activeStep].tip}
              </p>
            </motion.div>
          </div>

          {/* Stepper Footer Controls */}
          <div className="pt-8 mt-8 border-t border-white/5 flex items-center justify-between">
            <button
              onClick={handlePrev}
              disabled={activeStep === 0}
              className="p-3.5 rounded-full border border-white/10 text-white/60 disabled:opacity-30 disabled:pointer-events-none hover:bg-white/5 transition flex items-center justify-center cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Indicator dots */}
            <div className="flex gap-1.5">
              {steps.map((_, i) => (
                <div 
                  key={i} 
                  className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${i === activeStep ? "bg-[#00fbfb] w-4" : "bg-white/20"}`}
                />
              ))}
            </div>

            {activeStep === steps.length - 1 ? (
              <button
                onClick={onClaimOffer}
                className="px-6 py-3.5 rounded-full bg-[#00fbfb] text-black font-mono text-[10px] font-black uppercase tracking-wider hover:shadow-[0_0_20px_rgba(0,251,251,0.4)] transition flex items-center gap-1.5 cursor-pointer"
              >
                <span>Claim Offer</span>
                <Check className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="p-3.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition flex items-center justify-center cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Right Side: Interactive Sandbox Simulator Screen */}
        <div className="flex-1 bg-[#05050A] p-6 md:p-8 flex items-center justify-center relative min-h-[480px]">
          {/* Subtle grid background */}
          <div className="absolute inset-0 opacity-[0.02] bg-[linear-gradient(rgba(255,255,255,1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,1)_1px,transparent_1px)] bg-[size:30px_30px] pointer-events-none" />

          {/* Interactive display states based on active step */}
          <div className="w-full max-w-[650px] relative z-10">
            <AnimatePresence mode="wait">
              
              {/* STEP 0: Studio Cockpit Overview */}
              {activeStep === 0 && (
                <motion.div
                  key="step-0"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left overflow-visible"
                >
                  {/* Earnings card */}
                  <div className="p-5 bg-[#0F0F1A] border border-white/10 rounded-2xl shadow-lg flex flex-col justify-between overflow-visible">
                    <div className="flex justify-between items-start overflow-visible">
                      <div>
                        <span className="text-[9px] font-mono uppercase text-white/40 block">Total Net Payout</span>
                        <h3 className="text-3xl font-black text-white mt-1">
                          <span className="font-mono text-[#00fbfb]">12,840.50 €</span>
                        </h3>
                      </div>
                      <InfoBubble title="Earnings Tracker" content="Your real-time net earnings. There are no hidden cuts—SECCION takes only a 20% platform share." />
                    </div>
                    <div className="mt-3 flex items-center gap-1 text-[9px] text-[#39FF14] font-semibold">
                      <TrendingUp className="w-3 h-3" />
                      <span>+14.5% this week</span>
                    </div>
                  </div>

                  {/* Autopilot toggle card */}
                  <div className="p-5 bg-[#0F0F1A] border border-white/10 rounded-2xl shadow-lg flex flex-col justify-between overflow-visible">
                    <div className="flex justify-between items-start overflow-visible">
                      <div>
                        <span className="text-[9px] font-mono uppercase text-white/40 block">AI Chat Autopilot</span>
                        <h4 className="text-xs font-bold text-white mt-1 uppercase tracking-wider">Automation Status</h4>
                      </div>
                      <InfoBubble title="AI Autopilot" content="When activated, the AI Operations Assistant replies to fans 24/7 in your voice tone to lock in custom content sales." />
                    </div>
                    
                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-2.5 h-2.5 rounded-full ${isAutopilotOn ? "bg-[#39FF14] animate-pulse" : "bg-white/20"}`} />
                        <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                          {isAutopilotOn ? "Online & Active" : "Paused"}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => setIsAutopilotOn(!isAutopilotOn)}
                        className={`w-12 h-6.5 rounded-full p-0.5 transition-colors cursor-pointer ${isAutopilotOn ? "bg-[#39FF14]/20 border border-[#39FF14]/40" : "bg-white/10 border border-white/5"}`}
                      >
                        <div className={`w-5 h-5 rounded-full transition-transform ${isAutopilotOn ? "bg-[#39FF14] translate-x-5.5" : "bg-white/40 translate-x-0"}`} />
                      </button>
                    </div>
                  </div>

                  {/* Active Match list */}
                  <div className="p-5 bg-[#0F0F1A] border border-[#00fbfb]/20 rounded-2xl md:col-span-2 shadow-lg overflow-visible">
                    <div className="flex justify-between items-center mb-4 overflow-visible">
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">Active Supported Matches</h4>
                      <InfoBubble title="Sponsored roster" content="Only compatibility-vetted users are allowed into your studio space. This creates dedicated long-term supporters." />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#00fbfb] to-[#ffabf3] flex items-center justify-center font-bold text-[10px] text-black">A</div>
                          <div className="text-left">
                            <p className="text-xs font-bold text-white">Aaron Cooper</p>
                            <span className="text-[9px] font-mono text-white/50">Chemistry Level 4 (Subscribed)</span>
                          </div>
                        </div>
                        <span className="text-xs font-mono text-[#00fbfb] font-bold">96.8% Match</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#ffabf3] to-rose-500 flex items-center justify-center font-bold text-[10px] text-black">C</div>
                          <div className="text-left">
                            <p className="text-xs font-bold text-white">Chloe Finch</p>
                            <span className="text-[9px] font-mono text-white/50">Chemistry Level 3 (Free Match)</span>
                          </div>
                        </div>
                        <span className="text-xs font-mono text-[#ffabf3] font-bold">91.2% Match</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* STEP 1: Customize & Protect Identity (Geofencing / Face Blur Slider) */}
              {activeStep === 1 && (
                <motion.div
                  key="step-1"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="space-y-6 text-left overflow-visible"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 overflow-visible">
                    {/* Geofencing panel */}
                    <div className="p-5 bg-[#0F0F1A] border border-white/10 rounded-2xl shadow-lg overflow-visible">
                      <div className="flex justify-between items-start mb-3 overflow-visible">
                        <div>
                          <span className="text-[9px] font-mono uppercase text-[#00fbfb] block">Geofence Blocker</span>
                          <h4 className="text-xs font-bold text-white uppercase tracking-wider mt-1">Geographic Visibility</h4>
                        </div>
                        <InfoBubble title="Geofencing Blocks" content="Blocked regions prevent anyone from that city/country from searching or viewing your profile." />
                      </div>
                      
                      <div className="space-y-2">
                        {["Paris", "Berlin", "London", "New York"].map((region) => {
                          const isBlocked = blockedRegions.includes(region);
                          return (
                            <button
                              key={region}
                              onClick={() => handleToggleRegion(region)}
                              className={`w-full flex justify-between items-center p-2.5 rounded-xl border text-xs transition cursor-pointer ${isBlocked ? "bg-rose-500/10 border-rose-500/30 text-rose-400" : "bg-white/5 border-white/5 text-white/70 hover:bg-white/10"}`}
                            >
                              <span className="flex items-center gap-2">
                                <MapPin className="w-3.5 h-3.5" />
                                {region}
                              </span>
                              <span className="text-[9px] font-mono uppercase font-bold">
                                {isBlocked ? "Blocked" : "Visible"}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Face Blur panel */}
                    <div className="p-5 bg-[#0F0F1A] border border-white/10 rounded-2xl shadow-lg flex flex-col justify-between overflow-visible">
                      <div>
                        <div className="flex justify-between items-start mb-3 overflow-visible">
                          <div>
                            <span className="text-[9px] font-mono uppercase text-[#ffabf3] block">Face Blur Control</span>
                            <h4 className="text-xs font-bold text-white uppercase tracking-wider mt-1">Discovery Feed Preview</h4>
                          </div>
                          <InfoBubble title="Blur Intensity" content="Adjust the default blur level applied to your profile image on public discovery layers." />
                        </div>        
                        {/* Blurred Image box */}
                        <div className="relative aspect-video w-full rounded-xl overflow-hidden border border-white/5 bg-black/20 mb-4">
                          <img 
                            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80" 
                            alt="Siena Portrait"
                            className="w-full h-full object-cover transition-all"
                            style={{ filter: `blur(${sliderBlurVal / 4}px)` }}
                          />
                          <div className="absolute inset-0 bg-black/10" />
                          <div className="absolute top-2 left-2 px-2.5 py-0.5 rounded-full backdrop-blur-md bg-black/60 border border-white/10 flex items-center gap-1">
                            <EyeOff className="w-3 h-3 text-[#ffabf3]" />
                            <span className="text-[8px] font-mono text-[#ffabf3] uppercase font-bold">Blur: {sliderBlurVal}%</span>
                          </div>
                        </div>
                      </div>

                      {/* Slider Input */}
                      <div className="space-y-2">
                        <input 
                          type="range"
                          min="0"
                          max="100"
                          value={sliderBlurVal}
                          onChange={(e) => setSliderBlurVal(Number(e.target.value))}
                          className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#ffabf3]"
                        />
                        <div className="flex justify-between text-[8px] font-mono text-white/30 uppercase">
                          <span>0% (Clear)</span>
                          <span>50%</span>
                          <span>100% (Solid)</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* STEP 2: Synergy Matching System */}
              {activeStep === 2 && (
                <motion.div
                  key="step-2"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="space-y-6 text-left"
                >
                  <div className="p-[1px] bg-white/[0.04] border border-white/10 rounded-[2rem] overflow-visible">
                    <div className="bg-[#0F0F1A]/95 p-6 rounded-[calc(2rem-1px)] space-y-6 relative overflow-visible">
                      
                      {/* Member card */}
                      <div className="flex flex-col md:flex-row gap-6 items-center">
                        {/* Member avatar */}
                        <div className="relative w-28 h-28 rounded-2xl overflow-hidden border border-[#00fbfb]/30 shadow-lg">
                          <img 
                            src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&q=80" 
                            alt="Daniel Avatar"
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* Member Details */}
                        <div className="flex-1 text-center md:text-left space-y-2">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                            <div>
                              <h4 className="text-base font-bold text-white">Daniel Reed</h4>
                              <span className="text-[10px] font-mono text-[#00fbfb] uppercase tracking-wider">Matched Member Candidate</span>
                            </div>
                            <div className="px-3 py-1 rounded-full bg-[#00fbfb]/5 border border-[#00fbfb]/30 text-[#00fbfb] text-xs font-mono font-bold text-glow inline-flex items-center gap-1.5 self-center md:self-start">
                              <span>94.5% Vibe Match</span>
                              <InfoBubble title="Synergy Index" content="Calculated by matching member preferences, communication habits, and interests with your profile criteria." />
                            </div>
                          </div>

                          <p className="text-[11px] text-[#b9cac9] leading-relaxed font-sans">
                            Interests align heavily in **ambient music**, **creative visual design**, and **long conversation chats**. Shows a historical loyalty rate of 98% with creators.
                          </p>

                          {/* Synergy chart */}
                          <div className="grid grid-cols-3 gap-2 pt-2 text-[9px] font-mono">
                            <div className="p-2 bg-white/5 border border-white/5 rounded-xl">
                              <span className="text-white/40 block">Vibe Resonance</span>
                              <span className="text-white font-bold block mt-0.5">High (95%)</span>
                            </div>
                            <div className="p-2 bg-white/5 border border-white/5 rounded-xl">
                              <span className="text-white/40 block">Vocal Preference</span>
                              <span className="text-white font-bold block mt-0.5">88% Match</span>
                            </div>
                            <div className="p-2 bg-white/5 border border-white/5 rounded-xl">
                              <span className="text-white/40 block">Interactive Support</span>
                              <span className="text-[#39FF14] font-bold block mt-0.5">Varies</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* STEP 3: Connecting with Members */}
              {activeStep === 3 && (
                <motion.div
                  key="step-3"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="space-y-6 text-left"
                >
                  <div className="p-[1px] bg-white/[0.04] border border-white/10 rounded-[2rem] overflow-visible">
                    <div className="bg-[#0F0F1A]/95 p-6 rounded-[calc(2rem-1px)] space-y-6 relative overflow-visible">
                      
                      <div className="border-b border-white/5 pb-4 flex justify-between items-start">
                        <div>
                          <span className="text-[10px] font-mono text-[#ffabf3] uppercase font-bold block">Match Invitation Inbox</span>
                          <h4 className="text-xs text-white/50 mt-1">Pending Matching Sponsors</h4>
                        </div>
                        <InfoBubble title="Accept Invitation" content="Clicking Accept adds the member to your sponsored circle, lets you chat directly, and decrypts your portrait for them." />
                      </div>

                      <div className="space-y-4">
                        {acceptedMatches.includes("daniel") ? (
                          <motion.div 
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="p-5 bg-[#39FF14]/5 border border-[#39FF14]/25 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-4"
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-full overflow-hidden border border-[#39FF14]/40 shrink-0">
                                <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&q=80" alt="Daniel" className="w-full h-full object-cover" />
                              </div>
                              <div className="text-left">
                                <h5 className="text-xs font-bold text-white">Match with Daniel Approved</h5>
                                <p className="text-[10px] text-[#b9cac9] leading-relaxed">Face Blur encryption unlocked. Standard 80% revenue pipeline active.</p>
                              </div>
                            </div>
                            <span className="flex items-center gap-1.5 text-xs text-[#39FF14] font-mono uppercase font-bold shrink-0">
                              <Check className="w-3.5 h-3.5" /> Connected
                            </span>
                          </motion.div>
                        ) : (
                          <div className="p-5 bg-white/5 border border-white/5 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-4">
                            <div className="flex items-center gap-4">
                              {/* Member profile is unblurred by default */}
                              <div className="relative w-12 h-12 rounded-full overflow-hidden border border-white/10 shrink-0">
                                <img 
                                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&q=80" 
                                  alt="Daniel" 
                                  className="w-full h-full object-cover" 
                                />
                              </div>
                              <div className="text-left">
                                <h5 className="text-xs font-bold text-white">Daniel Reed (94.5% Match)</h5>
                                <p className="text-[10px] text-[#b9cac9] leading-relaxed">Requested sponsored access. Monthly Subscription target: €25.00</p>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => setAcceptedMatches([...acceptedMatches, "daniel"])}
                              className="px-5 py-2.5 rounded-full bg-[#00fbfb] text-black font-mono text-[10px] font-black uppercase tracking-wider hover:shadow-[0_0_15px_rgba(0,251,251,0.4)] transition shrink-0 cursor-pointer"
                            >
                              Accept Match
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* STEP 4: Interactive Communication Hub */}
              {activeStep === 4 && (
                <motion.div
                  key="step-4"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="space-y-6 text-left"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch overflow-visible">
                    
                    {/* Chat simulator */}
                    <div className="p-4 bg-[#0F0F1A] border border-white/10 rounded-2xl shadow-lg flex flex-col justify-between col-span-12 lg:col-span-8 min-h-[360px] relative overflow-visible">
                      <div className="border-b border-white/5 pb-2 mb-3 flex justify-between items-center overflow-visible">
                        <span className="text-[10px] font-mono text-[#00fbfb] uppercase font-bold">Studio Chat Live</span>
                        <InfoBubble title="Chat Interface" content="DMs contain built-in AI reply suggestions, voice clip integrations, and locked premium content boxes." />
                      </div>
                      
                      {/* Chat Messages */}
                      <div className="flex-grow space-y-3 overflow-y-auto max-h-[220px] pr-2 pb-4 border-b border-white/5 text-xs">
                        {chatMessages.map((msg) => (
                          <div 
                            key={msg.id} 
                            className={`flex flex-col max-w-[80%] ${msg.sender === "creator" ? "ml-auto text-right" : "text-left"}`}
                          >
                            <span className="text-[8px] font-mono text-white/30 uppercase mb-0.5">
                              {msg.sender === "creator" ? "You (Siena)" : msg.sender === "ai" ? "AI Autopilot Autogenerated" : "Daniel"}
                            </span>
                            <div className={`p-3 rounded-2xl leading-relaxed ${msg.sender === "creator" ? "bg-[#00fbfb]/10 border border-[#00fbfb]/20 text-white rounded-tr-none" : msg.sender === "ai" ? "bg-[#39FF14]/5 border border-[#39FF14]/20 text-[#39FF14] rounded-tl-none font-medium" : "bg-white/5 border border-white/5 text-white/90 rounded-tl-none"}`}>
                              {msg.text}
                            </div>
                          </div>
                        ))}
                        <div ref={chatEndRef} />
                      </div>

                      {/* AI Suggestions Deck */}
                      <div className="py-2.5 border-b border-white/5 space-y-2">
                        <span className="text-[8px] font-mono uppercase text-[#39FF14] block">AI Suggested Auto-Replies (Tap to use)</span>
                        <div className="flex flex-wrap gap-2">
                          <button 
                            type="button"
                            onClick={() => handleTriggerSuggestion("I'm planning a late-night acoustic session next Friday. Would love to have you in the cockpit!")}
                            className="px-2.5 py-1.5 rounded-lg bg-[#39FF14]/5 border border-[#39FF14]/20 text-[#39FF14] hover:bg-[#39FF14]/15 transition text-[9px] font-medium cursor-pointer"
                          >
                            Suggest Friday Stream
                          </button>
                          <button 
                            type="button"
                            onClick={() => handleTriggerSuggestion("Hey! Glad you liked the piano stream. I've got some new vocal files locked in my space for you.")}
                            className="px-2.5 py-1.5 rounded-lg bg-[#39FF14]/5 border border-[#39FF14]/20 text-[#39FF14] hover:bg-[#39FF14]/15 transition text-[9px] font-medium cursor-pointer"
                          >
                            Share Exclusive Vocal
                          </button>
                        </div>
                      </div>

                      {/* Text Input */}
                      <div className="pt-3 flex gap-2">
                        <input 
                          type="text"
                          value={inputText}
                          onChange={(e) => setInputText(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                          placeholder="Type response..."
                          className="flex-grow bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-xs text-white placeholder-white/20 outline-none focus:border-[#00fbfb] transition"
                        />
                        <button 
                          type="button"
                          onClick={handleSendMessage}
                          className="px-4 bg-[#00fbfb] text-black font-mono text-[10px] font-black uppercase tracking-wider rounded-xl hover:shadow-[0_0_15px_rgba(0,251,251,0.4)] transition cursor-pointer"
                        >
                          Send
                        </button>
                      </div>
                    </div>

                    {/* Vocal & Live streaming controls */}
                    <div className="col-span-12 lg:col-span-4 flex flex-col gap-4 overflow-visible">
                      
                      {/* Vocal Clip card */}
                      <div className="p-4 bg-[#0F0F1A] border border-white/10 rounded-2xl text-left flex-1 flex flex-col justify-between overflow-visible">
                        <div className="flex justify-between items-start overflow-visible">
                          <div>
                            <span className="text-[8px] font-mono uppercase text-[#00fbfb] block mb-1">Vocal Station</span>
                            <h5 className="text-xs font-bold text-white uppercase tracking-wider">Voice Memo Player</h5>
                          </div>
                          <InfoBubble title="Vocal Messages" content="Record and send voice notes with beautiful waveform animations. AI scans audio for maximum quality." />
                        </div>

                        {/* Soundwave animation */}
                        <div className="h-10 flex items-center justify-center gap-1 my-3 bg-black/20 rounded-xl px-4">
                          {[...Array(12)].map((_, i) => (
                            <div 
                              key={i} 
                              className="w-1 bg-[#00fbfb] rounded-full transition-all duration-300"
                              style={{ 
                                height: isPlayingAudio ? `${Math.floor(Math.random() * 24) + 6}px` : "6px",
                                opacity: isPlayingAudio ? 0.8 : 0.4
                              }}
                            />
                          ))}
                        </div>

                        <button
                          type="button"
                          onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                          className={`w-full py-2.5 rounded-xl border text-[10px] font-mono uppercase font-black tracking-widest flex items-center justify-center gap-2 cursor-pointer ${isPlayingAudio ? "bg-rose-500/10 border-rose-500/30 text-rose-400" : "bg-[#00fbfb]/10 border border-[#00fbfb]/30 text-[#00fbfb] hover:bg-[#00fbfb]/20"}`}
                        >
                          {isPlayingAudio ? (
                            <>
                              <X className="w-3.5 h-3.5" />
                              <span>Stop Wave</span>
                            </>
                          ) : (
                            <>
                              <Play className="w-3.5 h-3.5 fill-current" />
                              <span>Play vocal</span>
                            </>
                          )}
                        </button>
                      </div>

                      {/* Stream Deck card */}
                      <div className="p-4 bg-[#0F0F1A] border border-white/10 rounded-2xl text-left flex-1 flex flex-col justify-between overflow-visible">
                        <div className="flex justify-between items-start overflow-visible">
                          <div>
                            <span className="text-[8px] font-mono uppercase text-[#ffabf3] block mb-1">Broadcaster Deck</span>
                            <h5 className="text-xs font-bold text-white uppercase tracking-wider">Live Broadcast Stream</h5>
                          </div>
                          <InfoBubble title="Live Stream Deck" content="Start direct broadcast streams to your active supported circles. Tip overlays and compatibility sync in real-time." />
                        </div>

                        {isLive ? (
                          <div className="aspect-video w-full bg-red-950/20 border border-red-500/30 rounded-xl flex items-center justify-center relative overflow-hidden my-3">
                            <Video className="w-6 h-6 text-rose-500 animate-pulse" />
                            <div className="absolute top-2 left-2 px-2 py-0.5 bg-rose-500 text-black font-mono text-[8px] font-black uppercase rounded flex items-center gap-1">
                              <span className="w-1.5 h-1.5 bg-black rounded-full animate-ping" /> Live
                            </div>
                          </div>
                        ) : (
                          <div className="aspect-video w-full bg-black/30 border border-white/5 rounded-xl flex items-center justify-center my-3 text-white/30 text-[9px] font-mono uppercase">
                            Station Offline
                          </div>
                        )}

                        <button
                          type="button"
                          onClick={() => setIsLive(!isLive)}
                          className={`w-full py-2.5 rounded-xl border text-[10px] font-mono uppercase font-black tracking-widest flex items-center justify-center gap-2 cursor-pointer ${isLive ? "bg-rose-500/10 border-rose-500/30 text-rose-400" : "bg-[#ffabf3]/10 border border-[#ffabf3]/30 text-[#ffabf3] hover:bg-[#ffabf3]/20"}`}
                        >
                          <Radio className="w-3.5 h-3.5" />
                          <span>{isLive ? "Stop Stream" : "Go Live Now"}</span>
                        </button>
                      </div>

                    </div>
                  </div>
                </motion.div>
              )}

              {/* STEP 5: Legal & DRM Shields */}
              {activeStep === 5 && (
                <motion.div
                  key="step-5"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="space-y-6 text-left overflow-visible"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 overflow-visible">
                    {/* Legal Shield */}
                    <div className="p-5 bg-[#0F0F1A] border border-white/10 rounded-2xl shadow-lg flex flex-col justify-between min-h-[300px] overflow-visible">
                      <div className="flex justify-between items-start overflow-visible">
                        <div>
                          <span className="text-[9px] font-mono uppercase text-[#ffabf3] block mb-1">Legal Shield Copilot</span>
                          <h4 className="text-xs font-bold text-white uppercase tracking-wider">Exclusivity Check</h4>
                        </div>
                        <InfoBubble title="Legal Scanner" content="Pasting any contract checks for red flags: post-termination cuts, digital likeness theft, or exclusivity traps." />
                      </div>
                      
                      <div className="mt-3">
                        {scanResult === "idle" && (
                          <div className="p-3 bg-white/5 border border-white/5 rounded-xl text-[10px] text-[#b9cac9] space-y-2 leading-relaxed">
                            <p className="font-mono text-white/50 block mb-1">DRAFT_CONTRACT.TXT</p>
                            <p>"...Section 8. Exclusivity. Creator agrees to not publish sponsored content for competing brands. Section 12. Sunset Fees. Creator agrees to pay agency 40% of all future channel DMs post-contract..."</p>
                          </div>
                        )}

                        {scanResult === "scanning" && (
                          <div className="h-[120px] bg-black/20 border border-white/5 rounded-xl flex flex-col items-center justify-center space-y-2">
                            <span className="w-6 h-6 rounded-full border-2 border-[#ffabf3] border-t-transparent animate-spin" />
                            <p className="text-[10px] font-mono text-white/50 uppercase">Scanning contract layers...</p>
                          </div>
                        )}

                        {scanResult === "done" && (
                          <div className="p-3 bg-rose-500/5 border border-rose-500/20 rounded-xl space-y-2.5 text-[10px] text-[#b9cac9] leading-relaxed">
                            <p className="font-mono text-rose-400 font-bold flex items-center gap-1.5">
                              <AlertTriangle className="w-4 h-4 text-rose-500" /> Predatory Clauses Detected
                            </p>
                            <ul className="list-disc pl-4 space-y-1 text-rose-300">
                              <li>**Section 12 (Sunset Fees)**: Predator clause flags post-term commission fee.</li>
                              <li>**Section 14 (Likeness Lockup)**: Claims right to generate AI voice replica.</li>
                            </ul>
                          </div>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={handleScanContract}
                        disabled={isScanningContract}
                        className="w-full py-2.5 bg-[#ffabf3] text-black font-mono text-[10px] font-black uppercase tracking-widest rounded-xl hover:shadow-[0_0_15px_rgba(255,171,243,0.4)] transition disabled:opacity-50 cursor-pointer mt-4"
                      >
                        {isScanningContract ? "Scanning..." : "Scan Contract Draft"}
                      </button>
                    </div>

                    {/* DRM Shield */}
                    <div className="p-5 bg-[#0F0F1A] border border-white/10 rounded-2xl shadow-lg flex flex-col justify-between min-h-[300px] overflow-visible">
                      <div className="flex justify-between items-start overflow-visible">
                        <div>
                          <span className="text-[9px] font-mono uppercase text-[#00fbfb] block mb-1">DRM Content Guard</span>
                          <h4 className="text-xs font-bold text-white uppercase tracking-wider">Anti-Leak Protection Log</h4>
                        </div>
                        <InfoBubble title="DRM Web Sweeper" content="Scans external platforms automatically, generating encrypted hash signatures and dispatching legal DMCA requests." />
                      </div>

                      <div className="mt-3">
                        <div className="bg-black/40 border border-white/5 p-3 rounded-xl font-mono text-[8px] space-y-2 text-left text-[#b9cac9]/80 overflow-y-auto h-[120px]">
                          <p className="text-white/40">&gt; Starting Web Image Hash scan...</p>
                          <p className="text-white/40">&gt; Scan complete. 2 files matched external hashes.</p>
                          <p className="text-rose-400 font-bold">&gt; Found: leaked_piano_clip_S1.mp4 (site: leakage-leak.co)</p>
                          <p className="text-[#39FF14]">&gt; Action: DMCA Takedown Request generated and filed.</p>
                          <p className="text-rose-400 font-bold">&gt; Found: portrait_blur_leak.jpg (site: reddit-thread-mirror)</p>
                          <p className="text-[#39FF14]">&gt; Action: DMCA Takedown Request generated and filed.</p>
                          <p className="text-[#00fbfb]">&gt; Status: All files resolved. Scans continuous (24/7).</p>
                        </div>
                      </div>

                      <div className="p-3 bg-[#39FF14]/5 border border-[#39FF14]/20 rounded-xl text-center">
                        <p className="text-[9px] text-[#b9cac9] font-medium leading-relaxed font-sans">
                          Protection active: **100% of detected leaks** resolved automatically.
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* STEP 6: Earnings & Campaign Wrap-Up */}
              {activeStep === 6 && (
                <motion.div
                  key="step-6"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="space-y-6 text-center max-w-md mx-auto"
                >
                  <div className="w-14 h-14 rounded-full bg-[#00fbfb]/10 border border-[#00fbfb]/30 flex items-center justify-center mx-auto">
                    <Sparkles className="w-7 h-7 text-[#00fbfb] animate-spin" style={{ animationDuration: "3s" }} />
                  </div>
                  
                  <div className="space-y-3">
                    <h3 className="font-display text-2xl font-black text-white">Claim Your Year 1 Free Access</h3>
                    <p className="text-xs sm:text-sm text-[#b9cac9] leading-relaxed">
                      You've unlocked the cockpit preview. The **Creator Campaign** grants you a free slot for our AI assistant, saving you €4,000/month in management fees.
                    </p>
                    <p className="text-[10px] text-[#b9cac9]/60 leading-relaxed max-w-sm mx-auto">
                      After your first year, the AI assistant runs at a simple **€69/monthly fee**, or you can choose to manage your space manually at the free standard platform rate. You always retain 80% net keeps.
                    </p>
                  </div>

                  <div className="pt-4 grid grid-cols-2 gap-4 text-left text-xs font-mono">
                    <div className="p-3 bg-white/5 border border-white/5 rounded-xl">
                      <span className="text-white/40 block text-[9px] uppercase">Slot Capacity</span>
                      <span className="text-[#00fbfb] font-bold block mt-1">500 Slots Total</span>
                    </div>
                    <div className="p-3 bg-white/5 border border-white/5 rounded-xl">
                      <span className="text-white/40 block text-[9px] uppercase">Active Status</span>
                      <span className="text-[#39FF14] font-bold block mt-1">Campaign Open</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={onClaimOffer}
                    className="w-full py-4 bg-[#00fbfb] text-black font-mono text-xs uppercase tracking-widest font-black rounded-xl hover:shadow-[0_0_25px_rgba(0,251,251,0.5)] transition active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer mt-4"
                  >
                    <span>Request Studio Access Now</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </div>

      </div>
    </div>
  );
}
