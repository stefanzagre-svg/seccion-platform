'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Heart, Compass, Award, Rocket, ShieldCheck, Globe } from 'lucide-react';

interface ArchetypeSelectorProps {
  onSelect: (archetype: string, data: any) => Promise<void>;
  onProceed: () => void;
}

const ARCHETYPES = [
  {
    id: 'dreamer',
    title: 'The Dreamer',
    icon: <Heart className="w-12 h-12 text-[#93C5FD]" />,
    description: 'You seek deep romance, creative expression, and absolute emotional resonance.',
    color: 'from-[#93C5FD]/20 to-purple-500/20 border-[#93C5FD]/30 shadow-[#93C5FD]/10',
    accentColor: '#93C5FD',
    hobbies: ['Art', 'Music', 'Photography', 'Writing', 'Astrology'],
    lifestyle: { drinking: 'socially', smoking: 'never', nightlife: 'rarely' },
    relationship_goals: ['Long-term romance', 'Deep emotional connection']
  },
  {
    id: 'rebel',
    title: 'The Rebel',
    icon: <Compass className="w-12 h-12 text-[#F97316]" />,
    description: 'You crave excitement, nightlife, and pushing the boundaries of experience.',
    color: 'from-[#F97316]/20 to-red-500/20 border-[#F97316]/30 shadow-[#F97316]/10',
    accentColor: '#F97316',
    hobbies: ['Travel', 'Dancing', 'Nightclubs', 'Extreme Sports', 'Festivals'],
    lifestyle: { drinking: 'regularly', smoking: 'socially', nightlife: 'frequently' },
    relationship_goals: ['Casual fun', 'Open to exploring']
  },
  {
    id: 'caregiver',
    title: 'The Caregiver',
    icon: <Award className="w-12 h-12 text-[#F472B6]" />,
    description: 'You value stability, cooking, nesting, support, and building a secure legacy.',
    color: 'from-[#F472B6]/20 to-emerald-500/20 border-[#F472B6]/30 shadow-[#F472B6]/10',
    accentColor: '#F472B6',
    hobbies: ['Cooking', 'Reading', 'Gardening', 'Volunteering', 'Nesting'],
    lifestyle: { drinking: 'never', smoking: 'never', nightlife: 'never' },
    relationship_goals: ['Committed relationship', 'Family-oriented']
  },
  {
    id: 'visionary',
    title: 'The Visionary',
    icon: <Rocket className="w-12 h-12 text-[#8B5CF6]" />,
    description: 'You see 10 steps ahead. Ambitious, strategic, and relentlessly driven to build the future.',
    color: 'from-[#8B5CF6]/20 to-indigo-500/20 border-[#8B5CF6]/30 shadow-[#8B5CF6]/10',
    accentColor: '#8B5CF6',
    hobbies: ['Tech', 'Startups', 'Finance', 'Leadership', 'Networking'],
    lifestyle: { workout: 'Every Day', 'healthy eating': 'Most Days', 'social media': 'Heavy User' },
    relationship_goals: ['Power couple dynamics', 'Mutual growth']
  },
  {
    id: 'protector',
    title: 'The Protector',
    icon: <ShieldCheck className="w-12 h-12 text-[#10B981]" />,
    description: 'Loyal, dependable, and deeply principled. Your presence makes others feel safe.',
    color: 'from-[#10B981]/20 to-teal-500/20 border-[#10B981]/30 shadow-[#10B981]/10',
    accentColor: '#10B981',
    hobbies: ['Fitness', 'Martial Arts', 'Cooking', 'Pets', 'Mentoring'],
    lifestyle: { workout: 'Often', sleep: '8+ Hours', 'pet lover': 'Dog Person' },
    relationship_goals: ['Committed relationship', 'Trust-first bond']
  },
  {
    id: 'explorer',
    title: 'The Explorer',
    icon: <Globe className="w-12 h-12 text-[#06B6D4]" />,
    description: 'Curious, adaptable, and fearlessly open-minded. You collect experiences, not things.',
    color: 'from-[#06B6D4]/20 to-sky-500/20 border-[#06B6D4]/30 shadow-[#06B6D4]/10',
    accentColor: '#06B6D4',
    hobbies: ['Travel', 'Hiking', 'Culture', 'Languages', 'Photography'],
    lifestyle: { traveling: 'Every Week', 'adventure seek': 'High Adrenaline', socializing: 'Often' },
    relationship_goals: ['Adventure partner', 'Open to possibilities']
  }
];

