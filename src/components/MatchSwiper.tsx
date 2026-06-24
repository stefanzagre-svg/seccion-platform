'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';
import { 
  Heart, HeartCrack, Sparkles, MessageCircleHeart, Info, X, 
  Compass, Activity, Clock, MapPin, ShieldAlert, Lock, Send, Brain 
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { fetchSwipeableProfiles, recordInteraction, fetchProfileMedia, type ProfileMedia } from '@/lib/relationship-db';
import { calculateMatch, type UserProfile, type MatchResult } from '@/lib/match-engine';
import { ARCHETYPE_PROFILES, type ArchetypeId } from '@/lib/constants';
import SuggestionMovesModal from './SuggestionMovesModal';
import BlurredFaceImage from '@/components/BlurredFaceImage';


const DEFAULT_USER_PROFILE: UserProfile = {
  gender: 'Male',
  location: 'San Francisco',
  origins: 'San Francisco',
  hobbies: ['Fitness', 'Tech', 'Traveler'],
  relationshipGoal: 'Short-term',
  relationshipType: 'Monogamous',
  sexualPreferences: ['Heterosexual'],
  familyGoals: 'Want children',
  archetype: 'caregiver',
  moods: ['flirty_playful', 'exclusive_vip'],
  corePassion: 'fitness',
  age: 28,
  isKycVerified: true,
  lastActiveAt: new Date().toISOString(),
  engagementScore: 92,
  lifestyle: {
    workout: 'Often',
    traveling: 'Monthly',
    partying: 'Sometimes',
    'healthy eating': 'Every Day',
    socializing: 'Often',
    reading: 'Weekly',
    sleep: '6-7 Hours',
    smoking: 'Never',
    drinking: 'Socially',
    'social media': 'Moderate',
    'pet lover': 'Dog Person',
    'morning/night': 'Night Owl'
  }
};

function mapDbProfileToEngine(dbProf: any): UserProfile {
  if (!dbProf) return DEFAULT_USER_PROFILE;
  return {
    gender: dbProf.gender || (dbProf.sexual_preference === 'Lesbian' || dbProf.sexual_preference === 'Gay' ? 'female' : 'male'),
    location: dbProf.origins || dbProf.location || '',
    hobbies: dbProf.hobbies || [],
    lifestyle: dbProf.lifestyle_habits || {},
    relationshipGoal: dbProf.relationship_goals?.[0] || dbProf.relationshipGoal || 'Long-term',
    relationshipType: dbProf.relationship_types?.[0] || dbProf.relationshipType || 'Monogamous',
    sexualPreferences: dbProf.sexual_preferences || [dbProf.sexual_preference].filter(Boolean),
    familyGoals: dbProf.lifestyle_habits?.family_goals || dbProf.familyGoals || 'Open to children',
    archetype: dbProf.archetype || undefined,
    moods: dbProf.moods || undefined,
    corePassion: dbProf.core_passion || dbProf.corePassion || undefined,
    origins: dbProf.origins || undefined,
    isKycVerified: dbProf.is_kyc_verified || dbProf.isKycVerified || false,
    lastActiveAt: dbProf.last_active_at || dbProf.lastActiveAt || undefined,
    engagementScore: dbProf.engagement_score || dbProf.engagementScore || undefined,
    bioAnalysis: dbProf.bio_analysis || undefined,
  };
}

const SIGNALS_METADATA = [
  { key: 'archetypeChemistry', label: 'Archetype', icon: Compass, color: 'text-purple-400' },
  { key: 'lifestyleSync', label: 'Lifestyle', icon: Heart, color: 'text-pink-400' },
  { key: 'hobbyOverlap', label: 'Hobbies', icon: Sparkles, color: 'text-yellow-400' },
  { key: 'moodResonance', label: 'Moods', icon: Activity, color: 'text-orange-400' },
  { key: 'temporalSignal', label: 'Recency', icon: Clock, color: 'text-cyan-400' },
  { key: 'geoProximity', label: 'Proximity', icon: MapPin, color: 'text-emerald-400' },
  { key: 'narrativeResonance', label: 'Narrative', icon: Brain, color: 'text-[#ff007f]' },
] as const;

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

function getMockMediaForCandidate(candidateId: string): ProfileMedia[] {
  const mockMedia: Record<string, ProfileMedia[]> = {
    elena: [
      { id: 'elena-media-1', user_id: 'elena', media_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&q=80', media_type: 'image', is_hidden: false, required_level: 'public' },
      { id: 'elena-media-2', user_id: 'elena', media_url: 'https://images.unsplash.com/photo-1518310383802-640c2de311b2?w=800&q=80', media_type: 'image', is_hidden: false, required_level: 'public' },
      { id: 'elena-media-3', user_id: 'elena', media_url: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=800&q=80', media_type: 'image', is_hidden: true, required_level: 'friendly' },
      { id: 'elena-media-4', user_id: 'elena', media_url: 'https://images.unsplash.com/photo-1507398941214-572c25f4b1dc?w=800&q=80', media_type: 'image', is_hidden: true, required_level: 'close' }
    ],
    sofia: [
      { id: 'sofia-media-1', user_id: 'sofia', media_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&q=80', media_type: 'image', is_hidden: false, required_level: 'public' },
      { id: 'sofia-media-2', user_id: 'sofia', media_url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&q=80', media_type: 'image', is_hidden: false, required_level: 'public' },
      { id: 'sofia-media-3', user_id: 'sofia', media_url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&q=80', media_type: 'image', is_hidden: true, required_level: 'friendly' },
      { id: 'sofia-media-4', user_id: 'sofia', media_url: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=800&q=80', media_type: 'image', is_hidden: true, required_level: 'close' }
    ],
    valentina: [
      { id: 'valentina-media-1', user_id: 'valentina', media_url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&q=80', media_type: 'image', is_hidden: false, required_level: 'public' },
      { id: 'valentina-media-2', user_id: 'valentina', media_url: 'https://images.unsplash.com/photo-1487180142328-0c4e37023af5?w=800&q=80', media_type: 'image', is_hidden: false, required_level: 'public' },
      { id: 'valentina-media-3', user_id: 'valentina', media_url: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=800&q=80', media_type: 'image', is_hidden: true, required_level: 'friendly' },
      { id: 'valentina-media-4', user_id: 'valentina', media_url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80', media_type: 'image', is_hidden: true, required_level: 'close' }
    ],
    marco: [
      { id: 'marco-media-1', user_id: 'marco', media_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&q=80', media_type: 'image', is_hidden: false, required_level: 'public' },
      { id: 'marco-media-2', user_id: 'marco', media_url: 'https://images.unsplash.com/photo-1480429370139-e0132c086e2a?w=800&q=80', media_type: 'image', is_hidden: false, required_level: 'public' },
      { id: 'marco-media-3', user_id: 'marco', media_url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&q=80', media_type: 'image', is_hidden: true, required_level: 'friendly' }
    ]
  };
  return mockMedia[candidateId] || [
    { id: `${candidateId}-fallback-1`, user_id: candidateId, media_url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&q=80', media_type: 'image', is_hidden: false, required_level: 'public' }
  ];
}

function isMediaUnlocked(media: ProfileMedia, currentGaugeLevel: number, hasSubscription: boolean): boolean {
  if (!media.is_hidden || media.required_level === 'public') return true;
  if (media.required_level === 'subscriber') return hasSubscription;
  
  const levelKeys = ['strangers', 'acquaintance', 'friendly', 'close', 'intimate', 'vip', 'passionate', 'committed', 'soulmate'];
  const reqIndex = levelKeys.indexOf(media.required_level);
  if (reqIndex === -1) return false;
  
  const normalizedReqIndex = reqIndex === 5 ? 4 : reqIndex; // map 'vip' (index 5) to 'intimate' (index 4)
  const normalizedGaugeIndex = currentGaugeLevel - 1;
  
  return normalizedGaugeIndex >= normalizedReqIndex;
}

const isPromptAnswerLockedForViewer = (
  candidate: any, 
  promptField: 'bio_prompt_answer' | 'bio_prompt_answer_2', 
  currentGaugeLevel: number
) => {
  if (!candidate.privacy_settings || !candidate.privacy_settings.hidden_values) return false;
  const fieldSettings = candidate.privacy_settings.hidden_values[promptField];
  if (!fieldSettings) return false;
  
  const values = Object.values(fieldSettings);
  if (values.length === 0) return false;
  
  const setting: any = values[0];
  const requiredLevel = setting?.required_level;
  if (!requiredLevel) return false;
  if (requiredLevel === 'public') return false;
  
  const levelKeys = ['strangers', 'acquaintance', 'friendly', 'close', 'intimate', 'vip', 'passionate', 'committed', 'soulmate'];
  const reqIndex = levelKeys.indexOf(requiredLevel);
  if (reqIndex === -1) return false;
  
  const normalizedReqIndex = reqIndex === 5 ? 4 : reqIndex; // map 'vip' to 'intimate' index
  const normalizedGaugeIndex = currentGaugeLevel - 1;
  
  return normalizedGaugeIndex < normalizedReqIndex;
};

const getRequiredLevelName = (candidate: any, promptField: 'bio_prompt_answer' | 'bio_prompt_answer_2') => {
  if (!candidate.privacy_settings || !candidate.privacy_settings.hidden_values) return '';
  const fieldSettings = candidate.privacy_settings.hidden_values[promptField];
  if (!fieldSettings) return '';
  
  const values = Object.values(fieldSettings);
  if (values.length === 0) return '';
  
  const setting: any = values[0];
  const requiredLevel = setting?.required_level;
  if (!requiredLevel) return '';
  
  const found = RELATIONSHIP_LEVELS_METADATA.find(l => l.key === requiredLevel || l.name.toLowerCase().replace(' ', '_') === requiredLevel);
  return found ? found.name : 'Higher Level';
};


// Particle class for Match Reveal Canvas
class RevealParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
  size: number;
  color: string;
  angle: number;
  radius: number;
  speed: number;
  type: 'spark' | 'star';
  life: number;
  maxLife: number;

  constructor(cx: number, cy: number, type: 'spark' | 'star') {
    this.type = type;
    this.life = 0;
    this.maxLife = Math.random() * 80 + 40;
    
    if (type === 'spark') {
      // Explode outwards from center
      this.x = cx;
      this.y = cy;
      const angle = Math.random() * Math.PI * 2;
      const velocity = Math.random() * 8 + 4;
      this.vx = Math.cos(angle) * velocity;
      this.vy = Math.sin(angle) * velocity;
      this.size = Math.random() * 3 + 2;
      this.alpha = 1;
      const colors = ['#ff007f', '#8a2be2', '#00f0ff', '#ffabf3'];
      this.color = colors[Math.floor(Math.random() * colors.length)];
      this.radius = 0;
      this.angle = 0;
      this.speed = 0;
    } else {
      // Swirling background stars
      this.angle = Math.random() * Math.PI * 2;
      this.radius = Math.random() * 300 + 50;
      this.speed = (Math.random() * 0.005 + 0.002) * (Math.random() > 0.5 ? 1 : -1);
      this.x = cx + Math.cos(this.angle) * this.radius;
      this.y = cy + Math.sin(this.angle) * this.radius;
      this.vx = 0;
      this.vy = 0;
      this.size = Math.random() * 2 + 1;
      this.alpha = Math.random() * 0.6 + 0.2;
      this.color = '#ffffff';
    }
  }

  update(cx: number, cy: number, cursor: { x: number; y: number } | null) {
    if (this.type === 'spark') {
      this.x += this.vx;
      this.y += this.vy;
      this.vx *= 0.96; // drag
      this.vy *= 0.96;
      this.vy += 0.08; // gravity
      this.alpha = Math.max(1 - (this.life / this.maxLife), 0);
      this.life++;
    } else {
      // Swing in orbit
      this.angle += this.speed;
      
      // Pull slightly toward cursor if active
      if (cursor) {
        const dx = cursor.x - this.x;
        const dy = cursor.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 180) {
          this.x += (dx / dist) * 0.8;
          this.y += (dy / dist) * 0.8;
        }
      }

      // Keep orbiting relative to center
      const targetX = cx + Math.cos(this.angle) * this.radius;
      const targetY = cy + Math.sin(this.angle) * this.radius;
      this.x += (targetX - this.x) * 0.05;
      this.y += (targetY - this.y) * 0.05;
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.fillStyle = this.color;
    ctx.shadowBlur = this.type === 'spark' ? 10 : 2;
    ctx.shadowColor = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

export default function MatchSwiper() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [currentUserProfile, setCurrentUserProfile] = useState<UserProfile>(DEFAULT_USER_PROFILE);
  const [cards, setCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [gaugeLevel, setGaugeLevel] = useState(1); // 1 = Gray, 8 = Crimson
  const [showInteraction, setShowInteraction] = useState<'heart' | 'broken_heart' | null>(null);
  
  // Media items states
  const [cardsMedia, setCardsMedia] = useState<Record<string, ProfileMedia[]>>({});
  const [activeMediaIndex, setActiveMediaIndex] = useState<Record<string, number>>({});
  const [activeSubscriptions, setActiveSubscriptions] = useState<any[]>([]);

  
  // Suggestion Moves Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isKycVerified, setIsKycVerified] = useState(false);

  // Match Notification Overlay
  const [matchData, setMatchData] = useState<any | null>(null);

  // Match HUD detail view overlay toggle per card
  const [activeBreakdownCardId, setActiveBreakdownCardId] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<RevealParticle[]>([]);
  const cursorRef = useRef<{ x: number; y: number } | null>(null);
  const animationFrameId = useRef<number | null>(null);

  // Drag variables for the top card
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-10, 10]);
  const opacity = useTransform(x, [-200, -150, 0, 150, 200], [0, 1, 1, 1, 0]);

  // Get current user session
  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setCurrentUser(session.user);
        
        // Also fetch profile to see KYC status & full matching details
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        if (profile) {
          setIsKycVerified(profile.is_kyc_verified);
          setCurrentUserProfile(mapDbProfileToEngine(profile));
        }

        // Fetch active subscriptions
        const { data: subs } = await supabase
          .from('subscriptions')
          .select('creator_id, tier, is_active')
          .eq('subscriber_id', session.user.id)
          .eq('is_active', true);
        
        if (subs) {
          setActiveSubscriptions(subs);
        }
      } else {
        setLoading(false);
      }
    };
    getSession();
  }, []);

  // Fetch swipeable profiles once user is loaded
  useEffect(() => {
    if (!currentUser) return;

    const loadProfiles = async () => {
      setLoading(true);
      const profiles = await fetchSwipeableProfiles(currentUser.id);
      setCards(profiles);
      setLoading(false);
    };

    loadProfiles();
  }, [currentUser]);

  // Load media album for all swiper cards
  useEffect(() => {
    if (cards.length === 0) return;

    const loadMediaForCards = async () => {
      const newMedia: Record<string, ProfileMedia[]> = { ...cardsMedia };
      let updated = false;

      for (const card of cards) {
        if (!newMedia[card.id]) {
          try {
            const media = await fetchProfileMedia(card.id);
            newMedia[card.id] = media.length > 0 ? media : getMockMediaForCandidate(card.id);
          } catch (err) {
            console.error(`Error loading media for card ${card.id}:`, err);
            newMedia[card.id] = getMockMediaForCandidate(card.id);
          }
          updated = true;
        }
      }

      if (updated) {
        setCardsMedia(newMedia);
      }
    };

    loadMediaForCards();
  }, [cards]);

  // Canvas particle loops for match overlay
  useEffect(() => {
    if (!matchData) {
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
      particlesRef.current = [];
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const cx = canvas.width / 2;
    const cy = canvas.height / 2;

    // Seed background stars
    for (let i = 0; i < 70; i++) {
      particlesRef.current.push(new RevealParticle(cx, cy, 'star'));
    }
    // Seed explosion sparks
    for (let i = 0; i < 90; i++) {
      particlesRef.current.push(new RevealParticle(cx, cy, 'spark'));
    }

    const renderLoop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const particles = particlesRef.current;
      const cursor = cursorRef.current;

      // Draw constellation grid lines first
      const stars = particles.filter(p => p.type === 'star');
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.lineWidth = 0.5;
      for (let i = 0; i < stars.length; i++) {
        for (let j = i + 1; j < stars.length; j++) {
          const dx = stars[i].x - stars[j].x;
          const dy = stars[i].y - stars[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 85) {
            ctx.beginPath();
            ctx.moveTo(stars[i].x, stars[i].y);
            ctx.lineTo(stars[j].x, stars[j].y);
            ctx.stroke();
          }
        }
      }

      // Update and draw all particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.update(cx, cy, cursor);
        p.draw(ctx);
        
        // Remove dead sparks
        if (p.type === 'spark' && p.life >= p.maxLife) {
          particles.splice(i, 1);
        }
      }

      // Slowly spawn occasional sparkling trails
      if (Math.random() < 0.15) {
        particles.push(new RevealParticle(cx, cy, 'spark'));
      }

      animationFrameId.current = requestAnimationFrame(renderLoop);
    };
    renderLoop();

    return () => {
      window.removeEventListener('resize', resize);
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
    };
  }, [matchData]);

  const handleDragEnd = (event: any, info: any) => {
    if (info.offset.x > 100) {
      handleSwipe('right');
    } else if (info.offset.x < -100) {
      handleSwipe('left');
    }
  };

  const handleSwipe = async (direction: 'left' | 'right') => {
    if (cards.length === 0 || !currentUser) return;

    const topCard = cards[0];
    const interactionType = direction === 'right' ? 'heart' : 'broken_heart';

    setShowInteraction(interactionType);
    if (direction === 'right') {
      setGaugeLevel(prev => Math.min(prev + 1, 8));
    } else {
      setGaugeLevel(prev => Math.max(prev - 1, 1));
    }

    // Save interaction to database
    const { matched } = await recordInteraction(currentUser.id, topCard.id, interactionType);

    if (matched) {
      setMatchData(topCard);
    }

    // Close any open HUD panel
    setActiveBreakdownCardId(null);

    // Remove top card after swipe animation finishes
    setTimeout(() => {
      setCards(prev => prev.slice(1));
      setShowInteraction(null);
    }, 400);
  };

  // Determine Gauge Color
  const getGaugeColor = (level: number) => {
    const colors = [
      'bg-[#808080]', // 1: Gray
      'bg-[#add8e6]', // 2: Light Blue
      'bg-[#00008b]', // 3: Deep Blue
      'bg-[#ffff00]', // 4: Yellow
      'bg-[#ffa500]', // 5: Orange
      'bg-[#ffc0cb]', // 6: Pink
      'bg-[#006400]', // 7: Deep Green
      'bg-[#dc143c]', // 8: Crimson
    ];
    return colors[level - 1];
  };

  const getTierBadgeStyle = (tier: string) => {
    switch (tier) {
      case 'soul_aligned': 
        return {
          gradient: 'from-purple-500/90 to-pink-500/90 text-purple-100 border-purple-400/30',
          glow: 'shadow-[0_0_25px_rgba(168,85,247,0.45)] border-purple-500/40',
          emoji: '💎'
        };
      case 'high_spark': 
        return {
          gradient: 'from-pink-500/90 to-amber-500/90 text-pink-100 border-pink-400/30',
          glow: 'shadow-[0_0_25px_rgba(236,72,153,0.45)] border-pink-500/40',
          emoji: '⚡'
        };
      case 'moderate': 
        return {
          gradient: 'from-blue-500/90 to-cyan-500/90 text-blue-100 border-blue-400/30',
          glow: 'shadow-[0_0_25px_rgba(59,130,246,0.35)] border-blue-500/30',
          emoji: '🔆'
        };
      case 'low': 
        return {
          gradient: 'from-slate-600/90 to-zinc-700/90 text-slate-100 border-slate-600/30',
          glow: 'shadow-[0_0_15px_rgba(113,113,122,0.2)] border-zinc-700/20',
          emoji: '🌫️'
        };
      default: // blocked
        return {
          gradient: 'from-red-600/90 to-rose-700/90 text-red-100 border-red-500/30',
          glow: 'shadow-[0_0_25px_rgba(239,68,68,0.45)] border-red-500/40',
          emoji: '🚫'
        };
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    cursorRef.current = { x: e.clientX, y: e.clientY };
  };

  return (
    <div className="relative w-full max-w-sm h-[calc(100vh-210px)] md:h-[650px] max-h-[680px] min-h-[400px] md:min-h-[480px] flex flex-col items-center justify-between mx-auto">
      
      {/* Gauge Header */}
      <div className="w-full flex flex-col items-center mb-2 shrink-0">
        <span className="text-[10px] md:text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Relationship Gauge (Level {gaugeLevel})</span>
        <div className="w-full h-2.5 bg-white/10 rounded-full overflow-hidden">
          <motion.div 
            className={`h-full ${getGaugeColor(gaugeLevel)}`}
            initial={{ width: '12.5%' }}
            animate={{ width: `${(gaugeLevel / 8) * 100}%` }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          />
        </div>
      </div>

      {/* Cards Area */}
      <div className="relative w-full flex-1 min-h-0 flex justify-center items-center my-2">
        <AnimatePresence>
          {cards.length > 0 ? (
            cards.map((card, index) => {
              const isTop = index === 0;
              const mappedCandidate = mapDbProfileToEngine(card);
              const matchResult = calculateMatch(currentUserProfile, mappedCandidate);
              const tierConfig = getTierBadgeStyle(matchResult.compatibilityTier);
              const isBreakdownOpen = activeBreakdownCardId === card.id;

              const isSubscribed = activeSubscriptions.some(
                (s) => s.creator_id === card.id && (s.tier === 'vip' || s.tier === 'master')
              );

              const mediaList = cardsMedia[card.id] || [];
              const activeIdx = activeMediaIndex[card.id] ?? 0;
              const activeMedia = mediaList[activeIdx];
              const displayUrl = activeMedia ? activeMedia.media_url : (card.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&q=80');

              const isCurrentlyLocked = activeMedia && !isMediaUnlocked(activeMedia, gaugeLevel, isSubscribed);
              const requiredLevelObj = activeMedia ? RELATIONSHIP_LEVELS_METADATA.find(l => l.key === activeMedia.required_level) : null;
              const reqLabel = activeMedia?.required_level === 'subscriber' ? 'Subscription' : (requiredLevelObj?.name || 'Higher Level');
              const lockedCount = mediaList.filter(m => !isMediaUnlocked(m, gaugeLevel, isSubscribed)).length;

              return (
                <motion.div
                  key={card.id}
                  className={`absolute w-full h-full rounded-3xl overflow-hidden border transition-shadow duration-500 bg-[#111] ${isTop ? tierConfig.glow : 'border-white/10'}`}
                  style={{
                    x: isTop ? x : 0,
                    rotate: isTop ? rotate : 0,
                    opacity: isTop ? opacity : 1,
                    scale: isTop ? 1 : 0.95 + (index * 0.01),
                    zIndex: cards.length - index
                  }}
                  drag={isTop && !isBreakdownOpen ? 'x' : false} // Disable dragging if breakdown HUD is open
                  dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                  onDragEnd={handleDragEnd}
                  whileDrag={{ scale: 1.02 }}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ x: x.get() > 0 ? 300 : -300, opacity: 0 }}
                >
                  {/* Top indicators */}
                  {mediaList.length > 1 && (
                    <div className="absolute top-3 inset-x-4 z-20 flex gap-1 pointer-events-none">
                      {mediaList.map((_, i) => (
                        <div 
                          key={i} 
                          className={`h-1 flex-1 rounded-full transition-all duration-300 ${i === activeIdx ? 'bg-primary' : 'bg-white/30'}`}
                        />
                      ))}
                    </div>
                  )}

                  {/* Left-float locked media badge */}
                  {lockedCount > 0 && (
                    <div className="absolute top-4 left-4 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-[#dc143c]/30 bg-black/75 backdrop-blur-md text-[8px] font-black uppercase tracking-widest text-[#dc143c] shadow-lg">
                      <Lock className="w-2.5 h-2.5 text-[#dc143c]" />
                      <span>{lockedCount}+ LOCKED MEDIA</span>
                    </div>
                  )}

                  <div className="relative w-full h-full select-none">
                    {activeMedia?.media_type === 'video' ? (
                      <div className="w-full h-full relative flex items-center justify-center">
                        <BlurredFaceImage
                          sharedScore={gaugeLevel === 1 ? 2 : gaugeLevel === 2 ? 10 : gaugeLevel === 3 ? 20 : 35}
                          isEnabledByOwner={card.face_blur_active !== false}
                          faceCoordinates={activeMedia?.face_coordinates || card.avatar_face_coordinates}
                          className="w-full h-full"
                        >
                          <video 
                            src={activeMedia.media_url} 
                            className={`w-full h-full object-cover pointer-events-none transition-all duration-500 ${isCurrentlyLocked ? 'blur-[30px] scale-110' : ''}`} 
                            autoPlay 
                            loop 
                            muted 
                            playsInline 
                          />
                        </BlurredFaceImage>
                      </div>
                    ) : (
                      <BlurredFaceImage
                        src={displayUrl}
                        alt={card.display_name || card.username}
                        sharedScore={gaugeLevel === 1 ? 2 : gaugeLevel === 2 ? 10 : gaugeLevel === 3 ? 20 : 35}
                        isEnabledByOwner={card.face_blur_active !== false}
                        faceCoordinates={activeMedia?.face_coordinates || card.avatar_face_coordinates}
                        className="w-full h-full"
                        imgClassName={`transition-all duration-500 ${isCurrentlyLocked ? 'blur-[30px] scale-110' : ''}`}
                      />
                    )}

                    {isCurrentlyLocked && (
                      <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center p-6 text-center z-10">
                        <div className="p-3.5 rounded-full bg-red-950/20 border border-[#dc143c]/30 backdrop-blur-md shadow-[0_0_20px_rgba(220,20,60,0.2)] mb-3 animate-pulse">
                          <Lock className="w-6 h-6 text-[#dc143c]" />
                        </div>
                        <h4 className="text-xs font-black uppercase tracking-wider text-white">Private Album Item</h4>
                        <p className="text-[9px] text-white/50 font-bold uppercase tracking-widest mt-1">
                          {activeMedia.required_level === 'subscriber' 
                            ? 'Subscribe to reveal' 
                            : `Reach ${reqLabel} to reveal`}
                        </p>
                        <span className="text-[8px] text-primary font-black uppercase tracking-[0.2em] mt-5 bg-primary/10 border border-primary/20 px-2.5 py-1 rounded-full animate-bounce">
                          ⚡ Swipe Right to unlock
                        </span>
                      </div>
                    )}

                    {/* Invisible story click zones */}
                    {mediaList.length > 1 && !isBreakdownOpen && (
                      <div className="absolute inset-0 z-10 flex pointer-events-auto">
                        <div 
                          className="w-1/2 h-[75%] cursor-w-resize" 
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMediaIndex(prev => ({
                              ...prev,
                              [card.id]: Math.max(0, activeIdx - 1)
                            }));
                          }}
                        />
                        <div 
                          className="w-1/2 h-[75%] cursor-e-resize" 
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMediaIndex(prev => ({
                              ...prev,
                              [card.id]: Math.min(mediaList.length - 1, activeIdx + 1)
                            }));
                          }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Compatibility Float Badge */}
                  <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5">
                    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border bg-black/75 backdrop-blur-md text-[10px] font-black uppercase tracking-widest bg-gradient-to-r ${tierConfig.gradient}`}>
                      <span>{tierConfig.emoji}</span>
                      <span>{matchResult.totalScore}% MATCH</span>
                    </div>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveBreakdownCardId(isBreakdownOpen ? null : card.id);
                      }}
                      className="p-1.5 bg-black/60 hover:bg-black/90 backdrop-blur-md rounded-full border border-white/10 text-white/70 hover:text-white transition"
                    >
                      {isBreakdownOpen ? <X className="w-3.5 h-3.5" /> : <Info className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  
                  {/* Card Info Overlay */}
                  <div className="absolute bottom-0 w-full p-6 bg-gradient-to-t from-black/95 via-black/60 to-transparent">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                      {card.display_name || card.username}
                      {card.is_kyc_verified && <Sparkles className="w-5 h-5 text-[#ffa500]" />}
                    </h2>
                    
                    {/* Archetype Badge */}
                    {mappedCandidate.archetype && (
                      <div className="mt-1 flex">
                        <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 bg-white/10 text-white/70 border border-white/10 rounded">
                          Archetype: {mappedCandidate.archetype}
                        </span>
                      </div>
                    )}

                    {/* Prompts Section */}
                    <div className="mt-3 space-y-2 max-h-[140px] overflow-y-auto pr-1 select-text">
                      {card.bio_prompt_question && card.bio_prompt_answer && (() => {
                        const isLocked1 = isPromptAnswerLockedForViewer(card, 'bio_prompt_answer', gaugeLevel);
                        const reqLevelName1 = getRequiredLevelName(card, 'bio_prompt_answer');
                        return (
                          <div className="p-2.5 rounded-xl bg-black/40 border border-white/10 backdrop-blur-sm text-left">
                            <p className="text-[9px] font-black uppercase tracking-wider text-primary mb-1">
                              Prompt 1: {card.bio_prompt_question}
                            </p>
                            {isLocked1 ? (
                              <div className="relative overflow-hidden rounded-lg p-2 bg-black/50 border border-white/5 flex items-center justify-center min-h-[40px]">
                                <div className="absolute inset-0 bg-white/5 backdrop-blur-md z-0" />
                                <div className="relative z-10 flex flex-col items-center gap-1 text-center">
                                  <Lock className="w-3 h-3 text-[#dc143c]" />
                                  <span className="text-[9px] font-black uppercase tracking-widest text-[#dc143c]">
                                    {reqLevelName1 || 'Higher Level'} required
                                  </span>
                                </div>
                              </div>
                            ) : (
                              <p className="text-white/95 text-xs leading-relaxed">
                                "{card.bio_prompt_answer}"
                              </p>
                            )}
                          </div>
                        );
                      })()}

                      {card.bio_prompt_question_2 && card.bio_prompt_answer_2 && (() => {
                        const isLocked2 = isPromptAnswerLockedForViewer(card, 'bio_prompt_answer_2', gaugeLevel);
                        const reqLevelName2 = getRequiredLevelName(card, 'bio_prompt_answer_2');
                        return (
                          <div className="hidden sm:block p-2.5 rounded-xl bg-black/40 border border-white/10 backdrop-blur-sm text-left">
                            <p className="text-[9px] font-black uppercase tracking-wider text-primary mb-1">
                              Prompt 2: {card.bio_prompt_question_2}
                            </p>
                            {isLocked2 ? (
                              <div className="relative overflow-hidden rounded-lg p-2 bg-black/50 border border-white/5 flex items-center justify-center min-h-[40px]">
                                <div className="absolute inset-0 bg-white/5 backdrop-blur-md z-0" />
                                <div className="relative z-10 flex flex-col items-center gap-1 text-center">
                                  <Lock className="w-3 h-3 text-[#dc143c]" />
                                  <span className="text-[9px] font-black uppercase tracking-widest text-[#dc143c]">
                                    {reqLevelName2 || 'Higher Level'} required
                                  </span>
                                </div>
                              </div>
                            ) : (
                              <p className="text-white/95 text-xs leading-relaxed">
                                "{card.bio_prompt_answer_2}"
                              </p>
                            )}
                          </div>
                        );
                      })()}

                      {!card.bio_prompt_question && !card.bio_prompt_question_2 && (
                        <p className="text-white/80 text-sm text-left">{card.bio || "No bio yet."}</p>
                      )}
                    </div>

                    {/* Hidden Info Badge if applicable */}
                    {card.privacy_settings?.hidden_values && Object.keys(card.privacy_settings.hidden_values).length > 0 && (
                      <div className="mt-2.5 flex items-center gap-1.5 px-3 py-1 bg-[#dc143c]/15 border border-[#dc143c]/25 rounded-full w-fit">
                        <Lock className="w-3 h-3 text-[#dc143c]" />
                        <span className="text-[8px] font-black uppercase tracking-widest text-[#dc143c]">
                          {Object.values(card.privacy_settings.hidden_values).reduce((acc: number, field: any) => acc + Object.keys(field).length, 0)}+ Hidden Info
                        </span>
                      </div>
                    )}

                    {card.hobbies && card.hobbies.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-3">
                        {card.hobbies.slice(0, 3).map((hobby: string, i: number) => (
                          <span key={i} className="text-[10px] bg-white/10 text-white/80 px-2 py-0.5 rounded-full font-medium">
                            {hobby}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Slide-Up Match Compatibility HUD Breakdown Overlay */}
                  <AnimatePresence>
                    {isBreakdownOpen && (
                      <motion.div
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 220 }}
                        className="absolute inset-x-0 bottom-0 top-16 bg-black/95 backdrop-blur-2xl border-t border-white/10 p-5 z-30 flex flex-col justify-between text-left"
                      >
                        {/* Scrollable Upper Section */}
                        <div className="flex-1 overflow-y-auto pr-1 mb-3">
                          <div className="flex justify-between items-center border-b border-white/10 pb-3 mb-3">
                            <div>
                              <h3 className="text-sm font-black uppercase tracking-widest text-white">
                                Compatibility HUD
                              </h3>
                              <p className="text-[9px] font-black text-primary uppercase tracking-widest mt-0.5">
                                Tracker: {matchResult.compatibilityTier.replace('_', ' ')}
                              </p>
                            </div>
                            <span className="text-2xl font-black text-primary">
                              {matchResult.totalScore}%
                            </span>
                          </div>

                          {/* Blocker alert if blocked */}
                          {matchResult.compatibilityTier === 'blocked' && (
                            <div className="flex items-center gap-2 p-2 bg-red-950/20 border border-red-500/20 rounded-xl mb-3 text-red-400">
                              <ShieldAlert className="w-4.5 h-4.5 shrink-0" />
                              <span className="text-[9px] font-black uppercase tracking-wider truncate">
                                Blocker: {matchResult.hardBlockerHit}
                              </span>
                            </div>
                          )}

                          {/* 6 Signals Breakdown list */}
                          <div className="grid grid-cols-2 gap-3">
                            {SIGNALS_METADATA.map(sig => {
                              const scoreVal = matchResult.breakdown[sig.key] || 0;
                              return (
                                <div key={sig.key} className="bg-white/2 border border-white/5 p-2 rounded-xl">
                                  <div className="flex items-center justify-between text-[8px] font-black uppercase tracking-widest mb-1.5 text-white/60">
                                    <span className="flex items-center gap-1.5">
                                      <sig.icon className={`w-3 h-3 ${sig.color}`} />
                                      {sig.label}
                                    </span>
                                    <span className="text-white">{Math.round(scoreVal * 100)}%</span>
                                  </div>
                                  <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                                    <div 
                                      className="h-full bg-primary" 
                                      style={{ width: `${scoreVal * 100}%` }}
                                    />
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          {/* Profile Bio & Insights Section */}
                          <div className="border-t border-white/10 pt-4 mt-4 space-y-3">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-white/50">
                              Profile Bio & Insights
                            </h4>
                            
                            {card.bio && (
                              <div className="p-2.5 rounded-xl bg-white/2 border border-white/5">
                                <p className="text-[9px] font-black uppercase tracking-wider text-muted-foreground mb-1">Bio</p>
                                <p className="text-white text-xs leading-relaxed">{card.bio}</p>
                              </div>
                            )}

                            {card.bio_prompt_question && card.bio_prompt_answer && (() => {
                              const isLocked1 = isPromptAnswerLockedForViewer(card, 'bio_prompt_answer', gaugeLevel);
                              const reqLevelName1 = getRequiredLevelName(card, 'bio_prompt_answer');
                              return (
                                <div className="p-2.5 rounded-xl bg-white/2 border border-white/5">
                                  <p className="text-[9px] font-black uppercase tracking-wider text-primary mb-1">
                                    Q: {card.bio_prompt_question}
                                  </p>
                                  {isLocked1 ? (
                                    <div className="flex items-center gap-1.5 mt-1">
                                      <Lock className="w-3 h-3 text-[#dc143c]" />
                                      <span className="text-[9px] font-black uppercase tracking-widest text-[#dc143c]">
                                        Locked ({reqLevelName1 || 'Higher Level'} required)
                                      </span>
                                    </div>
                                  ) : (
                                    <p className="text-white text-xs leading-relaxed">
                                      "{card.bio_prompt_answer}"
                                    </p>
                                  )}
                                </div>
                              );
                            })()}

                            {card.bio_prompt_question_2 && card.bio_prompt_answer_2 && (() => {
                              const isLocked2 = isPromptAnswerLockedForViewer(card, 'bio_prompt_answer_2', gaugeLevel);
                              const reqLevelName2 = getRequiredLevelName(card, 'bio_prompt_answer_2');
                              return (
                                <div className="p-2.5 rounded-xl bg-white/2 border border-white/5">
                                  <p className="text-[9px] font-black uppercase tracking-wider text-primary mb-1">
                                    Q: {card.bio_prompt_question_2}
                                  </p>
                                  {isLocked2 ? (
                                    <div className="flex items-center gap-1.5 mt-1">
                                      <Lock className="w-3 h-3 text-[#dc143c]" />
                                      <span className="text-[9px] font-black uppercase tracking-widest text-[#dc143c]">
                                        Locked ({reqLevelName2 || 'Higher Level'} required)
                                      </span>
                                    </div>
                                  ) : (
                                    <p className="text-white text-xs leading-relaxed">
                                      "{card.bio_prompt_answer_2}"
                                    </p>
                                  )}
                                </div>
                              );
                            })()}

                            {card.hobbies && card.hobbies.length > 0 && (
                              <div className="p-2.5 rounded-xl bg-white/2 border border-white/5">
                                <p className="text-[9px] font-black uppercase tracking-wider text-muted-foreground mb-1.5">Hobbies</p>
                                <div className="flex flex-wrap gap-1">
                                  {card.hobbies.map((hobby: string, i: number) => (
                                    <span key={i} className="text-[9px] bg-white/10 text-white/80 px-2 py-0.5 rounded-full font-medium">
                                      {hobby}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Chemistry description/tierReason */}
                        <div className="border-t border-white/10 pt-3 shrink-0">
                          <p className="text-[10px] text-white/60 font-medium leading-relaxed">
                            {matchResult.tierReason}
                          </p>
                          <button 
                            onClick={() => setActiveBreakdownCardId(null)}
                            className="w-full mt-4 py-2 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition"
                          >
                            Close HUD
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center text-muted-foreground h-full text-center p-6">
              <Sparkles className="w-12 h-12 mb-4 opacity-50 text-primary" />
              <p className="font-bold text-white mb-2">No more profiles nearby</p>
              <p className="text-xs text-white/60">Come back later or adjust your preference.</p>
            </div>
          )}
        </AnimatePresence>

        {/* Floating Interaction Icons (Bouncy Animations) */}
        <AnimatePresence>
          {showInteraction === 'heart' && (
            <motion.div
              initial={{ scale: 0, y: 50, opacity: 0 }}
              animate={{ scale: 1.5, y: -100, opacity: 1 }}
              exit={{ scale: 2, opacity: 0 }}
              className="absolute z-50 text-primary pointer-events-none drop-shadow-2xl"
            >
              <Heart className="w-32 h-32 fill-primary" />
            </motion.div>
          )}
          {showInteraction === 'broken_heart' && (
            <motion.div
              initial={{ scale: 0, y: 50, opacity: 0 }}
              animate={{ scale: 1.5, y: -100, opacity: 1 }}
              exit={{ scale: 2, opacity: 0 }}
              className="absolute z-50 text-red-500 pointer-events-none drop-shadow-2xl"
            >
              <X className="w-32 h-32 text-red-500 stroke-[3]" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Manual Swipe Buttons */}
      <div className="w-full flex justify-center gap-6 mt-3 md:mt-6 shrink-0">
        <motion.button 
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => handleSwipe('left')}
          disabled={cards.length === 0}
          className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/40 flex items-center justify-center text-red-500 hover:bg-red-500/20 transition disabled:opacity-30 shadow-[0_0_15px_rgba(239,68,68,0.2)]"
        >
          <X className="w-6 h-6 stroke-[3]" />
        </motion.button>
        
        <motion.button 
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsModalOpen(true)}
          className="w-16 h-16 rounded-full bg-accent/20 border border-accent flex items-center justify-center text-accent shadow-[0_0_15px_rgba(255,0,127,0.5)] transition"
        >
          <Brain className="w-7 h-7" />
        </motion.button>

        <motion.button 
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => handleSwipe('right')}
          disabled={cards.length === 0}
          className="w-14 h-14 rounded-full bg-primary/20 border border-primary flex items-center justify-center text-primary shadow-[0_0_15px_rgba(138,43,226,0.5)] transition disabled:opacity-30"
        >
          <Heart className="w-6 h-6 fill-primary" />
        </motion.button>
      </div>

      <SuggestionMovesModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        gaugeLevel={gaugeLevel}
        isKycVerified={isKycVerified}
        userId={currentUser?.id}
        userRole={currentUser?.role || 'member'}
        onSelectMove={async (moveId, label) => {
          console.log('Selected move from swiper screen:', moveId, label);
        }}
        onKycSuccess={() => setIsKycVerified(true)}
      />

      {/* Cinematic "It's a Match!" Overlay Screen */}
      <AnimatePresence>
        {matchData && (() => {
          const candProfile = mapDbProfileToEngine(matchData);
          const scoreVal = calculateMatch(currentUserProfile, candProfile);
          
          return (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onMouseMove={handleMouseMove}
              className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/95 p-6 backdrop-blur-md overflow-hidden"
            >
              {/* Laser button border trace style definition */}
              <style dangerouslySetInnerHTML={{__html: `
                @keyframes border-trace {
                  0%, 100% { clip-path: inset(0 0 95% 0); }
                  25% { clip-path: inset(0 95% 0 0); }
                  50% { clip-path: inset(95% 0 0 0); }
                  75% { clip-path: inset(0 0 0 95%); }
                }
                .laser-btn::before {
                  content: '';
                  position: absolute;
                  inset: 0;
                  border: 2px solid #ff007f;
                  border-radius: inherit;
                  animation: border-trace 4s linear infinite;
                  pointer-events: none;
                  filter: drop-shadow(0 0 8px #ff007f);
                }
              `}} />

              {/* constellation backdrop canvas */}
              <canvas ref={canvasRef} className="absolute inset-0 z-0 pointer-events-none" />

              {/* Concentric Expanding Shockwave Rings */}
              <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none">
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0.4, opacity: 0.8 }}
                    animate={{ scale: 2.6, opacity: 0 }}
                    transition={{ 
                      duration: 2.8, 
                      delay: i * 0.9, 
                      repeat: Infinity, 
                      ease: "easeOut" 
                    }}
                    className="absolute w-72 h-72 border-2 border-primary/30 rounded-full blur-[2px] shadow-[0_0_20px_rgba(255,0,127,0.1)]"
                  />
                ))}
              </div>

              {/* Reveal Body */}
              <motion.div
                initial={{ scale: 0.9, y: 50 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 50 }}
                className="relative z-10 text-center flex flex-col items-center max-w-sm w-full"
              >
                <div className="flex gap-2 items-center text-glow-accent mb-4 text-xs font-black uppercase tracking-widest text-[#ff007f] animate-pulse">
                  <Sparkles className="w-4.5 h-4.5" />
                  Connection Decrypted
                </div>
                
                <h1 className="text-5xl font-black text-glow tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white via-primary to-accent mb-10 uppercase">
                  IT'S A MATCH!
                </h1>

                {/* 3D Flip Profile Cards */}
                <div className="flex items-center justify-center gap-10 mb-12 relative">
                  
                  {/* Left Card: User */}
                  <div className="w-36 h-48 [perspective:1000px]">
                    <motion.div 
                      initial={{ rotateY: 0 }}
                      animate={{ rotateY: 180 }}
                      transition={{ duration: 1.3, delay: 0.8, ease: "easeInOut" }}
                      className="relative w-full h-full [transform-style:preserve-3d]"
                    >
                      {/* Front Shroud */}
                      <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] bg-black/40 border border-primary/30 rounded-2xl flex flex-col items-center justify-center backdrop-blur-md shadow-[0_0_15px_rgba(255,0,127,0.1)]">
                        <Lock className="w-7 h-7 text-primary animate-pulse mb-2" />
                        <span className="text-[7px] font-black uppercase tracking-widest text-primary">Locking</span>
                      </div>
                      {/* Back Avatar */}
                      <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] rounded-2xl overflow-hidden border-2 border-primary shadow-2xl">
                        <img 
                          src={currentUserProfile.origins ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&q=80' : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&q=80'} 
                          className="w-full h-full object-cover" 
                          alt="Your profile"
                        />
                        <div className="absolute inset-x-0 bottom-0 bg-black/70 p-2 text-left">
                          <p className="text-[9px] font-black uppercase text-white truncate">You</p>
                          <span className="text-[7px] font-black uppercase text-primary tracking-wider block mt-0.5">
                            {currentUserProfile.archetype}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  </div>

                  {/* Pulsing center chemistry hub */}
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 1.6, type: "spring", stiffness: 260, damping: 15 }}
                    className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black border border-white/20 flex flex-col items-center justify-center text-primary shadow-xl z-20"
                  >
                    <Heart className="w-5 h-5 fill-primary text-primary animate-ping absolute" />
                    <Heart className="w-5 h-5 fill-primary text-primary relative z-10" />
                  </motion.div>

                  {/* Right Card: Candidate */}
                  <div className="w-36 h-48 [perspective:1000px]">
                    <motion.div 
                      initial={{ rotateY: 0 }}
                      animate={{ rotateY: 180 }}
                      transition={{ duration: 1.3, delay: 0.9, ease: "easeInOut" }}
                      className="relative w-full h-full [transform-style:preserve-3d]"
                    >
                      {/* Front Shroud */}
                      <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] bg-black/40 border border-accent/30 rounded-2xl flex flex-col items-center justify-center backdrop-blur-md shadow-[0_0_15px_rgba(0,240,255,0.1)]">
                        <Lock className="w-7 h-7 text-accent animate-pulse mb-2" />
                        <span className="text-[7px] font-black uppercase tracking-widest text-accent">Locking</span>
                      </div>
                      {/* Back Avatar */}
                      <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] rounded-2xl overflow-hidden border-2 border-accent shadow-2xl">
                        <img 
                          src={matchData.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&q=80'} 
                          className="w-full h-full object-cover" 
                          alt="Matched profile"
                        />
                        <div className="absolute inset-x-0 bottom-0 bg-black/70 p-2 text-left">
                          <p className="text-[9px] font-black uppercase text-white truncate">
                            {matchData.display_name || matchData.username}
                          </p>
                          <span className="text-[7px] font-black uppercase text-accent tracking-wider block mt-0.5">
                            {candProfile.archetype}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  </div>

                </div>

                {/* Score & chemistry feedback */}
                <motion.div 
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.9 }}
                  className="mb-10 px-4 py-3 bg-white/2 border border-white/5 rounded-2xl"
                >
                  <p className="text-[10px] font-black uppercase tracking-[0.25em] text-primary">
                    {scoreVal.totalScore}% Compatibility Synergy
                  </p>
                  <p className="text-[9px] text-white/50 uppercase font-black tracking-wider leading-relaxed mt-1.5 max-w-[280px]">
                    {scoreVal.tierReason}
                  </p>
                </motion.div>

                {/* CTAs */}
                <div className="w-full flex flex-col gap-3.5 relative z-20">
                  <button
                    onClick={() => {
                      setMatchData(null);
                      router.push('/messages');
                    }}
                    className="laser-btn w-full py-4 rounded-3xl bg-primary text-primary-foreground font-black text-xs tracking-[0.2em] uppercase shadow-[0_15px_30px_rgba(255,0,127,0.3)] hover:brightness-115 active:scale-95 transition relative overflow-hidden"
                  >
                    Send a Message
                  </button>
                  <button
                    onClick={() => setMatchData(null)}
                    className="w-full py-4 rounded-3xl bg-white/5 border border-white/10 text-white/50 font-black text-[10px] tracking-widest uppercase hover:bg-white/10 active:scale-95 transition"
                  >
                    Keep Exploring
                  </button>
                </div>

              </motion.div>
            </motion.div>
          );
        })()}
      </AnimatePresence>
    </div>
  );
}
