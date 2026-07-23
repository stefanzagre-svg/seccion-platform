'use client';

import React, { useState } from 'react';
import { Mail, MapPin, ChevronRight, Check, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface WaitlistSignupProps {
  variant?: 'inline' | 'card';
}

export function WaitlistSignup({ variant = 'inline' }: WaitlistSignupProps) {
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'duplicate' | 'error'>('idle');
  const [position, setPosition] = useState<number | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !city) return;
    setStatus('loading');
    
    try {
      const res = await fetch('/api/v2/waitlist/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, city })
      });
      
      if (res.status === 409) {
        setStatus('duplicate');
      } else if (res.ok) {
        const data = await res.json();
        setPosition(data.position || Math.floor(Math.random() * 1000) + 100);
        setStatus('success');
      } else {
        setStatus('error');
      }
    } catch (err) {
      setStatus('error');
    }
  };

  const isCard = variant === 'card';

  return (
    <div className={`w-full max-w-2xl mx-auto p-6 md:p-8 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-md ${isCard ? 'flex flex-col' : ''}`}>
      <div className="mb-6 text-center">
        <h3 className="text-xl md:text-2xl font-bold font-outfit text-white mb-2 flex items-center justify-center gap-2">
          <Sparkles className="w-5 h-5 text-[#00fbfb]" />
          Join the Member's Early Access list
        </h3>
        <p className="text-sm md:text-base text-gray-400 font-mono">
          Secure early access to SECCIØN
        </p>
      </div>

      <AnimatePresence mode="wait">
        {status === 'success' ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-6 text-center"
          >
            <div className="w-16 h-16 rounded-full bg-[#00fbfb]/20 flex items-center justify-center mb-4 border border-[#00fbfb]/30">
              <Check className="w-8 h-8 text-[#00fbfb]" />
            </div>
            <h4 className="text-2xl font-bold text-white mb-2">You're on the list! 🎉</h4>
            {position && (
              <p className="text-lg text-gray-300 font-mono bg-white/5 px-4 py-2 rounded-lg border border-white/10">
                Position <span className="text-[#00fbfb]">#{position}</span>
              </p>
            )}
          </motion.div>
        ) : status === 'duplicate' ? (
          <motion.div
            key="duplicate"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-6 text-center"
          >
            <div className="w-16 h-16 rounded-full bg-[#ffabf3]/20 flex items-center justify-center mb-4 border border-[#ffabf3]/30">
              <Check className="w-8 h-8 text-[#ffabf3]" />
            </div>
            <h4 className="text-2xl font-bold text-white mb-2">You're already on the Early Access list!</h4>
            <p className="text-gray-400">Keep an eye on your inbox for updates.</p>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onSubmit={handleSubmit}
            className={`flex ${isCard ? 'flex-col gap-4' : 'flex-col md:flex-row gap-3'} w-full items-end`}
          >
            <div className={`flex-1 w-full ${isCard ? '' : ''}`}>
              <label className="block text-xs font-mono text-gray-400 mb-1.5 uppercase tracking-wider">Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-[#00fbfb]/50 focus:ring-1 focus:ring-[#00fbfb]/50 transition-all font-mono text-sm"
                  placeholder="your@email.com"
                />
              </div>
            </div>

            <div className={`flex-1 w-full ${isCard ? '' : ''}`}>
              <label className="block text-xs font-mono text-gray-400 mb-1.5 uppercase tracking-wider">City</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MapPin className="h-5 w-5 text-gray-500" />
                </div>
                <select
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-[#00fbfb]/50 focus:ring-1 focus:ring-[#00fbfb]/50 transition-all font-mono text-sm appearance-none"
                >
                  <option value="" disabled>Select a city</option>
                  <optgroup label="Pre-Launch Cities">
                    <option value="Medellín">🥇 Medellín, Colombia</option>
                    <option value="Bogotá">🥈 Bogotá, Colombia</option>
                    <option value="Barcelona">🥉 Barcelona, Spain</option>
                    <option value="Lisbon">Lisbon, Portugal</option>
                    <option value="Mexico City">Mexico City, Mexico</option>
                  </optgroup>
                  <optgroup label="Expansion Cities">
                    <option value="Berlin">Berlin, Germany</option>
                    <option value="Bucharest">Bucharest, Romania</option>
                    <option value="London">London, UK</option>
                    <option value="Miami">Miami, USA</option>
                  </optgroup>
                  <optgroup label="Global">
                    <option value="Bangkok">Bangkok, Thailand</option>
                    <option value="São Paulo">São Paulo, Brazil</option>
                    <option value="Other">Other City</option>
                  </optgroup>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={status === 'loading'}
              className={`w-full ${isCard ? '' : 'md:w-auto'} h-[50px] bg-[#00fbfb] hover:bg-[#00fbfb]/80 text-black font-bold px-6 rounded-xl flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 font-outfit uppercase tracking-wider mt-4 md:mt-0`}
            >
              {status === 'loading' ? (
                <span className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
              ) : (
                <>
                  Apply <ChevronRight className="w-5 h-5" />
                </>
              )}
            </button>
          </motion.form>
        )}
      </AnimatePresence>
      {status === 'error' && (
        <p className="text-red-400 text-sm mt-4 text-center font-mono">Something went wrong. Please try again.</p>
      )}
    </div>
  );
}
