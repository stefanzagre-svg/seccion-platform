"use client";

import React, { useState } from 'react';
import { Image as ImageIcon, Plus, Trash2, Video, Eye, Lock, EyeOff } from 'lucide-react';
import type { BaseProfileMedia } from '@/lib/profile-utils';

interface MemberMediaTabProps {
  mediaItems: BaseProfileMedia[];
  mediaUrlInput: string;
  setMediaUrlInput: (val: string) => void;
  mediaTypeInput: 'image' | 'video';
  setMediaTypeInput: (val: 'image' | 'video') => void;
  mediaIsHiddenInput: boolean;
  setMediaIsHiddenInput: (val: boolean) => void;
  handleAddMedia: () => Promise<void>;
  handleDeleteMedia: (id: string) => Promise<void>;
  isUploadingMedia?: boolean;
}

export const MemberMediaTab: React.FC<MemberMediaTabProps> = ({
  mediaItems,
  mediaUrlInput,
  setMediaUrlInput,
  mediaTypeInput,
  setMediaTypeInput,
  mediaIsHiddenInput,
  setMediaIsHiddenInput,
  handleAddMedia,
  handleDeleteMedia,
  isUploadingMedia = false,
}) => {
  return (
    <div className="space-y-8 text-left">
      <div>
        <h2 className="text-2xl font-bold uppercase tracking-tighter flex items-center gap-2 text-white">
          <ImageIcon className="text-primary w-6 h-6" /> My Media Album
        </h2>
        <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest mt-1">
          Upload and manage your public photos/videos and hidden media gated by connection levels.
        </p>
      </div>

      {/* Upload Media Card */}
      <div className="glass-card p-6 bg-white/2 border border-white/5 rounded-3xl space-y-6">
        <h3 className="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Upload New Media
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="text-[9px] font-black uppercase tracking-wider text-white/50 block mb-2">Media URL</label>
              <input
                type="text"
                value={mediaUrlInput}
                onChange={(e) => setMediaUrlInput(e.target.value)}
                placeholder="https://images.unsplash.com/photo-..."
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-xs font-semibold focus:border-primary focus:outline-none transition"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[9px] font-black uppercase tracking-wider text-white/50 block mb-2">Media Type</label>
                <select
                  value={mediaTypeInput}
                  onChange={(e) => setMediaTypeInput(e.target.value as 'image' | 'video')}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2.5 text-xs font-bold focus:border-primary focus:outline-none text-white/80"
                >
                  <option value="image">Image / Photo</option>
                  <option value="video">Video</option>
                </select>
              </div>
              <div>
                <label className="text-[9px] font-black uppercase tracking-wider text-white/50 block mb-2">Visibility</label>
                <div className="flex items-center gap-2 h-10">
                  <input
                    type="checkbox"
                    id="isHiddenCheck"
                    checked={mediaIsHiddenInput}
                    onChange={(e) => setMediaIsHiddenInput(e.target.checked)}
                    className="w-4 h-4 rounded border-white/10 bg-black/50 text-primary focus:ring-0"
                  />
                  <label htmlFor="isHiddenCheck" className="text-xs font-bold text-white/80 cursor-pointer">
                    Hidden / Private
                  </label>
                </div>
              </div>
            </div>

            <button
              onClick={handleAddMedia}
              disabled={isUploadingMedia || !mediaUrlInput.trim()}
              className="w-full py-3 bg-primary text-black font-black uppercase text-xs tracking-wider rounded-xl hover:shadow-[0_0_20px_rgba(0,251,251,0.4)] transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40"
            >
              <Plus className="w-4 h-4" /> Save to Album
            </button>
          </div>

          <div className="bg-black/30 border border-white/5 rounded-2xl p-4 flex flex-col justify-center items-center text-center">
            {mediaUrlInput ? (
              <div className="relative w-full h-36 rounded-xl overflow-hidden bg-black/60">
                {mediaTypeInput === 'video' ? (
                  <div className="w-full h-full flex items-center justify-center text-white/40">
                    <Video className="w-8 h-8" />
                  </div>
                ) : (
                  <img src={mediaUrlInput} alt="Preview" className="w-full h-full object-cover" />
                )}
                {mediaIsHiddenInput && (
                  <div className="absolute top-2 right-2 bg-black/70 px-2 py-1 rounded-md text-[9px] font-bold text-primary flex items-center gap-1">
                    <Lock className="w-3 h-3" /> Private
                  </div>
                )}
              </div>
            ) : (
              <div className="text-white/30 text-xs flex flex-col items-center gap-2">
                <ImageIcon className="w-8 h-8 opacity-40" />
                <span>Enter a media URL to see a live preview</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Album Grid */}
      <div className="space-y-4">
        <h3 className="text-xs font-black uppercase tracking-widest text-white/50">
          Saved Media ({mediaItems.length})
        </h3>
        {mediaItems.length === 0 ? (
          <div className="p-8 border border-dashed border-white/10 rounded-2xl text-center text-white/40 text-xs">
            No media uploaded yet. Add photos or videos to showcase your vibe!
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {mediaItems.map((item, idx) => (
              <div key={item.id || idx} className="group relative aspect-square rounded-2xl overflow-hidden border border-white/5 bg-black/40">
                {item.type === 'video' ? (
                  <div className="w-full h-full flex items-center justify-center bg-black/60">
                    <Video className="w-6 h-6 text-white/40" />
                  </div>
                ) : (
                  <img src={item.url} alt={`Media ${idx + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    onClick={() => handleDeleteMedia(item.id || '')}
                    className="p-2 rounded-full bg-red-500/20 text-red-400 hover:bg-red-500/40 transition"
                    title="Delete media"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                {item.is_hidden && (
                  <div className="absolute top-2 left-2 bg-black/70 px-1.5 py-0.5 rounded text-[8px] font-black text-primary uppercase tracking-wider flex items-center gap-1">
                    <Lock className="w-2.5 h-2.5" /> Gated
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MemberMediaTab;
