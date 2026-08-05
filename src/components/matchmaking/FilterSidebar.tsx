'use client';

import { SlidersHorizontal, Users, DollarSign, Activity, X, MapPin, Calendar, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SPECIALTIES = [
  'All', 'Gaming', 'Music', 'Fitness', 'Chat', 'Art', 'Education', 'Lifestyle', 'Tech'
];

const LOCATIONS = [
  'Global', 'Medellín', 'Bogotá', 'Barcelona', 'Lisbon', 'Mexico City', 'Miami', 'London'
];

const RELATIONSHIP_TYPES = [
  'Any', 'Casual', 'Friendship', 'Networking', 'Dating', 'Collab'
];

export interface FilterState {
  onlineOnly: boolean;
  specialty: string;
  maxPrice: number;
  minVibeScore: number;
  location: string;
  ageRange: [number, number];
  relationshipType: string;
}

export const defaultFilters: FilterState = {
  onlineOnly: false,
  specialty: 'All',
  maxPrice: 100,
  minVibeScore: 50,
  location: 'Global',
  ageRange: [18, 99],
  relationshipType: 'Any',
};

interface FilterSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterState;
  onFilterChange: (newFilters: Partial<FilterState>) => void;
}

export default function FilterSidebar({ isOpen, onClose, filters, onFilterChange }: FilterSidebarProps) {
  
  const updateFilter = (key: keyof FilterState, value: any) => {
    onFilterChange({ [key]: value });
  };

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar Content */}
      <motion.aside
        initial={{ x: '-100%' }}
        animate={{ x: isOpen ? 0 : '-100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className={`fixed lg:static top-0 left-0 h-full w-[300px] bg-[#0a0a0a]/95 backdrop-blur-2xl border-r border-white/5 z-50 overflow-y-auto p-6 ${isOpen ? 'block' : 'hidden lg:block lg:translate-x-0'}`}
        style={!isOpen ? { transform: 'translateX(0)' } : undefined}
      >
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2 text-white font-['JetBrains_Mono'] font-bold">
            <SlidersHorizontal className="w-5 h-5 text-[#00fbfb]" />
            MATCH FILTERS
          </div>
          <button 
            onClick={onClose}
            className="lg:hidden p-2 rounded-full bg-white/5 text-white/60 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Online Status Toggle */}
        <div className="mb-6">
          <label className="flex items-center justify-between cursor-pointer group">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${filters.onlineOnly ? 'bg-[#00fbfb]/20 text-[#00fbfb]' : 'bg-white/5 text-white/40'}`}>
                <Activity className="w-4 h-4" />
              </div>
              <span className="text-sm font-bold text-white">Online Now</span>
            </div>
            <div className={`w-12 h-6 rounded-full p-1 transition-colors ${filters.onlineOnly ? 'bg-[#00fbfb]' : 'bg-white/10'}`}>
              <motion.div 
                animate={{ x: filters.onlineOnly ? 24 : 0 }}
                className="w-4 h-4 rounded-full bg-black shadow-sm"
              />
            </div>
            <input 
              type="checkbox" 
              className="hidden" 
              checked={filters.onlineOnly}
              onChange={(e) => updateFilter('onlineOnly', e.target.checked)}
            />
          </label>
        </div>

        {/* Location Filter */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3 text-white/60 text-xs font-bold uppercase tracking-wider">
            <MapPin className="w-4 h-4" /> Location
          </div>
          <select 
            value={filters.location}
            onChange={(e) => updateFilter('location', e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white font-bold outline-none focus:border-[#00fbfb]/50 transition appearance-none"
          >
            {LOCATIONS.map(loc => (
              <option key={loc} value={loc} className="bg-[#0a0a0a]">{loc}</option>
            ))}
          </select>
        </div>

        {/* Relationship Type */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3 text-white/60 text-xs font-bold uppercase tracking-wider">
            <Heart className="w-4 h-4" /> Looking For
          </div>
          <select 
            value={filters.relationshipType}
            onChange={(e) => updateFilter('relationshipType', e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white font-bold outline-none focus:border-[#00fbfb]/50 transition appearance-none"
          >
            {RELATIONSHIP_TYPES.map(type => (
              <option key={type} value={type} className="bg-[#0a0a0a]">{type}</option>
            ))}
          </select>
        </div>

        {/* Age Range */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-white/60 text-xs font-bold uppercase tracking-wider">
              <Calendar className="w-4 h-4" /> Age Range
            </div>
            <span className="text-[#00fbfb] font-bold text-xs">{filters.ageRange[0]} - {filters.ageRange[1] === 99 ? '99+' : filters.ageRange[1]}</span>
          </div>
          <div className="flex items-center gap-4">
            <input 
              type="range" 
              min="18" 
              max="99" 
              value={filters.ageRange[0]}
              onChange={(e) => updateFilter('ageRange', [Math.min(Number(e.target.value), filters.ageRange[1]), filters.ageRange[1]])}
              className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
              style={{ accentColor: '#00fbfb' }}
            />
          </div>
        </div>

        {/* Specialty Tags */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3 text-white/60 text-xs font-bold uppercase tracking-wider">
            <Users className="w-4 h-4" /> Specialty
          </div>
          <div className="flex flex-wrap gap-2">
            {SPECIALTIES.map(tag => (
              <button
                key={tag}
                onClick={() => updateFilter('specialty', tag)}
                className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all ${
                  filters.specialty === tag 
                    ? 'bg-[#00fbfb] text-black shadow-[0_0_15px_rgba(0,251,251,0.4)]' 
                    : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white border border-white/10'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Max Subscription Price */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-white/60 text-xs font-bold uppercase tracking-wider">
              <DollarSign className="w-4 h-4" /> Max Tier Price
            </div>
            <span className="text-[#00fbfb] font-bold">${filters.maxPrice}</span>
          </div>
          <input 
            type="range" 
            min="5" 
            max="200" 
            step="5"
            value={filters.maxPrice}
            onChange={(e) => updateFilter('maxPrice', Number(e.target.value))}
            className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
            style={{ accentColor: '#00fbfb' }}
          />
        </div>

        {/* Vibe Score Threshold */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-white/60 text-xs font-bold uppercase tracking-wider">
              ✨ Min Vibe Score
            </div>
            <span className="text-[#ffabf3] font-bold">{filters.minVibeScore}%</span>
          </div>
          <input 
            type="range" 
            min="0" 
            max="100" 
            value={filters.minVibeScore}
            onChange={(e) => updateFilter('minVibeScore', Number(e.target.value))}
            className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
            style={{ accentColor: '#ffabf3' }}
          />
          <p className="text-[10px] text-white/40 mt-2 font-medium leading-relaxed">
            Higher vibe scores mean their archetype strongly aligns with your preferences.
          </p>
        </div>

        <button 
          onClick={onClose}
          className="w-full py-4 mt-4 bg-white/5 hover:bg-white/10 text-white font-black text-xs tracking-widest uppercase rounded-xl transition border border-white/10 lg:hidden"
        >
          Apply Filters
        </button>

      </motion.aside>
    </>
  );
}

