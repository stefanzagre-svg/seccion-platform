'use client';

import '@livekit/components-styles';
import {
  LiveKitRoom,
  VideoConference,
  RoomAudioRenderer,
  ControlBar,
} from '@livekit/components-react';
import { useEffect, useState, useRef, use } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Loader2, DollarSign, Clock, Zap, Video } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function LiveRoomPage({ params }: { params: Promise<{ roomId: string }> }) {
  const resolvedParams = use(params);
  const roomId = resolvedParams.roomId;
  const [token, setToken] = useState('');
  const [isCreator, setIsCreator] = useState(false);
  const [creatorId, setCreatorId] = useState<string>('');
  const [currentUserId, setCurrentUserId] = useState<string>('');
  
  // Timer State
  const [callDuration, setCallDuration] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [isExtending, setIsExtending] = useState(false);
  const [selectedExtDuration, setSelectedExtDuration] = useState<number>(5);
  const [creatorRate, setCreatorRate] = useState<number>(10);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();

  const isPrivateCall = roomId.startsWith('call_');
  const callRequestId = isPrivateCall ? roomId.replace('call_', '') : null;

  useEffect(() => {
    async function setupRoom() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push('/login');
          return;
        }

        const { data: profile } = await supabase.from('profiles').select('id, role, display_name, username, privacy_settings').eq('id', user.id).single();
        
        const isUserCreator = profile?.role === 'creator';
        setIsCreator(isUserCreator);
        setCurrentUserId(profile?.id);

        if (isPrivateCall && callRequestId) {
          // Fetch call request details
          const { data: callReq } = await supabase.from('call_requests').select('*').eq('id', callRequestId).single();
          if (callReq) {
            setCallDuration(callReq.duration_minutes * 60); // in seconds
            setTimeLeft(callReq.duration_minutes * 60);
            
            // Get creator's rate for extension
            const targetCreatorId = isUserCreator ? profile.id : callReq.creator_id;
            setCreatorId(targetCreatorId);
            
            if (!isUserCreator) {
              const { data: creatorProf } = await supabase.from('profiles').select('privacy_settings').eq('id', targetCreatorId).single();
              if (creatorProf) {
                 setCreatorRate(creatorProf.privacy_settings?.private_call_rate || 10);
              }
            }
          }
        }

        const resp = await fetch('/api/livekit/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            roomName: roomId,
            participantName: profile?.display_name || profile?.username || 'Anonymous',
            isCreator: true // In private calls, both can publish.
          })
        });
        const data = await resp.json();
        if (data.token) {
          setToken(data.token);
        } else {
          console.error(data.error);
        }
      } catch (e) {
        console.error(e);
      }
    }
    setupRoom();
  }, [roomId, router, isPrivateCall, callRequestId]);

  useEffect(() => {
    if (!isPrivateCall || !callRequestId) return;
    const supabase = createClient();
    
    // Subscribe to duration extensions
    const channel = supabase.channel(`call_${callRequestId}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'call_requests', filter: `id=eq.${callRequestId}` }, (payload) => {
         const newDurMinutes = payload.new.duration_minutes;
         setCallDuration(prev => {
            if (!prev) return newDurMinutes * 60;
            const diff = (newDurMinutes * 60) - prev;
            if (diff > 0) {
               setTimeLeft(t => (t !== null ? t + diff : null));
               setIsExtending(false);
            }
            return newDurMinutes * 60;
         });
      })
      .subscribe();
      
    return () => { supabase.removeChannel(channel); };
  }, [isPrivateCall, callRequestId]);

  useEffect(() => {
    if (token && timeLeft !== null && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => (prev !== null && prev > 0 ? prev - 1 : 0));
      }, 1000);
    } else if (timeLeft === 0 && timerRef.current) {
      clearInterval(timerRef.current);
      // Automatically disconnect or just warn
      alert('Time is up!');
      router.push('/profile/member');
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [token, timeLeft, router]);

  if (token === '') {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  const calculatePrice = (duration: number) => {
    let price = creatorRate * duration;
    if (duration === 15) price = price * 0.85; // 15% discount
    if (duration === 30) price = price * 0.80; // 20% discount
    return Math.round(price * 100) / 100;
  };

  const handlePayToExtend = async () => {
    try {
      const amount = calculatePrice(selectedExtDuration);
      const resp = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscriberId: currentUserId,
          creatorId: creatorId,
          price: amount,
          type: 'private_call',
          callId: roomId.replace('call_', ''),
          duration: selectedExtDuration
        })
      });
      const data = await resp.json();
      if (data.url) {
        window.open(data.url, '_blank');
      } else {
        alert('Failed to generate extension link');
      }
    } catch (err) {
      console.error(err);
      alert('Error during checkout');
    }
  };

  const handleTip = () => {
    alert('Thank you for the tip! Segpay integration goes here.');
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="min-h-screen p-6 pt-24 max-w-7xl mx-auto flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-wider text-white flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></span>
            Live Room
          </h1>
          <p className="text-white/50 text-sm mt-1">Real-time low latency broadcast</p>
        </div>
        
        <div className="flex gap-4 items-center">
           {timeLeft !== null && (
             <div className={`px-4 py-2 rounded-xl border flex items-center gap-2 font-bold font-mono text-xl ${timeLeft <= 120 ? 'bg-red-500/20 text-red-500 border-red-500/50 animate-pulse' : 'bg-white/5 border-white/10 text-white'}`}>
               <Clock className="w-5 h-5" /> {formatTime(timeLeft)}
             </div>
           )}

          {!isCreator && (
            <button 
              onClick={handleTip}
              className="px-6 py-2 bg-green-500 hover:bg-green-400 text-black font-black uppercase text-sm rounded-xl transition flex items-center gap-2"
            >
              <DollarSign className="w-4 h-4" /> Tip Creator
            </button>
          )}
        </div>
      </div>
      
      {/* Extension Modal */}
      {!isCreator && timeLeft !== null && timeLeft <= 120 && (
         <div className="bg-black/60 border border-red-500/50 rounded-2xl p-4 mb-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-[0_0_20px_rgba(239,68,68,0.3)]">
            <div>
               <h3 className="font-bold text-red-400 text-lg flex items-center gap-2"><Clock className="w-5 h-5" /> Time is almost up!</h3>
               <p className="text-white/70 text-sm">Extend the call to keep talking. Choose duration below:</p>
            </div>
            
            <div className="flex items-center gap-4 w-full md:w-auto">
               <div className="flex bg-white/5 rounded-lg overflow-hidden border border-white/10">
                 {[5, 15, 30].map(dur => (
                    <button
                      key={dur}
                      onClick={() => setSelectedExtDuration(dur)}
                      className={`px-4 py-2 text-sm font-bold transition ${selectedExtDuration === dur ? 'bg-primary text-black' : 'hover:bg-white/10 text-white'}`}
                    >
                      {dur}m
                    </button>
                 ))}
               </div>
               
               <button 
                  onClick={handlePayToExtend}
                  className="px-6 py-2 bg-green-500 hover:bg-green-400 text-black font-black uppercase text-sm rounded-xl transition flex items-center gap-2 whitespace-nowrap"
               >
                  <Zap className="w-4 h-4" /> Pay ${calculatePrice(selectedExtDuration)}
               </button>
            </div>
         </div>
      )}

      <div className="flex-grow bg-black/40 border border-white/10 rounded-3xl overflow-hidden relative" style={{ height: '70vh' }}>
        <LiveKitRoom
          video={true} // In private calls both can enable video
          audio={true}
          token={token}
          serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL || 'wss://seccion-ai-4uvztrpu.livekit.cloud'}
          data-lk-theme="default"
          style={{ height: '100%' }}
        >
          {/* Main video/audio area */}
          <VideoConference />
          <RoomAudioRenderer />
          
          {/* Controls for publisher */}
          {isCreator && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
              <ControlBar />
            </div>
          )}
        </LiveKitRoom>
      </div>
    </div>
  );
}
