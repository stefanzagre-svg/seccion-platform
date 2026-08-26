'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Flag, Zap, Lock, Play, Layers, Camera, Heart, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import BlurredFaceImage from '@/components/BlurredFaceImage';
import ProvenanceBadge from '@/components/ProvenanceBadge';
import { type ProvenanceLevel } from '@/lib/content-provenance';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/context/LanguageContext';

export interface FeedPostItem {
  id: string;
  creator: string;
  creator_id: string;
  avatar_url?: string;
  ratingScore?: number;
  timestamp: string;
  provenance_level?: ProvenanceLevel;
  matchScore: number;
  matchResult?: {
    explanation?: Array<{
      factor: string;
      impact: 'positive' | 'negative' | 'neutral';
      score: number;
      description: string;
    }>;
  } | null;
  locked: boolean;
  type: string;
  image: string;
  teaser_type?: 'none' | 'video_clip' | 'main_photo' | 'custom';
  video_start_time?: number;
  thumbnail_url?: string;
  thumbnail_type?: 'photo' | 'video';
  media_type?: 'video' | 'album' | 'photo';
  video_duration?: string;
  album_name?: string;
  album_count?: number;
  face_blur_active?: boolean;
  avatar_face_coordinates?: { x: number; y: number; r: number };
  content: string;
  isMatched?: boolean;
}

interface FeedCardSwiperProps {
  post: FeedPostItem;
  optimisticLiked: boolean;
  onToggleLike: (postId: string) => void;
  onUnlockPpv: (postId: string) => void;
  onOpenPaywallModal?: (post: FeedPostItem) => void;
  onReport: (content: { id: string; type: 'platform_content' }) => void;
  onLogClick?: (postId: string, creatorId: string) => void;
}

