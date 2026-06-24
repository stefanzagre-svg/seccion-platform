'use client';

/**
 * AISuggestionPanel.tsx — FE-UI-001 / FE-UI-002 / UX-001 / UX-002
 *
 * The Intelligence Layer panel — a visually distinct, high-visibility
 * block that renders ranked AI-powered connection suggestions.
 *
 * Aesthetic: Neon Cyan + dark glassmorphism, pulsing ambient glow,
 * animated header, staggered card entrance, scroll-triggered glow.
 *
 * Placement rule (UX-001):
 *   Rendered only when the user has active connections (connectionPoints > 0)
 *   and is viewing the main feed — positioned BEFORE the Match Snapshot section.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { Brain, RefreshCw, Sparkles, ChevronRight, Wifi, WifiOff } from 'lucide-react';
import SuggestionCard from '@/components/SuggestionCard';
import {
  fetchSuggestions,
  PredictionPayload,
  SuggestionResponse,
} from '@/lib/ai-suggestion-service';
import { UserProfile } from '@/lib/match-engine';
import { getQuestState } from '@/lib/quest-service';
import { sendSuggestionMove, updateRelationshipScore } from '@/lib/relationship-db';

const ACTION_LABELS: Record<string, string> = {
  compliment: 'Send a Compliment',
  wave: 'Send a Wave',
  reaction: 'Send a Reaction',
  follow: 'Follow Now',
  playlist: 'Share a Playlist',
};

// ─── Props ────────────────────────────────────────────────────────────────────

interface AISuggestionPanelProps {
  currentUserProfile: UserProfile;
  currentUserId?: string;
  /** Only renders if true (UX-001: connections > 0 check is done upstream) */
  isVisible: boolean;
}

// ─── Loading skeleton ─────────────────────────────────────────────────────────

function SkeletonCard({ index }: { index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: [0.3, 0.6, 0.3] }}
      transition={{ duration: 1.4, repeat: Infinity, delay: index * 0.15 }}
      className="rounded-2xl border border-white/5 bg-white/3 h-40 backdrop-blur-sm"
    />
  );
}

// ─── Animated brain pulse ─────────────────────────────────────────────────────

