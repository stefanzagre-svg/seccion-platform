"use client";

import PublicFooter from "@/components/PublicFooter";
import React, { useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import PublicNavbar from '../PublicNavbar';
import { useTranslation } from '@/context/LanguageContext';
import { Heart, Flame, Compass, Cpu, Zap, EyeOff, UserCheck, ShieldCheck, Landmark, Sparkles } from 'lucide-react';

// Custom Hook for Mouse Tracking on Glass Cards
function useMouseTracking() {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    cardRef.current.style.setProperty('--mouse-x', `${x}px`);
    cardRef.current.style.setProperty('--mouse-y', `${y}px`);
  };

  return { cardRef, handleMouseMove };
}

// Reusable Glass Card Component
function GlassCard({ children, className = "", style = {} }: { children: React.ReactNode, className?: string, style?: React.CSSProperties }) {
  const { cardRef, handleMouseMove } = useMouseTracking();
  
  return (
    <div 
      ref={cardRef}
      onMouseMove={handleMouseMove}
      className={`bg-[rgba(255,255,255,0.03)] backdrop-blur-md border border-[rgba(255,255,255,0.08)] rounded-xl relative ${className}`}
      style={style}
    >
      {children}
    </div>
  );
}

const LaserLinesSVG = () => (
  <svg
    className="absolute w-full h-full opacity-90 hidden md:block"
    viewBox="0 0 1440 1024"
    preserveAspectRatio="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <filter id="g-laser-glow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="8" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
      <filter id="g-electric-glow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="4" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="blur" />
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
    <g>
      {/* Line 1 — Cyan Main */}
      <g style={{ animation: 'float-laser 10s ease-in-out infinite' }}>
        <path d="M 1100, 100 C 500,-100 300,400 800,500 C 1300,600 1100,1100 500,900" fill="none" stroke="#00fbfb" strokeWidth="3" filter="url(#g-laser-glow)" opacity="0.5" />
        <path d="M 1100, 100 C 500,-100 300,400 800,500 C 1300,600 1100,1100 500,900" fill="none" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" filter="url(#g-electric-glow)" style={{ strokeDasharray: '250 3000', strokeDashoffset: 3250, animation: 'electric-pulse 3.5s linear infinite 0s' }} />
      </g>
      {/* Line 2 — Pink Inner */}
      <g style={{ animation: 'float-laser 12s ease-in-out infinite reverse' }}>
        <path d="M 1050, 150 C 450,-50 250,450 750,550 C 1250,650 1050,1150 450,950" fill="none" stroke="#ffabf3" strokeWidth="1.5" filter="url(#g-laser-glow)" opacity="0.6" />
        <path d="M 1050, 150 C 450,-50 250,450 750,550 C 1250,650 1050,1150 450,950" fill="none" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" filter="url(#g-electric-glow)" style={{ strokeDasharray: '150 2500', strokeDashoffset: 2650, animation: 'electric-pulse 4.2s linear infinite 1.2s' }} />
      </g>
      {/* Line 3 — Deep Purple Outer */}
      <g style={{ animation: 'float-laser 15s ease-in-out infinite' }}>
        <path d="M 1150, 50 C 550,-150 350,350 850,450 C 1350,550 1150,1050 550,850" fill="none" stroke="#fe00fe" strokeWidth="2.5" filter="url(#g-laser-glow)" opacity="0.5" />
        <path d="M 1150, 50 C 550,-150 350,350 850,450 C 1350,550 1150,1050 550,850" fill="none" stroke="#ffabf3" strokeWidth="4" strokeLinecap="round" filter="url(#g-electric-glow)" style={{ strokeDasharray: '300 3500', strokeDashoffset: 3800, animation: 'electric-pulse 5.5s linear infinite 0.5s' }} />
      </g>
      {/* Line 4 — Cyan Bright Accent */}
      <g style={{ animation: 'float-laser 8s ease-in-out infinite reverse' }}>
        <path d="M 1000, 200 C 400,0 200,500 700,600 C 1200,700 1000,1200 400,1000" fill="none" stroke="#00fbfb" strokeWidth="1" filter="url(#g-laser-glow)" opacity="0.8" />
        <path d="M 1000, 200 C 400,0 200,500 700,600 C 1200,700 1000,1200 400,1000" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" filter="url(#g-electric-glow)" style={{ strokeDasharray: '100 2000', strokeDashoffset: 2100, animation: 'electric-pulse 2.8s linear infinite 2s' }} />
      </g>
      {/* Line 5 — Magenta Cross Thread */}
      <g style={{ animation: 'float-laser 18s ease-in-out infinite' }}>
        <path d="M 1120, 80 C 480,-80 320,420 820,520 C 1320,620 1120,1120 520,920" fill="none" stroke="#fe00fe" strokeWidth="2" filter="url(#g-laser-glow)" opacity="0.5" />
        <path d="M 1120, 80 C 480,-80 320,420 820,520 C 1320,620 1120,1120 520,920" fill="none" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" filter="url(#g-electric-glow)" style={{ strokeDasharray: '200 4000', strokeDashoffset: 4200, animation: 'electric-pulse 6s linear infinite 3.5s' }} />
      </g>
    </g>
  </svg>
);

export default function LandingPageHook({ onAccept, onBecomeCreator }: { onAccept: () => void, onBecomeCreator: () => void }) {
  const [activeTab, setActiveTab] = useState<'members' | 'creators'>('members');
  const pathname = usePathname();
  const { t } = useTranslation();
  const isAlreadyOnboarding = pathname === "/onboarding";

  return (
    <div className="w-full min-h-screen text-[#e2e2e2] overflow-x-hidden font-['Hanken_Grotesk'] relative" 
         style={{ 
           backgroundColor: 'transparent',
           backgroundImage: 'radial-gradient(circle at 15% 50%, rgba(255, 171, 243, 0.05), transparent 25%), radial-gradient(circle at 85% 30%, rgba(0, 251, 251, 0.05), transparent 25%)'
         }}>
      
      {/* Foreground Laser Lines (z-[35]: Above typography and cards, below TopNavBar) */}
      <div className="hidden md:block absolute inset-0 overflow-hidden pointer-events-none z-[35]">
        <LaserLinesSVG />
      </div>
      
      {/* TopNavBar */}
      <PublicNavbar onSignUp={onAccept} />

      {/* Main Content Canvas */}
      <main className="relative pt-28 sm:pt-36 pb-24 sm:pb-36 px-4 sm:px-6 md:px-12 lg:px-20 max-w-[1440px] mx-auto min-h-[calc(100vh-80px)] flex items-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center w-full z-40 relative">
          
          {/* Left Column: Hero H1 + Swipe to Sign Up */}
          <div className="col-span-12 lg:col-span-6 space-y-6 sm:space-y-10 flex flex-col justify-center relative z-40">
            <div className="space-y-3 sm:space-y-4">
              <h1 className="font-['Plus_Jakarta_Sans'] font-black leading-[1.05] tracking-[-0.04em] text-left">
                <span className="block text-white text-3xl sm:text-5xl md:text-7xl lg:text-8xl">{t("landing.fusionTitle", "Fusion Platform")}</span>
                <span className="block text-[#00fbfb] drop-shadow-[0_0_25px_rgba(0,251,251,0.3)] text-2xl sm:text-4xl md:text-6xl mt-1 sm:mt-2">{t("landing.dating", "Dating")}</span>
                <span className="block text-[#00fbfb] drop-shadow-[0_0_25px_rgba(0,251,251,0.3)] text-2xl sm:text-4xl md:text-6xl mt-0.5 sm:mt-1">{t("landing.liveStreaming", "Live Streaming")}</span>
                <span className="block text-[#ffabf3] drop-shadow-[0_0_25px_rgba(255,171,243,0.3)] text-2xl sm:text-4xl md:text-6xl mt-0.5 sm:mt-1">{t("landing.contentCreators", "Content Creators")}</span>
              </h1>
            </div>

            {/* Swipe to Sign Up Card */}
            {isAlreadyOnboarding ? (
              <button 
                type="button"
                onClick={onAccept} 
                className="w-full bg-white/[0.03] backdrop-blur-xl border border-white/10 hover:border-[#00fbfb]/50 p-5 sm:p-8 rounded-[1.5rem] sm:rounded-[2rem] shadow-[0_20px_40px_rgba(0,0,0,0.4)] text-center group cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 relative overflow-hidden z-40 block"
              >
                {/* Refraction edge highlights */}
                <div className="absolute inset-0 border border-white/5 rounded-[1.5rem] sm:rounded-[2rem] pointer-events-none" />
                <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-center font-['Plus_Jakarta_Sans'] text-base sm:text-[22px] md:text-[24px] font-extrabold leading-tight tracking-tight text-white mb-2">
                  <span>{t("landing.swipeToSignUp", "SWIPE TO SIGN UP TO")}</span>
                  <img 
                    src="/assets/logo/seccion-wordmark-light.png" 
                    alt="SECCION" 
                    className="h-5 sm:h-6 md:h-7 object-contain inline-block drop-shadow-[0_0_15px_rgba(0,251,251,0.6)] group-hover:drop-shadow-[0_0_25px_rgba(0,251,251,0.9)] transition-all duration-300"
                  />
                </div>
                <div className="flex justify-center items-center gap-4 mt-4">
                  <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-[#00fbfb]/50 group-hover:to-[#00fbfb] transition-all duration-300"></div>
                  <div className="w-10 h-10 rounded-full border border-[#00fbfb]/30 group-hover:border-[#00fbfb] flex items-center justify-center animate-bounce shadow-[0_0_15px_rgba(0,251,251,0.1)] group-hover:shadow-[0_0_15px_rgba(0,251,251,0.4)] transition-all duration-300">
                    <svg className="w-5 h-5 text-[#00fbfb]" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9 11.24V7.5C9 6.12 10.12 5 11.5 5S14 6.12 14 7.5v3.74c1.21-.81 2-2.18 2-3.74C16 5.01 13.99 3 11.5 3S7 5.01 7 7.5c0 1.56.79 2.93 2 3.74zm9.84 4.63l-4.54-2.26c-.17-.07-.35-.11-.54-.11H13v-6c0-.83-.67-1.5-1.5-1.5S10 6.67 10 7.5v10.74l-3.43-.72c-.08-.01-.15-.03-.24-.03-.31 0-.59.13-.79.33l-.79.8 4.94 4.94c.27.27.65.44 1.06.44h6.79c.75 0 1.33-.55 1.44-1.28l.75-5.27c.01-.07.02-.14.02-.2 0-.62-.38-1.16-.91-1.38z"/>
                    </svg>
                  </div>
                  <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-[#00fbfb]/50 group-hover:to-[#00fbfb] transition-all duration-300"></div>
                </div>
              </button>
            ) : (
              <Link 
                href="/onboarding"
                className="w-full bg-white/[0.03] backdrop-blur-xl border border-white/10 hover:border-[#00fbfb]/50 p-5 sm:p-8 rounded-[1.5rem] sm:rounded-[2rem] shadow-[0_20px_40px_rgba(0,0,0,0.4)] text-center group cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 relative overflow-hidden z-40 block"
              >
                {/* Refraction edge highlights */}
                <div className="absolute inset-0 border border-white/5 rounded-[1.5rem] sm:rounded-[2rem] pointer-events-none" />
                <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-center font-['Plus_Jakarta_Sans'] text-base sm:text-[22px] md:text-[24px] font-extrabold leading-tight tracking-tight text-white mb-2">
                  <span>{t("landing.swipeToSignUp", "SWIPE TO SIGN UP TO")}</span>
                  <img 
                    src="/assets/logo/seccion-wordmark-light.png" 
                    alt="SECCION" 
                    className="h-5 sm:h-6 md:h-7 object-contain inline-block drop-shadow-[0_0_15px_rgba(0,251,251,0.6)] group-hover:drop-shadow-[0_0_25px_rgba(0,251,251,0.9)] transition-all duration-300"
                  />
                </div>
                <div className="flex justify-center items-center gap-4 mt-4">
                  <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-[#00fbfb]/50 group-hover:to-[#00fbfb] transition-all duration-300"></div>
                  <div className="w-10 h-10 rounded-full border border-[#00fbfb]/30 group-hover:border-[#00fbfb] flex items-center justify-center animate-bounce shadow-[0_0_15px_rgba(0,251,251,0.1)] group-hover:shadow-[0_0_15px_rgba(0,251,251,0.4)] transition-all duration-300">
                    <svg className="w-5 h-5 text-[#00fbfb]" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9 11.24V7.5C9 6.12 10.12 5 11.5 5S14 6.12 14 7.5v3.74c1.21-.81 2-2.18 2-3.74C16 5.01 13.99 3 11.5 3S7 5.01 7 7.5c0 1.56.79 2.93 2 3.74zm9.84 4.63l-4.54-2.26c-.17-.07-.35-.11-.54-.11H13v-6c0-.83-.67-1.5-1.5-1.5S10 6.67 10 7.5v10.74l-3.43-.72c-.08-.01-.15-.03-.24-.03-.31 0-.59.13-.79.33l-.79.8 4.94 4.94c.27.27.65.44 1.06.44h6.79c.75 0 1.33-.55 1.44-1.28l.75-5.27c.01-.07.02-.14.02-.2 0-.62-.38-1.16-.91-1.38z"/>
                    </svg>
                  </div>
                  <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-[#00fbfb]/50 group-hover:to-[#00fbfb] transition-all duration-300"></div>
                </div>
              </Link>
            )}
          </div>

          {/* Right Column: Tabbed Key Points Switcher Card */}
          <div className="col-span-12 lg:col-span-6 flex flex-col justify-center">
            <div className={`w-full bg-white/[0.02] border rounded-[2rem] p-1.5 shadow-[0_25px_50px_rgba(0,0,0,0.5)] backdrop-blur-xl relative z-30 transition-all duration-500 ${activeTab === 'members' ? 'border-white/10 shadow-[#00fbfb]/5' : 'border-[#ffabf3]/20 shadow-[#ffabf3]/5'}`}>
              <div className="bg-black/40 rounded-[calc(2rem-0.375rem)] p-6 md:p-8 border border-white/5">
                
                {/* Tab Selector Buttons */}
                <div className="flex bg-white/5 border border-white/5 p-1 rounded-full mb-6 relative">
                  <button
                    onClick={() => setActiveTab('members')}
                    className={`flex-grow basis-0 py-2.5 text-center text-[10px] font-['JetBrains_Mono'] uppercase tracking-wider font-bold rounded-full relative z-10 transition-colors duration-300 ${activeTab === 'members' ? 'text-black' : 'text-[#b9cac9] hover:text-[#00fbfb]'}`}
                  >
                    {t("landing.memberQuestTab", "Member Quest (Vibe Check)")}
                  </button>
                  <button
                    onClick={() => setActiveTab('creators')}
                    className={`flex-grow basis-0 py-2.5 text-center text-[10px] font-['JetBrains_Mono'] uppercase tracking-wider font-bold rounded-full relative z-10 transition-colors duration-300 ${activeTab === 'creators' ? 'text-black' : 'text-[#b9cac9] hover:text-[#ffabf3]'}`}
                  >
                    {t("landing.creatorFusionTab", "Creator Fusion (Biz-in-a-Box)")}
                  </button>
                  
                  {/* Active Indicator Slider */}
                  <motion.div
                    className="absolute top-1 bottom-1 rounded-full"
                    layoutId="activeTabSlider"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    style={{
                      left: activeTab === 'members' ? '4px' : 'calc(50% + 2px)',
                      width: 'calc(50% - 6px)',
                      backgroundColor: activeTab === 'members' ? '#00fbfb' : '#ffabf3',
                      boxShadow: activeTab === 'members' ? '0 0 15px #00fbfb' : '0 0 15px #ffabf3',
                    }}
                  />
                </div>

                {/* Tab Content with Framer Motion AnimatePresence */}
                <div className="min-h-[300px] flex items-center relative">
                  <AnimatePresence mode="wait">
                    {activeTab === 'members' ? (
                      <motion.div
                        key="members"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
                        className="space-y-6 w-full text-left"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          
                          <div className="flex gap-3.5 items-start">
                            <div className="w-9 h-9 rounded-xl bg-[#00fbfb]/10 border border-[#00fbfb]/20 flex items-center justify-center shrink-0">
                              <Heart className="w-5 h-5 text-[#00fbfb]" />
                            </div>
                            <div>
                              <h4 className="text-[14px] font-['Plus_Jakarta_Sans'] font-bold text-white mb-0.5">{t("landing.memberFeature1Title", "100% Free Synergy Sync")}</h4>
                              <p className="text-[11px] font-['Hanken_Grotesk'] text-[#b9cac9] leading-relaxed">{t("landing.memberFeature1Desc", "No paywalls to connect. Swiping and matching is completely free, funded by our creator ecosystem.")}</p>
                            </div>
                          </div>

                          <div className="flex gap-3.5 items-start">
                            <div className="w-9 h-9 rounded-xl bg-[#00fbfb]/10 border border-[#00fbfb]/20 flex items-center justify-center shrink-0">
                              <Flame className="w-5 h-5 text-[#00fbfb]" />
                            </div>
                            <div>
                              <h4 className="text-[14px] font-['Plus_Jakarta_Sans'] font-bold text-white mb-0.5">{t("landing.memberFeature2Title", "The Chemistry Meter")}</h4>
                              <p className="text-[11px] font-['Hanken_Grotesk'] text-[#b9cac9] leading-relaxed">{t("landing.memberFeature2Desc", "An 8-level RPG-style synergy tracker showing exactly where you stand. Skip the situationship limbo.")}</p>
                            </div>
                          </div>

                          <div className="flex gap-3.5 items-start">
                            <div className="w-9 h-9 rounded-xl bg-[#00fbfb]/10 border border-[#00fbfb]/20 flex items-center justify-center shrink-0">
                              <Compass className="w-5 h-5 text-[#00fbfb]" />
                            </div>
                            <div>
                              <h4 className="text-[14px] font-['Plus_Jakarta_Sans'] font-bold text-white mb-0.5">{t("landing.memberFeature3Title", "Relationship Skill Tree")}</h4>
                              <p className="text-[11px] font-['Hanken_Grotesk'] text-[#b9cac9] leading-relaxed">{t("landing.memberFeature3Desc", "Unlock 60+ suggestion moves—from Level 2 Digital Pokes, to Level 4 Coffee Quests, up to Level 6 trips.")}</p>
                            </div>
                          </div>

                          <div className="flex gap-3.5 items-start">
                            <div className="w-9 h-9 rounded-xl bg-[#00fbfb]/10 border border-[#00fbfb]/20 flex items-center justify-center shrink-0">
                              <Cpu className="w-5 h-5 text-[#00fbfb]" />
                            </div>
                            <div>
                              <h4 className="text-[14px] font-['Plus_Jakarta_Sans'] font-bold text-white mb-0.5">{t("landing.memberFeature4Title", "AI Wingman Coach")}</h4>
                              <p className="text-[11px] font-['Hanken_Grotesk'] text-[#b9cac9] leading-relaxed">{t("landing.memberFeature4Desc", "Tracks Conversation Gravity in real-time, feeding you custom prompts and icebreakers when chats run dry.")}</p>
                            </div>
                          </div>

                          <div className="flex gap-3.5 items-start">
                            <div className="w-9 h-9 rounded-xl bg-[#00fbfb]/10 border border-[#00fbfb]/20 flex items-center justify-center shrink-0">
                              <Sparkles className="w-5 h-5 text-[#00fbfb]" />
                            </div>
                            <div>
                              <h4 className="text-[14px] font-['Plus_Jakarta_Sans'] font-bold text-white mb-0.5">{t("landing.memberFeature5Title", "3-Min Onboarding Quest")}</h4>
                              <p className="text-[11px] font-['Hanken_Grotesk'] text-[#b9cac9] leading-relaxed">{t("landing.memberFeature5Desc", "Select your core personality archetype to auto-populate 15 fields and start vibing with real connections in under 3 minutes.")}</p>
                            </div>
                          </div>

                          <div className="flex gap-3.5 items-start">
                            <div className="w-9 h-9 rounded-xl bg-[#00fbfb]/10 border border-[#00fbfb]/20 flex items-center justify-center shrink-0">
                              <Compass className="w-5 h-5 text-[#00fbfb]" />
                            </div>
                            <div>
                              <h4 className="text-[14px] font-['Plus_Jakarta_Sans'] font-bold text-white mb-0.5">{t("landing.memberFeature6Title", "Gemini AI Synergy Engine")}</h4>
                              <p className="text-[11px] font-['Hanken_Grotesk'] text-[#b9cac9] leading-relaxed">{t("landing.memberFeature6Desc", "Reads your vibe across 9 archetypes, mood, and momentum, giving a visceral Synergy Aura explanation.")}</p>
                            </div>
                          </div>

                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="creators"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
                        className="space-y-6 w-full text-left"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          
                          <div className="flex gap-3.5 items-start">
                            <div className="w-9 h-9 rounded-xl bg-[#ffabf3]/10 border border-[#ffabf3]/20 flex items-center justify-center shrink-0">
                              <Zap className="w-5 h-5 text-[#ffabf3]" />
                            </div>
                            <div>
                              <h4 className="text-[14px] font-['Plus_Jakarta_Sans'] font-bold text-white mb-0.5">{t("landing.creatorFeature1Title", "80/20 Revenue Split")}</h4>
                              <p className="text-[11px] font-['Hanken_Grotesk'] text-[#b9cac9] leading-relaxed">{t("landing.creatorFeature1Desc", "Keep 80% of subscription and tip coin. Mutual match is required to unlock subscriptions—slashing churn.")}</p>
                            </div>
                          </div>

                          <div className="flex gap-3.5 items-start">
                            <div className="w-9 h-9 rounded-xl bg-[#ffabf3]/10 border border-[#ffabf3]/20 flex items-center justify-center shrink-0">
                              <Cpu className="w-5 h-5 text-[#ffabf3]" />
                            </div>
                            <div>
                              <h4 className="text-[14px] font-['Plus_Jakarta_Sans'] font-bold text-white mb-0.5">{t("landing.creatorFeature2Title", "Free AI Operations Agent")}</h4>
                              <p className="text-[11px] font-['Hanken_Grotesk'] text-[#b9cac9] leading-relaxed">{t("landing.creatorFeature2Desc", "Free Year 1. Replaces MCNs: runs 24/7 chat in your voice, forecasts taxes, and schedules multi-platform promos.")}</p>
                            </div>
                          </div>

                          <div className="flex gap-3.5 items-start">
                            <div className="w-9 h-9 rounded-xl bg-[#ffabf3]/10 border border-[#ffabf3]/20 flex items-center justify-center shrink-0">
                              <EyeOff className="w-5 h-5 text-[#ffabf3]" />
                            </div>
                            <div>
                              <h4 className="text-[14px] font-['Plus_Jakarta_Sans'] font-bold text-white mb-0.5">{t("landing.creatorFeature3Title", "Face Blur Encryption")}</h4>
                              <p className="text-[11px] font-['Hanken_Grotesk'] text-[#b9cac9] leading-relaxed">{t("landing.creatorFeature3Desc", "Obscures your face on public feeds, lifting only for Master Subscribers or Chemistry Level 4+ connections.")}</p>
                            </div>
                          </div>

                          <div className="flex gap-3.5 items-start">
                            <div className="w-9 h-9 rounded-xl bg-[#ffabf3]/10 border border-[#ffabf3]/20 flex items-center justify-center shrink-0">
                              <UserCheck className="w-5 h-5 text-[#ffabf3]" />
                            </div>
                            <div>
                              <h4 className="text-[14px] font-['Plus_Jakarta_Sans'] font-bold text-white mb-0.5">{t("landing.creatorFeature4Title", "Broadcasting Match HUD")}</h4>
                              <p className="text-[11px] font-['Hanken_Grotesk'] text-[#b9cac9] leading-relaxed">{t("landing.creatorFeature4Desc", "Broadcasting cockpit featuring a live Audience Match HUD to see viewers' Synergy Sync levels in real-time.")}</p>
                            </div>
                          </div>

                          <div className="flex gap-3.5 items-start">
                            <div className="w-9 h-9 rounded-xl bg-[#ffabf3]/10 border border-[#ffabf3]/20 flex items-center justify-center shrink-0">
                              <ShieldCheck className="w-5 h-5 text-[#ffabf3]" />
                            </div>
                            <div>
                              <h4 className="text-[14px] font-['Plus_Jakarta_Sans'] font-bold text-white mb-0.5">{t("landing.creatorFeature5Title", "DRM Web Sweeper")}</h4>
                              <p className="text-[11px] font-['Hanken_Grotesk'] text-[#b9cac9] leading-relaxed">{t("landing.creatorFeature5Desc", "Hunts down leaks across the web and auto-fires takedowns so your content stays yours.")}</p>
                            </div>
                          </div>

                          <div className="flex gap-3.5 items-start">
                            <div className="w-9 h-9 rounded-xl bg-[#ffabf3]/10 border border-[#ffabf3]/20 flex items-center justify-center shrink-0">
                              <Landmark className="w-5 h-5 text-[#ffabf3]" />
                            </div>
                            <div>
                              <h4 className="text-[14px] font-['Plus_Jakarta_Sans'] font-bold text-white mb-0.5">{t("landing.creatorFeature6Title", "NLP Contract Scanner")}</h4>
                              <p className="text-[11px] font-['Hanken_Grotesk'] text-[#b9cac9] leading-relaxed">{t("landing.creatorFeature6Desc", "Scans your brand contracts in seconds — flags shady sunset commissions and unauthorized likeness grabs before you sign.")}</p>
                            </div>
                          </div>

                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

              </div>
            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <PublicFooter />
    </div>
  );
}
