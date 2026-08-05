'use client';

import { useEffect, useRef } from 'react';

class RevealParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
  size: number;
  color: string;
  angle: number;
  radius: number;
  speed: number;
  type: 'spark' | 'star';
  life: number;
  maxLife: number;

  constructor(cx: number, cy: number, type: 'spark' | 'star') {
    this.type = type;
    this.life = 0;
    this.maxLife = Math.random() * 80 + 40;

    if (type === 'spark') {
      this.x = cx;
      this.y = cy;
      const angle = Math.random() * Math.PI * 2;
      const velocity = Math.random() * 8 + 4;
      this.vx = Math.cos(angle) * velocity;
      this.vy = Math.sin(angle) * velocity;
      this.size = Math.random() * 3 + 2;
      this.alpha = 1;
      this.color = ['#06b6d4', '#ec4899', '#f43f5e', '#a855f7', '#ffffff'][Math.floor(Math.random() * 5)];
      this.angle = 0;
      this.radius = 0;
      this.speed = 0;
    } else {
      this.angle = Math.random() * Math.PI * 2;
      this.radius = Math.random() * 350 + 50;
      this.speed = (Math.random() * 0.008 + 0.002) * (Math.random() > 0.5 ? 1 : -1);
      this.x = cx + Math.cos(this.angle) * this.radius;
      this.y = cy + Math.sin(this.angle) * this.radius;
      this.vx = 0;
      this.vy = 0;
      this.size = Math.random() * 2 + 1;
      this.alpha = Math.random() * 0.7 + 0.3;
      this.color = '#06b6d4';
    }
  }

  update(cx: number, cy: number, cursor: { x: number; y: number }) {
    this.life++;
    if (this.type === 'spark') {
      this.x += this.vx;
      this.y += this.vy;
      this.vx *= 0.96;
      this.vy *= 0.96;
      this.alpha = Math.max(0, 1 - this.life / this.maxLife);
    } else {
      this.angle += this.speed;
      const targetX = cx + Math.cos(this.angle) * this.radius;
      const targetY = cy + Math.sin(this.angle) * this.radius;

      const dx = cursor.x - this.x;
      const dy = cursor.y - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 120 && dist > 0) {
        const force = (120 - dist) / 120;
        this.x -= (dx / dist) * force * 6;
        this.y -= (dy / dist) * force * 6;
      } else {
        this.x += (targetX - this.x) * 0.05;
        this.y += (targetY - this.y) * 0.05;
      }
      this.alpha = 0.3 + Math.sin(this.life * 0.05) * 0.3;
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.fillStyle = this.color;
    ctx.shadowBlur = this.type === 'spark' ? 12 : 6;
    ctx.shadowColor = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

export default function MatchParticleCanvas({ isActive }: { isActive: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<RevealParticle[]>([]);
  const animFrameId = useRef<number | null>(null);

  useEffect(() => {
    if (!isActive) {
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
      particlesRef.current = [];
      return;
    }

    // Performance check: disable particle loop if reduced motion is preferred
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const cursor = { x: cx, y: cy };

    // Reduced count for smooth 60fps performance on mobile
    const starCount = 35;
    const sparkCount = 45;

    for (let i = 0; i < starCount; i++) {
      particlesRef.current.push(new RevealParticle(cx, cy, 'star'));
    }
    for (let i = 0; i < sparkCount; i++) {
      particlesRef.current.push(new RevealParticle(cx, cy, 'spark'));
    }

    const renderLoop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const particles = particlesRef.current;

      // Update and draw all particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.update(cx, cy, cursor);
        p.draw(ctx);
        if (p.type === 'spark' && p.life >= p.maxLife) {
          particles.splice(i, 1);
        }
      }

      if (Math.random() < 0.1) {
        particles.push(new RevealParticle(cx, cy, 'spark'));
      }

      animFrameId.current = requestAnimationFrame(renderLoop);
    };

    renderLoop();

    return () => {
      window.removeEventListener('resize', resize);
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
    };
  }, [isActive]);

  if (!isActive) return null;

  return <canvas ref={canvasRef} className="absolute inset-0 z-0 pointer-events-none" />;
}