function BrainPulse() {
  return (
    <div className="relative w-10 h-10 flex-shrink-0">
      {/* Outer ring pulse */}
      <motion.div
        animate={{ scale: [1, 1.6, 1], opacity: [0.4, 0, 0.4] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute inset-0 rounded-full bg-cyan-400/30"
      />
      {/* Mid ring */}
      <motion.div
        animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
        className="absolute inset-0 rounded-full bg-cyan-400/20"
      />
      {/* Core */}
      <div className="relative z-10 w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400/30 to-blue-600/30 border border-cyan-400/40 flex items-center justify-center">
        <Brain className="w-5 h-5 text-cyan-400" />
      </div>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function AISuggestionPanel({
  currentUserProfile,
  currentUserId,
  isVisible,
}: AISuggestionPanelProps) {
  const [suggestions, setSuggestions] = useState<PredictionPayload[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modelVersion, setModelVersion] = useState<string>('');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isOnline, setIsOnline] = useState(true);
  const [hasConnections, setHasConnections] = useState(false);
  const [actionedId, setActionedId] = useState<string | null>(null);

  const panelRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const isInView = useInView(panelRef, { once: true, margin: '-80px' });

  // Safely read quest state on the client (SSR guard is inside getQuestState)
  useEffect(() => {
    const quest = getQuestState();
    setHasConnections(quest.connectionPoints > 0 || quest.completedQuests.length > 0);
  }, []);

  // ─── Fetch Suggestions ──────────────────────────────────────────────────────
  const loadSuggestions = useCallback(async (forceRefresh = false) => {

    // Cancel any in-flight request
    abortRef.current?.abort();
    abortRef.current = new AbortController();

    setLoading(true);
    setError(null);

    try {
      const response: SuggestionResponse = await fetchSuggestions(
        currentUserProfile,
        forceRefresh,
        abortRef.current.signal
      );
      setSuggestions(response.suggestions);
      setModelVersion(response.model_version);
      setLastUpdated(new Date(response.generated_at));
      setIsOnline(true);

      if (response.error) {
        setError(response.error);
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name !== 'AbortError') {
        setError('Could not load predictions. Using cached signals.');
        setIsOnline(false);
      }
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUserProfile]);

  // Load when panel comes into view
  useEffect(() => {
    if (isInView && isVisible && suggestions.length === 0) {
      loadSuggestions(false);
    }
  }, [isInView, isVisible, suggestions.length, loadSuggestions]);

  // Cleanup on unmount
  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  // ─── Action handler ─────────────────────────────────────────────────────────
  const handleAction = async (payload: PredictionPayload) => {
    setActionedId(payload.target_id);
    if (currentUserId) {
      try {
        const actionLabel = ACTION_LABELS[payload.suggested_action_id] ?? 'Propose Move';
        await sendSuggestionMove(
          currentUserId,
          payload.target_id,
          payload.suggested_action_id,
          actionLabel
        );
        await updateRelationshipScore(
          currentUserId,
          payload.target_id,
          'suggestion_move_accepted'
        );
      } catch (err) {
        console.error('Failed to submit suggestion move action:', err);
      }
    }
    setTimeout(() => setActionedId(null), 2000);
  };

  // ─── Placement guard (UX-001) ───────────────────────────────────────────────
  if (!isVisible || (!hasConnections && suggestions.length === 0)) return null;

  return (
    <AnimatePresence>
      <motion.section
        ref={panelRef}
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -16 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="relative"
        aria-label="AI Suggestion Panel"
      >
        {/* ── Ambient background glow ── */}
        <div className="absolute -top-16 -left-16 w-80 h-80 bg-cyan-500/8 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute -bottom-16 -right-16 w-64 h-64 bg-blue-600/8 blur-[100px] rounded-full pointer-events-none" />

        {/* ── Panel container ── */}
        <div className="relative rounded-3xl border border-cyan-500/15 bg-black/50 backdrop-blur-2xl overflow-hidden">

          {/* Top gradient line */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent" />

          {/* ── Header ── */}
          <div className="px-6 pt-6 pb-5 flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <BrainPulse />
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-sm font-black uppercase tracking-[0.2em] text-white">
                    Intelligence Layer
                  </h2>
                  <motion.div
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="px-2 py-0.5 bg-cyan-400/15 border border-cyan-400/30 rounded-full text-[8px] font-black text-cyan-400 uppercase tracking-widest"
                  >
                    LIVE
                  </motion.div>
                </div>
                <p className="text-[10px] text-white/40 font-medium leading-snug max-w-xs">
                  Hyper-intuitive connection predictions — ranked by signal strength, momentum & opportunity gap
                </p>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Online indicator */}
              <div className="flex items-center gap-1.5 text-[8px] font-black uppercase tracking-widest">
                {isOnline ? (
                  <Wifi className="w-3 h-3 text-cyan-400" />
                ) : (
                  <WifiOff className="w-3 h-3 text-white/30" />
                )}
                <span className={isOnline ? 'text-cyan-400' : 'text-white/30'}>
                  {modelVersion || 'loading'}
                </span>
              </div>
              {/* Refresh button */}
              <button
                onClick={() => loadSuggestions(true)}
                disabled={loading}
                className="p-2 rounded-xl border border-white/8 bg-white/3 text-white/40 hover:text-cyan-400 hover:border-cyan-400/30 transition-all duration-300 disabled:opacity-30"
                title="Refresh predictions"
              >
                <motion.div
                  animate={loading ? { rotate: 360 } : { rotate: 0 }}
                  transition={loading ? { duration: 1, repeat: Infinity, ease: 'linear' } : {}}
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </motion.div>
              </button>
            </div>
          </div>

          {/* ── Stats row ── */}
          {lastUpdated && !loading && (
            <div className="px-6 pb-4 flex items-center gap-4">
              <div className="flex items-center gap-1.5 text-[8px] text-white/25 font-bold uppercase tracking-widest">
                <Sparkles className="w-2.5 h-2.5 text-cyan-400/60" />
                {suggestions.length} predictions ranked
              </div>
              <div className="w-1 h-1 rounded-full bg-white/10" />
              <div className="text-[8px] text-white/25 font-bold uppercase tracking-widest">
                Updated {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          )}

          {/* ── Error state ── */}
          {error && (
            <div className="px-6 pb-4">
              <div className="px-3 py-2 rounded-xl bg-amber-500/8 border border-amber-500/20 text-[9px] text-amber-400 font-bold uppercase tracking-widest">
                ⚠ {error}
              </div>
            </div>
          )}

          {/* ── Cards grid ── */}
          <div className="px-6 pb-6">
            <div className="grid grid-cols-1 gap-3">
              {loading ? (
                <>
                  {[0, 1, 2].map((i) => (
                    <SkeletonCard key={i} index={i} />
                  ))}
                </>
              ) : (
                <>
                  {suggestions.map((payload, i) => (
                    <div key={payload.target_id} className="relative">
                      <SuggestionCard
                        payload={payload}
                        rank={i}
                        onAction={handleAction}
                      />
                      {/* Action confirmation overlay */}
                      <AnimatePresence>
                        {actionedId === payload.target_id && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 rounded-2xl flex items-center justify-center backdrop-blur-sm bg-black/60 z-20"
                          >
                            <div className="flex items-center gap-2 text-xs font-black text-cyan-400">
                              <motion.div
                                animate={{ scale: [0.8, 1.2, 1] }}
                                transition={{ duration: 0.4 }}
                              >
                                ✓
                              </motion.div>
                              Move Sent — Gauge Updated
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </>
              )}
            </div>

            {/* ── Footer CTA ── */}
            {!loading && suggestions.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between"
              >
                <p className="text-[9px] text-white/25 font-bold uppercase tracking-widest">
                  Powered by PME v2.0 + RLS v2.0
                </p>
                <button className="flex items-center gap-1 text-[9px] font-black text-cyan-400/60 hover:text-cyan-400 transition-colors uppercase tracking-widest">
                  Full Analysis <ChevronRight className="w-2.5 h-2.5" />
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </motion.section>
    </AnimatePresence>
  );
}
