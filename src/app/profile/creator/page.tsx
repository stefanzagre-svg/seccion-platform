"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DollarSign, Calendar as CalendarIcon, Video, Settings, Lock, Crown, Heart, Wine, Beer, Trophy, Plane, Music, Users, Utensils, EyeOff, CheckCircle2, AlertCircle, Clock, Moon, Cigarette, BookOpen, Smartphone, PawPrint, Sun, ChevronRight, Loader2, ShieldCheck } from 'lucide-react';
import SafetyWarning from '@/components/SafetyWarning';
import { HABIT_CHOICES, FAMILY_GOALS, FREQUENCY_LEVELS } from '@/lib/constants';
import { RELATIONSHIP_LEVELS } from '@/lib/relationship-engine';
import { supabase } from '@/lib/supabase';

export default function CreatorProfile() {
  const [activeTab, setActiveTab] = useState<'monetization' | 'calendar' | 'content'>('monetization');
  const [basePrice, setBasePrice] = useState(19.99);
  const [dynamicPricing, setDynamicPricing] = useState({ multiplier: 2.5, dynamicPrice: 49.97, contentVolume: 3 });
  
  // Google Calendar Integration State
  const [isCalendarConnected, setIsCalendarConnected] = useState(false);
  const [calendarEmail, setCalendarEmail] = useState('');
  const [isCheckingCalendar, setIsCheckingCalendar] = useState(true);
  const [calendarEvents, setCalendarEvents] = useState<any[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);
  const [creatorId, setCreatorId] = useState('364177d5-8664-460d-8534-111111111111');

  const [showUploadModal, setShowUploadModal] = useState<{ show: boolean, target: string }>({ show: false, target: '' });

  const handleUploadClick = (target: string) => {
    setShowUploadModal({ show: true, target });
  };

  const LIFESTYLE_ICONS: Record<string, any> = {
    drinking: Wine,
    smoking: Cigarette,
    partying: Beer,
    workout: Trophy,
    traveling: Plane,
    dancing: Music,
    socializing: Users,
    'healthy eating': Utensils,
    sleep: Moon,
    reading: BookOpen,
    'social media': Smartphone,
    'pet lover': PawPrint,
    'morning/night': Sun
  };

  const [familyGoal, setFamilyGoal] = useState(FAMILY_GOALS[2]); // Default: Open to children

  const [selectedHabits, setSelectedHabits] = useState<Record<string, string>>({
    workout: 'Often',
    traveling: 'Sometimes',
    partying: 'Never',
    'healthy eating': 'Every Day',
    socializing: 'Often',
    reading: 'Often',
    sleep: '6-7 Hours',
    smoking: 'Never',
    drinking: 'Socially',
    'social media': 'Moderate Use',
    'pet lover': 'Dog',
    'morning/night': 'Night Owl'
  });

  const APPLICATION_STATUS = {
    profileCover: true,
    vipAlbum: true,
    origins: false,
    hobbies: true,
    bio: true,
    videoPresentation: false,
    preferences: true
  };

  // Load Creator Auth Session & Calendar integration
  useEffect(() => {
    async function initCreator() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setCreatorId(user.id);
        }
      } catch (e) {
        console.error("Auth initialization failed:", e);
      }
    }
    initCreator();
  }, []);

  const loadCalendarStatus = async () => {
    try {
      setIsCheckingCalendar(true);
      const res = await fetch('/api/integrations/calendar/status');
      if (res.ok) {
        const data = await res.json();
        setIsCalendarConnected(data.connected);
        setCalendarEmail(data.email || '');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsCheckingCalendar(false);
    }
  };

  const loadCalendarEvents = async (cid: string) => {
    try {
      setIsLoadingEvents(true);
      const res = await fetch(`/api/integrations/calendar?creatorId=${cid}`);
      if (res.ok) {
        const data = await res.json();
        setCalendarEvents(data.events || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingEvents(false);
    }
  };

  useEffect(() => {
    loadCalendarStatus();
  }, []);

  useEffect(() => {
    if (activeTab === 'calendar' && creatorId) {
      loadCalendarEvents(creatorId);
    }
  }, [activeTab, creatorId]);

  const handleConnectCalendar = () => {
    window.location.href = `/api/integrations/calendar/auth?returnTo=${encodeURIComponent(window.location.pathname)}`;
  };

  const handleDisconnectCalendar = async () => {
    if (!confirm('Are you sure you want to disconnect your Google Calendar?')) return;
    try {
      const res = await fetch('/api/integrations/calendar/disconnect', { method: 'POST' });
      if (res.ok) {
        setIsCalendarConnected(false);
        setCalendarEmail('');
        alert('Google Calendar disconnected successfully.');
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to disconnect calendar.');
      }
    } catch (e) {
      console.error(e);
      alert('Network error disconnecting calendar.');
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return;
    try {
      const res = await fetch('/api/integrations/calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete',
          eventId
        })
      });
      if (res.ok) {
        setCalendarEvents(prev => prev.filter(e => e.id !== eventId));
        alert('Event deleted successfully.');
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to delete event.');
      }
    } catch (e) {
      console.error(e);
      alert('Error deleting event.');
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get('activeTab');
    if (tab && ['monetization', 'calendar', 'content'].includes(tab)) {
      setActiveTab(tab as any);
    }
    const calConnected = params.get('calendarConnected');
    if (calConnected === 'true') {
      alert('Google Calendar linked successfully! Sync is now active.');
      const newUrl = window.location.pathname + '?activeTab=calendar';
      window.history.replaceState({}, '', newUrl);
    }
    const calError = params.get('calendarError');
    if (calError) {
      alert(`Calendar Sync Error: ${calError}`);
      const newUrl = window.location.pathname + '?activeTab=calendar';
      window.history.replaceState({}, '', newUrl);
    }
  }, []);

  // Fetch dynamic pricing from API
  useEffect(() => {
    const fetchPricing = async () => {
      try {
        const res = await fetch(`/api/pricing/dynamic?creatorId=${creatorId}`);
        if (res.ok) {
          const data = await res.json();
          setDynamicPricing({
            multiplier: data.multiplier,
            dynamicPrice: data.dynamicPrice,
            contentVolume: data.contentVolume
          });
        }
      } catch (e) {
        console.error('Failed to fetch dynamic pricing', e);
      }
    };
    fetchPricing();
  }, [basePrice, creatorId]); // Re-calculate when base price changes (though API handles it, we could also pass it as param if needed)

  return (
    <div className="min-h-screen bg-transparent text-white pt-20 px-4 md:px-12 relative overflow-hidden">
      {/* Background neon accent mesh orbs */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary/5 blur-[150px] rounded-full pointer-events-none animate-pulse-cyan" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-accent/10 blur-[150px] rounded-full pointer-events-none" />

      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4 relative z-10">
          <div>
            <h1 className="text-4xl font-black text-glow tracking-tighter">CREATOR STUDIO</h1>
            <p className="text-muted-foreground mt-1 text-xs uppercase tracking-widest font-bold opacity-60">Manage your empire and scale your influence.</p>
          </div>
          <div className="flex gap-3">
            <button className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
              <Settings className="w-4 h-4" /> Settings
            </button>
            <button className="px-4 py-2 bg-primary/20 text-primary border border-primary/50 rounded-xl font-black flex items-center gap-2 text-[10px] uppercase tracking-widest animate-pulse">
              <CheckCircle2 className="w-4 h-4" /> Application Status: 75%
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 relative z-10">
          
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white/[0.02] border border-white/5 p-2 rounded-[2rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)] backdrop-blur-xl relative overflow-hidden">
              <div className="bg-black/40 border border-white/5 rounded-[calc(2rem-0.5rem)] p-4 space-y-2 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
                {[
                  { id: 'monetization', label: 'Monetization', icon: DollarSign, activeStyle: 'bg-primary text-black font-black shadow-[0_0_20px_rgba(102,252,241,0.4)] border border-primary/20 scale-105' },
                  { id: 'content', label: 'Content Tiers', icon: Lock, activeStyle: 'bg-accent text-white font-black shadow-[0_0_20px_rgba(69,162,158,0.4)] border border-accent/20 scale-105' },
                  { id: 'calendar', label: 'Calendar', icon: CalendarIcon, activeStyle: 'bg-[#ffa500]/20 border border-[#ffa500]/30 text-[#ffa500] font-black scale-105' }
                ].map((tab) => {
                  const Icon = tab.icon;
                  const isSelected = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`w-full flex items-center justify-between p-3 rounded-xl transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group hover:scale-[1.02] active:scale-[0.98] ${
                        isSelected ? tab.activeStyle : 'bg-transparent text-white/40 hover:text-white hover:bg-white/5 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`w-4 h-4 transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-110 ${isSelected ? '' : 'text-primary'}`} />
                        <span className="text-[10px] font-black uppercase tracking-widest">{tab.label}</span>
                      </div>
                      <ChevronRight className={`w-3.5 h-3.5 transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] ${isSelected ? 'translate-x-0' : 'text-white/20 opacity-0 group-hover:opacity-100 group-hover:translate-x-1'}`} />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Application Checklist Card */}
            <div className="bg-white/[0.02] border border-white/5 p-2 rounded-[2rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)] backdrop-blur-xl relative overflow-hidden">
              <div className="bg-black/40 border border-white/5 rounded-[calc(2rem-0.5rem)] p-4 space-y-4 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
                <h3 className="text-[11px] font-black flex items-center gap-2 uppercase tracking-[0.2em] text-white">
                  <CheckCircle2 className="w-4 h-4 text-primary animate-pulse" /> Application Progress
                </h3>
                <div className="space-y-3">
                  {Object.entries(APPLICATION_STATUS).map(([key, done]) => (
                    <div key={key} className="flex items-center justify-between text-[9px] uppercase tracking-wider font-bold group/item">
                      <span className={`transition-colors duration-300 ${done ? 'text-white' : 'text-white/40 group-hover/item:text-white/60'}`}>
                        {key.replace(/([A-Z])/g, ' $1')}
                      </span>
                      {done ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-primary drop-shadow-[0_0_5px_rgba(102,252,241,0.5)]" />
                      ) : (
                        <AlertCircle className="w-3.5 h-3.5 text-white/20 group-hover/item:text-white/40 transition-colors" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            <motion.div 
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/[0.02] border border-white/5 p-2 rounded-[2.5rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)] backdrop-blur-xl min-h-[600px]"
            >
              <div className="bg-black/40 border border-white/5 rounded-[2rem] p-8 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] h-full min-h-[584px]">
              {activeTab === 'monetization' && (
                <div className="space-y-8">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-2xl font-black flex items-center gap-2 mb-2 tracking-tighter"><DollarSign className="text-primary" /> PRICING STRATEGY</h2>
                      <p className="text-muted-foreground text-[11px] uppercase font-bold tracking-widest opacity-60">Set your base subscription price. Your MASTER tier scales automatically based on your content value.</p>
                    </div>
                    <SafetyWarning className="max-w-[300px]" />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-white/[0.01] border border-white/5 p-1 rounded-3xl shadow-md">
                      <div className="bg-black/50 border border-white/5 rounded-[calc(1.5rem)] p-6 space-y-6">
                        <div>
                          <label className="block text-[10px] font-black text-white/40 mb-3 uppercase tracking-[0.2em]">VIP Base Price</label>
                          <div className="flex items-center gap-3">
                            <span className="text-3xl font-black text-primary">$</span>
                            <input 
                              type="number" 
                              value={basePrice}
                              onChange={(e) => setBasePrice(parseFloat(e.target.value) || 0)}
                              className="bg-transparent text-4xl font-black outline-none w-32 border-b border-white/10 focus:border-primary transition duration-300"
                            />
                          </div>
                        </div>

                        <div className="p-5 bg-primary/5 rounded-2xl border border-primary/25 relative overflow-hidden group">
                          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-[40px] rounded-full -mr-16 -mt-16 group-hover:bg-primary/20 transition-all duration-700" />
                          <div className="relative z-10 space-y-4">
                            <div className="flex justify-between items-center mb-1">
                              <p className="text-[9px] font-black text-primary uppercase tracking-[0.2em]">Master Multiplier Strategy</p>
                              <span className="px-2.5 py-1 bg-primary/20 text-primary border border-primary/30 rounded-full text-[8px] font-black tracking-widest uppercase animate-pulse">
                                X{dynamicPricing.multiplier.toFixed(1)} DEMAND PULSE
                              </span>
                            </div>
                            
                            {/* Demand Pulse towers with springs and gradients */}
                            <div className="flex items-end justify-between gap-1.5 h-16 pt-2">
                              {[0.4, 0.6, 0.5, 0.8, 1.0, 0.9, 0.7].map((h, i) => {
                                const isPeak = i === 4;
                                return (
                                  <motion.div 
                                    key={i}
                                    initial={{ height: 0 }}
                                    animate={{ height: `${h * 100}%` }}
                                    whileHover={{ scaleY: 1.1, originY: 1 }}
                                    transition={{ 
                                      type: "spring", 
                                      stiffness: 100, 
                                      damping: 10,
                                      delay: i * 0.05 
                                    }}
                                    className={`w-full rounded-t-lg relative group/tower cursor-pointer transition-all duration-300 ${
                                      isPeak 
                                        ? 'bg-gradient-to-t from-primary/50 to-primary shadow-[0_0_20px_rgba(102,252,241,0.6)]' 
                                        : 'bg-gradient-to-t from-white/5 to-white/20 hover:from-accent/30 hover:to-accent/60'
                                    }`}
                                  >
                                    <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-1.5 py-0.5 bg-black border border-white/10 rounded text-[7px] font-black uppercase text-white tracking-widest opacity-0 group-hover/tower:opacity-100 transition-opacity">
                                      {Math.round(h * 100)}%
                                    </span>
                                  </motion.div>
                                );
                              })}
                            </div>
                            
                            <div className="flex justify-between items-end border-t border-white/5 pt-4 mt-2">
                              <div>
                                <p className="text-[8px] text-white/45 uppercase font-black tracking-widest">Base Rate x {dynamicPricing.multiplier}</p>
                                <p className="text-2xl font-black text-white tracking-tighter mt-1">${dynamicPricing.dynamicPrice.toFixed(2)}<span className="text-[10px] text-white/45 ml-1 font-bold">/MO</span></p>
                              </div>
                              <div className="text-right">
                                <p className="text-[8px] text-accent font-black uppercase tracking-widest">Current Yield</p>
                                <p className="text-sm font-black text-accent mt-1">+{Math.round((dynamicPricing.multiplier - 1) * 100)}% PREMIUM</p>
                              </div>
                            </div>

                            <p className="text-[8px] text-white/30 uppercase font-bold leading-tight mt-4 border-t border-white/5 pt-3">
                              *Master pricing scales automatically based on content volume ({dynamicPricing.contentVolume} assets) and matching demand.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <h3 className="text-lg font-black flex items-center gap-2 uppercase tracking-tighter"><Trophy className="w-5 h-5 text-[#ffff00]" /> LIFESTYLE & HABITS</h3>
                      
                      <div className="bg-white/[0.01] border border-white/5 p-1 rounded-3xl shadow-md">
                        <div className="bg-black/50 border border-white/5 rounded-[calc(1.5rem)] p-5 space-y-5">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {Object.entries(HABIT_CHOICES).map(([habit, options]) => {
                              const Icon = LIFESTYLE_ICONS[habit] || Trophy;
                              return (
                                <div key={habit} className="p-3 bg-white/[0.02] border border-white/5 rounded-2xl hover:border-white/10 transition flex items-center justify-between gap-3">
                                  <div className="flex items-center gap-2 min-w-0">
                                    <div className="w-7 h-7 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center shrink-0">
                                      <Icon className="w-3.5 h-3.5 text-primary" />
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-white/60 truncate">{habit}</span>
                                  </div>
                                  <select
                                    value={selectedHabits[habit] || ''}
                                    onChange={(e) => setSelectedHabits(prev => ({ ...prev, [habit]: e.target.value }))}
                                    className="bg-black/50 border border-white/10 rounded-xl px-2 py-1 text-[9px] font-black uppercase outline-none focus:border-primary text-white/80 shrink-0 max-w-[110px] cursor-pointer"
                                  >
                                    {options.map((opt) => (
                                      <option key={opt} value={opt} className="bg-[#11111A] text-white">
                                        {opt}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              );
                            })}

                            {/* Family Goals */}
                            <div className="p-3 bg-white/[0.02] border border-white/5 rounded-2xl hover:border-white/10 transition flex items-center justify-between gap-3 sm:col-span-2">
                              <div className="flex items-center gap-2 min-w-0">
                                <div className="w-7 h-7 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center shrink-0">
                                  <Users className="w-3.5 h-3.5 text-accent" />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-white/60 truncate">Family Goals</span>
                              </div>
                              <select
                                value={familyGoal}
                                onChange={(e) => setFamilyGoal(e.target.value)}
                                className="bg-black/50 border border-white/10 rounded-xl px-2 py-1 text-[9px] font-black uppercase outline-none focus:border-accent text-white/80 shrink-0 max-w-[180px] cursor-pointer"
                              >
                                {FAMILY_GOALS.map((opt) => (
                                  <option key={opt} value={opt} className="bg-[#11111A] text-white">
                                    {opt}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>

                          <div className="pt-2 border-t border-white/5">
                            <button 
                              onClick={() => alert('Lifestyle habits saved!')}
                              className="w-full relative p-[1px] rounded-full overflow-hidden bg-gradient-to-r from-primary to-accent group transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:scale-[1.01] active:scale-[0.99]"
                            >
                              <div className="w-full bg-black/95 rounded-full px-6 py-2.5 flex items-center justify-between transition-colors group-hover:bg-black/90">
                                <span className="text-[9px] font-black uppercase tracking-widest text-white/95 group-hover:text-white transition-colors">
                                  Save Lifestyle Data
                                </span>
                                <div className="flex items-center gap-1.5 px-3 py-1 bg-primary text-black rounded-full font-black text-[9px] uppercase tracking-wider shadow-sm">
                                  <span>Save</span>
                                  <ChevronRight className="w-3 h-3 stroke-[3px]" />
                                </div>
                              </div>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-8 border-t border-white/10">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><Video className="text-accent" /> Creator Live Stream</h3>
                    <div className="p-6 bg-accent/5 border border-accent/20 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6">
                      <div>
                        <p className="font-bold text-lg mb-1">Broadcasting Status: Offline</p>
                        <p className="text-sm text-muted-foreground">Go live to interact with your fans in real-time. Public streams build your audience.</p>
                      </div>
                      <button className="relative p-[1px] rounded-full overflow-hidden bg-gradient-to-r from-primary to-accent group transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(102,252,241,0.3)]">
                        <div className="bg-black/95 rounded-full px-8 py-3.5 flex items-center gap-4 transition-colors group-hover:bg-black/90">
                          <Video className="w-5 h-5 text-primary animate-pulse" />
                          <span className="text-xs font-black uppercase tracking-widest text-white">
                            Go Broadcast Live
                          </span>
                          <div className="flex items-center justify-center w-7 h-7 bg-primary text-black rounded-full">
                            <ChevronRight className="w-4 h-4 stroke-[3px]" />
                          </div>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              )}



              {activeTab === 'content' && (
                <div className="space-y-8">
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-bold flex items-center gap-2"><Lock className="text-accent" /> Content Management</h2>
                    <SafetyWarning className="max-w-[400px]" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-6 bg-black/40 border border-primary/30 rounded-2xl">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-bold text-primary">VIP Feed</h3>
                        <Lock className="w-5 h-5 text-primary" />
                      </div>
                      <p className="text-sm text-muted-foreground mb-6">Standard exclusive feed for your VIP subscribers.</p>
                      <button 
                        onClick={() => handleUploadClick('VIP Feed')}
                        className="w-full py-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition font-bold"
                      >
                        UPLOAD NEW POST
                      </button>
                    </div>

                    <div className="p-6 bg-black/40 border border-[#dc143c]/50 rounded-2xl relative overflow-hidden group">
                      <div className="absolute inset-0 bg-[#dc143c]/5 group-hover:bg-[#dc143c]/10 transition" />
                      <div className="relative z-10">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-xl font-bold text-[#dc143c] flex items-center gap-2">
                            <Crown className="w-5 h-5" /> MASTER VAULT
                          </h3>
                        </div>
                        <p className="text-sm text-muted-foreground mb-6">Ultra-premium content only for Level 8 Soulmates.</p>
                        <button 
                          onClick={() => handleUploadClick('Master Vault')}
                          className="w-full py-3 bg-[#dc143c]/20 hover:bg-[#dc143c]/40 text-[#dc143c] rounded-xl border border-[#dc143c]/30 transition font-black"
                        >
                          STORE IN VAULT
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Upload Safety Modal */}
              <AnimatePresence>
                {showUploadModal.show && (
                  <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setShowUploadModal({ show: false, target: '' })}
                      className="absolute inset-0 bg-black/80 backdrop-blur-md"
                    />
                    <motion.div 
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.9, opacity: 0 }}
                      className="relative z-10 w-full max-w-lg glass-card p-8 border-red-500/30"
                    >
                      <div className="flex flex-col items-center text-center">
                        <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-6 border border-red-500/40 shadow-[0_0_30px_rgba(239,68,68,0.2)]">
                          <AlertCircle className="w-8 h-8 text-red-500" />
                        </div>
                        <h2 className="text-2xl font-black tracking-tighter text-red-500 mb-2 uppercase">CONTENT SAFETY PROTOCOL</h2>
                        <p className="text-[10px] text-white/40 font-black uppercase tracking-[0.2em] mb-8">Target: {showUploadModal.target}</p>
                        
                        <div className="bg-white/5 border border-white/10 p-6 rounded-2xl text-left space-y-4 mb-8">
                          <p className="text-xs text-white/70 leading-relaxed font-medium">
                            <span className="text-white font-bold block mb-2 underline underline-offset-4 decoration-red-500">MANDATORY NOTICE:</span>
                            Explicit adult content (albums, avatars, profile photos, descriptions, public posts) is <span className="text-red-500 font-black">STRICTLY PROHIBITED</span> in public channels or shared spaces accessible to Matched users who do not hold a valid subscription.
                          </p>
                          <p className="text-xs text-white/70 leading-relaxed font-medium border-l-2 border-primary pl-4">
                            Exclusively upload sensitive assets to the <span className="text-primary font-bold">VIP</span> or <span className="text-[#dc143c] font-bold">MASTER</span> tiers. Violations will result in immediate account suspension.
                          </p>
                        </div>

                        <div className="flex flex-col w-full gap-3">
                          <button 
                            onClick={() => {
                              alert(`Simulating secure upload to ${showUploadModal.target}...`);
                              setShowUploadModal({ show: false, target: '' });
                            }}
                            className="w-full py-4 bg-primary text-white rounded-2xl font-black text-xs tracking-[0.2em] shadow-2xl hover:scale-[1.02] transition active:scale-95 border border-white/20"
                          >
                            I UNDERSTAND & COMPLY
                          </button>
                          <button 
                            onClick={() => setShowUploadModal({ show: false, target: '' })}
                            className="w-full py-4 bg-white/5 text-white/40 rounded-2xl font-black text-xs tracking-[0.2em] hover:text-white transition"
                          >
                            CANCEL UPLOAD
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>

              {activeTab === 'calendar' && (
                <div className="space-y-8">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-2xl font-bold flex items-center gap-2 mb-2 tracking-tighter"><CalendarIcon className="text-[#ffa500]" /> AVAILABILITY MANAGER</h2>
                      <p className="text-muted-foreground text-[11px] uppercase font-bold tracking-widest opacity-60">Sync your calendar to automate session booking and public streaming slots.</p>
                    </div>
                    {isCalendarConnected && (
                      <div className="flex items-center gap-2 bg-[#ffa500]/10 text-[#ffa500] px-3 py-1.5 rounded-full border border-[#ffa500]/20 text-[9px] font-black uppercase tracking-widest animate-pulse">
                        <CheckCircle2 className="w-3 h-3" /> Sync Active
                      </div>
                    )}
                  </div>
                  
                  {isCheckingCalendar ? (
                    <div className="w-full h-80 border border-white/5 bg-white/2 backdrop-blur-sm rounded-3xl flex flex-col items-center justify-center text-white/40">
                      <Loader2 className="w-8 h-8 animate-spin text-[#ffa500] mb-4" />
                      <p className="text-[10px] font-black uppercase tracking-widest">Checking secure availability gateway...</p>
                    </div>
                  ) : !isCalendarConnected ? (
                    <div className="w-full h-80 border-2 border-dashed border-white/10 rounded-3xl flex flex-col items-center justify-center text-white/40 bg-white/2 backdrop-blur-sm group hover:border-[#ffa500]/30 transition-all duration-500">
                      <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/10 group-hover:scale-110 transition-transform">
                        <CalendarIcon className="w-10 h-10 opacity-40 group-hover:text-[#ffa500] transition-colors" />
                      </div>
                      <p className="font-black uppercase tracking-[0.2em] text-[10px] mb-2 text-white/60">No External Calendar Linked</p>
                      <p className="text-[9px] uppercase tracking-widest mb-8 text-white/30">Connect Google Calendar to sync your availability</p>
                      <button 
                        onClick={handleConnectCalendar}
                        className="px-10 py-4 bg-white text-black rounded-2xl font-black text-[10px] tracking-[0.2em] hover:bg-[#ffa500] hover:text-white transition-all shadow-2xl cursor-pointer"
                      >
                        CONNECT GOOGLE CALENDAR
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="p-5 bg-white/2 border border-white/5 rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <ShieldCheck className="w-6 h-6 text-[#ffa500]" />
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-white/60">Secure Google Calendar Pipeline Connected</p>
                            <p className="text-[11px] text-[#ffa500] font-mono mt-0.5">{calendarEmail}</p>
                          </div>
                        </div>
                        <button 
                          onClick={handleDisconnectCalendar}
                          className="px-4 py-2 border border-red-500/30 text-red-500 hover:bg-red-500/10 rounded-xl text-[9px] font-black uppercase tracking-widest transition cursor-pointer shrink-0"
                        >
                          Disconnect Calendar
                        </button>
                      </div>

                      {isLoadingEvents ? (
                        <div className="flex justify-center items-center py-12">
                          <Loader2 className="w-6 h-6 animate-spin text-[#ffa500]" />
                        </div>
                      ) : calendarEvents.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          {calendarEvents.map((event) => (
                            <div key={event.id} className="p-5 bg-white/5 border border-white/10 rounded-2xl flex flex-col justify-between group hover:border-[#ffa500]/50 transition-colors">
                              <div>
                                <div className="flex justify-between items-start mb-1">
                                  <p className="text-[10px] font-black text-[#ffa500] uppercase tracking-widest">
                                    {event.type || 'public'}
                                  </p>
                                  {event.google_event_id && (
                                    <span className="text-[8px] font-bold text-white/30 uppercase tracking-widest bg-white/5 px-1.5 py-0.5 rounded border border-white/5">
                                      Synced
                                    </span>
                                  )}
                                </div>
                                <h4 className="font-black text-sm tracking-tight">{event.title}</h4>
                                {event.description && (
                                  <p className="text-[10px] text-white/40 mt-1 line-clamp-2">{event.description}</p>
                                )}
                                <p className="text-[10px] text-white/50 mt-3 flex items-center gap-2">
                                  <Clock className="w-3 h-3 text-[#ffa500]" /> 
                                  {new Date(event.start_time).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                                </p>
                              </div>
                              <button 
                                onClick={() => handleDeleteEvent(event.id)}
                                className="text-[9px] font-black text-white/20 hover:text-red-500 uppercase tracking-widest text-left mt-4 transition cursor-pointer pt-2 border-t border-white/5"
                              >
                                Delete Event
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-12 border border-dashed border-white/10 rounded-2xl bg-white/2">
                          <CalendarIcon className="w-8 h-8 text-white/20 mx-auto mb-2" />
                          <p className="text-[9px] font-black uppercase tracking-widest text-white/30">No connection events scheduled.</p>
                          <p className="text-[8px] uppercase tracking-widest text-white/20 mt-1">Schedule live sessions via the studio cockpit.</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
              </div>
            </motion.div>
          </div>

        </div>
      </div>
    </div>
  );
}
