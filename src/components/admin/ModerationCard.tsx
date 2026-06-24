'use client';

import { useState } from 'react';
import { Shield, ShieldAlert, Check, X, AlertTriangle, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ModerationItem {
  id: string;
  content_id: string;
  content_type: string;
  reason: string;
  description: string;
  status: 'pending' | 'under_review' | 'approved' | 'rejected' | 'escalated';
  priority: 'low' | 'normal' | 'high' | 'critical';
  created_at: string;
  reporter?: {
    id: string;
    username: string;
    avatar_url?: string;
  };
  content?: {
    id: string;
    title?: string;
    media_url?: string;
    text_content?: string;
    creator?: {
      username: string;
    };
  };
}

interface ModerationCardProps {
  item: ModerationItem;
  onResolve: (id: string, action: 'approved' | 'rejected' | 'escalated', notes: string) => Promise<void>;
  loading?: boolean;
}

export default function ModerationCard({ item, onResolve, loading = false }: ModerationCardProps) {
  const [notes, setNotes] = useState('');
  const [isRevealed, setIsRevealed] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const handleAction = async (action: 'approved' | 'rejected' | 'escalated') => {
    setActionLoading(action);
    try {
      await onResolve(item.id, action, notes);
      setNotes('');
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  const getPriorityStyles = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-500/10 text-red-400 border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.15)]';
      case 'high':
        return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
      case 'normal':
        return 'bg-primary/10 text-primary border-primary/20';
      default:
        return 'bg-white/5 text-white/50 border-white/10';
    }
  };

  const getReasonLabel = (reason: string) => {
    switch (reason) {
      case 'explicit': return 'Explicit Content';
      case 'illegal': return 'Illegal Activity';
      case 'harassment': return 'Harassment / Abuse';
      case 'spam': return 'Spam / Promo';
      default: return 'Other violation';
    }
  };

  return (
    <div className={cn(
      "glass-card p-6 relative overflow-hidden flex flex-col justify-between transition-all duration-300",
      item.priority === 'critical' ? "border-red-500/30" : "border-white/10"
    )}>
      {/* Background priority ambient glow */}
      {item.priority === 'critical' && (
        <div className="absolute w-[200px] h-[100px] bg-red-500 rounded-full -top-10 -right-10 blur-[80px] opacity-15 pointer-events-none" />
      )}

      <div>
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className={cn(
                "text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border",
                getPriorityStyles(item.priority)
              )}>
                {item.priority}
              </span>
              <span className="text-[10px] text-white/40 font-semibold font-mono">
                {new Date(item.created_at).toLocaleString()}
              </span>
            </div>
            <h3 className="text-sm font-bold text-white mt-1.5 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-orange-400 shrink-0" />
              {getReasonLabel(item.reason)}
            </h3>
          </div>

          <span className="text-[10px] font-black uppercase tracking-widest text-primary/80 font-mono">
            {item.content_type}
          </span>
        </div>

        {/* Content Section */}
        <div className="mb-6 p-4 rounded-xl border border-white/5 bg-white/[0.02]">
          {item.content?.creator && (
            <div className="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-2">
              Creator: <span className="text-white font-mono">@{item.content.creator.username}</span>
            </div>
          )}

          {/* Media Preview (dating blur filter pattern) */}
          {item.content?.media_url && (
            <div className="relative aspect-video rounded-lg overflow-hidden border border-white/10 mb-3 bg-black/40 group/media">
              <img 
                src={item.content.media_url} 
                alt="Flagged media" 
                className={cn(
                  "w-full h-full object-cover transition-all duration-500",
                  !isRevealed && "blur-xl saturate-200 scale-105 select-none pointer-events-none"
                )}
              />
              <button
                onClick={() => setIsRevealed(!isRevealed)}
                className="absolute inset-0 flex items-center justify-center bg-black/40 hover:bg-black/55 transition-colors group-hover/media:opacity-100 opacity-90"
              >
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/20 bg-black/60 text-xs font-semibold text-white">
                  {isRevealed ? (
                    <>
                      <EyeOff className="w-3.5 h-3.5" />
                      <span>Blur Preview</span>
                    </>
                  ) : (
                    <>
                      <Eye className="w-3.5 h-3.5" />
                      <span>Reveal Media (NSFW)</span>
                    </>
                  )}
                </div>
              </button>
            </div>
          )}

          {item.content?.title && (
            <div className="text-xs font-bold text-white mb-1.5">{item.content.title}</div>
          )}

          {item.content?.text_content && (
            <p className="text-xs text-white/70 italic leading-relaxed mb-3">"{item.content.text_content}"</p>
          )}

          <div className="border-t border-white/5 pt-3 mt-3">
            <div className="text-[10px] text-white/40 uppercase tracking-wider font-bold mb-1">
              Reported by: <span className="text-white/60 font-mono">@{item.reporter?.username || 'anonymous'}</span>
            </div>
            {item.description && (
              <p className="text-xs text-white/60 bg-black/20 p-2.5 rounded-lg border border-white/5">
                {item.description}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-4">
        <div>
          <textarea
            placeholder="Add resolution notes..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            disabled={loading || !!actionLoading}
            className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-white/30 outline-none focus:border-primary/50 focus:bg-black/60 transition-all resize-none h-16"
          />
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => handleAction('approved')}
            disabled={loading || !!actionLoading}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-success/15 border border-success/30 text-success hover:bg-success/25 active:scale-[0.98] transition-all text-xs font-bold"
          >
            {actionLoading === 'approved' ? (
              <div className="w-3.5 h-3.5 border-2 border-success border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Check className="w-3.5 h-3.5" />
                Approve
              </>
            )}
          </button>

          <button
            onClick={() => handleAction('rejected')}
            disabled={loading || !!actionLoading}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-destructive/15 border border-destructive/30 text-destructive hover:bg-destructive/25 active:scale-[0.98] transition-all text-xs font-bold"
          >
            {actionLoading === 'rejected' ? (
              <div className="w-3.5 h-3.5 border-2 border-destructive border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <X className="w-3.5 h-3.5" />
                Reject
              </>
            )}
          </button>

          <button
            onClick={() => handleAction('escalated')}
            disabled={loading || !!actionLoading}
            className="px-3 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:border-white/20 active:scale-[0.98] transition-all text-xs font-bold"
            title="Escalate to super_admin"
          >
            {actionLoading === 'escalated' ? (
              <div className="w-3.5 h-3.5 border-2 border-white/60 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Shield className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
