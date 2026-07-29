'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
const SeccionVideoPlayer = dynamic(() => import('@/components/video/SeccionVideoPlayer').then(mod => mod.SeccionVideoPlayer), { ssr: false });
import { StreamUploader } from '@/components/video/StreamUploader';
import { Play, Upload, Sparkles, ShieldCheck } from 'lucide-react';

export default function StreamDemoPage() {
  const [demoUid, setDemoUid] = useState<string>('');
  const [customUidInput, setCustomUidInput] = useState<string>('');

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6 md:p-12 font-sans selection:bg-pink-500 selection:text-white">
      <div className="max-w-5xl mx-auto space-y-10">
        {/* Header */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-400 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            Cloudflare Stream Integration
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-500 bg-clip-text text-transparent">
            SECCION Video & Streaming
          </h1>
          <p className="text-zinc-400 text-sm md:text-base max-w-2xl">
            Custom HLS video player with adaptive quality switching and direct chunked creator uploads to Cloudflare Stream.
          </p>
        </div>

        {/* Security Banner */}
        <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-start gap-3 text-xs text-blue-300">
          <ShieldCheck className="w-5 h-5 shrink-0 text-blue-400 mt-0.5" />
          <div>
            <span className="font-semibold text-blue-200">Security Verification Protocol Active:</span> Direct uploads are pre-authorized via signed single-use URLs (`/api/stream/direct-upload`). Videos remain in <code className="bg-blue-950/60 px-1 py-0.5 rounded border border-blue-500/30">pending</code> state and off public feeds until verified by the webhook endpoint (`/api/stream/webhook`).
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Uploader Section */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-zinc-200 flex items-center gap-2">
              <Upload className="w-5 h-5 text-pink-400" />
              Creator Upload
            </h2>
            <StreamUploader
              target="platform_content"
              tier="vip"
              title="Demo Exclusive Stream"
              onUploadComplete={({ uid }) => {
                setDemoUid(uid);
              }}
            />
          </div>

          {/* Player Section */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-zinc-200 flex items-center gap-2">
              <Play className="w-5 h-5 text-purple-400" />
              SECCION Custom HLS Player
            </h2>

            <div className="p-4 rounded-2xl bg-zinc-900/60 border border-white/10 space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter Cloudflare Stream UID..."
                  value={customUidInput}
                  onChange={(e) => setCustomUidInput(e.target.value)}
                  className="flex-1 bg-zinc-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-pink-500"
                />
                <button
                  onClick={() => setDemoUid(customUidInput)}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-xs font-medium transition"
                >
                  Load Stream
                </button>
              </div>

              {demoUid ? (
                <SeccionVideoPlayer
                  streamUid={demoUid}
                  title="Cloudflare HLS Adaptive Stream"
                  className="aspect-video w-full"
                />
              ) : (
                <div className="aspect-video w-full rounded-2xl bg-zinc-950 border border-white/5 flex flex-col items-center justify-center text-center p-6 text-zinc-500">
                  <Play className="w-10 h-10 mb-2 opacity-30" />
                  <p className="text-xs">No Stream UID loaded yet.</p>
                  <p className="text-[10px] text-zinc-600 mt-1">
                    Upload a video on the left or enter a UID above to test playback.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
