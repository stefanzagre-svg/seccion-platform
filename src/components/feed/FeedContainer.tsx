'use client';

import { useEffect, useRef, useState } from 'react';
import SwipeVideoPlayer from './SwipeVideoPlayer';
import { Loader2 } from 'lucide-react';

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
      <div className="w-full h-full flex flex-col items-center justify-center bg-black">
        <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
        <p className="text-white/60 font-bold uppercase tracking-widest text-sm">Loading Feed...</p>
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
