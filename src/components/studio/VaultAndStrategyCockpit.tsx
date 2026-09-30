'use client';

import React, { useState } from 'react';
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
  DollarSign
} from 'lucide-react';
import { buildVaultGraph, RawVaultNote } from '@/lib/vault/vault-graph-engine';

export default function VaultAndStrategyCockpit() {
  const [activeTab, setActiveTab] = useState<'vault' | 'goals' | 'media'>('vault');

  // Vault mock notes state
  const [notes, setNotes] = useState<RawVaultNote[]>([
    {
      id: '1',
      title: 'Persona_Official',
      note_type: 'PERSONA',
      content: 'Authentic tone: witty, playful, loves [[Fitness]], [[Pilates]], and organic coffee. Never mentions personal coordinates.',
    },
    {
      id: '2',
      title: 'Fitness_Boundary',
      note_type: 'BOUNDARY',
      content: 'Keep fitness advice casual. Direct members interested in deep workout coaching to [[Book_Consultation]].',
    },
    {
      id: '3',
      title: 'Member_Lucas',
      note_type: 'MEMBER_DOSSIER',
      content: 'Regular supporter since August. Has a Golden Retriever named Milo. Interested in [[Fitness]].',
    }
  ]);

  const [selectedNote, setSelectedNote] = useState<RawVaultNote>(notes[0]);

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

  const graph = buildVaultGraph(notes);

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
          <Network className="w-3.5 h-3.5" /> Obsidian Vault Graph
        </button>
        <button
          onClick={() => setActiveTab('goals')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
            activeTab === 'goals' ? 'bg-primary text-black font-black' : 'text-white/40 hover:text-white'
          }`}
        >
          <Target className="w-3.5 h-3.5" /> Goals & Restrictions
        </button>
        <button
          onClick={() => setActiveTab('media')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
            activeTab === 'media' ? 'bg-primary text-black font-black' : 'text-white/40 hover:text-white'
          }`}
        >
          <ImageIcon className="w-3.5 h-3.5" /> Copilot Media Vault
        </button>
      </div>

      {/* ── TAB 1: OBSIDIAN GRAPH & VAULT EDITOR ─────────────────────────── */}
      {activeTab === 'vault' && (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Note List & Graph Overview */}
          <div className="glass-card p-5 rounded-2xl border border-white/5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest text-white/60">
                Connected Vault Nodes ({graph.nodes.length})
              </span>
              <button
                onClick={() => {
                  const title = prompt('Enter new Note Title (e.g. [[Topic]]):');
                  if (!title) return;
                  const newNote: RawVaultNote = {
                    id: Date.now().toString(),
                    title: title.replace(/\[\[|\]\]/g, ''),
                    note_type: 'TOPIC',
                    content: 'Define guidelines and context here using [[wikilinks]].',
                  };
                  setNotes([...notes, newNote]);
                  setSelectedNote(newNote);
                }}
                className="p-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-white/70 hover:text-white transition"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2">
              {notes.map((n) => (
                <div
                  key={n.id}
                  onClick={() => setSelectedNote(n)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    selectedNote.id === n.id
                      ? 'bg-primary/10 border-primary/40 text-white'
                      : 'bg-black/30 border-white/5 text-white/60 hover:text-white'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] font-bold">
                    <span>[[{n.title}]]</span>
                    <span className="text-[8px] uppercase tracking-wider bg-white/5 px-2 py-0.5 rounded text-white/40">
                      {n.note_type}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Visual Edge Adjacency list */}
            <div className="p-4 bg-black/40 rounded-xl border border-white/5 space-y-2">
              <span className="text-[9px] font-black uppercase tracking-widest text-white/40 block">
                Detected [[Wikilink]] Edges
              </span>
              <div className="space-y-1">
                {graph.edges.map((e, idx) => (
                  <div key={idx} className="text-[10px] text-white/60 font-mono flex items-center gap-1.5">
                    <span className="text-primary font-bold">[[{e.source}]]</span>
                    <span className="text-white/20">──▶</span>
                    <span className="text-emerald-400 font-bold">[[{e.target}]]</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Markdown Note Editor */}
          <div className="lg:col-span-2 glass-card p-6 rounded-2xl border border-white/5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" />
                <span className="text-xs font-black uppercase tracking-widest text-white">
                  Editing: [[{selectedNote.title}]]
                </span>
              </div>
              <button
                onClick={() => {
                  alert('Vault note saved. AI memory updated.');
                }}
                className="flex items-center gap-2 px-4 py-1.5 bg-primary text-black font-black rounded-lg text-[9px] uppercase tracking-widest hover:brightness-110 transition"
              >
                <Save className="w-3.5 h-3.5" /> Save Note
              </button>
            </div>

            <textarea
              value={selectedNote.content}
              onChange={(e) => {
                const updated = { ...selectedNote, content: e.target.value };
                setSelectedNote(updated);
                setNotes(notes.map((n) => (n.id === updated.id ? updated : n)));
              }}
              rows={10}
              className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-sm font-mono text-white/90 outline-none focus:border-primary/50 resize-none"
              placeholder="Use [[Page Name]] to create bi-directional links..."
            />

            <div className="flex items-center justify-between text-[9px] uppercase tracking-widest text-white/40 pt-2">
              <span>Supports full CommonMark & Wikilinks</span>
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
                <Download className="w-3 h-3" /> Export to Desktop Obsidian (.md)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: GOALS & INTENT RESTRICTIONS ───────────────────────────── */}
      {activeTab === 'goals' && (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Active Commercial Goals */}
          <div className="glass-card p-6 rounded-2xl border border-white/5 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-white/5 text-primary">
              <Target className="w-5 h-5" />
              <h3 className="text-xs font-black uppercase tracking-widest text-white">Conversation Intent Goals</h3>
            </div>
            <p className="text-[10px] text-white/50 uppercase tracking-widest leading-relaxed">
              Direct the AI Replicant's conversational strategy. It will naturally steer chats toward this objective using multi-turn ramps.
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

      {/* ── TAB 3: COPILOT MEDIA VAULT ───────────────────────────────────── */}
      {activeTab === 'media' && (
        <div className="glass-card p-6 rounded-2xl border border-white/5 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-white/5">
            <div>
              <h3 className="text-xs font-black uppercase tracking-widest text-white flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-primary" /> Pre-Approved Copilot Media Library
              </h3>
              <p className="text-[9px] text-white/40 uppercase tracking-widest mt-1">
                Assets the AI Copilot can autonomously attach to fan chats when relevant.
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
              <Plus className="w-3.5 h-3.5" /> Upload Media to Vault
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
                      Min RLS: {m.minRls}
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
