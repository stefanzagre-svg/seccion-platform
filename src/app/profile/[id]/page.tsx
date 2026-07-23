'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, MessageCircleHeart, Info, X, Star, PhoneCall, Tv, Lock, 
  MapPin, Calendar, Briefcase, Award, Languages, EyeOff, Sparkles, 
  ChevronLeft, Compass, ArrowRight, ShieldCheck, HeartCrack, Home
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { getRelationshipState, fetchProfileMedia, recordInteraction, type ProfileMedia } from '@/lib/relationship-db';
import { calculateMatch, type UserProfile, calculateMockDistance } from '@/lib/match-engine';
import { RELATIONSHIP_LEVELS } from '@/lib/relationship-engine';
import { ARCHETYPE_PROFILES } from '@/lib/constants';

const RELATIONSHIP_LEVELS_METADATA = [
  { name: "Strangers", score: 0, key: "strangers" },
  { name: "Acquaintance", score: 6, key: "acquaintance" },
  { name: "Friendly Spark", score: 16, key: "friendly" },
  { name: "Close Connection", score: 29, key: "close" },
  { name: "Intimate bond", score: 45, key: "intimate" },
  { name: "Exclusive VIP", score: 60, key: "vip" },
  { name: "Passionate Spark", score: 61, key: "passionate" },
  { name: "Committed Union", score: 75, key: "committed" },
  { name: "Soulmate Synergy", score: 89, key: "soulmate" }
];

