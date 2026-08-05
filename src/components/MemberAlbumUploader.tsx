'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, Film, Image as ImageIcon, Lock, Users, Globe, Video, AlertCircle, Scissors, Play, Pause } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface MemberAlbumUploaderProps {
  memberId: string;
  onUploadSuccess?: () => void;
  onClose?: () => void;
}

type VisibilityLevel = 'public' | 'matches_only' | 'level_3_plus';

export default function MemberAlbumUploader({ memberId, onUploadSuccess, onClose }: MemberAlbumUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video' | null>(null);
  const [visibility, setVisibility] = useState<VisibilityLevel>('public');
  
  // Video trimming state
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoDuration, setVideoDuration] = useState<number>(0);
  const [startTime, setStartTime] = useState<number>(0);
  const [endTime, setEndTime] = useState<number>(20);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Hardcode limits
  const MAX_VIDEOS = 4;
  const MAX_VIDEO_LENGTH = 20;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    if (selected.type.startsWith('video/')) {
      setMediaType('video');
    } else if (selected.type.startsWith('image/')) {
      setMediaType('image');
    } else {
      setError('Please upload an image or video file.');
      return;
    }

    setFile(selected);
    const url = URL.createObjectURL(selected);
    setPreviewUrl(url);
    setError(null);
  };

  const handleVideoLoadedMetadata = () => {
    if (videoRef.current) {
      const duration = videoRef.current.duration;
      setVideoDuration(duration);
      setStartTime(0);
      setEndTime(Math.min(duration, MAX_VIDEO_LENGTH));
    }
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      if (video.currentTime >= endTime) {
        video.pause();
        setIsPlaying(false);
        video.currentTime = startTime;
      }
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    return () => video.removeEventListener('timeupdate', handleTimeUpdate);
  }, [startTime, endTime]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.currentTime = startTime;
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>, isStart: boolean) => {
    const val = Number(e.target.value);
    if (isStart) {
      if (val >= endTime - 1) return; // Prevent start from passing end
      if (endTime - val > MAX_VIDEO_LENGTH) {
        setEndTime(val + MAX_VIDEO_LENGTH);
      }
      setStartTime(val);
      if (videoRef.current) videoRef.current.currentTime = val;
    } else {
      if (val <= startTime + 1) return; // Prevent end from passing start
      if (val - startTime > MAX_VIDEO_LENGTH) {
        setStartTime(val - MAX_VIDEO_LENGTH);
      }
      setEndTime(val);
    }
  };

  const handleUpload = async () => {
    if (!file || !memberId) return;
    setIsUploading(true);
    setError(null);

    try {
      // For images, we can upload directly to Supabase storage for now.
      // In a real app, video goes to Cloudflare Stream. For this demo, we mock the Cloudflare Stream UID.
      
      let finalMediaUrl = '';
      let cloudflareUid = null;
      let finalDuration = 0;

      if (mediaType === 'image') {
        const fileExt = file.name.split('.').pop();
        const fileName = `${memberId}-${Date.now()}.${fileExt}`;
        const filePath = `member_albums/${fileName}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('member_albums')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('member_albums')
          .getPublicUrl(filePath);

        finalMediaUrl = publicUrl;
      } else {
        // Video upload simulation (would go to Cloudflare Stream with clipping parameters)
        finalMediaUrl = previewUrl || ''; // Fallback for demo
        cloudflareUid = `cf-stream-mock-${Date.now()}`;
        finalDuration = endTime - startTime;
        
        // IMPORTANT: Verify member doesn't exceed 4 videos
        const { count, error: countError } = await supabase
          .from('member_albums')
          .select('id', { count: 'exact' })
          .eq('member_id', memberId)
          .eq('media_type', 'video');
          
        if (countError) throw countError;
        if (count !== null && count >= MAX_VIDEOS) {
          throw new Error(`You have reached the maximum limit of ${MAX_VIDEOS} videos in your album.`);
        }
      }

      const { error: dbError } = await supabase
        .from('member_albums')
        .insert({
          member_id: memberId,
          media_url: finalMediaUrl,
          media_type: mediaType,
          cloudflare_stream_uid: cloudflareUid,
          visibility: visibility,
          duration_seconds: finalDuration,
          video_start_time: mediaType === 'video' ? startTime : null,
          video_end_time: mediaType === 'video' ? endTime : null,
          is_public_requirement: visibility === 'public'
        });

      if (dbError) throw dbError;

      onUploadSuccess?.();
      onClose?.();

    } catch (err: any) {
      setError(err.message || 'Failed to upload media');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto bg-[#111] rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
      <div className="p-6 border-b border-white/10 flex justify-between items-center">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <ImageIcon className="w-5 h-5 text-pink-500" />
          Add to Album
        </h3>
        {onClose && (
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 text-white/50 transition-colors">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="p-6 space-y-6">
        {/* Upload Area */}
        {!file && (
          <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-white/20 rounded-xl cursor-pointer hover:bg-white/5 transition-colors group">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Upload className="w-10 h-10 text-white/30 group-hover:text-pink-400 transition-colors mb-3" />
              <p className="mb-2 text-sm text-white/70"><span className="font-semibold text-white">Click to upload</span> or drag and drop</p>
              <p className="text-xs text-white/40">SVG, PNG, JPG or MP4 (max 20s)</p>
            </div>
            <input type="file" className="hidden" accept="image/*,video/*" onChange={handleFileSelect} />
          </label>
        )}

        {/* Preview Area */}
        {file && previewUrl && (
          <div className="space-y-4">
            <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden border border-white/10">
              {mediaType === 'video' ? (
                <video 
                  ref={videoRef}
                  src={previewUrl}
                  className="w-full h-full object-contain"
                  onLoadedMetadata={handleVideoLoadedMetadata}
                  playsInline
                />
              ) : (
                <img src={previewUrl} alt="Preview" className="w-full h-full object-contain" />
              )}
              
              <button 
                onClick={() => { setFile(null); setPreviewUrl(null); }}
                className="absolute top-2 right-2 p-1.5 bg-black/60 rounded-full text-white hover:bg-red-500/80 transition-colors backdrop-blur-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Video Trimmer */}
            {mediaType === 'video' && videoDuration > 0 && (
              <div className="bg-white/5 rounded-xl p-4 space-y-4 border border-white/10">
                <div className="flex items-center justify-between text-sm text-white/70">
                  <div className="flex items-center gap-2">
                    <Scissors className="w-4 h-4 text-pink-400" />
                    <span>Trim your video (Max 20s)</span>
                  </div>
                  <span className="font-mono text-xs bg-black/50 px-2 py-1 rounded text-pink-300">
                    Duration: {(endTime - startTime).toFixed(1)}s
                  </span>
                </div>
                
                <div className="relative pt-6 pb-2 px-2 h-8">
                  {/* Custom dual slider for demo purposes (Normally use a dedicated slider component) */}
                  <input 
                    type="range" 
                    min={0} 
                    max={videoDuration} 
                    step={0.1}
                    value={startTime}
                    onChange={(e) => handleSliderChange(e, true)}
                    className="absolute top-0 w-full h-1 bg-transparent appearance-none z-20 pointer-events-auto"
                    style={{ WebkitAppearance: 'none', background: 'transparent' }}
                  />
                  <input 
                    type="range" 
                    min={0} 
                    max={videoDuration} 
                    step={0.1}
                    value={endTime}
                    onChange={(e) => handleSliderChange(e, false)}
                    className="absolute top-0 w-full h-1 bg-transparent appearance-none z-10 pointer-events-auto"
                    style={{ WebkitAppearance: 'none', background: 'transparent' }}
                  />
                  {/* Track visualization */}
                  <div className="absolute top-2 left-0 right-0 h-1 bg-white/20 rounded-full pointer-events-none">
                    <div 
                      className="absolute h-full bg-gradient-to-r from-pink-500 to-purple-500 rounded-full"
                      style={{ 
                        left: `${(startTime / videoDuration) * 100}%`,
                        right: `${100 - (endTime / videoDuration) * 100}%`
                      }}
                    />
                  </div>
                </div>

                <div className="flex justify-center pt-2">
                  <button 
                    onClick={togglePlay}
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    <span className="text-sm font-medium">{isPlaying ? 'Pause Preview' : 'Play Selection'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Visibility Settings */}
            <div className="space-y-3 pt-2">
              <h4 className="text-sm font-medium text-white/70">Who can see this?</h4>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setVisibility('public')}
                  className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${
                    visibility === 'public' 
                      ? 'bg-pink-500/20 border-pink-500 text-pink-300' 
                      : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10'
                  }`}
                >
                  <Globe className="w-5 h-5" />
                  <span className="text-xs font-semibold uppercase tracking-wider">Public</span>
                </button>
                <button
                  onClick={() => setVisibility('matches_only')}
                  className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${
                    visibility === 'matches_only' 
                      ? 'bg-purple-500/20 border-purple-500 text-purple-300' 
                      : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10'
                  }`}
                >
                  <Users className="w-5 h-5" />
                  <span className="text-xs font-semibold uppercase tracking-wider">Matches</span>
                </button>
                <button
                  onClick={() => setVisibility('level_3_plus')}
                  className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${
                    visibility === 'level_3_plus' 
                      ? 'bg-blue-500/20 border-blue-500 text-blue-300' 
                      : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10'
                  }`}
                >
                  <Lock className="w-5 h-5" />
                  <span className="text-xs font-semibold uppercase tracking-wider">Level 3+</span>
                </button>
              </div>
              {visibility === 'public' && (
                <p className="text-xs text-pink-400/80 mt-2 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Public content boosts your profile in the discovery feed!
                </p>
              )}
            </div>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm flex items-start gap-2">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="p-6 border-t border-white/10 bg-black/50">
        <button
          onClick={handleUpload}
          disabled={!file || isUploading}
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold text-lg hover:from-pink-400 hover:to-purple-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(236,72,153,0.3)] hover:shadow-[0_0_30px_rgba(236,72,153,0.5)] flex items-center justify-center gap-2"
        >
          {isUploading ? (
            <span className="flex items-center gap-2">
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                <Upload className="w-5 h-5" />
              </motion.div>
              Uploading...
            </span>
          ) : (
            <>
              <Upload className="w-5 h-5" />
              Upload to Album
            </>
          )}
        </button>
      </div>
    </div>
  );
}
