'use client';

import { useEffect, useRef, useState } from 'react';
import { Heart, Star, X, MessageCircle, Share2, Volume2, VolumeX, Play } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

interface SwipeVideoPlayerProps {
  video: {
    id: string;
    url: string; // Cloudflare Stream URL or standard MP4
    title: string;
    description: string;
    creator: {
      username: string;
      avatar: string;
    };
    likes: number;
    favorites: number;
  };
  isActive: boolean; // True if this video is currently snapped into view
  onLike?: () => void;
  onFavorite?: () => void;
  onSkip?: () => void;
}

export default function SwipeVideoPlayer({ 
  video, 
  isActive, 
  onLike, 
  onFavorite, 
  onSkip 
}: SwipeVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true); // Browsers require muted for autoplay
  
  const [isLiked, setIsLiked] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [likeCount, setLikeCount] = useState(video.likes);
  const [favCount, setFavCount] = useState(video.favorites);

  // Handle Play/Pause based on intersection observer (isActive prop)
  useEffect(() => {
    if (!videoRef.current) return;

    if (isActive) {
      // Play when snapped into view
      videoRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(err => {
        console.warn('Autoplay prevented:', err);
        setIsPlaying(false);
      });
    } else {
      // Pause and reset when scrolled out of view
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  }, [isActive]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
    if (onLike) onLike();
  };

  const handleFavorite = () => {
    setIsFavorited(!isFavorited);
    setFavCount(prev => isFavorited ? prev - 1 : prev + 1);
    if (onFavorite) onFavorite();
  };

  return (
    <div className="relative w-full h-full bg-black snap-start flex-shrink-0">
      
      {/* Video Element */}
      <video
        ref={videoRef}
        src={video.url}
        className="w-full h-full object-cover cursor-pointer"
        loop
        muted={isMuted}
        playsInline
        onClick={togglePlay}
      />

      {/* Play/Pause Overlay Indicator (shows briefly when clicked) */}
      <AnimatePresence>
        {!isPlaying && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.5 }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
          >
            <div className="w-20 h-20 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center">
              <Play className="w-10 h-10 text-white fill-white ml-2" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Gradient for readability */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black/80 to-transparent pointer-events-none" />

      {/* Bottom Gradient for readability */}
      <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none" />

      {/* Overlay: Bottom Left (Creator Info & Description) */}
      <div className="absolute bottom-6 left-4 right-16 z-10">
        <Link href={`/profile/${video.creator.username}`} className="flex items-center gap-3 mb-3 group w-fit">
          <div className="w-10 h-10 rounded-full border-2 border-primary overflow-hidden relative">
            <img src={video.creator.avatar} alt={video.creator.username} className="w-full h-full object-cover" />
          </div>
          <div>
            <h3 className="text-white font-bold text-base group-hover:text-primary transition">@{video.creator.username}</h3>
          </div>
        </Link>
        <p className="text-white/90 text-sm font-medium line-clamp-2">{video.title}</p>
        <p className="text-white/60 text-xs mt-1 line-clamp-2">{video.description}</p>
      </div>

      {/* Overlay: Right Sidebar (Action Buttons) */}
      <div className="absolute bottom-6 right-4 flex flex-col items-center gap-6 z-10">
        
        {/* Like */}
        <button onClick={handleLike} className="flex flex-col items-center gap-1 group">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${isLiked ? 'bg-red-500/20' : 'bg-black/40 backdrop-blur-md group-hover:bg-white/10'}`}>
            <Heart className={`w-6 h-6 transition-colors ${isLiked ? 'text-red-500 fill-red-500' : 'text-white'}`} />
          </div>
          <span className="text-white font-bold text-xs">{likeCount}</span>
        </button>

        {/* Favorite/Save */}
        <button onClick={handleFavorite} className="flex flex-col items-center gap-1 group">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${isFavorited ? 'bg-yellow-500/20' : 'bg-black/40 backdrop-blur-md group-hover:bg-white/10'}`}>
            <Star className={`w-6 h-6 transition-colors ${isFavorited ? 'text-yellow-500 fill-yellow-500' : 'text-white'}`} />
          </div>
          <span className="text-white font-bold text-xs">{favCount}</span>
        </button>

        {/* Skip/Pass */}
        <button onClick={onSkip} className="flex flex-col items-center gap-1 group">
          <div className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center group-hover:bg-red-500/20 transition-all">
            <X className="w-6 h-6 text-white group-hover:text-red-500" />
          </div>
          <span className="text-white font-bold text-xs uppercase tracking-wider">Pass</span>
        </button>

        {/* Mute Toggle */}
        <button onClick={() => setIsMuted(!isMuted)} className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center hover:bg-white/10 transition mt-4">
          {isMuted ? <VolumeX className="w-4 h-4 text-white" /> : <Volume2 className="w-4 h-4 text-white" />}
        </button>
      </div>

    </div>
  );
}