export default function ArchetypeSelector({ onSelect, onProceed }: ArchetypeSelectorProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rewardData, setRewardData] = useState<any | null>(null);

  const handleConfirm = async () => {
    if (!selected) return;
    setIsSubmitting(true);
    
    const arc = ARCHETYPES.find(a => a.id === selected);
    if (arc) {
      const data = {
        archetype: arc.title,
        hobbies: arc.hobbies,
        lifestyle_habits: arc.lifestyle,
        relationship_goals: arc.relationship_goals,
        quest_stage: 2,
        connection_points: 100
      };

      try {
        await onSelect(arc.id, data);
        setRewardData({
          title: arc.title,
          points: 100,
          badge: 'Explorer Badge 🏅'
        });
      } catch (e) {
        console.error(e);
      }
    }
    setIsSubmitting(false);
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8">
      {!rewardData ? (
        <div className="flex flex-col items-center">
          <div className="text-center mb-12">
            <span className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/10 px-3 py-1.5 rounded-full mb-3 inline-block">
              Quest: Discover Your Archetype
            </span>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tighter text-glow mb-3">SELECT YOUR ARCHETYPE</h1>
            <p className="text-muted-foreground text-sm max-w-md mx-auto">
              Select the persona that aligns with your true nature. We will pre-configure your profile to kickstart your connections.
            </p>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 w-full mb-12">
            {ARCHETYPES.map((arc) => {
              const isSelected = selected === arc.id;
              return (
                <motion.button
                  key={arc.id}
                  whileHover={{ y: -5 }}
                  onClick={() => setSelected(arc.id)}
                  className={`relative p-5 rounded-3xl border bg-gradient-to-b text-left transition-all duration-300 shadow-xl flex flex-col justify-between h-[280px] ${
                    isSelected 
                    ? `border-primary bg-primary/5 ring-1 ring-primary` 
                    : `border-white/10 ${arc.color} hover:border-white/20`
                  }`}
                >
                  <div>
                    <div className="mb-6">{arc.icon}</div>
                    <h2 className="text-2xl font-bold text-white mb-2">{arc.title}</h2>
                    <p className="text-white/60 text-xs leading-relaxed">{arc.description}</p>
                  </div>
                  
                  <div className="mt-4 flex flex-wrap gap-1">
                    {arc.hobbies.slice(0, 3).map((h, i) => (
                      <span key={i} className="text-[9px] bg-white/5 border border-white/5 text-white/80 px-2 py-0.5 rounded-full font-medium">
                        {h}
                      </span>
                    ))}
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* Confirm Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleConfirm}
            disabled={!selected || isSubmitting}
            className="px-10 py-4 bg-primary text-primary-foreground font-black text-sm tracking-wider uppercase rounded-full shadow-[0_0_20px_rgba(138,43,226,0.6)] disabled:opacity-30 disabled:cursor-not-allowed transition"
          >
            {isSubmitting ? 'Configuring Profile...' : 'Confirm Alignment'}
          </motion.button>
        </div>
      ) : (
        /* Reward Overlay Card */
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md mx-auto text-center p-8 glass-card border border-primary/20 rounded-3xl flex flex-col items-center"
        >
          <div className="w-20 h-20 bg-primary/20 border-2 border-primary rounded-full flex items-center justify-center text-primary shadow-[0_0_20px_rgba(138,43,226,0.5)] mb-6 animate-bounce">
            <Sparkles className="w-10 h-10" />
          </div>
          
          <span className="text-[10px] font-black uppercase tracking-widest text-[#ff007f] mb-2">
            Quest Completed
          </span>
          <h2 className="text-3xl font-black text-white tracking-tight mb-4">ALIGNMENT COMPLETED!</h2>
          
          <p className="text-white/70 text-sm leading-relaxed mb-8">
            You aligned with <span className="text-primary font-bold">{rewardData.title}</span>. Your profile interests, habits, and goals have been auto-populated.
          </p>

          <div className="bg-white/5 border border-white/5 rounded-2xl p-4 w-full mb-8 flex justify-around text-center">
            <div>
              <div className="text-glow text-2xl font-black text-primary">+{rewardData.points}</div>
              <div className="text-[9px] uppercase tracking-widest text-white/40 mt-1 font-bold">XP Points</div>
            </div>
            <div className="border-r border-white/5" />
            <div>
              <div className="text-glow text-lg font-black text-[#ffa500] mt-1">{rewardData.badge}</div>
              <div className="text-[9px] uppercase tracking-widest text-white/40 mt-1.5 font-bold">Unlocked Badge</div>
            </div>
          </div>

          <button
            onClick={onProceed}
            className="w-full py-4 bg-primary text-primary-foreground font-black text-xs tracking-[0.2em] uppercase rounded-3xl shadow-[0_0_15px_rgba(102,252,241,0.4)] hover:brightness-110 active:scale-[0.98] transition-all"
          >
            Sync Lifestyle Habits →
          </button>
        </motion.div>
      )}
    </div>
  );
}
