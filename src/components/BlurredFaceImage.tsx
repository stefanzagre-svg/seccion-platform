'use client';

import React, { useId } from 'react';
import { isFaceBlurRequired } from '@/lib/relationship-engine';
import { Lock } from 'lucide-react';

export interface FaceCoordinates {
  x: number; // 0.0 to 1.0 (horizontal center)
  y: number; // 0.0 to 1.0 (vertical center)
  r: number; // 0.0 to 1.0 (radius of the face)
}

interface BlurredFaceImageProps {
  src?: string;
  alt?: string;
  children?: React.ReactNode;
  className?: string;
  imgClassName?: string;
  sharedScore: number;
  faceCoordinates?: FaceCoordinates | null;
  isEnabledByOwner?: boolean;
}

export default function BlurredFaceImage({
  src,
  alt,
  children,
  className = '',
  imgClassName = '',
  sharedScore,
  faceCoordinates,
  isEnabledByOwner = false,
}: BlurredFaceImageProps) {
  const isBlurred = isFaceBlurRequired(sharedScore, isEnabledByOwner);
  const rawId = useId();
  // Safe SVG ID without colons
  const maskId = `face-mask-${rawId.replace(/:/g, '-')}`;
  const gradientId = `face-grad-${rawId.replace(/:/g, '-')}`;

  // Default coordinate fallback (upper-center face region)
  const coords = faceCoordinates || { x: 0.5, y: 0.38, r: 0.18 };

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Base Layer: Render children if present, otherwise render the <img> */}
      {children ? children : (
        <img
          src={src}
          alt={alt || ''}
          className={`w-full h-full object-cover ${imgClassName}`}
        />
      )}

      {/* SVG Face-Blur Overlay */}
      {isBlurred && (
        <>
          <svg className="absolute inset-0 w-full h-full pointer-events-none" width="100%" height="100%">
            <defs>
              <radialGradient
                id={gradientId}
                cx={`${coords.x * 100}%`}
                cy={`${coords.y * 100}%`}
                r={`${coords.r * 100}%`}
              >
                <stop offset="0%" stopColor="white" stopOpacity="1" />
                <stop offset="55%" stopColor="white" stopOpacity="0.85" />
                <stop offset="100%" stopColor="white" stopOpacity="0" />
              </radialGradient>
              <mask id={maskId}>
                {/* Everything white is fully opaque, black is transparent */}
                <rect width="100%" height="100%" fill="black" />
                {/* Face area where the blur will be visible */}
                <circle
                  cx={`${coords.x * 100}%`}
                  cy={`${coords.y * 100}%`}
                  r={`${coords.r * 100}%`}
                  fill={`url(#${gradientId})`}
                />
              </mask>
            </defs>
          </svg>

          {/* Backdrop-blur overlay layer, masked to the face coordinates */}
          <div
            className="absolute inset-0 w-full h-full backdrop-blur-xl bg-black/5 pointer-events-none transition-all duration-700"
            style={{
              mask: `url(#${maskId})`,
              WebkitMask: `url(#${maskId})`,
            }}
          />

          {/* Micro-interaction: Hover/Info Indicator */}
          <div className="absolute inset-0 bg-transparent hover:bg-black/10 transition-colors duration-300 flex items-center justify-center group/blur">
            <div className="opacity-0 group-hover/blur:opacity-100 transition-opacity duration-300 scale-95 group-hover/blur:scale-100 flex flex-col items-center gap-1.5 px-3 py-1.5 rounded-xl border border-primary/20 bg-black/85 backdrop-blur-md shadow-[0_0_20px_rgba(102,252,241,0.25)] select-none">
              <div className="flex items-center gap-1 text-[9px] font-black text-primary uppercase tracking-widest">
                <Lock className="w-3 h-3 animate-pulse" />
                <span>Face Encrypted</span>
              </div>
              <p className="text-[7px] text-white/50 font-bold uppercase tracking-widest">
                Reach L3 (Friendly) to unlock
              </p>
            </div>

            {/* Tiny tag showing face blur active status */}
            <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-md border border-white/10 rounded-full px-2 py-0.5 text-[7px] font-black uppercase tracking-wider text-primary/80 flex items-center gap-1 select-none pointer-events-none group-hover/blur:opacity-0 transition-opacity duration-300">
              <span className="w-1 h-1 rounded-full bg-primary/80 animate-pulse" />
              <span>Incognito</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
