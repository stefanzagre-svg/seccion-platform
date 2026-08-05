'use client';

import { useState, useEffect } from 'react';
import { X, MessageSquare, ShieldCheck, Heart, Trophy, MapPin, Zap, Ban, Flag, Phone, Loader2, Video, Image as ImageIcon, Briefcase, GraduationCap, Moon, BookOpen, Sparkles, Globe, Lock, Users } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import BlurredFaceImage from '@/components/BlurredFaceImage';
import { scoreToLevel, RELATIONSHIP_LEVELS } from '@/lib/relationship-engine';
import { calculateMatchProbability } from '@/lib/match-engine';
import { getRelationshipState } from '@/lib/relationship-db';
import Link from 'next/link';
import ReportModal from '@/components/modals/ReportModal';

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
  const [isBlocking, setIsBlocking] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportModalContentId, setReportModalContentId] = useState('');
  const [callRequestStatus, setCallRequestStatus] = useState<'none'|'pending'|'awaiting_payment'|'paid'>('none');
  const [callRequestId, setCallRequestId] = useState<string>('');
  const [isRequestingCall, setIsRequestingCall] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState<number>(5);
  
  const handleBlock = async () => {
    if (!currentUserId || !profileId) return;
    const confirmBlock = window.confirm('Are you sure you want to block this user? They will no longer be able to see you or contact you.');
    if (!confirmBlock) return;
    
    setIsBlocking(true);
    try {
      await supabase.from('blocked_users').insert({
        blocker_id: currentUserId,
        blocked_id: profileId,
        reason: 'User triggered block from ProfileDetailsModal'
      });
      alert('User blocked successfully.');
      onClose();
    } catch (err) {
      console.error('Failed to block user', err);
      alert('Failed to block user.');
    } finally {
      setIsBlocking(false);
    }
  };

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

        // 1.5 Fetch profile media
        const { data: media } = await supabase
          .from('profile_media')
          .select('*')
          .eq('profile_id', profileId)
          .order('display_order', { ascending: true });

        if (prof) {
          prof.album_media = media || [];
          setProfile(prof);
        }

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

          // Check if there is an existing call request
          const { data: reqData } = await supabase
            .from('call_requests')
            .select('id, status')
            .eq('member_id', actualUserId)
            .eq('creator_id', profileId)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();
            
          if (reqData) {
            setCallRequestStatus(reqData.status);
            setCallRequestId(reqData.id);
          }
        }
      } catch (err) {
        console.error('Error loading profile modal details:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [profileId, currentUserId]);

  const calculatePrice = (duration: number) => {
    if (!profile) return 0;
    const baseRate = profile.privacy_settings?.private_call_rate || 10;
    let price = baseRate * duration;
    if (duration === 15) price = price * 0.85; // 15% discount
    if (duration === 30) price = price * 0.80; // 20% discount
    return Math.round(price * 100) / 100;
  };

  const handleRequestCall = async () => {
    if (!currentUserId) return;
    setIsRequestingCall(true);
    try {
      const proposedTime = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // Default tomorrow
      const fee = calculatePrice(selectedDuration);

      const { data, error } = await supabase.from('call_requests').insert({
        member_id: currentUserId,
        creator_id: profileId,
        proposed_time: proposedTime,
        duration_minutes: selectedDuration,
        fee_amount: fee,
        status: 'pending'
      }).select('id').single();

      if (error) throw error;
      setCallRequestId(data.id);
      setCallRequestStatus('pending');
      alert(`Call requested! The creator will be notified.`);
    } catch (err) {
      console.error(err);
      alert('Failed to request call');
    } finally {
      setIsRequestingCall(false);
    }
  };

  const handlePayForCall = async () => {
    setIsRequestingCall(true);
    try {
      const amount = calculatePrice(selectedDuration);
      
      const resp = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscriberId: currentUserId,
          creatorId: profileId,
          price: amount,
          type: 'private_call',
          callId: callRequestId,
          duration: selectedDuration
        })
      });
      const data = await resp.json();
      if (data.url) {
        window.open(data.url, '_blank');
      } else {
        alert('Failed to generate checkout link');
      }
    } catch (err) {
      console.error(err);
      alert('Error during checkout');
    } finally {
      setIsRequestingCall(false);
    }
  };

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
  const viewerScore = relationship?.gauge_score ?? 0;
  
  const hiddenValues = profile.privacy_settings?.hidden_values || {};
  const getHiddenCount = (fieldKey: string) => {
    if (!hiddenValues[fieldKey]) return 0;
    let count = 0;
    for (const val in hiddenValues[fieldKey]) {
      const requiredLevelKey = hiddenValues[fieldKey][val];
      const requiredLevel = RELATIONSHIP_LEVELS.find(l => l.key === requiredLevelKey);
      if (requiredLevel && viewerScore < requiredLevel.minScore) {
        count++;
      }
    }
    return count;
  };
  
  const isItemHidden = (fieldKey: string, itemValue: string) => {
    if (!hiddenValues[fieldKey]?.[itemValue]) return false;
    const requiredLevelKey = hiddenValues[fieldKey][itemValue];
    const requiredLevel = RELATIONSHIP_LEVELS.find(l => l.key === requiredLevelKey);
    return requiredLevel && viewerScore < requiredLevel.minScore;
  };

  const renderHiddenBadge = (count: number) => {
    if (count === 0) return null;
    const label = count === 1 ? "Hidden" : `Hidden +${count}`;
    return (
      <div className="flex items-center gap-1.5 text-[10px] font-bold text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2.5 py-1 rounded-xl">
        <Lock className="w-3 h-3" /> {label}
      </div>
    );
  };
  
  const displayAge = profile.privacy_settings?.display_age || "18+";
  const languages = profile.spoken_languages && profile.spoken_languages.length > 0
    ? profile.spoken_languages
    : ["English"];

  const mediaItems = profile.album_media && profile.album_media.length > 0 
    ? profile.album_media 
    : (profile.album_photos || []).map((url: string) => ({ media_type: "image", media_url: url }));

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
          
          {/* Top Actions: Block and Report */}
          <div className="absolute top-16 right-8 flex flex-col gap-2 z-10">
            <button 
              onClick={() => {
                setReportModalContentId(profileId);
                setIsReportModalOpen(true);
              }}
              className="p-2 bg-white/5 hover:bg-[#dc143c]/20 border border-white/10 hover:border-[#dc143c]/50 rounded-full text-white/40 hover:text-[#dc143c] transition group relative"
            >
              <Flag className="w-4 h-4" />
              <span className="absolute right-10 top-1/2 -translate-y-1/2 px-2 py-1 bg-black/80 text-[10px] uppercase font-bold tracking-widest text-white rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none">Report</span>
            </button>
            <button 
              onClick={handleBlock}
              disabled={isBlocking}
              className="p-2 bg-white/5 hover:bg-[#dc143c]/20 border border-white/10 hover:border-[#dc143c]/50 rounded-full text-white/40 hover:text-[#dc143c] transition group relative disabled:opacity-50"
            >
              <Ban className="w-4 h-4" />
              <span className="absolute right-10 top-1/2 -translate-y-1/2 px-2 py-1 bg-black/80 text-[10px] uppercase font-bold tracking-widest text-white rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none">Block</span>
            </button>
          </div>
          {/* Identity Row */}
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-2xl overflow-hidden border border-[#00fbfb]/30 shadow-[0_0_15px_rgba(0,251,251,0.2)] shrink-0 relative">
              <BlurredFaceImage
                src={profile.avatar_url}
                alt={profile.username}
                sharedScore={relationship?.gauge_score ?? 0}
                isEnabledByOwner={profile.face_blur_active || false}
                faceCoordinates={profile.avatar_face_coordinates}
                className="w-full h-full object-cover"
              />
            </div>
            
            <div className="min-w-0 space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-black tracking-tight text-white">{profile.display_name || `@${profile.username}`}</h2>
                {profile.is_kyc_verified && (
                  <span className="p-0.5 bg-green-500/10 rounded border border-green-500/20 text-green-400" title="Verified">
                    <ShieldCheck className="w-4 h-4" />
                  </span>
                )}
                <span className="text-xs font-bold text-[#00fbfb] bg-[#00fbfb]/10 border border-[#00fbfb]/30 px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0">
                  <ShieldCheck className="w-3 h-3" /> {displayAge}
                </span>
                <span className="text-[10px] font-black uppercase tracking-wider bg-white/5 px-2.5 py-1 rounded-full text-white/50 border border-white/10">
                  {profile.role}
                </span>
              </div>
              
              <p className="text-xs text-white/50 font-mono">@{profile.username}</p>

              {profile.core_passion && (
                <div className="pt-1 flex items-center gap-2">
                  <span className="text-[10px] bg-primary/10 text-primary border border-primary/30 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider inline-block">
                    🔥 {profile.core_passion}
                  </span>
                  {renderHiddenBadge(getHiddenCount("core_passion"))}
                </div>
              )}
            </div>
          </div>
          
          <div className="max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar space-y-6">

            {/* PUBLIC ALBUM (PRIORITIZED AT TOP) */}
            {mediaItems.length > 0 && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/70 flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-[#00fbfb]" /> Media Album ({mediaItems.length})
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {mediaItems.map((media: any, i: number) => (
                    <div key={i} className="aspect-square rounded-2xl overflow-hidden border border-white/10 bg-black/40 relative group">
                      {media.media_type === "video" ? (
                        <>
                          <Video className="w-5 h-5 text-white/50 absolute top-2 right-2 z-10" />
                          <video 
                            src={media.video_start_time != null && media.video_end_time != null ? `${media.media_url}#t=${media.video_start_time},${media.video_end_time}` : media.media_url} 
                            className="w-full h-full object-cover" 
                            muted 
                            loop 
                            autoPlay 
                            playsInline 
                          />
                        </>
                      ) : (
                        <img src={media.media_url || media.url} alt={`Album ${i+1}`} className="w-full h-full object-cover" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Compatibility Match stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-primary/5 border border-primary/20 rounded-2xl flex items-center gap-3">
                <Zap className="w-6 h-6 text-primary animate-pulse shrink-0" />
                <div>
                  <p className="text-[8px] font-black text-white/40 uppercase tracking-widest">Vibe Score</p>
                  <p className="text-lg font-black text-primary">{matchScore}% Chemistry</p>
                </div>
              </div>

              <div className="p-4 bg-accent/5 border border-accent/20 rounded-2xl flex items-center gap-3">
                <Heart className="w-6 h-6 text-accent fill-current shrink-0" />
                <div>
                  <p className="text-[8px] font-black text-white/40 uppercase tracking-widest">Relationship Status</p>
                  <p className="text-xs font-black text-accent">{levelObj.label}</p>
                </div>
              </div>
            </div>

            {/* CORE IDENTITY SECTION */}
            <div className="space-y-4 pt-2">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-[#00fbfb] flex items-center gap-2 border-b border-white/10 pb-2">
                Core Identity
              </h3>

              {/* Bio & Basic Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {profile.bio && (
                  <div className="md:col-span-2 p-4 rounded-2xl bg-white/5 border border-white/10">
                    <span className="text-[10px] font-black uppercase text-white/50 tracking-wider flex items-center gap-1.5 mb-2">
                      <BookOpen className="w-3 h-3" /> Biography
                    </span>
                    <div className="flex items-start justify-between gap-4">
                      {!isItemHidden("bio", profile.bio) && (
                        <p className="text-xs text-white/80 leading-relaxed italic border-l-2 border-primary/50 pl-3">"{profile.bio}"</p>
                      )}
                      {renderHiddenBadge(getHiddenCount("bio"))}
                    </div>
                  </div>
                )}

                {profile.education_level && (
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                    <span className="text-[10px] font-black uppercase text-white/50 tracking-wider flex items-center gap-1.5">
                      <GraduationCap className="w-3 h-3 text-[#00fbfb]" /> Education
                    </span>
                    <div className="flex items-center justify-between gap-2">
                      {!isItemHidden("education_level", profile.education_level) && (
                        <span className="text-xs font-semibold text-white/90">{profile.education_level}</span>
                      )}
                      {renderHiddenBadge(getHiddenCount("education_level"))}
                    </div>
                  </div>
                )}

                {profile.career && (
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                    <span className="text-[10px] font-black uppercase text-white/50 tracking-wider flex items-center gap-1.5">
                      <Briefcase className="w-3 h-3 text-[#00fbfb]" /> Career / Passion
                    </span>
                    <div className="flex items-center justify-between gap-2">
                      {!isItemHidden("career", profile.career) && (
                        <span className="text-xs font-semibold text-white/90">{profile.career}</span>
                      )}
                      {renderHiddenBadge(getHiddenCount("career"))}
                    </div>
                  </div>
                )}
              </div>

              {/* Spoken Languages */}
              {languages.length > 0 && (
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                  <span className="text-[10px] font-black uppercase text-white/50 tracking-wider flex items-center gap-1.5">
                    <Globe className="w-3 h-3 text-[#00fbfb]" /> Languages
                  </span>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {languages.filter((l: string) => !isItemHidden("spoken_languages", l)).map((lang: string, idx: number) => (
                      <span key={idx} className="text-xs bg-white/10 text-white px-3 py-1 rounded-full font-medium">
                        {idx === 0 ? `🗣️ ${lang}` : `🌐 ${lang}`}
                      </span>
                    ))}
                    {renderHiddenBadge(getHiddenCount("spoken_languages"))}
                  </div>
                </div>
              )}
            </div>

            {/* RELATIONAL INSIGHTS SECTION */}
            <div className="space-y-4 pt-4">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2 border-b border-white/10 pb-2">
                Relational Insights
              </h3>

              {/* Astro Sign */}
              {profile.astro_sign && (
                <div className="p-4 rounded-2xl bg-[#7c3aed]/10 border border-[#7c3aed]/30 flex flex-col justify-center">
                  <div className="flex items-center justify-between gap-2">
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-black uppercase tracking-widest text-[#7c3aed] flex items-center gap-1.5">
                        <Moon className="w-3 h-3" /> Astro Sign
                      </span>
                      {!isItemHidden("astro_sign", profile.astro_sign) && (
                        <h4 className="text-sm font-extrabold text-white">{profile.astro_sign}</h4>
                      )}
                    </div>
                    {renderHiddenBadge(getHiddenCount("astro_sign"))}
                  </div>
                </div>
              )}

              {/* {translate("profile.connection_desires", "Connection Desires")} */}
              {((profile.relationship_goals && profile.relationship_goals.length > 0) || 
                (profile.relationship_types && profile.relationship_types.length > 0) || 
                (profile.sexual_preferences && profile.sexual_preferences.length > 0) || 
                profile.lifestyle_habits?.family_goals) && (
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-4">
                  <span className="text-[10px] font-black uppercase text-white/50 tracking-wider flex items-center gap-1.5 border-b border-white/5 pb-2">
                    <Heart className="w-3 h-3 text-primary" /> Connection Desires
                  </span>

                  {profile.relationship_goals && profile.relationship_goals.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="text-[9px] font-black uppercase text-white/40">Looking For</span>
                      <div className="flex flex-wrap items-center gap-1.5">
                        {profile.relationship_goals.filter((g: string) => !isItemHidden("relationship_goals", g)).map((goal: string, i: number) => (
                          <span key={i} className="text-[10px] bg-white/10 text-white px-2 py-1 rounded-md font-bold uppercase tracking-wider">
                            {goal}
                          </span>
                        ))}
                        {renderHiddenBadge(getHiddenCount("relationship_goals"))}
                      </div>
                    </div>
                  )}

                  {profile.relationship_types && profile.relationship_types.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="text-[9px] font-black uppercase text-primary/70">Relationship Type</span>
                      <div className="flex flex-wrap items-center gap-1.5">
                        {profile.relationship_types.filter((t: string) => !isItemHidden("relationship_types", t)).map((type: string, i: number) => (
                          <span key={i} className="text-[10px] bg-primary/10 text-primary border border-primary/20 px-2 py-1 rounded-md font-bold uppercase tracking-wider">
                            {type}
                          </span>
                        ))}
                        {renderHiddenBadge(getHiddenCount("relationship_types"))}
                      </div>
                    </div>
                  )}

                  {profile.sexual_preferences && profile.sexual_preferences.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="text-[9px] font-black uppercase text-[#ff00ff]/70">{translate("profile.preferences", "Preferences")}</span>
                      <div className="flex flex-wrap items-center gap-1.5">
                        {profile.sexual_preferences.filter((p: string) => !isItemHidden("sexual_preferences", p)).map((pref: string, i: number) => (
                          <span key={i} className="text-[10px] bg-[#ff00ff]/10 text-[#ff00ff] border border-[#ff00ff]/20 px-2 py-1 rounded-md font-bold uppercase tracking-wider">
                            {pref}
                          </span>
                        ))}
                        {renderHiddenBadge(getHiddenCount("sexual_preferences"))}
                      </div>
                    </div>
                  )}

                  {profile.lifestyle_habits?.family_goals && (
                    <div className="space-y-1.5">
                      <span className="text-[9px] font-black uppercase text-emerald-400/70">Family Goals</span>
                      <div className="flex items-center gap-2">
                        {!isItemHidden("family_goals", profile.lifestyle_habits.family_goals) && (
                          <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-1 rounded-md font-bold uppercase tracking-wider">
                            {profile.lifestyle_habits.family_goals}
                          </span>
                        )}
                        {renderHiddenBadge(getHiddenCount("family_goals"))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Hobbies & Habits */}
              {((profile.hobbies && profile.hobbies.length > 0) || (profile.lifestyle_habits?.habits && profile.lifestyle_habits.habits.length > 0)) && (
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-4">
                  <span className="text-[10px] font-black uppercase text-white/50 tracking-wider flex items-center gap-1.5 border-b border-white/5 pb-2">
                    <Users className="w-3 h-3 text-[#00fbfb]" /> Lifestyle
                  </span>

                  {profile.hobbies && profile.hobbies.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-[9px] font-black uppercase text-white/40">Hobbies & Passions</span>
                      <div className="flex flex-wrap items-center gap-1.5">
                        {profile.hobbies.filter((h: string) => !isItemHidden("hobbies", h)).map((h: string, i: number) => (
                          <span key={i} className="text-[10px] bg-white/10 text-white/90 px-2.5 py-1 rounded-full font-medium">
                            ⚡ {h}
                          </span>
                        ))}
                        {renderHiddenBadge(getHiddenCount("hobbies"))}
                      </div>
                    </div>
                  )}

                  {profile.lifestyle_habits?.habits && profile.lifestyle_habits.habits.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-[9px] font-black uppercase text-white/40">Habits</span>
                      <div className="flex flex-wrap items-center gap-1.5">
                        {profile.lifestyle_habits.habits.filter((h: string) => !isItemHidden("habits", h)).map((h: string, i: number) => (
                          <span key={i} className="text-[10px] border border-white/20 text-white/70 px-2.5 py-1 rounded-full font-medium">
                            {h}
                          </span>
                        ))}
                        {renderHiddenBadge(getHiddenCount("habits"))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* {translate("profile.relational_prompts", "Relational Prompts")} */}
              {(profile.bio_prompt_answer || profile.bio_prompt_answer_2) && (
                <div className="space-y-3 pt-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" /> Prompt Answers
                  </span>
                  
                  {profile.bio_prompt_answer && (
                    <div className="p-4 rounded-2xl bg-black/40 border border-primary/20 space-y-1.5">
                      <p className="text-[10px] font-bold text-primary uppercase tracking-widest">
                        {profile.bio_prompt_question || "What is your dream first date?"}
                      </p>
                      <div className="flex items-center gap-2">
                        {!isItemHidden("bio_prompt_answer", profile.bio_prompt_answer) && (
                          <p className="text-sm text-white leading-relaxed italic">
                            "{profile.bio_prompt_answer}"
                          </p>
                        )}
                        {renderHiddenBadge(getHiddenCount("bio_prompt_answer"))}
                      </div>
                    </div>
                  )}

                  {profile.bio_prompt_answer_2 && (
                    <div className="p-4 rounded-2xl bg-black/40 border border-[#ff00ff]/20 space-y-1.5">
                      <p className="text-[10px] font-bold text-[#ff00ff] uppercase tracking-widest">
                        {profile.bio_prompt_question_2 || "What is your biggest green flag?"}
                      </p>
                      <div className="flex items-center gap-2">
                        {!isItemHidden("bio_prompt_answer_2", profile.bio_prompt_answer_2) && (
                          <p className="text-sm text-white leading-relaxed italic">
                            "{profile.bio_prompt_answer_2}"
                          </p>
                        )}
                        {renderHiddenBadge(getHiddenCount("bio_prompt_answer_2"))}
                      </div>
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>

          {/* Quick DMs / Action Row */}
          {profile.role === 'creator' && callRequestStatus === 'none' && (
            <div className="flex gap-2 justify-center mb-2">
               {[5, 15, 30].map(dur => (
                 <button
                   key={dur}
                   onClick={() => setSelectedDuration(dur)}
                   className={`relative px-3 py-1 rounded text-xs font-bold transition ${selectedDuration === dur ? 'bg-primary text-black' : 'bg-white/5 text-white hover:bg-white/10'}`}
                 >
                   {dur} min
                   {dur === 15 && <span className="absolute -top-2 -right-2 bg-[#ff00ff] text-white text-[8px] px-1 py-0.5 rounded-sm shadow">15%</span>}
                   {dur === 30 && <span className="absolute -top-2 -right-2 bg-[#ff00ff] text-white text-[8px] px-1 py-0.5 rounded-sm shadow">20%</span>}
                 </button>
               ))}
               <div className="flex items-center ml-2 text-xs font-bold text-white/50">
                 Cost: ${calculatePrice(selectedDuration)}
               </div>
            </div>
          )}
          <div className="pt-4 border-t border-white/5 flex flex-wrap gap-2">
            <Link 
              href={`/messages?id=${profile.id}`}
              className="flex-grow py-3 bg-primary text-black font-black uppercase tracking-wider text-xs rounded-xl hover:shadow-[0_0_20px_rgba(102,252,241,0.4)] transition flex items-center justify-center gap-2"
            >
              <MessageSquare className="w-4 h-4 fill-current" /> DM
            </Link>

            {profile.role === 'creator' && (
              <>
                {callRequestStatus === 'awaiting_payment' ? (
                  <button 
                    onClick={handlePayForCall}
                    className="flex-grow py-3 font-black uppercase tracking-wider text-xs rounded-xl transition flex items-center justify-center gap-2 bg-green-500/20 text-green-400 border border-green-500/50 hover:bg-green-500/40"
                  >
                    <Zap className="w-4 h-4" /> Pay & Unlock
                  </button>
                ) : callRequestStatus === 'paid' ? (
                  <Link 
                    href={`/live/call_${callRequestId}`}
                    target="_blank"
                    className="flex-grow py-3 font-black uppercase tracking-wider text-xs rounded-xl transition flex items-center justify-center gap-2 bg-[#00fbfb]/20 text-[#00fbfb] border border-[#00fbfb]/50 hover:bg-[#00fbfb]/40"
                  >
                    <Video className="w-4 h-4" /> Join Call
                  </Link>
                ) : (
                  <button 
                    onClick={handleRequestCall}
                    disabled={isRequestingCall || callRequestStatus === 'pending'}
                    className={`flex-grow py-3 font-black uppercase tracking-wider text-xs rounded-xl transition flex items-center justify-center gap-2 ${
                      callRequestStatus === 'pending' 
                        ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50 cursor-not-allowed'
                        : 'bg-[#00fbfb]/20 text-[#00fbfb] border border-[#00fbfb]/50 hover:bg-[#00fbfb]/40'
                    }`}
                  >
                    {isRequestingCall ? <Loader2 className="w-4 h-4 animate-spin" /> : <Phone className="w-4 h-4" />}
                    {callRequestStatus === 'pending' ? 'Pending' : `Request Call`}
                  </button>
                )}
              </>
            )}

            <button 
              onClick={onClose}
              className="px-4 py-3 bg-white/5 hover:bg-white/10 text-white font-black uppercase tracking-wider text-xs rounded-xl transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        contentId={reportModalContentId}
        contentType="profile"
      />
    </div>
  );
}
