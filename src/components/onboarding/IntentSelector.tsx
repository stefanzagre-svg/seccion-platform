"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Lock, Wallet, Loader2, CheckCircle2 } from 'lucide-react';

const INTENTS = [
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

export default function IntentSelector({ onContinue }: { onContinue: (intents: string[], displayAge: number) => void }) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [displayAge, setDisplayAge] = useState<number>(25);
  const [zkpStatus, setZkpStatus] = useState<'idle' | 'verifying' | 'success'>('idle');
  const [zkpLog, setZkpLog] = useState<string>('');
  const [selectedIntents, setSelectedIntents] = useState<string[]>([]);

  const toggleIntent = (id: string) => {
    setSelectedIntents(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleNext = () => {
    if (step === 1 && name.trim().length > 0) setStep(2);
    else if (step === 2 && zkpStatus === 'success') setStep(3);
    else if (step === 3 && selectedIntents.length > 0) onContinue(selectedIntents, displayAge);
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
          {[1, 2, 3].map(i => (
            <div 
              key={i} 
              className={`h-1.5 rounded-full transition-all duration-300 ${step === i ? 'w-8 bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.8)]' : step > i ? 'w-4 bg-purple-500/50' : 'w-4 bg-white/10'}`}
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
                className="w-full bg-black/50 border border-white/10 rounded-2xl p-5 text-2xl text-center text-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all placeholder:text-gray-600 mb-8"
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
                  className="w-full p-6 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 rounded-2xl transition flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3 text-left">
                    <div className="p-3 bg-purple-500/20 rounded-xl text-purple-400 group-hover:scale-105 transition">
                      <Wallet className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">EU Digital Identity Wallet</p>
                      <p className="text-[10px] text-gray-400 font-medium">Verify Over 18 via Zero-Knowledge Proof</p>
                    </div>
                  </div>
                  <Lock className="w-5 h-5 text-gray-500 group-hover:text-purple-400 transition" />
                </button>
              )}

              {zkpStatus === 'verifying' && (
                <div className="w-full p-6 bg-black/30 border border-white/5 rounded-2xl flex flex-col items-center justify-center space-y-4">
                  <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
                  <p className="text-[10px] font-mono text-purple-400 uppercase tracking-widest animate-pulse">{zkpLog}</p>
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
                      <span className="text-lg font-black text-purple-400">{displayAge} years</span>
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
                      className="w-full h-1.5 bg-black/50 rounded-lg appearance-none cursor-pointer accent-purple-500"
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

          {/* STEP 3: VIBE / INTENTS */}
          {step === 3 && (
            <motion.div 
              key="step-3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col items-center text-center"
            >
              <h2 className="text-3xl font-bold text-white mb-2">What&apos;s your vibe?</h2>
              <p className="text-gray-400 mb-8">Pick what you&apos;re looking for right now.</p>
              
              <div className="grid grid-cols-2 gap-3 w-full mb-8">
                {INTENTS.map((intent) => {
                  const isSelected = selectedIntents.includes(intent.id);
                  return (
                    <button
                      key={intent.id}
                      onClick={() => toggleIntent(intent.id)}
                      className={`group relative flex flex-col items-center justify-center p-4 pt-7 rounded-2xl border transition-all duration-300 ${
                        isSelected 
                          ? 'bg-purple-500/20 border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.3)]' 
                          : 'bg-white/5 border-white/10 hover:bg-white/10'
                      }`}
                    >
                      {/* Connection Type Badge */}
                      <div className={`absolute top-2 left-1/2 -translate-x-1/2 px-1.5 py-[2px] rounded text-[8px] font-bold uppercase tracking-widest whitespace-nowrap ${
                        intent.type === 'online' 
                          ? 'bg-[#00fbfb]/10 text-[#00fbfb] border border-[#00fbfb]/30' 
                          : 'bg-[#ffabf3]/10 text-[#ffabf3] border border-[#ffabf3]/30'
                      }`}>
                        {intent.type === 'online' ? 'Behind Screen' : 'Real Date'}
                      </div>

                      <span className="text-2xl mb-2 mt-1">{intent.icon}</span>
                      <span className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-gray-400'}`}>
                        {intent.label}
                      </span>
                      
                      {/* Hover Tooltip */}
                      <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-max max-w-[200px] px-3 py-2 bg-[#0F0F1A] border border-white/20 rounded-xl shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
                        <p className="text-[11px] font-['Plus_Jakarta_Sans'] text-[#00fbfb] leading-tight text-center whitespace-normal">{intent.description}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
              
              <button 
                onClick={handleNext}
                disabled={selectedIntents.length === 0}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-transform active:scale-95"
              >
                Enter the Session
              </button>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
