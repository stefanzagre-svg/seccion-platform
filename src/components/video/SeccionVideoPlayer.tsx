'use client';

import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Settings,
  PictureInPicture2,
  RotateCcw,
} from 'lucide-react';

interface SeccionVideoPlayerProps {
  streamUid?: string;
  manifestUrl?: string;
  posterUrl?: string;
  title?: string;
  autoPlay?: boolean;
  className?: string;
}

export const SeccionVideoPlayer: React.FC<SeccionVideoPlayerProps> = ({
  streamUid,
  manifestUrl,
  posterUrl,
  title,
  autoPlay = false,
  className = '',
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [qualities, setQualities] = useState<{ id: number; height: number }[]>([]);
  const [currentQuality, setCurrentQuality] = useState<number>(-1); // -1 = Auto
  const [showSettings, setShowSettings] = useState(false);

  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Determine actual HLS source URL
  const hlsSource =
    manifestUrl ||
    (streamUid ? `https://videodelivery.net/${streamUid}/manifest/video.m3u8` : '');

  const effectivePoster =
    posterUrl || (streamUid ? `https://videodelivery.net/${streamUid}/thumbnails/thumbnail.jpg` : undefined);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !hlsSource) return;

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
      });

      hlsRef.current = hls;
      hls.loadSource(hlsSource);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        const levels = hls.levels.map((level, index) => ({
          id: index,
          height: level.height,
        }));
        setQualities(levels);
        if (autoPlay) {
          video.play().catch(() => setIsPlaying(false));
        }
      });

      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              hls.recoverMediaError();
              break;
            default:
              hls.destroy();
              break;
          }
        }
      });

      return () => {
        hls.destroy();
      };
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Native HLS support for Safari / iOS
      video.src = hlsSource;
      if (autoPlay) {
        video.play().catch(() => setIsPlaying(false));
      }
    }
  }, [hlsSource, autoPlay]);

  // Video event handlers
  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      setDuration(videoRef.current.duration || 0);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    const newMuted = !isMuted;
    videoRef.current.muted = newMuted;
    setIsMuted(newMuted);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.volume = val;
      setVolume(val);
      setIsMuted(val === 0);
      videoRef.current.muted = val === 0;
    }
  };

  const changeQuality = (levelIndex: number) => {
    if (hlsRef.current) {
      hlsRef.current.currentLevel = levelIndex;
      setCurrentQuality(levelIndex);
    }
    setShowSettings(false);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(console.error);
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(console.error);
    }
  };

  const togglePiP = async () => {
    if (!videoRef.current) return;
    if (document.pictureInPictureElement) {
      await document.exitPictureInPicture();
    } else {
      await videoRef.current.requestPictureInPicture();
    }
  };

  // Auto-hide controls on inactivity
  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3000);
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
      className={`relative group overflow-hidden rounded-2xl bg-black border border-white/10 shadow-2xl transition-all select-none ${className}`}
    >
      <video
        ref={videoRef}
        poster={effectivePoster}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => setIsPlaying(false)}
        onClick={togglePlay}
        className="w-full h-full object-contain cursor-pointer"
        playsInline
      />

      {/* Overlay Title */}
      {title && (
        <div
          className={`absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/80 to-transparent transition-opacity duration-300 pointer-events-none z-10 ${
            showControls ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <h3 className="text-white text-sm font-semibold tracking-wide truncate drop-shadow-md">
            {title}
          </h3>
        </div>
      )}

      {/* Center Big Play Button (when paused) */}
      {!isPlaying && (
        <button
          onClick={togglePlay}
          className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-white flex items-center justify-center transition-all transform hover:scale-110 active:scale-95 shadow-xl z-20"
        >
          <Play className="w-8 h-8 fill-white ml-1" />
        </button>
      )}

      {/* Custom Control Bar */}
      <div
        className={`absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 via-black/50 to-transparent transition-opacity duration-300 z-30 ${
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Progress Seeker */}
        <div className="relative mb-3 flex items-center group/seeker">
          <input
            type="range"
            min={0}
            max={duration || 100}
            step={0.1}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-1.5 bg-white/20 accent-pink-500 rounded-lg cursor-pointer appearance-none group-hover/seeker:h-2 transition-all"
          />
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between gap-4 text-white">
          <div className="flex items-center gap-3">
            <button
              onClick={togglePlay}
              className="p-1.5 rounded-lg hover:bg-white/10 transition text-white"
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current" />}
            </button>

            {/* Volume */}
            <div className="flex items-center gap-2 group/vol">
              <button onClick={toggleMute} className="p-1.5 rounded-lg hover:bg-white/10 transition">
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-5 h-5 text-red-400" />
                ) : (
                  <Volume2 className="w-5 h-5" />
                )}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-16 h-1 bg-white/20 accent-white rounded cursor-pointer hidden group-hover/vol:block transition-all"
              />
            </div>

            {/* Time */}
            <span className="text-xs font-mono text-zinc-300 tracking-wider">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          <div className="flex items-center gap-2 relative">
            {/* Resolution Settings Menu */}
            {qualities.length > 0 && (
              <div className="relative">
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="p-1.5 rounded-lg hover:bg-white/10 transition text-zinc-300 hover:text-white"
                  title="Quality Settings"
                >
                  <Settings className="w-5 h-5" />
                </button>

                {showSettings && (
                  <div className="absolute bottom-10 right-0 bg-zinc-900/90 backdrop-blur-xl border border-white/10 rounded-xl p-2 min-w-[120px] shadow-2xl z-40 text-xs font-medium space-y-1">
                    <div className="px-2 py-1 text-zinc-400 text-[10px] uppercase font-bold tracking-wider">
                      Quality
                    </div>
                    <button
                      onClick={() => changeQuality(-1)}
                      className={`w-full text-left px-2 py-1.5 rounded-lg transition ${
                        currentQuality === -1 ? 'bg-pink-600 text-white font-semibold' : 'hover:bg-white/10 text-zinc-300'
                      }`}
                    >
                      Auto
                    </button>
                    {qualities.map((q) => (
                      <button
                        key={q.id}
                        onClick={() => changeQuality(q.id)}
                        className={`w-full text-left px-2 py-1.5 rounded-lg transition ${
                          currentQuality === q.id ? 'bg-pink-600 text-white font-semibold' : 'hover:bg-white/10 text-zinc-300'
                        }`}
                      >
                        {q.height}p
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* PiP */}
            <button
              onClick={togglePiP}
              className="p-1.5 rounded-lg hover:bg-white/10 transition text-zinc-300 hover:text-white"
              title="Picture in Picture"
            >
              <PictureInPicture2 className="w-5 h-5" />
            </button>

            {/* Fullscreen */}
            <button
              onClick={toggleFullscreen}
              className="p-1.5 rounded-lg hover:bg-white/10 transition text-zinc-300 hover:text-white"
              title="Fullscreen"
            >
              {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
