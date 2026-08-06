import React from 'react';

interface SeccionWordmarkProps {
  className?: string;
  variant?: 'cyan' | 'white' | 'dark' | 'current';
}

export default function SeccionWordmark({ 
  className = "h-6 inline-block", 
  variant = "cyan" 
}: SeccionWordmarkProps) {
  const strokeColor = variant === 'dark' 
    ? '#050505' 
    : variant === 'white' 
    ? '#FFFFFF' 
    : variant === 'current' 
    ? 'currentColor' 
    : '#00fbfb';
    
  const slashColor = variant === 'dark' 
    ? '#050505' 
    : '#EC4899';

  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 180 40" 
      className={className} 
      fill="none"
      style={{ verticalAlign: 'middle' }}
    >
      {variant === 'cyan' && (
        <defs>
          <filter id="wm-cyan-glow-inline" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="1.2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
      )}

      {/* Clean Transparent SECCION Wordmark Vector */}
      <g 
        stroke={strokeColor} 
        strokeWidth="2.5" 
        strokeLinecap="round" 
        strokeLinejoin="round"
        filter={variant === 'cyan' ? "url(#wm-cyan-glow-inline)" : undefined}
      >
        {/* 'S' */}
        <path d="M 24 13 C 24 10 20 8 16 8 C 11 8 8 11 8 15 C 8 21 24 21 24 27 C 24 31 20 34 14 34 C 9 34 7 31 7 28" />
        {/* 'E' */}
        <path d="M 46 8 L 33 8 L 33 34 L 46 34 M 33 21 L 43 21" />
        {/* 'C' */}
        <path d="M 67 12 C 64 9 59 8 54 8 C 47 8 43 13 43 21 C 43 29 47 34 54 34 C 60 34 65 31 67 27" />
        {/* 'C' */}
        <path d="M 89 12 C 86 9 81 8 76 8 C 69 8 65 13 65 21 C 65 29 69 34 76 34 C 82 34 87 31 89 27" />
        {/* 'I' */}
        <path d="M 98 8 L 98 34 M 93 8 L 103 8 M 93 34 L 103 34" />
        {/* Orbital 'O' Circle */}
        <ellipse cx="121" cy="21" rx="10" ry="13" />
        {/* 'N' */}
        <path d="M 143 34 L 143 8 L 163 34 L 163 8" />
      </g>

      {/* Pink/Dark Slash Through 'O' */}
      <path 
        d="M 107 35 L 135 7" 
        stroke={slashColor} 
        strokeWidth="2.8" 
        strokeLinecap="round" 
      />
    </svg>
  );
}
