'use client';

import { useState, useEffect } from 'react';
import { X, MessageSquare, ShieldCheck, Heart, Trophy, MapPin, Zap, Ban, Flag, Phone, Loader2, Video } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import BlurredFaceImage from '@/components/BlurredFaceImage';
import { scoreToLevel } from '@/lib/relationship-engine';
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
