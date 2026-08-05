'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Loader2, Video, Calendar, Phone, Check, X, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function LiveManager() {
  const [requests, setRequests] = useState<any[]>([]);
  const [streams, setStreams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchLiveEvents();
  }, []);

  async function fetchLiveEvents() {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [callsRes, streamsRes] = await Promise.all([
        supabase.from('call_requests').select(`*, member:profiles!call_requests_member_id_fkey(username, display_name)`).eq('creator_id', user.id).order('created_at', { ascending: false }),
        supabase.from('scheduled_streams').select('*').eq('creator_id', user.id).order('scheduled_for', { ascending: true })
      ]);

      setRequests(callsRes.data || []);
      setStreams(streamsRes.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function updateCallRequest(id: string, status: string) {
    try {
      const supabase = createClient();
      await supabase.from('call_requests').update({ status }).eq('id', id);
      fetchLiveEvents();
    } catch (err) {
      console.error(err);
    }
  }

  async function handleScheduleStream() {
    const title = prompt('Enter Stream Title:');
    if (!title) return;
    
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      const scheduledFor = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // Default tomorrow
      await supabase.from('scheduled_streams').insert({
        creator_id: user.id,
        title,
        scheduled_for: scheduledFor
      });
      fetchLiveEvents();
      
      alert(`Stream scheduled! The AI Wingman will notify your followers.`);
    } catch (err) {
      console.error(err);
    }
  }

  const goLive = (roomId: string) => {
    router.push(`/live/${roomId}`);
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>;

  return (
    <div className="space-y-8">
      {/* Streams Section */}
      <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
        <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
          <h2 className="text-xl font-bold flex items-center gap-2"><Video className="w-5 h-5 text-primary" /> Livestreams</h2>
          <button onClick={handleScheduleStream} className="px-4 py-2 bg-primary/20 text-primary border border-primary/50 rounded-lg text-xs font-bold uppercase hover:bg-primary/40 transition">
            <Calendar className="w-4 h-4 inline-block mr-2" /> Schedule Stream
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div onClick={() => goLive('instant_' + Date.now())} className="cursor-pointer border border-dashed border-primary/50 bg-primary/10 rounded-2xl p-6 flex flex-col items-center justify-center text-primary hover:bg-primary/20 transition">
            <Video className="w-10 h-10 mb-2 opacity-80" />
            <span className="font-bold uppercase tracking-widest text-sm">Go Live Now</span>
          </div>

          {streams.map(stream => (
            <div key={stream.id} className="bg-black/40 border border-white/10 rounded-2xl p-4 flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-white mb-1">{stream.title}</h3>
                <p className="text-xs text-white/50">{new Date(stream.scheduled_for).toLocaleString()}</p>
              </div>
              <button onClick={() => goLive(`live_${stream.id}`)} className="mt-4 w-full py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-bold uppercase transition">
                Start Broadcast
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Private Calls Section */}
      <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
        <h2 className="text-xl font-bold flex items-center gap-2 mb-6 border-b border-white/10 pb-4"><Phone className="w-5 h-5 text-[#00fbfb]" /> Call Requests</h2>
        
        {requests.length === 0 ? (
          <p className="text-white/40 text-center text-sm py-10">No pending private call requests.</p>
        ) : (
          <div className="space-y-3">
            {requests.map(req => (
              <div key={req.id} className="bg-black/40 border border-white/10 p-4 rounded-xl flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                  <p className="font-bold text-white">{req.member?.display_name || req.member?.username}</p>
                  <p className="text-xs text-white/50">{new Date(req.proposed_time).toLocaleString()} • ${req.fee_amount} ({req.duration_minutes} min)</p>
                  <p className="text-[10px] uppercase tracking-widest mt-1">
                    Status: <span className={req.status === 'pending' ? 'text-yellow-400' : req.status === 'paid' ? 'text-green-400' : req.status === 'awaiting_payment' ? 'text-blue-400' : 'text-red-400'}>{req.status.replace('_', ' ')}</span>
                  </p>
                </div>
                
                <div className="flex gap-2">
                  {req.status === 'pending' && (
                    <>
                      <button onClick={() => updateCallRequest(req.id, 'awaiting_payment')} className="px-3 py-2 bg-green-500/20 text-green-400 border border-green-500/50 rounded-lg text-xs font-bold hover:bg-green-500/40 transition">
                        <Check className="w-4 h-4 inline-block" /> Approve (Wait for Payment)
                      </button>
                      <button onClick={() => updateCallRequest(req.id, 'postponed')} className="px-3 py-2 bg-yellow-500/20 text-yellow-400 border border-yellow-500/50 rounded-lg text-xs font-bold hover:bg-yellow-500/40 transition">
                        <Clock className="w-4 h-4 inline-block" /> Postpone
                      </button>
                      <button onClick={() => updateCallRequest(req.id, 'denied')} className="px-3 py-2 bg-red-500/20 text-red-400 border border-red-500/50 rounded-lg text-xs font-bold hover:bg-red-500/40 transition">
                        <X className="w-4 h-4 inline-block" /> Deny
                      </button>
                    </>
                  )}
                  {req.status === 'awaiting_payment' && (
                    <span className="text-xs text-blue-400 font-bold uppercase tracking-wider py-2">Waiting for member to pay...</span>
                  )}
                  {req.status === 'paid' && (
                    <button onClick={() => goLive(`call_${req.id}`)} className="px-4 py-2 bg-primary text-black rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-white transition">
                      Join Room
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
