'use client';

import { useState, useEffect } from 'react';
import { Calendar, Clock, ArrowRight, Play, Users } from 'lucide-react';
import Link from 'next/link';

interface EventCardProps {
  id: string;
  type: 'live' | 'upcoming' | 'drop';
  title: string;
  creatorName: string;
  creatorAvatar: string;
  thumbnailUrl: string;
  targetDate: string; // ISO string
  viewerCount?: number;
}

export default function EventCard({ id, type, title, creatorName, creatorAvatar, thumbnailUrl, targetDate, viewerCount }: EventCardProps) {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    if (type === 'live') return;

    const calculateTimeLeft = () => {
      const difference = new Date(targetDate).getTime() - new Date().getTime();
      
      if (difference > 0) {
        setTimeLeft({
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [targetDate, type]);

  const isLive = type === 'live';

  return (
    <div className="group relative rounded-3xl overflow-hidden bg-[#111] border border-white/10 transition-all hover:border-primary/50 hover:shadow-[0_0_30px_rgba(102,252,241,0.15)] h-[400px] flex flex-col">
      
      {/* Thumbnail Area */}
      <div className="relative h-[60%] w-full overflow-hidden">
        <img 
          src={thumbnailUrl} 
          alt={title} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#111] via-transparent to-black/50" />
        
        {/* Status Badge */}
        <div className="absolute top-4 left-4">
          {isLive ? (
            <div className="bg-red-500 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full flex items-center gap-2">
              <span className="animate-pulse w-1.5 h-1.5 bg-white rounded-full" />
              Live Now
            </div>
          ) : (
            <div className="bg-white/10 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border border-white/20">
              {type === 'drop' ? 'Exclusive Drop' : 'Upcoming Stream'}
            </div>
          )}
        </div>

        {/* Viewers (If Live) */}
        {isLive && viewerCount && (
          <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5">
            <Users className="w-3 h-3" />
            {viewerCount.toLocaleString()}
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className="p-5 flex flex-col flex-1 justify-between relative">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <img src={creatorAvatar} alt={creatorName} className="w-8 h-8 rounded-full border border-white/20" />
            <span className="text-white/60 text-sm font-bold">{creatorName}</span>
          </div>
          <h3 className="text-xl font-bold text-white leading-tight line-clamp-2 group-hover:text-primary transition-colors">
            {title}
          </h3>
        </div>

        <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
          {isLive ? (
            <Link 
              href={`/pulse/live/${id}`}
              className="w-full py-3 bg-primary text-black font-black uppercase tracking-wider text-sm rounded-xl hover:bg-primary/90 transition text-center flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4" /> Join Stream
            </Link>
          ) : (
            <>
              {/* Countdown */}
              <div className="flex items-center gap-2 text-white font-['JetBrains_Mono']">
                <Clock className="w-4 h-4 text-primary" />
                <span className="text-sm">
                  {String(timeLeft.hours).padStart(2, '0')}:
                  {String(timeLeft.minutes).padStart(2, '0')}:
                  {String(timeLeft.seconds).padStart(2, '0')}
                </span>
              </div>
              <button className="text-white text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition">
                Notify Me
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
