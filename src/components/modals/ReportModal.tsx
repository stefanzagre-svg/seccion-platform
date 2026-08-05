'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, X, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  contentId: string;
  contentType: 'platform_content' | 'profile' | 'message';
}

const REPORT_REASONS = [
  { id: 'explicit', label: 'Explicit or NSFW Content' },
  { id: 'harassment', label: 'Harassment or Bullying' },
  { id: 'spam', label: 'Spam or Scam' },
  { id: 'illegal', label: 'Illegal Activity' },
  { id: 'other', label: 'Dispute over Depiction / Other' }
];

export default function ReportModal({ isOpen, onClose, contentId, contentType }: ReportModalProps) {
  const [reason, setReason] = useState<string>('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason) {
      setError('Please select a reason for reporting.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('You must be logged in to submit a report.');
      }

      const { error: submitError } = await supabase
        .from('reports')
        .insert({
          reported_id: contentType === 'profile' ? contentId : null,
          content_id: contentType !== 'profile' ? contentId : null,
          content_type: contentType,
          reporter_id: user.id,
          reason: reason,
          details: description,
          status: 'pending'
        });

      if (submitError) throw submitError;

      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setReason('');
        setDescription('');
        onClose();
      }, 2500);

    } catch (err: any) {
      console.error('Error submitting report:', err);
      // Handle FK constraint failure explicitly if it complains about platform_content 
      if (err?.code === '23503') {
        // Fallback: If FK constraint prevents reporting profiles, we can still show a generic error or alert the admins.
        setError('Database constraint error: This specific content cannot be reported due to schema limitations. Please contact support.');
      } else {
        setError(err.message || 'An error occurred while submitting your report.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md bg-black border border-[#dc143c]/30 rounded-2xl p-6 shadow-[0_0_40px_rgba(220,20,60,0.15)] overflow-hidden"
          >
            {/* Background glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-[#dc143c]/10 blur-[50px] rounded-full pointer-events-none" />

            {isSuccess ? (
              <div className="flex flex-col items-center justify-center py-8 text-center space-y-4 relative z-10">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-16 h-16 bg-[#00fbfb]/10 rounded-full flex items-center justify-center"
                >
                  <CheckCircle2 className="w-8 h-8 text-[#00fbfb]" />
                </motion.div>
                <h3 className="text-xl font-bold text-white font-['JetBrains_Mono']">Report Submitted</h3>
                <p className="text-sm text-white/60">
                  Thank you for keeping the community safe. Our moderation team will review this shortly.
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-start justify-between mb-6 relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-[#dc143c]/10 rounded-xl border border-[#dc143c]/20">
                      <ShieldAlert className="w-5 h-5 text-[#dc143c]" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-white font-['JetBrains_Mono']">Report Content</h2>
                      <p className="text-xs text-white/50">Your report is anonymous</p>
                    </div>
                  </div>
                  <button 
                    onClick={onClose}
                    className="p-2 hover:bg-white/5 rounded-full transition-colors text-white/50 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {error && (
                  <div className="mb-6 p-3 bg-[#dc143c]/10 border border-[#dc143c]/30 rounded-xl flex items-start gap-2 text-xs text-[#dc143c] relative z-10">
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                    <p>{error}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-white/70 uppercase tracking-wider">Reason for reporting</label>
                    <div className="space-y-2">
                      {REPORT_REASONS.map((r) => (
                        <label 
                          key={r.id} 
                          className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                            reason === r.id 
                              ? 'bg-[#dc143c]/10 border-[#dc143c]/50 text-white' 
                              : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                          }`}
                        >
                          <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            reason === r.id ? 'border-[#dc143c]' : 'border-white/30'
                          }`}>
                            {reason === r.id && <div className="w-2 h-2 rounded-full bg-[#dc143c]" />}
                          </div>
                          <span className="text-sm font-medium">{r.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-white/70 uppercase tracking-wider">Additional details (Optional)</label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Please provide any extra context that will help our moderators..."
                      className="w-full h-24 bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#dc143c]/50 focus:bg-white/10 resize-none transition-all"
                    />
                  </div>

                  <div className="pt-2 flex gap-3">
                    <button
                      type="button"
                      onClick={onClose}
                      className="flex-1 py-3 px-4 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl text-sm font-bold transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting || !reason}
                      className="flex-1 py-3 px-4 bg-[#dc143c] hover:bg-[#ff1a4a] text-white rounded-xl text-sm font-bold shadow-[0_0_15px_rgba(220,20,60,0.4)] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center"
                    >
                      {isSubmitting ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        'Submit Report'
                      )}
                    </button>
                  </div>
                </form>
              </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
