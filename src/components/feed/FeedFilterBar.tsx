'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SlidersHorizontal, Zap } from 'lucide-react';
import { useTranslation } from '@/context/LanguageContext';

export interface AdvancedFilterState {
  minAge: string;
  maxAge: string;
  minHeight: string;
  maxHeight: string;
  sexualPreference: string;
  relationshipGoal: string;
  relationshipType: string;
  minMatchScore: string;
  locationType: string;
  relationshipLevel: string;
  profileStatus: string;
}

interface FeedFilterBarProps {
  activeFilter: string;
  setActiveFilter: (filter: string) => void;
  abGroup: 'A' | 'B';
  userRole: 'member' | 'creator';
  userTier: 'free' | 'vip' | 'master';
  searchXpBalance: number | null;
  filters: AdvancedFilterState;
  setFilters: React.Dispatch<React.SetStateAction<AdvancedFilterState>>;
  isSearching: boolean;
  searchResultsCount: number | null;
  onExecuteSearch: () => void;
  onResetSearch: () => void;
}

export interface FilterCategoryItem {
  id: string;
  labelEn: string;
  labelEs: string;
  icon?: string;
}

export const FILTER_CATEGORIES: FilterCategoryItem[] = [
  { id: 'all', labelEn: 'All', labelEs: 'Todos' },
  { id: 'live', labelEn: 'Live Streams', labelEs: 'En Vivo', icon: '🔴' },
  { id: 'subscribed', labelEn: 'Subscribed', labelEs: 'Suscripciones', icon: '⭐' },
  { id: 'matched', labelEn: 'Matched', labelEs: 'Compatibles', icon: '⚡' },
  { id: 'date_plans', labelEn: 'Date Plans', labelEs: 'Planes de Cita', icon: '📅' },
  { id: 'ai_tech', labelEn: 'AI & Tech', labelEs: 'IA y Tecnología', icon: '💻' },
  { id: 'beauty', labelEn: 'Beauty & Makeup', labelEs: 'Belleza y Maquillaje', icon: '💄' },
  { id: 'style', labelEn: 'Fashion & Style', labelEs: 'Moda y Estilo', icon: '👠' },
  { id: 'fitness', labelEn: 'Fitness & Vitality', labelEs: 'Fitness y Vitalidad', icon: '🏋️' },
  { id: 'health', labelEn: 'Health & Psychology', labelEs: 'Salud y Psicología', icon: '🧠' },
  { id: 'wellness', labelEn: 'Mindfulness & Wellness', labelEs: 'Bienestar y Mindfulness', icon: '🌿' },
  { id: 'dating', labelEn: 'Dating Coach', labelEs: 'Dating Coach', icon: '🔮' },
  { id: 'culinary', labelEn: 'Cooking & Dining', labelEs: 'Cocina y Cena', icon: '👨‍🍳' },
  { id: 'financial', labelEn: 'Economy & Finance', labelEs: 'Economía y Finanzas', icon: '💰' },
  { id: 'career', labelEn: 'Career & Ambition', labelEs: 'Carrera y Ambición', icon: '💼' },
  { id: 'creative', labelEn: 'Art & Music', labelEs: 'Arte y Música', icon: '🎨' },
  { id: 'gaming', labelEn: 'Gaming & Esports', labelEs: 'Gaming y Esports', icon: '🎮' },
  { id: 'adult', labelEn: '18+ Sensual', labelEs: '18+ Sensual', icon: '🔞' },
];

