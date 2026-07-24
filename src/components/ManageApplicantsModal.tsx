'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, UserCheck, UserX, AlertTriangle, ShieldCheck, Heart } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { respondToDatePlanApplication } from '@/lib/date-plan-db';
import { calculateMatch, UserProfile } from '@/lib/match-engine';
import BlurredFaceImage from '@/components/BlurredFaceImage';

interface ManageApplicantsModalProps {
  isOpen: boolean;
  onClose: () => void;
  planId: string;
  applicantIds: string[];
  currentUserProfile: UserProfile;
  posterId: string;
  onActionComplete: () => Promise<void>;
}

export default function ManageApplicantsModal({
  isOpen,
  onClose,
  planId,
  applicantIds,
  currentUserProfile,
  posterId,
  onActionComplete
}: ManageApplicantsModalProps) {
  const [loading, setLoading] = useState(true);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);

  // Fetch profiles of applicants
  useEffect(() => {
    if (!isOpen || applicantIds.length === 0) {
      setProfiles([]);
      setLoading(false);
      return;
    }

    const fetchApplicantProfiles = async () => {
      setLoading(true);
      setModalError(null);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .in('id', applicantIds);

        if (error) throw error;
        setProfiles(data || []);
      } catch (err: any) {
        console.error('Failed to fetch applicant profiles:', err);
        setModalError(err.message || 'Failed to load applicant profiles.');
      } finally {
        setLoading(false);
      }
    };

    fetchApplicantProfiles();
  }, [isOpen, applicantIds]);

  const handleAction = async (applierId: string, status: 'accept' | 'deny') => {
    setProcessingId(applierId);
    setModalError(null);
    try {
      await respondToDatePlanApplication(planId, applierId, status, posterId);
      
      // Update local profiles list state on decline
      if (status === 'deny') {
        setProfiles(prev => prev.filter(p => p.id !== applierId));
      }
      
      // Notify parent to reload plans
      await onActionComplete();
      
      // If we accepted, close the modal immediately since the plan is booked
      if (status === 'accept') {
        onClose();
      }
    } catch (err: any) {
      console.error(`Failed to ${status} applicant:`, err);
      setModalError(err.message || `An error occurred while trying to ${status} the applicant.`);
    } finally {
      setProcessingId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-md bg-[#0a0a0a]/90 border border-white/10 rounded-[2.5rem] p-6 shadow-2xl overflow-hidden z-10 max-h-[85vh] flex flex-col"
        >
          {/* Header */}
          <div className="flex justify-between items-center pb-4 border-b border-white/5 shrink-0">
            <div className="flex items-center gap-2">
              <UserCheck className="text-primary w-5 h-5" />
              <h3 className="text-sm font-black uppercase tracking-widest text-white">
                Manage Applicants
              </h3>
            </div>
            <button 
              onClick={onClose}
              className="p-1.5 rounded-xl bg-white/5 border border-white/10 text-white/50 hover:text-white transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* List Area */}
          <div className="flex-1 overflow-y-auto pr-1 py-4 space-y-4">
            {modalError && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl text-[10px] font-semibold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-primary animate-spin mb-2" />
                <p className="text-[10px] text-white/50 uppercase tracking-wider font-bold">Loading applicants...</p>
              </div>
            ) : profiles.length === 0 ? (
              <div className="text-center py-12 space-y-3">
                <Heart className="w-8 h-8 text-white/20 mx-auto animate-pulse" />
                <p className="text-xs text-white/50 font-medium">No active candidates on your waiting list.</p>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-[8px] text-white/40 uppercase tracking-widest font-black mb-2">Waitlisted Candidates ({profiles.length})</p>
                {profiles.map(profile => {
                  // Calculate match score
                  const matchResult = calculateMatch(currentUserProfile, {
                    gender: profile.sexual_preference === 'Lesbian' || profile.sexual_preference === 'Gay' ? 'female' : 'male',
                    location: profile.origins || '',
                    hobbies: profile.hobbies || [],
                    lifestyle: profile.lifestyle_habits || {},
                    relationshipGoal: profile.relationship_goals?.[0] || 'Long-term',
                    relationshipType: profile.relationship_types?.[0] || 'Monogamous',
                    sexualPreferences: [profile.sexual_preference].filter(Boolean),
                    familyGoals: profile.lifestyle_habits?.family_goals || 'Open to children'
                  });
                  const matchScore = matchResult ? matchResult.totalScore : 0;

                  return (
                    <div 
                      key={profile.id}
                      className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl flex items-center justify-between gap-4 hover:border-white/10 transition duration-300"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/10 overflow-hidden shadow-inner relative shrink-0">
                          <BlurredFaceImage
                            src={profile.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80'}
                            alt={profile.display_name}
                            sharedScore={matchScore}
                            isEnabledByOwner={profile.face_blur_active}
                            faceCoordinates={profile.avatar_face_coordinates}
                            className="w-full h-full"
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="font-black text-xs text-white truncate">@{profile.username}</p>
                          <p className="text-[8px] text-primary font-black uppercase tracking-widest mt-0.5">Match: {matchScore}%</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleAction(profile.id, 'deny')}
                          disabled={processingId !== null}
                          className="p-2.5 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 hover:border-red-500/40 text-red-400 rounded-xl transition duration-300 disabled:opacity-50"
                          title="Decline"
                        >
                          <UserX className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleAction(profile.id, 'accept')}
                          disabled={processingId !== null}
                          className="px-4 py-2.5 bg-primary text-black font-black uppercase text-[9px] tracking-wider rounded-xl hover:shadow-[0_0_15px_rgba(102,252,241,0.4)] transition duration-300 disabled:opacity-50 flex items-center gap-1.5"
                          title="Accept & Book Plan"
                        >
                          {processingId === profile.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <>
                              <UserCheck className="w-3.5 h-3.5" /> Accept
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
