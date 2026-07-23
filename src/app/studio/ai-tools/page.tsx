'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { 
  Zap, 
  MessageSquare, 
  Scale, 
  TrendingUp, 
  BarChart, 
  Mic, 
  Lock, 
  CheckCircle,
  Gift,
  ArrowRight,
  LayoutGrid,
  Video,
  ListOrdered,
  Users,
  Crown,
  BarChart3,
  Settings,
  Shield
} from 'lucide-react';
import Link from 'next/link';

export default function AIToolsHub() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTool, setActiveTool] = useState<string | null>(null);

  const renderDashboardBar = () => {
    const tabs = [
      { id: 'content', icon: LayoutGrid, label: 'Content' },
      { id: 'live', icon: Video, label: 'Stream Station' },
      { id: 'orders', icon: ListOrdered, label: 'Custom Requests' },
      { id: 'consent_inbox', icon: Users, label: 'Consent Box' },
      { id: 'goals', icon: Crown, label: 'Goals' },
      { id: 'analytics', icon: BarChart3, label: 'Vibe Insights' },
      { id: 'settings', icon: Settings, label: 'Profile Settings' },
      { id: 'safety_ops', icon: Shield, label: 'Safety Patrol' },
      { id: 'ai_tools', icon: Zap, label: 'AI Tools' },
    ];

    return (
      <div className="flex items-center gap-2 bg-white/5 p-1.5 rounded-2xl border border-white/5 w-fit mb-8 max-w-full overflow-x-auto scrollbar-hide shrink-0">
        {tabs.map((tab) => {
          const isActive = tab.id === 'ai_tools';
          return (
            <button
              key={tab.id}
              onClick={() => {
                if (tab.id === 'ai_tools') {
                  setActiveTool(null);
                } else {
                  router.push(`/studio?activeTab=${tab.id}`);
                }
              }}
              className={`flex items-center gap-3 px-6 py-3 rounded-xl transition-all duration-300 ${
                isActive 
                  ? 'bg-white/10 text-white shadow-xl' 
                  : 'text-white/40 hover:text-white/60 hover:bg-white/[0.02]'
              }`}
            >
              <tab.icon className={`w-4 h-4 ${isActive ? 'text-primary' : ''}`} />
              <span className="text-[10px] font-black uppercase tracking-widest">{tab.label}</span>
            </button>
          );
        })}
      </div>
    );
  };

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      setProfile(data);
      setIsLoading(false);
    }
    loadProfile();
  }, []);

  const hasUltimatePack = profile?.creator_ultimate_pack && 
    profile?.creator_ultimate_pack_expires_at && 
    new Date(profile.creator_ultimate_pack_expires_at) > new Date();
    
  const hasPromo = profile?.promo_status === 'approved' && 
    profile?.creator_ultimate_pack_expires_at && 
    new Date(profile.creator_ultimate_pack_expires_at) > new Date();

  const isUnlocked = hasUltimatePack || hasPromo;

  const handleSubscribe = async () => {
    try {
      const res = await fetch('/api/billing/ultimate-pack', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to subscribe');
      alert('Subscription successful! You now have the Ultimate Pack.');
      window.location.reload();
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-transparent pt-24 px-4 flex items-center justify-center text-white">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // --- LOCKED PITCH SCREEN ---
  if (!isUnlocked) {
    return (
      <div className="min-h-screen bg-transparent text-white pt-16 pb-24 md:pb-0 relative overflow-hidden">
        {/* Neon accent meshes */}
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#ffabf3]/10 blur-[150px] rounded-full pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-500/5 blur-[150px] rounded-full pointer-events-none animate-pulse" />

        <div className="max-w-7xl mx-auto px-6 md:px-12 pt-12 pb-8 space-y-12 relative z-10 flex flex-col items-center">
          {renderDashboardBar()}
          <div className="inline-flex items-center justify-center p-4 bg-gradient-to-r from-[#ffabf3]/15 to-purple-500/15 rounded-full mb-6 border border-[#ffabf3]/30 shadow-[0_0_50px_rgba(255,171,243,0.2)]">
            <Zap className="w-12 h-12 text-[#ffabf3] animate-pulse" />
          </div>
          <h1 className="text-4xl md:text-6xl font-black mb-4 uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-[#ffabf3]">Creator Ultimate Pack</h1>
          <p className="text-lg text-white/70 mb-8 max-w-2xl mx-auto">
            Supercharge your workflow with our exclusive suite of AI tools. Automate, analyze, and dominate.
          </p>

          <div className="grid md:grid-cols-2 gap-6 text-left mb-12">
            {[
              { icon: MessageSquare, title: 'Auto-Generated Messaging', desc: 'AI drafts hyper-personalized DMs to your top members to drive PPV sales.' },
              { icon: Scale, title: 'Legal Copilot', desc: 'Instant DMCA takedown drafts, contract reviews, and compliance checks.' },
              { icon: TrendingUp, title: 'Options Ops', desc: 'Predictive pricing analytics to maximize your subscription revenue.' },
              { icon: BarChart, title: 'Content Strategy', desc: 'Data-driven analysis of your feed to suggest what you should post next.' },
              { icon: Mic, title: 'Speech-to-Speech Live Translation', desc: 'Real-time voice cloning in 14 languages for international voice notes.' }
            ].map((tool, i) => (
              <div key={i} className="glass-card p-6 rounded-2xl flex gap-4 border border-white/5 hover:border-[#ffabf3]/25 transition duration-500 hover:scale-[1.01] hover:bg-white/[0.03]">
                <div className="mt-1">
                  <tool.icon className="w-6 h-6 text-[#ffabf3]" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">{tool.title}</h3>
                  <p className="text-sm text-white/50 mt-1 leading-relaxed">{tool.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="glass-card p-8 rounded-3xl border border-[#ffabf3]/30 max-w-lg mx-auto relative overflow-hidden shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)]">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#ffabf3] to-transparent" />
            <h2 className="text-3xl font-black mb-2">€69<span className="text-xl text-white/50">/month</span></h2>
            <p className="text-sm text-white/60 mb-6 font-bold uppercase tracking-widest">Cancel anytime</p>
            
            <button 
              onClick={handleSubscribe}
              className="w-full py-4 bg-gradient-to-r from-[#ffabf3] via-[#ffc6f6] to-[#ffabf3] bg-[length:200%_auto] text-black font-black uppercase tracking-widest rounded-xl hover:shadow-[0_0_30px_rgba(255,171,243,0.5)] transition duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-95"
            >
              Unlock Ultimate Pack
            </button>

            <div className="mt-4 text-xs text-white/40">
              *If you have a 1-Year Free Promo code, please enter it in your billing settings.
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- UNLOCKED DASHBOARD ---
  return (
    <div className="min-h-screen bg-transparent text-white pt-16 pb-24 md:pb-0 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#ffabf3]/10 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-6 md:px-12 pt-12 pb-8 space-y-12 relative z-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-12">
          <div>
            <h1 className="text-3xl md:text-5xl font-black mb-2 uppercase tracking-tighter flex items-center gap-3">
              AI Tools Hub
              {hasPromo && (
                <span className="flex items-center gap-1 text-[10px] bg-yellow-500/20 text-yellow-500 px-3 py-1 rounded-full border border-yellow-500/30 tracking-widest">
                  <Gift className="w-3 h-3" /> PROMO ACTIVE
                </span>
              )}
            </h1>
            <p className="text-muted-foreground font-bold tracking-widest uppercase text-xs">
              Creator Ultimate Pack • Active
            </p>
          </div>
        </div>

        {renderDashboardBar()}

        {activeTool ? (
          <div className="glass-card p-6 md:p-10 rounded-3xl relative">
            <button 
              onClick={() => setActiveTool(null)}
              className="absolute top-6 right-6 text-white/50 hover:text-white text-xs font-bold uppercase tracking-widest"
            >
              Close Tool
            </button>

            {activeTool === 'messaging' && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-8 text-[#ffabf3]">
                  <MessageSquare className="w-8 h-8" />
                  <h2 className="text-2xl font-black uppercase">Auto-Messaging</h2>
                </div>
                <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                  <p className="text-sm text-white/70 mb-4">Select an audience segment to generate personalized PPV pitches.</p>
                  <select className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white mb-4 outline-none focus:border-[#ffabf3]">
                    <option>Top 10% Spenders</option>
                    <option>Users online now</option>
                    <option>Expiring subscribers</option>
                  </select>
                  <button className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-lg font-bold text-sm transition">Generate Drafts</button>
                </div>
              </div>
            )}

            {activeTool === 'legal' && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-8 text-[#00ffff]">
                  <Scale className="w-8 h-8" />
                  <h2 className="text-2xl font-black uppercase">Legal Copilot</h2>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <button className="p-6 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-left transition">
                    <h3 className="font-bold mb-2">Draft DMCA Takedown</h3>
                    <p className="text-xs text-white/50">Generate a formal legal notice for stolen content.</p>
                  </button>
                  <button className="p-6 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-left transition">
                    <h3 className="font-bold mb-2">Review Agency Contract</h3>
                    <p className="text-xs text-white/50">Upload a PDF for AI risk analysis.</p>
                  </button>
                </div>
              </div>
            )}

            {activeTool === 'options' && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-8 text-green-400">
                  <TrendingUp className="w-8 h-8" />
                  <h2 className="text-2xl font-black uppercase">Options Ops</h2>
                </div>
                <div className="p-6 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center min-h-[200px]">
                  <p className="text-white/50 text-sm">Analyzing current subscription tier elasticity...</p>
                </div>
              </div>
            )}

            {activeTool === 'content' && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-8 text-[#ffd700]">
                  <BarChart className="w-8 h-8" />
                  <h2 className="text-2xl font-black uppercase">Content Strategy</h2>
                </div>
                <div className="space-y-4">
                  <div className="p-4 bg-white/5 rounded-lg border-l-4 border-[#ffd700]">
                    <p className="font-bold text-sm">💡 Suggestion: Post more 15s vertically shot teasers.</p>
                    <p className="text-xs text-white/50 mt-1">Your recent short-form teasers converted 34% better to PPV unlocks than photo sets.</p>
                  </div>
                  <div className="p-4 bg-white/5 rounded-lg border-l-4 border-red-500">
                    <p className="font-bold text-sm">⚠️ Warning: Subscription fatigue detected.</p>
                    <p className="text-xs text-white/50 mt-1">Avoid running another promo this week; wait until the 1st of the month.</p>
                  </div>
                </div>
              </div>
            )}

          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ToolCard 
              icon={MessageSquare} 
              title="Auto-Messaging" 
              color="text-[#ffabf3]"
              glowClass="from-[#ffabf3]/10 to-transparent"
              desc="Draft mass PPV messages instantly."
              onClick={() => setActiveTool('messaging')}
            />
            <ToolCard 
              icon={Scale} 
              title="Legal Copilot" 
              color="text-[#00ffff]"
              glowClass="from-[#00ffff]/10 to-transparent"
              desc="DMCA takedowns and contract analysis."
              onClick={() => setActiveTool('legal')}
            />
            <ToolCard 
              icon={TrendingUp} 
              title="Options Ops" 
              color="text-green-400"
              glowClass="from-green-500/10 to-transparent"
              desc="Pricing prediction models."
              onClick={() => setActiveTool('options')}
            />
            <ToolCard 
              icon={BarChart} 
              title="Content Strategy" 
              color="text-[#ffd700]"
              glowClass="from-[#ffd700]/10 to-transparent"
              desc="Data-backed posting advice."
              onClick={() => setActiveTool('content')}
            />
            <Link href="/messages" className="block group">
              <div className="glass-card p-6 rounded-2xl border border-white/5 hover:border-white/20 transition h-full flex flex-col cursor-pointer relative overflow-hidden text-left hover:scale-[1.02] active:scale-[0.98]">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition" />
                <Mic className="w-8 h-8 text-purple-400 mb-4" />
                <h3 className="font-bold text-lg mb-2">Live Translation</h3>
                <p className="text-sm text-white/50 mb-4 flex-grow">Access real-time voice cloning and speech-to-speech translation inside your DMs.</p>
                <div className="flex justify-end">
                  <ArrowRight className="w-5 h-5 text-white/30 group-hover:text-white transition" />
                </div>
              </div>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

function ToolCard({ icon: Icon, title, desc, color, glowClass, onClick }: any) {
  return (
    <div 
      onClick={onClick}
      className="glass-card p-6 rounded-2xl border border-white/5 hover:border-white/20 transition-all duration-500 hover:scale-[1.02] active:scale-[0.98] h-full flex flex-col cursor-pointer group relative overflow-hidden text-left"
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${glowClass} opacity-0 group-hover:opacity-100 transition duration-500`} />
      <Icon className={`w-8 h-8 ${color} mb-4 relative z-10`} />
      <h3 className="font-bold text-lg mb-2 relative z-10">{title}</h3>
      <p className="text-sm text-white/50 mb-4 flex-grow relative z-10 leading-relaxed">{desc}</p>
      <div className="flex justify-end relative z-10">
        <ArrowRight className="w-5 h-5 text-white/30 group-hover:text-white transition" />
      </div>
    </div>
  );
}