export default function FeedCardSwiper({
  post,
  optimisticLiked,
  onToggleLike,
  onUnlockPpv,
  onOpenPaywallModal,
  onReport,
  onLogClick
}: FeedCardSwiperProps) {
  const router = useRouter();
  const { locale } = useTranslation();

  const handleCardClick = () => {
    if (onLogClick) {
      onLogClick(post.id, post.creator_id);
    }
  };

  const handleProfileClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/profile/${post.creator_id}`);
  };

  const handleUnlockClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (post.type === 'ppv') {
      onUnlockPpv(post.id);
    } else if (onOpenPaywallModal) {
      onOpenPaywallModal(post);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      onClick={handleCardClick}
      className="bg-white/[0.02] border border-white/5 p-2 rounded-[2.5rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)] backdrop-blur-xl hover:scale-[1.01] hover:border-primary/25 hover:shadow-[0_0_30px_rgba(102,252,241,0.15)] transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] cursor-pointer group flex flex-col justify-between"
    >
      <div className="bg-black/40 border border-white/5 rounded-[2rem] p-5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] h-full flex flex-col justify-between overflow-hidden">
        
        {/* Creator Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div 
              onClick={handleProfileClick}
              className="w-10 h-10 rounded-2xl bg-white/10 border border-white/10 overflow-hidden shadow-inner relative cursor-pointer hover:border-primary/40 transition"
              title="View Profile Details"
            >
              <BlurredFaceImage
                src={post.avatar_url}
                alt="Avatar"
                sharedScore={post.matchScore}
                isEnabledByOwner={post.face_blur_active}
                faceCoordinates={post.avatar_face_coordinates}
                className="w-full h-full"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p 
                  onClick={handleProfileClick}
                  className="font-black text-sm tracking-tight hover:text-primary transition cursor-pointer text-white"
                  title="View Profile Details"
                >
                  @{post.creator}
                </p>
                <span className="text-[9px] font-bold text-yellow-500 bg-yellow-500/10 px-1.5 py-0.5 rounded border border-yellow-500/20 shrink-0">
                  ⭐ {post.ratingScore?.toFixed(2) || '10.00'}
                </span>
              </div>
              <p className="text-[10px] text-muted-foreground opacity-60 flex items-center gap-1">
                <Clock className="w-2.5 h-2.5" /> {post.timestamp}
              </p>
              <ProvenanceBadge
                level={(post.provenance_level as ProvenanceLevel) || 'genuine'}
                creatorName={post.creator}
                size="sm"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={(e) => { 
                e.stopPropagation(); 
                onReport({ id: post.id, type: 'platform_content' }); 
              }} 
              className="p-1.5 bg-white/5 hover:bg-[#dc143c]/20 text-white/40 hover:text-[#dc143c] rounded-full transition-colors group/report cursor-pointer"
              title="Report Post"
            >
              <Flag className="w-3 h-3 group-hover/report:fill-current" />
            </button>
          </div>
        </div>
        
        {/* Media Container with Badges */}
        <div className="relative mx-1.5">
          {/* Synergy match percentage badge overlay */}
          <div className="absolute top-3 right-3 z-30">
            <div className="relative group/tooltip">
              <div className="px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-tighter flex items-center gap-1.5 bg-black/75 backdrop-blur-md text-primary border border-primary/20 hover:bg-black/90 transition cursor-help shadow-lg select-none">
                <Zap className="w-2.5 h-2.5 fill-current animate-pulse text-primary" />
                {post.matchScore}% Synergy
              </div>
              
              {/* Tooltip breakdown */}
              {post.matchResult?.explanation && (
                <div className="absolute top-full right-0 mt-2 w-72 p-4 bg-black/95 backdrop-blur-2xl border border-white/15 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] opacity-0 pointer-events-none group-hover/tooltip:opacity-100 transition-opacity duration-300 z-50 text-left font-sans font-medium">
                  <div className="flex justify-between items-center border-b border-white/5 pb-2 mb-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-white">Synergy Breakdown</span>
                    <span className="text-[10px] font-black text-primary">{post.matchScore}%</span>
                  </div>
                  
                  <div className="space-y-2.5">
                    {post.matchResult.explanation.map((exp, idx) => (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between items-center text-[8px] font-black uppercase tracking-wider">
                          <span className="text-white/85">{exp.factor}</span>
                          <span className={exp.impact === 'positive' ? 'text-primary' : exp.impact === 'negative' ? 'text-destructive' : 'text-white/45'}>
                            {exp.score}%
                          </span>
                        </div>
                        {/* compatibility progress bar */}
                        <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${exp.impact === 'positive' ? 'bg-primary shadow-[0_0_5px_rgba(102,252,241,0.5)]' : exp.impact === 'negative' ? 'bg-destructive' : 'bg-white/20'}`}
                            style={{ width: `${exp.score}%` }}
                          />
                        </div>
                        <p className="text-[8px] text-white/50 leading-relaxed font-semibold">
                          {exp.description}
                        </p>
                      </div>
                    ))}
                  </div>
                  
                  <div className="border-t border-white/5 pt-2 mt-2 text-[7px] text-white/30 uppercase tracking-widest font-black text-center">
                    Secure ZKP verified signals
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Main media element */}
          <div className="relative aspect-[3/4] overflow-hidden rounded-2xl border border-white/5 shadow-2xl bg-black/40">
            {post.locked ? (
              <>
                {/* Teaser Content */}
                {post.teaser_type === 'main_photo' && (
                  <img 
                    src={post.image} 
                    alt="Teaser Preview" 
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-[1.2s] ease-[cubic-bezier(0.32,0.72,0,1)]"
                  />
                )}
                {post.teaser_type === 'video_clip' && (
                  <video 
                    src={`${post.image}#t=${post.video_start_time || 0},${Number(post.video_start_time || 0) + 5}`}
                    autoPlay 
                    loop 
                    muted 
                    playsInline 
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-[1.2s] ease-[cubic-bezier(0.32,0.72,0,1)]"
                  />
                )}
                {post.teaser_type === 'custom' && post.thumbnail_url && (
                  post.thumbnail_type === 'video' ? (
                    <video 
                      src={post.thumbnail_url} 
                      autoPlay 
                      loop 
                      muted 
                      playsInline 
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-[1.2s] ease-[cubic-bezier(0.32,0.72,0,1)]"
                    />
                  ) : (
                    <img 
                      src={post.thumbnail_url} 
                      alt="Teaser Preview" 
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-[1.2s] ease-[cubic-bezier(0.32,0.72,0,1)]"
                    />
                  )
                )}
                {(post.teaser_type === 'none' || !post.teaser_type) && (
                  <BlurredFaceImage
                    src={post.image}
                    alt="Content"
                    sharedScore={post.matchScore}
                    isEnabledByOwner={post.face_blur_active}
                    faceCoordinates={post.avatar_face_coordinates || { x: 0.5, y: 0.4, r: 0.22 }}
                    className="w-full h-full"
                    imgClassName="w-full h-full blur-3xl opacity-30 grayscale transition duration-700"
                  />
                )}

                {/* Gated Lock Screen Overlay */}
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/75 backdrop-blur-[12px] p-6 text-center border border-white/5 animate-fade-in">
                  <div className="w-12 h-12 bg-white/[0.03] border border-white/10 rounded-2xl flex items-center justify-center mb-3 shadow-inner">
                    <Lock className="w-5 h-5 text-primary drop-shadow-[0_0_10px_rgba(102,252,241,0.4)] animate-pulse" />
                  </div>
                  <h3 className="text-xs font-black mb-1 tracking-wider uppercase text-white">
                    {post.type === 'ppv' ? (locale === 'es' ? 'Contenido Pay-Per-View' : 'Pay-Per-View Content') : (locale === 'es' ? 'Contenido con Restricción de Nivel' : 'Tier Restricted Content')}
                  </h3>
                  <p className="text-[8px] text-white/40 mb-4 max-w-[180px] uppercase leading-relaxed font-black tracking-widest">
                    {post.type === 'ppv' 
                      ? (locale === 'es' ? 'Compra para desbloquear este clip' : 'Purchase to unlock this exclusive clip') 
                      : (locale === 'es' ? `Reservado para patrocinadores ${post.type}` : `Gated for ${post.type} tier sponsors`)}
                  </p>
                  {post.type === 'ppv' ? (
                    <button 
                      onClick={handleUnlockClick}
                      className="px-4 py-2 bg-primary text-black text-[9px] font-black uppercase tracking-widest rounded-xl hover:shadow-[0_0_15px_rgba(102,252,241,0.4)] transition duration-300 scale-100 active:scale-95 cursor-pointer"
                    >
                      {locale === 'es' ? 'Desbloquear Post ($4.99)' : 'Unlock Post ($4.99)'}
                    </button>
                  ) : (
                    <button 
                      onClick={handleUnlockClick}
                      className="px-4 py-2 bg-primary text-black text-[9px] font-black uppercase tracking-widest rounded-xl hover:shadow-[0_0_15px_rgba(102,252,241,0.4)] transition duration-300 cursor-pointer"
                    >
                      {locale === 'es' ? 'Mejorar y Desbloquear' : 'Upgrade & Unlock'}
                    </button>
                  )}
                </div>
              </>
            ) : (
              // Unlocked state (regular full view)
              <BlurredFaceImage
                src={post.image}
                alt="Content"
                sharedScore={post.matchScore}
                isEnabledByOwner={post.face_blur_active}
                faceCoordinates={post.avatar_face_coordinates || { x: 0.5, y: 0.4, r: 0.22 }}
                className="w-full h-full"
                imgClassName="group-hover:scale-105 transition duration-[1.2s] ease-[cubic-bezier(0.32,0.72,0,1)]"
              />
            )}
            
            {/* Media Type Overlay Badge */}
            {post.media_type && (
              <div className="absolute top-3 left-3 z-30 flex items-center gap-1.5 px-2.5 py-1 bg-black/70 backdrop-blur-md text-white/90 border border-white/10 rounded-xl text-[8px] font-black uppercase tracking-wider shadow-md select-none">
                {post.media_type === 'video' && (
                  <>
                    <Play className="w-2.5 h-2.5 fill-current text-primary" />
                    <span>Video {post.video_duration && `• ${post.video_duration}`}</span>
                  </>
                )}
                {post.media_type === 'album' && (
                  <>
                    <Layers className="w-2.5 h-2.5 text-yellow-500 animate-pulse" />
                    <span className="max-w-[120px] truncate">
                      Album {post.album_name ? `: ${post.album_name}` : ''} {post.album_count && `• ${post.album_count} Photos`}
                    </span>
                  </>
                )}
                {post.media_type === 'photo' && (
                  <>
                    <Camera className="w-2.5 h-2.5 text-accent" />
                    <span>Photo</span>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
        
        {/* Caption & Footer Interaction Row */}
        <div className="pt-4 px-2">
          <p className="text-white/80 text-sm mb-4 leading-relaxed font-medium">"{post.content}"</p>
          <div className="flex items-center justify-between text-muted-foreground border-t border-white/5 pt-4">
            <div className="flex gap-6">
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onToggleLike(post.id);
                }}
                className={cn(
                  "flex items-center gap-2 transition group/btn cursor-pointer",
                  optimisticLiked ? "text-primary" : "hover:text-primary"
                )}
              >
                <Heart className={cn(
                  "w-5 h-5 transition",
                  optimisticLiked ? "fill-current group-hover/btn:scale-110" : "group-hover/btn:scale-110"
                )} /> 
                <span className="text-[10px] font-black text-white">
                  {124 + (optimisticLiked ? 1 : 0)}
                </span>
              </button>
            </div>
            {post.isMatched ? (
              <Link 
                href={`/messages?id=${post.creator_id}`} 
                onClick={(e) => e.stopPropagation()}
                className="px-6 py-2 bg-primary text-black rounded-xl text-[10px] font-black uppercase tracking-widest text-center shadow-md hover:brightness-110 transition"
              >
                {locale === 'es' ? 'Chatear' : 'Chat Now'}
              </Link>
            ) : (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleLike(post.id);
                }}
                className="text-[9px] font-black text-white/30 hover:text-white uppercase tracking-widest cursor-pointer"
              >
                {locale === 'es' ? 'Compartir Pulso' : 'Share Pulse'}
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
