'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, SlidersHorizontal, Trophy, ShieldCheck, Activity, 
  Send, Zap, Sparkles, MessageSquare, Plus, Check, Tv 
} from 'lucide-react';
import { calculateMatch, type UserProfile } from '@/lib/match-engine';
import { supabase } from '@/lib/supabase';
import { updateRelationshipScore } from '@/lib/relationship-db';

interface LivePulseHubProps {
  currentUser: UserProfile & { id: string; username?: string };
  candidateProfile: UserProfile & { id: string; name: string; avatar: string };
  onLock: () => void;
}

// Particle Helper Class for Canvas Animation
class Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
  size: number;
  emoji: string;
  rotation: number;
  rotationSpeed: number;

  constructor(canvasWidth: number, canvasHeight: number, emoji: string) {
    this.x = canvasWidth / 2 + (Math.random() - 0.5) * 80;
    this.y = canvasHeight - 20;
    this.vx = (Math.random() - 0.5) * 4;
    this.vy = -Math.random() * 5 - 3;
    this.alpha = 1;
    this.size = Math.random() * 12 + 16;
    this.emoji = emoji;
    this.rotation = Math.random() * 360;
    this.rotationSpeed = (Math.random() - 0.5) * 5;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.vy += 0.05; // slight gravity
    this.alpha -= 0.012;
    this.rotation += this.rotationSpeed;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.globalAlpha = Math.max(this.alpha, 0);
    ctx.translate(this.x, this.y);
    ctx.rotate((this.rotation * Math.PI) / 180);
    ctx.font = `${this.size}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.emoji, 0, 0);
    ctx.restore();
  }
}

export default function LivePulseHub({ currentUser, candidateProfile, onLock }: LivePulseHubProps) {
  const [isLive, setIsLive] = useState(false);
  const [messages, setMessages] = useState<Array<{ user: string; msg: string; type: string }>>([
    { user: candidateProfile.name, msg: 'Connecting to live pulse stream...', type: 'system' },
  ]);
  const [inputText, setInputText] = useState('');
  const [showHudDetails, setShowHudDetails] = useState(false);
  
  // Interactive poll state
  const [poll, setPoll] = useState({
    question: 'Choose next topic:',
    options: [
      { id: 'a', text: 'Archetype Insights', votes: 12 },
      { id: 'b', text: 'IRL Adventure plans', votes: 8 },
      { id: 'c', text: 'Live Q&A Session', votes: 15 },
    ],
    userVoted: null as string | null
  });

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationFrameRef = useRef<number | null>(null);
  const channelRef = useRef<any>(null);

  const matchVal = calculateMatch(currentUser, candidateProfile);

  // Supabase Realtime broadcast subscription hook
  useEffect(() => {
    const channelId = `stream_broadcast:${candidateProfile.id || 'elena'}`;
    const channel = supabase.channel(channelId, {
      config: {
        broadcast: { self: false }
      }
    });

    channel
      .on('broadcast', { event: 'stream_status' }, ({ payload }) => {
        setIsLive(payload.isLive);
        setMessages(prev => [
          ...prev,
          { 
            user: 'System', 
            msg: payload.isLive ? 'Host went LIVE! 🔥' : 'Host went offline.', 
            type: 'system' 
          }
        ]);
      })
      .on('broadcast', { event: 'chat_message' }, ({ payload }) => {
        setMessages(prev => [...prev, payload]);
      })
      .on('broadcast', { event: 'poll_created' }, ({ payload }) => {
        setPoll({
          question: payload.question,
          options: payload.options,
          userVoted: null
        });
      })
      .on('broadcast', { event: 'poll_updated' }, ({ payload }) => {
        setPoll(prev => ({
          ...prev,
          options: payload.options
        }));
      })
      .on('broadcast', { event: 'tip_sent' }, ({ payload }) => {
        triggerPulseBurst(payload.emoji);
        setMessages(prev => [
          ...prev,
          { user: payload.user, msg: `sent a ${payload.name} tip (${payload.cost} pts)! ${payload.emoji}`, type: 'system' }
        ]);
      });

    channel.subscribe((status) => {
      console.log(`LivePulseHub Realtime Sub: ${channelId} -`, status);
      if (status === 'SUBSCRIBED') {
        // Ping the host asking for status on connection
        channel.send({
          type: 'broadcast',
          event: 'member_joined',
          payload: {}
        });
      }
    });

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
    };
  }, [candidateProfile.id]);

  // Canvas particle loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions
    const resizeCanvas = () => {
      canvas.width = canvas.parentElement?.clientWidth || 600;
      canvas.height = canvas.parentElement?.clientHeight || 340;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    let tick = 0;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      tick++;

      // Draw audio wave visualizer curves if the creator is live
      if (isLive) {
        ctx.strokeStyle = 'rgba(255, 0, 127, 0.4)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let x = 0; x < canvas.width; x++) {
          const y = canvas.height / 2 + 
            Math.sin(x * 0.01 + tick * 0.05) * 25 * Math.sin(x * 0.002) +
            Math.sin(x * 0.03 + tick * 0.1) * 8;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        ctx.strokeStyle = 'rgba(0, 240, 255, 0.3)';
        ctx.beginPath();
        for (let x = 0; x < canvas.width; x++) {
          const y = canvas.height / 2 + 
            Math.cos(x * 0.008 + tick * 0.04) * 20 * Math.cos(x * 0.003) +
            Math.cos(x * 0.02 + tick * 0.08) * 6;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      const particles = particlesRef.current;

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.update();
        p.draw(ctx);
        if (p.alpha <= 0) {
          particles.splice(i, 1);
        }
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isLive]);

  // Spawn particle burst
  const triggerPulseBurst = (emoji: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    for (let i = 0; i < 15; i++) {
      particlesRef.current.push(new Particle(canvas.width, canvas.height, emoji));
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const username = currentUser.username || 'Alex_N';
    const payload = { user: username, msg: inputText, type: 'vip' };

    setMessages(prev => [
      ...prev,
      { user: 'You', msg: inputText, type: 'you' }
    ]);
    setInputText('');

    if (channelRef.current) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'chat_message',
        payload
      });
    }
  };

  const handleVote = (optionId: string) => {
    if (poll.userVoted) return;

    setPoll(prev => {
      const updatedOptions = prev.options.map(opt => 
        opt.id === optionId ? { ...opt, votes: opt.votes + 1 } : opt
      );

      if (channelRef.current) {
        channelRef.current.send({
          type: 'broadcast',
          event: 'poll_voted',
          payload: { optionId }
        });
      }

      return {
        ...prev,
        userVoted: optionId,
        options: updatedOptions
      };
    });

    triggerPulseBurst('🗳️');
  };

  const sendTip = async (name: string, cost: number, emoji: string) => {
    const username = currentUser.username || 'Alex_N';
    
    setMessages(prev => [
      ...prev,
      { user: 'System', msg: `You sent a ${name} tip (${cost} pts)!`, type: 'system' }
    ]);
    triggerPulseBurst(emoji);

    // Call database update interaction before broadcasting
    try {
      await updateRelationshipScore(currentUser.id, candidateProfile.id, 'live_tip');
    } catch (err) {
      console.error('Failed to update relationship score for tip:', err);
    }

    if (channelRef.current) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'tip_sent',
        payload: { user: username, name, cost, emoji }
      });
    }
  };

  const totalVotes = poll.options.reduce((sum, opt) => sum + opt.votes, 0);

  return (
    <div className="space-y-8">
      {/* Stream Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Stream viewport */}
        <div className="lg:col-span-2 relative aspect-video rounded-[2.5rem] overflow-hidden bg-black border border-white/5 shadow-2xl group flex flex-col justify-end">
          
          {/* Simulated stream video background (pulsing Unsplash source image) */}
          <div className="absolute inset-0">
            <img 
              src="https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=1200&q=80" 
              alt="Live video" 
              className="w-full h-full object-cover opacity-80"
            />
            {/* Ambient glowing radial mask */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/30 pointer-events-none" />
            <div className="absolute inset-0 bg-primary/5 mix-blend-overlay animate-pulse pointer-events-none" />
          </div>

          {!isLive && (
            <div className="absolute inset-0 bg-black/85 backdrop-blur-xl z-30 flex flex-col items-center justify-center p-6 text-center">
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full w-20 h-20 -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2" />
                <Tv className="w-12 h-12 text-white/30 relative z-10 animate-pulse" />
              </div>
              <h3 className="text-sm font-black tracking-[0.2em] text-white uppercase mb-2">
                Pulse Room Offline
              </h3>
              <p className="text-[9px] font-bold text-white/50 max-w-xs uppercase tracking-wider leading-relaxed">
                {candidateProfile.name} is currently preparing the next interactive match alignment. Stay tuned...
              </p>
            </div>
          )}

          {/* Interactive particles overlay canvas */}
          <canvas ref={canvasRef} className="absolute inset-0 z-10 pointer-events-none" />

          {/* Floating Compatibility HUD */}
          <div className="absolute top-6 left-6 z-20">
            <div className="relative">
              <button 
                onClick={() => setShowHudDetails(!showHudDetails)}
                className="px-4 py-2 bg-black/60 hover:bg-black/80 backdrop-blur-xl rounded-2xl border border-white/10 flex items-center gap-2 transition"
              >
                <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-ping" />
                <span className="text-[10px] font-black text-white tracking-widest uppercase">
                  {candidateProfile.name} • {matchVal.totalScore}% COMPATIBLE
                </span>
              </button>

              <AnimatePresence>
                {showHudDetails && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute top-12 left-0 w-72 bg-black/90 backdrop-blur-2xl border border-white/10 p-5 rounded-3xl z-30 shadow-2xl"
                  >
                    <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3">
                      <div>
                        <h4 className="text-xs font-black uppercase text-white tracking-widest">
                          Compatibility HUD
                        </h4>
                        <p className="text-[8px] font-black text-primary uppercase tracking-widest mt-0.5">
                          Tier: {matchVal.compatibilityTier.replace('_', ' ')}
                        </p>
                      </div>
                      <span className="text-xl font-black text-primary">{matchVal.totalScore}%</span>
                    </div>

                    <div className="space-y-2.5">
                      {Object.entries(matchVal.breakdown).map(([key, val]) => (
                        <div key={key}>
                          <div className="flex justify-between text-[8px] font-black uppercase tracking-wider text-white/50 mb-1">
                            <span>{key.replace(/([A-Z])/g, ' $1')}</span>
                            <span>{Math.round(val * 100)}%</span>
                          </div>
                          <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-primary" 
                              style={{ width: `${val * 100}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="border-t border-white/10 mt-4 pt-3 text-left">
                      <p className="text-[9px] text-white/60 font-medium leading-relaxed">
                        {matchVal.tierReason}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="absolute top-6 right-6 z-20 flex gap-2">
            <div className="px-3 py-1.5 bg-black/60 backdrop-blur-xl rounded-xl border border-white/10 text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 text-white/80">
              <Users className="w-3.5 h-3.5 text-accent" /> 1,420
            </div>
            <button 
              onClick={onLock}
              className="px-3 py-1.5 bg-black/60 hover:bg-red-500/20 backdrop-blur-xl rounded-xl border border-white/10 text-[9px] font-black uppercase tracking-widest text-red-500 hover:text-white transition"
              title="Lock Stream Connection"
            >
              Disconnect
            </button>
          </div>

          {/* Bottom Stream controls overlay */}
          <div className="relative z-20 p-6 bg-gradient-to-t from-black/90 to-transparent flex items-center justify-between gap-4">
            <div className="flex gap-2">
              <button 
                onClick={() => triggerPulseBurst('⚡')}
                className="px-5 py-3 bg-primary hover:bg-primary-dark text-white rounded-2xl text-[9px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 border border-white/10 transition-all flex items-center gap-1.5"
              >
                <Zap className="w-3.5 h-3.5 fill-current" /> Spark Pulse
              </button>
              <button 
                onClick={() => triggerPulseBurst('💎')}
                className="px-5 py-3 bg-accent hover:bg-accent/80 text-white rounded-2xl text-[9px] font-black uppercase tracking-widest border border-white/10 hover:scale-102 active:scale-98 transition-all flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" /> Diamond Pulse
              </button>
            </div>

            <span className="text-[9px] text-white/40 font-black tracking-widest uppercase">
              Live broadcast • HD 1080P
            </span>
          </div>
        </div>

        {/* Live Chat Panel */}
        <div className="lg:col-span-1 flex flex-col h-[340px] md:h-auto glass-card p-5 bg-white/2 border-white/5">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/5">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2">
              <MessageSquare className="w-4 h-4" /> Live Pulse Feed
            </p>
            <SlidersHorizontal className="w-4 h-4 text-white/40" />
          </div>

          {/* Messages list */}
          <div className="flex-1 space-y-4 overflow-y-auto pr-2 scrollbar-hide">
            {messages.map((chat, i) => (
              <div key={i} className="flex gap-2 items-start text-left">
                <div className={`shrink-0 w-1.5 h-4 rounded-full mt-1 ${
                  chat.type === 'master' ? 'bg-red-500' : 
                  chat.type === 'vip' ? 'bg-primary' : 
                  chat.type === 'host' ? 'bg-accent animate-pulse' : 
                  chat.type === 'system' ? 'bg-yellow-500' : 'bg-white/20'
                }`} />
                <div>
                  <p className={`text-[9px] font-black uppercase tracking-widest ${
                    chat.type === 'host' ? 'text-accent' : 
                    chat.type === 'system' ? 'text-yellow-500' : 'text-white/40'
                  }`}>
                    {chat.user}
                  </p>
                  <p className="text-[11px] font-medium text-white/80 leading-relaxed mt-0.5">
                    {chat.msg}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Form input */}
          <form onSubmit={handleSendMessage} className="mt-4 relative">
            <input 
              type="text" 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Broadcast a message..." 
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-[10px] font-bold outline-none focus:border-primary text-white"
            />
            <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-primary rounded-xl text-white shadow-lg">
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>

      {/* Poll and Tipping Rewards widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        
        {/* Interactive Poll widget */}
        <div className="glass-card p-6 bg-white/2 border border-white/5 text-left">
          <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-4">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/80">
              Interactive Session Poll
            </h4>
            <span className="text-[9px] font-black text-primary uppercase tracking-widest bg-primary/10 px-2.5 py-0.5 rounded border border-primary/20">
              Active Vote
            </span>
          </div>
          
          <p className="text-xs font-black uppercase tracking-wider text-white mb-3">
            {poll.question}
          </p>

          <div className="space-y-2">
            {poll.options.map(opt => {
              const hasVoted = !!poll.userVoted;
              const isUserChoice = poll.userVoted === opt.id;
              const percentage = totalVotes > 0 ? Math.round((opt.votes / totalVotes) * 100) : 0;

              return (
                <button
                  key={opt.id}
                  disabled={hasVoted}
                  onClick={() => handleVote(opt.id)}
                  className={`w-full p-3.5 rounded-2xl border text-left relative overflow-hidden transition-all duration-300 ${
                    isUserChoice 
                      ? 'border-primary bg-primary/5 shadow-md shadow-primary/5' 
                      : 'border-white/5 bg-white/2 hover:bg-white/5 hover:border-white/10'
                  } disabled:cursor-default`}
                >
                  {/* Fill progress bar */}
                  {hasVoted && (
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                      className="absolute inset-y-0 left-0 bg-primary/10 pointer-events-none"
                    />
                  )}

                  <div className="relative z-10 flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                    <span className="flex items-center gap-2 text-white/80">
                      {isUserChoice && <Check className="w-3.5 h-3.5 text-primary" />}
                      {opt.text}
                    </span>
                    {hasVoted && <span className="text-primary">{percentage}% ({opt.votes})</span>}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tips / Rewards widget */}
        <div className="glass-card p-6 bg-white/2 border border-white/5 text-left">
          <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-4">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/80">
              Interactive Tipping Rewards
            </h4>
            <Trophy className="w-4.5 h-4.5 text-yellow-500" />
          </div>

          <p className="text-[10px] text-white/40 uppercase font-black tracking-widest mb-4">
            Send premium tips to trigger special screen animations & highlight messages:
          </p>

          <div className="grid grid-cols-3 gap-3">
            {[
              { name: 'Espresso', cost: 10, emoji: '☕' },
              { name: 'Gold Spark', cost: 50, emoji: '✨' },
              { name: 'Mega Diamond', cost: 100, emoji: '💎' },
            ].map(tip => (
              <button
                key={tip.name}
                onClick={() => sendTip(tip.name, tip.cost, tip.emoji)}
                className="p-3.5 rounded-2xl bg-white/2 border border-white/5 hover:border-primary hover:bg-primary/5 transition-all text-center flex flex-col items-center justify-center group"
              >
                <span className="text-2xl mb-2 group-hover:scale-110 transition-transform">{tip.emoji}</span>
                <span className="text-[9px] font-black uppercase tracking-widest text-white/80 truncate w-full">
                  {tip.name}
                </span>
                <span className="text-[8px] font-black uppercase tracking-widest text-primary mt-1">
                  {tip.cost} pts
                </span>
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
