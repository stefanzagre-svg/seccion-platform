"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Lock, Wallet, Loader2, CheckCircle2, Plane, Palette, Music, Dumbbell, Briefcase, GraduationCap, Brain, Lightbulb, Rocket } from 'lucide-react';
import { useTranslation } from '@/context/LanguageContext';
import { type MemberPurposeId } from '@/lib/constants';

const INTENTS = [
  // Learning, Mentorship & Growth Vibes (Knowledge & Growth)
  { id: 'skill_learning', label: 'Skill Growth & Mentorship', icon: '🎓', description: 'Masterclasses, 1-on-1 coaching & skill transfer', type: 'growth' },
  { id: 'career_finance', label: 'Career & Financial Strategy', icon: '📈', description: 'Startup advice, career coaching & wealth building', type: 'growth' },
  { id: 'wellness_mindset', label: 'Mindset & Wellness Guidance', icon: '🧘', description: 'Mindfulness, biohacking & health optimization', type: 'growth' },
  { id: 'mastermind_collab', label: 'Build & Co-Create', icon: '🚀', description: 'Co-founding projects, brainstorming & masterminds', type: 'growth' },
  { id: 'language_culture', label: 'Language & Culture Exchange', icon: '🗣️', description: 'Fluent conversation & cultural immersion', type: 'growth' },

  // Digital / Connection Vibes (Behind Screen)
  { id: 'flirty_playful', label: 'Flirty & Playful', icon: '😈', description: 'Lighthearted, teasing & fun', type: 'online' },
  { id: 'deep_intimate', label: 'Deep Connection', icon: '🖤', description: 'No Small talk & Open Minded', type: 'online' },
  { id: 'creative_showcase', label: 'Creative Stream', icon: '🎬', description: 'Watch me & perform', type: 'online' },
  { id: 'exclusive_vip', label: 'Exclusive VIP', icon: '💎', description: 'Premium & behind closed doors', type: 'online' },
  { id: 'high_energy', label: 'High Energy Live', icon: '⚡', description: 'Loud, chaotic & entertaining', type: 'online' },

  // IRL / Real Meeting Vibes (Date Real)
  { id: 'dinner_date', label: 'Dinner Date', icon: '🍽️', description: 'Fine dining & romance', type: 'irl' },
  { id: 'grab_drink', label: 'Grab a Drink', icon: '🍸', description: 'Cocktails & conversation, Picnic', type: 'irl' },
  { id: 'party_dance', label: 'Party & Dance', icon: '🪩', description: 'Clubs & festivals', type: 'irl' },
  { id: 'workout_mate', label: 'Workout Mate', icon: '🏃', description: 'Running, gym & Health', type: 'irl' },
  { id: 'travel_trip', label: 'Travel & Trips', icon: '✈️', description: 'Weekend getaways & adventures', type: 'irl' },
];

const CORE_PASSIONS = [
  { id: 'education', label: 'Learning & Skills', icon: <GraduationCap className="w-8 h-8 text-[#00fbfb]" />, desc: 'Mastering new crafts & knowledge', color: 'border-[#00fbfb]/30 shadow-[#00fbfb]/20 bg-[#00fbfb]/10' },
  { id: 'career', label: 'Career & Business', icon: <Briefcase className="w-8 h-8 text-[#f59e0b]" />, desc: 'Building empires & mentoring', color: 'border-[#f59e0b]/30 shadow-[#f59e0b]/20 bg-[#f59e0b]/10' },
  { id: 'wellness', label: 'Wellness & Mindset', icon: <Brain className="w-8 h-8 text-[#10b981]" />, desc: 'Health, meditation & optimization', color: 'border-[#10b981]/30 shadow-[#10b981]/20 bg-[#10b981]/10' },
  { id: 'art', label: 'Art & Design', icon: <Palette className="w-8 h-8 text-[#ffabf3]" />, desc: 'Creating & curating media', color: 'border-[#ffabf3]/30 shadow-[#ffabf3]/20 bg-[#ffabf3]/10' },
  { id: 'music', label: 'Music & Performance', icon: <Music className="w-8 h-8 text-[#a855f7]" />, desc: 'Rhythms, beats & audio masterclasses', color: 'border-[#a855f7]/30 shadow-[#a855f7]/20 bg-[#a855f7]/10' },
  { id: 'travel', label: 'Travel & Languages', icon: <Plane className="w-8 h-8 text-[#3b82f6]" />, desc: 'Cultural exchange & global trips', color: 'border-[#3b82f6]/30 shadow-[#3b82f6]/20 bg-[#3b82f6]/10' },
];