export default function FeedFilterBar({
  activeFilter,
  setActiveFilter,
  abGroup,
  userRole,
  userTier,
  searchXpBalance,
  filters,
  setFilters,
  isSearching,
  searchResultsCount,
  onExecuteSearch,
  onResetSearch
}: FeedFilterBarProps) {
  const { t, locale } = useTranslation();
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [showConfirmSearchModal, setShowConfirmSearchModal] = useState(false);

  const handleTriggerSearchClick = () => {
    const isFree = userRole === 'creator' || userTier === 'vip' || userTier === 'master';
    if (isFree) {
      onExecuteSearch();
    } else {
      if ((searchXpBalance ?? 0) < 250) {
        alert(
          locale === 'es'
            ? `XP insuficiente. La Búsqueda Avanzada cuesta 250 XP. Tu saldo actual es de ${searchXpBalance ?? 0} XP. Completa tu perfil, haz match o chatea para ganar más XP.`
            : `Insufficient XP. Advanced Search costs 250 XP. You currently have ${searchXpBalance ?? 0} XP. Complete profiles, match, or chat to earn more!`
        );
        return;
      }
      setShowConfirmSearchModal(true);
    }
  };

  const handleConfirmSearch = () => {
    setShowConfirmSearchModal(false);
    onExecuteSearch();
  };

  const updateField = (field: keyof AdvancedFilterState, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-4">
      {/* Top Filter Chips & Controls Row */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-xl relative z-30">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide py-1">
          {FILTER_CATEGORIES.map((item) => {
            const label = locale === 'es' ? item.labelEs : item.labelEn;
            const isSelected = activeFilter === item.id;
            return (
              <button 
                key={item.id}
                onClick={() => setActiveFilter(item.id)}
                className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                  isSelected 
                    ? 'bg-primary text-black font-black shadow-[0_0_20px_rgba(102,252,241,0.4)] scale-105 border border-primary/20' 
                    : 'bg-white/5 text-white/40 border border-white/10 hover:bg-white/10 hover:text-white'
                }`}
              >
                {item.icon && <span className="text-xs">{item.icon}</span>}
                <span>{label}</span>
              </button>
            );
          })}
        </div>

        {/* Advanced Search Toggle Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
            className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 flex items-center gap-1.5 border shrink-0 cursor-pointer ${
              showAdvancedSearch 
                ? 'bg-primary text-black border-primary shadow-[0_0_15px_rgba(102,252,241,0.45)] font-black' 
                : 'bg-white/5 text-white/70 border-white/10 hover:bg-white/10'
            }`}
            title={t('platformFeed.advancedFiltersTitle', "Toggle Advanced Search Filters")}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>{t('platformFeed.advancedFiltersBtn', 'Advanced Filters')}</span>
          </button>
        </div>

        {/* A/B Test Group Visual Pill Badge */}
        <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border shrink-0 flex items-center gap-1.5 transition-all duration-300 select-none ${
          abGroup === 'B' 
            ? 'bg-purple-500/10 text-purple-400 border-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.15)]' 
            : 'bg-pink-500/10 text-pink-400 border-pink-500/20 shadow-[0_0_15px_rgba(236,72,153,0.15)]'
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${abGroup === 'B' ? 'bg-purple-400 animate-pulse' : 'bg-pink-400 animate-pulse'}`} />
          {abGroup === 'B' ? 'B: Interaction Priority' : 'A: Synergy Mode'}
        </div>
      </div>

      {/* Advanced Search Form Drawer */}
      <AnimatePresence>
        {showAdvancedSearch && (
          <motion.div 
            initial={{ opacity: 0, height: 0, y: -10 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="p-6 rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-xl space-y-6 relative overflow-hidden text-left"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 pointer-events-none" />
            
            <div className="flex flex-wrap justify-between items-center gap-4 border-b border-white/5 pb-3">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-primary" /> 
                {locale === 'es' ? 'Filtros de Búsqueda Avanzada' : 'Advanced Search Filters'}
              </h3>
              
              {/* Status Badge */}
              {userRole === 'creator' || userTier === 'vip' || userTier === 'master' ? (
                <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[8px] font-black uppercase tracking-widest rounded-lg shadow-sm">
                  ✨ {locale === 'es' ? 'BÚSQUEDAS ILIMITADAS GRATIS (Tier VIP/Creador Activo)' : 'FREE UNLIMITED SEARCHES (Active VIP/Creator Tier)'}
                </span>
              ) : (
                <span className="px-3 py-1 bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-[8px] font-black uppercase tracking-widest rounded-lg shadow-sm">
                  ⚡ {locale === 'es' ? `COSTE: 250 XP por búsqueda (Disponible: ${searchXpBalance ?? 0} XP)` : `COST: 250 XP per search (Available: ${searchXpBalance ?? 0} XP)`}
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs font-semibold">
              {/* Age Filter */}
              <div className="space-y-1.5">
                <label className="text-[9px] uppercase tracking-widest font-black text-white/40">
                  {locale === 'es' ? 'Rango de Edad (Años)' : 'Age Range (Years)'}
                </label>
                <div className="flex gap-2">
                  <input 
                    type="number" 
                    min="18"
                    max="80"
                    placeholder="Min" 
                    value={filters.minAge} 
                    onChange={(e) => updateField('minAge', e.target.value)}
                    className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-white placeholder-white/20 text-xs focus:border-primary focus:outline-none"
                  />
                  <input 
                    type="number" 
                    min="18"
                    max="80"
                    placeholder="Max" 
                    value={filters.maxAge} 
                    onChange={(e) => updateField('maxAge', e.target.value)}
                    className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-white placeholder-white/20 text-xs focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              {/* Height Filter */}
              <div className="space-y-1.5">
                <label className="text-[9px] uppercase tracking-widest font-black text-white/40">
                  {locale === 'es' ? 'Rango de Altura (cm)' : 'Height Range (cm)'}
                </label>
                <div className="flex gap-2">
                  <input 
                    type="number" 
                    min="100"
                    max="230"
                    placeholder="Min" 
                    value={filters.minHeight} 
                    onChange={(e) => updateField('minHeight', e.target.value)}
                    className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-white placeholder-white/20 text-xs focus:border-primary focus:outline-none"
                  />
                  <input 
                    type="number" 
                    min="100"
                    max="230"
                    placeholder="Max" 
                    value={filters.maxHeight} 
                    onChange={(e) => updateField('maxHeight', e.target.value)}
                    className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-white placeholder-white/20 text-xs focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              {/* Sex Preference */}
              <div className="space-y-1.5">
                <label className="text-[9px] uppercase tracking-widest font-black text-white/40">
                  {locale === 'es' ? 'Preferencia Sexual' : 'Sexual Preference'}
                </label>
                <select 
                  value={filters.sexualPreference} 
                  onChange={(e) => updateField('sexualPreference', e.target.value)}
                  className="w-full px-3 py-2.5 bg-black border border-white/10 rounded-xl text-white text-xs focus:border-primary focus:outline-none"
                >
                  <option value="All">{locale === 'es' ? 'Todas las Preferencias' : 'All Preferences'}</option>
                  <option value="Straight">{locale === 'es' ? 'Heterosexual' : 'Straight'}</option>
                  <option value="Bisexual">{locale === 'es' ? 'Bisexual' : 'Bisexual'}</option>
                  <option value="Lesbian">{locale === 'es' ? 'Lesbiana' : 'Lesbian'}</option>
                  <option value="Gay">{locale === 'es' ? 'Gay' : 'Gay'}</option>
                </select>
              </div>

              {/* Profile Status */}
              <div className="space-y-1.5">
                <label className="text-[9px] uppercase tracking-widest font-black text-white/40">
                  {locale === 'es' ? 'Tipo de Perfil' : 'Profile Status'}
                </label>
                <select 
                  value={filters.profileStatus} 
                  onChange={(e) => updateField('profileStatus', e.target.value)}
                  className="w-full px-3 py-2.5 bg-black border border-white/10 rounded-xl text-white text-xs focus:border-primary focus:outline-none"
                >
                  <option value="All">{locale === 'es' ? 'Todos los Perfiles' : 'All Profiles'}</option>
                  <option value="member">{locale === 'es' ? 'Miembros' : 'Members'}</option>
                  <option value="creator">{locale === 'es' ? 'Creadores' : 'Creators'}</option>
                </select>
              </div>

              {/* Min Match Score */}
              <div className="space-y-1.5">
                <label className="text-[9px] uppercase tracking-widest font-black text-white/40">
                  {locale === 'es' ? 'Nivel Mínimo de Sinergia' : 'Min Vibe Level'}
                </label>
                <select 
                  value={filters.minMatchScore} 
                  onChange={(e) => updateField('minMatchScore', e.target.value)}
                  className="w-full px-3 py-2.5 bg-black border border-white/10 rounded-xl text-white text-xs focus:border-primary focus:outline-none"
                >
                  <option value="">{locale === 'es' ? 'Cualquier Sinergia' : 'Any Vibe'}</option>
                  <option value="50">⚡ 50%+</option>
                  <option value="70">⚡ 70%+</option>
                  <option value="80">🏆 80%+ (Inner Circle)</option>
                  <option value="90">🔮 90%+ (Soulmate)</option>
                </select>
              </div>

              {/* Relationship Goal */}
              <div className="space-y-1.5">
                <label className="text-[9px] uppercase tracking-widest font-black text-white/40">
                  {locale === 'es' ? 'Meta Relacional' : 'Relationship Goal'}
                </label>
                <select 
                  value={filters.relationshipGoal} 
                  onChange={(e) => updateField('relationshipGoal', e.target.value)}
                  className="w-full px-3 py-2.5 bg-black border border-white/10 rounded-xl text-white text-xs focus:border-primary focus:outline-none"
                >
                  <option value="All">{locale === 'es' ? 'Todas las Metas' : 'All Goals'}</option>
                  <option value="Long term partner">{locale === 'es' ? 'Pareja a largo plazo' : 'Long-term partner'}</option>
                  <option value="Short term fun">{locale === 'es' ? 'Diversión a corto plazo' : 'Short-term fun'}</option>
                  <option value="Casual">{locale === 'es' ? 'Casual' : 'Casual'}</option>
                  <option value="Open to explore">{locale === 'es' ? 'Abierto/a a explorar' : 'Open to explore'}</option>
                </select>
              </div>

              {/* Relationship Type */}
              <div className="space-y-1.5">
                <label className="text-[9px] uppercase tracking-widest font-black text-white/40">
                  {locale === 'es' ? 'Tipo de Dinámica' : 'Relationship Type'}
                </label>
                <select 
                  value={filters.relationshipType} 
                  onChange={(e) => updateField('relationshipType', e.target.value)}
                  className="w-full px-3 py-2.5 bg-black border border-white/10 rounded-xl text-white text-xs focus:border-primary focus:outline-none"
                >
                  <option value="All">{locale === 'es' ? 'Todos los Tipos' : 'All Types'}</option>
                  <option value="Monogamous">{locale === 'es' ? 'Monógama' : 'Monogamous'}</option>
                  <option value="Non-monogamous">{locale === 'es' ? 'No monógama' : 'Non-monogamous'}</option>
                  <option value="Polyamorous">{locale === 'es' ? 'Poliamorosa' : 'Polyamorous'}</option>
                  <option value="Open to Explore">{locale === 'es' ? 'Abierto a explorar' : 'Open to explore'}</option>
                </select>
              </div>

              {/* Location Filtering */}
              <div className="space-y-1.5">
                <label className="text-[9px] uppercase tracking-widest font-black text-white/40">
                  {locale === 'es' ? 'Restricción Geográfica' : 'Location Constraint'}
                </label>
                <select 
                  value={filters.locationType} 
                  onChange={(e) => updateField('locationType', e.target.value)}
                  className="w-full px-3 py-2.5 bg-black border border-white/10 rounded-xl text-white text-xs focus:border-primary focus:outline-none"
                >
                  <option value="All">{locale === 'es' ? 'Cualquier Ubicación' : 'Any Location'}</option>
                  <option value="Current">{locale === 'es' ? 'Ubicación Actual' : 'Match Current Location'}</option>
                  <option value="Origins">{locale === 'es' ? 'Origen / Ciudad Natal' : 'Match Native Town / Origins'}</option>
                </select>
              </div>
            </div>

            {/* Actions Row */}
            <div className="flex justify-between items-center pt-4 border-t border-white/5">
              <div className="text-[10px] text-white/40 uppercase font-black tracking-widest">
                {searchResultsCount !== null && (
                  locale === 'es' ? `Encontradas ${searchResultsCount} conexiones` : `Found ${searchResultsCount} connections`
                )}
              </div>
              
              <div className="flex gap-3">
                {searchResultsCount !== null && (
                  <button 
                    onClick={onResetSearch}
                    className="px-5 py-2 rounded-xl bg-white/5 border border-white/10 text-white/70 text-[9px] font-black uppercase tracking-widest hover:bg-white/10 active:scale-95 transition cursor-pointer"
                  >
                    {locale === 'es' ? 'Reiniciar' : 'Reset Results'}
                  </button>
                )}
                <button 
                  onClick={handleTriggerSearchClick}
                  disabled={isSearching}
                  className="px-6 py-2.5 bg-[#00fbfb] text-black border border-[#00fbfb] shadow-[0_0_15px_rgba(0,251,251,0.25)] rounded-xl text-[9px] font-black uppercase tracking-widest hover:brightness-110 transition duration-300 flex items-center gap-1.5 active:scale-95 cursor-pointer disabled:opacity-50"
                >
                  {isSearching ? (locale === 'es' ? 'Buscando...' : 'Searching...') : (locale === 'es' ? 'Aplicar Filtros' : 'Apply Filters')}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirm Advanced Search XP Deduction Modal */}
      {showConfirmSearchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md w-full p-6 rounded-3xl border border-yellow-500/30 bg-[#0F0F1A]/95 shadow-[0_20px_50px_rgba(234,179,8,0.15)] text-center flex flex-col items-center space-y-4"
          >
            <div className="w-12 h-12 rounded-full bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center text-yellow-400 shadow-[0_0_15px_rgba(234,179,8,0.2)] animate-bounce">
              <Zap className="w-6 h-6 fill-yellow-400" />
            </div>
            <h3 className="text-sm font-black uppercase tracking-widest text-white">
              {locale === 'es' ? 'Confirmar Búsqueda Avanzada' : 'Confirm Advanced Search'}
            </h3>
            <p className="text-xs text-white/70 max-w-xs leading-relaxed uppercase tracking-wider font-black">
              {locale === 'es' ? (
                <>Ejecutar esta búsqueda avanzada deducirá <span className="text-yellow-400">250 XP</span> de tu saldo.</>
              ) : (
                <>Executing this advanced search will deduct <span className="text-yellow-400">250 XP</span> from your profile balance.</>
              )}
            </p>
            <div className="px-4 py-2 bg-white/5 border border-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white/60">
              {locale === 'es' ? `Tu Saldo Actual: ${searchXpBalance ?? 0} XP` : `Your Current Balance: ${searchXpBalance ?? 0} XP`}
            </div>
            <div className="flex gap-3 w-full pt-2">
              <button
                onClick={handleConfirmSearch}
                className="flex-1 py-2.5 rounded-xl bg-yellow-500 text-black font-black text-[10px] uppercase tracking-widest shadow hover:brightness-110 active:scale-95 transition cursor-pointer"
              >
                {locale === 'es' ? 'Deducir y Buscar' : 'Deduct & Search'}
              </button>
              <button
                onClick={() => setShowConfirmSearchModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/70 font-black text-[10px] uppercase tracking-widest hover:bg-white/10 transition cursor-pointer"
              >
                {locale === 'es' ? 'Cancelar' : 'Cancel'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
