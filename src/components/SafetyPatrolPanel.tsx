'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  CheckCircle2,
  XCircle,
  Clock,
  Lock,
  Eye,
  Filter,
  ChevronRight,
  ChevronDown,
  User,
  AlertTriangle,
  ListFilter,
  Layers,
  BadgeCheck,
  Loader2,
  RefreshCw,
  FileText,
  Image as ImageIcon,
  Video as VideoIcon,
  Info,
} from 'lucide-react';

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
interface CoPerformer {
  name: string;
  avatar?: string;
  status: 'pending' | 'approved';
  type: 'registered' | 'external';
}

interface PendingPost {
  id: string;
  title: string;
  description?: string;
  media_url?: string;
  media_type?: 'image' | 'video';
  tier?: string;
  created_at: string;
  creator_profile?: {
    username?: string;
    avatar_url?: string;
  };
}

interface SafetyPatrolPanelProps {
  allPendingPosts: PendingPost[];
  isModerating: string | null;
  onModerate: (postId: string, action: 'approved' | 'rejected') => Promise<void>;
  onRefresh?: () => void;
}

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
function parseCoPerformers(description?: string): { cleanDesc: string; coPerformers: CoPerformer[] } {
  const parts = description?.split('\n\n===CO_PERFORMERS===\n');
  const cleanDesc = parts?.[0] || description || '';
  let coPerformers: CoPerformer[] = [];
  try {
    if (parts?.[1]) coPerformers = JSON.parse(parts[1]);
  } catch {}
  return { cleanDesc, coPerformers };
}

type FilterMode = 'all' | 'consent_hold' | 'clean';

// ─────────────────────────────────────────────
// Stat Card
// ─────────────────────────────────────────────
function StatCard({ label, value, icon: Icon, color, sub }: {
  label: string; value: string | number; icon: any; color: string; sub?: string;
}) {
  return (
    <div className="p-4 bg-white/[0.025] border border-white/5 rounded-2xl space-y-1.5">
      <div className={`flex items-center gap-1.5 ${color}`}>
        <Icon className="w-3.5 h-3.5" />
        <span className="text-[8px] font-black uppercase tracking-widest">{label}</span>
      </div>
      <p className="text-2xl font-black text-white leading-none">{value}</p>
      {sub && <p className="text-[8px] text-white/30 font-bold uppercase tracking-widest">{sub}</p>}
    </div>
  );
}

// ─────────────────────────────────────────────
// Media Thumbnail
// ─────────────────────────────────────────────
function MediaThumbnail({ post }: { post: PendingPost }) {
  return (
    <div className="aspect-video w-full rounded-xl overflow-hidden border border-white/5 bg-white/5 relative flex items-center justify-center">
      {post.media_url ? (
        post.media_type === 'video' ? (
          <video src={post.media_url} className="w-full h-full object-cover" controls />
        ) : (
          <img src={post.media_url} alt={post.title} className="w-full h-full object-cover" />
        )
      ) : (
        <div className="flex flex-col items-center gap-2 text-white/20">
          {post.media_type === 'video'
            ? <VideoIcon className="w-8 h-8" />
            : <ImageIcon className="w-8 h-8" />
          }
          <span className="text-[8px] font-black uppercase tracking-widest">No preview</span>
        </div>
      )}
      {/* Overlay media type badge */}
      <span className="absolute top-2 left-2 px-2 py-0.5 bg-black/70 border border-white/10 text-[7px] font-black uppercase tracking-widest text-white/70 rounded-md flex items-center gap-1">
        {post.media_type === 'video' ? <VideoIcon className="w-2.5 h-2.5" /> : <ImageIcon className="w-2.5 h-2.5" />}
        {post.media_type || 'media'}
      </span>
    </div>
  );
}

