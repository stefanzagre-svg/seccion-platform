import React from 'react';

interface SeccionWordmarkProps {
  className?: string;
  variant?: 'cyan' | 'white' | 'dark' | 'current';
  alt?: string;
}

export default function SeccionWordmark({ 
  className = "h-6 inline-block object-contain", 
  variant = "cyan",
  alt = "SECCION"
}: SeccionWordmarkProps) {
  const imageSrc = variant === 'dark'
    ? '/assets/logo/seccion-official-wordmark-dark-transparent.png'
    : '/assets/logo/seccion-official-wordmark-transparent.png';

  return (
    <img 
      src={imageSrc} 
      alt={alt} 
      className={`${className} inline-block object-contain align-middle bg-transparent border-0 outline-none`}
      style={{ verticalAlign: 'middle', backgroundColor: 'transparent' }}
    />
  );
}
