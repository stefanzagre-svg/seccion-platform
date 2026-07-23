'use client';

import React, { useState } from 'react';
import { Send, X, ShieldAlert, Sparkles, CheckCircle2, MessageSquare } from 'lucide-react';

interface AdminSendMessageModalProps {
  isOpen: boolean;
  targetUser: {
    id: string;
    username: string;
    display_name?: string | null;
    role: string;
  } | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export const AdminSendMessageModal: React.FC<AdminSendMessageModalProps> = ({
  isOpen,
  targetUser,
  onClose,
  onSuccess,
}) => {
  const [subject, setSubject] = useState('Welcome to SECCIØN!');
  const [messageText, setMessageText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen || !targetUser) return null;

  const handleTemplateSelect = (templateType: string) => {
    if (templateType === 'creator_welcome') {
      setSubject('Welcome to SECCIØN Creator Network! 🚀');
      setMessageText(
        `Hi @${targetUser.username},\n\nWelcome to the SECCIØN Creator Community! I'm Stefan, founder of SECCIØN.\n\nWe're thrilled to have you on board. Make sure to complete your profile in the Studio (/studio) and select your Specialization Badge to start receiving member requests.\n\nIf you have any questions or need custom payout assistance, reply to this message directly!\n\nBest,\nStefan (Founder)`
      );
    } else if (templateType === 'member_welcome') {
      setSubject('Welcome to SECCIØN! 🔮');
      setMessageText(
        `Hi @${targetUser.username},\n\nWelcome to SECCIØN! Your account is active and ready to explore.\n\nTake your Onboarding Quest to define your Archetype, and check out the Vibe Radar (/vibe-radar) to connect with specialized creators and matches.\n\nEnjoy the platform!\n\nBest,\nSECCIØN Team`
      );
    } else if (templateType === 'kyc_checkin') {
      setSubject('Verification Check-In 🛡️');
      setMessageText(
        `Hi @${targetUser.username},\n\nWe noticed you haven't completed your Liveness Verification yet. Verifying your account unlocks Level 4+ Date Plans and grants higher visibility on the Vibe Radar.\n\nLet us know if you need any assistance!`
      );
    }
  };

  const handleSendMessage = async () => {
    if (!messageText.trim()) {
      setError('Please enter a message text before sending.');
      return;
    }

    setIsSending(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch('/api/admin/users/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetUserId: targetUser.id,
          subject,
          messageText,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Failed to deliver message');
      }

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
        if (onSuccess) onSuccess();
      }, 1500);

    } catch (err: any) {
      console.error('Send message error:', err);
      setError(err.message || 'An error occurred while sending message');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#0c1017] border border-cyan-500/30 rounded-2xl p-6 shadow-2xl shadow-cyan-500/10 space-y-5">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-cyan-500/15 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-mono tracking-tight flex items-center gap-2">
                Send Direct Message
              </h3>
              <p className="text-xs text-white/50">
                Target: <span className="text-cyan-400 font-bold">@{targetUser.username}</span> ({targetUser.role})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Message Templates */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-mono text-white/60 uppercase tracking-wider block">
            ⚡ Quick Templates:
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleTemplateSelect(targetUser.role === 'creator' ? 'creator_welcome' : 'member_welcome')}
              className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 hover:border-cyan-400/40 text-[10.5px] font-mono text-cyan-300 transition"
            >
              👋 Welcome Message
            </button>
            <button
              onClick={() => handleTemplateSelect('kyc_checkin')}
              className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 hover:border-amber-400/40 text-[10.5px] font-mono text-amber-300 transition"
            >
              🛡️ KYC Check-In
            </button>
          </div>
        </div>

        {/* Subject Line */}
        <div className="space-y-1.5">
          <label className="text-xs font-mono text-white/70 block">Subject Header:</label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl bg-black/40 border border-white/15 text-xs text-white focus:border-cyan-400 outline-none font-mono"
            placeholder="Subject line..."
          />
        </div>

        {/* Message Body */}
        <div className="space-y-1.5">
          <label className="text-xs font-mono text-white/70 block">Message Body:</label>
          <textarea
            rows={5}
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/15 text-xs text-white focus:border-cyan-400 outline-none font-sans leading-relaxed resize-none"
            placeholder="Write your direct admin message to this user..."
          />
        </div>

        {/* Status Messages */}
        {error && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-300 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Direct message delivered successfully!</span>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-white/10 text-xs font-mono text-white/70 hover:bg-white/5 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSendMessage}
            disabled={isSending}
            className="px-5 py-2 rounded-xl bg-cyan-500 text-black text-xs font-bold font-mono hover:bg-cyan-400 active:scale-95 transition flex items-center gap-2 disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            {isSending ? 'Sending...' : 'Deliver Direct Message'}
          </button>
        </div>

      </div>
    </div>
  );
};