// ─────────────────────────────────────────────
// Consent Gate Row
// ─────────────────────────────────────────────
function ConsentGateRow({ coPerformers }: { coPerformers: CoPerformer[] }) {
  const hasPending = coPerformers.some(p => p.status === 'pending');
  return (
    <div className={`p-3 rounded-xl border space-y-2 ${hasPending ? 'bg-amber-500/5 border-amber-500/20' : 'bg-emerald-500/5 border-emerald-500/15'}`}>
      <div className="flex items-center justify-between">
        <span className="text-[7px] font-black uppercase tracking-widest text-white/40 flex items-center gap-1">
          <Lock className="w-2.5 h-2.5" /> Co-Performer Consent Gate
        </span>
        <span className={`text-[7px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded ${hasPending ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
          {hasPending ? 'Hold Active' : 'All Cleared'}
        </span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {coPerformers.map((p, i) => (
          <div key={i} className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[8px] font-bold border ${
            p.status === 'approved'
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
              : 'bg-amber-500/10 text-amber-400 border-amber-500/20 animate-pulse'
          }`}>
            {p.avatar
              ? <img src={p.avatar} className="w-3.5 h-3.5 rounded-full object-cover" alt="" />
              : <User className="w-3 h-3" />
            }
            <span>{p.name}</span>
            <BadgeCheck className={`w-3 h-3 ${p.status === 'approved' ? 'opacity-100' : 'opacity-30'}`} />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Post Detail Panel (right side)
// ─────────────────────────────────────────────
function PostDetailPanel({ post, isModerating, onModerate }: {
  post: PendingPost;
  isModerating: string | null;
  onModerate: (postId: string, action: 'approved' | 'rejected') => Promise<void>;
}) {
  const { cleanDesc, coPerformers } = parseCoPerformers(post.description);
  const hasPendingConsent = coPerformers.some(p => p.status === 'pending');
  const processing = isModerating === post.id;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="p-4 bg-white/[0.025] border border-white/5 rounded-2xl space-y-3">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-full overflow-hidden border border-white/10 shrink-0">
            <img
              src={post.creator_profile?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80'}
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-black text-white">@{post.creator_profile?.username || 'unknown'}</p>
            <p className="text-[8px] text-white/30 font-mono">Creator · Identity Attested</p>
          </div>
          {post.tier && (
            <span className="px-2 py-0.5 bg-purple-500/10 text-purple-400 border border-purple-500/20 text-[8px] font-black uppercase tracking-wider rounded shrink-0">
              {post.tier}
            </span>
          )}
        </div>
        <div>
          <h3 className="font-black text-sm text-white leading-snug mb-1">{post.title}</h3>
          {cleanDesc && <p className="text-[11px] text-white/60 leading-relaxed">{cleanDesc}</p>}
          <p className="text-[8px] text-white/25 font-mono mt-1.5">Submitted: {new Date(post.created_at).toLocaleString()}</p>
        </div>
      </div>

      {/* Media */}
      <MediaThumbnail post={post} />

      {/* Co-Performer Gate */}
      {coPerformers.length > 0 && (
        <ConsentGateRow coPerformers={coPerformers} />
      )}

      {/* Consent hold warning */}
      {hasPendingConsent && (
        <div className="flex items-start gap-2.5 p-3.5 bg-red-950/20 border border-red-500/25 rounded-xl text-red-400">
          <ShieldAlert className="w-4.5 h-4.5 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="text-[9px] font-black uppercase tracking-wider">Consent Gate Hold Active</p>
            <p className="text-[9px] text-red-300/70 leading-snug">
              Release is blocked until all tagged co-performers grant digital consent. Approving now is disabled.
            </p>
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="grid grid-cols-2 gap-3 pt-1">
        <button
          onClick={() => onModerate(post.id, 'rejected')}
          disabled={processing}
          className="py-3 bg-red-500/15 hover:bg-red-500/25 text-red-400 border border-red-500/25 rounded-xl text-[9px] font-black uppercase tracking-wider transition disabled:opacity-50 flex items-center justify-center gap-1.5"
        >
          {processing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ShieldX className="w-3.5 h-3.5" />}
          Reject & Quarantine
        </button>
        <button
          onClick={() => onModerate(post.id, 'approved')}
          disabled={processing || hasPendingConsent}
          title={hasPendingConsent ? 'Gated: Awaiting performer consent' : undefined}
          className="py-3 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 rounded-xl text-[9px] font-black uppercase tracking-wider transition disabled:opacity-50 flex items-center justify-center gap-1.5"
        >
          {processing
            ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
            : hasPendingConsent
              ? <Lock className="w-3.5 h-3.5 text-amber-400" />
              : <ShieldCheck className="w-3.5 h-3.5" />
          }
          Approve & Release
        </button>
      </div>

      {/* DSA compliance note */}
      <div className="flex items-start gap-2 p-3 bg-white/[0.02] border border-white/5 rounded-xl">
        <Info className="w-3.5 h-3.5 text-white/20 shrink-0 mt-0.5" />
        <p className="text-[8px] text-white/25 leading-snug">
          Every approval is logged with timestamps and consent receipts so the legal stuff stays airtight — you don't have to think about it.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Post List Item (left panel)
// ─────────────────────────────────────────────
function PostListItem({ post, isSelected, onClick }: {
  post: PendingPost;
  isSelected: boolean;
  onClick: () => void;
}) {
  const { coPerformers } = parseCoPerformers(post.description);
  const hasPendingConsent = coPerformers.some(p => p.status === 'pending');

  return (
    <motion.button
      layout
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -8 }}
      onClick={onClick}
      className={`w-full text-left p-3.5 rounded-2xl border transition-all duration-200 relative overflow-hidden group ${
        isSelected
          ? 'border-primary/30 bg-primary/5'
          : 'border-white/5 bg-white/[0.015] hover:bg-white/[0.035] hover:border-white/10'
      }`}
    >
      {/* Left accent */}
      <div className={`absolute left-0 top-3 bottom-3 w-0.5 rounded-full ${isSelected ? 'bg-primary' : hasPendingConsent ? 'bg-amber-400 opacity-70' : 'bg-white/10'}`} />

      <div className="pl-3 space-y-2">
        <div className="flex items-start gap-2">
          <div className="w-7 h-7 rounded-full overflow-hidden border border-white/10 shrink-0">
            <img
              src={post.creator_profile?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=60&q=80'}
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-black text-white truncate leading-tight">@{post.creator_profile?.username || 'unknown'}</p>
            <p className="text-[9px] font-semibold text-white/70 truncate mt-0.5 leading-snug">{post.title}</p>
          </div>
          {hasPendingConsent && (
            <span className="shrink-0 flex items-center gap-1 px-1.5 py-0.5 bg-amber-400/10 border border-amber-400/20 rounded text-[7px] font-black text-amber-400 uppercase">
              <Lock className="w-2 h-2" /> Hold
            </span>
          )}
        </div>

        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            {post.tier && (
              <span className="px-1.5 py-0.5 bg-purple-500/10 text-purple-400 border border-purple-500/15 text-[7px] font-black uppercase tracking-wider rounded">
                {post.tier}
              </span>
            )}
            <span className="text-[7px] text-white/25 font-mono">
              {new Date(post.created_at).toLocaleDateString()}
            </span>
          </div>
          {coPerformers.length > 0 && (
            <span className="text-[7px] text-white/30 font-bold flex items-center gap-0.5">
              <User className="w-2.5 h-2.5" /> {coPerformers.length}
            </span>
          )}
        </div>
      </div>

      {isSelected && (
        <ChevronRight className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-primary/60" />
      )}
    </motion.button>
  );
}

// ─────────────────────────────────────────────
// Main Panel
// ─────────────────────────────────────────────
export default function SafetyPatrolPanel({
  allPendingPosts,
  isModerating,
  onModerate,
  onRefresh,
}: SafetyPatrolPanelProps) {
  const [selectedPostId, setSelectedPostId] = useState<string | null>(allPendingPosts[0]?.id ?? null);
  const [filterMode, setFilterMode] = useState<FilterMode>('all');

  // Update selection when posts change
  const selectedPost = allPendingPosts.find(p => p.id === selectedPostId) ?? null;

  // Stats
  const totalPending = allPendingPosts.length;
  const consentHolds = allPendingPosts.filter(p => {
    const { coPerformers } = parseCoPerformers(p.description);
    return coPerformers.some(c => c.status === 'pending');
  }).length;
  const readyToApprove = totalPending - consentHolds;

  // Filtered list
  const filteredPosts = useMemo(() => {
    if (filterMode === 'all') return allPendingPosts;
    if (filterMode === 'consent_hold') {
      return allPendingPosts.filter(p => {
        const { coPerformers } = parseCoPerformers(p.description);
        return coPerformers.some(c => c.status === 'pending');
      });
    }
    return allPendingPosts.filter(p => {
      const { coPerformers } = parseCoPerformers(p.description);
      return !coPerformers.some(c => c.status === 'pending');
    });
  }, [allPendingPosts, filterMode]);

  // ── Empty state ──────────────────────────────
  if (allPendingPosts.length === 0) {
    return (
      <div className="space-y-5">
        {/* Stats bar — all zero */}
        <div className="grid grid-cols-3 gap-3">
          <StatCard label="Pending Review" value={0} icon={Clock} color="text-cyan-400" />
          <StatCard label="Consent Holds" value={0} icon={Lock} color="text-amber-400" />
          <StatCard label="Ready to Approve" value={0} icon={ShieldCheck} color="text-emerald-400" />
        </div>

        <div className="py-24 text-center bg-white/[0.015] border border-dashed border-white/8 rounded-3xl space-y-4 flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <ShieldCheck className="w-8 h-8 text-emerald-400" />
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-white/50">Moderation Desk Clear</p>
            <p className="text-[10px] text-white/25 mt-1 max-w-xs mx-auto">
              Nothing in your review queue right now — drop new content in the Content tab and it'll show up here.
            </p>
          </div>
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="flex items-center gap-1.5 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest transition"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Refresh Queue
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* ── Stats bar ──────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Pending Review"    value={totalPending}    icon={Clock}       color="text-cyan-400"    sub="in queue" />
        <StatCard label="Consent Holds"     value={consentHolds}    icon={Lock}        color="text-amber-400"   sub="gated" />
        <StatCard label="Ready to Approve"  value={readyToApprove}  icon={ShieldCheck} color="text-emerald-400" sub="no blocks" />
        <StatCard label="DSA Layer"         value="L3"              icon={Layers}      color="text-purple-400"  sub="compliance desk" />
      </div>

      {/* ── Toolbar ────────────────────────────── */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        {/* Filter pills */}
        <div className="flex gap-1.5 flex-wrap">
          {([
            { id: 'all',          label: `All (${totalPending})`,       color: 'text-white',        activeBg: 'bg-white/15 border-white/20' },
            { id: 'consent_hold', label: `Consent Holds (${consentHolds})`, color: 'text-amber-400',   activeBg: 'bg-amber-500/15 border-amber-500/30' },
            { id: 'clean',        label: `Ready (${readyToApprove})`,   color: 'text-emerald-400',  activeBg: 'bg-emerald-500/15 border-emerald-500/30' },
          ] as { id: FilterMode; label: string; color: string; activeBg: string }[]).map(f => (
            <button
              key={f.id}
              onClick={() => setFilterMode(f.id)}
              className={`px-3 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest border transition ${
                filterMode === f.id
                  ? `${f.color} ${f.activeBg}`
                  : 'text-white/30 border-white/5 hover:border-white/15 hover:text-white/60'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {onRefresh && (
          <button
            onClick={onRefresh}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest transition"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
        )}
      </div>

      {/* ── Master–Detail layout ────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 items-start">

        {/* LEFT: Queue list */}
        <div className="lg:col-span-2 space-y-2 max-h-[68vh] overflow-y-auto scrollbar-hide pr-1">
          <AnimatePresence mode="popLayout">
            {filteredPosts.length > 0 ? (
              filteredPosts.map(post => (
                <PostListItem
                  key={post.id}
                  post={post}
                  isSelected={selectedPostId === post.id}
                  onClick={() => setSelectedPostId(post.id)}
                />
              ))
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-32 flex flex-col items-center justify-center gap-2 border-2 border-dashed border-white/5 rounded-2xl"
              >
                <Shield className="w-6 h-6 text-white/15" />
                <p className="text-[8px] uppercase tracking-widest font-black text-white/20">No items in this filter</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* RIGHT: Detail panel */}
        <div className="lg:col-span-3">
          <AnimatePresence mode="wait">
            {selectedPost ? (
              <motion.div
                key={selectedPost.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.16 }}
                className="bg-white/[0.02] border border-white/5 rounded-3xl p-5 max-h-[68vh] overflow-y-auto scrollbar-hide"
              >
                <PostDetailPanel
                  post={selectedPost}
                  isModerating={isModerating}
                  onModerate={onModerate}
                />
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-48 flex flex-col items-center justify-center gap-3 bg-white/[0.01] border border-white/5 rounded-3xl"
              >
                <Shield className="w-7 h-7 text-white/15" />
                <p className="text-[9px] uppercase tracking-widest font-black text-white/20">Select a submission to review</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}