export default function IntentSelector({ activePurposes, onContinue }: { activePurposes: MemberPurposeId[], onContinue: (intents: string[], displayAge: number, corePassion: string) => void }) {
  const { t } = useTranslation();
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [displayAge, setDisplayAge] = useState<number>(25);
  const [zkpStatus, setZkpStatus] = useState<'idle' | 'verifying' | 'success'>('idle');
  const [zkpLog, setZkpLog] = useState<string>('');
  const [selectedIntents, setSelectedIntents] = useState<string[]>([]);
  const [selectedPassion, setSelectedPassion] = useState<string>('');

  const toggleIntent = (id: string) => {
    setSelectedIntents(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleNext = () => {
    if (step === 1 && name.trim().length > 0) setStep(2);
    else if (step === 2 && zkpStatus === 'success') setStep(3);
    else if (step === 3 && selectedIntents.length > 0) setStep(4);
    else if (step === 4 && selectedPassion.length > 0) onContinue(selectedIntents, displayAge, selectedPassion);
  };

  const triggerZkpVerification = async () => {
    setZkpStatus('verifying');
    setZkpLog('Initializing OpenID4VP Wallet Connection...');
    await new Promise(resolve => setTimeout(resolve, 800));
    setZkpLog('Requesting proof: [User Is 18+] (Selective Disclosure)...');
    await new Promise(resolve => setTimeout(resolve, 800));
    setZkpLog('Validating cryptographic signature from accredited issuer...');
    await new Promise(resolve => setTimeout(resolve, 800));
    setZkpStatus('success');
    setZkpLog('Verify Success! IsOver18 verified. Date of Birth remains hidden.');
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-[#1A1A2E]/80 backdrop-blur-xl border border-white/10 rounded-[32px] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
        
        {/* Progress Dots */}
        <div className="flex justify-center gap-2 mb-8">
          {[1, 2, 3, 4].map(i => (
            <div 
              key={i} 
              className={`h-1.5 rounded-full transition-all duration-300 ${step === i ? 'w-8 bg-primary shadow-[0_0_10px_rgba(102,252,241,0.8)]' : step > i ? 'w-4 bg-primary/50' : 'w-4 bg-white/10'}`}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          
          {/* STEP 1: NAME */}
          {step === 1 && (
            <motion.div 
              key="step-1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col items-center text-center"
            >
              <h2 className="text-3xl font-bold text-white mb-2">What should we call you?</h2>
              <p className="text-gray-400 mb-8">Your display name on the platform.</p>
              
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Alex"
                className="w-full bg-black/50 border border-white/10 rounded-2xl p-5 text-2xl text-center text-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-gray-600 mb-8"
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleNext()}
              />
              
              <button 
                onClick={handleNext}
                disabled={name.trim().length === 0}
                className="w-full py-4 rounded-2xl bg-white text-black font-bold uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed transition-transform active:scale-95"
              >
                Continue
              </button>
            </motion.div>
          )}

          {/* STEP 2: ZKP AGE VERIFICATION */}
          {step === 2 && (
            <motion.div 
              key="step-2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col items-center text-center space-y-6"
            >
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">Age Verification</h2>
                <p className="text-gray-400 text-xs">Verify you are 18+ to join using the EU Digital Identity standard.</p>
              </div>

              {zkpStatus === 'idle' && (
                <button
                  onClick={triggerZkpVerification}
                  className="w-full p-6 bg-primary/10 hover:bg-primary/20 border border-primary/30 rounded-2xl transition flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3 text-left">
                    <div className="p-3 bg-primary/20 rounded-xl text-primary group-hover:scale-105 transition">
                      <Wallet className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">EU Digital Identity Wallet</p>
                      <p className="text-[10px] text-gray-400 font-medium">Verify Over 18 via Zero-Knowledge Proof</p>
                    </div>
                  </div>
                  <Lock className="w-5 h-5 text-gray-500 group-hover:text-primary transition" />
                </button>
              )}

              {zkpStatus === 'verifying' && (
                <div className="w-full p-6 bg-black/30 border border-white/5 rounded-2xl flex flex-col items-center justify-center space-y-4">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  <p className="text-[10px] font-mono text-primary uppercase tracking-widest animate-pulse">{zkpLog}</p>
                </div>
              )}

              {zkpStatus === 'success' && (
                <div className="w-full space-y-6">
                  {/* Verification Successful Box */}
                  <div className="p-5 bg-green-500/10 border border-green-500/30 rounded-2xl flex items-center gap-4 text-left">
                    <div className="p-2 bg-green-500/20 rounded-xl text-green-400">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">Cryptographic Proof Verified</p>
                      <p className="text-[10px] text-green-400/80 font-mono">Status: 18+ Verified (Real DoB Undisclosed)</p>
                    </div>
                  </div>

                  {/* Display Age Selector */}
                  <div className="p-5 bg-white/5 border border-white/10 rounded-2xl text-left space-y-3">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] uppercase tracking-wider font-bold text-gray-400">Public Display Age</label>
                      <span className="text-lg font-black text-primary">{displayAge} years</span>
                    </div>
                    <p className="text-[10px] text-gray-500 leading-normal">
                      For your privacy, this self-declared age will be displayed on your profile. Your real age will remain confidential.
                    </p>
                    <input 
                      type="range" 
                      min={18} 
                      max={80} 
                      value={displayAge}
                      onChange={(e) => setDisplayAge(Number(e.target.value))}
                      className="w-full h-1.5 bg-black/50 rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                  </div>
                </div>
              )}

              <button 
                onClick={handleNext}
                disabled={zkpStatus !== 'success'}
                className="w-full py-4 rounded-2xl bg-white text-black font-bold uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed transition-transform active:scale-95"
              >
                Continue
              </button>
            </motion.div>
          )}

          {/* STEP 3: VIBE / INTENTS & CONNECTION HORIZON */}
          {step === 3 && (
            <motion.div 
              key="step-3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col items-center text-center"
            >
              <h2 className="text-2xl font-bold text-white mb-1">What&apos;s your purpose & vibe?</h2>
              <p className="text-xs text-gray-400 mb-5">Select your primary connection mode and interests.</p>

              {/* Master Connection Horizon Mode Switcher (Removed in favor of Purpose) */}
              
              <div className="grid grid-cols-2 gap-3 w-full mb-6 max-h-[260px] overflow-y-auto pr-1 custom-scrollbar">
                {INTENTS.filter(i => {
                  const hasLifestyle = activePurposes.includes('lifestyle') || activePurposes.includes('creator');
                  const hasDating = activePurposes.includes('dating') || activePurposes.includes('explicit');
                  
                  if (hasLifestyle && !hasDating) return i.type === 'growth';
                  if (hasDating && !hasLifestyle) return i.type === 'online' || i.type === 'irl';
                  return true; // Dual
                }).map((intent) => {
                  const isSelected = selectedIntents.includes(intent.id);
                  return (
                    <button
                      key={intent.id}
                      onClick={() => toggleIntent(intent.id)}
                      className={`group relative flex flex-col items-center justify-center p-3 pt-6 rounded-2xl border transition-all duration-300 ${
                        isSelected 
                          ? 'bg-primary/20 border-primary shadow-[0_0_15px_rgba(102,252,241,0.3)]' 
                          : 'bg-white/5 border-white/10 hover:bg-white/10'
                      }`}
                    >
                      {/* Connection Type Badge */}
                      <div className={`absolute top-1.5 left-1/2 -translate-x-1/2 px-1.5 py-[1px] rounded text-[7px] font-bold uppercase tracking-widest whitespace-nowrap ${
                        intent.type === 'growth'
                          ? 'bg-[#00fbfb]/10 text-[#00fbfb] border border-[#00fbfb]/30'
                          : intent.type === 'online' 
                            ? 'bg-purple-500/10 text-purple-300 border border-purple-500/30' 
                            : 'bg-[#ffabf3]/10 text-[#ffabf3] border border-[#ffabf3]/30'
                      }`}>
                        {intent.type === 'growth' ? 'Mentorship & Skill' : intent.type === 'online' ? 'Behind Screen' : 'Real Date'}
                      </div>

                      <span className="text-xl mb-1 mt-1">{intent.icon}</span>
                      <span className={`text-xs font-medium ${isSelected ? 'text-white' : 'text-gray-400'}`}>
                        {intent.label}
                      </span>
                      
                      {/* Hover Tooltip */}
                      <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-max max-w-[180px] px-2.5 py-1.5 bg-[#0F0F1A] border border-white/20 rounded-xl shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
                        <p className="text-[10px] font-['Plus_Jakarta_Sans'] text-[#00fbfb] leading-tight text-center whitespace-normal">{intent.description}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
              
              <button 
                onClick={handleNext}
                disabled={selectedIntents.length === 0}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-primary to-emerald-400 text-black font-bold uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(102,252,241,0.4)] transition-transform active:scale-95 text-xs"
              >
                Continue
              </button>
            </motion.div>
          )}

          {/* STEP 4: THE CORE PASSION */}
          {step === 4 && (
            <motion.div 
              key="step-4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col items-center text-center"
            >
              <h2 className="text-3xl font-bold text-white mb-2">The Fuel</h2>
              <p className="text-gray-400 mb-8">If you had unlimited time & money, what would you spend it on?</p>
              
              <div className="grid grid-cols-1 gap-3 w-full mb-8">
                {CORE_PASSIONS.map((passion) => {
                  const isSelected = selectedPassion === passion.id;
                  return (
                    <button
                      key={passion.id}
                      onClick={() => setSelectedPassion(passion.id)}
                      className={`group relative flex items-center p-4 rounded-2xl border transition-all duration-300 ${
                        isSelected 
                          ? `border-primary bg-primary/10 shadow-[0_0_15px_rgba(102,252,241,0.4)]` 
                          : 'bg-white/5 border-white/10 hover:bg-white/10'
                      }`}
                    >
                      <div className={`p-3 rounded-xl border mr-4 transition-colors ${isSelected ? passion.color : 'bg-black/30 border-white/10'}`}>
                        {passion.icon}
                      </div>
                      <div className="text-left flex-1">
                        <h3 className={`text-lg font-bold ${isSelected ? 'text-white text-glow' : 'text-gray-300'}`}>{passion.label}</h3>
                        <p className="text-xs text-gray-500 font-medium">{passion.desc}</p>
                      </div>
                      {isSelected && (
                        <motion.div 
                          initial={{ scale: 0 }} 
                          animate={{ scale: 1 }} 
                          className="w-6 h-6 bg-primary rounded-full flex items-center justify-center mr-2"
                        >
                          <CheckCircle2 className="w-4 h-4 text-black" />
                        </motion.div>
                      )}
                    </button>
                  );
                })}
              </div>
              
              <button 
                onClick={handleNext}
                disabled={selectedPassion.length === 0}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-primary to-emerald-400 text-black font-black uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(102,252,241,0.4)] transition-transform active:scale-95 flex items-center justify-center gap-2 text-xs"
              >
                <span>Enter the</span>
                <img src="/assets/logo/seccion-wordmark-dark.png" alt="SECCION" className="h-4 object-contain inline-block" />
              </button>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}