export default function ProfileInsidePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const supabase = createClient();

  // Core States
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [currentUserProfile, setCurrentUserProfile] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [relationship, setRelationship] = useState<any>(null);
  const [media, setMedia] = useState<ProfileMedia[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Interaction States
  const [favorites, setFavorites] = useState<string[]>([]);
  const [showLiveStream, setShowLiveStream] = useState(false);
  const [showCallModal, setShowCallModal] = useState(false);
  const [showMatchOverlay, setShowMatchOverlay] = useState(false);

  // Fetch all necessary data on mount / parameter change
  useEffect(() => {
    if (!id) return;

    const loadProfileData = async () => {
      try {
        setLoading(true);
        setError(null);

        // 1. Get current session
        const { data: { session } } = await supabase.auth.getSession();
        let currentUserId = '';
        if (session?.user) {
          setCurrentUser(session.user);
          currentUserId = session.user.id;
          
          // Fetch current user profile details
          const { data: cProf } = await supabase.from('profiles').select('*').eq('id', currentUserId).single();
          if (cProf) setCurrentUserProfile(cProf);
        }

        // 2. Fetch target profile
        const { data: targetProf, error: targetError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', id)
          .single();

        if (targetError) throw new Error('Profile not found');
        setProfile(targetProf);

        // 3. Fetch relationship state
        if (currentUserId && currentUserId !== id) {
          const relState = await getRelationshipState(currentUserId, id);
          setRelationship(relState);
        }

        // 4. Fetch media album
        const mediaList = await fetchProfileMedia(id);
        setMedia(mediaList);

        // 5. Load favorites list
        const savedFavs = localStorage.getItem('swiper_favorites');
        if (savedFavs) {
          setFavorites(JSON.parse(savedFavs));
        }

      } catch (err: any) {
        console.error('Error loading profile inside page:', err);
        setError(err.message || 'Failed to load profile details.');
      } finally {
        setLoading(false);
      }
    };

    loadProfileData();
  }, [id]);

  // Helper functions
  const isFavorite = favorites.includes(id);

  const handleToggleFavorite = () => {
    setFavorites(prev => {
      const isFav = prev.includes(id);
      const updated = isFav ? prev.filter(favId => favId !== id) : [...prev, id];
      localStorage.setItem('swiper_favorites', JSON.stringify(updated));
      return updated;
    });
  };

  const getGaugeLevel = () => {
    if (!relationship) return 1;
    const score = relationship.sharedScore || 0;
    
    // Determine level index from metadata score thresholds
    let levelIdx = 1;
    for (let i = 0; i < RELATIONSHIP_LEVELS_METADATA.length; i++) {
      if (score >= RELATIONSHIP_LEVELS_METADATA[i].score) {
        levelIdx = i + 1;
      }
    }
    return Math.min(levelIdx, 8);
  };

  const gaugeLevel = getGaugeLevel();

  const isFieldLocked = (fieldKey: string) => {
    if (id === currentUser?.id) return false; // Own profile is always unlocked
    if (!profile?.privacy_settings?.hidden_values) return false;
    const settings = profile.privacy_settings.hidden_values[fieldKey];
    if (!settings) return false;
    const setting: any = Object.values(settings)[0];
    const requiredLevel = setting?.required_level;
    if (!requiredLevel || requiredLevel === 'public') return false;

    const reqIdx = RELATIONSHIP_LEVELS.indexOf(requiredLevel as any);
    const currentLevelKey = RELATIONSHIP_LEVELS_METADATA[gaugeLevel - 1]?.key || 'strangers';
    const currentIdx = RELATIONSHIP_LEVELS.indexOf(currentLevelKey as any);

    return currentIdx < (reqIdx === 5 ? 4 : reqIdx); // map vip/passionate constraints
  };

  const getFieldRequiredLevel = (fieldKey: string) => {
    if (!profile?.privacy_settings?.hidden_values) return '';
    const settings = profile.privacy_settings.hidden_values[fieldKey];
    if (!settings) return '';
    const setting: any = Object.values(settings)[0];
    const requiredLevel = setting?.required_level;
    if (!requiredLevel) return '';

    const found = RELATIONSHIP_LEVELS_METADATA.find(l => l.key === requiredLevel);
    return found ? found.name : 'Higher Level';
  };

  const isMediaUnlocked = (mediaItem: ProfileMedia) => {
    if (id === currentUser?.id) return true; // Own media is always unlocked
    if (!mediaItem.is_hidden || mediaItem.required_level === 'public') return true;

    const levelKeys = ['strangers', 'acquaintance', 'friendly', 'close', 'intimate', 'vip', 'passionate', 'committed', 'soulmate'];
    const reqIndex = levelKeys.indexOf(mediaItem.required_level);
    if (reqIndex === -1) return false;
    
    const normalizedReqIndex = reqIndex === 5 ? 4 : reqIndex; // map 'vip' to 'intimate'
    const normalizedGaugeIndex = gaugeLevel - 1;
    
    return normalizedGaugeIndex >= normalizedReqIndex;
  };

  const getMediaRequiredLevelName = (mediaItem: ProfileMedia) => {
    const found = RELATIONSHIP_LEVELS_METADATA.find(l => l.key === mediaItem.required_level);
    return found ? found.name : 'Higher Level';
  };

  // Perform Connect/Match action
  const handleMatchConnect = async () => {
    if (!currentUser || !profile) return;
    try {
      const { matched } = await recordInteraction(currentUser.id, profile.id, 'heart');
      if (matched) {
        setShowMatchOverlay(true);
      }
      // Refresh relationship state
      const relState = await getRelationshipState(currentUser.id, profile.id);
      setRelationship(relState);
    } catch (e) {
      console.error(e);
    }
  };

  // Compute Chemistry
  const chemistry = (() => {
    if (!currentUserProfile || !profile) return 40;
    const matchRes = calculateMatch(
      {
        gender: currentUserProfile.gender || 'neutral',
        location: currentUserProfile.origins || currentUserProfile.location || '',
        hobbies: currentUserProfile.hobbies || [],
        lifestyle: currentUserProfile.lifestyle_habits || {},
        relationshipGoal: currentUserProfile.relationship_goals?.[0] || 'Long term partner',
        relationshipType: currentUserProfile.relationship_types?.[0] || 'Monogamous',
        sexualPreferences: currentUserProfile.sexual_preferences || [currentUserProfile.sexual_preference].filter(Boolean),
        familyGoals: currentUserProfile.lifestyle_habits?.family_goals || 'Open to children'
      },
      {
        gender: profile.gender || 'neutral',
        location: profile.origins || profile.location || '',
        hobbies: profile.hobbies || [],
        lifestyle: profile.lifestyle_habits || {},
        relationshipGoal: profile.relationship_goals?.[0] || 'Long term partner',
        relationshipType: profile.relationship_types?.[0] || 'Monogamous',
        sexualPreferences: profile.sexual_preferences || [profile.sexual_preference].filter(Boolean),
        familyGoals: profile.lifestyle_habits?.family_goals || 'Open to children'
      }
    );
    return matchRes.totalScore;
  })();

  const compatibilityInsight = (() => {
    if (!profile) return '';
    const archetypeData = ARCHETYPE_PROFILES[profile.archetype?.toLowerCase() as keyof typeof ARCHETYPE_PROFILES];
    return archetypeData?.description || 'A unique persona with shared interest potential and distinct lifestyle sync layers.';
  })();

  const hiddenCount = (() => {
    if (!profile?.privacy_settings?.hidden_values) return 0;
    return Object.values(profile.privacy_settings.hidden_values).reduce(
      (acc: number, f: any) => acc + Object.keys(f).length, 0
    );
  })();

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mx-auto" />
          <h2 className="text-xl font-bold tracking-widest text-glow uppercase">Loading Profile...</h2>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white p-6">
        <div className="text-center max-w-sm space-y-4">
          <X className="w-16 h-16 text-red-500 mx-auto" />
          <h2 className="text-2xl font-black uppercase text-glow">Profile Error</h2>
          <p className="text-white/60 text-sm leading-relaxed">{error || 'Unable to load profile.'}</p>
          <button 
            onClick={() => router.back()}
            className="px-6 py-2.5 bg-white/10 hover:bg-white/20 rounded-full text-xs font-bold uppercase transition"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const coverPhoto = media.find(m => !m.is_hidden)?.media_url || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&q=80';

  return (
    <div className="min-h-screen bg-[#07070a] text-white pb-24 relative overflow-x-hidden">
      {/* Background glow effects */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-primary/10 blur-[130px] rounded-full" />
        <div className="absolute top-[30%] left-[-10%] w-[500px] h-[500px] bg-accent/5 blur-[120px] rounded-full" />
      </div>

      {/* BACKDROP COVER SECTION */}
      <div className="relative h-[250px] md:h-[400px] w-full z-10 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center transition-all duration-75"
          style={{ backgroundImage: `url(${coverPhoto})` }}
        />
        {/* Dark overlay gradients */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-[#07070a]" />
        
        {/* Top bar back button */}
        <div className="absolute top-6 left-6 z-20">
          <button 
            onClick={() => router.back()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 hover:bg-black/80 hover:border-white/20 transition text-xs font-bold uppercase"
          >
            <ChevronLeft className="w-4 h-4" /> Back
          </button>
        </div>
      </div>

      {/* PROFILE HEADER PANEL */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-20 mt-[-80px] md:mt-[-120px] space-y-6">
        <div className="flex flex-col md:flex-row gap-6 md:items-end justify-between">
          <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-end">
            {/* Avatar Photo */}
            <div className="relative group">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-[2.5rem] overflow-hidden border-4 border-white/10 shadow-2xl bg-black relative">
                <img 
                  src={profile.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80'} 
                  alt={profile.display_name} 
                  className="w-full h-full object-cover"
                />
              </div>
              <span className={`absolute bottom-2 right-2 w-5 h-5 rounded-full border-4 border-[#07070a] ${profile.ai_agent_active ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`} />
            </div>

            {/* User Meta info */}
            <div className="space-y-2 text-left">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-3xl md:text-4xl font-black tracking-tighter text-glow uppercase">{profile.display_name}</h1>
                <span className={`text-[8px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border ${
                  profile.role === 'creator' 
                    ? 'bg-accent/10 border-accent text-accent' 
                    : 'bg-primary/10 border-primary text-primary'
                }`}>
                  {profile.role}
                </span>
                {profile.is_kyc_verified && (
                  <span className="flex items-center gap-1 text-[8px] font-black uppercase tracking-widest bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-2 py-1 rounded-full">
                    <ShieldCheck className="w-3 h-3" /> Verified
                  </span>
                )}
              </div>
              <p className="text-white/40 text-xs font-bold tracking-wider">@{profile.username}</p>
            </div>
          </div>

          {/* Quick Actions Panel */}
          <div className="flex flex-wrap gap-2.5">
            {/* Favorite Star Toggle */}
            <button 
              onClick={handleToggleFavorite}
              className={`w-12 h-12 rounded-2xl border flex items-center justify-center transition shadow-xl ${
                isFavorite
                  ? 'bg-yellow-500/20 border-yellow-500 text-yellow-400 shadow-[0_0_15px_rgba(234,179,8,0.3)]'
                  : 'bg-white/5 border-white/10 text-white/60 hover:text-white hover:border-white/20'
              }`}
            >
              <Star className={`w-5 h-5 ${isFavorite ? 'fill-yellow-500' : ''}`} />
            </button>

            {/* Direct message button */}
            <button 
              onClick={() => router.push(`/messages?partner=${profile.id}`)}
              className="px-5 h-12 rounded-2xl bg-white/5 border border-white/10 text-white/80 hover:text-white hover:bg-white/10 transition flex items-center gap-2 text-xs font-black uppercase tracking-wider shadow-xl"
            >
              <MessageCircleHeart className="w-5 h-5 text-primary" /> Direct Chat
            </button>

            {/* Match Connect Button */}
            {relationship?.isMatched ? (
              <div className="px-5 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500 text-emerald-400 flex items-center gap-2 text-xs font-black uppercase tracking-wider shadow-lg">
                <Heart className="w-5 h-5 fill-emerald-400" /> Connected Match
              </div>
            ) : (
              <button 
                onClick={handleMatchConnect}
                className="px-6 h-12 rounded-2xl bg-primary text-primary-foreground hover:brightness-110 active:scale-[0.98] transition flex items-center gap-2 text-xs font-black uppercase tracking-widest shadow-[0_0_20px_rgba(138,43,226,0.5)]"
              >
                <Heart className="w-5 h-5 fill-primary-foreground" /> Match Connection
              </button>
            )}
          </div>
        </div>

        {/* TWO-COLUMN CONTENT GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* LEFT SIDEBAR: CHEMISTRY & MEDIA ALBUM */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Compatibility Radar Panel */}
            <div className="glass-card p-5 border border-white/10 rounded-3xl space-y-4">
              <h2 className="text-xs font-black uppercase tracking-widest text-white/40">Relational Chemistry</h2>
              
              <div className="flex items-center gap-5">
                {/* Chemistry Score circle */}
                <div className="relative w-20 h-20 shrink-0 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="40" cy="40" r="34" className="stroke-white/5 fill-none" strokeWidth="6" />
                    <circle 
                      cx="40" cy="40" r="34" 
                      className="stroke-primary fill-none" 
                      strokeWidth="6" 
                      strokeDasharray="213.6" 
                      strokeDashoffset={213.6 - (213.6 * chemistry) / 100}
                    />
                  </svg>
                  <span className="absolute text-sm font-black text-white">{chemistry}%</span>
                </div>

                <div className="space-y-1 text-left">
                  <p className="text-[10px] font-black uppercase tracking-widest text-primary">Harmonic Connection</p>
                  <p className="text-lg font-bold text-white leading-tight">
                    {RELATIONSHIP_LEVELS_METADATA[gaugeLevel - 1]?.name || 'Stranger'}
                  </p>
                  <p className="text-[9px] text-white/40 font-bold uppercase tracking-wider">
                    Score: {relationship?.sharedScore || 0} XP
                  </p>
                </div>
              </div>
              
              {/* Premium action widgets (Call, stream) */}
              <div className="grid grid-cols-2 gap-2 pt-2">
                <button 
                  onClick={() => setShowCallModal(true)}
                  className="p-3 bg-white/[0.02] border border-white/5 hover:border-primary/20 hover:bg-primary/5 rounded-2xl flex flex-col items-center gap-1.5 transition"
                >
                  <PhoneCall className="w-4 h-4 text-primary" />
                  <span className="text-[8px] font-black uppercase tracking-widest">Private Call</span>
                </button>

                <button 
                  onClick={() => setShowLiveStream(true)}
                  className="p-3 bg-white/[0.02] border border-white/5 hover:border-accent/20 hover:bg-accent/5 rounded-2xl flex flex-col items-center gap-1.5 transition"
                >
                  <Tv className="w-4 h-4 text-accent animate-pulse" />
                  <span className="text-[8px] font-black uppercase tracking-widest">Watch Live</span>
                </button>
              </div>
            </div>

            {/* Public Album Gallery */}
            <div className="glass-card p-5 border border-white/10 rounded-3xl space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xs font-black uppercase tracking-widest text-white/40">Public Media Album</h2>
                <span className="text-[9px] bg-white/5 border border-white/10 px-2 py-0.5 rounded font-bold">
                  {media.length} Photos
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {media.map((item) => {
                  const unlocked = isMediaUnlocked(item);
                  return (
                    <div 
                      key={item.id}
                      className="relative aspect-square rounded-2xl overflow-hidden bg-white/[0.02] border border-white/5 group shadow-md"
                    >
                      <img 
                        src={item.media_url} 
                        alt="Album photo" 
                        className={`w-full h-full object-cover transition duration-300 group-hover:scale-105 ${!unlocked ? 'blur-md pointer-events-none' : ''}`}
                      />
                      {!unlocked && (
                        <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center p-2 text-center">
                          <Lock className="w-5 h-5 text-red-500 mb-1" />
                          <span className="text-[8px] font-black uppercase text-red-400 tracking-wider">
                            Requires {getMediaRequiredLevelName(item)}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* RIGHT PANELS: BIO, DYNAMIC INSIGHTS, TRAITS */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Bio & AI Narrative */}
            <div className="glass-card p-6 border border-white/10 rounded-3xl space-y-5 text-left">
              <div className="border-b border-white/5 pb-3">
                <h2 className="text-xs font-black uppercase tracking-widest text-white/40">About Me</h2>
              </div>
              
              <div className="space-y-4">
                {profile.bio && (
                  <div>
                    <h3 className="text-[9px] font-black uppercase text-primary tracking-widest mb-1.5">Biography</h3>
                    <p className="text-white/80 text-xs leading-relaxed font-medium">{profile.bio}</p>
                  </div>
                )}

                {/* AI Narrative */}
                <div className="p-4 bg-primary/5 border border-primary/20 rounded-2xl space-y-2">
                  <div className="flex items-center gap-1.5 text-primary">
                    <Sparkles className="w-4 h-4" />
                    <span className="text-[10px] font-black uppercase tracking-widest">AI Relational Insight</span>
                  </div>
                  <p className="text-white/70 text-xs leading-relaxed italic">
                    "{compatibilityInsight}"
                  </p>
                </div>
              </div>
            </div>

            {/* Profile Traits dynamic grid */}
            <div className="glass-card p-6 border border-white/10 rounded-3xl space-y-5 text-left">
              <div className="flex justify-between items-center border-b border-white/5 pb-3">
                <h2 className="text-xs font-black uppercase tracking-widest text-white/40">Profile Traits</h2>
                {hiddenCount > 0 && (
                  <div className="flex items-center gap-1 bg-[#dc143c]/10 border border-[#dc143c]/20 px-2.5 py-1 rounded-lg">
                    <Lock className="w-3 h-3 text-[#dc143c]" />
                    <span className="text-[8px] font-black uppercase tracking-widest text-[#dc143c]">
                      {hiddenCount} Info Settings Hidden
                    </span>
                  </div>
                )}
              </div>

              {(() => {
                const traits = [
                  {
                    key: 'relationship_goals',
                    label: 'Relationship Goals',
                    icon: Compass,
                    value: profile.relationship_goals?.length > 0 ? profile.relationship_goals.join(', ') : profile.relationshipGoal,
                  },
                  {
                    key: 'relationship_types',
                    label: 'Relationship Type',
                    icon: Heart,
                    value: profile.relationship_types?.length > 0 ? profile.relationship_types.join(', ') : profile.relationshipType,
                  },
                  {
                    key: 'sexual_preferences',
                    label: 'Sexual Preference',
                    icon: Sparkles,
                    value: profile.sexual_preferences?.length > 0 ? profile.sexual_preferences.join(', ') : profile.sexual_preference,
                  },
                  {
                    key: 'height',
                    label: 'Height',
                    icon: EyeOff,
                    value: profile.lifestyle_habits?.height || profile.height,
                  },
                  {
                    key: 'career',
                    label: 'Profession',
                    icon: Briefcase,
                    value: profile.lifestyle_habits?.career || profile.career,
                  },
                  {
                    key: 'family_goals',
                    label: 'Family Plan',
                    icon: Calendar,
                    value: profile.lifestyle_habits?.family_goals || profile.familyGoals,
                  },
                  {
                    key: 'origins',
                    label: 'Distance',
                    icon: MapPin,
                    value: calculateMockDistance(currentUserProfile, profile),
                  },
                  {
                    key: 'native_town',
                    label: 'Hometown',
                    icon: Home,
                    value: profile.native_town || profile.nativeTown,
                  },
                  {
                    key: 'residence',
                    label: 'Residence',
                    icon: Compass,
                    value: profile.residence,
                  },
                  {
                    key: 'current_location',
                    label: 'Current Location',
                    icon: MapPin,
                    value: profile.current_location || profile.currentLocation,
                  },
                  {
                    key: 'favorite_languages',
                    label: 'Languages',
                    icon: Languages,
                    value: (() => {
                      const favs = profile.favorite_languages || [];
                      const adds = profile.additional_languages || [];
                      const combined = [...favs, ...adds];
                      return combined.length > 0 ? combined.join(', ') : null;
                    })(),
                  },
                ];

                const filledTraits = traits.filter(t => !!t.value);

                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {filledTraits.map(({ key, label, icon: Icon, value }) => {
                      const locked = isFieldLocked(key);
                      return locked ? (
                        <div key={key} className="p-3.5 bg-red-950/5 border border-red-500/10 rounded-2xl flex items-center justify-between gap-3 text-left">
                          <div className="flex flex-col min-w-0">
                            <span className="text-[8px] font-black uppercase text-white/30 tracking-widest leading-none flex items-center gap-1">
                              <Icon className="w-3 h-3 text-white/40" /> {label}
                            </span>
                            <span className="text-[9px] font-black text-red-400 mt-1.5 flex items-center gap-1 leading-none">
                              <Lock className="w-3.5 h-3.5" /> Locked
                            </span>
                          </div>
                          <span className="text-[7px] font-black uppercase tracking-wider text-red-500 bg-red-500/10 px-2 py-1 rounded border border-red-500/20 text-right shrink-0">
                            {getFieldRequiredLevel(key)}
                          </span>
                        </div>
                      ) : (
                        <div key={key} className="p-3.5 bg-white/[0.02] border border-white/5 rounded-2xl flex items-center gap-3 text-left">
                          <div className="w-9 h-9 bg-white/5 border border-white/5 rounded-xl flex items-center justify-center shrink-0">
                            <Icon className="w-4 h-4 text-primary" />
                          </div>
                          <div className="min-w-0">
                            <span className="text-[8px] font-black uppercase text-white/30 tracking-widest leading-none">{label}</span>
                            <p className="text-[10px] font-bold text-white/80 mt-1 uppercase tracking-wide truncate" title={String(value)}>
                              {String(value)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>

            {/* Hobbies & Interests */}
            {profile.hobbies && profile.hobbies.length > 0 && (
              <div className="glass-card p-6 border border-white/10 rounded-3xl space-y-4 text-left">
                <h2 className="text-xs font-black uppercase tracking-widest text-white/40">Hobbies & Interests</h2>
                <div className="flex flex-wrap gap-2">
                  {profile.hobbies.map((hobby: string, i: number) => (
                    <span 
                      key={i} 
                      className="text-[9px] bg-white/5 border border-white/5 hover:border-primary/20 text-white/80 px-3.5 py-1.5 rounded-full font-bold uppercase tracking-wider transition cursor-default"
                    >
                      {hobby}
                    </span>
                  ))}
                </div>
              </div>
            )}

          </div>

        </div>

      </div>

      {/* MATCH NOTIFICATION OVERLAY SCREEN */}
      <AnimatePresence>
        {showMatchOverlay && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 backdrop-blur-2xl z-50 flex flex-col items-center justify-center p-6 text-center"
          >
            <motion.div 
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              className="max-w-md w-full space-y-8 flex flex-col items-center"
            >
              <div className="relative w-28 h-28 flex items-center justify-center">
                <Heart className="w-24 h-24 text-primary fill-primary animate-pulse" />
                <Sparkles className="w-10 h-10 text-accent absolute top-0 right-0 animate-bounce" />
              </div>
              
              <div className="space-y-2">
                <span className="text-xs font-black tracking-[0.3em] uppercase text-primary">Harmonic Core Synergy</span>
                <h2 className="text-4xl font-black tracking-tighter text-glow">IT'S A MUTUAL MATCH!</h2>
                <p className="text-white/60 text-sm max-w-xs mx-auto leading-relaxed">
                  You and <span className="text-primary font-bold">{profile.display_name}</span> have synced interest channels!
                </p>
              </div>

              <div className="flex justify-around items-center w-full gap-4 max-w-sm pt-4">
                <div className="text-center">
                  <div className="w-20 h-20 rounded-[1.5rem] overflow-hidden border border-white/10 shadow-lg">
                    <img src={currentUserProfile?.avatar_url || 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=200&q=80'} className="w-full h-full object-cover" />
                  </div>
                  <p className="text-[10px] text-white/40 mt-2 uppercase font-bold">You</p>
                </div>
                <Heart className="w-8 h-8 text-primary fill-primary" />
                <div className="text-center">
                  <div className="w-20 h-20 rounded-[1.5rem] overflow-hidden border border-white/10 shadow-lg">
                    <img src={profile.avatar_url} className="w-full h-full object-cover" />
                  </div>
                  <p className="text-[10px] text-white/40 mt-2 uppercase font-bold">{profile.display_name}</p>
                </div>
              </div>

              <div className="w-full space-y-3 pt-6 max-w-xs">
                <button 
                  onClick={() => {
                    setShowMatchOverlay(false);
                    router.push(`/messages?partner=${profile.id}`);
                  }}
                  className="w-full py-4 bg-primary text-primary-foreground font-black text-xs tracking-widest uppercase rounded-full shadow-[0_0_20px_rgba(138,43,226,0.6)] hover:brightness-110 active:scale-95 transition"
                >
                  Send Direct Message
                </button>
                <button 
                  onClick={() => setShowMatchOverlay(false)}
                  className="w-full py-3.5 bg-white/5 border border-white/10 text-white/80 hover:bg-white/10 font-bold text-xs tracking-wider uppercase rounded-full transition"
                >
                  Continue Browsing
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* PRIVATE STREAM PLAYER MODAL */}
      <AnimatePresence>
        {showLiveStream && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4"
          >
            <div className="bg-[#0f0f13] border border-white/10 rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl flex flex-col justify-between h-[450px]">
              <div className="p-4 border-b border-white/5 flex justify-between items-center bg-black/40">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-ping" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-red-500">Live now</span>
                  <h3 className="text-sm font-bold text-white ml-2">Watching @{profile.username}'s stream</h3>
                </div>
                <button 
                  onClick={() => setShowLiveStream(false)}
                  className="w-8 h-8 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Stream Video Placeholder */}
              <div className="flex-1 bg-black relative flex items-center justify-center group overflow-hidden">
                <img 
                  src={profile.avatar_url || coverPhoto} 
                  className="absolute inset-0 w-full h-full object-cover blur-2xl opacity-40 pointer-events-none" 
                />
                <div className="relative z-10 text-center space-y-4 max-w-xs">
                  <Tv className="w-12 h-12 text-accent mx-auto animate-bounce" />
                  <p className="text-xs text-white/70 font-semibold leading-relaxed">
                    Connecting to secure video stream... Private creator feed requires VIP or Harmony subscription.
                  </p>
                  <button 
                    onClick={() => setShowLiveStream(false)}
                    className="px-6 py-2.5 bg-accent text-white font-black text-[10px] tracking-widest uppercase rounded-full shadow-lg"
                  >
                    Close Stream
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* PRIVATE CALL MODAL */}
      <AnimatePresence>
        {showCallModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4"
          >
            <div className="bg-[#0f0f13] border border-white/10 rounded-3xl max-w-sm w-full p-6 text-center space-y-5 shadow-2xl relative overflow-hidden">
              <div className="w-14 h-14 bg-primary/20 border border-primary/40 rounded-full flex items-center justify-center text-primary mx-auto animate-pulse">
                <PhoneCall className="w-6 h-6" />
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-black uppercase text-glow tracking-tight">Request Private Call</h3>
                <p className="text-white/60 text-xs leading-relaxed max-w-xs mx-auto">
                  Spend <span className="text-primary font-bold">50 Connection Points</span> to invite @{profile.username} to a direct, secure voice or video connection channel.
                </p>
              </div>

              <div className="bg-white/5 border border-white/5 rounded-2xl p-3 flex justify-between items-center text-left text-xs font-semibold">
                <span className="text-white/40 uppercase tracking-wider text-[9px] font-bold">Your Balance</span>
                <span className="text-primary font-black text-glow">{currentUserProfile?.connection_points || 0} XP</span>
              </div>

              <div className="flex gap-2.5 pt-2">
                <button 
                  onClick={() => setShowCallModal(false)}
                  className="flex-1 py-3 bg-white/5 border border-white/10 hover:bg-white/10 text-white/80 font-bold text-xs uppercase tracking-wider rounded-2xl transition"
                >
                  Cancel
                </button>
                <button 
                  onClick={async () => {
                    setShowCallModal(false);
                    // Deduct mock points locally or via RPC if needed
                    alert('Call request sent successfully! Awaiting matching response.');
                  }}
                  className="flex-1 py-3 bg-primary text-primary-foreground font-black text-xs uppercase tracking-widest rounded-2xl shadow-[0_0_15px_rgba(138,43,226,0.5)] transition"
                >
                  Confirm Request
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
