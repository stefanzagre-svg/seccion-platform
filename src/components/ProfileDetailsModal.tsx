'use client';

import { useState, useEffect } from 'react';
import { X, MessageSquare, ShieldCheck, Heart, Trophy, MapPin, Zap } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import BlurredFaceImage from '@/components/BlurredFaceImage';
import { scoreToLevel } from '@/lib/relationship-engine';
import { calculateMatchProbability } from '@/lib/match-engine';
import { getRelationshipState } from '@/lib/relationship-db';
import Link from 'next/link';

interface ProfileDetailsModalProps {
  profileId: string;
  onClose: () => void;
  currentUserId?: string;
}

export default function ProfileDetailsModal({ profileId, onClose, currentUserId }: ProfileDetailsModalProps) {
  const [profile, setProfile] = useState<any | null>(null);
  const [relationship, setRelationship] = useState<any | null>(null);
  const [currentUserProfile, setCurrentUserProfile] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        // 1. Fetch target profile
        const { data: prof } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', profileId)
          .single();
        if (prof) setProfile(prof);

        // 2. Fetch current user session
        const actualUserId = currentUserId || (await supabase.auth.getSession()).data.session?.user?.id;
        
        if (actualUserId) {
          // Fetch current user profile
          const { data: currProf } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', actualUserId)
            .single();
          if (currProf) {
            setCurrentUserProfile({
              gender: currProf.sexual_preference === 'Lesbian' || currProf.sexual_preference === 'Gay' ? 'female' : 'male',
              location: currProf.origins || 'Paris, France',
              hobbies: currProf.hobbies || [],
              lifestyle: currProf.lifestyle_habits || {},
              relationshipGoal: currProf.relationship_goals?.[0] || 'Long-term',
              relationshipType: currProf.relationship_types?.[0] || 'Monogamous',
              sexualPreferences: [currProf.sexual_preference].filter(Boolean),
              familyGoals: currProf.lifestyle_habits?.family_goals || 'Open to children'
            });
          }

          // Fetch relationship state
          const relState = await getRelationshipState(actualUserId, profileId);
          if (relState) setRelationship(relState);
        }
      } catch (err) {
        console.error('Error loading profile modal details:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [profileId, currentUserId]);

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!profile) return null;

  // Compute matching score
  const matchScore = currentUserProfile 
    ? calculateMatchProbability(currentUserProfile, {
        gender: profile.sexual_preference === 'Lesbian' || profile.sexual_preference === 'Gay' ? 'female' : 'male',
        location: profile.origins || 'Paris, France',
        hobbies: profile.hobbies || [],
        lifestyle: profile.lifestyle_habits || {},
        relationshipGoal: profile.relationship_goals?.[0] || 'Long-term',
        relationshipType: profile.relationship_types?.[0] || 'Monogamous',
        sexualPreferences: [profile.sexual_preference].filter(Boolean),
        familyGoals: profile.lifestyle_habits?.family_goals || 'Open to children'
      })
    : 75;

  const levelObj = relationship ? scoreToLevel(relationship.gauge_score) : scoreToLevel(0);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="glass-card max-w-lg w-full rounded-[2.5rem] border border-white/10 bg-black/90 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)] overflow-hidden relative text-left">
        {/* Cover Backdrop Blur */}
        <div className="absolute top-0 left-0 w-full h-32 overflow-hidden pointer-events-none">
          <img 
            src={profile.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&q=80'} 
            className="w-full h-full object-cover blur-2xl opacity-30 scale-125"
            alt="Blur background" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
        </div>

        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-white/5 hover:bg-white/10 rounded-full text-white/60 hover:text-white transition z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-8 pt-16 relative space-y-6">
          {/* Identity Row */}
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-3xl overflow-hidden border border-white/15 shadow-xl shrink-0 relative">
              <BlurredFaceImage
                src={profile.avatar_url}
                alt={profile.username}
                sharedScore={relationship?.gauge_score ?? 0}
                isEnabledByOwner={profile.face_blur_active || false}
                faceCoordinates={profile.avatar_face_coordinates}
                className="w-full h-full"
              />
            </div>
            
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-2xl font-black tracking-tight text-white">@{profile.username}</h2>
                {profile.is_kyc_verified && (
                  <span className="p-0.5 bg-green-500/10 rounded border border-green-500/20 text-green-400">
                    <ShieldCheck className="w-4 h-4" />
                  </span>
                )}
                <span className="text-[10px] font-black uppercase tracking-wider bg-white/5 px-2.5 py-1 rounded-md text-white/50">
                  {profile.role}
                </span>
              </div>
              <p className="text-sm text-white/60 mt-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-primary" /> {profile.origins || 'Paris, France'}
              </p>
            </div>
          </div>

          {/* Bio section */}
          {profile.bio && (
            <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
              <p className="text-xs uppercase font-black text-white/40 tracking-wider mb-1.5">Biography</p>
              <p className="text-xs leading-relaxed text-white/80">{profile.bio}</p>
            </div>
          )}

          {/* Compatibility Match stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-primary/5 border border-primary/20 rounded-2xl flex items-center gap-3">
              <Zap className="w-6 h-6 text-primary animate-pulse" />
              <div>
                <p className="text-[8px] font-black text-white/40 uppercase tracking-widest">Vibe Score</p>
                <p className="text-lg font-black text-primary">{matchScore}% Chemistry</p>
              </div>
            </div>

            <div className="p-4 bg-accent/5 border border-accent/20 rounded-2xl flex items-center gap-3">
              <Heart className="w-6 h-6 text-accent fill-current" />
              <div>
                <p className="text-[8px] font-black text-white/40 uppercase tracking-widest">Relationship Status</p>
                <p className="text-xs font-black text-accent">{levelObj.label}</p>
              </div>
            </div>
          </div>

          {/* Lifestyle habits (fully written) */}
          <div className="space-y-3">
            <p className="text-[10px] font-black text-white/40 uppercase tracking-wider flex items-center gap-1.5">
              <Trophy className="w-4 h-4 text-yellow-500" /> Lifestyle & Habits
            </p>
            <div className="grid grid-cols-2 gap-2 max-h-[140px] overflow-y-auto pr-1">
              {Object.entries(profile.lifestyle_habits || {}).map(([key, val]: any) => (
                <div key={key} className="p-2.5 bg-white/[0.01] border border-white/5 rounded-xl text-left flex flex-col justify-center">
                  <span className="text-[8px] font-black uppercase text-white/40 tracking-widest">{key}</span>
                  <span className="text-[10px] font-bold text-white/80 mt-0.5 uppercase tracking-wider">{val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick DMs / Action Row */}
          <div className="pt-4 border-t border-white/5 flex gap-4">
            <Link 
              href={`/messages?id=${profile.id}`}
              className="flex-grow py-3.5 bg-primary text-black font-black uppercase tracking-wider text-xs rounded-2xl hover:shadow-[0_0_20px_rgba(102,252,241,0.4)] transition flex items-center justify-center gap-2"
            >
              <MessageSquare className="w-4 h-4 fill-current" /> Direct Message
            </Link>
            <button 
              onClick={onClose}
              className="px-6 py-3.5 bg-white/5 hover:bg-white/10 text-white font-black uppercase tracking-wider text-xs rounded-2xl transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
