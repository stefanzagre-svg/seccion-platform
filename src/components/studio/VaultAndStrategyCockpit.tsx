'use client';

import React, { useEffect, useState } from 'react';
import {
  Network,
  FileText,
  Target,
  Image as ImageIcon,
  Lock,
  Plus,
  Save,
  ShieldAlert,
  Download,
  Sliders,
  DollarSign,
  Trash2,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { buildVaultGraph, RawVaultNote } from '@/lib/vault/vault-graph-engine';
import {
  DEFAULT_VIP_OFFER_TTL_DAYS,
  MAX_ACTIVE_BRAND_RULES,
  getCopilotMemoryLifecycleState,
  type CopilotMemoryLifecycleState,
  type CopilotMemoryType,
} from '@/lib/ai/copilot-memory';

interface VaultMemoryNote extends RawVaultNote {
  status?: 'active' | 'superseded';
  lifecycleState?: CopilotMemoryLifecycleState;
  checkedAt?: string;
  topicSlug?: string;
  sourceContext?: string;
  persisted?: boolean;
}

const NOTE_TYPE_TO_MEMORY_TYPE: Record<string, CopilotMemoryType> = {
  PERSONA: 'brand_voice',
  BOUNDARY: 'boundary',
  MEMBER_DOSSIER: 'vip_preference',
  TOPIC: 'vip_offer_decision',
};

const MEMORY_TYPE_TO_NOTE_TYPE: Record<CopilotMemoryType, RawVaultNote['note_type']> = {
  brand_voice: 'PERSONA',
  boundary: 'BOUNDARY',
  vip_preference: 'MEMBER_DOSSIER',
  vip_offer_decision: 'TOPIC',
};

const STARTER_NOTES: VaultMemoryNote[] = [
  {
    id: 'starter-1',
    title: 'Persona_Official',
    note_type: 'PERSONA',
    content: 'Authentic tone: witty, playful, loves [[Fitness]], [[Pilates]], and organic coffee. Never mentions personal coordinates.',
    status: 'active',
    persisted: false,
  },
  {
    id: 'starter-2',
    title: 'Fitness_Boundary',
    note_type: 'BOUNDARY',
    content: 'Keep fitness advice casual. Direct members interested in deep workout coaching to [[Book_Consultation]].',
    status: 'active',
    persisted: false,
  },
  {
    id: 'starter-3',
    title: 'Member_Lucas',
    note_type: 'MEMBER_DOSSIER',
    content: 'Regular supporter since August. Has a Golden Retriever named Milo. Interested in [[Fitness]].',
    status: 'active',
    persisted: false,
  },
];

export default function VaultAndStrategyCockpit() {
  const [activeTab, setActiveTab] = useState<'vault' | 'goals' | 'media'>('vault');

  // Provenance-backed Vault memory state
  const [notes, setNotes] = useState<VaultMemoryNote[]>(STARTER_NOTES);
  const [selectedNote, setSelectedNote] = useState<VaultMemoryNote>(STARTER_NOTES[0]);
  const [isLoadingMemories, setIsLoadingMemories] = useState(false);
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [vaultFeedback, setVaultFeedback] = useState<{
    kind: 'success' | 'warning' | 'error';
    text: string;
  } | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function hydrateMemories() {
      setIsLoadingMemories(true);
      try {
        const res = await fetch('/api/v2/copilot/memories');
        if (!res.ok) return;
        const json = await res.json();
        if (cancelled) return;
        if (Array.isArray(json.memories) && json.memories.length > 0) {
          const loaded: VaultMemoryNote[] = (json.memories as Array<{
            id: string;
            title: string;
            memory_type: CopilotMemoryType;
            summary: string;
            status: 'active' | 'superseded';
            lifecycle_state?: CopilotMemoryLifecycleState;
            checked_at: string;
            topic_slug: string;
            source_context: string;
          }>).map((m) => ({
            id: m.id,
            title: m.title,
            note_type: MEMORY_TYPE_TO_NOTE_TYPE[m.memory_type] || 'TOPIC',
            content: m.summary,
            status: m.status,
            lifecycleState: m.lifecycle_state || getCopilotMemoryLifecycleState({
              memory_type: m.memory_type,
              checked_at: m.checked_at,
              status: m.status,
            }),
            checkedAt: m.checked_at,
            topicSlug: m.topic_slug,
            sourceContext: m.source_context,
            persisted: true,
          }));
          setNotes(loaded);
          const firstActive = loaded.find((n) => (n.lifecycleState || n.status) === 'active') || loaded[0];
          setSelectedNote(firstActive);
        }
      } catch {
        // Fallback silently to starter notes in local preview mode
      } finally {
        if (!cancelled) setIsLoadingMemories(false);
      }
    }
    hydrateMemories();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSaveNote() {
    if (!selectedNote.title.trim() || !selectedNote.content.trim()) {
      setVaultFeedback({ kind: 'error', text: 'Title and memory summary cannot be empty.' });
      return;
    }

    setIsSavingNote(true);
    setVaultFeedback(null);
    try {
      const memoryType: CopilotMemoryType =
        NOTE_TYPE_TO_MEMORY_TYPE[selectedNote.note_type] || 'vip_offer_decision';

      const res = await fetch('/api/v2/copilot/memories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: selectedNote.title,
          memoryType,
          topicSlug: selectedNote.topicSlug,
          summary: selectedNote.content,
          sourceContext: 'studio_cockpit',
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setVaultFeedback({
          kind: 'error',
          text: data.error || 'Could not save memory to Supabase.',
        });
        return;
      }

      const savedRow = data.memory;
      const savedNote: VaultMemoryNote = {
        id: savedRow.id,
        title: savedRow.title,
        note_type: MEMORY_TYPE_TO_NOTE_TYPE[savedRow.memory_type as CopilotMemoryType] || selectedNote.note_type,
        content: savedRow.summary,
        status: savedRow.status,
        checkedAt: savedRow.checked_at,
        topicSlug: savedRow.topic_slug,
        sourceContext: savedRow.source_context,
        persisted: true,
      };

      setNotes((prev) => {
        const updated = prev
          .filter((n) => n.id !== selectedNote.id)
          .map((n) =>
            n.topicSlug === savedNote.topicSlug && n.status === 'active'
              ? { ...n, status: 'superseded' as const }
              : n
          );
        return [savedNote, ...updated];
      });
      setSelectedNote(savedNote);

      const notesFlags: string[] = ['Saved & verified in AI Copilot Memory'];
      if (data.supersededCount > 0) {
        notesFlags.push(`superseded ${data.supersededCount} older rule(s)`);
      }
      if (data.prunedOverflowCount > 0) {
        notesFlags.push(`archived ${data.prunedOverflowCount} oldest rule(s) to keep ${MAX_ACTIVE_BRAND_RULES}-rule cap`);
      }
      if (data.prunedExpiredCount > 0) {
        notesFlags.push(`cleaned ${data.prunedExpiredCount} expired offer note(s)`);
      }
      if (data.piiRedacted) {
        notesFlags.push(`auto-scrubbed PII (${(data.redactedTypes || []).join(', ')})`);
      }
      setVaultFeedback({
        kind: data.piiRedacted ? 'warning' : 'success',
        text: notesFlags.join(' • '),
      });
    } catch {
      setVaultFeedback({ kind: 'error', text: 'Network error while saving AI memory.' });
    } finally {
      setIsSavingNote(false);
    }
  }

  async function handleDeleteNote(noteToDelete: VaultMemoryNote) {
    setVaultFeedback(null);
    if (noteToDelete.persisted) {
      try {
        const res = await fetch(`/api/v2/copilot/memories?id=${encodeURIComponent(noteToDelete.id)}`, {
          method: 'DELETE',
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          setVaultFeedback({ kind: 'error', text: data.error || 'Failed to delete memory.' });
          return;
        }
      } catch {
        setVaultFeedback({ kind: 'error', text: 'Network error while deleting memory.' });
        return;
      }
    }

    const remaining = notes.filter((n) => n.id !== noteToDelete.id);
    setNotes(remaining);
    if (remaining.length > 0) {
      setSelectedNote(remaining[0]);
    } else {
      const blank: VaultMemoryNote = {
        id: Date.now().toString(),
        title: 'New_Brand_Rule',
        note_type: 'PERSONA',
        content: 'Describe your tone, [[Topics]], or VIP guidelines...',
        status: 'active',
        persisted: false,
      };
      setNotes([blank]);
      setSelectedNote(blank);
    }
    setVaultFeedback({ kind: 'success', text: 'Memory deleted from Copilot context.' });
  }

  async function handleCleanStaleOffers() {
    setVaultFeedback(null);
    try {
      const res = await fetch('/api/v2/copilot/memories?pruneExpired=true', {
        method: 'DELETE',
      });
      if (!res.ok) {
        setVaultFeedback({ kind: 'error', text: 'Failed to clean expired promo notes.' });
        return;
      }
      const data = await res.json().catch(() => ({}));
      setNotes((prev) =>
        prev.map((n) =>
          n.lifecycleState === 'expired'
            ? { ...n, status: 'superseded', lifecycleState: 'superseded' }
            : n
        )
      );
      setVaultFeedback({
        kind: 'success',
        text: `Cleaned ${Number(data.prunedCount || 0)} expired offer note(s) older than ${DEFAULT_VIP_OFFER_TTL_DAYS} days.`,
      });
    } catch {
      setVaultFeedback({ kind: 'error', text: 'Network error while cleaning stale notes.' });
    }
  }

  // Goal & restriction state
  const [globalGoal, setGlobalGoal] = useState('SUBSCRIBE_VIP');
  const [allowPhotos, setAllowPhotos] = useState(true);
  const [allowVideos, setAllowVideos] = useState(true);
  const [blockNsfw, setBlockNsfw] = useState(false);
  const [blockMeetups, setBlockMeetups] = useState(true);
  const [blockOffPlatform, setBlockOffPlatform] = useState(true);

  // Media vault state
  const [vaultMedia, setVaultMedia] = useState([
    { id: 'm1', title: 'Morning Coffee Hello', tag: 'greeting', type: 'image', minRls: 10, isPpv: false },
    { id: 'm2', title: 'Post-Workout Stretch', tag: 'workout', type: 'image', minRls: 25, isPpv: false },
    { id: 'm3', title: 'Exclusive Studio BTS', tag: 'bts', type: 'video', minRls: 25, isPpv: true, price: 15 },
  ]);

  const activeNotesForGraph = notes.filter((n) => (n.lifecycleState || n.status) === 'active');
  const activeBrandRulesCount = activeNotesForGraph.filter(
    (n) => n.note_type === 'PERSONA' || n.note_type === 'BOUNDARY'
  ).length;
  const expiredOfferCount = notes.filter((n) => n.lifecycleState === 'expired').length;
  const graph = buildVaultGraph(activeNotesForGraph);

  return (
    <div className="space-y-6">
      {/* Cockpit Sub-Navigation Bar */}
      <div className="flex items-center gap-2 p-1.5 bg-black/40 border border-white/5 rounded-2xl w-fit">
        <button
          onClick={() => setActiveTab('vault')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
            activeTab === 'vault' ? 'bg-primary text-black font-black' : 'text-white/40 hover:text-white'
          }`}
        >
          <Network className="w-3.5 h-3.5" /> Brand Notes & Voice
        </button>
        <button
          onClick={() => setActiveTab('goals')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
            activeTab === 'goals' ? 'bg-primary text-black font-black' : 'text-white/40 hover:text-white'
          }`}
        >
          <Target className="w-3.5 h-3.5" /> Chat Goals & Limits
        </button>
        <button
          onClick={() => setActiveTab('media')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
            activeTab === 'media' ? 'bg-primary text-black font-black' : 'text-white/40 hover:text-white'
          }`}
        >
          <ImageIcon className="w-3.5 h-3.5" /> Shareable Media
        </button>
      </div>

      {/* ── TAB 1: BRAND NOTES & VOICE EDITOR ──────────────────────────── */}
      {activeTab === 'vault' && (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Note List & Connections Overview */}
          <div className="glass-card p-5 rounded-2xl border border-white/5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-white/60">
                  Your AI Notes ({graph.nodes.length})
                </span>
                <span
                  className="text-[9px] font-mono px-2 py-0.5 rounded bg-primary/15 text-primary border border-primary/25"
                  title={`Hard cap of ${MAX_ACTIVE_BRAND_RULES} active Brand Voice & Boundary rules keeps Copilot sharp`}
                >
                  Rules {activeBrandRulesCount}/{MAX_ACTIVE_BRAND_RULES}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                {expiredOfferCount > 0 && (
                  <button
                    type="button"
                    onClick={handleCleanStaleOffers}
                    className="px-2 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-[9px] font-mono font-bold text-amber-200 transition"
                    title={`Archive offer notes older than ${DEFAULT_VIP_OFFER_TTL_DAYS} days`}
                  >
                    Clean {expiredOfferCount} Stale
                  </button>
                )}
                <button
                  onClick={() => {
                    const title = prompt('Enter a note name (e.g. Weekend Promo or Chat Tone):');
                    if (!title) return;
                    const newNote: VaultMemoryNote = {
                      id: Date.now().toString(),
                      title: title.replace(/\[\[|\]\]/g, ''),
                      note_type: 'TOPIC',
                      content: 'Write simple instructions or limits here for your AI assistant.',
                      status: 'active',
                      lifecycleState: 'active',
                      persisted: false,
                    };
                    setNotes([newNote, ...notes]);
                    setSelectedNote(newNote);
                    setVaultFeedback(null);
                  }}
                  className="p-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-white/70 hover:text-white transition"
                  title="Add new note for your AI assistant"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            <p className="text-[10px] font-mono text-white/40">
              Weekly Review: keep &le; {MAX_ACTIVE_BRAND_RULES} active brand rules; temporary promos expire after {DEFAULT_VIP_OFFER_TTL_DAYS}d.
            </p>

            {isLoadingMemories && (
              <div className="text-[10px] font-mono text-white/40 uppercase tracking-widest">
                Loading your AI notes...
              </div>
            )}

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {notes.map((n) => {
                const state = n.lifecycleState || (n.status === 'superseded' ? 'superseded' : 'active');
                const isSuperseded = state === 'superseded';
                const isExpired = state === 'expired';
                return (
                  <div
                    key={n.id}
                    onClick={() => {
                      setSelectedNote(n);
                      setVaultFeedback(null);
                    }}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      selectedNote.id === n.id
                        ? 'bg-primary/10 border-primary/40 text-white'
                        : isSuperseded || isExpired
                          ? 'bg-black/20 border-white/5 text-white/40 opacity-75 hover:opacity-100'
                          : 'bg-black/30 border-white/5 text-white/60 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 text-[11px] font-bold">
                      <span className={isSuperseded || isExpired ? 'line-through' : ''}>{n.title.replace(/_/g, ' ')}</span>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span
                          className={`text-[8px] uppercase tracking-wider px-1.5 py-0.5 rounded ${
                            isSuperseded
                              ? 'bg-white/10 text-white/50'
                              : isExpired
                                ? 'bg-amber-500/20 text-amber-300'
                                : 'bg-emerald-500/15 text-emerald-300'
                          }`}
                        >
                          {isSuperseded ? 'archived' : isExpired ? 'expired' : 'active'}
                        </span>
                        <span className="text-[8px] uppercase tracking-wider bg-white/5 px-2 py-0.5 rounded text-white/40">
                          {n.note_type === 'MEMBER_DOSSIER' ? 'VIP NOTE' : n.note_type}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Related Topic Links */}
            <div className="p-4 bg-black/40 rounded-xl border border-white/5 space-y-2">
              <span className="text-[9px] font-black uppercase tracking-widest text-white/40 block">
                Connected Notes
              </span>
              <div className="space-y-1">
                {graph.edges.map((e, idx) => (
                  <div key={idx} className="text-[10px] text-white/60 font-mono flex items-center gap-1.5">
                    <span className="text-primary font-bold">{e.source.replace(/_/g, ' ')}</span>
                    <span className="text-white/20">──▶</span>
                    <span className="text-emerald-400 font-bold">{e.target.replace(/_/g, ' ')}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Note Editor */}
          <div className="lg:col-span-2 glass-card p-6 rounded-2xl border border-white/5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/5">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" />
                <span className="text-xs font-black uppercase tracking-widest text-white">
                  Editing: {selectedNote.title.replace(/_/g, ' ')}
                </span>
                {selectedNote.checkedAt && (
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-white/5 text-white/50">
                    Updated {selectedNote.checkedAt.slice(0, 10)}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={selectedNote.note_type}
                  onChange={(e) => {
                    const updated: VaultMemoryNote = {
                      ...selectedNote,
                      note_type: e.target.value as RawVaultNote['note_type'],
                    };
                    setSelectedNote(updated);
                    setNotes(notes.map((n) => (n.id === updated.id ? updated : n)));
                  }}
                  aria-label="Note category"
                  className="bg-black/60 border border-white/10 rounded-lg px-2.5 py-1.5 text-[9px] font-black uppercase tracking-widest text-white/80 outline-none focus:border-primary/50"
                >
                  <option value="PERSONA">Brand Voice &amp; Style</option>
                  <option value="BOUNDARY">Hard Boundary (Never Do)</option>
                  <option value="MEMBER_DOSSIER">Fan Note (VIP)</option>
                  <option value="TOPIC">Offer / Promo Topic</option>
                </select>
                <button
                  onClick={() => handleDeleteNote(selectedNote)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-300 border border-red-500/20 font-black rounded-lg text-[9px] uppercase tracking-widest transition"
                  title="Forget & delete memory"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Forget
                </button>
                <button
                  onClick={handleSaveNote}
                  disabled={isSavingNote}
                  className="flex items-center gap-2 px-4 py-1.5 bg-primary text-black font-black rounded-lg text-[9px] uppercase tracking-widest hover:brightness-110 transition disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" /> {isSavingNote ? 'Saving...' : 'Save Note'}
                </button>
              </div>
            </div>

            {vaultFeedback && (
              <div
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl border text-[11px] font-mono ${
                  vaultFeedback.kind === 'error'
                    ? 'bg-red-500/10 border-red-500/30 text-red-300'
                    : vaultFeedback.kind === 'warning'
                      ? 'bg-amber-500/10 border-amber-500/30 text-amber-200'
                      : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                }`}
              >
                {vaultFeedback.kind === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                )}
                <span>{vaultFeedback.text}</span>
              </div>
            )}

            <textarea
              value={selectedNote.content}
              onChange={(e) => {
                const updated = { ...selectedNote, content: e.target.value };
                setSelectedNote(updated);
                setNotes(notes.map((n) => (n.id === updated.id ? updated : n)));
              }}
              rows={10}
              className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-sm font-mono text-white/90 outline-none focus:border-primary/50 resize-none"
              placeholder="Write instructions for how your AI Copilot should talk, what it can offer, and what it should never say..."
            />

            <div className="flex items-center justify-between text-[9px] uppercase tracking-widest text-white/40 pt-2">
              <span>Private to your AI Copilot · Sensitive info scrubbed automatically</span>
              <button
                onClick={() => {
                  const blob = new Blob([selectedNote.content], { type: 'text/markdown' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `${selectedNote.title}.md`;
                  a.click();
                }}
                className="flex items-center gap-1 hover:text-white transition"
              >
                <Download className="w-3 h-3" /> Download Note (.md)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: CHAT GOALS & BOUNDARIES ──────────────────────────────── */}
      {activeTab === 'goals' && (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Active Chat Goals */}
          <div className="glass-card p-6 rounded-2xl border border-white/5 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-white/5 text-primary">
              <Target className="w-5 h-5" />
              <h3 className="text-xs font-black uppercase tracking-widest text-white">AI Chat Objective</h3>
            </div>
            <p className="text-[10px] text-white/50 uppercase tracking-widest leading-relaxed">
              Choose what your AI Copilot naturally guides fan DMs toward.
            </p>
            <div className="space-y-2 pt-2">
              {[
                { id: 'SUBSCRIBE_VIP', label: 'Sell VIP Subscriptions', desc: 'Promotes exclusive feed perks & 3-month bundle savings.' },
                { id: 'PLAN_VIDEO_CALL', label: 'Book 1-on-1 Video Call', desc: 'Encourages supporters to book a private live video call.' },
                { id: 'BOOK_CONSULTATION', label: 'Mentorship / Consultation', desc: 'Sells professional strategy or coaching sessions.' },
                { id: 'DISCOVERY', label: 'Pure Rapport & Discovery', desc: 'Zero pitch. Focuses purely on authentic banter and connection.' },
              ].map((g) => (
                <div
                  key={g.id}
                  onClick={() => setGlobalGoal(g.id)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition ${
                    globalGoal === g.id
                      ? 'bg-primary/10 border-primary text-white'
                      : 'bg-black/30 border-white/5 text-white/60 hover:text-white'
                  }`}
                >
                  <div className="text-[11px] font-black uppercase tracking-widest">{g.label}</div>
                  <div className="text-[9px] text-white/40 uppercase tracking-wider mt-0.5">{g.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Safety & Media Restriction Toggles */}
          <div className="glass-card p-6 rounded-2xl border border-white/5 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-white/5 text-rose-400">
              <ShieldAlert className="w-5 h-5" />
              <h3 className="text-xs font-black uppercase tracking-widest text-white">Safety & Media Boundaries</h3>
            </div>
            <p className="text-[10px] text-white/50 uppercase tracking-widest leading-relaxed">
              Granular toggles to enforce boundaries across all automated replies.
            </p>

            <div className="space-y-3 pt-2">
              <label className="flex items-center justify-between p-3.5 bg-black/30 rounded-xl border border-white/5 cursor-pointer">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-white block">Allow Photo Dispatches</span>
                  <span className="text-[8px] text-white/40 uppercase tracking-widest">Permits sending approved photos from media vault</span>
                </div>
                <input
                  type="checkbox"
                  checked={allowPhotos}
                  onChange={(e) => setAllowPhotos(e.target.checked)}
                  className="rounded text-primary focus:ring-0"
                />
              </label>

              <label className="flex items-center justify-between p-3.5 bg-black/30 rounded-xl border border-white/5 cursor-pointer">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-white block">Allow Video Dispatches</span>
                  <span className="text-[8px] text-white/40 uppercase tracking-widest">Permits sending teaser & greeting video clips</span>
                </div>
                <input
                  type="checkbox"
                  checked={allowVideos}
                  onChange={(e) => setAllowVideos(e.target.checked)}
                  className="rounded text-primary focus:ring-0"
                />
              </label>

              <label className="flex items-center justify-between p-3.5 bg-black/30 rounded-xl border border-white/5 cursor-pointer">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-white block">Block Offline Meetup Requests</span>
                  <span className="text-[8px] text-rose-400/70 uppercase tracking-widest">Auto-deflects in-person rendezvous requests</span>
                </div>
                <input
                  type="checkbox"
                  checked={blockMeetups}
                  onChange={(e) => setBlockMeetups(e.target.checked)}
                  className="rounded text-primary focus:ring-0"
                />
              </label>

              <label className="flex items-center justify-between p-3.5 bg-black/30 rounded-xl border border-white/5 cursor-pointer">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-white block">Block Off-Platform Payments</span>
                  <span className="text-[8px] text-rose-400/70 uppercase tracking-widest">Rejects CashApp, Venmo, or external wires</span>
                </div>
                <input
                  type="checkbox"
                  checked={blockOffPlatform}
                  onChange={(e) => setBlockOffPlatform(e.target.checked)}
                  className="rounded text-primary focus:ring-0"
                />
              </label>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 3: SHAREABLE MEDIA LIBRARY ──────────────────────────────── */}
      {activeTab === 'media' && (
        <div className="glass-card p-6 rounded-2xl border border-white/5 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-white/5">
            <div>
              <h3 className="text-xs font-black uppercase tracking-widest text-white flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-primary" /> Pre-Approved AI Media Library
              </h3>
              <p className="text-[9px] text-white/40 uppercase tracking-widest mt-1">
                Photos & clips your AI Copilot is allowed to send in fan chats when relevant.
              </p>
            </div>
            <button
              onClick={() => {
                const title = prompt('Enter media title:');
                if (!title) return;
                setVaultMedia([
                  ...vaultMedia,
                  { id: Date.now().toString(), title, tag: 'bts', type: 'image', minRls: 15, isPpv: false },
                ]);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-black font-black rounded-xl text-[9px] uppercase tracking-widest hover:brightness-110 transition"
            >
              <Plus className="w-3.5 h-3.5" /> Add Shareable Media
            </button>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {vaultMedia.map((m) => (
              <div key={m.id} className="p-4 bg-black/40 rounded-xl border border-white/5 space-y-3">
                <div className="aspect-video bg-white/5 rounded-lg flex items-center justify-center text-white/30 text-xs font-bold uppercase tracking-widest">
                  [{m.type.toUpperCase()} PREVIEW]
                </div>
                <div>
                  <div className="text-[11px] font-bold text-white">{m.title}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[8px] bg-white/10 px-2 py-0.5 rounded text-white/60 uppercase font-black">
                      Tag: {m.tag}
                    </span>
                    <span className="text-[8px] bg-primary/10 text-primary px-2 py-0.5 rounded uppercase font-black">
                      Trust Level {Math.max(1, Math.round(m.minRls / 5))}+
                    </span>
                    {m.isPpv && (
                      <span className="text-[8px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded uppercase font-black">
                        ${m.price} PPV
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
