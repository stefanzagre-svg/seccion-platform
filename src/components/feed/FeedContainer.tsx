'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import SwipeVideoPlayer from './SwipeVideoPlayer';
import { Video } from 'lucide-react';

interface FeedContainerProps {
  initialVideos: any[];
}

export default function FeedContainer({ initialVideos }: FeedContainerProps) {
  const [videos, setVideos] = useState(initialVideos);
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Implement IntersectionObserver to detect which video is currently snapped into view
  useEffect(() => {
    const options = {
      root: containerRef.current,
      rootMargin: '0px',
      threshold: 0.6, // Trigger when 60% of the video is in view
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // The data-index attribute helps us know which video just snapped into view
          const index = Number(entry.target.getAttribute('data-index'));
          setActiveIndex(index);
          
          // Optional: If we are near the end of the array, fetch more videos
          if (index === videos.length - 2) {
            // fetchMoreVideos();
          }
        }
      });
    }, options);

    // Observe all video containers
    const elements = document.querySelectorAll('.feed-video-container');
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [videos]);

  const handleSkip = (currentIndex: number) => {
    // Programmatically scroll to the next video
    if (containerRef.current) {
      const nextElement = containerRef.current.children[currentIndex + 1] as HTMLElement;
      if (nextElement) {
        nextElement.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  if (!videos || videos.length === 0) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-black px-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4 text-primary">
          <Video className="w-8 h-8" />
        </div>
        <h2 className="text-lg font-black uppercase tracking-wider text-white mb-2">No Video Drops Yet</h2>
        <p className="text-xs text-white/50 max-w-sm mb-6">
          Public creator video reels appear here once published and approved. Explore the live Discovery Feed in the meantime.
        </p>
        <Link
          href="/"
          className="px-6 py-3 rounded-xl bg-primary text-black text-xs font-black uppercase tracking-widest hover:opacity-90 transition"
        >
          Open Discovery Feed
        </Link>
      </div>
    );
  }

  return (
    // snap-y and snap-mandatory are the magic tailwind classes for TikTok style scrolling
    <div 
      ref={containerRef}
      className="w-full h-screen h-[100dvh] overflow-y-scroll snap-y snap-mandatory bg-black scrollbar-hide relative"
      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
    >
      {videos.map((video, index) => (
        <div 
          key={video.id} 
          data-index={index}
          className="feed-video-container w-full h-full snap-start relative"
        >
          <SwipeVideoPlayer 
            video={video} 
            isActive={activeIndex === index}
            onSkip={() => handleSkip(index)}
          />
        </div>
      ))}
    </div>
  );
}
